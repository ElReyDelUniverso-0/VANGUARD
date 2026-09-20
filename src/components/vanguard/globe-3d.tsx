"use client";

// Vanguard v7 — GLOBO 3D interactivo (globe.gl / three.js).
// Frentes de conflicto como pilares luminosos, anillos de alerta critica,
// rutas de narcotrafico/yihadismo como arcos animados y camaras del operador.
// Arrastre para rotar, rueda para zoom, clic en un pilar = detalle del frente.
import { useEffect, useRef } from "react";
import Globe, { type GlobeInstance } from "globe.gl";
import type { ConflictRegion } from "@/lib/game-data";
import type { PlacedCamera } from "@/lib/game-store";
import type { MapRoute } from "@/components/vanguard/world-map-svg";

const LEVEL_HEX: Record<string, string> = {
  CRITICO: "#ef4444",
  TENSION: "#f59e0b",
  INESTABILIDAD: "#a855f7",
  VIGILANCIA: "#22d3ee",
};

interface GlobePoint {
  id: string;
  lat: number;
  lng: number;
  alt: number;
  color: string;
  kind: "conflict" | "camera";
  name: string;
}
interface GlobeArc {
  startLat: number; startLng: number; endLat: number; endLng: number; color: [string, string];
}
interface GlobeRing {
  lat: number; lng: number; color: string; id: string;
}

// formas encadenadas del globe.gl recortadas a lo que usa el panel (v10: metodos que se encadenan)
interface GlobePointsRingsLike {
  pointsData: (d: GlobePoint[]) => GlobePointsRingsLike;
  pointLat: (a: (d: object) => number) => GlobePointsRingsLike;
  pointLng: (a: (d: object) => number) => GlobePointsRingsLike;
  pointColor: (a: (d: object) => string) => GlobePointsRingsLike;
  pointAltitude: (a: (d: object) => number) => GlobePointsRingsLike;
  pointRadius: (a: (d: object) => number) => GlobePointsRingsLike;
  pointLabel: (a: (d: object) => string) => GlobePointsRingsLike;
  onPointClick: (a: (d: object) => void) => GlobePointsRingsLike;
  ringsData: (d: GlobeRing[]) => GlobePointsRingsLike;
  ringLat: (a: (d: object) => number) => GlobePointsRingsLike;
  ringLng: (a: (d: object) => number) => GlobePointsRingsLike;
  ringColor: (a: (d: object) => (t: number) => string) => GlobePointsRingsLike;
  ringMaxRadius: (a: (d: object) => number) => GlobePointsRingsLike;
  ringPropagationSpeed: (a: number) => GlobePointsRingsLike;
  ringRepeatPeriod: (a: number) => GlobePointsRingsLike;
}

interface GlobeArcsLike {
  arcsData: (d: GlobeArc[]) => GlobeArcsLike;
  arcStartLat: (a: (d: object) => number) => GlobeArcsLike;
  arcStartLng: (a: (d: object) => number) => GlobeArcsLike;
  arcEndLat: (a: (d: object) => number) => GlobeArcsLike;
  arcEndLng: (a: (d: object) => number) => GlobeArcsLike;
  arcColor: (a: (d: object) => [string, string]) => GlobeArcsLike;
  arcDashLength: (a: number) => GlobeArcsLike;
  arcDashGap: (a: number) => GlobeArcsLike;
  arcDashAnimateTime: (a: number) => GlobeArcsLike;
  arcStroke: (a: number) => GlobeArcsLike;
  arcAltitudeAutoScale: (a: number) => GlobeArcsLike;
}

export function Globe3D({
  conflicts,
  selected,
  onSelectConflict,
  cameras,
  routes,
  customColors,
  showCameras,
}: {
  conflicts: ConflictRegion[];
  selected: string | null;
  onSelectConflict: (id: string) => void;
  cameras: PlacedCamera[];
  routes: MapRoute[];
  customColors?: Record<string, string>;
  showCameras: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const onSelectRef = useRef(onSelectConflict);
  useEffect(() => {
    onSelectRef.current = onSelectConflict;
  }, [onSelectConflict]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const W = el.clientWidth || 800;
    const H = el.clientHeight || 560;

    const globe = new Globe(el, { animateIn: true })
      .width(W)
      .height(H)
      .backgroundColor("rgba(0,0,0,0)")
      .globeImageUrl("/assets/globe/earth-dark.jpg")
      .bumpImageUrl("/assets/globe/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor("#f5a623")
      .atmosphereAltitude(0.18)
      .showGraticules(true);

    globeRef.current = globe as unknown as GlobeInstance;
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.55;
    globe.controls().enableDamping = true;
    globe.pointOfView({ lat: 22, lng: 12, altitude: 2.1 });

    // click en el vacio no deselecciona (OrbitControls drag-safe)
    const onResize = () => {
      globe.width(el.clientWidth || W).height(el.clientHeight || H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      try {
        (globe as unknown as { _destructor?: () => void })._destructor?.();
      } catch { /* noop */ }
      el.innerHTML = "";
      globeRef.current = null;
    };
  }, []);

  // ===== datos: puntos (frentes + camaras) =====
  useEffect(() => {
    const globe = globeRef.current as unknown as GlobePointsRingsLike | null;
    if (!globe) return;

    const points: GlobePoint[] = conflicts.map((c) => ({
      id: c.id,
      lat: c.lat,
      lng: c.lng,
      alt: 0.06 + (c.intensity / 100) * 0.45,
      color: customColors?.[c.id] ?? LEVEL_HEX[c.level] ?? "#f5a623",
      kind: "conflict",
      name: c.name,
    }));
    if (showCameras) {
      for (const cam of cameras) {
        points.push({
          id: cam.id,
          lat: cam.lat,
          lng: cam.lng,
          alt: 0.05,
          color: "#22d3ee",
          kind: "camera",
          name: cam.name,
        });
      }
    }

    globe
      .pointsData(points)
      .pointLat((d) => (d as GlobePoint).lat)
      .pointLng((d) => (d as GlobePoint).lng)
      .pointColor((d) => (d as GlobePoint).color)
      .pointAltitude((d) => (d as GlobePoint).alt)
      .pointRadius((d) => ((d as GlobePoint).kind === "camera" ? 0.28 : (d as GlobePoint).id === selected ? 0.72 : 0.5))
      .pointLabel((d) => {
        const p = d as GlobePoint;
        return `
        <div style="font-family:monospace;background:#0b0e14ee;border:1px solid ${p.color};padding:6px 9px;border-radius:2px">
          <b style="color:${p.color}">${p.kind === "camera" ? "CAMARA" : "FRENTE"}</b><br/>
          <span style="color:#e5e7eb">${p.name}</span>
        </div>`;
      })
      .onPointClick((d) => {
        const p = d as GlobePoint;
        if (p.kind === "conflict") onSelectRef.current(p.id);
      });

    // anillos de alerta en criticos + seleccion
    const rings: GlobeRing[] = conflicts
      .filter((c) => c.level === "CRITICO" || c.id === selected)
      .map((c) => ({ lat: c.lat, lng: c.lng, color: customColors?.[c.id] ?? LEVEL_HEX[c.level] ?? "#ef4444", id: c.id }));
    globe
      .ringsData(rings)
      .ringLat((r) => (r as GlobeRing).lat)
      .ringLng((r) => (r as GlobeRing).lng)
      .ringColor((r) => (t: number) => `${(r as GlobeRing).color}${Math.round((1 - t) * 90 + 20).toString(16).padStart(2, "0")}`)
      .ringMaxRadius((r) => ((r as GlobeRing).id === selected ? 6 : 4))
      .ringPropagationSpeed(2.2)
      .ringRepeatPeriod(900);
  }, [conflicts, cameras, customColors, selected, showCameras]);

  // ===== datos: arcos (rutas del modo) =====
  useEffect(() => {
    const globe = globeRef.current as unknown as GlobeArcsLike | null;
    if (!globe) return;

    const arcs: GlobeArc[] = routes.map((r) => ({
      startLat: r.from[0], startLng: r.from[1],
      endLat: r.to[0], endLng: r.to[1],
      color: [r.color, `${r.color}55`],
    }));
    globe
      .arcsData(arcs)
      .arcStartLat((d) => (d as GlobeArc).startLat)
      .arcStartLng((d) => (d as GlobeArc).startLng)
      .arcEndLat((d) => (d as GlobeArc).endLat)
      .arcEndLng((d) => (d as GlobeArc).endLng)
      .arcColor((d) => (d as GlobeArc).color)
      .arcDashLength(0.45)
      .arcDashGap(0.18)
      .arcDashAnimateTime(3200)
      .arcStroke(0.5)
      .arcAltitudeAutoScale(0.4);
  }, [routes]);

  return (
    <div
      ref={wrapRef}
      className="w-full relative"
      style={{ height: "min(62vh, 620px)", minHeight: 380 }}
      aria-label="Globo 3D interactivo de conflictos"
    />
  );
}
