"use client";

// Vanguard v7 — Encuestas tacticas: vota las encuestas de la comunidad
// y CREA TUS PROPIAS PREGUNTAS (+10 monedas +1 gema). Los votos de la comunidad
// llegan en vivo (simulacion determinista por tiempo transcurrido).
import { useEffect, useMemo, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import {
  Vote, Clock, CheckCircle2, Coins, BarChart3, Plus, Loader2, Users, Globe2, Flame,
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
import { HeroOro } from "@/components/vanguard/hero-oro";

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
      <HeroOro panel="encuestas" />
      <PanelHeader
        title="Encuestas del mundo"
        subtitle={`${stats.voted}/${stats.total} votadas · ENCUESTA DEL MUNDO +25ⓒ/día · crea las tuyas (+1 gema)`}
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

      {/* ===== LA ENCUESTA DEL MUNDO (v85) — la más importante del planeta ===== */}
      <EncuestaDelMundo />

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

// ===== v85.0 LA ENCUESTA DEL MUNDO — la encuesta que mueve el planeta =====
// Una gran pregunta cada día, paga el doble, con racha de voto y un termómetro
// que reacciona: el mundo está dentro de Vanguard y opina.
const LS_ENC_MUNDO = "vanguard-polls-mundo-v85";

interface EncMundoState {
  day: number;
  choice: number | null;
  streak: number;
  lastDay: number;
}

function loadEncMundo(): EncMundoState {
  try {
    const raw = localStorage.getItem(LS_ENC_MUNDO);
    if (raw) return JSON.parse(raw) as EncMundoState;
  } catch { /* noop */ }
  return { day: -1, choice: null, streak: 0, lastDay: -1 };
}

const PREGUNTAS_MUNDO: { q: string; opts: string[] }[] = [
  { q: "¿Qué decide la próxima década mundial: las chips o los estrechos?", opts: ["Semiconductores: quien fabrica, manda", "Estrechos: quien bloquea, negocia", "La energía: petróleo y gas otra vez", "La demografía: país vacío no hace guerra"] },
  { q: "Si estalla una crisis en el Ártico, el detonante será...", opts: ["Rutas marítimas libres de hielo", "Gas y petróleo bajo el permafrost", "Militarización de islas del norte", "Pesca en aguas en disputa"] },
  { q: "¿Qué alianza se verá sometida a la prueba más dura este año?", opts: ["La OTAN y sus compromisos del este", "El eje económico entre gigantes asiáticos", "Las alianzas regionales del Sahel", "Los tratados del Pacífico sur"] },
  { q: "Un país se queda sin agua dulce y su vecino la tiene. ¿Qué pasa primero?", opts: ["Tratado de aguas con inspección conjunta", "Migración masiva hacia la frontera", "Escaramuzas en el río fronterizo", "Mediación internacional inmediata"] },
  { q: "El arma más decisiva del próximo conflicto será...", opts: ["Drones autónomos en enjambre", "Ciberataques a infraestructura", "Artillería de largo alcance", "Satélites y su vigilancia total"] },
  { q: "¿Qué espanta más a los mercados globales hoy?", opts: ["Un estrecho bloqueado siete días", "Un banco sistémico al borde del colapso", "Una escalada nuclear verbal", "La escasez de chips estratégicas"] },
  { q: "La próxima gran ciudad en riesgo de conflicto urbano está en...", opts: ["El frente del este europeo", "El Sahel y su cinturón de golpes", "El sudeste asiático marítimo", "El Levante, otra vez"] },
  { q: "Un estado fracasa y armas nucleares quedan sin control. ¿Quién actúa?", opts: ["Coalición multinacional con mandato", "El vecino regional más fuerte", "Nadie: parálisis del Consejo", "Contratistas privados por delegación"] },
  { q: "¿Qué frontera volverá a cambiar en tu vida?", opts: ["La del mar Negro", "La de Corea: congelada 70 años", "La del Cáucaso", "La de un archipiélago del Pacífico"] },
  { q: "La inteligencia del futuro la harán...", opts: ["Satélites que leen patentes y sombras", "IA que junta millones de cables", "Humanos infiltrados, como siempre", "Ciudadanos con móviles: OSINT total"] },
  { q: "Una superpotencia cae económicamente sin guerra. ¿Qué gana su rival?", opts: ["Influencia sin disparar", "La obligación de rescatarlo", "Un socio comercial inestable", "Fronteras imposibles de vigilar"] },
  { q: "¿Cuál es el recurso que provocará el próximo bloqueo naval?", opts: ["Gas natural licuado", "Granos y trigo", "Tierras raras y litio", "Componentes para semiconductores"] },
  { q: "¿Qué golpe derrumba la moral de un ejército moderno más rápido?", opts: ["Perder a sus oficiales en una emboscada", "Que hackeen sus pagos y comunicaciones", "Ver su capital en televisión bajo ataque", "Un motín de unidades aliadas"] },
  { q: "El mundo empieza a regular la IA militar. ¿La cláusula imposible de verificar será...", opts: ["La autonomía letal total", "El entrenamiento con datos de guerra", "Los enjambres indistinguibles", "La IA en comando nuclear"] },
];

function diaActual(): number {
  return Math.floor(Date.now() / 86400000);
}

function EncuestaDelMundo() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const [st, setSt] = useState<EncMundoState>(() => loadEncMundo());
  const [tick, setTick] = useState(0);

  const dia = diaActual();
  const preg = PREGUNTAS_MUNDO[dia % PREGUNTAS_MUNDO.length];
  const votada = st.day === dia && st.choice !== null;

  useEffect(() => {
    if (st.day !== dia) {
      // nuevo día: resetea elección pero conserva racha si votó ayer
      const ayer = dia - 1;
      const racha = st.lastDay === ayer ? st.streak : 0;
      const next: EncMundoState = { day: dia, choice: null, streak: racha, lastDay: st.lastDay };
      setSt(next);
      try { localStorage.setItem(LS_ENC_MUNDO, JSON.stringify(next)); } catch { /* noop */ }
    }
  }, [dia, st.day, st.lastDay, st.streak]);

  // votos de la comunidad en vivo (determinista por día+opción+slot de 10 s)
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const votosComunidad = useMemo(() => {
    void tick;
    const elapsedSlots = Math.floor((Date.now() % 86400000) / 10000);
    const votes = preg.opts.map((_, i) => {
      let v = 0;
      for (let s = Math.max(0, elapsedSlots - 60); s <= elapsedSlots; s++) {
        const r = hash01(`mundo:${dia}:${i}:${s}`);
        const p = 0.5 / preg.opts.length * (i === 0 ? 1.25 : 1);
        if (r < p) v += 1;
      }
      return 1800 + v * 4; // base masiva: el mundo entero vota
    });
    return votes;
  }, [dia, preg, tick]);

  const votar = (idx: number) => {
    if (votada) return;
    const ayer = dia - 1;
    const racha = st.lastDay === ayer ? st.streak + 1 : 1;
    const next: EncMundoState = { day: dia, choice: idx, streak: racha, lastDay: dia };
    setSt(next);
    try { localStorage.setItem(LS_ENC_MUNDO, JSON.stringify(next)); } catch { /* noop */ }
    addCoins(25, "ENCUESTA DEL MUNDO · voto del día");
    addXp(25);
    sfx.success();
    if (racha > 0 && racha % 3 === 0) {
      addCoins(50, `Racha de voto ${racha} días en la Encuesta del Mundo`);
      toast.success(`Racha de ${racha} días: bonus +50 monedas`);
    } else {
      toast.success("Voto registrado en la Encuesta del Mundo (+25 monedas, +25 XP)");
    }
  };

  // el mundo reacciona: delta de tensión determinista por (día, elección)
  const delta = votada ? ((hash01(`delta:${dia}:${st.choice}`) * 3.2 - 1.1)) : 0;
  const totalVotos = votosComunidad.reduce((a, b) => a + b, 0) + (votada ? 1 : 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative border-2 border-amber-hud p-4 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-amber-hud/10 via-transparent to-amber-hud/5 pointer-events-none"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5" /> LA ENCUESTA DEL MUNDO · EDICIÓN DE HOY
          </p>
          <span className="text-[9px] font-mono uppercase border border-amber-hud text-amber px-1.5 py-0.5 flex items-center gap-1">
            <Flame className="w-3 h-3" /> racha {st.streak} d
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-black text-foreground leading-snug mb-1">{preg.q}</h2>
        <p className="text-[10px] font-mono text-muted-foreground mb-3 flex items-center gap-1.5 flex-wrap">
          <Users className="w-3 h-3 text-green-hud" />
          {(totalVotos / 1000).toFixed(1)}M operadores votando en todo el planeta
          <span>·</span>
          <span className="text-amber font-bold">paga el DOBLE: +25ⓒ +25 XP</span>
        </p>

        <div className="space-y-1.5">
          {preg.opts.map((opt, idx) => {
            const v = votosComunidad[idx] + (votada && st.choice === idx ? 1 : 0);
            const pct = Math.round((v / totalVotos) * 100);
            const esMiVoto = votada && st.choice === idx;
            return (
              <button
                key={idx}
                disabled={votada}
                onClick={() => votar(idx)}
                className={cn(
                  "relative w-full text-left border transition-colors overflow-hidden group",
                  votada ? "cursor-default border-border/60" : "border-border hover:border-amber-hud cursor-pointer",
                  esMiVoto && "border-green-hud"
                )}
              >
                {votada && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.12 * idx }}
                    className={cn("absolute inset-y-0 left-0", esMiVoto ? "bg-green-hud/30" : "bg-secondary")}
                  />
                )}
                <span className="relative z-10 flex items-center justify-between px-2.5 py-2">
                  <span className={cn("text-xs font-mono", esMiVoto ? "text-green-hud font-bold" : "text-foreground/90")}>
                    {opt}{esMiVoto && " · TU VOTO"}
                  </span>
                  {votada && <span className="text-[10px] font-mono text-muted-foreground ml-2 flex-shrink-0">{pct}%</span>}
                  {!votada && (
                    <span className="text-[9px] font-mono text-amber uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                      votar +25
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {votada ? (
          <div className="mt-3 border border-amber-hud/50 bg-amber-hud/10 p-2.5 flex items-start gap-2">
            <BarChart3 className="w-4 h-4 text-amber mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-foreground/90 leading-relaxed">
              <span className="text-amber font-bold">El mundo reacciona a tu voto:</span> el termómetro
              de tensión de Vanguard se mueve <span className={cn("font-mono font-bold", delta >= 0 ? "text-red-hud" : "text-green-hud")}>
                {delta >= 0 ? "+" : ""}{delta.toFixed(1)}
              </span> puntos.
              La encuesta de mañana se decide a medianoche.
            </p>
          </div>
        ) : (
          <p className="text-[9px] font-mono text-muted-foreground mt-2 uppercase">
            un voto por día · racha cada 3 días paga bonus +50ⓒ · tu voto empuja el termómetro del mundo
          </p>
        )}
      </div>
    </motion.article>
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
