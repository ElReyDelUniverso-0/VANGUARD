"use client";

import { useSyncExternalStore, useCallback } from "react";
import {
  NIVELES,
  type NivelAnimacion,
  guardarNivel,
  nivelActual,
  nivelGuardado,
  olvidarNivel,
  suscribirNivel,
} from "@/lib/anim/preferencia";

// ═══════════════════════════════════════════════════════════════════
// v416.0 · EL SELECTOR DE ANIMACIONES — tres opciones, guardadas
//
// Se monta en los ajustes del cuartel y en /modo. Guarda en el aparato y
// aplica en el acto: el visitante ve el cambio sin recargar.
// Sin dependencias nuevas; los botones son botones de verdad (`aria-pressed`).
// ═══════════════════════════════════════════════════════════════════

export function SelectorAnimacion({ compacto = false }: { compacto?: boolean }) {
  const nivel = useSyncExternalStore<NivelAnimacion>(
    (cb) => suscribirNivel(cb),
    () => nivelActual(),
    () => "completas" as NivelAnimacion
  );
  const elegidoAMano = useSyncExternalStore<boolean>(
    (cb) => suscribirNivel(cb),
    () => nivelGuardado() !== null,
    () => false
  );

  const elegir = useCallback((id: NivelAnimacion) => {
    guardarNivel(id);
  }, []);

  const info = NIVELES.find((n) => n.id === nivel) ?? NIVELES[0];

  return (
    <div>
      {!compacto && (
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300/90">
            Animaciones
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
            {elegidoAMano ? "tu elección · guardada" : "automática según el aparato"}
          </span>
        </div>
      )}
      <div className="vg-anim-sel" role="group" aria-label="Nivel de animación">
        {NIVELES.map((n) => (
          <button
            key={n.id}
            type="button"
            className="vg-anim-op"
            aria-pressed={nivel === n.id}
            onClick={() => elegir(n.id)}
            title={n.detalle}
          >
            {n.nombre}
          </button>
        ))}
      </div>
      <p className="vg-anim-nota">
        <strong className="text-zinc-300">{info.resumen}</strong> {info.detalle}
      </p>
      {elegidoAMano && (
        <button
          type="button"
          onClick={() => olvidarNivel()}
          className="mt-1 font-mono text-[9px] uppercase tracking-wider text-zinc-500 underline decoration-zinc-700 underline-offset-2 hover:text-amber-300"
        >
          Volver a la elección automática
        </button>
      )}
    </div>
  );
}
