"use client";

// v13 — CRISIS MUNDIAL SEMANAL: cada domingo a las 20:00 TODA la comunidad
// vota juntos para resolver la crisis; la opcion mas votada la resuelve y los
// ganadores se llevan +500 mon. Incluye modo ENTRENAMIENTO FLASH (90s) para
// vivir el ciclo completo en cualquier momento.

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Siren, Timer, Vote, Trophy, History, Zap, Users } from "lucide-react";
import { useGameStore } from "@/lib/game-store";

interface CrisisOption { label: string; desc: string; }
interface Crisis { id: string; title: string; region: string; brief: string; options: CrisisOption[]; }

const CRISES: Crisis[] = [
  {
    id: "cr-hormuz",
    title: "Cierre del Estrecho de Ormuz",
    region: "GOLFO PÉRSICO",
    brief: "Iran ha minado parcialmente el estrecho. El 20% del petróleo mundial está en riesgo. Los tanqueros no pasan y el precio del barril sube 40% en 48 horas. Como comunidad debéis decidir la respuesta global.",
    options: [
      { label: "Escuadrón internacional rompe el bloqueo", desc: "Coalición naval escolta tanqueros bajo fuego. Riesgo de guerra abierta con Teherán." },
      { label: "Negociación + levantamiento de sanciones", desc: "Paquete económico a cambio de desminado verificado. Considerada muestra de debilidad." },
      { label: "Ataque aéreo quirúrgico a las baterías costeras", desc: "Elimina el bloqueo en horas, pero puede escalar a un conflicto regional total." },
      { label: "Rutas alternas + esperar negociación", desc: "Sin derramamiento de sangre, con el suministro global castigado durante meses." },
    ],
  },
  {
    id: "cr-baltico",
    title: "Cable submarino cortado en el Báltico",
    region: "EUROPA NORTE",
    brief: "El cable C-Lion1 que conecta Finlandia con Alemania ha sido cortado por un ancla arrastrada por un buque de bandera de conveniencia. Hay sospechas de sabotaje deliberado y otro cable acaba de perder señal.",
    options: [
      { label: "Embargoo del buque e inspección forzada", desc: "Derecho de visita en alta mar. Escalada diplomática asegurada con el país pabellón." },
      { label: "Patrullas conjuntas OTAN de cables", desc: "Disuasión sin confrontación directa. La evidencia puede desaparecer." },
      { label: "Respuesta ciber ofensiva proporcional", desc: "Golpe silencioso a la infraestructura del sospechoso. Riesgo de ciclo de represalias." },
      { label: "Evidencia ante la ONU y sanciones", desc: "Vía legal pura. Lenta, pero construye caso internacional sólido." },
    ],
  },
  {
    id: "cr-sahel",
    title: "Golpe de Estado en el Sahel + mercenarios",
    region: "ÁFRICA OCCIDENTAL",
    brief: "Una junta recién llegada expulsa a las fuerzas occidentales y firma con 2.000 mercenarios. Tres países vecinos amenazan con intervenir militarmente. La región arde y hay 2M de desplazados.",
    options: [
      { label: "Intervención regional CEDEAO inmediata", desc: "Restaura el orden constitucional o abre una guerra de 5 países." },
      { label: "Sanciones totales y aislamiento", desc: "Estrangula a la junta en meses, mientras la población paga el precio." },
      { label: "Negociar: elecciones en 12 meses a cambio de retirar mercenarios", desc: "Pragmática y arriesgada: la junta puede ganar tiempo." },
      { label: "Apoyo logístico solo a aliados fronterizos", desc: "Contiene el incendio sin quemarse. El problema queda en el patio." },
    ],
  },
  {
    id: "cr-ciber",
    title: "Ciberataque masivo a hospitales europeos",
    region: "CIBERESPACIO",
    brief: "Un ransomware de origen estatal tumba 34 hospitales en 6 países. Hay primeras muertes por colapso de sistemas. El grupo exige rescate y los rastros apuntan a un servicio de inteligencia extranjero.",
    options: [
      { label: "Respuesta ciber inmediata contra infraestructura del atacante", desc: "Potencia de fuego digital con riesgo de escalada en tiempo real." },
      { label: "Artículo 5 ciber: respuesta colectiva OTAN", desc: "Primera activación del artículo ciber: máxima fuerza, máxima escalada." },
      { label: "Operación policial coordinada + pago encubierto", desc: "Recupera sistemas rápido, financia al criminal y sienta precedente." },
      { label: "Defensa, reconstrucción y atribución pública", desc: "Sin contraataque: expone al atacante y endurece defensas a largo plazo." },
    ],
  },
  {
    id: "cr-taiwan",
    title: "Bloqueo de cuarentena sobre Taiwán",
    region: "INDO-PACÍFICO",
    brief: "China declara 'cuarentena militar' para 'inspeccionar' todos los barcos hacia Taiwán. No es una invasión, pero estrangula la isla. Un destructor estadounidense se aproxima con orden de cruzar la línea.",
    options: [
      { label: "El destructor cruza escoltado por aviación", desc: "Reto directo: o Pekín retrocede o hay un incidente naval en minutos." },
      { label: "Puente aéreo civil internacional", desc: "Aviones civiles de muchas banderas desafían la cuarentena. Difícil de bloquear." },
      { label: "Sanción energética + exhibición de fuerza", desc: "Presión económica masiva y despliegue disuasivo sin cruzar la línea." },
      { label: "Condena diplomática y diálogo de emergencia", desc: "Desescala, pero la cuarentena puede consolidarse en un hecho consumado." },
    ],
  },
];

const LS_KEY = "vanguard-crisis-v13";
interface CrisisSave { weekKey: string; voted: boolean; choice: number; flashResolved: number; flashWon: number; history: { title: string; option: string; won: boolean }[]; }

function weekKeyNow(): string {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  const week = Math.floor((d.getTime() - start.getTime()) / (7 * 24 * 3600 * 1000));
  return `${d.getFullYear()}-W${week}`;
}

function nextSunday20(): number {
  const now = new Date();
  const d = new Date(now);
  const day = d.getDay(); // 0 = domingo
  const daysAhead = (7 - day) % 7;
  d.setDate(d.getDate() + daysAhead);
  d.setHours(20, 0, 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 7);
  return d.getTime();
}

// crisis de la semana: rotacion estable por semana
function crisisForWeek(key: string): Crisis {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return CRISES[h % CRISES.length];
}

export function CrisisPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const [crisis, setCrisis] = useState<Crisis>(CRISES[0]);
  const [target, setTarget] = useState(nextSunday20());
  const [remaining, setRemaining] = useState("");
  const [votes, setVotes] = useState<number[]>([]);
  const [myVote, setMyVote] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ crisis: Crisis; votes: number[]; endsAt: number; voted: number | null; resolved: boolean } | null>(null);
  const [save, setSave] = useState<CrisisSave>({ weekKey: "", voted: false, choice: -1, flashResolved: 0, flashWon: 0, history: [] });

  // cargar/rotar crisis semanal
  useEffect(() => {
    const key = weekKeyNow();
    const c = crisisForWeek(key);
    setCrisis(c);
    setVotes(c.options.map(() => 40 + Math.floor(Math.random() * 80)));
    let s: CrisisSave = { weekKey: "", voted: false, choice: -1, flashResolved: 0, flashWon: 0, history: [] };
    try { s = JSON.parse(localStorage.getItem(LS_KEY) ?? "") ?? s; } catch { /* noop */ }
    if (s.weekKey !== key) {
      s = { ...s, weekKey: key, voted: false, choice: -1 };
      localStorage.setItem(LS_KEY, JSON.stringify(s));
    }
    setSave(s);
    setMyVote(s.voted ? s.choice : null);
    if (s.voted && s.choice >= 0) setVotes((v) => v.map((n, i) => (i === s.choice ? n + 12 : n)));
  }, []);

  // tick global: cuenta atras + votos de la comunidad + flash 90s
  useEffect(() => {
    const iv = setInterval(() => {
      // oficial
      const diff = target - Date.now();
      const days = Math.floor(diff / 86400000);
      const hrs = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${days}d ${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`);
      setVotes((v) => v.map((n) => n + (Math.random() < 0.55 ? Math.floor(Math.random() * 3) : 0)));
      // flash
      setFlash((f) => f && !f.resolved ? { ...f, votes: f.votes.map((n) => n + (Math.random() < 0.7 ? Math.floor(Math.random() * 5) : 0)) } : f);
      if (flash && !flash.resolved && Date.now() >= flash.endsAt) {
        resolveFlash();
      }
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, flash?.endsAt, flash?.resolved]);

  const totalVotes = votes.reduce((a, b) => a + b, 0);

  const voteOfficial = (i: number) => {
    if (myVote !== null) return;
    setMyVote(i);
    setVotes((v) => v.map((n, j) => (j === i ? n + 12 : n)));
    const ns = { ...save, voted: true, choice: i };
    setSave(ns);
    localStorage.setItem(LS_KEY, JSON.stringify(ns));
    addCoins(15, "CRISIS MUNDIAL: voto emitido");
    addXp(15);
    toast.success("VOTO REGISTRADO · +15 mon — el domingo 20:00 se resuelve la crisis", { description: "Si tu opción gana: +500 mon" });
  };

  const startFlash = () => {
    const c = CRISES[Math.floor(Math.random() * CRISES.length)];
    setFlash({ crisis: c, votes: c.options.map(() => 10 + Math.floor(Math.random() * 30)), endsAt: Date.now() + 90_000, voted: null, resolved: false });
  };

  // liquidacion del flash FUERA de updaters (evita setState-en-render)
  const flashRef = useRef(flash);
  useEffect(() => { flashRef.current = flash; }, [flash]);

  const resolveFlash = useCallback(() => {
    const f = flashRef.current;
    if (!f || f.resolved) return;
    const winner = f.votes.indexOf(Math.max(...f.votes));
    const won = f.voted === winner;
    setFlash({ ...f, resolved: true });
    if (f.voted !== null && f.voted >= 0) {
      if (won) {
        addCoins(500, "CRISIS MUNDIAL FLASH: resolución ganadora");
        addXp(80);
        toast.success("CRISIS RESUELTA · tu opción ganó · +500 mon · +80 xp");
      } else {
        toast.error(`CRISIS RESUELTA · ganó "${f.crisis.options[winner].label}"`);
      }
      const ns = { ...save, flashResolved: save.flashResolved + 1, flashWon: save.flashWon + (won ? 1 : 0), history: [{ title: f.crisis.title, option: f.crisis.options[f.voted].label, won }, ...save.history].slice(0, 8) };
      setSave(ns);
      localStorage.setItem(LS_KEY, JSON.stringify(ns));
    }
  }, [save, addCoins, addXp]);

  const flashTotal = flash ? flash.votes.reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Crisis Mundial Semanal"
        subtitle="Domingo 20:00 · toda la comunidad vota y la opción más votada resuelve"
        icon={<Siren className="w-4 h-4 text-crisis" />}
        color="red"
      />

      {/* CRISIS OFICIAL */}
      <div className="hud-panel sombra-crisis border-crisis-hud p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-crisis-hud border border-crisis-hud text-crisis font-mono text-[9px] font-bold tracking-widest">CRISIS OFICIAL</span>
            <span className="font-mono text-[9px] text-muted-foreground tracking-widest">{crisis.region}</span>
          </div>
          <div className="flex items-center gap-1.5 font-tech text-base font-bold text-crisis tabular-nums">
            <Timer className="w-4 h-4" /> {remaining}
          </div>
        </div>
        <h3 className="font-display text-lg font-bold tracking-wide mb-1">{crisis.title}</h3>
        <p className="text-xs text-soft/85 leading-relaxed mb-3">{crisis.brief}</p>

        <div className="space-y-2">
          {crisis.options.map((o, i) => {
            const pct = totalVotes ? Math.round((votes[i] / totalVotes) * 100) : 0;
            const mine = myVote === i;
            return (
              <button
                key={i}
                onClick={() => voteOfficial(i)}
                disabled={myVote !== null}
                className={cn(
                  "w-full text-left hud-corner border p-2.5 vg-transition",
                  mine ? "border-neon-hud neon-green-border" : "border-border hover:border-electric-hud",
                  myVote !== null && !mine && "opacity-60"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-tech text-sm font-bold flex items-center gap-1.5">
                    {mine && <Vote className="w-3.5 h-3.5 text-neon" />} {o.label}
                  </span>
                  <span className="font-tech text-sm font-bold tabular-nums text-electric">{pct}%</span>
                </div>
                <div className="h-1 bg-secondary overflow-hidden mb-1">
                  <motion.div className={cn("h-full", mine ? "bg-neon" : "bg-electric")} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
                </div>
                <div className="text-[10px] text-muted-foreground leading-snug">{o.desc}</div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mt-2 font-mono text-[9px] text-muted-foreground">
          <Users className="w-3 h-3" /> {totalVotes.toLocaleString()} agentes votando en vivo
          {myVote === null ? <span className="ml-auto text-amber">TU VOTO VALE x12 · +15 mon por participar</span> : <span className="ml-auto text-neon">VOTO REGISTRADO</span>}
        </div>
      </div>

      {/* FLASH DE ENTRENAMIENTO */}
      <div className="hud-panel p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Entrenamiento flash (90 segundos)
            </div>
            <div className="text-[10px] text-muted-foreground">Mismo formato, resolución inmediata · recompensa +500 mon</div>
          </div>
          {!flash && (
            <Button variant="outline" size="sm" onClick={startFlash} className="font-mono text-[10px] uppercase tracking-widest border-amber-hud text-amber">
              Empezar flash
            </Button>
          )}
        </div>

        <AnimatePresence>
          {flash && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-tech text-sm font-bold">{flash.crisis.title}</h4>
                {!flash.resolved && (
                  <span className="font-tech text-sm text-crisis tabular-nums">
                    {Math.max(0, Math.ceil((flash.endsAt - Date.now()) / 1000))}s
                  </span>
                )}
                {flash.resolved && <span className="font-mono text-[9px] text-neon tracking-widest uppercase">RESUELTA</span>}
              </div>
              <div className="space-y-1.5">
                {flash.crisis.options.map((o, i) => {
                  const pct = flashTotal ? Math.round((flash.votes[i] / flashTotal) * 100) : 0;
                  const isWinner = flash.resolved && i === flash.votes.indexOf(Math.max(...flash.votes));
                  const mine = flash.voted === i;
                  return (
                    <button
                      key={i}
                      disabled={flash.voted !== null || flash.resolved}
                      onClick={() => {
                        setFlash((f) => (f ? { ...f, voted: i, votes: f.votes.map((n, j) => (j === i ? n + 10 : n)) } : f));
                        addXp(10);
                      }}
                      className={cn(
                        "w-full text-left px-2 py-1.5 border vg-transition font-mono text-[10px]",
                        isWinner ? "border-neon-hud bg-neon-hud text-neon" : mine ? "border-electric-hud text-electric" : "border-border hover:border-amber-hud",
                        flash.voted !== null && !mine && !isWinner && "opacity-60"
                      )}
                    >
                      <span className="font-bold">{o.label}</span>
                      <span className="float-right tabular-nums">{pct}%</span>
                    </button>
                  );
                })}
              </div>
              {flash.resolved && (
                <Button variant="outline" size="sm" onClick={() => setFlash(null)} className="mt-2 font-mono text-[9px] uppercase tracking-widest">
                  Cerrar
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* historial */}
      {save.history.length > 0 && (
        <div className="hud-panel p-3">
          <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <History className="w-3 h-3" /> Tus crisis · {save.flashWon}/{save.flashResolved} ganadas
          </div>
          {save.history.map((h, i) => (
            <div key={i} className="flex items-center gap-2 py-1 border-b border-border/40 last:border-0">
              <Trophy className={cn("w-3.5 h-3.5 flex-shrink-0", h.won ? "text-neon" : "text-muted-foreground")} />
              <div className="min-w-0">
                <div className="font-mono text-[10px] truncate">{h.title}</div>
                <div className="font-mono text-[8px] text-muted-foreground truncate">{h.option}</div>
              </div>
              <span className={cn("ml-auto font-mono text-[9px] font-bold flex-shrink-0", h.won ? "text-neon" : "text-crisis")}>{h.won ? "+500" : "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
