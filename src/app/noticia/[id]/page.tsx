import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
// v211.0 EL VÉRTIGO — el up next (fórmula YouTube) en la sala de lectura
import { SiguienteChip } from "@/components/noticia/siguiente-chip";
// v215.0 MODO TRADUCTOR — el cable en los 8 idiomas de Vanguard
import { TraductorChip } from "@/components/noticia/traductor-chip";
// v218.0 EL NÚCLEO — enlaces contextuales calculados en el mismo render
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { enlacesDeCable } from "@/lib/nucleo/relaciones";

// v202.0 PUERTAS ABIERTAS — cada noticia es UNA PUERTA propia de entrada.
// Antes: todas las noticias regalaban el click a la fuente externa con
// nofollow y Google no tenía ninguna página de Vanguard a la que llevar
// gente que busca «guerra hoy». Ahora: /noticia/[id] renderiza EN EL
// SERVIDOR el cable real de la BD con su propia metadata (título, resumen,
// imagen), JSON-LD NewsArticle para Google News/Discover, cables
// relacionados (más puertas internas) y CTA hacia la app.

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

// v239.0 EL FRENTE LIGERO — DOS pieles para DOS deberes:
// · FALLBACK_IMGS (JPG original) viste el hero (slot w-full) y la metadata
//   social — og/twitter declaran 1200×630 y el JSON-LD la anuncia a Google:
//   ahí una thumb de 480w sería mentirle al crawler y borrosa en pantalla.
// · FALLBACK_THUMBS (WebP 480w de v238) viste SOLO las cards relacionadas
//   (slots de 96×72 px) — el mismo patrón honesto de /conflicto y /guerra-hoy.
//
// v247.0 LA CARGA JUSTA — la medición mandó: la página /noticia típica
// cargaba ~342 KB de imágenes TODAS eager (hero JPG de 70–210 KB + 5 thumbs
// sin pereza) y la metadata og/twitter declaraba 1200×630, una dimensión
// que NINGÚN archivo de la casa tenía (1600×1067, 842×1264 vertical…).
// Tres curas medidas (scripts/hornear-og.mjs es el horno, sharp la lumbre):
// · FALLBACK_OG (WebP 1200×630 EXACTO, q72 — city-1: 210 KB → 40 KB, −81%)
//   viste el HERO de la página: el slot era w-full max-h-420 object-cover,
//   o sea que el navegador ya recortaba en pantalla — ahora el archivo
//   viaja recortado. El hero lleva fetchpriority="high" porque ES el LCP.
// · Las cards relacionadas llevan loading="lazy": están bajo el primer
//   scroll (y ocultas en móvil) — dejaron de competir con el primer paint.
// · La metadata social SIGUE en JPG (compatibilidad de crawlers, v239
//   intacto) pero ahora declara las dimensiones REALES de cada archivo,
//   medidas con sharp y congeladas en DIMS_REALES — el 1200×630 inventado
//   queda fuera de la ruta de fallback. Para una imageUrl externa que la
//   casa no conozca, dimsDe() devuelve null y las claves width/height se
//   OMITEN — declarar ciegas sería volver a mentir (censo v247: 0 externas
//   en la BD hoy; las 20 locales están en la tabla).
const FALLBACK_IMGS = [
  "/assets/real/drone-1.jpg",
  "/assets/real/city-1.jpg",
  "/assets/real/ship-1.jpg",
  "/assets/real/fire-1.jpg",
  "/assets/real/jet-1.jpg",
  "/assets/real/tanks-1.jpg",
];

const FALLBACK_THUMBS = [
  "/assets/real/thumbs/drone-1.webp",
  "/assets/real/thumbs/city-1.webp",
  "/assets/real/thumbs/ship-1.webp",
  "/assets/real/thumbs/fire-1.webp",
  "/assets/real/thumbs/jet-1.webp",
  "/assets/real/thumbs/tanks-1.webp",
];

// v247.0 LA CARGA JUSTA — la piel hero: 1200×630 exactos, horneados desde
// la JPG original (misma fotografía, recorte que el navegador ya hacía).
const FALLBACK_OG = [
  "/assets/real/og/drone-1.webp",
  "/assets/real/og/city-1.webp",
  "/assets/real/og/ship-1.webp",
  "/assets/real/og/fire-1.webp",
  "/assets/real/og/jet-1.webp",
  "/assets/real/og/tanks-1.webp",
];

// v247.0 — dimensiones REALES de los archivos locales, medidas con sharp
// por scripts/hornear-og.mjs (la tabla se regenera con esa corrida). Es la
// verdad que og/twitter declaran desde esta ronda: cada cifra corresponde
// a un archivo que existe — cero dims inventadas en la ruta local.
const DIMS_REALES: Record<string, { w: number; h: number }> = {
  "arty-1": { w: 1600, h: 900 },
  "carrier-1": { w: 1300, h: 1300 },
  "city-1": { w: 842, h: 1264 },
  "city-2": { w: 1600, h: 1067 },
  "desert-1": { w: 1280, h: 782 },
  "desert-2": { w: 1280, h: 782 },
  "drone-1": { w: 1600, h: 1067 },
  "drone-2": { w: 1600, h: 1115 },
  "fire-1": { w: 1600, h: 900 },
  "fire-2": { w: 1600, h: 776 },
  "heli-1": { w: 1200, h: 856 },
  "heli-2": { w: 1200, h: 856 },
  "jet-1": { w: 1600, h: 900 },
  "jet-2": { w: 1200, h: 800 },
  "missile-1": { w: 1200, h: 675 },
  "missile-2": { w: 1296, h: 721 },
  "parade-1": { w: 1600, h: 900 },
  "radar-1": { w: 1600, h: 900 },
  "ship-1": { w: 1280, h: 720 },
  "ship-2": { w: 1104, h: 1100 },
  "sub-1": { w: 1300, h: 925 },
  "tanks-1": { w: 1300, h: 928 },
  "tanks-2": { w: 1600, h: 901 },
  "wall-1": { w: 1600, h: 899 },
};

function stemDe(url: string): string | null {
  const m = url.match(/^\/assets\/real\/([a-z0-9-]+)\.jpg$/);
  return m ? m[1] : null;
}

// v247.0 — el hero que la página sirve: si el cable cae en fallback o su
// foto es una de las JPG locales conocidas, viaja la variante og WebP
// (misma fotografía, 1200×630, una fracción del peso); si es una URL que
// la casa no conoce (externa), viaja tal cual — tocarla sería adivinar.
function heroDe(it: NewsRow | null, i = 0): string {
  if (it?.imageUrl) {
    const stem = stemDe(it.imageUrl);
    if (stem && DIMS_REALES[stem]) return `/assets/real/og/${stem}.webp`;
    return it.imageUrl;
  }
  return FALLBACK_OG[i % FALLBACK_OG.length];
}

// v247.0 — dims reales de la imagen que declara la metadata social (la JPG
// original, no la piel og). null = URL desconocida para la casa: se omiten
// width/height antes que declarar cifras inventadas.
function dimsDe(url: string): { w: number; h: number } | null {
  const stem = stemDe(url);
  return (stem && DIMS_REALES[stem]) || null;
}

type NewsRow = {
  id: string;
  title: string;
  url: string;
  source: string;
  imageUrl: string | null;
  publishedAt: Date;
  tacticalTag: string | null;
  conflictTag: string | null;
  sourceCountry: string | null;
  summary: string | null;
};

async function getCable(id: string): Promise<NewsRow | null> {
  try {
    const row = await db.newsItem.findUnique({ where: { id } });
    return (row as NewsRow) || null;
  } catch {
    return null;
  }
}

// v208.0 LA LUPA — «relacionadas» ahora significa RELACIONADAS: primero
// las mismas del MISMO teatro (conflictTag, índice nuevo), y solo se rellena
// con las últimas si el teatro no da suficientes. Antes: «últimas 5 sin más»
// — un cable de Gaza terminaba rodeado de noticias de Taiwán.
async function getRelacionadas(id: string, tag: string | null, n = 5): Promise<NewsRow[]> {
  try {
    const mismas = tag
      ? await db.newsItem.findMany({
          where: { conflictTag: tag, id: { not: id } },
          orderBy: { publishedAt: "desc" },
          take: n,
        })
      : [];
    if (mismas.length >= n) return mismas as NewsRow[];
    const vistas = new Set(mismas.map((r) => r.id));
    const relleno = await db.newsItem.findMany({
      where: { id: { not: id } },
      orderBy: { publishedAt: "desc" },
      take: n * 2,
    });
    return [...(mismas as NewsRow[]), ...(relleno as NewsRow[]).filter((r) => !vistas.has(r.id))].slice(0, n);
  } catch {
    return [];
  }
}

function imgDe(it: NewsRow | null, i = 0): string {
  return it?.imageUrl || FALLBACK_IMGS[i % FALLBACK_IMGS.length];
}

// v239.0 EL FRENTE LIGERO — la piel ligera para los slots pequeños:
// si el cable tiene foto externa viaja esa; si cae en fallback, la thumb.
function thumbDe(it: NewsRow | null, i = 0): string {
  return it?.imageUrl || FALLBACK_THUMBS[i % FALLBACK_THUMBS.length];
}

function hace(fecha: Date): string {
  const min = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
}

const TAG_COLOR: Record<string, string> = {
  ALERTA: "text-red-300 border-red-400/40 bg-red-400/10",
  DIPLOMACIA: "text-sky-300 border-sky-400/40 bg-sky-400/10",
  ECONOMIA: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
  HUMANITARIO: "text-violet-300 border-violet-400/40 bg-violet-400/10",
  ANALISIS: "text-amber-300 border-amber-400/40 bg-amber-400/10",
  INFO: "text-zinc-400 border-zinc-600 bg-zinc-800/60",
};

// ---------- METADATA PROPIA POR NOTICIA (lo que ve Google al compartir) ----------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const it = await getCable(id);
  if (!it) {
    return { title: "Cable no disponible · VANGUARD" };
  }
  // v206.1: sin «| VANGUARD» — el title.template del layout (%s · VANGUARD)
  // ya añade la marca; duplicarla era redundante en resultados.
  const titulo = it.title;
  const desc =
    it.summary ||
    `${it.title} — cable de ${it.source} en VANGUARD, la plataforma de conflictos mundiales en tiempo real: mapa OSINT 3D, noticias en vivo y guerra global multijugador. Gratis, en español.`;
  const img = imgDe(it);
  const url = `${SITE_URL}/noticia/${it.id}`;
  // v247.0 LA CARGA JUSTA — las dims que se declaran son las del archivo:
  // medidas para toda la ruta local (DIMS_REALES), omitidas si la URL es
  // desconocida — el 1200×630 inventado que v239 heredó muere aquí.
  const dims = dimsDe(img);
  return {
    title: titulo,
    description: desc.slice(0, 300),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: it.title,
      description: desc.slice(0, 300),
      siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
      locale: "es_ES",
      images: [
        {
          url: img,
          ...(dims ? { width: dims.w, height: dims.h } : {}),
          alt: it.title,
        },
      ],
      publishedTime: new Date(it.publishedAt).toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: it.title,
      description: desc.slice(0, 300),
      images: [img],
    },
  };
}

// ---------- LA PUERTA ----------
export default async function NoticiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const it = await getCable(id);
  if (!it) notFound();

  const relacionadas = await getRelacionadas(id, it.conflictTag ?? null);
  // v211.0 EL VÉRTIGO — la fórmula YouTube: el «SIGUIENTE» ya viene elegido
  // de la server page (mismo teatro primero, la lógica de LA LUPA) y el chip
  // client solo lo muestra cuando el lector ya pasó la mitad del artículo.
  const siguiente = relacionadas[0] ?? null;
  const tag = (it.tacticalTag || "INFO").toUpperCase();
  // v247.0 LA CARGA JUSTA — dos URLs, dos deberes (el patrón v239 afinado):
  // img para la metadata social (JPG original, dims reales), hero para el
  // <img> de la página (piel og WebP 1200×630, una fracción del peso).
  const img = imgDe(it);
  const hero = heroDe(it);
  const heroDims = hero === it.imageUrl && it.imageUrl ? dimsDe(it.imageUrl) : { w: 1200, h: 630 };
  const fecha = new Date(it.publishedAt);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: it.title,
    description: it.summary || it.title,
    image: [new URL(img, SITE_URL).toString()],
    datePublished: fecha.toISOString(),
    dateModified: fecha.toISOString(),
    inLanguage: "es",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/noticia/${it.id}`,
    },
    publisher: {
      "@type": "Organization",
      name: "VANGUARD",
      url: SITE_URL,
    },
    sourceOrganization: { "@type": "Organization", name: it.source },
  };

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
          <div className="flex items-center gap-4">
            {/* v213.0 EL PULSO — la sala EN VIVO a un toque de cada cable */}
            <Link
              href="/en-vivo"
              className="font-mono text-[10px] uppercase tracking-widest text-red-400/90 hover:text-red-300"
            >
              EN VIVO ●
            </Link>
            {/* v211.0 EL VÉRTIGO — la puerta del feed infinito siempre a la vista */}
            <Link
              href="/vertigo"
              className="font-mono text-[10px] uppercase tracking-widest text-amber-500/90 hover:text-amber-300"
            >
              VÉRTIGO ▸▸
            </Link>
            {/* v215.0 EL MUNDO — el planeta en 3D a un toque de cada cable */}
            <Link
              href="/mundo"
              className="font-mono text-[10px] uppercase tracking-widest text-amber-400/90 hover:text-amber-300"
            >
              MUNDO ●
            </Link>
            <Link
              href="/guerra-hoy"
              className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
            >
              Primera página
            </Link>
          </div>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-mono text-[10px] uppercase tracking-widest border rounded px-1.5 py-0.5 ${TAG_COLOR[tag] || TAG_COLOR.INFO}`}
          >
            {tag}
          </span>
          {it.sourceCountry && <FlagBadge code={it.sourceCountry} />}
          <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
            {it.source} · hace {hace(fecha)} ·{" "}
            {fecha.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <h1 className="mt-4 text-2xl sm:text-3xl font-bold leading-tight text-zinc-100">
          {it.title}
        </h1>

        {it.summary && (
          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed border-l-2 border-amber-500/50 pl-4">
            {it.summary}
          </p>
        )}

        {/* v215.0 MODO TRADUCTOR — el cable en los idiomas de Vanguard */}
        <TraductorChip titulo={it.title} resumen={it.summary ?? ""} />

        {/* v247.0 LA CARGA JUSTA — el hero ES el LCP: fetchpriority high, la
            piel og WebP (1200×630 reales cuando la casa conoce la foto) y
            decoding async. Para una URL desconocida las dims se omiten —
            declarar a ciegas era la mentira que esta ronda mató. */}
        <img
          src={hero}
          alt={it.title}
          {...(heroDims ? { width: heroDims.w, height: heroDims.h } : {})}
          fetchPriority="high"
          decoding="async"
          className="mt-6 w-full rounded-md border border-zinc-800 object-cover max-h-[420px]"
        />

        {/* CTA — convertir al visitante de Google en agente */}
        <div className="mt-8 border border-amber-500/40 bg-amber-500/5 rounded-md p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-amber-300">
            El mundo no para — míralo en vivo
          </p>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            VANGUARD traza este conflicto en un mapa OSINT 3D con 15 capas de
            inteligencia, alertas en vivo por fuente verificada y una sala de
            guerra multijugador donde las noticias reales disparan las
            operaciones. Gratis, en español, sin instalar nada.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm uppercase tracking-wider rounded px-5 py-2.5 transition-colors"
            >
              Entrar al mundo en vivo →
            </Link>
            {it.url && it.url !== "#" && (
              <a
                href={it.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-sm rounded px-5 py-2.5 transition-colors"
              >
                Leer en la fuente ↗
              </a>
            )}
          </div>
        </div>

        {/* texto indexable de contexto (SEO honesto) */}
        <div className="mt-8 text-[13px] text-zinc-500 leading-relaxed">
          <p>
            Este cable llega a VANGUARD a través de la red de verificación por
            fuente (GDELT y más de 15 medios internacionales), se clasifica por
            teatro de conflicto y alimenta las alertas del mapa en vivo. La
            primera página del mundo se actualiza cada minuto en{" "}
            <Link href="/guerra-hoy" className="text-amber-500/80 hover:text-amber-400 underline underline-offset-2">
              /guerra-hoy
            </Link>
            ; el teatro de guerra con la ciudad que cae, en{" "}
            <Link href="/zona-cero" className="text-amber-500/80 hover:text-amber-400 underline underline-offset-2">
              /zona-cero
            </Link>
            ; y el frente total del planeta, en{" "}
            <Link href="/ver-guerra" className="text-amber-500/80 hover:text-amber-400 underline underline-offset-2">
              /ver-guerra
            </Link>
            .
          </p>
        </div>

        {/* v218.0 EL NÚCLEO — la conexión explícita del cable con la casa */}
        <EnlacesNucleo
          enlaces={enlacesDeCable({ id: it.id, conflictTag: it.conflictTag ?? null, source: it.source })}
          titulo="CONECTA CON EL NÚCLEO"
        />

        {/* cables relacionados — más puertas internas */}
        {relacionadas.length > 0 && (
          <section className="mt-10">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
              Otros cables — la primera página en vivo
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {relacionadas.map((r, i) => (
                <Link
                  key={r.id}
                  href={`/noticia/${r.id}`}
                  className="group flex gap-3 items-start border border-zinc-800 hover:border-amber-500/50 rounded-md p-3 bg-zinc-900/40 transition-colors"
                >
                  {/* v247.0 LA CARGA JUSTA — perezosas: viven bajo el primer
                      scroll (y ocultas en móvil), dejaron de competir con
                      el LCP del hero por el ancho de banda inicial. */}
                  <img
                    src={thumbDe(r, i + 1)}
                    alt={r.title}
                    width={96}
                    height={72}
                    loading="lazy"
                    decoding="async"
                    className="hidden sm:block w-[96px] h-[72px] object-cover rounded shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                      {(r.tacticalTag || "INFO").toUpperCase()} · {r.source} ·
                      hace {hace(new Date(r.publishedAt))}
                    </div>
                    <div className="mt-1 text-sm font-bold leading-snug text-zinc-200 group-hover:text-amber-300 transition-colors">
                      {r.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-5">
              <Link
                href="/guerra-hoy"
                className="font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
              >
                Ver la primera página completa →
              </Link>
            </div>
          </section>
        )}
      </article>

      {/* v211.0 EL VÉRTIGO — up next de la fórmula YouTube: aparece al 50% de
          lectura, navega con ROUTER al toque, jamás auto-navega (ley v190) */}
      {siguiente && (
        <SiguienteChip id={siguiente.id} titulo={siguiente.title} />
      )}
    </main>
  );
}
