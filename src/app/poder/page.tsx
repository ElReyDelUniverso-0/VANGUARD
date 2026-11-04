import type { Metadata } from "next";
import Link from "next/link";
import { PODER_FILAS, PODER_CAPTURA } from "@/lib/poder-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";

// v297.0 EL PODER MUNDIAL — la captura del Banco Mundial (v44) gana su
// sala server. La directiva de la «Queda» de la v296 era clara: worldpower
// sube SOLO si la sala acepta servir una captura con la red fuera — y el
// patrón de la captura declarada (v296) ya lo tenía. Así nace poder-data:
// los tres indicadores militares del Banco Mundial (MS.MIL.XPND.CD gasto,
// MS.MIL.TOTL.P1 personal, MS.MIL.XPND.GD.ZS % del PIB) capturados el
// 5 de noviembre de 2026 con mrnev=1 y congelados en server por
// gen-poder-data.mjs.
// Botín: 167 países con gasto registrado que suman 2,89 billones de US$,
// el ranking del dinero con su barra derivada, la fuerza (personal), el
// esfuerzo (% del PIB — Ucrania al 39,6%) y el archivo completo por las 7
// regiones del Banco Mundial EN EL ORDEN DE LA FUENTE con chips «Europa y
// Asia Central ×49» en un solo nodo (lección v274). La lectura EN VIVO con
// cache de 24 h de los mismos indicadores vive en la sala de guerra y el
// aparato: puerta honesta declarada (el eco del LIVE_RATES v293, del reloj
// IANA v294 y de la casa de cambio v296). Sala server pura (patrón
// /historia v274 · /armeria v283 · /archivo-mundial v293 · /atlas v294 ·
// /verdad-cruda v295 · /divisas v296): prerenderizada ○, sin cliente, sin
// BD, indexable para Google.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "PODER — el ranking militar real del planeta, datos del Banco Mundial | VANGUARD",
  description:
    "El archivo del poder militar de VANGUARD: 167 países con su gasto militar real en dólares, su personal de fuerzas armadas y su esfuerzo (% del PIB), captura del Banco Mundial del 5 de noviembre de 2026. El ranking del dinero, de la fuerza y del esfuerzo, gratis y en español.",
  alternates: { canonical: `${SITE_URL}/poder` },
};

// ── TODO derivado de la fuente, nada a mano (directiva v266, lección v256) ──
// el ranking ya viaja ordenado por gasto del generador; se re-deriva por si
// la fuente se regenera con otro orden
const RANKING = [...PODER_FILAS].sort((a, b) => b.gasto - a.gasto);

// las regiones EN EL ORDEN DE LA FUENTE (primera aparición en el ranking)
const REGIONES: string[] = [];
for (const f of RANKING) if (!REGIONES.includes(f.region)) REGIONES.push(f.region);

// las sumas y el líder, censados del dato (lección v292: manda el dato)
const TOTAL_GASTO = RANKING.reduce((s, f) => s + f.gasto, 0);
const LIDER = RANKING[0];
const CUOTA_LIDER = ((LIDER.gasto / TOTAL_GASTO) * 100).toLocaleString("es-ES", {
  maximumFractionDigits: 1,
});

// las cimas derivadas del dato
const TOP_PERSONAL = [...RANKING]
  .filter((f) => f.personal != null)
  .sort((a, b) => (b.personal ?? 0) - (a.personal ?? 0))
  .slice(0, 15);
const TOP_ESFUERZO = [...RANKING]
  .filter((f) => f.gdpPct != null)
  .sort((a, b) => (b.gdpPct ?? 0) - (a.gdpPct ?? 0))
  .slice(0, 15);

// reglas derivadas del fmt (es-ES): billones para lo enorme, mil M para lo
// grande, M para lo mediano; las personas en M y miles
function fmtUsd(v: number): string {
  if (v >= 1e12) return `US$ ${(v / 1e12).toLocaleString("es-ES", { maximumFractionDigits: 2 })} billones`;
  if (v >= 1e9) return `US$ ${(v / 1e9).toLocaleString("es-ES", { maximumFractionDigits: 0 })} mil M`;
  if (v >= 1e6) return `US$ ${(v / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 0 })} M`;
  return `US$ ${Math.round(v).toLocaleString("es-ES")}`;
}
function fmtPersonas(v: number): string {
  if (v >= 1e6) return `${(v / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 1 })} M`;
  if (v >= 1e3) return `${(v / 1e3).toLocaleString("es-ES", { maximumFractionDigits: 0 })} mil`;
  return `${Math.round(v).toLocaleString("es-ES")}`;
}
function fmtPct(v: number): string {
  return `${v.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

// la fecha de la captura viaja como dato de la fuente (guardia v234): el ISO
// vive en el dataset y la prosa se deriva con el locale
const fechaCaptura = new Date(`${PODER_CAPTURA.fecha}T00:00:00Z`).toLocaleDateString("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// LA LÍNEA DE LA CASA compuesta COMPLETA en JS (lección v256): si la fuente
// se regenera, la línea cambia sola.
const lineaPoder = `El poder militar del planeta — ${RANKING.length} países con gasto militar registrado que suman ${fmtUsd(TOTAL_GASTO)} en el último año con dato; ${LIDER.nombre} lidera con ${fmtUsd(LIDER.gasto)}, el ${CUOTA_LIDER}% del total de los países con dato`;

export default function PoderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "PODER — el ranking militar real del planeta",
    description:
      "167 países con su gasto militar real (Banco Mundial), su personal de fuerzas armadas y su esfuerzo (% del PIB): el ranking del dinero, de la fuerza y del esfuerzo.",
    url: `${SITE_URL}/poder`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: RANKING.length,
      itemListElement: RANKING.map((f, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${f.nombre} — ${fmtUsd(f.gasto)}`,
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
            ◈ VANGUARD · EL PODER MUNDIAL
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-100">EL PODER MUNDIAL</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">{lineaPoder}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Datos militares reales del Banco Mundial (indicadores{" "}
            {PODER_CAPTURA.indicadores.map((i) => i.split(" — ")[0]).join(" + ")}), capturados
            el {fechaCaptura}. La lectura en vivo con cache de 24 h de los mismos
            indicadores vive en{" "}
            <Link href="/guerra-hoy" className="text-amber-400 underline">
              la sala de guerra
            </Link>
            ; esta sala es el archivo completo, servido sin JavaScript.
          </p>

          {/* EL RANKING DEL DINERO — top 20 con barra derivada del líder */}
          <section className="mt-10" aria-label="El ranking del dinero">
            <h2 className="text-lg font-bold text-zinc-100">EL RANKING DEL DINERO</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Los 20 primeros presupuestos militares del planeta en dólares
              corrientes; la barra mide cada gasto contra el líder. Los 147
              restantes viven en el archivo por regiones de abajo.
            </p>
            <ol className="mt-4 space-y-2">
              {RANKING.slice(0, 20).map((f, i) => (
                <li
                  key={f.iso3}
                  className="rounded border border-zinc-800 bg-zinc-900/40 p-3"
                  aria-label={f.nombre}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold text-zinc-100">
                      <span className="mr-2 font-mono text-[10px] text-zinc-500">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {f.nombre}
                    </p>
                    <p className="font-mono text-xs text-amber-300 whitespace-nowrap">
                      {fmtUsd(f.gasto)}
                    </p>
                  </div>
                  <div className="mt-1.5 h-1 w-full rounded bg-zinc-800">
                    <div
                      className="h-1 rounded bg-amber-400/70"
                      style={{ width: `${((f.gasto / LIDER.gasto) * 100).toFixed(2)}%` }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-zinc-500">
                    {((f.gasto / TOTAL_GASTO) * 100).toLocaleString("es-ES", {
                      maximumFractionDigits: 1,
                    })}
                    % del total censado · año del dato: {f.anio}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* LA FUERZA — el personal, derivado del dato */}
          <section className="mt-10" aria-label="La fuerza">
            <h2 className="text-lg font-bold text-zinc-100">LA FUERZA</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Los 15 ejércitos más grandes del planeta por personal en servicio,
              censados del mismo indicador del Banco Mundial.
            </p>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
              {TOP_PERSONAL.map((f, i) => (
                <li
                  key={f.iso3}
                  className="flex items-baseline justify-between gap-2 rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs"
                >
                  <span className="text-zinc-200">
                    <span className="mr-2 font-mono text-[10px] text-zinc-500">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {f.nombre}
                  </span>
                  <span className="font-mono text-cyan-hud whitespace-nowrap">
                    {fmtPersonas(f.personal ?? 0)}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* EL ESFUERZO — el % del PIB, derivado del dato */}
          <section className="mt-10" aria-label="El esfuerzo">
            <h2 className="text-lg font-bold text-zinc-100">EL ESFUERZO</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Los 15 países que más de su economía dedican al gasto militar,
              según el % del PIB que registra el Banco Mundial.
            </p>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
              {TOP_ESFUERZO.map((f, i) => (
                <li
                  key={f.iso3}
                  className="flex items-baseline justify-between gap-2 rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs"
                >
                  <span className="text-zinc-200">
                    <span className="mr-2 font-mono text-[10px] text-zinc-500">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {f.nombre}
                  </span>
                  <span className="font-mono text-red-300 whitespace-nowrap">
                    {fmtPct(f.gdpPct ?? 0)}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* EL ARCHIVO POR REGIONES — en el orden de la fuente */}
          <section className="mt-10" aria-label="El archivo por regiones">
            <h2 className="text-lg font-bold text-zinc-100">EL ARCHIVO POR REGIONES</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Los {RANKING.length} países con gasto registrado, agrupados por las
              regiones del Banco Mundial en el orden en que aparecen en la
              captura.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {REGIONES.map((reg) => (
                <p
                  key={reg}
                  className="rounded-full border border-zinc-700 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-amber-400"
                >
                  {`${reg} ×${RANKING.filter((f) => f.region === reg).length}`}
                </p>
              ))}
            </div>
            {REGIONES.map((reg) => (
              <div key={reg} className="mt-6">
                <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                  {`${reg} ×${RANKING.filter((f) => f.region === reg).length}`}
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {RANKING.filter((f) => f.region === reg).map((f) => (
                    <article
                      key={f.iso3}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
                      aria-label={f.nombre}
                    >
                      <h3 className="text-sm font-semibold text-zinc-100">{f.nombre}</h3>
                      <p className="mt-1 font-mono text-[11px] text-amber-300">
                        gasto: {fmtUsd(f.gasto)}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-zinc-400">
                        personal: {f.personal != null ? fmtPersonas(f.personal) : "sin dato"} ·
                        esfuerzo: {f.gdpPct != null ? fmtPct(f.gdpPct) : "sin dato"}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                        año del dato de gasto: {f.anio}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <p className="mt-8 text-[11px] leading-relaxed text-zinc-600">
            Los datos viajan verbatim de la captura (poder-data.ts, generada con
            gen-poder-data.mjs — no se edita a mano) de la API de indicadores de
            desarrollo mundial del Banco Mundial (api.worldbank.org): gasto
            militar (MS.MIL.XPND.CD), personal de fuerzas armadas
            (MS.MIL.TOTL.P1) y gasto militar % del PIB (MS.MIL.XPND.GD.ZS), cada
            uno con el dato más reciente disponible (mrnev=1), capturados el{" "}
            {fechaCaptura}; los agregados regionales de la fuente quedan fuera y
            las sumas se censan de los países con dato. Los nombres en español y
            las regiones traducidas son mapa propio. La lectura en vivo con
            cache de 24 h vive en la sala de guerra y el aparato; esta sala es
            la memoria servida sin JavaScript.
          </p>
          <noscript>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              esta sala funciona sin JavaScript — {lineaPoder}
            </p>
          </noscript>
        </div>
      </main>
    </>
  );
}
