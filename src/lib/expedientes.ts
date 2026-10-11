"use client";

// v57.0 ARCHIVO SECRETO — EXPEDIENTES DESCLASIFICADOS
// Colección de expedientes REALES ya desclasificados por agencias oficiales:
// FBI Vault, CIA Reading Room, National Security Archive, NARA y The Black Vault.
// Todo es material PÚBLICO y LEGAL (salas de lectura FOIA). La emoción está en
// la presentación de dossier + la mecánica de colección con recompensas.
// Enlaces FBI: funcionan en móviles/navegadores reales (Akamai solo bloquea bots).

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// v103.0: los DATOS PUROS (tipos + EXPEDIENTES) viven en expedientes-datos.ts
// (sin "use client") para que el servidor — la API del MODO AGENTE — pueda
// leerlos. Se re-exportan: todos los consumidores existentes siguen igual.
import { EXPEDIENTES, type Agencia, type SecRarity, type Expediente } from "./expedientes-datos";
export { EXPEDIENTES } from "./expedientes-datos";
export type { Agencia, SecRarity, Expediente } from "./expedientes-datos";

// ===== MILETOS DE COLECCIÓN =====
export interface SecMilestone {
  at: number;
  coins: number;
  gems: number;
  seasonXp: number;
  label: string;
}
export const SEC_MILESTONES: SecMilestone[] = [
  { at: 3, coins: 120, gems: 0, seasonXp: 40, label: "3 expedientes abiertos" },
  { at: 6, coins: 250, gems: 2, seasonXp: 60, label: "6 expedientes: analista certificado" },
  { at: 10, coins: 400, gems: 3, seasonXp: 90, label: "10 expedientes: agente encubierto" },
  { at: 15, coins: 600, gems: 5, seasonXp: 120, label: "15 expedientes: director adjunto" },
  { at: 21, coins: 900, gems: 8, seasonXp: 150, label: "21 expedientes: bóveda casi vacía" },
  { at: EXPEDIENTES.length, coins: 2000, gems: 30, seasonXp: 500, label: "ARCHIVO COMPLETO: eres el OJO DE DIOS" },
];

// ===== RANGOS DE INTELIGENCIA (por expedientes leídos) =====
const RANK_STEPS: { at: number; rank: string }[] = [
  { at: 0, rank: "RECLUTA" },
  { at: 1, rank: "VIGÍA" },
  { at: 3, rank: "ANALISTA" },
  { at: 6, rank: "OPERATIVO" },
  { at: 10, rank: "AGENTE ENCUBIERTO" },
  { at: 15, rank: "DIRECTOR ADJUNTO" },
  { at: 21, rank: "DIRECTOR DEL ARCHIVO" },
];

export function intelRank(reads: number): string {
  let rank = RANK_STEPS[0].rank;
  for (const s of RANK_STEPS) if (reads >= s.at) rank = s.rank;
  return rank;
}

export function nextRankAt(reads: number): { rank: string; at: number } | null {
  for (const s of RANK_STEPS) if (reads < s.at) return { rank: s.rank, at: s.at };
  return null;
}

// ===== EXPEDIENTE DEL DÍA (doble recompensa, seed por fecha UTC) =====
export function expedienteDelDia(): Expediente {
  const day = Math.floor(Date.now() / 86400000);
  return EXPEDIENTES[day % EXPEDIENTES.length];
}

export function isExpedienteDelDia(id: string): boolean {
  return expedienteDelDia().id === id;
}

// ===== RECOMPENSAS POR LECTURA =====
export function lecturaReward(exp: Expediente, isDaily: boolean): { coins: number; gems: number; seasonXp: number } {
  const base = { coins: 60, gems: 0, seasonXp: 45 };
  if (exp.rareza === "RARO") { base.coins = 90; base.seasonXp = 60; }
  if (exp.rareza === "EPICO") { base.coins = 140; base.gems = 1; base.seasonXp = 80; }
  if (exp.rareza === "LEGENDARIO") { base.coins = 220; base.gems = 2; base.seasonXp = 110; }
  if (isDaily) { base.coins = Math.round(base.coins * 1.5); base.seasonXp = Math.round(base.seasonXp * 1.5); }
  return base;
}

// ===== STORE PERSISTENTE (colección del jugador) =====
interface ExpedState {
  readIds: string[];
  claimedMilestones: number[];
  markRead: (id: string) => { already: boolean };
  claimMilestone: (at: number) => boolean;
  resetAll: () => void;
}

export const useExpedientes = create<ExpedState>()(
  persist(
    (set, get) => ({
      readIds: [],
      claimedMilestones: [],
      markRead: (id) => {
        if (get().readIds.includes(id)) return { already: true };
        set({ readIds: [...get().readIds, id] });
        return { already: false };
      },
      claimMilestone: (at) => {
        if (get().claimedMilestones.includes(at)) return false;
        set({ claimedMilestones: [...get().claimedMilestones, at] });
        return true;
      },
      resetAll: () => set({ readIds: [], claimedMilestones: [] }),
    }),
    { name: "vg_expedientes_v57", storage: createJSONStorage(() => localStorage) }
  )
);

export const AGENCIA_STYLE: Record<Agencia, { label: string; cls: string }> = {
  FBI: { label: "FBI VAULT", cls: "border-amber-hud text-amber bg-amber-hud/15" },
  CIA: { label: "CIA READING ROOM", cls: "border-cyan-hud text-cyan-hud bg-cyan-hud/15" },
  NSARCHIVE: { label: "NAT. SECURITY ARCHIVE", cls: "border-violet-hud text-violet-hud bg-violet-hud/15" },
  NARA: { label: "ARCHIVOS NACIONALES", cls: "border-green-hud text-green-hud bg-green-hud/15" },
  BLACKVAULT: { label: "THE BLACK VAULT", cls: "border-red-hud text-red-hud bg-red-hud/15" },
};

export const RARITY_STYLE: Record<SecRarity, string> = {
  COMUN: "text-slate-300 border-slate-500",
  RARO: "text-cyan-hud border-cyan-hud",
  EPICO: "text-violet-hud border-violet-hud",
  LEGENDARIO: "text-amber border-amber",
};
