"use client";

// v80.0 — EL NÚCLEO EMBEBIDO: una IA neuronal de verdad (LLM) que vive DENTRO
// del navegador del comandante. Sin claves de API, sin servidores, sin coste:
// el modelo (Qwen2.5-0.5B-Instruct cuantizado) se descarga UNA sola vez desde
// el CDN público de HuggingFace y queda cacheado en el navegador.
// v80.0.1 — La inferencia corre en un Web Worker (public/nucleo-worker.js):
// el hilo principal nunca se bloquea y el juego mantiene 60 fps mientras la
// IA razona. Este módulo es el cliente de mensajería del worker.

export type NucleoFase = "inactivo" | "descargando" | "compilando" | "listo" | "error";

export type NucleoEstado = {
  fase: NucleoFase;
  progreso: number; // 0-100 descarga
  dispositivo: "webgpu" | "wasm" | null;
  error: string | null;
};

let estadoGlobal: NucleoEstado = { fase: "inactivo", progreso: 0, dispositivo: null, error: null };
const listeners = new Set<(e: NucleoEstado) => void>();

function emitir(parcial: Partial<NucleoEstado>) {
  estadoGlobal = { ...estadoGlobal, ...parcial };
  for (const l of listeners) l(estadoGlobal);
}

export function estadoNucleo(): NucleoEstado {
  return estadoGlobal;
}

export function nucleoListo(): boolean {
  return estadoGlobal.fase === "listo";
}

export function suscribirNucleo(cb: (e: NucleoEstado) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// ---------- worker ----------
let worker: Worker | null = null;
const pendientes = new Map<number, (texto: string | null) => void>();
let seq = 0;

function ensureWorker(): Worker | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") return null;
  if (worker) return worker;
  try {
    const w = new Worker("/nucleo-worker.js", { type: "module" });
    w.onmessage = (e: MessageEvent) => {
      const m = e.data as { type?: string; fase?: NucleoFase; progreso?: number; dispositivo?: "webgpu" | "wasm" | null; error?: string; id?: number; texto?: string | null };
      if (m?.type === "estado") {
        emitir({ fase: m.fase ?? "inactivo", progreso: m.progreso ?? 0, dispositivo: m.dispositivo ?? null, error: m.error ?? null });
      } else if (m?.type === "resultado" && typeof m.id === "number") {
        const resolver = pendientes.get(m.id);
        pendientes.delete(m.id);
        resolver?.(m.texto ?? null);
      }
    };
    w.onerror = () => {
      emitir({ fase: "error", progreso: 0, dispositivo: null, error: "El worker del núcleo falló al arrancar" });
    };
    worker = w;
    return w;
  } catch {
    return null;
  }
}

// sonda WebGPU en el HILO PRINCIPAL (rápida y segura); el resultado viaja al
// worker, que nunca toca navigator.gpu (en headless cuelga el gpu-process)
async function sondaWebGPU(): Promise<boolean> {
  try {
    const gpu = (navigator as unknown as { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
    if (!gpu) return false;
    return !!(await gpu.requestAdapter());
  } catch {
    return false;
  }
}

export async function activarNucleo(): Promise<boolean> {
  const w = ensureWorker();
  if (!w) {
    emitir({ fase: "error", progreso: 0, dispositivo: null, error: "Este navegador no soporta Web Workers" });
    return false;
  }
  if (estadoGlobal.fase === "listo") return true;
  if (estadoGlobal.fase === "descargando" || estadoGlobal.fase === "compilando") return false;

  return new Promise((resolve) => {
    const uns = suscribirNucleo((e) => {
      if (e.fase === "listo") {
        uns();
        resolve(true);
      } else if (e.fase === "error") {
        uns();
        resolve(false);
      }
    });
    emitir({ fase: "descargando", progreso: 0, dispositivo: null, error: null });
    sondaWebGPU()
      .then((conGPU) => {
        try {
          w.postMessage({ type: "activar", conGPU });
        } catch (e) {
          uns();
          emitir({ fase: "error", progreso: 0, dispositivo: null, error: e instanceof Error ? e.message : String(e) });
          resolve(false);
        }
      })
      .catch(() => {
        try {
          w.postMessage({ type: "activar", conGPU: false });
        } catch {
          uns();
          resolve(false);
        }
      });
  });
}

// ---- tokens razonados en tu dispositivo (stat del juego) ----
export function razonado(): number {
  try {
    return parseInt(localStorage.getItem("vanguard:nucleo-razonado") ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

function sumarRazonado(n: number) {
  try {
    localStorage.setItem("vanguard:nucleo-razonado", String(razonado() + n));
  } catch {}
}

export async function generarNucleo(
  messages: { role: string; content: string }[],
  maxTokens = 90,
): Promise<string | null> {
  const w = ensureWorker();
  if (!w || estadoGlobal.fase !== "listo") return null;
  const id = ++seq;
  return new Promise((resolve) => {
    pendientes.set(id, resolve);
    try {
      w.postMessage({ type: "generar", id, messages, maxTokens });
    } catch {
      pendientes.delete(id);
      resolve(null);
    }
    // red de seguridad: si el worker no responde, libera la promesa
    setTimeout(() => {
      if (pendientes.has(id)) {
        pendientes.delete(id);
        resolve(null);
      }
    }, 180_000);
  });
}
