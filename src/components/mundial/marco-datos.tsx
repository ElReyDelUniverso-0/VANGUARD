// ═══════════════════════════════════════════════════════════════════
// v416.0 · EL MARCO DEL CENTRO DE DATOS — una sola casa para las cuatro piezas
// Departamento 4 · VANGUARD WORLD DATA
// Server component. Pinta la barra del módulo (Explorador · Comparador · Panel ·
// Ficha de país), la cabecera y el pie con la fuente, la licencia y la fecha de
// consulta. Ninguna página del centro se inventa su propia cabecera.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import type { ReactNode } from "react";
import "./mundial.css";

const PUERTAS = [
  { href: "/datos-mundiales", label: "Explorador de estadísticas" },
  { href: "/datos-mundiales/comparar", label: "Comparador mundial" },
  { href: "/datos-mundiales/panel", label: "Panel de desarrollo" },
  { href: "/datos-mundiales/pais/do", label: "Ficha de país" },
];

export function MarcoDatos({
  activo,
  volanta,
  titulo,
  sub,
  children,
  fuente,
  cifras,
}: {
  activo: string;
  volanta: string;
  titulo: string;
  sub?: ReactNode;
  children: ReactNode;
  fuente?: ReactNode;
  cifras?: { valor: ReactNode; etiqueta: string; nota?: string }[];
}) {
  return (
    <main className="vx-md">
      <div className="vx-md-caja">
        <nav className="vx-md-migas" aria-label="Migas">
          <Link href="/">Vanguard</Link>
          <span>·</span>
          <Link href="/datos">Catálogo de datos de la casa</Link>
          <span>·</span>
          <span>Centro de datos mundiales</span>
        </nav>

        <nav className="vx-md-barra" aria-label="Secciones del centro de datos">
          {PUERTAS.map((p) => (
            <Link key={p.href} href={p.href} aria-current={activo === p.href ? "page" : undefined}>
              {p.label}
            </Link>
          ))}
          <Link href="/comparador">Comparador clásico (8 indicadores)</Link>
        </nav>

        <header>
          <p className="vx-md-volanta">{volanta}</p>
          <h1 className="vx-md-titulo">{titulo}</h1>
          {sub ? <p className="vx-md-sub">{sub}</p> : null}
        </header>

        {cifras && cifras.length > 0 ? (
          <div className="vx-md-rejilla vx-md-4" style={{ marginBottom: 24 }}>
            {cifras.map((c) => (
              <div className="vx-md-cifra" key={c.etiqueta}>
                <b>{c.valor}</b>
                <span>{c.etiqueta}</span>
                {c.nota ? <small>{c.nota}</small> : null}
              </div>
            ))}
          </div>
        ) : null}

        {children}

        <div className="vx-md-pie">
          {fuente ?? null}
          <p style={{ margin: "10px 0 0" }}>
            Centro de datos mundiales de Vanguard (v416.0, departamento 4). Fuente única de las series:{" "}
            <a href="https://data.worldbank.org/" target="_blank" rel="noreferrer noopener">
              Banco Mundial · World Development Indicators
            </a>{" "}
            (CC BY 4.0). Contraste de referencia:{" "}
            <a href="https://ourworldindata.org/" target="_blank" rel="noreferrer noopener">
              Our World in Data
            </a>
            ,{" "}
            <a href="https://data.un.org/" target="_blank" rel="noreferrer noopener">
              UNdata
            </a>
            ,{" "}
            <a href="https://data.oecd.org/" target="_blank" rel="noreferrer noopener">
              OCDE
            </a>{" "}
            y{" "}
            <a href="https://www.gapminder.org/tools/" target="_blank" rel="noreferrer noopener">
              Gapminder
            </a>
            . Ninguna de esas fuentes se copia: sus series no se mezclan con las del Banco Mundial en una misma línea.
          </p>
        </div>
      </div>
    </main>
  );
}
