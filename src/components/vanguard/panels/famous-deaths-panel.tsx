"use client";

import { useState } from "react";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { FAMOUS_FIGURES, type FamousFigure } from "@/lib/game-data";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Skull, MapPin, Calendar, ChevronRight, ChevronDown, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} a.C.`;
  return `${year} d.C.`;
}

export function FamousDeathsPanel() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "famous">("ALL");

  const filtered = FAMOUS_FIGURES.filter((f) => filter === "ALL" || f.famous);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Muertes famosas en guerra"
        subtitle="Figuras historicas · como murieron"
        icon={<Skull className="w-4 h-4 text-red-hud" />}
        color="red"
        right={
          <div className="text-[10px] font-mono text-muted-foreground">
            {FAMOUS_FIGURES.length} figuras
          </div>
        }
      />

      {/* Filter */}
      <div className="flex gap-1">
        {(["ALL", "famous"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-2 py-1 border text-[10px] font-mono uppercase",
              filter === f
                ? "border-red-hud text-red-hud bg-red-hud/30"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "ALL" ? "Todas" : "Mas famosas"}
          </button>
        ))}
      </div>

      {/* Grid of figures */}
      <div className="grid sm:grid-cols-2 gap-2">
        {filtered.map((figure, idx) => {
          const isExpanded = selected === figure.id;
          return (
            <motion.div
              key={figure.id}
              layout
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="hud-corner overflow-hidden"
            >
              <button
                onClick={() => setSelected(isExpanded ? null : figure.id)}
                className="w-full p-3 flex items-center gap-3 hover:bg-secondary/40 transition-colors text-left"
              >
                <div className={cn(
                  "w-8 h-8 hud-corner flex items-center justify-center text-lg flex-shrink-0",
                  figure.famous ? "bg-amber-hud/30 border-amber-hud" : "bg-secondary/40"
                )}>
                  <VIcon k={figure.emoji} className="w-5 h-5 text-amber" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono font-bold text-foreground truncate">{figure.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {formatYear(figure.deathYear)} · {figure.role}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-amber flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 pt-0 space-y-2">
                      <p className="text-xs text-foreground pl-11">{figure.description}</p>
                      <div className="grid grid-cols-2 gap-2 pl-11">
                        <div className="hud-corner p-2 bg-red-hud/10 border-red-hud/30">
                          <div className="text-[9px] font-mono text-muted-foreground uppercase flex items-center gap-1">
                            <Skull className="w-2.5 h-2.5" /> Causa
                          </div>
                          <div className="text-[10px] font-mono text-red-hud">{figure.cause}</div>
                        </div>
                        <div className="hud-corner p-2 bg-secondary/40">
                          <div className="text-[9px] font-mono text-muted-foreground uppercase flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" /> Lugar
                          </div>
                          <div className="text-[10px] font-mono text-foreground">{figure.deathPlace}</div>
                        </div>
                      </div>
                      <div className="hud-corner p-2 bg-amber-hud/10 border-amber-hud/30 pl-11">
                        <div className="text-[9px] font-mono text-muted-foreground uppercase flex items-center gap-1">
                          <Crosshair className="w-2.5 h-2.5" /> Guerra/Conflicto
                        </div>
                        <div className="text-[10px] text-amber">{figure.war}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
