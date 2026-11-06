"use client";

// ═══════════════════════════════════════════════════════════════
// v361.0 EL MAPA QUE EXPLICA — FASE 2 del mandato del Dueño:
// «mapas como animados explicando conflictos diversos dinámicos
// en el inicio». El mapa mundial REAL (WorldMapSVG, continentes de
// Natural Earth) con los seis teatros de la Sala de Guerra vivos
// sobre él, y una tarjeta que EXPLICA uno a uno, en rotación,
// qué está pasando en cada conflicto — con la honestidad de la
// casa: estimaciones OSINT editorializadas, fuente a la vista,
// Vanguard no predice: presenta.
//
// Reutiliza (cero duplicación): WorldMapSVG con sus animaciones
// nativas (pings de sonar, onda de choque en CRÍTICO, corona de
// designación sobre el foco) + GUERRAS de guerras-activas-data.
// La rotación es UN intervalo (7s) que se salta el avance si el
// aparato pidió prefers-reduced-motion o si el agente interactuó
// hace menos de 15s — cero intervalos encadenados, cero efectos
// en cascada (patrón del pozo único v196).
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { WorldMapSVG } from "@/components/vanguard/world-map-svg";
import type { ConflictRegion } from "@/lib/game-data";
import { GUERRAS } from "@/lib/guerras-activas-data";
import { navigateTo } from "@/lib/nav";
import { sfx } from "@/lib/sound";
import { Flame, Eye, Swords, ChevronRight, MapIcon } from "lucide-react";

// la escalada publicada de la casa (1-5) → el nivel del mapa maestro
function nivelDeEscalada(escalada: number): ConflictRegion["level"] {
  if (escalada >= 5) return "CRITICO";
  if (escalada >= 3) return "TENSION";
  if (escalada === 2) return "INESTABILIDAD";
  return "VIGILANCIA";
}

// los seis teatros REALES de la casa, en el idioma del mapa maestro
const TEATROS: ConflictRegion[] = GUERRAS.map((g) => ({
  id: g.id,
  name: g.nombre.split(" — ")[0],
  country: g.bandoA.nombre,
  flag: g.bandoA.bandera,
  level: nivelDeEscalada(g.escalada),
  intensity: g.intensidad,
  summary: g.resumen,
  lat: g.lat,
  lng: g.lng,
  factions: g.actores,
  since: g.desde,
  casualties: g.bajas.texto,
  civilianImpact: g.desplazados,
  humanitarian: g.riesgoGlobal,
  tags: g.keywords.slice(0, 4),
}));

const NIVEL_TXT: Record<ConflictRegion["level"], string> = {
  CRITICO: "CRÍTICO",
  TENSION: "TENSIÓN",
  INESTABILIDAD: "INESTABILIDAD",
  VIGILANCIA: "VIGILANCIA",
};

const NIVEL_COLOR: Record<ConflictRegion["level"], string> = {
  CRITICO: "#FF4A3A",
  TENSION: "#FFB02A",
  INESTABILIDAD: "#A855F7",
  VIGILANCIA: "#22D3EE",
};

const MS_ROTACION = 7_000;
const MS_PAUSA_INTERACCION = 15_000;

// el aparato pidió menos movimiento: suscripción limpia por useSyncExternalStore
// (cero setState en effects — ley v335) — en servidor no hay matchMedia
const suscribirReducido = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const leerReducido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reducidoServidor = () => false;

export function MapaConflictosInicio() {
  const [foco, setFoco] = useState(0);
  const reducido = useSyncExternalStore(suscribirReducido, leerReducido, reducidoServidor);
  const ultimaInteraccion = useRef(0);

  // UN solo latido de rotación: avanza el foco si nadie interactuó hace poco
  useEffect(() => {
    const t = setInterval(() => {
      if (reducido) return;
      if (Date.now() - ultimaInteraccion.current < MS_PAUSA_INTERACCION) return;
      setFoco((f) => (f + 1) % TEATROS.length);
    }, MS_ROTACION);
    return () => clearInterval(t);
  }, [reducido]);

  const anotar = () => { ultimaInteraccion.current = Date.now(); };

  const elegir = (id: string) => {
    const i = TEATROS.findIndex((t) => t.id === id);
    if (i < 0) return;
    anotar();
    sfx.campana();
    setFoco(i);
  };

  const guerra = GUERRAS[foco] ?? GUERRAS[0];
  const teatros = TEATROS;
  const teatro: ConflictRegion = teatros[foco] ?? teatros[0];
  const color = NIVEL_COLOR[teatro.level];
  const ultimoHito = guerra.hitos.length > 0 ? guerra.hitos[guerra.hitos.length - 1] : null;

  return (
    <section
      data-testid="mapa-inicio"
      className="hud-panel p-3 sm:p-4"
      onMouseEnter={anotar}
      onTouchStart={anotar}
      aria-label="Mapa animado de los conflictos del mundo, explicados uno a uno"
    >
      {/* ── cabecera de la sección ── */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-hud blink-soft" />
          <h2 className="font-display text-sm sm:text-base font-bold tracking-widest uppercase text-gradient nexus-letra">
            El mapa que explica
          </h2>
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest hidden sm:inline">
            {guerra.activa ? "conflictos en fuego · rotación viva" : "conflictos del planeta · rotación viva"}
          </span>
        </div>
        <button
          onClick={() => { anotar(); navigateTo("salaguerra"); }}
          data-testid="mapa-inicio-sala"
          className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-amber hover:text-foreground transition-colors"
        >
          Sala de Guerra <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-3">
        {/* ── EL MAPA — continentes reales, marcadores vivos ── */}
        <div className="rounded border border-border/60 bg-black/40 overflow-hidden relative">
          <WorldMapSVG
            conflicts={teatros}
            selected={teatro.id}
            onSelectConflict={elegir}
            showFronts
            showSat={false}
          />
          {/* el mando de rotación a mano: un teatro, un botón */}
          <div
            data-testid="mapa-inicio-puntos"
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm rounded-full px-2.5 py-1.5 border border-border/40"
          >
            {teatros.map((t, i) => (
              <button
                key={t.id}
                onClick={() => elegir(t.id)}
                aria-label={`Explicar ${t.name}`}
                aria-current={i === foco}
                className="rounded-full transition-all"
                style={{
                  width: i === foco ? 18 : 7,
                  height: 7,
                  background: i === foco ? NIVEL_COLOR[t.level] : "rgba(255,255,255,0.28)",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── LA EXPLICACIÓN — la tarjeta que rota con el foco ── */}
        <motion.div
          key={guerra.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          data-testid="mapa-inicio-foco"
          className="rounded border border-border/60 bg-secondary/30 p-3.5 flex flex-col gap-2.5 min-w-0"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg leading-none">{guerra.bandoA.bandera}</span>
            <span className="font-display text-base sm:text-lg font-black tracking-wide text-soft">
              {guerra.nombre.split(" — ")[0]}
            </span>
            {guerra.activa ? (
              <span className="flex items-center gap-1 font-mono text-[8px] tracking-widest uppercase text-red-300 border border-red-500/50 bg-red-500/10 rounded px-1.5 py-0.5">
                <Flame className="w-2.5 h-2.5" /> En fuego
              </span>
            ) : (
              <span className="flex items-center gap-1 font-mono text-[8px] tracking-widest uppercase text-cyan-300 border border-cyan-500/40 bg-cyan-500/10 rounded px-1.5 py-0.5">
                <Eye className="w-2.5 h-2.5" /> Observado
              </span>
            )}
          </div>

          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Desde {guerra.desde} · nivel {NIVEL_TXT[teatro.level]}
          </p>

          {/* la intensidad publicada, con su color */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-border/40 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${guerra.intensidad}%`, background: color }} />
            </div>
            <span className="font-mono text-[10px] font-bold" style={{ color }}>{guerra.intensidad}</span>
          </div>

          {/* lo que está pasando — el resumen real de la casa */}
          <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-4 sm:line-clamp-5">
            {guerra.resumen}
          </p>

          {/* el último hito real de la cronología */}
          {ultimoHito && (
            <p className="text-[11px] leading-relaxed text-foreground/85 border-l-2 pl-2.5" style={{ borderLeftColor: color }}>
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color }}>
                {ultimoHito.fecha}
              </span>
              <br />
              {ultimoHito.evento}
            </p>
          )}

          {/* el coste humano, con su nota honesta */}
          <div className="grid grid-cols-1 gap-1 font-mono text-[10px] leading-relaxed">
            <p className="text-muted-foreground">
              <span className="text-foreground font-bold">Bajas (est.): </span>
              {guerra.bajas.texto}
            </p>
            <p className="text-muted-foreground">
              <span className="text-foreground font-bold">Desplazados: </span>
              {guerra.desplazados}
            </p>
          </div>

          {/* quién está en la mesa */}
          <div className="flex flex-wrap gap-1">
            {guerra.actores.slice(0, 4).map((a) => (
              <span key={a} className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">
                {a}
              </span>
            ))}
          </div>

          {/* la fuente, siempre a la vista */}
          <p className="text-[9px] font-mono text-muted-foreground/80 leading-relaxed mt-auto">
            Fuente: {guerra.fuente}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/guerra-hoy"
              data-testid="mapa-inicio-guerrahoy"
              onClick={anotar}
              className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber hover:text-foreground transition-colors"
            >
              <MapIcon className="w-3 h-3" /> GUERRA HOY <ChevronRight className="w-3 h-3" />
            </Link>
            <button
              onClick={() => { anotar(); navigateTo("salaguerra"); }}
              className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <Swords className="w-3 h-3" /> Simular el teatro
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── la honestidad de la casa, siempre al pie ── */}
      <p className="mt-2.5 text-[9px] font-mono text-muted-foreground/70 leading-relaxed">
        Esquema OSINT aproximado: estimaciones editorializadas con fuentes abiertas
        (ISW · ACLED · OCHA · ACNUR · ONU · prensa verificada). Las zonas son esquemas,
        no cartografía oficial. Vanguard no predice: presenta.
        {reducido && " Rotación pausada: elige un teatro a mano."}
      </p>
    </section>
  );
}
