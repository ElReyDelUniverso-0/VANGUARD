// ═══════════════════════════════════════════════════════════════════
// v440.3 · LA MÚSICA SUAVE DEL MERCADO — la feria baja la voz
//
// El Dueño, textual: «…y una música suave». La contradanza de 120 ppm con
// pandereta y campanas era una feria de verbena; esto es la misma casa a media
// tarde: 64 pulsos, sin percusión, sin campanas, acordes largos de pad y una
// línea de melodía que deja silencios. La vuelta dura 30 s y no cansa porque
// casi no pasa nada: eso es lo que la hace suave.
//
// REGLAS DE LA CASA (las mismas de `musica.ts`):
//   · sin assets: se sintetiza con el motor compartido de lib/sound;
//   · sin AudioContext propio y sin sonar solo: hace falta un toque;
//   · ganancias muy bajas (aquí ≤ 0,024): se oye, no atruena;
//   · archivo PURO (datos + cuentas): se prueba en node.
// ═══════════════════════════════════════════════════════════════════

import type { NotaVoz } from "@/lib/sound";
import { hz } from "./musica";

/** Pulsos por minuto. A 64 el pulso dura 0,9375 s: ritmo de paseo. */
export const BPM_SUAVE = 64;
export const PULSOS_SUAVE = 4;
export const SEGUNDO_POR_PULSO_SUAVE = 60 / BPM_SUAVE;
export const DURACION_COMPAS_SUAVE = PULSOS_SUAVE * SEGUNDO_POR_PULSO_SUAVE;
/** Compases de la vuelta: 8 (30 s). */
export const TOTAL_COMPASES_SUAVE = 8;
export const DURACION_VUELTA_SUAVE = TOTAL_COMPASES_SUAVE * DURACION_COMPAS_SUAVE;

/**
 * La armonía, compás a compás, en Do mayor y sin sobresaltos:
 * I · vi · IV · V · I · IV · V · I. Cada acorde, tres voces de pad.
 */
const ACORDES: string[][] = [
  ["Do4", "Mi4", "Sol4"],
  ["La3", "Do4", "Mi4"],
  ["Fa3", "La3", "Do4"],
  ["Sol3", "Si3", "Re4"],
  ["Do4", "Mi4", "Sol4"],
  ["Fa3", "La3", "Do4"],
  ["Sol3", "Si3", "Re4"],
  ["Do4", "Mi4", "Sol4"],
];

/** El bajo: una nota por compás, la fundamental, con la octava de apoyo. */
const BAJOS = ["Do2", "La2", "Fa2", "Sol2", "Do2", "Fa2", "Sol2", "Do2"];

/**
 * La melodía: poca cosa, a propósito. [nota, pulso en que entra, pulso que dura]
 * Los compases 3 y 7 se quedan casi en silencio (sólo el pad): el descanso es
 * parte de la música.
 */
const MELODIA: [string, number, number][][] = [
  [["Mi5", 0, 1.5], ["Re5", 2, 1]],
  [["Do5", 0, 2]],
  [["Sol4", 1, 1.5]],
  [["La4", 0, 1], ["Si4", 2, 1.5]],
  [["Do5", 0, 1.5], ["Mi5", 2, 1]],
  [["Re5", 0, 1], ["Do5", 1.5, 1.5]],
  [["Si4", 1, 1]],
  [["Do5", 0, 2.5]],
];

/** Un compás de la versión suave, con sus tres capas y nada más. */
export function notasDeCompasSuave(indice: number): NotaVoz[] {
  const i = ((Math.trunc(indice) % TOTAL_COMPASES_SUAVE) + TOTAL_COMPASES_SUAVE) % TOTAL_COMPASES_SUAVE;
  const notas: NotaVoz[] = [];
  const compas = DURACION_COMPAS_SUAVE;

  // 1 · el pad: el acorde entero, casi todo el compás, con sala larga
  for (const nombre of ACORDES[i]) {
    notas.push({
      tipo: "tono",
      f: hz(nombre),
      d: compas * 0.96,
      g: 0.011,
      cuando: 0,
      onda: "sine",
      verb: 0.42,
    });
  }

  // 2 · el bajo: dos notas, fundamental y quinta, muy por debajo
  notas.push({ tipo: "tono", f: hz(BAJOS[i]), d: compas * 0.8, g: 0.019, cuando: 0, onda: "sine", verb: 0.2 });
  notas.push({
    tipo: "tono",
    f: hz(BAJOS[i].replace(/\d/, (d) => String(Number(d) + 1))),
    d: compas * 0.5,
    g: 0.012,
    cuando: compas * 0.5,
    onda: "sine",
    verb: 0.2,
  });

  // 3 · la melodía: una o dos notas, con la cola larga
  for (const [nombre, entrada, largos] of MELODIA[i]) {
    notas.push({
      tipo: "tono",
      f: hz(nombre),
      d: Math.max(0.5, largos * SEGUNDO_POR_PULSO_SUAVE * 0.9),
      g: 0.024,
      cuando: entrada * SEGUNDO_POR_PULSO_SUAVE,
      onda: "triangle",
      verb: 0.5,
    });
  }

  return notas;
}

/** La vuelta entera, de una vez (para la prueba y para el que quiera oírla). */
export function melodiaSuaveCompleta(): NotaVoz[] {
  const salida: NotaVoz[] = [];
  for (let i = 0; i < TOTAL_COMPASES_SUAVE; i++) {
    for (const n of notasDeCompasSuave(i)) {
      salida.push({ ...n, cuando: (n.cuando ?? 0) + i * DURACION_COMPAS_SUAVE });
    }
  }
  return salida;
}

/** La melodía escrita, compás a compás — para que nadie dependa del oído. */
export function partituraSuave(): string[] {
  return MELODIA.map((c) => (c.length === 0 ? "—" : c.map(([n]) => n).join(" · ")));
}

/** Cuántas notas suenan en una vuelta. */
export const NOTAS_POR_VUELTA_SUAVE = melodiaSuaveCompleta().length;

/** La ganancia máxima de una vuelta: la casa exige que nunca atruene. */
export const GANANCIA_MAXIMA_SUAVE = Math.max(...melodiaSuaveCompleta().map((n) => n.g));
