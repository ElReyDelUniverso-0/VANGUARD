import type { Metadata } from "next";
import Link from "next/link";
import { VanguardMarkSvg } from "@/components/vanguard/vanguard-mark-svg";
import {
  ACHIEVEMENTS,
  CABLEADO_BLOQUES,
  DAILY_CHALLENGES,
  FRIENDS,
  MISSION_TEMPLATES,
  RANKS,
  TOURNAMENTS,
} from "@/lib/game-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { VitrinaProgreso } from "@/components/vanguard/vitrina-progreso";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

// v216.0 LOS 100 — LA VITRINA DE OBJETIVOS. Mandato del Dueño: «una lista de
// los 100 objetivos de Vanguard, fuertes, abusivos, super llamativos, con
// morbo, adictivos». El catálogo vive en game-data.ts (ACHIEVEMENTS — progreso
// REAL del store, no carteles); esta página es su vitrina pública y
// indexable: 100 tarjetas agrupadas por bloque, recompensas a la vista y el
// rey de la casa al final: EL 1% (solo cae con todos los demás, compuesto de la fuente).
//
// v235.0 EL BOTÍN — la vitrina cuenta lo que vale la caza y muestra el
// camino. La página nunca dijo cuánto vale EL BOTÍN ENTERO ni dónde se
// caza cada pieza. ① LA BALANZA DEL BOTÍN: los totales del catálogo
// (monedas, gemas, XP) y el censo por rareza salen de ACHIEVEMENTS con
// reduce/filter — CERO números escritos a mano (la prueba estática lo
// vigila). ② EL MAPA DE CAZA: puertas reales y honestas — los 100 se
// cazan en los paneles del aparato (/), y la casa tiene salas donde
// vive la materia prima (los cables en /vertigo, el planeta en /mundo,
// el frente en /ver-guerra). ③ CONECTA CON EL NÚCLEO (patrón
// v230/v233/v234) + noscript con las puertas esenciales.
//
// v267.0 EL CABLEADO DEL APARATO — desde v235 la vitrina dice «los 100
// se cazan aquí» pero nunca declaró QUÉ alimenta cada bloque: el mapa
// bloque→señal vivía escondido dentro de las funciones check/progress
// del catálogo. La directiva v266 manda: el mapa se declara EN LA
// FUENTE (CABLEADO_BLOQUES, game-data.ts — 10 bloques, 39 señales del
// estado, verificadas una a una contra los logros reales) y esta
// vitrina lo sirve: cada bloque declara «se alimenta de:» con los
// contadores reales del aparato. Cero campos inventados.
//
// v268.0 EL RITMO DE LA CASA — la vitrina contaba el botín (v235) y el
// cableado (v267) pero nunca el RITMO: MISSION_TEMPLATES (19 misiones
// vivas del aparato — 9 diarias, 5 semanales, 2 especiales y 3
// capítulos de campaña) solo vivía en el panel client-side. LA JORNADA
// lo sirve en server: censo y botín derivados con filter/reduce (cero
// cifras a mano) y los capítulos de campaña con puertas reales a las
// salas del archivo (/conflicto/ukraine, /conflicto/gaza,
// /conflicto/sudan — el conflictTag ya declarado en la fuente).
//
// v270.0 EL SEGUNDO CATÁLOGO (renumerada en vuelo: el turno paralelo tomó
// v269.0 EL MAPA DEL ARCHIVO — protocolo canon-repo, dos escritores, un
// canon) — la vitrina servía UNO de los dos
// catálogos de misiones de la casa: MISSION_TEMPLATES (la jornada,
// v268) viaja en SSR pero DAILY_CHALLENGES — los 9 retos DC-1→DC-9
// del aparato — seguía client-side, invisible para el SSR y para
// Google. EL SEGUNDO CATÁLOGO lo sirve en server: id, título,
// descripción y botín reales de la fuente, censo y meta mayor
// derivados con reduce (cero cifras a mano) y la procedencia
// declarada (directiva v266).
//
// v273.0 EL TERCER CATÁLOGO — la casa tiene TRES catálogos de competición
// y la vitrina servía dos: TOURNAMENTS — los torneos de la casa (Copa
// Estratega, Operación Tritón, Maratón Operacional) con sus tablas de
// líderes y su botín en la cima — seguía client-side, invisible para
// el SSR y para Google. EL TERCER CATÁLOGO lo sirve en server: id,
// título, categoría, métrica real, reloj del torneo y líder compuesto
// desde la tabla de la fuente; censo, botín y posiciones derivados
// con reduce (cero cifras a mano) y la procedencia declarada.

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "Los 100 Objetivos de Vanguard — ¿llegarás al 1%?",
  description:
    "100 objetivos con recompensas reales: monedas, gemas y XP. El sediento, Mano de Dios, El ojo que nunca parpadea... y EL 1%: el objetivo que solo el 1% alcanzará. Gratis, en español.",
  alternates: { canonical: `${SITE_URL}/objetivos` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/objetivos`,
    title: "Los 100 Objetivos de Vanguard — ¿llegarás al 1%?",
    description:
      "El sediento. Mano de Dios. El ojo que nunca parpadea. Y EL 1%: el objetivo que casi nadie alcanzará. Recompensas reales, gratis, en español.",
    siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    locale: "es_ES",
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "Los 100 Objetivos de Vanguard" }],
  },
  twitter: { card: "summary_large_image", title: "Los 100 Objetivos de Vanguard", description: "El sediento. Mano de Dios. EL 1%. ¿Cuántos puedes conquistar?" },
};

const BLOQUES: { key: string; titulo: string; grito: string }[] = [
  { key: "PROGRESO", titulo: "El ascenso", grito: "El planeta ya sabe tu nombre" },
  { key: "INTEL", titulo: "El sediento", grito: "La guerra corre por tus venas" },
  { key: "COMBATE", titulo: "Sin parpadear", grito: "El pulso más duro del planeta" },
  { key: "GUERRA", titulo: "La conquista", grito: "La historia se escribe con tu firma" },
  { key: "MERCADO", titulo: "El dinero", grito: "Las velas se mueven cuando respiras" },
  { key: "GANANCIAS", titulo: "El vicio", grito: "La fortuna es tu colega" },
  { key: "VIGILANCIA", titulo: "Los ojos", grito: "Nada escapa. Nada." },
  { key: "SOCIAL", titulo: "La voz", grito: "La comunidad debate lo que tú decides" },
  { key: "ESPECIAL", titulo: "La leyenda", grito: "Pocos podrán verte a los ojos" },
];

const RARITY: Record<string, string> = {
  COMUN: "text-zinc-400 border-zinc-600 bg-zinc-800/60",
  RARO: "text-cyan-hud border-cyan-hud bg-cyan-hud/10",
  EPICO: "text-violet-hud border-violet-hud bg-violet-hud/10",
  LEGENDARIO: "text-amber border-amber-hud bg-amber-hud/10",
};

// ── v235.0 EL BOTÍN — TODO derivado del catálogo, nada a mano ──
// El botín entero de la casa: la suma REAL de las recompensas de los
// 100 objetivos. Si mañana el catálogo cambia, la balanza cambia sola.
const BOTIN = ACHIEVEMENTS.reduce(
  (t, a) => ({
    monedas: t.monedas + a.coinReward,
    gemas: t.gemas + a.gemReward,
    xp: t.xp + a.xpReward,
  }),
  { monedas: 0, gemas: 0, xp: 0 },
);

// El censo por rareza: cuántas piezas de cada metal hay sobre la mesa.
const RAREZAS = ["COMUN", "RARO", "EPICO", "LEGENDARIO"] as const;
const CENSO_RAREZA = RAREZAS.map((rareza) => ({
  rareza,
  n: ACHIEVEMENTS.filter((a) => a.rarity === rareza).length,
}));

// El formato de la casa para las cifras grandes (es-ES: 26.240).
const cifra = new Intl.NumberFormat("es-ES");

// ── v267.0 EL CABLEADO — TODO derivado del mapa de la fuente, nada a mano ──
// Las señales distintas del estado (35) salen del propio CABLEADO_BLOQUES
// con Set/flatMap: si la fuente cambia, la línea cambia sola.
const SENALES = new Set(
  CABLEADO_BLOQUES.flatMap((c) => c.alimento.map((a) => a.campo)),
).size;

// La línea de la sección compuesta COMPLETA en JS (lección v256).
const lineaCableado = `El cableado del aparato — ${SENALES} señales del estado alimentan los ${CABLEADO_BLOQUES.length} bloques de la vitrina`;

// ── v268.0 EL RITMO DE LA CASA — TODO derivado de MISSION_TEMPLATES, nada a mano ──
// La vitrina contaba el botín (v235) y el cableado (v267) pero nunca el
// RITMO: la casa tiene 19 misiones vivas (9 diarias, 5 semanales, 2
// especiales y 3 capítulos de campaña) que el aparato rota cada día —
// y los capítulos llevan puertas reales a las salas del archivo
// (/conflicto/[tag]). Censo y botín salen de la fuente con filter/reduce;
// si el catálogo cambia, la jornada cambia sola.
const MISIONES = MISSION_TEMPLATES;

const RITMO_NOMBRES: Record<string, string> = {
  DAILY: "cada día",
  WEEKLY: "cada semana",
  SPECIAL: "especiales",
  STORY: "la campaña",
};

const CENSO_RITMO = ["DAILY", "WEEKLY", "SPECIAL", "STORY"].map((cat) => ({
  cat,
  n: MISIONES.filter((m) => m.category === cat).length,
  botin: MISIONES.filter((m) => m.category === cat).reduce(
    (t, m) => ({
      monedas: t.monedas + m.coinReward,
      gemas: t.gemas + m.gemReward,
      xp: t.xp + m.xpReward,
    }),
    { monedas: 0, gemas: 0, xp: 0 },
  ),
}));

const CAPITULOS = MISIONES.filter((m) => m.category === "STORY");

// La línea de la sección compuesta COMPLETA en JS (lección v256).
const lineaRitmo = `La jornada de la casa — ${MISIONES.length} misiones vivas: ${CENSO_RITMO[0].n} cada día, ${CENSO_RITMO[1].n} cada semana, ${CENSO_RITMO[2].n} especiales y ${CENSO_RITMO[3].n} capítulos de campaña`;

// ── v270.0 EL SEGUNDO CATÁLOGO — TODO derivado de DAILY_CHALLENGES, nada a mano ──
// La casa tiene DOS catálogos de misiones: MISSION_TEMPLATES (la jornada,
// v268) y DAILY_CHALLENGES — los retos DC-1→DC-9 del aparato, que solo
// vivían en el panel client-side. Botín y meta mayor salen de la fuente
// con reduce; si el catálogo cambia, el catálogo cambia solo.
const RETOS = DAILY_CHALLENGES;

const BOTIN_RETOS = RETOS.reduce(
  (t, r) => ({ xp: t.xp + r.xpReward, monedas: t.monedas + r.coinReward }),
  { xp: 0, monedas: 0 },
);

const META_MAYOR = RETOS.reduce((max, r) => (r.target > max ? r.target : max), 0);

// La línea de la sección compuesta COMPLETA en JS (lección v256).
const lineaCatalogo = `El segundo catálogo de la casa — ${RETOS.length} retos diarios con ${cifra.format(BOTIN_RETOS.xp)} XP y ${cifra.format(BOTIN_RETOS.monedas)} mon de botín, metas de 1 a ${META_MAYOR}`;

// ── v273.0 EL TERCER CATÁLOGO — TODO derivado de TOURNAMENTS, nada a mano ──
// Los torneos son la competición de la casa: cada tabla se mide con el
// contador real de su categoría. Botín de la cima, posiciones y premio
// mayor salen de la fuente con reduce; si el catálogo cambia, el censo
// cambia solo.
const TORNEOS = TOURNAMENTS;

const BOTIN_TORNEOS = TORNEOS.reduce(
  (t, x) => ({ monedas: t.monedas + x.topPrize.coins, gemas: t.gemas + x.topPrize.gems }),
  { monedas: 0, gemas: 0 },
);

const POSICIONES = TORNEOS.reduce((n, x) => n + x.leaderboard.length, 0);

// La línea de la sección compuesta COMPLETA en JS (lección v256).
const lineaTorneos = `El tercer catálogo de la casa — ${TORNEOS.length} torneos en marcha con ${cifra.format(BOTIN_TORNEOS.monedas)} mon y ${BOTIN_TORNEOS.gemas} gemas de botín en la cima, ${POSICIONES} posiciones en las tablas`;

// ── v276.0 LA ESCUADRA DE LA CASA — TODO derivado de FRIENDS + RANKS, nada a mano ──
// La vitrina sirvió el botín (v235), el cableado (v267), la jornada (v268),
// el segundo catálogo (v270) y el tercer catálogo (v273), pero la ALIANZA
// del aparato — los operadores que juegan al lado del visitante, con su
// escalafón real de 9 rangos — seguía client-side en el panel de amigos,
// invisible para el SSR y para Google. Censo, presencia y cima salen de
// la fuente con filter/Set/reduce; si la escuadra cambia, la línea cambia sola.
const ALIADOS = FRIENDS;

const EN_LINEA = ALIADOS.filter((a) => a.online).length;

const RANGOS_DISTINTOS = new Set(ALIADOS.map((a) => a.rank)).size;

const CIMA = ALIADOS.reduce((max, a) => (a.level > max.level ? a : max));

// La línea de la sección compuesta COMPLETA en JS (lección v256).
const lineaEscuadra = `La escuadra de la casa — ${ALIADOS.length} operadores aliados: ${EN_LINEA} en línea, ${RANGOS_DISTINTOS} rangos del escalafón de ${RANKS.length} y ${CIMA.alias} (nivel ${CIMA.level}) en la cima`;

// ── v235.0 EL MAPA DE CAZA — solo rutas reales de la casa ──
// La ley: los 100 objetivos se cazan en los paneles del aparato (la
// portada); las demás salas muestran la MATERIA PRIMA de la caza. Cada
// etiqueta dice la verdad sobre lo que hay detrás de la puerta.
const TERRENOS: { ruta: string; nombre: string; verdad: string }[] = [
  {
    ruta: "/",
    nombre: "EL APARATO",
    // compuesto de la fuente (lección v256): el número camina con el catálogo
    verdad: `Los ${ACHIEVEMENTS.length} se cazan aquí: niveles, rachas, informes, galería, mercado, cámaras y conquista viven en sus paneles — cada acción registra progreso de verdad.`,
  },
  {
    ruta: "/vertigo",
    nombre: "LA SALA DEL VÉRTIGO",
    verdad:
      "Los cables corren aquí 24 horas en flujo infinito — la materia prima de los objetivos del sediento.",
  },
  {
    ruta: "/mundo",
    nombre: "EL GLOBO 3D",
    verdad: "El planeta entero girando con sus frentes vivos — el mapa que la conquista cartografía.",
  },
  {
    ruta: "/ver-guerra",
    nombre: "EL MAPA DEL FRENTE",
    verdad: "El frente total, territorio por territorio — la sala donde se lee la guerra.",
  },
];

// ── v235.0 CONECTA CON EL NÚCLEO (patrón v230/v233/v234) ──
const ENLACES_NUCLEO: EnlaceContextual[] = [
  {
    etiqueta: "LA SALA DEL VÉRTIGO ▸",
    ruta: "/vertigo",
    motivo: "los cables que alimentan los objetivos del sediento, en flujo infinito",
    tipoRelacion: "visible_en",
  },
  {
    etiqueta: "EL GLOBO 3D ▸",
    ruta: "/mundo",
    motivo: "los frentes del planeta que los objetivos de la conquista cartografía",
    tipoRelacion: "visible_en",
  },
  {
    etiqueta: "LA BÚSQUEDA DEL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "busca en el archivo real que hay detrás de la vitrina",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "PRIMERA PÁGINA ▸",
    ruta: "/guerra-hoy",
    motivo: "la guerra de hoy que da contexto a cada objetivo",
    tipoRelacion: "pertenece_a",
  },
];

export default function ObjetivosPage() {
  const rey = ACHIEVEMENTS.find((a) => a.id === "ACH-LOGROS-100");
  const resto = ACHIEVEMENTS.filter((a) => a.id !== "ACH-LOGROS-100");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Los ${ACHIEVEMENTS.length} Objetivos de Vanguard`,
    description: `${ACHIEVEMENTS.length} objetivos con recompensas reales: monedas, gemas y XP. El 1% es el objetivo supremo: solo se desbloquea con los otros ${ACHIEVEMENTS.length - 1}.`,
    numberOfItems: ACHIEVEMENTS.length,
    itemListElement: ACHIEVEMENTS.slice(0, 20).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.title,
      url: `${SITE_URL}/objetivos#obj-${a.id}`,
    })),
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />

      <div className="border-b border-zinc-800 bg-zinc-900/60">
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
          >
            <VanguardMarkSvg size={18} idPrefix="obj-mark" />
            <span>VANGUARD</span>
          </Link>
          <Link
            href="/guerra-hoy"
            className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
          >
            Primera página
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-10">
        {/* HERO */}
        <header className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-300">
            La vitrina que casi nadie termina
          </div>
          <h1 className="mt-3 font-orbitron text-3xl sm:text-5xl font-black tracking-wide text-zinc-100">
            LOS <span className="text-amber">{ACHIEVEMENTS.length}</span> OBJETIVOS
          </h1>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            {ACHIEVEMENTS.length} objetivos. Recompensas reales: monedas, gemas y XP que viven en tu
            cuenta. No hay suerte aquí: cada objetivo se arranca con esfuerzo, y
            hay uno —{" "}
            <strong className="text-amber">EL 1%</strong> — que solo se desbloquea
            cuando los otros {ACHIEVEMENTS.length - 1} ya son tuyos. La pregunta es simple:{" "}
            <strong className="text-zinc-200">¿de qué lado quedarás?</strong>
          </p>
        </header>

        {/* TU PROGRESO REAL */}
        <section className="mt-8 border border-amber-500/40 bg-amber-500/5 rounded-md p-5">
          <VitrinaProgreso />
          <div className="mt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm uppercase tracking-wider rounded px-5 py-2.5 transition-colors"
            >
              Entrar y cazar objetivos →
            </Link>
          </div>
        </section>

        {/* EL REY */}
        {rey && (
          <section className="mt-8 border-2 border-amber-500/60 rounded-lg p-6 bg-gradient-to-b from-amber-500/10 to-transparent">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber">
              El objetivo supremo · Nº 100
            </div>
            <h2 className="mt-2 font-orbitron text-2xl sm:text-3xl font-black text-amber">
              {rey.title}
            </h2>
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{rey.description}</p>
            <div className="mt-3 font-mono text-[11px] text-zinc-400">
              Botín: <strong className="text-amber">+{rey.coinReward} mon◉</strong> ·{" "}
              <strong className="text-amber">+{rey.gemReward} gemas</strong> ·{" "}
              <strong className="text-amber">+{rey.xpReward} XP</strong>
            </div>
          </section>
        )}

        {/* v235.0 LA BALANZA DEL BOTÍN — lo que vale la caza entera */}
        <section
          aria-label="La balanza del botín"
          className="mt-8 border border-zinc-700 rounded-md p-5 bg-zinc-900/60"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber">
            La balanza del botín · lo que queda sobre la mesa
          </div>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Si mañana cazas los {ACHIEVEMENTS.length} objetivos, esto es TODO lo
            que cae en tu cuenta. La balanza no se declama: se suma pieza a
            pieza del catálogo real.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="border border-amber-500/40 bg-amber-500/5 rounded px-2 py-3">
              <div className="font-orbitron text-xl sm:text-2xl font-black text-amber">
                +{cifra.format(BOTIN.monedas)}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-1">
                mon◉ en total
              </div>
            </div>
            <div className="border border-zinc-700 bg-zinc-900 rounded px-2 py-3">
              <div className="font-orbitron text-xl sm:text-2xl font-black text-zinc-100">
                +{cifra.format(BOTIN.gemas)}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-1">
                gemas en total
              </div>
            </div>
            <div className="border border-zinc-700 bg-zinc-900 rounded px-2 py-3">
              <div className="font-orbitron text-xl sm:text-2xl font-black text-zinc-100">
                +{cifra.format(BOTIN.xp)}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-1">
                XP en total
              </div>
            </div>
          </div>
          {/* El censo por rareza — cuántas piezas de cada metal */}
          <div className="mt-4 flex flex-wrap gap-2">
            {CENSO_RAREZA.map(({ rareza, n }) => (
              <span
                key={rareza}
                className={`font-mono text-[10px] uppercase tracking-widest border rounded px-2 py-1 ${RARITY[rareza] || RARITY.COMUN}`}
              >
                {/* una sola cadena: el SSR pinta el censo sin nodos partidos */}
                {`${rareza} ×${n}`}
              </span>
            ))}
          </div>
        </section>

        {/* v235.0 EL MAPA DE CAZA — dónde vive cada pieza (rutas reales) */}
        <section
          aria-label="El mapa de caza"
          className="mt-8 border border-zinc-800 rounded-md p-5 bg-zinc-900/40"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-hud">
            El mapa de caza · dónde vive cada pieza
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {TERRENOS.map((t) => (
              <Link
                key={t.ruta}
                href={t.ruta}
                className="group border border-zinc-800 hover:border-amber-500/50 rounded-md p-3.5 bg-zinc-900/60 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-amber">
                    {t.nombre}
                  </h3>
                  <span className="font-mono text-[9px] text-zinc-600">{t.ruta}</span>
                </div>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{t.verdad}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* v267.0 EL CABLEADO DEL APARATO — qué señal alimenta cada bloque */}
        <section
          aria-label="El cableado del aparato"
          className="mt-8 border border-zinc-800 rounded-md p-5 bg-zinc-900/40"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-hud">
            EL CABLEADO DEL APARATO · qué alimenta cada bloque
          </div>
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
            {`${lineaCableado}. Cada señal es un contador real del aparato: por cada pareja bloque-señal existe un objetivo del catálogo que la lee de verdad. El mapa vive en la fuente (game-data.ts), no en esta vitrina.`}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CABLEADO_BLOQUES.map((c) => {
              const meta = BLOQUES.find((b) => b.key === c.bloque);
              const etiqueta = meta ? `${c.bloque} · ${meta.titulo}` : c.bloque;
              const alimento = c.alimento.map((a) => a.nombre).join(" · ");
              return (
                <article
                  key={c.bloque}
                  className="border border-zinc-800 rounded-md p-3 bg-zinc-900/60"
                >
                  <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-100">
                    {etiqueta}
                  </h3>
                  <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-cyan-hud">
                    {`se alimenta de: ${alimento}`}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* v268.0 LA JORNADA — el ritmo de la casa (misiones reales del aparato) */}
        <section
          aria-label="La jornada de la casa"
          className="mt-8 border border-zinc-800 rounded-md p-5 bg-zinc-900/40"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-300">
            LA JORNADA · el ritmo de la casa
          </div>
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
            {`${lineaRitmo}. Se caza en el aparato: cada acción del día registra progreso de verdad — cero suerte, cero carteles.`}
          </p>
          {/* el botín del ritmo — derivado del catálogo, cero cifras a mano */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {CENSO_RITMO.map((b) => {
              const lineaBotin = `+${cifra.format(b.botin.monedas)} mon◉ · +${b.botin.gemas} gemas · +${b.botin.xp} XP`;
              return (
                <div key={b.cat} className="border border-zinc-800 bg-zinc-900 rounded px-2 py-3">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                    {`${RITMO_NOMBRES[b.cat] ?? b.cat} ×${b.n}`}
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] leading-relaxed text-amber">{lineaBotin}</div>
                </div>
              );
            })}
          </div>
          {/* los capítulos de campaña — puertas reales a las salas del archivo */}
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {CAPITULOS.map((m) => (
              <article
                key={m.code}
                className="border border-zinc-800 rounded-md p-3 bg-zinc-900/60"
              >
                <h3 className="text-sm font-bold leading-snug text-zinc-100">{m.title}</h3>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{m.description}</p>
                {m.conflictTag && (
                  <Link
                    href={`/conflicto/${m.conflictTag}`}
                    className="mt-2 inline-block font-mono text-[10px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
                  >
                    {`la sala del capítulo: /conflicto/${m.conflictTag} ▸`}
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* v270.0 EL SEGUNDO CATÁLOGO — los retos diarios del aparato, en SSR */}
        <section
          aria-label="El segundo catálogo de la casa"
          className="mt-8 border border-zinc-800 rounded-md p-5 bg-zinc-900/40"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-hud">
            EL SEGUNDO CATÁLOGO · los retos de la jornada diaria
          </div>
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
            {`${lineaCatalogo}. Cada reto es un objetivo real del aparato con su meta y su botín a la vista — y el catálogo vive en la fuente (game-data.ts), no en esta vitrina.`}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {RETOS.map((r) => {
              const lineaBotinReto = `botín: +${r.xpReward} XP · +${r.coinReward} mon · meta: ${r.target}`;
              return (
                <article
                  key={r.id}
                  className="border border-zinc-800 rounded-md p-3 bg-zinc-900/60"
                >
                  <h3 className="text-sm font-bold leading-snug text-zinc-100">{`${r.id} · ${r.title}`}</h3>
                  <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{r.description}</p>
                  <div className="mt-2 font-mono text-[10px] text-amber">{lineaBotinReto}</div>
                </article>
              );
            })}
          </div>
        </section>

        {/* v273.0 EL TERCER CATÁLOGO — los torneos del aparato, en SSR */}
        <section
          aria-label="El tercer catálogo de la casa"
          className="mt-8 border border-zinc-800 rounded-md p-5 bg-zinc-900/40"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-fuchsia-400">
            EL TERCER CATÁLOGO · los torneos en marcha
          </div>
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
            {`${lineaTorneos}. El torneo es la competición de la casa: cada tabla se mide con el contador real de su categoría, el botín de la cima está a la vista — y este catálogo también vive en la fuente (game-data.ts), no en esta vitrina.`}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TORNEOS.map((t) => {
              const lider = t.leaderboard[0];
              const lineaBotinTorneo = `botín: +${t.topPrize.coins} mon · +${t.topPrize.gems} gemas`;
              const lineaLider = lider
                ? `líder: ${lider.alias} con ${cifra.format(lider.score)} puntos`
                : "tabla sin líder todavía";
              return (
                <article
                  key={t.id}
                  className="border border-zinc-800 rounded-md p-3 bg-zinc-900/60"
                >
                  <h3 className="text-sm font-bold leading-snug text-zinc-100">{`${t.id} · ${t.title}`}</h3>
                  <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{`${t.category} — ${t.metric}. Queda ${t.endsIn}.`}</p>
                  <div className="mt-2 font-mono text-[10px] text-amber">{lineaBotinTorneo}</div>
                  <div className="mt-1 font-mono text-[10px] text-cyan-hud">{lineaLider}</div>
                </article>
              );
            })}
          </div>
        </section>

        {/* v276.0 LA ESCUADRA DE LA CASA — la alianza del aparato, en SSR */}
        <section
          aria-label="La escuadra de la casa"
          className="mt-8 border border-zinc-800 rounded-md p-5 bg-zinc-900/40"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-green-hud">
            LA ESCUADRA DE LA CASA · la alianza del aparato
          </div>
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
            {`${lineaEscuadra}. La escuadra no es decoración: cada operador lleva su rango del escalafón real de la casa y sus contadores de verdad — y la sala interactiva (buscar, comparar, retar) vive en el aparato, no en esta vitrina. La escuadra vive en la fuente (game-data.ts), no aquí.`}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ALIADOS.map((a) => {
              const lineaEstado = `nivel ${a.level} · ${a.online ? "EN LÍNEA" : `visto ${a.lastActive}`}`;
              const lineaQuiz = `quiz: ${a.stats.quizCorrect} aciertos · racha: ${a.stats.streak}`;
              const lineaMisiones = `misiones reclamadas: ${a.stats.missionsClaimed}`;
              return (
                <article
                  key={a.id}
                  className="border border-zinc-800 rounded-md p-3 bg-zinc-900/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold leading-snug text-zinc-100">{a.alias}</h3>
                    <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest border border-zinc-700 rounded px-1.5 py-0.5 text-zinc-400">
                      {a.rank}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{lineaEstado}</p>
                  <div className="mt-2 font-mono text-[10px] text-amber">{lineaQuiz}</div>
                  <div className="mt-1 font-mono text-[10px] text-cyan-hud">{lineaMisiones}</div>
                </article>
              );
            })}
          </div>
        </section>

        {/* LOS BLOQUES */}
        {BLOQUES.map((b, bi) => {
          const items = resto.filter((a) => a.category === b.key);
          if (items.length === 0) return null;
          return (
            <section key={b.key} className="mt-10">
              <div className="flex items-baseline gap-3 flex-wrap border-b border-zinc-800 pb-2">
                <h2 className="font-orbitron text-lg font-black text-zinc-100">
                  {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][bi]}. {b.titulo.toUpperCase()}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  {b.grito} · {items.length} objetivos
                </span>
              </div>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {items.map((a) => (
                  <article
                    key={a.id}
                    id={`obj-${a.id}`}
                    className="border border-zinc-800 hover:border-amber-500/50 rounded-md p-3.5 bg-zinc-900/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold leading-snug text-zinc-100">{a.title}</h3>
                      <span
                        className={`shrink-0 font-mono text-[9px] uppercase tracking-widest border rounded px-1.5 py-0.5 ${RARITY[a.rarity] || RARITY.COMUN}`}
                      >
                        {a.rarity}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{a.description}</p>
                    <div className="mt-2 font-mono text-[10px] text-zinc-500">
                      +{a.coinReward} mon◉
                      {a.gemReward > 0 && <span className="text-amber"> · +{a.gemReward} gemas</span>}
                      <span> · +{a.xpReward} XP</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {/* CIERRE */}
        <section className="mt-10 border border-red-400/30 bg-red-400/5 rounded-md p-5 text-center">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Los objetivos se miden con lo que HACES dentro de la Casa: cada cable
            leído, cada territorio conquistado, cada apuesta ganada suma de
            verdad.{" "}
            <Link href="/" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
              Entra ahora
            </Link>{" "}
            — los primeros en llegar siempre se recuerdan más.
          </p>
        </section>

        {/* v235.0 CONECTA CON EL NÚCLEO (patrón v230/v233/v234) */}
        <EnlacesNucleo
          enlaces={ENLACES_NUCLEO}
          titulo="CONECTA CON EL NÚCLEO"
        />
      </div>

      {/* v235.0 noscript — la vitrina honesta sin JS: las puertas esenciales */}
      <noscript>
        <div className="border-t border-zinc-800 bg-zinc-900/80 px-5 py-8 text-center">
          <p className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-amber-400">
            <VanguardMarkSvg size={14} idPrefix="obj-ns" /> VANGUARD · LOS 100 OBJETIVOS
          </p>
          <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
            Tu progreso real vive en el aparato y necesita JavaScript. Las
            puertas de la casa siguen abiertas:
          </p>
          <p className="mt-3 flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/" className="text-amber-400 underline">
              EL APARATO
            </Link>
            <Link href="/vertigo" className="text-amber-400 underline">
              LA SALA DEL VÉRTIGO
            </Link>
            <Link href="/guerra-hoy" className="text-amber-400 underline">
              PRIMERA PÁGINA
            </Link>
          </p>
        </div>
      </noscript>
    </main>
  );
}
