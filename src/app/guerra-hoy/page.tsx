import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { PlayerPing } from "@/components/vanguard/player-ping";
import { PresencePing, LiveCounter, LiveTitle } from "@/components/vanguard/presence-ping";
import { GeopoliticsRadar } from "@/components/vanguard/geopolitics-radar";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { getWorldPower, fmtUsd, fmtPersonas } from "@/lib/worldpower";
import { getEonet, haceEonet, catColor } from "@/lib/eonet";
import { getFx, fmtFx } from "@/lib/fx";

// v35 IMPACTO TOTAL — PÁGINA SEO /guerra-hoy
// La app vive en "/" (SPA cliente): poco contenido rastreable para Google.
// Esta página se renderiza EN EL SERVIDOR con noticias reales de la BD:
// Google la indexa por búsquedas tipo "guerra hoy", "noticias de guerra",
// "conflictos mundiales" y desde aquí el visitante entra al mando ("/").

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

const FALLBACK_IMGS = [
  "/assets/real/drone-1.jpg",
  "/assets/real/city-1.jpg",
  "/assets/real/ship-1.jpg",
  "/assets/real/fire-1.jpg",
  "/assets/real/jet-1.jpg",
  "/assets/real/tanks-1.jpg",
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
      db.$queryRaw<{ n: bigint | number }[]>(
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
  const { items, agents } = await getNews();
  // v44.0 PODER MUNDIAL — gasto militar y personal armado REALES (Banco Mundial)
  const power = await getWorldPower();
  // v47.0 RADAR TOTAL — eventos naturales en vivo (NASA) + divisas en crisis (FX real)
  const eonet = await getEonet();
  const fx = await getFx();

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-amber-500/30 bg-black/40 px-5 py-6 max-w-5xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.3em] text-amber-400 uppercase">
          VANGUARD · Canal abierto de inteligencia
        </p>
        <h1 className="font-orbitron text-3xl sm:text-4xl font-black mt-2 tracking-wide">
          GUERRA HOY <span className="text-red-400">· EN VIVO</span>
        </h1>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed max-w-2xl">
          Todos los conflictos del planeta, actualizados sin parar: frentes, ataques,
          diplomacia y análisis. Si el mundo hace ruido, aquí se escucha primero.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-mono">
          {/* v42: guerreros conectados AHORA (presencia real, no visitas) */}
          <LiveCounter />
          <span className="border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 rounded px-2.5 py-1">
            {agents > 0 ? `${agents.toLocaleString("es")} agentes ya dentro` : "Comunidad activa"}
          </span>
          <span className="border border-sky-300/40 bg-sky-300/10 text-sky-300 rounded px-2.5 py-1">
            {items.length} historias en seguimiento
          </span>
          <span className="border border-amber-400/40 bg-amber-400/10 text-amber-300 rounded px-2.5 py-1">
            100% gratis · sin registro
          </span>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-5 py-8 grid gap-4">
        {items.length === 0 && (
          <div className="border border-border rounded-md p-8 text-center text-sm text-zinc-400">
            El canal se está sincronizando con los frentes del mundo. Entra al mando
            mientras tanto — el mapa 3D ya está operativo.
          </div>
        )}
        {items.map((it, i) => {
          const img = it.imageUrl || FALLBACK_IMGS[i % FALLBACK_IMGS.length];
          const tag = (it.tacticalTag || "INFO").toUpperCase();
          const inner = (
            <article className="flex gap-4 border border-zinc-800 hover:border-amber-500/50 rounded-md overflow-hidden bg-zinc-900/40 transition-colors">
              {/* imagen directa (next/image no aporta aquí: dominios externos variables) */}
              <img
                src={img}
                alt={it.title}
                width={220}
                height={140}
                className="hidden sm:block object-cover w-[220px] h-[140px] shrink-0"
              />
              <div className="p-4 flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-mono text-[10px] uppercase tracking-widest border rounded px-1.5 py-0.5 ${TAG_COLOR[tag] || TAG_COLOR.INFO}`}>
                    {tag}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                    {it.source} · {hace(new Date(it.publishedAt))}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold leading-snug">{it.title}</h2>
                {it.summary && (
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{it.summary}</p>
                )}
              </div>
            </article>
          );
          return it.url && it.url !== "#" ? (
            <a key={it.id} href={it.url} target="_blank" rel="noopener noreferrer nofollow">
              {inner}
            </a>
          ) : (
            <div key={it.id}>{inner}</div>
          );
        })}
      </section>

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
