"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Target,
  Lightbulb,
  Check,
  RotateCcw,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { BANCO_EJERCICIOS } from "@/lib/academia/datos-rutas-glosario";
import { CATEGORIAS_ACADEMIA } from "@/lib/academia/datos-cursos";
import type { EjercicioPractica } from "@/lib/academia/tipos";

export function BancoEjercicios() {
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [dificultadFiltro, setDificultadFiltro] = useState<string>("todas");
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [validados, setValidados] = useState<Record<string, boolean>>({});
  const [pistasReveladas, setPistasReveladas] = useState<Record<string, number>>({});

  const ejerciciosFiltrados = BANCO_EJERCICIOS.filter((ej) => {
    const cat = ej.categoria || "geografia";
    const dif = ej.dificultad || "intermedio";
    if (categoriaFiltro !== "todas" && cat !== categoriaFiltro) return false;
    if (dificultadFiltro !== "todas" && dif !== dificultadFiltro) return false;
    return true;
  });

  const revelarPista = (id: string) => {
    setPistasReveladas((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const comprobarEjercicio = (id: string) => {
    setValidados((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const reiniciarEjercicio = (id: string) => {
    setValidados((prev) => ({ ...prev, [id]: false }));
    setRespuestas((prev) => ({ ...prev, [id]: "" }));
    setPistasReveladas((prev) => ({ ...prev, [id]: 0 }));
  };

  return (
    <div className="space-y-8">
      {/* ── ENCABEZADO Y FILTROS ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
              Entrenamiento Activo · Estilo Brilliant
            </span>
          </div>
          {/* v421.1 — era <h2>: la página entera no tenía ni un <h1> (medido en
              vivo el 2026-11-19). Este es el título real de /academia/ejercicios
              y su único consumidor, así que sube a <h1> sin duplicar nada. */}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Banco de Ejercicios y Retos Prácticos
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Problemas cuantitativos, dilemas estratégicos y escenarios reales con pistas pedagógicas escalonadas y enlaces directos a simuladores interactivos de Vanguard.
          </p>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t border-slate-800">
          {/* Categorías */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setCategoriaFiltro("todas")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                categoriaFiltro === "todas"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Todas ({BANCO_EJERCICIOS.length})
            </button>
            {CATEGORIAS_ACADEMIA.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaFiltro(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                  categoriaFiltro === cat.id
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          {/* Dificultad */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-slate-400">Dificultad:</span>
            <select
              value={dificultadFiltro}
              onChange={(e) => setDificultadFiltro(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="todas">Todas</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── LISTA DE EJERCICIOS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ejerciciosFiltrados.map((ej) => {
          const cat = ej.categoria || "geografia";
          const dif = ej.dificultad || "intermedio";
          const enunciado = ej.enunciado || ej.retoPrincipal || "";
          const contexto = ej.contextoEscenario || ej.escenarioContexto || "";
          const solucion = ej.solucionExplicada || ej.explicacionPedagogica || ej.criterioExito || "";
          const enlaceLab = ej.enlaceVanguardLab || ej.nexoLabRuta;
          const respuesta = respuestas[ej.id];
          const validado = validados[ej.id];
          const pistas = pistasReveladas[ej.id] || 0;
          const pistasLista = ej.pistasSecuenciales || (ej.pasosGuiados ? ej.pasosGuiados.map((p) => p.instruccion) : []);

          return (
            <div
              key={ej.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Cabecera del reto */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-bold border border-slate-700">
                    {cat}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                      dif === "avanzado"
                        ? "bg-rose-950 text-rose-300 border border-rose-800"
                        : dif === "intermedio"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    }`}
                  >
                    {dif}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{ej.titulo}</h3>

                {contexto && (
                  <div className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800 italic">
                    {contexto}
                  </div>
                )}

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {enunciado}
                </p>

                {/* Pasos guiados si existen */}
                {ej.pasosGuiados && (
                  <div className="space-y-2 pt-2">
                    {ej.pasosGuiados.map((paso) => (
                      <div key={paso.numero} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                        <div className="font-bold text-amber-300">Paso {paso.numero}: {paso.instruccion}</div>
                        <div className="font-mono text-slate-400 text-[11px]">Dato: {paso.datoOVariable}</div>
                        {validado && (
                          <div className="text-emerald-300 pt-1 text-[11px]">
                            ✓ {paso.respuestaEsperada} — {paso.explicacionPaso}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Opciones interactivas si existen */}
                {ej.opcionesInteractivas && (
                  <div className="space-y-2 pt-2">
                    {ej.opcionesInteractivas.map((opc) => {
                      const seleccionada = respuesta === opc.id;
                      let estilo =
                        "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700";

                      if (validado) {
                        if (opc.esCorrecta) {
                          estilo = "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold";
                        } else if (seleccionada) {
                          estilo = "bg-rose-950/60 border-rose-500 text-rose-300";
                        }
                      } else if (seleccionada) {
                        estilo = "bg-amber-500/20 border-amber-500 text-amber-200";
                      }

                      return (
                        <button
                          key={opc.id}
                          type="button"
                          disabled={validado}
                          onClick={() => setRespuestas((prev) => ({ ...prev, [ej.id]: opc.id }))}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${estilo}`}
                        >
                          <span>{opc.texto}</span>
                          {validado && opc.esCorrecta && (
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Pistas guiadas */}
                {pistasLista.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => revelarPista(ej.id)}
                      disabled={pistas >= pistasLista.length}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300 disabled:opacity-40"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>
                        {pistas === 0
                          ? "Mostrar Pista Guiada"
                          : pistas < pistasLista.length
                          ? `Mostrar Siguiente Pista (${pistas}/${pistasLista.length})`
                          : "Pistas Completas"}
                      </span>
                    </button>

                    {pistas > 0 && (
                      <div className="space-y-2">
                        {pistasLista.slice(0, pistas).map((p, pIdx) => (
                          <div
                            key={pIdx}
                            className="text-xs bg-amber-950/30 border border-amber-900/50 text-amber-200 p-2.5 rounded-xl"
                          >
                            <span className="font-mono font-bold text-[10px] text-amber-400 block mb-0.5">
                              Pista {pIdx + 1}:
                            </span>
                            {p}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Explicación de la solución tras comprobación */}
                {validado && solucion && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 leading-relaxed">
                    <strong className="text-amber-400 block font-mono text-[11px] uppercase mb-1">
                      Solución y Razonamiento:
                    </strong>
                    {solucion}
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!validado ? (
                    <button
                      type="button"
                      onClick={() => comprobarEjercicio(ej.id)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all"
                    >
                      Comprobar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => reiniciarEjercicio(ej.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reintentar</span>
                    </button>
                  )}
                </div>

                {enlaceLab && (
                  <Link
                    href={enlaceLab}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-mono"
                  >
                    <span>{ej.nexoLabNombre || "Simular en Lab"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
