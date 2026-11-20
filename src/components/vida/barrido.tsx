"use client";

// ═══════════════════════════════════════════════════════════════════
// v431.1 · EL BARRIDO — cambiar de sala se siente como pasar de página
//
// Cuando cambia la ruta, una franja de luz cruza la pantalla en 0,62 s y se
// va. No bloquea clics (`pointer-events: none`), no se queda en el DOM (se
// limpia sola) y no aparece en la primera carga — ahí ya está la cortina, y
// dos efectos a la vez es ruido.
//
// Respeta `prefers-reduced-motion` y `data-vg-anim`: en el CSS el barrido se
// oculta entero, así que ni siquiera se pinta.
// ═══════════════════════════════════════════════════════════════════
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function Barrido() {
  const ruta = usePathname();
  const primera = useRef(true);
  const [n, setN] = useState(0);
  const [ver, setVer] = useState(false);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    setN((x) => x + 1);
    setVer(true);
    const t = window.setTimeout(() => setVer(false), 700);
    return () => window.clearTimeout(t);
  }, [ruta]);

  if (!ver) return null;
  return <div key={n} className="vida-barrido" aria-hidden="true" />;
}
