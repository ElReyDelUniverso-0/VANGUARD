"use client";

// v90.0 ESPEJOS SIN FIN — SISMO (espejo del gran monitor sísmico global:
// mapa con anillos por magnitud, feed con profundidad/estación, sismógrafo
// dibujando en vivo y detección educativa de detonaciones sospechosas).

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Waves, TriangleAlert, SlidersHorizontal } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { WorldMapSVG } from "@/components/vanguard/world-map-svg";
import { generarSismos, magColor, claseMag, trazoSismograma, type Temblor } from "@/lib/sismo-data";
import type { ConflictRegion } from "@/lib/game-data";
import { cn } from "@/lib/utils";

function Sismografo() {
  const [minuto, setMinuto] = useState(() => Math.floor(Date.now() / 60_000));
  const ref = useRef<SVGPolylineElement>(null);
  const w = 560;
  const h = 90;

  useEffect(() => {
    const t = setInterval(() => setMinuto(Math.floor(Date.now() / 60_000)), 5000);
    return () => clearInterval(t);
  }, []);

  const pts = useMemo(() => {
    const raw = trazoSismograma(minuto);
    const step = w / (raw.length - 1);
    return raw.map((v, i) => `${(i * step).toFixed(1)},${(h / 2 + v).toFixed(1)}`).join(" ");
  }, [minuto]);

  return (
    <div className="hud-panel p-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-emerald-hud" /> sismógrafo · estación VGA-ATLANTICO
        </p>
        <span className="text-[8px] font-mono text-muted-foreground">
          {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} · 160 s de trazo
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[90px] v90-papel">
        <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <polyline ref={ref} points={pts} fill="none" stroke="#4DFFC4" strokeWidth="1.2" className="v90-sismo" style={{ filter: "drop-shadow(0 0 3px #4DFFC488)" }} />
      </svg>
    </div>
  );
}

export function SismoPanel() {
  const [ahora, setAhora] = useState(() => Date.now());
  const [ventana, setVentana] = useState(24 * 3600_000);
  const [minMag, setMinMag] = useState(2.5);
  const [sel, setSel] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  const estado = useMemo(() => generarSismos(ventana, ahora), [ventana, ahora]);
  const visibles = useMemo(() => estado.temblores.filter((q) => q.mag >= minMag), [estado, minMag]);
  const seleccionado = visibles.find((q) => q.id === sel) ?? null;

  // al mapa: cada temblor es un conflicto con color por magnitud
  const conflictos: ConflictRegion[] = useMemo(
    () =>
      visibles.slice(0, 90).map((q) => ({
        id: q.id,
        name: `${claseMag(q.mag)} — M${q.mag.toFixed(1)} — ${q.zona}`,
        country: q.zona,
        flag: "◍",
        level: q.mag >= 6 ? "CRITICO" : q.mag >= 4.5 ? "TENSION" : "INESTABILIDAD",
        intensity: Math.min(100, Math.round(q.mag * 11)),
        summary: `profundidad ${q.profundidad} km · estación ${q.estacion}`,
        lat: q.lat,
        lng: q.lng,
        factions: [],
        since: "",
        casualties: "",
        civilianImpact: q.mag >= 5.5 ? "Daños estructurales probables en el epicentro" : "Sin impacto reportado",
        humanitarian: "Evaluación estándar del juego",
        tags: [claseMag(q.mag), `${q.profundidad} km`],
      })),
    [visibles]
  );

  const customColors = useMemo(() => {
    const m: Record<string, string> = {};
    for (const q of visibles.slice(0, 90)) m[q.id] = magColor(q.mag);
    return m;
  }, [visibles]);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="SISMO — red sismológica global"
        subtitle="La tierra habla primero: vigilancia educativa de temblores y detonaciones"
        icon={<Waves className="w-4 h-4 text-amber-hud" />}
        color="amber"
        right={
          <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-1 border border-amber-hud/60 text-amber-hud bg-amber-hud/10">
            <Activity className="w-3 h-3" /> {estado.hoy.toLocaleString("es-ES")} EVENTOS HOY
          </span>
        }
      />
      <HeroOro panel="sismo" />

      {/* banner de detonación sospechosa */}
      <AnimatePresence>
        {estado.sospechosas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="hud-panel px-4 py-2.5 flex items-center gap-3 border-red-hud/60"
          >
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-red bg-red-hud/25 border border-red-hud px-2 py-0.5 v90-lateja2">
              <TriangleAlert className="w-3 h-3" /> detonación sospechosa
            </span>
            <span className="text-xs text-foreground/90 truncate">
              {estado.sospechosas.length} señal(es) somera(s) en sitios de prueba documentados — perfil sísmico de explosión, no de falla
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { k: "eventos en ventana", v: estado.temblores.length.toLocaleString("es-ES"), c: "#FFC94D" },
          { k: "mayor magnitud", v: estado.mayor ? `M ${estado.mayor.mag.toFixed(1)}` : "—", c: "#FF4D4D" },
          { k: "energía liberada", v: `${estado.energias}% media anual`, c: "#FF8A3D" },
          { k: "señales en sitios de prueba", v: String(estado.sospechosas.length), c: "#B48CFF" },
        ].map((s) => (
          <div key={s.k} className="hud-panel p-2.5 text-center">
            <p className="text-lg font-bold font-mono" style={{ color: s.c }}>{s.v}</p>
            <p className="text-[8px] font-mono uppercase text-muted-foreground">{s.k}</p>
          </div>
        ))}
      </div>

      {/* controles */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3" /> magnitud mínima
        </span>
        {[2.5, 4, 5, 6].map((m) => (
          <button
            key={m}
            onClick={() => setMinMag(m)}
            className={cn(
              "text-[10px] font-mono px-2 py-1 border transition-all active:scale-95",
              minMag === m ? "border-amber-hud text-amber-hud bg-amber-hud/15" : "border-border text-muted-foreground hover:border-amber-hud/50"
            )}
          >
            M {m}+
          </button>
        ))}
        <span className="ml-auto flex gap-1.5">
          {[{ id: 6 * 3600_000, l: "6 H" }, { id: 24 * 3600_000, l: "24 H" }, { id: 72 * 3600_000, l: "3 D" }].map((r) => (
            <button
              key={r.l}
              onClick={() => setVentana(r.id)}
              className={cn(
                "text-[10px] font-mono px-2 py-1 border transition-all active:scale-95",
                ventana === r.id ? "border-amber-hud text-amber-hud bg-amber-hud/15" : "border-border text-muted-foreground"
              )}
            >
              {r.l}
            </button>
          ))}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-3">
        {/* MAPA */}
        <div className="space-y-3">
          <div className="hud-panel p-2 relative overflow-hidden">
            <WorldMapSVG conflicts={conflictos} selected={sel} onSelectConflict={(id) => setSel(id === sel ? null : id)} customColors={customColors} showFronts={false} noTerminador />
            {seleccionado && (
              <motion.div
                key={seleccionado.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-2 left-2 right-2 hud-panel p-2.5"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono font-bold" style={{ color: magColor(seleccionado.mag) }}>
                    M {seleccionado.mag.toFixed(1)} · {claseMag(seleccionado.mag)}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground">{seleccionado.zona}</span>
                  {seleccionado.sospechoso && <span className="text-[8px] font-mono uppercase text-red-hud v90-lateja2">perfil de detonación</span>}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  profundidad {seleccionado.profundidad} km · estación {seleccionado.estacion} · registro Vanguard (ficticio, educativo)
                </p>
              </motion.div>
            )}
          </div>
          <Sismografo />
        </div>

        {/* FEED */}
        <div className="hud-panel p-0 flex flex-col max-h-[560px] overflow-hidden">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground px-3 py-2 border-b border-border/60 sticky top-0 bg-background/95">
            feed sísmico · más recientes primero
          </p>
          <div className="overflow-y-auto thin-scroll flex-1">
            {visibles.slice(0, 60).map((q: Temblor, idx) => (
              <motion.button
                key={q.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                onClick={() => setSel(q.id === sel ? null : q.id)}
                className={cn("w-full text-left px-3 py-2 border-b border-border/40 hover:bg-amber-hud/10 transition-colors", sel === q.id && "bg-amber-hud/15")}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-mono font-bold px-1.5 py-0.5 border"
                    style={{ color: magColor(q.mag), borderColor: `${magColor(q.mag)}55` }}
                  >
                    {q.mag.toFixed(1)}
                  </span>
                  <span className="text-[10px] font-mono text-foreground/90 truncate flex-1">{q.zona}</span>
                  {q.sospechoso && <TriangleAlert className="w-3 h-3 text-red-hud shrink-0" />}
                </div>
                <p className="text-[9px] font-mono text-muted-foreground mt-0.5">
                  {q.profundidad} km · {q.estacion} · {new Date(q.ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
