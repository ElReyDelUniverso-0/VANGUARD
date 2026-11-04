import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { CONFLICTS } from "@/lib/game-data";
import { TEATROS } from "@/lib/teatros";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";

// v284.0 EL TABLERO DE LOS CONFLICTOS — la cabeza de la cola de la v283:
// CONFLICTS (game-data, 33 regiones con dossier real: nivel, intensidad,
// resumen, lat/lng, coste humano) sube al server como el índice que
// conecta el catálogo de la casa con las salas de teatro vivas
// (/conflicto/[tag], v206) y el mapa (/mundo, v215). La puerta solo se
// abre donde existe: teatros del mapa con cables reales en la BD — los
// demás se declaran honestos (nunca puertas muertas, ley v206).
//
// v285.0 EL TABLERO EN EL GLOBO — LA SEGUNDA CAPA (cola de la v284): la
// coordenada real de cada dossier se compone en la ficha («48.5°, 37.5°»,
// desde los lat/lng de la fuente) y cada región CON PULSO abre la puerta
// al globo («Encenderla en el globo ▸» → /mundo?teatro=<id> — el patrón
// ?guerra= de la v278 heredado de la ?teatro= de la v264): el globo la
// enciende porque el pulso que la puerta pide es el mismo que el tablero
// ya midió — cero consultas nuevas, cero puertas muertas.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CONFLICTOS — las 33 regiones en seguimiento de VANGUARD",
  description:
    "El tablero de conflictos de VANGUARD: cada región con su nivel, su intensidad y su dossier real — y la puerta a sus cables del archivo cuando la sala existe. Gratis, en español.",
  alternates: { canonical: `${SITE_URL}/conflictos` },
};

export default async function ConflictosPage() {
  // el pulso vivo: cables reales del archivo por conflictTag (lectura
  // pura — un solo escritor, la casa no escribe en la BD al servir)
  const vivo: Record<string, number> = {};
  try {
    const grupos = await db.newsItem.groupBy({
      by: ["conflictTag"],
      where: { externalId: { not: { startsWith: "curated-" } } },
      _count: { conflictTag: true },
    });
    for (const g of grupos) {
      const t = (g.conflictTag ?? "").trim().toUpperCase();
      if (t) vivo[t] = g._count.conflictTag;
    }
  } catch (e) {
    console.error("conflictos page error", e); // BD fría: el tablero duerme honesto
  }

  // TODO derivado de la fuente, nada a mano (directiva v266, lección v256)
  const niveles: string[] = [];
  for (const c of CONFLICTS) if (!niveles.includes(c.level)) niveles.push(c.level);
  const porNivel = niveles.map((n) => ({
    nivel: n,
    total: CONFLICTS.filter((c) => c.level === n).length,
  }));
  const sumaIntensidad = CONFLICTS.reduce((acc, c) => acc + c.intensity, 0);
  const intensidadMedia = Math.round(sumaIntensidad / CONFLICTS.length);
  const conPulso = CONFLICTS.filter((c) => (vivo[c.id.toUpperCase()] ?? 0) > 0);
  const lineaConflictos = `El tablero de los conflictos — ${CONFLICTS.length} regiones en seguimiento, ${conPulso.length} con pulso vivo en el archivo y ${CONFLICTS.length - conPulso.length} dormidas, con una intensidad media de ${intensidadMedia}/100`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "CONFLICTOS — las regiones en seguimiento de VANGUARD",
    description:
      "Cada región del tablero con su nivel, su intensidad y su dossier real; la puerta a sus cables cuando la sala existe.",
    url: `${SITE_URL}/conflictos`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: CONFLICTS.length,
      itemListElement: CONFLICTS.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
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
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
            ◈ VANGUARD · EL TABLERO
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-100">EL TABLERO DE LOS CONFLICTOS</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">{lineaConflictos}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {porNivel.map(({ nivel, total }) => (
              <span
                key={nivel}
                className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-zinc-400"
              >
                {`${nivel} ×${total}`}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CONFLICTS.map((c) => {
              const cables = vivo[c.id.toUpperCase()] ?? 0;
              const sala = TEATROS[c.id];
              return (
                <article
                  key={c.id}
                  className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                  aria-label={c.name}
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {c.level} · intensidad {c.intensity}/100 · {c.lat.toFixed(1)}°, {c.lng.toFixed(1)}°
                  </p>
                  <h2 className="mt-1 flex items-center gap-2 text-base font-semibold text-zinc-100">
                    <FlagBadge code={c.flag} />
                    {c.name}
                  </h2>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-zinc-400">{c.summary}</p>
                  {cables > 0 && (
                    <Link
                      href={`/mundo?teatro=${c.id}`}
                      className="mt-2 font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-amber-400 hover:underline"
                    >
                      Encenderla en el globo ▸
                    </Link>
                  )}
                  {sala ? (
                    <Link
                      href={`/conflicto/${c.id}`}
                      className="mt-3 font-mono text-[11px] font-bold uppercase tracking-widest text-amber-400 hover:underline"
                    >
                      {cables > 0
                        ? `${cables} cables del archivo — entrar a la sala ▸`
                        : "la sala existe y espera cables ▸"}
                    </Link>
                  ) : cables > 0 ? (
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                      {cables} cables en el archivo — su sala de teatro aún no existe
                    </p>
                  ) : (
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-zinc-600">
                      pulso dormido — sin sala de teatro todavía
                    </p>
                  )}
                </article>
              );
            })}
          </div>

          <p className="mt-8 text-[11px] leading-relaxed text-zinc-600">
            Los dossiers viajan verbatim de la fuente (game-data.ts), no de esta
            sala — y las puertas solo se abren donde el mapa ya tiene sala: el
            pulso lo escribe el archivo, nunca esta página. Las salas de teatro
            viven en /conflicto/[tag]; y cada región con pulso enciende el
            planeta con la puerta ?teatro= del globo (la misma que la v264
            abrió para las guerras de hoy y la v278 para la memoria).
          </p>
          <noscript>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              este tablero se sirve completo desde la casa — {lineaConflictos}
            </p>
          </noscript>
        </div>
      </main>
    </>
  );
}
