"use client";

// ═══════════════════════════════════════════════════════════════════
// v437.2 · EL SELLO DE SALIDA — la puerta del módulo, que lo destruye
//
// Mandato del Dueño, textual: «hay un problema de interfaz: nunca hay un botón
// para salir de un módulo a Vanguard, o sea como una X en los módulos para
// salir; y en vez de poner una X pon diferentes símbolos de Vanguard que hagan
// una animación que parezca que destruye el módulo — o sea, diferentes,
// rotando, uno como que lo quema, otro que lo deshace, otro que lo destruye —
// una animación impredecible para salir de un módulo».
//
// Lo que hace esta pieza:
//   ① EL SELLO: un glifo de la casa (ojo, rombo, aguja, espiral, hexágono,
//      mira, alas, nudo) que gira. Nunca una X: ocho glifos, uno al azar por
//      visita, y cada glifo gira a su aire (unos a la derecha, otros al revés,
//      a distinta velocidad). No se sabe cuál te va a tocar.
//   ② LA DESTRUCCIÓN: al pulsarlo se elige UNA de ocho formas de acabar con el
//      módulo — quemarlo, fundirlo, astillarlo, colapsarlo, devorarlo, corromperlo,
//      desintegrarlo o implosionarlo — y la página ENTERA se rompe de verdad
//      (CSS sobre la propia página, no un dibujito encima). El sello dice lo que
//      ha pasado: «QUEMADO», «FUNDIDO»…
//   ③ LA VUELTA: y te deja en Vanguard. Que es de lo que se trataba.
//
// Leyes de la casa que respeta:
//   · Nada de botones rotos: si el aparato pide «reducir movimiento», no hay
//     animación — se sale en el acto y se dice por qué.
//   · Una sola animación a la vez y nunca deja la casa colgada: si el viaje
//     tarda, un cerrojo lo empuja igual (dos temporizadores, no uno).
//   · Se oye cerrar la puerta: `suena("destruir")`, con el portero de siempre
//     (sin gesto, sin sonido o en calma, no suena).
//   · Se puede llegar con el teclado: es un <button> de verdad, con nombre.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { suena } from "@/lib/sonido/tocar";

type EfectoId = "quema" | "funde" | "astilla" | "colapso" | "devora" | "glitch" | "desintegra" | "implosion";

/** Las ocho formas de acabar con un módulo. El nombre va en MAYÚSCULAS a la
 *  pantalla: el sello cuenta lo que está haciendo, no hace ruido a escondidas. */
export const EFECTOS: Record<EfectoId, { verbo: string; linea: string; gesto: string }> = {
  quema: {
    verbo: "QUEMADO",
    linea: "arde hasta dejar sólo ceniza",
    gesto: "quemar el módulo",
  },
  funde: {
    verbo: "FUNDIDO",
    linea: "se derrite y vuelve a Vanguard",
    gesto: "fundir el módulo",
  },
  astilla: {
    verbo: "ASTILLADO",
    linea: "mil pedazos al aire",
    gesto: "astillar el módulo",
  },
  colapso: {
    verbo: "COLAPSADO",
    linea: "se cierra como un expediente",
    gesto: "colapsar el módulo",
  },
  devora: {
    verbo: "DEVORADO",
    linea: "se lo traga el ojo de Vanguard",
    gesto: "devorar el módulo",
  },
  glitch: {
    verbo: "CORROMPIDO",
    linea: "señal perdida: la casa te recoge",
    gesto: "corromper el módulo",
  },
  desintegra: {
    verbo: "DESINTEGRADO",
    linea: "ni polvo queda en este expediente",
    gesto: "desintegrar el módulo",
  },
  implosion: {
    verbo: "IMPLOSIONADO",
    linea: "se lo lleva su propio sello",
    gesto: "hacer implosionar el módulo",
  },
};

export const ORDEN_EFECTOS: EfectoId[] = Object.keys(EFECTOS) as EfectoId[];

/** Los ocho glifos de la casa. Trazo fino y corriente: se visten con CSS. */
export const SIGILOS: { id: string; giro: number; d: string; extra?: string }[] = [
  // el ojo de la casa (Zona Cero)
  { id: "ojo", giro: 14, d: "M4 16Q16 5 28 16Q16 27 4 16Z M16 11.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0-9Z" },
  // el rombo de los expedientes
  { id: "rombo", giro: -20, d: "M16 3L29 16L16 29L3 16Z M16 9L23 16L16 23L9 16Z" },
  // la aguja del corresponsal
  { id: "aguja", giro: 9, d: "M16 2L20 22L16 30L12 22Z M9 12L23 12" },
  // la espiral del archivo
  { id: "espiral", giro: -12, d: "M16 16a2.6 2.6 0 1 1 5.2 0a5.2 5.2 0 1 1 -10.4 0a7.8 7.8 0 1 1 15.6 0a10.4 10.4 0 1 1 -20.8 0" },
  // el hexágono de los motores
  { id: "hexagono", giro: 17, d: "M16 3L27 9.5V22.5L16 29L5 22.5V9.5Z M16 10v12 M10 19l6-3l6 3" },
  // la cruz de mira del centinela
  { id: "mira", giro: -25, d: "M16 4v24 M4 16h24 M16 10a6 6 0 1 0 0 12a6 6 0 1 0 0-12Z" },
  // las alas del muelle
  { id: "alas", giro: 11, d: "M4 24L16 8L28 24 M8 24L16 14L24 24" },
  // el nudo de la red
  { id: "nudo", giro: -15, d: "M12 16a5 5 0 1 0 10 0a5 5 0 1 0 -10 0 M16 6a5 5 0 1 0 0 10 M16 16a5 5 0 1 1 0 10" },
];

/** el azar, pero con el aparato respetado: si no hay ventana, el primero */
function alAzar<T>(lista: T[]): T {
  try {
    return lista[Math.floor(Math.random() * lista.length)] ?? lista[0];
  } catch {
    return lista[0];
  }
}

export function SalidaModulo() {
  const router = useRouter();
  const [sigilo, setSigilo] = useState(0);
  const [efecto, setEfecto] = useState<EfectoId | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const temporizadores = useRef<number[]>([]);
  const saliendo = useRef(false);
  const ultimoEfecto = useRef<EfectoId | null>(null);

  // el glifo se elige DESPUÉS de montar (azar en servidor = HTML distinto = #418)
  useEffect(() => {
    setSigilo(Math.floor(Math.random() * SIGILOS.length));
    // si una salida se quedó a medias (recarga a mitad del viaje), se limpia
    document.documentElement.removeAttribute("data-vg-salida");
  }, []);

  const limpiar = useCallback(() => {
    for (const t of temporizadores.current) window.clearTimeout(t);
    temporizadores.current = [];
    document.documentElement.removeAttribute("data-vg-salida");
    saliendo.current = false;
  }, []);

  useEffect(() => limpiar, [limpiar]);

  const salir = useCallback(() => {
    if (saliendo.current) return;
    saliendo.current = true;

    // ① ¿el aparato pide calma? Se sale igual, en el acto, y se dice.
    let reducido = false;
    try {
      const raiz = document.documentElement;
      reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (raiz.dataset.vgAnim === "desactivadas") reducido = true;
      /* El «modo ligero» (v418.2) y la quietud matan con !important toda
         animación de la casa, también ésta: fingir una destrucción que el
         aparato no va a pintar sólo deja medio segundo de pantalla muerta, así
         que aquí se sale en el acto — la misma verdad que con movimiento
         reducido. */
      if (raiz.dataset.vxLigero === "1" || raiz.dataset.vgMov === "quieto") reducido = true;
    } catch {
      /* sin matchMedia: se anima, que es lo normal */
    }

    // impredecible, pero sin repetirse dos veces seguidas: ver el mismo final
    // dos veces deja de ser una sorpresa y se vuelve un botón con truco.
    let elegido = alAzar(ORDEN_EFECTOS);
    // el anterior se recuerda también entre recargas (sessionStorage): si
    // recargas y vuelves a salir, tampoco te toca el mismo final.
    let anterior: EfectoId | null = ultimoEfecto.current;
    try {
      const guardado = sessionStorage.getItem("vg-salida-ultimo");
      if (guardado && (ORDEN_EFECTOS as readonly string[]).includes(guardado)) anterior = guardado as EfectoId;
    } catch {
      /* sin almacén: basta con el recuerdo de esta pestaña */
    }
    if (ORDEN_EFECTOS.length > 1 && elegido === anterior) {
      const desde = ORDEN_EFECTOS.indexOf(elegido);
      elegido = ORDEN_EFECTOS[(desde + 1 + Math.floor(Math.random() * (ORDEN_EFECTOS.length - 1))) % ORDEN_EFECTOS.length];
    }
    ultimoEfecto.current = elegido;
    try {
      sessionStorage.setItem("vg-salida-ultimo", elegido);
    } catch {
      /* sin almacén, nada que recordar */
    }
    suena("destruir");

    if (reducido) {
      // sin animación: no se finge una destrucción que el aparato no puede pintar
      router.push("/");
      return;
    }

    setEfecto(elegido);
    document.documentElement.setAttribute("data-vg-salida", elegido);

    // ② el viaje: primero se rompe (≈780 ms) y después se entra en la casa
    temporizadores.current.push(
      window.setTimeout(() => {
        router.push("/");
      }, 780)
    );
    // ③ el cerrojo: pase lo que pase, la casa no se queda colgada
    temporizadores.current.push(
      window.setTimeout(() => {
        setEfecto(null);
        limpiar();
      }, 2200)
    );
  }, [router, limpiar]);

  const capa =
    efecto && typeof document !== "undefined"
      ? createPortal(
          <div className="vxs-capa" data-vg-salida-capa data-efecto={efecto} aria-hidden="true">
            <span className="vxs-capa-fuego" />
            <span className="vxs-capa-astillas" />
            <span className="vxs-capa-lineas" />
            <span className="vxs-capa-nucleo" />
          </div>,
          document.body
        )
      : null;

  const g = SIGILOS[sigilo] ?? SIGILOS[0];

  return (
    <>
      <button
        type="button"
        className="vxs-sello"
        onClick={salir}
        onMouseEnter={() => setAviso(EFECTOS[alAzar(ORDEN_EFECTOS)].gesto)}
        onMouseLeave={() => setAviso(null)}
        onFocus={() => setAviso("salir de este módulo y volver a Vanguard")}
        onBlur={() => setAviso(null)}
        aria-label="Salir de este módulo y volver a Vanguard"
        title={aviso ? `Sello de salida · ${aviso}` : "Sello de salida: vuelve a Vanguard (y el módulo se rompe por el camino)"}
        data-efecto={efecto ?? undefined}
      >
        <span className="vxs-sello-glifo" aria-hidden="true" data-giro={g.giro}>
          <svg viewBox="0 0 32 32" width="22" height="22" focusable="false">
            <path d={g.d} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </span>
        <span className="vxs-sello-txt" aria-hidden="true">
          SALIR
        </span>
      </button>
      {/* La frase va en un portal a <body>: dentro de la barra de pestañas se
          queda por debajo del módulo (la barra abre su propio contexto de
          apilado) y se leía a través de la página. */}
      {efecto && typeof document !== "undefined"
        ? createPortal(
            <p className="vxs-sello-dicho" role="status">
              {EFECTOS[efecto].verbo} · {EFECTOS[efecto].linea}
            </p>,
            document.body
          )
        : null}
      {capa}
    </>
  );
}
