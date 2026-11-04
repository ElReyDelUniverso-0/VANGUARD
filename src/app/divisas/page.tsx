import type { Metadata } from "next";
import Link from "next/link";
import { WORLD_CURRENCIES_FULL } from "@/lib/world-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";

// v296.0 LAS DIVISAS DEL PLANETA — el almacén menor sigue pagando: el
// censo de la «Queda» de la v295 destapó la veta mayor que dormía desde
// la v20: world-data (46,7 KB), «DATASET MUNDIAL REAL: 251 países y
// territorios con nombre en español, bandera real (flagcdn) y moneda
// oficial con tasa de cambio (fuente: open.er-api.com, captura del
// 9 de septiembre de 2026)», generado por gen-world-data.mjs, SIN
// "use client", consumido en server SOLO por una ruta API y como cifra
// (countryName) mientras su plato completo viaja en el panel divisas
// del aparato. La sala levanta el archivo: 247 países y territorios con
// su moneda oficial real (código ISO 4217, nombre en español, símbolo y
// tasa por 1 USD), agrupados por región EN EL ORDEN DE LA FUENTE con
// chips «Asia ×50» en un solo nodo; 154 monedas únicas censadas de la
// propia fuente y las monedas COMPARTIDAS derivadas del dato (el euro
// sirve a 37 países, el dólar a 16). La tasa es la CAPTURA que la
// propia fuente declara — la operativa en vivo (simulada, monedas
// VANGUARD) y las banderas reales viven en el aparato: puerta honesta
// declarada (el eco del LIVE_RATES v293 y del reloj IANA v294). Sala
// server pura (patrón /historia v274 · /armeria v283 · /archivo-mundial
// v293 · /atlas v294 · /verdad-cruda v295): prerenderizada ○, sin
// cliente, sin BD, indexable para Google.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "DIVISAS — las 247 monedas oficiales del planeta con su tasa real | VANGUARD",
  description:
    "El archivo de las divisas de VANGUARD: 247 países y territorios con su moneda oficial real (código ISO 4217, nombre en español, símbolo y tasa por 1 dólar), 154 monedas únicas y las monedas compartidas — el euro sirve a 37 países. Gratis, en español.",
  alternates: { canonical: `${SITE_URL}/divisas` },
};

// ── TODO derivado de la fuente, nada a mano (directiva v266, lección v256) ──
// las regiones en el ORDEN DE LA FUENTE (primera aparición)
const REGIONES: string[] = [];
for (const c of WORLD_CURRENCIES_FULL)
  if (!REGIONES.includes(c.region)) REGIONES.push(c.region);

// las monedas únicas censadas del dato (no del comentario)
const MONEDAS_UNICAS = new Set(WORLD_CURRENCIES_FULL.map((c) => c.curCode));

// las monedas compartidas (sirven a 2+ países), por países servidos y código
const POR_MONEDA = new Map<string, { code: string; name: string; symbol: string; paises: string[] }>();
for (const c of WORLD_CURRENCIES_FULL) {
  const m = POR_MONEDA.get(c.curCode) ?? { code: c.curCode, name: c.curName, symbol: c.symbol, paises: [] };
  m.paises.push(c.name);
  POR_MONEDA.set(c.curCode, m);
}
const COMPARTIDAS = [...POR_MONEDA.values()]
  .filter((m) => m.paises.length >= 2)
  .sort((a, b) => b.paises.length - a.paises.length || a.code.localeCompare(b.code, "es"));
const MAS_COMPARTIDA = COMPARTIDAS[0];

// el fmt del canon: la tasa es unidades de moneda por 1 USD — es-ES con
// 2 decimales para las grandes y 4 para las pequeñas (regla derivada,
// cero tasa escrita a mano)
function fmtTasa(r: number): string {
  return r.toLocaleString("es-ES", { maximumFractionDigits: r >= 100 ? 2 : 4 });
}

// LA LÍNEA DE LA CASA compuesta COMPLETA en JS (lección v256): si la
// fuente cambia, la línea cambia sola.
const lineaDivisas = `Las monedas del planeta — ${WORLD_CURRENCIES_FULL.length} países y territorios con su moneda oficial real en ${REGIONES.length} regiones y ${MONEDAS_UNICAS.size} monedas únicas; la más compartida: ${MAS_COMPARTIDA.name}, que sirve a ${MAS_COMPARTIDA.paises.length} países`;

export default function DivisasPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "DIVISAS — las monedas oficiales del planeta",
    description:
      "247 países y territorios con su moneda oficial real (ISO 4217), símbolo y tasa por 1 dólar; 154 monedas únicas y las monedas compartidas.",
    url: `${SITE_URL}/divisas`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: WORLD_CURRENCIES_FULL.length,
      itemListElement: WORLD_CURRENCIES_FULL.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${c.name} — ${c.curCode}`,
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
            ◈ VANGUARD · LAS DIVISAS
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-100">LAS MONEDAS DEL PLANETA</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">{lineaDivisas}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Cada tasa son unidades de moneda por 1 dólar estadounidense, tal
            como la captura de open.er-api.com las define. La casa de cambio
            del aparato — el conversor, la operativa en vivo (simulada, con
            monedas VANGUARD) y las banderas reales — vive en{" "}
            <Link href="/" className="text-amber-400 underline">
              la primera página
            </Link>
            ; esta sala es el archivo completo, servido sin JavaScript.
          </p>

          {/* LAS MONEDAS COMPARTIDAS — derivadas del dato, por países servidos */}
          <section className="mt-10" aria-label="Las monedas compartidas">
            <h2 className="text-lg font-bold text-zinc-100">LAS MONEDAS COMPARTIDAS</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Monedas oficiales de 2 o más países y territorios, contadas del
              dato (no del comentario).
            </p>
            <ul className="mt-4 space-y-2">
              {COMPARTIDAS.map((m) => (
                <li
                  key={m.code}
                  className="rounded border border-zinc-800 bg-zinc-900/40 p-3 text-xs leading-relaxed text-zinc-300"
                >
                  <span className="font-mono font-semibold text-zinc-100">{m.code}</span> —{" "}
                  {m.name} · {m.symbol} ·{" "}
                  <span className="text-zinc-400">{m.paises.length} países</span>
                </li>
              ))}
            </ul>
          </section>

          {/* EL ARCHIVO POR REGIONES — en el orden de la fuente */}
          <section className="mt-10" aria-label="El archivo por regiones">
            <h2 className="text-lg font-bold text-zinc-100">EL ARCHIVO POR REGIONES</h2>
            {REGIONES.map((reg) => (
              <div key={reg} className="mt-5">
                <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
                  {`${reg} ×${WORLD_CURRENCIES_FULL.filter((c) => c.region === reg).length}`}
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {WORLD_CURRENCIES_FULL.filter((c) => c.region === reg).map((c) => (
                    <article
                      key={c.code}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
                      aria-label={c.name}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                        {c.code}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-zinc-100">{c.name}</h3>
                      <p className="mt-1 font-mono text-[11px] text-cyan-hud">
                        {c.curCode} {c.symbol} · {c.curName}
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-500">
                        tasa: {fmtTasa(c.rate)} por 1 USD
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <p className="mt-8 text-[11px] leading-relaxed text-zinc-600">
            Los datos viajan verbatim de la fuente (world-data.ts,
            «DATASET MUNDIAL REAL», regenerado con gen-world-data.mjs — no se
            edita a mano); las tasas son la captura de open.er-api.com que la
            propia fuente declara (9 de septiembre de 2026): esta sala sirve
            la captura, la operativa en vivo —simulada, con monedas VANGUARD—
            y las banderas reales de flagcdn viven en el aparato; esta sala es la memoria servida sin JavaScript.
          </p>
          <noscript>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              esta sala funciona sin JavaScript — {lineaDivisas}
            </p>
          </noscript>
        </div>
      </main>
    </>
  );
}
