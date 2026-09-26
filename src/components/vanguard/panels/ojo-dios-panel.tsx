"use client";

// VANGUARD v30 — VISTA DIOS (Ojo de Dios): observación omnisciente del sistema.
// Un solo panel donde NO se esconde nada:
//  · Mapa mundial omnisciente del Mundo de Guerra (todos los territorios, tropas y dueños)
//  · Feed global de TODAS las salas sociales (vía god:state del :3003)
//  · Escáner planetario de conflictos reales (GDELT) + directos observados
// Datos: socket god:state + mp:state (1s) · APIs /api/news y /api/live/streams.

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Eye, Radio, Swords, Globe2, Users, MessageSquare, Zap, MapPin, MonitorPlay, Radar as RadarIcon, Plane, Shield, Infinity as InfinityIcon } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { getRealtime, peekRealtime } from "@/lib/realtime";
import { FlagBadge } from "@/components/vanguard/flag-badge";
// v32 CIELO DE ACERO — globo 3D con unidades militares reales (aviones/tanques/infantería)
import { buildMilitaryUnits, newMilUnitCache, UNIT_KIND_KEY, type MilUnit, type MilUnitCache, type UnitKind } from "@/lib/military-units";
import type { Globe3DArc, Globe3DUnit, Globe3DMarker, GlobeFlyTo } from "@/components/vanguard/globe-map-3d";

const GlobeMap3D = dynamic(
  () => import("@/components/vanguard/globe-map-3d").then((m) => m.GlobeMap3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full rounded-sm border border-cyan-hud/30 bg-black/40 animate-pulse" style={{ height: "min(54vh, 500px)" }} />
    ),
  }
);

// ===== tipos del snapshot god:state =====
interface GodFeedItem { room: string; author: string; country: string; body: string; ts: number; bot?: boolean }
interface GodLastBattle {
  seq: number; from: string; to: string; attacker: string; attackerName: string; defenderName: string;
  atkRoll: number; defRoll: number; atkLosses: number; defLosses: number; captured: boolean;
  attackerColor: string; defenderColor: string;
}
interface GodState {
  ts: number;
  war: {
    phase: string; round: number; humans: number; bots: number; battles: number;
    claimed: number; total: number; lastBattle: GodLastBattle | null;
  };
  online: Record<string, number>;
  feed: GodFeedItem[];
}
interface TerrMeta { id: string; name: string; continent: string; lat: number; lng: number; adj: string[] }
interface MpPlayerInfo { id: string; name: string; color: string; isBot: boolean; connected: boolean; captures: number; reserves: number }
interface MpWarState {
  phase: string; round: number;
  territories: Record<string, { owner: string | null; troops: number }>;
  players: Record<string, MpPlayerInfo>;
  lastBattle: GodLastBattle | null;
  territoryMeta: TerrMeta[];
}
interface NewsItem { id: string; title: string; sourceCountry?: string | null; tacticalTag?: string | null; source: string; url?: string | null; publishedAt?: string | null }

// v56.0: antigüedad legible + detección de última hora (<2h)
function newsAge(iso?: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff) || diff < 0) return "";
  const m = Math.floor(diff / 60000);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}
function isBreaking(iso?: string | null): boolean {
  if (!iso) return false;
  const diff = Date.now() - new Date(iso).getTime();
  return !Number.isNaN(diff) && diff >= 0 && diff < 2 * 3600000;
}
interface LiveStreamItem { id: string; title: string; streamerName: string; viewers: number; country: string }

const TAG_COLOR: Record<string, string> = {
  ALERTA: "border-red-hud text-red-hud bg-red-hud/15",
  DIPLOMACIA: "border-cyan-hud text-cyan-hud bg-cyan-hud/15",
  ECONOMIA: "border-amber-hud text-amber-hud bg-amber-hud/15",
  HUMANITARIO: "border-violet-hud text-violet-hud bg-violet-hud/15",
  ANALISIS: "border-green-hud text-green-hud bg-green-hud/15",
};

export function OjoDiosPanel() {
  const { t } = useT();
  // v30: inicializador perezoso (patrón useMpConnected) — evita setState directo en effect
  const [connected, setConnected] = useState(() => !!peekRealtime()?.connected);
  const [god, setGod] = useState<GodState | null>(null);
  const [war, setWar] = useState<MpWarState | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  // v56.0 MURO INFINITO: archivo completo paginado con scroll infinito
  const [wall, setWall] = useState<NewsItem[]>([]);
  const [wallPage, setWallPage] = useState(0);
  const [wallMore, setWallMore] = useState(true);
  const [wallLoading, setWallLoading] = useState(false);
  const wallSentinel = useRef<HTMLDivElement | null>(null);
  const [streams, setStreams] = useState<LiveStreamItem[]>([]);
  // v32 CIELO DE ACERO — vista globo 3D con unidades militares (por defecto ON)
  const [vista3d, setVista3d] = useState(true);
  const [flyTo, setFlyTo] = useState<GlobeFlyTo | null>(null);
  // cache de objetos THREE como estado perezoso (estable entre renders, sin refs en render)
  const [unitCache] = useState<MilUnitCache>(() => newMilUnitCache());

  // ===== socket: god:state + mp:state (patrón home-panel) =====
  useEffect(() => {
    const socket = getRealtime();
    if (!socket) return;
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onGod = (s: GodState) => setGod(s);
    const onWar = (s: MpWarState) => setWar({
      phase: s.phase, round: s.round, territories: s.territories,
      players: s.players, lastBattle: s.lastBattle, territoryMeta: s.territoryMeta,
    });
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("god:state", onGod);
    socket.on("mp:state", onWar);
    if (socket.connected) onConnect();
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("god:state", onGod);
      socket.off("mp:state", onWar);
    };
  }, []);

  // ===== escáner planetario: conflictos reales (GDELT) =====
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/news", { cache: "no-store" });
        const j = await r.json();
        if (alive && Array.isArray(j.items)) setNews(j.items.slice(0, 7));
      } catch { /* sin señal: el panel sigue vivo con lo local */ }
      try {
        const r = await fetch("/api/live/streams?status=live", { cache: "no-store" });
        const j = await r.json();
        if (alive && Array.isArray(j.streams)) {
          setStreams([...j.streams].sort((a: LiveStreamItem, b: LiveStreamItem) => b.viewers - a.viewers).slice(0, 3));
        }
      } catch { /* idem */ }
    };
    load();
    const iv = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(iv); };
  }, []);

  const totalOnline = useMemo(
    () => (god ? Object.values(god.online).reduce((a, b) => a + b, 0) : 0),
    [god]
  );

  // v56.0 MURO INFINITO: carga por lotes del archivo histórico completo
  const loadWall = useCallback(async () => {
    if (wallLoading || !wallMore) return;
    setWallLoading(true);
    try {
      const next = wallPage + 1;
      const r = await fetch(`/api/news?page=${next}&limit=15`, { cache: "no-store" });
      const j = await r.json();
      if (Array.isArray(j.items)) {
        setWall((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...(j.items as NewsItem[]).filter((it) => !seen.has(it.id))];
        });
        setWallPage(next);
        setWallMore(Boolean(j.hasMore));
      } else {
        setWallMore(false);
      }
    } catch {
      setWallMore(false);
    }
    setWallLoading(false);
  }, [wallLoading, wallMore, wallPage]);

  useEffect(() => {
    const el = wallSentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadWall();
      },
      { rootMargin: "250px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadWall]);

  // territorios con dueño para el mapa omnisciente
  const terrs = useMemo(() => {
    if (!war?.territoryMeta) return [];
    return war.territoryMeta.map((tm) => {
      const st = war.territories[tm.id] ?? { owner: null, troops: 0 };
      const owner = st.owner ? war.players[st.owner] : null;
      return { ...tm, troops: st.troops, owner: owner ?? null };
    });
  }, [war]);

  const playersList = useMemo(
    () => (war ? Object.values(war.players).filter((p) => p.captures > 0 || p.isBot).slice(0, 8) : []),
    [war]
  );

  const phaseKey = (p: string | undefined) =>
    p === "WAR" ? "god.fase.WAR" : p === "REINFORCE" ? "god.fase.REINFORCE" : p === "ENDED" ? "god.fase.ENDED" : "god.fase.LOBBY";

  const lastB = war?.lastBattle ?? null;

  // ===== v32: datos del globo 3D =====
  const territoryColors3d = useMemo(() => {
    const acc: Record<string, string> = {};
    for (const tr of terrs) if (tr.owner) acc[tr.id] = tr.owner.color;
    return acc;
  }, [terrs]);

  const territoryNames3d = useMemo(() => {
    const acc: Record<string, string> = {};
    for (const tr of terrs) acc[tr.id] = tr.name;
    return acc;
  }, [terrs]);

  const units3d = useMemo(() => {
    if (!vista3d || !war?.territoryMeta) return [] as MilUnit[];
    const built = buildMilitaryUnits(
      war.territoryMeta,
      war.territories,
      war.players,
      unitCache,
      (k: UnitKind) => t(UNIT_KIND_KEY[k])
    );
    // volar a la unidad al tocarla
    return built.map((u) => ({
      ...u,
      onClick: () => setFlyTo({ lat: u.lat, lng: u.lng, altitude: 1.1, nonce: Date.now() }),
    }));
  }, [vista3d, war, t, unitCache]);

  const unitCounts = useMemo(() => {
    const c = { jet: 0, tank: 0, inf: 0 };
    for (const u of units3d) c[u.kind] += 1;
    return c;
  }, [units3d]);

  // arco + anillo del último frente activo
  const battleGeo = useMemo(() => {
    if (!lastB || !war?.territoryMeta) return null;
    const from = war.territoryMeta.find((x) => x.id === lastB.from);
    const to = war.territoryMeta.find((x) => x.id === lastB.to);
    if (!from || !to) return null;
    return { from, to, color: lastB.attackerColor };
  }, [war, lastB]);

  const battleArcs = useMemo<Globe3DArc[]>(() => {
    if (!battleGeo) return [];
    return [
      {
        startLat: battleGeo.from.lat,
        startLng: battleGeo.from.lng,
        endLat: battleGeo.to.lat,
        endLng: battleGeo.to.lng,
        color: [battleGeo.color, "#ff2d55"],
        stroke: 0.9,
        dashTime: 1600,
      },
    ];
  }, [battleGeo]);

  const battleMarkers = useMemo<Globe3DMarker[]>(() => {
    if (!battleGeo) return [];
    return [
      {
        id: `battle-${lastB?.seq ?? 0}`,
        lat: battleGeo.to.lat,
        lng: battleGeo.to.lng,
        color: "#ff3355",
        size: 0.55,
        alt: 0.03,
        ring: true,
        ringMax: 6,
        labelTag: `⚔ ${lastB?.attackerName ?? ""}`,
        label: `${lastB?.atkRoll ?? ""} vs ${lastB?.defRoll ?? ""} · ${lastB?.defenderName ?? ""}`,
      },
    ];
  }, [battleGeo, lastB]);

  const flyToFront = () => {
    if (!battleGeo) return;
    setFlyTo({ lat: battleGeo.to.lat, lng: battleGeo.to.lng, altitude: 1.45, nonce: Date.now() });
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title={t("god.title")}
        subtitle={t("god.subtitle")}
        icon={<Eye className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
        right={
          <span className={cn(
            "flex items-center gap-1.5 text-[9px] font-mono px-2 py-1 border uppercase tracking-widest",
            connected ? "border-green-hud text-green-hud bg-green-hud/20" : "border-red-hud text-red-hud bg-red-hud/20"
          )}>
            <Radio className="w-3 h-3" /> {connected ? t("god.live") : t("god.offline")}
          </span>
        }
      />

      {/* ===== franja de contadores globales ===== */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {([
          { icon: <Swords className="w-3 h-3" />, label: t("god.stat.fase"), value: t(phaseKey(god?.war.phase)), accent: god?.war.phase === "WAR" ? "text-red-hud" : "text-cyan-hud" },
          { icon: <Zap className="w-3 h-3" />, label: t("god.stat.ronda"), value: god ? `${god.war.round}` : "—", accent: "text-amber-hud" },
          { icon: <Users className="w-3 h-3" />, label: t("god.stat.operadores"), value: god ? `${god.war.humans}` : "—", accent: "text-green-hud" },
          { icon: <Eye className="w-3 h-3" />, label: t("god.stat.bots"), value: god ? `${god.war.bots}` : "—", accent: "text-violet-hud" },
          { icon: <Swords className="w-3 h-3" />, label: t("god.stat.batallas"), value: god ? `${god.war.battles}` : "—", accent: "text-red-hud" },
          { icon: <Globe2 className="w-3 h-3" />, label: t("god.stat.conectados"), value: `${totalOnline}`, accent: "text-cyan-hud" },
        ] as const).map((s, i) => (
          <div key={i} className="hud-panel p-2">
            <div className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-widest text-muted-foreground">
              {s.icon} {s.label}
            </div>
            <div className={cn("font-display text-sm font-bold mt-0.5", s.accent)}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-3">
        {/* ===== MAPA OMNISCIENTE ===== */}
        <div className="lg:col-span-3 hud-panel p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-hud flex items-center gap-1.5">
              {vista3d ? <Globe2 className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
              {vista3d ? t("god.map3d.title") : t("god.map.title")}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-mono text-muted-foreground uppercase mr-1">
                {god ? `${god.war.claimed}/${god.war.total} ${t("god.stat.mapa")}` : "…"}
              </span>
              <button
                type="button"
                onClick={() => setVista3d(false)}
                className={cn(
                  "px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-widest border active:scale-95",
                  !vista3d ? "border-cyan-hud text-cyan-hud bg-cyan-hud/15" : "border-border text-muted-foreground"
                )}
              >
                {t("god.vista.mapa")}
              </button>
              <button
                type="button"
                onClick={() => setVista3d(true)}
                className={cn(
                  "px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-widest border active:scale-95",
                  vista3d ? "border-cyan-hud text-cyan-hud bg-cyan-hud/15" : "border-border text-muted-foreground"
                )}
              >
                {t("god.vista.globo")}
              </button>
            </div>
          </div>

          {/* v32: vista conmutable — GLOBO 3D con unidades militares o mapa 2D táctico */}
          {vista3d ? (
            <>
              <div className="rounded-sm border border-cyan-hud/30 overflow-hidden bg-black/40">
                <GlobeMap3D
                  territoryColors={territoryColors3d}
                  territoryNames={territoryNames3d}
                  markers={battleMarkers}
                  arcs={battleArcs}
                  units3d={units3d}
                  viewMode="satelite"
                  autoRotate
                  rotateSpeed={0.28}
                  atmosphereColor="#38bdf8"
                  height="min(54vh, 500px)"
                  flyTo={flyTo}
                  onTerritoryClick={(tid) => {
                    const mt = terrs.find((x) => x.id === tid);
                    if (mt) setFlyTo({ lat: mt.lat, lng: mt.lng, altitude: 1.3, nonce: Date.now() });
                  }}
                  ariaLabel={t("god.map3d.title")}
                />
              </div>
              {/* leyenda de unidades + vuela al frente */}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] font-mono uppercase tracking-wider">
                <span className="flex items-center gap-1 text-cyan-hud"><Plane className="w-3 h-3" /> {t("god.unidad.avion")} ×{unitCounts.jet}</span>
                <span className="flex items-center gap-1 text-amber-hud"><Shield className="w-3 h-3" /> {t("god.unidad.tanque")} ×{unitCounts.tank}</span>
                <span className="flex items-center gap-1 text-green-hud"><Users className="w-3 h-3" /> {t("god.unidad.soldado")} ×{unitCounts.inf}</span>
                {battleGeo && (
                  <button
                    type="button"
                    onClick={flyToFront}
                    className="ml-auto px-1.5 py-0.5 border border-red-hud/60 text-red-hud active:scale-95"
                  >
                    ⚔ {t("god.volar.frente")}
                  </button>
                )}
                <span className="text-muted-foreground w-full sm:w-auto">{t("god.unidades.hint")}</span>
              </div>
            </>
          ) : (
          <>
          {/* proyección equirectangular: cada territorio es un punto en su lat/lng real */}
          <div
            className="relative w-full rounded-sm border border-cyan-hud/30 bg-black/40 overflow-hidden"
            style={{
              aspectRatio: "2 / 1",
              backgroundImage:
                "linear-gradient(rgba(34,211,238,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.08) 1px, transparent 1px)",
              backgroundSize: "10% 10%",
            }}
          >
            {/* línea del ecuador */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-cyan-hud/20" />
            {terrs.map((tr) => {
              const x = ((tr.lng + 180) / 360) * 100;
              const y = ((90 - tr.lat) / 180) * 100;
              const isLastAtk = lastB && (lastB.from === tr.id || lastB.to === tr.id);
              return (
                <div
                  key={tr.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div
                    className={cn("rounded-full border", isLastAtk && "blink-soft")}
                    style={{
                      width: `${Math.min(20, 6 + tr.troops)}px`,
                      height: `${Math.min(20, 6 + tr.troops)}px`,
                      backgroundColor: tr.owner ? `${tr.owner.color}66` : "rgba(120,130,140,0.25)",
                      borderColor: tr.owner ? tr.owner.color : "rgba(150,160,170,0.5)",
                    }}
                  />
                  {tr.troops > 0 && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 text-[7px] font-mono font-bold"
                      style={{ color: tr.owner ? tr.owner.color : "#9aa3ad" }}
                    >
                      {tr.troops}
                    </span>
                  )}
                  {/* tooltip omnisciente */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                    <div className="hud-panel px-2 py-1 whitespace-nowrap text-[8px] font-mono uppercase tracking-wider">
                      <span className="text-foreground">{tr.name}</span>
                      <span className="text-muted-foreground"> · {tr.owner ? tr.owner.name : t("god.map.neutral")} · {tr.troops}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* anillo de la última batalla */}
            {lastB && (() => {
              const mt = war?.territoryMeta.find((x) => x.id === lastB.to);
              if (!mt) return null;
              return (
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-red-hud blink-soft pointer-events-none"
                  style={{ left: `${((mt.lng + 180) / 360) * 100}%`, top: `${((90 - mt.lat) / 180) * 100}%` }}
                />
              );
            })()}
          </div>
          </>
          )}

          {/* leyenda de facciones + última batalla */}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {playersList.map((p) => (
              <span key={p.id} className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
                <span className={cn(p.connected ? "text-foreground" : "text-muted-foreground line-through")}>{p.name}</span>
                {p.isBot && <span className="text-violet-hud">·SIM</span>}
                <span className="text-muted-foreground">·{p.captures}</span>
              </span>
            ))}
          </div>
          {lastB && (
            <div className="mt-2 text-[9px] font-mono uppercase tracking-wider hud-panel px-2 py-1.5">
              <span className="text-red-hud font-bold">⚡ {t("god.map.batalla")}:</span>{" "}
              <span style={{ color: lastB.attackerColor }}>{lastB.attackerName}</span>
              <span className="text-muted-foreground"> {lastB.atkRoll}vs{lastB.defRoll} </span>
              <span style={{ color: lastB.defenderColor }}>{lastB.defenderName}</span>
              {lastB.captured && <span className="text-amber-hud"> · {t("god.map.capturado")}</span>}
            </div>
          )}
        </div>

        {/* ===== FEED GLOBAL — TODAS LAS SALAS ===== */}
        <div className="lg:col-span-2 hud-panel p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono uppercase tracking-widest text-violet-hud flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" /> {t("god.feed.title")}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-hud blink-soft" />
          </div>
          <div className="flex-1 space-y-1.5 overflow-y-auto thin-scroll max-h-[280px] lg:max-h-[340px]">
            {!god?.feed.length && (
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-6 text-center">
                {t("god.feed.vacio")}
              </div>
            )}
            {god?.feed.map((m, i) => (
              <div key={`${m.ts}-${i}`} className="text-[10px] leading-snug border-l-2 pl-2 py-0.5"
                style={{ borderColor: m.bot ? "rgba(139,92,246,0.5)" : "rgba(34,211,238,0.6)" }}>
                <span className="font-mono text-[7px] uppercase px-1 border border-border text-muted-foreground mr-1">{m.room}</span>
                <FlagBadge code={m.country} className="inline-block w-3.5 h-2.5 mr-1 align-middle" />
                <span className={cn("font-bold", m.bot ? "text-violet-hud" : "text-cyan-hud")}>{m.author}</span>
                {m.bot && <span className="text-[7px] text-violet-hud font-mono ml-0.5">{t("god.feed.sim")}</span>}
                <span className="text-foreground/90">: {m.body}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        {/* ===== ESCÁNER PLANETARIO — CONFLICTOS REALES ===== */}
        <div className="hud-panel p-3">
          <div className="flex items-center gap-1.5 mb-2 text-[9px] font-mono uppercase tracking-widest text-red-hud">
            <RadarIcon className="w-3 h-3" /> {t("god.scan.title")}
          </div>
          <div className="space-y-1.5">
            {!news.length && (
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-4 text-center">{t("god.scan.vacio")}</div>
            )}
            {news.map((n) => (
              <div key={n.id} className="flex items-start gap-2 text-[10px] leading-snug">
                <FlagBadge code={n.sourceCountry ?? undefined} className="w-4 h-3 mt-0.5 shrink-0" />
                <span className="text-foreground/90 flex-1">{n.title}</span>
                {n.tacticalTag && (
                  <span className={cn("text-[7px] font-mono px-1 border uppercase shrink-0 mt-0.5", TAG_COLOR[n.tacticalTag] ?? "border-border text-muted-foreground")}>
                    {n.tacticalTag}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== DIRECTOS OBSERVADOS ===== */}
        <div className="hud-panel p-3">
          <div className="flex items-center gap-1.5 mb-2 text-[9px] font-mono uppercase tracking-widest text-amber-hud">
            <MonitorPlay className="w-3 h-3" /> {t("god.streams.title")}
          </div>
          <div className="space-y-1.5">
            {!streams.length && (
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-4 text-center">{t("god.scan.vacio")}</div>
            )}
            {streams.map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-hud blink-soft shrink-0" />
                <FlagBadge code={s.country} className="w-4 h-3 shrink-0" />
                <span className="flex-1 truncate text-foreground/90">{s.title}</span>
                <span className="text-[8px] font-mono text-red-hud shrink-0">{s.viewers} 👁</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== v56.0 MURO INFINITO — TODO el archivo de inteligencia, sin límite ===== */}
      <div className="hud-panel p-3">
        <div className="flex items-center gap-1.5 mb-2 text-[9px] font-mono uppercase tracking-widest text-amber-hud">
          <InfinityIcon className="w-3 h-3" /> MURO INFINITO · TODO LO DETECTADO
          <span className="ml-auto text-[8px] text-muted-foreground">{wall.length} informes cargados</span>
        </div>
        <div className="space-y-1">
          {wall.map((n) => (
            <div key={n.id} className="flex items-start gap-2 text-[10px] leading-snug border-b border-border/40 pb-1">
              <FlagBadge code={n.sourceCountry ?? undefined} className="w-4 h-3 mt-0.5 shrink-0" />
              {n.url && n.url.startsWith("http") ? (
                <a href={n.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-foreground/90 hover:text-amber-hud transition-colors">
                  {n.title}
                </a>
              ) : (
                <span className="flex-1 text-foreground/90">{n.title}</span>
              )}
              {isBreaking(n.publishedAt) && (
                <span className="text-[7px] font-mono px-1 border border-red-hud text-red-hud bg-red-hud/15 uppercase shrink-0 mt-0.5 blink-soft">
                  ÚLTIMA HORA
                </span>
              )}
              {n.tacticalTag && (
                <span className={cn("text-[7px] font-mono px-1 border uppercase shrink-0 mt-0.5", TAG_COLOR[n.tacticalTag] ?? "border-border text-muted-foreground")}>
                  {n.tacticalTag}
                </span>
              )}
              <span className="text-[8px] font-mono text-muted-foreground shrink-0 mt-0.5 w-16 text-right truncate" title={n.source}>
                {newsAge(n.publishedAt) || n.source}
              </span>
            </div>
          ))}
          {!wall.length && !wallLoading && (
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 text-center">
              desliza para activar el muro…
            </div>
          )}
        </div>
        <div ref={wallSentinel} className="h-6 flex items-center justify-center">
          {wallLoading ? (
            <span className="text-[9px] font-mono uppercase tracking-widest text-amber-hud animate-pulse">descifrando más informes…</span>
          ) : wallMore ? (
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">↓ sigue bajando: hay más</span>
          ) : (
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">fin del archivo · {wall.length} informes descifrados</span>
          )}
        </div>
      </div>

      <div className="text-center text-[8px] font-mono uppercase tracking-widest text-muted-foreground">
        {t("god.note")}
      </div>
    </div>
  );
}
