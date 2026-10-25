"use client";

// ============================================================
// v173.0 LA CASA EN VIVO — EL PULSO DEL MERCADO EN EL CLIENTE
// Un solo grifo para toda la Casa: /api/mercado cada 5 s, pausa
// honesta cuando la pestaña duerme (cero gasto invisible) y
// dirección de tick (sube/baja) para el flash de precio estilo
// terminal de mercado. Si el grifo falla, la última foto sigue
// viva en pantalla — la casa no parpadea.
// ============================================================
import { useEffect, useRef, useState } from "react";

export type Clase = "cripto" | "acciones" | "indices" | "divisas";
export type Ticker = {
  id: string;
  s: string;
  n: string;
  c: Clase;
  p: number;
  d: number; // Δ% 24h
  ch: number[]; // chispa (cierres recientes)
  f: string; // fuente: binance | yahoo | sim
};
export type Direccion = "sube" | "baja" | null;

const INTERVALO = 5000;
const VIDA_FLASH = 900;

export function useMercadoVivo() {
  const [activos, setActivos] = useState<Ticker[]>([]);
  const [ts, setTs] = useState(0);
  const [vivo, setVivo] = useState(false); // al menos una foto buena
  const [error, setError] = useState<string>("");
  const [dirs, setDirs] = useState<Record<string, Direccion>>({});
  const previos = useRef<Map<string, number>>(new Map());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    let muerto = false;
    let id: ReturnType<typeof setTimeout> | null = null;
    let esperando = false;

    const flash = (lista: Ticker[]) => {
      const nuevos: Record<string, Direccion> = {};
      for (const a of lista) {
        const prev = previos.current.get(a.id);
        if (prev != null && a.p !== prev) nuevos[a.id] = a.p > prev ? "sube" : "baja";
        previos.current.set(a.id, a.p);
        if (nuevos[a.id]) {
          const old = timers.current.get(a.id);
          if (old) clearTimeout(old);
          timers.current.set(
            a.id,
            setTimeout(() => {
              setDirs((d) => (d[a.id] ? { ...d, [a.id]: null } : d));
            }, VIDA_FLASH),
          );
        }
      }
      if (Object.keys(nuevos).length) setDirs((d) => ({ ...d, ...nuevos }));
    };

    const latir = async () => {
      if (esperando) return;
      esperando = true;
      try {
        const r = await fetch("/api/mercado", { cache: "no-store" });
        const j = (await r.json()) as { ok: boolean; ts?: number; activos?: Ticker[]; error?: string };
        if (muerto) return;
        if (j.ok && j.activos) {
          flash(j.activos);
          setActivos(j.activos);
          setTs(j.ts ?? Date.now());
          setVivo(true);
          setError("");
        } else {
          setError(j.error ?? "mercado callado");
        }
      } catch {
        if (!muerto) setError("enlace con el mercado caído");
      } finally {
        esperando = false;
        if (!muerto && !document.hidden) id = setTimeout(latir, INTERVALO);
      }
    };

    const onVis = () => {
      if (document.hidden) {
        if (id) { clearTimeout(id); id = null; }
      } else {
        void latir();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    void latir();
    return () => {
      muerto = true;
      if (id) clearTimeout(id);
      document.removeEventListener("visibilitychange", onVis);
      timers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const mapa = new Map(activos.map((a) => [a.id, a]));
  return { activos, mapa, dirs, ts, vivo, error };
}

// ── FORMATO DE PRECIO estilo terminal ────────────────────────
export function fmtPrecio(p: number): string {
  if (!Number.isFinite(p)) return "—";
  const abs = Math.abs(p);
  const dec = abs >= 1000 ? 2 : abs >= 10 ? 2 : abs >= 1 ? 4 : 6;
  return p.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
export function fmtPct(d: number): string {
  if (!Number.isFinite(d)) return "—";
  return `${d >= 0 ? "+" : ""}${d.toFixed(2)}%`;
}
