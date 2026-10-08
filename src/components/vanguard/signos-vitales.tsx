"use client";

// v87.0 EL DESPERTAR — SIGNOS VITALES DEL PLANETA
// El Ojo de Dios ya veía el mundo; ahora le toma el PULSO. Cuatro contadores
// vivos con odómetro animado + una línea de electrocardiograma planetario que
// late sin parar: población naciendo, conflictos ardientes, tensión respirando
// y operadores conectados. El planeta no es un dato: es un cuerpo vivo.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Activity, HeartPulse, Globe2, Users, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONFLICTS } from "@/lib/game-data";
import { getTension } from "@/lib/tension";

// población mundial estimada: base + crecimiento neto (~2.3 personas/s, ONU)
const POB_BASE = 8_238_000_000;
const POB_EPOCH = Date.UTC(2026, 0, 1);
const POB_RATE = 2.3; // personas por segundo

function poblacionAhora(): number {
  return POB_BASE + Math.max(0, (Date.now() - POB_EPOCH) / 1000) * POB_RATE;
}

// Odómetro: el número rueda con muelle hacia su valor real — nada salta a seco
function Odometro({ valor, decimales = 0, className }: { valor: number; decimales?: number; className?: string }) {
  const spring = useSpring(valor, { stiffness: 90, damping: 18, mass: 0.6 });
  useEffect(() => { spring.set(valor); }, [valor, spring]);
  const texto = useTransform(spring, (v) =>
    v.toLocaleString("es", { minimumFractionDigits: decimales, maximumFractionDigits: decimales })
  );
  return <motion.span className={cn("tabular-nums", className)}>{texto}</motion.span>;
}

// EKG planetario: la línea late con el pulso del mundo
function EkgPlaneta({ peligro }: { peligro: boolean }) {
  return (
    <svg viewBox="0 0 300 40" className="w-full h-8" preserveAspectRatio="none" aria-hidden>
      <path
        d="M0 20 H42 l6-9 6 18 6-14 6 5 H120 l6-11 6 20 6-15 6 6 H210 l6-9 6 16 6-13 6 6 H300"
        fill="none"
        stroke={peligro ? "#FF3B30" : "#00FF87"}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="ekg-corre"
        style={{ filter: `drop-shadow(0 0 4px ${peligro ? "rgba(255,59,48,0.6)" : "rgba(0,255,135,0.55)"})` }}
      />
    </svg>
  );
}

export function SignosVitales({ online }: { online: number }) {
  const [pobl, setPobl] = useState(() => poblacionAhora());
  const [tensionViva, setTensionViva] = useState(() => getTension());

  // población nace cada 600ms — visible, no frenética
  useEffect(() => {
    const iv = setInterval(() => setPobl(poblacionAhora()), 600);
    return () => clearInterval(iv);
  }, []);

  // tensión respiratoria: la real de Vanguard ± microvariación cada 8s
  // + escucha el bus global "vanguard:tension" por si el mundo se agita
  useEffect(() => {
    const onBus = (e: Event) => {
      const v = (e as CustomEvent).detail;
      if (typeof v === "number") setTensionViva(v);
    };
    window.addEventListener("vanguard:tension", onBus);
    const iv = setInterval(() => {
      setTensionViva(() => {
        const base = getTension();
        return base + Math.sin(Date.now() / 8000) * 0.6;
      });
    }, 8000);
    return () => {
      window.removeEventListener("vanguard:tension", onBus);
      clearInterval(iv);
    };
  }, []);

  const conflictosActivos = useMemo(
    () => CONFLICTS.filter((c) => c.level === "CRITICO" || c.level === "TENSION").length,
    []
  );
  const criticos = useMemo(() => CONFLICTS.filter((c) => c.level === "CRITICO").length, []);

  const prevPobl = useRef(pobl);
  const nacimientos = Math.round((pobl - prevPobl.current) * 10) / 10;
  if (Math.abs(pobl - prevPobl.current) > 50) prevPobl.current = pobl;

  const peligro = tensionViva >= 70 || criticos >= 3;

  const vitales = [
    {
      icon: <Globe2 className={cn("w-3.5 h-3.5", peligro ? "text-crisis" : "text-cyan-hud")} />,
      label: "POBLACIÓN MUNDIAL",
      valor: <Odometro valor={pobl} decimales={0} className={cn("text-[13px] font-bold", peligro ? "text-crisis" : "text-foreground")} />,
      nota: `+${nacimientos > 0 ? nacimientos.toFixed(1) : "2.3"} al pulso`,
      color: peligro ? "text-crisis" : "text-cyan-hud",
    },
    {
      icon: <Flame className="w-3.5 h-3.5 text-amber" />,
      label: "CONFLICTOS ARDIENDO",
      valor: <span className="text-[13px] font-bold text-amber tabular-nums">{conflictosActivos}</span>,
      nota: `${CONFLICTS.length} zonas vigiladas`,
      color: "text-amber",
    },
    {
      icon: <Activity className={cn("w-3.5 h-3.5", peligro ? "text-crisis" : "text-neon")} />,
      label: "TENSIÓN GLOBAL",
      valor: <Odometro valor={tensionViva} decimales={1} className={cn("text-[13px] font-bold", peligro ? "text-crisis" : "text-neon")} />,
      nota: peligro ? "el planeta brilla en rojo" : "respiración estable",
      color: peligro ? "text-crisis" : "text-neon",
    },
    {
      icon: <Users className="w-3.5 h-3.5 text-violet-hud" />,
      label: "OPERADORES CONECTADOS",
      valor: <Odometro valor={Math.max(online, 1)} decimales={0} className="text-[13px] font-bold text-violet-hud" />,
      nota: "dentro de Vanguard ahora",
      color: "text-violet-hud",
    },
  ];

  return (
    <div
      className={cn(
        "hud-panel relative overflow-hidden p-3",
        peligro && "sombra-crisis border-crisis-hud/60"
      )}
    >
      {/* cabecera: el corazón del planeta */}
      <div className="flex items-center gap-2 mb-2">
        <HeartPulse className={cn("w-4 h-4", peligro ? "text-crisis" : "text-neon")} />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          signos vitales del planeta
        </span>
        <span className={cn("ml-auto flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest", peligro ? "text-crisis" : "text-neon")}>
          <span className={cn("w-1.5 h-1.5 rounded-full", peligro ? "bg-crisis" : "bg-neon", "animate-pulse")} />
          {peligro ? "estado crítico" : "vivo y latiendo"}
        </span>
      </div>

      {/* el electrocardiograma del mundo — siempre corre */}
      <div className="mb-2 rounded-sm bg-black/40 border border-white/5 px-1">
        <EkgPlaneta peligro={peligro} />
      </div>

      {/* los 4 contadores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {vitales.map((v) => (
          <motion.div
            key={v.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-sm border border-white/8 bg-black/30 p-2.5 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-1.5 mb-1">
              {v.icon}
              <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground truncate">{v.label}</span>
            </div>
            <div className="leading-none mb-1">{v.valor}</div>
            <div className={cn("font-mono text-[8px] uppercase tracking-wide", v.color)}>{v.nota}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
