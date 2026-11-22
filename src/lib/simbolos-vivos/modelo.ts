// ═══════════════════════════════════════════════════════════════════
// v442.0 · LOS SÍMBOLOS VIVOS — EL MODELO
//
// Mandato del Dueño: «analiza los símbolos que tiene Vanguard y decora toda
// la casa con sus símbolos; crea símbolos ÚNICOS para Vanguard… pero cada
// símbolo tiene VIDA: cuando un módulo se actualiza o nunca se ha entrado,
// saltan chispas de signos de interrogación; cuando una tarea queda sin
// terminar, el símbolo echa el signo de la ira; cuando algo importante
// pasa, el símbolo se mueve, tiembla, echa energía, cambia de posición y
// los ojos de Vanguard miran a los lados».
//
// Este archivo es el CEREBRO GEOMÉTRICO (cero React, cero red, cero assets):
//   · SIGILOS: los símbolos únicos de la casa, dibujados a mano (los cuatro
//     módulos, el gran ojo, la zona cero, el mercado, la radio, el cuaderno,
//     el universo, la academia, la memoria, la guerra, el orden y la lupa).
//   · sigiloDe(id): la FÁBRICA DE SIGNOS. Cualquier sala, puerta o módulo
//     recibe un signo propio y determinista: el hash djb2 del id elige la
//     forma, el giro, las marcas y la tinta. Dos salas nunca comparten signo
//     y el mismo id siempre pinta el mismo signo (ley de determinismo de la
//     casa: nada aleatorio en runtime).
//
// Las medidas viven en un lienzo de 48×48. La vida (chispas, ira, energía,
// ojos) la pinta el componente; aquí solo está la geometría.
// ═══════════════════════════════════════════════════════════════════

/** los cuatro humores de un símbolo */
export type EstadoVida = "calma" | "reciente" | "ira" | "importante";

/** las cinco formas madre */
export type Forma = "escudo" | "circulo" | "rombo" | "hexagono" | "ojo";

/** una marca suelta dentro del signo (path en coordenadas del lienzo 48) */
export interface Pieza {
  d: string;
  /** transform de SVG opcional (rotar / trasladar / escalar) */
  transform?: string;
  /** si va rellena (punto, tiro, brasa) */
  relleno?: boolean;
}

export interface Sigilo {
  forma: Forma;
  /** giro del conjunto en grados (0–315) */
  giro: number;
  piezas: Pieza[];
  /** tinta del signo (hex) */
  acento: string;
  /** el signo mira: lleva ojos de Vanguard */
  ojo: boolean;
}

// ── hash determinista (el mismo que usa la votación del día: djb2) ──────
export function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

// djb2 por sí solo deja las mismas decisiones a dos ids que solo cambian
// en sus últimas letras («/sala-1» y «/sala-2» compartían todo salvo la
// forma). El finalizador esparce cualquier cambio a TODOS los bits: así
// cada sala recibe un signo que no comparte con su vecina.
function mezclar(h: number): number {
  let x = h >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}

// ── las cinco formas madre (lienzo 48×48) ──────────────────────────────
export const FORMA_D: Record<Forma, string> = {
  escudo: "M24 5 L41 11 V25 C41 34.5 33.5 41 24 43 C14.5 41 7 34.5 7 25 V11 Z",
  circulo: "M24 5.5 A18.5 18.5 0 1 1 24 42.5 A18.5 18.5 0 1 1 24 5.5 Z",
  rombo: "M24 4 L44 24 L24 44 L4 24 Z",
  hexagono: "M24 4 L40.5 13.5 V34.5 L24 44 L7.5 34.5 V13.5 Z",
  ojo: "M4 24 C4 15.2 12.8 9.5 24 9.5 C35.2 9.5 44 15.2 44 24 C44 32.8 35.2 38.5 24 38.5 C12.8 38.5 4 32.8 4 24 Z",
};

const FORMAS: Forma[] = ["escudo", "circulo", "rombo", "hexagono", "ojo"];

// ── pequeños constructores de paths ────────────────────────────────────
const circ = (cx: number, cy: number, r: number) =>
  `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
const elip = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
const lin = (x1: number, y1: number, x2: number, y2: number) => `M ${x1} ${y1} L ${x2} ${y2}`;

// ── las tintas de la casa (una por familia, todos en paleta Vanguard) ──
const PALETA = [
  "#FFC94D", // oro cables
  "#7FE3FF", // cian atlas
  "#FF8A2A", // naranja operativo
  "#A8C7FF", // azul saber
  "#5EEAD4", // turquesa academia
  "#FF5A3C", // rojo frente
  "#D4AF37", // oro casa
  "#9B5CFF", // violeta radio
];

// ═══════════════════════════════════════════════════════════════════
// LOS SÍMBOLOS ÚNICOS DE LA CASA — dibujados a mano, uno por familia.
// ═══════════════════════════════════════════════════════════════════
export const SIGILOS: Record<string, Sigilo> = {
  // EL GRAN OJO — Vanguard entero. La forma es el ojo; el iris lo pinta el
  // componente (para que pueda mirar a los lados). Cero piezas propias.
  vanguard: { forma: "ojo", giro: 0, piezas: [], acento: "#FFC94D", ojo: false },

  // LA REDACCIÓN — el cable que late: una línea de pulso que cruza la moneda.
  redaccion: {
    forma: "circulo", giro: 0, acento: "#FFB020", ojo: true,
    piezas: [{ d: "M9 24 H16 L19 15 L25 33 L29 19 H39" }, { d: circ(24, 24, 2.1), relleno: true }],
  },

  // EL MUNDO — elglobo con su meridiano y su ecuador.
  mundo: {
    forma: "rombo", giro: 0, acento: "#7FE3FF", ojo: true,
    piezas: [{ d: circ(24, 24, 8.5) }, { d: elip(24, 24, 3.8, 8.5) }, { d: lin(15.5, 24, 32.5, 24) }],
  },

  // EL SABER — el libro abierto con su lomo.
  saber: {
    forma: "hexagono", giro: 0, acento: "#A8C7FF", ojo: true,
    piezas: [
      { d: "M13 15.5 C16 13.8 20 13.8 23 15.5 V31 C20 29.3 16 29.3 13 31 Z" },
      { d: "M35 15.5 C32 13.8 28 13.8 25 15.5 V31 C28 29.3 32 29.3 35 31 Z" },
      { d: lin(24, 15.5, 24, 31) },
    ],
  },

  // LA CASA — la estrella de cuatro puntas del expediente del piloto.
  casa: {
    forma: "escudo", giro: 0, acento: "#D4AF37", ojo: true,
    piezas: [
      { d: "M24 14 L26.5 21.5 L34 24 L26.5 26.5 L24 34 L21.5 26.5 L14 24 L21.5 21.5 Z" },
      { d: circ(24, 24, 2.2), relleno: true },
    ],
  },

  // ZONA CERO — la diana con sus cuatro latidos.
  "zona-cero": {
    forma: "rombo", giro: 0, acento: "#FF5A3C", ojo: true,
    piezas: [
      { d: circ(24, 24, 7) },
      { d: lin(24, 10, 24, 17) }, { d: lin(24, 31, 24, 38) },
      { d: lin(10, 24, 17, 24) }, { d: lin(31, 24, 38, 24) },
      { d: circ(24, 24, 1.6), relleno: true },
    ],
  },

  // EL MERCADO — la moneda con su curso.
  mercado: {
    forma: "hexagono", giro: 0, acento: "#3DDC97", ojo: true,
    piezas: [
      { d: circ(24, 24, 7.5) },
      { d: lin(24, 18, 24, 30) },
      { d: "M19.5 21.5 C21 20.2 27 20.2 28.5 21.5" },
      { d: "M19.5 26.5 C21 27.8 27 27.8 28.5 26.5" },
    ],
  },

  // LA RADIO — el antenna y sus dos ondas.
  radio: {
    forma: "circulo", giro: 0, acento: "#9B5CFF", ojo: true,
    piezas: [
      { d: circ(24, 26, 2.4), relleno: true },
      { d: "M15 20 a12 12 0 0 1 18 0" },
      { d: "M11 16 a18 18 0 0 1 26 0" },
    ],
  },

  // EL CUADERNO — la plumilla.
  cuaderno: {
    forma: "escudo", giro: 0, acento: "#FFC53D", ojo: true,
    piezas: [
      { d: "M15 33 L28 20 L32 24 L19 37 Z" },
      { d: lin(28, 20, 32, 24) },
      { d: circ(20, 32, 1.5), relleno: true },
    ],
  },

  // EL UNIVERSO — la órbita y su satélite.
  universo: {
    forma: "ojo", giro: 0, acento: "#A855F7", ojo: false,
    piezas: [
      { d: elip(24, 24, 11, 4.5), transform: "rotate(-24 24 24)" },
      { d: circ(24, 24, 3.1) },
      { d: circ(34.5, 17.5, 1.5), relleno: true },
    ],
  },

  // LA ACADEMIA — el birrete.
  academia: {
    forma: "hexagono", giro: 0, acento: "#5EEAD4", ojo: true,
    piezas: [
      { d: "M12 20 L24 14 L36 20 L24 26 Z" },
      { d: lin(17, 22.5, 17, 29) },
      { d: "M17 29 C17 31.5 29 31.5 29 29" },
    ],
  },

  // LA MEMORIA — la caja del archivo.
  memoria: {
    forma: "circulo", giro: 0, acento: "#DCC078", ojo: true,
    piezas: [
      { d: "M14 18 H34 V32 H14 Z" },
      { d: lin(14, 22, 34, 22) },
      { d: circ(24, 27, 1.4), relleno: true },
    ],
  },

  // LA GUERRA — la cruz de armas.
  guerra: {
    forma: "rombo", giro: 0, acento: "#FF4A3A", ojo: true,
    piezas: [
      { d: lin(13, 35, 35, 13) }, { d: lin(35, 35, 13, 13) },
      { d: lin(24, 11, 24, 17) }, { d: lin(24, 31, 24, 37) },
      { d: lin(11, 24, 17, 24) }, { d: lin(31, 24, 37, 24) },
    ],
  },

  // EL ORDEN — las tres líneas del orden de batalla.
  orden: {
    forma: "escudo", giro: 0, acento: "#FF8A2A", ojo: true,
    piezas: [{ d: "M15 15 H33 M15 24 H33 M15 33 H25" }, { d: circ(30, 33, 1.4), relleno: true }],
  },

  // LA LUPA — buscar.
  buscar: {
    forma: "circulo", giro: 0, acento: "#FFC94D", ojo: true,
    piezas: [{ d: circ(21, 21, 7.5) }, { d: lin(26.5, 26.5, 34, 34) }],
  },

  // EN VIVO — el ojo que nunca duerme (la forma ya es el ojo).
  "en-vivo": { forma: "ojo", giro: 0, piezas: [], acento: "#FF3B30", ojo: false },
};

// ═══════════════════════════════════════════════════════════════════
// LA FÁBRICA DE SIGNOS — miles de signos, cada sala con el suyo.
// ═══════════════════════════════════════════════════════════════════

/** marcas sueltas en caja local (−8…8) que se combinan y se colocan. */
const MARCAS: string[] = [
  "M-7 0 H7",
  "M0 -7 V7",
  "M-6 -6 L6 6",
  "M-6 6 L6 -6",
  "M0 -7 L6 6 L-6 6 Z",
  "M-5 -5 L5 5 M5 -5 L-5 5",
  "M-7 0 A7 7 0 0 1 7 0",
  "M-7 0 A7 7 0 0 0 7 0",
  "M-6 3 C-2 -3 2 3 6 -3",
  "M0 -6 C3 -2 3 2 0 6 C-3 2 -3 -2 0 -6 Z",
  "M-6 -2 L-2 2 L2 -2 L6 2",
  "M-5 5 L0 -5 L5 5",
  "M-7 -4 L-2 4 L3 -4 L7 4",
  "M-6 0 C-6 -5 6 -5 6 0 C6 5 -6 5 -6 0 Z",
  "M0 -8 L0 8 M-6 -3 L6 -3",
  "M-7 4 A7 7 0 0 1 7 4",
  "M-5 -6 L5 -6 L0 6 Z",
  "M-6 -6 L6 6 M-6 6 L6 -6",
];

const grados = (rad: number) => (rad * 180) / Math.PI;

/**
 * El signo de cualquier id. Si es un símbolo de la casa, devuelve el suyo;
 * si no, la fábrica lo compone de forma determinista: mismo id → mismo
 * signo, siempre (y dos ids distintos casi nunca comparten signo).
 */
export function sigiloDe(id: string): Sigilo {
  const propio = SIGILOS[id];
  if (propio) return propio;

  const h = mezclar(djb2(id));
  const forma = FORMAS[h % FORMAS.length];
  const giro = ((h >>> 3) % 72) * 5;
  const n = 1 + ((h >>> 5) % 3); // 1…3 marcas
  const piezas: Pieza[] = [];

  for (let i = 0; i < n; i++) {
    const marca = MARCAS[(h >>> (7 + i * 4)) % MARCAS.length];
    const ang = ((h >>> (11 + i * 5)) % 72) * 5;
    const radio = Math.round((6 + ((h >>> (13 + i * 3)) % 7) * 1.5) * 10) / 10; // 6…15
    const x = Math.round((24 + radio * Math.cos((ang * Math.PI) / 180)) * 10) / 10;
    const y = Math.round((24 + radio * Math.sin((ang * Math.PI) / 180)) * 10) / 10;
    const escala = Math.round((0.7 + ((h >>> (17 + i * 2)) % 60) / 100) * 1000) / 1000; // 0.70…1.29
    const g = ((h >>> (19 + i * 4)) % 72) * 5;
    piezas.push({ d: marca, transform: `translate(${x} ${y}) rotate(${g}) scale(${escala})` });
    // a veces una brasa que acompaña a la marca
    if (((h >>> (23 + i)) & 1) === 1) {
      const bx = Math.round((24 + (radio + 6) * Math.cos(((ang + 46) * Math.PI) / 180)) * 10) / 10;
      const by = Math.round((24 + (radio + 6) * Math.sin(((ang + 46) * Math.PI) / 180)) * 10) / 10;
      piezas.push({ d: circ(0, 0, 1.5), transform: `translate(${bx} ${by})`, relleno: true });
    }
  }

  return {
    forma,
    giro,
    piezas,
    acento: PALETA[(h >>> 9) % PALETA.length],
    ojo: ((h >>> 11) & 1) === 1,
  };
}

/** nombre legible de un estado (lo pinta el componente con useT). */
export const ESTADOS_VIDA: EstadoVida[] = ["calma", "reciente", "ira", "importante"];

/** los cuatro módulos de la casa, en el orden del menú (para el pulso). */
export const MODULOS_VIDA = ["redaccion", "mundo", "saber", "casa"] as const;
