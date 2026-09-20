"use client";

// Vanguard v7 — Encuestas tacticas: vota las encuestas de la comunidad
// y CREA TUS PROPIAS PREGUNTAS (+10 monedas +1 gema). Los votos de la comunidad
// llegan en vivo (simulacion determinista por tiempo transcurrido).
import { useEffect, useMemo, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import {
  Vote, Clock, CheckCircle2, Coins, BarChart3, Plus, Loader2, Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useGameStore, type UserPoll } from "@/lib/game-store";
import { POLLS, FORUM_CAT_COLOR } from "@/lib/social-data";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";

interface UserPollWithVotes extends UserPoll {
  votes: number[];
  totalVotes: number;
}

// votos simulados de la comunidad: deterministas por (id, opcion, slot de 12s)
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function communityVotes(poll: UserPoll): { votes: number[]; total: number } {
  const elapsed = Math.max(0, (Date.now() - poll.ts) / 1000);
  const slots = Math.floor(elapsed / 12);
  const votes = poll.options.map(() => 0);
  // votos del creador no cuentan; peso base por opcion (la primera algo favorecida)
  for (let s = 0; s < slots; s++) {
    for (let i = 0; i < poll.options.length; i++) {
      const r = hash01(`${poll.id}:${s}:${i}`);
      // probabilidad decreciente con el numero de opciones
      const p = 0.55 / poll.options.length * (i === 0 ? 1.4 : 1);
      if (r < p) votes[i] += 1;
    }
  }
  return { votes, total: votes.reduce((a, b) => a + b, 0) };
}

const POLL_CATEGORIES = ["MILITAR", "DIPLOMACIA", "ECONOMIA", "COMUNIDAD"] as const;

export function PollsPanel() {
  const [filter, setFilter] = useState<string>("TODAS");
  const pollVotes = useGameStore((s) => s.pollVotes);
  const votePoll = useGameStore((s) => s.votePoll);
  const myPolls = useGameStore((s) => s.myPolls);
  const createPoll = useGameStore((s) => s.createPoll);
  const [createOpen, setCreateOpen] = useState(false);
  const [tick, setTick] = useState(0);

  // refresco de votos en vivo de tus encuestas
  useEffect(() => {
    if (myPolls.length === 0) return;
    const t = setInterval(() => setTick((x) => x + 1), 8000);
    return () => clearInterval(t);
  }, [myPolls.length]);

  const filtered = filter === "TODAS" ? POLLS : POLLS.filter((p) => p.category === filter);

  const stats = useMemo(() => {
    const voted = POLLS.filter((p) => pollVotes[p.id] !== undefined).length;
    return { voted, total: POLLS.length, earned: voted * 5, xp: voted * 5 };
  }, [pollVotes]);

  const handleVote = (pollId: string, idx: number) => {
    const ok = votePoll(pollId, idx, 5);
    if (ok) {
      sfx.success();
      toast.success("Voto registrado (+5 monedas, +5 XP)");
    } else {
      sfx.error();
    }
  };

  // ====== tarjeta reutilizable de encuesta ======
  const PollCard = (
    { id, question, options, category, conflictTag, hoursLeft, votes, totalVotes, isMine, ts }: {
      id: string; question: string; options: string[]; category: string;
      conflictTag?: string; hoursLeft: number; votes: number[];
      totalVotes: number; isMine?: boolean; ts?: number;
    }
  ) => {
    const myVote = pollVotes[id];
    const hasVoted = myVote !== undefined;
    const catColor = FORUM_CAT_COLOR[category as keyof typeof FORUM_CAT_COLOR];
    return (
      <article className="hud-corner p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-foreground leading-snug flex-1">{question}</h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isMine && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 border border-amber-hud bg-amber-hud/80 text-black font-bold uppercase">
                TU ENCUESTA
              </span>
            )}
            <span className={cn(
              "text-[9px] font-mono px-1.5 py-0.5 border uppercase",
              catColor ?? "text-violet-hud border-violet-hud bg-violet-hud/20"
            )}>
              {category}
            </span>
          </div>
        </div>
        {conflictTag && (
          <p className="text-[9px] font-mono text-muted-foreground uppercase mb-1">
            vinculado a frente: {conflictTag}
          </p>
        )}
        <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 mb-3">
          {isMine ? (
            <span className="text-green-hud flex items-center gap-1">
              <Users className="w-3 h-3" /> comunidad votando en vivo
            </span>
          ) : (
            <>
              <Clock className="w-3 h-3" /> cierra en {hoursLeft}h
            </>
          )}
          <span>· {totalVotes.toLocaleString("es")} votos</span>
          {hasVoted && (
            <span className="text-green-hud flex items-center gap-1 ml-2">
              <CheckCircle2 className="w-3 h-3" /> tu voto registrado
            </span>
          )}
        </p>

        <div className="space-y-1.5">
          {options.map((opt, idx) => {
            const v = (votes[idx] ?? 0) + (myVote === idx ? 1 : 0);
            const total = totalVotes + (hasVoted ? 1 : 0);
            const pct = total > 0 ? Math.round((v / total) * 100) : 0;
            const isMineVote = myVote === idx;
            return (
              <button
                key={idx}
                disabled={hasVoted || isMine}
                onClick={() => handleVote(id, idx)}
                className={cn(
                  "relative w-full text-left border transition-colors overflow-hidden group",
                  hasVoted || isMine ? "cursor-default border-border/60" : "border-border hover:border-amber-hud cursor-pointer",
                  isMineVote && "border-green-hud"
                )}
              >
                {(hasVoted || isMine) && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 * idx }}
                    className={cn(
                      "absolute inset-y-0 left-0",
                      isMineVote ? "bg-green-hud/30" : "bg-secondary"
                    )}
                  />
                )}
                <span className="relative z-10 flex items-center justify-between px-2.5 py-1.5">
                  <span className={cn("text-xs font-mono", isMineVote ? "text-green-hud font-bold" : "text-foreground/90")}>
                    {opt}
                    {isMineVote && " · TU VOTO"}
                  </span>
                  {(hasVoted || isMine) && (
                    <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0 ml-2">
                      {pct}% ({v.toLocaleString("es")})
                    </span>
                  )}
                  {!hasVoted && !isMine && (
                    <span className="text-[9px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                      votar +5
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {!hasVoted && !isMine && (
          <p className="text-[9px] font-mono text-muted-foreground mt-2 uppercase">
            elige una opcion para ver resultados y reclamar recompensa
          </p>
        )}
        {isMine && ts && (
          <p className="text-[9px] font-mono text-muted-foreground mt-2 uppercase">
            publicada hace {Math.max(1, Math.floor((Date.now() - ts) / 60000))} min · los votos de la comunidad llegan cada pocos segundos
          </p>
        )}
      </article>
    );
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Encuestas tacticas"
        subtitle={`${stats.voted}/${stats.total} votadas · +5 monedas por voto · CREA las tuyas (+1 gema)`}
        icon={<Vote className="w-4 h-4 text-green-hud" />}
        color="green"
        right={
          <Button
            size="sm"
            onClick={() => { setCreateOpen(true); sfx.click(); }}
            className="h-8 px-2.5 font-mono text-[10px] uppercase bg-green-hud/80 border border-green-hud text-black hover:bg-green-hud"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> CREAR ENCUESTA
          </Button>
        }
      />

      {/* Status bar */}
      <div className="hud-corner p-2 flex items-center gap-3 text-[10px] font-mono flex-wrap">
        <span className="text-green-hud flex items-center gap-1">
          <BarChart3 className="w-3 h-3" /> SONDEO CONTINUO
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Coins className="w-3 h-3 text-amber" /> {stats.earned} monedas ganadas votando
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{stats.xp} XP acumulado</span>
        {myPolls.length > 0 && (
          <>
            <span className="text-muted-foreground">·</span>
            <span className="text-amber">{myPolls.length} encuestas tuyas en circulacion</span>
          </>
        )}
        <div className="ml-auto flex items-center gap-1 flex-wrap">
          {["TODAS", "MILITAR", "DIPLOMACIA", "ECONOMIA", "COMUNIDAD"].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "px-1.5 py-0.5 border text-[9px] uppercase",
                filter === c
                  ? "border-green-hud text-green-hud bg-green-hud/30"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ===== TUS ENCUESTAS (v7) ===== */}
      {myPolls.length > 0 && (filter === "TODAS" || filter === "COMUNIDAD") && (
        <>
          <div className="grid gap-3">
            {myPolls.map((p) => {
              void tick;
              const { votes, total } = communityVotes(p);
              return (
                <PollCard
                  key={p.id}
                  id={p.id}
                  question={p.question}
                  options={p.options}
                  category={p.category}
                  conflictTag={p.conflictTag}
                  hoursLeft={72}
                  votes={votes}
                  totalVotes={total}
                  isMine
                  ts={p.ts}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-border" />
            <span>encuestas de la comunidad</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      {/* Polls de la comunidad */}
      <div className="grid gap-3">
        {filtered.map((poll) => (
          <PollCard
            key={poll.id}
            id={poll.id}
            question={poll.question}
            options={poll.options.map((o) => o.label)}
            category={poll.category}
            conflictTag={poll.conflictTag}
            hoursLeft={poll.hoursLeft}
            votes={poll.options.map((o) => o.baseVotes)}
            totalVotes={poll.options.reduce((n, o) => n + o.baseVotes, 0)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="hud-corner p-8 text-center text-muted-foreground">
          <Vote className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-mono">Sin encuestas en esta categoria</p>
        </div>
      )}

      <CreatePollDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(q, opts, cat) => {
          createPoll(q, opts, cat);
          toast.success("¡Encuesta publicada! +10 monedas, +1 GEMA, +5 XP");
          sfx.unlock();
          setFilter("COMUNIDAD");
        }}
      />
    </div>
  );
}

// ====== dialogo CREAR ENCUESTA (v7) ======
function CreatePollDialog({ open, onOpenChange, onCreate }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (question: string, options: string[], category: UserPoll["category"]) => void;
}) {
  const [question, setQuestion] = useState("");
  const [opts, setOpts] = useState(["", ""]);
  const [category, setCategory] = useState<UserPoll["category"]>("COMUNIDAD");
  const [busy, setBusy] = useState(false);

  const reset = () => { setQuestion(""); setOpts(["", ""]); setCategory("COMUNIDAD"); setBusy(false); };

  const submit = () => {
    if (question.trim().length < 8) return toast.error("La pregunta debe tener al menos 8 caracteres");
    const clean = opts.map((o) => o.trim()).filter(Boolean);
    if (clean.length < 2) return toast.error("Necesitas al menos 2 opciones validas");
    if (new Set(clean.map((o) => o.toLowerCase())).size !== clean.length) {
      return toast.error("Las opciones no pueden repetirse");
    }
    setBusy(true);
    setTimeout(() => {
      onCreate(question.trim(), clean, category);
      reset();
      onOpenChange(false);
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!busy) onOpenChange(o); }}>
      <DialogContent className="max-w-md bg-background border-green-hud">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase text-green-hud tracking-wider text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Crear tu pregunta
          </DialogTitle>
          <DialogDescription className="font-mono text-[11px] text-muted-foreground">
            Tu encuesta saldra a la comunidad y recibira votos en vivo. Recompensa: <b className="text-amber">+10 monedas +1 gema</b> +5 XP
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Tu pregunta tactica... ej: Quien domina el frente este?"
            maxLength={140}
            className="h-9 bg-background/60 border-border font-mono text-xs"
          />

          <div className="space-y-1.5">
            {opts.map((o, i) => (
              <div key={i} className="flex gap-1.5">
                <span className="text-[10px] font-mono text-muted-foreground self-center w-4">{i + 1}.</span>
                <Input
                  value={o}
                  onChange={(e) => setOpts((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={`Opcion ${i + 1}`}
                  maxLength={60}
                  className="h-8 bg-background/60 border-border font-mono text-xs"
                />
                {opts.length > 2 && (
                  <button
                    onClick={() => setOpts((prev) => prev.filter((_, j) => j !== i))}
                    className="text-[10px] font-mono text-red-hud px-1 hover:bg-red-hud/20 uppercase"
                    aria-label={`Eliminar opcion ${i + 1}`}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            {opts.length < 4 && (
              <button
                onClick={() => setOpts((prev) => [...prev, ""])}
                className="text-[10px] font-mono text-amber uppercase hover:underline"
              >
                + anadir opcion ({opts.length}/4)
              </button>
            )}
          </div>

          <div className="flex gap-1 flex-wrap">
            {POLL_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "px-2 py-1 border text-[9px] font-mono uppercase",
                  category === c
                    ? "border-green-hud text-green-hud bg-green-hud/20"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <Button
            onClick={submit}
            disabled={busy}
            className="w-full h-9 font-mono text-[11px] uppercase bg-green-hud/80 border border-green-hud text-black hover:bg-green-hud"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Vote className="w-3.5 h-3.5 mr-1" />}
            {busy ? "Publicando..." : "PUBLICAR ENCUESTA"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
