"use client";

// ============================================================
// v191.0 EL PULSO TEATRAL — animaciones de Vanguard EN CIERTO TIEMPO.
// Mandato del Dueño: «haz que Vanguard pueda tener en cierto tiempo
// animaciones». Lección grabada a fuego (v177–v189): NINGUNA animación
// puede tapar la casa ni parecerse a una carga. Por eso este pulso:
//
//   · cada 6 min (localStorage vg191-anim lo afinca; QA usa 8000),
//   · dura 2.8s y SE VA SOLO (barras de cine + titular del mundo),
//   · JAMÁS antes de los 75s de vida (la casa primero),
//   · JAMÁS con la pestaña oculta ni con movimiento reducido,
//   · JAMÁS con la casa muerta (__vgvivo debe estar vivo),
//   · pointer-events:none (no bloquea un solo toque),
//   · z por debajo de los diálogos, solo transform/opacity (60 FPS),
//   · sin fotos que bajar (0 bytes de red — puro CSS).
// ============================================================

import { useEffect, useRef, useState } from "react";

const TEATRO_MS = 2_800; // duración del telón
const PRIMERA_ESPERA = 75_000; // la casa respira primero

interface Cable {
  t: string; // titular
  o: string; // origen
}

const CABLES_FIJOS: Cable[] = [
  { t: "EL MUNDO NO DUERME · VANGUARD TAMPOCO", o: "LA REDACCIÓN" },
  { t: "NUEVOS PULSOS EN TU FEED PARA TI", o: "EL PRODUCTOR" },
  { t: "LOS CONFLICTOS EN VIVO · 24/7", o: "SALA DE GUERRA" },
  { t: "EL COLISEO GLOBAL ESPERA TU VOTO", o: "PREDICCIONES" },
];

export function PulsoTeatral() {
  const [cable, setCable] = useState<Cable | null>(null);
  const ocupado = useRef(false);

  useEffect(() => {
    let vivo = true;
    let timer = 0;

    const ritmo = (): number => {
      try {
        const v = Number(localStorage.getItem("vg191-anim") || 0);
        if (v >= 5_000) return v; // QA
      } catch { /* noop */ }
      return 360_000; // 6 min en producción
    };

    const cogerCable = async (): Promise<Cable> => {
      try {
        const r = await fetch("/api/news?limit=4", { cache: "no-store" });
        if (r.ok) {
          const j = (await r.json()) as { items?: { title?: string; domain?: string }[] };
          const its = (j.items ?? []).filter((x) => x.title);
          if (its.length > 0) {
            const it = its[Math.floor(Math.random() * its.length)];
            return { t: String(it.title).slice(0, 120).toUpperCase(), o: String(it.domain || "LA AGENCIA").toUpperCase() };
          }
        }
      } catch { /* cae al fijo */ }
      return CABLES_FIJOS[Math.floor(Math.random() * CABLES_FIJOS.length)];
    };

    const representa = async () => {
      if (!vivo || ocupado.current) return;
      if (typeof document !== "undefined" && document.hidden) { timer = window.setTimeout(representa, 15_000); return; }
      try { if ((window as unknown as { __vgvivo?: boolean }).__vgvivo !== true) { timer = window.setTimeout(representa, 20_000); return; } } catch { /* sin señal aún */ }
      let reducido = false;
      try { reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* noop */ }
      if (reducido) { timer = window.setTimeout(representa, ritmo()); return; }
      ocupado.current = true;
      const c = await cogerCable();
      if (!vivo) { ocupado.current = false; return; }
      setCable(c);
      window.setTimeout(() => { if (vivo) setCable(null); ocupado.current = false; }, TEATRO_MS + 200);
      timer = window.setTimeout(representa, ritmo());
    };

    timer = window.setTimeout(representa, Math.max(PRIMERA_ESPERA, ritmo()));
    return () => { vivo = false; window.clearTimeout(timer); };
  }, []);

  if (!cable) return null;
  return (
    <div className="vg191-teatro" role="presentation" aria-hidden>
      <b />
      <span>
        <em>{cable.o} · VANGUARD EN VIVO</em>
        {cable.t}
      </span>
      <i />
    </div>
  );
}
