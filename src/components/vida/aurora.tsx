"use client";

// ═══════════════════════════════════════════════════════════════════
// v422.3 · LA AURORA 2 — cinco orbes con PARALAJE
//
// El fondo responde al puntero: cada movimiento mueve la aurora un poco (no
// el texto), así la casa se siente viva sin marear. Solo se escribe una
// variable CSS por frame (`--vida-px/--vida-py`) y el CSS interpola: cero
// repintados del contenido.
//
// Se apaga entera si: no hay puntero (táctil), el sistema pide menos
// movimiento, o estamos en la casa inmersiva (/vanguard2, 3D sin capas 2D).
// ═══════════════════════════════════════════════════════════════════
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function Aurora() {
  const ruta = usePathname();
  const caja = useRef<HTMLDivElement>(null);
  const foco = useRef<HTMLDivElement>(null);
  const inmersiva = ruta?.startsWith("/vanguard2") ?? false;

  useEffect(() => {
    if (inmersiva) return;
    const aurora = caja.current;
    const el = foco.current;
    if (!aurora || !el) return;
    if (typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    const pintar = () => {
      raf = 0;
      const { innerWidth: w, innerHeight: h } = window;
      // −1 … 1 desde el centro de la pantalla
      const nx = w > 0 ? (x / w - 0.5) * 2 : 0;
      const ny = h > 0 ? (y / h - 0.5) * 2 : 0;
      aurora.style.setProperty("--vida-px", nx.toFixed(3));
      aurora.style.setProperty("--vida-py", ny.toFixed(3));
      el.style.setProperty("--vida-x", `${Math.round(x)}px`);
      el.style.setProperty("--vida-y", `${Math.round(y)}px`);
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
      <div className="vida-aurora" ref={caja}>
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="vida-foco" ref={foco} />
    </div>
  );
}
