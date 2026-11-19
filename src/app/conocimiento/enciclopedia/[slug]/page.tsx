// ═══════════════════════════════════════════════════════════════════
// v417.0 VANGUARD KNOWLEDGE — el artículo enciclopédico.
// Estructura exigida: título · introducción · explicación completa ·
// contexto histórico · datos relevantes (cada cifra con su nota a la
// fuente) · imágenes con licencia · fuentes · fecha de actualización ·
// temas relacionados (directos e inversos) y saltos a conceptos, países,
// organismos y civilizaciones que la casa ya documenta.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Marco } from "@/components/planeta/marco";
import { Figura, Migas, TarjetaArticulo, Credito } from "@/components/enciclopedia/piezas";
import {
  ARTICULOS,
  BASE_ENCICLOPEDIA,
  articuloDe,
  articulosDeCategoria,
  categoriaDe,
  citadoPor,
  fechaLarga,
  imagenDe,
  minutosLectura,
  palabrasDe,
  rutaArticulo,
  rutaCategoria,
} from "@/lib/enciclopedia/indice";
import { CONCEPTOS, CIVILIZACIONES } from "@/lib/conocimiento/indice";
import { organizacionDe } from "@/lib/planeta/organizaciones";
import { POR_ISO2 } from "@/lib/geo-paises";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICULOS.map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = articuloDe(slug);
  if (!a) return {};
  const img = imagenDe(a.imagenes[0]?.clave ?? "");
  const url = `${SITE_URL}${rutaArticulo(a.slug)}`;
  return {
    title: `${a.titulo} · Enciclopedia VANGUARD`,
    description: a.bajada,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: a.titulo,
      description: a.bajada,
      url,
      modifiedTime: a.actualizado,
      images: img ? [{ url: `${SITE_URL}${img.archivo}`, width: img.ancho, height: img.alto, alt: a.imagenes[0].alt }] : undefined,
    },
  };
}

function idSeccion(t: string): string {
  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const a = articuloDe(slug);
  if (!a) notFound();

  const cat = categoriaDe(a.categoria)!;
  const ruta = rutaArticulo(a.slug);
  const relacionados = a.relacionados.map(articuloDe).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const inversos = citadoPor(a.slug);
  const conceptos = (a.conceptos ?? []).map((id) => CONCEPTOS.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  const civs = (a.civilizaciones ?? []).map((id) => CIVILIZACIONES.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  const orgs = (a.organizaciones ?? []).map((k) => organizacionDe(k)).filter((o): o is NonNullable<typeof o> => Boolean(o));
  const paises = (a.paises ?? []).map((iso) => POR_ISO2.get(iso)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const hermanos = articulosDeCategoria(a.categoria);
  const pos = hermanos.findIndex((h) => h.slug === a.slug);
  const anterior = pos > 0 ? hermanos[pos - 1] : undefined;
  const siguiente = pos >= 0 && pos < hermanos.length - 1 ? hermanos[pos + 1] : undefined;

  const indice = [
    ...a.secciones.map((s) => s.titulo),
    ...(a.historia ? [a.historia.titulo] : []),
    "Temas relacionados",
    "Fuentes y bibliografía",
  ];
  const [figura1, ...otrasFiguras] = a.imagenes;
  // la segunda imagen se intercala tras la primera sección
  const figuraIntermedia = otrasFiguras[0];

  const img = imagenDe(figura1?.clave ?? "");
  const json = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.titulo,
    description: a.bajada,
    inLanguage: "es",
    dateModified: a.actualizado,
    wordCount: palabrasDe(a),
    articleSection: cat.nombre,
    keywords: a.palabrasClave.join(", "),
    author: { "@type": "Organization", name: "VANGUARD" },
    publisher: { "@type": "Organization", name: "VANGUARD" },
    mainEntityOfPage: `${SITE_URL}${ruta}`,
    image: img ? `${SITE_URL}${img.archivo}` : undefined,
    citation: a.fuentes.map((f) => ({ "@type": "CreativeWork", name: f.titulo, publisher: f.editor, url: f.url })),
    isPartOf: { "@type": "CreativeWorkSeries", name: "Enciclopedia VANGUARD", url: `${SITE_URL}${BASE_ENCICLOPEDIA}` },
  };
  const migas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Conocimiento", item: `${SITE_URL}/conocimiento` },
      { "@type": "ListItem", position: 2, name: "Enciclopedia", item: `${SITE_URL}${BASE_ENCICLOPEDIA}` },
      { "@type": "ListItem", position: 3, name: cat.nombre, item: `${SITE_URL}${rutaCategoria(cat.id)}` },
      { "@type": "ListItem", position: 4, name: a.titulo, item: `${SITE_URL}${ruta}` },
    ],
  };
  const anioRev = a.actualizado.slice(0, 4);

  return (
    <Marco ruta={ruta} activo="/conocimiento" volanta={`Enciclopedia · ${cat.nombre}`} titulo={a.titulo} sub={a.bajada}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(json) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(migas) }} />
      <Migas
        pasos={[
          { href: "/conocimiento", label: "Conocimiento" },
          { href: BASE_ENCICLOPEDIA, label: "Enciclopedia" },
          { href: rutaCategoria(cat.id), label: cat.nombre },
          { label: a.titulo },
        ]}
      />
      <div className="vx-en-meta">
        <span>
          Actualizado: <b><time dateTime={a.actualizado}>{fechaLarga(a.actualizado)}</time></b>
        </span>
        <span>{minutosLectura(a)} min de lectura</span>
        <span>
          <a href="#fuentes" style={{ color: "inherit" }}>
            {a.fuentes.length} fuentes citadas
          </a>
        </span>
        <span style={{ borderColor: cat.color, color: cat.color }}>{cat.nombre}</span>
      </div>

      <div className="vx-en-cuerpo">
        <article className="vx-en-articulo">
          {figura1 ? <Figura {...figura1} prioridad /> : null}
          <div className="vx-en-intro">
            {a.introduccion.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {a.secciones.map((s, i) => (
            <section key={s.titulo} aria-labelledby={idSeccion(s.titulo)}>
              <h2 id={idSeccion(s.titulo)}>
                {s.titulo}
                <a className="vx-en-ancla" href={`#${idSeccion(s.titulo)}`} aria-label={`Enlace a «${s.titulo}»`}>
                  #
                </a>
              </h2>
              {s.parrafos.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
              {i === 0 && figuraIntermedia ? <Figura {...figuraIntermedia} /> : null}
            </section>
          ))}

          {a.historia ? (
            <section className="vx-en-historia" aria-labelledby={idSeccion(a.historia.titulo)}>
              <h2 id={idSeccion(a.historia.titulo)}>{a.historia.titulo}</h2>
              {a.historia.parrafos.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </section>
          ) : null}

          {/* ── relaciones ─────────────────────────────────────────── */}
          <section className="vx-en-bloque" aria-labelledby="temas-relacionados">
            <h2 id="temas-relacionados">Temas relacionados</h2>
            <p className="vx-en-nota">Artículos de la enciclopedia que amplían o contrastan lo que acabas de leer.</p>
            <div className="vx-pl-rejilla">
              {relacionados.map((r) => (
                <TarjetaArticulo key={r.slug} a={r} />
              ))}
            </div>
            {inversos.length ? (
              <>
                <h3 style={{ fontSize: 15, margin: "18px 0 8px", color: "var(--pl-suave)" }}>También remiten a este artículo</h3>
                <div>
                  {inversos.map((r) => (
                    <Link key={r.slug} href={rutaArticulo(r.slug)} className="vx-pl-chip">
                      {r.titulo}
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
          </section>

          {conceptos.length || civs.length || orgs.length || paises.length ? (
            <section className="vx-en-bloque" aria-labelledby="saltos">
              <h2 id="saltos">Salta a otros conceptos</h2>
              <p className="vx-en-nota">Expedientes breves, fichas de país y organismos que la casa documenta con datos propios.</p>
              {conceptos.length ? (
                <p style={{ fontSize: 13, margin: "8px 0 4px", color: "var(--pl-tenue)" }}>Conceptos clave</p>
              ) : null}
              <div>
                {conceptos.map((c) => (
                  <Link key={c.id} href={`/conocimiento/tema/${c.id}`} className="vx-pl-chip">
                    {c.titulo}
                  </Link>
                ))}
              </div>
              {civs.length ? <p style={{ fontSize: 13, margin: "10px 0 4px", color: "var(--pl-tenue)" }}>Civilizaciones</p> : null}
              <div>
                {civs.map((c) => (
                  <Link key={c.id} href={`/conocimiento?modo=civilizaciones&q=${encodeURIComponent(c.nombre)}`} className="vx-pl-chip">
                    {c.nombre}
                  </Link>
                ))}
              </div>
              {orgs.length ? <p style={{ fontSize: 13, margin: "10px 0 4px", color: "var(--pl-tenue)" }}>Bloques y organismos</p> : null}
              <div>
                {orgs.map((o) => (
                  <Link key={o.clave} href={`/organizaciones/${o.clave}`} className="vx-pl-chip">
                    {o.sigla}
                  </Link>
                ))}
              </div>
              {paises.length ? <p style={{ fontSize: 13, margin: "10px 0 4px", color: "var(--pl-tenue)" }}>Fichas de país</p> : null}
              <div>
                {paises.map((p) => (
                  <Link key={p.iso2} href={`/mundos/${p.iso2}`} className="vx-pl-chip">
                    {p.nombre}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* ── bibliografía ───────────────────────────────────────── */}
          <section className="vx-en-bloque" aria-labelledby="fuentes">
            <h2 id="fuentes">Fuentes y bibliografía</h2>
            <p className="vx-en-nota">
              Cada cifra de la ficha remite a la fuente que la respalda. Revisión editorial: {fechaLarga(a.actualizado)}.
            </p>
            <ol className="vx-en-fuentes">
              {a.fuentes.map((f, i) => (
                <li key={f.url} id={`fuente-${i + 1}`}>
                  {f.editor}. «
                  <a href={f.url} target="_blank" rel="noopener noreferrer">
                    {f.titulo}
                  </a>
                  ».<span className="vx-en-tipo">{f.tipo}</span>
                </li>
              ))}
            </ol>
            <div className="vx-en-cita">
              <b>Cómo citar este artículo:</b> VANGUARD (
              {anioRev}). «{a.titulo}». <i>Enciclopedia VANGUARD</i>. Actualizado el {fechaLarga(a.actualizado)}.{" "}
              {SITE_URL}
              {ruta}
            </div>
            <p className="vx-en-nota" style={{ marginTop: 14 }}>
              <b>Créditos de imagen.</b> Todas las imágenes proceden de Wikimedia Commons con licencias libres o en dominio público; se
              alojan en VANGUARD con su atribución íntegra.
            </p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {a.imagenes.map((im) => (
                <li key={im.clave} style={{ fontSize: 12.5, color: "var(--pl-suave)" }}>
                  {im.pie} <Credito clave={im.clave} />
                </li>
              ))}
            </ul>
          </section>

          <nav className="vx-en-vecinos" aria-label={`Más en ${cat.nombre}`}>
            {anterior ? (
              <Link href={rutaArticulo(anterior.slug)}>
                <small>← Anterior en {cat.nombre}</small>
                {anterior.titulo}
              </Link>
            ) : null}
            {siguiente ? (
              <Link href={rutaArticulo(siguiente.slug)}>
                <small>Siguiente en {cat.nombre} →</small>
                {siguiente.titulo}
              </Link>
            ) : null}
            <Link href={rutaCategoria(cat.id)}>
              <small>Categoría</small>
              Todos los artículos de {cat.nombre}
            </Link>
          </nav>
        </article>

        {/* ── ficha lateral ──────────────────────────────────────────── */}
        <aside className="vx-en-ficha" aria-label="Ficha del artículo">
          <div className="vx-en-caja">
            <h2>Datos clave</h2>
            <dl className="vx-en-datos">
              {a.datos.map((d) => (
                <div key={d.etiqueta}>
                  <dt>{d.etiqueta}</dt>
                  <dd>
                    {d.valor}
                    <sup>
                      <a href={`#fuente-${d.fuente + 1}`} aria-label={`Fuente ${d.fuente + 1}`}>
                        [{d.fuente + 1}]
                      </a>
                    </sup>
                    {d.nota ? <small>{d.nota}</small> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="vx-en-caja">
            <h2>En este artículo</h2>
            <ol className="vx-en-indice">
              {indice.map((t) => (
                <li key={t}>
                  <a href={`#${t === "Fuentes y bibliografía" ? "fuentes" : idSeccion(t)}`}>{t}</a>
                </li>
              ))}
            </ol>
          </div>
          {a.cronologia?.length ? (
            <div className="vx-en-caja">
              <h2>Cronología</h2>
              <ol className="vx-en-crono">
                {a.cronologia.map((c) => (
                  <li key={c.fecha + c.texto}>
                    <b>{c.fecha}</b>
                    {c.texto}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          <div className="vx-en-caja">
            <h2>Palabras clave</h2>
            <div>
              {a.palabrasClave.map((k) => (
                <Link key={k} href={`${BASE_ENCICLOPEDIA}/buscar?q=${encodeURIComponent(k)}`} className="vx-pl-chip">
                  {k}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Marco>
  );
}
