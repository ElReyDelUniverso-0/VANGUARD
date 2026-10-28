// ============================================================
// v119.0 CRONOTEATRO — LA VOZ DEL PARTE · v191.0 CONSEJO DE VOCES
// Los DESPACHOS DEL FRENTE se leen en voz alta: la casa narra
// su propio parte de campaña. Síntesis del navegador, cero
// servicios externos, cero coste, cero copyright.
// v191: el narrador YA NO usa la voz genérica — tiene voz PROPIA
// (grave, pausada, de operador de radio) dentro del Consejo de
// Voces de Vanguard (src/lib/voces-agentes.ts). Respeta el MUTE
// global de la casa: si Vanguard está silenciado, no habla.
// Contrato: una sola voz activa; cambiar de día la corta.
// ============================================================

import { isMuted } from "./sound";
import { hablarAgente } from "./voces-agentes";
import type { Despacho } from "./frente-zonas-data";

let hablando = false;

export function vozDisponible(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
}

/** ¿Está la casa narrando ahora mismo? */
export function vozActiva(): boolean {
  return hablando;
}

/** Silencia la voz en curso (botón, desmonte, cambio de día). */
export function callarVoz() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  hablando = false;
}

/**
 * Narra el parte del día: «Día 12 de campaña. 06:40, Sector Norte: ...».
 * v191: con la voz PROPIA del NARRADOR (Consejo de Voces).
 * Devuelve false si la casa está silenciada o la voz no existe.
 */
export function narrarDespachos(dia: number, despachos: Despacho[]): boolean {
  if (typeof window === "undefined" || !vozDisponible()) return false;
  if (isMuted()) { callarVoz(); return false; }
  callarVoz();
  const frases = [
    `Parte del frente. Día ${dia} de campaña.`,
    ...despachos.map((d) => `${d.hora}. ${d.sector.toLowerCase()}: ${d.texto}`),
    "Fin del parte. Vanguard, cronoteatro.",
  ];
  const ok = hablarAgente("narrador", frases.join(" "), {
    onend: () => { hablando = false; },
    onerror: () => { hablando = false; },
  });
  hablando = ok;
  return ok;
}
