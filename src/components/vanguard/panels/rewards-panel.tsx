"use client";

import { WEEKLY_REWARDS, RANKS, getRankForLevel } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Trophy, Coins, Gem, Star, Check, Lock, Calendar, Gift, Flame, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

const DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function currentDayIndex(d = new Date()) {
  return (d.getDay() + 6) % 7;
}

function currentWeekKey(d = new Date()) {
  const year = d.getFullYear();
  const start = new Date(year, 0, 1);
  const diff = (d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const week = Math.ceil((diff + start.getDay() + 1) / 7);
  return `${year}-W${week}`;
}

export function RewardsPanel() {
  const { claimedWeeklyDays, streak, level, rank, claimWeeklyDay, coins, gems, xp, fusionCount, quizCorrect } = useGameStore();
  const today = currentDayIndex();
  const weekKey = currentWeekKey();
  // Reset claimed days if week changed (simple approach: store week with claimed)
  const claimedThisWeek = claimedWeeklyDays; // simplificacion: se asume reset semanal por persistencia en store

  const handleClaim = (day: number) => {
    if (claimedThisWeek.includes(day)) return;
    if (day > today) {
      toast.error("Dia no disponible", { description: "Vuelve manana para reclamar" });
      return;
    }
    const reward = WEEKLY_REWARDS[day];
    claimWeeklyDay(day, {
      coins: reward.coinReward,
      gems: reward.gemReward,
      xp: reward.xpReward,
    });
    toast.success(`Recompensa reclamada: ${reward.title}`, {
      description: `+${reward.coinReward} monedas · +${reward.gemReward} gemas · +${reward.xpReward} XP`,
    });
  };

  const rankInfo = getRankForLevel(level);
  const nextRank = RANKS.find((r) => r.minLevel > level);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Recompensas semanales"
        subtitle={`Semana ${weekKey} · racha ${streak} dias`}
        icon={<Trophy className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="flex items-center gap-0.5 text-amber"><Coins className="w-3 h-3" /> {coins}</span>
            <span className="flex items-center gap-0.5 text-violet-hud"><Gem className="w-3 h-3" /> {gems}</span>
          </div>
        }
      />

      {/* Daily calendar */}
      <div className="hud-corner p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Calendario de la semana</div>
          <div className="text-[10px] font-mono text-amber">
            {claimedThisWeek.length}/{WEEKLY_REWARDS.length} reclamados
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKLY_REWARDS.map((r, i) => {
            const claimed = claimedThisWeek.includes(i);
            const available = i <= today && !claimed;
            const locked = i > today;
            return (
              <motion.button
                key={i}
                onClick={() => handleClaim(i)}
                disabled={claimed || locked}
                whileHover={available ? { scale: 1.03 } : undefined}
                className={cn(
                  "hud-corner p-2 text-center transition-all relative",
                  claimed && "bg-green-hud/20 border-green-hud",
                  available && "bg-amber-hud/30 border-amber-hud glow-amber blink-soft cursor-pointer",
                  locked && "opacity-50"
                )}
              >
                <div className="text-[9px] font-mono text-muted-foreground uppercase">{DAYS[i]}</div>
                <div className="text-2xl my-1">
                  {claimed ? <Check className="w-4 h-4 mx-auto text-green-hud" /> : locked ? <Lock className="w-4 h-4 mx-auto text-muted-foreground" /> : r.title.includes("Cofre") || r.title.includes("Capsula") ? <Gift className="w-4 h-4 mx-auto text-amber" /> : <Package className="w-4 h-4 mx-auto text-cyan-hud" />}
                </div>
                <div className="text-[8px] font-mono text-amber">{r.coinReward}c</div>
                {r.gemReward > 0 && (
                  <div className="text-[8px] font-mono text-violet-hud">{r.gemReward}G</div>
                )}
                {available && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-hud rounded-full flex items-center justify-center">
                    <span className="text-[7px] font-bold text-white">!</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Reward detail cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {WEEKLY_REWARDS.map((r, i) => {
          const claimed = claimedThisWeek.includes(i);
          const available = i <= today && !claimed;
          const locked = i > today;
          return (
            <div
              key={i}
              className={cn(
                "hud-corner p-3",
                claimed && "opacity-50",
                available && "glow-amber"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={cn(
                  "w-8 h-8 hud-corner flex items-center justify-center text-sm font-mono font-bold",
                  claimed ? "bg-green-hud text-green-hud" : available ? "bg-amber-hud text-amber" : "bg-secondary text-muted-foreground"
                )}>
                  {DAYS[i][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">{DAYS[i]}</div>
                  <div className="text-xs font-mono font-bold text-foreground truncate">{r.title}</div>
                </div>
                {claimed && <Check className="w-4 h-4 text-green-hud" />}
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">{r.description}</p>
              <div className="flex items-center gap-2 text-[10px] font-mono mb-2">
                <span className="flex items-center gap-0.5 text-amber"><Coins className="w-3 h-3" /> {r.coinReward}</span>
                <span className="flex items-center gap-0.5 text-violet-hud"><Gem className="w-3 h-3" /> {r.gemReward}</span>
                <span className="flex items-center gap-0.5 text-cyan-hud"><Star className="w-3 h-3" /> {r.xpReward}</span>
              </div>
              <Button
                size="sm"
                onClick={() => handleClaim(i)}
                disabled={claimed || locked}
                className={cn(
                  "w-full h-7 text-[10px] font-mono uppercase",
                  claimed
                    ? "bg-green-hud/20 border border-green-hud text-green-hud"
                    : available
                    ? "bg-amber-hud text-amber hover:bg-amber-hud/80"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {claimed ? "Reclamado" : available ? "Reclamar" : "Bloqueado"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Player progress overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="hud-corner p-3 bg-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Flame className="w-3 h-3 text-red-hud" /> Racha
          </div>
          <div className="text-2xl font-mono font-bold text-red-hud">{streak} dias</div>
        </div>
        <div className="hud-corner p-3 bg-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber" /> Rango
          </div>
          <div className={cn("text-2xl font-mono font-bold", rankInfo.color)}>{rank}</div>
          <div className="text-[9px] font-mono text-muted-foreground">nivel {level}</div>
        </div>
        <div className="hud-corner p-3 bg-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Star className="w-3 h-3 text-cyan-hud" /> XP total
          </div>
          <div className="text-2xl font-mono font-bold text-cyan-hud">{xp.toLocaleString()}</div>
        </div>
        <div className="hud-corner p-3 bg-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Gift className="w-3 h-3 text-violet-hud" /> Fusiones
          </div>
          <div className="text-2xl font-mono font-bold text-violet-hud">{fusionCount}</div>
        </div>
      </div>

      {/* Next rank progress */}
      {nextRank && (
        <div className="hud-corner p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase">Proximo rango</div>
              <div className={cn("text-base font-mono font-bold", nextRank.color)}>{nextRank.name}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-muted-foreground uppercase">Requisito</div>
              <div className="text-base font-mono font-bold text-amber">nivel {nextRank.minLevel}</div>
            </div>
          </div>
          <div className="h-2 hud-corner bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber to-orange-500"
              style={{ width: `${Math.min(100, (level / nextRank.minLevel) * 100)}%` }}
            />
          </div>
          <div className="text-[9px] font-mono text-muted-foreground mt-1">
            Faltan {nextRank.minLevel - level} niveles · sigue completando misiones y quizzes
          </div>
        </div>
      )}
    </div>
  );
}
