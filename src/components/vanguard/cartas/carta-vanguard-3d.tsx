"use client";

import { useRef, useState } from "react";
import { Award, CheckCircle2, Lock, Sparkles, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const RANGO_NIVEL: Record<
  number,
  { nombre: string; borde: string; badgeBg: string; brillo: string }
> = {
  1: {
    nombre: "BRONCE",
    borde: "rgba(180,120,70,0.55)",
    badgeBg: "linear-gradient(135deg,#9a6337,#5d3a1f)",
    brillo: "rgba(180,120,70,0.18)",
  },
  2: {
    nombre: "PLATA",
    borde: "rgba(203,213,225,0.65)",
    badgeBg: "linear-gradient(135deg,#cbd5e1,#64748b)",
    brillo: "rgba(203,213,225,0.24)",
  },
  3: {
    nombre: "ORO",
    borde: "rgba(255,201,77,0.85)",
    badgeBg: "linear-gradient(135deg,#FFC94D,#b45309)",
    brillo: "rgba(255,201,77,0.34)",
  },
  4: {
    nombre: "PLATINO",
    borde: "rgba(56,189,248,0.9)",
    badgeBg: "linear-gradient(135deg,#38BDF8,#1d4ed8)",
    brillo: "rgba(56,189,248,0.38)",
  },
  5: {
    nombre: "PRISMÁTICA",
    borde: "rgba(232,121,249,0.95)",
    badgeBg: "linear-gradient(135deg,#FFC94D,#E879F9,#38BDF8)",
    brillo: "rgba(232,121,249,0.45)",
  },
};

export interface CartaVanguard3DProps {
  serie: string;
  titulo: string;
  subtitulo: string;
  categoriaLabel: string;
  rarezaLabel: string;
  rarezaHex: string;
  resumen: string;
  pieMeta?: string;
  nivel?: number;
  desbloqueada?: boolean;
  estudiada?: boolean;
  enVitrina?: boolean;
  costoDesbloqueoVC?: number;
  onClick?: () => void;
  onMejorar?: () => void;
  onVitrina?: () => void;
  onAccionExtra?: { label: string; fn: () => void };
}

export function CartaVanguard3D({
  serie,
  titulo,
  subtitulo,
  categoriaLabel,
  rarezaLabel,
  rarezaHex,
  resumen,
  pieMeta,
  nivel = 1,
  desbloqueada = true,
  estudiada = false,
  enVitrina = false,
  costoDesbloqueoVC,
  onClick,
  onMejorar,
  onVitrina,
  onAccionExtra,
}: CartaVanguard3DProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 35, hover: false });
  const nivelClamped = Math.max(1, Math.min(5, nivel));
  const rango = RANGO_NIVEL[nivelClamped] ?? RANGO_NIVEL[1];

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / Math.max(1, rect.width);
    const y = (e.clientY - rect.top) / Math.max(1, rect.height);
    const ry = (x - 0.5) * 14;
    const rx = (0.5 - y) * 12;
    setTilt({ rx, ry, mx: Math.round(x * 100), my: Math.round(y * 100), hover: true });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0, mx: 50, my: 35, hover: false });

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
      className={cn(
        "vg-carta-3d relative rounded-xl border p-4 flex flex-col justify-between gap-3 overflow-hidden select-none",
        desbloqueada ? "bg-[#090d18]" : "bg-[#06080f]/80 opacity-85"
      )}
      style={{
        borderColor: desbloqueada ? rango.borde : "rgba(255,255,255,0.14)",
        boxShadow: tilt.hover && desbloqueada
          ? `0 16px 34px -10px ${rango.brillo}, 0 0 0 1px ${rarezaHex}55`
          : `0 6px 20px -8px ${desbloqueada ? rango.brillo : "rgba(0,0,0,0.6)"}`,
        transform: tilt.hover
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-2px)`
          : "perspective(900px) rotateX(0deg) rotateY(0deg)",
      }}
    >
      {/* Capa holográfica interactiva */}
      {desbloqueada && (
        <div
          aria-hidden
          className="vg-carta-foil pointer-events-none absolute inset-0 opacity-80"
          style={
            {
              "--mx": `${tilt.mx}%`,
              "--my": `${tilt.my}%`,
            } as React.CSSProperties
          }
        />
      )}

      {/* Marco interior tipo carta coleccionable */}
      <div className="relative z-10 space-y-2.5">
        <div className="flex items-center justify-between gap-1.5 font-mono text-[10px]">
          <span
            className="px-2 py-0.5 rounded font-black text-black tracking-wider"
            style={{ background: rarezaHex }}
          >
            {rarezaLabel}
          </span>
          <span className="text-muted-foreground font-bold">{serie}</span>
          {desbloqueada ? (
            <span
              className="px-2 py-0.5 rounded font-black text-white shadow-sm"
              style={{ background: rango.badgeBg }}
            >
              NV.{nivelClamped} · {rango.nombre}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-white/10 text-muted-foreground flex items-center gap-1">
              <Lock className="w-3 h-3" /> SELLADA
            </span>
          )}
        </div>

        {/* Barra de estrellas/nivel visual */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-hud">
            {categoriaLabel}
          </span>
          <div className="flex items-center gap-0.5" aria-label={`Nivel ${nivelClamped} de 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className="w-3.5 h-1.5 rounded-sm transition-colors"
                style={{
                  background:
                    desbloqueada && n <= nivelClamped
                      ? nivelClamped === 5
                        ? "#E879F9"
                        : rarezaHex
                      : "rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Título + Subtítulo */}
        <div>
          <h4 className="font-display text-sm sm:text-base font-black tracking-wide text-foreground leading-snug">
            {titulo}
          </h4>
          <div className="font-mono text-[11px] text-amber/90">{subtitulo}</div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{resumen}</p>
        {pieMeta && (
          <div className="font-mono text-[10px] text-slate-400 border-t border-white/10 pt-1.5 truncate">
            {pieMeta}
          </div>
        )}
      </div>

      {/* Sellos + Botones de acción */}
      <div className="relative z-10 pt-2 border-t border-white/10 space-y-2">
        {(estudiada || enVitrina) && (
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
            {estudiada && (
              <span className="px-1.5 py-0.5 rounded bg-green-hud/15 border border-green-hud/45 text-green-hud flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ESTUDIADA
              </span>
            )}
            {enVitrina && (
              <span className="px-1.5 py-0.5 rounded bg-[#FFC94D]/18 border border-[#FFC94D]/55 text-amber flex items-center gap-1">
                <Star className="w-3 h-3" /> EN VITRINA
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
          {onClick && (
            <button
              type="button"
              onClick={onClick}
              className={cn(
                "px-2.5 py-1.5 rounded font-black flex items-center gap-1 transition-colors",
                desbloqueada
                  ? "bg-[#FFC94D] text-black hover:bg-[#ffd66b]"
                  : "bg-[#38BDF8] text-black hover:opacity-90"
              )}
            >
              {desbloqueada ? (
                <>
                  <Sparkles className="w-3 h-3" /> Abrir / Estudiar
                </>
              ) : (
                <>
                  <Award className="w-3 h-3" />{" "}
                  {costoDesbloqueoVC && costoDesbloqueoVC > 0
                    ? `Desbloquear (${costoDesbloqueoVC} VC)`
                    : "Desbloquear Gratis"}
                </>
              )}
            </button>
          )}

          {desbloqueada && onMejorar && nivelClamped < 5 && (
            <button
              type="button"
              onClick={onMejorar}
              className="px-2.5 py-1.5 rounded border border-cyan-hud/50 text-cyan-hud hover:bg-cyan-hud/15 font-bold flex items-center gap-1"
            >
              <TrendingUp className="w-3 h-3" /> Subir Nv.{nivelClamped + 1}
            </button>
          )}

          {desbloqueada && onVitrina && (
            <button
              type="button"
              onClick={onVitrina}
              className={cn(
                "px-2 py-1.5 rounded border text-xs font-bold",
                enVitrina
                  ? "border-amber-hud text-amber bg-amber-hud/15"
                  : "border-white/15 text-muted-foreground hover:text-foreground"
              )}
              title="Exhibir en Base Personal"
            >
              ★
            </button>
          )}

          {onAccionExtra && (
            <button
              type="button"
              onClick={onAccionExtra.fn}
              className="px-2 py-1.5 rounded border border-white/15 text-muted-foreground hover:text-foreground"
            >
              {onAccionExtra.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
