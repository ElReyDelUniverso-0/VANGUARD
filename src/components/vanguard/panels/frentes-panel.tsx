"use client";

// v89.0 OPERACIÓN ESPEJO — LÍNEA DEL FRENTE (espejo del mapa de zonas de
// control diario más consultado de la guerra: zona controlada, franja
// disputada, zona ocupada, flechas de presión y variación diaria en km² con
// reproducción histórica de 14 días).

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Waypoints, Play, Pause, TrendingDown, TrendingUp, MapPin } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import {
  puntosFrente, areaOcupada, deltas, controlDe, LOCALIDADES, EJES_PRESION, TEATRO_W, TEATRO_H,
} from "@/lib/frente-zonas-data";
import { cn } from "@/lib/utils";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function FrentesPanel() {
  const diasTotales = 14;
  const [diaFloat, setDiaFloat] = useState(diasTotales - 1); // 0 = hace 13 días
  const [reproduciendo, setReproduciendo] = useState(false);
  const rafRef = useRef<number>(0);

  // reproducción: recorre los 14 días
  useEffect(() => {
    if (!reproduciendo) return;
    let t0 = 0;
    const paso = (t: number) => {
      if (!t0) t0 = t;
      const dia = ((t - t0) / 1400) % diasTotales;
      setDiaFloat(dia);
      rafRef.current = requestAnimationFrame(paso);
    };
    rafRef.current = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reproduciendo]);

  const dia0 = Math.floor(diaFloat);
  const dia1 = Math.min(diasTotales - 1, dia0 + 1);
  const frac = diaFloat - dia0;

  const linea = useMemo(() => {
    const a = puntosFrente(dia0);
    const b = puntosFrente(dia1);
    return a.map(([x, y], i) => [lerp(x, b[i][0], frac), y] as [number, number]);
  }, [dia0, dia1, frac]);

  const areaHoy = areaOcupada(dia1);
  const dl = useMemo(() => deltas(diasTotales), []);
  const deltaHoy = dl[dia1 - 1]?.delta ?? 0;

  const pathFrente = linea.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const pathOcupado = `${pathFrente} L ${TEATRO_W} ${TEATRO_H} L ${TEATRO_W} 0 Z`;
  const pathFranja = (() => {
    const east = linea.map(([x, y]) => [x + 55, y] as [number, number]).reverse();
    return `${pathFrente} ${east.map(([x, y], i) => `${i === 0 ? "L" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")} Z`;
  })();

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Línea del Frente"
        subtitle="Zonas de control con variación diaria — el mapa que la guerra reescribe"
        icon={<Waypoints className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
        right={
          <span className="text-[9px] font-mono uppercase px-2 py-1 border border-cyan-hud/60 text-cyan-hud bg-cyan-hud/10">
            DÍA {dia1 + 1}/{diasTotales}
          </span>
        }
      />
      <HeroOro panel="frentes" />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-3">
        {/* TEATRO */}
        <div className="hud-panel p-2 relative overflow-hidden">
          <svg viewBox={`0 0 ${TEATRO_W} ${TEATRO_H}`} className="w-full h-auto select-none">
            <defs>
              <pattern id="hatch89" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <rect width="7" height="7" fill="#3a3a45" />
                <line x1="0" y1="0" x2="0" y2="7" stroke="#FFB02055" strokeWidth="2" />
              </pattern>
              <linearGradient id="gradOcup" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF4D4D" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#FF4D4D" stopOpacity="0.12" />
              </linearGradient>
              <linearGradient id="gradAzul" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#3DDCFF" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#3DDCFF" stopOpacity="0.16" />
              </linearGradient>
            </defs>

            {/* fondo y rejilla */}
            <rect width={TEATRO_W} height={TEATRO_H} fill="#0d0f14" />
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={"g" + i} x1={(i + 1) * (TEATRO_W / 11)} y1="0" x2={(i + 1) * (TEATRO_W / 11)} y2={TEATRO_H} stroke="#1c2028" strokeWidth="1" />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={"h" + i} x1="0" y1={(i + 1) * (TEATRO_H / 7)} x2={TEATRO_W} y2={(i + 1) * (TEATRO_H / 7)} stroke="#1c2028" strokeWidth="1" />
            ))}

            {/* ZONAS */}
            <path d={`M 0 0 L ${linea[0][0].toFixed(1)} 0 ${linea.map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")} L 0 ${TEATRO_H} Z`} fill="url(#gradAzul)" />
            <path d={pathFranja} fill="url(#hatch89)" opacity="0.85" />
            <path d={pathOcupado} fill="url(#gradOcup)" />

            {/* río */}
            <path d="M 700 0 C 640 120, 730 220, 660 320 C 610 400, 680 470, 640 540" fill="none" stroke="#22d3ee33" strokeWidth="5" />
            <path d="M 60 540 C 120 460, 60 380, 130 300" fill="none" stroke="#22d3ee22" strokeWidth="4" />

            {/* línea del frente */}
            <path d={pathFrente} fill="none" stroke="#FF4D4D" strokeWidth="3.5" strokeLinejoin="round" />
            <path d={pathFrente} fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="6 10" className="v89-flujo" opacity="0.7" />

            {/* flechas de presión */}
            {EJES_PRESION.map((e) => {
              const pulso = 0.5 + 0.5 * Math.sin(Date.now() / 700 + e.x);
              return (
                <g key={e.nombre} opacity={0.35 + e.fuerza * 0.65}>
                  <path
                    d={`M ${e.x + 58} ${e.y} L ${e.x + 18} ${e.y} M ${e.x + 18} ${e.y} L ${e.x + 28} ${e.y - 6} M ${e.x + 18} ${e.y} L ${e.x + 28} ${e.y + 6}`}
                    stroke="#FF4D4D"
                    strokeWidth={2 + e.fuerza * 2.5}
                    fill="none"
                    className="v89-pulsa"
                    style={{ animationDelay: `${pulso * 0.3}s` }}
                  />
                  <text x={e.x + 64} y={e.y + 3} fontSize="8" fill="#ff9a9a" fontFamily="monospace">{e.nombre}</text>
                </g>
              );
            })}

            {/* localidades */}
            {LOCALIDADES.map((loc) => {
              const ctrl = controlDe(loc, dia1);
              const color = ctrl === 2 ? "#3DDCFF" : ctrl === 1 ? "#FFB020" : "#FF6B6B";
              return (
                <g key={loc.nombre}>
                  <circle cx={loc.x} cy={loc.y} r={ctrl === 1 ? 5 : 4} fill={color} opacity="0.9" />
                  {ctrl === 1 && <circle cx={loc.x} cy={loc.y} r="8" fill="none" stroke={color} strokeWidth="1" className="v89-pin" />}
                  <text x={loc.x + 8} y={loc.y + 3} fontSize="9" fill={color} opacity="0.85" fontFamily="monospace">
                    {loc.nombre}
                  </text>
                </g>
              );
            })}

            {/* leyenda */}
            <g transform="translate(12, 12)">
              <rect width="196" height="64" fill="#000000aa" stroke="#ffffff22" />
              <circle cx="12" cy="14" r="4" fill="#3DDCFF" /><text x="22" y="17" fontSize="9" fill="#cfd8dc" fontFamily="monospace">CONTROLADO (fuerza azul)</text>
              <rect x="8" y="26" width="8" height="8" fill="url(#hatch89)" /><text x="22" y="33" fontSize="9" fill="#cfd8dc" fontFamily="monospace">DISPUTADO (franja gris)</text>
              <circle cx="12" cy="48" r="4" fill="#FF6B6B" /><text x="22" y="51" fontSize="9" fill="#cfd8dc" fontFamily="monospace">OCUPADO (fuerza roja)</text>
            </g>
          </svg>

          {/* reproducción */}
          <div className="flex items-center gap-2 px-2 py-2 border-t border-border/60">
            <button
              onClick={() => setReproduciendo((v) => !v)}
              className="w-8 h-8 flex items-center justify-center border border-cyan-hud/60 text-cyan-hud hover:bg-cyan-hud/15 transition-all active:scale-95"
              aria-label={reproduciendo ? "Pausar reproducción" : "Reproducir historia"}
            >
              {reproduciendo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={diasTotales - 1}
              step={0.02}
              value={diaFloat}
              onChange={(e) => { setReproduciendo(false); setDiaFloat(parseFloat(e.target.value)); }}
              className="flex-1 accent-cyan-400"
              aria-label="Línea de tiempo de 14 días"
            />
            <span className="text-[9px] font-mono uppercase text-muted-foreground w-24 text-right">
              {reproduciendo || diaFloat % 1 !== 0 ? "…deslizando" : `día ${dia1 + 1}`}
            </span>
          </div>
        </div>

        {/* PANELES LATERALES */}
        <div className="space-y-3">
          <motion.div key={dia1} initial={{ opacity: 0.6, y: 6 }} animate={{ opacity: 1, y: 0 }} className="hud-panel p-3.5">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2">variación del día</p>
            <div className={cn("flex items-center gap-2 text-xl font-bold font-mono", deltaHoy > 0 ? "text-red-hud" : deltaHoy < 0 ? "text-cyan-hud" : "text-muted-foreground")}>
              {deltaHoy > 0 ? <TrendingUp className="w-5 h-5" /> : deltaHoy < 0 ? <TrendingDown className="w-5 h-5" /> : <Waypoints className="w-5 h-5" />}
              {deltaHoy > 0 ? "+" : ""}{deltaHoy.toLocaleString("es-ES")} km²
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {deltaHoy > 0 ? "la fuerza roja amplió la zona ocupada" : deltaHoy < 0 ? "la fuerza azul recuperó terreno" : "la línea se mantuvo sin cambios"}
            </p>
            {(dl[dia1 - 1]?.localidades.length ?? 0) > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {dl[dia1 - 1].localidades.map((l) => (
                  <span key={l} className="flex items-center gap-1 text-[9px] font-mono uppercase px-1.5 py-0.5 border border-amber-hud/50 text-amber">
                    <MapPin className="w-2.5 h-2.5" /> {l}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          <div className="hud-panel p-3.5">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2">territorio ocupado</p>
            <p className="text-2xl font-bold font-mono text-red-hud">{areaHoy.toLocaleString("es-ES")} km²</p>
            <div className="h-1.5 bg-background border border-border mt-2 overflow-hidden">
              <motion.div
                className="h-full bg-red-hud"
                animate={{ width: `${Math.min(100, (areaHoy / 24000) * 100)}%` }}
                transition={{ type: "spring", stiffness: 60 }}
              />
            </div>
            <p className="text-[9px] font-mono text-muted-foreground mt-1">teatro ficticio VALLE DEL KARSK · espejo metodológico</p>
          </div>

          <div className="hud-panel p-3.5">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2">historial · 13 días</p>
            <div className="space-y-0.5 max-h-52 overflow-y-auto thin-scroll">
              {dl.slice().reverse().map((d) => (
                <button
                  key={d.dia}
                  onClick={() => { setReproduciendo(false); setDiaFloat(d.dia); }}
                  className={cn(
                    "w-full flex items-center justify-between text-[10px] font-mono px-1.5 py-1 border transition-all",
                    Math.abs(diaFloat - d.dia) < 0.5 ? "border-cyan-hud text-cyan-hud bg-cyan-hud/10" : "border-transparent hover:border-border text-muted-foreground"
                  )}
                >
                  <span>día {d.dia + 1}</span>
                  <span className={d.delta > 0 ? "text-red-hud" : d.delta < 0 ? "text-cyan-hud" : ""}>
                    {d.delta > 0 ? "+" : ""}{d.delta} km²
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
