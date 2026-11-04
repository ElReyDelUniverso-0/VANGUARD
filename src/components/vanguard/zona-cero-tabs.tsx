"use client";

// v54.0 Selector de teatro: TEATRO GLOBAL 3D (mesa de guerra mundial a nivel
// de PAÍSES con datos OSINT reales), FRENTE TÁCTICO 3D (el simulador de
// trincheras con morteros, francotiradores, convoyes, paracaidistas y
// antiaéreos) o CIUDAD 2D CLÁSICA (el lienzo original). Solo se monta el
// teatro activo para no gastar batería ni GPU del móvil.

// v240.0 EL REPARTO — la ley v222 llega a zona-cero: three JAMÁS en el HTML
// crítico. Hasta hoy los DOS teatros 3D viajaban ESTÁTICOS en la primera
// pintura (~183 KB gzip de three medidos en el SSR) aunque el lector solo
// abriera uno — o ninguno: el modo «2d clásica» pagaba three sin mirarlo.
// Ahora cargan bajo demanda (next/dynamic ssr:false, el patrón de los
// globos desde v222); el lienzo 2D sigue ESTÁTICO porque no le debe nada
// a three. Solo se monta el teatro activo: batería, GPU y AHORA también
// los bytes.

import { useState } from "react";
import dynamic from "next/dynamic";
import { Box, Map as MapIcon, Globe2 } from "lucide-react";
import { ZonaCeroSim } from "./zona-cero-sim";

const CargandoTeatro = () => (
  <div className="w-full flex items-center justify-center" style={{ minHeight: 420 }}>
    <div className="text-center">
      <div className="w-10 h-10 mx-auto mb-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">cargando teatro 3D WebGL...</p>
    </div>
  </div>
);

const TeatroGlobal3D = dynamic(
  () => import("./teatro-global-3d").then((m) => m.TeatroGlobal3D),
  { ssr: false, loading: () => <CargandoTeatro /> }
);

const ZonaCero3D = dynamic(
  () => import("./zona-cero-3d").then((m) => m.ZonaCero3D),
  { ssr: false, loading: () => <CargandoTeatro /> }
);

export function ZonaCeroTabs() {
  const [mode, setMode] = useState<"global" | "3d" | "2d">("global");

  const cls = (active: boolean) =>
    `flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase rounded-t px-3 py-2 border-b-2 transition-colors ${
      active
        ? "border-red-500 text-red-300 bg-red-500/10"
        : "border-transparent text-zinc-500 hover:text-zinc-300"
    }`;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        <button onClick={() => setMode("global")} className={cls(mode === "global")} aria-pressed={mode === "global"}>
          <Globe2 className="w-3.5 h-3.5" /> Teatro global 3D
          <span className="text-[8px] text-emerald-300 border border-emerald-400/50 rounded px-1 ml-1">PAÍSES</span>
        </button>
        <button onClick={() => setMode("3d")} className={cls(mode === "3d")} aria-pressed={mode === "3d"}>
          <Box className="w-3.5 h-3.5" /> Frente táctico 3D
        </button>
        <button onClick={() => setMode("2d")} className={cls(mode === "2d")} aria-pressed={mode === "2d"}>
          <MapIcon className="w-3.5 h-3.5" /> Ciudad 2D clásica
        </button>
      </div>
      {mode === "global" ? <TeatroGlobal3D /> : mode === "3d" ? <ZonaCero3D /> : <ZonaCeroSim />}
    </div>
  );
}
