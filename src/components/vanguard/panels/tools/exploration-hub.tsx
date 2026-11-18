"use client";

// ============================================================
// VANGUARD TOOLS — MÓDULO DE EXPLORACIÓN PROFUNDA
// v406.7 Buscador Omnibar, Ciudades, Organizaciones, Infraestructura y Alianzas
// ============================================================

import React, { useState, useMemo } from "react";
import {
  Search,
  Building2,
  Network,
  Radio,
  ShieldCheck,
  Globe,
  ExternalLink,
  Anchor,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Compass,
} from "lucide-react";
import { PAISES_DOSSIERS } from "@/lib/paises-data";
import {
  CIUDADES_ESTRATEGICAS,
  ORGANIZACIONES_MUNDIALES,
  INFRAESTRUCTURAS_CRITICAS,
  ALIANZAS_TRATADOS,
  INDICADORES_MUNDIALES,
} from "@/lib/tools/data-indicators";

export function ExplorationHub({
  activeTool,
  onNavigateTab,
}: {
  activeTool: string;
  onNavigateTab?: (tab: string) => void;
}) {
  // ------------------------------------------------------------
  // Estado para Buscador Mundial Omnibar
  // ------------------------------------------------------------
  const [omnibarQuery, setOmnibarQuery] = useState("");
  const [omnibarFilter, setOmnibarFilter] = useState<"todos" | "paises" | "ciudades" | "orgs" | "infra">("todos");

  const omnibarResults = useMemo(() => {
    const q = omnibarQuery.toLowerCase().trim();
    if (!q) return [];

    const results: Array<{
      id: string;
      title: string;
      category: "País" | "Ciudad" | "Organización" | "Infraestructura" | "Indicador";
      subtitle: string;
      meta: string;
      actionType: string;
    }> = [];

    // Países
    if (omnibarFilter === "todos" || omnibarFilter === "paises") {
      PAISES_DOSSIERS.forEach((p) => {
        if (p.nombre.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.bloque.toLowerCase().includes(q)) {
          results.push({
            id: p.id,
            title: p.nombre,
            category: "País",
            subtitle: `Bloque: ${p.bloque} · PIB: $${p.pibNominalBillionUsd}B`,
            meta: `Ejército: ${p.efectivosActivos}k tropas`,
            actionType: "atlas",
          });
        }
      });
    }

    // Ciudades
    if (omnibarFilter === "todos" || omnibarFilter === "ciudades") {
      CIUDADES_ESTRATEGICAS.forEach((c) => {
        if (c.nombre.toLowerCase().includes(q) || c.paisNombre.toLowerCase().includes(q) || c.rolEstrategico.toLowerCase().includes(q)) {
          results.push({
            id: c.id,
            title: `${c.nombre} (${c.paisNombre})`,
            category: "Ciudad",
            subtitle: c.rolEstrategico,
            meta: `${c.poblacionMetroM}M hab · PIB: $${c.pibBillionUsd}B`,
            actionType: "ciudad",
          });
        }
      });
    }

    // Organizaciones
    if (omnibarFilter === "todos" || omnibarFilter === "orgs") {
      ORGANIZACIONES_MUNDIALES.forEach((org) => {
        if (org.siglas.toLowerCase().includes(q) || org.nombre.toLowerCase().includes(q)) {
          results.push({
            id: org.id,
            title: `${org.siglas} — ${org.nombre}`,
            category: "Organización",
            subtitle: org.objetivoPrincipal,
            meta: `${org.paisesMiembrosCount} miembros · Sede: ${org.sede}`,
            actionType: "org",
          });
        }
      });
    }

    // Infraestructura
    if (omnibarFilter === "todos" || omnibarFilter === "infra") {
      INFRAESTRUCTURAS_CRITICAS.forEach((inf) => {
        if (inf.nombre.toLowerCase().includes(q) || inf.tipo.toLowerCase().includes(q) || inf.ubicacion.toLowerCase().includes(q)) {
          results.push({
            id: inf.id,
            title: inf.nombre,
            category: "Infraestructura",
            subtitle: inf.ubicacion,
            meta: `Riesgo: ${inf.vulnerabilidadNivel} · Capacidad: ${inf.capacidad}`,
            actionType: "infra",
          });
        }
      });
    }

    return results.slice(0, 15);
  }, [omnibarQuery, omnibarFilter]);

  // ------------------------------------------------------------
  // Estado para Matriz de Alianzas y Tratados
  // ------------------------------------------------------------
  const [paisAId, setPaisAId] = useState("US");
  const [paisBId, setPaisBId] = useState("JP");

  const alianzaStatus = useMemo(() => {
    const pA = PAISES_DOSSIERS.find((p) => p.id === paisAId);
    const pB = PAISES_DOSSIERS.find((p) => p.id === paisBId);
    if (!pA || !pB) return null;

    const mutualTreaties = ALIANZAS_TRATADOS.filter(
      (t) => t.paisesMiembros.includes(paisAId) && t.paisesMiembros.includes(paisBId)
    );

    const mutualDefense = mutualTreaties.some((t) => t.clausulaDefensa);
    const isRival =
      (pA.bloque === "OTAN" && pB.bloque === "BRICS+") ||
      (pA.bloque === "BRICS+" && pB.bloque === "OTAN") ||
      (pA.bloque === "AUKUS" && pB.bloque === "BRICS+");

    return {
      paisA: pA,
      paisB: pB,
      mutualTreaties,
      mutualDefense,
      isRival,
    };
  }, [paisAId, paisBId]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* --------------------------------------------------------
          1. BUSCADOR MUNDIAL OMNIBAR
      -------------------------------------------------------- */}
      {(activeTool === "buscador-mundial" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider uppercase mb-1">
            <Search className="w-4 h-4" />
            <span>Motor de Exploración Unificada</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Buscador Mundial Omnibar
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Localiza al instante naciones, megapuertos, organizaciones, cables submarinos y tratados vigentes.
          </p>

          <div className="bg-slate-950 p-4 md:p-6 rounded-xl border border-slate-800">
            {/* Input del Omnibar */}
            <div className="relative mb-4">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre de país, estrecho, sigla (OTAN, BRICS) o infraestructura..."
                value={omnibarQuery}
                onChange={(e) => setOmnibarQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-750 text-white rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-cyan-500 shadow-inner"
              />
              {omnibarQuery && (
                <button
                  onClick={() => setOmnibarQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-white"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Filtros de Categoría */}
            <div className="flex flex-wrap gap-2 mb-4 text-xs font-mono">
              {[
                { id: "todos", label: "Todo" },
                { id: "paises", label: "Países" },
                { id: "ciudades", label: "Megaciudades & Puertos" },
                { id: "orgs", label: "Organizaciones" },
                { id: "infra", label: "Infraestructuras" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOmnibarFilter(f.id as any)}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    omnibarFilter === f.id
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Resultados Dinámicos */}
            {omnibarQuery.trim() ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {omnibarResults.length > 0 ? (
                  omnibarResults.map((res, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-cyan-500/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-white">{res.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 uppercase">
                            {res.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{res.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-300">{res.meta}</span>
                        {onNavigateTab && (
                          <button
                            onClick={() => onNavigateTab("enciclopedia")}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs rounded font-mono flex items-center gap-1"
                          >
                            <span>Dossier</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 font-mono">
                    No se encontraron registros coincidentes con &quot;{omnibarQuery}&quot;.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-900/40 rounded border border-dashed border-slate-800 text-center text-xs text-slate-400 font-mono">
                Introduce un término para activar el rastreo simultáneo en todas las bases de datos de Vanguard.
              </div>
            )}
          </div>
        </section>
      )}

      {/* --------------------------------------------------------
          2. EXPLORADOR DE MEGACIUDADES & PUERTOS
      -------------------------------------------------------- */}
      {(activeTool === "explorador-ciudades" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs tracking-wider uppercase mb-1">
            <Building2 className="w-4 h-4" />
            <span>Nodos Urbanos & Logísticos</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Explorador de Megaciudades & Megapuertos
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Análisis de las metrópolis y complejos portuarios que concentran el tráfico mercante, capital y toma de decisiones.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CIUDADES_ESTRATEGICAS.map((c) => (
              <div
                key={c.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-indigo-400 uppercase font-bold">
                      {c.paisNombre}
                    </span>
                    <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono">
                      {c.lat.toFixed(1)}°, {c.lng.toFixed(1)}°
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{c.nombre}</h3>
                  <span className="text-[11px] text-slate-400 font-medium block mb-3">
                    {c.rolEstrategico}
                  </span>

                  <div className="space-y-1.5 text-xs font-mono border-t border-slate-800/80 pt-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Población:</span>
                      <span className="text-white">{c.poblacionMetroM} M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">PIB Urbano:</span>
                      <span className="text-cyan-400">${c.pibBillionUsd} B</span>
                    </div>
                    {c.puertoTraficoTeuM !== undefined && c.puertoTraficoTeuM > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Tráfico TEUs:</span>
                        <span className="text-emerald-400 font-bold">{c.puertoTraficoTeuM}M TEU/año</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 border-t border-slate-900 pt-2">
                  <span className="font-bold text-slate-300 block mb-1">Hito Central:</span>
                  {c.hitosEstrategicos[0]}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --------------------------------------------------------
          3. EXPLORADOR DE ORGANIZACIONES MUNDIALES
      -------------------------------------------------------- */}
      {(activeTool === "explorador-organizaciones" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-violet-400 font-mono text-xs tracking-wider uppercase mb-1">
            <Network className="w-4 h-4" />
            <span>Módulo Institucional Multilateral</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Explorador de Organizaciones Internacionales
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Estructuras decisorias, derecho de veto, presupuestos y peso geopolítico de los principales organismos del planeta.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ORGANIZACIONES_MUNDIALES.map((org) => (
              <div
                key={org.id}
                className="bg-slate-950 p-5 rounded-xl border border-slate-800 hover:border-violet-500/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold font-mono text-violet-400">{org.siglas}</span>
                  <span className="text-xs font-mono text-slate-400">Fundada en {org.fundacion}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{org.nombre}</h3>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">{org.objetivoPrincipal}</p>

                <div className="space-y-2 text-xs font-mono border-t border-slate-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Sede Central:</span>
                    <span className="text-slate-200">{org.sede}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Estados Miembros:</span>
                    <span className="text-cyan-400 font-bold">{org.paisesMiembrosCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Poder de Veto:</span>
                    <span className={org.capacidadVeto ? "text-amber-400 font-bold" : "text-slate-500"}>
                      {org.capacidadVeto ? "Presente" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Presupuesto Anual:</span>
                    <span className="text-emerald-400 font-bold">${org.presupuestoAnualBillionUsd} B USD</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-300 block mb-0.5">Tratado Base:</span>
                  <span>{org.tratadoFundacional}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --------------------------------------------------------
          4. EXPLORADOR DE INFRAESTRUCTURAS CRÍTICAS
      -------------------------------------------------------- */}
      {(activeTool === "explorador-infraestructura" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs tracking-wider uppercase mb-1">
            <Radio className="w-4 h-4" />
            <span>Infraestructura Estratégica Física</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Explorador de Infraestructuras Críticas
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Arterias físicas del mundo contemporáneo: cables de fibra óptica submarinos, gasoductos y complejos nucleares.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INFRAESTRUCTURAS_CRITICAS.map((inf) => {
              const riskColor =
                inf.vulnerabilidadNivel === "Crítico"
                  ? "border-red-500/60 text-red-400 bg-red-950/20"
                  : "border-amber-500/60 text-amber-400 bg-amber-950/20";
              return (
                <div
                  key={inf.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
                      {inf.tipo.replace("-", " ")}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${riskColor}`}>
                      Riesgo {inf.vulnerabilidadNivel}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{inf.nombre}</h3>
                  <span className="text-xs text-slate-400 block mb-2">{inf.ubicacion}</span>

                  <div className="p-2.5 bg-slate-900 rounded text-xs space-y-1 mb-2 font-mono">
                    <div className="text-slate-300">
                      <span className="text-slate-400 font-sans">Capacidad: </span>
                      {inf.capacidad}
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-400 font-sans">Operadores: </span>
                      {inf.operadorPaises.join(", ")}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 border-t border-slate-900 pt-2">
                    <span className="font-bold text-red-400 block mb-0.5">Impacto en caso de sabotaje o falla:</span>
                    {inf.impactoSiFalla}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* --------------------------------------------------------
          5. MATRIZ DE ALIANZAS Y TRATADOS
      -------------------------------------------------------- */}
      {(activeTool === "matriz-alianzas" || activeTool === "todos") && (
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Matriz de Compatibilidad Bilateral</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
            Matriz de Alianzas, Tratados & Fricción Diplomática
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Selecciona cualquier par de naciones para comprobar si comparten tratados de defensa mutua o se encuentran en rivalidad estructural.
          </p>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
            {/* Selectores A y B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                  País A:
                </label>
                <select
                  value={paisAId}
                  onChange={(e) => setPaisAId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 text-white rounded p-2.5 text-xs"
                >
                  {PAISES_DOSSIERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.bloque})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                  País B:
                </label>
                <select
                  value={paisBId}
                  onChange={(e) => setPaisBId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 text-white rounded p-2.5 text-xs"
                >
                  {PAISES_DOSSIERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.bloque})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resultado de la Matriz */}
            {alianzaStatus && (
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="text-xs text-slate-300">
                    Evaluando relación: <strong className="text-white">{alianzaStatus.paisA.nombre}</strong> ↔{" "}
                    <strong className="text-white">{alianzaStatus.paisB.nombre}</strong>
                  </div>
                  {alianzaStatus.mutualDefense ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aliados de Defensa Mutua</span>
                    </span>
                  ) : alianzaStatus.isRival ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-950/40 px-2.5 py-1 rounded border border-red-500/40">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Rivalidad Bloque-a-Bloque</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
                      <span>Relación Bilateral No Alineada</span>
                    </span>
                  )}
                </div>

                {/* Tratados Compartidos */}
                <div>
                  <span className="text-xs font-bold text-slate-300 block mb-1">
                    Tratados y Alianzas en Común:
                  </span>
                  {alianzaStatus.mutualTreaties.length > 0 ? (
                    <div className="space-y-1.5">
                      {alianzaStatus.mutualTreaties.map((t) => (
                        <div
                          key={t.id}
                          className="p-2 bg-slate-950 rounded text-xs text-slate-200 border border-slate-800 flex items-center justify-between"
                        >
                          <span>{t.nombre}</span>
                          <span className="text-[10px] font-mono text-cyan-400">
                            {t.tipo} {t.clausulaDefensa && "· Art. Defensa Activa"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      No existen tratados de defensa mutua vinculantes entre ambas naciones.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
