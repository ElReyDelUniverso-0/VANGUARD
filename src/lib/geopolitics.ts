// v43.0 RADAR GLOBAL — fuentes geopolíticas abiertas (SIN API key, $0).
//  · GDACS (gdacs.org, Comisión Europea / JRC): alertas de desastres naturales
//    en tiempo real vía RSS — se obtiene SERVER-SIDE en /api/geopolitics.
//  · GDELT Project (gdeltproject.org): titulares de conflicto de ~100.000
//    medios del mundo. Su API es abierta y con CORS (*), PERO limita 1 req/5s
//    POR IP y las IPs de salida de Vercel están saturadas por todo el mundo:
//    por eso GDELT se consume DIRECTO DESDE EL NAVEGADOR del visitante
//    (ver geopolitics-radar.tsx), con llamadas espaciadas 6 s.
//  · ReliefWeb quedó excluida: exige appname aprobado (registro manual).
// Cache en memoria 5 min para el servidor. Toda fuente caída degrada a [].

export type RadarItem = {
  title: string;
  url: string;
  source: string;
  seen: string; // fecha legible o ""
};

type CacheShape = { t: number; gdacs: RadarItem[] };

const TTL_MS = 5 * 60 * 1000;
let _cache: CacheShape | null = null;

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

/** Alertas GDACS con cache de 5 min. Las caídas degradan a []. */
export async function getRadar(): Promise<{ gdacs: RadarItem[]; cachedAt: string }> {
  if (!_cache || Date.now() - _cache.t > TTL_MS) {
    const alerts = await gdacs(10);
    _cache = { t: Date.now(), gdacs: alerts };
  }
  return { gdacs: _cache.gdacs, cachedAt: new Date(_cache.t).toISOString() };
}
