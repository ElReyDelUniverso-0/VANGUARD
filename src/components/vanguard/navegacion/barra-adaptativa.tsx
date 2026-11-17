"use client";

// ═══════════════════════════════════════════════════════════════════
// v405.10 · LA BARRA ADAPTATIVA — la pieza que se monta una vez y sirve en
// todas las salas.
//
// QUÉ ARREGLA: hasta hoy, cada sala de la casa se navegaba distinto. El
// cuartel tenía su barra de 155 pestañas; los módulos, su fila de rutas; el
// menú grande, sus 20 constelaciones; la cabecera, su buscador. Ninguna
// sabía que, si estás en /mapas, lo que necesitas es el atlas, el globo y los
// datos vivos — y no el mercado.
//
// QUÉ HACE: lee la URL (contexto.ts, función pura), elige el espacio, y
// enseña SUS herramientas, en el orden que el operador haya guardado. Al pie
// deja las transiciones declaradas del espacio («sigue en…»). Nada más.
//
// LEY DE LA CASA: navegar NO recarga. Se usa el router de Next dentro de una
// transición y, si el navegador lo permite, startViewTransition para que el
// cambio sea un solo movimiento y no un parpadeo.
// ═══════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconoNav } from "./iconos-nav";
import { HojaEspacios } from "./hoja-espacios";
import { ESPACIO_POR_CLAVE } from "@/lib/navegacion/espacios";
import { herramientaActiva, transicionesDe } from "@/lib/navegacion/contexto";
import { guardarPaneles, leerPaneles, panelesPorDefecto, herramientasVisibles, cambiarPlegado } from "@/lib/navegacion/paneles";
import type { ConfigPaneles } from "@/lib/navegacion/paneles";
import type { Herramienta } from "@/lib/navegacion/tipos";
import { espacioDe } from "@/lib/navegacion/contexto";
import { navegarConTransicion } from "@/lib/navegacion/transicion";
import { navigateTo } from "@/lib/nav";
import type { TabKey } from "@/components/vanguard/tab-nav";

/** Las salas inmersivas no llevan barra: estorbaría al lienzo o a la lectura. */
const SIN_BARRA = ["/entrar", "/lectura", "/vanguard2", "/offline", "/vertigo", "/api"];

export function BarraAdaptativa() {
  const ruta = usePathname() ?? "/";
  const router = useRouter();
  const [, inicio] = useTransition();
  const [config, setConfig] = useState<ConfigPaneles>(panelesPorDefecto);
  const [montada, setMontada] = useState(false);
  const [hoja, setHoja] = useState(false);

  // La configuración vive en el aparato: se lee al montar (nunca en el
  // servidor, para no romper la hidratación) y se escucha si cambia en otra
  // pieza de la casa (la sala /navegacion usa la misma).
  useEffect(() => {
    setConfig(leerPaneles());
    setMontada(true);
    const sync = (e: Event) => {
      const c = (e as CustomEvent<ConfigPaneles>).detail;
      if (c && c.version === 1) setConfig(c);
    };
    window.addEventListener("vanguard:paneles", sync);
    return () => window.removeEventListener("vanguard:paneles", sync);
  }, []);

  const actualizar = useCallback((c: ConfigPaneles) => {
    setConfig(c);
    guardarPaneles(c);
  }, []);

  const espacio = espacioDe(ruta);
  const def = ESPACIO_POR_CLAVE[espacio];
  const herramientas = herramientasVisibles(config, espacio);
  const vecinos = transicionesDe(espacio);

  const viajar = useCallback(
    (href: string) => {
      // Una sala del cuartel se abre sin salir del cuartel (evento interno).
      if (href.startsWith("/cuartel?sala=") && ruta === "/cuartel") {
        const clave = new URLSearchParams(href.split("?")[1]).get("sala");
        if (clave) {
          navigateTo(clave as TabKey);
          setHoja(false);
          return;
        }
      }
      setHoja(false);
      inicio(() => navegarConTransicion(router, href));
    },
    [router, ruta, inicio],
  );

  const ir = useCallback(
    (h: Herramienta) => (e: React.MouseEvent) => {
      e.preventDefault();
      viajar(h.href);
    },
    [viajar],
  );

  if (!montada) return null;
  if (SIN_BARRA.some((r) => ruta === r || ruta.startsWith(r + "/"))) return null;

  const plegada = config.plegado;
  const activa = herramientas.find((h) => herramientaActiva(h, ruta));

  return (
    <>
      <aside
        className="vx-nav"
        data-plegada={plegada ? "1" : "0"}
        data-densidad={config.densidad}
        style={{ "--esp": def.color } as React.CSSProperties}
        aria-label={`Herramientas de ${def.nombre}`}
      >
        <div className="vx-nav-cab">
          <button
            type="button"
            className="vx-nav-chip"
            onClick={() => setHoja(true)}
            aria-expanded={hoja}
            title="Cambiar de espacio de trabajo"
          >
            <span className="vx-nav-chip-ico"><IconoNav nombre={def.icono} className="h-4 w-4" /></span>
            <span className="vx-nav-chip-txt">
              <b>{def.nombre}</b>
              <em>{activa ? activa.nombre : def.lema}</em>
            </span>
          </button>
          <button
            type="button"
            className="vx-nav-plegar"
            onClick={() => actualizar(cambiarPlegado(config))}
            aria-label={plegada ? "Desplegar la barra" : "Plegar la barra"}
            aria-pressed={plegada}
          >
            <IconoNav nombre={plegada ? "chevron-right" : "chevron-left"} className="h-3 w-3" />
          </button>
        </div>

        <nav className="vx-nav-herr" aria-label={`Herramientas de ${def.nombre}`}>
          {herramientas.map((h) => {
            const on = herramientaActiva(h, ruta);
            return (
              <a
                key={h.id}
                href={h.href}
                onClick={ir(h)}
                data-on={on ? "1" : "0"}
                aria-current={on ? "page" : undefined}
                title={`${h.nombre} — ${h.desc}`}
              >
                <span className="vx-nav-herr-ico"><IconoNav nombre={h.icono} className="h-4 w-4" /></span>
                <span className="vx-nav-herr-txt">
                  <b>{h.nombre}</b>
                  <em>{h.desc}</em>
                </span>
              </a>
            );
          })}
        </nav>

        <div className="vx-nav-pie">
          <button type="button" onClick={() => setHoja(true)} title="Configurar paneles y cambiar de espacio" aria-label="Configurar paneles">
            <IconoNav nombre="sliders" className="h-3.5 w-3.5" />
            <span>Paneles</span>
          </button>
          <div className="vx-nav-vecinos">
            {vecinos.map((v) => (
              <button
                key={v.clave}
                type="button"
                style={{ "--esp": v.color } as React.CSSProperties}
                onClick={() => viajar(v.herramientas[0]?.href ?? "/")}
                title={`Ir a ${v.nombre} — ${v.lema}`}
                aria-label={`Ir a ${v.nombre}`}
              >
                <IconoNav nombre={v.icono} className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* En el móvil la barra se recoge en un botón: la misma hoja, sin tapar. */}
      <button type="button" className="vx-nav-fab" onClick={() => setHoja(true)} aria-label="Espacios y herramientas">
        <IconoNav nombre={def.icono} className="h-4 w-4" />
        <span>{def.nombre}</span>
      </button>

      <HojaEspacios
        abierta={hoja}
        config={config}
        espacio={espacio}
        onCerrar={() => setHoja(false)}
        onConfig={actualizar}
        onIrA={viajar}
      />
    </>
  );
}

