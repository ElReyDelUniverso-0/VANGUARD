"use client";

// ============================================================
// VANGUARD v170.0 — SALAS: REJILLA + TENDENCIAS + HISTORIAL
// Fórmula YouTube: fila «Tendencias de la red» arriba, fila
// «Historial» (seguir viendo) debajo, y la rejilla por categorías.
// ============================================================

import { useMemo, useState } from "react";
import { CATEGORIAS, type Categoria, type EstadoAgente, type Sala } from "@/lib/vanguard/tipos";
import { SALAS } from "@/lib/vanguard/salas";
import { calcularTendencias } from "@/lib/vanguard/algoritmo";

interface PropsSalas {
  agente: EstadoAgente;
  montado: boolean;
  onAbrir: (salaId: string) => void;
}

const FILTROS: ("TODO" | Categoria)[] = ["TODO", "MUNDO", "MERCADO", "JUEGO", "CONOCIMIENTO", "AGENTE"];

export function SalasGrid({ agente, montado, onAbrir }: PropsSalas) {
  const [filtro, setFiltro] = useState<"TODO" | Categoria>("TODO");

  const tendencias = useMemo(() => (montado ? calcularTendencias(agente) : []), [agente, montado]);
  const historial = useMemo(
    () =>
      montado
        ? agente.historial.map((id) => SALAS.find((s) => s.id === id)).filter((s): s is Sala => Boolean(s)).slice(0, 8)
        : [],
    [agente.historial, montado]
  );
  const visibles = useMemo(
    () => (filtro === "TODO" ? SALAS : SALAS.filter((s) => s.categoria === filtro)),
    [filtro]
  );

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 pb-24 pt-4 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* TENDENCIAS DE LA RED */}
        {tendencias.length > 0 && (
          <section aria-label="Tendencias">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-black tracking-[0.25em] text-white/50">
              <span className="text-amber-300">▲</span> TENDENCIAS DE LA RED
            </h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {tendencias.map((sala, i) => (
                <button
                  key={sala.id}
                  onClick={() => onAbrir(sala.id)}
                  className="group relative flex w-40 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0c12] p-3 text-left transition-all hover:border-white/30 active:scale-95"
                >
                  <span className="absolute right-2 top-2 text-[10px] font-mono text-white/30">#{i + 1}</span>
                  <span className="text-2xl">{sala.icono}</span>
                  <span className="mt-2 line-clamp-2 text-[11px] font-bold leading-tight text-white">{sala.nombre}</span>
                  <span className={`mt-1 text-[9px] font-bold tracking-widest ${CATEGORIAS[sala.categoria].texto}`}>
                    {sala.categoria}
                  </span>
                  <span className="mt-2 h-1 w-full rounded-full bg-white/10">
                    <span
                      className={`block h-full rounded-full bg-gradient-to-r ${CATEGORIAS[sala.categoria].gradiente}`}
                      style={{ width: `${sala.poder}%` }}
                    />
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* HISTORIAL — SEGUIR VIENDO */}
        {historial.length > 0 && (
          <section aria-label="Historial">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-black tracking-[0.25em] text-white/50">
              <span className="text-cyan-300">↺</span> SEGUIR VIENDO
            </h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {historial.map((sala) => (
                <button
                  key={sala.id}
                  onClick={() => onAbrir(sala.id)}
                  className="flex w-44 shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-[#0a0c12] p-2.5 text-left transition-all hover:border-cyan-400/40 active:scale-95"
                >
                  <span className="text-xl">{sala.icono}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-bold text-white">{sala.nombre}</span>
                    <span className="text-[9px] text-white/40">
                      {agente.senales[sala.id]?.vistas ?? 0} vista{(agente.senales[sala.id]?.vistas ?? 0) === 1 ? "" : "s"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* FILTROS DE CATEGORÍA */}
        <div className="flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-full border px-4 py-1.5 text-[11px] font-black tracking-widest transition-all active:scale-95 ${
                filtro === f
                  ? "border-white/60 bg-white text-black"
                  : "border-white/15 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* REJILLA DE SALAS */}
        <section aria-label="Todas las salas" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visibles.map((sala) => {
            const cat = CATEGORIAS[sala.categoria];
            const senal = agente.senales[sala.id];
            return (
              <button
                key={sala.id}
                onClick={() => onAbrir(sala.id)}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border ${cat.borde} bg-[#0a0c12] p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:${cat.glow} active:scale-95`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradiente} opacity-0 transition-opacity duration-300 group-hover:opacity-15`} />
                <div className="relative flex items-start justify-between">
                  <span className="text-3xl">{sala.icono}</span>
                  {(senal?.vistas ?? 0) === 0 ? (
                    <span className="rounded-full bg-white text-[8px] font-black tracking-wider text-black px-1.5 py-0.5">NUEVA</span>
                  ) : (senal?.likes ?? 0) > 0 ? (
                    <span className="text-xs text-rose-400">♥</span>
                  ) : null}
                </div>
                <h4 className="relative mt-3 text-[12px] font-black leading-tight tracking-wide text-white">{sala.nombre}</h4>
                <p className="relative mt-1 line-clamp-2 text-[10px] leading-snug text-white/45">{sala.tagline}</p>
                <div className="relative mt-3 flex items-center justify-between">
                  <span className={`text-[9px] font-bold tracking-widest ${cat.texto}`}>{cat.etiqueta}</span>
                  <span className="text-[9px] font-mono text-white/30">{sala.fuente === "api" ? "● VIVO" : sala.fuente === "sim" ? "◆ SIM" : "▤ ARCH"}</span>
                </div>
              </button>
            );
          })}
        </section>
      </div>
    </div>
  );
}
