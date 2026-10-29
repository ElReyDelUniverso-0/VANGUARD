"use client";

// v198.0 LA CASA LIGERA — MANIFIESTO MUNDIAL con casa propia.
// Viviaba DENTRO de empleos-panel.tsx (674 líneas): al importarlo la
// portada arrastraba el panel de EMPLEOS COMPLETO al bundle inicial
// solo para pintar una cita de 12 líneas. Con archivo propio, el
// manifiesto pesa lo que dice y el panel de empleos baja cuando lo
// abres. Ni un píxel cambia: mismo bloque, misma casa.

import { Quote } from "lucide-react";

// ====== MANIFIESTO — la idea que ordena todo Vanguard v85 ======
export function ManifiestoMundo() {
  return (
    <div className="relative overflow-hidden border border-amber-hud/40 bg-gradient-to-br from-amber-hud/15 via-transparent to-transparent p-4">
      <Quote className="absolute top-2 right-3 w-8 h-8 text-amber-hud/15 rotate-180" aria-hidden />
      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-hud mb-1.5">manifiesto vanguard</p>
      <p className="text-sm sm:text-base font-black leading-snug text-foreground">
        Vanguard no es parte del mundo.
        <span className="text-amber"> El mundo está dentro de Vanguard.</span>
      </p>
      <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
        Cada frente, cada estrecho, cada crisis en vivo corre por aquí. Y ahora también
        trabaja aquí: oficinas, nóminas, turnos y carreras. Tu sueldo lo paga el planeta.
      </p>
    </div>
  );
}
