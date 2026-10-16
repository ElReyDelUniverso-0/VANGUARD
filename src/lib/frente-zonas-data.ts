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

// ============================================================
// v118.0 CRONOATLAS — LA MÁQUINA DEL TIEMPO REALISTA
// La campaña del Karsk pasa de 14 a 21 días y el teatro gana
// CAPAS DE INFORMACIÓN deterministas: clima diario, estadísticas
// de campaña (bajas, fuego, drones, convoyes, moral), despachos
// del frente escritos por la casa, terreno (río, carreteras,
// contornos, puente) y marcadores de eventos en la línea de tiempo.
// Reproducir el mismo día produce el MISMO mapa y el MISMO parte.
// ============================================================

export const DIAS_CAMPANA = 21; // días 0..20 — 20 es HOY
export const DIA_HOY = DIAS_CAMPANA - 1;

// v118 FIX: fnv89 devuelve base-36 de 1 a 7 caracteres — charCodeAt(i) fuera
// de rango da NaN (cazó en vivo: la barra de moral animaba a "NaN%").
// Accesor seguro: envuelve el índice y cae a '0' si no hay nada.
function ch(h: string, i: number): number {
  const c = h.charCodeAt(i % Math.max(1, h.length));
  return Number.isFinite(c) && c > 0 ? c : 48;
}

/** Fases canónicas de la campaña de 21 días (el panel las pinta como saltos). */
export const FASES_CAMPANA = [
  { titulo: "La marea del norte", de: 0, hasta: 6 },
  { titulo: "El pulso del este", de: 7, hasta: 13 },
  { titulo: "La semana decisiva", de: 14, hasta: 20 },
] as const;

export function faseDe(dia: number): (typeof FASES_CAMPANA)[number] {
  return FASES_CAMPANA.find((f) => dia >= f.de && dia <= f.hasta) ?? FASES_CAMPANA[2];
}

// ---- clima diario (determinista por día) ----
export type ClimaDia = "despejado" | "lluvia" | "tormenta" | "niebla" | "nieve" | "viento";

export interface ClimaInfo { tipo: ClimaDia; vientoKmh: number; tempC: number; direccion: string }

const CLIMAS: ClimaDia[] = ["despejado", "despejado", "lluvia", "niebla", "viento", "lluvia", "tormenta", "nieve"];
const DIRS_VIENTO = ["NO", "N", "NE", "E", "SE", "S", "SO", "O"];

export function climaDe(dia: number): ClimaInfo {
  const h = fnv89(`clima118:${dia}`);
  const tipo = CLIMAS[ch(h, 0) % CLIMAS.length];
  const vientoKmh = 4 + (ch(h, 1) % 28);
  const tempC = 2 - (ch(h, 2) % 9) + (tipo === "despejado" ? 3 : tipo === "nieve" ? -6 : 0);
  const direccion = DIRS_VIENTO[ch(h, 3) % DIRS_VIENTO.length];
  return { tipo, vientoKmh, tempC, direccion };
}

// ---- estadísticas de campaña por día (deterministas) ----
export interface StatsDia {
  bajasRojo: number;   // bajas del bando rojo (ocupante) en 24 h
  bajasAzul: number;   // bajas del bando azul (defensa) en 24 h
  bombardeos: number;  // impactos de artillería registrados
  drones: number;      // drones derribados (ambos bandos)
  convoyes: number;    // convoyes logísticos cruzados
  moralRojo: number;   // 0..100
  moralAzul: number;   // 0..100
}

// ============================================================
// v119.0 CRONOTEATRO — EL CLIMA TIÑE LA GUERRA
// Las estadísticas de campaña ya no son ajenas al cielo: cada
// clima multiplica (o corta) bombardeos, drones, convoyes y
// bajas con factores fijos y deterministas. Reproducir el mismo
// día produce los mismos números tintados por su clima.
//   · NIEVE    → artillería −40 % (el cañón se ahoga), convoyes
//                +20 % (cadenas en las ruedas, la logística dura)
//   · TORMENTA → aviación y drones en tierra (−55 % drones)
//   · NIEBLA   → fuego de precisión a ciegas (−30 % bombardeos)
//   · LLUVIA   → fango: menos aviación, menos bajas
//   · VIENTO   → ráfagas derriban drones (−35 %)
//   · DESPEJADO→ el cielo limpio dispara la aviación (+15 %)
// ============================================================

export interface ModsClima {
  bombardeos: number;
  drones: number;
  convoyes: number;
  bajas: number;
  /** factores legibles para los chips del panel */
  efectos: string[];
}

const MODS: Record<ClimaInfo["tipo"], ModsClima> = {
  despejado: { bombardeos: 1.12, drones: 1.15, convoyes: 1.0, bajas: 1.0, efectos: ["cielo limpio: aviación al máximo"] },
  lluvia: { bombardeos: 0.82, drones: 0.7, convoyes: 0.95, bajas: 0.92, efectos: ["fango: la aviación escasea", "menos bajas por fuego indirecto"] },
  tormenta: { bombardeos: 0.65, drones: 0.45, convoyes: 0.75, bajas: 0.85, efectos: ["aviación en tierra", "los drones caen del cielo", "convoyes parados"] },
  niebla: { bombardeos: 0.7, drones: 0.55, convoyes: 0.85, bajas: 0.8, efectos: ["fuego de precisión a ciegas", "reconocimiento aéreo nulo"] },
  nieve: { bombardeos: 0.6, drones: 0.75, convoyes: 1.2, bajas: 0.82, efectos: ["la artillería se ahoga", "convoyes con cadenas: logística +"] },
  viento: { bombardeos: 0.94, drones: 0.65, convoyes: 1.08, bajas: 0.97, efectos: ["ráfagas derriban drones", "los convoyes ganan la carretera"] },
};

/** Multiplicadores del clima al día dado (determinista). */
export function modsDe(dia: number): ModsClima {
  return MODS[climaDe(dia).tipo];
}

/** Nieve acumulada: días consecutivos de nieve hasta `dia` (tope 4). */
export function nieveAcumulada(dia: number): number {
  let n = 0;
  for (let d = dia; d >= 0; d--) {
    if (climaDe(d).tipo === "nieve") n++;
    else break;
  }
  return Math.min(n, 4);
}

export function statsDe(dia: number): StatsDia {
  const area = areaOcupada(dia);
  const areaAntes = areaOcupada(Math.max(0, dia - 1));
  const empuje = Math.max(0, area - areaAntes); // km² ganados por el rojo hoy
  const h = fnv89(`stats118:${dia}`);
  const m = modsDe(dia); // v119: el clima tiñe cada número del parte
  const bombardeos = Math.round((14 + (ch(h, 0) % 34)) * m.bombardeos);
  const drones = Math.round((3 + (ch(h, 1) % 11)) * m.drones);
  const convoyes = Math.round((8 + (ch(h, 2) % 15)) * m.convoyes);
  const intensidad = 0.6 + empuje / 140; // más empuje → más bajas
  const bajasRojo = Math.round((90 * intensidad + (ch(h, 3) % 70)) * m.bajas);
  const bajasAzul = Math.round((60 * intensidad + (ch(h, 4) % 55)) * m.bajas);
  const moralRojo = Math.min(96, Math.max(28, 62 + dia * 0.8 - (ch(h, 5) % 14)));
  const moralAzul = Math.min(94, Math.max(26, 58 - dia * 0.5 + (ch(h, 6) % 18)));
  return { bajasRojo, bajasAzul, bombardeos, drones, convoyes, moralRojo, moralAzul };
}

// ---- despachos del frente: el parte diario escrito por la casa ----
export interface Despacho { hora: string; sector: string; texto: string }

const PLANTILLAS: ((loc: string, eje: string) => string)[] = [
  (l) => `Duelo de artillería sobre ${l} durante toda la madrugada; los incendios secundarios siguen activos.`,
  (l) => `Drones de reconocimiento sobre ${l} derribados por defensas cortas; el cielo queda limpio al amanecer.`,
  (l) => `Convoy logístico alcanza ${l} escoltado; la ruta alterna sigue bajo riesgo de fuego de contrabatería.`,
  (l) => `Contraataque local al este de ${l} recupera trincheras de la víspera; el frente vuelve a su línea de la mañana.`,
  (l) => `Bombardeo de saturación sobre las aproximaciones de ${l}; ingenieros abren paso entre los cráteres.`,
  (l) => `Repliegue táctico en ${l}: la línea se acorta para negar flancos; el terreno cedido es campo abierto.`,
  (l) => `Puentes de campaña levantados junto a ${l}; la presión sobre el eje ${"{EJE}"} se sostiene sin pausa.`,
  (l) => `Guerra electrónica: el GPS de ${l} y alrededores cae durante horas; la navegación vuelve al papel.`,
];

const SECTORES = ["SECTOR NORTE", "SECTOR CENTRAL", "SECTOR SUR", "BOLSÓN DEL ESTE", "RIBERA DEL KARSK"];

export function despachosDe(dia: number): Despacho[] {
  const h = fnv89(`desp118:${dia}`);
  const n = 2 + (ch(h, 0) % 2); // 2..3 despachos
  const out: Despacho[] = [];
  for (let i = 0; i < n; i++) {
    const horaH = fnv89(`desp118:${dia}:${i}`);
    const hh = String(4 + (ch(horaH, 0) % 20)).padStart(2, "0");
    const mm = String(ch(horaH, 1) % 60).padStart(2, "0");
    const loc = LOCALIDADES[(ch(horaH, 2) * 3 + i * 5) % LOCALIDADES.length].nombre;
    const eje = EJES_PRESION[ch(horaH, 3) % EJES_PRESION.length].nombre;
    const plant = PLANTILLAS[(ch(horaH, 4) + i * 3) % PLANTILLAS.length];
    const texto = plant(loc, eje).replace("{EJE}", eje.split("—")[0].trim());
    const sector = SECTORES[(ch(horaH, 5) + i) % SECTORES.length];
    out.push({ hora: `${hh}:${mm}`, sector, texto });
  }
  return out;
}

// ---- terreno del teatro (estático, dibujado bajo las unidades) ----
export const RIO_KARSK: [number, number][] = [
  [648, 0], [612, 78], [628, 150], [586, 236], [566, 318], [524, 396], [492, 470], [462, 540],
];
export const PUENTE_KARSK = { x: 586, y: 236, nombre: "Puente de Orikhiv" };
export const CARRETERAS: [number, number][][] = [
  [[0, 120], [178, 132], [356, 110], [620, 62]],          // carretera del norte
  [[0, 424], [222, 434], [432, 402], [800, 470]],         // carretera del sur
];
export const CONTORNOS: { cx: number; cy: number; rx: number; ry: number }[] = [
  { cx: 700, cy: 176, rx: 92, ry: 56 },
  { cx: 706, cy: 182, rx: 64, ry: 38 },
  { cx: 712, cy: 188, rx: 36, ry: 21 },
];
export const KARSKGRAD_LABEL = { x: 762, y: 250, texto: "KARSKGRAD →" };

/** Días en los que una localidad cambia de mano (para los ticks del slider). */
export function diasConEvento(dias = DIAS_CAMPANA): number[] {
  return deltas(dias)
    .filter((d) => d.localidades.length > 0)
    .map((d) => d.dia);
}

/** Fuerza del eje de presión al día dado (ondula con la campaña). */
export function fuerzaEje(ejeIdx: number, dia: number): number {
  const base = EJES_PRESION[ejeIdx].fuerza;
  const h = fnv89(`eje118:${ejeIdx}:${dia}`);
  const ond = ((ch(h, 0) % 1000) / 1000) * 0.5 - 0.25; // -0.25..+0.25
  return Math.min(1, Math.max(0.12, base + ond));
}

// ============================================================
// v119.0 CRONOTEATRO — CRONOLOGÍA DE LOCALIDAD
// Toca una localidad del teatro y la campaña se cuenta desde
// SU esquina: quién la tuvo cada uno de los 21 días, cuántas
// veces cambió de mano y qué despachos la mencionaron.
// ============================================================

export interface CambioMano { dia: number; de: 0 | 1 | 2; a: 0 | 1 | 2 }

export interface HistoriaLoc {
  nombre: string;
  /** control día a día: índice = día de campaña */
  dias: (0 | 1 | 2)[];
  diasRojo: number;
  diasDisputada: number;
  diasAzul: number;
  cambios: CambioMano[];
  /** despachos de la campaña que mencionan la localidad (hora/sector/texto/día) */
  menciones: (Despacho & { dia: number })[];
}

export function historiaDe(idx: number, dias = DIAS_CAMPANA): HistoriaLoc {
  const loc = LOCALIDADES[Math.max(0, Math.min(LOCALIDADES.length - 1, idx))];
  const diasArr: (0 | 1 | 2)[] = [];
  for (let d = 0; d < dias; d++) diasArr.push(controlDe(loc, d));
  const cambios: CambioMano[] = [];
  for (let d = 1; d < diasArr.length; d++) {
    if (diasArr[d] !== diasArr[d - 1]) cambios.push({ dia: d, de: diasArr[d - 1], a: diasArr[d] });
  }
  const nombre = loc.nombre.toLowerCase();
  const menciones: (Despacho & { dia: number })[] = [];
  for (let d = 0; d < dias; d++) {
    for (const dp of despachosDe(d)) {
      if (dp.texto.toLowerCase().includes(nombre)) menciones.push({ ...dp, dia: d });
    }
  }
  return {
    nombre: loc.nombre,
    dias: diasArr,
    diasRojo: diasArr.filter((c) => c === 0).length,
    diasDisputada: diasArr.filter((c) => c === 1).length,
    diasAzul: diasArr.filter((c) => c === 2).length,
    cambios,
    menciones,
  };
}
