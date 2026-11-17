"use client";

// ═══════════════════════════════════════════════════════════════════
// v405.10 · LA HOJA DE LOS ESPACIOS — el panel configurable
//
// Una sola hoja hace las tres cosas que pedía el mandato:
//  ① cambiar de espacio de trabajo (los diez, con su color y su lema);
//  ② ordenar y encender/apagar las herramientas del espacio actual
//     (↑ ↓ y ojo: nada se borra, solo se ordena y se esconde);
//  ③ volver al orden de fábrica de ese espacio, sin tocar los demás.
//
// Se abre desde la barra adaptativa, desde la paleta (⌘K) y desde la sala
// /navegacion. Es la misma pieza en los tres sitios: una sola verdad.
// ═══════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { IconoNav } from "./iconos-nav";
import { ESPACIOS, ESPACIO_POR_CLAVE } from "@/lib/navegacion/espacios";
import {
  alternar, cambiarDensidad, estaOculta, herramientasTodas, mover, resetear,
} from "@/lib/navegacion/paneles";
import type { ConfigPaneles } from "@/lib/navegacion/paneles";
import type { ClaveEspacio } from "@/lib/navegacion/tipos";

type Props = {
  abierta: boolean;
  config: ConfigPaneles;
  espacio: ClaveEspacio;
  onCerrar: () => void;
  onConfig: (c: ConfigPaneles) => void;
  onIrA: (href: string) => void;
  /** en la sala /navegacion la hoja vive dentro de la página, sin velo */
  enLinea?: boolean;
};

export function HojaEspacios({ abierta, config, espacio, onCerrar, onConfig, onIrA, enLinea }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!abierta || enLinea) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierta, enLinea, onCerrar]);

  const def = ESPACIO_POR_CLAVE[espacio];
  const todas = useMemo(() => herramientasTodas(config, espacio), [config, espacio]);
  const visibles = todas.filter((h) => !estaOculta(config, espacio, h.id)).length;

  if (!abierta) return null;

  const cuerpo = (
    <div className="vx-nav-hoja" ref={ref} role="dialog" aria-label="Espacios de trabajo y paneles" aria-modal={enLinea ? undefined : true}>
      <header className="vx-nav-hoja-cab">
        <div>
          <p className="vx-nav-hoja-et">Espacios de trabajo</p>
          <h2>Diez sitios, las herramientas de cada uno</h2>
        </div>
        <div className="vx-nav-hoja-acc">
          <button type="button" onClick={() => onConfig(cambiarDensidad(config))} className="vx-nav-mini" aria-pressed={config.densidad === "compacta"}>
            {config.densidad === "compacta" ? "Compacta" : "Normal"}
          </button>
          {!enLinea && (
            <button type="button" onClick={onCerrar} className="vx-nav-mini" aria-label="Cerrar">
              <IconoNav nombre="x" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      <div className="vx-nav-espacios">
        {ESPACIOS.map((e) => {
          const activo = e.clave === espacio;
          const n = herramientasTodas(config, e.clave).length;
          return (
            <button
              key={e.clave}
              type="button"
              className="vx-nav-esp-tarjeta"
              data-activo={activo ? "1" : "0"}
              style={{ "--esp": e.color } as React.CSSProperties}
              onClick={() => onIrA(e.herramientas[0]?.href ?? "/")}
              aria-current={activo ? "true" : undefined}
            >
              <span className="vx-nav-esp-ico"><IconoNav nombre={e.icono} className="h-4 w-4" /></span>
              <b>{e.nombre}</b>
              <span className="vx-nav-esp-lema">{e.lema}</span>
              <span className="vx-nav-esp-n">{n} herramientas</span>
            </button>
          );
        })}
      </div>

      <div className="vx-nav-panel">
        <div className="vx-nav-panel-cab">
          <p>
            <span style={{ color: def.color }}>●</span> {def.nombre} · <em>{visibles} de {todas.length} encendidas</em>
          </p>
          <div className="vx-nav-panel-acc">
            <button type="button" className="vx-nav-mini" onClick={() => onConfig(resetear(config, espacio))}>
              Orden de fábrica
            </button>
            <Link href="/navegacion" className="vx-nav-mini">Ver la arquitectura</Link>
          </div>
        </div>
        <ul className="vx-nav-lista">
          {todas.map((h, i) => {
            const oculta = estaOculta(config, espacio, h.id);
            return (
              <li key={h.id} data-oculta={oculta ? "1" : "0"}>
                <span className="vx-nav-lista-ico"><IconoNav nombre={h.icono} className="h-3.5 w-3.5" /></span>
                <span className="vx-nav-lista-txt">
                  <b>{h.nombre}</b>
                  <em>{h.desc}</em>
                </span>
                <span className="vx-nav-lista-acc">
                  <button type="button" aria-label={`Subir ${h.nombre}`} disabled={i === 0} onClick={() => onConfig(mover(config, espacio, h.id, -1))}>
                    <IconoNav nombre="chevron-up" className="h-3 w-3" />
                  </button>
                  <button type="button" aria-label={`Bajar ${h.nombre}`} disabled={i === todas.length - 1} onClick={() => onConfig(mover(config, espacio, h.id, 1))}>
                    <IconoNav nombre="chevron-down" className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    aria-label={oculta ? `Encender ${h.nombre}` : `Apagar ${h.nombre}`}
                    aria-pressed={!oculta}
                    data-on={oculta ? "0" : "1"}
                    onClick={() => onConfig(alternar(config, espacio, h.id))}
                  >
                    <IconoNav nombre={oculta ? "eye" : "check"} className="h-3 w-3" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="vx-nav-nota">
          Nada se borra: apagar una herramienta solo la esconde. Se guarda en este aparato,
          por espacio, y si mañana entra una herramienta nueva aparece sola al final.
        </p>
      </div>
    </div>
  );

  if (enLinea) return cuerpo;
  return (
    <div className="vx-nav-velo" onMouseDown={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      {cuerpo}
    </div>
  );
}
