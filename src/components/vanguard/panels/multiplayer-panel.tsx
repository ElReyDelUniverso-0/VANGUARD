"use client";

// Vanguard v17 — MULTIJUGADOR TERMINADO: 3 modos en un solo panel.
//  · GUERRA  — Mundo de Guerra global (LOBBY -> REFUERZOS -> GUERRA -> FIN)
//              + CHAT DE GUERRA en vivo + PARTIDA RAPIDA + REVANCHA con votos
//              + resultados enviados al ranking ELO global (/api/mp/stats).
//  · DUELO   — DUELO DE TRIVIA PvP 1v1 en tiempo real (matchmaking con bot,
//              7 preguntas, puntos por velocidad, recompensas + ELO).
//  · RANKING — Board mundial ELO persistido en SQLite (top 25 + tu fila).
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { PanelHeader } from "@/components/vanguard/panel-header";
import {
  Users, Timer, Crosshair, Swords, Trophy, Crown, Gem, LogIn, RefreshCw,
  MessageSquare, Zap, Send, Radio, Medal, ShieldAlert, ChevronRight, Target, WifiOff, UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/game-store";
import { useProfileStore } from "@/lib/profile-store";
import { countryName } from "@/lib/world-data";
import { Countryball, STICKER_CODES } from "@/components/vanguard/countryball";
import { useT } from "@/lib/i18n";
import { getRealtime, peekRealtime } from "@/lib/realtime";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";
import type { Globe3DMarker, Globe3DArc } from "@/components/vanguard/globe-map-3d";
import { motion, AnimatePresence } from "framer-motion";

// v14 — MAPA MULTIJUGADOR EN 3D: globo real en lugar del SVG plano
const GlobeMap3D = dynamic(
  () => import("@/components/vanguard/globe-map-3d").then((m) => m.GlobeMap3D),
  { ssr: false, loading: () => (
    <div className="hud-corner p-10 flex items-center justify-center text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
      Cargando motor 3D...
    </div>
  ) }
);

interface TerrMeta { id: string; name: string; continent: string; lat: number; lng: number; adj: string[]; }
interface MpPlayerInfo {
  id: string; name: string; color: string; isBot: boolean; avatar?: string;
  reserves: number; connected: boolean; captures: number; gemsEarned: number;
}
interface MpChatMsg { id: string; name: string; color: string; body: string; ts: number; sys?: boolean }
interface MpState {
  phase: "LOBBY" | "REINFORCE" | "WAR" | "ENDED";
  round: number;
  phaseEnds: number;
  startAt: number | null;
  territories: Record<string, { owner: string | null; troops: number }>;
  players: Record<string, MpPlayerInfo>;
  log: { ts: number; msg: string; color?: string }[];
  chat: MpChatMsg[];
  rematch: { votes: number; needed: number };
  lastBattle: {
    seq: number; from: string; to: string; attacker: string; attackerName: string; defenderName: string;
    atkRoll: number; defRoll: number; atkLosses: number; defLosses: number; captured: boolean;
    attackerColor: string; defenderColor: string;
  } | null;
  winnerId: string | null;
  winnerName: string | null;
  winnerSeq: number;
  resetAt: number | null;
  territoryMeta: TerrMeta[];
}

// ===== tipos del DUELO 1v1 =====
interface DuelSideInfo {
  name: string; score: number; correct: number; answered: boolean; lastGain: number; isBot?: boolean;
}
interface DuelState {
  id: number;
  phase: "COUNTDOWN" | "QUESTION" | "REVEAL" | "ENDED";
  qIdx: number; total: number; phaseEnds: number;
  question: { text: string; opts: string[]; cat: string; a?: number } | null;
  me: DuelSideInfo; rival: DuelSideInfo;
  result: { outcome: "WIN" | "LOSS" | "TIE"; walkover: boolean; eloDelta: number } | null;
}

interface RankRow {
  username: string; elo: number; wins: number; losses: number; draws: number;
  captures: number; duelsWon: number; duelsLost: number; duelsPlayed: number;
  mpGames: number; detectiveSolved: number; bestDuelStreak: number;
}

type Mode = "guerra" | "duelo" | "ranking";

const CONTINENTS = ["NORTEAMÉRICA", "SUDAMÉRICA", "EUROPA", "ÁFRICA", "ASIA", "OCEANÍA"];

// registro fire-and-forget al ranking global
function postMpResult(username: string, kind: string, extra?: Record<string, unknown>) {
  if (!username) return;
  fetch("/api/mp/stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username.toUpperCase().slice(0, 18), kind, ...extra }),
  }).catch(() => { /* ranking no crítico */ });
}

function useMyMpId() {
  return useMemo(() => {
    if (typeof window === "undefined") return "srv";
    let id = localStorage.getItem("vanguard-mp-uid");
    if (!id) {
      id = `mp-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
      localStorage.setItem("vanguard-mp-uid", id);
    }
    return id;
  }, []);
}

// ============================================================
// v21 PULIDO: estado de conexión global + insignia en vivo.
// Un solo oyente compartido por todos los modos; botón de reintento manual.
// ============================================================
function useMpConnected() {
  // v21: valor inicial perezoso (sin setState síncrono en el effect)
  const [connected, setConnected] = useState(() => !!peekRealtime()?.connected);
  useEffect(() => {
    const s = getRealtime();
    if (!s) return;
    const on = () => setConnected(true);
    const off = () => setConnected(false);
    s.on("connect", on);
    s.on("disconnect", off);
    return () => {
      s.off("connect", on);
      s.off("disconnect", off);
    };
  }, []);
  return { connected, retry: () => getRealtime()?.connect() };
}

// v23: catálogo de personajes-país para el multijugador (países de conflictos + populares)
const MP_CHAR_CODES: string[] = Array.from(new Set(["do", "us", ...STICKER_CODES])).sort();

function ConnectionBadge() {
  const { connected, retry } = useMpConnected();
  const { t } = useT();
  return connected ? (
    <span className="flex items-center gap-1.5 text-[9px] font-mono px-2 py-1 border border-green-hud text-green-hud bg-green-hud/20 uppercase">
      <span className="w-1.5 h-1.5 rounded-full bg-green-hud blink-soft" />
      {t("mp.liveBadge")}
    </span>
  ) : (
    <button
      onClick={retry}
      title="Reintentar conexión ahora"
      className="flex items-center gap-1.5 text-[9px] font-mono px-2 py-1 border border-red-hud text-red-hud bg-red-hud/20 uppercase blink-soft"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-hud" />
      {t("mp.reconnectBadge")}
    </button>
  );
}

// ============================================================
// PANEL PRINCIPAL CON SELECTOR DE MODO
// ============================================================
export function MultiplayerPanel() {
  const alias = useGameStore((s) => s.alias);
  const { t } = useT();
  const [mode, setMode] = useState<Mode>("guerra");

  const MODES: { id: Mode; label: string; icon: ReactNode }[] = [
    { id: "guerra", label: t("mp.war"), icon: <Swords className="w-3.5 h-3.5" /> },
    { id: "duelo", label: t("mp.duel"), icon: <Zap className="w-3.5 h-3.5" /> },
    { id: "ranking", label: t("mp.ranking"), icon: <Medal className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-3">
      <PanelHeader
        title={t("mp.title")}
        subtitle="Mundo de Guerra GLOBAL + Duelos 1v1 + Ranking ELO mundial · tiempo real contra operadores reales"
        icon={<Users className="w-4 h-4 text-red-hud" />}
        color="red"
        right={<ConnectionBadge />}
      />

      {/* selector de modo */}
      <div className="hud-corner p-1 flex items-center gap-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => { sfx.tab(); setMode(m.id); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 font-mono text-[10px] uppercase tracking-widest border transition-colors rounded-sm",
              mode === m.id
                ? "border-red-hud bg-red-hud/20 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-background/60"
            )}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.14 }}
        >
          {mode === "guerra" && <GuerraMode alias={alias} />}
          {mode === "duelo" && <DueloMode alias={alias} />}
          {mode === "ranking" && <RankingMode alias={alias} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// MODO GUERRA (v7 + chat v17 + revancha v17 + partida rápida v17)
// ============================================================
function GuerraMode({ alias }: { alias: string }) {
  const recordMpCapture = useGameStore((s) => s.recordMpCapture);
  const recordMpWin = useGameStore((s) => s.recordMpWin);
  const mpStats = useGameStore((s) => s.mpStats);
  const myId = useMyMpId();
  const { t } = useT();
  // v23 PERSONAJES-PAÍS: la countryball del perfil representa al comandante en la guerra
  const cbAvatar = useProfileStore((s) => s.cbAvatar);
  const setCbAvatar = useProfileStore((s) => s.setCbAvatar);

  const [state, setState] = useState<MpState | null>(null);
  const [connected, setConnected] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [chatDraft, setChatDraft] = useState("");
  const [myElo, setMyElo] = useState<number | null>(null);
  const lastBattleSeq = useRef(0);
  const winnerSeqSeen = useRef(0);
  const participatedRef = useRef(false);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const chatListRef = useRef<HTMLDivElement | null>(null);
  const myNameRef = useRef(alias || "OPERADOR");
  const myAvatarRef = useRef(cbAvatar); // v23: avatar país en el handshake
  const dropRef = useRef(false); // v21: avisa al reconectar si hubo caída
  const [slowNet, setSlowNet] = useState(false); // v21: aviso de servidor lento/caído
  useEffect(() => { myNameRef.current = alias || "OPERADOR"; }, [alias]);
  useEffect(() => { myAvatarRef.current = cbAvatar; }, [cbAvatar]);
  useEffect(() => {
    const t = setTimeout(() => setSlowNet(true), 8000);
    return () => clearTimeout(t);
  }, []);

  // ===== reloj local para cuentas atras =====
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // ===== ELO propio para la cabecera =====
  useEffect(() => {
    const name = (alias || "").toUpperCase().slice(0, 18);
    if (!name) return;
    fetch(`/api/mp/stats?alias=${encodeURIComponent(name)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.profile) setMyElo(d.profile.elo); })
      .catch(() => {});
  }, [alias]);

  // ===== conexion y estado del juego =====
  useEffect(() => {
    const socket = getRealtime();
    if (!socket) return;

    const onConnect = () => {
      setConnected(true);
      if (dropRef.current) {
        dropRef.current = false;
        setSlowNet(false);
        toast.success("Reconectado a la guerra global — sincronizando estado…");
      }
      socket.emit("mp:join", { playerId: myId, name: myNameRef.current, avatar: myAvatarRef.current }, (res: { state?: MpState } | undefined) => {
        if (res?.state) setState(res.state);
      });
    };
    const onDisconnect = () => {
      setConnected(false);
      dropRef.current = true;
      toast.warning("Conexión perdida — reconexión automática en marcha…");
    };
    const onState = (s: MpState) => {
      setState(s);
      // recompensas por captura propia (una sola vez por batalla)
      const lb = s.lastBattle;
      if (lb && lb.seq > lastBattleSeq.current) {
        lastBattleSeq.current = lb.seq;
        if (lb.attacker === myId) {
          participatedRef.current = true;
          if (lb.captured) {
            recordMpCapture(2);
            postMpResult(myNameRef.current, "CAPTURE");
            toast.success(`¡Territorio capturado! +2 gemas, +5 monedas`);
            sfx.unlock();
          } else {
            toast.error(`Asalto repelido en defensa enemiga`);
            sfx.error();
          }
        }
      }
      // victoria propia + registro de resultado en el ranking ELO
      if (s.winnerSeq > winnerSeqSeen.current) {
        winnerSeqSeen.current = s.winnerSeq;
        if (participatedRef.current) {
          const iWon = s.winnerId === myId;
          postMpResult(myNameRef.current, iWon ? "MP_WIN" : "MP_LOSS");
          if (iWon) {
            recordMpWin();
            toast.success("DOMINIO GLOBAL conseguido: +25 gemas, +200 monedas · ELO +30");
          } else {
            toast.info(`Victoria de ${s.winnerName ?? "?"} — resultado registrado en el ranking`);
          }
        } else if (s.winnerId === myId) {
          recordMpWin();
          toast.success("DOMINIO GLOBAL conseguido: +25 gemas, +200 monedas");
        }
      }
      // autoscroll del chat
      requestAnimationFrame(() => {
        const el = chatListRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("mp:state", onState);
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("mp:state", onState);
    };
  }, [myId, recordMpCapture, recordMpWin]);

  const me = state?.players[myId];
  const myTerritories = useMemo(
    () => (state ? state.territoryMeta.filter((t) => state.territories[t.id]?.owner === myId) : []),
    [state, myId]
  );
  // v23: nombre -> avatar país para el chat y banners (hook antes del early return)
  const avatarByName = useMemo(() => {
    const m = new Map<string, string>();
    if (state) for (const p of Object.values(state.players)) if (p.avatar) m.set(p.name, p.avatar);
    return m;
  }, [state]);
  const claimedByMe = myTerritories.length > 0;
  const claimable = state?.phase === "LOBBY";

  // objetivos de ataque: adyacentes al seleccionado que no son mios
  const attackTargets = useMemo(() => {
    if (!state || !selected) return [];
    const t = state.territoryMeta.find((x) => x.id === selected);
    if (!t) return [];
    return t.adj.filter((a) => state.territories[a] && state.territories[a].owner !== myId);
  }, [state, selected, myId]);

  const emit = (event: string, payload: unknown, cb?: (r: { ok: boolean; reason?: string }) => void) => {
    const socket = getRealtime();
    socket.emit(event, payload, cb);
  };

  const claim = (terrId: string) => {
    emit("mp:claim", { terrId }, (r) => {
      if (r?.ok) { participatedRef.current = true; toast.success(`Base establecida. La partida arranca en segundos`); sfx.unlock(); }
      else toast.error(r?.reason ?? "No se pudo reclamar");
    });
  };

  // v17: PARTIDA RAPIDA — reclama un territorio libre al azar
  const quickMatch = () => {
    if (!state) return;
    const free = state.territoryMeta.filter((t) => !state.territories[t.id]?.owner);
    if (free.length === 0) { toast.error("No quedan territorios libres"); return; }
    claim(free[Math.floor(Math.random() * free.length)].id);
  };

  const deploy = (terrId: string, qty = 1) => {
    emit("mp:deploy", { terrId, qty }, (r) => {
      if (!r?.ok) toast.error(r?.reason ?? "Despliegue rechazado");
      else { participatedRef.current = true; sfx.click(); }
    });
  };

  const deployAll = () => {
    emit("mp:deployAll", {}, (r) => {
      if (r?.ok) { participatedRef.current = true; toast.success("Reservas desplegadas en tus territorios"); sfx.success(); }
      else toast.error(r?.reason ?? "Nada que desplegar");
    });
  };

  const attack = (from: string, to: string) => {
    emit("mp:attack", { from, to }, (r) => {
      if (!r?.ok) toast.error(r?.reason ?? "Ataque invalido");
      else participatedRef.current = true;
    });
    setSelected(null);
  };

  const sendChat = () => {
    const body = chatDraft.trim();
    if (!body) return;
    emit("mp:chat", { body }, (r) => {
      if (!r?.ok) toast.error(r?.reason ?? "No se pudo enviar");
      else setChatDraft("");
    });
  };

  const requestRematch = () => {
    emit("mp:rematch", {}, (r) => {
      if (!r?.ok) toast.error(r?.reason ?? "No disponible");
      else sfx.click();
    });
  };

  // v23: elige tu personaje-país y sincronízalo con la partida en vivo
  const pickCharacter = (code: string) => {
    setCbAvatar(code);
    myAvatarRef.current = code;
    emit("mp:join", { playerId: myId, name: myNameRef.current, avatar: code }, () => {});
    sfx.unlock();
    toast.success(`${t("mp.characterSet")}: ${countryName(code)}`);
  };

  const secondsLeft = (target: number) => Math.max(0, Math.ceil((target - now) / 1000));

  // ================== RENDER ===================
  if (!state) {
    return (
      <div className="hud-corner p-10 text-center">
        {connected ? (
          <>
            <RefreshCw className="w-8 h-8 mx-auto mb-3 text-amber animate-spin" />
            <p className="text-sm font-mono text-muted-foreground uppercase">
              Sincronizando partida global...
            </p>
          </>
        ) : (
          <>
            <WifiOff className="w-8 h-8 mx-auto mb-3 text-red-hud" />
            <p className="text-sm font-mono text-muted-foreground uppercase">
              {slowNet ? "Servidor de partidas en mantenimiento" : "Conectando al servidor de partidas :3003..."}
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/70 uppercase mt-1 mb-4">
              reintentos automáticos cada 5s · tu progreso está a salvo
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => getRealtime()?.connect()}
              className="font-mono text-[10px] uppercase tracking-widest border-cyan-hud text-cyan-hud hover:bg-cyan-hud/10"
            >
              Reintentar ahora
            </Button>
          </>
        )}
      </div>
    );
  }

  const playerList = Object.values(state.players);
  const countsByOwner: Record<string, { n: number; troops: number }> = {};
  for (const [tid, t] of Object.entries(state.territories)) {
    if (!t.owner) continue;
    countsByOwner[t.owner] = countsByOwner[t.owner] ?? { n: 0, troops: 0 };
    countsByOwner[t.owner].n += 1;
    countsByOwner[t.owner].troops += t.troops;
  }

  return (
    <div className="space-y-3">
      {/* barra de fase */}
      <div className="hud-corner p-2 flex items-center gap-3 text-[10px] font-mono flex-wrap">
        <span className={cn(
          "px-2 py-0.5 border font-bold uppercase tracking-wider",
          state.phase === "LOBBY" && "border-cyan-hud text-cyan-hud bg-cyan-hud/20",
          state.phase === "REINFORCE" && "border-green-hud text-green-hud bg-green-hud/20",
          state.phase === "WAR" && "border-red-hud text-red-hud bg-red-hud/20 blink-soft",
          state.phase === "ENDED" && "border-amber-hud text-amber bg-amber-hud/20"
        )}>
          {state.phase === "LOBBY" && t("mp.waitingRoom")}
          {state.phase === "REINFORCE" && `${t("mp.roundLabel")} ${state.round} · ${t("mp.reinforce")}`}
          {state.phase === "WAR" && `${t("mp.roundLabel")} ${state.round} · ${t("mp.warPhase")}`}
          {state.phase === "ENDED" && t("mp.ended")}
        </span>
        {(state.phase === "REINFORCE" || state.phase === "WAR") && (
          <span className="text-foreground flex items-center gap-1">
            <Timer className="w-3 h-3 text-amber" /> {secondsLeft(state.phaseEnds)}s
          </span>
        )}
        {state.phase === "LOBBY" && state.startAt && (
          <span className="text-foreground flex items-center gap-1">
            <Timer className="w-3 h-3 text-amber" /> despliegue en {secondsLeft(state.startAt)}s
          </span>
        )}
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{playerList.filter((p) => !p.isBot).length} {playerList.filter((p) => !p.isBot).length === 1 ? t("mp.players") : t("mp.playersPl")} · {playerList.filter((p) => p.isBot).length} {playerList.filter((p) => p.isBot).length === 1 ? t("mp.ais") : t("mp.aisPl")}</span>
        {myElo != null && (
          <span className="text-amber flex items-center gap-1"><Medal className="w-3 h-3" /> ELO {myElo}</span>
        )}
        {me && (
          <span className="ml-auto flex items-center gap-2">
            {me.avatar && <Countryball code={me.avatar} size={20} />}
            <span className="uppercase" style={{ color: me.color }}>{me.name}</span>
            {claimedByMe && state.phase === "REINFORCE" && (
              <span className="text-green-hud flex items-center gap-1">
                <Gem className="w-3 h-3" /> {me.reserves} {t("mp.reserves")}
              </span>
            )}
          </span>
        )}
      </div>

      {/* ===== v23: PICKER DE PERSONAJE-PAÍS (solo en sala de espera) ===== */}
      {claimable && (
        <div className="hud-corner p-3">
          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
            <p className="text-[11px] font-mono uppercase text-amber flex items-center gap-1.5">
              <UserRound className="w-3.5 h-3.5" /> {t("mp.character")}
            </p>
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
              {t("mp.characterNow")}:
              <Countryball code={cbAvatar} size={22} />
              <span className="text-foreground font-bold">{countryName(cbAvatar)}</span>
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono mb-2">{t("mp.characterDesc")}</p>
          <div className="grid grid-cols-8 sm:grid-cols-12 lg:grid-cols-[repeat(17,minmax(0,1fr))] gap-1 max-h-32 overflow-y-auto thin-scroll">
            {MP_CHAR_CODES.map((code) => (
              <button
                key={code}
                onClick={() => pickCharacter(code)}
                title={countryName(code)}
                aria-label={countryName(code)}
                className={cn(
                  "flex items-center justify-center p-1 border rounded-sm transition-all hover:border-amber-hud hover:bg-amber-hud/10",
                  cbAvatar === code ? "border-amber-hud bg-amber-hud/20 glow-amber" : "border-border/50"
                )}
              >
                <Countryball code={code} size={24} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== LOBBY ===== */}
      {claimable && (
        <div className="hud-corner p-3">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <p className="text-[11px] font-mono uppercase text-amber flex items-center gap-1.5">
              <LogIn className="w-3.5 h-3.5" /> Recluta tu territorio de origen — la partida arranca automaticamente
            </p>
            {!claimedByMe && (
              <Button
                size="sm"
                onClick={quickMatch}
                className="h-7 font-mono text-[9px] uppercase tracking-widest border-electric-hud text-electric bg-electric/20 hover:bg-electric/40"
              >
                <Zap className="w-3 h-3 mr-1" /> {t("mp.quickMatch")}
              </Button>
            )}
          </div>
          {claimedByMe ? (
            <p className="text-xs font-mono text-green-hud">
              Base establecida en <b>{myTerritories[0].name}</b>. Esperando despliegue...
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 max-h-56 overflow-y-auto thin-scroll">
              {state.territoryMeta
                .slice()
                .sort((a, b) => CONTINENTS.indexOf(a.continent) - CONTINENTS.indexOf(b.continent))
                .map((t) => {
                  const taken = state.territories[t.id]?.owner;
                  return (
                    <button
                      key={t.id}
                      onClick={() => claim(t.id)}
                      disabled={!!taken}
                      className={cn(
                        "p-2 border text-left transition-colors",
                        taken
                          ? "border-border/40 opacity-40 cursor-not-allowed"
                          : "border-border hover:border-amber-hud hover:bg-amber-hud/10 cursor-pointer"
                      )}
                    >
                      <span className="text-[10px] font-mono font-bold text-foreground block truncate">{t.name}</span>
                      <span className="text-[8px] font-mono text-muted-foreground uppercase">
                        {t.continent} {taken ? "· OCUPADO" : ""}
                      </span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ===== MAPA DE GUERRA GLOBAL ===== */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <MpMap
            state={state}
            myId={myId}
            selected={selected}
            attackTargets={attackTargets}
            onSelect={(tid) => {
              if (!state) return;
              const terr = state.territories[tid];
              if (!terr) return;
              if (state.phase === "REINFORCE" && terr.owner === myId && (me?.reserves ?? 0) > 0) {
                deploy(tid, 1);
                return;
              }
              if (state.phase === "WAR") {
                if (terr.owner === myId && terr.troops >= 3) {
                  setSelected(tid === selected ? null : tid);
                  return;
                }
                if (selected && attackTargets.includes(tid)) {
                  attack(selected, tid);
                  return;
                }
              }
              sfx.click();
            }}
          />
          {/* ayuda contextual de fase */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 border rounded-sm text-[10px] font-mono uppercase tracking-wider border-amber-hud bg-amber-hud/20 text-amber">
              {state.phase === "LOBBY" && (claimedByMe
                ? "Esperando inicio de partida..."
                : "Elige tu territorio de origen arriba")}
              {state.phase === "REINFORCE" && (claimedByMe
                ? `Click en tus territorios para desplegar (${me?.reserves} reservas) · o usa DESPLEGAR TODO`
                : "Estas de espectador esta ronda — entraras en la siguiente")}
              {state.phase === "WAR" && (claimedByMe
                ? "Selecciona territorio tuyo (3+ tropas) y ataca un vecino · +2 gemas por captura"
                : "Observando — podras unirte cuando acabe la partida")}
              {state.phase === "ENDED" && `${state.winnerName ?? "?"} ${t("mp.worldConquered")} — ${secondsLeft(state.resetAt ?? Date.now())}s`}
            </div>
            {claimedByMe && state.phase === "REINFORCE" && (me?.reserves ?? 0) > 0 && (
              <Button
                size="sm"
                onClick={deployAll}
                className="h-8 font-mono text-[10px] uppercase border-green-hud text-green-hud bg-green-hud/20 hover:bg-green-hud/40"
              >
                {t("mp.deployAll")}
              </Button>
            )}
            {state.phase === "WAR" && selected && (
              <Button
                size="sm"
                onClick={() => setSelected(null)}
                variant="outline"
                className="h-8 font-mono text-[10px] uppercase border-border text-muted-foreground"
              >
                Cancelar seleccion
              </Button>
            )}
            {/* v17: REVANCHA */}
            {state.phase === "ENDED" && (
              <Button
                size="sm"
                onClick={requestRematch}
                className="h-8 font-mono text-[10px] uppercase border-electric-hud text-electric bg-electric/20 hover:bg-electric/40"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                {t("mp.rematch")} ({state.rematch?.votes ?? 0}/{state.rematch?.needed ?? 1})
              </Button>
            )}
          </div>

          {/* banner de ultima batalla */}
          <AnimatePresence>
            {state.lastBattle && (
              <motion.div
                key={state.lastBattle.seq}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mt-2 hud-corner p-3 border",
                  state.lastBattle.captured ? "border-green-hud bg-green-hud/10" : "border-red-hud bg-red-hud/10"
                )}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {avatarByName.get(state.lastBattle.attackerName) && (
                      <Countryball code={avatarByName.get(state.lastBattle.attackerName) as string} size={20} />
                    )}
                    {state.lastBattle.captured
                      ? <Trophy className="w-4 h-4 text-green-hud" />
                      : <Swords className="w-4 h-4 text-red-hud" />}
                    <span className="text-xs font-mono font-bold uppercase">
                      {state.lastBattle.attackerName}
                      <span style={{ color: state.lastBattle.attackerColor }}> ● </span>
                      → {state.territoryMeta.find((t) => t.id === state.lastBattle?.to)?.name}
                      {state.lastBattle.captured ? " — ¡CAPTURADO!" : " — repelido"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="text-amber">ATK {state.lastBattle.atkRoll}</span>
                    <span className="text-cyan-hud">DEF {state.lastBattle.defRoll}</span>
                    <span className="text-red-hud">-{state.lastBattle.atkLosses} atk</span>
                    <span className="text-green-hud">-{state.lastBattle.defLosses} def</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== PANEL LATERAL: jugadores + bitacora + CHAT ===== */}
        <div className="space-y-3">
          {/* marcador */}
          <div className="hud-corner p-3">
            <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-1.5">
              <Crown className="w-3 h-3 text-amber" /> Dominio del mundo
            </p>
            <div className="space-y-1.5">
              {playerList
                .map((p) => ({ p, c: countsByOwner[p.id] ?? { n: 0, troops: 0 } }))
                .sort((a, b) => b.c.n - a.c.n)
                .map(({ p, c }) => (
                  <div key={p.id} className="flex items-center gap-2">
                    {p.avatar ? (
                      <Countryball code={p.avatar} size={20} angry={p.isBot} className="flex-shrink-0" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: p.color }} />
                    )}
                    <span className={cn(
                      "text-[10px] font-mono uppercase truncate flex-1",
                      p.id === myId ? "text-amber font-bold" : "text-foreground/80",
                      !p.connected && !p.isBot && "opacity-50 line-through"
                    )}>
                      {p.name === "DUENO" && <Crown className="w-3 h-3 text-amber inline -mt-0.5" />}{" "}
                      {p.name} {p.isBot && <span className="text-[8px] text-muted-foreground">{t("mp.ais")}</span>}
                      {p.id === myId && <span className="text-[8px] text-muted-foreground"> ({t("mp.you")})</span>}
                    </span>
                    <span className="text-[10px] font-mono text-foreground">{c.n}</span>
                    <span className="text-[9px] font-mono text-muted-foreground w-8 text-right">{c.troops}t</span>
                    {p.gemsEarned > 0 && (
                      <span className="text-[9px] font-mono text-green-hud flex items-center gap-0.5">
                        <Gem className="w-2.5 h-2.5" />{p.gemsEarned}
                      </span>
                    )}
                  </div>
                ))}
            </div>
            <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[9px] font-mono text-muted-foreground uppercase">
              <span>tus capturas: {mpStats.captures}</span>
              <span className="text-green-hud flex items-center gap-0.5"><Gem className="w-2.5 h-2.5" />{mpStats.gemsEarned} gemas</span>
            </div>
          </div>

          {/* bitacora */}
          <div className="hud-corner p-3">
            <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-1.5">
              <Crosshair className="w-3 h-3 text-red-hud" /> Bitacora de guerra global
            </p>
            <div className="space-y-1 max-h-44 overflow-y-auto thin-scroll pr-1">
              {[...state.log].reverse().map((l, i) => (
                <p key={`${l.ts}-${i}`} className="text-[10px] font-mono leading-snug" style={{ color: l.color ?? "#9ca3af" }}>
                  <span className="text-muted-foreground/50">{new Date(l.ts).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} </span>
                  {l.msg}
                </p>
              ))}
            </div>
          </div>

          {/* v17: CHAT DE GUERRA */}
          <div className="hud-corner p-3">
            <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-cyan-hud" /> Chat de guerra
              <span className="text-[8px] text-muted-foreground/60 normal-case">· coordina ataques con tus aliados</span>
            </p>
            <div ref={chatListRef} className="space-y-1 max-h-40 overflow-y-auto thin-scroll pr-1 mb-2">
              {(state.chat ?? []).map((c) => (
                <p key={c.id} className="text-[10px] font-mono leading-snug">
                  {!c.sys && avatarByName.get(c.name) && (
                    <Countryball code={avatarByName.get(c.name) as string} size={14} className="inline-block align-middle mr-1" />
                  )}
                  <span style={{ color: c.sys ? "#22d3ee" : c.color }} className="font-bold">
                    {c.sys ? "◈ " : ""}{c.name}:{" "}
                  </span>
                  <span className={c.sys ? "text-cyan-hud/80 italic" : "text-foreground/80"}>{c.body}</span>
                </p>
              ))}
              {(state.chat ?? []).length === 0 && (
                <p className="text-[10px] font-mono text-muted-foreground italic">Sin mensajes — escribe el primero</p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                ref={chatInputRef}
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
                maxLength={160}
                placeholder={t("mp.chatPh")}
                className="flex-1 bg-background/70 border border-border rounded-sm px-2 py-1.5 text-[11px] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-electric-hud"
                aria-label={t("mp.sendMsg")}
              />
              <Button
                size="sm"
                onClick={sendChat}
                className="h-8 w-8 p-0 border-electric-hud text-electric bg-electric/20 hover:bg-electric/40"
                aria-label="Enviar mensaje"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// v17 — MODO DUELO: DUELO DE TRIVIA PvP 1v1
// ============================================================
const DUEL_DURATION: Record<DuelState["phase"], number> = {
  COUNTDOWN: 3200, QUESTION: 9000, REVEAL: 2800, ENDED: 14000,
};

function DueloMode({ alias }: { alias: string }) {
  const addCoins = useGameStore((s) => s.addCoins);
  const addGems = useGameStore((s) => s.addGems);
  const addXp = useGameStore((s) => s.addXp);
  const myId = useMyMpId();

  const [duel, setDuel] = useState<DuelState | null>(null);
  const [searching, setSearching] = useState(false);
  const [chosen, setChosen] = useState<{ q: number; idx: number } | null>(null);
  const rewardedRef = useRef<number>(0);
  const myNameRef = useRef(alias || "OPERADOR");
  useEffect(() => { myNameRef.current = alias || "OPERADOR"; }, [alias]);

  // suscripcion al duelo
  useEffect(() => {
    const socket = getRealtime();
    if (!socket) return;
    const onState = (s: DuelState) => {
      setDuel(s);
      setSearching(false);
      if (s.phase === "QUESTION" && s.me && !s.me.answered) {
        // nueva pregunta disponible
      }
      if (s.phase === "ENDED" && s.result && rewardedRef.current !== s.id) {
        rewardedRef.current = s.id;
        const { outcome, walkover } = s.result;
        if (outcome === "WIN") {
          addCoins(120, "Duelo 1v1 ganado");
          addGems(2, "Duelo 1v1 ganado");
          addXp(80);
          toast.success(walkover ? "Rival desconectado — victoria por abandono: +120 mon, +2 gemas" : "DUELO GANADO: +120 monedas, +2 gemas, +80 XP · ELO +22");
          sfx.achievement?.();
        } else if (outcome === "LOSS") {
          addCoins(30, "Duelo 1v1 participado");
          addXp(20);
          toast.info(walkover ? "Abandonaste el duelo — premio de consuelo: +30 mon" : "Duelo perdido — premio de participación: +30 mon, +20 XP");
        } else {
          addCoins(60, "Duelo 1v1 empatado");
          addXp(40);
          toast.info("EMPATE — +60 monedas, +40 XP · ELO +5");
        }
        postMpResult(myNameRef.current,
          outcome === "WIN" ? "DUEL_WIN" : outcome === "LOSS" ? "DUEL_LOSS" : "DUEL_TIE",
          { streak: outcome === "WIN" ? (s.me.correct ?? 0) : 0 });
      }
    };
    const onClosed = () => { setDuel(null); setSearching(false); };
    socket.on("duel:state", onState);
    socket.on("duel:closed", onClosed);
    return () => {
      socket.off("duel:state", onState);
      socket.off("duel:closed", onClosed);
    };
  }, [addCoins, addGems, addXp]);

  // si me voy del panel a mitad de duelo, el rival gana por abandono
  useEffect(() => {
    return () => {
      const socket = getRealtime();
      socket?.emit("duel:quit");
    };
  }, []);

  const queue = useCallback(() => {
    const socket = getRealtime();
    setDuel(null);
    setSearching(true);
    socket.emit("duel:queue", { playerId: myId, name: myNameRef.current }, (r: { ok: boolean; reason?: string } | undefined) => {
      if (!r?.ok) { setSearching(false); toast.error(r?.reason ?? "No se pudo entrar a la cola"); }
    });
  }, [myId]);

  const cancelQueue = () => {
    getRealtime()?.emit("duel:cancel");
    setSearching(false);
  };

  const answer = (idx: number) => {
    if (!duel || duel.phase !== "QUESTION" || duel.me.answered) return;
    setChosen({ q: duel.qIdx, idx });
    sfx.click();
    getRealtime()?.emit("duel:answer", { idx });
  };

  // ================== RENDER ==================
  if (!duel) {
    return (
      <div className="space-y-3">
        {searching ? (
          <div className="hud-corner p-10 text-center">
            <Radio className="w-8 h-8 mx-auto mb-3 text-electric animate-pulse" />
            <p className="text-sm font-mono text-foreground uppercase mb-1">Buscando rival...</p>
            <p className="text-[10px] font-mono text-muted-foreground mb-4">Si no hay humanos libres, entra un bot de élite en 5s</p>
            <Button size="sm" variant="outline" onClick={cancelQueue} className="font-mono text-[10px] uppercase border-border text-muted-foreground">
              Cancelar búsqueda
            </Button>
          </div>
        ) : (
          <div className="hud-corner p-5 sm:p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full border-2 border-electric flex items-center justify-center bg-electric/10">
              <Zap className="w-7 h-7 text-electric" />
            </div>
            <h3 className="font-display text-lg font-bold uppercase tracking-widest text-foreground mb-1">Duelo de Trivia 1v1</h3>
            <p className="text-xs font-mono text-muted-foreground max-w-md mx-auto mb-5">
              7 preguntas · 9 segundos por pregunta · 500 puntos base + hasta 400 por velocidad.
              Gana el mejor marcador. Si tu rival se desconecta, ganas por abandono.
            </p>
            <Button onClick={queue} className="font-mono text-xs uppercase tracking-widest border-electric-hud text-electric bg-electric/20 hover:bg-electric/40 h-10 px-6">
              <Target className="w-4 h-4 mr-2" /> Buscar rival
            </Button>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-lg mx-auto text-left">
              <div className="border border-green-hud/40 bg-green-hud/5 p-3 rounded-sm">
                <p className="text-[9px] font-mono uppercase text-green-hud tracking-widest mb-1">Victoria</p>
                <p className="text-[10px] font-mono text-foreground">+120 mon · +2 gemas · +80 XP · ELO +22</p>
              </div>
              <div className="border border-amber-hud/40 bg-amber-hud/5 p-3 rounded-sm">
                <p className="text-[9px] font-mono uppercase text-amber tracking-widest mb-1">Empate</p>
                <p className="text-[10px] font-mono text-foreground">+60 mon · +40 XP · ELO +5</p>
              </div>
              <div className="border border-red-hud/40 bg-red-hud/5 p-3 rounded-sm">
                <p className="text-[9px] font-mono uppercase text-red-hud tracking-widest mb-1">Derrota</p>
                <p className="text-[10px] font-mono text-foreground">+30 mon · +20 XP · ELO -14</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- partida activa ----
  const { phase, question, me, rival } = duel;

  if (phase === "ENDED" && duel.result) {
    const win = duel.result.outcome === "WIN";
    const tie = duel.result.outcome === "TIE";
    return (
      <div className={cn(
        "hud-corner p-6 sm:p-10 text-center border",
        win && "border-green-hud bg-green-hud/5",
        tie && "border-amber-hud bg-amber-hud/5",
        !win && !tie && "border-red-hud bg-red-hud/5"
      )}>
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220 }}>
          <Trophy className={cn("w-12 h-12 mx-auto mb-3", win ? "text-green-hud" : tie ? "text-amber" : "text-red-hud")} />
          <h3 className={cn(
            "font-display text-2xl font-black uppercase tracking-widest mb-1",
            win ? "text-green-hud" : tie ? "text-amber" : "text-red-hud"
          )}>
            {win ? "¡Victoria!" : tie ? "Empate" : "Derrota"}
          </h3>
          {duel.result.walkover && (
            <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">victoria por abandono del rival</p>
          )}
          <p className="text-xs font-mono text-foreground mb-1">{me.name} <b>{me.score}</b> — <b>{rival.score}</b> {rival.name}</p>
          <p className="text-[10px] font-mono text-muted-foreground mb-5">
            aciertos {me.correct}/{duel.total} vs {rival.correct}/{duel.total} · ELO {duel.result.eloDelta > 0 ? "+" : ""}{duel.result.eloDelta}
          </p>
        </motion.div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button onClick={queue} className="font-mono text-[10px] uppercase tracking-widest border-electric-hud text-electric bg-electric/20 hover:bg-electric/40">
            <Zap className="w-3.5 h-3.5 mr-1" /> Nueva partida
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* marcador en vivo */}
      <div className="hud-corner p-2 flex items-center justify-between text-[10px] font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-hud blink-soft" />
          <b className="text-foreground">{me.score}</b> pts · {me.name} <span className="text-muted-foreground">(TU)</span>
        </span>
        <span className="text-muted-foreground uppercase">
          PREGUNTA {Math.max(1, duel.qIdx + 1)}/{duel.total} · {phase === "COUNTDOWN" ? "PREPARANDO" : phase === "QUESTION" ? "¡RESPONDE!" : "REVELACIÓN"}
        </span>
        <span className="flex items-center gap-1.5">
          {rival.name} <span className="text-muted-foreground">{rival.isBot && "IA"}</span> <b className="text-foreground">{rival.score}</b> pts
        </span>
      </div>

      {/* barra de tiempo */}
      <DuelTimerBar phase={phase} ends={duel.phaseEnds} duration={DUEL_DURATION[phase]} />

      {phase === "COUNTDOWN" && (
        <div className="hud-corner p-10 text-center">
          <Radio className="w-8 h-8 mx-auto mb-3 text-electric animate-pulse" />
          <p className="font-display text-xl font-bold text-foreground uppercase tracking-widest">Duelo contra {rival.name}</p>
          <p className="text-[10px] font-mono text-muted-foreground uppercase mt-1">{rival.isBot ? "operativo IA de élite" : "operador humano conectado"}</p>
        </div>
      )}

      {phase === "QUESTION" && question && (
        <div className="hud-corner p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 border border-cyan-hud text-cyan-hud bg-cyan-hud/10 text-[9px] font-mono uppercase tracking-widest rounded-sm">
              {question.cat}
            </span>
            {me.answered && <span className="text-[9px] font-mono text-green-hud uppercase">respuesta registrada</span>}
            {rival.answered && !me.answered && <span className="text-[9px] font-mono text-red-hud uppercase blink-soft">¡{rival.name} ya respondió!</span>}
          </div>
          <p className="font-display text-base sm:text-lg font-bold text-foreground mb-4 leading-snug">{question.text}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.opts.map((opt, i) => {
              const isChosen = chosen?.q === duel.qIdx && chosen.idx === i;
              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  disabled={me.answered}
                  className={cn(
                    "text-left px-3 py-3 border font-mono text-xs transition-colors rounded-sm",
                    isChosen
                      ? "border-electric bg-electric/25 text-foreground font-bold"
                      : me.answered
                        ? "border-border/40 opacity-40 cursor-not-allowed text-muted-foreground"
                        : "border-border text-foreground/90 hover:border-electric-hud hover:bg-electric/10 cursor-pointer"
                  )}
                >
                  <span className="text-muted-foreground mr-2">{["A", "B", "C", "D"][i]}</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {phase === "REVEAL" && question && (
        <div className="hud-corner p-4 sm:p-5">
          <p className="font-display text-base sm:text-lg font-bold text-foreground mb-4 leading-snug">{question.text}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.opts.map((opt, i) => {
              const isCorrect = question.a === i;
              const isMyPick = chosen?.q === duel.qIdx && chosen.idx === i;
              return (
                <div
                  key={i}
                  className={cn(
                    "px-3 py-2.5 border font-mono text-xs rounded-sm",
                    isCorrect && "border-green-hud bg-green-hud/15 text-green-hud font-bold",
                    !isCorrect && isMyPick && "border-red-hud bg-red-hud/10 text-red-hud",
                    !isCorrect && !isMyPick && "border-border/40 text-muted-foreground opacity-60"
                  )}
                >
                  <span className="mr-2">{["A", "B", "C", "D"][i]}</span>
                  {opt}
                  {isCorrect && <ShieldAlert className="w-3 h-3 inline ml-2 -mt-0.5" />}
                  {isMyPick && !isCorrect && <span className="text-[9px] uppercase ml-2">tu elección</span>}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
            <span className={me.lastGain > 0 ? "text-green-hud" : "text-muted-foreground"}>
              +{me.lastGain} pts {me.lastGain > 0 ? "· ¡punto!" : "· fallo"}
            </span>
            <span className={rival.lastGain > 0 ? "text-amber" : "text-muted-foreground"}>
              rival: +{rival.lastGain} pts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// barra de progreso del tiempo (10Hz, solo este componente se actualiza)
function DuelTimerBar({ phase, ends, duration }: { phase: DuelState["phase"]; ends: number; duration: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (phase === "ENDED") return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [phase]);
  const frac = Math.max(0, Math.min(1, (ends - now) / duration));
  const urgent = frac < 0.3 && phase === "QUESTION";
  return (
    <div className="h-1.5 w-full bg-black/60 border border-border overflow-hidden rounded-sm" role="progressbar" aria-label="tiempo restante">
      <div
        className={cn("h-full transition-[width] duration-100 ease-linear", urgent ? "bg-red-hud" : "bg-gradient-to-r from-electric to-neon")}
        style={{ width: `${frac * 100}%` }}
      />
    </div>
  );
}

// ============================================================
// v17 — MODO RANKING: board mundial ELO (SQLite via /api/mp/stats)
// ============================================================
function RankingMode({ alias }: { alias: string }) {
  const [board, setBoard] = useState<RankRow[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const myName = (alias || "").toUpperCase().slice(0, 18);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch("/api/mp/stats")
      .then((r) => { if (!r.ok) throw new Error("fail"); return r.json(); })
      .then((d) => setBoard(d.board ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // primera carga sin spinner síncrono (evita renders en cascada)
  useEffect(() => {
    let alive = true;
    fetch("/api/mp/stats")
      .then((r) => { if (!r.ok) throw new Error("fail"); return r.json(); })
      .then((d) => { if (alive) { setBoard(d.board ?? []); setLoading(false); } })
      .catch(() => { if (alive) { setError(true); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  return (
    <div className="space-y-3">
      <div className="hud-corner p-3">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <p className="text-[11px] font-mono uppercase text-amber flex items-center gap-1.5">
            <Medal className="w-3.5 h-3.5" /> Ranking mundial ELO — multijugador
          </p>
          <Button size="sm" variant="outline" onClick={load} className="h-7 font-mono text-[9px] uppercase border-border text-muted-foreground">
            <RefreshCw className={cn("w-3 h-3 mr-1", loading && "animate-spin")} /> Actualizar
          </Button>
        </div>

        {/* como funciona el ELO */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-4">
          <div className="border border-green-hud/30 bg-green-hud/5 px-2 py-1.5 rounded-sm">
            <p className="text-[8px] font-mono uppercase text-muted-foreground tracking-widest">Victoria guerra</p>
            <p className="text-[10px] font-mono text-green-hud font-bold">ELO +30</p>
          </div>
          <div className="border border-electric/30 bg-electric/5 px-2 py-1.5 rounded-sm">
            <p className="text-[8px] font-mono uppercase text-muted-foreground tracking-widest">Duelo ganado</p>
            <p className="text-[10px] font-mono text-electric font-bold">ELO +22</p>
          </div>
          <div className="border border-amber-hud/30 bg-amber-hud/5 px-2 py-1.5 rounded-sm">
            <p className="text-[8px] font-mono uppercase text-muted-foreground tracking-widest">Caso resuelto</p>
            <p className="text-[10px] font-mono text-amber font-bold">ELO +12</p>
          </div>
          <div className="border border-red-hud/30 bg-red-hud/5 px-2 py-1.5 rounded-sm">
            <p className="text-[8px] font-mono uppercase text-muted-foreground tracking-widest">Derrotas</p>
            <p className="text-[10px] font-mono text-red-hud font-bold">-16 / -14</p>
          </div>
        </div>

        {loading && board == null && (
          <div className="space-y-1.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-background/60 border border-border/40 rounded-sm animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-xs font-mono text-red-hud uppercase mb-3">No se pudo cargar el ranking</p>
            <Button size="sm" onClick={load} className="font-mono text-[10px] uppercase border-electric-hud text-electric bg-electric/20">
              <RefreshCw className="w-3 h-3 mr-1" /> Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && board != null && board.length === 0 && (
          <p className="text-xs font-mono text-muted-foreground text-center py-8 uppercase">
            Nadie ha jugado aún — sé el primero en el board mundial
          </p>
        )}

        {!loading && !error && board != null && board.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] font-mono">
              <thead>
                <tr className="text-muted-foreground uppercase tracking-widest border-b border-border/60">
                  <th className="text-left py-2 px-1">#</th>
                  <th className="text-left py-2 px-1">Operador</th>
                  <th className="text-right py-2 px-1">ELO</th>
                  <th className="text-right py-2 px-1 hidden sm:table-cell">Guerras</th>
                  <th className="text-right py-2 px-1 hidden sm:table-cell">Duelos</th>
                  <th className="text-right py-2 px-1 hidden md:table-cell">Capturas</th>
                  <th className="text-right py-2 px-1 hidden md:table-cell">Casos</th>
                </tr>
              </thead>
              <tbody>
                {board.map((row, i) => (
                  <tr
                    key={row.username}
                    className={cn(
                      "border-b border-border/30",
                      row.username === myName && "bg-amber-hud/10 text-amber font-bold"
                    )}
                  >
                    <td className="py-2 px-1">
                      {i === 0 ? <Crown className="w-3.5 h-3.5 text-amber" /> : i < 3 ? <Medal className={cn("w-3 h-3", i === 1 ? "text-zinc-300" : "text-orange-400")} /> : <span className="text-muted-foreground">{i + 1}</span>}
                    </td>
                    <td className="py-2 px-1 uppercase truncate max-w-[120px]">
                      {row.username}{row.username === myName && <span className="text-[8px] text-muted-foreground"> (TU)</span>}
                    </td>
                    <td className="py-2 px-1 text-right font-bold text-foreground">{row.elo}</td>
                    <td className="py-2 px-1 text-right text-muted-foreground hidden sm:table-cell">{row.wins}V/{row.losses}D</td>
                    <td className="py-2 px-1 text-right text-muted-foreground hidden sm:table-cell">{row.duelsWon}V/{row.duelsLost}D</td>
                    <td className="py-2 px-1 text-right text-muted-foreground hidden md:table-cell">{row.captures}</td>
                    <td className="py-2 px-1 text-right text-muted-foreground hidden md:table-cell">{row.detectiveSolved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {myName && !board.some((r) => r.username === myName) && (
              <p className="text-[9px] font-mono text-muted-foreground pt-2 uppercase">
                <ChevronRight className="w-3 h-3 inline -mt-0.5" /> Juega una guerra o un duelo para entrar al board
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ================= GLOBO 3D DEL MULTIJUGADOR =================
function MpMap({
  state, myId, selected, attackTargets, onSelect,
}: {
  state: MpState;
  myId: string;
  selected: string | null;
  attackTargets: string[];
  onSelect: (tid: string) => void;
}) {
  // color de cada territorio segun dueno
  const territoryColors = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of state.territoryMeta) {
      const owner = state.territories[t.id]?.owner;
      m[t.id] = owner ? state.players[owner]?.color ?? "#52525b" : "#52525b";
    }
    return m;
  }, [state.territoryMeta, state.territories, state.players]);

  const territoryNames = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of state.territoryMeta) m[t.id] = t.name;
    return m;
  }, [state.territoryMeta]);

  const selectedTerr = selected ? state.territoryMeta.find((t) => t.id === selected) : null;

  const markers = useMemo(() => {
    const arr: Globe3DMarker[] = state.territoryMeta.flatMap((t) => {
      const terr = state.territories[t.id];
      if (!terr) return [];
      const owner = terr.owner;
      const color = owner ? state.players[owner]?.color ?? "#52525b" : "#52525b";
      const isMine = owner === myId;
      const isSel = selected === t.id;
      const isTarget = attackTargets.includes(t.id);
      return [{
        id: t.id,
        lat: t.lat,
        lng: t.lng,
        color,
        size: 0.26 + Math.min(terr.troops, 20) * 0.012,
        alt: 0.015,
        ring: isSel || isTarget || isMine,
        ringMax: isTarget ? 5 : 3,
        label: `${t.name} — ${terr.troops} tropas${isMine ? " · TUYO" : owner ? "" : " · NEUTRAL"}`,
        labelTag: isMine ? "TU FRENTE" : owner ? state.players[owner]?.name ?? "" : "NEUTRAL",
        onClick: () => onSelect(t.id),
      }];
    });
    return arr;
  }, [state, myId, selected, attackTargets, onSelect]);

  const arcs = useMemo(() => {
    if (!selectedTerr) return [] as Globe3DArc[];
    return attackTargets.flatMap((a) => {
      const to = state.territoryMeta.find((t) => t.id === a);
      if (!to) return [];
      return [{
        startLat: selectedTerr.lat,
        startLng: selectedTerr.lng,
        endLat: to.lat,
        endLng: to.lng,
        color: ["#FF3B30", "#FF3B3066"] as [string, string],
        stroke: 0.9,
        dashTime: 1600,
      }];
    });
  }, [selectedTerr, attackTargets, state.territoryMeta]);

  return (
    <div className="hud-corner relative overflow-hidden">
      <GlobeMap3D
        territoryColors={territoryColors}
        territoryNames={territoryNames}
        highlightTerritory={selected}
        onTerritoryClick={(tid) => {
          if (tid) onSelect(tid);
        }}
        markers={markers}
        arcs={arcs}
        height="min(58vh, 560px)"
        minHeight={300}
        autoRotate={false}
        pov={{ lat: 24, lng: 12, altitude: 2.05 }}
        ariaLabel="Mapa de guerra global 3D multijugador"
      />
      <div className="absolute bottom-2 left-2 text-[10px] font-mono font-bold text-amber bg-background/85 px-2 py-1 hud-corner border-amber-hud">
        MULTIJUGADOR · RONDA {state.round} · {state.phase}
      </div>
      <div className="absolute bottom-2 right-2 text-[9px] font-mono text-muted-foreground bg-background/85 px-2 py-1 rounded-sm">
        ■ NEUTRAL · arrastra para girar · clic para actuar
      </div>
    </div>
  );
}
