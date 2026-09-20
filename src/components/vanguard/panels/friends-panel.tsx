"use client";

import { useState } from "react";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { FRIENDS, type Friend, RANKS } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Users, Search, UserPlus, Crown, Star, Target, Flame, Brain, Gamepad2, TrendingUp, Award, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function FriendsPanel() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ONLINE" | "COMPARE">("ALL");
  const [selected, setSelected] = useState<Friend | null>(null);
  const { alias, level, quizCorrect, minigameBestScore, streak, missionProgress } = useGameStore();
  const claimedMissions = Object.values(missionProgress).filter((m) => m.claimed).length;

  const filtered = FRIENDS.filter((f) => {
    if (filter === "ONLINE" && !f.online) return false;
    if (search && !f.alias.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const onlineCount = FRIENDS.filter((f) => f.online).length;

  const playerStats = {
    quizCorrect,
    minigameBest: minigameBestScore,
    missionsClaimed: claimedMissions,
    streak,
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Aliados y comandos"
        subtitle="Red de operadores · comparativa y seguimiento"
        icon={<Users className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
        right={
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-green-hud flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-hud blink-soft" />
              {onlineCount} en linea
            </span>
            <span className="text-muted-foreground">· {FRIENDS.length} total</span>
          </div>
        }
      />

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar alias..."
            className="pl-7 h-8 bg-secondary border-amber-hud/40 font-mono text-xs"
          />
        </div>
        <div className="flex gap-1">
          {(["ALL", "ONLINE", "COMPARE"] as const).map((f) => (
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
              {f === "ALL" ? "Todos" : f === "ONLINE" ? "En linea" : "Comparar"}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          className="h-8 bg-cyan-hud/30 border border-cyan-hud text-cyan-hud hover:bg-cyan-hud/50 font-mono uppercase text-[10px]"
          onClick={() => toast.info("Funcion simulada", { description: "En modo demo no se pueden anadir amigos reales" })}
        >
          <UserPlus className="w-3 h-3 mr-1" /> Anadir
        </Button>
      </div>

      {/* Compare mode: player vs best friend */}
      {filter === "COMPARE" && (
        <div className="hud-corner p-4 bg-gradient-to-br from-cyan-hud/10 to-transparent">
          <div className="text-[10px] font-mono text-muted-foreground uppercase mb-3 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Comparativa con tu mejor aliado
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Player */}
            <div className="hud-corner p-3 border-cyan-hud bg-cyan-hud/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 hud-corner flex items-center justify-center bg-amber-hud"><VIcon k="medal" className="w-5 h-5 text-amber" /></div>
                <div className="min-w-0">
                  <div className="text-xs font-mono font-bold text-cyan-hud truncate">{alias}</div>
                  <div className="text-[9px] font-mono text-muted-foreground">Nivel {level} · TÚ</div>
                </div>
              </div>
              <CompareStats stats={playerStats} />
            </div>
            {/* Top friend */}
            <div className="hud-corner p-3 border-amber-hud bg-amber-hud/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 hud-corner flex items-center justify-center bg-secondary"><VIcon k="bird" className="w-5 h-5 text-cyan-hud" /></div>
                <div className="min-w-0">
                  <div className="text-xs font-mono font-bold text-amber truncate">FALCON_X</div>
                  <div className="text-[9px] font-mono text-muted-foreground">Nivel 18 · MAYOR</div>
                </div>
              </div>
              <CompareStats stats={{ quizCorrect: 12, minigameBest: 980, missionsClaimed: 14, streak: 12 }} />
            </div>
          </div>
        </div>
      )}

      {/* Friends list */}
      <div className="grid sm:grid-cols-2 gap-2">
        {filtered.map((f, idx) => {
          const totalStats = f.stats.quizCorrect + Math.round(f.stats.minigameBest / 100) + f.stats.missionsClaimed + f.stats.streak;
          return (
            <motion.button
              key={f.id}
              layout
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => setSelected(f)}
              className={cn(
                "hud-corner p-3 text-left transition-all hover:bg-secondary/40",
                f.online && "border-cyan-hud/50"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 hud-corner flex items-center justify-center text-xl bg-secondary">
                    <VIcon k={f.avatar} className="w-5 h-5 text-amber" />
                  </div>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                      f.online ? "bg-green-hud" : "bg-muted-foreground"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <div className="text-xs font-mono font-bold text-foreground truncate">{f.alias}</div>
                    {f.level >= 15 && <Crown className="w-3 h-3 text-amber flex-shrink-0" />}
                  </div>
                  <div className="text-[9px] font-mono text-muted-foreground">
                    Nivel {f.level} · {f.rank}
                  </div>
                  <div className="text-[9px] font-mono text-muted-foreground">
                    {f.online ? <span className="text-green-hud">● en linea</span> : f.lastActive}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
              {/* Mini stats */}
              <div className="grid grid-cols-4 gap-1 text-center">
                <div className="hud-corner p-1 bg-secondary/30">
                  <div className="text-[8px] font-mono text-muted-foreground uppercase">Quiz</div>
                  <div className="text-xs font-mono font-bold text-green-hud">{f.stats.quizCorrect}</div>
                </div>
                <div className="hud-corner p-1 bg-secondary/30">
                  <div className="text-[8px] font-mono text-muted-foreground uppercase">Mini</div>
                  <div className="text-xs font-mono font-bold text-amber">{f.stats.minigameBest}</div>
                </div>
                <div className="hud-corner p-1 bg-secondary/30">
                  <div className="text-[8px] font-mono text-muted-foreground uppercase">Misn</div>
                  <div className="text-xs font-mono font-bold text-red-hud">{f.stats.missionsClaimed}</div>
                </div>
                <div className="hud-corner p-1 bg-secondary/30">
                  <div className="text-[8px] font-mono text-muted-foreground uppercase">Racha</div>
                  <div className="text-xs font-mono font-bold text-amber">{f.stats.streak}</div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Friend detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="!fixed hud-panel border-cyan-hud sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-mono text-cyan-hud flex items-center gap-2">
                  <span className="text-2xl"><VIcon k={selected.avatar} className="w-7 h-7 text-amber" /></span>
                  {selected.alias}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Nivel {selected.rank} · {selected.online ? "En linea ahora" : `Ultima actividad: ${selected.lastActive}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="hud-corner p-3 bg-secondary/40">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Estadisticas de combate</div>
                  <div className="space-y-2">
                    <StatRow icon={<Brain className="w-3.5 h-3.5 text-green-hud" />} label="Quiz acertados" value={selected.stats.quizCorrect} max={30} color="bg-green-hud" />
                    <StatRow icon={<Gamepad2 className="w-3.5 h-3.5 text-amber" />} label="Mejor mini-game" value={selected.stats.minigameBest} max={1500} color="bg-amber" />
                    <StatRow icon={<Target className="w-3.5 h-3.5 text-red-hud" />} label="Misiones reclamadas" value={selected.stats.missionsClaimed} max={17} color="bg-red-hud" />
                    <StatRow icon={<Flame className="w-3.5 h-3.5 text-amber" />} label="Racha actual" value={selected.stats.streak} max={30} color="bg-amber" />
                  </div>
                </div>

                <div className="hud-corner p-3 bg-secondary/40">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Comparativa contigo</div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="hud-corner p-2 border-cyan-hud bg-cyan-hud/20">
                      <div className="text-[9px] font-mono text-cyan-hud uppercase">Tú</div>
                      <div className="text-lg font-mono font-bold text-cyan-hud">{level}</div>
                      <div className="text-[9px] font-mono text-muted-foreground">nivel</div>
                    </div>
                    <div className="hud-corner p-2 border-amber-hud bg-amber-hud/20">
                      <div className="text-[9px] font-mono text-amber uppercase">{selected.alias.slice(0, 8)}</div>
                      <div className="text-lg font-mono font-bold text-amber">{selected.level}</div>
                      <div className="text-[9px] font-mono text-muted-foreground">nivel</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-cyan-hud/30 border border-cyan-hud text-cyan-hud hover:bg-cyan-hud/50 font-mono uppercase text-[10px]"
                    onClick={() => toast.info("Desafio enviado", { description: `${selected.alias} recibira tu desafio (simulado)` })}
                  >
                    <Award className="w-3 h-3 mr-1" /> Desafiar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-mono uppercase text-[10px] border-border"
                    onClick={() => setSelected(null)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompareStats({ stats }: { stats: { quizCorrect: number; minigameBest: number; missionsClaimed: number; streak: number } }) {
  return (
    <div className="space-y-1.5">
      <StatRow icon={<Brain className="w-3 h-3 text-green-hud" />} label="Quiz" value={stats.quizCorrect} max={30} color="bg-green-hud" />
      <StatRow icon={<Gamepad2 className="w-3 h-3 text-amber" />} label="Mini" value={stats.minigameBest} max={1500} color="bg-amber" />
      <StatRow icon={<Target className="w-3 h-3 text-red-hud" />} label="Misiones" value={stats.missionsClaimed} max={17} color="bg-red-hud" />
      <StatRow icon={<Flame className="w-3 h-3 text-amber" />} label="Racha" value={stats.streak} max={30} color="bg-amber" />
    </div>
  );
}

function StatRow({ icon, label, value, max, color }: { icon: React.ReactNode; label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
        <span className="flex items-center gap-1 text-muted-foreground">{icon} {label}</span>
        <span className="text-foreground tabular-nums">{value}/{max}</span>
      </div>
      <div className="h-1 bg-secondary rounded-full overflow-hidden">
        <div className={cn("h-full", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
