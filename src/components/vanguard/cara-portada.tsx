"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { sfx } from "@/lib/sound";

// ============================================================
// v208.0 EL ESTRENO — LAS CARAS DE VANGUARD.
// Cada visitante elige el AMBIENTE de la casa: ASALTO (brasa y carmesí,
// la cara de siempre), SIGILO (verde noche y cian) o GLORIA (oro imperial).
// Se guarda en SU aparato (localStorage vg-cara) y viaja entre pestañas
// del mismo aparato. Complementa al Atelier (el acabado manda sobre el
// metal; la cara manda sobre las nubes aurora). Cero recargas (ley v200),
// cero bloqueo, DOM directo (sin setState en effects — ley v176).
// ============================================================

const sinSuscripcion = () => () => {};
const esCliente = () => true;
const esServidor = () => false;

const K_CARA = "vg-cara";

type CaraKey = "asalto" | "sigilo" | "gloria";

const CARAS: { k: CaraKey; nombre: string; desc: string }[] = [
  { k: "asalto", nombre: "ASALTO", desc: "Brasa y carmesí — la cara de siempre" },
  { k: "sigilo", nombre: "SIGILO", desc: "Verde noche y cian — operación silenciosa" },
  { k: "gloria", nombre: "GLORIA", desc: "Oro imperial — amanecer dorado" },
];

function caraValida(v: string | null): CaraKey | null {
  return v === "asalto" || v === "sigilo" || v === "gloria" ? v : null;
}

export function CaraPortada() {
  const montado = useSyncExternalStore(sinSuscripcion, esCliente, esServidor);
  const [abierto, setAbierto] = useState(false);
  const labelRef = useRef<HTMLSpanElement>(null);

  // la cara guardada se aplica al despertar (DOM directo: dataset + label,
  // nada de setState — la ley v176 de la casa)
  useEffect(() => {
    if (!montado) return;
    let guardada: CaraKey | null = null;
    try { guardada = caraValida(localStorage.getItem(K_CARA)); } catch {}
    if (guardada && guardada !== "asalto") {
      document.documentElement.dataset.cara = guardada;
    }
    if (guardada && labelRef.current) {
      labelRef.current.textContent = guardada.toUpperCase();
    }
  }, [montado]);

  const elegir = useCallback((k: CaraKey) => {
    try { sfx.click(); } catch {}
    try { localStorage.setItem(K_CARA, k); } catch {}
    if (k === "asalto") {
      delete document.documentElement.dataset.cara;
    } else {
      document.documentElement.dataset.cara = k;
    }
    if (labelRef.current) labelRef.current.textContent = k.toUpperCase();
    setAbierto(false);
  }, []);

  if (!montado) return null;

  return createPortal(
    <div className="vg208-cara-lote" data-ceremonia-oculta>
      {abierto && (
        <div className="vg208-cara-menu" role="menu">
          {CARAS.map((c) => (
            <button
              key={c.k}
              type="button"
              role="menuitem"
              className="vg208-cara-opcion"
              data-k={c.k}
              onClick={() => elegir(c.k)}
            >
              <b>{c.nombre}</b>
              <span>{c.desc}</span>
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        className="vg208-cara-chip"
        onClick={() => {
          try { sfx.click(); } catch {}
          setAbierto((a) => !a);
        }}
        aria-haspopup="menu"
        aria-expanded={abierto}
      >
        CARA · <span ref={labelRef}>ASALTO</span> ▴
      </button>
    </div>,
    document.body,
  );
}
