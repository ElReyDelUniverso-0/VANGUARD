"use client";

// ============================================================
// v126.0 LA CASA · ATELIER — MOTOR DEL LUJO
// Montado en el layout raíz (page.tsx): traduce el estado del
// Atelier a atributos del <html> y CSS vars (contrato 60 FPS:
// escribe atributos/vars, cero re-render de la casa):
//   html[data-galeria="on"] : MODO GALERÍA (Ley 1 · espacio negativo)
//   html[data-acabado]      : material vigente (Ley 2 · texturas)
//   --vg-sello / --vg-mat / --vg-luxe : hex del acabado para sellos,
//     grabados, muestras y —desde v133— para el cromo entero de la
//     casa (globals.css redibuja --hud-amber bajo html[data-acabado]).
// Además forja la SERIE del visitante una única vez (Ley 4).
// v133.0 EL ACABADO REAL:
//   · La forja espera a la REHIDRATACIÓN (skipHydration de v132):
//     antes, forjar() corría antes del rehydrate y la cerradura de
//     storage-blindado descartaba la escritura — la serie de un
//     visitante nuevo se regeneraba en cada visita. Ahora se graba
//     UNA sola vez de verdad.
//   · La campana del salón (Ley 2) suena SOLO cuando el visitante
//     cambia de material — nunca en el arranque.
// ============================================================
import { useEffect, useRef } from "react";
import { useLuxe } from "@/lib/luxe-store";
import { acabadoDe } from "@/lib/luxe";

export function MotorLuxe() {
  const acabado = useLuxe((s) => s.acabado);
  const galeria = useLuxe((s) => s.galeria);
  const serie = useLuxe((s) => s.serie);
  const forjar = useLuxe((s) => s.forjar);

  // v133: la serie se graba en la primera visita PERO solo tras la
  // rehidratación — así la cerradura del storage ya está abierta y
  // el grabado entra en placa de verdad (nunca se re-forja).
  useEffect(() => {
    const hidió = () => {
      const id = requestAnimationFrame(() => useLuxe.getState().forjar());
      return () => cancelAnimationFrame(id);
    };
    if (useLuxe.persist.hasHydrated()) return hidió();
    const desuscribir = useLuxe.persist.onFinishHydration(hidió);
    return () => { desuscribir(); };
  }, []);

  useEffect(() => {
    const r = document.documentElement;
    if (galeria) r.dataset.galeria = "on";
    else delete r.dataset.galeria;
    r.dataset.acabado = acabado;
    const hex = acabadoDe(acabado).hex;
    r.style.setProperty("--vg-sello", hex);
    r.style.setProperty("--vg-mat", hex);
    r.style.setProperty("--vg-luxe", hex);
  }, [acabado, galeria]);

  // serie leída solo para suscribir el motor al grabado (sin render)
  useEffect(() => {
    if (serie) document.documentElement.dataset.serie = serie;
  }, [serie]);

  // v133 Ley 2: la campana del salón — suena solo al CAMBIAR de material
  // (comparado con el valor previo, no con el arranque)
  const prevAcabado = useRef<string | null>(null);
  useEffect(() => {
    const antes = prevAcabado.current;
    prevAcabado.current = acabado;
    if (antes !== null && antes !== acabado) {
      import("@/lib/sound").then(({ sfx }) => { try { sfx.campana(); } catch { /* el salón calla */ } });
    }
  }, [acabado]);

  return null;
}
