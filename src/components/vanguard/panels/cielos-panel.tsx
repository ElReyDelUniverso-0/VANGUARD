"use client";

// v90.0 ESPEJOS SIN FIN — CIELOS (espejo del gran rastreador de vuelos:
// mapa con pines en vivo, lista lateral con llamada/tipo/altitud/velocidad,
// ficha de vuelo y la mecánica propia "transpondedor apagado").

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, RadioTower, EyeOff, Crosshair, Gauge, ArrowUpRight } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { WorldMapSVG } from "@/components/vanguard/world-map-svg";
import { VUELO_TIPOS, generarCielos, tipoDe, pingsDeVuelos, rutasDeVuelos, fmtRumbo, fmtAlt, type Vuelo } from "@/lib/cielos-data";
import { cn } from "@/lib/utils";

export function CielosPanel() {
  const [ahora, setAhora] = useState(() => Date.now());
  const [sel, setSel] = useState<string | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState<string | null>(null);
  const [verOscuros, setVerOscuros] = useState(true);

  // pulso vivo: recalcula posiciones cada 2 s
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 2000);
    return () => clearInterval(t);
  }, []);

  const sky = useMemo(() => generarCielos(ahora), [ahora]);
  const vuelos = useMemo(() => sky.vuelos.filter((v) => (tipoFiltro ? v.tipo === tipoFiltro : true)), [sky, tipoFiltro]);
  const visibles = useMemo(() => vuelos.filter((v) => verOscuros || !v.oscuro), [vuelos, verOscuros]);
  const seleccionado = visibles.find((v) => v.id === sel) ?? null;

  const pings = useMemo(() => pingsDeVuelos(visibles), [visibles]);
  const rutas = useMemo(() => rutasDeVuelos(visibles), [visibles]);

  const toggleTipo = (id: string) => setTipoFiltro((t) => (t === id ? null : id));

  return (
    <div className="space-y-4">
      <PanelHeader
        title="CIELOS — rastreador de vuelos militares"
        subtitle="Cada señal ADS-B militar del planeta, con las que deciden no hablar"
        icon={<Plane className="w-4 h-4 text-violet-hud" />}
        color="violet"
        right={
          <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-1 border border-violet-hud/60 text-violet-hud bg-violet-hud/10">
            <RadioTower className="w-3 h-3" /> {visibles.length} EN EL AIRE · {sky.oscuros} SIN SEÑAL
          </span>
        }
      />
      <HeroOro panel="cielos" />

      {/* filtros por tipo */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {VUELO_TIPOS.map((t) => {
          const activo = tipoFiltro === t.id;
          return (
            <button
              key={t.id}
              onClick={() => toggleTipo(t.id)}
              className={cn(
                "text-[10px] font-mono uppercase px-2 py-1 border transition-all active:scale-95 flex items-center gap-1.5",
                activo ? "border-violet-hud bg-violet-hud/15" : "border-border text-muted-foreground hover:border-violet-hud/50"
              )}
              style={activo ? { color: t.color } : undefined}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.color, boxShadow: `0 0 6px ${t.color}` }} />
              {t.nombre}
            </button>
          );
        })}
        <button
          onClick={() => setVerOscuros((v) => !v)}
          className={cn(
            "ml-auto text-[10px] font-mono uppercase px-2 py-1 border transition-all active:scale-95 flex items-center gap-1.5",
            verOscuros ? "border-red-hud text-red-hud bg-red-hud/10" : "border-border text-muted-foreground"
          )}
        >
          <EyeOff className="w-3 h-3" /> sin señal: {verOscuros ? "visibles" : "ocultos"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-[1fr_320px] gap-3">
        {/* MAPA */}
        <div className="hud-panel p-2 relative overflow-hidden">
          <WorldMapSVG pings={pings} routes={rutas} showFronts={false} noTerminador />
          <div className="absolute top-2 left-2 hud-panel px-2 py-1 text-[8px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
            <span className="beacon w-1.5 h-1.5 rounded-full bg-emerald-hud" /> ads-b militar · ciclo de patrulla en vivo
          </div>
          <AnimatePresence>
            {seleccionado && (
              <motion.div
                key={seleccionado.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-2 left-2 right-2 hud-panel p-2.5 border-violet-hud/40 grid grid-cols-2 sm:grid-cols-4 gap-2"
              >
                <div>
                  <p className="text-[8px] font-mono uppercase text-muted-foreground">llamada</p>
                  <p className="text-xs font-bold font-mono" style={{ color: tipoDe(seleccionado.tipo).color }}>
                    {seleccionado.callsign} {seleccionado.oscuro && <span className="text-red-hud">· SIN SEÑAL</span>}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{seleccionado.modelo}</p>
                </div>
                <div>
                  <p className="text-[8px] font-mono uppercase text-muted-foreground flex items-center gap-1"><ArrowUpRight className="w-2.5 h-2.5" /> rumbo</p>
                  <p className="text-xs font-mono">{fmtRumbo(seleccionado.rumbo)}</p>
                  <p className="text-[9px] text-muted-foreground">facción: {seleccionado.faccion}</p>
                </div>
                <div>
                  <p className="text-[8px] font-mono uppercase text-muted-foreground flex items-center gap-1"><ArrowUpRight className="w-2.5 h-2.5" /> altitud</p>
                  <p className="text-xs font-mono">{fmtAlt(seleccionado.alt)}</p>
                  <p className="text-[9px] text-muted-foreground">zona: {seleccionado.zona}</p>
                </div>
                <div>
                  <p className="text-[8px] font-mono uppercase text-muted-foreground flex items-center gap-1"><Gauge className="w-2.5 h-2.5" /> velocidad</p>
                  <p className="text-xs font-mono">{seleccionado.vel} kt</p>
                  <p className="text-[9px] text-muted-foreground">base: {seleccionado.base}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* LISTA */}
        <div className="hud-panel p-0 flex flex-col max-h-[560px] overflow-hidden">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground px-3 py-2 border-b border-border/60 sticky top-0 bg-background/95 flex items-center gap-1.5">
            <Crosshair className="w-3 h-3" /> vuelos rastreados
          </p>
          <div className="overflow-y-auto thin-scroll flex-1">
            <AnimatePresence initial={false}>
              {visibles.slice(0, 40).map((v: Vuelo, idx) => {
                const t = tipoDe(v.tipo);
                return (
                  <motion.button
                    key={v.id}
                    layout
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: Math.min(idx * 0.025, 0.4) }}
                    onClick={() => setSel(v.id === sel ? null : v.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 border-b border-border/40 hover:bg-violet-hud/10 transition-colors",
                      sel === v.id && "bg-violet-hud/15"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold" style={{ color: v.oscuro ? "#FF4D4D" : t.color }}>
                        {v.callsign}
                      </span>
                      <span className="text-[8px] font-mono uppercase px-1 border" style={{ color: t.color, borderColor: `${t.color}55` }}>
                        {t.nombre.split(" ")[0]}
                      </span>
                      {v.oscuro && <span className="text-[8px] font-mono uppercase text-red-hud v90-parpadeo">sin señal</span>}
                      <span className="ml-auto text-[9px] font-mono text-muted-foreground">{v.vel} kt</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[9px] font-mono text-muted-foreground">
                      <span>{v.modelo}</span>
                      <span>·</span>
                      <span>{fmtAlt(v.alt)}</span>
                      <span>·</span>
                      <span className="truncate">{v.zona}</span>
                    </div>
                    {/* barra de ciclo de patrulla */}
                    <div className="h-0.5 bg-border/50 mt-1.5 overflow-hidden">
                      <div className="h-full v90-ciclo" style={{ width: `${v.progreso * 100}%`, background: t.color }} />
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
