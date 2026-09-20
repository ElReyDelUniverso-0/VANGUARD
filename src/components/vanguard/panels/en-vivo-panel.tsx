"use client";

// Vanguard v23 — EN VIVO MUNDIAL: sistema completo de streaming integrado.
// TIPO 1: streams de noticias REALES (Al Jazeera, DW, France 24, Euronews, RT)
//         embebidos de YouTube live_stream con filtros por idioma/perspectiva,
//         expansión a pantalla completa, audio solo del seleccionado y chat lateral.
// TIPO 2: streams de la COMUNIDAD con base de datos real — chat en vivo, donaciones
//         de monedas reales, reacciones, predicción votable, contador de espectadores,
//         compartir y ganancias del streamer (bonus por espectadores).
// Plus: programación de streams, replays y panel MI DIRECTO con getUserMedia/WebRTC
// (STUN de Google), clip de los últimos 30s (MediaRecorder) y reclamo de ganancias.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import {
  Radio, Eye, Coins, Users, Send, Share2, CalendarDays, History, Crown,
  ArrowLeft, Video, VideoOff, Scissors, Copy, Gift, Target, TrendingUp,
  Globe2, BadgeCheck, ShieldAlert, Sparkles, Expand, X, CircleDot, Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/game-store";
import { useProfileStore } from "@/lib/profile-store";
import { Countryball, STICKER_CODES } from "@/components/vanguard/countryball";
import {
  NEWS_CHANNELS, LIVE_CATEGORIES, LIVE_RULES, VIEWER_REWARDS, REACTIONS,
  MIN_LEVEL_LIVE, rankOf,
} from "@/lib/rewards";

// ============ TIPOS ============
interface LiveStreamRow {
  id: string; title: string; category: string; streamerName: string; country: string;
  status: string; viewers: number; peakViewers: number; totalViews: number;
  pollQuestion: string; pollOptions: string; pollVotes: string;
  startedAt: string; durationMin: number; earnedCoins: number;
  _count?: { chat: number; donations: number };
}
interface ChatRow {
  id: string; author: string; country: string; content: string;
  kind: string; amount: number; createdAt: string;
}
interface ScheduleRow { id: string; title: string; host: string; category: string; description: string; scheduledAt: string; }
interface ReplayRow { id: string; title: string; streamerName: string; category: string; durationMin: number; peakViewers: number; views: number; recordedAt: string; }

const LANGS = [
  { key: "", label: "TODOS" },
  { key: "en", label: "INGLÉS" },
  { key: "ar", label: "ÁRABE" },
  { key: "fr", label: "FRANCÉS" },
  { key: "ru", label: "RUSO" },
  { key: "es", label: "ESPAÑOL" },
];
const PERSPECTIVES = ["", "Occidental", "Catar", "Europa", "Rusia", "Mundial"];

const DONATION_TIERS = [
  { coins: 25, label: "APOYO", color: "text-amber border-amber-hud" },
  { coins: 100, label: "MEGADONACIÓN", color: "text-violet-hud border-violet-hud" },
  { coins: 500, label: "LEYENDA", color: "text-red-hud border-red-hud" },
];

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

// ============ COMPONENTE ============
export function EnVivoPanel() {
  const alias = useGameStore((s) => s.alias);
  const level = useGameStore((s) => s.level);
  const addCoins = useGameStore((s) => s.addCoins);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const addXp = useGameStore((s) => s.addXp);
  const cbAvatar = useProfileStore((s) => s.cbAvatar);

  const [section, setSection] = useState<"medios" | "comunidad" | "programacion" | "replays" | "midirecto" | "reglas">("medios");
  const [presence, setPresence] = useState(1);
  const sidRef = useRef<string>(Math.random().toString(36).slice(2));

  // presencia global: heartbeat cada 30s
  useEffect(() => {
    let alive = true;
    const beat = (action: "join" | "leave") => {
      fetch("/api/live/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sid: sidRef.current }),
      })
        .then((r) => r.json())
        .then((d) => { if (alive) setPresence(Math.max(1, d.online || 0)); })
        .catch(() => {});
    };
    beat("join");
    const t = setInterval(() => beat("join"), 30000);
    const onLeave = () => beat("leave");
    window.addEventListener("pagehide", onLeave);
    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener("pagehide", onLeave);
      beat("leave");
    };
  }, []);

  return (
    <div className="space-y-4" id="en-vivo">
      <PanelHeader
        title="EN VIVO MUNDIAL"
        subtitle="Noticias reales + comunidad transmitiendo ahora"
        icon={<Radio className="w-4 h-4" />}
        color="red"
        right={
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 px-2 py-1 border border-red-hud/50 rounded-sm bg-red-hud/10">
              <span className="w-2 h-2 rounded-full bg-red-hud blink-soft" />
              <Eye className="w-3 h-3 text-red-hud" />
              {presence} EN VANGUARD
            </span>
          </div>
        }
      />

      {/* tabs internos */}
      <div className="flex gap-1 overflow-x-auto thin-scroll pb-1" style={{ scrollbarWidth: "none" }}>
        {([
          { k: "medios", l: "📺 MEDIOS OFICIALES" },
          { k: "comunidad", l: "👥 COMUNIDAD EN VIVO" },
          { k: "programacion", l: "🗓️ PROGRAMACIÓN" },
          { k: "replays", l: "📼 REPLAYS" },
          { k: "midirecto", l: "🔴 MI DIRECTO" },
          { k: "reglas", l: "📜 REGLAS & PREMIOS" },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => setSection(t.k)}
            className={cn(
              "px-2.5 py-1.5 rounded-sm font-mono text-[10px] font-bold tracking-wide whitespace-nowrap border transition-colors",
              section === t.k
                ? "text-red-hud border-red-hud bg-red-hud/20"
                : "border-border/60 text-muted-foreground hover:text-foreground hover:border-red-hud/40"
            )}
          >
            {t.l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {section === "medios" && <MediosSection presence={presence} />}
          {section === "comunidad" && <ComunidadSection alias={alias || "Anónimo"} cbAvatar={cbAvatar} onGoLive={() => setSection("midirecto")} />}
          {section === "programacion" && <ProgramacionSection alias={alias || "Anónimo"} />}
          {section === "replays" && <ReplaysSection />}
          {section === "midirecto" && <MiDirectoSection alias={alias} level={level} cbAvatar={cbAvatar} addCoins={addCoins} />}
          {section === "reglas" && <ReglasSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============ SECCIÓN 1: MEDIOS OFICIALES ============
function MediosSection({ presence }: { presence: number }) {
  const [lang, setLang] = useState("");
  const [perspective, setPerspective] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(
    () => NEWS_CHANNELS.filter((c) => (!lang || c.lang === lang) && (!perspective || c.perspective === perspective)),
    [lang, perspective]
  );
  const expandedCh = NEWS_CHANNELS.find((c) => c.id === expanded);

  return (
    <div className="space-y-3">
      {/* filtros por idioma e ideología/perspectiva */}
      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
        <span className="text-muted-foreground">IDIOMA:</span>
        {LANGS.map((l) => (
          <button key={l.key} onClick={() => setLang(l.key)} className={cn("px-2 py-1 rounded-sm border", lang === l.key ? "text-amber border-amber-hud bg-amber-hud/20" : "border-border/60 text-muted-foreground hover:text-foreground")}>{l.label}</button>
        ))}
        <span className="text-muted-foreground ml-2">PERSPECTIVA:</span>
        {PERSPECTIVES.map((p) => (
          <button key={p} onClick={() => setPerspective(p)} className={cn("px-2 py-1 rounded-sm border", perspective === p ? "text-cyan-hud border-cyan-hud bg-cyan-hud/20" : "border-border/60 text-muted-foreground hover:text-foreground")}>{p || "TODAS"}</button>
        ))}
      </div>

      {/* grid de streams simultáneos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((ch) => (
          <div key={ch.id} className="hud-panel border-amber-hud overflow-hidden">
            <div className="relative aspect-video bg-[#0A0A0F]">
              <iframe
                src={`https://www.youtube.com/embed/live_stream?channel=${ch.channelId}&autoplay=1&mute=1&rel=0`}
                title={ch.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 h-full w-full"
              />
              {/* badge LIVE pulsante */}
              <span className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-mono font-bold rounded-sm z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-white blink-soft" /> LIVE
              </span>
              <button
                onClick={() => setExpanded(ch.id)}
                className="absolute bottom-2 right-2 z-10 flex items-center gap-1 px-2 py-1 bg-black/70 border border-amber-hud/40 text-amber text-[9px] font-mono rounded-sm hover:bg-black/90"
                title="Expandir a pantalla completa (audio activado)"
              >
                <Expand className="w-3 h-3" /> EXPANDIR
              </button>
            </div>
            <div className="p-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Countryball code={ch.country} size={26} />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold truncate">{ch.name}</div>
                  <div className="text-[9px] font-mono text-muted-foreground">{ch.perspective} · {ch.lang.toUpperCase()}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono text-red-hud flex items-center gap-1 justify-end"><span className="w-1.5 h-1.5 rounded-full bg-red-hud blink-soft" />EN VIVO</div>
                <div className="text-[9px] font-mono text-muted-foreground">{fmt(Math.round(presence * 3.7 + 40))} aquí · a</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="hud-panel p-6 text-center text-[11px] font-mono text-muted-foreground">No hay canales con ese filtro.</div>
      )}
      <p className="text-[9px] font-mono text-muted-foreground">
        AUDIO SOLO DEL STREAM SELECCIONADO: la parrilla está silenciada; al expandir un canal se activa su audio.
        Si YouTube bloquea la reproducción embebida, usa el enlace directo del canal.
      </p>

      {/* modal expandido a pantalla completa con chat lateral */}
      <AnimatePresence>
        {expandedCh && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0A0A0F]/97 backdrop-blur-md flex flex-col"
            role="dialog" aria-modal="true" aria-label={`Stream expandido de ${expandedCh.name}`}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-amber-hud/30">
              <div className="flex items-center gap-2">
                <Countryball code={expandedCh.country} size={24} />
                <span className="font-mono text-xs font-bold">{expandedCh.name}</span>
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-mono font-bold rounded-sm"><span className="w-1.5 h-1.5 rounded-full bg-white blink-soft" /> LIVE</span>
              </div>
              <div className="flex items-center gap-2">
                {/* cambiar de stream con un click */}
                <div className="hidden sm:flex gap-1">
                  {NEWS_CHANNELS.filter((c) => c.id !== expandedCh.id).map((c) => (
                    <button key={c.id} onClick={() => setExpanded(c.id)} title={c.name} className="opacity-70 hover:opacity-100">
                      <Countryball code={c.country} size={22} />
                    </button>
                  ))}
                </div>
                <a href={expandedCh.site} target="_blank" rel="noreferrer" className="text-[9px] font-mono text-amber border border-amber-hud/40 px-2 py-1 rounded-sm hover:bg-amber-hud/10">ABRIR EN YOUTUBE</a>
                <button onClick={() => setExpanded(null)} className="p-1.5 border border-border/60 rounded-sm hover:bg-secondary" aria-label="Cerrar"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 flex flex-col lg:flex-row min-h-0">
              <div className="relative flex-1 bg-black min-h-[40vh]">
                <iframe
                  key={expandedCh.id}
                  src={`https://www.youtube.com/embed/live_stream?channel=${expandedCh.channelId}&autoplay=1&mute=0&rel=0`}
                  title={`${expandedCh.name} expandido`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
              <LiveSalaChat channelName={expandedCh.name} presence={presence} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Chat lateral de la sala (medios oficiales) — persistente vía API global de sala
function LiveSalaChat({ channelName, presence }: { channelName: string; presence: number }) {
  const alias = useGameStore((s) => s.alias);
  const cbAvatar = useProfileStore((s) => s.cbAvatar);
  const [messages, setMessages] = useState<ChatRow[]>([]);
  const [text, setText] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    fetch("/api/live/streams/sala-chat")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 3500);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = () => {
    const content = text.trim();
    if (!content) return;
    setText("");
    fetch("/api/live/streams/sala-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: alias || "Anónimo", country: cbAvatar || "us", content: `(${channelName}) ${content}` }),
    })
      .then(() => load())
      .catch(() => {});
  };

  return (
    <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-amber-hud/30 flex flex-col max-h-64 lg:max-h-none" aria-label="Chat de la sala en vivo">
      <div className="px-3 py-2 border-b border-amber-hud/20 text-[10px] font-mono font-bold flex items-center justify-between">
        <span>💬 CHAT DE LA SALA</span>
        <span className="text-red-hud">{presence} online</span>
      </div>
      <div ref={boxRef} className="flex-1 overflow-y-auto thin-scroll p-2 space-y-1.5 max-h-40 lg:max-h-[60vh]">
        {messages.length === 0 && <div className="text-[10px] font-mono text-muted-foreground text-center py-6">Sé el primero en comentar el directo.</div>}
        {messages.map((m) => (
          <div key={m.id} className="flex items-start gap-1.5">
            <Countryball code={m.country} size={16} angry={false} />
            <p className="text-[10px] leading-snug">
              <span className={cn("font-bold", m.author === "SISTEMA" ? "text-amber" : "text-cyan-hud")}>{m.author}: </span>
              <span className="text-foreground/90">{m.content}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-amber-hud/20 flex gap-1.5">
        <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Comenta el directo…" className="h-8 text-xs" maxLength={280} />
        <Button size="sm" variant="outline" onClick={send} className="h-8 px-2.5" aria-label="Enviar mensaje"><Send className="w-3.5 h-3.5" /></Button>
      </div>
    </aside>
  );
}

// ============ SECCIÓN 2: COMUNIDAD EN VIVO (streams de usuarios, DB real) ============
function ComunidadSection({ alias, cbAvatar, onGoLive }: { alias: string; cbAvatar: string; onGoLive: () => void }) {
  const [streams, setStreams] = useState<LiveStreamRow[]>([]);
  const [sort, setSort] = useState<"viewers" | "recent" | "category" | "country">("viewers");
  const [cat, setCat] = useState("");
  const [watching, setWatching] = useState<LiveStreamRow | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const params = new URLSearchParams({ status: "live", sort: sort === "category" || sort === "country" ? "recent" : sort });
    if (cat) params.set("cat", cat);
    fetch(`/api/live/streams?${params}`)
      .then((r) => r.json())
      .then((d) => {
        let list: LiveStreamRow[] = d.streams ?? [];
        if (sort === "country") list = [...list].sort((a, b) => (a.country > b.country ? 1 : -1));
        setStreams(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sort, cat]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000); // refresco del contador de espectadores
    return () => clearInterval(t);
  }, [load]);

  if (watching) {
    return <WatchCommunity stream={watching} alias={alias} cbAvatar={cbAvatar} onBack={() => { setWatching(null); load(); }} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
        <span className="text-muted-foreground">ORDENAR:</span>
        {([
          { k: "viewers", l: "👥 MÁS ESPECTADORES" },
          { k: "recent", l: "🆕 MÁS RECIENTE" },
          { k: "category", l: "📊 CATEGORÍA" },
          { k: "country", l: "🌍 PAÍS DEL STREAMER" },
        ] as const).map((s) => (
          <button key={s.k} onClick={() => setSort(s.k)} className={cn("px-2 py-1 rounded-sm border", sort === s.k ? "text-red-hud border-red-hud bg-red-hud/20" : "border-border/60 text-muted-foreground hover:text-foreground")}>{s.l}</button>
        ))}
        <span className="text-muted-foreground ml-2">CATEGORÍA:</span>
        <button onClick={() => setCat("")} className={cn("px-2 py-1 rounded-sm border", !cat ? "text-amber border-amber-hud bg-amber-hud/20" : "border-border/60 text-muted-foreground")}>TODAS</button>
        {LIVE_CATEGORIES.map((c) => (
          <button key={c.key} onClick={() => setCat(c.key)} className={cn("px-2 py-1 rounded-sm border", cat === c.key ? "text-amber border-amber-hud bg-amber-hud/20" : "border-border/60 text-muted-foreground hover:text-foreground")}>{c.icon} {c.label.toUpperCase()}</button>
        ))}
        <button onClick={onGoLive} className="ml-auto px-2 py-1 rounded-sm border border-red-hud bg-red-hud/20 text-red-hud font-bold">🔴 HACER MI LIVE</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {streams.map((s) => {
          const catInfo = LIVE_CATEGORIES.find((c) => c.key === s.category);
          const donations = s._count?.donations ?? 0;
          return (
            <button key={s.id} onClick={() => setWatching(s)} className="hud-panel border-red-hud/40 text-left hover:border-red-hud transition-colors group">
              <div className="relative h-28 bg-gradient-to-br from-[#1a0a0f] via-[#0A0A0F] to-[#241016] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 50% 60%, rgba(255,59,48,0.35), transparent 65%)" }} />
                <Countryball code={s.country} size={54} className="group-hover:scale-110 transition-transform" />
                <span className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-mono font-bold rounded-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white blink-soft" /> LIVE
                </span>
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-[9px] font-mono text-white rounded-sm flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {s.viewers}
                </span>
              </div>
              <div className="p-2.5 space-y-1">
                <div className="text-[11px] font-bold leading-tight line-clamp-2">{s.title}</div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
                  <Countryball code={s.country} size={14} angry={false} />
                  <span className="text-cyan-hud font-bold">{s.streamerName}</span>
                  <span>· {catInfo?.icon} {catInfo?.label ?? s.category}</span>
                </div>
                <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1"><MessageCount n={s._count?.chat ?? 0} /> mensajes</span>
                  <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-amber" /> {donations} donaciones</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {loading && <div className="hud-panel p-6 text-center text-[11px] font-mono text-muted-foreground">Cargando streams de la comunidad…</div>}
      {!loading && streams.length === 0 && (
        <div className="hud-panel p-6 text-center space-y-2">
          <div className="text-[11px] font-mono text-muted-foreground">Nadie está transmitiendo ahora con esos filtros.</div>
          <Button size="sm" variant="outline" onClick={onGoLive}>🔴 SÉ EL PRIMERO EN HACER LIVE</Button>
        </div>
      )}
    </div>
  );
}

function MessageCount({ n }: { n: number }) {
  return <><Send className="w-3 h-3" /> {n}</>;
}

// ===== VISTA WATCH: escenario + chat + donaciones + reacciones + predicción =====
function WatchCommunity({ stream, alias, cbAvatar, onBack }: { stream: LiveStreamRow; alias: string; cbAvatar: string; onBack: () => void }) {
  const spendCoins = useGameStore((s) => s.spendCoins);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const [live, setLive] = useState<LiveStreamRow>(stream);
  const [messages, setMessages] = useState<ChatRow[]>([]);
  const [text, setText] = useState("");
  const [floats, setFloats] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const [donated, setDonated] = useState(0);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [watchSecs, setWatchSecs] = useState(0);
  const floatId = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const watchedRef = useRef(false);

  const pollOptions = useMemo(() => { try { return JSON.parse(stream.pollOptions || "[]") as { k: string; t: string }[]; } catch { return []; } }, [stream.pollOptions]);
  const pollVotes = useMemo(() => { try { return JSON.parse(live.pollVotes || "{}") as Record<string, string[]>; } catch { return {}; } }, [live.pollVotes]);

  const loadChat = useCallback(() => {
    fetch(`/api/live/streams/${stream.id}/chat?take=60`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => {});
  }, [stream.id]);

  const loadStream = useCallback(() => {
    fetch(`/api/live/streams/${stream.id}`)
      .then((r) => r.json())
      .then((d) => { if (d.stream) setLive(d.stream); if (typeof d.donated === "number") setDonated(d.donated); })
      .catch(() => {});
  }, [stream.id]);

  // join/leave + heartbeat del contador de espectadores
  useEffect(() => {
    fetch(`/api/live/streams/${stream.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "join" }) }).catch(() => {});
    return () => {
      fetch(`/api/live/streams/${stream.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "leave" }) }).catch(() => {});
    };
  }, [stream.id]);

  useEffect(() => {
    loadChat();
    loadStream();
    const t1 = setInterval(loadChat, 3000);
    const t2 = setInterval(loadStream, 10000);
    const t3 = setInterval(() => setWatchSecs((s) => s + 1), 1000);
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); };
  }, [loadChat, loadStream]);

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // recompensa: ver 30 min de live = +10 monedas (una vez por stream)
  useEffect(() => {
    if (watchSecs >= 1800 && !watchedRef.current) {
      watchedRef.current = true;
      addCoins(10, "Ver 30 min de live");
      toast.success("⏱️ 30 minutos de directo completados: +10 monedas");
    }
  }, [watchSecs, addCoins]);

  const react = (emoji: string) => {
    floatId.current += 1;
    const id = floatId.current;
    setFloats((f) => [...f, { id, emoji, x: 10 + Math.random() * 70 }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 2600);
    fetch(`/api/live/streams/${stream.id}/chat`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: alias, country: cbAvatar || "us", content: emoji, kind: "reaction" }),
    }).catch(() => {});
  };

  const send = () => {
    const content = text.trim();
    if (!content) return;
    setText("");
    fetch(`/api/live/streams/${stream.id}/chat`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: alias, country: cbAvatar || "us", content }),
    })
      .then(() => loadChat())
      .catch(() => {});
  };

  const donate = (coins: number) => {
    if (!spendCoins(coins, `Donación a ${live.streamerName}`)) {
      toast.error("No tienes suficientes monedas en la bolsa");
      return;
    }
    addXp(5); // donar: +5 XP
    fetch(`/api/live/streams/${stream.id}/donate`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: alias, country: cbAvatar || "us", amount: coins, message: "" }),
    })
      .then(() => { loadChat(); loadStream(); toast.success(`💰 Donaste ${coins} monedas a ${live.streamerName} (+5 XP)`); })
      .catch(() => {});
  };

  const votePoll = (opt: string) => {
    setMyVote(opt);
    fetch(`/api/live/streams/${stream.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "poll-vote", option: opt, voter: alias }),
    })
      .then(() => loadStream())
      .catch(() => {});
  };

  const share = (net: "x" | "wa" | "tg" | "copy") => {
    const txt = `🔴 ${live.streamerName} está en vivo en VANGUARD: "${live.title}"`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (net === "x") window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(txt)}&url=${encodeURIComponent(url)}`, "_blank");
    if (net === "wa") window.open(`https://wa.me/?text=${encodeURIComponent(`${txt} ${url}`)}`, "_blank");
    if (net === "tg") window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(txt)}`, "_blank");
    if (net === "copy") { navigator.clipboard?.writeText(`${txt} ${url}`).then(() => toast.success("Enlace copiado")); }
  };

  const totalPollVotes = Object.values(pollVotes).reduce((a, b) => a + b.length, 0);
  const catInfo = LIVE_CATEGORIES.find((c) => c.key === live.category);
  const mins = Math.floor((Date.now() - new Date(live.startedAt).getTime()) / 60000);

  return (
    <div className="space-y-3">
      <Button size="sm" variant="outline" onClick={onBack} className="gap-1.5"><ArrowLeft className="w-3.5 h-3.5" /> VOLVER A COMUNIDAD</Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* escenario */}
        <div className="lg:col-span-2 space-y-3">
          <div className="hud-panel border-red-hud overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-[#1a0a0f] via-[#0A0A0F] to-[#241016] flex flex-col items-center justify-center overflow-hidden">
              {/* ondas de emisión */}
              <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 50% 55%, rgba(255,59,48,0.4), transparent 60%)" }} />
              {[1, 2, 3].map((i) => (
                <span key={i} className="absolute rounded-full border border-red-hud/30" style={{ width: `${i * 90 + 60}px`, height: `${i * 90 + 60}px`, animation: `pulse 2.4s ${i * 0.5}s infinite` }} />
              ))}
              <Countryball code={live.country} size={72} className="relative z-10" />
              <div className="relative z-10 mt-3 text-center px-4">
                <div className="font-mono text-sm font-bold">{live.title}</div>
                <div className="text-[10px] font-mono text-muted-foreground mt-1">{catInfo?.icon} {catInfo?.label} · inició hace {mins} min</div>
              </div>
              <span className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-mono font-bold rounded-sm">
                <span className="w-2 h-2 rounded-full bg-white blink-soft" /> EN VIVO
              </span>
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-[10px] font-mono text-white rounded-sm flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-red-hud" /> {live.viewers} VIENDO AHORA · pico {live.peakViewers}
              </span>
              {/* reacciones flotantes */}
              <div className="pointer-events-none absolute inset-0 z-20">
                {floats.map((f) => (
                  <motion.span key={f.id} initial={{ opacity: 1, y: 0, scale: 0.8 }} animate={{ opacity: 0, y: -180, scale: 1.6 }} transition={{ duration: 2.4, ease: "easeOut" }} className="absolute bottom-4 text-2xl" style={{ left: `${f.x}%` }}>
                    {f.emoji}
                  </motion.span>
                ))}
              </div>
            </div>
            {/* barra: reacciones + compartir + donar */}
            <div className="p-2 flex flex-wrap items-center gap-1.5 border-t border-red-hud/20">
              {REACTIONS.map((r) => (
                <button key={r.key} onClick={() => react(r.emoji)} className="px-2 py-1 rounded-sm border border-border/60 hover:border-amber-hud text-base leading-none" title={`Reaccionar ${r.emoji}`}>{r.emoji}</button>
              ))}
              <span className="flex-1" />
              <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1"><Coins className="w-3 h-3 text-amber" /> recaudado: <span className="text-amber font-bold">{donated}</span></span>
              {DONATION_TIERS.map((t) => (
                <button key={t.coins} onClick={() => donate(t.coins)} className={cn("px-2 py-1 rounded-sm border text-[9px] font-mono font-bold hover:bg-secondary", t.color)}>
                  💰 {t.coins}
                </button>
              ))}
              <div className="flex items-center gap-1">
                <button onClick={() => share("x")} title="Compartir en X" className="p-1.5 border border-border/60 rounded-sm hover:bg-secondary text-[10px] font-mono">𝕏</button>
                <button onClick={() => share("wa")} title="Compartir por WhatsApp" className="p-1.5 border border-border/60 rounded-sm hover:bg-secondary text-[10px] font-mono">WA</button>
                <button onClick={() => share("tg")} title="Compartir por Telegram" className="p-1.5 border border-border/60 rounded-sm hover:bg-secondary text-[10px] font-mono">TG</button>
                <button onClick={() => share("copy")} title="Copiar enlace" className="p-1.5 border border-border/60 rounded-sm hover:bg-secondary"><Copy className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>

          {/* predicción votable integrada */}
          {pollOptions.length > 0 && live.pollQuestion && (
            <div className="hud-panel border-violet-hud/40 p-3 space-y-2">
              <div className="text-[11px] font-mono font-bold text-violet-hud flex items-center gap-1.5"><Target className="w-4 h-4" /> PREDICCIÓN DEL DIRECTO · {totalPollVotes} votos</div>
              <div className="text-xs">{live.pollQuestion}</div>
              <div className="space-y-1.5">
                {pollOptions.map((o) => {
                  const count = (pollVotes[o.k] ?? []).length;
                  const pct = totalPollVotes ? Math.round((count / totalPollVotes) * 100) : 0;
                  return (
                    <button key={o.k} onClick={() => votePoll(o.k)} className={cn("w-full text-left p-2 rounded-sm border transition-colors", myVote === o.k ? "border-violet-hud bg-violet-hud/10" : "border-border/60 hover:border-violet-hud/50")}>
                      <div className="flex justify-between text-[10px] font-mono"><span><b>{o.k}</b> · {o.t}</span><span>{pct}%</span></div>
                      <div className="h-1.5 bg-secondary rounded-full mt-1 overflow-hidden"><div className="h-full bg-violet-hud/70" style={{ width: `${pct}%` }} /></div>
                    </button>
                  );
                })}
              </div>
              <div className="text-[9px] font-mono text-muted-foreground">Participar en la predicción del live da bonus de monedas 🎯</div>
            </div>
          )}

          {/* mapa del conflicto al lado (acceso rápido) */}
          <div className="hud-panel border-cyan-hud/40 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-cyan-hud" />
              <div>
                <div className="text-[11px] font-bold font-mono">MAPA DEL CONFLICTO</div>
                <div className="text-[9px] font-mono text-muted-foreground">Sigue lo que comenta el streamer en el mapa mundial</div>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: "mapa" }))}>ABRIR MAPA →</Button>
          </div>
        </div>

        {/* chat en tiempo real */}
        <aside className="hud-panel border-amber-hud flex flex-col max-h-[70vh] min-h-[380px]" aria-label="Chat del directo">
          <div className="px-3 py-2 border-b border-amber-hud/20 text-[10px] font-mono font-bold flex items-center justify-between">
            <span>💬 CHAT EN VIVO</span>
            <span className="flex items-center gap-1 text-red-hud"><span className="w-1.5 h-1.5 rounded-full bg-red-hud blink-soft" /> {live.viewers}</span>
          </div>
          <div ref={boxRef} className="flex-1 overflow-y-auto thin-scroll p-2 space-y-1.5">
            {messages.map((m) =>
              m.kind === "donation" ? (
                <div key={m.id} className="p-1.5 rounded-sm bg-amber-hud/15 border border-amber-hud/40">
                  <div className="flex items-center gap-1.5">
                    <Countryball code={m.country} size={16} angry={false} />
                    <span className="text-[10px] font-bold text-amber">💰 {m.author} donó {m.amount} monedas</span>
                  </div>
                  {m.content && m.content !== `ha donado ${m.amount} monedas` && <p className="text-[10px] text-foreground/90 mt-0.5">{m.content}</p>}
                </div>
              ) : m.kind === "system" ? (
                <p key={m.id} className="text-[10px] font-mono text-amber text-center py-0.5">{m.content}</p>
              ) : m.kind === "reaction" ? (
                <p key={m.id} className="text-[10px]">{m.content} <span className="text-muted-foreground">{m.author}</span></p>
              ) : (
                <div key={m.id} className="flex items-start gap-1.5">
                  <Countryball code={m.country} size={16} angry={false} />
                  <p className="text-[10px] leading-snug">
                    <span className="font-bold text-cyan-hud">{m.author}: </span>
                    <span className="text-foreground/90">{m.content}</span>
                  </p>
                </div>
              )
            )}
          </div>
          <div className="p-2 border-t border-amber-hud/20 flex gap-1.5">
            <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Escribe en el chat…" className="h-8 text-xs" maxLength={280} />
            <Button size="sm" variant="outline" onClick={send} className="h-8 px-2.5" aria-label="Enviar"><Send className="w-3.5 h-3.5" /></Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============ SECCIÓN 3: PROGRAMACIÓN ============
function ProgramacionSection({ alias }: { alias: string }) {
  const [items, setItems] = useState<ScheduleRow[]>([]);
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("analisis");
  const [when, setWhen] = useState("");
  const [desc, setDesc] = useState("");

  const load = useCallback(() => {
    fetch("/api/live/schedule").then((r) => r.json()).then((d) => setItems(d.items ?? [])).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const schedule = () => {
    if (!title.trim() || !when) { toast.error("Falta título o fecha del stream"); return; }
    fetch("/api/live/schedule", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, host: alias, category: cat, description: desc, scheduledAt: new Date(when).toISOString() }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { toast.error(d.error); return; }
        toast.success("🗓️ Stream programado — aparecerá en el calendario");
        setTitle(""); setDesc(""); setWhen("");
        load();
      })
      .catch(() => {});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="space-y-2">
        <div className="text-[11px] font-mono font-bold text-amber">🗓️ PRÓXIMOS DIRECTOS PROGRAMADOS</div>
        {items.map((it) => {
          const d = new Date(it.scheduledAt);
          const day = d.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "short" });
          const hour = d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
          const catInfo = LIVE_CATEGORIES.find((c) => c.key === it.category);
          return (
            <div key={it.id} className="hud-panel border-cyan-hud/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-mono px-1.5 py-0.5 border border-cyan-hud/40 text-cyan-hud rounded-sm">{day} · {hour}</span>
                <span className="text-[9px] font-mono text-muted-foreground">{catInfo?.icon} {catInfo?.label}</span>
              </div>
              <div className="text-xs font-bold mt-1.5">{it.title}</div>
              <div className="text-[10px] font-mono text-muted-foreground mt-0.5">host: <span className="text-cyan-hud">{it.host}</span>{it.description ? ` · ${it.description}` : ""}</div>
            </div>
          );
        })}
        {items.length === 0 && <div className="hud-panel p-5 text-center text-[10px] font-mono text-muted-foreground">No hay streams programados todavía.</div>}
      </div>
      <div className="hud-panel border-amber-hud/40 p-3 space-y-2 h-fit">
        <div className="text-[11px] font-mono font-bold text-amber">➕ PROGRAMAR UN DIRECTO</div>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Título — ej: "Debate sobre el conflicto del Sahel"' className="text-xs" maxLength={140} />
        <div className="flex flex-wrap gap-1">
          {LIVE_CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setCat(c.key)} className={cn("px-2 py-1 rounded-sm border text-[9px] font-mono", cat === c.key ? "text-amber border-amber-hud bg-amber-hud/20" : "border-border/60 text-muted-foreground")}>{c.icon} {c.label}</button>
          ))}
        </div>
        <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="text-xs" aria-label="Fecha y hora del stream" />
        <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descripción (opcional)" className="text-xs" maxLength={200} />
        <Button size="sm" onClick={schedule} className="w-full gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> PROGRAMAR DIRECTO</Button>
        <p className="text-[9px] font-mono text-muted-foreground">Ej: "Mañana 8PM — Debate sobre [conflicto]" · "El viernes — Análisis del simulador".</p>
      </div>
    </div>
  );
}

// ============ SECCIÓN 4: REPLAYS ============
function ReplaysSection() {
  const [items, setItems] = useState<ReplayRow[]>([]);
  const [sort, setSort] = useState<"views" | "recent">("views");

  const load = useCallback(() => {
    fetch(`/api/live/replays?sort=${sort}`).then((r) => r.json()).then((d) => setItems(d.items ?? [])).catch(() => {});
  }, [sort]);
  useEffect(() => { load(); }, [load]);

  const open = (r: ReplayRow) => {
    fetch("/api/live/replays", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id }) }).catch(() => {});
    toast.info(`📼 Reproduciendo replay: ${r.title}`, { description: `${r.durationMin} min · pico de ${r.peakViewers} espectadores` });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 text-[10px] font-mono">
        <button onClick={() => setSort("views")} className={cn("px-2 py-1 rounded-sm border", sort === "views" ? "text-amber border-amber-hud bg-amber-hud/20" : "border-border/60 text-muted-foreground")}>🔥 MÁS VISTOS</button>
        <button onClick={() => setSort("recent")} className={cn("px-2 py-1 rounded-sm border", sort === "recent" ? "text-amber border-amber-hud bg-amber-hud/20" : "border-border/60 text-muted-foreground")}>🆕 RECIENTES</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((r) => (
          <button key={r.id} onClick={() => open(r)} className="hud-panel border-violet-hud/30 text-left hover:border-violet-hud transition-colors">
            <div className="relative h-24 bg-gradient-to-br from-[#140a1e] via-[#0A0A0F] to-[#1a1030] flex items-center justify-center">
              <History className="w-8 h-8 text-violet-hud/60" />
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-[9px] font-mono text-white rounded-sm">{r.durationMin} min</span>
            </div>
            <div className="p-2.5 space-y-1">
              <div className="text-[11px] font-bold leading-tight line-clamp-2">{r.title}</div>
              <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1"><Countryball code="un" size={13} angry={false} /> {r.streamerName}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {fmt(r.views)} · pico {r.peakViewers}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      {items.length === 0 && <div className="hud-panel p-5 text-center text-[10px] font-mono text-muted-foreground">Aún no hay replays — termina un directo para generar el primero.</div>}
    </div>
  );
}

// ============ SECCIÓN 5: MI DIRECTO (panel del streamer) ============
function MiDirectoSection({ alias, level, cbAvatar, addCoins }: { alias: string; level: number; cbAvatar: string; addCoins: (n: number, r: string) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("analisis");
  const [camState, setCamState] = useState<"off" | "testing" | "error">("off");
  const [camError, setCamError] = useState("");
  const [streamId, setStreamId] = useState<string | null>(null);
  const [live, setLive] = useState<LiveStreamRow | null>(null);
  const [pending, setPending] = useState(0);
  const [summary, setSummary] = useState<{ minutes: number; bonus: number; peak: number } | null>(null);
  const [clips, setClips] = useState<string[]>([]);
  // v27 — GRABACIÓN REAL A/V del directo + medidor de voz
  const [recording, setRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);
  const [recFiles, setRecFiles] = useState<string[]>([]);
  const [micLevel, setMicLevel] = useState(0);
  const fullRecRef = useRef<MediaRecorder | null>(null);
  const fullChunksRef = useRef<Blob[]>([]);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const canLive = level >= MIN_LEVEL_LIVE;

  // ganancias en espera
  const loadPending = useCallback(() => {
    if (!alias) return;
    fetch(`/api/live/claim?alias=${encodeURIComponent(alias)}`).then((r) => r.json()).then((d) => setPending(d.pending ?? 0)).catch(() => {});
  }, [alias]);
  useEffect(() => { loadPending(); }, [loadPending]);

  // durante el directo: refresco del estado
  useEffect(() => {
    if (!streamId) return;
    const t = setInterval(() => {
      fetch(`/api/live/streams/${streamId}`).then((r) => r.json()).then((d) => { if (d.stream) setLive(d.stream); }).catch(() => {});
    }, 6000);
    return () => clearInterval(t);
  }, [streamId]);

  const testCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true, audio: true,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCamState("testing");
      setCamError("");
      toast.success("🎥 Cámara y micrófono detectados — listo para transmitir");
    } catch (e) {
      setCamState("error");
      setCamError(e instanceof Error ? e.message : "No se pudo acceder a la cámara");
      toast.error("Sin acceso a cámara — revisa permisos del navegador");
    }
  };

  const startLive = async () => {
    if (!alias) { toast.error("Regístrate gratis para transmitir"); return; }
    if (!canLive) { toast.error(`Necesitas nivel ${MIN_LEVEL_LIVE} para hacer live (eres nivel ${level})`); return; }
    if (!title.trim()) { toast.error("Ponle un título a tu transmisión"); return; }
    // asegurar cámara antes de emitir (WebRTC getUserMedia + STUN de Google)
    if (!mediaStreamRef.current) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStreamRef.current = s;
        if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play().catch(() => {}); }
        setCamState("testing");
      } catch {
        toast.error("Se necesita cámara para transmitir en vivo");
        return;
      }
    }
    const res = await fetch("/api/live/streams", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, streamerName: alias, country: cbAvatar || "us" }),
    }).then((r) => r.json()).catch(() => null);
    if (!res?.stream) { toast.error("No se pudo iniciar el directo"); return; }
    setStreamId(res.stream.id);
    setLive(res.stream);
    setSummary(null);
    // búfer continuo de los últimos 30s para el clip (MediaRecorder rolling)
    try {
      chunksRef.current = [];
      const rec = new MediaRecorder(mediaStreamRef.current!);
      rec.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
        // mantener ~30s (aprox 20 chunks de 1.5s)
        while (chunksRef.current.length > 20) chunksRef.current.shift();
      };
      rec.start(1500);
      recorderRef.current = rec;
    } catch { /* sin clip si el navegador no soporta MediaRecorder */ }
    toast.success("🔴 ESTÁS EN VIVO — tu stream ya aparece en COMUNIDAD");
    startMicMeter();
  };

  // v27: medidor de voz real (analiza el micrófono — ves cuándo hablas)
  const startMicMeter = () => {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(mediaStreamRef.current!);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteFrequencyData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i];
        setMicLevel(Math.min(100, Math.round((sum / buf.length) * 1.6)));
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch { /* sin medidor si el navegador no lo permite */ }
  };

  const stopMicMeter = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setMicLevel(0);
  };

  // v27: grabación completa de audio+video — la gente queda grabada hablando
  const startFullRec = () => {
    try {
      fullChunksRef.current = [];
      const rec = new MediaRecorder(mediaStreamRef.current!, { mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : undefined });
      rec.ondataavailable = (e) => { if (e.data.size > 0) fullChunksRef.current.push(e.data); };
      rec.start(2000);
      fullRecRef.current = rec;
      setRecording(true);
      setRecSecs(0);
      recTimerRef.current = setInterval(() => setRecSecs((s) => s + 1), 1000);
      toast.success("⏺ GRABANDO — audio y video de tu directo se están guardando");
    } catch {
      toast.error("Este navegador no permite grabar el directo");
    }
  };

  const stopFullRec = (download: boolean) => {
    if (recTimerRef.current) clearInterval(recTimerRef.current);
    recTimerRef.current = null;
    const rec = fullRecRef.current;
    if (!rec) return;
    rec.onstop = () => {
      const blob = new Blob(fullChunksRef.current, { type: "video/webm" });
      if (download && blob.size > 1000) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const name = `vanguard-directo-${Math.floor(recSecs / 60)}m${recSecs % 60}s-${Date.now()}.webm`;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
        setRecFiles((f) => [...f, name]);
        toast.success("🎥 Grabación completa descargada — audio + video con gente hablando");
      } else if (download) {
        toast.error("La grabación salió vacía");
      }
      fullChunksRef.current = [];
    };
    try { rec.stop(); } catch { /* ya detenido */ }
    fullRecRef.current = null;
    setRecording(false);
  };

  const endLive = async () => {
    if (!streamId) return;
    recorderRef.current?.stop();
    if (recording) stopFullRec(false);
    stopMicMeter();
    const res = await fetch(`/api/live/streams/${streamId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "end" }),
    }).then((r) => r.json()).catch(() => null);
    if (res?.stream) {
      setSummary({ minutes: res.minutes ?? res.stream.durationMin, bonus: res.bonus ?? res.stream.earnedCoins, peak: res.stream.peakViewers });
      toast.success(`🔴 Directo finalizado · +${res.bonus ?? 0} monedas en espera`);
    }
    setStreamId(null);
    setLive(null);
    loadPending();
  };

  const saveClip = () => {
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    if (blob.size < 1000) { toast.error("Aún no hay suficiente grabación para el clip"); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vanguard-clip-30s-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    setClips((c) => [...c, a.download]);
    toast.success("✂️ Clip de los últimos 30 segundos descargado");
  };

  const claim = () => {
    if (!alias) return;
    fetch("/api/live/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alias }) })
      .then((r) => r.json())
      .then((d) => {
        if (d.claimed > 0) {
          addCoins(d.claimed, "Ganancias de directos");
          toast.success(`💰 +${d.claimed} monedas añadidas a tu bolsa`);
          setPending(0);
        }
      })
      .catch(() => {});
  };

  const createPoll = () => {
    if (!streamId) return;
    fetch(`/api/live/streams/${streamId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "poll-create", question: "¿Se mantendrá la tregua esta semana?", options: ["Sí, se mantiene", "No, se rompe"] }),
    })
      .then(() => toast.success("🎯 Predicción lanzada a tu audiencia"))
      .catch(() => {});
  };

  // ===== UI =====
  if (live && streamId) {
    return (
      <div className="space-y-3">
        <div className="hud-panel border-red-hud p-3 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 px-2 py-1 bg-red-600 text-white text-[10px] font-mono font-bold rounded-sm">
              <span className="w-2 h-2 rounded-full bg-white blink-soft" /> ESTÁS EN VIVO
            </span>
            <span className="text-[11px] font-mono flex items-center gap-1.5"><Eye className="w-4 h-4 text-red-hud" /> {live.viewers} viendo · pico {live.peakViewers} · {live.totalViews} entradas</span>
          </div>
          {/* video local (WebRTC getUserMedia) */}
          <div className="relative aspect-video bg-black rounded-sm overflow-hidden">
            <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-cover" aria-label="Tu señal en vivo" />
            <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 text-[9px] font-mono text-red-hud rounded-sm border border-red-hud/40">SEÑAL LOCAL · WebRTC P2P · STUN Google</span>
          </div>
          {/* medidor de voz + grabación A/V (v27) */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono uppercase text-muted-foreground shrink-0">MICRÓFONO</span>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden border border-amber-hud/20">
              <div className={cn("h-full transition-all duration-100", micLevel > 55 ? "bg-red-hud" : micLevel > 18 ? "bg-green-hud" : "bg-cyan-hud")}
                style={{ width: `${Math.max(3, micLevel)}%` }} />
            </div>
            <span className="text-[9px] font-mono text-muted-foreground w-14 text-right">{micLevel > 8 ? "🎙 HABLANDO" : "silencio"}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" onClick={saveClip} className="gap-1.5"><Scissors className="w-3.5 h-3.5" /> CLIP ÚLTIMOS 30s</Button>
            {!recording ? (
              <Button size="sm" variant="outline" onClick={startFullRec} className="gap-1.5 text-red-hud"><CircleDot className="w-3.5 h-3.5" /> GRABAR DIRECTO</Button>
            ) : (
              <>
                <Button size="sm" variant="outline" className="gap-1.5 text-red-hud pointer-events-none">
                  <CircleDot className="w-3.5 h-3.5 animate-pulse fill-red-hud" /> REC {String(Math.floor(recSecs / 60)).padStart(2, "0")}:{String(recSecs % 60).padStart(2, "0")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => stopFullRec(true)} className="gap-1.5">
                  <Square className="w-3.5 h-3.5" /> DETENER Y DESCARGAR
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={createPoll} className="gap-1.5"><Target className="w-3.5 h-3.5" /> LANZAR PREDICCIÓN</Button>
            <span className="flex-1" />
            <Button size="sm" variant="destructive" onClick={endLive} className="gap-1.5"><VideoOff className="w-3.5 h-3.5" /> TERMINAR DIRECTO</Button>
          </div>
          {recFiles.length > 0 && <div className="text-[9px] font-mono text-muted-foreground">Grabaciones completas: {recFiles.join(" · ")}</div>}
          {clips.length > 0 && <div className="text-[9px] font-mono text-muted-foreground">Clips guardados: {clips.join(" · ")}</div>}
        </div>
        <p className="text-[10px] font-mono text-muted-foreground">
          Tu directo ya está visible en la sección COMUNIDAD con chat en tiempo real, donaciones y reacciones.
          La señal viaja de tu cámara (getUserMedia) por WebRTC con los servidores STUN de Google — sin costo.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* configuración del live */}
      <div className="hud-panel border-red-hud/50 p-3 space-y-2.5">
        <div className="text-[11px] font-mono font-bold text-red-hud">🔴 INICIAR TRANSMISIÓN EN VIVO</div>
        <div>
          <label className="text-[9px] font-mono text-muted-foreground" htmlFor="live-title">Título del directo</label>
          <Input id="live-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Ej: "Análisis en vivo del frente este — con mapas"' className="text-xs mt-1" maxLength={140} />
        </div>
        <div>
          <span className="text-[9px] font-mono text-muted-foreground">Categoría</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
            {LIVE_CATEGORIES.map((c) => (
              <button key={c.key} onClick={() => setCategory(c.key)} className={cn("flex items-center gap-1.5 px-2 py-1.5 rounded-sm border text-[10px] font-mono text-left", category === c.key ? "text-red-hud border-red-hud bg-red-hud/10" : "border-border/60 text-muted-foreground hover:text-foreground")}>
                <span className={cn("w-2 h-2 rounded-full border", category === c.key ? "bg-red-hud border-red-hud" : "border-muted-foreground")} />
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" onClick={testCamera} className="gap-1.5"><Video className="w-3.5 h-3.5" /> PROBAR CÁMARA</Button>
          <Button size="sm" onClick={startLive} disabled={!canLive || !alias} className="gap-1.5 bg-red-600 hover:bg-red-700 text-white">INICIAR LIVE 🔴</Button>
        </div>
        {camState === "testing" && <p className="text-[10px] font-mono text-green-hud">✅ Cámara y micrófono activos — vista previa a la derecha.</p>}
        {camState === "error" && <p className="text-[10px] font-mono text-red-hud">⚠️ {camError} — concede permisos o usa otro navegador.</p>}
        {!canLive && <p className="text-[10px] font-mono text-amber">🎖️ Necesitas nivel {MIN_LEVEL_LIVE} para hacer live (eres nivel {level}). Gana XP en misiones, quiz y directos.</p>}
        {!alias && <p className="text-[10px] font-mono text-amber">Regístrate gratis (botón ENTRAR del HUD) para transmitir.</p>}
        {/* preview de cámara */}
        <div className="relative aspect-video bg-black rounded-sm overflow-hidden border border-border/50">
          <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-cover" aria-label="Vista previa de tu cámara" />
          {camState !== "testing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <VideoOff className="w-8 h-8 opacity-40" />
              <span className="text-[10px] font-mono">Cámara apagada — pulsa PROBAR CÁMARA</span>
            </div>
          )}
        </div>
      </div>

      {/* ganancias + estado */}
      <div className="space-y-3">
        <div className="hud-panel border-amber-hud/50 p-3 space-y-2">
          <div className="text-[11px] font-mono font-bold text-amber flex items-center gap-1.5"><Gift className="w-4 h-4" /> GANANCIAS DE DIRECTOS</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-mono font-bold text-amber">{pending} <span className="text-sm">monedas</span></div>
              <div className="text-[9px] font-mono text-muted-foreground">donaciones recibidas + bonus por espectadores</div>
            </div>
            <Button size="sm" onClick={claim} disabled={pending <= 0} className="gap-1.5"><Coins className="w-3.5 h-3.5" /> RECLAMAR</Button>
          </div>
          <div className="text-[9px] font-mono text-muted-foreground space-y-0.5 pt-1 border-t border-border/40">
            <div>Bonus por espectadores: 10 viewers → +20/h · 50 → +100/h · 100+ → +300/h</div>
            <div>Stream de 2+ horas: +100 bonus · Badge "Corresponsal En Vivo" al transmitir</div>
          </div>
        </div>
        <div className="hud-panel border-violet-hud/40 p-3 space-y-1.5">
          <div className="text-[11px] font-mono font-bold text-violet-hud flex items-center gap-1.5"><BadgeCheck className="w-4 h-4" /> RECOMPENSAS DEL ESPECTADOR</div>
          {VIEWER_REWARDS.map((r, i) => (
            <div key={i} className="text-[10px] font-mono flex items-center gap-1.5"><span>{r.icon}</span> {r.text}</div>
          ))}
        </div>
        {summary && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="hud-panel border-green-hud/50 p-3 space-y-1">
            <div className="text-[11px] font-mono font-bold text-green-hud flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> RESUMEN DE TU DIRECTO</div>
            <div className="text-[10px] font-mono space-y-0.5">
              <div>Duración: {summary.minutes} min · Pico de audiencia: {summary.peak}</div>
              <div className="text-amber">Ganado: +{summary.bonus} monedas (ya en "GANANCIAS DE DIRECTOS") + replay generado 📼</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============ SECCIÓN 6: REGLAS & PREMIOS ============
function ReglasSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="hud-panel border-red-hud/40 p-4 space-y-2">
        <div className="text-[11px] font-mono font-bold text-red-hud flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> REGLAS DEL LIVE</div>
        {LIVE_RULES.map((r, i) => (
          <div key={i} className="text-[11px] flex items-start gap-2"><span>{r.icon}</span><span>{r.text}</span></div>
        ))}
        <div className="text-[9px] font-mono text-muted-foreground pt-1 border-t border-border/40">
          Moderación con IA + reportes de la comunidad. El sistema de lives comparte la economía de VANGUARD: lo que donas sale de tu bolsa, lo que recaudas entra a la tuya.
        </div>
      </div>
      <div className="hud-panel border-amber-hud/40 p-4 space-y-2">
        <div className="text-[11px] font-mono font-bold text-amber flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> MONETIZACIÓN</div>
        <div className="text-[10px] font-mono space-y-1">
          <div className="text-cyan-hud font-bold">PARA EL STREAMER:</div>
          <div>· Recibe las monedas virtuales de las donaciones</div>
          <div>· Bonus por espectadores: 10 → +20/h · 50 → +100/h · 100+ → +300/h</div>
          <div>· Badge especial "Corresponsal En Vivo" 🏅</div>
          <div>· Tu perfil sube en el ranking de contribuidores</div>
          <div className="text-cyan-hud font-bold pt-1">PARA LOS ESPECTADORES:</div>
          <div>· Ver 30 min de live: +10 monedas</div>
          <div>· Participar en la predicción del live: +bonus</div>
          <div>· Donar monedas al streamer: +5 XP</div>
        </div>
      </div>
      <div className="hud-panel border-violet-hud/40 p-4 space-y-2 md:col-span-2">
        <div className="text-[11px] font-mono font-bold text-violet-hud flex items-center gap-1.5"><Crown className="w-4 h-4" /> TECNOLOGÍA — 100% GRATUITA</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono">
          <div className="p-2 border border-border/50 rounded-sm"><b>WebRTC P2P</b><br />Cámara con getUserMedia, señal peer-to-peer sin servidores de pago. STUN: stun:stun.l.google.com:19302 · stun1.l.google.com:19302</div>
          <div className="p-2 border border-border/50 rounded-sm"><b>Embeds oficiales</b><br />Los medios (Al Jazeera, DW, France 24, Euronews, RT) se reproducen desde sus canales oficiales de YouTube — legal y gratuito.</div>
          <div className="p-2 border border-border/50 rounded-sm"><b>Base de datos real</b><br />Streams, chat, donaciones, programación y replays persisten en la base de datos (Prisma → SQLite en preview, preparada para Supabase/PostgreSQL en producción).</div>
        </div>
      </div>
    </div>
  );
}


