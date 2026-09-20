"use client";

// Vanguard v8 — RANKING GLOBAL: tres tablas (Operadores por XP, Conquistadores,
// Traders por P/L) con rivales simulados deterministas que derivan cada dia.
// El objetivo es que siempre haya alguien a 1 posicion de distancia — gancho clasico.

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Swords, TrendingUp, Crown, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { useGameStore } from "@/lib/game-store";
import { rivalScores, type RivalScore } from "@/lib/hooks-data";

type Discipline = "XP" | "CONQ" | "TRADER";

interface Row {
  name: string;
  tag: string;
  score: number;
  isPlayer: boolean;
}

function medalClass(pos: number): string {
  if (pos === 1) return "text-amber";
  if (pos === 2) return "text-cyan-hud";
  if (pos === 3) return "text-red-hud";
  return "text-muted-foreground";
}

export function RankingPanel() {
  const alias = useGameStore((s) => s.alias);
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const conquestWins = useGameStore((s) => s.conquestWins);
  const conquestCapturesTotal = useGameStore((s) => s.conquestCapturesTotal);
  const mpStats = useGameStore((s) => s.mpStats);
  const marketRealized = useGameStore((s) => s.marketRealized);
  const stakeEarnedTotal = useGameStore((s) => s.stakeEarnedTotal);

  const tables: Record<Discipline, Row[]> = useMemo(() => {
    const mk = (disc: Discipline, playerScore: number): Row[] => {
      const rivals: Row[] = rivalScores(disc).map((r: RivalScore) => ({ ...r, isPlayer: false }));
      const all: Row[] = [
        ...rivals,
        { name: alias || "TU", tag: "AG", score: playerScore, isPlayer: true },
      ];
      return all.sort((a, b) => b.score - a.score);
    };
    return {
      XP: mk("XP", xp),
      CONQ: mk("CONQ", conquestCapturesTotal + conquestWins * 25 + mpStats.captures * 2 + mpStats.wins * 25),
      TRADER: mk("TRADER", marketRealized + Math.round(stakeEarnedTotal)),
    };
  }, [alias, xp, conquestWins, conquestCapturesTotal, mpStats, marketRealized, stakeEarnedTotal]);

  const playerPos = (rows: Row[]) => rows.findIndex((r) => r.isPlayer) + 1;

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Ranking global"
        subtitle="Operadores · Conquistadores · Traders — nuevas posiciones cada dia, defiende tu plaza"
        icon={<Trophy className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <div className="text-[10px] font-mono text-muted-foreground hidden sm:block">
            Nivel <span className="text-amber font-bold">{level}</span> · {alias || "SIN REGISTRO"}
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-3">
        <Board
          title="Operadores"
          subtitle="XP de carrera · quiz, misiones y combate"
          icon={<Medal className="w-4 h-4 text-amber" />}
          rows={tables.XP}
          pos={playerPos(tables.XP)}
          format={(v) => `${v} XP`}
        />
        <Board
          title="Conquistadores"
          subtitle="MUNDO DE GUERRA + multijugador"
          icon={<Swords className="w-4 h-4 text-red-hud" />}
          rows={tables.CONQ}
          pos={playerPos(tables.CONQ)}
          format={(v) => `${v} pts`}
        />
        <Board
          title="Traders"
          subtitle="P/L realizado en la bolsa + staking"
          icon={<TrendingUp className="w-4 h-4 text-green-hud" />}
          rows={tables.TRADER}
          pos={playerPos(tables.TRADER)}
          format={(v) => `${v >= 0 ? "+" : ""}${v} mon`}
        />
      </div>

      <div className="hud-corner p-3 bg-secondary/30 text-[10px] font-mono text-muted-foreground flex items-start gap-2">
        <Crown className="w-3.5 h-3.5 text-amber flex-shrink-0 mt-0.5" />
        <span>
          Los rivales operan a diario: la tabla vive incluso mientras duermes. Sube XP con misiones y quiz, conquista territorios
          en MUNDO DE GUERRA y acumula P/L realizado en el mercado para escalar posiciones. Tu plaza exacta se recalcula cada dia.
        </span>
      </div>
    </div>
  );
}

function Board({
  title, subtitle, icon, rows, pos, format,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  rows: Row[];
  pos: number;
  format: (v: number) => string;
}) {
  return (
    <div className="hud-corner bg-secondary/40 flex flex-col">
      <div className="p-3 border-b border-amber-hud/30 flex items-center gap-2">
        {icon}
        <div>
          <div className="text-xs font-mono font-bold uppercase text-foreground">{title}</div>
          <div className="text-[9px] font-mono text-muted-foreground">{subtitle}</div>
        </div>
        <span className={cn("ml-auto text-xs font-mono font-bold", medalClass(pos))}>#{pos}</span>
      </div>
      <div className="max-h-[340px] overflow-y-auto thin-scroll divide-y divide-border/30">
        {rows.map((r, i) => (
          <motion.div
            key={r.name + i}
            layout
            className={cn(
              "px-3 py-2 flex items-center gap-2",
              r.isPlayer ? "bg-amber-hud/15 border-l-2 border-amber-hud" : ""
            )}
          >
            <span className={cn("w-6 text-[11px] font-mono font-bold text-right", medalClass(i + 1))}>{i + 1}</span>
            <FlagBadge code={r.tag} size="sm" />
            <span className={cn("text-[11px] font-mono truncate flex-1", r.isPlayer ? "text-amber font-bold" : "text-foreground/85")}>
              {r.name}{r.isPlayer ? " (TU)" : ""}
            </span>
            <span className={cn("text-[11px] font-mono font-bold whitespace-nowrap", r.score >= 0 ? "text-foreground/85" : "text-red-hud")}>
              {format(r.score)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
