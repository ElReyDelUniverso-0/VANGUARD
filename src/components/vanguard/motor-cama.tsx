"use client";

// ============================================================
// v121.0 LA CAMA MÁS CÓMODA — MOTOR DE LA CAMA
// Montado en el layout raíz (page.tsx): traduce las preferencias
// del dueño a CSS vars en :root y al atributo html:
//   --vg-escala : escala tipográfica global (html font-size)
//   --vg-acento : color personal (selección, scroll, bordes)
//   --vg-mov    : intensidad de movimiento 0..1.2
//   --vg-kdur   : duración base de los keyframes de la casa
//   html[data-densidad] : compacta/normal/amplia
//   html.modo-cama : tinte cálido de ocaso (overlay fijo, NUNCA
//     filter en body — rompería los fixed) + calma de movimiento
//   html.auto-cama-activa : el auto-cama puso el modo cama solo
// Contrato 60 FPS: escribe CSS vars, cero re-render de la casa.
// ============================================================
import { useEffect } from "react";
import { useCama, esHoraDeCama } from "@/lib/cama-store";

export function MotorCama() {
  const letraEscala = useCama((s) => s.letraEscala);
  const acento = useCama((s) => s.acento);
  const movimiento = useCama((s) => s.movimiento);
  const densidad = useCama((s) => s.densidad);
  const modoCama = useCama((s) => s.modoCama);
  const autoCama = useCama((s) => s.autoCama);

  // CSS vars directos de las preferencias
  useEffect(() => {
    const r = document.documentElement;
    // modo cama pide calma: si está activo, el movimiento efectivo baja
    const movEfectivo = modoCama ? Math.min(movimiento, 0.35) : movimiento;
    r.style.setProperty("--vg-escala", String(letraEscala));
    r.style.setProperty("--vg-acento", acento);
    r.style.setProperty("--vg-mov", String(movEfectivo));
    // duración de keyframes: a más movimiento, más vivo (0.7x..1.6x)
    const kdur = movEfectivo <= 0.01 ? 999 : 1.4 / Math.max(0.7, movEfectivo);
    r.style.setProperty("--vg-kdur", `${kdur.toFixed(2)}s`);
    r.dataset.densidad = densidad;
  }, [letraEscala, acento, movimiento, densidad, modoCama]);

  // AUTO-CAMA: reloj de la sala — revisa cada minuto si toca cama
  useEffect(() => {
    if (!autoCama) {
      document.documentElement.classList.remove("auto-cama-activa");
      return;
    }
    const aplica = () => {
      const toca = esHoraDeCama();
      document.documentElement.classList.toggle("auto-cama-activa", toca);
    };
    aplica();
    const id = setInterval(aplica, 60_000);
    return () => clearInterval(id);
  }, [autoCama]);

  // MODO CAMA (manual o automático) — la clase gobierna el tinte cálido
  useEffect(() => {
    const r = document.documentElement;
    r.classList.toggle("modo-cama", modoCama);
    return () => r.classList.remove("modo-cama");
  }, [modoCama]);

  return null;
}
