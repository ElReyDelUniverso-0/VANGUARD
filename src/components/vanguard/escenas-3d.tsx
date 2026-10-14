"use client";

// ============================================================
// v110.0 MATRIZ 2100 — MOTOR DE ESCENAS 3D PROCEDURALES
// "Cambia todo lo plano, hazlo 3D tecnológico. Olvídate de las
//  imágenes." — Este motor reemplaza IMÁGENES PLANAS por escenas
// holográficas vivas: CSS 3D real (preserve-3d + perspective),
// SVG procedural y cero píxeles externos.
//   · Interactúa con la persona: tilt con el puntero (rAF + lerp,
//     cero re-render, CSS vars) y paralaje global del Motor3D.
//   · Personalizable: lee --vg-3d-i (intensidad) y --vg-3d-tilt
//     que el MOTOR 3D escribe en :root desde el ajuste del usuario.
//   · Contrato 60 FPS: solo transform/opacity en animación.
//     prefers-reduced-motion apaga el tilt y las escenas respiran.
// ============================================================

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type VarianteEscena =
  | "orbita" | "noticias" | "red" | "radar" | "guerra" | "moneda"
  | "diana" | "archivo" | "libro" | "nucleo" | "onda" | "camaras"
  | "hangar" | "ciudad" | "prisma";

// ---------- azar determinista (misma escena en cada render) ----------
function mulberry(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hashDe(txt: string): number {
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// ---------- MARCO HUD (esquinas técnicas + retícula) ----------
function MarcoHud({ acento }: { acento: string }) {
  const c = "absolute w-4 h-4 opacity-80";
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none z-20">
      <span className={cn(c, "top-1.5 left-1.5 border-t border-l")} style={{ borderColor: acento }} />
      <span className={cn(c, "top-1.5 right-1.5 border-t border-r")} style={{ borderColor: acento }} />
      <span className={cn(c, "bottom-1.5 left-1.5 border-b border-l")} style={{ borderColor: acento }} />
      <span className={cn(c, "bottom-1.5 right-1.5 border-b border-r")} style={{ borderColor: acento }} />
      <span className="absolute top-2 right-8 font-mono text-[8px] tracking-[0.3em] opacity-70" style={{ color: acento }}>MATRIZ 2100</span>
    </div>
  );
}

// ---------- SELLO VIVO: reloj real latiendo (tiempo real visible) ----------
export function SelloVivo({ acento = "#5EEAD4", etiqueta = "EN VIVO", className }: { acento?: string; etiqueta?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tick = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      el.textContent = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
    };
    tick();
    const iv = window.setInterval(tick, 1000);
    return () => window.clearInterval(iv);
  }, []);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] tracking-widest backdrop-blur-sm", className)}
      style={{ background: "rgba(0,0,0,0.45)", border: `1px solid ${acento}55`, color: acento }}>
      <span className="v110-latido inline-block w-1.5 h-1.5 rounded-full" style={{ background: acento, boxShadow: `0 0 8px ${acento}` }} />
      {etiqueta}
      <span ref={ref} className="opacity-90 tabular-nums" />
    </span>
  );
}

// ============================================================
// VARIANTES — cada una es una mini-obra holográfica
// viewBox común 400x220, slice para cubrir el marco.
// ============================================================

function EscenaOrbita({ acento, rnd }: { acento: string; rnd: () => number }) {
  const sats = Array.from({ length: 5 }, (_, i) => ({ a: 14 + i * 9, d: 7 + rnd() * 9, r: 1.6 + rnd() * 1.4 }));
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="og" cx="50%" cy="45%"><stop offset="0%" stopColor={acento} stopOpacity="0.25" /><stop offset="70%" stopColor={acento} stopOpacity="0.03" /><stop offset="100%" stopColor="transparent" /></radialGradient>
      </defs>
      <circle cx="200" cy="108" r="86" fill="url(#og)" />
      <g className="v110-giro-lento" style={{ transformOrigin: "200px 108px" }}>
        <circle cx="200" cy="108" r="70" fill="none" stroke={acento} strokeOpacity="0.55" strokeWidth="1.1" />
        <ellipse cx="200" cy="108" rx="70" ry="26" fill="none" stroke={acento} strokeOpacity="0.35" strokeWidth="0.8" />
        <ellipse cx="200" cy="108" rx="70" ry="52" fill="none" stroke={acento} strokeOpacity="0.28" strokeWidth="0.8" />
        <ellipse cx="200" cy="108" rx="26" ry="70" fill="none" stroke={acento} strokeOpacity="0.32" strokeWidth="0.8" />
        <ellipse cx="200" cy="108" rx="52" ry="70" fill="none" stroke={acento} strokeOpacity="0.22" strokeWidth="0.8" />
        <line x1="130" y1="108" x2="270" y2="108" stroke={acento} strokeOpacity="0.25" strokeDasharray="3 5" />
      </g>
      {sats.map((s, i) => (
        <g key={i} className="v110-orbita" style={{ transformOrigin: "200px 108px", animationDuration: `${s.d}s`, animationDelay: `${-i * 2.3}s` }}>
          <circle cx={200 + s.a} cy="108" r={s.r} fill={acento} />
          <circle cx={200 + s.a} cy="108" r={s.r + 3} fill="none" stroke={acento} strokeOpacity="0.4" />
        </g>
      ))}
      <g className="v110-orbita" style={{ transformOrigin: "200px 108px", animationDuration: "13s" }}>
        <rect x="196" y="30" width="8" height="3" fill={acento} opacity="0.9" />
        <rect x="193" y="26" width="3" height="9" fill={acento} opacity="0.7" />
        <rect x="204" y="26" width="3" height="9" fill={acento} opacity="0.7" />
      </g>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={40 + i * 64} y1="205" x2={64 + i * 64} y2="188" stroke={acento} strokeOpacity="0.2" strokeWidth="0.7" />
      ))}
    </svg>
  );
}

function EscenaNoticias({ acento, rnd }: { acento: string; rnd: () => number }) {
  const barras = Array.from({ length: 26 }, (_, i) => ({ h: 8 + rnd() * 30, d: rnd() * 2 }));
  return (
    <div className="absolute inset-0" aria-hidden>
      <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <g className="v110-giro-lento" style={{ transformOrigin: "120px 104px" }}>
          <circle cx="120" cy="104" r="58" fill="none" stroke={acento} strokeOpacity="0.5" strokeWidth="1" />
          <ellipse cx="120" cy="104" rx="58" ry="20" fill="none" stroke={acento} strokeOpacity="0.3" strokeWidth="0.7" />
          <ellipse cx="120" cy="104" rx="20" ry="58" fill="none" stroke={acento} strokeOpacity="0.3" strokeWidth="0.7" />
          <path d="M62 104 H178 M120 46 V162" stroke={acento} strokeOpacity="0.2" strokeDasharray="2 4" />
          {[[100, 82], [142, 96], [110, 128], [148, 118]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.4" fill={acento} className="v110-parpadeo" style={{ animationDelay: `${i * 0.7}s` }} />
          ))}
        </g>
        {[0, 1, 2].map((i) => (
          <g key={i} className="v110-flota" style={{ animationDelay: `${i * 1.4}s` }}>
            <rect x={222 + i * 8} y={38 + i * 34} width={118 - i * 18} height="16" rx="2" fill="none" stroke={acento} strokeOpacity="0.45" />
            <rect x={228 + i * 8} y={43 + i * 34} width={40 - i * 8} height="5" rx="1" fill={acento} opacity="0.55" />
            <rect x={228 + i * 8} y={50 + i * 34} width={70 - i * 14} height="2.5" rx="1" fill={acento} opacity="0.3" />
          </g>
        ))}
      </svg>
      <div className="absolute left-[232px] top-[150px] flex items-end gap-[3px] h-9">
        {barras.map((b, i) => (
          <span key={i} className="v110-onda w-[3px] rounded-sm" style={{ height: `${b.h}px`, background: acento, opacity: 0.6, animationDelay: `${b.d}s` }} />
        ))}
      </div>
      <div className="absolute bottom-3 left-0 right-0 overflow-hidden">
        <div className="v110-teletipo whitespace-nowrap font-mono text-[10px] tracking-[0.25em]" style={{ color: acento }}>
          ÚLTIMA HORA /// MUNDO EN VIVO /// TELETIPO VANGUARD /// SEÑAL ESTABLE /// DATOS EN TIEMPO REAL /// ÚLTIMA HORA /// MUNDO EN VIVO ///
        </div>
      </div>
    </div>
  );
}

function EscenaRed({ acento, rnd }: { acento: string; rnd: () => number }) {
  const nodos = Array.from({ length: 14 }, () => ({ x: 30 + rnd() * 340, y: 24 + rnd() * 170, r: 1.8 + rnd() * 2.4, d: rnd() * 3 }));
  const enlaces: Array<[number, number]> = [];
  for (let i = 0; i < nodos.length; i++) {
    const dists = nodos.map((n, j) => ({ j, d: Math.hypot(n.x - nodos[i].x, n.y - nodos[i].y) })).filter((o) => o.j !== i).sort((a, b) => a.d - b.d);
    enlaces.push([i, dists[0].j]); if (dists[1] && rnd() > 0.4) enlaces.push([i, dists[1].j]);
  }
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {enlaces.map(([a, b], i) => (
        <line key={i} x1={nodos[a].x} y1={nodos[a].y} x2={nodos[b].x} y2={nodos[b].y} stroke={acento} strokeOpacity="0.22" strokeWidth="0.8" />
      ))}
      {nodos.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r} fill={acento} className="v110-parpadeo" style={{ animationDelay: `${n.d}s` }} />
          <circle cx={n.x} cy={n.y} r={n.r + 4} fill="none" stroke={acento} strokeOpacity="0.25" />
        </g>
      ))}
      <g className="v110-paquete" style={{ animationDuration: "6s" }}>
        <circle r="2.6" fill="#fff" opacity="0.9" cx="0" cy="0" />
      </g>
      <path d="M0 200 Q 100 180 200 200 T 400 196" stroke={acento} strokeOpacity="0.3" fill="none" strokeDasharray="4 6" />
    </svg>
  );
}

function EscenaRadar({ acento, rnd }: { acento: string; rnd: () => number }) {
  const blips = Array.from({ length: 7 }, () => ({ x: 200 + (rnd() - 0.5) * 220, y: 108 + (rnd() - 0.5) * 150, d: rnd() * 4 }));
  return (
    <div className="absolute inset-0" aria-hidden>
      <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        {[36, 64, 92, 120].map((r) => <circle key={r} cx="200" cy="108" r={r} fill="none" stroke={acento} strokeOpacity={0.3 - r * 0.001} strokeWidth="0.9" />)}
        <line x1="80" y1="108" x2="320" y2="108" stroke={acento} strokeOpacity="0.18" />
        <line x1="200" y1="16" x2="200" y2="200" stroke={acento} strokeOpacity="0.18" />
        <line x1="117" y1="25" x2="283" y2="191" stroke={acento} strokeOpacity="0.1" />
        <line x1="283" y1="25" x2="117" y2="191" stroke={acento} strokeOpacity="0.1" />
      </svg>
      <div className="v110-barrido absolute inset-0" style={{ background: `conic-gradient(from 0deg at 50% 49%, transparent 0deg, ${acento}2E 42deg, transparent 46deg)` }} />
      {blips.map((b, i) => (
        <span key={i} className="v110-blip absolute rounded-full" style={{ left: b.x, top: b.y, width: 5, height: 5, background: acento, boxShadow: `0 0 10px ${acento}`, animationDelay: `${b.d}s` }} />
      ))}
    </div>
  );
}

function EscenaGuerra({ acento, rnd }: { acento: string; rnd: () => number }) {
  const pins = Array.from({ length: 9 }, () => ({ x: 40 + rnd() * 320, y: 40 + rnd() * 130 }));
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <path d="M0 70 Q 60 52 120 70 T 240 66 T 400 78" fill="none" stroke={acento} strokeOpacity="0.18" />
      <path d="M0 100 Q 70 84 140 102 T 260 96 T 400 106" fill="none" stroke={acento} strokeOpacity="0.14" />
      <path d="M0 150 Q 80 132 160 150 T 320 144 T 400 154" fill="none" stroke={acento} strokeOpacity="0.12" />
      <path d="M20 128 C 90 96, 150 148, 210 112 S 330 84, 384 108" fill="none" stroke={acento} strokeOpacity="0.75" strokeWidth="1.6" strokeDasharray="8 5" />
      {pins.map((p, i) => (
        <g key={i} className="v110-parpadeo" style={{ animationDelay: `${i * 0.5}s` }}>
          <circle cx={p.x} cy={p.y} r="2.2" fill={acento} />
          <circle cx={p.x} cy={p.y} r="6.5" fill="none" stroke={acento} strokeOpacity="0.35" />
        </g>
      ))}
      {[[70, 168], [210, 60], [330, 150]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${i === 1 ? -28 : i === 2 ? 12 : 6})`} opacity="0.8">
          <path d="M0 0 L14 0 L10 -4 M14 0 L10 4" fill="none" stroke={acento} strokeWidth="1.4" />
        </g>
      ))}
    </svg>
  );
}

function EscenaMoneda({ acento, rnd }: { acento: string; rnd: () => number }) {
  const flotantes = Array.from({ length: 8 }, () => ({ x: 40 + rnd() * 320, y: 30 + rnd() * 140, d: rnd() * 3 }));
  return (
    <div className="absolute inset-0" aria-hidden>
      <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx="200" cy={152 - i * 14} rx="54" ry="14" fill={i === 2 ? `${acento}33` : "none"} stroke={acento} strokeOpacity="0.6" strokeWidth="1" />
        ))}
        <g className="v110-flota" style={{ animationDuration: "4.5s" }}>
          <ellipse cx="200" cy="96" rx="54" ry="14" fill="none" stroke={acento} strokeWidth="1.2" />
          <text x="200" y="101" textAnchor="middle" fontSize="11" fill={acento} fontFamily="monospace">V</text>
        </g>
        <path d="M60 190 H340" stroke={acento} strokeOpacity="0.3" />
        <path d="M60 190 L110 172 L150 180 L200 150 L250 162 L300 128 L340 140" fill="none" stroke={acento} strokeOpacity="0.8" strokeWidth="1.4" />
        {[[110, 172], [200, 150], [300, 128]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" fill={acento} className="v110-parpadeo" style={{ animationDelay: `${i * 0.8}s` }} />)}
      </svg>
      {flotantes.map((f, i) => (
        <span key={i} className="v110-subio absolute font-mono text-[10px]" style={{ left: f.x, top: f.y, color: acento, opacity: 0.7, animationDelay: `${f.d}s` }}>+1</span>
      ))}
    </div>
  );
}

function EscenaDiana({ acento, rnd }: { acento: string; rnd: () => number }) {
  const marcas = Array.from({ length: 6 }, () => ({ g: rnd() * 360, d: rnd() * 4 }));
  return (
    <div className="absolute inset-0" aria-hidden>
      <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        {[26, 46, 66, 86].map((r) => <circle key={r} cx="200" cy="108" r={r} fill="none" stroke={acento} strokeOpacity="0.35" strokeWidth="0.9" />)}
        <circle cx="200" cy="108" r="8" fill={acento} opacity="0.85" />
        <line x1="96" y1="108" x2="304" y2="108" stroke={acento} strokeOpacity="0.3" />
        <line x1="200" y1="4" x2="200" y2="212" stroke={acento} strokeOpacity="0.3" />
      </svg>
      {marcas.map((m, i) => (
        <span key={i} className="v110-blanco absolute w-2 h-2 rounded-full border" style={{ left: 200 + Math.cos((m.g * Math.PI) / 180) * 70 - 4, top: 108 + Math.sin((m.g * Math.PI) / 180) * 52 - 4, borderColor: acento, animationDelay: `${m.d}s` }} />
      ))}
    </div>
  );
}

function EscenaArchivo({ acento, rnd }: { acento: string; rnd: () => number }) {
  const carpetas = Array.from({ length: 7 }, (_, i) => ({ x: 34 + i * 50, y: 60 + rnd() * 60, d: i * 0.35 }));
  return (
    <div className="absolute inset-0" aria-hidden>
      <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        {carpetas.map((c, i) => (
          <g key={i} className="v110-flota" style={{ animationDelay: `${c.d}s`, animationDuration: "5s" }}>
            <rect x={c.x} y={c.y} width="40" height="52" rx="2" fill="none" stroke={acento} strokeOpacity="0.5" />
            <rect x={c.x + 5} y={c.y + 9} width="22" height="3" fill={acento} opacity="0.5" />
            <rect x={c.x + 5} y={c.y + 17} width="30" height="2" fill={acento} opacity="0.3" />
            <rect x={c.x + 5} y={c.y + 23} width="26" height="2" fill={acento} opacity="0.3" />
          </g>
        ))}
        <g transform="translate(292 44)" opacity="0.85">
          <rect x="0" y="0" width="74" height="30" rx="3" fill="none" stroke={acento} strokeWidth="1.4" />
          <text x="37" y="19" textAnchor="middle" fontSize="10" fill={acento} fontFamily="monospace" letterSpacing="2">SELLADO</text>
        </g>
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={50 + i * 70 + rnd() * 30} cy={30 + rnd() * 150} r="1" fill={acento} opacity="0.5" className="v110-polvo" style={{ animationDelay: `${i * 1.1}s` }} />
        ))}
      </svg>
    </div>
  );
}

function EscenaLibro({ acento }: { acento: string; rnd: () => number }) {
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g transform="translate(200 130)">
        <path d="M-92 -34 C -60 -46, -30 -46, 0 -34 C 30 -46, 60 -46, 92 -34 L 92 30 C 60 18, 30 18, 0 30 C -30 18, -60 18, -92 30 Z" fill="none" stroke={acento} strokeOpacity="0.6" strokeWidth="1.2" />
        <line x1="0" y1="-34" x2="0" y2="30" stroke={acento} strokeOpacity="0.6" />
        {[-70, -56, -42, -28, -14].map((x, i) => <line key={`l${i}`} x1={x} y1={-24 + Math.abs(x) * 0.08} x2={x + 22} y2={-22 + Math.abs(x) * 0.08} stroke={acento} strokeOpacity="0.35" />)}
        {[14, 28, 42, 56, 70].map((x, i) => <line key={`r${i}`} x1={x} y1={-24 + x * 0.08} x2={x + 22} y2={-22 + x * 0.08} stroke={acento} strokeOpacity="0.35" />)}
      </g>
      <g className="v110-pagina" style={{ transformOrigin: "200px 130px" }}>
        <path d="M0 -34 C 30 -46, 60 -46, 92 -34 L 92 30 C 60 18, 30 18, 0 30 Z" fill={`${acento}14`} stroke={acento} strokeOpacity="0.4" />
      </g>
      {["A", "B", "Ω", "Δ", "∑"].map((g, i) => (
        <text key={i} x={60 + i * 70} y={42 + (i % 2) * 12} fontSize="13" fill={acento} opacity="0.5" fontFamily="monospace" className="v110-parpadeo" style={{ animationDelay: `${i * 0.9}s` }}>{g}</text>
      ))}
    </svg>
  );
}

function EscenaNucleo({ acento, rnd }: { acento: string; rnd: () => number }) {
  const particulas = Array.from({ length: 10 }, () => ({ a: rnd() * 360, d: 5 + rnd() * 8, r: 1.4 + rnd() }));
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs><radialGradient id="ng" cx="50%" cy="50%"><stop offset="0%" stopColor={acento} stopOpacity="0.5" /><stop offset="100%" stopColor="transparent" /></radialGradient></defs>
      <circle cx="200" cy="110" r="64" fill="url(#ng)" />
      <g transform="translate(200 110)">
        <polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" fill={`${acento}22`} stroke={acento} strokeWidth="1.4" />
        <polygon points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8" fill="none" stroke={acento} strokeOpacity="0.7" />
        <circle r="4" fill={acento} className="v110-parpadeo" />
      </g>
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx="200" cy="110" rx="70" ry="24" fill="none" stroke={acento} strokeOpacity="0.3" className="v110-giro-lento" style={{ transformOrigin: "200px 110px", animationDuration: `${9 + i * 4}s`, animationDirection: i % 2 ? "reverse" : "normal" }} transform={`rotate(${i * 60} 200 110)`} />
      ))}
      {particulas.map((p, i) => (
        <circle key={i} cx="200" cy="110" r={p.r} fill={acento} opacity="0.7" className="v110-orbita" style={{ transformOrigin: "200px 110px", animationDuration: `${p.d}s`, animationDelay: `${-i * 0.9}s` }} transform={`rotate(${p.a} 200 110) translate(46 0)`} />
      ))}
    </svg>
  );
}

function EscenaOnda({ acento, rnd }: { acento: string; rnd: () => number }) {
  const espectro = Array.from({ length: 34 }, (_, i) => ({ h: 6 + Math.abs(Math.sin(i * 0.7)) * 26 + rnd() * 8, d: rnd() * 1.5 }));
  return (
    <div className="absolute inset-0" aria-hidden>
      <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <g transform="translate(200 96)">
          <line x1="0" y1="0" x2="0" y2="70" stroke={acento} strokeWidth="2" strokeOpacity="0.8" />
          <circle cy="-8" r="5" fill={acento} className="v110-parpadeo" />
          <line x1="-12" y1="-14" x2="0" y2="-2" stroke={acento} strokeWidth="1.2" />
          <line x1="12" y1="-14" x2="0" y2="-2" stroke={acento} strokeWidth="1.2" />
        </g>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx="200" cy="88" r={22 + i * 22} fill="none" stroke={acento} strokeOpacity={0.4 - i * 0.11} className="v110-onda-crece" style={{ animationDelay: `${i * 0.9}s`, transformOrigin: "200px 88px" }} />
        ))}
      </svg>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-[3px] h-8">
        {espectro.map((b, i) => (
          <span key={i} className="v110-onda w-[4px] rounded-sm" style={{ height: `${b.h}px`, background: acento, opacity: 0.65, animationDelay: `${b.d}s` }} />
        ))}
      </div>
    </div>
  );
}

function EscenaCamaras({ acento, rnd }: { acento: string; rnd: () => number }) {
  const pantallas = [[24, 26], [214, 26], [24, 126], [214, 126]];
  return (
    <div className="absolute inset-0" aria-hidden>
      <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        {pantallas.map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width="162" height="86" rx="3" fill="rgba(0,0,0,0.5)" stroke={acento} strokeOpacity="0.55" />
            <path d={`M${x + 14} ${y + 66} L${x + 60} ${y + 30} L${x + 104} ${y + 58} L${x + 148} ${y + 36}`} fill="none" stroke={acento} strokeOpacity="0.4" />
            <circle cx={x + 132} cy={y + 16} r="3" fill="#FF4444" className="v110-parpadeo" style={{ animationDelay: `${i * 0.4}s` }} />
            <text x={x + 140} y={y + 20} fontSize="8" fill="#FF8888" fontFamily="monospace">REC</text>
            <line x1={x} y1={y + 6} x2={x + 162} y2={y + 6} stroke={acento} strokeOpacity="0.2" />
          </g>
        ))}
        <g transform="translate(30 186)" opacity="0.9">
          <rect x="0" y="-6" width="52" height="10" rx="2" fill="none" stroke={acento} strokeOpacity="0.6" />
          <circle cx="58" cy="-1" r="4" fill="none" stroke={acento} strokeOpacity="0.8" />
        </g>
      </svg>
      <span className="v110-nieve absolute inset-0 opacity-[0.07]" />
      {rnd() > 2 ? null : null}
    </div>
  );
}

function EscenaHangar({ acento }: { acento: string; rnd: () => number }) {
  return (
    <div className="absolute inset-0" aria-hidden>
      <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <path d="M40 190 L40 70 L120 40 L280 40 L360 70 L360 190" fill="none" stroke={acento} strokeOpacity="0.4" strokeWidth="1.2" />
        <line x1="40" y1="190" x2="360" y2="190" stroke={acento} strokeOpacity="0.5" />
        {[110, 150, 190, 230, 270, 310].map((x) => <line key={x} x1={x} y1="190" x2={x} y2="176" stroke={acento} strokeOpacity="0.25" />)}
        <g transform="translate(200 128)" className="v110-flota" style={{ animationDuration: "6s" }}>
          <path d="M-64 6 L-20 -4 L28 -4 L58 4 L28 8 L-20 8 Z" fill={`${acento}1E`} stroke={acento} strokeWidth="1.3" />
          <path d="M-8 -4 L4 -20 L12 -20 L8 -4" fill="none" stroke={acento} strokeOpacity="0.7" />
          <circle cx="44" cy="2" r="1.6" fill={acento} className="v110-parpadeo" />
        </g>
      </svg>
      <span className="v110-haz absolute inset-x-0 top-0 h-full opacity-60" />
    </div>
  );
}

function EscenaCiudad({ acento, rnd }: { acento: string; rnd: () => number }) {
  const bloques = Array.from({ length: 15 }, (_, i) => ({ x: 16 + i * 26, w: 18, h: 30 + rnd() * 90 }));
  // v111 HORA REAL: la ciudad vive según TU reloj — ventanas encendidas y luna
  // de noche (19→7); sol y ventanas apagadas de día. SSR pinta la noche y el
  // efecto corrige en vivo (hidratación sin salto).
  // v115 SINGULARIDAD: la sombra también manda — el sol recorre el cielo con
  // TU hora real y los bloques proyectan SU sombra en la acera (larga al alba,
  // corta al mediodía); el sello muestra HH:MM reales, no teatro.
  const [reloj, setReloj] = useState({ h: 22, m: 47 });
  useEffect(() => {
    const pinta = () => {
      const d = new Date();
      // patrón legítimo: el reloj real solo se conoce en el cliente (v111 hora real)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReloj({ h: d.getHours(), m: d.getMinutes() });
    };
    pinta();
    const iv = setInterval(pinta, 60_000); // el sol anda 0.25°/min — 1 repintado/min basta
    return () => clearInterval(iv);
  }, []);
  const { h, m } = reloj;
  const noche = h >= 19 || h < 7;
  // posición del sol: 6h sale por la izquierda (x=20), 18h se pone a la derecha (x=380)
  const tDia = Math.max(0, Math.min(1, (h + m / 60 - 6) / 12));
  const solX = 20 + tDia * 360;
  const solY = 84 - Math.sin(tDia * Math.PI) * 62; // arco: nace bajo, sube, cae
  const alturaDia = Math.sin(tDia * Math.PI); // 0 alba/ocaso · 1 mediodía
  // sombra de cada bloque: apunta OPUESTA al sol, larga cuando el sol está bajo
  const sombraLen = noche ? 0 : 10 + (1 - alturaDia) * 26;
  const sombraDir = solX < 200 ? 1 : -1; // sol a la izquierda → sombras a la derecha
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return (
    <div className="absolute inset-0" aria-hidden>
      <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        {noche ? (
          <>
            <circle cx="330" cy="46" r="20" fill={acento} opacity="0.16" />
            <circle cx="330" cy="46" r="20" fill="none" stroke={acento} strokeOpacity="0.4" />
          </>
        ) : (
          <>
            {/* v115: el sol en SU posición real del día (arco por TU hora) */}
            <circle cx={solX} cy={solY} r="24" fill="#FFC94D" opacity="0.28" />
            <circle cx={solX} cy={solY} r="13" fill="#FFD97A" opacity="0.85" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <line key={i} x1={solX + Math.cos((i * Math.PI) / 4) * 29} y1={solY + Math.sin((i * Math.PI) / 4) * 29}
                x2={solX + Math.cos((i * Math.PI) / 4) * 36} y2={solY + Math.sin((i * Math.PI) / 4) * 36}
                stroke="#FFC94D" strokeOpacity="0.5" strokeWidth="1.2" />
            ))}
          </>
        )}
        {bloques.map((b, i) => (
          <g key={i}>
            {/* v115: la SOMBRA REAL del bloque en la acera — geometría por hora */}
            {!noche && sombraLen > 0 && (
              <polygon
                points={`${b.x},${190} ${b.x + b.w},${190} ${b.x + b.w + sombraDir * sombraLen},${196 + sombraLen * 0.12} ${b.x + sombraDir * sombraLen},${196 + sombraLen * 0.12}`}
                fill="rgba(0,0,0,0.42)"
              />
            )}
            <rect x={b.x} y={190 - b.h} width={b.w} height={b.h} fill="rgba(255,255,255,0.03)" stroke={acento} strokeOpacity="0.4" strokeWidth="0.8" />
            {Array.from({ length: Math.floor(b.h / 14) }, (_, f) => (
              <rect key={f} x={b.x + 4} y={190 - b.h + 6 + f * 12} width="4" height="5" fill={acento} className="v110-ventana"
                style={{ opacity: noche ? undefined : 0.14, animationDelay: `${(i * 3 + f) * 0.35 % 6}s` }} />
            ))}
          </g>
        ))}
        <line x1="0" y1="190" x2="400" y2="190" stroke={acento} strokeOpacity="0.6" />
        <g className="v110-coche"><rect x="-30" y="196" width="26" height="3" rx="1.5" fill={acento} opacity="0.9" /></g>
      </svg>
      <span
        className="absolute top-2 left-2 font-mono text-[8px] tracking-[0.3em] opacity-60"
        style={{ color: acento }}
      >
        {noche ? `${hh}:${mm} · NOCHE REAL` : `${hh}:${mm} · DÍA REAL · SOL ${Math.round(alturaDia * 100)}%`}
      </span>
    </div>
  );
}

function EscenaPrisma({ acento }: { acento: string; rnd: () => number }) {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden>
      <div className="v110-cubo relative" style={{ transformStyle: "preserve-3d" }}>
        {[
          "rotateY(0deg) translateZ(34px)", "rotateY(90deg) translateZ(34px)", "rotateY(180deg) translateZ(34px)",
          "rotateY(270deg) translateZ(34px)", "rotateX(90deg) translateZ(34px)", "rotateX(-90deg) translateZ(34px)",
        ].map((t, i) => (
          <span key={i} className="absolute inset-0 border" style={{ transform: t, borderColor: `${acento}88`, background: `${acento}0F`, backfaceVisibility: "visible" }} />
        ))}
      </div>
      <div className="absolute bottom-5 inset-x-0 flex justify-center gap-2">
        {[0, 1, 2].map((i) => <span key={i} className="w-8 h-[2px] rounded-full" style={{ background: acento, opacity: 0.35 - i * 0.1 }} />)}
      </div>
    </div>
  );
}

// ---------- RENDER DE VARIANTE ----------
function cuerpoDe(variante: VarianteEscena, acento: string, semilla: number): ReactNode {
  const rnd = mulberry(semilla);
  switch (variante) {
    case "orbita": return <EscenaOrbita acento={acento} rnd={rnd} />;
    case "noticias": return <EscenaNoticias acento={acento} rnd={rnd} />;
    case "red": return <EscenaRed acento={acento} rnd={rnd} />;
    case "radar": return <EscenaRadar acento={acento} rnd={rnd} />;
    case "guerra": return <EscenaGuerra acento={acento} rnd={rnd} />;
    case "moneda": return <EscenaMoneda acento={acento} rnd={rnd} />;
    case "diana": return <EscenaDiana acento={acento} rnd={rnd} />;
    case "archivo": return <EscenaArchivo acento={acento} rnd={rnd} />;
    case "libro": return <EscenaLibro acento={acento} rnd={rnd} />;
    case "nucleo": return <EscenaNucleo acento={acento} rnd={rnd} />;
    case "onda": return <EscenaOnda acento={acento} rnd={rnd} />;
    case "camaras": return <EscenaCamaras acento={acento} rnd={rnd} />;
    case "hangar": return <EscenaHangar acento={acento} rnd={rnd} />;
    case "ciudad": return <EscenaCiudad acento={acento} rnd={rnd} />;
    default: return <EscenaPrisma acento={acento} rnd={rnd} />;
  }
}

// ============================================================
// ESCENA 3D — el componente público. Contenedor con perspective
// real, tilt con el puntero (CSS vars, rAF+lerp), suelo holo,
// marco HUD y scanline. Todo transform/opacity.
// ============================================================
export function Escena3D({
  variante, acento = "#FF8A2A", semilla = 7, className, estilo, hijos, estatico,
}: {
  variante: VarianteEscena;
  acento?: string;
  semilla?: number;
  className?: string;
  estilo?: CSSProperties;
  hijos?: ReactNode;
  /** v111: tarjetas diminutas — sin tilt ni rAF (cero coste, 60 FPS garantizado) */
  estatico?: boolean;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (estatico) return;
    const el = caja.current;
    if (!el || reduced) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0, vivo = true;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
      const ny = ((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1;
      tx = Math.max(-1, Math.min(1, nx)); ty = Math.max(-1, Math.min(1, ny));
    };
    const onLeave = () => { tx = 0; ty = 0; };
    const loop = () => {
      if (!vivo) return;
      cx += (tx - cx) * 0.075; cy += (ty - cy) * 0.075;
      el.style.setProperty("--vg-tx", cx.toFixed(3));
      el.style.setProperty("--vg-ty", cy.toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => { vivo = false; cancelAnimationFrame(raf); el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); };
  }, [reduced, estatico]);

  return (
    <div ref={caja} className={cn("v110-escena relative overflow-hidden", className)} style={{ ...estilo, ["--vg-acc" as string]: acento }}>
      <div aria-hidden className="v110-suelo absolute inset-x-[-20%] bottom-[-32%] h-[62%]" />
      <div aria-hidden className="v110-volumen absolute inset-0">
        {cuerpoDe(variante, acento, semilla)}
      </div>
      <div aria-hidden className="v110-scanline absolute inset-x-0 top-0 h-10" />
      <MarcoHud acento={acento} />
      {hijos}
    </div>
  );
}

// ============================================================
// MAPA PANEL → VARIANTE (los 130 mundos de la casa + extras)
// ============================================================
const GRUPOS: Record<VarianteEscena, string[]> = {
  noticias: ["noticias", "redaccion", "briefing", "briefings", "canalbrief", "envivo", "verdades", "verifica", "ayuda", "registro"],
  orbita: ["mapa", "maps", "conquistas3d", "geoint", "planeta", "cielos", "tierra", "sismo", "pulso", "pulsos", "centinela", "espectro", "monitorglobal", "ojodios", "observatorio"],
  guerra: ["operaciones", "estrategia", "frentes", "evaluacion", "mundo", "warsim", "combate", "frente", "crisis", "dronguerra", "edad", "imperio", "sala18", "incidentes", "abusos", "memorial", "muertes", "perdidas"],
  red: ["multijugador", "foryou", "contribuidores", "memes", "creador", "obras", "foros", "amigos", "notificaciones", "enclaves", "extranjera", "grafo"],
  radar: ["osint", "radar"],
  moneda: ["hacienda", "divisas", "bookmaker", "apuestas", "predicciones", "pronosticos", "mercados", "bolsa", "bolsamonedas", "gancho", "empleos"],
  diana: ["misiones", "retos", "logros", "recompensas", "racha", "arcade", "minijuego", "quiz", "torneos", "ranking"],
  archivo: ["espionaje", "carteles", "oscura", "detective", "expedientes"],
  libro: ["biblioteca", "enciclopedia", "epocas", "historia", "wikiguerra"],
  nucleo: ["agente", "agenteia", "mente", "consejoia", "analista", "curiosidades", "simulador", "taller", "mapascrea", "studios", "laboratorio", "fusion", "espejo", "maquina", "perfil", "ciber"],
  onda: ["estudio", "videos", "pantalla", "canales", "directos", "imagenes", "galeria", "telegram"],
  camaras: ["camaras"],
  hangar: ["hangar", "armeria", "fortaleza"],
  ciudad: ["gobierno", "mipais", "alianzas", "tribunal", "embajadores", "estadisticas"],
  prisma: [],
};

const PANEL_A_ESCENA: Map<string, VarianteEscena> = (() => {
  const m = new Map<string, VarianteEscena>();
  (Object.keys(GRUPOS) as VarianteEscena[]).forEach((v) => GRUPOS[v].forEach((p) => m.set(p, v)));
  return m;
})();

export function escenaDePanel(panel: string): VarianteEscena {
  return PANEL_A_ESCENA.get(panel) ?? "prisma";
}
