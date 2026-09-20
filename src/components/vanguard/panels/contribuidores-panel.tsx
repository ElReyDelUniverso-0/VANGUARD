"use client";

// Vanguard v23 — COMUNIDAD DE CONTRIBUIDORES: gana monedas construyendo la web.
// 7 TRABAJOS: reportero ciudadano, escritor de fichas, verificador de noticias,
// traductor, moderador, analista de conflictos y creador de predicciones.
// Incluye: verificación comunitaria con votos (5 usuarios, 70% decide), rangos con
// badges (Novato → Pillar), tabla de recompensas, top del mes, hall de la fama,
// estadísticas globales, contribuidor del mes, notificaciones y PANEL ADMIN con
// cola de aprobación + anti-spam. Base de datos real (Prisma → Supabase-ready).

import { useCallback, useEffect, useMemo, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import {
  Radio, FileText, Search, Languages, ShieldCheck, BarChart3, Target,
  Trophy, Bell, Settings2, Send, Check, X, Coins, Medal, Crown, Users,
  Flame, AlertTriangle, Plus, Inbox, Star, GraduationCap,
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
  CONTRIB_REWARDS, RANKS, rankOf, MOD_REWARD, VERIFY_REWARD, VERIFY_DUDA_REWARD, VERIFY_NOSE_REWARD,
} from "@/lib/rewards";

// ============ TIPOS ============
interface ContributionRow {
  id: string; type: string; title: string; content: string; author: string; country: string;
  status: string; eventType: string; location: string; sourceUrl: string; countries: string;
  startDate: string; cause: string; originalText: string; targetLang: string; options: string;
  resolveDate: string; analysisType: string; likes: number; views: number; rewardCoins: number;
  reviewedBy: string; rejectReason: string; bonus: number; createdAt: string;
  votes?: { verdict: string; voter: string }[];
}
interface NewsRow { id: string; headline: string; source: string; publishedAt: string; resolved: boolean; truth: string; votes: { verdict: string }[]; }
interface ProfileRow {
  alias: string; country: string; approved: number; rejected: number; pending: number;
  coinsEarned: number; verifHits: number; verifTotal: number; streamMinutes: number;
  streamEarnings: number; badges: string;
}
interface LeaderboardData {
  topMonth: { author: string; count: number }[];
  hallOfFame: ProfileRow[];
  stats: { fichas: number; noticiasVerificadas: number; analisis: number; horasStream: number; totalContribuciones: number };
  contribOfMonth: (ProfileRow & { count: number }) | null;
  me: ProfileRow & { rank: ReturnType<typeof rankOf> };
  typeCounts: { type: string; status: string; _count: { _all: number } }[];
}
interface NotifRow { id: string; title: string; body: string; icon: string; read: boolean; createdAt: string; }

const ADMIN_KEY = "VANGUARD-2026"; // demo: en producción vive en .env + NextAuth

const JOB_TYPES = [
  { k: "reporte", icon: <Radio className="w-3.5 h-3.5" />, label: "REPORTERO" },
  { k: "ficha", icon: <FileText className="w-3.5 h-3.5" />, label: "FICHAS" },
  { k: "verificar", icon: <Search className="w-3.5 h-3.5" />, label: "VERIFICADOR" },
  { k: "traduccion", icon: <Languages className="w-3.5 h-3.5" />, label: "TRADUCTOR" },
  { k: "moderar", icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "MODERADOR" },
  { k: "analisis", icon: <BarChart3 className="w-3.5 h-3.5" />, label: "ANALISTA" },
  { k: "prediccion", icon: <Target className="w-3.5 h-3.5" />, label: "PREDICCIONES" },
] as const;

const REPORT_EVENT_TYPES = [
  { k: "conflicto", l: "⚔️ Conflicto armado" },
  { k: "protesta", l: "📣 Protesta masiva" },
  { k: "crisis", l: "🏛️ Crisis política" },
  { k: "desastre", l: "🌪️ Desastre natural" },
  { k: "militar", l: "🪖 Movimiento militar" },
];

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (!Number.isFinite(d)) return "";
  const min = Math.max(1, Math.round((Date.now() - d) / 60000));
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} d`;
}

// ============ COMPONENTE PRINCIPAL ============
export function ContribuidoresPanel() {
  const alias = useGameStore((s) => s.alias);
  const cbAvatar = useProfileStore((s) => s.cbAvatar);
  const [tab, setTab] = useState<"trabajos" | "misenvios" | "ranking" | "rangos" | "alertas" | "admin">("trabajos");
  const [job, setJob] = useState<(typeof JOB_TYPES)[number]["k"]>("reporte");
  const [board, setBoard] = useState<LeaderboardData | null>(null);
  const [notifs, setNotifs] = useState<NotifRow[]>([]);
  const [unread, setUnread] = useState(0);

  const me = alias || "Anónimo";

  const loadBoard = useCallback(() => {
    fetch(`/api/contrib/leaderboard?alias=${encodeURIComponent(me)}`)
      .then((r) => r.json())
      .then((d) => setBoard(d))
      .catch(() => {});
  }, [me]);

  const loadNotifs = useCallback(() => {
    fetch(`/api/notifications?alias=${encodeURIComponent(me)}`)
      .then((r) => r.json())
      .then((d) => { setNotifs(d.items ?? []); setUnread(d.unread ?? 0); })
      .catch(() => {});
  }, [me]);

  useEffect(() => {
    loadBoard();
    loadNotifs();
    const t = setInterval(loadNotifs, 15000);
    return () => clearInterval(t);
  }, [loadBoard, loadNotifs]);

  const rank = board?.me.rank ?? rankOf(0);

  return (
    <div className="space-y-4" id="contribuidores">
      <PanelHeader
        title="COMUNIDAD DE CONTRIBUIDORES"
        subtitle="Construye VANGUARD y gana monedas — 7 trabajos disponibles"
        icon={<Users className="w-4 h-4" />}
        color="green"
        right={
          <button onClick={() => setTab("alertas")} className="relative p-2 border border-amber-hud/40 rounded-sm hover:bg-amber-hud/10" aria-label="Notificaciones de contribuidor">
            <Bell className="w-4 h-4 text-amber" />
            {unread > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 bg-red-600 text-white text-[9px] font-mono rounded-full flex items-center justify-center">{unread}</span>}
          </button>
        }
      />

      {/* mi tarjeta de rango */}
      {board && (
        <div className="hud-panel border-green-hud/40 p-3 flex flex-wrap items-center gap-3">
          <Countryball code={cbAvatar || "us"} size={40} />
          <div className="min-w-[160px]">
            <div className="text-xs font-bold font-mono">{me}</div>
            <div className={cn("text-[10px] font-mono font-bold flex items-center gap-1", rank.current?.color ?? "text-muted-foreground")}>
              {rank.current ? <>{rank.current.badge} {rank.current.name}</> : "SIN RANGO — 5 aprobadas para Novato"}
            </div>
          </div>
          <div className="flex-1 min-w-[180px]">
            <div className="flex justify-between text-[9px] font-mono text-muted-foreground mb-1">
              <span>{board.me.approved} aprobadas</span>
              {rank.next && <span>siguiente: {rank.next.badge} {rank.next.name} ({rank.next.min})</span>}
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-green-hud/70 transition-all" style={{ width: `${Math.round(rank.progress * 100)}%` }} />
            </div>
          </div>
          <div className="text-right text-[10px] font-mono">
            <div className="text-amber font-bold flex items-center gap-1 justify-end"><Coins className="w-3.5 h-3.5" /> {board.me.coinsEarned} ganadas</div>
            <div className="text-muted-foreground">{board.me.pending} en revisión · {board.me.rejected} rechazadas</div>
            {board.me.badges.includes("elite") && <div className="text-amber">🏅 FACT-CHECKER ELITE (voto x2)</div>}
            {board.me.badges.includes("reportero10") && <div className="text-cyan-hud">🏅 REPORTERO VERIFICADO</div>}
          </div>
        </div>
      )}

      {/* tabs */}
      <div className="flex gap-1 overflow-x-auto thin-scroll pb-1" style={{ scrollbarWidth: "none" }}>
        {([
          { k: "trabajos", l: "🏭 TRABAJOS" },
          { k: "misenvios", l: "📤 MIS ENVÍOS" },
          { k: "ranking", l: "🏆 RANKING" },
          { k: "rangos", l: "🎖️ RANGOS & RECOMPENSAS" },
          { k: "alertas", l: `🔔 ALERTAS${unread ? ` (${unread})` : ""}` },
          { k: "admin", l: "⚙️ ADMIN" },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={cn(
              "px-2.5 py-1.5 rounded-sm font-mono text-[10px] font-bold tracking-wide whitespace-nowrap border transition-colors",
              tab === t.k ? "text-green-hud border-green-hud bg-green-hud/20" : "border-border/60 text-muted-foreground hover:text-foreground hover:border-green-hud/40"
            )}
          >
            {t.l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {tab === "trabajos" && (
            <div className="space-y-3">
              <div className="flex gap-1 overflow-x-auto thin-scroll pb-1" style={{ scrollbarWidth: "none" }}>
                {JOB_TYPES.map((j) => (
                  <button key={j.k} onClick={() => setJob(j.k)} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm font-mono text-[10px] font-bold whitespace-nowrap border transition-colors", job === j.k ? "text-amber border-amber-hud bg-amber-hud/20" : "border-border/60 text-muted-foreground hover:text-foreground")}>
                    {j.icon} {j.label}
                    <span className="text-[8px] text-green-hud">+{CONTRIB_REWARDS[j.k === "verificar" || j.k === "moderar" ? "reporte" : j.k]?.coins ?? 50}</span>
                  </button>
                ))}
              </div>
              {job === "reporte" && <JobReportero alias={me} cbAvatar={cbAvatar} onSent={loadBoard} />}
              {job === "ficha" && <JobFichas alias={me} cbAvatar={cbAvatar} onSent={loadBoard} />}
              {job === "verificar" && <JobVerificador alias={me} onVoted={loadBoard} />}
              {job === "traduccion" && <JobTraductor alias={me} cbAvatar={cbAvatar} onSent={loadBoard} />}
              {job === "moderar" && <JobModerador alias={me} onModerated={loadBoard} />}
              {job === "analisis" && <JobAnalista alias={me} cbAvatar={cbAvatar} onSent={loadBoard} />}
              {job === "prediccion" && <JobPredicciones alias={me} cbAvatar={cbAvatar} onSent={loadBoard} />}
            </div>
          )}
          {tab === "misenvios" && <MisEnvios alias={me} />}
          {tab === "ranking" && board && <RankingTab board={board} />}
          {tab === "rangos" && <RangosTab />}
          {tab === "alertas" && <AlertasTab notifs={notifs} alias={me} onRead={loadNotifs} />}
          {tab === "admin" && <AdminTab alias={me} onAction={loadBoard} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============ TRABAJO 1: REPORTERO CIUDADANO ============
function JobReportero({ alias, cbAvatar, onSent }: { alias: string; cbAvatar: string; onSent: () => void }) {
  const [what, setWhat] = useState("");
  const [eventType, setEventType] = useState("conflicto");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("");
  const [queue, setQueue] = useState<ContributionRow[]>([]);

  const loadQueue = useCallback(() => {
    fetch("/api/contrib?type=reporte&status=pendiente&take=8")
      .then((r) => r.json())
      .then((d) => setQueue(d.items ?? []))
      .catch(() => {});
  }, []);
  useEffect(() => { loadQueue(); }, [loadQueue]);

  const submit = () => {
    if (!what.trim()) { toast.error("Describe qué está pasando"); return; }
    fetch("/api/contrib", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "reporte", title: what.slice(0, 100), content: what, author: alias, country: cbAvatar || "us", eventType, location, sourceUrl: source }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { toast.error(d.error); return; }
        toast.success("📡 Reporte enviado a verificación — 5 usuarios confirmarán si es real (+50 monedas si aprueba)");
        setWhat(""); setLocation(""); setSource("");
        loadQueue(); onSent();
      })
      .catch(() => {});
  };

  const vote = (id: string, verdict: "confirmo" | "niego") => {
    fetch(`/api/contrib/${id}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ voter: alias, verdict }) })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { toast.error(d.error); return; }
        toast.success(verdict === "confirmo" ? "✅ Voto registrado: CONFIRMO" : "❌ Voto registrado: NIEGO");
        loadQueue();
      })
      .catch(() => {});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="hud-panel border-amber-hud/40 p-3 space-y-2.5">
        <div className="text-[11px] font-mono font-bold text-amber">📡 REPORTAR EVENTO</div>
        <div>
          <label className="text-[9px] font-mono text-muted-foreground" htmlFor="rep-what">¿Qué está pasando?</label>
          <textarea id="rep-what" value={what} onChange={(e) => setWhat(e.target.value)} placeholder="Describe el evento con el máximo detalle…" className="w-full mt-1 bg-transparent border border-border/60 rounded-sm p-2 text-xs min-h-20" maxLength={2000} />
        </div>
        <div>
          <label className="text-[9px] font-mono text-muted-foreground" htmlFor="rep-loc">Ubicación (ej: Frente Norte, puerto, capital…)</label>
          <Input id="rep-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Buscar en mapa…" className="text-xs mt-1" maxLength={80} />
        </div>
        <div>
          <span className="text-[9px] font-mono text-muted-foreground">Tipo de evento</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {REPORT_EVENT_TYPES.map((t) => (
              <button key={t.k} onClick={() => setEventType(t.k)} className={cn("px-2 py-1 rounded-sm border text-[10px] font-mono", eventType === t.k ? "text-amber border-amber-hud bg-amber-hud/20" : "border-border/60 text-muted-foreground")}>{t.l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[9px] font-mono text-muted-foreground" htmlFor="rep-src">Fuente (link a noticia)</label>
          <Input id="rep-src" value={source} onChange={(e) => setSource(e.target.value)} placeholder="https://…" className="text-xs mt-1" maxLength={300} />
        </div>
        <Button size="sm" onClick={submit} className="w-full gap-1.5 bg-green-700 hover:bg-green-800 text-white"><Send className="w-3.5 h-3.5" /> ENVIAR REPORTE → +50 monedas si se verifica</Button>
        <p className="text-[9px] font-mono text-muted-foreground">
          Verificación: 5 usuarios confirman si es real · ✅ Real: aparece en el mapa (+50, +5 por confirmo extra) · ❌ Falso: −20 monedas · 10 aprobados: badge "Reportero Verificado".
        </p>
      </div>
      <div className="hud-panel border-cyan-hud/40 p-3 space-y-2">
        <div className="text-[11px] font-mono font-bold text-cyan-hud">🗳️ REPORTES EN VERIFICACIÓN — TU VOTO CUENTA</div>
        {queue.map((r) => {
          const confirm = r.votes?.filter((v) => v.verdict === "confirmo").length ?? 0;
          const deny = r.votes?.filter((v) => v.verdict === "niego").length ?? 0;
          return (
            <div key={r.id} className="p-2 border border-border/50 rounded-sm space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[11px] font-bold leading-tight">{r.title}</div>
                <Countryball code={r.country} size={16} angry={false} />
              </div>
              <div className="text-[9px] font-mono text-muted-foreground">{r.location || "—"} · por {r.author} · {timeAgo(r.createdAt)}</div>
              {r.content && <p className="text-[10px] text-foreground/80 line-clamp-2">{r.content}</p>}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[9px] font-mono text-green-hud">✅ {confirm}/5</span>
                <span className="text-[9px] font-mono text-red-hud">❌ {deny}/5</span>
                <span className="flex-1" />
                <Button size="sm" variant="outline" onClick={() => vote(r.id, "confirmo")} className="h-6 px-2 text-[9px] text-green-hud border-green-hud/50">CONFIRMO</Button>
                <Button size="sm" variant="outline" onClick={() => vote(r.id, "niego")} className="h-6 px-2 text-[9px] text-red-hud border-red-hud/50">NIEGO</Button>
              </div>
            </div>
          );
        })}
        {queue.length === 0 && <div className="text-[10px] font-mono text-muted-foreground text-center py-4">No hay reportes pendientes de verificación.</div>}
      </div>
    </div>
  );
}

// ============ TRABAJO 2: ESCRITOR DE FICHAS ============
function JobFichas({ alias, cbAvatar, onSent }: { alias: string; cbAvatar: string; onSent: () => void }) {
  const [name, setName] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [cause, setCause] = useState("");
  const [summary, setSummary] = useState("");
  const [sources, setSources] = useState("");
  const [picker, setPicker] = useState("");
  const words = summary.trim() ? summary.trim().split(/\s+/).length : 0;

  const submit = () => {
    if (!name.trim() || !cause.trim() || words < 200) {
      toast.error(words < 200 ? `El resumen necesita 200 palabras mínimo (llevas ${words})` : "Completa nombre y causa");
      return;
    }
    fetch("/api/contrib", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "ficha", title: name, content: summary, author: alias, country: cbAvatar || "us", countries: countries.join(","), startDate, cause, sourceUrl: sources }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { toast.error(d.error); return; }
        toast.success("📝 Ficha enviada a revisión — 3 usuarios nivel 5+ la revisarán (+100 monedas si se aprueba)");
        setName(""); setCountries([]); setStartDate(""); setCause(""); setSummary(""); setSources("");
        onSent();
      })
      .catch(() => {});
  };

  const addCountry = () => {
    const code = picker.trim().toLowerCase().slice(0, 2);
    if (/^[a-z]{2}$/.test(code) && !countries.includes(code)) setCountries((c) => [...c, code]);
    setPicker("");
  };

  return (
    <div className="hud-panel border-amber-hud/40 p-3 space-y-2.5 max-w-3xl">
      <div className="text-[11px] font-mono font-bold text-amber">📝 CREAR FICHA DE CONFLICTO</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-mono text-muted-foreground" htmlFor="fich-name">Nombre del conflicto</label>
          <Input id="fich-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Conflicto del Congo Oriental" className="text-xs mt-1" maxLength={120} />
        </div>
        <div>
          <label className="text-[9px] font-mono text-muted-foreground" htmlFor="fich-date">Fecha de inicio</label>
          <Input id="fich-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="__/__/____ o jun 2024" className="text-xs mt-1" maxLength={20} />
        </div>
      </div>
      <div>
        <span className="text-[9px] font-mono text-muted-foreground">Países involucrados</span>
        <div className="flex items-center gap-1.5 mt-1">
          <Input value={picker} onChange={(e) => setPicker(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCountry()} placeholder="código ISO (cd, rw, ug…)" className="text-xs w-44" maxLength={2} />
          <Button size="sm" variant="outline" onClick={addCountry} className="h-8 gap-1"><Plus className="w-3 h-3" /> AGREGAR</Button>
          <div className="flex flex-wrap gap-1">
            {countries.map((c) => (
              <button key={c} onClick={() => setCountries((x) => x.filter((y) => y !== c))} title="Quitar" className="relative group">
                <Countryball code={c} size={26} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="text-[9px] font-mono text-muted-foreground" htmlFor="fich-cause">Causa principal</label>
        <Input id="fich-cause" value={cause} onChange={(e) => setCause(e.target.value)} placeholder="Ej: control de los minerales de conflicto" className="text-xs mt-1" maxLength={200} />
      </div>
      <div>
        <div className="flex justify-between">
          <label className="text-[9px] font-mono text-muted-foreground" htmlFor="fich-sum">Resumen (mínimo 200 palabras)</label>
          <span className={cn("text-[9px] font-mono", words >= 200 ? "text-green-hud" : "text-muted-foreground")}>{words}/200 palabras</span>
        </div>
        <textarea id="fich-sum" value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full mt-1 bg-transparent border border-border/60 rounded-sm p-2 text-xs min-h-32" maxLength={8000} />
      </div>
      <div>
        <label className="text-[9px] font-mono text-muted-foreground" htmlFor="fich-src">Fuentes verificadas (separadas por coma)</label>
        <Input id="fich-src" value={sources} onChange={(e) => setSources(e.target.value)} placeholder="ACNED, ONU, Reuters…" className="text-xs mt-1" maxLength={300} />
      </div>
      <Button size="sm" onClick={submit} className="w-full gap-1.5 bg-green-700 hover:bg-green-800 text-white"><Send className="w-3.5 h-3.5" /> ENVIAR → Revisión → +100 monedas</Button>
      <p className="text-[9px] font-mono text-muted-foreground">Proceso: 1) creas la ficha · 2) 3 usuarios nivel 5+ la revisan · 3) si se aprueba aparece en la web · 4) tú ganas +100 · 5) cada revisor +10.</p>
    </div>
  );
}

// ============ TRABAJO 3: VERIFICADOR DE NOTICIAS ============
function JobVerificador({ alias, onVoted }: { alias: string; onVoted: () => void }) {
  const [news, setNews] = useState<NewsRow[]>([]);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [elite, setElite] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/verify?voter=${encodeURIComponent(alias)}`)
      .then((r) => r.json())
      .then((d) => { setNews(d.items ?? []); setAccuracy(d.accuracy); setElite(d.elite); })
      .catch(() => {});
  }, [alias]);
  useEffect(() => { load(); }, [load]);

  const vote = (id: string, verdict: "real" | "falsa" | "dudosa" | "nose") => {
    fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newsId: id, voter: alias, verdict }) })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { toast.error(d.error); return; }
        if (d.resolved) toast.success(d.correct ? "✅ Verificación cerrada — ACERTASTE +10 monedas" : "Verificación cerrada — esta vez no acertaste");
        else toast.success(`Voto registrado (${d.ok}) — faltan votos para cerrar la verificación`);
        load(); onVoted();
      })
      .catch(() => {});
  };

  return (
    <div className="space-y-3">
      <div className="hud-panel border-amber-hud/40 p-3 flex flex-wrap items-center gap-4">
        <div>
          <div className="text-[11px] font-mono font-bold text-amber">🔍 TU HISTORIAL DE ACIERTOS</div>
          <div className="text-2xl font-mono font-bold">{accuracy !== null ? `${accuracy}%` : "—"}</div>
          {elite && <div className="text-[9px] font-mono text-amber">🏅 FACT-CHECKER ELITE: tu voto vale x2</div>}
        </div>
        <div className="text-[9px] font-mono text-muted-foreground space-y-0.5">
          <div>· 10 usuarios verifican cada noticia · el 70%+ decide el resultado</div>
          <div>· Acierto: +{VERIFY_REWARD} monedas · Dudosa acertada: +{VERIFY_DUDA_REWARD} · No sé: +{VERIFY_NOSE_REWARD}</div>
          <div>· Racha de 10 correctas: +100 · 90%+ de acierto: badge ELITE +500 y voto x2</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {news.map((n) => {
          const tally: Record<string, number> = {};
          for (const v of n.votes) tally[v.verdict] = (tally[v.verdict] || 0) + 1;
          const total = n.votes.length;
          return (
            <div key={n.id} className={cn("hud-panel p-3 space-y-2", n.resolved ? "border-border/40 opacity-80" : "border-cyan-hud/40")}>
              <div className="flex items-start justify-between gap-2">
                <div className="text-[11px] font-bold leading-snug">"{n.headline}"</div>
                {n.resolved && <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded-sm border shrink-0", n.truth === "falsa" ? "text-red-hud border-red-hud/50" : n.truth === "dudosa" ? "text-amber border-amber-hud/50" : "text-green-hud border-green-hud/50")}>{n.truth?.toUpperCase()}</span>}
              </div>
              <div className="text-[9px] font-mono text-muted-foreground">Fuente: {n.source} · {n.publishedAt} · {total}/10 votos</div>
              {!n.resolved && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Button size="sm" variant="outline" onClick={() => vote(n.id, "real")} className="h-7 text-[10px] text-green-hud border-green-hud/50">✅ REAL +{VERIFY_REWARD}</Button>
                  <Button size="sm" variant="outline" onClick={() => vote(n.id, "falsa")} className="h-7 text-[10px] text-red-hud border-red-hud/50">❌ FALSA +{VERIFY_REWARD}</Button>
                  <Button size="sm" variant="outline" onClick={() => vote(n.id, "dudosa")} className="h-7 text-[10px] text-amber border-amber-hud/50">⚠️ DUDOSA +{VERIFY_DUDA_REWARD}</Button>
                  <Button size="sm" variant="outline" onClick={() => vote(n.id, "nose")} className="h-7 text-[10px] text-muted-foreground">🔍 NO SÉ +{VERIFY_NOSE_REWARD}</Button>
                </div>
              )}
              {total > 0 && (
                <div className="flex gap-2 text-[9px] font-mono text-muted-foreground">
                  <span>✅ {tally.real ?? 0}</span><span>❌ {tally.falsa ?? 0}</span><span>⚠️ {tally.dudosa ?? 0}</span><span>🔍 {tally.nose ?? 0}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ TRABAJO 4: TRADUCTOR ============
function JobTraductor({ alias, cbAvatar, onSent }: { alias: string; cbAvatar: string; onSent: () => void }) {
  const [original, setOriginal] = useState("");
  const [translation, setTranslation] = useState("");
  const [lang, setLang] = useState("es");
  const [history, setHistory] = useState<ContributionRow[]>([]);

  const loadHistory = useCallback(() => {
    fetch("/api/contrib?type=traduccion&take=6").then((r) => r.json()).then((d) => setHistory(d.items ?? [])).catch(() => {});
  }, []);
  useEffect(() => { loadHistory(); }, [loadHistory]);

  const submit = () => {
    if (!original.trim() || !translation.trim()) { toast.error("Falta el texto original o tu traducción"); return; }
    fetch("/api/contrib", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "traduccion", title: `Traducción (${lang.toUpperCase()}): ${original.slice(0, 80)}`, content: translation, author: alias, country: cbAvatar || "us", originalText: original, targetLang: lang }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { toast.error(d.error); return; }
        toast.success("🌐 Traducción enviada — +30 monedas si se aprueba (+50 extra si es idioma raro)");
        setOriginal(""); setTranslation("");
        loadHistory(); onSent();
      })
      .catch(() => {});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="hud-panel border-amber-hud/40 p-3 space-y-2.5">
        <div className="text-[11px] font-mono font-bold text-amber">🌐 TRADUCIR CONTENIDO</div>
        <div>
          <label className="text-[9px] font-mono text-muted-foreground" htmlFor="tr-orig">Texto original (inglés u otro idioma)</label>
          <textarea id="tr-orig" value={original} onChange={(e) => setOriginal(e.target.value)} placeholder="Pega aquí el texto de una ficha o noticia…" className="w-full mt-1 bg-transparent border border-border/60 rounded-sm p-2 text-xs min-h-24" maxLength={4000} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-muted-foreground">Idioma nativo:</span>
          <Countryball code={cbAvatar || "es"} size={20} angry={false} />
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent border border-border/60 rounded-sm text-xs p-1" aria-label="Idioma de destino">
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇬🇧 Inglés</option>
            <option value="fr">🇫🇷 Francés</option>
            <option value="pt">🇵🇹 Portugués</option>
            <option value="sw">🇰🇪 Swahili (+50 extra)</option>
            <option value="other">Otro (+50 extra)</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] font-mono text-muted-foreground" htmlFor="tr-mine">Tu traducción</label>
          <textarea id="tr-mine" value={translation} onChange={(e) => setTranslation(e.target.value)} className="w-full mt-1 bg-transparent border border-border/60 rounded-sm p-2 text-xs min-h-24" maxLength={4000} />
        </div>
        <Button size="sm" onClick={submit} className="w-full gap-1.5 bg-green-700 hover:bg-green-800 text-white"><Send className="w-3.5 h-3.5" /> ENVIAR → +30 monedas si aprobada</Button>
      </div>
      <div className="hud-panel border-cyan-hud/40 p-3 space-y-2">
        <div className="text-[11px] font-mono font-bold text-cyan-hud">📜 ÚLTIMAS TRADUCCIONES DE LA COMUNIDAD</div>
        {history.map((h) => (
          <div key={h.id} className="p-2 border border-border/50 rounded-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold line-clamp-1">{h.title}</span>
              <StatusChip status={h.status} />
            </div>
            <div className="text-[9px] font-mono text-muted-foreground">{h.author} · {h.targetLang.toUpperCase()} · {timeAgo(h.createdAt)}</div>
          </div>
        ))}
        {history.length === 0 && <div className="text-[10px] font-mono text-muted-foreground text-center py-4">Aún no hay traducciones.</div>}
      </div>
    </div>
  );
}

// ============ TRABAJO 5: MODERADOR ============
function JobModerador({ alias, onModerated }: { alias: string; onModerated: () => void }) {
  const [queue, setQueue] = useState<ContributionRow[]>([]);
  const [me, setMe] = useState<ProfileRow | null>(null);
  const [done, setDone] = useState({ approved: 0, rejected: 0 });

  const isSenior = !!me && me.approved >= 500;

  const load = useCallback(() => {
    fetch("/api/contrib?status=pendiente&take=12").then((r) => r.json()).then((d) => setQueue(d.items ?? [])).catch(() => {});
    fetch(`/api/contrib/leaderboard?alias=${encodeURIComponent(alias)}`).then((r) => r.json()).then((d) => setMe(d.me)).catch(() => {});
  }, [alias]);
  useEffect(() => { load(); }, [load]);

  const act = (id: string, action: "aprobar" | "rechazar", reason = "") => {
    if (!isSenior) { toast.error("Necesitas ser EDITOR SENIOR (500+ contribuciones aprobadas)"); return; }
    fetch(`/api/contrib/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, moderator: alias, reason }) })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { toast.error(d.error); return; }
        toast.success(action === "aprobar" ? `✅ Aprobada — +${MOD_REWARD} monedas por moderar` : "❌ Rechazada con motivo");
        setDone((x) => ({ ...x, [action === "aprobar" ? "approved" : "rejected"]: x[action === "aprobar" ? "approved" : "rejected"] + 1 }));
        load(); onModerated();
      })
      .catch(() => {});
  };

  const commentsToReview = queue.filter((q) => q.type === "reporte").length;

  return (
    <div className="space-y-3">
      <div className="hud-panel border-amber-hud/40 p-3 space-y-1.5">
        <div className="text-[11px] font-mono font-bold text-amber">🛡️ PANEL MODERADOR</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
          <div className="p-2 border border-border/50 rounded-sm">Comentarios para revisar: <b>{commentsToReview}</b></div>
          <div className="p-2 border border-border/50 rounded-sm">Reportes pendientes: <b>{queue.length}</b></div>
          <div className="p-2 border border-border/50 rounded-sm">Aprobados hoy: <b className="text-green-hud">{done.approved}</b></div>
          <div className="p-2 border border-border/50 rounded-sm">Rechazados hoy: <b className="text-red-hud">{done.rejected}</b></div>
        </div>
        <div className="text-[9px] font-mono text-muted-foreground">
          Requisitos: nivel 5+ · 500+ predicciones correctas · cuenta 30+ días · sin bans. Recompensa: +{MOD_REWARD} monedas por moderación · badge "Moderador Activo" · sala privada.
          {me && <span className={cn("ml-1", isSenior ? "text-green-hud" : "text-amber")}>{isSenior ? "✅ Eres Editor Senior — puedes moderar" : `Llevas ${me.approved} aprobadas — a 500 desbloqueas la moderación.`}</span>}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {queue.map((q) => (
          <div key={q.id} className="hud-panel border-border/50 p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-mono px-1.5 py-0.5 border border-amber-hud/40 text-amber rounded-sm uppercase">{q.type}</span>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
                <Countryball code={q.country} size={14} angry={false} /> {q.author} · {timeAgo(q.createdAt)}
              </div>
            </div>
            <div className="text-[11px] font-bold">{q.title}</div>
            {q.content && <p className="text-[10px] text-foreground/80 line-clamp-3">{q.content}</p>}
            <div className="flex gap-1.5 pt-1">
              <Button size="sm" variant="outline" onClick={() => act(q.id, "aprobar")} className="h-7 text-[10px] text-green-hud border-green-hud/50"><Check className="w-3 h-3" /> APROBAR</Button>
              <Button size="sm" variant="outline" onClick={() => act(q.id, "rechazar", "No cumple las normas de contenido")} className="h-7 text-[10px] text-red-hud border-red-hud/50"><X className="w-3 h-3" /> RECHAZAR</Button>
            </div>
          </div>
        ))}
        {queue.length === 0 && (
          <div className="hud-panel p-6 text-center text-[10px] font-mono text-muted-foreground lg:col-span-2">La cola de moderación está vacía. ¡Todo al día! 🛡️</div>
        )}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    aprobado: "text-green-hud border-green-hud/50",
    rechazado: "text-red-hud border-red-hud/50",
    pendiente: "text-amber border-amber-hud/50",
  };
  const label: Record<string, string> = { aprobado: "APROBADO", rechazado: "RECHAZADO", pendiente: "EN REVISIÓN" };
  return <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded-sm border shrink-0", map[status])}>{label[status] ?? status.toUpperCase()}</span>;
}

// ============ TRABAJO 6: ANALISTA DE CONFLICTOS ============
function JobAnalista({ alias, cbAvatar, onSent }: { alias: string; cbAvatar: string; onSent: () => void }) {
  const [title, setTitle] = useState("");
  const [atype, setAtype] = useState("historico");
  const [content, setContent] = useState("");
  const [top, setTop] = useState<ContributionRow[]>([]);
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  const loadTop = useCallback(() => {
    fetch("/api/contrib?type=analisis&status=aprobado&sort=likes&take=5").then((r) => r.json()).then((d) => setTop(d.items ?? [])).catch(() => {});
  }, []);
  useEffect(() => { loadTop(); }, [loadTop]);

  const submit = () => {
    if (!title.trim() || words < 500) {
      toast.error(words < 500 ? `El análisis necesita 500 palabras mínimo (llevas ${words})` : "Falta el título");
      return;
    }
    fetch("/api/contrib", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "analisis", title, content, author: alias, country: cbAvatar || "us", analysisType: atype }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { toast.error(d.error); return; }
        toast.success("📊 Análisis publicado a revisión — +150 monedas al aprobarse (+250 a 50 likes, +500 a 100 likes 🔥)");
        setTitle(""); setContent("");
        loadTop(); onSent();
      })
      .catch(() => {});
  };

  const like = async (id: string) => {
    const r = await fetch(`/api/contrib/${id}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ voter: alias, verdict: "like" }) }).then((x) => x.json()).catch(() => null);
    if (r?.error) { toast.error(r.error); return; }
    toast.success(`❤️ Like registrado (${r.likes})`);
    loadTop();
  };

  const ATYPES = [
    { k: "historico", l: "🏛️ Análisis histórico" },
    { k: "prediccion", l: "🔮 Predicción razonada" },
    { k: "comparativa", l: "⚖️ Comparativa con otros casos" },
    { k: "consecuencias", l: "💥 Análisis de consecuencias" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="hud-panel border-amber-hud/40 p-3 space-y-2.5">
        <div className="text-[11px] font-mono font-bold text-amber">📊 PUBLICAR ANÁLISIS</div>
        <div>
          <label className="text-[9px] font-mono text-muted-foreground" htmlFor="an-title">Título del análisis</label>
          <Input id="an-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: ¿Qué pasaría si el estrecho se cierra 30 días?" className="text-xs mt-1" maxLength={140} />
        </div>
        <div>
          <span className="text-[9px] font-mono text-muted-foreground">Tipo</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
            {ATYPES.map((t) => (
              <button key={t.k} onClick={() => setAtype(t.k)} className={cn("px-2 py-1.5 rounded-sm border text-[10px] font-mono text-left", atype === t.k ? "text-amber border-amber-hud bg-amber-hud/20" : "border-border/60 text-muted-foreground")}>{t.l}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between">
            <label className="text-[9px] font-mono text-muted-foreground" htmlFor="an-body">Contenido (mínimo 500 palabras)</label>
            <span className={cn("text-[9px] font-mono", words >= 500 ? "text-green-hud" : "text-muted-foreground")}>{words}/500</span>
          </div>
          <textarea id="an-body" value={content} onChange={(e) => setContent(e.target.value)} className="w-full mt-1 bg-transparent border border-border/60 rounded-sm p-2 text-xs min-h-40" maxLength={20000} />
        </div>
        <Button size="sm" onClick={submit} className="w-full gap-1.5 bg-green-700 hover:bg-green-800 text-white"><Send className="w-3.5 h-3.5" /> PUBLICAR → Revisión → +150 monedas</Button>
        <p className="text-[9px] font-mono text-muted-foreground">Si tu análisis llega a 50 likes: +250 monedas · a 100 likes: +500 monedas bonus 🔥</p>
      </div>
      <div className="hud-panel border-cyan-hud/40 p-3 space-y-2">
        <div className="text-[11px] font-mono font-bold text-cyan-hud">🔥 ANÁLISIS MÁS VALORADOS — DA TU LIKE</div>
        {top.map((a) => (
          <div key={a.id} className="p-2 border border-border/50 rounded-sm">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold leading-snug line-clamp-2">{a.title}</span>
              <button onClick={() => like(a.id)} className="shrink-0 flex items-center gap-1 px-2 py-1 border border-red-hud/40 rounded-sm text-[9px] font-mono text-red-hud hover:bg-red-hud/10">❤️ {a.likes}</button>
            </div>
            <div className="text-[9px] font-mono text-muted-foreground mt-0.5">por {a.author} · {a.analysisType} · {timeAgo(a.createdAt)}</div>
          </div>
        ))}
        {top.length === 0 && <div className="text-[10px] font-mono text-muted-foreground text-center py-4">Aún no hay análisis aprobados.</div>}
      </div>
    </div>
  );
}

// ============ TRABAJO 7: CREADOR DE PREDICCIONES ============
function JobPredicciones({ alias, cbAvatar, onSent }: { alias: string; cbAvatar: string; onSent: () => void }) {
  const [question, setQuestion] = useState("");
  const [opts, setOpts] = useState(["", "", "", ""]);
  const [resolveDate, setResolveDate] = useState("");
  const [source, setSource] = useState("");
  const [mine, setMine] = useState<ContributionRow[]>([]);

  const loadMine = useCallback(() => {
    fetch(`/api/contrib?type=prediccion&author=${encodeURIComponent(alias)}&take=6`).then((r) => r.json()).then((d) => setMine(d.items ?? [])).catch(() => {});
  }, [alias]);
  useEffect(() => { loadMine(); }, [loadMine]);

  const submit = () => {
    if (!question.trim()) { toast.error("Escribe la pregunta de la predicción"); return; }
    const filled = opts.filter((o) => o.trim()).map((t, i) => ({ k: String.fromCharCode(65 + i), t: t.trim() }));
    if (filled.length < 2) { toast.error("Necesitas al menos 2 opciones de respuesta"); return; }
    fetch("/api/contrib", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "prediccion", title: question, content: `Predicción propuesta por la comunidad. Se resuelve: ${resolveDate || "por definir"}. Verificación: ${source || "medios oficiales"}.`, author: alias, country: cbAvatar || "us", options: filled, resolveDate, sourceUrl: source }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { toast.error(d.error); return; }
        toast.success("🎯 Predicción enviada — +200 monedas si se aprueba y se usa (+500 muy votada, +1000 del mes 🏆)");
        setQuestion(""); setOpts(["", "", "", ""]); setResolveDate(""); setSource("");
        loadMine(); onSent();
      })
      .catch(() => {});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="hud-panel border-amber-hud/40 p-3 space-y-2.5">
        <div className="text-[11px] font-mono font-bold text-amber">🎯 PROPONER PREDICCIÓN</div>
        <div>
          <label className="text-[9px] font-mono text-muted-foreground" htmlFor="pr-q">Pregunta de predicción</label>
          <Input id="pr-q" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder='"¿…?"' className="text-xs mt-1" maxLength={160} />
        </div>
        <div>
          <span className="text-[9px] font-mono text-muted-foreground">Opciones de respuesta</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
            {opts.map((o, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-amber">{String.fromCharCode(65 + i)}:</span>
                <Input value={o} onChange={(e) => setOpts((x) => x.map((y, j) => (j === i ? e.target.value : y)))} className="text-xs h-8" maxLength={60} />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] font-mono text-muted-foreground" htmlFor="pr-date">Se resuelve</label>
            <Input id="pr-date" value={resolveDate} onChange={(e) => setResolveDate(e.target.value)} placeholder="31 dic 2026" className="text-xs mt-1" maxLength={20} />
          </div>
          <div>
            <label className="text-[9px] font-mono text-muted-foreground" htmlFor="pr-src">Cómo se verifica</label>
            <Input id="pr-src" value={source} onChange={(e) => setSource(e.target.value)} placeholder="ONU / Reuters…" className="text-xs mt-1" maxLength={120} />
          </div>
        </div>
        <Button size="sm" onClick={submit} className="w-full gap-1.5 bg-green-700 hover:bg-green-800 text-white"><Send className="w-3.5 h-3.5" /> ENVIAR → +200 monedas si se aprueba 🏆</Button>
      </div>
      <div className="hud-panel border-cyan-hud/40 p-3 space-y-2">
        <div className="text-[11px] font-mono font-bold text-cyan-hud">📤 TUS PREDICCIONES</div>
        {mine.map((m) => (
          <div key={m.id} className="p-2 border border-border/50 rounded-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold line-clamp-1">{m.title}</span>
              <StatusChip status={m.status} />
            </div>
            <div className="text-[9px] font-mono text-muted-foreground mt-0.5">{timeAgo(m.createdAt)}{m.rewardCoins > 0 ? ` · +${m.rewardCoins} monedas` : ""}</div>
          </div>
        ))}
        {mine.length === 0 && <div className="text-[10px] font-mono text-muted-foreground text-center py-4">Todavía no has propuesto predicciones.</div>}
      </div>
    </div>
  );
}

// ============ MIS ENVÍOS ============
function MisEnvios({ alias }: { alias: string }) {
  const [items, setItems] = useState<ContributionRow[]>([]);

  const load = useCallback(() => {
    fetch(`/api/contrib?author=${encodeURIComponent(alias)}&take=40`).then((r) => r.json()).then((d) => setItems(d.items ?? [])).catch(() => {});
  }, [alias]);
  useEffect(() => { load(); }, [load]);

  const like = async (id: string) => {
    const r = await fetch(`/api/contrib/${id}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ voter: alias, verdict: "like" }) }).then((x) => x.json()).catch(() => null);
    if (r?.error) toast.error(r.error);
    load();
  };

  return (
    <div className="space-y-2">
      {items.map((c) => (
        <div key={c.id} className="hud-panel border-border/50 p-3 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-mono px-1.5 py-0.5 border border-amber-hud/40 text-amber rounded-sm uppercase">{c.type}</span>
            <StatusChip status={c.status} />
            <span className="flex-1" />
            <span className="text-[9px] font-mono text-muted-foreground">{timeAgo(c.createdAt)}</span>
          </div>
          <div className="text-xs font-bold">{c.title}</div>
          {c.content && <p className="text-[10px] text-foreground/70 line-clamp-2">{c.content}</p>}
          <div className="flex flex-wrap items-center gap-3 text-[9px] font-mono text-muted-foreground">
            {c.rewardCoins > 0 && <span className="text-amber">💰 +{c.rewardCoins} monedas</span>}
            {c.status === "aprobado" && <span className="text-green-hud">revisó: {c.reviewedBy || "comunidad"}</span>}
            {c.status === "rechazado" && c.rejectReason && <span className="text-red-hud">motivo: {c.rejectReason}</span>}
            {c.type === "analisis" && c.status === "aprobado" && (
              <button onClick={() => like(c.id)} className="text-red-hud hover:underline">❤️ {c.likes} likes</button>
            )}
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="hud-panel p-8 text-center space-y-2">
          <Inbox className="w-8 h-8 mx-auto text-muted-foreground/40" />
          <div className="text-[11px] font-mono text-muted-foreground">Todavía no has enviado contribuciones. ¡Elige un trabajo y empieza a ganar monedas!</div>
        </div>
      )}
    </div>
  );
}

// ============ RANKING ============
function RankingTab({ board }: { board: LeaderboardData }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="space-y-3">
      {/* contribuidor del mes */}
      {board.contribOfMonth && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="hud-panel border-amber-hud p-4 flex flex-wrap items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 20% 30%, #FFD166, transparent 60%)" }} />
          <Crown className="w-8 h-8 text-amber relative" />
          <Countryball code={board.contribOfMonth.country} size={52} className="relative" />
          <div className="relative">
            <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">CONTRIBUIDOR DEL MES</div>
            <div className="text-lg font-bold font-mono text-amber">{board.contribOfMonth.alias}</div>
            <div className="text-[10px] font-mono text-muted-foreground">{board.contribOfMonth.count} contribuciones aprobadas este mes · {board.contribOfMonth.coinsEarned} monedas ganadas · premio +5000 🏆</div>
          </div>
          <div className="relative ml-auto text-right text-[9px] font-mono text-muted-foreground">
            <div>Badge exclusivo del mes 🎖️</div>
            <div>Entrevista destacada en la web 📰</div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* top del mes */}
        <div className="hud-panel border-amber-hud/40 p-3 space-y-1.5">
          <div className="text-[11px] font-mono font-bold text-amber">🏆 TOP CONTRIBUIDORES DEL MES</div>
          {board.topMonth.map((t, i) => (
            <div key={t.author} className="flex items-center gap-2 p-1.5 border border-border/40 rounded-sm">
              <span className="w-6 text-center">{medals[i] ?? `${i + 1}.`}</span>
              <span className="text-[11px] font-bold font-mono flex-1">@{t.author}</span>
              <span className="text-[10px] font-mono text-green-hud">{t.count} contribuciones</span>
            </div>
          ))}
          {board.topMonth.length === 0 && <div className="text-[10px] font-mono text-muted-foreground py-3 text-center">Aún no hay aprobados este mes.</div>}
        </div>
        {/* estadísticas globales */}
        <div className="hud-panel border-cyan-hud/40 p-3 space-y-1.5">
          <div className="text-[11px] font-mono font-bold text-cyan-hud">📊 ESTADÍSTICAS GLOBALES</div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="p-2 border border-border/50 rounded-sm">📝 Fichas creadas por usuarios: <b>{board.stats.fichas}</b></div>
            <div className="p-2 border border-border/50 rounded-sm">🔍 Noticias verificadas: <b>{board.stats.noticiasVerificadas}</b></div>
            <div className="p-2 border border-border/50 rounded-sm">📊 Análisis publicados: <b>{board.stats.analisis}</b></div>
            <div className="p-2 border border-border/50 rounded-sm">🎥 Horas de stream: <b>{board.stats.horasStream}h</b></div>
            <div className="p-2 border border-border/50 rounded-sm col-span-2">⚡ Total contribuciones enviadas: <b>{board.stats.totalContribuciones}</b></div>
          </div>
        </div>
      </div>

      {/* hall de la fama */}
      <div className="hud-panel border-violet-hud/40 p-3 space-y-1">
        <div className="text-[11px] font-mono font-bold text-violet-hud">🌟 HALL DE LA FAMA (todos los tiempos)</div>
        <div className="max-h-72 overflow-y-auto thin-scroll space-y-1 pr-1">
          {board.hallOfFame.map((p, i) => {
            const r = rankOf(p.approved);
            return (
              <div key={p.alias} className="flex items-center gap-2 p-1.5 border border-border/40 rounded-sm">
                <span className={cn("w-8 text-center text-[10px] font-mono", i < 3 ? "text-amber font-bold" : "text-muted-foreground")}>{i < 3 ? medals[i] : `${i + 1}`}</span>
                <Countryball code={p.country} size={20} angry={false} />
                <span className="text-[11px] font-bold font-mono flex-1 truncate">{p.alias}</span>
                <span className={cn("text-[9px] font-mono hidden sm:inline", r.current?.color ?? "text-muted-foreground")}>{r.current?.badge} {r.current?.name.split(" ")[0] ?? ""}</span>
                {p.badges.includes("elite") && <span title="Fact-Checker Elite">🏅</span>}
                <span className="text-[10px] font-mono text-green-hud w-14 text-right">{p.approved} ✅</span>
                <span className="text-[10px] font-mono text-amber w-20 text-right hidden sm:inline">{p.coinsEarned} ◉</span>
              </div>
            );
          })}
          {board.hallOfFame.length === 0 && <div className="text-[10px] font-mono text-muted-foreground py-3 text-center">El hall está esperando a sus primeras leyendas.</div>}
        </div>
      </div>
    </div>
  );
}

// ============ RANGOS & RECOMPENSAS ============
function RangosTab() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {RANKS.map((r) => (
          <div key={r.key} className="hud-panel border-border/50 p-3 space-y-1">
            <div className={cn("text-xs font-bold font-mono", r.color)}>{r.badge} {r.name}</div>
            <div className="text-[10px] font-mono text-muted-foreground">{r.min}+ contribuciones aprobadas</div>
            <div className="text-[10px]">{r.perk}</div>
          </div>
        ))}
      </div>
      <div className="hud-panel border-green-hud/40 p-3 space-y-1.5">
        <div className="text-[11px] font-mono font-bold text-green-hud">💰 TABLA COMPLETA DE RECOMPENSAS</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[10px] font-mono">
          <div className="space-y-0.5">
            <div className="text-amber font-bold">📡 REPORTAR</div>
            <div>├─ Reporte aprobado: +50</div>
            <div>├─ Reporte viral (1000 vistas): +200</div>
            <div>└─ Primer reporte del día: +20 bonus</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-amber font-bold">✍️ ESCRIBIR</div>
            <div>├─ Ficha aprobada: +100</div>
            <div>├─ Análisis aprobado: +150</div>
            <div>├─ Análisis con 50 likes: +250</div>
            <div>└─ Análisis con 100 likes: +500</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-amber font-bold">🔍 VERIFICAR</div>
            <div>├─ Verificar noticia (correcto): +{VERIFY_REWARD}</div>
            <div>├─ Racha 10 correctas: +100</div>
            <div>└─ Badge Fact-Checker Elite: +500 único</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-amber font-bold">🌐 TRADUCIR</div>
            <div>├─ Traducción aprobada: +30</div>
            <div>├─ 10 traducciones en un día: +100</div>
            <div>└─ Idioma raro (swahili…): +50 extra</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-amber font-bold">🛡️ MODERAR</div>
            <div>├─ Reporte revisado: +{MOD_REWARD}</div>
            <div>├─ 20 moderaciones/día: +50 bonus</div>
            <div>└─ Badge moderador mes: +300 único</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-amber font-bold">🎯 PREDICCIÓN</div>
            <div>├─ Predicción aprobada: +200</div>
            <div>├─ Predicción muy votada: +500</div>
            <div>└─ Predicción del mes: +1000</div>
          </div>
          <div className="space-y-0.5 sm:col-span-2 lg:col-span-3">
            <div className="text-amber font-bold">🎥 STREAMEAR EN VIVO</div>
            <div>├─ 10 viewers: +20/hora · ├─ 50 viewers: +100/hora · ├─ 100+ viewers: +300/hora · └─ Stream de 2+ horas: +100 bonus</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ ALERTAS (notificaciones) ============
function AlertasTab({ notifs, alias, onRead }: { notifs: NotifRow[]; alias: string; onRead: () => void }) {
  const markAll = () => {
    fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alias, action: "read-all" }) })
      .then(onRead)
      .catch(() => {});
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-mono font-bold text-amber">🔔 NOTIFICACIONES DE CONTRIBUIDOR</div>
        {notifs.some((n) => !n.read) && <Button size="sm" variant="outline" onClick={markAll} className="h-7 text-[10px]">MARCAR TODO LEÍDO</Button>}
      </div>
      {notifs.map((n) => (
        <div key={n.id} className={cn("hud-panel p-3 flex items-start gap-3", n.read ? "border-border/40 opacity-75" : "border-amber-hud/50")}>
          <span className="text-xl">{n.icon}</span>
          <div className="flex-1">
            <div className="text-[11px] font-bold">{n.title}</div>
            {n.body && <div className="text-[10px] text-muted-foreground mt-0.5">{n.body}</div>}
            <div className="text-[9px] font-mono text-muted-foreground mt-1">{timeAgo(n.createdAt)}</div>
          </div>
          {!n.read && <span className="w-2 h-2 rounded-full bg-red-hud mt-1.5" />}
        </div>
      ))}
      {notifs.length === 0 && (
        <div className="hud-panel p-8 text-center">
          <Bell className="w-8 h-8 mx-auto text-muted-foreground/40" />
          <div className="text-[11px] font-mono text-muted-foreground mt-2">Sin notificaciones — contribuye o streamea para recibir alertas de monedas 🎉</div>
        </div>
      )}
    </div>
  );
}

// ============ PANEL ADMIN ============
function AdminTab({ alias, onAction }: { alias: string; onAction: () => void }) {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [queue, setQueue] = useState<ContributionRow[]>([]);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("pendiente");
  const [typeCounts, setTypeCounts] = useState<{ type: string; status: string; _count: { _all: number } }[]>([]);
  const [bonus, setBonus] = useState("0");

  const load = useCallback(() => {
    const params = new URLSearchParams({ take: "40" });
    if (filterType) params.set("type", filterType);
    if (filterStatus) params.set("status", filterStatus);
    fetch(`/api/contrib?${params}`).then((r) => r.json()).then((d) => setQueue(d.items ?? [])).catch(() => {});
    fetch("/api/contrib/leaderboard").then((r) => r.json()).then((d) => setTypeCounts(d.typeCounts ?? [])).catch(() => {});
  }, [filterType, filterStatus]);
  useEffect(() => { if (unlocked) load(); }, [unlocked, load]);

  const act = async (id: string, action: "aprobar" | "rechazar") => {
    let reason = "";
    if (action === "rechazar") {
      reason = window.prompt("Motivo del rechazo:", "No cumple las normas") || "No cumple las normas";
    }
    const b = action === "aprobar" ? Math.max(0, parseInt(bonus || "0", 10) || 0) : 0;
    const r = await fetch(`/api/contrib/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, moderator: alias || "Admin", adminKey: key, reason, bonus: b }) }).then((x) => x.json()).catch(() => null);
    if (r?.error) { toast.error(r.error); return; }
    toast.success(action === "aprobar" ? `✅ Aprobada${b ? ` con bonus +${b}` : ""} — el autor ya fue notificado` : "❌ Rechazada con motivo");
    load(); onAction();
  };

  if (!unlocked) {
    return (
      <div className="hud-panel border-red-hud/40 p-6 max-w-md mx-auto space-y-2 text-center">
        <Settings2 className="w-8 h-8 mx-auto text-muted-foreground/50" />
        <div className="text-[11px] font-mono font-bold text-red-hud">⚙️ PANEL ADMIN DE CONTRIBUCIONES</div>
        <p className="text-[10px] font-mono text-muted-foreground">Cola de aprobación, filtros por tipo/estado, bonus manual, estadísticas y estado del anti-spam.</p>
        <Input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Clave de administrador" className="text-xs text-center" />
        <Button size="sm" onClick={() => { if (key === ADMIN_KEY) { setUnlocked(true); toast.success("Acceso concedido"); } else toast.error("Clave incorrecta (demo: VANGUARD-2026)"); }} className="w-full">ENTRAR</Button>
        <p className="text-[9px] font-mono text-muted-foreground">Demo: la clave es VANGUARD-2026 · en producción vive en variables de entorno con NextAuth.</p>
      </div>
    );
  }

  const totals = typeCounts.reduce<Record<string, number>>((acc, t) => { acc[t.type] = (acc[t.type] ?? 0) + t._count._all; return acc; }, {});

  return (
    <div className="space-y-3">
      <div className="hud-panel border-red-hud/40 p-3 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
          <span className="font-bold text-red-hud">COLA DE APROBACIÓN</span>
          <span className="text-muted-foreground">TIPO:</span>
          <button onClick={() => setFilterType("")} className={cn("px-2 py-0.5 border rounded-sm", !filterType ? "text-amber border-amber-hud" : "border-border/60 text-muted-foreground")}>TODOS</button>
          {Object.keys(CONTRIB_REWARDS).map((t) => (
            <button key={t} onClick={() => setFilterType(t)} className={cn("px-2 py-0.5 border rounded-sm uppercase", filterType === t ? "text-amber border-amber-hud" : "border-border/60 text-muted-foreground")}>{t}</button>
          ))}
          <span className="text-muted-foreground ml-2">ESTADO:</span>
          {["pendiente", "aprobado", "rechazado", ""].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={cn("px-2 py-0.5 border rounded-sm", filterStatus === s ? "text-amber border-amber-hud" : "border-border/60 text-muted-foreground")}>{s ? s.toUpperCase() : "TODOS"}</button>
          ))}
          <span className="flex-1" />
          <span className="text-muted-foreground">BONUS MANUAL:</span>
          <Input value={bonus} onChange={(e) => setBonus(e.target.value.replace(/\D/g, ""))} className="w-16 h-6 text-[10px] px-1" />
        </div>
        <div className="flex flex-wrap gap-2 text-[9px] font-mono text-muted-foreground">
          {Object.entries(totals).map(([t, n]) => (
            <span key={t} className="px-1.5 py-0.5 border border-border/50 rounded-sm">{t}: <b className="text-foreground">{n}</b></span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {queue.map((q) => (
          <div key={q.id} className="hud-panel border-border/50 p-3 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-mono px-1.5 py-0.5 border border-amber-hud/40 text-amber rounded-sm uppercase">{q.type}</span>
              <StatusChip status={q.status} />
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground ml-auto">
                <Countryball code={q.country} size={14} angry={false} /> {q.author} · {timeAgo(q.createdAt)}
              </div>
            </div>
            <div className="text-[11px] font-bold">{q.title}</div>
            {q.content && <p className="text-[10px] text-foreground/75 line-clamp-3">{q.content}</p>}
            {q.status === "pendiente" && (
              <div className="flex gap-1.5 pt-1">
                <Button size="sm" variant="outline" onClick={() => act(q.id, "aprobar")} className="h-7 text-[10px] text-green-hud border-green-hud/50"><Check className="w-3 h-3" /> APROBAR{parseInt(bonus || "0", 10) > 0 ? ` +${bonus}` : ""}</Button>
                <Button size="sm" variant="outline" onClick={() => act(q.id, "rechazar")} className="h-7 text-[10px] text-red-hud border-red-hud/50"><X className="w-3 h-3" /> RECHAZAR</Button>
              </div>
            )}
          </div>
        ))}
        {queue.length === 0 && <div className="hud-panel p-6 text-center text-[10px] font-mono text-muted-foreground lg:col-span-2">Nada en la cola con esos filtros.</div>}
      </div>
      <div className="hud-panel border-amber-hud/40 p-3 space-y-1 text-[10px] font-mono">
        <div className="font-bold text-amber flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> ANTI-SPAM ACTIVO (server-side)</div>
        <div className="text-muted-foreground">· Máximo 10 fichas por día por usuario · Máximo 20 reportes por día</div>
        <div className="text-muted-foreground">· Tiempo mínimo entre envíos: 5 minutos · Detección de contenido copiado (similitud de bigramas)</div>
        <div className="text-muted-foreground">· Los rechazos automáticos notifican al usuario; el spam repetido prepara el ban automático</div>
      </div>
    </div>
  );
}


