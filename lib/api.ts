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

export class ApiError extends Error {
  status: number;
  details: string[];

  constructor(message: string, status: number, details: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Não foi possível concluir a operação (${response.status}).`;
    let details: string[] = [];

    try {
      const body = await response.json();
      message = body.mensagem || message;
      details = Array.isArray(body.detalhes) ? body.detalhes : [];
    } catch {
      // Mantém a mensagem baseada no status quando não houver JSON.
    }

    throw new ApiError(message, response.status, details);
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
export const updateCurso = (
  id: number,
  payload: { nome: string; sigla: string },
) =>
  request<Curso>(`/api/admin/cursos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteCurso = (id: number) =>
  request<void>(`/api/admin/cursos/${id}`, { method: "DELETE" });

export const createProfessor = (payload: { nome: string; email: string }) =>
  request<ProfessorCadastrado>("/api/admin/professores", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateProfessor = (
  id: number,
  payload: { nome: string; email: string },
) =>
  request<ProfessorCadastrado>(`/api/admin/professores/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteProfessor = (id: number) =>
  request<void>(`/api/admin/professores/${id}`, { method: "DELETE" });

export const createSemestre = (payload: { ordem: number; cursoId: number }) =>
  request<Semestre>("/api/admin/semestres", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateSemestre = (
  id: number,
  payload: { ordem: number; cursoId: number },
) =>
  request<Semestre>(`/api/admin/semestres/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteSemestre = (id: number) =>
  request<void>(`/api/admin/semestres/${id}`, { method: "DELETE" });

export const createMateria = (payload: {
  nome: string;
  sigla: string;
  semestreId: number;
}) =>
  request<Materia>("/api/admin/materias", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateMateria = (
  id: number,
  payload: { nome: string; sigla: string; semestreId: number },
) =>
  request<Materia>(`/api/admin/materias/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteMateria = (id: number) =>
  request<void>(`/api/admin/materias/${id}`, { method: "DELETE" });

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
export const updateAtribuicao = (
  id: number,
  payload: {
    professorId: number;
    materiaId: number;
    turno: string;
    jsonFormula: string;
  },
) =>
  request<Atribuicao>(`/api/admin/atribuicoes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteAtribuicao = (id: number) =>
  request<void>(`/api/admin/atribuicoes/${id}`, { method: "DELETE" });
