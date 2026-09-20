"use client";

// VANGUARD v26 — ARMERÍA REAL: fotos reales, no polígonos.
// El usuario pidió: "un lugar donde pueda ver FOTOS de armas REALISTAS, toda
// su función y cómo se arma por piezas realistas — no disque polígono".
// Fotos reales desde Wikimedia Commons (licencia libre, atribución en cada
// ficha) + ficha técnica + pasos de armado + puente al ESTUDIO COMUNITARIO
// para que cada agente SUBA SU PROPIA arma con sus fotos.

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { toast } from "sonner";
import {
  Crosshair, Wrench, ChevronLeft, ChevronRight, Camera, ExternalLink, Ruler,
  Weight, Timer, Users, Globe2, Info, Upload,
} from "lucide-react";
import { ARSENAL, type ArsenalWeapon } from "@/lib/arsenal-data";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";

function SpecIcon({ k }: { k: string }) {
  if (k.includes("calibre") || k.includes("ogiva")) return <Ruler className="w-3 h-3" />;
  if (k.includes("peso") || k.includes("masa")) return <Weight className="w-3 h-3" />;
  if (k.includes("alcance") || k.includes("radio")) return <Timer className="w-3 h-3" />;
  if (k.includes("usuario") || k.includes("operador")) return <Users className="w-3 h-3" />;
  return <Globe2 className="w-3 h-3" />;
}

// token sin rellenar (foto aún verificándose contra Wikimedia)
const isPending = (u?: string) => !u || u.startsWith("__");

export function ArmeriaPanel() {
  const alias = useGameStore((s) => s.alias);
  const [idx, setIdx] = useState(0);
  const [w, setW] = useState<ArsenalWeapon | null>(ARSENAL[0] ?? null);
  const [imgFail, setImgFail] = useState<Record<string, boolean>>({});

  const go = (d: number) => {
    const n = (idx + d + ARSENAL.length) % ARSENAL.length;
    setIdx(n);
    setW(ARSENAL[n]);
    sfx.click();
  };

  // 429/403 transitorios de Wikimedia: la ficha degrada a "foto en verificación"
  const pending = (u?: string) => isPending(u) || (u ? imgFail[u] : false);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="ARMERÍA REAL"
        subtitle="Fotos REALES de las armas de los conflictos actuales — función, ficha técnica y cómo se arma pieza por pieza. Nada de polígonos."
        icon={<Crosshair className="w-5 h-5 text-red-hud" />}
        color="red"
      />

      {/* selector */}
      <div className="flex gap-1.5 flex-wrap items-center">
        {ARSENAL.map((a, i) => (
          <button
            key={a.id}
            onClick={() => { setIdx(i); setW(a); sfx.click(); }}
            className={cn(
              "px-2 py-1 text-[10px] font-mono uppercase rounded-sm border transition-colors",
              w?.id === a.id ? "border-red-hud text-red-hud bg-red-hud/20 font-bold" : "border-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {a.short}
          </button>
        ))}
        <button
          onClick={() => {
            const ev = new CustomEvent("vanguard:navigate", { detail: "creador" });
            window.dispatchEvent(ev);
            toast.success("Abre el ESTUDIO COMUNITARIO → tipo ARMA", { description: "Sube TU arma con fotos reales y su armado" });
          }}
          className="ml-auto px-2.5 py-1 text-[10px] font-mono uppercase rounded-sm border border-violet-hud text-violet-hud bg-violet-hud/10 hover:bg-violet-hud/30 flex items-center gap-1"
        >
          <Upload className="w-3 h-3" /> sube tu arma
        </button>
      </div>

      {w && (
        <div className="grid lg:grid-cols-[1fr_360px] gap-3">
          {/* foto grande + galería */}
          <div className="space-y-2 min-w-0">
            <div className="relative hud-panel border-red-hud/40 overflow-hidden">
              {pending(w.photo) ? (
                <div className="w-full h-[280px] sm:h-[420px] bg-black/40 flex flex-col items-center justify-center gap-2">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">foto real en verificación · wikimedia</span>
                </div>
              ) : (
                <img
                  key={w.id}
                  src={w.photo}
                  alt={w.name}
                  onError={() => w && setImgFail((f) => ({ ...f, [w.photo]: true }))}
                  className={cn("w-full object-contain bg-black/40", w.photoH ? "" : "h-[280px] sm:h-[420px]")}
                  style={w.photoH ? { height: w.photoH } : undefined}
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2 pt-8">
                <div className="flex items-end justify-between gap-2 flex-wrap">
                  <div>
                    <div className="text-sm font-mono font-black uppercase text-white tracking-wide">{w.name}</div>
                    <div className="text-[9px] font-mono text-white/70 uppercase">{w.origin} · {w.era}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-mono text-white/50">{pending(w.photo) ? "FOTO EN VERIFICACIÓN" : "FOTO REAL · WIKIMEDIA"}</div>
                    {!pending(w.photo) && (
                      <a href={w.photo} target="_blank" rel="noreferrer" className="text-[9px] font-mono text-cyan-hud inline-flex items-center gap-0.5">
                        ver fuente <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 border border-white/20 text-white rounded-sm flex items-center justify-center hover:bg-black/80" aria-label="Arma anterior">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 border border-white/20 text-white rounded-sm flex items-center justify-center hover:bg-black/80" aria-label="Arma siguiente">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* FUNCION */}
            <div className="hud-panel p-3">
              <div className="text-[10px] font-mono font-bold uppercase text-red-hud tracking-widest mb-1 flex items-center gap-1">
                <Info className="w-3 h-3" /> Qué hace en los conflictos
              </div>
              <p className="text-[12px] text-foreground/90 leading-relaxed">{w.function}</p>
            </div>

            {/* CÓMO SE ARMA — piezas reales */}
            <div className="hud-panel p-3">
              <div className="text-[10px] font-mono font-bold uppercase text-amber tracking-widest mb-2 flex items-center gap-1">
                <Wrench className="w-3 h-3" /> Cómo se arma — {w.assembly.length} piezas reales
              </div>
              {w.assemblyPhoto && !pending(w.assemblyPhoto) && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={w.assemblyPhoto} alt={`${w.name} despiece`} className="w-full h-44 sm:h-56 object-contain bg-black/30 border border-amber-hud/30 rounded-sm mb-2" />
              )}
              <ol className="grid sm:grid-cols-2 gap-1.5">
                {w.assembly.map((s, i) => (
                  <li key={i} className="flex gap-2 bg-secondary/40 border border-amber-hud/20 rounded-sm px-2 py-1.5">
                    <span className="w-5 h-5 shrink-0 bg-red-hud/30 border border-red-hud/60 text-red-hud text-[10px] font-mono font-bold flex items-center justify-center rounded-sm">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono font-bold text-amber">{s.pieza}</div>
                      <div className="text-[10px] text-muted-foreground leading-snug">{s.desc}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* ficha técnica */}
          <div className="space-y-3">
            <div className="hud-panel p-3">
              <div className="text-[10px] font-mono font-bold uppercase text-cyan-hud tracking-widest mb-2 flex items-center gap-1">
                <Camera className="w-3 h-3" /> Ficha técnica
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(w.specs).map(([k, v]) => (
                  <div key={k} className="bg-secondary/50 border border-cyan-hud/20 rounded-sm px-2 py-1.5">
                    <div className="text-[8px] font-mono uppercase text-muted-foreground flex items-center gap-1">
                      <SpecIcon k={k} /> {k}
                    </div>
                    <div className="text-[11px] font-mono font-bold text-foreground">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hud-panel p-3">
              <div className="text-[10px] font-mono font-bold uppercase text-amber tracking-widest mb-1">Por qué importa</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{w.impact}</p>
            </div>

            <div className="hud-panel p-3 border-violet-hud/40 bg-violet-hud/5">
              <div className="text-[10px] font-mono font-bold uppercase text-violet-hud tracking-widest mb-1 flex items-center gap-1">
                <Upload className="w-3 h-3" /> ¿Conoces otra arma?
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug mb-2">
                La armería la construye la comunidad: sube TU ficha con fotos reales, specs y el armado pieza por pieza.
                El agente IA la revisa y sale publicada (+30 monedas).
              </p>
              <div className="text-[9px] font-mono text-muted-foreground uppercase">
                {alias ? `Listo para subir, ${alias}` : "Entra con tu alias y sube la primera"}
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-[9px] font-mono text-muted-foreground/70 text-center uppercase tracking-widest">
        Fotografías: Wikimedia Commons — licencias libres con atribución a sus autores · uso educativo
      </p>
    </div>
  );
}
