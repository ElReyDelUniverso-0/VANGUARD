"use client";

// ============================================================
// v132.0 LA GRAN AUDITORÍA — EL REHIDRATADOR
// Con skipHydration en los stores persistidos, NADIE vuelve a
// desajustar la hidratación de React (error #418: el servidor
// pintaba los valores por defecto y el cliente los guardados →
// parpadeo + "a veces no se actualiza"). Este componente aplica
// los valores guardados UNA VEZ, justo tras el montaje, cuando
// React ya terminó de hidratar.
// Y con la CERRADURA de storage-blindado, cada store solo
// vuelve a escribir tras su rehidratación — lo guardado del
// visitante jamás se pisa con valores por defecto.
// ============================================================
import { useEffect } from "react";
import { useGameStore } from "@/lib/game-store";
import { useLangStore, ensureLangDetected } from "@/lib/i18n";
import { useLuxe } from "@/lib/luxe-store";
import { useRetention } from "@/lib/retention";
import { useArquitecto } from "@/lib/arquitecto";
import { useCama } from "@/lib/cama-store";
import { useProfileStore } from "@/lib/profile-store";
import { marcarHidratado } from "@/lib/storage-blindado";

/** rehydrate() devuelve void | Promise<void> — lo normalizamos a promesa */
function rehidratar(store: { persist: { rehydrate: () => void | Promise<void> } }): Promise<void> {
  return Promise.resolve(store.persist.rehydrate());
}

export function Rehidratador() {
  useEffect(() => {
    // Cada rehidratación es idempotente; al terminar, su cerradura se abre.
    rehidratar(useGameStore)
      .then(() => marcarHidratado("vanguard-game-state-v1"))
      .catch(() => marcarHidratado("vanguard-game-state-v1")); // la Casa vive igual
    rehidratar(useLuxe)
      .then(() => marcarHidratado("vg_luxe_v126"))
      .catch(() => marcarHidratado("vg_luxe_v126"));
    rehidratar(useRetention)
      .then(() => marcarHidratado("vg_retention_v55"))
      .catch(() => marcarHidratado("vg_retention_v55"));
    rehidratar(useArquitecto)
      .then(() => marcarHidratado("vg-arquitecto-v115"))
      .catch(() => marcarHidratado("vg-arquitecto-v115"));
    rehidratar(useCama)
      .then(() => marcarHidratado("vg_cama_v121"))
      .catch(() => marcarHidratado("vg_cama_v121"));
    rehidratar(useProfileStore)
      .then(() => marcarHidratado("vanguard-profile-v1"))
      .catch(() => marcarHidratado("vanguard-profile-v1"));
    rehidratar(useLangStore)
      .then(() => marcarHidratado("vanguard-lang-v1"))
      .then(() => {
        // v42 TU IDIOMA, TU GUERRA — ahora SÍ respetando lo guardado:
        // si el visitante eligió idioma a mano (autoDetected=false) no se toca.
        ensureLangDetected();
      })
      .catch(() => marcarHidratado("vanguard-lang-v1")); // el idioma jamás tumba la página
  }, []);
  return null;
}
