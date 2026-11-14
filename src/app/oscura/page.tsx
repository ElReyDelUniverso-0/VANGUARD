import type { Metadata } from "next";
import Link from "next/link";
import { TEORIAS, ARMAS, CIVILIZACIONES, DOCS } from "@/lib/oscura-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { PortadaSala } from "@/components/vanguard/portada-sala";

// v301.0 LA BIBLIOTECA OSCURA — la mina que la «Queda» de la v300 señaló
// (oscura-data, ya servida en /guerra-hoy, pendiente solo de sala propia)
// gana su sala server. La fuente (la biblioteca de la v63.0 PRIMERA
// PÁGINA, pura de servidor) declara en su propia cabeza: «contenido
// verificado: cada teoría con veredicto REAL/MITO/
// PARCIAL y fuente real» — y el censo de esta ronda lo mide: 43 entradas
// (14 teorías · 11 armas-idea · 10 civilizaciones · 8 documentos
// desclasificados), las 43 con su url de archivo público y su fuente
// declarada (CIA Reading Room, National Archives, NSA, FBI Vault,
// World History Encyclopedia, NSArchive, Smithsonian...). Lo que la sala
// añade sobre el teaser de /guerra-hoy y sobre la pestaña oscura del
// aparato: los veredictos con su sistema completo (dónde nació · lo que
// se cuenta · lo que dicen los documentos), las rarezas derivadas y CADA
// ENTRADA ABIERTA a su documento original con enlace real. Sala server
// pura (patrón /historia v274 · /armeria v283 · /archivo-mundial v293 ·
// /atlas v294 · /verdad-cruda v295 · /divisas v296 · /poder v297 ·
// /galeria v298): prerenderizada, sin cliente, sin BD, indexable.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "BIBLIOTECA OSCURA — 43 secretos con veredicto y documentos desclasificados | VANGUARD",
  description:
    "La biblioteca oscura de VANGUARD: 14 teorías con veredicto REAL/MITO/PARCIAL, 11 armas-idea que cambiaron la guerra, 10 civilizaciones que aterraron al mundo y 8 documentos desclasificados — cada entrada abierta a su fuente original (CIA, National Archives, NSA, FBI Vault). Gratis, en español.",
  alternates: { canonical: `${SITE_URL}/oscura` },
};

// ── TODO derivado de la fuente, nada a mano (directiva v266, lección v256) ──
// los veredictos EN EL ORDEN DE LA FUENTE (primera aparición)
const VEREDICTOS: string[] = [];
for (const t of TEORIAS) if (!VEREDICTOS.includes(t.veredicto)) VEREDICTOS.push(t.veredicto);

// las rarezas EN EL ORDEN DE LA FUENTE (primera aparición)
const RAREZAS: string[] = [];
for (const t of TEORIAS) if (!RAREZAS.includes(t.rareza)) RAREZAS.push(t.rareza);

// las 4 colecciones en el orden de la fuente, un censo derivado
const TOTAL = TEORIAS.length + ARMAS.length + CIVILIZACIONES.length + DOCS.length;

// LA LÍNEA DE LA CASA compuesta COMPLETA en JS (lección v256): si la
// fuente cambia, la línea cambia sola. Sin años escritos (guardia del
// arco) y sin fechas ISO (guardia v234) — la prosa se deriva del censo.
const lineaOscura = `La biblioteca oscura — ${TOTAL} entradas con su fuente real citada: ${TEORIAS.length} teorías con veredicto, ${ARMAS.length} armas-idea que cambiaron la guerra, ${CIVILIZACIONES.length} civilizaciones que aterraron al mundo y desaparecieron, y ${DOCS.length} documentos desclasificados`;

// el color del veredicto es regla derivada (el código del teaser de la
// casa en /guerra-hoy, ahora con su propia función)
function clasesVeredicto(v: string): string {
  if (v === "REAL") return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
  if (v === "MITO") return "text-red-400 border-red-500/40 bg-red-500/10";
  return "text-amber-400 border-amber-500/40 bg-amber-500/10";
}

export default function OscuraPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "BIBLIOTECA OSCURA — secretos con veredicto y documentos desclasificados",
    description:
      "Teorías con veredicto REAL/MITO/PARCIAL, armas-idea, civilizaciones desaparecidas y documentos desclasificados, cada entrada con su fuente real citada (CIA, National Archives, NSA, FBI Vault, World History Encyclopedia).",
    url: `${SITE_URL}/oscura`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: TOTAL,
      itemListElement: [
        ...TEORIAS.map((t) => ({ name: t.titulo, description: t.realidad })),
        ...ARMAS.map((a) => ({ name: a.titulo, description: a.legado })),
        ...CIVILIZACIONES.map((c) => ({ name: c.titulo, description: c.misterio })),
        ...DOCS.map((d) => ({ name: d.titulo, description: d.desc })),
      ].map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "CreativeWork", name: it.name, description: it.description },
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
        imagen="/ilustraciones/oscura.jpg"
        alt="Pasillo de archivo en penumbra con estanterías que se pierden en la oscuridad"
        volanta="LA CASA · ARCHIVO OSCURO"
        titulo="LO OSCURO, EN 60 SEGUNDOS"
        nivel="p"
        acento="#ef4444"
        sumario="Teorías, armas y civilizaciones perdidas con su documento original al lado: lo que se sospecha, separado de lo que está probado."
        cifras={[
          { valor: TEORIAS.length, etiqueta: "teorías", nota: "con veredicto" },
          { valor: ARMAS.length, etiqueta: "armas", nota: "documentadas" },
          { valor: CIVILIZACIONES.length, etiqueta: "civilizaciones", nota: "perdidas" },
          { valor: DOCS.length, etiqueta: "documentos", nota: "de origen" }
        ]}
        puntos={[
          { titulo: "CON VEREDICTO", texto:
              "Cada teoría lleva la etiqueta editorial de la casa: lo que está probado, lo que es plausible y lo que es leyenda. El juez final es el documento." },
          { titulo: "CON DOCUMENTO", texto:
              "Cada entrada abre el original que la sostiene o la desmiente: CIA Reading Room, National Archives, NSA, FBI Vault, World History Encyclopedia." },
          { titulo: "SIN MORBO", texto:
              "El archivo oscuro no es un gabinete de curiosidades: es el lugar donde una sospecha se convierte en fuente o se cae." }
        ]}
        anclas={[
          { etiqueta: "las teorías", href: "#teorias" },
          { etiqueta: "las armas", href: "#armas" },
          { etiqueta: "las civilizaciones", href: "#civilizaciones" }
        ]}
        nota="Portada y cifras servidas desde la propia casa: la ilustración viaja en el repositorio y cada número sale de la fuente de esta sala, calculado en el render. Cero cifras escritas a mano."
      />

      <main className="min-h-screen bg-zinc-950 px-4 sm:px-5 py-10 text-zinc-200">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-red-400">
            ◈ VANGUARD · LA BIBLIOTECA OSCURA
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-100">LA BIBLIOTECA OSCURA</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">{lineaOscura}</p>
          <p className="mt-1 text-xs text-zinc-500">
            El veredicto es la etiqueta editorial de la casa sobre cada teoría; el juez
            final es el documento original que abre cada entrada (CIA Reading Room,
            National Archives, NSA, FBI Vault, World History Encyclopedia...). En el
            aparato, la pestaña de la{" "}
            <Link href="/" className="text-red-400 underline">
              Alejandría Oscura
            </Link>{" "}
            paga cada lectura y otorga el rango «Ojo que todo lo lee»; esta sala es el
            archivo completo, servido sin JavaScript y con cada documento abierto a su
            fuente. El mando de la casa también la presenta en{" "}
            <Link href="/guerra-hoy" className="text-red-400 underline">
              la guerra hoy
            </Link>
            .
          </p>

          {/* LOS VEREDICTOS Y LAS RAREZAS — censados del dato, chips en un solo nodo */}
          <section className="mt-10" aria-label="Los veredictos y las rarezas">
            <h2 className="text-lg font-bold text-zinc-100">EL SISTEMA DEL ARCHIVO</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {VEREDICTOS.map((v) => (
                <p
                  key={v}
                  className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-widest ${clasesVeredicto(v)}`}
                >
                  {`${v} ×${TEORIAS.filter((t) => t.veredicto === v).length}`}
                </p>
              ))}
              {RAREZAS.map((r) => (
                <p
                  key={r}
                  className="rounded-full border border-zinc-700 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-zinc-400"
                >
                  {`${r} ×${TEORIAS.filter((t) => t.rareza === r).length}`}
                </p>
              ))}
            </div>
          </section>

          {/* LAS TEORÍAS — en el orden de la fuente */}
          <section id="teorias" className="mt-10" aria-label="Las teorías con veredicto">
            <h2 className="text-lg font-bold text-zinc-100">
              {`LAS TEORÍAS CON VEREDICTO ×${TEORIAS.length}`}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {TEORIAS.map((t) => (
                <article
                  key={t.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                  aria-label={t.titulo}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[9px] uppercase tracking-widest rounded px-1.5 py-0.5 border ${clasesVeredicto(t.veredicto)}`}
                    >
                      {t.veredicto}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                      {t.rareza}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-zinc-100">{t.titulo}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                    <span className="font-mono uppercase tracking-wider text-zinc-400">dónde nació: </span>
                    {t.origen}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                    <span className="font-mono uppercase tracking-wider text-zinc-400">lo que se cuenta: </span>
                    {t.creencia}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
                    <span className="font-mono uppercase tracking-wider text-emerald-500/70">lo que dicen los documentos: </span>
                    {t.realidad}
                  </p>
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-mono text-[10px] uppercase tracking-wider text-red-400 underline decoration-dotted"
                  >
                    fuente: {t.fuente}
                  </a>
                </article>
              ))}
            </div>
          </section>

          {/* LAS ARMAS-IDEA — en el orden de la fuente */}
          <section id="armas" className="mt-10" aria-label="Las armas-idea">
            <h2 className="text-lg font-bold text-zinc-100">
              {`LAS ARMAS-IDEA ×${ARMAS.length}`}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {ARMAS.map((a) => (
                <article
                  key={a.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                  aria-label={a.titulo}
                >
                  <span className="font-mono text-[9px] uppercase tracking-widest rounded px-1.5 py-0.5 border text-orange-400 border-orange-500/40 bg-orange-500/10">
                    {`Arma-idea · ${a.epoca}`}
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-zinc-100">{a.titulo}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                    <span className="font-mono uppercase tracking-wider text-zinc-400">la idea que la creó: </span>
                    {a.idea}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
                    <span className="font-mono uppercase tracking-wider text-orange-500/70">qué cambió en el mundo: </span>
                    {a.legado}
                  </p>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-mono text-[10px] uppercase tracking-wider text-red-400 underline decoration-dotted"
                  >
                    fuente: {a.fuente}
                  </a>
                </article>
              ))}
            </div>
          </section>

          {/* LAS CIVILIZACIONES — en el orden de la fuente */}
          <section id="civilizaciones" className="mt-10" aria-label="Las civilizaciones que desaparecieron">
            <h2 className="text-lg font-bold text-zinc-100">
              {`LAS CIVILIZACIONES QUE DESAPARECIERON ×${CIVILIZACIONES.length}`}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {CIVILIZACIONES.map((c) => (
                <article
                  key={c.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                  aria-label={c.titulo}
                >
                  <span className="font-mono text-[9px] uppercase tracking-widest rounded px-1.5 py-0.5 border text-sky-400 border-sky-500/40 bg-sky-500/10">
                    {`Civilización perdida · ${c.epoca}`}
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-zinc-100">{c.titulo}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                    <span className="font-mono uppercase tracking-wider text-zinc-400">qué logró: </span>
                    {c.que}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
                    <span className="font-mono uppercase tracking-wider text-sky-500/70">cómo aterró y desapareció: </span>
                    {c.misterio}
                  </p>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-mono text-[10px] uppercase tracking-wider text-red-400 underline decoration-dotted"
                  >
                    fuente: {c.fuente}
                  </a>
                </article>
              ))}
            </div>
          </section>

          {/* LOS DOCUMENTOS DESCLASIFICADOS — en el orden de la fuente */}
          <section id="documentos" className="mt-10" aria-label="Los documentos desclasificados">
            <h2 className="text-lg font-bold text-zinc-100">
              {`LOS DOCUMENTOS DESCLASIFICADOS ×${DOCS.length}`}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {DOCS.map((d) => (
                <article
                  key={d.id}
                  className="rounded-lg border border-red-500/20 bg-zinc-900/40 p-4"
                  aria-label={d.titulo}
                >
                  <span className="font-mono text-[9px] uppercase tracking-widest rounded px-1.5 py-0.5 border text-violet-400 border-violet-500/40 bg-violet-500/10">
                    {d.tag}
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-zinc-100">{d.titulo}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">{d.desc}</p>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-mono text-[10px] uppercase tracking-wider text-red-400 underline decoration-dotted"
                  >
                    fuente: {d.fuente}
                  </a>
                </article>
              ))}
            </div>
          </section>

          <p className="mt-8 text-[11px] leading-relaxed text-zinc-600">
            Los datos viajan verbatim de la fuente (oscura-data.ts, la biblioteca de
            la v63, «contenido verificado: cada teoría con veredicto REAL/MITO/PARCIAL
            y fuente real» — no se edita a mano): 43 entradas, las 43 con su url de
            archivo público y su fuente declarada, censadas por la suite de esta ronda.
            El veredicto es la etiqueta editorial de la casa; la rareza es la pieza de
            juego del aparato y aquí viaja como rótulo del archivo.
          </p>
          <noscript>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              esta sala funciona sin JavaScript — {lineaOscura}
            </p>
          </noscript>
        </div>
      </main>
    </>
  );
}
