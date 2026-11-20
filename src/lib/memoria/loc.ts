// ═══════════════════════════════════════════════════════════════════
// v419.0 · MEMORY ARCHIVE — Library of Congress (loc.gov)
//
// La API pública del Library of Congress: JSON, sin clave, con `fo=json`.
// Cubre fotografías y grabados, mapas, manuscritos, libros y audio de la
// colección de EE. UU. y de sus copias digitalizadas del mundo.
//
// Contrato real (comprobado en vivo):
//   búsqueda  https://www.loc.gov/{coleccion}/?q=…&fo=json&c=&sp=&dates=
//   pieza     https://www.loc.gov/item/{id}/?fo=json
// La búsqueda es lenta y a veces devuelve 403 a quien no se identifica: por
// eso lleva identificación propia y tope de tiempo, y si no contesta se dice.
// ═══════════════════════════════════════════════════════════════════

import { fechaCruda, pedirJson, recortar, sinHtml, unoDe } from "./comun";
import { derechosLoc, nombreLicencia } from "./derechos";
import type { Documento, FichaDocumento, PaginaDocumento, ResultadoBusqueda, TipoDocumento } from "./tipos";
import { anioDeFecha, claveDocumento } from "./tipos";

const COLECCION: Record<TipoDocumento, string> = {
  documento: "manuscripts",
  fotografia: "photos",
  mapa: "maps",
  discurso: "manuscripts",
  publicacion: "books",
  audio: "audio",
  otro: "photos",
};

interface ResultadoLoc {
  id?: string;
  title?: string;
  date?: string;
  dates?: string[];
  contributor?: string[] | string;
  contributor_names?: string[];
  description?: string[] | string;
  image_url?: string[] | string;
  rights?: string | string[];
  rights_advisory?: string | string[];
  original_format?: string | string[];
  location?: string[];
  subject?: string[];
}

interface RespuestaBusquedaLoc {
  results?: ResultadoLoc[];
  pagination?: { of?: number; total?: number; page?: string };
}

interface RespuestaPiezaLoc {
  item?: ResultadoLoc & {
    title?: string;
    notes?: string[];
    repository?: string[] | string;
    partof?: Array<{ title?: string }>;
    created_published?: string[] | string;
    medium?: string;
  };
  resources?: Array<{
    caption?: string;
    files?: Array<Array<{ mimetype?: string; width?: number; height?: number; url?: string }>>;
  }>;
}

/** `//tile.loc.gov/x.jpg#h=1&w=2` → `https://tile.loc.gov/x.jpg` */
function absoluta(url: string | undefined | null): string | null {
  if (!url) return null;
  const sinFragmento = url.split("#")[0].trim();
  if (!sinFragmento) return null;
  if (sinFragmento.startsWith("//")) return `https:${sinFragmento}`;
  if (sinFragmento.startsWith("http")) return sinFragmento;
  return null;
}

function idDeUrl(id: string | undefined): string | null {
  if (!id) return null;
  const m = id.match(/\/item\/([^/]+)\/?$/);
  return m ? m[1] : id.split("/").filter(Boolean).pop() ?? null;
}

function tipoDeFormato(formato: string | null, imagenes: number): TipoDocumento {
  const f = (formato ?? "").toLowerCase();
  if (f.includes("map")) return "mapa";
  if (f.includes("photo") || f.includes("print") || f.includes("drawing")) return "fotografia";
  if (f.includes("book") || f.includes("newspaper") || f.includes("periodical")) return "publicacion";
  if (f.includes("audio") || f.includes("sound")) return "audio";
  if (f.includes("manuscript")) return "documento";
  return imagenes > 0 ? "fotografia" : "otro";
}

function normalizar(r: ResultadoLoc): Documento | null {
  const id = idDeUrl(r.id);
  if (!id) return null;
  const imagenCruda = Array.isArray(r.image_url) ? r.image_url[r.image_url.length - 1] : r.image_url;
  const imagen = absoluta(imagenCruda);
  const derechosTexto = unoDe(r.rights_advisory) ?? (Array.isArray(r.rights) ? r.rights.join(" · ") : unoDe(r.rights));
  const estado = derechosLoc(derechosTexto);
  const fecha = fechaCruda(r.date ?? r.dates?.[0]);
  return {
    fuente: "loc",
    id,
    clave: claveDocumento("loc", id),
    titulo: (sinHtml(unoDe(r.title)) ?? "Sin título en la fuente").slice(0, 300),
    autor: sinHtml(unoDe(r.contributor_names) ?? unoDe(r.contributor)),
    fecha,
    anio: anioDeFecha(fecha),
    tipo: tipoDeFormato(unoDe(r.original_format), imagen ? 1 : 0),
    derechos: estado,
    derechosTexto,
    licencia: nombreLicencia(null),
    descripcion: recortar(sinHtml(unoDe(r.description)), 300),
    imagen: estado === "uso-condicionado" || estado === "sin-declarar" ? null : imagen,
    urlOriginal: `https://www.loc.gov/item/${id}/`,
    institucion: "Library of Congress",
  };
}

export async function buscarLoc(opciones: {
  q: string;
  tipo?: TipoDocumento | null;
  desde?: number | null;
  hasta?: number | null;
  pagina?: number;
  limite?: number;
}): Promise<ResultadoBusqueda<Documento>> {
  const { q, tipo = null, desde = null, hasta = null, pagina = 1, limite = 24 } = opciones;
  const coleccion = COLECCION[tipo ?? "otro"] ?? "photos";
  // `at=results` NO es un adorno: sin él, /photos devuelve el registro entero
  // con todas sus facetas. Medido el 2026-09-22 desde este servidor: la misma
  // consulta tardaba más de 30 s y no cabía en ningún tope razonable; con
  // `at=results`, entre 0,4 y 4,5 s y 73 KB en vez de cientos.
  const params = new URLSearchParams({
    q: q || "*",
    fo: "json",
    c: String(limite),
    sp: String(pagina),
    at: "results",
  });
  if (desde || hasta) params.set("dates", `${desde ?? 1000}/${hasta ?? 2026}`);
  const url = `https://www.loc.gov/${coleccion}/?${params.toString()}`;
  const { datos, error } = await pedirJson<RespuestaBusquedaLoc>(url, { tiempoMs: 12000 });

  if (!datos) {
    return { fuente: "loc", total: null, documentos: [], error: error ?? "sin respuesta" };
  }
  const documentos = (datos.results ?? []).map(normalizar).filter((d): d is Documento => d !== null);
  const total = Number(datos.pagination?.of ?? datos.pagination?.total ?? NaN);
  return { fuente: "loc", total: Number.isFinite(total) ? total : null, documentos, error: null };
}

export async function piezaLoc(id: string): Promise<FichaDocumento | null> {
  const limpio = id.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!limpio) return null;
  const { datos } = await pedirJson<RespuestaPiezaLoc>(`https://www.loc.gov/item/${limpio}/?fo=json`, {
    tiempoMs: 12000,
  });
  if (!datos?.item) return null;
  const it = datos.item;
  const base = normalizar({ ...it, id: `https://www.loc.gov/item/${limpio}/` });
  if (!base) return null;

  // cada grupo de `resources[].files` es una cara del documento; se queda la
  // imagen de mayor tamaño de cada grupo, sin inventar páginas que no existen
  const paginas: PaginaDocumento[] = [];
  for (const recurso of datos.resources ?? []) {
    for (const grupo of recurso.files ?? []) {
      const candidatas = grupo
        .filter((f) => (f.mimetype ?? "").startsWith("image/"))
        .map((f) => ({ url: absoluta(f.url), ancho: f.width ?? null, alto: f.height ?? null }))
        .filter((f): f is { url: string; ancho: number | null; alto: number | null } => !!f.url);
      if (!candidatas.length) continue;
      candidatas.sort((a, b) => (b.ancho ?? 0) - (a.ancho ?? 0));
      const mejor = candidatas[0];
      if (paginas.some((p) => p.imagen === mejor.url)) continue;
      paginas.push({ numero: paginas.length + 1, imagen: mejor.url, ancho: mejor.ancho, alto: mejor.alto });
    }
  }

  const notas: string[] = [];
  for (const n of it.notes ?? []) {
    const t = sinHtml(n);
    if (t) notas.push(t);
  }
  const repositorio = sinHtml(unoDe(it.repository));
  if (repositorio) notas.push(`Custodia: ${repositorio}`);
  const creado = sinHtml(unoDe(it.created_published));
  if (creado) notas.push(`Publicado: ${creado}`);

  const limites: string[] = [];
  if (!base.derechosTexto) limites.push("La fuente no publica el estado de derechos de esta pieza.");
  if (!base.autor) limites.push("La fuente no declara autor.");
  if (!base.fecha) limites.push("La fuente no publica fecha.");
  if (!paginas.length) limites.push("La fuente no ofrece imágenes digitalizadas de esta pieza.");

  const veredictoImagen = base.derechos === "uso-condicionado" || base.derechos === "sin-declarar";

  return {
    ...base,
    paginas: veredictoImagen ? [] : paginas,
    notas,
    materias: (it.subject ?? []).map((s) => String(s)).slice(0, 12),
    fuenteNombre: "Library of Congress",
    fuenteUrl: "https://www.loc.gov/",
    limites,
  };
}
