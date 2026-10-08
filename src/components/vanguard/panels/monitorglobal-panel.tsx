"use client";

// v92.0 OJO DEL MUNDO — MONITOR GLOBAL (espejo del tablero mundial en vivo):
// el NÚCLEO NEURONAL v3 computa la tensión del planeta en directo — índice
// global, teatros, energía, ciber, desinformación, marítimo — con cinta de
// precios de guerra y feed de alertas. Se actualiza cada 30 s.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RadioTower, BrainCircuit, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { generarMonitor, type MonitorGlobal } from "@/lib/monitor-data";
import { cn } from "@/lib/utils";

function colorTension(n: number): string {
  return n >= 75 ? "#FF4D4D" : n >= 55 ? "#FF8A3D" : n >= 35 ? "#FFC94D" : "#9AE04D";
}

function Sparkline({ data }: { data: number[] }) {
  const w = 100;
  const h = 26;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / 100) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="#FFC94D" strokeWidth="1.1" />
      <polyline points={`${pts} ${w},${h} 0,${h}`} fill="#FFC94D" fillOpacity="0.08" stroke="none" />
      <circle cx={w} cy={h - (data[data.length - 1] / 100) * h} r="1.4" fill="#FF4D4D">
        <animate attributeName="r" values="1.1;2;1.1" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export function MonitorGlobalPanel() {
  const [base, setBase] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setBase(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const m: MonitorGlobal = useMemo(() => generarMonitor(base), [base]);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Monitor Global"
        subtitle="El pulso del planeta computado por el núcleo neuronal v3, tramo a tramo, sin descanso"
        icon={<RadioTower className="w-4 h-4 text-green" />}
        color="green"
        right={
          <span className="text-[9px] font-mono uppercase px-2 py-1 border border-green-hud/60 text-green bg-green-hud/10 flex items-center gap-1">
            <motion.span className="w-1.5 h-1.5 rounded-full bg-green inline-block" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
            EN VIVO
          </span>
        }
      />
      <HeroOro panel="monitorglobal" />

      {/* ÍNDICE GLOBAL */}
      <div className="hud-panel border-green-hud/40 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
          <div className="p-4 border-b md:border-b-0 md:border-r border-border/40 flex items-center gap-4">
            {/* gauge semicircular */}
            <svg viewBox="0 0 100 58" className="w-28 shrink-0">
              <path d="M8,54 A44,44 0 0 1 92,54" fill="none" stroke="#2a2f38" strokeWidth="7" strokeLinecap="round" />
              <motion.path
                d="M8,54 A44,44 0 0 1 92,54"
                fill="none" stroke={colorTension(m.tensionGlobal)} strokeWidth="7" strokeLinecap="round"
                strokeDasharray={138}
                initial={{ strokeDashoffset: 138 }}
                animate={{ strokeDashoffset: 138 - (m.tensionGlobal / 100) * 138 }}
                transition={{ duration: 1.1 }}
              />
              <motion.circle
                cx="50" cy="54" r="0" fill={colorTension(m.tensionGlobal)}
                animate={{ r: [2.5, 3.6, 2.5] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
            </svg>
            <div>
              <p className="text-[8px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Índice de tensión global</p>
              <p className="text-4xl font-black leading-none mt-1" style={{ color: colorTension(m.tensionGlobal) }}>{m.tensionGlobal}</p>
              <p className={cn("text-[10px] font-mono flex items-center gap-1 mt-1", m.deltaGlobal >= 0 ? "text-red" : "text-emerald")}>
                {m.deltaGlobal >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {m.deltaGlobal >= 0 ? "+" : ""}{m.deltaGlobal} en 24 h
              </p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <BrainCircuit className="w-3.5 h-3.5 text-amber" />
              <p className="text-[9px] font-mono uppercase tracking-widest text-amber">Historia del núcleo · 24 tramos</p>
            </div>
            <Sparkline data={m.núcleoHistoria} />
            <div className="flex justify-between text-[8px] font-mono text-muted-foreground mt-1">
              <span>−24 h</span><span>−12 h</span><span>ahora</span>
            </div>
          </div>
        </div>
      </div>

      {/* TEATROS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {m.teatros.map((t, i) => (
          <motion.div key={t.teatro} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="hud-panel px-2.5 py-2">
            <p className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground truncate">{t.teatro}</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-xl font-black" style={{ color: colorTension(t.valor) }}>{t.valor}</p>
              <span className={cn("text-[9px] font-mono", t.delta >= 0 ? "text-red" : "text-emerald")}>
                {t.delta >= 0 ? "▲" : "▼"}{Math.abs(t.delta)}
              </span>
            </div>
            <div className="h-1 bg-foreground/10 mt-1">
              <motion.div className="h-full" style={{ background: colorTension(t.valor) }} initial={{ width: 0 }} animate={{ width: `${t.valor}%` }} transition={{ duration: 0.7, delay: i * 0.05 }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* DOMINIOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {(
          [
            ["ENERGÍA", m.energia], ["CIBER", m.ciber], ["DESINFORMACIÓN", m.desinformacion], ["MARÍTIMO", m.maritimo],
          ] as const
        ).map(([k, v], i) => (
          <motion.div key={k} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }} className="hud-panel px-3 py-2.5 border-l-2" style={{ borderLeftColor: colorTension(v) }}>
            <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-muted-foreground">{k}</p>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-2xl font-black" style={{ color: colorTension(v) }}>{v}</p>
              <Activity className="w-4 h-4" style={{ color: colorTension(v) }} />
            </div>
            <div className="h-1 bg-foreground/10 mt-1.5">
              <motion.div className="h-full" style={{ background: colorTension(v) }} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.9 }} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3">
        {/* ALERTAS */}
        <div className="hud-panel border-green-hud/40 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60 bg-green-hud/5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Feed de alertas del núcleo</h4>
          </div>
          <div className="divide-y divide-border/40 max-h-96 overflow-y-auto">
            {m.alertas.map((a, i) => {
              const sevColor = a.severidad === "CRÍTICA" ? "#FF4D4D" : a.severidad === "ALTA" ? "#FF8A3D" : a.severidad === "MEDIA" ? "#FFC94D" : "#9AE04D";
              return (
                <motion.div key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="px-3 py-2 flex gap-2.5">
                  <span className="w-1 shrink-0" style={{ background: sevColor }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[8px] font-mono px-1 py-0.5 border shrink-0" style={{ color: sevColor, borderColor: sevColor + "66" }}>{a.severidad}</span>
                      <span className="text-[9px] font-mono text-muted-foreground">{a.hora}</span>
                      {a.neuronas.map((n) => (
                        <span key={n} className="text-[8px] font-mono text-amber border border-amber/40 px-1">◉ {n}</span>
                      ))}
                    </div>
                    <p className="text-[12px] text-foreground/85 leading-snug mt-0.5">{a.texto}</p>
                    <p className="text-[9px] font-mono text-muted-foreground">fuente: {a.fuente}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CINTA DE PRECIOS */}
        <div className="hud-panel border-border/60 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">Cinta de guerra (ficticia)</h4>
          </div>
          <div className="divide-y divide-border/40">
            {m.tickers.map((t, i) => (
              <motion.div key={t.simbolo} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="px-3 py-2 flex items-center gap-2">
                <span className="text-[9px] font-mono px-1 py-0.5 bg-foreground/10 text-foreground/80 w-9 text-center shrink-0">{t.simbolo}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-foreground truncate">{t.nombre}</p>
                  <p className="text-[8px] font-mono text-muted-foreground">{t.unidad}</p>
                </div>
                <p className="text-[12px] font-mono text-foreground">{t.precio.toLocaleString("es")}</p>
                <span className={cn("text-[10px] font-mono w-14 text-right", t.deltaPct >= 0 ? "text-red" : "text-emerald")}>
                  {t.deltaPct >= 0 ? "+" : ""}{t.deltaPct}%
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
