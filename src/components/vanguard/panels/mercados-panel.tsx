"use client";

// v90.0 ESPEJOS SIN FIN — MERCADOS (espejo del terminal financiero: cinta de
// cotizaciones corriendo arriba, sparklines por contrato, variación diaria,
// índice de miedo de guerra y contador de sanciones). Contratos ficticios del
// mundo Vanguard, empujados por la tensión real del juego.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Flame, Ban, Gauge } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { generarMercados, frasesCinta, fmtPrecio, type Cotizacion } from "@/lib/mercados-data";
import { cn } from "@/lib/utils";

function Spark({ serie, color, sube }: { serie: number[]; color: string; sube: boolean }) {
  const w = 120;
  const h = 34;
  const min = Math.min(...serie);
  const max = Math.max(...serie);
  const span = max - min || 1;
  const pts = serie.map((v, i) => `${((i / (serie.length - 1)) * w).toFixed(1)},${(h - 2 - ((v - min) / span) * (h - 4)).toFixed(1)}`).join(" ");
  const fillPts = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[34px]">
      <polygon points={fillPts} fill={color} opacity="0.12" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" className="v90-spark" style={{ filter: `drop-shadow(0 0 2px ${color}66)` }} />
      <circle cx={w} cy={h - 2 - ((serie[serie.length - 1] - min) / span) * (h - 4)} r="2.2" fill={sube ? "#4DFFC4" : "#FF4D4D"} className="v90-punto" />
    </svg>
  );
}

function FilaCotizacion({ c, delay }: { c: Cotizacion; delay: number }) {
  const sube = c.varPct >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="hud-panel p-3 hover:border-amber-hud/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <p className="text-[11px] font-mono font-bold" style={{ color: c.contrato.color }}>{c.contrato.simbolo}</p>
          <p className="text-[9px] font-mono uppercase text-muted-foreground">{c.contrato.nombre}</p>
        </div>
        <div className="text-right">
          <motion.p key={c.precio.toFixed(2)} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className={cn("text-base font-bold font-mono", sube ? "text-emerald-hud" : "text-red-hud")}>
            {fmtPrecio(c.contrato, c.precio)}
          </motion.p>
          <p className={cn("text-[10px] font-mono flex items-center gap-1 justify-end", sube ? "text-emerald-hud" : "text-red-hud")}>
            {sube ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {sube ? "+" : ""}{c.varPct.toFixed(2)}%
          </p>
        </div>
      </div>
      <Spark serie={c.serie} color={c.contrato.color} sube={sube} />
      <p className="text-[9px] font-mono text-muted-foreground mt-1 truncate">{c.impacto} · {c.contrato.unidad}</p>
    </motion.div>
  );
}

export function MercadosPanel() {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 3000);
    return () => clearInterval(t);
  }, []);

  const { cots, miedo, sanciones } = useMemo(() => generarMercados(ahora), [ahora]);
  const cinta = useMemo(() => frasesCinta(ahora), [ahora]);

  const energia = cots.filter((c) => c.contrato.tipo === "energia" || c.contrato.tipo === "indice");
  const materia = cots.filter((c) => c.contrato.tipo === "agro" || c.contrato.tipo === "metal");
  const divisas = cots.filter((c) => c.contrato.tipo === "divisa");

  return (
    <div className="space-y-4">
      <PanelHeader
        title="MERCADOS DE GUERRA"
        subtitle="El dinero opina primero: cada frente mueve un precio antes que un titular"
        icon={<TrendingUp className="w-4 h-4 text-green-hud" />}
        color="green"
        right={
          <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-1 border border-green-hud/60 text-green-hud bg-green-hud/10">
            <Ban className="w-3 h-3" /> {sanciones.toLocaleString("es-ES")} PAQUETES DE SANCIONES
          </span>
        }
      />
      <HeroOro panel="mercados" />

      {/* CINTA CORRIENDO */}
      <div className="hud-panel overflow-hidden relative py-2">
        <div className="flex whitespace-nowrap v90-cinta w-max">
          {[0, 1].map((rep) => (
            <span key={rep} className="flex">
              {cinta.map((f, i) => (
                <span key={`${rep}-${i}`} className="text-[10px] font-mono uppercase mx-6 text-muted-foreground">
                  <span className="text-amber-hud">◆</span> {f}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* MIEDO DE GUERRA */}
      <div className="hud-panel p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Flame className={cn("w-5 h-5", miedo >= 70 ? "text-red-hud v90-lateja2" : "text-amber-hud")} />
          <div>
            <p className="text-[9px] font-mono uppercase text-muted-foreground flex items-center gap-1"><Gauge className="w-3 h-3" /> índice de miedo de guerra</p>
            <motion.p key={miedo} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className={cn("text-3xl font-bold font-mono", miedo >= 70 ? "text-red-hud" : miedo >= 45 ? "text-amber-hud" : "text-emerald-hud")}>
              {miedo}
            </motion.p>
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="h-3 bg-border/50 relative overflow-hidden">
            <motion.div
              animate={{ width: `${miedo}%` }}
              transition={{ type: "spring", stiffness: 60 }}
              className="h-full v90-barra"
              style={{ background: miedo >= 70 ? "#FF4D4D" : miedo >= 45 ? "#FFC94D" : "#4DFFC4" }}
            />
            {[25, 50, 75].map((m) => (
              <span key={m} className="absolute top-0 bottom-0 w-px bg-background/60" style={{ left: `${m}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-[8px] font-mono uppercase text-muted-foreground mt-1">
            <span>calma</span><span>normal</span><span>alarma</span><span>pánico</span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground max-w-[260px] leading-snug">
          El índice respira con la tensión real de Vanguard: cada escalada del tablero empuja crudo, oro y defensa — y castiga a las divisas sancionadas del juego.
        </p>
      </div>

      {/* GRUPOS */}
      {[
        { titulo: "energía e índices", cots: energia },
        { titulo: "materiales de guerra", cots: materia },
        { titulo: "divisas bajo presión", cots: divisas },
      ].map((g, gi) => (
        <div key={g.titulo}>
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" /> {g.titulo}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
            {g.cots.map((c, i) => (
              <FilaCotizacion key={c.contrato.id} c={c} delay={Math.min(gi * 0.08 + i * 0.05, 0.6)} />
            ))}
          </div>
        </div>
      ))}

      <p className="text-[9px] font-mono text-muted-foreground text-center uppercase">
        todos los contratos son ficticios y existen solo dentro de vanguard · educational war-economy sim
      </p>
    </div>
  );
}
