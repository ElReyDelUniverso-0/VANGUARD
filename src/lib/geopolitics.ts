// v43.0 RADAR GLOBAL — fuentes geopolíticas abiertas (SIN API key, $0).
//  · GDELT Project (gdeltproject.org): monitoriza ~100.000 medios del mundo
//    cada 15 minutos. DOC 2.0 API devuelve titulares de guerra/conflicto por
//    idioma. Abierta, sin registro.
//  · GDACS (gdacs.org, Comisión Europea / JRC): alertas de desastres naturales
//    en tiempo real (terremotos, ciclones, inundaciones, volcanes) vía RSS.
//    Público, sin registro. (ReliefWeb quedó excluida: exige appname aprobado.)
// Cache en memoria 5 min: el radar es "en vivo" para el humano, amable con
// las fuentes. Toda fuente fallida degrada a [] — nunca tumba la página.

export type RadarItem = {
  title: string;
  url: string;
  source: string;
  seen: string; // fecha legible o ""
};

type CacheShape = {
  t: number;
  gdeltEs: RadarItem[];
  gdeltEn: RadarItem[];
  gdacs: RadarItem[];
};

const TTL_MS = 5 * 60 * 1000;
let _cache: CacheShape | null = null;

function fmtGdeltDate(s: string): string {
  // "20260923T231500Z" -> "23/09 23:15"
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/.exec(s ?? "");
  return m ? `${m[3]}/${m[2]} ${m[4]}:${m[5]}` : "";
}

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; VANGUARD/43)" },
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`status ${r.status}`);
  const txt = await r.text();
  // GDELT responde TEXTO PLANO cuando le pegas más rápido de 1 req/5s
  if (!txt.trimStart().startsWith("{")) {
    throw new Error("gdelt-rate-limit");
  }
  return JSON.parse(txt) as unknown;
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function gdelt(query: string, max: number): Promise<RadarItem[]> {
  // GDELT: 1 petición cada 5 s — llamada secuencial con UN reintento tras pausa
  const params = new URLSearchParams({
    query,
    mode: "artlist",
    maxrecords: String(max),
    format: "json",
    sort: "datedesc",
  });
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const j = (await fetchJson(url, 10_000)) as {
        articles?: { url?: string; title?: string; domain?: string; seendate?: string }[];
      };
      const arts = Array.isArray(j.articles) ? j.articles : [];
      return arts
        .filter((a) => a.title && a.url)
        .map((a) => ({
          title: String(a.title).slice(0, 220),
          url: String(a.url),
          source: String(a.domain ?? "gdelt"),
          seen: fmtGdeltDate(String(a.seendate ?? "")),
        }));
    } catch {
      if (attempt === 0) await sleep(6_000); // respetar la ventana de 5 s
      // segundo intento fallido -> fuente degradada a []
    }
  }
  return [];
}

function xmlTag(block: string, tag: string): string {
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(block);
  if (!m) return "";
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

async function gdacs(max: number): Promise<RadarItem[]> {
  try {
    const r = await fetch("https://www.gdacs.org/xml/rss.xml", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; VANGUARD/43)" },
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });
    if (!r.ok) return [];
    const xml = await r.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
    return items.slice(0, max).map((it) => {
      const pub = xmlTag(it, "pubDate");
      let seen = "";
      try {
        seen = pub ? new Date(pub).toISOString().slice(5, 16).replace("T", " ") : "";
      } catch {
        seen = "";
      }
      return {
        title: xmlTag(it, "title").slice(0, 220) || "alerta GDACS",
        url: xmlTag(it, "link") || "https://www.gdacs.org/",
        source: "GDACS · UE",
        seen,
      };
    });
  } catch {
    return [];
  }
}

async function collect(): Promise<CacheShape> {
  // GDELT en secuencia (1 req/5 s), GDACS en paralelo (otro host)
  const [gdeltEs, alerts] = await Promise.all([
    gdelt(
      "(war OR conflict OR military OR guerra OR militar OR ataque OR ofensiva) sourcelang:spanish",
      12
    ),
    gdacs(10),
  ]);
  const gdeltEn = await gdelt(
    "(war OR conflict OR military OR offensive OR airstrike) sourcelang:english",
    10
  );
  return { t: Date.now(), gdeltEs, gdeltEn, gdacs: alerts };
}

/** Radar geopolítico con cache de 5 min (agradable con GDELT/GDACS). */
export async function getRadar(): Promise<Omit<CacheShape, "t"> & { cachedAt: string }> {
  if (!_cache || Date.now() - _cache.t > TTL_MS) {
    _cache = await collect();
  }
  return {
    gdeltEs: _cache.gdeltEs,
    gdeltEn: _cache.gdeltEn,
    gdacs: _cache.gdacs,
    cachedAt: new Date(_cache.t).toISOString(),
  };
}
