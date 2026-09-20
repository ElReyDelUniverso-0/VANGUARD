"use client";

// v13 — MERCADO DE PREDICCIONES con 4 horizontes de tiempo:
// RAPIDA (24h, premio x3) · SEMANAL (x1.5) · MENSUAL (x1.2) · GRAN PROFECIA
// (1+ años, x2.5 y pozo que crece). Con evolucion de odds y acierto
// personal vs global.

import { useState, useMemo } from "react";
import { PREDICTION_MARKETS } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { BarChart3, TrendingUp, TrendingDown, Coins, Clock, Activity, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Horizon = "RAPIDA" | "SEMANAL" | "MENSUAL" | "PROFECIA";

const HORIZON_META: Record<Horizon, { label: string; mult: number; chip: string; desc: string }> = {
  RAPIDA: { label: "RÁPIDA · 24h", mult: 3, chip: "text-crisis border-crisis-hud bg-crisis-hud", desc: "Eventos urgentes: triple premio por acierto" },
  SEMANAL: { label: "SEMANAL · 7d", mult: 1.5, chip: "text-amber border-amber-hud bg-amber-hud", desc: "Desarrollos de la semana con cuotas vivas" },
  MENSUAL: { label: "MENSUAL · 30d", mult: 1.2, chip: "text-electric border-electric-hud bg-electric-hud", desc: "Conflictos a mediano plazo, requiere análisis" },
  PROFECIA: { label: "GRAN PROFECÍA · 1+ año", mult: 2.5, chip: "text-violet-hud border-violet-hud bg-violet-hud", desc: "El pozo crece durante meses: el más viral al resolverse" },
};

// asigna horizonte estable por mercado + odds historicas deterministas
function horizonOf(id: string, closesAt: string): Horizon {
  if (id.includes("HORMUZ") || id.includes("GOLPE")) return "RAPIDA";
  if (closesAt.includes("14") || closesAt.includes("18")) return "SEMANAL";
  if (id.includes("REDSEA") || closesAt.includes("30")) return "MENSUAL";
  if (id.includes("TAIWAN") || closesAt.includes("90")) return "PROFECIA";
  return "MENSUAL";
}

function oddsHistory(id: string, base: number): number[] {
  let seed = 0;
  for (const c of id) seed = (seed * 31 + c.charCodeAt(0)) % 9973;
  const arr: number[] = [];
  let v = base * (0.7 + (seed % 30) / 100);
  for (let i = 0; i < 14; i++) {
    v += ((seed + i * 7919) % 21 - 10) / 100 * base;
    arr.push(Math.max(1.1, Math.min(base * 1.8, v)));
  }
  arr[arr.length - 1] = base;
  return arr;
}

export function PredictionsPanel() {
  const { coins, spendCoins, recordPrediction, betStats } = useGameStore();
  const [stake, setStake] = useState<Record<string, number>>({});
  const [resolved, setResolved] = useState<Record<string, "YES" | "NO">>({});
  const [horizon, setHorizon] = useState<Horizon>("SEMANAL");

  const accuracy = betStats.placed > 0 ? Math.round((betStats.won / betStats.placed) * 100) : 0;

  const markets = useMemo(
    () =>
      PREDICTION_MARKETS.map((m) => ({
        ...m,
        horizon: horizonOf(m.id, m.closesAt),
        history: oddsHistory(m.id, m.odds),
      })),
    []
  );
  const visible = markets.filter((m) => m.horizon === horizon);
  const meta = HORIZON_META[horizon];
  const poolSize = horizon === "PROFECIA" ? 48210 + markets.filter((m) => m.horizon === "PROFECIA").length * 1240 : 0;

  const handlePredict = (marketId: string, outcome: "YES" | "NO", odds: number) => {
    const amount = stake[marketId] ?? 10;
    if (amount <= 0) {
      toast.error("Apuesta invalida", { description: "Debe ser mayor a 0" });
      return;
    }
    if (coins < amount) {
      toast.error("Monedas insuficientes");
      return;
    }
    spendCoins(amount, `Apuesta ${marketId} → ${outcome}`);
    recordPrediction(marketId, outcome, amount, odds);
    const yesProb = PREDICTION_MARKETS.find((m) => m.id === marketId)?.probability ?? 0.5;
    const win = outcome === "YES" ? Math.random() < yesProb : Math.random() > yesProb;
    const mult = meta.mult;
    setResolved((r) => ({ ...r, [marketId]: outcome }));
    setTimeout(() => {
      if (win) {
        const payout = Math.round(amount * odds * mult);
        useGameStore.getState().addCoins(payout, `Prediccion acertada ${marketId} (${meta.label})`);
        useGameStore.getState().addXp(30);
        toast.success(`Prediccion acertada! +${payout} monedas`, {
          description: `${outcome} × ${odds} × ${mult} (${meta.label}) = ${payout} monedas`,
        });
      } else {
        toast.error("Prediccion fallida", { description: `Perdiste ${amount} monedas` });
      }
      setResolved((r) => {
        const next = { ...r };
        delete next[marketId];
        return next;
      });
    }, 2500);
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Mercado de predicciones"
        subtitle="4 horizontes · odds dinámicos · pozo de profecías"
        icon={<BarChart3 className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <div className="text-[10px] font-mono text-muted-foreground text-right">
            <div><span className="text-amber">{coins}</span> monedas</div>
            <div>tu acierto: <span className={accuracy >= 50 ? "text-neon" : "text-crisis"}>{accuracy}%</span> · global 48%</div>
          </div>
        }
      />

      {/* SELECTOR DE HORIZONTE */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
        {(Object.keys(HORIZON_META) as Horizon[]).map((h) => (
          <button
            key={h}
            onClick={() => setHorizon(h)}
            className={cn(
              "px-2 py-2 border font-mono text-[9px] uppercase tracking-widest vg-transition text-left",
              horizon === h ? HORIZON_META[h].chip : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="block font-bold">{HORIZON_META[h].label}</span>
            <span className="block text-[8px] opacity-80 normal-case tracking-normal">
              premio x{HORIZON_META[h].mult} · {markets.filter((m) => m.horizon === h).length} mercados
            </span>
          </button>
        ))}
      </div>
      <div className="hud-corner p-2 bg-secondary/30 flex flex-wrap items-center gap-2 text-[10px] font-mono">
        <Activity className="w-4 h-4 text-amber" />
        <span className="text-muted-foreground">{meta.desc}.</span>
        {horizon === "PROFECIA" && (
          <span className="text-violet-hud font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> POZO ACUMULADO: {poolSize.toLocaleString()} mon — se reparte al resolver
          </span>
        )}
        {horizon === "RAPIDA" && <span className="text-crisis font-bold">TRIPLE PREMIO por acertar en 24h</span>}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {visible.map((m) => {
          const isResolving = !!resolved[m.id];
          const yesPct = Math.round(m.probability * 100);
          const noPct = 100 - yesPct;
          const curStake = stake[m.id] ?? 10;

          // sparkline de evolucion de odds
          const w = 120, h = 26;
          const min = Math.min(...m.history);
          const max = Math.max(...m.history);
          const pts = m.history.map((v, i) => `${(i / (m.history.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(" ");

          return (
            <motion.div key={m.id} layout className={cn("hud-corner p-3", horizon === "PROFECIA" && "neon-border")}>
              <div className="flex items-center justify-between mb-2">
                <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border uppercase", HORIZON_META[m.horizon].chip)}>
                  {m.category}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> cierra {m.closesAt}
                </span>
              </div>

              <h3 className="text-sm font-medium text-foreground mb-2">{m.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{m.description}</p>

              {/* Probability bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-green-hud flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> YES {yesPct}%
                  </span>
                  <span className="text-red-hud flex items-center gap-0.5">
                    NO {noPct}% <TrendingDown className="w-3 h-3" />
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
                  <div className="bg-green-hud h-full" style={{ width: `${yesPct}%` }} />
                  <div className="bg-red-hud h-full" style={{ width: `${noPct}%` }} />
                </div>
              </div>

              {/* evolucion de odds */}
              <div className="flex items-center gap-2 mb-3">
                <svg width={w} height={h} className="flex-shrink-0">
                  <polyline points={pts} fill="none" stroke="#FFD60A" strokeWidth="1.4" />
                </svg>
                <span className="text-[8px] font-mono text-muted-foreground uppercase leading-tight">
                  evolución de odds<br />últimas 24h · {min.toFixed(2)} → {max.toFixed(2)}
                </span>
              </div>

              {/* Stake input */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Apuesta:</span>
                {[10, 25, 50, 100].map((v) => (
                  <button
                    key={v}
                    onClick={() => setStake((s) => ({ ...s, [m.id]: v }))}
                    className={cn(
                      "px-2 py-0.5 border text-[10px] font-mono",
                      curStake === v
                        ? "border-amber-hud text-amber bg-amber-hud/30"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {v}
                  </button>
                ))}
                <span className="ml-auto text-[10px] font-mono text-amber flex items-center gap-0.5">
                  <Coins className="w-3 h-3" /> x{meta.mult} = {Math.round(curStake * m.odds * meta.mult)}
                </span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handlePredict(m.id, "YES", m.odds)}
                  disabled={isResolving}
                  className="bg-green-hud/30 hover:bg-green-hud/50 border border-green-hud text-green-hud font-mono text-[11px] uppercase"
                >
                  {isResolving ? "Resolviendo..." : `YES × ${m.odds}`}
                </Button>
                <Button
                  onClick={() => handlePredict(m.id, "NO", 1 / (1 - m.probability))}
                  disabled={isResolving}
                  className="bg-red-hud/30 hover:bg-red-hud/50 border border-red-hud text-red-hud font-mono text-[11px] uppercase"
                >
                  {isResolving ? "..." : `NO × ${(1 / (1 - m.probability)).toFixed(2)}`}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
