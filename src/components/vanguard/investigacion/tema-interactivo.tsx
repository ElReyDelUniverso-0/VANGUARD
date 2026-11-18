"use client";

// ═══════════════════════════════════════════════════════════════════
// VANGUARD INVESTIGACIÓN SISTÉMICA — COMPONENTE INTERACTIVO DE TEMA
// El núcleo que conecta: Comprender, Investigar, Visualizar,
// Comparar y Simular en una sola experiencia fluida.
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  MapPin,
  Scale,
  FlaskConical,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Clock,
  Share2,
  Download,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import type { TemaInvestigacion, NodoGeografico } from "@/lib/investigacion/tipos";

type ModoVista = "comprender" | "investigar" | "visualizar" | "comparar" | "simular";

interface TemaInteractivoProps {
  tema: TemaInvestigacion;
}

export function TemaInteractivo({ tema }: TemaInteractivoProps) {
  const [modo, setModo] = useState<ModoVista>("comprender");
  const [nodoSeleccionado, setNodoSeleccionado] = useState<NodoGeografico | null>(
    tema.nodosGeograficos[0] ?? null
  );
  const [filtroTipoNodo, setFiltroTipoNodo] = useState<string>("todos");
  const [copiadoCita, setCopiadoCita] = useState(false);

  // Proyección equirrectangular simple para el mapa SVG
  // Longitud [-180, 180] -> X [0, 800]
  // Latitud [-80, 80] -> Y [400, 0]
  const proyectarCoords = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((80 - Math.max(-80, Math.min(80, lat))) / 160) * 400;
    return { x, y };
  };

  const nodosFiltrados = tema.nodosGeograficos.filter((n) =>
    filtroTipoNodo === "todos" ? true : n.tipo === filtroTipoNodo
  );

  const copiarCita = () => {
    const cita = `Vanguard Global Intelligence. (${tema.fechaActualizacion.slice(0, 4)}). "${tema.titulo}". Dossier de Investigación Sistémica. Consultado en https://vanguard-kq9r.vercel.app/investigacion/${tema.id}`;
    navigator.clipboard.writeText(cita);
    setCopiadoCita(true);
    setTimeout(() => setCopiadoCita(false), 2500);
  };

  const descargarJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tema, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vanguard-dossier-${tema.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full space-y-6">
      {/* ── BARRA DE MODOS / CICLO DE INVESTIGACIÓN ── */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-y border-amber-hud/30 py-2.5 px-3 -mx-3 sm:mx-0 sm:rounded-md flex items-center justify-between gap-2 overflow-x-auto thin-scroll">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono uppercase text-muted-foreground hidden md:inline-block mr-1">
            MÉTODO SISTÉMICO:
          </span>
          {(
            [
              { id: "comprender", label: "1. Comprender", icon: BookOpen },
              { id: "investigar", label: "2. Investigar", icon: Search },
              { id: "visualizar", label: "3. Visualizar (Mapa)", icon: MapPin },
              { id: "comparar", label: "4. Comparar", icon: Scale },
              { id: "simular", label: "5. Simular & Red", icon: FlaskConical },
            ] as const
          ).map((m) => {
            const Icon = m.icon;
            const activo = modo === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setModo(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all shrink-0 ${
                  activo
                    ? "bg-amber-hud/25 text-amber border border-amber-hud shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                    : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={copiarCita}
            title="Copiar cita académica del dossier"
            className="px-2.5 py-1 text-[11px] font-mono border border-border/60 rounded bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center gap-1 transition-all"
          >
            {copiadoCita ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copiadoCita ? "Citado" : "Citar"}</span>
          </button>
          <button
            onClick={descargarJson}
            title="Exportar dossier en JSON estructurado"
            className="px-2.5 py-1 text-[11px] font-mono border border-amber-hud/40 rounded bg-amber-hud/10 hover:bg-amber-hud/20 text-amber flex items-center gap-1 transition-all"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODO 1: COMPRENDER (Teoría, Conceptos, Actores y Cronología)
         ═══════════════════════════════════════════════════════════ */}
      {modo === "comprender" && (
        <div className="space-y-6">
          {/* Resumen Ejecutivo & Preguntas Clave */}
          <div className="hud-panel p-5 sm:p-6 border-l-4 border-l-amber space-y-4">
            <div className="flex items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
              <span className="uppercase tracking-wider flex items-center gap-1.5 text-amber">
                <Sparkles className="w-3.5 h-3.5" /> Síntesis Estratégica
              </span>
              <span>Lectura estimada: {tema.tiempoLecturaMin} min</span>
            </div>
            <p className="text-base sm:text-lg text-foreground leading-relaxed font-sans font-medium">
              {tema.resumenEjecutivo}
            </p>
            <div className="pt-2 border-t border-border/50">
              <span className="text-xs font-mono uppercase text-muted-foreground block mb-2 font-bold">
                Preguntas de Investigación que responde este dossier:
              </span>
              <ul className="space-y-1.5">
                {tema.preguntasClave.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-foreground/90">
                    <span className="text-amber font-mono font-bold">Q{idx + 1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Conceptos Esenciales */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono uppercase font-bold text-amber flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Glosario de Conceptos Esenciales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tema.conceptosEsenciales.map((c, i) => (
                <div key={i} className="hud-panel p-4 space-y-2 bg-secondary/20">
                  <span className="text-xs font-mono font-bold text-foreground block">{c.termino}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.definicion}</p>
                  <p className="text-[11px] font-mono text-amber/90 pt-1 border-t border-border/40">
                    <span className="text-muted-foreground">Contexto:</span> {c.contexto}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actores Clave */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono uppercase font-bold text-amber flex items-center gap-2">
              <Layers className="w-4 h-4" /> Actores Institucionales & Bloques Implicados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tema.actoresClave.map((a, i) => (
                <div key={i} className="hud-panel p-4 flex flex-col justify-between space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-foreground">{a.nombre}</h4>
                      <span className="text-[11px] text-muted-foreground block">{a.rol}</span>
                    </div>
                    {a.codigoIso && (
                      <Link
                        href={`/mundos/${a.codigoIso}`}
                        className="px-2 py-0.5 text-[10px] font-mono border border-border/80 rounded bg-secondary/50 text-amber hover:border-amber transition-colors"
                      >
                        {a.codigoIso} ↗
                      </Link>
                    )}
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{a.postura}</p>
                  <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-800/30">
                    Influencia: {a.influencia}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cronología de Hitos */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono uppercase font-bold text-amber flex items-center gap-2">
              <Clock className="w-4 h-4" /> Cronología Causal de Hitos Documentados
            </h3>
            <div className="hud-panel p-4 space-y-3">
              {tema.cronologia.map((h, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                  <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-amber-hud/20 text-amber border border-amber-hud/40 rounded shrink-0">
                    {h.fecha}
                  </span>
                  <div className="flex-1">
                    <span className="text-xs font-mono font-bold text-foreground block">{h.hito}</span>
                    <span className="text-[11px] text-muted-foreground">{h.impacto}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODO 2: INVESTIGAR (Indicadores Cuantitativos & Puntos Ciegos)
         ═══════════════════════════════════════════════════════════ */}
      {modo === "investigar" && (
        <div className="space-y-6">
          <div className="hud-panel p-4 bg-secondary/30">
            <div className="flex items-center gap-2 text-xs font-mono text-amber mb-1 font-bold">
              <Search className="w-4 h-4" /> Protocolo de Verificabilidad Empírica
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cada métrica de Vanguard se extrae directamente de fuentes institucionales primarias o tratados oficiales.
              No se presentan proyecciones sin declarar explícitamente el año de captura, el método de medición y las
              incertidumbres metodológicas.
            </p>
          </div>

          {/* Indicadores Empíricos */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono uppercase font-bold text-amber">
              Indicadores Cuantificables del Sistema ({tema.indicadoresEmpiricos.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tema.indicadoresEmpiricos.map((ind, i) => {
                const iconoTendencia =
                  ind.tendencia === "sube" ? (
                    <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                  ) : ind.tendencia === "baja" ? (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-amber" />
                  );

                return (
                  <div key={i} className="hud-panel p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-1 text-[11px] text-muted-foreground mb-1">
                        <span className="font-mono uppercase">{ind.periodo}</span>
                        <span className="flex items-center gap-1 font-mono uppercase text-[10px]">
                          {iconoTendencia} {ind.tendencia}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-foreground block mb-2">{ind.nombre}</span>
                      <div className="flex items-baseline gap-1.5 my-1">
                        <span className="text-2xl font-mono font-bold text-amber tracking-tight">{ind.valor}</span>
                        <span className="text-[11px] font-mono text-muted-foreground">{ind.unidad}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/40 space-y-1.5">
                      <p className="text-[11px] text-foreground/85 leading-snug">{ind.interpretacion}</p>
                      <div className="text-[10px] font-mono text-muted-foreground truncate">
                        Fuente: <span className="text-foreground">{ind.fuenteOficial}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Puntos Ciegos / Preguntas Abiertas */}
          <div className="hud-panel p-5 border-l-4 border-l-red-500 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase">
              <AlertCircle className="w-4 h-4" /> Puntos Ciegos e Incertidumbres Metodológicas
            </div>
            <p className="text-xs text-muted-foreground">
              Las mejores enciclopedias y medios de investigación del mundo no ocultan lo que desconocen: lo declaran de forma explícita.
            </p>
            <ul className="space-y-2 pt-1">
              {tema.puntosCiegos.map((pc, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                  <span className="text-red-400 font-mono font-bold">⚠</span>
                  <span>{pc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fuentes Metodológicas Primarias */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono uppercase font-bold text-amber">
              Documentos y Fuentes Primarias Indexadas
            </h3>
            <div className="hud-panel divide-y divide-border/40">
              {tema.fuentesMetodologicas.map((f, i) => (
                <div key={i} className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-foreground block">{f.publicacion}</span>
                    <span className="text-muted-foreground font-mono text-[11px]">
                      {f.institucion} · Año {f.anio}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded bg-secondary text-muted-foreground border border-border/50 shrink-0">
                    {f.tipo.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODO 3: VISUALIZAR (Cartografía Táctica & Nodos Críticos)
         ═══════════════════════════════════════════════════════════ */}
      {modo === "visualizar" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-mono uppercase font-bold text-amber flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Cartografía Geoestratégica del Tema
              </h3>
              <p className="text-xs text-muted-foreground">
                Haz clic en cualquier nodo del mapa o de la lista para inspeccionar sus coordenadas y función táctica.
              </p>
            </div>

            {/* Filtro de tipos de nodo */}
            <div className="flex items-center gap-1.5 overflow-x-auto thin-scroll">
              {(["todos", "chokepoint", "produccion", "infraestructura", "conflicto"] as const).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setFiltroTipoNodo(tipo)}
                  className={`px-2 py-1 text-[10px] font-mono uppercase rounded transition-colors ${
                    filtroTipoNodo === tipo
                      ? "bg-amber text-black font-bold"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {/* Lienzo Cartográfico SVG Responsivo */}
          <div className="hud-panel relative overflow-hidden bg-[#0a0f18] border-amber-hud/40 rounded-lg p-2">
            <div className="w-full aspect-[2/1] relative">
              <svg
                viewBox="0 0 800 400"
                className="w-full h-full select-none"
                style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}
              >
                <defs>
                  <pattern id="rejilla-mapa" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(245,158,11,0.08)" strokeWidth="0.8" />
                  </pattern>
                  <radialGradient id="halo-nodo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Fondo de rejilla y líneas geográficas de referencia */}
                <rect width="800" height="400" fill="url(#rejilla-mapa)" />
                {/* Ecuador */}
                <line x1="0" y1="200" x2="800" y2="200" stroke="rgba(56,189,248,0.2)" strokeDasharray="4 4" strokeWidth="1" />
                {/* Trópicos */}
                <line x1="0" y1="141" x2="800" y2="141" stroke="rgba(245,158,11,0.12)" strokeDasharray="2 4" strokeWidth="0.8" />
                <line x1="0" y1="259" x2="800" y2="259" stroke="rgba(245,158,11,0.12)" strokeDasharray="2 4" strokeWidth="0.8" />
                {/* Meridiano de Greenwich */}
                <line x1="400" y1="0" x2="400" y2="400" stroke="rgba(56,189,248,0.2)" strokeDasharray="4 4" strokeWidth="1" />

                {/* Siluetas continentales sintéticas de referencia */}
                <text x="390" y="25" fill="rgba(255,255,255,0.15)" fontSize="10" fontFamily="monospace">
                  0° MERIDIANO
                </text>
                <text x="15" y="195" fill="rgba(56,189,248,0.3)" fontSize="10" fontFamily="monospace">
                  ECUADOR 0°
                </text>

                {/* Renderizado de Nodos */}
                {nodosFiltrados.map((nodo) => {
                  const { x, y } = proyectarCoords(nodo.lat, nodo.lng);
                  const seleccionado = nodoSeleccionado?.id === nodo.id;

                  const colorNodo =
                    nodo.tipo === "chokepoint"
                      ? "#ef4444"
                      : nodo.tipo === "produccion"
                      ? "#10b981"
                      : nodo.tipo === "infraestructura"
                      ? "#38bdf8"
                      : nodo.tipo === "financiero"
                      ? "#eab308"
                      : "#f59e0b";

                  return (
                    <g
                      key={nodo.id}
                      onClick={() => setNodoSeleccionado(nodo)}
                      className="cursor-pointer group"
                    >
                      {/* Pulso animado si está seleccionado */}
                      {seleccionado && (
                        <circle cx={x} cy={y} r="18" fill="url(#halo-nodo)" className="animate-ping" opacity="0.4" />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={seleccionado ? "7" : "4.5"}
                        fill={colorNodo}
                        stroke="#ffffff"
                        strokeWidth={seleccionado ? "2" : "1"}
                        className="transition-all duration-200"
                      />
                      <text
                        x={x + 9}
                        y={y + 3}
                        fill={seleccionado ? "#ffffff" : "rgba(255,255,255,0.75)"}
                        fontSize={seleccionado ? "10" : "8"}
                        fontFamily="monospace"
                        fontWeight={seleccionado ? "bold" : "normal"}
                        className="pointer-events-none drop-shadow"
                      >
                        {nodo.nombre.split("(")[0].trim()}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Leyenda en esquina */}
              <div className="absolute bottom-2 left-2 bg-background/85 backdrop-blur p-2 rounded border border-border/50 text-[10px] font-mono space-y-1">
                <span className="text-muted-foreground block font-bold mb-1">CÓDIGO DE COLOR:</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Chokepoint
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Producción
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Infraestructura
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ficha del Nodo Seleccionado */}
          {nodoSeleccionado && (
            <div className="hud-panel p-4 bg-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-amber-hud/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-amber-hud/20 text-amber border border-amber-hud/40 rounded">
                    {nodoSeleccionado.tipo}
                  </span>
                  <h4 className="text-sm font-mono font-bold text-foreground">{nodoSeleccionado.nombre}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{nodoSeleccionado.relevancia}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                <div className="bg-background/80 px-3 py-1.5 rounded border border-border text-center">
                  <span className="text-[10px] text-muted-foreground block">COORDENADAS</span>
                  <span className="text-amber">
                    {nodoSeleccionado.lat.toFixed(3)}°, {nodoSeleccionado.lng.toFixed(3)}°
                  </span>
                </div>
                <Link
                  href={`/mapas?lat=${nodoSeleccionado.lat}&lng=${nodoSeleccionado.lng}&zoom=5`}
                  className="px-3 py-1.5 rounded bg-amber text-black font-bold uppercase text-[11px] flex items-center gap-1 hover:bg-amber/90 transition-colors"
                >
                  Ver en Globo ↗
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODO 4: COMPARAR (Matriz Multidimensional de Actores)
         ═══════════════════════════════════════════════════════════ */}
      {modo === "comparar" && (
        <div className="space-y-6">
          <div className="hud-panel p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber font-bold uppercase">
              <Scale className="w-4 h-4" /> Eje de Comparación Asimétrica
            </div>
            <h3 className="text-base font-bold text-foreground">{tema.comparativa.eje}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{tema.comparativa.descripcion}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Actor A */}
            <div className="hud-panel p-5 space-y-4 border-t-4 border-t-amber">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-mono font-bold text-foreground">{tema.comparativa.actorA.nombre}</h4>
                {tema.comparativa.actorA.iso && (
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-secondary rounded border border-border">
                    {tema.comparativa.actorA.iso}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {tema.comparativa.actorA.metricas.map((m, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">{m.k}</span>
                      <span className="text-amber font-bold">{m.v}</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber transition-all duration-500 rounded-full"
                        style={{ width: `${m.barra}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actor B */}
            <div className="hud-panel p-5 space-y-4 border-t-4 border-t-sky-400">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-mono font-bold text-foreground">{tema.comparativa.actorB.nombre}</h4>
                {tema.comparativa.actorB.iso && (
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-secondary rounded border border-border">
                    {tema.comparativa.actorB.iso}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {tema.comparativa.actorB.metricas.map((m, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">{m.k}</span>
                      <span className="text-sky-400 font-bold">{m.v}</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-400 transition-all duration-500 rounded-full"
                        style={{ width: `${m.barra}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Veredicto Analítico */}
          <div className="hud-panel p-4 bg-secondary/30 border-l-4 border-l-emerald-400 space-y-1">
            <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold block">
              Conclusión del Análisis Comparativo:
            </span>
            <p className="text-xs text-foreground/90 leading-relaxed font-medium">
              {tema.comparativa.veredictoAnalitico}
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODO 5: SIMULAR & RED (Puentes a Labs, Tools y Temas Hermanos)
         ═══════════════════════════════════════════════════════════ */}
      {modo === "simular" && (
        <div className="space-y-6">
          {/* Conexión con Laboratorios / Simuladores de /labs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase font-bold text-amber flex items-center gap-2">
                <FlaskConical className="w-4 h-4" /> Modelos de Simulación Interactiva en /labs
              </h3>
              <span className="text-xs font-mono text-muted-foreground">Motor determinista Vanguard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tema.conexionesVanguard.labsModelos.map((lab) => (
                <div key={lab.id} className="hud-panel p-4 flex flex-col justify-between space-y-3 hover:border-amber transition-colors">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-amber block">SIMULADOR COMPATIBLE</span>
                    <h4 className="text-sm font-mono font-bold text-foreground">{lab.titulo}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{lab.razon}</p>
                  </div>
                  <Link
                    href={`/labs/${lab.id}`}
                    className="w-full py-2 px-3 rounded bg-amber-hud/20 hover:bg-amber-hud/30 border border-amber-hud/50 text-amber font-mono text-xs uppercase font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Abrir Laboratorio <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Conexión con Vanguard Tools */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono uppercase font-bold text-amber flex items-center gap-2">
              <Layers className="w-4 h-4" /> Herramientas de Análisis Multivariable
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tema.conexionesVanguard.toolsAnalisis.map((tool) => (
                <div key={tool.id} className="hud-panel p-4 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-foreground">{tool.titulo}</h4>
                    <p className="text-xs text-muted-foreground">{tool.razon}</p>
                  </div>
                  <Link
                    href="/cuartel?tab=tools"
                    className="text-xs font-mono text-amber hover:underline flex items-center gap-1 pt-1"
                  >
                    Ejecutar en Cuartel Tools →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Módulos de Vanguard Relacionados */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono uppercase font-bold text-amber">
              Módulos del Ecosistema Relacionados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {tema.conexionesVanguard.modulosRelacionados.map((m, idx) => (
                <Link
                  key={idx}
                  href={m.href}
                  className="hud-panel p-3.5 block hover:border-amber transition-colors space-y-1"
                >
                  <span className="text-xs font-mono font-bold text-amber block">{m.label} ↗</span>
                  <p className="text-[11px] text-muted-foreground">{m.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Temas Hermanos en el Grafo Causal */}
          {tema.conexionesVanguard.temasHermanos.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-mono uppercase font-bold text-amber">
                Temas Hermanos en el Grafo Causal
              </h3>
              <div className="flex flex-wrap gap-2">
                {tema.conexionesVanguard.temasHermanos.map((hermanoId) => (
                  <Link
                    key={hermanoId}
                    href={`/investigacion/${hermanoId}`}
                    className="px-3 py-1.5 rounded border border-border/80 bg-secondary/40 hover:border-amber text-xs font-mono text-foreground hover:text-amber transition-colors flex items-center gap-1"
                  >
                    <span>{hermanoId.replace(/-/g, " ")}</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
