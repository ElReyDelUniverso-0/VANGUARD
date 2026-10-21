"use client";

// ============================================================
// VANGUARD-2 · PROGRESO — el ledger del NUEVO Vanguard.
// Economía paralela e independiente (no toca vanguard-game-state).
// TODO vive en localStorage "vanguard2-ledger-v1".
// ============================================================

export interface LedgerV2 {
  alias: string;
  coins: number;
  gems: number;
  xp: number;
  nivel: number;
  aciertos: number;
  fallos: number;
  rachaQuiz: number;
  votos: Record<string, number>; // id mercado → 1=SÍ 2=NO
  compras: Record<string, number>; // itemId → cantidad
  logrosVistos: Record<string, 1>;
  mundoVisitas: Record<string, number>;
  nacimiento: number;
}

const CLAVE = "vanguard2-ledger-v1";

export function ledgerNuevo(): LedgerV2 {
  return {
    alias: "AGENTE-" + Math.floor(1000 + Math.random() * 9000),
    coins: 250,
    gems: 5,
    xp: 0,
    nivel: 1,
    aciertos: 0,
    fallos: 0,
    rachaQuiz: 0,
    votos: {},
    compras: {},
    logrosVistos: {},
    mundoVisitas: {},
    nacimiento: Date.now(),
  };
}

export function leerLedger(): LedgerV2 {
  if (typeof window === "undefined") return ledgerNuevo();
  try {
    const raw = window.localStorage.getItem(CLAVE);
    if (!raw) return ledgerNuevo();
    const p = JSON.parse(raw) as Partial<LedgerV2>;
    return { ...ledgerNuevo(), ...p };
  } catch {
    return ledgerNuevo();
  }
}

export function guardarLedger(l: LedgerV2) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(l));
  } catch {
    /* cuota llena — el universo sigue */
  }
}

export function mutarLedger(fn: (l: LedgerV2) => void): LedgerV2 {
  const l = leerLedger();
  fn(l);
  guardarLedger(l);
  return l;
}

/** XP → nivel: curva propia de v2 (suave, 120 xp por nivel base). */
export function xpANivel(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 120)) + 1);
}

export function xpParaSiguiente(nivel: number): number {
  return Math.pow(nivel, 2) * 120;
}

/** Lee el estado del Vanguard ORIGINAL (solo lectura, para ficha del agente). */
export function leerEstadoOriginal(): {
  alias?: string;
  nivel?: number;
  coins?: number;
  gems?: number;
  streak?: number;
  xp?: number;
} {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("vanguard-game-state-v1");
    if (!raw) return {};
    const env = JSON.parse(raw);
    const s = env?.state ?? env ?? {};
    return {
      alias: typeof s.alias === "string" ? s.alias : undefined,
      nivel: typeof s.level === "number" ? s.level : undefined,
      coins: typeof s.coins === "number" ? s.coins : undefined,
      gems: typeof s.gems === "number" ? s.gems : undefined,
      streak: typeof s.streak === "number" ? s.streak : undefined,
      xp: typeof s.xp === "number" ? s.xp : undefined,
    };
  } catch {
    return {};
  }
}
