import type { Metadata } from "next";
import {
  AGENCIAS,
  CATEGORIA_META,
  ALIADAS,
  SENTIDOS,
  COLECCION,
} from "@/lib/agencias-data";
import { SERVICIOS, CATEGORIA_RED_META, BLOQUES } from "@/lib/agencias-mundo-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

// v281.0 LA SALA DE LOS SERVICIOS — la expansión funcional módulo a
// módulo abre una puerta nueva: la casa tiene DOS catálogos de
// inteligencia que solo vivían en paneles client-side del aparato
// (la primera página), invisibles para el SSR y para Google:
// AGENCIAS (v127, la Comunidad de Intelligence de los Estados
// Unidos — 18 agencias oficiales bajo la ODNI) y SERVICIOS (v128,
// la Red Mundial — 18 servicios extranjeros, expediente a
// expediente, nación por nación). Conocimiento abierto, presentado
// como colección: nada aquí es secreto ni ficticio, cada expediente
// viaja con SUS datos de la fuente (los nombres, los lemas, las
// misiones y las fichas tal como la fuente los declara). Los censos
// por categoría, el arco de fundación y las naciones se derivan con
// Set + filter + reduce (cero cifras escritas a mano, herencia
// v235/v268/v270/v273/v274); las líneas se componen COMPLETAS en JS
// (lección v256). El salón interactivo (buscar, pulso, mapas de la
// comunidad y de la red) vive en el aparato — puerta honesta al
// final (patrón v275/v276). Directiva v266: el mapa vive en la
// fuente (agencias-data.ts / agencias-mundo-data.ts), no en esta
// sala. Cero fechas a mano, guardia v234 en pie.
//
// v282.0 LOS SENTIDOS DE LA SALA — la segunda capa de la sala (la
// «Queda» de la v281): los TRES exports hermanos de agencias-data
// suben al server. SENTIDOS (los cinco sentidos del oficio —
// HUMINT·SIGINT·GEOINT·OSINT·FININT), ALIADAS (la sala anexa de
// las manos que actúan, FEMA) y COLECCION (las cifras derivadas
// de la colección: total, corredor, arco de fundación, post 11-S).
// Cada expediente viaja VERBATIM de la fuente (directiva v266);
// las líneas se componen COMPLETAS en JS (lección v256); cero
// cifras escritas a mano — el número de sentidos y de manos sale
// de los .length reales y las cifras de COLECCION, ya derivada
// en la fuente con Set + filter + reduce.

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "La sala de los servicios — los 36 expedientes de la inteligencia mundial | Vanguard",
  description:
    "Los 18 ojos de la Comunidad de Intelligence de los Estados Unidos (ODNI, CIA, NSA, FBI, DIA...) y los 18 servicios extranjeros del resto del planeta (MI6, Mossad, FSB, MSS...): fundación, sede, lema, misión y expediente. Conocimiento abierto presentado como colección. Gratis, en español.",
  alternates: { canonical: `${SITE_URL}/servicios` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/servicios`,
    title: "La sala de los servicios — Vanguard",
    description:
      "De la ODNI (2005) al ONI (1882): 36 expedientes reales de inteligencia — 18 agencias de la Comunidad de EE. UU. y 18 servicios extranjeros — con fundación, sede, lema, misión y fichas. Conocimiento abierto, servido en server.",
    siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    locale: "es_ES",
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "La sala de los servicios — Vanguard" }],
  },
  twitter: { card: "summary_large_image", title: "La sala de los servicios — Vanguard", description: "36 expedientes reales de inteligencia: la Comunidad de EE. UU. y la red del resto del planeta." },
};

// ── TODO derivado de las fuentes, nada a mano ──
const COMUNIDAD = AGENCIAS;
const RED = SERVICIOS;

// los censos por categoría en el ORDEN DE LA FUENTE (el Set preserva
// la inserción — la corona primero, el ministerio último; la alianza
// de los Cinco Ojos primero, el subcontinente último)
const CATS_COMUNIDAD = [...new Set(COMUNIDAD.map((a) => a.categoria))];
const CATS_RED = [...new Set(RED.map((s) => s.categoria))];

const censoComunidad = CATS_COMUNIDAD.map((c) => ({
  cat: c,
  n: COMUNIDAD.filter((a) => a.categoria === c).length,
  etiqueta: CATEGORIA_META[c].etiqueta,
  color: CATEGORIA_META[c].color,
}));

const censoRed = CATS_RED.map((c) => ({
  cat: c,
  n: RED.filter((s) => s.categoria === c).length,
  etiqueta: CATEGORIA_RED_META[c].etiqueta,
  color: CATEGORIA_RED_META[c].color,
}));

// el arco de fundación derivado de los años reales de la fuente
// (guardia v234: ninguna fecha escrita a mano; el min arranca en
// Infinity — si arrancara en 0, ningún año real bajaría de él)
const FUNDACION_MIN = [...COMUNIDAD, ...RED].reduce(
  (min, x) => (x.fundacion < min ? x.fundacion : min),
  Infinity,
);
const FUNDACION_MAX = [...COMUNIDAD, ...RED].reduce(
  (max, x) => (x.fundacion > max ? x.fundacion : max),
  0,
);

// las naciones de la red, derivadas de los países reales de la fuente
const NACIONES_RED = new Set(RED.map((s) => s.pais)).size;

// las leyendas de los bloques viven en la fuente (directiva v266)
const leyendaDe = (cat: string): string =>
  BLOQUES.find((b) => b.cat === cat)?.leyenda ?? "";

// las líneas compuestas COMPLETAS en JS (lección v256)
const lineaSala = `La sala de los servicios — ${COMUNIDAD.length + RED.length} expedientes reales de inteligencia: los ${COMUNIDAD.length} ojos de la Comunidad de EE. UU. y los ${RED.length} servicios del resto del planeta, de ${FUNDACION_MIN} a ${FUNDACION_MAX}`;
const lineaComunidad = `La comunidad — ${COMUNIDAD.length} agencias oficiales bajo la supervisión de la ODNI en ${censoComunidad.length} categorías: cada expediente cuenta su origen, su oficio y su territorio`;
const lineaRed = `La red mundial — ${RED.length} servicios extranjeros de ${NACIONES_RED} naciones en ${censoRed.length} bloques: cada uno con su bandera, su lema y su expediente`;

// ── la segunda capa (v282): sentidos, manos y cifras — TODO desde la
// fuente, nada a mano (las cifras ya viven derivadas en COLECCION) ──
const lineaSentidos = `Los sentidos del oficio — ${SENTIDOS.length} disciplinas que cruzan los expedientes: ${SENTIDOS.map((s) => s.sigla).join(" · ")}`;
const lineaManos = `La sala anexa — ${ALIADAS.length} ${ALIADAS.length === 1 ? "expediente" : "expedientes"} fuera del censo de ${COLECCION.total}: ${ALIADAS.map((a) => a.sigla).join(" · ")}`;
const lineaCifras = `La colección en cifras — ${COLECCION.total} expedientes oficiales, ${COLECCION.enCorredor} sedes en el corredor, fundada en ${COLECCION.masAntigua.fundacion} (${COLECCION.masAntigua.sigla}) y la más joven en ${COLECCION.masJoven.fundacion} (${COLECCION.masJoven.sigla}), ${COLECCION.creadasPost11S} nacidas tras el 11-S; fuera del corredor: ${COLECCION.fueraCorredor.join(" · ")}`;

const ENLACES_NUCLEO: EnlaceContextual[] = [
  {
    etiqueta: "PRIMERA PÁGINA ▸",
    ruta: "/guerra-hoy",
    motivo: "las guerras de hoy que estos servicios vigilan",
    tipoRelacion: "visible_en",
  },
  {
    etiqueta: "EL ARCHIVO DE LA HISTORIA ▸",
    ruta: "/historia",
    motivo: "las guerras del archivo que estos servicios habrían leído",
    tipoRelacion: "documenta",
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

// el número de expediente compuesto desde el num real de la fuente
const placa = (n: number): string => String(n).padStart(2, "0");

export default function ServiciosPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "La sala de los servicios de Vanguard",
    description:
      "36 expedientes reales de inteligencia: las 18 agencias de la Comunidad de los Estados Unidos y los 18 servicios extranjeros del resto del planeta, con fundación, sede, lema, misión y fichas.",
    numberOfItems: COMUNIDAD.length + RED.length,
    itemListElement: [
      ...COMUNIDAD.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${a.sigla} — ${a.nombreEs}`,
        url: `${SITE_URL}/servicios#${a.id}`,
      })),
      ...RED.map((s, i) => ({
        "@type": "ListItem",
        position: COMUNIDAD.length + i + 1,
        name: `${s.sigla} — ${s.nombreEs}`,
        url: `${SITE_URL}/servicios#${s.id}`,
      })),
    ],
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
            LA SALA DE LOS SERVICIOS · los expedientes de la casa
          </div>
          <h1 className="mt-3 text-2xl font-bold text-zinc-100 sm:text-3xl">
            Los ojos que miran el mundo
          </h1>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            {`${lineaSala}.`}
          </p>
          {/* los censos por categoría — derivados de las fuentes, cero cifras a mano */}
          <div className="mt-4 flex flex-wrap gap-2">
            {censoComunidad.map((c) => (
              <span
                key={`com-${c.cat}`}
                className="border border-zinc-700 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest bg-zinc-900"
              >
                <span style={{ color: c.color }}>{`${c.etiqueta} ×${c.n}`}</span>
              </span>
            ))}
            {censoRed.map((c) => (
              <span
                key={`red-${c.cat}`}
                className="border border-zinc-700 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest bg-zinc-900"
              >
                <span style={{ color: c.color }}>{`${c.etiqueta} ×${c.n}`}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-xs text-zinc-500 leading-relaxed">
          {`Cada expediente viaja con SUS datos de las fuentes (agencias-data.ts v127 y agencias-mundo-data.ts v128): los nombres, los lemas, las misiones y las fichas tal como la fuente los declara — nada aquí es secreto ni ficticio: es conocimiento abierto, presentado como colección. El expediente vive en la fuente, no en esta sala.`}
        </p>

        {/* ── LA COMUNIDAD (v127) — los 18 ojos de los Estados Unidos ── */}
        <section className="mt-10" aria-label="La Comunidad">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">
            <span style={{ color: CATEGORIA_META.coordinacion.color }}>LA COMUNIDAD</span>
            <span className="text-zinc-600">{` · ${COMUNIDAD.length} agencias de EE. UU.`}</span>
          </h2>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{`${lineaComunidad}.`}</p>
          {/* la colección en cifras (v282) — COLECCION ya vive derivada en la fuente */}
          <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">{`${lineaCifras}.`}</p>
          {censoComunidad.map((c) => {
            const items = COMUNIDAD.filter((a) => a.categoria === c.cat);
            if (items.length === 0) return null;
            return (
              <div key={c.cat} className="mt-6">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.25em]">
                  <span style={{ color: c.color }}>{c.etiqueta}</span>
                  <span className="text-zinc-600">{` · ${items.length} ${items.length === 1 ? "expediente" : "expedientes"}`}</span>
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {items.map((a) => (
                    <article
                      key={a.id}
                      id={a.id}
                      className="border border-zinc-800 rounded-md p-4 bg-zinc-900/60 scroll-mt-20"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-sm font-bold leading-snug text-zinc-100">
                          <span className="font-mono text-[10px] text-zinc-500">{`${placa(a.num)} · `}</span>
                          {a.sigla}
                        </h4>
                        <span className="font-mono text-[10px] text-zinc-500 whitespace-nowrap">{`fundada: ${a.fundacion}`}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-300">{a.nombreEs}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-zinc-500">{a.nombre}</p>
                      <p className="mt-1.5 font-mono text-[10px] text-zinc-500">
                        {`${a.sede} · ${a.personal}`}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">{`especialidad: ${a.especialidad}`}</p>
                      <p className="mt-1 font-mono text-[10px] text-zinc-500">
                        {`dominio: ${a.dominio.join(" · ")}`}
                      </p>
                      <div className="mt-2 font-mono text-[10px] text-cyan-hud">{a.lema}</div>
                      <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{a.mision}</p>
                      <ul className="mt-2 space-y-1">
                        {a.fichas.map((f, i) => (
                          <li key={i} className="text-xs text-zinc-500 leading-relaxed">
                            {`— ${f}`}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* ── LA RED MUNDIAL (v128) — los 18 servicios del resto del planeta ── */}
        <section className="mt-12" aria-label="La Red Mundial">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">
            <span style={{ color: CATEGORIA_RED_META.cincoOjos.color }}>LA RED MUNDIAL</span>
            <span className="text-zinc-600">{` · ${RED.length} servicios de ${NACIONES_RED} naciones`}</span>
          </h2>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{`${lineaRed}.`}</p>
          {censoRed.map((c) => {
            const items = RED.filter((s) => s.categoria === c.cat);
            if (items.length === 0) return null;
            const leyenda = leyendaDe(c.cat);
            return (
              <div key={c.cat} className="mt-6">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.25em]">
                  <span style={{ color: c.color }}>{c.etiqueta}</span>
                  <span className="text-zinc-600">{` · ${items.length} ${items.length === 1 ? "expediente" : "expedientes"}`}</span>
                </h3>
                {leyenda && (
                  <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{leyenda}</p>
                )}
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {items.map((s) => (
                    <article
                      key={s.id}
                      id={s.id}
                      className="border border-zinc-800 rounded-md p-4 bg-zinc-900/60 scroll-mt-20"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-sm font-bold leading-snug text-zinc-100">
                          <span className="font-mono text-[10px] text-zinc-500">{`${placa(s.num)} · `}</span>
                          {s.sigla}
                        </h4>
                        <span className="font-mono text-[10px] text-zinc-500 whitespace-nowrap">{`fundado: ${s.fundacion}`}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-300">{s.nombreEs}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-zinc-500">{s.nombre}</p>
                      <p className="mt-1.5 font-mono text-[10px] text-zinc-500">
                        {`${s.bandera} ${s.pais} · ${s.sede} · ${s.personal}`}
                      </p>
                      {s.linaje && (
                        <p className="mt-1 font-mono text-[10px] text-violet-hud">{`linaje: ${s.linaje}`}</p>
                      )}
                      <p className="mt-1 text-xs text-zinc-400">{`especialidad: ${s.especialidad}`}</p>
                      <p className="mt-1 font-mono text-[10px] text-zinc-500">
                        {`dominio: ${s.dominio.join(" · ")}`}
                      </p>
                      <div className="mt-2 font-mono text-[10px] text-cyan-hud">{s.lema}</div>
                      <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{s.mision}</p>
                      <ul className="mt-2 space-y-1">
                        {s.fichas.map((f, i) => (
                          <li key={i} className="text-xs text-zinc-500 leading-relaxed">
                            {`— ${f}`}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* ── LOS SENTIDOS DEL OFICIO (v282) — el censo conceptual de la fuente ── */}
        <section className="mt-12" aria-label="Los sentidos de la inteligencia">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">
            <span className="text-cyan-hud">LOS SENTIDOS DE LA INTELIGENCIA</span>
            <span className="text-zinc-600">{` · ${SENTIDOS.length} disciplinas del oficio`}</span>
          </h2>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{`${lineaSentidos}.`}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SENTIDOS.map((s) => (
              <article
                key={s.id}
                className="border border-zinc-800 rounded-md p-4 bg-zinc-900/60"
              >
                <h3 className="font-mono text-[11px] font-bold tracking-widest text-zinc-100">{s.sigla}</h3>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500">{s.nombre}</p>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{s.texto}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── LA SALA ANEXA (v282) — las manos que actúan, verbatim de la fuente ── */}
        <section className="mt-12" aria-label="La sala anexa">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">
            <span className="text-emerald-400">SALA ANEXA — LAS MANOS QUE ACTÚAN</span>
            <span className="text-zinc-600">{` · ${ALIADAS.length} ${ALIADAS.length === 1 ? "expediente" : "expedientes"} fuera del censo de ${COLECCION.total}`}</span>
          </h2>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{`${lineaManos}.`}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {ALIADAS.map((a) => (
              <article
                key={a.id}
                id={a.id}
                className="border border-zinc-800 rounded-md p-4 bg-zinc-900/60 scroll-mt-20"
              >
                <h3 className="text-sm font-bold leading-snug text-zinc-100">{a.sigla}</h3>
                <p className="mt-1 text-xs text-zinc-300">{a.nombre}</p>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{a.nota}</p>
              </article>
            ))}
          </div>
        </section>

        {/* la puerta honesta al aparato (patrón v275/v276) */}
        <p className="mt-8 text-xs text-zinc-500 leading-relaxed">
          El salón interactivo de las dos salas — el pulso en vivo, los mapas del corredor y del mundo, los arcos de la alianza — vive en el aparato (la primera página de la casa). Los expedientes viven en las fuentes (agencias-data.ts, agencias-mundo-data.ts), no en esta sala.
        </p>

        {/* CONECTA CON EL NÚCLEO (patrón v230/v233/v234) — puertas honestas */}
        <div className="mt-6">
          <EnlacesNucleo enlaces={ENLACES_NUCLEO} />
        </div>

        <noscript>
          <p className="mt-6 text-xs text-zinc-500 leading-relaxed">
            {`La sala funciona sin JavaScript: los ${COMUNIDAD.length + RED.length} expedientes —los ${COMUNIDAD.length} de la Comunidad de EE. UU. y los ${RED.length} de la red mundial, de ${NACIONES_RED} naciones— están arriba, servidos en el HTML, con su fundación, su sede, su lema, su misión y sus fichas; los ${SENTIDOS.length} sentidos del oficio y la sala anexa (${ALIADAS.map((a) => a.sigla).join(" · ")}) también viajan en el HTML. Las salas en vivo (primera página, vértigo) piden JavaScript.`}
          </p>
        </noscript>
      </div>
    </main>
  );
}
