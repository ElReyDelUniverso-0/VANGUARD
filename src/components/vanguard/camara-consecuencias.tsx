"use client";

// ============================================================
// v135.0 NEXUS-HYPNOS — CÁMARA DE CONSECUENCIAS (EFECTO MARIPOSA)
// "Algoritmo Efecto Mariposa · Simulador de Consecuencias en Vivo":
// al lado de un cable real aparece [SIMULAR ESCALADA] y abre esta
// cámara: el cable se acopla a un escenario del LABORATORIO DEL
// DESTINO (whatif.ts v100 — el motor real de la casa, con
// atrición de Lanchester, escalera de escalada 1-6 y Monte Carlo
// de 24 semillas) y el usuario juega a ser Dios:
//   · elige la PERTURBACIÓN (refuerzos, sanciones, movilización...)
//   · ajusta la DOSIS (1-5) y el HORIZONTE (90/180/240 días)
//   · la simulación corre día a día ante sus ojos: el frente se
//     mueve, los misiles vuelan en escalada alta, los contadores
//     de bajas/coste suben y los eventos caen en el teletipo
// REGLA DE LA CASA (whatif.ts): esto es SIMULACIÓN, no predicción
// — cada resultado lleva su sello y su desglose.
// 60 FPS: los pasos avanzan por estado pequeño; todo movimiento
// visual vive en CSS transform/opacity.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { X, FlaskConical, Dna, CalendarClock, Gauge, Skull, Banknote, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  simular,
  LAB_ESCENARIOS,
  PERTURBACIONES,
  NIVELES_ESCALADA,
  type ConfigLab,
  type PerturbacionId,
} from "@/lib/whatif";

export interface CableSim {
  id: string;
  titulo: string;
  tag: string | null;
}

// el cable manda: el tag táctico elige el escenario y la primera perturbación
function defaultsDeTag(tag: string | null | undefined): { escId: string; pert: PerturbacionId } {
  const t = (tag || "").toUpperCase();
  if (t === "CIBER") return { escId: "karsk", pert: "golpe-retaguardia" };
  if (t === "ECONOMIA" || t === "MERCADOS") return { escId: "estrecho", pert: "sanciones-totales" };
  if (t === "DIPLOMACIA") return { escId: "estrecho", pert: "alto-fuego" };
  if (t === "HUMANITARIO") return { escId: "valle", pert: "movilizacion-total" };
  if (t === "ALERTA" || t === "ULTIMA_HORA" || t === "FLASH") return { escId: "karsk", pert: "capital-amenazada" };
  return { escId: "karsk", pert: "refuerzos-externos" };
}

const TIPO_COLOR: Record<string, string> = {
  militar: "#FF3B30", diplomacia: "#5EEAD4", economia: "#34C759", ciber: "#3DDCFF",
  humanitario: "#C4A2FF", nuclear: "#FF0055", espacio: "#A8C7FF", social: "#FFD166", giro: "#FF8A2A",
};

export function CamaraConsecuencias({ cable, onCerrar }: { cable: CableSim | null; onCerrar: () => void }) {
  const reduced = useReducedMotion();
  const [escId, setEscId] = useState("karsk");
  const [pert, setPert] = useState<PerturbacionId>("capital-amenazada");
  const [dosis, setDosis] = useState(3);
  const [horizonte, setHorizonte] = useState<ConfigLab["horizonte"]>(180);
  const [paso, setPaso] = useState(0);

  // al abrir un cable nuevo: el tag decide el arranque
  useEffect(() => {
    if (!cable) return;
    const d = defaultsDeTag(cable.tag);
    setEscId(d.escId);
    setPert(d.pert);
    setDosis(3);
    setHorizonte(180);
  }, [cable]);

  const cfg: ConfigLab = useMemo(() => ({ crisisId: escId, perturbacion: pert, dosis, horizonte }), [escId, pert, dosis, horizonte]);
  const resultado = useMemo(() => (cable ? simular(cfg) : null), [cfg, cable]);

  // la proyección corre día a día (el paso avanza con un reloj pequeño)
  useEffect(() => {
    if (!resultado) return;
    const fin = resultado.serie.length - 1;
    if (reduced) { setPaso(fin); return; }
    setPaso(0);
    const iv = window.setInterval(() => {
      setPaso((p) => {
        if (p >= fin) { window.clearInterval(iv); return p; }
        return p + 1;
      });
    }, Math.max(90, Math.min(340, 5200 / fin)));
    return () => window.clearInterval(iv);
  }, [resultado, reduced]);

  // Escape honesto + el fondo deja de desplazar mientras la cámara está abierta
  useEffect(() => {
    if (!cable) return;
    const alTeclear = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", alTeclear);
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = previo;
    };
  }, [cable, onCerrar]);

  if (!cable || !resultado) return null;

  const esc = LAB_ESCENARIOS.find((e) => e.id === escId) ?? LAB_ESCENARIOS[0];
  const finSerie = resultado.serie.length - 1;
  const hoy = resultado.serie[Math.min(paso, finSerie)];
  const esFinal = paso >= finSerie;
  const nivel = NIVELES_ESCALADA[Math.min(hoy.escalada, 6) - 1];
  const eventosHoy = resultado.eventos.filter((e) => e.dia <= hoy.dia).slice(-3).reverse();
  const pinA = esc.pins[0], pinB = esc.pins[1];
  const xFrente = pinA.x + (pinB.x - pinA.x) * (hoy.frente / 100);
  const misiles = hoy.escalada >= 4;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-2 sm:p-6" role="dialog" aria-label="Cámara de Consecuencias">
      <button aria-label="Cerrar cámara" onClick={onCerrar} className="absolute inset-0 bg-black/78 backdrop-blur-md v135-velo cursor-default" />
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto hud-panel border-amber-hud shadow-[0_30px_120px_-20px_rgba(0,0,0,0.95)]">
        {/* cabecera */}
        <div className="sticky top-0 z-10 flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-amber-hud bg-[#0B0B12]/95 backdrop-blur-sm">
          <div className="w-8 h-8 hud-corner flex items-center justify-center border-amber-hud text-amber flex-shrink-0">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-caviar text-sm sm:text-base font-bold tracking-[0.14em] uppercase text-amber nexus-letra-parent">
              <span className="nexus-letra">Cámara de Consecuencias</span>
            </h2>
            <p className="text-[9px] font-mono text-muted-foreground uppercase truncate">efecto mariposa · «{cable.titulo}»</p>
          </div>
          <button onClick={onCerrar} title="Cerrar (Esc)" className="w-7 h-7 hud-corner flex items-center justify-center border-amber-hud text-amber hover:bg-amber-hud transition-colors flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          {/* controles del destino */}
          <div className="hud-corner p-2.5 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest w-full">Escenario del laboratorio</span>
              {LAB_ESCENARIOS.map((e) => (
                <button key={e.id} onClick={() => setEscId(e.id)}
                  className={cn("px-2 py-0.5 border text-[9px] font-mono uppercase transition-colors",
                    escId === e.id ? "border-amber-hud text-amber bg-amber-hud/40" : "border-border text-muted-foreground hover:text-foreground")}>
                  {e.nombre.replace("Guerra del ", "").replace("Crisis del ", "")}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest w-full">¿Y si...</span>
              {PERTURBACIONES.map((p) => (
                <button key={p.id} onClick={() => setPert(p.id)} title={p.descripcion}
                  className={cn("px-2 py-0.5 border text-[9px] font-mono uppercase transition-colors",
                    pert === p.id ? "border-crisis-hud text-crisis bg-crisis-hud/30" : "border-border text-muted-foreground hover:text-foreground")}>
                  {p.nombre}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3 h-3 text-amber" />
                <span className="text-[9px] font-mono text-muted-foreground uppercase">dosis</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setDosis(n)}
                    className={cn("w-5 h-5 border text-[9px] font-mono transition-colors",
                      dosis === n ? "border-amber-hud text-amber bg-amber-hud/40" : "border-border text-muted-foreground hover:text-foreground")}>
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarClock className="w-3 h-3 text-amber" />
                <span className="text-[9px] font-mono text-muted-foreground uppercase">horizonte</span>
                {([90, 180, 240] as const).map((h) => (
                  <button key={h} onClick={() => setHorizonte(h)}
                    className={cn("px-1.5 h-5 border text-[9px] font-mono transition-colors",
                      horizonte === h ? "border-amber-hud text-amber bg-amber-hud/40" : "border-border text-muted-foreground hover:text-foreground")}>
                    {h}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* el teatro: el frente se mueve y los misiles vuelan */}
          <div className="hud-corner p-2 relative overflow-hidden">
            <svg viewBox="0 0 100 58" className="w-full v135-teatro" aria-hidden>
              <defs>
                <pattern id="v135-malla" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M8 0H0V8" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
                </pattern>
              </defs>
              <rect width="100" height="58" fill="url(#v135-malla)" />
              {/* línea de frente viva */}
              <line x1={xFrente} y1="6" x2={xFrente} y2="52" stroke={nivel.color} strokeWidth="0.9" strokeDasharray="3 2" className="v135-frente" style={{ filter: `drop-shadow(0 0 3px ${nivel.color})` }} />
              <text x={xFrente + 1.2} y="9.5" fill={nivel.color} fontSize="3.4" fontFamily="monospace">{hoy.frente.toFixed(0)}%</text>
              {/* capitales */}
              <circle cx={pinA.x} cy={pinA.y} r="2.2" fill={esc.A.acento} className="v135-pulso" style={{ transformOrigin: `${pinA.x}px ${pinA.y}px` }} />
              <circle cx={pinB.x} cy={pinB.y} r="2.2" fill={esc.B.acento} className="v135-pulso" style={{ transformOrigin: `${pinB.x}px ${pinB.y}px`, animationDelay: "0.8s" }} />
              <text x={pinA.x - 1} y={pinA.y + 6.4} fill={esc.A.acento} fontSize="3" fontFamily="monospace">{esc.A.nombre.slice(0, 14)}</text>
              <text x={pinB.x - 12} y={pinB.y + 6.4} fill={esc.B.acento} fontSize="3" fontFamily="monospace" textAnchor="start">{esc.B.nombre.slice(0, 14)}</text>
              {/* arcos de misiles en escalada alta */}
              {misiles && (
                <>
                  <path d={`M ${pinB.x} ${pinB.y} Q 50 4 ${pinA.x} ${pinA.y}`} fill="none" stroke="#FF3B30" strokeWidth="0.6" strokeDasharray="4 3" className="v135-misil" />
                  <path d={`M ${pinA.x + 4} ${pinA.y + 8} Q 52 14 ${pinB.x - 4} ${pinB.y + 8}`} fill="none" stroke="#FF8A2A" strokeWidth="0.5" strokeDasharray="4 3" className="v135-misil v135-misil-2" />
                </>
              )}
            </svg>
            {/* sello de simulación */}
            <span className="absolute top-2 right-2 text-[8px] font-mono uppercase tracking-[0.2em] text-muted-foreground/70 border border-border/60 px-1.5 py-0.5">simulación · no predicción</span>
          </div>

          {/* escalera de escalada */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Escalera de escalada</span>
              <span className="text-[10px] font-mono font-bold uppercase" style={{ color: nivel.color }}>{nivel.nombre} · N{hoy.escalada}</span>
            </div>
            <div className="flex gap-1">
              {NIVELES_ESCALADA.map((n) => (
                <div key={n.n} className="flex-1 h-1.5 transition-all duration-300"
                  style={{ background: n.n <= hoy.escalada ? n.color : "rgba(255,255,255,0.08)", boxShadow: n.n === hoy.escalada ? `0 0 8px ${n.color}` : "none" }} />
              ))}
            </div>
          </div>

          {/* contadores vivos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="hud-corner p-2">
              <p className="text-[8px] font-mono text-muted-foreground uppercase">día</p>
              <p className="text-sm font-mono text-amber font-bold tabular-nums">{String(hoy.dia).padStart(3, "0")}<span className="text-[10px] text-muted-foreground">/{resultado.serie[finSerie].dia}</span></p>
            </div>
            <div className="hud-corner p-2">
              <p className="text-[8px] font-mono text-muted-foreground uppercase flex items-center gap-1"><Skull className="w-2.5 h-2.5" /> bajas totales</p>
              <p className="text-sm font-mono text-crisis font-bold tabular-nums">{(hoy.bajasA + hoy.bajasB).toLocaleString("es")}</p>
            </div>
            <div className="hud-corner p-2">
              <p className="text-[8px] font-mono text-muted-foreground uppercase flex items-center gap-1"><Banknote className="w-2.5 h-2.5" /> coste</p>
              <p className="text-sm font-mono text-amber font-bold tabular-nums">${hoy.coste.toFixed(0)}B</p>
            </div>
            <div className="hud-corner p-2">
              <p className="text-[8px] font-mono text-muted-foreground uppercase">frente bajo B</p>
              <p className="text-sm font-mono text-cyan-hud font-bold tabular-nums">{hoy.frente.toFixed(0)}%</p>
            </div>
          </div>

          {/* teletipo de eventos */}
          <div className="hud-corner p-2 min-h-[64px]">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1"><Radio className="w-3 h-3" /> interceptos de la simulación</p>
            <div className="space-y-1">
              {eventosHoy.map((e, i) => (
                <p key={`${e.dia}-${i}`} className="text-[10px] font-mono leading-snug flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: e.color || TIPO_COLOR[e.tipo] || "#FF8A2A" }} />
                  <span className="text-foreground/90"><span className="text-muted-foreground">D{String(e.dia).padStart(3, "0")} ·</span> {e.texto}</span>
                </p>
              ))}
              {eventosHoy.length === 0 && <p className="text-[10px] font-mono text-muted-foreground">los primeros días transcurren en silencio...</p>}
            </div>
          </div>

          {/* el final: veredicto + monte carlo */}
          {esFinal && (
            <div className="hud-corner p-3 space-y-2 v135-veredicto">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">final proyectado · día {resultado.fin.dia}</p>
                  <p className="text-sm font-caviar font-bold uppercase tracking-wide text-amber">{resultado.fin.nombre}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{resultado.fin.detalle}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-mono text-muted-foreground uppercase">lo que cambia por tu «y si»</p>
                  <p className="text-[10px] font-mono text-foreground/90">frente {resultado.deltas.frenteFinal >= 0 ? "+" : ""}{resultado.deltas.frenteFinal.toFixed(1)}pp · coste {resultado.deltas.coste >= 0 ? "+" : ""}{resultado.deltas.coste.toFixed(0)}%</p>
                </div>
              </div>
              <div className="space-y-1">
                {resultado.monteCarlo.slice(0, 4).map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-muted-foreground w-40 sm:w-56 truncate">{m.nombre}</span>
                    <div className="flex-1 h-1.5 bg-secondary overflow-hidden">
                      <div className="h-full v135-barra" style={{ width: `${Math.round(m.probabilidad * 100)}%`, background: ["#FF3B30", "#FF8A2A", "#FFD166", "#3DDC97"][i % 4] }} />
                    </div>
                    <span className="text-[9px] font-mono text-foreground/80 w-9 text-right tabular-nums">{Math.round(m.probabilidad * 100)}%</span>
                  </div>
                ))}
              </div>
              <p className="text-[9px] font-mono text-muted-foreground/80 flex items-center gap-1"><Dna className="w-3 h-3" /> riesgo del desenlace {resultado.veredicto.riesgo}% · confianza de la red {resultado.veredicto.confianza}% · 24 semillas deterministas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
