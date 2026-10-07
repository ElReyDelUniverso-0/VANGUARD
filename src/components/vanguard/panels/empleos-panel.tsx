"use client";

// ============================================================
// VANGUARD v85.0 EL MUNDO DENTRO — EMPLEOS
// "Vanguard no es parte del mundo: el mundo está dentro de Vanguard."
// Los operadores trabajan por sueldos: entrevista de aptitud →
// departamento → nómina por minuto → turnos → ascensos.
// ============================================================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Coins, Clock, CheckCircle2, XCircle, TrendingUp, LogOut,
  FileSignature, Zap, Star, ChevronsUp, Wallet, Play, Building2, Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import {
  ENTREVISTA, DEPARTAMENTOS, APTITUD_META, rangoDe, sueldoPorMin,
  loadEmpleos, saveEmpleos, acumularNomina, tareasDelTurno, pagoTurno,
  hoyKey, COOLDOWN_TURNO_MS, RANGOS,
  type EmpleosState, type Aptitud, type Departamento, type TareaTurno,
} from "@/lib/empleos";

const COLOR_CLS: Record<Departamento["color"], { text: string; border: string; bg: string }> = {
  amber: { text: "text-amber", border: "border-amber-hud", bg: "bg-amber-hud/20" },
  cyan: { text: "text-cyan-hud", border: "border-cyan-hud", bg: "bg-cyan-hud/20" },
  green: { text: "text-green-hud", border: "border-green-hud", bg: "bg-green-hud/20" },
  violet: { text: "text-violet-hud", border: "border-violet-hud", bg: "bg-violet-hud/20" },
};

// ====== MANIFIESTO — la idea que ordena todo Vanguard v85 ======
export function ManifiestoMundo() {
  return (
    <div className="relative overflow-hidden border border-amber-hud/40 bg-gradient-to-br from-amber-hud/15 via-transparent to-transparent p-4">
      <Quote className="absolute top-2 right-3 w-8 h-8 text-amber-hud/15 rotate-180" aria-hidden />
      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-hud mb-1.5">manifiesto vanguard</p>
      <p className="text-sm sm:text-base font-black leading-snug text-foreground">
        Vanguard no es parte del mundo.
        <span className="text-amber"> El mundo está dentro de Vanguard.</span>
      </p>
      <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
        Cada frente, cada estrecho, cada crisis en vivo corre por aquí. Y ahora también
        trabaja aquí: oficinas, nóminas, turnos y carreras. Tu sueldo lo paga el planeta.
      </p>
    </div>
  );
}

// ====== ENTREVISTA DE INGRESO ======
function Entrevista({ onContratado }: { onContratado: (depto: Departamento, scores: Record<Aptitud, number>) => void }) {
  const [paso, setPaso] = useState(0);
  const [scores, setScores] = useState<Record<Aptitud, number>>({ TACTICA: 0, GEOGRAFIA: 0, ANALISIS: 0, DIPLOMACIA: 0 });
  const [elegida, setElegida] = useState<number | null>(null);
  const [mostrandoPorQue, setMostrandoPorQue] = useState(false);

  const preg = ENTREVISTA[paso];
  const total = ENTREVISTA.length;

  const responder = (idx: number) => {
    if (mostrandoPorQue) return;
    setElegida(idx);
    setMostrandoPorQue(true);
    if (idx === preg.best) sfx.success();
    else sfx.click();
  };

  const avanzar = () => {
    const gain = elegida === preg.best ? 1 : 0;
    const next = { ...scores, [preg.apt]: scores[preg.apt] + gain };
    setScores(next);
    setMostrandoPorQue(false);
    setElegida(null);
    if (paso + 1 >= total) {
      // ganador: aptitud con más aciertos; desempate por orden canónico
      const orden: Aptitud[] = ["TACTICA", "GEOGRAFIA", "ANALISIS", "DIPLOMACIA"];
      let mejor: Aptitud = "TACTICA";
      let max = -1;
      for (const a of orden) {
        if (next[a] > max) { max = next[a]; mejor = a; }
      }
      const depto = DEPARTAMENTOS.find((d) => d.apt === mejor) ?? DEPARTAMENTOS[0];
      sfx.unlock();
      onContratado(depto, next);
    } else {
      setPaso((p) => p + 1);
    }
  };

  return (
    <div className="hud-corner p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[10px] font-mono uppercase tracking-wider text-amber flex items-center gap-1.5">
          <FileSignature className="w-3.5 h-3.5" /> entrevista de ingreso · recursos humanos vanguard
        </p>
        <span className="text-[10px] font-mono text-muted-foreground">{paso + 1}/{total}</span>
      </div>
      <div className="flex gap-1 mb-4">
        {ENTREVISTA.map((_, i) => (
          <div key={i} className={cn("h-1 flex-1", i < paso ? "bg-green-hud" : i === paso ? "bg-amber-hud animate-pulse" : "bg-border")} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={paso}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <h3 className="text-sm font-bold text-foreground leading-snug mb-3">{preg.q}</h3>
          <div className="space-y-1.5">
            {preg.opts.map((opt, i) => (
              <button
                key={i}
                onClick={() => responder(i)}
                disabled={mostrandoPorQue}
                className={cn(
                  "w-full text-left border px-2.5 py-2 text-xs leading-snug transition-colors",
                  !mostrandoPorQue && "border-border hover:border-amber-hud hover:bg-amber-hud/10 cursor-pointer",
                  mostrandoPorQue && i === preg.best && "border-green-hud bg-green-hud/15 text-foreground",
                  mostrandoPorQue && i === elegida && i !== preg.best && "border-red-hud bg-red-hud/10",
                  mostrandoPorQue && i !== preg.best && i !== elegida && "border-border/40 text-muted-foreground/60"
                )}
              >
                <span className="font-mono text-[10px] text-muted-foreground mr-1.5">{String.fromCharCode(65 + i)}.</span>
                {opt}
                {mostrandoPorQue && i === preg.best && <CheckCircle2 className="w-3.5 h-3.5 text-green-hud inline ml-1.5 -mt-0.5" />}
                {mostrandoPorQue && i === elegida && i !== preg.best && <XCircle className="w-3.5 h-3.5 text-red-hud inline ml-1.5 -mt-0.5" />}
              </button>
            ))}
          </div>
          {mostrandoPorQue && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 border border-amber-hud/40 bg-amber-hud/10 p-2.5">
              <p className="text-[11px] text-foreground/90 leading-relaxed">
                <span className="text-amber font-bold">{APTITUD_META[preg.apt].icono} {APTITUD_META[preg.apt].nombre}:</span>{" "}
                {preg.porQue}
              </p>
              <Button size="sm" onClick={avanzar} className="mt-2 h-7 w-full font-mono text-[10px] uppercase bg-amber-hud/80 border border-amber-hud text-black hover:bg-amber-hud">
                {paso + 1 >= total ? "VER MI CONTRATO →" : "SIGUIENTE PREGUNTA →"}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ====== CONTRATO ACEPTADO ======
function ContratoOferta({ depto, scores, onFirmar }: { depto: Departamento; scores: Record<Aptitud, number>; onFirmar: () => void }) {
  const c = COLOR_CLS[depto.color];
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="hud-corner p-4 space-y-3">
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">departamento asignado según tu perfil</p>
      <div className={cn("flex items-center gap-3 border p-3", c.border, c.bg)}>
        <span className="text-3xl" aria-hidden>{depto.icono}</span>
        <div className="flex-1 min-w-0">
          <p className={cn("text-base font-black uppercase leading-tight", c.text)}>{depto.nombre}</p>
          <p className="text-[10px] font-mono text-muted-foreground uppercase">aptitud dominante · {APTITUD_META[depto.apt].nombre}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={cn("text-lg font-black font-mono", c.text)}>{depto.sueldoBase.toFixed(1)}ⓒ</p>
          <p className="text-[9px] font-mono text-muted-foreground uppercase">por minuto</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{depto.desc}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {(Object.keys(scores) as Aptitud[]).map((a) => (
          <div key={a} className="border border-border/60 p-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono uppercase text-muted-foreground mb-1">
              <span>{APTITUD_META[a].icono} {APTITUD_META[a].nombre}</span>
              <span className="text-foreground font-bold">{scores[a]}/2</span>
            </div>
            <div className="h-1 bg-border overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(scores[a] / 2) * 100}%` }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className={cn("h-full", a === depto.apt ? "bg-green-hud" : "bg-muted-foreground/50")}
              />
            </div>
          </div>
        ))}
      </div>
      <Button onClick={onFirmar} className={cn("w-full h-10 font-mono text-[11px] uppercase border text-black hover:brightness-110", c.bg, c.border)}>
        <FileSignature className="w-4 h-4 mr-1.5" /> FIRMAR CONTRATO Y EMPEZAR A COBRAR
      </Button>
      <p className="text-[9px] font-mono text-muted-foreground text-center uppercase">
        la nómina corre aunque cierres vanguard · tope 6 h acumuladas
      </p>
    </motion.div>
  );
}

// ====== TURNO DE TRABAJO ======
function TurnoActivo({ depto, tareas, onFin }: { depto: Departamento; tareas: TareaTurno[]; onFin: (aciertos: number) => void }) {
  const [paso, setPaso] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const c = COLOR_CLS[depto.color];
  const t = tareas[paso];

  const responder = (i: number) => {
    if (elegida !== null) return;
    setElegida(i);
    if (i === t.best) {
      setAciertos((a) => a + 1);
      sfx.success();
    } else sfx.error();
    setTimeout(() => {
      if (paso + 1 >= tareas.length) onFin(aciertos + (i === t.best ? 1 : 0));
      else { setPaso((p) => p + 1); setElegida(null); }
    }, 750);
  };

  return (
    <div className={cn("hud-corner p-3 border", c.border)}>
      <div className="flex items-center justify-between mb-2">
        <p className={cn("text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5", c.text)}>
          <Zap className="w-3.5 h-3.5" /> TURNO EN CURSO · {depto.nombre}
        </p>
        <span className="text-[10px] font-mono text-muted-foreground">tarea {paso + 1}/{tareas.length}</span>
      </div>
      <h4 className="text-sm font-bold text-foreground leading-snug mb-2.5">{t.q}</h4>
      <div className="space-y-1.5">
        {t.opts.map((opt, i) => (
          <button
            key={i}
            onClick={() => responder(i)}
            disabled={elegida !== null}
            className={cn(
              "w-full text-left border px-2.5 py-2 text-xs transition-colors",
              elegida === null && "border-border hover:border-amber-hud cursor-pointer",
              elegida !== null && i === t.best && "border-green-hud bg-green-hud/15",
              elegida !== null && i === elegida && i !== t.best && "border-red-hud bg-red-hud/10",
              elegida !== null && i !== t.best && i !== elegida && "border-border/40 text-muted-foreground/60"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ====== PANEL PRINCIPAL ======
export function EmpleosPanel() {
  const coins = useGameStore((s) => s.coins);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const [st, setSt] = useState<EmpleosState>(() => loadEmpleos());
  const [tareaAbierta, setTareaAbierta] = useState(false);
  const [resumenTurno, setResumenTurno] = useState<{ aciertos: number; pago: { base: number; propina: number; bonoPerfecta: number; total: number; xpGanada: number; perfecta: boolean } } | null>(null);
  const [tick, setTick] = useState(0);
  const [confirmarRenuncia, setConfirmarRenuncia] = useState(false);
  const [oferta, setOferta] = useState<{ depto: Departamento; scores: Record<Aptitud, number> } | null>(null);
  const stRef = useRef(st);
  stRef.current = st;

  const depto = useMemo(() => DEPARTAMENTOS.find((d) => d.id === st.depto) ?? null, [st.depto]);

  // nómina corre en vivo: acumula al abrir, cobre con tictac visual cada 1 s
  useEffect(() => {
    if (!depto) return;
    setSt((s) => {
      const next = acumularNomina(s, depto);
      saveEmpleos(next);
      return next;
    });
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [depto]);

  const sueldoMin = depto ? sueldoPorMin(depto, st.xpLaboral) : 0;
  const rango = rangoDe(st.xpLaboral);
  const sueldoHora = sueldoMin * 60;

  // proyección visual: lo que llevaría la nómina si siguiera corriendo ahora mismo
  const nominaViva = useMemo(() => {
    void tick;
    if (!depto || !st.lastAccrueTs) return st.nominaPendiente;
    const mins = Math.max(0, Math.floor((Date.now() - st.lastAccrueTs) / 60000));
    const yaMin = st.nominaPendiente / sueldoMin || 0;
    const pagables = Math.min(mins, Math.max(0, 360 - yaMin));
    return st.nominaPendiente + pagables * sueldoMin;
  }, [tick, depto, st.lastAccrueTs, st.nominaPendiente, sueldoMin]);

  const actualizar = useCallback((next: EmpleosState) => {
    saveEmpleos(next);
    setSt(next);
  }, []);

  const cobrar = () => {
    if (!depto) return;
    let s = acumularNomina(stRef.current, depto);
    const monto = Math.round(s.nominaPendiente);
    if (monto <= 0) {
      toast.info("La nómina está vacía: vuelve más tarde, sigue corriendo.");
      return;
    }
    s = { ...s, nominaPendiente: 0, cobradoTotal: s.cobradoTotal + monto };
    actualizar(s);
    addCoins(monto, `NÓMINA · ${depto.nombre}`);
    sfx.coin();
    toast.success(`Nómina cobrada: +${monto}ⓒ — ${depto.nombre}`);
  };

  const firmar = () => {
    if (!oferta) return;
    const s = loadEmpleos();
    actualizar({
      ...s,
      depto: oferta.depto.id,
      entrevistas: s.entrevistas + 1,
      nominaPendiente: 0,
      lastAccrueTs: Date.now(),
    });
    setOferta(null);
    sfx.unlock();
    toast.success(`Contrato firmado: ${oferta.depto.nombre} · ${oferta.depto.sueldoBase.toFixed(1)}ⓒ/min`);
  };

  const iniciarTurno = () => {
    if (!depto) return;
    if (Date.now() - st.lastShiftTs < COOLDOWN_TURNO_MS) {
      toast.error("Aún estás de guardia pasiva: el próximo turno abre en unos minutos.");
      return;
    }
    setResumenTurno(null);
    setTareaAbierta(true);
    sfx.click();
  };

  const finTurno = (aciertos: number) => {
    if (!depto) return;
    const dia = hoyKey();
    const n = st.diaActual === dia ? st.shiftsHoy : 0;
    const pago = pagoTurno(depto, st.xpLaboral, aciertos, 3);
    let s: EmpleosState = {
      ...st,
      lastShiftTs: Date.now(),
      shiftsHoy: st.diaActual === dia ? st.shiftsHoy + 1 : 1,
      diaActual: dia,
      turnosTotales: st.turnosTotales + 1,
      aciertosTotales: st.aciertosTotales + aciertos,
      xpLaboral: st.xpLaboral + pago.xpGanada,
    };
    // racha laboral: primer turno del día mantiene la racha viva
    if (s.lastDiaTurno !== dia) {
      const ayer = hoyKey(Date.now() - 86400000);
      const racha = s.lastDiaTurno === ayer ? s.diasTrabajados + 1 : 1;
      s = { ...s, diasTrabajados: racha, lastDiaTurno: dia };
      if (racha > 0 && racha % 3 === 0) {
        addCoins(60 * (racha / 3), `Racha laboral ${racha} días`);
        toast.success(`Racha laboral de ${racha} días: bonus +${60 * (racha / 3)}ⓒ`);
      }
    }
    actualizar(s);
    addCoins(pago.total, `Turno completado · ${depto.nombre}`);
    addXp(pago.xpGanada);
    setTareaAbierta(false);
    setResumenTurno({ aciertos, pago });
    sfx.coin();
  };

  const renunciar = () => {
    const s: EmpleosState = { ...st, depto: null, xpLaboral: Math.floor(st.xpLaboral * 0.5), nominaPendiente: 0, lastAccrueTs: 0 };
    actualizar(s);
    setConfirmarRenuncia(false);
    toast.info("Renuncia aceptada: media experiencia conservada. La entrevista te espera.");
  };

  const cooldownRestante = Math.max(0, COOLDOWN_TURNO_MS - (Date.now() - st.lastShiftTs));
  const cooldownPct = cooldownRestante > 0 ? (cooldownRestante / COOLDOWN_TURNO_MS) * 100 : 0;

  return (
    <div className="space-y-3">
      <HeroOro panel="empleos" />
      <PanelHeader
        title="Empleos de Vanguard"
        subtitle={depto ? `${depto.nombre} · ${(rango.actual.mult * 100).toFixed(0)}% de sueldo · racha ${st.diasTrabajados} d` : "entrevista de ingreso abierta · el mundo contrata"}
        icon={<Briefcase className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          depto ? (
            <div className="text-right">
              <p className="text-[10px] font-mono text-amber leading-none">{sueldoMin.toFixed(2)}ⓒ/min</p>
              <p className="text-[9px] font-mono text-muted-foreground mt-0.5">{rango.actual.nombre}</p>
            </div>
          ) : undefined
        }
      />

      <ManifiestoMundo />

      {/* ===== SIN CONTRATO: ENTREVISTA ===== */}
      {!depto && !oferta && (
        <>
          <div className="hud-corner p-3 flex items-start gap-2.5">
            <Building2 className="w-5 h-5 text-amber mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground leading-tight">Vanguard contrata personal</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                Ocho preguntas. Respuestas reales de sala de situación. Según lo que se te dé bien
                entrarás al <span className="text-amber">Estado Mayor</span>, <span className="text-cyan-hud">Cartografía</span>,{" "}
                <span className="text-green-hud">Escucha SIGINT</span> o <span className="text-violet-hud">Cancillería</span> —
                cada oficina con sueldo por minuto, turnos pagados y ascensos.
              </p>
              {st.entrevistas > 0 && (
                <p className="text-[9px] font-mono text-muted-foreground uppercase mt-1">
                  carreras anteriores: {st.entrevistas} · experiencia conservada: {Math.floor(st.xpLaboral * 0.5)} XP laboral
                </p>
              )}
            </div>
          </div>
          <Entrevista
            onContratado={(depto2, scores) => setOferta({ depto: depto2, scores })}
          />
        </>
      )}

      {/* ===== OFERTA DE CONTRATO ===== */}
      {oferta && <ContratoOferta depto={oferta.depto} scores={oferta.scores} onFirmar={firmar} />}

      {/* ===== CON CONTRATO: PUESTO DE TRABAJO ===== */}
      {depto && (
        <>
          {/* NÓMINA VIVA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("hud-corner p-4 border", COLOR_CLS[depto.color].border)}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl flex-shrink-0" aria-hidden>{depto.icono}</span>
                <div className="min-w-0">
                  <p className={cn("text-sm font-black uppercase leading-tight", COLOR_CLS[depto.color].text)}>{depto.nombre}</p>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase">
                    {rango.actual.nombre} · XP laboral {st.xpLaboral}
                    {rango.siguiente ? ` · ${rango.siguiente.xp - st.xpLaboral} para ${rango.siguiente.nombre}` : " · rango máximo"}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[9px] font-mono text-muted-foreground uppercase">tu sueldo</p>
                <p className={cn("text-sm font-black font-mono", COLOR_CLS[depto.color].text)}>
                  {sueldoMin.toFixed(2)}ⓒ<span className="text-[9px] text-muted-foreground">/min</span>
                </p>
                <p className="text-[9px] font-mono text-muted-foreground">{sueldoHora.toFixed(0)}ⓒ/hora</p>
              </div>
            </div>

            {/* barra de nómina acumulada (tope 6h) */}
            <div className="relative h-9 border border-border/60 bg-secondary/40 overflow-hidden mb-2">
              <motion.div
                className={cn("absolute inset-y-0 left-0", COLOR_CLS[depto.color].bg)}
                animate={{ width: `${Math.min(100, ((nominaViva / sueldoMin) / 360) * 100)}%` }}
                transition={{ duration: 0.6 }}
              />
              <div className="relative z-10 h-full flex items-center justify-between px-2.5">
                <span className="text-[9px] font-mono uppercase text-muted-foreground">nómina acumulada · tope 6 h</span>
                <motion.span
                  key={Math.floor(nominaViva * 10)}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  className={cn("font-mono font-black text-sm", COLOR_CLS[depto.color].text)}
                >
                  {Math.floor(nominaViva)}ⓒ
                </motion.span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={cobrar} className={cn("flex-1 h-9 font-mono text-[11px] uppercase border", COLOR_CLS[depto.color].bg, COLOR_CLS[depto.color].border, "text-foreground hover:brightness-125")}>
                <Wallet className="w-4 h-4 mr-1.5" /> COBRAR NÓMINA
              </Button>
              <div className="border border-border/60 px-2 py-1.5 text-center">
                <p className="text-[9px] font-mono text-muted-foreground uppercase leading-none">cobrado total</p>
                <p className="text-xs font-mono font-bold text-amber mt-0.5">{st.cobradoTotal.toLocaleString("es")}ⓒ</p>
              </div>
            </div>
          </motion.div>

          {/* TURNO */}
          <div className="hud-corner p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-amber flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> turno operativo · 3 tareas de tu oficina
              </p>
              {cooldownRestante > 0 && (
                <span className="text-[9px] font-mono text-muted-foreground uppercase">
                  próximo turno {Math.ceil(cooldownRestante / 60000)} min
                </span>
              )}
            </div>
            {cooldownRestante > 0 && (
              <div className="h-1 bg-border overflow-hidden mb-2.5">
                <div className="h-full bg-amber-hud/70 transition-all duration-1000" style={{ width: `${cooldownPct}%` }} />
              </div>
            )}
            {!tareaAbierta ? (
              <>
                <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                  <div className="border border-border/60 p-1.5 text-center">
                    <p className="text-[9px] font-mono text-muted-foreground uppercase leading-none">turnos</p>
                    <p className="text-sm font-black font-mono text-foreground mt-1">{st.turnosTotales}</p>
                  </div>
                  <div className="border border-border/60 p-1.5 text-center">
                    <p className="text-[9px] font-mono text-muted-foreground uppercase leading-none">aciertos</p>
                    <p className="text-sm font-black font-mono text-green-hud mt-1">{st.aciertosTotales}</p>
                  </div>
                  <div className="border border-border/60 p-1.5 text-center">
                    <p className="text-[9px] font-mono text-muted-foreground uppercase leading-none">hoy</p>
                    <p className="text-sm font-black font-mono text-amber mt-1">{st.diaActual === hoyKey() ? st.shiftsHoy : 0}</p>
                  </div>
                </div>
                <Button onClick={iniciarTurno} disabled={cooldownRestante > 0} className={cn("w-full h-9 font-mono text-[11px] uppercase border", COLOR_CLS[depto.color].bg, COLOR_CLS[depto.color].border, "text-foreground hover:brightness-125 disabled:opacity-40")}>
                  <Play className="w-4 h-4 mr-1.5" /> CUMPLIR TURNO (sueldo + propina)
                </Button>
              </>
            ) : (
              <TurnoActivo depto={depto} tareas={tareasDelTurno(depto, hoyKey(), st.diaActual === hoyKey() ? st.shiftsHoy : 0)} onFin={finTurno} />
            )}

            {/* resumen del turno terminado */}
            <AnimatePresence>
              {resumenTurno && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2.5 border border-green-hud/60 bg-green-hud/10 p-2.5">
                  <p className="text-[10px] font-mono uppercase text-green-hud flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> turno completado · {resumenTurno.aciertos}/3 aciertos
                    {resumenTurno.pago.perfecta && <span className="text-amber">· TURNO PERFECTO</span>}
                  </p>
                  <p className="text-xs text-foreground font-mono">
                    +{resumenTurno.pago.total}ⓒ <span className="text-muted-foreground">({resumenTurno.pago.base} base + {resumenTurno.pago.propina} propina{resumenTurno.pago.bonoPerfecta > 0 ? ` + ${resumenTurno.pago.bonoPerfecta} perfecto` : ""})</span>
                    {" "}· <span className="text-amber">+{resumenTurno.pago.xpGanada} XP laboral</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ASCENSOS */}
          <div className="hud-corner p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-amber flex items-center gap-1.5 mb-2.5">
              <ChevronsUp className="w-3.5 h-3.5" /> escala de carrera · cada rango sube el sueldo
            </p>
            <div className="space-y-1">
              {RANGOS.map((r, i) => {
                const logrado = st.xpLaboral >= r.xp;
                const esActual = rango.idx === i;
                return (
                  <div key={r.nombre} className={cn("flex items-center gap-2 border px-2 py-1.5", esActual ? "border-amber-hud bg-amber-hud/10" : logrado ? "border-green-hud/40" : "border-border/50 opacity-60")}>
                    {esActual ? <Star className="w-3.5 h-3.5 text-amber flex-shrink-0" /> : logrado ? <CheckCircle2 className="w-3.5 h-3.5 text-green-hud flex-shrink-0" /> : <span className="w-3.5 h-3.5 flex-shrink-0 border border-border flex-shrink-0" />}
                    <span className={cn("text-[11px] font-mono font-bold flex-1", esActual ? "text-amber" : "text-foreground/80")}>{r.nombre}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{r.xp} XP</span>
                    <span className="text-[10px] font-mono text-green-hud font-bold w-12 text-right">+{Math.round((r.mult - 1) * 100)}%</span>
                  </div>
                );
              })}
            </div>
            {rango.siguiente && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground uppercase mb-1">
                  <span>progreso a {rango.siguiente.nombre}</span>
                  <span>{Math.round(rango.progreso * 100)}%</span>
                </div>
                <div className="h-1.5 bg-border overflow-hidden">
                  <motion.div className="h-full bg-amber-hud" animate={{ width: `${rango.progreso * 100}%` }} transition={{ duration: 0.5 }} />
                </div>
              </div>
            )}
          </div>

          {/* RENUNCIA */}
          <div className="hud-corner p-3 flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="text-[10px] text-muted-foreground leading-relaxed flex-1">
              ¿Otra vocación? Renunciar conserva la mitad de tu XP laboral y reabre la entrevista:
              el Estado Mayor, Cartografía, SIGINT y Cancillería aceptan traslados.
            </p>
            {!confirmarRenuncia ? (
              <Button size="sm" variant="ghost" onClick={() => { setConfirmarRenuncia(true); sfx.click(); }} className="h-7 font-mono text-[10px] uppercase text-red-hud hover:bg-red-hud/20 flex-shrink-0">
                <LogOut className="w-3.5 h-3.5 mr-1" /> renunciar
              </Button>
            ) : (
              <div className="flex gap-1.5 flex-shrink-0">
                <Button size="sm" onClick={renunciar} className="h-7 font-mono text-[10px] uppercase bg-red-hud/30 border border-red-hud text-red-hud hover:bg-red-hud/50">confirmar</Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmarRenuncia(false)} className="h-7 font-mono text-[10px] uppercase">no</Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* saldo de referencia */}
      <p className="text-[9px] font-mono text-muted-foreground text-center uppercase">
        saldo en caja: {coins.toLocaleString("es")}ⓒ · los pagos de nómina también pueden recibir GOLPE DE FORTUNA
      </p>
    </div>
  );
}
