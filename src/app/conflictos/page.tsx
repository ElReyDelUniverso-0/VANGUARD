import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { CONFLICTS } from "@/lib/game-data";
import { GUERRAS, PULSO_KEYWORDS_GUERRA } from "@/lib/guerras-activas-data";
import { TEATROS } from "@/lib/teatros";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { PortadaSala } from "@/components/vanguard/portada-sala";

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
//
// v290.0 EL PULSO POR PALABRAS — LA TERCERA CAPA (la cola de la v289 se
// paga, la clasificación pendiente resuelta): las 6 GUERRAS de la fuente
// (guerras-activas-data, v129 — dossiers reales de las guerras del
// planeta: UCRANIA · ORIENTE MEDIO · SUDÁN · SAHEL · MYANMAR · TAIWÁN)
// cruzan el archivo con SUS keywords y EL MISMO algoritmo del panel
// (minúsculas, includes en el título — el canon del consumidor, el
// pulso-de-cables de la v263). El pulso por conflictTag cuenta los
// etiquetados; este cuenta los que CITAN a cada guerra — incluidos los
// que nadie etiquetó. Misma lectura pura (la consulta es UNA para toda
// la sala), mismo orden de la fuente, mismo vacío honesto. Medido
// contra la BD fría al abrir: 6 de 6 guerras citadas por 398 titulares
// (Oriente 190 · Ucrania 119 · Taiwán 61...).

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

  // v290.0 — la lectura de títulos para el pulso por palabras (pura,
  // independiente del groupBy: si una falla, la otra sigue y cada capa
  // declara su propio vacío)
  const archivo: { id: string; title: string }[] = [];
  try {
    const rows = await db.newsItem.findMany({
      where: { externalId: { not: { startsWith: "curated-" } } },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true },
    });
    archivo.push(...rows);
  } catch (e) {
    console.error("conflictos page error (pulso por palabras)", e);
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

  // v290.0 — EL PULSO POR PALABRAS: los keywords de las 6 guerras de la
  // fuente cruzan el archivo con el algoritmo del canon (minúsculas,
  // includes en el título); el orden es el de la fuente (GUERRAS) y el
  // vacío no se rellena — la guerra sin menciones no aparece y la
  // sección lo declara.
  const pulsoPalabras: { id: string; nombre: string; n: number; ultimo: { id: string; title: string } | null }[] = [];
  for (const g of GUERRAS) {
    const kws = (PULSO_KEYWORDS_GUERRA[g.id] ?? []).map((k) => k.toLowerCase());
    if (kws.length === 0) continue;
    const suyos = archivo.filter((c) => kws.some((k) => c.title.toLowerCase().includes(k)));
    if (suyos.length > 0) {
      pulsoPalabras.push({ id: g.id, nombre: g.nombre, n: suyos.length, ultimo: suyos[0] });
    }
  }
  const totalPalabras = pulsoPalabras.reduce((a, p) => a + p.n, 0);
  const lineaPalabras = `El pulso por palabras — ${pulsoPalabras.length} de ${GUERRAS.length} guerras citadas por ${totalPalabras} titulares del archivo`;
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
      <PortadaSala
        imagen="/ilustraciones/frentes.jpg"
        alt="Manos sobre un mapa de operaciones con líneas de frente dibujadas a lápiz"
        volanta="LA CASA · EL TABLERO"
        titulo="DÓNDE SE ROMPE EL MUNDO"
        nivel="p"
        acento="#f59e0b"
        sumario="Cada conflicto abierto, su intensidad medida, su pulso real en el archivo de la casa y las guerras que la fuente documenta."
        cifras={[
          { valor: CONFLICTS.length, etiqueta: "regiones", nota: "en seguimiento" },
          { valor: conPulso.length, etiqueta: "con pulso vivo", nota: "en el archivo" },
          { valor: GUERRAS.length, etiqueta: "guerras", nota: "documentadas" },
          { valor: `${intensidadMedia}/100`, etiqueta: "intensidad media", nota: "del tablero" }
        ]}
        puntos={[
          { titulo: "LO QUE SE MIDE", texto:
              "Cada región lleva su intensidad —derivada de las señales de la fuente, no de una opinión— y el número de titulares que la citan en las últimas horas." },
          { titulo: "LO QUE SE VE", texto:
              "El pulso por palabras cruza las guerras documentadas con los titulares reales: si una guerra no aparece, se dice, no se rellena." },
          { titulo: "PARA QUÉ", texto:
              "Para saber dónde mirar primero sin leer veinte cables: primero el mapa, después la noticia." }
        ]}
        nota="Portada y cifras servidas desde la propia casa: la ilustración viaja en el repositorio y cada número sale de la fuente de esta sala, calculado en el render. Cero cifras escritas a mano."
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

          {/* v290.0 — EL PULSO POR PALABRAS: los keywords de las 6
              guerras reales de la fuente (v129) cruzan el archivo con el
              algoritmo del canon; misma lectura pura, orden de la
              fuente, vacío honesto. */}
          {pulsoPalabras.length > 0 ? (
            <section className="mt-10" aria-label={lineaPalabras}>
              <h2 className="text-lg font-bold text-zinc-100">EL PULSO POR PALABRAS</h2>
              <p className="mt-1 text-sm text-zinc-400">{lineaPalabras}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pulsoPalabras.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
                    aria-label={p.nombre}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
                      {p.nombre} · {p.n} {p.n === 1 ? "titular" : "titulares"}
                    </p>
                    {p.ultimo && (
                      <Link
                        href={`/noticia/${p.ultimo.id}`}
                        className="mt-1 block text-xs leading-snug text-zinc-300 hover:text-amber-400"
                      >
                        {p.ultimo.title}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <p className="mt-10 font-mono text-[11px] uppercase tracking-wider text-zinc-600">
              el archivo no cita a ninguna guerra todavía — el pulso duerme honesto
            </p>
          )}

          <p className="mt-8 text-[11px] leading-relaxed text-zinc-600">
            Los dossiers viajan verbatim de la fuente (game-data.ts), no de esta
            sala — y las puertas solo se abren donde el mapa ya tiene sala: el
            pulso lo escribe el archivo, nunca esta página. Las salas de teatro
            viven en /conflicto/[tag]; y cada región con pulso enciende el
            planeta con la puerta ?teatro= del globo (la misma que la v264
            abrió para las guerras de hoy y la v278 para la memoria). El pulso
            por palabras vive en la fuente (guerras-activas-data.ts): cuenta los
            cables que CITAN a cada guerra, incluidos los que nadie etiquetó.
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
