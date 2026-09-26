"use client";

// v53.0 Selector de teatro: 3D REALISTA (mapa tridimensional con trincheras,
// relieve, río y cuatro frentes simultáneos) o CIUDAD 2D CLÁSICA (el lienzo
// original de la ciudad que cae). Solo se monta el teatro activo para no
// gastar batería ni GPU del móvil.

import { useState } from "react";
import { Box, Map as MapIcon } from "lucide-react";
import { ZonaCero3D } from "./zona-cero-3d";
import { ZonaCeroSim } from "./zona-cero-sim";

export function ZonaCeroTabs() {
  const [mode, setMode] = useState<"3d" | "2d">("3d");

  return (
    <div>
      <div className="flex gap-1.5 mb-2">
        <button
          onClick={() => setMode("3d")}
          className={`flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase rounded-t px-3 py-2 border-b-2 transition-colors ${
            mode === "3d"
              ? "border-red-500 text-red-300 bg-red-500/10"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
          aria-pressed={mode === "3d"}
        >
          <Box className="w-3.5 h-3.5" /> Simulador 3D realista
          <span className="text-[8px] text-amber-300 border border-amber-400/50 rounded px-1 ml-1">NUEVO</span>
        </button>
        <button
          onClick={() => setMode("2d")}
          className={`flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase rounded-t px-3 py-2 border-b-2 transition-colors ${
            mode === "2d"
              ? "border-red-500 text-red-300 bg-red-500/10"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
          aria-pressed={mode === "2d"}
        >
          <MapIcon className="w-3.5 h-3.5" /> Ciudad 2D clásica
        </button>
      </div>
      {mode === "3d" ? <ZonaCero3D /> : <ZonaCeroSim />}
    </div>
  );
}
