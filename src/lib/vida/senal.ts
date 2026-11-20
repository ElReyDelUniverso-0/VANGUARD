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
  const mios = normalizarSenal({ mios: leerJson<unknown>(leer(CLAVE_MIOS), []) }).mios ?? [];
  return normalizarSenal({ uso, favoritos, mios, vistos, ahora });
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

/** Tus estrellas de VIDA (las de esta capa, no las de la casa). */
export function misFavoritos(): string[] {
  return normalizarSenal({ mios: leerJson<unknown>(leer(CLAVE_MIOS), []) }).mios ?? [];
}

/** Marca o suelta una puerta. Devuelve el estado final; nunca lanza. */
export function alternarFavorito(id: string): boolean {
  try {
    const previos = misFavoritos();
    const esta = previos.includes(id);
    const siguiente = esta ? previos.filter((x) => x !== id) : [...previos, id].slice(-60);
    localStorage.setItem(CLAVE_MIOS, JSON.stringify(siguiente));
    return !esta;
  } catch {
    return false;
  }
}

/** La última puerta que abriste y cuándo (para «seguir donde lo dejaste»). */
export function ultimaPuerta(ahora = Date.now()): { id: string; hace: number } | null {
  const vistos = senalActual(ahora).vistos ?? {};
  let mejor: { id: string; hace: number } | null = null;
  for (const [id, t] of Object.entries(vistos)) {
    if (!Number.isFinite(t)) continue;
    const hace = Math.max(0, ahora - t);
    if (!mejor || hace < mejor.hace) mejor = { id, hace };
  }
  return mejor;
}

/** Las últimas N puertas distintas que abriste, de la más reciente a la más vieja. */
export function recientes(cuantas = 3, ahora = Date.now()): { id: string; hace: number }[] {
  const vistos = senalActual(ahora).vistos ?? {};
  return Object.entries(vistos)
    .filter(([, t]) => Number.isFinite(t))
    .map(([id, t]) => ({ id, hace: Math.max(0, ahora - t) }))
    .sort((a, b) => a.hace - b.hace)
    .slice(0, cuantas);
}
