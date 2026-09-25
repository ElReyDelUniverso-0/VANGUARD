import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// v51.2 — GET /api/meteo — METEO OPERATIVA: condiciones meteorológicas actuales
// sobre las zonas de conflicto activas (fuente: Open-Meteo, gratuita y SIN API
// key). Caché en memoria 10 min para no martillar el upstream con cada visita.
// Los vientos/visibilidad importan de verdad: los ataques con drones FPV se
// suspenden con lluvia o viento > 15 m/s; esa es la lectura táctica del panel.

interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// mismas zonas que los frentes de frente-panel.tsx + 2 puntos calientes extra
export const ZONES: Zone[] = [
  { id: "donbas", name: "Donbás", lat: 48.0, lng: 37.8 },
  { id: "gaza", name: "Gaza", lat: 31.5, lng: 34.47 },
  { id: "sahel", name: "Sahel", lat: 14.5, lng: -1.5 },
  { id: "sudan", name: "Jartum", lat: 15.5, lng: 32.5 },
  { id: "myanmar", name: "Myanmar", lat: 21.9, lng: 96.1 },
  { id: "kashmir", name: "Cachemira", lat: 34.08, lng: 74.8 },
  { id: "marrojo", name: "Mar Rojo", lat: 13.6, lng: 42.9 },
  { id: "taiwan", name: "Estrecho de Taiwán", lat: 24.5, lng: 119.5 },
];

// WMO weather codes → texto táctico + si vuela o no un dron FPV
function wmoToTac(code: number): { txt: string; drone: "OK" | "RIESGO" | "NO" } {
  if (code === 0) return { txt: "Despejado", drone: "OK" };
  if (code <= 2) return { txt: "Parcial", drone: "OK" };
  if (code === 3) return { txt: "Cubierto", drone: "OK" };
  if (code === 45 || code === 48) return { txt: "Niebla", drone: "NO" };
  if (code >= 51 && code <= 57) return { txt: "Llovizna", drone: "RIESGO" };
  if (code >= 61 && code <= 67) return { txt: "Lluvia", drone: "NO" };
  if (code >= 71 && code <= 77) return { txt: "Nieve", drone: "NO" };
  if (code >= 80 && code <= 82) return { txt: "Chubascos", drone: "NO" };
  if (code === 85 || code === 86) return { txt: "Chubascos nieve", drone: "NO" };
  if (code === 95) return { txt: "Tormenta", drone: "NO" };
  if (code >= 96) return { txt: "Tormenta + granizo", drone: "NO" };
  return { txt: "Variable", drone: "RIESGO" };
}

interface MeteoEntry {
  id: string;
  name: string;
  temp: number | null;
  wind: number | null;
  cond: string;
  drone: "OK" | "RIESGO" | "NO";
}

let cache: { at: number; data: MeteoEntry[] } | null = null;
const TTL = 10 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL) {
    return NextResponse.json({ ok: true, zones: cache.data, cached: true });
  }
  const entries: MeteoEntry[] = await Promise.all(
    ZONES.map(async (z): Promise<MeteoEntry> => {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${z.lat}&longitude=${z.lng}` +
          `&current=temperature_2m,wind_speed_10m,weather_code&wind_speed_unit=ms`;
        const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as {
          current?: { temperature_2m?: number; wind_speed_10m?: number; weather_code?: number };
        };
        const c = j.current ?? {};
        const tac = wmoToTac(c.weather_code ?? -1);
        return {
          id: z.id,
          name: z.name,
          temp: typeof c.temperature_2m === "number" ? Math.round(c.temperature_2m) : null,
          wind: typeof c.wind_speed_10m === "number" ? Math.round(c.wind_speed_10m * 10) / 10 : null,
          cond: tac.txt,
          drone: tac.drone,
        };
      } catch {
        return { id: z.id, name: z.name, temp: null, wind: null, cond: "Sin datos", drone: "RIESGO" };
      }
    })
  );
  cache = { at: Date.now(), data: entries };
  return NextResponse.json({ ok: true, zones: entries, cached: false });
}
