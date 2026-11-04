import type { Metadata } from "next";
import { HISTORICAL_WARS, WAR_BETS } from "@/lib/game-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

// v274.0 EL ARCHIVO DE LA HISTORIA — la expansión funcional módulo a
// módulo abre una puerta nueva: la casa tiene HISTORICAL_WARS (10 guerras
// reales de la Antigüedad a la Contemporánea, con años, facciones,
// desenlace, coste y significado) que solo vivía en el panel client-side
// del aparato — invisible para el SSR y para Google. Esta sala la sirve
// en server: cada guerra con SUS datos de la fuente (nada inventado, los
// nombres viajan tal como la fuente los declara), el censo por era y el
// arco de tiempo derivados con reduce (cero cifras escritas a mano,
// herencia v235/v268/v270/v273), los años negativos compuestos como
// «a. C.» desde el número real de la fuente y la duración de cada guerra
// derivada de sus años. El archivo no es decoración: es la memoria con
// la que la casa lee las guerras de hoy (las de hoy viven en /guerra-hoy
// y en /mundo — puertas honestas al final). Directiva v266: el mapa vive
// en la fuente (game-data.ts), no en esta sala. Cero fechas a mano,
// guardia v234 en pie.

// v275.0 LA TAQUILLA DEL ARCHIVO — la sala crece por dentro: la casa tiene
// WAR_BETS (8 conflictos históricos con cuota y probabilidad — ANTIGUA ×2,
// MEDIEVAL ×2, MODERNA ×1, ACTUAL ×3) que solo vivía en el panel de apuestas
// client-side del aparato (la primera página), invisible para el SSR y para
// Google. Esta sala la sirve en server (patrón v270/v273): cada conflicto
// con SUS cuotas y SU probabilidad tal como la fuente los declara (nada de
// acentos ni cifras inventadas), el censo por categoría derivado con Set +
// filter (cero cifras a mano, herencia v235/v268/v270/v273) y la línea
// compuesta COMPLETA en JS (lección v256). El vacío honesto por delante:
// la casa NO acepta apuestas — estas cuotas son su juicio retrospectivo y
// el veredicto real ya lo escribieron los libros de historia. Directiva
// v266: el mapa vive en la fuente (game-data.ts), no en esta sala. Cero
// fechas a mano, guardia v234 en pie.

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "El archivo de la historia — las guerras que enseñaron a leer las de hoy | Vanguard",
  description:
    "10 guerras reales de la Antigüedad a la Contemporánea: Guerras Púnicas, Cruzadas, Guerras Napoleónicas, las dos Guerras Mundiales, la Guerra Fría... años, facciones, desenlace y coste real. La memoria con la que Vanguard lee las guerras de hoy. Gratis, en español.",
  alternates: { canonical: `${SITE_URL}/historia` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/historia`,
    title: "El archivo de la historia — Vanguard",
    description:
      "De las Guerras Púnicas (264 a. C.) a la Guerra Fría (1991): 10 guerras con años, facciones, desenlace y coste real. La memoria que enseña a leer las de hoy.",
    siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    locale: "es_ES",
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "El archivo de la historia — Vanguard" }],
  },
  twitter: { card: "summary_large_image", title: "El archivo de la historia — Vanguard", description: "De 264 a. C. a 1991: las guerras que enseñaron a leer las de hoy." },
};

// ── TODO derivado de HISTORICAL_WARS, nada a mano ──
const GUERRAS = HISTORICAL_WARS;

// las eras del canon de la casa (el panel del aparato ya las rota
// client-side; esta sala las sirve en el orden del tiempo)
const ERA_ORDEN = ["ANTIGUA", "EDAD_MEDIA", "MODERNA", "CONTEMPORANEA"];
const ERA_NOMBRES: Record<string, string> = {
  ANTIGUA: "Antigüedad",
  EDAD_MEDIA: "Edad Media",
  MODERNA: "Edad Moderna",
  CONTEMPORANEA: "Contemporánea",
};
const ERA_CLASES: Record<string, string> = {
  ANTIGUA: "text-amber",
  EDAD_MEDIA: "text-violet-hud",
  MODERNA: "text-cyan-hud",
  CONTEMPORANEA: "text-red-hud",
};

const CENSO_ERAS = ERA_ORDEN.map((era) => ({
  era,
  n: GUERRAS.filter((g) => g.era === era).length,
}));

// el arco de tiempo derivado de los años reales de la fuente
const ANO_INICIO = GUERRAS.reduce((min, g) => (g.yearStart < min ? g.yearStart : min), 0);
const ANO_FIN = GUERRAS.reduce((max, g) => (g.yearEnd > max ? g.yearEnd : max), 0);

// el año compuesto honesto: el negativo es antes de Cristo, derivado del
// número real de la fuente (guardia v234: ninguna fecha escrita a mano)
function ano(n: number): string {
  return n < 0 ? `${-n} a. C.` : `${n}`;
}

const lineaArchivo = `El archivo de la historia — ${GUERRAS.length} guerras de ${ERA_NOMBRES[ERA_ORDEN[0]]} a ${ERA_NOMBRES[ERA_ORDEN[3]]}: de ${ano(ANO_INICIO)} a ${ano(ANO_FIN)}, la memoria con la que la casa lee las de hoy`;

// ── v275.0 LA TAQUILLA DEL ARCHIVO — TODO derivado de WAR_BETS, nada a mano ──
const APUESTAS = WAR_BETS;

// las categorías de la taquilla en el orden de la fuente (el Set preserva
// la inserción — ANTIGUA, MEDIEVAL, MODERNA, ACTUAL)
const TAQUILLA_ERAS = [...new Set(APUESTAS.map((b) => b.category))];
const censoTaquilla = TAQUILLA_ERAS.map((e) => `${e} ×${APUESTAS.filter((b) => b.category === e).length}`).join(" · ");

const lineaTaquilla = `La taquilla del archivo — ${APUESTAS.length} conflictos con cuota abierta en ${TAQUILLA_ERAS.length} categorías: el juicio retrospectivo de la casa sobre guerras que ya tienen veredicto en los libros`;

const ENLACES_NUCLEO: EnlaceContextual[] = [
  {
    etiqueta: "PRIMERA PÁGINA ▸",
    ruta: "/guerra-hoy",
    motivo: "las guerras de hoy que este archivo ayuda a leer",
    tipoRelacion: "visible_en",
  },
  {
    etiqueta: "EL GLOBO 3D ▸",
    ruta: "/mundo",
    motivo: "los teatros actuales del planeta girando en vivo",
    tipoRelacion: "visible_en",
  },
  {
    etiqueta: "LA SALA DEL VÉRTIGO ▸",
    ruta: "/vertigo",
    motivo: "el flujo infinito de cables de la agencia",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "LOS 100 OBJETIVOS ▸",
    ruta: "/objetivos",
    motivo: "la vitrina de objetivos de la casa, con botín real",
    tipoRelacion: "documenta",
  },
];

export default function HistoriaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "El archivo de la historia de Vanguard",
    description:
      "10 guerras reales de la Antigüedad a la Contemporánea con años, facciones, desenlace y coste: la memoria con la que la casa lee las guerras de hoy.",
    numberOfItems: GUERRAS.length,
    itemListElement: GUERRAS.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: g.name,
      url: `${SITE_URL}/historia#${g.id}`,
    })),
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />

      <div className="border-b border-zinc-800 bg-zinc-900/60">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber">
            EL ARCHIVO DE LA HISTORIA · la memoria de la casa
          </div>
          <h1 className="mt-3 text-2xl font-bold text-zinc-100 sm:text-3xl">
            Las guerras que enseñaron a leer las de hoy
          </h1>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            {`${lineaArchivo}.`}
          </p>
          {/* el censo por era — derivado de la fuente, cero cifras a mano */}
          <div className="mt-4 flex flex-wrap gap-2">
            {CENSO_ERAS.map((c) => (
              <span
                key={c.era}
                className="border border-zinc-700 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest bg-zinc-900"
              >
                <span className={ERA_CLASES[c.era] ?? "text-zinc-400"}>{`${ERA_NOMBRES[c.era]} ×${c.n}`}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-xs text-zinc-500 leading-relaxed">
          {`Cada guerra viaja con SUS datos de la fuente (game-data.ts): los nombres y los textos tal como la fuente los declara, los años compuestos desde los números reales — la de antes de Cristo se compone sola cuando el año es negativo. El archivo vive en la fuente, no en esta sala.`}
        </p>

        {CENSO_ERAS.map((c) => {
          const items = GUERRAS.filter((g) => g.era === c.era);
          if (items.length === 0) return null;
          return (
            <section key={c.era} className="mt-8" aria-label={ERA_NOMBRES[c.era]}>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">
                <span className={ERA_CLASES[c.era]}>{ERA_NOMBRES[c.era]}</span>
                <span className="text-zinc-600">{` · ${items.length} ${items.length === 1 ? "guerra" : "guerras"}`}</span>
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {items.map((g) => {
                  const lineaAnos = `${ano(g.yearStart)} – ${ano(g.yearEnd)}`;
                  const duracion = g.yearEnd - g.yearStart;
                  return (
                    <article
                      key={g.id}
                      id={g.id}
                      className="border border-zinc-800 rounded-md p-4 bg-zinc-900/60 scroll-mt-20"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-sm font-bold leading-snug text-zinc-100">{g.name}</h3>
                        <span className="font-mono text-[10px] text-zinc-500 whitespace-nowrap">{lineaAnos}</span>
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-zinc-500">
                        {`${g.region} · ${duracion} ${duracion === 1 ? "año" : "años"}`}
                      </p>
                      <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{g.summary}</p>
                      <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                        {`facciones: ${g.factions.join(" · ")}`}
                      </p>
                      <div className="mt-2 font-mono text-[10px] text-cyan-hud">{`desenlace: ${g.outcome}`}</div>
                      <div className="mt-1 font-mono text-[10px] text-red-hud">{`coste: ${g.casualties}`}</div>
                      <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                        {`por qué importa: ${g.significance}`}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* v275.0 LA TAQUILLA DEL ARCHIVO — el censo de WAR_BETS servido en
            server (patrón v270/v273): las cuotas de la fuente con su censo
            derivado y el vacío honesto por delante */}
        <section className="mt-12" aria-label="La taquilla del archivo">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">
            <span className="text-amber">LA TAQUILLA DEL ARCHIVO</span>
            <span className="text-zinc-600">{` · ${APUESTAS.length} conflictos con cuota`}</span>
          </h2>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{`${lineaTaquilla}.`}</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">{censoTaquilla}</p>
          <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
            La casa no acepta apuestas: estas cuotas son su juicio retrospectivo, servidas tal como la fuente las declara — el veredicto real ya lo escribieron los libros de historia. El salón interactivo de apuestas vive en el aparato (la primera página de la casa). La taquilla vive en la fuente (game-data.ts), no en esta sala.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {APUESTAS.map((b) => {
              const lineaCuotas = `cuotas: ${b.oddsA} / ${b.oddsB}`;
              const lineaProb = `la casa da ${Math.round(b.probabilityA * 100)}% a ${b.factionA}`;
              return (
                <article key={b.id} className="border border-zinc-800 rounded-md p-4 bg-zinc-900/60">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-bold leading-snug text-zinc-100">{b.warName}</h3>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{b.category}</span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-zinc-500">{`${b.factionA} vs ${b.factionB}`}</p>
                  <div className="mt-2 font-mono text-[10px] text-cyan-hud">{lineaCuotas}</div>
                  <div className="mt-1 font-mono text-[10px] text-amber">{lineaProb}</div>
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{b.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* CONECTA CON EL NÚCLEO (patrón v230/v233/v234) — puertas honestas */}
        <div className="mt-10">
          <EnlacesNucleo enlaces={ENLACES_NUCLEO} />
        </div>

        <noscript>
          <p className="mt-6 text-xs text-zinc-500 leading-relaxed">
            {`El archivo funciona sin JavaScript: las ${GUERRAS.length} guerras, sus años, su desenlace y su coste —y las ${APUESTAS.length} cuotas de la taquilla— están arriba, servidos en el HTML. Las salas en vivo (primera página, globo 3D, vértigo) piden JavaScript.`}
          </p>
        </noscript>
      </div>
    </main>
  );
}
