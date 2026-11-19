import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Compass,
  Layers,
  Sparkles,
  BookOpen,
  Award,
  ShieldCheck,
  Target,
  ArrowRight,
  BookMarked,
  CheckCircle2,
} from "lucide-react";
import { DashboardEstudiante } from "@/components/vanguard/academia/DashboardEstudiante";
import { CURSOS_ACADEMIA, CATEGORIAS_ACADEMIA } from "@/lib/academia/datos-cursos";
import { RUTAS_PREDEFINIDAS } from "@/lib/academia/datos-rutas-glosario";

export default function PaginaPrincipalAcademia() {
  return (
    <div className="space-y-12">
      {/* ── HERO PRINCIPAL ── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Vanguard Academy · Cátedra Digital</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Aprende sistemas complejos con rigor, práctica activa y privacidad total.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Plataforma formativa inspirada en los mejores modelos pedagógicos de Khan Academy, Brilliant y Coursera: temarios por capítulos, ejercicios interactivos, tarjetas de estudio con repaso espaciado y constructor de rutas personalizadas.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/academia/cursos"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-amber-950/40 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explorar los 10 Cursos</span>
            </Link>

            <Link
              href="/academia/rutas"
              className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-slate-700 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Crear Ruta Personalizada</span>
            </Link>

            <Link
              href="/academia/tarjetas"
              className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-sm transition-all border border-slate-800 flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Flashcards 3D</span>
            </Link>
          </div>
        </div>

        {/* Pilares pedagógicos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-800/80">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase font-mono">Taxonomía de Bloom</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Objetivos pedagógicos estructurados desde recordar hasta evaluar y crear.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase font-mono">Comprobación Inmediata</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cuestionarios y ejercicios interactivos con retroalimentación explicativa al instante.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase font-mono">Privacidad Absoluta</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tu progreso reside en tu navegador (localStorage), sin telemetría ni rastreadores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PANEL EN VIVO DEL ESTUDIANTE ── */}
      <DashboardEstudiante />

      {/* ── SECCIÓN DESTACADA: CONSTRUCTOR DE RUTAS DE APRENDIZAJE ── */}
      <section className="bg-slate-900/80 border border-amber-500/30 rounded-3xl p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              <Compass className="w-4 h-4" />
              <span>Función Exclusiva Vanguard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Constructor de Rutas de Aprendizaje a Medida
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              ¿Quieres aprender sobre estrechos geopolíticos, semiconductores y cambio climático en un único plan articulado? Nuestro motor organiza dinámicamente un itinerario secuencial con lecciones, simulaciones numéricas en Vanguard Labs y evaluaciones automáticas.
            </p>
          </div>

          <Link
            href="/academia/rutas"
            className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-amber-950/40 inline-flex items-center gap-2 shrink-0"
          >
            <span>Diseñar mi Ruta Ahora</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── LAS 10 DISCIPLINAS OBLIGATORIAS ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              10 Disciplinas Fundamentales
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Cursos completos diseñados para brindar entendimiento integral de los sistemas del mundo.
            </p>
          </div>

          <Link
            href="/academia/cursos"
            className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Ver catálogo completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATEGORIAS_ACADEMIA.map((cat) => {
            const cursoDeLaCat = CURSOS_ACADEMIA.find((c) => c.categoria === cat.id);
            return (
              <Link
                key={cat.id}
                href={cursoDeLaCat ? `/academia/cursos/${cursoDeLaCat.slug}` : `/academia/cursos`}
                className="bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                    Área Académica
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {cat.nombre}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {cat.descripcion}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400/90 font-mono">
                  <span>Abrir curso</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── HERRAMIENTAS INTERACTIVAS Y PRÁCTICA ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Tarjetas de Estudio 3D</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Flashcards interactivas con giro 3D tridimensional, modo examen rápido y repaso espaciado para memorización técnica.
          </p>
          <Link
            href="/academia/tarjetas"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold hover:underline"
          >
            <span>Estudiar Flashcards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Banco de Ejercicios</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Problemas cuantitativos y escenarios aplicados estilo Brilliant con pistas escalonadas y enlaces a simuladores numéricos.
          </p>
          <Link
            href="/academia/ejercicios"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold hover:underline"
          >
            <span>Resolver Retos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Certificados Verificables</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Acreditaciones de finalización interna con código de hash criptográfico único, horas lectivas y competencias Bloom demostradas.
          </p>
          <Link
            href="/academia/certificados"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold hover:underline"
          >
            <span>Ver Reconocimientos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
