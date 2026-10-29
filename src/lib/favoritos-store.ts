"use client";

// ══════════════════════════════════════════════════════════════════════
// v171.0 LOS FAVORITOS DEL DUEÑO — FILA CERO DEL RIEL.
// Idea estrella del inbox v170: «cierra el círculo de navegación —
// favoritos siempre en fila 0, sin menú y sin búsqueda».
// Un toque en la estrella de cualquier píldora del riel fija ese módulo
// al inicio del riel PARA SIEMPRE (persistente, con el punto de color de
// su sección aunque viva en otra sección). Un toque más lo suelta.
// Storage blindado (mismo escudo de la Cama) — el riel lee con selector
// atómico: cero re-renders de la Casa, solo el riel respira.
// ══════════════════════════════════════════════════════════════════════
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageBlindado } from "@/lib/storage-blindado";

interface FavoritosState {
  /** los módulos fijados, en el ORDEN en que el dueño los fijó */
  favoritos: string[];
  /** fija o suelta un módulo (idempotente por clave) */
  toggleFav: (k: string) => void;
}

export const useFavoritos = create<FavoritosState>()(
  persist(
    (set) => ({
      favoritos: [],
      toggleFav: (k) =>
        set((s) => ({
          favoritos: s.favoritos.includes(k)
            ? s.favoritos.filter((x) => x !== k)
            : [...s.favoritos, k],
        })),
    }),
    {
      name: "vg171-favoritos",
      storage: createJSONStorage(() => storageBlindado),
    },
  ),
);
