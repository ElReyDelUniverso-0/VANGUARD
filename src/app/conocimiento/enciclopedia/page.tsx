// ═══════════════════════════════════════════════════════════════════
// v417.0 VANGUARD KNOWLEDGE — portada de la Enciclopedia.
// Índice general: buscador temático, diez categorías, rutas de
// descubrimiento, índice alfabético y criterios editoriales.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { Marco } from "@/components/planeta/marco";
import { Buscador, Migas, TarjetaArticulo } from "@/components/enciclopedia/piezas";
import {
  ARTICULOS,
  BASE_ENCICLOPEDIA,
  CATEGORIAS,
  IMAGENES,
  RUTAS,
  ULTIMA_REVISION,
  articuloDe,
  articulosDeCategoria,
  categoriaDe,
  fechaLarga,
  imagenDe,
  palabrasDe,
  rutaArticulo,
  rutaCategoria,
} from "@/lib/enciclopedia/indice";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Enciclopedia · VANGUARD",
  description:
    "Artículos de fondo sobre continentes, países, geografía, civilizaciones, culturas, ciencia, naturaleza, organismos internacionales y recursos naturales, con fuentes, datos e imágenes con licencia.",
  alternates: { canonical: `${SITE_URL}${BASE_ENCICLOPEDIA}` },
};

const DESTACADOS = ["republica-dominicana", "mesopotamia", "selvas-tropicales", "internet"];

export default function Page() {
  const totalPalabras = ARTICULOS.reduce((s, a) => s + palabrasDe(a), 0);
  const fuentes = new Set(ARTICULOS.flatMap((a) => a.fuentes.map((f) => f.url))).size;
  const az = [...ARTICULOS].sort((x, y) => x.titulo.localeCompare(y.titulo, "es"));
  const destacados = DESTACADOS.map(articuloDe).filter((a): a is NonNullable<typeof a> => Boolean(a));
  const json = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Enciclopedia VANGUARD",
    url: `${SITE_URL}${BASE_ENCICLOPEDIA}`,
    dateModified: ULTIMA_REVISION,
    inLanguage: "es",
    hasPart: ARTICULOS.map((a) => ({ "@type": "Article", headline: a.titulo, url: `${SITE_URL}${rutaArticulo(a.slug)}` })),
  };

  return (
    <Marco
      ruta={BASE_ENCICLOPEDIA}
      activo="/conocimiento"
      volanta="Conocimiento · Enciclopedia"
      titulo="Enciclopedia VANGUARD"
      sub="Conocimiento de fondo sobre el mundo, escrito para seguir siendo útil dentro de años: cada artículo con fuentes, datos verificables, imágenes con licencia y fecha de revisión."
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(json) }} />
      <Migas pasos={[{ href: "/conocimiento", label: "Conocimiento" }, { label: "Enciclopedia" }]} />
      <Buscador />
      <div className="vx-en-cifras">
        <div>
          <b>{ARTICULOS.length}</b>
          <span>artículos de fondo</span>
        </div>
        <div>
          <b>{CATEGORIAS.length}</b>
          <span>categorías</span>
        </div>
        <div>
          <b>{Math.round(totalPalabras / 1000)} mil</b>
          <span>palabras</span>
        </div>
        <div>
          <b>{fuentes}</b>
          <span>fuentes citadas</span>
        </div>
        <div>
          <b>{Object.keys(IMAGENES).length}</b>
          <span>imágenes con licencia</span>
        </div>
      </div>
      <p className="vx-pl-h2-sub">Última revisión editorial: {fechaLarga(ULTIMA_REVISION)}.</p>

      <section className="vx-en-bloque" aria-labelledby="categorias">
        <h2 id="categorias">Explora por categorías</h2>
        <p className="vx-en-nota">Diez puertas al conocimiento del mundo, de los continentes a los recursos naturales.</p>
        <div className="vx-pl-rejilla">
          {CATEGORIAS.map((c) => {
            const arts = articulosDeCategoria(c.id);
            const img = imagenDe(arts[0]?.imagenes[0]?.clave ?? "");
            return (
              <Link key={c.id} href={rutaCategoria(c.id)} className="vx-en-tarjeta-img" style={{ borderColor: `${c.color}40` }}>
                {img ? (
                  <img src={img.archivo} alt="" width={img.ancho} height={img.alto} loading="lazy" decoding="async" />
                ) : null}
                <div>
                  <span className="vx-en-cat" style={{ color: c.color }}>
                    {arts.length} {arts.length === 1 ? "artículo" : "artículos"}
                  </span>
                  <h3>{c.nombre}</h3>
                  <p>{c.pregunta}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="vx-en-bloque" aria-labelledby="destacados">
        <h2 id="destacados">Para empezar</h2>
        <p className="vx-en-nota">Cuatro lecturas que muestran el alcance de la enciclopedia.</p>
        <div className="vx-pl-rejilla">
          {destacados.map((a) => (
            <TarjetaArticulo key={a.slug} a={a} />
          ))}
        </div>
      </section>

      <section className="vx-en-bloque" aria-labelledby="rutas">
        <h2 id="rutas">Rutas de descubrimiento</h2>
        <p className="vx-en-nota">Itinerarios guiados: cada parada explica por qué conviene leerla en ese orden.</p>
        <div className="vx-pl-rejilla" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {RUTAS.map((r) => (
            <div key={r.id} id={`ruta-${r.id}`} className="vx-en-ruta">
              <h3>{r.titulo}</h3>
              <p>{r.pregunta}</p>
              <ol>
                {r.pasos.map((p) => {
                  const a = articuloDe(p.slug);
                  return a ? (
                    <li key={p.slug}>
                      <Link href={rutaArticulo(a.slug)}>{a.titulo}</Link> — {p.porque}
                    </li>
                  ) : null;
                })}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="vx-en-bloque" aria-labelledby="az">
        <h2 id="az">Índice alfabético</h2>
        <p className="vx-en-nota">Todos los artículos, de la A a la Z.</p>
        <ul className="vx-en-az">
          {az.map((a) => (
            <li key={a.slug}>
              <Link href={rutaArticulo(a.slug)}>{a.titulo}</Link>
              <small>{categoriaDe(a.categoria)?.nombre}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="vx-en-bloque" aria-labelledby="criterios">
        <h2 id="criterios">Cómo se hace esta enciclopedia</h2>
        <div className="vx-pl-rejilla">
          <div className="vx-pl-tarjeta">
            <h3>Fuentes de referencia</h3>
            <p>
              Cada artículo se contrasta con obras de referencia —Britannica, Wikipedia, National Geographic Education— y con fuentes primarias:
              Naciones Unidas y sus agencias, institutos científicos, museos y revistas académicas.
            </p>
          </div>
          <div className="vx-pl-tarjeta">
            <h3>Cifras con su fuente</h3>
            <p>Cada dato de la ficha lateral lleva una nota que remite a la fuente concreta que lo respalda, con su año o periodo.</p>
          </div>
          <div className="vx-pl-tarjeta">
            <h3>Imágenes de uso permitido</h3>
            <p>Solo imágenes de Wikimedia Commons en dominio público o con licencias Creative Commons, alojadas aquí con autor, licencia y enlace de origen.</p>
          </div>
          <div className="vx-pl-tarjeta">
            <h3>Fecha de revisión</h3>
            <p>Cada artículo declara cuándo se revisó. Cuando una cifra depende de una convención o está en debate, el texto lo dice.</p>
          </div>
        </div>
      </section>

      <section className="vx-en-bloque" aria-labelledby="mas">
        <h2 id="mas">Más conocimiento en la casa</h2>
        <div>
          <Link href="/conocimiento" className="vx-pl-chip">Explorador de conocimiento →</Link>
          <Link href="/conocimiento/aprender" className="vx-pl-chip">Academia →</Link>
          <Link href="/conocimiento?modo=conceptos" className="vx-pl-chip">Conceptos →</Link>
          <Link href="/conocimiento?modo=cronologia" className="vx-pl-chip">Cronología →</Link>
          <Link href="/mundos" className="vx-pl-chip">Fichas de país →</Link>
          <Link href="/organizaciones" className="vx-pl-chip">Organismos →</Link>
          <Link href="/historia" className="vx-pl-chip">Historia →</Link>
        </div>
      </section>
    </Marco>
  );
}
