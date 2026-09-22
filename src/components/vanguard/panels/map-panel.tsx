"use client";

import { useState, useMemo, useEffect } from "react";
import { CONFLICTS, type AlertLevel } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map as MapIcon, Crosshair, Layers, AlertTriangle, X, Users, HeartPulse, Flag, Video,
  Bomb, Pill, Skull, Route, Globe2, Satellite, Moon, LocateFixed, ScanEye, Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { WorldMapSVG, type MapRoute } from "@/components/vanguard/world-map-svg";
const Globe3D = dynamic(
  () => import("@/components/vanguard/globe-3d").then((m) => m.Globe3D),
  { ssr: false, loading: () => (
    <div className="w-full flex items-center justify-center" style={{ height: "min(62vh, 620px)", minHeight: 380 }}>
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-3 border-2 border-amber-hud border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">cargando motor 3D WebGL...</p>
      </div>
    </div>
  ) }
);
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { getCameraModel } from "@/lib/camera-data";
import { useT } from "@/lib/i18n";
import { getRealtime, peekRealtime } from "@/lib/realtime";
// v33 ESCUELA DE GUERRA — vista MILITAR 3D dentro del mapa informativo:
// el mismo globo satelital del Ojo de Dios con aviones/tanques/infantería.
import { buildMilitaryUnits, newMilUnitCache, UNIT_KIND_KEY, type MilUnitCache, type UnitKind } from "@/lib/military-units";
import type { Globe3DUnit, GlobeFlyTo as GlobeMapFlyTo } from "@/components/vanguard/globe-map-3d";

const GlobeMap3D = dynamic(
  () => import("@/components/vanguard/globe-map-3d").then((m) => m.GlobeMap3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full rounded-sm border border-amber-hud/30 bg-black/40 animate-pulse" style={{ height: "min(62vh, 620px)", minHeight: 380 }} />
    ),
  }
);

// estado mínimo del Mundo de Guerra para pintar unidades (mp:state)
interface MilTerrMeta { id: string; name: string; lat: number; lng: number }
interface MilPlayer { id: string; name: string; color: string }
interface MilWarState {
  territoryMeta: MilTerrMeta[];
  territories: Record<string, { owner: string | null; troops: number }>;
  players: Record<string, MilPlayer>;
}

const levelColor: Record<AlertLevel, string> = {
  CRITICO: "text-red-hud bg-red-hud border-red-hud",
  TENSION: "text-amber bg-amber-hud border-amber-hud",
  INESTABILIDAD: "text-violet-hud bg-violet-hud border-violet-hud",
  VIGILANCIA: "text-cyan-hud bg-cyan-hud border-cyan-hud",
};

const levelDot: Record<AlertLevel, string> = {
  CRITICO: "bg-red-hud",
  TENSION: "bg-amber",
  INESTABILIDAD: "bg-violet-hud",
  VIGILANCIA: "bg-cyan-hud",
};

// ====== MODOS DE MAPA (v6): mas mapas = amenazas dedicadas ======
type MapMode = "GLOBAL" | "TERRORISMO" | "CARTELES" | "BANDAS";

interface ModeDef {
  label: string;
  desc: string;
  hex: string;
  textClass: string;
  borderClass: string;
  match: (tags: string[]) => boolean;
  routes: MapRoute[];
  legend: { label: string; color: string }[];
}

const MODES: Record<MapMode, ModeDef> = {
  GLOBAL: {
    label: "Global",
    desc: "Todos los frentes y camaras del operador",
    hex: "#f5a623",
    textClass: "text-amber",
    borderClass: "border-amber-hud",
    match: () => true,
    routes: [],
    legend: [
      { label: "CRITICO", color: "#ef4444" },
      { label: "TENSION", color: "#f59e0b" },
      { label: "INESTABILIDAD", color: "#a855f7" },
      { label: "VIGILANCIA", color: "#22d3ee" },
    ],
  },
  TERRORISMO: {
    label: "Terrorismo",
    desc: "Guerra global contra el terrorismo yihadista: celulas, insurgencia y atentados",
    hex: "#ef4444",
    textClass: "text-red-hud",
    borderClass: "border-red-hud",
    match: (tags) => tags.includes("terrorismo") || tags.includes("yihadismo"),
    routes: [
      { id: "t1", from: [34.5, 69.2], to: [33.0, 65.0], color: "#ef4444", label: "RIVALIDAD YIHADISTA" },
      { id: "t2", from: [12.0, 13.5], to: [3.0, 45.0], color: "#f97316", label: "EJE SAHEL-CUERNO" },
      { id: "t3", from: [34.5, 69.2], to: [53.0, 33.0], color: "#ef4444", label: "CELULAS EN EUROPA" },
    ],
    legend: [
      { label: "CELULA / INSURGENCIA", color: "#ef4444" },
      { label: "RUTA DE AFILIACION", color: "#f97316" },
    ],
  },
  CARTELES: {
    label: "Cárteles",
    desc: "Narcotrafico transnacional: rutas de fentanilo, cocaina y territorios en disputa",
    hex: "#f5a623",
    textClass: "text-amber",
    borderClass: "border-amber-hud",
    match: (tags) => tags.includes("narcotráfico") || tags.includes("cárteles") || tags.includes("paramilitares"),
    routes: [
      { id: "c1", from: [25.0, -107.5], to: [32.5, -114.8], color: "#f5a623", label: "RUTA FENTANILO" },
      { id: "c2", from: [7.0, -75.5], to: [20.7, -103.3], color: "#fbbf24", label: "CORREDOR COCAINA" },
      { id: "c3", from: [-22.9, -43.2], to: [14.5, -17.4], color: "#f59e0b", label: "PUENTE AFRICA-EUROPA" },
    ],
    legend: [
      { label: "CARTEL / GRUPO ARMADO", color: "#f5a623" },
      { label: "RUTA DE NARCOTRAFICO", color: "#fbbf24" },
    ],
  },
  BANDAS: {
    label: "Bandas",
    desc: "Crimen organizado urbano: pandillas, favelas y extorsion territorial",
    hex: "#a855f7",
    textClass: "text-violet-hud",
    borderClass: "border-violet-hud",
    match: (tags) => tags.includes("pandillas") || tags.includes("guerra urbana") || tags.includes("favelas") || tags.includes("extorsión"),
    routes: [
      { id: "b1", from: [18.5, -72.3], to: [-22.9, -43.2], color: "#a855f7", label: "RED PANDILLERA G9-CV" },
      { id: "b2", from: [7.0, -75.5], to: [18.5, -72.3], color: "#c084fc", label: "TRAFICO DE ARMAS" },
    ],
    legend: [
      { label: "ZONA DE BANDAS", color: "#a855f7" },
      { label: "RED DE CRIMEN", color: "#c084fc" },
    ],
  },
};

const MODE_ICON: Record<MapMode, React.ReactNode> = {
  GLOBAL: <MapIcon className="w-3 h-3" />,
  TERRORISMO: <Bomb className="w-3 h-3" />,
  CARTELES: <Pill className="w-3 h-3" />,
  BANDAS: <Skull className="w-3 h-3" />,
};

// v31 — modos de textura del globo 3D
const VIEW_MODES: { id: GlobeViewMode; label: string; icon: React.ReactNode; color: "amber" | "cyan" | "violet" }[] = [
  { id: "oscuridad", label: "Táctico", icon: <Crosshair className="w-3 h-3" />, color: "amber" },
  { id: "satelite", label: "Satélite", icon: <Satellite className="w-3 h-3" />, color: "cyan" },
  { id: "noche", label: "Noche", icon: <Moon className="w-3 h-3" />, color: "violet" },
];

export function MapPanel() {
  const { t } = useT();
  const [mode, setMode] = useState<MapMode>("GLOBAL");
  const [selected, setSelected] = useState<string | null>(null);
  const [showSat, setShowSat] = useState(false);
  const [showFronts, setShowFronts] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [selectedCam, setSelectedCam] = useState<string | null>(null);
  const [view3d, setView3d] = useState(true); // v14: el globo 3D es la vista por defecto
  const [viewMode, setViewMode] = useState<GlobeViewMode>("oscuridad"); // v31
  const [flyTo, setFlyTo] = useState<GlobeFlyTo | null>(null); // v31 vuelos de camara
  // v33 ESCUELA DE GUERRA — vista MILITAR 3D: unidades en vivo sobre el globo satelital
  const [milView, setMilView] = useState(false);
  const [milFlyTo, setMilFlyTo] = useState<GlobeMapFlyTo | null>(null);
  const [milWar, setMilWar] = useState<MilWarState | null>(null);
  const [milConnected, setMilConnected] = useState(() => !!peekRealtime()?.connected);
  const [unitCache] = useState<MilUnitCache>(() => newMilUnitCache());
  const recordOpenMap = useGameStore((s) => s.recordOpenMap);
  const cameras = useGameStore((s) => s.cameras);

  // v33: suscripción ligera al mp:state global (misma fuente que Vista Dios)
  useEffect(() => {
    const socket = getRealtime();
    if (!socket) return;
    const onConnect = () => setMilConnected(true);
    const onDisconnect = () => setMilConnected(false);
    const onWar = (s: {
      territoryMeta?: MilTerrMeta[];
      territories?: MilWarState["territories"];
      players?: MilWarState["players"];
    }) => {
      if (!s?.territoryMeta?.length) return;
      setMilWar({
        territoryMeta: s.territoryMeta,
        territories: s.territories ?? {},
        players: s.players ?? {},
      });
    };
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("mp:state", onWar);
    if (socket.connected) onConnect();
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("mp:state", onWar);
    };
  }, []);

  // datos del globo militar: colores por dueño + flota de unidades
  const milColors = useMemo(() => {
    if (!milWar) return {} as Record<string, string>;
    const acc: Record<string, string> = {};
    for (const tm of milWar.territoryMeta) {
      const st = milWar.territories[tm.id];
      const owner = st?.owner ? milWar.players[st.owner] : null;
      if (owner) acc[tm.id] = owner.color;
    }
    return acc;
  }, [milWar]);

  const milNames = useMemo(() => {
    if (!milWar) return {} as Record<string, string>;
    return Object.fromEntries(milWar.territoryMeta.map((tm) => [tm.id, tm.name]));
  }, [milWar]);

  const milUnits = useMemo(() => {
    if (!milWar) return [] as Globe3DUnit[];
    const built = buildMilitaryUnits(
      milWar.territoryMeta,
      milWar.territories,
      milWar.players,
      unitCache,
      (k: UnitKind) => t(UNIT_KIND_KEY[k])
    );
    return built.map((u) => ({
      ...u,
      onClick: () => setMilFlyTo({ lat: u.lat, lng: u.lng, altitude: 1.1, nonce: Date.now() }),
    }));
  }, [milWar, t, unitCache]);

  const milCounts = useMemo(() => {
    const c = { jet: 0, tank: 0, inf: 0 };
    for (const u of milUnits) c[u.kind] += 1;
    return c;
  }, [milUnits]);

  const modeDef = MODES[mode];
  const visibleConflicts = useMemo(() => CONFLICTS.filter((c) => modeDef.match(c.tags)), [modeDef]);
  const conflict = CONFLICTS.find((c) => c.id === selected);
  const customColors = useMemo(() => {
    if (mode === "GLOBAL") return undefined;
    return Object.fromEntries(visibleConflicts.map((c) => [c.id, modeDef.hex]));
  }, [mode, modeDef, visibleConflicts]);

  const stats = useMemo(() => {
    const avg = visibleConflicts.length
      ? Math.round(visibleConflicts.reduce((a, c) => a + c.intensity, 0) / visibleConflicts.length)
      : 0;
    const factions = new Set(visibleConflicts.flatMap((c) => c.factions)).size;
    const crit = visibleConflicts.filter((c) => c.level === "CRITICO").length;
    return { zonas: visibleConflicts.length, avg, factions, crit };
  }, [visibleConflicts]);

  const handleSelect = (id: string) => {
    setSelected(id);
    recordOpenMap(id);
    // v31: al elegir un frente, la camara vuela hasta el
    const c = CONFLICTS.find((x) => x.id === id);
    if (c) setFlyTo({ lat: c.lat, lng: c.lng, altitude: 1.55, nonce: Date.now() });
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Mapa global de conflictos"
        subtitle={`${modeDef.desc} · ${visibleConflicts.length} zonas en este modo · ${cameras.length} camaras propias`}
        icon={<MapIcon className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* v33: MILITAR 3D — el mapa estilo Google con aviones/tanques/soldados */}
            <ToggleChip active={milView} onClick={() => setMilView(!milView)} color="cyan" icon={<Plane className="w-3 h-3" />}>
              {t("god.militar")}
            </ToggleChip>
            {!milView && (
              <>
                <ToggleChip active={view3d} onClick={() => setView3d(!view3d)} color="amber" icon={<Globe2 className="w-3 h-3" />}>
                  Globo 3D
                </ToggleChip>
                {view3d && VIEW_MODES.map((v) => (
                  <ToggleChip key={v.id} active={viewMode === v.id} onClick={() => setViewMode(v.id)} color={v.color} icon={v.icon}>
                    {v.label}
                  </ToggleChip>
                ))}
              </>
            )}
            {mode === "GLOBAL" && !view3d && !milView && (
              <>
                <ToggleChip active={showFronts} onClick={() => setShowFronts(!showFronts)} color="amber" icon={<Crosshair className="w-3 h-3" />}>
                  Frentes
                </ToggleChip>
                <ToggleChip active={showCameras} onClick={() => setShowCameras(!showCameras)} color="cyan" icon={<Video className="w-3 h-3" />}>
                  Camaras
                </ToggleChip>
              </>
            )}
            {!view3d && !milView && (
              <ToggleChip active={showSat} onClick={() => setShowSat(!showSat)} color="green" icon={<Layers className="w-3 h-3" />}>
                Satelite
              </ToggleChip>
            )}
          </div>
        }
      />

      {/* selector de mapas de amenaza */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {(Object.keys(MODES) as MapMode[]).map((m) => {
          const d = MODES[m];
          const count = CONFLICTS.filter((c) => d.match(c.tags)).length;
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => { setMode(m); setSelected(null); }}
              className={cn(
                "hud-corner p-2.5 text-left border transition-all",
                active ? cn(d.borderClass, "bg-secondary/60 ring-1 ring-white/20") : "border-border/50 bg-secondary/20 hover:border-amber-hud/40"
              )}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span style={{ color: d.hex }}>{MODE_ICON[m]}</span>
                <span className={cn("text-[11px] font-mono font-bold uppercase tracking-wider", active ? d.textClass : "text-muted-foreground")}>
                  {d.label}
                </span>
                <span className="ml-auto text-[9px] font-mono px-1.5 border rounded-sm" style={{ borderColor: `${d.hex}55`, color: d.hex }}>
                  {count}
                </span>
              </div>
              <div className="text-[9px] font-mono text-muted-foreground line-clamp-1">{d.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* MAP */}
        <div className="lg:col-span-2 hud-corner relative overflow-hidden">
          {milView ? (
            /* v33 GLOBO MILITAR 3D: satélite + flota en vivo */
            <GlobeMap3D
              territoryColors={milColors}
              territoryNames={milNames}
              units3d={milUnits}
              viewMode="satelite"
              flyTo={milFlyTo}
              autoRotate={milUnits.length === 0}
              height="min(62vh, 620px)"
              minHeight={380}
              atmosphereColor="#2563eb"
            />
          ) : view3d ? (
            <Globe3D
              conflicts={visibleConflicts}
              selected={selected}
              onSelectConflict={handleSelect}
              cameras={mode === "GLOBAL" && showCameras ? cameras : []}
              routes={modeDef.routes}
              customColors={customColors}
              showCameras={mode === "GLOBAL" && showCameras}
              viewMode={viewMode}
              flyTo={flyTo}
            />
          ) : (
            <WorldMapSVG
              conflicts={visibleConflicts}
              selected={selected}
              onSelectConflict={handleSelect}
              cameras={mode === "GLOBAL" && showCameras ? cameras : []}
              selectedCamera={selectedCam}
              onSelectCamera={setSelectedCam}
              showSat={showSat}
              showFronts={showFronts}
              routes={modeDef.routes}
              customColors={customColors}
            />
          )}
          <div className="absolute top-2 left-2 text-[10px] font-mono text-muted-foreground bg-background/80 px-2 py-1 hud-corner border-amber-hud">
            {milView
              ? "GLOBO MILITAR 3D · UNIDADES EN VIVO"
              : view3d ? (viewMode === "satelite" ? "SATELITE · NASA BLUE MARBLE" : viewMode === "noche" ? "ORBITA NOCTURNA · LUCES DE CIUDADES" : "GLOBO 3D · WEBGL · ARRASTRA PARA ROTAR") : "LAT/LNG · MERCATOR · NE-110M"} · {mode}
          </div>
          {/* v33 overlay del globo militar: contador de flota + estado de señal */}
          {milView && (
            <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
              <span className={cn(
                "flex items-center gap-1 text-[9px] font-mono uppercase px-2 py-1 bg-background/85 border",
                milConnected ? "border-green-hud/60 text-green-hud" : "border-red-hud/60 text-red-hud"
              )}>
                <RadioDot live={milConnected} /> {milConnected ? "EN VIVO" : "SIN SEÑAL MP"}
              </span>
              <span className="flex items-center gap-2 text-[9px] font-mono uppercase px-2 py-1 bg-background/85 border border-cyan-hud/50 text-cyan-hud">
                <Plane className="w-3 h-3" /> {milCounts.jet} · <span className="text-amber">{milCounts.tank} ■</span> · <span className="text-violet-hud">{milCounts.inf} ⬤</span>
              </span>
              {milUnits.length === 0 && (
                <span className="text-[9px] font-mono uppercase px-2 py-1 bg-background/85 border border-amber-hud/50 text-amber max-w-[210px] text-right">
                  sin unidades — entra a Mundo de Guerra para desplegar flota
                </span>
              )}
            </div>
          )}
          {/* v31 vistas rapidas: vuelo de camara a los frentes mas calientes */}
          {view3d && visibleConflicts.length > 0 && (
            <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
              <button
                onClick={() => setFlyTo({ lat: 22, lng: 12, altitude: 2.1, nonce: Date.now() })}
                className="flex items-center gap-1 text-[9px] font-mono uppercase px-2 py-1 bg-background/85 border border-amber-hud/60 text-amber hover:bg-amber-hud/20 transition-colors"
              >
                <LocateFixed className="w-3 h-3" /> vista global
              </button>
              {[...visibleConflicts].sort((a, b) => b.intensity - a.intensity).slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  className="flex items-center gap-1 text-[9px] font-mono uppercase px-2 py-1 bg-background/85 border border-white/15 text-muted-foreground hover:text-amber hover:border-amber-hud/60 transition-colors max-w-[170px]"
                >
                  <ScanEye className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">volar: {c.name}</span>
                </button>
              ))}
            </div>
          )}
          <div className={cn("absolute bottom-2 right-2 text-[10px] font-mono bg-background/80 px-2 py-1 hud-corner", modeDef.textClass)} style={{ borderColor: `${modeDef.hex}66` }}>
            {stats.zonas} ZONAS · {stats.crit} CRITICAS
          </div>
          {/* Legend */}
          <div className="absolute bottom-2 left-2 bg-background/85 px-2 py-1.5 hud-corner border-amber-hud">
            {milView ? (
              <>
                <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Flota del Mundo de Guerra</div>
                <div className="flex flex-col gap-0.5">
                  <LegendRow color="#38bdf8" label={`${t("god.unidad.avion")} · ${milCounts.jet}`} />
                  <LegendRow color="#f59e0b" label={`${t("god.unidad.tanque")} · ${milCounts.tank}`} />
                  <LegendRow color="#a855f7" label={`${t("god.unidad.soldado")} · ${milCounts.inf}`} />
                </div>
              </>
            ) : (
              <>
                <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Leyenda · {modeDef.label}</div>
                <div className="flex flex-col gap-0.5">
                  {modeDef.legend.map((l) => (
                    <LegendRow key={l.label} color={l.color} label={l.label} />
                  ))}
                  {mode === "GLOBAL" && <LegendRow color="#22d3ee" label="TU CAMARA" hollow />}
                </div>
              </>
            )}
          </div>
        </div>

        {/* LISTA / STATS */}
        <div className="space-y-3">
          {/* stats de amenaza */}
          <div className="grid grid-cols-2 gap-2">
            <ThreatStat label="Zonas activas" value={String(stats.zonas)} hex={modeDef.hex} />
            <ThreatStat label="Intensidad media" value={`${stats.avg}%`} hex={modeDef.hex} />
            <ThreatStat label="Facciones implicadas" value={String(stats.factions)} hex={modeDef.hex} />
            <ThreatStat label="Nivel critico" value={String(stats.crit)} hex={modeDef.hex} />
          </div>

          {mode !== "GLOBAL" && (
            <div className={cn("hud-corner p-2.5 border", modeDef.borderClass)} style={{ background: `${modeDef.hex}0d` }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Route className="w-3.5 h-3.5" style={{ color: modeDef.hex }} />
                <span className={cn("text-[10px] font-mono font-bold uppercase", modeDef.textClass)}>Red activa · {modeDef.routes.length} rutas</span>
              </div>
              <div className="text-[9px] font-mono text-muted-foreground leading-relaxed">
                {modeDef.routes.map((r) => r.label).join(" · ")}
              </div>
            </div>
          )}

          <div className="hud-corner">
            <div className="p-3 border-b border-amber-hud/30 bg-secondary/50">
              <div className="text-[10px] font-mono text-muted-foreground uppercase">Indice de amenaza · {modeDef.label}</div>
              <div className="text-xs font-mono text-amber">Ordenado por intensidad</div>
            </div>
            <div className="max-h-[360px] overflow-y-auto thin-scroll">
              {visibleConflicts.length === 0 && (
                <div className="p-3 text-[10px] font-mono text-muted-foreground">Sin zonas registradas en este modo.</div>
              )}
              {[...visibleConflicts].sort((a, b) => b.intensity - a.intensity).map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  className={cn(
                    "w-full text-left p-3 border-b border-border/40 hover:bg-secondary/50 transition-colors flex items-start gap-2",
                    selected === c.id && "bg-amber-hud/30"
                  )}
                >
                  <FlagBadge code={c.flag} size="md" className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-mono font-bold truncate text-foreground">{c.name}</div>
                      <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border rounded-sm", levelColor[c.level])}>
                        {c.level}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{c.summary}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${c.intensity}%`,
                            background: mode === "GLOBAL" ? undefined : modeDef.hex,
                          }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground">{c.intensity}%</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CAMERA DETAIL */}
      <AnimatePresence>
        {selectedCam && mode === "GLOBAL" && (() => {
          const cam = cameras.find((c) => c.id === selectedCam);
          if (!cam) return null;
          const model = getCameraModel(cam.modelId);
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="hud-corner p-4 border-cyan-hud"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm border border-cyan-hud bg-cyan-hud/20 flex items-center justify-center">
                    <Video className="w-4 h-4 text-cyan-hud" />
                  </div>
                  <div>
                    <div className="text-base font-mono font-bold text-foreground">{cam.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {cam.id} · {model.name} · LAT {cam.lat.toFixed(1)} / LNG {cam.lng.toFixed(1)}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedCam(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs font-mono text-cyan-hud">
                Radio {model.radiusDeg}° · Intel {model.coinsPerMin}/min base · x{model.incomeMult} · {cam.eventsCaught} eventos · {cam.totalEarned} monedas generadas
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* SELECTED DETAIL */}
      <AnimatePresence>
        {conflict && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="hud-corner p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <FlagBadge code={conflict.flag} size="lg" />
                <div>
                  <div className="text-base font-mono font-bold text-foreground">{conflict.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {conflict.country} · desde {conflict.since}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <Stat label="Nivel de alerta" value={conflict.level} icon={<AlertTriangle className="w-3.5 h-3.5" />} color={levelColor[conflict.level].split(" ")[0]} />
              <Stat label="Intensidad" value={`${conflict.intensity}%`} icon={<Crosshair className="w-3.5 h-3.5" />} color="text-amber" />
              <Stat label="Bajas estimadas" value={conflict.casualties} icon={<Users className="w-3.5 h-3.5" />} color="text-red-hud" />
              <Stat label="Impacto civil" value={conflict.civilianImpact} icon={<HeartPulse className="w-3.5 h-3.5" />} color="text-violet-hud" />
            </div>

            <div className="text-sm text-foreground mb-3">{conflict.summary}</div>

            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div className="hud-corner p-3 bg-secondary/40">
                <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Facciones</div>
                <ul className="space-y-1">
                  {conflict.factions.map((f, i) => (
                    <li key={i} className="text-xs flex items-center gap-1.5 text-foreground">
                      <Flag className="w-3 h-3 text-amber" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="hud-corner p-3 bg-secondary/40">
                <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Situacion humanitaria</div>
                <div className="text-xs text-foreground">{conflict.humanitarian}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {conflict.tags.map((t) => (
                <span key={t} className="text-[10px] font-mono px-2 py-0.5 hud-corner border-amber-hud/40 text-amber">
                  #{t}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThreatStat({ label, value, hex }: { label: string; value: string; hex: string }) {
  return (
    <div className="hud-corner p-2.5 bg-secondary/40">
      <div className="text-[9px] font-mono text-muted-foreground uppercase truncate">{label}</div>
      <div className="text-lg font-mono font-bold" style={{ color: hex }}>{value}</div>
    </div>
  );
}

function Stat({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="hud-corner p-2 bg-secondary/40 flex items-center gap-2">
      <div className={cn("flex-shrink-0", color)}>{icon}</div>
      <div className="min-w-0">
        <div className="text-[9px] font-mono text-muted-foreground uppercase">{label}</div>
        <div className={cn("text-xs font-mono font-bold truncate", color)}>{value}</div>
      </div>
    </div>
  );
}

function LegendRow({ color, label, hollow = false }: { color: string; label: string; hollow?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-[9px] font-mono">
      <span
        className={cn("w-2 h-2 rounded-sm", hollow && "ring-1 ring-cyan-hud")}
        style={{ background: hollow ? "transparent" : color }}
      />
      <span className="text-muted-foreground uppercase">{label}</span>
    </div>
  );
}

// v33 puntito de señal del globo militar
function RadioDot({ live }: { live: boolean }) {
  return (
    <span className={cn(
      "w-1.5 h-1.5 rounded-full",
      live ? "bg-green-hud animate-pulse" : "bg-red-hud"
    )} />
  );
}

function ToggleChip({
  active,
  onClick,
  color,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color: "amber" | "red" | "cyan" | "violet" | "green";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const colors = {
    amber: "text-amber border-amber-hud bg-amber-hud/50",
    red: "text-red-hud border-red-hud bg-red-hud/50",
    cyan: "text-cyan-hud border-cyan-hud bg-cyan-hud/50",
    violet: "text-violet-hud border-violet-hud bg-violet-hud/50",
    green: "text-green-hud border-green-hud bg-green-hud/50",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-2 py-1 border rounded-sm text-[10px] font-mono font-bold uppercase transition-opacity",
        active ? colors[color] : "opacity-40"
      )}
    >
      {icon}
      {children}
    </button>
  );
}
