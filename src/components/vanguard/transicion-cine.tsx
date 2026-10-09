"use client";

// VANGUARD v96.0 · GOOGLE VIVO — TRANSICIÓN DE CINE
// Al cambiar de mundo, un barrido de luz del atardecer cruza la pantalla:
// tres bandas de gradiente + línea de escaneo + sello de versión. Solo
// transform/opacity (60fps), se auto-desactiva con prefers-reduced-motion.
import { useEffect, useState } from "react";

export function TransicionCine({ tabKey, label }: { tabKey: string; label: string }) {
  // patrón React "ajustar estado cuando cambia una prop" (render-time, sin efecto).
  // En el primer montaje prev === tabKey, así que no hay barrido de estreno.
  const [prev, setPrev] = useState(tabKey);
  const [play, setPlay] = useState(false);

  if (prev !== tabKey) {
    setPrev(tabKey);
    setPlay(true);
  }

  // apagar el barrido cuando termina su ciclo (setTimeout = callback, no síncrono)
  useEffect(() => {
    if (!play) return;
    const timer = setTimeout(() => setPlay(false), 620);
    return () => clearTimeout(timer);
  }, [play]);

  if (!play) return null;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  return (
    <div className="transicion-cine" aria-hidden>
      <span className="tc-banda tc-banda-1" />
      <span className="tc-banda tc-banda-2" />
      <span className="tc-banda tc-banda-3" />
      <span className="tc-scan" />
      <span className="tc-sello font-mono">{label}</span>
    </div>
  );
}
