"use client";

// Vanguard v102.0 LA CIUDADELA — RUNTIME DE JUEGOS DE LA COMUNIDAD.
// Interpreta los juegos del Taller (quiz / ordena / vof) con animación en
// cada acción: las preguntas entran con cine, el feedback brilla verde o
// tiembla en rojo y la medalla final cae con revelación. Todo transform/
// opacity — 60 FPS. Al terminar registra la partida en /api/juegos.

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/game-store";
import { toast } from "sonner";
import {
  barajarDeterminista, MEDALLAS,
  type JuegoDef, type MotorJuego,
} from "@/lib/juegos";
import { Check, X, ArrowUp, ArrowDown, Crown, Sparkles, ListOrdered, HelpCircle, Scale } from "lucide-react";

interface Props {
  def: JuegoDef;
  idJuego: string;
  onFin?: (aciertos: number, total: number) => void;
  compacto?: boolean;
}

const MOTOR_META: Record<MotorJuego, { label: string; icon: React.ReactNode; color: string }> = {
  quiz: { label: "QUIZ DEL MUNDO", icon: <HelpCircle className="w-3.5 h-3.5" />, color: "#FFC94D" },
  ordena: { label: "ORDENA LA HISTORIA", icon: <ListOrdered className="w-3.5 h-3.5" />, color: "#7FE3FF" },
  vof: { label: "VERDAD O MENTIRA", icon: <Scale className="w-3.5 h-3.5" />, color: "#B48CFF" },
};

// quiz: baraja las opciones de cada pregunta (determinista) y devuelve la
// lista con la posición NUEVA de la correcta
function opcionesBarajadas(q: { q: string; o: string[]; a: number }, seed: string) {
  const conMarca = q.o.map((texto, i) => ({ texto, correcta: i === q.a }));
  const mezcla = barajarDeterminista(conMarca, seed);
  return { q: q.q, opciones: mezcla };
}

export function GameRuntime({ def, idJuego, onFin, compacto }: Props) {
  const account = useGameStore((s) => s.account);
  const addXp = useGameStore((s) => s.addXp);
  const [fase, setFase] = useState<"intro" | "jugando" | "fin">("intro");
  const [paso, setPaso] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null); // índice elegido (quiz/vof)
  const [bloqueado, setBloqueado] = useState(false); // entre preguntas
  // ordena: orden actual del jugador (índices sobre el array original barajado)
  const [orden, setOrden] = useState<number[]>([]);
  const [checkOrdena, setCheckOrdena] = useState<null | boolean[]>(null);

  const meta = MOTOR_META[def.engine];

  // datos preparados según motor (shape común: los campos no usados quedan undefined)
  const juego: {
    total: number;
    preguntas?: { q: string; opciones: { texto: string; correcta: boolean }[] }[];
    pasos?: { t: string; i: number }[];
    afirmaciones?: { t: string; v: boolean }[];
  } = useMemo(() => {
    if (def.engine === "quiz") {
      const preguntas = def.data.quiz?.preguntas ?? [];
      return {
        total: preguntas.length,
        preguntas: preguntas.map((p, i) => opcionesBarajadas(p, `${idJuego}:${i}`)),
      };
    }
    if (def.engine === "ordena") {
      const pasos = def.data.ordena?.pasos ?? [];
      const revuelta = barajarDeterminista(pasos.map((p, i) => ({ ...p, i })), `${idJuego}:ordena`);
      // si el barajado dejó el orden original intacto, invierte — nunca nace resuelto
      const yaOrden = revuelta.every((p, idx) => p.i === idx);
      const final = yaOrden ? [...revuelta].reverse() : revuelta;
      return { total: pasos.length, pasos: final };
    }
    const af = def.data.vof?.afirmaciones ?? [];
    return { total: af.length, afirmaciones: af };
  }, [def, idJuego]);

  const total = juego.total;

  const empezar = () => {
    setFase("jugando");
    setPaso(0);
    setAciertos(0);
    setElegida(null);
    setBloqueado(false);
    setCheckOrdena(null);
    if (def.engine === "ordena") setOrden((juego.pasos ?? []).map((_: { i: number }, i: number) => i));
  };

  const registrarPartida = async (ac: number, tt: number) => {
    try {
      const res = await fetch("/api/juegos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idJuego, aciertos: ac, total: tt, jugador: account?.username ?? "ANÓNIMO" }),
      });
      const data = await res.json();
      if (data.ok) toast(`🎮 Partida registrada · ${data.plays} jugadas`, { description: "El autor gana fama con cada partida" });
    } catch { /* sin red: la partida se queda local */ }
    // recompensa local: +3 XP la primera vez al día por juego (honesto, sin castigos)
    const clave = `vg-juego-xp-${idJuego}-${new Date().toISOString().slice(0, 10)}`;
    try {
      if (!localStorage.getItem(clave)) {
        localStorage.setItem(clave, "1");
        addXp(3);
        toast.success("+3 XP por jugar hoy", { description: "Vuelve mañana: el XP diario nunca se quita lo ganado" });
      }
    } catch { /* sin storage */ }
    onFin?.(ac, tt);
  };

  // ---- quiz / vof ----
  const responder = (idx: number, correcta?: boolean) => {
    if (bloqueado) return;
    setElegida(idx);
    setBloqueado(true);
    const ok = correcta === true;
    if (ok) setAciertos((a) => a + 1);
    setTimeout(() => {
      const siguiente = paso + 1;
      if (siguiente >= total) {
        const acFinal = aciertos + (ok ? 1 : 0);
        setFase("fin");
        registrarPartida(acFinal, total);
      } else {
        setPaso(siguiente);
        setElegida(null);
        setBloqueado(false);
      }
    }, 900);
  };

  // ---- ordena ----
  const mover = (pos: number, dir: -1 | 1) => {
    setCheckOrdena(null);
    setOrden((o) => {
      const nuevo = [...o];
      const objetivo = pos + dir;
      if (objetivo < 0 || objetivo >= nuevo.length) return o;
      [nuevo[pos], nuevo[objetivo]] = [nuevo[objetivo], nuevo[pos]];
      return nuevo;
    });
  };

  const comprobarOrdena = () => {
    if (def.engine !== "ordena") return;
    const pasos = juego.pasos as { t: string; i: number }[];
    const resultados = orden.map((idxOriginal, posActual) => pasos[idxOriginal].i === posActual);
    setCheckOrdena(resultados);
    const ac = resultados.filter(Boolean).length;
    setAciertos(ac);
    setTimeout(() => {
      setFase("fin");
      registrarPartida(ac, total);
    }, 1400);
  };

  // ---- intro ----
  if (fase === "intro") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className={cn("hud-panel border-amber-hud/60 p-5 text-center", compacto ? "p-4" : "")}
      >
        <div className="mx-auto w-12 h-12 rounded-full border-2 flex items-center justify-center mb-3"
          style={{ borderColor: meta.color, color: meta.color, boxShadow: `0 0 18px -4px ${meta.color}` }}>
          {meta.icon}
        </div>
        <h4 className="font-display uppercase tracking-[0.25em] text-sm mb-1" style={{ color: meta.color }}>
          {meta.label}
        </h4>
        <p className="text-[11px] font-mono text-muted-foreground mb-4">
          {total} {def.engine === "quiz" ? "preguntas" : def.engine === "ordena" ? "eventos por ordenar" : "afirmaciones"} · +3 XP por jugar
        </p>
        <button
          onClick={empezar}
          className="v102-cta font-mono uppercase tracking-widest text-[11px] px-5 py-2.5 rounded-sm border border-amber-hud text-amber bg-amber-hud/20 hover:bg-amber-hud/40 transition-colors"
        >
          ▶ Jugar ahora
        </button>
      </motion.div>
    );
  }

  // ---- fin ----
  if (fase === "fin") {
    const pct = total > 0 ? aciertos / total : 0;
    const medalla = MEDALLAS.find((m) => pct >= m.min) ?? MEDALLAS[MEDALLAS.length - 1];
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="hud-panel border-amber-hud/60 p-6 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none v102-corona" aria-hidden />
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.15 }}
          className="text-5xl mb-2"
        >
          {medalla.icon}
        </motion.div>
        <h4 className="font-display uppercase tracking-[0.25em] text-sm text-amber mb-1">{medalla.nombre}</h4>
        <p className="font-mono text-2xl font-bold text-foreground mb-1">{aciertos} / {total}</p>
        <p className="text-[11px] font-mono text-muted-foreground mb-4">
          {pct >= 0.8 ? "Nivel de analista de élite — la comunidad lo nota" : pct >= 0.6 ? "Buena puntería — vuelve a intentarlo" : "El mundo es difícil — cada partida entrena"}
        </p>
        <button
          onClick={empezar}
          className="font-mono uppercase tracking-widest text-[10px] px-4 py-2 rounded-sm border border-amber-hud/60 text-amber hover:bg-amber-hud/20 transition-colors"
        >
          ↺ Jugar otra vez
        </button>
      </motion.div>
    );
  }

  // ---- jugando ----
  const progreso = Math.round(((paso + (bloqueado ? 1 : 0)) / total) * 100);

  return (
    <div className="hud-panel border-amber-hud/60 overflow-hidden">
      {/* barra de progreso */}
      <div className="h-1.5 bg-secondary/60">
        <motion.div
          className="h-full bg-gradient-to-r from-amber to-amber-hud"
          animate={{ width: `${progreso}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: meta.color }}>
            {meta.label}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {paso + 1} / {total} · ⭐ {aciertos}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {/* QUIZ */}
          {def.engine === "quiz" && (() => {
            const preg = (juego.preguntas as { q: string; opciones: { texto: string; correcta: boolean }[] }[])[paso];
            if (!preg) return null;
            return (
              <motion.div key={`q${paso}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
                <p className="text-sm font-bold text-foreground mb-3 leading-snug">{preg.q}</p>
                <div className="space-y-2">
                  {preg.opciones.map((op, i) => {
                    const esElegida = elegida === i;
                    const revelar = bloqueado && (esElegida || op.correcta);
                    return (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.06 * i }}
                        onClick={() => responder(i, op.correcta)}
                        disabled={bloqueado}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-sm border text-[12px] font-mono transition-colors",
                          revelar && op.correcta && "border-green-hud text-green-hud bg-green-hud/15 v102-flash-ok",
                          reveladaElegidaMal(esElegida, op.correcta, bloqueado) && "border-red-hud text-red-hud bg-red-hud/15 v102-flash-ko",
                          !revelar && "border-border/70 text-foreground hover:border-amber-hud/60 hover:bg-amber-hud/10",
                          bloqueado && !revelar && "opacity-40"
                        )}
                      >
                        <span className="inline-flex items-center gap-2">
                          {revelar && op.correcta && <Check className="w-3.5 h-3.5" />}
                          {reveladaElegidaMal(esElegida, op.correcta, bloqueado) && <X className="w-3.5 h-3.5" />}
                          {op.texto}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })()}

          {/* VOF */}
          {def.engine === "vof" && (() => {
            const af = (juego.afirmaciones as { t: string; v: boolean }[])[paso];
            if (!af) return null;
            const revelar = bloqueado;
            return (
              <motion.div key={`v${paso}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
                <p className="text-sm font-bold text-foreground mb-3 leading-snug min-h-[3rem]">{af.t}</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{ label: "VERDAD", val: true, cls: "border-green-hud/60 text-green-hud hover:bg-green-hud/15" },
                    { label: "MENTIRA", val: false, cls: "border-red-hud/60 text-red-hud hover:bg-red-hud/15" }].map((b) => {
                    const elegidaEsEsta = elegida !== null && ((b.val === true && elegida === 1) || (b.val === false && elegida === 0));
                    const correcta = b.val === af.v;
                    const revelarEsta = revelar && (elegidaEsEsta || correcta);
                    return (
                      <button
                        key={b.label}
                        onClick={() => responder(b.val ? 1 : 0, b.val === af.v)}
                        disabled={bloqueado}
                        className={cn(
                          "px-3 py-3 rounded-sm border font-mono uppercase tracking-widest text-[11px] transition-colors",
                          revelarEsta && correcta && "border-green-hud text-green-hud bg-green-hud/15 v102-flash-ok",
                          revelarEsta && !correcta && "border-red-hud text-red-hud bg-red-hud/15 v102-flash-ko",
                          !revelarEsta && b.cls,
                          revelar && !revelarEsta && "opacity-40"
                        )}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })()}

          {/* ORDENA */}
          {def.engine === "ordena" && (() => {
            const pasos = juego.pasos as { t: string; i: number }[];
            return (
              <motion.div key="ordena" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-[11px] font-mono text-muted-foreground mb-3">
                  Pon los eventos en orden cronológico (del más antiguo al más reciente) y pulsa COMPROBAR
                </p>
                <div className="space-y-2">
                  {orden.map((idxOriginal, pos) => {
                    const res = checkOrdena?.[pos];
                    return (
                      <motion.div
                        key={idxOriginal}
                        layout
                        transition={{ type: "spring", stiffness: 400, damping: 34 }}
                        className={cn(
                          "flex items-center gap-2 px-2.5 py-2 rounded-sm border",
                          res === true && "border-green-hud text-green-hud bg-green-hud/10",
                          res === false && "border-red-hud text-red-hud bg-red-hud/10",
                          res === undefined && "border-border/70"
                        )}
                      >
                        <span className="w-6 h-6 rounded-full border border-amber-hud/60 text-amber text-[10px] font-mono flex items-center justify-center shrink-0">
                          {pos + 1}
                        </span>
                        <span className="flex-1 text-[12px] font-mono leading-snug">{pasos[idxOriginal]?.t}</span>
                        <span className="flex flex-col gap-0.5 shrink-0">
                          <button onClick={() => mover(pos, -1)} disabled={pos === 0 || checkOrdena !== null}
                            aria-label="Subir evento" className="text-muted-foreground hover:text-amber disabled:opacity-25 transition-colors">
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => mover(pos, 1)} disabled={pos === orden.length - 1 || checkOrdena !== null}
                            aria-label="Bajar evento" className="text-muted-foreground hover:text-amber disabled:opacity-25 transition-colors">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
                {checkOrdena === null && (
                  <button
                    onClick={comprobarOrdena}
                    className="v102-cta w-full mt-3 font-mono uppercase tracking-widest text-[11px] py-2.5 rounded-sm border border-amber-hud text-amber bg-amber-hud/20 hover:bg-amber-hud/40 transition-colors"
                  >
                    ✓ Comprobar orden
                  </button>
                )}
                {checkOrdena !== null && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-3 font-mono text-[11px] text-amber">
                    <Sparkles className="inline w-3.5 h-3.5 mr-1" />
                    {aciertos} de {total} en su sitio…
                  </motion.p>
                )}
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* sello de la ciudadela */}
      <div className="border-t border-border/40 px-4 py-1.5 flex items-center gap-1.5">
        <Crown className="w-3 h-3 text-amber/70" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">
          juego de la ciudadela · vanguard arcade
        </span>
      </div>
    </div>
  );
}

function reveladaElegidaMal(elegida: boolean, correcta: boolean, bloqueado: boolean): boolean {
  return bloqueado && elegida && !correcta;
}
