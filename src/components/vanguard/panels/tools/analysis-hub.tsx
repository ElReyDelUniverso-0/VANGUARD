"use client";

// ============================================================
// VANGUARD TOOLS — MÓDULO DE ANÁLISIS ESTRATÉGICO
// v406.7 Comparador Avanzado, Dispersión, Regiones y Calculadoras
// ============================================================

import React, { useState, useMemo } from "react";
import {
  Scale,
  Globe2,
  Calculator,
  History,
  TrendingUp,
  BarChart3,
  Check,
  Plus,
  Trash2,
  Flame,
  Shield,
  Zap,
  DollarSign,
  Users,
  Compass,
  ArrowRight,
  Info,
} from "lucide-react";
import { PAISES_DOSSIERS, PaisDossier } from "@/lib/paises-data";
import {
  INDICADORES_MUNDIALES,
  COMPARADOR_HISTORICO,
} from "@/lib/tools/data-indicators";
import {
  calculateCINC,
  calculateEnergyVulnerability,
  calculateRegionalPowerAggregate,
} from "@/lib/tools/calculator-engine";
import { CINCInput, VulnerabilidadEnergeticaInput } from "@/lib/tools/types";

export function AnalysisHub({ activeTool }: { activeTool: string }) {
  // ------------------------------------------------------------
  // Estado para Comparador de Países
  // ------------------------------------------------------------
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>(["US", "CN", "RU"]);
  const [countrySearch, setCountrySearch] = useState("");

  const selectedCountries = useMemo(() => {
    return PAISES_DOSSIERS.filter((p) => selectedCountryIds.includes(p.id));
  }, [selectedCountryIds]);

  const toggleCountry = (id: string) => {
    if (selectedCountryIds.includes(id)) {
      if (selectedCountryIds.length > 1) {
        setSelectedCountryIds(selectedCountryIds.filter((cid) => cid !== id));
      }
    } else {
      if (selectedCountryIds.length < 5) {
        setSelectedCountryIds([...selectedCountryIds, id]);
      }
    }
  };

  // ------------------------------------------------------------
  // Estado para Comparador de Regiones & Bloques
  // ------------------------------------------------------------
  const BLOQUES_PRESETS = [
    { id: "otan", nombre: "OTAN (Miembros Clave)", paises: ["US", "GB", "FR", "DE", "IT", "CA", "PL", "TR"] },
    { id: "brics", nombre: "BRICS+ (Núcleo Fundador)", paises: ["CN", "IN", "RU", "BR", "SA", "IR"] },
    { id: "ue", nombre: "Unión Europea (Big 5)", paises: ["DE", "FR", "IT", "ES", "PL"] },
    { id: "asia-pacifico", nombre: "Aliados Asia-Pacífico", paises: ["JP", "KR", "AU"] },
  ];
  const [bloqueAId, setBloqueAId] = useState("otan");
  const [bloqueBId, setBloqueBId] = useState("brics");

  const bloqueAData = useMemo(() => {
    const b = BLOQUES_PRESETS.find((x) => x.id === bloqueAId) || BLOQUES_PRESETS[0];
    return { ...b, stats: calculateRegionalPowerAggregate(b.paises) };
  }, [bloqueAId]);

  const bloqueBData = useMemo(() => {
    const b = BLOQUES_PRESETS.find((x) => x.id === bloqueBId) || BLOQUES_PRESETS[1];
    return { ...b, stats: calculateRegionalPowerAggregate(b.paises) };
  }, [bloqueBId]);

  // ------------------------------------------------------------
  // Estado para Analizador de Indicadores & Dispersión
  // ------------------------------------------------------------
  const [indicadorXId, setIndicadorXId] = useState("pib-nominal");
  const [indicadorYId, setIndicadorYId] = useState("gasto-defensa");

  const indX = useMemo(() => INDICADORES_MUNDIALES.find((i) => i.id === indicadorXId) || INDICADORES_MUNDIALES[0], [indicadorXId]);
  const indY = useMemo(() => INDICADORES_MUNDIALES.find((i) => i.id === indicadorYId) || INDICADORES_MUNDIALES[1], [indicadorYId]);

  const scatterPoints = useMemo(() => {
    return PAISES_DOSSIERS.map((p) => {
      const valX = indX.valoresPorPais[p.id] ?? 0;
      const valY = indY.valoresPorPais[p.id] ?? 0;
      return {
        id: p.id,
        nombre: p.nombre,
        valX,
        valY,
      };
    }).filter((pt) => pt.valX > 0 || pt.valY > 0);
  }, [indX, indY]);

  // ------------------------------------------------------------
  // Estado para Calculadoras Estratégicas
  // ------------------------------------------------------------
  const [cincInputs, setCincInputs] = useState<CINCInput>({
    gastoMilitarUsd: 850e9,
    personalMilitar: 1350000,
    consumoEnergiaTpe: 2200e6,
    produccionAceroTm: 80e6,
    poblacionUrbana: 280e6,
    poblacionTotal: 340e6,
  });

  const cincResult = useMemo(() => calculateCINC(cincInputs), [cincInputs]);

  const [vulnerabilidadInputs, setVulnerabilidadInputs] = useState<VulnerabilidadEnergeticaInput>({
    consumoPetroleoBpd: 14.5,
    produccionPetroleoBpd: 4.2,
    consumoGasBcm: 380,
    produccionGasBcm: 220,
    mesesReservasEstrategicas: 2.5,
    dependenciaChokepointPct: 65,
  });

  const vulnerabilidadResult = useMemo(
    () => calculateEnergyVulnerability(vulnerabilidadInputs),
    [vulnerabilidadInputs]
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* --------------------------------------------------------
          1. COMPARADOR AVANZADO DE PAÍSES
      -------------------------------------------------------- */}
      {(activeTool === "comparador-paises" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider uppercase mb-1">
                <Scale className="w-4 h-4" />
                <span>Módulo de Análisis Comparativo</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Comparador Avanzado de Potencias Mundiales
              </h2>
              <p className="text-sm text-slate-400">
                Selecciona hasta 5 naciones para contrastar doctrinas de defensa, radar de capacidades, PIB y reservas estratégicas.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                {selectedCountryIds.length}/5 seleccionados
              </span>
            </div>
          </div>

          {/* Selector de Países */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">
                Naciones en Catálogo:
              </span>
              <input
                type="text"
                placeholder="Filtrar país..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-cyan-500 w-40"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
              {PAISES_DOSSIERS.filter(
                (p) =>
                  p.nombre.toLowerCase().includes(countrySearch.toLowerCase()) ||
                  p.id.toLowerCase().includes(countrySearch.toLowerCase())
              ).map((p) => {
                const isSelected = selectedCountryIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleCountry(p.id)}
                    className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                        : "bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    <span>{p.nombre}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gráfico Radar SVG de Capacidades */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-950/70 p-4 md:p-6 rounded-xl border border-slate-800">
            <div className="lg:col-span-5 flex flex-col items-center">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Radar de 6 Ejes de Poder Nacional
              </h4>
              <div className="relative w-64 h-64 md:w-72 md:h-72">
                <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                  {/* Círculos concéntricos de referencia */}
                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((r, i) => (
                    <circle
                      key={i}
                      cx="100"
                      cy="100"
                      r={r * 80}
                      fill="none"
                      stroke="#334155"
                      strokeDasharray={i === 4 ? "none" : "2,2"}
                      strokeWidth="0.8"
                    />
                  ))}
                  {/* Ejes radiales (6 ejes) */}
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                    const rad = (deg - 90) * (Math.PI / 180);
                    const x = 100 + 80 * Math.cos(rad);
                    const y = 100 + 80 * Math.sin(rad);
                    const labels = ["Militar", "Economía", "Demografía", "Energía", "Tecnología", "Diplomacia"];
                    const labelX = 100 + 96 * Math.cos(rad);
                    const labelY = 100 + 96 * Math.sin(rad);
                    return (
                      <g key={i}>
                        <line x1="100" y1="100" x2={x} y2={y} stroke="#475569" strokeWidth="0.8" />
                        <text
                          x={labelX}
                          y={labelY + 3}
                          fontSize="7"
                          fill="#94a3b8"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {labels[i]}
                        </text>
                      </g>
                    );
                  })}

                  {/* Polígonos de cada país seleccionado */}
                  {selectedCountries.map((pais, idx) => {
                    const colors = ["#06B6D4", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];
                    const col = colors[idx % colors.length];
                    const axes = [
                      pais.radar.militar,
                      pais.radar.economia,
                      pais.radar.demografia,
                      pais.radar.energia,
                      pais.radar.tecnologia,
                      pais.radar.diplomacia,
                    ];
                    const points = axes.map((val, i) => {
                      const rad = (i * 60 - 90) * (Math.PI / 180);
                      const r = (val / 100) * 80;
                      return `${100 + r * Math.cos(rad)},${100 + r * Math.sin(rad)}`;
                    }).join(" ");

                    return (
                      <g key={pais.id}>
                        <polygon
                          points={points}
                          fill={col}
                          fillOpacity="0.25"
                          stroke={col}
                          strokeWidth="1.8"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-3">
                {selectedCountries.map((p, idx) => {
                  const colors = ["#06B6D4", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];
                  return (
                    <div key={p.id} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: colors[idx % colors.length] }}
                      />
                      <span className="text-slate-300 font-medium">{p.nombre}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tabla Comparativa de Datos Duros */}
            <div className="lg:col-span-7 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                    <th className="py-2 px-3">Indicador Clave</th>
                    {selectedCountries.map((p) => (
                      <th key={p.id} className="py-2 px-3 font-bold text-slate-200">
                        {p.nombre}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-sans">PIB Nominal</td>
                    {selectedCountries.map((p) => (
                      <td key={p.id} className="py-2 px-3 font-semibold text-white">
                        ${p.pibNominalBillionUsd.toLocaleString()} B
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-sans">Gasto Militar</td>
                    {selectedCountries.map((p) => (
                      <td key={p.id} className="py-2 px-3 text-cyan-400">
                        ${p.gastoMilitarBillionUsd} B ({p.gastoMilitarPibPct}%)
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-sans">Efectivos Activos</td>
                    {selectedCountries.map((p) => (
                      <td key={p.id} className="py-2 px-3 text-slate-300">
                        {p.efectivosActivos.toLocaleString()}k
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-sans">Ojivas Nucleares</td>
                    {selectedCountries.map((p) => (
                      <td key={p.id} className="py-2 px-3 text-amber-400 font-bold">
                        {p.ojivasNucleares > 0 ? p.ojivasNucleares.toLocaleString() : "0"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-sans">Petróleo (mbpd)</td>
                    {selectedCountries.map((p) => (
                      <td key={p.id} className="py-2 px-3 text-slate-300">
                        {p.produccionPetroleoBpd} mbpd
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-sans">Ranking GFP</td>
                    {selectedCountries.map((p) => (
                      <td key={p.id} className="py-2 px-3 text-emerald-400 font-bold">
                        #{p.indiceGfp}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>

              {/* Doctrina Resumida de cada país */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {selectedCountries.map((p) => (
                  <div key={p.id} className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                    <span className="font-bold text-white block mb-0.5">{p.nombre} — Doctrina</span>
                    <p className="text-slate-400 text-[11px] line-clamp-2">{p.doctrinaMilitar}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------
          2. COMPARADOR DE REGIONES Y BLOQUES
      -------------------------------------------------------- */}
      {(activeTool === "comparador-regiones" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs tracking-wider uppercase mb-1">
            <Globe2 className="w-4 h-4" />
            <span>Módulo Geopolítico de Bloques</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Comparador de Coaliciones & Bloques Multilaterales
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Mide el poder económico, demográfico y militar agregado entre alianzas contrapuestas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Bloque A */}
            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30">
              <label className="text-xs font-mono uppercase text-cyan-400 block mb-2 font-bold">
                Bloque A:
              </label>
              <select
                value={bloqueAId}
                onChange={(e) => setBloqueAId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-lg p-2.5 mb-4 focus:outline-none focus:border-cyan-500"
              >
                {BLOQUES_PRESETS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre}
                  </option>
                ))}
              </select>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-800 py-1">
                  <span className="text-slate-400 font-sans">PIB Agregado:</span>
                  <span className="text-white font-bold">${bloqueAData.stats.pibTotal.toLocaleString()} B USD</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 py-1">
                  <span className="text-slate-400 font-sans">Gasto Militar Conjunto:</span>
                  <span className="text-cyan-400 font-bold">${bloqueAData.stats.gastoMilitarTotal.toLocaleString()} B USD</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 py-1">
                  <span className="text-slate-400 font-sans">Población Total:</span>
                  <span className="text-slate-300">{bloqueAData.stats.poblacionTotal.toLocaleString()} Millones</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 py-1">
                  <span className="text-slate-400 font-sans">Efectivos Activos:</span>
                  <span className="text-slate-300">{bloqueAData.stats.efectivosActivosTotal.toLocaleString()}k soldados</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 py-1">
                  <span className="text-slate-400 font-sans">Ojivas Nucleares:</span>
                  <span className="text-amber-400 font-bold">{bloqueAData.stats.ojivasTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 font-sans">Extracción de Crudo:</span>
                  <span className="text-emerald-400 font-bold">{bloqueAData.stats.petroleoTotal} mbpd</span>
                </div>
              </div>
            </div>

            {/* Bloque B */}
            <div className="bg-slate-950 p-4 rounded-xl border border-red-500/30">
              <label className="text-xs font-mono uppercase text-red-400 block mb-2 font-bold">
                Bloque B:
              </label>
              <select
                value={bloqueBId}
                onChange={(e) => setBloqueBId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-lg p-2.5 mb-4 focus:outline-none focus:border-red-500"
              >
                {BLOQUES_PRESETS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre}
                  </option>
                ))}
              </select>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-800 py-1">
                  <span className="text-slate-400 font-sans">PIB Agregado:</span>
                  <span className="text-white font-bold">${bloqueBData.stats.pibTotal.toLocaleString()} B USD</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 py-1">
                  <span className="text-slate-400 font-sans">Gasto Militar Conjunto:</span>
                  <span className="text-red-400 font-bold">${bloqueBData.stats.gastoMilitarTotal.toLocaleString()} B USD</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 py-1">
                  <span className="text-slate-400 font-sans">Población Total:</span>
                  <span className="text-slate-300">{bloqueBData.stats.poblacionTotal.toLocaleString()} Millones</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 py-1">
                  <span className="text-slate-400 font-sans">Efectivos Activos:</span>
                  <span className="text-slate-300">{bloqueBData.stats.efectivosActivosTotal.toLocaleString()}k soldados</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 py-1">
                  <span className="text-slate-400 font-sans">Ojivas Nucleares:</span>
                  <span className="text-amber-400 font-bold">{bloqueBData.stats.ojivasTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 font-sans">Extracción de Crudo:</span>
                  <span className="text-emerald-400 font-bold">{bloqueBData.stats.petroleoTotal} mbpd</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------
          3. ANALIZADOR DE INDICADORES & DISPERSIÓN
      -------------------------------------------------------- */}
      {(activeTool === "analizador-indicadores" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs tracking-wider uppercase mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Gráficos de Correlación & Dispersión</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Analizador de Dispersión Geopolítica
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Cruza dos indicadores globales para detectar correlaciones, anomalías y asimetrías de poder.
          </p>

          {/* Selectores de Ejes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Eje X (Horizontal):
              </label>
              <select
                value={indicadorXId}
                onChange={(e) => setIndicadorXId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded p-2 focus:border-cyan-500"
              >
                {INDICADORES_MUNDIALES.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.nombre} ({ind.unidad})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Eje Y (Vertical):
              </label>
              <select
                value={indicadorYId}
                onChange={(e) => setIndicadorYId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded p-2 focus:border-cyan-500"
              >
                {INDICADORES_MUNDIALES.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.nombre} ({ind.unidad})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Gráfico SVG de Dispersión */}
          <div className="bg-slate-950 p-4 md:p-6 rounded-xl border border-slate-800">
            <div className="h-64 md:h-80 w-full relative">
              <svg viewBox="0 0 500 250" className="w-full h-full overflow-visible">
                {/* Cuadrícula */}
                <line x1="40" y1="20" x2="40" y2="220" stroke="#334155" strokeWidth="1" />
                <line x1="40" y1="220" x2="480" y2="220" stroke="#334155" strokeWidth="1" />
                {[0.25, 0.5, 0.75].map((pct) => (
                  <g key={pct}>
                    <line x1="40" y1={220 - pct * 200} x2="480" y2={220 - pct * 200} stroke="#1e293b" strokeDasharray="3,3" />
                    <line x1={40 + pct * 440} y1="20" x2={40 + pct * 440} y2="220" stroke="#1e293b" strokeDasharray="3,3" />
                  </g>
                ))}

                {/* Etiquetas de Ejes */}
                <text x="260" y="242" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">
                  {indX.nombre} →
                </text>
                <text x="15" y="120" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace" transform="rotate(-90 15,120)">
                  {indY.nombre} →
                </text>

                {/* Puntos de Dispersión */}
                {scatterPoints.map((pt) => {
                  const maxValX = indX.max || 1;
                  const maxValY = indY.max || 1;
                  const normX = Math.min(1, Math.max(0, pt.valX / maxValX));
                  const normY = Math.min(1, Math.max(0, pt.valY / maxValY));
                  const cx = 40 + normX * 430;
                  const cy = 220 - normY * 190;

                  return (
                    <g key={pt.id} className="group cursor-pointer">
                      <circle
                        cx={cx}
                        cy={cy}
                        r="5"
                        fill="#06B6D4"
                        fillOpacity="0.8"
                        stroke="#fff"
                        strokeWidth="1"
                        className="transition-transform hover:scale-150"
                      />
                      <text
                        x={cx}
                        y={cy - 8}
                        fill="#cbd5e1"
                        fontSize="7"
                        textAnchor="middle"
                        fontFamily="monospace"
                        className="opacity-70 group-hover:opacity-100 font-bold"
                      >
                        {pt.id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-mono">
              <span>Mínimo: 0</span>
              <span>Naciones graficadas: {scatterPoints.length}</span>
              <span>Escala: Normalizada lineal</span>
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------
          4. CALCULADORAS ESTRATÉGICAS (CINC & VULNERABILIDAD)
      -------------------------------------------------------- */}
      {(activeTool === "calculadoras-estrategicas" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs tracking-wider uppercase mb-1">
            <Calculator className="w-4 h-4" />
            <span>Modelos Académicos & Fórmulas Reales</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Calculadoras Estratégicas de Poder & Seguridad
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Aplica la fórmula CINC (Correlates of War) y el Índice de Vulnerabilidad Energética.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calculadora CINC */}
            <div className="bg-slate-950 p-5 rounded-xl border border-amber-500/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Índice CINC (Poder Compuesto)</span>
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono">
                  Correlates of War
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Pondera el porcentaje que representa un Estado en el total de 6 capacidades mundiales.
              </p>

              {/* Botón de Cargar Preset */}
              <div className="flex gap-2 mb-4">
                <span className="text-xs text-slate-400 self-center">Cargar datos reales:</span>
                <button
                  onClick={() =>
                    setCincInputs({
                      gastoMilitarUsd: 916e9,
                      personalMilitar: 1328000,
                      consumoEnergiaTpe: 2200e6,
                      produccionAceroTm: 80e6,
                      poblacionUrbana: 280e6,
                      poblacionTotal: 341e6,
                    })
                  }
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded"
                >
                  EE. UU.
                </button>
                <button
                  onClick={() =>
                    setCincInputs({
                      gastoMilitarUsd: 296e9,
                      personalMilitar: 2035000,
                      consumoEnergiaTpe: 3400e6,
                      produccionAceroTm: 1000e6,
                      poblacionUrbana: 920e6,
                      poblacionTotal: 1409e6,
                    })
                  }
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded"
                >
                  China
                </button>
                <button
                  onClick={() =>
                    setCincInputs({
                      gastoMilitarUsd: 84e9,
                      personalMilitar: 1455000,
                      consumoEnergiaTpe: 950e6,
                      produccionAceroTm: 140e6,
                      poblacionUrbana: 510e6,
                      poblacionTotal: 1442e6,
                    })
                  }
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded"
                >
                  India
                </button>
              </div>

              {/* Sliders / Inputs */}
              <div className="space-y-3 text-xs mb-5">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Gasto Militar Anual:</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      ${(cincInputs.gastoMilitarUsd / 1e9).toFixed(0)} B USD
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1e9"
                    max="1000e9"
                    step="5e9"
                    value={cincInputs.gastoMilitarUsd}
                    onChange={(e) =>
                      setCincInputs({ ...cincInputs, gastoMilitarUsd: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Personal Militar Activo:</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {(cincInputs.personalMilitar / 1000).toFixed(0)}k soldados
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20000"
                    max="2500000"
                    step="20000"
                    value={cincInputs.personalMilitar}
                    onChange={(e) =>
                      setCincInputs({ ...cincInputs, personalMilitar: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Población Total:</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {(cincInputs.poblacionTotal / 1e6).toFixed(0)} Millones
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10e6"
                    max="1500e6"
                    step="10e6"
                    value={cincInputs.poblacionTotal}
                    onChange={(e) =>
                      setCincInputs({ ...cincInputs, poblacionTotal: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>

              {/* Resultado CINC */}
              <div className="p-4 bg-slate-900 rounded-lg border border-amber-500/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-mono">Puntuación CINC:</span>
                  <span className="text-xl font-mono font-bold text-amber-400">
                    {cincResult.scoreCINC}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 font-mono">Estatus Estratégico:</span>
                  <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                    {cincResult.clasificacion}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                  <div>Militar: {cincResult.desglose.gastoMilitarShare}%</div>
                  <div>Tropas: {cincResult.desglose.personalShare}%</div>
                  <div>Pob. Total: {cincResult.desglose.pobTotalShare}%</div>
                </div>
              </div>
            </div>

            {/* Calculadora de Vulnerabilidad Energética */}
            <div className="bg-slate-950 p-5 rounded-xl border border-emerald-500/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Vulnerabilidad de Suministro Energético</span>
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                  Seguridad Nacional
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Evalúa el riesgo de colapso industrial según dependencia de importaciones y choke points.
              </p>

              <div className="space-y-3 text-xs mb-5">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Meses de Reservas Estratégicas:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {vulnerabilidadInputs.mesesReservasEstrategicas} meses
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={vulnerabilidadInputs.mesesReservasEstrategicas}
                    onChange={(e) =>
                      setVulnerabilidadInputs({
                        ...vulnerabilidadInputs,
                        mesesReservasEstrategicas: Number(e.target.value),
                      })
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Dependencia de Choke Points (Ormuz/Malaca):</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {vulnerabilidadInputs.dependenciaChokepointPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={vulnerabilidadInputs.dependenciaChokepointPct}
                    onChange={(e) =>
                      setVulnerabilidadInputs({
                        ...vulnerabilidadInputs,
                        dependenciaChokepointPct: Number(e.target.value),
                      })
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              {/* Resultado Vulnerabilidad */}
              <div className="p-4 bg-slate-900 rounded-lg border border-emerald-500/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-mono">Índice de Vulnerabilidad:</span>
                  <span className={`text-xl font-mono font-bold ${
                    vulnerabilidadResult.indiceVulnerabilidad > 60 ? "text-red-400" : "text-emerald-400"
                  }`}>
                    {vulnerabilidadResult.indiceVulnerabilidad}/100
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 font-mono">Nivel de Riesgo:</span>
                  <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                    {vulnerabilidadResult.nivelRiesgo}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 border-t border-slate-800 pt-2">
                  <span className="font-bold text-white block mb-1">Dictamen del Analista:</span>
                  {vulnerabilidadResult.recomendaciones[0]}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------
          5. COMPARADOR HISTÓRICO (1914 - 1945 - 1991 - 2026)
      -------------------------------------------------------- */}
      {(activeTool === "comparador-historico" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-violet-400 font-mono text-xs tracking-wider uppercase mb-1">
            <History className="w-4 h-4" />
            <span>Módulo de Órdenes Geopolíticos</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Comparador de Estructuras Históricas de Poder
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Evolución de las superpotencias, doctrinas dominantes y economías desde 1914 hasta 2026.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMPARADOR_HISTORICO.map((era) => (
              <div
                key={era.era}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-violet-500/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold font-mono text-violet-400">{era.era}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono px-2 py-0.5 bg-slate-900 rounded">
                    {era.gastosMilitaresGlobalesPct}% PIB Def.
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{era.nombreEra}</h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Superpotencias:
                    </span>
                    <span className="text-slate-200">{era.superpotencias.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Orden Dominante:
                    </span>
                    <p className="text-slate-400 text-[11px]">{era.ordenGeopolitico}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Doctrina Estratégica:
                    </span>
                    <p className="text-slate-400 text-[11px]">{era.doctrinaDominante}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
