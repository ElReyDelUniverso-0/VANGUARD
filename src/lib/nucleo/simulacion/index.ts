// ============================================================
// v224.0 EL ESTRATEGA — EL RESULTADO (ensamblado separado)
// La cara pública del escenario: ejecuta la secuencia honesta
//   variables (validadas) → datos (con procedencia) → reglas
//   (puras) → resultados (con desglose)
// y devuelve TODO por separado — la ley del mandato: una
// simulación verificable muestra SUS piezas, no un número mágico.
// Jamás se presenta como predicción: ESCENA.noEs viaja SIEMPRE.
// ============================================================

import { ESCENA, SUPUESTOS, LIMITES, type Supuesto } from "./supuestos";
import { VARIABLES, normalizarVariables, variablesPorDefecto, type VariableSimulacion } from "./variables";
import { evaluarTeatro, ordenaResultados, type DatoTeatro, type ResultadoTeatro } from "./reglas";
import { recogerDatos } from "./datos";

// re-export de los tipos del desglose — la isla client y las fichas
// los consumen por el mismo contrato (import type, sin BD en el cliente)
export type { DatoTeatro, ResultadoTeatro };

/** El escenario completo, con todas sus piezas separadas. */
export interface Escenario {
  ok: true;
  escena: typeof ESCENA;
  /** «ESCENARIO — NO ES PREDICCIÓN»: la etiqueta que JAMÁS falta. */
  etiqueta: string;
  generado: string;
  supuestos: Supuesto[];
  variables: {
    catalogo: VariableSimulacion[];
    aplicadas: Record<string, number>;
  };
  /** Los datos crudos por teatro (SEPARADOS de los resultados). */
  datos: DatoTeatro[];
  notaBd: string | null;
  /** Los resultados (SEPARADOS de los datos), mayor presión primero. */
  resultados: ResultadoTeatro[];
  limites: string[];
}

export interface EscenarioInvalido {
  ok: false;
  errores: string[];
  variablesValidas: VariableSimulacion[];
}

/** El catálogo sin ejecutar (para el GET de la API y la página). */
export function catalogoSimulacion() {
  return {
    escena: ESCENA,
    supuestos: SUPUESTOS,
    variables: VARIABLES,
    limites: LIMITES,
  };
}

/**
 * Ejecuta el escenario con las variables del usuario (ya llegan
 * crudas: aquí se validan — 400 honesto si algo no encaja).
 * Determinista salvo los datos vivos (cables/indicadores), que
 * viajan con su `generado`.
 */
export async function ejecutarEscenario(variablesCrudas: unknown): Promise<Escenario | EscenarioInvalido> {
  const validadas = normalizarVariables(variablesCrudas);
  if (!validadas.ok) {
    return { ok: false, errores: validadas.errores, variablesValidas: VARIABLES };
  }

  const { datos, notaBd, ahoraIso } = await recogerDatos();
  const resultados = ordenaResultados(datos.map((d) => evaluarTeatro(d, validadas.valores)));

  return {
    ok: true,
    escena: ESCENA,
    etiqueta: "ESCENARIO — NO ES PREDICCIÓN",
    generado: ahoraIso,
    supuestos: SUPUESTOS,
    variables: {
      catalogo: VARIABLES,
      aplicadas: validadas.valores,
    },
    datos,
    notaBd,
    resultados,
    limites: LIMITES,
  };
}

/** Los pesos por defecto, para la página server. */
export { variablesPorDefecto };
