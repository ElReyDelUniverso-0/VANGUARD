// v100.0 LABORATORIO DEL DESTINO — MOTOR DE SIMULACIÓN CONTRAFACTUAL
// "¿Y SI...?" — el laboratorio conecta EL ESPEJO con LA SIMULACIÓN: parte del
// estado REAL del mundo Vanguard (las crisis que el Espejo cuenta y el frente
// del Karsk que se mueve cada noche), le aplica UNA perturbación con DOSIS
// ajustable y corre una guerra día a día con un modelo de FACTORES MÚLTIPLES
// (fuerza, logística, moral, terreno, economía, clima, aliados, ciber, umbral
// nuclear) + atrición tipo Lanchester + escalera de escalada 1-6 + MONTE CARLO
// de 24 semillas deterministas para las probabilidades del final.
// REGLA DE LA CASA: esto es SIMULACIÓN, no predicción — cada resultado lleva
// su etiqueta y su desglose explicable. Motor compartido: el SIMULADOR DE
// GUERRAS (v13) bebe de aquí la moral, el suministro y la escalada.

import { fnvHash, mulberry32, clamp, predecir, evaluarNeuronal, bucketMinutos, type Prediccion, type Veredicto } from "./neurona-core";
import { areaOcupada } from "./frente-zonas-data";

// el día de HOY del teatro del Karsk (0 = hace 13 días; el frente vive 14 días)
const DIA_HOY = 13;

// ============================================================
// TIPOS
// ============================================================

export type LadoLab = {
  id: "A" | "B";
  nombre: string;
  bando: string;
  /** fuerza militar cruda (índice 10-100) */
  fuerza: number;
  /** aeronaves/buques/misiles como multiplicadores pequeños */
  aire: number; // 0-2
  mar: number; // 0-2
  misiles: number; // 0-2
  /** doctrina y experiencia 0-10 */
  doctrina: number;
  /** ventaja de terreno (defensa) 0.85-1.4 */
  terreno: number;
  /** arsenal estratégico declarado */
  nuclear: boolean;
  /** tesoro de guerra en $B (se agota) */
  tesoro: number;
  acento: string;
};

export interface EscenarioLab {
  id: string; // == crisis id del Espejo
  nombre: string;
  region: string;
  resumen: string;
  /** tensión base del Espejo al arrancar (0-100) */
  tensionBase: number;
  /** % del teatro bajo control del agresor B hoy (línea base del Espejo) */
  frenteBase: number;
  A: LadoLab;
  B: LadoLab;
  /** claves logísticas que citan los eventos (estrecho, corredor, puente) */
  claves: string[];
  /** teatro abstracto: 4 pines [x,y] % (capital A, capital B, frente, clave) */
  pins: { x: number; y: number; tipo: "capital" | "frente" | "clave" }[];
}

export type PerturbacionId =
  | "capital-amenazada" | "refuerzos-externos" | "clave-cerrada" | "proxy-cambia"
  | "alto-fuego" | "golpe-retaguardia" | "movilizacion-total" | "sanciones-totales";

export interface Perturbacion {
  id: PerturbacionId;
  nombre: string;
  descripcion: string;
  icono: string; // nombre lucide sugerido para la UI
  color: string;
}

export type ConfigLab = {
  crisisId: string;
  perturbacion: PerturbacionId;
  /** dosis de la perturbación 1-5 */
  dosis: number;
  /** horizonte en días */
  horizonte: 90 | 180 | 240;
};

export interface EventoSim {
  dia: number;
  texto: string;
  tipo: "militar" | "diplomacia" | "economia" | "ciber" | "humanitario" | "nuclear" | "espacio" | "social" | "giro";
  color: string;
  /** efecto neto en el frente (-2 a +2, positivo empuja a B) */
  bias: number;
}

export interface DiaSim {
  dia: number;
  /** % del teatro bajo control de B (0-100) */
  frente: number;
  bajasA: number;
  bajasB: number;
  coste: number; // $B acumulados
  escalada: number; // 1-6
  moralA: number; // 0-1
  moralB: number;
  suministroA: number; // 0-1
  suministroB: number;
}

export interface ResultadoLab {
  serie: DiaSim[];
  eventos: EventoSim[];
  fin: { nombre: string; detalle: string; dia: number; ganador: "A" | "B" | "T" | "N" | "P" };
  monteCarlo: { nombre: string; probabilidad: number; ganador: ResultadoLab["fin"]["ganador"] }[];
  proyeccion: Prediccion;
  veredicto: Veredicto;
  /** LO QUE CAMBIA vs línea base (misma semilla, dosis 0) */
  deltas: {
    frenteFinal: number; // puntos %
    bajas: number; // % de diferencia combinada
    coste: number; // % de diferencia
    duracion: number; // días de diferencia
  };
  /** desglose explicable de factores al cierre */
  factores: { nombre: string; peso: number; nota: string; color: string }[];
  tensionFinal: number;
}

export const NIVELES_ESCALADA = [
  { n: 1, nombre: "CONTENCIÓN", color: "#4ADE80" },
  { n: 2, nombre: "INCIDENTES", color: "#FFD166" },
  { n: 3, nombre: "COMBATE LOCAL", color: "#FFA030" },
  { n: 4, nombre: "GUERRA LIMITADA", color: "#FF6B5A" },
  { n: 5, nombre: "GUERRA TOTAL", color: "#FF3B30" },
  { n: 6, nombre: "UMBRAL NUCLEAR", color: "#FF0055" },
] as const;

export const FINALES = {
  victoriaB: { nombre: "VICTORIA DEL AGRESOR", detalle: "el frente colapsa y el bando B ocupa el teatro", ganador: "B" as const },
  victoriaA: { nombre: "REPULSA Y CONTRAATAQUE", detalle: "el bando A recupera terreno y rompe la ofensiva", ganador: "A" as const },
  congelacion: { nombre: "CONGELACIÓN", detalle: "el frente se fosiliza: guerra de desgaste sin mueve", ganador: "T" as const },
  mesa: { nombre: "SALIDA NEGOCIADA", detalle: "la escalada obliga a la mesa: alto el fuego supervisado", ganador: "P" as const },
  nuclear: { nombre: "UMBRAL CRUZADO", detalle: "la escalada llegó al nivel 6 — no hay victoria dentro del círculo", ganador: "N" as const },
} as const;

// ============================================================
// CATÁLOGO — LAS 4 CRISIS DEL ESPEJO, LISTAS PARA SIMULAR
// ============================================================

export const LAB_ESCENARIOS: EscenarioLab[] = [
  {
    id: "karsk",
    nombre: "Guerra del Valle del Karsk",
    region: "Europa Oriental · Vanguard",
    resumen: "El teatro principal: un frente que se mueve noche a noche entre el Donalto y la Federación Nórdica, con tres ejes de presión activos.",
    tensionBase: 78,
    frenteBase: Math.round(clamp((areaOcupada(DIA_HOY) / 17200) * 100, 18, 60)),
    A: { id: "A", nombre: "República del Donalto", bando: "defensor + coalición", fuerza: 62, aire: 0.9, mar: 0.5, misiles: 1.1, doctrina: 8.5, terreno: 1.18, nuclear: false, tesoro: 64, acento: "#3DDCFF" },
    B: { id: "B", nombre: "Federación Nórdica", bando: "agresor", fuerza: 78, aire: 1.35, mar: 0.9, misiles: 1.6, doctrina: 7.5, terreno: 1.0, nuclear: true, tesoro: 210, acento: "#FF6B4D" },
    claves: ["corredor sur", "paso de Svatove", "puente de Volnovakha"],
    pins: [{ x: 22, y: 30, tipo: "capital" }, { x: 74, y: 62, tipo: "capital" }, { x: 46, y: 46, tipo: "frente" }, { x: 40, y: 76, tipo: "clave" }],
  },
  {
    id: "vand",
    nombre: "Crisis del Estrecho de Vand",
    region: "Índico · Vanguard",
    resumen: "La garganta del crudo: la Liga Tarquinia y el Emirato de Sarn miden flotas sin declararse la guerra.",
    tensionBase: 66,
    frenteBase: 34,
    A: { id: "A", nombre: "Liga Tarquinia", bando: "escuadra de contención", fuerza: 70, aire: 1.1, mar: 1.7, misiles: 1.2, doctrina: 8.0, terreno: 1.12, nuclear: false, tesoro: 180, acento: "#3DDCFF" },
    B: { id: "B", nombre: "Emirato de Sarn", bando: "flota costera + proxies", fuerza: 55, aire: 0.7, mar: 1.1, misiles: 1.4, doctrina: 6.5, terreno: 1.05, nuclear: false, tesoro: 95, acento: "#B48CFF" },
    claves: ["estrecho de Vand", "ruta de los tanqueros", "baterías costeras"],
    pins: [{ x: 30, y: 24, tipo: "capital" }, { x: 66, y: 70, tipo: "capital" }, { x: 50, y: 48, tipo: "frente" }, { x: 52, y: 40, tipo: "clave" }],
  },
  {
    id: "zenit",
    nombre: "Anomalía de la Cuenca de Zenit",
    region: "Índico austral · Vanguard",
    resumen: "Un ping sin catálogo y un buque neutral camino del epicentro: la crisis donde cada país escucha lo que teme.",
    tensionBase: 58,
    frenteBase: 22,
    A: { id: "A", nombre: "Coalición de Vigilancia", bando: "flota científico-militar", fuerza: 58, aire: 1.0, mar: 1.5, misiles: 0.9, doctrina: 7.0, terreno: 1.1, nuclear: false, tesoro: 120, acento: "#4DFFC4" },
    B: { id: "B", nombre: "Reino Hermitano", bando: "programa oculto", fuerza: 52, aire: 0.6, mar: 0.7, misiles: 1.7, doctrina: 5.5, terreno: 1.0, nuclear: true, tesoro: 40, acento: "#FF4D4D" },
    claves: ["epicentro del ping", "corredor del buque neutral", "bóveda abisal"],
    pins: [{ x: 28, y: 28, tipo: "capital" }, { x: 70, y: 64, tipo: "capital" }, { x: 48, y: 52, tipo: "frente" }, { x: 55, y: 44, tipo: "clave" }],
  },
  {
    id: "sarn",
    nombre: "La cuestión de Sarn",
    region: "Golfo · Vanguard",
    resumen: "Sucesión sin calendario, guardias relevados en silencio: el problema no es quién, sino cuánto dura el quién.",
    tensionBase: 71,
    frenteBase: 28,
    A: { id: "A", nombre: "Guardia del Emirato", bando: "estatus quo", fuerza: 48, aire: 0.8, mar: 0.8, misiles: 1.0, doctrina: 6.0, terreno: 1.15, nuclear: false, tesoro: 88, acento: "#FFC94D" },
    B: { id: "B", nombre: "Facción del Consejo", bando: "sucesión forzada", fuerza: 44, aire: 0.6, mar: 0.5, misiles: 0.9, doctrina: 5.0, terreno: 0.95, nuclear: false, tesoro: 52, acento: "#FF8A3D" },
    claves: ["palacio del consejo", "aeropuerto de Bandar Sable", "depósitos costeros"],
    pins: [{ x: 34, y: 30, tipo: "capital" }, { x: 62, y: 66, tipo: "capital" }, { x: 48, y: 50, tipo: "frente" }, { x: 58, y: 38, tipo: "clave" }],
  },
];

export const PERTURBACIONES: Perturbacion[] = [
  { id: "capital-amenazada", nombre: "La capital al borde", descripcion: "Una punta de lanza de B llega al cinturón de la capital de A: pánico, evacuación de ministerios y moral por el suelo.", icono: "Building2", color: "#FF3B30" },
  { id: "refuerzos-externos", nombre: "Refuerzos externos a A", descripcion: "Un bloque externo mueve tres cuerpos de ejército con misiles de crucero a la defensa de A.", icono: "Plane", color: "#3DDCFF" },
  { id: "clave-cerrada", nombre: "La clave logística se cierra", descripcion: "El estrecho/corredor de la crisis se cierra al tráfico: la máquina de guerra B pierde su vía de alimentación.", icono: "Anchor", color: "#FFD166" },
  { id: "proxy-cambia", nombre: "El proxy cambia de bando", descripcion: "La milicia financiada por B pasa a pelear para A con todo su inventario.", icono: "Users", color: "#4DFFC4" },
  { id: "alto-fuego", nombre: "Alto el fuego firmado", descripcion: "La mediación logra un cese supervisado: la escalada cae y el frente se congela en la línea del día.", icono: "Handshake", color: "#A78BFA" },
  { id: "golpe-retaguardia", nombre: "Golpe profundo a la retaguardia de B", descripcion: "Acróticamente, los depósitos y ferrocarriles que alimentan a B arden la misma noche.", icono: "Rocket", color: "#FF6B5A" },
  { id: "movilizacion-total", nombre: "Movilización total de A", descripcion: "A decreta leva general: medio millón de bayonetas nuevas en 60 días, economía bajo presión.", icono: "Flag", color: "#FFA030" },
  { id: "sanciones-totales", nombre: "Sanciones máximas sobre B", descripcion: "Régimen de sanción total: el tesoro de guerra B se evapora y las fábricas pierden chips.", icono: "Banknote", color: "#C9A85C" },
];

export function escenarioPorId(id: string): EscenarioLab {
  return LAB_ESCENARIOS.find((e) => e.id === id) ?? LAB_ESCENARIOS[0];
}

// ============================================================
// MOTOR — MODELO DE FACTORES MÚLTIPLES
// ============================================================

interface EstadoDia {
  dia: number;
  frente: number; // % bajo control de B
  fuerzaA: number; fuerzaB: number;
  moralA: number; moralB: number;
  sumiA: number; sumiB: number;
  tesoroA: number; tesoroB: number;
  escalada: number;
  bajasA: number; bajasB: number;
  coste: number;
  activa: boolean; // la guerra sigue
  nucleo: boolean; // cruce del umbral nuclear
  altoFuego: boolean;
  diaFin: number;
}

type Efectos = {
  fuerzaA: number; fuerzaB: number;
  sumiA: number; sumiB: number;
  moralA: number; moralB: number;
  tesoroA: number; tesoroB: number;
  escaladaInicial: number;
  altoFuego: boolean;
  friccionB: number; // presión logística extra sobre B
};

/** Efectos de la perturbación escalados por DOSIS (1-5). */
function efectosDe(p: PerturbacionId, dosis: number, esc: EscenarioLab): Efectos {
  const d = dosis / 5; // 0.2..1.0
  const base: Efectos = { fuerzaA: 1, fuerzaB: 1, sumiA: 1, sumiB: 1, moralA: 1, moralB: 1, tesoroA: 1, tesoroB: 1, escaladaInicial: 0, altoFuego: false, friccionB: 0 };
  switch (p) {
    case "capital-amenazada":
      base.moralA = 1 - 0.38 * d;
      base.moralB = 1 + 0.18 * d;
      base.escaladaInicial = 1 + Math.round(d * 2);
      base.fuerzaB = 1 + 0.12 * d;
      break;
    case "refuerzos-externos":
      base.fuerzaA = 1 + 0.42 * d;
      base.sumiA = 1 + 0.1 * d;
      base.tesoroA = 1 + 0.2 * d;
      break;
    case "clave-cerrada":
      base.sumiB = 1 - 0.5 * d;
      base.tesoroB = 1 - 0.3 * d;
      base.escaladaInicial = Math.round(d * 1.5);
      break;
    case "proxy-cambia":
      base.fuerzaB = 1 - 0.22 * d;
      base.fuerzaA = 1 + 0.14 * d;
      base.moralB = 1 - 0.2 * d;
      break;
    case "alto-fuego":
      base.altoFuego = true;
      base.escaladaInicial = -3;
      break;
    case "golpe-retaguardia":
      base.sumiB = 1 - 0.62 * d;
      base.moralB = 1 - 0.16 * d;
      base.escaladaInicial = 1 + Math.round(d);
      break;
    case "movilizacion-total":
      base.fuerzaA = 1 + 0.6 * d;
      base.tesoroA = 1 - 0.35 * d;
      base.moralA = 1 + 0.08 * d;
      break;
    case "sanciones-totales":
      base.tesoroB = 1 - 0.55 * d;
      base.moralB = 1 - 0.22 * d;
      base.sumiB = 1 - 0.12 * d;
      break;
  }
  void esc;
  return base;
}

// plantillas de eventos: [texto, tipo, bias, peso]
const EVENTOS: { t: string; tipo: EventoSim["tipo"]; bias: number; peso: number }[] = [
  { t: "Duelo de artillería sin ganador en el eje central", tipo: "militar", bias: 0, peso: 10 },
  { t: "Pase de satélite confirma columnas de repuesto hacia el frente", tipo: "espacio", bias: 0.4, peso: 7 },
  { t: "Botnet apunta al grid eléctrico de la retaguardia", tipo: "ciber", bias: 0.8, peso: 6 },
  { t: "Convoy humanitario cruza con escolta doble", tipo: "humanitario", bias: -0.2, peso: 6 },
  { t: "Nota diplomática cruzada: la mediación ofrece corredor", tipo: "diplomacia", bias: -0.6, peso: 7 },
  { t: "El crudo sube 6%: los tanqueros desvían ruta", tipo: "economia", bias: 0.3, peso: 6 },
  { t: "Huelga en las fábricas de municiones del agresor", tipo: "social", bias: -0.8, peso: 4 },
  { t: "Batería costera hunde un carguero de bandera neutral", tipo: "militar", bias: 1.0, peso: 5 },
  { t: "Deserciones reportadas en el 2º batallón de asalto", tipo: "social", bias: -0.7, peso: 4 },
  { t: "Ensayo subterráneo detectado por la red sísmica", tipo: "nuclear", bias: 1.4, peso: 3 },
  { t: "Los drones de la diáspora llegan por suscripción", tipo: "militar", bias: -0.5, peso: 5 },
  { t: "Congelan activos del tesoro de guerra en tres plazas", tipo: "economia", bias: -0.9, peso: 5 },
  { t: "Frente de tormenta paraliza la aviación cinco días", tipo: "militar", bias: -0.3, peso: 5 },
  { t: "Fotografía satelital: pista de campaña alargada 600 m", tipo: "espacio", bias: 0.6, peso: 4 },
  { t: "Cumbre de emergencia en la capital neutral", tipo: "diplomacia", bias: -0.7, peso: 5 },
  { t: "Ciberataque deja sin trenes al corredor logístico", tipo: "ciber", bias: -0.8, peso: 4 },
  { t: "Éxodo civil: 40.000 personas en 72 horas", tipo: "humanitario", bias: 0.2, peso: 5 },
  { t: "Cambio de mando en el estado mayor del agresor", tipo: "social", bias: 0.3, peso: 4 },
  { t: "Rumor de negociación paralela en hotel de neutrales", tipo: "diplomacia", bias: -0.5, peso: 4 },
  { t: "La aviación de patrulla supera su récord de salidas", tipo: "militar", bias: 0.5, peso: 5 },
];

const COLOR_EVENTO: Record<EventoSim["tipo"], string> = {
  militar: "#FF6B5A", diplomacia: "#3DDCFF", economia: "#FFD166", ciber: "#B48CFF",
  humanitario: "#4DFFC4", nuclear: "#FF0055", espacio: "#7FE3FF", social: "#E879F9", giro: "#FFC94D",
};

const TURNOS = [
  "Enjambre de lanchas entra en la garganta de {clave}",
  "Ola de misiles sobre los depósitos de {clave}",
  "Contraataque blindado recupera la cota de {clave}",
  "Los sapuos minan el acceso a {clave}",
  "Paracaidistas saltan sobre {clave}",
  "Drones kamikaze saturan la defensa aérea de {clave}",
];

function pluralBajas(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${Math.round(n)}`;
}

/**
 * SIMULACIÓN DE UN DÍA — modelo de factores:
 * potencia = fuerza^0.85 × (1+aire/2) × (1+mar/2) × (1+misiles/2) × moral × suministro × doctrina/7 × terreno(if defender)
 * atrición (Lanchester aproximada): bajas ∝ potencia enemiga^1.15 × exposición
 * movimiento del frente: Δ ∝ (potB-potA)/(potB+potA) × 0.9 × fricción logística
 */
function tick(e: EstadoDia, esc: EscenarioLab, fx: Efectos, rng: () => number, eventos: EventoSim[], perfilA: LadoLab, perfilB: LadoLab): void {
  if (!e.activa) return;
  const clima = 0.92 + 0.08 * Math.sin((e.dia / 91) * Math.PI); // estaciones suaves
  const potA = Math.pow(e.fuerzaA, 0.85) * (1 + perfilA.aire / 2) * (1 + perfilA.mar / 2) * (1 + perfilA.misiles / 2)
    * e.moralA * e.sumiA * (perfilA.doctrina / 7) * perfilA.terreno * clima;
  const potB = Math.pow(e.fuerzaB, 0.85) * (1 + perfilB.aire / 2) * (1 + perfilB.mar / 2) * (1 + perfilB.misiles / 2)
    * e.moralB * e.sumiB * (perfilB.doctrina / 7) * clima;

  // --- atrición ---
  const expA = 0.9 + rng() * 0.4;
  const expB = 0.9 + rng() * 0.4;
  const bajaA = clamp(Math.pow(potB, 1.15) * expA * 0.9, 0, 2600);
  const bajaB = clamp(Math.pow(potA, 1.15) * expB * 0.9, 0, 2600);
  e.bajasA += bajaA;
  e.bajasB += bajaB;

  // --- economía: gasto diario y tesoro ---
  const gasto = 0.18 + e.escalada * 0.05 + (e.frente > 45 ? 0.06 : 0);
  e.coste += gasto;
  e.tesoroA -= gasto * 0.52;
  e.tesoroB -= gasto * 0.48;
  if (e.tesoroA <= 0) { e.sumiA = clamp(e.sumiA - 0.012, 0.35, 1); }
  if (e.tesoroB <= 0) { e.sumiB = clamp(e.sumiB - 0.012, 0.3, 1); }

  // --- logística ---
  const friccion = 0.0035 + fx.friccionB * 0.004;
  if (e.frente > 38) e.sumiB = clamp(e.sumiB - friccion * (e.frente / 50), 0.3, 1.05); // ofensiva lejos de casa
  e.sumiA = clamp(e.sumiA + 0.001, 0.35, 1.05); // defensor reabastece
  if (e.dia % 21 === 0) { e.sumiA = clamp(e.sumiA + 0.03, 0, 1.05); e.sumiB = clamp(e.sumiB + 0.02, 0, 1.05); }

  // --- moral ---
  const difPot = (potB - potA) / (potA + potB);
  e.moralA = clamp(e.moralA - difPot * 0.004 + 0.0012, 0.25, 1.05);
  e.moralB = clamp(e.moralB + difPot * 0.004 - 0.0009, 0.25, 1.05);
  if (e.bajasB > e.bajasA * 1.35) e.moralB = clamp(e.moralB - 0.002, 0.25, 1.05);
  if (e.bajasA > e.bajasB * 1.35) e.moralA = clamp(e.moralA - 0.002, 0.25, 1.05);

  // --- frente ---
  if (!e.altoFuego) {
    const presion = difPot * 1.9 * clima * (0.55 + e.sumiB * 0.55) * (1.15 - e.moralA * 0.35);
    e.frente = clamp(e.frente + presion * 0.55, 3, 97);
    // resistencia del defensor: cuanto más cerca de casa, más duro
    if (e.frente > 72) e.frente = clamp(e.frente - 0.18, 3, 97); // sobrecarga de ocupación
  }

  // --- escalada ---
  if (rng() < 0.028 + e.frente * 0.0006) e.escalada = clamp(e.escalada + 1, 1, 6);
  if (rng() < 0.02 && e.escalada > 2) e.escalada -= 1;

  // --- eventos ---
  if (rng() < 0.34) {
    const total = EVENTOS.reduce((a, ev) => a + ev.peso, 0);
    let roll = rng() * total;
    let ev = EVENTOS[0];
    for (const c of EVENTOS) { roll -= c.peso; if (roll <= 0) { ev = c; break; } }
    const clave = esc.claves[Math.floor(rng() * esc.claves.length)];
    const texto = ev.tipo === "militar" && rng() < 0.4
      ? TURNOS[Math.floor(rng() * TURNOS.length)].replace("{clave}", clave)
      : ev.t;
    eventos.push({ dia: e.dia, texto, tipo: ev.tipo, color: COLOR_EVENTO[ev.tipo], bias: ev.bias });
    // los eventos mueven el frente y la escalada
    e.frente = clamp(e.frente + ev.bias * 0.5 * (0.6 + dosisFactor(fx)), 3, 97);
    if (ev.tipo === "nuclear") e.escalada = clamp(e.escalada + 1, 1, 6);
    if (ev.tipo === "diplomacia" && ev.bias < 0) e.escalada = clamp(e.escalada - 1, 1, 6);
  }

  // --- intervención externa (escala 4+) ---
  if (e.escalada >= 4 && rng() < 0.006) {
    const lado = rng() < 0.5 ? "A" : "B";
    eventos.push({ dia: e.dia, texto: `INTERVENCIÓN EXTERNA: un bloque externo entra en la guerra junto al bando ${lado}`, tipo: "giro", color: "#FFC94D", bias: lado === "B" ? 1.2 : -1.2 });
    if (lado === "A") { e.fuerzaA *= 1.18; e.moralA = clamp(e.moralA + 0.12, 0, 1.05); e.frente = clamp(e.frente - 2.4, 3, 97); }
    else { e.fuerzaB *= 1.18; e.moralB = clamp(e.moralB + 0.12, 0, 1.05); e.frente = clamp(e.frente + 2.4, 3, 97); }
  }

  // --- negociación forzada ---
  if (e.escalada >= 5 && rng() < 0.01 && !e.altoFuego) {
    e.altoFuego = true;
    eventos.push({ dia: e.dia, texto: "La escalada obliga a la mesa: ALTO EL FUEGO supervisado firmado", tipo: "giro", color: "#A78BFA", bias: 0 });
    e.diaFin = e.dia;
    e.activa = false;
    e.nucleo = false;
    return;
  }

  // --- umbral nuclear ---
  if (e.escalada >= 6 && (perfilA.nuclear || perfilB.nuclear)) {
    const pNuc = 0.02 + (e.escalada - 5) * 0.03;
    if (rng() < pNuc) {
      eventos.push({ dia: e.dia, texto: "UMBRAL CRUZADO: detonación táctica — la simulación se detiene, no hay victoria dentro del círculo", tipo: "nuclear", color: "#FF0055", bias: 0 });
      e.nucleo = true;
      e.activa = false;
      e.diaFin = e.dia;
      e.frente = clamp(e.frente, 3, 60);
      return;
    }
  }

  // --- fin por colapso/conquista ---
  if (e.frente >= 88) { e.activa = false; e.diaFin = e.dia; return; }
  if (e.frente <= 8) { e.activa = false; e.diaFin = e.dia; return; }
  if (e.moralA <= 0.27 && e.sumiA <= 0.4) { e.frente = clamp(e.frente + 6, 3, 97); }
  if (e.moralB <= 0.27 && e.sumiB <= 0.4) { e.frente = clamp(e.frente - 6, 3, 97); }
}

function dosisFactor(fx: Efectos): number {
  return fx.moralA < 1 ? 1.4 : 1; // perturbaciones duras amplifican el bias
}

function nombreFin(e: EstadoDia): ResultadoLab["fin"] {
  if (e.nucleo) return { ...FINALES.nuclear, dia: e.diaFin };
  if (e.altoFuego && e.escalada >= 5) return { ...FINALES.mesa, dia: e.diaFin };
  if (e.altoFuego) return { nombre: "ALTO EL FUEGO", detalle: "el cese acordado congela la línea en el día del acuerdo", dia: e.diaFin, ganador: "P" };
  if (e.frente >= 88) return { ...FINALES.victoriaB, dia: e.diaFin };
  if (e.frente <= 8) return { ...FINALES.victoriaA, dia: e.diaFin };
  return { ...FINALES.congelacion, dia: e.diaFin };
}

/** Corre UNA guerra completa con una semilla dada. */
function correrGuerra(esc: EscenarioLab, cfg: ConfigLab, semilla: number, dosis: number): { serie: DiaSim[]; eventos: EventoSim[]; fin: ResultadoLab["fin"] } {
  const fx = dosis > 0 ? efectosDe(cfg.perturbacion, dosis, esc) : { fuerzaA: 1, fuerzaB: 1, sumiA: 1, sumiB: 1, moralA: 1, moralB: 1, tesoroA: 1, tesoroB: 1, escaladaInicial: 0, altoFuego: false, friccionB: 0 };
  const rng = mulberry32(semilla);
  const e: EstadoDia = {
    dia: 0,
    frente: esc.frenteBase,
    fuerzaA: esc.A.fuerza * fx.fuerzaA,
    fuerzaB: esc.B.fuerza * fx.fuerzaB,
    moralA: clamp(0.72 * fx.moralA, 0.25, 1.05),
    moralB: clamp(0.74 * fx.moralB, 0.25, 1.05),
    sumiA: clamp(fx.sumiA, 0.35, 1.05),
    sumiB: clamp(fx.sumiB, 0.3, 1.05),
    tesoroA: esc.A.tesoro * fx.tesoroA,
    tesoroB: esc.B.tesoro * fx.tesoroB,
    escalada: clamp(1 + fx.escaladaInicial, 1, 6),
    bajasA: 0, bajasB: 0, coste: 0,
    activa: true, nucleo: false,
    altoFuego: fx.altoFuego,
    diaFin: cfg.horizonte,
  };
  const serie: DiaSim[] = [{ dia: 0, frente: e.frente, bajasA: 0, bajasB: 0, coste: 0, escalada: e.escalada, moralA: e.moralA, moralB: e.moralB, suministroA: e.sumiA, suministroB: e.sumiB }];
  const eventos: EventoSim[] = [];

  if (fx.altoFuego) {
    eventos.push({ dia: 0, texto: "DÍA 0: el alto el fuego entra en vigor con observadores desplegados en la línea", tipo: "giro", color: "#A78BFA", bias: 0 });
    e.escalada = 1;
  } else if (dosis > 0) {
    const p = PERTURBACIONES.find((x) => x.id === cfg.perturbacion)!;
    eventos.push({ dia: 0, texto: `DÍA 0 — LA PERTURBACIÓN: ${p.nombre.toLowerCase()} (dosis ${dosis}/5)`, tipo: "giro", color: p.color, bias: 0 });
  }

  for (let d = 1; d <= cfg.horizonte && e.activa; d++) {
    e.dia = d;
    tick(e, esc, fx, rng, eventos, esc.A, esc.B);
    serie.push({ dia: d, frente: e.frente, bajasA: e.bajasA, bajasB: e.bajasB, coste: e.coste, escalada: e.escalada, moralA: e.moralA, moralB: e.moralB, suministroA: e.sumiA, suministroB: e.sumiB });
  }

  return { serie, eventos, fin: nombreFin(e) };
}

// ============================================================
// API PÚBLICA
// ============================================================

const SEMILLAS_MC = 24;

/** SIMULA: línea base (dosis 0, misma semilla) + perturbada + Monte Carlo + proyección neuronal. */
export function simular(cfg: ConfigLab, bucket = bucketMinutos(240)): ResultadoLab {
  const esc = escenarioPorId(cfg.crisisId);
  const semillaMaestra = fnvHash(`${cfg.crisisId}|${cfg.perturbacion}|${cfg.dosis}|${cfg.horizonte}`);
  const rngMc = mulberry32(semillaMaestra);
  const mc: ResultadoLab["fin"]["ganador"][] = [];

  for (let i = 0; i < SEMILLAS_MC; i++) {
    const s = (semillaMaestra ^ Math.floor(rngMc() * 0xffffffff)) >>> 0;
    const r = correrGuerra(esc, cfg, s, cfg.dosis);
    mc.push(r.fin.ganador);
  }
  const contar = (g: ResultadoLab["fin"]["ganador"]) => Math.round((mc.filter((x) => x === g).length / SEMILLAS_MC) * 100);
  const monteCarlo = [
    { nombre: FINALES.victoriaB.nombre, probabilidad: contar("B"), ganador: "B" as const },
    { nombre: FINALES.victoriaA.nombre, probabilidad: contar("A"), ganador: "A" as const },
    { nombre: FINALES.congelacion.nombre, probabilidad: contar("T"), ganador: "T" as const },
    { nombre: FINALES.mesa.nombre, probabilidad: contar("P"), ganador: "P" as const },
    { nombre: FINALES.nuclear.nombre, probabilidad: contar("N"), ganador: "N" as const },
  ];

  // corridas detalladas: línea base y perturbada con la misma semilla base
  const det = correrGuerra(esc, cfg, semillaMaestra ^ bucket, cfg.dosis);
  const base = correrGuerra(esc, cfg, semillaMaestra ^ bucket, 0);
  const finDetalle = det.fin;
  const ultDet = det.serie[det.serie.length - 1];
  const ultBase = base.serie[base.serie.length - 1];

  const bajasDet = ultDet.bajasA + ultDet.bajasB;
  const bajasBase = ultBase.bajasA + ultBase.bajasB;

  // texto del escenario para la red neuronal
  const textoNeuronal = `${esc.nombre} ${cfg.dosis > 0 ? PERTURBACIONES.find((p) => p.id === cfg.perturbacion)?.nombre : ""} ${esc.resumen} frente ${Math.round(ultDet.frente)}% escalada ${ultDet.escalada} bajas ${pluralBajas(bajasDet)}`;
  const proyeccion = predecir(textoNeuronal, bucket);
  const veredicto = evaluarNeuronal(textoNeuronal, 3);

  const factores = [
    { nombre: "fuerza de maniobra", peso: Math.round(((esc.B.fuerza * 0.85 + esc.A.fuerza) / 2) / 1.6), nota: "potencia^0.85 con aire, mar y misiles como multiplicadores", color: "#FF6B5A" },
    { nombre: "logística", peso: Math.round(ultDet.suministroB * 55), nota: "el atacante degrada con la distancia; la clave logística pesa el doble", color: "#FFD166" },
    { nombre: "moral", peso: Math.round(((1 - ultDet.moralA) * 50 + (1 - ultDet.moralB) * 50) / 2), nota: "se mueve con el diferencial de potencia y las bajas relativas", color: "#4DFFC4" },
    { nombre: "economía de guerra", peso: Math.round((1 - ultDet.coste / (ultDet.coste + esc.A.tesoro + esc.B.tesoro)) * 70), nota: "el tesoro vacío derrite el suministro desde el día 40", color: "#C9A85C" },
    { nombre: "terreno y clima", peso: Math.round(esc.A.terreno * 22), nota: "el defensor multiplicado por su terreno; estaciones suaves", color: "#7FE3FF" },
    { nombre: "escalada internacional", peso: Math.round(ultDet.escalada * 13), nota: "intervención externa posible desde el nivel 4; mesa forzada en 5", color: "#B48CFF" },
  ].sort((a, b) => b.peso - a.peso);

  return {
    serie: det.serie,
    eventos: det.eventos,
    fin: finDetalle,
    monteCarlo,
    proyeccion,
    veredicto,
    deltas: {
      frenteFinal: Math.round(ultDet.frente - ultBase.frente),
      bajas: bajasBase > 0 ? Math.round(((bajasDet - bajasBase) / bajasBase) * 100) : 0,
      coste: Math.round(((ultDet.coste - ultBase.coste) / Math.max(1, ultBase.coste)) * 100),
      duracion: finDetalle.dia - base.fin.dia,
    },
    factores,
    tensionFinal: Math.round(clamp(esc.tensionBase + (ultDet.escalada - 2) * 6 + (ultDet.frente - esc.frenteBase) * 0.35, 5, 99)),
  };
}

/** Texto de línea temporal legible para el informe del laboratorio. */
export function resumenLab(r: ResultadoLab, esc: EscenarioLab, cfg: ConfigLab): string {
  const dias = r.fin.dia;
  const p = cfg.dosis > 0 ? PERTURBACIONES.find((x) => x.id === cfg.perturbacion)?.nombre.toLowerCase() : "línea base sin perturbación";
  return `${esc.nombre}: con "${p}" (dosis ${cfg.dosis}/5) la simulación de ${dias} días termina en ${r.fin.nombre.toLowerCase()} — frente ${Math.round(r.serie[r.serie.length - 1].frente)}%, bajas combinadas ${pluralBajas(r.serie[r.serie.length - 1].bajasA + r.serie[r.serie.length - 1].bajasB)}, coste $${r.serie[r.serie.length - 1].coste.toFixed(1)}B, escalada final ${r.serie[r.serie.length - 1].escalada}/6. SIMULACIÓN · NO ES PREDICCIÓN.`;
}
