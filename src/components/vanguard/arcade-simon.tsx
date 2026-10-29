"use client";

// VANGUARD v83.0 ESTADIO GLOBAL — ARCADE #12: CIFRADO SIMON.
// La terminal transmite un código que crece un eslabón por ronda: escucha la
// secuencia de 4 glifos (cada uno con su tono Web Audio) y repítela. Cada
// ronda completada = +1 eslabón · +15 mon por eslabón al terminar.

import { useEffect, useRef, useState, useCallback } from "react";
import { AudioLines, Ear, Hand } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/sound";

interface PadDef {
  id: number; glyph: string; tone: number; color: string; glow: string; label: string;
}

const PADS: PadDef[] = [
  { id: 0, glyph: "▲", tone: 261.6, color: "border-cyan-hud bg-cyan-hud/15 text-cyan-hud", glow: "bg-cyan-hud/70", label: "DELTA" },
  { id: 1, glyph: "●", tone: 329.6, color: "border-amber-hud bg-amber/15 text-amber", glow: "bg-amber/70", label: "ECO" },
  { id: 2, glyph: "■", tone: 392.0, color: "border-violet-hud bg-violet-hud/15 text-violet-hud", glow: "bg-violet-hud/70", label: "SIERRA" },
  { id: 3, glyph: "✦", tone: 523.3, color: "border-red-hud bg-red-hud/15 text-red-hud", glow: "bg-red-hud/70", label: "TANGO" },
];

type Fase = "listo" | "escucha" | "repite" | "fin";

export function ArcadeSimon({
  onEnd,
  onExit,
}: {
  onEnd: (score: number) => void;
  onExit: () => void;
}) {
  const [fase, setFase] = useState<Fase>("listo");
  const [ronda, setRonda] = useState(0); // eslabones completados
  const [secuencia, setSecuencia] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [paso, setPaso] = useState(0);
  const [flashKo, setFlashKo] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finished = useRef(false);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    audioRef.current?.close().catch(() => { /* noop */ });
  }, []);

  const tone = useCallback((pad: number, dur = 0.28) => {
    try {
      if (!audioRef.current) {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioRef.current = new Ctor();
      }
      const ctx = audioRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = PADS[pad].tone;
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + dur + 0.05);
    } catch { /* audio bloqueado: la luz igualmente guía */ }
  }, []);

  const litPad = useCallback((pad: number, ms: number, after?: () => void) => {
    setLit(pad);
    tone(pad, ms / 1000 + 0.08);
    const t = setTimeout(() => {
      setLit(null);
      after?.();
    }, ms);
    timers.current.push(t);
  }, [tone]);

  const mostrarSecuencia = useCallback((seq: number[]) => {
    setFase("escucha");
    timers.current.forEach(clearTimeout);
    timers.current = [];
    let i = 0;
    const step = () => {
      if (i >= seq.length) {
        setFase("repite");
        setPaso(0);
        return;
      }
      litPad(seq[i], 430, () => {
        const t = setTimeout(step, 150);
        timers.current.push(t);
      });
      i++;
    };
    const t = setTimeout(step, 650);
    timers.current.push(t);
  }, [litPad]);

  const siguienteRonda = useCallback((prev: number[]) => {
    const seq = [...prev, Math.floor(Math.random() * 4)];
    setSecuencia(seq);
    setRonda(prev.length);
    mostrarSecuencia(seq);
  }, [mostrarSecuencia]);

  const empezar = () => {
    if (finished.current) return;
    sfx.tab();
    siguienteRonda([]);
  };

  const terminar = useCallback((eslabones: number) => {
    if (finished.current) return;
    finished.current = true;
    setFase("fin");
    sfx.error();
    onEnd(eslabones);
  }, [onEnd]);

  const tocar = (pad: number) => {
    if (fase !== "repite" || finished.current) return;
    litPad(pad, 180);
    const esperado = secuencia[paso];
    if (pad !== esperado) {
      setFlashKo(true);
      const t = setTimeout(() => setFlashKo(false), 500);
      timers.current.push(t);
      terminar(ronda); // ronda = eslabones completados
      return;
    }
    if (paso + 1 >= secuencia.length) {
      // eslabón completo: ronda siguiente tras una pausa
      const nueva = [...secuencia, Math.floor(Math.random() * 4)];
      setFase("escucha");
      const t = setTimeout(() => {
        setRonda(secuencia.length);
        setSecuencia(nueva);
        mostrarSecuencia(nueva);
      }, 620);
      timers.current.push(t);
      sfx.click();
    } else {
      setPaso(paso + 1);
    }
  };

  return (
    <div className="space-y-2">
      {/* HUD */}
      <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
        <span className="px-2 py-1 border border-neon-hud/60 bg-neon-hud/10 text-neon flex items-center gap-1">
          <AudioLines className="w-3 h-3" /> ESLABONES: <b>{ronda}</b>
        </span>
        <span className={cn(
          "px-2 py-1 border flex items-center gap-1 uppercase",
          fase === "escucha" ? "border-amber-hud bg-amber-hud/15 text-amber"
            : fase === "repite" ? "border-green-hud bg-green-hud/15 text-green-hud"
            : "border-border/60 text-muted-foreground"
        )}>
          {fase === "escucha" ? <><Ear className="w-3 h-3" /> ESCUCHA LA TRANSMISIÓN</>
            : fase === "repite" ? <><Hand className="w-3 h-3" /> REPITE EL CÓDIGO ({paso}/{secuencia.length})</>
            : fase === "fin" ? "CIFRADO PERDIDO"
            : "TERMINAL LISTA"}
        </span>
        <Button size="sm" variant="ghost" onClick={onExit} className="ml-auto h-7 px-2 text-[10px] font-mono text-muted-foreground">
          ABANDONAR
        </Button>
      </div>

      {/* tablero */}
      <div
        className={cn(
          "relative rounded-sm border p-4 sm:p-6 transition-colors",
          flashKo ? "border-red-hud bg-red-hud/20" : "border-neon-hud/50 bg-secondary/30"
        )}
        style={{ background: "linear-gradient(to bottom, rgba(11,8,18,0.9), rgba(22,16,28,0.85))" }}
      >
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {PADS.map((p) => (
            <button
              key={p.id}
              onPointerDown={() => tocar(p.id)}
              disabled={fase !== "repite"}
              aria-label={`Glifo ${p.label}`}
              className={cn(
                "relative aspect-[2/1] rounded-sm border-2 font-display text-2xl font-black transition-all duration-75 will-change-transform",
                p.color,
                lit === p.id ? "scale-[1.04] brightness-[1.9] shadow-[0_0_26px_rgba(255,190,90,0.55)]" : "opacity-80",
                fase === "repite" && "hover:opacity-100 active:scale-[0.97]",
                fase !== "repite" && fase !== "fin" && "cursor-default"
              )}
            >
              {p.glyph}
              <span className="absolute bottom-1 right-1.5 font-mono text-[8px] tracking-[0.2em] opacity-70">{p.label}</span>
            </button>
          ))}
        </div>

        {/* estado central */}
        {(fase === "listo" || fase === "fin") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-sm bg-black/72">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon">
              {fase === "fin" ? `SECUENCIA ROTA · ${ronda} ESLABONES` : "CIFRADO SIMON"}
            </p>
            <p className="font-mono text-[9px] text-muted-foreground max-w-xs text-center leading-relaxed">
              {fase === "fin"
                ? "La terminal firmó el eco. Cada eslabón paga 15 mon."
                : "Escucha el código y repítelo — crece un glifo por ronda."}
            </p>
            <Button size="sm" onClick={empezar} className="h-8 px-4 font-mono text-[10px] uppercase bg-neon-hud/30 border border-neon-hud text-neon hover:bg-neon-hud/50">
              {fase === "fin" ? "OTRA TRANSMISIÓN" : "INICIAR TRANSMISIÓN"}
            </Button>
          </div>
        )}
      </div>

      <p className="text-[9px] font-mono text-muted-foreground">
        Con volumen la voz es más fácil: cada glifo tiene su tono — DELTA grave, TANGO agudo
      </p>
    </div>
  );
}
