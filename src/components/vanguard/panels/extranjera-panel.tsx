"use client";

// v92.0 OJO DEL MUNDO — ASUNTOS EXTERIORES (espejo de la gran revista de
// política exterior): número con lema, ensayos destacados con autor ficticio,
// debate a dos voces y cita para enmarcar. La revista del analista paciente.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Feather, Quote, BookOpen, Timer, Swords } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { numeroActual, numerosAtras, type Ensayo } from "@/lib/revista-data";
import { cn } from "@/lib/utils";

const TONO_COLOR: Record<Ensayo["tono"], string> = {
  DISUASIÓN: "#FF6B4D",
  "GRAN ESTRATEGIA": "#FFC94D",
  TECNOLOGÍA: "#4DD8FF",
  ECONOMÍA: "#9AE04D",
  HISTORIA: "#C89AFF",
};

export function ExtranjeraPanel() {
  const numero = useMemo(() => numeroActual(), []);
  const atras = useMemo(() => numerosAtras(3), []);
  const [abierto, setAbierto] = useState(0);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Asuntos Exteriores"
        subtitle="La revista del analista paciente: ensayos largos para una guerra corta de titulares"
        icon={<Feather className="w-4 h-4 text-amber" />}
        color="amber"
        right={<span className="text-[9px] font-mono uppercase px-2 py-1 border border-amber-hud/60 text-amber bg-amber-hud/10">N.º {numero.numero}</span>}
      />
      <HeroOro panel="extranjera" />

      {/* PORTADA DEL NÚMERO */}
      <div className="hud-panel border-amber-hud/40 overflow-hidden">
        <div className="relative px-5 py-6 text-center bg-gradient-to-b from-amber-hud/10 via-transparent to-transparent border-b-2 border-amber-hud/60">
          <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-muted-foreground">VANGUARD · COLECCIÓN DE POLÍTICA EXTERIOR</p>
          <h3 className="text-2xl sm:text-3xl font-black tracking-[0.08em] uppercase text-foreground mt-1">Asuntos Exteriores</h3>
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber mt-1">«{numero.lema}»</p>
          <p className="text-[9px] font-mono uppercase text-muted-foreground mt-1.5">{numero.volumen} · edición bimestral</p>
        </div>

        {/* EDITORIAL */}
        <p className="px-5 py-3.5 text-[12.5px] leading-relaxed text-foreground/80 italic border-b border-border/40 bg-black/20">
          {numero.editorial}
        </p>

        {/* CITA DESTACADA */}
        <div className="px-5 py-4 border-b border-border/40 bg-amber-hud/[0.04]">
          <Quote className="w-5 h-5 text-amber/70 mb-1.5" />
          <p className="text-[15px] sm:text-[17px] font-semibold leading-snug text-foreground">«{numero.citaDestacada.texto}»</p>
          <p className="text-[10px] font-mono uppercase text-muted-foreground mt-1.5">— {numero.citaDestacada.autor}</p>
        </div>

        {/* ÍNDICE DE ENSAYOS */}
        <div className="divide-y divide-border/40">
          {numero.ensayos.map((e, i) => {
            const estaAbierto = abierto === i;
            return (
              <div key={e.titulo}>
                <button
                  onClick={() => setAbierto(estaAbierto ? -1 : i)}
                  className="w-full text-left px-4 sm:px-5 py-3 hover:bg-amber-hud/5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="font-mono text-[9px] px-1.5 py-0.5 border shrink-0 mt-0.5"
                      style={{ color: TONO_COLOR[e.tono], borderColor: TONO_COLOR[e.tono] + "66" }}
                    >
                      {e.tono}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[14px] font-bold text-foreground leading-snug flex items-center gap-2">
                        {e.titulo}
                        {e.destacado && <span className="text-[8px] font-mono px-1 py-0.5 bg-amber text-black shrink-0">PORTADA</span>}
                      </h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        por <span className="text-foreground/85">{e.autor}</span> · {e.cargo}
                      </p>
                      {!estaAbierto && <p className="text-[12px] text-foreground/70 leading-relaxed mt-1 line-clamp-2">{e.resumen}</p>}
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                      <Timer className="w-3 h-3" />{e.lecturaMin}′
                    </div>
                  </div>
                </button>

                {estaAbierto && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                    <div className="px-4 sm:px-5 pb-4 pl-12 sm:pl-14 space-y-3">
                      <div className="border-l-2 pl-3" style={{ borderColor: TONO_COLOR[e.tono] }}>
                        <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Tesis del ensayo</p>
                        <p className="text-[13px] leading-relaxed text-foreground/90 font-medium">{e.tesis}</p>
                      </div>
                      <p className="text-[12px] leading-relaxed text-foreground/70">{e.resumen}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 border border-border text-muted-foreground">
                          índice de fricción del texto: {e.riesgo}/100
                        </span>
                        <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> lectura continua {e.lecturaMin} minutos
                        </span>
                      </div>
                      {/* cuerpo simulado: párrafos generados de la tesis */}
                      <div className="space-y-2.5 pt-1">
                        {[0, 1, 2].map((p) => (
                          <p key={p} className="text-[12px] leading-[1.8] text-foreground/65 border-b border-dotted border-border/30 pb-2.5 last:border-0">
                            {p === 0
                              ? `${e.tesis} Esta es la tesis que atraviesa las ${e.lecturaMin} páginas que siguen, escritas desde una mesa con más mapas que tazas.`
                              : p === 1
                              ? "El argumento avanza en tres tiempos: primero la foto del terreno tal como está —no como quisiéramos que estuviera—, después la mecánica oculta que mueve a los actores, y al final las dos o tres jugadas que el próximo trimestre vuelve a poner sobre la mesa."
                              : "Al lector no se le pide acuerdo: se le pide paciencia. Las conclusiones quedan deliberadamente abiertas, porque en este oficio la certeza cerrada es el primer síntoma de la derrota analítica."}
                          </p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* DEBATE A DOS VOCES */}
      <div className="hud-panel border-amber-hud/40 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border/60 bg-amber-hud/5 flex items-center gap-2">
          <Swords className="w-3.5 h-3.5 text-amber" />
          <h4 className="text-[12px] font-bold uppercase tracking-wider text-foreground">El debate del número</h4>
        </div>
        <div className="px-4 py-3 bg-black/20">
          <p className="text-[14px] font-bold text-foreground text-center mb-3">«{numero.debate.pregunta}»</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(
              [
                { autor: numero.debate.pro.autor, arg: numero.debate.pro.argumento, lado: "A FAVOR", color: "#9AE04D" },
                { autor: numero.debate.contra.autor, arg: numero.debate.contra.argumento, lado: "EN CONTRA", color: "#FF6B4D" },
              ] as const
            ).map((v, i) => (
              <motion.div
                key={v.lado}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="border p-3 bg-black/30"
                style={{ borderColor: v.color + "55" }}
              >
                <p className="text-[9px] font-mono tracking-widest mb-1.5" style={{ color: v.color }}>{v.lado}</p>
                <p className="text-[12px] leading-relaxed text-foreground/85">{v.arg}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-2">— {v.autor}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* NÚMEROS ATRÁS */}
      <div className="hud-panel border-border/60 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border/60">
          <h4 className="text-[12px] font-bold uppercase tracking-wider text-foreground/80">Hemeroteca</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
          {atras.map((n) => (
            <div key={n.numero} className={cn("px-4 py-3 hover:bg-amber-hud/5 transition-colors")}>
              <p className="text-[9px] font-mono uppercase text-muted-foreground">N.º {n.numero} · {n.volumen}</p>
              <p className="text-[12px] font-bold text-foreground/85 leading-snug mt-1">«{n.lema}»</p>
              <ul className="mt-1.5 space-y-0.5">
                {n.ensayos.slice(0, 2).map((e) => (
                  <li key={e.titulo} className="text-[10px] text-muted-foreground truncate">· {e.titulo}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
