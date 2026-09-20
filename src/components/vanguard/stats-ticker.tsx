"use client";

import { useGameStore } from "@/lib/game-store";
import { CONFLICTS } from "@/lib/game-data";
import { Radio, Activity, AlertTriangle, Coins, Gem, Flame, Zap, Star, Layers, Brain } from "lucide-react";
import { useState } from "react";

export function StatsTicker() {
  const { coins, gems, level, streak, fusionCount, quizCorrect, minigameBestScore } = useGameStore();
  const criticalCount = CONFLICTS.filter((c) => c.level === "CRITICO").length;
  const tensionCount = CONFLICTS.filter((c) => c.level === "TENSION").length;
  const [paused, setPaused] = useState(false);

  const items = [
    { icon: <AlertTriangle className="w-3 h-3" />, label: "CRIT", value: criticalCount, color: "text-red-hud" },
    { icon: <Activity className="w-3 h-3" />, label: "TENS", value: tensionCount, color: "text-amber" },
    { icon: <Radio className="w-3 h-3" />, label: "CANAL", value: 12, color: "text-cyan-hud" },
    { icon: <Layers className="w-3 h-3" />, label: "FUSION", value: fusionCount, color: "text-violet-hud" },
    { icon: <Brain className="w-3 h-3" />, label: "QUIZ", value: quizCorrect, color: "text-green-hud" },
    { icon: <Star className="w-3 h-3" />, label: "NIVEL", value: level, color: "text-amber" },
    { icon: <Flame className="w-3 h-3" />, label: "STREAK", value: streak, color: "text-red-hud" },
    { icon: <Coins className="w-3 h-3" />, label: "MON", value: coins, color: "text-amber" },
    { icon: <Gem className="w-3 h-3" />, label: "GEMAS", value: gems, color: "text-violet-hud" },
    { icon: <Zap className="w-3 h-3" />, label: "RECORD", value: minigameBestScore, color: "text-cyan-hud" },
  ];

  const looped = [...items, ...items];

  return (
    <div
      className="border-b border-amber-hud/40 bg-background/80 overflow-hidden relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center py-1">
        <div className="flex-shrink-0 px-2 sm:px-3 flex items-center gap-1.5 border-r border-amber-hud/30 h-full py-0.5 z-10 bg-background/95 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-red-hud blink-soft" />
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-red-hud uppercase tracking-wider">LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {/* left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background via-background/90 to-transparent z-10 pointer-events-none" />
          {/* right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background via-background/90 to-transparent z-10 pointer-events-none" />
          <div
            className="flex gap-4 sm:gap-6 ticker whitespace-nowrap"
            style={paused ? { animationPlayState: "paused" } : undefined}
          >
            {looped.map((it, i) => (
              <div key={i} className="flex items-center gap-1 text-[10px] sm:text-xs font-mono flex-shrink-0">
                <span className={it.color}>{it.icon}</span>
                <span className="text-muted-foreground uppercase tracking-wide">{it.label}</span>
                <span className={`font-bold ${it.color} tabular-nums`}>{it.value}</span>
                <span className="text-amber-hud/30 ml-2">·</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
