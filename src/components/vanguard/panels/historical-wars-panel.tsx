"use client";

import { useState } from "react";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { HISTORICAL_WARS, type HistoricalWar } from "@/lib/game-data";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { ScrollText, MapPin, Calendar, Swords, ChevronRight, ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const eraColor: Record<string, string> = {
  ANTIGUA: "text-amber border-amber-hud bg-amber-hud/30",
  EDAD_MEDIA: "text-violet-hud border-violet-hud bg-violet-hud/30",
  MODERNA: "text-cyan-hud border-cyan-hud bg-cyan-hud/30",
  CONTEMPORANEA: "text-red-hud border-red-hud bg-red-hud/30",
};

const eraLabel: Record<string, string> = {
  ANTIGUA: "Antiguedad",
  EDAD_MEDIA: "Edad Media",
  MODERNA: "Edad Moderna",
  CONTEMPORANEA: "Contemporanea",
};

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} a.C.`;
  return `${year} d.C.`;
}

export function HistoricalWarsPanel() {
  const [selected, setSelected] = useState<string | null>(null);
  const [eraFilter, setEraFilter] = useState<string>("ALL");

  const filtered = HISTORICAL_WARS.filter((w) => eraFilter === "ALL" || w.era === eraFilter);
  const selectedWar = HISTORICAL_WARS.find((w) => w.id === selected);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Guerras historicas"
        subtitle="Antiguedad · Edad Media · Moderna · Contemporanea"
        icon={<ScrollText className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <div className="text-[10px] font-mono text-muted-foreground">
            {HISTORICAL_WARS.length} guerras
          </div>
        }
      />

      {/* Era filter */}
      <div className="flex flex-wrap gap-1.5">
        {["ALL", "ANTIGUA", "EDAD_MEDIA", "MODERNA", "CONTEMPORANEA"].map((era) => (
          <button
            key={era}
            onClick={() => setEraFilter(era)}
            className={cn(
              "px-2 py-1 border text-[10px] font-mono uppercase",
              eraFilter === era
                ? "border-amber-hud text-amber bg-amber-hud/30"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {era === "ALL" ? "Todas" : eraLabel[era]}
          </button>
        ))}
      </div>

      {/* Timeline view */}
      <div className="hud-corner p-3 bg-secondary/30">
        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Linea temporal</div>
        <div className="relative h-8">
          {/* Timeline bar */}
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-amber-hud/30" />
          {filtered.map((w) => {
            // Map yearStart from -300 to 2000 to 0-100%
            const minYear = -300;
            const maxYear = 2000;
            const pct = ((w.yearStart - minYear) / (maxYear - minYear)) * 100;
            const isSel = selected === w.id;
            return (
              <button
                key={w.id}
                onClick={() => setSelected(isSel ? null : w.id)}
                className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${Math.max(2, Math.min(98, pct))}%` }}
                title={`${w.name} (${formatYear(w.yearStart)})`}
              >
                <div className={cn(
                  "w-3 h-3 rounded-full border-2 transition-all",
                  isSel ? "bg-amber border-amber scale-150 glow-amber" : "bg-background border-amber-hud hover:scale-125"
                )} />
                <span className="text-[7px] font-mono text-muted-foreground mt-0.5 whitespace-nowrap hidden sm:block">
                  <VIcon k={w.emoji} className="w-6 h-6 text-amber" />
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-[8px] font-mono text-muted-foreground mt-1">
          <span>300 a.C.</span>
          <span>1000</span>
          <span>2000</span>
        </div>
      </div>

      {/* War cards */}
      <div className="grid sm:grid-cols-2 gap-2">
        {filtered.map((w, idx) => {
          const isExpanded = selected === w.id;
          return (
            <motion.div
              key={w.id}
              layout
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="hud-corner overflow-hidden"
            >
              <button
                onClick={() => setSelected(isExpanded ? null : w.id)}
                className="w-full p-3 flex items-center gap-3 hover:bg-secondary/40 transition-colors text-left"
              >
                <div className={cn(
                  "w-8 h-8 hud-corner flex items-center justify-center text-lg flex-shrink-0",
                  eraColor[w.era]
                )}>
                  <VIcon k={w.emoji} className="w-6 h-6 text-amber" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono font-bold text-foreground truncate">{w.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {formatYear(w.yearStart)} — {formatYear(w.yearEnd)}
                  </div>
                </div>
                <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border uppercase flex-shrink-0", eraColor[w.era])}>
                  {eraLabel[w.era]}
                </span>
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
                    <div className="p-3 pt-0 space-y-3">
                      <p className="text-xs text-foreground pl-11">{w.summary}</p>

                      <div className="grid grid-cols-2 gap-2 pl-11">
                        <div className="hud-corner p-2 bg-secondary/40">
                          <div className="text-[9px] font-mono text-muted-foreground uppercase flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" /> Region
                          </div>
                          <div className="text-[10px] font-mono text-foreground">{w.region}</div>
                        </div>
                        <div className="hud-corner p-2 bg-secondary/40">
                          <div className="text-[9px] font-mono text-muted-foreground uppercase flex items-center gap-1">
                            <Swords className="w-2.5 h-2.5" /> Bajas
                          </div>
                          <div className="text-[10px] font-mono text-red-hud">{w.casualties}</div>
                        </div>
                      </div>

                      <div className="hud-corner p-2 bg-secondary/40 pl-11">
                        <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Facciones</div>
                        <div className="flex flex-wrap gap-1">
                          {w.factions.map((f, i) => (
                            <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 border border-amber-hud/40 text-amber">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="hud-corner p-2 bg-green-hud/10 border-green-hud/30 pl-11">
                        <div className="text-[9px] font-mono text-muted-foreground uppercase mb-0.5">Resultado</div>
                        <div className="text-[10px] text-foreground">{w.outcome}</div>
                      </div>

                      <div className="hud-corner p-2 bg-amber-hud/10 border-amber-hud/30 pl-11">
                        <div className="text-[9px] font-mono text-muted-foreground uppercase mb-0.5">Significado historico</div>
                        <div className="text-[10px] text-foreground">{w.significance}</div>
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
