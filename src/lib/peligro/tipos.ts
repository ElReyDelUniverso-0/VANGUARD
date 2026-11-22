// ═══════════════════════════════════════════════════════════════════
// v440.5 · GLOBAL DANGER — los tipos del observatorio
//
// Regla de la casa, y aquí es la regla número uno: NADA se inventa. Cada señal
// lleva su fecha, su fuente oficial, su metodología y su contexto; y si la
// fuente no publica un nivel, Vanguard NO se lo pone (nivel = null).
// ═══════════════════════════════════════════════════════════════════

/** Las seis familias del observatorio. */
export type Categoria =
  | "contaminacion"
  | "epidemias"
  | "alimentacion"
  | "humanitaria"
  | "ambiental"
  | "recursos";

/**
 * Los seis niveles del observatorio (0 a 5). Se explican en `niveles.ts`.
 * `null` significa: la fuente NO publica clasificación para este dato y
 * Vanguard no la inventa.
 */
export type Nivel = 0 | 1 | 2 | 3 | 4 | 5;

/** Una señal: un dato con fecha, fuente, método y contexto. */
export type Senal = {
  id: string;
  categoria: Categoria;
  /** qué mide, en corto: «PM2,5 en el aire» */
  titulo: string;
  /** el dato, ya formateado para leerlo («32,87 µg/m³») */
  valor: string;
  /** el número crudo, cuando lo hay, para comparar */
  numero?: number;
  unidad?: string;
  /** año o fecha del dato — obligatorio, nunca «hoy» sin comprobarlo */
  fecha: string;
  /** el organismo que lo publica: «Banco Mundial (WDI)» */
  fuente: string;
  /** el enlace directo al dato o al conjunto */
  fuenteUrl: string;
  /** cómo se calcula el indicador, en llano */
  metodologia: string;
  /** qué significa y qué no: el contexto, sin alarmar */
  contexto: string;
  /** nivel, SOLO si la fuente lo publica o si hay umbral oficial citado */
  nivel: Nivel | null;
  /** qué escala se usó para ese nivel (o por qué no hay) */
  criterioNivel: string;
  /** código del indicador en la fuente, si lo tiene */
  codigo?: string;
  /** si el valor se refresca solo desde la API de la fuente */
  enVivo?: boolean;
};

/** Lo que devuelve cualquier lector de fuente externa. */
export type Lectura<T> = {
  ok: boolean;
  /** cuándo se intentó la lectura (ISO) */
  cuando: string;
  /** de dónde salió lo que se muestra */
  de: "vivo" | "instantanea";
  datos: T;
  /** si falló, por qué (para que la página lo pueda confesar) */
  error?: string;
};

/** Un punto del mapa: cualquier cosa con coordenadas y una etiqueta. */
export type PuntoMapa = {
  lat: number;
  lng: number;
  /** familia a la que pertenece (decide color y forma) */
  clase: "sismo" | "desastre" | "incendio" | "tormenta" | "otro";
  /** nombre legible */
  titulo: string;
  /** cuándo ocurrió / se publicó */
  fecha: string;
  /** nivel de la fuente, cuando lo trae (GDACS: Green/Orange/Red) */
  nivelTexto?: string;
  /** enlace a la ficha oficial */
  url?: string;
  /** magnitud o tamaño, para el radio del punto */
  peso?: number;
};
