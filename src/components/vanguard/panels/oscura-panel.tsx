"use client";

// v59.0 ALEJANDRÍA OSCURA — LA BIBLIOTECA DE ALEJANDRÍA GEOPOLÍTICA
// v60.0 CONOCIMIENTO PROHIBIDO: 4 colecciones (TEORÍAS/ARMAS/CIVIS + nueva
// SALA DE DOCUMENTOS con bóvedas y PDFs desclasificados reales) + QUIZ DE
// ALEJANDRÍA: 6 preguntas diarias con botín (XP que viaja a TEMPORADA/SEMANA
// por el espejo global v58). Cada entrada abre su fuente real desclasificada.
// v61.0 ERUDITOS DEL ABISMO: banco 49 preguntas, RACHA DEL EXAMEN con hitos
// (3/7/14/30 días) e INTERROGATORIO: contrarreloj de 60 s contra el banco
// completo con récord personal persistente.

import { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ChevronDown, ExternalLink, Skull, Swords, Landmark,
  Sparkles, ShieldCheck, AlertTriangle, Eye, FileText, GraduationCap,
  CheckCircle2, XCircle, Gift, Timer, Flame, Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { useGameStore } from "@/lib/game-store";
import {
  TEORIAS, ARMAS, CIVILIZACIONES, DOCS, OSCURA_TOTAL, OSCURA_MILESTONES,
  oscuraRank, entradaDelDia, isEntradaDelDia, lecturaOscuraReward,
  QUIZ_BANK, QUIZ_REWARD, QUIZ_DAILY_BONUS, QUIZ_STREAK_MILESTONES,
  INTERRO_SECONDS, INTERRO_REWARD, quizSetOfDay, dayKeyUtc,
  useOscura, type Veredicto, type OscuraRarity, type QuizQuestion,
} from "@/lib/oscura";
import { HeroOro } from "@/components/vanguard/hero-oro";

type Coleccion = "TEORIAS" | "ARMAS" | "CIVIS" | "DOCS" | "QUIZ";

const VEREDICTO_CLS: Record<Veredicto, string> = {
  MITO: "bg-red-hud/20 text-red-hud border-red-hud/50",
  REAL: "bg-green-hud/15 text-green-hud border-green-hud/50",
  PARCIAL: "bg-amber-hud/15 text-amber border-amber-hud/50",
};

const RARITY_CLS: Record<OscuraRarity, string> = {
  COMUN: "border-slate-600/50",
  RARO: "border-cyan-hud/50",
  EPICO: "border-violet-400/60",
  LEGENDARIO: "border-amber-400/80 shadow-[0_0_18px_rgba(251,191,36,0.25)]",
};

export function OscuraPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const readIds = useOscura((s) => s.readIds);
  const claimed = useOscura((s) => s.claimedMilestones);
  const registerRead = useOscura((s) => s.registerRead);
  const claimMilestone = useOscura((s) => s.claimMilestone);
  const quizSolvedToday = useOscura((s) => s.quizSolvedToday);
  const quizBonusDay = useOscura((s) => s.quizBonusDay);
  const quizSolved = useOscura((s) => s.quizSolved);
  const quizStreak = useOscura((s) => s.quizStreak);
  const solveQuiz = useOscura((s) => s.solveQuiz);
  const claimQuizBonus = useOscura((s) => s.claimQuizBonus);

  const [col, setCol] = useState<Coleccion>("TEORIAS");
  const [openId, setOpenId] = useState<string | null>(null);
  const [quizDay, setQuizDay] = useState(() => dayKeyUtc());
  const quizSet = useMemo(() => quizSetOfDay(), []);

  const reads = readIds.length;
  const rank = useMemo(() => oscuraRank(reads), [reads]);
  const daily = useMemo(() => entradaDelDia(), []);
  const pct = Math.round((reads / OSCURA_TOTAL) * 100);

  // si cambia el día UTC mientras el panel está abierto, resetea el estado visual
  if (quizDay !== dayKeyUtc()) setQuizDay(dayKeyUtc());

  const openEntry = (id: string) => {
    const isNew = registerRead(id);
    if (isNew) {
      const rw = lecturaOscuraReward(isEntradaDelDia(id));
      addCoins(rw.coins, `Alejandría Oscura: ${id}`);
      addXp(rw.xp); // v58: viaja a TEMPORADA + TABLÓN SEMANAL automáticamente
      toast.success(`+${rw.coins}ⓒ +${rw.xp}XP · entrada archivada`, {
        description: isEntradaDelDia(id) ? "⭐ ENTRADA DEL DÍA: botín x1.5" : `Progreso ${reads + 1}/${OSCURA_TOTAL} · ${oscuraRank(reads + 1)}`,
      });
      // cobrar hitos pendientes automáticamente
      for (const m of OSCURA_MILESTONES) {
        if (reads + 1 >= m.at && !claimed.includes(m.at) && claimMilestone(m.at)) {
          addCoins(m.coins, `Hito Alejandría: ${m.at} entradas`);
          addXp(m.xp);
          addGemsSafe(m.gems);
          toast(`🏆 HITO: ${m.label}`, { description: `+${m.coins}ⓒ +${m.gems}💎 +${m.xp}XP` });
        }
      }
    }
  };

  const addGemsSafe = (g: number) => {
    if (g > 0) useGameStore.getState().addGems(g, "Hito Alejandría Oscura");
  };

  const abrirFuente = (id: string, url: string, titulo: string) => {
    openEntry(id);
    window.open(url, "_blank", "noopener,noreferrer");
    toast("🔓 Fuente real abierta", { description: titulo.slice(0, 70) });
  };

  // v60.0 QUIZ: resolver una pregunta del set diario
  const answerQuiz = (q: QuizQuestion, optIdx: number) => {
    const ok = optIdx === q.correct;
    if (ok && solveQuiz(q.id)) {
      addCoins(QUIZ_REWARD.coins, `Quiz Alejandría: ${q.id}`);
      addXp(QUIZ_REWARD.xp); // v58: TEMPORADA + TABLÓN SEMANAL
      toast.success(`+${QUIZ_REWARD.coins}ⓒ +${QUIZ_REWARD.xp}XP · acierto archivado`, {
        description: `Set de hoy: ${quizSolvedToday.length + 1}/6`,
      });
    } else if (!ok) {
      toast.error("Respuesta errónea", { description: "El archivo no paga errores. Relee la biblioteca." });
    }
    return ok;
  };

  const bonusReady = quizBonusDay === dayKeyUtc()
    ? false // ya cobrado hoy
    : quizSolvedToday.length >= quizSet.length;
  const bonusClaimed = quizBonusDay === dayKeyUtc();
  return (
    <div className="space-y-4">
      <HeroOro panel="oscura" />
      <PanelHeader
        title="Alejandría Oscura"
        subtitle="La biblioteca de los secretos: teorías, armas, civilizaciones, documentos reales y examen diario"
        icon={<BookOpen className="w-4 h-4 text-red-hud" />}
        color="red"
        right={<span className="text-[10px] font-mono text-muted-foreground hidden sm:block">{reads}/{OSCURA_TOTAL} · {rank}</span>}
      />

      {/* banner de clasificación */}
      <div className="rounded border border-red-hud/40 bg-red-hud/10 px-3 py-2 flex items-center gap-2 flex-wrap">
        <Skull className="w-3.5 h-3.5 text-red-hud" />
        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-red-hud">
          Clasificado · nivel de acceso: tu curiosidad
        </span>
        <span className="ml-auto text-[9px] font-mono text-muted-foreground">
          Nada inventado: cada fuente es real y desclasificada
        </span>
      </div>

      {/* progreso */}
      <div className="hud-corner bg-secondary/40 p-3 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Eye className="w-3.5 h-3.5 text-amber" />
          <span className="text-xs font-mono text-foreground font-bold">{reads}/{OSCURA_TOTAL} entradas absorbidas</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-hud/20 text-amber rounded">{rank}</span>
          <span className="ml-auto text-[10px] font-mono text-amber">{pct}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-hud via-amber-hud to-amber-hud transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-[9px] font-mono text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber" />
          ⭐ ENTRADA DEL DÍA (botín x1.5): <span className="text-amber">{daily.titulo.slice(0, 52)}{daily.titulo.length > 52 ? "…" : ""}</span>
        </div>
      </div>

      {/* conmutador de colecciones (v60: 4 colecciones + QUIZ) */}
      <div className="grid grid-cols-5 gap-1.5">
        {([
          { key: "TEORIAS" as Coleccion, label: "TEORÍAS", n: TEORIAS.length, icon: <Skull className="w-3.5 h-3.5" /> },
          { key: "ARMAS" as Coleccion, label: "ARMAS", n: ARMAS.length, icon: <Swords className="w-3.5 h-3.5" /> },
          { key: "CIVIS" as Coleccion, label: "CIVIS", n: CIVILIZACIONES.length, icon: <Landmark className="w-3.5 h-3.5" /> },
          { key: "DOCS" as Coleccion, label: "DOCS", n: DOCS.length, icon: <FileText className="w-3.5 h-3.5" /> },
          { key: "QUIZ" as Coleccion, label: "QUIZ", n: quizSet.length, icon: <GraduationCap className="w-3.5 h-3.5" /> },
        ]).map((c) => (
          <button
            key={c.key}
            onClick={() => { setCol(c.key); setOpenId(null); }}
            className={cn(
              "hud-corner py-2 px-1.5 flex flex-col items-center gap-0.5 border transition-colors",
              col === c.key ? "bg-red-hud/15 border-red-hud/60 text-red-hud" : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {c.icon}
            <span className="text-[9px] font-mono font-bold uppercase">{c.label}</span>
            <span className="text-[8px] font-mono opacity-70">{c.n} entradas</span>
          </button>
        ))}
      </div>

      {/* tarjetas */}
      <div className="grid md:grid-cols-2 gap-2.5">
        {col === "TEORIAS" && TEORIAS.map((t) => (
          <OscuraCard
            key={t.id}
            id={t.id}
            titulo={t.titulo}
            veredicto={t.veredicto}
            rareza={t.rareza}
            resumen={t.creencia}
            open={openId === t.id}
            onToggle={() => setOpenId(openId === t.id ? null : t.id)}
            onOpenSource={() => abrirFuente(t.id, t.url, t.titulo)}
            fuente={t.fuente}
            detalle={[
              { k: "ORIGEN", v: t.origen },
              { k: "LO QUE CREEN", v: t.creencia },
              { k: "LO QUE DICEN LOS DOCUMENTOS", v: t.realidad },
            ]}
          />
        ))}
        {col === "ARMAS" && ARMAS.map((a) => (
          <OscuraCard
            key={a.id}
            id={a.id}
            titulo={a.titulo}
            veredicto="REAL"
            rareza="RARO"
            resumen={a.idea}
            open={openId === a.id}
            onToggle={() => setOpenId(openId === a.id ? null : a.id)}
            onOpenSource={() => abrirFuente(a.id, a.url, a.titulo)}
            fuente={a.fuente}
            detalle={[
              { k: "ÉPOCA", v: a.epoca },
              { k: "LA IDEA", v: a.idea },
              { k: "LO QUE CAMBIÓ", v: a.legado },
            ]}
          />
        ))}
        {col === "CIVIS" && CIVILIZACIONES.map((c) => (
          <OscuraCard
            key={c.id}
            id={c.id}
            titulo={c.titulo}
            veredicto="REAL"
            rareza="COMUN"
            resumen={c.misterio}
            open={openId === c.id}
            onToggle={() => setOpenId(openId === c.id ? null : c.id)}
            onOpenSource={() => abrirFuente(c.id, c.url, c.titulo)}
            fuente={c.fuente}
            detalle={[
              { k: "ÉPOCA", v: c.epoca },
              { k: "QUÉ LOGRÓ", v: c.que },
              { k: "EL MISTERIO", v: c.misterio },
            ]}
          />
        ))}
        {col === "DOCS" && DOCS.map((d) => (
          <OscuraCard
            key={d.id}
            id={d.id}
            titulo={d.titulo}
            veredicto="REAL"
            rareza="RARO"
            resumen={d.desc}
            open={openId === d.id}
            onToggle={() => setOpenId(openId === d.id ? null : d.id)}
            onOpenSource={() => abrirFuente(d.id, d.url, d.titulo)}
            fuente={d.fuente}
            detalle={[
              { k: "MATERIAL", v: d.tag },
              { k: "QUÉ HAY DENTRO", v: d.desc },
              { k: "AVISO", v: "Documento original escaneado: sellos, tinta y clasificación incluidos. Lo que leas ahí, lo escribió el gobierno — no nosotros." },
            ]}
          />
        ))}
        {col === "QUIZ" && (
          <div className="md:col-span-2 space-y-2.5">
            {/* banner del set diario */}
            <div className="hud-corner bg-secondary/40 p-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <GraduationCap className="w-3.5 h-3.5 text-amber" />
                <span className="text-xs font-mono font-bold text-foreground">EXAMEN DEL ARCHIVO · set de HOY</span>
                <span className="ml-auto text-[10px] font-mono text-amber">{quizSolvedToday.length}/{quizSet.length} resueltas</span>
              </div>
              <div className="h-1.5 bg-secondary rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-hud via-red-hud to-amber-hud transition-all" style={{ width: `${(quizSolvedToday.length / quizSet.length) * 100}%` }} />
              </div>
              <div className="text-[9px] font-mono text-muted-foreground">
                Banco de {QUIZ_BANK.length} preguntas extraídas de la biblioteca · 6 nuevas cada día UTC ·
                acierto: +{QUIZ_REWARD.coins}ⓒ +{QUIZ_REWARD.xp}XP · aciertos históricos: {quizSolved.length}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap text-[9px] font-mono">
                <span className="px-1.5 py-0.5 bg-red-hud/15 text-red-hud border border-red-hud/40 rounded flex items-center gap-1">
                  <Flame className="w-3 h-3" /> RACHA DEL EXAMEN: {quizStreak} día{quizStreak === 1 ? "" : "s"}
                </span>
                {QUIZ_STREAK_MILESTONES.filter((m) => m.at > quizStreak).slice(0, 1).map((m) => (
                  <span key={m.at} className="text-muted-foreground">próximo hito: {m.at} días → +{m.coins}ⓒ +{m.gems}💎 +{m.xp}XP</span>
                ))}
                {quizStreak >= 30 && <span className="text-amber">racha máxima conseguida 👑</span>}
              </div>
            </div>

            {/* botín del día (v61: al cobrar crece la RACHA del examen) */}
            <button
              disabled={!bonusReady && !bonusClaimed}
              onClick={() => {
                const r = claimQuizBonus();
                if (r.ok) {
                  addCoins(QUIZ_DAILY_BONUS.coins, "Quiz Alejandría: set diario completo");
                  addXp(QUIZ_DAILY_BONUS.xp);
                  if (QUIZ_DAILY_BONUS.gems > 0) useGameStore.getState().addGems(QUIZ_DAILY_BONUS.gems, "Quiz Alejandría: botín del día");
                  toast.success(`🎁 BOTÍN DEL DÍA: +${QUIZ_DAILY_BONUS.coins}ⓒ +${QUIZ_DAILY_BONUS.gems}💎 +${QUIZ_DAILY_BONUS.xp}XP`, { description: `Examen completo. Racha del examen: ${r.streak} día${r.streak === 1 ? "" : "s"} 🔥` });
                }
                if (r.milestone > 0) {
                  const m = QUIZ_STREAK_MILESTONES.find((x) => x.at === r.milestone);
                  if (m) {
                    addCoins(m.coins, `Racha del examen: ${m.at} días`);
                    addXp(m.xp);
                    if (m.gems > 0) useGameStore.getState().addGems(m.gems, "Racha del examen");
                    setTimeout(() => toast.success(`🔥 RACHA ${m.at} DÍAS: +${m.coins}ⓒ +${m.gems}💎 +${m.xp}XP`, { description: "El archivo premia a los que vuelven. Mañana, otra vez." }), 600);
                  }
                }
              }}
              className={cn(
                "w-full flex items-center justify-center gap-2 text-[10px] font-mono font-bold uppercase py-2.5 rounded border transition-colors",
                bonusClaimed ? "bg-green-hud/10 border-green-hud/40 text-green-hud"
                  : bonusReady ? "bg-amber-hud/20 border-amber-hud/70 text-amber animate-pulse"
                  : "bg-secondary/40 border-border text-muted-foreground"
              )}
            >
              <Gift className="w-3.5 h-3.5" />
              {bonusClaimed ? "BOTÍN DEL DÍA RECLAMADO"
                : bonusReady ? `Reclamar botín del día · +${QUIZ_DAILY_BONUS.coins}ⓒ +${QUIZ_DAILY_BONUS.gems}💎 +${QUIZ_DAILY_BONUS.xp}XP`
                : `Completa el set (${quizSolvedToday.length}/${quizSet.length}) para liberar el botín del día`}
            </button>

            {/* v61.0 INTERROGATORIO: contrarreloj 60 s contra el banco completo */}
            <Interrogatorio />

            {/* preguntas */}
            {quizSet.map((q, i) => (
              <QuizCard key={q.id} q={q} idx={i} onAnswer={answerQuiz} />
            ))}
          </div>
        )}
      </div>

      {/* hitos */}
      <div className="hud-corner bg-secondary/40 p-3 space-y-2">
        <div className="text-xs font-mono font-bold uppercase text-foreground flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-green-hud" /> Hitos de la biblioteca
        </div>
        <div className="space-y-1.5">
          {OSCURA_MILESTONES.map((m) => {
            const done = reads >= m.at;
            const got = claimed.includes(m.at);
            return (
              <button
                key={m.at}
                disabled={!done || got}
                onClick={() => {
                  if (claimMilestone(m.at)) {
                    addCoins(m.coins, `Hito Alejandría: ${m.at} entradas`);
                    addXp(m.xp);
                    if (m.gems > 0) useGameStore.getState().addGems(m.gems, "Hito Alejandría Oscura");
                    toast.success(`🏆 ${m.label}`, { description: `+${m.coins}ⓒ +${m.gems}💎 +${m.xp}XP` });
                  }
                }}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded border flex items-center gap-2 text-[10px] font-mono transition-colors",
                  got ? "bg-green-hud/10 border-green-hud/40 text-green-hud"
                    : done ? "bg-amber-hud/15 border-amber-hud/60 text-amber animate-pulse"
                    : "bg-secondary/40 border-border text-muted-foreground"
                )}
              >
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span className="flex-1">{m.label}</span>
                <span>+{m.coins}ⓒ +{m.gems}💎 +{m.xp}XP</span>
                <span>{got ? "RECLAMADO" : done ? "RECLAMAR" : `${reads}/${m.at}`}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hud-corner p-3 bg-secondary/30 text-[10px] font-mono text-muted-foreground flex items-start gap-2">
        <Eye className="w-3.5 h-3.5 text-red-hud flex-shrink-0 mt-0.5" />
        <span>
          Regla de la casa: aquí el miedo es honesto. Las teorías se marcan como MITO cuando lo son,
          y lo REAL (MK-ULTRA, Paperclip, las 12.000 armas en alerta) aterriza más duro que cualquier leyenda.
          Leer entradas paga monedas y XP que suma a tu TEMPORADA y al TABLÓN SEMANAL.
        </span>
      </div>
    </div>
  );
}

function OscuraCard({
  id, titulo, veredicto, rareza, resumen, open, onToggle, onOpenSource, fuente, detalle,
}: {
  id: string;
  titulo: string;
  veredicto: Veredicto;
  rareza: OscuraRarity;
  resumen: string;
  open: boolean;
  onToggle: () => void;
  onOpenSource: () => void;
  fuente: string;
  detalle: { k: string; v: string }[];
}) {
  const read = useOscura((s) => s.readIds.includes(id));
  const daily = isEntradaDelDia(id);
  return (
    <div className={cn("hud-corner bg-secondary/40 border", RARITY_CLS[rareza], read && "opacity-90")}>
      <button onClick={onToggle} className="w-full text-left p-3 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("text-[8px] font-mono font-bold px-1 py-0.5 border rounded uppercase", VEREDICTO_CLS[veredicto])}>
              {veredicto}
            </span>
            <span className="text-[8px] font-mono uppercase text-muted-foreground">{rareza}</span>
            {daily && <span className="text-[8px] font-mono text-amber animate-pulse">⭐ DEL DÍA x1.5</span>}
            {read && <span className="text-[8px] font-mono text-green-hud">✓ LEÍDO</span>}
          </div>
          <div className="text-xs font-mono font-bold text-foreground mt-1 leading-snug">{titulo}</div>
          <p className={cn("text-[10px] text-muted-foreground mt-1 leading-relaxed", open && "line-clamp-none")}>
            {resumen.length > 110 && !open ? resumen.slice(0, 110) + "…" : resumen}
          </p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-border/40 pt-2">
              {detalle.map((d) => (
                <div key={d.k}>
                  <div className="text-[8px] font-mono font-bold uppercase tracking-widest text-red-hud/90">{d.k}</div>
                  <p className="text-[10px] text-foreground/90 leading-relaxed">{d.v}</p>
                </div>
              ))}
              <button
                onClick={onOpenSource}
                className="w-full flex items-center justify-center gap-1.5 bg-red-hud/15 border border-red-hud/50 text-red-hud hover:bg-red-hud/25 text-[10px] font-mono font-bold uppercase py-1.5 rounded transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> Abrir fuente real · {fuente}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// v60.0 — tarjeta de pregunta del examen diario.
// Estado local: pending (sin responder) → correct | wrong. El acierto paga
// una sola vez por pregunta/día (store solveQuiz es idempotente).
function QuizCard({
  q, idx, onAnswer,
}: {
  q: QuizQuestion;
  idx: number;
  onAnswer: (q: QuizQuestion, optIdx: number) => boolean;
}) {
  const solvedToday = useOscura((s) => s.quizSolvedToday.includes(q.id));
  const solvedEver = useOscura((s) => s.quizSolved.includes(q.id));
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const wasRight = answered && picked === q.correct;

  return (
    <div className={cn(
      "hud-corner bg-secondary/40 border p-3 space-y-2",
      solvedToday || wasRight ? "border-green-hud/40" : answered ? "border-red-hud/50" : "border-border",
    )}>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[8px] font-mono font-bold px-1 py-0.5 bg-red-hud/15 text-red-hud border border-red-hud/40 rounded">
          PREGUNTA {idx + 1}
        </span>
        {(solvedToday || wasRight) && (
          <span className="text-[8px] font-mono text-green-hud flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" /> ACIERTO · PAGADO
          </span>
        )}
        {!solvedToday && !wasRight && answered && (
          <span className="text-[8px] font-mono text-red-hud flex items-center gap-0.5">
            <XCircle className="w-3 h-3" /> FALLO · sin botín
          </span>
        )}
        {solvedEver && !solvedToday && !wasRight && (
          <span className="text-[8px] font-mono text-muted-foreground">acertada otro día</span>
        )}
      </div>
      <p className="text-[11px] font-mono font-bold text-foreground leading-snug">{q.q}</p>
      <div className="grid sm:grid-cols-3 gap-1.5">
        {q.opts.map((opt, i) => {
          const isCorrect = i === q.correct;
          const isPicked = picked === i;
          return (
            <button
              key={i}
              disabled={answered && (wasRight || isPicked) || solvedToday}
              onClick={() => { setPicked(i); onAnswer(q, i); }}
              className={cn(
                "text-left text-[9px] font-mono px-2 py-1.5 rounded border transition-colors leading-snug",
                // tras responder: pinta la correcta en verde y el fallo en rojo
                answered && isCorrect ? "bg-green-hud/15 border-green-hud/60 text-green-hud"
                  : answered && isPicked && !isCorrect ? "bg-red-hud/15 border-red-hud/60 text-red-hud"
                  : "bg-secondary/60 border-border text-foreground/90 hover:border-amber-hud/60 hover:text-foreground"
              )}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// v61.0 ERUDITOS DEL ABISMO — INTERROGATORIO: contrarreloj de 60 segundos
// contra el banco completo (49 preguntas barajadas al azar). Cada acierto
// paga botín menor que el set diario (+8ⓒ +5XP) que viaja a TEMPORADA/SEMANA
// por el espejo global. El récord personal (aciertos en una sesión) queda
// guardado para siempre en vg_oscura_v59. Sin penalización por fallo: el
// reloj es el castigo.
function Interrogatorio() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const best = useOscura((s) => s.bestInterrogatorio);
  const setBest = useOscura((s) => s.setBestInterrogatorio);

  const [phase, setPhase] = useState<"idle" | "run" | "done">("idle");
  const [timeLeft, setTimeLeft] = useState(INTERRO_SECONDS);
  const [hits, setHits] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [cur, setCur] = useState<QuizQuestion | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const queueRef = useRef<QuizQuestion[]>([]);
  const qIdxRef = useRef(0);

  // reloj de la sesión: 1 tick por segundo, a 0 → fin y récord
  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          finishRun();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startRun = () => {
    // barajado Fisher-Yates del banco completo (variedad total entre sesiones)
    const pool = [...QUIZ_BANK];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    queueRef.current = pool;
    qIdxRef.current = 0;
    setHits(0);
    setAnswered(0);
    setTimeLeft(INTERRO_SECONDS);
    setCur(pool[0]);
    setPicked(null);
    setPhase("run");
  };

  const finishRun = () => {
    setPhase("done");
    setCur(null);
    setPicked(null);
  };

  // al terminar: si hay récord, se persiste y se anuncia
  useEffect(() => {
    if (phase !== "done") return;
    if (setBest(hits)) {
      setTimeout(() => toast.success(`👑 RÉCORD PERSONAL: ${hits} aciertos en ${INTERRO_SECONDS}s`, { description: "El archivo te vigila… y se impresiona." }), 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const answer = (optIdx: number) => {
    if (!cur || picked !== null) return;
    setPicked(optIdx);
    setAnswered((a) => a + 1);
    const ok = optIdx === cur.correct;
    if (ok) {
      setHits((h) => h + 1);
      addCoins(INTERRO_REWARD.coins, `Interrogatorio: ${cur.id}`);
      addXp(INTERRO_REWARD.xp); // v58: TEMPORADA + TABLÓN SEMANAL
    }
    // siguiente pregunta tras mostrar el color de la respuesta
    setTimeout(() => {
      qIdxRef.current += 1;
      const next = queueRef.current[qIdxRef.current % queueRef.current.length];
      if (next) setCur(next);
      setPicked(null);
    }, ok ? 550 : 900); // el fallo se marca un poco más: el archivo quiere que lo recuerdes
  };

  const nextIn = queueRef.current.length ? `${(qIdxRef.current % queueRef.current.length) + 1}/${QUIZ_BANK.length}` : "—";

  return (
    <div className="hud-corner bg-gradient-to-br from-red-hud/10 via-secondary/40 to-secondary/40 border border-red-hud/40 p-3 space-y-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        <Timer className="w-3.5 h-3.5 text-red-hud" />
        <span className="text-xs font-mono font-bold uppercase text-foreground">INTERROGATORIO · {INTERRO_SECONDS}s sin piedad</span>
        <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 bg-amber-hud/20 text-amber rounded flex items-center gap-1">
          <Trophy className="w-3 h-3" /> RÉCORD: {best} aciertos
        </span>
      </div>

      {phase === "idle" && (
        <>
          <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
            El banco entero ({QUIZ_BANK.length} preguntas) contra tu reloj: barajadas al azar, sin pausa y sin segunda
            oportunidad. Cada acierto paga +{INTERRO_REWARD.coins}ⓒ +{INTERRO_REWARD.xp}XP. Fallar no resta — el reloj ya es el castigo.
          </p>
          <button
            onClick={startRun}
            className="w-full flex items-center justify-center gap-2 bg-red-hud/20 border border-red-hud/60 text-red-hud hover:bg-red-hud/30 text-[11px] font-mono font-bold uppercase py-2.5 rounded transition-colors animate-pulse"
          >
            <Timer className="w-4 h-4" /> Iniciar interrogatorio
          </button>
        </>
      )}

      {phase === "run" && cur && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "text-lg font-mono font-black leading-none tabular-nums",
              timeLeft <= 10 ? "text-red-hud animate-pulse" : "text-amber",
            )}>{timeLeft}s</span>
            <div className="flex-1 h-1.5 bg-secondary rounded overflow-hidden min-w-[80px]">
              <div
                className={cn("h-full transition-all duration-1000", timeLeft <= 10 ? "bg-red-hud" : "bg-amber-hud")}
                style={{ width: `${(timeLeft / INTERRO_SECONDS) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-green-hud font-bold">✓ {hits}</span>
            <span className="text-[10px] font-mono text-muted-foreground">· {answered} contestadas · banco {nextIn}</span>
          </div>
          <p className="text-[11px] font-mono font-bold text-foreground leading-snug">{cur.q}</p>
          <div className="grid sm:grid-cols-3 gap-1.5">
            {cur.opts.map((opt, i) => {
              const isCorrect = i === cur.correct;
              const isPicked = picked === i;
              return (
                <button
                  key={i}
                  disabled={picked !== null}
                  onClick={() => answer(i)}
                  className={cn(
                    "text-left text-[9px] font-mono px-2 py-1.5 rounded border transition-colors leading-snug",
                    picked !== null && isCorrect ? "bg-green-hud/15 border-green-hud/60 text-green-hud"
                      : picked !== null && isPicked && !isCorrect ? "bg-red-hud/15 border-red-hud/60 text-red-hud"
                      : "bg-secondary/60 border-border text-foreground/90 hover:border-amber-hud/60 hover:text-foreground"
                  )}
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </button>
              );
            })}
          </div>
        </>
      )}

      {phase === "done" && (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="hud-panel p-2">
              <div className="text-lg font-mono font-black text-green-hud leading-none">{hits}</div>
              <div className="text-[8px] font-mono text-muted-foreground uppercase mt-1">aciertos</div>
            </div>
            <div className="hud-panel p-2">
              <div className="text-lg font-mono font-black text-amber leading-none">{answered}</div>
              <div className="text-[8px] font-mono text-muted-foreground uppercase mt-1">contestadas</div>
            </div>
            <div className="hud-panel p-2">
              <div className="text-lg font-mono font-black text-red-hud leading-none">{Math.max(0, answered - hits)}</div>
              <div className="text-[8px] font-mono text-muted-foreground uppercase mt-1">fallos</div>
            </div>
          </div>
          <div className="text-[9px] font-mono text-muted-foreground">
            Botín de la sesión: +{hits * INTERRO_REWARD.coins}ⓒ +{hits * INTERRO_REWARD.xp}XP · récord vigente: {best} aciertos
          </div>
          <button
            onClick={startRun}
            className="w-full flex items-center justify-center gap-2 bg-red-hud/20 border border-red-hud/60 text-red-hud hover:bg-red-hud/30 text-[11px] font-mono font-bold uppercase py-2.5 rounded transition-colors"
          >
            <Timer className="w-4 h-4" /> Otra vez · el reloj no perdona
          </button>
        </>
      )}
    </div>
  );
}
