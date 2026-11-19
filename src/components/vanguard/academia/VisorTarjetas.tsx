"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  RotateCw,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Lightbulb,
  Sparkles,
  BookOpen,
  Check,
  X,
} from "lucide-react";
import { BARAJAS_TARJETAS } from "@/lib/academia/datos-rutas-glosario";
import type { BarajaTarjetas, TarjetaEstudio } from "@/lib/academia/tipos";
import {
  obtenerEstadoEstudiante,
  actualizarEstadoTarjeta,
  alternarTarjetaDestacada,
} from "@/lib/academia/progreso";

type ModoEstudio = "tarjetas" | "aprender" | "test";

export function VisorTarjetas() {
  const [barajaSeleccionada, setBarajaSeleccionada] = useState<BarajaTarjetas>(BARAJAS_TARJETAS[0]);
  const [tarjetas, setTarjetas] = useState<TarjetaEstudio[]>(BARAJAS_TARJETAS[0].tarjetas);
  const [indiceActual, setIndiceActual] = useState(0);
  const [estaVolteada, setEstaVolteada] = useState(false);
  const [mostrarPista, setMostrarPista] = useState(false);
  const [modo, setModo] = useState<ModoEstudio>("tarjetas");
  const [soloDestacadas, setSoloDestacadas] = useState(false);

  // Estados locales del estudiante
  const [estadosLocales, setEstadosLocales] = useState<Record<string, string>>({});
  const [destacadasLocales, setDestacadasLocales] = useState<string[]>([]);

  // Para el modo Test
  const [preguntaTestIndice, setPreguntaTestIndice] = useState(0);
  const [respuestaTestSeleccionada, setRespuestaTestSeleccionada] = useState<string | null>(null);
  const [testFinalizado, setTestFinalizado] = useState(false);
  const [aciertosTest, setAciertosTest] = useState(0);

  useEffect(() => {
    const est = obtenerEstadoEstudiante();
    setEstadosLocales(est.tarjetasEstado || {});
    setDestacadasLocales(est.tarjetasDestacadas || []);
  }, []);

  const cambiarBaraja = (b: BarajaTarjetas) => {
    setBarajaSeleccionada(b);
    setTarjetas(b.tarjetas);
    setIndiceActual(0);
    setEstaVolteada(false);
    setMostrarPista(false);
    setPreguntaTestIndice(0);
    setTestFinalizado(false);
    setAciertosTest(0);
  };

  const tarjetasFiltradas = soloDestacadas
    ? tarjetas.filter((t) => destacadasLocales.includes(t.id))
    : tarjetas;

  const tarjetaActual = tarjetasFiltradas[indiceActual] || tarjetasFiltradas[0];

  const handleSiguiente = () => {
    if (indiceActual < tarjetasFiltradas.length - 1) {
      setIndiceActual(indiceActual + 1);
      setEstaVolteada(false);
      setMostrarPista(false);
    }
  };

  const handleAnterior = () => {
    if (indiceActual > 0) {
      setIndiceActual(indiceActual - 1);
      setEstaVolteada(false);
      setMostrarPista(false);
    }
  };

  const handleBarajar = () => {
    const copia = [...tarjetasFiltradas].sort(() => Math.random() - 0.5);
    setTarjetas(copia);
    setIndiceActual(0);
    setEstaVolteada(false);
  };

  const handleMarcarEstado = (estado: "por_aprender" | "repasando" | "dominada") => {
    if (!tarjetaActual) return;
    actualizarEstadoTarjeta(tarjetaActual.id, estado);
    setEstadosLocales({
      ...estadosLocales,
      [tarjetaActual.id]: estado,
    });
    handleSiguiente();
  };

  const handleAlternarEstrella = () => {
    if (!tarjetaActual) return;
    alternarTarjetaDestacada(tarjetaActual.id);
    const yaEsta = destacadasLocales.includes(tarjetaActual.id);
    const nuevaLista = yaEsta
      ? destacadasLocales.filter((id) => id !== tarjetaActual.id)
      : [...destacadasLocales, tarjetaActual.id];
    setDestacadasLocales(nuevaLista);
  };

  // Teclado para navegar con flechas y espacio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modo !== "tarjetas") return;
      if (e.code === "Space") {
        e.preventDefault();
        setEstaVolteada((v) => !v);
      } else if (e.code === "ArrowRight") {
        handleSiguiente();
      } else if (e.code === "ArrowLeft") {
        handleAnterior();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [indiceActual, tarjetasFiltradas.length, modo]);

  // Generador de opciones para el modo Test
  const tarjetaTestActual = tarjetas[preguntaTestIndice];
  const respuestaCorrectaActual = tarjetaTestActual
    ? tarjetaTestActual.reversoRespuesta || tarjetaTestActual.reverso
    : "";

  const opcionesTest = React.useMemo(() => {
    if (!tarjetaTestActual) return [];
    const incorrectas = tarjetas
      .filter((t) => t.id !== tarjetaTestActual.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((t) => t.reversoRespuesta || t.reverso);
    return [...incorrectas, respuestaCorrectaActual].sort(() => Math.random() - 0.5);
  }, [preguntaTestIndice, tarjetaTestActual, tarjetas, respuestaCorrectaActual]);

  const responderTest = (opc: string) => {
    if (respuestaTestSeleccionada !== null) return;
    setRespuestaTestSeleccionada(opc);
    const esCorrecta = opc === respuestaCorrectaActual;
    if (esCorrecta) {
      setAciertosTest((prev) => prev + 1);
    }
  };

  const siguientePreguntaTest = () => {
    if (preguntaTestIndice < tarjetas.length - 1) {
      setPreguntaTestIndice((prev) => prev + 1);
      setRespuestaTestSeleccionada(null);
    } else {
      setTestFinalizado(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── SELECTOR DE BARAJA Y MODOS ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
                Módulo Estilo Quizlet
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {tarjetas.length} tarjetas activas
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Tarjetas de Estudio Interactivas (Flashcards)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Memorización activa y repaso espaciado con animación 3D de giro, modo examen y filtrado por dominio.
            </p>
          </div>

          {/* Selector de modo */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setModo("tarjetas")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                modo === "tarjetas"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Tarjetas (3D)
            </button>
            <button
              type="button"
              onClick={() => setModo("aprender")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                modo === "aprender"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Lista de Estudio
            </button>
            <button
              type="button"
              onClick={() => {
                setModo("test");
                setPreguntaTestIndice(0);
                setTestFinalizado(false);
                setAciertosTest(0);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                modo === "test"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Modo Test
            </button>
          </div>
        </div>

        {/* Carrusel de Barajas disponibles */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {BARAJAS_TARJETAS.map((b) => {
            const esActiva = b.id === barajaSeleccionada.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => cambiarBaraja(b)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                  esActiva
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-md shadow-amber-950/40"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span>{b.titulo}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {b.tarjetas.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MODO 1: TARJETAS CON GIRO 3D (QUIZLET STYLE) ── */}
      {modo === "tarjetas" && tarjetaActual && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Barra superior de controles */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                Tarjeta <strong className="text-white">{indiceActual + 1}</strong> de{" "}
                <strong className="text-white">{tarjetasFiltradas.length}</strong>
              </span>
              <button
                type="button"
                onClick={handleBarajar}
                className="hover:text-amber-300 flex items-center gap-1 transition-colors"
                title="Barajar tarjetas"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Barajar</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoloDestacadas(!soloDestacadas)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  soloDestacadas
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${soloDestacadas ? "fill-amber-400" : ""}`} />
                <span>Solo Favoritas ({destacadasLocales.length})</span>
              </button>
            </div>
          </div>

          {/* Tarjeta 3D interactiva */}
          <div
            onClick={() => setEstaVolteada(!estaVolteada)}
            role="button"
            tabIndex={0}
            className="w-full min-h-[340px] sm:min-h-[380px] cursor-pointer select-none perspective-[1200px]"
          >
            <div
              className={`relative w-full h-full min-h-[340px] sm:min-h-[380px] rounded-3xl p-8 border transition-all duration-500 transform-gpu flex flex-col justify-between shadow-2xl ${
                estaVolteada
                  ? "bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border-amber-500/50"
                  : "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Cabecera de la tarjeta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {tarjetaActual.categoria}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {estaVolteada ? "Reverso · Explicación" : "Anverso · Pregunta"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAlternarEstrella();
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Star
                    className={`w-5 h-5 ${
                      destacadasLocales.includes(tarjetaActual.id)
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-600 hover:text-slate-300"
                    }`}
                  />
                </button>
              </div>

              {/* Contenido central */}
              <div className="my-auto py-6 text-center space-y-4">
                {!estaVolteada ? (
                  <>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                      {tarjetaActual.anversoPregunta || tarjetaActual.anverso}
                    </h3>

                    {mostrarPista ? (
                      <div className="text-xs text-amber-300/90 bg-amber-950/40 border border-amber-800/40 p-3 rounded-xl max-w-md mx-auto">
                        Pista: {tarjetaActual.pistaConceptual || tarjetaActual.pista || "Analiza los conceptos clave del tema."}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMostrarPista(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs text-amber-400/80 hover:text-amber-300 font-mono transition-colors"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Ver Pista Mnemotécnica</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="space-y-4 text-left">
                    <div className="text-base sm:text-lg text-slate-100 leading-relaxed font-medium">
                      {tarjetaActual.reversoRespuesta || tarjetaActual.reverso}
                    </div>

                    {(tarjetaActual.ejemploAplicado || tarjetaActual.contextoAplicado) && (
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                        <strong className="text-amber-400 block font-mono text-[10px] uppercase mb-1">
                          Ejemplo Concreto:
                        </strong>
                        {tarjetaActual.ejemploAplicado || tarjetaActual.contextoAplicado}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pie de la tarjeta */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-4 border-t border-slate-800/60">
                <span>Pulsa la tarjeta o ESPACIO para voltear</span>
                <RotateCw className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Botones de acción y calificación */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAnterior}
                disabled={indiceActual === 0}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-all"
                title="Tarjeta anterior (Flecha Izquierda)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleSiguiente}
                disabled={indiceActual === tarjetasFiltradas.length - 1}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-all"
                title="Tarjeta siguiente (Flecha Derecha)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleMarcarEstado("repasando")}
                className="px-5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>Aún Aprendiendo</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarcarEstado("dominada")}
                className="px-5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-semibold transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>¡La Domino!</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODO 2: LISTA DE ESTUDIO (APRENDER) ── */}
      {modo === "aprender" && (
        <div className="space-y-4">
          <div className="text-xs font-mono text-slate-400">
            Mostrando todos los {tarjetas.length} términos de la baraja con sus respuestas y ejemplos.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tarjetas.map((t, idx) => {
              const est = estadosLocales[t.id];
              return (
                <div
                  key={t.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        est === "dominada"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : est === "repasando"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {est === "dominada"
                        ? "Dominada"
                        : est === "repasando"
                        ? "En repaso"
                        : "Por aprender"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{t.anversoPregunta || t.anverso}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{t.reversoRespuesta || t.reverso}</p>

                  {(t.ejemploAplicado || t.contextoAplicado) && (
                    <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <strong>Ejemplo:</strong> {t.ejemploAplicado || t.contextoAplicado}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODO 3: MODO TEST (EXAMEN RÁPIDO) ── */}
      {modo === "test" && (
        <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          {!testFinalizado ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400 uppercase font-bold">
                  Pregunta {preguntaTestIndice + 1} de {tarjetas.length}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Aciertos: {aciertosTest}
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white leading-relaxed">
                  ¿Cuál es la respuesta correcta para:{" "}
                  <span className="text-amber-300">"{tarjetaTestActual.anversoPregunta || tarjetaTestActual.anverso}"</span>?
                </h3>

                <div className="space-y-2">
                  {opcionesTest.map((opc, i) => {
                    const fueSeleccionada = respuestaTestSeleccionada === opc;
                    const esCorrecta = opc === (tarjetaTestActual.reversoRespuesta || tarjetaTestActual.reverso);

                    let estilo =
                      "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700";

                    if (respuestaTestSeleccionada !== null) {
                      if (esCorrecta) {
                        estilo = "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold";
                      } else if (fueSeleccionada) {
                        estilo = "bg-rose-950/60 border-rose-500 text-rose-300";
                      }
                    }

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => responderTest(opc)}
                        disabled={respuestaTestSeleccionada !== null}
                        className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${estilo}`}
                      >
                        <span>{opc}</span>
                        {respuestaTestSeleccionada !== null && esCorrecta && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {respuestaTestSeleccionada !== null && (
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={siguientePreguntaTest}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                  >
                    {preguntaTestIndice < tarjetas.length - 1
                      ? "Siguiente Pregunta"
                      : "Ver Resultados del Test"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold text-white">¡Test de Baraja Completado!</h3>
              <p className="text-sm text-slate-300">
                Has obtenido{" "}
                <strong className="text-amber-400 text-base">
                  {aciertosTest} de {tarjetas.length}
                </strong>{" "}
                aciertos ({Math.round((aciertosTest / (tarjetas.length || 1)) * 100)}%).
              </p>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPreguntaTestIndice(0);
                    setRespuestaTestSeleccionada(null);
                    setTestFinalizado(false);
                    setAciertosTest(0);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
                >
                  Repetir Examen
                </button>
                <button
                  type="button"
                  onClick={() => setModo("tarjetas")}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
                >
                  Volver a Flashcards 3D
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
