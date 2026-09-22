export type Professor = {
  indice: number;
  nomeProfessor: string;
  nomeMateria: string;
  rotulosNotasIniciais: string[];
};
export type Curso = { id: number; nome: string; sigla: string };
export type ProfessorCadastrado = { id: number; nome: string; email: string };
export type Semestre = { id: number; ordem: number; nomeCurso: string };
export type Materia = {
  id: number;
  nome: string;
  sigla: string;
  ordemSemestre: number;
  nomeCurso: string;
};
export type Atribuicao = {
  id: number;
  nomeProfessor: string;
  nomeMateria: string;
  turno: string;
  jsonFormula: string;
};
export type EvaluationRequest = {
  indiceProfessor: number;
  notasIniciais: number[];
  p3?: number;
  exame?: number;
};
export type EvaluationResult = {
  notaAtual: number;
  status: string;
  precisaP3: boolean;
  precisaExame: boolean;
  notaNecessariaProximaProva?: number | null;
  proximaProvaLabel?: string | null;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
).replace(/\/$/, "");
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!response.ok) {
    let message = `A API respondeu com ${response.status}`;
    try {
      const body = await response.json();
      message = body.mensagem || body.message || message;
    } catch {
      /* resposta sem corpo */
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const listProfessors = () => request<Professor[]>("/api/professores");
export const evaluateNotes = (payload: EvaluationRequest) =>
  request<EvaluationResult>("/api/avaliar", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const listCursos = () => request<Curso[]>("/api/cursos");
export const listProfessoresCadastrados = () =>
  request<ProfessorCadastrado[]>("/api/professores-cadastrados");
export const listSemestres = () => request<Semestre[]>("/api/semestres");
export const listMaterias = () => request<Materia[]>("/api/materias");
export const listAtribuicoes = () => request<Atribuicao[]>("/api/atribuicoes");
export const createCurso = (payload: { nome: string; sigla: string }) =>
  request<Curso>("/api/admin/cursos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const createProfessor = (payload: { nome: string; email: string }) =>
  request<ProfessorCadastrado>("/api/admin/professores", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const createSemestre = (payload: { ordem: number; cursoId: number }) =>
  request<Semestre>("/api/admin/semestres", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const createMateria = (payload: {
  nome: string;
  sigla: string;
  semestreId: number;
}) =>
  request<Materia>("/api/admin/materias", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const createAtribuicao = (payload: {
  professorId: number;
  materiaId: number;
  turno: string;
  jsonFormula: string;
}) =>
  request<Atribuicao>("/api/admin/atribuicoes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
