// v44.0 PODER MUNDIAL — datos militares REALES del Banco Mundial, $0, sin API key.
// Indicadores (los datos se actualizan una vez al año → cache 24 h es de sobra):
//  · MS.MIL.XPND.CD   — gasto militar (USD corrientes)
//  · MS.MIL.TOTL.P1   — personal de fuerzas armadas (total personas)
//  · MS.MIL.XPND.GD.ZS — gasto militar (% del PIB)
// Los agregados regionales ("Africa Eastern and Southern", "World"...) se filtran
// consultando /country y descartando region.value === "Aggregates".
// Degradación: si el Banco Mundial falla usamos el último snapshot en memoria;
// si nunca hubo snapshot, devolvemos null y la sección no se renderiza.

export type PowerRow = {
  iso3: string;
  iso2: string; // para badges/tácticas UI
  name: string; // nombre en español (mapa propio) o inglés del Banco Mundial
  spending: number | null; // USD/año
  personnel: number | null; // personas en servicio
  gdpPct: number | null; // % del PIB
  year: number | null; // año del dato de gasto
};

type WbPoint = {
  countryiso3code: string;
  date: string;
  value: number | null;
  country?: { value?: string };
};

const WB = "https://api.worldbank.org/v2";

// Nombres en español para los países que dominan el ranking + el mundo hispano.
// Fallback: nombre en inglés que ya trae la API.
const ES_NAMES: Record<string, string> = {
  USA: "Estados Unidos", CHN: "China", RUS: "Rusia", IND: "India",
  SAU: "Arabia Saudita", GBR: "Reino Unido", DEU: "Alemania", FRA: "Francia",
  JPN: "Japón", KOR: "Corea del Sur", ITA: "Italia", ISR: "Israel",
  BRA: "Brasil", POL: "Polonia", AUS: "Australia", CAN: "Canadá",
  ESP: "España", TUR: "Turquía", NLD: "Países Bajos", UKR: "Ucrania",
  SGP: "Singapur", SWE: "Suecia", NOR: "Noruega", IRN: "Irán",
  DZA: "Argelia", IRQ: "Irak", PAK: "Pakistán", MEX: "México",
  ARG: "Argentina", COL: "Colombia", CHL: "Chile", PER: "Perú",
  VEN: "Venezuela", EGY: "Egipto", NGA: "Nigeria", ZAF: "Sudáfrica",
  IDN: "Indonesia", THA: "Tailandia", VNM: "Vietnam", TWN: "Taiwán",
  GRC: "Grecia", PRT: "Portugal", CHE: "Suiza", SGP_: "",
  ARE: "Emiratos Árabes Unidos", QAT: "Catar", KWT: "Kuwait", OMN: "Omán",
  MYS: "Malasia", PHL: "Filipinas", ETH: "Etiopía", KAZ: "Kazajistán",
  CZE: "Chequia", ROU: "Rumanía", FIN: "Finlandia", DNK: "Dinamarca",
  BEL: "Bélgica", AUT: "Austria", IRL: "Irlanda", NZL: "Nueva Zelanda",
};

// ISO3 → ISO2 (para el FlagBadge); fallback "??" si no está en el mapa
const ISO2: Record<string, string> = {
  USA: "US", CHN: "CN", RUS: "RU", IND: "IN", SAU: "SA", GBR: "GB",
  DEU: "DE", FRA: "FR", JPN: "JP", KOR: "KR", ITA: "IT", ISR: "IL",
  BRA: "BR", POL: "PL", AUS: "AU", CAN: "CA", ESP: "ES", TUR: "TR",
  NLD: "NL", UKR: "UA", SGP: "SG", SWE: "SE", NOR: "NO", IRN: "IR",
  DZA: "DZ", IRQ: "IQ", PAK: "PK", MEX: "MX", ARG: "AR", COL: "CO",
  CHL: "CL", PER: "PE", VEN: "VE", EGY: "EG", NGA: "NG", ZAF: "ZA",
  IDN: "ID", THA: "TH", VNM: "VN", TWN: "TW", GRC: "GR", PRT: "PT",
  CHE: "CH", ARE: "AE", QAT: "QA", KWT: "KW", OMN: "OM", MYS: "MY",
  PHL: "PH", ETH: "ET", KAZ: "KZ", CZE: "CZ", ROU: "RO", FIN: "FI",
  DNK: "DK", BEL: "BE", AUT: "AT", IRL: "IE", NZL: "NZ",
};

let memCache: { rows: PowerRow[]; at: number; updated: string } | null = null;

async function wbFetch(path: string): Promise<unknown> {
  const r = await fetch(`${WB}${path}`, {
    signal: AbortSignal.timeout(9_000),
    next: { revalidate: 86_400 },
  });
  if (!r.ok) throw new Error(`wb ${r.status}`);
  return r.json();
}

async function latestByIso(path: string): Promise<Map<string, WbPoint>> {
  const j = (await wbFetch(path)) as [unknown, WbPoint[]] | null;
  const out = new Map<string, WbPoint>();
  const rows = Array.isArray(j) ? j[1] : [];
  if (Array.isArray(rows)) {
    for (const p of rows) {
      if (p?.countryiso3code && p.value != null && !out.has(p.countryiso3code)) {
        out.set(p.countryiso3code, p);
      }
    }
  }
  return out;
}

export async function getWorldPower(): Promise<{
  rows: PowerRow[];
  updated: string;
} | null> {
  // 1) cache caliente (evita golpear la API en cada render dinámico)
  if (memCache && Date.now() - memCache.at < 3_600_000) {
    return { rows: memCache.rows, updated: memCache.updated };
  }

  try {
    // 2) lista de países reales (excluye agregados regionales)
    // OJO: el endpoint /country devuelve el ISO3 en el campo `id` (no iso3Code)
    const cj = (await wbFetch("/country?format=json&per_page=400")) as [
      unknown,
      { id?: string; region?: { value?: string } }[]
    ] | null;
    const real = new Set<string>();
    const crows = Array.isArray(cj) ? cj[1] : [];
    if (Array.isArray(crows)) {
      for (const c of crows) {
        if (c?.id && c.region?.value !== "Aggregates") {
          real.add(c.id);
        }
      }
    }

    // 3) los tres indicadores en paralelo (cada uno con su dato más reciente)
    const [spend, pers, gdp] = await Promise.all([
      latestByIso("/country/all/indicator/MS.MIL.XPND.CD?format=json&mrnev=1&per_page=400"),
      latestByIso("/country/all/indicator/MS.MIL.TOTL.P1?format=json&mrnev=1&per_page=400"),
      latestByIso("/country/all/indicator/MS.MIL.XPND.GD.ZS?format=json&mrnev=1&per_page=400"),
    ]);

    const rows: PowerRow[] = [];
    for (const [iso3, p] of spend) {
      if (!real.has(iso3)) continue; // fuera agregados
      rows.push({
        iso3,
        iso2: ISO2[iso3] ?? "",
        name: ES_NAMES[iso3] || p.country?.value || iso3,
        spending: p.value,
        personnel: pers.get(iso3)?.value ?? null,
        gdpPct: gdp.get(iso3)?.value ?? null,
        year: p.date ? Number(p.date) : null,
      });
    }
    rows.sort((a, b) => (b.spending ?? 0) - (a.spending ?? 0));
    const top = rows.slice(0, 16);

    if (!top.length) throw new Error("wb empty");
    memCache = { rows: top, at: Date.now(), updated: new Date().toISOString() };
    return { rows: top, updated: memCache.updated };
  } catch {
    // 4) degradación: snapshot viejo aunque esté frío
    if (memCache) return { rows: memCache.rows, updated: memCache.updated };
    return null;
  }
}

export function fmtUsd(v: number | null): string {
  if (v == null) return "—";
  if (v >= 1e12) return `US$ ${(v / 1e12).toFixed(2)} bill.`;
  if (v >= 1e9) return `US$ ${(v / 1e9).toFixed(0)} mil M`;
  if (v >= 1e6) return `US$ ${(v / 1e6).toFixed(0)} M`;
  return `US$ ${Math.round(v)}`;
}

export function fmtPersonas(v: number | null): string {
  if (v == null) return "—";
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)} M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)} mil`;
  return `${Math.round(v)}`;
}
