// ═══════════════════════════════════════════════════════════════════
// v440.5 · LOS SEIS NIVELES DE GLOBAL DANGER — y las escalas oficiales que
// los alimentan
//
// Advertencia que la página repite en voz alta: el nivel 0–5 es una ESCALA DE
// LECTURA de Vanguard, no un boletín. Sólo se rellena cuando (a) la fuente
// oficial publica su propia clasificación —GDACS, OMS— o (b) existe un umbral
// publicado por el organismo que produce el dato —las guías de calidad del aire
// de la OMS, la escala de la FAO para la subalimentación, el umbral de estrés
// hídrico de FAO AQUASTAT—. Cuando no hay ni lo uno ni lo otro, la señal sale
// con «sin clasificación oficial» y NO se le pone número.
// ═══════════════════════════════════════════════════════════════════

import type { Nivel } from "./tipos";

export type FilaNivel = {
  nivel: Nivel;
  nombre: string;
  color: string;
  /** qué significa, en llano */
  que: string;
  /** qué se hace con esta información (la casa no grita) */
  hacer: string;
};

export const NIVELES: FilaNivel[] = [
  {
    nivel: 0,
    nombre: "Sin señal",
    color: "#5c6b78",
    que: "La fuente no ha publicado nada nuevo para este indicador, o el valor está dentro de lo esperado.",
    hacer: "Nada. Se sigue mirando.",
  },
  {
    nivel: 1,
    nombre: "Bajo",
    color: "#4aa3ff",
    que: "El dato existe y es estable; está por debajo de los umbrales de atención del organismo que lo publica.",
    hacer: "Lectura. Es el estado normal de la mayoría del planeta casi todos los días.",
  },
  {
    nivel: 2,
    nombre: "Moderado",
    color: "#48c78e",
    que: "El indicador cruza el primer umbral publicado: hay motivo para seguirlo, no para cambiar tu día.",
    hacer: "Seguimiento. Se anota la fecha y se compara con el mes anterior.",
  },
  {
    nivel: 3,
    nombre: "Elevado",
    color: "#e8c56a",
    que: "El indicador está por encima de un umbral intermedio oficial, o la fuente lo clasifica en su banda media (GDACS naranja).",
    hacer: "Atención si vives o viajas a la zona. Se cita siempre la fuente y la fecha.",
  },
  {
    nivel: 4,
    nombre: "Alto",
    color: "#ff9040",
    que: "Por encima de un umbral alto publicado, o la fuente lo clasifica en su banda alta (GDACS rojo).",
    hacer: "Consulta el boletín oficial antes de actuar. Vanguard no sustituye a la autoridad.",
  },
  {
    nivel: 5,
    nombre: "Muy alto",
    color: "#ff4d6d",
    que: "Por encima del último umbral publicado para ese indicador, o la fuente oficial declara una emergencia de máxima gravedad (ESPII de la OMS, GDACS rojo con impacto alto y población afectada).",
    hacer: "Mirar el parte oficial antes de actuar. «Muy alto» describe un indicador, no una orden: la autoridad manda y aquí sólo se enlaza lo que ella publica.",
  },
];

export function nivelDe(n: Nivel | null): FilaNivel | null {
  return n === null ? null : NIVELES.find((f) => f.nivel === n) ?? null;
}

export type Escala = {
  id: string;
  nombre: string;
  organismo: string;
  /** cómo funciona, en llano */
  como: string;
  /** cómo la usa Global Danger */
  uso: string;
  url: string;
};

/** Las escalas oficiales que el observatorio sí usa, explicadas sin humo. */
export const ESCALAS: Escala[] = [
  {
    id: "gdacs",
    nombre: "GDACS · alerta por desastre",
    organismo: "Comisión Europea (JRC) y OCHA",
    como: "Green / Orange / Red según el impacto estimado del evento (población expuesta, vulnerabilidad del país y magnitud física del fenómeno). Se recalcula mientras el evento está abierto.",
    uso: "Se muestra tal cual la publica GDACS. Vanguard no la recolorea: verde, naranja y rojo son suyos.",
    url: "https://www.gdacs.org/",
  },
  {
    id: "who",
    nombre: "OMS · brotes y ESPII",
    organismo: "Organización Mundial de la Salud",
    como: "Cada brote se publica como Disease Outbreak News con fecha y país; aparte, el Reglamento Sanitario Internacional permite declarar una emergencia de salud pública de interés internacional (ESPII/PHEIC), que es una decisión del Director General, no una puntuación.",
    uso: "Se listan los DON con su fecha y su enlace. No se puntúa un brote: si la OMS no declara ESPII, aquí no hay nivel 5.",
    url: "https://www.who.int/emergencies/disease-outbreak-news",
  },
  {
    id: "aqg",
    nombre: "OMS · guías de calidad del aire (2021)",
    organismo: "Organización Mundial de la Salud",
    como: "Para la media anual de PM2,5: guía 5 µg/m³ y cuatro objetivos intermedios —10, 15, 25 y 35 µg/m³—, pensados para que un país con mucho que limpiar tenga escalones por los que subir.",
    uso: "Es la escalera con la que se pone nivel a la contaminación: cada objetivo intermedio superado sube un escalón.",
    url: "https://www.who.int/publications/i/item/9789240034228",
  },
  {
    id: "fao-pou",
    nombre: "FAO · gravedad de la subalimentación",
    organismo: "FAO (SOFI)",
    como: "La prevalencia de subalimentación se lee por bandas: menos de 2,5 % muy baja; 2,5–4,9 % baja; 5–14,9 % moderadamente alta; 15–24,9 % alta; 25–34,9 % muy alta; 35 % o más, extremadamente alta.",
    uso: "Se aplica la banda de la FAO al dato del Banco Mundial/FAO, sin interpretarlo.",
    url: "https://www.fao.org/faostat/en/#data/FS",
  },
  {
    id: "aquastat",
    nombre: "FAO AQUASTAT · estrés hídrico",
    organismo: "FAO",
    como: "La extracción de agua dulce se mide como porcentaje de los recursos renovables disponibles. Por encima del 25 % se considera estrés hídrico.",
    uso: "Umbral citado para poner nivel a la escasez de recursos hídricos.",
    url: "https://www.fao.org/aquastat/statistics/query/index.html",
  },
];

/**
 * La escalera de la OMS para la media anual de PM2,5 (µg/m³), de más exigente
 * a más permisiva. Se usa para traducir el dato a nivel sin inventar cortes.
 */
export const ESCALERA_PM25: { tope: number; nivel: Nivel; etiqueta: string }[] = [
  { tope: 5, nivel: 1, etiqueta: "cabe en la guía de la OMS (≤ 5 µg/m³)" },
  { tope: 10, nivel: 2, etiqueta: "entre la guía y el objetivo intermedio 4 (5–10 µg/m³)" },
  { tope: 15, nivel: 3, etiqueta: "entre los objetivos intermedios 4 y 3 (10–15 µg/m³)" },
  { tope: 25, nivel: 4, etiqueta: "entre los objetivos intermedios 3 y 2 (15–25 µg/m³)" },
  { tope: 35, nivel: 5, etiqueta: "entre los objetivos intermedios 2 y 1 (25–35 µg/m³)" },
];

/** Nivel de la contaminación por la escalera de la OMS (nunca a ojo). */
export function nivelPM25(valor: number): { nivel: Nivel; etiqueta: string } {
  for (const p of ESCALERA_PM25) {
    if (valor <= p.tope) return { nivel: p.nivel, etiqueta: p.etiqueta };
  }
  return { nivel: 5, etiqueta: "por encima del objetivo intermedio 1 de la OMS (> 35 µg/m³)" };
}

/** Bandas de la FAO para la prevalencia de subalimentación (%). */
export function nivelSubalimentacion(valor: number): { nivel: Nivel; etiqueta: string } {
  if (valor < 2.5) return { nivel: 1, etiqueta: "muy baja (FAO)" };
  if (valor < 5) return { nivel: 1, etiqueta: "baja (FAO)" };
  if (valor < 15) return { nivel: 2, etiqueta: "moderadamente alta (FAO)" };
  if (valor < 25) return { nivel: 3, etiqueta: "alta (FAO)" };
  if (valor < 35) return { nivel: 4, etiqueta: "muy alta (FAO)" };
  return { nivel: 5, etiqueta: "extremadamente alta (FAO)" };
}

/** Estrés hídrico de AQUASTAT: 25 % es el umbral publicado. */
export function nivelAgua(valor: number): { nivel: Nivel; etiqueta: string } {
  if (valor < 10) return { nivel: 1, etiqueta: "sin estrés (umbral FAO 25 %)" };
  if (valor < 25) return { nivel: 2, etiqueta: "cerca del umbral FAO del 25 %" };
  if (valor < 50) return { nivel: 3, etiqueta: "estrés hídrico (FAO)" };
  if (valor < 100) return { nivel: 4, etiqueta: "estrés hídrico alto (FAO)" };
  return { nivel: 5, etiqueta: "extracción por encima de la renovación" };
}

/** GDACS: su palabra es el nivel; no se reinterpreta. */
export function nivelGDACS(alerta: string): { nivel: Nivel; etiqueta: string } {
  const a = (alerta || "").toLowerCase();
  if (a.startsWith("red")) return { nivel: 4, etiqueta: "GDACS rojo" };
  if (a.startsWith("orange")) return { nivel: 3, etiqueta: "GDACS naranja" };
  if (a.startsWith("green")) return { nivel: 2, etiqueta: "GDACS verde" };
  return { nivel: 1, etiqueta: "GDACS sin alerta" };
}
