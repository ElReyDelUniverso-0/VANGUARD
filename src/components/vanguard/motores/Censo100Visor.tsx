"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PLATAFORMAS_100,
  CATEGORIAS_CENSO,
  type PlataformaReferencia,
} from "@/lib/motores-analiticos/censo-100-plataformas";

export function Censo100Visor() {
  const [categoria, setCategoria] = useState<string>("todas");
  const [busqueda, setBusqueda] = useState<string>("");

  const filtradas = PLATAFORMAS_100.filter((p) => {
    const coincideCat = categoria === "todas" || p.categoria === categoria;
    const q = busqueda.toLowerCase().trim();
    const coincideBusqueda =
      q === "" ||
      p.nombre.toLowerCase().includes(q) ||
      p.enfoqueClave.toLowerCase().includes(q) ||
      p.paisOrigen.toLowerCase().includes(q) ||
      p.analogiaVanguard.toLowerCase().includes(q);
    return coincideCat && coincideBusqueda;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col gap-3 rounded-lg border border-purple-500/20 bg-zinc-950/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded border border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
          <span className="text-zinc-500">🔍</span>
          <input
            type="text"
            placeholder="Buscar por plataforma, país, enfoque o ruta de Vanguard..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-transparent font-mono text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="font-mono text-xs text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
          <span>Mostrando:</span>
          <span className="rounded bg-purple-500/20 px-2 py-0.5 font-bold text-purple-300">
            {filtradas.length} de 100
          </span>
        </div>
      </div>

      {/* Botones de Categorías */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategoria("todas")}
          className={`rounded px-2.5 py-1 font-mono text-xs transition ${
            categoria === "todas"
              ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]"
              : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          🌐 Todas (100)
        </button>
        {CATEGORIAS_CENSO.map((cat) => {
          const cuenta = PLATAFORMAS_100.filter((p) => p.categoria === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoria(cat.id)}
              className={`rounded px-2.5 py-1 font-mono text-xs transition ${
                categoria === cat.id
                  ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                  : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {cat.icono} {cat.label} ({cuenta})
            </button>
          );
        })}
      </div>

      {/* Grid de Plataformas */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtradas.map((plat) => (
          <div
            key={plat.id}
            className="flex flex-col justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3.5 transition hover:border-purple-500/40 hover:bg-zinc-900/40"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-zinc-100">{plat.nombre}</h3>
                <span className="shrink-0 rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">
                  {plat.paisOrigen}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                {plat.enfoqueClave}
              </p>
            </div>

            <div className="mt-3 border-t border-zinc-800/60 pt-2 text-[11px]">
              <div className="flex items-center justify-between text-zinc-500">
                <span>Ruta en Vanguard:</span>
                <span className="font-mono font-medium text-purple-400">
                  {plat.analogiaVanguard}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <a
                  href={plat.urlReferencia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-zinc-500 hover:text-zinc-300"
                >
                  Sitio oficial ↗
                </a>
                <Link
                  href={plat.analogiaVanguard.split(" ")[0]}
                  className="rounded bg-purple-500/10 px-2 py-0.5 font-mono text-[10px] text-purple-300 hover:bg-purple-500/20"
                >
                  Abrir en Vanguard →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
