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
// v112.0 SOLSTICIO — el pulido de la máquina:
//   · ERA POR SALA: presets que visten cada sala de su época al
//     entrar (la MURALLA en 1950, el AUDITORIO en 2100...) y
//     devuelven la casa a la era global al salir. Escucha
//     vanguard:escena (detail = clave de sección, emitida por
//     page.tsx en cada cambio de pestaña).
//   · CALIBRACIÓN FINA del giroscopio: TU pose de reposo es el
//     cero (offsets gamma/beta restados antes del clamp).
// Montado en el layout raíz: traduce los ajustes del usuario
// (useEstilo3D) a CSS vars en :root. Contrato 60 FPS: solo CSS
// vars + capas fijas estáticas (sin re-render de React).
//   --vg-3d-i   : intensidad 0..1
//   --vg-3d-tilt: 1 | 0 (tilt personal on/off)
//   --vg-3d-filtro: filtro CSS de la era para .v110-escena
//   --vg-mx/--vg-my : -1..1 posición del puntero/giroscopio
// ============================================================
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useEstilo3D, ERAS, eraVivaDe, type EraKey } from "@/lib/estilo3d";

export function Motor3D() {
  const { activo, intensidad, inclinar, paralaje, era, presetsOn, presetsEra } = useEstilo3D();
  const reduced = useReducedMotion();
  // v112: la SALA donde estás (sección) gobierna el preset de era. Arranca de
  // sessionStorage (el restore de page.tsx la escribe ANTES de que este chunk
  // lazy llegue a montarse — la carrera del dispatch ya no importa).
  const [sala, setSala] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem("vg-sala-activa") || null;
    } catch {
      return null;
    }
  });
  const eraViva: EraKey = eraVivaDe({ era, presetsOn, presetsEra }, sala);
  const eraDef = ERAS[eraViva] ?? ERAS["2100"];

  // v112: escuchar los cambios de sala (page.tsx emite vanguard:escena
  // con la clave de sección en cada cambio de pestaña).
  useEffect(() => {
    const onSala = (e: Event) => {
      const key = (e as CustomEvent).detail;
      if (typeof key === "string") setSala(key);
    };
    window.addEventListener("vanguard:escena", onSala);
    return () => window.removeEventListener("vanguard:escena", onSala);
  }, []);

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
    // v111 GIROSCOPIO + v112 CALIBRACIÓN: gamma (izq/der ±45°) y beta
    // (arriba/abajo) mapean al mismo objetivo tx/ty del paralaje — la mano
    // mueve la matriz entera. Los offsets de TU pose de reposo (gyroCal)
    // se restan ANTES del clamp: donde calibraste, el cero es el cero.
    const onGiro = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      const cal = useEstilo3D.getState().gyroCal;
      const g = Math.max(-45, Math.min(45, e.gamma - cal.x));
      const b = Math.max(-45, Math.min(45, e.beta - 30 - cal.y)); // 30° = teléfono en mano
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
    // v112: el giroscopio solo escucha cuando SU toggle está activo (defecto
    // de v111 cazado al calibrar: el listener vivía aunque lo apagaras — en
    // Android la matriz se inclinaba sin permiso).
    let gyroOn = useEstilo3D.getState().giroscopio;
    const onGiroFlag = (st: { giroscopio: boolean }) => {
      if (st.giroscopio === gyroOn) return;
      gyroOn = st.giroscopio;
      if (gyroOn) window.addEventListener("deviceorientation", onGiro, { passive: true });
      else {
        tx = 0; ty = 0;
        window.removeEventListener("deviceorientation", onGiro);
      }
    };
    const unsubGiroFlag = useEstilo3D.subscribe(onGiroFlag);
    if (gyroOn) window.addEventListener("deviceorientation", onGiro, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      unsubGiroFlag();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onGiro);
    };
  }, [activo, paralaje, reduced]);

  // ── v111 ERA: overlay global de la máquina del tiempo ──
  // Capa fija sin puntero: tinte (mix-blend), líneas CRT y viñeta.
  // En 2020 no se monta nada (cero coste, cero filtros).
  if (eraViva === "2020") return null;

  // v112: cuando un preset de sala viste la casa, la etiqueta lo dice
  const esPreset = !!sala && presetsOn && !!presetsEra[sala];

  return (
    <div aria-hidden className="v111-era-capa" data-era={eraViva} style={{ zIndex: 45 }}>
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
        {esPreset ? `ERA ${eraViva} · ${sala?.toUpperCase()}` : `ERA ${eraViva}`}
      </div>
    </div>
  );
}
