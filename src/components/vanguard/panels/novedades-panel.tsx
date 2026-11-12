"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Copy,
  Crown,
  ExternalLink,
  Layers,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { navigateTo } from "@/lib/nav";
import { HeroOro } from "@/components/vanguard/hero-oro";
import {
  FUNCIONES_EXPANSION_10,
  NOVEDADES_VANGUARD,
  type FuncionExpansionId,
} from "@/lib/vanguard-expansion-data";
import {
  RenderFuncionExpansion,
  iconoDeFuncion,
} from "@/components/vanguard/novedades/funciones-expansion";

export function NovedadesPanel({
  initialVista = "todo",
  initialFuncion = "comparador-fuerzas",
}: {
  initialVista?: "todo" | "novedades" | "funciones";
  initialFuncion?: FuncionExpansionId;
} = {}) {
  const [vista, setVista] = useState<"todo" | "novedades" | "funciones">(initialVista);
  const [funcionActiva, setFuncionActiva] = useState<FuncionExpansionId>(initialFuncion);
  const [filtro, setFiltro] = useState("");
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const q = filtro.trim().toLowerCase();
  const novedadesVisibles = NOVEDADES_VANGUARD.filter(
    (n) =>
      !q ||
      n.titulo.toLowerCase().includes(q) ||
      n.resumen.toLowerCase().includes(q) ||
      n.rutaDirecta.toLowerCase().includes(q)
  );
  const funcionesVisibles = FUNCIONES_EXPANSION_10.filter(
    (f) =>
      !q ||
      f.titulo.toLowerCase().includes(q) ||
      f.lema.toLowerCase().includes(q) ||
      f.categoria.toLowerCase().includes(q)
  );

  const funcionObj =
    FUNCIONES_EXPANSION_10.find((f) => f.id === funcionActiva) ?? FUNCIONES_EXPANSION_10[0];

  const copiarUrl = (id: string, ruta: string) => {
    const abs =
      typeof window !== "undefined" ? `${window.location.origin}${ruta}` : ruta;
    navigator.clipboard?.writeText(abs);
    setCopiadoId(id);
    toast.success(`Enlace copiado: ${ruta}`);
    setTimeout(() => setCopiadoId((prev) => (prev === id ? null : prev)), 1800);
  };

  return (
    <div className="space-y-5">
      <HeroOro panel="novedades" />

      {/* Barra maestra de navegación Lo Nuevo + Expansión 10X */}
      <div className="hud-panel border-[#FFC94D]/45 bg-gradient-to-r from-amber-hud/15 via-black/75 to-cyan-hud/10 p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded bg-[#FFC94D] text-black font-mono text-[10px] font-black tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> LO NUEVO · EXPANSIÓN 10X
            </span>
            <h2 className="font-mono text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
              REGISTRO DE NOVEDADES CON LINK DIRECTO + 10 FUNCIONES NUEVAS EN VIVO
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {(
              [
                { id: "todo", label: "VER TODO (LO NUEVO + 10X)" },
                { id: "novedades", label: `SOLO LO NUEVO (${NOVEDADES_VANGUARD.length})` },
                { id: "funciones", label: "10 FUNCIONES NUEVAS" },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVista(v.id)}
                className={cn(
                  "px-3 py-1.5 rounded font-bold transition-colors",
                  vista === v.id
                    ? "bg-[#FFC94D] text-black"
                    : "border border-white/15 text-muted-foreground hover:text-foreground"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
            <input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar novedades, módulos 3D/2D o cualquiera de las 10 funciones nuevas..."
              className="w-full pl-8 pr-3 py-1.5 rounded bg-black/65 border border-white/15 font-mono text-xs text-foreground"
            />
          </div>
          <Link
            href="/teatro-3d"
            className="px-3 py-1.5 rounded bg-[#FFC94D] text-black font-mono text-xs font-black hover:bg-[#ffd66b] flex items-center gap-1.5"
          >
            <Crown className="w-3.5 h-3.5" /> IR A #1 VANGUARD 3D (/teatro-3d)
          </Link>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* BLOQUE 1: PANEL DE LO NUEVO CON LINKS DIRECTOS                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {(vista === "todo" || vista === "novedades") && (
        <section className="space-y-3" aria-label="Lo nuevo agregado a VANGUARD">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-mono text-xs sm:text-sm font-bold text-amber uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" /> 1. LO NUEVO QUE SE HA AGREGADO A VANGUARD (LINKS DIRECTOS)
            </h3>
            <span className="font-mono text-[11px] text-muted-foreground">
              Clic en cualquier link directo para abrir la función al instante
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {novedadesVisibles.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "hud-panel p-4 flex flex-col justify-between gap-3",
                  n.destacado ? "border-[#FFC94D]/65 bg-amber-hud/10" : "border-white/15"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded font-black",
                        n.destacado ? "bg-[#FFC94D] text-black" : "bg-[#38BDF8] text-black"
                      )}
                    >
                      {n.etiqueta}
                    </span>
                    <span className="text-muted-foreground">{n.fecha}</span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground leading-snug">{n.titulo}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.resumen}</p>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="font-mono text-[10px] text-cyan-hud truncate">
                    Link directo:{" "}
                    <Link href={n.rutaDirecta} className="underline hover:text-foreground">
                      {n.rutaDirecta}
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    <Link
                      href={n.rutaDirecta}
                      className="px-3 py-1.5 rounded bg-[#FFC94D] text-black font-black hover:bg-[#ffd66b] flex items-center gap-1"
                    >
                      Abrir link directo <ExternalLink className="w-3 h-3" />
                    </Link>
                    {n.tabDestino && (
                      <button
                        type="button"
                        onClick={() => navigateTo(n.tabDestino!)}
                        className="px-2.5 py-1.5 rounded border border-cyan-hud/45 text-cyan-hud hover:bg-cyan-hud/15 font-bold"
                      >
                        Ver aquí
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => copiarUrl(n.id, n.rutaDirecta)}
                      className="px-2 py-1.5 rounded border border-white/15 text-muted-foreground hover:text-foreground flex items-center gap-1"
                      title="Copiar link directo"
                    >
                      {copiadoId === n.id ? <Check className="w-3 h-3 text-green-hud" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* BLOQUE 2: EXPANSIÓN 10X — 10 FUNCIONES NUEVAS INTERACTIVAS          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {(vista === "todo" || vista === "funciones") && (
        <section className="space-y-4" aria-label="10 funciones nuevas de expansión VANGUARD">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-mono text-xs sm:text-sm font-bold text-cyan-hud uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> 2. EXPANSIÓN VANGUARD — 10 FUNCIONES NUEVAS INTERACTIVAS
            </h3>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <Link
                href={funcionObj.rutaDirecta}
                className="text-amber underline hover:text-foreground flex items-center gap-1"
              >
                Link directo #{funcionObj.numero}: {funcionObj.rutaDirecta}
              </Link>
            </div>
          </div>

          {/* Parrilla selector de las 10 funciones nuevas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {funcionesVisibles.map((f) => {
              const Icon = iconoDeFuncion(f.id);
              const act = f.id === funcionObj.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFuncionActiva(f.id)}
                  className={cn(
                    "p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between gap-1.5",
                    act
                      ? "bg-[#FFC94D]/18 border-[#FFC94D] shadow-[0_0_16px_rgba(255,201,77,0.18)]"
                      : "bg-black/45 border-white/12 hover:border-white/30"
                  )}
                >
                  <div className="flex items-center justify-between gap-1 font-mono text-[10px]">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded font-black",
                        act ? "bg-[#FFC94D] text-black" : "bg-white/10 text-muted-foreground"
                      )}
                    >
                      {f.badge}
                    </span>
                    <Icon className={cn("w-3.5 h-3.5", act ? "text-amber" : "text-muted-foreground")} />
                  </div>
                  <div className={cn("font-mono text-xs font-bold leading-snug", act ? "text-amber" : "text-foreground")}>
                    {f.titulo}
                  </div>
                  <div className="text-[10px] text-muted-foreground line-clamp-2">{f.lema}</div>
                </button>
              );
            })}
          </div>

          {/* Consola en vivo de la función activa */}
          <div className="hud-panel p-4 border-[#FFC94D]/40 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#FFC94D] text-black font-black">
                    FUNCIÓN #{funcionObj.numero} DE 10
                  </span>
                  <span className="px-2 py-0.5 rounded border border-cyan-hud/45 text-cyan-hud font-bold">
                    {funcionObj.categoria}
                  </span>
                  <span className="text-muted-foreground">Fuentes: {funcionObj.fuenteDatos}</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-foreground">{funcionObj.titulo}</h4>
                <p className="text-xs text-muted-foreground">{funcionObj.descripcion}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 font-mono text-xs shrink-0">
                <Link
                  href={funcionObj.rutaDirecta}
                  className="px-3 py-1.5 rounded bg-[#38BDF8] text-black font-bold flex items-center gap-1"
                >
                  Abrir URL directa <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => copiarUrl(funcionObj.id, funcionObj.rutaDirecta)}
                  className="px-2.5 py-1.5 rounded border border-white/15 text-foreground hover:bg-white/10 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copiar
                </button>
              </div>
            </div>

            <RenderFuncionExpansion id={funcionObj.id} />
          </div>
        </section>
      )}
    </div>
  );
}
