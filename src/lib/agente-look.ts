"use client";

// v73.0 EDITOR DEL AGENTE 3D — look persistente del avatar del hangar.
// El agente low-poly de hangar-3d lee este store al montarse y escucha el
// evento "vanguard:agente-look" para actualizarse EN VIVO (sin reconstruir).
// "rango" = el uniforme lo decide el nivel (comportamiento clásico v67).

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AgenteLook {
  /** Tono de piel (hex) */
  skin: string;
  /** Uniforme: "rango" (por nivel) o hex personalizado */
  uniforme: string;
  /** Pantalón (hex) */
  pantalon: string;
  /** Visor táctico encendido */
  visor: boolean;
  /** Color del visor (hex) */
  visorColor: string;
}

export const AGENTE_LOOK_DEFAULT: AgenteLook = {
  skin: "#d8a77a",
  uniforme: "rango",
  pantalon: "#1a1d26",
  visor: false,
  visorColor: "#00FF87",
};

// paletas del editor (mismas constantes aquí y en el panel)
export const PIEL_TONOS = ["#f2c9a0", "#e0b088", "#d8a77a", "#b97f52", "#8c5a34", "#5f3d22"];
export const UNIFORME_COLORES = [
  "#3a3f4a", "#14401e", "#0e4a5a", "#7a5a10", "#8a1420",
  "#1E90FF", "#FF8A2A", "#9B5CFF", "#00FF87", "#FF3B30", "#FFD60A", "#F0F0F0",
];
export const PANTALON_COLORES = ["#1a1d26", "#2b2f3a", "#3d3428", "#22333d", "#402020", "#101418"];
export const VISOR_COLORES = ["#00FF87", "#1E90FF", "#FF3B30", "#FFD60A", "#9B5CFF"];

interface AgenteLookStore extends AgenteLook {
  setLook: (p: Partial<AgenteLook>) => void;
  reset: () => void;
}

export const useAgenteLook = create<AgenteLookStore>()(
  persist(
    (set) => ({
      ...AGENTE_LOOK_DEFAULT,
      setLook: (p) => {
        set(p);
        emitirLook();
      },
      reset: () => {
        set(AGENTE_LOOK_DEFAULT);
        emitirLook();
      },
    }),
    { name: "vg_agente_look_v73" }
  )
);

/** Notifica al hangar 3D (y a cualquier escena) que el look cambió. */
export function emitirLook() {
  if (typeof window === "undefined") return;
  const s = useAgenteLook.getState();
  window.dispatchEvent(
    new CustomEvent("vanguard:agente-look", {
      detail: {
        skin: s.skin, uniforme: s.uniforme, pantalon: s.pantalon,
        visor: s.visor, visorColor: s.visorColor,
      } satisfies AgenteLook,
    })
  );
}

/** Lectura tolerante para escenas fuera de React (three.js). */
export function leerLook(): AgenteLook {
  try {
    const raw = localStorage.getItem("vg_agente_look_v73");
    if (!raw) return AGENTE_LOOK_DEFAULT;
    const j = JSON.parse(raw) as { state?: Partial<AgenteLook> };
    return { ...AGENTE_LOOK_DEFAULT, ...(j.state || {}) };
  } catch {
    return AGENTE_LOOK_DEFAULT;
  }
}
