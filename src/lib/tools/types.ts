// ============================================================
// VANGUARD TOOLS — DEFINICIÓN DE TIPOS Y ESTRUCTURAS DE DATOS
// v406.7 Suite Integral de Análisis, Creación y Exploración
// ============================================================

export type ToolCategory =
  | "analisis"
  | "creacion"
  | "exploracion"
  | "centros"
  | "workspace"
  | "nuevas";

export type ToolId =
  // 1. Análisis
  | "comparador-paises"
  | "comparador-regiones"
  | "analizador-indicadores"
  | "explorador-estadisticas"
  | "analizador-tendencias"
  | "comparador-historico"
  | "calculadoras-estrategicas"
  // 2. Creación
  | "constructor-mapas"
  | "constructor-cronologias"
  | "creador-graficos"
  | "constructor-escenarios"
  | "generador-informes"
  // 3. Exploración
  | "buscador-mundial"
  | "explorador-ciudades"
  | "explorador-organizaciones"
  | "explorador-infraestructura"
  | "matriz-alianzas"
  // 4. Centros interactivos
  | "sala-analisis"
  | "observatorio-demografico"
  | "espacio-experimentacion"
  // 5. UX & Personal
  | "mi-workspace";

export interface ToolDef {
  id: ToolId;
  name: string;
  short: string;
  category: ToolCategory;
  description: string;
  badge?: string;
  iconName: string;
  keywords: string[];
}

// ------------------------------------------------------------
// Modelos de Datos para Herramientas de Análisis
// ------------------------------------------------------------

export interface IndicadorGlobal {
  id: string;
  nombre: string;
  categoria: "militar" | "economia" | "demografia" | "energia" | "tecnologia" | "social";
  unidad: string;
  descripcion: string;
  fuente: string;
  valoresPorPais: Record<string, number>; // id país -> valor numérico
  min: number;
  max: number;
  promedioGlobal: number;
}

export interface ComparadorHistorialEntry {
  era: "1914" | "1945" | "1991" | "2026";
  nombreEra: string;
  superpotencias: string[];
  ordenGeopolitico: string;
  doctrinaDominante: string;
  pibMundialTrillon: number;
  poblacionMundialMillones: number;
  gastosMilitaresGlobalesPct: number;
}

// ------------------------------------------------------------
// Modelos para Calculadoras Estratégicas
// ------------------------------------------------------------

export interface CINCInput {
  gastoMilitarUsd: number;      // Militares
  personalMilitar: number;      // Soldados activos
  consumoEnergiaTpe: number;    // Toneladas equivalentes de petróleo
  produccionAceroTm: number;    // Toneladas métricas
  poblacionUrbana: number;      // Habitantes
  poblacionTotal: number;       // Habitantes
}

export interface CINCResult {
  scoreCINC: number;            // 0 a 1 (peso relativo en el total mundial)
  rankingEstimado: number;
  desglose: {
    gastoMilitarShare: number;
    personalShare: number;
    energiaShare: number;
    aceroShare: number;
    pobUrbanaShare: number;
    pobTotalShare: number;
  };
  clasificacion: "Hiperpotencia" | "Gran Potencia" | "Potencia Regional" | "Potencia Mediana" | "Estado Menor";
}

export interface VulnerabilidadEnergeticaInput {
  consumoPetroleoBpd: number;
  produccionPetroleoBpd: number;
  consumoGasBcm: number;
  produccionGasBcm: number;
  mesesReservasEstrategicas: number;
  dependenciaChokepointPct: number; // % que cruza por Ormuz, Malaca o Suez
}

export interface VulnerabilidadEnergeticaResult {
  indiceVulnerabilidad: number; // 0 - 100
  nivelRiesgo: "Bajo" | "Moderado" | "Elevado" | "Crítico";
  diasAutonomiaCruda: number;
  deficitPetroleoBpd: number;
  deficitGasBcm: number;
  recomendaciones: string[];
}

// ------------------------------------------------------------
// Modelos para Creación (Mapas, Cronologías, Escenarios)
// ------------------------------------------------------------

export interface CustomMapPin {
  id: string;
  lat: number;
  lng: number;
  titulo: string;
  nota: string;
  categoria: "base" | "puerto" | "conflicto" | "recurso" | "nodo";
  color?: string;
}

export interface CustomMapRoute {
  id: string;
  nombre: string;
  desde: [number, number]; // [lat, lng]
  hasta: [number, number];
  tipo: "maritima" | "pipeline" | "cable" | "aerea";
  color: string;
}

export interface CustomThematicMap {
  id: string;
  nombre: string;
  descripcion: string;
  fechaCreacion: string;
  paisesColoreados: Record<string, string>; // countryId -> hex color
  pins: CustomMapPin[];
  rutas: CustomMapRoute[];
  capasActivas: {
    chokepoints: boolean;
    cables: boolean;
    alianzas: boolean;
  };
}

export interface TimelineEvent {
  id: string;
  fecha: string;
  titulo: string;
  descripcion: string;
  categoria: "militar" | "diplomacia" | "economia" | "tecnologia" | "crisis";
  gravedad: "baja" | "media" | "alta" | "critica";
  fuente?: string;
}

export interface CustomTimeline {
  id: string;
  titulo: string;
  subtitulo: string;
  fechaCreacion: string;
  eventos: TimelineEvent[];
}

// ------------------------------------------------------------
// Modelos para Constructor de Escenarios & Stress Test
// ------------------------------------------------------------

export interface ScenarioShockModifiers {
  aumentoCrudoDolares: number;        // ej. +20, +50 USD por barril
  bloqueoOrmuz: boolean;
  bloqueoMalaca: boolean;
  bloqueoSuez: boolean;
  arancelesGlobalesPct: number;       // ej. +15%, +30%
  aumentoGastoDefensaPct: number;     // ej. +20%
  disrupcionSemiconductores: boolean;
}

export interface ScenarioImpactResult {
  inflacionAdicionalGlobalPct: number;
  retrasoFleteMaritimoDias: number;
  indiceTensionGlobal: number; // 0 - 100
  sectoresMasAfectados: string[];
  ganadoresGeopoliticos: string[];
  perdedoresGeopoliticos: string[];
  resumenImpacto: string;
}

export interface SavedScenario {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  shocks: ScenarioShockModifiers;
  impacto: ScenarioImpactResult;
}

// ------------------------------------------------------------
// Modelos de Exploración e Infraestructura
// ------------------------------------------------------------

export interface CiudadEstrategica {
  id: string;
  nombre: string;
  paisId: string;
  paisNombre: string;
  poblacionMetroM: number;
  pibBillionUsd: number;
  lat: number;
  lng: number;
  rolEstrategico: "Megapuerto Logístico" | "Hub Financiero" | "Centro Tecnológico" | "Capital de Decisión" | "Complejo Militar";
  puertoTraficoTeuM?: number; // millones de TEUs
  aeropuertoPasajerosM?: number;
  hitosEstrategicos: string[];
}

export interface OrganizacionGlobal {
  id: string;
  siglas: string;
  nombre: string;
  fundacion: number;
  sede: string;
  paisesMiembrosCount: number;
  presupuestoAnualBillionUsd: number;
  objetivoPrincipal: string;
  capacidadVeto: boolean;
  miembrosClave: string[];
  tratadoFundacional: string;
  influenciaGlobal: "Dominante" | "Elevada" | "Media" | "Especializada";
}

export interface InfraestructuraCritica {
  id: string;
  nombre: string;
  tipo: "cable-submarino" | "oleoducto" | "megapuerto" | "central-nuclear" | "base-espacial";
  ubicacion: string;
  lat: number;
  lng: number;
  capacidad: string;
  operadorPaises: string[];
  vulnerabilidadNivel: "Crítico" | "Alto" | "Medio";
  impactoSiFalla: string;
}

export interface AlianzaTratado {
  id: string;
  nombre: string;
  tipo: "Defensa Mutua" | "Comercio Libre" | "Cooperación Económica" | "Inteligencia Compartida";
  paisesMiembros: string[];
  clausulaDefensa: boolean; // ej. Art. 5
  fechaFirma: string;
}

// ------------------------------------------------------------
// Modelos para Observatorio Demográfico & Pirámides
// ------------------------------------------------------------

export interface PiramideCohorte {
  rango: string;
  hombresPct: number;
  mujeresPct: number;
}

export interface DemografiaPaisDetalle {
  paisId: string;
  paisNombre: string;
  poblacionActualM: number;
  poblacion2050M: number;
  poblacion2100M: number;
  tasaFecundidadHijosMujer: number;
  edadMedianaAnios: number;
  tasaDependenciaVejezPct: number;
  bonoDemografico: "Activo" | "Agotado" | "Envejecimiento Acelerado" | "Expansión Juvenil";
  cohortes: PiramideCohorte[];
}

// ------------------------------------------------------------
// Modelos para Workspace de Usuario y Notas de Inteligencia
// ------------------------------------------------------------

export interface NotaInteligencia {
  id: string;
  titulo: string;
  contenido: string;
  paisRelacionado?: string;
  clasificacion: "ABIERTO (OSINT)" | "CONFIDENCIAL (VANGUARD)" | "ESTRÉGICO RESERVADO";
  tags: string[];
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface ColeccionInvestigacion {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  fecha: string;
  elementos: {
    tipo: "pais" | "indicador" | "mapa" | "escenario" | "nota";
    id: string;
    titulo: string;
  }[];
}

export interface VanguardWorkspaceState {
  favoritos: string[]; // IDs de países, indicadores, herramientas o dossiers
  historialConsultas: { texto: string; timestamp: number; categoria: string }[];
  notas: NotaInteligencia[];
  colecciones: ColeccionInvestigacion[];
  mapasPersonalizados: CustomThematicMap[];
  cronologiasGuardadas: CustomTimeline[];
  escenariosGuardados: SavedScenario[];
  temaVisual: "tactico-hud" | "cartografia-cyan" | "monocromo-amber";
}

// ------------------------------------------------------------
// Modelos para Generador de Informes (SITREP)
// ------------------------------------------------------------

export interface InformeInteligenciaParams {
  titulo: string;
  autor: string;
  clasificacion: string;
  paisPrimario: string;
  paisesComparados: string[];
  resumenEjecutivo: string;
  analisisMilitar: string;
  analisisEconomico: string;
  analisisRiesgo: string;
  conclusiones: string;
  recomendaciones: string[];
}
