// ═══════════════════════════════════════════════════════════════════
// v406.3 LA FICHA DE UN ARTÍCULO — /editorial/<slug>.
// Prerenderizada (generateStaticParams) con metadatos propios y JSON-LD
// Article. Muestra fuentes, fecha de revisión, hito que la condiciona,
// registro de cambios y las puertas de la casa (modernas y clásicas).
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../editorial.css";
import { CuerpoArticulo, TarjetaArticulo } from "@/components/editorial/bloques";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";
import { ARTICULOS, articulo, cuerpoDe, relacionados, minutosLectura, FECHA_ES, TIPO_ES } from "@/lib/editorial";
import { area, puertasClasicas } from "@/lib/editorial/areas";

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICULOS.map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = articulo(slug);
  if (!a) return { title: "Artículo no encontrado — Vanguard" };
  return {
    title: `${a.titulo} — Vanguard`,
    description: a.entradilla,
    alternates: { canonical: `/editorial/${a.slug}` },
    openGraph: {
      type: "article",
      title: a.titulo,
      description: a.entradilla,
      url: `/editorial/${a.slug}`,
      images: [{ url: a.imagen, width: 1408, height: 704 }],
      publishedTime: a.publicado,
      modifiedTime: a.revisado,
      section: area(a.area).nombre,
      tags: a.etiquetas,
    },
  };
}

export default async function ArticuloPage({ params }: Props) {
  const { slug } = await params;
  const a = articulo(slug);
  if (!a) notFound();
  const ar = area(a.area);
  const bloques = cuerpoDe(a);
  const rel = relacionados(a);
  const clasicas = puertasClasicas(a.salas);
  const ld = {
    "@context": "https://schema.org",
    "@type": a.tipo === "actualidad" ? "NewsArticle" : "Article",
    headline: a.titulo,
    description: a.entradilla,
    image: `${SITE_URL}${a.imagen}`,
    datePublished: a.publicado,
    dateModified: a.revisado,
    inLanguage: "es",
    articleSection: ar.nombre,
    keywords: a.etiquetas.join(", "),
    mainEntityOfPage: `${SITE_URL}/editorial/${a.slug}`,
    author: { "@type": "Organization", name: "Redacción de Vanguard", url: `${SITE_URL}/editorial` },
    publisher: { "@type": "Organization", name: "Vanguard", url: SITE_URL },
    citation: a.fuentes.map((f) => ({ "@type": "CreativeWork", name: f.nombre, url: f.url })),
  };

  return (
    <main className="vx ed" style={{ ["--ed-acento" as string]: ar.color }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(ld) }} />
      <article>
        <div className="ed-art">
          <nav className="ed-miga" aria-label="Ruta">
            <Link href="/editorial">Redacción</Link>
            <span aria-hidden="true">›</span>
            <Link href={`/editorial/area/${ar.clave}`}>{ar.nombre}</Link>
          </nav>
          <header className="ed-art-cab">
            <span className="ed-chip">{ar.nombre}</span>{" "}
            <span className="ed-tipo" data-tipo={a.tipo}>
              {TIPO_ES[a.tipo]}
            </span>
            <h1>{a.titulo}</h1>
            <p className="ed-entradilla">{a.entradilla}</p>
            <p className="ed-meta">
              <span>
                Publicado: <strong><time dateTime={a.publicado}>{FECHA_ES(a.publicado)}</time></strong>
              </span>
              <span>
                Revisado: <strong><time dateTime={a.revisado}>{FECHA_ES(a.revisado)}</time></strong>
              </span>
              <span>{minutosLectura(a)} min de lectura</span>
              <span>{a.fuentes.length} fuentes</span>
            </p>
          </header>
        </div>
        <figure className="ed-portada">
          <img src={a.imagen} alt="" width={1408} height={704} fetchPriority="high" decoding="async" />
        </figure>
        <div className="ed-art">
          <section className="ed-claves" aria-labelledby="ed-claves-t">
            <h2 id="ed-claves-t">Las claves</h2>
            <ul>
              {a.claves.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
          {a.hito && (
            <p className="ed-hito">
              <strong>Vigencia:</strong> esta pieza depende de un hito con fecha — {a.hito.que} ({FECHA_ES(a.hito.fecha)}). Se revisará
              después.
            </p>
          )}
          <CuerpoArticulo bloques={bloques} />

          <section className="ed-bloque" aria-labelledby="ed-fuentes-t">
            <h2 id="ed-fuentes-t">Fuentes</h2>
            <ol className="ed-fuentes">
              {a.fuentes.map((f) => (
                <li key={f.url + f.nombre}>
                  <a href={f.url} target="_blank" rel="noopener noreferrer">
                    {f.nombre}
                  </a>
                  <small>
                    {f.tipo === "primaria" ? "fuente primaria" : "fuente secundaria"}
                    {f.fecha ? ` · ${f.fecha}` : ""}
                  </small>
                </li>
              ))}
            </ol>
          </section>

          <section className="ed-bloque" aria-labelledby="ed-sigue-t">
            <h2 id="ed-sigue-t">Sigue en Vanguard</h2>
            <div className="ed-puertas" style={{ borderTop: 0, paddingTop: 0 }}>
              {a.enlaces.map((e) => (
                <Link key={e.href} href={e.href}>
                  {e.label}
                </Link>
              ))}
              {clasicas.map((e) => (
                <Link key={e.href} href={e.href} data-clasico="1">
                  {e.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="ed-bloque" aria-labelledby="ed-cambios-t">
            <h2 id="ed-cambios-t">Registro de cambios</h2>
            <ul className="ed-cambios">
              {a.cambios.map((c) => (
                <li key={c.fecha + c.nota}>
                  <time dateTime={c.fecha}>{c.fecha}</time>
                  {c.nota}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>

      {rel.length > 0 && (
        <section className="vx-sec" aria-labelledby="ed-rel-t">
          <div className="vx-wrap">
            <div className="vx-sec-h">
              <div>
                <span className="vx-sello">Para seguir leyendo</span>
                <h2 id="ed-rel-t">Relacionados</h2>
              </div>
              <Link href="/editorial">Toda la redacción →</Link>
            </div>
            <div className="ed-rejilla">
              {rel.map((r) => (
                <TarjetaArticulo key={r.slug} a={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
