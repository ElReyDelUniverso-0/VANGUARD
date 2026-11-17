/** Misión 003 · Dedupe de notas: misma URL canónica o titulares con solapamiento alto = misma historia. */
import { canonicalizarUrl } from "./canonical.js";
import { tokens, jaccard } from "./texto.js";

export interface NotaBase {
  id: string;
  titulo: string;
  url: string;
  imagen?: string | null;
  publicado: Date | string;
  fuente?: string;
}

export interface NotaDeduplicada<N extends NotaBase> {
  principal: N;
  duplicados: N[];
}

/** Unión-find por similitud titular (Jaccard ≥ umbral) o URL canónica idéntica. */
export function deduplicar<N extends NotaBase>(notas: N[], umbral = 0.6): NotaDeduplicada<N>[] {
  const n = notas.length;
  const padre = Array.from({ length: n }, (_, i) => i);
  const buscar = (i: number): number => (padre[i] === i ? i : (padre[i] = buscar(padre[i])));
  const unir = (i: number, j: number) => {
    const a = buscar(i), b = buscar(j);
    if (a !== b) padre[Math.max(a, b)] = Math.min(a, b);
  };
  const toks = notas.map((x) => tokens(x.titulo));
  const urls = notas.map((x) => canonicalizarUrl(x.url));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (urls[i] && urls[i] === urls[j]) { unir(i, j); continue; }
      if (jaccard(toks[i], toks[j]) >= umbral) unir(i, j);
    }
  }
  const grupos = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const r = buscar(i);
    if (!grupos.has(r)) grupos.set(r, []);
    grupos.get(r)!.push(i);
  }
  const mejor = (grupo: N[]): N =>
    grupo.reduce((acc, cur) => {
      const score = (x: N) => (x.imagen ? 2 : 0) + (new Date(x.publicado).getTime() || 0) / 1e13;
      return score(cur) > score(acc) ? cur : acc;
    });
  const salida: NotaDeduplicada<N>[] = [];
  for (const idxs of grupos.values()) {
    const grupo = idxs.map((i) => notas[i]);
    const principal = mejor(grupo);
    salida.push({ principal, duplicados: grupo.filter((g) => g !== principal) });
  }
  salida.sort((a, b) => new Date(b.principal.publicado).getTime() - new Date(a.principal.publicado).getTime());
  return salida;
}
