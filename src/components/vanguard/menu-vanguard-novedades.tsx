"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Copy,
  Crown,
  ExternalLink,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { navigateTo } from "@/lib/nav";
import {
  FUNCIONES_EXPANSION_10,
  NOVEDADES_VANGUARD,
} from "@/lib/vanguard-expansion-data";
import { iconoDeFuncion } from "@/components/vanguard/novedades/funciones-expansion";

export function MenuVanguardNovedades({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const q = filtro.trim().toLowerCase();
  const novedades = NOVEDADES_VANGUARD.filter(
    (n) =>
      !q ||
      n.titulo.toLowerCase().includes(q) ||
      n.resumen.toLowerCase().includes(q) ||
      n.rutaDirecta.toLowerCase().includes(q)
  );
  const funciones = FUNCIONES_EXPANSION_10.filter(
    (f) =>
      !q ||
      f.titulo.toLowerCase().includes(q) ||
      f.lema.toLowerCase().includes(q) ||
      f.categoria.toLowerCase().includes(q)
  );

  const copiar = (ruta: string) => {
    const abs =
      typeof window !== "undefined" ? `${window.location.origin}${ruta}` : ruta;
    navigator.clipboard?.writeText(abs);
    toast.success(`Link copiado: ${ruta}`);
  };

  return (
    <div
      className="fixed inset-0 z-[75] bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Menú VANGUARD de Lo Nuevo y Expansión 10X"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl rounded-xl border border-[#FFC94D]/55 bg-[#070912] shadow-[0_0_50px_rgba(255,201,77,0.22)] overflow-hidden my-auto">
        {/* Cabecera del Menú VANGUARD */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-[#FFC94D]/18 via-black/75 to-cyan-950/35 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded bg-[#FFC94D] text-black font-mono text-[10px] font-black tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> MENÚ VANGUARD · LO NUEVO
              </span>
              <span className="font-mono text-[11px] text-cyan-hud font-bold">
                NOVEDADES + LINKS DIRECTOS + 10 FUNCIONES NUEVAS
              </span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-black text-foreground tracking-wide">
              TODO LO NUEVO EN VANGUARD · ACCESO DIRECTO AL INSTANTE
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/novedades"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#FFC94D] text-black font-mono text-xs font-black hover:bg-[#ffd66b] flex items-center gap-1"
            >
              Abrir Panel Completo /novedades <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú de novedades"
              className="w-8 h-8 rounded border border-white/20 text-foreground hover:bg-white/10 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Buscador rápido + Botones maestro */}
        <div className="p-3 sm:p-4 border-b border-white/10 flex flex-wrap items-center gap-2 bg-black/50">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
            <input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Filtrar novedades, links directos o las 10 funciones nuevas..."
              className="w-full pl-8 pr-3 py-1.5 rounded bg-black/75 border border-white/15 font-mono text-xs text-foreground"
            />
          </div>
          <Link
            href="/teatro-3d"
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-[#FFC94D]/60 text-amber font-mono text-xs font-bold hover:bg-amber-hud/15 flex items-center gap-1"
          >
            <Crown className="w-3.5 h-3.5" /> #1 TEATRO 3D/2D
          </Link>
          <Link
            href="/universo"
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-[#E879F9] text-black font-mono text-xs font-black hover:opacity-90"
          >
            THE DAILY UNIVERSE
          </Link>
          <button
            type="button"
            onClick={() => {
              navigateTo("novedades");
              onClose();
            }}
            className="px-3 py-1.5 rounded bg-[#38BDF8] text-black font-mono text-xs font-black flex items-center gap-1"
          >
            Abrir en Pestaña SPA <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Contenido scrollable: 2 columnas en escritorio */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[68vh] overflow-y-auto thin-scroll">
          {/* Columna 1: Lo nuevo agregado + link directo */}
          <div className="space-y-2.5">
            <div className="font-mono text-xs font-bold text-amber uppercase tracking-wider">
              LO NUEVO QUE SE HA AGREGADO ({novedades.length})
            </div>
            {novedades.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "p-3 rounded-lg border space-y-1.5",
                  n.destacado
                    ? "border-[#FFC94D]/55 bg-amber-hud/10"
                    : "border-white/12 bg-black/45"
                )}
              >
                <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded font-black",
                      n.destacado ? "bg-[#FFC94D] text-black" : "bg-[#38BDF8] text-black"
                    )}
                  >
                    {n.etiqueta}
                  </span>
                  <Link
                    href={n.rutaDirecta}
                    onClick={onClose}
                    className="text-cyan-hud underline hover:text-foreground truncate"
                  >
                    {n.rutaDirecta}
                  </Link>
                </div>
                <div className="text-xs font-bold text-foreground">{n.titulo}</div>
                <p className="text-[11px] text-muted-foreground leading-snug">{n.resumen}</p>
                <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[10px]">
                  <Link
                    href={n.rutaDirecta}
                    onClick={onClose}
                    className="px-2.5 py-1 rounded bg-[#FFC94D] text-black font-black flex items-center gap-1"
                  >
                    Ver ahora <ExternalLink className="w-3 h-3" />
                  </Link>
                  {n.tabDestino && (
                    <button
                      type="button"
                      onClick={() => {
                        navigateTo(n.tabDestino!);
                        onClose();
                      }}
                      className="px-2 py-1 rounded border border-white/15 text-foreground hover:bg-white/10"
                    >
                      Sala SPA
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => copiar(n.rutaDirecta)}
                    className="px-2 py-1 rounded border border-white/15 text-muted-foreground hover:text-foreground"
                    title="Copiar link"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Columna 2: Las 10 funciones nuevas con acceso directo */}
          <div className="space-y-2.5">
            <div className="font-mono text-xs font-bold text-cyan-hud uppercase tracking-wider">
              EXPANSIÓN 10X — 10 FUNCIONES NUEVAS ({funciones.length})
            </div>
            {funciones.map((f) => {
              const Icon = iconoDeFuncion(f.id);
              return (
                <div
                  key={f.id}
                  className="p-3 rounded-lg border border-white/12 bg-black/45 hover:border-cyan-hud/45 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-[#FFC94D] text-black font-black flex items-center gap-1">
                      <Icon className="w-3 h-3" /> {f.badge}
                    </span>
                    <span className="text-cyan-hud">{f.categoria}</span>
                  </div>
                  <div className="text-xs font-bold text-foreground">{f.titulo}</div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{f.lema}</p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono text-[10px]">
                    <Link
                      href={f.rutaDirecta}
                      onClick={onClose}
                      className="px-2.5 py-1 rounded bg-[#38BDF8] text-black font-black flex items-center gap-1"
                    >
                      Abrir función <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link
                      href={f.rutaDirecta}
                      onClick={onClose}
                      className="text-muted-foreground underline hover:text-foreground truncate"
                    >
                      {f.rutaDirecta}
                    </Link>
                    <button
                      type="button"
                      onClick={() => copiar(f.rutaDirecta)}
                      className="ml-auto px-2 py-1 rounded border border-white/15 text-muted-foreground hover:text-foreground"
                      title="Copiar link directo"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
