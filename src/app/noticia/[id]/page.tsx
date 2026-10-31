import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
// v211.0 EL VÉRTIGO — el up next (fórmula YouTube) en la sala de lectura
import { SiguienteChip } from "@/components/noticia/siguiente-chip";

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

const FALLBACK_IMGS = [
  "/assets/real/drone-1.jpg",
  "/assets/real/city-1.jpg",
  "/assets/real/ship-1.jpg",
  "/assets/real/fire-1.jpg",
  "/assets/real/jet-1.jpg",
  "/assets/real/tanks-1.jpg",
];

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
      images: [{ url: img, width: 1200, height: 630, alt: it.title }],
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
  const img = imgDe(it);
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
            {/* v211.0 EL VÉRTIGO — la puerta del feed infinito siempre a la vista */}
            <Link
              href="/vertigo"
              className="font-mono text-[10px] uppercase tracking-widest text-amber-500/90 hover:text-amber-300"
            >
              VÉRTIGO ▸▸
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

        <img
          src={img}
          alt={it.title}
          width={1200}
          height={630}
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
                  <img
                    src={imgDe(r, i + 1)}
                    alt={r.title}
                    width={96}
                    height={72}
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
