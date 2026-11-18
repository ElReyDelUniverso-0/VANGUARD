// ═══════════════════════════════════════════════════════════════════
// VANGUARD INVESTIGACIÓN SISTÉMICA — TIPOS DE DATOS & CONTRATO DEL ECOSISTEMA
// Conecta los seis verbos esenciales: Descubrir, Comprender, Investigar,
// Visualizar, Comparar y Simular en una plataforma unificada.
// ═══════════════════════════════════════════════════════════════════

export type CategoriaInvestigacion =
  | "GEOPOLITICA"
  | "TECNOLOGIA_CIBER"
  | "ENERGIA_RECURSOS"
  | "FINANZAS_COMERCIO"
  | "DEFENSA_ESTRATEGIA"
  | "CLIMA_AGUA";

export type NivelUrgencia = "CRITICA" | "ALTA" | "MODERADA";

export interface ConceptoClave {
  termino: string;
  definicion: string;
  contexto: string;
}

export interface ActorClave {
  nombre: string;
  rol: string;
  postura: string;
  influencia: string;
  codigoIso?: string;
}

export interface HitoCronologia {
  fecha: string;
  hito: string;
  impacto: string;
}

export interface IndicadorEmpirico {
  nombre: string;
  valor: string;
  unidad: string;
  periodo: string;
  fuenteOficial: string;
  urlFuente?: string;
  tendencia: "sube" | "baja" | "estable" | "volatil";
  interpretacion: string;
}

export interface NodoGeografico {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  tipo: "chokepoint" | "produccion" | "infraestructura" | "conflicto" | "financiero";
  relevancia: string;
}

export interface MetricaComparativa {
  k: string;
  v: string | number;
  barra: number; // 0 - 100 para renderizar barra proporcional
}

export interface ComparativaTema {
  eje: string;
  descripcion: string;
  actorA: {
    nombre: string;
    iso?: string;
    metricas: MetricaComparativa[];
  };
  actorB: {
    nombre: string;
    iso?: string;
    metricas: MetricaComparativa[];
  };
  veredictoAnalitico: string;
}

export interface ConexionVanguard {
  labsModelos: {
    id: string; // id en /labs/[modelo]
    titulo: string;
    razon: string;
    parametrosSugeridos?: Record<string, number>;
  }[];
  toolsAnalisis: {
    id: string;
    titulo: string;
    razon: string;
  }[];
  modulosRelacionados: {
    href: string;
    label: string;
    desc: string;
  }[];
  temasHermanos: string[]; // slugs de otros temas del ecosistema
}

export interface FuenteMetodologica {
  institucion: string;
  publicacion: string;
  anio: number;
  url?: string;
  tipo: "ORGANISMO_MULTILATERAL" | "AGENCIA_OFICIAL" | "THINK_TANK" | "INSTITUTO_INVESTIGACION";
}

export interface TemaInvestigacion {
  id: string; // slug único: ej. "semiconductores-litografia"
  titulo: string;
  subtitulo: string;
  categoria: CategoriaInvestigacion;
  etiquetas: string[];
  urgenciaSistemica: NivelUrgencia;
  fechaActualizacion: string; // ISO YYYY-MM-DD
  tiempoLecturaMin: number;
  resumenEjecutivo: string;
  preguntasClave: string[];
  conceptosEsenciales: ConceptoClave[];
  actoresClave: ActorClave[];
  cronologia: HitoCronologia[];
  indicadoresEmpiricos: IndicadorEmpirico[];
  puntosCiegos: string[];
  nodosGeograficos: NodoGeografico[];
  comparativa: ComparativaTema;
  conexionesVanguard: ConexionVanguard;
  fuentesMetodologicas: FuenteMetodologica[];
}
