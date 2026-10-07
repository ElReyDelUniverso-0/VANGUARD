"use client";

// v81.0 MAPAS DE GUERRA — SALA DE OPERACIONES
// El tablero táctico de Vanguard: operaciones militares con fases, unidades
// que cruzan el tablero en vivo (jets con animateMotion, columnas en marcha),
// lanzamiento de misiles al pulsar EJECUTAR, flash de impacto, recompensas y
// log de comunicaciones que no calla nunca. Todo en el navegador, 60fps.

import { useEffect, useMemo, useRef, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Radio, Rocket, Timer, TrendingUp, Trophy, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";

type OpEstado = "PLANIFICADA" | "EN CURSO" | "EXITO";

interface Operacion {
  id: string;
  nombre: string;
  teatro: string;
  x: number; // posición en el tablero (viewBox 1000x520)
  y: number;
  base: [number, number]; // base de partida del asalto
  recompensa: number; // monedas de primera vez
  xp: number;
}

const OPERACIONES: Operacion[] = [
  { id: "op-escudo", nombre: "ESCUDO DEL ESTRECHO", teatro: "Teatro Marítimo", x: 262, y: 168, base: [96, 428], recompensa: 150, xp: 60 },
  { id: "op-colmena", nombre: "COLMENA SILENCIOSA", teatro: "Teatro Ciber", x: 528, y: 112, base: [200, 452], recompensa: 180, xp: 75 },
  { id: "op-torrena", nombre: "TORRENA ROJA", teatro: "Teatro Norte", x: 742, y: 236, base: [908, 430], recompensa: 160, xp: 65 },
  { id: "op-hielo", nombre: "CADENA DE HIELO", teatro: "Teatro Polar", x: 442, y: 330, base: [806, 462], recompensa: 140, xp: 55 },
];

const FASES = ["INFILTRACIÓN", "ASEGURAMIENTO", "EXTRACCIÓN"];

const LOG_POOL = [
  "SATÉLITE VANGUARD-4 SOBREVUELA EL TEATRO",
  "CONVOY LOGÍSTICO EN RUTA · ESCORT ASIGNADO",
  "INTERCEPTADO TRÁFICO DE RADIO ENEMIGO",
  "DRON DE RECONOCIMIENTO EN POSICIÓN",
  "METEOROLOGÍA: VENTANA DE ATAQUE ABIERTA",
  "FLOTA DE DISUASIÓN EN ESTACIÓN",
  "JAMMING ENEMIGO DETECTADO · CONTRAMEDIDA OK",
  "ALIADO CONFIRMA PERMISO DE SOBREVUELO",
  "SEÑAL TÉRMICA ANÓMALA EN EL SECTOR E2",
  "CIFROSO CANAL DE MANDO SIN INTERFERENCIAS",
  "REABASTECIMIENTO AÉREO COMPLETADO",
  "SONAR DETECTA CONTACTO EN COTA -80",
];

const LS_KEY = "vanguard-operaciones-v81";
// primera vez por operación en 24h paga grande; repeticiones pagan menos
function loadPremios(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "") as Record<string, number>; } catch { return {}; }
}

const W = 1000;
const H = 520;

function arco(from: [number, number], to: [number, number], lift = 90): string {
  const mx = (from[0] + to[0]) / 2;
  const my = Math.min(from[1], to[1]) - lift;
  return `M ${from[0]} ${from[1]} Q ${mx} ${my} ${to[0]} ${to[1]}`;
}

export function OpsPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  // progreso 0-100 por operación
  const [prog, setProg] = useState<Record<string, number>>({});
  const [estados, setEstados] = useState<Record<string, OpEstado>>({});
  const [log, setLog] = useState<string[]>([...LOG_POOL].slice(0, 3));
  const [misil, setMisil] = useState<{ opId: string; key: number } | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [ciclo, setCiclo] = useState(0); // reloj de mando 0-100
  const premiosRef = useRef<Record<string, number>>(loadPremios());
  const exitoAtRef = useRef<Record<string, number>>({});
  const misilTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const estadosRef = useRef(estados);
  useEffect(() => { estadosRef.current = estados; }, [estados]);

  // reloj de mando: ciclo continuo de 60s (decorativo pero vivo)
  useEffect(() => {
    const iv = setInterval(() => setCiclo((c) => (c + 100 / 60) % 100), 1000);
    return () => clearInterval(iv);
  }, []);

  // motor de la guerra: las operaciones EN CURSO avanzan solas
  useEffect(() => {
    const iv = setInterval(() => {
      setProg((prev) => {
        const next = { ...prev };
        let cambio = false;
        for (const op of OPERACIONES) {
          if (estadosRef.current[op.id] !== "EN CURSO") continue;
          const p = Math.min(100, (next[op.id] ?? 0) + 4.2);
          next[op.id] = p;
          cambio = true;
          if (p >= 100) {
            const primera = !premiosRef.current[op.id] || Date.now() - premiosRef.current[op.id] > 86_400_000;
            const pago = primera ? op.recompensa : 40;
            const xpPago = primera ? op.xp : 15;
            if (primera) {
              premiosRef.current[op.id] = Date.now();
              try { localStorage.setItem(LS_KEY, JSON.stringify(premiosRef.current)); } catch { /* sin storage */ }
            }
            addCoins(pago, `OPERACIONES: ${op.nombre} completada`);
            addXp(xpPago);
            sfx.reward();
            toast.success(`${op.nombre} · ÉXITO +${pago} mon +${xpPago} xp`);
            setEstados((e) => ({ ...e, [op.id]: "EXITO" }));
            exitoAtRef.current[op.id] = Date.now();
            setLog((l) => [`OBJETIVO CUMPLIDO · ${op.nombre} · +${pago} mon`, ...l].slice(0, 7));
          }
        }
        return cambio ? next : prev;
      });
    }, 1200);
    return () => clearInterval(iv);
  }, [addCoins, addXp]);

  // las operaciones con ÉXITO se celebran 18s antes de volver a PLANIFICADA — la guerra no para
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      const caducados = Object.entries(exitoAtRef.current).filter(([, ts]) => now - ts > 18_000);
      if (caducados.length === 0) return;
      setEstados((e) => {
        const next = { ...e };
        for (const [id] of caducados) {
          if (e[id] === "EXITO") {
            next[id] = "PLANIFICADA";
            setProg((p) => ({ ...p, [id]: 0 }));
            delete exitoAtRef.current[id];
          }
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  // log de comunicaciones: entra un mensaje nuevo cada 8s
  useEffect(() => {
    const iv = setInterval(() => {
      setLog((l) => [LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)], ...l].slice(0, 7));
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => () => { if (misilTimer.current) clearTimeout(misilTimer.current); }, []);

  const lanzar = (op: Operacion) => {
    if (estados[op.id] === "EN CURSO") return;
    sfx.click();
    setEstados((e) => ({ ...e, [op.id]: "EN CURSO" }));
    setProg((p) => ({ ...p, [op.id]: 2 }));
    setMisil({ opId: op.id, key: Date.now() });
    if (misilTimer.current) clearTimeout(misilTimer.current);
    misilTimer.current = setTimeout(() => setFlash(op.id), 1700);
    misilTimer.current = setTimeout(() => { setFlash(null); setMisil(null); }, 2500);
    setLog((l) => [`ORDEN DE EJECUCIÓN · ${op.nombre} · UNIDADES DESPLEGADAS`, ...l].slice(0, 7));
    toast(`OPERACIÓN ${op.nombre} EN CURSO — sigue las unidades en el tablero`);
  };

  const enCurso = useMemo(() => OPERACIONES.filter((o) => estados[o.id] === "EN CURSO").length, [estados]);
  const exitos = useMemo(() => OPERACIONES.filter((o) => estados[o.id] === "EXITO").length, [estados]);

  const fase = (p: number) => (p < 34 ? 0 : p < 67 ? 1 : 2);

  return (
    <div className="space-y-4">
      <HeroOro panel="operaciones" />
      <PanelHeader
        title="Sala de Operaciones"
        subtitle={`Tablero táctico en vivo · ${enCurso} en curso · ${exitos} objetivos cumplidos`}
        icon={<Crosshair className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-1 border border-amber-hud/60 text-amber bg-amber-hud/10">
            <span className="beacon w-1.5 h-1.5 rounded-full bg-amber" style={{ color: "#FFB020" }} />
            MANDO CONECTADO
          </span>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* ══════════ TABLERO TÁCTICO ══════════ */}
        <div className="lg:col-span-2 hud-corner relative overflow-hidden bg-black/50">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ maxHeight: "56vh" }}>
            <defs>
              <pattern id="ops-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(245,166,35,0.08)" strokeWidth="0.6" />
              </pattern>
              <filter id="ops-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.6" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <rect width={W} height={H} fill="#07090f" />
            <rect width={W} height={H} fill="url(#ops-grid)" />

            {/* etiquetas de sector A1–E3 */}
            {["A", "B", "C", "D", "E"].map((col, i) =>
              ["1", "2", "3"].map((row, j) => (
                <text key={`${col}${row}`} x={28 + i * 200} y={30 + j * 170} fill="rgba(245,166,35,0.22)" fontSize="11" fontFamily="monospace">
                  {col}{row}
                </text>
              ))
            )}

            {/* frente central en marcha */}
            <path d="M 0 300 C 220 280, 420 330, 620 296 S 900 270, 1000 292" fill="none" stroke="rgba(255,80,80,0.5)" strokeWidth="1.4" className="frente-marcha" />
            <text x={16} y={292} fill="rgba(255,80,80,0.65)" fontSize="9" fontFamily="monospace">FRENTE DE CONTACTO</text>

            {/* bases amigas con baliza */}
            {([[96, 428, "BASE ALFA"], [908, 430, "BASE BRAVO"], [200, 452, "BASE CHARLIE"], [806, 462, "BASE DELTA"]] as [number, number, string][]).map(([bx, by, nombre]) => (
              <g key={nombre}>
                <rect x={bx - 12} y={by - 8} width={24} height={16} fill="rgba(0,255,135,0.14)" stroke="#00FF87" strokeWidth="1" />
                <text x={bx} y={by + 24} fill="rgba(0,255,135,0.75)" fontSize="8.5" fontFamily="monospace" textAnchor="middle">{nombre}</text>
                <circle cx={bx} cy={by} r={5} fill="none" stroke="#00FF87" strokeWidth="0.8" className="beacon" style={{ color: "#00FF87" }} />
              </g>
            ))}

            {/* columnas en marcha hacia operaciones en curso + jets */}
            {OPERACIONES.map((op) => {
              const activa = estados[op.id] === "EN CURSO";
              const d = arco(op.base, [op.x, op.y]);
              if (!activa) {
                // ruta planificada: punteada tenue
                return <path key={`ruta-${op.id}`} d={d} fill="none" stroke="rgba(245,166,35,0.16)" strokeWidth="0.9" strokeDasharray="3 6" />;
              }
              return (
                <g key={`columna-${op.id}`}>
                  <path d={d} fill="none" stroke="rgba(255,177,32,0.5)" strokeWidth="1" strokeDasharray="8 6" className="marcha-chevron" />
                  {/* jet en vivo: cruza el tablero por el arco (SVG nativo) */}
                  <g filter="url(#ops-glow)">
                    <path d="M -7 0 L 6 0 M 0 -4.5 L 0 4.5" stroke="#FFD60A" strokeWidth="1.8" strokeLinecap="round">
                      <animateMotion dur="5.5s" repeatCount="indefinite" path={d} rotate="auto" />
                    </path>
                  </g>
                  {/* segunda ala: círculo de escolta */}
                  <circle r="2.4" fill="#FFB020" opacity="0.9">
                    <animateMotion dur="6.8s" repeatCount="indefinite" path={d} begin="-2.4s" />
                  </circle>
                </g>
              );
            })}

            {/* MISIL: se dispara al ejecutar una operación */}
            {misil && (() => {
              const op = OPERACIONES.find((o) => o.id === misil.opId);
              if (!op) return null;
              const d = arco(op.base, [op.x, op.y], 150);
              return (
                <g key={misil.key} filter="url(#ops-glow)">
                  <path d={d} fill="none" stroke="rgba(255,70,85,0.55)" strokeWidth="1.1" className="traza-misil" />
                  <circle r="3.2" fill="#FF4655">
                    <animateMotion dur="1.6s" repeatCount="1" path={d} fill="freeze" />
                  </circle>
                </g>
              );
            })()}

            {/* objetivos de las operaciones */}
            {OPERACIONES.map((op) => {
              const est = estados[op.id] ?? "PLANIFICADA";
              const p = prog[op.id] ?? 0;
              const color = est === "EXITO" ? "#00FF87" : est === "EN CURSO" ? "#FFB020" : "#8b93a7";
              return (
                <g key={op.id}>
                  {/* retícula giratoria siempre que el objetivo esté designado */}
                  <g transform={`translate(${op.x}, ${op.y})`}>
                    <g className="corona-blanco">
                      <circle r={19} fill="none" stroke={color} strokeWidth="1" strokeDasharray="9 6" opacity="0.75" />
                    </g>
                    {[0, 90, 180, 270].map((ang) => (
                      <line key={ang} x1={0} y1={-24} x2={0} y2={-17} stroke={color} strokeWidth="1.3" transform={`rotate(${ang})`} />
                    ))}
                    <circle r={est === "EN CURSO" ? 6 : 4.4} fill={color} opacity="0.95" />
                    {/* pings de sonar mientras la operación corre */}
                    {est === "EN CURSO" && (
                      <g>
                        <circle r={22} fill="none" stroke={color} strokeWidth="1" className="ping-sonar" />
                        <circle r={22} fill="none" stroke={color} strokeWidth="1" className="ping-sonar" />
                      </g>
                    )}
                    {/* flash de impacto */}
                    {flash === op.id && <circle r={30} fill="#FF4655" opacity="0.5" className="ping-sonar" />}
                    <text x={0} y={-30} fill={color} fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      {op.nombre}
                    </text>
                    <text x={0} y={38} fill={color} fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.85">
                      {est === "EN CURSO" ? `FASE ${fase(p) + 1}/3 · ${Math.round(p)}%` : est}
                    </text>
                    {/* barra de progreso bajo el objetivo */}
                    {est === "EN CURSO" && (
                      <g transform={`translate(-24, 44)`}>
                        <rect width={48} height={3} fill="rgba(255,255,255,0.12)" />
                        <rect width={48 * (p / 100)} height={3} fill={color} />
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>

          {/* overlays HUD del tablero */}
          <div className="absolute top-2 left-2 text-[10px] font-mono text-muted-foreground bg-background/80 px-2 py-1 hud-corner border-amber-hud">
            TABLERO TÁCTICO · SECTORES A1–E3 · {enCurso} EJECUCIONES
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-mono uppercase px-2 py-1 bg-background/85 border border-amber-hud/50 text-amber holo-flicker">
            <Timer className="w-3 h-3" /> CICLO DE MANDO {Math.round(ciclo)}%
          </div>
          <div className="barrido-map" />
        </div>

        {/* ══════════ ÓRDENES DEL DÍA ══════════ */}
        <div className="space-y-2.5">
          <div className="hud-panel p-3">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-4 h-4 text-amber" />
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Órdenes del día</h3>
              <Trophy className="w-3.5 h-3.5 text-amber ml-auto" />
              <span className="font-mono text-[11px] font-bold text-amber">{exitos}/4</span>
            </div>
            <div className="space-y-2">
              {OPERACIONES.map((op) => {
                const est = estados[op.id] ?? "PLANIFICADA";
                const p = Math.round(prog[op.id] ?? 0);
                const color = est === "EXITO" ? "#00FF87" : est === "EN CURSO" ? "#FFB020" : "#8b93a7";
                const f = fase(p);
                return (
                  <div key={op.id} className="escaneo-carta hud-corner p-2.5 border" style={{ borderColor: `${color}44`, background: est === "PLANIFICADA" ? "rgba(139,147,167,0.04)" : `${color}0a` }}>
                    <div className="flex items-center gap-1.5">
                      <span className="beacon w-1.5 h-1.5 rounded-full" style={{ background: color, color }} />
                      <span className="text-[11px] font-mono font-bold tracking-wide" style={{ color }}>{op.nombre}</span>
                      <span className="ml-auto text-[8px] font-mono uppercase text-muted-foreground flex items-center gap-1">
                        <Waves className="w-3 h-3" /> {op.teatro}
                      </span>
                    </div>
                    {/* fases */}
                    <div className="flex items-center gap-1 mt-1.5">
                      {FASES.map((nombre, i) => (
                        <span
                          key={nombre}
                          className={cn("flex-1 text-center text-[7.5px] font-mono uppercase py-0.5 border", est === "PLANIFICADA" && "opacity-40")}
                          style={est !== "PLANIFICADA" && i === f && est === "EN CURSO"
                            ? { borderColor: color, color, background: `${color}14` }
                            : est === "EXITO" || (est === "EN CURSO" && i < f)
                            ? { borderColor: `${color}66`, color: `${color}bb` }
                            : { borderColor: "rgba(120,120,140,0.25)", color: "#8b93a7" }}
                        >
                          {nombre}
                        </span>
                      ))}
                    </div>
                    {/* progreso + botón */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1 bg-secondary/80 overflow-hidden">
                        <div className="h-full transition-all duration-700" style={{ width: `${p}%`, background: color, boxShadow: `0 0 6px ${color}88` }} />
                      </div>
                      <span className="font-mono text-[9px] tabular-nums" style={{ color }}>{p}%</span>
                      {est === "PLANIFICADA" && (
                        <Button size="sm" onClick={() => lanzar(op)} className="h-6 px-2.5 font-mono text-[9px] uppercase bg-amber-hud text-amber border border-amber-hud hover:bg-amber-hud/70">
                          <Rocket className="w-3 h-3 mr-1" /> Ejecutar
                        </Button>
                      )}
                      {est === "EN CURSO" && (
                        <span className="text-[8px] font-mono uppercase text-amber flex items-center gap-1">
                          <span className="beacon w-1.5 h-1.5 rounded-full bg-amber" style={{ color: "#FFB020" }} /> en vuelo
                        </span>
                      )}
                      {est === "EXITO" && <Trophy className="w-3.5 h-3.5" style={{ color }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* recompensas */}
          <div className="hud-panel p-3">
            <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" /> Dotación
            </div>
            <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
              Primera victoria de cada operación: hasta 180 mon + 75 XP. Repetir la ejecución paga 40 mon + 15 XP — el tablero nunca duerme.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════ LOG DE COMUNICACIONES ══════════ */}
      <div className="hud-panel p-3">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="w-4 h-4 text-amber" />
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Canal de comunicaciones</h3>
          <span className="ml-auto flex items-center gap-1 text-[9px] font-mono uppercase text-green-hud">
            <span className="beacon w-1.5 h-1.5 rounded-full bg-green-hud" style={{ color: "#00FF87" }} /> REC
          </span>
        </div>
        <div className="space-y-1 min-h-[96px]">
          <AnimatePresence initial={false}>
            {log.map((entry, i) => (
              <motion.div
                key={`${entry}-${i}-${log.length}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: i === 0 ? 1 : 0.62 - i * 0.07, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-2 font-mono text-[10px]"
              >
                <span className={cn("shrink-0", i === 0 ? "text-amber beacon" : "text-muted-foreground")} style={{ color: i === 0 ? "#FFB020" : undefined }}>
                  ▸
                </span>
                <span className={cn("truncate", i === 0 && "holo-flicker text-foreground")}>{entry}</span>
                <span className="ml-auto shrink-0 text-[8px] text-muted-foreground/60 tabular-nums">
                  {String(23 - i).padStart(2, "0")}:{String((47 + i * 13) % 60).padStart(2, "0")}Z
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
