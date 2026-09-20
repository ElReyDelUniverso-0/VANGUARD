"use client";

// Vanguard v12 — EPOCAS DE LA ANTIGUEDAD: linea de tiempo desde la prehistoria
// hasta la era colonial, con fichas (imperios, inventos, "entonces vs ahora")
// y mini-quiz por epoca con recompensa.

import { useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Hourglass, CheckCircle2, XCircle, ArrowRight, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { sfx } from "@/lib/sound";
import { useGameStore } from "@/lib/game-store";
import { ERAS, type EraItem } from "@/lib/archive-data";

export function ErasPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const [sel, setSel] = useState<EraItem | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [solved, setSolved] = useState<string[]>([]);

  const pick = (e: EraItem) => {
    sfx.tab(); setSel(e); setAnswer(null);
  };

  const answerQuiz = (e: EraItem, i: number) => {
    if (answer !== null) return;
    setAnswer(i);
    if (i === e.quiz.answer) {
      sfx.success();
      if (!solved.includes(e.id)) {
        addCoins(30, "Quiz de epoca acertado");
        addXp(20);
        setSolved((p) => [...p, e.id]);
        toast.success("¡Correcto! +30 mon · +20 xp");
      } else toast.success("¡Correcto de nuevo!");
    } else { sfx.error(); toast.error("Esa no era... revisa la ficha"); }
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="EPOCAS DE LA ANTIGUEDAD"
        subtitle="De la cueva al imperio colonial · quiz con recompensa"
        icon={<Hourglass className="w-4 h-4" />} color="violet"
        right={<span className="text-[10px] font-mono text-muted-foreground">{solved.length}/{ERAS.length} QUIZ</span>}
      />

      {/* linea de tiempo */}
      <div className="relative pl-4">
        <div className="absolute left-1 top-1 bottom-1 w-px bg-gradient-to-b from-red-hud/60 via-amber-hud/60 to-violet-hud/60" />
        {ERAS.map((e) => (
          <div key={e.id} className="relative mb-2">
            <span className="absolute -left-3.5 top-4 w-2 h-2 rounded-full border border-amber-hud bg-background" />
            <button onClick={() => pick(e)}
              className={cn("w-full hud-corner border p-3 text-left transition-colors flex gap-3 items-center",
                sel?.id === e.id ? "border-amber-hud bg-amber-hud/15" : "border-border/60 bg-secondary/20 hover:border-amber-hud/50")}>
              {e.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.img} alt={e.name} className="w-16 h-16 object-cover border border-border/60 rounded-sm hidden sm:block" loading="lazy" />
              ) : (
                <div className="w-16 h-16 border border-border/60 rounded-sm hidden sm:flex items-center justify-center text-muted-foreground/40"><Hourglass className="w-6 h-6" /></div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-foreground">{e.name}</span>
                  <span className="text-[9px] font-mono text-cyan-hud">{e.period}</span>
                  {solved.includes(e.id) && <span className="text-[8px] font-mono text-green-hud">QUIZ ✓</span>}
                </div>
                <p className="text-[10px] font-mono text-muted-foreground line-clamp-2 mt-0.5">{e.desc.split("\n\n")[0]}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber/60 flex-shrink-0" />
            </button>
          </div>
        ))}
      </div>

      {/* detalle */}
      {sel && (
        <div className="hud-corner border border-amber-hud bg-background p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-mono text-base font-bold text-amber">{sel.name}</h3>
              <p className="text-[10px] font-mono text-muted-foreground">{sel.period}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setSel(null)} className="h-6 text-[10px] font-mono">CERRAR</Button>
          </div>
          <div className="text-xs text-foreground/90 leading-relaxed space-y-2">
            {sel.desc.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="border border-border/50 bg-secondary/20 p-2.5">
              <div className="text-[9px] font-mono uppercase tracking-widest text-amber mb-1">Imperios y potencias</div>
              <div className="flex flex-wrap gap-1">
                {sel.empires.map((x) => <span key={x} className="px-1.5 py-0.5 text-[9px] font-mono border border-red-hud/50 text-red-hud rounded-sm">{x}</span>)}
              </div>
            </div>
            <div className="border border-border/50 bg-secondary/20 p-2.5">
              <div className="text-[9px] font-mono uppercase tracking-widest text-amber mb-1">Inventos que heredamos</div>
              <div className="flex flex-wrap gap-1">
                {sel.inventions.map((x) => <span key={x} className="px-1.5 py-0.5 text-[9px] font-mono border border-cyan-hud/50 text-cyan-hud rounded-sm">{x}</span>)}
              </div>
            </div>
          </div>
          <div className="border border-violet-hud/50 bg-violet-hud/10 p-2.5 grid sm:grid-cols-2 gap-2">
            <div>
              <div className="text-[8px] font-mono uppercase text-violet-hud mb-0.5">Entonces</div>
              <div className="text-[11px] font-mono text-foreground/85">{sel.thenNow.old}</div>
            </div>
            <div>
              <div className="text-[8px] font-mono uppercase text-cyan-hud mb-0.5">Ahora ("igualito del pasado")</div>
              <div className="text-[11px] font-mono text-foreground/85">{sel.thenNow.now}</div>
            </div>
          </div>
          {/* mini quiz */}
          <div className="border border-amber-hud/50 bg-amber-hud/5 p-3">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber mb-2 flex items-center gap-1">
              <Coins className="w-3 h-3" /> QUIZ DE EPOCA · +30 MON
            </div>
            <p className="text-xs font-mono text-foreground mb-2">{sel.quiz.q}</p>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {sel.quiz.options.map((o, i) => {
                const isRight = i === sel.quiz.answer;
                const chosen = answer === i;
                return (
                  <button key={i} onClick={() => answerQuiz(sel, i)}
                    className={cn("flex items-center gap-2 px-2 py-1.5 border rounded-sm text-[11px] font-mono text-left transition-colors",
                      answer === null ? "border-border/60 hover:border-amber-hud/60 text-foreground"
                        : isRight ? "border-green-hud/70 text-green-hud bg-green-hud/10"
                        : chosen ? "border-red-hud/70 text-red-hud bg-red-hud/10"
                        : "border-border/40 text-muted-foreground")}>
                    {answer !== null && isRight ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : answer !== null && chosen ? <XCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <span className="w-3.5 h-3.5 flex-shrink-0" />}
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
