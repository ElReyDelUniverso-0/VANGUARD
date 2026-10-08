"use client";

// v93.0 VANGUARD EARTH — "el googles de Vanguard"
// Espejo del simulador de satélite espía de navegador (globo 3D con contactos
// en vivo de aviones, buques, satélites, sismos, drones y cámaras públicas,
// rastreo con estela, 7 vistas de sensor, HUD militar con detecciones,
// analista por texto, director de escenas, crónicas guiadas y reset al
// planeta completo). Estructura aprendida del original; contenido, código y
// arte 100% Vanguard: el núcleo es determinista e inspeccionable.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Earth, Search, Plane, Ship, Satellite, Bug, Waves, Camera, Wind,
  Crosshair, Plus, Minus, RotateCcw, Layers, BookOpen, Clapperboard,
  Dices, X, Play, Pause, Trash2, Send, Eye, Video, Navigation, Sparkles,
} from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  LUGARES, lugarPorId, contactosEn, estelaDe, pasesSobre, cuentaAtras, veredictoDe,
  SENSORES, MISIONES, CRONICAS, preguntar, buscarLugar, vientoEn, texturaPorHora,
  distanciaKm, hhmmUTC, type Contacto, type RespuestaAnalista,
} from "@/lib/tierra-data";

// ---------- formas encadenadas mínimas de globe.gl (solo lo que usamos) ----------
type GLike = {
  width: (n: number) => GLike; height: (n: number) => GLike;
  backgroundColor: (s: string) => GLike;
  globeImageUrl: (s: string) => GLike; bumpImageUrl: (s: string) => GLike;
  showAtmosphere: (b: boolean) => GLike; atmosphereColor: (s: string) => GLike; atmosphereAltitude: (n: number) => GLike;
  showGraticules: (b: boolean) => GLike;
  pointOfView: (p?: { lat?: number; lng?: number; altitude?: number }, ms?: number) => { lat: number; lng: number; altitude: number };
  controls: () => { autoRotate: boolean; autoRotateSpeed: number; enableDamping: boolean; minDistance: number; maxDistance: number };
  pointsData: (d: unknown[]) => GLike;
  pointLat: (f: (d: object) => number) => GLike; pointLng: (f: (d: object) => number) => GLike;
  pointAltitude: (f: (d: object) => number) => GLike; pointColor: (f: (d: object) => string) => GLike;
  pointRadius: (f: (d: object) => number) => GLike; pointLabel: (f: (d: object) => string) => GLike;
  onPointClick: (f: (d: object) => void) => GLike;
  htmlElementsData: (d: unknown[]) => GLike;
  htmlLat: (f: (d: object) => number) => GLike; htmlLng: (f: (d: object) => number) => GLike;
  htmlAltitude: (f: (d: object) => number) => GLike; htmlElement: (f: (d: object) => HTMLElement) => GLike;
  htmlTransitionDuration: (n: number) => GLike;
  ringsData: (d: unknown[]) => GLike;
  ringLat: (f: (d: object) => number) => GLike; ringLng: (f: (d: object) => number) => GLike;
  ringColor: (f: (d: object) => (t: number) => string) => GLike;
  ringMaxRadius: (f: (d: object) => number) => GLike;
  ringPropagationSpeed: (n: number) => GLike; ringRepeatPeriod: (n: number) => GLike;
  pathsData: (d: unknown[]) => GLike;
  pathPoints: (f: (d: object) => unknown) => GLike;
  pathPointLat: (f: (d: object) => number) => GLike; pathPointLng: (f: (d: object) => number) => GLike;
  pathPointAlt: (f: (d: object) => number) => GLike;
  pathColor: (f: (d: object) => string) => GLike; pathStroke: (n: number) => GLike;
  pathDashLength: (n: number) => GLike; pathDashGap: (n: number) => GLike; pathDashAnimateTime: (n: number) => GLike;
  pathTransitionDuration: (n: number) => GLike;
  getScreenCoords: (lat: number, lng: number, alt?: number) => { x: number; y: number };
  _destructor?: () => void;
};

const TEXTURAS: Record<string, string> = {
  satelite: "/assets/globe/earth-blue-marble.jpg",
  noche: "/assets/globe/earth-night.jpg",
  tactico: "/assets/globe/earth-dark.jpg",
};

const COLOR_TIPO: Record<Contacto["tipo"], string> = {
  avion: "#FFD27A", buque: "#6EE7FF", satelite: "#C9A0FF", dron: "#FF8A5C", sismo: "#FF5A5A", camara: "#9BFFB0",
};
const ICONO_TIPO: Record<Contacto["tipo"], React.ReactNode> = {
  avion: <Plane className="w-3 h-3" />, buque: <Ship className="w-3 h-3" />, satelite: <Satellite className="w-3 h-3" />,
  dron: <Bug className="w-3 h-3" />, sismo: <Waves className="w-3 h-3" />, camara: <Camera className="w-3 h-3" />,
};
const ALT_VUELO: Record<Contacto["tipo"], number> = {
  avion: 0.55, buque: 0.5, satelite: 1.9, dron: 0.5, sismo: 0.7, camara: 0.45,
};

const LS_KEY = "vg-tierra-v93";

function altDePunto(c: Contacto): number {
  switch (c.tipo) {
    case "satelite": return 0.24 + Math.min(0.3, (c.altKm - 420) / 1400);
    case "avion": return 0.075;
    case "buque": return 0.015;
    case "dron": return 0.045;
    default: return 0.02;
  }
}

// etiqueta al pasar el ratón por un contacto (estilo HUD)
function tooltipDe(c: Contacto, dist: number | null): string {
  const col = COLOR_TIPO[c.tipo];
  return `
  <div style="font-family:monospace;background:#0b0e14ee;border:1px solid ${col};padding:6px 9px;border-radius:2px">
    <b style="color:${col}">${c.callsign}</b><br/>
    <span style="color:#e5e7eb">${c.nombre}</span><br/>
    <span style="color:#94a3b8;font-size:10px">${c.clase.toUpperCase()} · ${c.vel ? `${c.vel} km/h · rumbo ${c.rumbo}°` : "estático"}${dist !== null ? ` · a ${dist.toLocaleString("es")} km` : ""}</span>
  </div>`;
}

// __SEGUE__
export function TierraPanel() {
  const [t, setT] = useState(() => Date.now());
  const [capas, setCapas] = useState<Record<string, boolean>>({
    aviones: true, buques: true, satelites: true, drones: true, sismos: true, camaras: true,
  });
  const [vientos, setVientos] = useState(false);
  const [sensorId, setSensorId] = useState("normal");
  const [hudOn, setHudOn] = useState(true);
  const [detOn, setDetOn] = useState(true);
  const [tracked, setTracked] = useState<string | null>(null);
  const [sel, setSel] = useState<Contacto | null>(null);
  const [cockpit, setCockpit] = useState(false);
  const [autoGiro, setAutoGiro] = useState(true);
  const [textura, setTextura] = useState<"auto" | "satelite" | "noche" | "tactico">("auto");
  const [centro, setCentro] = useState({ lat: 22, lng: 12, alt: 2.5 });
  const [rosterOn, setRosterOn] = useState(true);
  const [q, setQ] = useState("");
  const [resp, setResp] = useState<RespuestaAnalista | null>(null);
  const [cronica, setCronica] = useState<{ id: string; idx: number } | null>(null);
  const [escenas, setEscenas] = useState<Array<{ lat: number; lng: number; alt: number; sensor: string }>>([]);
  const [hechas, setHechas] = useState<string[]>([]);
  const [manualOn, setManualOn] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<GLike | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const centroRef = useRef(centro);
  const selRef = useRef<Contacto | null>(null);
  const cronicaRef = useRef(cronica);

  useEffect(() => { centroRef.current = centro; }, [centro]);
  useEffect(() => { selRef.current = sel; }, [sel]);
  useEffect(() => { cronicaRef.current = cronica; }, [cronica]);

  // reloj del mundo: 5 s (los contactos viajan solos entre ticks)
  useEffect(() => {
    const iv = setInterval(() => setT(Date.now()), 5000);
    return () => clearInterval(iv);
  }, []);

  // persistencia local (misiones hechas + escenas del director)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { hechas?: string[]; escenas?: typeof escenas };
        if (d.hechas) setHechas(d.hechas);
        if (d.escenas) setEscenas(d.escenas);
      }
    } catch { /* noop */ }
  }, []);
  const guardar = (h: string[], e: typeof escenas) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ hechas: h, escenas: e })); } catch { /* noop */ }
  };

  const contactos = useMemo(() => contactosEn(t), [t]);
  const visibles = useMemo(() => contactos.filter((c) => capas[c.tipo === "avion" ? "aviones" : c.tipo === "buque" ? "buques" : c.tipo === "satelite" ? "satelites" : c.tipo === "dron" ? "drones" : c.tipo === "sismo" ? "sismos" : "camaras"]), [contactos, capas]);
  const contados = useMemo(() => {
    const por = (tp: Contacto["tipo"]) => contactos.filter((c) => c.tipo === tp).length;
    return { total: contactos.length, avion: por("avion"), buque: por("buque"), satelite: por("satelite"), dron: por("dron"), sismo: por("sismo"), camara: por("camara") };
  }, [contactos]);
  const trackedC = useMemo(() => contactos.find((c) => c.id === tracked) ?? null, [contactos, tracked]);
  const roster = useMemo(() => {
    const { lat, lng } = centroRef.current;
    return visibles
      .filter((c) => c.tipo !== "sismo")
      .map((c) => ({ c, d: distanciaKm(lat, lng, c.lat, c.lng) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 30);
  }, [visibles, Math.round(centro.lat), Math.round(centro.lng)]);

  const sensor = SENSORES.find((s) => s.id === sensorId) ?? SENSORES[0];
  const texturaURL = textura === "auto" ? TEXTURAS[texturaPorHora(t)] : TEXTURAS[textura];

  // ---------- vuelo cinematográfico ----------
  const vuelaA = (lat: number, lng: number, alt: number, ms = 1500) => {
    setCentro({ lat, lng, alt });
    gRef.current?.pointOfView({ lat, lng, altitude: alt }, ms);
  };

  const autoGiroRef = useRef(autoGiro);
  useEffect(() => {
    autoGiroRef.current = autoGiro;
    const g = gRef.current;
    if (g) g.controls().autoRotate = autoGiro;
  }, [autoGiro]);

  // ---------- init del globo ----------
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let muerto = false;
    let g: GLike | null = null;
    (async () => {
      const Globe = (await import("globe.gl")).default;
      if (muerto || !wrapRef.current) return;
      const W = el.clientWidth || 900;
      const H = el.clientHeight || 620;
      g = new Globe(el, { animateIn: true })
        .width(W).height(H)
        .backgroundColor("rgba(0,0,0,0)")
        .globeImageUrl(TEXTURAS.satelite)
        .bumpImageUrl("/assets/globe/earth-topology.png")
        .showAtmosphere(true).atmosphereColor("#ffb347").atmosphereAltitude(0.22)
        .showGraticules(true) as unknown as GLike;
      gRef.current = g;
      g.pointOfView({ lat: 22, lng: 12, altitude: 2.5 }, 0);
      const c = g.controls();
      c.autoRotate = true; c.autoRotateSpeed = 0.35; c.enableDamping = true;
      c.minDistance = 155; c.maxDistance = 900;
      // arrastrar apaga el autogiro unos segundos (sensación Googles)
      el.addEventListener("mousedown", () => {
        if (!g) return;
        g.controls().autoRotate = false;
        clearTimeout((el as unknown as { _giroT?: ReturnType<typeof setTimeout> })._giroT);
        (el as unknown as { _giroT?: ReturnType<typeof setTimeout> })._giroT = setTimeout(() => {
          if (g) g.controls().autoRotate = autoGiroRef.current;
        }, 6000);
      });
    })();
    return () => {
      muerto = true;
      try { g?._destructor?.(); } catch { /* noop */ }
      el.innerHTML = "";
      gRef.current = null;
    };
  }, []);

  // resize
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onR = () => {
      const g = gRef.current;
      if (g) { g.width(el.clientWidth || 900); g.height(el.clientHeight || 620); }
    };
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  // textura en caliente
  useEffect(() => { gRef.current?.globeImageUrl(texturaURL); }, [texturaURL]);

  // ---------- contacto seleccionado ----------
  const alSeleccionar = (c: Contacto) => {
    setSel(c);
    vuelaA(c.lat, c.lng, ALT_VUELO[c.tipo], 1200);
  };
  const alSeleccionarRef = useRef(alSeleccionar);
  useEffect(() => { alSeleccionarRef.current = alSeleccionar; });

  // ---------- puntos + anillos + estelas + detecciones ----------
  useEffect(() => {
    const g = gRef.current;
    if (!g) return;
    const prio = (c: Contacto) => (c.id === tracked ? 0 : c.id === sel?.id ? 1 : 2);
    const pts = [...visibles].sort((a, b) => prio(a) - prio(b)).slice(0, 96);
    g.pointsData(pts)
      .pointLat((d) => (d as Contacto).lat)
      .pointLng((d) => (d as Contacto).lng)
      .pointAltitude((d) => altDePunto(d as Contacto))
      .pointColor((d) => COLOR_TIPO[(d as Contacto).tipo])
      .pointRadius((d) => {
        const c = d as Contacto;
        if (c.id === tracked) return 0.72;
        if (c.id === sel?.id) return 0.62;
        if (c.tipo === "sismo") return 0.2 + (Number(c.nombre.match(/M([\d.]+)/)?.[1] ?? 4) - 3) * 0.16;
        return 0.4;
      })
      .pointLabel((d) => tooltipDe(d as Contacto, null))
      .onPointClick((d) => alSeleccionarRef.current(d as Contacto));

    // anillos: sismos + rastreado
    const rings: Array<{ lat: number; lng: number; col: string; max: number }> = [];
    if (capas.sismos) {
      for (const c of visibles.filter((x) => x.tipo === "sismo")) {
        rings.push({ lat: c.lat, lng: c.lng, col: COLOR_TIPO.sismo, max: 3 + (Number(c.nombre.match(/M([\d.]+)/)?.[1] ?? 4) - 3) * 2.2 });
      }
    }
    if (trackedC) rings.push({ lat: trackedC.lat, lng: trackedC.lng, col: "#FFC94D", max: 5 });
    if (sel && sel.id !== tracked) rings.push({ lat: sel.lat, lng: sel.lng, col: COLOR_TIPO[sel.tipo], max: 3.4 });
    g.ringsData(rings)
      .ringLat((r) => (r as { lat: number }).lat)
      .ringLng((r) => (r as { lng: number }).lng)
      .ringColor((r) => (tt: number) => `${(r as { col: string }).col}${Math.round((1 - tt) * 110 + 30).toString(16).padStart(2, "0")}`)
      .ringMaxRadius((r) => (r as { max: number }).max)
      .ringPropagationSpeed(2.4)
      .ringRepeatPeriod(1100);

    // estelas del rastreado / seleccionado
    const foco = trackedC ?? sel;
    g.pathsData(foco ? [{ puntos: estelaDe(foco, t) }] : [])
      .pathPoints((d) => (d as { puntos: Array<[number, number, number]> }).puntos)
      .pathPointLat((p) => (p as unknown as [number, number, number])[0])
      .pathPointLng((p) => (p as unknown as [number, number, number])[1])
      .pathPointAlt((p) => (p as unknown as [number, number, number])[2])
      .pathColor(() => "#FFC94D")
      .pathStroke(0.55)
      .pathDashLength(0.055)
      .pathDashGap(0.009)
      .pathDashAnimateTime(11000)
      .pathTransitionDuration(600);

    // overlay de detecciones (cajas con esquinas + ID, estilo HUD militar)
    if (detOn) {
      const dets = pts.slice(0, 30);
      g.htmlElementsData(dets)
        .htmlLat((d) => (d as Contacto).lat)
        .htmlLng((d) => (d as Contacto).lng)
        .htmlAltitude((d) => altDePunto(d as Contacto) + 0.02)
        .htmlTransitionDuration(400)
        .htmlElement((d) => {
          const c = d as Contacto;
          const div = document.createElement("div");
          div.className = "ve-det" + (c.id === tracked ? " ve-det-rastro" : "");
          div.style.setProperty("--det-col", COLOR_TIPO[c.tipo]);
          div.innerHTML = `<span>${c.callsign}</span>`;
          div.addEventListener("click", (ev) => { ev.stopPropagation(); alSeleccionarRef.current(c); });
          return div;
        });
    } else {
      g.htmlElementsData([]);
    }
  }, [visibles, tracked, trackedC, sel, t, capas.sismos, detOn]);

  // ---------- bucle de rastreo (seguimiento cinemático) ----------
  useEffect(() => {
    if (!tracked) return;
    const iv = setInterval(() => {
      const g = gRef.current;
      const c = contactosEn(Date.now()).find((x) => x.id === tracked);
      if (!g || !c) return;
      const alt = cockpit ? 0.24 : tracked.startsWith("sat") ? 1.9 : 0.5;
      g.pointOfView({ lat: c.lat, lng: c.lng, altitude: alt }, 850);
      setCentro({ lat: c.lat, lng: c.lng, alt });
      setSel(c);
    }, 950);
    return () => clearInterval(iv);
  }, [tracked, cockpit]);

  // ---------- capa de vientos (partículas deterministas) ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !vientos) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const N = 300;
    const parts = Array.from({ length: N }, () => ({
      lat: -70 + Math.random() * 140,
      lng: -180 + Math.random() * 360,
      vida: 20 + Math.random() * 80,
    }));
    let raf = 0;
    const paso = () => {
      const g = gRef.current;
      const el = wrapRef.current;
      if (!g || !el) { raf = requestAnimationFrame(paso); return; }
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = el.clientWidth, H = el.clientHeight;
      if (canvas.width !== W * dpr) { canvas.width = W * dpr; canvas.height = H * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const now = Date.now();
      const pov = g.pointOfView();
      for (const p of parts) {
        const w = vientoEn(p.lat, p.lng, now);
        const nLat = p.lat + w.v * 0.28;
        const nLng = p.lng + (w.u * 0.28) / Math.max(0.2, Math.cos((p.lat * Math.PI) / 180));
        // visible solo en la cara que mira a la cámara
        const dLat = nLat - pov.lat, dLng = nLng - pov.lng;
        const ang = Math.sqrt(dLat * dLat + dLng * dLng * Math.cos((pov.lat * Math.PI) / 180) ** 2);
        if (ang < 92) {
          const a = g.getScreenCoords(p.lat, p.lng, 0.015);
          const b = g.getScreenCoords(nLat, nLng, 0.015);
          if (a && b && a.x > -20 && a.x < W + 20 && a.y > -20 && a.y < H + 20) {
            ctx.strokeStyle = `rgba(255,214,150,${0.16 + 0.3 * Math.min(1, p.vida / 60)})`;
            ctx.lineWidth = 1.1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        p.lat = nLat; p.lng = nLng; p.vida -= 1;
        if (p.vida <= 0 || Math.abs(p.lat) > 88) { p.lat = -70 + Math.random() * 140; p.lng = -180 + Math.random() * 360; p.vida = 40 + Math.random() * 80; }
      }
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [vientos]);

  // ---------- pases satelitales sobre la vista seleccionada ----------
  const [pases, setPases] = useState<ReturnType<typeof pasesSobre>>([]);
  useEffect(() => {
    setPases(pasesSobre(centro.lat, centro.lng, Date.now(), 3));
  }, [sel, Math.round(centro.lat), Math.round(centro.lng)]);

  // ---------- acciones del operador ----------
  const resetGlobo = (silencio = false) => {
    setTracked(null); setSel(null); setCockpit(false); setCronica(null);
    vuelaA(22, 12, 2.5, 1400);
    if (!silencio) toast.success("PLANETA COMPLETO", { description: "Vista global restaurada. Sin rastros, sin ruido." });
  };

  const zoom = (dir: 1 | -1) => {
    const g = gRef.current;
    if (!g) return;
    const alt = g.pointOfView().altitude;
    g.pointOfView({ altitude: Math.min(4, Math.max(0.22, alt * (dir > 0 ? 0.55 : 1.8))) }, 420);
  };

  const rastrear = (c: Contacto | null) => {
    setTracked(c ? c.id : null);
    setCockpit(false);
    if (c) toast.success(`RASTREANDO ${c.callsign}`, { description: "La cámara lo sigue. Tecla C para modo cockpit · Esc para soltar." });
  };

  const analistaPregunta = (texto?: string) => {
    const pregunta = (texto ?? q).trim();
    if (!pregunta) return;
    const r = preguntar(pregunta, { lat: centro.lat, lng: centro.lng }, Date.now());
    setResp(r);
    if (r.vueloA) vuelaA(r.vueloA.lat, r.vueloA.lng, r.vueloA.alt, 1600);
    if (r.resaltar) {
      const c = contactosEn(Date.now()).find((x) => x.id === r.resaltar);
      if (c) setSel(c);
    }
    setQ("");
  };

  const lanzarMision = (m: typeof MISIONES[number]) => {
    setCapas((prev) => ({ ...prev, ...m.capas }));
    setVientos(false);
    setSensorId(m.sensor);
    vuelaA(m.vuelo.lat, m.vuelo.lng, m.vuelo.alt, 1700);
    if (!hechas.includes(m.id)) {
      const h = [...hechas, m.id];
      setHechas(h); guardar(h, escenas);
    }
    toast.success(`MISIÓN · ${m.titulo}`, { description: m.desc.slice(0, 110) + "…" });
  };

  const jugarCronica = (id: string, idx = 0) => {
    const cr = CRONICAS.find((c) => c.id === id);
    if (!cr) return;
    if (idx >= cr.paradas.length) {
      setCronica(null);
      toast.success(`CRÓNICA COMPLETADA · ${cr.titulo}`, { description: "Seis paradas, cero tregua. El planeta sigue abierto." });
      return;
    }
    const parada = cr.paradas[idx];
    const lugar = lugarPorId(parada.lugarId);
    setCronica({ id, idx });
    if (lugar) vuelaA(lugar.lat, lugar.lng, lugar.alt, 2200);
  };
  useEffect(() => {
    if (!cronica) return;
    const iv = setTimeout(() => jugarCronica(cronica.id, cronica.idx + 1), 7200);
    return () => clearTimeout(iv);
  }, [cronica]);

  const anadirEscena = () => {
    const e = { lat: Number(centro.lat.toFixed(2)), lng: Number(centro.lng.toFixed(2)), alt: Number(centro.alt.toFixed(2)), sensor: sensorId };
    const es = [...escenas, e].slice(-8);
    setEscenas(es); guardar(hechas, es);
    toast.success("VISTA AÑADIDA AL DIRECTOR", { description: `${escenas.length + 1}/8 escenas guardadas en tu mesa de edición.` });
  };
  const reproducirEscenas = () => {
    if (!escenas.length) { toast.info("SIN ESCENAS", { description: "Añade al menos una vista con AÑADIR VISTA." }); return; }
    toast.success("DIRECCIÓN DE ESCENAS", { description: `Reproduciendo ${escenas.length} vistas cinematográficas.` });
    escenas.forEach((e, i) => {
      setTimeout(() => {
        setSensorId(e.sensor);
        vuelaA(e.lat, e.lng, e.alt, 2600);
      }, i * 3400);
    });
  };

  // ---------- atajos de teclado (1-7 sensores · H HUD · D detección · C cockpit · R reset · Esc soltar) ----------
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (ev.key >= "1" && ev.key <= "7") {
        const s = SENSORES[Number(ev.key) - 1];
        setSensorId(s.id);
        toast.info(`SENSOR · ${s.nombre}`, { description: s.nota.slice(0, 90) });
      } else if (ev.key === "h" || ev.key === "H") setHudOn((v) => !v);
      else if (ev.key === "d" || ev.key === "D") setDetOn((v) => !v);
      else if (ev.key === "r" || ev.key === "R") resetGlobo();
      else if (ev.key === "g" || ev.key === "G") {
        setCapas({ aviones: true, buques: true, satelites: true, drones: true, sismos: true, camaras: true });
        setDetOn(true); setHudOn(true);
        toast.success("CONTEXTO GLOBAL ACTIVADO", { description: "Todo encendido. Tecla R para volver a la vista limpia." });
      } else if (ev.key === "c" || ev.key === "C") {
        const avion = contactosEn(Date.now()).filter((c) => c.tipo === "avion")
          .sort((a, b) => distanciaKm(centroRef.current.lat, centroRef.current.lng, a.lat, a.lng) - distanciaKm(centroRef.current.lat, centroRef.current.lng, b.lat, b.lng))[0];
        if (avion) { setSel(avion); setTracked(avion.id); setCockpit(true); vuelaA(avion.lat, avion.lng, 0.24, 1400); toast.success("MODO COCKPIT", { description: `Vuelas con ${avion.callsign}: la cámara cabalga su morro hasta que sueltes.` }); }
      } else if (ev.key === "Escape") { setTracked(null); setCockpit(false); setSel(null); setCronica(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [escenas, hechas]);

  const cronicaActiva = cronica ? CRONICAS.find((c) => c.id === cronica.id) : null;

  // ============ RENDER ============
  return (
    <div className="space-y-4">
      <PanelHeader
        title="VANGUARD EARTH"
        subtitle="El googles de Vanguard: simulador de satélite espía con contactos en vivo, sensores y vuelo cinematográfico por todo el planeta"
        icon={<Earth className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <span className="text-[9px] font-mono uppercase px-2 py-1 border border-amber-hud/60 text-amber bg-amber-hud/10">
            EN VIVO · {hhmmUTC(t)}
          </span>
        }
      />
      <HeroOro panel="tierra" />

      {/* STATS EN VIVO */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
        {[
          { k: "CONTACTOS", v: contados.total, b: "border-amber-hud/50" }, { k: "AVIONES", v: contados.avion, b: "border-yellow-500/40" },
          { k: "BUQUES", v: contados.buque, b: "border-cyan-hud/50" }, { k: "SATÉLITES", v: contados.satelite, b: "border-violet-hud/50" },
          { k: "DRONES", v: contados.dron, b: "border-orange-500/40" }, { k: "SISMOS 1H", v: contados.sismo, b: "border-red-hud/50" },
          { k: "CÁMARAS", v: contados.camara, b: "border-green-hud/50" },
        ].map((s) => (
          <div key={s.k} className={cn("hud-panel px-2 py-1.5 text-center border", s.b)}>
            <div className="text-[8px] font-mono text-muted-foreground tracking-widest">{s.k}</div>
            <div className="text-sm font-bold text-amber">{s.v}</div>
          </div>
        ))}
      </div>

      {/* MISIONES (los primeros cinco minutos) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {MISIONES.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => lanzarMision(m)}
            className={cn(
              "text-left px-3 py-2 border hud-panel hover:border-amber transition-colors group",
              hechas.includes(m.id) ? "border-green-hud/60" : "border-amber-hud/40",
            )}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber group-hover:scale-125 transition-transform" />
              <span className="text-[10px] font-black tracking-wider text-amber">{m.titulo}</span>
              {hechas.includes(m.id) && <span className="text-[8px] text-green ml-auto">✓ HECHA</span>}
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{m.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* ============ EL PLANETA ============ */}
      <div
        className="relative w-full rounded-sm overflow-hidden border border-amber-hud/40 bg-black"
        style={{ height: "min(74vh, 700px)", minHeight: 460 }}
        aria-label="Vanguard Earth: globo 3D con contactos en vivo"
      >
        {/* globo con el filtro del sensor activo */}
        <div className="absolute inset-0" style={{ filter: sensor.css === "none" ? undefined : sensor.css }}>
          <div ref={wrapRef} className="absolute inset-0" />
        </div>

        {/* overlays de sensor (CRT / NVG / FLIR / ESPECTRAL) */}
        {sensor.overlay !== "ninguno" && <div className={cn("absolute inset-0 pointer-events-none", `ve-ov-${sensor.overlay}`)} />}
        {vientos && <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />}

        {/* HUD militar */}
        {hudOn && (
          <div className="absolute inset-0 pointer-events-none ve-hud">
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between font-mono text-[9px] tracking-widest text-amber/90">
              <span>VANGUARD EARTH · SENSOR {sensor.nombre} · 21º ESPEJO</span>
              <span className="flex items-center gap-1.5">
                {tracked && <span className="ve-rec" />}{tracked ? `REC · ${trackedC?.callsign ?? ""}` : hhmmUTC(t)}
              </span>
            </div>
            <div className="ve-esquina absolute top-8 left-2" /><div className="ve-esquina absolute top-8 right-2 rotate-90" />
            <div className="ve-esquina absolute bottom-12 right-2 rotate-180" /><div className="ve-esquina absolute bottom-12 left-2 -rotate-90" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ve-cruz" />
            <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between font-mono text-[9px] text-amber/80">
              <span>LAT {centro.lat.toFixed(2)}° · LNG {centro.lng.toFixed(2)}° · ALT R×{centro.alt.toFixed(2)}</span>
              <span>{trackedC ? `OBJ ${trackedC.callsign}: ${trackedC.vel} km/h · RUMBO ${trackedC.rumbo}°` : `CAPAS ${Object.values(capas).filter(Boolean).length}/6 · ${vientos ? "VIENTOS ON" : "VIENTOS OFF"}`}</span>
            </div>
          </div>
        )}

        {/* barra de búsqueda + analista (arriba) */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[min(92%,560px)] flex gap-1.5 z-20">
          <form
            className="flex-1 flex"
            onSubmit={(e) => { e.preventDefault(); analistaPregunta(); }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busca un lugar, coordenadas (41, 28) o pregunta al analista…"
              className="flex-1 bg-black/75 border border-amber-hud/50 px-3 py-1.5 text-[11px] font-mono text-amber placeholder:text-muted-foreground/70 focus:outline-none focus:border-amber"
            />
            <button type="submit" className="bg-amber/90 text-black px-2.5 border border-amber hover:bg-amber transition-colors" title="Preguntar al analista local">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <button
            onClick={() => {
              const lugar = LUGARES[Math.floor(Math.random() * LUGARES.length)];
              vuelaA(lugar.lat, lugar.lng, lugar.alt, 1900);
              setResp({ titulo: `SUERTE DE VANGUARD · ${lugar.nombre.toUpperCase()}`, lineas: [lugar.nota] });
              toast.info("SUERTE DE VANGUARD", { description: `El dado ha caído en ${lugar.nombre}.` });
            }}
            className="bg-black/75 border border-amber-hud/50 text-amber px-2 hover:border-amber transition-colors"
            title="Suerte de Vanguard: vuela a un lugar al azar"
          >
            <Dices className="w-4 h-4" />
          </button>
        </div>

        {/* respuesta del analista */}
        <AnimatePresence>
          {resp && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-11 left-2 right-2 sm:left-auto sm:right-14 sm:w-[340px] z-30 bg-black/85 border border-amber-hud/60 p-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-[10px] font-black tracking-wider text-amber">{resp.titulo}</div>
                <button onClick={() => setResp(null)} className="text-muted-foreground hover:text-amber"><X className="w-3 h-3" /></button>
              </div>
              <ul className="mt-1 space-y-1">
                {resp.lineas.map((l, i) => <li key={i} className="text-[10px] text-foreground/90 leading-snug">{l}</li>)}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* roster de contactos (izquierda) */}
        {rosterOn ? (
          <div className="absolute top-16 bottom-24 left-2 w-[200px] z-10">
            <div className="h-full bg-black/80 border border-amber-hud/40 flex flex-col">
              <div className="px-2 py-1.5 border-b border-amber-hud/40 flex items-center justify-between">
                <span className="text-[9px] font-black tracking-widest text-amber">CONTACTOS · {roster.length}</span>
                <button onClick={() => setRosterOn(false)} className="text-muted-foreground hover:text-amber"><X className="w-3 h-3" /></button>
              </div>
              <div className="flex-1 overflow-y-auto max-h-full ve-scroll">
                {roster.map(({ c, d }) => (
                  <button
                    key={c.id}
                    onClick={() => alSeleccionar(c)}
                    className={cn("w-full text-left px-2 py-1.5 border-b border-amber-hud/15 hover:bg-amber/10 transition-colors", sel?.id === c.id && "bg-amber/15")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: COLOR_TIPO[c.tipo] }}>{ICONO_TIPO[c.tipo]}</span>
                      <span className="text-[10px] font-mono text-foreground">{c.callsign}</span>
                      {tracked === c.id && <span className="ml-auto text-[7px] font-black text-amber ve-lateja">RASTREO</span>}
                    </div>
                    <div className="text-[8px] text-muted-foreground font-mono">
                      {c.clase.toUpperCase()} · {d.toLocaleString("es")} km {c.vel ? `· ${c.vel} km/h` : ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => setRosterOn(true)} className="absolute top-16 left-2 z-10 bg-black/80 border border-amber-hud/50 text-amber text-[9px] font-black px-2 py-1.5 tracking-widest hover:border-amber">
            CONTACTOS ({roster.length})
          </button>
        )}

        {/* ficha del contacto seleccionado (derecha) */}
        <AnimatePresence>
          {sel && (
            <motion.div
              key={sel.id}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              className="absolute top-16 right-2 w-[240px] z-20 bg-black/85 border border-amber-hud/60 p-2.5 max-h-[62%] overflow-y-auto ve-scroll"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-black flex items-center gap-1.5" style={{ color: COLOR_TIPO[sel.tipo] }}>
                    {ICONO_TIPO[sel.tipo]} {sel.callsign}
                  </div>
                  <div className="text-[10px] text-foreground/90">{sel.nombre}</div>
                </div>
                <button onClick={() => setSel(null)} className="text-muted-foreground hover:text-amber"><X className="w-3 h-3" /></button>
              </div>
              <div className="mt-1.5 space-y-0.5">
                {sel.meta.map((m, i) => <p key={i} className="text-[9px] text-muted-foreground font-mono leading-snug">{m}</p>)}
              </div>
              {(() => {
                const v = veredictoDe(sel);
                return (
                  <div className="mt-2 border border-amber-hud/30 p-1.5">
                    <div className="text-[8px] font-black tracking-widest text-amber">VEREDICTO NEURONAL</div>
                    {([["RIESGO", v.riesgo, "bg-red-500"], ["TENSIÓN", v.tension, "bg-amber-500"], ["CONFIANZA", v.confianza, "bg-green-500"]] as const).map(([k, val, col]) => (
                      <div key={k} className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[8px] font-mono text-muted-foreground w-14">{k}</span>
                        <div className="flex-1 h-1.5 bg-white/10"><div className={cn("h-full", col)} style={{ width: `${val}%` }} /></div>
                        <span className="text-[8px] font-mono text-foreground">{val}</span>
                      </div>
                    ))}
                    <div className="text-[8px] text-muted-foreground mt-1">{v.sentimiento} · núcleo neuronal v3 local</div>
                  </div>
                );
              })()}
              {pases.length > 0 && (
                <div className="mt-2 border border-violet-hud/40 p-1.5">
                  <div className="text-[8px] font-black tracking-widest text-violet">PASES SOBRE TU VISTA</div>
                  {pases.map((p) => (
                    <div key={p.sat} className="text-[9px] font-mono text-muted-foreground mt-0.5">
                      {p.sat} → {cuentaAtras(p.enMs)} · {p.maxGrados}°
                    </div>
                  ))}
                </div>
              )}
              {sel.img && (
                <div className="mt-2">
                  <div className="text-[8px] font-black tracking-widest text-green mb-1 flex items-center gap-1"><Video className="w-3 h-3" /> ALIMENTACIÓN EN VIVO</div>
                  <img src={sel.img} alt={`Cámara ${sel.callsign}`} className="w-full border border-green-hud/50 ve-crt-soft" />
                </div>
              )}
              <div className="mt-2 flex gap-1.5">
                {tracked === sel.id ? (
                  <button onClick={() => rastrear(null)} className="flex-1 border border-red-hud/60 text-red text-[9px] font-black py-1.5 tracking-widest hover:bg-red/10">SOLTAR</button>
                ) : (
                  <button onClick={() => rastrear(sel)} className="flex-1 border border-amber-hud/60 text-amber text-[9px] font-black py-1.5 tracking-widest hover:bg-amber/10">RASTREAR</button>
                )}
                {tracked === sel.id && sel.tipo === "avion" && (
                  <button
                    onClick={() => { setCockpit((v) => !v); vuelaA(sel.lat, sel.lng, 0.24, 1200); }}
                    className={cn("border text-[9px] font-black py-1.5 px-2 tracking-widest", cockpit ? "bg-amber text-black border-amber" : "border-cyan-hud/60 text-cyan hover:bg-cyan/10")}
                    title="La cámara cabalga el morro del avión"
                  >
                    COCKPIT
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* controles (abajo derecha) */}
        <div className="absolute bottom-11 right-2 z-20 flex flex-col gap-1">
          <button onClick={() => zoom(1)} className="ve-btn" title="Acercar"><Plus className="w-3.5 h-3.5" /></button>
          <button onClick={() => zoom(-1)} className="ve-btn" title="Alejar"><Minus className="w-3.5 h-3.5" /></button>
          <button onClick={() => setAutoGiro((v) => !v)} className={cn("ve-btn", autoGiro && "ve-btn-on")} title="Auto-giro del planeta"><Navigation className="w-3.5 h-3.5" /></button>
          <button onClick={() => resetGlobo()} className="ve-btn" title="Reset al planeta completo (R)"><RotateCcw className="w-3.5 h-3.5" /></button>
        </div>

        {/* consola inferior: capas + sensores + director */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/85 border-t border-amber-hud/40 px-2 py-1.5 flex flex-wrap items-center gap-1">
          {(["aviones", "buques", "satelites", "drones", "sismos", "camaras"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setCapas((p) => ({ ...p, [k]: !p[k] }))}
              className={cn("ve-chip", capas[k] && "ve-chip-on")}
            >
              {k.toUpperCase()}
            </button>
          ))}
          <button onClick={() => setVientos((v) => !v)} className={cn("ve-chip", vientos && "ve-chip-on")} title="Vientos en vivo sobre el planeta"><Wind className="w-3 h-3" /> VIENTOS</button>
          <span className="w-px h-4 bg-amber-hud/30 mx-0.5" />
          {SENSORES.map((s, i) => (
            <button key={s.id} onClick={() => setSensorId(s.id)} title={`${s.nota} (tecla ${i + 1})`} className={cn("ve-chip", sensorId === s.id && "ve-chip-on")}>
              {i + 1}·{s.nombre}
            </button>
          ))}
          <span className="w-px h-4 bg-amber-hud/30 mx-0.5" />
          <button onClick={() => setHudOn((v) => !v)} className={cn("ve-chip", hudOn && "ve-chip-on")} title="HUD militar (H)">HUD</button>
          <button onClick={() => setDetOn((v) => !v)} className={cn("ve-chip", detOn && "ve-chip-on")} title="Cajas de detección (D)">DETECCIÓN</button>
          <button onClick={anadirEscena} className="ve-chip" title="Director: guardar la vista actual"><Clapperboard className="w-3 h-3" /> AÑADIR VISTA</button>
          <button onClick={reproducirEscenas} className="ve-chip" title="Director: reproducir tus escenas"><Play className="w-3 h-3" /> REPRODUCIR ({escenas.length})</button>
          {escenas.length > 0 && (
            <button onClick={() => { setEscenas([]); guardar(hechas, []); }} className="ve-chip text-red" title="Borrar escenas"><Trash2 className="w-3 h-3" /></button>
          )}
        </div>

        {/* reproductor de crónicas */}
        <AnimatePresence>
          {cronicaActiva && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[min(94%,620px)] z-30 bg-black/90 border border-amber-hud/70 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] font-black tracking-widest text-amber">CRÓNICA · {cronicaActiva.titulo} ({cronica!.idx + 1}/{cronicaActiva.paradas.length})</div>
                <button onClick={() => setCronica(null)} className="text-muted-foreground hover:text-red"><X className="w-3.5 h-3.5" /></button>
              </div>
              <p className="text-[11px] text-foreground/90 mt-1 leading-snug">{cronicaActiva.paradas[cronica!.idx].texto}</p>
              <div className="flex items-center gap-1.5 mt-2">
                {cronicaActiva.paradas.map((_, i) => (
                  <div key={i} className={cn("h-1 flex-1 transition-colors", i <= cronica!.idx ? "bg-amber" : "bg-white/15")} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CRÓNICAS GUIADAS */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber" />
          <h3 className="text-sm font-black tracking-widest text-amber">CRÓNICAS GUIADAS · VUELA LA HISTORIA</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {CRONICAS.map((cr, i) => (
            <motion.div key={cr.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="hud-panel border border-amber-hud/30 p-3">
              <div className="text-[11px] font-black text-amber">{cr.titulo}</div>
              <div className="text-[9px] text-muted-foreground italic mb-2">{cr.lema}</div>
              <p className="text-[10px] text-foreground/80 leading-snug line-clamp-2 mb-2">{cr.paradas[0].texto}</p>
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-muted-foreground">{cr.paradas.length} PARADAS · ~7 s CADA UNA</span>
                <button onClick={() => jugarCronica(cr.id, 0)} className="flex items-center gap-1 text-[9px] font-black tracking-widest text-amber hover:text-foreground transition-colors">
                  <Play className="w-3 h-3" /> VOLAR
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* MANUAL DEL OPERADOR */}
      <div className="hud-panel border border-amber-hud/30">
        <button onClick={() => setManualOn((v) => !v)} className="w-full flex items-center justify-between px-3 py-2 hover:bg-amber/5 transition-colors">
          <span className="text-[11px] font-black tracking-widest text-amber flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> MANUAL DEL OPERADOR · CÓMO SE MIRA UN PLANETA</span>
          <span className="text-[9px] font-mono text-muted-foreground">{manualOn ? "CERRAR ▲" : "ABRIR ▼"}</span>
        </button>
        {manualOn && (
          <div className="px-3 pb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-amber-hud/20 p-2.5">
              <div className="text-[10px] font-black text-amber mb-1">LOS PRIMEROS CINCO MINUTOS</div>
              <ol className="text-[10px] text-foreground/85 space-y-1 list-decimal list-inside leading-snug">
                <li>Elige una MISIÓN de la fila superior: contactos, órbita, superficie o exploración libre.</li>
                <li>Pulsa cualquier contacto del globo o de la lista: la cámara lo encierra y sube su ficha.</li>
                <li>Pulsa RASTREAR: la cámara lo sigue y dibuja su estela ámbar.</li>
                <li>Tecla C con un avión rastreado: modo cockpit, la cámara cabalga su morro.</li>
                <li>Cambia de sensor con 1-7: CRT, NVG, FLIR, TÉRMICO… el planeta entero se re-renderiza.</li>
                <li>Enciende VIENTOS y mira los alisios dibujarse sobre el mar.</li>
                <li>Pregunta al ANALISTA: «cuántos contactos», «cuándo pasa un satélite», «riesgo de Sarn».</li>
                <li>R resetea al planeta completo. Nunca estás perdido más de dos segundos.</li>
              </ol>
            </div>
            <div className="border border-amber-hud/20 p-2.5">
              <div className="text-[10px] font-black text-amber mb-1">HABLA CON EL PLANETA</div>
              <p className="text-[10px] text-foreground/85 leading-snug">La barra superior entiende recuentos («cuántos aviones»), búsquedas («Ormuz», «41, 28»), órbitas («cuándo pasa un satélite»), veredictos («riesgo del Valle del Karsk») y órdenes de vuelo («llévame a Magallanes»). El analista corre en el núcleo neuronal v3 local: sin nube, sin esperas, sin que nadie escuche la conversación.</p>
              <div className="text-[10px] font-black text-amber mb-1 mt-2">QUÉ HAY EN VIVO</div>
              <p className="text-[10px] text-foreground/85 leading-snug">{contados.total} contactos ahora mismo: {contados.avion} aviones con transpondedor, {contados.buque} buques en ruta, {contados.satelite} satélites en órbita, {contados.dron} drones orbitando zonas calientes, {contados.sismo} sismos de la última hora y {contados.camara} cámaras públicas proyectadas sobre sus ciudades.</p>
              <div className="text-[10px] font-black text-amber mb-1 mt-2">BAJO EL CAPÓ</div>
              <p className="text-[10px] text-foreground/85 leading-snug">Todo es determinista: FNV-1a + mulberry32 + círculo máximo. La misma hora produce el mismo planeta, siempre. Como el proyecto que lo inspiró, cada línea es inspeccionable — pero aquí el mundo entero es de Vanguard.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
