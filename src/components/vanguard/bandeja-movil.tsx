"use client";

// ============================================================
// v416.0 LA BANDEJA DEL MÓVIL — incidencia Galaxy A06 · Brave.
// En pantallas ≤640px nueve flotantes (radio, cofre, temporada,
// combo, CARA, intro, orbe, estado, JUEGO) compartían los mismos
// 160px inferiores y se tapaban entre sí y con la barra de zonas.
// Nada se elimina: los secundarios esperan tras «MÁS» (un toque) y,
// al abrir, cada uno ocupa SU carril (CSS v416 en globals.css).
// Siguen MONTADOS cuando la bandeja está cerrada: la radio no se
// corta, el cofre sigue contando. Sin almacenamiento disponible
// (modo privado / Shields estrictos) funciona igual, solo no recuerda.
// En escritorio el botón no existe (display:none fuera de ≤640px).
// ============================================================

import { useCallback, useEffect, useState } from "react";

const LS = "vg416-bandeja";

function leer(): boolean {
  try { return localStorage.getItem(LS) === "1"; } catch { return false; }
}

export function BandejaMovil() {
  const [abierta, setAbierta] = useState(false);
  const [cofreListo, setCofreListo] = useState(false);

  // estado recordado (async: patrón de la casa, nunca setState síncrono en effect)
  useEffect(() => {
    const t = setTimeout(() => setAbierta(leer()), 0);
    return () => clearTimeout(t);
  }, []);

  // el atributo en <html> gobierna los carriles
  useEffect(() => {
    const raiz = document.documentElement;
    if (abierta) raiz.setAttribute("data-vg416-bandeja", "1");
    else raiz.removeAttribute("data-vg416-bandeja");
    return () => raiz.removeAttribute("data-vg416-bandeja");
  }, [abierta]);

  // aviso discreto: si el cofre está listo con la bandeja cerrada, el punto late
  useEffect(() => {
    const mirar = () => {
      const c = document.querySelector('[data-vg-retencion="cofre"]');
      setCofreListo(!!c && /ABRIR/i.test(c.textContent || ""));
    };
    const iv = setInterval(mirar, 2500);
    const t = setTimeout(mirar, 0);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, []);

  const alternar = useCallback(() => {
    setAbierta((v) => {
      const n = !v;
      try { localStorage.setItem(LS, n ? "1" : "0"); } catch { /* sin almacenamiento: solo en memoria */ }
      return n;
    });
  }, []);

  return (
    <button
      type="button"
      className="vg416-bandeja"
      onClick={alternar}
      aria-expanded={abierta}
      aria-label={abierta ? "Recoger radio, cofre, temporada y CARA" : "Mostrar radio, cofre, temporada y CARA"}
      data-cofre={cofreListo && !abierta ? "1" : "0"}
    >
      <span className="vg416-bandeja-punto" aria-hidden />
      {abierta ? "MENOS" : "MÁS"}
    </button>
  );
}
