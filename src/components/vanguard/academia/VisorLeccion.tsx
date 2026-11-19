"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Award,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Check,
  X,
  RotateCcw,
  Clock,
  Compass,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import type { Curso, Capitulo, Leccion } from "@/lib/academia/tipos";
import {
  obtenerEstadoEstudiante,
  marcarLeccionCompletada,
  guardarResultadoCuestionario,
} from "@/lib/academia/progreso";

interface PropsVisorLeccion {
  curso: Curso;
  capitulo: Capitulo;
  leccion: Leccion;
}

export function VisorLeccion({ curso, capitulo, leccion }: PropsVisorLeccion) {
  const [leccionCompletada, setLeccionCompletada] = useState(false);
  const [respuestasCuestionario, setRespuestasCuestionario] = useState<Record<string, string>>({});
  const [quizEnviado, setQuizEnviado] = useState(false);
  const [pistasReveladas, setPistasReveladas] = useState<Record<string, number>>({});
  const [respuestaPractica, setRespuestaPractica] = useState<Record<string, string>>({});
  const [practicaValidada, setPracticaValidada] = useState<Record<string, boolean>>({});

  const preguntasQuiz = leccion.cuestionarioEvaluacion || [];
  const ejercicios = leccion.ejerciciosPractica || leccion.ejerciciosPracticos || [];
  const secciones = leccion.contenidoSecciones || [];
  const puntosClave = leccion.puntosClave || leccion.conceptosClave || [];

  // Cargar estado inicial del estudiante
  useEffect(() => {
    const estado = obtenerEstadoEstudiante();
    const clave = `${curso.slug}:${leccion.id}`;
    if (estado.leccionesCompletadas[clave]) {
      setLeccionCompletada(true);
    }
  }, [curso.slug, leccion.id]);

  // Encontrar lección previa y siguiente
  const todasLasLecciones = curso.capitulos.flatMap((c) =>
    c.lecciones.map((l) => ({ cap: c, lec: l }))
  );
  const indiceActual = todasLasLecciones.findIndex((item) => item.lec.id === leccion.id);
  const leccionPrevia = indiceActual > 0 ? todasLasLecciones[indiceActual - 1] : null;
  const leccionSiguiente =
    indiceActual < todasLasLecciones.length - 1
      ? todasLasLecciones[indiceActual + 1]
      : null;

  const handleCompletarLeccion = () => {
    marcarLeccionCompletada(curso.slug, leccion.id, leccion.duracionEstimadaMinutos);
    setLeccionCompletada(true);
  };

  const handleSeleccionarRespuestaQuiz = (preguntaId: string, opcionId: string) => {
    if (quizEnviado) return;
    setRespuestasCuestionario({
      ...respuestasCuestionario,
      [preguntaId]: opcionId,
    });
  };

  const handleEvaluarQuiz = () => {
    if (preguntasQuiz.length === 0) return;
    setQuizEnviado(true);

    let correctas = 0;
    preguntasQuiz.forEach((p) => {
      const correcta = p.opciones.find((o) => o.esCorrecta);
      if (correcta && respuestasCuestionario[p.id] === correcta.id) {
        correctas++;
      }
    });

    guardarResultadoCuestionario(
      curso.slug,
      leccion.id,
      correctas,
      preguntasQuiz.length
    );

    if (correctas / preguntasQuiz.length >= 0.7) {
      setLeccionCompletada(true);
    }
  };

  const handleReiniciarQuiz = () => {
    setRespuestasCuestionario({});
    setQuizEnviado(false);
  };

  const revelarPista = (ejercicioId: string) => {
    const actual = pistasReveladas[ejercicioId] || 0;
    setPistasReveladas({
      ...pistasReveladas,
      [ejercicioId]: actual + 1,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ── BARRA LATERAL: TEMARIO DEL CURSO ── */}
      <aside className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sticky top-6 max-h-[85vh] overflow-y-auto">
        <div className="mb-4 pb-4 border-b border-slate-800">
          <Link
            href={`/academia/cursos/${curso.slug}`}
            className="text-xs text-amber-400 font-mono hover:underline flex items-center gap-1 mb-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Volver al índice del curso</span>
          </Link>
          <h3 className="text-base font-bold text-white line-clamp-2">{curso.titulo}</h3>
          <p className="text-xs text-slate-400 mt-1">{curso.subtitulo}</p>
        </div>

        <div className="space-y-4">
          {curso.capitulos.map((cap, capIdx) => (
            <div key={cap.id} className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase text-slate-400 px-2 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center">
                  {capIdx + 1}
                </span>
                <span>{cap.titulo}</span>
              </div>

              <div className="space-y-1 pl-2">
                {cap.lecciones.map((lec) => {
                  const esActual = lec.id === leccion.id;
                  const clave = `${curso.slug}:${lec.id}`;
                  const estado = obtenerEstadoEstudiante();
                  const estaCompletada = Boolean(estado.leccionesCompletadas[clave]);

                  return (
                    <Link
                      key={lec.id}
                      href={`/academia/cursos/${curso.slug}/${cap.id}/${lec.id}`}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                        esActual
                          ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
                          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {estaCompletada ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              esActual ? "bg-amber-400 ring-4 ring-amber-400/20" : "bg-slate-700"
                            }`}
                          />
                        )}
                        <span className="truncate">{lec.titulo}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {lec.duracionEstimadaMinutos}m
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── CUERPO PRINCIPAL DE LA LECCIÓN ── */}
      <main className="lg:col-span-8 space-y-8">
        {/* ENCABEZADO */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-full">
              {curso.categoria.toUpperCase()} · CAPÍTULO: {capitulo.titulo}
            </span>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {leccion.duracionEstimadaMinutos} minutos
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Lección {leccion.numero}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {leccion.titulo}
          </h1>

          {/* Resumen Ejecutivo */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-sm text-slate-300 leading-relaxed">
            <strong className="text-amber-300 block text-xs font-mono uppercase mb-1">
              Resumen Ejecutivo de la Lección
            </strong>
            {leccion.resumenEjecutivo}
          </div>
        </div>

        {/* CONTENIDO ESTRUCTURADO DE LA LECCIÓN */}
        <article className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 text-slate-200 leading-relaxed">
          {secciones.length > 0 ? (
            secciones.map((sec, sIdx) => (
              <section key={sIdx} className="space-y-4">
                <h2 className="text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
                  {sec.subtitulo}
                </h2>

                <div className="space-y-3">
                  {sec.parrafos.map((p, pIdx) => (
                    <p key={pIdx} className="text-sm sm:text-base leading-relaxed text-slate-300">
                      {p}
                    </p>
                  ))}
                </div>

                {sec.notaAlerta && (
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-mono uppercase text-amber-400 block mb-0.5">
                        Alerta Crítica:
                      </strong>
                      <span>{sec.notaAlerta}</span>
                    </div>
                  </div>
                )}

                {sec.ejemploConcreto && (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-amber-300 block font-mono text-[10px] uppercase mb-1">
                      Estudio de Caso Concreto:
                    </strong>
                    <span>{sec.ejemploConcreto}</span>
                  </div>
                )}
              </section>
            ))
          ) : (
            <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-slate-300">
              {leccion.contenidoMarkdown}
            </div>
          )}

          {/* Puntos / Conceptos Clave */}
          {puntosClave.length > 0 && (
            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Conceptos Clave del Módulo</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {puntosClave.map((punto, i) => (
                  <li
                    key={i}
                    className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{punto}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        {/* ── EJERCICIOS PRÁCTICOS INTERACTIVOS ESTILO BRILLIANT ── */}
        {ejercicios.length > 0 && (
          <section className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider block">
                  Desafío Numérico Interactivo · Estilo Brilliant
                </span>
                <h3 className="text-lg font-bold text-white">Resolución de Problemas Activa</h3>
              </div>
            </div>

            {ejercicios.map((ej) => {
              const pistasUsadas = pistasReveladas[ej.id] || 0;
              const estaValidado = practicaValidada[ej.id];
              const pasos = ej.pasosGuiados || [];

              return (
                <div
                  key={ej.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-5"
                >
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                      {ej.titulo}
                    </span>
                    <p className="text-sm text-slate-200">
                      {ej.retoPrincipal || ej.enunciado}
                    </p>
                    {(ej.escenarioContexto || ej.contextoEscenario) && (
                      <p className="text-xs text-slate-400 italic bg-slate-900 p-3 rounded-xl border border-slate-800">
                        Escenario: {ej.escenarioContexto || ej.contextoEscenario}
                      </p>
                    )}
                  </div>

                  {/* Pasos guiados interactivos */}
                  {pasos.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {pasos.map((paso) => (
                        <div
                          key={paso.numero}
                          className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-amber-400 font-bold">
                              Paso {paso.numero}: {paso.instruccion}
                            </span>
                            <span className="text-slate-400">{paso.datoOVariable}</span>
                          </div>

                          <div className="text-xs text-slate-200 font-medium">
                            {paso.preguntaComprobacion}
                          </div>

                          {estaValidado && (
                            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-200 flex items-start gap-2">
                              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <div>
                                <strong>Respuesta: {paso.respuestaEsperada}</strong>
                                <p className="text-[11px] text-emerald-300/80 mt-0.5">
                                  {paso.explicacionPaso}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Opciones interactivas si las tiene */}
                  {ej.opcionesInteractivas && (
                    <div className="space-y-2">
                      {ej.opcionesInteractivas.map((opc) => {
                        const seleccionada = respuestaPractica[ej.id] === opc.id;
                        let estilo =
                          "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700";
                        if (estaValidado) {
                          if (opc.esCorrecta) {
                            estilo =
                              "bg-emerald-950/50 border-emerald-500 text-emerald-200 font-bold";
                          } else if (seleccionada) {
                            estilo = "bg-rose-950/50 border-rose-500 text-rose-300";
                          }
                        } else if (seleccionada) {
                          estilo = "bg-amber-500/20 border-amber-500 text-amber-200";
                        }

                        return (
                          <button
                            key={opc.id}
                            type="button"
                            onClick={() => {
                              if (!estaValidado) {
                                setRespuestaPractica({
                                  ...respuestaPractica,
                                  [ej.id]: opc.id,
                                });
                              }
                            }}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${estilo}`}
                          >
                            <span>{opc.texto}</span>
                            {estaValidado && opc.esCorrecta && (
                              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Pistas escalonadas */}
                  {ej.pistasSecuenciales && ej.pistasSecuenciales.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => revelarPista(ej.id)}
                          disabled={pistasUsadas >= ej.pistasSecuenciales.length}
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300 disabled:opacity-40"
                        >
                          <Lightbulb className="w-4 h-4" />
                          <span>
                            {pistasUsadas === 0
                              ? "Mostrar Pista Guiada"
                              : pistasUsadas < ej.pistasSecuenciales.length
                              ? `Mostrar Siguiente Pista (${pistasUsadas}/${ej.pistasSecuenciales.length})`
                              : "Todas las pistas reveladas"}
                          </span>
                        </button>
                      </div>

                      {pistasUsadas > 0 && (
                        <div className="space-y-2">
                          {ej.pistasSecuenciales.slice(0, pistasUsadas).map((pista, pIdx) => (
                            <div
                              key={pIdx}
                              className="text-xs bg-amber-950/30 border border-amber-900/50 text-amber-200 p-3 rounded-xl flex items-start gap-2"
                            >
                              <span className="font-mono font-bold text-[10px] text-amber-400 shrink-0">
                                Pista {pIdx + 1}:
                              </span>
                              <span>{pista}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botón de Comprobación */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setPracticaValidada({
                          ...practicaValidada,
                          [ej.id]: true,
                        })
                      }
                      disabled={estaValidado}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-40"
                    >
                      {estaValidado ? "Solución Desplegada" : "Comprobar y Revelar Solución"}
                    </button>

                    {estaValidado && (
                      <button
                        type="button"
                        onClick={() => {
                          setPracticaValidada({ ...practicaValidada, [ej.id]: false });
                          setRespuestaPractica({ ...respuestaPractica, [ej.id]: "" });
                        }}
                        className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Ocultar Solución</span>
                      </button>
                    )}
                  </div>

                  {/* Explicación pedagógica tras validar */}
                  {estaValidado && (ej.explicacionPedagogica || ej.solucionExplicada) && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 leading-relaxed">
                      <strong className="text-amber-300 block font-mono uppercase mb-1">
                        Criterio de Éxito y Razón Pedagógica:
                      </strong>
                      <p>{ej.criterioExito}</p>
                      <p className="mt-1 text-slate-300">
                        {ej.explicacionPedagogica || ej.solucionExplicada}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* ── CUESTIONARIO DE EVALUACIÓN FORMATIVA (CHECKPOINT) ── */}
        {preguntasQuiz.length > 0 && (
          <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider block">
                  Checkpoint Formativo
                </span>
                <h3 className="text-xl font-bold text-white">Evaluación de Fin de Módulo</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {preguntasQuiz.length} preguntas · Requiere ≥70%
              </span>
            </div>

            <div className="space-y-6">
              {preguntasQuiz.map((pregunta, idx) => {
                const seleccionada = respuestasCuestionario[pregunta.id];
                const opcionCorrecta = pregunta.opciones.find((o) => o.esCorrecta);
                const opcionElegida = pregunta.opciones.find((o) => o.id === seleccionada);
                const esAcierto = seleccionada === opcionCorrecta?.id;

                return (
                  <div
                    key={pregunta.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        {pregunta.contextoPrevio && (
                          <div className="text-xs text-slate-400 italic">
                            {pregunta.contextoPrevio}
                          </div>
                        )}
                        <h4 className="text-sm font-semibold text-white">{pregunta.enunciado}</h4>
                      </div>
                    </div>

                    <div className="space-y-2 pl-9">
                      {pregunta.opciones.map((opc) => {
                        const estaMarcada = seleccionada === opc.id;
                        let estiloOpcion =
                          "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700";

                        if (quizEnviado) {
                          if (opc.esCorrecta) {
                            estiloOpcion =
                              "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold";
                          } else if (estaMarcada) {
                            estiloOpcion = "bg-rose-950/60 border-rose-500 text-rose-300";
                          }
                        } else if (estaMarcada) {
                          estiloOpcion = "bg-amber-500/20 border-amber-500 text-amber-200 font-bold";
                        }

                        return (
                          <button
                            key={opc.id}
                            type="button"
                            disabled={quizEnviado}
                            onClick={() => handleSeleccionarRespuestaQuiz(pregunta.id, opc.id)}
                            className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${estiloOpcion}`}
                          >
                            <span>{opc.texto}</span>
                            {quizEnviado && opc.esCorrecta && (
                              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explicación de retroalimentación inmediata */}
                    {quizEnviado && (
                      <div
                        className={`p-4 rounded-xl text-xs leading-relaxed ml-9 ${
                          esAcierto
                            ? "bg-emerald-950/30 border border-emerald-800 text-emerald-200"
                            : "bg-rose-950/30 border border-rose-800 text-rose-200"
                        }`}
                      >
                        <strong className="block font-mono uppercase mb-1">
                          {esAcierto ? "✓ ¡Respuesta Correcta!" : "✗ Retroalimentación Explicativa:"}
                        </strong>
                        <p>{opcionElegida?.explicacion || pregunta.explicacionDetallada}</p>
                        {pregunta.fuenteReferencia && (
                          <span className="text-[10px] text-slate-400 font-mono block mt-1">
                            Fuente: {pregunta.fuenteReferencia}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Acciones del Cuestionario */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400">
                {quizEnviado ? (
                  <span>
                    Resultado guardado en tu navegador local (privacidad absoluta sin rastreadores).
                  </span>
                ) : (
                  <span>Responde a las preguntas y pulsa verificar para evaluar tu comprensión.</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {quizEnviado ? (
                  <button
                    type="button"
                    onClick={handleReiniciarQuiz}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reintentar Evaluación</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleEvaluarQuiz}
                    disabled={
                      Object.keys(respuestasCuestionario).length < preguntasQuiz.length
                    }
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-lg disabled:opacity-40"
                  >
                    Verificar Respuestas
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── PRÁCTICA RELACIONADA EN VANGUARD LABS ── */}
        {curso.nexosVanguardRelacionados && curso.nexosVanguardRelacionados.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">
                Conexión Práctica en Vanguard Labs
              </span>
              <h4 className="text-base font-bold text-white">
                {curso.nexosVanguardRelacionados[0].nombre}
              </h4>
              <p className="text-xs text-slate-400">
                {curso.nexosVanguardRelacionados[0].motivoPedagogico}
              </p>
            </div>

            <Link
              href={curso.nexosVanguardRelacionados[0].ruta}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-all shrink-0"
            >
              <span>Abrir Simulador</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── NAVEGACIÓN Y COMPLETITUD DE LECCIÓN ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
          {leccionPrevia ? (
            <Link
              href={`/academia/cursos/${curso.slug}/${leccionPrevia.cap.id}/${leccionPrevia.lec.id}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior: {leccionPrevia.lec.titulo}</span>
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCompletarLeccion}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                leccionCompletada
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{leccionCompletada ? "Lección Completada ✓" : "Marcar como Completada"}</span>
            </button>

            {leccionSiguiente && (
              <Link
                href={`/academia/cursos/${curso.slug}/${leccionSiguiente.cap.id}/${leccionSiguiente.lec.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                <span>Siguiente Lección</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
