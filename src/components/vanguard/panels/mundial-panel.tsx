"use client";

// v90.0 ESPEJOS SIN FIN — MUNDIAL (espejo del gran dossier de país: lista de
// naciones a la izquierda, ficha institucional con secciones fijas en el centro
// y comparador de dos naciones. Contenido 100% ficticio del mundo Vanguard).

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, Scale, Users, Landmark, Coins, Shield, Mountain, Globe2 } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { generarDossier, MUNDIAL_IDS, nombreDe, type Dossier } from "@/lib/mundial-data";
import { cn } from "@/lib/utils";

function Bloque({ titulo, icono, acento, stats, delay }: { titulo: string; icono: React.ReactNode; acento: string; stats: Dossier["geografia"]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="hud-panel p-3"
    >
      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2" style={{ color: acento }}>
        {icono} {titulo}
      </p>
      <div className="space-y-1.5">
        {stats.map((s) => (
          <div key={s.etiqueta} className="flex items-baseline gap-2">
            <span className="text-[10px] font-mono uppercase text-muted-foreground w-28 shrink-0">{s.etiqueta}</span>
            <span className="text-[11px] text-foreground/90 flex-1 border-b border-dashed border-border/40">{s.valor}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function MundialPanel() {
  const [sel, setSel] = useState(MUNDIAL_IDS[0]);
  const [comparar, setComparar] = useState(false);
  const [cmpId, setCmpId] = useState(MUNDIAL_IDS[1]);
  const [dia, setDia] = useState(() => Math.floor(Date.now() / 86400_000));

  useEffect(() => {
    const t = setInterval(() => setDia(Math.floor(Date.now() / 86400_000)), 60_000);
    return () => clearInterval(t);
  }, []);

  const d = useMemo(() => generarDossier(sel, dia), [sel, dia]);
  const d2 = useMemo(() => (comparar ? generarDossier(cmpId, dia) : null), [comparar, cmpId, dia]);


  return (
    <div className="space-y-4">
      <PanelHeader
        title="Dossier Mundial de Naciones"
        subtitle="La ficha institucional de cada actor del tablero — actualizada a diario"
        icon={<BookMarked className="w-4 h-4 text-amber-hud" />}
        color="amber"
        right={
          <button
            onClick={() => setComparar((c) => !c)}
            className={cn(
              "flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-1 border transition-all active:scale-95",
              comparar ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border text-muted-foreground hover:border-amber-hud/50"
            )}
          >
            <Scale className="w-3 h-3" /> comparar
          </button>
        }
      />
      <HeroOro panel="mundial" />

      <div className={cn("grid gap-3", comparar ? "grid-cols-1 lg:grid-cols-[170px_1fr_1fr]" : "grid-cols-1 lg:grid-cols-[170px_1fr]")}>
        {/* LISTA DE NACIONES */}
        <div className="hud-panel p-2 space-y-0.5 max-h-[560px] overflow-y-auto thin-scroll">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground px-1 py-1 flex items-center gap-1">
            <Globe2 className="w-3 h-3" /> naciones
          </p>
          {MUNDIAL_IDS.map((id, i) => {
            const dd = generarDossier(id, dia);
            const activo = id === sel;
            return (
              <motion.button
                key={id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                onClick={() => setSel(id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 text-left border transition-all active:scale-[0.98]",
                  activo ? "bg-background/70 border-amber-hud/60" : "border-transparent hover:border-border"
                )}
              >
                <span className="text-base leading-none">{dd.bandera}</span>
                <span className="text-[10px] font-mono uppercase leading-tight flex-1" style={{ color: activo ? dd.acento : undefined }}>
                  {dd.nombre}
                </span>
                <span
                  className={cn("text-[9px] font-mono px-1", dd.riesgo >= 80 ? "text-red-hud" : dd.riesgo >= 60 ? "text-amber-hud" : "text-muted-foreground")}
                >
                  {dd.riesgo}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* DOSSIER PRINCIPAL */}
        <AnimatePresence mode="wait">
          <motion.div
            key={d.id + (comparar ? "-c" : "")}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="space-y-3"
          >
            <div className="hud-panel p-4 relative overflow-hidden">
              <div
                className="absolute inset-x-0 top-0 h-0.5 v90-escaneo"
                style={{ background: `linear-gradient(90deg, transparent, ${d.acento}, transparent)` }}
              />
              <div className="flex items-start gap-3 mb-2">
                <span className="text-4xl leading-none v90-flota">{d.bandera}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold tracking-wide" style={{ color: d.acento }}>{d.nombre}</h3>
                  <p className="text-[10px] font-mono uppercase text-muted-foreground">
                    {d.region} · capital: {d.capital}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-mono uppercase text-muted-foreground">índice vanguard</p>
                  <p className={cn("text-2xl font-bold font-mono v90-entra", d.riesgo >= 80 ? "text-red-hud" : d.riesgo >= 60 ? "text-amber-hud" : "text-emerald-hud")}>
                    {d.riesgo}
                  </p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-foreground/85">{d.trasfondo}</p>
              <p className="text-[9px] font-mono text-muted-foreground mt-2 uppercase">
                dossier revisado hoy · fuente: archivo Vanguard · uso educativo del juego
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Bloque titulo="geografía" icono={<Mountain className="w-3 h-3" />} acento="#9AE04D" stats={d.geografia} delay={0.05} />
              <Bloque titulo="gente y sociedad" icono={<Users className="w-3 h-3" />} acento="#3DDCFF" stats={d.gente} delay={0.1} />
              <Bloque titulo="gobierno" icono={<Landmark className="w-3 h-3" />} acento="#FFC94D" stats={d.gobierno} delay={0.15} />
              <Bloque titulo="economía" icono={<Coins className="w-3 h-3" />} acento="#FF8A3D" stats={d.economia} delay={0.2} />
            </div>

            <Bloque titulo="militar" icono={<Shield className="w-3 h-3" />} acento="#FF4D4D" stats={d.militar} delay={0.25} />

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="hud-panel p-3">
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2">problemas transnacionales</p>
              <ul className="space-y-1.5">
                {d.transnacionales.map((t, i) => (
                  <li key={i} className="text-[11px] text-foreground/85 flex gap-2">
                    <span className="text-red-hud font-mono">▸</span> {t}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* COMPARADOR */}
        {comparar && d2 && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <div className="hud-panel p-2 space-y-0.5">
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground px-1 py-1">comparar con</p>
              {MUNDIAL_IDS.filter((id) => id !== sel).map((id) => {
                const dd = generarDossier(id, dia);
                return (
                  <button
                    key={id}
                    onClick={() => setCmpId(id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 text-left border transition-all active:scale-[0.98]",
                      id === cmpId ? "bg-background/70 border-amber-hud/60" : "border-transparent hover:border-border"
                    )}
                  >
                    <span className="text-base leading-none">{dd.bandera}</span>
                    <span className="text-[10px] font-mono uppercase leading-tight flex-1">{dd.nombre}</span>
                  </button>
                );
              })}
            </div>
            <div className="hud-panel p-3 space-y-2.5">
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Scale className="w-3 h-3" /> cara a cara
              </p>
              {[
                { k: "riesgo Vanguard", a: d.riesgo, b: d2.riesgo, max: 100 },
                { k: "población (M)", a: d.pobM, b: d2.pobM, max: 1500 },
                { k: "gasto militar (% PIB)", a: parseFloat(d.militar[0].valor), b: parseFloat(d2.militar[0].valor), max: 10 },
                { k: "PIB nominal ($B)", a: d.pibB, b: d2.pibB, max: 6000 },
              ].map((row) => (
                <div key={row.k}>
                  <div className="flex items-center justify-between text-[9px] font-mono uppercase text-muted-foreground mb-1">
                    <span style={{ color: d.acento }}>{row.a.toLocaleString("es-ES", { maximumFractionDigits: 1 })}</span>
                    <span>{row.k}</span>
                    <span style={{ color: d2.acento }}>{row.b.toLocaleString("es-ES", { maximumFractionDigits: 1 })}</span>
                  </div>
                  <div className="flex items-center gap-1 h-2">
                    <div className="flex-1 flex justify-end">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(row.a / row.max) * 100}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="h-2 v90-barra"
                        style={{ background: d.acento, boxShadow: `0 0 8px ${d.acento}66` }}
                      />
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <div className="flex-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(row.b / row.max) * 100}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="h-2 v90-barra"
                        style={{ background: d2.acento, boxShadow: `0 0 8px ${d2.acento}66` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-[9px] font-mono text-muted-foreground pt-1 border-t border-border/50">
                {d.bandera} {nombreDe(d.id)} vs {nombreDe(d2.id)} {d2.bandera} — cifras del juego, uso educativo
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
