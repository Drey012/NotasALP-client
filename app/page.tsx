"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Database,
  LayoutDashboard,
  LogOut,
  Plus,
  UserCircle,
  Wifi,
} from "lucide-react";
import { AuthScreen } from "@/components/AuthScreen";
import { ConsultationTab } from "@/components/ConsultationTab";
import { CreationTab } from "@/components/CreationTab";
import { Metric } from "@/components/ui";
import { clearSession, getSession, type AuthSession } from "@/lib/api";

type MainTab = "consultation" | "creation";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<MainTab>("consultation");
  const [professorCount, setProfessorCount] = useState(0);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setReady(true);
    const syncSession = () => setSession(getSession());
    const handleExpired = () => {
      setSession(null);
      setActiveTab("consultation");
    };
    window.addEventListener("auth:changed", syncSession);
    window.addEventListener("auth:expired", handleExpired);
    return () => {
      window.removeEventListener("auth:changed", syncSession);
      window.removeEventListener("auth:expired", handleExpired);
    };
  }, []);

  const updateCount = useCallback(
    (count: number) => setProfessorCount(count),
    [],
  );
  const openAdmin = () => setActiveTab("creation");
  const signOut = () => {
    clearSession();
    setActiveTab("consultation");
  };

  if (!ready)
    return (
      <main className="auth-loading">
        <span className="eyebrow">Notas ALP</span>
        <p>Preparando seu acesso...</p>
      </main>
    );
  if (activeTab === "creation" && !session)
    return <AuthScreen onAuthenticated={setSession} />;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <span className="brand-mark" />
          <span>
            <strong>Notas ALP</strong>
            <small>painel acadêmico</small>
          </span>
        </a>
        <div className="side-title">Navegação</div>
        <nav className="nav">
          <button
            className={activeTab === "consultation" ? "active" : ""}
            onClick={() => setActiveTab("consultation")}
          >
            <LayoutDashboard size={17} />
            <span>Consultar dados</span>
            <small>01</small>
          </button>
          <button
            className={activeTab === "creation" ? "active" : ""}
            onClick={openAdmin}
          >
            <Plus size={17} />
            <span>Área administrativa</span>
            <small>02</small>
          </button>
        </nav>
        <div className="side-note">
          <strong>
            {session
              ? `Olá, ${session.nome.split(" ")[0]}.`
              : "Consulta pública."}
          </strong>
          <p>
            {session
              ? "Você está autenticado com acesso administrativo."
              : "Consulte notas sem login. O gerenciamento exige uma conta."}
          </p>
          {session ? (
            <button className="logout-button" onClick={signOut}>
              <LogOut size={14} /> Encerrar sessão
            </button>
          ) : (
            <button className="login-link" onClick={openAdmin}>
              <UserCircle size={14} /> Entrar para administrar
            </button>
          )}
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <span>
            Notas ALP <b>›</b>{" "}
            {activeTab === "consultation" ? "consultas" : "administração"}
          </span>
          <span className="topbar-right">
            <span>
              <Wifi size={14} /> API Spring Boot
            </span>
            <span>{session ? "JWT ativo" : "consulta pública"}</span>
          </span>
        </header>
        <div className="content">
          <section className="hero">
            <div>
              <span className="eyebrow">painel de dados acadêmicos</span>
              <h1>
                Menos ruído.
                <br />
                <em>Mais contexto.</em>
              </h1>
              <p className="lede">
                Consulte resultados publicamente e gerencie a estrutura
                acadêmica com uma sessão administrativa segura.
              </p>
            </div>
            <div className="hero-art">
              <div className="art-orbit">
                <BarChart3 size={31} />
              </div>
              <span>
                dados organizados
                <br />
                decisões melhores
              </span>
            </div>
          </section>
          <div className="metrics">
            <Metric
              value={professorCount || "—"}
              label="atribuições para consulta"
            />
            <Metric value="05" label="tipos de cadastro" />
            <Metric
              value={session ? "JWT" : "REST"}
              label={session ? "sessão protegida" : "fonte pública"}
            />
          </div>
          {activeTab === "consultation" ? (
            <ConsultationTab onCountChange={updateCount} />
          ) : (
            <CreationTab />
          )}
          <footer className="footer">
            <span>Notas ALP · cliente web</span>
            <span>
              <Database size={13} />{" "}
              {session
                ? `sessão de ${session.email}`
                : "consulta sem autenticação"}
            </span>
          </footer>
        </div>
      </div>
    </main>
  );
}
