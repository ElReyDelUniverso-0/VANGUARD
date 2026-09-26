"use client";

// v55.0 TEMPORADA CERO — MOTOR DE RETENCIÓN
// Sistema central de enganche: pase de temporada de 30 días, cofres de
// recompensa variable, combo de sesión y registro de ausencia.
// Persistencia local (zustand persist) para que el progreso sobreviva
// entre visitas. Diseñado para convivir con la economía de game-store.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Rarity = "COMUN" | "RARO" | "EPICO" | "LEGENDARIO";

export const SEASON_DAYS = 30;
export const TIER_XP = 120; // XP de temporada por nivel
export const MAX_TIER = 30;
export const CHEST_INTERVAL_S = 480; // cofre cada 8 min de actividad real
export const COMBO_STEP_S = 240; // +0.1x cada 4 min de actividad
export const COMBO_MAX = 3.0;
export const COMBO_IDLE_RESET_S = 300; // 5 min inactivo → combo a 1.0

export interface ChestReward {
  rarity: Rarity;
  coins: number;
  gems: number;
  seasonXp: number;
}

export interface RetentionState {
  seasonStart: string; // ISO del primer día de temporada
  seasonXp: number;
  claimedTiers: number[];
  chestOpened: number;
  lastVisit: number; // epoch ms de la visita anterior
  visitCount: number;
  absenceSeen: number; // epoch ms del último informe de ausencia mostrado
  nudgesMuted: boolean;

  // acciones
  touchVisit: () => { returned: boolean; awayHours: number };
  addSeasonXp: (amount: number) => void;
  claimTier: (tier: number) => ChestReward | null;
  seasonDay: () => number;
  seasonDaysLeft: () => number;
  tierOf: () => number;
  tierProgress: () => number;
  openChest: () => ChestReward;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function rollRarity(): Rarity {
  const r = Math.random();
  if (r < 0.03) return "LEGENDARIO";
  if (r < 0.17) return "EPICO";
  if (r < 0.45) return "RARO";
  return "COMUN";
}

function chestFor(rarity: Rarity): ChestReward {
  switch (rarity) {
    case "LEGENDARIO":
      return { rarity, coins: 500, gems: 5, seasonXp: 150 };
    case "EPICO":
      return { rarity, coins: 200 + Math.floor(Math.random() * 120), gems: 1, seasonXp: 60 };
    case "RARO":
      return { rarity, coins: 80 + Math.floor(Math.random() * 60), gems: 0, seasonXp: 25 };
    default:
      return { rarity, coins: 25 + Math.floor(Math.random() * 35), gems: 0, seasonXp: 10 };
  }
}

export function tierReward(tier: number): { coins: number; gems: number } {
  const coins = 40 + tier * 8;
  const gems = tier % 5 === 0 ? 2 : 0; // cada 5 niveles gemas extra
  return { coins, gems };
}

export const useRetention = create<RetentionState>()(
  persist(
    (set, get) => ({
      seasonStart: "",
      seasonXp: 0,
      claimedTiers: [],
      chestOpened: 0,
      lastVisit: 0,
      visitCount: 0,
      absenceSeen: 0,
      nudgesMuted: false,

      touchVisit: () => {
        const now = Date.now();
        const prev = get().lastVisit;
        const awayHours = prev ? (now - prev) / 3600000 : 0;
        const returned = prev > 0 && awayHours >= 20;
        set({ lastVisit: now, visitCount: get().visitCount + 1 });
        // Temporada: se inicia en la primera visita y se reinicia al día 31+
        const s = get();
        if (!s.seasonStart) {
          set({ seasonStart: todayKey() });
        } else {
          const day = get().seasonDay();
          if (day > SEASON_DAYS) {
            // nueva temporada: reset limpio
            set({ seasonStart: todayKey(), seasonXp: 0, claimedTiers: [] });
          }
        }
        return { returned, awayHours };
      },

      addSeasonXp: (amount) => {
        set({ seasonXp: Math.min(get().seasonXp + amount, MAX_TIER * TIER_XP + TIER_XP - 1) });
      },

      claimTier: (tier) => {
        const s = get();
        if (s.claimedTiers.includes(tier)) return null;
        if (tier > s.tierOf()) return null;
        set({ claimedTiers: [...s.claimedTiers, tier] });
        const rw = tierReward(tier);
        return {
          rarity: "RARO",
          coins: rw.coins,
          gems: rw.gems,
          seasonXp: 0,
        };
      },

      seasonDay: () => {
        const s = get();
        if (!s.seasonStart) return 1;
        const start = new Date(s.seasonStart + "T00:00:00").getTime();
        return Math.max(1, Math.min(SEASON_DAYS, Math.floor((Date.now() - start) / 86400000) + 1));
      },

      seasonDaysLeft: () => {
        return SEASON_DAYS - get().seasonDay() + 1;
      },

      tierOf: () => {
        return Math.min(MAX_TIER, Math.floor(get().seasonXp / TIER_XP));
      },

      tierProgress: () => {
        return (get().seasonXp % TIER_XP) / TIER_XP;
      },

      openChest: () => {
        const rw = chestFor(rollRarity());
        set({ chestOpened: get().chestOpened + 1 });
        return rw;
      },
    }),
    {
      name: "vg_retention_v55",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
