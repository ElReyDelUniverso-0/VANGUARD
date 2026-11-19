"use client";

import { useSyncExternalStore } from "react";
import { type NivelAnimacion, nivelActual, suscribirNivel } from "@/lib/anim/preferencia";

// v416.0 · Para los componentes que animan con JavaScript (framer-motion,
// canvas, rAF): aquí preguntan el nivel vigente y deciden si montar el motor
// o devolver el contenido quieto. El CSS no puede apagar un bucle de JS.
export function useNivelAnimacion(): NivelAnimacion {
  return useSyncExternalStore<NivelAnimacion>(
    (cb) => suscribirNivel(cb),
    () => nivelActual(),
    () => "completas" as NivelAnimacion
  );
}

/** ¿Toca animar? falso en «reducidas» y «desactivadas». */
export function useAnima(): boolean {
  return useNivelAnimacion() === "completas";
}
