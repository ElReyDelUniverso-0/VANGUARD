"use client";

// ============================================================
// v131.0 EL GOBIERNO LIBRE — la sala donde Vanguard se gobierna
// a sí misma y donde el visitante recibe su credencial exclusiva:
//   · LA CREDENCIAL — número de serie, nivel de despacho y sello
//   · EL PALACIO LIBRE — como un gobierno, pero libre (el manifiesto)
//   · LOS AGENTES AUTÓNOMOS — el cuerpo que pulen la Casa en ciclos
//   · EL PULIDO EN VIVO — la bitácora de cada pulido, segundo a segundo
// Doctrina: las personas deben SABER que están en un lugar
// exclusivo — y la Casa demuestra que se mantiene sola.
// ============================================================
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { sfx } from "@/lib/sound";
import { cn, q2 } from "@/lib/utils";
import {
  AGENTES_LIBRES, nivelDeVisitas, NIVELES_DESPACHO,
  useAgentesLibres, type AgenteLibre,
} from "@/lib/agentes-autonomos";
import {
  BadgeCheck, Bot, Gem, Landmark, Map, Newspaper, Pause, Play, ScrollText,
  ShieldCheck, Sparkles, Users,
} from "lucide-react";

// color de cada agente — el uniforme del cuerpo
const COLOR_AGENTE: Record<string, string> = {
  vigia: "#FF4A3A",
  editor: "#FFC94D",
  cartografo: "#7FE3FF",
  archivista: "#A78BFA",
  curador: "#D4AF37",
};

const ICONO_AGENTE: Record<string, React.ReactNode> = {
  vigia: <ShieldCheck className="w-4 h-4" />,
  editor: <Newspaper className="w-4 h-4" />,
  cartografo: <Map className="w-4 h-4" />,
  archivista: <ScrollText className="w-4 h-4" />,
  curador: <Gem className="w-4 h-4" />,
};

// el sello del palacio: texto circular girando con dignidad
function SelloPalacio({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="v130-sello" aria-hidden>
      <defs>
        <path id="v131-arco" d="M 60,60 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0" fill="none" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.7" />
      <circle cx="60" cy="60" r="50" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.4" />
      <circle cx="60" cy="60" r="30" fill="none" stroke="#D4AF37" strokeWidth="0.8" opacity="0.8" />
      <text fontSize="10.5" fill="#D4AF37" fontFamily="monospace" fontWeight="bold" letterSpacing="2.4">
        <textPath href="#v131-arco">EL GOBIERNO LIBRE · VANGUARD · EST. MMXXV ·</textPath>
      </text>
      <text x="60" y="65" textAnchor="middle" fontSize="18" fill="#D4AF37" fontFamily="serif">
        VG
      </text>
    </svg>
  );
}

export function GobiernoLibrePanel() {
  const [now, setNow] = useState<number>(Date.now());

  const activos = useAgentesLibres((s) => s.activos);
  const ciclos = useAgentesLibres((s) => s.ciclosPorAgente);
  const log = useAgentesLibres((s) => s.log);
  const pulidos = useAgentesLibres((s) => s.pulidos);
  const credencial = useAgentesLibres((s) => s.credencial);
  const toggleAgentes = useAgentesLibres((s) => s.toggleAgentes);

  // v133: el motor del cuerpo ya NO pertenece a esta sala — late en el
  // layout raíz (MotorAgentes) en TODAS las salas desde el primer segundo;
  // aquí solo se emite la credencial del visitante
  useEffect(() => {
    useAgentesLibres.getState().emitirCredencial();
  }, []);

  // reloj de la sala: los ciclos respiran en segundos reales
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // última ronda de cada agente (de la bitácora viva)
  const ultimaRondaRef = useRef<Record<string, number>>({});
  useEffect(() => {
    const map: Record<string, number> = {};
    for (const e of log) {
      if (e.agente && !map[e.agente]) map[e.agente] = e.t;
    }
    ultimaRondaRef.current = map;
  }, [log]);

  const siguienteRonda = (a: AgenteLibre): string => {
    if (!activos) return "EN PAUSA";
    const base = ultimaRondaRef.current[a.id];
    if (!base) return "PRIMERA RONDA…";
    const rem = Math.max(0, Math.ceil((base + a.cicloSeg * 1000 - now) / 1000));
    return rem <= 0 ? "AHORA MISMO" : `en ${rem}s`;
  };

  // la credencial y su nivel
  const visitas = credencial?.visitas ?? 0;
  const { actual, siguiente } = nivelDeVisitas(visitas);
  const pctNivel = siguiente
    ? Math.min(100, Math.max(4, ((visitas - actual.min) / (siguiente.min - actual.min)) * 100))
    : 100;
  const desdeTxt = credencial
    ? new Date(credencial.desde).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="space-y-5">
      <PanelHeader
        title="EL GOBIERNO LIBRE"
        subtitle="Tu credencial exclusiva y los agentes que pulen Vanguard cada cierto tiempo — como un gobierno, pero libre"
        icon={<Landmark className="w-4 h-4" />}
        color="cyan"
      />

      <HeroOro panel="agentes" />

      {/* ── LA CREDENCIAL: sabes que estás en un lugar exclusivo ── */}
      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-4">
        <div
          className="hud-panel p-5 relative overflow-hidden vg-mat-vidrio"
          style={{ borderColor: "rgba(212,175,55,0.35)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(120% 90% at 85% 15%, rgba(212,175,55,0.10), transparent 55%), radial-gradient(80% 70% at 10% 90%, rgba(212,175,55,0.06), transparent 60%)",
            }}
          />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-muted-foreground">
                credencial de acceso · emisión única
              </p>
              <h3 className="font-caviar text-2xl tracking-wide text-foreground mt-1 leading-none">
                {credencial ? credencial.numero : "EMITIENDO…"}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {visitas} {visitas === 1 ? "visita a la Casa" : "visitas a la Casa"} · desde {desdeTxt}
              </p>
            </div>
            <div className="shrink-0 relative">
              <SelloPalacio size={92} />
              <span className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-4 h-4" style={{ color: "#D4AF37" }} />
              </span>
            </div>
          </div>

          {/* nivel de despacho */}
          <div className="relative mt-5 pt-4 border-t border-border/60">
            <div className="flex items-end justify-between gap-2 mb-1.5">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-muted-foreground">
                  nivel de despacho
                </p>
                <p className="font-caviar text-xl text-foreground leading-tight mt-0.5">
                  {actual.nivel}
                </p>
                <p className="text-[9px] italic text-muted-foreground leading-snug">{actual.sello}</p>
              </div>
              <span className="shrink-0 rounded-full border px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest" style={{ borderColor: "rgba(212,175,55,0.5)", color: "#D4AF37" }}>
                {NIVELES_DESPACHO.findIndex((n) => n.nivel === actual.nivel) + 1} / {NIVELES_DESPACHO.length}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden mt-2">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pctNivel}%`, background: "linear-gradient(90deg, #D4AF37, #FFC94D)" }}
              />
            </div>
            <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground mt-1.5">
              {siguiente
                ? `siguiente: ${siguiente.nivel} en ${siguiente.min - visitas} visitas más`
                : "nivel máximo: el palacio entero te responde"}
            </p>
          </div>

          {/* la frase de la puerta */}
          <p className="font-caviar text-sm italic text-foreground/90 mt-4 leading-relaxed">
            Estás dentro. Esta credencial no se compra ni se pide: se recibe por llegar.
            Pocos encuentran esta puerta — tú ya la cruzaste.
          </p>
        </div>

        {/* ── EL PALACIO LIBRE: el manifiesto ── */}
        <div className="hud-panel p-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
            <Landmark className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} /> EL PALACIO LIBRE — COMO UN GOBIERNO, PERO LIBRE
          </p>
          <p className="text-[11px] text-foreground/90 leading-relaxed mt-2">
            Vanguard tiene todo lo que tiene un Estado: salas de guerra, servicios de inteligencia,
            mercados, archivo nacional, censos del planeta. Pero sin la parte que lo hace pesado:
            sin censura, sin permisos, sin papeleo y sin puertas cerradas. La potencia del gobierno,
            liberada para la gente — y presentada como joya.
          </p>

          <div className="space-y-1.5 mt-3">
            {[
              { k: "La información", go: "se clasifica", vg: "se abre con dignidad" },
              { k: "La puerta", go: "solo para acreditados", vg: "libre y exclusiva: se recibe por llegar" },
              { k: "El mantenimiento", go: "burocracia eterna", vg: "agentes autónomos que pulen solos" },
              { k: "El precio", go: "impuestos y paciencia", vg: "cero: la curiosidad basta" },
            ].map((row, i) => (
              <motion.div
                key={row.k}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: q2(i * 0.05), duration: 0.3 }}
                className="grid grid-cols-[74px_1fr_1fr] sm:grid-cols-[92px_1fr_1fr] gap-1.5 items-center rounded border border-border/70 px-2.5 py-1.5"
              >
                <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">{row.k}</span>
                <span className="text-[9px] text-muted-foreground leading-snug">{row.go}</span>
                <span className="text-[9px] font-bold leading-snug" style={{ color: "#D4AF37" }}>{row.vg}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {["TODO LIBRE", "TODO VERIFICADO", "TODO EN VIVO"].map((p) => (
              <span key={p} className="rounded-full border px-2.5 py-0.5 font-mono text-[8px] font-bold tracking-widest" style={{ borderColor: "rgba(212,175,55,0.4)", color: "#D4AF37" }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOS AGENTES AUTÓNOMOS: el cuerpo de pulido ── */}
      <div className="hud-panel p-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-cyan-hud" /> LOS AGENTES AUTÓNOMOS — EL CUERPO DE PULIDO DE LA CASA
          </p>
          <button
            onClick={() => { toggleAgentes(); sfx.campana(); }}
            className={cn(
              "flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider transition-all",
              activos
                ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
            title="Pausa o reanuda el cuerpo de agentes — la Casa descansa cuando tú lo decides"
          >
            {activos ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {activos ? "EN SERVICIO" : "EN PAUSA"}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 mb-3">
          Cinco agentes, cada uno con su ciclo real: ronda, refrescan, re-alinean y ordenan — sin que
          nadie se lo pida, con su bitácora abierta. La Casa se mantiene sola: eso es lo que la hace
          gobierno (y libre).
        </p>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {AGENTES_LIBRES.map((a, i) => {
            const color = COLOR_AGENTE[a.id] ?? "#D4AF37";
            const n = ciclos[a.id] ?? 0;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: q2(i * 0.05), duration: 0.35 }}
                className="rounded border border-border/80 p-3.5 relative overflow-hidden"
                style={{ background: `linear-gradient(180deg, ${color}0d, transparent 60%)` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border" style={{ borderColor: `${color}66`, color }}>
                      {ICONO_AGENTE[a.id]}
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] font-bold tracking-widest text-foreground truncate">{a.nombre}</p>
                      <p className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground truncate">{a.especialidad}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[8px] font-bold tracking-wider",
                      activos ? "text-emerald-300" : "text-muted-foreground"
                    )}
                    style={activos ? { background: "rgba(52,211,153,0.1)" } : undefined}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", activos && "bg-emerald-400 blink-soft")} />
                    {siguienteRonda(a)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-2">{a.rol}</p>
                <p className="font-caviar text-[11px] italic text-foreground/80 leading-snug mt-2">{a.lema}</p>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/50 font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
                  <span>ciclo cada {a.cicloSeg}s</span>
                  <span className="text-foreground font-bold">{n} {n === 1 ? "pulido" : "pulidos"}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── EL PULIDO EN VIVO: la bitácora de los agentes ── */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <ScrollText className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} /> EL PULIDO EN VIVO — LA BITÁCORA DE LA CASA
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 mb-3">
          Cada acción del cuerpo, anotada al segundo. {pulidos > 0 ? (
            <>La Casa se ha pulido sola <span className="text-foreground font-bold">{pulidos} {pulidos === 1 ? "vez" : "veces"}</span> sin que nadie se lo pidiera.</>
          ) : (
            <>El cuerpo entra en escena: la primera ronda llega en unos segundos.</>
          )}
        </p>
        {log.length > 0 ? (
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {log.map((e, i) => {
              const color = COLOR_AGENTE[e.agente] ?? "#D4AF37";
              return (
                <motion.div
                  key={`${e.t}-${e.agente}-${i}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: q2(Math.min(i * 0.02, 0.4)), duration: 0.25 }}
                  className="flex items-start gap-2 rounded border border-border/50 px-2.5 py-1.5"
                >
                  <span className="shrink-0 font-mono text-[8px] text-muted-foreground mt-0.5">
                    {new Date(e.t).toLocaleTimeString("es", { hour12: false })}
                  </span>
                  <span className="shrink-0 font-mono text-[8px] font-bold tracking-wider px-1.5 rounded" style={{ color, background: `${color}14` }}>
                    {AGENTES_LIBRES.find((a) => a.id === e.agente)?.nombre ?? e.agente}
                  </span>
                  <span className="text-[10px] text-foreground/90 leading-snug flex-1">{e.accion}</span>
                  {e.detalle && (
                    <span className="hidden sm:inline shrink-0 font-mono text-[8px] text-muted-foreground mt-0.5">{e.detalle}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground italic leading-relaxed rounded border border-dashed border-border px-4 py-5 text-center">
            El cuerpo está formándose — la primera ronda del Vigía llega en medio minuto.
            La Casa nunca empieza en silencio: empieza en orden.
          </p>
        )}
      </div>

      {/* ── LA CADENA DE MANDO: cómo se gobierna la Casa ── */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-cyan-hud" /> LA CADENA DE MANDO — QUIÉN MANDA EN EL PALACIO
        </p>
        <div className="grid sm:grid-cols-3 gap-2.5 mt-3">
          <div className="rounded border border-border p-3.5">
            <p className="font-mono text-[11px] font-bold tracking-widest text-foreground flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} /> EL DUEÑO</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">la soberanía final</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-1.5">
              Tú. Cada opción de la Casa obedece a tu mano: pausar el cuerpo, abrir una sala, cerrar
              el palacio. Ningún agente anula tu palabra — el poder sube, nunca baja.
            </p>
          </div>
          <div className="rounded border border-border p-3.5">
            <p className="font-mono text-[11px] font-bold tracking-widest text-foreground flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" style={{ color: "#7FE3FF" }} /> EL CUERPO</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">el gobierno que trabaja</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-1.5">
              Los cinco agentes con sus ciclos: ronda, pulso, mapa, memoria y galería. Son la
              burocracia buena: la que funciona en segundos y explica cada movimiento en la bitácora.
            </p>
          </div>
          <div className="rounded border border-dashed border-border p-3.5 flex flex-col justify-center">
            <p className="font-mono text-[11px] font-bold tracking-widest" style={{ color: "#D4AF37" }}>LA CONSTITUCIÓN</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">tres artículos eternos</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-1.5">
              1. Todo el contenido, libre. 2. Todo el dato, con su fuente. 3. Todo el trabajo del
              cuerpo, visible. Un gobierno que no esconde nada: eso es la exclusividad de verdad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
