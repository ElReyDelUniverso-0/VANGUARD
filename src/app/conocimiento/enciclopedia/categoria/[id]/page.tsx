// v417.0 VANGUARD KNOWLEDGE — página de categoría de la Enciclopedia.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Marco } from "@/components/planeta/marco";
import { Buscador, Migas, TarjetaArticulo } from "@/components/enciclopedia/piezas";
import {
  BASE_ENCICLOPEDIA,
  CATEGORIAS,
  RUTAS,
  articulosDeCategoria,
  categoriaDe,
  rutaArticulo,
  rutaCategoria,
  type CategoriaId,
} from "@/lib/enciclopedia/indice";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ id: c.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = categoriaDe(id);
  if (!c) return {};
  return {
    title: `${c.nombre} · Enciclopedia VANGUARD`,
    description: `${c.pregunta} ${c.descripcion}`,
    alternates: { canonical: `${SITE_URL}${rutaCategoria(c.id)}` },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const c = categoriaDe(id);
  if (!c) notFound();
  const arts = articulosDeCategoria(c.id as CategoriaId);
  const slugs = new Set(arts.map((a) => a.slug));
  const rutas = RUTAS.filter((r) => r.pasos.some((p) => slugs.has(p.slug)));
  const json = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${c.nombre} — Enciclopedia VANGUARD`,
    description: c.descripcion,
    url: `${SITE_URL}${rutaCategoria(c.id)}`,
    hasPart: arts.map((a) => ({ "@type": "Article", headline: a.titulo, url: `${SITE_URL}${rutaArticulo(a.slug)}` })),
  };
  return (
    <Marco ruta={rutaCategoria(c.id)} activo="/conocimiento" volanta="Enciclopedia · Categoría" titulo={c.nombre} sub={c.pregunta}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(json) }} />
      <Migas pasos={[{ href: "/conocimiento", label: "Conocimiento" }, { href: BASE_ENCICLOPEDIA, label: "Enciclopedia" }, { label: c.nombre }]} />
      <p style={{ color: "var(--pl-suave)", fontSize: 15, maxWidth: "70ch" }}>{c.descripcion}</p>
      <Buscador />

      <section className="vx-en-bloque" aria-labelledby="arts">
        <h2 id="arts">
          {arts.length} {arts.length === 1 ? "artículo" : "artículos"}
        </h2>
        <p className="vx-en-nota">Cada uno con fuentes, datos verificables, imágenes con licencia y fecha de revisión.</p>
        <div className="vx-pl-rejilla">
          {arts.map((a) => (
            <TarjetaArticulo key={a.slug} a={a} mostrarCategoria={false} />
          ))}
        </div>
      </section>

      {rutas.length ? (
        <section className="vx-en-bloque" aria-labelledby="rutas">
          <h2 id="rutas">Rutas que pasan por aquí</h2>
          <p className="vx-en-nota">Itinerarios de lectura que conectan esta categoría con otras.</p>
          <div className="vx-pl-rejilla">
            {rutas.map((r) => (
              <Link key={r.id} href={`${BASE_ENCICLOPEDIA}#ruta-${r.id}`} className="vx-pl-tarjeta">
                <h3>{r.titulo}</h3>
                <p>{r.pregunta}</p>
                <p className="vx-pl-meta">{r.pasos.length} paradas</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="vx-en-bloque" aria-labelledby="puertas">
        <h2 id="puertas">Profundiza con datos</h2>
        <p className="vx-en-nota">Herramientas de la casa que trabajan este mismo campo con cifras actualizadas.</p>
        <div>
          {c.puertas.map((p) => (
            <Link key={p.ruta} href={p.ruta} className="vx-pl-chip" style={{ fontSize: 13, padding: "5px 12px" }}>
              {p.etiqueta} →
            </Link>
          ))}
        </div>
      </section>

      <section className="vx-en-bloque" aria-labelledby="otras">
        <h2 id="otras">Otras categorías</h2>
        <div>
          {CATEGORIAS.filter((o) => o.id !== c.id).map((o) => (
            <Link key={o.id} href={rutaCategoria(o.id)} className="vx-pl-chip" style={{ borderColor: o.color }}>
              {o.nombre} · {articulosDeCategoria(o.id).length}
            </Link>
          ))}
        </div>
      </section>
    </Marco>
  );
}
