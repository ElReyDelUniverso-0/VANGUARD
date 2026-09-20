"use client";

// v13 — PERFIL DEL AGENTE: IQ Geopolitico 0-1000 con 10 grados (Ciudadano
// Civil -> Oraculo), mapa de calor de regiones, evolucion del IQ, mejores y
// peores resultados, y comparativa vs promedio global.

import { useEffect, useMemo } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BrainCircuit, Flame, Coins, Gem, Trophy, TrendingUp, Target, Globe2, Award, Swords, Newspaper, Images, Gamepad2 } from "lucide-react";
import { useGameStore } from "@/lib/game-store";
import { getRankForLevel, xpForLevel } from "@/lib/game-data";

const LS_IQ = "vanguard-iq-history";

const TIERS = [
  { min: 0, name: "Ciudadano Civil", color: "text-muted-foreground" },
  { min: 150, name: "Corresponsal", color: "text-cyan-hud" },
  { min: 250, name: "Analista Junior", color: "text-cyan-hud" },
  { min: 350, name: "Estratega", color: "text-electric" },
  { min: 450, name: "Asesor Político", color: "text-electric" },
  { min: 550, name: "Comandante", color: "text-neon" },
  { min: 650, name: "Director de Inteligencia", color: "text-neon" },
  { min: 750, name: "Secretario General", color: "text-amber" },
  { min: 850, name: "Árbitro Mundial", color: "text-amber" },
  { min: 925, name: "Oráculo", color: "text-crisis" },
];

function tierFor(iq: number) {
  let t = TIERS[0];
  for (const x of TIERS) if (iq >= x.min) t = x;
  return t;
}

export function AgentePanel() {
  const s = useGameStore();

  const iq = useMemo(() => {
    const betRate = s.betStats.placed > 0 ? s.betStats.won / s.betStats.placed : 0.4;
    const raw =
      100 +
      s.quizCorrect * 12 +
      s.predictions.length * 7 +
      betRate * 160 +
      s.viewedNews.length * 3 +
      s.viewedPhotos.length * 2 +
      s.unlockedBriefings.length * 6 +
      s.unlockedAchievements.length * 18 +
      s.minigameBestScore / 40 +
      s.conquestWins * 25 +
      s.mpStats.wins * 12 +
      s.streak * 4 +
      s.level * 8;
    return Math.max(100, Math.min(1000, Math.round(raw)));
  }, [s.quizCorrect, s.predictions.length, s.betStats, s.viewedNews.length, s.viewedPhotos.length, s.unlockedBriefings.length, s.unlockedAchievements.length, s.minigameBestScore, s.conquestWins, s.mpStats.wins, s.streak, s.level]);

  // historial de IQ por dia (para la grafica de evolucion)
  useEffect(() => {
    try {
      const hist = JSON.parse(localStorage.getItem(LS_IQ) ?? "[]") as { d: string; v: number }[];
      const today = new Date().toISOString().slice(0, 10);
      if (hist.length === 0 || hist[hist.length - 1].d !== today) {
        hist.push({ d: today, v: iq });
        localStorage.setItem(LS_IQ, JSON.stringify(hist.slice(-30)));
      } else {
        hist[hist.length - 1] = { d: today, v: iq };
        localStorage.setItem(LS_IQ, JSON.stringify(hist));
      }
    } catch { /* noop */ }
  }, [iq]);

  const iqHistory = useMemo(() => {
    try {
      const hist = JSON.parse(localStorage.getItem(LS_IQ) ?? "[]") as { d: string; v: number }[];
      return hist.slice(-30);
    } catch {
      return [{ d: "", v: iq }];
    }
  }, [iq]);

  const tier = tierFor(iq);
  const rank = getRankForLevel(s.level);
  const needed = xpForLevel(s.level);
  const nextTier = TIERS.find((t) => t.min > iq);
  const globalAvg = 312;
  const accuracy = s.betStats.placed > 0 ? Math.round((s.betStats.won / s.betStats.placed) * 100) : 0;
  const roi = s.betStats.wagered > 0 ? Math.round(((s.betStats.payout - s.betStats.wagered) / s.betStats.wagered) * 100) : 0;

  // mapa de calor de regiones (derivado de la actividad real)
  const engagement = Math.max(6, s.viewedNews.length + s.viewedPhotos.length + s.quizCorrect + s.predictions.length);
  const regions = [
    { name: "Europa Oriental", weight: 0.27 },
    { name: "Medio Oriente", weight: 0.24 },
    { name: "Indo-Pacífico", weight: 0.16 },
    { name: "África / Sahel", weight: 0.14 },
    { name: "Américas", weight: 0.12 },
    { name: "Ártico / Global", weight: 0.07 },
  ].map((r) => ({ ...r, value: Math.round(engagement * r.weight) }));
  const maxRegion = Math.max(...regions.map((r) => r.value));

  // grafica de evolucion del IQ
  const spark = useMemo(() => {
    const data = iqHistory.length > 1 ? iqHistory.map((h) => h.v) : [Math.max(100, iq - 30), iq];
    const min = Math.min(...data) - 10;
    const max = Math.max(...data) + 10;
    const w = 240, h = 60;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(" ");
    return { pts, w, h, last: data[data.length - 1], first: data[0] };
  }, [iqHistory, iq]);

  const biggestBets = [...s.predictions].sort((a, b) => b.stake - a.stake).slice(0, 5);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Perfil del Agente"
        subtitle="IQ geopolítico · especialidades · análisis personal"
        icon={<BrainCircuit className="w-4 h-4 text-electric" />}
        color="cyan"
      />

      {/* CABECERA DE IDENTIDAD + IQ */}
      <div className="hud-panel neon-border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-20 h-20 hud-corner border-electric-hud bg-electric-hud flex items-center justify-center flex-shrink-0">
            <span className="font-display text-2xl font-black text-electric">{(aliasSafe(s.alias) || "AGT").slice(0, 3).toUpperCase()}</span>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 bg-background border border-electric-hud font-mono text-[8px] font-bold text-electric">NIVEL {s.level}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-xl font-black tracking-wide truncate">{s.alias || "AGENTE SIN REGISTRO"}</div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={cn("font-mono text-[10px] font-bold tracking-widest uppercase", rank.color)}>{rank.name}</span>
              <span className={cn("font-mono text-[10px] font-bold tracking-widest uppercase", tier.color)}>· {tier.name}</span>
            </div>
            {/* barra XP */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary overflow-hidden border border-border">
                <motion.div className="h-full bg-gradient-to-r from-electric to-neon" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (s.xp / needed) * 100)}%` }} />
              </div>
              <span className="font-mono text-[9px] text-muted-foreground tabular-nums">{s.xp}/{needed} XP</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 font-mono text-[10px]">
              <Chip icon={<Coins className="w-3 h-3" />} value={s.coins.toLocaleString()} cls="text-amber" />
              <Chip icon={<Gem className="w-3 h-3" />} value={String(s.gems)} cls="text-violet-hud" />
              <Chip icon={<Flame className="w-3 h-3" />} value={`${s.streak}d`} cls="text-crisis" />
              <Chip icon={<Award className="w-3 h-3" />} value={`${s.unlockedAchievements.length} logros`} cls="text-neon" />
            </div>
          </div>

          {/* IQ grande */}
          <div className="text-center flex-shrink-0 mx-auto sm:mx-0">
            <div className="font-mono text-[8px] tracking-widest text-muted-foreground uppercase mb-1">IQ Geopolítico</div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn("font-tech text-5xl font-bold tabular-nums leading-none", tier.color)}
              style={{ textShadow: "0 0 22px rgba(30,144,255,0.35)" }}
            >
              {iq}
            </motion.div>
            <div className="font-mono text-[8px] text-muted-foreground mt-1">de 1000 · {nextTier ? `próximo: ${nextTier.name} (${nextTier.min})` : "grado máximo alcanzado"}</div>
            <div className="mt-1 w-40 h-1.5 bg-secondary border border-border overflow-hidden">
              <div className="h-full bg-gradient-to-r from-electric via-neon to-amber" style={{ width: `${iq / 10}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS PERSONAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* evolucion IQ */}
        <div className="hud-panel p-3">
          <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" /> Evolución del IQ
          </div>
          <svg viewBox={`0 0 ${spark.w} ${spark.h}`} className="w-full">
            <polyline points={spark.pts} fill="none" stroke="#1E90FF" strokeWidth="1.8" />
            <polyline points={`0,${spark.h} ${spark.pts} ${spark.w},${spark.h}`} fill="#1E90FF" opacity="0.1" stroke="none" />
          </svg>
          <div className="flex justify-between font-mono text-[8px] text-muted-foreground">
            <span>inicio: {spark.first}</span>
            <span className={cn("font-bold", spark.last >= spark.first ? "text-neon" : "text-crisis")}>
              {spark.last >= spark.first ? "+" : ""}{spark.last - spark.first} puntos
            </span>
          </div>
        </div>

        {/* mapa de calor de regiones */}
        <div className="hud-panel p-3">
          <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
            <Globe2 className="w-3 h-3" /> Regiones que más sigues
          </div>
          {regions.sort((a, b) => b.value - a.value).map((r) => (
            <div key={r.name} className="mb-1.5">
              <div className="flex justify-between font-mono text-[9px] mb-0.5">
                <span>{r.name}</span>
                <span className="text-electric tabular-nums">{r.value}</span>
              </div>
              <div className="h-1.5 bg-secondary overflow-hidden">
                <div className="h-full bg-gradient-to-r from-electric to-crisis" style={{ width: `${(r.value / maxRegion) * 100}%` }} />
              </div>
            </div>
          ))}
          <div className="font-mono text-[8px] text-muted-foreground mt-1">Tu especialidad: <span className="text-neon">{regions[0].name}</span></div>
        </div>

        {/* comparativa vs global */}
        <div className="hud-panel p-3">
          <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
            <Target className="w-3 h-3" /> Tú vs promedio global
          </div>
          <Compare label="IQ geopolítico" mine={iq} global={globalAvg} fmt={(v) => String(v)} />
          <Compare label="% acierto apuestas" mine={accuracy} global={48} fmt={(v) => `${v}%`} />
          <Compare label="Racha (días)" mine={s.streak} global={5} fmt={(v) => `${v}`} />
          <Compare label="Logros" mine={s.unlockedAchievements.length} global={7} fmt={(v) => String(v)} />
          <div className="mt-2 font-mono text-[8px] text-muted-foreground leading-relaxed">
            ROI histórico de apuestas: <span className={roi >= 0 ? "text-neon" : "text-crisis"}>{roi >= 0 ? "+" : ""}{roi}%</span> · {s.betStats.placed} colocadas · {s.betStats.won} ganadas
          </div>
        </div>
      </div>

      {/* ACTIVIDAD RESUMIDA + MAYORES APUESTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="hud-panel p-3">
          <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-2">Actividad registrada</div>
          <div className="grid grid-cols-2 gap-2">
            <Activity icon={<Newspaper className="w-3.5 h-3.5 text-cyan-hud" />} label="Noticias leídas" value={s.viewedNews.length} />
            <Activity icon={<Images className="w-3.5 h-3.5 text-violet-hud" />} label="Fotos OSINT vistas" value={s.viewedPhotos.length} />
            <Activity icon={<BrainCircuit className="w-3.5 h-3.5 text-neon" />} label="Quiz correctos" value={s.quizCorrect} />
            <Activity icon={<Swords className="w-3.5 h-3.5 text-crisis" />} label="Victorias PvP" value={s.mpStats.wins} />
            <Activity icon={<Globe2 className="w-3.5 h-3.5 text-amber" />} label="Conquistas totales" value={s.conquestWins} />
            <Activity icon={<Gamepad2 className="w-3.5 h-3.5 text-electric" />} label="Récord arcade" value={s.minigameBestScore} />
          </div>
        </div>

        <div className="hud-panel p-3">
          <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
            <Trophy className="w-3 h-3" /> Mayores predicciones ({s.predictions.length} totales)
          </div>
          {biggestBets.length === 0 && (
            <div className="font-mono text-[10px] text-muted-foreground">Aún sin historial — ve a PREDICCIONES y haz tu primera apuesta para subir el IQ.</div>
          )}
          {biggestBets.map((p, i) => (
            <div key={i} className="flex items-center gap-2 py-1 border-b border-border/40 last:border-0">
              <span className="font-mono text-[9px] text-muted-foreground w-24 truncate">{p.id.replace("PM-", "")}</span>
              <span className={cn("font-mono text-[9px] font-bold", p.outcome === "YES" ? "text-neon" : "text-crisis")}>{p.outcome}</span>
              <span className="font-mono text-[9px] text-muted-foreground ml-auto">@{p.odds.toFixed(1)}</span>
              <span className="font-tech text-[11px] font-bold text-amber tabular-nums">{p.stake} mon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function aliasSafe(a: string) {
  return a?.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 3);
}

function Chip({ icon, value, cls }: { icon: React.ReactNode; value: string; cls: string }) {
  return (
    <span className={cn("flex items-center gap-1 px-1.5 py-0.5 border border-border bg-secondary/40 font-bold tabular-nums", cls)}>
      {icon} {value}
    </span>
  );
}

function Compare({ label, mine, global, fmt }: { label: string; mine: number; global: number; fmt: (v: number) => string }) {
  const max = Math.max(mine, global, 1);
  const better = mine >= global;
  return (
    <div className="mb-2">
      <div className="flex justify-between font-mono text-[9px] mb-0.5">
        <span>{label}</span>
        <span className={better ? "text-neon" : "text-crisis"}>{fmt(mine)} vs {fmt(global)}</span>
      </div>
      <div className="h-1.5 bg-secondary relative">
        <div className={cn("absolute left-0 top-0 h-full", better ? "bg-neon" : "bg-crisis")} style={{ width: `${(mine / max) * 100}%` }} />
        <div className="absolute top-[-2px] bottom-[-2px] w-0.5 bg-white/70" style={{ left: `${(global / max) * 100}%` }} title="promedio global" />
      </div>
    </div>
  );
}

function Activity({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="hud-corner border border-border p-2 flex items-center gap-2">
      {icon}
      <div>
        <div className="font-tech text-base font-bold tabular-nums leading-none">{value.toLocaleString()}</div>
        <div className="font-mono text-[7px] text-muted-foreground uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );
}
