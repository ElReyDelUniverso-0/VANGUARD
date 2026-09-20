"use client";

// Vanguard v8 — APUESTAS DE GUERRA: apuestas simples historicas + PARLEY militar
// (combina 2-4 selecciones con cuotas multiplicadas), apuesta gratis diaria y
// estadisticas del operador. Todo con monedas virtuales del juego.

import { useState } from "react";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { WAR_BETS, type WarBet } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Dice5, Coins, Trophy, TrendingUp, Swords, Check, X, Gift, Layers, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";
import { dayKey } from "@/lib/hooks-data";

const PARLEY_MARGEN = 0.95; // margen de la casa sobre el producto de cuotas

export function WarBettingPanel() {
  const coins = useGameStore((s) => s.coins);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const recordBet = useGameStore((s) => s.recordBet);
  const claimFreeBet = useGameStore((s) => s.claimFreeBet);
  const lastFreeBetDate = useGameStore((s) => s.lastFreeBetDate);
  const betStats = useGameStore((s) => s.betStats);

  const [resolving, setResolving] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, "A" | "B" | null>>({});
  const [betAmount, setBetAmount] = useState(50);

  // ====== PARLEY ======
  const [picks, setPicks] = useState<Record<string, "A" | "B">>({});
  const [parleyStake, setParleyStake] = useState(50);
  const [parleyResolving, setParleyResolving] = useState(false);
  const [parleyOutcome, setParleyOutcome] = useState<{ won: boolean; payout: number; legs: { war: string; side: "A" | "B"; won: boolean }[] } | null>(null);

  const freeBetAvailable = lastFreeBetDate !== dayKey();
  const pickEntries = Object.entries(picks);
  const combinedOdds = pickEntries.reduce((acc, [id, side]) => {
    const bet = WAR_BETS.find((b) => b.id === id);
    if (!bet) return acc;
    return acc * (side === "A" ? bet.oddsA : bet.oddsB);
  }, 1) * (pickEntries.length >= 2 ? PARLEY_MARGEN : 1);
  const parleyPayout = Math.round(parleyStake * combinedOdds);

  const winRate = betStats.placed > 0 ? Math.round((betStats.won / betStats.placed) * 100) : 0;

  const handleBet = (bet: WarBet, faction: "A" | "B") => {
    if (resolving) return;
    if (coins < betAmount) {
      toast.error("Monedas insuficientes");
      return;
    }
    spendCoins(betAmount, `Apuesta guerra: ${bet.warName}`);
    setResolving(bet.id);

    const winA = Math.random() < bet.probabilityA;
    const playerWon = faction === "A" ? winA : !winA;

    setTimeout(() => {
      if (playerWon) {
        const odds = faction === "A" ? bet.oddsA : bet.oddsB;
        const payout = Math.round(betAmount * odds);
        addCoins(payout, `Apuesta ganada: ${bet.warName}`);
        addXp(40);
        sfx.success();
        toast.success(`¡Ganaste! +${payout} monedas`, {
          description: `${faction === "A" ? bet.factionA : bet.factionB} gano · cuota ${odds}x`,
        });
      } else {
        sfx.error();
        toast.error("Perdiste la apuesta", {
          description: `${faction === "A" ? bet.factionB : bet.factionA} gano historicamente`,
        });
      }
      recordBet(betAmount, playerWon, playerWon ? Math.round(betAmount * (faction === "A" ? bet.oddsA : bet.oddsB)) : 0);
      setResults((r) => ({ ...r, [bet.id]: faction }));
      setResolving(null);
      setTimeout(() => {
        setResults((r) => {
          const next = { ...r };
          delete next[bet.id];
          return next;
        });
      }, 5000);
    }, 2000);
  };

  // ====== resolver PARLEY ======
  const resolveParley = () => {
    if (parleyResolving || pickEntries.length < 2) return;
    if (coins < parleyStake) {
      toast.error("Monedas insuficientes para el parley");
      return;
    }
    const stake = parleyStake;
    const oddsAtResolve = combinedOdds;
    spendCoins(stake, `Parley militar x${pickEntries.length}`);
    setParleyResolving(true);
    setParleyOutcome(null);

    const legs = pickEntries.map(([id, side]) => {
      const bet = WAR_BETS.find((b) => b.id === id)!;
      const winA = Math.random() < bet.probabilityA;
      const legWon = side === "A" ? winA : !winA;
      return { war: bet.warName, side, won: legWon };
    });

    setTimeout(() => {
      const allWon = legs.every((l) => l.won);
      const payout = allWon ? Math.round(stake * oddsAtResolve) : 0;
      if (allWon) {
        addCoins(payout, `PARLEY ganado x${legs.length}`);
        addXp(90);
        sfx.success();
        toast.success(`¡PARLEY PERFECTO! +${payout} monedas`, {
          description: `${legs.length} aciertos · cuota combinada ${oddsAtResolve.toFixed(2)}x`,
        });
      } else {
        const aciertos = legs.filter((l) => l.won).length;
        sfx.error();
        toast.error(`Parley fallido (${aciertos}/${legs.length} aciertos)`, {
          description: "Todos los picks debian ganar para cobrar",
        });
      }
      recordBet(stake, allWon, payout);
      setParleyOutcome({ won: allWon, payout, legs });
      setParleyResolving(false);
      setPicks({});
      setTimeout(() => setParleyOutcome(null), 8000);
    }, 2600);
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Apuestas de guerra"
        subtitle="Guerras historicas · parley militar de hasta 4 selecciones · apuesta gratis diaria"
        icon={<Dice5 className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <div className="text-[10px] font-mono text-muted-foreground">
            <span className="text-amber">{coins}</span> monedas
          </div>
        }
      />

      {/* fila superior: apuesta gratis + estadisticas */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className={cn("hud-corner p-3 border flex items-center justify-between gap-2", freeBetAvailable ? "border-amber-hud bg-amber-hud/10 glow-amber" : "bg-secondary/30 border-border")}>
          <div className="flex items-center gap-2.5">
            <Gift className={cn("w-5 h-5", freeBetAvailable ? "text-amber blink-soft" : "text-muted-foreground")} />
            <div>
              <div className="text-[11px] font-mono font-bold uppercase text-foreground">Apuesta gratis diaria</div>
              <div className="text-[9px] font-mono text-muted-foreground">
                {freeBetAvailable ? "+50 monedas de bono para jugar" : "Vuelve manana por tu bono"}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (claimFreeBet()) {
                sfx.success();
                toast.success("BONO RECLAMADO: +50 monedas para apostar");
              }
            }}
            disabled={!freeBetAvailable}
            className={cn(
              "px-3 py-2 border rounded-sm text-[10px] font-mono font-bold uppercase transition-colors",
              freeBetAvailable
                ? "border-amber-hud bg-amber-hud/30 text-amber hover:bg-amber-hud/50"
                : "border-border/50 text-muted-foreground opacity-50 cursor-not-allowed"
            )}
          >
            {freeBetAvailable ? "Reclamar" : "Reclamado"}
          </button>
        </div>

        <div className="hud-corner p-3 bg-secondary/30 border border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <Target className="w-3.5 h-3.5 text-cyan-hud" />
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">Tu registro de apostador</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <BetStat value={String(betStats.placed)} label="apuestas" />
            <BetStat value={String(betStats.won)} label="ganadas" />
            <BetStat value={`${winRate}%`} label="acierto" accent="text-green-hud" />
            <BetStat value={`${betStats.payout - betStats.wagered >= 0 ? "+" : ""}${betStats.payout - betStats.wagered}`} label="neto" accent={betStats.payout - betStats.wagered >= 0 ? "text-green-hud" : "text-red-hud"} />
          </div>
        </div>
      </div>

      {/* ====== PARLEY MILITAR ====== */}
      <div className="hud-corner p-4 bg-secondary/40 border-amber-hud">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-4 h-4 text-amber" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber">Parley militar</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 border border-amber-hud text-amber uppercase bg-amber-hud/20">hasta x4 cuota combinada</span>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground mb-3">
          Selecciona 2-4 guerras abajo, elige el bando de cada una y apuesta una sola vez: TODOS los picks deben ganar para cobrar.
          Cuota combinada = producto x {PARLEY_MARGEN} (margen de la casa).
        </div>

        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <div>
            <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1.5">
              Selecciones: <span className={cn("font-bold", pickEntries.length >= 2 ? "text-green-hud" : "text-amber")}>{pickEntries.length}/4</span>
            </div>
            <div className="flex flex-wrap gap-1 min-h-[28px]">
              {pickEntries.length === 0 && (
                <span className="text-[9px] font-mono text-muted-foreground/70">Marca bandos en las tarjetas de abajo...</span>
              )}
              {pickEntries.map(([id, side]) => {
                const bet = WAR_BETS.find((b) => b.id === id)!;
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 border border-cyan-hud/60 text-cyan-hud bg-cyan-hud/10"
                  >
                    {side === "A" ? bet.factionA : bet.factionB} @{(side === "A" ? bet.oddsA : bet.oddsB).toFixed(2)}
                    <button onClick={() => setPicks((p) => { const n = { ...p }; delete n[id]; return n; })} aria-label="Quitar seleccion">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1.5">Importe del parley</div>
            <div className="flex items-center gap-1.5">
              {[25, 50, 100, 250].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setParleyStake(amt)}
                  className={cn(
                    "px-2 py-1 border text-[10px] font-mono",
                    parleyStake === amt ? "border-amber-hud text-amber bg-amber-hud/30" : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Cuota combinada</div>
              <div className={cn("text-lg font-mono font-bold leading-none", pickEntries.length >= 2 ? "text-amber" : "text-muted-foreground")}>
                x{combinedOdds.toFixed(2)}
              </div>
              <div className="text-[9px] font-mono text-green-hud">
                premio {pickEntries.length >= 2 ? `+${parleyPayout}` : "—"}
              </div>
            </div>
            <button
              onClick={resolveParley}
              disabled={parleyResolving || pickEntries.length < 2 || coins < parleyStake}
              className={cn(
                "px-4 py-3 border rounded-sm text-[11px] font-mono font-bold uppercase tracking-wider transition-colors",
                !parleyResolving && pickEntries.length >= 2 && coins >= parleyStake
                  ? "border-amber-hud bg-amber-hud/30 text-amber hover:bg-amber-hud/50 glow-amber"
                  : "border-border/50 text-muted-foreground opacity-50 cursor-not-allowed"
              )}
            >
              {parleyResolving ? "Resolviendo..." : "Apostar parley"}
            </button>
          </div>
        </div>

        {/* resultado del parley */}
        <AnimatePresence>
          {parleyOutcome && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "mt-3 p-3 border",
                parleyOutcome.won ? "border-green-hud bg-green-hud/15" : "border-red-hud bg-red-hud/15"
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {parleyOutcome.won ? <Trophy className="w-4 h-4 text-green-hud" /> : <X className="w-4 h-4 text-red-hud" />}
                <span className="text-xs font-mono font-bold uppercase text-foreground">
                  {parleyOutcome.won ? `¡PARLEY PERFECTO! +${parleyOutcome.payout} monedas` : "Parley fallido"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {parleyOutcome.legs.map((l, i) => (
                  <div key={i} className={cn("text-[9px] font-mono px-2 py-1 border", l.won ? "border-green-hud/50 text-green-hud" : "border-red-hud/50 text-red-hud")}>
                    <div className="truncate">{l.war}</div>
                    <div className="font-bold uppercase">{l.won ? "ACIERTO" : "FALLO"}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bet amount selector (apuestas simples) */}
      <div className="hud-corner p-3 bg-secondary/30">
        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Cantidad a apostar (simples)</div>
        <div className="flex items-center gap-2">
          {[25, 50, 100, 250].map((amt) => (
            <button
              key={amt}
              onClick={() => setBetAmount(amt)}
              className={cn(
                "px-2 py-1 border text-[10px] font-mono",
                betAmount === amt
                  ? "border-amber-hud text-amber bg-amber-hud/30"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {amt}
            </button>
          ))}
          <span className="ml-auto text-[10px] font-mono text-muted-foreground">
            Saldo: <span className="text-amber">{coins}</span> MON
          </span>
        </div>
      </div>

      {/* War bet cards */}
      <div className="grid md:grid-cols-2 gap-3">
        {WAR_BETS.map((bet) => {
          const isResolving = resolving === bet.id;
          const result = results[bet.id];
          const pctA = Math.round(bet.probabilityA * 100);
          const pctB = 100 - pctA;
          const pickA = picks[bet.id] === "A";
          const pickB = picks[bet.id] === "B";

          return (
            <motion.div
              key={bet.id}
              layout
              className={cn(
                "hud-corner p-3 transition-all",
                isResolving && "glow-amber",
                result && "opacity-80"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl"><VIcon k={bet.emoji} className="w-7 h-7 text-amber" /></span>
                  <div>
                    <div className="text-sm font-mono font-bold text-foreground">{bet.warName}</div>
                    <div className="text-[9px] font-mono text-muted-foreground uppercase">{bet.category}</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 border border-amber-hud text-amber bg-amber-hud/30 uppercase">
                  {bet.category}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground mb-3">{bet.description}</p>

              {/* Probability bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-cyan-hud">{bet.factionA} {pctA}%</span>
                  <span className="text-red-hud">{pctB}% {bet.factionB}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
                  <div className="bg-cyan-hud h-full transition-all" style={{ width: `${pctA}%` }} />
                  <div className="bg-red-hud h-full transition-all" style={{ width: `${pctB}%` }} />
                </div>
              </div>

              {/* Bet buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleBet(bet, "A")}
                  disabled={isResolving || !!result}
                  className={cn(
                    "h-auto py-2 font-mono text-[10px] uppercase",
                    result === "A"
                      ? "bg-green-hud/30 border border-green-hud text-green-hud"
                      : isResolving
                      ? "bg-secondary text-muted-foreground"
                      : "bg-cyan-hud/30 border border-cyan-hud text-cyan-hud hover:bg-cyan-hud/50"
                  )}
                >
                  {result === "A" ? <><Check className="w-3 h-3 mr-1" /> GANADO</> : isResolving ? "..." : `${bet.factionA} ×${bet.oddsA}`}
                </Button>
                <Button
                  onClick={() => handleBet(bet, "B")}
                  disabled={isResolving || !!result}
                  className={cn(
                    "h-auto py-2 font-mono text-[10px] uppercase",
                    result === "B"
                      ? "bg-green-hud/30 border border-green-hud text-green-hud"
                      : isResolving
                      ? "bg-secondary text-muted-foreground"
                      : "bg-red-hud/30 border border-red-hud text-red-hud hover:bg-red-hud/50"
                  )}
                >
                  {result === "B" ? <><Check className="w-3 h-3 mr-1" /> GANADO</> : isResolving ? "..." : `${bet.factionB} ×${bet.oddsB}`}
                </Button>
              </div>

              {/* seleccion para parley */}
              <div className="mt-2 flex items-center justify-between text-[9px] font-mono">
                <button
                  onClick={() => setPicks((p) => {
                    const n = { ...p };
                    if (pickA) delete n[bet.id];
                    else { n[bet.id] = "A"; if (Object.keys(n).length > 4) return p; }
                    return n;
                  })}
                  className={cn(
                    "px-2 py-1 border transition-colors uppercase font-bold",
                    pickA ? "border-cyan-hud text-cyan-hud bg-cyan-hud/20" : "border-border/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {pickA ? "EN PARLEY" : "+ al parley"}
                </button>
                <span className="text-muted-foreground">
                  Apuesta: <span className="text-amber">{betAmount}</span> · Premio: <span className="text-green-hud">+{Math.round(betAmount * Math.max(bet.oddsA, bet.oddsB))}</span>
                </span>
                <button
                  onClick={() => setPicks((p) => {
                    const n = { ...p };
                    if (pickB) delete n[bet.id];
                    else { n[bet.id] = "B"; if (Object.keys(n).length > 4) return p; }
                    return n;
                  })}
                  className={cn(
                    "px-2 py-1 border transition-colors uppercase font-bold",
                    pickB ? "border-red-hud text-red-hud bg-red-hud/20" : "border-border/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {pickB ? "EN PARLEY" : "+ al parley"}
                </button>
              </div>

              {isResolving && (
                <div className="mt-2 text-center text-[10px] font-mono text-amber blink-soft">
                  Resolviendo batalla...
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Info */}
      <div className="hud-corner p-3 bg-secondary/30 text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5 mb-1">
          <Swords className="w-3 h-3 text-amber" />
          <span className="text-amber uppercase">Como funciona</span>
        </div>
        Apuesta por la faccion que crees que gano historicamente, o arma un PARLEY de 2-4 guerras para multiplicar cuotas.
        Monedas 100% virtuales: las ganancias alimentan tu economia de juego. Cada apuesta otorga PX de Pase Vanguard (+10 si ganas, +4 si pierdes).
      </div>
    </div>
  );
}

function BetStat({ value, label, accent = "text-foreground" }: { value: string; label: string; accent?: string }) {
  return (
    <div className="hud-corner px-1.5 py-1.5 bg-background/50">
      <div className={cn("text-sm font-mono font-bold leading-none", accent)}>{value}</div>
      <div className="text-[8px] font-mono text-muted-foreground uppercase mt-0.5">{label}</div>
    </div>
  );
}
