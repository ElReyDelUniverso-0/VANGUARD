"use client";

// ============================================================
// VANGUARD TOOLS — MÓDULO DE CREACIÓN ESTRATÉGICA
// v406.7 Constructor de Mapas, Cronologías, Escenarios e Informes
// ============================================================

import React, { useState, useMemo } from "react";
import {
  MapPin,
  Milestone,
  Sliders,
  FileText,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  Save,
  Share2,
  Sparkles,
  Layers,
  Flame,
  AlertTriangle,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import { PAISES_DOSSIERS } from "@/lib/paises-data";
import { PREBUILT_TIMELINES } from "@/lib/tools/data-indicators";
import { runGeopoliticalStressTest } from "@/lib/tools/calculator-engine";
import {
  CustomMapPin,
  TimelineEvent,
  ScenarioShockModifiers,
  InformeInteligenciaParams,
} from "@/lib/tools/types";
import { saveWorkspaceState, loadWorkspaceState } from "@/lib/tools/workspace-store";

export function CreationHub({ activeTool }: { activeTool: string }) {
  // ------------------------------------------------------------
  // 1. Estado para Constructor de Mapas Temáticos
  // ------------------------------------------------------------
  const [mapColoring, setMapColoring] = useState<Record<string, string>>({
    US: "#3B82F6",
    CN: "#EF4444",
    RU: "#8B5CF6",
    DE: "#10B981",
    IN: "#F59E0B",
  });
  const [activePalette, setActivePalette] = useState("#3B82F6");
  const [selectedMapCountry, setSelectedMapCountry] = useState("US");
  const [pins, setPins] = useState<CustomMapPin[]>([
    { id: "pin-1", lat: 26.5, lng: 56.2, titulo: "Paso de Ormuz", nota: "Vigilancia de petroleros VLCC", categoria: "conflicto", color: "#EF4444" },
    { id: "pin-2", lat: 1.3, lng: 103.8, titulo: "Hub Changi", nota: "Paso de Malaca", categoria: "puerto", color: "#3B82F6" },
  ]);
  const [newPinTitle, setNewPinTitle] = useState("");
  const [newPinLat, setNewPinLat] = useState("30.0");
  const [newPinLng, setNewPinLng] = useState("31.0");
  const [newPinCat, setNewPinCat] = useState<CustomMapPin["categoria"]>("base");

  const [mapLayers, setMapLayers] = useState({
    chokepoints: true,
    cables: true,
    alianzas: false,
  });

  const handleColorCountry = () => {
    setMapColoring({
      ...mapColoring,
      [selectedMapCountry]: activePalette,
    });
  };

  const handleAddPin = () => {
    if (!newPinTitle.trim()) return;
    const newPin: CustomMapPin = {
      id: `pin-${Date.now()}`,
      lat: parseFloat(newPinLat) || 0,
      lng: parseFloat(newPinLng) || 0,
      titulo: newPinTitle,
      nota: "Coordenada táctica añadida por el analista",
      categoria: newPinCat,
      color: activePalette,
    };
    setPins([...pins, newPin]);
    setNewPinTitle("");
  };

  // ------------------------------------------------------------
  // 2. Estado para Constructor de Cronologías
  // ------------------------------------------------------------
  const [activeTimeline, setActiveTimeline] = useState(PREBUILT_TIMELINES[0]);
  const [newHitoFecha, setNewHitoFecha] = useState("");
  const [newHitoTitulo, setNewHitoTitulo] = useState("");
  const [newHitoDesc, setNewHitoDesc] = useState("");
  const [newHitoGravedad, setNewHitoGravedad] = useState<TimelineEvent["gravedad"]>("alta");

  const handleAddTimelineEvent = () => {
    if (!newHitoFecha || !newHitoTitulo) return;
    const event: TimelineEvent = {
      id: `ev-${Date.now()}`,
      fecha: newHitoFecha,
      titulo: newHitoTitulo,
      descripcion: newHitoDesc,
      categoria: "crisis",
      gravedad: newHitoGravedad,
    };
    setActiveTimeline({
      ...activeTimeline,
      eventos: [...activeTimeline.eventos, event],
    });
    setNewHitoFecha("");
    setNewHitoTitulo("");
    setNewHitoDesc("");
  };

  // ------------------------------------------------------------
  // 3. Estado para Constructor de Escenarios "What-If"
  // ------------------------------------------------------------
  const [scenarioShocks, setScenarioShocks] = useState<ScenarioShockModifiers>({
    aumentoCrudoDolares: 25,
    bloqueoOrmuz: false,
    bloqueoMalaca: false,
    bloqueoSuez: true,
    arancelesGlobalesPct: 15,
    aumentoGastoDefensaPct: 10,
    disrupcionSemiconductores: false,
  });

  const scenarioResult = useMemo(
    () => runGeopoliticalStressTest(scenarioShocks),
    [scenarioShocks]
  );

  const [scenarioName, setScenarioName] = useState("Escenario de Tensión en Cuellos de Botella");
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSaveScenario = () => {
    const ws = loadWorkspaceState();
    const newScen = {
      id: `scen-${Date.now()}`,
      nombre: scenarioName,
      descripcion: scenarioResult.resumenImpacto,
      fecha: new Date().toISOString(),
      shocks: scenarioShocks,
      impacto: scenarioResult,
    };
    saveWorkspaceState({
      ...ws,
      escenariosGuardados: [newScen, ...ws.escenariosGuardados],
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  // ------------------------------------------------------------
  // 4. Estado para Generador de Informes SITREP
  // ------------------------------------------------------------
  const [sitrep, setSitrep] = useState<InformeInteligenciaParams>({
    titulo: "INFORME DE SITUACIÓN ESTRATÉGICA · VANGUARD-SITREP-2026-X",
    autor: "Analista de Operaciones Globales",
    clasificacion: "ESTRÉGICO RESERVADO // NOFORN",
    paisPrimario: "Estados Unidos",
    paisesComparados: ["China", "Federación Rusa"],
    resumenEjecutivo:
      "La concentración del 68% de la capacidad de fundición de semiconductores en el Estrecho de Formosa y el endurecimiento de cuotas de exportación de galio por Pekín plantean un punto de inflexión en la disuasión multidominio.",
    analisisMilitar:
      "Aceleración de programas no tripulados y fortificación de cadenas insulares en el Mar de Filipinas. Despliegue de sensores acústicos en estrechos de aguas profundas.",
    analisisEconomico:
      "Presión inflacionaria contenida en bienes tecnológicos finales mediante reservas estratégicas corporativas de 9 meses. Aumento de inversión en plantas de litografía europea.",
    analisisRiesgo:
      "Probabilidad media-alta de incidentes en zonas grises marítimas sin escalada nuclear directa.",
    conclusiones:
      "Se recomienda mantener la diversificación logística de tierras raras hacia Australia y Brasil, así como reforzar la redundancia de cables de fibra submarina en el Océano Índico.",
    recomendaciones: [
      "Monitorear tránsitos en Ormuz y Malaca cada 6 horas.",
      "Completar inventario de reservas de gas licuado en terminales del Báltico.",
    ],
  });

  const [copiedSitrep, setCopiedSitrep] = useState(false);

  const copySitrepText = () => {
    const fullText = `================================================================================
${sitrep.titulo}
CLASIFICACIÓN: ${sitrep.clasificacion} | AUTOR: ${sitrep.autor}
FECHA: ${new Date().toISOString().split("T")[0]} | PLATAFORMA: VANGUARD INTELLIGENCE
================================================================================

1. RESUMEN EJECUTIVO:
${sitrep.resumenEjecutivo}

2. EVALUACIÓN MILITAR & DISUASIÓN:
${sitrep.analisisMilitar}

3. VULNERABILIDAD ECONÓMICA & SUMINISTROS:
${sitrep.analisisEconomico}

4. MATRIZ DE RIESGO:
${sitrep.analisisRiesgo}

5. CONCLUSIONES Y RECOMENDACIONES TÁCTICAS:
${sitrep.conclusiones}
${sitrep.recomendaciones.map((r, i) => `   [${i + 1}] ${r}`).join("\n")}
================================================================================`;
    navigator.clipboard.writeText(fullText);
    setCopiedSitrep(true);
    setTimeout(() => setCopiedSitrep(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* --------------------------------------------------------
          1. CONSTRUCTOR DE MAPAS TEMÁTICOS
      -------------------------------------------------------- */}
      {(activeTool === "constructor-mapas" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider uppercase mb-1">
            <MapPin className="w-4 h-4" />
            <span>Cartografía Vectorial Dinámica</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Constructor de Mapas Temáticos & Pines Tácticos
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Colorea potencias por alianzas, añade pines georreferenciados y visualiza capas de infraestructura crítica.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lienzo del Mapa SVG */}
            <div className="lg:col-span-8 bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Proyección Cilíndrica Equirrectangular 2D</span>
                </div>
                <span>{pins.length} Pines fijados</span>
              </div>

              {/* Visor SVG de Mapa Mundial */}
              <div className="w-full aspect-[2/1] bg-slate-900/90 rounded-lg relative overflow-hidden border border-slate-800/80">
                <svg viewBox="0 0 800 400" className="w-full h-full">
                  {/* Rejilla de Coordenadas */}
                  {[-60, -30, 0, 30, 60].map((lat) => {
                    const y = ((90 - lat) / 180) * 400;
                    return (
                      <line key={lat} x1="0" y1={y} x2="800" y2={y} stroke="#1e293b" strokeDasharray="2,2" strokeWidth="0.8" />
                    );
                  })}
                  {[-120, -60, 0, 60, 120].map((lng) => {
                    const x = ((lng + 180) / 360) * 800;
                    return (
                      <line key={lng} x1={x} y1="0" x2={x} y2="400" stroke="#1e293b" strokeDasharray="2,2" strokeWidth="0.8" />
                    );
                  })}

                  {/* Siluetas de Bloques Continentales Simplificadas */}
                  {/* América del Norte */}
                  <path
                    d="M 120 70 L 260 70 L 240 180 L 180 200 L 150 150 Z"
                    fill={mapColoring["US"] || "#334155"}
                    stroke="#475569"
                    strokeWidth="1"
                    className="opacity-75"
                  />
                  {/* América del Sur */}
                  <path
                    d="M 220 210 L 290 230 L 260 360 L 220 320 Z"
                    fill={mapColoring["BR"] || "#334155"}
                    stroke="#475569"
                    strokeWidth="1"
                    className="opacity-75"
                  />
                  {/* Europa */}
                  <path
                    d="M 390 80 L 460 80 L 450 150 L 380 150 Z"
                    fill={mapColoring["DE"] || "#334155"}
                    stroke="#475569"
                    strokeWidth="1"
                    className="opacity-75"
                  />
                  {/* Rusia / Eurasia */}
                  <path
                    d="M 460 60 L 710 60 L 680 140 L 460 130 Z"
                    fill={mapColoring["RU"] || "#334155"}
                    stroke="#475569"
                    strokeWidth="1"
                    className="opacity-75"
                  />
                  {/* África */}
                  <path
                    d="M 390 160 L 480 170 L 450 310 L 390 260 Z"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="1"
                    className="opacity-75"
                  />
                  {/* Asia Oriental / China */}
                  <path
                    d="M 520 140 L 660 140 L 640 230 L 520 220 Z"
                    fill={mapColoring["CN"] || "#334155"}
                    stroke="#475569"
                    strokeWidth="1"
                    className="opacity-75"
                  />
                  {/* India */}
                  <path
                    d="M 530 190 L 580 190 L 560 250 Z"
                    fill={mapColoring["IN"] || "#334155"}
                    stroke="#475569"
                    strokeWidth="1"
                    className="opacity-75"
                  />
                  {/* Oceanía */}
                  <path
                    d="M 640 280 L 730 280 L 710 350 L 630 330 Z"
                    fill={mapColoring["AU"] || "#334155"}
                    stroke="#475569"
                    strokeWidth="1"
                    className="opacity-75"
                  />

                  {/* Pines Tácticos */}
                  {pins.map((pin) => {
                    const cx = ((pin.lng + 180) / 360) * 800;
                    const cy = ((90 - pin.lat) / 180) * 400;
                    return (
                      <g key={pin.id} className="cursor-pointer">
                        <circle cx={cx} cy={cy} r="6" fill={pin.color || "#EF4444"} stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx={cx} cy={cy} r="12" fill={pin.color || "#EF4444"} fillOpacity="0.2" className="animate-ping" />
                        <text x={cx} y={cy - 9} fill="#fff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          {pin.titulo}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Capas Conmutables */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-800 text-xs">
                <span className="text-slate-400 font-mono flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Capas:</span>
                </span>
                <button
                  onClick={() => setMapLayers({ ...mapLayers, chokepoints: !mapLayers.chokepoints })}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    mapLayers.chokepoints ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "bg-slate-900 text-slate-400"
                  }`}
                >
                  Puntos de Estrangulamiento
                </button>
                <button
                  onClick={() => setMapLayers({ ...mapLayers, cables: !mapLayers.cables })}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    mapLayers.cables ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "bg-slate-900 text-slate-400"
                  }`}
                >
                  Cables Submarinos
                </button>
                <button
                  onClick={() => setMapLayers({ ...mapLayers, alianzas: !mapLayers.alianzas })}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    mapLayers.alianzas ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "bg-slate-900 text-slate-400"
                  }`}
                >
                  Alianzas Militares
                </button>
              </div>
            </div>

            {/* Controles de Personalización */}
            <div className="lg:col-span-4 space-y-4">
              {/* Paleta y Coloración */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-2">
                  Colorear Territorio
                </h4>
                <div className="flex items-center gap-2 mb-3">
                  {["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#64748B"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setActivePalette(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        activePalette === c ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedMapCountry}
                    onChange={(e) => setSelectedMapCountry(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-750 text-xs text-white rounded p-2 focus:outline-none"
                  >
                    {PAISES_DOSSIERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleColorCountry}
                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded transition-colors"
                  >
                    Pintar
                  </button>
                </div>
              </div>

              {/* Fijar Nuevo Pin */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-2">
                  Fijar Pin Táctico
                </h4>
                <div className="space-y-2 text-xs">
                  <input
                    type="text"
                    placeholder="Título del punto (ej. Canal de Suez)"
                    value={newPinTitle}
                    onChange={(e) => setNewPinTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 text-white rounded p-2 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Latitud (ej. 29.9)"
                      value={newPinLat}
                      onChange={(e) => setNewPinLat(e.target.value)}
                      className="bg-slate-900 border border-slate-750 text-white rounded p-2 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Longitud (ej. 32.5)"
                      value={newPinLng}
                      onChange={(e) => setNewPinLng(e.target.value)}
                      className="bg-slate-900 border border-slate-750 text-white rounded p-2 font-mono"
                    />
                  </div>
                  <button
                    onClick={handleAddPin}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir al Mapa</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------
          2. CONSTRUCTOR DE CRONOLOGÍAS
      -------------------------------------------------------- */}
      {(activeTool === "constructor-cronologias" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-violet-400 font-mono text-xs tracking-wider uppercase mb-1">
            <Milestone className="w-4 h-4" />
            <span>Constructor de Líneas Temporales</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Constructor de Cronologías Tácticas & Crisis
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Documenta secuencias cronológicas de eventos de seguridad con niveles de gravedad e hitos verificables.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visor de Cronología */}
            <div className="lg:col-span-8 bg-slate-950 p-5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">{activeTimeline.titulo}</h3>
                  <p className="text-xs text-slate-400">{activeTimeline.subtitulo}</p>
                </div>
                <span className="text-xs font-mono text-violet-400">
                  {activeTimeline.eventos.length} hitos registrados
                </span>
              </div>

              {/* Lista Vertical de Eventos */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {activeTimeline.eventos.map((ev, index) => {
                  const severityColors: Record<string, string> = {
                    critica: "border-red-500 bg-red-950/20 text-red-400",
                    alta: "border-amber-500 bg-amber-950/20 text-amber-400",
                    media: "border-cyan-500 bg-cyan-950/20 text-cyan-400",
                    baja: "border-slate-500 bg-slate-900 text-slate-400",
                  };
                  return (
                    <div
                      key={ev.id}
                      className="flex gap-4 items-start relative before:absolute before:left-2.5 before:top-6 before:bottom-0 before:w-0.5 before:bg-slate-800 last:before:hidden"
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-violet-500 flex items-center justify-center shrink-0 z-10 text-[9px] font-bold text-white">
                        {index + 1}
                      </div>
                      <div className="flex-1 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-white">{ev.titulo}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${severityColors[ev.gravedad]}`}>
                            {ev.gravedad}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block mb-1.5">{ev.fecha}</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{ev.descripcion}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Añadir Nuevo Hito */}
            <div className="lg:col-span-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono mb-3">
                Añadir Hito a la Cronología
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Fecha (YYYY-MM-DD):</label>
                  <input
                    type="text"
                    placeholder="2026-10-15"
                    value={newHitoFecha}
                    onChange={(e) => setNewHitoFecha(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 text-white rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Título del Evento:</label>
                  <input
                    type="text"
                    placeholder="Firma del tratado o inicio de bloqueo"
                    value={newHitoTitulo}
                    onChange={(e) => setNewHitoTitulo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 text-white rounded p-2"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Descripción / Evidencia:</label>
                  <textarea
                    rows={3}
                    placeholder="Detalles fácticos verificados..."
                    value={newHitoDesc}
                    onChange={(e) => setNewHitoDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 text-white rounded p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Gravedad:</label>
                  <select
                    value={newHitoGravedad}
                    onChange={(e) => setNewHitoGravedad(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-750 text-white rounded p-2"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
                <button
                  onClick={handleAddTimelineEvent}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insertar Evento</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------
          3. CONSTRUCTOR DE ESCENARIOS "WHAT-IF"
      -------------------------------------------------------- */}
      {(activeTool === "constructor-escenarios" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-red-400 font-mono text-xs tracking-wider uppercase mb-1">
            <Sliders className="w-4 h-4" />
            <span>Simulador de Estrés Geopolítico</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Constructor de Escenarios 'What-If'
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Aplica shocks en tiempo real sobre el precio del barril, pasos marítimos y aranceles para calcular el impacto en inflación y fletes.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Panel de Controles / Shocks */}
            <div className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                  Nombre del Escenario:
                </label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 text-xs text-white rounded p-2"
                />
              </div>

              {/* Slider de Crudo */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Shock en Petróleo (+$ USD/barril):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    +${scenarioShocks.aumentoCrudoDolares} USD
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={scenarioShocks.aumentoCrudoDolares}
                  onChange={(e) =>
                    setScenarioShocks({
                      ...scenarioShocks,
                      aumentoCrudoDolares: Number(e.target.value),
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Toggles de Bloqueos de Estrechos */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Interrupción de Pasos Marítimos:
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={scenarioShocks.bloqueoOrmuz}
                    onChange={(e) =>
                      setScenarioShocks({ ...scenarioShocks, bloqueoOrmuz: e.target.checked })
                    }
                    className="accent-red-500 rounded"
                  />
                  <span>Bloqueo del Estrecho de Ormuz (20% crudo global)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={scenarioShocks.bloqueoMalaca}
                    onChange={(e) =>
                      setScenarioShocks({ ...scenarioShocks, bloqueoMalaca: e.target.checked })
                    }
                    className="accent-red-500 rounded"
                  />
                  <span>Bloqueo del Estrecho de Malaca (Cadena de suministros asiática)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={scenarioShocks.bloqueoSuez}
                    onChange={(e) =>
                      setScenarioShocks({ ...scenarioShocks, bloqueoSuez: e.target.checked })
                    }
                    className="accent-red-500 rounded"
                  />
                  <span>Cierre del Canal de Suez / Desvío por Buena Esperanza</span>
                </label>
              </div>

              {/* Aranceles */}
              <div className="pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Aranceles Comerciales Cruzados:</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    +{scenarioShocks.arancelesGlobalesPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={scenarioShocks.arancelesGlobalesPct}
                  onChange={(e) =>
                    setScenarioShocks({
                      ...scenarioShocks,
                      arancelesGlobalesPct: Number(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-500"
                />
              </div>

              <button
                onClick={handleSaveScenario}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs rounded flex items-center justify-center gap-2 transition-colors"
              >
                {savedFeedback ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                <span>{savedFeedback ? "Guardado en Workspace" : "Guardar Escenario"}</span>
              </button>
            </div>

            {/* Panel de Resultados / Impacto Calculado */}
            <div className="lg:col-span-7 bg-slate-950 p-5 rounded-xl border border-red-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Evaluación del Impacto en Cascada</span>
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-400 font-bold">
                    Tensión: {scenarioResult.indiceTensionGlobal}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono block">Inflación Proyectada Adicional:</span>
                    <span className="text-xl font-bold font-mono text-amber-400">
                      +{scenarioResult.inflacionAdicionalGlobalPct}%
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono block">Demora Media en Envíos:</span>
                    <span className="text-xl font-bold font-mono text-cyan-400">
                      +{scenarioResult.retrasoFleteMaritimoDias} días
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-white block mb-0.5">Sectores Más Vulnerables:</span>
                    <p className="text-slate-300">{scenarioResult.sectoresMasAfectados.join(" · ")}</p>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-400 block mb-0.5">Beneficiarios Relativos:</span>
                    <p className="text-slate-300">{scenarioResult.ganadoresGeopoliticos.join(" · ")}</p>
                  </div>
                  <div>
                    <span className="font-bold text-red-400 block mb-0.5">Actores con Mayor Deterioro:</span>
                    <p className="text-slate-300">{scenarioResult.perdedoresGeopoliticos.join(" · ")}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-900/80 rounded border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-white block mb-1">Resumen del Modelo:</span>
                <p className="text-[11px] leading-relaxed text-slate-400">{scenarioResult.resumenImpacto}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------
          4. GENERADOR DE INFORMES DE INTELIGENCIA (SITREP)
      -------------------------------------------------------- */}
      {(activeTool === "generador-informes" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs tracking-wider uppercase mb-1">
            <FileText className="w-4 h-4" />
            <span>Generador de Informes Formales</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Generador de Informes de Situación (SITREP)
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Estructura expedientes de inteligencia con formato profesional, exportables a texto enriquecido, Markdown y PDF para imprimir.
          </p>

          <div className="bg-slate-950 p-5 md:p-6 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-emerald-400 font-bold block">{sitrep.titulo}</span>
                <span className="text-[10px] text-slate-400">CLASIFICACIÓN: {sitrep.clasificacion}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copySitrepText}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded flex items-center gap-1.5 transition-colors"
                >
                  {copiedSitrep ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSitrep ? "Copiado" : "Copiar SITREP"}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded flex items-center gap-1.5 transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
              </div>
            </div>

            {/* Cuerpo del Informe */}
            <div className="space-y-3 font-sans text-xs">
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block font-bold mb-1">
                  1. Resumen Ejecutivo
                </span>
                <p className="bg-slate-900/60 p-3 rounded border border-slate-800/80 leading-relaxed text-slate-200">
                  {sitrep.resumenEjecutivo}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-mono uppercase text-slate-400 block font-bold mb-1">
                    2. Análisis Militar & Disuasión
                  </span>
                  <p className="bg-slate-900/60 p-3 rounded border border-slate-800/80 leading-relaxed text-slate-200">
                    {sitrep.analisisMilitar}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-slate-400 block font-bold mb-1">
                    3. Vulnerabilidad Económica & Logística
                  </span>
                  <p className="bg-slate-900/60 p-3 rounded border border-slate-800/80 leading-relaxed text-slate-200">
                    {sitrep.analisisEconomico}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block font-bold mb-1">
                  4. Conclusiones y Recomendaciones
                </span>
                <p className="bg-slate-900/60 p-3 rounded border border-slate-800/80 leading-relaxed text-slate-200 mb-2">
                  {sitrep.conclusiones}
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
                  {sitrep.recomendaciones.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
