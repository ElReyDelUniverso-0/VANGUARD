"use client";

// ═══════════════════════════════════════════════════════════════════
// v422.3 · EL PULSO DE LA LECTURA
//
// Dos cosas pequeñas que cambian cómo se siente la casa:
//
//   1) UNA LÍNEA DE LUZ ARRIBA que dice cuánto llevas leído (se escribe una
//      variable CSS por frame; nada de re-render de React).
//   2) LA APARICIÓN AL DESPLAZAR: los bloques marcados con `data-vida-ver`
//      entran cuando asoman. Solo se activan si este componente monta (pone
//      `.vida-mira` en <html>), así que sin JS todo se ve igual, y hay una red
//      de seguridad a los 1,5 s por si el observador no dispara.
//
// Respeta `prefers-reduced-motion` y `data-vg-anim="desactivadas"`: en esos
// casos no hay animación, pero el contenido se ve siempre.
// ═══════════════════════════════════════════════════════════════════
import { useEffect, useRef } from "react";

export function Progreso() {
  const barra = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiz = document.documentElement;

    // ── 1 · progreso de lectura
    let raf = 0;
    const pintar = () => {
      raf = 0;
      const el = barra.current;
      if (!el) return;
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      const p = alto > 0 ? Math.min(1, Math.max(0, window.scrollY / alto)) : 0;
      el.style.setProperty("--vida-avance", p.toFixed(4));
    };
    const alDesplazar = () => {
      if (!raf) raf = window.requestAnimationFrame(pintar);
    };
    window.addEventListener("scroll", alDesplazar, { passive: true });
    window.addEventListener("resize", alDesplazar, { passive: true });
    pintar();

    // ── 2 · aparición al desplazar
    const quieto =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches || raiz.getAttribute("data-vg-anim") === "desactivadas";

    let observador: IntersectionObserver | null = null;
    let red: number | undefined;
    const mostrarTodo = () => {
      document.querySelectorAll<HTMLElement>("[data-vida-ver]").forEach((n) => n.setAttribute("data-visible", "1"));
    };

    if (quieto) {
      mostrarTodo();
    } else if (typeof IntersectionObserver === "undefined") {
      // sin observador no se esconde nada: la casa se ve igual
      mostrarTodo();
    } else {
      raiz.classList.add("vida-mira");
      observador = new IntersectionObserver(
        (entradas) => {
          for (const e of entradas) {
            if (e.isIntersecting) {
              (e.target as HTMLElement).setAttribute("data-visible", "1");
              observador?.unobserve(e.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
      );
      document.querySelectorAll("[data-vida-ver]").forEach((n) => observador?.observe(n));
      // red de seguridad: nada se queda invisible
      red = window.setTimeout(mostrarTodo, 1500);
    }

    return () => {
      window.removeEventListener("scroll", alDesplazar);
      window.removeEventListener("resize", alDesplazar);
      if (raf) window.cancelAnimationFrame(raf);
      if (red) window.clearTimeout(red);
      observador?.disconnect();
    };
  }, []);

  return <div className="vida-progreso" ref={barra} aria-hidden="true" />;
}
