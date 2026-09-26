"use client";

// v54.0 Selector de teatro: TEATRO GLOBAL 3D (mesa de guerra mundial a nivel
// de PAÍSES con datos OSINT reales), FRENTE TÁCTICO 3D (el simulador de
// trincheras con morteros, francotiradores, convoyes, paracaidistas y
// antiaéreos) o CIUDAD 2D CLÁSICA (el lienzo original). Solo se monta el
// teatro activo para no gastar batería ni GPU del móvil.

import { useState } from "react";
import { Box, Map as MapIcon, Globe2 } from "lucide-react";
import { TeatroGlobal3D } from "./teatro-global-3d";
import { ZonaCero3D } from "./zona-cero-3d";
import { ZonaCeroSim } from "./zona-cero-sim";

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
