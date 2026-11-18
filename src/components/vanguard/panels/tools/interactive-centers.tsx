"use client";

// ============================================================
// VANGUARD TOOLS — CENTROS INTERACTIVOS Y OBSERVATORIOS
// v406.7 Sala de Análisis (War Room), Observatorio Demográfico y Sandbox
// ============================================================

import React, { useState, useMemo } from "react";
import {
  LayoutGrid,
  Users,
  TestTube2,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Shield,
  Sparkles,
  BarChart,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { DEMOGRAFIA_PAISES } from "@/lib/tools/data-indicators";
import { calculateCINC } from "@/lib/tools/calculator-engine";

export function InteractiveCenters({ activeTool }: { activeTool: string }) {
  // ------------------------------------------------------------
  // 1. Estado para Sala de Análisis & Cuadrantes (War Room)
  // ------------------------------------------------------------
  const [selectedQuadrant, setSelectedQuadrant] = useState<number | null>(null);

  const QUADRANTS = [
    {
      id: 1,
      title: "Hegemonía del Statu Quo Global",
      ejeX: "Alto Cumplimiento Normativo Internacional",
      ejeY: "Proyección Global de Poder",
      paises: ["Estados Unidos", "Reino Unido", "Francia"],
      doctrina: "Defensa del orden internacional basado en reglas, supremacía marítima y redes de alianzas fijas (OTAN/AUKUS).",
      color: "border-cyan-500/60 bg-cyan-950/20 text-cyan-400",
    },
    {
      id: 2,
      title: "Revisionismo Global Multipolar",
      ejeX: "Bajo Cumplimiento / Desafío al Orden",
      ejeY: "Proyección Global de Poder",
      paises: ["China", "Federación Rusa"],
      doctrina: "Creación de arquitecturas financieras alternativas (BRICS/desdolarización), disuasión nuclear hipersónica y esferas de influencia exclusivas.",
      color: "border-red-500/60 bg-red-950/20 text-red-400",
    },
    {
      id: 3,
      title: "Revisionismo Regional Asimétrico",
      ejeX: "Bajo Cumplimiento / Sancionado",
      ejeY: "Proyección Regional / Asimétrica",
      paises: ["Irán", "Corea del Norte"],
      doctrina: "Guerra proxy, redes de drones no tripulados, misiles balísticos y negación de acceso territorial en zonas grises.",
      color: "border-amber-500/60 bg-amber-950/20 text-amber-400",
    },
    {
      id: 4,
      title: "Potencias Medias de Equilibrio",
      ejeX: "Integración Multilateral Selectiva",
      ejeY: "Proyección Regional / Económica",
      paises: ["India", "Alemania", "Japón", "Brasil", "Arabia Saudita"],
      doctrina: "Autonomía estratégica, multipolarismo pragmático, arbitraje comercial entre bloques y defensa industrial.",
      color: "border-emerald-500/60 bg-emerald-950/20 text-emerald-400",
    },
  ];

  // ------------------------------------------------------------
  // 2. Estado para Observatorio Demográfico & Pirámides
  // ------------------------------------------------------------
  const [selectedDemoCountryId, setSelectedDemoCountryId] = useState("CN");

  const demoData = useMemo(() => {
    return (
      DEMOGRAFIA_PAISES.find((d) => d.paisId === selectedDemoCountryId) ||
      DEMOGRAFIA_PAISES[0]
    );
  }, [selectedDemoCountryId]);

  // ------------------------------------------------------------
  // 3. Estado para Espacio de Experimentación (Sandbox)
  // ------------------------------------------------------------
  const [sandboxNation, setSandboxNation] = useState({
    nombre: "República Experimental",
    poblacionM: 95,
    pibB: 1200,
    gastoDefensaB: 35,
    tropasK: 280,
    produccionAceroM: 40,
    energiaMtoe: 250,
  });

  const sandboxCinc = useMemo(() => {
    return calculateCINC({
      gastoMilitarUsd: sandboxNation.gastoDefensaB * 1e9,
      personalMilitar: sandboxNation.tropasK * 1000,
      consumoEnergiaTpe: sandboxNation.energiaMtoe * 1e6,
      produccionAceroTm: sandboxNation.produccionAceroM * 1e6,
      poblacionUrbana: sandboxNation.poblacionM * 0.75 * 1e6,
      poblacionTotal: sandboxNation.poblacionM * 1e6,
    });
  }, [sandboxNation]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* --------------------------------------------------------
          1. SALA DE ANÁLISIS & CUADRANTES (WAR ROOM)
      -------------------------------------------------------- */}
      {(activeTool === "sala-analisis" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider uppercase mb-1">
            <LayoutGrid className="w-4 h-4" />
            <span>Sala de Mando & Clasificación Estratégica</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Matriz de Cuadrantes Geopolíticos (War Room)
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Mapeo bidimensional de actores globales según su compromiso con el orden internacional y su capacidad de proyección militar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUADRANTS.map((q) => {
              const isSelected = selectedQuadrant === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuadrant(isSelected ? null : q.id)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer ${
                    q.color
                  } ${isSelected ? "ring-2 ring-white scale-[1.01]" : "hover:scale-[1.005]"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      Cuadrante #{q.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-300">
                      {q.paises.length} Potencias modelo
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{q.title}</h3>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {q.paises.map((p) => (
                      <span key={p} className="px-2 py-0.5 rounded bg-slate-900/80 text-white font-mono text-xs font-semibold">
                        {p}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {q.doctrina}
                  </p>

                  <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
                    <span>Eje X: {q.ejeX}</span>
                    <span>Eje Y: {q.ejeY}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* --------------------------------------------------------
          2. OBSERVATORIO DEMOGRÁFICO & PIRÁMIDES
      -------------------------------------------------------- */}
      {(activeTool === "observatorio-demografico" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-violet-400 font-mono text-xs tracking-wider uppercase mb-1">
            <Users className="w-4 h-4" />
            <span>Demografía & Pirámides de Población</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Observatorio Demográfico Global & Proyecciones a 2100
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            La demografía es el destino geopolítico: tasas de fecundidad, envejecimiento y proyecciones de fuerza laboral.
          </p>

          {/* Selector de Nación Demográfica */}
          <div className="flex flex-wrap gap-2 mb-6">
            {DEMOGRAFIA_PAISES.map((d) => (
              <button
                key={d.paisId}
                onClick={() => setSelectedDemoCountryId(d.paisId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  selectedDemoCountryId === d.paisId
                    ? "bg-violet-600 text-white font-bold shadow-lg shadow-violet-600/30"
                    : "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {d.paisNombre}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Visualizador de Pirámide Etaria SVG */}
            <div className="lg:col-span-7 bg-slate-950 p-5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-white font-mono">
                  Pirámide Etaria · {demoData.paisNombre}
                </span>
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Hombres
                  </span>
                  <span className="flex items-center gap-1 text-purple-400">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    Mujeres
                  </span>
                </div>
              </div>

              {/* Barras de la Pirámide */}
              <div className="space-y-2 py-2">
                {demoData.cohortes.map((cohorte) => {
                  const maxBarPct = 25; // escala
                  const widthHombres = `${(cohorte.hombresPct / maxBarPct) * 100}%`;
                  const widthMujeres = `${(cohorte.mujeresPct / maxBarPct) * 100}%`;
                  return (
                    <div key={cohorte.rango} className="flex items-center text-xs font-mono">
                      {/* Hombres (Izquierda) */}
                      <div className="flex-1 flex justify-end items-center gap-2">
                        <span className="text-[10px] text-slate-400">{cohorte.hombresPct}%</span>
                        <div className="w-full max-w-[140px] bg-slate-900 h-4 rounded-l flex justify-end overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full rounded-l transition-all duration-500"
                            style={{ width: widthHombres }}
                          />
                        </div>
                      </div>

                      {/* Rango Etario Central */}
                      <span className="w-14 text-center text-[10px] text-slate-300 font-bold shrink-0">
                        {cohorte.rango}
                      </span>

                      {/* Mujeres (Derecha) */}
                      <div className="flex-1 flex justify-start items-center gap-2">
                        <div className="w-full max-w-[140px] bg-slate-900 h-4 rounded-r flex justify-start overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-r transition-all duration-500"
                            style={{ width: widthMujeres }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">{cohorte.mujeresPct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] font-mono text-center text-slate-500 pt-3 border-t border-slate-900">
                Fuente: Proyecciones Demográficas ONU World Population Prospects 2026.
              </div>
            </div>

            {/* Ficha Demográfica & Métricas Clave */}
            <div className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-violet-500/30 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Estatus del Dividendo:</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-violet-950 text-violet-400 border border-violet-500/40">
                  {demoData.bonoDemografico}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400 font-sans">Población Actual (2026):</span>
                <span className="text-white font-bold">{demoData.poblacionActualM.toLocaleString()} M</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400 font-sans">Proyección al 2050:</span>
                <span className="text-cyan-400 font-bold">{demoData.poblacion2050M.toLocaleString()} M</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400 font-sans">Proyección al 2100:</span>
                <span className={demoData.poblacion2100M < demoData.poblacionActualM ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                  {demoData.poblacion2100M.toLocaleString()} M
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400 font-sans">Tasa de Fecundidad:</span>
                <span className="text-amber-400 font-bold">{demoData.tasaFecundidadHijosMujer} hijos/mujer</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400 font-sans">Edad Mediana:</span>
                <span className="text-white">{demoData.edadMedianaAnios} años</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-sans">Tasa de Dependencia Senil:</span>
                <span className="text-slate-200">{demoData.tasaDependenciaVejezPct}%</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------
          3. ESPACIO DE EXPERIMENTACIÓN & SANDBOX
      -------------------------------------------------------- */}
      {(activeTool === "espacio-experimentacion" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs tracking-wider uppercase mb-1">
            <TestTube2 className="w-4 h-4" />
            <span>Laboratorio de Parámetros de Soberanía</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Espacio de Experimentación & Sandbox Nacional
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Construye un Estado personalizado, altera sus parámetros de producción y defensa, y calcula su índice de poder global CINC.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Controles de Configuración */}
            <div className="lg:col-span-7 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-mono uppercase">
                  Nombre de la Nación Diseñada:
                </label>
                <input
                  type="text"
                  value={sandboxNation.nombre}
                  onChange={(e) => setSandboxNation({ ...sandboxNation, nombre: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-750 text-white rounded p-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Población (M hab):</span>
                    <span className="font-mono text-cyan-400 font-bold">{sandboxNation.poblacionM} M</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={sandboxNation.poblacionM}
                    onChange={(e) => setSandboxNation({ ...sandboxNation, poblacionM: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>PIB ($ Billones USD):</span>
                    <span className="font-mono text-cyan-400 font-bold">${sandboxNation.pibB} B</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="8000"
                    step="50"
                    value={sandboxNation.pibB}
                    onChange={(e) => setSandboxNation({ ...sandboxNation, pibB: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Gasto Militar ($ Billones):</span>
                    <span className="font-mono text-amber-400 font-bold">${sandboxNation.gastoDefensaB} B</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="300"
                    step="1"
                    value={sandboxNation.gastoDefensaB}
                    onChange={(e) => setSandboxNation({ ...sandboxNation, gastoDefensaB: Number(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Fuerzas Activas (k soldados):</span>
                    <span className="font-mono text-amber-400 font-bold">{sandboxNation.tropasK}k</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1500"
                    step="10"
                    value={sandboxNation.tropasK}
                    onChange={(e) => setSandboxNation({ ...sandboxNation, tropasK: Number(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Resultado Táctico del Sandbox */}
            <div className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-emerald-400 block mb-1 font-bold">
                  Proyección CINC del Estado Diseñado
                </span>
                <h3 className="text-lg font-bold text-white mb-3">{sandboxNation.nombre}</h3>

                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-2 mb-4 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Puntuación CINC:</span>
                    <span className="text-emerald-400 font-bold text-base">{sandboxCinc.scoreCINC}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Clasificación:</span>
                    <span className="text-white font-bold">{sandboxCinc.clasificacion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Ranking Estimado:</span>
                    <span className="text-cyan-400">Top #{sandboxCinc.rankingEstimado} Mundial</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-white block">Evaluación de Sostenibilidad:</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Un esfuerzo de defensa de ${(sandboxNation.gastoDefensaB / sandboxNation.pibB * 100).toFixed(1)}% del PIB
                    representa un gasto de ${(sandboxNation.gastoDefensaB * 1e9 / (sandboxNation.poblacionM * 1e6)).toFixed(0)} USD por habitante.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                Laboratorio interactivo calibrado contra el total de 193 Estados soberanos.
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
