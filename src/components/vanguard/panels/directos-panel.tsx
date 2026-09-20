"use client";

// Vanguard v22.0 — DIRECTOS EN VIVO: plataforma de streaming de VANGUARD.
// Canales bot en vivo + TU PROPIO DIRECTO con audiencia simulada, chat en tiempo
// real, DONACIONES (monedas y gemas) con alertas animadas, metas de recaudación,
// ranking de streamers y récords persistentes. Todo client-side, integrado al
// sistema económico (addCoins/spendCoins/spendGems/addXp).

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import {
  Radio, Eye, Coins, Gem, Send, Crown, Gift, Users, TrendingUp,
  ArrowLeft, Zap, BellRing, Sparkles, MessageSquare, Trophy, CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";
import { useGameStore } from "@/lib/game-store";
import { useProfileStore } from "@/lib/profile-store";
import { Countryball, STICKER_CODES } from "@/components/vanguard/countryball";

// ============ DATOS ============
interface LiveChannel {
  id: string;
  name: string;
  code: string;        // countryball del streamer
  title: string;
  cat: string;
  baseViewers: number;
  fans: number;
  raised: number;      // total donado esta sesión (sube si TÚ donas)
}

const LIVE_CATS = ["COMBATE", "ANÁLISIS", "OSINT", "MEMES DE GUERRA", "DIPLOMACIA"];

const CHANNELS: LiveChannel[] = [
  { id: "ch1", name: "FrenteRuso_TV", code: "ru", title: "DIRECTO: avances en Donbás — mapas en vivo", cat: "COMBATE", baseViewers: 1840, fans: 32100, raised: 1240 },
  { id: "ch2", name: "CapitolWatch", code: "us", title: "Noche de votación en el Congreso — reacciones", cat: "ANÁLISIS", baseViewers: 1290, fans: 28400, raised: 890 },
  { id: "ch3", name: "IDFLive", code: "il", title: "Alerta de sirenas — cobertura en tiempo real", cat: "COMBATE", baseViewers: 2110, fans: 40100, raised: 1730 },
  { id: "ch4", name: "GazaHoy", code: "ps", title: "Reporte humanitario desde el terreno", cat: "DIPLOMACIA", baseViewers: 1560, fans: 27600, raised: 1105 },
  { id: "ch5", name: "TrollGeopolitik", code: "de", title: "MEMES de la OTAN vs los que disparan", cat: "MEMES DE GUERRA", baseViewers: 3240, fans: 88200, raised: 2210 },
  { id: "ch6", name: "DragonFiles", code: "cn", title: "¿Tensiones en el estrecho? Análisis nocturno", cat: "ANÁLISIS", baseViewers: 1980, fans: 45300, raised: 1420 },
  { id: "ch7", name: "BravoBrasil", code: "br", title: "OSINT: rastreo de movimientos navales", cat: "OSINT", baseViewers: 870, fans: 19800, raised: 640 },
  { id: "ch8", name: "DOPower", code: "do", title: "DIRECTO desde República Dominicana — Zona Caribe", cat: "ANÁLISIS", baseViewers: 640, fans: 12400, raised: 480 },
];

const CHAT_USERS = [
  { n: "Patriota82", c: "us" }, { n: "Volkov", c: "ru" }, { n: "DragónDelSur", c: "cn" },
  { n: "BaguetteWar", c: "fr" }, { n: "TeaAndIntel", c: "gb" }, { n: "Quimbaya", c: "co" },
  { n: "Cariño Tropical", c: "do" }, { n: "YukiSan", c: "jp" }, { n: "Carioca", c: "br" },
  { n: "Borscht", c: "ua" }, { n: "TacoIntel", c: "mx" }, { n: "ChaiWaala", c: "in" },
  { n: "SchnitzelOp", c: "de" }, { n: "MapleOps", c: "ca" }, { n: "KimchiWatch", c: "kr" },
  { n: "AussieRecon", c: "au" },
];

const CHAT_LINES = [
  "Primera vez en un directo, esto es otro nivel",
  "¿Alguien más vio ese movimiento en el mapa?",
  "Respeto total al streamer, saludos desde Latinoamérica",
  "Esto se está poniendo INTENSO",
  "Donando ahora mismo, sigue así",
  "No me lo pierdo por nada",
  "El mejor canal de VANGUARD sin duda",
  "¿Cuándo haces directo otra vez?",
  "F en el chat por la ciudad del sur",
  "Comparte el mapa por favor",
  "W en el chat",
  "Vengo del Estudio de Video, contenido brutal",
  "Mi país representa aquí presente",
  "GG a todos los que están viendo",
  "Esto debería estar en noticias",
  "El radar no miente, mirad el norte",
];

const DONOR_NAMES = [
  "Anónimo", "MegaFan", "ElBarón", "Xx_Sombra_xX", "Capitán_Observable", "LaBall", "Generoso41",
];

// niveles de donación (espectador → canal)
const TIERS = [
  { coins: 5, label: "CAFÉ", color: "text-cyan-hud border-cyan-hud" },
  { coins: 25, label: "APOYO", color: "text-amber border-amber-hud" },
  { coins: 100, label: "MEGADONACIÓN", color: "text-violet-hud border-violet-hud" },
];

const LS_KEY = "vanguard_directos_v1";
interface MyStreamRecord { peak: number; raised: number; durSec: number; streams: number; totalEarned: number; }

function loadRecords(): MyStreamRecord {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { peak: 0, raised: 0, durSec: 0, streams: 0, totalEarned: 0 };
}

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface ChatMsg { id: number; user: string; code: string; text: string; donor?: { coins: number; label: string }; }
interface Alert { id: number; donor: string; coins: number; label: string; toMe: boolean; }

// ============ COMPONENTE ============
export function DirectosPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const addGems = useGameStore((s) => s.addGems);
  const addXp = useGameStore((s) => s.addXp);
  const coins = useGameStore((s) => s.coins);
  const gems = useGameStore((s) => s.gems);
  const alias = useGameStore((s) => s.alias) || "OPERADOR";
  const cbAvatar = useProfileStore((s) => s.cbAvatar);

  const [view, setView] = useState<"grid" | "watch" | "mine">("grid");
  const [watching, setWatching] = useState<LiveChannel | null>(null);
  const [tick, setTick] = useState(0);
  const [channels, setChannels] = useState<LiveChannel[]>(CHANNELS);

  // chat compartido
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatId = useRef(0);
  const nextChatId = () => chatId.current++;

  // alertas de donación (animadas sobre el reproductor)
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const alertId = useRef(0);

  // MI DIRECTO
  const [minePhase, setMinePhase] = useState<"config" | "live" | "summary">("config");
  const [myTitle, setMyTitle] = useState("");
  const [myCat, setMyCat] = useState(LIVE_CATS[1]);
  const [myGoal, setMyGoal] = useState(500);
  const [myViewers, setMyViewers] = useState(2);
  const [myPeak, setMyPeak] = useState(2);
  const [myRaised, setMyRaised] = useState(0);
  const [myDonCount, setMyDonCount] = useState(0);
  const [mySecs, setMySecs] = useState(0);
  const [myEarned, setMyEarned] = useState(0);
  // récord cargado en init perezoso (sin setState en effect — react-hooks/set-state-in-effect)
  const [records, setRecords] = useState<MyStreamRecord>(() => loadRecords());

  // ===== ticker global (viewers fluctuando en la grid) =====
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(iv);
  }, []);

  const pushAlert = useCallback((donor: string, coinAmt: number, label: string, toMe: boolean) => {
    const a: Alert = { id: alertId.current++, donor, coins: coinAmt, label, toMe };
    setAlerts((prev) => [...prev.slice(-2), a]);
    setTimeout(() => setAlerts((prev) => prev.filter((x) => x.id !== a.id)), 4200);
  }, []);

  // ===== chat en vivo (activado en watch / mine) =====
  useEffect(() => {
    if (view === "grid") return;
    // semilla (async para no hacer setState síncrono en el effect)
    const t0 = setTimeout(() => {
      const seed: ChatMsg[] = [0, 1, 2].map((i) => {
        const u = CHAT_USERS[(Date.now() + i * 7) % CHAT_USERS.length];
        return { id: nextChatId(), user: u.n, code: u.c, text: CHAT_LINES[(i * 5) % CHAT_LINES.length] };
      });
      setChat(seed);
    }, 0);
    const iv = setInterval(() => {
      const u = CHAT_USERS[Math.floor(Math.random() * CHAT_USERS.length)];
      const isDonor = Math.random() < 0.14;
      const tier = TIERS[Math.floor(Math.random() * TIERS.length)];
      // FIX refs: id y mensaje se calculan FUERA del updater (los updaters deben ser puros)
      const msg: ChatMsg = isDonor
        ? { id: nextChatId(), user: u.n, code: u.c, text: `ha donado ${tier.coins} monedas — ¡GRACIAS!`, donor: { coins: tier.coins, label: tier.label } }
        : { id: nextChatId(), user: u.n, code: u.c, text: CHAT_LINES[Math.floor(Math.random() * CHAT_LINES.length)] };
      setChat((prev) => [...prev.slice(-38), msg]);
      // en MI directo las donaciones del chat ME pagan
      if (isDonor && view === "mine") {
        const donor = DONOR_NAMES[Math.floor(Math.random() * DONOR_NAMES.length)];
        const bonus = tier.coins >= 100 && Math.random() < 0.3 ? 1 : 0;
        addCoins(tier.coins, `Directo: donación de ${u.n}`);
        if (bonus > 0) addGems(bonus, "Directo: superchat 🚀".replace(" 🚀", ""));
        setMyRaised((r) => r + tier.coins);
        setMyEarned((e) => e + tier.coins);
        setMyDonCount((c) => c + 1);
        pushAlert(u.n, tier.coins, tier.label, true);
        if (tier.coins >= 100) sfx.levelUp(); else sfx.coin();
      }
    }, 2100 + Math.random() * 1400);
    return () => { clearTimeout(t0); clearInterval(iv); };
  }, [view, watching?.id]);

  // autoscroll del chat vive DENTRO de ChatBox (el ref ya no cruza props)

  // ===== reloj del MI DIRECTO + curva de audiencia =====
  useEffect(() => {
    if (view !== "mine" || minePhase !== "live") return;
    const clock = setInterval(() => setMySecs((s) => s + 1), 1000);
    const growth = setInterval(() => {
      setMyViewers((v) => {
        const next = Math.max(1, v + Math.round(v * 0.10 + Math.random() * 5 - (Math.random() < 0.2 ? 2 : 0)));
        setMyPeak((p) => Math.max(p, next));
        return next;
      });
    }, 2600);
    return () => { clearInterval(clock); clearInterval(growth); };
  }, [view, minePhase]);

  const viewersOf = useCallback((ch: LiveChannel, i: number) => {
    const wobble = Math.sin(tick / 2.4 + i * 1.7) * 0.09 + Math.sin(tick / 1.1 + i) * 0.03;
    return Math.max(12, Math.round(ch.baseViewers * (1 + wobble)));
  }, [tick]);

  // ===== acciones =====
  const openWatch = (ch: LiveChannel) => {
    setWatching(ch);
    setView("watch");
    sfx.hover();
  };

  const donate = (tierCoins: number, label: string) => {
    if (!watching) return;
    if (!spendCoins(tierCoins, `Donación en directo → ${watching.name}`)) {
      toast.error(`Necesitas ${tierCoins} monedas para donar`);
      return;
    }
    sfx.coin();
    pushAlert(alias, tierCoins, label, false);
    setChannels((prev) => prev.map((c) => c.id === watching.id ? { ...c, raised: c.raised + tierCoins, fans: c.fans + 1 } : c));
    setWatching((w) => w ? { ...w, raised: w.raised + tierCoins, fans: w.fans + 1 } : w);
    addXp(Math.max(2, Math.round(tierCoins / 5)));
    const donorMsg: ChatMsg = { id: nextChatId(), user: alias, code: cbAvatar, text: `ha donado ${tierCoins} monedas — ¡GRACIAS!`, donor: { coins: tierCoins, label } };
    setChat((prev) => [...prev.slice(-38), donorMsg]);
    toast.success(`Donaste ${tierCoins} monedas a ${watching.name}`, { description: `Nivel ${label} · +${Math.max(2, Math.round(tierCoins / 5))} XP de generosidad` });
  };

  const donateGem = () => {
    if (!watching) return;
    if (!useGameStore.getState().spendGems(1, `Superchat 💎 → ${watching.name}`.replace(" 💎", ""))) {
      toast.error("Necesitas 1 gema para el superchat");
      return;
    }
    sfx.levelUp();
    pushAlert(alias, 0, "SUPERCHAT 💎", false);
    const donorMsg: ChatMsg = { id: nextChatId(), user: alias, code: cbAvatar, text: "envió un SUPERCHAT con gema — ¡LEYENDA!", donor: { coins: 0, label: "SUPERCHAT" } };
    setChat((prev) => [...prev.slice(-38), donorMsg]);
    setChannels((prev) => prev.map((c) => c.id === watching.id ? { ...c, raised: c.raised + 250, fans: c.fans + 3 } : c));
    setWatching((w) => w ? { ...w, raised: w.raised + 250 } : w);
    addXp(8);
    toast.success("Superchat enviado — el streamer te vio", { description: "+8 XP · mensaje destacado en el chat" });
  };

  const sendChat = () => {
    const t = chatInput.trim();
    if (!t) return;
    const msg: ChatMsg = { id: nextChatId(), user: alias, code: cbAvatar, text: t };
    setChat((prev) => [...prev.slice(-38), msg]);
    setChatInput("");
  };

  const startMine = () => {
    const title = myTitle.trim() || "DIRECTO sin título desde VANGUARD";
    if (myGoal < 50) { toast.error("La meta mínima es de 50 monedas"); return; }
    sfx.alarm();
    setMinePhase("live");
    setMyViewers(2); setMyPeak(2); setMyRaised(0); setMyDonCount(0); setMySecs(0); setMyEarned(0);
    toast.success("ESTÁS EN DIRECTO", { description: title });
  };

  const finishMine = () => {
    const xp = Math.max(10, Math.round(mySecs / 20) + myDonCount * 3);
    addXp(xp);
    const prev = loadRecords();
    const next: MyStreamRecord = {
      peak: Math.max(prev.peak, myPeak),
      raised: Math.max(prev.raised, myRaised),
      durSec: Math.max(prev.durSec, mySecs),
      streams: prev.streams + 1,
      totalEarned: prev.totalEarned + myEarned,
    };
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
    setRecords(next);
    setMinePhase("summary");
    sfx.success();
    toast.success(`Directo finalizado · ${myPeak} espectadores pico`, { description: `+${myEarned} monedas donadas · +${xp} XP` });
  };

  // ===== RENDER =====
  return (
    <div className="space-y-3">
      <PanelHeader
        title="Directos En Vivo"
        subtitle="Streaming con donaciones · tus monedas mueven la escena"
        icon={<Radio className="w-4 h-4 text-red-hud blink-soft" />}
        color="red"
        right={
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-red-hud flex items-center gap-1"><CircleDot className="w-3 h-3" /> {channels.length} EN VIVO</span>
            <span className="text-amber flex items-center gap-0.5"><Coins className="w-3 h-3" /> {fmt(coins)}</span>
            <span className="text-violet-hud flex items-center gap-0.5"><Gem className="w-3 h-3" /> {fmt(gems)}</span>
          </div>
        }
      />

      <AnimatePresence mode="wait">
        {view === "grid" && (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {/* MI DIRECTO — banner de inicio */}
            <button
              onClick={() => { setView("mine"); setMinePhase("config"); sfx.hover(); }}
              className="w-full hud-corner border border-red-hud/60 bg-gradient-to-r from-red-hud/15 via-secondary/30 to-red-hud/15 p-4 text-left hover:border-red-hud transition-colors relative overflow-hidden group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Countryball code={cbAvatar} size={52} />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-hud blink-soft border border-background" />
                </div>
                <div className="flex-1">
                  <div className="font-mono font-black text-sm uppercase tracking-wider text-red-hud group-hover:text-red-hud/80">INICIAR MI DIRECTO</div>
                  <div className="text-[10px] font-mono text-muted-foreground mt-0.5">Título, categoría y meta — la audiencia llega sola y DONA a tu bolsa</div>
                </div>
                <TrendingUp className="w-6 h-6 text-amber" />
              </div>
              {records.streams > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 text-[9px] font-mono text-muted-foreground">
                  <span className="px-1.5 py-0.5 border border-border/60">Directos: {records.streams}</span>
                  <span className="px-1.5 py-0.5 border border-border/60">Pico récord: {records.peak}</span>
                  <span className="px-1.5 py-0.5 border border-border/60">Mejor recaudación: {records.raised} mon</span>
                  <span className="px-1.5 py-0.5 border border-amber-hud/60 text-amber">Total ganado: {fmt(records.totalEarned)} mon</span>
                </div>
              )}
            </button>

            {/* RANKING DE LA NOCHE */}
            <div className="hud-corner p-3 bg-secondary/30">
              <div className="text-[10px] font-mono text-amber uppercase tracking-widest mb-2 flex items-center gap-1"><Crown className="w-3 h-3" /> Ranking de streamers · donaciones de hoy</div>
              <div className="space-y-1">
                {[...channels].sort((a, b) => b.raised - a.raised).slice(0, 3).map((c, i) => (
                  <div key={c.id} className="flex items-center gap-2 text-[10px] font-mono">
                    <span className={cn("w-5 text-center font-bold", i === 0 ? "text-amber" : i === 1 ? "text-cyan-hud" : "text-muted-foreground")}>#{i + 1}</span>
                    <Countryball code={c.code} size={18} />
                    <span className="text-foreground flex-1 truncate">{c.name}</span>
                    <span className="text-green-hud">{fmt(c.raised)} mon</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GRID DE CANALES */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {channels.map((ch, i) => (
                <button key={ch.id} onClick={() => openWatch(ch)} className="hud-corner border border-border/60 bg-secondary/20 text-left hover:border-red-hud/70 transition-colors group">
                  <div className="relative aspect-video overflow-hidden scanline bg-gradient-to-br from-background via-secondary/40 to-background flex items-center justify-center">
                    <Countryball code={ch.code} size={56} className="group-hover:scale-110 transition-transform" />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-red-hud text-white text-[8px] font-mono font-bold blink-soft flex items-center gap-1"><Radio className="w-2.5 h-2.5" /> EN VIVO</span>
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 text-[8px] font-mono text-foreground flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> {fmt(viewersOf(ch, i))}</span>
                  </div>
                  <div className="p-2">
                    <div className="text-[11px] font-mono font-bold text-foreground truncate group-hover:text-red-hud">{ch.title}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-mono text-muted-foreground truncate">{ch.name}</span>
                      <span className="text-[8px] font-mono px-1 border border-border/60 text-muted-foreground uppercase">{ch.cat}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[9px] font-mono">
                      <span className="text-muted-foreground">{fmt(ch.fans)} fans</span>
                      <span className="text-green-hud flex items-center gap-0.5"><Gift className="w-2.5 h-2.5" /> {fmt(ch.raised)} mon</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {view === "watch" && watching && (
          <motion.div key="watch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <Button size="sm" variant="ghost" onClick={() => { setView("grid"); setWatching(null); }} className="h-7 text-[10px] font-mono">
              <ArrowLeft className="w-3 h-3 mr-1" /> VOLVER A CANALES
            </Button>
            <StreamStage
              channelCode={watching.code}
              title={watching.title}
              cat={watching.cat}
              viewers={viewersOf(watching, 0)}
              raised={watching.raised}
              fans={watching.fans}
              isMine={false}
              alerts={alerts}
            />
            <div className="grid lg:grid-cols-[1fr_300px] gap-3">
              {/* panel de donación */}
              <div className="hud-corner p-3 bg-secondary/30 space-y-2">
                <div className="text-[10px] font-mono text-amber uppercase tracking-widest flex items-center gap-1"><Gift className="w-3 h-3" /> Apoya este directo</div>
                <div className="grid grid-cols-3 gap-2">
                  {TIERS.map((t) => (
                    <button key={t.label} onClick={() => donate(t.coins, t.label)}
                      className={cn("hud-corner border p-3 text-center hover:bg-secondary/60 transition-colors", t.color)}>
                      <div className="font-mono font-black text-base">{t.coins}</div>
                      <div className="font-mono text-[8px] uppercase tracking-wider mt-0.5 flex items-center justify-center gap-0.5"><Coins className="w-2.5 h-2.5" /> {t.label}</div>
                    </button>
                  ))}
                </div>
                <button onClick={donateGem} className="w-full hud-corner border border-violet-hud p-2.5 text-center hover:bg-violet-hud/10 transition-colors">
                  <span className="font-mono text-[10px] font-bold text-violet-hud flex items-center justify-center gap-1"><Sparkles className="w-3 h-3" /> SUPERCHAT con 1 GEMA (+250 al canal, mensaje destacado)</span>
                </button>
                <div className="text-[9px] font-mono text-muted-foreground">Donar gasta tu saldo real del bóveda — el XP de generosidad es automático.</div>
              </div>
              {/* chat */}
              <ChatBox
                chat={chat}
                chatInput={chatInput}
                setChatInput={setChatInput}
                sendChat={sendChat}
                viewerCount={viewersOf(watching, 0)}
              />
            </div>
          </motion.div>
        )}

        {view === "mine" && (
          <motion.div key="mine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {minePhase === "config" && (
              <MineConfig
                myTitle={myTitle} setMyTitle={setMyTitle}
                myCat={myCat} setMyCat={setMyCat}
                myGoal={myGoal} setMyGoal={setMyGoal}
                cbAvatar={cbAvatar} alias={alias}
                onStart={startMine} onCancel={() => setView("grid")}
              />
            )}
            {minePhase === "live" && (
              <div className="space-y-3">
                <StreamStage
                  channelCode={cbAvatar}
                  title={myTitle.trim() || "DIRECTO sin título desde VANGUARD"}
                  cat={myCat}
                  viewers={myViewers}
                  raised={myRaised}
                  goal={myGoal}
                  elapsed={mySecs}
                  isMine
                  alerts={alerts}
                  onFinish={finishMine}
                />
                <div className="grid lg:grid-cols-[1fr_300px] gap-3">
                  <div className="hud-corner p-3 bg-secondary/30">
                    <div className="text-[10px] font-mono text-amber uppercase tracking-widest mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> Telemetría de la sala</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <MineStat label="Duración" value={fmtTime(mySecs)} color="text-cyan-hud" />
                      <MineStat label="Espectadores" value={fmt(myViewers)} color="text-red-hud" />
                      <MineStat label="Pico" value={fmt(myPeak)} color="text-amber" />
                      <MineStat label="Donaciones" value={`${myDonCount}`} color="text-green-hud" />
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-[9px] font-mono text-muted-foreground mb-1">
                        <span>Meta de recaudación</span>
                        <span className={cn(myRaised >= myGoal && "text-green-hud font-bold")}>{fmt(myRaised)} / {fmt(myGoal)} mon {myRaised >= myGoal && "· ¡META CUMPLIDA!"}</span>
                      </div>
                      <div className="h-2.5 bg-secondary overflow-hidden border border-border">
                        <div className={cn("h-full vg-transition", myRaised >= myGoal ? "bg-green-hud" : "bg-amber")} style={{ width: `${Math.min(100, (myRaised / myGoal) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  <ChatBox
                    chat={chat}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    sendChat={sendChat}
                    viewerCount={myViewers}
                  />
                </div>
              </div>
            )}
            {minePhase === "summary" && (
              <MineSummary
                secs={mySecs} peak={myPeak} raised={myRaised} donCount={myDonCount}
                earned={myEarned} xp={Math.max(10, Math.round(mySecs / 20) + myDonCount * 3)}
                isRecord={myPeak >= records.peak}
                onAgain={() => setMinePhase("config")}
                onHome={() => setView("grid")}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ SUBCOMPONENTES ============

function MineStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="hud-corner p-2 bg-secondary/40">
      <div className="text-[9px] font-mono text-muted-foreground uppercase">{label}</div>
      <div className={cn("text-base font-mono font-bold tabular-nums", color)}>{value}</div>
    </div>
  );
}

// escenario del reproductor (bot o el mío) con alertas de donación animadas
function StreamStage(props: {
  channelCode: string; title: string; cat: string; viewers: number;
  raised: number; fans?: number; goal?: number; elapsed?: number;
  isMine: boolean; alerts: Alert[]; onFinish?: () => void;
}) {
  return (
    <div className="hud-corner border border-red-hud/40 overflow-hidden relative">
      <div className="relative aspect-video scanline bg-gradient-to-br from-background via-secondary/40 to-background flex items-center justify-center overflow-hidden">
        {/* ondas de emisión */}
        <div className="absolute w-40 h-40 rounded-full border border-red-hud/20 animate-ping" />
        <div className="absolute w-56 h-56 rounded-full border border-red-hud/10 animate-ping" style={{ animationDelay: "0.6s" }} />
        <Countryball code={props.channelCode} size={92} />
        <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-hud text-white text-[9px] font-mono font-bold blink-soft flex items-center gap-1">
          <Radio className="w-3 h-3" /> {props.isMine ? "TU DIRECTO" : "EN VIVO"}
        </span>
        {props.isMine && props.elapsed !== undefined && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 text-[9px] font-mono text-red-hud font-bold tabular-nums">REC {fmtTime(props.elapsed)}</span>
        )}
        {!props.isMine && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-[9px] font-mono text-foreground flex items-center gap-1"><Eye className="w-3 h-3" /> {fmt(props.viewers)} viendo</span>
        )}
        {/* alertas de donación */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-3 space-y-1.5 pointer-events-none z-20">
          <AnimatePresence>
            {props.alerts.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: -18, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "px-3 py-2 border-2 text-center font-mono shadow-lg",
                  a.coins >= 100 || a.label.includes("GEMA") || a.label.includes("SUPERCHAT")
                    ? "bg-violet-hud/90 border-violet-hud text-white"
                    : a.coins >= 25 ? "bg-amber-hud/90 border-amber-hud text-background" : "bg-cyan-hud/90 border-cyan-hud text-background"
                )}
              >
                <div className="text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1">
                  <BellRing className="w-3 h-3" /> {a.label}
                </div>
                <div className="text-[9px] font-bold">{a.donor} {a.toMe ? "te donó" : "donó"} {a.coins > 0 ? `${a.coins} monedas` : "una gema"}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      {/* barra inferior */}
      <div className="p-3 bg-secondary/30 border-t border-border/60 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono font-bold text-foreground truncate">{props.title}</div>
          <div className="flex items-center gap-2 mt-0.5 text-[9px] font-mono text-muted-foreground flex-wrap">
            <span className="px-1 border border-border/60 uppercase">{props.cat}</span>
            <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {fmt(props.viewers)}</span>
            {props.fans !== undefined && <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" /> {fmt(props.fans)} fans</span>}
            <span className="text-green-hud flex items-center gap-0.5"><Gift className="w-2.5 h-2.5" /> {fmt(props.raised)} mon recaudadas</span>
          </div>
        </div>
        {props.isMine && props.onFinish && (
          <Button size="sm" onClick={props.onFinish} className="bg-red-hud/30 border border-red-hud text-red-hud hover:bg-red-hud/50 font-mono uppercase text-[10px] h-8">
            <CircleDot className="w-3 h-3 mr-1" /> FINALIZAR DIRECTO
          </Button>
        )}
      </div>
      {props.isMine && props.goal !== undefined && (
        <div className="px-3 pb-2 bg-secondary/30">
          <div className="h-1.5 bg-secondary overflow-hidden border border-border/60">
            <div className={cn("h-full vg-transition", props.raised >= props.goal ? "bg-green-hud" : "bg-amber")} style={{ width: `${Math.min(100, (props.raised / props.goal) * 100)}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

function ChatBox(props: {
  chat: ChatMsg[]; chatInput: string; setChatInput: (v: string) => void;
  sendChat: () => void; viewerCount: number;
}) {
  // ref interno: autoscroll sin cruzar refs por props (react-hooks/refs)
  const boxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [props.chat]);
  return (
    <div className="hud-corner border border-border/60 bg-secondary/20 flex flex-col h-[360px] lg:h-auto">
      <div className="px-2.5 py-1.5 border-b border-border/60 flex items-center justify-between">
        <span className="text-[10px] font-mono text-amber uppercase tracking-widest flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Chat en vivo</span>
        <span className="text-[9px] font-mono text-red-hud flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> {fmt(props.viewerCount)}</span>
      </div>
      <div ref={boxRef} className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
        {props.chat.map((m) => (
          <div key={m.id} className={cn("flex items-start gap-1.5 text-[10px] font-mono", m.donor && "bg-amber-hud/10 border border-amber-hud/40 px-1.5 py-1")}>
            <Countryball code={m.code} size={16} className="mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <span className={cn("font-bold mr-1", m.donor ? "text-amber" : "text-cyan-hud")}>{m.user}</span>
              <span className={cn("break-words", m.donor ? "text-amber/90" : "text-foreground/85")}>{m.text}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-border/60 flex gap-1.5">
        <Input
          value={props.chatInput}
          onChange={(e) => props.setChatInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") props.sendChat(); }}
          placeholder="Escribe al chat..."
          className="h-8 text-[11px] font-mono"
        />
        <Button size="sm" onClick={props.sendChat} className="h-8 px-2.5 bg-red-hud/30 border border-red-hud text-red-hud hover:bg-red-hud/50">
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function MineConfig(props: {
  myTitle: string; setMyTitle: (v: string) => void;
  myCat: string; setMyCat: (v: string) => void;
  myGoal: number; setMyGoal: (v: number) => void;
  cbAvatar: string; alias: string;
  onStart: () => void; onCancel: () => void;
}) {
  return (
    <div className="hud-corner p-4 bg-secondary/30 space-y-3">
      <div className="flex items-center gap-3">
        <Countryball code={props.cbAvatar} size={44} />
        <div>
          <div className="font-mono font-bold text-sm text-foreground">{props.alias}</div>
          <div className="text-[9px] font-mono text-muted-foreground">Tu canal emite en segundos — los fans te siguen desde el perfil</div>
        </div>
      </div>
      <div>
        <label className="text-[10px] font-mono text-muted-foreground uppercase">Título del directo</label>
        <Input value={props.myTitle} onChange={(e) => props.setMyTitle(e.target.value)} maxLength={80}
          placeholder="Ej: ANALIZANDO EL FRENTE EN VIVO + sorteo de monedas" className="mt-1 text-xs font-mono" />
      </div>
      <div>
        <label className="text-[10px] font-mono text-muted-foreground uppercase">Categoría</label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {LIVE_CATS.map((c) => (
            <button key={c} onClick={() => props.setMyCat(c)}
              className={cn("px-2 py-1 text-[9px] font-mono border transition-colors",
                props.myCat === c ? "border-red-hud bg-red-hud/20 text-red-hud" : "border-border/60 text-muted-foreground hover:border-red-hud/40")}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[10px] font-mono text-muted-foreground uppercase">Meta de donaciones (monedas)</label>
        <Input type="number" min={50} step={50} value={props.myGoal} onChange={(e) => props.setMyGoal(Math.max(50, parseInt(e.target.value) || 50))} className="mt-1 text-xs font-mono w-40" />
      </div>
      <div className="hud-corner p-2.5 bg-background/60 text-[9px] font-mono text-muted-foreground space-y-0.5">
        <div>· La audiencia crece sola: cada espectador puede DONAR a tu bolsa en tiempo real.</div>
        <div>· Las donaciones entran directo a tu bóveda + XP al finalizar el directo.</div>
        <div>· Los superchats con gema son raros pero pagan bien tu reputación.</div>
      </div>
      <div className="flex gap-2">
        <Button onClick={props.onStart} className="bg-red-hud/30 border border-red-hud text-red-hud hover:bg-red-hud/50 font-mono uppercase text-xs">
          <Radio className="w-3.5 h-3.5 mr-1" /> EMITIR AHORA
        </Button>
        <Button variant="ghost" onClick={props.onCancel} className="font-mono text-xs">CANCELAR</Button>
      </div>
    </div>
  );
}

function MineSummary(props: {
  secs: number; peak: number; raised: number; donCount: number; earned: number; xp: number;
  isRecord: boolean; onAgain: () => void; onHome: () => void;
}) {
  return (
    <div className="hud-corner p-6 text-center bg-secondary/30">
      <Trophy className="w-12 h-12 mx-auto text-amber mb-2" />
      <div className="font-display text-xl font-black tracking-widest text-amber">DIRECTO FINALIZADO</div>
      {props.isRecord && props.peak > 0 && (
        <div className="text-[10px] font-mono text-green-hud font-bold mt-1 flex items-center justify-center gap-1"><Crown className="w-3 h-3" /> NUEVO RÉCORD DE AUDIENCIA</div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-xl mx-auto mt-4">
        <MineStat label="Duración" value={fmtTime(props.secs)} color="text-cyan-hud" />
        <MineStat label="Pico" value={fmt(props.peak)} color="text-red-hud" />
        <MineStat label="Donaciones" value={String(props.donCount)} color="text-amber" />
        <MineStat label="Ganado" value={`+${fmt(props.earned)}`} color="text-green-hud" />
        <MineStat label="XP" value={`+${props.xp}`} color="text-violet-hud" />
      </div>
      <p className="text-[10px] font-mono text-muted-foreground mt-3 max-w-md mx-auto">
        Las monedas donadas ya están en tu bóveda. Los récords se guardan en tu canal — súbelos con más directos.
      </p>
      <div className="flex gap-2 justify-center mt-4">
        <Button size="sm" variant="outline" onClick={props.onAgain} className="font-mono text-[10px]">
          <Radio className="w-3 h-3 mr-1" /> OTRO DIRECTO
        </Button>
        <Button size="sm" variant="ghost" onClick={props.onHome} className="font-mono text-[10px]">VER CANALES</Button>
      </div>
    </div>
  );
}
