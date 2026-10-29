"use client";

// v105.0 LA REDACCIÓN — MODO CALMA (sala de lectura limpia).
// El comandante pidió: "las notificaciones de la mente son como un comercial
// molesto… la interfaz está ocupando espacio, dificulta la escritura".
// CALMA es el contrato global de silencio: mientras lees o escribes a LA MENTE,
// NINGÚN toast comercial, cofre flotante o aviso de temporada interrumpe.
// Honestidad: no se roba nada — los avisos siguen acumulándose en su centro
// (Alertas) y el silencio se activa solo mientras lees/escribes.

import { create } from "zustand";

interface CalmaState {
  /** true mientras hay una sala de lectura/escritura abierta */
  modoLectura: boolean;
  /** timestamp hasta el que el usuario pidió silencio explícito */
  silencioHasta: number;
  activarLectura: () => void;
  desactivarLectura: () => void;
  /** silencio manual honesto (30 min por defecto) */
  pedirSilencio: (min?: number) => void;
}

export const useCalma = create<CalmaState>()((set) => ({
  modoLectura: false,
  silencioHasta: 0,
  activarLectura: () => set({ modoLectura: true }),
  desactivarLectura: () => set({ modoLectura: false }),
  pedirSilencio: (min = 30) =>
    set({ silencioHasta: Date.now() + min * 60_000 }),
}));

/** Consulta síncrona barata para intervalos que no deben provocar re-render. */
export function calmaActiva(): boolean {
  try {
    const s = useCalma.getState();
    if (s.modoLectura) return true;
    if (s.silencioHasta > Date.now()) return true;
    return false;
  } catch {
    return false;
  }
}
