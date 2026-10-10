"use client";

// v101.0 EL REGRESO — PILAR 2: EL USUARIO PROGRESA (panel)
// PERFIL DE ANALISTA: nivel, ELO, 14 insignias y retos semanales — todo
// computado de acciones reales. El progreso tiene sentido, no solo números:
// cada insignia cuenta lo que HICISTE y cada reto semanal te manda a
// investigar algo concreto del mundo Vanguard.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, Trophy, FolderOpen, Archive, Eye, BookLock, FlaskConical, Gauge,
  BrainCircuit, PenTool, Sparkles, Share2, Brain, Medal, Target, Zap, Check,
} from "lucide-react";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { useGameStore } from "@/lib/game-store";
import {
  useAnalista, insigniasDe, retosDeSemana, RANGOS_ANALISTA, XP_NIVEL,
  type Insignia, type RetoSemanal,
} from "@/lib/analista";
import { toast } from "sonner";
import { navigateTo } from "@/lib/nav";
import { useT } from "@/lib/i18n";

const ICONO_INSIGNIA: Record<string, React.ReactNode> = {
  FolderOpen: <FolderOpen className="h-4 w-4" />, Archive: <Archive className="h-4 w-4" />,
  Eye: <Eye className="h-4 w-4" />, BookLock: <BookLock className="h-4 w-4" />,
  FlaskConical: <FlaskConical className="h-4 w-4" />, Gauge: <Gauge className="h-4 w-4" />,
  BrainCircuit: <BrainCircuit className="h-4 w-4" />, PenTool: <PenTool className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />, Share2: <Share2 className="h-4 w-4" />,
  Brain: <Brain className="h-4 w-4" />, GraduationCap: <GraduationCap className="h-4 w-4" />,
  Trophy: <Trophy className="h-4 w-4" />, Medal: <Medal className="h-4 w-4" />,
};

export function AnalistaPanel() {
  const { t } = useT();
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const a = useAnalista();
  const [, fuerza] = useState(0); // re-render tras hidratar
  useEffect(() => {
    const un = useAnalista.persist.onFinishHydration(() => fuerza((v) => v + 1));
    return un;
  }, []);

  const nivel = a.nivel();
  const rango = a.rango();
  const elo = a.elo();
  const tier = a.tier();
  const pct = Math.round(a.progresoNivel() * 100);
  const insignias = useMemo(() => insigniasDe(a), [a]);
  const retos = useMemo(() => retosDeSemana(a.weekKey), [a.weekKey]);
  const desbloqueadas = insignias.filter((i) => i.valor >= i.meta).length;

  const reclamar = (r: RetoSemanal) => {
    const rw = useAnalista.getState().claimReto(r.id);
    if (!rw) return;
    addCoins(rw.coins, `RETO SEMANAL: ${r.titulo}`);
    addXp(Math.round(rw.xpa / 2));
    useAnalista.getState().addXpa(rw.xpa);
    toast.success(`RETO COMPLETADO: ${r.titulo} · +${rw.coins}ⓒ +${rw.xpa} XPA`, { duration: 3200, icon: "🏅" });
    fuerza((v) => v + 1);
  };

  const siguienteRango = RANGOS_ANALISTA.find((r) => r.n === nivel + 1);

  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-2 sm:px-4">
      <HeroOro panel="analista" />

      {/* TARJETA PRINCIPAL: nivel + ELO */}
      <motion.div
        className="v101-panel mt-3 grid gap-4 rounded-2xl border border-[#f5c542]/25 bg-gradient-to-br from-[#f5c542]/8 via-transparent to-transparent p-4 md:grid-cols-[1fr_auto]"
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#f5c542]/40 bg-[#f5c542]/10">
              <GraduationCap className="h-6 w-6 text-[#f5c542]" />
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-white/40">{t("analista.nivel")} {nivel}/30</div>
              <div className="font-orbitron text-xl font-black tracking-wide" style={{ color: rango.acento }}>{rango.nombre}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[9px] font-black uppercase tracking-widest text-white/40">ELO {t("analista.de")}</div>
              <div className="font-orbitron text-2xl font-black tabular-nums" style={{ color: tier.acento }}>{elo}</div>
              <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: tier.acento }}>{tier.nombre}</div>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#c98a10] via-[#f5c542] to-[#ffe08a]"
              initial={{ width: 0 }} animate={{ width: `${Math.max(3, pct)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-white/40">
            <span>{a.xpa} / {(nivel) * XP_NIVEL} XPA</span>
            {siguienteRango && <span>{t("analista.siguiente")}: <span style={{ color: siguienteRango.acento }}>{siguienteRango.nombre}</span></span>}
          </div>
          <p className="mt-2 text-[10px] leading-snug text-white/45">{t("analista.notaReal")}</p>
        </div>

        {/* contadores honestos */}
        <div className="grid grid-cols-3 gap-1.5 md:grid-cols-2">
          <Contador n={a.exped} label="expedientes" />
          <Contador n={a.oscura} label="oscura" />
          <Contador n={a.lab} label="sims lab" />
          <Contador n={a.mente} label="análisis" />
          <Contador n={a.crea} label="obras" />
          <Contador n={a.quizOk} label="aciertos" />
        </div>
      </motion.div>

      {/* RETOS SEMANALES */}
      <motion.div className="mt-4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}>
        <div className="mb-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-[#FFD166]" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#FFD166]">{t("analista.retos")}</span>
          <span className="ml-auto rounded-full border border-[#FFD166]/40 bg-[#FFD166]/10 px-2 py-0.5 text-[9px] font-black text-[#FFD166]">
            {t("analista.cierra")} {a.diasRestantes()}d
          </span>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {retos.map((r, i) => {
            const prog = Math.min(a.progreso[r.tipo] || 0, r.meta);
            const listo = prog >= r.meta;
            const cobrado = a.claimed.includes(r.id);
            return (
              <motion.div
                key={r.id}
                className={`rounded-xl border p-3 ${listo && !cobrado ? "border-[#FFD166]/50 bg-[#FFD166]/8 v101-listo" : "border-white/8 bg-black/35"}`}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <Zap className={`h-3.5 w-3.5 ${listo ? "text-[#FFD166]" : "text-white/30"}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/80">{r.titulo}</span>
                  {cobrado && <Check className="ml-auto h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <p className="mt-1 text-[10px] leading-snug text-white/50">{r.desc}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    className={`h-full rounded-full ${listo ? "bg-[#FFD166]" : "bg-sky-400/80"}`}
                    initial={{ width: 0 }} animate={{ width: `${(prog / r.meta) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-white/40">{prog}/{r.meta} · +{r.coins}ⓒ +{r.xpa} XPA</span>
                  {listo && !cobrado && (
                    <button
                      onClick={() => reclamar(r)}
                      className="v101-cta rounded-lg border border-[#FFD166]/60 bg-[#FFD166]/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#FFD166] transition hover:bg-[#FFD166]/25 active:scale-95"
                    >
                      {t("analista.reclamar")}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* INSIGNIAS */}
      <motion.div className="mt-4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.14 }}>
        <div className="mb-2 flex items-center gap-2">
          <Medal className="h-4 w-4 text-[#f5c542]" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#f5c542]">{t("analista.insignias")}</span>
          <span className="ml-auto text-[9px] font-mono text-white/40">{desbloqueadas}/{insignias.length}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {insignias.map((ins, i) => (
            <InsigniaCard key={ins.id} ins={ins} idx={i} />
          ))}
        </div>
      </motion.div>

      {/* ATAJO: el mundo te espera */}
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          { tab: "expedientes", label: t("analista.irExped"), color: "#A855F7" },
          { tab: "laboratorio", label: t("analista.irLab"), color: "#38BDF8" },
          { tab: "mente", label: t("analista.irMente"), color: "#BEF264" },
          { tab: "creador", label: t("analista.irCrea"), color: "#22D3EE" },
        ].map((x) => (
          <button
            key={x.tab}
            onClick={() => navigateTo(x.tab as never)}
            className="rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase tracking-wider transition hover:brightness-125 active:scale-95"
            style={{ color: x.color, borderColor: `${x.color}44`, background: `${x.color}0d` }}
          >
            {x.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-[10px] font-semibold text-white/25">{t("analista.pie")}</p>
    </div>
  );
}

function Contador({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-black/35 px-2 py-1.5 text-center">
      <div className="font-orbitron text-base font-black tabular-nums text-white/85">{n}</div>
      <div className="text-[8px] font-black uppercase tracking-wider text-white/35">{label}</div>
    </div>
  );
}

function InsigniaCard({ ins, idx }: { ins: Insignia; idx: number }) {
  const lograda = ins.valor >= ins.meta;
  const pct = Math.min(100, Math.round((ins.valor / ins.meta) * 100));
  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border p-2.5 ${lograda ? "v101-entra" : "border-white/8 bg-black/35 opacity-75"}`}
      style={lograda ? { borderColor: `${ins.acento}55`, background: `${ins.acento}0f` } : undefined}
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(idx * 0.03, 0.5), duration: 0.35 }}
      whileHover={{ scale: 1.02 }}
    >
      {lograda && <div className="v101-brillo absolute inset-x-0 top-0 h-px" aria-hidden />}
      <div className="flex items-center gap-2">
        <span className={lograda ? "" : "text-white/25"} style={lograda ? { color: ins.acento } : undefined}>
          {ICONO_INSIGNIA[ins.icono] ?? <Sparkles className="h-4 w-4" />}
        </span>
        <span className={`text-[9px] font-black uppercase tracking-wider ${lograda ? "text-white/90" : "text-white/35"}`}>{ins.nombre}</span>
        {lograda && <Check className="ml-auto h-3 w-3 flex-shrink-0" style={{ color: ins.acento }} />}
      </div>
      <p className="mt-1 text-[9px] leading-snug text-white/40">{ins.desc}</p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8">
        <motion.div
          className="h-full rounded-full"
          style={{ background: lograda ? ins.acento : "#3EA6FF88" }}
          initial={{ width: 0 }} animate={{ width: `${Math.max(2, pct)}%` }}
          transition={{ duration: 0.7, delay: idx * 0.03 }}
        />
      </div>
      <div className="mt-0.5 text-right text-[8px] font-mono text-white/30">{Math.min(ins.valor, ins.meta)}/{ins.meta}</div>
    </motion.div>
  );
}
