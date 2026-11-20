// ============================================================
// v421.0 EL LENGUAJE DEL MAPA — XML del protocolo sitemaps, en un solo sitio
//
// Módulo PURO: no toca base de datos, ni red, ni React. Se puede probar
// solo (scripts/prueba-sitemap.mjs) y por eso se prueba de verdad.
// ============================================================
import type { MetadataRoute } from "next";

/** Escapa lo que va dentro de un nodo XML. */
export const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** Un <url> del protocolo sitemaps. Campos vacíos NO se escriben. */
export function nodoUrl(e: MetadataRoute.Sitemap[number]): string {
  // v421.2 — la ubicación se codifica SIEMPRE (espacios, acentos, ñ). El
  // protocolo pide una URL, no un IRI: Google acepta UTF-8 crudo pero lo
  // marca como URL no válida. Medido el 2026-11-20: 4 de las 3.987 locs
  // viajaban con acento crudo (y además daban 404, ya corregido aparte).
  let loc: string;
  try {
    loc = encodeURI(e.url);
  } catch {
    loc = e.url;
  }
  const partes = [`<loc>${esc(loc)}</loc>`];
  if (e.lastModified) {
    const d = new Date(e.lastModified);
    if (!Number.isNaN(d.getTime())) partes.push(`<lastmod>${d.toISOString()}</lastmod>`);
  }
  if (e.changeFrequency) partes.push(`<changefreq>${esc(String(e.changeFrequency))}</changefreq>`);
  if (typeof e.priority === "number") partes.push(`<priority>${e.priority.toFixed(2)}</priority>`);
  return `<url>${partes.join("")}</url>`;
}

export function urlset(urls: MetadataRoute.Sitemap): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(nodoUrl).join("\n") +
    `\n</urlset>\n`
  );
}

export function sitemapindex(filas: { archivo: string; ultima?: Date }[], base: string): string {
  const cuerpo = filas
    .map(
      (f) =>
        `<sitemap><loc>${esc(`${base}/sitemaps/${f.archivo.replace(/^sitemap-/, "").replace(/\.xml$/, "")}/sitemap.xml`)}</loc>` +
        (f.ultima && !Number.isNaN(f.ultima.getTime())
          ? `<lastmod>${f.ultima.toISOString()}</lastmod>`
          : "") +
        `</sitemap>`
    )
    .join("\n");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    cuerpo +
    `\n</sitemapindex>\n`
  );
}

export const CABECERAS_XML = {
  "content-type": "application/xml; charset=utf-8",
  // Google puede guardarlo en su caché de CDN, pero la casa manda:
  "cache-control": "public, max-age=0, s-maxage=600, stale-while-revalidate=86400",
} as const;
