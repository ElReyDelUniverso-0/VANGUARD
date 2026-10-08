"use client";

// v89.0 OPERACIÓN ESPEJO — EVALUACIÓN DE CAMPAÑA (espejo del instituto de
// estudios de guerra más citado del planeta: masthead serio, HALLAZGOS CLAVE
// numerados, secciones por teatro y evaluación del terreno, archivo por fecha).

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { NotebookPen, CalendarDays, Landmark, Quote } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { generarEvaluacion, ultimasFechas, fechaLarga } from "@/lib/evaluacion-data";
import { cn } from "@/lib/utils";

export function EvaluacionPanel() {
  const fechas = useMemo(() => ultimasFechas(14), []);
  const [fecha, setFecha] = useState(() => fechas[0]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const ev = useMemo(() => generarEvaluacion(fecha), [fecha]);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Evaluación de Campaña diaria"
        subtitle="La guerra evaluada con método: hechos primero, incertidumbre declarada"
        icon={<NotebookPen className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <span className="text-[9px] font-mono uppercase px-2 py-1 border border-amber-hud/60 text-amber bg-amber-hud/10">
            N.º {ev.numero}
          </span>
        }
      />
      <HeroOro panel="evaluacion" />

      {/* MASTHEAD tipo instituto */}
      <div className="hud-panel border-amber-hud/40 overflow-hidden">
        <div className="border-b-2 border-amber-hud/70 px-4 py-3 text-center bg-amber-hud/5">
          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground">VANGUARD · ESTUDIOS DE GUERRA</p>
          <h3 className="text-lg sm:text-xl font-bold tracking-wide uppercase text-foreground mt-0.5">
            Evaluación de la campaña
          </h3>
          <p className="text-[10px] font-mono uppercase text-muted-foreground mt-0.5">
            {fechaLarga(fecha)} · informe diario de operaciones con fuentes abiertas
          </p>
        </div>

        {/* HALLAZGOS CLAVE */}
        <div className="px-4 sm:px-6 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber mb-3">Hallazgos clave del día</p>
          <ol className="space-y-3">
            {ev.hallazgos.map((h, i) => (
              <motion.li
                key={fecha + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12 }}
                className="flex gap-3"
              >
                <span className="font-mono font-bold text-amber text-sm shrink-0 w-6">{i + 1}.</span>
                <p className="text-[13px] leading-relaxed text-foreground/90">
                  <strong className="text-foreground">{h.titulo} </strong>
                  {h.cuerpo}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-3">
        {/* TEATROS */}
        <div className="space-y-3">
          {ev.teatros.map((t, ti) => (
            <motion.div
              key={fecha + t.nombre}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + ti * 0.08 }}
              className="hud-panel p-4"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Landmark className="w-3.5 h-3.5 text-cyan-hud" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-hud">{t.nombre}</h4>
              </div>
              <ul className="space-y-2">
                {t.lineas.map((l, li) => (
                  <li key={li} className="text-[12px] leading-relaxed text-foreground/85 flex gap-2">
                    <span className="text-muted-foreground shrink-0">—</span>
                    {l}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] italic text-muted-foreground mt-2.5 border-l-2 border-amber-hud/50 pl-2.5">
                Evaluación del terreno controlado: {t.terreno}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ARCHIVO + MÉTODO */}
        <div className="space-y-3">
          <div className="hud-panel p-3">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-2">
              <CalendarDays className="w-3 h-3" /> archivo · 14 días
            </p>
            <div className="space-y-1">
              {fechas.map((f) => (
                <button
                  key={f}
                  onClick={() => setFecha(f)}
                  className={cn(
                    "w-full text-left text-[10px] font-mono px-2 py-1.5 border transition-all active:scale-[0.98]",
                    f === fecha
                      ? "border-amber-hud text-amber bg-amber-hud/15"
                      : "border-border/60 text-muted-foreground hover:border-amber-hud/40 hover:text-foreground"
                  )}
                >
                  {f.slice(8, 10)}/{f.slice(5, 7)}/{f.slice(0, 4)}
                </button>
              ))}
            </div>
          </div>
          <div className="hud-panel p-3.5">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-2">
              <Quote className="w-3 h-3" /> sobre este informe
            </p>
            <p className="text-[11px] leading-relaxed text-foreground/75">{ev.notaMetodo}</p>
            <p className="text-[9px] font-mono text-muted-foreground mt-2.5" data-tick={tick}>
              evaluación determinista · el mismo día produce el mismo informe en cualquier dispositivo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
