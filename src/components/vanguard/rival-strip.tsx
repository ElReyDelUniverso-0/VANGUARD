"use client";

// v67.0 EL HANGAR — TIRA DE RIVAL: tu competencia personal sobre la que no
// decides pero no puedes ignorar. Aparece en la portada y en predicciones.

import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { useRivalStrip } from "@/lib/rival";
import { cn } from "@/lib/utils";

export function RivalStrip({ compact = false }: { compact?: boolean }) {
  const { rival, mine, ahead } = useRivalStrip();
  if (!rival) return null;
  const total = Math.max(1, mine + rival.points);
  const myPct = Math.round((mine / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("hud-corner p-3", ahead ? "neon-border" : "border-crisis-hud")}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Swords className="w-3 h-3 text-amber" /> TU RIVAL ASIGNADO
        </div>
        <div className={cn("font-mono text-[9px] uppercase tracking-widest font-bold", ahead ? "text-neon" : "text-crisis")}>
          {ahead ? "VAS GANANDO" : "VA GANANDO"}
        </div>
      </div>
      <div className="flex items-end justify-between gap-3 mb-1">
        <div className="text-right">
          <div className="font-tech text-xl font-bold text-amber tabular-nums leading-none">{mine.toLocaleString()}</div>
          <div className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">TÚ</div>
        </div>
        <div className="flex-1 h-2 bg-secondary overflow-hidden rounded-sm flex flex-row-reverse">
          <div className="h-full bg-crisis" style={{ width: `${100 - myPct}%` }} />
          <div className="h-full bg-amber" style={{ width: `${myPct}%` }} />
        </div>
        <div>
          <div className="font-tech text-xl font-bold text-crisis tabular-nums leading-none">{rival.points.toLocaleString()}</div>
          <div className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
            {rival.name} · NV{rival.level}
          </div>
        </div>
      </div>
      {!compact && (
        <div className="font-mono text-[10px] text-muted-foreground italic text-center mt-1">
          "{rival.taunt}"
        </div>
      )}
    </motion.div>
  );
}
