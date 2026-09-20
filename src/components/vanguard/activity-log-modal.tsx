"use client";

import { useGameStore } from "@/lib/game-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollText, Coins, Gem, Award, Trophy, Target, Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityLogPanel } from "@/components/vanguard/panels/activity-log-panel";

interface ActivityLogModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const iconForMsg = (msg: string) => {
  if (msg.includes("monedas") && msg.startsWith("+")) return <Coins className="w-3.5 h-3.5 text-amber" />;
  if (msg.includes("monedas") && msg.startsWith("-")) return <Coins className="w-3.5 h-3.5 text-red-hud" />;
  if (msg.includes("gemas")) return <Gem className="w-3.5 h-3.5 text-violet-hud" />;
  if (msg.includes("Logro desbloqueado")) return <Award className="w-3.5 h-3.5 text-green-hud" />;
  if (msg.includes("Logro reclamado")) return <Trophy className="w-3.5 h-3.5 text-amber" />;
  if (msg.includes("Mision")) return <Target className="w-3.5 h-3.5 text-red-hud" />;
  if (msg.includes("Recompensa semanal")) return <Trophy className="w-3.5 h-3.5 text-amber" />;
  if (msg.includes("nivel")) return <Star className="w-3.5 h-3.5 text-cyan-hud" />;
  if (msg.includes("racha") || msg.includes("Login")) return <Flame className="w-3.5 h-3.5 text-red-hud" />;
  return <ScrollText className="w-3.5 h-3.5 text-muted-foreground" />;
};

export function ActivityLogModal({ open, onOpenChange }: ActivityLogModalProps) {
  const log = useGameStore((s) => s.log);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!fixed hud-panel border-cyan-hud sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-mono text-cyan-hud flex items-center gap-2">
            <ScrollText className="w-5 h-5" /> Bitacora de comando
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ultimos {Math.min(log.length, 15)} eventos registrados
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto thin-scroll -mx-2 px-2">
          {log.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-mono">Sin eventos registrados</p>
              <p className="text-[10px] mt-1">Realiza acciones para ver actividad</p>
            </div>
          ) : (
            <div className="space-y-1">
              {log.slice(0, 15).map((entry, i) => (
                <div
                  key={`${entry.ts}-${i}`}
                  className="flex items-start gap-2 p-2 hover:bg-secondary/40 rounded-sm transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">{iconForMsg(entry.msg)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-foreground font-mono">{entry.msg}</div>
                    <div className="text-[9px] text-muted-foreground font-mono">
                      {new Date(entry.ts).toLocaleTimeString("es", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                  </div>
                  {entry.delta !== undefined && entry.delta !== 0 && (
                    <div
                      className={cn(
                        "text-xs font-mono font-bold tabular-nums flex-shrink-0",
                        entry.delta > 0 ? "text-green-hud" : "text-red-hud"
                      )}
                    >
                      {entry.delta > 0 ? "+" : ""}{entry.delta}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
