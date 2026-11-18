// ============================================================
// VANGUARD TOOLS — MOTOR DE CÁLCULO CIENTÍFICO Y ESTRATÉGICO
// v406.7 Implementación de Modelos Matemáticos y Calculadoras
// ============================================================

import {
  CINCInput,
  CINCResult,
  VulnerabilidadEnergeticaInput,
  VulnerabilidadEnergeticaResult,
  ScenarioShockModifiers,
  ScenarioImpactResult,
} from "./types";
import { PAISES_DOSSIERS } from "../paises-data";

// Totales mundiales de referencia para el modelo CINC (Correlates of War 2025/2026)
const MUNDO_TOTALES_CINC = {
  gastoMilitarUsd: 2440e9,      // 2.44 billones USD
  personalMilitar: 20.5e6,      // 20.5 millones de soldados
  consumoEnergiaTpe: 14200e6,   // 14.200 Mtoe
  produccionAceroTm: 1890e6,    // 1.890 millones de toneladas
  poblacionUrbana: 4500e6,      // 4.500 millones
  poblacionTotal: 8150e6,       // 8.150 millones
};

/**
 * Calcula el Índice de Capacidad Nacional Compuesta (CINC)
 * de acuerdo con el marco del proyecto académico Correlates of War.
 * CINC = (TPR + UPR + ISPR + ECR + MER + MPR) / 6
 */
export function calculateCINC(input: CINCInput): CINCResult {
  const gastoMilitarShare = Math.min(1, Math.max(0, input.gastoMilitarUsd / MUNDO_TOTALES_CINC.gastoMilitarUsd));
  const personalShare = Math.min(1, Math.max(0, input.personalMilitar / MUNDO_TOTALES_CINC.personalMilitar));
  const energiaShare = Math.min(1, Math.max(0, input.consumoEnergiaTpe / MUNDO_TOTALES_CINC.consumoEnergiaTpe));
  const aceroShare = Math.min(1, Math.max(0, input.produccionAceroTm / MUNDO_TOTALES_CINC.produccionAceroTm));
  const pobUrbanaShare = Math.min(1, Math.max(0, input.poblacionUrbana / MUNDO_TOTALES_CINC.poblacionUrbana));
  const pobTotalShare = Math.min(1, Math.max(0, input.poblacionTotal / MUNDO_TOTALES_CINC.poblacionTotal));

  const scoreCINC = (gastoMilitarShare + personalShare + energiaShare + aceroShare + pobUrbanaShare + pobTotalShare) / 6;

  let rankingEstimado = 1;
  let clasificacion: CINCResult["clasificacion"] = "Estado Menor";

  if (scoreCINC >= 0.15) {
    clasificacion = "Hiperpotencia";
    rankingEstimado = 1;
  } else if (scoreCINC >= 0.08) {
    clasificacion = "Gran Potencia";
    rankingEstimado = 2;
  } else if (scoreCINC >= 0.03) {
    clasificacion = "Potencia Regional";
    rankingEstimado = 5;
  } else if (scoreCINC >= 0.01) {
    clasificacion = "Potencia Mediana";
    rankingEstimado = 12;
  } else {
    clasificacion = "Estado Menor";
    rankingEstimado = 25;
  }

  return {
    scoreCINC: Number(scoreCINC.toFixed(5)),
    rankingEstimado,
    clasificacion,
    desglose: {
      gastoMilitarShare: Number((gastoMilitarShare * 100).toFixed(2)),
      personalShare: Number((personalShare * 100).toFixed(2)),
      energiaShare: Number((energiaShare * 100).toFixed(2)),
      aceroShare: Number((aceroShare * 100).toFixed(2)),
      pobUrbanaShare: Number((pobUrbanaShare * 100).toFixed(2)),
      pobTotalShare: Number((pobTotalShare * 100).toFixed(2)),
    },
  };
}

/**
 * Calcula la vulnerabilidad energética nacional ante interrupciones de suministro
 */
export function calculateEnergyVulnerability(input: VulnerabilidadEnergeticaInput): VulnerabilidadEnergeticaResult {
  const deficitPetroleoBpd = Math.max(0, input.consumoPetroleoBpd - input.produccionPetroleoBpd);
  const ratioImportacionPetroleo = input.consumoPetroleoBpd > 0 ? (deficitPetroleoBpd / input.consumoPetroleoBpd) * 100 : 0;

  const deficitGasBcm = Math.max(0, input.consumoGasBcm - input.produccionGasBcm);
  const ratioImportacionGas = input.consumoGasBcm > 0 ? (deficitGasBcm / input.consumoGasBcm) * 100 : 0;

  const diasAutonomiaCruda = input.mesesReservasEstrategicas * 30;

  // Puntuación de vulnerabilidad de 0 a 100
  // Más importaciones = más riesgo; menos reservas = más riesgo; más paso por chokepoints = más riesgo
  let score = 0;
  score += (ratioImportacionPetroleo * 0.35);
  score += (ratioImportacionGas * 0.25);
  score += (input.dependenciaChokepointPct * 0.25);
  
  // Penalización por bajas reservas
  if (input.mesesReservasEstrategicas < 1) {
    score += 15;
  } else if (input.mesesReservasEstrategicas < 3) {
    score += 8;
  } else {
    score -= Math.min(10, input.mesesReservasEstrategicas);
  }

  const indiceVulnerabilidad = Math.min(100, Math.max(0, Math.round(score)));

  let nivelRiesgo: VulnerabilidadEnergeticaResult["nivelRiesgo"] = "Bajo";
  if (indiceVulnerabilidad >= 75) nivelRiesgo = "Crítico";
  else if (indiceVulnerabilidad >= 50) nivelRiesgo = "Elevado";
  else if (indiceVulnerabilidad >= 25) nivelRiesgo = "Moderado";

  const recomendaciones: string[] = [];
  if (input.mesesReservasEstrategicas < 3) {
    recomendaciones.push("Aumentar reservas estratégicas nacionales a un mínimo de 90 días de importación neta.");
  }
  if (input.dependenciaChokepointPct > 40) {
    recomendaciones.push("Diversificar orígenes marítimos para reducir exposición al Estrecho de Ormuz y Bab el-Mandeb.");
  }
  if (ratioImportacionGas > 60) {
    recomendaciones.push("Acelerar plantas de regasificación de GNL y contratos bilaterales con múltiples suministradores.");
  }
  if (recomendaciones.length === 0) {
    recomendaciones.push("Posición energética robusta. Mantener monitoreo de precios spot y capacidad de refinación interna.");
  }

  return {
    indiceVulnerabilidad,
    nivelRiesgo,
    diasAutonomiaCruda,
    deficitPetroleoBpd: Number(deficitPetroleoBpd.toFixed(2)),
    deficitGasBcm: Number(deficitGasBcm.toFixed(2)),
    recomendaciones,
  };
}

/**
 * Simulador de Estrés Geopolítico y Modificadores de Escenario
 */
export function runGeopoliticalStressTest(shocks: ScenarioShockModifiers): ScenarioImpactResult {
  let inflacion = 0;
  let retrasoDias = 0;
  let tension = 35; // Nivel base de tensión internacional

  // Shock en Petróleo
  if (shocks.aumentoCrudoDolares > 0) {
    // Cada $10 de subida en barril añade ~0.45% a la inflación mundial
    inflacion += (shocks.aumentoCrudoDolares / 10) * 0.45;
    tension += (shocks.aumentoCrudoDolares / 10) * 3;
  }

  // Bloqueo de Estrechos
  if (shocks.bloqueoOrmuz) {
    inflacion += 2.8;
    retrasoDias += 16;
    tension += 30;
  }
  if (shocks.bloqueoMalaca) {
    inflacion += 2.2;
    retrasoDias += 19;
    tension += 25;
  }
  if (shocks.bloqueoSuez) {
    inflacion += 1.1;
    retrasoDias += 12;
    tension += 14;
  }

  // Aranceles Globales
  if (shocks.arancelesGlobalesPct > 0) {
    inflacion += (shocks.arancelesGlobalesPct / 10) * 0.7;
    tension += (shocks.arancelesGlobalesPct / 10) * 4;
  }

  // Aumento de Gasto en Defensa
  if (shocks.aumentoGastoDefensaPct > 0) {
    tension += (shocks.aumentoGastoDefensaPct / 10) * 5;
  }

  // Disrupción de Semiconductores
  if (shocks.disrupcionSemiconductores) {
    inflacion += 1.9;
    retrasoDias += 30;
    tension += 22;
  }

  const indiceTensionGlobal = Math.min(100, Math.round(tension));
  const inflacionAdicionalGlobalPct = Number(inflacion.toFixed(2));

  const sectoresMasAfectados: string[] = [];
  if (shocks.aumentoCrudoDolares > 20 || shocks.bloqueoOrmuz) {
    sectoresMasAfectados.push("Aviación y Transporte Terrestre", "Petroquímica y Plásticos", "Generación Eléctrica Térmica");
  }
  if (shocks.bloqueoMalaca || shocks.disrupcionSemiconductores) {
    sectoresMasAfectados.push("Electrónica de Consumo", "Automoción e Industria Pesada", "Centros de Cómputo e IA");
  }
  if (shocks.arancelesGlobalesPct > 15) {
    sectoresMasAfectados.push("Sector Agroalimentario", "Bienes de Consumo y Retail", "Banca y Mercados de Bonos");
  }
  if (sectoresMasAfectados.length === 0) {
    sectoresMasAfectados.push("Impacto sectorial moderado y absorbible a corto plazo.");
  }

  const ganadoresGeopoliticos: string[] = [];
  if (shocks.bloqueoOrmuz || shocks.aumentoCrudoDolares > 30) {
    ganadoresGeopoliticos.push("Productores no-OPEP (EE.UU., Brasil, Guyana, Noruega)", "Sector Carbón y Energía Nuclear");
  }
  if (shocks.arancelesGlobalesPct > 10) {
    ganadoresGeopoliticos.push("Industrias manufactureras locales protegidas", "Rutas logísticas terrestres transcontinentales");
  }
  if (ganadoresGeopoliticos.length === 0) {
    ganadoresGeopoliticos.push("Economías autosuficientes y con bajas deudas en divisas extranjeras.");
  }

  const perdedoresGeopoliticos: string[] = [];
  if (shocks.bloqueoMalaca || shocks.bloqueoOrmuz) {
    perdedoresGeopoliticos.push("Economías netamente importadoras de energía (Japón, Corea del Sur, Alemania, India)");
  }
  if (shocks.arancelesGlobalesPct > 20) {
    perdedoresGeopoliticos.push("Naciones fuertemente orientadas a la exportación industrial.");
  }
  if (perdedoresGeopoliticos.length === 0) {
    perdedoresGeopoliticos.push("Consumidores finales por presión de precios acumulada.");
  }

  let resumenImpacto = `Bajo este escenario simulado, la inflación mundial experimentaría una presión al alza del +${inflacionAdicionalGlobalPct}% y los fletes marítimos se demorarían un promedio de +${retrasoDias} días. El nivel de tensión geopolítica general se sitúa en ${indiceTensionGlobal}/100.`;

  return {
    inflacionAdicionalGlobalPct,
    retrasoFleteMaritimoDias: retrasoDias,
    indiceTensionGlobal,
    sectoresMasAfectados,
    ganadoresGeopoliticos,
    perdedoresGeopoliticos,
    resumenImpacto,
  };
}

/**
 * Agregador de Poder para Bloques y Coaliciones Regionales
 */
export function calculateRegionalPowerAggregate(paisesIds: string[]) {
  const paises = PAISES_DOSSIERS.filter((p) => paisesIds.includes(p.id));

  let pibTotal = 0;
  let gastoMilitarTotal = 0;
  let poblacionTotal = 0;
  let efectivosActivosTotal = 0;
  let ojivasTotal = 0;
  let petroleoTotal = 0;

  paises.forEach((p) => {
    pibTotal += p.pibNominalBillionUsd;
    gastoMilitarTotal += p.gastoMilitarBillionUsd;
    poblacionTotal += p.poblacion;
    efectivosActivosTotal += p.efectivosActivos;
    ojivasTotal += p.ojivasNucleares;
    petroleoTotal += p.produccionPetroleoBpd;
  });

  return {
    count: paises.length,
    pibTotal: Math.round(pibTotal),
    gastoMilitarTotal: Math.round(gastoMilitarTotal),
    poblacionTotal: Math.round(poblacionTotal),
    efectivosActivosTotal: Math.round(efectivosActivosTotal),
    ojivasTotal,
    petroleoTotal: Number(petroleoTotal.toFixed(1)),
    pibPerCapitaPromedio: poblacionTotal > 0 ? Math.round((pibTotal * 1e9) / (poblacionTotal * 1e6)) : 0,
    gastoDefensaPibPromedio: pibTotal > 0 ? Number(((gastoMilitarTotal / pibTotal) * 100).toFixed(2)) : 0,
  };
}
