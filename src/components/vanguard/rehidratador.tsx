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
// v133.0: el store de los agentes entra a la disciplina de rehidratación
import { useAgentesLibres } from "@/lib/agentes-autonomos";
import { useFavoritos } from "@/lib/favoritos-store";
// v172.0: la telemetría de la paridad entra a la disciplina de rehidratación
import { useTelemetriaParidad } from "@/lib/telemetria-paridad";
import { marcarHidratado } from "@/lib/storage-blindado";

/** rehydrate() devuelve void | Promise<void> — lo normalizamos a promesa */
function rehidratar(store: { persist: { rehydrate: () => void | Promise<void> } }): Promise<void> {
  return Promise.resolve(store.persist.rehydrate());
}

export function Rehidratador() {
  useEffect(() => {
    // v134.0 EL ESTRENO — LA CURA DEL MODO GUERRA: el botón «versión ligera»
    // atrapaba visitantes en pantalla negra. La lib ya no existe, pero la
    // llave sigue en el storage de quienes cayeron: se expulsa AQUÍ y se
    // retira la clase del <html>. Nadie vuelve a quedar dentro.
    try {
      localStorage.removeItem("vanguard-modo-guerra");
      document.documentElement.classList.remove("modo-guerra");
    } catch { /* sin storage: nada que curar */ }
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
    // v133.0 EL ACABADO REAL: el cuerpo de agentes también respeta la fila —
    // su bitácora y credencial entran tras el montaje (cero #418)
    rehidratar(useAgentesLibres)
      .then(() => marcarHidratado("vg-agentes-libres-v131"))
      .catch(() => marcarHidratado("vg-agentes-libres-v131"));
    // v171.0 LA FILA CERO: los favoritos del riel entran a la disciplina de
    // rehidratación — sus cerraduras abren tras el montaje (cero #418)
    rehidratar(useFavoritos)
      .then(() => marcarHidratado("vg171-favoritos"))
      .catch(() => marcarHidratado("vg171-favoritos"));
    // v172.0 EL PULSO DE LA PARIDAD: la cuenta 3D/2D también respeta la
    // fila — sin este registro su cerradura bloquearía la persistencia
    // (mismo bug cazado en el QA de v171)
    rehidratar(useTelemetriaParidad)
      .then(() => marcarHidratado("vg172-telemetria"))
      .catch(() => marcarHidratado("vg172-telemetria"));
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
