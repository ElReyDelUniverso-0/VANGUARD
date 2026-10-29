"use client";

// ============================================================
// v126.0 LA CASA · ATELIER — STORE DE LUJO DEL VISITANTE
// Guarda lo que la Casa graba en placa para cada visitante:
//   · serie      — SU número de serie único (Ley 4 · artesanía)
//   · forjaISO   — la fecha en que entró a la Casa por 1ª vez
//   · acabado    — el material de la casa (Ley 2 · materiales)
//   · galeria    — el MODO GALERÍA (Ley 1 · espacio negativo)
// Persistente, tolerante a SSR (la serie se forja solo en cliente).
// ============================================================
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageBlindado } from "@/lib/storage-blindado";
import { forjarSerie } from "@/lib/luxe";

export interface LuxeEstado {
  /** Serie grabada única — null hasta que el cliente la forja */
  serie: string | null;
  /** Fecha ISO de la primera visita a la Casa */
  forjaISO: string | null;
  /** Acabado de la casa (id de ACABADOS) */
  acabado: string;
  /** MODO GALERÍA — espacio negativo: menos elementos, más aire */
  galeria: boolean;
  forjar: () => void;
  setAcabado: (id: string) => void;
  setGaleria: (v: boolean) => void;
  resetLuxe: () => void;
}

const DEFAULTS = {
  serie: null as string | null,
  forjaISO: null as string | null,
  acabado: "oro",
  galeria: false,
};

export const useLuxe = create<LuxeEstado>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      forjar: () => {
        const s = get();
        if (s.serie) return; // la serie se graba UNA sola vez
        set({
          serie: forjarSerie(),
          forjaISO: new Date().toISOString(),
        });
      },
      setAcabado: (id) => set({ acabado: id }),
      setGaleria: (v) => set({ galeria: v }),
      resetLuxe: () => set({ ...DEFAULTS }),
    }),
    {
      name: "vg_luxe_v126",
      // v132.0: skipHydration — la serie grabada entra tras el montaje (sin #418)
      skipHydration: true,
      storage: createJSONStorage(() => storageBlindado),
      version: 1,
    }
  )
);
