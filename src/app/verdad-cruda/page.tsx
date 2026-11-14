import type { Metadata } from "next";
import Link from "next/link";
import {
  WAR_ABUSES,
  INCIDENTS,
  MEMORIAL_FALLEN,
  MEMORIAL_WARS,
  DRONE_MODELS,
  DRONE_CASUALTY_FACTS,
  INCIDENT_TYPE_META,
  ABUSE_TYPES,
} from "@/lib/dark-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { PortadaSala } from "@/components/vanguard/portada-sala";

// v295.0 LA VERDAD CRUDA — el almacén menor clasificado: el censo de la
// «Queda» de la v294 (dark-data, oscura-data, geoint, lados, monitor,
// enclaves, perdidas, sismo, mundial, tierra, cielos...) cayó casi
// entero en negativo — ficción, simulación determinista o creación
// propia declarados en su propia cabeza («ficticios plausibles»,
// «espejo del tablero», «creación propia de Vanguard») — y destapó la
// veta documentada que dormía desde la v24: dark-data (49 KB, SIN "use
// client"), «datos documentados de abusos, incidentes, memorial y
// drones; todas las entradas citan fuentes públicas (ONU, CPJ, RSF,
// ACLED, HRW, OSCE)», consumida en server SOLO por rutas API mientras
// su plato completo viaja en siete paneles client de la portada. La
// sala levanta el registro documental: 12 abusos de guerra verificados
// uno a uno con su FUENTE CITADA verbatim (Kramatorsk, Bucha, Mariúpol,
// Gaza, Sudán, Myanmar — el honor de la cita real, v292); el memorial
// de 10 periodistas caídos documentados por CPJ · RSF · IPI; 14
// incidentes con coordenadas y fuentes; 4 sistemas de dron con su
// anatomía; 4 cifras del coste. NO SUBE la mecánica de juego ni el
// índice de metraje: RECRUIT_SIDES (el reclutamiento 3D del aparato),
// ELECTION_*/AMBASSADOR_* (el ciclo electoral) y SALA_ROJA_ITEMS (el
// índice de metraje gráfico — se declara la puerta honesta, no se
// indexa) se quedan donde viven. Sala server pura (patrón /historia
// v274 · /armeria v283 · /archivo-mundial v293 · /atlas v294):
// prerenderizada ○, sin cliente, sin BD, indexable para Google.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "VERDAD CRUDA — los abusos documentados de las guerras, con su fuente | VANGUARD",
  description:
    "El registro documental de VANGUARD: 12 abusos de guerra verificados con su fuente citada (ONU/OHCHR, AP, OSCE, OMS, ACLED), el memorial de 10 periodistas caídos documentados por CPJ y RSF, 14 incidentes documentados, 4 sistemas de dron con su anatomía y las cifras del coste. Gratis, en español.",
  alternates: { canonical: `${SITE_URL}/verdad-cruda` },
};

// ── TODO derivado de la fuente, nada a mano (directiva v266, lección v256) ──
// las guerras de los abusos en el ORDEN DE LA FUENTE (primera aparición)
const GUERRAS: string[] = [];
for (const a of WAR_ABUSES) if (!GUERRAS.includes(a.war)) GUERRAS.push(a.war);

// los tipos de incidente en el ORDEN DE LA FUENTE (primera aparición)
const TIPOS: string[] = [];
for (const i of INCIDENTS) if (!TIPOS.includes(i.type)) TIPOS.push(i.type);

// las guerras del memorial en el orden que la propia fuente declara
// (MEMORIAL_WARS), solo con periodistas que existan en el dato
const GUERRAS_MEMORIAL = Object.keys(MEMORIAL_WARS).filter((w) =>
  MEMORIAL_FALLEN.some((f) => f.war === w),
);

// LA LÍNEA DE LA CASA compuesta COMPLETA en JS (lección v256): si la
// fuente cambia, la línea cambia sola.
const lineaVerdad = `La verdad cruda de las guerras — ${WAR_ABUSES.length} abusos documentados con su fuente citada en ${GUERRAS.length} guerras, ${MEMORIAL_FALLEN.length} periodistas caídos en el memorial, ${INCIDENTS.length} incidentes documentados, ${DRONE_MODELS.length} sistemas de dron con su anatomía y ${DRONE_CASUALTY_FACTS.length} cifras del coste`;

export default function VerdadCrudaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "VERDAD CRUDA — los abusos documentados de las guerras",
    description:
      "Registro documental de abusos de guerra con fuente citada (ONU/OHCHR, AP, OSCE, OMS, ACLED), memorial de periodistas caídos, incidentes documentados y sistemas de dron.",
    url: `${SITE_URL}/verdad-cruda`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: WAR_ABUSES.length,
      itemListElement: WAR_ABUSES.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: a.title,
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
        imagen="/ilustraciones/verdades.jpg"
        alt="Documentos apilados bajo una luz dura sobre una mesa metálica"
        volanta="LA CASA · VERDAD CRUDA"
        titulo="LO QUE NO SE DICE"
        nivel="p"
        acento="#ef4444"
        sumario="Abusos documentados, incidentes, drones y memoria de los caídos: el registro incómodo, con su fuente y su año."
        cifras={[
          { valor: WAR_ABUSES.length, etiqueta: "abusos", nota: "documentados" },
          { valor: INCIDENTS.length, etiqueta: "incidentes", nota: "con fuente" },
          { valor: DRONE_MODELS.length, etiqueta: "modelos", nota: "de dron" },
          { valor: MEMORIAL_FALLEN.length, etiqueta: "caídos", nota: "en el memorial" }
        ]}
        puntos={[
          { titulo: "EL REGISTRO", texto:
              "Cada abuso y cada incidente viaja con su tipo, su año y su fuente. Sin adjetivos: el dato y el documento." },
          { titulo: "LOS DRONES", texto:
              "Los modelos reales, con lo que se sabe de su uso y de sus consecuencias documentadas." },
          { titulo: "EL MEMORIAL", texto:
              "Los caídos, con nombre y guerra: la parte que ninguna tabla de gasto recoge." }
        ]}
        anclas={[
          { etiqueta: "los abusos", href: "#abusos" },
          { etiqueta: "los incidentes", href: "#incidentes" },
          { etiqueta: "el memorial", href: "#memorial" },
        ]}
        nota="Portada y cifras servidas desde la propia casa: la ilustración viaja en el repositorio y cada número sale de la fuente de esta sala, calculado en el render. Cero cifras escritas a mano."
      />

      <main className="min-h-screen bg-zinc-950 px-4 sm:px-5 py-10 text-zinc-200">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
            ◈ VANGUARD · LA VERDAD CRUDA
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-100">LA VERDAD CRUDA DE LAS GUERRAS</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">{lineaVerdad}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Registro documental: cada entrada cita su fuente pública (ONU/OHCHR,
            AP, OSCE, OMS, CPJ, RSF, ACLED, HRW). El aparato — con los paneles
            interactivos, el índice de metraje de la sala roja y el
            reclutamiento 3D — vive en{" "}
            <Link href="/" className="text-amber-400 underline">
              la primera página
            </Link>
            ; esta sala es el archivo documental, servido sin JavaScript.
          </p>

          {/* LOS ABUSOS — agrupados por guerra en el orden de la fuente */}
          <section id="abusos" className="mt-10" aria-label="Los abusos documentados">
            <h2 className="text-lg font-bold text-zinc-100">LOS ABUSOS DOCUMENTADOS</h2>
            {GUERRAS.map((guerra) => (
              <div key={guerra} className="mt-5">
                <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
                  {`${guerra} ×${WAR_ABUSES.filter((a) => a.war === guerra).length}`}
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {WAR_ABUSES.filter((a) => a.war === guerra).map((a) => (
                    <article
                      key={a.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                      aria-label={a.title}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                        {ABUSE_TYPES[a.type]?.label ?? a.type}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-zinc-100">{a.title}</h3>
                      <p className="mt-1 font-mono text-[11px] text-zinc-500">
                        {a.location} · {a.date}
                        {a.verified ? " · verificado" : ""}
                      </p>
                      <p className="mt-2 text-xs text-red-400">{a.deaths}</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-400">{a.summary}</p>
                      <p className="mt-2 text-[11px] text-amber-400">
                        fuente:{" "}
                        {a.sources.map((s) => `${s.org} — ${s.label}`).join(" · ")}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* EL MEMORIAL — las guerras en el orden que la fuente declara */}
          <section id="memorial" className="mt-10" aria-label="El memorial de prensa">
            <h2 className="text-lg font-bold text-zinc-100">EL MEMORIAL DE PRENSA</h2>
            {GUERRAS_MEMORIAL.map((w) => (
              <div key={w} className="mt-5">
                <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
                  {`${MEMORIAL_WARS[w].label} ×${MEMORIAL_FALLEN.filter((f) => f.war === w).length}`}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                  {MEMORIAL_WARS[w].tagline}
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {MEMORIAL_FALLEN.filter((f) => f.war === w).map((f) => (
                    <article
                      key={f.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                      aria-label={f.name}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                        {f.outlet}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-zinc-100">{f.name}</h3>
                      <p className="mt-1 font-mono text-[11px] text-zinc-500">
                        {f.place} · {f.deathDate} · {f.age}
                      </p>
                      <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">{f.note}</p>
                      <p className="mt-2 text-[11px] text-amber-400">
                        documentado por: {f.documentedBy}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* LOS INCIDENTES — agrupados por tipo en el orden de la fuente */}
          <section id="incidentes" className="mt-10" aria-label="Los incidentes documentados">
            <h2 className="text-lg font-bold text-zinc-100">LOS INCIDENTES DOCUMENTADOS</h2>
            {TIPOS.map((t) => (
              <div key={t} className="mt-5">
                <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
                  {`${INCIDENT_TYPE_META[t].label} ×${INCIDENTS.filter((i) => i.type === t).length}`}
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {INCIDENTS.filter((i) => i.type === t).map((i) => (
                    <article
                      key={i.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                      aria-label={i.name}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                        {i.status} · {i.since}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-zinc-100">{i.name}</h3>
                      <p className="mt-2 text-xs text-red-400">{i.deaths} muertos documentados</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-400">{i.summary}</p>
                      <p className="mt-2 text-[11px] text-amber-400">
                        fuente: {i.sources.join(" · ")}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* LOS SISTEMAS DEL CIELO — la anatomía de la guerra de drones */}
          <section id="drones" className="mt-10" aria-label="Los sistemas de dron">
            <h2 className="text-lg font-bold text-zinc-100">LOS SISTEMAS DEL CIELO</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DRONE_MODELS.map((d) => (
                <article
                  key={d.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                  aria-label={d.name}
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {d.kind} · {d.origin}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-zinc-100">{d.name}</h3>
                  <p className="mt-1 font-mono text-[11px] text-cyan-hud">
                    alcance: {d.reach} · velocidad: {d.speed} · ojiva: {d.warhead} · coste: {d.cost}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">usuarios: {d.users}</p>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">{d.note}</p>
                  <ul className="mt-2 space-y-1">
                    {d.parts.map((p) => (
                      <li key={p.name} className="text-[11px] leading-relaxed text-zinc-500">
                        <span className="text-zinc-400">{p.name}:</span> {p.desc}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {/* LAS CIFRAS DEL COSTE — del registro de la fuente */}
          <section className="mt-10" aria-label="Las cifras del coste">
            <h2 className="text-lg font-bold text-zinc-100">LAS CIFRAS DEL COSTE</h2>
            <ul className="mt-4 space-y-2">
              {DRONE_CASUALTY_FACTS.map((c) => (
                <li
                  key={c.stat}
                  className="rounded border border-zinc-800 bg-zinc-900/40 p-3 text-xs leading-relaxed text-zinc-300"
                >
                  <span className="font-mono font-semibold text-red-400">{c.stat}</span>{" "}
                  {c.label} <span className="text-amber-400">fuente: {c.source}</span>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-8 text-[11px] leading-relaxed text-zinc-600">
            Los datos viajan verbatim de la fuente (dark-data.ts, «todas las
            entradas citan fuentes públicas (ONU, CPJ, RSF, ACLED, HRW, OSCE)»),
            no de esta sala — si el registro crece, la sala crece sola. El
            índice de metraje documental (la sala roja), el reclutamiento 3D y
            el ciclo electoral del aparato NO suben a esta sala: viven en sus
            paneles interactivos de la primera página; esta sala es la memoria documental servida sin JavaScript.
          </p>
          <noscript>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              esta sala funciona sin JavaScript — {lineaVerdad}
            </p>
          </noscript>
        </div>
      </main>
    </>
  );
}
