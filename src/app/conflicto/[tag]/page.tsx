import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { TEATROS, PAGE_SIZE_ARCHIVO } from "@/lib/teatros";
import { FlagBadge } from "@/components/vanguard/flag-badge";
// v218.0 EL NÚCLEO — enlaces contextuales calculados en el mismo render
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { enlacesDeRegion } from "@/lib/nucleo/relaciones";
// v227.0 EL DESPLIEGUE — los frentes documentados del teatro
import { geografiaDeTeatro } from "@/lib/nucleo/geografia";
import { puntosDelNucleo, idPunto } from "@/lib/nucleo/puntos";

// v206.0 MÁS PUERTAS — una página indexable POR TEATRO DE GUERRA.
// Nadie busca «Vanguard»: la gente busca «guerra en Ucrania hoy»,
// «noticias Gaza», «tensión Taiwán». Cada teatro con cables vivos en la
// BD tiene ahora su propia puerta server-rendered: titular, contador,
// últimos cables (cada uno hacia su /noticia/[id]), JSON-LD CollectionPage
// + ItemList y CTA hacia la app. Solo existen los teatros del mapa: una
// URL desconocida es 404 limpio (nunca páginas vacías para Google).
// v227.0 EL DESPLIEGUE — el teatro muestra SUS frentes documentados:
// los puntos de la sala OSINT (v129/v220/v225) como chips que llevan a
// su ficha vg:punto en /nucleo (la ficha lleva al mapa), con la fuente
// citada y la precisión a la vista. El teatro sin sala (korea) declara
// la ausencia — la casa no inventa puntos.

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

// v238.0 EL VELOCÍMETRO — la medición móvil mandó: los 6 fallbacks
// originales pesaban 1,2 MB en la red para un hueco de 120×90 px (el
// velocímetro midió 1165 KB de lazy en una visita fría del teatro). El
// hueco se sirve ahora con las variantes ligeras (480w, q80, ~158 KB en
// total, −87 %) — los ORIGINALES no se tocan: siguen sirviendo a sus
// otros consumidores (noticia, guerra-hoy, cine, biblioteca…).
const FALLBACK_IMGS = [
  "/assets/real/thumbs/drone-1.webp",
  "/assets/real/thumbs/city-1.webp",
  "/assets/real/thumbs/ship-1.webp",
  "/assets/real/thumbs/fire-1.webp",
  "/assets/real/thumbs/jet-1.webp",
  "/assets/real/thumbs/tanks-1.webp",
];

type NewsRow = {
  id: string;
  title: string;
  url: string;
  source: string;
  imageUrl: string | null;
  publishedAt: Date;
  tacticalTag: string | null;
  sourceCountry: string | null;
  summary: string | null;
};

// v263.0 EL ARCHIVO QUE CRECE — un candidato: un cable SIN etiqueta cuyas
// propias palabras citan el teatro. La sala no reclama el cable: declara
// QUÉ palabras abrieron la puerta y el visitante juzga.
type CandidatoRow = {
  id: string;
  title: string;
  source: string;
  sourceCountry: string | null;
  publishedAt: Date;
};
type Candidato = { row: CandidatoRow; citadas: string[] };

// v206.0: TEATROS vive en src/lib/teatros.ts — fuente única compartida con
// sitemap.ts (las puertas anunciadas a Google salen del mismo mapa).

const TAG_COLOR: Record<string, string> = {
  ALERTA: "text-red-300 border-red-400/40 bg-red-400/10",
  DIPLOMACIA: "text-sky-300 border-sky-400/40 bg-sky-400/10",
  ECONOMIA: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
  HUMANITARIO: "text-violet-300 border-violet-400/40 bg-violet-400/10",
  ANALISIS: "text-amber-300 border-amber-400/40 bg-amber-400/10",
  INFO: "text-zinc-400 border-zinc-600 bg-zinc-800/60",
};

function hace(fecha: Date): string {
  const min = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
}

function imgDe(it: NewsRow, i: number): string {
  return it.imageUrl || FALLBACK_IMGS[i % FALLBACK_IMGS.length];
}

// v261.0 LA SALA COMPLETA — el archivo del teatro se pagina EN EL SERVIDOR:
// la sala de ucrania guarda 173 cables pero la puerta solo encendía los
// primeros 40 — los otros 133 existían en la BD y no tenían puerta. La
// count real (v209) manda el número de páginas, findMany salta con skip,
// y la última señal de la cabecera se mide sobre TODO el archivo
// (findFirst), no sobre la cabeza de la página: la misma verdad en la
// página 1 y en la 5. Cero JavaScript: Links de servidor, nada más.
// v269: el tamaño vive en la FUENTE (lib/teatros) — sala y sitemap
// derivan con el mismo número, una sola verdad para todo el archivo.
const PAGE_SIZE = PAGE_SIZE_ARCHIVO;

async function getCables(
  tag: string,
  page: number,
): Promise<{ total: number; items: NewsRow[]; ultimaSenal: Date | null }> {
  try {
    const [total, items, ultima] = await Promise.all([
      db.newsItem.count({ where: { conflictTag: tag } }),
      db.newsItem.findMany({
        where: { conflictTag: tag },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      // v261.0: la última señal del archivo entero — una fila con índice
      db.newsItem.findFirst({
        where: { conflictTag: tag },
        orderBy: { publishedAt: "desc" },
        select: { publishedAt: true },
      }),
    ]);
    return {
      total,
      items: items as NewsRow[],
      ultimaSenal: ultima ? new Date(ultima.publishedAt) : null,
    };
  } catch {
    return { total: 0, items: [], ultimaSenal: null };
  }
}

// v263.0 EL ARCHIVO QUE CRECE — los 1396 cables sin etiqueta (74 % del
// archivo) no tenían puerta a ninguna sala, aunque sus propias palabras
// citaran el teatro. El hallazgo se hace EN LECTURA, sin escribir en la BD
// (la casa no clasifica a mano — un solo escritor): un pool acotado de los
// 1000 sin etiqueta más recientes (una consulta, campos mínimos), y el
// cruce con las claves canónicas del catálogo en JS — acentos y mayúsculas
// resueltos con toLowerCase, cero trucos SQL. La sala pinta hasta 6
// candidatos y declara QUÉ palabras abrieron cada puerta: derivación
// transparente, cero invención. Pool vacío o BD caída: la sección ni se
// pinta (vacío honesto, ley de la casa).
const POOL_SIN_ETIQUETA = 1000;

async function getCandidatos(claves: string[]): Promise<Candidato[]> {
  if (claves.length === 0) return [];
  try {
    const pool = await db.newsItem.findMany({
      where: { conflictTag: null },
      orderBy: { publishedAt: "desc" },
      take: POOL_SIN_ETIQUETA,
      select: {
        id: true,
        title: true,
        source: true,
        sourceCountry: true,
        publishedAt: true,
        summary: true,
      },
    });
    return pool
      .map((r) => {
        const texto = `${r.title} ${r.summary ?? ""}`.toLowerCase();
        const citadas = claves.filter((k) => texto.includes(k));
        return citadas.length > 0
          ? { row: r as CandidatoRow, citadas: citadas.slice(0, 2) }
          : null;
      })
      .filter((c): c is Candidato => c !== null)
      .slice(0, 6);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const teatro = TEATROS[tag];
  if (!teatro) return { title: "Teatro no disponible · VANGUARD" };
  const { total } = await getCables(tag, 1);
  // v261.0 — cada página del archivo se canónica a sí misma (la 1, al
  // limpio): Google puede indexar el archivo entero, no solo la cabeza.
  const pedida = Number.parseInt((await searchParams).page ?? "1", 10);
  const page = Number.isInteger(pedida) && pedida > 1 ? pedida : 1;
  const canon =
    page > 1
      ? `${SITE_URL}/conflicto/${tag}?page=${page}`
      : `${SITE_URL}/conflicto/${tag}`;
  const sufijo = page > 1 ? ` — página ${page}` : "";
  // v206.1: sin «| VANGUARD» — el title.template del layout (%s · VANGUARD)
  // ya añade la marca; duplicarla era redundante en resultados.
  const title = `Guerra en ${teatro.nombre}: noticias del conflicto en vivo hoy${sufijo}`;
  const desc = `${teatro.resumen} ${total} cables verificados en la agencia — seguimiento en vivo con mapa OSINT 3D. Gratis, en español.`;
  return {
    title,
    description: desc.slice(0, 300),
    alternates: { canonical: canon },
    openGraph: {
      type: "website",
      url: canon,
      title,
      description: desc.slice(0, 300),
      siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
      locale: "es_ES",
      images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description: desc.slice(0, 300) },
  };
}

export default async function ConflictoPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { tag } = await params;
  const teatro = TEATROS[tag];
  if (!teatro) notFound();

  // v261.0 LA SALA COMPLETA — la página pedida: entera y ≥ 1, o 404
  // limpio (una sala vacía para Google jamás).
  const pedida = Number.parseInt((await searchParams).page ?? "1", 10);
  if (!Number.isInteger(pedida) || pedida < 1) notFound();

  const { total, items, ultimaSenal } = await getCables(tag, pedida);
  // Sin cables vivos la puerta no se abre (nada vacío para Google)
  if (items.length === 0) notFound();
  const paginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pedida > paginas) notFound();
  const page = pedida;

  // v227.0 EL DESPLIEGUE — los frentes documentados del teatro (sala
  // OSINT v129 proyectada por v220 como entidades v225). CERO
  // coordenadas aquí: el catálogo solo proyecta la geografía de la casa.
  const frentes = puntosDelNucleo().filter((p) => p.teatro === tag);
  const geoTeatro = geografiaDeTeatro(tag);

  // v261.0 — la línea del nav se compone COMPLETA en JS antes del JSX
  // (lección v256: React SSR intercala <!-- --> entre texto e interpolación)
  const lineaPaginacion = `página ${page} de ${paginas} — ${total} cables en el archivo del teatro`;

  // v263.0 — los candidatos solo viajan en la cabeza de la sala (página 1):
  // las páginas hondas del archivo no pagan la consulta.
  const candidatos = page === 1 ? await getCandidatos(teatro.claves) : [];
  const lineaCandidatos = `El archivo que crece — ${candidatos.length} cables sin etiqueta citan esta sala`;

  // v261.0: la última señal del ARCHIVO, no la de esta página — la
  // cabecera dice la verdad en la página 1 y en la última
  const fechaUltima = ultimaSenal ?? (items[0] ? new Date(items[0].publishedAt) : null);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Conflicto en ${teatro.nombre} — noticias en vivo`,
    description: teatro.resumen,
    url: `${SITE_URL}/conflicto/${tag}`,
    inLanguage: "es",
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.slice(0, 10).map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/noticia/${it.id}`,
        name: it.title,
      })),
    },
  };

  const otrosTeatros = Object.entries(TEATROS).filter(([k]) => k !== tag);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />

      {/* barra superior */}
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
        {/* hero del teatro */}
        <header>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-widest text-red-300 border border-red-400/40 bg-red-400/10 rounded px-1.5 py-0.5">
              Teatro en vivo
            </span>
            <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
              {total} cables en la agencia
              {fechaUltima && ` · última señal hace ${hace(fechaUltima)}`}
            </span>
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight text-zinc-100">
            Guerra en {teatro.nombre}:{" "}
            <span className="text-amber-400">noticias en vivo hoy</span>
          </h1>
          <p className="mt-3 text-base text-zinc-400 leading-relaxed">{teatro.resumen}</p>
        </header>

        {/* CTA temprano */}
        <div className="mt-6 border border-amber-500/40 bg-amber-500/5 rounded-md p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-300 max-w-md leading-relaxed">
            Este teatro se traza en el <strong className="text-amber-300">mapa OSINT 3D</strong> de
            Vanguard, con alertas en vivo y sala de guerra multijugador. Gratis, sin instalar nada.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {/* v215.0 EL MUNDO — el teatro vive EN el planeta 3D */}
            <Link
              href={`/mundo?teatro=${tag}`}
              className="border border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-mono text-[11px] uppercase tracking-widest rounded px-4 py-2.5 transition-colors"
            >
              Ver en el mundo 3D ▸
            </Link>
            <Link
              href="/"
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm uppercase tracking-wider rounded px-5 py-2.5 transition-colors"
            >
              Entrar al mundo en vivo →
            </Link>
          </div>
        </div>

        {/* v227.0 EL DESPLIEGUE — los frentes documentados del teatro */}
        {frentes.length > 0 ? (
          <section className="mt-8" aria-label="Frentes documentados del teatro">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
              Los frentes del teatro — {frentes.length} documentados
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {frentes.map((p) => (
                <Link
                  key={p.clave}
                  href={`/nucleo?id=${encodeURIComponent(idPunto(p.clave))}`}
                  title={p.nota || undefined}
                  className="border border-zinc-800 hover:border-lime-400/50 rounded px-3 py-1.5 text-sm text-zinc-300 bg-zinc-900/40 transition-colors"
                >
                  {p.nombre}
                  <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider"> · {p.estado}</span>
                </Link>
              ))}
            </div>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
              mapa OSINT · fuente: {geoTeatro.fuenteDatos ?? "sala de guerra de la casa"} · NO cartografía oficial
              {geoTeatro.salaGuerra && (
                <>
                  {" · "}
                  <Link
                    href="/ver-guerra"
                    className="underline decoration-zinc-700 underline-offset-2 hover:text-amber-400"
                  >
                    el mapa del frente ▸
                  </Link>
                </>
              )}
            </p>
          </section>
        ) : (
          <section className="mt-8" aria-label="Frentes del teatro">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              Sin frentes documentados en este teatro — la casa no inventa puntos (se declara, no se finge).
            </p>
          </section>
        )}

        {/* cables del teatro */}
        <section className="mt-8 flex flex-col gap-3">
          {items.map((it, i) => {
            const t = (it.tacticalTag || "INFO").toUpperCase();
            return (
              <Link
                key={it.id}
                href={`/noticia/${it.id}`}
                className="group flex gap-3 items-start border border-zinc-800 hover:border-amber-500/50 rounded-md overflow-hidden bg-zinc-900/40 transition-colors"
              >
                <img
                  src={imgDe(it, i)}
                  alt={it.title}
                  width={120}
                  height={90}
                  // v222.0 LA PLUMA — diferidas y async: en el móvil estas
                  // imágenes están ocultas (hidden sm:block) pero el navegador
                  // las DESCARGABA igual (40 remotas de golpe); loading="lazy"
                  // las mantiene fuera del cable hasta que hacen falta y el
                  // costo de datos del teatro en el bolsillo cae al mínimo.
                  loading="lazy"
                  decoding="async"
                  className="hidden sm:block w-[120px] h-[90px] object-cover shrink-0"
                />
                <div className="p-3 flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-mono text-[9px] uppercase tracking-widest border rounded px-1.5 py-0.5 ${TAG_COLOR[t] || TAG_COLOR.INFO}`}
                    >
                      {t}
                    </span>
                    {it.sourceCountry && <FlagBadge code={it.sourceCountry} />}
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                      {it.source} · hace {hace(new Date(it.publishedAt))}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold leading-snug text-zinc-200 group-hover:text-amber-300 transition-colors">
                    {it.title}
                  </h2>
                  {it.summary && (
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                      {it.summary}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </section>

        {/* v261.0 LA SALA COMPLETA — el resto del archivo, a un toque: cero JS, la count real manda */}
        {paginas > 1 && (
          <nav
            aria-label="Paginación del archivo del teatro"
            className="mt-8 border-t border-zinc-800 pt-4"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {lineaPaginacion}
            </p>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {page > 1 && (
                <Link
                  href={
                    page - 1 === 1
                      ? `/conflicto/${tag}`
                      : `/conflicto/${tag}?page=${page - 1}`
                  }
                  className="border border-zinc-800 hover:border-amber-500/50 hover:text-amber-300 rounded px-3 py-1.5 text-sm text-zinc-300 bg-zinc-900/40 transition-colors"
                >
                  ◀ anterior
                </Link>
              )}
              {Array.from({ length: paginas }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={p === 1 ? `/conflicto/${tag}` : `/conflicto/${tag}?page=${p}`}
                  aria-current={p === page ? "page" : undefined}
                  className={
                    p === page
                      ? "border border-amber-500/50 bg-amber-500/10 text-amber-300 rounded px-3 py-1.5 text-sm font-bold"
                      : "border border-zinc-800 hover:border-amber-500/50 hover:text-amber-300 rounded px-3 py-1.5 text-sm text-zinc-400 bg-zinc-900/40 transition-colors"
                  }
                >
                  {p}
                </Link>
              ))}
              {page < paginas && (
                <Link
                  href={`/conflicto/${tag}?page=${page + 1}`}
                  className="border border-zinc-800 hover:border-amber-500/50 hover:text-amber-300 rounded px-3 py-1.5 text-sm text-zinc-300 bg-zinc-900/40 transition-colors"
                >
                  siguiente ▶
                </Link>
              )}
            </div>
          </nav>
        )}

        {/* v263.0 EL ARCHIVO QUE CRECE — cables sin etiqueta que citan esta
            sala: la derivación es transparente (qué palabras abrieron cada
            puerta) y la casa no escribe en el archivo, solo abre la puerta.
            Vacío honesto: sin candidatos la sección ni se pinta. */}
        {candidatos.length > 0 && (
          <section
            className="mt-8"
            aria-label="Cables sin etiqueta que citan esta sala"
          >
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
              {lineaCandidatos}
            </h2>
            <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
              Hallados entre los {POOL_SIN_ETIQUETA} cables sin etiqueta más
              recientes del archivo: las palabras del propio cable — lugares y
              actores de {teatro.nombre} — abren la puerta. La casa no escribe
              en el archivo (un solo escritor): solo abre la puerta y declara
              qué la abrió.
            </p>
            <ul className="mt-3 space-y-2">
              {candidatos.map((c) => (
                <li key={c.row.id}>
                  <Link
                    href={`/noticia/${c.row.id}`}
                    className="group block border border-zinc-800 hover:border-amber-500/50 rounded-md p-3 bg-zinc-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[9px] uppercase tracking-widest border rounded px-1.5 py-0.5 text-zinc-400 border-zinc-600 bg-zinc-800/60">
                        SIN ETIQUETA
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                        {c.row.source} · hace {hace(new Date(c.row.publishedAt))}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-hud">
                        citan: {c.citadas.join(" · ")}
                      </span>
                    </div>
                    <h3 className="mt-1 text-sm font-bold leading-snug text-zinc-200 group-hover:text-amber-300 transition-colors">
                      {c.row.title}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* texto indexable de contexto */}
        <div className="mt-8 text-[13px] text-zinc-500 leading-relaxed">
          <p>
            Esta página del teatro <strong>{teatro.nombre}</strong> se actualiza con los cables que
            la agencia de Vanguard recibe de GDELT y más de 15 medios internacionales, verificados
            por fuente y clasificados por tipo de señal (alerta, diplomacia, economía,
            humanitario). Las noticias reales de este conflicto disparan las operaciones de la sala
            de guerra: cuando el mundo escala, el mapa escala con él. Sigue el planeta completo en{" "}
            <Link href="/guerra-hoy" className="text-amber-500/80 hover:text-amber-400 underline underline-offset-2">
              la primera página
            </Link>{" "}
            o entra al teatro de guerra con la ciudad que cae en{" "}
            <Link href="/zona-cero" className="text-amber-500/80 hover:text-amber-400 underline underline-offset-2">
              /zona-cero
            </Link>
            .
          </p>
        </div>

        {/* v218.0 EL NÚCLEO — la conexión explícita con el resto de la casa */}
        <EnlacesNucleo enlaces={enlacesDeRegion(tag)} titulo="CONECTA CON EL NÚCLEO" />

        {/* otros teatros — más puertas internas */}
        <section className="mt-10">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
            Otros teatros en vivo
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {otrosTeatros.map(([k, t]) => (
              <Link
                key={k}
                href={`/conflicto/${k}`}
                className="border border-zinc-800 hover:border-amber-500/50 hover:text-amber-300 rounded px-3 py-1.5 text-sm text-zinc-300 bg-zinc-900/40 transition-colors"
              >
                {t.nombre}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
