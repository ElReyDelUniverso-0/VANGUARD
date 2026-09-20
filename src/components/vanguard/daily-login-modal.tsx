"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/game-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Flame, Gift, Check, Play } from "lucide-react";
import { toast } from "sonner";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyLoginModal() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { lastLoginDate, addCoins, addGems, addXp, streak, progressMission } = useGameStore();

  useEffect(() => {
    const today = todayKey();
    if (lastLoginDate !== today && !dismissed) {
      // pequeño delay para que cargue el HUD
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, [lastLoginDate, dismissed]);

  const handleClaim = () => {
    const today = todayKey();
    const newStreak = lastLoginDate && isYesterday(lastLoginDate) ? streak + 1 : 1;
    const reward = 30 + newStreak * 10;
    addCoins(reward, `Login diario dia ${newStreak}`);
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
      description: "Recompensa de conexion diaria reclamada",
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
                  +{30 + (isYesterday(lastLoginDate) ? streak + 1 : 1) * 10}
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={handleClaim}
            className="w-full bg-amber-hud text-amber hover:bg-amber-hud/80 font-mono uppercase tracking-wider"
          >
            Reclamar bono diario
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
