"use client";

import { useState } from "react";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { TOURNAMENTS, type Tournament } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Trophy, Crown, Medal, Clock, Coins, Gem, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const rankColor: Record<number, string> = {
  1: "text-amber border-amber-hud bg-amber-hud/30",
  2: "text-muted-foreground border-border bg-secondary",
  3: "text-orange-400 border-orange-500/40 bg-orange-500/10",
};

export function TournamentsPanel() {
  const [activeId, setActiveId] = useState(TOURNAMENTS[0].id);
  const { alias, level, quizCorrect, minigameTotalScore, xp } = useGameStore();

  const active = TOURNAMENTS.find((t) => t.id === activeId)!;

  // Compute player score based on tournament category
  const getPlayerScore = (t: Tournament) => {
    if (t.id === "T-QUIZ-WEEK") return quizCorrect;
    if (t.id === "T-MINIGAME-WEEK") return minigameTotalScore;
    if (t.id === "T-XP-WEEK") return xp;
    return 0;
  };

  const playerScore = getPlayerScore(active);

  // Insert player into leaderboard and re-sort
  const playerEntry = {
    rank: 0,
    alias,
    avatar: "medal",
    score: playerScore,
    level,
    isPlayer: true,
  };
  const fullBoard = [...active.leaderboard, playerEntry]
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }));
  const playerRank = fullBoard.find((e) => e.isPlayer)?.rank ?? 8;

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Torneos semanales"
        subtitle="Compite con otros operadores · premios en monedas y gemas"
        icon={<Trophy className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <div className="text-[10px] font-mono text-muted-foreground">
            Tu rango: <span className="text-amber">#{playerRank}</span>
          </div>
        }
      />

      {/* Tournament selector */}
      <div className="grid sm:grid-cols-3 gap-2">
        {TOURNAMENTS.map((t) => {
          const isActive = t.id === activeId;
          const ps = getPlayerScore(t);
          return (
            <motion.button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "hud-corner p-3 text-left transition-all",
                isActive && "glow-amber border-amber-hud bg-amber-hud/10"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-[9px] font-mono px-1.5 py-0.5 border uppercase",
                  isActive ? "border-amber-hud text-amber bg-amber-hud/30" : "border-border text-muted-foreground"
                )}>
                  {t.category}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> {t.endsIn}
                </span>
              </div>
              <div className="text-sm font-mono font-bold text-foreground">{t.title}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{t.metric}</div>
              <div className="flex items-center gap-2 mt-2 text-[10px] font-mono">
                <span className="flex items-center gap-0.5 text-amber"><Coins className="w-3 h-3" /> {t.topPrize.coins}</span>
                <span className="flex items-center gap-0.5 text-violet-hud"><Gem className="w-3 h-3" /> {t.topPrize.gems}</span>
                <span className="ml-auto text-cyan-hud">Tú: {ps}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Active tournament detail */}
      <div className="hud-corner overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-amber-hud/30 bg-gradient-to-r from-amber-hud/20 to-transparent flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber" />
              <h3 className="text-base font-mono font-bold text-amber">{active.title}</h3>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase mt-0.5">{active.metric}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Termina en</div>
            <div className="text-base font-mono font-bold text-red-hud blink-soft">{active.endsIn}</div>
          </div>
        </div>

        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-secondary/30">
          {fullBoard.filter((e) => e.rank <= 3).map((e) => (
            <div
              key={e.rank}
              className={cn(
                "hud-corner p-2 text-center relative",
                e.rank === 1 && "border-amber-hud bg-amber-hud/20 glow-amber",
                e.rank === 2 && "border-muted-foreground/40 bg-secondary",
                e.rank === 3 && "border-orange-500/40 bg-orange-500/10",
                e.isPlayer && "ring-1 ring-cyan-hud"
              )}
            >
              {e.rank === 1 && <Crown className="w-4 h-4 text-amber mx-auto mb-1" />}
              {e.rank === 2 && <Medal className="w-4 h-4 text-muted-foreground mx-auto mb-1" />}
              {e.rank === 3 && <Medal className="w-4 h-4 text-orange-400 mx-auto mb-1" />}
              <div className="text-2xl mb-1 flex justify-center"><VIcon k={e.avatar} className="w-7 h-7 text-amber" /></div>
              <div className="text-xs font-mono font-bold text-foreground truncate">{e.alias}</div>
              <div className="text-sm font-mono font-bold text-amber">{e.score.toLocaleString()}</div>
              <div className="text-[9px] font-mono text-muted-foreground">Nivel {e.level}</div>
              {e.isPlayer && (
                <div className="absolute -top-1 -right-1 text-[8px] font-mono px-1 py-0.5 bg-cyan-hud text-background font-bold">TÚ</div>
              )}
            </div>
          ))}
        </div>

        {/* Full leaderboard */}
        <div className="p-2">
          <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2 px-1">Clasificacion completa</div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto thin-scroll">
            {fullBoard.map((e) => (
              <div
                key={`${e.alias}-${e.rank}`}
                className={cn(
                  "flex items-center gap-2 p-2 hud-corner transition-all",
                  e.isPlayer && "border-cyan-hud bg-cyan-hud/20 glow-cyan",
                  e.rank <= 3 && !e.isPlayer && "bg-secondary/40"
                )}
              >
                <div className={cn(
                  "w-7 h-7 hud-corner flex items-center justify-center text-xs font-mono font-bold flex-shrink-0",
                  e.rank === 1 ? "text-amber bg-amber-hud/30" :
                  e.rank === 2 ? "text-muted-foreground bg-secondary" :
                  e.rank === 3 ? "text-orange-400 bg-orange-500/10" :
                  "text-muted-foreground bg-secondary/50"
                )}>
                  {e.rank}
                </div>
                <div className="text-xl flex-shrink-0"><VIcon k={e.avatar} className="w-6 h-6 text-amber" /></div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-xs font-mono font-bold truncate", e.isPlayer ? "text-cyan-hud" : "text-foreground")}>
                    {e.alias} {e.isPlayer && <span className="text-[9px]">(TÚ)</span>}
                  </div>
                  <div className="text-[9px] font-mono text-muted-foreground">Nivel {e.level}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-mono font-bold text-amber tabular-nums">{e.score.toLocaleString()}</div>
                  <div className="text-[9px] font-mono text-muted-foreground uppercase">pts</div>
                </div>
                {e.rank === 1 && <Crown className="w-4 h-4 text-amber flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Prize info */}
        <div className="p-3 border-t border-amber-hud/30 bg-secondary/30 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Premio al #1</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-0.5 text-amber font-mono font-bold"><Coins className="w-3.5 h-3.5" /> {active.topPrize.coins}</span>
              <span className="flex items-center gap-0.5 text-violet-hud font-mono font-bold"><Gem className="w-3.5 h-3.5" /> {active.topPrize.gems}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Tu posicion</div>
            <div className="text-base font-mono font-bold text-cyan-hud">#{playerRank}</div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="hud-corner p-3 bg-secondary/30 text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5 mb-1">
          <Star className="w-3 h-3 text-amber" />
          <span className="text-amber uppercase">Como participar</span>
        </div>
        Los torneos se actualizan automaticamente con tu actividad. Sigue completando misiones, quizzes y mini-juegos para escalar posiciones. La temporada termina segun el contador y los premios se acreditan automaticamente al finalizar.
      </div>
    </div>
  );
}
