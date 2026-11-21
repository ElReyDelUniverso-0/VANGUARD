"use client";

import { useState } from "react";
import Link from "next/link";
import { MODULOS_PUBLICOS, type Modulo } from "./modulos";
import { PortadaHermosaModulo } from "./portadas-hermosas";

export function BotonMenuAdictivo() {
  const [abierto, setAbierto] = useState(false);
  const [filtro, setFiltro] = useState<string>("todos");

  const categorias = [
    { id: "todos", label: "Todos los Mundos", icono: "🌐" },
    { id: "novedades", label: "Novedades 2026", icono: "🔥" },
    { id: "conflictos", label: "Conflictos & Defensa", icono: "⚔️" },
    { id: "inteligencia", label: "Inteligencia & Ciencia", icono: "🧠" },
    { id: "datos", label: "Datos & Satélites", icono: "📡" },
    { id: "juego", label: "Juego & Media", icono: "🎮" },
  ];

  // v436.0 · los filtros apuntaban a módulos que ya no existen (informacion,
  // academia, arsenal, mapa, secretos, ciencia, datos, planeta, juego, medios):
  // elegir cualquier categoría devolvía la lista VACÍA. Con los cuatro módulos
  // de ahora cada categoría vuelve a enseñar algo, y lo que enseña es verdad.
  const POR_CATEGORIA: Record<string, string[]> = {
    novedades: ["redaccion"],
    conflictos: ["redaccion", "mundo"],
    inteligencia: ["saber", "mundo"],
    datos: ["mundo"],
    juego: ["casa", "redaccion"],
  };

  const modulosFiltrados = MODULOS_PUBLICOS.filter((m) => {
    if (filtro === "todos") return true;
    return (POR_CATEGORIA[filtro] ?? []).includes(m.id);
  });

  const saltarAleatorio = () => {
    const todosEnlaces = MODULOS_PUBLICOS.flatMap((m) => m.pestanas.map((p) => p.href));
    const destino = todosEnlaces[Math.floor(Math.random() * todosEnlaces.length)];
    if (destino) {
      window.location.href = destino;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir Menú Maestro de Mundos"
        className="group relative flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-sky-500/20 px-3 py-1 font-mono text-xs font-bold text-amber-200 shadow-[0_0_12px_rgba(245,197,66,0.25)] transition hover:border-amber-400 hover:shadow-[0_0_18px_rgba(245,197,66,0.45)]"
      >
        <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="tracking-widest uppercase">MUNDOS [{MODULOS_PUBLICOS.length}]</span>
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#040408]/95 backdrop-blur-xl overflow-y-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
          {/* Header Superior del Modal */}
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-black">
                VG
              </span>
              <div>
                <h2 className="text-xl font-black tracking-wider text-zinc-100 uppercase">
                  CENTRO DE MANDO · LOS {MODULOS_PUBLICOS.length} MUNDOS
                </h2>
                <p className="font-mono text-xs text-zinc-400">
                  Exploración interactiva · Zero AI illustrations · Pura telemetría vectorial
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAbierto(false);
                  window.dispatchEvent(new CustomEvent("abrir-guia-vanguard"));
                }}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-950/40 px-3 py-1.5 font-mono text-xs font-bold text-sky-300 hover:bg-sky-900/40 transition"
              >
                🧭 Guía Visual
              </button>
              <button
                type="button"
                onClick={saltarAleatorio}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 px-3 py-1.5 font-mono text-xs font-bold text-purple-300 hover:bg-purple-900/40 transition"
              >
                🎲 Sorpréndeme
              </button>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 font-mono text-xs text-zinc-200 hover:bg-zinc-700 transition"
              >
                ✕ CERRAR [ESC]
              </button>
            </div>
          </div>

          {/* Filtros de Categoría */}
          <div className="mx-auto my-6 flex w-full max-w-7xl flex-wrap gap-2">
            {categorias.map((c) => (
              <button
                key={c.id}
                onClick={() => setFiltro(c.id)}
                className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-medium transition ${
                  filtro === c.id
                    ? "bg-amber-400 text-black font-bold shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                    : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {c.icono} {c.label}
              </button>
            ))}
          </div>

          {/* Rejilla de Mundos con Portadas Vectoriales */}
          <div className="mx-auto grid w-full max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modulosFiltrados.map((m) => {
              const visibles = m.pestanas.slice(0, 5);
              const resto = m.pestanas.length - visibles.length;
              return (
                <div
                  key={m.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/80 transition-all duration-300 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,197,66,0.15)]"
                >
                  {/* Portada Vectorial en CSS/SVG nativo */}
                  <Link href={m.nav} onClick={() => setAbierto(false)} className="relative block h-40 w-full overflow-hidden border-b border-zinc-800/60">
                    <PortadaHermosaModulo id={m.id} />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="rounded bg-black/60 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300 backdrop-blur-md border border-amber-500/30 uppercase">
                        {m.corto}
                      </span>
                      {(m.id === "academia" || m.id === "motores") && (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-300 border border-emerald-500/40">
                          NUEVO 2026
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Cuerpo y Atajos */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <Link href={m.nav} onClick={() => setAbierto(false)}>
                        <h3 className="text-lg font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
                          {m.nombre}
                        </h3>
                      </Link>
                      <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                        {m.gancho}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/60">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                        SALAS DESTACADAS:
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {visibles.map((p) => (
                          <Link
                            key={p.href}
                            href={p.href}
                            onClick={() => setAbierto(false)}
                            className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-300 hover:bg-amber-500/20 hover:text-amber-200 transition"
                          >
                            {p.label}
                          </Link>
                        ))}
                        {resto > 0 && (
                          <span className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
                            +{resto}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
