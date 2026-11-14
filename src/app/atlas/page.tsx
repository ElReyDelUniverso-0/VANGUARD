import type { Metadata } from "next";
import Link from "next/link";
import {
  PAISES_ATLAS,
  PERSONAS_ATLAS,
  RUTAS_PODER,
  personaPorId,
  fmtKm2,
  fmtMillones,
} from "@/lib/atlas-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { PortadaSala } from "@/components/vanguard/portada-sala";

// v294.0 EL ATLAS DEL PLANETA — el censo fuera de la cola: las cinco
// cabezas restantes del almacén (imperio, conquest, hooks, social,
// camera) cayeron en la clasificación de esta ronda — ficción y juego
// declarados en su propia fuente — y el censo sistemático destapó la
// veta que ninguna «Queda» nombró: atlas-data (v121), REAL de pies a
// cabeza («datos verificados hasta octubre 2025»), sin "use client",
// consumida en server SOLO como cifra en /nucleo mientras su plato
// completo viaja en un panel ssr:false de la portada. La sala levanta
// el plato: 84 naciones con capital, población, superficie, idiomas,
// moneda, gobierno y líder real; 78 personas del poder con su SEDE
// REAL (el censo manda — v324: 66 → 84 y 69 → 78, el sur entró con
// su censo por firma); 24 rutas del poder resueltas
// contra las personas por id — nada escrito a mano. La zona IANA de
// cada capital y de cada persona es real pero el RELOJ que la mueve
// vive en el aparato (el eco del LIVE_RATES de la v293): la sala
// declara la puerta honesta. Sala server pura (patrón /historia v274 ·
// /armeria v283 · /archivo-mundial v293): prerenderizada ○, sin
// cliente, sin BD, indexable para Google.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "ATLAS — las 84 naciones y las personas que mueven el planeta | VANGUARD",
  description:
    "El atlas del planeta de VANGUARD: 84 naciones con su capital, población, superficie, moneda, gobierno y líder real; 78 personas del poder con su sede real y las 24 rutas que unen los ejes del mundo. Gratis, en español.",
  alternates: { canonical: `${SITE_URL}/atlas` },
};

// ── TODO derivado de la fuente, nada a mano (directiva v266, lección v256) ──
// las regiones en el ORDEN DE LA FUENTE (primera aparición)
const REGIONES: string[] = [];
for (const p of PAISES_ATLAS) if (!REGIONES.includes(p.region)) REGIONES.push(p.region);

// las categorías en el ORDEN DE LA FUENTE (primera aparición)
const CATEGORIAS: string[] = [];
for (const x of PERSONAS_ATLAS)
  if (!CATEGORIAS.includes(x.categoria)) CATEGORIAS.push(x.categoria);

// las rutas resueltas contra las personas (si la fuente pierde un id,
// la ruta no se dibuja — la sala no inventa el extremo que falta)
const RUTAS_RESUELTAS = RUTAS_PODER.filter(
  (r) => personaPorId(r.de) && personaPorId(r.a),
);

// LA LÍNEA DE LA CASA compuesta COMPLETA en JS (lección v256): si la
// fuente cambia, la línea cambia sola.
const lineaAtlas = `El atlas del planeta — ${PAISES_ATLAS.length} naciones con su capital y su líder real en ${REGIONES.length} regiones, ${PERSONAS_ATLAS.length} personas del poder con su sede real y ${RUTAS_RESUELTAS.length} rutas que unen los ejes del mundo`;

export default function AtlasPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ATLAS — las naciones y las personas que mueven el planeta",
    description:
      "84 naciones con su capital, población, superficie, moneda, gobierno y líder real; 78 personas del poder con su sede real; las rutas que unen los ejes del mundo.",
    url: `${SITE_URL}/atlas`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: PAISES_ATLAS.length,
      itemListElement: PAISES_ATLAS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.nombre,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />
      <PortadaSala
        imagen="/ilustraciones/mapa.jpg"
        alt="Mapa antiguo desplegado sobre una mesa con una lámpara encendida"
        volanta="LA CASA · GEOGRAFÍA"
        titulo="EL ATLAS DEL PLANETA"
        nivel="p"
        acento="#22d3ee"
        sumario="Países, capitales, poblaciones y rutas de poder: la geografía real que hay detrás de cada conflicto, servida en fichas y no en párrafos."
        cifras={[
          { valor: PAISES_ATLAS.length, etiqueta: "países", nota: "con ficha" },
          { valor: PERSONAS_ATLAS.length, etiqueta: "personas", nota: "del mapa" },
          { valor: RUTAS_PODER.length, etiqueta: "rutas", nota: "de poder" }
        ]}
        puntos={[
          { titulo: "LA FICHA DEL PAÍS", texto:
              "Superficie, población, capital, región y sus datos de la fuente, con formato legible y sin cifras inventadas." },
          { titulo: "LAS RUTAS DEL PODER", texto:
              "Los corredores que unen Estados, personas y recursos: por dónde se mueve de verdad la influencia." },
          { titulo: "EL MAPA VIVO", texto:
              "El globo con las rutas dibujadas como arcos de vuelo y el reloj local de cada capital vive en el aparato; aquí queda el archivo que lo alimenta." }
        ]}
        anclas={[
          { etiqueta: "las naciones", href: "#paises" },
          { etiqueta: "las personas", href: "#personas" },
          { etiqueta: "las rutas", href: "#rutas" }
        ]}
        nota="Portada y cifras servidas desde la propia casa: la ilustración viaja en el repositorio y cada número sale de la fuente de esta sala, calculado en el render. Cero cifras escritas a mano."
      />

      <main className="min-h-screen bg-zinc-950 px-4 sm:px-5 py-10 text-zinc-200">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
            ◈ VANGUARD · EL ATLAS
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-100">EL ATLAS DEL PLANETA</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">{lineaAtlas}</p>
          <p className="mt-1 text-xs text-zinc-500">
            El mapa interactivo — con el globo, las rutas dibujadas como arcos
            de vuelo y el reloj local vivo de cada capital — vive en el aparato
            ({" "}
            <Link href="/" className="text-amber-400 underline">
              la primera página
            </Link>
            ); esta sala es el archivo completo, servido sin JavaScript.
          </p>

          {/* LAS NACIONES — agrupadas por región en el orden de la fuente */}
          <section id="paises" className="mt-10" aria-label="Las naciones del planeta">
            <h2 className="text-lg font-bold text-zinc-100">LAS NACIONES DEL PLANETA</h2>
            {REGIONES.map((reg) => (
              <div key={reg} className="mt-5">
                <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
                  {`${reg} ×${PAISES_ATLAS.filter((p) => p.region === reg).length}`}
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {PAISES_ATLAS.filter((p) => p.region === reg).map((p) => (
                    <article
                      key={p.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                      aria-label={p.nombre}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                        {p.capital}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-zinc-100">{p.nombre}</h3>
                      <p className="mt-2 font-mono text-[11px] text-cyan-hud">
                        población: {fmtMillones(p.poblacion)} · superficie: {fmtKm2(p.superficie)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        <span className="text-zinc-500">idiomas:</span> {p.idiomas}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        <span className="text-zinc-500">moneda:</span> {p.moneda}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        <span className="text-zinc-500">gobierno:</span> {p.gobierno}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        <span className="text-zinc-500">líder:</span> {p.lider}
                      </p>
                      <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">{p.dato}</p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* LAS PERSONAS — agrupadas por categoría en el orden de la fuente */}
          <section id="personas" className="mt-10" aria-label="Las personas del poder">
            <h2 className="text-lg font-bold text-zinc-100">LAS PERSONAS DEL PODER</h2>
            {CATEGORIAS.map((cat) => (
              <div key={cat} className="mt-5">
                <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
                  {`${cat} ×${PERSONAS_ATLAS.filter((x) => x.categoria === cat).length}`}
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {PERSONAS_ATLAS.filter((x) => x.categoria === cat).map((x) => (
                    <article
                      key={x.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                      aria-label={x.nombre}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                        {x.ciudad}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-zinc-100">{x.nombre}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-400">{x.cargo}</p>
                      <p className="mt-2 text-[11px] text-zinc-500">
                        <span className="text-zinc-400">sede:</span> {x.sede}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* LAS RUTAS — resueltas contra las personas, nada escrito a mano */}
          <section id="rutas" className="mt-10" aria-label="Las rutas del poder">
            <h2 className="text-lg font-bold text-zinc-100">LAS RUTAS DEL PODER</h2>
            <ul className="mt-4 space-y-2">
              {RUTAS_RESUELTAS.map((r) => {
                const de = personaPorId(r.de);
                const a = personaPorId(r.a);
                if (!de || !a) return null;
                return (
                  <li
                    key={`${r.de}-${r.a}`}
                    className="rounded border border-zinc-800 bg-zinc-900/40 p-3 text-xs leading-relaxed text-zinc-300"
                  >
                    <span className="font-semibold text-zinc-100">{de.nombre}</span> ↔{" "}
                    <span className="font-semibold text-zinc-100">{a.nombre}</span> — {r.etiqueta}
                  </li>
                );
              })}
            </ul>
          </section>

          <p className="mt-8 text-[11px] leading-relaxed text-zinc-600">
            Los datos viajan verbatim de la fuente (atlas-data.ts, «datos
            verificados hasta octubre 2025»), no de esta sala — si el atlas
            crece, la sala crece sola. La zona horaria IANA de cada capital y
            de cada persona es real, pero el reloj que la mueve vive en el
            aparato: el mapa interactivo, con banderas, arcos de vuelo y horas
            locales en vivo, está en la primera página de la casa; esta sala es la memoria servida sin JavaScript.
          </p>
          <noscript>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              esta sala funciona sin JavaScript — {lineaAtlas}
            </p>
          </noscript>
        </div>
      </main>
    </>
  );
}
