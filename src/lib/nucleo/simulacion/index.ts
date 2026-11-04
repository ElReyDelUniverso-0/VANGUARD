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
import { ANCLAS, evaluarTeatro, ordenaResultados, type DatoTeatro, type ResultadoTeatro } from "./reglas";
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

/** v233.0 LA BALANZA — una ancla editorial explicada (los valores
 * viven en reglas.ts ANCLAS; aquí solo se ENALTECEN a la vista). */
export interface AnclaCatalogo {
  id: string;
  valor: string;
  texto: string;
}

/** Las anclas del modelo, decoradas para la página: decisiones
 * editoriales, no datos — por eso se muestran y se justifican. */
export function anclasDelCatalogo(): AnclaCatalogo[] {
  const dias = (n: number) => n.toLocaleString("es-ES");
  return [
    {
      id: "ANCLAS.TIEMPO_DIAS",
      valor: `${dias(ANCLAS.TIEMPO_DIAS)} días`,
      texto:
        "El factor tiempo llega a 100 cuando el hecho lleva 10 años en marcha. La normalización es logarítmica (rendimiento decreciente): los primeros años pesan más que los últimos — un conflicto de 2 meses y otro de 20 años no pueden puntuar igual, pero el año 9 y el año 10 tampoco se diferencian mucho.",
    },
    {
      id: "ANCLAS.COBERTURA_CABLES",
      valor: `${dias(ANCLAS.COBERTURA_CABLES)} cables`,
      texto:
        "El factor cobertura satura a 100 con 500 cables del archivo sobre el teatro. Es un techo editorial: los teatros más cubiertos compiten arriba y los recién abiertos no desaparecen — su cobertura baja, se declara, y los demás factores hablan.",
    },
    {
      id: "ANCLAS.FRENTES",
      valor: `${ANCLAS.FRENTES} frentes`,
      texto:
        "El factor frentes llega a 100 con 12 frentes documentados — hoy el techo real de la casa es la sala OSINT de Ucrania, la más cartografiada. Un teatro sin sala OSINT no se finge: su factor queda null y se excluye.",
    },
    {
      id: "ANCLAS.CAPACIDAD_PCT",
      valor: `${ANCLAS.CAPACIDAD_PCT} % del PIB`,
      texto:
        "El factor capacidad satura a 100 con un gasto militar medio del 10 % del PIB — el umbral de las economías en pie de guerra. Es la media de las naciones del teatro CON dato del Banco Mundial; sin cobertura, null declarado.",
    },
  ];
}

/** El catálogo sin ejecutar (para el GET de la API y la página). */
export function catalogoSimulacion() {
  return {
    escena: ESCENA,
    supuestos: SUPUESTOS,
    variables: VARIABLES,
    anclas: anclasDelCatalogo(),
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
