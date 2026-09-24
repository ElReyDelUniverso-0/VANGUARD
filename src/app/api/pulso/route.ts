import { NextResponse } from "next/server";
import { execFile } from "child_process";

// v51.0 PULSO MUNDIAL — 3 fuentes REALES sin API key:
// 1. wheretheiss.at  -> ISS en vivo (satélite espía)
// 2. OpenSky Network -> aviones en vivo sobre zonas de conflicto
// 3. Spaceflight News-> lanzamientos y satélites (apoyo a inteligencia)
// Nota: curl-first (mismo patrón que /api/wiki) porque el sandbox/Vercel
// a veces bloquea la huella TLS de node. Cache 45s.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const UA = "VANGUARD-App/51.0 (war game; +https://vanguard.world)";

interface IssState {
  lat: number; lon: number; altKm: number; velKmh: number;
  visibility: string; footprintKm: number; ts: number;
}
interface Plane {
  icao: string; callsign: string; country: string;
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

const ZONES_DEF = [
  { id: "ucrania", label: "Ucrania · Mar Negro", lamin: 44, lomin: 20, lamax: 54, lomax: 42 },
  { id: "orientemedio", label: "Oriente Medio", lamin: 27, lomin: 32, lamax: 37, lomax: 46 },
  { id: "marchina", label: "Mar de China Meridional", lamin: 8, lomin: 105, lamax: 24, lomax: 122 },
];

interface OpenSkyState {
  states: Array<Array<string | number | boolean | number[] | null> | null> | null;
  time: number;
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
  const url = `https://opensky-network.org/api/states/all?lamin=${z.lamin}&lomin=${z.lomin}&lamax=${z.lamax}&lomax=${z.lomax}`;
  const j = await curlJson<OpenSkyState>(url, 11000);
  const base: Zone = { id: z.id, label: z.label, total: 0, planes: [] };
  if (!j || !Array.isArray(j.states)) return base;
  const rows = j.states.filter((s): s is Array<string | number | boolean | null> => Array.isArray(s));
  base.total = rows.length;
  const planes: Plane[] = [];
  for (const s of rows) {
    const callsign = String(s[1] ?? "").trim();
    const onGround = Boolean(s[8]);
    if (onGround || !callsign) continue;
    const velMs = typeof s[9] === "number" ? (s[9] as number) : null;
    const alt = typeof s[13] === "number" ? (s[13] as number) : typeof s[7] === "number" ? (s[7] as number) : null;
    planes.push({
      icao: String(s[0] ?? ""),
      callsign,
      country: String(s[2] ?? ""),
      altM: alt !== null ? Math.round(alt) : null,
      velKmh: velMs !== null ? Math.round(velMs * 3.6) : null,
      heading: typeof s[10] === "number" ? (s[10] as number) : null,
      mil: MIL_PREFIXES.some((p) => callsign.startsWith(p)),
    });
  }
  planes.sort((a, b) => Number(b.mil) - Number(a.mil) || (b.velKmh ?? 0) - (a.velKmh ?? 0));
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
