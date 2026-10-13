"use client";

// ============================================================
// v110.0 MATRIZ 2100 — MOTOR 3D GLOBAL
// v111.0 MÁQUINA DEL TIEMPO — el motor ahora también:
//   · GIROSCOPIO: en móvil, DeviceOrientation inclina la matriz
//     con la mano (mismo rAF + lerp del paralaje, cero re-render).
//   · ERA 1950→2100: overlay global (tinte CRT + scanlines +
//     viñeta) y filtro de escenas según la era elegida. 2020 es
//     la era limpia (sin overlay, sin filtro) y 2100 la firma
//     holo de la casa.
// Montado en el layout raíz: traduce los ajustes del usuario
// (useEstilo3D) a CSS vars en :root. Contrato 60 FPS: solo CSS
// vars + capas fijas estáticas (sin re-render de React).
//   --vg-3d-i   : intensidad 0..1
//   --vg-3d-tilt: 1 | 0 (tilt personal on/off)
//   --vg-3d-filtro: filtro CSS de la era para .v110-escena
//   --vg-mx/--vg-my : -1..1 posición del puntero/giroscopio
// ============================================================
import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { useEstilo3D, ERAS } from "@/lib/estilo3d";

export function Motor3D() {
  const { activo, intensidad, inclinar, paralaje, giroscopio, era } = useEstilo3D();
  const reduced = useReducedMotion();
  const eraDef = ERAS[era] ?? ERAS["2100"];

  // CSS vars de configuración (cambian poco — escritura directa)
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--vg-3d-i", activo && !reduced ? (intensidad / 100).toFixed(2) : "0");
    r.style.setProperty("--vg-3d-tilt", activo && inclinar && !reduced ? "1" : "0");
    r.style.setProperty("--vg-3d-filtro", eraDef.filtro || "none");
  }, [activo, intensidad, inclinar, reduced, eraDef]);

  // Paralaje global con rAF + lerp (nunca re-render) + GIROSCOPIO
  useEffect(() => {
    if (!activo || !paralaje || reduced) return;
    const r = document.documentElement;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0, vivo = true;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      ty = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
    };
    // v111 GIROSCOPIO: gamma (izq/der ±45°) y beta (arriba/abajo) mapean al
    // mismo objetivo tx/ty del paralaje — la mano mueve la matriz entera.
    const onGiro = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      const g = Math.max(-45, Math.min(45, e.gamma));
      const b = Math.max(-45, Math.min(45, e.beta - 30)); // 30° = teléfono en mano
      tx = g / 45; ty = b / 45;
    };
    const loop = () => {
      if (!vivo) return;
      cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
      r.style.setProperty("--vg-mx", cx.toFixed(3));
      r.style.setProperty("--vg-my", cy.toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onGiro, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onGiro);
    };
  }, [activo, paralaje, reduced]);

  // ── v111 ERA: overlay global de la máquina del tiempo ──
  // Capa fija sin puntero: tinte (mix-blend), líneas CRT y viñeta.
  // En 2020 no se monta nada (cero coste, cero filtros).
  if (era === "2020") return null;

  return (
    <div aria-hidden className="v111-era-capa" data-era={era} style={{ zIndex: 45 }}>
      <div
        className="absolute inset-0"
        style={{ background: eraDef.tinte, mixBlendMode: eraDef.mezcla as never, opacity: 0.9 }}
      />
      {eraDef.scan > 0 && (
        <div
          className="absolute inset-0 v111-era-scan"
          style={{ opacity: eraDef.scan }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 46%, rgba(0,0,0,${eraDef.vineta}) 100%)`,
        }}
      />
      {eraDef.flicker && <div className="absolute inset-0 v111-era-flicker bg-black" />}
      <div
        className="absolute bottom-1.5 right-2 font-mono text-[8px] tracking-[0.4em] pointer-events-none"
        style={{ color: "rgba(255,255,255,0.22)" }}
      >
        ERA {era}
      </div>
    </div>
  );
}
