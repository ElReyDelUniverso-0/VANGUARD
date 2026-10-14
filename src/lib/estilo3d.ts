"use client";

// ============================================================
// v110.0 MATRIZ 2100 — AJUSTES DEL MOTOR 3D (personalizable)
// El comandante manda: "3D interactivo con la persona,
// personalizable". Este store guarda SUS preferencias y el
// Motor3D las traduce a CSS vars en :root que consume toda la
// casa (escenas, héroes, tarjetas).
// v111.0 MÁQUINA DEL TIEMPO — + GIROSCOPIO (el móvil inclina la
// matriz con la mano) + ERA 1950→2100 (el look de toda la casa
// viaja en el tiempo: CRT verde, ámbar, presentes, holo).
// ============================================================
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type EraKey = "1950" | "1980" | "2020" | "2100";

export interface Estilo3DEstado {
  /** El motor 3D está activo (maestro general) */
  activo: boolean;
  /** Intensidad 0..100 — profundidad del tilt y del paralaje */
  intensidad: number;
  /** Las escenas se inclinan siguiendo al puntero/persona */
  inclinar: boolean;
  /** Paralaje de fondo con el movimiento global del ratón */
  paralaje: boolean;
  /** Suelo de rejilla holográfica bajo las escenas */
  rejilla: boolean;
  /** Sello de reloj EN VIVO en los héroes */
  sellosVivos: boolean;
  /** v111: el giroscopio del móvil inclina la matriz con la mano */
  giroscopio: boolean;
  /** v111: la era visual de toda la casa (1950 CRT → 2100 holo) */
  era: EraKey;
  /** v112: presets de era POR SALA — la MURALLA en 1950, el AUDITORIO en 2100 */
  presetsEra: Record<string, EraKey>;
  /** v112: los presets por sala mandan al entrar en cada sala */
  presetsOn: boolean;
  /** v112: calibración fina del giroscopio — TU pose de reposo es el cero */
  gyroCal: { x: number; y: number };
  setActivo: (v: boolean) => void;
  setIntensidad: (v: number) => void;
  setInclinar: (v: boolean) => void;
  setParalaje: (v: boolean) => void;
  setRejilla: (v: boolean) => void;
  setSellosVivos: (v: boolean) => void;
  setGiroscopio: (v: boolean) => void;
  setEra: (v: EraKey) => void;
  setPresetEra: (sala: string, era: EraKey | null) => void;
  setPresetsOn: (v: boolean) => void;
  setGyroCal: (x: number, y: number) => void;
}

const DEFAULTS = {
  activo: true,
  intensidad: 60,
  inclinar: true,
  paralaje: true,
  rejilla: true,
  sellosVivos: true,
  giroscopio: false,
  era: "2100" as EraKey,
  presetsEra: {} as Record<string, EraKey>,
  presetsOn: false,
  gyroCal: { x: 0, y: 0 },
};

export const useEstilo3D = create<Estilo3DEstado>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setActivo: (v) => set({ activo: v }),
      setIntensidad: (v) => set({ intensidad: Math.max(0, Math.min(100, Math.round(v))) }),
      setInclinar: (v) => set({ inclinar: v }),
      setParalaje: (v) => set({ paralaje: v }),
      setRejilla: (v) => set({ rejilla: v }),
      setSellosVivos: (v) => set({ sellosVivos: v }),
      setGiroscopio: (v) => set({ giroscopio: v }),
      setEra: (v) => set({ era: v }),
      setPresetEra: (sala, era) =>
        set((st) => {
          const n = { ...st.presetsEra };
          if (era === null) delete n[sala];
          else n[sala] = era;
          return { presetsEra: n };
        }),
      setPresetsOn: (v) => set({ presetsOn: v }),
      setGyroCal: (x, y) => set({ gyroCal: { x: +x.toFixed(2), y: +y.toFixed(2) } }),
    }),
    {
      name: "vg-3d-v111",
      storage: createJSONStorage(() => localStorage),
      version: 3,
      // v111 → v112: los ajustes de la MATRIZ migran; presets y calibración entran limpios
      migrate: (persisted: unknown) => {
        const p = (persisted ?? {}) as Record<string, unknown>;
        return {
          ...p,
          giroscopio: p.giroscopio === true,
          era: (p.era as EraKey) ?? "2100",
          presetsEra: (p.presetsEra as Record<string, EraKey>) ?? {},
          presetsOn: p.presetsOn === true,
          gyroCal: (p.gyroCal as { x: number; y: number }) ?? { x: 0, y: 0 },
        };
      },
    }
  )
);

// v112: la ERA VIVA de una sala — el preset manda si está activo, si no la era global
export function eraVivaDe(estado: { era: EraKey; presetsOn: boolean; presetsEra: Record<string, EraKey> }, sala: string | null | undefined): EraKey {
  if (sala && estado.presetsOn && estado.presetsEra[sala]) return estado.presetsEra[sala];
  return estado.era;
}

// ---------- FICHA DE CADA ERA (la consume el Motor 3D) ----------
export interface EraDef {
  key: EraKey;
  /** tinte global de la pantalla (rgba) */
  tinte: string;
  /** mix-blend-mode del tinte */
  mezcla: string;
  /** opacidad de las líneas CRT del overlay */
  scan: number;
  /** fuerza de la viñeta 0..1 */
  vineta: number;
  /** filtro CSS aplicado a las escenas ("" = sin filtro) */
  filtro: string;
  /** parpadeo CRT del overlay */
  flicker: boolean;
}

export const ERAS: Record<EraKey, EraDef> = {
  "1950": {
    key: "1950",
    tinte: "rgba(46, 255, 122, 0.30)",
    mezcla: "color",
    scan: 0.20,
    vineta: 0.55,
    filtro: "saturate(0.28) sepia(0.55) hue-rotate(58deg) contrast(1.22) brightness(0.96)",
    flicker: true,
  },
  "1980": {
    key: "1980",
    tinte: "rgba(255, 172, 64, 0.26)",
    mezcla: "color",
    scan: 0.11,
    vineta: 0.38,
    filtro: "sepia(0.42) saturate(0.9) hue-rotate(-14deg) contrast(1.1)",
    flicker: false,
  },
  "2020": {
    key: "2020",
    tinte: "transparent",
    mezcla: "normal",
    scan: 0,
    vineta: 0,
    filtro: "",
    flicker: false,
  },
  "2100": {
    key: "2100",
    tinte: "rgba(94, 234, 212, 0.05)",
    mezcla: "screen",
    scan: 0.04,
    vineta: 0.16,
    filtro: "saturate(1.12) contrast(1.05)",
    flicker: false,
  },
};
