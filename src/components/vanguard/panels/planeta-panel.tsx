"use client";

// v41 PLANETA VIVO — el mapa de TODO: un globo con las capas reales del planeta.
//   · EVENTOS NASA (EONET): ciclones, volcanes, incendios, inundaciones... abiertos AHORA
//   · AURORAS (NOAA SWPC): cinturón de probabilidad en vivo sobre el polo
//   · SISMOS (USGS): M4.5+ últimas 24h (reutiliza /api/geo)
//   · EEI (wheretheiss.at): la Estación Espacial Internacional pasa EN DIRECTO (poll 6s)
// Cada capa se enciende/apaga; clic en evento = volar hasta él; clic en tarjeta = fuente oficial.
// Doctrina: si una capa no tiene señal, las demás siguen — el panel JAMÁS queda vacío.

import { useEffect, useMemo, useRef, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Button } from "@/components/ui/button";
import {
  Globe2, RefreshCw, Satellite, Mountain, Flame, Waves, Snowflake,
  CloudLightning, Sun, Wind, Radio, ExternalLink, Sparkles, Orbit, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import type { Globe3DMarker, GlobeFlyTo, GlobeViewMode } from "@/components/vanguard/globe-map-3d";

const GlobeMap3D = dynamic(
  () => import("@/components/vanguard/globe-map-3d").then((m) => m.GlobeMap3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full rounded-sm border border-cyan-hud/30 bg-black/40 animate-pulse" style={{ height: "min(56vh, 560px)", minHeight: 340 }} />
    ),
  }
);

type EonetEvent = {
  id: string; title: string; category: string; categoryLabel: string;
  lat: number; lng: number; date: string; link: string; source?: string;
};
type AuroraZone = { lat: number; lng: number; prob: number };
type Quake = { mag: number; place: string; time: number; url: string; lat: number; lng: number; depth: number };
type LayersData = {
  ok: boolean; ts: string; auroraUpdated: string | null; auroraMax: number;
  events: EonetEvent[]; aurora: AuroraZone[]; sources: { eonet: boolean; aurora: boolean };
};
type IssPos = { lat: number; lng: number; velocity: number; altitude: number };

const CAT_ICON: Record<string, React.ReactNode> = {
  severeStorms: <CloudLightning className="w-3 h-3" />,
  volcanoes: <Mountain className="w-3 h-3" />,
  wildfires: <Flame className="w-3 h-3" />,
  floods: <Waves className="w-3 h-3" />,
  seaLakeIce: <Snowflake className="w-3 h-3" />,
  drought: <Sun className="w-3 h-3" />,
  dustHaze: <Wind className="w-3 h-3" />,
  landslides: <Mountain className="w-3 h-3" />,
  snow: <Snowflake className="w-3 h-3" />,
};

const CAT_COLOR: Record<string, string> = {
  severeStorms: "#22D3EE",
  volcanoes: "#EF4444",
  wildfires: "#F59E0B",
  floods: "#38BDF8",
  seaLakeIce: "#A5F3FC",
  drought: "#FBBF24",
  dustHaze: "#D4A017",
  landslides: "#A78BFA",
  snow: "#E2E8F0",
};

function quakeColor(mag: number): string {
  return mag >= 6.5 ? "#FF3B30" : mag >= 5.5 ? "#F59E0B" : "#00FF87";
}

function auroraColor(prob: number): string {
  return prob >= 60 ? "#FF7EDB" : prob >= 40 ? "#C084FC" : "#7DD3FC";
}

function agoTs(ts: string | number): string {
  const ms = Date.now() - (typeof ts === "number" ? ts : new Date(ts).getTime());
  const m = Math.floor(ms / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

type LayerKey = "evt" | "aur" | "qk" | "iss";

export function PlanetaPanel() {
  const [layers, setLayers] = useState<LayersData | null>(null);
  const [quakes, setQuakes] = useState<Quake[]>([]);
  const [iss, setIss] = useState<IssPos | null>(null);
  const [loading, setLoading] = useState(true);
  const [on, setOn] = useState<Record<LayerKey, boolean>>({ evt: true, aur: true, qk: true, iss: true });
  const [flyTo, setFlyTo] = useState<GlobeFlyTo | null>(null);
  const [viewMode, setViewMode] = useState<GlobeViewMode>("satelite");
  const abortRef = useRef<AbortController | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [rLayers, rGeo] = await Promise.all([
        fetch("/api/layers", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/geo", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      if (rLayers?.events) setLayers(rLayers);
      if (Array.isArray(rGeo?.quakes)) setQuakes(rGeo.quakes);
    } catch {
      /* doctrina: sin señal las capas quedan vacías pero el panel vive */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // EEI en directo: poll cada 6s directamente a wheretheiss.at (CORS abierto);
  // si cae, mantenemos la última posición — el marcador no parpadea.
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;
        const r = await fetch("https://api.wheretheiss.at/v1/satellites/25544", { signal: ac.signal });
        if (!r.ok) return;
        const d = await r.json();
        if (alive && typeof d?.latitude === "number") {
          setIss({ lat: d.latitude, lng: d.longitude, velocity: d.velocity, altitude: d.altitude });
        }
      } catch { /* señal perdida: seguimos con la última */ }
    };
    tick();
    const iv = setInterval(tick, 6000);
    return () => { alive = false; clearInterval(iv); abortRef.current?.abort(); };
  }, []);

  const toggle = (k: LayerKey) => setOn((s) => ({ ...s, [k]: !s[k] }));

  // ===== marcadores del globo por capa =====
  const markers = useMemo(() => {
    const out: Globe3DMarker[] = [];
    if (on.evt && layers) {
      for (const ev of layers.events) {
        const c = CAT_COLOR[ev.category] ?? "#22D3EE";
        const big = ev.category === "severeStorms" || ev.category === "volcanoes";
        out.push({
          id: `evt-${ev.id}`,
          lat: ev.lat,
          lng: ev.lng,
          color: c,
          size: big ? 0.55 : 0.4,
          alt: 0.045,
          labelTag: ev.categoryLabel.toUpperCase(),
          label: ev.title,
          ring: big,
          ringMax: big ? 4.5 : 0,
          onClick: () => window.open(ev.link, "_blank", "noopener"),
        });
      }
    }
    if (on.qk) {
      for (const q of quakes) {
        out.push({
          id: `qk-${q.url || q.time}`,
          lat: q.lat,
          lng: q.lng,
          color: quakeColor(q.mag),
          size: Math.min(0.28 + q.mag * 0.12, 0.8),
          alt: 0.03,
          labelTag: `M${q.mag.toFixed(1)} · USGS`,
          label: q.place,
          onClick: () => q.url && window.open(q.url, "_blank", "noopener"),
        });
      }
    }
    if (on.aur && layers) {
      for (let i = 0; i < layers.aurora.length; i++) {
        const a = layers.aurora[i];
        out.push({
          id: `aur-${i}`,
          lat: a.lat,
          lng: a.lng,
          color: auroraColor(a.prob),
          size: 0.14,
          alt: 0.02,
          label: `Aurora · probabilidad ${a.prob}%`,
        });
      }
    }
    if (on.iss && iss) {
      out.push({
        id: "iss",
        lat: iss.lat,
        lng: iss.lng,
        color: "#00FF87",
        size: 0.75,
        alt: 0.09,
        labelTag: "EEI EN DIRECTO",
        label: `${Math.round(iss.velocity).toLocaleString("es")} km/h · ${Math.round(iss.altitude)} km altitud`,
        ring: true,
        ringMax: 6,
      });
    }
    return out;
  }, [on, layers, quakes, iss]);

  const counts = useMemo(() => ({
    evt: layers?.events.length ?? 0,
    aur: layers?.aurora.length ?? 0,
    qk: quakes.length,
    iss: iss ? 1 : 0,
  }), [layers, quakes, iss]);

  const alive = (layers?.sources.eonet ? 1 : 0) + (layers?.sources.aurora ? 1 : 0) + (quakes.length ? 1 : 0) + (iss ? 1 : 0);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Planeta Vivo — el mapa de todo"
        subtitle="NASA · NOAA · USGS en directo — enciende y apaga las capas del planeta"
        icon={<Globe2 className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
        right={
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={() => load()} disabled={loading} className="h-7 px-2 text-[10px] font-mono uppercase">
              <RefreshCw className={cn("w-3 h-3 mr-1", loading && "animate-spin")} /> refrescar
            </Button>
            {(["oscuridad", "satelite", "noche"] as GlobeViewMode[]).map((v) => (
              <Button
                key={v}
                variant="outline"
                size="sm"
                onClick={() => setViewMode(v)}
                className={cn(
                  "h-7 px-2 text-[10px] font-mono uppercase",
                  viewMode === v ? "border-cyan-hud text-cyan-hud" : "text-muted-foreground"
                )}
              >
                {v === "satelite" ? "satélite" : v === "noche" ? "noche" : "táctico"}
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid lg:grid-cols-5 gap-4">
        {/* GLOBO */}
        <div className="lg:col-span-3 hud-corner relative overflow-hidden">
          <GlobeMap3D
            markers={markers}
            viewMode={viewMode}
            autoRotate
            rotateSpeed={0.32}
            atmosphereColor="#38BDF8"
            flyTo={flyTo}
            height="min(56vh, 560px)"
            minHeight={340}
            ariaLabel="Globo del planeta vivo con capas NASA, auroras, sismos y EEI"
          />
          <div className="absolute top-2 left-2 text-[10px] font-mono text-muted-foreground bg-background/80 px-2 py-1 hud-corner border-cyan-hud">
            PLANETA VIVO · {alive}/4 CAPAS CON SEÑAL · {markers.length} PUNTOS
          </div>
          {iss && on.iss && (
            <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-mono uppercase px-2 py-1 bg-background/85 border border-green-hud/60 text-green-hud">
              <Radio className="w-3 h-3" /> EEI EN VIVO
            </div>
          )}
        </div>

        {/* CONTROL DE CAPAS + LISTA */}
        <div className="lg:col-span-2 space-y-3">
          {/* capas */}
          <div className="hud-panel p-3">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-cyan-hud" />
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Capas del planeta</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {([
                { k: "evt", label: "Eventos NASA", sub: `${counts.evt} activos`, color: "#22D3EE", icon: <Satellite className="w-3.5 h-3.5" /> },
                { k: "aur", label: "Auroras", sub: layers?.auroraMax ? `pico ${layers.auroraMax}%` : "sin pico", color: "#C084FC", icon: <Sparkles className="w-3.5 h-3.5" /> },
                { k: "qk", label: "Sismos M4.5+", sub: `${counts.qk} en 24h`, color: "#F59E0B", icon: <Mountain className="w-3.5 h-3.5" /> },
                { k: "iss", label: "EEI en directo", sub: iss ? `${Math.round(iss.altitude)} km` : "adquiriendo…", color: "#00FF87", icon: <Orbit className="w-3.5 h-3.5" /> },
              ] as { k: LayerKey; label: string; sub: string; color: string; icon: React.ReactNode }[]).map((l) => (
                <button
                  key={l.k}
                  onClick={() => toggle(l.k)}
                  aria-pressed={on[l.k]}
                  className={cn(
                    "p-2 border text-left transition-all",
                    on[l.k] ? "bg-secondary/60" : "border-border/50 bg-secondary/10 opacity-60"
                  )}
                  style={on[l.k] ? { borderColor: `${l.color}88` } : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: l.color }}>{l.icon}</span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: on[l.k] ? l.color : undefined }}>{l.label}</span>
                  </div>
                  <div className="text-[9px] font-mono text-muted-foreground mt-0.5">{l.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* eventos NASA */}
          <div className="hud-panel p-3">
            <div className="flex items-center gap-2 mb-2">
              <Satellite className="w-4 h-4 text-amber" />
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Eventos naturales abiertos — NASA EONET</h3>
              <span className="ml-auto text-[9px] font-mono text-muted-foreground">30 días</span>
            </div>
            {!layers || layers.events.length === 0 ? (
              <p className="text-[11px] font-mono text-muted-foreground p-2 text-center">NASA sin señal — reintentando…</p>
            ) : (
              <ul className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {layers.events.slice(0, 14).map((ev) => {
                  const c = CAT_COLOR[ev.category] ?? "#22D3EE";
                  return (
                    <li key={ev.id}>
                      <button
                        onClick={() => setFlyTo({ lat: ev.lat, lng: ev.lng, altitude: 1.55, nonce: Date.now() })}
                        className="w-full flex items-center gap-2 group text-left"
                      >
                        <span style={{ color: c }} className="shrink-0">{CAT_ICON[ev.category] ?? <Globe2 className="w-3 h-3" />}</span>
                        <span className="flex-1 min-w-0 text-[11px] truncate group-hover:text-amber transition-colors">{ev.title}</span>
                        <span className="shrink-0 text-[9px] font-mono text-muted-foreground">{agoTs(ev.date)}</span>
                        <a
                          href={ev.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 text-muted-foreground hover:text-cyan-hud"
                          aria-label={`Abrir fuente NASA de ${ev.title}`}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {layers?.auroraUpdated && (
              <p className="text-[9px] font-mono text-muted-foreground mt-2">
                Predicción de auroras NOAA del {new Date(layers.auroraUpdated).toLocaleTimeString("es")} — cinturón polar visible en el globo.
              </p>
            )}
          </div>

          <p className="text-[9px] font-mono text-muted-foreground leading-relaxed px-1">
            Capas reales y públicas: NASA EONET (eventos naturales del planeta), NOAA Space Weather (probabilidad de aurora), USGS (sismos) y wheretheiss.at (posición de la Estación Espacial Internacional). Clic en un punto del globo para abrir la fuente oficial; las capas se refrescan solas cada 5 minutos.
          </p>
        </div>
      </div>
    </div>
  );
}
