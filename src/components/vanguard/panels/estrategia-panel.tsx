"use client";

// v92.0 OJO DEL MUNDO — ESTRATEGIA GLOBAL (espejo del hub de estrategia y
// wargames): escuela de doctrinas con árboles de mejora, escenarios jugables
// con reglas especiales, ciclo OODA animado, lecciones tácticas y ranking de
// generales donde el jugador compite (TU).

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Swords, BrainCircuit, Medal, Repeat } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { estrategiaDeHoy } from "@/lib/estrategia-data";
import { cn } from "@/lib/utils";

const RAMA_COLOR: Record<string, string> = {
  ATAQUE: "#FF6B4D",
  DEFENSA: "#4D9DFF",
  MOVIMIENTO: "#FFC94D",
  INFORMACIÓN: "#C89AFF",
};

export function EstrategiaGlobalPanel() {
  const hoy = useMemo(() => estrategiaDeHoy(), []);
  const [docSel, setDocSel] = useState(0);
  const [escSel, setEscSel] = useState(0);
  const [oodaFase, setOodaFase] = useState(0);

  // ciclo OODA en marcha perpetua
  useEffect(() => {
    const iv = setInterval(() => setOodaFase((f) => (f + 1) % 4), 2600);
    return () => clearInterval(iv);
  }, []);

  const doctrina = hoy.doctrinas[docSel];
  const escenario = hoy.escenarios[escSel];

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Estrategia Global"
        subtitle="La escuela del mando: doctrinas, wargames con reglas y el ranking donde TU compites"
        icon={<GraduationCap className="w-4 h-4 text-violet" />}
        color="violet"
        right={<span className="text-[9px] font-mono uppercase px-2 py-1 border border-violet-hud/60 text-violet bg-violet-hud/10">CLASE DE HOY</span>}
      />
      <HeroOro panel="estrategia" />

      {/* CICLO OODA */}
      <div className="hud-panel border-violet-hud/40 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border/60 bg-violet-hud/5 flex items-center gap-2">
          <Repeat className="w-3.5 h-3.5 text-violet" />
          <h4 className="text-[12px] font-bold uppercase tracking-wider text-foreground">El ciclo del mando (OODA)</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border/40">
          {hoy.ooda.map((f, i) => (
            <motion.div
              key={f.fase}
              animate={{
                backgroundColor: i === oodaFase ? "rgba(200,154,255,0.12)" : "rgba(0,0,0,0.2)",
                scale: i === oodaFase ? 1.015 : 1,
              }}
              transition={{ duration: 0.5 }}
              className="px-3 py-3"
            >
              <p className={cn("text-[10px] font-mono tracking-[0.25em]", i === oodaFase ? "text-violet font-bold" : "text-muted-foreground")}>
                {i + 1} · {f.fase}
              </p>
              <p className="text-[11px] leading-snug text-foreground/80 mt-1">{f.texto}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* DOCTRINAS */}
        <div className="hud-panel border-violet-hud/40 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60 bg-violet-hud/5 flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-violet" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Escuela de doctrinas</h4>
          </div>
          <div className="flex flex-wrap gap-1.5 p-2.5 border-b border-border/40">
            {hoy.doctrinas.map((d, i) => (
              <button
                key={d.id}
                onClick={() => setDocSel(i)}
                className={cn("text-[10px] font-mono px-2 py-1 border transition-colors", i === docSel ? "text-black font-bold" : "text-muted-foreground hover:text-foreground border-border")}
                style={i === docSel ? { background: RAMA_COLOR[d.rama], borderColor: RAMA_COLOR[d.rama] } : {}}
              >
                {d.nombre}
              </button>
            ))}
          </div>
          <motion.div key={doctrina.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-3 space-y-3">
            <div>
              <span className="text-[8px] font-mono px-1.5 py-0.5 border" style={{ color: RAMA_COLOR[doctrina.rama], borderColor: RAMA_COLOR[doctrina.rama] + "66" }}>
                {doctrina.rama}
              </span>
              <p className="text-[12.5px] leading-relaxed text-foreground/85 mt-1.5">{doctrina.principio}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] font-mono uppercase tracking-widest text-violet">Árbol de mejora</p>
              {doctrina.nodos.map((n, i) => (
                <motion.div
                  key={n.nombre}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.09 }}
                  className="flex items-center gap-2 border border-border/50 px-2.5 py-2 bg-black/30"
                >
                  <span className="font-mono text-[9px] w-5 h-5 flex items-center justify-center border shrink-0" style={{ borderColor: RAMA_COLOR[doctrina.rama] + "66", color: RAMA_COLOR[doctrina.rama] }}>
                    {n.coste}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-foreground">{n.nombre}</p>
                    <p className="text-[10px] text-muted-foreground">{n.efecto}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-[10px] font-mono text-muted-foreground border-t border-dashed border-border/40 pt-2">
              contra-doctrina histórica: <span className="text-foreground/80">{doctrina.contra}</span>
            </p>
          </motion.div>
        </div>

        {/* WARGAMES */}
        <div className="hud-panel border-violet-hud/40 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60 bg-violet-hud/5 flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-violet" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Mesa de wargames</h4>
          </div>
          <div className="divide-y divide-border/40">
            {hoy.escenarios.map((e, i) => (
              <button
                key={e.id}
                onClick={() => setEscSel(i)}
                className={cn("w-full text-left px-3 py-2 hover:bg-violet-hud/5 transition-colors", i === escSel && "bg-violet-hud/10")}
              >
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-semibold text-foreground flex-1">{e.titulo}</p>
                  <span className="text-[9px] font-mono text-amber shrink-0">{"★".repeat(e.dificultad)}{"☆".repeat(5 - e.dificultad)}</span>
                </div>
                <p className="text-[9px] font-mono text-muted-foreground">{e.turns} turnos · dificultad {e.dificultad}/5</p>
              </button>
            ))}
          </div>
          <motion.div key={escenario.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 space-y-2 bg-black/20 border-t border-border/40">
            <div className="grid grid-cols-2 gap-2">
              <div className="border-l-2 pl-2" style={{ borderColor: "#4D9DFF" }}>
                <p className="text-[8px] font-mono uppercase text-muted-foreground">Fuerza azul</p>
                <p className="text-[11px] text-foreground/85 leading-snug">{escenario.fuerzas.azul}</p>
              </div>
              <div className="border-l-2 pl-2" style={{ borderColor: "#FF4D4D" }}>
                <p className="text-[8px] font-mono uppercase text-muted-foreground">Fuerza roja</p>
                <p className="text-[11px] text-foreground/85 leading-snug">{escenario.fuerzas.rojo}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[8px] font-mono uppercase text-blue-400">Objetivo azul</p>
                <p className="text-[10.5px] text-foreground/75 leading-snug">{escenario.objetivoAzul}</p>
              </div>
              <div>
                <p className="text-[8px] font-mono uppercase text-red">Objetivo rojo</p>
                <p className="text-[10.5px] text-foreground/75 leading-snug">{escenario.objetivoRojo}</p>
              </div>
            </div>
            <p className="text-[10px] font-mono text-amber border border-amber/40 px-2 py-1.5 bg-amber-hud/5">
              regla especial: {escenario.reglaEspecial}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3">
        {/* LECCIONES */}
        <div className="hud-panel border-border/60 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">Lecciones del aula</h4>
          </div>
          <div className="divide-y divide-border/40">
            {hoy.lecciones.map((l, i) => (
              <motion.div key={l.titulo} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="px-4 py-3">
                <p className="text-[13px] font-bold text-foreground">{i + 1}. {l.titulo}</p>
                <p className="text-[12px] leading-relaxed text-foreground/70 mt-1">{l.cuerpo}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RANKING DE GENERALES */}
        <div className="hud-panel border-amber-hud/40 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60 bg-amber-hud/5 flex items-center gap-1.5">
            <Medal className="w-3.5 h-3.5 text-amber" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Tabla de generales</h4>
          </div>
          <div className="divide-y divide-border/40">
            {hoy.generales.slice(0, 3).map((g, i) => (
              <div key={g.nombre} className="px-3 py-2 flex items-center gap-2.5">
                <span className="text-[13px] font-black w-6 text-center text-amber">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-foreground truncate">{g.nombre}</p>
                  <p className="text-[9px] font-mono text-muted-foreground">{g.doctrinaFav}</p>
                </div>
                <span className="text-[12px] font-mono text-foreground/80">{g.victorias} V</span>
              </div>
            ))}
            {/* TU — posicion del jugador, insertada por mérito */}
            <div className="px-3 py-2.5 flex items-center gap-2.5 bg-amber-hud/10 border-t-2 border-amber">
              <span className="text-[13px] font-black w-6 text-center text-amber">—</span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-amber">TU · operador de Vanguard</p>
                <p className="text-[9px] font-mono text-muted-foreground">gana wargames y sube a la tabla</p>
              </div>
              <span className="text-[12px] font-mono text-amber">¿?</span>
            </div>
            {hoy.generales.slice(3).map((g, i) => (
              <div key={g.nombre} className="px-3 py-2 flex items-center gap-2.5 opacity-80">
                <span className="text-[12px] font-bold w-6 text-center text-muted-foreground">{i + 4}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-semibold text-foreground/85 truncate">{g.nombre}</p>
                  <p className="text-[9px] font-mono text-muted-foreground">{g.doctrinaFav}</p>
                </div>
                <span className="text-[11px] font-mono text-foreground/70">{g.victorias} V</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
