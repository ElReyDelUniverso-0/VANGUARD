import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { VertigoFeed, type CableVertigo } from "./vertigo-feed";

// v211.0 EL VÉRTIGO — la puerta del feed infinito (fórmula TikTok para
// el mundo de guerra en vivo). Página server: baja los 48 cables más
// nuevos directamente de la BD (sin cascada cliente — la primera pieza
// se ve con el primer byte), los entrega al feed client y declara la
// sala a Google con JSON-LD CollectionPage. El visitante de Google que
// entra aquí no lee un titular: ENTRA al mundo deslizando.

export const metadata: Metadata = {
  title: "El Vértigo — el mundo en vivo, una pieza por deslizamiento",
  description:
    "El feed infinito de VANGUARD: noticias de guerra del mundo entero a pantalla completa, desliza y no te paras nunca. Doble toque para latir, un toque para leer el cable completo. Gratis, en español.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app"}/vertigo`,
  },
};

export const revalidate = 60;

export default async function VertigoPage() {
  let iniciales: CableVertigo[] = [];
  try {
    const rows = await db.newsItem.findMany({
      orderBy: { publishedAt: "desc" },
      take: 48,
      select: {
        id: true,
        title: true,
        summary: true,
        source: true,
        imageUrl: true,
        publishedAt: true,
        tacticalTag: true,
        conflictTag: true,
        sourceCountry: true,
      },
    });
    iniciales = rows.map((r) => ({
      id: r.id,
      t: r.title,
      s: r.summary || "",
      f: r.source,
      img: r.imageUrl || "",
      fecha: r.publishedAt.toISOString(),
      tag: (r.tacticalTag || "INFO").toUpperCase(),
      conflicto: r.conflictTag || "",
      pais: r.sourceCountry || "",
    }));
  } catch (e) {
    console.error("vertigo page error", e);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "El Vértigo — el feed infinito del mundo en vivo",
    description:
      "Feed a pantalla completa de noticias de conflicto en tiempo real: desliza sin fin, doble toque para latir, un toque para leer el cable completo.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app"}/vertigo`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app" },
    inLanguage: "es",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />
      <noscript>
        <main className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
              ◉ VANGUARD · EL VÉRTIGO
            </p>
            <h1 className="mt-3 text-xl font-bold text-zinc-100">
              El feed infinito necesita JavaScript
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Actívalo para deslizar el mundo entero — o entra a la primera
              página clásica en{" "}
              <Link href="/guerra-hoy" className="text-amber-400 underline">
                /guerra-hoy
              </Link>
              .
            </p>
          </div>
        </main>
      </noscript>
      <VertigoFeed iniciales={iniciales} />
    </>
  );
}
