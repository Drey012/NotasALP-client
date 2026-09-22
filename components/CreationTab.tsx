"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import {
  createAtribuicao,
  createCurso,
  createMateria,
  createProfessor,
  createSemestre,
  listCursos,
  listMaterias,
  listProfessoresCadastrados,
  listSemestres,
  type Curso,
  type Materia,
  type ProfessorCadastrado,
  type Semestre,
} from "@/lib/api";
import { Feedback } from "@/components/ui";

type FormKind = "curso" | "professor" | "semestre" | "materia" | "atribuicao";
const forms: { id: FormKind; label: string; description: string }[] = [
  { id: "curso", label: "Curso", description: "Estrutura principal" },
  { id: "professor", label: "Professor", description: "Docente e contato" },
  { id: "semestre", label: "Semestre", description: "Organização do curso" },
  { id: "materia", label: "Matéria", description: "Disciplina ofertada" },
  { id: "atribuicao", label: "Atribuição", description: "Vínculo e fórmula" },
];

export function CreationTab() {
  const [kind, setKind] = useState<FormKind>("curso");
  const [refresh, setRefresh] = useState(0);
  return (
    <section className="creation-area">
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">02 · administração</span>
          <h2>
            Cadastre a estrutura <em>acadêmica.</em>
          </h2>
        </div>
        <p>
          Siga a ordem recomendada para respeitar as relações: cursos,
          professores, semestres, matérias e atribuições.
        </p>
      </div>
      <div className="creation-layout">
        <nav className="form-nav" aria-label="Tipos de cadastro">
          {forms.map((form) => (
            <button
              key={form.id}
              className={kind === form.id ? "active" : ""}
              onClick={() => setKind(form.id)}
            >
              <span>{form.label}</span>
              <small>{form.description}</small>
            </button>
          ))}
        </nav>
        <CreationForm
          kind={kind}
          refresh={refresh}
          onSuccess={() => setRefresh((value) => value + 1)}
        />
      </div>
    </section>
  );
}

function CreationForm({
  kind,
  refresh,
  onSuccess,
}: {
  kind: FormKind;
  refresh: number;
  onSuccess: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({
    turno: "MANHA",
    jsonFormula: '{"formula":"MAX(P1, P2)","rotulos":["P1","P2"]}',
  });
  const [courses, setCourses] = useState<Curso[]>([]);
  const [professors, setProfessors] = useState<ProfessorCadastrado[]>([]);
  const [semesters, setSemesters] = useState<Semestre[]>([]);
  const [subjects, setSubjects] = useState<Materia[]>([]);
  const [status, setStatus] = useState<{
    kind: "error" | "success";
    message: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    Promise.all([
      listCursos(),
      listProfessoresCadastrados(),
      listSemestres(),
      listMaterias(),
    ])
      .then(([c, p, s, m]) => {
        setCourses(c);
        setProfessors(p);
        setSemesters(s);
        setSubjects(m);
      })
      .catch(() => undefined);
  }, [refresh]);
  const set = (key: string, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      if (kind === "curso")
        await createCurso({ nome: values.nome, sigla: values.sigla });
      if (kind === "professor")
        await createProfessor({ nome: values.nome, email: values.email });
      if (kind === "semestre")
        await createSemestre({
          ordem: Number(values.ordem),
          cursoId: Number(values.cursoId),
        });
      if (kind === "materia")
        await createMateria({
          nome: values.nome,
          sigla: values.sigla,
          semestreId: Number(values.semestreId),
        });
      if (kind === "atribuicao") {
        JSON.parse(values.jsonFormula);
        await createAtribuicao({
          professorId: Number(values.professorId),
          materiaId: Number(values.materiaId),
          turno: values.turno,
          jsonFormula: values.jsonFormula,
        });
      }
      setStatus({
        kind: "success",
        message: `${forms.find((form) => form.id === kind)?.label} cadastrado com sucesso.`,
      });
      setValues({
        turno: "MANHA",
        jsonFormula: '{"formula":"MAX(P1, P2)","rotulos":["P1","P2"]}',
      });
      onSuccess();
    } catch (caught) {
      setStatus({
        kind: "error",
        message:
          caught instanceof Error
            ? caught.message
            : "Não foi possível concluir o cadastro.",
      });
    } finally {
      setSaving(false);
    }
  };
  return (
    <form className="panel creation-form" onSubmit={submit}>
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Novo registro</span>
          <h3>{forms.find((form) => form.id === kind)?.label}</h3>
        </div>
        <span className="form-index">
          {String(forms.findIndex((form) => form.id === kind) + 1).padStart(
            2,
            "0",
          )}{" "}
          / 05
        </span>
      </div>
      {kind === "curso" && (
        <>
          <Field
            label="Nome do curso"
            value={values.nome}
            onChange={(v) => set("nome", v)}
            placeholder="Desenvolvimento de Software"
          />
          <Field
            label="Sigla"
            value={values.sigla}
            onChange={(v) => set("sigla", v)}
            placeholder="DSM"
          />
        </>
      )}
      {kind === "professor" && (
        <>
          <Field
            label="Nome completo"
            value={values.nome}
            onChange={(v) => set("nome", v)}
            placeholder="Profº Exemplo"
          />
          <Field
            label="E-mail institucional"
            type="email"
            value={values.email}
            onChange={(v) => set("email", v)}
            placeholder="exemplo@cps.sp.gov.br"
          />
        </>
      )}
      {kind === "semestre" && (
        <>
          <Field
            label="Ordem do semestre"
            type="number"
            value={values.ordem}
            onChange={(v) => set("ordem", v)}
            placeholder="1"
          />
          <SelectField
            label="Curso relacionado"
            value={values.cursoId}
            onChange={(v) => set("cursoId", v)}
            options={courses.map((item) => ({
              value: item.id,
              label: `${item.sigla} · ${item.nome}`,
            }))}
          />
        </>
      )}
      {kind === "materia" && (
        <>
          <Field
            label="Nome da matéria"
            value={values.nome}
            onChange={(v) => set("nome", v)}
            placeholder="Algoritmo e Lógica de Programação"
          />
          <Field
            label="Sigla"
            value={values.sigla}
            onChange={(v) => set("sigla", v)}
            placeholder="ALP"
          />
          <SelectField
            label="Semestre relacionado"
            value={values.semestreId}
            onChange={(v) => set("semestreId", v)}
            options={semesters.map((item) => ({
              value: item.id,
              label: `${item.nomeCurso} · ${item.ordem}º semestre`,
            }))}
          />
        </>
      )}
      {kind === "atribuicao" && (
        <>
          <SelectField
            label="Professor"
            value={values.professorId}
            onChange={(v) => set("professorId", v)}
            options={professors.map((item) => ({
              value: item.id,
              label: item.nome,
            }))}
          />
          <SelectField
            label="Matéria"
            value={values.materiaId}
            onChange={(v) => set("materiaId", v)}
            options={subjects.map((item) => ({
              value: item.id,
              label: `${item.sigla} · ${item.nome}`,
            }))}
          />
          <SelectField
            label="Turno"
            value={values.turno}
            onChange={(v) => set("turno", v)}
            options={["MANHA", "TARDE", "NOITE"].map((value) => ({
              value,
              label: value,
            }))}
          />
          <label className="field">
            <span>Fórmula em JSON</span>
            <textarea
              value={values.jsonFormula}
              onChange={(event) => set("jsonFormula", event.target.value)}
              rows={5}
            />
          </label>
          <p className="helper">
            Exemplo: fórmula e rótulos das notas iniciais em um único JSON.
          </p>
        </>
      )}
      {status && <Feedback kind={status.kind}>{status.message}</Feedback>}
      <button className="button" disabled={saving}>
        {saving ? "Salvando..." : "Salvar cadastro"} <Plus size={16} />
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        required
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select
        required
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Selecione...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
