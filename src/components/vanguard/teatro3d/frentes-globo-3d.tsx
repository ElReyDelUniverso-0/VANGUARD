"use client";

// ============================================================================
// GLOBO 3D REAL DE FRENTES EN VIVO (Globe.gl + NASA Blue/Black Marble + DEM)
// Motor WebGL real de globe.gl con texturas satelitales locales de la NASA,
// mapa de relieve topográfico real, fronteras vectoriales, balizas 3D,
// ondas tácticas, trazado de frentes reales, arcos VANGUARD y vuelo suave.
// ============================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import Globe, { type GlobeInstance } from "globe.gl";
import worldPaths from "@/lib/world-paths.json";
import type { FrenteVivo3D } from "@/lib/teatro-total-data";
import { esDispositivoMovilOLigero } from "./glb-engine";

type CapaGlobo = "satelite" | "nocturno" | "topografico";

interface FrontPoint {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  intensidad: number;
  esSel: boolean;
  color: string;
  altitud: number;
  radio: number;
}

interface FrontPath {
  id: string;
  frenteId: string;
  coords: [number, number][];
  color: string;
}

interface FrontArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: [string, string];
  nombre: string;
}

interface GeoCountryFeature {
  type: "Feature";
  properties: { name: string };
  geometry: {
    type: "MultiPolygon";
    coordinates: [number, number][][][];
  };
}

function buildCountryFeatures(): GeoCountryFeature[] {
  const countries =
    (worldPaths as { countries?: { name: string; polygons: [number, number][][] }[] })
      .countries ?? [];
  return countries.map((c) => ({
    type: "Feature",
    properties: { name: c.name },
    geometry: {
      type: "MultiPolygon",
      coordinates: c.polygons.map((poly) => [poly]),
    },
  }));
}

export function FrentesGlobo3D({
  frentes,
  activoId,
  onSelectFrente,
  altura = 390,
}: {
  frentes: FrenteVivo3D[];
  activoId: string;
  onSelectFrente: (id: string) => void;
  altura?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const selectCbRef = useRef(onSelectFrente);
  const [capa, setCapa] = useState<CapaGlobo>("satelite");
  const [autoRotate, setAutoRotate] = useState(false);

  const features = useMemo(() => buildCountryFeatures(), []);

  useEffect(() => {
    selectCbRef.current = onSelectFrente;
  }, [onSelectFrente]);

  // Montaje único del motor Globe.gl real
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const width = el.clientWidth || 680;
    el.innerHTML = "";

    const movil = esDispositivoMovilOLigero();
    const globe = new Globe(el, {
      rendererConfig: {
        antialias: !movil,
        powerPreference: movil ? "default" : "high-performance",
        alpha: false,
      },
      waitForGlobeReady: true,
      animateIn: !movil,
    });
    globeRef.current = globe;
    try {
      globe.renderer().setPixelRatio(movil ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
    } catch {
      // ignora si renderer aún no inicializó
    }

    globe
      .width(width)
      .height(altura)
      .backgroundColor("#04070f")
      .globeImageUrl("/assets/env/earth-blue-marble.jpg")
      .bumpImageUrl("/assets/env/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor("#38bdf8")
      .atmosphereAltitude(0.18)
      .showGraticules(true);

    // Material Phong realista con máscara de océanos para brillo solar real
    const loader = new THREE.TextureLoader();
    loader.load("/assets/env/earth-water.png", (waterTex) => {
      const mat = globe.globeMaterial() as THREE.MeshPhongMaterial;
      if (mat && "specularMap" in mat) {
        mat.specularMap = waterTex;
        mat.specular = new THREE.Color("#2b6cb0");
        mat.shininess = 18;
        mat.bumpScale = 6;
        mat.needsUpdate = true;
      }
    });

    // Fronteras geopolíticas vectoriales sutiles sobre el globo satelital
    globe
      .polygonsData(features)
      .polygonCapColor(() => "rgba(12, 24, 42, 0.08)")
      .polygonSideColor(() => "rgba(56, 189, 248, 0.04)")
      .polygonStrokeColor(() => "rgba(255, 201, 77, 0.32)")
      .polygonAltitude(0.004);

    // Configuración de cámara y controles
    const controls = globe.controls();
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 140;
    controls.maxDistance = 420;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.45;

    // Luz cálida adicional
    const scene = globe.scene();
    const key = new THREE.DirectionalLight(0xfff4df, 1.35);
    key.position.set(180, 120, 180);
    scene.add(key);

    // Vuelo inicial al frente seleccionado
    const inicial = frentes.find((f) => f.id === activoId) ?? frentes[0];
    if (inicial) {
      globe.pointOfView({ lat: inicial.lat, lng: inicial.lng, altitude: 1.75 }, 0);
    }

    const ro = new ResizeObserver(() => {
      if (!el || !globeRef.current) return;
      const w = el.clientWidth || width;
      globeRef.current.width(w).height(altura);
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      try {
        globe._destructor();
      } catch {
        // limpieza defensiva
      }
      globeRef.current = null;
    };
  }, [altura, features]);

  // Cambio de textura NASA (Día Blue Marble / Noche Black Marble / Topografía)
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    if (capa === "satelite") {
      globe
        .globeImageUrl("/assets/env/earth-blue-marble.jpg")
        .atmosphereColor("#38bdf8")
        .polygonStrokeColor(() => "rgba(255, 201, 77, 0.32)");
    } else if (capa === "nocturno") {
      globe
        .globeImageUrl("/assets/env/earth-night.jpg")
        .atmosphereColor("#22c55e")
        .polygonStrokeColor(() => "rgba(61, 220, 151, 0.35)");
    } else {
      globe
        .globeImageUrl("/assets/env/earth-topology.png")
        .atmosphereColor("#ffc94d")
        .polygonStrokeColor(() => "rgba(56, 189, 248, 0.45)");
    }
  }, [capa]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.controls().autoRotate = autoRotate;
  }, [autoRotate]);

  // Actualización reactiva de frentes, anillos, líneas de frente y arcos VANGUARD
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const points: FrontPoint[] = frentes.map((f) => {
      const esSel = f.id === activoId;
      return {
        id: f.id,
        nombre: f.nombre,
        lat: f.lat,
        lng: f.lng,
        intensidad: f.intensidad,
        esSel,
        color: esSel ? "#FFC94D" : f.intensidad >= 80 ? "#FF3B30" : "#FF9500",
        altitud: 0.04 + (f.intensidad / 100) * 0.14 + (esSel ? 0.04 : 0),
        radio: esSel ? 0.52 : 0.36,
      };
    });

    const paths: FrontPath[] = [];
    for (const f of frentes) {
      const esSel = f.id === activoId;
      for (let i = 0; i < f.frentes.length; i++) {
        const fl = f.frentes[i];
        if (fl.puntos.length < 2) continue;
        paths.push({
          id: `${f.id}-${i}`,
          frenteId: f.id,
          coords: fl.puntos,
          color: esSel ? "#FFC94D" : "#FF3B30",
        });
      }
    }

    // Arcos estratégicos desde Sede VANGUARD #1 (18.42, -70.03) hacia el teatro activo
    const activo = frentes.find((f) => f.id === activoId) ?? frentes[0];
    const arcs: FrontArc[] = activo
      ? [
          {
            startLat: 18.42,
            startLng: -70.03,
            endLat: activo.lat,
            endLng: activo.lng,
            color: ["#FFC94D", "#38BDF8"],
            nombre: `Enlace VANGUARD #1 → ${activo.nombre}`,
          },
        ]
      : [];

    globe
      .pointsData(points)
      .pointLat((d) => (d as FrontPoint).lat)
      .pointLng((d) => (d as FrontPoint).lng)
      .pointColor((d) => (d as FrontPoint).color)
      .pointAltitude((d) => (d as FrontPoint).altitud)
      .pointRadius((d) => (d as FrontPoint).radio)
      .pointLabel(
        (d) =>
          `<div style="background:rgba(7,10,18,0.92);border:1px solid #FFC94D;padding:6px 8px;border-radius:6px;font-family:monospace;font-size:11px;color:#F3EEE2">
            <strong style="color:#FFC94D">${(d as FrontPoint).nombre}</strong><br/>
            Intensidad: ${(d as FrontPoint).intensidad}/100 · Clic para enfocar
          </div>`
      )
      .onPointClick((d) => {
        const pt = d as FrontPoint;
        if (pt?.id) selectCbRef.current(pt.id);
      })
      .ringsData(points)
      .ringLat((d) => (d as FrontPoint).lat)
      .ringLng((d) => (d as FrontPoint).lng)
      .ringColor((d) => (t: number) => {
        const c = (d as FrontPoint).esSel ? "255,201,77" : "255,59,48";
        return `rgba(${c}, ${Math.max(0, 1 - t)})`;
      })
      .ringMaxRadius((d) => ((d as FrontPoint).esSel ? 5.2 : 3.2))
      .ringPropagationSpeed(2.2)
      .ringRepeatPeriod((d) => ((d as FrontPoint).esSel ? 950 : 1500))
      .pathsData(paths)
      .pathPoints((d) => (d as FrontPath).coords)
      .pathPointLat((p) => (p as [number, number])[0])
      .pathPointLng((p) => (p as [number, number])[1])
      .pathColor((d) => (d as FrontPath).color)
      .pathStroke(2.2)
      .pathPointAlt(0.015)
      .arcsData(arcs)
      .arcColor((d) => (d as FrontArc).color)
      .arcDashLength(0.45)
      .arcDashGap(0.25)
      .arcDashAnimateTime(1800)
      .arcStroke(0.6)
      .labelsData(points)
      .labelLat((d) => (d as FrontPoint).lat)
      .labelLng((d) => (d as FrontPoint).lng)
      .labelText((d) => (d as FrontPoint).nombre.split("·")[0].trim())
      .labelSize((d) => ((d as FrontPoint).esSel ? 1.15 : 0.78))
      .labelColor((d) => ((d as FrontPoint).esSel ? "#FFC94D" : "#E2E8F0"))
      .labelDotRadius((d) => ((d as FrontPoint).esSel ? 0.35 : 0.2))
      .labelAltitude(0.025)
      .onLabelClick((d) => {
        const pt = d as FrontPoint;
        if (pt?.id) selectCbRef.current(pt.id);
      });

    if (activo) {
      globe.pointOfView({ lat: activo.lat, lng: activo.lng, altitude: 1.68 }, 900);
    }
  }, [frentes, activoId]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-red-hud/35 bg-[#04070f]" style={{ height: altura }}>
      <div
        ref={hostRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Globo 3D NASA de frentes activos en vivo"
      />

      {/* Selector de capas satelitales reales NASA */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1 pointer-events-auto">
        {(
          [
            { id: "satelite" as CapaGlobo, label: "NASA SATÉLITE" },
            { id: "nocturno" as CapaGlobo, label: "TIERRA NOCTURNA" },
            { id: "topografico" as CapaGlobo, label: "RELIEVE DEM" },
          ] as const
        ).map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => setCapa(op.id)}
            className={`px-2 py-1 rounded font-mono text-[10px] font-bold border transition-colors ${
              capa === op.id
                ? "bg-[#FFC94D] text-black border-[#FFC94D]"
                : "bg-black/75 text-slate-200 border-white/20 hover:border-white/40"
            }`}
          >
            {op.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setAutoRotate((r) => !r)}
          className={`px-2 py-1 rounded font-mono text-[10px] font-bold border transition-colors ${
            autoRotate
              ? "bg-[#38BDF8] text-black border-[#38BDF8]"
              : "bg-black/75 text-slate-300 border-white/20 hover:border-white/40"
          }`}
        >
          {autoRotate ? "ÓRBITA ON" : "ÓRBITA OFF"}
        </button>
      </div>

      <div className="absolute bottom-2 left-2.5 z-10 pointer-events-none px-2 py-0.5 rounded bg-black/70 border border-white/10 font-mono text-[9.5px] text-slate-300">
        Motor: Globe.gl + NASA Blue/Black Marble &amp; Relieve Topográfico
      </div>
    </div>
  );
}
