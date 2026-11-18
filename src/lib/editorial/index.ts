// ═══════════════════════════════════════════════════════════════════
// v406.3 LA BIBLIOTECA DE LA REDACCIÓN — el registro único de artículos.
// Añadir una pieza = importarla aquí. El índice, las fichas, el sitemap, el
// calendario (estado «publicado») y el plan de actualizaciones la recogen
// solos. El registro se auto-comprueba al cargar: slug repetido o pieza sin
// fuentes rompe el build (regla de calidad n.º 1: nada sin fuente).
// ═══════════════════════════════════════════════════════════════════
import { ormuz } from "./articulos/ormuz-cuellos-de-botella";
import { cop31 } from "./articulos/cop31-antalya";
import { midterms, cumbres, espanol } from "./articulos/actualidad-noviembre";
import { tierrasRaras } from "./articulos/tierras-raras";
import { westfalia, chips, verificar, reconocimiento, muertos } from "./articulos/permanentes";
import { rankingPoblacion, rankingEconomia } from "./articulos/datos";
import type { Articulo, Bloque, ClaveArea, TipoPieza } from "./tipos";

export const ARTICULOS: Articulo[] = [
  ormuz,
  cop31,
  midterms,
  cumbres,
  tierrasRaras,
  espanol,
  westfalia,
  chips,
  verificar,
  reconocimiento,
  muertos,
  rankingPoblacion,
  rankingEconomia,
].sort((a, b) => (a.publicado < b.publicado ? 1 : a.publicado > b.publicado ? -1 : 0));

// ── auto-comprobación del registro ──────────────────────────────────
{
  const vistos = new Set<string>();
  for (const a of ARTICULOS) {
    if (vistos.has(a.slug)) throw new Error(`Editorial: slug repetido «${a.slug}»`);
    vistos.add(a.slug);
    if (a.fuentes.length === 0) throw new Error(`Editorial: «${a.slug}» no tiene fuentes`);
  }
}

export const POR_SLUG = new Map(ARTICULOS.map((a) => [a.slug, a]));

export function articulo(slug: string): Articulo | null {
  return POR_SLUG.get(slug) ?? null;
}

export function articulosDeArea(area: ClaveArea): Articulo[] {
  return ARTICULOS.filter((a) => a.area === area);
}

export function articulosDeTipo(tipo: TipoPieza): Articulo[] {
  return ARTICULOS.filter((a) => a.tipo === tipo);
}

export function cuerpoDe(a: Articulo): Bloque[] {
  return typeof a.cuerpo === "function" ? a.cuerpo() : a.cuerpo;
}

/** Relacionados: misma área primero, luego etiquetas compartidas. */
export function relacionados(a: Articulo, n = 3): Articulo[] {
  const tags = new Set(a.etiquetas.map((t) => t.toLowerCase()));
  return ARTICULOS.filter((b) => b.slug !== a.slug)
    .map((b) => ({
      b,
      p: (b.area === a.area ? 3 : 0) + b.etiquetas.filter((t) => tags.has(t.toLowerCase())).length,
    }))
    .filter((x) => x.p > 0)
    .sort((x, y) => y.p - x.p)
    .slice(0, n)
    .map((x) => x.b);
}

/** Minutos de lectura (≈ 200 palabras/min, el ritmo de lectura en español). */
export function minutosLectura(a: Articulo): number {
  const texto = cuerpoDe(a)
    .map((b) => {
      switch (b.t) {
        case "p":
        case "h2":
        case "aviso":
        case "cita":
          return b.x;
        case "lista":
          return b.items.join(" ");
        case "datos":
          return b.filas.flat().join(" ");
        case "tabla":
          return b.filas.flat().join(" ");
        case "ranking":
          return b.filas.map((f) => `${f.nombre} ${f.valor}`).join(" ");
      }
    })
    .join(" ");
  return Math.max(2, Math.round(texto.split(/\s+/).length / 200));
}

// ── plan de actualizaciones (derivado: nadie lo mantiene a mano) ─────
const DIA = 86_400_000;

function sumarDias(iso: string, dias: number): string {
  return new Date(Date.parse(iso + "T12:00:00Z") + dias * DIA).toISOString().slice(0, 10);
}

export type EstadoRevision = "al-dia" | "revisar-pronto" | "vencida";

export interface Revision {
  a: Articulo;
  proxima: string;
  motivo: string;
  estado: EstadoRevision;
}

/** Próxima revisión de cada pieza: el hito si llega antes que la periodicidad. */
export function planDeRevisiones(hoy: string): Revision[] {
  return ARTICULOS.map((a) => {
    const periodica = sumarDias(a.revisado, a.revisarCada);
    const porHito = a.hito ? sumarDias(a.hito.fecha, 1) : null;
    const usarHito = porHito !== null && porHito < periodica;
    const proxima = usarHito ? porHito : periodica;
    const motivo = usarHito
      ? `Tras el hito: ${a.hito!.que}`
      : a.tipo === "datos"
        ? `Se recalcula sola; revisión del texto cada ${a.revisarCada} días`
        : `Revisión periódica cada ${a.revisarCada} días`;
    const dias = (Date.parse(proxima) - Date.parse(hoy)) / DIA;
    const estado: EstadoRevision = dias < 0 ? "vencida" : dias <= 3 ? "revisar-pronto" : "al-dia";
    return { a, proxima, motivo, estado };
  }).sort((x, y) => (x.proxima < y.proxima ? -1 : 1));
}

export const FECHA_ES = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${d} de ${meses[m - 1]} de ${y}`;
};

export const TIPO_ES: Record<TipoPieza, string> = {
  actualidad: "Actualidad",
  permanente: "Permanente",
  datos: "Datos vivos",
};
