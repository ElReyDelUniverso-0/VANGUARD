// ═══════════════════════════════════════════════════════════════════
// v438.1 · EL PREGÓN DE LA PLAZA — diez voces que cantan lo que venden
//
// Orden del Dueño: «que se te quede en la cabeza». Un mercado sin pregón no es
// un mercado: aquí hay una cinta en la entrada que va soltando, uno por uno, lo
// que cada puesto tiene. No es publicidad inventada: cada línea se compone de
// los datos reales del puesto (familia, mercader, oficio, lema y número de
// secciones). Si mañana cambia una familia, el pregón cambia solo.
//
// Este archivo es PURO (datos + cuentas): se prueba en node sin navegador.
// ═══════════════════════════════════════════════════════════════════

import { PUESTOS, type Puesto } from "./puestos";

/** Cada cuántos segundos pasa el pregón al siguiente puesto. */
export const SEGUNDOS_PREGON = 7;

export type Pregon = {
  /** lo que dice la cinta, en una línea */
  texto: string;
  /** de quién es el pregón (para el enlace y para el color) */
  puesto: Puesto;
  /** a dónde lleva tocarlo: al puesto abierto, no a la familia a secas */
  href: string;
};

/** Las diez líneas del pregón, derivadas de los puestos (nada escrito a mano). */
export function pregones(): Pregon[] {
  return PUESTOS.map((p) => ({
    texto: `¡${p.nombre}! ${p.personaje.nombre}, ${p.personaje.oficio}: ${p.lema.toLowerCase()} — ${p.secciones.length} secciones abiertas.`,
    puesto: p,
    href: `/mercado#puesto-${p.id}`,
  }));
}

/** El pregón de una vuelta: índice que da la vuelta sin romperse. */
export function pregonDe(indice: number): Pregon {
  const cinta = pregones();
  const i = ((Math.trunc(indice) % cinta.length) + cinta.length) % cinta.length;
  return cinta[i];
}

/** El pregón del día: rota con el día, sin azar y sin base de datos. */
export function pregonDelDia(fecha: Date = new Date()): Pregon {
  const dias = Math.floor(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) / 86400000);
  return pregonDe(dias);
}
