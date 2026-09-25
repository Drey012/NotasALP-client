"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, UserPlus, LogIn } from "lucide-react";
import {
  ApiError,
  login,
  register,
  saveSession,
  type AuthSession,
} from "@/lib/api";
import { Feedback } from "@/components/ui";

type AuthMode = "login" | "register";

export function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (session: AuthSession) => void;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (mode === "register" && password.length < 6) {
      setError(new Error("A senha deve ter pelo menos 6 caracteres."));
      return;
    }
    setLoading(true);
    try {
      const session =
        mode === "login"
          ? await login({ email, senha: password })
          : await register({ nome: name, email, senha: password });
      saveSession(session);
      onAuthenticated(session);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof Error
          ? caught
          : new Error("Não foi possível autenticar."),
      );
    } finally {
      setLoading(false);
    }
  };

  const details = error instanceof ApiError ? error.details : [];

  return (
    <main className="auth-shell">
      <section className="auth-art">
        <a className="brand auth-brand" href="/">
          <span className="brand-mark" />
          <span>
            <strong>Notas ALP</strong>
            <small>painel acadêmico</small>
          </span>
        </a>
        <div className="auth-art-copy">
          <span className="eyebrow">acesso administrativo</span>
          <h1>
            Dados claros.
            <br />
            <em>Gestão segura.</em>
          </h1>
          <p>
            Entre no painel para administrar a estrutura acadêmica e manter as
            consultas organizadas.
          </p>
        </div>
        <span className="auth-caption">Spring Security · JWT</span>
      </section>
      <section className="auth-card-wrap">
        <div className="auth-card">
          <div className="auth-heading">
            <span className="eyebrow">
              {mode === "login" ? "01 · entrar" : "01 · novo acesso"}
            </span>
            <h2>
              {mode === "login" ? "Bem-vindo de volta." : "Crie seu acesso."}
            </h2>
            <p>
              {mode === "login"
                ? "Use suas credenciais de administrador para continuar."
                : "O cadastro público está desativado por padrão; administradores devem ser provisionados pelo responsável do ambiente."}
            </p>
          </div>
          <div className="auth-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => changeMode("login")}
            >
              <LogIn size={15} /> Entrar
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => changeMode("register")}
            >
              <UserPlus size={15} /> Registrar
            </button>
          </div>
          <form onSubmit={submit} className="auth-form">
            {mode === "register" && (
              <label className="field">
                <span>Nome</span>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome completo"
                />
              </label>
            )}
            <label className="field">
              <span>E-mail</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@exemplo.com"
              />
            </label>
            <label className="field">
              <span>Senha</span>
              <input
                required
                type="password"
                minLength={mode === "register" ? 6 : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={
                  mode === "register" ? "Mínimo de 6 caracteres" : "Sua senha"
                }
              />
            </label>
            {error && (
              <div className="notice error">
                <Feedback kind="error">{error.message}</Feedback>
                {details.length > 0 && (
                  <ul>
                    {details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <button className="button auth-submit" disabled={loading}>
              {loading
                ? "Processando..."
                : mode === "login"
                  ? "Entrar no painel"
                  : "Criar e entrar"}
              <ArrowRight size={16} />
            </button>
          </form>
          <p className="auth-security">
            <LockKeyhole size={14} /> Sua sessão usa token JWT e é armazenada
            apenas neste navegador.
          </p>
        </div>
      </section>
    </main>
  );
}
