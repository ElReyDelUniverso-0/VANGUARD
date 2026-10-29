// v86.0 CENTINELA GLOBAL — ESPECTRO EN VIVO
// Monitoreo de tráfico aéreo y marítimo alrededor de las zonas calientes del
// planeta, estilo Flightradar/MarineTraffic:
//  · AEREO REAL: adsb.lol (la misma fuente viva que ya funciona en Pulso) sobre
//    5 cajas calientes. Si la fuente no responde → FALLBACK SIMULADO honesto
//    (determinista por epoch de 5 min, etiquetado como SIMULACIÓN).
//  · MARITIMO: AIS simulado (los feeds AIS reales requieren claves de pago) —
//    6 canales de navegación críticos con buques avanzando por epoch-minute,
//    mezclando petroleros, graneleros, portacontenedores y buques de guerra.
//  · ESPECTRO HF: actividad de bandas de radio determinista + eventos de
//    jamming coherentes con la tensión global si viene ?tension=N.
import { NextResponse } from "next/server";
import { execFile } from "child_process";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const UA = "VANGUARD-App/86.0 (war game; +https://vanguard.world)";

interface Avion {
  id: string;
  callsign: string;
  tipo: string;
  lat: number;
  lon: number;
  altM: number | null;
  velKmh: number | null;
  rumbo: number | null;
  mil: boolean;
  fuente: "ADS-B REAL" | "SIMULADO";
}

interface Buque {
  id: string;
  nombre: string;
  tipo: string;
  bandera: string;
  lat: number;
  lon: number;
  velNudos: number;
  rumbo: number;
  canal: string;
  guerra: boolean;
}

interface CanalMar {
  id: string;
  nombre: string;
  riesgo: "NORMAL" | "ELEVADO" | "CRITICO";
  nota: string;
}

interface EspectroPayload {
  ok: boolean;
  aviones: Avion[];
  buques: Buque[];
  canales: CanalMar[];
  bandas: { banda: string; actividad: number; jamming: boolean }[];
  fuentes: { adsb: boolean; ais: "SIMULADO"; espectro: "DERIVADO" };
  zonas: { id: string; nombre: string; lat: number; lon: number; total: number }[];
  ts: number;
  cached?: boolean;
}

let cache: { ts: number; payload?: EspectroPayload } = { ts: 0 };
const TTL_MS = 60_000;

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

// ---------- RNG determinista (mulberry32) ----------
function rng(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ZONAS_DEF = [
  { id: "marNegro", nombre: "Mar Negro", lat: 44.6, lon: 31.2, radius: 250 },
  { id: "levant", nombre: "Levante · Tel Aviv", lat: 31.9, lon: 34.6, radius: 220 },
  { id: "taiwan", nombre: "Estrecho de Taiwán", lat: 24.5, lon: 120.4, radius: 220 },
  { id: "baltico", nombre: "Báltico · Kaliningrado", lat: 55.4, lon: 19.8, radius: 220 },
  { id: "ormuz", nombre: "Estrecho de Ormuz", lat: 26.4, lon: 56.3, radius: 200 },
];

const MIL_PREFIXES = ["RCH", "FORTE", "NATO", "MAVM", "TARTN", "ARMDE", "REDEYE", "ASCOT", "RRR", "VIPER", "BOLT", "PIVOT", "BRISK", "SNAKE", "DRAGN", "PEGAS", "HOMER", "JAKE", "MAGMA", "TITAN", "RANGER", "HAWK", "REAPER", "GLOBAL", "SENTRY", "DRAGON", "CONDOR", "PREDATOR", "GRZ", "MMF", "GAF", "AMBER", "MAGIC", "SVF", "PLF", "IRF"];
const MIL_TYPES = new Set(["F16", "F35", "F15", "F22", "C17", "C130", "A400", "KC135", "KC46", "E3", "P8", "RC135", "U2", "B52", "B1", "B2", "A10", "EUFI", "TOR", "C27", "E6", "E2", "P3", "KC10", "GLEX", "C560", "CL60", "GLF5", "GLF6"]);

interface AdsblolResp {
  ac: Array<Record<string, string | number | boolean | null>> | null;
  total: number;
  now: number;
}

async function avionesReales(): Promise<{ aviones: Avion[]; zonas: EspectroPayload["zonas"] }> {
  const zonas: EspectroPayload["zonas"] = [];
  const aviones: Avion[] = [];
  await Promise.allSettled(
    ZONAS_DEF.map(async (z) => {
      const j = await curlJson<AdsblolResp>(`https://api.adsb.lol/v2/lat/${z.lat}/lon/${z.lon}/dist/${z.radius}`, 11000);
      const total = j && Array.isArray(j.ac) ? j.ac.length : 0;
      zonas.push({ id: z.id, nombre: z.nombre, lat: z.lat, lon: z.lon, total });
      if (!j || !Array.isArray(j.ac)) return;
      for (const a of j.ac) {
        const callsign = String(a.flight ?? "").trim();
        const lat = Number(a.lat);
        const lon = Number(a.lon);
        if (!callsign || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
        const tipo = String(a.t ?? "").trim().toUpperCase();
        const altFt = typeof a.alt_baro === "number" ? (a.alt_baro as number) : null;
        const gsKt = typeof a.gs === "number" ? (a.gs as number) : null;
        aviones.push({
          id: String(a.hex ?? callsign),
          callsign,
          tipo: tipo || "?",
          lat, lon,
          altM: altFt !== null ? Math.round(altFt * 0.3048) : null,
          velKmh: gsKt !== null ? Math.round(gsKt * 1.852) : null,
          rumbo: typeof a.track === "number" ? Math.round(a.track as number) : null,
          mil: MIL_PREFIXES.some((p) => callsign.startsWith(p)) || MIL_TYPES.has(tipo),
          fuente: "ADS-B REAL",
        });
      }
    })
  );
  return { aviones, zonas };
}

// Fallback simulado: contactos deterministas por epoch de 5 min
const CALLS_SIM = ["RCH412", "FORTE10", "NATO01", "ASCOT774", "RRR721", "TITAN12", "MAGMA51", "HAWK33", "SENTRY01", "DLH441", "BAW117", "UAE231", "THY8", "QTR8", "SVA212", "ELAL771", "IRO33", "CCA183", "SIA326", "EVA22"];
const TIPOS_SIM = ["F16", "E3", "P8", "C130", "KC135", "B77W", "A359", "B738", "A320", "F35", "RC135", "A400"];

function avionesSimulados(): { aviones: Avion[]; zonas: EspectroPayload["zonas"] } {
  const epoch5 = Math.floor(Date.now() / 300_000);
  const zonas: EspectroPayload["zonas"] = ZONAS_DEF.map((z) => ({ id: z.id, nombre: z.nombre, lat: z.lat, lon: z.lon, total: 5 + Math.floor(rng(epoch5 + Math.round(z.lat * 100))() * 9) }));
  const aviones: Avion[] = [];
  for (const z of ZONAS_DEF) {
    const r = rng(epoch5 + Math.round(z.lat * 100));
    const n = 4 + Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
      const mil = r() < 0.4;
      const callsign = mil ? CALLS_SIM[Math.floor(r() * 10)] + Math.floor(r() * 9) : CALLS_SIM[10 + Math.floor(r() * 10)] + Math.floor(r() * 900);
      aviones.push({
        id: `sim-${z.id}-${i}`,
        callsign,
        tipo: mil ? TIPOS_SIM[Math.floor(r() * 6)] : TIPOS_SIM[6 + Math.floor(r() * 6)],
        lat: Number((z.lat + (r() - 0.5) * 4).toFixed(3)),
        lon: Number((z.lon + (r() - 0.5) * 4).toFixed(3)),
        altM: 4000 + Math.floor(r() * 9500),
        velKmh: 600 + Math.floor(r() * 400),
        rumbo: Math.floor(r() * 360),
        mil,
        fuente: "SIMULADO",
      });
    }
  }
  return { aviones, zonas };
}

// ---------- MARÍTIMO AIS simulado (determinista por minuto) ----------
const CANALES: (CanalMar & { lat: number; lon: number; ax: number; ay: number; riesgoBase: number })[] = [
  { id: "ormuz", nombre: "Estrecho de Ormuz", riesgo: "ELEVADO", nota: "20% del petróleo del mundo pasa por aquí", lat: 26.57, lon: 56.25, ax: 0.9, ay: 0.35, riesgoBase: 55 },
  { id: "mandeb", nombre: "Bab el-Mandeb · Mar Rojo", riesgo: "CRITICO", nota: "Ataques hutíes al tráfico comercial desde 2023", lat: 12.6, lon: 43.4, ax: -0.7, ay: 0.75, riesgoBase: 80 },
  { id: "malaca", nombre: "Estrecho de Malaca", riesgo: "NORMAL", nota: "La autopista marítima de Asia", lat: 2.5, lon: 101.4, ax: 0.6, ay: -0.35, riesgoBase: 18 },
  { id: "taiwan", nombre: "Estrecho de Taiwán", riesgo: "ELEVADO", nota: "Cruce diario de la medianera ADIZ", lat: 24.5, lon: 119.5, ax: 0.35, ay: -0.15, riesgoBase: 58 },
  { id: "negro", nombre: "Mar Negro · corredor de grano", riesgo: "CRITICO", nota: "Corredor humanitario minado y patrullado", lat: 44.8, lon: 31.5, ax: -0.55, ay: -0.6, riesgoBase: 76 },
  { id: "baltico", nombre: "Báltico", riesgo: "ELEVADO", nota: "Cables cortados y flota fantasma de crudo", lat: 57.2, lon: 19.8, ax: -0.3, ay: -0.85, riesgoBase: 52 },
];

const TIPOS_BUQUE = ["Petrolero VLCC", "Granelero Capesize", "Portacontenedores Panamax", "Buque cisterna", "Portavehículos"];
const BANDERAS = ["Panamá", "Liberia", "Marshall Is.", "Malta", "Singapur", "Chipre", "Bahamas", "Hong Kong"];
const NOMBRES = ["EVER SUMMIT", "PACIFIC GRACE", "NORD VOYAGER", "SEA ETERNAL", "GULF SENTINEL", "ATLANTIC DAWN", "STAR HARBOUR", "FRONT NEBULA", "OCEAN LEDA", "COSCO GALAXY", "MAERSK KURE", "CRIMSON TIDE", "BALTIC FORTUNE", "ORIENT JADE"];

function buquesAis(tension: number): Buque[] {
  const epochMin = Math.floor(Date.now() / 60_000);
  const out: Buque[] = [];
  for (const canal of CANALES) {
    const riesgo = Math.min(100, canal.riesgoBase + Math.round((tension - 50) * 0.35));
    const r = rng(epochMin + Math.round(canal.lat * 100));
    const n = 3 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const t = ((epochMin % 40) / 40 + i / n) % 1; // 0..1 a lo largo del canal
      const guerra = r() < 0.22;
      out.push({
        id: `ais-${canal.id}-${i}`,
        nombre: NOMBRES[Math.floor(r() * NOMBRES.length)],
        tipo: guerra ? (r() < 0.5 ? "Buque de guerra" : "Fragata de escolta") : TIPOS_BUQUE[Math.floor(r() * 3)] ?? "Carguero",
        bandera: BANDERAS[Math.floor(r() * BANDERAS.length)],
        lat: Number((canal.lat + (t - 0.5) * canal.ay * 4 + (r() - 0.5) * 0.8).toFixed(3)),
        lon: Number((canal.lon + (t - 0.5) * canal.ax * 6 + (r() - 0.5) * 0.8).toFixed(3)),
        velNudos: guerra ? 14 + Math.floor(r() * 12) : 8 + Math.floor(r() * 10),
        rumbo: Math.floor(r() * 360),
        canal: canal.nombre,
        guerra,
      });
    }
    // riesgo final del canal se expone con la tensión viva
    canal.riesgo = riesgo >= 70 ? "CRITICO" : riesgo >= 40 ? "ELEVADO" : "NORMAL";
  }
  return out;
}

// ---------- ESPECTRO HF (determinista + jamming con tensión) ----------
function bandasHf(tension: number) {
  const epochMin = Math.floor(Date.now() / 60_000);
  const r = rng(epochMin);
  const bandas = ["HF 3 MHz · mensaje", "HF 5 MHz · NVIS", "HF 8 MHz · marítima", "VHF 121.5 · emergencia", "VHF 243 · militar", "UHF SATCOM", "L-BAND GPS L1", "Beidou B1"];
  return bandas.map((banda) => {
    const base = 18 + r() * 55;
    const jamming = (banda.includes("GPS") || banda.includes("B1")) && tension > 62 ? r() < 0.85 : tension > 80 ? r() < 0.3 : r() < 0.08;
    return { banda, actividad: Math.min(100, Math.round(base + (tension - 50) * 0.4)), jamming };
  });
}

export async function GET(req: Request) {
  const now = Date.now();
  const url = new URL(req.url);
  const tension = Math.max(0, Math.min(100, Number(url.searchParams.get("tension") ?? 55) || 55));

  if (cache.payload && now - cache.ts < TTL_MS) {
    return NextResponse.json({ ...cache.payload, cached: true });
  }

  let { aviones, zonas } = await avionesReales();
  const adsbViva = aviones.length > 0;
  if (!adsbViva) {
    const sim = avionesSimulados();
    aviones = sim.aviones;
    zonas = sim.zonas;
  }

  // top 22: primero militares, luego velocidad
  aviones.sort((a, b) => Number(b.mil) - Number(a.mil) || (b.velKmh ?? 0) - (a.velKmh ?? 0));
  aviones = aviones.slice(0, 22);

  const buques = buquesAis(tension);
  const canales: CanalMar[] = CANALES.map(({ id, nombre, riesgo, nota }) => ({ id, nombre, riesgo, nota }));

  const payload: EspectroPayload = {
    ok: true,
    aviones,
    buques,
    canales,
    bandas: bandasHf(tension),
    fuentes: { adsb: adsbViva, ais: "SIMULADO", espectro: "DERIVADO" },
    zonas,
    ts: now,
  };
  cache = { ts: now, payload };
  return NextResponse.json(payload);
}
