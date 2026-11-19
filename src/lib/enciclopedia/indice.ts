// ═══════════════════════════════════════════════════════════════════
// v417.0 VANGUARD KNOWLEDGE — índice de la Enciclopedia.
// Une artículos, categorías, imágenes con atribución y rutas de
// descubrimiento; calcula relaciones bidireccionales (si A remite a B, B
// muestra a A en «también lo citan») y ofrece búsqueda temática local.
// ═══════════════════════════════════════════════════════════════════
import type { Articulo, CategoriaId, Ruta } from "./tipos";
import { CATEGORIAS, categoriaDe } from "./categorias";
import { CONTINENTES } from "./articulos/continentes";
import { GEOGRAFIA } from "./articulos/geografia";
import { HISTORIA } from "./articulos/historia";
import { CIENCIA_NATURALEZA } from "./articulos/ciencia-naturaleza";
import { MUNDO } from "./articulos/mundo";
import imagenesJson from "./imagenes.json";

export { CATEGORIAS, categoriaDe };
export type { Articulo, CategoriaId, Ruta };

export interface ImagenAtribuida {
  archivo: string;
  ancho: number;
  alto: number;
  titulo: string;
  autor: string;
  licencia: string;
  licenciaUrl: string | null;
  origen: string;
}

export const IMAGENES = imagenesJson as unknown as Record<string, ImagenAtribuida>;

export const ARTICULOS: Articulo[] = [...CONTINENTES, ...GEOGRAFIA, ...HISTORIA, ...CIENCIA_NATURALEZA, ...MUNDO];

const POR_SLUG = new Map(ARTICULOS.map((a) => [a.slug, a]));

export const BASE_ENCICLOPEDIA = "/conocimiento/enciclopedia";

export function articuloDe(slug: string): Articulo | undefined {
  return POR_SLUG.get(slug);
}

export function rutaArticulo(slug: string): string {
  return `/conocimiento/enciclopedia/${slug}`;
}

export function rutaCategoria(id: string): string {
  return `/conocimiento/enciclopedia/categoria/${id}`;
}

export function articulosDeCategoria(id: CategoriaId): Articulo[] {
  return ARTICULOS.filter((a) => a.categoria === id);
}

export function imagenDe(clave: string): ImagenAtribuida | undefined {
  return IMAGENES[clave];
}

/** artículos que remiten a `slug` sin que `slug` los cite (relación inversa) */
export function citadoPor(slug: string): Articulo[] {
  const propio = POR_SLUG.get(slug);
  const ya = new Set(propio?.relacionados ?? []);
  return ARTICULOS.filter((a) => a.slug !== slug && !ya.has(a.slug) && a.relacionados.includes(slug));
}

/** artículos que tratan un país (para la ficha /mundos/[iso]) */
export function articulosDePais(iso: string): Articulo[] {
  const k = iso.toLowerCase();
  // primero las monografías del propio país, luego los que lo mencionan
  return ARTICULOS.filter((a) => a.paises?.includes(k)).sort(
    (x, y) => Number(y.categoria === "paises") - Number(x.categoria === "paises"),
  );
}

/** artículos que se apoyan en un concepto de /conocimiento/tema/[id] */
export function articulosDeConcepto(id: string): Articulo[] {
  return ARTICULOS.filter((a) => a.conceptos?.includes(id));
}

export function palabrasDe(a: Articulo): number {
  const txt = [
    ...a.introduccion,
    ...a.secciones.flatMap((s) => s.parrafos),
    ...(a.historia?.parrafos ?? []),
  ].join(" ");
  return txt.split(/\s+/).filter(Boolean).length;
}

export function minutosLectura(a: Articulo): number {
  return Math.max(1, Math.round(palabrasDe(a) / 220));
}

export function normalizarTexto(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export interface Resultado {
  articulo: Articulo;
  puntos: number;
  /** fragmento donde aparece el término */
  extracto: string;
}

/** búsqueda temática: título y palabras clave pesan más que el cuerpo */
export function buscarArticulos(q: string, limite = 30): Resultado[] {
  const terms = normalizarTexto(q).split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return [];
  const out: Resultado[] = [];
  for (const a of ARTICULOS) {
    const titulo = normalizarTexto(a.titulo);
    const claves = normalizarTexto(a.palabrasClave.join(" ") + " " + a.bajada);
    const cuerpoOriginal = [...a.introduccion, ...a.secciones.flatMap((s) => [s.titulo, ...s.parrafos]), ...(a.historia?.parrafos ?? [])];
    const cuerpo = normalizarTexto(cuerpoOriginal.join(" \n "));
    let puntos = 0;
    let todos = true;
    for (const t of terms) {
      let p = 0;
      if (titulo.includes(t)) p += 12;
      if (claves.includes(t)) p += 6;
      const n = cuerpo.split(t).length - 1;
      p += Math.min(n, 8);
      if (p === 0) todos = false;
      puntos += p;
    }
    if (!todos || puntos === 0) continue;
    // extracto: primer párrafo que contenga el primer término
    const par = cuerpoOriginal.find((x) => normalizarTexto(x).includes(terms[0])) ?? a.bajada;
    const i = normalizarTexto(par).indexOf(terms[0]);
    const ini = Math.max(0, i - 90);
    const extracto = (ini > 0 ? "…" : "") + par.slice(ini, ini + 240).trim() + (par.length > ini + 240 ? "…" : "");
    out.push({ articulo: a, puntos, extracto });
  }
  return out.sort((x, y) => y.puntos - x.puntos).slice(0, limite);
}

/** rutas de descubrimiento: itinerarios guiados entre artículos */
export const RUTAS: Ruta[] = [
  {
    id: "investigar-un-pais",
    titulo: "Cómo investigar un país",
    pregunta: "Quiero entender un país de punta a punta.",
    pasos: [
      { slug: "republica-dominicana", porque: "Una monografía completa como modelo: territorio, historia, cultura, economía e instituciones." },
      { slug: "pueblos-tainos", porque: "Las raíces: quién vivía allí antes de 1492 y qué queda de ello." },
      { slug: "america", porque: "El continente que da contexto a su historia y su geografía." },
      { slug: "tectonica-de-placas", porque: "Por qué la isla tiene montañas, terremotos y el lago más bajo del Caribe." },
      { slug: "sistema-naciones-unidas", porque: "Cómo se inserta un país en el orden internacional." },
    ],
  },
  {
    id: "primeras-civilizaciones",
    titulo: "El origen de las civilizaciones",
    pregunta: "¿Cómo pasó la humanidad de las aldeas a los imperios?",
    pasos: [
      { slug: "mesopotamia", porque: "Las primeras ciudades, leyes escritas e imperios." },
      { slug: "escritura", porque: "El invento que permitió administrar Estados y conservar la memoria." },
      { slug: "imperio-bizantino", porque: "Cómo un imperio antiguo sobrevivió mil años y transmitió su legado." },
      { slug: "religiones-del-mundo", porque: "Las grandes tradiciones nacidas en esos mundos antiguos." },
      { slug: "lenguas-del-mundo", porque: "La diversidad lingüística heredada de esa historia." },
    ],
  },
  {
    id: "planeta-vivo",
    titulo: "Un planeta vivo y frágil",
    pregunta: "¿Cómo funciona la naturaleza y qué la está cambiando?",
    pasos: [
      { slug: "clima-y-biomas", porque: "Los climas organizan los paisajes vivos del planeta." },
      { slug: "selvas-tropicales", porque: "Los ecosistemas terrestres más ricos y su papel en el agua y el clima." },
      { slug: "arrecifes-de-coral", porque: "La biodiversidad marina y el aviso del blanqueamiento." },
      { slug: "biodiversidad", porque: "Cuántas especies hay, qué las amenaza y cómo se protegen." },
      { slug: "antartida", porque: "El archivo del clima del pasado y un modelo de cooperación." },
    ],
  },
  {
    id: "recursos-y-poder",
    titulo: "Recursos, población y poder",
    pregunta: "¿De qué depende la vida humana y quién decide sobre ello?",
    pasos: [
      { slug: "poblacion-mundial", porque: "Cuántos somos, dónde vivimos y hacia dónde va la población." },
      { slug: "agua-dulce", porque: "El recurso más básico y peor repartido." },
      { slug: "energia", porque: "La base material de la economía y de la transición climática." },
      { slug: "sistema-naciones-unidas", porque: "Dónde se negocian las reglas comunes." },
      { slug: "africa", porque: "El continente donde se juega buena parte del futuro demográfico y de los recursos." },
    ],
  },
  {
    id: "conocimiento-humano",
    titulo: "Cómo aprendimos a conocer el mundo",
    pregunta: "¿De dónde viene la ciencia y cómo circula hoy el conocimiento?",
    pasos: [
      { slug: "escritura", porque: "Fijar el lenguaje fue la primera tecnología del conocimiento." },
      { slug: "revolucion-cientifica", porque: "Observación, experimento y matemáticas como método." },
      { slug: "tectonica-de-placas", porque: "Un ejemplo de cómo una idea rechazada se convierte en teoría." },
      { slug: "internet", porque: "La red que hoy conecta a tres de cada cuatro personas." },
    ],
  },
];

export function rutaDe(id: string): Ruta | undefined {
  return RUTAS.find((r) => r.id === id);
}

/** fecha más reciente de revisión entre todos los artículos */
export const ULTIMA_REVISION = ARTICULOS.map((a) => a.actualizado).sort().at(-1) ?? "";

export function rutasEnciclopedia(): string[] {
  return [
    BASE_ENCICLOPEDIA,
    ...CATEGORIAS.map((c) => rutaCategoria(c.id)),
    ...ARTICULOS.map((a) => rutaArticulo(a.slug)),
  ];
}

export function fechaLarga(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${d} de ${meses[(m ?? 1) - 1]} de ${y}`;
}
