"use client";

// Vanguard v195.0 TU LADO — ATAJOS DE VANGUARD: el muelle que aprende.
//  · 6 atajos fijos de la casa siempre a mano (un toque = estás dentro).
//  · TU USO REAL reordena el muelle: cada navigateTo cuenta en
//    vg195-atajos-usage (localStorage, jamás sale del aparato) y tus salas
//    más usadas suben a la primera fila con su placa "TU SALA".
//  · El teclado 1-9/0 ya existía en la casa: no se duplica, no se toca.
//
// Leyes: navegación SOLO por el evento interno vanguard:navigate (v190,
// jamás recarga) · cero bytes de red · jamás parece pantalla de carga.

import { useEffect, useState } from "react";
import {
  Siren, Flame, MonitorPlay, Laugh, Scale, Dice5, Radar, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navigateTo } from "@/lib/nav";
import type { TabKey } from "@/components/vanguard/tab-nav";
import { sfx } from "@/lib/sound";

const LS_USO = "vg195-atajos-usage";

interface Atajo {
  tab: TabKey;
  nombre: string;
  color: string;
  icono: React.ReactNode;
}

const ATAJOS_FIJOS: Atajo[] = [
  { tab: "centro",   nombre: "GUERRA HOY", color: "#FF3B30", icono: <Siren className="w-4 h-4" /> },
  { tab: "foryou",   nombre: "PARA TI",    color: "#FF6B4A", icono: <Flame className="w-4 h-4" /> },
  { tab: "pantalla", nombre: "TV EN VIVO", color: "#E8C56A", icono: <MonitorPlay className="w-4 h-4" /> },
  { tab: "lados",    nombre: "¿TU LADO?",  color: "#FF4D5E", icono: <Scale className="w-4 h-4" /> },
  { tab: "memes",    nombre: "MEMES",      color: "#A855F7", icono: <Laugh className="w-4 h-4" /> },
  { tab: "apuestas", nombre: "APUESTAS",   color: "#FFC94D", icono: <Dice5 className="w-4 h-4" /> },
];

const ATAJOS_EXTRA: Record<string, Atajo> = {
  osint:    { tab: "osint",    nombre: "MAPA 3D",      color: "#38BDF8", icono: <Radar className="w-4 h-4" /> },
  envivo:   { tab: "envivo",   nombre: "EN VIVO",      color: "#FF6B4A", icono: <Zap className="w-4 h-4" /> },
  foros:    { tab: "foros",    nombre: "FOROS",        color: "#7FE3FF", icono: <Zap className="w-4 h-4" /> },
  encuestas:{ tab: "encuestas",nombre: "ENCUESTAS",    color: "#3DDC97", icono: <Zap className="w-4 h-4" /> },
  bolsa:    { tab: "bolsa",    nombre: "BOLSA",        color: "#E8C56A", icono: <Zap className="w-4 h-4" /> },
  arcade:   { tab: "arcade",   nombre: "ARCADE",       color: "#FFD166", icono: <Zap className="w-4 h-4" /> },
};

function leerUso(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(LS_USO) ?? "{}"); } catch { return {}; }
}

export function AtajosVanguard() {
  const [orden, setOrden] = useState<Atajo[]>(ATAJOS_FIJOS);
  const [topUso, setTopUso] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const uso = leerUso();
        const favs = Object.entries(uso)
          .filter(([tab, n]) => n > 1 && tab !== "inicio" && (ATAJOS_FIJOS.some((a) => a.tab === tab) || ATAJOS_EXTRA[tab]))
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([tab]) => tab);
        if (favs.length > 0) {
          setTopUso(favs[0]);
          const fila: Atajo[] = [];
          for (const f of favs) {
            fila.push(ATAJOS_FIJOS.find((a) => a.tab === f) ?? ATAJOS_EXTRA[f]);
          }
          for (const a of ATAJOS_FIJOS) {
            if (!favs.includes(a.tab)) fila.push(a);
          }
          setOrden(fila);
        }
      } catch {}
      setListo(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  if (!listo) {
    // antes de hidratar: nada parpadea (ley: jamás parece carga)
    return <div data-vg195-atajos="espera" className="hidden" />;
  }

  return (
    <section
      data-vg195-atajos="muelle"
      className="rounded-md border border-border/50 bg-secondary/25 p-3"
      aria-label="Atajos de Vanguard: tus salas a un toque"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber" />
          <h3 className="font-display text-[11px] font-bold uppercase tracking-widest text-foreground">
            Atajos de la casa
          </h3>
        </div>
        <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground/70">
          {topUso ? "se ordenan con tu uso" : "un toque y estás dentro"}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {orden.map((a) => {
          const esTuSala = a.tab === topUso;
          return (
            <button
              key={a.tab}
              onClick={() => { sfx.tab(); navigateTo(a.tab); }}
              className={cn(
                "group relative rounded-sm border bg-black/30 p-2 min-h-[54px] flex flex-col items-center justify-center gap-1 transition-colors hover:bg-black/50"
              )}
              style={{ borderColor: esTuSala ? `${a.color}88` : "rgba(255,255,255,0.08)" }}
              aria-label={`Ir a ${a.nombre}`}
            >
              <span style={{ color: a.color }}>{a.icono}</span>
              <span className="font-mono text-[8px] uppercase tracking-widest text-center leading-tight" style={{ color: a.color }}>
                {a.nombre}
              </span>
              {esTuSala && (
                <span className="absolute -top-1.5 -right-1 px-1 rounded-sm bg-amber-hud text-black font-mono text-[7px] font-bold uppercase tracking-wider">
                  tu sala
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
