// ═══════════════════════════════════════════════════════════════════
// v411.0 · VANGUARD LABS — CONTRATO DE LOS MODELOS
//
// QUÉ ES ESTO
//   El lenguaje común de todos los laboratorios: una variable se declara con
//   su unidad, su rango y SU ORIGEN; un modelo declara qué pregunta responde,
//   qué supone, qué límites tiene y cómo se lee su salida. Nada de cajas negras:
//   si un modelo no puede justificar algo, lo escribe en `limites`.
//
// LA REGLA DE ORO DEL LABORATORIO
//   Un modelo aquí NO predice. Es un juguete de sistema dinámico: sirve para
//   entender cómo se relacionan las variables, no para saber qué pasará.
//   Por eso cada variable lleva su origen:
//     · "real"     → dato verificado de una fuente citada (atlas, Banco Mundial)
//     · "supuesto" → número puesto por la casa para que el modelo funcione
//     · "eleccion" → lo mueve el visitante y representa una decisión política
//   La interfaz pinta el origen al lado de cada mando. Sin esa etiqueta, un
//   supuesto parecería un dato y el laboratorio sería propaganda con gráficos.
// ═══════════════════════════════════════════════════════════════════

export type CategoriaLab = "economia" | "demografia" | "geografia" | "historia" | "sistemas";

export const CATEGORIA_LAB: Record<CategoriaLab, { nombre: string; color: string; texto: string }> = {
  economia: {
    nombre: "Economía",
    color: "#34d399",
    texto: "Producción, presupuesto, comercio, recursos y tecnología.",
  },
  demografia: {
    nombre: "Sociedad",
    color: "#fbbf24",
    texto: "Población, migración, ciudades e indicadores sociales.",
  },
  geografia: {
    nombre: "Geografía",
    color: "#a3e635",
    texto: "Clima, agua, suelo, ecosistemas y uso del territorio.",
  },
  historia: {
    nombre: "Historia",
    color: "#f472b6",
    texto: "Imperios, fronteras, rutas comerciales y escenarios contrafactuales.",
  },
  sistemas: {
    nombre: "Sistemas complejos",
    color: "#c084fc",
    texto: "Redes, energía y acoplamiento entre variables.",
  },
};

export type OrigenVariable = "real" | "supuesto" | "eleccion";

export const ORIGEN_ETIQUETA: Record<OrigenVariable, { nombre: string; color: string; texto: string }> = {
  real: {
    nombre: "Dato real",
    color: "#7dd3fc",
    texto: "Sale de una fuente citada y verificable. No se mueve con el escenario.",
  },
  supuesto: {
    nombre: "Supuesto del modelo",
    color: "#fbbf24",
    texto: "Número elegido por la casa para que el sistema funcione. No es un dato medido.",
  },
  eleccion: {
    nombre: "Decisión",
    color: "#e8c56a",
    texto: "No es un dato: es una palanca política o económica que tú mueves.",
  },
};

export interface VariableLab {
  id: string;
  nombre: string;
  unidad: string;
  min: number;
  max: number;
  paso: number;
  defecto: number;
  origen: OrigenVariable;
  /** Qué significa, en una frase. Obligatorio: nadie mueve un mando a ciegas. */
  nota: string;
}

export interface MetricaLab {
  campo: string;
  nombre: string;
  unidad: string;
  /** Cómo se pinta el número final. */
  formato: "num" | "pct" | "usd" | "indice" | "decimal";
  decimales: number;
  nota?: string;
}

export interface SerieLab {
  campo: string;
  nombre: string;
  color: string;
  unidad: string;
}

export interface EventoLab {
  paso: number;
  texto: string;
  tipo: "hito" | "aviso" | "limite";
}

export interface EstadoLab {
  [clave: string]: number;
}

export type ParametrosLab = Record<string, number>;

export interface DatoRealLab {
  dato: string;
  valor: string;
  fuente: string;
  /** Dónde vive el dato en la casa, para poder comprobarlo. */
  donde: string;
}

export interface PuntoMapaLab {
  id: string;
  lat: number;
  lng: number;
  radio: number;
  color: string;
  etiqueta: string;
}

export interface RutaMapaLab {
  id: string;
  from: [number, number]; // [lat, lng]
  to: [number, number];
  color: string;
  label?: string;
  /** 0..1 — se usa para el grosor del trazo. */
  peso: number;
}

export interface MapaLab {
  puntos: PuntoMapaLab[];
  rutas: RutaMapaLab[];
  nota: string;
}

export interface ResultadoLab {
  modeloId: string;
  pasos: number;
  semilla: number;
  /** Etiqueta del eje X en el paso i (año, mes, generación…). */
  etiquetasTiempo: string[];
  series: { campo: string; nombre: string; color: string; unidad: string; valores: number[] }[];
  metricas: { campo: string; nombre: string; unidad: string; formato: string; decimales: number; valor: number; inicial: number; nota?: string }[];
  eventos: EventoLab[];
  lectura: string[];
  mapa?: MapaLab;
  /** Huella del escenario: mismos parámetros + misma semilla = mismo resultado. */
  huella: string;
}

/** Un escenario preconfigurado: la misma maquinaria con otra intención. */
export interface PresetLab {
  id: string;
  nombre: string;
  descripcion: string;
  parametros: Partial<ParametrosLab>;
  pasos?: number;
}

export interface ModeloLab {
  id: string;
  nombre: string;
  categoria: CategoriaLab;
  /** La pregunta que el visitante puede contestar con este laboratorio. */
  pregunta: string;
  resumen: string;
  /** Contexto real (histórico o geográfico) que enmarca el modelo. */
  contexto: string;
  /** Unidad de cada paso: "año", "mes", "generación", "década". */
  unidadTiempo: string;
  pasosDefecto: number;
  pasosMax: number;
  anioInicial?: number;
  variables: VariableLab[];
  metricas: MetricaLab[];
  series: SerieLab[];
  /** Datos reales que el modelo usa o cita. Sin esto, `origen: "real"` está prohibido. */
  reales: DatoRealLab[];
  limites: string[];
  supuestos: string[];
  /** Escenarios de partida, escritos a mano. Nunca se generan al azar. */
  presets?: PresetLab[];
  init: (p: ParametrosLab, semilla: number) => EstadoLab;
  step: (e: EstadoLab, p: ParametrosLab, i: number, semilla: number) => EstadoLab;
  /** Valores derivados que se pueden graficar o mostrar como métrica. */
  derivar: (e: EstadoLab, p: ParametrosLab) => Record<string, number>;
  /** Lectura en español de lo que ha pasado, generada desde el estado final. */
  lectura: (e: EstadoLab, p: ParametrosLab, r: { inicial: EstadoLab; pasos: number }) => string[];
  /** Visualización geográfica opcional. */
  mapa?: (e: EstadoLab, p: ParametrosLab) => MapaLab;
}

// ─────────────────────────── utilidades ───────────────────────────

/** PRNG determinista (mulberry32): misma semilla, misma corrida. */
export function prng(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const redondear = (v: number, d = 2) => {
  const f = 10 ** d;
  return Math.round(v * f) / f;
};
/** Ruido determinista en [-1, 1] a partir de paso y semilla. */
export function ruido(semilla: number, paso: number, canal = 0): number {
  const r = prng(semilla * 7919 + paso * 104729 + canal * 15485863);
  return r() * 2 - 1;
}
/** Interpolación cómoda para curvas de saturación. */
export const saturar = (v: number) => 1 - Math.exp(-Math.max(0, v));

export function formatearValor(v: number, formato: string, decimales: number): string {
  if (!Number.isFinite(v)) return "—";
  if (formato === "pct") return `${v.toFixed(decimales)} %`;
  if (formato === "usd") {
    const abs = Math.abs(v);
    if (abs >= 1e12) return `${(v / 1e12).toFixed(decimales)} B$`;
    if (abs >= 1e9) return `${(v / 1e9).toFixed(decimales)} MM$`;
    if (abs >= 1e6) return `${(v / 1e6).toFixed(decimales)} M$`;
    return `${v.toFixed(decimales)} $`;
  }
  if (formato === "decimal") return v.toFixed(decimales);
  if (formato === "indice") return v.toFixed(decimales);
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(decimales)} mil M`;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(decimales)} M`;
  if (Math.abs(v) >= 1e4) return `${(v / 1e3).toFixed(decimales)} mil`;
  return v.toFixed(decimales);
}
