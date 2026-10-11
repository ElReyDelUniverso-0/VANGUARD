"use client";

// v103.0 MODO AGENTE — LA CONSOLA DEL AGENTE QUE CREA DENTRO DE VANGUARD.
// El comandante pidió: "la IA super potente y como un modo agente que cree
// dentro de Vanguard". Aquí está: una consola EN DIRECTO (patrón Gemini /
// agente de ChatGPT) donde el agente de Vanguard INVESTIGA el mundo real del
// juego (frente del Karsk, crisis del Espejo, expedientes desclasificados
// REALES), REDACTA, se AUDITA y PUBLICA su obra dentro de la plataforma:
//   · quiz / ordena / vof  → el ARCADE de la Ciudadela (/api/ugc kind juego)
//   · escenario ¿Y SI...?  → la GALERÍA DEL DESTINO (kind escenario)
//   · informe neuronal     → se lee aquí mismo, firmado y con fuentes
// Firma: con pasaporte sale a nombre del operador (+recompensa); sin
// pasaporte sale a nombre de MENTE·VANGUARD (la cuenta oficial impuesta por
// el servidor — nadie suplanta a nadie). AGENTE EN VIVO: la misión diaria se
// ejecuta sola al entrar — Vanguard se actualiza sola (mandato v99).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot, CheckCircle2, Loader2, ShieldCheck, Radio, Gamepad2, FlaskConical,
  FileText, ListOrdered, HelpCircle, Scale, Sparkles, ExternalLink, Coins,
  Copy, ChevronRight, Eye, Zap, CircleDot, UserCheck, Bot as BotIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGameStore } from "@/lib/game-store";
import { useAnalista } from "@/lib/analista";
import { navigateTo } from "@/lib/nav";
import { GameRuntime } from "@/components/vanguard/game-runtime";
import { HeroOro } from "@/components/vanguard/hero-oro";
import {
  MISIONES, misionesDelDia, ejecutarMision, semillaDe, claveDia,
  type MisionAgente, type PasoAgente, type Creacion, type CreacionJuego, type CreacionEscenario, type CreacionInforme,
} from "@/lib/agente-nucleo";
import { simular, type ResultadoLab } from "@/lib/whatif";
import { validarJuego } from "@/lib/juegos";

const LS_AGENTE = "vg-agente-v103";

interface EstadoLocal {
  vivo: boolean;
  diaUltimaViva: string;
  sesiones: number;
  obras: { mision: string; titulo: string; ts: number; firmada: boolean }[];
}

const ESTADO_INICIAL: EstadoLocal = { vivo: false, diaUltimaViva: "", sesiones: 0, obras: [] };

const ICONO_MISION: Record<MisionAgente, React.ReactNode> = {
  quiz: <HelpCircle className="w-5 h-5" />,
  ordena: <ListOrdered className="w-5 h-5" />,
  vof: <Scale className="w-5 h-5" />,
  escenario: <FlaskConical className="w-5 h-5" />,
  informe: <FileText className="w-5 h-5" />,
};

type FaseConsola = "reposo" | "corriendo" | "listo";

export function AgenteIaPanel() {
  const account = useGameStore((s) => s.account);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);

  const [mision, setMision] = useState<MisionAgente | null>(null);
  const [fase, setFase] = useState<FaseConsola>("reposo");
  const [pasoActivo, setPasoActivo] = useState(0);
  const [protocolo, setProtocolo] = useState<PasoAgente[]>([]);
  const [creacion, setCreacion] = useState<Creacion | null>(null);
  const [notaAuditoria, setNotaAuditoria] = useState("");
  const [firmar, setFirmar] = useState(true);
  const [publicando, setPublicando] = useState(false);
  const [publicado, setPublicado] = useState<null | { yaPublicado?: boolean; reward?: number }>(null);
  const [sim, setSim] = useState<ResultadoLab | null>(null);
  const [estado, setEstado] = useState<EstadoLocal>(ESTADO_INICIAL);
  const [stats, setStats] = useState<null | { creacionesAgente: number; juegosEnArcade: number; escenariosEnGaleria: number }>(null);
  const [ultimas, setUltimas] = useState<{ id: string; kind: string; title: string }[]>([]);
  const [logExtra, setLogExtra] = useState<string[]>([]);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const consolaRef = useRef<HTMLDivElement>(null);

  const agenda = useMemo(() => misionesDelDia(), []);

  const cargarStats = useCallback(async () => {
    try {
      const res = await fetch("/api/agente", { cache: "no-store" });
      const data = await res.json();
      setStats(data?.stats ?? null);
      setUltimas(Array.isArray(data?.ultimas) ? data.ultimas : []);
    } catch { /* el agente sigue aunque el estado falle */ }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_AGENTE);
      if (raw) setEstado({ ...ESTADO_INICIAL, ...(JSON.parse(raw) as EstadoLocal) });
    } catch { /* persistencia local jamás tumba la página */ }
    cargarStats();
    return () => { timers.current.forEach(clearTimeout); };
  }, [cargarStats]);

  // AGENTE EN VIVO — si está activado y es un día nuevo, la primera misión de
  // la agenda corre sola al entrar (Vanguard se actualiza sola, mandato v99).
  const autoArrancado = useRef(false);
  useEffect(() => {
    if (autoArrancado.current) return;
    if (!estado.vivo) return;
    const hoy = claveDia();
    if (estado.diaUltimaViva === hoy) return;
    autoArrancado.current = true;
    const t = setTimeout(() => {
      const primera = misionesDelDia()[0];
      correrMision(primera.mision, 0);
      guardar({ diaUltimaViva: hoy });
      toast("AGENTE EN VIVO: misión del día arrancada sola", {
        description: `el agente está creando ${MISIONES.find((m) => m.id === primera.mision)?.producto} — míralo en la consola`,
      });
    }, 2200);
    timers.current.push(t);
  }, [estado.vivo, estado.diaUltimaViva]);

  const guardar = useCallback((patch: Partial<EstadoLocal>) => {
    setEstado((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(LS_AGENTE, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  const pedirPasaporte = (motivo: string) => {
    window.dispatchEvent(new CustomEvent("vanguard:pasaporte", { detail: { motivo } }));
  };

  // ===== EJECUTAR MISIÓN — consola EN DIRECTO =====
  const correrMision = useCallback((m: MisionAgente, variante = 0) => {
    if (fase === "corriendo") return;
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const resultado = ejecutarMision(m, semillaDe(m, variante));
    setMision(m);
    setProtocolo(resultado.protocolo);
    setPasoActivo(0);
    setCreacion(null);
    setSim(null);
    setPublicado(null);
    setNotaAuditoria("");
    setLogExtra([]);
    setFase("corriendo");

    // pacing: cada paso entra con su ms; el último abre el resultado
    let acumulado = 0;
    resultado.protocolo.forEach((p, i) => {
      acumulado += p.ms;
      timers.current.push(setTimeout(() => {
        setPasoActivo(i + 1);
        if (consolaRef.current) consolaRef.current.scrollTop = consolaRef.current.scrollHeight;
      }, acumulado));
    });

    timers.current.push(setTimeout(() => {
      setCreacion(resultado.creacion);
      setNotaAuditoria(resultado.notaAuditoria);
      setFase("listo");
      guardar({ sesiones: (estado.sesiones ?? 0) + 1 });
      // los hallazgos extra del research entran como log vivo
      if (resultado.creacion.tipo === "escenario") {
        const ce = resultado.creacion as CreacionEscenario;
        try {
          const r = simular(ce.cfg);
          setSim(r);
          setLogExtra([
            `▸ motor del destino: ${r.serie.length} días simulados`,
            `▸ estado final: ${r.fin.nombre} (día ${r.fin.dia})`,
            `▸ monte carlo top: ${r.monteCarlo[0]?.nombre} ${r.monteCarlo[0]?.probabilidad}%`,
          ]);
        } catch { /* preview sin motor: la publicación lo corre en el servidor */ }
      }
      useAnalista.getState().registrar(m === "escenario" ? "escenario" : "creacion");
    }, acumulado + 900));
  }, [fase, estado.sesiones, guardar]);

  // ===== PUBLICAR — el servidor re-ejecuta la misma semilla y firma =====
  const publicar = async () => {
    if (!mision || !creacion || creacion.tipo === "informe") return;
    if (firmar && !account) {
      pedirPasaporte("Para firmar la obra del agente con tu nombre necesitas pasaporte — es gratis. Sin cuenta, la obra sale firmada por MENTE·VANGUARD.");
      return;
    }
    setPublicando(true);
    try {
      const res = await fetch("/api/agente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mision, variante: 0, publicar: true, firmar, authorBall: "us" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "La misión no pudo publicarse");
        return;
      }
      if (data.error && data.status === 202) { toast.error(data.error); return; }
      setPublicado({ yaPublicado: data.yaPublicado, reward: data.reward });
      const recompensa = data.reward ?? 0;
      if (!data.yaPublicado && recompensa > 0 && firmar) {
        addCoins(recompensa, `MODO AGENTE: ${mision} firmado`);
        if (mision === "quiz" || mision === "ordena" || mision === "vof") addXp(25);
        toast.success(`Obra del agente firmada por ${account?.username ?? "tu pasaporte"}`, {
          description: `+${recompensa}ⓒ · moderador IA: ${data.verdict ?? "LIMPIO"}`,
        });
      } else if (data.yaPublicado) {
        toast.info("Esta misión del día ya estaba publicada — el mundo ve la misma obra (dedupe honesto)");
      } else {
        toast.success("Obra publicada como MENTE·VANGUARD", { description: "la cuenta oficial del agente — firma sin pasaporte" });
      }
      guardar({ obras: [...(estado.obras ?? []), { mision, titulo: creacion.titulo, ts: Date.now(), firmada: firmar && !!account }].slice(-24) });
      cargarStats();
    } catch {
      toast.error("El agente no respondió — inténtalo de nuevo");
    } finally {
      setPublicando(false);
    }
  };

  const copiarInforme = () => {
    if (creacion?.tipo !== "informe") return;
    try {
      navigator.clipboard.writeText(`${(creacion as CreacionInforme).titulo}\n\n${(creacion as CreacionInforme).cuerpo}`);
      toast.success("Informe copiado al portapapeles");
    } catch {
      toast.error("El navegador bloqueó el portapapeles");
    }
  };

  const metaMision = mision ? MISIONES.find((m) => m.id === mision) : null;

  return (
    <div className="space-y-4 v101-panel">
      {/* ===== CABECERA ===== */}
      <div className="hud-panel border-lime-hud/50 p-4 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-lime-hud/10 blur-2xl pointer-events-none" aria-hidden />
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 shrink-0 v103-latido">
            <div className="absolute inset-0 rounded-full border border-lime-hud/60" aria-hidden />
            <div className="absolute -inset-1 rounded-full border border-lime-hud/25 animate-ping" aria-hidden />
            <div className="w-full h-full rounded-full bg-[#0b1204] border border-lime-hud flex items-center justify-center">
              <Bot className="w-6 h-6 text-lime-hud" />
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold uppercase tracking-[0.2em] text-lime-hud leading-tight">
              MODO AGENTE
            </h2>
            <p className="text-[11px] font-mono text-muted-foreground leading-relaxed mt-0.5">
              La mente de Vanguard, superpotente: investiga el mundo del juego con datos reales, redacta, se audita y publica su obra dentro de la plataforma — juegos al arcade, escenarios a la Galería, informes firmados aquí.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest">
          <span className="px-2 py-1 rounded-sm border border-lime-hud/40 bg-lime-hud/10 text-lime-hud flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> auditoría de acero
          </span>
          <span className="px-2 py-1 rounded-sm border border-cyan-hud/40 bg-cyan-hud/10 text-cyan-hud flex items-center gap-1">
            <CircleDot className="w-3 h-3" /> semilla determinista — el mundo ve lo mismo
          </span>
          {account ? (
            <span className="px-2 py-1 rounded-sm border border-green-hud/40 bg-green-hud/10 text-green-hud flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> pasaporte {account.username}
            </span>
          ) : (
            <span className="px-2 py-1 rounded-sm border border-amber-hud/40 bg-amber-hud/10 text-amber flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> sin pasaporte: firma MENTE·VANGUARD
            </span>
          )}
        </div>
      </div>

      {/* ===== AGENTE EN VIVO ===== */}
      <div className="hud-panel border-lime-hud/30 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-lime-hud">
              <Radio className="w-3.5 h-3.5 v103-onda" /> AGENTE EN VIVO
            </div>
            <p className="text-[10px] font-mono text-muted-foreground mt-1 leading-relaxed">
              La agenda del día corre sola: 3 misiones deterministas que llenan el arcade y la galería — Vanguard se actualiza sola.
            </p>
          </div>
          <button
            onClick={() => guardar({ vivo: !estado.vivo })}
            aria-pressed={estado.vivo}
            className={cn(
              "relative w-12 h-6 rounded-full border shrink-0 transition-colors",
              estado.vivo ? "bg-lime-hud/30 border-lime-hud" : "bg-black/40 border-muted-foreground/40"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-4.5 h-4.5 w-[18px] h-[18px] rounded-full transition-all",
              estado.vivo ? "left-[26px] bg-lime-hud" : "left-0.5 bg-muted-foreground"
            )} />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {agenda.map(({ mision: m, semilla }) => (
            <button
              key={semilla}
              onClick={() => correrMision(m)}
              disabled={fase === "corriendo"}
              className="px-2 py-1 rounded-sm border text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-lime-hud hover:border-lime-hud/60 disabled:opacity-40 transition-colors"
            >
              <Sparkles className="w-3 h-3 inline mr-1 -mt-0.5" />
              {MISIONES.find((x) => x.id === m)?.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* ===== SELECTOR DE MISIONES ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {MISIONES.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => correrMision(m.id)}
            disabled={fase === "corriendo"}
            className={cn(
              "hud-panel p-3 text-left border transition-colors disabled:opacity-50 relative overflow-hidden group",
              mision === m.id ? "border-lime-hud" : "border-white/10 hover:border-lime-hud/50"
            )}
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40" style={{ background: m.color }} aria-hidden />
            <div className="flex items-center gap-2">
              <span
                className="w-9 h-9 rounded-sm border flex items-center justify-center shrink-0"
                style={{ borderColor: `${m.color}66`, background: `${m.color}14`, color: m.color }}
              >
                {ICONO_MISION[m.id]}
              </span>
              <div className="min-w-0">
                <div className="text-[12px] font-bold uppercase tracking-wider" style={{ color: m.color }}>{m.nombre}</div>
                <div className="text-[10px] font-mono text-muted-foreground">crea {m.producto} · {m.pasos} pasos</div>
              </div>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground mt-2 leading-relaxed line-clamp-3">{m.desc}</p>
            <div className="mt-2 flex items-center justify-between text-[9px] font-mono uppercase tracking-widest">
              <span className="text-amber">{m.recompensa}</span>
              <span className="text-muted-foreground flex items-center gap-1">
                ejecutar <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ===== CONSOLA EN DIRECTO ===== */}
      <AnimatePresence mode="wait">
        {fase !== "reposo" && (
          <motion.div
            key="consola"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="hud-panel border-lime-hud/40 p-4"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                {fase === "corriendo"
                  ? <Loader2 className="w-4 h-4 text-lime-hud animate-spin shrink-0" />
                  : <CheckCircle2 className="w-4 h-4 text-lime-hud shrink-0" />}
                <span className="text-[11px] font-mono uppercase tracking-widest text-lime-hud truncate">
                  {fase === "corriendo"
                    ? `agente en directo · misión ${mision}`
                    : `misión ${mision} completada`}
                </span>
              </div>
              {metaMision && (
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground shrink-0 hidden sm:block">
                  {metaMision.producto}
                </span>
              )}
            </div>

            {/* progreso */}
            <div className="h-1 rounded-full bg-black/50 overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-lime-hud/60 via-lime-hud to-amber transition-all duration-500"
                style={{ width: `${Math.round((pasoActivo / Math.max(1, protocolo.length)) * 100)}%` }}
              />
            </div>

            {/* log */}
            <div ref={consolaRef} className="max-h-44 overflow-y-auto space-y-1.5 pr-1 v103-scroll">
              {protocolo.slice(0, pasoActivo).map((p) => (
                <motion.div
                  key={p.n}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 text-[10px] font-mono leading-relaxed"
                >
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-sm border shrink-0 uppercase tracking-wider",
                    p.fase === "AUDITANDO" ? "border-amber-hud/50 text-amber"
                      : p.fase === "REDACTANDO" ? "border-cyan-hud/50 text-cyan-hud"
                      : "border-lime-hud/40 text-lime-hud"
                  )}>
                    {p.fase}
                  </span>
                  <span className="text-muted-foreground min-w-0 break-words">{p.linea}</span>
                </motion.div>
              ))}
              {logExtra.map((l, i) => (
                <motion.div
                  key={`x${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.25 }}
                  className="flex items-start gap-2 text-[10px] font-mono leading-relaxed"
                >
                  <span className="px-1.5 py-0.5 rounded-sm border border-sky-400/50 text-sky-300 shrink-0 uppercase tracking-wider">MOTOR</span>
                  <span className="text-muted-foreground min-w-0 break-words">{l}</span>
                </motion.div>
              ))}
              {fase === "corriendo" && (
                <div className="text-[10px] font-mono text-lime-hud v103-cursor">▊</div>
              )}
            </div>

            {/* onda del agente pensando */}
            {fase === "corriendo" && (
              <div className="flex items-end gap-0.5 h-4 mt-2" aria-hidden>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-lime-hud/70 v103-barra"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== RESULTADO ===== */}
      <AnimatePresence mode="wait">
        {fase === "listo" && creacion && (
          <motion.div
            key={`res-${creacion.titulo}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div className="hud-panel border-lime-hud/50 p-4 v103-listo">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-lime-hud">obra del agente · auditada</div>
                  <h3 className="font-display text-sm font-bold text-foreground mt-0.5 break-words">{creacion.titulo}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{creacion.resumen}</p>
                  <p className="text-[9px] font-mono text-muted-foreground/70 mt-1 break-words">{creacion.fuente}</p>
                </div>
                <span className="px-2 py-1 rounded-sm border border-amber-hud/40 bg-amber-hud/10 text-amber text-[9px] font-mono uppercase tracking-widest shrink-0">
                  {notaAuditoria}
                </span>
              </div>
            </div>

            {/* --- juego: PREVIEW JUGABLE --- */}
            {creacion.tipo === "juego" && (() => {
              const cj = creacion as CreacionJuego;
              const check = validarJuego(cj.def);
              if (!check.ok) return null;
              return (
                <div className="hud-panel p-4 border-white/10">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-hud mb-2">preview jugable — pruébalo antes de publicar</div>
                  <GameRuntime def={check.def} idJuego={`agente:${creacion.titulo}`} compacto />
                </div>
              );
            })()}

            {/* --- escenario: tarjeta de simulación --- */}
            {creacion.tipo === "escenario" && sim && (
              <div className="hud-panel p-4 border-sky-400/30">
                <div className="text-[9px] font-mono uppercase tracking-widest text-sky-300 mb-2">resultado del motor · simulación, no predicción</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="rounded-sm border border-white/10 p-2">
                    <div className="text-[9px] font-mono text-muted-foreground uppercase">final</div>
                    <div className="text-[11px] font-bold text-foreground mt-0.5 leading-tight">{sim.fin.nombre}</div>
                  </div>
                  <div className="rounded-sm border border-white/10 p-2">
                    <div className="text-[9px] font-mono text-muted-foreground uppercase">día fin</div>
                    <div className="text-[11px] font-bold text-foreground mt-0.5">D{sim.fin.dia}/{creacion.cfg.horizonte}</div>
                  </div>
                  <div className="rounded-sm border border-white/10 p-2">
                    <div className="text-[9px] font-mono text-muted-foreground uppercase">frente final</div>
                    <div className="text-[11px] font-bold text-foreground mt-0.5">{sim.serie.length > 0 ? Math.round(sim.serie[sim.serie.length - 1].frente) : 0}%</div>
                  </div>
                  <div className="rounded-sm border border-white/10 p-2">
                    <div className="text-[9px] font-mono text-muted-foreground uppercase">escalada máx</div>
                    <div className="text-[11px] font-bold text-foreground mt-0.5">{Math.max(...sim.serie.map((d) => d.escalada))}/6</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {sim.monteCarlo.slice(0, 3).map((m) => (
                    <div key={m.nombre} className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="text-muted-foreground w-40 sm:w-52 truncate">{m.nombre}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-black/50 overflow-hidden">
                        <div className="h-full bg-sky-400/80" style={{ width: `${m.probabilidad}%` }} />
                      </div>
                      <span className="text-foreground w-8 text-right">{m.probabilidad}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- informe: brief completo --- */}
            {creacion.tipo === "informe" && (() => {
              const ci = creacion as CreacionInforme;
              return (
                <div className="hud-panel p-4 border-lime-hud/30 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-sm border border-white/10 p-2">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase">riesgo</div>
                      <div className="text-sm font-bold text-red-hud">{ci.riesgo}</div>
                    </div>
                    <div className="rounded-sm border border-white/10 p-2">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase">tension</div>
                      <div className="text-sm font-bold text-amber">{ci.tension}</div>
                    </div>
                    <div className="rounded-sm border border-white/10 p-2">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase">confianza</div>
                      <div className="text-sm font-bold text-lime-hud">{ci.confianza}</div>
                    </div>
                  </div>
                  <pre className="text-[11px] font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto v103-scroll">{ci.cuerpo}</pre>
                  <button
                    onClick={copiarInforme}
                    className="px-3 py-1.5 rounded-sm border border-white/20 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-lime-hud hover:border-lime-hud/50 transition-colors flex items-center gap-1.5"
                  >
                    <Copy className="w-3 h-3" /> copiar informe
                  </button>
                </div>
              );
            })()}

            {/* --- acciones --- */}
            {creacion.tipo !== "informe" && (
              <div className="hud-panel p-4 border-white/10 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    firma de la obra
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setFirmar(true)}
                      disabled={!account}
                      className={cn(
                        "px-2.5 py-1 rounded-sm border text-[10px] font-mono uppercase tracking-wider transition-colors disabled:opacity-40",
                        firmar ? "border-green-hud bg-green-hud/15 text-green-hud" : "border-white/15 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      mi pasaporte
                    </button>
                    <button
                      onClick={() => setFirmar(false)}
                      className={cn(
                        "px-2.5 py-1 rounded-sm border text-[10px] font-mono uppercase tracking-wider transition-colors",
                        !firmar ? "border-cyan-hud bg-cyan-hud/15 text-cyan-hud" : "border-white/15 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      mente·vanguard
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={publicar}
                    disabled={publicando || !!publicado}
                    className="px-4 py-2 rounded-sm bg-lime-hud/20 border border-lime-hud text-lime-hud text-[11px] font-mono uppercase tracking-widest hover:bg-lime-hud/30 transition-colors flex items-center gap-2 disabled:opacity-50 v103-cta"
                  >
                    {publicando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {publicado ? (publicado.yaPublicado ? "ya estaba publicada" : "publicada") : "publicar en vanguard"}
                  </button>
                  <button
                    onClick={() => navigateTo(creacion.tipo === "juego" ? ("taller" as never) : ("escenarios" as never))}
                    className="px-4 py-2 rounded-sm border border-white/20 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-white/40 transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {creacion.tipo === "juego" ? "abrir el arcade" : "abrir la galería"}
                  </button>
                  <button
                    onClick={() => { setFase("reposo"); setCreacion(null); setMision(null); }}
                    className="px-4 py-2 rounded-sm border border-white/20 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-white/40 transition-colors"
                  >
                    nueva misión
                  </button>
                </div>
                {publicado && typeof publicado.reward === "number" && publicado.reward > 0 && firmar && account && (
                  <div className="flex items-center gap-2 text-[10px] font-mono text-amber">
                    <Coins className="w-3.5 h-3.5" /> +{publicado.reward}ⓒ acreditados al pasaporte {account.username}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== ESTADO DEL AGENTE (servidor) ===== */}
      {stats && (
        <div className="hud-panel p-4 border-white/10">
          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
            <BotIcon className="w-3.5 h-3.5 text-lime-hud" /> mente·vanguard en la plataforma
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-sm border border-white/10 p-2">
              <div className="text-lg font-bold text-lime-hud font-display">{stats.creacionesAgente}</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">obras del agente</div>
            </div>
            <div className="rounded-sm border border-white/10 p-2">
              <div className="text-lg font-bold text-amber font-display">{stats.juegosEnArcade}</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">juegos en arcade</div>
            </div>
            <div className="rounded-sm border border-white/10 p-2">
              <div className="text-lg font-bold text-sky-300 font-display">{stats.escenariosEnGaleria}</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">escenarios en galería</div>
            </div>
          </div>
          {ultimas.length > 0 && (
            <div className="mt-3 space-y-1">
              {ultimas.slice(0, 4).map((u) => (
                <div key={u.id} className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                  <span className={cn("px-1.5 py-0.5 rounded-sm border uppercase tracking-wider shrink-0",
                    u.kind === "juego" ? "border-amber-hud/40 text-amber" : "border-sky-400/40 text-sky-300")}>
                    {u.kind}
                  </span>
                  <span className="truncate">{u.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* historial local */}
      {(estado.obras?.length ?? 0) > 0 && (
        <div className="hud-panel p-3 border-white/10">
          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> tu supervisión del agente · {(estado.obras?.length ?? 0)} obras · {estado.sesiones ?? 0} sesiones
          </div>
          <div className="flex flex-wrap gap-1.5">
            {estado.obras.slice(-6).reverse().map((o, i) => (
              <span key={`${o.ts}-${i}`} className="px-2 py-0.5 rounded-sm border border-white/10 text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                <Gamepad2 className="w-3 h-3" /> {o.mision}{o.firmada ? " · firmada" : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      <HeroOro panel="agenteia" />
    </div>
  );
}
