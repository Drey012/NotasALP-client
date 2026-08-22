export type Professor = {
  indice: number;
  nomeProfessor: string;
  nomeMateria: string;
  rotulosNotasIniciais: string[];
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
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, cache: "no-store" });
  if (!response.ok) throw new Error(`A API respondeu com ${response.status}`);
  return response.json() as Promise<T>;
}

export function listProfessors() {
  return request<Professor[]>("/api/notas/professores");
}

export function evaluateNotes(payload: EvaluationRequest) {
  return request<EvaluationResult>("/api/notas/avaliar", { method: "POST", body: JSON.stringify(payload) });
}
