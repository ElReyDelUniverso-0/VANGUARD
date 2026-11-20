// ══════════════════════════════════════════════════════════════════════
// v422.3 · LA MEMORIA DE VIDA — un solo sitio lee y anota impresiones
//
// Antes el carril «Para ti» era el único que anotaba. Ahora TODA superficie de
// VIDA (el carril, la órbita, la ruleta) lee y escribe aquí, así que abrir un
// módulo desde el menú también enseña. Una sola clave, un solo formato.
//
// Todo vive en el aparato. Nada viaja al servidor. Si el almacén está roto o
// el navegador está en modo privado, la casa sigue funcionando igual: se pierde
// el aprendizaje, nunca la navegación.
// ══════════════════════════════════════════════════════════════════════
import {
  leerJson,
  normalizarSenal,
  registrarVisto,
  resumenSenal,
  type Senal,
} from "./algoritmo";

export const CLAVE_VISTOS = "vx421-vida-vistos";
/** uso real de la casa (lib/nav.ts) */
export const CLAVE_USO = "vg195-atajos-usage";
/** estrellas reales (lib/favoritos-store.ts) */
export const CLAVE_FAV = "vg171-favoritos";

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

/** Las señales de este aparato, ya normalizadas. Nunca lanza. */
export function senalActual(ahora = Date.now()): Senal {
  const uso = normalizarSenal({ uso: leerJson<Record<string, number>>(leer(CLAVE_USO), {}) }).uso ?? {};
  const favoritos = normalizarSenal({ favoritos: leerJson<unknown>(leer(CLAVE_FAV), null) }).favoritos ?? [];
  const vistos = normalizarSenal({ vistos: leerJson<Record<string, number>>(leer(CLAVE_VISTOS), {}) }).vistos ?? {};
  return normalizarSenal({ uso, favoritos, vistos, ahora });
}

/** Anota una impresión. Devuelve `false` si no se pudo (modo privado). */
export function anotar(id: string, ahora = Date.now()): boolean {
  try {
    const vistos = normalizarSenal({ vistos: leerJson<Record<string, number>>(leer(CLAVE_VISTOS), {}) }).vistos ?? {};
    localStorage.setItem(CLAVE_VISTOS, JSON.stringify(registrarVisto(vistos, id, ahora)));
    return true;
  } catch {
    return false;
  }
}

/** Cuánto ha aprendido este aparato (para decirlo en la cabecera del carril). */
export function cuantoAprendido(ahora = Date.now()): { puertas: number; aperturas: number; recientes: number } {
  return resumenSenal(senalActual(ahora));
}

/** Borra lo aprendido (botón de la casa: el visitante manda). */
export function olvidarTodo(): boolean {
  try {
    localStorage.removeItem(CLAVE_VISTOS);
    return true;
  } catch {
    return false;
  }
}
