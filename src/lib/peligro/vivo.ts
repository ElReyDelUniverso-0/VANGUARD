// ═══════════════════════════════════════════════════════════════════
// v440.5 · LAS LECTURAS EN VIVO — se pide a la fuente oficial, y si la fuente
// no contesta se dice, no se rellena
//
// Reglas:
//   · 9 s de espera como mucho por fuente; si se pasa, se usa la instantánea;
//   · se lee UNA vez, al generar el parte: `revalidate: false` (caché
//     permanente). La página es estática; volver a leer cada 15 min obligaba al
//     Worker a rehacer 1 MB y se caía una de cada diez visitas;
//   · ninguna función lanza: siempre devuelve `Lectura<T>` con `de: "vivo"` o
//     `de: "instantanea"` y, si falló, el motivo en `error`;
//   · nada de datos inventados: si no hay valor, el campo queda vacío.
// ═══════════════════════════════════════════════════════════════════

import type { Lectura, PuntoMapa } from "./tipos";
export type { Lectura } from "./tipos";
import { BANCO_MUNDIAL, BROTES_INSTANTANEA } from "./instantanea";

// v442.3 · una lectura, al generar: el parte es estático (ver page.tsx). Con
// 900 s la página heredaba ISR de 15 minutos y volvía a pedir las nueve fuentes
// cada cuarto de hora dentro de un Worker de 10 ms de CPU.
const REVALIDAR: false = false;
const ESPERA_MS = 9000;

async function traer(url: string, tipo: "json" | "texto" = "json"): Promise<unknown> {
  const r = await fetch(url, {
    next: { revalidate: REVALIDAR },
    signal: AbortSignal.timeout(ESPERA_MS),
    headers: { "user-agent": "VanguardGlobalDanger/1.0 (+https://vanguard.vanguard-casa.workers.dev)" },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return tipo === "json" ? r.json() : r.text();
}

function ahora(): string {
  return new Date().toISOString();
}

// ─────────────────────────────── 1 · SISMOS ──────────────────────────────

type GeoJSONSismo = {
  features: {
    properties: { mag: number | null; place: string | null; time: number; url: string; title: string };
    geometry: { coordinates: [number, number, number] };
  }[];
};

export async function leerSismos(): Promise<Lectura<PuntoMapa[]>> {
  const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";
  try {
    const d = (await traer(url)) as GeoJSONSismo;
    const puntos: PuntoMapa[] = (d.features ?? [])
      .filter((f) => f.geometry?.coordinates)
      .map((f) => ({
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        clase: "sismo" as const,
        titulo: f.properties.title || `M ${f.properties.mag ?? "?"} — ${f.properties.place ?? ""}`,
        fecha: new Date(f.properties.time).toISOString(),
        url: f.properties.url,
        peso: f.properties.mag ?? 4.5,
        nivelTexto: `M ${f.properties.mag ?? "?"}`,
      }));
    return { ok: true, cuando: ahora(), de: "vivo", datos: puntos };
  } catch (e) {
    return { ok: false, cuando: ahora(), de: "instantanea", datos: [], error: String((e as Error).message ?? e) };
  }
}

// ─────────────────────────────── 2 · GDACS ───────────────────────────────

/** El RSS de GDACS es fijo: se lee con expresiones, sin añadir dependencias. */
function etiqueta(xml: string, nombre: string): string | null {
  const m = new RegExp(`<${nombre}[^>]*>([\\s\\S]*?)</${nombre}>`).exec(xml);
  if (!m) return null;
  return m[1]
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

const CLASE_GDACS: Record<string, PuntoMapa["clase"]> = {
  EQ: "sismo",
  TC: "tormenta",
  FL: "desastre",
  WF: "incendio",
  DR: "desastre",
  VO: "desastre",
  WS: "tormenta",
  TS: "tormenta",
};

export type AlertaGDACS = PuntoMapa & { tipoEvento: string; pais: string };

export async function leerGDACS(): Promise<Lectura<AlertaGDACS[]>> {
  try {
    const xml = (await traer("https://www.gdacs.org/xml/rss.xml", "texto")) as string;
    const items = xml.split("<item>").slice(1).map((i) => i.split("</item>")[0]);
    const salida: AlertaGDACS[] = [];
    for (const it of items) {
      const lat = Number(etiqueta(it, "geo:lat"));
      const lng = Number(etiqueta(it, "geo:long"));
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) continue;
      const tipoEvento = etiqueta(it, "gdacs:eventtype") ?? "";
      const alerta = etiqueta(it, "gdacs:alertlevel") ?? "";
      const pub = etiqueta(it, "pubDate") ?? "";
      const link = etiqueta(it, "link") ?? "";
      salida.push({
        lat,
        lng,
        clase: CLASE_GDACS[tipoEvento] ?? "otro",
        titulo: (etiqueta(it, "title") ?? "").slice(0, 200),
        fecha: pub ? new Date(pub).toISOString() : "",
        nivelTexto: alerta,
        url: link,
        tipoEvento,
        pais: etiqueta(it, "gdacs:country") ?? "",
        peso: 1,
      });
    }
    // primero lo más grave y lo más reciente: la casa no entierra el rojo
    const orden = { Red: 0, Orange: 1, Green: 2 } as Record<string, number>;
    salida.sort((a, b) => (orden[a.nivelTexto ?? ""] ?? 3) - (orden[b.nivelTexto ?? ""] ?? 3));
    return { ok: true, cuando: ahora(), de: "vivo", datos: salida };
  } catch (e) {
    return { ok: false, cuando: ahora(), de: "instantanea", datos: [], error: String((e as Error).message ?? e) };
  }
}

// ─────────────────────────────── 3 · EONET ───────────────────────────────

type EONET = {
  events: {
    id: string;
    title: string;
    categories: { id: string; title: string }[];
    sources: { id: string; url: string }[];
    geometry: { date: string; type: string; coordinates: [number, number] }[];
  }[];
};

const CLASE_EONET: Record<string, PuntoMapa["clase"]> = {
  wildfires: "incendio",
  severeStorms: "tormenta",
  volcanoes: "desastre",
  floods: "desastre",
  droughts: "desastre",
  earthquakes: "sismo",
  landslides: "desastre",
};

export async function leerEONET(): Promise<Lectura<PuntoMapa[]>> {
  try {
    const d = (await traer("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=120")) as EONET;
    const puntos: PuntoMapa[] = [];
    for (const ev of d.events ?? []) {
      const g = ev.geometry?.[ev.geometry.length - 1];
      if (!g || g.type !== "Point" || !g.coordinates) continue;
      puntos.push({
        lat: g.coordinates[1],
        lng: g.coordinates[0],
        clase: CLASE_EONET[ev.categories?.[0]?.id ?? ""] ?? "otro",
        titulo: `${ev.categories?.[0]?.title ?? "Evento"} · ${ev.title}`.slice(0, 180),
        fecha: g.date,
        url: ev.sources?.[0]?.url ?? `https://eonet.gsfc.nasa.gov/api/v3/events/${ev.id}`,
        peso: 1,
      });
    }
    return { ok: true, cuando: ahora(), de: "vivo", datos: puntos };
  } catch (e) {
    return { ok: false, cuando: ahora(), de: "instantanea", datos: [], error: String((e as Error).message ?? e) };
  }
}

// ─────────────────────────── 4 · BROTES (OMS DON) ────────────────────────

export type Brote = { titulo: string; fecha: string; url: string };

type WHOItem = { Title?: string; PublicationDate?: string; UrlName?: string; ItemDefaultUrl?: string };

export async function leerBrotes(): Promise<Lectura<Brote[]>> {
  const url =
    "https://www.who.int/api/news/diseaseoutbreaknews?sf_provider=dynamicProvider372&sf_culture=en&%24orderby=PublicationDateAndTime%20desc&%24top=8";
  try {
    const d = (await traer(url)) as { value?: WHOItem[] } | WHOItem[];
    const lista = Array.isArray(d) ? d : d.value ?? [];
    const brotes: Brote[] = lista
      .filter((x) => x.Title)
      .map((x) => ({
        titulo: x.Title as string,
        fecha: (x.PublicationDate ?? "").slice(0, 10),
        url: x.UrlName
          ? `https://www.who.int/emergencies/disease-outbreak-news/item/${x.UrlName}`
          : `https://www.who.int${x.ItemDefaultUrl ?? ""}`,
      }));
    if (brotes.length === 0) throw new Error("la OMS no devolvió partes");
    return { ok: true, cuando: ahora(), de: "vivo", datos: brotes };
  } catch (e) {
    return { ok: false, cuando: ahora(), de: "instantanea", datos: BROTES_INSTANTANEA, error: String((e as Error).message ?? e) };
  }
}

// ────────────────────── 5 · BANCO MUNDIAL (indicadores) ──────────────────

export type ValorIndicador = { valor: number; anio: string };

type WBFila = { date: string; value: number | null };

export async function leerIndicador(
  codigo: string,
  pais = "WLD",
): Promise<Lectura<ValorIndicador>> {
  const url = `https://api.worldbank.org/v2/country/${pais}/indicator/${codigo}?format=json&per_page=12&date=2018:2026`;
  try {
    const d = (await traer(url)) as [unknown, WBFila[] | null];
    const filas = (d?.[1] ?? []).filter((f) => f.value !== null && f.value !== undefined);
    if (filas.length === 0) throw new Error("sin valores publicados");
    const primera = filas[0] as WBFila;
    return {
      ok: true,
      cuando: ahora(),
      de: "vivo",
      datos: { valor: Number(primera.value), anio: primera.date },
    };
  } catch (e) {
    const inst = BANCO_MUNDIAL[codigo];
    if (inst) {
      return { ok: false, cuando: ahora(), de: "instantanea", datos: inst, error: String((e as Error).message ?? e) };
    }
    return { ok: false, cuando: ahora(), de: "instantanea", datos: { valor: Number.NaN, anio: "" }, error: String((e as Error).message ?? e) };
  }
}

/** Los ocho indicadores del mundo, de una vez (en paralelo, con su instantánea). */
export async function leerIndicadores(): Promise<Record<string, Lectura<ValorIndicador>>> {
  const codigos = Object.keys(BANCO_MUNDIAL);
  const salida: Record<string, Lectura<ValorIndicador>> = {};
  const lecturas = await Promise.all(codigos.map((c) => leerIndicador(c)));
  codigos.forEach((c, i) => {
    salida[c] = lecturas[i];
  });
  return salida;
}

/** La comparación entre países: tres indicadores por país, en paralelo. */
export async function leerComparativa(
  paises: readonly string[],
  codigos: readonly string[],
): Promise<Record<string, Record<string, Lectura<ValorIndicador>>>> {
  const tareas: Promise<void>[] = [];
  const salida: Record<string, Record<string, Lectura<ValorIndicador>>> = {};
  for (const p of paises) {
    salida[p] = {};
    for (const c of codigos) {
      tareas.push(
        leerIndicador(c, p).then((l) => {
          salida[p][c] = l;
        }),
      );
    }
  }
  await Promise.all(tareas);
  return salida;
}

// ───────────────────────── 6 · AIRE AHORA (Open-Meteo) ───────────────────

export type Aire = { pm25: number; aqi: number; hora: string; lugar: string };

export async function leerAire(
  lat: number,
  lng: number,
  lugar: string,
): Promise<Lectura<Aire>> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm2_5,us_aqi&timezone=UTC`;
  try {
    const d = (await traer(url)) as { current?: { pm2_5?: number; us_aqi?: number; time?: string } };
    const c = d.current;
    if (!c || c.pm2_5 === undefined) throw new Error("sin lectura de aire");
    return {
      ok: true,
      cuando: ahora(),
      de: "vivo",
      datos: { pm25: Number(c.pm2_5), aqi: Number(c.us_aqi ?? 0), hora: c.time ?? "", lugar },
    };
  } catch (e) {
    return { ok: false, cuando: ahora(), de: "instantanea", datos: { pm25: Number.NaN, aqi: Number.NaN, hora: "", lugar }, error: String((e as Error).message ?? e) };
  }
}

/** Ciudades de referencia del aire ahora mismo (una por continente). */
export const CIUDADES_AIRE: { nombre: string; lat: number; lng: number }[] = [
  { nombre: "Santo Domingo", lat: 18.4861, lng: -69.9312 },
  { nombre: "Ciudad de México", lat: 19.4326, lng: -99.1332 },
  { nombre: "Madrid", lat: 40.4168, lng: -3.7038 },
  { nombre: "El Cairo", lat: 30.0444, lng: 31.2357 },
  { nombre: "Delhi", lat: 28.6139, lng: 77.209 },
  { nombre: "Pekín", lat: 39.9042, lng: 116.4074 },
  { nombre: "Lagos", lat: 6.5244, lng: 3.3792 },
  { nombre: "São Paulo", lat: -23.5505, lng: -46.6333 },
];
