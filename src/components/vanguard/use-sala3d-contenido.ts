"use client";

// ============================================================
// v148.0 — EMISOR UNIVERSAL DE SALAS DE CONTENIDO
// El puente entre los paneles DOM y el mundo 3D para TODAS las
// ramas sin constructor insignia: el panel manda sus filas reales
// (texto, valor, barra, imagen) por vg:sala3d-datos con tipo
// «contenido» y el mundo las levanta en volumen (salas-3d.ts,
// construirContenido). Con firma anti-churn: solo emite cuando
// los datos CAMBIAN de verdad.
// ============================================================
import { useEffect, useRef } from "react";
import type { FilaContenido3D } from "./salas-3d";

// v165: los paneles importan la fila de aquí — el emisor es la puerta única
export type { FilaContenido3D } from "./salas-3d";

export function emitirSalaContenido(
  tab: string,
  titulo: string,
  colorHex: string,
  resumen: string,
  filas: FilaContenido3D[],
) {
  try {
    const color = parseInt(colorHex.replace("#", ""), 16) || 0x7ab8ff;
    window.dispatchEvent(new CustomEvent("vg:sala3d-datos", {
      detail: { tab, titulo, color, tipo: "contenido", resumen, filas },
    }));
  } catch { /* el mundo no está: el panel vive igual */ }
}

export function useSala3DContenido(
  tab: string,
  titulo: string,
  colorHex: string,
  resumen: string,
  filas: FilaContenido3D[],
) {
  const sig = `${resumen}|${JSON.stringify(filas)}`;
  const last = useRef("");
  const vivo = useRef({ tab, titulo, colorHex, resumen, filas });
  vivo.current = { tab, titulo, colorHex, resumen, filas };
  useEffect(() => {
    if (last.current === sig) return;
    last.current = sig;
    emitirSalaContenido(tab, titulo, colorHex, resumen, filas);
  }, [sig, tab, titulo, colorHex]);
  // la carrera de arranque: si el mundo nace DESPUÉS de este panel, el
  // evento se perdió — al aparecer la cápsula se re-emite el contenido vivo
  useEffect(() => {
    const reemit = () => {
      last.current = "";
      const v = vivo.current;
      emitirSalaContenido(v.tab, v.titulo, v.colorHex, v.resumen, v.filas);
    };
    window.addEventListener("vg:wgl-capsula", reemit);
    return () => window.removeEventListener("vg:wgl-capsula", reemit);
  }, []);
}
