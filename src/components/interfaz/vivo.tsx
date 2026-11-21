"use client";

// ═══════════════════════════════════════════════════════════════════════════
// v436.2 · LA CAPA VIVA — un solo montaje para toda la casa
//
// Hace cuatro cosas y ninguna de ellas estorba:
//   ① despierta el audio en el primer gesto (sin gesto no suena nada, jamás);
//   ② escribe las perillas del Dueño en `<html>` (`data-vg-son`, `data-vg-mov`)
//      para que el CSS sepa cuánto movimiento permitir;
//   ③ escucha los `data-vg-son="…"` de CUALQUIER sala: un atributo basta para
//      que un botón tenga su sonido propio, sin tocar 380 archivos;
//   ④ responde a los cambios del sistema (prefers-reduced-motion) sin recargar.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { accionDeElemento, desbloquearSonido, suena } from "@/lib/sonido/tocar";
import { EVENTO, aplicar, leer, sistemaQuieto, type Preferencias } from "@/lib/interfaz/vivo";

export function Vivo() {
  useEffect(() => {
    desbloquearSonido();

    const pintar = () => aplicar(leer(), sistemaQuieto());
    pintar();

    // las perillas cambian en cualquier parte de la casa: se repinta aquí
    const alCambiar = () => pintar();
    window.addEventListener(EVENTO, alCambiar);

    // el sistema pide quietud o deja de pedirla: se obedece en vivo
    let mq: MediaQueryList | null = null;
    try {
      mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    } catch { /* navegador viejo: se queda en auto */ }
    const alSistema = () => pintar();
    mq?.addEventListener?.("change", alSistema);

    // ③ el delegado de sonidos: captura para que también suene si la sala
    // detiene la propagación en su propio manejador
    const alPulsar = (e: Event) => {
      const objetivo = e.target instanceof Element ? e.target : null;
      const accion = accionDeElemento(objetivo);
      if (accion) suena(accion);
    };
    document.addEventListener("click", alPulsar, true);

    return () => {
      window.removeEventListener(EVENTO, alCambiar);
      mq?.removeEventListener?.("change", alSistema);
      document.removeEventListener("click", alPulsar, true);
    };
  }, []);

  return null;
}

/** Exportado para las salas que quieran repintar las perillas a mano. */
export function repintarPreferencias(p?: Preferencias) {
  aplicar(p ?? leer(), sistemaQuieto());
}
