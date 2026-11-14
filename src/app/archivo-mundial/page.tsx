import type { Metadata } from "next";
import Link from "next/link";
import {
  CURIOSITIES,
  ERAS,
  WAR_DEATHS,
  GLOBAL_CRIME,
  CARTELS,
} from "@/lib/archive-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { GraficoBarras } from "@/components/vanguard/grafico-barras";

// v293.0 EL ARCHIVO MUNDIAL — la cabeza del censo del almacén de la
// v291/v292 clasificada y pagada: archive-data (v12) es REAL de pies a
// cabeza — 44 curiosidades verídicas de la historia (perros anticarro,
// Karansebes, Chosin...), 8 eras desde la Prehistoria, 6 contadores de
// guerra con sus totales publicados, el crimen global con sus cifras
// estimadas y 8 expedientes de cartel con sus líderes reales. Solo
// vivía client-side (curiosidades-panel, counters-panel, carteles-panel).
// Sala server pura (patrón /historia v274 · /armeria v283):
// prerenderizada ○, sin cliente, sin BD, indexable para Google.
// El pulso demográfico (LIVE_RATES) no sube como contador: la tasa es
// real, el reloj que la mueve vive en el aparato — la sala declara la
// puerta honesta.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "ARCHIVO MUNDIAL — curiosidades verídicas, eras, guerras y carteles | VANGUARD",
  description:
    "El archivo mundial de VANGUARD: 44 curiosidades verídicas de la historia, las 8 eras desde la Prehistoria, los contadores de las grandes guerras, el crimen global y 8 expedientes de cartel con sus líderes. Gratis, en español.",
  alternates: { canonical: `${SITE_URL}/archivo-mundial` },
};

// ── TODO derivado de la fuente, nada a mano (directiva v266, lección v256) ──
// las categorías en el ORDEN DE LA FUENTE (primera aparición)
const CATS: string[] = [];
for (const c of CURIOSITIES) if (!CATS.includes(c.cat)) CATS.push(c.cat);

const TOTAL_FASES_GUERRA = WAR_DEATHS.length;
const lineaArchivoMundial = `El archivo mundial — ${CURIOSITIES.length} curiosidades verídicas en ${CATS.length} categorías, ${ERAS.length} eras desde ${ERAS[0].name}, ${TOTAL_FASES_GUERRA} contadores de guerra y ${CARTELS.length} expedientes de cartel, con sus líderes reales`;


// v401.3 EL COSTE EN UNA ESCALA — las mismas cifras de WAR_DEATHS, dibujadas.
// La barra más larga es la mayor de la serie (la Segunda Guerra Mundial); el
// resto se mide contra ella. Cero números escritos a mano: `valor` es el
// `total` de la fuente y el texto se formatea en el render.
const BARRAS_MUERTES = WAR_DEATHS.map((w) => ({
  etiqueta: w.name,
  valor: w.total,
  texto: `${(w.total / 1_000_000).toLocaleString("es", { maximumFractionDigits: 1 })} M`,
  nota: `${w.years} · ${w.perDay.toLocaleString("es")} muertes por día según la fuente`,
  color: w.color,
  href: "#guerras",
}));

export default function ArchivoMundialPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ARCHIVO MUNDIAL — curiosidades, eras, guerras y carteles",
    description:
      "44 curiosidades verídicas, 8 eras históricas, los contadores de las grandes guerras, el crimen global y 8 expedientes de cartel.",
    url: `${SITE_URL}/archivo-mundial`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: CURIOSITIES.length + ERAS.length + CARTELS.length,
      itemListElement: [
        ...ERAS.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.name })),
        ...CARTELS.map((c, i) => ({
          "@type": "ListItem",
          position: ERAS.length + i + 1,
          name: c.name,
        })),
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />
      <PortadaSala
        imagen="/ilustraciones/expedientes.jpg"
        alt="Cajas de archivo numeradas en un depósito con luz cenital"
        volanta="LA CASA · ARCHIVO"
        titulo="EL ARCHIVO DEL PLANETA"
        nivel="p"
        acento="#94a3b8"
        sumario="Errores de cálculo, curiosidades verificadas, muertes por guerra y crimen global: el archivo que pone número a lo que suele contarse de memoria."
        cifras={[
          { valor: CURIOSITIES.length, etiqueta: "curiosidades", nota: "verificadas" },
          { valor: ERAS.length, etiqueta: "épocas", nota: "cubiertas" },
          { valor: WAR_DEATHS.length, etiqueta: "registros", nota: "de muertes por guerra" },
          { valor: CARTELS.length, etiqueta: "cárteles", nota: "documentados" }
        ]}
        puntos={[
          { titulo: "LO QUE SE CUENTA MAL", texto:
              "Cada curiosidad viene con el dato real y su fuente; lo que se repite de memoria suele estar mal." },
          { titulo: "EL COSTE HUMANO", texto:
              "Las muertes por guerra, época por época, en una sola escala comparable." },
          { titulo: "EL CRIMEN", texto:
              "El crimen global y los cárteles documentados, con su cifra y su año." }
        ]}
        anclas={[
          { etiqueta: "las curiosidades", href: "#curiosidades" },
          { etiqueta: "las eras", href: "#epocas" },
          { etiqueta: "las guerras", href: "#guerras" }
        ]}
        nota="Portada y cifras servidas desde la propia casa: la ilustración viaja en el repositorio y cada número sale de la fuente de esta sala, calculado en el render. Cero cifras escritas a mano."
      />

      <GraficoBarras
        barras={BARRAS_MUERTES}
        unidad="muertes"
        volanta="EL ARCHIVO · EL COSTE HUMANO"
        titulo="LAS GRANDES GUERRAS, EN UNA SOLA ESCALA"
        nota={`Las ${WAR_DEATHS.length} guerras del archivo con su coste humano total, medido contra la mayor de la serie. La cifra de cada barra sale de la fuente, con su ritmo de muertes por día declarado al lado.`}
        acento="#ef4444"
        etiquetaMaximo="el mayor coste de la serie"
      />

      <main className="min-h-screen bg-zinc-950 px-4 sm:px-5 py-10 text-zinc-200">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
            ◈ VANGUARD · EL ARCHIVO MUNDIAL
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-100">EL ARCHIVO MUNDIAL</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">{lineaArchivoMundial}</p>

          {/* LAS ERAS — verbatim de la fuente */}
          <section id="epocas" className="mt-10" aria-label="Las eras de la historia">
            <h2 className="text-lg font-bold text-zinc-100">LAS ERAS DE LA HISTORIA</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {ERAS.map((e) => (
                <article
                  key={e.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                  aria-label={e.name}
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {e.period}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-zinc-100">{e.name}</h3>
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-zinc-400">
                    {e.desc}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* LOS CONTADORES DE GUERRA — los totales publicados de la fuente */}
          <section id="guerras" className="mt-10" aria-label="Los contadores de las grandes guerras">
            <h2 className="text-lg font-bold text-zinc-100">LOS CONTADORES DE LAS GRANDES GUERRAS</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {WAR_DEATHS.map((w) => (
                <article
                  key={w.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                  aria-label={w.name}
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {w.years}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-zinc-100">{w.name}</h3>
                  <p className="mt-2 font-mono text-lg font-bold text-red-hud">
                    {w.total.toLocaleString("es-ES")}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{w.note}</p>
                </article>
              ))}
            </div>
          </section>

          {/* LA CURIOSIDADES — agrupadas por categoría en el orden de la fuente */}
          <section id="curiosidades" className="mt-10" aria-label="Las curiosidades verídicas del archivo">
            <h2 className="text-lg font-bold text-zinc-100">LAS CURIOSIDADES VERÍDICAS</h2>
            {CATS.map((cat) => (
              <div key={cat} className="mt-5">
                <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
                  {`${cat} ×${CURIOSITIES.filter((c) => c.cat === cat).length}`}
                </p>
                <ul className="mt-2 space-y-2">
                  {CURIOSITIES.filter((c) => c.cat === cat).map((c) => (
                    <li
                      key={c.id}
                      className="rounded border border-zinc-800 bg-zinc-900/40 p-3 text-xs leading-relaxed text-zinc-300"
                    >
                      {c.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          {/* EL CRIMEN GLOBAL — las cifras estimadas de la fuente */}
          <section className="mt-10" aria-label="El crimen global en cifras">
            <h2 className="text-lg font-bold text-zinc-100">EL CRIMEN GLOBAL EN CIFRAS</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {GLOBAL_CRIME.map((g) => (
                <article key={g.label} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4" aria-label={g.label}>
                  <h3 className="text-sm font-semibold text-zinc-100">{g.label}</h3>
                  <p className="mt-1 font-mono text-base font-bold text-amber-400">{g.value}</p>
                  <p className="mt-1 text-[11px] text-zinc-500">{g.note}</p>
                </article>
              ))}
            </div>
          </section>

          {/* LOS CARTELES — expedientes verbatim con sus líderes reales */}
          <section id="carteles" className="mt-10" aria-label="Los expedientes de cartel">
            <h2 className="text-lg font-bold text-zinc-100">LOS EXPEDIENTES DE CARTEL</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {CARTELS.map((c) => (
                <article
                  key={c.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                  aria-label={c.name}
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {c.origin} · {c.founded}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-zinc-100">{c.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                    <span className="text-zinc-500">territorio:</span> {c.territory}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                    <span className="text-zinc-500">ingresos:</span> {c.income}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                    <span className="text-zinc-500">estructura:</span> {c.structure}
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
                    <span className="font-mono uppercase tracking-wider text-zinc-400">
                      {c.leader.name}:
                    </span>{" "}
                    {c.leader.note}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <p className="mt-8 text-[11px] leading-relaxed text-zinc-600">
            Los datos viajan verbatim de la fuente (archive-data.ts), no de esta
            sala — si el archivo crece, la sala crece sola. Los contadores vivos
            (el segundo a segundo del planeta) y los filtros viven en el aparato
            ({" "}
            <Link href="/" className="text-amber-400 underline">
              la primera página de la casa
            </Link>
            ); esta sala es la memoria servida sin JavaScript.
          </p>
          <noscript>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              esta sala funciona sin JavaScript — {lineaArchivoMundial}
            </p>
          </noscript>
        </div>
      </main>
    </>
  );
}
