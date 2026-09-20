"use client";

// v13 — SALA OSINT: EL MUNDO EN TIEMPO REAL.
// Mapa con 15 capas activables, Modo OSINT, alerta de convergencia (3+ capas
// en la misma zona), popup con acciones (ficha / predecir / debatir / simular),
// termometro mundial 1-100 y ticker de alertas con typewriter.

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import type { Globe3DMarker, Globe3DArc } from "@/components/vanguard/globe-map-3d";
import { CONFLICTS } from "@/lib/game-data";
import {
  LAYERS, TENSIONS, MILITARY_FLIGHTS, WARSHIPS, CYBER_ATTACKS, GPS_JAM,
  SUBMARINE_CABLES, WEATHER_ZONES, NUCLEAR_SITES, MILITARY_BASES,
  PIPELINES, FIRE_HOTSPOTS, HISTORIC_EVENTS, layerCount,
  computeWorldTension, tensionColor, tensionLabel, type LayerId, type OsintPoint, type OsintRoute,
} from "@/lib/osint-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, X, Activity, Eye, LineChart, MessagesSquare, Swords, FileText, Radio, Satellite, TriangleAlert } from "lucide-react";

// v14 — SALA OSINT EN 3D: el mapa plano SVG se sustituye por un globo real
const GlobeMap3D = dynamic(
  () => import("@/components/vanguard/globe-map-3d").then((m) => m.GlobeMap3D),
  { ssr: false, loading: () => (
    <div className="hud-panel p-10 flex items-center justify-center text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
      Cargando globo 3D...
    </div>
  ) }
);

/** Distancia geodésica aproximada en km (haversine) para detectar convergencias. */
function distKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

interface AlertMsg { text: string; level: "CRITICO" | "MEDIO" | "INFO"; }

function buildAlerts(): AlertMsg[] {
  const crit = CONFLICTS.filter((c) => c.level === "CRITICO").slice(0, 3)
    .map((c) => ({ text: `CRITICO · ${c.name}: ${c.summary}`, level: "CRITICO" as const }));
  const tension = TENSIONS.slice(0, 3)
    .map((t) => ({ text: `TENSION · ${t.name}: ${t.detail}`, level: "MEDIO" as const }));
  const cyber = CYBER_ATTACKS.slice(0, 2)
    .map((c) => ({ text: `CIBER · ${c.label} — ${c.from[0].toFixed(0)}°→${c.to[0].toFixed(0)}°`, level: "INFO" as const }));
  return [...crit, ...tension, ...cyber];
}

// Ticker con efecto TYPEWRITER
function TypewriterAlert({ msgs }: { msgs: AlertMsg[] }) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState("");
  const setShownRef = useRef(setShown);
  const msg = msgs[idx % msgs.length];

  useEffect(() => {
    let i = 0;
    setShownRef.current("");
    const iv = setInterval(() => {
      i += 1;
      setShown(msg.text.slice(0, i));
      if (i >= msg.text.length) clearInterval(iv);
    }, 24);
    const next = setTimeout(() => setIdx((v) => v + 1), Math.max(4200, msg.text.length * 24 + 1600));
    return () => { clearInterval(iv); clearTimeout(next); };
  }, [msg]);

  const color = msg.level === "CRITICO" ? "text-crisis" : msg.level === "MEDIO" ? "text-amber" : "text-cyan-hud";
  return (
    <div className="flex items-center gap-2 hud-panel border-crisis-hud px-3 py-1.5 overflow-hidden">
      <span className={cn("flex items-center gap-1 flex-shrink-0 font-mono text-[9px] font-bold tracking-widest", color)}>
        <Radio className="w-3 h-3 blink-soft" /> EN VIVO
      </span>
      <span className={cn("font-mono text-[10px] sm:text-xs truncate typewriter-caret tracking-wide", color)}>
        {shown}
      </span>
    </div>
  );
}

// Termómetro mundial con historial 365d
function WorldThermometer({ tension }: { tension: number }) {
  const history = useMemo(() => {
    const arr: number[] = [];
    let v = 52;
    for (let i = 0; i < 120; i++) {
      v += Math.sin(i * 0.7) * 3.1 + ((i * 2654435761) % 7) - 3;
      arr.push(Math.max(18, Math.min(96, v)));
    }
    arr.push(tension);
    return arr;
  }, [tension]);

  const color = tensionColor(tension);
  const w = 160, h = 34;
  const pts = history.map((v, i) => `${(i / (history.length - 1)) * w},${h - (v / 100) * h}`).join(" ");

  return (
    <div className="hud-panel neon-border px-3 py-2 flex items-center gap-3" title="Termómetro mundial: tensión global 1-100">
      <div className="text-center flex-shrink-0">
        <div className="font-tech text-3xl font-bold tabular-nums leading-none" style={{ color }}>
          {tension}
        </div>
        <div className="font-mono text-[8px] text-muted-foreground tracking-widest">/100</div>
      </div>
      <div className="min-w-0">
        <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Termómetro mundial</div>
        <div className="font-tech text-xs font-bold" style={{ color }}>{tensionLabel(tension)}</div>
        <svg width={w} height={h} className="mt-0.5 max-w-full">
          <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" opacity="0.85" />
          <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.12" stroke="none" />
        </svg>
        <div className="font-mono text-[8px] text-muted-foreground">últimos 365 días</div>
      </div>
    </div>
  );
}

export function OsintPanel() {
  const [active, setActive] = useState<Set<LayerId>>(new Set(["conflictos", "tensiones", "sismos"]));
  const [selected, setSelected] = useState<OsintPoint | null>(null);
  const [sismos, setSismos] = useState<{ mag: number; place: string; lat: number; lng: number; time: number; depth: number }[]>([]);
  const [sismosLive, setSismosLive] = useState(false);
  const [usersOnline, setUsersOnline] = useState(12453);
  const [predToday, setPredToday] = useState(8921);

  // Sismos USGS en vivo
  const loadQuakes = useCallback(async () => {
    try {
      const res = await fetch("/api/earthquakes", { cache: "no-store" });
      const data = await res.json();
      if (data?.quakes?.length) {
        setSismos(data.quakes);
        setSismosLive(!!data.live);
      }
    } catch { /* fallback silencioso */ }
  }, []);

  useEffect(() => {
    const t0 = setTimeout(loadQuakes, 0);
    const iv = setInterval(loadQuakes, 300_000);
    // contadores vivos
    const drift = setInterval(() => {
      setUsersOnline((u) => Math.max(9000, u + Math.floor(Math.random() * 21) - 10));
      setPredToday((p) => Math.max(1000, p + Math.floor(Math.random() * 8)));
    }, 3000);
    return () => { clearTimeout(t0); clearInterval(iv); clearInterval(drift); };
  }, [loadQuakes]);

  // Modo OSINT: activar TODAS las capas la primera vez que se entra (demo guiada OFF por defecto)
  const toggleLayer = (id: LayerId) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const osintMode = () => setActive(new Set(LAYERS.map((l) => l.id)));
  const allOn = active.size === LAYERS.length;

  const quakePoints: OsintPoint[] = useMemo(
    () =>
      sismos.slice(0, 40).map((q, i) => ({
        id: `qk-${i}`,
        layer: "sismos" as const,
        name: `Sismo M${q.mag.toFixed(1)} — ${q.place}`,
        lat: q.lat,
        lng: q.lng,
        countries: [],
        intensity: Math.min(10, Math.max(2, Math.round(q.mag))),
        status: "MONITOREO" as const,
        since: new Date(q.time).toISOString().slice(0, 10),
        detail: `Magnitud ${q.mag.toFixed(1)} · profundidad ${Math.round(q.depth)}km · ${new Date(q.time).toLocaleString("es")}`,
      })),
    [sismos]
  );

  // Mapa id->puntos de cada capa
  const pointsByLayer = useMemo(() => {
    const conflictPts: OsintPoint[] = CONFLICTS.map((c) => ({
      id: c.id, layer: "conflictos" as const, name: c.name, lat: c.lat, lng: c.lng,
      countries: [c.flag], intensity: Math.max(1, Math.round(c.intensity / 10)),
      status: c.level === "CRITICO" ? "ACTIVO" as const : "MONITOREO" as const,
      since: c.since, detail: `${c.summary} — Facciones: ${c.factions.join(", ")}. Bajas: ${c.casualties}.`,
    }));
    return {
      conflictos: conflictPts,
      tensiones: TENSIONS,
      barcos: WARSHIPS,
      gps: GPS_JAM,
      clima: WEATHER_ZONES,
      nucleares: NUCLEAR_SITES,
      bases: MILITARY_BASES,
      incendios: FIRE_HOTSPOTS,
      historicos: HISTORIC_EVENTS,
      sismos: quakePoints,
    } as Partial<Record<LayerId, OsintPoint[]>>;
  }, [quakePoints]);

  const routesByLayer = useMemo(
    () =>
      ({
        vuelos: MILITARY_FLIGHTS,
        ciber: CYBER_ATTACKS,
        cables: SUBMARINE_CABLES,
        oleoductos: PIPELINES,
      }) as Partial<Record<LayerId, OsintRoute[]>>,
    []
  );

  // ====== DETECCION DE CONVERGENCIA: 3+ capas en la misma zona ======
  const convergences = useMemo(() => {
    const allPts: OsintPoint[] = [];
    for (const id of active) {
      const pts = pointsByLayer[id];
      if (pts) allPts.push(...pts);
    }
    const zones: { center: OsintPoint; layers: Set<LayerId>; count: number }[] = [];
    for (const p of allPts) {
      let zone = zones.find((z) => distKm(z.center.lat, z.center.lng, p.lat, p.lng) < 700);
      if (!zone) {
        zone = { center: p, layers: new Set(), count: 0 };
        zones.push(zone);
      }
      zone.layers.add(p.layer);
      zone.count += 1;
    }
    return zones.filter((z) => z.layers.size >= 3).sort((a, b) => b.layers.size - a.layers.size);
  }, [active, pointsByLayer]);

  const tension = computeWorldTension(CONFLICTS, convergences.length);

  const alerts = useMemo(() => buildAlerts(), []);

  // conteo activo por capa
  const counts = useMemo(() => {
    const m = {} as Record<LayerId, number>;
    for (const l of LAYERS) {
      if (l.id === "conflictos") m[l.id] = CONFLICTS.length;
      else if (l.id === "satelites") m[l.id] = 34;
      else if (l.id === "sismos") m[l.id] = sismos.length;
      else m[l.id] = layerCount(l.id);
    }
    return m;
  }, [sismos.length]);

  const activeLayerDefs = LAYERS.filter((l) => active.has(l.id));

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Sala OSINT"
        subtitle="El mundo en tiempo real · 15 capas de inteligencia"
        icon={<Radar className="w-4 h-4 text-electric" />}
        color="cyan"
        right={
          <Button
            onClick={osintMode}
            size="sm"
            className={cn("font-mono text-[10px] tracking-widest uppercase", allOn ? "neon-green-border" : "neon-border")}
            variant="outline"
          >
            <Satellite className="w-3.5 h-3.5 mr-1" /> Modo OSINT
          </Button>
        }
      />

      {/* HERO: contadores vivos + termómetro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 hud-panel section-gradient p-4 relative overflow-hidden">
          <div className="hero-parallax">
            <div className="font-display text-lg sm:text-2xl font-black tracking-[0.18em] text-soft">
              EL MUNDO EN TIEMPO REAL
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 max-w-md">
              <div>
                <div className="font-tech text-2xl font-bold text-crisis tabular-nums">{CONFLICTS.length}</div>
                <div className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">conflictos activos</div>
              </div>
              <div>
                <div className="font-tech text-2xl font-bold text-electric tabular-nums">{usersOnline.toLocaleString()}</div>
                <div className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">usuarios analizando</div>
              </div>
              <div>
                <div className="font-tech text-2xl font-bold text-neon tabular-nums">{predToday.toLocaleString()}</div>
                <div className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">predicciones hoy</div>
              </div>
            </div>
          </div>
        </div>
        <WorldThermometer tension={tension} />
      </div>

      {/* Ticker de alertas typewriter */}
      <TypewriterAlert msgs={alerts} />

      {/* Alertas de convergencia */}
      <AnimatePresence>
        {convergences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="hud-panel sombra-crisis border-crisis-hud px-3 py-2 flex items-start gap-2"
          >
            <TriangleAlert className="w-4 h-4 text-crisis flex-shrink-0 mt-0.5" />
            <div className="font-mono text-[10px] sm:text-xs text-crisis leading-relaxed">
              {convergences.slice(0, 2).map((z, i) => (
                <div key={i}>
                  CONVERGENCIA: {z.layers.size} capas coinciden cerca de {z.center.name} — zona calificada de ALTO RIESGO
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAPA + PANEL DE CAPAS */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3">
        {/* Mapa */}
        <div className="hud-panel radar-zone relative overflow-hidden">
          <div className="radar-sweep" />
          <OsintGlobe3D
            active={active}
            pointsByLayer={pointsByLayer}
            routesByLayer={routesByLayer}
            onSelect={setSelected}
 />
          {/* leyenda */}
          <div className="absolute bottom-1 left-2 right-2 flex flex-wrap gap-x-3 gap-y-0.5 pointer-events-none">
            {activeLayerDefs.slice(0, 6).map((l) => (
              <span key={l.id} className="font-mono text-[8px] tracking-wide" style={{ color: l.color }}>
                ● {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Panel lateral de capas */}
        <div className="hud-panel p-2 space-y-1 max-h-[62vh] overflow-y-auto thin-scroll">
          <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase px-1 pb-1">
            Capas del mapa · {active.size}/{LAYERS.length} activas
          </div>
          {LAYERS.map((l) => {
            const on = active.has(l.id);
            return (
              <button
                key={l.id}
                onClick={() => toggleLayer(l.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 border vg-transition text-left",
                  on ? "bg-secondary/70 border-border" : "border-transparent hover:bg-secondary/40"
                )}
                title={l.desc}
              >
                {/* switch */}
                <span
                  className={cn(
                    "relative w-7 h-3.5 rounded-full flex-shrink-0 transition-colors",
                    on ? "bg-neon-hud border border-neon-hud" : "bg-secondary border border-border"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-2.5 h-2.5 rounded-full vg-transition",
                      on ? "left-[15px]" : "left-0.5"
                    )}
                    style={{ background: on ? "#00FF87" : "#555" }}
                  />
                </span>
                <span className="text-xs w-4 text-center flex-shrink-0">{l.emoji}</span>
                <span className="flex-1 min-w-0 truncate font-mono text-[9px] sm:text-[10px] uppercase tracking-wide" style={{ color: on ? l.color : undefined }}>
                  {l.label}
                </span>
                <span className="font-tech text-[10px] font-bold tabular-nums text-muted-foreground flex-shrink-0">
                  {counts[l.id]}
                </span>
                {l.live && <span className="w-1.5 h-1.5 rounded-full bg-neon blink-soft flex-shrink-0" title="API real en vivo" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* POPUP DEL PUNTO SELECCIONADO */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 flex items-end sm:items-center justify-center p-3"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="hud-panel neon-border w-full max-w-lg p-4 max-h-[80vh] overflow-y-auto thin-scroll"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-mono text-[9px] tracking-widest uppercase" style={{ color: LAYERS.find((l) => l.id === selected.layer)?.color }}>
                    {LAYERS.find((l) => l.id === selected.layer)?.label}
                  </div>
                  <h3 className="font-tech text-lg font-bold leading-tight">{selected.name}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground" aria-label="Cerrar">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {selected.countries.map((c) => <FlagBadge key={c} code={c} />)}
                <span className={cn(
                  "px-1.5 py-0.5 border font-mono text-[9px] font-bold tracking-widest",
                  selected.status === "ACTIVO" ? "text-crisis border-crisis-hud bg-crisis-hud"
                  : selected.status === "NEGOCIACION" ? "text-amber border-amber-hud bg-amber-hud"
                  : selected.status === "RESUELTO" ? "text-green-hud border-green-hud bg-green-hud"
                  : "text-cyan-hud border-cyan-hud bg-cyan-hud"
                )}>
                  {selected.status}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground">desde {selected.since}</span>
              </div>

              {/* Intensidad 1-10 */}
              <div className="mb-2">
                <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-1">
                  <span>Intensidad</span>
                  <span className="font-tech text-sm font-bold" style={{ color: tensionColor(selected.intensity * 10) }}>
                    {selected.intensity}/10
                  </span>
                </div>
                <div className="h-1.5 bg-secondary overflow-hidden">
                  <div className="h-full" style={{ width: `${selected.intensity * 10}%`, background: `linear-gradient(90deg, #00FF87, #FFD60A 55%, #FF3B30)` }} />
                </div>
              </div>

              <p className="text-xs text-soft/90 leading-relaxed mb-3">{selected.detail}</p>

              {/* Ultimas 3 noticias del evento */}
              {(selected.news ?? defaultNews(selected)).map((n, i) => (
                <div key={i} className="border-l-2 border-electric-hud pl-2 py-1 mb-1">
                  <div className="text-[11px] text-soft leading-snug">{n.title}</div>
                  <div className="font-mono text-[8px] text-muted-foreground uppercase tracking-wide">{n.source} · {n.ago}</div>
                </div>
              ))}

              {/* Acciones */}
              <div className="grid grid-cols-2 gap-1.5 mt-3">
                <PopupAction icon={<FileText className="w-3.5 h-3.5" />} label="Ver ficha completa" to="enciclopedia" />
                <PopupAction icon={<LineChart className="w-3.5 h-3.5" />} label="Predecir resultado" to="predicciones" />
                <PopupAction icon={<MessagesSquare className="w-3.5 h-3.5" />} label="Debatir en foro" to="foros" />
                <PopupAction icon={<Swords className="w-3.5 h-3.5" />} label="Simular guerra" to="warsim" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 font-mono text-[9px] text-muted-foreground">
        <Eye className="w-3 h-3" /> Toca cualquier punto del mapa para abrir su ficha de inteligencia.
        {sismosLive && <span className="text-neon">· SISMOS USGS EN VIVO</span>}
      </div>
    </div>
  );
}

function defaultNews(p: OsintPoint) {
  return [
    { title: `Monitoreo continuo sobre ${p.name.split("—")[0].trim()}`, source: "REUTERS", ago: "hace 2h" },
    { title: `Analistas revisan implicaciones regionales del evento`, source: "BBC", ago: "hace 5h" },
    { title: `La comunidad OSINT discute nuevas imágenes satelitales`, source: "AP", ago: "hace 9h" },
  ];
}

function PopupAction({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="font-mono text-[9px] uppercase tracking-widest border-electric-hud text-electric hover:bg-electric-hud"
      onClick={() => window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: to }))}
    >
      {icon} <span className="ml-1">{label}</span>
    </Button>
  );
}

// ====== GLOBO OSINT 3D (v14): sustituye al mapa SVG plano ======
function OsintGlobe3D({
  active,
  pointsByLayer,
  routesByLayer,
  onSelect,
}: {
  active: Set<LayerId>;
  pointsByLayer: Partial<Record<LayerId, OsintPoint[]>>;
  routesByLayer: Partial<Record<LayerId, OsintRoute[]>>;
  onSelect: (p: OsintPoint) => void;
}) {
  const { markers, arcs } = useMemo(() => {
    const markers: Globe3DMarker[] = [];
    const arcs: Globe3DArc[] = [];
    for (const lid of Array.from(active)) {
      const color = LAYERS.find((l) => l.id === lid)?.color ?? "#1E90FF";
      const pts = pointsByLayer[lid];
      if (pts) {
        for (const p of pts) {
          markers.push({
            id: `${lid}-${p.id}`,
            lat: p.lat,
            lng: p.lng,
            color,
            size: 0.2 + p.intensity * 0.035,
            alt: 0.015,
            ring: p.intensity >= 7,
            ringMax: 3.5,
            label: `${p.name} — ${p.status}`,
            labelTag: `${lid.toUpperCase()} · INT ${p.intensity}/10`,
            onClick: () => onSelect(p),
          });
        }
      }
      const routes = routesByLayer[lid];
      if (routes) {
        for (const r of routes) {
          arcs.push({
            startLat: r.from[0],
            startLng: r.from[1],
            endLat: r.to[0],
            endLng: r.to[1],
            color: [color, `${color}44`],
            stroke: 0.7,
            dashTime: 2600,
          });
        }
      }
    }
    // capa de satélites: constelación en órbitas LEO/MEO/GEO
    if (active.has("satelites")) {
      for (let i = 0; i < 12; i++) {
        const band = i % 3;
        markers.push({
          id: `sat-${i}`,
          lat: band === 0 ? 0 : band === 1 ? 46 : -46,
          lng: -180 + i * 30,
          color: "#F0F0F0",
          size: 0.16,
          alt: 0.3,
          label: `SAT-${i + 1} · órbita ${band === 0 ? "GEO" : band === 1 ? "MEO" : "LEO"}`,
          labelTag: "SATELITE",
        });
      }
    }
    return { markers, arcs };
  }, [active, pointsByLayer, routesByLayer, onSelect]);

  return (
    <GlobeMap3D
      markers={markers}
      arcs={arcs}
      height="min(62vh, 620px)"
      minHeight={320}
      autoRotate
      rotateSpeed={0.3}
      ariaLabel="Globo 3D OSINT con 15 capas de inteligencia"
    />
  );
}
