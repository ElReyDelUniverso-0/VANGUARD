"use client";

// ═══════════════════════════════════════════════════════════════════
// v421.9 · LA CORTINA — el arranque se siente como un tráiler
//
// Una vez por sesión (sessionStorage), 1,7 s, se va sola y se quita con un
// toque, una tecla o la primera rueda del ratón. No se renderiza en el
// servidor (no hay HTML que estorbe al rastreo) y no aparece si el sistema
// pide menos movimiento o si la casa tiene las animaciones desactivadas.
//
// No bloquea nada: no hay peticiones, ni vídeo, ni audio. Es luz y letra.
// ═══════════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";

const CLAVE = "vx421-cortina";

export function Cortina() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // una sola vez por sesión
    try {
      if (sessionStorage.getItem(CLAVE) === "1") return;
      sessionStorage.setItem(CLAVE, "1");
    } catch {
      /* modo privado: se muestra igual */
    }
    // respeto al sistema y al nivel de animación de la casa
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.getAttribute("data-vg-anim") === "desactivadas") return;
    // si la pestaña está en segundo plano (Google, prefetch), no gastar la cortina
    if (document.visibilityState === "hidden") return;

    setVisible(true);
    const fuera = window.setTimeout(() => setVisible(false), 2100);
    const cerrar = () => setVisible(false);
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") cerrar();
    };
    window.addEventListener("keydown", tecla);
    window.addEventListener("wheel", cerrar, { passive: true, once: true });
    window.addEventListener("touchstart", cerrar, { passive: true, once: true });
    return () => {
      window.clearTimeout(fuera);
      window.removeEventListener("keydown", tecla);
      window.removeEventListener("wheel", cerrar);
      window.removeEventListener("touchstart", cerrar);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="vida-cortina"
      role="presentation"
      onClick={() => setVisible(false)}
      style={{ cursor: "pointer" }}
    >
      <div>
        <p className="vida-cortina-marca">VANGUARD</p>
        <p className="vida-cortina-lema">El mundo, en tiempo real</p>
        <div className="vida-cortina-linea" />
      </div>
    </div>
  );
}
