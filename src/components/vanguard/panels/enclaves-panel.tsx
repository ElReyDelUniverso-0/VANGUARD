"use client";

// v92.0 OJO DEL MUNDO — EN CLAVE (espejo del gran explicador): cada caso se
// entiende en 5 claves con mapa esquemático, actores con alineación y
// escenarios. El veredicto lo firma el núcleo neuronal.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, MapPin, Users, Compass } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { generarEnClave, fechaHoy } from "@/lib/enclaves-data";
import { cn } from "@/lib/utils";

const TIPO_PUNTO: Record<string, { color: string; r: number }> = {
  capital: { color: "#FFC94D", r: 4 },
  frente: { color: "#FF4D4D", r: 3.4 },
  puerto: { color: "#4D9DFF", r: 3.4 },
  recurso: { color: "#9AE04D", r: 3.4 },
};

export function EnClavePanel() {
  const hoy = useMemo(() => fechaHoy(), []);
  const dossiers = useMemo(() => generarEnClave(hoy, 4), [hoy]);
  const [idx, setIdx] = useState(0);
  const d = dossiers[idx];

  return (
    <div className="space-y-4">
      <PanelHeader
        title="El mundo en clave"
        subtitle="Caso a caso: el conflicto explicado en 5 claves, sin asumir que sabes de dónde venimos"
        icon={<KeyRound className="w-4 h-4 text-red" />}
        color="red"
        right={<span className="text-[9px] font-mono uppercase px-2 py-1 border border-red-hud/60 text-red bg-red-hud/10">EXPLICADOR DIARIO</span>}
      />
      <HeroOro panel="enclaves" />

      {/* SELECTOR DE CASOS */}
      <div className="flex flex-wrap gap-1.5">
        {dossiers.map((dd, i) => (
          <button
            key={dd.id}
            onClick={() => setIdx(i)}
            className={cn(
              "text-[10px] font-mono px-2.5 py-1.5 border transition-colors uppercase",
              i === idx ? "border-red bg-red/20 text-red" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {dd.tema}
          </button>
        ))}
      </div>

      {/* DOSSIER */}
      <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="hud-panel border-red-hud/40 overflow-hidden">
          <div className="border-b-2 border-red-hud/60 px-4 py-3 bg-red-hud/5">
            <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground">EN CLAVE · {d.region}</p>
            <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-foreground mt-0.5">{d.tema}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-[9px] font-mono px-1.5 py-0.5 border border-border text-muted-foreground">riesgo {d.veredicto.riesgo}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 border border-border text-muted-foreground">{d.veredicto.sentimiento}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 border border-emerald/50 text-emerald">confianza {d.veredicto.confianza}%</span>
              <span className="text-[9px] font-mono text-muted-foreground">veredicto del núcleo neuronal v3</span>
            </div>
          </div>

          <p className="px-4 py-3 text-[13px] leading-relaxed text-foreground/90 border-b border-border/40 bg-black/20">
            {d.unMinuto}
          </p>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px]">
            {/* 5 CLAVES */}
            <div className="p-3 space-y-2.5 xl:border-r border-border/40">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-red flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" /> Las 5 claves del caso
              </p>
              {d.claves.map((c, i) => (
                <motion.div
                  key={c.numero}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-3 border-l-2 border-red-hud/50 pl-3 py-1"
                >
                  <span className="font-black text-xl leading-none text-red shrink-0 w-7">{c.numero}</span>
                  <div>
                    <h5 className="text-[13px] font-bold text-foreground">{c.titulo}</h5>
                    <p className="text-[12px] leading-relaxed text-foreground/75 mt-0.5">{c.cuerpo}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* MAPA + ACTORES + ESCENARIOS */}
            <div className="p-3 space-y-3 bg-black/25">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red" /> Mapa del caso
                </p>
                <div className="border border-border/70 bg-[#0a0d14] relative overflow-hidden">
                  <svg viewBox="0 0 100 100" className="w-full block" style={{ aspectRatio: "4/3" }}>
                    {/* retícula + terreno procedural */}
                    <defs>
                      <radialGradient id="ec-velo" cx="50%" cy="40%" r="75%">
                        <stop offset="0%" stopColor="#2a1a08" />
                        <stop offset="100%" stopColor="#0a0d14" />
                      </radialGradient>
                    </defs>
                    <rect width="100" height="100" fill="url(#ec-velo)" />
                    {[10, 25, 40, 55, 70, 85].map((v) => (
                      <g key={v} stroke="#FFC94D" strokeOpacity="0.07" strokeWidth="0.3">
                        <line x1={v} y1="0" x2={v} y2="100" />
                        <line x1="0" y1={v} x2="100" y2={v} />
                      </g>
                    ))}
                    {/* masa de tierra esquemática */}
                    <path
                      d="M8,62 C18,42 30,38 42,30 C54,22 66,26 78,20 C86,16 94,24 92,36 C90,50 80,56 74,66 C68,76 54,80 42,78 C28,76 12,76 8,62 Z"
                      fill="#241a0e" stroke="#FF8A3D" strokeOpacity="0.35" strokeWidth="0.5"
                    />
                    {d.mapa.puntos.map((p, i) => {
                      const cfg = TIPO_PUNTO[p.tipo];
                      return (
                        <g key={i}>
                          <motion.circle
                            cx={p.x} cy={p.y} r={cfg.r + 3}
                            fill={cfg.color} fillOpacity="0.12"
                            animate={{ r: [cfg.r + 2, cfg.r + 4.5, cfg.r + 2] }}
                            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.35 }}
                          />
                          <circle cx={p.x} cy={p.y} r={cfg.r} fill={cfg.color} stroke="#0a0d14" strokeWidth="0.6" />
                          <text x={p.x + cfg.r + 2} y={p.y + 1} fontSize="2.6" fill="#e8ddc8" fillOpacity="0.8" fontFamily="monospace">
                            {p.nombre}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="absolute bottom-1 right-1.5 flex gap-2 bg-black/60 px-1.5 py-0.5">
                    {Object.entries(TIPO_PUNTO).map(([k, v]) => (
                      <span key={k} className="flex items-center gap-1 text-[7px] font-mono uppercase text-muted-foreground">
                        <i className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: v.color }} />{k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-red" /> Actores con veto
                </p>
                <div className="space-y-1.5">
                  {d.actores.map((a) => (
                    <div key={a.nombre} className="flex items-center gap-2 border border-border/50 px-2 py-1.5 bg-black/30">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: a.alineacion === "azul" ? "#4D9DFF" : a.alineacion === "rojo" ? "#FF4D4D" : "#9AE04D" }}
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-foreground truncate">{a.nombre}</p>
                        <p className="text-[9px] text-muted-foreground">{a.rol}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70 mb-1.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-red" /> Escenarios
                </p>
                <div className="space-y-2">
                  {d.escenarios.map((e) => (
                    <div key={e.nombre}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-foreground/80">{e.nombre}</span>
                        <span className="font-mono text-muted-foreground">{e.prob}%</span>
                      </div>
                      <div className="h-1 bg-foreground/10">
                        <motion.div className="h-full bg-red" initial={{ width: 0 }} animate={{ width: `${e.prob}%` }} transition={{ duration: 0.7 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
