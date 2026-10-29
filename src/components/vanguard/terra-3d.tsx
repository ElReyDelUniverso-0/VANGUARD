"use client";

// v88.0 TERRA 3D — MAPA SATELITAL TRIDIMENSIONAL DE LOS CONFLICTOS (estilo
// Google Maps 3D, sin API key): MapLibre GL sobre imagen satelital REAL
// (Esri World Imagery) + TERRENO en relieve (AWS Terrain Tiles / terrarium),
// con inclinación 3D, rotación, brújula y VUELOS CINEMÁTICOS a cada zona
// caliente. El mapa deja de ser un papel: es una maqueta del planeta.

import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MLMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound";
import { Mountain, RotateCcw, Compass, Layers3, Plane } from "lucide-react";

export interface TerraZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  pitch: number;
  bearing: number;
  desc: string;
}

export const TERRA_ZONES: TerraZone[] = [
  { id: "donbas", name: "Donbás", lat: 48.0159, lng: 37.8029, zoom: 11.2, pitch: 68, bearing: 24, desc: "Trincheras, fortificaciones y ciudades fortaleza de la línea de contacto más larga de Europa." },
  { id: "gaza", name: "Franja de Gaza", lat: 31.5017, lng: 34.4668, zoom: 12.2, pitch: 66, bearing: -30, desc: "41 km de costa densamente poblada vista en relieve: bloques, túneles y la frontera de Rafah." },
  { id: "babelmandeb", name: "Bab el-Mandeb", lat: 12.5833, lng: 43.3333, zoom: 9.5, pitch: 58, bearing: 10, desc: "La garganta del comercio mundial en 3D: 26 km entre África y Arabia." },
  { id: "taiwan", name: "Estrecho de Taiwán", lat: 24.5, lng: 120.0, zoom: 8.8, pitch: 62, bearing: 200, desc: "La línea roja del Pacífico: 180 km que separan dos ejércitos permanentes." },
  { id: "kashmir", name: "Cachemira — LoC", lat: 34.0837, lng: 74.7973, zoom: 10.5, pitch: 74, bearing: 45, desc: "Las montañas más militarizadas del planeta, con relieve real a 7.000 m." },
  { id: "jartum", name: "Jartum", lat: 15.5007, lng: 32.5599, zoom: 11.8, pitch: 64, bearing: -15, desc: "La confluencia del Nilo Azul y Blanco, escenario del mayor desplazamiento del planeta." },
  { id: "sahel", name: "Lago Chad", lat: 13.0, lng: 14.0, zoom: 8.2, pitch: 52, bearing: 90, desc: "El cinturón que comparten Níger, Nigeria, Chad y Camerún desde el aire." },
  { id: "rakhine", name: "Rakhine", lat: 20.15, lng: 92.9, zoom: 9.8, pitch: 60, bearing: 120, desc: "Costa birmana donde la selva cubre frentes enteros de la guerra civil." },
  { id: "ormuz", name: "Ormuz", lat: 26.5667, lng: 56.25, zoom: 9.6, pitch: 60, bearing: -40, desc: "20% del petróleo del mundo pasa por un canal de 39 km de ancho." },
  { id: "kaliningrado", name: "Kaliningrado", lat: 54.7104, lng: 20.4522, zoom: 9.4, pitch: 62, bearing: 60, desc: "El exclave fortificado ruso dentro de la OTAN báltico, visto desde el satélite." },
];

interface Props {
  className?: string;
}

export function Terra3D({ className }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<TerraZone>(TERRA_ZONES[0]);
  const [showRelieve, setShowRelieve] = useState(true);
  const [coords, setCoords] = useState("");
  const [volando, setVolando] = useState(false);

  const volar = useCallback((z: TerraZone) => {
    const map = mapRef.current;
    if (!map) return;
    sfx.click();
    setVolando(true);
    setActive(z);
    map.flyTo({
      center: [z.lng, z.lat],
      zoom: z.zoom,
      pitch: z.pitch,
      bearing: z.bearing,
      duration: 2600,
      essential: true,
      curve: 1.6,
    });
    window.setTimeout(() => setVolando(false), 2700);
  }, []);

  // ---- init del mapa (una sola vez) ----
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mount,
      style: {
        version: 8,
        sources: {
          satelite: {
            type: "raster",
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256,
            attribution: "Esri · Maxar · Earthstar Geographics",
          },
          terreno: {
            type: "raster-dem",
            tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
            encoding: "terrarium",
            tileSize: 256,
            maxzoom: 13,
          },
        },
        layers: [{ id: "sat", type: "raster", source: "satelite" }],
      },
      center: [TERRA_ZONES[0].lng, TERRA_ZONES[0].lat],
      zoom: TERRA_ZONES[0].zoom,
      pitch: TERRA_ZONES[0].pitch,
      bearing: TERRA_ZONES[0].bearing,
      attributionControl: false,
      maxPitch: 80,
      dragRotate: true,
      keyboard: true,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
    // móvil: el gestor táctil ya rota con dos dedos; en desktop el control basta
    mapRef.current = map;

    map.on("load", () => {
      try {
        map.setTerrain({ source: "terreno", exaggeration: 1.35 });
      } catch { /* sin DEM disponible */ }
      // marcadores de las zonas
      TERRA_ZONES.forEach((z) => {
        const el = document.createElement("div");
        el.style.cssText = "width:14px;height:14px;border-radius:50%;background:#FF3B30;border:2px solid #FFD60A;box-shadow:0 0 12px #FF3B30AA;cursor:pointer;";
        el.title = z.name;
        el.addEventListener("click", () => volar(z));
        new maplibregl.Marker({ element: el }).setLngLat([z.lng, z.lat]).addTo(map);
      });
      setReady(true);
    });

    map.on("move", () => {
      const c = map.getCenter();
      setCoords(`${Math.abs(c.lat).toFixed(3)}°${c.lat >= 0 ? "N" : "S"} ${Math.abs(c.lng).toFixed(3)}°${c.lng >= 0 ? "E" : "O"}`);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [volar]);

  const toggleRelieve = () => {
    const map = mapRef.current;
    if (!map) return;
    sfx.click();
    const nuevo = !showRelieve;
    setShowRelieve(nuevo);
    try {
      if (nuevo) map.setTerrain({ source: "terreno", exaggeration: 1.35 });
      else map.setTerrain(null);
    } catch { /* noop */ }
  };

  const resetVista = () => {
    volar(active);
  };

  return (
    <div className={cn("relative hud-panel border-cyan-hud/40 overflow-hidden", className)}>
      {/* lienzo */}
      <div ref={mountRef} className="w-full h-[320px] sm:h-[460px] maplibregl" />

      {/* HUD superior: zona activa + coords */}
      <div className="absolute top-2 left-2 right-2 flex flex-wrap items-center gap-1.5 pointer-events-none z-10">
        <span className="px-2 py-1 bg-background/85 border border-cyan-hud/50 font-mono text-[9px] font-black uppercase tracking-widest text-cyan-hud backdrop-blur-sm">
          TERRA 3D · {active.name}
        </span>
        <span className="hidden sm:inline px-2 py-1 bg-background/85 border border-border font-mono text-[9px] text-muted-foreground backdrop-blur-sm tabular-nums">
          {coords}
        </span>
        {volando && (
          <span className="px-2 py-1 bg-amber/20 border border-amber font-mono text-[9px] font-black uppercase text-amber backdrop-blur-sm animate-pulse flex items-center gap-1">
            <Plane className="w-3 h-3" /> VOLANDO…
          </span>
        )}
      </div>

      {/* HUD inferior: leyenda de controles */}
      <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
        <span className="hidden sm:inline px-2 py-1 bg-background/80 border border-border/60 font-mono text-[8px] uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
          Arrastra · Ctrl+arrastrar = rota · rueda = zoom
        </span>
        <span className="sm:hidden px-2 py-1 bg-background/80 border border-border/60 font-mono text-[8px] uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
          1 dedo mueve · 2 dedos rota y acerca
        </span>
      </div>

      {/* controles laterales */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
        <button
          onClick={toggleRelieve}
          className={cn(
            "px-2 py-1.5 border font-mono text-[8px] font-black uppercase tracking-wider backdrop-blur-sm transition active:scale-95 flex items-center gap-1",
            showRelieve ? "border-neon text-neon bg-background/85" : "border-border text-muted-foreground bg-background/85"
          )}
          title="Relieve del terreno"
        >
          <Mountain className="w-3 h-3" /> RELIEVE
        </button>
        <button
          onClick={() => { sfx.click(); mapRef.current?.easeTo({ pitch: active.pitch, bearing: active.bearing, duration: 800 }); }}
          className="px-2 py-1.5 border border-border text-muted-foreground bg-background/85 font-mono text-[8px] font-black uppercase tracking-wider backdrop-blur-sm transition active:scale-95 flex items-center gap-1"
          title="Restaurar ángulo"
        >
          <Compass className="w-3 h-3" /> ÁNGULO
        </button>
        <button
          onClick={resetVista}
          className="px-2 py-1.5 border border-border text-muted-foreground bg-background/85 font-mono text-[8px] font-black uppercase tracking-wider backdrop-blur-sm transition active:scale-95 flex items-center gap-1"
          title="Volver a la zona"
        >
          <RotateCcw className="w-3 h-3" /> ZONA
        </button>
      </div>

      {/* selector de zonas (carrusel inferior) */}
      <div className="absolute bottom-2 right-2 left-2 sm:left-auto z-10 flex sm:flex-col gap-1 overflow-x-auto thin-scroll max-w-full sm:max-w-[220px]">
        {TERRA_ZONES.map((z) => (
          <button
            key={z.id}
            onClick={() => volar(z)}
            className={cn(
              "flex-shrink-0 px-2 py-1 border font-mono text-[8px] font-black uppercase tracking-wider backdrop-blur-sm transition active:scale-95 text-left",
              active.id === z.id ? "border-amber text-amber bg-background/90" : "border-border/70 text-muted-foreground bg-background/80 hover:text-foreground"
            )}
          >
            {z.name}
          </button>
        ))}
      </div>

      {!ready && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/90">
          <div className="text-center">
            <Layers3 className="w-6 h-6 text-cyan-hud animate-pulse mx-auto mb-1" />
            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Cargando imágenes del planeta…</div>
          </div>
        </div>
      )}

      {/* ficha de la zona activa (escritorio: bajo el mapa) */}
      <div className="sm:hidden sr-only">{active.desc}</div>
      <div className="hidden lg:block absolute bottom-14 right-3 max-w-[260px] z-10 pointer-events-none">
        <div className="px-2.5 py-1.5 bg-background/85 border border-amber-hud/40 backdrop-blur-sm">
          <div className="font-mono text-[9px] font-black uppercase text-amber tracking-wide">{active.name}</div>
          <div className="text-[9px] text-muted-foreground leading-snug mt-0.5">{active.desc}</div>
        </div>
      </div>
    </div>
  );
}
