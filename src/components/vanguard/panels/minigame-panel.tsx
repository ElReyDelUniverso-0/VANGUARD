"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { Gamepad2, Crosshair, Zap, Trophy, Clock, AlertTriangle, Play, RotateCw, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";

interface ThreatTarget {
  id: number;
  x: number; // 0..100 (% of grid width)
  y: number; // 0..100
  type: "HOSTIL" | "NEUTRAL" | "CIVIL";
  emoji: string;
  spawnTime: number;
  ttl: number; // ms to disappear
}

const TARGET_TYPES = [
  { type: "HOSTIL" as const, emoji: "bomb", points: 10, penalty: 0 },
  { type: "NEUTRAL" as const, emoji: "satellite", points: 5, penalty: 0 },
  { type: "CIVIL" as const, emoji: "cross", points: -15, penalty: 1 }, // penaliza disparar
];

const ROUNDS = 60; // 60 segundos
const SPAWN_INTERVAL = 700; // ms

export function MiniGamePanel() {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [targets, setTargets] = useState<ThreatTarget[]>([]);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [penalties, setPenalties] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUNDS);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [combo, setCombo] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const nextId = useRef(0);
  const spawnTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetsRef = useRef<ThreatTarget[]>([]);
  const removedIds = useRef<Set<number>>(new Set());

  const { addCoins, addXp, recordMinigameStats } = useGameStore();

  // load high score
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vanguard-minigame-high");
      if (stored) setHighScore(parseInt(stored, 10));
    } catch {}
  }, []);

  const stopTimers = useCallback(() => {
    if (spawnTimer.current) clearInterval(spawnTimer.current);
    if (tickTimer.current) clearInterval(tickTimer.current);
    spawnTimer.current = null;
    tickTimer.current = null;
  }, []);

  const endGame = useCallback(() => {
    stopTimers();
    setPlaying(false);
    setGameOver(true);
    setTargets([]);
    // calculate rewards
    const finalScore = score;
    const coinsEarned = Math.max(0, Math.round(finalScore * 0.5));
    const xpEarned = Math.max(0, Math.round(finalScore * 0.3));
    if (coinsEarned > 0) addCoins(coinsEarned, "Mini-game Threat Assessment");
    if (xpEarned > 0) addXp(xpEarned);
    // record stats for tournaments/daily challenges
    recordMinigameStats(finalScore, hits);
    sfx.levelUp();
    // update high score
    if (finalScore > highScore) {
      setHighScore(finalScore);
      try { localStorage.setItem("vanguard-minigame-high", String(finalScore)); } catch {}
      toast.success(`Nuevo record! ${finalScore} puntos`, {
        description: `+${coinsEarned} monedas · +${xpEarned} XP`,
      });
    } else {
      toast.success(`Juego terminado · ${finalScore} puntos`, {
        description: `+${coinsEarned} monedas · +${xpEarned} XP · Penalizaciones: ${penalties}`,
      });
    }
  }, [stopTimers, score, penalties, hits, highScore, addCoins, addXp, recordMinigameStats]);

  // FIX A1: timers centralizados — startGame y reanudar tras pausa usan el MISMO arranque,
  // así la cuenta atrás (tickTimer) siempre se recrea y el juego termina correctamente.
  const startTimers = useCallback(() => {
    stopTimers();
    spawnTimer.current = setInterval(() => {
      const type = TARGET_TYPES[Math.floor(Math.random() * TARGET_TYPES.length)];
      const newTarget: ThreatTarget = {
        id: nextId.current++,
        x: 5 + Math.random() * 90,
        y: 10 + Math.random() * 80,
        type: type.type,
        emoji: type.emoji,
        spawnTime: Date.now(),
        ttl: type.type === "HOSTIL" ? 1800 : 1500,
      };
      setTargets((t) => [...t, newTarget].slice(-12));
    }, SPAWN_INTERVAL);

    tickTimer.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [stopTimers]);

  const startGame = useCallback(() => {
    setPlaying(true);
    setPaused(false);
    setGameOver(false);
    setScore(0);
    setHits(0);
    setMisses(0);
    setPenalties(0);
    setStreak(0);
    setBestStreak(0);
    setCombo(1);
    setTimeLeft(ROUNDS);
    setTargets([]);
    removedIds.current.clear();
    sfx.alarm();
    startTimers();
  }, [startTimers]);

  // end game when time hits 0
  useEffect(() => {
    if (playing && timeLeft === 0 && !gameOver) {
      endGame();
    }
  }, [timeLeft, playing, gameOver, endGame]);

  // FIX A2: el barrido de expirados se detiene también en pausa (antes seguía
  // penalizando fallidos con el juego congelado).
  useEffect(() => {
    if (!playing || paused) return;
    const cull = setInterval(() => {
      const now = Date.now();
      // FIX A4: se calcula FUERA del updater (los updaters deben ser puros;
      // en StrictMode los efectos secundarios dentro de setTargets se duplicaban)
      const expired = targetsRef.current.filter((x) => now - x.spawnTime >= x.ttl);
      if (expired.length === 0) return;
      const hostileExpired = expired.filter((x) => x.type === "HOSTIL").length;
      setTargets((t) => t.filter((x) => now - x.spawnTime < x.ttl));
      if (hostileExpired > 0) {
        setMisses((m) => m + hostileExpired);
        setStreak(0);
        setCombo(1);
      }
    }, 200);
    return () => clearInterval(cull);
  }, [playing, paused]);

  // espejo de targets para leer estado fresco sin depender de re-renders
  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  // cleanup on unmount
  useEffect(() => stopTimers, [stopTimers]);

  const handleHit = (target: ThreatTarget, e: React.MouseEvent) => {
    e.stopPropagation();
    // FIX A5: guard anti doble-clic — un objetivo ya procesado no vuelve a puntuar
    if (removedIds.current.has(target.id)) return;
    removedIds.current.add(target.id);
    const type = TARGET_TYPES.find((t) => t.type === target.type)!;
    setTargets((t) => t.filter((x) => x.id !== target.id));
    if (target.type === "CIVIL") {
      setPenalties((p) => p + 1);
      setScore((s) => Math.max(0, s + type.points));
      setStreak(0);
      setCombo(1);
      sfx.error();
    } else {
      const newStreak = streak + 1;
      // FIX A3: orden corregido (>=10 capturaba todo >=5 y el x3 era código muerto)
      const newCombo = newStreak >= 10 ? 3 : newStreak >= 5 ? 2 : 1;
      setStreak(newStreak);
      setCombo(newCombo);
      setBestStreak((b) => Math.max(b, newStreak));
      setHits((h) => h + 1);
      setScore((s) => s + type.points * newCombo);
      if (newCombo > 1) sfx.streak();
      else sfx.coin();
    }
  };

  const handleMiss = () => {
    setStreak(0);
    setCombo(1);
    sfx.beep();
  };

  const handlePause = () => {
    if (paused) {
      setPaused(false);
      startTimers(); // FIX A1: reanudar recrea AMBOS timers (antes la cuenta atrás moría)
    } else {
      setPaused(true);
      stopTimers();
    }
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Threat Assessment"
        subtitle="Mini-game · clasifica amenazas en tiempo real"
        icon={<Gamepad2 className="w-4 h-4 text-red-hud" />}
        color="red"
        right={
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-amber flex items-center gap-0.5"><Trophy className="w-3 h-3" /> Record: {highScore}</span>
          </div>
        }
      />

      {/* Instructions */}
      <div className="hud-corner p-3 bg-secondary/30 text-[11px] text-muted-foreground">
        <div className="font-mono text-amber text-[10px] uppercase mb-1">Manual de operacion</div>
        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1"><VIcon k="bomb" className="w-3.5 h-3.5 text-red-hud" /> <span className="text-red-hud font-mono">HOSTIL</span> +10pts (eliminar)</span>
          <span className="flex items-center gap-1"><VIcon k="satellite" className="w-3.5 h-3.5 text-cyan-hud" /> <span className="text-cyan-hud font-mono">NEUTRAL</span> +5pts (reconocer)</span>
          <span className="flex items-center gap-1"><VIcon k="cross" className="w-3.5 h-3.5 text-green-hud" /> <span className="text-green-hud font-mono">CIVIL</span> -15pts (NO disparar)</span>
          <span className="flex items-center gap-1"><VIcon k="zap" className="w-3.5 h-3.5 text-amber" /> <span className="text-amber font-mono">COMBO</span> x2 (5 streak), x3 (10 streak)</span>
        </div>
      </div>

      {!playing ? (
        <div className="hud-corner p-6 text-center">
          {gameOver ? (
            <div className="space-y-4">
              <Trophy className="w-12 h-12 mx-auto text-amber" />
              <div>
                <div className="text-2xl font-mono font-bold text-amber">{score} PUNTOS</div>
                <div className="text-sm text-muted-foreground mt-1">Juego terminado</div>
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                <Stat label="Aciertos" value={hits} color="text-green-hud" />
                <Stat label="Fallados" value={misses} color="text-red-hud" />
                <Stat label="Penalizaciones" value={penalties} color="text-amber" />
                <Stat label="Mejor racha" value={bestStreak} color="text-cyan-hud" />
                <Stat label="Precision" value={`${hits + misses + penalties > 0 ? Math.round((hits / (hits + misses + penalties)) * 100) : 0}%`} color="text-violet-hud" />
                <Stat label="Record" value={highScore} color="text-amber" />
              </div>
              <Button
                onClick={startGame}
                className="bg-red-hud/30 border border-red-hud text-red-hud hover:bg-red-hud/50 font-mono uppercase tracking-wider"
              >
                <RotateCw className="w-4 h-4 mr-1" /> Jugar de nuevo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Crosshair className="w-12 h-12 mx-auto text-red-hud blink-soft" />
              <div>
                <div className="text-lg font-mono font-bold text-foreground">Sistema de evaluacion de amenazas</div>
                <div className="text-sm text-muted-foreground mt-1">60 segundos · elimina hostiles · protege civiles</div>
              </div>
              {highScore > 0 && (
                <div className="text-xs font-mono text-amber">Record actual: {highScore} puntos</div>
              )}
              <Button
                onClick={startGame}
                className="bg-red-hud/30 border border-red-hud text-red-hud hover:bg-red-hud/50 font-mono uppercase tracking-wider glow-red"
              >
                <Play className="w-4 h-4 mr-1" /> Iniciar operacion
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* HUD Stats */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            <div className="hud-corner p-2 bg-secondary/30">
              <div className="text-[9px] font-mono text-muted-foreground uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Tiempo</div>
              <div className={cn("text-lg font-mono font-bold tabular-nums", timeLeft <= 10 ? "text-red-hud blink-soft" : "text-amber")}>{timeLeft}s</div>
            </div>
            <div className="hud-corner p-2 bg-secondary/30">
              <div className="text-[9px] font-mono text-muted-foreground uppercase">Puntos</div>
              <div className="text-lg font-mono font-bold text-amber tabular-nums">{score}</div>
            </div>
            <div className="hud-corner p-2 bg-secondary/30">
              <div className="text-[9px] font-mono text-muted-foreground uppercase">Racha</div>
              <div className="text-lg font-mono font-bold text-cyan-hud tabular-nums">{streak}</div>
            </div>
            <div className="hud-corner p-2 bg-secondary/30">
              <div className="text-[9px] font-mono text-muted-foreground uppercase">Combo</div>
              <div className={cn("text-lg font-mono font-bold tabular-nums", combo > 1 ? "text-amber blink-soft" : "text-muted-foreground")}>x{combo}</div>
            </div>
            <div className="hud-corner p-2 bg-secondary/30 hidden sm:block">
              <div className="text-[9px] font-mono text-muted-foreground uppercase">Aciertos</div>
              <div className="text-lg font-mono font-bold text-green-hud tabular-nums">{hits}</div>
            </div>
            <div className="hud-corner p-2 bg-secondary/30 hidden sm:block">
              <div className="text-[9px] font-mono text-muted-foreground uppercase">Fallados</div>
              <div className="text-lg font-mono font-bold text-red-hud tabular-nums">{misses}</div>
            </div>
          </div>

          {/* Game arena */}
          <div
            className="hud-corner relative overflow-hidden scanline"
            style={{ aspectRatio: "16/10", minHeight: 280, maxHeight: "60vh" }}
            onClick={handleMiss}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
            {/* Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <Crosshair className="w-32 h-32 text-red-hud" />
            </div>

            <AnimatePresence>
              {targets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    position: "absolute",
                    left: `${t.x}%`,
                    top: `${t.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    onClick={(e) => handleHit(t, e)}
                    className={cn(
                      "relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-2xl sm:text-3xl hud-corner transition-transform hover:scale-110",
                      t.type === "HOSTIL" && "border-red-hud bg-red-hud/30 glow-red",
                      t.type === "NEUTRAL" && "border-cyan-hud bg-cyan-hud/30",
                      t.type === "CIVIL" && "border-green-hud bg-green-hud/30"
                    )}
                  >
                    <VIcon k={t.emoji} className="w-6 h-6 sm:w-7 sm:h-7 text-foreground" />
                    {/* TTL ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="46"
                        fill="none"
                        stroke={t.type === "HOSTIL" ? "#ef4444" : t.type === "NEUTRAL" ? "#22d3ee" : "#22c55e"}
                        strokeWidth="2"
                        strokeDasharray="289"
                        strokeDashoffset={289 - (289 * Math.max(0, 1 - (Date.now() - t.spawnTime) / t.ttl))}
                        opacity="0.5"
                      />
                    </svg>
                  </motion.button>
                </div>
              ))}
            </AnimatePresence>

            {/* Pause button */}
            <button
              onClick={(e) => { e.stopPropagation(); handlePause(); }}
              className="absolute top-2 right-2 px-2 py-1 hud-corner bg-background/80 border-amber-hud text-amber text-[10px] font-mono uppercase z-10"
            >
              {paused ? "Reanudar" : "Pausar"}
            </button>

            {/* Overlay de pausa: los objetivos se congelan visualmente también */}
            {paused && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 pointer-events-none">
                <div className="text-center space-y-2">
                  <Pause className="w-10 h-10 mx-auto text-amber" />
                  <div className="font-mono text-amber uppercase tracking-widest text-sm">Operación en pausa</div>
                  <div className="text-[10px] font-mono text-muted-foreground">Los objetivos están congelados</div>
                </div>
              </div>
            )}
          </div>

          {/* Live stats footer */}
          <div className="hud-corner p-2 flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-amber" />
              <span className="text-muted-foreground">Penalizaciones: <span className="text-red-hud">{penalties}</span></span>
            </div>
            <div className="text-muted-foreground">
              Mejor racha: <span className="text-cyan-hud">{bestStreak}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="hud-corner p-2 bg-secondary/40">
      <div className="text-[10px] font-mono text-muted-foreground uppercase">{label}</div>
      <div className={cn("text-lg font-mono font-bold", color)}>{value}</div>
    </div>
  );
}
