"use client";

// Vanguard v8 — Extras del MERCADO GEOPOLITICO: staking soberano (renta pasiva
// por APY determinista por pais) y alertas de precio que disparan toasts al cruzarse.

import { useEffect, useState } from "react";
import { PiggyBank, Bell, TrendingUp, TrendingDown, X, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/game-store";
import { ASSETS, marketSim, formatPrice } from "@/lib/market-sim";
import { stakingApyFor, stakeAccrued } from "@/lib/hooks-data";
import { toast } from "sonner";
import { sfx } from "@/lib/sound";
import { FlagBadge } from "@/components/vanguard/flag-badge";

const STAKE_AMOUNTS = [100, 250, 500, 1000];

// =================== STAKING SOBERANO ===================
export function StakingPanel({ selId, onSelect }: { selId: string; onSelect: (id: string) => void }) {
  const stakes = useGameStore((s) => s.stakes);
  const stakeAsset = useGameStore((s) => s.stakeAsset);
  const claimStake = useGameStore((s) => s.claimStake);
  const unstakeAsset = useGameStore((s) => s.unstakeAsset);
  const stakeEarnedTotal = useGameStore((s) => s.stakeEarnedTotal);
  const coins = useGameStore((s) => s.coins);
  const [amount, setAmount] = useState(250);
  const [, tickTock] = useState(0);

  // refresco cada segundo para ver los intereses crecer en vivo
  useEffect(() => {
    const t = setInterval(() => tickTock((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const apy = stakingApyFor(selId);
  const stake = stakes[selId];
  const pending = stake ? stakeAccrued(stake.coins, apy, stake.lastClaimAt) : 0;
  const totalStaked = Object.values(stakes).reduce((a, s) => a + s.coins, 0);

  return (
    <div className="hud-corner p-3 bg-secondary/40 border-green-hud/40">
      <div className="flex items-center gap-2 mb-2">
        <PiggyBank className="w-4 h-4 text-green-hud" />
        <span className="text-xs font-mono font-bold uppercase text-foreground">Staking soberano</span>
        <span className="ml-auto text-[9px] font-mono text-muted-foreground">
          total apostado <span className="text-green-hud font-bold">{totalStaked}</span> mon · ganado{" "}
          <span className="text-green-hud font-bold">+{stakeEarnedTotal}</span>
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => onSelect(selId)} className="flex items-center gap-1.5 hover:opacity-80">
          <FlagBadge code={ASSETS.find((a) => a.id === selId)?.flag ?? "US"} size="sm" />
          <span className="text-[11px] font-mono font-bold text-foreground">{selId}</span>
        </button>
        <span className="text-[9px] font-mono px-1.5 py-0.5 border border-green-hud text-green-hud bg-green-hud/20 font-bold uppercase">
          APY {apy}% diario
        </span>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground flex items-center gap-1">
          <Coins className="w-3 h-3 text-amber" /> {coins}
        </span>
      </div>

      {!stake ? (
        <>
          <div className="flex items-center gap-1.5 mb-2">
            {STAKE_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={cn(
                  "px-2 py-1 border text-[10px] font-mono",
                  amount === amt ? "border-green-hud text-green-hud bg-green-hud/30" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {amt}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (stakeAsset(selId, amount)) {
                sfx.success();
                toast.success(`STAKE ABIERTO: ${amount} mon en ${selId} al ${apy}% diario`, {
                  description: "Los intereses se acumulan en vivo — reclámalos cuando quieras",
                });
              } else {
                toast.error("Monedas insuficientes para apostar esa cantidad");
              }
            }}
            disabled={coins < amount}
            className={cn(
              "w-full px-3 py-2 border rounded-sm text-[10px] font-mono font-bold uppercase transition-colors",
              coins >= amount
                ? "border-green-hud bg-green-hud/20 text-green-hud hover:bg-green-hud/40"
                : "border-border/50 text-muted-foreground opacity-50 cursor-not-allowed"
            )}
          >
            Apostar {amount} mon en {selId}
          </button>
        </>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground">
              Posición: <span className="text-foreground font-bold">{stake.coins} mon</span>
            </span>
            <span className="text-green-hud font-bold blink-soft">+{pending} en vivo</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const got = claimStake(selId);
                if (got > 0) { sfx.success(); toast.success(`INTERESES RECLAMADOS: +${got} mon`); }
                else toast.info("Aun no hay intereses que reclamar — espera un poco");
              }}
              className="px-3 py-2 border border-green-hud bg-green-hud/20 text-green-hud rounded-sm text-[10px] font-mono font-bold uppercase hover:bg-green-hud/40"
            >
              Reclamar intereses
            </button>
            <button
              onClick={() => {
                const total = unstakeAsset(selId);
                if (total > 0) { sfx.success(); toast.success(`STAKE RETIRADO: +${total} mon devueltas`); }
              }}
              className="px-3 py-2 border border-red-hud/60 text-red-hud rounded-sm text-[10px] font-mono font-bold uppercase hover:bg-red-hud/20"
            >
              Retirar todo
            </button>
          </div>
        </div>
      )}

      {/* lista de stakes activos */}
      {Object.keys(stakes).filter((id) => id !== selId).length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/40 space-y-1">
          {Object.entries(stakes)
            .filter(([id]) => id !== selId)
            .map(([id, s]) => (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className="w-full flex items-center justify-between text-[9px] font-mono px-2 py-1 hover:bg-secondary/50"
              >
                <span className="text-foreground/80 font-bold">{id}</span>
                <span className="text-muted-foreground">
                  {s.coins} mon · {stakingApyFor(id)}% APY
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

// =================== ALERTAS DE PRECIO ===================
export function AlertsPanel({ selId, price, market }: { selId: string; price: number; market: ReturnType<typeof marketSim.getState> }) {
  const alerts = useGameStore((s) => s.alerts);
  const addAlert = useGameStore((s) => s.addAlert);
  const removeAlert = useGameStore((s) => s.removeAlert);
  const [op, setOp] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [threshold, setThreshold] = useState("");

  // motor de disparo: cada tick comprueba si alguna alerta se cruza
  useEffect(() => {
    const st = useGameStore.getState();
    for (const a of st.alerts) {
      const p = market.assets[a.assetId]?.price;
      if (!p) continue;
      const crossed = a.op === "ABOVE" ? p >= a.price : p <= a.price;
      if (crossed) {
        removeAlert(a.id);
        sfx.success();
        toast.success(`ALERTA ${a.assetId}: precio ${a.op === "ABOVE" ? "sobre" : "bajo"} ${formatPrice(a.price)}`, {
          description: `Ahora cotiza a ${formatPrice(p)} — momento de operar`,
        });
      }
    }
  }, [market.lastTick]);

  const num = Math.max(0, Number(threshold) || 0);

  return (
    <div className="hud-corner p-3 bg-secondary/40 border-amber-hud/40">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-4 h-4 text-amber" />
        <span className="text-xs font-mono font-bold uppercase text-foreground">Alertas de precio</span>
        <span className="ml-auto text-[9px] font-mono text-muted-foreground">{alerts.length}/8 activas</span>
      </div>

      {alerts.length < 8 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setOp("ABOVE")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 border text-[9px] font-mono font-bold uppercase",
                op === "ABOVE" ? "border-green-hud text-green-hud bg-green-hud/25" : "border-border text-muted-foreground"
              )}
            >
              <TrendingUp className="w-3 h-3" /> Sube sobre
            </button>
            <button
              onClick={() => setOp("BELOW")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 border text-[9px] font-mono font-bold uppercase",
                op === "BELOW" ? "border-red-hud text-red-hud bg-red-hud/25" : "border-border text-muted-foreground"
              )}
            >
              <TrendingDown className="w-3 h-3" /> Baja bajo
            </button>
            <input
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder={price.toFixed(2)}
              inputMode="decimal"
              className="flex-1 min-w-0 bg-background border border-border px-2 py-1 text-[10px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-amber-hud"
            />
          </div>
          <button
            onClick={() => {
              if (num <= 0) {
                toast.error("Introduce un precio objetivo valido");
                return;
              }
              addAlert(selId, op, num);
              setThreshold("");
              toast.success(`ALERTA CREADA: ${selId} ${op === "ABOVE" ? "≥" : "≤"} ${formatPrice(num)}`);
            }}
            className="w-full px-3 py-2 border border-amber-hud bg-amber-hud/20 text-amber rounded-sm text-[10px] font-mono font-bold uppercase hover:bg-amber-hud/40"
          >
            Alertar sobre {selId} ({op === "ABOVE" ? "subida" : "caida"})
          </button>
        </div>
      )}

      <div className="mt-2 space-y-1 max-h-40 overflow-y-auto thin-scroll">
        {alerts.length === 0 && (
          <div className="text-[9px] font-mono text-muted-foreground/70 py-2 text-center">
            Sin alertas — crea una para operar sin mirar la pantalla
          </div>
        )}
        {alerts.map((a) => {
          const p = market.assets[a.assetId]?.price ?? 0;
          const dist = a.price > 0 ? ((a.price - p) / p) * 100 : 0;
          return (
            <div key={a.id} className="flex items-center gap-2 text-[9px] font-mono px-2 py-1.5 bg-background/50 border border-border/40">
              <span className="font-bold text-foreground w-12">{a.assetId}</span>
              <span className={cn(a.op === "ABOVE" ? "text-green-hud" : "text-red-hud")}>
                {a.op === "ABOVE" ? "≥" : "≤"} {formatPrice(a.price)}
              </span>
              <span className="text-muted-foreground ml-auto">falta {dist >= 0 ? "+" : ""}{dist.toFixed(1)}%</span>
              <button onClick={() => removeAlert(a.id)} aria-label="Borrar alerta" className="text-muted-foreground hover:text-red-hud">
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
