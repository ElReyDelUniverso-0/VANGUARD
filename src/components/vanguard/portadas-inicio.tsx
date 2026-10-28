"use client";

// ============================================================
// v191.0 PORTADAS VIVAS — el inicio deja de ser aburrido.
// Cuatro PORTADAS cinematográficas seleccionables para el héroe
// de la casa, cada una con su escena animada y su color de mando:
//   1. AMANECER TÁCTICO (ámbar) — el sol sube sobre la rejilla
//   2. CIUDAD CERO (violeta) — la noche llueve sobre la ciudad
//   3. ALERTA ROJA (rojo) — la sala de guerra late
//   4. ÓRBITA SECRETA (verde HUD) — el satélite te observa
// Leyes de la casa respetadas:
//  · CERO IMÁGENES: todo es CSS/SVG — nada que pesar en señal
//    lenta (la lección v189 del cine muerto: 1.3MB de fotos NO).
//  · NADA SE RECARGA SOLO: la rotación AUTO solo cambia la
//    escena cada 9s (CSS), jamás recarga ni navega.
//  · La elección del Dueño se guarda (vg191-portada) y manda.
//  · prefers-reduced-motion: las escenas quedan quietas.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, Clapperboard, Volume2, VolumeX,
  Radar, Building2, Siren, Satellite, ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_VERSION_LABEL } from "@/lib/version";
import { probarVoces, pararVoces } from "@/lib/voces-agentes";

type PortadaId = "amanecer" | "ciudad" | "alerta" | "orbita";

interface Portada {
  id: PortadaId;
  nombre: string;
  lema: string;
  color: string;
  icono: React.ReactNode;
}

const PORTADAS: Portada[] = [
  {
    id: "amanecer",
    nombre: "AMANECER TÁCTICO",
    lema: "El sol sube sobre la rejilla y el mundo despierta",
    color: "#E8C56A",
    icono: <Radar className="w-3.5 h-3.5" />,
  },
  {
    id: "ciudad",
    nombre: "CIUDAD CERO",
    lema: "La noche cae sobre la ciudad que nunca duerme",
    color: "#A855F7",
    icono: <Building2 className="w-3.5 h-3.5" />,
  },
  {
    id: "alerta",
    nombre: "ALERTA ROJA",
    lema: "La sala de guerra late con cada frente",
    color: "#FF3B30",
    icono: <Siren className="w-3.5 h-3.5" />,
  },
  {
    id: "orbita",
    nombre: "ÓRBITA SECRETA",
    lema: "Un satélite te observa desde arriba",
    color: "#3DDC97",
    icono: <Satellite className="w-3.5 h-3.5" />,
  },
];

const LS_PORTADA = "vg191-portada";
const LS_AUTO = "vg191-portada-auto";
const ROTACION_MS = 9_000;

interface Props {
  tension: number;
  tensionColor: string;
  conflictos: number;
  clock: string;
  level: number;
  coins: number;
  streak: number;
  alias: string;
  onVerCinematica: () => void;
}

export function PortadasInicio({ tension, tensionColor, conflictos, clock, level, coins, streak, alias, onVerCinematica }: Props) {
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(true);
  const [probando, setProbando] = useState(false);
  const listoRef = useRef(false);
  const pararDemoRef = useRef<(() => void) | null>(null);

  // elección guardada manda (post-hidratación, patrón v132/v179: setTimeout 0)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const g = localStorage.getItem(LS_PORTADA);
        const i = PORTADAS.findIndex((p) => p.id === g);
        if (i >= 0) setIdx(i);
        if (localStorage.getItem(LS_AUTO) === "0") setAuto(false);
      } catch {}
      listoRef.current = true;
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // rotación AUTO: solo cambia la ESCENA (CSS), jamás recarga
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      setIdx((v) => (v + 1) % PORTADAS.length);
    }, ROTACION_MS);
    return () => clearInterval(t);
  }, [auto]);

  const elegir = useCallback((i: number) => {
    setIdx(((i % PORTADAS.length) + PORTADAS.length) % PORTADAS.length);
    setAuto(false); // la mano del Dueño manda; AUTO vuelve con su botón
    try { localStorage.setItem(LS_PORTADA, PORTADAS[((i % PORTADAS.length) + PORTADAS.length) % PORTADAS.length].id); localStorage.setItem(LS_AUTO, "0"); } catch {}
  }, []);

  const toggleAuto = useCallback(() => {
    setAuto((v) => {
      const nv = !v;
      try { localStorage.setItem(LS_AUTO, nv ? "1" : "0"); } catch {}
      return nv;
    });
  }, []);

  const pruebaVoces = useCallback(() => {
    if (probando) {
      pararDemoRef.current?.();
      pararVoces();
      setProbando(false);
      return;
    }
    setProbando(true);
    pararDemoRef.current = probarVoces(["centinela", "analista", "assist"]);
    window.setTimeout(() => setProbando(false), 16_000);
  }, [probando]);

  useEffect(() => () => { pararDemoRef.current?.(); }, []);

  const p = PORTADAS[idx];

  return (
    <div className="hero-ring">
      <div
        className="vg191-portada relative overflow-hidden rounded-md border border-border/60"
        data-vg191-portada={p.id}
        style={{ ["--vg191-acento" as string]: p.color }}
      >
        {/* ════ ESCENA 1: AMANECER TÁCTICO ════ */}
        <div className={cn("vg191-escena vg191-amanecer", idx === 0 && "vg191-activa")} aria-hidden={idx !== 0}>
          <div className="vg191-sol" />
          <div className="vg191-rejilla" />
          <div className="vg191-barrido" />
        </div>
        {/* ════ ESCENA 2: CIUDAD CERO ════ */}
        <div className={cn("vg191-escena vg191-ciudad", idx === 1 && "vg191-activa")} aria-hidden={idx !== 1}>
          <div className="vg191-luna" />
          <div className="vg191-skyline vg191-skyline-lejos" />
          <div className="vg191-skyline vg191-skyline-cerca" />
          <div className="vg191-lluvia" />
        </div>
        {/* ════ ESCENA 3: ALERTA ROJA ════ */}
        <div className={cn("vg191-escena vg191-alerta", idx === 2 && "vg191-activa")} aria-hidden={idx !== 2}>
          <div className="vg191-anillos" />
          <div className="vg191-anillos vg191-anillos-2" />
          <div className="vg191-hex" />
        </div>
        {/* ════ ESCENA 4: ÓRBITA SECRETA ════ */}
        <div className={cn("vg191-escena vg191-orbita", idx === 3 && "vg191-activa")} aria-hidden={idx !== 3}>
          <div className="vg191-estrellas" />
          <svg className="vg191-globo" viewBox="0 0 200 200" fill="none" aria-hidden>
            <circle cx="100" cy="100" r="78" stroke="#3DDC97" strokeOpacity="0.55" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="78" ry="30" stroke="#3DDC97" strokeOpacity="0.4" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="78" ry="58" stroke="#3DDC97" strokeOpacity="0.3" strokeWidth="0.8" />
            <ellipse cx="100" cy="100" rx="30" ry="78" stroke="#3DDC97" strokeOpacity="0.4" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="58" ry="78" stroke="#3DDC97" strokeOpacity="0.3" strokeWidth="0.8" />
            <line x1="22" y1="100" x2="178" y2="100" stroke="#3DDC97" strokeOpacity="0.35" strokeWidth="0.8" />
          </svg>
          <div className="vg191-reticula">
            <span className="vg191-ret-v" /><span className="vg191-ret-h" />
          </div>
        </div>

        {/* velo para legibilidad del texto (común) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080D] via-[#08080D]/55 to-transparent pointer-events-none" aria-hidden />

        {/* ════ IDENTIDAD (común a todas las portadas) ════ */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 sm:p-6">
          <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.35em] mb-1.5" style={{ color: p.color }}>
            Centro de mando global · Portada {idx + 1}/{PORTADAS.length}
          </div>
          <h1
            className="glitch font-display text-4xl sm:text-6xl font-black tracking-wider text-soft"
            data-text="VANGUARD"
            style={{ textShadow: `0 0 26px ${p.color}55` }}
          >
            VANGUARD
          </h1>
          <p className="mt-1 text-[11px] sm:text-sm font-mono text-foreground/75">
            {p.lema} — <span className="text-gradient">{APP_VERSION_LABEL}</span>
          </p>

          {/* chips del agente + reloj */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 glass rounded-sm px-2 py-1">
              <ShieldAlert className="w-3 h-3" style={{ color: tensionColor }} /> {clock}
            </span>
            <span className="inline-flex items-center gap-1.5 glass rounded-sm px-2 py-1">
              Nivel {level} · {coins} mon
            </span>
            {streak > 0 && <span className="inline-flex items-center gap-1.5 glass rounded-sm px-2 py-1">Racha {streak} días</span>}
            <span className="inline-flex items-center gap-1.5 glass rounded-sm px-2 py-1 text-foreground">Agente {alias || "sin registrar"}</span>
          </div>

          {/* acciones: cinemática + voces */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={onVerCinematica}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-md font-mono text-[11px] font-bold uppercase tracking-widest border transition-colors"
              style={{ borderColor: `${p.color}88`, color: p.color, background: `${p.color}14` }}
              aria-label="Reproducir la cinemática de Vanguard"
            >
              <Clapperboard className="w-4 h-4" /> Ver cinemática
            </button>
            <button
              onClick={pruebaVoces}
              className={cn(
                "inline-flex items-center gap-2 min-h-[40px] px-4 rounded-md font-mono text-[11px] font-bold uppercase tracking-widest border transition-colors",
                probando
                  ? "border-red-hud/60 bg-red-hud/10 text-red-300"
                  : "border-amber-hud/40 bg-amber-hud/5 text-amber hover:bg-amber-hud/15"
              )}
              aria-label={probando ? "Detener la prueba de voces" : "Escuchar las voces de los agentes"}
            >
              {probando ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {probando ? "Callar voces" : "Probar voces"}
            </button>
          </div>
        </div>

        {/* ════ BARRA DE TENSIÓN (común, abajo del todo) ════ */}
        <div className="absolute bottom-0 inset-x-0 z-10 h-1.5 bg-black/60">
          <div
            className="h-full transition-all duration-1000"
            style={{ width: `${tension}%`, background: `linear-gradient(90deg, #3DDC97, #E8C56A, #FF8A3B, #FF3B30)` }}
          />
        </div>
      </div>

      {/* ════ SELECTOR DE PORTADAS + tensión ════ */}
      <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            onClick={() => elegir(idx - 1)}
            className="w-9 h-9 grid place-items-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:border-amber-hud/50"
            aria-label="Portada anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {PORTADAS.map((pa, i) => (
            <button
              key={pa.id}
              onClick={() => elegir(i)}
              title={pa.nombre}
              aria-label={`Portada ${pa.nombre}`}
              className={cn(
                "h-9 rounded-md border font-mono text-[9px] uppercase tracking-wider px-2 hidden sm:inline-flex items-center gap-1.5 transition-colors",
                i === idx ? "border-transparent" : "border-border/60 text-muted-foreground hover:text-foreground"
              )}
              style={i === idx ? { background: `${pa.color}1c`, color: pa.color, borderColor: `${pa.color}77` } : undefined}
            >
              {pa.icono} <span className="hidden md:inline">{pa.nombre}</span>
            </button>
          ))}
          {/* puntos en móvil (las píldoras no caben) */}
          <div className="flex sm:hidden items-center gap-1.5 px-1">
            {PORTADAS.map((pa, i) => (
              <button
                key={pa.id}
                onClick={() => elegir(i)}
                aria-label={`Portada ${pa.nombre}`}
                className="w-7 h-9 grid place-items-center"
              >
                <span
                  className={cn("block rounded-full transition-all", i === idx ? "w-2.5 h-2.5" : "w-1.5 h-1.5 opacity-50")}
                  style={{ background: pa.color }}
                />
              </button>
            ))}
          </div>
          <button
            onClick={() => elegir(idx + 1)}
            className="w-9 h-9 grid place-items-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:border-amber-hud/50"
            aria-label="Portada siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <button
            onClick={toggleAuto}
            className={cn(
              "min-h-[36px] px-3 rounded-md border uppercase tracking-widest transition-colors",
              auto ? "border-green-hud/50 text-green-hud bg-green-hud/10" : "border-border/60 hover:text-foreground"
            )}
            aria-label={auto ? "Desactivar rotación automática de portadas" : "Activar rotación automática de portadas"}
          >
            Auto-rotación: {auto ? "ON" : "OFF"}
          </button>
          <span className="hidden sm:inline">
            Tensión mundial <b style={{ color: tensionColor }}>{tension}</b>/100 · {conflictos} conflictos
          </span>
        </div>
      </div>

      {/* ════ CSS DE LAS ESCENAS (prefijado vg191-, sin colisiones) ════ */}
      <style dangerouslySetInnerHTML={{ __html: VG191_CSS }} />
    </div>
  );
}

const VG191_CSS = `
.vg191-portada { min-height: 300px; background: #08080D; }
@media (min-width: 640px) { .vg191-portada { min-height: 380px; } }
.vg191-escena { position: absolute; inset: 0; opacity: 0; transition: opacity 900ms ease; pointer-events: none; }
.vg191-escena.vg191-activa { opacity: 1; }

/* ── 1: AMANECER ── */
.vg191-amanecer { background: linear-gradient(180deg, #17110A 0%, #3A2710 46%, #7A4A16 78%, #C97F2B 100%); }
.vg191-sol { position: absolute; left: 50%; bottom: 18%; width: 120px; height: 120px; margin-left: -60px; border-radius: 9999px;
  background: radial-gradient(circle, #FFD98A 0%, #F2B44C 55%, rgba(242,180,76,0) 72%);
  box-shadow: 0 0 80px 30px rgba(242,180,76,0.35); animation: vg191-sol 14s ease-in-out infinite alternate; }
@keyframes vg191-sol { from { transform: translateY(26px) scale(0.94); } to { transform: translateY(-8px) scale(1.04); } }
.vg191-rejilla { position: absolute; inset: 42% 0 0 0; opacity: 0.5;
  background: repeating-linear-gradient(180deg, rgba(232,197,106,0.5) 0 1px, transparent 1px 26px),
              repeating-linear-gradient(90deg, rgba(232,197,106,0.5) 0 1px, transparent 1px 40px);
  transform: perspective(300px) rotateX(58deg); transform-origin: top; mask-image: linear-gradient(180deg, transparent, black 30%); }
.vg191-barrido { position: absolute; inset: 0; background: conic-gradient(from 0deg at 50% 60%, rgba(232,197,106,0.22) 0deg, transparent 70deg, transparent 360deg);
  animation: vg191-giro 7s linear infinite; }
@keyframes vg191-giro { to { transform: rotate(360deg); } }

/* ── 2: CIUDAD ── */
.vg191-ciudad { background: linear-gradient(180deg, #0B0716 0%, #160E2C 60%, #241543 100%); }
.vg191-luna { position: absolute; right: 16%; top: 14%; width: 54px; height: 54px; border-radius: 9999px; background: #E9E4FF;
  box-shadow: 0 0 40px 12px rgba(168,85,247,0.4), inset -10px -6px 0 rgba(120,90,180,0.6); }
.vg191-skyline { position: absolute; left: 0; right: 0; bottom: 0; }
.vg191-skyline-lejos { height: 46%;
  background: repeating-linear-gradient(90deg, #171030 0 26px, transparent 26px 34px, #1D1440 34px 58px, transparent 58px 70px, #140E28 70px 96px, transparent 96px 112px);
  mask-image: linear-gradient(180deg, transparent 0, black 34px); }
.vg191-skyline-cerca { height: 30%;
  background: repeating-linear-gradient(90deg, #0C0819 0 40px, transparent 40px 48px, #110B22 48px 92px, transparent 92px 100px);
  mask-image: linear-gradient(180deg, transparent 0, black 26px); }
.vg191-skyline-cerca::after { content: ""; position: absolute; inset: 0;
  background-image: radial-gradient(rgba(168,85,247,0.9) 1px, transparent 1.6px), radial-gradient(rgba(125,211,252,0.85) 1px, transparent 1.6px);
  background-size: 34px 22px, 47px 31px; background-position: 8px 12px, 22px 5px; animation: vg191-ventanas 2.4s steps(2) infinite; opacity: 0.7; }
@keyframes vg191-ventanas { 50% { opacity: 0.35; } }
.vg191-lluvia { position: absolute; inset: 0; opacity: 0.35;
  background: repeating-linear-gradient(102deg, rgba(200,190,255,0.28) 0 1px, transparent 1px 9px); animation: vg191-lluvia 0.9s linear infinite; }
@keyframes vg191-lluvia { to { background-position: -40px 120px; } }

/* ── 3: ALERTA ROJA ── */
.vg191-alerta { background: radial-gradient(circle at 50% 62%, #3A0A08 0%, #1A0505 55%, #0A0202 100%); }
.vg191-anillos { position: absolute; left: 50%; top: 62%; width: 90px; height: 90px; margin: -45px 0 0 -45px; border-radius: 9999px;
  border: 2px solid rgba(255,59,48,0.75); animation: vg191-pulso 3.2s ease-out infinite; }
.vg191-anillos-2 { animation-delay: 1.6s; }
@keyframes vg191-pulso { from { transform: scale(0.35); opacity: 0.95; } to { transform: scale(4.6); opacity: 0; } }
.vg191-hex { position: absolute; inset: 0; opacity: 0.5;
  background: repeating-linear-gradient(60deg, rgba(255,59,48,0.16) 0 1px, transparent 1px 34px),
              repeating-linear-gradient(-60deg, rgba(255,59,48,0.16) 0 1px, transparent 1px 34px),
              repeating-linear-gradient(0deg, rgba(255,59,48,0.12) 0 1px, transparent 1px 30px); }

/* ── 4: ÓRBITA ── */
.vg191-orbita { background: radial-gradient(circle at 60% 30%, #07160F 0%, #050B08 60%, #020403 100%); }
.vg191-estrellas { position: absolute; inset: 0; opacity: 0.85;
  background-image: radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1.4px), radial-gradient(rgba(61,220,151,0.8) 1px, transparent 1.5px), radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1.3px);
  background-size: 110px 90px, 160px 130px, 80px 70px; background-position: 12px 20px, 60px 70px, 30px 45px;
  animation: vg191-titilar 3.5s ease-in-out infinite alternate; }
@keyframes vg191-titilar { from { opacity: 0.5; } to { opacity: 0.95; } }
.vg191-globo { position: absolute; left: 50%; top: 56%; width: 240px; height: 240px; margin: -120px 0 0 -120px; opacity: 0.9;
  animation: vg191-giro 26s linear infinite; }
.vg191-reticula { position: absolute; left: 50%; top: 56%; width: 150px; height: 150px; margin: -75px 0 0 -75px; }
.vg191-ret-v { position: absolute; left: 50%; top: -8px; bottom: -8px; width: 1px; background: rgba(61,220,151,0.55); }
.vg191-ret-h { position: absolute; top: 50%; left: -8px; right: -8px; height: 1px; background: rgba(61,220,151,0.55); }
.vg191-reticula::after { content: ""; position: absolute; inset: 0; border: 1px dashed rgba(61,220,151,0.5); border-radius: 9999px;
  animation: vg191-giro 12s linear infinite; }

/* respeto al que necesita calma */
@media (prefers-reduced-motion: reduce) {
  .vg191-escena *, .vg191-escena { animation: none !important; }
}
`;
