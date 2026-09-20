"use client";

import { useState } from "react";
import { MISSION_TEMPLATES, type MissionTemplate } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Target, CheckCircle2, Lock, Trophy, Coins, Gem, Star, Zap, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const difficultyColor: Record<string, string> = {
  EASY: "text-green-hud border-green-hud",
  NORMAL: "text-cyan-hud border-cyan-hud",
  HARD: "text-amber border-amber-hud",
  EXTREME: "text-red-hud border-red-hud",
};

const categoryLabel: Record<string, string> = {
  DAILY: "Diaria",
  WEEKLY: "Semanal",
  SPECIAL: "Especial",
  STORY: "Historia",
};

const categoryColor: Record<string, string> = {
  DAILY: "bg-cyan-hud text-cyan-hud border-cyan-hud",
  WEEKLY: "bg-amber-hud text-amber border-amber-hud",
  SPECIAL: "bg-violet-hud text-violet-hud border-violet-hud",
  STORY: "bg-red-hud text-red-hud border-red-hud",
};

export function MissionsPanel() {
  const { missionProgress, claimMission } = useGameStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "COMPLETED" | "PENDING" | "CLAIMED">("ALL");

  const filterMission = (m: MissionTemplate) => {
    if (search) {
      const q = search.toLowerCase();
      if (!m.title.toLowerCase().includes(q) && !m.description.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== "ALL") {
      const p = missionProgress[m.code] ?? { progress: 0, completed: false, claimed: false };
      const progress = Math.min(p.progress, m.target);
      const isComplete = progress >= m.target;
      if (statusFilter === "COMPLETED" && !isComplete) return false;
      if (statusFilter === "PENDING" && isComplete) return false;
      if (statusFilter === "CLAIMED" && !p.claimed) return false;
    }
    return true;
  };

  const grouped = {
    DAILY: MISSION_TEMPLATES.filter((m) => m.category === "DAILY" && filterMission(m)),
    WEEKLY: MISSION_TEMPLATES.filter((m) => m.category === "WEEKLY" && filterMission(m)),
    SPECIAL: MISSION_TEMPLATES.filter((m) => m.category === "SPECIAL" && filterMission(m)),
    STORY: MISSION_TEMPLATES.filter((m) => m.category === "STORY" && filterMission(m)),
  };

  const totalFiltered = grouped.DAILY.length + grouped.WEEKLY.length + grouped.SPECIAL.length + grouped.STORY.length;

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Centro de misiones"
        subtitle="Completa objetivos · gana monedas y XP"
        icon={<Target className="w-4 h-4 text-amber" />}
        color="red"
      />

      {/* Search + status filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar mision por titulo o descripcion..."
            className="pl-7 h-8 bg-secondary border-amber-hud/40 font-mono text-xs"
          />
        </div>
        <div className="flex gap-1">
          {(["ALL", "COMPLETED", "PENDING", "CLAIMED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-2 py-1 border text-[10px] font-mono uppercase",
                statusFilter === f
                  ? "border-red-hud text-red-hud bg-red-hud/30"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "ALL" ? "Todas" : f === "COMPLETED" ? "Completas" : f === "PENDING" ? "Pendientes" : "Reclamadas"}
            </button>
          ))}
        </div>
      </div>

      {totalFiltered === 0 && (
        <div className="hud-corner p-8 text-center">
          <Search className="w-8 h-8 mx-auto text-muted-foreground opacity-40 mb-2" />
          <p className="text-sm font-mono text-muted-foreground">Sin misiones que coincidan con tu busqueda</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {(["DAILY", "WEEKLY", "SPECIAL", "STORY"] as const).map((cat) => {
          const list = grouped[cat];
          const completedCount = list.filter((m) => {
            const p = missionProgress[m.code];
            return p && p.progress >= m.target;
          }).length;
          const claimedCount = list.filter((m) => missionProgress[m.code]?.claimed).length;
          return (
            <div key={cat} className="hud-corner p-3">
              <div className="flex items-center justify-between mb-2">
                <div className={cn("text-[10px] font-mono font-bold uppercase px-2 py-0.5 border", categoryColor[cat])}>
                  {categoryLabel[cat]}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">
                  {claimedCount}/{list.length} OK
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {completedCount} completadas · {list.length - claimedCount} pendientes
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    cat === "DAILY" ? "bg-cyan-hud" : cat === "WEEKLY" ? "bg-amber" : cat === "SPECIAL" ? "bg-violet-hud" : "bg-red-hud"
                  )}
                  style={{ width: `${(claimedCount / list.length) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
        {/* Hidden 4th cell becomes total stats */}
        <div className="hud-corner p-3 bg-secondary/30">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Progreso total</div>
          <div className="text-2xl font-mono font-bold text-amber">
            {MISSION_TEMPLATES.filter((m) => missionProgress[m.code]?.claimed).length}/{MISSION_TEMPLATES.length}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">misiones reclamadas</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {(["DAILY", "WEEKLY", "SPECIAL", "STORY"] as const).map((cat) => {
          if (grouped[cat].length === 0 && (search || statusFilter !== "ALL")) return null;
          return (
          <div key={cat} className="space-y-2">
            <div className="flex items-center gap-2 sticky top-[100px] bg-background/80 backdrop-blur-sm py-1 z-10">
              <div className={cn("text-xs font-mono font-bold uppercase px-2 py-1 border", categoryColor[cat])}>
                {categoryLabel[cat]}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {grouped[cat].length} misiones
              </div>
            </div>
            {grouped[cat].map((m) => (
              <MissionCard key={m.code} mission={m} />
            ))}
          </div>
          );
        })}
      </div>
    </div>
  );
}

function MissionCard({ mission }: { mission: MissionTemplate }) {
  const { missionProgress, claimMission } = useGameStore();
  const p = missionProgress[mission.code] ?? { progress: 0, completed: false, claimed: false };
  const progress = Math.min(p.progress, mission.target);
  const isComplete = progress >= mission.target;
  const canClaim = isComplete && !p.claimed;

  const handleClaim = () => {
    claimMission(mission.code, {
      xp: mission.xpReward,
      coins: mission.coinReward,
      gems: mission.gemReward,
    });
    toast.success(`Mision reclamada: ${mission.title}`, {
      description: `+${mission.coinReward} monedas · +${mission.xpReward} XP${mission.gemReward ? ` · +${mission.gemReward} gemas` : ""}`,
    });
  };

  return (
    <motion.div
      layout
      className={cn(
        "hud-corner p-3 pl-4 pt-4 transition-all",
        p.claimed && "opacity-50",
        canClaim && "glow-amber border-amber-hud"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border uppercase", difficultyColor[mission.difficulty])}>
              {mission.difficulty}
            </span>
            {mission.gemReward > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] font-mono text-violet-hud">
                <Gem className="w-2.5 h-2.5" /> {mission.gemReward}
              </span>
            )}
          </div>
          <div className="text-sm font-mono font-bold text-foreground break-words">{mission.title}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5 break-words">{mission.description}</div>
        </div>
        {p.claimed ? (
          <CheckCircle2 className="w-5 h-5 text-green-hud flex-shrink-0" />
        ) : isComplete ? (
          <Trophy className="w-5 h-5 text-amber flex-shrink-0 blink-soft" />
        ) : (
          <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all",
              isComplete ? "bg-green-hud" : "bg-amber"
            )}
            style={{ width: `${(progress / mission.target) * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
          {progress}/{mission.target}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-0.5 text-amber">
            <Coins className="w-3 h-3" /> {mission.coinReward}
          </span>
          <span className="flex items-center gap-0.5 text-cyan-hud">
            <Star className="w-3 h-3" /> {mission.xpReward} XP
          </span>
          {mission.gemReward > 0 && (
            <span className="flex items-center gap-0.5 text-violet-hud">
              <Gem className="w-3 h-3" /> {mission.gemReward}
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleClaim}
          disabled={!canClaim}
          className={cn(
            "h-7 px-2 text-[10px] font-mono uppercase tracking-wider",
            canClaim
              ? "bg-amber-hud text-amber hover:bg-amber-hud/80"
              : "bg-secondary text-muted-foreground"
          )}
        >
          {p.claimed ? "Reclamada" : canClaim ? "Reclamar" : "En progreso"}
        </Button>
      </div>
    </motion.div>
  );
}
