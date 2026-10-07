"use client";

// v84.0 FORTUNA DE GUERRA — MOTOR DE RECOMPENSAS VIVO.
// Cada moneda que Vanguard paga puede venir acompañada de:
//   · PRIMA DE GUERRA (+15%): el mundo está tenso (tensión ≥ 75) y el peligro paga.
//   · GOLPE DE FORTUNA (×2 / ×3 / ×5): un golpe de suerte aleatorio con enfriamiento
//     propio para que la racha no se convierta en inflación.
// Se engancha DENTRO de addCoins del game-store: misiones, minijuegos, apuestas,
// reintentos, bóvedas… TODO lo que paga monedas pasa por la fortuna.
// Cero riesgo: try/catch en todo, si algo falla la recompensa base sigue íntegra.

import { getTension } from "@/lib/tension";

export interface FortunaResultado {
  extra: number; // monedas extra ganadas (0 = nada)
  mult: number; // multiplicador total aplicado (1 = nada)
  motivo: string; // "GOLPE DE FORTUNA ×3" | "PRIMA DE GUERRA +15%" | ""
}

// ——— enfriamiento del golpe de fortuna (mínimo entre golpes grandes) ———
const GOLPE_COOLDOWN_MS = 40_000;
let __ultimoGolpe = 0;

// ——— umbrales: montos pequeños (cambio, devoluciones) no giran la ruleta ———
const MONTO_MINIMO = 12;

export function rollFortuna(monto: number): FortunaResultado {
  const vacio: FortunaResultado = { extra: 0, mult: 1, motivo: "" };
  if (typeof window === "undefined" || monto < MONTO_MINIMO) return vacio;

  // 1) PRIMA DE GUERRA — determinista con la tensión real del mundo
  let mult = 1;
  let motivo = "";
  try {
    const t = getTension();
    if (t >= 75) {
      mult *= 1.15;
      motivo = "PRIMA DE GUERRA +15%";
    }
  } catch {
    /* tensión ilegible: prima 0 */
  }

  // 2) GOLPE DE FORTUNA — probabilístico con enfriamiento
  const ahora = Date.now();
  if (ahora - __ultimoGolpe >= GOLPE_COOLDOWN_MS) {
    const r = Math.random();
    if (r < 0.008) {
      mult *= 5;
      motivo = "GOLPE DE FORTUNA ×5";
      __ultimoGolpe = ahora;
    } else if (r < 0.038) {
      mult *= 3;
      motivo = "GOLPE DE FORTUNA ×3";
      __ultimoGolpe = ahora;
    } else if (r < 0.14) {
      mult *= 2;
      motivo = "GOLPE DE FORTUNA ×2";
      __ultimoGolpe = ahora;
    }
  }

  if (mult === 1) return vacio;
  const extra = Math.max(1, Math.round(monto * (mult - 1)));
  return { extra, mult: Math.round(mult * 100) / 100, motivo };
}

// ——— bus de eventos para la celebración cinematográfica ———
export interface FortunaEvento {
  mult: number;
  extra: number;
  motivo: string;
  base: number;
}

export function emitirFortuna(ev: FortunaEvento) {
  try {
    window.dispatchEvent(new CustomEvent("vanguard:fortuna", { detail: ev }));
  } catch {
    /* la celebración jamás tumba el pago */
  }
}
