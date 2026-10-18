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
import { storageBlindado } from "@/lib/storage-blindado";
import type { TabKey } from "@/components/vanguard/tab-nav";

/** Los 6 estilos de viaje entre secciones (v121 + v124 ORO CAVIAR). */
export type EstiloTransicion = "oro" | "deslizar" | "cine3d" | "telon" | "hiperespacio" | "disolver";

export const ESTILOS_TRANSICION: { id: EstiloTransicion; nombre: string; desc: string }[] = [
  { id: "oro", nombre: "ORO CAVIAR", desc: "Telas de terciopelo noir y polvo de oro — la entrada exclusiva de la casa" },
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
  /** v122: abrir la sala favorita SOLA al arrancar la casa */
  abrirFavorito: boolean;
  /** Últimas salas visitadas (máx 8) — la casa recuerda tu camino */
  recientes: TabKey[];
  /** Visitas por sala — la adaptación real de LA CAMA */
  visitas: Record<string, number>;
  /** v124: la casa ya vistió a este usuario de CAVIAR (migración de lujo 1 vez) */
  oroOnboard: boolean;
  setTransicion: (v: EstiloTransicion) => void;
  setLetraEscala: (v: number) => void;
  setDensidad: (v: Densidad) => void;
  setMovimiento: (v: number) => void;
  setAcento: (v: string) => void;
  setModoCama: (v: boolean) => void;
  setAutoCama: (v: boolean) => void;
  setFavorito: (v: TabKey | null) => void;
  setAbrirFavorito: (v: boolean) => void;
  /** Registrar una visita (la casa aprende) */
  visita: (tab: TabKey) => void;
  resetCama: () => void;
}

const DEFAULTS = {
  transicion: "oro" as EstiloTransicion,
  letraEscala: 1,
  densidad: "normal" as Densidad,
  movimiento: 1,
  acento: "#FFC94D",
  modoCama: false,
  autoCama: false,
  favorito: null,
  abrirFavorito: false,
  recientes: [] as TabKey[],
  visitas: {} as Record<string, number>,
  oroOnboard: true,
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
      setAbrirFavorito: (v) => set({ abrirFavorito: v }),
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
      // v132.0: skipHydration — la transición/movimiento elegidos se aplican
      // tras el montaje (sin desajuste de clases entre servidor y cliente)
      skipHydration: true,
      storage: createJSONStorage(() => storageBlindado),
      // v124.0 CAVIAR — migración de lujo (solo UNA vez): quien ya tenía la
      // casa a su medida conserva TODO (visitas, favorito, acento…), pero su
      // viaje entre salas se estrena con el telón de ORO CAVIAR.
      version: 1,
      migrate: (estado, version) => {
        const s = estado as Partial<CamaEstado> | undefined;
        if (!s || version < 1) return { ...DEFAULTS, ...s, transicion: "oro", oroOnboard: true } as CamaEstado;
        if (!s.oroOnboard) return { ...DEFAULTS, ...s, transicion: "oro", oroOnboard: true } as CamaEstado;
        return { ...DEFAULTS, ...s } as CamaEstado;
      },
    }
  )
);

/** ¿Es hora de cama en el aparato del dueño? (22:00–07:00 local) */
export function esHoraDeCama(): boolean {
  if (typeof window === "undefined") return false;
  const h = new Date().getHours();
  return h >= 22 || h < 7;
}
