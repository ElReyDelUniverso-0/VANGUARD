// ═══════════════════════════════════════════════════════════════════
// v439.2 · LA MÚSICA DE LA FERIA — alegre, con campanas y a 120
//
// El Dueño, textual: «que sea un lugar como una feria, una música feliz con
// luces parpadeando». La contradanza tranquila de v437.2 se queda como estaba
// en el corazón (la melodía sigue pegada) pero se sube a **120 pulsos**, se le
// añade **segunda voz**, **bajo a dos tiempos** (el «om-pa» de feria), un
// acorde en los tiempos flojos, una **campana en cada compás** y una pandereta
// en las corcheas. La vuelta dura 16 s y vuelve a empezar.
//
// REGLAS DE LA CASA QUE ESTA MÚSICA RESPETA:
//   · Sin assets: no hay mp3, ni wav, ni URL. Se sintetiza con lib/sound.ts.
//   · Sin AudioContext propio: se toca con el motor compartido de la casa.
//   · Ganancias bajas (≤ 0,09 y aquí ≤ 0,03) y registro medio: se oye, no
//     atruena. Nada suena solo: hace falta un toque.
//   · Este archivo es PURO (datos + cuentas): se prueba en node sin navegador.
// ═══════════════════════════════════════════════════════════════════

import type { NotaVoz } from "@/lib/sound";

/** Pulsos por minuto. A 120, el pulso dura 0,5 s y un compás de 4/4 dura 2 s. */
export const BPM = 120;
export const PULSOS_POR_COMPAS = 4;
/** Segundos que dura un pulso. */
export const SEGUNDO_POR_PULSO = 60 / BPM;
/** Segundos que dura un compás (2 s). */
export const DURACION_COMPAS = PULSOS_POR_COMPAS * SEGUNDO_POR_PULSO;
/** Compases de la vuelta. */
export const TOTAL_COMPASES = 8;
/** Lo que tarda la feria en volver a empezar (16 s). */
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
  // La4 = 440 Hz es el ancla: el semitono 0 es La, no Do.
  const semis = (SEMITONOS[`${m[1]}${m[2]}`] ?? 9) + (Number(m[3]) - 4) * 12 - 9;
  return Math.round(440 * Math.pow(2, semis / 12) * 100) / 100;
}

/** [nota, pulsos que dura] */
type Golpe = [string, number];

/**
 * La melodía, compás a compás: negras y corcheas, saltarina, en Do mayor.
 * El gancho sigue en el compás 4 (Do5 · Sol4 · Mi4 · Do4) y remata en el 8.
 */
const MELODIA: Golpe[][] = [
  [["Do5", 0.5], ["Sol4", 0.5], ["Mi4", 0.5], ["Sol4", 0.5], ["Do5", 1], ["Mi5", 1]],
  [["Re5", 0.5], ["Si4", 0.5], ["Sol4", 1], ["Re5", 1], ["Si4", 1]],
  [["Mi5", 0.5], ["Do5", 0.5], ["Sol4", 1], ["Do5", 1], ["Mi5", 1]],
  [["Do5", 1], ["Sol4", 1], ["Mi4", 1], ["Do4", 1]],
  [["Fa4", 0.5], ["La4", 0.5], ["Do5", 1], ["La4", 1], ["Fa4", 1]],
  [["Sol4", 0.5], ["Si4", 0.5], ["Re5", 1], ["Si4", 1], ["Sol4", 1]],
  [["Mi5", 0.5], ["Re5", 0.5], ["Do5", 0.5], ["Si4", 0.5], ["Do5", 2]],
  [["Do5", 1], ["Sol4", 1], ["Do5", 1], ["Mi5", 1]],
];

/** El bajo a dos tiempos: [pulso 1, pulso 3]. Fundamental y quinta. */
const BAJOS: [string, string][] = [
  ["Do3", "Sol3"],
  ["Sol3", "Re4"],
  ["Do3", "Sol3"],
  ["Do3", "Sol3"],
  ["Fa3", "Do4"],
  ["Sol3", "Re4"],
  ["Do3", "Sol3"],
  ["Do3", "Sol3"],
];

/** El acorde de los tiempos flojos (2 y 4): el «pa» del om-pa. */
const ACORDES: string[][] = [
  ["Mi4", "Do5"],
  ["Re4", "Si4"],
  ["Mi4", "Sol4"],
  ["Mi4", "Do5"],
  ["La4", "Fa4"],
  ["Si4", "Re5"],
  ["Sol4", "Si4"],
  ["Mi4", "Sol4"],
];

/** El grado de cada compás, para poder leer la armonía en pantalla. */
const GRADOS = ["I", "V", "I", "I", "IV", "V", "I", "I"];

/** La vuelta va de Do3 a Mi5: ni un extremo, ni un chillido. */
export const TECHO_HZ = 1200;
export const SUELO_HZ = 80;

function dentroDeRango(f: number): number {
  return Math.max(SUELO_HZ, Math.min(TECHO_HZ, f));
}

/** Un compás, con todas sus voces puestas en su sitio. */
export function notasDeCompas(indice: number): NotaVoz[] {
  const i = ((Math.trunc(indice) % TOTAL_COMPASES) + TOTAL_COMPASES) % TOTAL_COMPASES;
  const melodia = MELODIA[i];
  const bajo = BAJOS[i];
  const acorde = ACORDES[i];
  const notas: NotaVoz[] = [];

  // la melodía — triángulo, con un poco de sala: caja de música de feria
  let pulso = 0;
  for (const [nombre, largos] of melodia) {
    notas.push({
      tipo: "tono",
      f: dentroDeRango(hz(nombre)),
      d: Math.max(0.12, largos * SEGUNDO_POR_PULSO * 0.88),
      g: 0.026,
      cuando: pulso * SEGUNDO_POR_PULSO,
      onda: "triangle",
      verb: 0.12,
    });
    pulso += largos;
  }

  // el bajo del om-pa — madera: pulsos 1 y 3
  notas.push({ tipo: "madera", f: dentroDeRango(hz(bajo[0])), d: 0.42, g: 0.03, cuando: 0 });
  notas.push({ tipo: "madera", f: dentroDeRango(hz(bajo[1])), d: 0.38, g: 0.026, cuando: 2 * SEGUNDO_POR_PULSO });

  // el «pa»: acorde corto en los tiempos flojos, muy por debajo
  for (const p of [1, 3]) {
    for (const n of acorde) {
      notas.push({ tipo: "tono", f: dentroDeRango(hz(n)), d: 0.16, g: 0.012, cuando: p * SEGUNDO_POR_PULSO, onda: "square", verb: 0.06 });
    }
  }

  // la pandereta de feria: corcheas, dos niveles
  for (let c = 0; c < PULSOS_POR_COMPAS * 2; c++) {
    notas.push({ tipo: "ruido", d: 0.035, g: c % 2 === 0 ? 0.005 : 0.003, cuando: (c * SEGUNDO_POR_PULSO) / 2 });
  }

  // la campana: una por compás, más alta en la entrada de cada frase
  notas.push({
    tipo: "campana",
    f: dentroDeRango(hz(i === 0 || i === 4 ? "Do5" : i % 2 === 0 ? "Sol5" : "Mi5")),
    d: i === 0 || i === 4 ? 0.7 : 0.45,
    g: i === 0 || i === 4 ? 0.02 : 0.013,
    cuando: 0,
  });

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

/** Cuántas notas suenan en una vuelta. */
export const NOTAS_POR_VUELTA = melodiaCompleta().length;
