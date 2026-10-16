// ============================================================
// v119.0 CRONOTEATRO — LA VOZ DEL PARTE
// Los DESPACHOS DEL FRENTE se leen en voz alta: la casa narra
// su propio parte de campaña. Síntesis del navegador (es-ES,
// ritmo de operador de radio), cero servicios externos, cero
// coste, cero copyright — la voz nace en la máquina del
// comandante. Respeta el MUTE global de la casa: si Vanguard
// está silenciado, el parte no habla.
// Contrato: una sola voz activa; cambiar de día la corta.
// ============================================================

import { isMuted } from "./sound";
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
  const u = new SpeechSynthesisUtterance(frases.join(" "));
  u.lang = "es-ES";
  u.rate = 0.97;
  u.pitch = 0.88;
  u.volume = 0.9;
  u.onend = () => { hablando = false; };
  u.onerror = () => { hablando = false; };
  window.speechSynthesis.speak(u);
  hablando = true;
  return true;
}
