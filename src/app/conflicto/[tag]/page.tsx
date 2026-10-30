import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { TEATROS } from "@/lib/teatros";
import { FlagBadge } from "@/components/vanguard/flag-badge";

// v206.0 MÁS PUERTAS — una página indexable POR TEATRO DE GUERRA.
// Nadie busca «Vanguard»: la gente busca «guerra en Ucrania hoy»,
// «noticias Gaza», «tensión Taiwán». Cada teatro con cables vivos en la
// BD tiene ahora su propia puerta server-rendered: titular, contador,
// últimos cables (cada uno hacia su /noticia/[id]), JSON-LD CollectionPage
// + ItemList y CTA hacia la app. Solo existen los teatros del mapa: una
// URL desconocida es 404 limpio (nunca páginas vacías para Google).

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
  sourceCountry: string | null;
  summary: string | null;
};

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

async function getCables(tag: string): Promise<{ total: number; items: NewsRow[] }> {
  try {
    const [total, items] = await Promise.all([
      db.newsItem.count({ where: { conflictTag: tag } }),
      db.newsItem.findMany({
        where: { conflictTag: tag },
        orderBy: { publishedAt: "desc" },
        take: 40,
      }),
    ]);
    return { total, items: items as NewsRow[] };
  } catch {
    return { total: 0, items: [] };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const teatro = TEATROS[tag];
  if (!teatro) return { title: "Teatro no disponible · VANGUARD" };
  const { total } = await getCables(tag);
  const title = `Guerra en ${teatro.nombre}: noticias del conflicto en vivo hoy | VANGUARD`;
  const desc = `${teatro.resumen} ${total} cables verificados en la agencia — seguimiento en vivo con mapa OSINT 3D. Gratis, en español.`;
  return {
    title,
    description: desc.slice(0, 300),
    alternates: { canonical: `${SITE_URL}/conflicto/${tag}` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/conflicto/${tag}`,
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
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const teatro = TEATROS[tag];
  if (!teatro) notFound();

  const { total, items } = await getCables(tag);
  // Sin cables vivos la puerta no se abre (nada vacío para Google)
  if (items.length === 0) notFound();

  const ultimo = items[0];
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
              {total} cables en la agencia · última señal hace {hace(new Date(ultimo.publishedAt))}
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
          <Link
            href="/"
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm uppercase tracking-wider rounded px-5 py-2.5 transition-colors"
          >
            Entrar al mundo en vivo →
          </Link>
        </div>

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
