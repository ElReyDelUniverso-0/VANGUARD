"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { CONFLICTS, type AlertLevel } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map as MapIcon, Crosshair, Layers, AlertTriangle, X, Users, HeartPulse, Flag, Video,
  Bomb, Pill, Skull, Route, Globe2, Satellite, Moon, LocateFixed, ScanEye, Plane,
  Ship, Radiation, Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { WorldMapSVG, type MapRoute } from "@/components/vanguard/world-map-svg";
// v119 CRONOTEATRO: la INTEL EN VIVO de la casa también en el MAPA GRANDE —
// los cables de /api/news se emparejan a cada conflicto y se leen DENTRO
// de Vanguard con la SALA DE LECTURA (cero saltos a otras páginas).
import { LectorNoticia, type CableLectura } from "@/components/vanguard/lector-noticia";
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
// v86.0 CENTINELA: capas tácticas conmutables (bases, energía, exclusiones, bloqueos, población)
import { CAPAS_TACTICAS, capasActivas } from "@/lib/capas-tacticas";
// v87.0 EL DESPERTAR: patrullas militares reales recorriendo el tablero
import { PATRULLAS } from "@/lib/patrullas";
// v33 ESCUELA DE GUERRA — vista MILITAR 3D dentro del mapa informativo:
// el mismo globo satelital del Ojo de Dios con aviones/tanques/infantería.
import { buildMilitaryUnits, newMilUnitCache, UNIT_KIND_KEY, type MilUnit, type MilUnitCache, type UnitKind } from "@/lib/military-units";
// v51.2 — se importan GlobeViewMode y GlobeFlyTo (se usaban sin importar) y MilUnit
// para tipar milUnits (el campo kind se consume en milCounts).
import type { GlobeFlyTo, GlobeViewMode } from "@/components/vanguard/globe-map-3d";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { useSala3DContenido, type FilaContenido3D } from "@/components/vanguard/use-sala3d-contenido";

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

// ====== MODOS DE MAPA (v6 → v81): 6 mapas de amenaza ======
type MapMode = "GLOBAL" | "TERRORISMO" | "CARTELES" | "BANDAS" | "MARITIMO" | "NUCLEAR";

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
  // v81: MARÍTIMO — los puntos de estrangulamiento del comercio mundial
  MARITIMO: {
    label: "Marítimo",
    desc: "Guerra naval y comercio: estrechos, puntos de estrangulamiento y flotas en tensión",
    hex: "#38bdf8",
    textClass: "text-cyan-hud",
    borderClass: "border-cyan-hud",
    match: (tags) => tags.includes("naval") || tags.includes("marítimo") || tags.includes("comercio"),
    routes: [
      { id: "m1", from: [2.5, 101.4], to: [25.0, 57.0], color: "#38bdf8", label: "MALACA → ORMUZ" },
      { id: "m2", from: [25.0, 57.0], to: [29.9, 32.5], color: "#22d3ee", label: "ORMUZ → MAR ROJO" },
      { id: "m3", from: [12.5, 43.3], to: [31.2, 32.3], color: "#7dd3fc", label: "BAB EL-MANDEB → SUEZ" },
      { id: "m4", from: [23.0, 118.0], to: [25.0, 121.5], color: "#38bdf8", label: "PRIMERA CADENA" },
    ],
    legend: [
      { label: "TENSIÓN NAVAL", color: "#38bdf8" },
      { label: "RUTA COMERCIAL EN RIESGO", color: "#22d3ee" },
    ],
  },
  // v81: NUCLEAR — disuasión, corredores y potencias
  NUCLEAR: {
    label: "Nuclear",
    desc: "Disuasión y misiles: potencias armadas, corredores de lanzamiento y pruebas",
    hex: "#a3e635",
    textClass: "text-neon",
    borderClass: "border-neon-hud",
    match: (tags) => tags.includes("nuclear") || tags.includes("disuasión") || tags.includes("misiles"),
    routes: [
      { id: "n1", from: [66.5, 30.0], to: [66.5, -45.0], color: "#a3e635", label: "CORREDOR POLAR DE DISUASIÓN" },
      { id: "n2", from: [32.0, 53.0], to: [25.3, 55.3], color: "#bef264", label: "ARCO DEL GOLFO" },
      { id: "n3", from: [40.0, 128.0], to: [33.0, 128.0], color: "#a3e635", label: "MAR DE JAPÓN · PRUEBAS" },
    ],
    legend: [
      { label: "PODER NUCLEAR / DISUASIÓN", color: "#a3e635" },
      { label: "CORREDOR DE LANZAMIENTO", color: "#bef264" },
    ],
  },
};

const MODE_ICON: Record<MapMode, React.ReactNode> = {
  GLOBAL: <MapIcon className="w-3 h-3" />,
  TERRORISMO: <Bomb className="w-3 h-3" />,
  CARTELES: <Pill className="w-3 h-3" />,
  BANDAS: <Skull className="w-3 h-3" />,
  MARITIMO: <Ship className="w-3 h-3" />,
  NUCLEAR: <Radiation className="w-3 h-3" />,
};

// ====== v119 CRONOTEATRO: INTEL EN VIVO PARA EL MAPA GRANDE ======
// (los campos son los reales de /api/news: publishedAt ISO, source, tags)
interface CableRuta { url: string; title: string; publishedAt: string; source: string; tacticalTag?: string | null; conflictTag?: string | null; sourceCountry?: string | null }

function parseFecha119(s: string): Date | null {
  if (!s) return null;
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s);
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function haceCuanto119(s: string): string {
  const d = parseFecha119(s);
  if (!d) return "";
  const min = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (min < 60) return `HACE ${min} MIN`;
  const h = Math.round(min / 60);
  if (h < 36) return `HACE ${h} H`;
  return `HACE ${Math.round(h / 24)} D`;
}

/** Empareja cables con un conflicto por su nombre y sus tags (mismas claves del atlas v118). */
function emparejar119(nombre: string, tags: string[], cables: CableRuta[]): CableRuta[] {
  const t = nombre.toLowerCase();
  const claves = [t, ...tags.map((x) => x.toLowerCase())].filter((k) => k.length > 2);
  return cables
    .filter((c) => {
      const titulo = (c.title || "").toLowerCase();
      return claves.some((k) => titulo.includes(k));
    })
    .slice(0, 3);
}

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
  // v86.0 CAPAS TÁCTICAS: qué capas tiene encendidas el comandante
  const [capasOn, setCapasOn] = useState<Set<string>>(() => new Set());
  const [showSat, setShowSat] = useState(false);
  const [showFronts, setShowFronts] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [selectedCam, setSelectedCam] = useState<string | null>(null);
  const [view3d, setView3d] = useState(true); // v14: el globo 3D es la vista por defecto
  const [viewMode, setViewMode] = useState<GlobeViewMode>("oscuridad"); // v31
  const [flyTo, setFlyTo] = useState<GlobeFlyTo | null>(null); // v31 vuelos de camara
  // v33 ESCUELA DE GUERRA — vista MILITAR 3D: unidades en vivo sobre el globo satelital
  const [milView, setMilView] = useState(false);
  const [milFlyTo, setMilFlyTo] = useState<GlobeFlyTo | null>(null);
  const [milWar, setMilWar] = useState<MilWarState | null>(null);
  const [milConnected, setMilConnected] = useState(() => !!peekRealtime()?.connected);
  const [unitCache] = useState<MilUnitCache>(() => newMilUnitCache());
  const recordOpenMap = useGameStore((s) => s.recordOpenMap);
  const cameras = useGameStore((s) => s.cameras);
  // v119 CRONOTEATRO: la intel en vivo de la casa (misma fuente que el atlas)
  const [cables119, setCables119] = useState<CableRuta[]>([]);
  const [cargado119, setCargado119] = useState(false);
  const [cableSel119, setCableSel119] = useState<CableLectura | null>(null);

  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      try {
        const res = await fetch("/api/news", { cache: "no-store" });
        const j = await res.json();
        if (vivo && Array.isArray(j?.items)) {
          setCables119((j.items as Record<string, unknown>[]).map((it) => ({
            url: String(it.url ?? "#"),
            title: String(it.title ?? ""),
            publishedAt: String(it.publishedAt ?? ""),
            source: String(it.source ?? it.domain ?? "frente"),
            tacticalTag: (it.tacticalTag as string | null) ?? null,
            conflictTag: (it.conflictTag as string | null) ?? null,
            sourceCountry: (it.sourceCountry as string | null) ?? (it.sourcecountry as string | null) ?? null,
          })));
        }
      } catch { /* la casa sigue viva sin intel */ }
      if (vivo) setCargado119(true);
    };
    cargar();
    const id = setInterval(cargar, 300000); // refresco cada 5 min
    return () => { vivo = false; clearInterval(id); };
  }, []);

  const abrirCable119 = useCallback((c: CableRuta) => {
    setCableSel119({
      id: c.url || c.title,
      title: c.title,
      url: c.url,
      source: c.source || "frente",
      publishedAt: parseFecha119(c.publishedAt)?.toISOString() || new Date().toISOString(),
      tacticalTag: c.tacticalTag && c.tacticalTag !== "None" ? c.tacticalTag : null,
      conflictTag: c.conflictTag && c.conflictTag !== "None" ? c.conflictTag : null,
      sourceCountry: c.sourceCountry ?? null,
    });
  }, []);

  // v87.0 DESPERTAR DEL TEATRO: arranque cinemático "ADQUIRIENDO SEÑAL SATELITAL"
  // una vez por sesión — el mapa se levanta como se levanta un cuartel general
  const [boot, setBoot] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem("vanguard-mapa-despertar");
  });
  useEffect(() => {
    if (!boot) return;
    const t1 = setTimeout(() => {
      setBoot(false);
      try { sessionStorage.setItem("vanguard-mapa-despertar", "1"); } catch {}
    }, 2400);
    return () => clearTimeout(t1);
  }, [boot]);

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
    if (!milWar) return [] as MilUnit[];
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
  // v119: intel del conflicto seleccionado + contador de badges por fila
  const intelSel119 = useMemo(
    () => (conflict ? emparejar119(conflict.name, conflict.tags, cables119) : []),
    [conflict, cables119],
  );
  const intelConteo119 = useMemo(() => {
    const mapa: Record<string, number> = {};
    visibleConflicts.forEach((c) => { mapa[c.id] = emparejar119(c.name, c.tags, cables119).length; });
    return mapa;
  }, [visibleConflicts, cables119]);
  const customColors = useMemo(() => {
    if (mode === "GLOBAL") return undefined;
    return Object.fromEntries(visibleConflicts.map((c) => [c.id, modeDef.hex]));
  }, [mode, modeDef, visibleConflicts]);

  // v81: DEFCON táctico — el termómetro de guerra del planeta, calculado en vivo
  const defcon = useMemo(() => {
    const crit = visibleConflicts.filter((c) => c.level === "CRITICO").length;
    const ten = visibleConflicts.filter((c) => c.level === "TENSION").length;
    if (crit >= 4) return { n: 1, label: "GUERRA TOTAL", color: "#FF3B30" };
    if (crit >= 2) return { n: 2, label: "ALERTA ROJA", color: "#FF6B35" };
    if (crit >= 1 || ten >= 3) return { n: 3, label: "MOVILIZACIÓN", color: "#FFD60A" };
    if (ten >= 1) return { n: 4, label: "VIGILANCIA", color: "#38BDF8" };
    return { n: 5, label: "CALMA TENSA", color: "#3DDC97" };
  }, [visibleConflicts]);

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

  // v168: PARIDAD 2D→3D — el tablero en volumen: DEFCON, modo activo y frentes reales
  const filas3D = useMemo<FilaContenido3D[]>(() => {
    const colorNivel: Record<AlertLevel, string> = { CRITICO: "#FF4D5E", TENSION: "#F5C542", INESTABILIDAD: "#7AB8FF", VIGILANCIA: "#7AB8FF" };
    const filas: FilaContenido3D[] = [
      {
        t: `DEFCON ${defcon.n} · ${defcon.label}`,
        color: defcon.color,
        p: (6 - defcon.n) * 20,
        d: `${stats.crit} zonas críticas · ${stats.zonas} zonas monitorizadas · ${stats.factions} facciones implicadas`,
      },
      {
        t: `MODO ${mode}`,
        v: `${visibleConflicts.length} ZONAS`,
        color: modeDef.hex,
        d: `${modeDef.desc} · ${cameras.length} cámaras propias en el tablero`,
      },
      ...[...visibleConflicts].sort((a, b) => b.intensity - a.intensity).slice(0, 10).map((c): FilaContenido3D => ({
        t: c.name,
        v: c.level,
        p: c.intensity,
        color: colorNivel[c.level],
        d: `${c.country} · desde ${c.since} · ${c.summary}`,
        a: "volar",
      })),
    ];
    return filas;
  }, [mode, modeDef, visibleConflicts, defcon, stats, cameras.length]);
  useSala3DContenido(
    "mapa",
    "MAPA GLOBAL DE CONFLICTOS",
    "#F5C542",
    `DEFCON ${defcon.n} · ${modeDef.label} · ${visibleConflicts.length} zonas en pantalla`,
    filas3D,
  );
  // v168: "volar" desde el 3D selecciona el mismo frente que la lista 2D
  // (offset 2: DEFCON + modo ocupan 0-1, los frentes empiezan en idx 2)
  useEffect(() => {
    const onAccion = (e: Event) => {
      const d = (e as CustomEvent<{ tab: string; accion: string; idx: number }>).detail;
      if (d?.tab !== "mapa" || d.accion !== "volar") return;
      const item = [...visibleConflicts].sort((a, b) => b.intensity - a.intensity)[d.idx - 2];
      if (item) handleSelect(item.id);
    };
    window.addEventListener("vg:sala3d-accion", onAccion);
    return () => window.removeEventListener("vg:sala3d-accion", onAccion);
  }, [visibleConflicts]);

  return (
    <div className="space-y-4">
      <HeroOro panel="mapa" />
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

      {/* selector de mapas de amenaza — v81: 6 mapas, escaneo al pasar el cursor */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {(Object.keys(MODES) as MapMode[]).map((m) => {
          const d = MODES[m];
          const count = CONFLICTS.filter((c) => d.match(c.tags)).length;
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => { setMode(m); setSelected(null); }}
              className={cn(
                "escaneo-carta hud-corner p-2.5 text-left border transition-all",
                active ? cn(d.borderClass, "bg-secondary/60 ring-1 ring-white/20") : "border-border/50 bg-secondary/20 hover:border-amber-hud/40"
              )}
              style={active ? { boxShadow: `0 0 18px ${d.hex}30, inset 0 0 12px ${d.hex}14` } : undefined}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span style={{ color: d.hex }} className={active ? "beacon" : undefined}>{MODE_ICON[m]}</span>
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

      {/* v81: BARRA DEFCON — termómetro de guerra vivo con baliza y segmentos que respiran */}
      <div className="hud-corner relative overflow-hidden p-2.5 border" style={{ borderColor: `${defcon.color}55`, background: `linear-gradient(90deg, ${defcon.color}0d, transparent 60%)` }}>
        <div className="flex items-center gap-3">
          <span className="beacon w-2 h-2 rounded-full flex-shrink-0" style={{ background: defcon.color, color: defcon.color }} />
          <span className="holo-flicker text-[10px] font-mono font-bold uppercase tracking-widest flex-shrink-0" style={{ color: defcon.color }}>
            DEFCON {defcon.n} · {defcon.label}
          </span>
          <div className="flex items-end gap-1 flex-1 max-w-[220px]">
            {[5, 4, 3, 2, 1].map((n) => {
              const encendido = n <= defcon.n;
              const segColor = n >= 2 ? "#FF3B30" : n === 3 ? "#FFD60A" : "#3DDC97";
              return (
                <span
                  key={n}
                  className={cn("flex-1 defcon-seg", !encendido && "opacity-15")}
                  style={{ height: 8 + (5 - n) * 1.6, background: encendido ? segColor : "#3a3f4a" }}
                />
              );
            })}
          </div>
          <span className="ml-auto text-[9px] font-mono text-muted-foreground uppercase truncate hidden sm:block">
            {stats.crit} críticas · {stats.zonas} zonas monitorizadas
          </span>
        </div>
      </div>

      {/* v86.0 CAPAS TÁCTICAS conmutables — infraestructura crítica sobre el tablero */}
      {!view3d && !milView && (
        <div className="hud-panel p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1 mr-1">
              <Layers className="w-3 h-3 text-amber" /> Capas tácticas
            </span>
            {CAPAS_TACTICAS.map((c) => {
              const on = capasOn.has(c.id);
              return (
                <button
                  key={c.id}
                  title={`${c.desc} · ${c.items.length} puntos`}
                  onClick={() => {
                    const next = new Set(capasOn);
                    if (on) next.delete(c.id);
                    else next.add(c.id);
                    setCapasOn(next);
                  }}
                  className={cn(
                    "px-2 py-1 text-[9.5px] font-mono uppercase tracking-widest border rounded-sm transition-all active:scale-95",
                    on ? "shadow-[0_0_12px_rgba(255,176,32,0.25)]" : "opacity-70 hover:opacity-100"
                  )}
                  style={{ borderColor: on ? `${c.color}88` : "rgba(120,120,140,0.3)", color: on ? c.color : "#8b93a7", background: on ? `${c.color}14` : "transparent" }}
                >
                  {on ? "▣ " : "▢ "}{c.nombre}
                </button>
              );
            })}
            {capasOn.size > 0 && (
              <button
                onClick={() => setCapasOn(new Set())}
                className="px-2 py-1 text-[9.5px] font-mono uppercase tracking-widest border border-white/15 text-muted-foreground hover:text-foreground rounded-sm transition-colors"
              >
                Limpiar
              </button>
            )}
            <span className="ml-auto text-[9px] font-mono text-muted-foreground hidden sm:block">
              {capasActivas(capasOn).length} elementos en el tablero
            </span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* MAP */}
        <div className="lg:col-span-2 hud-corner relative overflow-hidden">
          {/* v81: barrido satelital — el sensor peina el mapa de norte a sur */}
          <div className="barrido-map z-10" />
          {/* v87.0 ARRANQUE CINEMÁTICO: adquisición de señal satelital */}
          <AnimatePresence>
            {boot && (
              <motion.div
                key="despertar"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.7 } }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-[#04050b]/95 pointer-events-none"
              >
                <motion.div
                  initial={{ scale: 1.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="relative w-16 h-16"
                >
                  <span className="absolute inset-0 rounded-full border-2 border-amber-hud/70 animate-ping" />
                  <span className="absolute inset-2 rounded-full border border-amber-hud/50" />
                  <Satellite className="absolute inset-0 m-auto w-6 h-6 text-amber" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="font-mono text-[11px] uppercase tracking-[0.35em] text-amber"
                >
                  adquiriendo señal satelital
                </motion.p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 200 }}
                  transition={{ duration: 1.9, ease: "easeInOut" }}
                  className="h-0.5 bg-gradient-to-r from-transparent via-amber-hud to-transparent"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground"
                >
                  patrullas en el aire · flotas en el mar · la noche avanza
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
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
              capas={capasActivas(capasOn)}
              patrullas={PATRULLAS}
            />
          )}
          <div className="absolute top-2 left-2 text-[10px] font-mono text-muted-foreground bg-background/80 px-2 py-1 hud-corner border-amber-hud">
            {milView
              ? "GLOBO MILITAR 3D · UNIDADES EN VIVO"
              : view3d ? (viewMode === "satelite" ? "SATELITE · NASA BLUE MARBLE" : viewMode === "noche" ? "ORBITA NOCTURNA · LUCES DE CIUDADES" : "GLOBO 3D · WEBGL · ARRASTRA PARA ROTAR") : "LAT/LNG · MERCATOR · NE-110M"} · {mode}
          </div>
          {!milView && !view3d && (
            <div className="absolute top-2 right-2 text-[9px] font-mono bg-background/80 px-2 py-1 border border-cyan-hud/40 text-cyan-hud flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-hud animate-pulse" />
              {PATRULLAS.length} PATRULLAS EN EL TABLERO
            </div>
          )}
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
            <ThreatStat label="Zonas activas" value={String(stats.zonas)} hex={modeDef.hex} pct={Math.min(100, stats.zonas * 6)} />
            <ThreatStat label="Intensidad media" value={`${stats.avg}%`} hex={modeDef.hex} pct={stats.avg} />
            <ThreatStat label="Facciones implicadas" value={String(stats.factions)} hex={modeDef.hex} pct={Math.min(100, stats.factions * 5)} />
            <ThreatStat label="Nivel critico" value={String(stats.crit)} hex={modeDef.hex} pct={stats.zonas ? (stats.crit / stats.zonas) * 100 : 0} />
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
              {/* v119: la casa escucha — señales emparejadas a estas zonas */}
              <div className="mt-1 flex items-center gap-1.5 text-[8.5px] font-mono uppercase tracking-wider text-cyan-hud/80">
                <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-cyan-hud" />
                {cargado119 ? `${cables119.length} señales en escucha · refresh 5 min` : "sintonizando la casa..."}
              </div>
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
                      <div className="flex shrink-0 items-center gap-1">
                        {(intelConteo119[c.id] ?? 0) > 0 && (
                          <span className="flex items-center gap-1 rounded-full border border-cyan-hud/40 bg-cyan-hud/10 px-1.5 py-0.5 text-[8px] font-mono font-black text-cyan-hud">
                            <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-cyan-hud" />{intelConteo119[c.id]}
                          </span>
                        )}
                        <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border rounded-sm", levelColor[c.level])}>
                          {c.level}
                        </span>
                      </div>
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

            {/* v119: INTEL EN VIVO DE LA CASA — cables emparejados, se leen DENTRO de Vanguard */}
            <div className="mt-3 rounded-sm border border-cyan-hud/30 bg-cyan-hud/[0.04] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-hud">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-hud" />
                  <Radio className="w-3 h-3" /> intel en vivo · cables de la casa
                </span>
                <span className="text-[8.5px] font-mono text-muted-foreground">{cables119.length} señales · refresh 5 min</span>
              </div>
              {intelSel119.length === 0 ? (
                <div className="mt-2 text-[10px] font-mono text-muted-foreground">
                  {cargado119 ? "Sin cables de la casa para esta zona ahora mismo — el mundo sigue girando." : "Sintonizando /api/news..."}
                </div>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {intelSel119.map((c) => (
                    <button
                      key={c.url || c.title}
                      onClick={() => abrirCable119(c)}
                      className="w-full rounded-sm border border-cyan-hud/20 bg-black/40 px-2.5 py-2 text-left transition hover:border-cyan-hud/60 hover:bg-cyan-hud/10"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-mono font-bold text-foreground">{c.title}</span>
                        <span className="shrink-0 text-[8px] font-mono text-cyan-hud">{haceCuanto119(c.publishedAt)}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[8.5px] font-mono text-muted-foreground">
                        <span className="truncate">{c.source}</span>
                        {c.tacticalTag && c.tacticalTag !== "None" && (
                          <span className="shrink-0 rounded-sm border border-amber-hud/40 px-1 text-amber">{c.tacticalTag}</span>
                        )}
                        <span className="shrink-0 text-cyan-hud/70">LEER EN LA SALA →</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* v119: LA SALA DE LECTURA INTERNA — el cable se abre en Vanguard, nunca fuera */}
      <LectorNoticia cable={cableSel119} onCerrar={() => setCableSel119(null)} />
    </div>
  );
}

function ThreatStat({ label, value, hex, pct }: { label: string; value: string; hex: string; pct?: number }) {
  return (
    <div className="hud-corner p-2.5 bg-secondary/40">
      <div className="text-[9px] font-mono text-muted-foreground uppercase truncate">{label}</div>
      <div className="text-lg font-mono font-bold" style={{ color: hex }}>{value}</div>
      {/* v81: barra de amenaza que respira — el dato se siente, no solo se lee */}
      {typeof pct === "number" && (
        <div className="mt-1 h-0.5 bg-secondary/80 overflow-hidden">
          <div className="h-full" style={{ width: `${Math.max(4, Math.min(100, pct))}%`, background: hex, boxShadow: `0 0 6px ${hex}88` }} />
        </div>
      )}
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
