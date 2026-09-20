// Vanguard v8 — CENTRO DE GANANCIAS: ruleta diaria, cajones de suministros,
// pase de temporada, ranking global y staking de paises-cripto.
// Datos estaticos + logica pura (sin React) para que panels y store la compartan.

import type { Rarity } from "@/lib/game-store";

// ====== RULETA DIARIA ======
export interface WheelPrize {
  id: number; // indice del segmento (0..7)
  label: string;
  kind: "COINS" | "GEMS" | "XP" | "JACKPOT";
  coins: number;
  gems: number;
  xp: number;
  weight: number; // probabilidad relativa
}

// 8 segmentos — premios calibrados para que la ruleta diaria siempre apetezca
export const WHEEL_PRIZES: WheelPrize[] = [
  { id: 0, label: "50 MON", kind: "COINS", coins: 50, gems: 0, xp: 0, weight: 20 },
  { id: 1, label: "1 GEMA", kind: "GEMS", coins: 0, gems: 1, xp: 0, weight: 14 },
  { id: 2, label: "30 MON", kind: "COINS", coins: 30, gems: 0, xp: 0, weight: 20 },
  { id: 3, label: "+60 XP", kind: "XP", coins: 0, gems: 0, xp: 60, weight: 14 },
  { id: 4, label: "100 MON", kind: "COINS", coins: 100, gems: 0, xp: 0, weight: 12 },
  { id: 5, label: "2 GEMAS", kind: "GEMS", coins: 0, gems: 2, xp: 0, weight: 8 },
  { id: 6, label: "+100 XP", kind: "XP", coins: 0, gems: 0, xp: 100, weight: 8 },
  { id: 7, label: "BOTE 250", kind: "JACKPOT", coins: 250, gems: 1, xp: 50, weight: 4 },
];

export function pickWheelPrize(): WheelPrize {
  const total = WHEEL_PRIZES.reduce((a, p) => a + p.weight, 0);
  let r = Math.random() * total;
  for (const p of WHEEL_PRIZES) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return WHEEL_PRIZES[0];
}

export const EXTRA_SPIN_COST_GEMS = 5;

// ====== CAJONES DE SUMINISTROS (gacha) ======
export type CrateTier = "COMUN" | "ELITE" | "LEGENDARIA";

export interface CrateLootTable {
  coins: [number, number];
  gems: [number, number];
  xp: [number, number];
  boostChance: number; // 0..1 — concede boost XP+MON de 30 min
}

export interface CrateDef {
  tier: CrateTier;
  name: string;
  desc: string;
  costCoins: number;
  costGems: number;
  rarity: Rarity;
  accent: string; // clase tailwind del borde
  glow: string;
  loot: CrateLootTable;
}

export const CRATES: CrateDef[] = [
  {
    tier: "COMUN",
    name: "Cajon de suministros",
    desc: "Caja estandar del frente. Monedas seguras, sorpresa ocasional.",
    costCoins: 250,
    costGems: 0,
    rarity: "COMUN",
    accent: "border-border",
    glow: "shadow-[0_0_24px_rgba(120,130,150,0.35)]",
    loot: { coins: [60, 220], gems: [0, 1], xp: [10, 40], boostChance: 0.06 },
  },
  {
    tier: "ELITE",
    name: "Cajon elite",
    desc: "Suministros de unidad especial. Gemas frecuentes y XP pesada.",
    costCoins: 900,
    costGems: 0,
    rarity: "RARO",
    accent: "border-cyan-hud",
    glow: "shadow-[0_0_28px_rgba(34,211,238,0.35)]",
    loot: { coins: [250, 700], gems: [1, 3], xp: [60, 160], boostChance: 0.18 },
  },
  {
    tier: "LEGENDARIA",
    name: "Cajon legendaria",
    desc: "Botin de alto mando. Premio garantizado de gemas + boost frecuente.",
    costCoins: 0,
    costGems: 60,
    rarity: "LEGENDARIO",
    accent: "border-amber-hud",
    glow: "shadow-[0_0_32px_rgba(245,166,35,0.45)]",
    loot: { coins: [600, 1600], gems: [3, 8], xp: [150, 400], boostChance: 0.45 },
  },
];

export function getCrateDef(tier: CrateTier): CrateDef {
  return CRATES.find((c) => c.tier === tier) ?? CRATES[0];
}

export interface CrateLootResult {
  tier: CrateTier;
  rarity: Rarity;
  coins: number;
  gems: number;
  xp: number;
  boost: boolean;
}

export function rollCrate(tier: CrateTier): CrateLootResult {
  const def = getCrateDef(tier);
  const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
  return {
    tier,
    rarity: def.rarity,
    coins: rnd(def.loot.coins[0], def.loot.coins[1]),
    gems: rnd(def.loot.gems[0], def.loot.gems[1]),
    xp: rnd(def.loot.xp[0], def.loot.xp[1]),
    boost: Math.random() < def.loot.boostChance,
  };
}

// ====== PASE VANGUARD (temporada mensual) ======
export interface PassTier {
  tier: number; // 1..12
  xpNeeded: number; // xp acumulada necesaria para este tier
  free: { coins: number; gems: number; crate?: CrateTier };
  elite: { coins: number; gems: number; crate?: CrateTier };
}

export const PASS_TIERS: PassTier[] = [
  { tier: 1, xpNeeded: 50, free: { coins: 60, gems: 0 }, elite: { coins: 150, gems: 1 } },
  { tier: 2, xpNeeded: 120, free: { coins: 90, gems: 0 }, elite: { coins: 200, gems: 1, crate: "COMUN" } },
  { tier: 3, xpNeeded: 200, free: { coins: 120, gems: 1 }, elite: { coins: 250, gems: 2 } },
  { tier: 4, xpNeeded: 300, free: { coins: 150, gems: 0, crate: "COMUN" }, elite: { coins: 300, gems: 2, crate: "ELITE" } },
  { tier: 5, xpNeeded: 420, free: { coins: 180, gems: 1 }, elite: { coins: 350, gems: 2 } },
  { tier: 6, xpNeeded: 560, free: { coins: 220, gems: 1 }, elite: { coins: 400, gems: 3, crate: "ELITE" } },
  { tier: 7, xpNeeded: 720, free: { coins: 260, gems: 1, crate: "ELITE" }, elite: { coins: 450, gems: 3 } },
  { tier: 8, xpNeeded: 900, free: { coins: 300, gems: 2 }, elite: { coins: 500, gems: 4 } },
  { tier: 9, xpNeeded: 1100, free: { coins: 350, gems: 2 }, elite: { coins: 550, gems: 4, crate: "ELITE" } },
  { tier: 10, xpNeeded: 1320, free: { coins: 400, gems: 2, crate: "ELITE" }, elite: { coins: 600, gems: 5 } },
  { tier: 11, xpNeeded: 1560, free: { coins: 460, gems: 3 }, elite: { coins: 650, gems: 6, crate: "ELITE" } },
  { tier: 12, xpNeeded: 1820, free: { coins: 550, gems: 3, crate: "LEGENDARIA" }, elite: { coins: 800, gems: 8, crate: "LEGENDARIA" } },
];

// indice del tier actual segun passXp acumulada
export function passTierFor(xp: number): number {
  let t = 0;
  for (const p of PASS_TIERS) {
    if (xp >= p.xpNeeded) t = p.tier;
    else break;
  }
  return t;
}

// numero de temporada determinista por mes (1 = mes de lanzamiento)
export function passSeasonIndex(now = Date.now()): number {
  const d = new Date(now);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}

export function passSeasonLabel(now = Date.now()): string {
  const d = new Date(now);
  const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  return `TEMPORADA ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// ====== AIRDROP HORARIO ======
export const AIRDROP_INTERVAL_MS = 60 * 60 * 1000;
export const AIRDROP_COINS = 30;
export const AIRDROP_GEMS = 2;

// ====== RANKING GLOBAL (rivales simulados deterministas) ======
export interface RivalDef {
  name: string;
  tag: string;
  seed: number;
}

export const RANK_RIVALS: RivalDef[] = [
  { name: "NIGHTHAWK", tag: "US", seed: 101 },
  { name: "VEGA-7", tag: "MX", seed: 202 },
  { name: "KOBRA", tag: "BR", seed: 303 },
  { name: "IRONWOLF", tag: "DE", seed: 404 },
  { name: "SAKURA", tag: "JP", seed: 505 },
  { name: "GHOSTLINE", tag: "GB", seed: 606 },
  { name: "TIGRE-2", tag: "AR", seed: 707 },
  { name: "ZEPHYR", tag: "FR", seed: 808 },
  { name: "BALA NEGRA", tag: "CO", seed: 909 },
  { name: "VOSTOK-9", tag: "RU", seed: 1010 },
  { name: "DRAGON ROJO", tag: "CN", seed: 1111 },
  { name: "SIROCCO", tag: "DZ", seed: 1212 },
  { name: "ANDES-1", tag: "PE", seed: 1313 },
  { name: "MARLIN", tag: "ES", seed: 1414 },
  { name: "TORMENTA", tag: "CL", seed: 1515 },
];

// PRNG determinista (mulberry32) — los rivales derivan segun el dia
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dayKey(now = Date.now()): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayNumber(now = Date.now()): number {
  return Math.floor(now / 86400000);
}

export interface RivalScore {
  name: string;
  tag: string;
  score: number;
}

// puntajes de rivales por disciplina; drift diario para que la tabla viva
export function rivalScores(discipline: "XP" | "CONQ" | "TRADER", now = Date.now()): RivalScore[] {
  const day = dayNumber(now);
  return RANK_RIVALS.map((r) => {
    const rnd = mulberry32(r.seed * 7919 + day * 13 + (discipline === "XP" ? 0 : discipline === "CONQ" ? 555 : 999));
    let score: number;
    if (discipline === "XP") score = 800 + Math.floor(rnd() * 9000);
    else if (discipline === "CONQ") score = Math.floor(rnd() * 40); // capturas + victorias
    else score = Math.floor((rnd() - 0.35) * 2200); // P/L realizado (algunos en rojo)
    return { name: r.name, tag: r.tag, score };
  });
}

// ====== STAKING DE PAISES-CRIPTO ======
// APY diario por activo, determinista a partir del id (6%..24%).
export function stakingApyFor(assetId: string): number {
  let h = 0;
  for (let i = 0; i < assetId.length; i++) h = (h * 31 + assetId.charCodeAt(i)) >>> 0;
  return 6 + (h % 19);
}

// recompensa acumulada en monedas desde lastClaimAt hasta now
export function stakeAccrued(stakedCoins: number, apy: number, lastClaimAt: number, now = Date.now()): number {
  const elapsed = Math.max(0, now - lastClaimAt);
  if (stakedCoins <= 0 || elapsed <= 0) return 0;
  const perSec = (stakedCoins * (apy / 100)) / 86400;
  return Math.floor(perSec * (elapsed / 1000));
}
