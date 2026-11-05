"use client";

// v92.0 OJO DEL MUNDO — ESTRATEGIA GLOBAL (espejo del hub de estrategia y
// wargames): escuela de doctrinas con árboles de mejora, escenarios jugables
// con reglas especiales, ciclo OODA animado, lecciones tácticas y ranking de
// generales donde el jugador compite (TU).

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { GraduationCap, Swords, BrainCircuit, Medal, Repeat, X, Play } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { estrategiaDeHoy, type General, type EscenarioWargame } from "@/lib/estrategia-data";
import { useGameStore } from "@/lib/game-store";
import {
  jugadasDeTurno,
  estadoInicial,
  resolverJugada,
  veredictoDe,
  type EstadoWargame,
} from "@/lib/wargame-motor";
import { cn } from "@/lib/utils";
import { useSala3DContenido, type FilaContenido3D } from "@/components/vanguard/use-sala3d-contenido";

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
  // v313 LA ESCUELA QUE RESPIRA — EL FIN DEL CARTEL: la fila «TU» ya no es
  // un «¿?» decorativo; sube a la tabla con las victorias REALES de conquista
  // del operador (game-store) y el puesto que esas victorias le dan entre las
  // leyendas. Progreso de verdad, no carteles (la ley de la v216).
  const victoriasTu = useGameStore((s) => s.conquestWins);
  const [mesa, setMesa] = useState<EscenarioWargame | null>(null);
  const generalesOrdenados = useMemo<General[]>(() => {
    const tu: General = { nombre: "TU · operador de Vanguard", victorias: victoriasTu, doctrinaFav: "conquista en vivo", eres: true };
    return [...hoy.generales, tu].sort((a, b) => b.victorias - a.victorias || (a.eres ? 1 : -1));
  }, [hoy, victoriasTu]);

  // ciclo OODA en marcha perpetua
  useEffect(() => {
    const iv = setInterval(() => setOodaFase((f) => (f + 1) % 4), 2600);
    return () => clearInterval(iv);
  }, []);

  const doctrina = hoy.doctrinas[docSel];
  const escenario = hoy.escenarios[escSel];

  // v168: PARIDAD 2D→3D — la escuela del mando en volumen: OODA, wargames y tabla real
  const filas3D = useMemo<FilaContenido3D[]>(() => {
    const filas: FilaContenido3D[] = [
      ...hoy.ooda.map((f, i): FilaContenido3D => ({
        t: `${i + 1} · ${f.fase}`,
        color: "#7AB8FF",
        d: f.texto,
      })),
      ...hoy.escenarios.slice(0, 4).map((e, i): FilaContenido3D => ({
        t: e.titulo,
        v: `${e.turns} TURNOS`,
        p: e.dificultad * 20,
        color: i === escSel ? "#F5C542" : "#A855F7",
        d: `dificultad ${e.dificultad}/5 · regla especial: ${e.reglaEspecial} · ${e.fuerzas.azul} contra ${e.fuerzas.rojo}`,
        a: "elegir",
      })),
      {
        t: `DOCTRINA EN CLASE · ${doctrina.nombre}`,
        color: RAMA_COLOR[doctrina.rama] ?? "#A855F7",
        d: `${doctrina.principio} · contra-doctrina histórica: ${doctrina.contra}`,
      },
      ...generalesOrdenados.slice(0, 3).map((g, i): FilaContenido3D => ({
        t: `${i + 1}. ${g.nombre}`,
        v: `${g.victorias} V`,
        color: g.eres ? "#7AB8FF" : "#F5C542",
        d: g.eres ? "tus victorias REALES de conquista — el puesto lo das tú, no el cartel" : `doctrina favorita: ${g.doctrinaFav}`,
      })),
    ];
    return filas;
  }, [hoy, doctrina, escSel, generalesOrdenados]);
  useSala3DContenido(
    "estrategia",
    "ESTRATEGIA GLOBAL",
    "#A855F7",
    `${hoy.doctrinas.length} doctrinas · ${hoy.escenarios.length} wargames · el ranking donde TU compites`,
    filas3D,
  );
  // v168: "elegir" desde el 3D selecciona el mismo wargame que la mesa 2D
  // (offset 4: las 4 fases OODA ocupan 0-3, los escenarios empiezan en idx 4)
  useEffect(() => {
    const onAccion = (e: Event) => {
      const d = (e as CustomEvent<{ tab: string; accion: string; idx: number }>).detail;
      if (d?.tab !== "estrategia" || d.accion !== "elegir") return;
      const item = hoy.escenarios[d.idx - 4];
      if (item) setEscSel(hoy.escenarios.indexOf(item));
    };
    window.addEventListener("vg:sala3d-accion", onAccion);
    return () => window.removeEventListener("vg:sala3d-accion", onAccion);
  }, [hoy]);

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
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Mesa de wargames <span className="text-[9px] font-mono text-muted-foreground font-normal">· hoy tocan {hoy.escenarios.length} de 10</span></h4>
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
            {/* v314 LA MESA VIVA: el escenario deja de ser ficha — se juega */}
            <button
              onClick={() => setMesa(escenario)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-violet-hud bg-violet-hud/20 text-violet hover:bg-violet-hud/40 transition-colors text-[11px] font-mono uppercase tracking-wider"
            >
              <Play className="w-3.5 h-3.5" /> jugar esta mesa · {escenario.turns} turnos
            </button>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3">
        {/* LECCIONES */}
        <div className="hud-panel border-border/60 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">Lecciones del aula <span className="text-[9px] font-mono text-muted-foreground font-normal">· {hoy.lecciones.length} de 10 cada día</span></h4>
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
            {generalesOrdenados.map((g, i) => (
              <div key={g.nombre} className={cn("px-3 py-2 flex items-center gap-2.5", g.eres ? "bg-amber-hud/10 border-t-2 border-amber" : i >= 3 && "opacity-80")}>
                <span className={cn("font-black w-6 text-center", g.eres || i < 3 ? "text-[13px] text-amber" : "text-[12px] text-muted-foreground")}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate", g.eres ? "text-[12px] font-bold text-amber" : i < 3 ? "text-[12px] font-semibold text-foreground" : "text-[11.5px] font-semibold text-foreground/85")}>
                    {g.nombre}{g.eres && <span className="ml-1.5 text-[8px] font-mono px-1 py-0.5 border border-amber/50 text-amber uppercase">real</span>}
                  </p>
                  <p className="text-[9px] font-mono text-muted-foreground">{g.doctrinaFav}</p>
                </div>
                <span className={cn("font-mono", g.eres || i < 3 ? "text-[12px] text-foreground/90" : "text-[11px] text-foreground/70")}>{g.victorias} V</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* v314: la mesa viva — el portal libra la mesa del wrapper de transición
          (la misma cura del ancla robada que la cámara de la v135) */}
      {mesa && <MesaWargame esc={mesa} onCerrar={() => setMesa(null)} />}
    </div>
  );
}

// v314.0 LA MESA VIVA — el wargame por decisiones: el operador elige la
// jugada de cada turno y el motor determinista (wargame-motor, cero
// Math.random) mueve el frente y narra. Recompensa honesta por la tienda
// del juego (addCoins/addXp) SOLO en el handler de la jugada final — cero
// escrituras de estado en efectos (la ley del censo).
function MesaWargame({ esc, onCerrar }: { esc: EscenarioWargame; onCerrar: () => void }) {
  const [estado, setEstado] = useState<EstadoWargame>(() => estadoInicial(esc));
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);

  // Escape honesto + el fondo deja de desplazar mientras la mesa está abierta
  // (efecto PURO: ninguna escritura de estado — la ley del censo)
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", alTeclear);
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = previo;
    };
  }, [onCerrar]);

  const jugar = (idx: number) => {
    const jugada = jugadasDeTurno(esc, estado.turno)[idx];
    const siguiente = resolverJugada(esc, estado, jugada);
    setEstado(siguiente);
    if (siguiente.cerrada) {
      const v = veredictoDe(esc, siguiente);
      addCoins(v.botinCoins, `wargame ${esc.id} — veredicto de la mesa`);
      addXp(v.botinXp);
    }
  };

  const veredicto = estado.cerrada ? veredictoDe(esc, estado) : null;
  const jugadas = estado.cerrada ? [] : jugadasDeTurno(esc, estado.turno);
  const RIESGO_COLOR: Record<string, string> = { bajo: "#34C759", medio: "#FFC94D", alto: "#FF3B30" };

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-2 sm:p-6" role="dialog" aria-label={`Mesa de wargame: ${esc.titulo}`}>
      <button aria-label="Cerrar mesa" onClick={onCerrar} className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-default" />
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto hud-panel border-violet-hud shadow-[0_30px_120px_-20px_rgba(0,0,0,0.95)]">
        {/* cabecera */}
        <div className="sticky top-0 z-10 flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-violet-hud/60 bg-[#0B0B12]/95 backdrop-blur-sm">
          <div className="w-8 h-8 hud-corner flex items-center justify-center border-violet-hud text-violet flex-shrink-0">
            <Swords className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-caviar text-sm sm:text-base font-bold tracking-[0.14em] uppercase text-violet truncate">{esc.titulo}</h2>
            <p className="text-[9px] font-mono text-muted-foreground uppercase truncate">mesa viva · {esc.fuerzas.azul} contra {esc.fuerzas.rojo}</p>
          </div>
          <button onClick={onCerrar} title="Cerrar (Esc)" className="w-7 h-7 hud-corner flex items-center justify-center border-violet-hud text-violet hover:bg-violet-hud transition-colors flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          {/* el frente: moral, reserva y objetivos con barras vivas */}
          <div className="grid grid-cols-2 gap-2">
            <div className="hud-corner p-2 space-y-1.5">
              <p className="text-[8px] font-mono uppercase text-muted-foreground flex justify-between"><span>moral azul</span><span className="text-blue-400 font-bold tabular-nums">{estado.moralAzul}</span></p>
              <div className="h-1.5 bg-secondary overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${estado.moralAzul}%`, background: "#4D9DFF" }} /></div>
              <p className="text-[8px] font-mono uppercase text-muted-foreground flex justify-between"><span>objetivo azul</span><span className="text-blue-400 font-bold tabular-nums">{estado.objetivoAzul}/100</span></p>
              <div className="h-1.5 bg-secondary overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${estado.objetivoAzul}%`, background: "#4D9DFF" }} /></div>
            </div>
            <div className="hud-corner p-2 space-y-1.5">
              <p className="text-[8px] font-mono uppercase text-muted-foreground flex justify-between"><span>moral roja</span><span className="text-red font-bold tabular-nums">{estado.moralRojo}</span></p>
              <div className="h-1.5 bg-secondary overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${estado.moralRojo}%`, background: "#FF3B30" }} /></div>
              <p className="text-[8px] font-mono uppercase text-muted-foreground flex justify-between"><span>reserva</span><span className="text-amber font-bold tabular-nums">{estado.reserva}</span></p>
              <div className="h-1.5 bg-secondary overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${estado.reserva}%`, background: "#FFC94D" }} /></div>
            </div>
          </div>

          {/* la bitácora de la mesa */}
          <div className="hud-corner p-2 max-h-44 overflow-y-auto space-y-1">
            {estado.bitacora.slice(-8).map((l, i) => (
              <p key={`${l.turno}-${i}`} className={cn("text-[10.5px] font-mono leading-snug", l.tono === "azul" ? "text-blue-400" : l.tono === "rojo" ? "text-red" : "text-amber/90")}>
                <span className="text-muted-foreground">T{String(l.turno).padStart(2, "0")} ·</span> {l.texto}
              </p>
            ))}
          </div>

          {/* las jugadas de la mesa (o el veredicto) */}
          {estado.cerrada && veredicto ? (
            <div className={cn("hud-corner p-3 space-y-2", veredicto.ganaAzul ? "v135-veredicto" : "")}>
              <p className={cn("text-sm font-caviar font-bold uppercase tracking-wide", veredicto.ganaAzul ? "text-blue-400" : veredicto.ganaRojo ? "text-red" : "text-amber")}>
                {veredicto.ganaAzul ? "objetivo azul cumplido" : veredicto.ganaRojo ? "el rojo impone su objetivo" : "la mesa cierra en empate"}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground">
                botín de la mesa: <span className="text-amber font-bold">+{veredicto.botinCoins} monedas</span> · <span className="text-violet font-bold">+{veredicto.botinXp} XP</span> — cobrado en tu cuenta de Vanguard
              </p>
              <p className="text-[9px] font-mono text-muted-foreground/70 border border-border/60 px-1.5 py-0.5 inline-block">partida determinista · las mismas jugadas reproducen la misma mesa · ficción de la escuela</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[9px] font-mono uppercase tracking-widest text-violet">turno {estado.turno} de {estado.total} — elige la jugada</p>
              {jugadas.map((j, i) => (
                <button key={j.id} onClick={() => jugar(i)} className="w-full text-left flex items-center gap-2.5 border border-border/60 px-2.5 py-2 hover:bg-violet-hud/10 transition-colors">
                  <span className="w-14 text-center text-[8px] font-mono uppercase px-1 py-0.5 border flex-shrink-0" style={{ color: RIESGO_COLOR[j.riesgo], borderColor: RIESGO_COLOR[j.riesgo] + "66" }}>{j.riesgo}</span>
                  <span className="min-w-0">
                    <span className="block text-[12px] font-semibold text-foreground">{j.nombre}</span>
                    <span className="block text-[10px] text-muted-foreground leading-snug">{j.descripcion}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
