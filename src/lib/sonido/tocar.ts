// ═══════════════════════════════════════════════════════════════════════════
// v436.2 · LA BOCA DE LAS ACCIONES — el único camino del catálogo al altavoz
//
// `suena("paso-hecho")` es todo lo que un componente necesita saber. Aquí se
// aplica la ley: sonido encendido, sin calma, con gesto previo, pestaña visible
// y sin repetir la misma acción más rápido de lo que su `cada` permite.
//
// Nada de esto suena solo: si nunca hubo un toque, no hay gesto y no suena.
// ═══════════════════════════════════════════════════════════════════════════

import { initSound, isMuted, setMuted, tocar, type NotaVoz } from "@/lib/sound";
import { calmaActiva } from "@/lib/calma";
import {
  ACCIONES, esAccion, marcarDisparo, puedeSonar, tocaAhora,
  type Accion,
} from "@/lib/sonido/acciones";
import { leer, guardar, type Preferencias } from "@/lib/interfaz/vivo";

let desbloqueado = false;
let oyentesPuestos = false;

/** ¿Ya hubo un gesto del usuario en esta pestaña? */
export function hayGesto(): boolean {
  return desbloqueado;
}

/** La casa solo puede sonar después de un toque: se llama desde el primer gesto. */
export function desbloquearSonido(): void {
  if (typeof window === "undefined") return;
  if (!oyentesPuestos) {
    oyentesPuestos = true;
    const una = () => {
      desbloqueado = true;
      initSound();
      // el sonido apagado del Dueño también se respeta al arrancar
      const p = leer();
      if (!p.sonido) setMuted(true);
      window.removeEventListener("pointerdown", una);
      window.removeEventListener("keydown", una);
      window.removeEventListener("touchstart", una);
    };
    window.addEventListener("pointerdown", una, { passive: true });
    window.addEventListener("keydown", una);
    window.addEventListener("touchstart", una, { passive: true });
  }
}

function oculto(): boolean {
  if (typeof document === "undefined") return false;
  return document.visibilityState === "hidden";
}

/**
 * El portero, en un solo sitio: sonido encendido, sin calma, con gesto previo,
 * pestaña visible y sin repetir la misma acción más rápido de lo que su `cada`
 * permite. Devuelve true solo si de verdad se puede sonar ahora.
 */
function permite(accion: Accion | string, opciones?: { forzar?: boolean }): accion is Accion {
  if (typeof window === "undefined") return false;
  if (!esAccion(accion)) return false;
  const p = leer();
  if (
    !puedeSonar({
      mudo: isMuted() || !p.sonido,
      calma: calmaActiva(),
      gesto: desbloqueado || opciones?.forzar === true,
      oculto: oculto(),
    })
  ) {
    return false;
  }
  const ahora = Date.now();
  if (!tocaAhora(accion, ahora)) return false;
  marcarDisparo(accion, ahora);
  return true;
}

/** La señal pública. Silenciosa cuando debe serlo. */
export function suena(accion: Accion | string, opciones?: { forzar?: boolean }): boolean {
  if (!permite(accion, opciones)) return false;
  tocar(ACCIONES[accion].notas);
  return true;
}

/**
 * v437.2 · LA MÚSICA QUE AVANZA — la misma ley, con las notas que traiga quien
 * llama. La usa el mercado: su contradanza cambia de compás cada 2,4 s, así que
 * una receta fija no sirve; lo que no cambia es el portero (silencio, calma,
 * gesto y pestaña) ni el motor de audio (siempre `lib/sound.ts`).
 */
export function suenaNotas(accion: Accion | string, notas: NotaVoz[]): boolean {
  if (!Array.isArray(notas) || notas.length === 0) return false;
  if (!permite(accion)) return false;
  tocar(notas);
  return true;
}

/** Encender o apagar el sonido de la casa (y sonar el apagado, que también es un sonido). */
export function ponerSonido(encendido: boolean): Preferencias {
  const p = leer();
  const nuevo = guardar({ ...p, sonido: encendido });
  setMuted(!encendido);
  if (!encendido) {
    // el toque de apagado se sintetiza antes de enmudecer para que se oiga
    setMuted(false);
    suena("silencio", { forzar: true });
    setMuted(true);
  } else {
    suena("permiso-voz", { forzar: true });
  }
  return nuevo;
}

/** Un atributo `data-vg-son="paso-hecho"` en cualquier botón de cualquier sala. */
export function accionDeElemento(el: Element | null): Accion | null {
  if (!el) return null;
  const raiz = el.closest("[data-vg-son]");
  const valor = raiz?.getAttribute("data-vg-son");
  return esAccion(valor ?? "") ? (valor as Accion) : null;
}
