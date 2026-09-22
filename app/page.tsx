"use client";

import { useCallback, useState } from "react";
import { BarChart3, Database, LayoutDashboard, Plus, Wifi } from "lucide-react";
import { ConsultationTab } from "@/components/ConsultationTab";
import { CreationTab } from "@/components/CreationTab";
import { Metric } from "@/components/ui";

type MainTab = "consultation" | "creation";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<MainTab>("consultation");
  const [professorCount, setProfessorCount] = useState(0);
  const updateCount = useCallback(
    (count: number) => setProfessorCount(count),
    [],
  );

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
            onClick={() => setActiveTab("creation")}
          >
            <Plus size={17} />
            <span>Criar registros</span>
            <small>02</small>
          </button>
        </nav>
        <div className="side-note">
          <strong>Uma fonte de verdade.</strong>
          <p>
            A API Spring Boot centraliza regras, vínculos e resultados. O front
            organiza cada responsabilidade.
          </p>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <span>
            Notas ALP <b>›</b>{" "}
            {activeTab === "consultation" ? "consultas" : "cadastros"}
          </span>
          <span className="topbar-right">
            <span>
              <Wifi size={14} /> API Spring Boot
            </span>
            <span>v. 03 / 2026</span>
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
                Consulte resultados e cadastre a estrutura acadêmica em espaços
                separados, com contratos claros e uma experiência direta.
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
            <Metric value="REST" label="fonte oficial" />
          </div>
          {activeTab === "consultation" ? (
            <ConsultationTab onCountChange={updateCount} />
          ) : (
            <CreationTab />
          )}
          <footer className="footer">
            <span>Notas ALP · cliente web</span>
            <span>
              <Database size={13} /> estrutura segmentada por responsabilidade
            </span>
          </footer>
        </div>
      </div>
    </main>
  );
}
