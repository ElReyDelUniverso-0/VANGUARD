"use client";

// Vanguard v11 — ARCHIVOS NACION: DETECTIVE MULTIJUGADOR (cliente).
// Juego de deduccion social por salas contra operadores reales + IA (:3003).
// INVESTIGACION (acciones: registrar ubicaciones / interrogar) -> DELIBERACION ->
// JUICIO (acusacion) -> VEREDICTO con recap real + recompensas.
// ENGAÑO: un INSTIGADOR infiltrado conoce al culpable, planta pistas falsas y desvia votos.
// Riesgo real: pagas fianza al entrar — aciertas y duplicas, fallas y la pierdes.
import { useEffect, useMemo, useRef, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import {
  Search, Fingerprint, Gavel, Timer, ShieldAlert, Eye, FileSearch, UserSearch,
  Crown, Landmark, Radio, Archive, MapPin, Users, ScrollText, Siren, CheckCircle2, XCircle,
  MessageSquare, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/game-store";
import { getRealtime } from "@/lib/realtime";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ================= tipos espejo del servidor =================
interface DetSuspect { arch: string; name: string; desc: string; motive: string }
interface DetLocation { id: string; name: string; desc: string; cluesLeft: number }
interface DetBoardClue {
  id: string; suspectId: string; text: string;
  reliability: "ALTA" | "MEDIA" | "BAJA"; anonymous: boolean; locationId: string | null;
}
interface DetChatMsg { id: string; name: string; body: string; ts: number; bot?: boolean }
interface DetState {
  caseId: string; matchId: number;
  phase: "LOBBY" | "INVESTIGACION" | "DELIBERACION" | "JUICIO" | "VEREDICTO";
  phaseEnds: number; startAt: number | null;
  players: { id: string; name: string; isBot: boolean; connected: boolean; voteDone: boolean; actions: number }[];
  suspects: DetSuspect[];
  locations: DetLocation[];
  board: DetBoardClue[];
  votesCast: number;
  log: { ts: number; msg: string; color?: string }[];
  chat?: DetChatMsg[]; // v17: chat libre de la sala
  verdict: { guiltyId: string; accusedId: string; correct: boolean; tally: Record<string, number>; recap: string } | null;
  title: string; tagline: string; year: string; country: string;
  stake: number; briefing: string; difficulty: number;
}
interface DetMe {
  caseId: string | null; matchId?: number; phase?: string;
  inMatch: boolean; role: "DETECTIVE" | "INSTIGADOR" | null;
  actions: number; planted: boolean; myVote: string | null;
  guilty?: string | null;
}
interface DetRoomInfo {
  caseId: string; country: string; title: string; tagline: string; year: string;
  difficulty: number; stake: number;
  phase: string; startAt: number | null; phaseEnds: number;
  humans: number; players: number; hasVerdict: boolean;
}

const LOCS_ICON: Record<string, React.ReactNode> = {
  archivo: <Archive className="w-3.5 h-3.5" />,
  frontera: <MapPin className="w-3.5 h-3.5" />,
  cafe: <Landmark className="w-3.5 h-3.5" />,
  radio: <Radio className="w-3.5 h-3.5" />,
  puente: <MapPin className="w-3.5 h-3.5" />,
  embajada: <Landmark className="w-3.5 h-3.5" />,
  cripto: <FileSearch className="w-3.5 h-3.5" />,
  puerto: <MapPin className="w-3.5 h-3.5" />,
  radar: <Radio className="w-3.5 h-3.5" />,
  kremlin: <Archive className="w-3.5 h-3.5" />,
  hotel: <Landmark className="w-3.5 h-3.5" />,
  exteriores: <Archive className="w-3.5 h-3.5" />,
  espejos: <Landmark className="w-3.5 h-3.5" />,
  quai: <Archive className="w-3.5 h-3.5" />,
  crillon: <Landmark className="w-3.5 h-3.5" />,
  prensa: <Radio className="w-3.5 h-3.5" />,
  cuartel: <Archive className="w-3.5 h-3.5" />,
  astillero: <MapPin className="w-3.5 h-3.5" />,
  bolsa: <Landmark className="w-3.5 h-3.5" />,
};

const REL_STYLE: Record<string, string> = {
  ALTA: "border-green-hud text-green-hud bg-green-hud/10",
  MEDIA: "border-amber-hud text-amber bg-amber-hud/10",
  BAJA: "border-red-hud text-red-hud bg-red-hud/10",
};

const PHASE_LABEL: Record<string, string> = {
  LOBBY: "SALA DE ESPERA",
  INVESTIGACION: "INVESTIGACION",
  DELIBERACION: "DELIBERACION",
  JUICIO: "JUICIO",
  VEREDICTO: "VEREDICTO",
};

interface DetStats { cases: number; solved: number; escapes: number; earned: number; lost: number }
const DET_STATS_KEY = "vanguard-detective-stats";
function loadStats(): DetStats {
  if (typeof window === "undefined") return { cases: 0, solved: 0, escapes: 0, earned: 0, lost: 0 };
  try { return JSON.parse(localStorage.getItem(DET_STATS_KEY) ?? "") as DetStats; } catch { return { cases: 0, solved: 0, escapes: 0, earned: 0, lost: 0 }; }
}
function saveStats(s: DetStats) { localStorage.setItem(DET_STATS_KEY, JSON.stringify(s)); }

function useDetPid() {
  return useMemo(() => {
    if (typeof window === "undefined") return "anon";
    let id = localStorage.getItem("vanguard-det-uid");
    if (!id) {
      id = `det-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
      localStorage.setItem("vanguard-det-uid", id);
    }
    return id;
  }, []);
}

export function DetectivePanel() {
  const pid = useDetPid();
  const alias = useGameStore((s) => s.alias);
  const coins = useGameStore((s) => s.coins);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const addCoins = useGameStore((s) => s.addCoins);
  const addGems = useGameStore((s) => s.addGems);
  const addXp = useGameStore((s) => s.addXp);

  const [rooms, setRooms] = useState<DetRoomInfo[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [state, setState] = useState<DetState | null>(null);
  const [me, setMe] = useState<DetMe>({ caseId: null, inMatch: false, role: null, actions: 0, planted: false, myVote: null });
  const [connected, setConnected] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [stats, setStats] = useState<DetStats>({ cases: 0, solved: 0, escapes: 0, earned: 0, lost: 0 });
  const [plantTarget, setPlantTarget] = useState<string>("");
  const [chatDraft, setChatDraft] = useState("");
  const rewardedRef = useRef<string>(""); // `${caseId}:${matchId}` ya recompensado
  const stakeRef = useRef<number>(0);

  // reloj local
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // stats
  useEffect(() => { setStats(loadStats()); }, []);

  // DEBUG v11: estado expuesto para verificacion E2E (no afecta gameplay)
  useEffect(() => {
    (window as unknown as { __detDebug?: unknown }).__detDebug = { me, verdict: state?.verdict, phase: state?.phase, caseId: state?.caseId, matchId: state?.matchId };
  }, [me, state?.verdict, state?.phase, state?.caseId, state?.matchId]);

  // socket
  useEffect(() => {
    const socket = getRealtime();
    if (!socket) return;
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onRooms = (list: DetRoomInfo[]) => setRooms(list ?? []);
    const onState = (s: DetState) => setState(s);
    const onMe = (m: DetMe) => setMe(m);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("det:rooms", onRooms);
    socket.on("det:state", onState);
    socket.on("det:me", onMe);
    if (socket.connected) {
      onConnect();
      socket.emit("det:subscribe", { caseId: null, pid });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("det:rooms", onRooms);
      socket.off("det:state", onState);
      socket.off("det:me", onMe);
    };
  }, [pid]);

  // subscripcion al caso abierto
  useEffect(() => {
    const socket = getRealtime();
    if (!socket || !socket.connected) return;
    socket.emit("det:subscribe", { caseId: selected, pid });
  }, [selected, pid, connected]);

  // pago de recompensas al llegar el veredicto (una sola vez por partida)
  useEffect(() => {
    if (!state?.verdict || !me.inMatch) return;
    const key = `${state.caseId}:${state.matchId}`;
    if (rewardedRef.current === key) return;
    rewardedRef.current = key;
    const v = state.verdict;
    const stake = stakeRef.current || state.stake;
    const wasInstigador = me.role === "INSTIGADOR";
    let msg = "";
    if (wasInstigador && !v.correct) {
      const win = stake * 3;
      addCoins(win, "Detective: escape perfecto del instigador");
      addGems(5, "Instigador victorioso");
      addXp(50);
      msg = `ESCAPE PERFECTO: +${win} mon, +5 gemas`;
      toast.success(msg);
      sfx.achievement();
      setStats((s) => { const n = { ...s, cases: s.cases + 1, escapes: s.escapes + 1, earned: s.earned + win }; saveStats(n); return n; });
    } else if (me.myVote === v.guiltyId) {
      if (v.correct) {
        const win = Math.round(stake * 2.5);
        addCoins(win, "Detective: acusacion correcta unanime");
        addGems(2, "Caso resuelto");
        addXp(40);
        msg = `CASO RESUELTO: +${win} mon, +2 gemas`;
        toast.success(msg);
        sfx.achievement();
        setStats((s) => { const n = { ...s, cases: s.cases + 1, solved: s.solved + 1, earned: s.earned + win }; saveStats(n); return n; });
      } else {
        // votaste bien cuando la mayoria fallo: genio individual
        const win = stake * 2;
        addCoins(win, "Detective: tu acusacion era la correcta");
        addGems(1, "Ojo clinico");
        addXp(30);
        msg = `TU ESTABAS EN LO CIERTO: +${win} mon, +1 gema`;
        toast.success(msg);
        sfx.unlock();
        setStats((s) => { const n = { ...s, cases: s.cases + 1, solved: s.solved + 1, earned: s.earned + win }; saveStats(n); return n; });
      }
    } else {
      addXp(10);
      msg = `Acusacion fallida: la fianza (${stake} mon) queda en el archivo`;
      toast.error(msg);
      sfx.error();
      setStats((s) => { const n = { ...s, cases: s.cases + 1, lost: s.lost + stake }; saveStats(n); return n; });
    }
  }, [state?.verdict, me.inMatch, me.role, me.myVote, addCoins, addGems, addXp, state?.caseId, state?.matchId, state?.stake]);

  const openCase = (caseId: string) => {
    sfx.tab();
    setSelected(caseId);
    setState(null);
    const socket = getRealtime();
    socket?.emit("det:subscribe", { caseId, pid });
  };

  const backToList = () => {
    sfx.click();
    const socket = getRealtime();
    if (state?.caseId && me.inMatch) socket?.emit("det:leave", { caseId: state.caseId, pid });
    setSelected(null);
    setState(null);
    setMe({ caseId: null, inMatch: false, role: null, actions: 0, planted: false, myVote: null });
  };

  const joinCase = (info: DetRoomInfo) => {
    if (!spendCoins(info.stake, `Detective: fianza del caso ${info.title}`)) {
      toast.error(`Fondos insuficientes: necesitas ${info.stake} mon de fianza`);
      sfx.error();
      return;
    }
    stakeRef.current = info.stake;
    const socket = getRealtime();
    socket?.emit("det:join", { caseId: info.caseId, pid, name: alias || "DETECTIVE" }, (r: { ok: boolean; reason?: string }) => {
      if (r?.ok) {
        toast.success(`Fianza pagada (${info.stake} mon). Recuperala duplicandola al resolver el caso`);
        sfx.unlock();
        openCase(info.caseId);
      } else {
        toast.error(r?.reason ?? "No se pudo unir al caso");
        sfx.error();
      }
    });
  };

  const act = (event: string, payload: Record<string, unknown>, cb?: (r: { ok: boolean; answer?: string; reason?: string }) => void) => {
    const socket = getRealtime();
    if (!state) return;
    socket?.emit(event, { caseId: state.caseId, pid, ...payload }, cb);
  };

  // v17: enviar mensaje al chat libre de la sala
  const sendDetChat = () => {
    const body = chatDraft.trim();
    if (!body || !state) return;
    getRealtime()?.emit("det:chat", { caseId: state.caseId, pid, body }, (r: { ok: boolean; reason?: string } | undefined) => {
      if (!r?.ok) toast.error(r?.reason ?? "No se pudo enviar");
      else setChatDraft("");
    });
  };

  const secondsLeft = (target: number) => Math.max(0, Math.ceil((target - now) / 1000));

  // ================= LISTA DE CASOS =================
  if (!selected) {
    return (
      <div className="space-y-3">
        <PanelHeader
          title="Archivos Nacion — Detective"
          subtitle="Deduccion social multijugador · un caso por pais · engaño, pistas y juicio final"
          icon={<Fingerprint className="w-4 h-4 text-violet-hud" />}
          color="violet"
          right={
            <span className={cn(
              "flex items-center gap-1.5 text-[9px] font-mono px-2 py-1 border uppercase",
              connected ? "border-green-hud text-green-hud bg-green-hud/20" : "border-red-hud text-red-hud"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", connected ? "bg-green-hud blink-soft" : "bg-red-hud")} />
              {connected ? "ARCHIVO OK" : "OFFLINE"}
            </span>
          }
        />
        <div className="hud-corner p-3 text-[11px] font-mono text-muted-foreground leading-relaxed">
          <b className="text-amber">COMO SE JUEGA:</b> pagas la fianza del caso y entras con 5 acciones.
          Registra ubicaciones y interroga sospechosos para llenar el tablero de pistas — pero cuidado:
          <b className="text-red-hud"> un instigador infiltrado</b> planta pruebas falsas para que acuses a un inocente.
          En el juicio, la mayoria decide. Aciertan los detectives y duplican; fallan y pierden la fianza.
          Si el instigador eres tu... protege al culpable a cualquier precio.
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.map((r) => (
            <motion.div key={r.caseId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="hud-corner p-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FlagBadge code={r.country} size="lg" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono font-bold text-foreground uppercase leading-tight truncate">{r.title}</p>
                    <p className="text-[9px] font-mono text-muted-foreground">{r.tagline} · {r.year}</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 border border-border/60 text-muted-foreground whitespace-nowrap">
                  {"★".repeat(r.difficulty)}{"☆".repeat(3 - r.difficulty)}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[9px] font-mono">
                <span className={cn(
                  "px-1.5 py-0.5 border uppercase font-bold",
                  r.phase === "LOBBY" && "border-cyan-hud text-cyan-hud bg-cyan-hud/20",
                  r.phase === "INVESTIGACION" && "border-amber-hud text-amber bg-amber-hud/20",
                  (r.phase === "DELIBERACION" || r.phase === "JUICIO") && "border-red-hud text-red-hud bg-red-hud/20",
                  r.phase === "VEREDICTO" && "border-green-hud text-green-hud bg-green-hud/20"
                )}>
                  {PHASE_LABEL[r.phase] ?? r.phase}
                </span>
                <span className="text-muted-foreground flex items-center gap-0.5"><Users className="w-3 h-3" />{r.humans} real · {r.players}</span>
                <span className="text-amber">{r.stake} mon fianza</span>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <Button
                  size="sm"
                  onClick={() => (r.phase === "DELIBERACION" || r.phase === "JUICIO" ? openCase(r.caseId) : joinCase(r))}
                  className={cn(
                    "flex-1 h-8 font-mono text-[10px] uppercase tracking-wider",
                    r.phase === "LOBBY" || r.phase === "INVESTIGACION"
                      ? "bg-violet-hud/30 border-violet-hud text-violet-hud hover:bg-violet-hud/50"
                      : "bg-secondary border-border text-muted-foreground"
                  )}
                >
                  {(r.phase === "LOBBY" || r.phase === "INVESTIGACION") ? `Unirse · ${r.stake} mon` : r.phase === "VEREDICTO" ? "Ver veredicto" : "Observar"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => openCase(r.caseId)} className="h-8 font-mono text-[10px] uppercase border-border text-muted-foreground">
                  Ver
                </Button>
              </div>
            </motion.div>
          ))}
          {rooms.length === 0 && (
            <div className="hud-corner p-10 text-center sm:col-span-2 lg:col-span-3">
              <ScrollText className="w-8 h-8 mx-auto mb-3 text-amber animate-pulse" />
              <p className="text-sm font-mono text-muted-foreground uppercase">Abriendo los archivos nacion...</p>
            </div>
          )}
        </div>
        <div className="hud-corner p-3 flex flex-wrap items-center gap-4 text-[10px] font-mono">
          <span className="text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Crown className="w-3.5 h-3.5 text-amber" /> Tu expediente</span>
          <span>casos: <b className="text-foreground">{stats.cases}</b></span>
          <span className="text-green-hud">resueltos: <b>{stats.solved}</b></span>
          <span className="text-red-hud">fianzas perdidas: <b>{stats.lost}</b> mon</span>
          <span className="text-amber">ganado: <b>{stats.earned}</b> mon</span>
          <span className="text-violet-hud">escapes como instigador: <b>{stats.escapes}</b></span>
        </div>
      </div>
    );
  }

  // ================= VISTA DE CASO =================
  const joined = me.inMatch;
  const isInstigador = me.role === "INSTIGADOR";
  const suspects = state?.suspects ?? [];
  const board = state?.board ?? [];
  const log = [...(state?.log ?? [])].reverse();
  const phase = state?.phase ?? "LOBBY";
  const canAct = joined && (phase === "INVESTIGACION" || phase === "DELIBERACION") && me.actions > 0;
  const canVote = joined && phase === "JUICIO" && !me.myVote;

  return (
    <div className="space-y-3">
      <PanelHeader
        title={state?.title ?? "Caso clasificado"}
        subtitle={`${state?.tagline ?? ""} ${state?.year ?? ""} · fianza ${state?.stake ?? 0} mon · ${joined ? `${me.actions} acciones` : "espectador"}`}
        icon={<Fingerprint className="w-4 h-4 text-violet-hud" />}
        color="violet"
        right={
          <Button size="sm" variant="outline" onClick={backToList} className="h-7 font-mono text-[10px] uppercase border-border text-muted-foreground">
            Salir del caso
          </Button>
        }
      />

      {/* barra de fase */}
      <div className="hud-corner p-2 flex items-center gap-3 text-[10px] font-mono flex-wrap">
        <span className={cn(
          "px-2 py-0.5 border font-bold uppercase tracking-wider",
          phase === "LOBBY" && "border-cyan-hud text-cyan-hud bg-cyan-hud/20",
          phase === "INVESTIGACION" && "border-amber-hud text-amber bg-amber-hud/20",
          phase === "DELIBERACION" && "border-violet-hud text-violet-hud bg-violet-hud/20",
          phase === "JUICIO" && "border-red-hud text-red-hud bg-red-hud/20 blink-soft",
          phase === "VEREDICTO" && "border-green-hud text-green-hud bg-green-hud/20"
        )}>
          {PHASE_LABEL[phase] ?? phase}
        </span>
        {state && (phase === "INVESTIGACION" || phase === "DELIBERACION" || phase === "JUICIO") && (
          <span className="text-foreground flex items-center gap-1"><Timer className="w-3 h-3 text-amber" /> {secondsLeft(state.phaseEnds)}s</span>
        )}
        {state?.phase === "LOBBY" && state?.startAt && (
          <span className="text-foreground flex items-center gap-1"><Timer className="w-3 h-3 text-amber" /> investigacion en {secondsLeft(state.startAt)}s</span>
        )}
        <span className="text-muted-foreground">{state?.players.length ?? 0} en la sala · {state?.votesCast ?? 0} votos emitidos</span>
        {joined && (
          <span className="ml-auto text-amber uppercase">tus acciones: {me.actions}</span>
        )}
      </div>

      {/* banner de rol */}
      <AnimatePresence>
        {joined && isInstigador && phase !== "LOBBY" && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="hud-corner p-3 border border-red-hud bg-red-hud/10">
            <p className="text-xs font-mono font-bold text-red-hud uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Eres el INSTIGADOR — protege al culpable
            </p>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">
              El responsable es <b className="text-red-hud">{suspects.find((s) => s.arch === me.guilty)?.name ?? "secreto"}</b> (solo tu lo ves).
              Planta una pista falsa contra un inocente, interroga desviando sospechas y vota por el mas debil.
              Si la mayoria acusa mal, te llevas el triple.
            </p>
            {!me.planted && (phase === "INVESTIGACION" || phase === "DELIBERACION") && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <select
                  value={plantTarget}
                  onChange={(e) => setPlantTarget(e.target.value)}
                  aria-label="Elegir inocente a incriminar"
                  className="bg-background border border-border/60 rounded-sm text-[10px] font-mono px-1.5 py-1 text-foreground"
                >
                  <option value="">Incriminar a...</option>
                  {suspects.filter((s) => s.arch !== me.guilty).map((s) => (
                    <option key={s.arch} value={s.arch}>{s.name}</option>
                  ))}
                </select>
                <Button
                  size="sm"
                  disabled={!plantTarget}
                  onClick={() => act("det:plant", { suspectId: plantTarget }, (r) => {
                    if (r?.ok) { toast.success("Pista falsa plantada en el tablero (anonima, fiabilidad BAJA)"); sfx.unlock(); }
                    else toast.error(r?.reason ?? "No se pudo plantar");
                  })}
                  className="h-7 font-mono text-[9px] uppercase bg-red-hud/20 border-red-hud text-red-hud hover:bg-red-hud/40"
                >
                  <Siren className="w-3 h-3 mr-1" /> Plantar engaño
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {joined && !isInstigador && phase !== "LOBBY" && (
        <div className="hud-corner p-2 border border-cyan-hud/40 bg-cyan-hud/5 text-[10px] font-mono text-cyan-hud flex items-center gap-2">
          <Eye className="w-3.5 h-3.5" /> Eres DETECTIVE: alguien de la sala trabaja para el culpable. Desconfia de las pistas de fiabilidad BAJA y de los interrogados que acusan demasiado rapido.
        </div>
      )}

      {/* no unido: briefing + botón */}
      {!joined && state && phase !== "VEREDICTO" && (
        <div className="hud-corner p-4 text-center space-y-3">
          <p className="text-xs font-mono text-foreground leading-relaxed max-w-2xl mx-auto">{state.briefing}</p>
          {(phase === "LOBBY" || phase === "INVESTIGACION") ? (
            <Button
              onClick={() => {
                if (!spendCoins(state.stake, `Detective: fianza del caso ${state.title}`)) {
                  toast.error(`Fondos insuficientes: necesitas ${state.stake} mon`);
                  sfx.error();
                  return;
                }
                stakeRef.current = state.stake;
                getRealtime()?.emit("det:join", { caseId: state.caseId, pid, name: alias || "DETECTIVE" }, (r: { ok: boolean; reason?: string }) => {
                  if (r?.ok) { toast.success(`Fianza pagada (${state.stake} mon). Resuelve el caso y doblala`); sfx.unlock(); }
                  else toast.error(r?.reason ?? "No se pudo unir");
                });
              }}
              className="h-9 px-6 font-mono text-xs uppercase tracking-widest bg-violet-hud/30 border-violet-hud text-violet-hud hover:bg-violet-hud/50"
            >
              Unirme a la investigacion · {state.stake} mon de fianza
            </Button>
          ) : (
            <p className="text-[10px] font-mono text-muted-foreground uppercase">Partida en fase {PHASE_LABEL[phase]} — espera el siguiente caso para unirte</p>
          )}
        </div>
      )}

      {/* veredicto */}
      <AnimatePresence>
        {state?.verdict && (
          <motion.div
            key={`${state.caseId}-${state.matchId}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("hud-corner p-4 border-2", state.verdict.correct ? "border-green-hud bg-green-hud/10" : "border-red-hud bg-red-hud/10")}
          >
            <div className="flex items-center gap-2 mb-2">
              {state.verdict.correct
                ? <CheckCircle2 className="w-5 h-5 text-green-hud" />
                : <XCircle className="w-5 h-5 text-red-hud" />}
              <p className={cn("text-sm font-mono font-bold uppercase", state.verdict.correct ? "text-green-hud" : "text-red-hud")}>
                {state.verdict.correct
                  ? `Caso resuelto: ${suspects.find((s) => s.arch === state.verdict?.accusedId)?.name} era el responsable`
                  : `Veredicto erroneo: acusaron a ${suspects.find((s) => s.arch === state.verdict?.accusedId)?.name}`}
              </p>
            </div>
            {!state.verdict.correct && (
              <p className="text-xs font-mono text-amber mb-2">
                El culpable real era <b>{suspects.find((s) => s.arch === state.verdict?.guiltyId)?.name}</b> — el instigador gana esta ronda.
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {Object.entries(state.verdict.tally).map(([sid, n]) => (
                <span key={sid} className="text-[9px] font-mono px-1.5 py-0.5 border border-border/60 text-muted-foreground">
                  {suspects.find((s) => s.arch === sid)?.name}: {n} voto{n > 1 ? "s" : ""}
                </span>
              ))}
            </div>
            <div className="border-t border-border/50 pt-2">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <ScrollText className="w-3 h-3 text-amber" /> Lo que dijo la historia real
              </p>
              <p className="text-[11px] font-mono text-foreground/90 leading-relaxed">{state.verdict.recap}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-3">
        {/* ============ COLUMNA PRINCIPAL ============ */}
        <div className="lg:col-span-2 space-y-3">
          {/* tablero de pistas */}
          <div className="hud-corner p-3 bg-secondary/40">
            <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-1.5">
              <FileSearch className="w-3.5 h-3.5 text-amber" /> Tablero de pistas ({board.length})
            </p>
            {board.length === 0 && (
              <p className="text-[10px] font-mono text-muted-foreground py-3 text-center">
                Tablero vacio. Registra ubicaciones para encontrar evidencia (fase de investigacion).
              </p>
            )}
            <div className="space-y-1.5 max-h-72 overflow-y-auto thin-scroll pr-1">
              {board.map((clue) => {
                const sus = suspects.find((s) => s.arch === clue.suspectId);
                return (
                  <motion.div
                    key={clue.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn("p-2 border rounded-sm", REL_STYLE[clue.reliability] ?? "border-border")}
                  >
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-[8px] font-mono font-bold px-1 border border-current rounded-sm">FIA. {clue.reliability}</span>
                      {clue.anonymous && <span className="text-[8px] font-mono text-red-hud uppercase">fuente anonima — posible engaño</span>}
                      <span className="text-[9px] font-mono text-foreground font-bold ml-auto">{sus?.name}</span>
                    </div>
                    <p className="text-[10px] font-mono text-foreground/90 leading-snug">{clue.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ubicaciones */}
          <div className="hud-corner p-3">
            <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber" /> Ubicaciones del caso
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {(state?.locations ?? []).map((loc) => (
                <button
                  key={loc.id}
                  disabled={!canAct || loc.cluesLeft === 0}
                  onClick={() => act("det:search", { locationId: loc.id }, (r) => {
                    if (r?.ok) { sfx.beep(); }
                    else toast.error(r?.reason ?? "No se pudo registrar");
                  })}
                  className={cn(
                    "p-2.5 border text-left transition-colors rounded-sm",
                    canAct && loc.cluesLeft > 0
                      ? "border-border hover:border-amber-hud hover:bg-amber-hud/10 cursor-pointer"
                      : "border-border/40 opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber">{LOCS_ICON[loc.id] ?? <Archive className="w-3.5 h-3.5" />}</span>
                    <span className="text-[10px] font-mono font-bold text-foreground">{loc.name}</span>
                    <span className="text-[9px] font-mono text-muted-foreground ml-auto">{loc.cluesLeft} pistas</span>
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground mt-0.5">{loc.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* sospechosos */}
          <div className="hud-corner p-3">
            <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-1.5">
              <UserSearch className="w-3.5 h-3.5 text-amber" /> Sospechosos
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {suspects.map((s) => {
                const cluesAgainst = board.filter((c) => c.suspectId === s.arch);
                const strong = cluesAgainst.filter((c) => c.reliability === "ALTA").length;
                const isMyVote = me.myVote === s.arch;
                const isGuiltyRevealed = state?.verdict && state.verdict.guiltyId === s.arch;
                const isAccused = state?.verdict && state.verdict.accusedId === s.arch;
                return (
                  <div
                    key={s.arch}
                    className={cn(
                      "p-2.5 border rounded-sm space-y-1.5",
                      isMyVote ? "border-red-hud bg-red-hud/10" : isAccused ? "border-amber-hud bg-amber-hud/10" : "border-border"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5 text-violet-hud flex-shrink-0" />
                      <span className="text-[11px] font-mono font-bold text-foreground">{s.name}</span>
                      {isGuiltyRevealed && <span className="text-[8px] font-mono px-1 border border-green-hud text-green-hud rounded-sm">CULPABLE REAL</span>}
                      {state?.verdict && state.verdict.accusedId === s.arch && !isGuiltyRevealed && (
                        <span className="text-[8px] font-mono px-1 border border-red-hud text-red-hud rounded-sm">INOCENTE ACUSADO</span>
                      )}
                    </div>
                    <p className="text-[9px] font-mono text-muted-foreground leading-snug">{s.desc}</p>
                    <p className="text-[9px] font-mono text-amber/80 leading-snug">Motivo: {s.motive}</p>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[8px] font-mono text-muted-foreground">{cluesAgainst.length} pistas ({strong} fuertes)</span>
                      {state?.verdict?.tally[s.arch] ? (
                        <span className="text-[8px] font-mono text-red-hud">· {state.verdict.tally[s.arch]} votos</span>
                      ) : null}
                    </div>
                    {(phase === "INVESTIGACION" || phase === "DELIBERACION") && joined && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!canAct}
                        onClick={() => act("det:interrogate", { suspectId: s.arch }, (r) => {
                          if (!r?.ok) toast.error(r?.reason ?? "No se pudo interrogar");
                          else sfx.click();
                        })}
                        className="h-6 w-full font-mono text-[9px] uppercase border-cyan-hud/60 text-cyan-hud"
                      >
                        <UserSearch className="w-3 h-3 mr-1" /> Interrogar (1 accion)
                      </Button>
                    )}
                    {phase === "JUICIO" && joined && (
                      <Button
                        size="sm"
                        disabled={!!me.myVote}
                        onClick={() => act("det:vote", { suspectId: s.arch }, (r) => {
                          if (r?.ok) { toast.success("Acusacion emitida. Que empiece el veredicto"); sfx.alarm(); }
                          else toast.error(r?.reason ?? "No se pudo votar");
                        })}
                        className={cn(
                          "h-6 w-full font-mono text-[9px] uppercase",
                          isMyVote ? "bg-red-hud/30 border-red-hud text-red-hud" : "bg-secondary border-border text-muted-foreground"
                        )}
                      >
                        <Gavel className="w-3 h-3 mr-1" /> {isMyVote ? "Tu acusacion" : "Acusar"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            {phase === "JUICIO" && joined && me.myVote && (
              <p className="text-[10px] font-mono text-amber mt-2 uppercase">
                Acusacion registrada: {suspects.find((s) => s.arch === me.myVote)?.name}. Esperando al resto de la sala...
              </p>
            )}
          </div>
        </div>

        {/* ============ LATERAL ============ */}
        <div className="space-y-3">
          {/* sala */}
          <div className="hud-corner p-3">
            <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-1.5">
              <Users className="w-3 h-3 text-amber" /> Sala de detectives
            </p>
            <div className="space-y-1.5">
              {(state?.players ?? []).map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0", p.connected ? "bg-green-hud" : "bg-zinc-600")} />
                  <span className={cn("text-[10px] font-mono uppercase truncate flex-1", p.id === pid ? "text-amber font-bold" : "text-foreground/80")}>
                    {p.name} {p.isBot && <span className="text-[8px] text-muted-foreground">IA</span>}
                    {p.id === pid && <span className="text-[8px] text-muted-foreground"> (TU)</span>}
                  </span>
                  {phase === "JUICIO" && p.voteDone && <Gavel className="w-3 h-3 text-red-hud" />}
                  {(phase === "INVESTIGACION" || phase === "DELIBERACION") && (
                    <span className="text-[9px] font-mono text-muted-foreground">{p.actions}a</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* v17: chat libre de la sala — deliberación en vivo */}
          {joined && (phase === "DELIBERACION" || phase === "JUICIO" || phase === "VEREDICTO") && (
            <div className="hud-corner p-3">
              <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-cyan-hud" /> Chat de la sala
                <span className="text-[8px] text-muted-foreground/60 normal-case">· convence a los demás antes del juicio</span>
              </p>
              <div className="space-y-1 max-h-36 overflow-y-auto thin-scroll pr-1 mb-2">
                {(state?.chat ?? []).map((c) => (
                  <p key={c.id} className="text-[10px] font-mono leading-snug">
                    <span className={cn("font-bold", c.name === "SISTEMA" ? "text-cyan-hud" : c.bot ? "text-muted-foreground" : "text-amber")}>
                      {c.name}: "
                    </span>
                    <span className="text-foreground/80">{c.body}</span>
                    {c.name !== "SISTEMA" && <span className="font-bold text-muted-foreground">"</span>}
                  </p>
                ))}
                {(state?.chat ?? []).length === 0 && (
                  <p className="text-[10px] font-mono text-muted-foreground italic">El chat abre en la deliberación — nadie ha hablado aún</p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendDetChat(); }}
                  maxLength={200}
                  placeholder="Comparte tu teoría..."
                  className="flex-1 bg-background/70 border border-border rounded-sm px-2 py-1.5 text-[11px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-electric-hud"
                  aria-label="Mensaje al chat de la sala"
                />
                <Button
                  size="sm"
                  onClick={sendDetChat}
                  className="h-8 w-8 p-0 border-electric-hud text-electric bg-electric/20 hover:bg-electric/40"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* bitacora */}
          <div className="hud-corner p-3">
            <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-1.5">
              <ScrollText className="w-3 h-3 text-red-hud" /> Bitacora del caso
            </p>
            <div className="space-y-1 max-h-80 overflow-y-auto thin-scroll pr-1">
              {log.map((l, i) => (
                <p key={`${l.ts}-${i}`} className="text-[10px] font-mono leading-snug" style={{ color: l.color ?? "#9ca3af" }}>
                  <span className="text-muted-foreground/50">{new Date(l.ts).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} </span>
                  {l.msg}
                </p>
              ))}
            </div>
          </div>

          {/* recordatorio economico */}
          <div className="hud-corner p-3 text-[9px] font-mono text-muted-foreground leading-relaxed">
            <p className="text-amber uppercase tracking-widest mb-1">Recompensas</p>
            <p>Acusacion correcta (mayoria): <b className="text-green-hud">x2.5 fianza + 2 gemas</b></p>
            <p>Voto correcto contra mayoria: <b className="text-green-hud">x2 fianza + 1 gema</b></p>
            <p>Instigador que escapa: <b className="text-violet-hud">x3 fianza + 5 gemas</b></p>
            <p>Acusacion fallida: <b className="text-red-hud">pierdes la fianza</b></p>
            <p className="mt-1">Tu saldo: <b className="text-amber">{coins} mon</b></p>
          </div>
        </div>
      </div>
    </div>
  );
}
