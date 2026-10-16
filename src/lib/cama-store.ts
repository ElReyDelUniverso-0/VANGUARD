"use client";

// ============================================================
// v121.0 LA CAMA MÁS CÓMODA — STORE DE PERSONALIZACIÓN TOTAL
// El dueño manda: "imagina que Vanguard lo hagas como la cama
// más cómoda que se adapte a cada usuario y personalice".
// Este store guarda SUS preferencias de comodidad:
//   · transición: el movimiento con el que viaja entre secciones
//   · letraEscala: el tamaño de toda la casa (rem global)
//   · densidad: compacta / normal / amplia
//   · movimiento: intensidad 0..1.2 de TODAS las animaciones
//   · acento: su color personal (CSS var --vg-acento)
//   · modoCama: modo noche cálido (menos movimiento, más calma)
//   · autoCama: se pone el modo cama solo de 22:00 a 07:00
//   · favorito: su sala de siempre (lanzamiento rápido)
//   · recientes/visitas: ADAPTACIÓN REAL — la casa aprende qué
//     salas visita y LA CAMA se las pone a mano.
// El MotorCama lo traduce a CSS vars en :root. Todo persiste.
// ============================================================
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TabKey } from "@/components/vanguard/tab-nav";

/** Los 5 estilos de viaje entre secciones (v121). */
export type EstiloTransicion = "deslizar" | "cine3d" | "telon" | "hiperespacio" | "disolver";

export const ESTILOS_TRANSICION: { id: EstiloTransicion; nombre: string; desc: string }[] = [
  { id: "deslizar", nombre: "DESLIZAR", desc: "El clásico de Vanguard: la sala entra por el lado del viaje" },
  { id: "cine3d", nombre: "CINE 3D", desc: "La sala gira como un cubo de cine volumétrico" },
  { id: "telon", nombre: "TELÓN", desc: "Telares de teatro que suben y bajan entre salas" },
  { id: "hiperespacio", nombre: "HIPERESPACIO", desc: "Zoom a través de la matriz hacia tu destino" },
  { id: "disolver", nombre: "DISOLVER", desc: "Cambio de calma absoluta: una sala se funde en la otra" },
];

export const ACENTOS: { id: string; nombre: string; hex: string }[] = [
  { id: "oro", nombre: "Oro Vanguard", hex: "#FFC94D" },
  { id: "esmeralda", nombre: "Esmeralda", hex: "#4ADE80" },
  { id: "cian", nombre: "Ción", hex: "#22D3EE" },
  { id: "magenta", nombre: "Magenta Neón", hex: "#F472B6" },
  { id: "violeta", nombre: "Violeta", hex: "#A78BFA" },
  { id: "naranja", nombre: "Naranja Ocaso", hex: "#FB923C" },
];

export type Densidad = "compacta" | "normal" | "amplia";

export interface CamaEstado {
  /** Estilo de movimiento al cambiar de sección */
  transicion: EstiloTransicion;
  /** Escala tipográfica global 0.85..1.3 (rem de toda la casa) */
  letraEscala: number;
  /** Densidad del aire visual */
  densidad: Densidad;
  /** Intensidad de movimiento 0..1.2 (multiplica distancias/duraciones) */
  movimiento: number;
  /** Color personal del dueño (hex) */
  acento: string;
  /** Modo noche cálido: calma + tinte de ocaso permanente */
  modoCama: boolean;
  /** El modo cama se pone solo de 22:00 a 07:00 del aparato */
  autoCama: boolean;
  /** La sala favorita del dueño (chip de lanzamiento en LA CAMA) */
  favorito: TabKey | null;
  /** Últimas salas visitadas (máx 8) — la casa recuerda tu camino */
  recientes: TabKey[];
  /** Visitas por sala — la adaptación real de LA CAMA */
  visitas: Record<string, number>;
  setTransicion: (v: EstiloTransicion) => void;
  setLetraEscala: (v: number) => void;
  setDensidad: (v: Densidad) => void;
  setMovimiento: (v: number) => void;
  setAcento: (v: string) => void;
  setModoCama: (v: boolean) => void;
  setAutoCama: (v: boolean) => void;
  setFavorito: (v: TabKey | null) => void;
  /** Registrar una visita (la casa aprende) */
  visita: (tab: TabKey) => void;
  resetCama: () => void;
}

const DEFAULTS = {
  transicion: "deslizar" as EstiloTransicion,
  letraEscala: 1,
  densidad: "normal" as Densidad,
  movimiento: 1,
  acento: "#FFC94D",
  modoCama: false,
  autoCama: false,
  favorito: null,
  recientes: [] as TabKey[],
  visitas: {} as Record<string, number>,
};

export const useCama = create<CamaEstado>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setTransicion: (v) => set({ transicion: v }),
      setLetraEscala: (v) => set({ letraEscala: Math.min(1.3, Math.max(0.85, v)) }),
      setDensidad: (v) => set({ densidad: v }),
      setMovimiento: (v) => set({ movimiento: Math.min(1.2, Math.max(0, v)) }),
      setAcento: (v) => set({ acento: v }),
      setModoCama: (v) => set({ modoCama: v }),
      setAutoCama: (v) => set({ autoCama: v }),
      setFavorito: (v) => set({ favorito: v }),
      visita: (tab) =>
        set((s) => {
          const recientes = [tab, ...s.recientes.filter((t) => t !== tab)].slice(0, 8);
          const visitas = { ...s.visitas, [tab]: (s.visitas[tab] ?? 0) + 1 };
          return { recientes, visitas };
        }),
      resetCama: () => set({ ...DEFAULTS }),
    }),
    {
      name: "vg_cama_v121",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/** ¿Es hora de cama en el aparato del dueño? (22:00–07:00 local) */
export function esHoraDeCama(): boolean {
  if (typeof window === "undefined") return false;
  const h = new Date().getHours();
  return h >= 22 || h < 7;
}
