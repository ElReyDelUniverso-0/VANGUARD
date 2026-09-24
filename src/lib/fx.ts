// v47.0 RADAR TOTAL — DIVISAS EN CRISIS (tipo de cambio REAL, $0, sin key).
// open.er-api.com: 166 monedas contra el dólar, actualizadas a diario,
// sin registro ni API key. Aquí filtramos las monedas de los países que
// dominan los conflictos del planeta para que el visitante vea cuánto vale
// realmente el dinero donde estalla la guerra.
// Cache en memoria 1 h + degradación: sin snapshot previo → null → sección oculta.

export type FxRow = {
  code: string; // ISO4217
  name: string; // nombre en español
  flag: string; // ISO2 para el badge
  perUsd: number; // cuántas unidades locales por 1 US$
  inv: number; // cuánto vale 1 unidad local en US$
};

type ErApi = {
  result?: string;
  base_code?: string;
  time_last_update_utc?: string;
  rates?: Record<string, number>;
};

const FX_URL = "https://open.er-api.com/v6/latest/USD";
const CACHE_MS = 60 * 60 * 1000;

// Monedas de países en conflicto, sanciones o crisis — orden por interés bélico
const CRISIS: { code: string; name: string; flag: string }[] = [
  { code: "RUB", name: "Rusia", flag: "RU" },
  { code: "UAH", name: "Ucrania", flag: "UA" },
  { code: "ILS", name: "Israel", flag: "IL" },
  { code: "IRR", name: "Irán", flag: "IR" },
  { code: "SYP", name: "Siria", flag: "SY" },
  { code: "SDG", name: "Sudán", flag: "SD" },
  { code: "LBP", name: "Líbano", flag: "LB" },
  { code: "MMK", name: "Birmania", flag: "MM" },
  { code: "AFN", name: "Afganistán", flag: "AF" },
  { code: "BYN", name: "Bielorrusia", flag: "BY" },
  { code: "ETB", name: "Etiopía", flag: "ET" },
  { code: "HTG", name: "Haití", flag: "HT" },
  { code: "VES", name: "Venezuela", flag: "VE" },
  { code: "ARS", name: "Argentina", flag: "AR" },
  { code: "TRY", name: "Turquía", flag: "TR" },
  { code: "EUR", name: "Zona euro", flag: "EU" },
];

let cache: { rows: FxRow[]; updated: number; asOf: string } | null = null;

export async function getFx(): Promise<{ rows: FxRow[]; updated: number; asOf: string } | null> {
  if (cache && Date.now() - cache.updated < CACHE_MS) return cache;
  try {
    const res = await fetch(FX_URL, { next: { revalidate: CACHE_MS / 1000 } });
    if (!res.ok) throw new Error(`FX ${res.status}`);
    const json = (await res.json()) as ErApi;
    if (!json.rates || json.result !== "success") throw new Error("FX sin rates");
    const rows: FxRow[] = CRISIS.filter((c) => typeof json.rates![c.code] === "number").map((c) => {
      const perUsd = json.rates![c.code];
      return {
        code: c.code,
        name: c.name,
        flag: c.flag,
        perUsd,
        inv: perUsd > 0 ? 1 / perUsd : 0,
      };
    });
    if (rows.length === 0) throw new Error("FX vacío");
    cache = { rows, updated: Date.now(), asOf: json.time_last_update_utc || "" };
    return cache;
  } catch {
    return cache && cache.rows.length > 0 ? cache : null;
  }
}

export function fmtFx(perUsd: number): string {
  if (!Number.isFinite(perUsd) || perUsd <= 0) return "—";
  if (perUsd >= 1000) return perUsd.toLocaleString("es", { maximumFractionDigits: 0 });
  if (perUsd >= 100) return perUsd.toFixed(1);
  if (perUsd >= 10) return perUsd.toFixed(2);
  return perUsd.toFixed(3);
}
