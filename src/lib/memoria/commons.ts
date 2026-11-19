// ═══════════════════════════════════════════════════════════════════
// v419.0 · MEMORY ARCHIVE — Wikimedia Commons
//
// La fototeca libre de Wikimedia, sin clave y con licencia declarada en cada
// archivo (`extmetadata.LicenseShortName`). Es la fuente más rápida de las
// tres y la que mejor sirve para fotografías, mapas y facsímiles.
//
// Dos honestidades de esta fuente:
//   · el filtro por fecha no existe en su buscador; el archivo pide más
//     resultados de los que enseña y descarta fuera de rango, y lo dice;
//   · el tipo tampoco viene en un campo: se deduce del título y de la
//     descripción, y cuando no hay señal queda «otro».
// ═══════════════════════════════════════════════════════════════════

import { fechaCruda, pedirJson, recortar, sinHtml } from "./comun";
import { derechosCommons } from "./derechos";
import type { Documento, FichaDocumento, PaginaDocumento, ResultadoBusqueda, TipoDocumento } from "./tipos";
import { anioDeFecha, claveDocumento } from "./tipos";

const API = "https://commons.wikimedia.org/w/api.php";

interface ImageInfo {
  url?: string;
  thumburl?: string;
  width?: number;
  height?: number;
  descriptionurl?: string;
  extmetadata?: Record<string, { value?: string }>;
}

interface PaginaCommons {
  pageid?: number;
  title?: string;
  imageinfo?: ImageInfo[];
}

interface RespuestaCommons {
  query?: { pages?: Record<string, PaginaCommons> };
}

const CAMPOS = "LicenseShortName|Artist|DateTimeOriginal|ImageDescription|Credit|Permission|ObjectName";

function tipoDeTexto(titulo: string, descripcion: string | null): TipoDocumento {
  const t = `${titulo} ${descripcion ?? ""}`.toLowerCase();
  if (/\bmap\b|maps|atlas|carte|mapa|plan of|chart of/.test(t)) return "mapa";
  if (/speech|discurso|proclamation|declaration|address|constitution|treaty|manifiesto/.test(t)) return "discurso";
  if (/photograph|photo|fotograf|daguerreotype|portrait|retrato/.test(t)) return "fotografia";
  if (/poster|cartel|newspaper|periodico|periódico|book|libro|pamphlet/.test(t)) return "publicacion";
  if (/document|manuscript|letter|carta|facsimile|facsímil/.test(t)) return "documento";
  return "otro";
}

function imagenesDe(pagina: PaginaCommons): ImageInfo | null {
  return pagina.imageinfo?.[0] ?? null;
}

function normalizar(pagina: PaginaCommons): Documento | null {
  const ii = imagenesDe(pagina);
  const tituloCrudo = (pagina.title ?? "").replace(/^File:/, "");
  if (!tituloCrudo || !ii) return null;
  const em = ii.extmetadata ?? {};
  const licencia = sinHtml(em.LicenseShortName?.value ?? null);
  const estado = derechosCommons(licencia);
  const fecha = fechaCruda(sinHtml(em.DateTimeOriginal?.value ?? null));
  const autor = recortar(sinHtml(em.Artist?.value ?? null), 160);
  const descripcion = recortar(sinHtml(em.ImageDescription?.value ?? null), 300);
  const permitida = estado !== "uso-condicionado" && estado !== "sin-declarar";
  const id = String(pagina.pageid ?? tituloCrudo);

  return {
    fuente: "commons",
    id,
    clave: claveDocumento("commons", id),
    titulo: tituloCrudo.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/_/g, " ").slice(0, 300),
    autor,
    fecha,
    anio: anioDeFecha(fecha),
    tipo: tipoDeTexto(tituloCrudo, descripcion),
    derechos: estado,
    derechosTexto: licencia,
    licencia,
    descripcion,
    imagen: permitida ? ii.thumburl ?? ii.url ?? null : null,
    urlOriginal: ii.descriptionurl ?? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(tituloCrudo)}`,
    institucion: "Wikimedia Commons",
  };
}

export async function buscarCommons(opciones: {
  q: string;
  tipo?: TipoDocumento | null;
  desde?: number | null;
  hasta?: number | null;
  pagina?: number;
  limite?: number;
}): Promise<ResultadoBusqueda<Documento>> {
  const { q, tipo = null, desde = null, hasta = null, pagina = 1, limite = 24 } = opciones;
  const pista =
    tipo === "mapa" ? " map" : tipo === "fotografia" ? " photograph" : tipo === "discurso" ? " declaration" : "";
  const consulta = `File: ${q}${pista}`.trim();
  const pedir = desde || hasta ? Math.min(limite * 3, 60) : limite;
  const offset = (Math.max(1, pagina) - 1) * pedir;

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: consulta,
    gsrnamespace: "6",
    gsrlimit: String(pedir),
    gsroffset: String(offset),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "1200",
    iiextmetadatafilter: CAMPOS,
  });

  const { datos, error } = await pedirJson<RespuestaCommons>(`${API}?${params.toString()}`, { tiempoMs: 12000 });
  if (!datos) return { fuente: "commons", total: null, documentos: [], error: error ?? "sin respuesta" };

  const paginas = Object.values(datos.query?.pages ?? {});
  let documentos = paginas
    .map(normalizar)
    .filter((d): d is Documento => d !== null)
    .sort((a, b) => (a.anio ?? 9999) - (b.anio ?? 9999));

  if (desde || hasta) {
    documentos = documentos.filter((d) => {
      if (d.anio === null) return false; // sin fecha no se puede afirmar que esté en el rango
      if (desde && d.anio < desde) return false;
      if (hasta && d.anio > hasta) return false;
      return true;
    });
  }

  return { fuente: "commons", total: null, documentos: documentos.slice(0, limite), error: null };
}

export async function piezaCommons(id: string): Promise<FichaDocumento | null> {
  // el identificador del archivo es el pageid; se consulta por página
  const limpio = id.replace(/[^0-9]/g, "");
  if (!limpio) return null;
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    pageids: limpio,
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "1600",
    iiextmetadatafilter: CAMPOS,
  });
  const { datos } = await pedirJson<RespuestaCommons>(`${API}?${params.toString()}`, { tiempoMs: 12000 });
  const pagina = Object.values(datos?.query?.pages ?? {})[0];
  if (!pagina) return null;
  const base = normalizar(pagina);
  if (!base) return null;

  const ii = imagenesDe(pagina)!;
  const paginas: PaginaDocumento[] =
    base.imagen && ii.width && ii.height
      ? [{ numero: 1, imagen: base.imagen, ancho: ii.width, alto: ii.height }]
      : [];

  const em = ii.extmetadata ?? {};
  const notas: string[] = [];
  const credito = sinHtml(em.Credit?.value ?? null);
  if (credito) notas.push(`Crédito: ${credito}`);
  const permiso = sinHtml(em.Permission?.value ?? null);
  if (permiso) notas.push(`Permiso: ${permiso}`);
  const objeto = sinHtml(em.ObjectName?.value ?? null);
  if (objeto) notas.push(`Nombre en la fuente: ${objeto}`);

  const limites: string[] = [];
  if (!base.fecha) limites.push("La fuente no publica fecha de la obra (DateTimeOriginal).");
  if (!base.autor) limites.push("La fuente no declara autor.");
  if (base.derechos === "licencia-abierta")
    limites.push("Licencia abierta: al reutilizar hay que citar autor y licencia, y enlazar la licencia.");

  return {
    ...base,
    paginas,
    notas,
    materias: [],
    fuenteNombre: "Wikimedia Commons",
    fuenteUrl: "https://commons.wikimedia.org/",
    limites,
  };
}
