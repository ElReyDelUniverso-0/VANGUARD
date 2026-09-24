// v47.0 RADAR TOTAL — CATÁSTROFES Y EVENTOS GLOBALES EN VIVO (NASA EONET v3).
// API abierta de la NASA, $0, sin key: terremotos, volcanes, incendios,
// tormentas severas, inundaciones, sequías, hielo marino, deslizamientos...
// Endpoint: https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=60&days=30
//   events[].geometry[] es GeoJSON → coordinates = [lng, lat] (¡orden invertido!)
//   categories[0].title = categoría en inglés (traducimos abajo).
// Cache en memoria 30 min + degradación: si la NASA falla y no hay snapshot,
// devolvemos null y la sección no se renderiza (mismo contrato que worldpower).

export type EonetRow = {
  id: string;
  title: string;
  cat: string; // categoría original EN
  catEs: string; // categoría traducida
  date: number; // epoch ms del último punto
  lat: number | null;
  lng: number | null;
  link: string;
};

type EonetGeometry = { date?: string; type?: string; coordinates?: number[] | number[][] };
type EonetEvent = {
  id: string;
  title: string;
  link?: string;
  categories?: { id: string; title: string }[];
  geometry?: EonetGeometry[];
};

const EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=60&days=30";
const CACHE_MS = 30 * 60 * 1000;

const CAT_ES: Record<string, string> = {
  "Severe Storms": "Tormenta severa",
  Wildfires: "Incendios",
  Volcanoes: "Volcán",
  "Sea and Lake Ice": "Hielo marino",
  Floods: "Inundación",
  Earthquakes: "Sismo",
  Drought: "Sequía",
  "Dust and Haze": "Polvo y bruma",
  Landslides: "Deslizamiento",
  Snow: "Nieve",
  Manmade: "Hecho por el hombre",
  Other: "Otro",
};

export const catColor = (cat: string): string => {
  const map: Record<string, string> = {
    Tormenta: "text-sky-300 border-sky-300/40 bg-sky-300/10",
    Incendios: "text-orange-300 border-orange-300/40 bg-orange-300/10",
    Volcán: "text-red-300 border-red-300/40 bg-red-300/10",
    Sismo: "text-amber-300 border-amber-300/40 bg-amber-300/10",
    Inundación: "text-cyan-300 border-cyan-300/40 bg-cyan-300/10",
    Sequía: "text-yellow-300 border-yellow-300/40 bg-yellow-300/10",
  };
  const first = cat.split(" ")[0] || cat;
  return map[first] || "text-zinc-300 border-zinc-300/40 bg-zinc-300/10";
};

let cache: { rows: EonetRow[]; updated: number } | null = null;

function lastPoint(ev: EonetEvent): { date: number; lat: number | null; lng: number | null } {
  const geos = ev.geometry || [];
  const g = geos.length ? geos[geos.length - 1] : null;
  let lat: number | null = null;
  let lng: number | null = null;
  if (g && Array.isArray(g.coordinates)) {
    // GeoJSON: puede ser [lng, lat] o [[lng, lat], ...] (track de tormenta)
    const flat = Array.isArray(g.coordinates[0])
      ? (g.coordinates as number[][])[(g.coordinates as number[][]).length - 1]
      : (g.coordinates as number[]);
    if (typeof flat[0] === "number" && typeof flat[1] === "number") {
      lng = flat[0];
      lat = flat[1];
    }
  }
  const d = g?.date ? Date.parse(g.date) : NaN;
  return { date: Number.isFinite(d) ? d : Date.now(), lat, lng };
}

export async function getEonet(): Promise<{ rows: EonetRow[]; updated: number } | null> {
  if (cache && Date.now() - cache.updated < CACHE_MS) return cache;
  try {
    const res = await fetch(EONET_URL, { next: { revalidate: CACHE_MS / 1000 } });
    if (!res.ok) throw new Error(`EONET ${res.status}`);
    const json = (await res.json()) as { events?: EonetEvent[] };
    const rows: EonetRow[] = (json.events || [])
      .map((ev) => {
        const p = lastPoint(ev);
        const cat = ev.categories?.[0]?.title || "Other";
        return {
          id: ev.id,
          title: ev.title,
          cat,
          catEs: CAT_ES[cat] || cat,
          date: p.date,
          lat: p.lat,
          lng: p.lng,
          link: ev.link || "https://eonet.gsfc.nasa.gov/",
        };
      })
      .sort((a, b) => b.date - a.date)
      .slice(0, 14);
    if (rows.length === 0) throw new Error("EONET vacío");
    cache = { rows, updated: Date.now() };
    return cache;
  } catch {
    return cache && cache.rows.length > 0 ? cache : null;
  }
}

export function haceEonet(ms: number): string {
  const mins = Math.max(1, Math.round((Date.now() - ms) / 60000));
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} d`;
}
