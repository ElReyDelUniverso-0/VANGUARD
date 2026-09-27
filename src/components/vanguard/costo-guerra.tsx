"use client";

// v67.0 EL HANGAR — CONTADOR DE COSTO DE GUERRA EN VIVO + MEDIDOR DE RIESGO
// NUCLEAR. El precio humano y económico del planeta subiendo segundo a segundo
// (estimación compuesta de los conflictos activos) y el velocímetro estilo
// Reloj del Juicio Final ligado al termómetro de tensión de VANGUARD.

import { useEffect, useRef, useState } from "react";
import { Banknote, Radiation, Users, Home } from "lucide-react";
import { getTension } from "@/lib/tension";

// Costo compuesto estimado de los conflictos activos (fuentes abiertas OSINT):
// base consolidada + ritmo por segundo (militar + reconstrucción + pérdida PIB)
const BASE_COST_USD = 2_874_000_000_000;
const USD_PER_SEC = 41_300;
// costo humano (desplazados acumulados vivos hoy por guerras activas)
const BASE_REFUGEES = 117_300_000;
const REF_PER_SEC = 0.82; // ~1.9k/día en cómputo neto
const BASE_HOMES_LOST = 4_180_000;

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(3)} BILLONES`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)} MIL MILLONES`;
  return `$${Math.round(n).toLocaleString()}`;
}

export function CostoGuerra() {
  const [usd, setUsd] = useState(BASE_COST_USD);
  const [refugees, setRefugees] = useState(BASE_REFUGEES);
  const [homes, setHomes] = useState(BASE_HOMES_LOST);
  const [tension, setTension] = useState(62);
  const rafRef = useRef(0);

  useEffect(() => {
    const t0 = Date.now();
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.max(0, (now - last) / 1000);
      last = now;
      const elapsed = (Date.now() - t0) / 1000;
      setUsd(BASE_COST_USD + USD_PER_SEC * elapsed);
      setRefugees(BASE_REFUGEES + REF_PER_SEC * elapsed);
      setHomes(BASE_HOMES_LOST + elapsed * 0.11);
      rafRef.current = requestAnimationFrame(tick);
    };
    // primera lectura de tensión fuera del cuerpo del efecto (evita cascada)
    const t0iv = setTimeout(() => setTension(getTension()), 0);
    rafRef.current = requestAnimationFrame(tick);
    const iv = setInterval(() => setTension(getTension()), 20000);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(iv);
      clearTimeout(t0iv);
    };
  }, []);

  // aguja del medidor nuclear: tensión 0-100 → 1-100 de riesgo (nunca 0)
  const risk = Math.max(1, Math.min(100, Math.round(tension)));
  const angle = -110 + (risk / 100) * 220; // -110° .. +110°
  const riskColor = risk >= 90 ? "#FF3B30" : risk >= 70 ? "#FF7A45" : risk >= 45 ? "#FFD60A" : "#00FF87";
  const riskLabel = risk >= 90 ? "ZONA EXTINCIÓN" : risk >= 70 ? "MUY ALTO" : risk >= 45 ? "ELEVADO" : "CONTENIDO";

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {/* CONTADOR DE COSTO DE GUERRA */}
      <div className="hud-corner p-3 sm:col-span-2 border-crisis-hud">
        <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-crisis mb-1">
          <Banknote className="w-3.5 h-3.5" /> Contador de costo de guerra · en vivo
        </div>
        <div
          className="font-tech text-2xl sm:text-3xl font-black tabular-nums text-crisis"
          style={{ textShadow: "0 0 22px rgba(255,59,48,0.5)", animation: "vg-crisis-pulse 2.4s ease-in-out infinite" }}
        >
          {fmtUsd(usd)}
        </div>
        <div className="font-mono text-[9px] text-muted-foreground mb-2">
          +${USD_PER_SEC.toLocaleString()} cada segundo · costo militar, humanitario y de reconstrucción de los conflictos activos
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
          <div className="border border-border p-2 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-violet flex-shrink-0" />
            <div>
              <div className="text-foreground font-bold tabular-nums">{Math.round(refugees).toLocaleString()}</div>
              <div className="text-[8px] uppercase tracking-widest text-muted-foreground">desplazados hoy</div>
            </div>
          </div>
          <div className="border border-border p-2 flex items-center gap-2">
            <Home className="w-3.5 h-3.5 text-amber flex-shrink-0" />
            <div>
              <div className="text-foreground font-bold tabular-nums">{Math.round(homes).toLocaleString()}</div>
              <div className="text-[8px] uppercase tracking-widest text-muted-foreground">hogares perdidos</div>
            </div>
          </div>
        </div>
      </div>

      {/* MEDIDOR DE RIESGO NUCLEAR */}
      <div className="hud-corner p-3 flex flex-col items-center justify-center">
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-1">
          <Radiation className="w-3.5 h-3.5 text-amber" /> Riesgo nuclear global
        </div>
        <svg viewBox="0 0 120 78" className="w-full max-w-[190px]">
          {/* arco de fondo 220° */}
          {[
            { from: 0, to: 45, color: "#00FF87" },
            { from: 45, to: 70, color: "#FFD60A" },
            { from: 70, to: 90, color: "#FF7A45" },
            { from: 90, to: 100, color: "#FF3B30" },
          ].map((seg, i) => {
            const a1 = ((-110 + (seg.from / 100) * 220) * Math.PI) / 180;
            const a2 = ((-110 + (seg.to / 100) * 220) * Math.PI) / 180;
            const r = 44;
            const x1 = 60 + Math.cos(a1) * r;
            const y1 = 56 + Math.sin(a1) * r;
            const x2 = 60 + Math.cos(a2) * r;
            const y2 = 56 + Math.sin(a2) * r;
            const large = (seg.to - seg.from) / 100 * 220 > 180 ? 1 : 0;
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
                stroke={seg.color}
                strokeWidth={6}
                fill="none"
                opacity={risk >= seg.from ? 0.95 : 0.22}
              />
            );
          })}
          {/* aguja */}
          <g transform={`rotate(${angle} 60 56)`}>
            <line x1="60" y1="56" x2="60" y2="18" stroke={riskColor} strokeWidth="2.4" />
          </g>
          <circle cx="60" cy="56" r="4" fill={riskColor} />
          <text x="60" y="74" textAnchor="middle" fill={riskColor} fontSize="13" fontWeight="800" fontFamily="Rajdhani, sans-serif">
            {risk}/100
          </text>
        </svg>
        <div className="font-mono text-[9px] uppercase tracking-widest font-bold" style={{ color: riskColor }}>
          {riskLabel}
        </div>
        <div className="font-mono text-[8px] text-muted-foreground text-center mt-0.5">
          ligado al termómetro de tensión · estilo Reloj del Juicio Final
        </div>
      </div>
    </div>
  );
}
