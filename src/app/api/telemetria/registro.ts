// ============================================================
// VANGUARD v170.0 — REGISTRO DE TELEMETRÍA (memoria de proceso)
// Anillo de eventos + agregados por fila. Hereda la convención
// v169.0: la fila llega en minúsculas, recortada a 48 chars.
// ============================================================

const LIMITE_ANILLO = 2000;
const anillo: { fila: string; via: string; ts: number }[] = [];
const conteoFilas = new Map<string, number>();

export function registrarEventos(eventos: { fila: string; via: string; ts: number }[]): number {
  let aceptados = 0;
  for (const e of eventos) {
    if (!e || typeof e.fila !== "string") continue;
    const fila = e.fila.trim().slice(0, 48).toLowerCase() || "(vacía)";
    const via = e.via === "3d" ? "3d" : "2d";
    anillo.push({ fila, via, ts: Number(e.ts) || Date.now() });
    conteoFilas.set(fila, (conteoFilas.get(fila) ?? 0) + 1);
    aceptados++;
  }
  if (anillo.length > LIMITE_ANILLO) anillo.splice(0, anillo.length - LIMITE_ANILLO);
  return aceptados;
}

export function agregados(): {
  totalEventos: number;
  salasActivas: number;
  topFilas: { fila: string; n: number }[];
  ultimaTs: number | null;
} {
  const topFilas = [...conteoFilas.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([fila, n]) => ({ fila, n }));
  const total = anillo.length;
  const salasActivas = new Set(
    anillo.filter((e) => e.fila.startsWith("abrir:")).map((e) => e.fila.slice(6))
  ).size;
  return {
    totalEventos: total,
    salasActivas,
    topFilas,
    ultimaTs: anillo.length ? anillo[anillo.length - 1].ts : null,
  };
}
