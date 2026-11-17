"use client";

// v405.10 · LA SALA /navegacion, parte viva: aquí se PRUEBA la arquitectura,
// no se explica. Se elige un espacio, se configuran sus paneles de verdad
// (los mismos que usa la barra) y se escribe una URL para ver qué espacio
// detecta el sistema y qué herramienta marca como activa.
import { useEffect, useState } from "react";
import { IconoNav } from "@/components/vanguard/navegacion/iconos-nav";
import { HojaEspacios } from "@/components/vanguard/navegacion/hoja-espacios";
import { ESPACIOS, ESPACIO_POR_CLAVE } from "@/lib/navegacion/espacios";
import { guardarPaneles, leerPaneles, panelesPorDefecto, herramientasVisibles } from "@/lib/navegacion/paneles";
import type { ConfigPaneles } from "@/lib/navegacion/paneles";
import { contextoDe, herramientaActiva } from "@/lib/navegacion/contexto";
import type { ClaveEspacio } from "@/lib/navegacion/tipos";

const EJEMPLOS = ["/mapas", "/teatro-3d", "/atlas", "/divisas", "/cuartel?sala=mente", "/estado", "/", "/cronica"];

export function NavegacionSala() {
  const [config, setConfig] = useState<ConfigPaneles>(panelesPorDefecto);
  const [espacio, setEspacio] = useState<ClaveEspacio>("geo");
  const [prueba, setPrueba] = useState("/mapas");

  useEffect(() => setConfig(leerPaneles()), []);

  const actualizar = (c: ConfigPaneles) => {
    setConfig(c);
    guardarPaneles(c);
  };

  const ctx = contextoDe(prueba);
  const def = ESPACIO_POR_CLAVE[ctx.espacio];
  const herramientas = herramientasVisibles(config, ctx.espacio);
  const activa = herramientas.find((h) => herramientaActiva(h, prueba));

  return (
    <div className="vx-navsala">
      {/* ── el probador de contexto ─────────────────────────────────── */}
      <section className="vx-navsala-bloque" aria-label="Probador de contexto">
        <h2>PRUEBA EL CONTEXTO</h2>
        <p>
          Escribe cualquier dirección de la casa. La misma función pura que usa la barra
          (<code>espacioDe</code>) decide el espacio; ni una consulta, ni una cookie, ni un
          desajuste entre servidor y cliente.
        </p>
        <div className="vx-navsala-probador">
          <input
            value={prueba}
            onChange={(e) => setPrueba(e.target.value)}
            aria-label="Dirección a probar"
            spellCheck={false}
          />
          <div className="vx-navsala-ejemplos">
            {EJEMPLOS.map((e) => (
              <button key={e} type="button" onClick={() => setPrueba(e)}>{e}</button>
            ))}
          </div>
        </div>
        <div className="vx-navsala-resultado" style={{ "--esp": def.color } as React.CSSProperties}>
          <span className="vx-navsala-res-ico"><IconoNav nombre={def.icono} className="h-4 w-4" /></span>
          <div>
            <b>{def.nombre}</b>
            <em>{def.lema}</em>
          </div>
          <p>
            {herramientas.length} herramientas encendidas
            {activa ? <> · viendo <b>{activa.nombre}</b></> : null}
            {ctx.secundarios.length ? <> · vecinos: {ctx.secundarios.map((s) => ESPACIO_POR_CLAVE[s].nombre).join(", ")}</> : null}
          </p>
        </div>
      </section>

      {/* ── los diez espacios ───────────────────────────────────────── */}
      <section className="vx-navsala-bloque" aria-label="Los diez espacios">
        <h2>LOS DIEZ ESPACIOS</h2>
        <div className="vx-navsala-espacios">
          {ESPACIOS.map((e) => (
            <button
              key={e.clave}
              type="button"
              data-activo={e.clave === espacio ? "1" : "0"}
              style={{ "--esp": e.color } as React.CSSProperties}
              onClick={() => setEspacio(e.clave)}
            >
              <span><IconoNav nombre={e.icono} className="h-3.5 w-3.5" /></span>
              <b>{e.nombre}</b>
              <em>{e.lema}</em>
            </button>
          ))}
        </div>
      </section>

      {/* ── los paneles de verdad, en línea ─────────────────────────── */}
      <section className="vx-navsala-bloque" aria-label="Paneles configurables">
        <h2>CONFIGURA LOS PANELES DE {ESPACIO_POR_CLAVE[espacio].nombre.toUpperCase()}</h2>
        <p>
          Es la misma hoja que abre la barra en cualquier sala. Lo que cambies aquí se guarda
          en tu aparato y vale en toda la casa.
        </p>
        <HojaEspacios
          abierta
          enLinea
          config={config}
          espacio={espacio}
          onCerrar={() => {}}
          onConfig={actualizar}
          onIrA={() => {}}
        />
      </section>
    </div>
  );
}
