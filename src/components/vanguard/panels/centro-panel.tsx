"use client";

// ════════════════════════════════════════════════════════════════
// v172.0 LA AGENCIA CENTRAL — EL CENTRO MUNDIAL DE NOTICIAS
// El Dueño: «que Vanguard sea el mayor centro de noticias del mundo,
// con noticias en vivo POR IMPORTANCIA E IMPACTO, cada una con su
// pie de foto e información, y mapas interactivos 3D en primera
// persona para ver gráficos de guerra y noticias en vivo».
//
//  · EL HÉROE DE IMPACTO — la #1 del planeta, con su foto grande,
//    su PIE DE FOTO, su medidor de impacto 0-100 y «POR QUÉ IMPORTA».
//  · LA ESCALERA — URGENTE → CRÍTICO → ALTO → DESARROLLO → CONTEXTO
//    (motor determinista src/lib/impacto.ts, una sola verdad 2D/3D).
//  · EL RANKING EN VIVO — cada cable con miniatura, bandera, edad,
//    fuente y barra de impacto. Tocar = SALA DE LECTURA (2D = verdad).
//  · EL PULSO — contadores vivos de la Agencia (urgentes, países,
//    cable más fresco, impacto medio). Refresco cada 60s con badge NUEVO.
//  · PARIDAD 3D — emite la SALA DEL MAPA MUNDIAL (tipo "mapa"): los
//    cables como marcadores geolocalizados en primera persona; tocar
//    un marcador desde el mundo abre AQUÍ el lector (protocolo Casa⇄Mundo).
//  · EL MAPA VUELVE — el mapa que v168 retiró de la intro regresa como
//    SALA completa: cero bloqueo de ceremonia, todo el espectáculo.
// ════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Activity, ArrowUpRight, Camera, Globe2, Loader2, Radio, RefreshCw, Satellite, Siren } from "lucide-react";
import { pedirNoticias, pulsoCentro } from "@/lib/noticias-cache";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag } from "@/lib/flags";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LectorNoticia, type CableLectura } from "@/components/vanguard/lector-noticia";
import {
  TIERS, type NoticiaRanqueada, type PulsoAgencia, type TierImpacto,
} from "@/lib/impacto";
// v203.0 EL NOTICIERO — Vanguard HABLA de las noticias: botón del piloto
// (siempre suena) + pulso automático honesto cuando el permiso v201 vive
import { narrarNoticiero, pararNoticiero } from "@/lib/noticiero";
import { pararVoces } from "@/lib/voces-agentes";

type Cable = NoticiaRanqueada;

const ESCALONES: { key: TierImpacto | "todos"; label: string; clase: string }[] = [
  { key: "todos", label: "TODO", clase: "text-foreground border-border bg-secondary" },
  { key: "urgente", label: "URGENTE", clase: TIERS.urgente.clase },
  { key: "critico", label: "CRÍTICO", clase: TIERS.critico.clase },
  { key: "alto", label: "ALTO", clase: TIERS.alto.clase },
  { key: "desarrollo", label: "DESARROLLO", clase: TIERS.desarrollo.clase },
  { key: "contexto", label: "CONTEXTO", clase: TIERS.contexto.clase },
];

export function CentroPanel() {
  const [items, setItems] = useState<Cable[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const arr = JSON.parse(localStorage.getItem("vanguard-centro-cache") || "[]");
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  });
  const [pulso, setPulso] = useState<PulsoAgencia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<TierImpacto | "todos">("todos");
  const [lectura, setLectura] = useState<CableLectura | null>(null);
  const [nuevos, setNuevos] = useState(0);
  const idConocidos = useRef<Set<string>>(new Set());
  const primeraCarga = useRef(true);
  // v203 EL NOTICIERO: estado del botón + el primer pulso ya salió
  const [narrando, setNarrando] = useState(false);
  const primeraVoz = useRef(true);

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      // v196: por el pozo único (balde CENTRO) — GUERRA HOY, el Centinela y
      // las fichas beben la misma agua; si es fresca, cero red
      const lista = (await pedirNoticias(false, "centro")) as Cable[];
      if (lista.length) {
        // el badge NUEVO solo cuenta cables nacidos después de la primera carga
        let n = 0;
        if (!primeraCarga.current) {
          for (const it of lista) if (!idConocidos.current.has(it.id)) n++;
        } else {
          primeraCarga.current = false;
        }
        for (const it of lista) idConocidos.current.add(it.id);
        if (n > 0) {
          setNuevos((v) => v + n);
          toast.success(`${n} cable${n === 1 ? "" : "s"} nuevo${n === 1 ? "" : "s"} en la Agencia`);
        }
        setItems(lista);
        try { localStorage.setItem("vanguard-centro-cache", JSON.stringify(lista.slice(0, 40))); } catch { /* lleno */ }
        // v203: al ATERRIZAR en GUERRA HOY con permiso de hablar concedido,
        // LA ANALISTA cuenta los titulares pesados UNA vez por visita (el
        // cooldown de 4 min de narrarNoticiero manda — nunca bombardea)
        if (primeraVoz.current && lista.length > 0) {
          primeraVoz.current = false;
          void narrarNoticiero(lista, { auto: true, onend: () => setNarrando(false) });
        }
      }
      setPulso((pulsoCentro() as typeof pulso) ?? null);
    } catch {
      // la caché local sostiene la sala — la Agencia nunca calla
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar(true);
    const id = window.setInterval(() => cargar(true), 60000);
    return () => {
      window.clearInterval(id);
      pararNoticiero(); // al salir de la sala, la boca calla (una sola voz viva)
    };
  }, [cargar]);

  // v203: EL BOTÓN NOTICIERO — el toque del piloto ES el permiso: el guion
  // suena siempre que haya titulares; segunda pulsación lo calla
  const noticiero = useCallback(() => {
    if (narrando) {
      pararVoces();
      setNarrando(false);
      return;
    }
    const ok = narrarNoticiero(items, {
      auto: false,
      maximo: 5,
      onend: () => setNarrando(false),
      onerror: () => setNarrando(false),
    });
    if (ok) setNarrando(true);
    else toast.error(items.length ? "La casa está silenciada — activa el sonido" : "Aún no hay cables que contar");
  }, [items, narrando]);

  // ════════════════════════════════════════════════════════════
  // PARIDAD 3D — LA SALA DEL MAPA MUNDIAL: los cables ranqueados
  // salen al universo como marcadores geolocalizados con su foto,
  // su impacto y su pie de foto. Emitir cada 30s (pulso de Agencia).
  // ════════════════════════════════════════════════════════════
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const marcadoresRef = useRef<Cable[]>([]);
  useEffect(() => {
    const emitir = () => {
      const lista = itemsRef.current;
      if (!lista.length) return;
      // los marcadores del mapa: con coordenadas reales, uno por cable,
      // deduplicados por país (el pin más impactante gana el lugar)
      const vistos = new Set<string>();
      const marcadores = lista
        .filter((n) => !!n.coords)
        .sort((a, b) => b.impacto - a.impacto)
        .filter((n) => {
          const k = (n.sourceCountry || "").toUpperCase();
          if (k && vistos.has(k)) return false;
          if (k) vistos.add(k);
          return true;
        })
        .slice(0, 12);
      marcadoresRef.current = marcadores;
      const hero = lista[0];
      try {
        window.dispatchEvent(new CustomEvent("vg:sala3d-datos", {
          detail: {
            tab: "centro", tipo: "mapa",
            marcadores: marcadores.map((n) => ({
              id: n.id,
              titulo: n.title || "SIN TITULAR",
              fuente: (n.source || "AGENCIA").toUpperCase().slice(0, 14),
              tier: TIERS[n.tier].label,
              impacto: n.impacto,
              color: TIERS[n.tier].hex,
              pais: n.paisNombre,
              edad: n.edad,
              lat: n.coords![0],
              lng: n.coords![1],
              img: n.imageUrl || undefined,
              pie: n.pie,
              enVivo: n.edadMin < 120,
            })),
            urgenteTitulo: hero?.title || "",
            espectadores: undefined,
          },
        }));
      } catch { /* el mundo 3D no bloquea el panel */ }
    };
    emitir();
    const id = window.setInterval(emitir, 30000);
    return () => window.clearInterval(id);
  }, []);

  // EL DIALECTO CASA⇄MUNDO — un marcador del mapa 3D tocado desde el
  // universo abre aquí la SALA DE LECTURA del cable (2D = verdad)
  useEffect(() => {
    const onAccion = (e: Event) => {
      const d = (e as CustomEvent<{ tab: string; accion: string; idx: number }>).detail;
      if (d?.tab !== "centro" || d.accion !== "abrir") return;
      const m = marcadoresRef.current[d.idx];
      if (!m) return;
      setLectura(aCable(m));
      window.dispatchEvent(new CustomEvent("vg:sala3d-lectura", { detail: { abierta: true } }));
    };
    window.addEventListener("vg:sala3d-accion", onAccion);
    return () => window.removeEventListener("vg:sala3d-accion", onAccion);
  }, []);

  const aCable = (n: Cable): CableLectura => ({
    id: n.id,
    title: n.title,
    url: n.url,
    source: n.source,
    publishedAt: typeof n.publishedAt === "string" ? n.publishedAt : new Date(n.publishedAt).toISOString(),
    tacticalTag: n.tacticalTag ?? null,
    conflictTag: n.conflictTag ?? null,
    sourceCountry: n.sourceCountry ?? null,
  });

  const hero = items[0] ?? null;
  const filtrados = useMemo(
    () => (filtro === "todos" ? items : items.filter((n) => n.tier === filtro)),
    [items, filtro],
  );

  const cuentaTier = (k: TierImpacto): number => items.filter((n) => n.tier === k).length;

  return (
    <div className="space-y-4">
      <PanelHeader
        title="CENTRO MUNDIAL DE NOTICIAS"
        subtitle="En vivo · por importancia e impacto · el mayor centro del mundo"
        icon={<Siren className="w-4 h-4" />}
        color="red"
        right={
          <button
            onClick={noticiero}
            className={cn(
              "mt-1 px-2 py-0.5 border font-mono text-[9px] uppercase tracking-widest vg-transition flex items-center gap-1",
              narrando ? "border-red-hud/70 text-red-hud" : "border-electric-hud/70 text-electric hover:bg-electric-hud/10"
            )}
            aria-label="Escuchar el noticiero de Vanguard"
            data-vg203-noticiero="1"
          >
            <Radio className={cn("w-3 h-3", narrando && "blink-soft")} />
            {narrando ? "■ PARAR" : "▶ NOTICIERO"}
          </button>
        }
      />

      {/* ══════ EL HÉROE DE IMPACTO ══════ */}
      {cargando && !items.length ? (
        <div className="space-y-2">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : hero ? (
        <article className="relative overflow-hidden border border-red-hud/40 bg-card hud-panel">
          {/* LA FOTO CON SU PIE — la regla de oro: título grande → ilustración → pie */}
          <div className="relative h-44 sm:h-60 w-full">
            {hero.imageUrl ? (
              <Image
                src={hero.imageUrl}
                alt={hero.title}
                fill
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-red-hud/40 via-card to-background flex items-center justify-center">
                <Satellite className="w-10 h-10 text-red-hud/60" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            {/* EL PIE DE FOTO — cada imagen con su contexto */}
            <figcaption className="absolute bottom-0 inset-x-0 px-3 py-1.5 bg-background/80 backdrop-blur-sm text-[10px] sm:text-xs text-muted-foreground border-t border-border/60 flex items-center gap-1.5">
              <Camera className="w-3 h-3 shrink-0" />
              <span className="truncate">{hero.pie}</span>
            </figcaption>
            {/* EL Sello URGENTE */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <span className={cn("px-2 py-0.5 border text-[10px] font-bold tracking-widest animate-pulse", TIERS[hero.tier].clase)}>
                {TIERS[hero.tier].label}
              </span>
              <span className="px-2 py-0.5 border border-border bg-background/70 text-[10px] font-mono text-amber tracking-widest">
                IMPACTO {hero.impacto}
              </span>
            </div>
          </div>

          <div className="p-3 sm:p-4 space-y-3">
            {/* EL TÍTULO GRANDE */}
            <h3 className="font-caviar text-lg sm:text-2xl font-bold leading-tight tracking-wide">
              <a href={hero.url} target="_blank" rel="noopener noreferrer" className="hover:text-red-hud transition-colors inline-flex items-start gap-1.5">
                {hero.title}
                <ArrowUpRight className="w-4 h-4 mt-1 shrink-0 text-red-hud" />
              </a>
            </h3>

            {/* EL MEDIDOR DE IMPACTO */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary overflow-hidden border border-border/50">
                <div
                  className={cn("h-full transition-all duration-700", TIERS[hero.tier].claseBarra)}
                  style={{ width: `${hero.impacto}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{hero.impacto}/100</span>
            </div>

            {/* POR QUÉ IMPORTA — la información de cada cable */}
            <div className="border-l-2 border-red-hud/60 pl-3 py-1 bg-red-hud/5">
              <p className="text-[10px] font-bold tracking-[0.2em] text-red-hud mb-1">POR QUÉ IMPORTA</p>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">{hero.resumen}</p>
            </div>

            {/* META + ACCIONES */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {hero.sourceCountry && <Flag code={hero.sourceCountry} size={16} />}
              <span className="font-mono">{hero.paisNombre}</span>
              <span>·</span>
              <span>{hero.source}</span>
              <span>·</span>
              <span className="font-mono">{hero.edad}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLectura(aCable(hero))}
                className="flex-1 min-h-11 border border-red-hud/60 bg-red-hud/15 text-red-hud text-xs font-bold tracking-widest hover:bg-red-hud/25 transition-colors flex items-center justify-center gap-1.5"
              >
                <BookOpenIcon /> LEER INFORME
              </button>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("vg:centro-ver-mapa"));
                  toast("El mapa mundial vive en 3D — pulsa VER EN 3D");
                }}
                className="flex-1 min-h-11 border border-amber-hud/60 bg-amber-hud/10 text-amber text-xs font-bold tracking-widest hover:bg-amber-hud/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Globe2 className="w-3.5 h-3.5" /> VER EN EL MAPA 3D
              </button>
            </div>
          </div>
        </article>
      ) : (
        <div className="border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          LA AGENCIA ESTÁ SINTONIZANDO LA RED MUNDIAL — PRIMER CABLE EN CAMINO
        </div>
      )}

      {/* ══════ EL PULSO DE LA AGENCIA ══════ */}
      {pulso && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { k: "URGENTES", v: String(pulso.urgente), c: "text-red-hud" },
            { k: "PAÍSES", v: String(pulso.paises), c: "text-cyan-hud" },
            { k: "MÁS FRESCO", v: pulso.frescoMin < 60 ? `${pulso.frescoMin}m` : `${Math.round(pulso.frescoMin / 60)}h`, c: "text-amber" },
            { k: "IMP. MEDIO", v: String(pulso.impactoMedio), c: "text-green-hud" },
          ].map((s) => (
            <div key={s.k} className="border border-border/60 bg-card p-2 text-center hud-panel">
              <p className={cn("text-lg font-bold font-mono leading-none", s.c)}>{s.v}</p>
              <p className="text-[9px] tracking-[0.18em] text-muted-foreground mt-1">{s.k}</p>
            </div>
          ))}
        </div>
      )}

      {/* ══════ LA ESCALERA DE IMPACTO ══════ */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {ESCALONES.map((e) => {
          const activo = filtro === e.key;
          const n = e.key === "todos" ? items.length : cuentaTier(e.key as TierImpacto);
          return (
            <button
              key={e.key}
              onClick={() => setFiltro(e.key)}
              className={cn(
                "shrink-0 px-2.5 py-1.5 border text-[10px] font-bold tracking-widest transition-colors min-h-8",
                e.clase,
                activo && "ring-1 ring-amber/80 bg-amber/10",
              )}
            >
              {e.label} <span className="opacity-70 font-mono">{n}</span>
            </button>
          );
        })}
      </div>

      {/* ══════ EL RANKING EN VIVO ══════ */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-red-hud" /> RANKING EN VIVO
          </h4>
          <div className="flex items-center gap-2">
            {nuevos > 0 && (
              <span className="text-[10px] font-mono text-red-hud border border-red-hud/50 px-1.5 py-0.5 animate-pulse">
                +{nuevos} NUEVOS
              </span>
            )}
            <button
              onClick={() => { setNuevos(0); cargar(); }}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              {cargando ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} 60S
            </button>
          </div>
        </div>

        {cargando && !items.length ? (
          <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : filtrados.length === 0 ? (
          <div className="border border-border bg-card p-4 text-center text-xs text-muted-foreground">
            SIN CABLES EN ESTE ESCALÓN — LA RED SIGUE ESCANEANDO
          </div>
        ) : (
          <ol className="space-y-2">
            {filtrados.map((n, i) => (
              <li key={n.id}>
                <button
                  onClick={() => setLectura(aCable(n))}
                  className="w-full text-left border border-border/70 bg-card hover:border-amber-hud/50 transition-colors group"
                >
                  <div className="flex gap-2.5 p-2">
                    {/* LA MINIATURA CON PIE AL HOVER */}
                    <div className="relative w-16 sm:w-24 h-16 sm:h-20 shrink-0 overflow-hidden border border-border/50">
                      {n.imageUrl ? (
                        <Image src={n.imageUrl} alt={n.title} fill sizes="96px" className="object-cover" unoptimized />
                      ) : (
                        <div className="absolute inset-0 bg-secondary flex items-center justify-center">
                          <Radio className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={cn("px-1.5 py-0.5 border text-[9px] font-bold tracking-widest", TIERS[n.tier].clase)}>
                          {TIERS[n.tier].label}
                        </span>
                        <span className="text-[9px] font-mono text-amber">IMP {n.impacto}</span>
                        {n.edadMin < 120 && (
                          <span className="text-[9px] font-mono text-red-hud animate-pulse">● EN VIVO</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold leading-snug line-clamp-2 group-hover:text-amber transition-colors">
                        {n.title}
                      </p>
                      {/* EL PIE DE FOTO — también bajo cada miniatura */}
                      <p className="text-[10px] text-muted-foreground mt-1 truncate">{n.pie}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-16 h-1 bg-secondary overflow-hidden">
                          <div className={cn("h-full", TIERS[n.tier].claseBarra)} style={{ width: `${n.impacto}%` }} />
                        </div>
                        {n.sourceCountry && <Flag code={n.sourceCountry} size={12} />}
                        <span className="text-[9px] font-mono text-muted-foreground truncate">{n.source} · {n.edad}</span>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* LA SALA DE LECTURA — el lector de la casa (v116) */}
      <LectorNoticia cable={lectura} onCerrar={() => setLectura(null)} />
    </div>
  );
}

// iconos locales sin import extra (BookOpenIcon se compone de trazos simples)
function BookOpenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
