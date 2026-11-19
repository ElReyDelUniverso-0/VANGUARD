import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  Clock,
  Layers,
  Award,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  Target,
  Sparkles,
} from "lucide-react";
import { obtenerCursoPorSlug } from "@/lib/academia";
import { CURSOS_ACADEMIA } from "@/lib/academia/datos-cursos";

interface PropsPaginaCurso {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CURSOS_ACADEMIA.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: PropsPaginaCurso) {
  const { slug } = await params;
  const curso = obtenerCursoPorSlug(slug);
  if (!curso) return { title: "Curso no encontrado | Vanguard Academy" };

  return {
    title: `${curso.titulo} | Vanguard Academy`,
    description: curso.descripcionGeneral,
  };
}

export default async function PaginaDetalleCurso({ params }: PropsPaginaCurso) {
  const { slug } = await params;
  const curso = obtenerCursoPorSlug(slug);

  if (!curso) {
    notFound();
  }

  const primeraLeccion = curso.capitulos[0]?.lecciones[0];
  const primerCapitulo = curso.capitulos[0];
  const enlaceComenzar =
    primeraLeccion && primerCapitulo
      ? `/academia/cursos/${curso.slug}/${primerCapitulo.id}/${primeraLeccion.id}`
      : `/academia/cursos`;

  const totalLecciones = curso.capitulos.reduce((acc, c) => acc + c.lecciones.length, 0);

  return (
    <div className="space-y-10">
      {/* ── ENCABEZADO DEL CURSO ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
        <Link
          href="/academia/cursos"
          className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-mono hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver a la Biblioteca de Cursos</span>
        </Link>

        <div className="space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-full">
              {curso.categoria.toUpperCase()}
            </span>
            <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
              Nivel: {curso.nivel}
            </span>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{curso.duracionHorasEstimadas} horas estimadas</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {curso.titulo}
          </h1>

          <p className="text-lg text-amber-300 font-medium">{curso.subtitulo}</p>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {curso.descripcionGeneral}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href={enlaceComenzar}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl transition-all shadow-xl shadow-amber-950/40 inline-flex items-center gap-2 text-sm"
            >
              <span>Comenzar Lección 1</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="text-xs font-mono text-slate-400">
              {curso.capitulos.length} Capítulos · {totalLecciones} Lecciones con Quizzes
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── TEMARIO SECUENCIAL POR CAPÍTULOS ── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Estructura Curricular del Curso
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {totalLecciones} lecciones interactivas
            </span>
          </div>

          <div className="space-y-6">
            {curso.capitulos.map((capitulo, capIdx) => (
              <div
                key={capitulo.id}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                      Capítulo {capIdx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white">{capitulo.titulo}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {capitulo.descripcion}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400 shrink-0 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                    {capitulo.lecciones.length} lecciones
                  </span>
                </div>

                <div className="space-y-2.5">
                  {capitulo.lecciones.map((leccion, lecIdx) => (
                    <Link
                      key={leccion.id}
                      href={`/academia/cursos/${curso.slug}/${capitulo.id}/${leccion.id}`}
                      className="bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all group"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                          {capIdx + 1}.{lecIdx + 1}
                        </span>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                              {leccion.titulo}
                            </h4>
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {leccion.objetivoBloom?.nivel || "Formación"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {leccion.resumenEjecutivo}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-slate-400 shrink-0 self-end sm:self-center">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {leccion.duracionEstimadaMinutos} min
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PANEL LATERAL DE COMPETENCIAS Y LABORATORIOS ── */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Competencias Demostrables */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span>Competencias a Demostrar</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              {curso.competenciasAdquiridas.map((comp, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{comp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enlaces Prácticos en Vanguard */}
          {curso.nexosVanguardRelacionados && curso.nexosVanguardRelacionados.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Simuladores Vanguard Labs</span>
              </h3>

              <div className="space-y-3">
                {curso.nexosVanguardRelacionados.map((nexo, idx) => (
                  <Link
                    key={idx}
                    href={nexo.ruta}
                    className="block bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 p-3.5 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-amber-300">
                      <span>{nexo.nombre}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {nexo.motivoPedagogico}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
