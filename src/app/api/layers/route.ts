// v41 PLANETA VIVO — capas del planeta en un solo endpoint, TODO keyless ($0).
//   · NASA EONET v3: eventos naturales ABIERTOS en vivo (ciclones, incendios,
//     volcanes, sequías, inundaciones, hielo marino...) con coordenadas reales
//   · NOAA SWPC: predicción de AURORAS (ovation_aurora_latest, rejilla global
//     de probabilidad 0-100) — filtrada y muestreada server-side para que el
//     payload pese poco (el JSON crudo son ~900KB)
// Doctrina "NUNCA VACÍA" (v40): Promise.allSettled por capa, stale si una cae,
// barebones si todas caen. Cache 5 min en memoria del servidor.

import { NextResponse } from "next/server";

export const runtime = "nodejs";

type EonetEvent = {
  id: string;
  title: string;
  category: string;      // severeStorms | volcanoes | wildfires | seaLakeIce | drought | dustHaze | floods | landslides | snow
  categoryLabel: string;
  lat: number;
  lng: number;
  date: string;          // última geometría conocida
  link: string;          // página EONET del evento
  source?: string;
};

type AuroraZone = {
  lat: number;
  lng: number;
  prob: number;          // probabilidad 0-100 de ver aurora
};

type LayersPayload = {
  ok: boolean;
  ts: string;
  auroraUpdated: string | null;
  auroraMax: number;                    // probabilidad máxima global (para el HUD)
  events: EonetEvent[];
  aurora: AuroraZone[];
  sources: { eonet: boolean; aurora: boolean };
};

let CACHE: { at: number; data: LayersPayload } | null = null;
const TTL = 5 * 60 * 1000; // 5 min

const UA = { headers: { "User-Agent": "VANGUARD/41.0 (https://vanguard-kq9r.vercel.app; vanguard.ops@vanguard.world)" } };

async function jget<T>(url: string, revalidate: number): Promise<T | null> {
  try {
    const r = await fetch(url, { ...UA, next: { revalidate } });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

const CAT_LABEL: Record<string, string> = {
  severeStorms: "Ciclón/Tormenta",
  volcanoes: "Volcán",
  wildfires: "Incendio",
  seaLakeIce: "Hielo marino",
  drought: "Sequía",
  dustHaze: "Polvo/Niebla",
  floods: "Inundación",
  landslides: "Derrumbe",
  snow: "Nieve extrema",
};

// colores por categoría (client replica — aquí solo para validar)
const CAT_IDS = Object.keys(CAT_LABEL);

type EonetRaw = {
  events: {
    id: string;
    title: string;
    link: string;
    closed: string | null;
    categories: { id: string; title: string }[];
    sources: { id: string }[];
    geometry: { date: string; coordinates: number[] | number[][] }[];
  }[];
};

function pickCoords(g: { coordinates: number[] | number[][] }): [number, number] | null {
  // EONET manda point -> [lon, lat] o polyline -> [[lon,lat],...]
  const c = g.coordinates as number[] | number[][];
  if (Array.isArray(c) && typeof c[0] === "number") return [c[0] as number, c[1] as number];
  if (Array.isArray(c) && Array.isArray(c[0])) {
    const p = c[Math.floor(c.length / 2)] as number[];
    return [p[0], p[1]];
  }
  return null;
}

async function buildPayload(): Promise<LayersPayload> {
  const [eonet, auroraRaw] = await Promise.allSettled([
    jget<EonetRaw>("https://eonet.gsfc.nasa.gov/api/v3/events?limit=60&status=open&days=30", 600),
    jget<{ "Observation Time"?: string; coordinates: [number, number, number][] }>(
      "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json",
      600
    ),
  ]);

  // ===== EONET =====
  const events: EonetEvent[] = [];
  if (eonet.status === "fulfilled" && eonet.value?.events?.length) {
    for (const ev of eonet.value.events) {
      const lastGeo = ev.geometry?.[ev.geometry.length - 1];
      if (!lastGeo) continue;
      const pos = pickCoords(lastGeo);
      if (!pos || !isFinite(pos[0]) || !isFinite(pos[1])) continue;
      const cat = ev.categories?.[0]?.id ?? "severeStorms";
      events.push({
        id: ev.id,
        title: ev.title,
        category: CAT_IDS.includes(cat) ? cat : "severeStorms",
        categoryLabel: CAT_LABEL[cat] ?? ev.categories?.[0]?.title ?? "Evento",
        lat: pos[1],
        lng: pos[0],
        date: lastGeo.date ?? "",
        link: ev.link,
        source: ev.sources?.[0]?.id,
      });
    }
    // prioriza ciclones y volcánes (lo más espectacular), luego fecha
    const prio: Record<string, number> = { severeStorms: 0, volcanoes: 1, wildfires: 2, floods: 3 };
    events.sort((a, b) => (prio[a.category] ?? 9) - (prio[b.category] ?? 9));
    if (events.length > 45) events.length = 45;
  }

  // ===== AURORAS (NOAA ovation) =====
  // rejilla 1024x512 [lon, lat, prob]. Umbral 8: en noches tranquilas el pico
  // suele rondar 10-20% — con umbral alto la capa estaría muerta la mayoría
  // de días; con 8 siempre hay un cinturón sutil y en tormentas se llena.
  const aurora: AuroraZone[] = [];
  let auroraMax = 0;
  let auroraUpdated: string | null = null;
  if (auroraRaw.status === "fulfilled" && Array.isArray(auroraRaw.value?.coordinates)) {
    auroraUpdated = auroraRaw.value["Observation Time"] ?? null;
    const coords = auroraRaw.value.coordinates;
    for (let i = 0; i < coords.length; i++) {
      const [lng, lat, prob] = coords[i];
      if (typeof prob !== "number" || prob < 8) continue;
      // muestreo: cada 2 puntos basta (visual)
      if (i % 2 === 0) aurora.push({ lat, lng, prob: Math.round(prob) });
      if (prob > auroraMax) auroraMax = Math.round(prob);
    }
    if (aurora.length > 600) aurora.length = 600;
  }

  return {
    ok: true,
    ts: new Date().toISOString(),
    auroraUpdated,
    auroraMax,
    events,
    aurora,
    sources: { eonet: events.length > 0, aurora: aurora.length > 0 },
  };
}

function barebones(): LayersPayload {
  return {
    ok: true,
    ts: new Date().toISOString(),
    auroraUpdated: null,
    auroraMax: 0,
    events: [],
    aurora: [],
    sources: { eonet: false, aurora: false },
  };
}

export async function GET() {
  try {
    if (CACHE && Date.now() - CACHE.at < TTL) {
      return NextResponse.json(CACHE.data);
    }
    const data = await buildPayload();
    if (data.sources.eonet || data.sources.aurora) {
      CACHE = { at: Date.now(), data };
      return NextResponse.json(data);
    }
    if (CACHE) return NextResponse.json({ ...CACHE.data, ts: new Date().toISOString() });
    return NextResponse.json(barebones());
  } catch {
    if (CACHE) return NextResponse.json(CACHE.data);
    return NextResponse.json(barebones());
  }
}
