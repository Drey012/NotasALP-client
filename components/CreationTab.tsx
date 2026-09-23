"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import {
  ApiError,
  createAtribuicao,
  createCurso,
  createMateria,
  createProfessor,
  createSemestre,
  deleteAtribuicao,
  deleteCurso,
  deleteMateria,
  deleteProfessor,
  deleteSemestre,
  listAtribuicoes,
  listCursos,
  listMaterias,
  listProfessoresCadastrados,
  listSemestres,
  updateAtribuicao,
  updateCurso,
  updateMateria,
  updateProfessor,
  updateSemestre,
  type Atribuicao,
  type Curso,
  type Materia,
  type ProfessorCadastrado,
  type Semestre,
} from "@/lib/api";
import { Feedback } from "@/components/ui";

type FormKind = "curso" | "professor" | "semestre" | "materia" | "atribuicao";
type FormValues = Record<string, string>;
type Notice = {
  type: "success" | "error";
  message: string;
  status?: number;
  details?: string[];
};

type CatalogData = {
  cursos: Curso[];
  professores: ProfessorCadastrado[];
  semestres: Semestre[];
  materias: Materia[];
  atribuicoes: Atribuicao[];
};

const forms: { id: FormKind; label: string; description: string }[] = [
  { id: "curso", label: "Curso", description: "Estrutura principal" },
  { id: "professor", label: "Professor", description: "Docente e contato" },
  { id: "semestre", label: "Semestre", description: "Organização do curso" },
  { id: "materia", label: "Matéria", description: "Disciplina ofertada" },
  { id: "atribuicao", label: "Atribuição", description: "Vínculo e fórmula" },
];

const emptyValues = (): FormValues => ({
  turno: "MANHA",
  jsonFormula: '{"formula":"MAX(P1, P2)","rotulos":["P1","P2"]}',
});

export function CreationTab() {
  const [kind, setKind] = useState<FormKind>("curso");
  const [refresh, setRefresh] = useState(0);

  return (
    <section className="creation-area">
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">02 · administração</span>
          <h2>
            Gerencie a estrutura <em>acadêmica.</em>
          </h2>
        </div>
        <p>
          Crie, atualize e exclua registros. As mensagens da API aparecem com o
          status e os detalhes retornados pelo backend.
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
        <CrudWorkspace
          key={kind}
          kind={kind}
          refresh={refresh}
          onChanged={() => setRefresh((value) => value + 1)}
        />
      </div>
    </section>
  );
}

function CrudWorkspace({
  kind,
  refresh,
  onChanged,
}: {
  kind: FormKind;
  refresh: number;
  onChanged: () => void;
}) {
  const [data, setData] = useState<CatalogData>({
    cursos: [],
    professores: [],
    semestres: [],
    materias: [],
    atribuicoes: [],
  });
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cursos, professores, semestres, materias, atribuicoes] =
        await Promise.all([
          listCursos(),
          listProfessoresCadastrados(),
          listSemestres(),
          listMaterias(),
          listAtribuicoes(),
        ]);
      setData({ cursos, professores, semestres, materias, atribuicoes });
    } catch (error) {
      setNotice(toNotice(error, "Não foi possível carregar os registros."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData, refresh]);

  const records = useMemo(() => {
    switch (kind) {
      case "curso":
        return data.cursos.map((item) => ({
          id: item.id,
          title: item.nome,
          subtitle: item.sigla,
        }));
      case "professor":
        return data.professores.map((item) => ({
          id: item.id,
          title: item.nome,
          subtitle: item.email,
        }));
      case "semestre":
        return data.semestres.map((item) => ({
          id: item.id,
          title: `${item.ordem}º semestre`,
          subtitle: item.nomeCurso,
        }));
      case "materia":
        return data.materias.map((item) => ({
          id: item.id,
          title: item.nome,
          subtitle: `${item.sigla} · ${item.nomeCurso} · ${item.ordemSemestre}º semestre`,
        }));
      case "atribuicao":
        return data.atribuicoes.map((item) => ({
          id: item.id,
          title: item.nomeMateria,
          subtitle: `${item.nomeProfessor} · ${item.turno}`,
        }));
    }
  }, [data, kind]);

  const set = (key: string, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const beginEdit = (id: number) => {
    setNotice(null);
    setEditingId(id);
    switch (kind) {
      case "curso": {
        const item = data.cursos.find((entry) => entry.id === id);
        setValues(
          item ? { nome: item.nome, sigla: item.sigla } : emptyValues(),
        );
        break;
      }
      case "professor": {
        const item = data.professores.find((entry) => entry.id === id);
        setValues(
          item ? { nome: item.nome, email: item.email } : emptyValues(),
        );
        break;
      }
      case "semestre": {
        const item = data.semestres.find((entry) => entry.id === id);
        setValues(item ? { ordem: String(item.ordem) } : emptyValues());
        break;
      }
      case "materia": {
        const item = data.materias.find((entry) => entry.id === id);
        setValues(
          item ? { nome: item.nome, sigla: item.sigla } : emptyValues(),
        );
        break;
      }
      case "atribuicao": {
        const item = data.atribuicoes.find((entry) => entry.id === id);
        setValues(
          item
            ? { turno: item.turno, jsonFormula: item.jsonFormula }
            : emptyValues(),
        );
        break;
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setValues(emptyValues());
    setNotice(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      await saveRecord(kind, editingId, values);
      setNotice({
        type: "success",
        message: `${labelFor(kind)} ${editingId ? "atualizado" : "cadastrado"} com sucesso.`,
      });
      setEditingId(null);
      setValues(emptyValues());
      await loadData();
      onChanged();
    } catch (error) {
      setNotice(toNotice(error, "Não foi possível salvar este registro."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (
      !window.confirm(
        `Excluir este registro de ${labelFor(kind).toLowerCase()}? Essa ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    setDeletingId(id);
    setNotice(null);
    try {
      await deleteRecord(kind, id);
      setNotice({
        type: "success",
        message: `${labelFor(kind)} excluído com sucesso.`,
      });
      if (editingId === id) cancelEdit();
      await loadData();
      onChanged();
    } catch (error) {
      setNotice(toNotice(error, "Não foi possível excluir este registro."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="crud-stack">
      <form className="panel creation-form" onSubmit={submit}>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              {editingId ? "Editar registro" : "Novo registro"}
            </span>
            <h3>{labelFor(kind)}</h3>
          </div>
          <span className="form-index">
            {editingId ? `ID ${editingId}` : "POST"}
          </span>
        </div>
        <FormFields
          kind={kind}
          values={values}
          set={set}
          data={data}
          editing={editingId !== null}
        />
        {notice && <NoticeBox notice={notice} />}
        <div className="actions">
          <button className="button" disabled={saving || loading}>
            {saving
              ? "Salvando..."
              : editingId
                ? "Salvar alterações"
                : "Salvar cadastro"}
            {editingId ? <Save size={16} /> : <Plus size={16} />}
          </button>
          {editingId && (
            <button
              type="button"
              className="icon-button"
              onClick={cancelEdit}
              aria-label="Cancelar edição"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      <div className="panel records-panel">
        <div className="records-heading">
          <div>
            <span className="eyebrow">Registros existentes</span>
            <h3>
              {records.length} {records.length === 1 ? "item" : "itens"}
            </h3>
          </div>
          <button
            className="icon-button"
            onClick={() => void loadData()}
            disabled={loading}
            aria-label="Atualizar lista"
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
          </button>
        </div>
        {loading ? (
          <div className="empty-state">Carregando registros...</div>
        ) : records.length ? (
          <div className="records-list">
            {records.map((record) => (
              <article
                className={`record-row ${editingId === record.id ? "editing" : ""}`}
                key={record.id}
              >
                <div className="record-copy">
                  <span className="record-id">#{record.id}</span>
                  <strong>{record.title}</strong>
                  <small>{record.subtitle}</small>
                </div>
                <div className="record-actions">
                  <button
                    className="icon-button"
                    onClick={() => beginEdit(record.id)}
                    aria-label={`Editar ${record.title}`}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => void remove(record.id)}
                    disabled={deletingId === record.id}
                    aria-label={`Excluir ${record.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Nenhum registro cadastrado para esta seção.
          </div>
        )}
      </div>
    </div>
  );
}

function FormFields({
  kind,
  values,
  set,
  data,
  editing,
}: {
  kind: FormKind;
  values: FormValues;
  set: (key: string, value: string) => void;
  data: CatalogData;
  editing: boolean;
}) {
  return (
    <>
      {kind === "curso" && (
        <>
          <Field
            label="Nome do curso"
            required
            value={values.nome}
            onChange={(value) => set("nome", value)}
            placeholder="Desenvolvimento de Software"
          />
          <Field
            label="Sigla"
            required
            maxLength={10}
            value={values.sigla}
            onChange={(value) => set("sigla", value)}
            placeholder="DSM"
          />
        </>
      )}
      {kind === "professor" && (
        <>
          <Field
            label="Nome completo"
            required
            value={values.nome}
            onChange={(value) => set("nome", value)}
            placeholder="Profº Exemplo"
          />
          <Field
            label="E-mail institucional"
            required
            type="email"
            value={values.email}
            onChange={(value) => set("email", value)}
            placeholder="exemplo@cps.sp.gov.br"
          />
        </>
      )}
      {kind === "semestre" && (
        <>
          <Field
            label="Ordem do semestre"
            required
            min="1"
            type="number"
            value={values.ordem}
            onChange={(value) => set("ordem", value)}
            placeholder="1"
          />
          <SelectField
            label="Curso relacionado"
            required
            value={values.cursoId}
            onChange={(value) => set("cursoId", value)}
            options={data.cursos.map((item) => ({
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
            required
            value={values.nome}
            onChange={(value) => set("nome", value)}
            placeholder="Algoritmo e Lógica de Programação"
          />
          <Field
            label="Sigla"
            required
            value={values.sigla}
            onChange={(value) => set("sigla", value)}
            placeholder="ALP"
          />
          <SelectField
            label="Semestre relacionado"
            required
            value={values.semestreId}
            onChange={(value) => set("semestreId", value)}
            options={data.semestres.map((item) => ({
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
            required
            value={values.professorId}
            onChange={(value) => set("professorId", value)}
            options={data.professores.map((item) => ({
              value: item.id,
              label: item.nome,
            }))}
          />
          <SelectField
            label="Matéria"
            required
            value={values.materiaId}
            onChange={(value) => set("materiaId", value)}
            options={data.materias.map((item) => ({
              value: item.id,
              label: `${item.sigla} · ${item.nome}`,
            }))}
          />
          <SelectField
            label="Turno"
            required
            value={values.turno}
            onChange={(value) => set("turno", value)}
            options={["MANHA", "TARDE", "NOITE"].map((value) => ({
              value,
              label: value,
            }))}
          />
          <label className="field">
            <span>Fórmula em JSON</span>
            <textarea
              required
              value={values.jsonFormula ?? ""}
              onChange={(event) => set("jsonFormula", event.target.value)}
              rows={5}
            />
          </label>
          <p className="helper">
            Ao editar uma atribuição, selecione novamente professor e matéria
            para enviar os IDs exigidos pelo contrato da API.
          </p>
        </>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  maxLength,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  maxLength?: number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        required={required}
        min={min}
        maxLength={maxLength}
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
  required = false,
  disabled = false,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select
        required={required}
        disabled={disabled}
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

async function saveRecord(
  kind: FormKind,
  id: number | null,
  values: FormValues,
) {
  if (kind === "curso")
    return id
      ? updateCurso(id, { nome: values.nome, sigla: values.sigla })
      : createCurso({ nome: values.nome, sigla: values.sigla });
  if (kind === "professor")
    return id
      ? updateProfessor(id, { nome: values.nome, email: values.email })
      : createProfessor({ nome: values.nome, email: values.email });
  if (kind === "semestre") {
    const payload = {
      ordem: Number(values.ordem),
      cursoId: Number(values.cursoId),
    };
    return id ? updateSemestre(id, payload) : createSemestre(payload);
  }
  if (kind === "materia") {
    const payload = {
      nome: values.nome,
      sigla: values.sigla,
      semestreId: Number(values.semestreId),
    };
    return id ? updateMateria(id, payload) : createMateria(payload);
  }
  JSON.parse(values.jsonFormula);
  const payload = {
    professorId: Number(values.professorId),
    materiaId: Number(values.materiaId),
    turno: values.turno,
    jsonFormula: values.jsonFormula,
  };
  return id ? updateAtribuicao(id, payload) : createAtribuicao(payload);
}

async function deleteRecord(kind: FormKind, id: number) {
  if (kind === "curso") return deleteCurso(id);
  if (kind === "professor") return deleteProfessor(id);
  if (kind === "semestre") return deleteSemestre(id);
  if (kind === "materia") return deleteMateria(id);
  return deleteAtribuicao(id);
}

function labelFor(kind: FormKind) {
  return forms.find((form) => form.id === kind)?.label ?? "Registro";
}

function toNotice(error: unknown, fallback: string): Notice {
  if (error instanceof ApiError)
    return {
      type: "error",
      message: error.message,
      status: error.status,
      details: error.details,
    };
  if (error instanceof SyntaxError)
    return {
      type: "error",
      message: "A fórmula informada não é um JSON válido.",
      status: 400,
    };
  return {
    type: "error",
    message: error instanceof Error ? error.message : fallback,
  };
}

function NoticeBox({ notice }: { notice: Notice }) {
  return (
    <div className={`notice ${notice.type}`}>
      <Feedback kind={notice.type}>
        {notice.status ? `${statusLabel(notice.status)} · ` : ""}
        {notice.message}
      </Feedback>
      {notice.details?.length ? (
        <ul>
          {notice.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function statusLabel(status: number) {
  if (status === 400) return "Dados inválidos";
  if (status === 404) return "Não encontrado";
  if (status === 409) return "Conflito";
  if (status >= 500) return "Erro do servidor";
  return `HTTP ${status}`;
}
