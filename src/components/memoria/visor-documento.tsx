"use client";

// ═══════════════════════════════════════════════════════════════════
// v419.0 · MEMORY ARCHIVE — el visor
//
// Zoom con rueda o botones, arrastre con ratón o dedo, teclado (flechas para
// pasar de cara, + y − para acercar, 0 para volver). Sin dependencias: un
// `transform` sobre una imagen y un estado pequeño.
//
// Regla de la casa que este componente NO salta: si la ficha no trae caras
// (porque los derechos no permiten publicarlas o porque la fuente no las
// ofrece), el visor no se monta: la página lo explica.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";
import type { PaginaDocumento } from "@/lib/memoria/tipos";

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 6;

export function VisorDocumento({ paginas, titulo }: { paginas: PaginaDocumento[]; titulo: string }) {
  const [indice, setIndice] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [desp, setDesp] = useState({ x: 0, y: 0 });
  const [arrastrando, setArrastrando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const lienzo = useRef<HTMLDivElement>(null);
  const ultimo = useRef<{ x: number; y: number } | null>(null);

  const pagina = paginas[indice];

  const cambiarZoom = useCallback((factor: number) => {
    setZoom((z) => {
      const nuevo = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((z * factor).toFixed(2))));
      if (nuevo === MIN_ZOOM) setDesp({ x: 0, y: 0 });
      return nuevo;
    });
  }, []);

  const reiniciar = useCallback(() => {
    setZoom(1);
    setDesp({ x: 0, y: 0 });
  }, []);

  const ir = useCallback(
    (delta: number) => {
      setIndice((i) => {
        const n = Math.min(paginas.length - 1, Math.max(0, i + delta));
        if (n !== i) {
          reiniciar();
          setCargando(true);
          setError(false);
        }
        return n;
      });
    },
    [paginas.length, reiniciar]
  );

  useEffect(() => {
    const nodo = lienzo.current;
    if (!nodo) return;
    const rueda = (e: WheelEvent) => {
      // con Ctrl la rueda es zoom del navegador: se respeta
      if (e.ctrlKey) return;
      e.preventDefault();
      cambiarZoom(e.deltaY < 0 ? 1.15 : 1 / 1.15);
    };
    nodo.addEventListener("wheel", rueda, { passive: false });
    return () => nodo.removeEventListener("wheel", rueda);
  }, [cambiarZoom]);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      const destino = e.target as HTMLElement | null;
      if (destino && ["INPUT", "TEXTAREA", "SELECT"].includes(destino.tagName)) return;
      if (e.key === "ArrowRight") ir(1);
      else if (e.key === "ArrowLeft") ir(-1);
      else if (e.key === "+" || e.key === "=") cambiarZoom(1.25);
      else if (e.key === "-" || e.key === "_") cambiarZoom(1 / 1.25);
      else if (e.key === "0") reiniciar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [cambiarZoom, ir, reiniciar]);

  if (!pagina) return null;

  return (
    <div className="vx-mem-visor">
      <div
        ref={lienzo}
        className="vx-mem-visor__lienzo"
        data-arrastrando={arrastrando ? "si" : "no"}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          ultimo.current = { x: e.clientX, y: e.clientY };
          setArrastrando(true);
        }}
        onPointerMove={(e) => {
          if (!ultimo.current || !arrastrando) return;
          const dx = e.clientX - ultimo.current.x;
          const dy = e.clientY - ultimo.current.y;
          ultimo.current = { x: e.clientX, y: e.clientY };
          setDesp((d) => ({ x: d.x + dx, y: d.y + dy }));
        }}
        onPointerUp={() => {
          ultimo.current = null;
          setArrastrando(false);
        }}
        onPointerCancel={() => {
          ultimo.current = null;
          setArrastrando(false);
        }}
      >
        {error ? (
          <p className="vx-mem-tarjeta__sinimagen" style={{ color: "#fca5a5" }}>
            La fuente no entrega esta cara ahora mismo
          </p>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={pagina.imagen}
            className="vx-mem-visor__imagen"
            src={pagina.imagen}
            alt={`${titulo} — cara ${pagina.numero} de ${paginas.length}`}
            draggable={false}
            onLoad={() => setCargando(false)}
            onError={() => {
              setCargando(false);
              setError(true);
            }}
            style={{
              transform: `translate(-50%, -50%) translate(${desp.x}px, ${desp.y}px) scale(${zoom})`,
              maxHeight: "100%",
              maxWidth: "100%",
              opacity: cargando ? 0.25 : 1,
              transition: arrastrando ? "none" : "transform 90ms linear",
            }}
          />
        )}
      </div>
      <div className="vx-mem-visor__barra">
        <button type="button" onClick={() => ir(-1)} disabled={indice === 0} aria-label="Cara anterior">
          ← Anterior
        </button>
        <button type="button" onClick={() => ir(1)} disabled={indice >= paginas.length - 1} aria-label="Cara siguiente">
          Siguiente →
        </button>
        <button type="button" onClick={() => cambiarZoom(1 / 1.3)} aria-label="Alejar">
          −
        </button>
        <button type="button" onClick={() => cambiarZoom(1.3)} aria-label="Acercar">
          +
        </button>
        <button type="button" onClick={reiniciar} aria-label="Volver al tamaño original">
          Ajustar
        </button>
        <span className="vx-mem-visor__dato" aria-live="polite">
          Cara {pagina.numero} de {paginas.length} · {Math.round(zoom * 100)} %
        </span>
      </div>
      <p className="vx-mem-visor__barra" style={{ borderTop: 0, paddingTop: 0, margin: 0, textTransform: "none", letterSpacing: 0, lineHeight: 1.5 }}>
        Arrastra para mover, rueda o + y − para acercar, flechas para cambiar de cara. La imagen se sirve desde la institución que la custodia; el archivo no la copia.
      </p>
    </div>
  );
}
