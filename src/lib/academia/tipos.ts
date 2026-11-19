// ═══════════════════════════════════════════════════════════════════
// VANGUARD ACADEMY · DEFINICIÓN DE TIPOS Y ESTRUCTURAS EDUCATIVAS
//
// Sistema pedagógico para el Departamento 14 de Vanguard.
// Cursos estructurados por capítulos, lecciones interactivas,
// cuestionarios autoevaluables, ejercicios de práctica estilo Brilliant,
// tarjetas de estudio espaciadas estilo Quizlet, constructor dinámico
// de rutas de aprendizaje y certificados internos de reconocimiento.
// ═══════════════════════════════════════════════════════════════════

export type CategoriaEducativa =
  | "geografia"
  | "historia"
  | "ciencias_naturales"
  | "tecnologia"
  | "economia"
  | "medioambiente"
  | "cultura"
  | "relaciones_internacionales"
  | "matematicas"
  | "idiomas";

export type NivelDificultad = "introductorio" | "intermedio" | "avanzado";

export type NivelTaxonomiaBloom =
  | "recordar"
  | "comprender"
  | "aplicar"
  | "analizar"
  | "evaluar"
  | "crear";

export interface ObjetivoAprendizaje {
  id: string;
  verboBloom: NivelTaxonomiaBloom;
  descripcion: string;
  habilidadClave: string;
}

export interface OpcionCuestionario {
  id: string;
  texto: string;
  explicacion: string;
  esCorrecta: boolean;
}

export type TipoPregunta =
  | "seleccion_multiple"
  | "verdadero_falso"
  | "ordenamiento"
  | "emparejamiento"
  | "calculo_practico";

export interface PreguntaCuestionario {
  id: string;
  tipo: TipoPregunta;
  enunciado: string;
  contextoPrevio?: string;
  opciones: OpcionCuestionario[];
  pistas: string[];
  explicacionDetallada: string;
  fuenteReferencia?: string;
  conceptoIdRelacionado?: string;
}

export type TipoEjercicioPractica =
  | "simulacion_decision"
  | "analisis_caso"
  | "interpretacion_mapa"
  | "calculo_diferencial"
  | "diagnostico_sistema";

export interface PasoEjercicioPractica {
  numero: number;
  instruccion: string;
  datoOVariable: string;
  preguntaComprobacion: string;
  respuestaEsperada: string;
  explicacionPaso: string;
}

export type EjercicioPractico = EjercicioPractica;

export interface EjercicioPractica {
  id: string;
  titulo: string;
  tipo: TipoEjercicioPractica | string;
  categoria?: CategoriaEducativa | string;
  dificultad?: NivelDificultad | string;
  enunciado?: string;
  contextoEscenario?: string;
  escenarioContexto?: string;
  retoPrincipal?: string;
  solucionExplicada?: string;
  enlaceVanguardLab?: string;
  opcionesInteractivas?: {
    id: string;
    texto: string;
    esCorrecta: boolean;
  }[];
  pistasSecuenciales?: string[];
  pasosGuiados?: PasoEjercicioPractica[];
  criterioExito?: string;
  explicacionPedagogica?: string;
  nexoLabRuta?: string;
  nexoLabNombre?: string;
}

export interface RecursoEducativo {
  titulo: string;
  url?: string;
  ruta?: string;
  tipo: "mapa" | "simulador" | "dossier" | "grafico" | "fuente_oficial";
  descripcion: string;
}

export interface Leccion {
  id: string;
  slug: string;
  numero: number;
  titulo: string;
  duracionEstimadaMinutos: number;
  resumenEjecutivo: string;
  objetivosEspecificos: string[];
  conceptosClave: string[];
  objetivoBloom?: {
    nivel: NivelTaxonomiaBloom | string;
    descripcion: string;
  };
  contenidoMarkdown?: string;
  puntosClave?: string[];
  contenidoSecciones?: {
    subtitulo: string;
    parrafos: string[];
    notaAlerta?: string;
    ejemploConcreto?: string;
  }[];
  ejerciciosPractica?: EjercicioPractica[];
  ejerciciosPracticos?: EjercicioPractica[];
  cuestionarioEvaluacion?: PreguntaCuestionario[];
  cuestionario?: {
    titulo: string;
    puntajeMinimoAprobacion: number;
    preguntas: {
      id: string;
      enunciado: string;
      opciones: { id: string; texto: string }[];
      opcionCorrectaId: string;
      explicacionRetroalimentacion: string;
    }[];
  };
  recursosComplementarios?: RecursoEducativo[];
}

export interface Capitulo {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  lecciones: Leccion[];
}

export interface Curso {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string;
  categoria: CategoriaEducativa;
  nivel: NivelDificultad;
  duracionHorasEstimadas: number;
  totalLecciones: number;
  perfilDocenteInstitucional: string;
  institucionOReferencia: string;
  descripcionGeneral: string;
  competenciasAdquiridas: string[];
  objetivosAprendizaje: ObjetivoAprendizaje[];
  capitulos: Capitulo[];
  evaluacionFinalCurso: PreguntaCuestionario[];
  nexosVanguardRelacionados: {
    nombre: string;
    ruta: string;
    tipo: "lab" | "investigacion" | "planeta" | "mapa" | "datos";
    motivoPedagogico: string;
  }[];
  insigniaReconocimiento: string;
}

export interface PasoRutaAprendizaje {
  paso: number;
  tipo: "leccion" | "practica_lab" | "tarjetas" | "evaluacion_hito";
  titulo: string;
  descripcion: string;
  cursoSlug: string;
  capituloId?: string;
  leccionId?: string;
  rutaEnlace: string;
  tiempoEstimadoMinutos: number;
}

export interface RutaAprendizaje {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaEducativa | "multidisciplinar";
  publicoObjetivo: string;
  duracionSemanasEstimadas: number;
  horasTotalesEstimadas: number;
  esPersonalizada?: boolean;
  hitosSecuenciales: PasoRutaAprendizaje[];
  competenciasFinales: string[];
}

export interface TarjetaEstudio {
  id: string;
  barajaId: string;
  categoria: CategoriaEducativa;
  anverso: string;
  reverso: string;
  anversoPregunta?: string;
  reversoRespuesta?: string;
  pista?: string;
  pistaConceptual?: string;
  contextoAplicado?: string;
  ejemploAplicado?: string;
  terminoIdRelacionado?: string;
}

export interface BarajaTarjetas {
  id: string;
  slug: string;
  titulo: string;
  categoria: CategoriaEducativa;
  descripcion: string;
  cursoRelacionadoSlug?: string;
  tarjetas: TarjetaEstudio[];
}

export interface TerminoGlosario {
  id: string;
  termino: string;
  categoria: CategoriaEducativa;
  definicionBreve: string;
  explicacionAmpleada: string;
  etimologiaOFuente?: string;
  ejemploUsoReal: string;
  cursoRelacionadoSlug?: string;
  leccionRelacionadaId?: string;
  leccionesRelacionadas?: { cursoSlug: string; leccionId?: string }[];
}

export interface CertificadoFinalizacion {
  id: string;
  codigoVerificacionHash: string;
  nombreEstudiante: string;
  cursoId: string;
  cursoTitulo: string;
  categoria: CategoriaEducativa;
  fechaEmisionIso: string;
  horasAcreditadas: number;
  promedioEvaluacion: number;
  competenciasDemostradas: string[];
  avisoLegalDescargo: string;
}

export interface RegistroHistorialSesion {
  id: string;
  fechaUtc: string;
  cursoSlug: string;
  leccionSlug: string;
  actividadTipo: "lectura" | "practica" | "cuestionario" | "tarjetas";
  resultadoPuntaje?: number;
  tiempoMinutos: number;
}

export interface EstadoEstudianteLocal {
  nombreEstudiante?: string;
  leccionesCompletadas: Record<string, boolean>; // key: `${cursoSlug}:${leccionId}`
  puntuacionesCuestionarios: Record<
    string,
    { puntaje: number; totalPreguntas: number; porcentaje: number; fechaUtc: string }
  >;
  tarjetasEstado: Record<string, "por_aprender" | "repasando" | "dominada">; // key: tarjetaId
  tarjetasDestacadas: string[]; // tarjetaId[]
  rutasPersonalizadas: RutaAprendizaje[];
  rutaActivaId?: string;
  certificadosEmitidos: CertificadoFinalizacion[];
  minutosEstudioAcumulados: number;
  diasRachaEstudio: number;
  ultimaFechaEstudio?: string;
  historialActividad: RegistroHistorialSesion[];
}
