"use client";

// v90.0 ESPEJOS SIN FIN — CIBER (espejo del gran mapa de ciberamenazas:
// arcos de ataque volando entre naciones sobre el mapa oscuro, contadores que
// ruedan, ranking de orígenes/objetivos y feed de intrusión). Todo ficticio
// del mundo Vanguard.

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, ShieldAlert, Target, Globe2, Activity } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { WorldMapSVG } from "@/components/vanguard/world-map-svg";
import { generarCiber, rutasDeAtaques, TIPOS_ATAQUE, type Ataque } from "@/lib/ciber-data";
import { getTension } from "@/lib/tension";
import { cn } from "@/lib/utils";

function Contador({ valor, etiqueta, color }: { valor: number; etiqueta: string; color: string }) {
  return (
    <div className="text-center">
      <motion.p
        key={valor}
        initial={{ scale: 1.18, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-xl font-bold font-mono v90-num"
        style={{ color }}
      >
        {valor.toLocaleString("es-ES")}
      </motion.p>
      <p className="text-[8px] font-mono uppercase text-muted-foreground">{etiqueta}</p>
    </div>
  );
}

export function CiberPanel() {
  const [ahora, setAhora] = useState(() => Date.now());
  const tension = useMemo(() => getTension(), []);

  // pulso vivo: cada 2.5 s nueva ventana de ataques
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 2500);
    return () => clearInterval(t);
  }, []);

  const estado = useMemo(() => generarCiber(ahora), [ahora]);
  const rutas = useMemo(() => rutasDeAtaques(estado.ataques), [estado]);
  const maxTop = Math.max(...estado.topOrigenes.map((o) => o.n), 1);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="CIBER — mapa de amenazas en vivo"
        subtitle="La guerra que no hace ruido: intrusión por intrusión, nación a nación"
        icon={<Bug className="w-4 h-4 text-emerald-hud" />}
        color="green"
        right={
          <span className={cn("flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-1 border", estado.defconCiber >= 4 ? "border-red-hud text-red-hud bg-red-hud/10 v90-lateja2" : "border-emerald-hud/60 text-emerald-hud bg-emerald-hud/10")}>
            <ShieldAlert className="w-3 h-3" /> DEFCON CIBER {estado.defconCiber}
          </span>
        }
      />
      <HeroOro panel="ciber" />

      {/* contadores */}
      <div className="hud-panel p-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
        <Contador valor={estado.totalHoy} etiqueta="ataques hoy" color="#FF4D4D" />
        <Contador valor={estado.ataques.length} etiqueta="vivos ahora" color="#FF8A3D" />
        <Contador valor={estado.porTipo[0]?.n ?? 0} etiqueta={estado.porTipo[0]?.tipo.nombre ?? "ddos"} color="#FFD23D" />
        <Contador valor={estado.topObjetivos[0]?.n ?? 0} etiqueta={`objetivo #1 · ${estado.topObjetivos[0]?.nacion.bandera ?? ""}`} color="#B48CFF" />
        <Contador valor={estado.topOrigenes[0]?.n ?? 0} etiqueta={`origen #1 · ${estado.topOrigenes[0]?.nacion.bandera ?? ""}`} color="#4DFFC4" />
        <Contador valor={Math.round(tension)} etiqueta="tensión vanguard" color="#3DDCFF" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3">
        {/* MAPA DE ARCOS */}
        <div className="hud-panel p-2 relative overflow-hidden">
          <WorldMapSVG routes={rutas} showFronts={false} showSat />
          <div className="absolute top-2 left-2 hud-panel px-2 py-1 text-[8px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
            <span className="beacon w-1.5 h-1.5 rounded-full bg-red-hud" /> {estado.ataques.length} arcos de intrusión activos
          </div>
          {/* leyenda de tipos */}
          <div className="absolute bottom-2 left-2 flex gap-1.5 flex-wrap max-w-[70%]">
            {TIPOS_ATAQUE.map((t) => {
              const n = estado.ataques.filter((a: Ataque) => a.tipo.id === t.id).length;
              return (
                <span key={t.id} className="text-[8px] font-mono uppercase px-1.5 py-0.5 border bg-background/80" style={{ color: t.color, borderColor: `${t.color}55` }}>
                  {t.nombre} {n > 0 && <b>{n}</b>}
                </span>
              );
            })}
          </div>
        </div>

        {/* RANKINGS + FEED */}
        <div className="space-y-3">
          <div className="hud-panel p-3">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
              <Target className="w-3 h-3" /> objetivos más atacados
            </p>
            <div className="space-y-1.5">
              {estado.topObjetivos.map((o, i) => (
                <div key={o.nacion.id} className="flex items-center gap-2">
                  <span className="text-[10px] w-5 text-muted-foreground font-mono">#{i + 1}</span>
                  <span className="text-xs w-6">{o.nacion.bandera}</span>
                  <span className="text-[10px] font-mono uppercase flex-1 truncate">{o.nacion.nombre}</span>
                  <div className="w-16 h-1.5 bg-border/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(o.n / maxTop) * 100}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full v90-barra"
                      style={{ background: "#FF6B4D" }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground w-10 text-right">{o.n.toLocaleString("es-ES")}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mt-3 mb-2">
              <Globe2 className="w-3 h-3" /> orígenes más activos
            </p>
            <div className="space-y-1.5">
              {estado.topOrigenes.map((o, i) => (
                <div key={o.nacion.id} className="flex items-center gap-2">
                  <span className="text-[10px] w-5 text-muted-foreground font-mono">#{i + 1}</span>
                  <span className="text-xs w-6">{o.nacion.bandera}</span>
                  <span className="text-[10px] font-mono uppercase flex-1 truncate">{o.nacion.nombre}</span>
                  <div className="w-16 h-1.5 bg-border/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(o.n / maxTop) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-full v90-barra"
                      style={{ background: "#B48CFF" }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground w-10 text-right">{o.n.toLocaleString("es-ES")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FEED DE INTRUSIÓN */}
          <div className="hud-panel p-0 flex flex-col max-h-[300px] overflow-hidden">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground px-3 py-2 border-b border-border/60 sticky top-0 bg-background/95 flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> feed de intrusión
            </p>
            <div className="overflow-y-auto thin-scroll flex-1">
              <AnimatePresence initial={false}>
                {estado.ataques.slice(0, 12).map((a) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="px-3 py-1.5 border-b border-border/40 flex items-center gap-2"
                  >
                    <span className="text-sm leading-none">{a.origen.bandera}</span>
                    <span className="text-[9px] font-mono" style={{ color: a.tipo.color }}>→</span>
                    <span className="text-sm leading-none">{a.objetivo.bandera}</span>
                    <span className="text-[9px] font-mono uppercase" style={{ color: a.tipo.color }}>{a.tipo.nombre}</span>
                    <span className="text-[9px] font-mono text-muted-foreground truncate">{a.sector.emoji} {a.sector.nombre}</span>
                    <span className="ml-auto flex gap-0.5 shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={cn("w-1 h-2.5", i < a.intensidad ? "" : "opacity-20")} style={{ background: i < a.intensidad ? a.tipo.color : undefined }} />
                      ))}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
