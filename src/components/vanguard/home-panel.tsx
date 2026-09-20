"use client";

// Vanguard v14 — INICIO: portada rediseñada.
// 1) NOTICIAS EN PRIMERA FILA (lo primero que se ve al entrar).
// 2) Menú llamativo: tarjetas gigantes de los mundos principales.
// 3) Tensión mundial en vivo + reloj + estado del agente.
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Castle, Radar, Rocket, Swords, Joystick, Fingerprint, Coins, TrendingUp,
  Newspaper, ChevronRight, Menu, Clock, Zap, ExternalLink, ShieldAlert, Gift,
  Radio, Users, Scale, Flame, Laugh, Palette, Crosshair,
  Wand2, Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_VERSION_LABEL } from "@/lib/version";
import { useGameStore } from "@/lib/game-store";
import { getRealtime } from "@/lib/realtime";
import { CONFLICTS } from "@/lib/game-data";
import { navigateTo, openMainMenu } from "@/lib/nav";
import type { TabKey } from "@/components/vanguard/tab-nav";

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  imageUrl: string | null;
  publishedAt: string;
  tacticalTag: string | null;
  conflictTag: string | null;
}

const TAG_HEX: Record<string, string> = {
  ALERTA: "#FF3B30",
  DIPLOMACIA: "#38BDF8",
  ECONOMIA: "#3EA6FF",
  HUMANITARIO: "#A855F7",
  ANALISIS: "#00FF87",
  INFO: "#8A90A8",
};

interface WorldTile {
  tab: TabKey;
  title: string;
  desc: string;
  icon: React.ReactNode;
  hex: string;
}

// ====== MENÚ LLAMATIVO: los 8 mundos principales ======
const WORLD_TILES: WorldTile[] = [
  { tab: "foryou", title: "PARA TI", desc: "El feed de la comunidad: videos, música y stickers de los jugadores en scroll infinito — como TikTok, pero de guerra", icon: <Flame className="w-6 h-6" />, hex: "#FF3B30" },
  { tab: "mundo", title: "MUNDO DE GUERRA", desc: "Conquista los 24 territorios en el globo 3D contra 3 IA", icon: <Castle className="w-6 h-6" />, hex: "#FF3B30" },
  { tab: "bookmaker", title: "BETNACIÓN", desc: "Cuotas vivas, combinadas y cashout como una casa real", icon: <Coins className="w-6 h-6" />, hex: "#00FF87" },
  { tab: "bolsa", title: "BOLSA GEOPOLÍTICA", desc: "Invierte en monedas de países: gana o pierde al instante", icon: <TrendingUp className="w-6 h-6" />, hex: "#3EA6FF" },
  { tab: "osint", title: "SALA OSINT 3D", desc: "15 capas de inteligencia sobre un globo interactivo", icon: <Radar className="w-6 h-6" />, hex: "#38BDF8" },
  { tab: "detective", title: "ARCHIVOS NACIÓN", desc: "Resuelve casos históricos con pistas y engaños", icon: <Fingerprint className="w-6 h-6" />, hex: "#A855F7" },
  { tab: "dron", title: "DRON STRIKE 3D", desc: "Vuela el dron, marca objetivos y multiplica combos", icon: <Rocket className="w-6 h-6" />, hex: "#FF3B30" },
  { tab: "warsim", title: "SIMULADOR DE GUERRAS", desc: "Cualquier país contra cualquier país, en segundos", icon: <Swords className="w-6 h-6" />, hex: "#FF6B4A" },
  { tab: "envivo", title: "EN VIVO MUNDIAL", desc: "Noticias reales 24/7 + streams de la comunidad con donaciones", icon: <Radio className="w-6 h-6" />, hex: "#FF3B30" },
  { tab: "contribuidores", title: "CONTRIBUIDORES", desc: "7 trabajos remunerados: reporta, escribe, verifica, traduce y gana", icon: <Users className="w-6 h-6" />, hex: "#00FF87" },
  { tab: "memes", title: "ESTUDIO DE MEMES", desc: "Diseña tu meme geopolítico con 251 países personajes — publícalo y gana", icon: <Laugh className="w-6 h-6" />, hex: "#A855F7" },
  { tab: "creador", title: "ESTUDIO COMUNITARIO", desc: "Sube TU contenido: personajes, armas, juegos, música, noticias y encuestas — la IA modera", icon: <Palette className="w-6 h-6" />, hex: "#A855F7" },
  { tab: "studios", title: "ESTUDIOS CREADORES", desc: "Un estudio para cada sección: noticias con fotos, banderas propias, mapas con flechas, música compuesta in-page, stickers y muro social", icon: <Wand2 className="w-6 h-6" />, hex: "#22D3EE" },
  { tab: "gobierno", title: "GOBIERNO MUNDIAL", desc: "El embajador electo toma el poder: decretos presidenciales, ministros, reclutamiento y poder político por país", icon: <Landmark className="w-6 h-6" />, hex: "#FFD166" },
  { tab: "bolsamonedas", title: "BOLSA DE MONEDAS", desc: "Funda tu propia moneda con ticker y supply — el mercado la cotiza y los jugadores mueven el precio", icon: <Coins className="w-6 h-6" />, hex: "#34C77B" },
  { tab: "armeria", title: "ARMERÍA REAL", desc: "Fotos reales de las armas del conflicto: función, ficha técnica y armado pieza por pieza", icon: <Crosshair className="w-6 h-6" />, hex: "#FF3B30" },
  { tab: "abusos", title: "VERDAD CRUDA", desc: "Crímenes y abusos documentados con fuentes ONU · el lado que prefieren ocultar", icon: <Scale className="w-6 h-6" />, hex: "#FF3B30" },
  { tab: "memorial", title: "MEMORIAL \u2020", desc: "Los que documentaron y cayeron: enciende tu vela por ellos", icon: <Flame className="w-6 h-6" />, hex: "#A855F7" },
  { tab: "arcade", title: "ARCADE", desc: "10 minijuegos con premios en monedas y récords — nuevo RADAR FURIA", icon: <Joystick className="w-6 h-6" />, hex: "#FFD166" },
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

function nextCrisisDate(): Date {
  const now = new Date();
  const d = new Date(now);
  const day = d.getDay(); // 0 domingo
  const daysToSunday = (7 - day) % 7;
  d.setDate(d.getDate() + daysToSunday);
  d.setHours(20, 0, 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 7);
  return d;
}

export function HomePanel() {
  const alias = useGameStore((s) => s.alias);
  const coins = useGameStore((s) => s.coins);
  const level = useGameStore((s) => s.level);
  const streak = useGameStore((s) => s.streak);
  const recordViewNews = useGameStore((s) => s.recordViewNews);
  const account = useGameStore((s) => s.account);
  const launchPackClaimed = useGameStore((s) => s.launchPackClaimed);
  const claimLaunchPack = useGameStore((s) => s.claimLaunchPack);

  const [items, setItems] = useState<NewsItem[]>([]);
  const [clock, setClock] = useState("");
  const [typed, setTyped] = useState("");
  const [crisisIn, setCrisisIn] = useState("");

  // tensión mundial = intensidad media de los conflictos activos
  const tension = useMemo(
    () => Math.round(CONFLICTS.reduce((a, c) => a + c.intensity, 0) / Math.max(1, CONFLICTS.length)),
    []
  );
  const tensionColor = tension >= 80 ? "#FF3B30" : tension >= 60 ? "#FF8A3B" : tension >= 40 ? "#3EA6FF" : "#00FF87";

  // noticias (la primera página es la de noticias)
  useEffect(() => {
    let alive = true;
    fetch("/api/news", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (alive && Array.isArray(data.items)) setItems(data.items.slice(0, 12));
      })
      .catch(() => {});
    const t = setInterval(() => {
      fetch("/api/news", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (alive && Array.isArray(data.items)) setItems(data.items.slice(0, 12));
        })
        .catch(() => {});
    }, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  // reloj vivo
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        d.toLocaleTimeString("es-ES", { hour12: false }) + " local · " +
        d.toLocaleTimeString("es-ES", { hour12: false, timeZone: "UTC" }) + " UTC"
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // cuenta atrás de la crisis semanal (domingo 20:00)
  useEffect(() => {
    const target = nextCrisisDate();
    const tick = () => {
      const ms = Math.max(0, target.getTime() - Date.now());
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      const s = Math.floor((ms % 60_000) / 1000);
      setCrisisIn(`${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // titulares en modo máquina de escribir
  const headlines = useMemo(
    () => (items.length > 0 ? items.map((i) => i.title) : ["Cargando titulares en vivo…"]),
    [items]
  );
  useEffect(() => {
    let idx = 0;
    let pos = 0;
    let phase: "typing" | "hold" | "erasing" = "typing";
    const t = setInterval(() => {
      const s = headlines[idx % headlines.length] ?? "";
      if (phase === "typing") {
        pos += 1;
        setTyped(s.slice(0, pos));
        if (pos >= s.length) {
          phase = "hold";
          setTimeout(() => {}, 0);
        }
      } else if (phase === "hold") {
        phase = "erasing";
      } else {
        pos -= 4;
        if (pos <= 0) {
          pos = 0;
          idx += 1;
          phase = "typing";
        }
        setTyped((headlines[idx % headlines.length] ?? "").slice(0, Math.max(0, pos)));
      }
    }, 42);
    return () => clearInterval(t);
  }, [headlines]);

  const openNews = (n: NewsItem) => {
    recordViewNews(n.id);
    if (n.url?.startsWith("http")) window.open(n.url, "_blank", "noopener,noreferrer");
  };

  const hero = items[0];
  const secondary = items.slice(1, 5);

  return (
    <div className="space-y-5">
      {/* ====== HERO: identidad + estado (v16: anillo aurora giratorio) ====== */}
      <div className="hero-ring">
        <div className="hud-panel hud-corner p-5 sm:p-7 section-gradient relative overflow-hidden">
          <div className="radar-sweep opacity-40" aria-hidden />
          <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(62,166,255,0.5), transparent 70%)" }} aria-hidden />
          <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full blur-3xl opacity-25 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4), transparent 70%)" }} aria-hidden />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-hud mb-2">
              Centro de mando global
            </div>
            <h1
              className="glitch font-display text-3xl sm:text-5xl font-black tracking-wider text-soft"
              data-text="VANGUARD"
              style={{ textShadow: "0 0 26px rgba(62,166,255,0.35)" }}
            >
              VANGUARD
            </h1>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-gradient font-mono text-[10px] font-bold uppercase tracking-[0.3em]">
                {APP_VERSION_LABEL}
              </span>
              <span className="h-px w-16 bg-gradient-to-r from-[#3EA6FF]/60 to-transparent" aria-hidden />
            </div>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              El mundo en tiempo real: noticias, guerra, economía e inteligencia
              en una sola plataforma. Todos los mapas, ahora en 3D.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-mono text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 glass rounded-sm px-2 py-1">
                <Clock className="w-3 h-3 text-cyan-hud" /> {clock}
              </span>
              <span className="inline-flex items-center gap-1.5 glass rounded-sm px-2 py-1">
                <Zap className="w-3 h-3 text-amber" /> Nivel {level} · {coins} mon
              </span>
              {streak > 0 && (
                <span className="inline-flex items-center gap-1.5 glass rounded-sm px-2 py-1">
                  Racha {streak} días
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 glass rounded-sm px-2 py-1 text-foreground">
                Agente {alias || "sin registrar"}
              </span>
            </div>
          </div>

          {/* termómetro de tensión mundial (v16: cristal + glow) */}
          <div className="min-w-[240px] hud-corner p-4 glass border-amber-hud relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-40 pointer-events-none" style={{ background: tensionColor }} aria-hidden />
            <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Tensión mundial
              </span>
              <ShieldAlert className="w-4 h-4" style={{ color: tensionColor }} />
            </div>
            <div className="mt-1 flex items-end gap-2">
              <span className="font-tech text-4xl font-bold leading-none" style={{ color: tensionColor, textShadow: `0 0 18px ${tensionColor}66` }}>
                {tension}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground mb-1">/ 100</span>
            </div>
            <div className="mt-2 h-2.5 rounded-full bg-black/50 overflow-hidden border border-border/60 relative">
              <motion.div
                className="h-full rounded-full relative"
                style={{ background: `linear-gradient(90deg, #00FF87, #3EA6FF, #FF8A3B, #FF3B30)`, boxShadow: `0 0 12px ${tensionColor}88` }}
                initial={{ width: 0 }}
                animate={{ width: `${tension}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white blink-soft" />
              </motion.div>
            </div>
            <div className="mt-1.5 text-[9px] font-mono text-muted-foreground">
              {CONFLICTS.length} conflictos activos monitorizados
            </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* ====== ÚLTIMA HORA — LAS NOTICIAS PRIMERO ====== */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-hud blink-soft" />
            <h2 className="font-display text-sm sm:text-base font-bold tracking-widest uppercase text-gradient">
              Última hora
            </h2>
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest hidden sm:inline">
              En vivo · verificación por fuente · GDELT
            </span>
          </div>
          <button
            onClick={() => navigateTo("noticias")}
            className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-amber hover:text-foreground transition-colors"
          >
            Todas las noticias <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ticker con máquina de escribir */}
        <div className="hud-panel px-3 py-2 mb-3 flex items-center gap-2 overflow-hidden">
          <Newspaper className="w-4 h-4 text-red-hud shrink-0" />
          <span className="text-[11px] font-mono text-foreground/90 truncate typewriter-caret">
            {typed}
          </span>
        </div>

        {hero ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-3">
            {/* protagonista — v16: con FOTO REAL de la noticia */}
            <motion.article
              key={hero.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hud-corner p-4 bg-secondary/40 border-l-2 flex flex-col justify-between min-h-[180px] relative overflow-hidden"
              style={{ borderLeftColor: TAG_HEX[hero.tacticalTag ?? "INFO"] }}
            >
              {hero.imageUrl && (
                <div className="relative h-40 sm:h-52 rounded-sm overflow-hidden mb-3 border border-border/50 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hero.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm border"
                    style={{ color: TAG_HEX[hero.tacticalTag ?? "INFO"], borderColor: TAG_HEX[hero.tacticalTag ?? "INFO"] + "66" }}
                  >
                    {hero.tacticalTag ?? "INFO"}
                  </span>
                  {hero.conflictTag && (
                    <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-hud">
                      {hero.conflictTag}
                    </span>
                  )}
                  <span className="text-[9px] font-mono text-muted-foreground">
                    {hero.source} · {timeAgo(hero.publishedAt)}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold leading-snug text-foreground">
                  {hero.title}
                </h3>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                  Fuente verificada por el radar de desinformación
                </span>
                <button
                  onClick={() => openNews(hero)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1.5 border border-amber-hud rounded-sm text-amber hover:bg-amber-hud/30 transition-colors"
                >
                  Abrir <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.article>

            {/* secundarias — v16: miniaturas reales */}
            <div className="grid gap-2">
              {secondary.map((n, i) => (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => openNews(n)}
                  className="text-left hud-panel card-shine p-3 hover:border-amber-hud transition-colors group"
                >
                  <div className="flex items-start gap-2.5">
                    {n.imageUrl ? (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 overflow-hidden border border-border/60 bg-secondary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={n.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                        style={{ background: TAG_HEX[n.tacticalTag ?? "INFO"] }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground truncate">
                          {n.source} · {timeAgo(n.publishedAt)}
                        </span>
                      </div>
                      <div className="text-xs leading-snug text-foreground/90 line-clamp-2 group-hover:text-foreground">
                        {n.title}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="hud-panel p-6 text-center text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
            Conectando con la red de noticias…
          </div>
        )}
      </div>

      {/* ====== PACK DE LANZAMIENTO ====== */}
      {!launchPackClaimed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hud-panel neon-border p-4 flex flex-col sm:flex-row sm:items-center gap-3 border-amber-hud"
        >
          <div className="w-11 h-11 rounded-sm border border-amber-hud bg-amber-hud/20 flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-amber" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-sm font-bold tracking-widest text-soft uppercase">
              Pack de Lanzamiento — gratis
            </div>
            <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
              +1500 monedas · +15 gemas · 2 cajones ELITE · 1 cajón LEGENDARIA · 7 días de Pase ELITE · +500 PX
              {!account && " — crea tu cuenta para reclamarlo y guardar tu progreso en la nube."}
            </p>
          </div>
          <button
            onClick={() => {
              if (!account) {
                window.dispatchEvent(new CustomEvent("vanguard:open-account"));
                return;
              }
              if (claimLaunchPack()) {
                // feedback sencillo: el pack otorga sus recompensas al instante
              }
            }}
            className="px-4 py-2.5 border border-amber-hud bg-amber-hud/40 text-amber rounded-sm text-[11px] font-mono font-bold uppercase tracking-widest hover:bg-amber-hud/60 transition-colors flex-shrink-0"
          >
            {account ? "Reclamar pack" : "Crear cuenta y reclamar"}
          </button>
        </motion.div>
      )}

      {/* ====== v17: GUERRA GLOBAL EN VIVO ====== */}
      <LiveWarCard />

      {/* ====== MENÚ LLAMATIVO: ELIGE TU CAMPO DE BATALLA ====== */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="font-display text-sm sm:text-base font-bold tracking-widest uppercase text-gradient">
            Elige tu campo de batalla
          </h2>
          <button
            onClick={openMainMenu}
            className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 border border-electric-hud rounded-sm text-electric hover:bg-electric-hud/40 transition-colors"
          >
            <Menu className="w-3.5 h-3.5" /> Menú completo
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {WORLD_TILES.map((t, i) => (
            <motion.button
              key={t.tab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => navigateTo(t.tab)}
              className="hud-corner card-shine relative overflow-hidden p-4 text-left group border"
              style={{
                borderColor: `${t.hex}55`,
                background: `linear-gradient(140deg, ${t.hex}1f 0%, rgba(10,10,15,0.9) 55%)`,
              }}
            >
              <div
                className="absolute -right-6 -top-6 w-20 h-20 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity"
                style={{ background: t.hex }}
                aria-hidden
              />
              <div className="relative z-10">
                <div
                  className="w-11 h-11 rounded-md flex items-center justify-center border mb-3"
                  style={{ borderColor: `${t.hex}66`, color: t.hex, background: `${t.hex}1a`, boxShadow: `0 0 18px ${t.hex}33` }}
                >
                  {t.icon}
                </div>
                <div className="font-display text-xs font-bold tracking-wider text-foreground">
                  {t.title}
                </div>
                <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {t.desc}
                </div>
                <div className="mt-3 flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest" style={{ color: t.hex }}>
                  Entrar <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ====== resto de secciones + crisis semanal ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
        <div className="hud-panel p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Explora las 9 secciones · 57 subtemas
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { k: "mundo", l: "JUEGO" }, { k: "bolsa", l: "MERCADO" }, { k: "enciclopedia", l: "ARCHIVO MUNDIAL" },
              { k: "briefing", l: "COMANDO" }, { k: "osint", l: "INTELIGENCIA" }, { k: "videos", l: "EMISORA" },
              { k: "crisis", l: "SOCIAL" }, { k: "agente", l: "SISTEMA" }, { k: "mapa", l: "MAPA 3D" },
            ].map((s) => (
              <button
                key={s.l}
                onClick={() => navigateTo(s.k as TabKey)}
                className="px-3 py-2 border border-border/70 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-amber-hud hover:bg-amber-hud/20 transition-colors"
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigateTo("crisis")}
          className="hud-corner card-shine p-4 text-left border-red-hud/60 bg-red-hud/10 hover:bg-red-hud/20 transition-colors relative overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-8 w-28 h-28 rounded-full blur-2xl opacity-30 pointer-events-none" style={{ background: "#FF3B30" }} aria-hidden />
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldAlert className="w-4 h-4 text-red-hud" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-hud font-bold">
              Próxima crisis global
            </span>
          </div>
          <div className="font-tech text-2xl font-bold text-foreground tabular-nums">{crisisIn || "—"}</div>
          <div className="mt-1 text-[10px] font-mono text-muted-foreground">
            Domingo 20:00 · voto colectivo · +500 monedas al bando ganador
          </div>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// v17 — TARJETA GUERRA GLOBAL EN VIVO (portada)
// Se alimenta del socket compartido :3003 — muestra fase, jugadores
// conectados y lider actual de la partida mundial.
// ============================================================
interface MpLiveState {
  phase: "LOBBY" | "REINFORCE" | "WAR" | "ENDED";
  round: number;
  players: Record<string, { id: string; name: string; isBot: boolean }>;
  territories: Record<string, { owner: string | null; troops: number }>;
}

const LIVE_PHASE: Record<string, string> = {
  LOBBY: "Reclutando comandantes",
  REINFORCE: "Despliegue de refuerzos",
  WAR: "¡Batalla en vivo!",
  ENDED: "Partida finalizada",
};

function LiveWarCard() {
  const [live, setLive] = useState<MpLiveState | null>(null);
  // v29: si el servidor de partidas no responde, no mostrar "conectando..." eterno
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 10000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const socket = getRealtime();
    if (!socket) return;
    const on = (s: MpLiveState) => {
      const players = Object.values(s.players ?? {});
      const counts: Record<string, number> = {};
      for (const t of Object.values(s.territories ?? {})) {
        if (t.owner) counts[t.owner] = (counts[t.owner] ?? 0) + 1;
      }
      let leader: string | null = null;
      let leaderN = 0;
      for (const p of players) {
        const c = counts[p.id] ?? 0;
        if (c > leaderN) { leaderN = c; leader = p.name; }
      }
      setLive({
        phase: s.phase,
        round: s.round,
        humans: players.filter((p) => !p.isBot).length,
        leader, leaderN,
      } as MpLiveState & { humans: number; leader: string | null; leaderN: number });
    };
    socket.on("mp:state", on);
    return () => { socket.off("mp:state", on); };
  }, []);

  const extra = live as (MpLiveState & { humans?: number; leader?: string | null; leaderN?: number }) | null;

  return (
    <div className="hud-corner p-3 sm:p-4 relative overflow-hidden border-red-hud/40 bg-red-hud/5">
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-25 pointer-events-none" style={{ background: "#FF3B30" }} aria-hidden />
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 border border-red-hud text-red-hud bg-red-hud/20 rounded-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-red-hud blink-soft" />
          En vivo
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xs sm:text-sm font-bold tracking-wider uppercase text-foreground truncate">
            Guerra global — {live ? LIVE_PHASE[live.phase] : waited ? "en espera" : "conectando..."}
            {live && live.phase !== "LOBBY" && live.phase !== "ENDED" && (
              <span className="text-muted-foreground font-mono text-[10px] ml-2">ronda {live.round}</span>
            )}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground truncate">
            {extra
              ? `${extra.humans ?? 0} operador${(extra.humans ?? 0) === 1 ? "" : "es"} conectado${(extra.humans ?? 0) === 1 ? "" : "s"}${extra.leader ? ` · lidera ${extra.leader} con ${extra.leaderN ?? 0} territorios` : " · el mundo esta vacio"}`
              : waited
                ? "la próxima partida abre pronto — salas sociales y en vivo siguen en línea"
                : "sincronizando con el servidor de partidas..."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigateTo("multijugador")}
            className="flex items-center gap-1.5 px-3 py-2 border border-red-hud rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest text-red-hud bg-red-hud/15 hover:bg-red-hud/30 transition-colors"
          >
            <Swords className="w-3.5 h-3.5" /> Unirme a la guerra
          </button>
          <button
            onClick={() => navigateTo("multijugador")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 border border-electric-hud rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest text-electric bg-electric/15 hover:bg-electric/30 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" /> Duelo 1v1
          </button>
        </div>
      </div>
    </div>
  );
}
