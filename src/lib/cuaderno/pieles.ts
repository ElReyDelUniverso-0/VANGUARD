// ═══════════════════════════════════════════════════════════════════
// v431.6 EL CUADERNO · LAS PIELES (variaciones visuales)
//
// ARCHIVO PURO: no toca el DOM ni React. Define las cuatro pieles con las
// que el cuaderno se puede mirar y las tres disposiciones, para que la
// decisión del visitante sea un dato (y se pueda probar), no un montón de
// clases sueltas repartidas por el CSS.
//
// Las pieles NO son un tema de colores porque sí: cada una cambia la
// metáfora del módulo — papel de cuaderno de campo, pizarra táctica,
// constelación y terminal — y con ella la tipografía, la textura y el
// modo de leer.
// ═══════════════════════════════════════════════════════════════════

export const PIELES = ["papel", "pizarra", "constelacion", "terminal"] as const;
export type Piel = (typeof PIELES)[number];

export const VISTAS = ["lista", "tablero", "mapa"] as const;
export type Vista = (typeof VISTAS)[number];

export type TokensPiel = {
  id: Piel;
  nombre: string;
  /** una frase que dice qué es, sin adjetivos vacíos */
  detalle: string;
  fondo: string;
  fondoSuave: string;
  tinta: string;
  tintaTenue: string;
  linea: string;
  acento: string;
  acentoSuave: string;
  papel: string;
  /** la familia tipográfica del cuerpo */
  letra: string;
  letraTitulo: string;
  /** textura: qué se dibuja encima (rayado, retícula, estrellas, líneas de fósforo) */
  textura: "renglones" | "reticula" | "estrellas" | "barrido";
  radio: string;
};

export const TOKENS: Record<Piel, TokensPiel> = {
  papel: {
    id: "papel",
    nombre: "Cuaderno de campo",
    detalle: "Papel crema, renglones y tinta de pluma: para escribir largo.",
    fondo: "#efe7d6",
    fondoSuave: "#e6dcc7",
    tinta: "#2c2419",
    tintaTenue: "#7a6a52",
    linea: "rgba(122, 106, 82, 0.28)",
    acento: "#9a5b2c",
    acentoSuave: "rgba(154, 91, 44, 0.14)",
    papel: "#fbf6ea",
    letra: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
    letraTitulo: '"Iowan Old Style", Georgia, serif',
    textura: "renglones",
    radio: "4px",
  },
  pizarra: {
    id: "pizarra",
    nombre: "Pizarra táctica",
    detalle: "Verde pizarra y tiza: para señalar, unir y decidir.",
    fondo: "#13201b",
    fondoSuave: "#0d1713",
    tinta: "#eaf3ec",
    tintaTenue: "#9db3a6",
    linea: "rgba(157, 179, 166, 0.26)",
    acento: "#e8c56a",
    acentoSuave: "rgba(232, 197, 106, 0.16)",
    papel: "#182821",
    letra: '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive',
    letraTitulo: '"Segoe Print", "Bradley Hand", cursive',
    textura: "reticula",
    radio: "10px",
  },
  constelacion: {
    id: "constelacion",
    nombre: "Constelación",
    detalle: "Noche azul y oro: tus notas como estrellas unidas por hilos.",
    fondo: "#070a15",
    fondoSuave: "#04060e",
    tinta: "#e8eefb",
    tintaTenue: "#8f9dc0",
    linea: "rgba(143, 157, 192, 0.22)",
    acento: "#f2d795",
    acentoSuave: "rgba(242, 215, 149, 0.14)",
    papel: "#0b1020",
    letra: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    letraTitulo: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    textura: "estrellas",
    radio: "12px",
  },
  terminal: {
    id: "terminal",
    nombre: "Terminal",
    detalle: "Fósforo verde sobre negro: datos, cifras y registros.",
    fondo: "#05100a",
    fondoSuave: "#030a06",
    tinta: "#b8f5c8",
    tintaTenue: "#5f9a72",
    linea: "rgba(95, 154, 114, 0.28)",
    acento: "#4ade80",
    acentoSuave: "rgba(74, 222, 128, 0.14)",
    papel: "#071309",
    letra: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    letraTitulo: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    textura: "barrido",
    radio: "2px",
  },
};

/** Cualquier cosa que llegue (guardado viejo, import, URL) se vuelve una piel válida. */
export function pielValida(v: unknown, porDefecto: Piel = "constelacion"): Piel {
  return typeof v === "string" && (PIELES as readonly string[]).includes(v) ? (v as Piel) : porDefecto;
}

export function vistaValida(v: unknown, porDefecto: Vista = "lista"): Vista {
  return typeof v === "string" && (VISTAS as readonly string[]).includes(v) ? (v as Vista) : porDefecto;
}

/** Las variables CSS de una piel, listas para el style del contenedor. */
export function variablesDe(piel: Piel): Record<string, string> {
  const t = TOKENS[pielValida(piel)];
  return {
    "--cu-fondo": t.fondo,
    "--cu-fondo-suave": t.fondoSuave,
    "--cu-tinta": t.tinta,
    "--cu-tinta-tenue": t.tintaTenue,
    "--cu-linea": t.linea,
    "--cu-acento": t.acento,
    "--cu-acento-suave": t.acentoSuave,
    "--cu-papel": t.papel,
    "--cu-letra": t.letra,
    "--cu-letra-titulo": t.letraTitulo,
    "--cu-radio": t.radio,
  };
}

export const TINTAS = ["ambar", "cian", "verde", "rojo", "violeta", "grafito"] as const;
export type Tinta = (typeof TINTAS)[number];

export const TINTA_HEX: Record<Tinta, string> = {
  ambar: "#e8c56a",
  cian: "#22d3ee",
  verde: "#4ade80",
  rojo: "#f87171",
  violeta: "#c084fc",
  grafito: "#94a3b8",
};

export function tintaValida(v: unknown, porDefecto: Tinta = "ambar"): Tinta {
  return typeof v === "string" && (TINTAS as readonly string[]).includes(v) ? (v as Tinta) : porDefecto;
}
