// v89.0 OPERACIÓN ESPEJO — MOTOR DE LÍNEA DEL FRENTE (espejo del mapa de zonas
// de control diario). Teatro ficticio "VALLE DEL KARSK": 16 localidades, línea
// del frente con 11 puntos de control que se MUEVEN día a día de forma
// determinista. Reproducir la misma fecha produce el mismo mapa.
// (v53 FRENTES vive en frentes-data.ts — este módulo es el espejo v89.)

import { fnv89 } from "./pulsos-data";

export interface Localidad {
  nombre: string;
  x: number; // coords en el lienzo 0-800
  y: number;
  // control por día: 0 = ocupado, 1 = disputado, 2 = controlado
  dia: (d: number) => 0 | 1 | 2;
}

// ---- geometría base del teatro ----
export const TEATRO_W = 800;
export const TEATRO_H = 540;

// Línea del frente (dia 0 = hace 13 días): puntos base x,y de norte a sur
const BASE: [number, number][] = [
  [322, 30], [338, 88], [310, 142], [352, 198], [336, 250],
  [368, 300], [344, 356], [376, 404], [352, 452], [380, 496], [372, 530],
];

// desplazamientos por día (día 13 = hoy): el frente ondula y avanza/retrocede
function desplazamiento(dia: number, punto: number): number {
  const h = parseInt(fnv89(`frente89:${dia}:${punto}`).slice(0, 7), 36);
  const n = (h % 2000) / 1000 - 1; // -1..1
  return n * 26;
}

export function puntosFrente(dia: number): [number, number][] {
  return BASE.map(([x, y], i) => [x + desplazamiento(dia, i), y] as [number, number]);
}

/** Área aproximada bajo control enemigo (km² ficticios) al día dado. */
export function areaOcupada(dia: number): number {
  const pts = puntosFrente(dia);
  // área entre la línea y el borde derecho (x=800) por integración trapezoidal
  let area = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = Math.abs(pts[i][0] - pts[i - 1][0]);
    const xm = ((800 - pts[i][0]) + (800 - pts[i - 1][0])) / 2;
    area += xm * dx;
  }
  return Math.round(area * 0.62); // escala ficticia a km²
}

export interface DeltaDia {
  dia: number;
  delta: number; // km² perdidos(+)/recuperados(-) por el lado azul
  localidades: string[];
}

export function deltas(dias = 14): DeltaDia[] {
  const out: DeltaDia[] = [];
  for (let d = 1; d < dias; d++) {
    const a = areaOcupada(d - 1);
    const b = areaOcupada(d);
    const delta = b - a;
    const locs: string[] = [];
    if (Math.abs(delta) > 90) {
      const h = fnv89("loc89:" + d);
      const n = 1 + (h.charCodeAt(0) % 2);
      for (let i = 0; i < n; i++) {
        locs.push(LOCALIDADES[(h.charCodeAt(i + 1) * 7 + i * 3) % LOCALIDADES.length].nombre);
      }
    }
    out.push({ dia: d, delta, localidades: locs });
  }
  return out;
}

export const LOCALIDADES: { nombre: string; x: number; y: number; controlBase: 0 | 1 | 2 }[] = [
  { nombre: "Novopavlivka", x: 132, y: 74, controlBase: 2 },
  { nombre: "Kramatorsk", x: 218, y: 128, controlBase: 2 },
  { nombre: "Stepnohirsk", x: 96, y: 210, controlBase: 2 },
  { nombre: "Orikhiv", x: 172, y: 262, controlBase: 2 },
  { nombre: "Hulyaipole", x: 244, y: 318, controlBase: 2 },
  { nombre: "Vuhledar", x: 118, y: 372, controlBase: 2 },
  { nombre: "Bakmut Sur", x: 210, y: 428, controlBase: 2 },
  { nombre: "Odradivka", x: 148, y: 496, controlBase: 2 },
  { nombre: "Svatove", x: 448, y: 58, controlBase: 0 },
  { nombre: "Kreminna", x: 512, y: 120, controlBase: 0 },
  { nombre: "Bilohorivka", x: 452, y: 186, controlBase: 1 },
  { nombre: "Soledar Norte", x: 530, y: 236, controlBase: 0 },
  { nombre: "Bakhmut Este", x: 470, y: 296, controlBase: 1 },
  { nombre: "Avdiivka", x: 548, y: 350, controlBase: 0 },
  { nombre: "Pisky", x: 492, y: 412, controlBase: 0 },
  { nombre: "Volnovakha", x: 566, y: 480, controlBase: 0 },
];

/** Control de una localidad al día dado (la línea la arrastra). */
export function controlDe(loc: (typeof LOCALIDADES)[number], dia: number): 0 | 1 | 2 {
  const pts = puntosFrente(dia);
  // x de la línea a la altura y de la localidad (interp)
  let xLinea = 400;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    if (loc.y >= y0 && loc.y <= y1) {
      const t = (loc.y - y0) / Math.max(1, y1 - y0);
      xLinea = x0 + t * (x1 - x0);
      break;
    }
  }
  const d = loc.x - xLinea;
  if (d > 55) return 0; // claramente al este de la línea
  if (d > -20) return 1; // franja gris
  return 2;
}

export const EJES_PRESION = [
  { nombre: "Eje Norte — Svatove", x: 430, y: 40, dir: -1, fuerza: 0.62 },
  { nombre: "Eje Central — Bakhmut", x: 452, y: 270, dir: -1, fuerza: 0.5 },
  { nombre: "Eje Sur — Vuhledar", x: 420, y: 500, dir: -1, fuerza: 0.34 },
] as const;
