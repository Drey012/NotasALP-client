"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw, Sparkles } from "lucide-react";
import { evaluateNotes, listProfessors, type EvaluationResult, type Professor } from "@/lib/api";

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const handleChange = (nextValue: string) => {
    if (nextValue === "" || (Number(nextValue) >= 0 && Number(nextValue) <= 10)) onChange(nextValue);
  };

  return <label className="field"><span>{label}</span><input inputMode="decimal" type="number" min="0" max="10" step="0.1" value={value} onChange={(event) => handleChange(event.target.value)} placeholder="0,0" /></label>;
}

function statusTone(status: string) {
  if (status.includes("APROVADO")) return "approved";
  if (status.includes("REPROVADO")) return "failed";
  return "attention";
}

export default function Home() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [professorIndex, setProfessorIndex] = useState(0);
  const [grades, setGrades] = useState<string[]>([]);
  const [p3, setP3] = useState("");
  const [exam, setExam] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [professorsLoading, setProfessorsLoading] = useState(true);
  const [error, setError] = useState("");
  const professor = professors.find((item) => item.indice === professorIndex);

  useEffect(() => {
    listProfessors().then((items) => {
      setProfessors(items);
      setProfessorIndex(items[0]?.indice ?? 0);
      setGrades(items[0]?.rotulosNotasIniciais.map(() => "") ?? []);
    }).catch(() => setError("Não foi possível carregar os dados dos professores. Verifique a conexão com a API."))
      .finally(() => setProfessorsLoading(false));
  }, []);

  const canEvaluate = useMemo(() => grades.length > 0 && grades.every((grade) => grade !== "" && Number(grade) >= 0 && Number(grade) <= 10), [grades]);
  const updateGrade = (index: number, value: string) => setGrades((current) => current.map((grade, itemIndex) => itemIndex === index ? value : grade));
  const changeProfessor = (value: number) => {
    const nextProfessor = professors.find((item) => item.indice === value);
    setProfessorIndex(value);
    setGrades(nextProfessor?.rotulosNotasIniciais.map(() => "") ?? []);
    setP3(""); setExam(""); setResult(null); setError("");
  };
  const submit = async () => {
    if (!canEvaluate) { setError("Preencha as notas entre 0 e 10."); return; }
    setLoading(true); setError("");
    try {
      setResult(await evaluateNotes({ indiceProfessor: professorIndex, notasIniciais: grades.map(Number), p3: p3 ? Number(p3) : undefined, exame: exam ? Number(exam) : undefined }));
    } catch (caughtError) { setError(caughtError instanceof Error ? caughtError.message : "Não foi possível avaliar. Verifique a conexão com a API."); }
    finally { setLoading(false); }
  };
  const reset = () => { setGrades(professor?.rotulosNotasIniciais.map(() => "") ?? []); setP3(""); setExam(""); setResult(null); setError(""); };

  return <main className="minimal-shell">
    <header className="header"><a className="brand" href="/"><span className="brand-mark" /><span><strong>Notas ALP</strong><small>calculadora acadêmica</small></span></a><div className="header-status"><i className={`status-dot ${professorsLoading ? "is-loading" : error ? "has-error" : ""}`} /> {professorsLoading ? "Aguardando dados" : error ? "API indisponível" : "API Spring Boot"}</div></header>
    <section className="intro"><div><span className="eyebrow">cálculo de notas</span><h1>Saiba onde você está.</h1></div><p>Preencha. Avalie. Siga.</p></section>
    <section className="stats"><div><strong>{professorsLoading ? "..." : professors.length || "—"}</strong><span>{professorsLoading ? "aguardando professores" : "professores"}</span></div><div><strong>06,0</strong><span>média mínima</span></div><div><strong>REST</strong><span>API oficial</span></div></section>
    <section className="workspace"><div className="calculator-card"><div className="card-top"><div><span className="eyebrow">01 · notas</span><h2>Seu semestre</h2></div><select value={professorIndex} onChange={(event) => changeProfessor(Number(event.target.value))} disabled={!professors.length}>{professors.length ? professors.map((item) => <option key={item.indice} value={item.indice}>{item.nomeProfessor} · {item.nomeMateria}</option>) : <option>{professorsLoading ? "Aguardando professores..." : "Nenhum professor disponível"}</option>}</select></div><p className="course-name">{professor?.nomeMateria ?? (professorsLoading ? "Aguardando dados de professores..." : "Dados de disciplinas indisponíveis")}</p>{professor ? <div className="fields">{professor.rotulosNotasIniciais.map((label, index) => <NumberField key={`${label}-${index}`} label={label} value={grades[index] ?? ""} onChange={(value) => updateGrade(index, value)} />)}</div> : <div className="data-state"><strong>{professorsLoading ? "Aguardando dados de professores" : "Nenhum professor foi carregado"}</strong><span>{professorsLoading ? "Os campos serão liberados assim que a API responder." : "Não é possível calcular a média sem uma disciplina disponível."}</span></div>}{result?.precisaP3 && <div className="extra-fields"><NumberField label="P3" value={p3} onChange={setP3} /></div>}{result?.precisaExame && <div className="extra-fields"><NumberField label="Exame final" value={exam} onChange={setExam} /></div>}{error && <p className="error">{error}</p>}<div className="actions"><button className="primary-button" onClick={submit} disabled={loading || !professor}>{loading ? "Avaliando..." : "Calcular média"} <Check size={16} /></button><button className="reset-button" onClick={reset} aria-label="Limpar notas"><RotateCcw size={15} /></button></div></div>
      <aside className={`result-card ${result ? statusTone(result.status) : "empty"}`}><div className="result-label"><Sparkles size={14} /> resultado</div>{result ? <><strong className="result-value">{Number(result.notaAtual).toFixed(2).replace(".", ",")}</strong><span className="result-status">{result.status}</span>{result.precisaP3 && <p>Informe a P3 para continuar.</p>}{result.precisaExame && <p>Informe o exame final para concluir.</p>}{typeof result.notaNecessariaProximaProva === "number" && <p className={`next-grade ${result.notaNecessariaProximaProva > 10 ? "unreachable" : ""}`}>{result.notaNecessariaProximaProva > 10 ? "A próxima prova não é suficiente:" : "Próxima avaliação:"} <strong>{Number(result.notaNecessariaProximaProva).toFixed(2).replace(".", ",")}</strong></p>}</> : <><strong className="result-placeholder">—</strong><span className="result-status">{professorsLoading ? "Aguardando professores" : error || !professors.length ? "Dados de professores indisponíveis" : "Aguardando notas"}</span><p>{professorsLoading ? "O resultado aparecerá quando os dados chegarem." : error || !professors.length ? "Não há dados suficientes para calcular." : "Sua média aparece aqui."}</p></>}</aside></section>
    <footer><span>Notas ALP</span><span>{professorsLoading ? "Aguardando dados da API…" : professors.length ? `${professors.length} opções disponíveis` : "Nenhum dado recebido"}</span></footer>
  </main>;
}
