// ============================================================
// v421.9 EXPERIMENTOS HISTÓRICOS — el método antes que el resultado.
// Cada experimento declara qué preguntó, qué encontró y, sobre todo,
// qué NO demuestra. Todos están anclados a registros del índice.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoCiencia, Migas, SelloNivel, SelloTipo } from "@/components/ciencia/piezas";
import { CAPTURA, EXPERIMENTOS, POR_ID, publicacionDe, rutaPublicacion } from "@/lib/ciencia/indice";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Experimentos históricos · Science Frontier",
  description:
    "Interferómetros, satélites, testigos de hielo, ensayos aleatorizados y verificación matemática: qué preguntó cada método y qué no demuestra.",
  alternates: { canonical: `${SITE_URL}/ciencia/experimentos` },
};

export default function Page() {
  return (
    <MarcoCiencia activa="/ciencia/experimentos">
      <Migas pasos={[{ href: "/ciencia", label: "Science Frontier" }, { label: "Experimentos históricos" }]} />
      <p className="vx-sc-volanta">Experimentos históricos</p>
      <h1>
        Cómo se cambió
        <br />
        <em>la pregunta</em>.
      </h1>
      <p className="vx-sc-sub">
        {EXPERIMENTOS.length} métodos que redefinieron lo que se podía saber. Cada ficha separa el montaje, el
        resultado y su límite; todas enlazan a los registros del índice y a la fuente que permitió comprobarlas.
      </p>

      <div className="vx-sc-lista">
        {EXPERIMENTOS.map((e) => (
          <article key={e.id} id={e.id} className="vx-sc-ficha" style={{ scrollMarginTop: 80 }}>
            <div className="vx-sc-sellos">
              <span className="vx-sc-sello-tipo" style={{ color: "#34d399" }}>
                {e.anio}
              </span>
              <span className="vx-sc-meta">{e.publicaciones.length} registros asociados</span>
            </div>
            <h3 style={{ fontSize: 18 }}>{e.nombre}</h3>
            <dl className="vx-sc-datos lista">
              <div>
                <dt>Montaje</dt>
                <dd style={{ maxWidth: "64%" }}>{e.metodo}</dd>
              </div>
              <div>
                <dt>Pregunta</dt>
                <dd style={{ maxWidth: "64%" }}>{e.pregunta}</dd>
              </div>
              <div>
                <dt>Resultado</dt>
                <dd style={{ maxWidth: "64%" }}>{e.resultado}</dd>
              </div>
            </dl>
            <p className="vx-sc-cautela" style={{ margin: 0 }}>
              Qué no demuestra: {e.queNoDemuestra}
            </p>
            <div className="vx-sc-lista" style={{ gap: 6, margin: 0 }}>
              {e.publicaciones.map((pid) => {
                const p = publicacionDe(pid);
                if (!p) return null;
                return (
                  <div key={pid} className="vx-sc-meta" style={{ flexWrap: "wrap", gap: 6 }}>
                    <SelloTipo tipo={p.tipo} />
                    <SelloNivel nivel={p.nivel} />
                    <Link href={rutaPublicacion(pid)} style={{ color: "#22d3ee", fontSize: 12.5 }}>
                      {p.anio} · {p.titulo}
                    </Link>
                  </div>
                );
              })}
            </div>
            <div className="vx-sc-meta">
              <a href={e.fuente} target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>
                Fuente consultada ↗
              </a>
              <span className="sep">·</span>
              <span>captura {CAPTURA}</span>
            </div>
          </article>
        ))}
      </div>

      <p className="vx-sc-hueco" style={{ marginTop: 18 }}>
        {POR_ID.size} registros en el índice. Los experimentos se ordenan por el año en que el método produjo su
        resultado principal, no por la fecha del artículo que lo comunica.
      </p>
    </MarcoCiencia>
  );
}
