"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Clock,
  CheckCircle2,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Compass,
  Layers,
} from "lucide-react";
import {
  obtenerEstadoEstudiante,
  obtenerRecomendacionesParaEstudiante,
} from "@/lib/academia";
import { CURSOS_ACADEMIA } from "@/lib/academia/datos-cursos";
import type { EstadoEstudianteLocal } from "@/lib/academia/tipos";

export function DashboardEstudiante() {
  const [estado, setEstado] = useState<EstadoEstudianteLocal | null>(null);

  useEffect(() => {
    setEstado(obtenerEstadoEstudiante());

    const actualizar = (e: Event) => {
      const custom = e as CustomEvent<EstadoEstudianteLocal>;
      setEstado(custom.detail || obtenerEstadoEstudiante());
    };

    window.addEventListener("vanguard:academia:progreso_actualizado", actualizar);
    return () => {
      window.removeEventListener("vanguard:academia:progreso_actualizado", actualizar);
    };
  }, []);

  if (!estado) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 animate-pulse h-36" />
    );
  }

  const totalLeccionesMundo = CURSOS_ACADEMIA.reduce(
    (acc, c) => acc + c.capitulos.reduce((cAcc, cap) => cAcc + cap.lecciones.length, 0),
    0
  );
  const completadasCount = Object.keys(estado.leccionesCompletadas || {}).length;
  const pctCompletitud = Math.round((completadasCount / (totalLeccionesMundo || 1)) * 100);

  const totalQuizzes = Object.keys(estado.puntuacionesCuestionarios || {}).length;
  const promedioScores =
    totalQuizzes > 0
      ? Math.round(
          Object.values(estado.puntuacionesCuestionarios).reduce((acc, q) => acc + q.porcentaje, 0) /
            totalQuizzes
        )
      : 0;

  const recomendaciones = obtenerRecomendacionesParaEstudiante(estado);
  const primeraRecomendacion = recomendaciones[0];

  return (
    <div className="space-y-6">
      {/* ── BANNER DE ESTADO Y ESTADÍSTICAS DEL ESTUDIANTE ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
                Módulo del Estudiante
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Privacidad Local Protegida</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hola, {estado.nombreEstudiante || "Estudiante de Vanguard"}
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Tu progreso formativo, evaluaciones y certificados se guardan de forma segura en este navegador, sin perfiles invasivos ni cookies de terceros.
            </p>
          </div>

          {/* Siguiente paso recomendado */}
          {primeraRecomendacion ? (
            <Link
              href={`/academia/cursos/${primeraRecomendacion.curso.slug}`}
              className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-2xl p-4 transition-all duration-300 group shrink-0 lg:max-w-sm flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-amber-300 uppercase block">
                  Recomendado para ti
                </span>
                <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {primeraRecomendacion.curso.titulo}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {primeraRecomendacion.motivo}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          ) : (
            <Link
              href="/academia/rutas"
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl p-4 transition-all group shrink-0 flex items-center gap-3"
            >
              <Compass className="w-6 h-6 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white block">Constructor de Rutas</span>
                <span className="text-[11px] text-slate-400">Diseña tu plan personalizado</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform ml-2" />
            </Link>
          )}
        </div>

        {/* ── CUADRÍCULA DE MÉTRICAS DEL ESTUDIANTE ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lecciones</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {completadasCount}{" "}
              <span className="text-xs text-slate-400 font-normal">/ {totalLeccionesMundo}</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
              {pctCompletitud}% del catálogo
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Precisión Media</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
              {promedioScores > 0 ? `${promedioScores}%` : "—"}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {totalQuizzes} cuestionarios
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tiempo de Estudio</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {estado.minutosEstudioAcumulados || 0}{" "}
              <span className="text-xs text-slate-400 font-normal">min</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
              {((estado.minutosEstudioAcumulados || 0) / 60).toFixed(1)} horas netas
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>Certificados</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300">
              {estado.certificadosEmitidos?.length || 0}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Reconocimientos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
