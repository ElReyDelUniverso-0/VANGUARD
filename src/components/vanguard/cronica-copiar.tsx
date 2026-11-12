"use client";

// ============================================================
// v367.1 EL OJO DEL DUEÑO — COPIAR EL PARTE (client, mínimo)
//
// Un botón, cero dependencias: el parte de la crónica ya viene en texto
// plano del servidor (parteEnTexto), así que aquí solo se copia. Sin PNG,
// sin librería de captura, sin red: el portapapeles es del aparato.
// Si el navegador niega el portapapeles, se dice la verdad («no se pudo») en
// vez de fingir que copió.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";

export function CronicaCopiar({ texto }: { texto: string }) {
  const [estado, setEstado] = useState<"listo" | "copiado" | "error">("listo");
  const reloj = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (reloj.current !== null) {
        window.clearTimeout(reloj.current);
        reloj.current = null;
      }
    };
  }, []);

  const copiar = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("copiado");
    } catch {
      setEstado("error");
    }
    if (reloj.current !== null) window.clearTimeout(reloj.current);
    reloj.current = window.setTimeout(() => {
      setEstado("listo");
      reloj.current = null;
    }, 2600);
  }, [texto]);

  return (
    <button
      type="button"
      onClick={() => void copiar()}
      className="rounded-sm border border-amber-500/40 bg-amber-500/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-amber-300 transition-colors hover:bg-amber-500/20"
    >
      {estado === "copiado"
        ? "PARTE COPIADO ✓"
        : estado === "error"
          ? "EL NAVEGADOR NO DEJÓ COPIAR"
          : "COPIAR EL PARTE"}
    </button>
  );
}
