"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { CURSOS_ACADEMIA, CATEGORIAS_ACADEMIA } from "@/lib/academia/datos-cursos";
import { obtenerEstadoEstudiante } from "@/lib/academia/progreso";
import type { Curso, EstadoEstudianteLocal } from "@/lib/academia/tipos";

export function CatalogoCursos() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [nivelSeleccionado, setNivelSeleccionado] = useState("todos");
  const [estadoEstudiante, setEstadoEstudiante] = useState<EstadoEstudianteLocal | null>(null);

  useEffect(() => {
    setEstadoEstudiante(obtenerEstadoEstudiante());
  }, []);

  const cursosFiltrados = CURSOS_ACADEMIA.filter((curso) => {
    if (categoriaSeleccionada !== "todas" && curso.categoria !== categoriaSeleccionada) {
      return false;
    }
    if (nivelSeleccionado !== "todos" && curso.nivel !== nivelSeleccionado) {
      return false;
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const coincideTitulo = curso.titulo.toLowerCase().includes(q);
      const coincideSubtitulo = curso.subtitulo.toLowerCase().includes(q);
      const coincideDesc = curso.descripcionGeneral.toLowerCase().includes(q);
      const coincideComp = curso.competenciasAdquiridas.some((c) =>
        c.toLowerCase().includes(q)
      );
      return coincideTitulo || coincideSubtitulo || coincideDesc || coincideComp;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* ── BARRA DE BÚSQUEDA Y FILTRADO AVANZADO ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
                Catálogo Curricular Completo
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {CURSOS_ACADEMIA.length} Cursos Maestros
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Biblioteca y Cursos de Vanguard Academy
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Programas rigurosos estructurados en capítulos, lecciones detalladas, checkpoints formativos y retos prácticos interactivos.
            </p>
          </div>

          {/* Selector de Nivel */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-slate-400">Nivel:</span>
            <select
              value={nivelSeleccionado}
              onChange={(e) => setNivelSeleccionado(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="todos">Todos los niveles</option>
              <option value="introductorio">Introductorio</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por curso, conceptos, competencias o temáticas (ej: Estrechos, Litografía, Finanzas, Fonética...)"
            className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm font-medium"
          />
        </div>

        {/* 10 Categorías en Pestañas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setCategoriaSeleccionada("todas")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
              categoriaSeleccionada === "todas"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Todas ({CURSOS_ACADEMIA.length})
          </button>
          {CATEGORIAS_ACADEMIA.map((cat) => {
            const count = CURSOS_ACADEMIA.filter((c) => c.categoria === cat.id).length;
            const esActiva = categoriaSeleccionada === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaSeleccionada(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  esActiva
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span>{cat.nombre}</span>
                <span
                  className={`text-[10px] font-mono px-1 rounded ${
                    esActiva ? "bg-amber-600 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CUADRÍCULA DE CURSOS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursosFiltrados.map((curso) => {
          const totalLecs = curso.capitulos.reduce((acc, c) => acc + c.lecciones.length, 0);
          const completadasEnCurso = curso.capitulos.reduce(
            (acc, cap) =>
              acc +
              cap.lecciones.filter(
                (l) => estadoEstudiante?.leccionesCompletadas[`${curso.slug}:${l.id}`]
              ).length,
            0
          );
          const pct = Math.round((completadasEnCurso / (totalLecs || 1)) * 100);

          return (
            <div
              key={curso.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-amber-950/20 group"
            >
              <div className="space-y-4">
                {/* Cabecera */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                    {curso.categoria}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                      curso.nivel === "avanzado"
                        ? "bg-rose-950 text-rose-300 border border-rose-800"
                        : curso.nivel === "intermedio"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    }`}
                  >
                    {curso.nivel}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                    {curso.titulo}
                  </h3>
                  <p className="text-xs text-amber-400 font-mono mt-0.5">{curso.subtitulo}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {curso.descripcionGeneral}
                </p>

                {/* Métricas del curso */}
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {curso.duracionHorasEstimadas} h
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    {curso.capitulos.length} caps
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    {totalLecs} lecciones
                  </span>
                </div>

                {/* Barra de progreso local */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Progreso: {pct}%</span>
                    <span>
                      {completadasEnCurso}/{totalLecs} lecciones
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-amber-400 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Botón de acceso */}
              <div className="pt-6 mt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {curso.nexosVanguardRelacionados.length > 0 && "Incluye simulador"}
                </span>

                <Link
                  href={`/academia/cursos/${curso.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold transition-all border border-amber-500/40 hover:border-transparent group-hover:scale-105"
                >
                  <span>{pct > 0 ? "Continuar" : "Ver Temario"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
