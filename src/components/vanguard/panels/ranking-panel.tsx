"use client";

// Vanguard v8 — RANKING GLOBAL: tres tablas (Operadores por XP, Conquistadores,
// Traders por P/L) con rivales simulados deterministas que derivan cada dia.
// El objetivo es que siempre haya alguien a 1 posicion de distancia — gancho clasico.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Swords, TrendingUp, Crown, Medal, CalendarDays, ShieldCheck, Zap, BookOpen, Flame, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { useGameStore } from "@/lib/game-store";
import { rivalScores, RANK_RIVALS, type RivalScore } from "@/lib/hooks-data";
import { useRetention, weekKeyOf, weekDaysLeft, WEEK_TOP3_REWARD } from "@/lib/retention";
import { useOscura, OSCURA_TOTAL } from "@/lib/oscura";
import { useExpedientes, EXPEDIENTES } from "@/lib/expedientes";

type Discipline = "XP" | "CONQ" | "TRADER";

interface Row {
  name: string;
  tag: string;
  score: number;
  isPlayer: boolean;
}

// v58.0 DOMINIO TOTAL — rivales del TABLÓN SEMANAL: deterministas por semana
// ISO y SIEMPRE cerca del jugador (gancho clásico: alguien a 1 puesto).
function weeklyRivals(playerXp: number, wk: string): Row[] {
  const weekNum = parseInt(wk.slice(6), 10) || 1;
  const scale = playerXp > 0 ? playerXp : 260; // semana sin actividad: base jugable
  return RANK_RIVALS.slice(0, 7).map((r, i) => {
    const h = Math.abs(Math.sin(r.seed * 12.9898 + weekNum * 78.233)) * 43758.5453;
    const rnd = h - Math.floor(h); // 0..1 determinista por (rival, semana)
    const factor = 0.35 + rnd * 1.15 + i * 0.04;
    const score = Math.max(30, Math.round(scale * factor));
    return { name: r.name, tag: r.tag, score, isPlayer: false };
  });
}

function WeekBoard() {
  const alias = useGameStore((s) => s.alias);
  const addCoins = useGameStore((s) => s.addCoins);
  const addGems = useGameStore((s) => s.addGems);
  const addXp = useGameStore((s) => s.addXp);
  const weekXp = useRetention((s) => s.weekXp);
  const weekKey = useRetention((s) => s.weekKey);
  const weekRewardClaimed = useRetention((s) => s.weekRewardClaimed);
  const claimWeekReward = useRetention((s) => s.claimWeekReward);
  const [claiming, setClaiming] = useState(false);

  const wk = weekKey || weekKeyOf();
  const daysLeft = weekDaysLeft();
  const rows = useMemo(() => {
    const all = [
      ...weeklyRivals(weekXp, wk),
      { name: alias || "TU", tag: "AG", score: weekXp, isPlayer: true },
    ];
    return all.sort((a, b) => b.score - a.score);
  }, [alias, weekXp, wk]);
  const pos = rows.findIndex((r) => r.isPlayer) + 1;
  const inTop3 = pos <= 3 && weekXp > 0;
  const claimed = weekRewardClaimed === wk;

  const handleClaim = () => {
    if (claiming) return;
    setClaiming(true);
    const rw = claimWeekReward();
    if (rw) {
      addCoins(rw.coins, `TABLÓN SEMANAL top-3 (${wk})`);
      addGems(rw.gems, `TABLÓN SEMANAL top-3 (${wk})`);
      addXp(80);
      toast.success(`BOTÍN SEMANAL: +${rw.coins}ⓒ +${rw.gems}💎 +80XP`, {
        description: `Puesto #${pos} de la semana ${wk} — sigues en el OJO DE DIOS`,
      });
    }
    setClaiming(false);
  };

  return (
    <div className="hud-corner bg-gradient-to-br from-amber-hud/15 via-secondary/40 to-red-hud/10 border border-amber-hud/40">
      <div className="p-3 border-b border-amber-hud/30 flex items-center gap-2 flex-wrap">
        <CalendarDays className="w-4 h-4 text-amber" />
        <div className="text-xs font-mono font-bold uppercase text-foreground">TABLÓN SEMANAL</div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-hud/20 text-amber rounded">{wk}</span>
        <span className="ml-auto text-[9px] font-mono text-red-hud font-bold animate-pulse">
          CIERRA EN {daysLeft} {daysLeft === 1 ? "DÍA" : "DÍAS"}
        </span>
      </div>
      <div className="p-3 grid md:grid-cols-[1fr_220px] gap-3">
        <div className="max-h-[190px] overflow-y-auto thin-scroll divide-y divide-border/30">
          {rows.map((r, i) => (
            <div
              key={r.name + i}
              className={cn(
                "px-2 py-1.5 flex items-center gap-2 text-[10px] font-mono",
                r.isPlayer ? "bg-amber-hud/15 border-l-2 border-amber-hud" : ""
              )}
            >
              <span className={cn("w-6", medalClass(i + 1))}>#{i + 1}</span>
              <FlagBadge country={r.tag} size={12} />
              <span className={cn("flex-1 truncate", r.isPlayer ? "text-amber font-bold" : "text-muted-foreground")}>
                {r.name}{r.isPlayer ? " ← TÚ" : ""}
              </span>
              <span className="text-foreground font-bold">{r.score} XP</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <div className="hud-panel p-2 text-[10px] font-mono space-y-1">
            <div className="text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber" /> TU XP SEMANAL: <span className="text-amber font-bold">{weekXp}</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber" /> PUESTO: <span className="text-amber font-bold">#{pos}</span> / 8
            </div>
          </div>
          <div className="hud-panel p-2 text-[9px] font-mono text-muted-foreground">
            BOTÍN TOP-3: <span className="text-amber">{WEEK_TOP3_REWARD.coins}ⓒ</span> +
            <span className="text-cyan-hud"> {WEEK_TOP3_REWARD.gems}💎</span> +
            <span className="text-green-hud"> {WEEK_TOP3_REWARD.seasonXp}XP temporada</span>
          </div>
          {claimed ? (
            <div className="text-[9px] font-mono text-green-hud flex items-center gap-1 justify-center py-1">
              <ShieldCheck className="w-3.5 h-3.5" /> BOTÍN RECLAMADO
            </div>
          ) : (
            <button
              onClick={handleClaim}
              disabled={!inTop3 || claiming}
              className={cn(
                "text-[10px] font-mono font-bold py-1.5 px-2 rounded border transition-colors",
                inTop3
                  ? "bg-amber-hud/20 border-amber-hud text-amber hover:bg-amber-hud/30 animate-pulse"
                  : "bg-secondary/40 border-border text-muted-foreground cursor-not-allowed"
              )}
            >
              {inTop3 ? "★ RECLAMAR BOTÍN TOP-3" : `LLEGA AL TOP-3 (${pos <= 3 ? "SIN XP" : `FALTAN ${(rows[2]?.score ?? weekXp) - weekXp + 1} XP`})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function medalClass(pos: number): string {
  if (pos === 1) return "text-amber";
  if (pos === 2) return "text-cyan-hud";
  if (pos === 3) return "text-red-hud";
  return "text-muted-foreground";
}

// v61.0 ERUDITOS DEL ABISMO — TABLÓN DE ERUDITOS: la gloria de los que leen.
// Puntuación = biblioteca absorbida (25/entrada) + ARCHIVO SECRETO (30/expediente)
// + aciertos históricos del examen (10) + racha del examen (15/día).
// Rivales deterministas por semana ISO: SIEMPRE hay un erudito a 1 puesto.
// Tabla de gloria (sin botín): el botín vive en los hitos de cada colección.
function ScholarsBoard() {
  const alias = useGameStore((s) => s.alias);
  const oscuraReads = useOscura((s) => s.readIds.length);
  const quizSolved = useOscura((s) => s.quizSolved.length);
  const quizStreak = useOscura((s) => s.quizStreak);
  const expReads = useExpedientes((s) => s.readIds.length);

  const weekNum = parseInt(weekKeyOf().slice(6), 10) || 1;
  const score = oscuraReads * 25 + expReads * 30 + quizSolved * 10 + quizStreak * 15;
  const rows = useMemo(() => {
    const scale = score > 0 ? score : 420; // base jugable si aún no lees nada
    const rivals = RANK_RIVALS.slice(0, 7).map((r, i) => {
      const h = Math.abs(Math.sin(r.seed * 12.9898 + weekNum * 78.233 + 4127)) * 43758.5453;
      const rnd = h - Math.floor(h);
      const factor = 0.3 + rnd * 1.2 + i * 0.045;
      return { name: r.name, tag: r.tag, score: Math.max(120, Math.round(scale * factor)), isPlayer: false };
    });
    return [...rivals, { name: alias || "TU", tag: "AG", score, isPlayer: true }].sort((a, b) => b.score - a.score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alias, score, weekNum]);
  const pos = rows.findIndex((r) => r.isPlayer) + 1;

  return (
    <div className="hud-corner bg-gradient-to-br from-red-hud/12 via-secondary/40 to-amber-hud/10 border border-red-hud/40">
      <div className="p-3 border-b border-red-hud/30 flex items-center gap-2 flex-wrap">
        <BookOpen className="w-4 h-4 text-red-hud" />
        <div className="text-xs font-mono font-bold uppercase text-foreground">TABLÓN DE ERUDITOS</div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-red-hud/15 text-red-hud rounded">semana {weekNum}</span>
        <span className="ml-auto text-[9px] font-mono text-muted-foreground">tabla de gloria · se recalcula cada semana</span>
      </div>
      <div className="p-3 grid md:grid-cols-[1fr_240px] gap-3">
        <div className="max-h-[210px] overflow-y-auto thin-scroll divide-y divide-border/30">
          {rows.map((r, i) => (
            <div
              key={r.name + i}
              className={cn(
                "px-2 py-1.5 flex items-center gap-2 text-[10px] font-mono",
                r.isPlayer ? "bg-red-hud/15 border-l-2 border-red-hud" : ""
              )}
            >
              <span className={cn("w-6", medalClass(i + 1))}>#{i + 1}</span>
              <FlagBadge country={r.tag} size={12} />
              <span className={cn("flex-1 truncate", r.isPlayer ? "text-red-hud font-bold" : "text-muted-foreground")}>
                {r.name}{r.isPlayer ? " ← TÚ" : ""}
              </span>
              <span className="text-foreground font-bold">{r.score} pts</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <div className="hud-panel p-2 text-[10px] font-mono space-y-1">
            <div className="text-muted-foreground flex items-center gap-1">
              <Crown className="w-3 h-3 text-red-hud" /> ERUDITO: <span className="text-red-hud font-bold">#{pos}</span> / 8
            </div>
            <div className="text-muted-foreground flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-amber" /> Biblioteca: <span className="text-amber font-bold">{oscuraReads}/{OSCURA_TOTAL}</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-hud" /> Archivo: <span className="text-cyan-hud font-bold">{expReads}/{EXPEDIENTES.length}</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-green-hud" /> Examen: <span className="text-green-hud font-bold">{quizSolved}</span> aciertos
            </div>
            <div className="text-muted-foreground flex items-center gap-1">
              <Flame className="w-3 h-3 text-red-hud" /> Racha: <span className="text-red-hud font-bold">{quizStreak}</span> días
            </div>
          </div>
          <div className="hud-panel p-2 text-[9px] font-mono text-muted-foreground">
            Vale: 25 pts/entrada de biblioteca · 30 pts/expediente · 10 pts/acierto histórico · 15 pts/día de racha.
            Lee, abre expedientes y sobrevive al examen para escalar.
          </div>
        </div>
      </div>
    </div>
  );
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
        subtitle="Semana · Operadores · Conquistadores · Traders — nuevas posiciones cada dia, defiende tu plaza"
        icon={<Trophy className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <div className="text-[10px] font-mono text-muted-foreground hidden sm:block">
            Nivel <span className="text-amber font-bold">{level}</span> · {alias || "SIN REGISTRO"}
          </div>
        }
      />

      {/* v58.0 DOMINIO TOTAL — TABLÓN SEMANAL con botín reclamable */}
      <WeekBoard />

      {/* v61.0 ERUDITOS DEL ABISMO — TABLÓN DE ERUDITOS (gloria de los que leen) */}
      <ScholarsBoard />

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
          v58.0: cada XP que ganas en CUALQUIER panel (misiones, quiz, arcade, apuestas, foros, multijugador…) suma para la TEMPORADA y para el TABLÓN SEMANAL. Los rivales operan a diario: la tabla vive incluso mientras duermes. Sube XP con misiones y quiz, conquista territorios
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
