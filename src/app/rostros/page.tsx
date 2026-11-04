import type { Metadata } from "next";
import Link from "next/link";
import {
  ROSTROS,
  COLECCION_ROSTROS,
  CATEGORIAS_ROSTRO,
} from "@/lib/personas-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";

// v286.0 LOS ROSTROS DEL PODER — la galería de los rostros sube a
// server (patrón /historia v274 · /servicios v281 · /armeria v283):
// personas-data.ts (ROSTROS, 34 fichas reales — TRONOS · DINERO ·
// TRIBUNAL · NUEVOS) solo vivía client-side (rostros-panel, el
// aparato), invisible para el SSR y para Google. Cada expediente
// viaja VERBATIM de la fuente (directiva v266): cargo, organización,
// sede, ciudad, alcance, poder, mandato, ruta, frase, señas, guardia,
// sucesión y notas — nada aquí es inventado: es el censo de poder de
// la casa, presentado como galería indexable. TODO derivado, nada a
// mano: censo por categoría con Set + filter en el ORDEN DE LA
// FUENTE, naciones con Set, leyendas e iconos desde
// CATEGORIAS_ROSTRO (directiva v266), la placa derivada del num real
// y las cifras servidas de COLECCION_ROSTROS (ya derivada en la
// fuente con Set + filter + reduce — la sala no escribe una cifra,
// herencia v282). Líneas compuestas COMPLETAS en JS (lección v256).
// Cero años a mano (guardia v234 + la guardia del arco v282/v283).

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "LOS ROSTROS DEL PODER — las 34 fichas reales del poder mundial | VANGUARD",
  description:
    "El censo de poder de VANGUARD: 34 fichas reales en 18 naciones — los tronos (jefes de Estado), el dinero (banqueros centrales y magnates), el tribunal (organismos multilaterales) y los nuevos (silicio e IA) — con su cargo, su sede, su ruta al poder y su frase. Conocimiento abierto servido en server. Gratis, en español.",
  alternates: { canonical: `${SITE_URL}/rostros` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/rostros`,
    title: "LOS ROSTROS DEL PODER — Vanguard",
    description:
      "34 fichas reales del poder mundial: los tronos, el dinero, el tribunal y los nuevos — cargo, sede, ruta, frase y guardia, verbatim de la fuente.",
    siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    locale: "es_ES",
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "Los rostros del poder — Vanguard" }],
  },
};

// ── TODO derivado de las fuentes, nada a mano ──
// el censo por categoría en el ORDEN DE LA FUENTE (el Set preserva la
// inserción: tronos · dinero · tribunal · nuevos)
const CATS_ROSTROS = [...new Set(ROSTROS.map((r) => r.categoria))];

const censoRostros = CATS_ROSTROS.map((c) => ({
  cat: c,
  n: ROSTROS.filter((r) => r.categoria === c).length,
  etiqueta: CATEGORIAS_ROSTRO[c].etiqueta,
  icono: CATEGORIAS_ROSTRO[c].icono,
  color: CATEGORIAS_ROSTRO[c].color,
  leyenda: CATEGORIAS_ROSTRO[c].leyenda,
}));

// las naciones, derivadas de los países reales de la fuente
const NACIONES_ROSTROS = new Set(ROSTROS.map((r) => r.pais)).size;

// las líneas compuestas COMPLETAS en JS (lección v256) — cero cifras
// escritas a mano: los censos salen del filter, las naciones del Set
// y las cifras mayores de COLECCION_ROSTROS (ya derivada en la fuente)
const lineaRostros = `La galería de los rostros — ${ROSTROS.length} fichas reales del poder en ${NACIONES_ROSTROS} naciones, con su cargo, su sede, su ruta y su frase verbatim: ${censoRostros.map((c) => `${c.etiqueta} ×${c.n}`).join(" · ")}`;
const lineaCifras = `La colección en cifras — ${COLECCION_ROSTROS.total} fichas de ${COLECCION_ROSTROS.naciones} naciones; la ficha más poderosa: ${COLECCION_ROSTROS.masPoderoso.nombre} (${COLECCION_ROSTROS.masPoderoso.poder}), ${COLECCION_ROSTROS.masPoderoso.cargo}`;

// el número de expediente compuesto desde el num real de la fuente
const placa = (n: number): string => String(n).padStart(2, "0");

export default function RostrosPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "LOS ROSTROS DEL PODER — el censo de poder de Vanguard",
    description:
      "34 fichas reales del poder mundial en 18 naciones: los tronos, el dinero, el tribunal y los nuevos — con cargo, sede, ruta al poder y frase.",
    url: `${SITE_URL}/rostros`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: ROSTROS.length,
      itemListElement: ROSTROS.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${r.nombre} — ${r.cargo}`,
      })),
    },
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
            LOS ROSTROS DEL PODER · el censo de la casa
          </div>
          <h1 className="mt-3 text-2xl font-bold text-zinc-100 sm:text-3xl">
            Los rostros que mueven el mundo
          </h1>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            {`${lineaRostros}.`}
          </p>
          {/* los censos por categoría — derivados de la fuente, cero cifras a mano */}
          <div className="mt-4 flex flex-wrap gap-2">
            {censoRostros.map((c) => (
              <span
                key={`censo-${c.cat}`}
                className="border border-zinc-700 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest bg-zinc-900"
              >
                <span style={{ color: c.color }}>{`${c.icono} ${c.etiqueta} ×${c.n}`}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* la colección en cifras (v286) — COLECCION_ROSTROS ya vive derivada en la fuente */}
        <p className="text-xs text-zinc-500 leading-relaxed">
          {`${lineaCifras}.`}
        </p>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
          {`Cada expediente viaja con SUS datos de la fuente (personas-data.ts): el nombre, el cargo, la sede, la ruta, la frase y las notas tal como la fuente los declara — nada aquí es inventado. El expediente vive en la fuente, no en esta sala.`}
        </p>

        {censoRostros.map((c) => {
          const items = ROSTROS.filter((r) => r.categoria === c.cat);
          if (items.length === 0) return null;
          return (
            <section key={c.cat} className="mt-10" aria-label={c.etiqueta}>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">
                <span style={{ color: c.color }}>{`${c.icono} ${c.etiqueta}`}</span>
                <span className="text-zinc-600">{` · ${items.length} ${items.length === 1 ? "ficha" : "fichas"}`}</span>
              </h2>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">{c.leyenda}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {items.map((r) => (
                  <article
                    key={r.id}
                    id={r.id}
                    className="border border-zinc-800 rounded-md p-4 bg-zinc-900/60 scroll-mt-20"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-bold leading-snug text-zinc-100">
                        <span className="font-mono text-[10px] text-zinc-500">{`${placa(r.num)} · `}</span>
                        <span aria-hidden="true">{`${r.bandera} `}</span>
                        {r.nombre}
                      </h3>
                      <span className="font-mono text-[10px] text-zinc-500 whitespace-nowrap">{`poder: ${r.poder}`}</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-300">{r.cargo}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-zinc-500">{r.organizacion}</p>
                    <p className="mt-1.5 font-mono text-[10px] text-zinc-500">
                      {`${r.sede} · ${r.ciudad} · ${r.pais}`}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">{`mandato: ${r.mandato}`}</p>
                    <p className="mt-1 text-xs text-zinc-400">{`alcance: ${r.alcance}`}</p>
                    <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{`ruta: ${r.ruta}`}</p>
                    <div className="mt-2 font-mono text-[10px] text-cyan-hud">{r.frase}</div>
                    <ul className="mt-2 space-y-1">
                      {r.senas.map((s, i) => (
                        <li key={`sena-${i}`} className="text-xs text-zinc-500 leading-relaxed">
                          {`— ${s}`}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">{`guardia: ${r.guardia}`}</p>
                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{`sucesión: ${r.sucesion}`}</p>
                    <ul className="mt-1.5 space-y-1">
                      {r.notas.map((na, i) => (
                        <li key={`nota-${i}`} className="text-xs text-zinc-500 leading-relaxed">
                          {`· ${na}`}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {/* la puerta honesta al aparato (patrón v275/v276) */}
        <p className="mt-8 text-xs text-zinc-500 leading-relaxed">
          El salón interactivo de los rostros — el mapa de señales vivas, los filtros por poder y el pulso por palabras clave — vive en el aparato ({" "}
          <Link href="/" className="text-amber underline">
            la primera página de la casa
          </Link>
          ); esta sala es el expediente completo, servido sin JavaScript. Las fichas viven en la fuente (personas-data.ts), no en esta sala — si el censo crece, la galería crece sola.
        </p>

        <noscript>
          <p className="mt-6 text-xs text-zinc-500 leading-relaxed">
            {`Esta sala funciona sin JavaScript: las ${ROSTROS.length} fichas —${censoRostros.map((c) => `${c.n} ${c.etiqueta.toLowerCase()}`).join(", ")}— de ${NACIONES_ROSTROS} naciones están arriba, servidas en el HTML, con su cargo, su sede, su ruta y su frase. El mapa de señales vive en el aparato y pide JavaScript.`}
          </p>
        </noscript>
      </div>
    </main>
  );
}
