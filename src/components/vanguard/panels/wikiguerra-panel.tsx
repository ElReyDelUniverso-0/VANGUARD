"use client";

// v90.0 ESPEJOS SIN FIN — WIKIGUERRA (espejo del formato enciclopedia
// colaborativa: caja de información, índice de secciones, notas de discusión y
// barra de edición). Artículos 100% propios del mundo Vanguard.

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, History, MessageSquare, Lock, Eye, PenLine, ListTree } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { generarArticulo, generarCharla, WIKI_IDS, haceEdicion } from "@/lib/wikiguerra-data";
import { cn } from "@/lib/utils";

export function WikiguerraPanel() {
  const [sel, setSel] = useState(WIKI_IDS[0]);
  const [dia, setDia] = useState(() => Math.floor(Date.now() / 86400_000));
  const [pestana, setPestana] = useState<"articulo" | "charla" | "historial">("articulo");

  useEffect(() => {
    const t = setInterval(() => setDia(Math.floor(Date.now() / 86400_000)), 60_000);
    return () => clearInterval(t);
  }, []);

  const a = useMemo(() => generarArticulo(sel, dia), [sel, dia]);
  const charla = useMemo(() => generarCharla(sel, dia), [sel, dia]);
  const minsEdicion = useMemo(() => 3 + ((dia * 37 + sel.length * 11) % 240), [dia, sel]);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="WIKIGUERRA — la enciclopedia del conflicto"
        subtitle="Artículos abiertos que la comunidad del juego corrige cada hora"
        icon={<BookOpen className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
        right={
          <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-1 border border-cyan-hud/60 text-cyan-hud bg-cyan-hud/10">
            <History className="w-3 h-3" /> última edición {haceEdicion(minsEdicion)}
          </span>
        }
      />
      <HeroOro panel="wikiguerra" />

      {/* pestañas de artículo */}
      <div className="flex gap-1.5 flex-wrap">
        {WIKI_IDS.map((id) => {
          const art = generarArticulo(id, dia);
          const activo = id === sel;
          return (
            <button
              key={id}
              onClick={() => setSel(id)}
              className={cn(
                "text-[10px] font-mono uppercase px-2.5 py-1 border transition-all active:scale-95",
                activo ? "border-cyan-hud text-cyan bg-cyan-hud/15" : "border-border text-muted-foreground hover:border-cyan-hud/50"
              )}
            >
              {art.titulo}
            </button>
          );
        })}
      </div>

      {/* barra de página estilo wiki */}
      <div className="hud-panel px-3 py-1.5 flex items-center gap-3 flex-wrap">
        {(["articulo", "charla", "historial"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPestana(p)}
            className={cn(
              "text-[10px] font-mono uppercase pb-0.5 border-b-2 transition-all",
              pestana === p ? "border-cyan-hud text-cyan-hud" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {p === "articulo" ? "artículo" : p === "charla" ? "discusión" : "historial"}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-2 text-[9px] font-mono text-muted-foreground">
          {a.protegido && <span className="flex items-center gap-1 text-amber-hud"><Lock className="w-3 h-3" /> semiprotegido</span>}
          {a.vigilado && <span className="flex items-center gap-1 text-cyan-hud"><Eye className="w-3 h-3" /> vigilado</span>}
          <span>{a.editores} editores</span>
        </span>
      </div>

      <AnimatePresence mode="wait">
        {pestana === "articulo" && (
          <motion.div
            key={"art-" + a.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-3"
          >
            {/* ÍNDICE */}
            <div className="hud-panel p-3 h-fit lg:sticky lg:top-2">
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
                <ListTree className="w-3 h-3" /> índice
              </p>
              <ol className="space-y-1 text-[11px] text-foreground/80">
                <li className="border-b border-border/30 pb-1">Extracto</li>
                {a.secciones.map((s, i) => (
                  <li key={i} className="border-b border-border/30 pb-1">{i + 1}. {s.titulo}</li>
                ))}
                <li>{a.secciones.length + 1}. Véase también</li>
                <li>{a.secciones.length + 2}. Referencias</li>
              </ol>
              <div className="mt-3 pt-2 border-t border-border/40 space-y-1">
                <p className="text-[8px] font-mono uppercase text-muted-foreground">categorías</p>
                {a.categorias.map((c) => (
                  <span key={c} className="inline-block text-[9px] font-mono px-1.5 py-0.5 mr-1 border border-cyan-hud/40 text-cyan-hud">{c}</span>
                ))}
              </div>
            </div>

            {/* CUERPO */}
            <div className="hud-panel p-4 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground leading-tight v90-entra">{a.titulo}</h2>
                <div className="h-px bg-border mt-2 v90-escaneo" />
              </div>

              <p className="text-[13px] leading-relaxed text-foreground/90 first-letter:text-3xl first-letter:font-bold first-letter:text-cyan-hud">
                {a.extracto}
              </p>

              {a.secciones.map((s, i) => (
                <motion.section
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                >
                  <h3 className="text-base font-bold text-foreground border-b border-border/50 pb-1 mb-2">{s.titulo}</h3>
                  {s.parrafos.map((p, j) => (
                    <p key={j} className="text-[12px] leading-relaxed text-foreground/85 mb-2">{p}</p>
                  ))}
                </motion.section>
              ))}

              <section>
                <h3 className="text-base font-bold text-foreground border-b border-border/50 pb-1 mb-2">Véase también</h3>
                <ul className="text-[12px] text-cyan-hud space-y-1">
                  <li>▸ PÉRDIDAS CONFIRMADAS — el registro visual del material documentado</li>
                  <li>▸ EVALUACIÓN DE CAMPAÑA — el análisis diario por teatro</li>
                  <li>▸ LÍNEA DEL FRENTE — el mapa de control del teatro ficticio</li>
                  <li>▸ Dossier MUNDIAL de las naciones implicadas</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-bold text-foreground border-b border-border/50 pb-1 mb-2">Referencias</h3>
                <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
                  {a.referencias.map((rr, i) => (
                    <li key={i}>{rr}</li>
                  ))}
                </ol>
              </section>
            </div>

            {/* CAJA DE INFORMACIÓN */}
            <div className="space-y-3">
              <div className="hud-panel p-3 border-cyan-hud/40">
                <p className="text-[10px] font-mono font-bold uppercase text-center text-cyan-hud border-b border-cyan-hud/40 pb-1.5 mb-2">
                  {a.titulo}
                </p>
                <div className="space-y-1.5">
                  {a.infobox.map((f) => (
                    <div key={f.etiqueta}>
                      <p className="text-[8px] font-mono uppercase text-muted-foreground">{f.etiqueta}</p>
                      <p className="text-[10px] text-foreground/90 leading-snug">{f.valor}</p>
                    </div>
                  ))}
                </div>
              </div>

              {a.bandos.map((b) => (
                <motion.div
                  key={b.lado}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hud-panel p-3"
                  style={{ borderLeft: `3px solid ${b.color}` }}
                >
                  <p className="text-[10px] font-mono font-bold uppercase mb-1.5" style={{ color: b.color }}>{b.lado}</p>
                  <div className="space-y-1 text-[10px] text-foreground/85">
                    {b.miembros.map((m) => <p key={m}>• {m}</p>)}
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-border/40">
                    <p className="text-[8px] font-mono uppercase text-muted-foreground mb-0.5">comandantes</p>
                    {b.comandantes.map((c) => <p key={c} className="text-[10px] text-foreground/85">{c}</p>)}
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-border/40 space-y-1">
                    <p className="text-[9px]"><span className="text-muted-foreground font-mono uppercase text-[8px]">fuerzas: </span>{b.fuerzas}</p>
                    <p className="text-[9px]"><span className="text-muted-foreground font-mono uppercase text-[8px]">bajas: </span>{b.bajas}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {pestana === "charla" && (
          <motion.div key="charla" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="hud-panel p-4 max-w-3xl">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-3">
              <MessageSquare className="w-3 h-3" /> discusión del artículo — {charla.length} hilos abiertos
            </p>
            <div className="space-y-2">
              {charla.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="border border-border/50 p-2.5 hover:border-cyan-hud/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-cyan-hud">{c.usuario}</span>
                    <span
                      className={cn(
                        "text-[8px] font-mono px-1 py-0.5 border",
                        c.sello === "BOT" ? "border-violet-hud/50 text-violet-hud" : c.sello === "ANALISTA" ? "border-amber-hud/50 text-amber-hud" : "border-cyan-hud/50 text-cyan-hud"
                      )}
                    >
                      {c.sello}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground ml-auto">{c.respuestas} respuestas</span>
                  </div>
                  <p className="text-[11px] text-foreground/85">{c.tema}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border/50">
              <button className="text-[10px] font-mono uppercase text-cyan-hud flex items-center gap-1.5 hover:gap-2.5 transition-all">
                <PenLine className="w-3 h-3" /> añadir tema (gana +5ⓒ de contribución)
              </button>
            </div>
          </motion.div>
        )}

        {pestana === "historial" && (
          <motion.div key="hist" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="hud-panel p-4 max-w-3xl">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              historial de ediciones — {a.ediciones} ediciones registradas
            </p>
            <div className="space-y-1.5">
              {[a.ediciones, a.ediciones - 3, a.ediciones - 7, a.ediciones - 14, a.ediciones - 22, a.ediciones - 41].map((e, i) => {
                const h = 1 + ((dia * 13 + i * 7) % 26);
                const delta = i % 3 === 0 ? "+412" : i % 3 === 1 ? "−187" : "+96";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 text-[10px] font-mono border-b border-border/30 pb-1.5"
                  >
                    <span className="text-muted-foreground w-16">hace {h} h</span>
                    <span className="text-cyan-hud">Cartógrafo-{((dia + i) % 9) + 1}</span>
                    <span className="text-muted-foreground">ed. #{e}</span>
                    <span className={cn(delta.startsWith("+") ? "text-emerald-hud" : "text-red-hud")}>{delta} bytes</span>
                    <span className="ml-auto text-muted-foreground truncate max-w-[220px]">
                      {i % 3 === 0 ? "infobox: bajas actualizadas con evidencia" : i % 3 === 1 ? "revertido: cifra sin fuente" : "sección cronología ampliada"}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
