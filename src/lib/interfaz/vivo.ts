// ═══════════════════════════════════════════════════════════════════════════
// v436.2 · LAS PREFERENCIAS DEL PULSO — sonido y movimiento, recordados
//
// Dos perillas, una memoria, ningún misterio:
//   · SONIDO   — la casa suena al tocarla (nunca sola).
//   · MOVIMIENTO — alto · suave (lo del sistema) · quieto.
//
// Se guardan en el aparato (`vg:interfaz:v1`), se aplican como atributos en
// `<html>` (`data-vg-son`, `data-vg-mov`) y el CSS las lee. Si el almacén llega
// sucio, se sanea: nunca se cree lo que no se entiende.
//
// Este archivo es PURO: sin DOM, para poder probarlo en node.
// ═══════════════════════════════════════════════════════════════════════════

export type Movimiento = "auto" | "suave" | "quieto";

export type Preferencias = {
  /** ¿la casa suena cuando la tocas? (por defecto sí, pero solo tras un gesto) */
  sonido: boolean;
  /**
   * auto   → lo que diga el sistema (prefers-reduced-motion)
   * suave  → anima lo justo: entrada y salida, nada de bucles
   * quieto → sin animaciones decorativas (las funciones siguen igual)
   */
  movimiento: Movimiento;
};

export const CLAVE = "vg:interfaz:v1";
export const EVENTO = "vg:interfaz";

export const POR_DEFECTO: Preferencias = { sonido: true, movimiento: "auto" };

const MOVIMIENTOS: Movimiento[] = ["auto", "suave", "quieto"];

/** Acepta un objeto de cualquier forma y devuelve algo que la casa entiende. */
export function sanear(x: unknown): Preferencias {
  const base: Preferencias = { ...POR_DEFECTO };
  if (!x || typeof x !== "object") return base;
  const o = x as Record<string, unknown>;
  if (typeof o.sonido === "boolean") base.sonido = o.sonido;
  if (typeof o.movimiento === "string" && (MOVIMIENTOS as string[]).includes(o.movimiento)) {
    base.movimiento = o.movimiento as Movimiento;
  }
  return base;
}

/** Lee el aparato. Si no hay nada (o está roto), devuelve el defecto. */
export function leer(): Preferencias {
  if (typeof localStorage === "undefined") return { ...POR_DEFECTO };
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return { ...POR_DEFECTO };
    return sanear(JSON.parse(crudo));
  } catch {
    return { ...POR_DEFECTO };
  }
}

/** Guarda y avisa a quien escuche (la capa viva y los interruptores). */
export function guardar(p: Preferencias): Preferencias {
  const limpio = sanear(p);
  try {
    localStorage.setItem(CLAVE, JSON.stringify(limpio));
  } catch { /* modo privado: se queda en memoria, la casa no se rompe */ }
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent<Preferencias>(EVENTO, { detail: limpio }));
    } catch { /* nada */ }
  }
  return limpio;
}

/** Cambia una perilla y devuelve el estado nuevo (atajo de los interruptores). */
export function alternar(p: Preferencias, perilla: "sonido"): Preferencias {
  return guardar({ ...p, sonido: !p.sonido });
}

export function ponerMovimiento(p: Preferencias, m: Movimiento): Preferencias {
  return guardar({ ...p, movimiento: sanear({ ...p, movimiento: m }).movimiento });
}

/**
 * ¿Debe animarse? El sistema manda salvo que el Dueño haya elegido más o menos.
 * `sistemaQuieto` es el resultado de prefers-reduced-motion.
 */
export function debeAnimar(p: Preferencias, sistemaQuieto: boolean): boolean {
  if (p.movimiento === "quieto") return false;
  if (p.movimiento === "suave") return true; // anima lo justo, sin bucles
  return !sistemaQuieto;                     // auto
}

/** El nivel que se escribe en `<html data-vg-mov>` y que lee el CSS. */
export function nivel(p: Preferencias, sistemaQuieto: boolean): "pleno" | "suave" | "quieto" {
  if (p.movimiento === "quieto") return "quieto";
  if (p.movimiento === "suave") return "suave";
  return sistemaQuieto ? "suave" : "pleno";
}

/** Escribe las dos perillas en `<html>` (solo navegador). */
export function aplicar(p: Preferencias, sistemaQuieto: boolean): void {
  if (typeof document === "undefined") return;
  const raiz = document.documentElement;
  raiz.setAttribute("data-vg-son", p.sonido ? "1" : "0");
  raiz.setAttribute("data-vg-mov", nivel(p, sistemaQuieto));
}

/** ¿El sistema pide quietud? (solo navegador) */
export function sistemaQuieto(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
