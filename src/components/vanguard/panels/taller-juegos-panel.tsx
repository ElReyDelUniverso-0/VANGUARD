"use client";

// Vanguard v102.0 LA CIUDADELA — TALLER DE JUEGOS.
// El comandante pidió: "que se pueda publicar juegos dentro de Vanguard o
// que se puedan crear dentro de Vanguard". Este panel une las dos mitades:
//  · CREAR — eliges motor (QUIZ / ORDENA LA HISTORIA / VERDAD O MENTIRA),
//    rellenas el formulario, previsualizas en vivo y publicas.
//    PUBLICAR EXIGE PASAPORTE (cuenta de la Ciudadela) — petición explícita.
//  · JUGAR — galería del arcade comunitario: juegos del Taller con runtime
//    nativo animado + juegos HTML legacy en sandbox.

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/game-store";
import { useProfileStore } from "@/lib/profile-store";
import { toast } from "sonner";
import {
  Hammer, Play, Plus, Trash2, Eye, Rocket, Gamepad2, Heart, Users,
  ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Wrench, ListOrdered, HelpCircle, Scale,
} from "lucide-react";
import { MOTORES, validarJuego, type MotorJuego, type JuegoDef, type PreguntaQuiz } from "@/lib/juegos";
import { GameRuntime } from "@/components/vanguard/game-runtime";
import { Countryball } from "@/components/vanguard/countryball";

type Modo = "jugar" | "crear";
interface JuegoItem {
  id: string;
  title: string;
  summary: string;
  author: string;
  authorBall: string;
  specs: string;
  gameHtml: string;
  gameUrl: string;
  plays: number;
  likes: number;
  ratingSum: number;
  ratingCount: number;
  createdAt: string;
}

const INICIO_QUIZ: PreguntaQuiz = { q: "", o: ["", "", "", ""], a: 0 };

export function TallerJuegosPanel() {
  const account = useGameStore((s) => s.account);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const cbAvatar = useProfileStore((s) => s.cbAvatar);

  const [modo, setModo] = useState<Modo>("jugar");
  const [items, setItems] = useState<JuegoItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ordenar, setOrdenar] = useState<"recent" | "plays" | "top">("recent");
  const [jugando, setJugando] = useState<JuegoItem | null>(null);

  // ---- creador ----
  const [motor, setMotor] = useState<MotorJuego | null>(null);
  const [preguntas, setPreguntas] = useState<PreguntaQuiz[]>([{ ...INICIO_QUIZ }]);
  const [pasos, setPasos] = useState<string[]>(["", "", "", ""]);
  const [afirmaciones, setAfirmaciones] = useState<{ t: string; v: boolean }[]>([
    { t: "", v: true }, { t: "", v: false }, { t: "", v: true }, { t: "", v: true }, { t: "", v: false },
  ]);
  const [titulo, setTitulo] = useState("");
  const [resumen, setResumen] = useState("");
  const [preview, setPreview] = useState(false);
  const [publicando, setPublicando] = useState(false);

  const cargar = useCallback(async (sort: string) => {
    setCargando(true);
    try {
      const res = await fetch(`/api/juegos?sort=${sort}&limit=48`, { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setItems([]);
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    let vivo = true;
    (async () => {
      await cargar(ordenar);
      if (!vivo) return;
    })();
    return () => { vivo = false; };
  }, [ordenar, cargar]);

  // v104.0 LA VITRINA — REMEZCLAR un juego de la comunidad: el Muro entrega el
  // def aquí y el Taller abre EN MODO CREAR con todo precargado. El remix es
  // una obra nueva del operador: título firmado como REMIX y sin límites.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("vg-taller-remix");
      if (!raw) return;
      sessionStorage.removeItem("vg-taller-remix");
      const r = JSON.parse(raw) as { def: JuegoDef; titulo?: string; resumen?: string; autor?: string };
      if (!r?.def?.engine) return;
      const motorR = r.def.engine as MotorJuego;
      const datos = (r.def.data || {}) as {
        quiz?: { preguntas?: PreguntaQuiz[] };
        ordena?: { pasos?: { t: string }[] };
        vof?: { afirmaciones?: { t: string; v: boolean }[] };
      };
      if (motorR === "quiz" && Array.isArray(datos.quiz?.preguntas)) {
        setPreguntas(datos.quiz!.preguntas!.map((p) => ({ q: p.q || "", o: (p.o || ["", "", "", ""]).slice(0, 4), a: Math.max(0, Math.min(3, Number(p.a) || 0)) })));
      }
      if (motorR === "ordena" && Array.isArray(datos.ordena?.pasos)) {
        setPasos(datos.ordena!.pasos!.slice(0, 8).map((p) => String(p.t || "")));
      }
      if (motorR === "vof" && Array.isArray(datos.vof?.afirmaciones)) {
        setAfirmaciones(datos.vof!.afirmaciones!.slice(0, 10).map((a) => ({ t: String(a.t || ""), v: a.v === true })));
      }
      setMotor(motorR);
      setTitulo(r.titulo ? `REMIX de "${r.titulo}"` : "");
      setResumen(r.resumen ? `${r.resumen} (REMIX del original de @${r.autor || "creador"})` : "");
      setModo("crear");
      toast(`REMIX del juego de @${r.autor || "creador"} — el Taller está listo: ajusta y publica tu versión`, { duration: 4200, icon: "🔧" });
    } catch { /* remix corrupto: se ignora en silencio */ }
  }, []);

  const pedirPasaporte = (motivo: string) => {
    window.dispatchEvent(new CustomEvent("vanguard:pasaporte", { detail: { motivo } }));
  };

  // ---- validar el juego del creador ----
  const construirDef = (): JuegoDef | null => {
    if (motor === "quiz") {
      const limpias = preguntas
        .map((p) => ({ q: p.q.trim(), o: p.o.map((o) => o.trim()), a: p.a }))
        .filter((p) => p.q && p.o.filter(Boolean).length >= 2);
      return { engine: "quiz", data: { quiz: { preguntas: limpias } } };
    }
    if (motor === "ordena") return { engine: "ordena", data: { ordena: { pasos: pasos.map((t) => ({ t: t.trim() })).filter((p) => p.t) } } };
    if (motor === "vof") return { engine: "vof", data: { vof: { afirmaciones: afirmaciones.map((a) => ({ t: a.t.trim(), v: a.v })).filter((a) => a.t) } } };
    return null;
  };

  const publicar = async () => {
    if (!account) {
      pedirPasaporte("Los juegos de la Ciudadela solo los publica una cuenta firmada — crea tu pasaporte gratis y publica el tuyo.");
      return;
    }
    if (!motor) return;
    if (titulo.trim().length < 3) { toast.error("Ponle un título de al menos 3 letras"); return; }
    if (resumen.trim().length < 10) { toast.error("Cuenta en el resumen de qué va tu juego (10+ letras)"); return; }
    const def = construirDef();
    if (!def) { toast.error("Elige un motor primero"); return; }
    const check = validarJuego(def);
    if (!check.ok) { toast.error(check.error); return; }

    setPublicando(true);
    try {
      const res = await fetch("/api/ugc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "juego",
          author: account.username,
          authorBall: cbAvatar,
          title: titulo.trim().slice(0, 120),
          summary: resumen.trim().slice(0, 300),
          specs: check.json,
        }),
      });
      const data = await res.json();
      if (res.status === 401 || data.necesitaPasaporte) {
        pedirPasaporte("Tu sesión expiró — entra de nuevo con tu pasaporte para publicar.");
        return;
      }
      if (!res.ok || data.eliminated) {
        toast.error(data.reason ?? data.error ?? "El agente moderador rechazó el envío");
        return;
      }
      toast.success(`🎮 ¡${data.item.title} publicado en el arcade!`, { description: `+${data.reward ?? 50} monedas · el agente IA lo aprobó (${data.verdict})` });
      addCoins(data.reward ?? 50, "juego-publicado");
      addXp(25);
      // limpiar el taller
      setTitulo(""); setResumen(""); setMotor(null); setPreview(false);
      setPreguntas([{ ...INICIO_QUIZ }]); setPasos(["", "", "", ""]);
      setAfirmaciones([{ t: "", v: true }, { t: "", v: false }, { t: "", v: true }, { t: "", v: true }, { t: "", v: false }]);
      setModo("jugar");
      cargar(ordenar);
    } catch {
      toast.error("La Ciudadela no pudo procesar el envío — inténtalo de nuevo");
    } finally {
      setPublicando(false);
    }
  };

  const defDe = (it: JuegoItem): JuegoDef | null => {
    try {
      const def = JSON.parse(it.specs) as JuegoDef;
      if (def?.engine && def?.data) return def;
      return null;
    } catch { return null; }
  };

  const juegosTaller = items.filter((it) => defDe(it) !== null);
  const juegosLegacy = items.filter((it) => defDe(it) === null && (it.gameHtml || it.gameUrl));

  return (
    <div className="space-y-4 v101-panel">
      {/* ===== CABECERA ===== */}
      <div className="hud-panel border-amber-hud/50 p-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-hud/10 blur-2xl pointer-events-none" aria-hidden />
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-sm border border-amber-hud bg-amber-hud/15 flex items-center justify-center shrink-0 v102-latido">
            <Hammer className="w-5 h-5 text-amber" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold uppercase tracking-[0.2em] text-amber leading-tight">
              TALLER DE JUEGOS
            </h2>
            <p className="text-[11px] font-mono text-muted-foreground leading-relaxed mt-0.5">
              Crea juegos SIN código con tres motores, publícalos en el arcade de la Ciudadela y juega a los de la comunidad.
            </p>
          </div>
        </div>

        {/* estado del pasaporte */}
        <div className={cn(
          "mt-3 flex items-center gap-2 px-3 py-2 rounded-sm border text-[10px] font-mono uppercase tracking-widest",
          account ? "border-green-hud/50 bg-green-hud/10 text-green-hud" : "border-amber-hud/50 bg-amber-hud/10 text-amber"
        )}>
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          {account
            ? <>Pasaporte activo: <b className="ml-1">{account.username}</b> — puedes publicar juegos</>
            : <>Sin pasaporte: puedes JUGAR todo lo que quieras · publicar exige cuenta (gratis)</>}
        </div>
      </div>

      {/* ===== SELECTOR DE MODO ===== */}
      <div className="grid grid-cols-2 gap-2">
        {([["jugar", "ARCADE", <Play key="p" className="w-4 h-4" />], ["crear", "CREAR JUEGO", <Wrench key="c" className="w-4 h-4" />]] as const).map(([m, label, icon]) => (
          <button
            key={m}
            onClick={() => setModo(m as Modo)}
            className={cn(
              "relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border font-mono text-[11px] font-bold uppercase tracking-widest transition-colors",
              modo === m
                ? "border-amber-hud text-amber bg-amber-hud/20"
                : "border-border/60 text-muted-foreground hover:text-foreground hover:border-amber-hud/40"
            )}
          >
            {modo === m && (
              <motion.div layoutId="taller-modo" className="absolute inset-0 rounded-sm bg-amber-hud/10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }} />
            )}
            <span className="relative z-10 inline-flex items-center gap-2">{icon}{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ================= MODO JUGAR ================= */}
        {modo === "jugar" && (
          <motion.div key="jugar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-3">
            {jugando && (() => {
              const def = defDe(jugando);
              return (
                <div className="space-y-2">
                  <button onClick={() => setJugando(null)} className="font-mono text-[10px] uppercase tracking-widest text-electric hover:text-foreground transition-colors inline-flex items-center gap-1">
                    <ChevronLeft className="w-3.5 h-3.5" /> Volver al arcade
                  </button>
                  <p className="font-display uppercase tracking-[0.2em] text-sm text-foreground">{jugando.title}</p>
                  {def ? (
                    <GameRuntime def={def} idJuego={jugando.id} />
                  ) : (
                    <div className="hud-panel border-amber-hud/50 p-3">
                      <p className="text-[10px] font-mono text-muted-foreground mb-2">Juego del estudio clásico (sandbox):</p>
                      {jugando.gameUrl ? (
                        <a href={jugando.gameUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-electric underline break-all">
                          {jugando.gameUrl}
                        </a>
                      ) : (
                        <iframe
                          title={jugando.title}
                          srcDoc={jugando.gameHtml}
                          sandbox="allow-scripts"
                          className="w-full h-[420px] rounded-sm border border-border/60 bg-black"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {!jugando && (
              <>
                <div className="flex items-center gap-2 overflow-x-auto thin-scroll pb-1">
                  {([["recent", "NUEVOS"], ["plays", "MÁS JUGADOS"], ["top", "TOP LIKES"]] as const).map(([s, label]) => (
                    <button key={s} onClick={() => setOrdenar(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors",
                        ordenar === s ? "border-amber-hud text-amber bg-amber-hud/15" : "border-border/60 text-muted-foreground hover:text-foreground"
                      )}>
                      {label}
                    </button>
                  ))}
                  <span className="ml-auto font-mono text-[9px] text-muted-foreground/70 whitespace-nowrap">{items.length} juegos</span>
                </div>

                {cargando && (
                  <div className="hud-panel border-border/50 p-6 text-center font-mono text-[11px] text-muted-foreground">
                    Cargando el arcade de la Ciudadela…
                  </div>
                )}

                {!cargando && juegosTaller.length === 0 && juegosLegacy.length === 0 && (
                  <div className="hud-panel border-border/50 p-8 text-center">
                    <Gamepad2 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="font-mono text-[12px] text-muted-foreground mb-3">El arcade está vacío — sé el PRIMERO en publicar un juego.</p>
                    <button onClick={() => setModo("crear")} className="v102-cta font-mono uppercase tracking-widest text-[11px] px-5 py-2.5 rounded-sm border border-amber-hud text-amber bg-amber-hud/20 hover:bg-amber-hud/40 transition-colors">
                      <Hammer className="inline w-3.5 h-3.5 mr-1.5" /> Abrir el taller
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {juegosTaller.map((it, i) => {
                    const def = defDe(it)!;
                    const motorMeta = MOTORES.find((m) => m.id === def.engine);
                    return (
                      <motion.div key={it.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(0.05 * i, 0.4) }}
                        className="hud-panel border-border/60 p-3.5 hover:border-amber-hud/60 transition-colors v102-tarjeta">
                        <div className="flex items-start gap-2.5 mb-2">
                          <div className="w-9 h-9 rounded-sm border border-amber-hud/40 bg-amber-hud/10 flex items-center justify-center shrink-0">
                            {def.engine === "quiz" ? <HelpCircle className="w-4 h-4 text-amber" />
                              : def.engine === "ordena" ? <ListOrdered className="w-4 h-4 text-cyan-hud" />
                              : <Scale className="w-4 h-4 text-violet-hud" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-bold text-foreground truncate">{it.title}</p>
                            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground truncate">
                              {motorMeta?.nombre ?? def.engine} · {it.author}
                            </p>
                          </div>
                          <Countryball code={it.authorBall || "us"} size={22} />
                        </div>
                        {it.summary && <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mb-2">{it.summary}</p>}
                        <div className="flex items-center gap-3 font-mono text-[9px] text-muted-foreground/80 mb-2.5">
                          <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {it.plays} jugadas</span>
                          <span className="inline-flex items-center gap-1"><Heart className="w-3 h-3" /> {it.likes}</span>
                          {it.ratingCount > 0 && <span>★ {(it.ratingSum / it.ratingCount).toFixed(1)}</span>}
                        </div>
                        <button onClick={() => setJugando(it)}
                          className="w-full font-mono uppercase tracking-widest text-[10px] py-2 rounded-sm border border-amber-hud/70 text-amber bg-amber-hud/15 hover:bg-amber-hud/35 transition-colors">
                          ▶ Jugar
                        </button>
                      </motion.div>
                    );
                  })}
                  {juegosLegacy.map((it) => (
                    <div key={it.id} className="hud-panel border-border/60 p-3.5">
                      <p className="text-[13px] font-bold text-foreground truncate">{it.title}</p>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-2">ESTUDIO CLÁSICO · {it.author}</p>
                      <button onClick={() => setJugando(it)}
                        className="w-full font-mono uppercase tracking-widest text-[10px] py-2 rounded-sm border border-border/60 text-muted-foreground hover:text-amber hover:border-amber-hud/60 transition-colors">
                        ▶ Jugar
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ================= MODO CREAR ================= */}
        {modo === "crear" && (
          <motion.div key="crear" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-3">
            {/* paso 1: motor */}
            {!motor && (
              <>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">PASO 1 · elige el motor de tu juego</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {MOTORES.map((m, i) => (
                    <motion.button key={m.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => setMotor(m.id)}
                      className="hud-panel border-border/60 p-4 text-left hover:border-amber-hud/70 hover:bg-amber-hud/5 transition-colors v102-tarjeta">
                      <div className="mb-2">
                        {m.id === "quiz" ? <HelpCircle className="w-6 h-6 text-amber" />
                          : m.id === "ordena" ? <ListOrdered className="w-6 h-6 text-cyan-hud" />
                          : <Scale className="w-6 h-6 text-violet-hud" />}
                      </div>
                      <p className="font-display text-[12px] font-bold uppercase tracking-widest text-foreground mb-1">{m.nombre}</p>
                      <p className="text-[11px] text-muted-foreground leading-snug">{m.desc}</p>
                      <p className="font-mono text-[9px] text-muted-foreground/70 mt-2 uppercase tracking-widest">{m.min}–{m.max} elementos</p>
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {/* paso 2: contenido */}
            {motor && !preview && (
              <>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    PASO 2 · rellena tu {MOTORES.find((m) => m.id === motor)?.nombre}
                  </p>
                  <button onClick={() => { setMotor(null); setPreview(false); }} className="font-mono text-[10px] text-electric hover:text-foreground uppercase tracking-widest">
                    cambiar motor
                  </button>
                </div>

                {/* QUIZ editor */}
                {motor === "quiz" && (
                  <div className="space-y-2.5">
                    {preguntas.map((p, pi) => (
                      <div key={pi} className="hud-panel border-border/60 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-amber">Pregunta {pi + 1}</span>
                          {preguntas.length > 1 && (
                            <button onClick={() => setPreguntas((arr) => arr.filter((_, k) => k !== pi))}
                              aria-label="Quitar pregunta" className="text-red-hud/70 hover:text-red-hud transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <input value={p.q} onChange={(e) => setPreguntas((arr) => arr.map((x, k) => k === pi ? { ...x, q: e.target.value } : x))}
                          placeholder="Escribe la pregunta…" maxLength={160}
                          className="w-full bg-secondary/60 border border-border rounded-sm px-2.5 py-2 text-[12px] font-mono outline-none focus:border-amber-hud/70 transition-colors" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {p.o.map((o, oi) => (
                            <label key={oi} className={cn(
                              "flex items-center gap-1.5 px-2 py-1.5 rounded-sm border transition-colors cursor-pointer",
                              p.a === oi ? "border-green-hud/70 bg-green-hud/10" : "border-border/70 hover:border-amber-hud/50"
                            )}>
                              <input type="radio" name={`correcta-${pi}`} checked={p.a === oi}
                                onChange={() => setPreguntas((arr) => arr.map((x, k) => k === pi ? { ...x, a: oi } : x))}
                                className="accent-[#4ADE80]" aria-label={`Opción ${oi + 1} correcta`} />
                              <input value={o} onChange={(e) => setPreguntas((arr) => arr.map((x, k) => k === pi ? { ...x, o: x.o.map((oo, k2) => k2 === oi ? e.target.value : oo) } : x))}
                                placeholder={`Opción ${oi + 1}`} maxLength={90}
                                className="flex-1 bg-transparent text-[11px] font-mono outline-none min-w-0" />
                            </label>
                          ))}
                        </div>
                        <p className="font-mono text-[9px] text-muted-foreground/70">toca el círculo verde para marcar la respuesta CORRECTA</p>
                      </div>
                    ))}
                    {preguntas.length < 12 && (
                      <button onClick={() => setPreguntas((arr) => [...arr, { ...INICIO_QUIZ }])}
                        className="w-full py-2.5 rounded-sm border border-dashed border-amber-hud/50 text-amber font-mono text-[10px] uppercase tracking-widest hover:bg-amber-hud/10 transition-colors">
                        <Plus className="inline w-3.5 h-3.5 mr-1" /> Añadir pregunta ({preguntas.length}/12)
                      </button>
                    )}
                  </div>
                )}

                {/* ORDENA editor */}
                {motor === "ordena" && (
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-mono text-muted-foreground">Escribe los eventos EN ORDEN cronológico (el jugador los recibirá revueltos):</p>
                    {pasos.map((t, pi) => (
                      <div key={pi} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full border border-cyan-hud/60 text-cyan-hud text-[10px] font-mono flex items-center justify-center shrink-0">{pi + 1}</span>
                        <input value={t} onChange={(e) => setPasos((arr) => arr.map((x, k) => k === pi ? e.target.value : x))}
                          placeholder={`Evento ${pi + 1} (cronológico)…`} maxLength={160}
                          className="flex-1 bg-secondary/60 border border-border rounded-sm px-2.5 py-2 text-[12px] font-mono outline-none focus:border-cyan-hud/70 transition-colors" />
                        {pasos.length > 4 && (
                          <button onClick={() => setPasos((arr) => arr.filter((_, k) => k !== pi))}
                            aria-label="Quitar evento" className="text-red-hud/70 hover:text-red-hud transition-colors shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {pasos.length < 8 && (
                      <button onClick={() => setPasos((arr) => [...arr, ""])}
                        className="w-full py-2.5 rounded-sm border border-dashed border-cyan-hud/50 text-cyan-hud font-mono text-[10px] uppercase tracking-widest hover:bg-cyan-hud/10 transition-colors">
                        <Plus className="inline w-3.5 h-3.5 mr-1" /> Añadir evento ({pasos.length}/8)
                      </button>
                    )}
                  </div>
                )}

                {/* VOF editor */}
                {motor === "vof" && (
                  <div className="space-y-2.5">
                    {afirmaciones.map((a, pi) => (
                      <div key={pi} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full border border-violet-hud/60 text-violet-hud text-[10px] font-mono flex items-center justify-center shrink-0">{pi + 1}</span>
                        <input value={a.t} onChange={(e) => setAfirmaciones((arr) => arr.map((x, k) => k === pi ? { ...x, t: e.target.value } : x))}
                          placeholder="Escribe la afirmación…" maxLength={160}
                          className="flex-1 bg-secondary/60 border border-border rounded-sm px-2.5 py-2 text-[12px] font-mono outline-none focus:border-violet-hud/70 transition-colors" />
                        <button onClick={() => setAfirmaciones((arr) => arr.map((x, k) => k === pi ? { ...x, v: !x.v } : x))}
                          className={cn(
                            "shrink-0 px-2.5 py-1.5 rounded-sm border font-mono text-[9px] uppercase tracking-widest transition-colors",
                            a.v ? "border-green-hud/70 text-green-hud bg-green-hud/10" : "border-red-hud/70 text-red-hud bg-red-hud/10"
                          )}>
                          {a.v ? "VERDAD" : "MENTIRA"}
                        </button>
                      </div>
                    ))}
                    <p className="font-mono text-[9px] text-muted-foreground/70">toca el sello VERDAD/MENTIRA para cambiar la respuesta de cada afirmación</p>
                  </div>
                )}

                {/* ficha del juego */}
                <div className="hud-panel border-amber-hud/40 p-3 space-y-2">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-amber">FICHA DEL JUEGO</p>
                  <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título del juego…" maxLength={120}
                    className="w-full bg-secondary/60 border border-border rounded-sm px-2.5 py-2 text-[12px] font-mono outline-none focus:border-amber-hud/70 transition-colors" />
                  <textarea value={resumen} onChange={(e) => setResumen(e.target.value)} placeholder="Resumen: de qué va tu juego (aparece en la tarjeta del arcade)…" maxLength={300} rows={2}
                    className="w-full bg-secondary/60 border border-border rounded-sm px-2.5 py-2 text-[12px] font-mono outline-none focus:border-amber-hud/70 transition-colors resize-none" />
                </div>

                <button onClick={() => {
                  const check = validarJuego(construirDef());
                  if (!check.ok) { toast.error(check.error); return; }
                  setPreview(true);
                }} className="v102-cta w-full font-mono uppercase tracking-widest text-[11px] py-3 rounded-sm border border-amber-hud text-amber bg-amber-hud/20 hover:bg-amber-hud/40 transition-colors">
                  <Eye className="inline w-4 h-4 mr-1.5" /> Previsualizar mi juego
                </button>
              </>
            )}

            {/* paso 3: preview + publicar */}
            {motor && preview && (
              <>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">PASO 3 · pruébalo como lo vivirá la comunidad</p>
                  <button onClick={() => setPreview(false)} className="font-mono text-[10px] text-electric hover:text-foreground uppercase tracking-widest">
                    volver a editar
                  </button>
                </div>
                <GameRuntime def={construirDef()!} idJuego={`preview:${titulo || "sin-titulo"}`} compacto />
                <div className="hud-panel border-amber-hud p-3.5">
                  <div className="flex items-start gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                    <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
                      {account
                        ? <>Se publicará firmado por <b className="text-foreground">{account.username}</b> · el agente moderador IA lo revisará · recompensa: <b className="text-amber">+50 monedas +25 XP</b></>
                        : "Publicar exige PASAPORTE (cuenta gratis de la Ciudadela) — te pediremos crear una al publicar."}
                    </p>
                  </div>
                  <button onClick={publicar} disabled={publicando}
                    className="w-full font-mono uppercase tracking-widest text-[12px] font-bold py-3 rounded-sm border border-amber-hud text-black bg-amber hover:bg-amber-hud transition-colors disabled:opacity-60">
                    <Rocket className="inline w-4 h-4 mr-1.5" /> {publicando ? "Publicando…" : "Publicar en el arcade"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
