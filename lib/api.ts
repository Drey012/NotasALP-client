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
  notaNecessariaProximaProva: number | null;
};

export type ApiError = Error & {
  status?: number;
  timestamp?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, cache: "no-store" });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { mensagem?: string; status?: number; timestamp?: string } | null;
    const error = new Error(body?.mensagem ?? `A API respondeu com ${response.status}`) as ApiError;
    error.status = body?.status ?? response.status;
    error.timestamp = body?.timestamp;
    throw error;
  }
  return response.json() as Promise<T>;
}

export function listProfessors() {
  return request<Professor[]>("/api/professores");
}

export function evaluateNotes(payload: EvaluationRequest) {
  return request<EvaluationResult>("/api/avaliar", { method: "POST", body: JSON.stringify(payload) });
}
