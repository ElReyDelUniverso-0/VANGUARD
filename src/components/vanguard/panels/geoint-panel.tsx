"use client";

// v92.0 OJO DEL MUNDO — OJO-GEOINT (espejo del dashboard de inteligencia
// geoespacial asistida por IA): capas conmutables sobre un tablero oscuro,
// detecciones del núcleo neuronal con huella de píxeles, agenda de pases
// satelitales y cola de tareas de verificación.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ScanEye, Layers, Satellite, ClipboardList, Crosshair } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { generarGeoint, type Deteccion } from "@/lib/geoint-data";
import { cn } from "@/lib/utils";

function Huella({ det }: { det: Deteccion }) {
  const celdas = det.pixeles.split(";").filter(Boolean).map((s) => s.split(","));
  return (
    <svg viewBox="0 0 8 8" className="w-full h-20 bg-[#05070c]" preserveAspectRatio="none">
      {celdas.map(([x, y, v], i) => (
        <rect key={i} x={Number(x)} y={Number(y)} width="1" height="1" fill="#FFC94D" fillOpacity={Number(v) / 255} />
      ))}
      {/* cruz de geolocalización */}
      <line x1="4" y1="2.2" x2="4" y2="5.8" stroke="#FF4D4D" strokeWidth="0.15" />
      <line x1="2.2" y1="4" x2="5.8" y2="4" stroke="#FF4D4D" strokeWidth="0.15" />
      <circle cx="4" cy="4" r="1.3" fill="none" stroke="#FF4D4D" strokeWidth="0.15" />
    </svg>
  );
}

export function GeointPanel() {
  const [base, setBase] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setBase(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const g = useMemo(() => generarGeoint(base), [base]);
  const [capasOn, setCapasOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(g.capas.map((c) => [c.id, c.activa]))
  );
  const [sel, setSel] = useState<Deteccion | null>(null);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="OJO-GEOINT"
        subtitle="Inteligencia geoespacial asistida por el núcleo neuronal: capas, detecciones y pases"
        icon={<ScanEye className="w-4 h-4 text-cyan" />}
        color="cyan"
        right={
          <span className="text-[9px] font-mono uppercase px-2 py-1 border border-cyan-hud/60 text-cyan bg-cyan-hud/10">
            {g.stats.imagenesHoy.toLocaleString("es")} img hoy
          </span>
        }
      />
      <HeroOro panel="geoint" />

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(
          [
            ["Imágenes procesadas", g.stats.imagenesHoy.toLocaleString("es"), "#FFC94D"],
            ["km² cubiertos", g.stats.km2Cubiertos.toLocaleString("es"), "#4DD8FF"],
            ["Detecciones IA", g.stats.deteccionesIA, "#FF6B4D"],
            ["Verificadas por humano", g.stats.verificacionHumana, "#9AE04D"],
          ] as const
        ).map(([k, v, c], i) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="hud-panel px-3 py-2.5"
          >
            <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">{k}</p>
            <p className="text-lg font-black leading-tight" style={{ color: c }}>{v}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-3">
        {/* CAPAS + PASES + COLA */}
        <div className="space-y-3">
          <div className="hud-panel border-cyan-hud/40 overflow-hidden">
            <div className="px-3 py-2 border-b border-border/60 bg-cyan-hud/5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Capas activas</h4>
            </div>
            <div className="divide-y divide-border/40">
              {g.capas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCapasOn((s) => ({ ...s, [c.id]: !s[c.id] }))}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-cyan-hud/5 transition-colors", !capasOn[c.id] && "opacity-45")}
                >
                  <span className={cn("w-3 h-3 border-2 shrink-0", capasOn[c.id] && "bg-current")} style={{ color: c.color, borderColor: c.color }} />
                  <span className="text-[11px] font-semibold text-foreground flex-1">{c.nombre}</span>
                  <span className="text-[9px] font-mono text-muted-foreground">{c.cobertura}%</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hud-panel border-cyan-hud/40 overflow-hidden">
            <div className="px-3 py-2 border-b border-border/60 bg-cyan-hud/5 flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5 text-cyan" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Próximos pases</h4>
            </div>
            <div className="divide-y divide-border/40">
              {g.pases.map((p, i) => (
                <motion.div key={p.satelite + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="px-3 py-2">
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] font-bold text-foreground">{p.satelite}</p>
                    <motion.span
                      className="text-[10px] font-mono text-cyan"
                      animate={{ opacity: p.enMin < 10 ? [1, 0.35, 1] : 1 }}
                      transition={{ duration: 1.6, repeat: p.enMin < 10 ? Infinity : 0 }}
                    >
                      T−{p.enMin}′
                    </motion.span>
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground">
                    {p.tipo} · {p.resolucion} · {p.zona}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="hud-panel border-border/60 overflow-hidden">
            <div className="px-3 py-2 border-b border-border/60 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">Cola de verificación</h4>
            </div>
            <div className="divide-y divide-border/40">
              {g.cola.map((t) => (
                <div key={t.id} className="px-3 py-2">
                  <div className="flex justify-between gap-2">
                    <p className="text-[10.5px] text-foreground/85 leading-snug">{t.peticion}</p>
                    <span
                      className={cn(
                        "text-[8px] font-mono px-1 py-0.5 border shrink-0 h-fit",
                        t.estado === "LISTO" ? "border-emerald/50 text-emerald" : t.estado === "PROCESANDO" ? "border-amber/50 text-amber" : "border-border text-muted-foreground"
                      )}
                    >
                      {t.estado}
                    </span>
                  </div>
                  {t.estado === "PROCESANDO" && (
                    <div className="h-0.5 bg-foreground/10 mt-1.5">
                      <motion.div className="h-full bg-cyan" initial={{ width: 0 }} animate={{ width: `${t.progreso}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABLERO DE DETECCIONES */}
        <div className="hud-panel border-cyan-hud/40 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60 bg-cyan-hud/5 flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-cyan" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Detecciones del núcleo neuronal</h4>
            <span className="text-[9px] font-mono text-muted-foreground ml-auto">pulsa una ficha para geolocalizar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_260px]">
            <div className="relative border-r border-border/40">
              {/* tablero oscuro con pines */}
              <svg viewBox="0 0 100 100" className="w-full block" style={{ aspectRatio: "1/0.8" }}>
                <defs>
                  <radialGradient id="geo-velo" cx="50%" cy="45%" r="80%">
                    <stop offset="0%" stopColor="#101820" />
                    <stop offset="100%" stopColor="#05070c" />
                  </radialGradient>
                </defs>
                <rect width="100" height="100" fill="url(#geo-velo)" />
                {[12, 28, 44, 60, 76, 92].map((v) => (
                  <g key={v} stroke="#4DD8FF" strokeOpacity="0.08" strokeWidth="0.25">
                    <line x1={v} y1="0" x2={v} y2="100" />
                    <line x1="0" y1={v} x2="100" y2={v} />
                  </g>
                ))}
                {/* barrido */}
                <motion.line
                  x1="0" y1="0" x2="0" y2="100"
                  stroke="#4DD8FF" strokeOpacity="0.35" strokeWidth="0.4"
                  animate={{ x1: [0, 100], x2: [0, 100] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                {g.detecciones.map((d, i) => {
                  const c = capasOn[d.neurona === "ciber" ? "sar" : "optica"] === false;
                  return (
                    <g key={d.id} onClick={() => setSel(d)} className="cursor-pointer" opacity={c ? 0.25 : 1}>
                      <motion.circle
                        cx={d.coords.x} cy={d.coords.y} r="3.4"
                        fill={d.revisadoPor === "NÚCLEO IA" ? "#FFC94D" : "#4DD8FF"}
                        fillOpacity="0.15"
                        animate={{ r: [2.8, 4.6, 2.8] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.3 }}
                      />
                      <circle
                        cx={d.coords.x} cy={d.coords.y} r="1.5"
                        fill={d.confianza >= 70 ? "#FF4D4D" : d.confianza >= 45 ? "#FFC94D" : "#9AE04D"}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* ficha de detección seleccionada / lista */}
            <div className="p-2.5 space-y-2 max-h-96 overflow-y-auto">
              {sel ? (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="border border-cyan-hud/50">
                  <Huella det={sel} />
                  <div className="p-2.5 space-y-1.5">
                    <p className="text-[12px] font-bold text-foreground">{sel.tipo}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{sel.zona} · hace {sel.haceMin} min</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-foreground/10">
                        <div className="h-full bg-cyan" style={{ width: `${sel.confianza}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-cyan">{sel.confianza}%</span>
                    </div>
                    <span className={cn("inline-block text-[8px] font-mono px-1 py-0.5 border", sel.revisadoPor === "NÚCLEO IA" ? "border-amber/50 text-amber" : "border-emerald/50 text-emerald")}>
                      {sel.revisadoPor}
                    </span>
                    <button onClick={() => setSel(null)} className="block w-full text-[9px] font-mono uppercase border border-border text-muted-foreground hover:text-foreground py-1 mt-1">
                      volver a la lista
                    </button>
                  </div>
                </motion.div>
              ) : (
                g.detecciones.map((d, i) => (
                  <motion.button
                    key={d.id}
                    onClick={() => setSel(d)}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="w-full text-left border border-border/50 px-2.5 py-2 hover:border-cyan-hud/60 hover:bg-cyan-hud/5 transition-colors"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-[11px] font-semibold text-foreground truncate">{d.tipo}</p>
                      <span className="text-[10px] font-mono" style={{ color: d.confianza >= 70 ? "#9AE04D" : d.confianza >= 45 ? "#FFC94D" : "#FF6B4D" }}>
                        {d.confianza}%
                      </span>
                    </div>
                    <p className="text-[9px] font-mono text-muted-foreground">{d.zona} · hace {d.haceMin}′ · neurona: {d.neurona}</p>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
