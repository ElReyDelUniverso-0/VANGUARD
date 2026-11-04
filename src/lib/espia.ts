// ════════════════════════════════════════════════════════════════
// v215.0 MODO ESPÍA — RADAR DE GOBIERNOS EN FUENTES ABIERTAS.
// Mandato del Dueño: «un modo de espiar el gobierno».
// LA HONESTIDAD ES LA TÉCNICA: Vanguard espía lo que los gobiernos
// y las organizaciones PUBLICAN — filos RSS oficiales (OSINT).
// Nada invade nada: si un gobierno lo emite, aquí se escucha.
//
//  · ESCUCHAS — titulares oficiales en vivo (caché de módulo 10 min,
//    fetch con reloj de 4.5 s; una fuente caída es «SIN SEÑAL»
//    honesto, jamás relleno falso).
//  · MOVIMIENTOS — cables de la BD que huelen a gobierno/diplomacia.
//  · ÍNDICE DE TENSIÓN — por teatro: cables de 24 h contra la media
//    de 7 días (sube ▲ / baja ▼ / plano ▶).
// ════════════════════════════════════════════════════════════════

import { db } from "@/lib/db";

// ---- FUENTES OFICIALES (RSS públicos — URLs VERIFICADAS una a una) ----
// La casa no adivina: cada fuente abajo respondió 200 con items reales.
// Una fuente caída es «SIN SEÑAL» honesto — jamás un titular inventado.
export interface FuenteEscucha {
  id: string;
  nombre: string;
  etiqueta: string;
  url: string;
}

export const ESCUCHAS_FUENTES: FuenteEscucha[] = [
  { id: "onu", nombre: "ONU Noticias", etiqueta: "ORGANIZACIÓN MUNDIAL", url: "https://news.un.org/feed/subscribe/es/news/all/rss.xml" },
  { id: "onu-prensa", nombre: "Sala de Prensa de la ONU", etiqueta: "ORGANIZACIÓN MUNDIAL · PRENSA", url: "https://press.un.org/en/rss.xml" },
  { id: "ocha", nombre: "ReliefWeb — OCHA", etiqueta: "HUMANITARIO · NACIONES UNIDAS", url: "https://reliefweb.int/updates/rss.xml" },
  { id: "oms", nombre: "OMS", etiqueta: "ORGANIZACIÓN MUNDIAL · SALUD", url: "https://www.who.int/rss-feeds/news-english.xml" },
  // v245.0 LA QUINTA ESCUCHA — OPCW (Organización para la Prohibición de
  // las Armas Químicas, La Haya): el organismo que verifica el convenio de
  // desarme químico, pertinente a cada teatro que huela a ataque químico.
  // Verificada antes de entrar (regla de la casa: nada se adivina):
  // 2026-11-04 respondió 200 con 10 items reales — títulos, enlaces y
  // pubDate que el parser de abajo lee tal cual (RSS 2.0 con <item>).
  // Misma cuota que el resto: 4 titulares por fuente y SIN SEÑAL honesto.
  { id: "opcw", nombre: "OPCW", etiqueta: "DESARME · ARMAS QUÍMICAS", url: "https://www.opcw.org/rss.xml" },
];

export interface ItemEscucha {
  titulo: string;
  enlace: string;
  fecha: string; // ISO o "" si la fuente no la trae
}

export interface EscuchaFuente {
  id: string;
  nombre: string;
  etiqueta: string;
  estado: "VIVA" | "SIN SEÑAL";
  items: ItemEscucha[];
}

interface CacheEscuchas {
  ts: number;
  data: EscuchaFuente[];
}
let cacheEscuchas: CacheEscuchas | null = null;
const TTL_ESCUCHAS_MS = 10 * 60_000;

function limpiarXml(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function primerTag(bloque: string, tag: string): string {
  const m = bloque.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? limpiarXml(m[1]) : "";
}

async function leerUnaFuente(f: FuenteEscucha): Promise<EscuchaFuente> {
  const base: EscuchaFuente = { id: f.id, nombre: f.nombre, etiqueta: f.etiqueta, estado: "SIN SEÑAL", items: [] };
  try {
    const ctrl = new AbortController();
    const reloj = setTimeout(() => ctrl.abort(), 4500);
    const res = await fetch(f.url, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(reloj);
    if (!res.ok) return base;
    const xml = await res.text();
    const items: ItemEscucha[] = [];
    const bloques = xml.split(/<item[\s>]/i).slice(1);
    for (const b of bloques) {
      const titulo = primerTag(b, "title");
      const enlace = primerTag(b, "link");
      const fecha = primerTag(b, "pubDate");
      if (!titulo) continue;
      const iso = fecha ? new Date(fecha) : null;
      items.push({
        titulo: titulo.slice(0, 240),
        enlace,
        fecha: iso && !Number.isNaN(iso.getTime()) ? iso.toISOString() : "",
      });
      if (items.length >= 4) break;
    }
    if (!items.length) return base;
    return { ...base, estado: "VIVA", items };
  } catch {
    return base;
  }
}

/** Las escuchas del día — 10 min de módulo para no golpear a los gobiernos. */
export async function leerEscuchas(): Promise<EscuchaFuente[]> {
  if (cacheEscuchas && Date.now() - cacheEscuchas.ts < TTL_ESCUCHAS_MS) {
    return cacheEscuchas.data;
  }
  const data = await Promise.all(ESCUCHAS_FUENTES.map(leerUnaFuente));
  cacheEscuchas = { ts: Date.now(), data };
  return data;
}

// ---- MOVIMIENTOS DE GOBIERNO (de la BD real de cables) ----
export interface MovimientoGobierno {
  id: string;
  titulo: string;
  fuente: string;
  fecha: string;
  tag: string;
}

const HUELE_A_GOBIERNO =
  /(gobierno|ministro|presidencia|presidente|canciller|otan|naciones unidas|\bonu\b|sancion|sanci[oó]n|sanciones|cumbre|tratado|doctrina|defensa|embajada|diplomac|alto el fuego|tregua|estado mayor|pent[aá]gono|kremlin|casa blanca)/i;

export async function movimientosDeGobierno(take = 12): Promise<MovimientoGobierno[]> {
  const rows = await db.newsItem.findMany({
    where: { externalId: { not: { startsWith: "curated-" } } },
    orderBy: { publishedAt: "desc" },
    take: 150,
    select: { id: true, title: true, source: true, publishedAt: true, tacticalTag: true, summary: true },
  });
  const out: MovimientoGobierno[] = [];
  for (const r of rows) {
    const textura = `${r.title} ${r.summary ?? ""}`;
    if (!HUELE_A_GOBIERNO.test(textura)) continue;
    out.push({
      id: r.id,
      titulo: r.title,
      fuente: r.source,
      fecha: new Date(r.publishedAt).toISOString(),
      tag: (r.tacticalTag || "INFO").toUpperCase(),
    });
    if (out.length >= take) break;
  }
  return out;
}

// ---- ÍNDICE DE TENSIÓN POR TEATRO (24 h contra la media de 7 días) ----
export interface TensionTeatro {
  slug: string;
  nombre: string;
  n24: number;
  media7: number; // cables/día de la semana pasada
  porcentaje: number; // 0-100
  tendencia: "sube" | "baja" | "plano";
}

export async function indiceTension(slugs: string[], nombres: Record<string, string>): Promise<TensionTeatro[]> {
  const desde24h = new Date(Date.now() - 24 * 3600_000);
  const desde7d = new Date(Date.now() - 7 * 24 * 3600_000);

  const [g24, g7] = await Promise.all([
    db.newsItem.groupBy({
      by: ["conflictTag"],
      where: { publishedAt: { gte: desde24h }, conflictTag: { not: null }, externalId: { not: { startsWith: "curated-" } } },
      _count: { conflictTag: true },
    }),
    db.newsItem.groupBy({
      by: ["conflictTag"],
      where: { publishedAt: { gte: desde7d }, conflictTag: { not: null }, externalId: { not: { startsWith: "curated-" } } },
      _count: { conflictTag: true },
    }),
  ]);

  const c24 = new Map<string, number>();
  for (const g of g24) if (g.conflictTag) c24.set(g.conflictTag, g._count.conflictTag);
  const c7 = new Map<string, number>();
  for (const g of g7) if (g.conflictTag) c7.set(g.conflictTag, g._count.conflictTag);

  return slugs.map((slug) => {
    const n24 = c24.get(slug) ?? 0;
    const media7 = (c7.get(slug) ?? 0) / 7;
    const denominador = Math.max(8, media7 * 1.5);
    const porcentaje = Math.min(100, Math.round((n24 / denominador) * 100));
    const tendencia: TensionTeatro["tendencia"] =
      n24 > media7 * 1.3 ? "sube" : n24 < media7 * 0.7 ? "baja" : "plano";
    return { slug, nombre: nombres[slug] ?? slug, n24, media7: Math.round(media7 * 10) / 10, porcentaje, tendencia };
  });
}

// ---- v253.0 LA FORMA DE LA SEMANA — la semana REAL de cada teatro ----
// El índice de tensión da el número; esto dibuja su forma: 7 barras por
// teatro, cada una = un cubo RODANTE de 24 h (la más nueva es «hoy»,
// la misma ventana que mide el índice — coherencia, no otro criterio).
// Una sola consulta a la BD (7 días de cables etiquetados), cubos en
// memoria: cero roundtrips extra, cero invención — si la BD no trae
// cables, las barras son honestamente bajas.
export async function formaDeLaSemana(
  slugs: string[],
): Promise<Record<string, number[]>> {
  const forma: Record<string, number[]> = {};
  for (const slug of slugs) forma[slug] = [0, 0, 0, 0, 0, 0, 0];
  if (!slugs.length) return forma;

  const desde = new Date(Date.now() - 7 * 24 * 3600_000);
  const rows = await db.newsItem.findMany({
    where: {
      publishedAt: { gte: desde },
      conflictTag: { in: slugs },
      externalId: { not: { startsWith: "curated-" } },
    },
    select: { publishedAt: true, conflictTag: true },
  });

  const AHORA = Date.now();
  for (const r of rows) {
    const tag = r.conflictTag;
    if (!tag || !forma[tag]) continue;
    const horas = (AHORA - new Date(r.publishedAt).getTime()) / 3600_000;
    if (horas < 0 || horas >= 168) continue;
    const cubo = Math.min(6, Math.floor(horas / 24)); // 0 = últimas 24 h
    forma[tag][6 - cubo] += 1; // izquierda = más vieja · derecha = hoy
  }
  return forma;
}
