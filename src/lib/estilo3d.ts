"use client";

// ============================================================
// v110.0 MATRIZ 2100 — AJUSTES DEL MOTOR 3D (personalizable)
// El comandante manda: "3D interactivo con la persona,
// personalizable". Este store guarda SUS preferencias y el
// Motor3D las traduce a CSS vars en :root que consume toda la
// casa (escenas, héroes, tarjetas).
// ============================================================
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  setActivo: (v: boolean) => void;
  setIntensidad: (v: number) => void;
  setInclinar: (v: boolean) => void;
  setParalaje: (v: boolean) => void;
  setRejilla: (v: boolean) => void;
  setSellosVivos: (v: boolean) => void;
}

const DEFAULTS = {
  activo: true,
  intensidad: 60,
  inclinar: true,
  paralaje: true,
  rejilla: true,
  sellosVivos: true,
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
    }),
    {
      name: "vg-3d-v110",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
