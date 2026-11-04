// ============================================================
// v224.0 EL ESTRATEGA — VARIABLES (separadas de DATOS y REGLAS)
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
  },
  {
    id: "pesoCobertura",
    nombre: "Peso de la cobertura",
    descripcion: "Cuánto empuja el volumen de cables reales del archivo sobre el teatro.",
    min: 0,
    max: 2,
    paso: 0.1,
    porDefecto: 1,
  },
  {
    id: "pesoFrentes",
    nombre: "Peso de los frentes",
    descripcion: "Cuánto empujan los frentes documentados en la sala OSINT de la casa.",
    min: 0,
    max: 2,
    paso: 0.1,
    porDefecto: 1,
  },
  {
    id: "pesoCapacidad",
    nombre: "Peso de la capacidad",
    descripcion: "Cuánto empuja el gasto militar medio (% PIB, Banco Mundial) de las naciones implicadas.",
    min: 0,
    max: 2,
    paso: 0.1,
    porDefecto: 1,
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
