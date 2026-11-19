// ═══════════════════════════════════════════════════════════════════
// v419.0 · MEMORY ARCHIVE — la búsqueda del archivo
//
// Una consulta, tres puertas, un solo listado. Cada fuente se consulta a la
// vez y cada una declara si contestó: si el Library of Congress no responde,
// la página lo dice con su nombre en vez de enseñar «0 resultados», que sería
// mentira.
//
// Filtros: texto libre, autor, tipo de documento, fuente y rango de años.
// La cronología no es decoración: sale de los años que las fuentes publican.
// ═══════════════════════════════════════════════════════════════════

import { buscarCommons } from "./commons";
import { buscarIa } from "./ia";
import { buscarLoc } from "./loc";
import type { Documento, FuenteId, ResultadoBusqueda, TipoDocumento } from "./tipos";
import { TIPOS } from "./tipos";

export interface OpcionesBusqueda {
  q: string;
  fuente?: FuenteId | "todas";
  tipo?: TipoDocumento | null;
  desde?: number | null;
  hasta?: number | null;
  /** el nombre entra en la consulta de texto: las fuentes no tienen campo autor común */
  autor?: string | null;
  pagina?: number;
  limite?: number;
}

export interface CosechaBusqueda {
  consulta: OpcionesBusqueda;
  resultados: ResultadoBusqueda<Documento>[];
  documentos: Documento[];
  /** cuántos documentos de cada fuente, y cuántos fallaron */
  porFuente: Array<{ fuente: FuenteId; nombre: string; cuantos: number; total: number | null; error: string | null }>;
  porTipo: Array<{ tipo: TipoDocumento; cuantos: number }>;
  /** décadas con documentos de verdad, ordenadas */
  decadas: Array<{ decada: number; cuantos: number }>;
  /** lo que hay que decir al visitante sobre esta consulta */
  avisos: string[];
}

const NOMBRE_FUENTE: Record<FuenteId, string> = {
  loc: "Library of Congress",
  ia: "Internet Archive",
  commons: "Wikimedia Commons",
};

export function consultaCompleta(o: OpcionesBusqueda): string {
  // el autor no es un campo en las tres fuentes: entra en el texto y se dice
  return [o.q, o.autor].filter((x) => x && x.trim()).join(" ").trim();
}

export async function buscarEnArchivo(opciones: OpcionesBusqueda): Promise<CosechaBusqueda> {
  const fuente = opciones.fuente ?? "todas";
  const limite = opciones.limite ?? (fuente === "todas" ? 12 : 24);
  const texto = consultaCompleta(opciones);
  const base = {
    q: texto,
    tipo: opciones.tipo ?? null,
    desde: opciones.desde ?? null,
    hasta: opciones.hasta ?? null,
    pagina: opciones.pagina ?? 1,
    limite,
  };

  const pedidos: Array<Promise<ResultadoBusqueda<Documento>>> = [];
  if (fuente === "todas" || fuente === "loc") pedidos.push(buscarLoc(base));
  if (fuente === "todas" || fuente === "ia") pedidos.push(buscarIa(base));
  if (fuente === "todas" || fuente === "commons") pedidos.push(buscarCommons(base));

  const resultados = await Promise.all(pedidos);

  const documentos = resultados
    .flatMap((r) => r.documentos)
    .sort((a, b) => {
      // los que tienen año primero, en orden; los sin fecha al final, nunca inventados
      if (a.anio === null && b.anio === null) return a.titulo.localeCompare(b.titulo, "es");
      if (a.anio === null) return 1;
      if (b.anio === null) return -1;
      return a.anio - b.anio || a.titulo.localeCompare(b.titulo, "es");
    });

  const porFuente = resultados.map((r) => ({
    fuente: r.fuente,
    nombre: NOMBRE_FUENTE[r.fuente],
    cuantos: r.documentos.length,
    total: r.total,
    error: r.error,
  }));

  const conteoTipo = new Map<TipoDocumento, number>();
  const conteoDecada = new Map<number, number>();
  for (const d of documentos) {
    conteoTipo.set(d.tipo, (conteoTipo.get(d.tipo) ?? 0) + 1);
    if (d.anio !== null) {
      const decada = Math.floor(d.anio / 10) * 10;
      conteoDecada.set(decada, (conteoDecada.get(decada) ?? 0) + 1);
    }
  }

  const avisos: string[] = [];
  const caidas = porFuente.filter((f) => f.error);
  for (const c of caidas) avisos.push(`${c.nombre} no contestó (${c.error}): sus resultados no están en esta lista.`);
  if (opciones.desde || opciones.hasta) {
    avisos.push(
      "El rango de años se aplica en la consulta de Library of Congress e Internet Archive; en Wikimedia Commons se descarta después, porque su buscador no filtra por fecha."
    );
  }
  if (opciones.tipo && opciones.tipo === "mapa") {
    avisos.push("En Internet Archive el tipo «mapa» se busca por materia y título: puede colarse algún plano descrito con otras palabras.");
  }
  if (opciones.autor) {
    avisos.push("Ninguna de las tres fuentes tiene un campo de autor común: el nombre entra en el texto de la consulta.");
  }

  return {
    consulta: { ...opciones, q: texto },
    resultados,
    documentos,
    porFuente,
    porTipo: TIPOS.map((t) => ({ tipo: t, cuantos: conteoTipo.get(t) ?? 0 })).filter((x) => x.cuantos > 0),
    decadas: [...conteoDecada.entries()]
      .map(([decada, cuantos]) => ({ decada, cuantos }))
      .sort((a, b) => a.decada - b.decada),
    avisos,
  };
}

/** Los documentos de una lista, agrupados por fuente, para las fichas de colección. */
export function agruparPorFuente(documentos: Documento[]): Map<FuenteId, Documento[]> {
  const mapa = new Map<FuenteId, Documento[]>();
  for (const d of documentos) {
    const lista = mapa.get(d.fuente) ?? [];
    lista.push(d);
    mapa.set(d.fuente, lista);
  }
  return mapa;
}
