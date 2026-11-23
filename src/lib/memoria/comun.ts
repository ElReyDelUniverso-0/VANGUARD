// ═══════════════════════════════════════════════════════════════════
// v419.0 · MEMORY ARCHIVE — lo común a las tres fuentes
//
// · Una sola forma de pedir: `pedirJson` con User-Agent propio, tope de
//   tiempo y caché de una hora. El Library of Congress devuelve 403 a quien
//   no se identifica y tarda cuando le da la gana: sin tope de tiempo, una
//   búsqueda podría colgar la página.
// · Una sola forma de limpiar: las descripciones de Commons traen HTML con
//   enlaces y `<bdi>`; el archivo enseña texto, no marcado ajeno.
// ═══════════════════════════════════════════════════════════════════

export const AGENTE =
  "VANGUARD-MemoryArchive/1.0 (+https://vanguard.vanguard-casa.workers.dev/memoria; archivo documental)";

export interface RespuestaCruda<T> {
  datos: T | null;
  error: string | null;
  /** milisegundos que tardó de verdad */
  ms: number;
}

/** Pide JSON con identificación, tope de tiempo y caché de una hora. */
export async function pedirJson<T>(
  url: string,
  opciones: { segundos?: number; tiempoMs?: number } = {}
): Promise<RespuestaCruda<T>> {
  const { segundos = 3600, tiempoMs = 9000 } = opciones;
  const t0 = Date.now();
  // El tope se cumple DOS veces: el `signal` corta la petición y la carrera
  // corta la espera. Hacen falta las dos: medido el 2026-09-22, una búsqueda de
  // LoC con rango de años devolvía la página en 16 s con el tope puesto en 12 —
  // el `fetch` de Next, con caché de por medio, no siempre obedece al signal.
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  try {
    const corte = new Promise<never>((_, rechazar) => {
      temporizador = setTimeout(() => {
        const e = new Error("la fuente no contestó a tiempo");
        e.name = "TimeoutError";
        rechazar(e);
      }, tiempoMs);
    });
    const res = await Promise.race([
      fetch(url, {
        headers: { "User-Agent": AGENTE, Accept: "application/json" },
        signal: AbortSignal.timeout(tiempoMs),
        next: { revalidate: segundos },
      }),
      corte,
    ]);
    if (!res.ok) {
      return { datos: null, error: `la fuente respondió ${res.status}`, ms: Date.now() - t0 };
    }
    const datos = (await Promise.race([res.json() as Promise<T>, corte])) as T;
    return { datos, error: null, ms: Date.now() - t0 };
  } catch (e) {
    const motivo =
      e instanceof Error && e.name === "TimeoutError"
        ? "la fuente no contestó a tiempo"
        : "no se pudo consultar la fuente";
    return { datos: null, error: motivo, ms: Date.now() - t0 };
  } finally {
    if (temporizador) clearTimeout(temporizador);
  }
}

/** Quita etiquetas y decodifica las entidades que Commons mete en los campos. */
export function sinHtml(crudo: string | null | undefined): string | null {
  if (!crudo) return null;
  const limpio = crudo
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return limpio || null;
}

/** Corta un texto sin partir palabras, para las tarjetas. */
export function recortar(texto: string | null, max = 220): string | null {
  if (!texto) return null;
  if (texto.length <= max) return texto;
  const corte = texto.slice(0, max);
  const espacio = corte.lastIndexOf(" ");
  return `${corte.slice(0, espacio > max * 0.6 ? espacio : max).trimEnd()}…`;
}

/** Fecha ISO a partir de lo que publique la fuente, sin completar lo que falta. */
export function fechaCruda(valor: unknown): string | null {
  if (Array.isArray(valor)) return fechaCruda(valor[0]);
  if (typeof valor !== "string") return null;
  const v = valor.trim();
  if (!v) return null;
  const iso = v.match(/\d{4}-\d{2}-\d{2}/);
  if (iso) return iso[0];
  const anioMes = v.match(/\d{4}-\d{2}/);
  if (anioMes) return anioMes[0];
  const anio = v.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/);
  return anio ? anio[1] : null;
}

/** Texto único a partir de un campo que puede venir como cadena o como lista. */
export function unoDe(valor: unknown): string | null {
  const v = Array.isArray(valor) ? valor[0] : valor;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t || null;
}
