import { NextResponse } from "next/server";
import { execFile } from "child_process";

// v51.0 PULSO MUNDIAL — 3 fuentes REALES sin API key:
// 1. wheretheiss.at -> ISS en vivo (satélite espía)
// 2. adsb.lol       -> aviones en vivo (ADS-B abierto) sobre 3 zonas calientes
// 3. Spaceflight News -> lanzamientos y satélites (apoyo a inteligencia)
// Nota: curl-first (mismo patrón que /api/wiki) porque el sandbox/Vercel
// a veces bloquea la huella TLS de node. Cache 45s.
// NOTA v51.0.1: OpenSky descartado (bloquea IPs de nube: "Too many requests").

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const UA = "VANGUARD-App/51.0 (war game; +https://vanguard.world)";

interface IssState {
  lat: number; lon: number; altKm: number; velKmh: number;
  visibility: string; footprintKm: number; ts: number;
}
interface Plane {
  icao: string; callsign: string; type: string; reg: string;
  altM: number | null; velKmh: number | null; heading: number | null; mil: boolean;
}
interface Zone {
  id: string; label: string; total: number; planes: Plane[];
}
interface NewsItem {
  id: string; title: string; url: string; site: string; published: string;
}

let cache: { ts: number; payload?: PulsoPayload } = { ts: 0 };
const TTL_MS = 45_000;

interface PulsoPayload {
  iss: IssState | null;
  zones: Zone[];
  news: NewsItem[];
  sources: { iss: boolean; opensky: boolean; spaceflight: boolean };
  ts: number;
}

function curlJson<T>(url: string, timeoutMs = 9000): Promise<T | null> {
  return new Promise((resolve) => {
    execFile(
      "curl",
      ["-sg", "--max-time", "8", "-A", UA, "-H", "Accept: application/json", url],
      { timeout: timeoutMs },
      (err, stdout) => {
        if (err || !stdout) return resolve(null);
        try { resolve(JSON.parse(stdout) as T); } catch { resolve(null); }
      }
    );
  });
}

const MIL_PREFIXES = [
  "RCH", "FORTE", "NATO", "MAVM", "TARTN", "ARMDE", "REDEYE", "ASCOT", "RRR",
  "VIPER", "BOLT", "PIVOT", "BRISK", "SNAKE", "DRAGN", "PEGAS", "HOMER",
  "JAKE", "MAGMA", "TITAN", "RANGER", "HAWK", "REAPER", "GLOBAL", "SENTRY",
  "DRAGON", "CONDOR", "PREDATOR", "SWA", "GRZ", "MMF", "VVMS", "CACTUS",
  "LAGR", "EVAA", "IRON", "SPAR", "UVIR", "MMFA", "GAF", "AMBER", "MAGIC",
];
const MIL_TYPES = new Set([
  "F16", "F35", "F15", "F22", "C17", "C130", "A400", "KC135", "KC46", "E3",
  "P8", "RC135", "U2", "B52", "B1", "B2", "A10", "EUFI", "TOR", "C27",
  "CN295", "E6", "E2", "P3", "KC10", "CL30", "BE20", "C560", "GLEX",
]);

// OJO real: el espacio aéreo de Ucrania está CERRADO desde 2022 (guerra real) —
// elegimos 3 zonas con tráfico ADS-B visible y valor de inteligencia:
const ZONES_DEF = [
  { id: "marNegro", label: "Mar Negro · frontera de la guerra", lat: 44.2, lon: 28.6, radius: 200 },
  { id: "orientemedio", label: "Oriente Medio · Tel Aviv", lat: 32.08, lon: 34.78, radius: 200 },
  { id: "taiwan", label: "Estrecho de Taiwán", lat: 24.5, lon: 120.5, radius: 200 },
];

interface AdsblolResp {
  ac: Array<Record<string, string | number | boolean | null>> | null;
  total: number;
  now: number;
}

async function fetchIss(): Promise<IssState | null> {
  const j = await curlJson<Record<string, number | string>>("https://api.wheretheiss.at/v1/satellites/25544");
  if (!j) return null;
  const lat = Number(j.latitude);
  const lon = Number(j.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return {
    lat: Number(lat.toFixed(2)),
    lon: Number(lon.toFixed(2)),
    altKm: Number(Number(j.altitude).toFixed(1)),
    velKmh: Number(Number(j.velocity).toFixed(0)),
    visibility: String(j.visibility ?? "unknown"),
    footprintKm: Number(Number(j.footprint).toFixed(0)),
    ts: Number(j.timestamp ?? 0),
  };
}

async function fetchZone(z: (typeof ZONES_DEF)[number]): Promise<Zone> {
  const url = `https://api.adsb.lol/v2/lat/${z.lat}/lon/${z.lon}/dist/${z.radius}`;
  const j = await curlJson<AdsblolResp>(url, 11000);
  const base: Zone = { id: z.id, label: z.label, total: 0, planes: [] };
  if (!j || !Array.isArray(j.ac)) return base;
  base.total = j.ac.length;
  const planes: Plane[] = [];
  for (const a of j.ac) {
    const callsign = String(a.flight ?? "").trim();
    if (!callsign) continue;
    const type = String(a.t ?? "").trim();
    const altRaw = a.alt_baro;
    const altFt = typeof altRaw === "number" ? altRaw : null;
    const gsKt = typeof a.gs === "number" ? (a.gs as number) : null;
    planes.push({
      icao: String(a.hex ?? ""),
      callsign,
      type: type || "?",
      reg: String(a.r ?? "").trim(),
      altM: altFt !== null ? Math.round(altFt * 0.3048) : null,
      velKmh: gsKt !== null ? Math.round(gsKt * 1.852) : null,
      heading: typeof a.track === "number" ? (a.track as number) : null,
      mil: MIL_PREFIXES.some((p) => callsign.startsWith(p)) || MIL_TYPES.has(type.toUpperCase()),
    });
  }
  planes.sort((x, y) => Number(y.mil) - Number(x.mil) || (y.velKmh ?? 0) - (x.velKmh ?? 0));
  base.planes = planes.slice(0, 7);
  return base;
}

interface SfnResp {
  results: Array<{ id: string | number; title: string; url: string; news_site: string; published_at: string }>;
}

async function fetchNews(): Promise<NewsItem[]> {
  const j = await curlJson<SfnResp>("https://api.spaceflightnewsapi.net/v4/articles/?limit=6");
  if (!j || !Array.isArray(j.results)) return [];
  return j.results.map((r) => ({
    id: String(r.id),
    title: r.title,
    url: r.url,
    site: r.news_site ?? "space",
    published: (r.published_at ?? "").slice(0, 10),
  }));
}

export async function GET() {
  const now = Date.now();
  if (cache.payload && now - cache.ts < TTL_MS) {
    return NextResponse.json({ ...cache.payload, cached: true });
  }

  const [iss, z1, z2, z3, news] = await Promise.all([
    fetchIss(),
    fetchZone(ZONES_DEF[0]),
    fetchZone(ZONES_DEF[1]),
    fetchZone(ZONES_DEF[2]),
    fetchNews(),
  ]);

  const payload: PulsoPayload = {
    iss,
    zones: [z1, z2, z3],
    news,
    sources: { iss: !!iss, opensky: z1.total + z2.total + z3.total > 0, spaceflight: news.length > 0 },
    ts: now,
  };

  if (!payload.sources.iss && !payload.sources.opensky && !payload.sources.spaceflight) {
    return NextResponse.json({ ok: false, error: "Fuentes externas no disponibles" }, { status: 502 });
  }

  cache = { ts: now, payload };
  return NextResponse.json({ ok: true, ...payload });
}
