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
  elegible: boolean; // el monto entra en la ruleta (v304 — los consumidores viejos no lo leen)
}

// ——— v304.0 LA MANO DE LA FORTUNA — la mano de la casa sobre la ruleta ———
// Lo que la v84 dejó ciego y esta ronda le da: LA HORA DORADA del día
// (determinista por fecha UTC: la casa entera comparte la misma hora de
// suerte), LA LÁSTIMA DE LA CASA (pity: la racha de pagos secos calienta la
// ruleta — nadie queda frío para siempre) y EL LIBRO DE LA FORTUNA (la
// memoria persistente de la suerte del operador). Todo aditivo: la v84
// sigue girando igual cuando no hay mano encima.

// ——— LA HORA DORADA: la hora de suerte del día, determinista ———
// Misma fecha → misma hora para TODO el mundo (seed FNV-1a de la fecha UTC).
// Durante esa hora, todo pago elegible gana ×1.5 adicional.
export const MULT_HORA_DORADA = 1.5;

export function horaDorada(
  d: Date = new Date()
): { hora: number; activa: boolean; minRestantes: number } {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const dia = d.getUTCDate();
  const clave = `${y}-${String(m).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  let h = 2166136261;
  for (let i = 0; i < clave.length; i++) {
    h ^= clave.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hora = (h >>> 0) % 24;
  const activa = d.getUTCHours() === hora;
  const minRestantes = activa ? 60 - d.getUTCMinutes() : 0;
  return { hora, activa, minRestantes };
}

// ——— LA LÁSTIMA DE LA CASA (pity): la racha seca calienta la ruleta ———
// La probabilidad histórica de cualquier golpe (v84): ×5 0.008 + ×3 0.03 +
// ×2 0.102 = 0.14. A partir de RACHA_PITY pagos secos, la probabilidad sube
// +0.01 por pago seco hasta el techo — la casa nunca deja a nadie helado.
export const PROB_BASE = 0.14;
export const RACHA_PITY = 35;
export const PROB_TECHO = 0.5;

export function probGolpe(racha: number): number {
  if (racha < RACHA_PITY) return PROB_BASE;
  return Math.min(PROB_TECHO, PROB_BASE + (racha - RACHA_PITY + 1) * 0.01);
}

// ——— EL LIBRO DE LA FORTUNA: la memoria de la suerte (persistente) ———
export interface FortunaEstado {
  rachaSeca: number; // pagos elegibles sin golpe desde el último golpe
  golpesX2: number;
  golpesX3: number;
  golpesX5: number;
  extraTotal: number; // monedas extra regaladas por la fortuna en total
  mayorGolpe: { mult: number; extra: number; motivo: string } | null;
}

export const LS_FORTUNA = "vg_fortuna_v304";

export const FORTUNA_INICIAL: FortunaEstado = {
  rachaSeca: 0,
  golpesX2: 0,
  golpesX3: 0,
  golpesX5: 0,
  extraTotal: 0,
  mayorGolpe: null,
};

export function loadFortuna(): FortunaEstado {
  try {
    const raw = localStorage.getItem(LS_FORTUNA);
    if (!raw) return { ...FORTUNA_INICIAL };
    const p = JSON.parse(raw) as Partial<FortunaEstado>;
    return { ...FORTUNA_INICIAL, ...p, mayorGolpe: p.mayorGolpe ?? null };
  } catch {
    return { ...FORTUNA_INICIAL };
  }
}

export function saveFortuna(e: FortunaEstado): void {
  try {
    localStorage.setItem(LS_FORTUNA, JSON.stringify(e));
  } catch {
    /* el libro jamás tumba el pago */
  }
}

/** un pago elegible quedó SECO (sin golpe): la racha crece y la ruleta se calienta */
export function registrarPagoSeco(): number {
  const e = loadFortuna();
  e.rachaSeca += 1;
  saveFortuna(e);
  return e.rachaSeca;
}

/** la casa golpeó: la racha se apaga, el libro escribe la página */
export function registrarFortuna(ev: FortunaEvento): void {
  const e = loadFortuna();
  e.rachaSeca = 0;
  e.extraTotal += ev.extra;
  if (ev.mult >= 5) e.golpesX5 += 1;
  else if (ev.mult >= 3) e.golpesX3 += 1;
  else e.golpesX2 += 1;
  if (!e.mayorGolpe || ev.mult > e.mayorGolpe.mult) {
    e.mayorGolpe = { mult: ev.mult, extra: ev.extra, motivo: ev.motivo };
  }
  saveFortuna(e);
}

// ——— enfriamiento del golpe de fortuna (mínimo entre golpes grandes) ———
const GOLPE_COOLDOWN_MS = 40_000;
let __ultimoGolpe = 0;

// ——— umbrales: montos pequeños (cambio, devoluciones) no giran la ruleta ———
const MONTO_MINIMO = 12;

export function rollFortuna(monto: number): FortunaResultado {
  const seco: FortunaResultado = { extra: 0, mult: 1, motivo: "", elegible: false };
  if (typeof window === "undefined" || monto < MONTO_MINIMO) return seco;

  const compuesto: string[] = [];

  // 1) PRIMA DE GUERRA — determinista con la tensión real del mundo
  let mult = 1;
  try {
    const t = getTension();
    if (t >= 75) {
      mult *= 1.15;
      compuesto.push("PRIMA DE GUERRA +15%");
    }
  } catch {
    /* tensión ilegible: prima 0 */
  }

  // 2) LA HORA DORADA — la hora de suerte del día (determinista, v304)
  try {
    if (horaDorada().activa) {
      mult *= MULT_HORA_DORADA;
      compuesto.push(`LA HORA DORADA ×${MULT_HORA_DORADA}`);
    }
  } catch {
    /* hora ilegible: la casa no regala sin certeza */
  }

  // 3) GOLPE DE FORTUNA — probabilístico con enfriamiento y LÁSTIMA (v304)
  const ahora = Date.now();
  if (ahora - __ultimoGolpe >= GOLPE_COOLDOWN_MS) {
    // los umbrales de la v84 ESCALAN con la lástima: la probabilidad total
    // pasa de PROB_BASE a probGolpe(racha) y las tres puertas suben juntas
    let factor = 1;
    try {
      factor = probGolpe(loadFortuna().rachaSeca) / PROB_BASE;
    } catch {
      factor = 1;
    }
    const r = Math.random();
    if (r < 0.008 * factor) {
      mult *= 5;
      compuesto.push("GOLPE DE FORTUNA ×5");
      __ultimoGolpe = ahora;
    } else if (r < 0.038 * factor) {
      mult *= 3;
      compuesto.push("GOLPE DE FORTUNA ×3");
      __ultimoGolpe = ahora;
    } else if (r < 0.14 * factor) {
      mult *= 2;
      compuesto.push("GOLPE DE FORTUNA ×2");
      __ultimoGolpe = ahora;
    }
  }

  if (mult === 1) return { ...seco, elegible: true };
  const extra = Math.max(1, Math.round(monto * (mult - 1)));
  return { extra, mult: Math.round(mult * 100) / 100, motivo: compuesto.join(" · "), elegible: true };
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
