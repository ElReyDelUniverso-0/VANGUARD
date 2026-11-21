// ═══════════════════════════════════════════════════════════════════
// v437.2 · LA MÚSICA DE LA PLAZA — una contradanza que se queda
//
// Orden del Dueño: «con una música clásica sencilla y que se te quede en la
// cabeza». Esto es lo que hay aquí: una contradanza compuesta en la casa, en
// Do mayor, de ocho compases, con la melodía en triángulo, el bajo de madera
// en los pulsos 1 y 3 (contrabajo de plaza) y una campana en las dos entradas
// —lo que hace que el oído sepa que la vuelta empieza otra vez—.
//
// El gancho está en los compases 4 y 8: Do5 · Sol4 · Mi4 · Do4, y el remate
// Do5 · Sol4 · Do5. Es corto a propósito: se tararea en una vuelta.
//
// REGLAS DE LA CASA QUE ESTA MÚSICA RESPETA:
//   · Sin assets: no hay mp3, ni wav, ni URL. Se sintetiza con lib/sound.ts.
//   · Sin AudioContext propio: se toca con el motor compartido de la casa.
//   · Ganancias bajas (≤ 0,09 y aquí ≤ 0,03) y registro medio: se oye, no
//     atruena. Nada suena solo: hace falta un toque.
//   · Este archivo es PURO (datos + cuentas): se prueba en node sin navegador.
// ═══════════════════════════════════════════════════════════════════

import type { NotaVoz } from "@/lib/sound";

/** Pulsos por minuto. A 100, el pulso dura 0,6 s y un compás de 4/4 dura 2,4 s. */
export const BPM = 100;
export const PULSOS_POR_COMPAS = 4;
/** Segundos que dura un pulso. */
export const SEGUNDO_POR_PULSO = 60 / BPM;
/** Segundos que dura un compás (2,4 s). */
export const DURACION_COMPAS = PULSOS_POR_COMPAS * SEGUNDO_POR_PULSO;
/** Compases de la vuelta. */
export const TOTAL_COMPASES = 8;
/** Lo que tarda la contradanza en volver a empezar (19,2 s). */
export const DURACION_VUELTA = TOTAL_COMPASES * DURACION_COMPAS;

const SEMITONOS: Record<string, number> = {
  Do: 0,
  "Do#": 1,
  Re: 2,
  "Re#": 3,
  Mi: 4,
  Fa: 5,
  "Fa#": 6,
  Sol: 7,
  "Sol#": 8,
  La: 9,
  "La#": 10,
  Si: 11,
};

/**
 * De nombre a hercios, en temperamento igual con La4 = 440 Hz. Acepta los
 * nombres que usa la casa («Do4», «Sol#5»). Si el nombre no existe devuelve
 * 440 para que una nota mal escrita no rompa la vuelta entera.
 */
export function hz(nombre: string): number {
  const m = /^(Do|Re|Mi|Fa|Sol|La|Si)(#?)(-?\d)$/.exec((nombre || "").trim());
  if (!m) return 440;
  // La4 = 440 Hz es el ancla: el semitono 0 es La, no Do. Con esto Do4 sale
  // 261,63 y Do5 523,25 — las cuentas de verdad, no un número a ojo.
  const semis = (SEMITONOS[`${m[1]}${m[2]}`] ?? 9) + (Number(m[3]) - 4) * 12 - 9;
  return Math.round(440 * Math.pow(2, semis / 12) * 100) / 100;
}

/** [nota, pulsos que dura] */
type Golpe = [string, number];

/**
 * La melodía, compás a compás. Cuatro negras por compás salvo donde la frase
 * pide aire (compás 2 y 8): el fraseo es lo que la vuelve cantable.
 */
const MELODIA: Golpe[][] = [
  [["Do5", 1], ["La4", 1], ["Sol4", 1], ["Mi4", 1]],
  [["Sol4", 1.5], ["Mi4", 0.5], ["Do4", 2]],
  [["Re5", 1], ["Si4", 1], ["Sol4", 1], ["Re4", 1]],
  [["Do5", 1], ["Sol4", 1], ["Mi4", 1], ["Do4", 1]],
  [["Mi4", 1], ["Sol4", 1], ["Do5", 1], ["Sol4", 1]],
  [["Fa4", 1], ["La4", 1], ["Do5", 1], ["La4", 1]],
  [["Re5", 1], ["Si4", 1], ["Sol4", 1], ["Si4", 1]],
  [["Do5", 2], ["Sol4", 1], ["Do5", 1]],
];

/** El bajo, por compás: [pulso 1, pulso 3]. Fundamental y quinta. */
const BAJOS: [string, string][] = [
  ["Do3", "Sol3"],
  ["Do3", "Sol3"],
  ["Sol3", "Re4"],
  ["Do3", "Sol3"],
  ["Do3", "Sol3"],
  ["Fa3", "Do4"],
  ["Sol3", "Re4"],
  ["Do3", "Sol3"],
];

/** El grado de cada compás, para poder leer la armonía en pantalla. */
const GRADOS = ["I", "I", "V", "I", "I", "IV", "V", "I"];

/** La vuelta va de Do3 a Do5: ni un extremo, ni un chillido. */
export const TECHO_HZ = 1200;
export const SUELO_HZ = 80;

function dentroDeRango(f: number): number {
  return Math.max(SUELO_HZ, Math.min(TECHO_HZ, f));
}

/** Un compás, con sus notas puestas en su sitio dentro del compás. */
export function notasDeCompas(indice: number): NotaVoz[] {
  const i = ((Math.trunc(indice) % TOTAL_COMPASES) + TOTAL_COMPASES) % TOTAL_COMPASES;
  const melodia = MELODIA[i];
  const bajo = BAJOS[i];
  const notas: NotaVoz[] = [];

  // la melodía — triángulo, con un poco de sala: suena a caja de música grande
  let pulso = 0;
  for (const [nombre, largos] of melodia) {
    const f = dentroDeRango(hz(nombre));
    notas.push({
      tipo: "tono",
      f,
      d: Math.max(0.14, largos * SEGUNDO_POR_PULSO * 0.9),
      g: 0.024,
      cuando: pulso * SEGUNDO_POR_PULSO,
      onda: "triangle",
      verb: 0.12,
    });
    pulso += largos;
  }

  // el bajo — madera: dos golpes, pulsos 1 y 3
  notas.push({ tipo: "madera", f: dentroDeRango(hz(bajo[0])), d: 0.5, g: 0.03, cuando: 0 });
  notas.push({ tipo: "madera", f: dentroDeRango(hz(bajo[1])), d: 0.45, g: 0.026, cuando: 2 * SEGUNDO_POR_PULSO });

  // la pandereta de la plaza — en los pulsos 2 y 4, y muy por debajo
  for (const p of [1, 3]) notas.push({ tipo: "ruido", d: 0.05, g: 0.007, cuando: p * SEGUNDO_POR_PULSO });

  // la campana de la entrada: compases 1 y 5 (los dos arranques de frase)
  if (i === 0 || i === 4) {
    notas.push({ tipo: "campana", f: dentroDeRango(hz(i === 0 ? "Do5" : "Mi5")), d: 0.8, g: 0.018, cuando: 0 });
  }

  return notas;
}

/** La vuelta entera de una vez (para la prueba y para escuchar de golpe). */
export function melodiaCompleta(): NotaVoz[] {
  const salida: NotaVoz[] = [];
  for (let i = 0; i < TOTAL_COMPASES; i++) {
    for (const n of notasDeCompas(i)) {
      salida.push({ ...n, cuando: (n.cuando ?? 0) + i * DURACION_COMPAS });
    }
  }
  return salida;
}

/** La melodía escrita, compás a compás — para que nadie tenga que fiarse del oído. */
export function partitura(): string[] {
  return MELODIA.map((compas) => compas.map(([nombre]) => nombre).join(" · "));
}

/** El grado armónico de un compás («I», «IV», «V»). */
export function nombreDeGrado(indice: number): string {
  const i = ((Math.trunc(indice) % TOTAL_COMPASES) + TOTAL_COMPASES) % TOTAL_COMPASES;
  return GRADOS[i] ?? "I";
}

/** Cuántas notas suenan en una vuelta (la prueba lo usa como medida). */
export const NOTAS_POR_VUELTA = melodiaCompleta().length;
