// v400.0 EL REDISEÑO — las notas de la portada nueva.
//
// La BD SQLite que viaja con el despliegue de Vercel es de solo lectura: el
// refresco de /api/news escribe en una copia efímera que muere con el lambda,
// así que la portada vieja enseñaba cables de hace 2 semanas bajo "EN VIVO".
// La portada nueva bebe DIRECTO de los medios en español (RSS con foto real),
// con la caché de datos de Next (revalidate 300 s): una sola petición por
// medio cada 5 minutos para todo el planeta, y la BD de respaldo si la red cae.
import { db } from "@/lib/db";
import { conflictoDe, regionDe, type Region } from "./clasificar";

export type Nota = {
  id: string; // clave estable (base64url de la URL)
  titulo: string;
  resumen: string;
  url: string;
  fuente: string;
  imagen: string | null;
  fecha: string; // ISO
  region: Region;
  conflicto: string | null; // key de CONFLICTOS
};

type Medio = { url: string; fuente: string; max?: number };

// Solo medios EN ESPAÑOL (ley v400: un solo idioma, sin mezclas).
const MEDIOS: Medio[] = [
  { url: "https://feeds.bbci.co.uk/mundo/rss.xml", fuente: "BBC Mundo" },
  { url: "https://www.france24.com/es/rss", fuente: "France 24" },
  { url: "https://elpais.com/rss/internacional/portada.xml", fuente: "El País" },
  { url: "https://e00-elmundo.uecdn.es/elmundo/rss/internacional.xml", fuente: "El Mundo", max: 20 },
  { url: "https://www.abc.es/rss/2.0/internacional/", fuente: "ABC" },
  { url: "https://www.20minutos.es/rss/internacional/", fuente: "20minutos" },
  { url: "https://www.lavanguardia.com/rss/internacional.xml", fuente: "La Vanguardia", max: 20 },
  { url: "https://www.europapress.es/rss/rss.aspx?ch=00069", fuente: "Europa Press" },
  { url: "https://rss.dw.com/rdf/rss-sp-all", fuente: "DW" },
  { url: "https://news.un.org/feed/subscribe/es/news/all/rss.xml", fuente: "ONU Noticias", max: 10 },
];

export function claveDeUrl(url: string): string {
  return Buffer.from(url, "utf8").toString("base64url");
}

export function urlDeClave(clave: string): string | null {
  try {
    const u = Buffer.from(clave, "base64url").toString("utf8");
    return u.startsWith("http") ? u : null;
  } catch {
    return null;
  }
}

function desescapar(s: string): string {
  return s
    .replace(/^\s*<!\[CDATA\[/, "")
    .replace(/\]\]>\s*$/, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

function textoPlano(html: string): string {
  return desescapar(desescapar(html))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(raw: string, nombre: string): string {
  const m = raw.match(new RegExp(`<${nombre}[^>]*>([\\s\\S]*?)<\\/${nombre}>`));
  return m ? m[1] : "";
}

function mejorarImagen(url: string): string {
  let u = desescapar(url);
  // BBC: miniatura de 240 px → 800 px (mismo servidor de imágenes)
  u = u.replace(/\/ace\/ws\/\d+\//, "/ace/ws/800/");
  // Europa Press: miniatura _120 → _800
  u = u.replace(/(fotonoticia_\d+)_\d+\.jpg/, "$1_800.jpg");
  return u;
}

function imagenDe(raw: string): string | null {
  const candidatos: string[] = [];
  const re = /<(media:content|media:thumbnail|enclosure)\b([^>]*)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const attrs = m[2];
    const url = attrs.match(/url="([^"]+)"/)?.[1];
    if (!url) continue;
    const tipo = attrs.match(/type="([^"]+)"/)?.[1] ?? "";
    const medium = attrs.match(/medium="([^"]+)"/)?.[1] ?? "";
    if (tipo.startsWith("video") || medium === "video" || /\.(mp4|m3u8|mp3)(\?|$)/i.test(url)) continue;
    candidatos.push(url);
  }
  if (!candidatos.length) {
    const img = raw.match(/<img[^>]+src="([^"]+)"/)?.[1] ?? raw.match(/&lt;img[^&]+src=&quot;([^&]+)&quot;/)?.[1];
    if (img) candidatos.push(img);
  }
  const u = candidatos.find((c) => c.startsWith("http"));
  return u ? mejorarImagen(u) : null;
}

async function leerMedio(m: Medio): Promise<Nota[]> {
  try {
    const res = await fetch(m.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Vanguard/4.0; +https://vanguard-kq9r.vercel.app)" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const trozos = xml.split(/<item[\s>]/).slice(1, (m.max ?? 16) + 1);
    const out: Nota[] = [];
    for (const raw of trozos) {
      const titulo = textoPlano(tag(raw, "title"));
      let url = desescapar(tag(raw, "link"));
      if (!url) url = raw.match(/rdf:about="([^"]+)"/)?.[1] ?? "";
      if (!titulo || !url.startsWith("http")) continue;
      url = limpiarUrl(url);
      const fechaRaw = tag(raw, "pubDate") || tag(raw, "dc:date") || tag(raw, "updated");
      const fecha = fechaRaw ? new Date(desescapar(fechaRaw)) : new Date();
      if (Number.isNaN(fecha.getTime())) continue;
      const resumen = textoPlano(tag(raw, "description"))
        .replace(/\s*(Leer m[aá]s|Leer|Seguir leyendo|Ver m[aá]s)\.?\s*$/i, "")
        .slice(0, 420);
      const texto = `${titulo} ${resumen}`;
      out.push({
        id: claveDeUrl(url),
        titulo,
        resumen: resumen.startsWith("http") ? "" : resumen,
        url,
        fuente: m.fuente,
        imagen: imagenDe(raw),
        fecha: fecha.toISOString(),
        region: regionDe(texto),
        conflicto: conflictoDe(texto)?.key ?? null,
      });
    }
    return out;
  } catch {
    return [];
  }
}

/** quita los parámetros de rastreo (utm_*, at_medium…) — URLs y claves más cortas */
function limpiarUrl(u: string): string {
  try {
    const x = new URL(u);
    [...x.searchParams.keys()].forEach((k) => {
      if (/^(utm_|at_|maca$|ref$|ns_|ito$)/i.test(k)) x.searchParams.delete(k);
    });
    return x.toString();
  } catch {
    return u;
  }
}

function huella(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ")
    .filter((w) => w.length > 3)
    .slice(0, 7)
    .join(" ");
}

async function respaldoBD(): Promise<Nota[]> {
  try {
    const filas = await db.newsItem.findMany({ orderBy: { publishedAt: "desc" }, take: 60 });
    return filas
      .filter((f) => f.url && f.url.startsWith("http"))
      .map((f) => {
        const texto = `${f.title} ${f.summary ?? ""}`;
        return {
          id: claveDeUrl(f.url),
          titulo: f.title,
          resumen: (f.summary ?? "").slice(0, 420),
          url: f.url,
          fuente: f.source,
          // las fotos de la BD vieja eran de archivo y no casaban con la nota: fuera
          imagen: f.imageUrl && f.imageUrl.startsWith("http") ? f.imageUrl : null,
          fecha: new Date(f.publishedAt).toISOString(),
          region: regionDe(texto),
          conflicto: conflictoDe(texto)?.key ?? null,
        };
      });
  } catch {
    return [];
  }
}

/** Todas las notas frescas (≤ 72 h), sin duplicados, de la más nueva a la más vieja. */
export async function obtenerNotas(): Promise<Nota[]> {
  const lotes = await Promise.all(MEDIOS.map(leerMedio));
  const ahora = Date.now();
  const limite = ahora - 72 * 3600_000;
  let todas = lotes
    .flat()
    .filter((n) => {
      const t = new Date(n.fecha).getTime();
      return t > limite && t < ahora + 15 * 60_000; // ni viejas ni del futuro
    })
    .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));

  if (todas.length < 12) {
    const bd = await respaldoBD();
    todas = [...todas, ...bd];
  }

  const vistas = new Set<string>();
  const ids = new Set<string>();
  const unicas: Nota[] = [];
  for (const n of todas) {
    const h = huella(n.titulo);
    if (vistas.has(h) || ids.has(n.id)) continue;
    vistas.add(h);
    ids.add(n.id);
    unicas.push(n);
  }
  return unicas;
}

/** Puntuación para elegir la portada: fresca + con foto + de un frente activo. */
export function relevancia(n: Nota, ahora = Date.now()): number {
  const horas = (ahora - new Date(n.fecha).getTime()) / 3600_000;
  let p = 100 - horas * 6;
  if (n.imagen) p += 30;
  if (n.conflicto) p += 25;
  if (n.region !== "mundo") p += 8;
  if (n.resumen.length > 60) p += 6;
  return p;
}

export async function buscarNota(clave: string): Promise<Nota | null> {
  const notas = await obtenerNotas();
  const n = notas.find((x) => x.id === clave);
  if (n) return n;
  const url = urlDeClave(clave);
  if (!url) return null;
  try {
    const f = await db.newsItem.findFirst({ where: { OR: [{ url }, { externalId: url }] } });
    if (!f) return await notaDesdeFuente(url, clave);
    const texto = `${f.title} ${f.summary ?? ""}`;
    return {
      id: clave,
      titulo: f.title,
      resumen: f.summary ?? "",
      url: f.url,
      fuente: f.source,
      imagen: f.imageUrl && f.imageUrl.startsWith("http") ? f.imageUrl : null,
      fecha: new Date(f.publishedAt).toISOString(),
      region: regionDe(texto),
      conflicto: conflictoDe(texto)?.key ?? null,
    };
  } catch {
    return await notaDesdeFuente(url, clave);
  }
}

// ═══════════════════════════════════════════════════════════════════
// v402.7 LA NOTA QUE NO SE PIERDE — cuando una nota sale del cable vivo (72 h,
// 16 por medio) y la base de producción (solo lectura) no la tiene, su enlace
// daba 404: el héroe de la portada cacheada, los enlaces compartidos por
// WhatsApp, Google. Ahora se lee la ficha que el PROPIO MEDIO publica en su
// página (OpenGraph + fecha de publicación). Nada se inventa: sin título o sin
// fecha declarada por el medio, no hay nota. Solo medios de la casa (lista
// cerrada: el servidor no visita direcciones arbitrarias).
// ═══════════════════════════════════════════════════════════════════
const MEDIOS_ARTICULO: { dominio: string; fuente: string }[] = [
  { dominio: "bbc.com", fuente: "BBC Mundo" },
  { dominio: "bbc.co.uk", fuente: "BBC Mundo" },
  { dominio: "france24.com", fuente: "France 24" },
  { dominio: "elpais.com", fuente: "El País" },
  { dominio: "elmundo.es", fuente: "El Mundo" },
  { dominio: "abc.es", fuente: "ABC" },
  { dominio: "20minutos.es", fuente: "20minutos" },
  { dominio: "lavanguardia.com", fuente: "La Vanguardia" },
  { dominio: "europapress.es", fuente: "Europa Press" },
  { dominio: "dw.com", fuente: "DW" },
  { dominio: "news.un.org", fuente: "ONU Noticias" },
];

/** el medio de la casa al que pertenece una URL (https y dominio de la lista), o null */
export function medioDeUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    const h = u.hostname.toLowerCase();
    return MEDIOS_ARTICULO.find((m) => h === m.dominio || h.endsWith("." + m.dominio))?.fuente ?? null;
  } catch {
    return null;
  }
}

function metaDe(html: string, nombre: string): string {
  const n = nombre.replace(/[:.]/g, "\\$&");
  const a = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${n}["'][^>]*content=["']([^"']+)["']`, "i").exec(html);
  if (a) return desescapar(a[1]).trim();
  const b = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name|itemprop)=["']${n}["']`, "i").exec(html);
  return b ? desescapar(b[1]).trim() : "";
}

async function notaDesdeFuente(url: string, clave: string): Promise<Nota | null> {
  const fuente = medioDeUrl(url);
  if (!fuente) return null;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Vanguard/4.0; +https://vanguard-kq9r.vercel.app)", Accept: "text/html" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    // tras redirecciones, la página final también debe ser de un medio de la casa
    if (!res.ok || !medioDeUrl(res.url || url)) return null;
    // algunos medios (El Mundo) sirven Latin-1: se decodifica con el juego de caracteres que declaran
    const bytes = new Uint8Array(await res.arrayBuffer()).slice(0, 600_000);
    const cabecera = /charset=([\w-]+)/i.exec(res.headers.get("content-type") ?? "")?.[1];
    const enPagina = /<meta[^>]+charset=["']?([\w-]+)/i.exec(new TextDecoder("latin1").decode(bytes.slice(0, 4096)))?.[1];
    let html: string;
    try {
      html = new TextDecoder((cabecera || enPagina || "utf-8").toLowerCase()).decode(bytes);
    } catch {
      html = new TextDecoder("utf-8").decode(bytes);
    }
    // el medio ya se muestra aparte: fuera la coletilla « - BBC News Mundo», « | EL PAÍS»…
    const titulo = textoPlano(metaDe(html, "og:title") || metaDe(html, "twitter:title")).replace(
      /\s+[-|–—]\s+(BBC News Mundo|BBC Mundo|France ?24|El Pa[ií]s|El Mundo|elmundo\.es|ABC|20 ?minutos|La Vanguardia|Europa Press|DW|Deutsche Welle|Noticias ONU|ONU Noticias)\s*$/i,
      "",
    );
    const fechaRaw =
      metaDe(html, "article:published_time") ||
      metaDe(html, "datePublished") ||
      metaDe(html, "date") ||
      /"datePublished"\s*:\s*"([^"]+)"/.exec(html)?.[1] ||
      "";
    const fecha = fechaRaw ? new Date(fechaRaw) : null;
    if (!titulo || !fecha || Number.isNaN(fecha.getTime())) return null;
    const resumen = textoPlano(metaDe(html, "og:description") || metaDe(html, "description")).slice(0, 420);
    const img = metaDe(html, "og:image");
    const texto = `${titulo} ${resumen}`;
    return {
      id: clave,
      titulo,
      resumen,
      url,
      fuente,
      imagen: img.startsWith("https://") ? mejorarImagen(img) : null,
      fecha: fecha.toISOString(),
      region: regionDe(texto),
      conflicto: conflictoDe(texto)?.key ?? null,
    };
  } catch {
    return null;
  }
}
