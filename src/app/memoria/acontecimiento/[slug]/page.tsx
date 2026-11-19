import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ACONTECIMIENTOS, acontecimiento } from "@/lib/memoria/acontecimientos";
import { buscarEnArchivo } from "@/lib/memoria/buscar";
import { obtenerDocumento } from "@/lib/memoria/documento";
import { fuente as datosFuente } from "@/lib/memoria/fuentes";
import { SITE_URL } from "@/lib/site";
import { TarjetaDocumento } from "@/components/memoria/tarjeta-documento";
import "../../../memoria/memoria.css";

// ═══════════════════════════════════════════════════════════════════
// v419.0 · /memoria/acontecimiento/[slug] — el expediente
//
// La función que diferencia este archivo: un acontecimiento histórico y, a su
// lado, los documentos originales que lo sostienen. Cada pieza fijada se
// resuelve contra su fuente en este momento; si la fuente ya no la devuelve,
// la ficha lo dice en vez de fingir que está.
//
// Las consultas declaradas traen material vivo y se distinguen de las piezas
// fijadas: lo fijado lo eligió una persona; lo demás es lo que la institución
// publica hoy con esos criterios.
// ═══════════════════════════════════════════════════════════════════

type Params = { slug: string };

// El archivo se regenera cada hora: las instituciones no cambian de
// licencia a cada minuto y la casa no quiere golpearlas en cada visita.
export const revalidate = 3600;
export function generateStaticParams() {
  return ACONTECIMIENTOS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const ac = acontecimiento(slug);
  if (!ac) return { title: "Expediente no encontrado — Archivo de la memoria" };
  return {
    title: `${ac.titulo} — documentos originales`,
    description: `${ac.resumen} ${ac.piezas.length} documentos fijados de la Library of Congress, el Internet Archive y Wikimedia Commons, con su procedencia y derechos.`.slice(0, 300),
    alternates: { canonical: `${SITE_URL}/memoria/acontecimiento/${ac.slug}` },
    openGraph: { title: ac.titulo, description: ac.resumen.slice(0, 300), url: `${SITE_URL}/memoria/acontecimiento/${ac.slug}`, type: "article" },
  };
}

export default async function AcontecimientoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const ac = acontecimiento(slug);
  if (!ac) notFound();

  const piezas = await Promise.all(
    ac.piezas.map(async (p) => ({ ...p, ficha: await obtenerDocumento(p.fuente, p.id) }))
  );

  // dos consultas declaradas como mucho: cada una golpea una fuente externa y
  // la página tiene que responder en un tiempo razonable
  const consultas = ac.consultas.slice(0, 2);
  const cosechas = await Promise.all(
    consultas.map((c) =>
      buscarEnArchivo({
        q: c.q,
        fuente: c.fuente,
        tipo: c.tipo ?? null,
        desde: c.desde ?? null,
        hasta: c.hasta ?? null,
        limite: 6,
      })
    )
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: ac.titulo,
    description: ac.resumen,
    about: { "@type": "Event", name: ac.titulo, startDate: String(ac.desde), endDate: String(ac.hasta), location: ac.paises.join(", ") },
    url: `${SITE_URL}/memoria/acontecimiento/${ac.slug}`,
    isPartOf: { "@type": "CollectionPage", name: "Archivo de la memoria", url: `${SITE_URL}/memoria` },
    citation: ac.referencias.map((r) => ({ "@type": "CreativeWork", name: r.texto, url: r.url })),
  };

  return (
    <main className="vx-mem">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="vx-mem-caja">
        <header>
          <p className="vx-mem-volanta">Expediente · {ac.volanta}</p>
          <h1 className="vx-mem-titulo">{ac.titulo}</h1>
          <p className="vx-mem-sub">{ac.resumen}</p>
          <p className="vx-mem-meta">
            {ac.paises.join(" · ")} · {ac.desde === ac.hasta ? ac.desde : `${ac.desde}–${ac.hasta}`} · {ac.piezas.length} piezas fijadas
          </p>
        </header>

        <section className="vx-mem-sec">
          <h2>Los documentos</h2>
          <p className="vx-mem-nota">
            Cada pieza está fijada a una institución concreta y comprobada al abrir este expediente. Se enseña con el
            papel que juega en el acontecimiento; cuando la fuente no autoriza la imagen, se dice y se enlaza.
          </p>
          <div className="vx-mem-rejilla vx-mem-rejilla--ancha">
            {piezas.map((p) => (
              <div key={`${p.fuente}-${p.id}`} className="vx-mem-pieza">
                <p className="vx-mem-pieza__papel">{p.papel}</p>
                <p className="vx-mem-meta">
                  {datosFuente(p.fuente).nombre} · <code>{p.fuente}:{p.id}</code>
                </p>
                {p.ficha ? (
                  <TarjetaDocumento documento={p.ficha} />
                ) : (
                  <div>
                    <p className="vx-mem-pieza__no">La fuente no devolvió esta pieza ahora mismo. No se sustituye por otra.</p>
                    <a
                      className="vx-mem-enlace"
                      href={
                        p.fuente === "loc"
                          ? `https://www.loc.gov/item/${p.id}/`
                          : p.fuente === "ia"
                            ? `https://archive.org/details/${p.id}`
                            : `https://commons.wikimedia.org/?curid=${p.id}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir el registro en {datosFuente(p.fuente).nombre} ↗
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="vx-mem-sec">
          <h2>El hilo del acontecimiento</h2>
          <ol className="vx-mem-contexto">
            {ac.contexto.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
        </section>

        {cosechas.map((cosecha, i) => (
          <section className="vx-mem-sec" key={`${consultas[i].fuente}-${consultas[i].q}`}>
            <h2>Más documentos · {datosFuente(consultas[i].fuente).nombre}</h2>
            <p className="vx-mem-nota">
              Consulta declarada: «{consultas[i].q}»{consultas[i].tipo ? ` · ${consultas[i].tipo}` : ""}
              {consultas[i].desde || consultas[i].hasta ? ` · ${consultas[i].desde ?? "…"}–${consultas[i].hasta ?? "…"}` : ""}.{" "}
              {consultas[i].nota}
            </p>
            {cosecha.avisos.length ? (
              <ul className="vx-mem-avisos">
                {cosecha.avisos.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            ) : null}
            {cosecha.documentos.length ? (
              <div className="vx-mem-rejilla">
                {cosecha.documentos.map((d) => (
                  <TarjetaDocumento key={d.clave} documento={d} />
                ))}
              </div>
            ) : (
              <p className="vx-mem-nota">La fuente no devolvió documentos con esos criterios en este momento.</p>
            )}
          </section>
        ))}

        <section className="vx-mem-sec vx-mem-ficha">
          <div className="vx-mem-pieza">
            <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#e8c56a" }}>
              Qué no está en este expediente
            </p>
            <ul className="vx-mem-lista">
              {ac.noEsta.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
          <div className="vx-mem-pieza">
            <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#e8c56a" }}>
              Fuentes de este expediente
            </p>
            <ul className="vx-mem-lista">
              {ac.referencias.map((r) => (
                <li key={r.url}>
                  <a className="vx-mem-enlace" href={r.url} target="_blank" rel="noopener noreferrer">
                    {r.texto} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <nav className="vx-mem-sec" aria-label="Otros expedientes">
          <h2>Seguir por los expedientes</h2>
          <div className="vx-mem-rejilla">
            {ACONTECIMIENTOS.filter((a) => a.slug !== ac.slug).map((a) => (
              <Link key={a.slug} href={`/memoria/acontecimiento/${a.slug}`} className="vx-mem-tarjeta" style={{ padding: 12, gap: 4 }}>
                <p className="vx-mem-meta">{a.volanta}</p>
                <h3 style={{ margin: 0, fontSize: 14, color: "#fafafa" }}>{a.titulo}</h3>
              </Link>
            ))}
          </div>
        </nav>

        <div className="vx-mem-pie">
          <p>
            Las piezas fijadas están comprobadas contra su fuente; las búsquedas declaradas traen lo que la institución
            publica hoy. <Link href="/memoria">Portada del archivo</Link> · <Link href="/memoria/fuentes">Fuentes y derechos</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
