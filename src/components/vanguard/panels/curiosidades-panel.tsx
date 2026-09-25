"use client";

// Vanguard v12 — CURIOSIDADES: tarjetas "Sabias que?" por categoria con
// rotacion diaria, dado aleatorio y recompensa de monedas por lectura nueva.

import { useState, useMemo, useEffect } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Sparkles, Dices, Coins, Brain, Landmark, Church, Landmark as Landmark2, Wallet, Radar, CalendarDays, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";
import { useGameStore } from "@/lib/game-store";
import { CURIOSITIES, type CurioCat } from "@/lib/archive-data";
import { dayKey } from "@/lib/hooks-data";

const CAT_META: Record<CurioCat, { label: string; icon: React.ReactNode; color: string }> = {
  GUERRA: { label: "Guerra", icon: <Brain className="w-3 h-3" />, color: "text-red-hud border-red-hud/60" },
  POLITICA: { label: "Politica", icon: <Landmark className="w-3 h-3" />, color: "text-amber border-amber-hud/60" },
  RELIGION: { label: "Religion", icon: <Church className="w-3 h-3" />, color: "text-violet-hud border-violet-hud/60" },
  ANTIGUEDAD: { label: "Antiguedad", icon: <Landmark2 className="w-3 h-3" />, color: "text-cyan-hud border-cyan-hud/60" },
  ECONOMIA: { label: "Economia", icon: <Wallet className="w-3 h-3" />, color: "text-green-hud border-green-hud/60" },
  ESPIONAJE: { label: "Espionaje", icon: <Radar className="w-3 h-3" />, color: "text-cyan-hud border-cyan-hud/60" },
};

function dailyIndex(): number {
  const k = dayKey();
  let h = 0; for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) % 100000;
  return h % CURIOSITIES.length;
}

export function CuriosidadesPanel() {
  const coins = useGameStore((s) => s.coins);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const [cat, setCat] = useState<CurioCat | "TODAS">("TODAS");
  const [read, setRead] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("vanguard-curio-read") ?? "[]") as string[]; } catch { return []; }
  });
  const [card, setCard] = useState<number>(dailyIndex());
  const [spin, setSpin] = useState(false);

  const list = useMemo(() => CURIOSITIES.filter((c) => cat === "TODAS" || c.cat === cat), [cat]);
  const readCount = read.length;

  const reward = (id: string) => {
    if (read.includes(id)) return false;
    const next = [...read, id];
    setRead(next);
    try { localStorage.setItem("vanguard-curio-read", JSON.stringify(next)); } catch {}
    addCoins(5, "Curiosidad leida");
    addXp(4);
    sfx.coin();
    toast.success("+5 mon · curiosidad archivada", { description: `${readCount + 1}/${CURIOSITIES.length} leidas` });
    return true;
  };

  const roll = () => {
    setSpin(true); sfx.beep();
    setTimeout(() => {
      const i = Math.floor(Math.random() * CURIOSITIES.length);
      setCard(i); setSpin(false); sfx.tab();
    }, 420);
  };

  const daily = CURIOSITIES[dailyIndex()];
  const featured = CURIOSITIES[card];

  // v51.3 EFEMÉRIDES DE HOY — datos reales de la API de Wikimedia (gratuita, sin key).
  interface Efem { year: number; text: string; link: string | null; }
  const [efems, setEfems] = useState<Efem[]>([]);
  useEffect(() => {
    const t = setTimeout(() => {
      void (async () => {
        try {
          const r = await fetch("/api/efemerides", { cache: "no-store" });
          const j = (await r.json()) as { ok: boolean; efemerides?: Efem[] };
          if (j.ok && Array.isArray(j.efemerides)) setEfems(j.efemerides.slice(0, 6));
        } catch { /* degradación: la tira no se muestra */ }
      })();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="CURIOSIDADES"
        subtitle="El archivo de lo improbable · +5 mon por lectura nueva"
        icon={<Sparkles className="w-4 h-4" />} color="amber"
        right={<span className="text-[10px] font-mono text-muted-foreground">{readCount}/{CURIOSITIES.length} LEIDAS</span>}
      />

      {/* v51.3 EFEMÉRIDES DE HOY — historia real, tal día como hoy */}
      {efems.length > 0 && (
        <div className="hud-corner border border-cyan-hud bg-cyan-hud/10 p-4">
          <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-hud mb-2 flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3" /> Efemérides de hoy · datos reales de Wikipedia
          </div>
          <ul className="space-y-1.5">
            {efems.map((e, i) => (
              <li key={`${e.year}-${i}`} className="text-[11px] leading-relaxed text-foreground/85 flex gap-2">
                <span className="shrink-0 font-mono font-bold text-amber">{e.year}</span>
                <span className="min-w-0">
                  {e.text}{" "}
                  {e.link && (
                    <a href={e.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-cyan-hud hover:underline">
                      wiki<ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* tarjeta diaria */}
      <div className="hud-corner border border-amber-hud bg-amber-hud/10 p-4">
        <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber mb-1.5">Curiosidad del dia</div>
        <p className="text-xs sm:text-sm text-foreground leading-relaxed">{daily.text}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className={cn("px-1.5 py-0.5 text-[8px] font-mono uppercase border rounded-sm", CAT_META[daily.cat].color)}>{CAT_META[daily.cat].label}</span>
          <Button size="sm" variant="ghost" onClick={() => reward(daily.id)} className="h-6 text-[9px] font-mono text-amber hover:bg-amber-hud/20">
            ARCHIVAR +5 <Coins className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* dado de curiosidad */}
      <div className="hud-corner border bg-secondary/20 p-4 min-h-[110px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div key={featured.id} initial={{ opacity: 0, rotateY: 60 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className={cn(spin && "opacity-40 blur-[1px]")}>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed">{featured.text}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-3 flex items-center justify-between">
          <span className={cn("px-1.5 py-0.5 text-[8px] font-mono uppercase border rounded-sm", CAT_META[featured.cat].color)}>{CAT_META[featured.cat].label}</span>
          <Button size="sm" onClick={roll} className="h-7 font-mono text-[10px] uppercase tracking-widest bg-secondary border-border hover:border-amber-hud/60">
            <Dices className="w-3.5 h-3.5 mr-1" /> OTRA CURIOSIDAD
          </Button>
        </div>
      </div>

      {/* filtros */}
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => { sfx.hover(); setCat("TODAS"); }}
          className={cn("px-2 py-1 rounded-sm text-[10px] font-mono uppercase border", cat === "TODAS" ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border/50 text-muted-foreground")}>
          Todas ({CURIOSITIES.length})
        </button>
        {(Object.keys(CAT_META) as CurioCat[]).map((c) => (
          <button key={c} onClick={() => { sfx.hover(); setCat(c); }}
            className={cn("px-2 py-1 rounded-sm text-[10px] font-mono uppercase border flex items-center gap-1", cat === c ? CAT_META[c].color + " bg-secondary" : "border-border/50 text-muted-foreground")}>
            {CAT_META[c].icon} {CAT_META[c].label} ({CURIOSITIES.filter((x) => x.cat === c).length})
          </button>
        ))}
      </div>

      {/* muro */}
      <div className="grid sm:grid-cols-2 gap-2">
        {list.map((c) => (
          <button key={c.id} onClick={() => reward(c.id)}
            className="hud-corner border bg-secondary/20 p-3 text-left hover:border-amber-hud/60 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={cn("px-1.5 py-0.5 text-[8px] font-mono uppercase border rounded-sm", CAT_META[c.cat].color)}>{CAT_META[c.cat].label}</span>
              {read.includes(c.id) && <span className="text-[8px] font-mono text-green-hud">LEIDA ✓</span>}
            </div>
            <p className="text-[11px] font-mono text-foreground/85 leading-relaxed">{c.text}</p>
          </button>
        ))}
      </div>
      <div className="text-center text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">Saldo: {coins.toLocaleString()} mon · cada ficha nueva suma 5 mon y 4 xp</div>
    </div>
  );
}
