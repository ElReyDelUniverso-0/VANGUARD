// ═══════════════════════════════════════════════════════════════════
// v420.3 · EL MARCO DEL ATLAS DE INFRAESTRUCTURA — una sola casa para el Atlas
// Departamento 6 · VANGUARD INFRASTRUCTURE ATLAS
// Server component. Pinta la barra del módulo (Atlas · Gran obra ·
// Explorador · Ficha), la cabecera y el pie con la fuente y la licencia.
// Ninguna página del Atlas se inventa su propia cabecera.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import type { ReactNode } from "react";
import "./infraestructura.css";

const PUERTAS = [
  { href: "/infraestructura", label: "Atlas mundial" },
  { href: "/infraestructura/gran-obra", label: "Grandes obras" },
  { href: "/infraestructura/explorador", label: "Explorador" },
];

export function MarcoInfra({
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
          <span>Atlas de infraestructura</span>
        </nav>

        <nav className="vx-md-barra" aria-label="Secciones del atlas de infraestructura">
          {PUERTAS.map((p) => (
            <Link key={p.href} href={p.href} aria-current={activo === p.href ? "page" : undefined}>
              {p.label}
            </Link>
          ))}
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
            Atlas de infraestructura civil de Vanguard (v420.3, departamento 6). Cada obra se documenta
            únicamente con información pública y apropiada: lo que es, dónde queda, cuándo se construyó
            (si está documentado) y características técnicas publicadas. La casa no publica vulnerabilidades,
            controles de acceso ni detalles operativos de ninguna instalación. Fuentes de las fichas:
            <a href="https://en.wikipedia.org/" target="_blank" rel="noreferrer noopener">Wikipedia</a>,{" "}
            <a href="https://openinframap.org/" target="_blank" rel="noreferrer noopener">Open Infra Map</a>,{" "}
            <a href="https://www.openstreetmap.org/" target="_blank" rel="noreferrer noopener">OpenStreetMap</a>,{" "}
            <a href="https://www.globalenergymonitor.org/" target="_blank" rel="noreferrer noopener">Global Energy Monitor</a>{" "}
            y <a href="https://www.worldbank.org/en/topic/infrastructure" target="_blank" rel="noreferrer noopener">Banco Mundial</a>.{" "}
            Fotografías: solo las autorizadas que ya existen en la casa; mientras no haya, la ficha lo dice y
            dibuja su emblema en código. Ninguna imagen externa se carga.
          </p>
        </div>
      </div>
    </main>
  );
}
