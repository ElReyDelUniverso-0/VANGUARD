import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { TEATROS } from "@/lib/teatros";
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
  // v206.1: sin «| VANGUARD» — el title.template del layout (%s · VANGUARD)
  // ya añade la marca; duplicarla era redundante en resultados.
  const title = `Guerra en ${teatro.nombre}: noticias del conflicto en vivo hoy`;
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

  // v227.0 EL DESPLIEGUE — los frentes documentados del teatro (sala
  // OSINT v129 proyectada por v220 como entidades v225). CERO
  // coordenadas aquí: el catálogo solo proyecta la geografía de la casa.
  const frentes = puntosDelNucleo().filter((p) => p.teatro === tag);
  const geoTeatro = geografiaDeTeatro(tag);

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
