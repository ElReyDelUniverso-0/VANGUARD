// ============================================================
// v224.0 EL ESTRATEGA — VARIABLES (separadas de DATOS y REGLAS)
// v233.0 LA BALANZA — cada variable se EXPLICA a sí misma: qué
// factor mueve, de dónde sale el dato que multiplica (fnt:),
// contra qué ancla editorial satura, qué significa 0 y qué
// significa 2, y la PUERTA real del núcleo donde vive ese dato
// (mismo censo de puertas de v230 — cero rutas inventadas).
// Lo ÚNICO que el usuario puede mover: 4 pesos numéricos dentro
// de un rango fijo. Nada de código, nada de fórmulas a medida —
// la ley del mandato es «sin ejecutar código arbitrario de
// usuarios»: aquí solo entran números validados contra este
// catálogo, todo lo demás se rechaza con 400 y los errores
// declarados.
// Puro dato + validación pura: sin BD, sin red, sin React.
// ============================================================

/** Una variable ajustable del escenario. */
export interface VariableSimulacion {
  id: string; // peso<Factor> — la clave exacta que acepta la API
  nombre: string; // etiqueta humana
  descripcion: string; // qué empuja este peso
  min: number; // rango CERRADO — fuera de aquí, 400
  max: number;
  paso: number; // granularidad honesta (0.1)
  porDefecto: number;
  // ── v233.0 LA BALANZA — la explicación completa (aditivo) ──
  /** Qué factor del desglose mueve este peso. */
  mueve: string;
  /** De dónde sale el dato que este peso multiplica (fnt:…). */
  fuente: string;
  /** La ancla editorial contra la que satura el factor. */
  ancla: string;
  /** Qué significa ponerlo a 0. */
  cero: string;
  /** Qué significa ponerlo a 2. */
  dos: string;
  /** La puerta REAL del núcleo donde vive el dato (v230 — cero
   * rutas inventadas; el archivo declara las puertas honestas). */
  puerta: { etiqueta: string; ruta: string };
}

export const VARIABLES: VariableSimulacion[] = [
  {
    id: "pesoTiempo",
    nombre: "Peso del tiempo",
    descripcion: "Cuánto empuja la antigüedad del acontecimiento (desde su fecha histórica pública).",
    min: 0,
    max: 2,
    paso: 0.1,
    porDefecto: 1,
    mueve: "el factor TIEMPO del desglose: los días transcurridos desde que el hecho empezó, normalizados con rendimiento decreciente (los primeros años pesan más que los últimos).",
    fuente: "fnt:acontecimientos — la fecha de inicio es un hecho histórico público documentado (semilla v219: Ucrania 24-02-2022, Gaza 07-10-2023, Sudán 15-04-2023…).",
    ancla: "satura a 100 a los 3 650 días (10 años) — ANCLAS.TIEMPO_DIAS de reglas.ts.",
    cero: "a 0, la antigüedad del hecho deja de contar en la presión.",
    dos: "a 2, la antigüedad cuenta el doble frente a los demás factores (y los pesos restantes renormalizan).",
    puerta: { etiqueta: "LOS ACONTECIMIENTOS", ruta: "/nucleo?tipo=acontecimiento" },
  },
  {
    id: "pesoCobertura",
    nombre: "Peso de la cobertura",
    descripcion: "Cuánto empuja el volumen de cables reales del archivo sobre el teatro.",
    min: 0,
    max: 2,
    paso: 0.1,
    porDefecto: 1,
    mueve: "el factor COBERTURA del desglose: cuántos cables reales del archivo llevan el conflictTag del teatro.",
    fuente: "fnt:cables — conteo vivo de la BD de la agencia (una groupBy por conflictTag en cada ejecución).",
    ancla: "satura a 100 con 500 cables — ANCLAS.COBERTURA_CABLES de reglas.ts.",
    cero: "a 0, el volumen de cobertura deja de contar en la presión.",
    dos: "a 2, la cobertura cuenta el doble frente a los demás factores.",
    puerta: { etiqueta: "EL ARCHIVO DE CABLES", ruta: "/nucleo?tipo=noticia" },
  },
  {
    id: "pesoFrentes",
    nombre: "Peso de los frentes",
    descripcion: "Cuánto empujan los frentes documentados en la sala OSINT de la casa.",
    min: 0,
    max: 2,
    paso: 0.1,
    porDefecto: 1,
    mueve: "el factor FRENTES del desglose: cuántos puntos de frente documenta la sala de guerra OSINT del teatro.",
    fuente: "fnt:teatros — las salas OSINT de la casa (v129→v220→v225) con fuente citada (ISW, ACLED, OCHA, ACNUR); un teatro sin sala se declara, no se finge.",
    ancla: "satura a 100 con 12 frentes (el teatro más cartografiado hoy: la sala de Ucrania) — ANCLAS.FRENTES de reglas.ts.",
    cero: "a 0, la cartografía de frentes deja de contar en la presión.",
    dos: "a 2, los frentes cuentan el doble frente a los demás factores.",
    puerta: { etiqueta: "EL MAPA DEL FRENTE", ruta: "/ver-guerra" },
  },
  {
    id: "pesoCapacidad",
    nombre: "Peso de la capacidad",
    descripcion: "Cuánto empuja el gasto militar medio (% PIB, Banco Mundial) de las naciones implicadas.",
    min: 0,
    max: 2,
    paso: 0.1,
    porDefecto: 1,
    mueve: "el factor CAPACIDAD del desglose: el gasto militar medio (% del PIB) de las naciones del teatro CON dato del Banco Mundial.",
    fuente: "fnt:indicadores — API v2 del Banco Mundial, CC BY 4.0, cache 6 h (v223); sin cobertura o sin red queda null y se declara.",
    ancla: "satura a 100 con un 10 % del PIB — ANCLAS.CAPACIDAD_PCT de reglas.ts.",
    cero: "a 0, la capacidad económica deja de contar en la presión.",
    dos: "a 2, la capacidad cuenta el doble frente a los demás factores.",
    puerta: { etiqueta: "LAS FICHAS DE PAÍS", ruta: "/nucleo?tipo=pais" },
  },
];

/** Los pesos por defecto, listos para las reglas. */
export function variablesPorDefecto(): Record<string, number> {
  return Object.fromEntries(VARIABLES.map((v) => [v.id, v.porDefecto]));
}

/** Resultado de validar las variables del usuario (o los errores). */
export type VariablesValidadas =
  | { ok: true; valores: Record<string, number> }
  | { ok: false; errores: string[] };

/**
 * La ÚNICA puerta de entrada de variables de usuario: rechaza
 * claves desconocidas, valores no numéricos y valores fuera de
 * rango — cada rechazo con su mensaje. Redondea al paso 0.1 para
 * que el determinismo no dependa de ruido de coma flotante.
 */
export function normalizarVariables(entrada: unknown): VariablesValidadas {
  if (entrada === undefined || entrada === null) {
    return { ok: true, valores: variablesPorDefecto() };
  }
  if (typeof entrada !== "object" || Array.isArray(entrada)) {
    return { ok: false, errores: ["variables debe ser un objeto de pesos numéricos"] };
  }
  const errores: string[] = [];
  const valores: Record<string, number> = {};
  const pares = Object.entries(entrada as Record<string, unknown>);
  for (const [clave, valor] of pares) {
    const catalogo = VARIABLES.find((v) => v.id === clave);
    if (!catalogo) {
      const validas = VARIABLES.map((v) => v.id).join(", ");
      errores.push(`variable desconocida: «${clave}» — las válidas son: ${validas}`);
      continue;
    }
    if (typeof valor !== "number" || !Number.isFinite(valor)) {
      errores.push(`«${clave}» debe ser un número finito (recibido: ${JSON.stringify(valor)})`);
      continue;
    }
    if (valor < catalogo.min || valor > catalogo.max) {
      errores.push(`«${clave}» debe estar entre ${catalogo.min} y ${catalogo.max} (recibido: ${valor})`);
      continue;
    }
    valores[clave] = Math.round(valor * 10) / 10;
  }
  if (errores.length > 0) return { ok: false, errores };
  // las variables no enviadas toman su defecto (escenario completo)
  return { ok: true, valores: { ...variablesPorDefecto(), ...valores } };
}
