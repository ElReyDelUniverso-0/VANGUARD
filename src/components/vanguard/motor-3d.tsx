"use client";

// ============================================================
// v110.0 MATRIZ 2100 — MOTOR 3D GLOBAL
// Montado en el layout raíz: traduce los ajustes del usuario
// (useEstilo3D) a CSS vars en :root y alimenta el paralaje
// global con el movimiento del puntero (rAF + lerp, cero
// re-render de React, contrato 60 FPS: solo CSS vars).
//   --vg-3d-i   : intensidad 0..1
//   --vg-3d-tilt: 1 | 0 (tilt personal on/off)
//   --vg-mx/--vg-my : -1..1 posición global del puntero
// ============================================================
import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { useEstilo3D } from "@/lib/estilo3d";

export function Motor3D() {
  const { activo, intensidad, inclinar, paralaje } = useEstilo3D();
  const reduced = useReducedMotion();

  // CSS vars de configuración (cambian poco — escritura directa)
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--vg-3d-i", activo && !reduced ? (intensidad / 100).toFixed(2) : "0");
    r.style.setProperty("--vg-3d-tilt", activo && inclinar && !reduced ? "1" : "0");
  }, [activo, intensidad, inclinar, reduced]);

  // Paralaje global con rAF + lerp (nunca re-render)
  useEffect(() => {
    if (!activo || !paralaje || reduced) return;
    const r = document.documentElement;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0, vivo = true;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      ty = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
    };
    const loop = () => {
      if (!vivo) return;
      cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
      r.style.setProperty("--vg-mx", cx.toFixed(3));
      r.style.setProperty("--vg-my", cy.toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [activo, paralaje, reduced]);

  return null;
}
