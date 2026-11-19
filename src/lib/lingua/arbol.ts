// ═══════════════════════════════════════════════════════════════════
// v420.0 VANGUARD LINGUA — el árbol de lenguas (servidor).
// Lo consumen la página /lingua/familias/[id] (primer pintado, con la
// ruta hasta el nodo pedido ya desplegada) y /api/lingua/arbol (cada
// rama que el lector abre después). Tipos compartidos con el cliente.
// ═══════════════════════════════════════════════════════════════════
import {
  dialectoPorId,
  dialectosDe,
  hijosDe,
  lenguaPorId,
  lenguasBajo,
  linaje,
  nodoPorId,
  nombreLengua,
  nombreNodo,
  nombreTerritorio,
  resumir,
  tipoDe,
  type Paso,
} from "./servidor";
import { fichaFamilia, PSEUDOFAMILIAS } from "./familias";
import { CATEGORIAS_ES, MACROAREAS_ES, MED_ES } from "./tipos";

export interface HijoArbol {
  id: string;
  nombre: string;
  tipo: "familia" | "lengua" | "dialecto";
  /** familias: nº de lenguas · lenguas: nº de dialectos · dialectos: subdialectos */
  n: number;
  aes?: number;
}

export interface DetalleArbol {
  id: string;
  nombre: string;
  original: string;
  tipo: "familia" | "lengua" | "dialecto";
  pseudo: boolean;
  nota?: string;
  linaje: Paso[];
  nLenguas: number;
  nDialectos: number;
  aes: number[];
  sinAes: number;
  macro: [string, number][];
  paises: [string, string, number][];
  med: [string, number][];
  categorias: [string, number][];
  /** [lat, lon, aes] de cada lengua del subárbol */
  puntos: [number, number, number][];
  lengua?: { iso: string; aes: number; categoria: string; paises: string[] };
  ficha?: {
    es: string;
    protolengua?: string;
    antiguedad?: string;
    origen?: string;
    testimonios?: string;
    texto: string[];
    fuentes: { titulo: string; url: string }[];
  };
}

export function hijosArbol(id: string): HijoArbol[] {
  const h = hijosDe(id);
  const out: HijoArbol[] = [];
  for (const n of h.nodos) {
    const c = lenguasBajo(n.id).length;
    if (c) out.push({ id: n.id, nombre: nombreNodo(n), tipo: "familia", n: c });
  }
  out.sort((a, b) => b.n - a.n || a.nombre.localeCompare(b.nombre, "es"));
  for (const l of h.lenguas) out.push({ id: l.id, nombre: nombreLengua(l), tipo: "lengua", n: dialectosDe(l.id).length, aes: l.aes });
  for (const d of h.dialectos) out.push({ id: d.id, nombre: d.nombre, tipo: "dialecto", n: hijosDe(d.id).dialectos.length });
  return out;
}

export function detalleArbol(id: string): DetalleArbol | null {
  const tipo = tipoDe(id);
  if (!tipo) return null;
  if (tipo === "familia") {
    const n = nodoPorId(id)!;
    const ls = lenguasBajo(id);
    const r = resumir(ls);
    const f = !n.padre ? fichaFamilia(id) : undefined;
    return {
      id,
      nombre: nombreNodo(n),
      original: n.nombre,
      tipo,
      pseudo: n.pseudo,
      nota: PSEUDOFAMILIAS[id],
      linaje: linaje(id),
      nLenguas: ls.length,
      nDialectos: ls.reduce((s, l) => s + l.nDialectos, 0),
      aes: r.aes,
      sinAes: r.sinAes,
      macro: Object.entries(r.macro)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => [MACROAREAS_ES[k] ?? k, v]),
      paises: r.paises.slice(0, 12).map(([iso, c]) => [iso, nombreTerritorio(iso), c]),
      med: Object.entries(r.med)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => [MED_ES[k] ?? k, v]),
      categorias: Object.entries(r.categorias).map(([k, v]) => [CATEGORIAS_ES[k]?.nombre ?? k, v]),
      puntos: ls.filter((l) => l.lat !== null && l.lon !== null).map((l) => [l.lat as number, l.lon as number, l.aes]),
      ficha: f ? { es: f.es, protolengua: f.protolengua, antiguedad: f.antiguedad, origen: f.origen, testimonios: f.testimonios, texto: f.texto, fuentes: f.fuentes } : undefined,
    };
  }
  const l = tipo === "lengua" ? lenguaPorId(id)! : lenguaPorId(dialectoPorId(id)!.lengua);
  const d = tipo === "dialecto" ? dialectoPorId(id)! : null;
  const subs = d ? hijosDe(id).dialectos.length : l ? dialectosDe(l.id).length : 0;
  return {
    id,
    nombre: d ? d.nombre : l ? nombreLengua(l) : id,
    original: d ? d.nombre : l?.nombre ?? id,
    tipo,
    pseudo: false,
    linaje: linaje(id),
    nLenguas: 1,
    nDialectos: subs,
    aes: [],
    sinAes: 0,
    macro: l?.macro ? [[MACROAREAS_ES[l.macro] ?? l.macro, 1]] : [],
    paises: (l?.paises ?? []).map((p) => [p, nombreTerritorio(p), 1]),
    med: l?.med ? [[MED_ES[l.med] ?? l.med, 1]] : [],
    categorias: [],
    puntos: l && l.lat !== null && l.lon !== null ? [[l.lat, l.lon, l.aes]] : [],
    lengua: l ? { iso: l.iso, aes: l.aes, categoria: CATEGORIAS_ES[l.categoria]?.nombre ?? l.categoria, paises: l.paises } : undefined,
  };
}
