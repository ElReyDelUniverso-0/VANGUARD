"use client";

import { DAILY_CHALLENGES } from "@/lib/game-data";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Zap, Check, Coins, Star, RefreshCw, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { sfx } from "@/lib/sound";
import { motion } from "framer-motion";
import { useEffect } from "react";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyChallengesPanel() {
  const { dailyChallengeProgress, dailyChallengeClaimed, dailyChallengeDate, claimDailyChallenge } = useGameStore();

  // Reset daily challenges if it's a new day
  const today = todayKey();
  const isToday = dailyChallengeDate === today;

  // Auto-initialize today's session if not set
  useEffect(() => {
    if (!isToday) {
      useGameStore.setState({
        dailyChallengeDate: today,
        // keep progress but mark as today
      });
    }
  }, [isToday, today]);

  const challenges = DAILY_CHALLENGES;

  const claimedCount = dailyChallengeClaimed.length;
  const totalCompleted = challenges.filter((c) => (dailyChallengeProgress[c.id] || 0) >= c.target).length;

  const handleClaim = (challengeId: string, xp: number, coins: number, title: string) => {
    if (dailyChallengeClaimed.includes(challengeId)) return;
    const prog = dailyChallengeProgress[challengeId] || 0;
    const challenge = challenges.find((c) => c.id === challengeId)!;
    if (prog < challenge.target) {
      toast.error("Reto no completado", { description: `Te faltan ${challenge.target - prog} acciones` });
      return;
    }
    claimDailyChallenge(challengeId, { xp, coins });
    sfx.success();
    toast.success(`Reto reclamado: ${title}`, {
      description: `+${coins} monedas · +${xp} XP`,
    });
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Retos diarios"
        subtitle="Mini-objetivos rotativos · reinicio cada 24h"
        icon={<Zap className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-green-hud">{totalCompleted}/{challenges.length} completados</span>
            <span className="text-amber">{claimedCount} reclamados</span>
          </div>
        }
      />

      {/* Summary bar */}
      <div className="hud-corner p-3 bg-gradient-to-r from-amber-hud/20 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber" />
            <div>
              <div className="text-xs font-mono font-bold text-foreground">Sesion del dia</div>
              <div className="text-[10px] font-mono text-muted-foreground">{today}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Recompensa total</div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-0.5 text-amber font-mono font-bold"><Coins className="w-3 h-3" /> {challenges.reduce((a, c) => a + c.coinReward, 0)}</span>
              <span className="flex items-center gap-0.5 text-cyan-hud font-mono font-bold"><Star className="w-3 h-3" /> {challenges.reduce((a, c) => a + c.xpReward, 0)}</span>
            </div>
          </div>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber to-orange-500 transition-all"
            style={{ width: `${(totalCompleted / challenges.length) * 100}%` }}
          />
        </div>
        <div className="text-[10px] font-mono text-muted-foreground mt-1">
          {Math.round((totalCompleted / challenges.length) * 100)}% completado · {challenges.length - totalCompleted} restantes
        </div>
      </div>

      {/* Challenges grid */}
      <div className="grid sm:grid-cols-2 gap-2">
        {challenges.map((c) => {
          const prog = dailyChallengeProgress[c.id] || 0;
          const pct = Math.min(100, Math.round((prog / c.target) * 100));
          const complete = prog >= c.target;
          const claimed = dailyChallengeClaimed.includes(c.id);
          return (
            <motion.div
              key={c.id}
              layout
              className={cn(
                "hud-corner p-3 transition-all",
                claimed && "opacity-60",
                complete && !claimed && "glow-amber border-amber-hud"
              )}
            >
              <div className="flex items-start gap-2 mb-2">
                <div className={cn(
                  "w-9 h-9 hud-corner flex items-center justify-center text-lg flex-shrink-0",
                  complete ? "bg-amber-hud/30 border-amber-hud" : "bg-secondary/40"
                )}>
                  <VIcon k={c.icon} className="w-4 h-4 text-amber" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-bold text-foreground">{c.title}</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-2">{c.description}</div>
                </div>
                {claimed && <Check className="w-4 h-4 text-green-hud flex-shrink-0" />}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all", complete ? "bg-green-hud" : "bg-amber")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground tabular-nums">{prog}/{c.target}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="flex items-center gap-0.5 text-amber"><Coins className="w-3 h-3" /> {c.coinReward}</span>
                  <span className="flex items-center gap-0.5 text-cyan-hud"><Star className="w-3 h-3" /> {c.xpReward}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleClaim(c.id, c.xpReward, c.coinReward, c.title)}
                  disabled={!complete || claimed}
                  className={cn(
                    "h-7 px-2 text-[10px] font-mono uppercase",
                    claimed
                      ? "bg-green-hud/20 border border-green-hud text-green-hud"
                      : complete
                      ? "bg-amber-hud text-amber hover:bg-amber-hud/80"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {claimed ? "Reclamado" : complete ? "Reclamar" : "En progreso"}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Reset info */}
      <div className="hud-corner p-3 bg-secondary/30 flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-amber" />
          <span className="text-muted-foreground">
            Los retos se reinician cada 24h a medianoche (hora local). Sesion activa: {today}
          </span>
        </div>
      </div>
    </div>
  );
}
