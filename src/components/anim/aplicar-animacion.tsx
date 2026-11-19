"use client";

import { useEffect } from "react";
import {
  ATRIBUTO_OCULTO,
  SELECTOR_CONTINUAS,
  aplicarNivel,
  nivelActual,
  suscribirNivel,
} from "@/lib/anim/preferencia";

// ═══════════════════════════════════════════════════════════════════
// v416.0 · EL VIGILANTE DE ANIMACIONES
//
// Tres trabajos, ninguno visible:
//  ① sincronizar el <html> con la preferencia guardada (y con los cambios
//    que haga el selector de ajustes en otra pestaña);
//  ② marcar la pestaña oculta para que el CSS pause todo (`visibilitychange`);
//  ③ pausar las animaciones decorativas que salen de pantalla
//    (`IntersectionObserver`), incluidos los nodos que se montan después.
//
// No dibuja nada y no re-renderiza: todo se hace con atributos.
// ═══════════════════════════════════════════════════════════════════

export function AplicarAnimacion() {
  useEffect(() => {
    // ① el nivel vigente, ya resuelto por el script de arranque
    aplicarNivel(nivelActual());
    const dejarDeEscuchar = suscribirNivel((nivel) => aplicarNivel(nivel));

    // ② pestaña oculta
    const alCambiarVisibilidad = () => {
      if (document.hidden) document.documentElement.setAttribute(ATRIBUTO_OCULTO, "1");
      else document.documentElement.removeAttribute(ATRIBUTO_OCULTO);
    };
    alCambiarVisibilidad();
    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    // ③ lo que no se ve, no se anima
    const observador =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(
            (entradas) => {
              for (const e of entradas) {
                const el = e.target as HTMLElement;
                if (e.isIntersecting) el.removeAttribute("data-vg-pausa");
                else el.setAttribute("data-vg-pausa", "1");
              }
            },
            { rootMargin: "120px" }
          )
        : null;

    const observar = () => {
      if (!observador) return;
      document.querySelectorAll<HTMLElement>(SELECTOR_CONTINUAS).forEach((el) => {
        if (el.dataset.vgObservado === "1") return;
        el.dataset.vgObservado = "1";
        observador.observe(el);
      });
    };

    observar();

    // los paneles y escenas se montan tarde: se observan al aparecer,
    // con una espera de 250 ms para no mirar el DOM en cada mutación
    let pendiente: ReturnType<typeof setTimeout> | null = null;
    const vigilante =
      typeof MutationObserver === "function"
        ? new MutationObserver(() => {
            if (pendiente) return;
            pendiente = setTimeout(() => {
              pendiente = null;
              observar();
            }, 250);
          })
        : null;
    vigilante?.observe(document.body, { childList: true, subtree: true });

    return () => {
      dejarDeEscuchar();
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      if (pendiente) clearTimeout(pendiente);
      vigilante?.disconnect();
      observador?.disconnect();
    };
  }, []);

  return null;
}
