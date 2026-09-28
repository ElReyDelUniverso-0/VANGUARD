"use client";

// v62.0 ESCUDOS DEL ABISMO — el escudo de racha ya no es solo emergencia:
// se compra en la TIENDA por 120ⓒ (CONSUMABLE_SHIELD) y se consume GRATIS
// aquí cuando la racha está en peligro. Uno guardado = una racha salvada.

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/game-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Flame, Gift, Check, Play, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyLoginModal() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // v58.0 DOMINIO TOTAL — ESCUDO DE RACHA: salva la racha con 150ⓒ si faltaste
  const [shieldSaved, setShieldSaved] = useState(false);
  const { lastLoginDate, addCoins, addGems, addXp, streak, progressMission, coins, spendCoins, inventory, consumeFromInventory } = useGameStore();
  // v62.0: escudos guardados en inventario (comprados en la tienda por 120ⓒ)
  const shieldsOwned = inventory
    .filter((i) => i.id === "consumable_shield")
    .reduce((acc, i) => acc + i.quantity, 0);
  const streakAtRisk = !!lastLoginDate && !isYesterday(lastLoginDate) && streak >= 3;

  useEffect(() => {
    const today = todayKey();
    if (lastLoginDate !== today && !dismissed) {
      // pequeño delay para que cargue el HUD
      // v72.0: si la intro cinematográfica va a correr esta sesión, el bono
      // ESPERA a que termine (8.3s de intro + margen) — primero la intro, luego el premio.
      let delay = 400;
      try {
        if (sessionStorage.getItem("vanguard-booted") !== "1") delay = 9400;
      } catch { /* noop */ }
      const t = setTimeout(() => setOpen(true), delay);
      return () => clearTimeout(t);
    }
  }, [lastLoginDate, dismissed]);

  const handleShield = () => {
    const ok = spendCoins(150, "ESCUDO DE RACHA — racha protegida");
    if (ok) {
      setShieldSaved(true);
      toast.success(`🛡️ RACHA PROTEGIDA — ${streak} días siguen vivos`, {
        description: "Reclama tu bono diario para continuar la racha (v58.0).",
      });
    } else {
      toast.error("Monedas insuficientes", {
        description: "El escudo cuesta 150ⓒ. Gana monedas en misiones, arcade o leyendo expedientes.",
      });
    }
  };

  // v62.0: consumir un escudo guardado de la tienda (gratis, se pagó al comprar)
  const handleStoredShield = () => {
    const ok = consumeFromInventory("consumable_shield", 1);
    if (ok) {
      setShieldSaved(true);
      toast.success(`🛡️ ESCUDO GUARDADO USADO — ${streak} días siguen vivos`, {
        description: `Quedan ${Math.max(0, shieldsOwned - 1)} escudo(s) en tu inventario. Compra más en la tienda por 120ⓒ.`,
      });
    } else {
      toast.error("No se pudo usar el escudo guardado");
    }
  };

  const handleClaim = () => {
    const today = todayKey();
    const newStreak = lastLoginDate && (isYesterday(lastLoginDate) || shieldSaved) ? streak + 1 : 1;
    const reward = 30 + newStreak * 10;
    addCoins(reward, `Login diario dia ${newStreak}${shieldSaved ? " (escudo)" : ""}`);
    if (newStreak % 7 === 0) {
      addGems(2, "Bonus racha 7 dias");
    }
    addXp(40);
    // actualizar streak y lastLoginDate en el store
    useGameStore.setState({
      streak: newStreak,
      lastLoginDate: today,
    });
    setDismissed(true);
    // progress LOGIN mission
    progressMission("D_LOGIN");
    if (newStreak >= 7) progressMission("S_STREAK_7", 7);
    toast.success(`+${reward} monedas · racha ${newStreak} dias`, {
      description: shieldSaved ? "Escudo de racha usado — la racha continua" : "Recompensa de conexion diaria reclamada",
    });
    setOpen(false);
  };

  const handleClose = (openState: boolean) => {
    setOpen(openState);
    if (!openState) {
      // Mark as dismissed so it doesn't reopen this session
      setDismissed(true);
      // Still set lastLoginDate so it doesn't show again today
      const today = todayKey();
      if (lastLoginDate !== today) {
        useGameStore.setState({ lastLoginDate: today });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!fixed hud-panel border-amber-hud sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-amber flex items-center gap-2">
            <Gift className="w-5 h-5" /> Reconexión diaria
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Bienvenido de vuelta, agente. Tu racha determina el bonus diario.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => {
              const day = i + 1;
              const claimedDays = streak > 0 ? (streak - 1) % 7 + 1 : 0;
              const isCurrent = streak === 0 ? day === 1 : (streak % 7 || 7) + 1 === day;
              const claimed = day <= claimedDays;
              return (
                <div
                  key={i}
                  className={`hud-corner p-1.5 text-center ${
                    claimed
                      ? "bg-green-hud border-green-hud"
                      : isCurrent
                      ? "bg-amber-hud border-amber-hud glow-amber"
                      : "bg-secondary border-border"
                  }`}
                >
                  <div className="text-[8px] font-mono text-muted-foreground">D{i + 1}</div>
                  <div className="text-sm">{claimed ? <Check className="w-4 h-4 inline text-green-hud" /> : isCurrent ? <Play className="w-4 h-4 inline text-amber" /> : "·"}</div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between hud-corner p-3 bg-secondary">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-hud" />
              <div>
                <div className="text-xs font-mono text-muted-foreground">Racha actual</div>
                <div className="text-lg font-bold text-red-hud font-mono">{streak} dias</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber" />
              <div>
                <div className="text-xs font-mono text-muted-foreground">Recompensa hoy</div>
                <div className="text-lg font-bold text-amber font-mono">
                  +{30 + (isYesterday(lastLoginDate) || shieldSaved ? streak + 1 : 1) * 10}
                </div>
              </div>
            </div>
          </div>
          {streakAtRisk && !shieldSaved && (
            <div className="hud-corner p-3 bg-red-hud/10 border border-red-hud/50 space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-mono text-red-hud font-bold uppercase">
                <ShieldAlert className="w-4 h-4 animate-pulse" /> ¡Racha en peligro! {streak} dias se reinician hoy
              </div>
              {shieldsOwned > 0 ? (
                <Button
                  onClick={handleStoredShield}
                  className="w-full bg-green-hud/20 border border-green-hud text-green-hud hover:bg-green-hud/30 font-mono text-xs uppercase"
                >
                  🛡️ Usar escudo guardado ({shieldsOwned} en inventario) — GRATIS
                </Button>
              ) : (
                <Button
                  onClick={handleShield}
                  disabled={coins < 150}
                  className="w-full bg-red-hud/20 border border-red-hud text-red-hud hover:bg-red-hud/30 font-mono text-xs uppercase"
                >
                  🛡️ Comprar escudo de emergencia — 150ⓒ
                </Button>
              )}
              <p className="text-[9px] font-mono text-muted-foreground">
                {shieldsOwned > 0
                  ? "v62.0: tus escudos de la tienda se usan gratis. Puedes guardar más por 120ⓒ en la tienda."
                  : "v62.0: guarda escudos en la TIENDA por 120ⓒ y úsalos gratis cuando faltes. La emergencia cuesta 150ⓒ."}
              </p>
            </div>
          )}
          {shieldSaved && (
            <div className="hud-corner p-2 bg-green-hud/10 border border-green-hud/50 text-[10px] font-mono text-green-hud flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> ESCUDO ACTIVO — la racha continuara en {streak + 1} dias al reclamar
            </div>
          )}
          <Button
            onClick={handleClaim}
            className="w-full bg-amber-hud text-amber hover:bg-amber-hud/80 font-mono uppercase tracking-wider"
          >
            {shieldSaved ? "Reclamar bono (racha salvada)" : "Reclamar bono diario"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function isYesterday(date: string | null) {
  if (!date) return false;
  const d = new Date(date + "T00:00:00");
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toISOString().slice(0, 10) === y.toISOString().slice(0, 10);
}
