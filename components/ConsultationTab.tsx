"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, RotateCcw, Search, Sparkles } from "lucide-react";
import {
  evaluateNotes,
  listAtribuicoes,
  listProfessors,
  type Atribuicao,
  type EvaluationResult,
  type Professor,
} from "@/lib/api";
import { Feedback, NumberField } from "@/components/ui";

type ConsultationTabProps = { onCountChange: (count: number) => void };

export function ConsultationTab({ onCountChange }: ConsultationTabProps) {
  const [view, setView] = useState<"calculator" | "catalog">("calculator");
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [assignments, setAssignments] = useState<Atribuicao[]>([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [grades, setGrades] = useState<string[]>([]);
  const [p3, setP3] = useState("");
  const [exam, setExam] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const professor = useMemo(
    () => professors.find((item) => String(item.indice) === selectedIndex),
    [professors, selectedIndex],
  );

  useEffect(() => {
    Promise.all([listProfessors(), listAtribuicoes()])
      .then(([professorData, assignmentData]) => {
        setProfessors(professorData);
        setAssignments(assignmentData);
        onCountChange(professorData.length);
        if (professorData[0]) {
          setSelectedIndex(String(professorData[0].indice));
          setGrades(professorData[0].rotulosNotasIniciais.map(() => ""));
        }
      })
      .catch((caught) =>
        setError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível carregar as consultas.",
        ),
      )
      .finally(() => setLoading(false));
  }, [onCountChange]);

  const selectProfessor = (value: string) => {
    const next = professors.find((item) => String(item.indice) === value);
    setSelectedIndex(value);
    setGrades(next?.rotulosNotasIniciais.map(() => "") ?? []);
    setResult(null);
    setP3("");
    setExam("");
    setError("");
  };

  const reset = () => {
    setGrades(professor?.rotulosNotasIniciais.map(() => "") ?? []);
    setP3("");
    setExam("");
    setResult(null);
    setError("");
  };

  const submit = async () => {
    if (!professor || grades.some((grade) => grade.trim() === "")) {
      setError("Preencha todas as notas iniciais antes de consultar.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      setResult(
        await evaluateNotes({
          indiceProfessor: professor.indice,
          notasIniciais: grades.map(Number),
          p3: p3 === "" ? undefined : Number(p3),
          exame: exam === "" ? undefined : Number(exam),
        }),
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível avaliar as notas.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="workspace">
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">01 · consulta</span>
          <h2>
            Leia seus dados <em>com clareza.</em>
          </h2>
        </div>
        <p>
          Consulte o catálogo acadêmico ou envie suas notas para a avaliação
          oficial da API.
        </p>
      </div>
      <div className="subtabs">
        <button
          className={view === "calculator" ? "active" : ""}
          onClick={() => setView("calculator")}
        >
          Avaliar notas <ArrowRight size={15} />
        </button>
        <button
          className={view === "catalog" ? "active" : ""}
          onClick={() => setView("catalog")}
        >
          Atribuições disponíveis <span>{assignments.length || "—"}</span>
        </button>
      </div>
      {view === "calculator" ? (
        <div className="calculator-grid">
          <div className="panel form-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Avaliação acadêmica</span>
                <h3>Seu semestre</h3>
                <p>
                  {professor
                    ? `${professor.nomeProfessor} · ${professor.nomeMateria}`
                    : "Selecione uma atribuição"}
                </p>
              </div>
              <select
                className="select"
                value={selectedIndex}
                onChange={(event) => selectProfessor(event.target.value)}
                disabled={loading || !professors.length}
              >
                <option value="">Selecione...</option>
                {professors.map((item) => (
                  <option key={item.indice} value={item.indice}>
                    {item.nomeProfessor} · {item.nomeMateria}
                  </option>
                ))}
              </select>
            </div>
            {loading ? (
              <div className="empty-state">Carregando atribuições...</div>
            ) : professor ? (
              <>
                <div className="fields">
                  {professor.rotulosNotasIniciais.map((label, index) => (
                    <NumberField
                      key={`${label}-${index}`}
                      label={label}
                      value={grades[index] ?? ""}
                      onChange={(value) =>
                        setGrades((current) =>
                          current.map((item, position) =>
                            position === index ? value : item,
                          ),
                        )
                      }
                    />
                  ))}
                </div>
                {result?.precisaP3 && (
                  <div className="fields">
                    <NumberField label="P3" value={p3} onChange={setP3} />
                  </div>
                )}
                {result?.precisaExame && (
                  <div className="fields">
                    <NumberField
                      label="Exame final"
                      value={exam}
                      onChange={setExam}
                    />
                  </div>
                )}
                <p className="helper">
                  A API decide quando P3 ou exame são necessários.
                </p>
                <div className="actions">
                  <button
                    className="button"
                    onClick={submit}
                    disabled={submitting}
                  >
                    {submitting ? "Avaliando..." : "Consultar situação"}{" "}
                    <Check size={16} />
                  </button>
                  <button
                    className="icon-button"
                    onClick={reset}
                    aria-label="Limpar formulário"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                Nenhuma atribuição foi retornada pela API.
              </div>
            )}
            {error && <Feedback kind="error">{error}</Feedback>}
          </div>
          <ResultCard result={result} />
        </div>
      ) : (
        <Catalog assignments={assignments} />
      )}
    </section>
  );
}

function ResultCard({ result }: { result: EvaluationResult | null }) {
  return (
    <aside className={`panel result-card ${result ? "has-result" : ""}`}>
      <div className="result-label">
        <Sparkles size={15} /> leitura do resultado
      </div>
      {result ? (
        <>
          <strong className="result-value">
            {result.notaAtual.toFixed(2).replace(".", ",")}
          </strong>
          <span className="result-status">{result.status}</span>
          <p>
            {result.precisaP3
              ? "Informe a P3 para continuar."
              : result.precisaExame
                ? "Informe o exame final para concluir."
                : "A API concluiu esta etapa da avaliação."}
          </p>
          {typeof result.notaNecessariaProximaProva === "number" && (
            <div className="next-grade">
              Nota necessária em {result.proximaProvaLabel ?? "próxima prova"}:{" "}
              <strong>
                {result.notaNecessariaProximaProva.toFixed(2).replace(".", ",")}
              </strong>
            </div>
          )}
        </>
      ) : (
        <>
          <strong className="result-placeholder">—</strong>
          <span className="result-status">Aguardando consulta</span>
          <p>
            Preencha as notas e consulte a API para descobrir o próximo passo.
          </p>
        </>
      )}
    </aside>
  );
}

function Catalog({ assignments }: { assignments: Atribuicao[] }) {
  return (
    <div className="catalog-grid">
      {assignments.length ? (
        assignments.map((item) => (
          <article className="catalog-card" key={item.id}>
            <div>
              <span className="eyebrow">{item.turno}</span>
              <h3>{item.nomeMateria}</h3>
              <p>{item.nomeProfessor}</p>
            </div>
            <span className="catalog-id">#{item.id}</span>
          </article>
        ))
      ) : (
        <div className="empty-state">Nenhuma atribuição cadastrada ainda.</div>
      )}
    </div>
  );
}
