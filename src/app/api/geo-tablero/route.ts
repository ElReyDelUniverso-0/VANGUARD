import { NextResponse } from "next/server";

// v52.1 TABLERO GEOPOLÍTICO — ruta server-side que funde fuentes abiertas
// (OSINT) en una sola respuesta compacta y cacheada. Complementa a /api/geo
// (Banco Mundial/ISS/trending) con fuentes NUEVAS:
//   · GDELT (proyecto abierto, ~100k medios, sin key) → titulares de conflicto POR REGIÓN
//   · adsb.lol /v2/mil → aeronaves MILITARES en el aire AHORA (ADS-B público, sin key)
//   · USGS M4.5 semana → sismos significativos
//   · NOAA SWPC → índice Kp planetary (tormentas geomagnéticas: GPS/radio/drones)
// Todo son datos públicos sin credenciales. Caché en memoria por instancia para
// respetar los límites de tasa (GDELT pide 1 req / 5 s) y sirve stale si caen.

export const dynamic = "force-dynamic";
export const maxDuration = 25;

interface Art { title: string; url: string; domain: string; country: string }

const REGIONS: { id: string; name: string; q: string }[] = [
  { id: "este", name: "EUROPA DEL ESTE", q: "(airstrike OR shelling OR drones OR artillery) (ukraine OR russia OR belarus)" },
  { id: "oriente", name: "MEDIO ORIENTE", q: "(airstrike OR strike OR missiles OR shelling) (gaza OR israel OR iran OR lebanon OR yemen)" },
  { id: "africa", name: "ÁFRICA", q: "(offensive OR shelling OR militia OR clashes) (sudan OR sahel OR mali OR somalia OR ethiopia)" },
  { id: "asia", name: "ASIA-PACÍFICO", q: "(missile OR military OR naval OR airspace) (taiwan OR korea OR myanmar)" },
  { id: "latam", name: "AMÉRICA LATINA", q: "sourcelang:spanish (militar OR ejercito OR cartel OR frontera OR crisis) (venezuela OR colombia OR haiti OR ecuador OR mexico)" },
];

// ------------------------------------------------------------- caché ram ----
type Entry = { t: number; data: unknown };
const cache = new Map<string, Entry>();
const TTL = { gdelt: 5 * 60_000, mil: 90_000, usgs: 5 * 60_000, noaa: 10 * 60_000 };

function getCached(key: string, ttl: number): unknown | null {
  const e = cache.get(key);
  if (e && Date.now() - e.t < ttl) return e.data;
  return null;
}
function setCached(key: string, data: unknown) {
  cache.set(key, { t: Date.now(), data });
  if (cache.size > 40) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].t - b[1].t)[0];
    if (oldest) cache.delete(oldest[0]);
  }
}

async function jfetch(url: string, timeoutMs = 8000): Promise<unknown | null> {
  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": "VANGUARD-OSINT/1.0 (open-data dashboard)" },
      cache: "no-store",
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- GDELT ----
async function gdeltRegion(idx: number): Promise<{ name: string; arts: Art[]; live: boolean } | null> {
  const reg = REGIONS[idx];
  if (!reg) return null;
  const key = `gdelt:${reg.id}`;
  const fresh = getCached(key, TTL.gdelt);
  if (fresh) return { name: reg.name, arts: fresh as Art[], live: true };

  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(reg.q)}&mode=artlist&maxrecords=8&format=json&sort=datedesc`;
  let d = (await jfetch(url)) as { articles?: { url?: string; title?: string; domain?: string; sourcecountry?: string }[] } | null;
  // GDELT admite ~1 req/5 s: si el primer intento viene vacío/limitado, UN reintento
  // tras 6 s salva el arranque en frío (queda dentro del maxDuration de la ruta)
  if (!d || !Array.isArray(d.articles) || !d.articles.length) {
    await new Promise((res) => setTimeout(res, 6000));
    d = (await jfetch(url)) as typeof d;
  }
  if (d && Array.isArray(d.articles)) {
    const arts: Art[] = d.articles
      .filter((a) => a.url && a.title)
      .slice(0, 6)
      .map((a) => ({
        title: a.title!.slice(0, 180),
        url: a.url!,
        domain: a.domain ?? "GDELT",
        country: a.sourcecountry ?? "",
      }));
    if (arts.length) {
      setCached(key, arts);
      return { name: reg.name, arts, live: true };
    }
  }
  // sin respuesta (rate-limit 429 o vacío): sirve lo último que se tenga
  const stale = cache.get(key);
  if (stale) return { name: reg.name, arts: stale.data as Art[], live: false };
  return { name: reg.name, arts: [], live: false };
}

// ------------------------------------------------------- aéreo militar ----
interface MilData { total: number; types: { t: string; n: number }[]; samples: { cs: string; t: string; gs: number; lat: number; lon: number }[] }

async function milAir(): Promise<MilData | null> {
  const fresh = getCached("mil", TTL.mil);
  if (fresh) return fresh as MilData;
  const d = (await jfetch("https://api.adsb.lol/v2/mil", 9000)) as { ac?: Record<string, unknown>[] } | null;
  const ac = d?.ac ?? [];
  if (!ac.length) {
    const stale = cache.get("mil");
    return stale ? (stale.data as MilData) : null;
  }
  const airborne = ac.filter((a) => a.alt_baro !== "ground");
  const types = new Map<string, number>();
  for (const a of airborne) {
    const t = String(a.t ?? "?").toUpperCase();
    types.set(t, (types.get(t) ?? 0) + 1);
  }
  const top = [...types.entries()].sort((x, y) => y[1] - x[1]).slice(0, 7).map(([t, n]) => ({ t, n }));
  const samples = airborne
    .filter((a) => typeof a.flight === "string" && (a.flight as string).trim())
    .slice(0, 4)
    .map((a) => ({
      cs: String(a.flight).trim(),
      t: String(a.t ?? "?").toUpperCase(),
      gs: Math.round(Number(a.gs ?? 0)),
      lat: Math.round(Number(a.lat ?? 0) * 10) / 10,
      lon: Math.round(Number(a.lon ?? 0) * 10) / 10,
    }));
  const out: MilData = { total: airborne.length, types: top, samples };
  setCached("mil", out);
  return out;
}

// ---------------------------------------------------------------- USGS ----
interface Quake { mag: number; place: string; url: string; ago: string }

async function quakes(): Promise<Quake[] | null> {
  const fresh = getCached("usgs", TTL.usgs);
  if (fresh) return fresh as Quake[];
  const d = (await jfetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson", 9000)) as { features?: { properties: { mag?: number; place?: string; url?: string; time?: number } }[] } | null;
  const fs = d?.features ?? [];
  if (!fs.length) {
    const stale = cache.get("usgs");
    return stale ? (stale.data as Quake[]) : null;
  }
  const out: Quake[] = fs
    .sort((a, b) => (b.properties.mag ?? 0) - (a.properties.mag ?? 0))
    .slice(0, 4)
    .map((f) => {
      const hrs = f.properties.time ? Math.max(0, Math.round((Date.now() - f.properties.time) / 3600000)) : 0;
      return {
        mag: Math.round((f.properties.mag ?? 0) * 10) / 10,
        place: (f.properties.place ?? "—").slice(0, 64),
        url: f.properties.url ?? "",
        ago: hrs >= 24 ? `${Math.floor(hrs / 24)} d` : `${hrs} h`,
      };
    });
  setCached("usgs", out);
  return out;
}

// ---------------------------------------------------------------- NOAA ----
async function kpIndex(): Promise<{ kp: number; storm: string } | null> {
  const fresh = getCached("noaa", TTL.noaa);
  if (fresh) return fresh as { kp: number; storm: string };
  const d = (await jfetch("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json", 8000)) as unknown[] | null;
  if (!Array.isArray(d) || d.length < 2) {
    const stale = cache.get("noaa");
    return stale ? (stale.data as { kp: number; storm: string }) : null;
  }
  const row = d[d.length - 1] as [string, string];
  const kp = Math.round(Number(row[1]) * 10) / 10;
  const storm = kp >= 8 ? "EXTREMA" : kp >= 7 ? "SEVERA" : kp >= 6 ? "FUERTE" : kp >= 5 ? "MODERADA" : kp >= 4 ? "ACTIVA" : "CALMA";
  const out = { kp: Number.isFinite(kp) ? kp : 0, storm };
  setCached("noaa", out);
  return out;
}

// ---------------------------------------------------------------- GET -----
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ri = Math.min(REGIONS.length - 1, Math.max(0, parseInt(searchParams.get("r") ?? "0", 10) || 0));

  const [region, mil, qs, kp] = await Promise.all([
    gdeltRegion(ri),
    milAir(),
    quakes(),
    kpIndex(),
  ]);

  return NextResponse.json(
    { ts: Date.now(), regionIdx: ri, region, mil, quakes: qs, kp },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
  );
}
