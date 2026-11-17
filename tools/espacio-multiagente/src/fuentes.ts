/** ESPACIO MULTIAGENTE · Fuentes — registro honesto: se guarda SOLO lo que se obtuvo de verdad. */
import { randomUUID } from "crypto";
import type { Fuente } from "./tipos.js";

export interface ResultadoFetchReal {
  url: string;
  estado: number;             // HTTP status real
  obtenidaEn: string;         // ISO
  bytes: number;
  extracto: string;           // primeros ~2000 caracteres del cuerpo, SIN inventar nada
  contenidoHtml?: boolean;
}

/** HTTP real desde este proceso. Lanza si no se puede; nunca devuelve datos inventados. */
export async function obtenerFuenteReal(url: string, timeoutMs = 15000): Promise<ResultadoFetchReal> {
  if (!/^https?:\/\//i.test(url)) throw new Error("URL inválida (solo http/https): " + url);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": "VANGUARD-EspacioMultiagente/1.0 (+https://vanguard-kq9r.vercel.app)", "accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8" },
    });
    const texto = await resp.text();
    return {
      url: resp.url || url,
      estado: resp.status,
      obtenidaEn: new Date().toISOString(),
      bytes: Buffer.byteLength(texto, "utf8"),
      extracto: texto.slice(0, 2000),
      contenidoHtml: /<html/i.test(texto),
    };
  } finally {
    clearTimeout(t);
  }
}

export function fuenteDesdeResultado(r: ResultadoFetchReal, nota = ""): Fuente {
  if (!r || typeof r.estado !== "number" || !r.extracto) {
    throw new Error("Fuente rechazada: resultado sin verificación real");
  }
  return {
    id: randomUUID(),
    url: r.url,
    estado: r.estado,
    obtenidaEn: r.obtenidaEn,
    bytes: r.bytes,
    extracto: r.extracto,
    contenidoHtml: !!r.contenidoHtml,
    nota,
  };
}
