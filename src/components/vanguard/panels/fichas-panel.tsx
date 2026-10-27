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
//     progreso X/9). Persistencia vg176-fichas con el escudo de la
//     casa + rehidratador (lección v171/v172).
//   · LA PLACA DE CONFLICTO — la tercera tarjeta GTA al abrir una
//     ficha nueva en la sesión: los dos bandos frente a frente.
// ════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Camera, Layers, Satellite, Stamp, X } from "lucide-react";
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
// v183.0 LA GLORIA — presumir, exclusivo, emocionante, adicto
import { Sparkles, Share2 } from "lucide-react";
import { useGloria, ctxDe, proximoTitulo, TITULOS_GLORIA, type SelloDorado } from "@/lib/gloria";
import { pintarFicha, compartirImagen, type DatosPresumir } from "@/lib/gloria-compartir";
import { APP_VERSION_LABEL } from "@/lib/version";

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
  const guiasRef = useRef<GuiaFicha[]>([]);
  const placaVistaRef = useRef<Set<string>>(new Set());

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      const r = await fetch("/api/news?modo=centro", { cache: "no-store" });
      const j = await r.json();
      const lista: Cable[] = Array.isArray(j?.items) ? j.items : [];
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
            <p className="font-mono text-lg font-bold leading-none text-violet-300">{gloria.titulos.length}/12</p>
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
            LOS 12 TÍTULOS SON TUYOS — LEYENDA DE LA CASA, LA GLORIA ESTÁ COMPLETA
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

  return (
    <button
      onClick={onAbrir}
      className="v176ficha group relative overflow-hidden border bg-card text-left transition-transform active:scale-[0.985] hover:scale-[1.008]"
      style={{
        borderColor: `${hex}59`,
        boxShadow: descubiertaTs ? `0 0 0 1px ${hex}22, 0 8px 28px -18px ${hex}55` : `0 0 0 1px ${hex}44, 0 0 26px -6px ${hex}40`,
      }}
      aria-label={`Abrir ficha ${ficha.serie} de ${ficha.nombre}`}
    >
      {/* el tinte de la rareza */}
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(90% 60% at 20% 0%, ${hex}12 0%, transparent 58%)` }} aria-hidden />

      {/* cabecera: serie + sello de rareza */}
      <div className="relative flex items-center justify-between px-3 pt-2.5">
        <span className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground">{ficha.serie}</span>
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

  const { ficha, rareza, top, pulso, intensidad, frescuraMin, cables } = guia;
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

          {/* el estado del álbum + LA GLORIA: presumir */}
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
