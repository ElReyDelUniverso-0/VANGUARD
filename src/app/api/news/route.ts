import { NextResponse, after } from "next/server";
import { db } from "@/lib/db";
import { WORLD_FLAG_MAP } from "@/lib/world-data";

// GDELT 2.0 Doc API - free, no key
const GDELT_URL = "https://api.gdeltproject.org/api/v2/doc/doc";

// v35: dar tiempo a after(refreshGdeltInBackground) en Hobby (default 10s lo mata a medias)
export const maxDuration = 60;

interface GdeltArticle {
  url: string;
  url_mobile?: string;
  title: string;
  seendate: string;
  socialimage?: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

// v16 HERMOSA: fotos REALES locales (public/assets/real) para las noticias curadas —
// la portada siempre se ve hermosa incluso si GDELT no responde.
const CURATED_IMG: Record<string, string> = {
  "curated-1": "/assets/real/drone-1.jpg",
  "curated-2": "/assets/real/city-1.jpg",
  "curated-3": "/assets/real/ship-1.jpg",
  "curated-4": "/assets/real/fire-1.jpg",
  "curated-5": "/assets/real/jet-1.jpg",
  "curated-6": "/assets/real/tanks-1.jpg",
  "curated-7": "/assets/real/arty-1.jpg",
  "curated-8": "/assets/real/parade-1.jpg",
  "curated-9": "/assets/real/carrier-1.jpg",
  "curated-10": "/assets/real/drone-2.jpg",
  "curated-11": "/assets/real/tanks-2.jpg",
  "curated-12": "/assets/real/radar-1.jpg",
};

function withCuratedImage<T extends { externalId: string; imageUrl: string | null }>(item: T): T {
  if (item.imageUrl) return item;
  const img = CURATED_IMG[item.externalId];
  return img ? { ...item, imageUrl: img } : item;
}

// v36: ciclo de fotos locales — TODA noticia sin imagen (GDELT/RSS) recibe una
// foto real del archivo: la portada y el hero lucen llenos siempre.
const CURATED_IMGS = Object.values(CURATED_IMG);
function withFallbackImage<T extends { imageUrl: string | null }>(item: T, i: number): T {
  if (item.imageUrl) return item;
  return { ...item, imageUrl: CURATED_IMGS[i % CURATED_IMGS.length] ?? null };
}

// v36: los RSS traen entidades XML (&amp; etc.) — se decodifican para título y link
function unescapeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

interface GdeltResponse {
  articles?: GdeltArticle[];
}

const QUERIES = [
  "(guerra OR conflicto OR military OR strike OR drone OR ceasefire)",
  "(Ukraine OR Gaza OR Sudan OR Lebanon OR Taiwan OR \"Red Sea\" OR Houthi)",
  "(geopolitics OR sanctions OR NATO OR UN OR \"nuclear\")",
  // v19 COBERTURA MUNDIAL TOTAL: todos los frentes y tensiones del planeta
  "(Myanmar OR Kashmir OR Sahel OR Somalia OR Congo OR Haiti OR Venezuela OR Guyana)",
  "(Armenia OR Azerbaijan OR Nagorno OR Kosovo OR Balkans OR Belarus OR Moldova OR Transnistria)",
  "(Syria OR Yemen OR Iraq OR Afghanistan OR Pakistan OR Iran OR West Bank OR Judea)",
  "(Colombia OR Ecuador OR Mexico cartel OR Cuba OR Nicaragua OR Peru OR Chile unrest)",
  "(South China Sea OR Koreas OR Japan military OR Australia defense OR Indopacific ORArtic)",
  "(Sahara OR Mozambique OR Ethiopia OR Libya OR Tunisia OR Egypt Sinai OR Nigeria)",
  "(military exercise OR naval deployment OR border clash OR insurgency OR coup OR airstrike)",
];

const TAG_RULES: { tag: string; keywords: string[] }[] = [
  { tag: "ALERTA", keywords: ["ataque", "strike", "drone", "missile", "muerte", "killed", "bombing", "explosion"] },
  { tag: "DIPLOMACIA", keywords: ["tregua", "ceasefire", "negotiation", "summit", "diplomacy", "talks", "acuerdo"] },
  { tag: "ECONOMIA", keywords: ["sanction", "sancion", "oil", "petroleo", "trade", "commerce", "market", "inflation"] },
  { tag: "HUMANITARIO", keywords: ["refugee", "refugiado", "humanitarian", "aid", "famine", "hambruna", "civilian"] },
  { tag: "ANALISIS", keywords: ["analysis", "analisis", "report", "strategy"] },
];

function classifyTag(title: string): string {
  const lower = title.toLowerCase();
  for (const rule of TAG_RULES) {
    if (rule.keywords.some((k) => lower.includes(k.toLowerCase()))) return rule.tag;
  }
  return "INFO";
}

function conflictTag(title: string): string | null {
  const lower = title.toLowerCase();
  const map: Record<string, string[]> = {
    ukraine: ["ukraine", "ukrania", "ucrania", "russia", "rusia", "kiev", "kyiv", "donetsk", "kharkiv"],
    gaza: ["gaza", "palestine", "palestina", "hamas", "israel", "idf"],
    lebanon: ["lebanon", "libano", "hezbollah", "hezbol"],
    sudan: ["sudan", "sudán", "rsf", "darfur", "khartoum", "jartum"],
    redsea: ["red sea", "mar rojo", "houthi", "huti", "bab el-mandeb"],
    korea: ["korea", "corea", "pyongyang", "dmz"],
    taiwan: ["taiwan", "china", "beijing", "pekin", "strait"],
    hormuz: ["hormuz", "iran", "irán"],
    sahel: ["sahel", "mali", "malí", "niger", "burkina", "jnim"],
  };
  for (const [tag, keys] of Object.entries(map)) {
    if (keys.some((k) => lower.includes(k))) return tag;
  }
  return null;
}

function parseGdeltDate(seendate?: string): Date {
  if (!seendate) return new Date();
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(seendate);
  if (m) {
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
  }
  return new Date(seendate);
}

// v20 BANDERAS VERDADERAS: deduce el país del conflicto desde el titular
// (más fiable que sourcecountry de GDELT, que es el país del MEDIADOR publicador).
const COUNTRY_KEYWORDS: [string, string[]][] = [
  ["ua", ["ukraine", "ucrania", "kyiv", "kiev", "donetsk", "kharkiv", "zaporizh", "kursk", "bakhmut", "crimea", "frente oriental"]],
  ["ru", ["russia", "rusia", "moscow", "moscu", "kremlin", "putin", "wagner"]],
  ["ps", ["gaza", "palestine", "palestina", "hamas", "west bank", "cisjordania", "rafah"]],
  ["il", ["israel", "idf", "tel aviv", "jerusalem", "jerusalen"]],
  ["lb", ["lebanon", "libano", "hezbollah", "hezbol", "beirut"]],
  ["ye", ["yemen", "houthi", "huti", "houthis", "mar rojo", "red sea"]],
  ["sy", ["syria", "siria", "damascus", "damasco", "aleppo"]],
  ["iq", ["iraq", "irak", "baghdad", "bagdad"]],
  ["ir", ["iran", "iran", "tehran", "teheran"]],
  ["af", ["afghanistan", "afganistan", "taliban", "kabul"]],
  ["pk", ["pakistan", "pakistan", "islamabad"]],
  ["sd", ["sudan", "sudan", "fasher", "jartum", "khartoum", "rsf"]],
  ["ss", ["south sudan", "sudan del sur"]],
  ["ml", ["mali", "sahel", "jnim", "bamako", "burkina", "liptako"]],
  ["ne", ["niger", "niamé", "niamey"]],
  ["ng", ["nigeria", "boko haram", "abuja"]],
  ["cd", ["congo", "goma", "m23", "kinshasa", "kivu"]],
  ["et", ["ethiopia", "etiopia", "tigray", "addis"]],
  ["so", ["somalia", "mogadishu", "al shabaab", "al-shabaab"]],
  ["ly", ["libya", "libia", "tripoli"]],
  ["eg", ["egypt", "egipto", "cairo", "sinai"]],
  ["eh", ["sahara", "sahara occidental", "polisario"]],
  ["mm", ["myanmar", "burma", "yangon", "rakhine"]],
  ["tw", ["taiwan", "taiwán", "estrecho de taiwan", "adiz"]],
  ["cn", ["china", "china", "beijing", "pekin", "south china sea", "mar de china"]],
  ["kp", ["north korea", "corea del norte", "pyongyang"]],
  ["kr", ["south korea", "corea del sur", "seoul", "seul"]],
  ["jp", ["japan", "japón", "tokyo", "tokio", "indopacific", "indopacífico", "indopacífico"]],
  ["ht", ["haiti", "haití", "puerto principe", "port-au-prince"]],
  ["ve", ["venezuela", "caracas", "maduro", "guyana", "essequibo"]],
  ["co", ["colombia", "bogota", "eln"]],
  ["ec", ["ecuador", "quito", "guayaquil"]],
  ["mx", ["mexico", "méxico", "cartel", "cjng", "sinaloa"]],
  ["cu", ["cuba", "havana", "la habana"]],
  ["am", ["armenia", "yerevan"]],
  ["az", ["azerbaijan", "azerbaiyán", "nagorno", "baku", "karabakh"]],
  ["xk", ["kosovo", "pristina"]],
  ["rs", ["serbia", "belgrade", "belgrado", "balkans", "balcanes"]],
  ["by", ["belarus", "bielorrusia", "minsk"]],
  ["md", ["moldova", "moldavia", "transnistria"]],
  ["ee", ["estonia", "tallinn"]],
  ["lv", ["latvia", "letonia", "riga"]],
  ["lt", ["lithuania", "lituania", "vilnius"]],
  ["us", ["united states", "estados unidos", "pentagon", "pentágono", "washington", "nato", "otan", "the pentagon"]],
];

function guessCountry(title: string, sourcecountry?: string): string | null {
  const lower = (title || "").toLowerCase();
  for (const [code, keys] of COUNTRY_KEYWORDS) {
    if (keys.some((k) => lower.includes(k))) return code;
  }
  const src = (sourcecountry || "").trim().toLowerCase();
  if (/^[a-z]{2}$/.test(src) && src in WORLD_FLAG_MAP) return src;
  return null;
}

async function getCuratedFallback(): Promise<GdeltArticle[]> {
  const list: GdeltArticle[] = [
    { url: "curated-1", title: "Frente oriental: nuevos ataques con drones sobre infraestructura energetica", seendate: new Date().toISOString(), domain: "vanguard-cmd", language: "es", sourcecountry: "INT", socialimage: CURATED_IMG["curated-1"] },
    { url: "curated-2", title: "Negociaciones de tregua en Gaza continuan bajo mediacion de Egipto y Qatar", seendate: new Date().toISOString(), domain: "vanguard-cmd", language: "es", sourcecountry: "INT", socialimage: CURATED_IMG["curated-2"] },
    { url: "curated-3", title: "Mar Rojo: ataque de los Huti a buque comercial provoca desvio de ruta", seendate: new Date().toISOString(), domain: "vanguard-cmd", language: "es", sourcecountry: "INT", socialimage: CURATED_IMG["curated-3"] },
    { url: "curated-4", title: "Sudan: hambruna confirmada en El Fasher segun analisis IPC", seendate: new Date().toISOString(), domain: "vanguard-cmd", language: "es", sourcecountry: "INT", socialimage: CURATED_IMG["curated-4"] },
    { url: "curated-5", title: "Estrecho de Taiwán: nueva incursion aerea china en la ADIZ suroeste", seendate: new Date().toISOString(), domain: "vanguard-cmd", language: "es", sourcecountry: "INT", socialimage: CURATED_IMG["curated-5"] },
    { url: "curated-6", title: "Sahel: JNIM reclama ataque contra base militar en Liptako-Gourma", seendate: new Date().toISOString(), domain: "vanguard-cmd", language: "es", sourcecountry: "INT", socialimage: CURATED_IMG["curated-6"] },
    { url: "curated-7", title: "Libano: intercambio de fuego en la Linea Azul, 90K desplazados", seendate: new Date().toISOString(), domain: "vanguard-cmd", language: "es", sourcecountry: "INT", socialimage: CURATED_IMG["curated-7"] },
    { url: "curated-8", title: "Estonia aumenta gasto defensivo ante tension en el baltico", seendate: new Date().toISOString(), domain: "vanguard-cmd", language: "es", sourcecountry: "INT", socialimage: CURATED_IMG["curated-8"] },
    // v16: 4 noticias adicionales con foto real para una portada llena
    { url: "curated-9", title: "Indopacífico: dos grupos de portaaviones aliados inician ejercicios navales conjuntos", seendate: new Date().toISOString(), domain: "vanguard-cmd", language: "es", sourcecountry: "INT", socialimage: CURATED_IMG["curated-9"] },
    { url: "curated-10", title: "Flanco este: nueva generación de drones de ataque entra en servicio activo", seendate: new Date().toISOString(), domain: "vanguard-cmd", language: "es", sourcecountry: "INT", socialimage: CURATED_IMG["curated-10"] },
    { url: "curated-11", title: "Convoy humanitario escoltado por blindados alcanza el frente interior", seendate: new Date().toISOString(), domain: "vanguard-cmd", language: "es", sourcecountry: "INT", socialimage: CURATED_IMG["curated-11"] },
    { url: "curated-12", title: "La OTAN refuerza la vigilancia aérea con radares de largo alcance en el ártico", seendate: new Date().toISOString(), domain: "vanguard-cmd", language: "es", sourcecountry: "INT", socialimage: CURATED_IMG["curated-12"] },
  ];
  // v20: país real de cada noticia curada (para su bandera verdadera)
  const CURATED_COUNTRY = ["ua", "ps", "ye", "sd", "tw", "ml", "lb", "ee", "jp", "ua", "ua", "us"];
  return list.map((a, i) => ({ ...a, sourcecountry: CURATED_COUNTRY[i] ?? a.sourcecountry }));
}

export async function GET() {
  try {
    // 1) Cache-first: return cached news immediately if any cache exists
    const cached = await db.newsItem.findMany({
      orderBy: { publishedAt: "desc" },
      take: 48,
    });
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const hasFresh = cached.length > 0 && cached[0].createdAt > thirtyMinAgo;

    // Fast path: if we have ANY cache, return it immediately (don't block on GDELT)
    if (cached.length > 0) {
      // Refresh in background if stale (best-effort, don't await)
      if (!hasFresh) {
        // v35 FIX: after() garantiza que el refresco corra COMPLETO después de la
        // respuesta. El fire-and-forget anterior moría congelado con el lambda de
        // Vercel → las noticias llevaban días sin actualizarse.
        after(() => refreshGdeltInBackground());
      }
      return NextResponse.json({
        items: cached.slice(0, 48).map((it, i) =>
          withFallbackImage(
            {
              ...withCuratedImage(it),
              // v20: bandera del país deducible también para filas cacheadas sin sourceCountry
              sourceCountry: it.sourceCountry ?? guessCountry(it.title),
            },
            i
          )
        ),
        source: "CACHE",
      });
    }

    // No cache at all — fetch synchronously (first run)
    let articles: GdeltArticle[] = [];
    try {
      const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];
      const url = `${GDELT_URL}?query=${encodeURIComponent(
        query + " sourcelang:spa"
      )}&format=json&maxrecords=25&sort=datedesc&mode=ArtList`;
      const controller = new AbortController();
      // v35: 2.5s era insuficiente para GDELT en serverless frío → casi siempre abortaba
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        headers: { "User-Agent": "Vanguard/2.0" },
        signal: controller.signal,
        next: { revalidate: 300 },
      });
      clearTimeout(timeout);
      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const data: GdeltResponse = await res.json();
          articles = data.articles ?? [];
        }
      }
    } catch (e) {
      console.error("GDELT fetch failed (timeout/blocked), using curated", e);
    }

    const curated = await getCuratedFallback();
    const allArticles = articles.length > 0 ? articles : curated;

    // upsert cache (only when no cache existed)
    const items: Awaited<ReturnType<typeof db.newsItem.upsert>>[] = [];
    for (const a of allArticles) {
      try {
        const item = await db.newsItem.upsert({
          where: { externalId: a.url },
          update: {},
          create: {
            externalId: a.url,
            title: a.title,
            url: a.url.startsWith("http") ? a.url : "#",
            source: a.domain ?? "vanguard-cmd",
            imageUrl: a.socialimage ?? null,
            publishedAt: parseGdeltDate(a.seendate),
            language: a.language ?? "es",
            conflictTag: conflictTag(a.title),
            tacticalTag: classifyTag(a.title),
            sourceCountry: guessCountry(a.title, a.sourcecountry),
          },
        });
        items.push(item);
      } catch {
        // skip
      }
    }

    items.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    return NextResponse.json({
      items: items.slice(0, 30).map((it, i) => withFallbackImage(withCuratedImage(it), i)),
      source: articles.length > 0 ? "GDELT" : "CURATED",
    });
  } catch (e) {
    console.error("news route error", e);
    return NextResponse.json({ items: [], source: "ERROR", error: String(e) }, { status: 500 });
  }
}

// Background refresh: fetch GDELT and upsert without blocking the response.
// v16: el relleno curado (con fotos reales) se ejecuta SIEMPRE, aunque GDELT falle.
async function refreshGdeltInBackground() {
  // v35: candado anti rate-limit — todos los lambdas de Vercel comparten IP y
  // GDELT admite ~1 petición cada 5s: si N visitas disparan N refrescos, todos
  // vuelven vacíos. Con el candado solo UNO corre cada 5 minutos.
  try {
    await db.$executeRawUnsafe(
      "CREATE TABLE IF NOT EXISTS site_counter (k TEXT PRIMARY KEY, n BIGINT NOT NULL DEFAULT 0)"
    );
    await db.$executeRawUnsafe(
      "INSERT INTO site_counter (k, n) VALUES ('gdelt:refresh', 0) ON CONFLICT (k) DO NOTHING"
    );
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    const locked = await db.$executeRaw`
      UPDATE site_counter SET n = ${Date.now()}
      WHERE k = 'gdelt:refresh' AND n < ${fiveMinAgo}`;
    if (locked === 0) return; // otro lambda refrescó hace menos de 5 min
  } catch {
    /* si el candado falla, intentamos igual */
  }
  let articles: GdeltArticle[] = [];
  try {
    const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];
    const url = `${GDELT_URL}?query=${encodeURIComponent(
      query + " sourcelang:spa"
    )}&format=json&maxrecords=25&sort=datedesc&mode=ArtList`;
    const controller = new AbortController();
    // v35: ídem — 8s para que GDELT responda incluso en lambda frío
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      headers: { "User-Agent": "Vanguard/2.0" },
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timeout);
    if (res.ok) {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data: GdeltResponse = await res.json();
        articles = data.articles ?? [];
      }
    }
  } catch {
    // GDELT no responde: seguimos con las curadas
  }

  // upsert de las curadas: crea 9-12, refresca imagen de 1-8 — siempre vivo
  try {
    const curated = await getCuratedFallback();
    for (const a of curated) {
      try {
        await db.newsItem.upsert({
          where: { externalId: a.url },
          update: { imageUrl: a.socialimage ?? null },
          create: {
            externalId: a.url,
            title: a.title,
            url: "#",
            source: a.domain ?? "vanguard-cmd",
            imageUrl: a.socialimage ?? null,
            publishedAt: parseGdeltDate(a.seendate),
            language: a.language ?? "es",
            conflictTag: conflictTag(a.title),
            tacticalTag: classifyTag(a.title),
            sourceCountry: guessCountry(a.title, a.sourcecountry),
          },
        });
      } catch {
        // skip
      }
    }
  } catch {
    // best-effort
  }

  // v35 PLAN B: la IP compartida de Vercel suele estar rate-limited por GDELT.
  // Si GDELT no trajo nada, tiramos de RSS de medios internacionales reales:
  // BBC Mundo, France24 español y DW español — frescos, gratis y sin límites.
  if (articles.length === 0) {
    const rss = await fetchRssFallback();
    for (const a of rss) {
      try {
        await db.newsItem.upsert({
          where: { externalId: a.link },
          update: {},
          create: {
            externalId: a.link,
            title: a.title,
            url: a.link,
            source: a.source,
            imageUrl: null,
            publishedAt: a.pubDate,
            language: "es",
            conflictTag: conflictTag(a.title),
            tacticalTag: classifyTag(a.title),
            sourceCountry: guessCountry(a.title, ""),
          },
        });
      } catch {
        // skip
      }
    }
  }

  // si GDELT trajo articulos, upsert normal (sin pisar nada)
  for (const a of articles) {
    try {
      await db.newsItem.upsert({
        where: { externalId: a.url },
        update: {},
        create: {
          externalId: a.url,
          title: a.title,
          url: a.url.startsWith("http") ? a.url : "#",
          source: a.domain ?? "vanguard-cmd",
          imageUrl: a.socialimage ?? null,
          publishedAt: parseGdeltDate(a.seendate),
          language: a.language ?? "es",
          conflictTag: conflictTag(a.title),
          tacticalTag: classifyTag(a.title),
          sourceCountry: guessCountry(a.title, a.sourcecountry),
        },
      });
    } catch {
      // skip
    }
  }
}

// ===== v35: RESPALDO RSS — medios reales cuando GDELT está bloqueado =====

const RSS_SOURCES = [
  { url: "https://feeds.bbci.co.uk/mundo/rss.xml", source: "BBC Mundo" },
  { url: "https://www.france24.com/es/rss", source: "France 24" },
  { url: "https://rss.dw.com/rdf/rss-sp-all", source: "DW Español" },
  // v48.0 MÁS NOTICIAS: cobertura de conflictos líder mundial + medio español
  { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera" },
  { url: "https://www.abc.es/rss/2.0/internacional/", source: "ABC Internacional" },
];

interface RssArticle {
  title: string;
  link: string;
  pubDate: Date;
  source: string;
}

function decodeCdata(s: string): string {
  return s.replace(/^\s*<!\[CDATA\[/, "").replace(/\]\]>\s*$/, "").trim();
}

async function fetchRssFallback(): Promise<RssArticle[]> {
  const out: RssArticle[] = [];
  for (const src of RSS_SOURCES) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(src.url, {
        headers: { "User-Agent": "Vanguard/2.0" },
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(t);
      if (!res.ok) continue;
      const xml = await res.text();
      const chunks = xml.split(/<item[\s>]/).slice(1);
      for (const raw of chunks.slice(0, 14)) {
        const title = unescapeXml(decodeCdata(raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ""));
        const link = unescapeXml(decodeCdata(raw.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? ""));
        if (!title || !link.startsWith("http")) continue;
        const dateRaw =
          raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ??
          raw.match(/<dc:date>([\s\S]*?)<\/dc:date>/)?.[1] ?? "";
        const pubDate = dateRaw ? new Date(dateRaw) : new Date();
        if (Number.isNaN(pubDate.getTime())) continue;
        out.push({ title, link, pubDate, source: src.source });
      }
    } catch {
      continue; // un medio caído no tumba el canal
    }
  }
  return out;
}
