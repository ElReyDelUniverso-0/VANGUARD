"use client";

// Vanguard v14 — GLOBO MAPA 3D REUTILIZABLE (globe.gl + poligonos GeoJSON reales).
// Reemplaza los mapas planos SVG en todos los paneles: territorios coloreados
// por faccion/dueno, marcadores con anillos de pulso, arcos animados, click en
// territorio, click en el globo (lat/lng) y rotacion automatica pausable.
import { useEffect, useRef } from "react";
import GlobeFactory from "globe.gl";
import { GLOBE_COUNTRY_POLYS, hexA, type CountryFeature } from "@/lib/world-geo";

export interface Globe3DMarker {
  id: string;
  lat: number;
  lng: number;
  color: string;
  size?: number;
  alt?: number;
  label?: string;
  labelTag?: string;
  ring?: boolean;
  ringMax?: number;
  onClick?: () => void;
}

export interface Globe3DArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color?: [string, string];
  stroke?: number;
  dashTime?: number;
}

interface PolyDatum extends CountryFeature {
  __tid?: string | null;
}

// v31 — modos de vista del planeta: mapa oscuro tactico, imagen satelital
// real (NASA Blue Marble) o la noche con luces de ciudades.
export type GlobeViewMode = "oscuridad" | "satelite" | "noche";
export interface GlobeFlyTo {
  lat: number;
  lng: number;
  altitude?: number;
  nonce: number;
}
const VIEW_TEXTURES: Record<GlobeViewMode, string> = {
  oscuridad: "/assets/globe/earth-dark.jpg",
  satelite: "/assets/globe/earth-blue-marble.jpg",
  noche: "/assets/globe/earth-night.jpg",
};

interface GlobePolygonsLike {
  polygonsData: (d: PolyDatum[]) => GlobePolygonsLike;
  polygonCapColor: (a: (d: object) => string) => GlobePolygonsLike;
  polygonSideColor: (a: (d: object) => string) => GlobePolygonsLike;
  polygonStrokeColor: (a: (d: object) => string) => GlobePolygonsLike;
  polygonAltitude: (a: (d: object) => number) => GlobePolygonsLike;
  polygonLabel: (a: (d: object) => string) => GlobePolygonsLike;
  onPolygonClick: (a: (d: object) => void) => GlobePolygonsLike;
  onGlobeClick: (a: (c: { lat: number; lng: number }) => void) => GlobePolygonsLike;
}

interface GlobePointsRingsLike {
  pointsData: (d: Globe3DMarker[]) => GlobePointsRingsLike;
  pointLat: (a: (d: object) => number) => GlobePointsRingsLike;
  pointLng: (a: (d: object) => number) => GlobePointsRingsLike;
  pointColor: (a: (d: object) => string) => GlobePointsRingsLike;
  pointAltitude: (a: (d: object) => number) => GlobePointsRingsLike;
  pointRadius: (a: (d: object) => number) => GlobePointsRingsLike;
  pointLabel: (a: (d: object) => string) => GlobePointsRingsLike;
  onPointClick: (a: (d: object) => void) => GlobePointsRingsLike;
  ringsData: (d: Globe3DMarker[]) => GlobePointsRingsLike;
  ringLat: (a: (d: object) => number) => GlobePointsRingsLike;
  ringLng: (a: (d: object) => number) => GlobePointsRingsLike;
  ringColor: (a: (d: object) => (t: number) => string) => GlobePointsRingsLike;
  ringMaxRadius: (a: (d: object) => number) => GlobePointsRingsLike;
  ringPropagationSpeed: (a: number) => GlobePointsRingsLike;
  ringRepeatPeriod: (a: number) => GlobePointsRingsLike;
}

interface GlobeArcsLike {
  arcsData: (d: Globe3DArc[]) => GlobeArcsLike;
  arcStartLat: (a: (d: object) => number) => GlobeArcsLike;
  arcStartLng: (a: (d: object) => number) => GlobeArcsLike;
  arcEndLat: (a: (d: object) => number) => GlobeArcsLike;
  arcEndLng: (a: (d: object) => number) => GlobeArcsLike;
  arcColor: (a: (d: object) => [string, string]) => GlobeArcsLike;
  arcDashLength: (a: number) => GlobeArcsLike;
  arcDashGap: (a: number) => GlobeArcsLike;
  arcDashAnimateTime: (a: number | ((d: object) => number)) => GlobeArcsLike;
  arcStroke: (a: number | ((d: object) => number)) => GlobeArcsLike;
  arcAltitudeAutoScale: (a: number) => GlobeArcsLike;
}

export interface GlobeMap3DProps {
  /** territoryId -> color hex; null/undefined = solo paises de fondo */
  territoryColors?: Record<string, string> | null;
  /** territoryId -> nombre visible en tooltip */
  territoryNames?: Record<string, string>;
  /** territorio resaltado (se eleva y brilla) */
  highlightTerritory?: string | null;
  /** callback al hacer click en un pais (territorio o no) */
  onTerritoryClick?: (territoryId: string | null, countryName: string) => void;
  markers?: Globe3DMarker[];
  arcs?: Globe3DArc[];
  height?: string;
  minHeight?: number;
  autoRotate?: boolean;
  rotateSpeed?: number;
  atmosphereColor?: string;
  pov?: { lat: number; lng: number; altitude?: number };
  onGlobeClick?: (lat: number, lng: number) => void;
  /** color de los paises sin territorio (fondo) */
  dimColor?: string;
  /** v31 textura del planeta (cambia en caliente sin recrear el globo) */
  viewMode?: GlobeViewMode;
  /** v31 vuelo de camara: cambia nonce -> animacion pointOfView */
  flyTo?: GlobeFlyTo | null;
  className?: string;
  ariaLabel?: string;
}

const DEFAULT_DIM = "rgba(148, 163, 205, 0.10)";

export function GlobeMap3D({
  territoryColors = null,
  territoryNames,
  highlightTerritory = null,
  onTerritoryClick,
  markers = [],
  arcs = [],
  height = "min(60vh, 600px)",
  minHeight = 340,
  autoRotate = true,
  rotateSpeed = 0.42,
  atmosphereColor = "#1E90FF",
  pov,
  onGlobeClick,
  dimColor = DEFAULT_DIM,
  viewMode = "oscuridad",
  flyTo = null,
  className,
  ariaLabel = "Globo 3D interactivo",
}: GlobeMap3DProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const clickRef = useRef(onTerritoryClick);
  const globeClickRef = useRef(onGlobeClick);
  useEffect(() => {
    clickRef.current = onTerritoryClick;
    globeClickRef.current = onGlobeClick;
  }, [onTerritoryClick, onGlobeClick]);

  // ===== init una vez =====
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const W = el.clientWidth || 800;
    const H = el.clientHeight || 520;

    const globe = new GlobeFactory(el, { animateIn: true })
      .width(W)
      .height(H)
      .backgroundColor("rgba(0,0,0,0)")
      .globeImageUrl(VIEW_TEXTURES[viewMode])
      .bumpImageUrl("/assets/globe/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor(atmosphereColor)
      .atmosphereAltitude(0.2)
      .showGraticules(false);

    globeRef.current = globe;
    globe.controls().autoRotate = autoRotate;
    globe.controls().autoRotateSpeed = rotateSpeed;
    globe.controls().enableDamping = true;
    globe.pointOfView(pov ?? { lat: 24, lng: 10, altitude: 2.15 });

    // click en el oceano/globo (para colocar objetos, ej. camaras)
    (globe as unknown as GlobePolygonsLike).onGlobeClick((c) => {
      globeClickRef.current?.(c.lat, c.lng);
    });

    // pausa de rotacion cuando la pestaña esta oculta (CPU/bateria)
    const onVis = () => {
      try {
        globe.controls().autoRotate = !document.hidden && autoRotate;
      } catch {
        /* noop */
      }
    };
    document.addEventListener("visibilitychange", onVis);

    // pausa la rotacion al pasar el raton (facilita clicar territorios)
    const setRot = (on: boolean) => {
      try {
        globe.controls().autoRotate = on && autoRotate;
      } catch {
        /* noop */
      }
    };
    const onEnter = () => setRot(false);
    const onLeave = () => setRot(true);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    const onResize = () => {
      globe.width(el.clientWidth || W).height(el.clientHeight || H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      try {
        (globe as unknown as { _destructor?: () => void })._destructor?.();
      } catch {
        /* noop */
      }
      el.innerHTML = "";
      globeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== v31 cambio de textura en caliente (oscuridad/satelite/noche) =====
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    try {
      globe.globeImageUrl(VIEW_TEXTURES[viewMode]);
    } catch {
      /* noop */
    }
  }, [viewMode]);

  // ===== v31 vuelo de camara (vistas rapidas / conflicto seleccionado) =====
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !flyTo) return;
    try {
      globe.pointOfView(
        { lat: flyTo.lat, lng: flyTo.lng, altitude: flyTo.altitude ?? 1.4 },
        950,
      );
    } catch {
      /* noop */
    }
  }, [flyTo]);

  // ===== poligonos de paises / territorios =====
  useEffect(() => {
    const globe = globeRef.current as unknown as GlobePolygonsLike | null;
    if (!globe) return;

    // v14 FIX: los datos deben ser las Feature GeoJSON directamente (globe.gl
    // lee d.geometry); los campos propios viajan en __tid / props de la feature.
    const polys: PolyDatum[] = GLOBE_COUNTRY_POLYS;

    globe
      .polygonsData(polys)
      .polygonCapColor((d) => {
        const f = d as PolyDatum;
        const tid = f.__tid ?? null;
        const color = tid && territoryColors ? territoryColors[tid] ?? null : null;
        if (!color) return tid ? hexA("#1E90FF", 0.12) : dimColor;
        return tid === highlightTerritory ? hexA(color, 0.92) : hexA(color, 0.58);
      })
      .polygonSideColor((d) => {
        const f = d as PolyDatum;
        const tid = f.__tid ?? null;
        const color = tid && territoryColors ? territoryColors[tid] ?? null : null;
        return color ? hexA(color, 0.28) : "rgba(30, 144, 255, 0.04)";
      })
      .polygonStrokeColor((d) => {
        const f = d as PolyDatum;
        const tid = f.__tid ?? null;
        const color = tid && territoryColors ? territoryColors[tid] ?? null : null;
        return color ? hexA(color, 0.95) : "rgba(120, 150, 220, 0.22)";
      })
      .polygonAltitude((d) => {
        const f = d as PolyDatum;
        const tid = f.__tid ?? null;
        if (tid && tid === highlightTerritory) return 0.085;
        return tid && territoryColors?.[tid] ? 0.038 : 0.005;
      })
      .polygonLabel((d) => {
        const f = d as PolyDatum;
        const tid = f.__tid ?? null;
        const color = tid && territoryColors ? territoryColors[tid] ?? null : null;
        const c = color ?? "#3EA6FF";
        const label = tid && territoryNames?.[tid] ? territoryNames[tid] : f.properties.name;
        return `<div style="font-family:monospace;background:#0A0A0Fee;border:1px solid ${c};padding:6px 9px;border-radius:2px;max-width:240px">
          <b style="color:${c}">${label}</b>${tid ? "" : `<br/><span style="color:#8A90A8">sin control</span>`}
        </div>`;
      })
      .onPolygonClick((d) => {
        const f = d as PolyDatum;
        clickRef.current?.(f.__tid ?? null, f.properties.name);
      });
  }, [territoryColors, territoryNames, highlightTerritory, dimColor]);

  // ===== marcadores + anillos =====
  useEffect(() => {
    const globe = globeRef.current as unknown as GlobePointsRingsLike | null;
    if (!globe) return;

    globe
      .pointsData(markers)
      .pointLat((d) => (d as Globe3DMarker).lat)
      .pointLng((d) => (d as Globe3DMarker).lng)
      .pointColor((d) => (d as Globe3DMarker).color)
      .pointAltitude((d) => (d as Globe3DMarker).alt ?? 0.04)
      .pointRadius((d) => (d as Globe3DMarker).size ?? 0.42)
      .pointLabel((d) => {
        const p = d as Globe3DMarker;
        return `<div style="font-family:monospace;background:#0A0A0Fee;border:1px solid ${p.color};padding:6px 9px;border-radius:2px">
          ${p.labelTag ? `<b style="color:${p.color}">${p.labelTag}</b><br/>` : ""}
          <span style="color:#F0F0F0">${p.label ?? p.id}</span>
        </div>`;
      })
      .onPointClick((d) => {
        (d as Globe3DMarker).onClick?.();
      });

    const rings = markers.filter((m) => m.ring);
    globe
      .ringsData(rings)
      .ringLat((r) => (r as Globe3DMarker).lat)
      .ringLng((r) => (r as Globe3DMarker).lng)
      .ringColor((r) => (t: number) => {
        const c = (r as Globe3DMarker).color;
        return `${c}${Math.round((1 - t) * 90 + 20).toString(16).padStart(2, "0")}`;
      })
      .ringMaxRadius((r) => (r as Globe3DMarker).ringMax ?? 4)
      .ringPropagationSpeed(2.1)
      .ringRepeatPeriod(950);
  }, [markers]);

  // ===== arcos =====
  useEffect(() => {
    const globe = globeRef.current as unknown as GlobeArcsLike | null;
    if (!globe) return;

    globe
      .arcsData(arcs)
      .arcStartLat((d) => (d as Globe3DArc).startLat)
      .arcStartLng((d) => (d as Globe3DArc).startLng)
      .arcEndLat((d) => (d as Globe3DArc).endLat)
      .arcEndLng((d) => (d as Globe3DArc).endLng)
      .arcColor((d) => (d as Globe3DArc).color ?? ["#1E90FF", "#00FF87"])
      .arcDashLength(0.45)
      .arcDashGap(0.2)
      .arcDashAnimateTime((d) => (d as Globe3DArc).dashTime ?? 3000)
      .arcStroke((d) => (d as Globe3DArc).stroke ?? 0.5)
      .arcAltitudeAutoScale(0.4);
  }, [arcs]);

  return (
    <div
      ref={wrapRef}
      className={className ?? "w-full relative"}
      style={{ height, minHeight }}
      aria-label={ariaLabel}
    />
  );
}
