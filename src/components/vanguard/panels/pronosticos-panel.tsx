"use client";

// v92.0 OJO DEL MUNDO — PRONÓSTICOS (espejo del monitor de inteligencia):
// notas con horizonte, escenarios probabilísticos, barras de confianza del
// núcleo neuronal y rating de riesgo por país con desglose en 4 ejes.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Telescope, CalendarDays, Gauge, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { generarPronosticos, riesgoPaises, clavesPaises, fechasPronosticos, fechaLarga } from "@/lib/pronosticos-data";
import { cn } from "@/lib/utils";

function colorRiesgo(n: number): string {
  return n >= 75 ? "#FF4D4D" : n >= 55 ? "#FF8A3D" : n >= 35 ? "#FFC94D" : "#9AE04D";
}

function colorConf(n: number): string {
  return n >= 70 ? "#9AE04D" : n >= 45 ? "#FFC94D" : "#FF6B4D";
}

export function PronosticosPanel() {
  const fechas = useMemo(() => fechasPronosticos(14), []);
  const [fecha, setFecha] = useState(fechas[0]);
  const notas = useMemo(() => generarPronosticos(fecha, 6), [fecha]);
  const paises = useMemo(() => riesgoPaises(fecha).sort((a, b) => b.riesgoTotal - a.riesgoTotal), [fecha]);
  const claves = useMemo(() => clavesPaises(), []);
  const [abierta, setAbierta] = useState<string | null>(notas[0]?.id ?? null);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Pronósticos de Inteligencia"
        subtitle="El futuro se estima, no se adivina: escenarios con probabilidades y confianza declarada"
        icon={<Telescope className="w-4 h-4 text-emerald" />}
        color="green"
        right={
          <span className="text-[9px] font-mono uppercase px-2 py-1 border border-emerald-hud/60 text-emerald bg-emerald-hud/10">
            MESA DE PRONÓSTICOS
          </span>
        }
      />
      <HeroOro panel="pronosticos" />

      {/* MASTHEAD */}
      <div className="hud-panel border-emerald-hud/40 overflow-hidden">
        <div className="border-b border-emerald-hud/50 px-4 py-3 bg-emerald-hud/5 flex flex-wrap items-center gap-2 justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground">VANGUARD · DESK DE PROSPECTIVA</p>
            <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide text-foreground">Notas de pronóstico</h3>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-0.5">
            {fechas.slice(0, 7).map((f) => (
              <button
                key={f}
                onClick={() => setFecha(f)}
                className={cn(
                  "shrink-0 text-[9px] font-mono px-2 py-1 border transition-colors",
                  f === fecha ? "border-emerald bg-emerald/20 text-emerald" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {f.slice(5)}
              </button>
            ))}
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1" />
          </div>
        </div>
        <p className="px-4 py-1.5 text-[10px] font-mono uppercase text-muted-foreground border-b border-border/60">
          {fechaLarga(fecha)} · horizontes 3–12 meses · {notas.length} notas + ratings
        </p>

        {/* NOTAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-3">
          {notas.map((n, i) => {
            const abierta_ = abierta === n.id;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="border border-border/70 bg-black/30 overflow-hidden"
              >
                <button
                  className="w-full text-left px-3 py-2.5 hover:bg-emerald-hud/5 transition-colors"
                  onClick={() => setAbierta(abierta_ ? null : n.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[9px] font-mono uppercase text-muted-foreground">
                        {n.id} · {n.region} · horizonte {n.horizonte}
                      </p>
                      <h4 className="text-[13px] font-bold leading-snug text-foreground mt-0.5">{n.titulo}</h4>
                    </div>
                    <div className="shrink-0 text-center">
                      <p className="text-[8px] font-mono uppercase text-muted-foreground">RIESGO</p>
                      <p className="text-lg font-black leading-none" style={{ color: colorRiesgo(n.riesgo) }}>{n.riesgo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-foreground/10 overflow-hidden">
                      <motion.div
                        className="h-full"
                        style={{ background: colorConf(n.confianza) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${n.confianza}%` }}
                        transition={{ delay: i * 0.07 + 0.2, duration: 0.8 }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground">confianza {n.confianza}%</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 border border-border text-muted-foreground">{n.sentimiento}</span>
                  </div>
                </button>

                {abierta_ && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-border/60 px-3 py-3 space-y-3 bg-emerald-hud/[0.04]"
                  >
                    <p className="text-[12px] leading-relaxed text-foreground/85">{n.resumen}</p>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-widest text-emerald mb-1.5">Indicadores observados</p>
                      <ul className="space-y-1">
                        {n.indicadores.map((ind, k) => (
                          <li key={k} className="text-[11px] text-foreground/75 font-mono flex gap-1.5">
                            <span className="text-emerald">▸</span>{ind}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-widest text-emerald mb-1.5">Escenarios</p>
                      <div className="space-y-2">
                        {n.escenarios.map((e) => (
                          <div key={e.nombre}>
                            <div className="flex justify-between text-[11px] mb-0.5">
                              <span className="text-foreground/85 font-semibold">{e.nombre}</span>
                              <span className="font-mono text-muted-foreground">{e.probabilidad}%</span>
                            </div>
                            <div className="h-1 bg-foreground/10">
                              <motion.div
                                className="h-full bg-emerald"
                                initial={{ width: 0 }}
                                animate={{ width: `${e.probabilidad}%` }}
                                transition={{ duration: 0.7 }}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{e.resumen}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[9px] font-mono uppercase text-muted-foreground">Firmado: {n.analista}</p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* RATINGS DE RIESGO POR PAÍS */}
      <div className="hud-panel border-emerald-hud/40 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border/60 bg-emerald-hud/5 flex items-center gap-2">
          <Gauge className="w-3.5 h-3.5 text-emerald" />
          <h4 className="text-[12px] font-bold uppercase tracking-wider text-foreground">Ratings de riesgo por país</h4>
          <span className="text-[9px] font-mono text-muted-foreground ml-auto">ejes: armado · político · económico · social</span>
        </div>
        <div className="divide-y divide-border/40">
          {paises.map((p, i) => {
            const Tend = p.tendencia === "AL ALZA" ? TrendingUp : p.tendencia === "A LA BAJA" ? TrendingDown : Minus;
            return (
              <motion.div
                key={p.pais}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 hover:bg-emerald-hud/5"
              >
                <span className="text-[9px] font-mono w-8 text-muted-foreground">{claves[p.pais] ?? "--"}</span>
                <span className="text-[12px] font-semibold text-foreground w-52 truncate">{p.pais}</span>
                <span className="text-base font-black w-10 text-center" style={{ color: colorRiesgo(p.riesgoTotal) }}>{p.riesgoTotal}</span>
                <div className="flex-1 min-w-44 grid grid-cols-4 gap-1.5">
                  {(
                    [
                      ["ARM", p.armado], ["POL", p.politico], ["ECO", p.economico], ["SOC", p.social],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-[8px] font-mono text-muted-foreground">
                        <span>{k}</span><span>{v}</span>
                      </div>
                      <div className="h-1 bg-foreground/10">
                        <motion.div
                          className="h-full"
                          style={{ background: colorRiesgo(v) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${v}%` }}
                          transition={{ duration: 0.6, delay: i * 0.03 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <span
                  className={cn(
                    "text-[9px] font-mono px-1.5 py-0.5 border flex items-center gap-1 shrink-0",
                    p.tendencia === "AL ALZA" ? "border-red/50 text-red" : p.tendencia === "A LA BAJA" ? "border-emerald/50 text-emerald" : "border-border text-muted-foreground"
                  )}
                >
                  <Tend className="w-3 h-3" />{p.tendencia}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
