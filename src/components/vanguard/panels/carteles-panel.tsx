"use client";

// Vanguard v14 — CARTELES: fichas de organizaciones criminales con zona de
// operación en globo 3D, lider (foto real cuando existe), estructura,
// cronología y análisis de ingresos. Contenido histórico/educativo.

import { useState } from "react";
import dynamic from "next/dynamic";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Network, MapPin, Coins, Clock, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";
import { CARTELS, type CartelItem } from "@/lib/archive-data";

// v14 — mapa de presencia en 3D
const GlobeMap3D = dynamic(
  () => import("@/components/vanguard/globe-map-3d").then((m) => m.GlobeMap3D),
  { ssr: false, loading: () => (
    <div className="hud-corner p-6 flex items-center justify-center text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
      Cargando globo 3D...
    </div>
  ) }
);

export function CartelesPanel() {
  const [sel, setSel] = useState<CartelItem | null>(null);

  const open = (c: CartelItem) => { sfx.tab(); setSel(c); };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="CARTELES & CRIMEN ORGANIZADO"
        subtitle="Archivos históricos · estructura, rutas y caída"
        icon={<Network className="w-4 h-4" />} color="violet"
        right={<span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber" /> EDUCATIVO</span>}
      />

      {/* grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {CARTELS.map((c) => (
          <button key={c.id} onClick={() => open(c)}
            className={cn("hud-corner border p-3 text-left transition-colors",
              sel?.id === c.id ? "border-violet-hud bg-violet-hud/15" : "border-border/60 bg-secondary/20 hover:border-violet-hud/60")}>
            <div className="font-mono text-xs font-bold text-foreground leading-tight mb-1">{c.name}</div>
            <div className="text-[9px] font-mono text-muted-foreground flex items-center gap-1 mb-1"><MapPin className="w-2.5 h-2.5" /> {c.origin} · {c.founded}</div>
            <div className="text-[9px] font-mono text-amber flex items-center gap-1"><Coins className="w-2.5 h-2.5" /> {c.income}</div>
            {c.leader.img && <div className="mt-1 text-[8px] font-mono text-cyan-hud">FOTO REAL DISPONIBLE</div>}
          </button>
        ))}
      </div>

      {/* detalle */}
      <AnimatePresence>
        {sel && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="hud-corner border border-violet-hud bg-background p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-mono text-base font-bold text-violet-hud">{sel.name}</h3>
                <p className="text-[10px] font-mono text-muted-foreground">{sel.origin} · {sel.founded}</p>
              </div>
              <button onClick={() => setSel(null)} className="p-1 border border-border rounded-sm"><X className="w-3.5 h-3.5" /></button>
            </div>

            <div className="grid md:grid-cols-[240px_1fr] gap-3">
              {/* lider */}
              <div className="border border-border/50 bg-secondary/20 p-2.5">
                <div className="text-[9px] font-mono uppercase tracking-widest text-amber mb-1.5">Lider / cara visible</div>
                {sel.leader.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sel.leader.img} alt={sel.leader.name} className="w-full h-40 object-cover border border-border/60 mb-1.5" />
                ) : (
                  <div className="w-full h-20 border border-dashed border-border/60 flex items-center justify-center text-muted-foreground/40 mb-1.5">
                    <Network className="w-6 h-6" />
                  </div>
                )}
                <div className="text-[11px] font-mono font-bold text-foreground">{sel.leader.name}</div>
                <div className="text-[10px] font-mono text-muted-foreground">{sel.leader.note}</div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-foreground/90 leading-relaxed space-y-2">
                  {sel.desc.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div className="border border-border/50 p-2">
                    <div className="text-[8px] font-mono uppercase text-muted-foreground">Territorio</div>
                    <div className="text-[11px] font-mono text-foreground">{sel.territory}</div>
                  </div>
                  <div className="border border-border/50 p-2">
                    <div className="text-[8px] font-mono uppercase text-muted-foreground">Estructura</div>
                    <div className="text-[11px] font-mono text-foreground">{sel.structure}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* mapa de presencia 3D */}
            <div className="border border-border/50 bg-secondary/10 p-2">
              <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-hud mb-1">Zona de operación (aprox.)</div>
              <GlobeMap3D
                markers={[
                  {
                    id: "presence",
                    lat: sel.presence.lat,
                    lng: sel.presence.lng,
                    color: "#A855F7",
                    size: 0.42,
                    alt: 0.05,
                    ring: true,
                    ringMax: Math.max(3, Math.min(8, sel.presence.r)),
                    label: sel.name,
                    labelTag: "ZONA DE INFLUENCIA",
                  },
                ]}
                height="min(30vh, 260px)"
                minHeight={200}
                autoRotate
                rotateSpeed={0.55}
                ariaLabel={`Globo 3D con la zona de operación de ${sel.name}`}
              />
              <div className="text-[8px] font-mono text-muted-foreground/60">Globo 3D · zona de influencia estimada</div>
            </div>

            {/* cronologia */}
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-amber mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Cronología clave</div>
              <div className="space-y-1">
                {sel.timeline.map((t, i) => (
                  <div key={i} className="flex gap-2 text-[11px] font-mono">
                    <span className="text-violet-hud font-bold min-w-[52px]">{t.year}</span>
                    <span className="text-foreground/85">{t.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">
        Archivo histórico-educativo · las cifras de ingresos son estimaciones públicas
      </div>
    </div>
  );
}
