// ═══════════════════════════════════════════════════════════════════════════
// v419.1 · CÁMARA DE INTELIGENCIA — EL CONTRATO DE LA INVESTIGACIÓN
//
// El encargo del Dueño fue explícito en dos cosas que mandan sobre el diseño:
//
//   ① «Cada respuesta basada en fuentes debe distinguir hechos, interpretaciones
//      y datos no confirmados.»  → aquí no hay un campo «texto» suelto: hay
//      AFIRMACIONES, y cada una declara de qué clase es y qué fuente la
//      respalda. Una afirmación no puede ser HECHO sin al menos una cita viva;
//      el validador la degrada si el modelo intenta colarla.
//
//   ② «No inventes capacidades de IA si no existe una API o infraestructura
//      disponible.»  → el tipo `Motor` declara con qué se respondió de verdad
//      (`llm` si el proveedor contestó, `determinista` si se respondió con
//      extractos y reglas). La interfaz SIEMPRE lo enseña: el operador sabe si
//      está leyendo una síntesis de modelo o un extracto ordenado.
//
// Estos tipos los comparten servidor y navegador: por eso este archivo no
// importa nada más que otro tipo.
// ═══════════════════════════════════════════════════════════════════════════

/** De dónde sale una fuente: una sala de la casa, o un documento del operador. */
export type ViaFuente =
  | "dossier" // /investigacion/<slug> — los diez dossiers sistémicos
  | "enciclopedia" // /conocimiento/enciclopedia/<slug>
  | "pais" // /datos-mundiales/pais/<iso> · /mundos/<iso>
  | "concepto" // /conocimiento/tema/<id>
  | "teatro" // /conflicto/<tag>
  | "noticia" // /noticia/<id> — cables reales del feed
  | "modulo" // una sala de la casa (navegación, no texto)
  | "documento"; // archivo subido por el operador

/** Una fuente citable. `id` es estable y es lo ÚNICO que un modelo puede citar. */
export interface Fuente {
  id: string; // ej. "dossier:semiconductores-litografia", "pais:tw", "doc:abc123:12"
  via: ViaFuente;
  titulo: string;
  /** qué es, en una línea (para la lista de selección) */
  resumen: string;
  /** ruta real y navegable de la casa; vacía si es un documento del operador */
  ruta: string;
  /** fecha del asunto si la hay (ISO o AAAA-MM-DD) */
  fecha?: string;
  /** de quién es el texto: institución, medio o «documento del operador» */
  emisor: string;
  /** solo en fuentes vivas: la fuente del núcleo que la sirvió (fnt:…) */
  origenNucleo?: string;
}

/** Un fragmento concreto con su ubicación — lo que se cita de verdad. */
export interface Pasaje {
  fuenteId: string;
  /** número de orden dentro de la fuente (0 = primero) */
  n: number;
  texto: string;
  /** de dónde salió: «resumen ejecutivo», «cronología», «párrafo 4»… */
  donde: string;
}

/** Las tres clases que el Dueño exigió distinguir. No hay una cuarta. */
export type ClaseAfirmacion = "HECHO" | "INTERPRETACION" | "NO_CONFIRMADO";

export interface Afirmacion {
  texto: string;
  clase: ClaseAfirmacion;
  /** ids de fuente (de `Fuente.id`) que la respaldan */
  fuentes: string[];
  /** por qué el validador la degradó, si lo hizo (se enseña, no se esconde) */
  nota?: string;
}

export type Motor = "llm" | "determinista";

/** La cuenta de la validación de citas: qué se presentó y qué se cayó. */
export interface AuditoriaCitas {
  /** afirmaciones que presentó el modelo (antes de validar) */
  presentadas: number;
  /** las que se publican con su clase y sus citas */
  publicables: number;
  /** se cayeron por llegar vacías o demasiado cortas para ser una afirmación */
  descartadasTexto: number;
  /** se cayeron por el tope de afirmaciones por investigación */
  descartadasTope: number;
  /** presentadas como HECHO sin cita válida: se degradan a NO CONFIRMADO */
  degradadas: number;
  /** citas concretas rechazadas porque no existen en el material */
  citasRechazadas: number;
  /** una frase para la interfaz; nunca adorno */
  nota: string;
}

export interface Investigacion {
  pregunta: string;
  /** síntesis directa en prosa (puede venir de modelo o de extractos) */
  sintesis: string;
  afirmaciones: Afirmacion[];
  clave: string[];
  fuentes: Fuente[];
  pasajes: Pasaje[];
  motor: Motor;
  /** 0-100: cuánto respaldan las fuentes a la síntesis (juicio del modelo o
   *  cálculo de cobertura en modo determinista) */
  confianza: number;
  /** lo que NO se pudo verificar con las fuentes elegidas */
  vacios: string[];
  /** contradicciones detectadas ENTRE las fuentes elegidas */
  contradicciones: Contradiccion[];
  /** temas vecinos que la casa ya tiene (explorador de relacionados) */
  relacionados: { titulo: string; ruta: string; porque: string }[];
  /** bibliografía en formato legible + BibTeX, generada del corpus real */
  bibliografia: Bibliografia;
  generado: string; // ISO
  ms: number;
  /** avisos honestos del servidor (proveedor caído, PDF parcial, etc.) */
  avisos: string[];
  /** la cuenta de la validación de citas, si hubo modelo que validar */
  auditoriaCitas?: AuditoriaCitas;
}

export interface Contradiccion {
  tema: string;
  a: { fuenteId: string; texto: string };
  b: { fuenteId: string; texto: string };
  /** qué clase de choque es — determinista, no opinión del modelo */
  tipo: "cifra" | "fecha" | "atribucion" | "polaridad";
  explicacion: string;
}

export interface EntradaBibliografia {
  id: string;
  autor: string;
  titulo: string;
  anio: string;
  url?: string;
  tipo: string;
}

export interface Bibliografia {
  entradas: EntradaBibliografia[];
  /** citas en formato autor-año para pegar en un texto */
  citas: string[];
  bibtex: string;
}

// ── Documentos del operador ─────────────────────────────────────────────

export interface Documento {
  id: string;
  nombre: string;
  tipo: "pdf" | "docx" | "txt" | "md" | "csv" | "json" | "pegado";
  bytes: number;
  /** calidad de la extracción: alta = texto limpio; parcial = se perdió texto
   *  (PDFs con fuentes CID, escaneos sin OCR, columnas rotas) */
  calidad: "alta" | "parcial" | "sin-texto";
  caracteres: number;
  paginas: number;
  texto: string;
  trozos: Trozo[];
  entidades: Entidades;
  avisos: string[];
}

export interface Trozo {
  /** índice global del trozo (0..n) */
  n: number;
  pagina: number;
  texto: string;
}

export interface Entidades {
  fechas: { valor: string; iso: string | null; n: number }[];
  lugares: { nombre: string; iso?: string; n: number }[];
  personas: { nombre: string; n: number }[];
  organizaciones: { nombre: string; n: number }[];
  acontecimientos: { texto: string; fecha?: string; n: number }[];
  cifras: { valor: string; unidad: string; contexto: string }[];
}

export interface RespuestaDocumento {
  documentoId: string;
  pregunta: string;
  respuesta: string;
  motor: Motor;
  citas: { n: number; pagina: number; texto: string }[];
  vacio: boolean;
  avisos: string[];
}

// ── Proyectos e historial (viven en el navegador del operador) ──────────

export interface InvestigacionGuardada {
  id: string;
  titulo: string;
  investigacion: Investigacion;
  /** ids de los documentos que se usaron, con su nombre para reconocerlos */
  documentos: { id: string; nombre: string }[];
  guardado: string;
  notas: string;
  etiquetas: string[];
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  creado: string;
  actualizado: string;
  investigaciones: InvestigacionGuardada[];
}

export interface EntradaHistorial {
  id: string;
  pregunta: string;
  cuando: string;
  motor: Motor;
  nFuentes: number;
  confianza: number;
  /** a qué proyecto se archivó, si se archivó */
  proyectoId?: string;
}

// ── Informe y comparación (tipos compartidos con la interfaz) ───────────

export interface Informe {
  titulo: string;
  pregunta: string;
  resumenEjecutivo: string;
  secciones: { titulo: string; parrafos: string[]; motor: Motor }[];
  hechos: Afirmacion[];
  interpretaciones: Afirmacion[];
  noConfirmado: Afirmacion[];
  contradicciones: Contradiccion[];
  cronologia: { fecha: string; hecho: string; fuenteId: string }[];
  vacios: string[];
  bibliografia: Bibliografia;
  fuentes: Fuente[];
  motor: Motor;
  generado: string;
  markdown: string;
  avisos: string[];
}

export interface Comparacion {
  a: { id: string; nombre: string; caracteres: number; paginas: number };
  b: { id: string; nombre: string; caracteres: number; paginas: number };
  comunes: { tema: string; enA: string; enB: string }[];
  soloA: string[];
  soloB: string[];
  contradicciones: Contradiccion[];
  solapamiento: number;
  entidades: {
    fechas: { solo: string[]; ambas: string[] };
    lugares: { solo: string[]; ambas: string[] };
    personas: { solo: string[]; ambas: string[] };
  };
  veredicto: string;
  avisos: string[];
}
