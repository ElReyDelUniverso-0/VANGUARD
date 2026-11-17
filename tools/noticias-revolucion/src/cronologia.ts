/** Misión 003 · CRONOLOGÍA — agrupa notas únicas por día (desc). Entrada ya deduplicada o no; aquí se deduplica también. */
import { deduplicar, type NotaBase } from "./dedupe.js";

export interface DiaCronologia { fecha: string; total: number; notas: NotaBase[] }

export function construirCronologia(notas: NotaBase[], umbral = 0.6): DiaCronologia[] {
  const unicas = deduplicar(notas, umbral).map((g) => g.principal);
  const porDia = new Map<string, NotaBase[]>();
  for (const n of unicas) {
    const t = new Date(n.publicado);
    if (!Number.isFinite(t.getTime())) continue;
    const dia = t.toISOString().slice(0, 10);
    if (!porDia.has(dia)) porDia.set(dia, []);
    porDia.get(dia)!.push(n);
  }
  return [...porDia.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([fecha, items]) => ({
      fecha,
      total: items.length,
      notas: items.sort((a, b) => +new Date(b.publicado) - +new Date(a.publicado)),
    }));
}
