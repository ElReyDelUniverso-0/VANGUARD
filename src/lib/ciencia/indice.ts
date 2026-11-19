// ============================================================
// v421.9 VANGUARD SCIENCE FRONTIER — el índice científico
//
// QUÉ ES: la capa que convierte tres JSON de procedencia (metadatos
// reales capturados, catálogo editorial y cronología) en un sistema de
// descubrimiento: buscar, filtrar, seguir una idea y llegar al artículo
// original.
//
// QUÉ NO ES: no es la enciclopedia. Aquí no hay artículos educativos
// nuevos: hay publicaciones reales con su enlace, su tipo editorial y su
// nivel de evidencia SEPARADOS, más la lectura de VANGUARD sobre qué
// añadió cada una y qué no demuestra.
//
// REGLAS QUE SOSTIENE (las comprueba tools/ciencia/comprobar.mjs):
//   ① todo registro tiene enlace original y huella de la captura;
//   ② «revisado por pares» jamás se deduce del nombre de la revista: se
//      declara el tipo editorial y el régimen de arbitraje por separado;
//   ③ una hipótesis se marca como hipótesis en la ficha, en el buscador y
//      en la cronología — el estado de la IDEA no la convierte en hallazgo;
//   ④ toda relación entre publicaciones es una cita verificada en Crossref
//      o la pertenencia declarada a la misma idea (nunca una invención).
// ============================================================

import catalogo from "./catalogo.json";
import cronologiaJson from "./cronologia.json";
import ideasJson from "./ideas.json";
import publicacionesJson from "./publicaciones.json";

// ── tipos ───────────────────────────────────────────────────
export type TipoPublicacion = "articulo" | "preprint" | "revision" | "divulgacion";
export type NivelEvidencia =
  | "medicion"
  | "experimento"
  | "observacional"
  | "inferencia"
  | "hipotesis"
  | "sintesis"
  | "demostracion"
  | "registro";
export type EstadoIdea = "demostrado" | "parcial" | "abierto";
export type DisciplinaId = "fisica" | "astronomia" | "tierra" | "materiales" | "medicina" | "matematicas";

export interface Autor {
  nombre: string;
  orcid: string | null;
}

export interface Publicacion {
  id: string;
  titulo: string;
  tituloOriginal: string;
  ideaId: string;
  disciplinaId: DisciplinaId;
  fecha: string;
  anio: number;
  medio: string;
  tipo: TipoPublicacion;
  arbitraje: "revista" | "repositorio" | "no-aplica";
  nivel: NivelEvidencia;
  nivelEtiqueta: string;
  lectura: string;
  cautela: string;
  original: string;
  identificador: string;
  idTipo: "doi" | "arxiv" | "url";
  metadatos: string;
  sha256: string | null;
  autores: Autor[];
  totalAutores: number;
  resumenOriginal: string | null;
  versionDe: string | null;
  referencias: string[];
  citadaPor: string[];
  relacionadas: string[];
}

export interface Idea {
  id: string;
  disciplinaId: DisciplinaId;
  pregunta: string;
  sintesis: string;
  estado: EstadoIdea;
  estadoDetalle: string;
  abiertas: string[];
  pasos: Record<string, string>;
  publicaciones: string[];
  desde: number;
  hasta: number;
}

export interface Disciplina {
  id: DisciplinaId;
  nombre: string;
  color: string;
  descripcion: string;
}

export interface VinculoInstitucion {
  publicacion: string;
  base: string;
}

export interface Institucion {
  id: string;
  nombre: string;
  tipo: string;
  pais: string;
  sitio: string;
  http: number;
  papel: string;
  vinculos: VinculoInstitucion[];
  nota: string;
}

export interface Premio {
  id: string;
  premio: string;
  anio: number;
  laureados: string[];
  motivacion: string;
  motivacionEs: string;
  idea: string;
  publicaciones: string[];
  url: string;
  nota: string;
}

export interface Experimento {
  id: string;
  nombre: string;
  anio: string;
  metodo: string;
  pregunta: string;
  resultado: string;
  queNoDemuestra: string;
  publicaciones: string[];
  fuente: string;
}

export interface Tecnologia {
  id: string;
  nombre: string;
  tipo: string;
  madurez: string;
  descripcion: string;
  publicaciones: string[];
  limite: string;
}

export interface Estanteria {
  id: string;
  nombre: string;
  descripcion: string;
  publicaciones: string[];
}

export interface EntradaCronologia {
  fecha: string;
  precision: number;
  tipo: "publicacion" | "preprint" | "revision" | "divulgacion" | "premio" | "hito";
  id: string;
  titulo: string;
  disciplinaId?: DisciplinaId;
  nota?: string;
  fuente?: string;
}

export interface Fuente {
  id: string;
  nombre: string;
  uso: string;
  url: string;
  politica: string;
  capturado: string;
}

// ── datos ───────────────────────────────────────────────────
export const VERSION_DATOS: string = catalogo.version;
export const CAPTURA: string = catalogo.captura;
export const PUBLICACIONES = publicacionesJson as unknown as Publicacion[];
export const IDEAS = ideasJson as unknown as Idea[];
export const DISCIPLINAS = catalogo.disciplinas as unknown as Disciplina[];
export const INSTITUCIONES = catalogo.instituciones as unknown as Institucion[];
export const INSTITUCIONES_SIN_VERIFICAR = catalogo.institucionesSinVerificar as unknown as { nombre: string; motivo: string }[];
export const PREMIOS = catalogo.premios as unknown as Premio[];
export const EXPERIMENTOS = catalogo.experimentos as unknown as Experimento[];
export const TECNOLOGIAS = catalogo.tecnologias as unknown as Tecnologia[];
export const ESTANTERIAS = catalogo.estanterias as unknown as Estanteria[];
export const FUENTES = catalogo.fuentes as unknown as Fuente[];
export const CRONOLOGIA = cronologiaJson as unknown as EntradaCronologia[];

export const POR_ID = new Map(PUBLICACIONES.map((p) => [p.id, p]));
export const IDEA_POR_ID = new Map(IDEAS.map((i) => [i.id, i]));
export const DISCIPLINA_POR_ID = new Map(DISCIPLINAS.map((d) => [d.id, d]));

export const publicacionDe = (id: string) => POR_ID.get(id) ?? null;
export const ideaDe = (id: string) => IDEA_POR_ID.get(id) ?? null;
export const disciplinaDe = (id: string) => DISCIPLINA_POR_ID.get(id as DisciplinaId) ?? null;
export const ideaDePublicacion = (p: Publicacion) => ideaDe(p.ideaId);

// ── taxonomías editoriales (la frontera que el Dueño pidió) ──
export const TIPO_INFO: Record<TipoPublicacion, { etiqueta: string; detalle: string; color: string }> = {
  articulo: {
    etiqueta: "Investigación en revista",
    detalle: "Artículo de investigación publicado en una revista que declara arbitraje. El DOI acredita el registro, no la calidad del hallazgo.",
    color: "#22d3ee",
  },
  preprint: {
    etiqueta: "Prepublicación",
    detalle: "Manuscrito público en arXiv. arXiv modera; no arbitra. Puede existir una versión posterior en revista y no se presume.",
    color: "#a78bfa",
  },
  revision: {
    etiqueta: "Revisión",
    detalle: "Trabajo que sintetiza literatura existente: aporta orden y criterio, no una medición nueva.",
    color: "#fbbf24",
  },
  divulgacion: {
    etiqueta: "Divulgación",
    detalle: "Comunicado o nota institucional que explica un resultado. No añade evidencia ni revisión independiente.",
    color: "#94a3b8",
  },
};

export const NIVEL_INFO: Record<NivelEvidencia, { etiqueta: string; detalle: string; fuerza: number }> = {
  medicion: {
    etiqueta: "Medición",
    detalle: "Se registró una señal con un instrumento y se contrastó contra fuentes de error conocidas.",
    fuerza: 5,
  },
  experimento: {
    etiqueta: "Experimento",
    detalle: "Intervención planificada con condiciones declaradas; puede ser un ensayo con asignación aleatoria.",
    fuerza: 5,
  },
  observacional: {
    etiqueta: "Estudio observacional",
    detalle: "Se observa sin asignar la exposición. Describe asociaciones; la causalidad requiere más argumentos.",
    fuerza: 3,
  },
  inferencia: {
    etiqueta: "Inferencia con modelo",
    detalle: "El valor se deduce con un modelo explícito a partir de datos. Cambiar el modelo cambia el número.",
    fuerza: 3,
  },
  hipotesis: {
    etiqueta: "Hipótesis o modelo propuesto",
    detalle: "Explica lo observado y hace predicciones, pero no es todavía un hallazgo demostrado.",
    fuerza: 1,
  },
  sintesis: {
    etiqueta: "Síntesis",
    detalle: "Ordena evidencia ajena y señala límites; no sustituye a los trabajos que resume.",
    fuerza: 2,
  },
  demostracion: {
    etiqueta: "Demostración matemática",
    detalle: "Argumento lógico verificado por la comunidad; su evidencia es formal, no experimental.",
    fuerza: 5,
  },
  registro: {
    etiqueta: "Registro",
    detalle: "Ficha institucional o comunicado: documenta un hecho administrativo o divulgativo, no un resultado.",
    fuerza: 0,
  },
};

export const ESTADO_INFO: Record<EstadoIdea, { etiqueta: string; detalle: string; color: string }> = {
  demostrado: {
    etiqueta: "Demostrado",
    detalle: "La comunidad competente lo acepta con evidencia replicada o verificación formal.",
    color: "#34d399",
  },
  parcial: {
    etiqueta: "Parcial",
    detalle: "Una parte está establecida y el alcance (magnitud, generalización, aplicación) sigue en discusión.",
    color: "#fbbf24",
  },
  abierto: {
    etiqueta: "Abierto",
    detalle: "Pregunta activa sin respuesta establecida: hay hipótesis en competencia.",
    color: "#fb7185",
  },
};

// ── fechas ──────────────────────────────────────────────────
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** «2016-02-11» → «11 de febrero de 2016»; «2016-02» → «febrero de 2016». */
export function fechaLarga(fecha: string): string {
  const [a, m, d] = fecha.split("-");
  if (!m) return a;
  const mes = MESES[Number(m) - 1] ?? m;
  return d ? `${Number(d)} de ${mes} de ${a}` : `${mes} de ${a}`;
}

export const fechaCorta = (fecha: string) => fecha.replaceAll("-", ".");

// ── búsqueda ────────────────────────────────────────────────
/** Sin tildes, sin mayúsculas: «gravitación» encuentra «gravitacion». */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü\s./-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface FiltrosBusqueda {
  q?: string;
  disciplina?: string;
  tipo?: string;
  nivel?: string;
  idea?: string;
  desde?: string;
  hasta?: string;
  orden?: "relevancia" | "reciente" | "antigua" | "autores";
}

export interface ResultadoBusqueda {
  items: Publicacion[];
  total: number;
  facetas: {
    disciplina: Record<string, number>;
    tipo: Record<string, number>;
    nivel: Record<string, number>;
  };
}

const ANIO_MIN = 1800;

function textoBuscable(p: Publicacion): string {
  const idea = ideaDe(p.ideaId);
  return normalizar(
    [
      p.titulo,
      p.tituloOriginal,
      p.medio,
      p.lectura,
      p.cautela,
      p.identificador,
      idea?.pregunta ?? "",
      p.autores.map((a) => a.nombre).join(" "),
    ].join(" ")
  );
}

const CACHE_TEXTO = new Map<string, string>();
function busca(p: Publicacion): string {
  let t = CACHE_TEXTO.get(p.id);
  if (!t) {
    t = textoBuscable(p);
    CACHE_TEXTO.set(p.id, t);
  }
  return t;
}

function puntuar(p: Publicacion, terminos: string[], frase: string): number {
  const t = busca(p);
  let puntos = 0;
  if (frase.length > 1 && t.includes(frase)) puntos += 60;
  for (const termino of terminos) {
    if (t.includes(termino)) puntos += 8;
    if (normalizar(p.titulo).includes(termino)) puntos += 10;
    if (p.autores.some((a) => normalizar(a.nombre).includes(termino))) puntos += 6;
  }
  if (p.tipo === "articulo") puntos += 1; // desempate editorial, nunca por encima de la coincidencia
  return puntos;
}

/** El buscador del centro: texto + disciplina + tipo + nivel + idea + fechas. */
export function buscar(filtros: FiltrosBusqueda): ResultadoBusqueda {
  const q = normalizar(filtros.q ?? "");
  const terminos = q.split(" ").filter((t) => t.length >= 2);
  const desde = Number(filtros.desde) || ANIO_MIN;
  const hasta = Number(filtros.hasta) || new Date().getUTCFullYear();

  const cumpleBase = (p: Publicacion, omitir?: "disciplina" | "tipo" | "nivel") =>
    (omitir === "disciplina" || !filtros.disciplina || p.disciplinaId === filtros.disciplina) &&
    (omitir === "tipo" || !filtros.tipo || p.tipo === filtros.tipo) &&
    (omitir === "nivel" || !filtros.nivel || p.nivel === filtros.nivel) &&
    (!filtros.idea || p.ideaId === filtros.idea) &&
    p.anio >= desde &&
    p.anio <= hasta &&
    (terminos.length === 0 || terminos.every((t) => busca(p).includes(t)));

  const facetas = { disciplina: {} as Record<string, number>, tipo: {} as Record<string, number>, nivel: {} as Record<string, number> };
  for (const p of PUBLICACIONES) {
    if (cumpleBase(p, "disciplina")) facetas.disciplina[p.disciplinaId] = (facetas.disciplina[p.disciplinaId] ?? 0) + 1;
    if (cumpleBase(p, "tipo")) facetas.tipo[p.tipo] = (facetas.tipo[p.tipo] ?? 0) + 1;
    if (cumpleBase(p, "nivel")) facetas.nivel[p.nivel] = (facetas.nivel[p.nivel] ?? 0) + 1;
  }

  const items = PUBLICACIONES.filter((p) => cumpleBase(p)).map((p) => ({ p, puntos: terminos.length ? puntuar(p, terminos, q) : 0 }));
  const orden = filtros.orden ?? (terminos.length ? "relevancia" : "reciente");
  items.sort((x, y) => {
    if (orden === "relevancia" && y.puntos !== x.puntos) return y.puntos - x.puntos;
    if (orden === "antigua") return x.p.fecha.localeCompare(y.p.fecha);
    if (orden === "autores") return (x.p.autores[0]?.nombre ?? "").localeCompare(y.p.autores[0]?.nombre ?? "", "es");
    return y.p.fecha.localeCompare(x.p.fecha);
  });

  return { items: items.map((x) => x.p), total: items.length, facetas };
}

// ── relaciones y catálogos derivados ────────────────────────
export interface Relaciones {
  referencia: Publicacion[];
  citadaPor: Publicacion[];
  mismaIdea: Publicacion[];
  mismoAutor: Publicacion[];
}

export function relacionesDe(p: Publicacion): Relaciones {
  const trae = (ids: string[]) => ids.map((id) => POR_ID.get(id)).filter((x): x is Publicacion => Boolean(x));
  const autor = p.autores[0]?.nombre;
  return {
    referencia: trae(p.referencias),
    citadaPor: trae(p.citadaPor),
    mismaIdea: trae(ideaDe(p.ideaId)?.publicaciones.filter((id) => id !== p.id) ?? []),
    mismoAutor: autor ? PUBLICACIONES.filter((o) => o.id !== p.id && o.autores[0]?.nombre === autor) : [],
  };
}

export const publicacionesDeIdea = (ideaId: string): Publicacion[] =>
  (ideaDe(ideaId)?.publicaciones ?? []).map((id) => POR_ID.get(id)).filter((x): x is Publicacion => Boolean(x));

export const publicacionesDeDisciplina = (disciplinaId: string): Publicacion[] =>
  PUBLICACIONES.filter((p) => p.disciplinaId === disciplinaId);

export const ideasDeDisciplina = (disciplinaId: string): Idea[] => IDEAS.filter((i) => i.disciplinaId === disciplinaId);

export const premiosDeIdea = (ideaId: string): Premio[] => PREMIOS.filter((p) => p.idea === ideaId);

export const experimentosDeIdea = (ideaId: string): Experimento[] =>
  EXPERIMENTOS.filter((e) => e.publicaciones.some((id) => POR_ID.get(id)?.ideaId === ideaId));

export const tecnologiasDePublicacion = (publicacionId: string): Tecnologia[] =>
  TECNOLOGIAS.filter((t) => t.publicaciones.includes(publicacionId));

export const institucionesDePublicacion = (publicacionId: string): Institucion[] =>
  INSTITUCIONES.filter((i) => i.vinculos.some((v) => v.publicacion === publicacionId));

export const divulgacionDeIdea = (ideaId: string): Publicacion[] =>
  PUBLICACIONES.filter((p) => p.tipo === "divulgacion" && p.ideaId === ideaId);

// ── cifras y rutas ─────────────────────────────────────────
export const ESTADISTICAS = {
  publicaciones: PUBLICACIONES.filter((p) => p.tipo !== "divulgacion").length,
  registros: PUBLICACIONES.length,
  ideas: IDEAS.length,
  disciplinas: DISCIPLINAS.length,
  instituciones: INSTITUCIONES.length,
  premios: PREMIOS.length,
  experimentos: EXPERIMENTOS.length,
  tecnologias: TECNOLOGIAS.length,
  estanterias: ESTANTERIAS.length,
  revistas: new Set(PUBLICACIONES.filter((p) => p.tipo === "articulo").map((p) => p.medio)).size,
  desde: Math.min(...PUBLICACIONES.filter((p) => p.tipo !== "divulgacion").map((p) => p.anio)),
  hasta: Math.max(...PUBLICACIONES.filter((p) => p.tipo !== "divulgacion").map((p) => p.anio)),
  porTipo: Object.fromEntries(
    (["articulo", "preprint", "revision", "divulgacion"] as TipoPublicacion[]).map((t) => [t, PUBLICACIONES.filter((p) => p.tipo === t).length])
  ) as Record<TipoPublicacion, number>,
  porEstado: IDEAS.reduce<Record<EstadoIdea, number>>(
    (acc, i) => ({ ...acc, [i.estado]: (acc[i.estado] ?? 0) + 1 }),
    { demostrado: 0, parcial: 0, abierto: 0 }
  ),
};

export const BASE_CIENCIA = "/ciencia";
export const rutaPublicacion = (id: string) => `${BASE_CIENCIA}/publicacion/${id}`;
export const rutaIdea = (id: string) => `${BASE_CIENCIA}/idea/${id}`;
export const rutaDisciplina = (id: string) => `${BASE_CIENCIA}/disciplina/${id}`;
export const rutaBusqueda = (f: FiltrosBusqueda = {}) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v) sp.set(k, String(v));
  const s = sp.toString();
  return `${BASE_CIENCIA}/buscar${s ? `?${s}` : ""}`;
};
export const rutaInstitucion = (id: string) => `${BASE_CIENCIA}/instituciones#${id}`;
export const rutaPremio = (id: string) => `${BASE_CIENCIA}/premios#${id}`;
export const rutaExperimento = (id: string) => `${BASE_CIENCIA}/experimentos#${id}`;
export const rutaTecnologia = (id: string) => `${BASE_CIENCIA}/tecnologia#${id}`;

/** Todas las rutas públicas del centro (sitemap, llms.txt y pruebas). */
export function rutasCiencia(): string[] {
  return [
    BASE_CIENCIA,
    `${BASE_CIENCIA}/buscar`,
    `${BASE_CIENCIA}/cronologia`,
    `${BASE_CIENCIA}/instituciones`,
    `${BASE_CIENCIA}/premios`,
    `${BASE_CIENCIA}/experimentos`,
    `${BASE_CIENCIA}/tecnologia`,
    `${BASE_CIENCIA}/biblioteca`,
    `${BASE_CIENCIA}/metodo`,
    ...DISCIPLINAS.map((d) => rutaDisciplina(d.id)),
    ...IDEAS.map((i) => rutaIdea(i.id)),
    ...PUBLICACIONES.map((p) => rutaPublicacion(p.id)),
  ];
}
