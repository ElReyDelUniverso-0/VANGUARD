"use client";

// v89.0 OPERACIÓN ESPEJO — PULSOS (espejo del gran mapa de incidentes en vivo:
// columna de categorías a la izquierda, mapa con pines en el centro, feed
// cronológico a la derecha, rango temporal arriba y banner de ÚLTIMA HORA).

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Filter, Clock, MapPin, Zap } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { WorldMapSVG } from "@/components/vanguard/world-map-svg";
import { PULSO_CATS, generarPulsos, catDe, horaCorta, haceDe, type PulsoIncidente } from "@/lib/pulsos-data";
import { getTension } from "@/lib/tension";
import { cn } from "@/lib/utils";
import type { ConflictRegion } from "@/lib/game-data";

const RANGOS = [
  { id: 6 * 3600_000, label: "6 H" },
  { id: 24 * 3600_000, label: "24 H" },
  { id: 72 * 3600_000, label: "3 D" },
];

export function PulsosPanel() {
  const [ventana, setVentana] = useState(24 * 3600_000);
  const [catsOff, setCatsOff] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState<string | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());
  const tension = useMemo(() => getTension(), []);

  // pulso vivo: refresco cada 30 s
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const incidentes = useMemo(() => generarPulsos(ventana, ahora), [ventana, ahora]);
  const visibles = useMemo(() => incidentes.filter((i) => !catsOff.has(i.categoria)), [incidentes, catsOff]);

  const conflictos: ConflictRegion[] = useMemo(
    () =>
      visibles.slice(0, 90).map((i) => ({
        id: i.id,
        name: i.titulo,
        country: i.zona,
        flag: "📍",
        level: i.urgente ? "CRITICO" : "TENSION",
        intensity: Math.min(100, 40 + (i.ts % 50)),
        summary: `${catDe(i.categoria).nombre} — fuente: ${i.fuente} — ${horaCorta(i.ts)}`,
        lat: i.lat,
        lng: i.lng,
        factions: [],
        since: "",
        casualties: "",
        civilianImpact: i.urgente ? "Alta — población civil en el área del incidente" : "En evaluación",
        humanitarian: i.urgente ? "Ruta de evacuación comprometida" : "Sin impacto reportado",
        tags: [catDe(i.categoria).nombre, i.zona],
      })),
    [visibles]
  );

  const customColors = useMemo(() => {
    const m: Record<string, string> = {};
    for (const i of visibles.slice(0, 90)) m[i.id] = catDe(i.categoria).color;
    return m;
  }, [visibles]);

  const contar = (catId: string) => incidentes.filter((i) => i.categoria === catId).length;
  const ultimo = incidentes[0];
  const seleccionado = visibles.find((i) => i.id === sel) ?? null;

  const toggleCat = (id: string) => {
    setCatsOff((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Mapa de Pulsos en Vivo"
        subtitle="Cada incidente del planeta, por categoría, en tiempo real"
        icon={<Radio className="w-4 h-4 text-red-hud" />}
        color="red"
        right={
          <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-1 border border-red-hud/60 text-red-hud bg-red-hud/10">
            <span className="beacon w-1.5 h-1.5 rounded-full bg-red-hud" /> {visibles.length} INCIDENTES
          </span>
        }
      />
      <HeroOro panel="pulsos" />

      {/* ÚLTIMA HORA */}
      <AnimatePresence>
        {ultimo?.urgente && (
          <motion.div
            key={ultimo.id}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="hud-panel px-4 py-2.5 flex items-center gap-3 overflow-hidden border-red-hud/60"
          >
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-red bg-red-hud/25 border border-red-hud px-2 py-0.5 v89-lateja">
              <Zap className="w-3 h-3" /> ÚLTIMA HORA
            </span>
            <span className="text-xs text-foreground/90 truncate">
              {horaCorta(ultimo.ts)} — {ultimo.titulo}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* rango temporal */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" /> ventana
        </span>
        {RANGOS.map((r) => (
          <button
            key={r.label}
            onClick={() => setVentana(r.id)}
            className={cn(
              "text-[10px] font-mono uppercase px-2.5 py-1 border transition-all active:scale-95",
              ventana === r.id ? "border-red-hud text-red bg-red-hud/20" : "border-border text-muted-foreground hover:border-red-hud/50"
            )}
          >
            {r.label}
          </button>
        ))}
        <span className="ml-auto text-[9px] font-mono uppercase text-muted-foreground">tensión del planeta: {tension.toFixed(0)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] xl:grid-cols-[180px_1fr_320px] gap-3">
        {/* CATEGORÍAS */}
        <div className="hud-panel p-2.5 space-y-1">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-1.5">
            <Filter className="w-3 h-3" /> categorías
          </p>
          {PULSO_CATS.map((c) => {
            const off = catsOff.has(c.id);
            const n = contar(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCat(c.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 border text-left transition-all active:scale-[0.98]",
                  off ? "border-border opacity-40" : "border-transparent hover:border-border bg-background/40"
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0 v89-pin" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
                <span className="text-[10px] font-mono uppercase flex-1 truncate" style={{ color: off ? undefined : c.color }}>
                  {c.nombre}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">{n}</span>
              </button>
            );
          })}
          <button
            onClick={() => setCatsOff(new Set())}
            className="w-full text-[9px] font-mono uppercase text-muted-foreground hover:text-foreground pt-1 border-t border-border/60 mt-1"
          >
            activar todas
          </button>
        </div>

        {/* MAPA */}
        <div className="hud-panel p-2 relative overflow-hidden">
          <WorldMapSVG
            conflicts={conflictos}
            selected={sel}
            onSelectConflict={(id) => setSel(id === sel ? null : id)}
            customColors={customColors}
            showFronts={false}
          />
          {seleccionado && (
            <motion.div
              key={seleccionado.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-2 left-2 right-2 hud-panel p-2.5 border-red-hud/40"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 border" style={{ color: catDe(seleccionado.categoria).color, borderColor: catDe(seleccionado.categoria).color }}>
                  {catDe(seleccionado.categoria).nombre}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {seleccionado.zona} · {horaCorta(seleccionado.ts)} · {haceDe(seleccionado.ts, ahora)}
                </span>
              </div>
              <p className="text-xs text-foreground">{seleccionado.titulo}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">fuente: {seleccionado.fuente}</p>
            </motion.div>
          )}
        </div>

        {/* FEED */}
        <div className="hud-panel p-0 flex flex-col max-h-[560px] max-lg:max-h-[420px] overflow-hidden">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground px-3 py-2 border-b border-border/60 sticky top-0 bg-background/95">
            feed cronológico · {horaCorta(ahora)}
          </p>
          <div className="overflow-y-auto thin-scroll flex-1">
            {visibles.slice(0, 80).map((i, idx) => {
              const c = catDe(i.categoria);
              return (
                <motion.button
                  key={i.id}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.6) }}
                  onClick={() => setSel(i.id === sel ? null : i.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 border-b border-border/40 hover:bg-amber-hud/10 transition-colors",
                    sel === i.id && "bg-amber-hud/15"
                  )}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-mono font-bold" style={{ color: c.color }}>
                      {horaCorta(i.ts)}
                    </span>
                    <span className="text-[8px] font-mono uppercase px-1 border" style={{ color: c.color, borderColor: `${c.color}66` }}>
                      {c.nombre.split(" ")[0]}
                    </span>
                    {i.urgente && <span className="text-[8px] font-mono uppercase text-red-hud v89-lateja">ur</span>}
                  </div>
                  <p className="text-[11px] leading-snug text-foreground/90">{i.titulo}</p>
                  <p className="text-[9px] font-mono text-muted-foreground mt-0.5">
                    {i.zona} · {haceDe(i.ts, ahora)} · {i.fuente}
                  </p>
                </motion.button>
              );
            })}
            {visibles.length === 0 && (
              <p className="text-[10px] font-mono uppercase text-muted-foreground p-4 text-center">
                todas las categorías están apagadas — enciende al menos una
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
