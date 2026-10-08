"use client";

// v89.0 OPERACIÓN ESPEJO — SIMULADOR DE DETONACIÓN (espejo educativo del
// simulador de explosiones nucleares más usado del mundo). Física simplificada
// de escala cúbica, anillos que se despliegan sobre el mapa real del planeta,
// estimación de bajas y UNA SOLA lección: estas armas no se usan porque no
// hay victoria dentro de sus círculos. Objetivo didáctico, no lúdico.

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radiation, Crosshair, Wind, Flame, Biohazard, TriangleAlert } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { WorldMapSVG, projectLatLng } from "@/components/vanguard/world-map-svg";
import { CABEZAS, CIUDADES, anillos as calcAnillos, bajas as calcBajas, formateaKm, formateaNum, type CiudadObjetivo } from "@/lib/detonacion-data";
import { cn } from "@/lib/utils";

export function SimuladorPanel() {
  const [cabezaId, setCabezaId] = useState(CABEZAS[1].id);
  const [airburst, setAirburst] = useState(true);
  const [objetivo, setObjetivo] = useState<CiudadObjetivo | null>(CIUDADES[0]);
  const [modoClick, setModoClick] = useState(false);
  const [detonada, setDetonada] = useState(false);

  const cabeza = CABEZAS.find((c) => c.id === cabezaId) ?? CABEZAS[1];
  const a = useMemo(() => calcAnillos(cabeza.kt, airburst), [cabeza, airburst]);
  const est = useMemo(() => (objetivo ? calcBajas(cabeza.kt, objetivo, a) : null), [objetivo, cabeza, a]);

  // proyección del punto y px/km a esa latitud (escala mercator local)
  const proyeccion = useMemo(() => {
    if (!objetivo) return null;
    const c = projectLatLng(objetivo.lat, objetivo.lng);
    const ref = projectLatLng(objetivo.lat + 0.5, objetivo.lng);
    const pxPorKm = Math.abs(c.y - ref.y) / 55.5; // 0.5° lat ≈ 55.5 km
    return { ...c, pxPorKm };
  }, [objetivo]);

  const detonar = () => {
    setDetonada(false);
    setTimeout(() => setDetonada(true), 30);
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Simulador de Detonación"
        subtitle="Educativo: el costo real de un arma que no debería existir"
        icon={<Radiation className="w-4 h-4 text-red-hud" />}
        color="red"
        right={
          <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-1 border border-amber-hud/60 text-amber bg-amber-hud/10">
            <TriangleAlert className="w-3 h-3" /> FICTICIO · FÍSICA SIMPLIFICADA
          </span>
        }
      />
      <HeroOro panel="simulador" />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-3">
        {/* PANEL DE CONTROL */}
        <div className="space-y-3">
          <div className="hud-panel p-3">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2">1 · selección del arma</p>
            <div className="space-y-1">
              {CABEZAS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setCabezaId(c.id); setDetonada(false); }}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 border transition-all active:scale-[0.98]",
                    c.id === cabezaId ? "border-red-hud bg-red-hud/15" : "border-border/60 hover:border-red-hud/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[11px] font-mono uppercase font-bold", c.id === cabezaId ? "text-red-hud" : "text-foreground/85")}>
                      {c.nombre}
                    </span>
                    <span className="text-[10px] font-mono text-amber">{c.kt >= 1000 ? `${(c.kt / 1000).toFixed(0)} Mt` : `${c.kt} kt`}</span>
                  </div>
                  {c.id === cabezaId && <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug">{c.descripcion}</p>}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 mt-2">
              <button
                onClick={() => { setAirburst(true); setDetonada(false); }}
                className={cn("flex-1 text-[10px] font-mono uppercase py-1.5 border transition-all", airburst ? "border-amber-hud text-amber bg-amber-hud/15" : "border-border text-muted-foreground")}
              >
                explosión aérea
              </button>
              <button
                onClick={() => { setAirburst(false); setDetonada(false); }}
                className={cn("flex-1 text-[10px] font-mono uppercase py-1.5 border transition-all", !airburst ? "border-amber-hud text-amber bg-amber-hud/15" : "border-border text-muted-foreground")}
              >
                superficie
              </button>
            </div>
          </div>

          <div className="hud-panel p-3">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2">2 · objetivo</p>
            <div className="grid grid-cols-2 gap-1">
              {CIUDADES.map((ci) => (
                <button
                  key={ci.nombre}
                  onClick={() => { setObjetivo(ci); setDetonada(false); }}
                  className={cn(
                    "text-[10px] font-mono uppercase px-1.5 py-1 border transition-all truncate active:scale-95",
                    objetivo?.nombre === ci.nombre ? "border-cyan-hud text-cyan-hud bg-cyan-hud/10" : "border-border/60 text-muted-foreground hover:border-cyan-hud/40"
                  )}
                >
                  {ci.nombre}
                </button>
              ))}
            </div>
            <button
              onClick={() => setModoClick((v) => !v)}
              className={cn(
                "w-full mt-2 flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase py-1.5 border transition-all",
                modoClick ? "border-cyan-hud text-cyan-hud bg-cyan-hud/15 v89-pulsa" : "border-border text-muted-foreground hover:border-cyan-hud/40"
              )}
            >
              <Crosshair className="w-3 h-3" /> {modoClick ? "toca el mapa…" : "elegir punto del mapa"}
            </button>
          </div>

          <button
            onClick={detonar}
            disabled={!objetivo}
            className="w-full py-4 border-2 border-red-hud bg-red-hud/20 text-red-hud font-mono font-bold uppercase tracking-[0.3em] text-sm hover:bg-red-hud/30 active:scale-[0.98] transition-all v89-pulsa disabled:opacity-40"
          >
            ☢ detonar ☢
          </button>
        </div>

        {/* MAPA + ANILLOS */}
        <div className="space-y-3">
          <div className={cn("hud-panel p-2 relative overflow-hidden", detonada && "v89-tiembla-nuke")}>
            <WorldMapSVG
              conflicts={[]}
              showFronts={false}
              deployMode={modoClick}
              onMapClick={(lat, lng) => {
                if (!modoClick) return;
                setObjetivo({ nombre: "PUNTO MANUAL", pais: "—", lat, lng, popMillones: 0.4 + ((lat + 90) % 8) / 3, densidadKm2: 800 + Math.round(Math.abs(lng) % 9000) });
                setDetonada(false);
              }}
            />
            {/* anillos sobre el mapa */}
            {proyeccion && detonada && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 500" preserveAspectRatio="none" style={{ left: 0, top: 0 }}>
                <AnimatePresence>
                  {[
                    { r: a.psi1, color: "#FFD23D", dash: "4 6", delay: 0 },
                    { r: a.termica3, color: "#FF8A3D", dash: "0", delay: 0.12 },
                    { r: a.psi5, color: "#FF4D4D", dash: "0", delay: 0.24 },
                    { r: a.radiacion, color: "#4DFFC4", dash: "2 4", delay: 0.36 },
                    { r: a.bolaFuego, color: "#ffffff", dash: "0", delay: 0.48 },
                  ].map((ring, i) => {
                    const pr = ring.r * proyeccion.pxPorKm;
                    if (pr < 0.6) return null;
                    return (
                      <motion.circle
                        key={i}
                        cx={proyeccion.x}
                        cy={proyeccion.y}
                        r={pr}
                        initial={{ r: 0.1, opacity: 0 }}
                        animate={{ r: pr, opacity: 0.9 }}
                        transition={{ delay: ring.delay, duration: 0.85, ease: "easeOut" }}
                        fill={ring.color === "#ffffff" ? "#ffffff" : `${ring.color}14`}
                        stroke={ring.color}
                        strokeWidth={ring.dash === "0" ? 1.6 : 1}
                        strokeDasharray={ring.dash}
                      />
                    );
                  })}
                  <motion.circle
                    cx={proyeccion.x}
                    cy={proyeccion.y}
                    r="2.5"
                    fill="#fff"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.6] }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
              </svg>
            )}
            {/* destello */}
            {detonada && proyeccion && (
              <motion.div
                key="flash"
                initial={{ opacity: 0.85 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.1 }}
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at " + ((proyeccion.x / 1000) * 100) + "% " + ((proyeccion.y / 500) * 100) + "%, #fff 0%, #ffd 12%, transparent 34%)" }}
              />
            )}
          </div>

          {/* RESULTADOS */}
          {detonada && est && objetivo && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="hud-panel p-3 border-red-hud/50">
                <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-1"><Flame className="w-3 h-3 text-red-hud" /> bola de fuego</p>
                <p className="text-base font-bold font-mono text-foreground">{formateaKm(a.bolaFuego)}</p>
                <p className="text-[9px] text-muted-foreground">todo lo que está dentro, desaparece</p>
              </div>
              <div className="hud-panel p-3 border-red-hud/40">
                <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-1"><Wind className="w-3 h-3 text-amber" /> onda 5 psi</p>
                <p className="text-base font-bold font-mono text-foreground">{formateaKm(a.psi5)}</p>
                <p className="text-[9px] text-muted-foreground">edificios de hormigón colapsan</p>
              </div>
              <div className="hud-panel p-3 border-orange-500/40">
                <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-1"><Flame className="w-3 h-3 text-orange-400" /> quemaduras 3.er grado</p>
                <p className="text-base font-bold font-mono text-foreground">{formateaKm(a.termica3)}</p>
                <p className="text-[9px] text-muted-foreground">la piel arde a kilómetros del centro</p>
              </div>
              <div className="hud-panel p-3 border-emerald-500/40">
                <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-1"><Biohazard className="w-3 h-3 text-emerald-400" /> radiación 500 rem</p>
                <p className="text-base font-bold font-mono text-foreground">{formateaKm(a.radiacion)}</p>
                <p className="text-[9px] text-muted-foreground">dosis letal sin refugio</p>
              </div>
              <div className="hud-panel p-3 col-span-2 lg:col-span-4 border-2 border-red-hud/60 bg-red-hud/10">
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-red-hud">bajas estimadas en {objetivo.nombre}</p>
                    <p className="text-3xl font-bold font-mono text-red-hud">{formateaNum(est.muertos)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">heridos</p>
                    <p className="text-2xl font-bold font-mono text-amber">{formateaNum(est.heridos)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Wind className="w-3 h-3" /> nube de humo hasta</p>
                    <p className="text-2xl font-bold font-mono text-foreground">{est.alcanceHumo} km</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground flex-1 min-w-[220px] leading-snug">
                    Un solo proyectil. Una sola decisión. El simulador existe para que nadie tenga que verlo en vivo: el disuadido no es el que gana, es el que no dispara.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {!detonada && (
            <div className="hud-panel p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center">
                arma: {cabeza.nombre} ({cabeza.kt >= 1000 ? `${(cabeza.kt / 1000).toFixed(0)} Mt` : `${cabeza.kt} kt`}) · objetivo: {objetivo?.nombre ?? "ninguno"} · pulsa DETONAR para ver los anillos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
