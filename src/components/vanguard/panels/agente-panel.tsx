"use client";

// v13 — PERFIL DEL AGENTE: IQ Geopolitico 0-1000 con 10 grados (Ciudadano
// Civil -> Oraculo), mapa de calor de regiones, evolucion del IQ, mejores y
// peores resultados, y comparativa vs promedio global.

import { useEffect, useMemo } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BrainCircuit, Flame, Coins, Gem, Trophy, TrendingUp, Target, Globe2, Award, Swords, Newspaper, Images, Gamepad2, Medal } from "lucide-react";
import { useGameStore } from "@/lib/game-store";
import { getRankForLevel, xpForLevel } from "@/lib/game-data";
import { useAgenteLook, PIEL_TONOS, UNIFORME_COLORES, PANTALON_COLORES, VISOR_COLORES, HEADGEAR_COLORES, MOCHILA_COLORES, PARCHE_COLORES, MEDALLAS, RELIQUIAS, medallasGanadas, reliquiaDesbloqueada, type AgenteLook, type MedalStats } from "@/lib/agente-look";
import { HeroOro } from "@/components/vanguard/hero-oro";

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
      <HeroOro panel="agente" />
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

      {/* v73.0 EDITOR DEL AGENTE 3D — tu avatar, tu uniforme */}
      <EditorAgente3D />

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

// ---- v73 EDITOR + v88 EQUIPO COMPLETO DEL AGENTE 3D ----
const IR_AL_HANGAR = () =>
  window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: "hangar" }));

const HEADGEAR_OPCIONES: { id: AgenteLook["headgear"]; label: string }[] = [
  { id: "none", label: "— " },
  { id: "casco", label: "CASCO" },
  { id: "boina", label: "BOINA" },
];
const COMPANERO_OPCIONES: { id: AgenteLook["companero"]; label: string; desc: string }[] = [
  { id: "none", label: "NINGUNO", desc: "Operador en solitario" },
  { id: "aguila", label: "AGUILA", desc: "Vuela a tu lado batiendo alas" },
  { id: "dron", label: "DRON", desc: "Reconocimiento con luz de escaneo" },
  { id: "orbital", label: "ORBITAL", desc: "Satélite personal en órbita" },
];

function EditorAgente3D() {
  const look = useAgenteLook();
  const setLook = useAgenteLook((s) => s.setLook);
  const reset = useAgenteLook((s) => s.reset);
  const s = useGameStore();

  const stats: MedalStats = useMemo(() => ({
    level: s.level, streak: s.streak, achievements: s.unlockedAchievements,
    mpWins: s.mpStats.wins, conquestWins: s.conquestWins, quizCorrect: s.quizCorrect,
    coins: s.coins, minigameBestScore: s.minigameBestScore, viewedNews: s.viewedNews.length,
  }), [s.level, s.streak, s.unlockedAchievements, s.mpStats.wins, s.conquestWins, s.quizCorrect, s.coins, s.minigameBestScore, s.viewedNews.length]);
  const ganadas = useMemo(() => medallasGanadas(stats), [stats]);

  return (
    <div className="hud-panel neon-border p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-display font-black uppercase tracking-wide text-lg">
            Editor del Operador <span className="text-electric">3D</span>
          </h3>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Equipo · compañero · reliquias — se ve en vivo en el hangar
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={IR_AL_HANGAR}
            className="px-3 py-1.5 border border-electric-hud text-electric font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-electric/10 active:scale-95 transition"
          >
            Ver en el Hangar
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 border border-border text-muted-foreground font-mono text-[10px] font-bold uppercase tracking-widest hover:text-foreground active:scale-95 transition"
          >
            Restaurar
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* PREVIEW SVG del operador con todo el equipo */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <svg viewBox="0 0 120 190" className="w-[120px] h-[190px]" role="img" aria-label="Vista previa del operador">
            {/* aura de suelo */}
            <ellipse cx="60" cy="178" rx="42" ry="8" fill="none" stroke={look.uniforme === "rango" ? "#1E90FF" : look.uniforme} strokeOpacity="0.7" strokeWidth="2.5" />
            {/* mochila (detrás del torso) */}
            {look.mochila && <rect x="38" y="70" width="44" height="34" rx="4" fill={look.mochilaColor} stroke="#000" strokeOpacity="0.4" />}
            {/* piernas */}
            <rect x="47" y="118" width="11" height="54" rx="5.5" fill={look.pantalon} />
            <rect x="62" y="118" width="11" height="54" rx="5.5" fill={look.pantalon} />
            {/* botas */}
            <rect x="45" y="166" width="15" height="8" rx="2" fill="#171a21" />
            <rect x="60" y="166" width="15" height="8" rx="2" fill="#171a21" />
            {/* torso */}
            <rect x="40" y="62" width="40" height="62" rx="16" fill={look.uniforme === "rango" ? "#3a3f4a" : look.uniforme} />
            {/* chaleco táctico + cargadores */}
            <rect x="43" y="70" width="34" height="38" rx="6" fill="#171a21" fillOpacity="0.85" />
            <rect x="49" y="92" width="6" height="11" rx="1.5" fill="#22262f" />
            <rect x="57" y="92" width="6" height="11" rx="1.5" fill="#22262f" />
            <rect x="65" y="92" width="6" height="11" rx="1.5" fill="#22262f" />
            {/* brazos + guantes + parche */}
            <rect x="26" y="66" width="12" height="52" rx="6" fill={look.uniforme === "rango" ? "#3a3f4a" : look.uniforme} />
            <rect x="82" y="66" width="12" height="52" rx="6" fill={look.uniforme === "rango" ? "#3a3f4a" : look.uniforme} />
            <circle cx="32" cy="118" r="4" fill="#171a21" />
            <circle cx="88" cy="118" r="4" fill="#171a21" />
            <circle cx="30" cy="80" r="4" fill={look.parche} />
            {/* medallas ganadas (hasta 5 en el pecho) */}
            {medallasGanadas(stats).slice(0, 5).map((m, i) => (
              <g key={m.id}>
                <rect x={66 + i * 5} y="72" width="4" height="7" fill={m.cinta[0]} />
                <circle cx={68 + i * 5} cy="81" r="1.8" fill={m.cinta[m.cinta.length - 1]} />
              </g>
            ))}
            {/* cabeza + mandíbula */}
            <circle cx="60" cy="38" r="17" fill={look.skin} />
            {/* casco o boina */}
            {look.headgear === "casco" && (
              <>
                <path d="M42 36 a18 18 0 0 1 36 0 l0 1 -36 0 z" fill={look.headgearColor} />
                <rect x="55" y="24" width="10" height="6" rx="1.5" fill="#171a21" />
              </>
            )}
            {look.headgear === "boina" && (
              <path d="M43 30 a17 9 0 0 1 34 -2 l0 3 -34 0 z" fill={look.headgearColor} transform="rotate(-6 60 30)" />
            )}
            {/* visor */}
            {look.visor && <rect x="43" y="31" width="34" height="9" rx="4.5" fill={look.visorColor} style={{ filter: `drop-shadow(0 0 5px ${look.visorColor})` }} />}
          </svg>
          <div className="text-center font-mono text-[8px] uppercase tracking-widest text-muted-foreground mt-1">Vista previa</div>
        </div>

        {/* CONTROLES */}
        <div className="flex-1 min-w-0 space-y-3">
          <Fila label="Piel">
            {PIEL_TONOS.map((c) => (
              <Swatch key={c} color={c} activo={look.skin === c} onClick={() => setLook({ skin: c })} aria={`Piel ${c}`} />
            ))}
          </Fila>
          <Fila label="Uniforme">
            <button
              onClick={() => setLook({ uniforme: "rango" })}
              aria-label="Uniforme por rango"
              className={cn(
                "w-7 h-7 border font-mono text-[7px] font-black leading-none flex items-center justify-center transition active:scale-90",
                look.uniforme === "rango" ? "border-electric text-electric bg-electric/15" : "border-border text-muted-foreground"
              )}
            >
              RNG
            </button>
            {UNIFORME_COLORES.map((c) => (
              <Swatch key={c} color={c} activo={look.uniforme === c} onClick={() => setLook({ uniforme: c })} aria={`Uniforme ${c}`} />
            ))}
          </Fila>
          <Fila label="Pantalón">
            {PANTALON_COLORES.map((c) => (
              <Swatch key={c} color={c} activo={look.pantalon === c} onClick={() => setLook({ pantalon: c })} aria={`Pantalón ${c}`} />
            ))}
          </Fila>
          <Fila label="Visor">
            <button
              onClick={() => setLook({ visor: !look.visor })}
              className={cn(
                "px-2.5 h-7 border font-mono text-[9px] font-black uppercase tracking-wider transition active:scale-90",
                look.visor ? "border-neon text-neon bg-neon/15" : "border-border text-muted-foreground"
              )}
            >
              {look.visor ? "ON" : "OFF"}
            </button>
            {VISOR_COLORES.map((c) => (
              <Swatch key={c} color={c} activo={look.visor && look.visorColor === c} onClick={() => setLook({ visor: true, visorColor: c })} aria={`Visor ${c}`} />
            ))}
          </Fila>
          <Fila label="Cabeza">
            {HEADGEAR_OPCIONES.map((o) => (
              <button
                key={o.id}
                onClick={() => setLook({ headgear: o.id })}
                className={cn(
                  "px-2 h-7 border font-mono text-[8px] font-black uppercase tracking-wider transition active:scale-90",
                  look.headgear === o.id ? "border-electric text-electric bg-electric/15" : "border-border text-muted-foreground"
                )}
              >
                {o.label}
              </button>
            ))}
            {look.headgear !== "none" && HEADGEAR_COLORES.map((c) => (
              <Swatch key={c} color={c} activo={look.headgearColor === c} onClick={() => setLook({ headgearColor: c })} aria={`Cabeza ${c}`} />
            ))}
          </Fila>
          <Fila label="Mochila">
            <button
              onClick={() => setLook({ mochila: !look.mochila })}
              className={cn(
                "px-2.5 h-7 border font-mono text-[9px] font-black uppercase tracking-wider transition active:scale-90",
                look.mochila ? "border-amber text-amber bg-amber/15" : "border-border text-muted-foreground"
              )}
            >
              {look.mochila ? "ON" : "OFF"}
            </button>
            {look.mochila && MOCHILA_COLORES.map((c) => (
              <Swatch key={c} color={c} activo={look.mochilaColor === c} onClick={() => setLook({ mochilaColor: c })} aria={`Mochila ${c}`} />
            ))}
          </Fila>
          <Fila label="Parche">
            {PARCHE_COLORES.map((c) => (
              <Swatch key={c} color={c} activo={look.parche === c} onClick={() => setLook({ parche: c })} aria={`Parche ${c}`} />
            ))}
          </Fila>
          <Fila label="Compañero">
            {COMPANERO_OPCIONES.map((o) => (
              <button
                key={o.id}
                onClick={() => setLook({ companero: o.id })}
                title={o.desc}
                className={cn(
                  "px-2 h-7 border font-mono text-[8px] font-black uppercase tracking-wider transition active:scale-90",
                  look.companero === o.id ? "border-neon text-neon bg-neon/15" : "border-border text-muted-foreground"
                )}
              >
                {o.label}
              </button>
            ))}
          </Fila>
          <Fila label="Reliquia (solo con proeza)">
            {RELIQUIAS.map((r) => {
              const unlocked = reliquiaDesbloqueada(r.id, stats);
              return (
                <button
                  key={r.id}
                  disabled={!unlocked}
                  title={unlocked ? r.nombre : `${r.nombre} — ${r.proeza}`}
                  onClick={() => setLook({ reliquia: r.id })}
                  className={cn(
                    "px-2 h-7 border font-mono text-[8px] font-black uppercase tracking-wider transition active:scale-90",
                    look.reliquia === r.id ? "border-amber text-amber bg-amber/15" : unlocked ? "border-border text-muted-foreground" : "border-border/40 text-muted-foreground/40 line-through"
                  )}
                >
                  {r.id === "none" ? "—" : r.nombre.split(" ")[0]}
                </button>
              );
            })}
          </Fila>
        </div>
      </div>

      {/* VITRINA DE MEDALLAS — se ganan, no se compran */}
      <div className="mt-4 pt-3 border-t border-border/60">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="font-display font-black uppercase tracking-wide text-sm flex items-center gap-1.5">
              <Medal className="w-4 h-4 text-amber" /> Vitrina de Medallas
            </h4>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              {ganadas.length} de {MEDALLAS.length} conquistadas — se lucen en el pecho del operador 3D
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {MEDALLAS.map((m) => {
            const got = ganadas.some((g) => g.id === m.id);
            return (
              <motion.div
                key={m.id}
                whileHover={got ? { scale: 1.04, rotate: -0.5 } : {}}
                className={cn(
                  "hud-corner border p-2 flex items-center gap-2 transition",
                  got ? "border-amber/60 bg-amber/5" : "border-border/50 opacity-60"
                )}
              >
                {/* cinta + medalla SVG */}
                <svg viewBox="0 0 24 34" className="w-6 h-8 flex-shrink-0" aria-hidden>
                  <rect x="4" y="2" width="16" height="14" fill={m.cinta[0]} />
                  {m.cinta[1] && <rect x="4" y="5" width="16" height="4" fill={m.cinta[1]} />}
                  {m.cinta[2] && <rect x="4" y="9" width="16" height="4" fill={m.cinta[2]} />}
                  {got ? (
                    <>
                      <circle cx="12" cy="24" r="7.5" fill={m.cinta[m.cinta.length - 1]} />
                      <circle cx="12" cy="24" r="5" fill="none" stroke="#00000055" strokeWidth="1" />
                      <path d="M9 24 l2.2 2.4 L15 21.5" stroke="#ffffffcc" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                    </>
                  ) : (
                    <circle cx="12" cy="24" r="7.5" fill="none" stroke="#555" strokeWidth="1.5" strokeDasharray="2 2" />
                  )}
                </svg>
                <div className="min-w-0">
                  <div className={cn("font-mono text-[9px] font-black uppercase leading-tight", got ? "text-amber" : "text-muted-foreground")}>{m.nombre}</div>
                  <div className="font-mono text-[8px] text-muted-foreground leading-tight">{m.descripcion}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Fila({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Swatch({ color, activo, onClick, aria }: { color: string; activo: boolean; onClick: () => void; aria: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      className={cn(
        "w-7 h-7 border transition active:scale-90",
        activo ? "border-white ring-2 ring-white/40 scale-110" : "border-black/50 hover:scale-105"
      )}
      style={{ background: color }}
    />
  );
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
