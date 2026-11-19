"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, BookMarked, ArrowRight, Tag } from "lucide-react";
import { GLOSARIO_ACADEMIA } from "@/lib/academia/datos-rutas-glosario";
import { CATEGORIAS_ACADEMIA } from "@/lib/academia/datos-cursos";
import type { TerminoGlosario } from "@/lib/academia/tipos";

export function GlosarioInteractivo() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [letraSeleccionada, setLetraSeleccionada] = useState<string | null>(null);

  const letrasDisponibles = Array.from(
    new Set(GLOSARIO_ACADEMIA.map((t) => t.termino.charAt(0).toUpperCase()))
  ).sort();

  const terminosFiltrados = GLOSARIO_ACADEMIA.filter((item) => {
    if (categoriaSeleccionada !== "todas" && item.categoria !== categoriaSeleccionada) {
      return false;
    }
    if (letraSeleccionada && !item.termino.toUpperCase().startsWith(letraSeleccionada)) {
      return false;
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      return (
        item.termino.toLowerCase().includes(q) ||
        item.definicionBreve.toLowerCase().includes(q) ||
        item.explicacionAmpleada.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* ── ENCABEZADO Y BUSCADOR ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
              Biblioteca Terminológica
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {GLOSARIO_ACADEMIA.length} términos normalizados
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Glosario Temático Multidisciplinar
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Definiciones técnicas rigurosas de las 10 disciplinas con explicaciones ampliadas y enlaces directos a las lecciones donde se aplican.
          </p>
        </div>

        {/* Barra de Búsqueda */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por término, definición o concepto (ej. Albedo, Cuello de botella, Litografía...)"
            className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm font-medium"
          />
        </div>

        {/* Filtro por Categorías */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setCategoriaSeleccionada("todas");
              setLetraSeleccionada(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
              categoriaSeleccionada === "todas"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Todas las áreas
          </button>
          {CATEGORIAS_ACADEMIA.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategoriaSeleccionada(cat.id);
                setLetraSeleccionada(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                categoriaSeleccionada === cat.id
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Índice Alfabético */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-800 scrollbar-none">
          <button
            type="button"
            onClick={() => setLetraSeleccionada(null)}
            className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all ${
              letraSeleccionada === null
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            *
          </button>
          {letrasDisponibles.map((letra) => (
            <button
              key={letra}
              type="button"
              onClick={() => setLetraSeleccionada(letra)}
              className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all ${
                letraSeleccionada === letra
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {letra}
            </button>
          ))}
        </div>
      </div>

      {/* ── LISTA DE TÉRMINOS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {terminosFiltrados.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between space-y-4 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-bold border border-slate-700">
                  {item.categoria}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight">{item.termino}</h3>

              <p className="text-sm text-amber-200/90 font-medium leading-snug">
                {item.definicionBreve}
              </p>

              <p className="text-xs text-slate-300 leading-relaxed">{item.explicacionAmpleada}</p>
            </div>

            {Boolean(item.cursoRelacionadoSlug || (item.leccionesRelacionadas && item.leccionesRelacionadas.length > 0)) && (
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Aparece en: {item.cursoRelacionadoSlug || item.leccionesRelacionadas?.[0]?.cursoSlug}
                </span>
                <Link
                  href={`/academia/cursos/${item.cursoRelacionadoSlug || item.leccionesRelacionadas?.[0]?.cursoSlug}`}
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <span>Ver en Lección</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
