// ============================================================
// v421.9 CATÁLOGO DE INSTITUCIONES — con la URL comprobada y,
// cuando existe documento, el vínculo exacto con una publicación.
// Lo que no se pudo verificar se publica como no verificado.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoCiencia, Migas } from "@/components/ciencia/piezas";
import {
  CAPTURA,
  INSTITUCIONES,
  INSTITUCIONES_SIN_VERIFICAR,
  POR_ID,
  publicacionDe,
  rutaPublicacion,
} from "@/lib/ciencia/indice";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Instituciones de investigación · Science Frontier",
  description:
    "Catálogo de laboratorios, observatorios, agencias e institutos del índice científico, con su sitio comprobado y el vínculo documental con cada publicación.",
  alternates: { canonical: `${SITE_URL}/ciencia/instituciones` },
};

export default function Page() {
  return (
    <MarcoCiencia activa="/ciencia/instituciones">
      <Migas pasos={[{ href: "/ciencia", label: "Science Frontier" }, { label: "Instituciones" }]} />
      <p className="vx-sc-volanta">Catálogo de instituciones</p>
      <h1>
        Quién hace posible
        <br />
        <em>la investigación</em>.
      </h1>
      <p className="vx-sc-sub">
        {INSTITUCIONES.length} instituciones con su sitio consultado el {CAPTURA}. El vínculo con una publicación solo
        se declara cuando hay un documento: la firma de la colaboración, una afiliación en los metadatos del artículo o
        el comunicado institucional. Si no lo hay, se dice.
      </p>

      <div className="vx-sc-lista">
        {INSTITUCIONES.map((i) => (
          <article key={i.id} id={i.id} className="vx-sc-ficha" style={{ scrollMarginTop: 80 }}>
            <div className="vx-sc-sellos">
              <span className="vx-sc-sello-tipo" style={{ color: "#a78bfa" }}>
                {i.tipo}
              </span>
              <span className="vx-sc-meta">{i.pais}</span>
              <span className="vx-sc-meta">HTTP {i.http} al consultar</span>
            </div>
            <h3 style={{ fontSize: 18 }}>{i.nombre}</h3>
            <p>{i.papel}</p>
            <div className="vx-sc-meta">
              <a href={i.sitio} target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>
                Sitio institucional ↗
              </a>
            </div>
            {i.vinculos.length > 0 ? (
              <div>
                <p className="vx-sc-kicker" style={{ margin: "6px 0 4px" }}>
                  Vínculo documentado
                </p>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                  {i.vinculos.map((v) => {
                    const p = publicacionDe(v.publicacion);
                    return (
                      <li key={v.publicacion}>
                        {p ? <Link href={rutaPublicacion(p.id)} style={{ color: "#22d3ee" }}>{p.titulo}</Link> : v.publicacion}{" "}
                        <span className="vx-sc-hueco">— {v.base}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className="vx-sc-hueco" style={{ margin: 0 }}>
                Sin vínculo documental con las publicaciones de este índice.
              </p>
            )}
            <p className="vx-sc-cautela" style={{ margin: 0 }}>
              {i.nota}
            </p>
          </article>
        ))}
      </div>

      <section className="vx-sc-seccion">
        <header>
          <h2>Declarado, no verificado</h2>
          <span className="vx-sc-kicker">la casa no finge un catálogo completo</span>
        </header>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6, color: "#9fb0c4" }}>
          {INSTITUCIONES_SIN_VERIFICAR.map((i) => (
            <li key={i.nombre}>
              <b style={{ color: "#cbd5e1" }}>{i.nombre}</b> — {i.motivo}
            </li>
          ))}
        </ul>
        <p className="vx-sc-hueco" style={{ marginTop: 10 }}>
          {POR_ID.size} registros indexados. Un instituto puede ser real y no aparecer aquí: el catálogo solo incluye
          lo que esta captura pudo comprobar.
        </p>
      </section>
    </MarcoCiencia>
  );
}
