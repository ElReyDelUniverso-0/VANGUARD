import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { TEATROS } from "@/lib/teatros";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

// v265.0 EL PÓRTICO DE LAS SALAS — la puerta que las 9 salas nunca
// tuvieron. Desde v206 cada teatro vive en /conflicto/[tag], pero la
// raíz /conflicto era un 404: las salas solo se alcanzaban por puertas
// laterales (chips de la Primera página, cards del mural FRENTE TOTAL,
// «Otros teatros» al pie de cada sala, sitemap). Sin JS y sin esas
// páginas, las 9 salas no existían. El pórtico las sirve EN SERVER:
// las cards salen del catálogo canónico (TEATROS — la misma fuente
// única de las salas, el sitemap y los nombres humanos de v259/v260),
// y el peso se mide con UNA groupBy (_count + _max.publishedAt, el
// patrón del puente v257 y del mapa v262) — el censo, no las filas:
// cero consultas de más. Sin BD el pórtico sigue en pie: cards con
// nombre, resumen y palabras; sin líneas de peso (vacío honesto, ley de
// la casa). La puerta nunca muere porque la señal pause (herencia v264).

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "Las salas del conflicto — los teatros de guerra en vivo",
  description:
    "Las salas de la agencia de Vanguard: Ucrania, Gaza e Israel, Ormuz y el Golfo, Taiwán y el Pacífico, el Sahel, el Mar Rojo, las Coreas, Sudán y Líbano — cada una con su archivo de cables verificados por fuente y su señal en vivo. Gratis, en español.",
  alternates: { canonical: "/conflicto" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/conflicto`,
    title: "Las salas del conflicto — los teatros de guerra en vivo · VANGUARD",
    description:
      "Cada teatro de guerra del planeta con su sala: archivo de cables verificados, señal más fresca y puerta al planeta 3D. Gratis, en español.",
    siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    locale: "es_ES",
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "Las salas del conflicto" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Las salas del conflicto",
    description:
      "Cada teatro de guerra con su sala: cables verificados, señal fresca y el planeta 3D a un toque.",
  },
};

// v265.0 — UNA consulta para todo el pórtico: el conteo y la última
// señal de cada sala de una vez (el patrón v257/v262: la MISMA groupBy
// con dos medidas). El peso no necesita filas, necesita el censo.
interface MedicionSala {
  conteo: number;
  ultima: Date | null;
}
async function medicionPorSala(): Promise<Record<string, MedicionSala> | null> {
  try {
    const filas = await db.newsItem.groupBy({
      by: ["conflictTag"],
      where: { conflictTag: { in: Object.keys(TEATROS) } },
      _count: { _all: true },
      _max: { publishedAt: true },
    });
    const mapa: Record<string, MedicionSala> = {};
    for (const f of filas)
      if (f.conflictTag)
        mapa[f.conflictTag] = { conteo: f._count._all, ultima: f._max.publishedAt };
    return mapa;
  } catch {
    return null;
  }
}

// v265.0 — la edad de la casa (misma gramática que la sala v261):
// derivada del milisegundo real, nunca escrita a mano (guardia v234).
function hace(fecha: Date): string {
  const min = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
}

// v265.0 CONECTA CON EL NÚCLEO (patrón v230/v233/v234/v235)
const ENLACES: EnlaceContextual[] = [
  {
    etiqueta: "LA PRIMERA PÁGINA ▸",
    ruta: "/guerra-hoy",
    motivo: "la guerra de hoy con el peso y la edad de cada teatro",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL PLANETA 3D ▸",
    ruta: "/mundo",
    motivo: "los teatros girando en el globo con su tensión del día",
    tipoRelacion: "visible_en",
  },
  {
    etiqueta: "EL MAPA DEL FRENTE ▸",
    ruta: "/ver-guerra",
    motivo: "los frentes del planeta ardiendo a la vez en un mural en vivo",
    tipoRelacion: "visible_en",
  },
  {
    etiqueta: "LA BÚSQUEDA DEL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "busca en el archivo real que hay detrás de cada sala",
    tipoRelacion: "documenta",
  },
];

export default async function ConflictoIndexPage() {
  const conteos = await medicionPorSala();

  // v265.0 — el peso del pórtico entero: la suma real de los conteos
  // (cero números escritos a mano — si el archivo crece, la línea crece).
  const salas = Object.keys(TEATROS).length;
  const totalPuerta = conteos
    ? Object.values(conteos).reduce((t, m) => t + m.conteo, 0)
    : null;
  // lección v256: la línea se compone COMPLETA en JS antes del JSX
  const lineaPortico = totalPuerta
    ? `El pórtico de las salas — ${salas} salas, ${totalPuerta} cables con puerta en el archivo`
    : `El pórtico de las salas — ${salas} salas de la casa`;

  // v265.0 — la señal más fresca de las salas, derivada de las
  // mediciones ya hechas (cero consultas extra; patrón fresca v257/v262).
  const fresca = (() => {
    if (!conteos) return null;
    let mejor: { nombre: string; ultima: Date } | null = null;
    for (const [tag, m] of Object.entries(conteos)) {
      if (!m.ultima || m.conteo === 0) continue;
      if (!mejor || m.ultima > mejor.ultima)
        mejor = { nombre: TEATROS[tag]?.nombre ?? tag, ultima: m.ultima };
    }
    return mejor;
  })();
  const lineaFresca = fresca
    ? `la señal más fresca de las salas: ${fresca.nombre} — última señal hace ${hace(fresca.ultima)}`
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Las salas del conflicto — los teatros de guerra en vivo",
    description:
      "Las salas de la agencia de Vanguard: cada teatro de guerra con su archivo de cables verificados y su señal en vivo.",
    url: `${SITE_URL}/conflicto`,
    inLanguage: "es",
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: salas,
      itemListElement: Object.entries(TEATROS).map(([k, t], i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/conflicto/${k}`,
        name: t.nombre,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />

      {/* barra superior — la misma que cada sala (la puerta se siente parte del pasillo) */}
      <div className="border-b border-zinc-800 bg-zinc-900/60">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
          >
            ◉ VANGUARD
          </Link>
          <Link
            href="/guerra-hoy"
            className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
          >
            Primera página
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* hero del pórtico */}
        <header>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-widest text-red-300 border border-red-400/40 bg-red-400/10 rounded px-1.5 py-0.5">
              Las puertas del archivo
            </span>
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight text-zinc-100">
            Las salas del conflicto:{" "}
            <span className="text-amber-400">los teatros en vivo hoy</span>
          </h1>
          <p className="mt-3 text-base text-zinc-400 leading-relaxed">
            Cada teatro de guerra del planeta con su sala: el archivo de cables
            verificados por fuente, la señal más fresca y el planeta 3D a un
            toque. El peso y la edad se miden contra la agencia en cada visita —
            la casa no declama números que no midió.
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            {lineaPortico}
          </p>
          {lineaFresca && (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-amber-300/80">
              {lineaFresca}
            </p>
          )}
        </header>

        {/* las salas — cards derivadas del catálogo canónico, cero a mano */}
        <section className="mt-8 flex flex-col gap-3" aria-label="Las salas del conflicto">
          {Object.entries(TEATROS).map(([k, t]) => {
            // v265.0 — el peso real de la sala, medido en la groupBy única:
            // sin medición (BD caída) la línea ni se pinta (vacío honesto).
            const medicion = conteos?.[k];
            const lineaSala =
              medicion?.conteo && medicion.ultima
                ? `${medicion.conteo} cables en el archivo · última señal hace ${hace(new Date(medicion.ultima))}`
                : null;
            // v263.0 — el catálogo lleva las claves de cada sala: el pórtico
            // declara las palabras que abren la puerta (transparencia del
            // hallazgo, la misma que las cards «citan:» de cada sala).
            const palabras = `sus palabras: ${t.claves.slice(0, 4).join(" · ")}`;
            return (
              <article
                key={k}
                className="border border-zinc-800 hover:border-amber-500/50 rounded-md p-4 bg-zinc-900/40 transition-colors"
              >
                <h2 className="text-lg font-bold leading-snug text-zinc-100">{t.nombre}</h2>
                <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">{t.resumen}</p>
                {lineaSala && (
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {lineaSala}
                  </p>
                )}
                <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-cyan-hud">
                  {palabras}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/conflicto/${k}`}
                    title={`Entrar a la sala de ${t.nombre}: el archivo de cables verificados del teatro`}
                    className="border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-mono text-[10px] uppercase tracking-widest rounded px-3 py-1.5 transition-colors"
                  >
                    Entrar a la sala ▸
                  </Link>
                  <Link
                    href={`/mundo?teatro=${k}`}
                    title={`El teatro ${t.nombre} trazado en el planeta 3D de la casa`}
                    className="border border-zinc-700 text-zinc-300 hover:border-sky-400/50 hover:text-sky-300 font-mono text-[10px] uppercase tracking-widest rounded px-3 py-1.5 transition-colors"
                  >
                    En el planeta 3D ▸
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        {/* texto indexable de contexto */}
        <div className="mt-8 text-[13px] text-zinc-500 leading-relaxed">
          <p>
            Este pórtico reúne las salas donde la agencia de Vanguard sigue los
            conflictos del planeta: cada sala sirve su archivo paginado en el
            servidor (cero JavaScript para leer), sus candidatos sin etiqueta
            que citan al teatro y su despliegue de frentes documentados. Sigue
            la guerra minuto a minuto en{" "}
            <Link href="/guerra-hoy" className="text-amber-500/80 hover:text-amber-400 underline underline-offset-2">
              la primera página
            </Link>{" "}
            o mira el planeta entero girando en{" "}
            <Link href="/mundo" className="text-amber-500/80 hover:text-amber-400 underline underline-offset-2">
              el globo 3D
            </Link>
            .
          </p>
        </div>

        {/* v218.0 EL NÚCLEO — la conexión explícita con el resto de la casa */}
        <EnlacesNucleo enlaces={ENLACES} titulo="CONECTA CON EL NÚCLEO" />
      </div>
    </main>
  );
}
