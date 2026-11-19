// ═══════════════════════════════════════════════════════════════════
// v419.0 · MEMORY ARCHIVE — la ficha de un documento y sus referencias
//
// · `obtenerDocumento` pregunta a la fuente que corresponde y devuelve la
//   ficha completa (páginas, notas, materias y límites).
// · `acontecimientosQueLoCitan` responde a la referencia cruzada: en qué
//   expedientes de la casa aparece esta pieza.
// · `relacionados` propone vecinos por fecha y por autor, y lo dice: no es
//   una recomendación editorial, es la misma fuente con criterio declarado.
// ═══════════════════════════════════════════════════════════════════

import { ACONTECIMIENTOS } from "./acontecimientos";
import { buscarCommons, piezaCommons } from "./commons";
import { piezaIa } from "./ia";
import { piezaLoc } from "./loc";
import type { Documento, FichaDocumento, FuenteId } from "./tipos";
import { FUENTES } from "./tipos";

export async function obtenerDocumento(fuente: string, id: string): Promise<FichaDocumento | null> {
  if (!FUENTES.includes(fuente as FuenteId)) return null;
  switch (fuente as FuenteId) {
    case "loc":
      return piezaLoc(id);
    case "ia":
      return piezaIa(id);
    case "commons":
      return piezaCommons(id);
    default:
      return null;
  }
}

/** ¿En qué expedientes del archivo se cita esta pieza? Referencia cruzada. */
export function acontecimientosQueLoCitan(fuente: FuenteId, id: string) {
  return ACONTECIMIENTOS.filter((a) => a.piezas.some((p) => p.fuente === fuente && p.id === id)).map((a) => ({
    slug: a.slug,
    titulo: a.titulo,
    volanta: a.volanta,
    papel: a.piezas.find((p) => p.fuente === fuente && p.id === id)?.papel ?? null,
  }));
}

/** Los otros documentos fijados de los mismos expedientes. */
export function documentosVecinos(fuente: FuenteId, id: string): Array<{ fuente: FuenteId; id: string; titulo: string; papel: string }> {
  const salida: Array<{ fuente: FuenteId; id: string; titulo: string; papel: string }> = [];
  for (const a of ACONTECIMIENTOS) {
    const dentro = a.piezas.some((p) => p.fuente === fuente && p.id === id);
    if (!dentro) continue;
    for (const p of a.piezas) {
      if (p.fuente === fuente && p.id === id) continue;
      if (salida.some((s) => s.fuente === p.fuente && s.id === p.id)) continue;
      salida.push({ fuente: p.fuente, id: p.id, titulo: a.titulo, papel: p.papel });
    }
  }
  return salida;
}

/**
 * Vecinos de la misma fuente por año y por autor.
 * Se pide a la fuente, no se inventa: si no hay, la lista vuelve vacía.
 */
export async function relacionados(doc: FichaDocumento, limite = 6): Promise<Documento[]> {
  const texto = doc.autor?.split(",")[0]?.trim() || doc.materias[0] || doc.titulo.split(" ").slice(0, 3).join(" ");
  if (!texto) return [];
  const consulta = {
    q: texto,
    tipo: doc.tipo,
    desde: doc.anio ? doc.anio - 1 : null,
    hasta: doc.anio ? doc.anio + 1 : null,
    limite: limite + 2,
  };
  const cosecha =
    doc.fuente === "commons" ? await buscarCommons(consulta) : doc.fuente === "ia" ? await buscarIaRelacionado(consulta) : await buscarLocRelacionado(consulta);
  return (cosecha?.documentos ?? []).filter((d) => d.id !== doc.id).slice(0, limite);
}

async function buscarLocRelacionado(o: { q: string; tipo: Documento["tipo"]; desde: number | null; hasta: number | null; limite: number }) {
  const { buscarLoc } = await import("./loc");
  return buscarLoc({ q: o.q, tipo: o.tipo, desde: o.desde, hasta: o.hasta, limite: o.limite });
}

async function buscarIaRelacionado(o: { q: string; tipo: Documento["tipo"]; desde: number | null; hasta: number | null; limite: number }) {
  const { buscarIa } = await import("./ia");
  return buscarIa({ q: o.q, tipo: o.tipo, desde: o.desde, hasta: o.hasta, limite: o.limite });
}

// ── Comparación de versiones ────────────────────────────────────────
// La casa no inventa un «diff» del contenido que no ha leído: compara los
// campos que las fuentes publican (título, fecha, autor, derechos, formato,
// número de caras) y lo llama por su nombre.
export interface CampoComparado {
  campo: string;
  a: string;
  b: string;
  igual: boolean;
}

export function compararFichas(a: FichaDocumento, b: FichaDocumento): CampoComparado[] {
  const filas: Array<[string, string | null, string | null]> = [
    ["Título", a.titulo, b.titulo],
    ["Fecha", a.fecha, b.fecha],
    ["Autor", a.autor, b.autor],
    ["Institución", a.institucion, b.institucion],
    ["Tipo", a.tipo, b.tipo],
    ["Derechos", a.derechos, b.derechos],
    ["Licencia", a.licencia, b.licencia],
    ["Caras digitalizadas", String(a.paginas.length), String(b.paginas.length)],
  ];
  return filas.map(([campo, x, y]) => ({
    campo,
    a: x ?? "sin dato",
    b: y ?? "sin dato",
    igual: (x ?? "") === (y ?? ""),
  }));
}
