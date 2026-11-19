// v420.0 VANGUARD LINGUA — genealogía de escrituras (servidor).
import { escrituras, escrituraPorCodigo, glottoDeCodigo, lenguaPorId, nombreCodigo, type Escritura } from "./servidor";

export function descendientesDe(code: string): Escritura[] {
  return escrituras().filter((e) => e.ancestro?.[0] === code);
}

export function antepasadosDe(code: string): Escritura[] {
  const out: Escritura[] = [];
  let e = escrituraPorCodigo(code);
  let guardas = 0;
  while (e?.ancestro && guardas++ < 12) {
    const p = escrituraPorCodigo(e.ancestro[0]);
    if (!p) break;
    out.unshift(p);
    e = p;
  }
  return out;
}

/** raíces del bosque de escrituras: las que no derivan de otra de la lista */
export function raicesEscritura(): Escritura[] {
  return escrituras().filter((e) => !e.ancestro || !escrituraPorCodigo(e.ancestro[0]));
}

export function lenguasDeEscritura(e: Escritura, max = 60): { code: string; nombre: string; glotto?: string; principal: boolean }[] {
  const conv = (code: string, principal: boolean) => {
    const g = glottoDeCodigo(code);
    return { code, nombre: nombreCodigo(code), glotto: g && lenguaPorId(g) ? g : undefined, principal };
  };
  return [...e.lenguasP.slice(0, max).map((c) => conv(c, true)), ...e.lenguasS.slice(0, Math.max(0, max - e.lenguasP.length)).map((c) => conv(c, false))];
}

export const URL_WIKI = (t: string) => `https://es.wikipedia.org/wiki/${encodeURIComponent(t)}`;
