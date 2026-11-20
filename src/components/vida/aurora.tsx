"use client";

// ═══════════════════════════════════════════════════════════════════
// v421.9 · LA AURORA — el fondo deja de ser negro
//
// Cuatro orbes de luz que respiran (CSS puro: solo transform y opacidad, así
// el texto encima no se repinta) y un foco suave que sigue al puntero.
// En táctil no hay foco (no existe puntero) y el CSS ya apaga la animación
// si el sistema pide menos movimiento.
// ═══════════════════════════════════════════════════════════════════
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function Aurora() {
  const ruta = usePathname();
  const foco = useRef<HTMLDivElement>(null);
  // la casa inmersiva no lleva capas 2D encima (mandato v151.0)
  const inmersiva = ruta?.startsWith("/vanguard2") ?? false;

  useEffect(() => {
    const el = foco.current;
    if (!el || inmersiva) return;
    // sin puntero (táctil) no hay foco que seguir
    if (typeof window.matchMedia === "function" && window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    const pintar = () => {
      raf = 0;
      el.style.setProperty("--vida-x", `${x}px`);
      el.style.setProperty("--vida-y", `${y}px`);
    };
    const mover = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = window.requestAnimationFrame(pintar);
    };
    window.addEventListener("pointermove", mover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", mover);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [inmersiva]);

  if (inmersiva) return null;

  return (
    <div aria-hidden="true">
      <div className="vida-aurora">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="vida-foco" ref={foco} />
    </div>
  );
}
