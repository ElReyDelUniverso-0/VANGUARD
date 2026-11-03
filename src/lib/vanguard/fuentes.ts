// ============================================================
// VANGUARD v170.0 — FUENTES EXTERNAS (lado servidor)
// Solo APIs públicas y gratuitas, sin API keys de terceros.
// fetchConCache: caché en memoria por proceso + respaldo honesto.
// Si el mundo no responde, Vanguard muestra MODO SIMULADO.
// ============================================================

type EntradaCache = { ts: number; datos: unknown };
const cacheMemoria = new Map<string, EntradaCache>();

export async function fetchConCache<T>(
  clave: string,
  url: string,
  ttlMs: number,
  preparar: (json: unknown) => T
): Promise<{ datos: T; enVivo: boolean }> {
  const golpe = cacheMemoria.get(clave);
  const ahora = Date.now();
  if (golpe && ahora - golpe.ts < ttlMs) {
    return { datos: golpe.datos as T, enVivo: true };
  }
  try {
    const control = new AbortController();
    const temporizador = setTimeout(() => control.abort(), 4500);
    const r = await fetch(url, {
      signal: control.signal,
      headers: { "user-agent": "VanguardNet/170.0 (fuentes abiertas)" },
      cache: "no-store",
    });
    clearTimeout(temporizador);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const datos = preparar(await r.json());
    cacheMemoria.set(clave, { ts: ahora, datos });
    return { datos, enVivo: true };
  } catch {
    if (golpe) return { datos: golpe.datos as T, enVivo: false };
    return { datos: null as unknown as T, enVivo: false };
  }
}
