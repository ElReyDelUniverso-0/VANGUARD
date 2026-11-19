"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  FlaskConical,
  Target,
  Plus,
  Trash2,
  Share2,
} from "lucide-react";
import {
  construirRutaPersonalizada,
  obtenerEstadoEstudiante,
} from "@/lib/academia/progreso";
import { RUTAS_PREDEFINIDAS } from "@/lib/academia/datos-rutas-glosario";
import { CATEGORIAS_ACADEMIA } from "@/lib/academia/datos-cursos";
import type { RutaAprendizaje, PasoRutaAprendizaje } from "@/lib/academia/tipos";

export function ConstructorRutas() {
  const [objetivo, setObjetivo] = useState("");
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>(["geografia"]);
  const [nivel, setNivel] = useState<"introductorio" | "intermedio" | "avanzado">("intermedio");
  const [horasSemanales, setHorasSemanales] = useState<number>(4);

  const [rutaGenerada, setRutaGenerada] = useState<RutaAprendizaje | null>(null);
  const [rutasGuardadas, setRutasGuardadas] = useState<RutaAprendizaje[]>([]);

  useEffect(() => {
    const estado = obtenerEstadoEstudiante();
    setRutasGuardadas(estado.rutasPersonalizadas || []);
  }, []);

  const alternarCategoria = (catId: string) => {
    if (categoriasSeleccionadas.includes(catId)) {
      if (categoriasSeleccionadas.length > 1) {
        setCategoriasSeleccionadas(categoriasSeleccionadas.filter((c) => c !== catId));
      }
    } else {
      setCategoriasSeleccionadas([...categoriasSeleccionadas, catId]);
    }
  };

  const handleGenerarRuta = (e: React.FormEvent) => {
    e.preventDefault();
    const titulo = objetivo ? `Ruta: ${objetivo}` : "Ruta Personalizada Vanguard";
    const nueva = construirRutaPersonalizada(
      titulo,
      objetivo || "Plan articulado de estudio interdisciplinar.",
      categoriasSeleccionadas,
      nivel,
      horasSemanales
    );
    setRutaGenerada(nueva);
    setRutasGuardadas([nueva, ...rutasGuardadas.filter((r) => r.id !== nueva.id)]);
  };

  const sugerenciasRapidas = [
    {
      titulo: "Geografía y Geopolítica de Estrechos",
      cats: ["geografia", "relaciones_internacionales"],
      meta: "Aprender los 7 cuellos de botella marítimos y las disputas de soberanía",
    },
    {
      titulo: "Crisis Climática y Modelado Matemático",
      cats: ["medioambiente", "ciencias_naturales", "matematicas"],
      meta: "Comprender la física del calentamiento global y simular cuencas hídricas",
    },
    {
      titulo: "Guerra del Silicio y Macroeconomía",
      cats: ["tecnologia", "economia"],
      meta: "Dominar la litografía EUV, transistores nanosheet y la deuda soberana",
    },
    {
      titulo: "Diplomacia, Tratados y Lenguaje",
      cats: ["idiomas", "historia", "cultura"],
      meta: "Analizar la semántica de tratados de paz y la mediación multilingüe",
    },
  ];

  return (
    <div className="space-y-12">
      {/* ── CONSTRUCTOR INTERACTIVO ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            Función Diferenciadora · Vanguard Academy
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          Constructor de Rutas de Aprendizaje Personalizadas
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed mb-6">
          Indica qué deseas aprender. El motor articulará dinámicamente un plan secuencial con lecciones teóricas, mapas interactivos, ejercicios prácticos de simulación en Vanguard Labs y evaluaciones de fin de módulo.
        </p>

        {/* Sugerencias de un clic */}
        <div className="mb-6">
          <span className="text-xs font-mono text-slate-400 block mb-2">
            Inspiración rápida (haz clic para autocompletar):
          </span>
          <div className="flex flex-wrap gap-2">
            {sugerenciasRapidas.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setObjetivo(sug.meta);
                  setCategoriasSeleccionadas(sug.cats);
                }}
                className="text-xs bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 px-3 py-1.5 rounded-xl transition-all font-medium"
              >
                {sug.titulo}
              </button>
            ))}
          </div>
        </div>

        {/* Formulario del Constructor */}
        <form onSubmit={handleGenerarRuta} className="space-y-6">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
              1. Tu Objetivo de Aprendizaje
            </label>
            <input
              type="text"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Ej: Quiero aprender geografía mundial, estrechos estratégicos y diplomacia..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
              2. Áreas de Conocimiento a Articular (Elige una o varias)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CATEGORIAS_ACADEMIA.map((cat) => {
                const seleccionada = categoriasSeleccionadas.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => alternarCategoria(cat.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      seleccionada
                        ? "bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-md shadow-amber-950/40"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{cat.nombre}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                3. Nivel de Complejidad Inicial
              </label>
              <select
                value={nivel}
                onChange={(e) => setNivel(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="introductorio">Introductorio (Fundamentos y conceptos)</option>
                <option value="intermedio">Intermedio (Análisis y estudios de caso)</option>
                <option value="avanzado">Avanzado (Modelización matemática y formalismos)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                4. Disponibilidad Semanal: {horasSemanales} horas
              </label>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={horasSemanales}
                onChange={(e) => setHorasSemanales(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>1 h/sem (Ritmo suave)</span>
                <span>4 h/sem (Recomendado)</span>
                <span>12 h/sem (Intensivo)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl transition-all shadow-xl shadow-amber-950/50 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Construir Mi Ruta Personalizada</span>
          </button>
        </form>

        {/* ── VISUALIZADOR DE LA RUTA GENERADA ── */}
        {rutaGenerada && (
          <div className="mt-8 pt-8 border-t border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-950/30 border border-amber-500/40 p-4 rounded-2xl">
              <div>
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">
                  Ruta Creada Exitosamente
                </span>
                <h3 className="text-lg font-bold text-white">{rutaGenerada.titulo}</h3>
                <p className="text-xs text-slate-300">{rutaGenerada.descripcion}</p>
              </div>

              <div className="text-xs font-mono text-right text-slate-400 shrink-0">
                <div>Duración Estimada: <strong className="text-amber-400">{rutaGenerada.duracionSemanasEstimadas} semanas</strong></div>
                <div>Carga total: <strong className="text-white">{rutaGenerada.horasTotalesEstimadas} horas</strong></div>
              </div>
            </div>

            {/* Secuencia de Pasos */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Itinerario Secuencial de Aprendizaje:
              </span>

              {rutaGenerada.hitosSecuenciales.map((hito) => (
                <div
                  key={hito.paso}
                  className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {hito.paso}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {hito.tipo.replace("_", " ")}
                        </span>
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{hito.tiempoEstimadoMinutos} min</span>
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{hito.titulo}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{hito.descripcion}</p>
                    </div>
                  </div>

                  <Link
                    href={hito.rutaEnlace}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-all shrink-0"
                  >
                    <span>Comenzar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── RUTAS PREDEFINIDAS DEL CATÁLOGO ── */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Rutas Temáticas Predefinidas
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Itinerarios curriculares completos diseñados por la cátedra de Vanguard Academy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RUTAS_PREDEFINIDAS.map((ruta) => (
            <div
              key={ruta.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-amber-950/20 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {ruta.categoria}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {ruta.duracionSemanasEstimadas} semanas · {ruta.horasTotalesEstimadas} h
                  </span>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {ruta.titulo}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {ruta.descripcion}
                </p>

                <div className="text-xs text-slate-400 font-mono space-y-1 pt-2 border-t border-slate-800">
                  <div>Hitos: <strong>{ruta.hitosSecuenciales.length} etapas guiadas</strong></div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Para: {ruta.publicoObjetivo}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-amber-400 font-mono">
                  Certificable internamente
                </span>
                <button
                  type="button"
                  onClick={() => setRutaGenerada(ruta)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <span>Cargar Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
