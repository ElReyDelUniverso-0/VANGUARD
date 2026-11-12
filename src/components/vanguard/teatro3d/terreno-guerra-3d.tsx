"use client";

// ============================================================================
// MOTOR 3D DE TERRENO MUNDIAL Y SIMULACIÓN DE GUERRA (DOBLE MOTOR REAL)
//   Modo A (default): MapLibre GL JS 3D + Satélite Real ESRI/Carto + DEM Real
//                     AWS Terrarium + Hillshade + Capas Tácticas en vivo.
//   Modo B:           Arena Táctica PBR Three.js con Sky físico, Agua Shader
//                     (Water.js), HDRI PMREM, UnrealBloomPass y Modelos .GLB.
// ============================================================================

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { BiomaTeatro, ModoSensor, TeatroMundial, TipoUnidad3D } from "@/lib/teatro-total-data";
import {
  edificiosDeTeatro,
  elevacionEn,
  type SimEstado,
} from "@/lib/teatro-sim-engine";
import {
  aplicarEntornoPBR,
  crearPipelinePBR,
  esDispositivoMovilOLigero,
  instanciarUnidadGLB,
  type InstanciaUnidadGLB,
} from "./glb-engine";

type MotorTerreno = "satelite-dem" | "arena-glb";

const MUNDO_SIZE = 36;
const HALF = MUNDO_SIZE / 2;
const SPAN_DEG_Z = 0.085; // ±~9.5 km alrededor del centro del teatro

/** Construye un polígono GeoJSON circular aproximado (para radios nucleares reales). */
function circuloGeoJSON(
  cx: number,
  cz: number,
  radioNorm: number,
  teatro: TeatroMundial,
  pasos = 36
): [number, number][] {
  const coords: [number, number][] = [];
  for (let i = 0; i <= pasos; i++) {
    const a = (i / pasos) * Math.PI * 2;
    coords.push(normToLngLat(cx + Math.cos(a) * radioNorm, cz + Math.sin(a) * radioNorm, teatro));
  }
  return coords;
}

interface CiudadPin {
  nombre: string;
  nx: number;
  nz: number;
  estado: string;
}

function spanLng(lat: number): number {
  return SPAN_DEG_Z / Math.max(0.25, Math.cos((lat * Math.PI) / 180));
}

function normToLngLat(nx: number, nz: number, teatro: TeatroMundial): [number, number] {
  const sLng = spanLng(teatro.lat);
  const lng = teatro.lng + nx * sLng;
  const lat = teatro.lat - nz * SPAN_DEG_Z; // nz=-1 norte (+lat), nz=+1 sur (-lat)
  return [lng, lat];
}

function lngLatToNorm(lng: number, lat: number, teatro: TeatroMundial): [number, number] {
  const sLng = spanLng(teatro.lat);
  const nx = Math.max(-0.92, Math.min(0.92, (lng - teatro.lng) / sLng));
  const nz = Math.max(-0.88, Math.min(0.88, -(lat - teatro.lat) / SPAN_DEG_Z));
  return [nx, nz];
}

// Genera textura PBR de terreno de alta definición según bioma/elevación
function crearTexturaTerrenoHD(teatro: TeatroMundial, sensor: ModoSensor): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const img = ctx.createImageData(size, size);
    const data = img.data;

    for (let py = 0; py < size; py++) {
      const nz = (py / (size - 1)) * 2 - 1;
      for (let px = 0; px < size; px++) {
        const nx = (px / (size - 1)) * 2 - 1;
        const el = elevacionEn(nx, nz, teatro);
        // Microdetalle procedural de grano mineral
        const grain =
          Math.sin(px * 0.45 + py * 0.31) * 0.04 +
          Math.cos(px * 0.9 - py * 0.72) * 0.03;
        const e = el + grain;

        let r = 40;
        let g = 65;
        let b = 45;

        if (sensor === "nocturno") {
          const l = Math.max(0.1, Math.min(0.9, 0.3 + e * 0.45));
          r = 12 * l;
          g = 230 * l;
          b = 75 * l;
        } else if (sensor === "termico") {
          const cal = Math.max(0.08, Math.min(0.95, 0.3 + Math.abs(e) * 0.35));
          r = 25 + cal * 70;
          g = 35 + cal * 55;
          b = 110 + (1 - cal) * 90;
        } else if (teatro.bioma === "desierto") {
          r = 186 + e * 42;
          g = 148 + e * 36;
          b = 98 + e * 24;
        } else if (teatro.bioma === "artico") {
          r = 198 + e * 46;
          g = 218 + e * 32;
          b = 238 + e * 18;
        } else if (teatro.bioma === "selva") {
          r = 28 + e * 38;
          g = 88 + e * 62;
          b = 34 + e * 28;
        } else if (teatro.bioma === "urbano") {
          r = 62 + e * 44;
          g = 68 + e * 44;
          b = 78 + e * 44;
        } else if (teatro.bioma === "montana") {
          if (e > 0.68) {
            r = 224;
            g = 232;
            b = 244;
          } else if (e > 0.32) {
            r = 112 + e * 28;
            g = 104 + e * 26;
            b = 96 + e * 24;
          } else {
            r = 56 + e * 45;
            g = 86 + e * 48;
            b = 52 + e * 32;
          }
        } else {
          r = 52 + e * 56;
          g = 86 + e * 64;
          b = 48 + e * 44;
        }

        if (e < 0 && sensor !== "nocturno" && sensor !== "termico") {
          r = 16;
          g = 52;
          b = 88;
        }

        const idx = (py * size + px) * 4;
        data[idx] = Math.max(0, Math.min(255, r));
        data[idx + 1] = Math.max(0, Math.min(255, g));
        data[idx + 2] = Math.max(0, Math.min(255, b));
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    // Curvas de nivel topográficas finas en sensor táctico
    if (sensor === "tactico") {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.16)";
      ctx.lineWidth = 1;
      for (let g = 0; g <= size; g += 32) {
        ctx.beginPath();
        ctx.moveTo(g, 0);
        ctx.lineTo(g, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, g);
        ctx.lineTo(size, g);
        ctx.stroke();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// Registra iconos vectoriales OTAN/VANGUARD en MapLibre GL sin dependencias
function registrarIconosMapa(map: maplibregl.Map) {
  const tipos: { id: string; color: string; glyph: string }[] = [
    { id: "vg-a-tank", color: "#FFC94D", glyph: "M6,10 H26 V22 H6 Z M14,4 H18 V12 H14 Z" },
    { id: "vg-b-tank", color: "#FF3B30", glyph: "M6,10 H26 V22 H6 Z M14,4 H18 V12 H14 Z" },
    { id: "vg-a-air", color: "#38BDF8", glyph: "M16,3 L26,24 L16,19 L6,24 Z" },
    { id: "vg-b-air", color: "#FF3B30", glyph: "M16,3 L26,24 L16,19 L6,24 Z" },
    { id: "vg-a-inf", color: "#FFC94D", glyph: "M16,6 A6,6 0 1,0 16,18 A6,6 0 1,0 16,6 Z M7,27 C7,21 25,21 25,27 Z" },
    { id: "vg-b-inf", color: "#FF3B30", glyph: "M16,6 A6,6 0 1,0 16,18 A6,6 0 1,0 16,6 Z M7,27 C7,21 25,21 25,27 Z" },
  ];

  for (const t of tipos) {
    if (map.hasImage(t.id)) continue;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="rgba(7,10,18,0.88)" stroke="${t.color}" stroke-width="2.2"/>
      <path d="${t.glyph}" fill="${t.color}"/>
    </svg>`;
    const img = new Image(36, 36);
    img.onload = () => {
      try {
        if (!map.hasImage(t.id)) map.addImage(t.id, img);
      } catch {
        // mapa ya destruido
      }
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
}

function iconoParaUnidad(bando: "A" | "B", tipo: TipoUnidad3D): string {
  const p = bando === "A" ? "vg-a" : "vg-b";
  if (tipo === "jet" || tipo === "drone") return `${p}-air`;
  if (tipo === "soldier") return `${p}-inf`;
  return `${p}-tank`;
}

// ── COMPONENTE MAESTRO DEL TERRENO 3D ───────────────────────────────────────
export function TerrenoGuerra3D({
  teatro,
  simRef,
  sensor,
  onTerrenoClick,
  ciudades = [],
  altura = 440,
}: {
  teatro: TeatroMundial;
  simRef: React.MutableRefObject<SimEstado>;
  sensor: ModoSensor;
  onTerrenoClick?: (nx: number, nz: number) => void;
  ciudades?: CiudadPin[];
  altura?: number;
}) {
  const [motor, setMotor] = useState<MotorTerreno>("satelite-dem");
  const [demActivo, setDemActivo] = useState(true);
  const [edificios3d, setEdificios3d] = useState(true);
  const [orbitandoMap, setOrbitandoMap] = useState(false);
  const [modoEco, setModoEco] = useState<boolean>(() => esDispositivoMovilOLigero());

  const mapHostRef = useRef<HTMLDivElement>(null);
  const mapInstRef = useRef<maplibregl.Map | null>(null);
  const glHostRef = useRef<HTMLDivElement>(null);
  const sensorRef = useRef<ModoSensor>(sensor);
  const clickCbRef = useRef(onTerrenoClick);

  const moverCamaraMapa = (pitch: number, zoom?: number, bearingDelta = 0) => {
    const m = mapInstRef.current;
    if (!m) return;
    try {
      m.easeTo({
        pitch,
        zoom: zoom ?? m.getZoom(),
        bearing: m.getBearing() + bearingDelta,
        duration: modoEco ? 350 : 650,
      });
    } catch {
      // mapa cerrado
    }
  };

  useEffect(() => {
    sensorRef.current = sensor;
  }, [sensor]);

  useEffect(() => {
    clickCbRef.current = onTerrenoClick;
  }, [onTerrenoClick]);

  // ══════════════════════════════════════════════════════════════════════════
  // MOTOR A: MAPLIBRE GL JS 3D + SATÉLITE REAL + ELEVACIÓN DEM TERRARIUM
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (motor !== "satelite-dem") return;
    const container = mapHostRef.current;
    if (!container) return;

    container.innerHTML = "";
    try {
      maplibregl.setWorkerUrl(
        new URL("/assets/vendor/maplibre-gl-worker.mjs", window.location.origin).href
      );
    } catch {
      // ignora si el worker ya fue inicializado
    }
    const tileUrl =
      sensor === "nocturno" || sensor === "termico"
        ? "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

    const map = new maplibregl.Map({
      container,
      center: [teatro.lng, teatro.lat],
      zoom: edificios3d ? 13.4 : 11.6,
      pitch: 62,
      bearing: -16,
      maxPitch: 85,
      pixelRatio: modoEco ? 1 : Math.min(window.devicePixelRatio || 1, 1.5),
      fadeDuration: modoEco ? 0 : 120,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          "sat-tiles": {
            type: "raster",
            tiles: [tileUrl],
            tileSize: 256,
            maxzoom: 18,
          },
          "aws-dem": {
            type: "raster-dem",
            tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
            encoding: "terrarium",
            tileSize: 256,
            maxzoom: 15,
          },
          "osm-openmap": {
            type: "vector",
            url: "https://tiles.openfreemap.org/planet",
          },
        },
        layers: [
          {
            id: "bg",
            type: "background",
            paint: {
              "background-color":
                sensor === "nocturno" ? "#031208" : sensor === "termico" ? "#070b22" : "#070c16",
            },
          },
          {
            id: "sat-base",
            type: "raster",
            source: "sat-tiles",
            paint: {
              "raster-opacity": 1,
              "raster-contrast": sensor === "termico" ? 0.35 : 0.14,
              "raster-hue-rotate": sensor === "nocturno" ? 95 : sensor === "termico" ? 210 : 0,
              "raster-saturation": sensor === "nocturno" ? 0.45 : sensor === "tactico" ? -0.1 : 0.08,
            },
          },
          {
            id: "vias-osm",
            type: "line",
            source: "osm-openmap",
            "source-layer": "transportation",
            minzoom: 12,
            layout: {
              visibility: edificios3d ? "visible" : "none",
            },
            paint: {
              "line-color":
                sensor === "nocturno"
                  ? "rgba(56, 255, 130, 0.25)"
                  : sensor === "termico"
                  ? "rgba(255, 183, 3, 0.28)"
                  : "rgba(255, 224, 130, 0.24)",
              "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.5, 16, 2.2],
            },
          },
          {
            id: "edificios-3d",
            type: "fill-extrusion",
            source: "osm-openmap",
            "source-layer": "building",
            minzoom: 12.2,
            filter: ["!=", ["get", "hide_3d"], true],
            layout: {
              visibility: edificios3d ? "visible" : "none",
            },
            paint: {
              "fill-extrusion-color":
                sensor === "nocturno"
                  ? "#0f5132"
                  : sensor === "termico"
                  ? ["interpolate", ["linear"], ["coalesce", ["get", "render_height"], 10], 5, "#1e3a8a", 30, "#ea580c", 90, "#fde047"]
                  : ["interpolate", ["linear"], ["coalesce", ["get", "render_height"], 10], 4, "#334155", 22, "#475569", 70, "#94a3b8"],
              "fill-extrusion-height": ["coalesce", ["get", "render_height"], 9],
              "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
              "fill-extrusion-opacity": modoEco ? 0.72 : 0.84,
            },
          },
        ],
      },
    });
    mapInstRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    let timerSync: number | null = null;
    let rafOrbit = 0;

    map.on("load", () => {
      registrarIconosMapa(map);

      if (demActivo) {
        try {
          map.setTerrain({ source: "aws-dem", exaggeration: 1.65 });
        } catch {
          // fallback plano si el navegador restringe DEM
        }
      }

      // Perímetro del sector táctico 2D/3D
      const sw = normToLngLat(-1, 1, teatro);
      const ne = normToLngLat(1, -1, teatro);
      const nw = normToLngLat(-1, -1, teatro);
      const se = normToLngLat(1, 1, teatro);

      map.addSource("sector-box", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [nw, ne, se, sw, nw],
          },
        },
      });
      map.addLayer({
        id: "sector-box-line",
        type: "line",
        source: "sector-box",
        paint: {
          "line-color": "#FFC94D",
          "line-width": 2,
          "line-dasharray": [3, 2],
          "line-opacity": 0.72,
        },
      });

      // Ciudades objetivo del teatro
      map.addSource("ciudades-pin", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: ciudades.map((c) => ({
            type: "Feature",
            properties: { nombre: c.nombre, estado: c.estado },
            geometry: { type: "Point", coordinates: normToLngLat(c.nx, c.nz, teatro) },
          })),
        },
      });
      map.addLayer({
        id: "ciudades-circle",
        type: "circle",
        source: "ciudades-pin",
        paint: {
          "circle-radius": 6.5,
          "circle-color": "#FFC94D",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#070a12",
        },
      });

      // Fuentes en tiempo real de la simulación
      map.addSource("front-line", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "front-line-glow",
        type: "line",
        source: "front-line",
        paint: {
          "line-color": "#FFC94D",
          "line-width": 5,
          "line-blur": 4,
          "line-opacity": 0.55,
        },
      });
      map.addLayer({
        id: "front-line-core",
        type: "line",
        source: "front-line",
        paint: {
          "line-color": "#FEF08A",
          "line-width": 2,
        },
      });

      map.addSource("sim-craters", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "sim-craters-layer",
        type: "circle",
        source: "sim-craters",
        paint: {
          "circle-radius": ["get", "r"],
          "circle-color": ["get", "fill"],
          "circle-stroke-width": 1.4,
          "circle-stroke-color": ["get", "stroke"],
        },
      });

      map.addSource("sim-nuke-waves", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "sim-nuke-fill",
        type: "fill",
        source: "sim-nuke-waves",
        paint: {
          "fill-color": "#ff6d00",
          "fill-opacity": ["get", "alpha"],
        },
      });
      map.addLayer({
        id: "sim-nuke-ring",
        type: "line",
        source: "sim-nuke-waves",
        paint: {
          "line-color": "#fde047",
          "line-width": 2.6,
          "line-opacity": 0.9,
        },
      });

      map.addSource("sim-squad-links", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "sim-squad-links-layer",
        type: "line",
        source: "sim-squad-links",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 1.4,
          "line-dasharray": [2, 2],
          "line-opacity": 0.65,
        },
      });

      map.addSource("sim-proj", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "sim-proj-trails",
        type: "line",
        source: "sim-proj",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2.4,
          "line-opacity": 0.85,
        },
      });

      map.addSource("sim-expl", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "sim-expl-layer",
        type: "circle",
        source: "sim-expl",
        paint: {
          "circle-radius": ["get", "r"],
          "circle-color": "rgba(255, 90, 20, 0.45)",
          "circle-stroke-width": 2.2,
          "circle-stroke-color": "#FFC94D",
        },
      });

      map.addSource("sim-units", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "sim-units-halo",
        type: "circle",
        source: "sim-units",
        paint: {
          "circle-radius": 13,
          "circle-color": ["get", "bgColor"],
          "circle-stroke-width": 1.6,
          "circle-stroke-color": ["get", "color"],
        },
      });
      map.addLayer({
        id: "sim-units-icon",
        type: "symbol",
        source: "sim-units",
        layout: {
          "icon-image": ["get", "icon"],
          "icon-size": 0.72,
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      const syncSimToMap = () => {
        const st = simRef.current;

        const frontCoords: [number, number][] = [];
        for (let i = 0; i < 9; i++) {
          const fx = st.frenteLinea[i] ?? 0;
          const fz = -0.82 + (i / 8) * 1.64;
          frontCoords.push(normToLngLat(fx, fz, teatro));
        }
        (map.getSource("front-line") as maplibregl.GeoJSONSource | undefined)?.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: frontCoords },
        });

        (map.getSource("sim-units") as maplibregl.GeoJSONSource | undefined)?.setData({
          type: "FeatureCollection",
          features: st.unidades.map((u) => ({
            type: "Feature",
            properties: {
              id: u.id,
              nombre: u.nombre,
              icon: iconoParaUnidad(u.bando, u.tipo),
              color: u.bando === "A" ? "#FFC94D" : "#FF3B30",
              bgColor:
                u.bando === "A" ? "rgba(56, 189, 248, 0.28)" : "rgba(255, 59, 48, 0.25)",
            },
            geometry: {
              type: "Point",
              coordinates: normToLngLat(u.x, u.z, teatro),
            },
          })),
        });

        (map.getSource("sim-proj") as maplibregl.GeoJSONSource | undefined)?.setData({
          type: "FeatureCollection",
          features: st.proyectiles.map((pr) => {
            const p0 = Math.max(0, pr.p - 0.14);
            const c0 = normToLngLat(
              pr.x0 + (pr.x1 - pr.x0) * p0,
              pr.z0 + (pr.z1 - pr.z0) * p0,
              teatro
            );
            const c1 = normToLngLat(
              pr.x0 + (pr.x1 - pr.x0) * pr.p,
              pr.z0 + (pr.z1 - pr.z0) * pr.p,
              teatro
            );
            return {
              type: "Feature",
              properties: { color: pr.bando === "A" ? "#FFC94D" : "#FF3B30" },
              geometry: { type: "LineString", coordinates: [c0, c1] },
            };
          }),
        });

        (map.getSource("sim-expl") as maplibregl.GeoJSONSource | undefined)?.setData({
          type: "FeatureCollection",
          features: st.explosiones.map((ex) => {
            const k = ex.edad / Math.max(0.01, ex.maxEdad);
            return {
              type: "Feature",
              properties: { r: Math.round((8 + k * 24) * ex.radio) },
              geometry: {
                type: "Point",
                coordinates: normToLngLat(ex.x, ex.z, teatro),
              },
            };
          }),
        });

        (map.getSource("sim-craters") as maplibregl.GeoJSONSource | undefined)?.setData({
          type: "FeatureCollection",
          features: st.crateres.map((cr) => ({
            type: "Feature",
            properties: {
              r: cr.nuclear ? 14 : 5,
              fill: cr.nuclear ? "rgba(220, 38, 38, 0.42)" : "rgba(15, 18, 28, 0.78)",
              stroke: cr.nuclear ? "#fde047" : "rgba(255, 140, 0, 0.5)",
            },
            geometry: {
              type: "Point",
              coordinates: normToLngLat(cr.x, cr.z, teatro),
            },
          })),
        });

        // Enlaces tácticos entre líderes e integrantes de cada escuadrón real
        const lideres = new Map<string, { x: number; z: number; bando: "A" | "B" }>();
        for (const u of st.unidades) {
          if (!u.escuadronId) continue;
          if (!lideres.has(u.escuadronId) || u.rolEscuadron === "lider") {
            lideres.set(u.escuadronId, { x: u.x, z: u.z, bando: u.bando });
          }
        }
        const squadLines: GeoJSON.Feature<GeoJSON.LineString>[] = [];
        for (const u of st.unidades) {
          if (!u.escuadronId) continue;
          const lid = lideres.get(u.escuadronId);
          if (!lid || (lid.x === u.x && lid.z === u.z)) continue;
          squadLines.push({
            type: "Feature",
            properties: { color: u.bando === "A" ? "#38BDF8" : "#FF6B6B" },
            geometry: {
              type: "LineString",
              coordinates: [normToLngLat(lid.x, lid.z, teatro), normToLngLat(u.x, u.z, teatro)],
            },
          });
        }
        (map.getSource("sim-squad-links") as maplibregl.GeoJSONSource | undefined)?.setData({
          type: "FeatureCollection",
          features: squadLines,
        });

        // Ondas de choque nucleares sobre edificios y territorio real
        const ondas = st.ondasNucleares ?? [];
        (map.getSource("sim-nuke-waves") as maplibregl.GeoJSONSource | undefined)?.setData({
          type: "FeatureCollection",
          features: ondas.map((on) => {
            const prog = Math.min(1, on.edad / Math.max(0.1, on.maxEdad));
            const rAct = on.radioNorm * (0.28 + Math.min(1, prog * 2.4) * 0.72);
            return {
              type: "Feature",
              properties: { alpha: Math.max(0.06, 0.42 * (1 - prog * 0.85)) },
              geometry: {
                type: "Polygon",
                coordinates: [circuloGeoJSON(on.x, on.z, rAct, teatro)],
              },
            };
          }),
        });
      };

      let visibleEnPantalla = true;
      const io = new IntersectionObserver(
        (entries) => {
          visibleEnPantalla = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 }
      );
      io.observe(container);

      const syncChecked = () => {
        if (!visibleEnPantalla || document.hidden) return;
        syncSimToMap();
      };
      syncSimToMap();
      timerSync = window.setInterval(syncChecked, modoEco ? 140 : 75);
      map.once("remove", () => io.disconnect());
    });

    map.on("click", (e) => {
      if (!clickCbRef.current) return;
      const [nx, nz] = lngLatToNorm(e.lngLat.lng, e.lngLat.lat, teatro);
      clickCbRef.current(nx, nz);
    });

    const spin = () => {
      if (orbitandoMap) {
        map.setBearing((map.getBearing() + 0.14) % 360);
      }
      rafOrbit = requestAnimationFrame(spin);
    };
    if (orbitandoMap) {
      rafOrbit = requestAnimationFrame(spin);
    }

    const ro = new ResizeObserver(() => {
      try {
        map.resize();
      } catch {
        // mapa cerrado
      }
    });
    ro.observe(container);

    return () => {
      if (timerSync !== null) window.clearInterval(timerSync);
      if (rafOrbit) cancelAnimationFrame(rafOrbit);
      ro.disconnect();
      if (mapInstRef.current === map) mapInstRef.current = null;
      map.remove();
    };
  }, [motor, teatro, sensor, demActivo, edificios3d, modoEco, orbitandoMap, simRef, ciudades]);

  // ══════════════════════════════════════════════════════════════════════════
  // MOTOR B: ARENA TÁCTICA PBR THREE.JS (SKY + WATER.JS + MODELOS .GLB + BLOOM)
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (motor !== "arena-glb") return;
    const el = glHostRef.current;
    if (!el) return;

    const width = el.clientWidth || 720;
    const height = altura;

    const scene = new THREE.Scene();
    const bgHex =
      sensor === "nocturno"
        ? 0x041208
        : sensor === "termico"
        ? 0x05091c
        : 0x091322;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.0024);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.2, 400);
    camera.position.set(0, 20, 26);

    const renderer = new THREE.WebGLRenderer({
      antialias: !modoEco,
      powerPreference: modoEco ? "default" : "high-performance",
    });
    renderer.setPixelRatio(modoEco ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    const disposeEnv = aplicarEntornoPBR(renderer, scene, "outdoor");
    const pipeline = crearPipelinePBR(renderer, scene, camera, width, height, {
      strength: 0.24,
      radius: 0.22,
      threshold: 1.15,
      ecoMode: modoEco,
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 8;
    controls.maxDistance = 54;
    controls.target.set(0, 0.8, 0);

    // Cielo físico atmosférico de Preetham (Sky.js) en modo satélite diurno
    let sky: Sky | null = null;
    if (sensor === "satelite") {
      sky = new Sky();
      sky.scale.setScalar(300);
      scene.add(sky);
      const uniforms = sky.material.uniforms;
      uniforms["turbidity"].value = 2.4;
      uniforms["rayleigh"].value = 0.85;
      uniforms["mieCoefficient"].value = 0.003;
      uniforms["mieDirectionalG"].value = 0.78;
      const sunVec = new THREE.Vector3();
      const phi = THREE.MathUtils.degToRad(90 - 24);
      const theta = THREE.MathUtils.degToRad(142);
      sunVec.setFromSphericalCoords(1, phi, theta);
      uniforms["sunPosition"].value.copy(sunVec);
      renderer.toneMappingExposure = 0.56;
    } else {
      renderer.toneMappingExposure = 1.02;
    }

    const hemi = new THREE.HemisphereLight(
      sensor === "nocturno" ? 0x3dff7a : 0x9ec5ff,
      0x111520,
      sensor === "satelite" ? 1.25 : 0.95
    );
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(
      sensor === "nocturno" ? 0x6dff96 : sensor === "termico" ? 0xff9a52 : 0xfff1d6,
      sensor === "satelite" ? 2.6 : 1.9
    );
    sun.position.set(22, 32, 16);
    if (!modoEco) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -22;
      sun.shadow.camera.right = 22;
      sun.shadow.camera.top = 22;
      sun.shadow.camera.bottom = -22;
    }
    scene.add(sun);

    // Malla topográfica HD con textura PBR real
    const segs = modoEco ? 64 : 112;
    const terrainGeo = new THREE.PlaneGeometry(MUNDO_SIZE, MUNDO_SIZE, segs, segs);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < posAttr.count; i++) {
      const wx = posAttr.getX(i);
      const wz = posAttr.getZ(i);
      const e = elevacionEn(wx / HALF, wz / HALF, teatro);
      posAttr.setY(i, e * teatro.relieveAmplitud);
    }
    terrainGeo.computeVertexNormals();

    const terrainTex = crearTexturaTerrenoHD(teatro, sensor);
    const terrainMat = new THREE.MeshStandardMaterial({
      map: terrainTex,
      roughness: 0.82,
      metalness: 0.08,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    const baseRim = new THREE.Mesh(
      new THREE.BoxGeometry(MUNDO_SIZE + 0.5, 0.9, MUNDO_SIZE + 0.5),
      new THREE.MeshStandardMaterial({ color: 0x0b0f18, roughness: 0.5, metalness: 0.5 })
    );
    baseRim.position.y = -2.25;
    scene.add(baseRim);

    // Agua física animada Water.js cuando el teatro es costero / fluvial / estrecho
    let waterObj: Water | null = null;
    let waterTex: THREE.Texture | null = null;
    if (teatro.agua) {
      const wGeo = new THREE.PlaneGeometry(MUNDO_SIZE - 0.1, MUNDO_SIZE - 0.1);
      waterTex = new THREE.TextureLoader().load("/assets/env/waternormals.jpg", (t) => {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
      });
      waterObj = new Water(wGeo, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterTex,
        sunDirection: new THREE.Vector3(0.7, 0.6, 0.4).normalize(),
        sunColor: sensor === "nocturno" ? 0x3ddc97 : 0xfff0d0,
        waterColor:
          sensor === "nocturno" ? 0x062812 : sensor === "termico" ? 0x0a143c : 0x0b3954,
        distortionScale: 2.2,
        fog: scene.fog !== undefined,
      });
      waterObj.rotation.x = -Math.PI / 2;
      waterObj.position.y = 0.02;
      scene.add(waterObj);
    }

    // Estructuras urbanas deterministas
    const edificios = edificiosDeTeatro(teatro);
    const cityGroup = new THREE.Group();
    const bMatTorre = new THREE.MeshStandardMaterial({
      color: sensor === "termico" ? 0xff9f43 : sensor === "nocturno" ? 0x3ddc97 : 0x475569,
      roughness: 0.42,
      metalness: 0.35,
    });
    const bMatBloque = new THREE.MeshStandardMaterial({
      color: sensor === "termico" ? 0xd97706 : 0x2a3345,
      roughness: 0.55,
      metalness: 0.25,
    });
    for (const ed of edificios) {
      const yBase = Math.max(0.02, elevacionEn(ed.x, ed.z, teatro) * teatro.relieveAmplitud);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(ed.w, ed.h, ed.d),
        ed.tipo === "torre" ? bMatTorre : bMatBloque
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(ed.x * HALF, yBase + ed.h / 2 - 0.05, ed.z * HALF);
      cityGroup.add(mesh);
    }
    scene.add(cityGroup);

    // Balizas de ciudades reales
    const cityPinGroup = new THREE.Group();
    for (const c of ciudades) {
      const yPin = Math.max(0.08, elevacionEn(c.nx, c.nz, teatro) * teatro.relieveAmplitud);
      const pinColor =
        c.estado === "frente" || c.estado === "sitio"
          ? 0xff3b30
          : c.estado === "ocupada"
          ? 0xf97316
          : c.estado === "contendida"
          ? 0xffc94d
          : 0x38bdf8;
      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.14, 1.5, 10),
        new THREE.MeshBasicMaterial({ color: pinColor })
      );
      spire.position.set(c.nx * HALF, yPin + 0.75, c.nz * HALF);
      cityPinGroup.add(spire);
    }
    scene.add(cityPinGroup);

    // Línea del frente dinámica
    const frontPts: THREE.Vector3[] = [];
    for (let i = 0; i < 9; i++) {
      frontPts.push(new THREE.Vector3(0, 0.4, (-0.8 + (i / 8) * 1.6) * HALF));
    }
    const frontGeo = new THREE.BufferGeometry().setFromPoints(frontPts);
    const frontLine = new THREE.Line(frontGeo, new THREE.LineBasicMaterial({ color: 0xffc94d }));
    scene.add(frontLine);

    // Unidades reales en .glb cacheadas en el campo de batalla
    const unitPool = new Map<string, { inst: InstanciaUnidadGLB; ring: THREE.Mesh }>();
    const unitsLayer = new THREE.Group();
    const projLayer = new THREE.Group();
    const explLayer = new THREE.Group();
    const craterLayer = new THREE.Group();
    scene.add(unitsLayer, projLayer, explLayer, craterLayer);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPt: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      downPt = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      if (!downPt || !clickCbRef.current) return;
      const dist = Math.hypot(e.clientX - downPt.x, e.clientY - downPt.y);
      downPt = null;
      if (dist > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(terrainMesh, false);
      if (hits.length > 0) {
        const pt = hits[0].point;
        const nx = Math.max(-0.92, Math.min(0.92, pt.x / HALF));
        const nz = Math.max(-0.88, Math.min(0.88, pt.z / HALF));
        clickCbRef.current(nx, nz);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    let lastCraterCount = -1;
    let lastNow = performance.now();
    let raf = 0;
    let visibleGL = true;
    const ioGL = new IntersectionObserver(
      (entries) => {
        visibleGL = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    ioGL.observe(el);

    const animate = (now: number) => {
      raf = requestAnimationFrame(animate);
      if (!visibleGL || document.hidden) {
        lastNow = now;
        return;
      }
      const dt = Math.min(0.05, (now - lastNow) * 0.001);
      lastNow = now;
      const st = simRef.current;

      if (waterObj) {
        const u = waterObj.material.uniforms["time"];
        if (u) u.value += dt * 0.85;
      }

      const vivosIds = new Set(st.unidades.map((u) => u.id));
      for (const [id, item] of unitPool.entries()) {
        if (!vivosIds.has(id)) {
          unitsLayer.remove(item.inst.root);
          unitsLayer.remove(item.ring);
          item.inst.dispose();
          unitPool.delete(id);
        }
      }

      for (const u of st.unidades) {
        let entry = unitPool.get(u.id);
        if (!entry) {
          const colorBando =
            sensorRef.current === "termico"
              ? u.bando === "A"
                ? 0xffb703
                : 0xff4d6d
              : u.bando === "A"
              ? 0x38bdf8
              : 0xff3b30;
          const acento = u.bando === "A" ? 0xffc94d : 0xff6b6b;
          const inst = instanciarUnidadGLB(u.tipo, colorBando, acento, 0.72);
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.55, 0.7, 20),
            new THREE.MeshBasicMaterial({
              color: u.bando === "A" ? 0xffc94d : 0xff3b30,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.78,
            })
          );
          ring.rotation.x = -Math.PI / 2;
          unitsLayer.add(inst.root);
          unitsLayer.add(ring);
          entry = { inst, ring };
          unitPool.set(u.id, entry);
        }

        const wx = u.x * HALF;
        const wz = u.z * HALF;
        const terrainY = Math.max(0.02, elevacionEn(u.x, u.z, teatro) * teatro.relieveAmplitud);
        const airOffset =
          u.tipo === "jet" ? 4.4 : u.tipo === "drone" ? 2.1 + Math.sin(now * 0.007 + wx) * 0.14 : 0;

        entry.inst.root.position.set(wx, terrainY + airOffset, wz);
        entry.inst.root.rotation.y = -u.rot;
        entry.inst.mixer?.update(dt);
        if (entry.inst.turretNode) {
          entry.inst.turretNode.rotation.y = Math.sin(now * 0.0014 + wx) * 0.25;
        }
        for (const r of entry.inst.rotorNodes) {
          r.rotation.y += dt * 18;
        }

        entry.ring.position.set(wx, terrainY + 0.08, wz);
        const hpRatio = Math.max(0.25, u.hp / u.maxHp);
        entry.ring.scale.setScalar(0.85 + hpRatio * 0.25);
      }

      const fPos = frontGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < 9; i++) {
        const fx = st.frenteLinea[i] ?? 0;
        const fz = -0.8 + (i / 8) * 1.6;
        const fy = Math.max(0.18, elevacionEn(fx, fz, teatro) * teatro.relieveAmplitud + 0.32);
        fPos.setXYZ(i, fx * HALF, fy, fz * HALF);
      }
      fPos.needsUpdate = true;

      projLayer.clear();
      for (const pr of st.proyectiles) {
        const px = (pr.x0 + (pr.x1 - pr.x0) * pr.p) * HALF;
        const pz = (pr.z0 + (pr.z1 - pr.z0) * pr.p) * HALF;
        const arco =
          pr.estilo === "nuclear"
            ? Math.sin(pr.p * Math.PI) * 14.5
            : pr.estilo === "artilleria" || pr.estilo === "misil"
            ? Math.sin(pr.p * Math.PI) * 5.2
            : pr.estilo === "sam"
            ? Math.sin(pr.p * Math.PI) * 2.8
            : Math.sin(pr.p * Math.PI) * 0.6;
        const py =
          (pr.y0 + (pr.y1 - pr.y0) * pr.p) * teatro.relieveAmplitud + arco + 0.3;
        const col = pr.estilo === "nuclear" ? 0xfde047 : pr.bando === "A" ? 0xffc94d : 0xff3b30;
        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(
            pr.estilo === "nuclear" ? 0.42 : pr.estilo === "trazadora" ? 0.11 : 0.22,
            8,
            8
          ),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(1.8) })
        );
        orb.position.set(px, py, pz);
        projLayer.add(orb);
      }

      explLayer.clear();
      for (const ex of st.explosiones) {
        const k = ex.edad / ex.maxEdad;
        const ey = Math.max(0.05, ex.y * teatro.relieveAmplitud) + 0.25;
        if (ex.tipo === "nuclear") {
          const sx = ex.x * HALF;
          const sz = ex.z * HALF;
          const altoHongo = 1.6 + k * 7.8;
          // Columna del hongo nuclear
          const tallo = new THREE.Mesh(
            new THREE.CylinderGeometry(0.45 + k * 0.45, 0.85, altoHongo, 10),
            new THREE.MeshBasicMaterial({
              color: k < 0.25 ? 0xfffbeb : 0xf97316,
              transparent: true,
              opacity: Math.max(0, 0.86 * (1 - k * 0.7)),
            })
          );
          tallo.position.set(sx, ey + altoHongo * 0.5, sz);
          explLayer.add(tallo);
          // Sombrero toroidal/esférico superior
          const copa = new THREE.Mesh(
            new THREE.SphereGeometry(1.1 + k * 2.8, 14, 10),
            new THREE.MeshBasicMaterial({
              color: k < 0.2 ? 0xffffff : 0xff6d00,
              transparent: true,
              opacity: Math.max(0, 0.92 * (1 - k * 0.65)),
            })
          );
          copa.scale.y = 0.58;
          copa.position.set(sx, ey + altoHongo, sz);
          explLayer.add(copa);
        } else {
          const r = (0.28 + k * 1.55) * ex.radio;
          const bola = new THREE.Mesh(
            new THREE.SphereGeometry(r * 0.55, 10, 8),
            new THREE.MeshBasicMaterial({
              color: k < 0.35 ? 0xffe082 : 0xff5722,
              transparent: true,
              opacity: Math.max(0, 0.9 * (1 - k)),
            })
          );
          bola.position.set(ex.x * HALF, ey, ex.z * HALF);
          explLayer.add(bola);
        }
      }

      // Ondas de choque nucleares expansivas sobre el terreno PBR
      for (const on of st.ondasNucleares ?? []) {
        const prog = Math.min(1, on.edad / Math.max(0.1, on.maxEdad));
        const rWorld = Math.max(0.5, on.radioNorm * HALF * (0.28 + Math.min(1, prog * 2.4) * 0.72));
        const oy = Math.max(0.08, elevacionEn(on.x, on.z, teatro) * teatro.relieveAmplitud) + 0.14;
        const onda = new THREE.Mesh(
          new THREE.RingGeometry(Math.max(0.1, rWorld - 0.35), rWorld, 32),
          new THREE.MeshBasicMaterial({
            color: 0xfde047,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: Math.max(0.08, 0.85 * (1 - prog * 0.85)),
          })
        );
        onda.rotation.x = -Math.PI / 2;
        onda.position.set(on.x * HALF, oy, on.z * HALF);
        explLayer.add(onda);
      }

      if (st.crateres.length !== lastCraterCount) {
        lastCraterCount = st.crateres.length;
        craterLayer.clear();
        for (const cr of st.crateres) {
          const cy = Math.max(0.03, elevacionEn(cr.x, cr.z, teatro) * teatro.relieveAmplitud) + 0.04;
          const marca = new THREE.Mesh(
            new THREE.CircleGeometry(cr.radio * HALF * 1.25, 12),
            new THREE.MeshBasicMaterial({ color: 0x090a0f, transparent: true, opacity: 0.72 })
          );
          marca.rotation.x = -Math.PI / 2;
          marca.position.set(cr.x * HALF, cy, cr.z * HALF);
          craterLayer.add(marca);
        }
      }

      controls.update();
      pipeline.render();
    };

    raf = requestAnimationFrame(animate);

    const ro = new ResizeObserver(() => {
      if (!el) return;
      const w = el.clientWidth || width;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      pipeline.resize(w, height);
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ioGL.disconnect();
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      for (const item of unitPool.values()) item.inst.dispose();
      unitPool.clear();
      disposeEnv();
      pipeline.dispose();
      controls.dispose();
      terrainGeo.dispose();
      terrainMat.dispose();
      terrainTex.dispose();
      waterTex?.dispose();
      renderer.dispose();
    };
  }, [motor, teatro, sensor, modoEco, altura, simRef, ciudades]);

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden border border-amber-hud/35 bg-black"
      style={{ height: altura }}
      aria-label={`Simulador táctico 3D de ${teatro.nombre}`}
    >
      {motor === "satelite-dem" ? (
        <div ref={mapHostRef} className="w-full h-full cursor-crosshair" />
      ) : (
        <div ref={glHostRef} className="w-full h-full cursor-crosshair" />
      )}

      {/* Selector de motor real del visor + controles Google Maps 3D + Eco Móvil */}
      <div className="absolute top-2.5 left-2.5 right-12 z-10 flex flex-wrap items-center gap-1 pointer-events-auto">
        <button
          type="button"
          onClick={() => setMotor("satelite-dem")}
          className={`px-2 py-1 rounded font-mono text-[10px] font-bold border transition-colors ${
            motor === "satelite-dem"
              ? "bg-[#FFC94D] text-black border-[#FFC94D]"
              : "bg-black/80 text-slate-200 border-white/20 hover:border-white/40"
          }`}
        >
          SATÉLITE + EDIFICIOS 3D
        </button>
        <button
          type="button"
          onClick={() => setMotor("arena-glb")}
          className={`px-2 py-1 rounded font-mono text-[10px] font-bold border transition-colors ${
            motor === "arena-glb"
              ? "bg-[#38BDF8] text-black border-[#38BDF8]"
              : "bg-black/80 text-slate-200 border-white/20 hover:border-white/40"
          }`}
        >
          ARENA PBR + .GLB
        </button>
        {motor === "satelite-dem" && (
          <>
            <button
              type="button"
              onClick={() => setEdificios3d((e) => !e)}
              className={`px-2 py-1 rounded font-mono text-[10px] font-bold border ${
                edificios3d
                  ? "bg-cyan-400/25 text-cyan-200 border-cyan-400/60"
                  : "bg-black/75 text-slate-300 border-white/20"
              }`}
            >
              {edificios3d ? "EDIFICIOS 3D ON" : "EDIFICIOS 3D OFF"}
            </button>
            <button
              type="button"
              onClick={() => setDemActivo((d) => !d)}
              className={`px-2 py-1 rounded font-mono text-[10px] font-bold border ${
                demActivo
                  ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/50"
                  : "bg-black/75 text-slate-300 border-white/20"
              }`}
            >
              {demActivo ? "DEM ON" : "DEM OFF"}
            </button>
            <button
              type="button"
              onClick={() => moverCamaraMapa(0, 12.6)}
              title="Vista aérea superior 0°"
              className="px-1.5 py-1 rounded font-mono text-[10px] font-bold border bg-black/75 text-slate-200 border-white/20 hover:border-amber-hud"
            >
              0°
            </button>
            <button
              type="button"
              onClick={() => moverCamaraMapa(58, 13.6)}
              title="Vista 3D inclinada tipo Google Earth"
              className="px-1.5 py-1 rounded font-mono text-[10px] font-bold border bg-black/75 text-slate-200 border-white/20 hover:border-amber-hud"
            >
              58° 3D
            </button>
            <button
              type="button"
              onClick={() => moverCamaraMapa(78, 16.2)}
              title="Vista rasante entre edificios y casas 3D"
              className="px-1.5 py-1 rounded font-mono text-[10px] font-bold border bg-black/75 text-amber-200 border-amber-400/40 hover:bg-amber-400/20"
            >
              CALLE 78°
            </button>
            <button
              type="button"
              onClick={() => moverCamaraMapa(mapInstRef.current?.getPitch() ?? 60, undefined, -45)}
              title="Rotar 45° izquierda"
              className="px-1.5 py-1 rounded font-mono text-[10px] font-bold border bg-black/75 text-slate-200 border-white/20"
            >
              ↺
            </button>
            <button
              type="button"
              onClick={() => moverCamaraMapa(mapInstRef.current?.getPitch() ?? 60, undefined, 45)}
              title="Rotar 45° derecha"
              className="px-1.5 py-1 rounded font-mono text-[10px] font-bold border bg-black/75 text-slate-200 border-white/20"
            >
              ↻
            </button>
            <button
              type="button"
              onClick={() => setOrbitandoMap((o) => !o)}
              className={`px-2 py-1 rounded font-mono text-[10px] font-bold border ${
                orbitandoMap
                  ? "bg-amber-400/20 text-amber-300 border-amber-400/50"
                  : "bg-black/75 text-slate-300 border-white/20"
              }`}
            >
              {orbitandoMap ? "ÓRBITA ON" : "ÓRBITA OFF"}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setModoEco((m) => !m)}
          title="Modo ligero sin lag para teléfonos móviles"
          className={`px-2 py-1 rounded font-mono text-[10px] font-bold border ${
            modoEco
              ? "bg-emerald-500/25 text-emerald-200 border-emerald-400/60"
              : "bg-black/75 text-slate-300 border-white/20"
          }`}
        >
          {modoEco ? "ECO MÓVIL ON" : "ULTRA GPU"}
        </button>
      </div>

      <div className="absolute bottom-2 left-2.5 z-10 pointer-events-none px-2 py-0.5 rounded bg-black/75 border border-white/10 font-mono text-[9.5px] text-slate-300">
        {motor === "satelite-dem"
          ? "MapLibre 3D · Satélite ESRI + Relieve DEM + Edificios/Casas 3D OSM (OpenFreeMap)"
          : "Three.js PBR · Modelos .GLB + Escuadrones + HDRI + Ondas Nucleares"}
      </div>
    </div>
  );
}
