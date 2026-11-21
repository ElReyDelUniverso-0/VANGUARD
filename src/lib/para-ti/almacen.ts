// ═══════════════════════════════════════════════════════════════════════════
// v432.4 · EL ALGORITMO — el almacén (donde vive lo aprendido)
//
// Todo lo que el algoritmo sabe de ti se queda en tu aparato: ni un byte sale
// a un servidor. La clave es versionada para poder cambiar el formato sin
// romper nada, y hay una puerta para OLVIDARLO todo (el derecho al olvido no
// se pide: se tiene). Si el almacén está corrupto, se empieza de cero en vez
// de romper el feed.
// ═══════════════════════════════════════════════════════════════════════════

import { aprender, madurar, memoriaVacia, type Evento, type Memoria } from "./memoria";

/** v2 = formato del algoritmo nuevo (Beta por rasgo). El v1 viejo se ignora. */
export const CLAVE = "vg432:algoritmo:v2";
/** Aviso para que la interfaz se entere de que aprendió algo. */
export const EVENTO_APRENDIDO = "vg:algoritmo:aprendido";

function hayAlmacen(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/** Sanea lo guardado: si algo no cuadra, se descarta la pieza, no todo. */
function sanear(datos: unknown, ahora: number): Memoria {
  const base = memoriaVacia(ahora);
  if (!datos || typeof datos !== "object") return base;
  const d = datos as Partial<Memoria>;
  if (d.v !== 1) return base;

  const rasgo: Memoria["rasgo"] = {};
  for (const [k, e] of Object.entries(d.rasgo ?? {})) {
    const a = Number((e as { a?: unknown })?.a);
    const b = Number((e as { b?: unknown })?.b);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    rasgo[k] = { a: Math.max(0, Math.min(180, a)), b: Math.max(0, Math.min(180, b)) };
  }

  const vistos: Memoria["vistos"] = {};
  for (const [k, v] of Object.entries(d.vistos ?? {})) {
    const ts = Number((v as { ts?: unknown })?.ts);
    if (!Number.isFinite(ts) || ts <= 0) continue;
    const veces = Number((v as { veces?: unknown })?.veces);
    const pct = Number((v as { pct?: unknown })?.pct);
    vistos[k] = {
      ts,
      veces: Number.isFinite(veces) ? Math.max(1, Math.min(999, veces)) : 1,
      pct: Number.isFinite(pct) ? Math.max(0, Math.min(1, pct)) : 0,
    };
  }

  const s = d.sesion;
  const sesion = {
    inicio: Number.isFinite(Number(s?.inicio)) ? Number(s?.inicio) : ahora,
    tipo: typeof s?.tipo === "object" && s?.tipo ? { ...s.tipo } : {},
    autor: typeof s?.autor === "object" && s?.autor ? { ...s.autor } : {},
  };

  return {
    v: 1,
    rasgo,
    vistos,
    sesion,
    eventos: Number.isFinite(Number(d.eventos)) ? Math.max(0, Number(d.eventos)) : 0,
    actualizado: Number.isFinite(Number(d.actualizado)) ? Number(d.actualizado) : ahora,
  };
}

/** Lee lo aprendido (y lo madura: el olvido se aplica al leer). */
export function leerMemoria(ahora = Date.now()): Memoria {
  if (!hayAlmacen()) return memoriaVacia(ahora);
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    const m = sanear(crudo ? JSON.parse(crudo) : null, ahora);
    return madurar(m, ahora);
  } catch {
    return memoriaVacia(ahora);
  }
}

let temporizador: number | null = null;
let pendiente: Memoria | null = null;

/** Guarda con retardo: muchos eventos seguidos = una sola escritura. */
export function guardarMemoria(m: Memoria): void {
  if (!hayAlmacen()) return;
  pendiente = m;
  if (temporizador !== null) return;
  const escribir = () => {
    temporizador = null;
    const datos = pendiente;
    pendiente = null;
    if (!datos) return;
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(datos));
      window.dispatchEvent(new CustomEvent(EVENTO_APRENDIDO, { detail: { eventos: datos.eventos } }));
    } catch {
      /* almacén lleno o bloqueado: el feed sigue funcionando sin memoria */
    }
  };
  temporizador =
    typeof window.requestIdleCallback === "function"
      ? (window.requestIdleCallback(escribir, { timeout: 1200 }) as unknown as number)
      : window.setTimeout(escribir, 250);
}

/** La puerta única: un gesto entra, la memoria aprende y se guarda. */
export function aprenderLocal(ev: Evento, ahora = ev.ts ?? Date.now()): Memoria {
  const m = aprender(leerMemoria(ahora), { ...ev, ts: ev.ts ?? ahora }, ahora);
  guardarMemoria(m);
  return m;
}

/** Olvidarlo todo (el botón «olvídame» de la sala de máquinas). */
export function olvidarTodo(): void {
  if (!hayAlmacen()) return;
  try {
    window.localStorage.removeItem(CLAVE);
    window.dispatchEvent(new CustomEvent(EVENTO_APRENDIDO, { detail: { eventos: 0 } }));
  } catch {
    /* nada que olvidar */
  }
}
