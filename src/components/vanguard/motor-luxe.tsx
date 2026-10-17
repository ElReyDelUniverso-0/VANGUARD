"use client";

// ============================================================
// v126.0 LA CASA · ATELIER — MOTOR DEL LUJO
// Montado en el layout raíz (page.tsx): traduce el estado del
// Atelier a atributos del <html> y CSS vars (contrato 60 FPS:
// escribe atributos/vars, cero re-render de la casa):
//   html[data-galeria="on"] : MODO GALERÍA (Ley 1 · espacio negativo)
//   html[data-acabado]      : material vigente (Ley 2 · texturas)
//   --vg-sello              : hex del acabado para sellos y grabados
// Además forja la SERIE del visitante una única vez (Ley 4).
// ============================================================
import { useEffect } from "react";
import { useLuxe } from "@/lib/luxe-store";
import { acabadoDe } from "@/lib/luxe";

export function MotorLuxe() {
  const acabado = useLuxe((s) => s.acabado);
  const galeria = useLuxe((s) => s.galeria);
  const serie = useLuxe((s) => s.serie);
  const forjar = useLuxe((s) => s.forjar);

  // La serie se graba en la primera visita (solo cliente, una vez)
  useEffect(() => {
    const id = requestAnimationFrame(() => forjar());
    return () => cancelAnimationFrame(id);
  }, [forjar]);

  useEffect(() => {
    const r = document.documentElement;
    if (galeria) r.dataset.galeria = "on";
    else delete r.dataset.galeria;
    r.dataset.acabado = acabado;
    r.style.setProperty("--vg-sello", acabadoDe(acabado).hex);
  }, [acabado, galeria]);

  // serie leída solo para suscribir el motor al grabado (sin render)
  useEffect(() => {
    if (serie) document.documentElement.dataset.serie = serie;
  }, [serie]);

  return null;
}
