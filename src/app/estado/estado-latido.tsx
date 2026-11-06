"use client";

// ═══════════════════════════════════════════════════════════════════════════
// EL LATIDO VIVO — la isla del estado (sala /estado). UN clic → UN fetch a
// /api/health → el latido del server pintado a la vista: proceso, base de
// datos, latencia, memoria y tiempo de vida. Sin efectos, sin intervalos,
// sin sondeos automáticos (ley v335): el estado solo cambia con la mano del
// comandante. El watchdog de la casa ya consulta /api/health por su cuenta
// (v27); esta isla es la mirada pública, no el guardián.
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from "react";

type Latido = {
  ok: boolean;
  db: "up" | "slow" | "down";
  ms: number;
  rss: number;
  heap: number;
  uptime: number;
  version: string;
};

type EstadoLatido = "reposo" | "midiendo" | "latido" | "error";

const chipDb = (db: Latido["db"]) =>
  db === "up"
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
    : db === "slow"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
      : "border-red-500/40 bg-red-500/10 text-red-400";

const nombreDb = (db: Latido["db"]) =>
  db === "up" ? "VIVA" : db === "slow" ? "LENTA" : "SIN VOZ";

function vidaHumana(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function EstadoLatido() {
  const [estado, setEstado] = useState<EstadoLatido>("reposo");
  const [latido, setLatido] = useState<Latido | null>(null);
  const [motivo, setMotivo] = useState("");

  async function tomarLatido() {
    setEstado("midiendo");
    setMotivo("");
    setLatido(null);
    try {
      const respuesta = await fetch("/api/health", { cache: "no-store" });
      const datos = (await respuesta.json()) as Latido;
      if (!respuesta.ok || !datos.ok) {
        setMotivo("El server respondió sin latido válido.");
        setEstado("error");
        return;
      }
      setLatido(datos);
      setEstado("latido");
    } catch {
      setMotivo("El server no respondió — el latido está mudo (¿cayó?).");
      setEstado("error");
    }
  }

  return (
    <div className="mt-5">
      <button
        onClick={tomarLatido}
        disabled={estado === "midiendo"}
        className="inline-flex items-center gap-2 rounded-sm border border-emerald-500/50 bg-emerald-500/10 px-4 py-2.5 font-mono text-[12px] uppercase tracking-widest text-emerald-400 transition-colors hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 disabled:cursor-wait disabled:opacity-60"
      >
        {estado === "midiendo" ? "Escuchando el pecho…" : "Tomar el latido ▸"}
      </button>
      <p className="mt-2 font-mono text-[10px] text-zinc-600">
        un clic · un latido · sin intervalos (ley v335)
      </p>

      {estado === "error" && (
        <div className="mt-4 border border-red-500/40 bg-red-500/10 rounded-md p-4 font-mono text-[11px] text-red-300">
          {motivo}
        </div>
      )}

      {estado === "latido" && latido && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="border border-emerald-500/40 bg-emerald-500/10 rounded-md p-4">
            <p className="font-mono text-[13px] uppercase tracking-widest text-emerald-400">
              El proceso vive
            </p>
            <p className="mt-1.5 font-mono text-[11px] text-zinc-400">
              El server responde siempre 200 mientras esté de pie (v84) — el
              estado de la BD viaja como diagnóstico, no como veredicto.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="border border-zinc-800 bg-zinc-900/60 rounded-md p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                Base de datos
              </p>
              <p
                className={`mt-1.5 inline-block rounded-sm border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider ${chipDb(latido.db)}`}
              >
                {nombreDb(latido.db)}
              </p>
              <p className="mt-1.5 text-[10px] text-zinc-600">
                consulta con reloj de 3.5 s (v84)
              </p>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/60 rounded-md p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                Latencia del eco
              </p>
              <p className="mt-1.5 font-mono text-[15px] text-zinc-200">
                {latido.ms} ms
              </p>
              <p className="mt-1.5 text-[10px] text-zinc-600">
                ida y vuelta de la consulta
              </p>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/60 rounded-md p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                Versión
              </p>
              <p className="mt-1.5 font-mono text-[15px] text-zinc-200">
                {latido.version}
              </p>
              <p className="mt-1.5 text-[10px] text-zinc-600">
                la firma de la casa
              </p>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/60 rounded-md p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                Memoria (RSS)
              </p>
              <p className="mt-1.5 font-mono text-[15px] text-zinc-200">
                {latido.rss} MB
              </p>
              <p className="mt-1.5 text-[10px] text-zinc-600">
                el vigilante releva a los 900 MB (v178)
              </p>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/60 rounded-md p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                Montículo (heap)
              </p>
              <p className="mt-1.5 font-mono text-[15px] text-zinc-200">
                {latido.heap} MB
              </p>
              <p className="mt-1.5 text-[10px] text-zinc-600">
                lo que la casa está sosteniendo
              </p>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/60 rounded-md p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                Tiempo de vida
              </p>
              <p className="mt-1.5 font-mono text-[15px] text-zinc-200">
                {vidaHumana(latido.uptime)}
              </p>
              <p className="mt-1.5 text-[10px] text-zinc-600">
                desde el último despertar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
