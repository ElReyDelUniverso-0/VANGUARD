import type { Metadata } from "next";
import Link from "next/link";
import { IMAGENES_REALES } from "@/lib/imagenes-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";

// v298.0 LA FOTOTECA DEL PLANETA — la capa REAL del aparato (v98 ORO
// TOTAL) gana su sala server. La «Queda» de la v297 pedía clasificación
// fina para imagenes-data (14 KB) y la medición la pagó entera: 50
// entradas, «cada entrada es una FOTO REAL descargada y servida
// localmente desde /imagenes-reales/», y la verificación contra el DISCO
// confirma que las 50 existen (11,8 MB) — REAL de pies a cabeza, cero
// ficción (la capa SIM del juego usa otras ilustraciones, declara la
// propia fuente). Sala /galeria, patrón /historia (v274) · /armeria
// (v283) · /archivo-mundial (v293) · /atlas (v294) · /verdad-cruda
// (v295) · /divisas (v296) · /poder (v297): prerenderizada ○, sin
// cliente, sin BD, indexable. Botín: las 50 fotografías con su etiqueta,
// su nota editorial y su fuente declarada verbatim, agrupadas por las 5
// categorías EN EL ORDEN DE LA FUENTE (primera aparición) con chips
// «Lugares ×19» en un solo nodo (lección v274). El visor interactivo con
// búsqueda y filtros vive en el aparato: puerta honesta declarada (el
// eco del LIVE_RATES v293, del reloj IANA v294, de la casa de cambio
// v296 y de la lectura en vivo v297).

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "GALERÍA — las 50 fotografías reales del planeta | VANGUARD",
  description:
    "La fototeca real de VANGUARD: 50 fotografías servidas localmente en 5 categorías — lugares, archivo, poder, armas y civilizaciones — cada una con su nota editorial y su fuente declarada. De la falange griega al satélite de reconocimiento, gratis y en español.",
  alternates: { canonical: `${SITE_URL}/galeria` },
};

// ── TODO derivado de la fuente, nada a mano (directiva v266, lección v256) ──
// las categorías EN EL ORDEN DE LA FUENTE (primera aparición)
const CATS: string[] = [];
for (const im of IMAGENES_REALES)
  if (!CATS.includes(im.cat)) CATS.push(im.cat);

// la fototeca completa en el orden de la fuente
const FOTOS = IMAGENES_REALES;
const PRIMERA = FOTOS[0];
const ULTIMA = FOTOS[FOTOS.length - 1];

// LA LÍNEA DE LA CASA compuesta COMPLETA en JS (lección v256): si la
// fuente cambia, la línea cambia sola.
const lineaGaleria = `La fototeca del planeta — ${FOTOS.length} fotografías reales servidas localmente en ${CATS.length} categorías, de «${PRIMERA.label}» a «${ULTIMA.label}»`;

export default function GaleriaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "GALERÍA — la fototeca real del planeta",
    description:
      "50 fotografías reales servidas localmente en 5 categorías (lugares, archivo, poder, armas y civilizaciones), cada una con su nota editorial y su fuente declarada.",
    url: `${SITE_URL}/galeria`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: FOTOS.length,
      itemListElement: FOTOS.map((im, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "ImageObject",
          name: im.label,
          contentUrl: `${SITE_URL}${im.src}`,
          caption: im.nota,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />
      <main className="min-h-screen bg-zinc-950 px-4 sm:px-5 py-10 text-zinc-200">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
            ◈ VANGUARD · LA FOTOTECA
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-100">LA FOTOTECA DEL PLANETA</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">{lineaGaleria}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Cada foto vive en el propio VANGUARD (servida desde /imagenes-reales/):
            no hay enlaces remotos ni hotlinking. El visor interactivo con búsqueda
            y filtros vive en{" "}
            <Link href="/" className="text-amber-400 underline">
              la primera página
            </Link>
            ; esta sala es el archivo completo, servido sin JavaScript.
          </p>

          {/* EL ARCHIVO POR CATEGORÍAS — en el orden de la fuente */}
          <section className="mt-10" aria-label="El archivo por categorías">
            <h2 className="text-lg font-bold text-zinc-100">EL ARCHIVO POR CATEGORÍAS</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATS.map((cat) => (
                <p
                  key={cat}
                  className="rounded-full border border-zinc-700 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-amber-400"
                >
                  {`${cat} ×${FOTOS.filter((im) => im.cat === cat).length}`}
                </p>
              ))}
            </div>
            {CATS.map((cat) => (
              <div key={cat} className="mt-6">
                <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                  {`${cat} ×${FOTOS.filter((im) => im.cat === cat).length}`}
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {FOTOS.filter((im) => im.cat === cat).map((im) => (
                    <article
                      key={im.id}
                      className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40"
                      aria-label={im.label}
                    >
                      <img
                        src={im.src}
                        alt={im.label}
                        loading="lazy"
                        className="h-44 w-full object-cover"
                      />
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-zinc-100">{im.label}</h3>
                        <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                          {im.nota}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                          fuente: {im.fuente}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <p className="mt-8 text-[11px] leading-relaxed text-zinc-600">
            Los datos viajan verbatim de la fuente (imagenes-data.ts, «IMÁGENES
            REALES (capa REAL del juego)», generada automáticamente — no se
            edita a mano): 50 fotografías descargadas y servidas localmente,
            cada una con su nota editorial original y su fuente declarada. Las
            50 fueron verificadas contra el disco en la ronda v298: todas
            existen. El visor interactivo con búsqueda y filtros vive en el
            aparato; esta sala es la memoria servida sin JavaScript.
          </p>
          <noscript>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              esta sala funciona sin JavaScript — {lineaGaleria}
            </p>
          </noscript>
        </div>
      </main>
    </>
  );
}
