import { db } from "@/lib/db";
import { TEATROS } from "@/lib/teatros";
// v403.6 EL CANAL CON OJOS: si el archivo del repo está congelado (en Vercel la
// SQLite viaja de solo lectura), el feed se sirve de los MEDIOS VIVOS — la misma
// instantánea que ya alimenta /en-vivo y la portada (lib/pulso filasVivas).
// Nada nuevo: se usa lo que la casa ya tenía, en vez de repetir un mes atrás.
import { filasVivas } from "@/lib/pulso";

// v35 — RSS /feed.xml: lectores de noticias y agregadores pueden suscribirse
// al canal de conflictos de VANGUARD. Cada ítem enlaza a la página SEO
// /guerra-hoy (que a su vez empuja al visitante hacia la app).
// v202.0 PUERTAS ABIERTAS: cada ítem del canal ahora apunta a SU PROPIA
// noticia (/noticia/[id]) — los agregadores y Google News llegan directo a
// la puerta indexable de cada cable, no todas a la misma página.
// v271.0 EL CANAL CLASIFICADO: cada ítem etiquetado declara SU teatro — el
// conflictTag crudo y el nombre humano del catálogo canónico (TEATROS,
// teatros.ts, la fuente única de las puertas desde v206 — directiva v266:
// el mapa vive en la fuente, el canal no inventa). El cable sin teatro no
// declara categoría alguna (vacío honesto) — la casa no le pone etiquetas
// de ficción a lo que no las tiene.

export const dynamic = "force-dynamic";

import { SITE_URL } from "@/lib/site"; // v403.6: una sola puerta

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type ItemFeed = {
  id: string; title: string; url: string; source: string;
  summary: string | null; conflictTag: string | null; publishedAt: Date;
  imageUrl?: string | null;
};
const VIDA_ARCHIVO_MS = 3 * 60 * 60 * 1000;

export async function GET() {
  let items: ItemFeed[] = [];
  try {
    items = await db.newsItem.findMany({
      orderBy: { publishedAt: "desc" },
      take: 30,
    });
  } catch {
    /* feed vacío ante fallo de BD */
  }
  // v403.6: archivo congelado → medios vivos (la misma instantánea de la casa)
  const edad = items.length ? Date.now() - items[0].publishedAt.getTime() : Infinity;
  if (edad > VIDA_ARCHIVO_MS) {
    const vivas = await filasVivas().catch(() => []);
    if (vivas.length) items = vivas.slice(0, 30) as unknown as ItemFeed[];
  }

  const entries = items
    .map((it) => {
      // v202.0: puerta propia por cable (antes: todas a /guerra-hoy)
      const link = `${SITE_URL}/noticia/${it.id}`;
      // v271.0 EL CANAL CLASIFICADO: el teatro del cable viaja en <category>
      // (crudo + nombre humano de la fuente); sin teatro, sin categoría
      const categorias = it.conflictTag
        ? `\n      <category>${esc(it.conflictTag)}</category>\n      <category>${esc(TEATROS[it.conflictTag]?.nombre ?? it.conflictTag)}</category>`
        : "";
      // v403.6 LA FOTO EN EL CANAL: sin <enclosure> ni media:content, Google
      // News y Discover ven un feed ciego. La imagen va absoluta y es la del
      // medio cuando el cable la trae (nunca una inventada).
      const foto = it.imageUrl
        ? /^https?:\/\//i.test(it.imageUrl)
          ? it.imageUrl
          : `${SITE_URL}${it.imageUrl}`
        : null;
      const media = foto
        ? `\n      <enclosure url="${esc(foto)}" type="image/jpeg" />\n      <media:content url="${esc(foto)}" medium="image" />`
        : "";
      return `    <item>
      <title>${esc(it.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="false">vanguard-news-${esc(it.id)}</guid>
      <source>${esc(it.source)}</source>
      <pubDate>${new Date(it.publishedAt).toUTCString()}</pubDate>
      ${it.summary ? `<description>${esc(it.summary)}</description>` : ""}${categorias}${media}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
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
