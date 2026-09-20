"use client";

import { useState } from "react";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { BRIEFINGS, CONFLICTS, type Briefing } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { FileText, Lock, CheckCircle2, Eye, Coins, Clock, ChevronRight, X, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";

const classColor: Record<string, string> = {
  PUBLICO: "text-green-hud border-green-hud bg-green-hud/30",
  RESERVADO: "text-amber border-amber-hud bg-amber-hud/30",
  SECRETO: "text-red-hud border-red-hud bg-red-hud/30",
};

export function BriefingsPanel() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const { unlockedBriefings, readBriefings, unlockBriefing, recordReadBriefing, coins } = useGameStore();

  const briefing = BRIEFINGS.find((b) => b.id === openId);
  const isUnlocked = (b: Briefing) => b.coinCost === 0 || unlockedBriefings.includes(b.id);

  const filtered = BRIEFINGS.filter((b) => {
    if (classFilter !== "ALL" && b.classification !== classFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const conflict = CONFLICTS.find((c) => c.id === b.conflictId);
      return (
        b.title.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        conflict?.country.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpen = (b: Briefing) => {
    if (!isUnlocked(b)) {
      toast.error("Briefing bloqueado", {
        description: `Desbloquea por ${b.coinCost} monedas o completa la compra`,
      });
      return;
    }
    setOpenId(b.id);
    recordReadBriefing(b.id);
  };

  const handleUnlock = (b: Briefing) => {
    const ok = unlockBriefing(b.id, b.coinCost);
    if (ok) {
      toast.success(`Briefing desbloqueado: ${b.title}`, { description: `-${b.coinCost} monedas` });
    } else {
      toast.error("Monedas insuficientes", { description: `Necesitas ${b.coinCost} monedas` });
    }
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Briefings de inteligencia"
        subtitle="Informes clasificados · analisis estrategico"
        icon={<FileText className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
        right={
          <div className="text-[10px] font-mono text-muted-foreground">
            <span className="text-amber">{coins}</span> monedas
          </div>
        }
      />

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por titulo, contenido o pais..."
            className="pl-7 h-8 bg-secondary border-amber-hud/40 font-mono text-xs"
          />
        </div>
        <div className="flex gap-1">
          {["ALL", "PUBLICO", "RESERVADO", "SECRETO"].map((f) => (
            <button
              key={f}
              onClick={() => setClassFilter(f)}
              className={cn(
                "px-2 py-1 border text-[10px] font-mono uppercase",
                classFilter === f
                  ? "border-cyan-hud text-cyan-hud bg-cyan-hud/30"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "ALL" ? "Todos" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.length === 0 && (
          <div className="col-span-full hud-corner p-8 text-center">
            <Search className="w-8 h-8 mx-auto text-muted-foreground opacity-40 mb-2" />
            <p className="text-sm font-mono text-muted-foreground">Sin resultados para tu busqueda</p>
          </div>
        )}
        {filtered.map((b) => {
          const conflict = CONFLICTS.find((c) => c.id === b.conflictId);
          const unlocked = isUnlocked(b);
          const read = readBriefings.includes(b.id);
          return (
            <motion.div
              key={b.id}
              layout
              className={cn(
                "hud-corner p-3 transition-all",
                unlocked ? "hover:bg-secondary/40" : "opacity-80"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <FlagBadge code={conflict?.flag} size="lg" />
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">
                      {b.id} · {conflict?.country}
                    </div>
                    <div className="text-sm font-mono font-bold text-foreground">{b.title}</div>
                  </div>
                </div>
                <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border uppercase", classColor[b.classification])}>
                  {b.classification}
                </span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{b.summary}</p>

              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mb-2">
                <Clock className="w-3 h-3" /> {b.date}
                {read && (
                  <span className="flex items-center gap-0.5 text-green-hud">
                    <CheckCircle2 className="w-3 h-3" /> Leido
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                {unlocked ? (
                  <Button
                    size="sm"
                    onClick={() => handleOpen(b)}
                    className="h-7 px-2 text-[10px] font-mono uppercase bg-cyan-hud/40 text-cyan-hud hover:bg-cyan-hud/60 border border-cyan-hud"
                  >
                    <Eye className="w-3 h-3 mr-1" /> Leer briefing
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleUnlock(b)}
                    className="h-7 px-2 text-[10px] font-mono uppercase bg-amber-hud text-amber hover:bg-amber-hud/80"
                  >
                    <Lock className="w-3 h-3 mr-1" /> Desbloquear · {b.coinCost}
                    <Coins className="w-3 h-3 ml-0.5" />
                  </Button>
                )}
                {read && (
                  <span className="text-[9px] font-mono text-green-hud flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> completado
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={!!briefing} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="!fixed hud-panel border-cyan-hud sm:max-w-2xl max-h-[90vh] overflow-y-auto thin-scroll">
          {briefing && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="font-mono text-cyan-hud flex items-center gap-2">
                    <FileText className="w-5 h-5" /> {briefing.title}
                  </DialogTitle>
                  <span className={cn("text-[10px] font-mono px-2 py-0.5 border uppercase", classColor[briefing.classification])}>
                    {briefing.classification}
                  </span>
                </div>
                <DialogDescription className="text-muted-foreground">
                  {briefing.id} · {briefing.date} · informe de inteligencia
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="hud-corner p-3 bg-secondary/30 border-l-4 border-l-cyan-hud">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Resumen ejecutivo</div>
                  <p className="text-sm text-foreground">{briefing.summary}</p>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-amber uppercase mb-2">Puntos clave</div>
                  <ul className="space-y-1.5">
                    {briefing.keyPoints.map((p, i) => (
                      <li key={i} className="text-xs text-foreground flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 mt-0.5 text-amber flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="hud-corner p-3 bg-secondary/30">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Analisis</div>
                  <p className="text-sm text-foreground">{briefing.analysis}</p>
                </div>

                <div className="hud-corner p-3 bg-red-hud/20 border-l-4 border-l-red-hud">
                  <div className="text-[10px] font-mono text-red-hud uppercase mb-1">Pronostico</div>
                  <p className="text-sm text-foreground">{briefing.outlook}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-2 border-t border-border">
                  <span>+10 XP por lectura</span>
                  <span>FIN DEL INFORME · {briefing.id}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
