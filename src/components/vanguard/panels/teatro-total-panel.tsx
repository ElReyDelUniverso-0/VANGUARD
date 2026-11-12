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
import Link from "next/link";
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
  Atom,
  History,
  Flag,
  Plus,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { WorldMapSVG } from "@/components/vanguard/world-map-svg";
import { PAISES_ATLAS } from "@/lib/atlas-data";
import { CABEZAS } from "@/lib/detonacion-data";
import { HISTORICAL_WARS } from "@/lib/game-data";
import {
  ARMAS_3D,
  ESCUADRONES_3D,
  LUGARES_MUNDO,
  RANKING_DOCTRINAS,
  UNIFORMES_3D,
  generarTeatroDesdeCoord,
  obtenerContextoTeatro,
  obtenerFrentesVivos,
  teatroDesdeFaccionCustom,
  teatroDesdeGuerraHistorica,
  teatroDesdePaisReal,
  type BiomaTeatro,
  type CapaUniforme,
  type FaccionCustom,
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
  desplegarFormacionTactica,
  lanzarAtaqueNuclear,
  lanzarAtaqueQuirurgico,
  type FormacionTactica,
  type SimEstado,
} from "@/lib/teatro-sim-engine";
import {
  MapaFrentes2D,
  MapaSimulador2D,
  PlanoArma2D,
  PlanoEscuadron2D,
  PlanoUniforme2D,
} from "@/components/vanguard/teatro3d/vistas-2d";
import { precargarModelosPrincipales } from "@/components/vanguard/teatro3d/glb-engine";

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
type AccionClic = "unidad" | "escuadron" | "formacion" | "ataque" | "nuclear";
type ModoSimulacionTeatro = "real" | "libre" | "tiempo";

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
  initialModoSim,
  initialWarId,
  initialPaisA,
  initialPaisB,
}: {
  initialModulo?: SubModulo;
  initialFrente?: string;
  initialLat?: number;
  initialLng?: number;
  initialNombre?: string;
  initialModoSim?: ModoSimulacionTeatro;
  initialWarId?: string;
  initialPaisA?: string;
  initialPaisB?: string;
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
  const tieneCoordInicial =
    typeof initialLat === "number" &&
    typeof initialLng === "number" &&
    Number.isFinite(initialLat) &&
    Number.isFinite(initialLng);
  const lugarInicial = LUGARES_MUNDO[0]; // VANGUARD #1 primero

  const [modoSim, setModoSim] = useState<ModoSimulacionTeatro>(() => {
    if (initialModoSim) return initialModoSim;
    if (initialWarId) return "tiempo";
    if (initialPaisA || initialPaisB) return "libre";
    return "real";
  });
  const [paisAId, setPaisAId] = useState<string>(() => initialPaisA || PAISES_ATLAS[0]?.id || "us");
  const [paisBId, setPaisBId] = useState<string>(
    () => initialPaisB || PAISES_ATLAS.find((p) => p.id !== (initialPaisA || PAISES_ATLAS[0]?.id))?.id || "cn"
  );
  const [campoPais, setCampoPais] = useState<"A" | "B" | "frontera">("frontera");
  const [customPaisNombre, setCustomPaisNombre] = useState("República Soberana del Caribe");
  const [customPaisSigla, setCustomPaisSigla] = useState("RSC");
  const [customPaisCapital, setCustomPaisCapital] = useState("Puerto Nueva Aurora");
  const [customPaisDoctrina, setCustomPaisDoctrina] = useState("Fuerza combinada naval y drones de defensa");
  const [customBandoDestino, setCustomBandoDestino] = useState<"A" | "B">("A");
  const [warHistId, setWarHistId] = useState<string>(() => initialWarId || HISTORICAL_WARS[0]?.id || "");
  const [formacionClic, setFormacionClic] = useState<FormacionTactica>("cuna");
  const [cabezaId, setCabezaId] = useState<string>(() => CABEZAS[2]?.id || CABEZAS[0].id);

  const [teatro, setTeatro] = useState<TeatroMundial>(() => {
    if (initialWarId) {
      const h = teatroDesdeGuerraHistorica(initialWarId);
      if (h) return h;
    }
    if (initialPaisA && initialPaisB) {
      return teatroDesdePaisReal(initialPaisA, initialPaisB, "frontera");
    }
    return tieneCoordInicial
      ? generarTeatroDesdeCoord(
          initialLat,
          initialLng,
          initialNombre?.trim() || `Sector ${initialLat.toFixed(2)}°, ${initialLng.toFixed(2)}°`
        )
      : generarTeatroDesdeCoord(lugarInicial.lat, lugarInicial.lng, lugarInicial.nombre, lugarInicial.bioma);
  });
  const [busquedaLugar, setBusquedaLugar] = useState("");
  const [coordLat, setCoordLat] = useState(
    tieneCoordInicial ? initialLat.toFixed(2) : String(lugarInicial.lat)
  );
  const [coordLng, setCoordLng] = useState(
    tieneCoordInicial ? initialLng.toFixed(2) : String(lugarInicial.lng)
  );
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
    const w = window as unknown as { __vgvivo?: boolean; __vgcasa?: boolean };
    w.__vgcasa = true;
    w.__vgvivo = true;
    const t = window.setTimeout(() => precargarModelosPrincipales(), 3500);
    return () => window.clearTimeout(t);
  }, []);

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

  const cabezaSel = useMemo(
    () => CABEZAS.find((c) => c.id === cabezaId) ?? CABEZAS[0],
    [cabezaId]
  );

  const contextoTeatro = useMemo(() => obtenerContextoTeatro(teatro), [teatro]);

  const cablesContexto = useMemo(() => {
    if (cables.length === 0) return [];
    const kws = contextoTeatro.keywordsOSINT.map((k) => k.toLowerCase());
    const filtrados = cables.filter((c) => {
      const tl = c.title.toLowerCase();
      return kws.some((k) => k.length > 2 && tl.includes(k));
    });
    return (filtrados.length > 0 ? filtrados : cables).slice(0, 6);
  }, [cables, contextoTeatro.keywordsOSINT]);

  // Manejador unificado de clic sobre el terreno (3D o 2D)
  const manejarClicTerreno = useCallback(
    (nx: number, nz: number) => {
      if (accionClic === "nuclear") {
        simRef.current = lanzarAtaqueNuclear(
          simRef.current,
          bandoClic,
          nx,
          nz,
          cabezaSel.kt,
          cabezaSel.nombre,
          teatro
        );
        toast.warning(`Impacto simulado ${cabezaSel.nombre} (${cabezaSel.kt} kt)`, {
          description: "Simulación táctica/estratégica ficticia en visor 3D",
        });
      } else if (accionClic === "ataque") {
        simRef.current = lanzarAtaqueQuirurgico(simRef.current, bandoClic, nx, nz, teatro);
      } else if (accionClic === "formacion") {
        simRef.current = desplegarFormacionTactica(
          simRef.current,
          bandoClic,
          formacionClic,
          nx,
          nz,
          teatro,
          `${escuadronSel.nombre} (${formacionClic.toUpperCase()})`,
          uniformeSel.bonoBlindajeSim,
          armaSel.simStats.dano / 75
        );
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
    [
      accionClic,
      bandoClic,
      teatro,
      cabezaSel,
      formacionClic,
      escuadronSel,
      tipoUnidadClic,
      uniformeSel.bonoBlindajeSim,
      armaSel.simStats.dano,
    ]
  );

  const lanzarDueloPaisesReales = () => {
    const t = teatroDesdePaisReal(paisAId, paisBId, campoPais);
    if (!t) {
      toast.error("Selecciona dos países válidos de la lista");
      return;
    }
    reiniciarTeatro(t, { a: t.bandoA, b: t.bandoB });
    toast.success(`Simulación Ficción 3D: ${t.bandoA} vs ${t.bandoB}`, {
      description: `Teatro: ${t.nombre} (${t.bioma.toUpperCase()}) · Solo simulación`,
    });
  };

  const crearYDesplegarPaisCustom = () => {
    const la = Number.parseFloat(coordLat);
    const ln = Number.parseFloat(coordLng);
    const faccionUser: FaccionCustom = {
      id: `custom-${Date.now()}`,
      nombre: customPaisNombre.trim() || "País Soberano",
      sigla: (customPaisSigla.trim() || "CST").toUpperCase().slice(0, 4),
      color: customBandoDestino === "A" ? "#FFC94D" : "#FF3B30",
      capital: customPaisCapital.trim() || "Ciudad Central",
      doctrina: customPaisDoctrina.trim() || "Fuerza combinada",
      bonoBlindaje: 1.05,
      bonoFuego: 1.05,
    };
    const faccionRival: FaccionCustom = {
      id: "rival-opfor",
      nombre: customBandoDestino === "A" ? teatro.bandoB : teatro.bandoA,
      sigla: "OPF",
      color: customBandoDestino === "A" ? "#FF3B30" : "#FFC94D",
      capital: teatro.nombre,
      doctrina: "Fuerza combinada regional",
      bonoBlindaje: 1.0,
      bonoFuego: 1.0,
    };
    const t =
      customBandoDestino === "A"
        ? teatroDesdeFaccionCustom(
            faccionUser,
            faccionRival,
            Number.isFinite(la) ? la : teatro.lat,
            Number.isFinite(ln) ? ln : teatro.lng,
            customPaisCapital.trim() || teatro.nombre
          )
        : teatroDesdeFaccionCustom(
            faccionRival,
            faccionUser,
            Number.isFinite(la) ? la : teatro.lat,
            Number.isFinite(ln) ? ln : teatro.lng,
            customPaisCapital.trim() || teatro.nombre
          );
    reiniciarTeatro(t, { a: t.bandoA, b: t.bandoB });
    toast.success(`País custom "${faccionUser.nombre}" (${faccionUser.sigla}) creado en Bando ${customBandoDestino}`, {
      description: `Capital táctica: ${faccionUser.capital} · Terreno 3D activo`,
    });
  };

  const cargarGuerraHistorica3D = (warId: string) => {
    const t = teatroDesdeGuerraHistorica(warId);
    if (!t) return;
    setWarHistId(warId);
    reiniciarTeatro(t, { a: t.bandoA, b: t.bandoB });
    toast.success(`Máquina del Tiempo 3D: ${t.nombre}`, {
      description: `${t.bandoA} vs ${t.bandoB}`,
    });
  };

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
          {/* Selector de Modo Operacional del Teatro 3D */}
          <div className="hud-panel p-2.5 border-amber-hud/30 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: "real", label: "🌐 TIEMPO REAL + CONTEXTO", icon: Radio },
                  { id: "libre", label: "☢ MODO LIBRE · PAÍSES + NUCLEAR", icon: Atom },
                  { id: "tiempo", label: "⏳ MÁQUINA DEL TIEMPO 3D", icon: History },
                ] as const
              ).map((tab) => {
                const Icono = tab.icon;
                const active = modoSim === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setModoSim(tab.id)}
                    className={cn(
                      "px-3 py-1.5 rounded border font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors",
                      active
                        ? tab.id === "libre"
                          ? "bg-[#FF3B30] text-white border-[#FF3B30]"
                          : tab.id === "tiempo"
                          ? "bg-[#38BDF8] text-black border-[#38BDF8]"
                          : "bg-[#FFC94D] text-black border-[#FFC94D]"
                        : "bg-black/45 border-white/15 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icono className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
              {modoSim === "libre" && (
                <span className="px-2 py-1 rounded bg-red-hud/15 border border-red-hud/45 text-red-hud font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> SIMULACIÓN FICCIÓN · SANDBOX — NO ES PREDICCIÓN
                </span>
              )}
              <Link
                href="/maquina-del-tiempo"
                className="px-2.5 py-1 rounded border border-cyan-hud/35 text-cyan-hud hover:bg-cyan-hud/15 font-bold"
              >
                SIMULADOR HISTÓRICO COMPLETO →
              </Link>
              <Link
                href="/detonacion"
                className="px-2.5 py-1 rounded border border-amber-hud/35 text-amber hover:bg-amber-hud/15 font-bold"
              >
                CALCULADORA NUCLEAR →
              </Link>
            </div>
          </div>

          {/* PANEL MODO LIBRE: GUERRAS FICTICIAS ENTRE PAÍSES REALES + PAÍS CUSTOM + NUCLEAR */}
          {modoSim === "libre" && (
            <div className="hud-panel p-3 sm:p-4 border-red-hud/35 space-y-3 bg-gradient-to-b from-red-hud/10 to-black/60">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* 1. Guerra ficticia entre cualquier par de países reales */}
                <div className="rounded-lg border border-white/15 bg-black/55 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5" /> GUERRA FICTICIA ENTRE PAÍSES REALES ({PAISES_ATLAS.length})
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">SANDBOX 3D</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block font-mono text-[10px] text-amber mb-1">BANDO A (PAÍS REAL)</label>
                      <select
                        value={paisAId}
                        onChange={(e) => setPaisAId(e.target.value)}
                        className="w-full px-2 py-1.5 rounded bg-black/80 border border-amber-hud/40 font-mono text-xs text-foreground"
                      >
                        {PAISES_ATLAS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.id.toUpperCase()} · {p.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-red-hud mb-1">BANDO B (PAÍS REAL)</label>
                      <select
                        value={paisBId}
                        onChange={(e) => setPaisBId(e.target.value)}
                        className="w-full px-2 py-1.5 rounded bg-black/80 border border-red-hud/40 font-mono text-xs text-foreground"
                      >
                        {PAISES_ATLAS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.id.toUpperCase()} · {p.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-cyan-hud mb-1">CAMPO DE BATALLA</label>
                      <select
                        value={campoPais}
                        onChange={(e) => setCampoPais(e.target.value as "A" | "B" | "frontera")}
                        className="w-full px-2 py-1.5 rounded bg-black/80 border border-cyan-hud/40 font-mono text-xs text-foreground"
                      >
                        <option value="frontera">Punto medio entre ambos</option>
                        <option value="A">Capital Bando A</option>
                        <option value="B">Capital Bando B</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={lanzarDueloPaisesReales}
                      className="px-3 py-1.5 rounded bg-[#FFC94D] text-black font-mono text-xs font-black hover:bg-[#ffd66b]"
                    >
                      ⚔ LANZAR GUERRA FICTICIA EN 3D/2D
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccionClic("nuclear")}
                      className={cn(
                        "px-3 py-1.5 rounded border font-mono text-xs font-bold flex items-center gap-1.5",
                        accionClic === "nuclear"
                          ? "bg-[#FF3B30] text-white border-[#FF3B30]"
                          : "border-red-hud/50 text-red-hud hover:bg-red-hud/15"
                      )}
                    >
                      <Atom className="w-3.5 h-3.5" /> ACTIVAR MODO NUCLEAR EN CLIC ({cabezaSel.kt} kt)
                    </button>
                  </div>
                </div>

                {/* 2. Creador de País / Facción Personalizada */}
                <div className="rounded-lg border border-white/15 bg-black/55 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-hud flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> CREAR PAÍS O FACCIÓN PERSONALIZADA
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">USA COORDENADAS ACTUALES</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      value={customPaisNombre}
                      onChange={(e) => setCustomPaisNombre(e.target.value)}
                      placeholder="Nombre del país"
                      className="sm:col-span-2 px-2 py-1.5 rounded bg-black/70 border border-white/15 font-mono text-xs text-foreground"
                    />
                    <input
                      value={customPaisSigla}
                      onChange={(e) => setCustomPaisSigla(e.target.value)}
                      placeholder="Sigla (ej. RSC)"
                      className="px-2 py-1.5 rounded bg-black/70 border border-white/15 font-mono text-xs text-foreground"
                    />
                    <select
                      value={customBandoDestino}
                      onChange={(e) => setCustomBandoDestino(e.target.value as "A" | "B")}
                      className="px-2 py-1.5 rounded bg-black/80 border border-white/15 font-mono text-xs text-foreground"
                    >
                      <option value="A">En Bando A</option>
                      <option value="B">En Bando B</option>
                    </select>
                    <input
                      value={customPaisCapital}
                      onChange={(e) => setCustomPaisCapital(e.target.value)}
                      placeholder="Capital táctica"
                      className="sm:col-span-2 px-2 py-1.5 rounded bg-black/70 border border-white/15 font-mono text-xs text-foreground"
                    />
                    <input
                      value={customPaisDoctrina}
                      onChange={(e) => setCustomPaisDoctrina(e.target.value)}
                      placeholder="Doctrina militar"
                      className="sm:col-span-2 px-2 py-1.5 rounded bg-black/70 border border-white/15 font-mono text-xs text-foreground"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={crearYDesplegarPaisCustom}
                      className="px-3 py-1.5 rounded bg-[#38BDF8] text-black font-mono text-xs font-black hover:bg-[#5ccbfd]"
                    >
                      + CREAR PAÍS Y DESPLEGAR EN 3D
                    </button>
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="text-red-hud font-bold">OJIVA NUCLEAR:</span>
                      <select
                        value={cabezaId}
                        onChange={(e) => setCabezaId(e.target.value)}
                        className="px-2 py-1 rounded bg-black/85 border border-red-hud/45 text-foreground"
                      >
                        {CABEZAS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre} ({c.kt} kt)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PANEL MÁQUINA DEL TIEMPO 3D (HISTORIA MILITAR) */}
          {modoSim === "tiempo" && (
            <div className="hud-panel p-3 sm:p-4 border-cyan-hud/35 space-y-2.5 bg-gradient-to-b from-cyan-hud/10 to-black/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-cyan-hud flex items-center gap-1.5">
                  <History className="w-4 h-4" /> MÁQUINA DEL TIEMPO · GUERRAS HISTÓRICAS EN TERRENO 3D ({HISTORICAL_WARS.length})
                </span>
                <Link
                  href="/historia"
                  className="font-mono text-[11px] text-amber hover:underline"
                >
                  ABRIR ATLAS HISTÓRICO COMPLETO →
                </Link>
              </div>
              <div className="flex gap-1.5 overflow-x-auto thin-scroll pb-1">
                {HISTORICAL_WARS.map((w) => {
                  const act = warHistId === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => cargarGuerraHistorica3D(w.id)}
                      className={cn(
                        "px-2.5 py-1.5 rounded border font-mono text-[11px] whitespace-nowrap transition-colors text-left",
                        act
                          ? "bg-cyan-hud/25 border-cyan-hud text-foreground font-bold"
                          : "bg-black/45 border-white/15 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div>{w.name}</div>
                      <div className="text-[9px] opacity-75">
                        {w.yearStart < 0 ? `${Math.abs(w.yearStart)} a.C.` : w.yearStart} –{" "}
                        {w.yearEnd < 0 ? `${Math.abs(w.yearEnd)} a.C.` : w.yearEnd} · {w.era}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
                { id: "unidad", label: "Unidad 3D" },
                { id: "formacion", label: "Escuadra Real (6)" },
                { id: "escuadron", label: `Escuadrón ${escuadronSel.simboloOTAN}` },
                { id: "ataque", label: "Misil Táctico" },
                { id: "nuclear", label: `☢ Nuclear ${cabezaSel.kt}kt` },
              ] as { id: AccionClic; label: string }[]
            ).map((ac) => (
              <button
                key={ac.id}
                type="button"
                onClick={() => setAccionClic(ac.id)}
                className={cn(
                  "px-2.5 py-1 rounded border",
                  accionClic === ac.id
                    ? ac.id === "nuclear"
                      ? "bg-[#FF3B30] border-[#FF3B30] text-white font-bold"
                      : "bg-cyan-hud/20 border-cyan-hud text-cyan-hud font-bold"
                    : ac.id === "nuclear"
                    ? "border-red-hud/45 text-red-hud"
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

            {accionClic === "formacion" && (
              <select
                value={formacionClic}
                onChange={(e) => setFormacionClic(e.target.value as FormacionTactica)}
                className="px-2 py-1 rounded bg-black/80 border border-cyan-hud/40 text-cyan-hud font-bold"
              >
                <option value="cuna">Formación Cuña (Wedge)</option>
                <option value="linea">Línea de Asalto</option>
                <option value="columna">Columna Mecanizada</option>
              </select>
            )}

            {accionClic === "nuclear" && (
              <select
                value={cabezaId}
                onChange={(e) => setCabezaId(e.target.value)}
                className="px-2 py-1 rounded bg-black/80 border border-red-hud/45 text-red-hud font-bold"
              >
                {CABEZAS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} · {c.kt} kt
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

          {/* CONTEXTO EN TIEMPO REAL · COMANDANTES REALES · GUERRA ACTIVA · CABLES OSINT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Comandantes y Líderes reales del teatro (ROSTROS) */}
            <div className="hud-panel p-3 border-cyan-hud/30 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-cyan-hud">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> COMANDANTES Y LÍDERES DEL SECTOR
                </span>
                <span className="text-[10px] text-muted-foreground">{contextoTeatro.comandantes.length}</span>
              </div>
              <div className="space-y-1.5">
                {contextoTeatro.comandantes.map((cmd) => (
                  <div
                    key={cmd.id}
                    className="p-2 rounded bg-black/45 border border-white/10 flex items-center justify-between gap-2 text-[11px] font-mono"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-foreground truncate">{cmd.nombre}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {cmd.cargo} · {cmd.sede} ({cmd.poder}/100)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        reiniciarTeatro(
                          generarTeatroDesdeCoord(cmd.lat, cmd.lng, `${cmd.sede} (${cmd.pais})`, "urbano")
                        )
                      }
                      className="px-2 py-1 rounded border border-cyan-hud/45 text-cyan-hud hover:bg-cyan-hud/15 text-[10px] font-bold shrink-0"
                    >
                      HQ 3D →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Datos reales del conflicto activo o marco sectorial */}
            <div className="hud-panel p-3 border-red-hud/30 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-red-hud">
                <span>
                  {contextoTeatro.guerraRelacionada
                    ? `GUERRA ACTIVA · ${contextoTeatro.guerraRelacionada.nombre}`
                    : "ORDEN DE BATALLA Y PAÍSES DEL SECTOR"}
                </span>
                {contextoTeatro.guerraRelacionada && (
                  <span className="px-1.5 py-0.5 rounded bg-red-hud/20 text-[10px]">
                    ESCALADA {contextoTeatro.guerraRelacionada.escalada}/5
                  </span>
                )}
              </div>
              {contextoTeatro.guerraRelacionada ? (
                <div className="space-y-1.5 text-[11px] font-mono">
                  <p className="text-muted-foreground leading-snug">
                    {contextoTeatro.guerraRelacionada.resumen}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[contextoTeatro.guerraRelacionada.bandoA, contextoTeatro.guerraRelacionada.bandoB].map((fz, i) => (
                      <div key={i} className="p-1.5 rounded bg-black/50 border border-white/10">
                        <div className="font-bold text-amber truncate">{fz.nombre}</div>
                        <div className="text-[10px] text-muted-foreground">
                          Efectivos: {fz.efectivos}k · Tanques: {fz.tanques}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-cyan-hud">
                    Desplazados: {contextoTeatro.guerraRelacionada.desplazados} · {contextoTeatro.guerraRelacionada.bajas.texto}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-[11px] font-mono">
                  <p className="text-muted-foreground leading-snug">{contextoTeatro.fuenteNota}</p>
                  {contextoTeatro.paisesCercanos[0] && (
                    <div className="p-2 rounded bg-black/45 border border-white/10">
                      <div className="text-amber font-bold">
                        País en zona: {contextoTeatro.paisesCercanos[0].nombre} ({contextoTeatro.paisesCercanos[0].capital})
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Gobernante: {contextoTeatro.paisesCercanos[0].lider} · {contextoTeatro.paisesCercanos[0].region}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cables reales OSINT en vivo relacionados al teatro */}
            <div className="hud-panel p-3 border-amber-hud/30 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-amber">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> CABLES EN TIEMPO REAL
                </span>
                <span className="text-[10px] text-muted-foreground">{cablesContexto.length}</span>
              </div>
              {cablesContexto.length > 0 ? (
                <div className="space-y-1.5 max-h-[175px] overflow-y-auto thin-scroll pr-1">
                  {cablesContexto.map((c, idx) => (
                    <div key={idx} className="p-1.5 rounded bg-black/50 border border-white/10 text-[11px] font-mono">
                      <div className="text-foreground leading-snug">{c.title}</div>
                      <div className="text-[9px] text-cyan-hud mt-0.5">{c.source}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] font-mono text-muted-foreground leading-snug">
                  Sincronizado con base táctica offline/OSINT para {teatro.nombre}. Pulsa cualquier frente vivo o país para cruzar despachos en directo.
                </p>
              )}
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

      {/* Pie técnico de motores abiertos y atribución glTF / NASA / MapLibre */}
      <footer className="border-t border-white/10 pt-2.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-muted-foreground">
        <span>
          MOTORES 3D ABIERTOS: MapLibre GL JS (DEM AWS Terrarium + ESRI/Carto) · Globe.gl (NASA Blue Marble) · Three.js PBR + glTF (.glb)
        </span>
        <a
          href="/assets/models/ATRIBUCION.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-hud hover:underline"
        >
          Ver licencias y atribuciones 3D (CC0 / MIT / CC-BY / NASA) ↗
        </a>
      </footer>
    </div>
  );
}
