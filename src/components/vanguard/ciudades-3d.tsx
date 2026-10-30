"use client";

// Vanguard v205.0 EL MUNDO 3D — CIUDADES 3D REALES, estilo Google Maps 3D.
// MapLibre GL con teselas LIBRES y SIN API KEY:
//   · SATÉLITE: Esri World Imagery (raster, atribución en el mapa)
//   · EDIFICIOS 3D: vectores OpenStreetMap vía OpenFreeMap (fill-extrusion
//     con las alturas reales de cada edificio: render_height de OSM)
//   · RELIEVE 3D: Terrain-RGB «terrarium» de AWS Open Data (montañas de verdad)
// LUGARES IMPORTANTES: monumentos del planeta + cuellos de botella
// estratégicos (Ormuz, Suez, Bab el-Mandeb, Kerch, Gibraltar, Malaca…)
// con coordenadas reales y vuelo de cámara cinematográfico (pitch 60).
// Ley de la casa: este motor SOLO se monta cuando el Dueño abre CIUDADES 3D
// (dynamic ssr:false) — el arranque sigue pesando lo mismo que en v199.

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as maplibregl from "maplibre-gl";
import { setWorkerUrl } from "maplibre-gl";
import type { Map as MapaMl, Marker, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// v205 CORRECCIÓN DE MOTOR: dentro del bundle de Next, import.meta.url no es
// http(s) y MapLibre no consigue resolver SU PROPIO worker («Worker failed to
// load»). Cura oficial: el worker viaja como asset estático y se registra por
// su ruta pública (setWorkerUrl, API oficial de MapLibre).
setWorkerUrl("/vendor/maplibre-gl-worker.mjs");

// ============ datos reales (coordenadas públicas de dominio común) ============
interface Ciudad { nombre: string; pais: string; lat: number; lng: number; bearing: number; }
interface Lugar {
  nombre: string; pais: string; lat: number; lng: number; zoom: number;
  tipo: "monumento" | "estrategico" | "sede"; dato: string;
}

const CIUDADES: Ciudad[] = [
  { nombre: "Nueva York", pais: "EE. UU.", lat: 40.7484, lng: -73.9857, bearing: 30 },
  { nombre: "Madrid", pais: "España", lat: 40.4168, lng: -3.7038, bearing: 20 },
  { nombre: "Ciudad de México", pais: "México", lat: 19.4326, lng: -99.1332, bearing: 15 },
  { nombre: "Buenos Aires", pais: "Argentina", lat: -34.6037, lng: -58.3816, bearing: 25 },
  { nombre: "Bogotá", pais: "Colombia", lat: 4.7110, lng: -74.0721, bearing: 10 },
  { nombre: "Lima", pais: "Perú", lat: -12.0464, lng: -77.0428, bearing: 20 },
  { nombre: "Santiago", pais: "Chile", lat: -33.4489, lng: -70.6693, bearing: 30 },
  { nombre: "Miami", pais: "EE. UU.", lat: 25.7617, lng: -80.1918, bearing: 15 },
  { nombre: "Los Ángeles", pais: "EE. UU.", lat: 34.0522, lng: -118.2437, bearing: 25 },
  { nombre: "París", pais: "Francia", lat: 48.8566, lng: 2.3522, bearing: 20 },
  { nombre: "Londres", pais: "Reino Unido", lat: 51.5074, lng: -0.1278, bearing: 30 },
  { nombre: "Berlín", pais: "Alemania", lat: 52.5200, lng: 13.4050, bearing: 10 },
  { nombre: "Roma", pais: "Italia", lat: 41.9028, lng: 12.4964, bearing: 20 },
  { nombre: "Estambul", pais: "Turquía", lat: 41.0082, lng: 28.9784, bearing: 40 },
  { nombre: "Dubái", pais: "EAU", lat: 25.1972, lng: 55.2744, bearing: 30 },
  { nombre: "Tokio", pais: "Japón", lat: 35.6762, lng: 139.6503, bearing: 25 },
  { nombre: "Seúl", pais: "Corea del Sur", lat: 37.5665, lng: 126.9780, bearing: 20 },
  { nombre: "Moscú", pais: "Rusia", lat: 55.7558, lng: 37.6173, bearing: 35 },
  { nombre: "Kiev", pais: "Ucrania", lat: 50.4501, lng: 30.5234, bearing: 15 },
  { nombre: "El Cairo", pais: "Egipto", lat: 30.0444, lng: 31.2357, bearing: 10 },
];

const LUGARES: Lugar[] = [
  { nombre: "Torre Eiffel", pais: "Francia", lat: 48.8584, lng: 2.2945, zoom: 16.6, tipo: "monumento", dato: "Icono de hierro forjado de París, terminado en 1889 para la Exposición Universal." },
  { nombre: "Estatua de la Libertad", pais: "EE. UU.", lat: 40.6892, lng: -74.0445, zoom: 16.5, tipo: "monumento", dato: "Regalo de Francia inaugurado en 1886; 93 m desde la base a la antena." },
  { nombre: "Pirámides de Guiza", pais: "Egipto", lat: 29.9792, lng: 31.1342, zoom: 15.8, tipo: "monumento", dato: "La Gran Pirámide: la última de las 7 maravillas antiguas que sigue en pie." },
  { nombre: "Coliseo", pais: "Italia", lat: 41.8902, lng: 12.4922, zoom: 17, tipo: "monumento", dato: "Anfiteatro inaugurado en el año 80 d.C.; llegaba a caber ~50.000 personas." },
  { nombre: "Machu Picchu", pais: "Perú", lat: -13.1631, lng: -72.5450, zoom: 15.5, tipo: "monumento", dato: "Ciudad inca del siglo XV colgada a 2.430 m sobre el nivel del mar." },
  { nombre: "Cristo Redentor", pais: "Brasil", lat: -22.9519, lng: -43.2105, zoom: 16.6, tipo: "monumento", dato: "38 m de art déco coronando el Corcovado desde 1931." },
  { nombre: "Gran Muralla (Mutianyu)", pais: "China", lat: 40.4319, lng: 116.5704, zoom: 15.2, tipo: "monumento", dato: "Fortificación milenaria: más de 20.000 km sumando todos sus ramales." },
  { nombre: "Taj Mahal", pais: "India", lat: 27.1751, lng: 78.0421, zoom: 16.4, tipo: "monumento", dato: "Mausoleo de mármol blanco terminado en 1653." },
  { nombre: "Burj Khalifa", pais: "EAU", lat: 25.1972, lng: 55.2744, zoom: 16.8, tipo: "monumento", dato: "828 metros: el edificio más alto del planeta." },
  { nombre: "La Meca (Kaaba)", pais: "Arabia Saudí", lat: 21.4225, lng: 39.8262, zoom: 17, tipo: "monumento", dato: "El lugar más sagrado del islam y destino del Hayy anual." },
  { nombre: "Monte Everest", pais: "Nepal/China", lat: 27.9881, lng: 86.9250, zoom: 12.5, tipo: "monumento", dato: "8.849 m: el techo del planeta (activa el RELIEVE para verlo de verdad)." },
  { nombre: "Isla de Pascua", pais: "Chile", lat: -27.1127, lng: -109.3497, zoom: 14, tipo: "monumento", dato: "Los moai, en una de las islas habitadas más aisladas del mundo." },
  { nombre: "Casa Blanca", pais: "EE. UU.", lat: 38.8977, lng: -77.0365, zoom: 17.2, tipo: "sede", dato: "Sede del poder ejecutivo de EE. UU. desde 1800." },
  { nombre: "Pentágono", pais: "EE. UU.", lat: 38.8719, lng: -77.0563, zoom: 16.2, tipo: "sede", dato: "Cuartel general del Departamento de Defensa: uno de los edificios de oficinas más grandes del mundo." },
  { nombre: "Sede de la ONU", pais: "EE. UU.", lat: 40.7489, lng: -73.9680, zoom: 16.8, tipo: "sede", dato: "Territorio internacional junto al East River desde 1952." },
  { nombre: "Cuartel General de la OTAN", pais: "Bélgica", lat: 50.8798, lng: 4.3628, zoom: 16, tipo: "sede", dato: "El corazón de la alianza atlántica, en Bruselas." },
  { nombre: "Kremlin", pais: "Rusia", lat: 55.7520, lng: 37.6175, zoom: 16.4, tipo: "sede", dato: "Fortaleza roja que gobierna Rusia desde el siglo XV." },
  { nombre: "Canal de Suez", pais: "Egipto", lat: 30.4517, lng: 32.3527, zoom: 12.5, tipo: "estrategico", dato: "Cerca del 12% del comercio mundial cruza este canal entre dos mares." },
  { nombre: "Canal de Panamá", pais: "Panamá", lat: 9.0800, lng: -79.6800, zoom: 12.5, tipo: "estrategico", dato: "Une el Atlántico con el Pacífico desde 1914." },
  { nombre: "Estrecho de Ormuz", pais: "Irán/Omán", lat: 26.5667, lng: 56.2500, zoom: 10.5, tipo: "estrategico", dato: "Por aquí pasa cerca de la quinta parte del petróleo del mundo." },
  { nombre: "Bab el-Mandeb", pais: "Yemen/Yibuti", lat: 12.5833, lng: 43.3333, zoom: 10.5, tipo: "estrategico", dato: "La puerta del Mar Rojo: ~10% del comercio marítimo mundial." },
  { nombre: "Estrecho de Malaca", pais: "Malasia/Indonesia", lat: 2.5000, lng: 101.5000, zoom: 8.5, tipo: "estrategico", dato: "Uno de los corredores marítimos más transitados del planeta." },
  { nombre: "Estrecho de Gibraltar", pais: "España/Marruecos", lat: 35.9500, lng: -5.6000, zoom: 10.5, tipo: "estrategico", dato: "14 km separan Europa de África y el Atlántico del Mediterráneo." },
  { nombre: "Puente de Kerch", pais: "Ucrania/Rusia", lat: 45.3054, lng: 36.5328, zoom: 12.5, tipo: "estrategico", dato: "19 km sobre el estrecho que une el mar Negro con el de Azov." },
  { nombre: "Chernóbil", pais: "Ucrania", lat: 51.3892, lng: 30.0993, zoom: 13.5, tipo: "estrategico", dato: "El accidente nuclear de 1986; hoy es zona de exclusión." },
];

const COLOR_TIPO: Record<Lugar["tipo"], string> = {
  monumento: "#F5C542",
  sede: "#7AB8FF",
  estrategico: "#FF5B4A",
};

// ============ fuentes libres (sin API key, con atribución) ============
const ESTILO: StyleSpecification = {
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    esri: {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "Imágenes © Esri, Maxar, Earthstar Geographics",
    },
    vet: {
      type: "vector",
      url: "https://tiles.openfreemap.org/planet",
      attribution: "© OpenStreetMap vía OpenFreeMap",
    },
    dem: {
      type: "raster-dem",
      tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
      encoding: "terrarium",
      tileSize: 256,
      maxzoom: 13,
      attribution: "Relieve: Mapzen/AWS Open Data",
    },
  },
  layers: [
    { id: "fondo", type: "background", paint: { "background-color": "#05070d" } },
    { id: "agua", type: "fill", source: "vet", "source-layer": "water", paint: { "fill-color": "#0a1c33" } },
    { id: "vias", type: "line", source: "vet", "source-layer": "transportation", minzoom: 9, paint: { "line-color": "rgba(122,184,255,0.28)", "line-width": 0.8 } },
    { id: "satelite", type: "raster", source: "esri", paint: { "raster-opacity": 1 } },
  ],
};

// ============ componente ============
export default function Ciudades3D() {
  const contRef = useRef<HTMLDivElement | null>(null);
  const mapaRef = useRef<MapaMl | null>(null);
  const marcadoresRef = useRef<Marker[]>([]);
  const seleccionRef = useRef<(l: Lugar) => void>(() => {});

  const [ciudadIdx, setCiudadIdx] = useState(0);
  const [satelite, setSatelite] = useState(true);
  const [edificios, setEdificios] = useState(true);
  const [relieve, setRelieve] = useState(false);
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [listo, setListo] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);

  // ---- arranque del motor (una sola vez) ----
  useEffect(() => {
    const cont = contRef.current;
    if (!cont || mapaRef.current) return;
    let mapa: MapaMl;
    try {
      mapa = new maplibregl.Map({
        container: cont,
        style: ESTILO,
        center: [CIUDADES[0].lng, CIUDADES[0].lat],
        zoom: 15.2,
        pitch: 60,
        bearing: CIUDADES[0].bearing,
        maxPitch: 75,
        attributionControl: { compact: true },
      });
    } catch {
      setFallo("Tu navegador no pudo encender el motor 3D (WebGL). La casa sigue viva en 2D.");
      return;
    }
    mapaRef.current = mapa;
    mapa.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

    mapa.on("load", () => {
      try {
        // agua y vias bajo el satélite; edificios 3D encima de todo
        mapa.addLayer({
          id: "edificios-3d",
          type: "fill-extrusion",
          source: "vet",
          "source-layer": "building",
          minzoom: 13,
          paint: {
            "fill-extrusion-color": "#93a7c4",
            "fill-extrusion-height": ["coalesce", ["get", "render_height"], 8],
            "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
            "fill-extrusion-opacity": 0.94,
          },
        });
      } catch { /* la fuente vectorial tardó: los edificios llegan en el próximo vuelo */ }
      setListo(true);
    });
    mapa.on("error", (e) => {
      // las teselas perdidas no matan la vista: solo un fallo de motor se anuncia
      const msg = String((e as unknown as { error?: { message?: string } })?.error?.message ?? "");
      if (msg.includes("WebGL")) setFallo("El motor 3D se apagó — recarga y volvemos a intentarlo.");
    });

    return () => {
      for (const m of marcadoresRef.current) m.remove();
      marcadoresRef.current = [];
      mapa.remove();
      mapaRef.current = null;
      setListo(false);
    };
  }, []);

  // ---- interruptores en vivo ----
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !mapa.isStyleLoaded()) return;
    mapa.setPaintProperty("satelite", "raster-opacity", satelite ? 1 : 0);
  }, [satelite, listo]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !mapa.getLayer("edificios-3d")) return;
    mapa.setLayoutProperty("edificios-3d", "visibility", edificios ? "visible" : "none");
  }, [edificios, listo]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    try {
      mapa.setTerrain(relieve ? { source: "dem", exaggeration: 1.35 } : null);
    } catch { /* el dem aún carga: silencioso */ }
  }, [relieve, listo]);

  // ---- marcadores de lugares importantes ----
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !listo || marcadoresRef.current.length) return;
    for (const l of LUGARES) {
      const el = document.createElement("button");
      el.style.cssText = `width:14px;height:14px;border-radius:9999px;background:${COLOR_TIPO[l.tipo]};border:2px solid #05070d;box-shadow:0 0 10px ${COLOR_TIPO[l.tipo]};cursor:pointer;padding:0`;
      el.setAttribute("aria-label", l.nombre);
      el.addEventListener("click", (e) => { e.stopPropagation(); seleccionRef.current(l); });
      const m = new maplibregl.Marker({ element: el }).setLngLat([l.lng, l.lat]).addTo(mapa);
      marcadoresRef.current.push(m);
    }
  }, [listo]);

  // ---- vuelos de cámara ----
  const volar = (lat: number, lng: number, zoom: number, bearing: number) => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    const quieto = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    mapa.flyTo({ center: [lng, lat], zoom, pitch: 60, bearing, duration: quieto ? 0 : 2200, essential: true });
  };

  const volarCiudad = (i: number) => {
    const c = CIUDADES[i];
    setCiudadIdx(i);
    setLugar(null);
    volar(c.lat, c.lng, 15.2, c.bearing);
  };

  const seleccionar = (l: Lugar) => {
    setLugar(l);
    volar(l.lat, l.lng, l.zoom, 35);
  };
  seleccionRef.current = seleccionar;

  // ---- vista ----
  return (
    <div className="space-y-2" data-vg205-ciudades3d="1">
      {/* barra de ciudades */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="ciudades 3D">
        {CIUDADES.map((c, i) => (
          <button key={c.nombre} onClick={() => volarCiudad(i)} role="tab" aria-selected={ciudadIdx === i}
            className={cnChip(ciudadIdx === i)}>
            {c.nombre}
          </button>
        ))}
      </div>

      {/* lienzo 3D */}
      <div className="relative h-[420px] sm:h-[520px] lg:h-[560px] rounded-sm overflow-hidden border border-amber-hud/40 bg-[#05070d]">
        <div ref={contRef} className="absolute inset-0" />

        {/* HUD superior: interruptores */}
        <div className="absolute top-2 left-2 z-10 flex flex-wrap items-center gap-1.5">
          <Chip on={satelite} onClick={() => setSatelite((v) => !v)}>SATÉLITE</Chip>
          <Chip on={edificios} onClick={() => setEdificios((v) => !v)}>EDIFICIOS 3D</Chip>
          <Chip on={relieve} onClick={() => setRelieve((v) => !v)}>RELIEVE</Chip>
        </div>

        {/* leyenda de lugares */}
        <div className="absolute top-2 right-2 z-10 hidden sm:flex flex-col gap-1 text-[9px] font-mono text-muted-foreground">
          {(["monumento", "sede", "estrategico"] as const).map((t) => (
            <span key={t} className="flex items-center gap-1.5 bg-black/55 rounded-sm px-1.5 py-0.5">
              <span className="w-2 h-2 rounded-full" style={{ background: COLOR_TIPO[t] }} />
              {t === "monumento" ? "MONUMENTOS" : t === "sede" ? "SEDES DE PODER" : "PUNTOS ESTRATÉGICOS"}
            </span>
          ))}
        </div>

        {/* estado de carga */}
        {!listo && !fallo && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#05070d]/80 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            cargando el mundo 3D…
          </div>
        )}
        {fallo && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#05070d]/85 text-center px-6 text-[11px] font-mono text-amber">
            {fallo}
          </div>
        )}

        {/* ficha del lugar seleccionado */}
        {lugar && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs z-10 hud-panel p-3 border-amber-hud/60 bg-black/80 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: COLOR_TIPO[lugar.tipo] }}>
                {lugar.tipo === "monumento" ? "MONUMENTO" : lugar.tipo === "sede" ? "SEDE DE PODER" : "PUNTO ESTRATÉGICO"}
              </span>
              <button onClick={() => setLugar(null)} className="text-[10px] font-mono text-muted-foreground hover:text-amber" aria-label="cerrar ficha">✕</button>
            </div>
            <div className="text-[13px] font-bold text-amber leading-tight mt-0.5">{lugar.nombre}</div>
            <div className="text-[9px] font-mono text-muted-foreground">{lugar.pais} · {lugar.lat.toFixed(4)}°, {lugar.lng.toFixed(4)}°</div>
            <p className="text-[10px] text-foreground/80 leading-snug mt-1">{lugar.dato}</p>
          </div>
        )}
      </div>

      {/* tocador de lugares importantes */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {LUGARES.map((l) => (
          <button key={l.nombre} onClick={() => seleccionar(l)}
            className={cnChip(lugar?.nombre === l.nombre) + " shrink-0"}>
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: COLOR_TIPO[l.tipo] }} />
            {l.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}

function cnChip(activo: boolean): string {
  return [
    "px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide border rounded-sm whitespace-nowrap transition-colors",
    activo
      ? "border-amber-hud text-amber bg-amber-hud/20"
      : "border-amber-hud/25 text-muted-foreground hover:border-amber-hud bg-secondary",
  ].join(" ");
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-2 py-1 text-[9px] font-mono rounded-sm border backdrop-blur-sm transition-colors ${
        on ? "border-amber-hud text-amber bg-black/70" : "border-white/20 text-muted-foreground bg-black/50"
      }`}>
      {children}
    </button>
  );
}
