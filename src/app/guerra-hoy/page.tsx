import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { TEATROS } from "@/lib/teatros";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { HubModulo } from "@/components/portada/hub-modulo";
import { TituloSeccion } from "@/components/portada/titulo-seccion";
import { Tarjeta } from "@/components/portada/tarjeta";
import { Historias } from "@/components/portada/historias";
import { obtenerNotas, relevancia, type Nota } from "@/lib/portada/notas";
import { gruposHistorias } from "@/lib/portada/frentes";
import { PlayerPing } from "@/components/vanguard/player-ping";
import { PresencePing, LiveTitle } from "@/components/vanguard/presence-ping";
import { GeopoliticsRadar } from "@/components/vanguard/geopolitics-radar";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { getWorldPower, fmtUsd, fmtPersonas } from "@/lib/worldpower";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { getEonet, haceEonet, catColor } from "@/lib/eonet";
import { getFx, fmtFx } from "@/lib/fx";
// v251.0 EL REFUGIO CON MEMORIA — el centinela deja en el aparato la copia
// del último parte que el REFUGIO (/offline) tallará si la red muere.
import { CentinelaParte } from "@/components/vanguard/centinela-parte";
// v63.0 PRIMERA PÁGINA — datos estáticos de la biblioteca (server-safe)
import { TEORIAS, ARMAS, CIVILIZACIONES, DOCS } from "@/lib/oscura-data";

// v35 IMPACTO TOTAL — PÁGINA SEO /guerra-hoy
// La app vive en "/" (SPA cliente): poco contenido rastreable para Google.
// Esta página se renderiza EN EL SERVIDOR con noticias reales de la BD:
// Google la indexa por búsquedas tipo "guerra hoy", "noticias de guerra",
// "conflictos mundiales" y desde aquí el visitante entra al mando ("/").

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

// v239.0 EL FRENTE LIGERO — la lista entera cae en fallback (24 de las 24
// últimas sin imageUrl en BD) y sus slots son de 220×140 px: las variantes
// ligeras 480w de v238 (1,2 MB de JPG → ~154 KB de WebP) visten esta sala.
// La metadata social de arriba usa /api/og — aquí no hay crawler que engañar.
const FALLBACK_IMGS = [
  "/assets/real/thumbs/drone-1.webp",
  "/assets/real/thumbs/city-1.webp",
  "/assets/real/thumbs/ship-1.webp",
  "/assets/real/thumbs/fire-1.webp",
  "/assets/real/thumbs/jet-1.webp",
  "/assets/real/thumbs/tanks-1.webp",
];

type NewsRow = {
  id: string;
  title: string;
  url: string;
  source: string;
  imageUrl: string | null;
  publishedAt: Date;
  tacticalTag: string | null;
  summary: string | null;
};

async function getNews(): Promise<{ items: NewsRow[]; agents: number }> {
  try {
    const [items, counter] = await Promise.all([
      db.newsItem.findMany({ orderBy: { publishedAt: "desc" }, take: 24 }),
      db.$queryRawUnsafe<{ n: bigint | number }[]>(
        // tabla creada por /api/visits (idempotente); puede no existir aún
        `SELECT COALESCE((SELECT n FROM site_counter WHERE k = 'total'), 0) AS n`
      ).catch(() => [{ n: 0 }] as { n: bigint | number }[]),
    ]);
    const agents = counter[0] ? Number(counter[0].n) : 0;
    return { items, agents };
  } catch {
    return { items: [], agents: 0 };
  }
}

export const metadata: Metadata = {
  title: "Guerra hoy en vivo — Últimas noticias de conflictos mundiales",
  description:
    "Todas las guerras y conflictos del mundo HOY, actualizados en vivo: ataques, diplomacia, economía de la guerra y análisis. Sigue el pulso del planeta en VANGUARD, gratis y en español.",
  alternates: { canonical: "/guerra-hoy" },
  openGraph: {
    title: "Guerra hoy en vivo · VANGUARD",
    description:
      "Los conflictos del mundo actualizados en vivo + mapa 3D militar y guerra global multijugador. Gratis, en español.",
    url: `${SITE_URL}/guerra-hoy`,
    images: ["/api/og"],
  },
};

function hace(date: Date): string {
  const mins = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} d`;
}

const TAG_COLOR: Record<string, string> = {
  ALERTA: "text-red-400 border-red-400/40 bg-red-400/10",
  DIPLOMACIA: "text-sky-300 border-sky-300/40 bg-sky-300/10",
  ECONOMIA: "text-amber-300 border-amber-300/40 bg-amber-300/10",
  HUMANITARIO: "text-emerald-300 border-emerald-300/40 bg-emerald-300/10",
  ANALISIS: "text-violet-300 border-violet-300/40 bg-violet-300/10",
  INFO: "text-zinc-300 border-zinc-300/40 bg-zinc-300/10",
};

export default async function GuerraHoyPage() {
  const { items: itemsBD, agents } = await getNews();
  // v402.0 — los cables vivos (los mismos de la portada) mandan; la base queda de respaldo
  const notas = await obtenerNotas().catch(() => [] as Nota[]);
  const notasFrente = notas.filter((n) => n.conflicto);
  const frentes = gruposHistorias(notas);
  const mediosVivos = new Set(notas.map((n) => n.fuente)).size;
  const ahoraMs = Date.now();
  const porRelevancia = (lista: Nota[]) => [...lista].sort((a, b) => relevancia(b, ahoraMs) - relevancia(a, ahoraMs));
  // solo cables de guerra; si no llegan a cinco, se completa con el resto del mundo
  const ultimas = [
    ...porRelevancia(notasFrente.filter((n) => n.imagen)),
    ...porRelevancia(notas.filter((n) => !n.conflicto && n.imagen)),
  ].slice(0, 5);
  const items: NewsRow[] = notas.length
    ? notas.slice(0, 24).map((n) => ({
        id: n.id,
        title: n.titulo,
        url: n.url,
        source: n.fuente,
        imageUrl: n.imagen,
        publishedAt: new Date(n.fecha),
        tacticalTag: null,
        summary: n.resumen,
      }))
    : itemsBD;
  // v262.0 EL CANAL QUE PESA — la señal más fresca del canal, derivada de la
  // cabeza de la muestra (los 24 más nuevos primero): cero consultas, la
  // misma gramática de la sala /en-vivo (v259) y del espejo (v256).
  // v206.0 MÁS PUERTAS — teatros con cables vivos para los chips de puerta
  // v262.0 — la MISMA groupBy, DOS medidas (el patrón del espejo v256 y el
  // puente v257): cuántos cables pesa cada teatro y CUÁNDO sonó por última
  // vez — cero roundtrips de más. Antes los chips solo decían el nombre:
  // un teatro con 173 cables y señal de hoy se veía igual que uno muerto
  // desde hace semanas.
  // v402: los chips de teatros (consulta a la base congelada) los sustituye el tablero de frentes
  // v208.0 LA LUPA — los tres servicios externos bajan EN PARALELO (antes
  // en serie: con cada uno a 9s de deadline, el peor caso regalaba 27s de
  // TTFB muerto ante Google; en paralelo el límite es el más lento, no la suma)
  const [power, eonet, fx] = await Promise.all([getWorldPower(), getEonet(), getFx()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Noticias de guerra y conflictos mundiales en vivo",
    numberOfItems: items.length,
    itemListElement: items.slice(0, 20).map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "NewsArticle",
        headline: it.title,
        datePublished: new Date(it.publishedAt).toISOString(),
        sourceOrganization: it.source,
        url: it.url && it.url !== "#" ? it.url : `${SITE_URL}/guerra-hoy`,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />

      {/* v251.0 — el centinela del parte: silencioso, escribe la copia del
          último parte en el aparato para el refugio (no pinta nada) */}
      <CentinelaParte
        parte={items.slice(0, 8).map((it) => ({
          id: it.id,
          t: it.title,
          f: it.source,
          fecha: new Date(it.publishedAt).toISOString(),
        }))}
      />

      {/* ════════════════════════════════════════════════════════════════
          v402.0 EL VESTÍBULO DE CONFLICTOS — modelo de las páginas de cobertura
          de guerra de Reuters / Al Jazeera / BBC: portada con cifras, tablero de
          frentes con briefing, lo último CON FOTO y las salas del módulo.
          Arreglos: ① los cables salen de los medios VIVOS (la base viajaba
          congelada: «hace 14 días»); ② se acabó el <a> dentro de <Link>
          (enlace dentro de enlace = error #418 de hidratación).
          ════════════════════════════════════════════════════════════════ */}
      <PortadaSala
        imagen="/ilustraciones/frentes.jpg"
        alt="Mesa de mando con un mapa de frentes iluminado en la penumbra"
        volanta="Módulo · Conflictos"
        titulo="Las guerras del planeta, hoy"
        sumario="Cada frente abierto con sus últimos cables, su foto y su fuente. Toca un frente para ver el briefing; toca una noticia para leer lo esencial en treinta segundos."
        cifras={[
          { valor: notasFrente.length, etiqueta: "Cables de guerra", nota: "últimas 72 h" },
          { valor: frentes.filter((g) => g.key !== "hoy").length, etiqueta: "Frentes con señal", nota: "con cables propios" },
          { valor: mediosVivos, etiqueta: "Medios", nota: "firmando ahora" },
          { valor: notas[0] ? hace(new Date(notas[0].fecha)) : "—", etiqueta: "Último cable", nota: notas[0]?.fuente ?? "sin señal" },
        ]}
        anclas={[
          { etiqueta: "Frentes", href: "#frentes" },
          { etiqueta: "Lo último", href: "#ultimo" },
          { etiqueta: "Las salas", href: "#salas" },
          { etiqueta: "Datos del planeta", href: "#datos" },
        ]}
        acento="#ff3b30"
      />

      <div className="vx vx-hub" id="frentes">
        <div className="vx-wrap">
          <TituloSeccion sello="Sección 01 · Tablero" titulo="Frentes activos" sub="La barra mide cuántos cables pesa cada frente en las últimas 72 horas." />
          <Historias grupos={frentes} />
        </div>
      </div>

      <div className="vx vx-hub" id="ultimo">
        <div className="vx-wrap">
          <TituloSeccion
            sello="Sección 02 · Lo último"
            titulo="Lo último de los frentes"
            sub="Solo cables de medios verificados, con su hora real."
            enlace="/en-vivo"
            textoEnlace="Minuto a minuto"
          />
          {ultimas.length === 0 ? (
            <p className="vx-cron-nota">Los medios no responden ahora mismo. Sin cables no hay titular: vuelve en unos minutos.</p>
          ) : (
            <div className="vx-bento">
              {ultimas.map((n, i) => (
                <Tarjeta key={n.id} nota={n} grande={i === 0} prioridad={i < 2} cable={i + 1} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div id="salas">
        <HubModulo modulo="conflictos" actual="/guerra-hoy" titulo="Todas las salas de Conflictos" />
      </div>

      <div id="datos" />
      {/* v44.0 PODER MUNDIAL — datos reales del Banco Mundial (server-rendered) */}
      {power && power.rows.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 pb-6">
          <div className="border border-red-400/30 rounded-md p-4">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-red-300">
              Poder militar real — quién gasta y quién moviliza
            </h2>
            <p className="mt-2 text-[11px] font-mono text-zinc-500 leading-relaxed">
              Gasto militar en dólares y personas en servicio activo, país por país,
              con los indicadores abiertos del Banco Mundial (último año disponible).
              El dinero y la gente detrás de las guerras que lees arriba.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                    <th className="py-1.5 pr-2 font-normal">País</th>
                    <th className="py-1.5 pr-2 font-normal text-right">Gasto militar</th>
                    <th className="py-1.5 pr-2 font-normal text-right">Personal armado</th>
                    <th className="py-1.5 pr-2 font-normal text-right">% del PIB</th>
                    <th className="py-1.5 font-normal text-right">Año</th>
                  </tr>
                </thead>
                <tbody>
                  {power.rows.map((row) => (
                    <tr
                      key={row.iso3}
                      className="border-b border-zinc-900 text-[12px] hover:bg-zinc-900/40"
                    >
                      <td className="py-1.5 pr-2">
                        <span className="flex items-center gap-2 min-w-0">
                          <FlagBadge code={row.iso2 || "??"} />
                          <span className="font-bold text-zinc-200 truncate max-w-[140px]">
                            {row.name}
                          </span>
                        </span>
                      </td>
                      <td className="py-1.5 pr-2 text-right font-mono text-amber-300 whitespace-nowrap">
                        {fmtUsd(row.spending)}
                      </td>
                      <td className="py-1.5 pr-2 text-right font-mono text-zinc-300 whitespace-nowrap">
                        {fmtPersonas(row.personnel)}
                      </td>
                      <td className="py-1.5 pr-2 text-right font-mono text-zinc-400 whitespace-nowrap">
                        {row.gdpPct != null ? `${row.gdpPct.toFixed(1)}%` : "—"}
                      </td>
                      <td className="py-1.5 text-right font-mono text-[10px] text-zinc-600">
                        {row.year ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 font-mono text-[9px] text-zinc-600">
              Fuente: Banco Mundial · MS.MIL.XPND.CD + MS.MIL.TOTL.P1 + MS.MIL.XPND.GD.ZS
            </p>
          </div>
        </section>
      )}

      {/* v47.0 RADAR TOTAL — eventos naturales EN VIVO de la NASA (EONET) */}
      {eonet && eonet.rows.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 pb-6">
          <div className="border border-orange-400/30 rounded-md p-4">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-orange-300">
              El planeta en llamas — eventos naturales en vivo
            </h2>
            <p className="mt-2 text-[11px] font-mono text-zinc-500 leading-relaxed">
              Volcanes, incendios, tormentas, inundaciones y sismos activos ahora
              mismo, con coordenadas y hora del último avistamiento. Fuente de
              satélites abierta de la NASA.
            </p>
            <ul className="mt-3 grid gap-1.5">
              {eonet.rows.map((ev) => (
                <li key={ev.id}>
                  <a
                    href={ev.link}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center gap-2.5 rounded border border-transparent px-2 py-1.5 text-[12px] hover:border-orange-400/40 hover:bg-zinc-900/40 transition-colors"
                  >
                    <span className={`shrink-0 font-mono text-[9px] uppercase tracking-widest border rounded px-1.5 py-0.5 ${catColor(ev.catEs)}`}>
                      {ev.catEs}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-zinc-200">{ev.title}</span>
                    <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                      {haceEonet(ev.date)}{ev.lat != null && ev.lng != null ? ` · ${ev.lat.toFixed(1)}, ${ev.lng.toFixed(1)}` : ""}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-2 font-mono text-[9px] text-zinc-600">
              Fuente: NASA EONET v3 · eventos abiertos de los últimos 30 días
            </p>
          </div>
        </section>
      )}

      {/* v47.0 RADAR TOTAL — divisas en crisis con cambio REAL (open.er-api.com) */}
      {fx && fx.rows.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 pb-6">
          <div className="border border-emerald-400/30 rounded-md p-4">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-emerald-300">
              Divisas en crisis — cuánto vale el dinero donde estalla la guerra
            </h2>
            <p className="mt-2 text-[11px] font-mono text-zinc-500 leading-relaxed">
              Tipo de cambio real contra el dólar, actualizado a diario. Las
              monedas de los países en conflicto, sancionados o en crisis son el
              termómetro silencioso de cada guerra.
            </p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {fx.rows.map((r) => (
                <div key={r.code} className="rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FlagBadge code={r.flag} />
                    <span className="text-[12px] font-bold text-zinc-200 truncate">{r.name}</span>
                  </div>
                  <p className="mt-1 font-mono text-[13px] text-emerald-300 whitespace-nowrap">
                    1 US$ = {fmtFx(r.perUsd)} <span className="text-[10px] text-zinc-500">{r.code}</span>
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-2 font-mono text-[9px] text-zinc-600">
              Fuente: open.er-api.com · {fx.rows.length} monedas de países en crisis · base USD
            </p>
          </div>
        </section>
      )}

      {/* v63.0 PRIMERA PÁGINA — LA BIBLIOTECA OSCURA en texto SSR: contenido
          real e indexable (43 entradas con veredicto y fuentes desclasificadas).
          Google indexa esta página por long-tail: "MK-ULTRA", "Tartessos",
          "documento GATEWAY CIA", etc. Cada entrada enlaza al mando. */}
      <section className="max-w-5xl mx-auto px-5 pb-6">
        <div className="border border-red-500/30 rounded-md p-4">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-red-400">
            La Biblioteca Oscura — 43 secretos con veredicto real, no leyendas sin etiqueta
          </h2>
          <p className="mt-2 text-[11px] font-mono text-zinc-500 leading-relaxed">
            Teorías con veredicto MITO/REAL/PARCIAL, las ideas que crearon las
            armas y civilizaciones que desaparecieron — cada entrada abre su
            documento desclasificado original (CIA, FBI, NSA, NARA). Dentro del
            juego, cada lectura paga y la biblioteca completa otorga el rango
            «Ojo que todo lo lee».
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TEORIAS.map((t) => (
              <div key={t.id} className="rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-[9px] uppercase tracking-widest rounded px-1.5 py-0.5 border ${
                    t.veredicto === "REAL" ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
                    : t.veredicto === "MITO" ? "text-red-400 border-red-500/40 bg-red-500/10"
                    : "text-amber-400 border-amber-500/40 bg-amber-500/10"}`}>
                    {t.veredicto}
                  </span>
                  <span className="text-[12px] font-bold text-zinc-200 truncate">{t.titulo}</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">{t.realidad}</p>
                <p className="mt-1 font-mono text-[9px] text-zinc-600">Fuente: {t.fuente}</p>
              </div>
            ))}
            {ARMAS.map((a) => (
              <div key={a.id} className="rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest rounded px-1.5 py-0.5 border text-orange-400 border-orange-500/40 bg-orange-500/10">
                    Arma-idea
                  </span>
                  <span className="text-[12px] font-bold text-zinc-200 truncate">{a.titulo}</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">{a.legado}</p>
                <p className="mt-1 font-mono text-[9px] text-zinc-600">{a.epoca} · Fuente: {a.fuente}</p>
              </div>
            ))}
            {CIVILIZACIONES.map((c) => (
              <div key={c.id} className="rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest rounded px-1.5 py-0.5 border text-sky-400 border-sky-500/40 bg-sky-500/10">
                    Civilización perdida
                  </span>
                  <span className="text-[12px] font-bold text-zinc-200 truncate">{c.titulo}</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">{c.misterio}</p>
                <p className="mt-1 font-mono text-[9px] text-zinc-600">{c.epoca} · Fuente: {c.fuente}</p>
              </div>
            ))}
            {DOCS.map((d) => (
              <div key={d.id} className="rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest rounded px-1.5 py-0.5 border text-violet-400 border-violet-500/40 bg-violet-500/10">
                    Documento real
                  </span>
                  <span className="text-[12px] font-bold text-zinc-200 truncate">{d.titulo}</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">{d.desc}</p>
                <p className="mt-1 font-mono text-[9px] text-zinc-600">{d.tag} · {d.fuente}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 font-mono text-[9px] text-zinc-600">
            {TEORIAS.length} teorías · {ARMAS.length} armas-idea · {CIVILIZACIONES.length} civilizaciones · {DOCS.length} documentos desclasificados — se leen gratis dentro de VANGUARD
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 pb-14">
        <div className="border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent rounded-lg p-7 text-center">
          <h2 className="font-orbitron text-xl sm:text-2xl font-black tracking-wide text-amber-300">
            ¿SOLO LEER? ENTRA AL MANDO
          </h2>
          <p className="mt-2 text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            En VANGUARD no solo ves la guerra: la juegas. Mapa 3D militar en vivo,
            guerra global multijugador por rondas, duelos con ranking ELO y misiones
            diarias. Gratis, sin instalar nada.
          </p>
          <Link
            href="/"
            className="inline-block mt-5 bg-amber-400 hover:bg-amber-300 text-black font-black font-mono uppercase tracking-widest text-sm rounded px-8 py-3.5 transition-colors"
          >
            Entrar al mando ahora →
          </Link>
          <p className="mt-3 text-[11px] text-zinc-500 font-mono">
            8 idiomas · PWA instalable · comunidad global
          </p>
        </div>
      </section>
      {/* v43.0 RADAR GEOPOLÍTICO GLOBAL: GDELT (100k medios) + GDACS (UE) */}
      <GeopoliticsRadar />
      {/* v39.1: el visitante cuenta como jugador sin esperar al socket */}
      <PlayerPing />
      {/* v42: latido de presencia EN VIVO + auto-idioma */}
      <PresencePing />
      {/* v42.3: título de pestaña EN VIVO */}
      <LiveTitle />
    </main>
  );
}
