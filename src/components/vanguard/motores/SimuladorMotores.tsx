"use client";

import { useState } from "react";
import Link from "next/link";
import {
  simularLanchester,
  curvaNelsonSiegel,
  gravedadGeopolitica,
  calcularBrierScore,
  evaluarEscaladaKahn,
} from "@/lib/motores-analiticos/algoritmos-globales";

export function SimuladorMotores() {
  const [motorActivo, setMotorActivo] = useState<"lanchester" | "nelson" | "gravedad" | "brier" | "escalada">("lanchester");

  // Parámetros Lanchester
  const [fuerzaA, setFuerzaA] = useState(800);
  const [fuerzaB, setFuerzaB] = useState(1000);
  const [letalidadA, setLetalidadA] = useState(0.08);
  const [letalidadB, setLetalidadB] = useState(0.04);
  const [tipoLanchester, setTipoLanchester] = useState<"cuadratica" | "lineal">("cuadratica");

  // Parámetros Nelson-Siegel
  const [beta0, setBeta0] = useState(4.2);
  const [beta1, setBeta1] = useState(-1.8);
  const [beta2, setBeta2] = useState(1.2);
  const [tau, setTau] = useState(2.0);

  // Parámetros Gravedad
  const [pibA, setPibA] = useState(25000);
  const [pibB, setPibB] = useState(18000);
  const [distancia, setDistancia] = useState(6500);

  // Parámetros Escalada Nuclear
  const [peldanioKahn, setPeldanioKahn] = useState(14);

  // Resultados
  const resLanchester = simularLanchester(fuerzaA, fuerzaB, letalidadA, letalidadB, tipoLanchester);
  const resGravedad = Math.round(gravedadGeopolitica(pibA, pibB, distancia) * 10) / 10;
  const resBrier = calcularBrierScore([
    { probabilidad: 0.85, ocurrio: true },
    { probabilidad: 0.2, ocurrio: false },
    { probabilidad: 0.7, ocurrio: true },
  ]);
  const resEscalada = evaluarEscaladaKahn(peldanioKahn);

  return (
    <div className="rounded-xl border border-purple-500/30 bg-[#080212]/90 p-5 shadow-[0_0_35px_rgba(168,85,247,0.15)] backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-purple-400">
            SIMULADOR MATEMÁTICO EN TIEMPO REAL · CLIENT-SIDE
          </span>
          <h2 className="text-xl font-black tracking-wide text-zinc-100 uppercase">
            Laboratorio de Modelos Geopolíticos
          </h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "lanchester", label: "1. Lanchester" },
            { id: "escalada", label: "2. DEFCON / Escalada" },
            { id: "nelson", label: "3. Tipos Soberanos" },
            { id: "gravedad", label: "4. Gravedad" },
            { id: "brier", label: "5. Brier Score" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setMotorActivo(btn.id as typeof motorActivo)}
              className={`rounded px-3 py-1 font-mono text-xs uppercase tracking-wider transition ${
                motorActivo === btn.id
                  ? "bg-purple-600 text-white shadow-[0_0_14px_rgba(168,85,247,0.6)] font-bold"
                  : "border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {/* PANEL 1: LANCHESTER */}
        {motorActivo === "lanchester" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-purple-500/20 bg-zinc-900/70 p-3">
                <label className="text-xs text-zinc-400 font-mono">Fuerza Inicial A (Tropas/Blindados)</label>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="50"
                  value={fuerzaA}
                  onChange={(e) => setFuerzaA(Number(e.target.value))}
                  className="mt-2 w-full accent-purple-500"
                />
                <span className="font-mono text-sm font-bold text-purple-300">{fuerzaA} unidades</span>
              </div>

              <div className="rounded-lg border border-amber-500/20 bg-zinc-900/70 p-3">
                <label className="text-xs text-zinc-400 font-mono">Fuerza Inicial B (Adversario)</label>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="50"
                  value={fuerzaB}
                  onChange={(e) => setFuerzaB(Number(e.target.value))}
                  className="mt-2 w-full accent-amber-500"
                />
                <span className="font-mono text-sm font-bold text-amber-300">{fuerzaB} unidades</span>
              </div>

              <div className="rounded-lg border border-purple-500/20 bg-zinc-900/70 p-3">
                <label className="text-xs text-zinc-400 font-mono">Coeficiente Letalidad A (α)</label>
                <input
                  type="range"
                  min="0.01"
                  max="0.25"
                  step="0.01"
                  value={letalidadA}
                  onChange={(e) => setLetalidadA(Number(e.target.value))}
                  className="mt-2 w-full accent-purple-500"
                />
                <span className="font-mono text-sm font-bold text-purple-300">α = {letalidadA}</span>
              </div>

              <div className="rounded-lg border border-amber-500/20 bg-zinc-900/70 p-3">
                <label className="text-xs text-zinc-400 font-mono">Coeficiente Letalidad B (β)</label>
                <input
                  type="range"
                  min="0.01"
                  max="0.25"
                  step="0.01"
                  value={letalidadB}
                  onChange={(e) => setLetalidadB(Number(e.target.value))}
                  className="mt-2 w-full accent-amber-500"
                />
                <span className="font-mono text-sm font-bold text-amber-300">β = {letalidadB}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 border-y border-zinc-800/80 py-2.5">
              <label className="flex items-center gap-2 font-mono text-xs text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="lanchesterTipo"
                  checked={tipoLanchester === "cuadratica"}
                  onChange={() => setTipoLanchester("cuadratica")}
                  className="accent-purple-500"
                />
                Ley Cuadrática (Fuego dirigido concentrado / combate a distancia)
              </label>
              <label className="flex items-center gap-2 font-mono text-xs text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="lanchesterTipo"
                  checked={tipoLanchester === "lineal"}
                  onChange={() => setTipoLanchester("lineal")}
                  className="accent-purple-500"
                />
                Ley Lineal (Área / escaramuzas de desgaste en guerrilla)
              </label>
            </div>

            {/* Métricas de Combate */}
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-purple-500/30 bg-purple-950/40 p-3 text-center">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400">Ganador Teórico</span>
                <p className="mt-1 font-mono text-xl font-black text-purple-300">
                  {resLanchester.ganador === "A" ? "FUERZA A" : resLanchester.ganador === "B" ? "FUERZA B" : "EMPATE"}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-center">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400">Tiempo de Conclusión</span>
                <p className="mt-1 font-mono text-xl font-bold text-zinc-100">{resLanchester.tiempoHastaConclusion} hrs</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-center">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400">Bajas Estimadas A</span>
                <p className="mt-1 font-mono text-xl font-bold text-red-400">-{resLanchester.bajasA}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-center">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400">Bajas Estimadas B</span>
                <p className="mt-1 font-mono text-xl font-bold text-red-400">-{resLanchester.bajasB}</p>
              </div>
            </div>

            {/* Curva simplificada de atrición */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                Trazo temporal de atrición e intercambio de salvas
              </span>
              <div className="mt-3 flex h-20 items-end gap-1 overflow-x-auto pb-1">
                {resLanchester.pasos.map((p, i) => (
                  <div key={i} className="flex h-full w-4 flex-col justify-end gap-0.5" title={`t=${p.t}h: A=${p.fuerzaA}, B=${p.fuerzaB}`}>
                    <div
                      className="w-full bg-purple-500 rounded-t-sm"
                      style={{ height: `${Math.min(100, (p.fuerzaA / fuerzaA) * 100)}%` }}
                    />
                    <div
                      className="w-full bg-amber-500 rounded-t-sm"
                      style={{ height: `${Math.min(100, (p.fuerzaB / fuerzaB) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between font-mono text-[9px] text-zinc-500">
                <span>Inicio (0h)</span>
                <span className="text-purple-400 font-bold">■ Fuerza A</span>
                <span className="text-amber-400 font-bold">■ Fuerza B</span>
                <span>Conclusión ({resLanchester.tiempoHastaConclusion}h)</span>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: DEFCON / ESCALA DE HERMAN KAHN */}
        {motorActivo === "escalada" && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300">
              Evaluación paramétrica de los 44 peldaños de escalada estratégica formulados por Herman Kahn (Hudson Institute) para predecir cruce de umbrales nucleares y postura DEFCON.
            </p>

            <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-mono uppercase text-red-300">
                  Peldaño de Escalada Kahn (1 - 44)
                </label>
                <span className="font-mono text-sm font-bold text-red-200">
                  Peldaño {peldanioKahn} / 44 · Fase {resEscalada.fase}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="44"
                step="1"
                value={peldanioKahn}
                onChange={(e) => setPeldanioKahn(Number(e.target.value))}
                className="mt-3 w-full accent-red-500"
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded border border-red-500/30 bg-black/60 p-3 text-center">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase">Postura DEFCON</span>
                  <p className="mt-1 font-mono text-2xl font-black text-red-400">
                    DEFCON {resEscalada.nivelDefcon}
                  </p>
                </div>
                <div className="rounded border border-red-500/30 bg-black/60 p-3 text-center">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase">Probabilidad Intercambio Nuclear</span>
                  <p className="mt-1 font-mono text-2xl font-black text-amber-300">
                    {Math.round(resEscalada.probabilidadUsoNuclear * 1000) / 10}%
                  </p>
                </div>
                <div className="rounded border border-red-500/30 bg-black/60 p-3 text-center">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase">Fase Doctrinal</span>
                  <p className="mt-1 font-mono text-sm font-bold text-zinc-100">
                    {resEscalada.nombreFase}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-red-500/20 pt-3">
                <h4 className="font-mono text-xs font-bold text-red-300 uppercase">Doctrina Operacional:</h4>
                <p className="mt-1 text-xs text-zinc-300 leading-relaxed">{resEscalada.descripcionDoctrinal}</p>

                <h4 className="mt-3 font-mono text-xs font-bold text-red-300 uppercase">Indicadores en Radar OSINT:</h4>
                <ul className="mt-1 space-y-1 text-xs text-zinc-400">
                  {resEscalada.indicadoresClave.map((ind, i) => (
                    <li key={i}>• {ind}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: NELSON-SIEGEL */}
        {motorActivo === "nelson" && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400">
              Modelado paramétrico de la curva de tipos soberanos (yield curve) para evaluar riesgo soberano y expectativas de recesión.
            </p>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <label className="text-xs text-zinc-400">Nivel a Largo Plazo (β₀)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={beta0}
                  onChange={(e) => setBeta0(Number(e.target.value))}
                  className="mt-2 w-full accent-purple-500"
                />
                <span className="font-mono text-sm font-bold text-zinc-200">{beta0}%</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <label className="text-xs text-zinc-400">Pendiente Corto Plazo (β₁)</label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={beta1}
                  onChange={(e) => setBeta1(Number(e.target.value))}
                  className="mt-2 w-full accent-purple-500"
                />
                <span className="font-mono text-sm font-bold text-zinc-200">{beta1}%</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <label className="text-xs text-zinc-400">Curvatura / Joroba (β₂)</label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={beta2}
                  onChange={(e) => setBeta2(Number(e.target.value))}
                  className="mt-2 w-full accent-purple-500"
                />
                <span className="font-mono text-sm font-bold text-zinc-200">{beta2}%</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <label className="text-xs text-zinc-400">Decaimiento (τ)</label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={tau}
                  onChange={(e) => setTau(Number(e.target.value))}
                  className="mt-2 w-full accent-purple-500"
                />
                <span className="font-mono text-sm font-bold text-zinc-200">{tau}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
              {[0.25, 1, 2, 5, 10, 30].map((m) => {
                const yieldVal = Math.round(curvaNelsonSiegel(m, beta0, beta1, beta2, tau) * 100) / 100;
                return (
                  <div key={m} className="rounded border border-purple-500/20 bg-zinc-900/50 p-2 text-center">
                    <span className="font-mono text-[10px] text-zinc-500">{m < 1 ? "3M" : `${m}A`}</span>
                    <p className="font-mono text-base font-bold text-purple-300">{yieldVal}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PANEL 4: GRAVEDAD GEOPOLÍTICA */}
        {motorActivo === "gravedad" && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400">
              Modelo gravitatorio de comercio, flujos diplomáticos y proyección de poder entre dos centros de gravedad geopolítica.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <label className="text-xs text-zinc-400">Poder / Masa Estado A</label>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={pibA}
                  onChange={(e) => setPibA(Number(e.target.value))}
                  className="mt-2 w-full accent-purple-500"
                />
                <span className="font-mono text-sm font-bold text-purple-300">{pibA} pts</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <label className="text-xs text-zinc-400">Poder / Masa Estado B</label>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={pibB}
                  onChange={(e) => setPibB(Number(e.target.value))}
                  className="mt-2 w-full accent-purple-500"
                />
                <span className="font-mono text-sm font-bold text-amber-300">{pibB} pts</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <label className="text-xs text-zinc-400">Distancia Geográfica (km)</label>
                <input
                  type="range"
                  min="100"
                  max="20000"
                  step="500"
                  value={distancia}
                  onChange={(e) => setDistancia(Number(e.target.value))}
                  className="mt-2 w-full accent-purple-500"
                />
                <span className="font-mono text-sm font-bold text-zinc-200">{distancia} km</span>
              </div>
            </div>

            <div className="rounded-lg border border-purple-500/30 bg-purple-950/40 p-4 text-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Índice de Fuerza de Atracción Bilateral</span>
              <p className="mt-1 font-mono text-3xl font-black text-purple-300">{resGravedad}</p>
              <p className="mt-1 text-xs text-zinc-400">
                A mayor índice, mayor es la dependencia económica mutua y menor la probabilidad de ruptura súbita sin costos catastróficos.
              </p>
            </div>
          </div>
        )}

        {/* PANEL 5: BRIER SCORE */}
        {motorActivo === "brier" && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400">
              Evaluación de calibración probabilística conforme al estándar de superforecasting (Tetlock & Brier 1950).
            </p>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
              <span className="font-mono text-xs uppercase text-zinc-400">Conjunto de prueba reciente</span>
              <ul className="mt-2 space-y-1 font-mono text-xs text-zinc-300">
                <li>• Escalada en el estrecho de Ormuz: P=85% → Resultado: Ocurrió (Error cuadrático: 0.0225)</li>
                <li>• Ruptura del alto el fuego en Sudán: P=20% → Resultado: No ocurrió (Error cuadrático: 0.0400)</li>
                <li>• Prueba balística intercontinental: P=70% → Resultado: Ocurrió (Error cuadrático: 0.0900)</li>
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between border-t border-zinc-800 pt-3">
                <div>
                  <span className="font-mono text-[10px] uppercase text-zinc-500">Brier Score Calculado</span>
                  <p className="font-mono text-2xl font-bold text-emerald-400">{resBrier.score}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] uppercase text-zinc-500">Diagnóstico de Sesgo</span>
                  <p className="font-mono text-sm font-semibold text-zinc-200">{resBrier.interpretacion}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between border-t border-purple-500/20 pt-3 text-xs text-zinc-400">
        <span>Fuente: Implementación analítica Vanguard v423.0</span>
        <Link href="/escenarios" className="font-mono text-purple-400 underline hover:text-purple-300">
          Explorar simulador avanzado en /escenarios →
        </Link>
      </div>
    </div>
  );
}
