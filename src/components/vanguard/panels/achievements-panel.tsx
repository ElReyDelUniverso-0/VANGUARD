"use client";

import { ACHIEVEMENTS, type Achievement, type AchievementState } from "@/lib/game-data";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Award, Lock, Check, Coins, Gem, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect } from "react";
import { sfx } from "@/lib/sound";
import { motion } from "framer-motion";

const rarityColor: Record<string, string> = {
  COMUN: "text-muted-foreground border-border",
  RARO: "text-cyan-hud border-cyan-hud",
  EPICO: "text-violet-hud border-violet-hud",
  LEGENDARIO: "text-amber border-amber-hud",
};

const rarityGlow: Record<string, string> = {
  COMUN: "",
  RARO: "glow-cyan",
  EPICO: "glow-amber",
  LEGENDARIO: "glow-amber",
};

const catColor: Record<string, string> = {
  PROGRESO: "text-amber border-amber-hud bg-amber-hud/30",
  COMBATE: "text-red-hud border-red-hud bg-red-hud/30",
  INTEL: "text-cyan-hud border-cyan-hud bg-cyan-hud/30",
  SOCIAL: "text-green-hud border-green-hud bg-green-hud/30",
  ESPECIAL: "text-violet-hud border-violet-hud bg-violet-hud/30",
};

export function AchievementsPanel() {
  const {
    unlockedAchievements,
    claimedAchievements,
    claimAchievement,
    checkAchievements,
    level,
    streak,
    fusionCount,
    quizCorrect,
    readBriefings,
    viewedNews,
    viewedPhotos,
    openedMaps,
    predictions,
    coins,
    gems,
    unlockedBriefings,
    missionProgress,
    visitedTabs,
    minigameBestScore,
    cameras,
    cameraTotalEvents,
    cameraTotalIncome,
  } = useGameStore();

  // auto-check on mount and whenever relevant state changes
  useEffect(() => {
    const newly = checkAchievements();
    if (newly.length > 0) {
      sfx.achievement();
      const ach = ACHIEVEMENTS.find((a) => a.id === newly[0]);
      toast.success(`Logro desbloqueado: ${ach?.title}`, {
        description: ach?.description,
      });
    }
  }, [level, streak, fusionCount, quizCorrect, readBriefings.length, viewedNews.length, viewedPhotos.length, openedMaps.length, predictions.length, coins, unlockedBriefings.length, visitedTabs, minigameBestScore, cameras.length, cameraTotalEvents]);

  const snapshot: AchievementState = {
    level,
    streak,
    fusionCount,
    quizCorrect,
    readBriefings: readBriefings.length,
    viewedNews: viewedNews.length,
    viewedPhotos: viewedPhotos.length,
    openedMaps: openedMaps.length,
    predictions: predictions.length,
    coins,
    gems,
    unlockedBriefings: unlockedBriefings.length,
    claimedMissions: Object.values(missionProgress).filter((m) => m.claimed).length,
    logrosUnlocked: unlockedAchievements.length,
    visitedTabs,
    minigameBestScore,
    camerasPlaced: cameras.length,
    cameraEvents: cameraTotalEvents,
    cameraIncome: cameraTotalIncome,
  };

  const handleClaim = (a: Achievement) => {
    if (!unlockedAchievements.includes(a.id) || claimedAchievements.includes(a.id)) return;
    claimAchievement(a.id, { xp: a.xpReward, coins: a.coinReward, gems: a.gemReward });
    sfx.success();
    toast.success(`Logro reclamado: ${a.title}`, {
      description: `+${a.coinReward} monedas · +${a.xpReward} XP${a.gemReward ? ` · +${a.gemReward} gemas` : ""}`,
    });
  };

  const cats = ["PROGRESO", "GUERRA", "MERCADO", "GANANCIAS", "VIGILANCIA", "COMBATE", "INTEL", "SOCIAL", "ESPECIAL"];
  const totalUnlocked = unlockedAchievements.length;
  const totalClaimed = claimedAchievements.length;
  const totalXp = ACHIEVEMENTS.reduce((acc, a) => acc + (claimedAchievements.includes(a.id) ? a.xpReward : 0), 0);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Centro de logros"
        subtitle="Hitos a largo plazo · recompensas permanentes"
        icon={<Award className="w-4 h-4 text-green-hud" />}
        color="green"
        right={
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-green-hud">{totalUnlocked}/{ACHIEVEMENTS.length}</span>
            <span className="text-amber flex items-center gap-0.5"><Trophy className="w-3 h-3" /> {totalClaimed}</span>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="hud-corner p-3 bg-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Desbloqueados</div>
          <div className="text-2xl font-mono font-bold text-green-hud">{totalUnlocked}</div>
        </div>
        <div className="hud-corner p-3 bg-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Reclamados</div>
          <div className="text-2xl font-mono font-bold text-amber">{totalClaimed}</div>
        </div>
        <div className="hud-corner p-3 bg-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">XP ganada</div>
          <div className="text-2xl font-mono font-bold text-cyan-hud">{totalXp.toLocaleString()}</div>
        </div>
        <div className="hud-corner p-3 bg-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Progreso</div>
          <div className="text-2xl font-mono font-bold text-violet-hud">
            {Math.round((totalUnlocked / ACHIEVEMENTS.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Categories */}
      {cats.map((cat) => {
        const list = ACHIEVEMENTS.filter((a) => a.category === cat);
        if (list.length === 0) return null;
        return (
          <div key={cat} className="space-y-2">
            <div className="flex items-center gap-2 sticky top-[100px] bg-background/80 backdrop-blur-sm py-1 z-10">
              <div className={cn("text-xs font-mono font-bold uppercase px-2 py-1 border", catColor[cat])}>
                {cat}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {list.filter((a) => unlockedAchievements.includes(a.id)).length}/{list.length} desbloqueados
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {list.map((a) => {
                const unlocked = unlockedAchievements.includes(a.id);
                const claimed = claimedAchievements.includes(a.id);
                const prog = a.progress(snapshot);
                const pct = Math.min(100, Math.round((prog.current / prog.target) * 100));
                return (
                  <motion.div
                    key={a.id}
                    layout
                    className={cn(
                      "hud-corner p-3 transition-all relative",
                      unlocked && rarityGlow[a.rarity],
                      !unlocked && "opacity-70",
                      claimed && "opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className={cn(
                        "w-10 h-10 hud-corner flex items-center justify-center text-xl flex-shrink-0",
                        unlocked ? "bg-secondary" : "bg-secondary/40 grayscale",
                        unlocked && rarityColor[a.rarity]
                      )}>
                        {unlocked ? <VIcon k={a.icon} className="w-5 h-5 text-amber" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border uppercase", rarityColor[a.rarity])}>
                            {a.rarity}
                          </span>
                          {claimed && (
                            <span className="flex items-center gap-0.5 text-[9px] font-mono text-green-hud">
                              <Check className="w-2.5 h-2.5" /> reclamado
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono font-bold text-foreground truncate">{a.title}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-2">{a.description}</div>
                      </div>
                    </div>

                    {!unlocked && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground mb-0.5">
                          <span>Progreso</span>
                          <span className="tabular-nums">{prog.current}/{prog.target}</span>
                        </div>
                        <div className="h-1 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-amber transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        {a.coinReward > 0 && (
                          <span className="flex items-center gap-0.5 text-amber"><Coins className="w-3 h-3" /> {a.coinReward}</span>
                        )}
                        <span className="flex items-center gap-0.5 text-cyan-hud"><Star className="w-3 h-3" /> {a.xpReward}</span>
                        {a.gemReward > 0 && (
                          <span className="flex items-center gap-0.5 text-violet-hud"><Gem className="w-3 h-3" /> {a.gemReward}</span>
                        )}
                      </div>
                      {unlocked && !claimed && (
                        <Button
                          size="sm"
                          onClick={() => handleClaim(a)}
                          className="h-7 px-2 text-[10px] font-mono uppercase bg-green-hud/30 border border-green-hud text-green-hud hover:bg-green-hud/50"
                        >
                          Reclamar
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
