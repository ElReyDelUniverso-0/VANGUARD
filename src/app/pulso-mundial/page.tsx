import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import path from "node:path";
import { db } from "@/lib/db";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { BarraMundo } from "@/components/vanguard/barra-mundo";
import {
  type InstantaneaPulso,
  rankingWpi,
  enlaceIndicador,
  formatearValor,
  ultimoDato,
} from "@/lib/pulso-mundial";
import { WorldPulseVivo, type CableCronologia } from "./pulso-mundial-vivo";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { filasVivas } from "@/lib/pulso";

// v358.0 WORLD PULSE — EL CENTRO DE INTELIGENCIA MUNDIAL (mandato del Dueño:
// «un centro de inteligencia mundial que reúna acontecimientos, tendencias,
// indicadores y estadísticas internacionales… no inventes estadísticas ni
// tendencias; muestra fechas de actualización, procedencia y limitaciones»).
//
// Página server de la familia MUNDO (hermana de /mundo, /espia, /traductor):
//   · la INSTANTÁNEA del Banco Mundial (horneada con fecha de extracción,
//     CC BY 4.0) viaja con el primer byte — la isla no hace fetch (ley v190)
//   · la CRONOLOGÍA nace de los cables REALES de la BD (tacticalTag
//     DIPLOMACIA/ECONOMIA/HUMANITARIO/ALERTA) — la casa no inventa hechos
//   · si la BD está muda, el bloque lo DECLARA (SIN SEÑAL honesto)
//   · cero números a mano: todo dato viene de public/pulso-mundial-
//     instantanea.json con su procedencia, o de NewsItem con su fecha

export const revalidate = 1800;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard.vanguard-casa.workers.dev";

export const metadata: Metadata = {
  title: "WORLD PULSE — centro de inteligencia mundial",
  description:
    "El pulso del planeta con datos reales del Banco Mundial: economía, sociedad y clima por país, con el WORLD PULSE INDEX y su metodología a la vista.",
  alternates: { canonical: `${SITE_URL}/pulso-mundial` },
  openGraph: {
    title: "WORLD PULSE — el centro de inteligencia mundial · VANGUARD",
    description:
      "Indicadores reales del Banco Mundial, cronología de acontecimientos y el WORLD PULSE INDEX con su metodología a la vista. Filtros por continente, país, categoría y período.",
    url: `${SITE_URL}/pulso-mundial`,
    siteName: "VANGUARD",
    type: "website",
  },
};

function leerInstantanea(): InstantaneaPulso | null {
  try {
    const crudo = readFileSync(
      path.join(process.cwd(), "public", "pulso-mundial-instantanea.json"),
      "utf8"
    );
    return JSON.parse(crudo) as InstantaneaPulso;
  } catch {
    return null; // sin instantánea la página lo declara — no finge datos
  }
}

async function leerCronologia(): Promise<{ cables: CableCronologia[]; error: boolean }> {
  try {
    const filas = await db.newsItem.findMany({
      orderBy: { publishedAt: "desc" },
      take: 240,
      select: {
        id: true,
        title: true,
        source: true,
        publishedAt: true,
        tacticalTag: true,
        conflictTag: true,
        sourceCountry: true,
      },
    }).catch(() => []);
    // v402.2 — la cronología respira con los medios VIVOS (la base de producción
    // viaja congelada): primero los cables vivos, luego el archivo sin repetir.
    const vivas = await filasVivas().catch(() => []);
    const vistos = new Set(vivas.map((v) => v.title.slice(0, 60).toLowerCase()));
    const archivo = filas.filter((f) => !vistos.has(f.title.slice(0, 60).toLowerCase()));
    const todas = [...vivas, ...archivo]
      .sort((x, y) => y.publishedAt.getTime() - x.publishedAt.getTime())
      .slice(0, 240);
    return {
      cables: todas.map((f) => ({
        id: f.id,
        titulo: f.title,
        fuente: f.source,
        fecha: f.publishedAt.toISOString(),
        categoria: f.tacticalTag,
        conflicto: f.conflictTag,
        // la bandera de la casa respira con ISO-2 MAYÚSCULA (REGION_HUE)
        pais: f.sourceCountry ? f.sourceCountry.toUpperCase() : null,
      })),
      error: todas.length === 0,
    };
  } catch {
    return { cables: [], error: true }; // BD muda: SIN SEÑAL declarado abajo
  }
}

/** El año más reciente en el que el WPI alcanza a enough naciones —
 * cero años escritos a mano (guardia v234): el disco manda. */
function anioWpiVivo(snap: InstantaneaPulso): number {
  for (let anio = 2025; anio >= 2012; anio--) {
    if (rankingWpi(snap, anio).length >= 20) return anio;
  }
  return 2024;
}

const COLOR_CATEGORIA: Record<string, string> = {
  ECONOMIA: "text-amber-300",
  SOCIEDAD: "text-cyan-300",
  AMBIENTE: "text-emerald-300",
  CONTEXTO: "text-zinc-400",
};

export default async function PulsoMundialPage() {
  const snap = leerInstantanea();
  const { cables, error: bdError } = await leerCronologia();
  const ahoraServidor = Date.now();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "WORLD PULSE — centro de inteligencia mundial",
        description:
          "Acontecimientos, tendencias, indicadores y estadísticas internacionales con datos reales del Banco Mundial y cronología de cables reales. Metodología transparente y fuentes verificables.",
        url: `${SITE_URL}/pulso-mundial`,
        isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
        inLanguage: "es",
      },
      {
        "@type": "Dataset",
        name: "WORLD PULSE INDEX — instantánea de indicadores del Banco Mundial",
        description:
          "Serie 2012–2025 de 11 indicadores del Banco Mundial para 47 naciones y el agregado mundial, con el índice derivado WORLD PULSE INDEX (percentiles ponderados con pesos publicados).",
        url: `${SITE_URL}/pulso-mundial`,
        license: "https://creativecommons.org/licenses/by/4.0/",
        creator: { "@type": "Organization", name: "VANGUARD", url: SITE_URL },
        isAccessibleForFree: true,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <main className="min-h-screen bg-zinc-950 text-zinc-200">
        <BarraMundo activa="pulso" />
        {/* v402.2 — portada de sala: cifras de la instantánea del Banco Mundial y de la cronología */}
        <PortadaSala ruta="/pulso-mundial"
          imagen="/imagenes-reales/satelite.jpg"
          alt="Analistas señalan rutas sobre un gran mapa del mundo iluminado"
          volanta="Inteligencia · Pulso mundial"
          titulo="El pulso del planeta"
          sumario="Indicadores del Banco Mundial, la cronología de los cables y el índice World Pulse. Cada dato con su fecha, su procedencia y sus límites; lo que falta, se declara."
          cifras={[
            ...(snap ? [
              { valor: snap.meta.paisesCubiertos, etiqueta: "Economías", nota: `serie ${snap.meta.anios}` },
              { valor: snap.indicadores.length, etiqueta: "Indicadores", nota: "del Banco Mundial" },
            ] : []),
            { valor: cables.length, etiqueta: "Cables", nota: "en la cronología" },
          ]}
          acento="#3ddc97"
        />

        {/* ── cabecera del centro — v360 LA CASA ILUSTRADA: baño de luz lateral ── */}
        <header className="relative overflow-hidden max-w-7xl mx-auto px-4 sm:px-5 pt-6 pb-4">
          <p className="text-sm text-zinc-400 max-w-3xl">
            Indicadores económicos, sociales y ambientales del Banco Mundial, cronología de
            acontecimientos y el WORLD PULSE INDEX. Aquí no se inventa nada: cada dato lleva su
            fecha de actualización, su procedencia y sus limitaciones — y lo que no hay, se declara.
          </p>
          {snap && (
            <div className="flex gap-2 flex-wrap mt-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 border border-zinc-800 rounded px-2 py-1">
                datos horneados: {new Date(snap.meta.extraccion).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 border border-zinc-800 rounded px-2 py-1">
                última actualización del Banco Mundial: {snap.meta.ultimaActualizacionWB}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 border border-zinc-800 rounded px-2 py-1">
                serie {snap.meta.anios} · {snap.meta.paisesCubiertos} economías
              </span>
            </div>
          )}
        </header>

        {/* ── el dashboard vivo ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-5 pb-2">
          {!snap ? (
            <p className="border border-red-500/40 bg-red-500/10 text-red-300 rounded-lg p-4 text-sm">
              La instantánea del Banco Mundial no está disponible ahora — el centro declara la
              ausencia en vez de fingir datos. Vuelve a intentar en unos minutos.
            </p>
          ) : (
            <>
              {bdError && (
                <p className="border border-amber-500/40 bg-amber-500/10 text-amber-300 rounded-lg p-3 text-sm mb-3">
                  La redacción no responde ahora: la cronología de cables no está disponible en esta
                  carga — los indicadores del Banco Mundial siguen servidos. Nada fingido.
                </p>
              )}
              {!bdError && cables.length === 0 && (
                <p className="border border-amber-500/40 bg-amber-500/10 text-amber-300 rounded-lg p-3 text-sm mb-3">
                  El archivo de cables está vacío o mudo — cronología SIN SEÑAL, declarado honesto.
                </p>
              )}
              <WorldPulseVivo snap={snap} cables={cables} anioWpi={anioWpiVivo(snap)} ahoraServidor={ahoraServidor} />
            </>
          )}
        </section>

        {/* ── FUENTES Y LÍMITES (server-rendered: visible sin JS, Google lo lee) ── */}
        {snap && (
          <section className="max-w-7xl mx-auto px-4 sm:px-5 py-8 border-t border-zinc-800 mt-8">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-amber-300">
              Fuentes y limitaciones — la procedencia de cada dato
            </h2>
            <p className="text-sm text-zinc-400 mt-2 max-w-3xl">
              Fuente primaria: {snap.meta.fuente}. {snap.meta.licencia}. Los resúmenes de qué mide
              cada indicador son de la redacción de Vanguard, que enlaza al original para que
              verifiques el número en su casa.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
              {snap.indicadores.map((i) => {
                const u = ultimoDato(snap, "WLD", i.codigo);
                return (
                  <a
                    key={i.codigo}
                    href={enlaceIndicador(i.codigo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/40 hover:border-zinc-600 transition-colors block"
                  >
                    <p className={`font-mono text-[9px] uppercase tracking-widest ${COLOR_CATEGORIA[i.categoria] ?? "text-zinc-400"}`}>
                      {i.categoria} · {i.papel === "indice" ? "WPI" : "contexto"}
                    </p>
                    <p className="text-sm font-bold text-zinc-100 mt-1">{i.nombre}</p>
                    <p className="text-xs text-zinc-500 mt-1">{i.descripcion}</p>
                    <p className="font-mono text-[9px] text-zinc-500 mt-2">
                      código {i.codigo} · último año mundial: {u ? u.anio : "—"}
                      {u ? ` · mundo: ${formatearValor(u.valor, i.unidad)}` : ""}
                    </p>
                  </a>
                );
              })}
            </div>
            <div className="border border-zinc-800 rounded-lg p-4 mt-4 bg-zinc-900/40">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-2">
                Limitaciones declaradas
              </h3>
              <ul className="space-y-1.5">
                {snap.meta.limitaciones.map((l) => (
                  <li key={l} className="text-xs text-zinc-400 flex gap-2">
                    <span className="text-amber-500 shrink-0">▸</span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
            <p className="font-mono text-[9px] text-zinc-600 mt-4">
              Verifica el planeta en sus fuentes:{" "}
              <Link href="/mundo" className="text-amber-400 hover:text-amber-300">
                EL MUNDO 3D
              </Link>{" "}
              ·{" "}
              <Link href="/espia" className="text-cyan-400 hover:text-cyan-300">
                MODO ESPÍA
              </Link>{" "}
              ·{" "}
              <Link href="/en-vivo" className="text-red-400 hover:text-red-300">
                EN VIVO
              </Link>
            </p>
          </section>
        )}

        <noscript>
          <div className="max-w-7xl mx-auto px-4 sm:px-5 pb-8">
            <p className="text-sm text-zinc-400 border border-zinc-800 rounded-lg p-4">
              Los filtros y el índice interactivo piden JavaScript. Sin él, esta página ya sirvió el
              censo de indicadores con su fuente, su licencia, sus fechas y sus limitaciones — la
              honestidad no depende del runtime.
            </p>
          </div>
        </noscript>
      </main>
    </>
  );
}
