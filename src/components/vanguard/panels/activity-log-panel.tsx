"use client";

import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { ScrollText, Coins, Gem, Star, Trophy, Target, Flame, Award, Trash2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";

const iconForMsg = (msg: string) => {
  if (msg.includes("monedas") && msg.startsWith("+")) return <Coins className="w-3.5 h-3.5 text-amber" />;
  if (msg.includes("monedas") && msg.startsWith("-")) return <Coins className="w-3.5 h-3.5 text-red-hud" />;
  if (msg.includes("gemas")) return <Gem className="w-3.5 h-3.5 text-violet-hud" />;
  if (msg.includes("Logro desbloqueado")) return <Award className="w-3.5 h-3.5 text-green-hud" />;
  if (msg.includes("Logro reclamado")) return <Trophy className="w-3.5 h-3.5 text-amber" />;
  if (msg.includes("Mision")) return <Target className="w-3.5 h-3.5 text-red-hud" />;
  if (msg.includes("Recompensa semanal")) return <Trophy className="w-3.5 h-3.5 text-amber" />;
  if (msg.includes("nivel")) return <Star className="w-3.5 h-3.5 text-cyan-hud" />;
  if (msg.includes("racha") || msg.includes("Login")) return <Flame className="w-3.5 h-3.5 text-red-hud" />;
  return <ScrollText className="w-3.5 h-3.5 text-muted-foreground" />;
};

export function ActivityLogPanel() {
  const { log } = useGameStore();
  const [filter, setFilter] = useState<"ALL" | "GAINS" | "SPENDS">("ALL");

  const filtered = log.filter((entry) => {
    if (filter === "ALL") return true;
    if (filter === "GAINS") return (entry.delta ?? 0) > 0;
    if (filter === "SPENDS") return (entry.delta ?? 0) < 0;
    return true;
  });

  const totalGains = log.reduce((acc, e) => acc + Math.max(0, e.delta ?? 0), 0);
  const totalSpends = log.reduce((acc, e) => acc + Math.min(0, e.delta ?? 0), 0);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Registro de actividad"
        subtitle="Historial cronologico · bitacora de comando"
        icon={<ScrollText className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
        right={
          <div className="flex items-center gap-1">
            {(["ALL", "GAINS", "SPENDS"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2 py-1 border text-[10px] font-mono uppercase",
                  filter === f
                    ? "border-cyan-hud text-cyan-hud bg-cyan-hud/30"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {f === "ALL" ? "Todo" : f === "GAINS" ? "Ganancias" : "Gastos"}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-2">
        <div className="hud-corner p-3 bg-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Eventos</div>
          <div className="text-xl font-mono font-bold text-cyan-hud">{log.length}</div>
        </div>
        <div className="hud-corner p-3 bg-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Ganancias</div>
          <div className="text-xl font-mono font-bold text-green-hud">+{totalGains}</div>
        </div>
        <div className="hud-corner p-3 bg-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Gastos</div>
          <div className="text-xl font-mono font-bold text-red-hud">{totalSpends}</div>
        </div>
      </div>

      <div className="hud-corner">
        <div className="p-3 border-b border-amber-hud/30 bg-secondary/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-amber" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              Mostrando {filtered.length} de {log.length} eventos
            </span>
          </div>
          <div className="text-[10px] font-mono text-amber">Mas reciente primero</div>
        </div>
        <div className="max-h-[600px] overflow-y-auto thin-scroll p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-mono">Sin eventos en este filtro</p>
              <p className="text-[10px] mt-1">Realiza acciones para registrar actividad</p>
            </div>
          ) : (
            filtered.map((entry, i) => (
              <motion.div
                key={`${entry.ts}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.01, 0.2) }}
                className="flex items-start gap-2 p-2 hover:bg-secondary/40 rounded-sm transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">{iconForMsg(entry.msg)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground font-mono">{entry.msg}</div>
                  <div className="text-[9px] text-muted-foreground font-mono">
                    {new Date(entry.ts).toLocaleString("es", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </div>
                </div>
                {entry.delta !== undefined && entry.delta !== 0 && (
                  <div
                    className={cn(
                      "text-xs font-mono font-bold tabular-nums flex-shrink-0",
                      entry.delta > 0 ? "text-green-hud" : "text-red-hud"
                    )}
                  >
                    {entry.delta > 0 ? "+" : ""}{entry.delta}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
