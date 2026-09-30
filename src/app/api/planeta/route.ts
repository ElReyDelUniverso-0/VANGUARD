import { NextResponse } from "next/server";

// v75.0 PLANETA VIVO — TODA la información del planeta Tierra en una sola API.
// Fuentes GRATIS sin clave, sondas en paralelo (Promise.allSettled — si una falla,
// el resto llega igual) y caché de 5 min para no castigar a las APIs públicas:
//  · NASA EONET   — eventos naturales abiertos (incendios, tormentas, volcanes…)
//  · open.er-api  — divisas del mundo contra USD (con delta vs sondeo anterior)
//  · Open-Meteo   — clima actual de 10 capitales (una sola llamada multizona)
//  · wheretheiss  — posición de la Estación Espacial Internacional en vivo
//  · USGS         — sismos del día (top por magnitud)

export const maxDuration = 30;

const CACHE_TTL = 5 * 60 * 1000;
let cacheBody: unknown = null;
let cacheTs = 0;
let divisasPrev: Record<string, number> = {};

interface EventoNatural {
  id: string;
  titulo: string;
  cat: string;
  fecha: string;
  lon: number;
  lat: number;
  link: string;
}

interface Divisa {
  code: string;
  rate: number;
  delta: number; // % vs sondeo anterior
}

interface ClimaCapital {
  ciudad: string;
  pais: string;
  temp: number;
  codigo: number;
}

interface Sismo {
  mag: number;
  place: string;
  depth: number;
  time: number;
  lon: number;
  lat: number;
}

const CAPITALES: { ciudad: string; pais: string; lat: number; lon: number }[] = [
  { ciudad: "Washington", pais: "EE. UU.", lat: 38.9, lon: -77.04 },
  { ciudad: "Bruselas", pais: "UE", lat: 50.85, lon: 4.35 },
  { ciudad: "Moscú", pais: "Rusia", lat: 55.75, lon: 37.62 },
  { ciudad: "Pekín", pais: "China", lat: 39.9, lon: 116.4 },
  { ciudad: "Jerusalén", pais: "Israel", lat: 31.78, lon: 35.22 },
  { ciudad: "Cd. de México", pais: "México", lat: 19.43, lon: -99.13 },
  { ciudad: "Bogotá", pais: "Colombia", lat: 4.71, lon: -74.07 },
  { ciudad: "Buenos Aires", pais: "Argentina", lat: -34.6, lon: -58.38 },
  { ciudad: "Madrid", pais: "España", lat: 40.42, lon: -3.7 },
  { ciudad: "Nueva Delhi", pais: "India", lat: 28.61, lon: 77.21 },
];

const DIVISAS_TRACK = ["EUR", "GBP", "JPY", "CNY", "RUB", "MXN", "COP", "ARS", "BRL", "CLP", "PEN", "TRY", "INR", "ZAR"];

async function sondearEonet(): Promise<EventoNatural[]> {
  const r = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=16", {
    cache: "no-store",
    signal: AbortSignal.timeout(9000),
  });
  if (!r.ok) throw new Error(`EONET ${r.status}`);
  const j = await r.json();
  const evs = Array.isArray(j?.events) ? j.events : [];
  const out: EventoNatural[] = [];
  for (const ev of evs) {
    const geo = Array.isArray(ev?.geometry) ? ev.geometry[ev.geometry.length - 1] : null;
    const coords = Array.isArray(geo?.coordinates) ? geo.coordinates : null;
    const lon = Array.isArray(coords) ? Number(coords[0]) : 0;
    const lat = Array.isArray(coords) ? Number(coords[1]) : 0;
    out.push({
      id: String(ev?.id ?? Math.random()),
      titulo: String(ev?.title ?? "Evento natural"),
      cat: String(ev?.categories?.[0]?.title ?? "Other"),
      fecha: String(geo?.date ?? ev?.geometry?.[0]?.date ?? new Date().toISOString()),
      lon: Number.isFinite(lon) ? lon : 0,
      lat: Number.isFinite(lat) ? lat : 0,
      link: Array.isArray(ev?.links) && ev.links[0]?.href ? String(ev.links[0].href) : "https://eonet.gsfc.nasa.gov",
    });
  }
  return out;
}

async function sondearDivisas(): Promise<Divisa[]> {
  const r = await fetch("https://open.er-api.com/v6/latest/USD", {
    cache: "no-store",
    signal: AbortSignal.timeout(9000),
  });
  if (!r.ok) throw new Error(`ER-API ${r.status}`);
  const j = await r.json();
  const rates = j?.rates ?? {};
  const out: Divisa[] = [];
  for (const code of DIVISAS_TRACK) {
    const rate = Number(rates[code]);
    if (!Number.isFinite(rate) || rate <= 0) continue;
    const prev = divisasPrev[code];
    const delta = prev && prev > 0 ? ((rate - prev) / prev) * 100 : 0;
    out.push({ code, rate, delta: Number.isFinite(delta) ? delta : 0 });
  }
  divisasPrev = Object.fromEntries(out.map((d) => [d.code, d.rate]));
  return out;
}

async function sondearClima(): Promise<ClimaCapital[]> {
  const lats = CAPITALES.map((c) => c.lat).join(",");
  const lons = CAPITALES.map((c) => c.lon).join(",");
  const r = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code&timezone=auto`,
    { cache: "no-store", signal: AbortSignal.timeout(9000) }
  );
  if (!r.ok) throw new Error(`Open-Meteo ${r.status}`);
  const j = await r.json();
  const list = Array.isArray(j) ? j : [j];
  return CAPITALES.map((c, i) => ({
    ciudad: c.ciudad,
    pais: c.pais,
    temp: Number(list[i]?.current?.temperature_2m ?? NaN),
    codigo: Number(list[i]?.current?.weather_code ?? 0),
  })).filter((c) => Number.isFinite(c.temp));
}

async function sondearIss(): Promise<{ lat: number; lon: number; vel: number; alt: number } | null> {
  try {
    const r = await fetch("https://api.wheretheiss.at/v1/satellites/25544", {
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
    });
    if (!r.ok) return null;
    const j = await r.json();
    return {
      lat: Number(j?.latitude ?? 0),
      lon: Number(j?.longitude ?? 0),
      vel: Number(j?.velocity ?? 0),
      alt: Number(j?.altitude ?? 0),
    };
  } catch {
    return null;
  }
}

async function sondearSismos(): Promise<Sismo[]> {
  const r = await fetch(
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
    { cache: "no-store", signal: AbortSignal.timeout(9000) }
  );
  if (!r.ok) throw new Error(`USGS ${r.status}`);
  const j = await r.json();
  const feats = Array.isArray(j?.features) ? j.features : [];
  return feats
    .map((f: { properties?: { mag?: number | null; place?: string | null; time?: number }; geometry?: { coordinates?: number[] } }) => ({
      mag: Number(f.properties?.mag ?? 0),
      place: String(f.properties?.place ?? "—"),
      depth: Number(f.geometry?.coordinates?.[2] ?? 0),
      time: Number(f.properties?.time ?? 0),
      lon: Number(f.geometry?.coordinates?.[0] ?? 0),
      lat: Number(f.geometry?.coordinates?.[1] ?? 0),
    }))
    .filter((s: Sismo) => s.mag > 0)
    .sort((a: Sismo, b: Sismo) => b.mag - a.mag)
    .slice(0, 6);
}

export async function GET() {
  const now = Date.now();
  if (cacheBody && now - cacheTs < CACHE_TTL) {
    return NextResponse.json({ ...(cacheBody as object), cache: "hit" });
  }

  const [eonetR, divisasR, climaR, issR, sismosR] = await Promise.allSettled([
    sondearEonet(),
    sondearDivisas(),
    sondearClima(),
    sondearIss(),
    sondearSismos(),
  ]);

  const body = {
    ts: new Date().toISOString(),
    cache: "fresh",
    eventos: eonetR.status === "fulfilled" ? eonetR.value : [],
    divisas: divisasR.status === "fulfilled" ? divisasR.value : [],
    climas: climaR.status === "fulfilled" ? climaR.value : [],
    iss: issR.status === "fulfilled" ? issR.value : null,
    sismos: sismosR.status === "fulfilled" ? sismosR.value : [],
    errores: [eonetR, divisasR, climaR, sismosR].filter((s) => s.status === "rejected").length,
  };

  cacheBody = body;
  cacheTs = now;

  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store" },
  });
}
