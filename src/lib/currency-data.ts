// v20 DIVISAS: TODOS los países del mundo (247) con su moneda oficial REAL
// (código ISO 4217, nombre en español, símbolo) y bandera verdadera (código ISO
// 3166-1 = imagen real en flagcdn). Tasas capturadas de open.er-api.com.
// Regenerable con scripts/gen-world-data.mjs — NO editar a mano.
import { WORLD_CURRENCIES_FULL, type WorldCountry } from "@/lib/world-data";

export interface WorldCurrency {
  country: string;
  flag: string;      // código ISO 3166-1 (bandera real en flagcdn)
  currency: string;
  code: string;      // ISO 4217
  symbol: string;
  region: "América" | "Europa" | "Asia" | "África" | "Oceanía" | "Antártida";
  rate: number;      // por 1 USD
}

export const WORLD_CURRENCIES: WorldCurrency[] = WORLD_CURRENCIES_FULL.map((c: WorldCountry) => ({
  country: c.name,
  flag: c.code,
  currency: c.curName,
  code: c.curCode,
  symbol: c.symbol,
  region: c.region as WorldCurrency["region"],
  rate: c.rate,
}));

export const REGIONS = ["Todas", "América", "Europa", "Asia", "África", "Oceanía"] as const;

export type { WorldCountry };
