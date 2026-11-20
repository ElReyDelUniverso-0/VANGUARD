"use client";

// ═══════════════════════════════════════════════════════════════════
// v422.3 · LA CORTINA 2 — el arranque en tres tiempos
//
//   1) la marca entra desenfocada y se enfoca (0,0 → 0,7 s)
//   2) el lema sube                                  (0,25 s)
//   3) los módulos reales parpadean uno a uno        (0,45 → 1,2 s)
//   y la línea se llena mientras tanto. A los 1,7 s se va sola.
//
// Una vez por sesión. Se quita con un toque, una tecla o la rueda. No se
// gasta si la pestaña está en segundo plano (prefetch). No se pinta en el
// servidor: cero HTML extra para los rastreadores.
// ═══════════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { MODULOS } from "@/components/portada/modulos";

const CLAVE = "vx421-cortina";
const ECO = ["Conflictos", "Mapa 3D", "Datos vivos", "Secretos", "Arsenal", "Medios"];

export function Cortina() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(CLAVE) === "1") return;
      sessionStorage.setItem(CLAVE, "1");
    } catch {
      /* modo privado: se muestra igual */
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.getAttribute("data-vg-anim") === "desactivadas") return;
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

  // los módulos reales de la casa, en su orden, sin inventar nombres
  const eco = MODULOS.length > 0 ? MODULOS.slice(0, 6).map((m) => m.corto || m.nombre) : ECO;

  return (
    <div className="vida-cortina" role="presentation" onClick={() => setVisible(false)}>
      <div className="vida-cortina-caja">
        <p className="vida-cortina-marca">VANGUARD</p>
        <p className="vida-cortina-lema">Sistema clasificado · acceso autorizado</p>
        <ul className="vida-cortina-mods" aria-hidden="true">
          {eco.map((n, i) => (
            <li key={n} style={{ animationDelay: `${440 + i * 110}ms` }}>
              {n}
            </li>
          ))}
        </ul>
        <div className="vida-cortina-linea" />
        <p className="vida-cortina-salta">Pulsa para entrar · protocolo 05</p>
      </div>
    </div>
  );
}
