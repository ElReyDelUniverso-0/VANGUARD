"use client";

// v92.0 OJO DEL MUNDO — CANAL BRIEF (espejo del canal de análisis en vídeo):
// player simulado con osciloscopio, línea de tiempo con capítulos clicables,
// transcripción sincronizada, comentarios del cinturón y fila de "siguiente".

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MonitorPlay, Play, Pause, ListVideo, MessageSquare, Eye, Clock } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { episodiosDeHoy, episodiosSiguientes, type Episodio } from "@/lib/canalbrief-data";
import { cn } from "@/lib/utils";

function fmt(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Miniatura({ hue, duracion }: { hue: number; duracion: number }) {
  return (
    <div className="relative overflow-hidden border border-border/60" style={{ aspectRatio: "16/9" }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, hsl(${hue},70%,18%), hsl(${hue + 24},85%,30%) 55%, #0a0d14)` }} />
      {/* sol de atardecer */}
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 w-8 h-8 rounded-full" style={{ background: `hsl(${hue + 10},95%,62%)`, boxShadow: `0 0 18px hsl(${hue + 10},95%,55%)` }} />
      {/* horizonte */}
      <div className="absolute bottom-0 left-0 right-0 h-[26%]" style={{ background: "linear-gradient(to top, #05070c 55%, transparent)" }} />
      <span className="absolute bottom-1 right-1 text-[8px] font-mono px-1 bg-black/70 text-foreground/90">{fmt(duracion)}</span>
    </div>
  );
}

export function CanalBriefPanel() {
  const episodios = useMemo(() => episodiosDeHoy(6), []);
  const [sel, setSel] = useState<Episodio>(episodios[0]);
  const siguientes = useMemo(() => episodiosSiguientes(sel.id, 3), [sel.id]);

  const [play, setPlay] = useState(false);
  const [t, setT] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!play) return;
    const iv = setInterval(() => setT((x) => (x + 2 >= sel.duracionSeg ? 0 : x + 2)), 250);
    return () => clearInterval(iv);
  }, [play, sel.duracionSeg]);

  // osciloscopio de "voz del analista"
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const draw = () => {
      const w = (c.width = c.clientWidth * 2);
      const h = (c.height = 140);
      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#FF8A3D");
      grad.addColorStop(1, "#FFC94D");
      ctx.strokeStyle = play ? grad : "rgba(255,201,77,0.25)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      const seed = sel.id.length * 13;
      for (let x = 0; x <= w; x += 6) {
        const amp = play ? (18 + 26 * Math.abs(Math.sin((x + t * 90 + seed) / 60))) * Math.sin(x / w * Math.PI) : 6;
        const y = h / 2 + Math.sin((x / 30 + t * 3)) * amp * 0.35 + (play ? 0 : Math.sin(x / 12) * 2);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [play, t, sel.id]);

  const capituloActivo = useMemo(() => {
    let idx = 0;
    sel.capítulos.forEach((c, i) => {
      if (t >= c.seg) idx = i;
    });
    return idx;
  }, [t, sel]);

  const lineaActiva = useMemo(() => {
    let idx = 0;
    sel.transcripcion.forEach((l, i) => {
      if (t >= l.seg) idx = i;
    });
    return idx;
  }, [t, sel]);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Canal Brief"
        subtitle="El briefing que se ve: capítulos, transcripción y cinturón de comentarios, sin algoritmo"
        icon={<MonitorPlay className="w-4 h-4 text-red" />}
        color="red"
        right={
          <span className="text-[9px] font-mono uppercase px-2 py-1 border border-red-hud/60 text-red bg-red-hud/10">
            MESA DE ANÁLISIS VANGUARD
          </span>
        }
      />
      <HeroOro panel="canalbrief" />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-3">
        {/* REPRODUCTOR */}
        <div className="space-y-3">
          <div className="hud-panel border-red-hud/40 overflow-hidden">
            {/* pantalla */}
            <div className="relative bg-black">
              <canvas ref={canvasRef} className="w-full block" style={{ height: 150 }} />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              {!play && (
                <button
                  onClick={() => setPlay(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label="Reproducir"
                >
                  <span className="w-14 h-14 rounded-full bg-red/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="w-7 h-7 text-white ml-1" />
                  </span>
                </button>
              )}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="text-[8px] font-mono px-1.5 py-0.5 bg-black/70 text-amber border border-amber/40">NÚCLEO: RIESGO {sel.veredicto.riesgo} · {sel.veredicto.sentimiento}</span>
              </div>
              {/* controles */}
              <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 pt-4">
                <div
                  className="h-1.5 bg-foreground/20 cursor-pointer relative"
                  onClick={(e) => {
                    const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    setT(Math.round(((e.clientX - r.left) / r.width) * sel.duracionSeg));
                  }}
                >
                  <div className="absolute inset-y-0 left-0 bg-red" style={{ width: `${(t / sel.duracionSeg) * 100}%` }} />
                  {/* marcas de capítulos */}
                  {sel.capítulos.map((c) => (
                    <span key={c.seg} className="absolute top-0 bottom-0 w-px bg-amber" style={{ left: `${(c.seg / sel.duracionSeg) * 100}%` }} />
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <button onClick={() => setPlay((p) => !p)} className="text-foreground hover:text-red transition-colors">
                    {play ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <span className="text-[10px] font-mono text-foreground/80">{fmt(t)} / {fmt(sel.duracionSeg)}</span>
                  <span className="text-[10px] font-mono text-muted-foreground ml-auto">capítulo {capituloActivo + 1}/{sel.capítulos.length}</span>
                </div>
              </div>
            </div>

            {/* info del episodio */}
            <div className="px-4 py-3">
              <h3 className="text-[15px] font-bold text-foreground leading-snug">{sel.titulo}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{sel.vistas.toLocaleString("es")} vistas</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />hace {sel.haceH} h</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{sel.comentarios.length} comentarios</span>
              </div>
            </div>
          </div>

          {/* CAPÍTULOS + TRANSCRIPCIÓN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="hud-panel border-border/60 overflow-hidden">
              <div className="px-3 py-2 border-b border-border/60 flex items-center gap-1.5">
                <ListVideo className="w-3.5 h-3.5 text-amber" />
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Capítulos</h4>
              </div>
              <div className="divide-y divide-border/40">
                {sel.capítulos.map((c, i) => (
                  <button
                    key={c.seg}
                    onClick={() => { setT(c.seg); setPlay(true); }}
                    className={cn("w-full text-left px-3 py-2 flex gap-2 hover:bg-amber-hud/5 transition-colors", i === capituloActivo && play && "bg-amber-hud/10")}
                  >
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">{fmt(c.seg)}</span>
                    <span className={cn("text-[11px] leading-snug", i === capituloActivo && play ? "text-amber font-semibold" : "text-foreground/80")}>{c.titulo}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="hud-panel border-border/60 overflow-hidden">
              <div className="px-3 py-2 border-b border-border/60">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Transcripción en vivo</h4>
              </div>
              <div className="p-3 space-y-2">
                {sel.transcripcion.map((l, i) => (
                  <motion.p
                    key={l.seg}
                    animate={{ opacity: i === lineaActiva && play ? 1 : 0.45, scale: i === lineaActiva && play ? 1.01 : 1 }}
                    className={cn("text-[12px] leading-relaxed", i === lineaActiva && play ? "text-amber font-medium" : "text-foreground/70")}
                  >
                    <span className="font-mono text-[9px] text-muted-foreground mr-1.5">{fmt(l.seg)}</span>
                    {l.linea}
                  </motion.p>
                ))}
              </div>
            </div>
          </div>

          {/* COMENTARIOS */}
          <div className="hud-panel border-border/60 overflow-hidden">
            <div className="px-3 py-2 border-b border-border/60 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Cinturón de comentarios</h4>
            </div>
            <div className="divide-y divide-border/40">
              {sel.comentarios.map((c) => (
                <div key={c.usuario + c.haceH} className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber to-red flex items-center justify-center text-[9px] font-black text-black">
                      {c.usuario.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-[11px] font-semibold text-foreground">{c.usuario}</span>
                    <span className="text-[9px] font-mono text-muted-foreground">hace {c.haceH} h</span>
                    <span className="text-[10px] font-mono text-amber ml-auto">▲ {c.likes}</span>
                  </div>
                  <p className="text-[12px] text-foreground/80 leading-snug mt-1 pl-7">{c.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIGUIENTE */}
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground px-1">Siguiente en el canal</p>
          {siguientes.map((e, i) => (
            <motion.button
              key={e.id}
              onClick={() => { setSel(e); setT(0); setPlay(false); }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="w-full text-left hud-panel overflow-hidden hover:border-red-hud/50 transition-colors"
            >
              <Miniatura hue={e.hue} duracion={e.duracionSeg} />
              <div className="p-2">
                <p className="text-[11px] font-semibold text-foreground leading-snug line-clamp-2">{e.titulo}</p>
                <p className="text-[9px] font-mono text-muted-foreground mt-1">{e.vistas.toLocaleString("es")} vistas · hace {e.haceH} h</p>
              </div>
            </motion.button>
          ))}
          <div className="hud-panel px-3 py-2.5 border-dashed">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Todo el contenido del canal es ficticio y didáctico: los hechos del mundo real viven en las salas de datos de Vanguard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
