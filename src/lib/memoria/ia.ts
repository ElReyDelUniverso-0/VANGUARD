// ═══════════════════════════════════════════════════════════════════
// v419.0 · MEMORY ARCHIVE — Internet Archive (archive.org)
//
// Dos puertas públicas, sin clave:
//   búsqueda  https://archive.org/advancedsearch.php?q=…&output=json
//   pieza     https://archive.org/metadata/{identificador}
// y las caras del libro escaneado en
//   https://archive.org/download/{id}/page/n{N}_w800.jpg
//
// Aviso que el archivo repite en cada ficha: la ausencia de `licenseurl` NO
// es dominio público. Hay colecciones enteras de material libre ahí, pero la
// ficha no lo prueba y por eso la imagen no se publica: se enlaza.
// ═══════════════════════════════════════════════════════════════════

import { fechaCruda, pedirJson, recortar, sinHtml, unoDe } from "./comun";
import { derechosIa, nombreLicencia } from "./derechos";
import type { Documento, FichaDocumento, PaginaDocumento, ResultadoBusqueda, TipoDocumento } from "./tipos";
import { anioDeFecha, claveDocumento } from "./tipos";

/** Tope de caras que el visor enumera: más allá, la fuente las tiene todas. */
const MAX_PAGINAS = 60;

interface DocIa {
  identifier?: string;
  title?: string | string[];
  date?: string;
  creator?: string | string[];
  mediatype?: string;
  licenseurl?: string;
  description?: string | string[];
  subject?: string | string[];
  collection?: string | string[];
  year?: string | number;
}

interface RespuestaBusquedaIa {
  response?: { numFound?: number; start?: number; docs?: DocIa[] };
}

interface RespuestaPiezaIa {
  metadata?: DocIa & { imagecount?: string | number; publisher?: string; language?: string; contributor?: string };
  files?: Array<{ name?: string; format?: string; width?: string; height?: string }>;
  is_dark?: boolean;
}

const MEDIATYPE: Record<string, TipoDocumento> = {
  texts: "publicacion",
  image: "fotografia",
  audio: "audio",
  movies: "otro",
  software: "otro",
  data: "otro",
  etree: "audio",
  collection: "otro",
};

function normalizar(d: DocIa): Documento | null {
  const id = (d.identifier ?? "").trim();
  if (!id) return null;
  const fecha = fechaCruda(d.date ?? d.year);
  const estado = derechosIa(d.licenseurl);
  const imagen = estado === "dominio-publico" || estado === "licencia-abierta" ? `https://archive.org/services/img/${encodeURIComponent(id)}` : null;
  return {
    fuente: "ia",
    id,
    clave: claveDocumento("ia", id),
    titulo: (sinHtml(unoDe(d.title)) ?? "Sin título en la fuente").slice(0, 300),
    autor: sinHtml(unoDe(d.creator)),
    fecha,
    anio: anioDeFecha(fecha),
    tipo: MEDIATYPE[d.mediatype ?? ""] ?? "otro",
    derechos: estado,
    derechosTexto: d.licenseurl ? `Licencia declarada: ${d.licenseurl}` : null,
    licencia: nombreLicencia(d.licenseurl),
    descripcion: recortar(sinHtml(unoDe(d.description)), 300),
    imagen,
    urlOriginal: `https://archive.org/details/${encodeURIComponent(id)}`,
    institucion: "Internet Archive",
  };
}

export async function buscarIa(opciones: {
  q: string;
  tipo?: TipoDocumento | null;
  desde?: number | null;
  hasta?: number | null;
  pagina?: number;
  limite?: number;
}): Promise<ResultadoBusqueda<Documento>> {
  const { q, tipo = null, desde = null, hasta = null, pagina = 1, limite = 24 } = opciones;

  const partes: string[] = [];
  if (q.trim()) partes.push(`(${q.trim()})`);
  if (tipo === "publicacion" || tipo === "documento" || tipo === "discurso") partes.push("mediatype:texts");
  if (tipo === "fotografia") partes.push("(mediatype:image OR mediatype:texts)");
  if (tipo === "mapa") partes.push("(subject:maps OR title:map OR title:atlas)");
  if (tipo === "audio") partes.push("mediatype:audio");
  if (desde || hasta) partes.push(`date:[${desde ?? 1000}-01-01 TO ${hasta ?? 2026}-12-31]`);
  if (!partes.length) partes.push("mediatype:texts");

  const params = new URLSearchParams({
    q: partes.join(" AND "),
    rows: String(limite),
    page: String(pagina),
    output: "json",
    "sort[]": "date asc",
  });
  for (const campo of ["identifier", "title", "date", "creator", "mediatype", "licenseurl", "description"]) {
    params.append("fl[]", campo);
  }
  const url = `https://archive.org/advancedsearch.php?${params.toString()}`;
  const { datos, error } = await pedirJson<RespuestaBusquedaIa>(url, { tiempoMs: 12000 });
  if (!datos?.response) {
    return { fuente: "ia", total: null, documentos: [], error: error ?? "sin respuesta" };
  }
  const documentos = (datos.response.docs ?? []).map(normalizar).filter((d): d is Documento => d !== null);
  return { fuente: "ia", total: datos.response.numFound ?? null, documentos, error: null };
}

export async function piezaIa(id: string): Promise<FichaDocumento | null> {
  const limpio = id.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!limpio) return null;
  const { datos } = await pedirJson<RespuestaPiezaIa>(`https://archive.org/metadata/${limpio}`, {
    tiempoMs: 12000,
  });
  const m = datos?.metadata;
  if (!m || datos?.is_dark) return null;

  const base = normalizar({ ...m, identifier: limpio });
  if (!base) return null;

  const totalCaras = Number(m.imagecount ?? 0);
  const paginas: PaginaDocumento[] = [];
  if (base.derechos !== "uso-condicionado" && base.derechos !== "sin-declarar") {
    const cuantas = Number.isFinite(totalCaras) && totalCaras > 0 ? Math.min(totalCaras, MAX_PAGINAS) : 0;
    for (let n = 0; n < cuantas; n++) {
      paginas.push({
        numero: n + 1,
        imagen: `https://archive.org/download/${encodeURIComponent(limpio)}/page/n${n}_w800.jpg`,
        ancho: null,
        alto: null,
      });
    }
  }

  const notas: string[] = [];
  if (m.publisher) notas.push(`Editor: ${sinHtml(String(m.publisher))}`);
  if (m.contributor) notas.push(`Contribuyente: ${sinHtml(String(m.contributor))}`);
  if (m.language) notas.push(`Idioma declarado: ${sinHtml(String(m.language))}`);
  const colecciones = Array.isArray(m.collection) ? m.collection : m.collection ? [m.collection] : [];
  if (colecciones.length) notas.push(`Colecciones de la fuente: ${colecciones.slice(0, 6).join(" · ")}`);

  const limites: string[] = [];
  if (!m.licenseurl) limites.push("La fuente no declara licencia: el archivo no supone que sea libre.");
  if (!base.fecha) limites.push("La fuente no publica fecha.");
  if (totalCaras > MAX_PAGINAS)
    limites.push(
      `El original tiene ${totalCaras} caras; el visor enumera las ${MAX_PAGINAS} primeras y enlaza el resto en la fuente.`
    );
  if (!totalCaras) limites.push("La fuente no declara cuántas caras tiene el original.");

  const materias = Array.isArray(m.subject) ? m.subject : m.subject ? [m.subject] : [];

  return {
    ...base,
    paginas,
    notas,
    materias: materias.map((s) => String(s)).slice(0, 12),
    fuenteNombre: "Internet Archive",
    fuenteUrl: "https://archive.org/",
    limites,
  };
}
