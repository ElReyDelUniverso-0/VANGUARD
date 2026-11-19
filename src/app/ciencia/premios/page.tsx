// ============================================================
// v421.9 CATÁLOGO DE PREMIOS CIENTÍFICOS — motivación literal
// (en el idioma del fallo) junto a una traducción de trabajo, más los
// registros del índice que pertenecen a esa línea de investigación.
// Un premio no convierte un artículo en evidencia: lo decimos.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoCiencia, Migas } from "@/components/ciencia/piezas";
import { CAPTURA, PREMIOS, ideaDe, publicacionDe, rutaIdea, rutaPublicacion } from "@/lib/ciencia/indice";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Premios científicos · Science Frontier",
  description:
    "Premios Nobel del índice con la motivación oficial literal, sus laureados y las publicaciones relacionadas de cada línea de investigación.",
  alternates: { canonical: `${SITE_URL}/ciencia/premios` },
};

export default function Page() {
  const ordenados = [...PREMIOS].sort((a, b) => b.anio - a.anio);
  return (
    <MarcoCiencia activa="/ciencia/premios">
      <Migas pasos={[{ href: "/ciencia", label: "Science Frontier" }, { label: "Premios" }]} />
      <p className="vx-sc-volanta">Catálogo de premios científicos</p>
      <h1>
        El reconocimiento
        <br />
        <em>no es la prueba</em>.
      </h1>
      <p className="vx-sc-sub">
        {PREMIOS.length} fallos del Premio Nobel, con la motivación oficial copiada literalmente del registro de
        NobelPrize.org y su traducción de trabajo. Cada premio se enlaza a la idea que reconoce y a los registros del
        índice de esa línea; ninguno se presenta como validación científica.
      </p>

      <div className="vx-sc-lista">
        {ordenados.map((pr) => {
          const idea = ideaDe(pr.idea);
          return (
            <article key={pr.id} id={pr.id} className="vx-sc-ficha" style={{ scrollMarginTop: 80 }}>
              <div className="vx-sc-sellos">
                <span className="vx-sc-sello-tipo" style={{ color: "#e8c56a" }}>
                  {pr.anio}
                </span>
                <span className="vx-sc-meta">{pr.premio}</span>
                <span className="vx-sc-meta">{pr.laureados.length} laureados</span>
              </div>
              <h3 style={{ fontSize: 18 }}>{pr.laureados.join(" · ")}</h3>
              <blockquote style={{ margin: "0", borderLeft: "2px solid #e8c56a", paddingLeft: 12 }}>
                <p style={{ fontStyle: "italic", color: "#e7eef7", fontSize: 13.5, margin: "0 0 4px" }}>«{pr.motivacion}»</p>
                <p style={{ margin: 0, fontSize: 12.5, color: "#9fb0c4" }}>Traducción de trabajo: {pr.motivacionEs}</p>
              </blockquote>
              <div className="vx-sc-meta" style={{ flexWrap: "wrap", gap: 8 }}>
                <a href={pr.url} target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>
                  Registro oficial ↗
                </a>
                <span className="sep">·</span>
                <span>consultado el {CAPTURA}</span>
              </div>
              {idea ? (
                <p style={{ margin: 0 }}>
                  Idea reconocida:{" "}
                  <Link href={rutaIdea(idea.id)} style={{ color: "#22d3ee" }}>
                    {idea.pregunta}
                  </Link>
                </p>
              ) : null}
              <div className="vx-sc-meta" style={{ flexWrap: "wrap", gap: 8 }}>
                {pr.publicaciones.map((pid) => {
                  const p = publicacionDe(pid);
                  return p ? (
                    <Link key={pid} href={rutaPublicacion(pid)} style={{ color: "#9fb0c4", fontSize: 12.5 }}>
                      {p.anio} · {p.titulo.slice(0, 58)}
                      {p.titulo.length > 58 ? "…" : ""}
                    </Link>
                  ) : null;
                })}
              </div>
              <p className="vx-sc-cautela" style={{ margin: 0 }}>
                {pr.nota}
              </p>
            </article>
          );
        })}
      </div>

      <p className="vx-sc-hueco" style={{ marginTop: 18 }}>
        El catálogo no incluye las medallas y premios que no se pudieron comprobar en su fuente oficial. Cada ficha
        enlaza al registro del premio, no a una nota de prensa.
      </p>
    </MarcoCiencia>
  );
}
