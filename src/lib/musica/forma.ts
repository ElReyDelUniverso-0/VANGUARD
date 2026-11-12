// ============================================================
// v367.3 LA MÚSICA CON FORMA — EL ARQUITECTO (lib/musica/forma.ts)
//
// El Dueño fue preciso en la queja: «la música larga es fea y no tiene
// forma, se deforma con el tiempo». No era el reloj (el motor viejo ya
// resincronizaba): era la COMPOSICIÓN. Una pieza sin secciones fijas, sin
// motivo que vuelva y sin compás que se repita se convierte en niebla: a
// los dos minutos el oído ya no reconoce nada y suena a relleno.
//
// Este archivo es la ley de la forma, y es PURA (cero Web Audio, cero
// DOM, cero azar): se puede probar con la suite y da siempre lo mismo.
//
// LAS CUATRO LEYES DE LA CASA MUSICAL
//  ① EL SELLO DE CUATRO NOTAS. Toda pieza de Vanguard canta el mismo
//     motivo. Se oye una vez y ya sabes de quién es. Es lo que hace que
//     una música sea «inolvidable y siempre reconocible».
//  ② FORMA A-B-A. Presenta, contrasta, vuelve. Lo que vuelve es lo que
//     se recuerda; sin vuelta, la pieza se deshace.
//  ③ NADA DE DERIVA. El tiempo de cada nota se calcula desde un ANCLA y
//     un número de paso exacto (ancla + paso × duración), nunca sumando
//     retardos. Sumar es lo que deforma: un milisegundo perdido por nota
//     son segundos perdidos en dos minutos.
//  ④ COMPÁS FIJO Y CUANTIZADO. Todo cae en la rejilla de 16 pasos por
//     compás. El swing se aplica como desplazamiento MEDIDO, no como
//     azar.
// ============================================================

/** El sello de la casa: cuatro notas en grados del acorde (0 = raíz). */
export const SELLO: number[] = [0, 0, 4, 7];

/** Nombres de las secciones: lo que el oído distingue. */
export type NombreSeccion = "intro" | "A" | "B" | "A2" | "puente" | "final";

export type Instrumento =
  | "pad"
  | "bajo"
  | "arpa"
  | "metal"
  | "coro"
  | "timpano"
  | "bombo"
  | "caja"
  | "charles"
  | "platillo";

/** Una capa: 16 pasos por compás. `-1` = silencio. Valores = grado del acorde. */
export interface Capa {
  inst: Instrumento;
  /** 16 valores: grado (0=raíz, 1=tercera, 2=quinta, 3=octava, 4=décima) o -1 */
  patron: number[];
  /** 0–1 */
  gain: number;
  /** solo válido en percusión: acento del paso (por defecto 1) */
  acento?: number[];
}

export interface Seccion {
  nombre: NombreSeccion;
  compases: number;
  /** acordes por compás, en semitonos relativos a la raíz (0 = raíz) */
  acordes: number[][];
  capas: Capa[];
}

export interface Pieza {
  id: string;
  nombre: string;
  lema: string;
  familia: "himno" | "tributo" | "militar" | "casa";
  bpm: number;
  /** Hz de la raíz del registro grave (la 2ª octava) */
  raiz: number;
  swing: number;
  secciones: Seccion[];
  /** la nota de honestidad que la sala pinta junto a la pieza */
  nota: string;
  /** a quién se le debe el pulso, si es un tributo (ritmo y forma, nunca melodía) */
  tributoA?: string;
}

// ── Conversión de grados a semitonos ──────────────────────
// 0=raíz · 1=tercera (según el acorde) · 2=quinta · 3=octava · 4=décima
const GRADO_SEMI = [0, -1, 7, 12, 16]; // el 1 se resuelve con el acorde

export function semitonosDeGrado(acorde: number[], grado: number): number {
  const base = acorde[0] ?? 0;
  if (grado === 1) {
    const tercera = acorde[1] ?? base + 4;
    return tercera - base;
  }
  const fijo = GRADO_SEMI[grado] ?? 0;
  return fijo;
}

export function frecuencia(raiz: number, semitonos: number): number {
  return raiz * Math.pow(2, semitonos / 12);
}

/** Acordes de la casa (semitonos sobre la raíz). */
export const ACORDES = {
  menor: [0, 3, 7],
  mayor: [0, 4, 7],
  menor7: [0, 3, 7, 10],
  mayor7: [0, 4, 7, 11],
  sus: [0, 5, 7],
  mayorOctava: [0, 4, 7, 12],
  menorOctava: [0, 3, 7, 12],
};

// ── La rejilla ────────────────────────────────────────────
export const PASOS_POR_COMPAS = 16;

export interface Compas {
  /** índice absoluto del compás desde el arranque */
  idx: number;
  /** índice de la sección a la que pertenece */
  seccion: number;
  nombre: NombreSeccion;
  /** cuántos compases lleva dentro de su sección (0-based) */
  dentro: number;
  acorde: number[];
  /** el compás es el último de su sección (lleva relleno) */
  cierre: boolean;
  /** el compás es el primero de la sección (lleva entrada) */
  entrada: boolean;
}

/**
 * Expande las secciones de una pieza en la lista de compases que se van a
 * tocar. Es determinista: la misma pieza da siempre la misma lista, y por
 * eso la pieza puede durar veinte minutos sin perder la forma — cada vuelta
 * se sabe en qué sección está.
 */
export function armarForma(pieza: Pieza): Compas[] {
  const compases: Compas[] = [];
  pieza.secciones.forEach((sec, si) => {
    for (let i = 0; i < sec.compases; i++) {
      const acorde = sec.acordes[i % sec.acordes.length] ?? ACORDES.menor;
      compases.push({
        idx: compases.length,
        seccion: si,
        nombre: sec.nombre,
        dentro: i,
        acorde,
        cierre: i === sec.compases - 1,
        entrada: i === 0,
      });
    }
  });
  return compases;
}

/** Duración exacta de un paso, en segundos. */
export function duracionPaso(bpm: number): number {
  return 60 / bpm / 4;
}

/**
 * LA LEY CONTRA LA DERIVA: el instante de un paso se calcula SIEMPRE
 * desde el ancla. Nunca se acumula tiempo. Este es el corazón del
 * arreglo del «se deforma con el tiempo».
 */
export function instanteDePaso(ancla: number, paso: number, bpm: number): number {
  return ancla + paso * duracionPaso(bpm);
}

/** Duración total de una pieza (una vuelta completa), en segundos. */
export function duracionPieza(pieza: Pieza): number {
  const compases = armarForma(pieza).length;
  return compases * PASOS_POR_COMPAS * duracionPaso(pieza.bpm);
}

/** Duración hablada: «un minuto y veinte segundos». */
export function duracionLegible(seg: number): string {
  const total = Math.round(seg);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s} segundos`;
  if (s === 0) return m === 1 ? "un minuto" : `${m} minutos`;
  return m === 1 ? `un minuto y ${s} segundos` : `${m} minutos y ${s} segundos`;
}

/**
 * El sello de la casa como melodía completa de 16 pasos: el motivo, un
 * respiro, y el motivo otra vez. Tres apariciones por compás es lo que
 * hace que se pegue (el oído necesita repetición para memorizar).
 */
export function selloEn16(): number[] {
  const p = new Array(16).fill(-1);
  p[0] = SELLO[0];
  p[2] = SELLO[1];
  p[4] = SELLO[2];
  p[6] = SELLO[3];
  p[10] = SELLO[2];
  p[12] = SELLO[1];
  p[14] = SELLO[0];
  return p;
}

/** Variante del sello para el puente: las mismas notas, otras alturas. */
export function selloVariante(): number[] {
  const p = new Array(16).fill(-1);
  p[0] = SELLO[0];
  p[3] = SELLO[2];
  p[6] = SELLO[1];
  p[8] = SELLO[3];
  p[11] = SELLO[1];
  p[14] = SELLO[0];
  return p;
}

/** Rejilla para percusión: pasos encendidos → -1/0 (0 = golpe). */
export function golpes(...pasos: number[]): number[] {
  const p = new Array(16).fill(-1);
  for (const x of pasos) if (x >= 0 && x < 16) p[x] = 0;
  return p;
}
