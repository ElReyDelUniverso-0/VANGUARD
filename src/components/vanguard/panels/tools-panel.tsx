"use client";

// ============================================================
// VANGUARD TOOLS — MASTER PANEL SUITE OPERATIVA
// v406.7 Análisis, Creación, Exploración, Centros Interactivos y Workspace
// ============================================================

import React, { useState, useEffect } from "react";
import {
  Wrench,
  Scale,
  MapPin,
  Search,
  LayoutGrid,
  FolderKanban,
  Sparkles,
  Sliders,
  FileText,
  Calculator,
  Globe2,
  Users,
  TestTube2,
  Layers,
  ArrowRight,
  ChevronRight,
  Shield,
  Activity,
} from "lucide-react";
import { TOOLS_CATALOG } from "@/lib/tools/data-indicators";
import { ToolCategory, ToolId } from "@/lib/tools/types";
import { AnalysisHub } from "./tools/analysis-hub";
import { CreationHub } from "./tools/creation-hub";
import { ExplorationHub } from "./tools/exploration-hub";
import { InteractiveCenters } from "./tools/interactive-centers";
import { WorkspaceHub } from "./tools/workspace-hub";

export function ToolsPanel() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "todos">("todos");
  const [activeSubTool, setActiveSubTool] = useState<string>("comparador-paises");
  const [searchFilter, setSearchFilter] = useState("");

  // Manejo de navegación intermodular
  const handleNavigateTab = (tabKey: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("vanguard:navigate", {
          detail: { tab: tabKey },
        })
      );
    }
  };

  const filteredTools = TOOLS_CATALOG.filter((t) => {
    const matchesCat = activeCategory === "todos" || t.category === activeCategory;
    const matchesQuery =
      !searchFilter ||
      t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.keywords.some((k) => k.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
      {/* --------------------------------------------------------
          CABECERA TÁCTICA HUD
      -------------------------------------------------------- */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Vanguard Strategic Instrument Suite · v406.7</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Wrench className="w-8 h-8 text-cyan-400" />
              <span>VANGUARD TOOLS</span>
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-3xl mt-1.5">
              Instrumentos funcionales de acción: compara potencias, diseña mapas vectoriales y cronologías,
              simula shocks en cadenas de suministro y gestiona tu propio centro de investigación.
            </p>
          </div>

          {/* Métricas del Sistema */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 shrink-0 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Herramientas</span>
              <span className="text-cyan-400 font-bold text-sm">21 Instrumentos</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Persistencia</span>
              <span className="text-emerald-400 font-bold text-sm">LocalStorage Activo</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Modo Operativo</span>
              <span className="text-amber-400 font-bold text-sm">Live Sandbox</span>
            </div>
          </div>
        </div>

        {/* Barra de Filtros por Categoría */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-850">
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {[
              { id: "todos", label: "Todas las Herramientas", icon: Wrench },
              { id: "analisis", label: "1. Análisis", icon: Scale },
              { id: "creacion", label: "2. Creación", icon: MapPin },
              { id: "exploracion", label: "3. Exploración", icon: Search },
              { id: "centros", label: "4. Centros Interactivos", icon: LayoutGrid },
              { id: "workspace", label: "5. Mi Workspace", icon: FolderKanban },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id as any);
                    if (cat.id === "analisis") setActiveSubTool("comparador-paises");
                    if (cat.id === "creacion") setActiveSubTool("constructor-mapas");
                    if (cat.id === "exploracion") setActiveSubTool("buscador-mundial");
                    if (cat.id === "centros") setActiveSubTool("sala-analisis");
                    if (cat.id === "workspace") setActiveSubTool("mi-workspace");
                  }}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                      : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Buscador Rápido de Herramientas */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filtrar herramienta..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-slate-900 border border-slate-750 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>
        </div>

        {/* Carrusel de Acceso Rápido a Herramientas */}
        <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
          {filteredTools.map((t) => {
            const isSubActive = activeSubTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveSubTool(t.id);
                  if (t.category !== activeCategory && activeCategory !== "todos") {
                    setActiveCategory(t.category);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all flex items-center gap-2 border ${
                  isSubActive
                    ? "bg-slate-800 border-cyan-400 text-cyan-300 font-bold shadow-md shadow-cyan-500/10"
                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <span>{t.name}</span>
                {t.badge && (
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------
          CONTENEDOR PRINCIPAL DE COMPONENTES
      -------------------------------------------------------- */}
      <main className="space-y-10">
        {/* Hub 1: Análisis */}
        {(activeCategory === "todos" || activeCategory === "analisis") && (
          <AnalysisHub activeTool={activeSubTool} />
        )}

        {/* Hub 2: Creación */}
        {(activeCategory === "todos" || activeCategory === "creacion") && (
          <CreationHub activeTool={activeSubTool} />
        )}

        {/* Hub 3: Exploración */}
        {(activeCategory === "todos" || activeCategory === "exploracion") && (
          <ExplorationHub activeTool={activeSubTool} onNavigateTab={handleNavigateTab} />
        )}

        {/* Hub 4: Centros Interactivos */}
        {(activeCategory === "todos" || activeCategory === "centros") && (
          <InteractiveCenters activeTool={activeSubTool} />
        )}

        {/* Hub 5: Mi Workspace */}
        {(activeCategory === "todos" || activeCategory === "workspace") && (
          <WorkspaceHub onSelectTool={(toolId) => setActiveSubTool(toolId)} />
        )}
      </main>

      {/* --------------------------------------------------------
          PIE DE PÁGINA Y CONEXIONES INTERMODULARES
      -------------------------------------------------------- */}
      <footer className="pt-8 border-t border-slate-850 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Vanguard Instruments Core · Integrado con Atlas, Enciclopedia y Simulador de Crisis</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNavigateTab("atlas")}
            className="hover:text-cyan-400 transition-colors"
          >
            Atlas Mundial →
          </button>
          <button
            onClick={() => handleNavigateTab("enciclopedia")}
            className="hover:text-cyan-400 transition-colors"
          >
            Enciclopedia Global →
          </button>
          <button
            onClick={() => handleNavigateTab("simulador")}
            className="hover:text-cyan-400 transition-colors"
          >
            Simulador de Guerra →
          </button>
        </div>
      </footer>
    </div>
  );
}
