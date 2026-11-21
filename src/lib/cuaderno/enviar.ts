// ═══════════════════════════════════════════════════════════════════
// v431.6 EL CUADERNO · LA PUERTA DE ENTRADA
//
// Cualquier sala puede mandarle una pieza al cuaderno SIN que el cuaderno esté
// montado: se escribe en el mismo sitio donde el cuaderno guarda
// (`vg-cuaderno-v1`) y se avisa con `vg:cuaderno` por si está abierto al lado.
// Una sola implementación del envío para toda la casa; el `id` se genera aquí
// para que, si el cuaderno está escuchando, no se duplique la pieza.
// ═══════════════════════════════════════════════════════════════════

import { aJSON, desdeJSON, idPieza, nuevoCuaderno, poner, type Pieza } from "./modelo";

export const CLAVE_CUADERNO = "vg-cuaderno-v1";

/** Lo que una sala puede entregar. Todo lo demás lo normaliza el modelo. */
export type Encargo = {
  tipo?: Pieza["tipo"];
  titulo: string;
  cuerpo?: string;
  etiquetas?: string[];
  marca?: Pieza["marca"];
  lugar?: string;
  lat?: number;
  lng?: number;
  ruta?: string;
  fuente?: string;
  imagen?: string;
};

export type Respuesta = { ok: boolean; id?: string; motivo?: string; dentro: number };

/** Lee el cuaderno del aparato sin crearlo. Devuelve null si no hay nada legible. */
export function leerCuaderno(): ReturnType<typeof nuevoCuaderno> | null {
  if (typeof window === "undefined") return null;
  try {
    const crudo = window.localStorage.getItem(CLAVE_CUADERNO);
    if (!crudo) return null;
    return desdeJSON(crudo, Date.now());
  } catch {
    return null;
  }
}

/**
 * Anota una pieza en el cuaderno del aparato. Devuelve cuántas quedan dentro
 * para poder decirlo sin inventar («dentro: 4»).
 */
export function anotarEnCuaderno(encargo: Encargo): Respuesta {
  if (typeof window === "undefined") return { ok: false, motivo: "sin aparato", dentro: 0 };
  const base = leerCuaderno() ?? nuevoCuaderno();
  const id = idPieza(Date.now(), Math.random());
  const siguiente = poner(base, { ...encargo, id }, Date.now());
  const pieza = siguiente.piezas.find((p) => p.id === id);
  if (!pieza) return { ok: false, motivo: "la pieza venía vacía", dentro: base.piezas.length };
  try {
    window.localStorage.setItem(CLAVE_CUADERNO, aJSON(siguiente));
  } catch {
    return { ok: false, motivo: "el aparato no deja guardar", dentro: base.piezas.length };
  }
  try {
    window.dispatchEvent(new CustomEvent("vg:cuaderno", { detail: pieza }));
  } catch {
    /* sin eventos: la pieza ya está guardada */
  }
  return { ok: true, id, dentro: siguiente.piezas.length };
}

/** ¿Hay cuaderno en este aparato? Sirve para no prometer una pieza que no existe. */
export function hayCuaderno(): boolean {
  const c = leerCuaderno();
  return !!c && c.piezas.length > 0;
}
