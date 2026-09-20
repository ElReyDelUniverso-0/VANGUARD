"use client";

// Vanguard v12 — CONTADORES: contadores de muertes animados. Muertes globales
// en vivo (tasas reales ONU), bajas historicas por guerra acumulandose en
// pantalla y estadisticas de crimen global.

import { useState, useEffect, useRef } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Skull, Activity, Baby, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { WAR_DEATHS, LIVE_RATES, GLOBAL_CRIME } from "@/lib/archive-data";

function fmt(n: number): string {
  return Math.floor(n).toLocaleString("en-US").replace(/,/g, " ");
}

export function CountersPanel() {
  const [tick, setTick] = useState(0);
  const start = useRef(Date.now());

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(iv);
  }, []);

  const secs = (Date.now() - start.current) / 1000;

  return (
    <div className="space-y-3">
      <PanelHeader
        title="CONTADORES MUNDIALES"
        subtitle="Cada segundo cuenta · datos de ONU/WHO y registros historicos"
        icon={<Skull className="w-4 h-4" />} color="red"
      />

      {/* contadores en vivo */}
      <div className="grid sm:grid-cols-3 gap-2">
        <div className="hud-corner border border-red-hud/60 bg-red-hud/10 p-4 text-center">
          <div className="text-[9px] font-mono uppercase tracking-widest text-red-hud flex items-center justify-center gap-1 mb-1">
            <Activity className="w-3 h-3" /> MUERTES MUNDIALES (esta sesion)
          </div>
          <motion.div key={tick} initial={{ scale: 1.02 }} animate={{ scale: 1 }} className="font-mono text-xl sm:text-2xl font-bold text-red-hud tabular-nums">
            {fmt(secs * LIVE_RATES.deathsPerSec)}
          </motion.div>
          <div className="text-[9px] font-mono text-muted-foreground mt-1">{LIVE_RATES.deathsPerSec} por segundo · ~2 por latido</div>
        </div>
        <div className="hud-corner border border-green-hud/60 bg-green-hud/10 p-4 text-center">
          <div className="text-[9px] font-mono uppercase tracking-widest text-green-hud flex items-center justify-center gap-1 mb-1">
            <Baby className="w-3 h-3" /> NACIMIENTOS (esta sesion)
          </div>
          <motion.div key={tick} initial={{ scale: 1.02 }} animate={{ scale: 1 }} className="font-mono text-xl sm:text-2xl font-bold text-green-hud tabular-nums">
            {fmt(secs * LIVE_RATES.birthsPerSec)}
          </motion.div>
          <div className="text-[9px] font-mono text-muted-foreground mt-1">{LIVE_RATES.birthsPerSec} por segundo</div>
        </div>
        <div className="hud-corner border border-cyan-hud/60 bg-cyan-hud/10 p-4 text-center">
          <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-hud flex items-center justify-center gap-1 mb-1">
            <Globe2 className="w-3 h-3" /> POBLACION MUNDIAL EST.
          </div>
          <motion.div key={tick} initial={{ scale: 1.02 }} animate={{ scale: 1 }} className="font-mono text-xl sm:text-2xl font-bold text-cyan-hud tabular-nums">
            {fmt(LIVE_RATES.popStart + secs * (LIVE_RATES.birthsPerSec - LIVE_RATES.deathsPerSec))}
          </motion.div>
          <div className="text-[9px] font-mono text-muted-foreground mt-1">+{(LIVE_RATES.birthsPerSec - LIVE_RATES.deathsPerSec).toFixed(2)} hab/seg · ~80 M/ano</div>
        </div>
      </div>

      {/* bajas historicas por guerra */}
      <div className="hud-corner border bg-secondary/20 p-3">
        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber mb-2 flex items-center gap-1">
          <Skull className="w-3.5 h-3.5" /> BAJAS HISTORICAS · LO QUE CADA GUERRA COSTO
        </div>
        <div className="space-y-2.5">
          {WAR_DEATHS.map((w) => {
            const live = w.total; // barra completa; el numero es el ancla
            return (
              <div key={w.id}>
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold text-foreground">{w.name} <span className="text-muted-foreground font-normal">· {w.years}</span></span>
                  <span className="font-mono text-sm font-bold tabular-nums" style={{ color: w.color }}>{fmt(live)}</span>
                </div>
                <div className="h-1.5 bg-secondary/60 mt-1 overflow-hidden rounded-sm">
                  <div className="h-full rounded-sm" style={{ width: `${(w.total / 75_000_000) * 100}%`, background: w.color, boxShadow: `0 0 8px ${w.color}66` }} />
                </div>
                <div className="text-[9px] font-mono text-muted-foreground mt-0.5">{w.note} · media: {fmt(w.perDay)}/dia</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* crimen global */}
      <div className="hud-corner border bg-secondary/20 p-3">
        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber mb-2">CRIMEN GLOBAL · ESTIMACIONES ANUALES</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {GLOBAL_CRIME.map((c) => (
            <div key={c.label} className="border border-border/50 p-2.5">
              <div className="text-[9px] font-mono text-muted-foreground uppercase">{c.label}</div>
              <div className="text-xs font-mono font-bold text-red-hud">{c.value}</div>
              <div className="text-[9px] font-mono text-muted-foreground/70">{c.note}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">
        Cada numero es una persona · recordatorio de por que la paz tambien se juega
      </div>
    </div>
  );
}
