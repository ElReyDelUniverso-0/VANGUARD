"use client";

// Vanguard v8 — CENTRO DE GANANCIAS: la sala de maquinas que hace volver cada dia.
// Ruleta diaria (1 giro gratis + extras con gemas), cajones de suministros (gacha),
// airdrop horario y Pase Vanguard de temporada con 12 niveles.

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift, Dices, Package, Crown, Coins, Gem, Zap, Clock, Sparkles, Check, Lock, TrendingUp, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";
import {
  WHEEL_PRIZES,
  CRATES,
  getCrateDef,
  PASS_TIERS,
  passTierFor,
  passSeasonLabel,
  AIRDROP_INTERVAL_MS,
  EXTRA_SPIN_COST_GEMS,
  type CrateTier,
  type CrateLootResult,
  type WheelPrize,
} from "@/lib/hooks-data";

const SEG = 360 / WHEEL_PRIZES.length;
const SEG_COLORS = ["#f5a623", "#1f2937", "#22d3ee", "#1f2937", "#ef4444", "#1f2937", "#a855f7", "#facc15"];

function prizeLabel(p: WheelPrize): string {
  return p.label;
}

export function HooksPanel() {
  const [view, setView] = useState<"RULETA" | "CAJONES" | "PASE">("RULETA");

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Centro de Ganancias"
        subtitle="Ruleta diaria · cajones de suministros · airdrop horario · Pase Vanguard de temporada"
        icon={<Gift className="w-4 h-4 text-amber" />}
        color="amber"
      />

      <AirdropCard />

      {/* selector de vista */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(
          [
            { k: "RULETA", label: "Ruleta diaria", icon: <Dices className="w-3.5 h-3.5" /> },
            { k: "CAJONES", label: "Cajones", icon: <Package className="w-3.5 h-3.5" /> },
            { k: "PASE", label: "Pase Vanguard", icon: <Crown className="w-3.5 h-3.5" /> },
          ] as const
        ).map((t) => (
          <button
            key={t.k}
            onClick={() => { sfx.tab(); setView(t.k); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 border rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition-colors",
              view === t.k
                ? "border-amber-hud text-amber bg-amber-hud/30"
                : "border-border/60 text-muted-foreground hover:text-foreground hover:border-amber-hud/40"
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {view === "RULETA" && <WheelView />}
      {view === "CAJONES" && <CratesView />}
      {view === "PASE" && <PassView />}
    </div>
  );
}

// =================== AIRDROP HORARIO ===================
function AirdropCard() {
  const lastAirdropAt = useGameStore((s) => s.lastAirdropAt);
  const claimAirdrop = useGameStore((s) => s.claimAirdrop);
  const gems = useGameStore((s) => s.gems);
  const [, tick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const now = Date.now();
  const elapsed = lastAirdropAt === null ? AIRDROP_INTERVAL_MS : now - lastAirdropAt;
  const ready = elapsed >= AIRDROP_INTERVAL_MS;
  const remainMs = Math.max(0, AIRDROP_INTERVAL_MS - elapsed);
  const mm = String(Math.floor(remainMs / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remainMs % 60000) / 1000)).padStart(2, "0");

  const handleClaim = () => {
    const res = claimAirdrop();
    if (res) {
      sfx.success();
      toast.success(`AIRDROP RECLAMADO: +${res.coins} monedas, +${res.gems} gemas`);
    }
  };

  return (
    <div className={cn("hud-corner p-3 flex items-center justify-between gap-3 flex-wrap border", ready ? "border-amber-hud bg-amber-hud/10 glow-amber" : "bg-secondary/40 border-border")}>
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 border flex items-center justify-center rounded-sm", ready ? "border-amber-hud text-amber troop-pulse" : "border-border text-muted-foreground")}>
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold uppercase text-foreground flex items-center gap-1.5">
            Airdrop horario
            {ready && <span className="text-[8px] px-1 py-0.5 border border-amber-hud text-amber bg-amber-hud/30 blink-soft">DISPONIBLE</span>}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            {ready ? "+30 monedas y +2 gemas esperandote — reclama ahora" : `Proximo paquete en ${mm}:${ss}`}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-muted-foreground hidden sm:flex items-center gap-1">
          <Gem className="w-3 h-3 text-cyan-hud" /> {gems}
        </span>
        <button
          onClick={handleClaim}
          disabled={!ready}
          className={cn(
            "px-4 py-2 border rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition-colors",
            ready
              ? "border-amber-hud bg-amber-hud/30 text-amber hover:bg-amber-hud/50"
              : "border-border/50 text-muted-foreground opacity-50 cursor-not-allowed"
          )}
        >
          {ready ? "Reclamar" : "En espera"}
        </button>
      </div>
    </div>
  );
}

// =================== RULETA ===================
function WheelView() {
  const lastWheelDate = useGameStore((s) => s.lastWheelDate);
  const gems = useGameStore((s) => s.gems);
  const spinWheel = useGameStore((s) => s.spinWheel);
  const buyExtraSpin = useGameStore((s) => s.buyExtraSpin);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WheelPrize | null>(null);

  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);
  const freeAvailable = lastWheelDate !== todayKey;

  const doSpin = (paid: boolean) => {
    if (spinning) return;
    const prize = paid ? buyExtraSpin() : spinWheel();
    if (!prize) {
      if (paid) toast.error("Gem insuficientes para un giro extra");
      return;
    }
    setSpinning(true);
    setResult(null);
    sfx.tab();
    // segmento i ocupa [i*SEG, (i+1)*SEG); el puntero esta arriba (0 grados)
    const target = 360 * 5 + (360 - (prize.id * SEG + SEG / 2));
    setRotation((r) => {
      const base = Math.ceil(r / 360) * 360;
      return base + target;
    });
    setTimeout(() => {
      setSpinning(false);
      setResult(prize);
      sfx.success();
      toast.success(`RULETA: ${prizeLabel(prize)}`, {
        description: prize.kind === "JACKPOT" ? "¡BOTE de 250 monedas + gema + XP!" : undefined,
      });
    }, 3200);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* rueda */}
      <div className="hud-corner p-4 bg-secondary/40 flex flex-col items-center">
        <div className="relative" style={{ width: 260, height: 260 }}>
          {/* puntero */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 z-10" style={{ transform: "translateX(-50%)" }}>
            <div className="w-0 h-0 border-l-[9px] border-r-[9px] border-t-[16px] border-l-transparent border-r-transparent border-t-amber drop-shadow-[0_0_6px_rgba(245,166,35,0.8)]" />
          </div>
          <motion.svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: [0.15, 0.9, 0.25, 1] }}
          >
            {WHEEL_PRIZES.map((p, i) => {
              const a0 = (i * SEG - 90) * (Math.PI / 180);
              const a1 = ((i + 1) * SEG - 90) * (Math.PI / 180);
              const x0 = 100 + 95 * Math.cos(a0);
              const y0 = 100 + 95 * Math.sin(a0);
              const x1 = 100 + 95 * Math.cos(a1);
              const y1 = 100 + 95 * Math.sin(a1);
              const mid = ((i + 0.5) * SEG - 90) * (Math.PI / 180);
              const lx = 100 + 62 * Math.cos(mid);
              const ly = 100 + 62 * Math.sin(mid);
              return (
                <g key={p.id}>
                  <path
                    d={`M 100 100 L ${x0.toFixed(2)} ${y0.toFixed(2)} A 95 95 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`}
                    fill={SEG_COLORS[i]}
                    stroke="#0b0f1c"
                    strokeWidth="1.5"
                  />
                  <text
                    x={lx} y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill="#0b0f1c"
                    transform={`rotate(${(i * SEG + SEG / 2)}, ${lx}, ${ly})`}
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="14" fill="#0b0f1c" stroke="#f5a623" strokeWidth="2" />
            <circle cx="100" cy="100" r="5" fill="#f5a623" />
          </motion.svg>
        </div>

        <AnimatePresence>
          {result && !spinning && (
            <motion.div
              key={result.id + result.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 px-4 py-2 border border-green-hud bg-green-hud/20 text-green-hud text-xs font-mono font-bold uppercase tracking-wider text-center"
            >
              {result.kind === "JACKPOT" ? "¡BOTE DE 250 MON!" : `+ ${result.label}`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* panel derecho */}
      <div className="space-y-3">
        <div className="hud-corner p-4 bg-secondary/40">
          <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Estado del agente</div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className={cn("flex items-center gap-1.5", freeAvailable ? "text-amber font-bold" : "text-muted-foreground")}>
              <Sparkles className="w-3.5 h-3.5" />
              {freeAvailable ? "GIRO GRATIS DISPONIBLE" : "Giro gratis usado hoy"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={() => doSpin(false)}
              disabled={spinning || !freeAvailable}
              className={cn(
                "px-4 py-3 border rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-colors",
                freeAvailable && !spinning
                  ? "border-amber-hud bg-amber-hud/30 text-amber hover:bg-amber-hud/50 glow-amber"
                  : "border-border/50 text-muted-foreground opacity-50 cursor-not-allowed"
              )}
            >
              {spinning ? "Girando..." : "Giro gratis"}
            </button>
            <button
              onClick={() => doSpin(true)}
              disabled={spinning || gems < EXTRA_SPIN_COST_GEMS}
              className={cn(
                "px-4 py-3 border rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5",
                !spinning && gems >= EXTRA_SPIN_COST_GEMS
                  ? "border-cyan-hud bg-cyan-hud/20 text-cyan-hud hover:bg-cyan-hud/40"
                  : "border-border/50 text-muted-foreground opacity-50 cursor-not-allowed"
              )}
            >
              <Gem className="w-3.5 h-3.5" /> Extra {EXTRA_SPIN_COST_GEMS}
            </button>
          </div>
          <div className="text-[9px] font-mono text-muted-foreground mt-2">
            1 giro gratis cada dia · extras a {EXTRA_SPIN_COST_GEMS} gemas · cada giro otorga +15 PX de Pase Vanguard
          </div>
        </div>

        <div className="hud-corner p-3 bg-secondary/40">
          <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Tabla de premios</div>
          <div className="grid grid-cols-2 gap-1.5">
            {WHEEL_PRIZES.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-[10px] font-mono">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: SEG_COLORS[p.id] }} />
                <span className={cn(p.kind === "JACKPOT" ? "text-amber font-bold" : "text-foreground/80")}>{p.label}</span>
                {p.kind === "JACKPOT" && <Star className="w-3 h-3 text-amber" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =================== CAJONES ===================
function CratesView() {
  const freeCrates = useGameStore((s) => s.freeCrates);
  const coins = useGameStore((s) => s.coins);
  const gems = useGameStore((s) => s.gems);
  const openCrate = useGameStore((s) => s.openCrate);
  const [opening, setOpening] = useState<CrateTier | null>(null);
  const [loot, setLoot] = useState<CrateLootResult | null>(null);

  const handleOpen = (tier: CrateTier) => {
    if (opening) return;
    const def = getCrateDef(tier);
    const hasFree = (freeCrates[tier] ?? 0) > 0;
    if (!hasFree && def.costCoins > 0 && coins < def.costCoins) {
      toast.error("Monedas insuficientes para este cajon");
      return;
    }
    if (!hasFree && def.costGems > 0 && gems < def.costGems) {
      toast.error("Gem insuficientes para este cajon");
      return;
    }
    setOpening(tier);
    setLoot(null);
    setTimeout(() => {
      const res = openCrate(tier);
      setOpening(null);
      if (res) {
        setLoot(res);
        sfx.success();
      } else {
        toast.error("No se pudo abrir el cajon");
      }
    }, 1400);
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        {CRATES.map((c) => {
          const free = freeCrates[c.tier] ?? 0;
          const isOpening = opening === c.tier;
          return (
            <motion.div
              key={c.tier}
              whileHover={{ y: -3 }}
              className={cn("hud-corner p-4 bg-secondary/40 border flex flex-col", c.accent, isOpening && "troop-pulse", isOpening && c.glow)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono px-1.5 py-0.5 border border-current uppercase font-bold" style={{ color: c.tier === "COMUN" ? "#94a3b8" : c.tier === "ELITE" ? "#22d3ee" : "#f5a623" }}>
                  {c.rarity}
                </span>
                {free > 0 && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 border border-green-hud text-green-hud bg-green-hud/20 font-bold uppercase blink-soft">
                    x{free} gratis
                  </span>
                )}
              </div>
              <Package className={cn("w-9 h-9 mb-2", c.tier === "COMUN" ? "text-muted-foreground" : c.tier === "ELITE" ? "text-cyan-hud" : "text-amber")} />
              <div className="text-xs font-mono font-bold uppercase text-foreground">{c.name}</div>
              <div className="text-[10px] font-mono text-muted-foreground leading-snug mt-1 mb-3 flex-1">{c.desc}</div>
              <div className="text-[9px] font-mono text-muted-foreground uppercase mb-2">
                Contenido: {c.loot.coins[0]}-{c.loot.coins[1]} mon · {c.loot.gems[0]}-{c.loot.gems[1]} gemas · {c.loot.xp[0]}-{c.loot.xp[1]} XP
                {c.loot.boostChance > 0 && <span> · boost {Math.round(c.loot.boostChance * 100)}%</span>}
              </div>
              <button
                onClick={() => handleOpen(c.tier)}
                disabled={!!opening}
                className={cn(
                  "w-full px-3 py-2.5 border rounded-sm text-[11px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5",
                  free > 0
                    ? "border-green-hud bg-green-hud/25 text-green-hud hover:bg-green-hud/45"
                    : "border-amber-hud bg-amber-hud/20 text-amber hover:bg-amber-hud/40",
                  opening && opening !== c.tier && "opacity-40"
                )}
              >
                {isOpening ? (
                  "Abriendo..."
                ) : free > 0 ? (
                  <><Check className="w-3.5 h-3.5" /> Abrir gratis</>
                ) : c.costCoins > 0 ? (
                  <><Coins className="w-3.5 h-3.5" /> Abrir · {c.costCoins} mon</>
                ) : (
                  <><Gem className="w-3.5 h-3.5" /> Abrir · {c.costGems} gemas</>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="hud-corner p-3 bg-secondary/30 text-[10px] font-mono text-muted-foreground flex items-start gap-2">
        <TrendingUp className="w-3.5 h-3.5 text-amber flex-shrink-0 mt-0.5" />
        <span>
          Los cajones GRATIS se ganan dominando el mundo en MUNDO DE GUERRA (+1 LEGENDARIA), subiendo niveles del Pase Vanguard y en eventos.
          Abrir cajones otorga +12 PX de pase. El boost x2 XP+MON dura 30 minutos.
        </span>
      </div>

      {/* overlay de botin */}
      <AnimatePresence>
        {loot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLoot(null)}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.7, rotate: -4 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              className={cn(
                "hud-corner max-w-sm w-full p-6 text-center border-2 bg-secondary/60",
                loot.tier === "LEGENDARIA" ? "border-amber-hud" : loot.tier === "ELITE" ? "border-cyan-hud" : "border-border"
              )}
            >
              <Package className={cn("w-14 h-14 mx-auto mb-3", loot.tier === "LEGENDARIA" ? "text-amber" : loot.tier === "ELITE" ? "text-cyan-hud" : "text-muted-foreground")} />
              <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground mb-1">{getCrateDef(loot.tier).name}</div>
              <h3 className="text-lg font-mono font-bold tracking-widest uppercase text-foreground mb-4">Botin obtenido</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <LootStat icon={<Coins className="w-4 h-4 text-amber" />} value={`+${loot.coins}`} label="monedas" />
                <LootStat icon={<Gem className="w-4 h-4 text-cyan-hud" />} value={`+${loot.gems}`} label="gemas" />
                <LootStat icon={<Zap className="w-4 h-4 text-green-hud" />} value={`+${loot.xp}`} label="XP" />
              </div>
              {loot.boost && (
                <div className="mb-4 px-3 py-2 border border-violet-hud text-violet-hud text-[10px] font-mono font-bold uppercase blink-soft">
                  BOOST x2 XP + MON · 30 min activado
                </div>
              )}
              <button
                onClick={() => setLoot(null)}
                className="px-4 py-2 border border-amber-hud bg-amber-hud/30 text-amber rounded-sm text-xs font-mono font-bold uppercase hover:bg-amber-hud/50"
              >
                Recoger botin
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LootStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="hud-corner p-2 bg-background/60">
      <div className="flex items-center justify-center mb-0.5">{icon}</div>
      <div className="text-sm font-mono font-bold text-foreground leading-none">{value}</div>
      <div className="text-[8px] font-mono text-muted-foreground uppercase">{label}</div>
    </div>
  );
}

// =================== PASE VANGUARD ===================
function PassView() {
  const passXp = useGameStore((s) => s.passXp);
  const passClaimedFree = useGameStore((s) => s.passClaimedFree);
  const passClaimedElite = useGameStore((s) => s.passClaimedElite);
  const claimPassTier = useGameStore((s) => s.claimPassTier);
  const conquestWins = useGameStore((s) => s.conquestWins);
  const conquestCapturesTotal = useGameStore((s) => s.conquestCapturesTotal);
  const betStats = useGameStore((s) => s.betStats);
  const stakeEarnedTotal = useGameStore((s) => s.stakeEarnedTotal);

  const currentTier = passTierFor(passXp);
  const nextTier = PASS_TIERS.find((p) => p.tier === currentTier + 1);
  const prevNeeded = currentTier > 0 ? PASS_TIERS[currentTier - 1].xpNeeded : 0;
  const progressPct = nextTier
    ? Math.min(100, Math.round(((passXp - prevNeeded) / (nextTier.xpNeeded - prevNeeded)) * 100))
    : 100;

  return (
    <div className="space-y-4">
      {/* progreso de temporada */}
      <div className="hud-corner p-4 bg-secondary/40 border-amber-hud">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber">Pase Vanguard · {passSeasonLabel()}</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            Nivel <span className="text-amber font-bold">{currentTier}</span>/12 · {passXp} PX de temporada
          </span>
        </div>
        <div className="h-3 bg-secondary rounded-sm overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-hud to-red-hud"
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          />
          {nextTier && (
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-foreground/90 font-bold">
              {passXp - prevNeeded} / {nextTier.xpNeeded - prevNeeded} PX → nivel {nextTier.tier}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[10px] font-mono text-muted-foreground">
          <PassSource icon={<CastleLite />} label="Capturas" value={`${conquestCapturesTotal} · +4 PX c/u`} />
          <PassSource icon={<Crown className="w-3 h-3 text-amber" />} label="Dominios" value={`${conquestWins} · +150 PX`} />
          <PassSource icon={<Dices className="w-3 h-3 text-amber" />} label="Apuestas" value={`${betStats.placed} · +4/10 PX`} />
          <PassSource icon={<TrendingUp className="w-3 h-3 text-amber" />} label="Staking" value={`${stakeEarnedTotal} mon ganados`} />
        </div>
      </div>

      {/* niveles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {PASS_TIERS.map((t) => {
          const unlocked = currentTier >= t.tier;
          const freeClaimed = passClaimedFree.includes(t.tier);
          const eliteClaimed = passClaimedElite.includes(t.tier);
          return (
            <div
              key={t.tier}
              className={cn(
                "hud-corner p-3 border bg-secondary/40",
                unlocked ? "border-amber-hud" : "border-border/50 opacity-70"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn("text-[10px] font-mono font-bold uppercase", unlocked ? "text-amber" : "text-muted-foreground")}>
                  Nivel {t.tier}
                </span>
                {unlocked ? (
                  <span className="text-[8px] font-mono px-1 py-0.5 border border-green-hud text-green-hud uppercase font-bold">Abierto</span>
                ) : (
                  <span className="text-[8px] font-mono px-1 py-0.5 border border-border text-muted-foreground uppercase flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> {t.xpNeeded} PX
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const ok = claimPassTier(t.tier, "FREE");
                    if (ok) { sfx.success(); toast.success(`Recompensa GRATIS del nivel ${t.tier} reclamada`); }
                  }}
                  disabled={!unlocked || freeClaimed}
                  className={cn(
                    "px-2 py-2 border rounded-sm text-[9px] font-mono font-bold uppercase transition-colors",
                    freeClaimed
                      ? "border-border/50 text-muted-foreground"
                      : unlocked
                      ? "border-green-hud bg-green-hud/20 text-green-hud hover:bg-green-hud/40"
                      : "border-border/50 text-muted-foreground opacity-50 cursor-not-allowed"
                  )}
                >
                  {freeClaimed ? "Reclamado" : (
                    <>
                      Gratis<br />
                      <span className="normal-case">+{t.free.coins} mon{t.free.gems ? ` · ${t.free.gems}g` : ""}{t.free.crate ? ` · 1 cajón ${t.free.crate}` : ""}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    const ok = claimPassTier(t.tier, "ELITE");
                    if (ok) { sfx.success(); toast.success(`Recompensa ELITE del nivel ${t.tier} reclamada`); }
                    else toast.info("La via ELITE esta reservada para operadores con Pase ELITE activo");
                  }}
                  disabled={!unlocked || eliteClaimed}
                  className={cn(
                    "px-2 py-2 border rounded-sm text-[9px] font-mono font-bold uppercase transition-colors",
                    eliteClaimed
                      ? "border-border/50 text-muted-foreground"
                      : unlocked
                      ? "border-amber-hud bg-amber-hud/20 text-amber hover:bg-amber-hud/40"
                      : "border-border/50 text-muted-foreground opacity-50 cursor-not-allowed"
                  )}
                >
                  {eliteClaimed ? "Reclamado" : (
                    <>
                      Elite<br />
                      <span className="normal-case">+{t.elite.coins} mon · {t.elite.gems}g{t.elite.crate ? ` · 1 cajon ${t.elite.crate}` : ""}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hud-corner p-3 bg-secondary/30 text-[10px] font-mono text-muted-foreground flex items-start gap-2">
        <Gift className="w-3.5 h-3.5 text-amber flex-shrink-0 mt-0.5" />
        <span>
          La via ELITE se activa con el Pase ELITE (tienda). El PX de temporada se gana jugando: capturas (+4), dominio mundial (+150),
          ruleta (+15), cajones (+12), staking (+8) y apuestas. Cada mes arranca una temporada nueva y las recompensas se reinician.
        </span>
      </div>
    </div>
  );
}

function PassSource({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 hud-corner px-2 py-1.5 bg-background/50">
      {icon}
      <div className="leading-tight">
        <div className="text-[8px] uppercase text-muted-foreground/70">{label}</div>
        <div className="text-[9px] text-foreground/80">{value}</div>
      </div>
    </div>
  );
}

function CastleLite() {
  return <Crown className="w-3 h-3 text-amber" />;
}
