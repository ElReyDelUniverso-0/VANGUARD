"use client";

// v100.0 LABORATORIO DEL DESTINO — WHAT IF? LAB
// El laboratorio contrafactual de Vanguard: conectado a EL ESPEJO (sus 4
// crisis y la geometría real de la línea del Karsk), aplica una perturbación
// con dosis ajustable y corre la guerra día a día con el motor de factores
// múltiples + Monte Carlo de 24 semillas. REGLA: SIMULACIÓN, no predicción.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, Play, Pause, Gauge, SkipForward, RotateCcw, Copy, ArrowRight,
  ArrowLeft, ArrowDownRight, ArrowUpRight, BrainCircuit, GitCompareArrows,
  Scale, Radio, ChevronDown, Sparkles, Link2, Swords, Landmark, Wallet, Users2, Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { navigateTo } from "@/lib/nav";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { useGameStore } from "@/lib/game-store";
// v101.0 EL REGRESO — PILAR 2: cada simulación alimenta el PERFIL DE ANALISTA
import { useAnalista } from "@/lib/analista";
import { puntosFrente, TEATRO_W } from "@/lib/frente-zonas-data";
import {
  simular, escenarioPorId, LAB_ESCENARIOS, PERTURBACIONES, NIVELES_ESCALADA,
  resumenLab, type ConfigLab, type ResultadoLab,
} from "@/lib/whatif";

const RECOMPENSA = { coins: 5, xp: 4, maxDia: 3 };
const LS_CLAVE = "vg-lab-v100";

function cuotaDeHoy(): { dia: string; cuenta: number } {
  try {
    const raw = localStorage.getItem(LS_CLAVE);
    const dia = new Date().toISOString().slice(0, 10);
    const p = raw ? (JSON.parse(raw) as { dia: string; cuenta: number }) : null;
    if (p && p.dia === dia) return p;
  } catch { /* primer día */ }
  return { dia: new Date().toISOString().slice(0, 10), cuenta: 0 };
}

function pagarAnalista(): boolean {
  const { dia, cuenta } = cuotaDeHoy();
  if (cuenta >= RECOMPENSA.maxDia) return false;
  try {
    localStorage.setItem(LS_CLAVE, JSON.stringify({ dia, cuenta: cuenta + 1 }));
  } catch { /* noop */ }
  return true;
}

// ---------- línea del frente para el teatro SVG (geometría del Espejo) ----------
function lineaFrente(frentePct: number, dia: number): [number, number][] {
  const xMedio = TEATRO_W * (1 - frentePct / 100);
  // la forma ondulada del frente KARSK del Espejo (11 puntos) como esqueleto
  const base = puntosFrente(13);
  const ys = base.map((p) => p[1]);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  return base.map(([bx, by], i) => {
    const off = (bx - 348) * 0.55; // desvío propio del frente real del Espejo
    const ond = Math.sin((by / 90) + dia * 0.045) * 9;
    const x = Math.max(30, Math.min(TEATRO_W - 30, xMedio + off + ond));
    const y = yMin + ((by - yMin) / Math.max(1, yMax - yMin)) * 400 + 10;
    return [x, y] as [number, number];
  });
}

function ContadorBar({ label, valor, color, max = 1, pct }: { label: string; valor: string; color: string; max?: number; pct?: number }) {
  const p = pct ?? Math.round(parseFloat(valor) / max * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[9px] font-black uppercase tracking-wider text-white/45">{label}</span>
        <span className="text-[11px] font-black" style={{ color }}>{valor}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${Math.max(2, Math.min(100, p))}%` }} transition={{ duration: 0.3 }} />
      </div>
    </div>
  );
}

export function LaboratorioPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const alias = useGameStore((s) => s.alias);

  // v101.0 PILAR 3 — REMIX: un escenario de la GALERÍA DEL DESTINO llega aquí
  // listo para MEJORAR (misma crisis, misma perturbación, misma dosis)
  const [remixDe] = useState(() => {
    try {
      const v = sessionStorage.getItem("vg-whatif-remix");
      sessionStorage.removeItem("vg-whatif-remix");
      if (v) {
        const r = JSON.parse(v) as { crisisId?: string; perturbacion?: string; dosis?: number; horizonte?: number; autor?: string };
        if (r && LAB_ESCENARIOS.some((e) => e.id === r.crisisId)) return r;
      }
    } catch { /* sin sessionStorage */ }
    return null;
  });

  // importar crisis desde EL ESPEJO — inicializador perezoso (patrón del proyecto)
  const [importado] = useState(() => {
    try {
      const v = sessionStorage.getItem("vg-whatif-crisis");
      sessionStorage.removeItem("vg-whatif-crisis");
      if (v && LAB_ESCENARIOS.some((e) => e.id === v)) return v;
    } catch { /* sin sessionStorage */ }
    return null;
  });
  const [crisisId, setCrisisId] = useState(() => remixDe?.crisisId ?? importado ?? LAB_ESCENARIOS[0].id);
  const [vengoDelEspejo, setVengoDelEspejo] = useState(() => !!importado);
  useEffect(() => {
    if (importado) toast(`Escenario importado de EL ESPEJO: ${escenarioPorId(importado).nombre}`, { duration: 3200, icon: "🔗" });
  }, [importado]);
  useEffect(() => {
    if (remixDe) toast(`REMIX del escenario de @${remixDe.autor || "comunidad"}: ajústalo y comparte tu versión`, { duration: 3600, icon: "🌿" });
  }, [remixDe]);

  const [perturbacion, setPerturbacion] = useState<string | null>(remixDe?.perturbacion ?? null);
  const [dosis, setDosis] = useState(() => Math.max(1, Math.min(5, Number(remixDe?.dosis) || 3)));
  const [horizonte, setHorizonte] = useState<90 | 180 | 240>(
    () => (remixDe?.horizonte === 90 || remixDe?.horizonte === 240 ? remixDe.horizonte : 180)
  );
  const [resultado, setResultado] = useState<ResultadoLab | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [compartiendo, setCompartiendo] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [diaIdx, setDiaIdx] = useState(0);
  const [velocidad, setVelocidad] = useState<1 | 4 | 12>(4);
  const [pasosAbiertos, setPasosAbiertos] = useState(false);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const pagadoRef = useRef(false);

  const esc = useMemo(() => escenarioPorId(crisisId), [crisisId]);

  // reproducción día a día
  useEffect(() => {
    if (!reproduciendo || !resultado) return;
    const total = resultado.serie.length - 1;
    const iv = setInterval(() => {
      setDiaIdx((v) => {
        if (v >= total) { setReproduciendo(false); return v; }
        return v + 1;
      });
    }, Math.max(30, 420 / velocidad));
    return () => clearInterval(iv);
  }, [reproduciendo, resultado, velocidad]);

  // autoscroll de la línea temporal
  useEffect(() => {
    const el = timelineRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [diaIdx]);

  const correr = useCallback(() => {
    if (!perturbacion) {
      toast("Elige primero una perturbación: ¿qué pasa si...?", { duration: 2600 });
      return;
    }
    setCalculando(true);
    setResultado(null);
    setReproduciendo(false);
    window.setTimeout(() => {
      const cfg: ConfigLab = { crisisId, perturbacion: perturbacion as ConfigLab["perturbacion"], dosis, horizonte };
      const r = simular(cfg);
      setResultado(r);
      useAnalista.getState().registrar("lab"); // v101.0 PILAR 2
      setDiaIdx(0);
      setCalculando(false);
      window.setTimeout(() => setReproduciendo(true), 350);
      // recompensa ANALISTA CONTRAFACTUAL (una vez por simulación)
      if (!pagadoRef.current && pagarAnalista()) {
        pagadoRef.current = true;
        addCoins(RECOMPENSA.coins, "LABORATORIO: análisis contrafactual");
        addXp(RECOMPENSA.xp);
        toast(`ANALISTA CONTRAFACTUAL +${RECOMPENSA.coins}ⓒ +${RECOMPENSA.xp} XP`, { duration: 2600, icon: "🧪" });
      }
    }, 60);
  }, [crisisId, perturbacion, dosis, horizonte, addCoins, addXp]);

  const diaActual = resultado ? resultado.serie[Math.min(diaIdx, resultado.serie.length - 1)] : null;
  const eventosHasta = resultado ? resultado.eventos.filter((e) => e.dia <= (diaActual?.dia ?? 0)) : [];
  const linea = useMemo(() => lineaFrente(diaActual?.frente ?? esc.frenteBase, diaActual?.dia ?? 0), [diaActual, esc.frenteBase]);
  const pathD = linea.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const escaladaActual = NIVELES_ESCALADA[(diaActual?.escalada ?? 1) - 1];
  const terminado = resultado != null && diaIdx >= resultado.serie.length - 1;

  const copiarInforme = () => {
    if (!resultado) return;
    const txt = resumenLab(resultado, esc, { crisisId, perturbacion: (perturbacion ?? "alto-fuego") as ConfigLab["perturbacion"], dosis, horizonte });
    navigator.clipboard?.writeText(txt).then(
      () => toast("Informe copiado al portapapeles", { duration: 2200 }),
      () => toast("No se pudo copiar", { duration: 2200 }),
    );
  };

  // v101.0 PILAR 3 — COMPARTIR CON LA COMUNIDAD: el escenario viaja a la
  // GALERÍA DEL DESTINO donde cualquiera lo explora, lo comenta y lo mejora.
  const compartir = async () => {
    if (!resultado || !perturbacion || compartiendo) return;
    setCompartiendo(true);
    try {
      const nombreP = PERTURBACIONES.find((p) => p.id === perturbacion)?.nombre ?? perturbacion;
      const res = await fetch("/api/ugc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "escenario",
          author: alias || "ANÓNIMO",
          authorBall: "un",
          title: `¿Y SI...? ${esc.nombre} · ${nombreP} (dosis ${dosis})`.slice(0, 120),
          summary: `Mi contrafactual de ${esc.nombre}: ${resultado.fin.nombre} en el día ${resultado.fin.dia}. ${resultado.fin.detalle}`.slice(0, 300),
          specs: JSON.stringify({
            crisisId,
            crisis: esc.nombre,
            perturbacion,
            dosis,
            horizonte,
            final: resultado.fin.nombre,
            diaFin: resultado.fin.dia,
            ganador: resultado.fin.ganador,
            mc: resultado.monteCarlo.slice(0, 3).map((m) => ({ nombre: m.nombre, probabilidad: m.probabilidad })),
            frente: Math.round(resultado.serie[resultado.serie.length - 1].frente),
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "No se pudo compartir el escenario"); return; }
      if (data.eliminated) { toast.error(`El agente IA lo rechazó: ${data.reason}`); return; }
      useAnalista.getState().registrar("escenario"); // PILAR 2: insignia ESCENÓGRAFO
      addCoins(data.reward ?? 35, "LABORATORIO: escenario compartido con la comunidad");
      toast.success(`Escenario publicado en la GALERÍA DEL DESTINO · +${data.reward ?? 35}ⓒ`, { duration: 3600, icon: "🌍" });
    } catch {
      toast.error("Error de red al compartir el escenario");
    } finally {
      setCompartiendo(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-2 sm:px-4">
      <HeroOro panel="laboratorio" />

      {/* banner de conexión con el Espejo */}
      <motion.div
        className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-sky-400/25 bg-sky-400/6 px-4 py-3"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      >
        <Link2 className="h-4 w-4 text-sky-300" />
        <span className="text-[11px] font-black uppercase tracking-widest text-sky-300">
          conectado a EL ESPEJO · geometría real del frente del Karsk
        </span>
        {vengoDelEspejo && (
          <span className="rounded-full border border-sky-400/50 bg-sky-400/15 px-2 py-0.5 text-[9px] font-black tracking-wider text-sky-200">
            importado del espejo
          </span>
        )}
        <span className="ml-auto rounded-full border border-amber-400/50 bg-amber-400/10 px-2.5 py-1 text-[9px] font-black tracking-wider text-amber-300">
          SIMULACIÓN · NO ES PREDICCIÓN
        </span>
      </motion.div>

      {/* PASO 1 — la crisis */}
      <div className="mt-4 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-400/20 text-[11px] font-black text-sky-300">1</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">elige el mundo del espejo</span>
      </div>
      <div className="vg-chips mt-2 flex gap-2 overflow-x-auto pb-1">
        {LAB_ESCENARIOS.map((c, i) => {
          const activa = c.id === crisisId;
          return (
            <motion.button
              key={c.id}
              onClick={() => { setCrisisId(c.id); setResultado(null); setPerturbacion(null); setVengoDelEspejo(false); }}
              className={cn(
                "shrink-0 rounded-xl border px-3 py-2 text-left transition active:scale-95",
                activa ? "border-sky-400/60 bg-sky-400/10" : "border-white/12 bg-white/5 hover:border-white/25",
              )}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            >
              <div className="text-[12px] font-black text-white/90">{c.nombre}</div>
              <div className="text-[9px] font-semibold text-white/40">{c.region}</div>
              <div className="mt-1 flex items-center gap-1.5">
                <div className="h-1 w-14 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500" style={{ width: `${c.tensionBase}%` }} />
                </div>
                <span className="text-[9px] font-black text-orange-300">tensión {c.tensionBase}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* PASO 2 — la perturbación */}
      <div className="mt-4 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-400/20 text-[11px] font-black text-sky-300">2</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">aplica la perturbación — ¿y si...?</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        {PERTURBACIONES.map((p, i) => {
          const activa = p.id === perturbacion;
          return (
            <motion.button
              key={p.id}
              onClick={() => { setPerturbacion(activa ? null : p.id); setResultado(null); }}
              className={cn(
                "rounded-xl border p-2.5 text-left transition active:scale-[0.97]",
                activa ? "bg-white/[0.07]" : "border-white/10 bg-white/[0.03] hover:border-white/25",
              )}
              style={activa ? { borderColor: `${p.color}99`, boxShadow: `0 0 18px ${p.color}33` } : undefined}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: p.color }} />
                <span className="text-[11px] font-black leading-tight" style={{ color: activa ? p.color : "rgba(255,255,255,0.85)" }}>{p.nombre}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-[9.5px] leading-snug text-white/45">{p.descripcion}</p>
            </motion.button>
          );
        })}
      </div>

      {/* dosis + horizonte + correr */}
      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/12 bg-black/40 p-4 md:flex-row md:items-end">
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/45">dosis de la perturbación</span>
            <span className="text-[13px] font-black text-sky-300">{dosis}/5</span>
          </div>
          <input
            type="range" min={1} max={5} step={1} value={dosis}
            onChange={(e) => setDosis(Number(e.target.value))}
            className="mt-1.5 w-full accent-sky-400"
          />
        </div>
        <div className="flex gap-1.5">
          {([90, 180, 240] as const).map((h) => (
            <button
              key={h}
              onClick={() => { setHorizonte(h); setResultado(null); }}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-[10px] font-black transition active:scale-95",
                horizonte === h ? "border-sky-400/60 bg-sky-400/15 text-sky-300" : "border-white/12 bg-white/5 text-white/55",
              )}
            >
              {h} DÍAS
            </button>
          ))}
        </div>
        <motion.button
          onClick={correr}
          disabled={calculando}
          className="v100-run relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3 text-[13px] font-black tracking-wide text-black shadow-lg shadow-sky-500/30 transition active:scale-95 disabled:opacity-60"
          whileTap={{ scale: 0.96 }}
        >
          {calculando ? <Gauge className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
          {calculando ? "SIMULANDO 24 MUNDOS…" : "SIMULAR ¿Y SI...?"}
        </motion.button>
      </div>

      {/* resumen del escenario */}
      <motion.div
        key={esc.id}
        className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Swords className="h-3.5 w-3.5" style={{ color: esc.A.acento }} />
          <span className="text-[11px] font-black" style={{ color: esc.A.acento }}>{esc.A.nombre}</span>
          <span className="text-[9px] font-black uppercase tracking-wider text-white/35">vs</span>
          <span className="text-[11px] font-black" style={{ color: esc.B.acento }}>{esc.B.nombre}</span>
          <span className="ml-auto text-[9px] font-semibold text-white/35">frente inicial del espejo: {esc.frenteBase}% bajo control de {esc.B.nombre.split(" ")[0]}</span>
        </div>
        <p className="mt-1.5 text-[12px] leading-relaxed text-white/65">{esc.resumen}</p>
      </motion.div>

      {/* TEATRO EN VIVO */}
      <AnimatePresence>
        {resultado && diaActual && (
          <motion.div
            className="mt-4 overflow-hidden rounded-2xl border border-white/12 bg-black/50"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
          >
            <div className="flex flex-wrap items-center gap-2 border-b border-white/8 px-4 py-2.5">
              <FlaskConical className="h-3.5 w-3.5 text-sky-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-300">teatro de simulación</span>
              <span className="text-[11px] font-black text-amber-100">DÍA {diaActual.dia}/{horizonte}</span>
              <span
                className="rounded-full border px-2 py-0.5 text-[9px] font-black tracking-wider"
                style={{ color: escaladaActual.color, borderColor: `${escaladaActual.color}66`, background: `${escaladaActual.color}14` }}
              >
                ESCALADA {escaladaActual.n} · {escaladaActual.nombre}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                {([1, 4, 12] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVelocidad(v)}
                    className={cn(
                      "rounded-md border px-1.5 py-0.5 text-[9px] font-black transition",
                      velocidad === v ? "border-sky-400/60 bg-sky-400/15 text-sky-300" : "border-white/12 text-white/45",
                    )}
                  >
                    ×{v}
                  </button>
                ))}
                <button
                  onClick={() => setReproduciendo((v) => !v)}
                  disabled={terminado}
                  className="rounded-md border border-white/15 bg-white/5 p-1 text-white/70 transition hover:text-white disabled:opacity-40"
                >
                  {reproduciendo ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => { setDiaIdx(resultado.serie.length - 1); setReproduciendo(false); }}
                  disabled={terminado}
                  className="rounded-md border border-white/15 bg-white/5 p-1 text-white/70 transition hover:text-white disabled:opacity-40"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
              {/* mapa */}
              <div className="relative border-b border-white/8 lg:border-b-0 lg:border-r">
                <svg viewBox={`0 0 ${TEATRO_W} 420`} className="block h-auto w-full">
                  <defs>
                    <linearGradient id="v100-a" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={esc.A.acento} stopOpacity="0.16" />
                      <stop offset="100%" stopColor={esc.A.acento} stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="v100-b" x1="1" y1="0" x2="0" y2="0">
                      <stop offset="0%" stopColor={esc.B.acento} stopOpacity="0.16" />
                      <stop offset="100%" stopColor={esc.B.acento} stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* rejilla táctica */}
                  {Array.from({ length: 8 }, (_, i) => (
                    <line key={`h${i}`} x1="0" x2={TEATRO_W} y1={i * 60} y2={i * 60} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  ))}
                  {Array.from({ length: 10 }, (_, i) => (
                    <line key={`v${i}`} y1="0" y2="420" x1={i * 80} x2={i * 80} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  ))}
                  {/* zonas */}
                  <path d={`${pathD} L${TEATRO_W},420 L0,420 Z`} fill="url(#v100-b)" />
                  <path d={`${pathD} L0,420 L0,0 L${TEATRO_W},0 Z`} fill="url(#v100-a)" />
                  {/* línea del frente (geometría real del Espejo) */}
                  <path d={pathD} fill="none" stroke="#FFC94D" strokeWidth="3" strokeLinecap="round" strokeDasharray="10 6" opacity="0.95" />
                  <path d={pathD} fill="none" stroke="#FFC94D" strokeWidth="9" opacity="0.14" />
                  {/* pines del escenario: capital A, capital B, frente, clave */}
                  {esc.pins.map((p, i) => (
                    <g key={i}>
                      <circle
                        cx={(p.x / 100) * TEATRO_W}
                        cy={(p.y / 100) * 420}
                        r={p.tipo === "capital" ? 7 : 5}
                        fill={p.tipo === "frente" ? "#FFC94D" : p.tipo === "clave" ? "#B48CFF" : i === 0 ? esc.A.acento : esc.B.acento}
                        opacity="0.9"
                      />
                      {p.tipo === "capital" && (
                        <circle cx={(p.x / 100) * TEATRO_W} cy={(p.y / 100) * 420} r={12} fill="none" stroke={i === 0 ? esc.A.acento : esc.B.acento} strokeWidth="1.5" opacity="0.5" />
                      )}
                    </g>
                  ))}
                  <text x="12" y="24" fontSize="15" fontWeight="900" fill={esc.A.acento} opacity="0.75">ZONA {esc.A.nombre.split(" ")[0].toUpperCase()}</text>
                  <text x={TEATRO_W - 12} y="24" fontSize="15" fontWeight="900" fill={esc.B.acento} opacity="0.75" textAnchor="end">ZONA {esc.B.nombre.split(" ")[0].toUpperCase()}</text>
                </svg>
                {/* contadores sobre el mapa */}
                <div className="grid grid-cols-2 gap-3 px-4 pb-4 pt-1 sm:grid-cols-4">
                  <ContadorBar label="frente B" valor={`${Math.round(diaActual.frente)}%`} color="#FF6B5A" pct={diaActual.frente} />
                  <ContadorBar label={`bajas ${esc.A.nombre.split(" ")[0]}`} valor={diaActual.bajasA >= 1000 ? `${(diaActual.bajasA / 1000).toFixed(1)}k` : `${Math.round(diaActual.bajasA)}`} color={esc.A.acento} />
                  <ContadorBar label={`bajas ${esc.B.nombre.split(" ")[0]}`} valor={diaActual.bajasB >= 1000 ? `${(diaActual.bajasB / 1000).toFixed(1)}k` : `${Math.round(diaActual.bajasB)}`} color={esc.B.acento} />
                  <ContadorBar label="coste" valor={`$${diaActual.coste.toFixed(1)}B`} color="#FFD166" pct={diaActual.coste * 2} />
                </div>
              </div>

              {/* panel derecho: moral/suministro + escalera + timeline */}
              <div className="flex flex-col p-4">
                <div className="grid grid-cols-2 gap-3">
                  <ContadorBar label={`moral ${esc.A.nombre.split(" ")[0]}`} valor={`${Math.round(diaActual.moralA * 100)}`} color="#4DFFC4" pct={diaActual.moralA * 100} />
                  <ContadorBar label={`moral ${esc.B.nombre.split(" ")[0]}`} valor={`${Math.round(diaActual.moralB * 100)}`} color="#FF8A3D" pct={diaActual.moralB * 100} />
                  <ContadorBar label={`suministro ${esc.A.nombre.split(" ")[0]}`} valor={`${Math.round(diaActual.suministroA * 100)}`} color="#3DDCFF" pct={diaActual.suministroA * 100} />
                  <ContadorBar label={`suministro ${esc.B.nombre.split(" ")[0]}`} valor={`${Math.round(diaActual.suministroB * 100)}`} color="#FFD166" pct={diaActual.suministroB * 100} />
                </div>

                {/* escalera de escalada */}
                <div className="mt-3 flex gap-1">
                  {NIVELES_ESCALADA.map((n) => {
                    const activa = n.n <= diaActual.escalada;
                    return (
                      <motion.div
                        key={n.n}
                        className="flex-1 rounded-md border text-center"
                        style={{
                          borderColor: activa ? n.color : "rgba(255,255,255,0.1)",
                          background: activa ? `${n.color}22` : "rgba(255,255,255,0.02)",
                        }}
                        animate={diaActual.escalada === n.n ? { boxShadow: [`0 0 0px ${n.color}00`, `0 0 12px ${n.color}66`, `0 0 0px ${n.color}00`] } : {}}
                        transition={{ repeat: Infinity, duration: 1.6 }}
                      >
                        <div className="py-1 text-[8px] font-black leading-tight" style={{ color: activa ? n.color : "rgba(255,255,255,0.3)" }}>
                          {n.n}·{n.nombre.split(" ")[0]}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* línea temporal */}
                <div className="mt-3 flex items-center gap-1.5">
                  <Radio className="h-3 w-3 text-white/40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/45">línea temporal en vivo</span>
                  <span className="text-[9px] font-black text-white/30">{eventosHasta.length} eventos</span>
                </div>
                <div ref={timelineRef} className="v100-timeline mt-1.5 max-h-44 flex-1 space-y-1.5 overflow-y-auto pr-1">
                  <AnimatePresence initial={false}>
                    {eventosHasta.slice(-14).map((ev, i) => (
                      <motion.div
                        key={`${ev.dia}-${i}-${ev.texto.slice(0, 12)}`}
                        className="rounded-lg border-l-2 bg-white/[0.04] px-2 py-1.5"
                        style={{ borderColor: ev.color }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <span className="text-[8px] font-black" style={{ color: ev.color }}>DÍA {ev.dia}</span>
                        <p className="text-[10.5px] font-semibold leading-snug text-white/75">{ev.texto}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {eventosHasta.length === 0 && (
                    <p className="py-4 text-center text-[10px] font-semibold text-white/30">sin eventos todavía — la guerra respira</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULTADOS FINALES */}
      <AnimatePresence>
        {resultado && terminado && (
          <motion.div
            className="mt-4 space-y-3"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          >
            {/* estado final */}
            <div
              className="rounded-2xl border p-4"
              style={{
                borderColor: `${resultado.fin.ganador === "B" ? esc.B.acento : resultado.fin.ganador === "A" ? esc.A.acento : resultado.fin.ganador === "N" ? "#FF0055" : "#A78BFA"}55`,
                background: `linear-gradient(135deg, ${resultado.fin.ganador === "B" ? esc.B.acento : resultado.fin.ganador === "A" ? esc.A.acento : resultado.fin.ganador === "N" ? "#FF0055" : "#A78BFA"}12, transparent 60%), #0b0b11`,
              }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Landmark className="h-4 w-4 text-amber-200" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">estado final · día {resultado.fin.dia}</span>
                <span className="ml-auto rounded-full border border-amber-400/50 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black tracking-wider text-amber-300">
                  SIMULACIÓN · NO ES PREDICCIÓN
                </span>
              </div>
              <h3 className="mt-1 text-xl font-black text-amber-100">{resultado.fin.nombre}</h3>
              <p className="text-[13px] text-white/70">{resultado.fin.detalle}</p>
              <p className="mt-2 rounded-xl bg-white/[0.04] px-3 py-2 text-[11.5px] leading-relaxed text-white/60">
                {resumenLab(resultado, esc, { crisisId, perturbacion: (perturbacion ?? "alto-fuego") as ConfigLab["perturbacion"], dosis, horizonte })}
              </p>
            </div>

            {/* LO QUE CAMBIA vs línea base */}
            <div className="rounded-2xl border border-sky-400/25 bg-sky-400/5 p-4">
              <div className="flex items-center gap-2">
                <GitCompareArrows className="h-4 w-4 text-sky-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-sky-300">lo que cambia · con vs sin tu perturbación</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { l: "frente final", v: resultado.deltas.frenteFinal, unidad: "pts", inv: false },
                  { l: "bajas combinadas", v: resultado.deltas.bajas, unidad: "%", inv: true },
                  { l: "coste de guerra", v: resultado.deltas.coste, unidad: "%", inv: true },
                  { l: "duración", v: resultado.deltas.duracion, unidad: "días", inv: true },
                ].map((d) => {
                  const positivo = d.v > 0;
                  const bueno = d.inv ? !positivo : !positivo; // menos siempre "mejor" en rojo
                  const Icono = d.v === 0 ? ArrowRight : d.v > 0 ? ArrowUpRight : ArrowDownRight;
                  return (
                    <div key={d.l} className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                      <div className="flex items-center gap-1.5">
                        <Icono className={cn("h-3.5 w-3.5", d.v === 0 ? "text-white/40" : bueno ? "text-emerald-300" : "text-red-300")} />
                        <span className="text-[9px] font-black uppercase tracking-wider text-white/45">{d.l}</span>
                      </div>
                      <div className={cn("mt-0.5 text-[15px] font-black", d.v === 0 ? "text-white/60" : bueno ? "text-emerald-300" : "text-red-300")}>
                        {d.v > 0 ? "+" : ""}{d.v}{d.unidad}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monte Carlo + proyección neuronal */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/12 bg-black/40 p-4">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-amber-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">monte carlo · 24 mundos</span>
                </div>
                <div className="mt-3 space-y-2">
                  {resultado.monteCarlo.filter((m) => m.probabilidad > 0).sort((a, b) => b.probabilidad - a.probabilidad).map((m, i) => (
                    <div key={m.nombre}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10.5px] font-bold text-white/70">{m.nombre}</span>
                        <span className="text-[11px] font-black text-amber-200">{m.probabilidad}%</span>
                      </div>
                      <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: m.ganador === "B" ? esc.B.acento : m.ganador === "A" ? esc.A.acento : m.ganador === "N" ? "#FF0055" : m.ganador === "P" ? "#A78BFA" : "#FFC94D" }}
                          initial={{ width: 0 }} animate={{ width: `${m.probabilidad}%` }} transition={{ delay: i * 0.08, duration: 0.7, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-violet-400/25 bg-violet-400/6 p-4">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-violet-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-violet-300">proyección del núcleo neuronal v4</span>
                  <span className="ml-auto rounded-full bg-violet-400/15 px-2 py-0.5 text-[9px] font-black text-violet-200">{resultado.proyeccion.horizonte}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {resultado.proyeccion.escenarios.slice(0, 3).map((e, i) => (
                    <div key={e.nombre}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10.5px] font-bold text-white/75">{e.nombre}</span>
                        <span className="text-[11px] font-black text-violet-200">{e.probabilidad}%</span>
                      </div>
                      <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                          initial={{ width: 0 }} animate={{ width: `${e.probabilidad}%` }} transition={{ delay: i * 0.08, duration: 0.7 }} />
                      </div>
                      {i === 0 && <p className="mt-1 text-[9.5px] font-semibold text-violet-200/60">señal: {e.señal}</p>}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setPasosAbiertos((v) => !v)}
                  className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-lg border border-violet-400/30 bg-violet-400/10 py-1.5 text-[10px] font-black text-violet-200 transition hover:bg-violet-400/20"
                >
                  razonamiento de la red <ChevronDown className={cn("h-3 w-3 transition-transform", pasosAbiertos && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {pasosAbiertos && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-2 space-y-1 rounded-lg bg-black/40 p-2.5">
                        {resultado.proyeccion.pasos.map((p, i) => (
                          <p key={i} className="text-[10px] leading-snug text-violet-100/70">· {p}</p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* factores */}
            <div className="rounded-2xl border border-white/12 bg-black/40 p-4">
              <div className="flex items-center gap-2">
                <Users2 className="h-4 w-4 text-white/50" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">factores del motor · desglose explicable</span>
              </div>
              <div className="mt-3 grid gap-2.5 md:grid-cols-2">
                {resultado.factores.map((f, i) => (
                  <motion.div key={f.nombre} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-black" style={{ color: f.color }}>{f.nombre}</span>
                      <span className="text-[10px] font-black text-white/50">{f.peso}</span>
                    </div>
                    <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div className="h-full rounded-full" style={{ background: f.color }}
                        initial={{ width: 0 }} animate={{ width: `${Math.min(100, f.peso)}%` }} transition={{ delay: i * 0.06, duration: 0.6 }} />
                    </div>
                    <p className="mt-0.5 text-[9.5px] leading-snug text-white/40">{f.nota}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* acciones */}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              <button
                onClick={() => navigateTo("espejo" as never)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-red-400/40 bg-red-400/10 px-3 py-2.5 text-[11px] font-black text-red-200 transition hover:bg-red-400/20 active:scale-95"
              >
                <Link2 className="h-3.5 w-3.5" /> ABRIR EN EL ESPEJO
              </button>
              <button
                onClick={() => navigateTo("maquina" as never)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2.5 text-[11px] font-black text-amber-200 transition hover:bg-amber-400/20 active:scale-95"
              >
                <Wallet className="h-3.5 w-3.5" /> VER CRONOLOGÍA
              </button>
              <button
                onClick={copiarInforme}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[11px] font-black text-white/70 transition hover:bg-white/10 active:scale-95"
              >
                <Copy className="h-3.5 w-3.5" /> COPIAR INFORME
              </button>
              <button
                onClick={compartir}
                disabled={compartiendo}
                className="v101-cta flex items-center justify-center gap-1.5 rounded-xl border border-[#FFC94D]/50 bg-[#FFC94D]/12 px-3 py-2.5 text-[11px] font-black text-[#FFC94D] transition hover:bg-[#FFC94D]/22 active:scale-95 disabled:opacity-50"
              >
                <Share2 className="h-3.5 w-3.5" /> {compartiendo ? "PUBLICANDO…" : "COMPARTIR CON LA COMUNIDAD"}
              </button>
              <button
                onClick={() => { setResultado(null); setDiaIdx(0); setPerturbacion(null); }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-sky-400/40 bg-sky-400/10 px-3 py-2.5 text-[11px] font-black text-sky-200 transition hover:bg-sky-400/20 active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5" /> NUEVA SIMULACIÓN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-4 text-center text-[10px] font-semibold text-white/25">
        El laboratorio simula con datos del mundo Vanguard (SIM). El motor — factores múltiples, atrición, logística,
        escalera de escalada y Monte Carlo de 24 semillas — es el valor didáctico: entender cómo un solo cambio
        desplaza un frente entero. Nada de esto predice el mundo real.
      </p>
      <div className="mt-1 flex items-center justify-center gap-1.5 text-[9px] font-bold text-white/20">
        <ArrowLeft className="h-3 w-3" /> motor v100 · 8 perturbaciones · 24 mundos · escalera 1-6 <ArrowRight className="h-3 w-3" />
      </div>
    </div>
  );
}
