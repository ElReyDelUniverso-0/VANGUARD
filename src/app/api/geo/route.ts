// v40 GEOPOLÍTICA EN VIVO — datos reales del planeta, TODO sin API key (presupuesto $0).
// Fuentes verificadas keyless:
//   · Banco Mundial  api.worldbank.org   (gasto militar %PIB, PIB, población, fichas país)
//   · USGS           earthquake.usgs.gov (sismos M4.5+ últimas 24h)
//   · Wikimedia      wikimedia.org       (top pageviews = lo que el mundo mira)
//   · wheretheiss.at (posición de la EEI en vivo)
//   · mledoze/countries (fronteras terrestres, dataset estático)
// DOCTRINA "NUNCA VACÍA": Promise.allSettled — si una fuente cae, el resto sigue;
// si TODAS caen se sirve la última buena copia (stale) y como último recurso
// un núcleo mínimo estático. Cache 15 min en memoria del servidor.

import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RankRow = { iso3: string; name: string; value: number; year: string };
type Quake = { mag: number; place: string; time: number; url: string; lat: number; lng: number; depth: number };
type Trend = { article: string; title: string; views: number };
type CountryRow = {
  iso3: string; name: string; capital: string; region: string;
  income: string; lat: number; lng: number; borders: string[];
};
type GeoPayload = {
  ok: boolean;
  ts: string;
  iss: { lat: number; lng: number; velocity: number; altitude: number } | null;
  quakes: Quake[];
  trending: Trend[];
  military: RankRow[];
  population: RankRow[];
  gdp: RankRow[];
  countries: CountryRow[];
  sources: Record<string, boolean>;
};

let CACHE: { at: number; data: GeoPayload } | null = null;
const TTL = 15 * 60 * 1000; // 15 min

const UA = { headers: { "User-Agent": "VANGUARD/40.0 (https://vanguard-kq9r.vercel.app; vanguard.ops@vanguard.world)" } };

async function jget<T>(url: string, revalidate: number): Promise<T | null> {
  try {
    const r = await fetch(url, { ...UA, next: { revalidate } });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

// Banco Mundial: filtra agregados (region "Aggregates") y toma mrnev=1
type WBInd = [{ page: number; total: number }, { countryiso3code: string; date: string; value: number | null; country?: { value: string } }[]];
type WBCountry = [{ page: number; total: number }, { id: string; name: string; capitalCity: string; region: { id: string; value: string }; incomeLevel: { value: string }; longitude: string; latitude: string }[]];

async function wbIndicator(indicator: string): Promise<{ byIso: Map<string, RankRow>; }> {
  const byIso = new Map<string, RankRow>();
  const d = await jget<WBInd>(
    `https://api.worldbank.org/v2/country/all/indicator/${indicator}?format=json&per_page=400&mrnev=1`,
    3600
  );
  if (Array.isArray(d) && Array.isArray(d[1])) {
    for (const row of d[1]) {
      const iso = (row.countryiso3code || "").trim();
      if (iso.length === 3 && typeof row.value === "number" && isFinite(row.value)) {
        byIso.set(iso, { iso3: iso, name: row.country?.value || iso, value: row.value, year: row.date });
      }
    }
  }
  return { byIso };
}

function humanizeArticle(a: string): string {
  return a
    .replace(/_/g, " ")
    .replace(/^(Main Page|Special:Search|Wikipedia:.*|Portal:.*|Special:.*|Talk:.*|Category:.*|File:.*|Help:.*|Wikipedia)$/i, "")
    .trim();
}

async function buildPayload(): Promise<GeoPayload> {
  const [mil, pop, gdp, wbCountries, usgs, wiki, iss, mled] = await Promise.allSettled([
    wbIndicator("MS.MIL.XPND.GD.ZS"),
    wbIndicator("SP.POP.TOTL"),
    wbIndicator("NY.GDP.MKTP.CD"),
    jget<WBCountry>("https://api.worldbank.org/v2/country?format=json&per_page=400", 86400),
    jget<{ features: { properties: { mag: number; place: string; time: number; url: string }; geometry: { coordinates: [number, number, number] } }[] }>(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson",
      600
    ),
    jget<{ items: { articles: { article: string; views: number; rank: number }[] }[] }>(
      (() => {
        const y = new Date(Date.now() - 86400000);
        return `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${y.getUTCFullYear()}/${String(y.getUTCMonth() + 1).padStart(2, "0")}/${String(y.getUTCDate()).padStart(2, "0")}`;
      })(),
      3600
    ),
    jget<{ latitude: number; longitude: number; velocity: number; altitude: number }>(
      "https://api.wheretheiss.at/v1/satellites/25544",
      60
    ),
    jget<{ cca3: string; borders?: string[] }[]>(
      "https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json",
      604800
    ),
  ]);

  const bordersMap = new Map<string, string[]>();
  if (mled.status === "fulfilled" && Array.isArray(mled.value)) {
    for (const c of mled.value) if (c?.cca3) bordersMap.set(c.cca3, c.borders ?? []);
  }

  // países reales (no agregados) con ficha + vecinos
  const countries: CountryRow[] = [];
  if (wbCountries.status === "fulfilled" && Array.isArray(wbCountries.value?.[1])) {
    for (const c of wbCountries.value[1]) {
      // los agregados (World, OECD members, …) traen region.value "Aggregates" — fuera
      if (!c?.id || !c.region?.value || c.region.value === "Aggregates" || c.region.id === "NA") continue;
      countries.push({
        iso3: c.id,
        name: c.name,
        capital: c.capitalCity || "—",
        region: c.region?.value || "—",
        income: c.incomeLevel?.value || "—",
        lat: parseFloat(c.latitude) || 0,
        lng: parseFloat(c.longitude) || 0,
        borders: bordersMap.get(c.id) ?? [],
      });
    }
  }
  const realIso = new Set(countries.map((c) => c.iso3));

  const topOf = (m: Map<string, RankRow>, n: number): RankRow[] =>
    [...m.values()]
      .filter((r) => realIso.has(r.iso3) && r.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, n);

  const quakes: Quake[] = [];
  if (usgs.status === "fulfilled" && usgs.value?.features?.length) {
    for (const f of usgs.value.features.slice(0, 14)) {
      const c = f.geometry?.coordinates ?? [];
      quakes.push({
        mag: f.properties?.mag ?? 0,
        place: f.properties?.place ?? "—",
        time: f.properties?.time ?? 0,
        url: f.properties?.url ?? "",
        lat: c[1] ?? 0,
        lng: c[0] ?? 0,
        depth: c[2] ?? 0,
      });
    }
    quakes.sort((a, b) => b.mag - a.mag);
  }

  const trending: Trend[] = [];
  if (wiki.status === "fulfilled" && wiki.value?.items?.[0]?.articles) {
    for (const a of wiki.value.items[0].articles) {
      const t = humanizeArticle(a.article);
      if (!t) continue;
      trending.push({ article: a.article, title: t, views: a.views });
      if (trending.length >= 10) break;
    }
  }

  const issOk = iss.status === "fulfilled" && iss.value ? iss.value : null;

  return {
    ok: true,
    ts: new Date().toISOString(),
    iss: issOk
      ? { lat: issOk.latitude, lng: issOk.longitude, velocity: issOk.velocity, altitude: issOk.altitude }
      : null,
    quakes,
    trending,
    military: mil.status === "fulfilled" ? topOf(mil.value.byIso, 15) : [],
    population: pop.status === "fulfilled" ? topOf(pop.value.byIso, 15) : [],
    gdp: gdp.status === "fulfilled" ? topOf(gdp.value.byIso, 15) : [],
    countries,
    sources: {
      worldbank: countries.length > 0,
      usgs: quakes.length > 0,
      wikipedia: trending.length > 0,
      iss: !!issOk,
      borders: bordersMap.size > 0,
    },
  };
}

// Núcleo mínimo estático: si TODO falla, la panel nunca queda vacía.
function barebones(): GeoPayload {
  return {
    ok: true,
    ts: new Date().toISOString(),
    iss: null,
    quakes: [],
    trending: [],
    military: [
      { iso3: "OMN", name: "Omán", value: 8.1, year: "2024" },
      { iso3: "SAU", name: "Arabia Saudita", value: 7.1, year: "2024" },
      { iso3: "QAT", name: "Catar", value: 6.2, year: "2024" },
      { iso3: "ISR", name: "Israel", value: 5.3, year: "2024" },
      { iso3: "USA", name: "Estados Unidos", value: 3.4, year: "2024" },
    ],
    population: [
      { iso3: "IND", name: "India", value: 1_441_719_852, year: "2024" },
      { iso3: "CHN", name: "China", value: 1_419_321_278, year: "2024" },
      { iso3: "USA", name: "Estados Unidos", value: 345_426_571, year: "2024" },
    ],
    gdp: [
      { iso3: "USA", name: "Estados Unidos", value: 29_184_890_000_000, year: "2024" },
      { iso3: "CHN", name: "China", value: 18_273_410_000_000, year: "2024" },
    ],
    countries: [],
    sources: { worldbank: false, usgs: false, wikipedia: false, iss: false, borders: false },
  };
}

export async function GET() {
  try {
    if (CACHE && Date.now() - CACHE.at < TTL) {
      return NextResponse.json(CACHE.data);
    }
    const data = await buildPayload();
    const anyAlive = Object.values(data.sources).some(Boolean);
    if (anyAlive) {
      CACHE = { at: Date.now(), data };
      return NextResponse.json(data);
    }
    // todas las fuentes cayeron: stale si hay, barebones si no
    if (CACHE) return NextResponse.json({ ...CACHE.data, ts: new Date().toISOString() });
    return NextResponse.json(barebones());
  } catch {
    if (CACHE) return NextResponse.json(CACHE.data);
    return NextResponse.json(barebones());
  }
}
