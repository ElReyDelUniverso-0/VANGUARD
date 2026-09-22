import { db } from "@/lib/db";

// v35 — RSS /feed.xml: lectores de noticias y agregadores pueden suscribirse
// al canal de conflictos de VANGUARD. Cada ítem enlaza a la página SEO
// /guerra-hoy (que a su vez empuja al visitante hacia la app).

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let items: { id: string; title: string; url: string; source: string; summary: string | null; publishedAt: Date }[] = [];
  try {
    items = await db.newsItem.findMany({
      orderBy: { publishedAt: "desc" },
      take: 30,
    });
  } catch {
    /* feed vacío ante fallo de BD */
  }

  const entries = items
    .map((it) => {
      const link = `${SITE_URL}/guerra-hoy`;
      return `    <item>
      <title>${esc(it.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="false">vanguard-news-${esc(it.id)}</guid>
      <source>${esc(it.source)}</source>
      <pubDate>${new Date(it.publishedAt).toUTCString()}</pubDate>
      ${it.summary ? `<description>${esc(it.summary)}</description>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>VANGUARD — Conflictos Mundiales en Vivo</title>
    <link>${SITE_URL}/guerra-hoy</link>
    <description>Noticias de guerra y conflictos del mundo actualizadas en vivo. La plataforma de inteligencia global en español.</description>
    <language>es</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${entries}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
