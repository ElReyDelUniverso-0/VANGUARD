"use client";

// ============================================================
// v121.0 LA CAMA MÁS CÓMODA — TRANSICIÓN MAESTRA
// "haz movimientos al cambiar de sección": el dueño ELIGE cómo
// viaja entre salas. 6 estilos (ORO CAVIAR v124, deslizar, cine3d,
// telón, hiperespacio, disolver) renderizados como capas fijas de
// puro transform/opacity (60 FPS) + sello de versión. Se apaga con
// prefers-reduced-motion. Sustituye y amplía a TransicionCine.
// ============================================================
import { useEffect, useState } from "react";
import { useCama } from "@/lib/cama-store";

export function TransicionMaestra({ tabKey, label }: { tabKey: string; label: string }) {
  const estilo = useCama((s) => s.transicion);
  const [prev, setPrev] = useState(tabKey);
  const [play, setPlay] = useState(false);

  // patrón React "ajustar estado cuando cambia una prop" (render-time)
  if (prev !== tabKey) {
    setPrev(tabKey);
    setPlay(true);
  }

  useEffect(() => {
    if (!play) return;
    const timer = setTimeout(() => setPlay(false), 680);
    return () => clearTimeout(timer);
  }, [play]);

  if (!play) return null;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  return (
    <div className="transicion-maestra" aria-hidden data-estilo={estilo}>
      {estilo === "oro" && (
        <>
          {/* v124 CAVIAR: telas de terciopelo noir con bastilla de oro */}
          <span className="tm-oro-tela tm-oro-tela-sup" />
          <span className="tm-oro-tela tm-oro-tela-inf" />
          <span className="tm-oro-costura" />
          <span className="tm-oro-mota tm-oro-mota-1" />
          <span className="tm-oro-mota tm-oro-mota-2" />
          <span className="tm-oro-mota tm-oro-mota-3" />
        </>
      )}
      {estilo === "deslizar" && (
        <>
          <span className="tm-banda tm-banda-1" />
          <span className="tm-banda tm-banda-2" />
          <span className="tm-banda tm-banda-3" />
          <span className="tm-scan" />
        </>
      )}
      {estilo === "cine3d" && (
        <>
          <span className="tm-puerta tm-puerta-izq" />
          <span className="tm-puerta tm-puerta-der" />
          <span className="tm-eje" />
        </>
      )}
      {estilo === "telon" && (
        <>
          <span className="tm-telon tm-telon-sup" />
          <span className="tm-telon tm-telon-inf" />
          <span className="tm-flecos" />
        </>
      )}
      {estilo === "hiperespacio" && (
        <>
          <span className="tm-tunel" />
          <span className="tm-anillo tm-anillo-1" />
          <span className="tm-anillo tm-anillo-2" />
          <span className="tm-estela" />
        </>
      )}
      {estilo === "disolver" && <span className="tm-velo" />}
      <span className={`tm-sello font-mono ${estilo === "disolver" ? "tm-sello-calma" : ""} ${estilo === "oro" ? "tm-sello-oro" : ""}`}>{label}</span>
    </div>
  );
}
