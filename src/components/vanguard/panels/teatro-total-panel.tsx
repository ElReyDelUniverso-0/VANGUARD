"use client";

// ============================================================================
// VANGUARD 3D · MOTOR TÁCTICO MUNDIAL 2D / 3D (MÓDULO UNIFICADO)
// Cinco herramientas integradas bajo conmutador maestro [3D] [2D] [2D + 3D]:
//   1. MUNDIAL 3D   — Cualquier lugar del planeta convertido en teatro 3D/2D
//   2. FRENTES VIVO — Frentes de guerra actuales en tiempo real (3D + 2D)
//   3. UNIFORMES 3D — Equipamiento e indumentaria táctica interactiva + NIJ
//   4. ESCUADRONES  — Formaciones militares 3D/2D con miembros y doctrina
//   5. ARMAS 3D     — Sistemas de armas con despiece CAD, rayos-X y ficha
// Primacía: VANGUARD siempre ocupa la posición #1 (primero, nunca último).
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Globe2,
  Flame,
  Shield,
  Users,
  Crosshair,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Layers,
  Eye,
  Compass,
  Crown,
  Box,
  Map as MapIcon,
  Columns2,
  Sparkles,
  Check,
  Target,
  Radio,
  Search,
  Zap,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { WorldMapSVG } from "@/components/vanguard/world-map-svg";
import {
  ARMAS_3D,
  ESCUADRONES_3D,
  LUGARES_MUNDO,
  RANKING_DOCTRINAS,
  UNIFORMES_3D,
  generarTeatroDesdeCoord,
  obtenerFrentesVivos,
  type BiomaTeatro,
  type CapaUniforme,
  type FrenteVivo3D,
  type ModoSensor,
  type TeatroMundial,
  type TipoUnidad3D,
} from "@/lib/teatro-total-data";
import {
  avanzarSimulacion,
  crearEscenarioInicial,
  crearUnidadSim,
  desplegarEscuadronEnSim,
  lanzarAtaqueQuirurgico,
  type SimEstado,
} from "@/lib/teatro-sim-engine";
import {
  MapaFrentes2D,
  MapaSimulador2D,
  PlanoArma2D,
  PlanoEscuadron2D,
  PlanoUniforme2D,
} from "@/components/vanguard/teatro3d/vistas-2d";

function CargandoVisor() {
  return (
    <div className="w-full h-[380px] rounded-lg border border-amber-hud/25 bg-black/60 flex flex-col items-center justify-center gap-2 font-mono text-xs text-muted-foreground">
      <div className="w-6 h-6 rounded-full border-2 border-amber-hud border-t-transparent animate-spin" />
      <span>Inicializando motor WebGL 3D interactivo...</span>
    </div>
  );
}

const TerrenoGuerra3D = dynamic(
  () => import("@/components/vanguard/teatro3d/terreno-guerra-3d").then((m) => m.TerrenoGuerra3D),
  { ssr: false, loading: CargandoVisor }
);
const FrentesGlobo3D = dynamic(
  () => import("@/components/vanguard/teatro3d/frentes-globo-3d").then((m) => m.FrentesGlobo3D),
  { ssr: false, loading: CargandoVisor }
);
const UniformeInteractivo3D = dynamic(
  () => import("@/components/vanguard/teatro3d/uniforme-3d").then((m) => m.UniformeInteractivo3D),
  { ssr: false, loading: CargandoVisor }
);
const EscuadronInteractivo3D = dynamic(
  () => import("@/components/vanguard/teatro3d/escuadron-3d").then((m) => m.EscuadronInteractivo3D),
  { ssr: false, loading: CargandoVisor }
);
const ArmaInteractiva3D = dynamic(
  () => import("@/components/vanguard/teatro3d/arma-3d").then((m) => m.ArmaInteractiva3D),
  { ssr: false, loading: CargandoVisor }
);

type SubModulo = "mundial" | "frentes" | "uniformes" | "escuadrones" | "armas";
type ModoVista = "3d" | "2d" | "mixto";
type AccionClic = "unidad" | "escuadron" | "ataque";

interface CableNoticia {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
}

const UNIDADES_DESPLIEGUE: { tipo: TipoUnidad3D; label: string }[] = [
  { tipo: "tank", label: "Tanque MBT" },
  { tipo: "ifv", label: "Blindado IFV" },
  { tipo: "soldier", label: "Infantería" },
  { tipo: "artillery", label: "Artillería" },
  { tipo: "sam", label: "Defensa SAM" },
  { tipo: "drone", label: "Dron FPV" },
  { tipo: "jet", label: "Caza Aéreo" },
  { tipo: "ship", label: "Corbeta Naval" },
];

const BIOMAS_OPCIONES: { id: "auto" | BiomaTeatro; label: string }[] = [
  { id: "auto", label: "Auto (por coord)" },
  { id: "urbano", label: "Urbano" },
  { id: "montana", label: "Montaña" },
  { id: "costa", label: "Costa / Estrecho" },
  { id: "desierto", label: "Desierto" },
  { id: "llanura", label: "Llanura" },
  { id: "selva", label: "Selva" },
  { id: "artico", label: "Ártico" },
];

export function TeatroTotalPanel({
  initialModulo = "mundial",
  initialFrente,
  initialLat,
  initialLng,
  initialNombre,
}: {
  initialModulo?: SubModulo;
  initialFrente?: string;
  initialLat?: number;
  initialLng?: number;
  initialNombre?: string;
} = {}) {
  const frentesVivos = useMemo(() => obtenerFrentesVivos(), []);

  const [modulo, setModulo] = useState<SubModulo>(initialModulo);
  const [vista, setVista] = useState<ModoVista>("3d");

  // ── Estado compartido de equipamiento (Uniforme + Escuadrón + Arma -> Sim) ──
  const [uniformeId, setUniformeId] = useState<string>(UNIFORMES_3D[0].id);
  const [capaUniforme, setCapaUniforme] = useState<CapaUniforme["id"]>("casco");
  const [despieceUniforme, setDespieceUniforme] = useState(false);
  const [giroUniforme, setGiroUniforme] = useState(true);

  const [escuadronId, setEscuadronId] = useState<string>(ESCUADRONES_3D[0].id);
  const [miembroActivoId, setMiembroActivoId] = useState<string>(
    ESCUADRONES_3D[0].miembros[0].id
  );
  const [giroEscuadron, setGiroEscuadron] = useState(true);

  const [armaId, setArmaId] = useState<string>(ARMAS_3D[0].id);
  const [piezaArmaId, setPiezaArmaId] = useState<string>(ARMAS_3D[0].piezas[0].id);
  const [despieceArma, setDespieceArma] = useState(0);
  const [rayosXArma, setRayosXArma] = useState(false);
  const [giroArma, setGiroArma] = useState(true);

  const uniformeSel = useMemo(
    () => UNIFORMES_3D.find((u) => u.id === uniformeId) ?? UNIFORMES_3D[0],
    [uniformeId]
  );
  const escuadronSel = useMemo(
    () => ESCUADRONES_3D.find((e) => e.id === escuadronId) ?? ESCUADRONES_3D[0],
    [escuadronId]
  );
  const armaSel = useMemo(
    () => ARMAS_3D.find((a) => a.id === armaId) ?? ARMAS_3D[0],
    [armaId]
  );

  // ── Estado del simulador mundial y lugar del planeta ──
  const lugarInicial = LUGARES_MUNDO[0]; // VANGUARD #1 primero
  const [teatro, setTeatro] = useState<TeatroMundial>(() =>
    generarTeatroDesdeCoord(lugarInicial.lat, lugarInicial.lng, lugarInicial.nombre, lugarInicial.bioma)
  );
  const [busquedaLugar, setBusquedaLugar] = useState("");
  const [coordLat, setCoordLat] = useState(String(lugarInicial.lat));
  const [coordLng, setCoordLng] = useState(String(lugarInicial.lng));
  const [nombreCustom, setNombreCustom] = useState("");
  const [biomaSelector, setBiomaSelector] = useState<"auto" | BiomaTeatro>("auto");
  const [sensor, setSensor] = useState<ModoSensor>("tactico");

  const [corriendo, setCorriendo] = useState(true);
  const [velocidad, setVelocidad] = useState<1 | 2 | 4>(1);
  const [bandoClic, setBandoClic] = useState<"A" | "B">("A");
  const [accionClic, setAccionClic] = useState<AccionClic>("unidad");
  const [tipoUnidadClic, setTipoUnidadClic] = useState<TipoUnidad3D>("tank");
  const [selectorPlanetaAbierto, setSelectorPlanetaAbierto] = useState(false);

  const [simVista, setSimVista] = useState<SimEstado>(() =>
    crearEscenarioInicial(teatro, {
      bonoBlindajeA: uniformeSel.bonoBlindajeSim,
      bonoFuegoA: armaSel.simStats.dano / 75,
    })
  );
  const simRef = useRef<SimEstado>(simVista);

  const reiniciarTeatro = useCallback(
    (nuevoTeatro: TeatroMundial, nombres?: { a?: string; b?: string }) => {
      setTeatro(nuevoTeatro);
      setCoordLat(nuevoTeatro.lat.toFixed(2));
      setCoordLng(nuevoTeatro.lng.toFixed(2));
      const inicial = crearEscenarioInicial(nuevoTeatro, {
        bonoBlindajeA: uniformeSel.bonoBlindajeSim,
        bonoFuegoA: armaSel.simStats.dano / 75,
        bandoANombre: nombres?.a,
        bandoBNombre: nombres?.b,
      });
      simRef.current = inicial;
      setSimVista(inicial);
    },
    [uniformeSel.bonoBlindajeSim, armaSel.simStats.dano]
  );

  // Bucle de simulación limpia en requestAnimationFrame (sin setState síncrono)
  useEffect(() => {
    if (!corriendo) return;
    let raf = 0;
    let ultimo = performance.now();
    let acumUI = 0;

    const tick = (ahora: number) => {
      raf = requestAnimationFrame(tick);
      const elapsedMs = Math.max(0, ahora - ultimo);
      ultimo = ahora;
      const dt = Math.min(0.05, elapsedMs / 1000) * velocidad;
      simRef.current = avanzarSimulacion(simRef.current, teatro, dt);
      acumUI += elapsedMs;
      if (acumUI >= 120) {
        acumUI = 0;
        setSimVista(simRef.current);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [corriendo, velocidad, teatro]);

  // ── Estado de Frentes en Vivo + cables reales opcionales ──
  const [frenteActivoId, setFrenteActivoId] = useState<string>(() => {
    if (initialFrente && frentesVivos.some((f) => f.id === initialFrente)) return initialFrente;
    return frentesVivos[0]?.id ?? "ucrania";
  });
  const frenteActivo: FrenteVivo3D = useMemo(
    () => frentesVivos.find((f) => f.id === frenteActivoId) ?? frentesVivos[0],
    [frentesVivos, frenteActivoId]
  );

  const [cables, setCables] = useState<CableNoticia[]>([]);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/news?limit=60", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.items)) {
          setCables(data.items);
        } else if (Array.isArray(data)) {
          setCables(data);
        }
      })
      .catch(() => {
        /* sin red o abortado: frentes siguen funcionando completos con datos OSINT */
      });
    return () => ctrl.abort();
  }, []);

  const cablesFrente = useMemo(() => {
    if (cables.length === 0) return [];
    const kws = frenteActivo.keywords.map((k) => k.toLowerCase());
    return cables
      .filter((c) => {
        const tl = c.title.toLowerCase();
        return kws.some((k) => tl.includes(k));
      })
      .slice(0, 6);
  }, [cables, frenteActivo]);

  const lugaresFiltrados = useMemo(() => {
    const q = busquedaLugar.trim().toLowerCase();
    if (!q) return LUGARES_MUNDO;
    return LUGARES_MUNDO.filter(
      (l) =>
        l.nombre.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q) ||
        l.bioma.toLowerCase().includes(q)
    );
  }, [busquedaLugar]);

  // Manejador unificado de clic sobre el terreno (3D o 2D)
  const manejarClicTerreno = useCallback(
    (nx: number, nz: number) => {
      if (accionClic === "ataque") {
        simRef.current = lanzarAtaqueQuirurgico(simRef.current, bandoClic, nx, nz, teatro);
      } else if (accionClic === "escuadron") {
        simRef.current = desplegarEscuadronEnSim(
          simRef.current,
          escuadronSel,
          bandoClic,
          nx,
          nz,
          teatro,
          uniformeSel.bonoBlindajeSim,
          armaSel.simStats.dano / 75
        );
      } else {
        const nuevoSeq = simRef.current.seq + 1;
        const u = crearUnidadSim(
          nuevoSeq,
          bandoClic,
          tipoUnidadClic,
          nx,
          nz,
          uniformeSel.bonoBlindajeSim,
          armaSel.simStats.dano / 75
        );
        simRef.current = {
          ...simRef.current,
          seq: nuevoSeq,
          unidades: [...simRef.current.unidades, u],
          bitacora: [
            {
              t: Number(simRef.current.tiempo.toFixed(1)),
              bando: bandoClic,
              texto: `${u.nombre} desplegado manualmente en (${nx.toFixed(2)}, ${nz.toFixed(2)}).`,
            },
            ...simRef.current.bitacora,
          ].slice(0, 28),
        };
      }
      setSimVista(simRef.current);
    },
    [accionClic, bandoClic, teatro, escuadronSel, tipoUnidadClic, uniformeSel.bonoBlindajeSim, armaSel.simStats.dano]
  );

  const cargarFrenteEnSimulador = (f: FrenteVivo3D) => {
    const nuevo = generarTeatroDesdeCoord(f.lat, f.lng, f.nombre, f.bioma);
    reiniciarTeatro(
      { ...nuevo, bandoA: f.bandoANombre, bandoB: f.bandoBNombre, nota: f.resumen },
      { a: f.bandoANombre, b: f.bandoBNombre }
    );
    setModulo("mundial");
    toast.success(`Frente ${f.nombre} cargado en simulador 3D/2D`, {
      description: `${f.bandoANombre} vs ${f.bandoBNombre}`,
    });
  };

  const aplicarCoordenadasCustom = () => {
    const la = parseFloat(coordLat);
    const ln = parseFloat(coordLng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) {
      toast.error("Introduce latitud y longitud numéricas válidas");
      return;
    }
    const nuevo = generarTeatroDesdeCoord(
      la,
      ln,
      nombreCustom,
      biomaSelector === "auto" ? undefined : biomaSelector
    );
    reiniciarTeatro(nuevo);
    toast.success(`Terreno 3D generado: ${nuevo.nombre}`, {
      description: `Bioma ${nuevo.bioma.toUpperCase()} · ${nuevo.lat.toFixed(2)}°, ${nuevo.lng.toFixed(2)}°`,
    });
  };

  const generarLugarAleatorio = () => {
    const seed = Math.floor(performance.now() * 100);
    const la = -58 + ((seed * 37) % 126);
    const ln = -165 + ((seed * 73) % 330);
    const nuevo = generarTeatroDesdeCoord(la, ln);
    reiniciarTeatro(nuevo);
  };

  const fuerzasA = simVista.unidades.filter((u) => u.bando === "A");
  const fuerzasB = simVista.unidades.filter((u) => u.bando === "B");
  const hpTotalA = fuerzasA.reduce((acc, u) => acc + u.hp, 0);
  const hpTotalB = fuerzasB.reduce((acc, u) => acc + u.hp, 0);
  const sumaHP = Math.max(1, hpTotalA + hpTotalB);
  const pctA = Math.round((hpTotalA / sumaHP) * 100);

  const ciudadesPinSim = useMemo(() => {
    const fMatch = frentesVivos.find((f) => f.nombre === teatro.nombre);
    if (!fMatch) return [];
    const spanLat = Math.max(0.5, fMatch.bbox.maxLat - fMatch.bbox.minLat);
    const spanLng = Math.max(0.5, fMatch.bbox.maxLng - fMatch.bbox.minLng);
    return fMatch.ciudades.slice(0, 8).map((c) => ({
      nombre: c.nombre,
      nx: Math.max(-0.85, Math.min(0.85, ((c.lng - fMatch.bbox.minLng) / spanLng) * 1.6 - 0.8)),
      nz: Math.max(-0.85, Math.min(0.85, -(((c.lat - fMatch.bbox.minLat) / spanLat) * 1.6 - 0.8))),
      estado: c.estado,
    }));
  }, [frentesVivos, teatro.nombre]);

  const alturaVisor = vista === "mixto" ? 360 : 440;

  return (
    <div className="space-y-4">
      <HeroOro panel="teatro3d" />

      {/* ── CABECERA MAESTRA VANGUARD #1 + CONMUTADOR GLOBAL 3D / 2D / MIXTO ── */}
      <div className="hud-panel border-amber-hud/45 bg-gradient-to-r from-amber-hud/12 via-black/75 to-cyan-hud/10 p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-hud/20 border border-amber-hud/60 flex items-center justify-center text-amber shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-[#FFC94D] text-black font-mono text-[10px] font-black tracking-widest shadow-[0_0_10px_rgba(255,201,77,0.28)]">
                  #1 VANGUARD SIEMPRE PRIMERO
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
                  FORJA MUNDIAL 2D / 3D · FRENTES · UNIFORMES · ESCUADRONES · ARMAS
                </span>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                Uniforme: <span className="text-amber">{uniformeSel.nombre}</span> · Escuadrón:{" "}
                <span className="text-cyan-hud">{escuadronSel.nombre}</span> · Arma:{" "}
                <span className="text-amber">{armaSel.nombre}</span>
              </p>
            </div>
          </div>

          {/* Selector Maestro 3D / 2D / 2D+3D */}
          <div
            className="flex items-center gap-1 p-1 rounded-lg bg-black/70 border border-amber-hud/40"
            role="group"
            aria-label="Selector de visualización 2D o 3D"
          >
            <button
              type="button"
              onClick={() => setVista("3d")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors",
                vista === "3d"
                  ? "bg-[#FFC94D] text-black shadow-[0_0_12px_rgba(255,201,77,0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Box className="w-3.5 h-3.5" /> 3D VIVO
            </button>
            <button
              type="button"
              onClick={() => setVista("2d")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors",
                vista === "2d"
                  ? "bg-[#38BDF8] text-black shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MapIcon className="w-3.5 h-3.5" /> 2D TÁCTICO
            </button>
            <button
              type="button"
              onClick={() => setVista("mixto")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors",
                vista === "mixto"
                  ? "bg-[#FFC94D] text-black shadow-[0_0_12px_rgba(255,201,77,0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Columns2 className="w-3.5 h-3.5" /> 2D + 3D
            </button>
          </div>
        </div>

        {/* Barra de los 5 Sub-Módulos */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "mundial" as SubModulo, label: "1. CUALQUIER LUGAR 3D/2D", icon: Globe2, badge: `${teatro.bioma.toUpperCase()}` },
            { id: "frentes" as SubModulo, label: "2. FRENTES EN VIVO", icon: Flame, badge: `${frentesVivos.length} ACTIVOS` },
            { id: "uniformes" as SubModulo, label: "3. UNIFORMES 3D/2D", icon: Shield, badge: `${UNIFORMES_3D.length} KITS` },
            { id: "escuadrones" as SubModulo, label: "4. ESCUADRONES 3D/2D", icon: Users, badge: `${ESCUADRONES_3D.length} UNIDADES` },
            { id: "armas" as SubModulo, label: "5. ARMAS 3D/2D + DESPIECE", icon: Crosshair, badge: `${ARMAS_3D.length} ARMAS` },
          ].map((m) => {
            const Icon = m.icon;
            const act = modulo === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setModulo(m.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md border font-mono text-xs font-bold uppercase tracking-wider transition-all",
                  act
                    ? "bg-amber-hud/20 border-amber-hud text-amber shadow-[0_0_14px_rgba(255,201,77,0.22)]"
                    : "bg-black/40 border-white/10 text-muted-foreground hover:text-foreground hover:border-white/25"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{m.label}</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-foreground/80">
                  {m.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MÓDULO 1: CUALQUIER LUGAR DEL MUNDO → 3D / 2D PARA SIMULACIÓN       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {modulo === "mundial" && (
        <div className="space-y-4">
          {/* Selector Universal de Cualquier Lugar del Mundo */}
          <div className="hud-panel p-3 sm:p-4 border-cyan-hud/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-hud" />
                <span className="font-mono text-xs font-bold uppercase text-foreground">
                  CONVERSOR MUNDIAL → TEATRO 3D/2D (ELIGE CUALQUIER LUGAR DEL PLANETA)
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectorPlanetaAbierto((v) => !v)}
                  className={cn(
                    "px-2.5 py-1 rounded border font-mono text-[11px] font-bold transition-colors",
                    selectorPlanetaAbierto
                      ? "bg-[#38BDF8] text-black border-[#38BDF8]"
                      : "border-cyan-hud/50 text-cyan-hud hover:bg-cyan-hud/15"
                  )}
                >
                  {selectorPlanetaAbierto ? "OCULTAR MAPA DEL PLANETA" : "ELEGIR PUNTO EN EL PLANETA"}
                </button>
                <button
                  type="button"
                  onClick={generarLugarAleatorio}
                  className="px-2.5 py-1 rounded border border-amber-hud/45 text-amber hover:bg-amber-hud/15 font-mono text-[11px] font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> LUGAR ALEATORIO
                </button>
              </div>
            </div>

            {selectorPlanetaAbierto && (
              <div className="rounded-lg border border-cyan-hud/35 bg-black/70 p-2 space-y-2">
                <p className="font-mono text-[11px] text-cyan-hud">
                  Haz clic en CUALQUIER continente, país, ciudad u océano del planeta para convertir sus coordenadas exactas en terreno 3D de simulación:
                </p>
                <div className="h-[250px]">
                  <WorldMapSVG
                    deployMode
                    onMapClick={(la, ln) => {
                      const nuevo = generarTeatroDesdeCoord(la, ln);
                      reiniciarTeatro(nuevo);
                      setSelectorPlanetaAbierto(false);
                      toast.success(`Sector (${la.toFixed(2)}°, ${ln.toFixed(2)}°) transformado a 3D`, {
                        description: `Bioma detectado: ${nuevo.bioma.toUpperCase()}`,
                      });
                    }}
                    showFronts
                    showGrid
                    className="h-full"
                  />
                </div>
              </div>
            )}

            {/* Barra de coordenadas exactas + búsqueda */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-end">
              <div className="lg:col-span-3">
                <label className="block font-mono text-[10px] text-muted-foreground mb-1">
                  FILTRAR CIUDADES / ESTRECHOS ({LUGARES_MUNDO.length})
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                  <input
                    value={busquedaLugar}
                    onChange={(e) => setBusquedaLugar(e.target.value)}
                    placeholder="Kiev, Taiwán, Santo Domingo..."
                    className="w-full pl-8 pr-2 py-1.5 rounded bg-black/60 border border-white/15 font-mono text-xs text-foreground"
                  />
                </div>
              </div>
              <div className="lg:col-span-2">
                <label className="block font-mono text-[10px] text-muted-foreground mb-1">LATITUD (-85..85)</label>
                <input
                  value={coordLat}
                  onChange={(e) => setCoordLat(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/15 font-mono text-xs text-foreground"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block font-mono text-[10px] text-muted-foreground mb-1">LONGITUD (-180..180)</label>
                <input
                  value={coordLng}
                  onChange={(e) => setCoordLng(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/15 font-mono text-xs text-foreground"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block font-mono text-[10px] text-muted-foreground mb-1">BIOMA / RELIEVE</label>
                <select
                  value={biomaSelector}
                  onChange={(e) => setBiomaSelector(e.target.value as "auto" | BiomaTeatro)}
                  className="w-full px-2 py-1.5 rounded bg-black/80 border border-white/15 font-mono text-xs text-foreground"
                >
                  {BIOMAS_OPCIONES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-3 flex gap-1.5">
                <input
                  value={nombreCustom}
                  onChange={(e) => setNombreCustom(e.target.value)}
                  placeholder="Nombre del sector (opc.)"
                  className="flex-1 min-w-0 px-2.5 py-1.5 rounded bg-black/60 border border-white/15 font-mono text-xs text-foreground"
                />
                <button
                  type="button"
                  onClick={aplicarCoordenadasCustom}
                  className="px-3 py-1.5 rounded bg-[#FFC94D] text-black font-mono text-xs font-black hover:bg-[#ffd66b] shrink-0"
                >
                  CREAR 3D
                </button>
              </div>
            </div>

            {/* Cinta de lugares mundiales (VANGUARD #1 primero) */}
            <div className="flex gap-1.5 overflow-x-auto thin-scroll pb-1">
              {lugaresFiltrados.map((l) => {
                const act = teatro.id === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() =>
                      reiniciarTeatro(generarTeatroDesdeCoord(l.lat, l.lng, l.nombre, l.bioma))
                    }
                    className={cn(
                      "px-2.5 py-1.5 rounded border font-mono text-[11px] whitespace-nowrap transition-colors flex items-center gap-1.5",
                      act
                        ? "bg-amber-hud/25 border-amber-hud text-amber font-bold"
                        : l.esVanguard
                        ? "bg-amber-hud/10 border-amber-hud/40 text-amber hover:bg-amber-hud/20"
                        : "bg-black/45 border-white/10 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {l.esVanguard && <Crown className="w-3 h-3 text-amber" />}
                    <span>{l.nombre}</span>
                    <span className="text-[9px] opacity-70">({l.bioma})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controles de Simulación + Despliegue en Clic */}
          <div className="hud-panel p-3 border-white/15 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCorriendo((c) => !c)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold",
                  corriendo ? "bg-[#FF3B30] text-white" : "bg-[#3DDC97] text-black"
                )}
              >
                {corriendo ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {corriendo ? "PAUSAR" : "SIMULAR"}
              </button>
              <button
                type="button"
                onClick={() => {
                  simRef.current = avanzarSimulacion(simRef.current, teatro, 0.2);
                  setSimVista(simRef.current);
                }}
                className="px-2.5 py-1.5 rounded border border-white/15 hover:bg-white/10 font-mono text-xs flex items-center gap-1"
                title="Avanzar un paso táctico"
              >
                <StepForward className="w-3.5 h-3.5" /> PASO
              </button>
              {([1, 2, 4] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVelocidad(v)}
                  className={cn(
                    "px-2 py-1.5 rounded border font-mono text-xs font-bold",
                    velocidad === v
                      ? "bg-amber-hud/25 border-amber-hud text-amber"
                      : "border-white/15 text-muted-foreground"
                  )}
                >
                  {v}×
                </button>
              ))}
              <button
                type="button"
                onClick={() => reiniciarTeatro(teatro)}
                className="px-2.5 py-1.5 rounded border border-white/15 hover:bg-white/10 font-mono text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> REINICIAR
              </button>
            </div>

            {/* Modos de sensor */}
            <div className="flex flex-wrap items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-cyan-hud mr-1" />
              {(
                [
                  { id: "tactico", label: "TÁCTICO" },
                  { id: "satelite", label: "SATÉLITE" },
                  { id: "nocturno", label: "NVG NOCTURNO" },
                  { id: "termico", label: "FLIR TÉRMICO" },
                ] as { id: ModoSensor; label: string }[]
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSensor(s.id)}
                  className={cn(
                    "px-2 py-1 rounded border font-mono text-[10px] font-bold",
                    sensor === s.id
                      ? "bg-cyan-hud/25 border-cyan-hud text-cyan-hud"
                      : "border-white/10 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Barra de Herramientas de Clic sobre el Mapa/Terreno */}
          <div className="hud-panel p-2.5 border-amber-hud/25 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-amber font-bold">CLIC EN TERRENO:</span>
            <button
              type="button"
              onClick={() => setBandoClic("A")}
              className={cn(
                "px-2 py-1 rounded border font-bold",
                bandoClic === "A"
                  ? "bg-[#FFC94D] text-black border-[#FFC94D]"
                  : "border-white/15 text-muted-foreground"
              )}
            >
              #1 VANGUARD (Bando A)
            </button>
            <button
              type="button"
              onClick={() => setBandoClic("B")}
              className={cn(
                "px-2 py-1 rounded border font-bold",
                bandoClic === "B"
                  ? "bg-[#FF3B30] text-white border-[#FF3B30]"
                  : "border-white/15 text-muted-foreground"
              )}
            >
              OPFOR (Bando B)
            </button>

            <span className="text-white/25">|</span>

            {(
              [
                { id: "unidad", label: "Desplegar Unidad" },
                { id: "escuadron", label: `Desplegar ${escuadronSel.simboloOTAN}` },
                { id: "ataque", label: "Ataque Misil" },
              ] as { id: AccionClic; label: string }[]
            ).map((ac) => (
              <button
                key={ac.id}
                type="button"
                onClick={() => setAccionClic(ac.id)}
                className={cn(
                  "px-2.5 py-1 rounded border",
                  accionClic === ac.id
                    ? "bg-cyan-hud/20 border-cyan-hud text-cyan-hud font-bold"
                    : "border-white/15 text-muted-foreground"
                )}
              >
                {ac.label}
              </button>
            ))}

            {accionClic === "unidad" && (
              <select
                value={tipoUnidadClic}
                onChange={(e) => setTipoUnidadClic(e.target.value as TipoUnidad3D)}
                className="px-2 py-1 rounded bg-black/80 border border-white/20 text-foreground"
              >
                {UNIDADES_DESPLIEGUE.map((u) => (
                  <option key={u.tipo} value={u.tipo}>
                    {u.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* VISOR CENTRAL 3D / 2D / MIXTO */}
          <div
            className={cn(
              "grid gap-3",
              vista === "mixto" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            )}
          >
            {(vista === "3d" || vista === "mixto") && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground px-1">
                  <span className="text-amber font-bold">
                    VISTA 3D · {teatro.nombre} ({teatro.lat.toFixed(2)}°, {teatro.lng.toFixed(2)}°)
                  </span>
                  <span>Arrastra para rotar · Rueda para zoom · Clic para desplegar</span>
                </div>
                <TerrenoGuerra3D
                  teatro={teatro}
                  simRef={simRef}
                  sensor={sensor}
                  onTerrenoClick={manejarClicTerreno}
                  ciudades={ciudadesPinSim}
                  altura={alturaVisor}
                />
              </div>
            )}

            {(vista === "2d" || vista === "mixto") && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground px-1">
                  <span className="text-cyan-hud font-bold">
                    VISTA 2D TÁCTICA · ELEVACIÓN 1:1 Y SÍMBOLOS OTAN
                  </span>
                  <span>Clic en cualquier coordenada para desplegar</span>
                </div>
                <MapaSimulador2D
                  teatro={teatro}
                  estado={simVista}
                  sensor={sensor}
                  onTerrenoClick={manejarClicTerreno}
                  altura={alturaVisor}
                />
              </div>
            )}
          </div>

          {/* Telemetría en Vivo + Primacía VANGUARD #1 + Bitácora */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Balance de fuerzas */}
            <div className="hud-panel p-3 border-amber-hud/30 space-y-2.5">
              <div className="flex items-center justify-between font-mono text-xs font-bold">
                <span className="text-amber">#1 {teatro.bandoA} ({fuerzasA.length})</span>
                <span className="text-red-hud">{teatro.bandoB} ({fuerzasB.length})</span>
              </div>
              <div className="h-3 w-full rounded-full bg-red-hud/30 overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-hud to-cyan-hud transition-all duration-200"
                  style={{ width: `${pctA}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-black/45 border border-white/10">
                  <div className="text-muted-foreground">BAJAS VANGUARD</div>
                  <div className="text-sm font-bold text-amber">{simVista.bajasA}</div>
                </div>
                <div className="p-2 rounded bg-black/45 border border-white/10">
                  <div className="text-muted-foreground">BAJAS OPFOR</div>
                  <div className="text-sm font-bold text-red-hud">{simVista.bajasB}</div>
                </div>
                <div className="p-2 rounded bg-black/45 border border-white/10">
                  <div className="text-muted-foreground">ELEVACIÓN BASE</div>
                  <div className="text-sm font-bold text-cyan-hud">{teatro.elevacionBaseM} m</div>
                </div>
                <div className="p-2 rounded bg-black/45 border border-white/10">
                  <div className="text-muted-foreground">TIEMPO SIM</div>
                  <div className="text-sm font-bold text-foreground">{simVista.tiempo.toFixed(1)} s</div>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">{teatro.nota}</p>
            </div>

            {/* Tabla de Primacía VANGUARD (#1 SIEMPRE PRIMERO) */}
            <div className="hud-panel p-3 border-amber-hud/35 space-y-2">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber">
                <Crown className="w-4 h-4" /> CLASIFICACIÓN DOCTRINAL (VANGUARD SIEMPRE #1)
              </div>
              <div className="space-y-1.5">
                {RANKING_DOCTRINAS.map((r) => (
                  <div
                    key={r.codigo}
                    className={cn(
                      "p-2 rounded border font-mono text-[11px] flex items-center justify-between gap-2",
                      r.esVanguard
                        ? "bg-amber-hud/18 border-amber-hud text-foreground"
                        : "bg-black/40 border-white/10 text-muted-foreground"
                    )}
                  >
                    <div className="min-w-0">
                      <div className={cn("font-bold truncate", r.esVanguard && "text-amber")}>
                        #{r.puesto} · {r.nombre}
                      </div>
                      <div className="text-[10px] opacity-80 truncate">{r.cobertura2D3D}</div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded font-bold shrink-0",
                        r.esVanguard ? "bg-[#FFC94D] text-black" : "bg-white/10 text-foreground"
                      )}
                    >
                      {r.indice}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bitácora Táctica en Vivo */}
            <div className="hud-panel p-3 border-white/15 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-cyan-hud">
                <span>BITÁCORA DE COMBATE</span>
                <span>{simVista.disparosA + simVista.disparosB} DISPAROS</span>
              </div>
              <div className="max-h-[210px] overflow-y-auto thin-scroll space-y-1 pr-1">
                {simVista.bitacora.map((ev, i) => (
                  <div
                    key={i}
                    className="text-[11px] font-mono p-1.5 rounded bg-black/45 border border-white/5 flex gap-2"
                  >
                    <span className="text-muted-foreground shrink-0">{ev.t.toFixed(1)}s</span>
                    <span
                      className={cn(
                        ev.bando === "A"
                          ? "text-amber"
                          : ev.bando === "B"
                          ? "text-red-hud"
                          : "text-cyan-hud"
                      )}
                    >
                      {ev.texto}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MÓDULO 2: FRENTES ACTIVOS EN VIVO AHORA MISMO (3D / 2D + CARGA)     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {modulo === "frentes" && (
        <div className="space-y-4">
          {/* Selector rápido de frentes activos */}
          <div className="flex gap-1.5 overflow-x-auto thin-scroll pb-1">
            {frentesVivos.map((f) => {
              const act = f.id === frenteActivo.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrenteActivoId(f.id)}
                  className={cn(
                    "px-3 py-2 rounded-md border font-mono text-xs whitespace-nowrap transition-colors flex items-center gap-2",
                    act
                      ? "bg-red-hud/20 border-red-hud text-foreground font-bold"
                      : "bg-black/45 border-white/10 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      f.intensidad >= 80 ? "bg-red-500 animate-pulse" : "bg-amber-400"
                    )}
                  />
                  <span>{f.nombre}</span>
                  <span className="text-[10px] text-amber font-bold">{f.intensidad}/100</span>
                </button>
              );
            })}
          </div>

          <div
            className={cn(
              "grid gap-3",
              vista === "mixto" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            )}
          >
            {(vista === "3d" || vista === "mixto") && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono px-1">
                  <span className="text-red-hud font-bold flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse" /> GLOBO 3D DE FRENTES ACTIVOS AHORA MISMO
                  </span>
                  <span className="text-muted-foreground">Clic en cualquier baliza roja del globo</span>
                </div>
                <FrentesGlobo3D
                  frentes={frentesVivos}
                  activoId={frenteActivo.id}
                  onSelectFrente={setFrenteActivoId}
                  altura={390}
                />
              </div>
            )}

            {(vista === "2d" || vista === "mixto") && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono px-1">
                  <span className="text-cyan-hud font-bold">
                    CARTA 2D PLANETARIA Y TRAZADO LOCAL DEL FRENTE
                  </span>
                  <span className="text-muted-foreground">Estimaciones OSINT declaradas</span>
                </div>
                <MapaFrentes2D
                  frentes={frentesVivos}
                  activo={frenteActivo}
                  onSelectFrente={setFrenteActivoId}
                  altura={390}
                />
              </div>
            )}
          </div>

          {/* Ficha del Frente Activo + Botón Cargar en Simulador 3D */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 hud-panel p-4 border-red-hud/35 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-hud/20 border border-red-hud/50 font-mono text-[10px] font-bold text-red-hud">
                      {frenteActivo.activa ? "FRENTE ACTIVO EN CURSO" : "TEATRO BAJO VIGILANCIA"}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      Desde: {frenteActivo.desde} · Escalada {frenteActivo.escalada}/5
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mt-1">{frenteActivo.nombre}</h3>
                  <p className="text-xs text-muted-foreground">{frenteActivo.subtitulo}</p>
                </div>
                <button
                  type="button"
                  onClick={() => cargarFrenteEnSimulador(frenteActivo)}
                  className="px-3.5 py-2 rounded-md bg-[#FFC94D] text-black font-mono text-xs font-black hover:bg-[#ffd66b] flex items-center gap-1.5 shrink-0"
                >
                  <Zap className="w-4 h-4" /> SIMULAR ESTE FRENTE EN 3D/2D
                </button>
              </div>

              <p className="text-xs leading-relaxed text-foreground/90">{frenteActivo.resumen}</p>

              {/* Fuerzas comparadas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded border border-cyan-hud/30 bg-cyan-hud/5 space-y-1">
                  <div className="font-bold text-cyan-hud">{frenteActivo.bandoANombre}</div>
                  <div>Efectivos: {frenteActivo.bandoAStats.efectivos}k · Tanques: {frenteActivo.bandoAStats.tanques}</div>
                  <div>Artillería: {frenteActivo.bandoAStats.artilleria} · Cazas: {frenteActivo.bandoAStats.aeronaves}</div>
                  <div className="text-[10px] text-muted-foreground">Apoyo: {frenteActivo.bandoAStats.apoyos}</div>
                </div>
                <div className="p-2.5 rounded border border-red-hud/30 bg-red-hud/5 space-y-1">
                  <div className="font-bold text-red-hud">{frenteActivo.bandoBNombre}</div>
                  <div>Efectivos: {frenteActivo.bandoBStats.efectivos}k · Tanques: {frenteActivo.bandoBStats.tanques}</div>
                  <div>Artillería: {frenteActivo.bandoBStats.artilleria} · Cazas: {frenteActivo.bandoBStats.aeronaves}</div>
                  <div className="text-[10px] text-muted-foreground">Apoyo: {frenteActivo.bandoBStats.apoyos}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="p-2 rounded bg-black/45 border border-white/10">
                  <span className="text-muted-foreground">Bajas (OSINT): </span>
                  <span className="text-foreground">{frenteActivo.bajas}</span>
                </div>
                <div className="p-2 rounded bg-black/45 border border-white/10">
                  <span className="text-muted-foreground">Riesgo global: </span>
                  <span className="text-amber">{frenteActivo.riesgoGlobal}</span>
                </div>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">
                Fuente: {frenteActivo.fuente} — estimaciones abiertas; Vanguard presenta hechos y cartografía aproximada.
              </p>
            </div>

            {/* Cables en vivo filtrados por frente */}
            <div className="hud-panel p-4 border-white/15 space-y-2.5">
              <div className="font-mono text-xs font-bold text-amber uppercase">
                CABLES RECIENTES DEL FRENTE
              </div>
              {cablesFrente.length === 0 ? (
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                  Catálogo OSINT del teatro cargado al 100%. Cuando el flujo de cables locales coincide con{" "}
                  <span className="text-foreground">{frenteActivo.keywords.slice(0, 3).join(", ")}</span>, aparecen aquí en vivo.
                </p>
              ) : (
                <div className="space-y-2">
                  {cablesFrente.map((c) => (
                    <div key={c.id} className="p-2 rounded bg-black/50 border border-white/10 text-xs">
                      <div className="text-foreground font-medium leading-snug">{c.title}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-1">
                        {c.source} · {new Date(c.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MÓDULO 3: UNIFORMES TÁCTICOS 3D / 2D INTERACTIVOS CON INFORMACIÓN   */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {modulo === "uniformes" && (
        <div className="space-y-4">
          <div className="flex gap-1.5 overflow-x-auto thin-scroll pb-1">
            {UNIFORMES_3D.map((u) => {
              const act = u.id === uniformeSel.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUniformeId(u.id)}
                  className={cn(
                    "px-3 py-2 rounded-md border font-mono text-xs whitespace-nowrap flex items-center gap-1.5 transition-colors",
                    act
                      ? "bg-amber-hud/25 border-amber-hud text-amber font-bold"
                      : u.esVanguard
                      ? "bg-amber-hud/10 border-amber-hud/40 text-amber"
                      : "bg-black/45 border-white/10 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {u.esVanguard && <Crown className="w-3.5 h-3.5" />}
                  <span>#{u.rango} {u.nombre}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 hud-panel p-2.5 border-white/15">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setDespieceUniforme((d) => !d)}
                className={cn(
                  "px-3 py-1.5 rounded border font-mono text-xs font-bold flex items-center gap-1.5",
                  despieceUniforme
                    ? "bg-[#FFC94D] text-black border-[#FFC94D]"
                    : "border-white/20 text-foreground hover:bg-white/10"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                {despieceUniforme ? "UNIR CAPAS 3D" : "SEPARAR CAPAS (DESPIECE)"}
              </button>
              <button
                type="button"
                onClick={() => setGiroUniforme((g) => !g)}
                className={cn(
                  "px-3 py-1.5 rounded border font-mono text-xs font-bold",
                  giroUniforme
                    ? "bg-cyan-hud/20 border-cyan-hud text-cyan-hud"
                    : "border-white/20 text-muted-foreground"
                )}
              >
                {giroUniforme ? "AUTO-GIRO ON" : "AUTO-GIRO OFF"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                reiniciarTeatro(teatro);
                toast.success(`Equipado: ${uniformeSel.nombre}`, {
                  description: `Bono blindaje aplicado a unidades Vanguard (×${uniformeSel.bonoBlindajeSim})`,
                });
              }}
              className="px-3 py-1.5 rounded bg-[#FFC94D] text-black font-mono text-xs font-black hover:bg-[#ffd66b] flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> EQUIPAR EN SIMULACIÓN 3D
            </button>
          </div>

          <div
            className={cn(
              "grid gap-3",
              vista === "mixto" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-12"
            )}
          >
            <div className={cn(vista === "mixto" ? "lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-3" : "lg:col-span-7")}>
              {(vista === "3d" || vista === "mixto") && (
                <UniformeInteractivo3D
                  uniforme={uniformeSel}
                  capaActiva={capaUniforme}
                  despiece={despieceUniforme}
                  autoGiro={giroUniforme}
                  onSelectCapa={setCapaUniforme}
                  altura={390}
                />
              )}
              {(vista === "2d" || vista === "mixto") && (
                <PlanoUniforme2D
                  uniforme={uniformeSel}
                  capaActiva={capaUniforme}
                  onSelectCapa={setCapaUniforme}
                  altura={390}
                />
              )}
            </div>

            {/* Ficha Técnica Completa del Uniforme */}
            <div className={cn("hud-panel p-4 border-amber-hud/30 space-y-3", vista === "mixto" ? "lg:col-span-2" : "lg:col-span-5")}>
              <div>
                <div className="text-[10px] font-mono text-amber uppercase font-bold">
                  {uniformeSel.faccion} · {uniformeSel.era}
                </div>
                <h3 className="text-lg font-bold text-foreground">{uniformeSel.nombre}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{uniformeSel.doctrina}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-black/45 border border-white/10">
                  <div className="text-muted-foreground">PROTECCIÓN</div>
                  <div className="font-bold text-amber">{uniformeSel.nivelNIJ}</div>
                </div>
                <div className="p-2 rounded bg-black/45 border border-white/10">
                  <div className="text-muted-foreground">PESO / SIGILO IR</div>
                  <div className="font-bold text-cyan-hud">
                    {uniformeSel.pesoTotalKg} kg · -{uniformeSel.sigiloIR}% IR
                  </div>
                </div>
              </div>

              {/* Capas interactivas clicables */}
              <div className="space-y-1.5">
                <div className="font-mono text-[10px] text-muted-foreground uppercase">
                  COMPONENTES (CLIC EN 3D, 2D O AQUÍ PARA INSPECCIONAR):
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {uniformeSel.capas.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCapaUniforme(c.id)}
                      className={cn(
                        "p-2 rounded border text-left font-mono text-[11px] transition-colors",
                        capaUniforme === c.id
                          ? "bg-amber-hud/20 border-amber-hud text-foreground"
                          : "bg-black/40 border-white/10 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="font-bold text-amber truncate">{c.nombre}</div>
                      <div className="text-[10px] opacity-80 truncate">{c.proteccion}</div>
                    </button>
                  ))}
                </div>
                {(() => {
                  const cap = uniformeSel.capas.find((x) => x.id === capaUniforme) ?? uniformeSel.capas[0];
                  return (
                    <div className="p-2.5 rounded bg-black/60 border border-amber-hud/35 text-xs space-y-1">
                      <div className="font-mono font-bold text-amber">
                        {cap.nombre} ({cap.pesoKg} kg)
                      </div>
                      <div className="text-[11px] font-mono text-cyan-hud">Material: {cap.material}</div>
                      <p className="text-muted-foreground leading-snug">{cap.desc}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Eficacia de camuflaje por bioma */}
              <div className="space-y-1 pt-1">
                <div className="font-mono text-[10px] text-muted-foreground uppercase">
                  CAMUFLAJE POR TERRENO (%)
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-mono">
                  {(Object.entries(uniformeSel.camuflaje) as [BiomaTeatro, number][]).map(([bio, val]) => (
                    <div key={bio} className="flex items-center gap-2">
                      <span className="w-16 uppercase text-muted-foreground">{bio}</span>
                      <div className="flex-1 h-1.5 rounded bg-white/10 overflow-hidden">
                        <div className="h-full bg-[#FFC94D]" style={{ width: `${val}%` }} />
                      </div>
                      <span className="w-7 text-right text-foreground">{val}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MÓDULO 4: ESCUADRONES 3D / 2D INTERACTIVOS CON INFORMACIÓN          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {modulo === "escuadrones" && (
        <div className="space-y-4">
          <div className="flex gap-1.5 overflow-x-auto thin-scroll pb-1">
            {ESCUADRONES_3D.map((e) => {
              const act = e.id === escuadronSel.id;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    setEscuadronId(e.id);
                    setMiembroActivoId(e.miembros[0].id);
                  }}
                  className={cn(
                    "px-3 py-2 rounded-md border font-mono text-xs whitespace-nowrap flex items-center gap-1.5 transition-colors",
                    act
                      ? "bg-cyan-hud/25 border-cyan-hud text-cyan-hud font-bold"
                      : e.esVanguard
                      ? "bg-amber-hud/10 border-amber-hud/45 text-amber"
                      : "bg-black/45 border-white/10 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {e.esVanguard && <Crown className="w-3.5 h-3.5 text-amber" />}
                  <span>#{e.rango} {e.nombre}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 hud-panel p-2.5 border-white/15">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-cyan-hud/20 border border-cyan-hud/50 text-cyan-hud font-bold">
                OTAN: {escuadronSel.simboloOTAN}
              </span>
              <span className="text-muted-foreground">{escuadronSel.efectivos}</span>
              <button
                type="button"
                onClick={() => setGiroEscuadron((g) => !g)}
                className="px-2.5 py-1 rounded border border-white/20 text-[11px] font-bold hover:bg-white/10"
              >
                {giroEscuadron ? "PAUSAR ÓRBITA" : "ROTAR 3D"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                simRef.current = desplegarEscuadronEnSim(
                  simRef.current,
                  escuadronSel,
                  "A",
                  -0.25,
                  0.0,
                  teatro,
                  uniformeSel.bonoBlindajeSim,
                  armaSel.simStats.dano / 75
                );
                setSimVista(simRef.current);
                setModulo("mundial");
                toast.success(`${escuadronSel.nombre} desplegado en el teatro ${teatro.nombre}`);
              }}
              className="px-3.5 py-1.5 rounded bg-[#FFC94D] text-black font-mono text-xs font-black hover:bg-[#ffd66b] flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" /> DESPLEGAR ESCUADRÓN EN SIMULACIÓN
            </button>
          </div>

          <div
            className={cn(
              "grid gap-3",
              vista === "mixto" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-12"
            )}
          >
            <div className={cn(vista === "mixto" ? "lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-3" : "lg:col-span-7")}>
              {(vista === "3d" || vista === "mixto") && (
                <EscuadronInteractivo3D
                  escuadron={escuadronSel}
                  miembroActivoId={miembroActivoId}
                  autoGiro={giroEscuadron}
                  onSelectMiembro={setMiembroActivoId}
                  altura={390}
                />
              )}
              {(vista === "2d" || vista === "mixto") && (
                <PlanoEscuadron2D
                  escuadron={escuadronSel}
                  miembroActivoId={miembroActivoId}
                  onSelectMiembro={setMiembroActivoId}
                  altura={390}
                />
              )}
            </div>

            <div className={cn("hud-panel p-4 border-cyan-hud/30 space-y-3", vista === "mixto" ? "lg:col-span-2" : "lg:col-span-5")}>
              <div>
                <h3 className="text-lg font-bold text-foreground">{escuadronSel.nombre}</h3>
                <div className="text-xs font-mono text-cyan-hud">{escuadronSel.rolTactico}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{escuadronSel.doctrina}</p>
              </div>

              {/* Estadísticas de combate */}
              <div className="space-y-1.5 text-[11px] font-mono">
                {(
                  [
                    { k: "Potencia Fuego", v: escuadronSel.stats.fuego },
                    { k: "Blindaje / Supervivencia", v: escuadronSel.stats.blindaje },
                    { k: "Movilidad", v: escuadronSel.stats.movilidad },
                    { k: "Sigilo", v: escuadronSel.stats.sigilo },
                    { k: "Guerra Electrónica", v: escuadronSel.stats.ew },
                  ] as const
                ).map((st) => (
                  <div key={st.k} className="flex items-center gap-2">
                    <span className="w-36 text-muted-foreground">{st.k}</span>
                    <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-hud to-amber-hud" style={{ width: `${st.v}%` }} />
                    </div>
                    <span className="w-8 text-right font-bold text-foreground">{st.v}</span>
                  </div>
                ))}
              </div>

              {/* Integrantes del Escuadrón */}
              <div className="space-y-1.5">
                <div className="font-mono text-[10px] text-muted-foreground uppercase">
                  INTEGRANTES DEL ESCUADRÓN ({escuadronSel.miembros.length}) — TOCA CUALQUIERA:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {escuadronSel.miembros.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMiembroActivoId(m.id)}
                      className={cn(
                        "px-2 py-1 rounded border font-mono text-[10.5px] transition-colors",
                        miembroActivoId === m.id
                          ? "bg-amber-hud/25 border-amber-hud text-amber font-bold"
                          : "bg-black/45 border-white/10 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {m.rol}
                    </button>
                  ))}
                </div>
                {(() => {
                  const mb =
                    escuadronSel.miembros.find((x) => x.id === miembroActivoId) ??
                    escuadronSel.miembros[0];
                  return (
                    <div className="p-2.5 rounded bg-black/60 border border-cyan-hud/35 text-xs space-y-1">
                      <div className="font-mono font-bold text-amber">{mb.rol}</div>
                      <div className="font-mono text-[11px] text-cyan-hud">Armamento: {mb.arma}</div>
                      <p className="text-muted-foreground">{mb.detalle}</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MÓDULO 5: ARMAS 3D / 2D INTERACTIVAS CON DESPIECE Y FICHA BALÍSTICA */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {modulo === "armas" && (
        <div className="space-y-4">
          <div className="flex gap-1.5 overflow-x-auto thin-scroll pb-1">
            {ARMAS_3D.map((a) => {
              const act = a.id === armaSel.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setArmaId(a.id);
                    setPiezaArmaId(a.piezas[0].id);
                  }}
                  className={cn(
                    "px-3 py-2 rounded-md border font-mono text-xs whitespace-nowrap flex items-center gap-1.5 transition-colors",
                    act
                      ? "bg-amber-hud/25 border-amber-hud text-amber font-bold"
                      : a.esVanguard
                      ? "bg-amber-hud/10 border-amber-hud/45 text-amber"
                      : "bg-black/45 border-white/10 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {a.esVanguard && <Crown className="w-3.5 h-3.5" />}
                  <span>#{a.rango} {a.nombre}</span>
                </button>
              );
            })}
          </div>

          {/* Controles CAD de despiece + Rayos X + Giro */}
          <div className="hud-panel p-3 border-white/15 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
              <div className="flex items-center gap-2 font-mono text-xs">
                <SlidersHorizontal className="w-4 h-4 text-amber" />
                <span className="font-bold text-amber">DESPIECE 3D / 2D:</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(despieceArma * 100)}
                  onChange={(e) => setDespieceArma(Number(e.target.value) / 100)}
                  className="w-28 sm:w-36 accent-[#FFC94D]"
                  aria-label="Nivel de despiece del arma"
                />
                <span className="w-9 text-foreground font-bold">{Math.round(despieceArma * 100)}%</span>
              </div>
              <button
                type="button"
                onClick={() => setRayosXArma((r) => !r)}
                className={cn(
                  "px-2.5 py-1 rounded border font-mono text-xs font-bold",
                  rayosXArma
                    ? "bg-[#38BDF8] text-black border-[#38BDF8]"
                    : "border-white/20 text-muted-foreground hover:text-foreground"
                )}
              >
                {rayosXArma ? "RAYOS-X ON" : "RAYOS-X / MALLA"}
              </button>
              <button
                type="button"
                onClick={() => setGiroArma((g) => !g)}
                className={cn(
                  "px-2.5 py-1 rounded border font-mono text-xs font-bold",
                  giroArma
                    ? "bg-amber-hud/20 border-amber-hud text-amber"
                    : "border-white/20 text-muted-foreground"
                )}
              >
                {giroArma ? "GIRO 360° ON" : "GIRO OFF"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                reiniciarTeatro(teatro);
                toast.success(`Arma asignada: ${armaSel.nombre}`, {
                  description: `Potencia de fuego del Bando #1 ajustada al sistema (${armaSel.simStats.dano}/100)`,
                });
              }}
              className="px-3.5 py-1.5 rounded bg-[#FFC94D] text-black font-mono text-xs font-black hover:bg-[#ffd66b] flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> ASIGNAR A SIMULACIÓN 3D
            </button>
          </div>

          <div
            className={cn(
              "grid gap-3",
              vista === "mixto" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-12"
            )}
          >
            <div className={cn(vista === "mixto" ? "lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-3" : "lg:col-span-7")}>
              {(vista === "3d" || vista === "mixto") && (
                <ArmaInteractiva3D
                  arma={armaSel}
                  piezaActivaId={piezaArmaId}
                  despiece={despieceArma}
                  rayosX={rayosXArma}
                  autoGiro={giroArma}
                  onSelectPieza={setPiezaArmaId}
                  altura={390}
                />
              )}
              {(vista === "2d" || vista === "mixto") && (
                <PlanoArma2D
                  arma={armaSel}
                  piezaActivaId={piezaArmaId}
                  despiece={despieceArma}
                  onSelectPieza={setPiezaArmaId}
                  altura={390}
                />
              )}
            </div>

            <div className={cn("hud-panel p-4 border-amber-hud/30 space-y-3", vista === "mixto" ? "lg:col-span-2" : "lg:col-span-5")}>
              <div>
                <div className="text-[10px] font-mono text-amber uppercase font-bold">
                  {armaSel.categoria} · {armaSel.origen}
                </div>
                <h3 className="text-lg font-bold text-foreground">{armaSel.nombre}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{armaSel.resumen}</p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                <div className="p-2 rounded bg-black/45 border border-white/10">
                  <div className="text-muted-foreground">CALIBRE / OJIVA</div>
                  <div className="font-bold text-foreground">{armaSel.specs.calibre}</div>
                </div>
                <div className="p-2 rounded bg-black/45 border border-white/10">
                  <div className="text-muted-foreground">VELOCIDAD</div>
                  <div className="font-bold text-cyan-hud">{armaSel.specs.velocidad}</div>
                </div>
                <div className="p-2 rounded bg-black/45 border border-white/10">
                  <div className="text-muted-foreground">ALCANCE</div>
                  <div className="font-bold text-amber">{armaSel.specs.alcance}</div>
                </div>
                <div className="p-2 rounded bg-black/45 border border-white/10">
                  <div className="text-muted-foreground">CADENCIA</div>
                  <div className="font-bold text-foreground">{armaSel.specs.cadencia}</div>
                </div>
                <div className="p-2 rounded bg-black/45 border border-white/10">
                  <div className="text-muted-foreground">PENETRACIÓN</div>
                  <div className="font-bold text-red-hud">{armaSel.specs.penetracion}</div>
                </div>
                <div className="p-2 rounded bg-black/45 border border-white/10">
                  <div className="text-muted-foreground">GUIADO / PESO</div>
                  <div className="font-bold text-foreground">{armaSel.specs.peso}</div>
                </div>
              </div>

              {/* Piezas interactivas */}
              <div className="space-y-1.5">
                <div className="font-mono text-[10px] text-muted-foreground uppercase">
                  ARQUITECTURA Y PIEZAS (CLIC EN 3D, 2D O AQUÍ):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {armaSel.piezas.map((pz) => (
                    <button
                      key={pz.id}
                      type="button"
                      onClick={() => setPiezaArmaId(pz.id)}
                      className={cn(
                        "px-2 py-1 rounded border font-mono text-[10.5px] transition-colors",
                        piezaArmaId === pz.id
                          ? "bg-amber-hud/25 border-amber-hud text-amber font-bold"
                          : "bg-black/45 border-white/10 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {pz.nombre}
                    </button>
                  ))}
                </div>
                {(() => {
                  const pz = armaSel.piezas.find((x) => x.id === piezaArmaId) ?? armaSel.piezas[0];
                  return (
                    <div className="p-2.5 rounded bg-black/60 border border-amber-hud/35 text-xs space-y-1">
                      <div className="font-mono font-bold text-amber">{pz.nombre}</div>
                      <p className="text-muted-foreground">{pz.desc}</p>
                    </div>
                  );
                })()}
              </div>

              <p className="text-[11px] font-mono text-foreground/80 border-t border-white/10 pt-2">
                <b className="text-amber">Impacto táctico:</b> {armaSel.impacto} · Coste est.: {armaSel.specs.coste}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
