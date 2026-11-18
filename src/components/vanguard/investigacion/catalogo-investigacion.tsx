"use client";

// ═══════════════════════════════════════════════════════════════════
// VANGUARD INVESTIGACIÓN SISTÉMICA — CATÁLOGO CLIENTE
// Búsqueda en tiempo real, filtro por disciplina y fichas densas
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  MapPin,
  Scale,
  FlaskConical,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { TemaInvestigacion, CategoriaInvestigacion } from "@/lib/investigacion/tipos";
import { CATEGORIAS_CONFIG } from "@/lib/investigacion";

interface CatalogoInvestigacionProps {
  temas: TemaInvestigacion[];
}

export function CatalogoInvestigacion({ temas }: CatalogoInvestigacionProps) {
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaInvestigacion | "TODAS">("TODAS");
  const [busqueda, setBusqueda] = useState("");

  const filtrados = temas.filter((t) => {
    const coincideCat = categoriaActiva === "TODAS" || t.categoria === categoriaActiva;
    const q = busqueda.toLowerCase().trim();
    const coincideBusqueda =
      !q ||
      t.titulo.toLowerCase().includes(q) ||
      t.subtitulo.toLowerCase().includes(q) ||
      t.resumenEjecutivo.toLowerCase().includes(q) ||
      t.etiquetas.some((e) => e.toLowerCase().includes(q)) ||
      t.actoresClave.some((a) => a.nombre.toLowerCase().includes(q));

    return coincideCat && coincideBusqueda;
  });

  return (
    <div className="space-y-6">
      {/* ── BARRA DE BÚSQUEDA Y FILTRO POR CATEGORÍA ── */}
      <div className="space-y-3">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por tema, actor (ej: TSMC, ASML, Nilo, OCP), tecnología o chokepoint..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border/80 focus:border-amber-hud rounded-lg font-mono text-xs sm:text-sm text-foreground focus:outline-none transition-colors"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              LIMPIAR
            </button>
          )}
        </div>

        {/* Píldoras de Categoría */}
        <div className="flex items-center gap-1.5 overflow-x-auto thin-scroll pb-1">
          {CATEGORIAS_CONFIG.map((c) => {
            const activo = categoriaActiva === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategoriaActiva(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase font-bold shrink-0 transition-all ${
                  activo
                    ? "bg-amber text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/50 hover:border-border"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── REJILLA DE TARJETAS DE TEMAS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtrados.map((t) => {
          const badgeUrgencia =
            t.urgenciaSistemica === "CRITICA" ? (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-950/60 text-red-400 border border-red-800/60 rounded flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> CRÍTICO
              </span>
            ) : t.urgenciaSistemica === "ALTA" ? (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-950/60 text-amber border border-amber-800/60 rounded flex items-center gap-1">
                ALTO IMPACTO
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 rounded flex items-center gap-1">
                SISTÉMICO
              </span>
            );

          return (
            <article
              key={t.id}
              className="hud-panel p-5 flex flex-col justify-between space-y-4 hover:border-amber transition-all duration-200 group bg-card/60"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                    {t.categoria.replace("_", " & ")}
                  </span>
                  {badgeUrgencia}
                </div>

                <div>
                  <Link href={`/investigacion/${t.id}`}>
                    <h3 className="text-base sm:text-lg font-mono font-bold text-foreground group-hover:text-amber transition-colors leading-snug">
                      {t.titulo}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted-foreground font-sans mt-1 line-clamp-2">
                    {t.subtitulo}
                  </p>
                </div>

                {/* Etiquetas */}
                <div className="flex flex-wrap gap-1">
                  {t.etiquetas.slice(0, 4).map((et, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[10px] font-mono bg-secondary/50 text-foreground/80 rounded border border-border/40"
                    >
                      #{et}
                    </span>
                  ))}
                </div>

                {/* Métricas clave resumidas */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs font-mono">
                  <div className="bg-secondary/30 p-2 rounded">
                    <span className="text-[9px] uppercase text-muted-foreground block">MÉTRICA SISTÉMICA</span>
                    <span className="text-amber font-bold truncate block">
                      {t.indicadoresEmpiricos[0]?.valor} {t.indicadoresEmpiricos[0]?.unidad.split(" ")[0]}
                    </span>
                  </div>
                  <div className="bg-secondary/30 p-2 rounded">
                    <span className="text-[9px] uppercase text-muted-foreground block">FUENTE PRIMARIA</span>
                    <span className="text-foreground/90 font-medium truncate block">
                      {t.fuentesMetodologicas[0]?.institucion}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botonera de Acción */}
              <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1" title="Modelos de simulación en /labs">
                    <FlaskConical className="w-3.5 h-3.5 text-amber" />
                    {t.conexionesVanguard.labsModelos.length} Labs
                  </span>
                  <span className="flex items-center gap-1" title="Nodos en el mapa geoestratégico">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    {t.nodosGeograficos.length} Nodos
                  </span>
                </div>

                <Link
                  href={`/investigacion/${t.id}`}
                  className="px-3.5 py-1.5 rounded bg-amber text-black font-mono text-xs font-bold uppercase flex items-center gap-1 hover:bg-amber/90 transition-colors"
                >
                  Abrir Dossier <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {filtrados.length === 0 && (
        <div className="hud-panel p-8 text-center space-y-2">
          <p className="text-sm font-mono text-muted-foreground">
            No se encontraron temas para el término &quot;{busqueda}&quot; en la categoría seleccionada.
          </p>
          <button
            onClick={() => {
              setBusqueda("");
              setCategoriaActiva("TODAS");
            }}
            className="px-3 py-1 text-xs font-mono uppercase bg-amber text-black font-bold rounded"
          >
            Restablecer Filtros
          </button>
        </div>
      )}
    </div>
  );
}
