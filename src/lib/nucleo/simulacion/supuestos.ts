// ============================================================
// v224.0 EL ESTRATEGA — SUPUESTOS (separados de DATOS y REGLAS)
// La ley del mandato: una simulación verificable declara SUS
// SUPUESTOS uno a uno — qué asume, por qué es razonable y qué NO
// captura. Un supuesto NO es un hecho: es una decisión editorial
// visible, discutible y cambiante sin tocar datos ni reglas.
// Puro dato: sin BD, sin red, sin React, sin Date.
// ============================================================

/** Qué ES y qué NO es el escenario (se muestra SIEMPRE con los resultados). */
export const ESCENA = {
  nombre: "ESCENARIO DE PRESIÓN POR TEATRO",
  es: "Una herramienta de razonamiento: recombina datos reales documentados en el repo bajo supuestos declarados y pesos que tú ajustas, y ordena los teatros por una puntuación relativa 0–100.",
  noEs: "NO ES UNA PREDICCIÓN. No anticipa ataques, fechas ni escaladas. No es inteligencia militar. Un número alto no significa que algo vaya a pasar: significa que los factores elegidos pesan más en ese teatro.",
  metodo: "Mismo input → mismo output (determinista, sin azar). Sin código de usuarios: solo pesos numéricos dentro de rangos fijos.",
} as const;

/** Un supuesto declarado: la semilla de toda simulación honesta. */
export interface Supuesto {
  id: string; // SUP-<clave>
  texto: string; // qué asume
  justificacion: string; // por qué es razonable
  limite: string; // qué NO captura (honestidad)
}

export const SUPUESTOS: Supuesto[] = [
  {
    id: "SUP-TIEMPO",
    texto:
      "La presión acumulada de un teatro crece con el tiempo transcurrido desde el inicio documentado de su acontecimiento, con rendimiento decreciente (escala logarítmica).",
    justificacion:
      "Los 9 acontecimientos tienen fecha histórica pública verificable (semilla v219 con procedencia). El logaritmo evita que un teatro viejo domine solo por antigüedad: los primeros años pesan mucho, las décadas pesan poco más.",
    limite:
      "No captura altibajos (treguas, escaladas puntuales ni desescaladas): la fecha de inicio es un hecho, la curva es un supuesto editorial.",
  },
  {
    id: "SUP-COBERTURA",
    texto:
      "El número de cables del archivo sobre un teatro es un proxy de la atención informativa sostenida, y esta correlaciona con la actividad observable del frente.",
    justificacion:
      "El archivo es real y medible (fnt:cables: GDELT + 18 medios, conteo vivo en la BD). Es el mismo criterio que ya usa el MODO ESPÍA (índice de tensión 24 h contra media de 7 días).",
    limite:
      "La cobertura hereda los sesgos de los medios: un teatro subreportado puede estar tan activo como uno saturado. Atención ≠ intensidad militar.",
  },
  {
    id: "SUP-FRENTES",
    texto:
      "Más frentes documentados (ciudades con estado en la sala de guerra OSINT de la casa) implican más superficie activa de conflicto en ese teatro.",
    justificacion:
      "Los puntos vienen de geografiaDeTeatro (v220 EL CARTÓGRAFO): solo ciudades ya documentadas en las salas v129, con su fuente OSINT citada. Cero coordenadas inventadas.",
    limite:
      "Un teatro sin sala documentada (Corea) queda sin este factor — se declara ausente, no se inventa. El número de puntos refleja lo que la casa documenta, no todo lo que ocurre.",
  },
  {
    id: "SUP-CAPACIDAD",
    texto:
      "El gasto militar medio (% del PIB, Banco Mundial) de las naciones implicadas es un proxy de la capacidad movilizada que sostiene cada teatro.",
    justificacion:
      "Fuente pública nueva de v223 (fnt:indicadores, CC BY 4.0, atribución preservada): números reales con año del dato y enlace al original.",
    limite:
      "Sin cobertura del Banco Mundial para una nación (Taiwán, Corea del Norte) o sin red, el factor queda NULO y se excluye — la ausencia se declara. Un proxy económico no mide voluntad política ni stock de armamento.",
  },
  {
    id: "SUP-AGREGACION",
    texto:
      "Los factores se combinan en una media ponderada por los pesos del usuario, y un factor sin dato se excluye del cálculo (renormalizando los pesos restantes).",
    justificacion:
      "Es la regla de agregación más transparente posible: cada peso dice exactamente cuánto empuja su factor, y el desglose del resultado lo muestra factor a factor.",
    limite:
      "Una media no modela interacciones (una presión alta en un teatro puede derramarse a otro: eso queda fuera del modelo). Si TODOS los pesos van a cero, el escenario no puntúa nada — y lo declara.",
  },
];

export const LIMITES = [
  "El escenario NO predice el futuro: mide el peso relativo de factores documentados bajo supuestos declarados.",
  "Los ANCLAS de las reglas (días, cables, frentes, % PIB) son decisiones editoriales visibles en el desglose — cambiarlas cambia el resultado.",
  "Los datos vivos (cables, indicadores) cambian con el tiempo: el mismo escenario ejecutado otro día puede dar otra cifra — con su generado a la vista.",
  "Nada de esto es consejo militar, político ni financiero: es una herramienta editorial de comprensión.",
];
