"use client";

// ════════════════════════════════════════════════════════════════
// v176.0 LAS FICHAS DE GUERRA — LA COLECCIÓN DE LA AGENCIA
// Orden del Dueño: «fichas coleccionables de conflictos mundiales,
// de noticias únicas de cada guerra» — una carta por cada frente
// vivo del planeta, al estilo de las placas GTA de la casa.
//
//   · LA RAREZA ES VIVA — la decrece el motor de impacto con los
//     cables de HOY de ESA guerra (LEYENDA ≥80 · ÉPICA ≥64 · RARA
//     ≥48 · COMÚN ≥32 · SILENCIO sin señales): la misma verdad del
//     Centro Mundial, una sola fuente, cero invención.
//   · LA NOTICIA ÚNICA — cada ficha porta el cable de mayor
//     impacto de SU guerra: foto + pie + POR QUÉ IMPORTA + lector.
//   · EL ÁLBUM — abrir una ficha la DESCUBRE (sello con fecha,
//     progreso X/11 — v319). Persistencia vg176-fichas con el escudo de la
//     casa + rehidratador (lección v171/v172).
//   · LA PLACA DE CONFLICTO — la tercera tarjeta GTA al abrir una
//     ficha nueva en la sesión: los dos bandos frente a frente.
// ════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Camera, Layers, Satellite, Stamp, X, User, Hourglass, ScanLine, ChevronRight, TrendingUp } from "lucide-react";
import { pedirNoticias } from "@/lib/noticias-cache";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag } from "@/lib/flags";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { sfx } from "@/lib/sound";
import { LectorNoticia, type CableLectura } from "@/components/vanguard/lector-noticia";
import { IntroGtaConflicto } from "@/components/vanguard/intros-gta";
import { nombrePais, type NoticiaRanqueada } from "@/lib/impacto";
import {
  FICHAS_GUERRA,
  RAREZAS,
  rarezaDeMejorImpacto,
  selloFecha,
  useColeccionFichas,
  type FichaGuerra,
  type RarezaFicha,
} from "@/lib/fichas-guerra-data";
// v363.0 EL ÁLBUM ILUSTRADO — las familias nuevas del álbum: los LÍDERES
// (catálogo del poder v130) y la HISTORIA (archivo v166), derivadas de sus
// fuentes reales — cero catálogos duplicados, la rareza es una regla publicada
import {
  FICHAS_LIDERES,
  FICHAS_HISTORIA,
  RAREZA_ALBUM,
  ERA_HEX,
  ETIQUETA_ERA,
  ESCANES_DIA,
  useColeccionVanguard,
  selloAlbumFecha,
  type FichaLider,
  type FichaHistoria,
  type FamiliaAlbum,
} from "@/lib/fichas-coleccion-data";
// v367.0 EL IMÁN GLOBAL — la madriguera del álbum: saltos a la biblioteca
// derivados de datos reales + el puente (canal de UI de un disparo) para
// que la biblioteca despierte CON la ficha destino abierta
import { navigateTo } from "@/lib/nav";
import {
  dejarPuente, recogerPuente,
  saltosDesdeLider, saltosDesdeHistoria,
  type Salto,
} from "@/lib/madriguera-album";
// v183.0 LA GLORIA — presumir, exclusivo, emocionante, adicto
import { Sparkles, Share2 } from "lucide-react";
import { useGloria, ctxDe, proximoTitulo, TITULOS_GLORIA, type SelloDorado } from "@/lib/gloria";
import { pintarFicha, compartirImagen, type DatosPresumir } from "@/lib/gloria-compartir";
import { APP_VERSION_LABEL } from "@/lib/version";
import { useUniversoStore, asegurarUniversoHidratado } from "@/lib/universo-store";
import { RANGO_NIVEL } from "@/components/vanguard/cartas/carta-vanguard-3d";

type Cable = NoticiaRanqueada;

// el veredicto del escáner para UNA guerra con sus cables de hoy
interface GuiaFicha {
  ficha: FichaGuerra;
  rareza: RarezaFicha;
  cables: Cable[];        // las señales de hoy (por impacto descendente)
  top: Cable | null;      // LA NOTICIA ÚNICA (el mejor cable de la guerra)
  pulso: number;          // nº de cables de la guerra en el escáner
  intensidad: number;     // el impacto del mejor cable (0 si silencio)
  frescuraMin: number;    // edad del cable más fresco
}

function edadTxt(min: number): string {
  if (min < 1) return "AHORA";
  if (min < 60) return `HACE ${min} MIN`;
  const h = Math.round(min / 60);
  if (h < 24) return `HACE ${h} H`;
  return `HACE ${Math.round(h / 24)} D`;
}

function frescuraVal(min: number): number {
  return Math.max(0.04, 1 - Math.min(min / 1440, 1));
}

// ════════════════════════════════════════════════════════════════
// v367.0 EL IMÁN GLOBAL — LA MADRIGUERA DEL ÁLBUM: cada carta abre una
// ficha de la biblioteca (la constitución de SU país, el arma y el
// tablero de SU época — derivados de datos reales, cero invenciones).
// Un toque deja el destino en el puente y camina: la biblioteca despierta
// CON la ficha abierta y el salto cuenta como lectura (+15 XP).
// ════════════════════════════════════════════════════════════════
function ZonaSaltoBiblioteca({ saltos }: { saltos: Salto[] }) {
  if (saltos.length === 0) return null;
  return (
    <div data-testid="carta-saltos" className="mt-3 border-t border-border/50 pt-2.5 space-y-1">
      <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-cyan-hud">De aquí salta a — la madriguera del álbum</div>
      {saltos.map((s) => (
        <button
          key={`${s.kind}:${s.id}`}
          data-testid="carta-salto"
          onClick={() => {
            dejarPuente({ tipo: "ficha", kind: s.kind, id: s.id });
            navigateTo("biblioteca");
          }}
          className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm border border-cyan-hud/30 bg-secondary/40 hover:border-cyan-hud hover:bg-cyan-hud/10 transition-colors text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="text-[10px] font-mono font-bold text-foreground truncate block">{s.nombre} · {s.año}</span>
            <span className="text-[8px] font-mono text-muted-foreground block">{s.porQue}</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-hud shrink-0" />
        </button>
      ))}
      <div className="text-[8px] font-mono text-muted-foreground/70 leading-snug">
        un toque y la biblioteca abre la ficha por ti — el salto también suma a tu expediente
      </div>
    </div>
  );
}

export function FichasPanel() {
  const [items, setItems] = useState<Cable[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const arr = JSON.parse(localStorage.getItem("vanguard-fichas-cache") || "[]");
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  });
  const [cargando, setCargando] = useState(true);
  const [abierta, setAbierta] = useState<string | null>(null); // key de la ficha en detalle
  const [lectura, setLectura] = useState<CableLectura | null>(null);
  const [placa, setPlaca] = useState<GuiaFicha | null>(null); // la placa GTA al descubrir en la sesión
  const coleccion = useColeccionFichas();
  // v363.0 EL ÁLBUM ILUSTRADO — TRES familias viajan en el álbum: los
  // conflictos vivos (v176), los LÍDERES del poder y la HISTORIA del archivo
  // v367.0 EL IMÁN GLOBAL — si la madriguera de la biblioteca dejó destino,
  // el álbum despierta EN su familia (initializer puro, cero efectos)
  const [familia, setFamilia] = useState<FamiliaAlbum>(() => {
    try {
      const p = recogerPuente();
      if (p && p.tipo === "album") return p.familia;
    } catch { /* sin puente: el álbum abre en casa */ }
    return "conflictos";
  });
  const coleccionV = useColeccionVanguard();
  const [detalleLider, setDetalleLider] = useState<FichaLider | null>(null);
  const [detalleHistoria, setDetalleHistoria] = useState<FichaHistoria | null>(null);

  useEffect(() => {
    asegurarUniversoHidratado();
  }, []);
  const guiasRef = useRef<GuiaFicha[]>([]);
  const placaVistaRef = useRef<Set<string>>(new Set());

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      // v196: por el pozo único (balde CENTRO) — las fichas beben la misma
      // agua que el Centinela y GUERRA HOY; si es fresca, cero red
      const lista = (await pedirNoticias(false, "centro")) as Cable[];
      if (lista.length) {
        setItems(lista);
        try { localStorage.setItem("vanguard-fichas-cache", JSON.stringify(lista.slice(0, 48))); } catch { /* lleno */ }
      }
    } catch {
      // la caché local sostiene la colección — el álbum nunca queda vacío
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar(true);
    const id = window.setInterval(() => cargar(true), 60000);
    return () => window.clearInterval(id);
  }, [cargar]);

  // ── EL ESCÁNER POR GUERRA — los cables de HOY agrupados por conflictTag ──
  const guias = useMemo<GuiaFicha[]>(() => {
    const porGuerra = new Map<string, Cable[]>();
    for (const n of items) {
      const k = (n.conflictTag || "").toLowerCase();
      if (!k) continue;
      const arr = porGuerra.get(k) ?? [];
      arr.push(n);
      porGuerra.set(k, arr);
    }
    return FICHAS_GUERRA.map((ficha) => {
      const cables = (porGuerra.get(ficha.key) ?? []).sort((a, b) => b.impacto - a.impacto);
      const top = cables[0] ?? null;
      const intensidad = top?.impacto ?? 0;
      const frescuraMin = cables.length ? Math.min(...cables.map((c) => c.edadMin)) : 9999;
      return {
        ficha,
        rareza: rarezaDeMejorImpacto(cables.length ? intensidad : null),
        cables,
        top,
        pulso: cables.length,
        intensidad,
        frescuraMin,
      };
    });
  }, [items]);
  guiasRef.current = guias;

  const descubiertas = coleccion.descubiertas;
  const total = FICHAS_GUERRA.length;
  const nDescubiertas = useMemo(
    () => FICHAS_GUERRA.filter((f) => !!descubiertas[f.key]).length,
    [descubiertas],
  );
  const nLeyendas = useMemo(
    () => guias.filter((g) => g.rareza === "leyenda").length,
    [guias],
  );

  // ── v363.0 los contadores de las familias nuevas ──
  const nLideres = useMemo(
    () => FICHAS_LIDERES.filter((f) => !!coleccionV.descubiertas[f.key]).length,
    [coleccionV.descubiertas],
  );
  const nHistoria = useMemo(
    () => FICHAS_HISTORIA.filter((f) => !!coleccionV.descubiertas[f.key]).length,
    [coleccionV.descubiertas],
  );
  const nLideresLeyenda = useMemo(() => FICHAS_LIDERES.filter((f) => f.rareza === "leyenda").length, []);
  const nHistoriaLeyenda = useMemo(() => FICHAS_HISTORIA.filter((f) => f.rareza === "leyenda").length, []);

  // ── v363.0 EL ESCÁNER DE FAMILIA — tres turnos al día por familia, la pila real ──
  const escanearFamilia = (f: "lideres" | "historia") => {
    try { sfx.click(); } catch { /* el silencio no bloquea */ }
    const etiqueta = f === "lideres" ? "DE PODER" : "DEL ARCHIVO";
    const usados = coleccionV.escaneosHoy(f);
    if (usados >= ESCANES_DIA) {
      toast.error(`EL ESCÁNER ${etiqueta} AGOTÓ SUS ${ESCANES_DIA} TURNOS DE HOY — VUELVE MAÑANA`);
      return;
    }
    const r = coleccionV.escanear(f);
    if (!r) {
      toast.success(f === "lideres"
        ? `EL DOSSIER DEL PODER ESTÁ COMPLETO — ${FICHAS_LIDERES.length}/${FICHAS_LIDERES.length}`
        : `EL ARCHIVO DE LA HISTORIA ESTÁ COMPLETO — ${FICHAS_HISTORIA.length}/${FICHAS_HISTORIA.length}`);
      return;
    }
    if (r.nueva) {
      try { sfx.reward(); } catch { /* coleccionar suena si el aparato deja */ }
      toast.success(`CARTA ${r.ficha.serie} DESCUBIERTA — ${r.ficha.nombre.toUpperCase()}`);
    }
    if (f === "lideres") setDetalleLider(r.ficha as FichaLider);
    else setDetalleHistoria(r.ficha as FichaHistoria);
  };

  // ── ABRIR UNA FICHA DE LÍDER — descubierta se abre; sellada confiesa ──
  const abrirLider = (f: FichaLider) => {
    try { sfx.click(); } catch { /* el silencio no bloquea */ }
    if (!coleccionV.descubiertas[f.key]) {
      toast.error(`EXPEDIENTE ${f.serie} SELLADO — USA EL ESCÁNER DE PODER O VISITA LA MESA DE UN TEATRO`);
      return;
    }
    setDetalleLider(f);
  };

  // ── ABRIR UNA FICHA DE HISTORIA — descubierta se abre; sellada confiesa ──
  const abrirHistoria = (f: FichaHistoria) => {
    try { sfx.click(); } catch { /* el silencio no bloquea */ }
    if (!coleccionV.descubiertas[f.key]) {
      toast.error(`CARTA ${f.serie} SELLADA — USA EL ESCÁNER DEL ARCHIVO O EL ATLAS DE LA MÁQUINA DEL TIEMPO`);
      return;
    }
    setDetalleHistoria(f);
  };

  // ── ABRIR UNA FICHA — descubrir, sonar, la placa de conflicto ──
  const abrir = (g: GuiaFicha) => {
    try { sfx.click(); } catch { /* el silencio no bloquea */ }
    coleccion.contarApertura();
    const eraNueva = !coleccion.descubiertas[g.ficha.key];
    if (eraNueva) {
      coleccion.descubrir(g.ficha.key, g.intensidad);
      try { sfx.reward(); } catch { /* coleccionar suena si el aparato deja */ }
      toast.success(`FICHA ${g.ficha.serie} DESCUBIERTA — ${g.ficha.nombre}`);
    }

    // ══ v183.0 LA GLORIA — el momento que solo tú viviste ══
    try {
      const gl = useGloria.getState();
      // LA RACHA DEL CAZADOR — abrir ≥1 ficha al día sostiene la llama
      const dia = gl.marcarDia();
      if (dia.rachaSubio && dia.racha > 1) {
        try { sfx.coin(); } catch { /* silencio honesto */ }
        toast.success(`RACHA DEL CAZADOR · ${dia.racha} DÍAS SEGUIDOS`);
      }
      // EL SELLO DORADO 1/1 — la guerra en LEYENDA (≥80) en TU hora exacta
      if (g.rareza === "leyenda" && g.intensidad >= 80) {
        const oroNuevo = gl.sellarDorado(g.ficha.key, g.intensidad);
        if (oroNuevo) {
          try { sfx.achievement(); } catch { /* silencio honesto */ }
          const hora = useGloria.getState().sellos[g.ficha.key]?.hora ?? "";
          toast.success(`★ SELLO DORADO 1/1 · ${g.ficha.serie} CAPTADA A LAS ${hora}`, {
            description: "NADIE MÁS EN EL MUNDO TIENE ESTE SELLO — LA GUERRA ARDÍA EN LEYENDA Y SOLO TÚ ESTABAS AQUÍ",
            duration: 7000,
          });
        }
      }
      // LOS TÍTULOS GLORIA — hitos reales, el próximo siempre muerde
      const descubiertasN = Object.keys(coleccion.descubiertas).length + (eraNueva ? 1 : 0);
      const aperturasN = coleccion.aperturas + 1;
      const nuevos = useGloria.getState().syncTitulos(ctxDe(descubiertasN, aperturasN, useGloria.getState()));
      for (const id of nuevos) {
        const t = TITULOS_GLORIA.find((x) => x.id === id);
        if (t) {
          try { sfx.levelUp(); } catch { /* silencio honesto */ }
          toast.success(`TÍTULO GLORIA DESBLOQUEADO · ${t.nombre}`, { description: t.nota, duration: 7000 });
        }
      }
    } catch { /* la gloria jamás bloquea la colección */ }
    // la placa de conflicto: una vez por ficha por sesión (patrón vg174-gta-ultimo)
    if (!placaVistaRef.current.has(g.ficha.key) && typeof window !== "undefined") {
      const yaVista = window.sessionStorage.getItem(`vg176-ficha-${g.ficha.key}`);
      if (!yaVista) {
        placaVistaRef.current.add(g.ficha.key);
        try { window.sessionStorage.setItem(`vg176-ficha-${g.ficha.key}`, "1"); } catch { /* de sesión */ }
        setPlaca(g);
      }
    }
    setAbierta(g.ficha.key);
  };

  // ── v181.0 VG-ASSIST: «muéstrame la ficha de Ucrania» — LA VOZ ABRE LA CARTA ──
  // page.tsx deja la orden en __vgFichaPendiente + dispara vg:asistente-ficha;
  // la sala la recoge en ambos caminos (ya vivía / nace ahora) y la ejecuta con
  // la MISMA ceremonia de un toque manual: descubrir, sello, placa GTA, sonido.
  const abrirRef = useRef(abrir);
  useEffect(() => { abrirRef.current = abrir; });
  useEffect(() => {
    const consume = (key?: string) => {
      if (!key) return;
      const g = guiasRef.current.find((x) => x.ficha.key === key);
      if (g) abrirRef.current(g);
    };
    const w = window as unknown as { __vgFichaPendiente?: string };
    const t = setTimeout(() => {
      if (w.__vgFichaPendiente) {
        const k = w.__vgFichaPendiente;
        w.__vgFichaPendiente = undefined;
        consume(k);
      }
    }, 60);
    const escucha = (e: Event) => {
      const k = (e as CustomEvent<{ key?: string }>).detail?.key;
      w.__vgFichaPendiente = undefined;
      consume(k);
    };
    window.addEventListener("vg:asistente-ficha", escucha);
    return () => {
      clearTimeout(t);
      window.removeEventListener("vg:asistente-ficha", escucha);
    };
  }, []);

  const abiertaGui = guias.find((g) => g.ficha.key === abierta) ?? null;

  // ══ v183.0 LA GLORIA — el escaparate respira con el álbum ══
  const gloria = useGloria();
  const ctxGloria = useMemo(
    () => ctxDe(nDescubiertas, coleccion.aperturas, { sellos: gloria.sellos, rachaDias: gloria.rachaDias }),
    [nDescubiertas, coleccion.aperturas, gloria.sellos, gloria.rachaDias],
  );
  const proximo = useMemo(() => proximoTitulo(ctxGloria), [ctxGloria]);
  const tituloActivoInfo = useMemo(
    () => TITULOS_GLORIA.find((t) => t.id === gloria.tituloActivo) ?? null,
    [gloria.tituloActivo],
  );
  const nOro = useMemo(() => Object.keys(gloria.sellos).length, [gloria.sellos]);

  // la ficha que el detalle está mostrando, ya descubierta (el estado del álbum al momento)
  return (
    <div className="space-y-4">
      <PanelHeader
        title="LA COLECCIÓN DE GUERRA"
        subtitle="Fichas coleccionables de cada conflicto vivo · la rareza la decrece el impacto de hoy"
        icon={<Layers className="w-4 h-4" />}
        color="violet"
      />

      {/* VANGUARD COLLECTIONS + CARTAS MEJORADAS 3D */}
      <div className="hud-panel border-[#FFC94D]/45 bg-gradient-to-r from-[#FFC94D]/12 via-black/65 to-violet-950/35 p-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="space-y-0.5 min-w-[220px]">
          <div className="font-mono text-[10px] font-black uppercase tracking-widest text-amber flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> CARTAS MEJORADAS 3D HOLO-FOIL + VANGUARD COLLECTIONS
          </div>
          <p className="text-[11px] text-muted-foreground">
            Inclina cualquier carta para ver su brillo 3D, súbela de Bronce a Prismática (Nv. 1→5) al abrirla y descubre las 8 nuevas colecciones (Países, Civilizaciones, Monumentos, Espacio, Ciencia y más).
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[10px] shrink-0">
          <Link
            href="/universo?vista=colecciones"
            className="px-3 py-1.5 rounded bg-[#FFC94D] text-black font-black hover:bg-[#ffd66b]"
          >
            ABRIR 8 COLECCIONES (/universo) →
          </Link>
          <button
            type="button"
            onClick={() => navigateTo("universo")}
            className="px-2.5 py-1.5 rounded border border-cyan-hud/45 text-cyan-hud font-bold hover:bg-cyan-hud/15"
          >
            THE DAILY UNIVERSE
          </button>
        </div>
      </div>

      {/* ══════ v363.0 LAS TRES FAMILIAS DEL ÁLBUM ══════ */}
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Familias del álbum" data-testid="album-familias">
        <button
          onClick={() => { try { sfx.click(); } catch { /* el silencio no bloquea */ } setFamilia("conflictos"); }}
          aria-pressed={familia === "conflictos"}
          data-testid="album-familia-conflictos"
          className={cn(
            "flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] transition-colors",
            familia === "conflictos" ? "border-red-400/60 bg-red-400/15 text-red-200" : "border-border/50 text-muted-foreground hover:border-amber-hud/50",
          )}
        >
          <Layers className="h-3 w-3" /> CONFLICTOS · {FICHAS_GUERRA.length}
        </button>
        <button
          onClick={() => { try { sfx.click(); } catch { /* el silencio no bloquea */ } setFamilia("lideres"); }}
          aria-pressed={familia === "lideres"}
          data-testid="album-familia-lideres"
          className={cn(
            "flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] transition-colors",
            familia === "lideres" ? "border-violet-400/60 bg-violet-400/15 text-violet-200" : "border-border/50 text-muted-foreground hover:border-amber-hud/50",
          )}
        >
          <User className="h-3 w-3" /> LÍDERES · {FICHAS_LIDERES.length}
        </button>
        <button
          onClick={() => { try { sfx.click(); } catch { /* el silencio no bloquea */ } setFamilia("historia"); }}
          aria-pressed={familia === "historia"}
          data-testid="album-familia-historia"
          className={cn(
            "flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] transition-colors",
            familia === "historia" ? "border-amber-hud/60 bg-amber-hud/15 text-amber" : "border-border/50 text-muted-foreground hover:border-amber-hud/50",
          )}
        >
          <Hourglass className="h-3 w-3" /> HISTORIA · {FICHAS_HISTORIA.length}
        </button>
      </div>

      {familia === "conflictos" && (
      <>
      {/* ══════ EL ÁLBUM — progreso de la colección ══════ */}
      <div className="grid grid-cols-3 gap-2">
        <div className="border border-violet-400/40 bg-card p-2 text-center hud-panel">
          <p className="text-lg font-bold font-mono leading-none text-violet-300">{nDescubiertas}/{total}</p>
          <p className="text-[9px] tracking-[0.18em] text-muted-foreground mt-1">DESCUBIERTAS</p>
        </div>
        <div className="border border-amber-hud/40 bg-card p-2 text-center hud-panel">
          <p className="text-lg font-bold font-mono leading-none text-amber">{nLeyendas}</p>
          <p className="text-[9px] tracking-[0.18em] text-muted-foreground mt-1">LEYENDAS HOY</p>
        </div>
        <div className="border border-border/60 bg-card p-2 text-center hud-panel">
          <p className="text-lg font-bold font-mono leading-none text-cyan-hud">{coleccion.aperturas}</p>
          <p className="text-[9px] tracking-[0.18em] text-muted-foreground mt-1">APERTURAS</p>
        </div>
      </div>
      {/* v367 EL IMÁN GLOBAL — aversión a la pérdida con datos reales */}
      <div data-testid="album-conflictos-barra">
        <div className="flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>EL MUNDO COMPLETO</span>
          <span className="text-violet-300">SOLO TE FALTAN {total - nDescubiertas} FICHAS</span>
        </div>
        <div className="mt-1 h-[4px] overflow-hidden rounded-sm bg-white/10" aria-hidden>
          <div className="h-full rounded-sm bg-gradient-to-r from-violet-600 to-violet-300 transition-all duration-500" style={{ width: `${Math.max(3, Math.round((nDescubiertas / Math.max(1, total)) * 100))}%`, boxShadow: "0 0 8px #A78BFA55" }} />
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        TOCA UNA FICHA PARA DESCUBRIRLA — EL SELLO CONSERVA LA PRIMERA FECHA Y LA INTENSIDAD DE ESE DÍA.
        LA RAREZA RESPIRA CON LAS NOTICIAS: HOY LEYENDA, MAÑANA QUIZÁ SILENCIO.
      </p>

      {/* ══════ v183.0 LA GLORIA — racha del cazador + oro + el próximo título ══════ */}
      <div className="border border-amber-hud/30 bg-card p-3" style={{ boxShadow: "0 0 24px -14px #F5C54255" }}>
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-amber-hud">
            <Sparkles className="h-3 w-3" /> LA GLORIA DEL AGENTE
          </p>
          {tituloActivoInfo && (
            <span className="border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.14em]" style={{ color: tituloActivoInfo.color, borderColor: `${tituloActivoInfo.color}55`, background: `${tituloActivoInfo.color}10` }}>
              TÍTULO: {tituloActivoInfo.nombre}
            </span>
          )}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="font-mono text-lg font-bold leading-none text-amber-hud">{gloria.rachaDias}</p>
            <p className="mt-1 text-[8.5px] tracking-[0.16em] text-muted-foreground">RACHA DEL CAZADOR</p>
          </div>
          <div>
            <p className="font-mono text-lg font-bold leading-none text-amber">★ {nOro}</p>
            <p className="mt-1 text-[8.5px] tracking-[0.16em] text-muted-foreground">SELLOS DORADOS 1/1</p>
          </div>
          <div>
            <p className="font-mono text-lg font-bold leading-none text-violet-300">{gloria.titulos.length}/13</p>
            <p className="mt-1 text-[8.5px] tracking-[0.16em] text-muted-foreground">TÍTULOS GLORIA</p>
          </div>
        </div>
        {proximo && (
          <div className="mt-2.5 border-t border-border/50 pt-2">
            <div className="flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">
              <span>PRÓXIMO TÍTULO · {proximo.titulo.nombre}</span>
              <span style={{ color: proximo.titulo.color }}>{Math.round(proximo.progreso * 100)}%</span>
            </div>
            <div className="mt-1 h-[4px] overflow-hidden rounded-sm bg-white/10" aria-hidden>
              <div className="h-full rounded-sm transition-all duration-500" style={{ width: `${Math.max(3, Math.round(proximo.progreso * 100))}%`, background: proximo.titulo.color, boxShadow: `0 0 8px ${proximo.titulo.color}55` }} />
            </div>
            <p className="mt-1 text-[8.5px] text-muted-foreground">{proximo.titulo.nota}</p>
          </div>
        )}
        {!proximo && (
          <p className="mt-2 border-t border-border/50 pt-2 text-center font-mono text-[8.5px] uppercase tracking-[0.18em] text-amber-hud">
            LOS 13 TÍTULOS SON TUYOS — LEYENDA DE LA CASA, LA GLORIA ESTÁ COMPLETA
          </p>
        )}
      </div>

      {/* ══════ LAS FICHAS — el tablero de cartas ══════ */}
      {cargando && !items.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guias.map((g) => (
            <TarjetaFicha
              key={g.ficha.key}
              guia={g}
              descubiertaTs={descubiertas[g.ficha.key]?.ts ?? null}
              descubiertaIntensidad={descubiertas[g.ficha.key]?.intensidad ?? null}
              selloDorado={gloria.sellos[g.ficha.key] ?? null}
              onAbrir={() => abrir(g)}
            />
          ))}
        </div>
      )}
      </>
      )}

      {/* ══════ v363.0 LÍDERES — el dossier del poder (catálogo v130) ══════ */}
      {familia === "lideres" && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-violet-400/40 bg-card p-2 text-center hud-panel">
              <p className="text-lg font-bold font-mono leading-none text-violet-300" data-testid="album-lideres-progreso">{nLideres}/{FICHAS_LIDERES.length}</p>
              <p className="text-[9px] tracking-[0.18em] text-muted-foreground mt-1">EXPEDIENTES</p>
            </div>
            <div className="border border-amber-hud/40 bg-card p-2 text-center hud-panel">
              <p className="text-lg font-bold font-mono leading-none text-amber">{nLideresLeyenda}</p>
              <p className="text-[9px] tracking-[0.18em] text-muted-foreground mt-1">LEYENDAS · PODER ≥95</p>
            </div>
            <div className="border border-border/60 bg-card p-2 text-center hud-panel">
              <p className="text-lg font-bold font-mono leading-none text-cyan-hud">{coleccionV.escaneosHoy("lideres")}/{ESCANES_DIA}</p>
              <p className="text-[9px] tracking-[0.18em] text-muted-foreground mt-1">ESCANEOS HOY</p>
            </div>
          </div>
          <button
            onClick={() => escanearFamilia("lideres")}
            data-testid="escaner-lideres"
            className="flex w-full items-center justify-center gap-2 border border-violet-400/50 bg-violet-400/10 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-violet-200 transition-colors hover:bg-violet-400/20 active:scale-[0.99]"
          >
            <ScanLine className="h-4 w-4" /> ESCÁNER DE PODER — REVELA UN EXPEDIENTE
          </button>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            LA REGLA DE LA CASA: la rareza la pone el PODER publicado del catálogo del poder — ≥95 LEYENDA · ≥88 ÉPICA · ≥80 RARA.
            Y la casa también descubre: visita la mesa de un teatro en LA MÁQUINA DEL TIEMPO y sus rostros entran al álbum.
          </p>
          {/* v367 EL IMÁN GLOBAL — aversión a la pérdida con datos reales */}
          <div data-testid="album-lideres-barra">
            <div className="flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">
              <span>EL PODER COMPLETO</span>
              <span className="text-violet-300">SOLO TE FALTAN {FICHAS_LIDERES.length - nLideres} EXPEDIENTES</span>
            </div>
            <div className="mt-1 h-[4px] overflow-hidden rounded-sm bg-white/10" aria-hidden>
              <div className="h-full rounded-sm bg-gradient-to-r from-violet-600 to-violet-300 transition-all duration-500" style={{ width: `${Math.max(3, Math.round((nLideres / Math.max(1, FICHAS_LIDERES.length)) * 100))}%`, boxShadow: "0 0 8px #A78BFA55" }} />
            </div>
            <p className="mt-1 text-[8.5px] text-muted-foreground">el escáner tiene {coleccionV.escaneosHoy("lideres")}/{ESCANES_DIA} turnos hoy — la máquina del tiempo también descubre</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="album-lideres">
            {FICHAS_LIDERES.map((f) => (
              <TarjetaLider key={f.key} ficha={f} sello={coleccionV.descubiertas[f.key] ?? null} onAbrir={() => abrirLider(f)} />
            ))}
          </div>
        </>
      )}

      {/* ══════ v363.0 HISTORIA — el archivo en cartas (v166) ══════ */}
      {familia === "historia" && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-amber-hud/40 bg-card p-2 text-center hud-panel">
              <p className="text-lg font-bold font-mono leading-none text-amber" data-testid="album-historia-progreso">{nHistoria}/{FICHAS_HISTORIA.length}</p>
              <p className="text-[9px] tracking-[0.18em] text-muted-foreground mt-1">CONFLICTOS</p>
            </div>
            <div className="border border-amber-hud/40 bg-card p-2 text-center hud-panel">
              <p className="text-lg font-bold font-mono leading-none text-amber">{nHistoriaLeyenda}</p>
              <p className="text-[9px] tracking-[0.18em] text-muted-foreground mt-1">LEYENDAS · ≥100 AÑOS</p>
            </div>
            <div className="border border-border/60 bg-card p-2 text-center hud-panel">
              <p className="text-lg font-bold font-mono leading-none text-cyan-hud">{coleccionV.escaneosHoy("historia")}/{ESCANES_DIA}</p>
              <p className="text-[9px] tracking-[0.18em] text-muted-foreground mt-1">ESCANEOS HOY</p>
            </div>
          </div>
          <button
            onClick={() => escanearFamilia("historia")}
            data-testid="escaner-historia"
            className="flex w-full items-center justify-center gap-2 border border-amber-hud/50 bg-amber-hud/10 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-amber transition-colors hover:bg-amber-hud/20 active:scale-[0.99]"
          >
            <ScanLine className="h-4 w-4" /> ESCÁNER DEL ARCHIVO — REVELA UNA GUERRA
          </button>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            LA REGLA DE LA CASA: la rareza la pone la DURACIÓN publicada del conflicto — ≥100 años LEYENDA · ≥20 ÉPICA · ≥8 RARA.
            Y el atlas de la MÁQUINA DEL TIEMPO también descubre: abre la ficha de una guerra del archivo y su carta entra al álbum.
          </p>
          {/* v367 EL IMÁN GLOBAL — aversión a la pérdida con datos reales */}
          <div data-testid="album-historia-barra">
            <div className="flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">
              <span>EL ARCHIVO COMPLETO</span>
              <span className="text-amber">SOLO TE FALTAN {FICHAS_HISTORIA.length - nHistoria} GUERRAS</span>
            </div>
            <div className="mt-1 h-[4px] overflow-hidden rounded-sm bg-white/10" aria-hidden>
              <div className="h-full rounded-sm bg-gradient-to-r from-amber-600 to-amber-300 transition-all duration-500" style={{ width: `${Math.max(3, Math.round((nHistoria / Math.max(1, FICHAS_HISTORIA.length)) * 100))}%`, boxShadow: "0 0 8px #F5C54255" }} />
            </div>
            <p className="mt-1 text-[8.5px] text-muted-foreground">el escáner tiene {coleccionV.escaneosHoy("historia")}/{ESCANES_DIA} turnos hoy — el atlas también descubre</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="album-historia">
            {FICHAS_HISTORIA.map((f) => (
              <TarjetaHistoria key={f.key} ficha={f} sello={coleccionV.descubiertas[f.key] ?? null} onAbrir={() => abrirHistoria(f)} />
            ))}
          </div>
        </>
      )}

      {/* ══════ EL DETALLE — la carta grande (portal al body, lección v116) ══════ */}
      <DetalleFicha
        guia={abiertaGui}
        selloTs={abiertaGui ? (coleccion.descubiertas[abiertaGui.ficha.key]?.ts ?? null) : null}
        selloDorado={abiertaGui ? (gloria.sellos[abiertaGui.ficha.key] ?? null) : null}
        onCerrar={() => setAbierta(null)}
        onLeer={(c) => setLectura(aCableLectura(c))}
      />

      {/* ══════ LA PLACA DE CONFLICTO — la tercera tarjeta GTA ══════ */}
      {placa && (
        <IntroGtaConflicto
          bandoA={placa.ficha.bandos[0]}
          bandoB={placa.ficha.bandos[1]}
          teatro={placa.ficha.teatro}
          lat={placa.ficha.lat}
          lng={placa.ficha.lng}
          serie={placa.ficha.serie}
          rareza={RAREZAS[placa.rareza].label}
          hexRareza={RAREZAS[placa.rareza].hex}
          intensidad={placa.intensidad}
          pulso={placa.pulso}
          frescuraTxt={placa.frescuraMin > 9000 ? "SIN SEÑAL HOY" : edadTxt(placa.frescuraMin)}
          frescuraVal={placa.frescuraMin > 9000 ? 0.04 : frescuraVal(placa.frescuraMin)}
          onFin={() => setPlaca(null)}
        />
      )}

      {/* ══════ v363.0 LOS DETALLES DE LAS FAMILIAS NUEVAS ══════ */}
      <DetalleLider
        ficha={detalleLider}
        sello={detalleLider ? (coleccionV.descubiertas[detalleLider.key] ?? null) : null}
        onCerrar={() => setDetalleLider(null)}
      />
      <DetalleHistoria
        ficha={detalleHistoria}
        sello={detalleHistoria ? (coleccionV.descubiertas[detalleHistoria.key] ?? null) : null}
        onCerrar={() => setDetalleHistoria(null)}
      />

      {/* LA SALA DE LECTURA — el lector de la casa (v116) */}
      <LectorNoticia cable={lectura} onCerrar={() => setLectura(null)} />
    </div>
  );
}

// ── LOS DATOS DEL CABLE PARA EL LECTOR (mismo contrato que el centro) ──
function aCableLectura(n: Cable): CableLectura {
  return {
    id: n.id,
    title: n.title,
    url: n.url,
    source: n.source,
    publishedAt: typeof n.publishedAt === "string" ? n.publishedAt : new Date(n.publishedAt).toISOString(),
    tacticalTag: n.tacticalTag ?? null,
    conflictTag: n.conflictTag ?? null,
    sourceCountry: n.sourceCountry ?? null,
  };
}

// ════════════════════════════════════════════════════════════════
// LA TARJETA COLECCIONABLE — una carta por guerra
// ════════════════════════════════════════════════════════════════
function TarjetaFicha({
  guia,
  descubiertaTs,
  descubiertaIntensidad,
  selloDorado,
  onAbrir,
}: {
  guia: GuiaFicha;
  descubiertaTs: number | null;
  descubiertaIntensidad: number | null;
  selloDorado: SelloDorado | null;
  onAbrir: () => void;
}) {
  const { ficha, rareza, top, pulso, intensidad, frescuraMin } = guia;
  const hex = RAREZAS[rareza].hex;
  const silencio = rareza === "silencio";
  const fresTxt = frescuraMin > 9000 ? "SIN SEÑAL" : edadTxt(frescuraMin);
  const nivel = useUniversoStore((s) => s.nivelesAlbumClasico[ficha.key] ?? 1);
  const rango = RANGO_NIVEL[Math.max(1, Math.min(5, nivel))] ?? RANGO_NIVEL[1];
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 30, hover: false });

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / Math.max(1, r.width);
    const y = (e.clientY - r.top) / Math.max(1, r.height);
    setTilt({ rx: (0.5 - y) * 9, ry: (x - 0.5) * 11, mx: Math.round(x * 100), my: Math.round(y * 100), hover: true });
  };

  return (
    <button
      ref={cardRef}
      onClick={onAbrir}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0, mx: 50, my: 30, hover: false })}
      className="v176ficha vg-carta-3d group relative overflow-hidden rounded-lg border bg-card text-left active:scale-[0.985]"
      style={{
        borderColor: nivel > 1 ? rango.borde : `${hex}66`,
        boxShadow: tilt.hover
          ? `0 14px 30px -10px ${rango.brillo}, 0 0 0 1px ${hex}66`
          : descubiertaTs ? `0 0 0 1px ${hex}22, 0 8px 28px -18px ${hex}55` : `0 0 0 1px ${hex}44, 0 0 26px -6px ${hex}40`,
        transform: tilt.hover ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-2px)` : "none",
      }}
      aria-label={`Abrir ficha ${ficha.serie} de ${ficha.nombre}`}
    >
      {/* brillo holo-foil interactivo */}
      <div
        aria-hidden
        className="vg-carta-foil pointer-events-none absolute inset-0"
        style={{ "--mx": `${tilt.mx}%`, "--my": `${tilt.my}%` } as React.CSSProperties}
      />
      {/* el tinte de la rareza */}
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(90% 60% at 20% 0%, ${hex}12 0%, transparent 58%)` }} aria-hidden />

      {/* cabecera: serie + nivel de carta + sello de rareza */}
      <div className="relative flex items-center justify-between gap-1 px-3 pt-2.5">
        <span className="font-mono text-[9px] tracking-[0.22em] text-muted-foreground">{ficha.serie}</span>
        <span
          className="px-1.5 py-0.5 rounded font-mono text-[8px] font-black text-white"
          style={{ background: rango.badgeBg }}
        >
          NV.{nivel} · {rango.nombre}
        </span>
        <span
          className={cn("border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.18em]", silencio && "opacity-80")}
          style={{ color: hex, borderColor: `${hex}55`, background: `${hex}12` }}
        >
          {RAREZAS[rareza].label}
        </span>
      </div>

      {/* el nombre de la guerra */}
      <div className="relative px-3 pt-1.5">
        <h3 className="font-sans text-xl font-black uppercase leading-[0.95] tracking-tight sm:text-2xl" style={{ textShadow: `0 2px 0 rgba(0,0,0,0.85)` }}>
          {ficha.nombre}
        </h3>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
          {ficha.bandos[0].nombre} <span style={{ color: hex }}>✕</span> {ficha.bandos[1].nombre}
        </p>
      </div>

      {/* LA NOTICIA ÚNICA — el mejor cable de esta guerra hoy */}
      <div className="relative mt-2.5 px-3">
        <div className="relative h-24 w-full overflow-hidden border border-border/50 sm:h-28">
          {top?.imageUrl ? (
            <Image src={top.imageUrl} alt={top.title} fill sizes="(max-width: 640px) 100vw, 380px" className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary via-card to-background">
              <Satellite className={cn("h-6 w-6", silencio ? "text-muted-foreground/50" : "text-muted-foreground")} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
          {/* EL PIE DE FOTO — la regla de oro de la casa */}
          {top && (
            <figcaption className="absolute bottom-0 inset-x-0 flex items-center gap-1 px-1.5 py-1 text-[8.5px] text-muted-foreground bg-background/75">
              <Camera className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{top.pie}</span>
            </figcaption>
          )}
          {/* el sello de rareza sobre la foto */}
          <span className="absolute right-1.5 top-1.5 font-mono text-[9px] font-bold tracking-widest" style={{ color: hex, textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>
            IMP {intensidad || "—"}
          </span>
        </div>
        <p className={cn("mt-1.5 line-clamp-2 min-h-[2.1em] text-[11px] font-semibold leading-snug", top ? "text-foreground/95" : "text-muted-foreground italic")}>
          {top ? top.title : "EL ESCÁNER NO REGISTRA SEÑALES DE ESTE FRENTE HOY — LA GUERRA SIGUE, LA AGENCIA SOSTIENE LA CARTA EN REPOSO"}
        </p>
      </div>

      {/* las barras de la ficha — los atributos del juego */}
      <div className="relative mt-2 space-y-1.5 px-3">
        <BarraFicha etiqueta="INTENSIDAD" valor={Math.max(0.04, intensidad / 100)} valorTxt={intensidad ? `${intensidad}/100` : "—"} hex={hex} />
        <BarraFicha etiqueta="PULSO" valor={Math.min(1, pulso / 8)} valorTxt={`${pulso} CABLES`} hex={hex} />
        <BarraFicha etiqueta="FRESCURA" valor={frescuraMin > 9000 ? 0.04 : frescuraVal(frescuraMin)} valorTxt={fresTxt} hex={hex} />
      </div>

      {/* el pie de la carta: inicio histórico + el sello del álbum */}
      <div className="relative mt-2.5 flex items-center justify-between border-t border-border/50 px-3 py-2">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-amber">{ficha.inicioTxt}</p>
          <p className="truncate font-mono text-[8.5px] tracking-[0.14em] text-muted-foreground">{ficha.teatro}</p>
        </div>
        {selloDorado ? (
          <span className="v183oro flex shrink-0 items-center gap-1 border px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.14em]" style={{ color: "#F5C542", borderColor: "#F5C54255", background: "#F5C54210", boxShadow: "0 0 14px -4px #F5C54266" }}>
            <Sparkles className="h-2.5 w-2.5" /> DORADO {selloDorado.hora}
          </span>
        ) : descubiertaTs ? (
          <span className="v176ficha-sello flex shrink-0 items-center gap-1 border border-violet-400/50 bg-violet-400/10 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-violet-300">
            <Stamp className="h-2.5 w-2.5" /> {selloFecha(descubiertaTs)}
          </span>
        ) : (
          <span className="v176ficha-nueva shrink-0 border border-dashed px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em]" style={{ color: hex, borderColor: `${hex}66` }}>
            SIN DESCUBRIR
          </span>
        )}
      </div>

      {/* la intensidad del día del descubrimiento, grabada en la carta */}
      {descubiertaIntensidad != null && (
        <p className="relative border-t border-border/40 px-3 py-1 text-center font-mono text-[8px] tracking-[0.2em] text-muted-foreground">
          GRABADA CON INTENSIDAD {descubiertaIntensidad}/100
        </p>
      )}
    </button>
  );
}

function BarraFicha({ etiqueta, valor, valorTxt, hex }: { etiqueta: string; valor: number; valorTxt: string; hex: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[74px] shrink-0 font-mono text-[8px] uppercase tracking-[0.18em] text-white/55">{etiqueta}</span>
      <div className="h-[5px] flex-1 overflow-hidden rounded-sm bg-white/10" aria-hidden>
        <div className="h-full rounded-sm" style={{ width: `${Math.round(Math.max(0.04, Math.min(1, valor)) * 100)}%`, background: hex, boxShadow: `0 0 8px ${hex}55` }} />
      </div>
      <span className="w-[64px] shrink-0 text-right font-mono text-[8px] uppercase tracking-[0.1em] text-white/70">{valorTxt}</span>
    </div>
  );
}

function MejorarCartaClasicaBtn({ fichaKey, titulo }: { fichaKey: string; titulo: string }) {
  const nivel = useUniversoStore((s) => s.nivelesAlbumClasico[fichaKey] ?? 1);
  const mejorar = useUniversoStore((s) => s.mejorarCartaClasica);
  const rango = RANGO_NIVEL[Math.max(1, Math.min(5, nivel))] ?? RANGO_NIVEL[1];
  const costo = nivel * 40;
  return (
    <button
      type="button"
      disabled={nivel >= 5}
      onClick={() => {
        const res = mejorar(fichaKey, titulo);
        if (res.ok) {
          try { sfx.levelUp(); } catch { /* noop */ }
          toast.success(res.msg);
        } else {
          toast.error(res.msg);
        }
      }}
      className="flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] transition-transform active:scale-[0.97] disabled:opacity-65"
      style={{
        color: "#38BDF8",
        borderColor: "rgba(56,189,248,0.55)",
        background: "rgba(56,189,248,0.12)",
      }}
    >
      <TrendingUp className="h-3 w-3" />
      {nivel >= 5 ? `NV.5 PRISMÁTICA (MÁX)` : `MEJORAR ${rango.nombre} → NV.${nivel + 1} (${costo} VC)`}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// EL DETALLE — la carta grande con su historia completa
// ════════════════════════════════════════════════════════════════
function DetalleFicha({
  guia,
  selloTs,
  selloDorado,
  onCerrar,
  onLeer,
}: {
  guia: GuiaFicha | null;
  selloTs: number | null;
  selloDorado: SelloDorado | null;
  onCerrar: () => void;
  onLeer: (c: Cable) => void;
}) {
  // v183.0 LA GLORIA — el estado del botón PRESUMIR (hooks antes del return temprano)
  const [presumiendo, setPresumiendo] = useState(false);
  if (!guia) return null;

  const { ficha, rareza, top, pulso, intensidad, frescuraMin: _frescuraMin, cables } = guia;
  const hex = RAREZAS[rareza].hex;
  const silencio = rareza === "silencio";

  // ══ v183.0 PRESUMIR — la ficha sale de la Casa como imagen ══
  const presumir = async () => {
    if (presumiendo) return;
    setPresumiendo(true);
    try {
      try { sfx.coin(); } catch { /* silencio honesto */ }
      const datos: DatosPresumir = {
        serie: ficha.serie,
        nombre: ficha.nombre,
        bandos: [ficha.bandos[0].nombre, ficha.bandos[1].nombre],
        teatro: ficha.teatro,
        hex,
        rarezaLabel: RAREZAS[rareza].label,
        intensidad,
        pulso,
        titular: top?.title ?? null,
        fuente: top?.source ?? null,
        selloFecha: selloTs ? selloFecha(selloTs) : null,
        selloDorado,
        version: APP_VERSION_LABEL,
      };
      const url = pintarFicha(datos);
      const r = await compartirImagen(url, `VANGUARD-${ficha.serie}.png`);
      useGloria.getState().contarCompartido();
      if (r === "share") toast.success("FICHA COMPARTIDA — LA GLORIA SALE DE LA CASA");
      else if (r === "descarga") toast.success("PNG DESCARGADO — PRESUME LA FICHA DONDE QUIERAS");
      else toast.error("ESTE APARATO NO PUDO GENERAR LA IMAGEN");
    } finally {
      setPresumiendo(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[240] overflow-y-auto select-none"
      style={{ background: "rgba(2,2,4,0.9)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-label={`Ficha coleccionable ${ficha.serie}: ${ficha.nombre}`}
    >
      <div className="mx-auto min-h-full w-full max-w-2xl px-3 py-4">
        <div className="overflow-hidden border bg-card" style={{ borderColor: `${hex}66`, boxShadow: `0 0 40px -10px ${hex}44` }}>
          {/* la cabecera de la carta */}
          <div className="relative flex items-center justify-between gap-2 px-3 py-2" style={{ background: `linear-gradient(90deg, ${hex}18 0%, transparent 70%)` }}>
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.24em] text-muted-foreground">{ficha.serie}</span>
              <span className="border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.18em]" style={{ color: hex, borderColor: `${hex}55`, background: `${hex}12` }}>
                {RAREZAS[rareza].label} · {RAREZAS[rareza].nota}
              </span>
            </div>
            <button onClick={onCerrar} className="flex h-9 w-9 shrink-0 items-center justify-center border border-border/60 text-muted-foreground hover:text-foreground" aria-label="Cerrar ficha">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* los bandos frente a frente */}
          <div className="px-3 pt-1">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0 text-left">
                <p className="text-3xl leading-none" aria-hidden>{ficha.bandos[0].bandera}</p>
                <h3 className="mt-1 font-sans text-2xl font-black uppercase leading-[0.94] tracking-tight sm:text-3xl">{ficha.bandos[0].nombre}</h3>
              </div>
              <span className="shrink-0 pb-1 font-mono text-2xl font-black" style={{ color: hex, textShadow: `0 0 18px ${hex}66` }} aria-hidden>✕</span>
              <div className="min-w-0 text-right">
                <p className="text-3xl leading-none" aria-hidden>{ficha.bandos[1].bandera}</p>
                <h3 className="mt-1 font-sans text-2xl font-black uppercase leading-[0.94] tracking-tight sm:text-3xl">{ficha.bandos[1].nombre}</h3>
              </div>
            </div>
            <div className="mt-2 h-[4px] w-[46%] rounded-sm" style={{ background: hex, boxShadow: `0 0 14px ${hex}77` }} aria-hidden />
          </div>

          {/* LA NOTICIA ÚNICA — el mejor cable de la guerra */}
          <div className="px-3 pb-1 pt-3">
            {top ? (
              <button onClick={() => onLeer(top)} className="block w-full text-left" aria-label={`Leer: ${top.title}`}>
                <div className="relative h-40 w-full overflow-hidden border border-border/50 sm:h-52">
                  {top.imageUrl ? (
                    <Image src={top.imageUrl} alt={top.title} fill sizes="(max-width: 768px) 100vw, 680px" className="object-cover" unoptimized />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary via-card to-background">
                      <Satellite className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
                  <figcaption className="absolute bottom-0 inset-x-0 flex items-center gap-1.5 border-t border-border/60 bg-background/80 px-2 py-1.5 text-[9px] sm:text-[10px] text-muted-foreground">
                    <Camera className="h-3 w-3 shrink-0" />
                    <span className="truncate">{top.pie}</span>
                  </figcaption>
                </div>
                <h4 className="mt-2 text-base font-bold leading-snug sm:text-xl">{top.title}</h4>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                  {top.sourceCountry && <Flag code={top.sourceCountry} size={12} />}
                  <span className="font-mono">{top.source}</span>
                  <span>·</span>
                  <span className="font-mono">{top.edad}</span>
                  <span>·</span>
                  <span className="font-mono" style={{ color: hex }}>IMP {top.impacto}</span>
                  <span>·</span>
                  <span className="font-mono uppercase">{nombrePais(top.sourceCountry)}</span>
                </div>
              </button>
            ) : (
              <div className="border border-border/60 bg-secondary/40 p-4 text-center">
                <Satellite className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">
                  EL ESCÁNER DE LA AGENCIA NO REGISTRA SEÑALES DE ESTE FRENTE EN LAS ÚLTIMAS HORAS —
                  LA GUERRA SIGUE VIVA EN EL ARCHIVO, LA CARTA ESPERA SU PRÓXIMA SEÑAL.
                </p>
              </div>
            )}
          </div>

          {/* POR QUÉ IMPORTA — la misma redacción de la Agencia */}
          {top && (
            <div className="mx-3 mt-2 border-l-2 pl-3 py-1.5" style={{ borderColor: `${hex}88`, background: `${hex}0A` }}>
              <p className="text-[10px] font-bold tracking-[0.2em] mb-1" style={{ color: hex }}>POR QUÉ IMPORTA</p>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">{top.resumen}</p>
            </div>
          )}

          {/* LAS SEÑALES DE HOY — todos los cables de esta guerra */}
          {cables.length > 1 && (
            <div className="px-3 pt-3">
              <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">LAS SEÑALES DE HOY · {pulso} CABLES</p>
              <ul className="mt-1.5 space-y-1.5">
                {cables.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <button onClick={() => onLeer(c)} className="w-full border border-border/60 bg-card px-2.5 py-2 text-left hover:border-amber-hud/50 transition-colors">
                      <p className="line-clamp-2 text-[11px] font-semibold leading-snug">{c.title}</p>
                      <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">{c.source} · {c.edad} · IMP {c.impacto}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* LA FICHA TÉCNICA — el origen histórico verificable */}
          <div className="m-3 border border-border/60 bg-secondary/30 p-3">
            <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">LA FICHA TÉCNICA</p>
            <dl className="mt-1.5 space-y-1 text-[11px]">
              <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-amber">INICIO</dt><dd className="text-foreground/90">{ficha.inicioTxt} — {ficha.duracionTxt}</dd></div>
              <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-amber">TEATRO</dt><dd className="text-foreground/90">{ficha.teatro}</dd></div>
              <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-amber">CONTEXTO</dt><dd className="text-foreground/90 leading-relaxed">{ficha.contexto}</dd></div>
              {selloTs && (
                <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-violet-300">SELLO</dt><dd className="text-violet-300 font-mono text-[10px]">DESCUBIERTA EL {selloFecha(selloTs).toUpperCase()} · CON INTENSIDAD {intensidad}/100</dd></div>
              )}
              {selloDorado && (
                <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-amber">ORO</dt><dd className="font-mono text-[10px] text-amber">★ SELLO DORADO 1/1 · CAPTADA A LAS {selloDorado.hora} · IMP {selloDorado.intensidad} — NADIE MÁS LO TIENE</dd></div>
              )}
            </dl>
          </div>

          {/* el estado del álbum + MEJORAR CARTA + LA GLORIA: presumir */}
          <div className={cn("flex flex-wrap items-center justify-center gap-2 border-t px-3 py-2.5", silencio ? "border-border/40" : "border-border/60")} style={{ background: `${hex}08` }}>
            {selloTs ? (
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-violet-300">
                <Stamp className="h-3 w-3" /> EN TU COLECCIÓN DESDE EL {selloFecha(selloTs).toUpperCase()}
              </span>
            ) : (
              <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: hex }}>
                CARTA EN VISTA — TOCA OTRA PARA SEGUIR COLECCIONANDO
              </span>
            )}
            <MejorarCartaClasicaBtn fichaKey={ficha.key} titulo={ficha.nombre} />
            <button
              onClick={presumir}
              disabled={presumiendo}
              className="flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] transition-transform active:scale-[0.97] disabled:opacity-60"
              style={{ color: "#F5C542", borderColor: "#F5C54255", background: "#F5C54212" }}
              aria-label="Presumir ficha: generar imagen y compartir"
            >
              <Share2 className="h-3 w-3" /> {presumiendo ? "PINTANDO…" : "PRESUMIR FICHA"}
            </button>
          </div>
        </div>

        {/* la nota honesta de la colección */}
        <p className="px-2 pt-2 pb-6 text-center font-mono text-[8.5px] tracking-[0.16em] text-white/35">
          LA RAREZA DE ESTA FICHA SE RECALCULA CADA 60S CON LOS CABLES REALES DE /api/news — SIN SEÑALES, LA CARTA DUERME EN SILENCIO
        </p>
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════
// v363.0 LAS FAMILIAS NUEVAS — LÍDERES (el poder, v130) e HISTORIA
// (el archivo, v166). Tarjetas selladas que el escáner, la mesa del
// teatro o el atlas revelan — cero invención: todo sale de la fuente.
// ════════════════════════════════════════════════════════════════

function TarjetaLider({
  ficha,
  sello,
  onAbrir,
}: {
  ficha: FichaLider;
  sello: { ts: number; via: string } | null;
  onAbrir: () => void;
}) {
  const hex = RAREZA_ALBUM[ficha.rareza].hex;
  const selloTs = sello?.ts ?? null;
  const selloVia = sello?.via ?? "";
  const descubierta = selloTs != null;
  return (
    <button
      onClick={onAbrir}
      data-testid={`ficha-lider-${ficha.serie}`}
      aria-label={descubierta ? `Expediente ${ficha.serie}: ${ficha.nombre}` : `Expediente sellado ${ficha.serie}`}
      className={cn(
        "group flex flex-col border bg-card text-left transition-transform active:scale-[0.99]",
        descubierta ? "border-border/60" : "border-dashed border-border/40",
      )}
      style={descubierta ? { boxShadow: `0 0 26px -14px ${hex}55` } : undefined}
    >
      <div className="h-[3px] w-full" style={{ background: descubierta ? hex : "transparent", boxShadow: descubierta ? `0 0 10px ${hex}55` : "none" }} aria-hidden />
      <div className="flex items-center gap-2 px-3 pt-2">
        <span className="text-xl leading-none" aria-hidden>{descubierta ? ficha.bandera : "▯"}</span>
        <div className="min-w-0 flex-1">
          {descubierta ? (
            <>
              <p className="truncate text-[13px] font-black leading-tight text-foreground">{ficha.nombre}</p>
              <p className="truncate font-mono text-[9px] text-muted-foreground">{ficha.cargo}</p>
            </>
          ) : (
            <>
              <p className="truncate text-[13px] font-black leading-tight text-muted-foreground">EXPEDIENTE SELLADO</p>
              <p className="truncate font-mono text-[9px] text-muted-foreground/70">EL PODER ESPERA EN EL ARCHIVO</p>
            </>
          )}
        </div>
        <span className="shrink-0 font-mono text-[9px] tracking-[0.18em] text-muted-foreground">{ficha.serie}</span>
      </div>
      {descubierta && selloTs != null ? (
        <>
          <div className="relative mt-2 space-y-1.5 px-3">
            <BarraFicha etiqueta="PODER" valor={ficha.poder / 100} valorTxt={`${ficha.poder}/100`} hex={hex} />
          </div>
          <div className="relative mt-2 px-3">
            <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">{ficha.mandato}</p>
            <p className="mt-0.5 truncate text-[10px] text-foreground/80">{ficha.sede} · {ficha.ciudad}</p>
          </div>
          {ficha.frase && (
            <p className="relative mx-3 mt-2 border-l-2 pl-2 text-[10.5px] italic leading-snug text-foreground/70" style={{ borderColor: `${hex}88` }}>
              «{ficha.frase}»
            </p>
          )}
          <div className="relative mt-2.5 flex items-center justify-between gap-2 border-t border-border/50 px-3 py-2">
            <span className="flex shrink-0 items-center gap-1 border px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.14em]" style={{ color: hex, borderColor: `${hex}55`, background: `${hex}10` }}>
              <Stamp className="h-2.5 w-2.5" /> {selloAlbumFecha(selloTs)}
            </span>
            <span className="truncate font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground">VÍA {selloVia.toUpperCase()}</span>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-6">
          <User className="h-7 w-7 text-muted-foreground/40" aria-hidden />
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/60">SELLADO</span>
          <span className="px-2 text-center font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground/40">EL ESCÁNER O LA MESA DEL TEATRO LO REVELA</span>
        </div>
      )}
    </button>
  );
}

function TarjetaHistoria({
  ficha,
  sello,
  onAbrir,
}: {
  ficha: FichaHistoria;
  sello: { ts: number; via: string } | null;
  onAbrir: () => void;
}) {
  const hexEra = ERA_HEX[ficha.era];
  const hexRareza = RAREZA_ALBUM[ficha.rareza].hex;
  const selloTs = sello?.ts ?? null;
  const selloVia = sello?.via ?? "";
  const descubierta = selloTs != null;
  return (
    <button
      onClick={onAbrir}
      data-testid={`ficha-historia-${ficha.serie}`}
      aria-label={descubierta ? `Conflicto histórico ${ficha.serie}: ${ficha.nombre}` : `Conflicto histórico sellado ${ficha.serie}`}
      className={cn(
        "group flex flex-col border bg-card text-left transition-transform active:scale-[0.99]",
        descubierta ? "border-border/60" : "border-dashed border-border/40",
      )}
      style={descubierta ? { boxShadow: `0 0 26px -14px ${hexEra}55` } : undefined}
    >
      <div className="h-[3px] w-full" style={{ background: descubierta ? hexEra : "transparent", boxShadow: descubierta ? `0 0 10px ${hexEra}55` : "none" }} aria-hidden />
      <div className="flex items-center gap-2 px-3 pt-2">
        <div className="min-w-0 flex-1">
          {descubierta ? (
            <p className="truncate text-[13px] font-black leading-tight text-foreground">{ficha.nombre.toUpperCase()}</p>
          ) : (
            <p className="truncate text-[13px] font-black leading-tight text-muted-foreground">SIGLO SELLADO</p>
          )}
          <p className="truncate font-mono text-[9px] text-muted-foreground">
            {descubierta ? `${ficha.aniosTxt} · ${ficha.region}` : "EL ARCHIVO GUARDA LA GUERRA"}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[9px] tracking-[0.18em] text-muted-foreground">{ficha.serie}</span>
      </div>
      {descubierta && selloTs != null ? (
        <>
          <div className="relative mt-2 flex flex-wrap gap-1 px-3">
            <span className="border px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: hexEra, borderColor: `${hexEra}55`, background: `${hexEra}12` }}>
              {ETIQUETA_ERA[ficha.era]}
            </span>
            <span className="border px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: hexRareza, borderColor: `${hexRareza}55`, background: `${hexRareza}12` }}>
              {RAREZA_ALBUM[ficha.rareza].label}
            </span>
            <span className="border border-border/60 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
              {ficha.duracionAnios} AÑOS
            </span>
          </div>
          <p className="relative mt-2 line-clamp-3 px-3 text-[11px] leading-snug text-foreground/85">{ficha.resumen}</p>
          <p className="relative mt-1.5 truncate px-3 font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">
            {ficha.bandos.join("  vs  ")}
          </p>
          <div className="relative mt-2.5 flex items-center justify-between gap-2 border-t border-border/50 px-3 py-2">
            <span className="flex shrink-0 items-center gap-1 border px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.14em]" style={{ color: hexEra, borderColor: `${hexEra}55`, background: `${hexEra}10` }}>
              <Stamp className="h-2.5 w-2.5" /> {selloAlbumFecha(selloTs)}
            </span>
            <span className="truncate font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground">VÍA {selloVia.toUpperCase()}</span>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-6">
          <Hourglass className="h-7 w-7 text-muted-foreground/40" aria-hidden />
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/60">SELLADA</span>
          <span className="px-2 text-center font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground/40">EL ESCÁNER O EL ATLAS DE LA MÁQUINA LA REVELA</span>
        </div>
      )}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// v363.0 LOS DETALLES — la carta grande de las familias nuevas
// (portal al body, misma lección v116 del detalle de conflictos)
// ════════════════════════════════════════════════════════════════

function DetalleLider({
  ficha,
  sello,
  onCerrar,
}: {
  ficha: FichaLider | null;
  sello: { ts: number; via: string } | null;
  onCerrar: () => void;
}) {
  if (!ficha) return null;
  const hex = RAREZA_ALBUM[ficha.rareza].hex;
  // v367 EL IMÁN GLOBAL — la madriguera del álbum: su país en la biblioteca
  const saltos = saltosDesdeLider(ficha);
  return createPortal(
    <div
      className="fixed inset-0 z-[240] overflow-y-auto select-none"
      style={{ background: "rgba(2,2,4,0.9)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-label={`Expediente ${ficha.serie}: ${ficha.nombre}`}
    >
      <div className="mx-auto min-h-full w-full max-w-2xl px-3 py-4">
        <div className="overflow-hidden border bg-card" style={{ borderColor: `${hex}66`, boxShadow: `0 0 40px -10px ${hex}44` }}>
          <div className="relative flex items-center justify-between gap-2 px-3 py-2" style={{ background: `linear-gradient(90deg, ${hex}18 0%, transparent 70%)` }}>
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.24em] text-muted-foreground">{ficha.serie}</span>
              <span className="border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.18em]" style={{ color: hex, borderColor: `${hex}55`, background: `${hex}12` }}>
                {RAREZA_ALBUM[ficha.rareza].label} · {RAREZA_ALBUM[ficha.rareza].nota}
              </span>
            </div>
            <button onClick={onCerrar} className="flex h-9 w-9 shrink-0 items-center justify-center border border-border/60 text-muted-foreground hover:text-foreground" aria-label="Cerrar expediente">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-3 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-5xl leading-none" aria-hidden>{ficha.bandera}</span>
              <div className="min-w-0">
                <h3 className="font-sans text-2xl font-black uppercase leading-[0.94] tracking-tight sm:text-3xl">{ficha.nombre}</h3>
                <p className="mt-1 text-[11px] font-semibold text-foreground/80">{ficha.cargo}</p>
                <p className="truncate font-mono text-[9px] text-muted-foreground">{ficha.organizacion}</p>
              </div>
            </div>
            <div className="mt-3 h-[4px] w-[46%] rounded-sm" style={{ background: hex, boxShadow: `0 0 14px ${hex}77` }} aria-hidden />
          </div>
          <div className="relative mt-3 space-y-1.5 px-3">
            <BarraFicha etiqueta="PODER" valor={ficha.poder / 100} valorTxt={`${ficha.poder}/100`} hex={hex} />
          </div>
          <div className="m-3 border border-border/60 bg-secondary/30 p-3">
            <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">EL EXPEDIENTE DEL PODER</p>
            <dl className="mt-1.5 space-y-1 text-[11px]">
              <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-amber">MANDATO</dt><dd className="text-foreground/90">{ficha.mandato}</dd></div>
              <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-amber">SEDE</dt><dd className="text-foreground/90">{ficha.sede} · {ficha.ciudad}</dd></div>
              <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-amber">PAÍS</dt><dd className="text-foreground/90">{ficha.pais}</dd></div>
              <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-violet-300">FRASE</dt><dd className="italic text-foreground/90">«{ficha.frase}»</dd></div>
              {sello && (
                <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-violet-300">SELLO</dt><dd className="font-mono text-[10px] text-violet-300">EN TU COLECCIÓN DESDE EL {selloAlbumFecha(sello.ts).toUpperCase()} · VÍA {sello.via.toUpperCase()}</dd></div>
              )}
            </dl>
          </div>
          {/* v367 EL IMÁN GLOBAL — la madriguera del álbum: la biblioteca a un toque */}
          <div className="px-3 pb-1">
            <ZonaSaltoBiblioteca saltos={saltos} />
          </div>
        </div>
        <p className="px-2 pt-2 pb-6 text-center font-mono text-[8.5px] tracking-[0.16em] text-white/35">
          EL EXPEDIENTE SALE DEL CATÁLOGO DEL PODER DE LA CASA (v130) — LA REGLA DE RAREZA ES PÚBLICA: PODER ≥95 LEYENDA · ≥88 ÉPICA · ≥80 RARA
        </p>
      </div>
    </div>,
    document.body,
  );
}

function DetalleHistoria({
  ficha,
  sello,
  onCerrar,
}: {
  ficha: FichaHistoria | null;
  sello: { ts: number; via: string } | null;
  onCerrar: () => void;
}) {
  if (!ficha) return null;
  const hexEra = ERA_HEX[ficha.era];
  const hexRareza = RAREZA_ALBUM[ficha.rareza].hex;
  // v367 EL IMÁN GLOBAL — la madriguera del álbum: su época en la biblioteca
  const saltos = saltosDesdeHistoria(ficha);
  return createPortal(
    <div
      className="fixed inset-0 z-[240] overflow-y-auto select-none"
      style={{ background: "rgba(2,2,4,0.9)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-label={`Conflicto histórico ${ficha.serie}: ${ficha.nombre}`}
    >
      <div className="mx-auto min-h-full w-full max-w-2xl px-3 py-4">
        <div className="overflow-hidden border bg-card" style={{ borderColor: `${hexEra}66`, boxShadow: `0 0 40px -10px ${hexEra}44` }}>
          <div className="relative flex items-center justify-between gap-2 px-3 py-2" style={{ background: `linear-gradient(90deg, ${hexEra}18 0%, transparent 70%)` }}>
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.24em] text-muted-foreground">{ficha.serie}</span>
              <span className="border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.18em]" style={{ color: hexEra, borderColor: `${hexEra}55`, background: `${hexEra}12` }}>
                {ETIQUETA_ERA[ficha.era]}
              </span>
              <span className="border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.18em]" style={{ color: hexRareza, borderColor: `${hexRareza}55`, background: `${hexRareza}12` }}>
                {RAREZA_ALBUM[ficha.rareza].label}
              </span>
            </div>
            <button onClick={onCerrar} className="flex h-9 w-9 shrink-0 items-center justify-center border border-border/60 text-muted-foreground hover:text-foreground" aria-label="Cerrar conflicto histórico">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-3 pt-1">
            <h3 className="font-sans text-2xl font-black uppercase leading-[0.94] tracking-tight sm:text-3xl">{ficha.nombre}</h3>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {ficha.aniosTxt} · {ficha.duracionAnios} AÑOS · {ficha.region}
            </p>
            <div className="mt-2 h-[4px] w-[46%] rounded-sm" style={{ background: hexEra, boxShadow: `0 0 14px ${hexEra}77` }} aria-hidden />
          </div>
          <div className="px-3 pt-3">
            <p className="text-[12px] leading-relaxed text-foreground/90">{ficha.resumen}</p>
          </div>
          <div className="m-3 border border-border/60 bg-secondary/30 p-3">
            <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">LA FICHA DEL CONFLICTO</p>
            <dl className="mt-1.5 space-y-1 text-[11px]">
              <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-amber">BANDOS</dt><dd className="text-foreground/90">{ficha.bandos.join("  vs  ")}</dd></div>
              <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-amber">DESENLACE</dt><dd className="text-foreground/90">{ficha.desenlace}</dd></div>
              <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-red-300">BAJAS</dt><dd className="text-foreground/90">{ficha.bajas}</dd></div>
              <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-amber">POR QUÉ IMPORTA</dt><dd className="leading-relaxed text-foreground/90">{ficha.significado}</dd></div>
              {sello && (
                <div className="flex gap-2"><dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-violet-300">SELLO</dt><dd className="font-mono text-[10px] text-violet-300">EN TU COLECCIÓN DESDE EL {selloAlbumFecha(sello.ts).toUpperCase()} · VÍA {sello.via.toUpperCase()}</dd></div>
              )}
            </dl>
          </div>
          {/* v367 EL IMÁN GLOBAL — la madriguera del álbum: la biblioteca a un toque */}
          <div className="px-3 pb-1">
            <ZonaSaltoBiblioteca saltos={saltos} />
          </div>
        </div>
        <p className="px-2 pt-2 pb-6 text-center font-mono text-[8.5px] tracking-[0.16em] text-white/35">
          LA GUERRA SALE DEL ARCHIVO HISTÓRICO DE LA CASA (v166) — LA REGLA DE RAREZA ES PÚBLICA: DURACIÓN ≥100 AÑOS LEYENDA · ≥20 ÉPICA · ≥8 RARA
        </p>
      </div>
    </div>,
    document.body,
  );
}
