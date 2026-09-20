"use client";

import { useMemo } from "react";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { BarChart3, TrendingUp, Coins, Star, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { INITIAL_HISTORY } from "@/lib/game-data";

export function ProgressChartsPanel() {
  const { xp, coins, level, streak, fusionCount, quizCorrect, minigameBestScore, viewedNews, viewedPhotos, predictions } = useGameStore();

  // Build chart data: historical mock + current session
  const data = useMemo(() => {
    const last = INITIAL_HISTORY[INITIAL_HISTORY.length - 1];
    const today = { ts: Date.now(), label: "Hoy", xp, coins };
    return [...INITIAL_HISTORY, today];
  }, [xp, coins]);

  // Compute chart dimensions
  const width = 600;
  const height = 180;
  const padX = 30;
  const padY = 20;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const maxXp = Math.max(...data.map((d) => d.xp), 100);
  const maxCoins = Math.max(...data.map((d) => d.coins), 100);

  const xpPoints = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padY + innerH - (d.xp / maxXp) * innerH,
    ...d,
  }));
  const coinPoints = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padY + innerH - (d.coins / maxCoins) * innerH,
    ...d,
  }));

  const xpPath = xpPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const coinPath = coinPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Stats cards
  const stats = [
    { label: "Nivel", value: level, icon: <Star className="w-4 h-4" />, color: "text-amber" },
    { label: "XP total", value: xp, icon: <TrendingUp className="w-4 h-4" />, color: "text-cyan-hud" },
    { label: "Monedas", value: coins, icon: <Coins className="w-4 h-4" />, color: "text-amber" },
    { label: "Racha", value: streak, icon: <Zap className="w-4 h-4" />, color: "text-red-hud" },
    { label: "Fusiones", value: fusionCount, icon: <Activity className="w-4 h-4" />, color: "text-violet-hud" },
    { label: "Quiz acertados", value: quizCorrect, icon: <BarChart3 className="w-4 h-4" />, color: "text-green-hud" },
  ];

  // Activity breakdown for bar chart
  const activityData = [
    { label: "Noticias", value: viewedNews.length, max: 30, color: "bg-amber" },
    { label: "Fotos", value: viewedPhotos.length, max: 12, color: "bg-violet-hud" },
    { label: "Predicciones", value: predictions.length, max: 8, color: "bg-cyan-hud" },
    { label: "Fusiones", value: fusionCount, max: 10, color: "bg-red-hud" },
    { label: "Quiz", value: quizCorrect, max: 12, color: "bg-green-hud" },
  ];

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Estadisticas y progreso"
        subtitle="Evolucion de tu operador · 7 dias"
        icon={<BarChart3 className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="hud-corner p-2 bg-secondary/30">
            <div className="flex items-center gap-1 mb-1">
              <span className={s.color}>{s.icon}</span>
              <span className="text-[9px] font-mono text-muted-foreground uppercase">{s.label}</span>
            </div>
            <div className={cn("text-lg font-mono font-bold tabular-nums", s.color)}>
              {s.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Line chart XP and coins */}
      <div className="hud-corner p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber" />
            <span className="text-xs font-mono font-bold text-foreground uppercase">Progreso de XP y monedas</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-cyan-hud">
              <span className="w-2 h-0.5 bg-cyan-hud inline-block" /> XP
            </span>
            <span className="flex items-center gap-1 text-amber">
              <span className="w-2 h-0.5 bg-amber inline-block" /> Monedas
            </span>
          </div>
        </div>

        <div className="overflow-x-auto thin-scroll">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 480 }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p) => (
              <line
                key={p}
                x1={padX}
                x2={width - padX}
                y1={padY + innerH * p}
                y2={padY + innerH * p}
                stroke="rgba(217,167,32,0.08)"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
            ))}
            {/* Y axis labels */}
            <text x={padX - 5} y={padY + 4} textAnchor="end" fontSize="8" fill="rgba(150,150,150,0.7)" fontFamily="monospace">{maxXp}</text>
            <text x={padX - 5} y={padY + innerH} textAnchor="end" fontSize="8" fill="rgba(150,150,150,0.7)" fontFamily="monospace">0</text>
            {/* XP area fill */}
            <path
              d={`${xpPath} L ${xpPoints[xpPoints.length - 1].x} ${padY + innerH} L ${xpPoints[0].x} ${padY + innerH} Z`}
              fill="rgba(34,211,238,0.1)"
            />
            {/* XP line */}
            <path d={xpPath} fill="none" stroke="#22d3ee" strokeWidth="2" />
            {/* Coin line */}
            <path d={coinPath} fill="none" stroke="#d9a720" strokeWidth="2" strokeDasharray="0" />
            {/* Points + labels */}
            {xpPoints.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="3" fill="#22d3ee" />
                <text x={p.x} y={height - 5} textAnchor="middle" fontSize="8" fill="rgba(150,150,150,0.7)" fontFamily="monospace">{p.label}</text>
              </g>
            ))}
            {coinPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="2" fill="#d9a720" />
            ))}
            {/* Latest point marker */}
            {xpPoints.length > 0 && (
              <g>
                <circle cx={xpPoints[xpPoints.length - 1].x} cy={xpPoints[xpPoints.length - 1].y} r="5" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.6" />
                <text x={xpPoints[xpPoints.length - 1].x} y={xpPoints[xpPoints.length - 1].y - 10} textAnchor="middle" fontSize="9" fill="#22d3ee" fontFamily="monospace" fontWeight="bold">{xp}</text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Activity breakdown */}
      <div className="hud-corner p-3">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-amber" />
          <span className="text-xs font-mono font-bold text-foreground uppercase">Desglose de actividad</span>
        </div>
        <div className="space-y-2">
          {activityData.map((a) => {
            const pct = Math.min(100, Math.round((a.value / a.max) * 100));
            return (
              <div key={a.label}>
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-muted-foreground uppercase">{a.label}</span>
                  <span className="text-foreground tabular-nums">{a.value} / {a.max}</span>
                </div>
                <div className="h-2 hud-corner bg-secondary overflow-hidden">
                  <div
                    className={cn("h-full transition-all", a.color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini-game stats */}
      <div className="hud-corner p-3 bg-secondary/30">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Mejor puntuacion mini-game</div>
            <div className="text-2xl font-mono font-bold text-amber tabular-nums">{minigameBestScore}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Sesion actual</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-0.5 text-amber font-mono"><Coins className="w-3 h-3" /> {coins}</span>
              <span className="flex items-center gap-0.5 text-cyan-hud font-mono"><Star className="w-3 h-3" /> {xp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
