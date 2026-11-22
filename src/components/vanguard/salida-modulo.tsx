"use client";

// ═══════════════════════════════════════════════════════════════════
// v439.0 · EL SELLO DE SALIDA — la puerta del módulo, y su final
//
// Mandato del Dueño, textual: «hay un problema de interfaz: nunca hay un botón
// para salir de un módulo a Vanguard, o sea como una X en los módulos para
// salir; y en vez de poner una X pon diferentes símbolos de Vanguard que hagan
// una animación que parezca que destruye el módulo — o sea, diferentes,
// rotando, uno como que lo quema, otro que lo deshace, otro que lo destruye —
// una animación impredecible para salir de un módulo».
// Y después: «no he visto nada de lo que agregaste, mejóralo y púl elo más,
// que diga wow». De ahí esta segunda versión:
//
//   ① SE VE. El sello ya no es un glifo tímido al principio de la barra: es una
//      pastilla con anillo de oro, el glifo girando y la palabra SALIR escrita
//      también en el teléfono. Y la primera vez que entras en un módulo, a los
//      2,6 s, late tres veces y saca un cartel que dice lo que hace. No hay que
//      adivinar nada.
//   ② SE SIENTE. Pulsarlo ya no es «una animación»: es un golpe de escena —
//      destello, dos ondas de choque desde el punto exacto donde estaba tu dedo,
//      treinta chispas de oro y cian, la página entera temblando, el sigilo
//      enorme saliendo del sello y girando en el centro, un viñeteado que se
//      cierra… y encima, la firma de cada final (fuego, astillas, ojo, polen…).
//   ③ NO SE REPITE. Ocho finales y ocho sigilos, sorteados en el clic, y el
//      mismo final no cae dos veces seguidas ni recargando.
//   ④ Y SI EL APARATO PIDE CALMA, SE LE OBEDECE: con «reducir movimiento» no
//      hay teatro (salida en el acto). En modo ligero, donde la casa apaga con
//      `!important` toda animación, se hace un corte corto —un golpe de dos
//      fotogramas, sin desenfoques— para que el gesto no muera en silencio.
//
// Leyes de la casa que respeta:
//   · Nada de azar en el render (rompe la hidratación, #418): el glifo se
//     sortea al montar y el final en el clic.
//   · Nunca deja la casa colgada: viaje a la portada y cerrojo que limpia todo.
//   · Es un <button> de verdad: nombre, foco visible y teclado.
//   · Suena una vez, con el portero de siempre (`suena("destruir")`).
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { suena } from "@/lib/sonido/tocar";
import { conCarcasa } from "@/components/portada/carcasa";

type EfectoId = "quema" | "funde" | "astilla" | "colapso" | "devora" | "glitch" | "desintegra" | "implosion";

/** Las ocho formas de acabar con un módulo. El nombre va en MAYÚSCULAS a la
 *  pantalla: el sello cuenta lo que está haciendo, no hace ruido a escondidas. */
export const EFECTOS: Record<EfectoId, { verbo: string; linea: string; gesto: string }> = {
  quema: { verbo: "QUEMADO", linea: "arde hasta dejar sólo ceniza", gesto: "quemar el módulo" },
  funde: { verbo: "FUNDIDO", linea: "se derrite y vuelve a Vanguard", gesto: "fundir el módulo" },
  astilla: { verbo: "ASTILLADO", linea: "mil pedazos al aire", gesto: "astillar el módulo" },
  colapso: { verbo: "COLAPSADO", linea: "se cierra como un expediente", gesto: "colapsar el módulo" },
  devora: { verbo: "DEVORADO", linea: "se lo traga el ojo de Vanguard", gesto: "devorar el módulo" },
  glitch: { verbo: "CORROMPIDO", linea: "señal perdida: la casa te recoge", gesto: "corromper el módulo" },
  desintegra: { verbo: "DESINTEGRADO", linea: "ni polvo queda en este expediente", gesto: "desintegrar el módulo" },
  implosion: { verbo: "IMPLOSIONADO", linea: "se lo lleva su propio sello", gesto: "hacer implosionar el módulo" },
};

export const ORDEN_EFECTOS: EfectoId[] = Object.keys(EFECTOS) as EfectoId[];

/** Los ocho glifos de la casa. Trazo fino y corriente: se visten con CSS. */
export const SIGILOS: { id: string; giro: number; d: string }[] = [
  { id: "ojo", giro: 14, d: "M4 16Q16 5 28 16Q16 27 4 16Z M16 11.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0-9Z" },
  { id: "rombo", giro: -20, d: "M16 3L29 16L16 29L3 16Z M16 9L23 16L16 23L9 16Z" },
  { id: "aguja", giro: 9, d: "M16 2L20 22L16 30L12 22Z M9 12L23 12" },
  { id: "espiral", giro: -12, d: "M16 16a2.6 2.6 0 1 1 5.2 0a5.2 5.2 0 1 1 -10.4 0a7.8 7.8 0 1 1 15.6 0a10.4 10.4 0 1 1 -20.8 0" },
  { id: "hexagono", giro: 17, d: "M16 3L27 9.5V22.5L16 29L5 22.5V9.5Z M16 10v12 M10 19l6-3l6 3" },
  { id: "mira", giro: -25, d: "M16 4v24 M4 16h24 M16 10a6 6 0 1 0 0 12a6 6 0 1 0 0-12Z" },
  { id: "alas", giro: 11, d: "M4 24L16 8L28 24 M8 24L16 14L24 24" },
  { id: "nudo", giro: -15, d: "M12 16a5 5 0 1 0 10 0a5 5 0 1 0 -10 0 M16 6a5 5 0 1 0 0 10 M16 16a5 5 0 1 1 0 10" },
];

/** Cuánto dura el teatro. El viaje ocurre al final; el cerrojo, detrás. */
const DURACION = 1000;
const CORTE = 340; // modo ligero: dos fotogramas y a casa
const CHISPAS = 30;

type Chispa = { a: number; d: number; t: number; s: number; oro: boolean; largo: number };

function alAzar<T>(lista: T[]): T {
  try {
    return lista[Math.floor(Math.random() * lista.length)] ?? lista[0];
  } catch {
    return lista[0];
  }
}

function hacerChispas(): Chispa[] {
  const fuera: Chispa[] = [];
  for (let i = 0; i < CHISPAS; i++) {
    fuera.push({
      a: (360 / CHISPAS) * i + (Math.random() * 14 - 7),
      d: 110 + Math.random() * 210,
      t: Math.random() * 110,
      s: 0.7 + Math.random() * 1.6,
      largo: 8 + Math.random() * 16,
      oro: Math.random() > 0.34,
    });
  }
  return fuera;
}

export function SalidaModulo() {
  const ruta = usePathname();
  const router = useRouter();
  const [sigilo, setSigilo] = useState(0);
  const [efecto, setEfecto] = useState<EfectoId | null>(null);
  const [chispas, setChispas] = useState<Chispa[]>([]);
  const [origen, setOrigen] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [llama, setLlama] = useState(false); // el cartel de la primera vez
  const [punto, setPunto] = useState<{ x: number; y: number } | null>(null);
  const [late, setLate] = useState(false); // el pulso que pide que lo mires
  const [pulsado, setPulsado] = useState(false); // el anillo del dedo
  const temporizadores = useRef<number[]>([]);
  const saliendo = useRef(false);
  const ultimoEfecto = useRef<EfectoId | null>(null);
  const boton = useRef<HTMLButtonElement | null>(null);

  // el glifo se elige DESPUÉS de montar (azar en servidor = HTML distinto = #418)
  useEffect(() => {
    setSigilo(Math.floor(Math.random() * SIGILOS.length));
    document.documentElement.removeAttribute("data-vg-salida");
    document.documentElement.removeAttribute("data-vg-salida-corta");
  }, []);

  // La primera vez en la sesión, el sello se presenta: no se trata de que el
  // Dueño tenga que adivinar dónde está la puerta.
  useEffect(() => {
    let yaDicho = false;
    try {
      yaDicho = sessionStorage.getItem("vg-salida-presentado") === "1";
    } catch {
      /* sin almacén: se presenta igual */
    }
    if (yaDicho) return;
    const t1 = window.setTimeout(() => setLate(true), 2600);
    const t2 = window.setTimeout(() => {
      // el cartel se cuelga JUSTO debajo del sello, medido, no a ojo
      try {
        const r = boton.current?.getBoundingClientRect();
        // el sello vive en el borde derecho: el cartel se cuelga a su izquierda,
        // medido desde el borde derecho de la pantalla para no salirse nunca
        if (r) setPunto({ x: Math.max(10, window.innerWidth - r.left + 12), y: Math.max(64, r.top - 4) });
      } catch {
        setPunto(null);
      }
      setLlama(true);
    }, 3000);
    const t3 = window.setTimeout(() => {
      setLlama(false);
      setLate(false);
      try {
        sessionStorage.setItem("vg-salida-presentado", "1");
      } catch {
        /* nada que recordar */
      }
    }, 8200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [ruta]);

  const limpiar = useCallback(() => {
    for (const t of temporizadores.current) window.clearTimeout(t);
    temporizadores.current = [];
    const raiz = document.documentElement;
    raiz.removeAttribute("data-vg-salida");
    raiz.removeAttribute("data-vg-salida-corta");
    saliendo.current = false;
  }, []);

  useEffect(() => limpiar, [limpiar]);

  // Al llegar a una sala sin carcasa (la portada, por ejemplo) el sello ya no
  // existe: el atributo de la destrucción se retira en el acto, sin esperar al
  // cerrojo. Antes quedaba puesto en <html> durante más de un segundo.
  useEffect(() => {
    if (conCarcasa(ruta)) return;
    const raiz = document.documentElement;
    raiz.removeAttribute("data-vg-salida");
    raiz.removeAttribute("data-vg-salida-corta");
    setEfecto(null);
  }, [ruta]);

  const salir = useCallback(() => {
    if (saliendo.current) return;
    saliendo.current = true;
    setLlama(false);
    setLate(false);

    // el golpe del dedo: un anillo sale del sello y el teléfono lo confirma.
    // Es lo que separa «pulsé algo» de «la casa me oyó».
    setPulsado(true);
    window.setTimeout(() => setPulsado(false), 480);
    try {
      navigator.vibrate?.(14);
    } catch {
      /* sin motor de vibración: el anillo ya lo dice */
    }

    const raiz = document.documentElement;
    let calma = false;
    let corte = false;
    try {
      calma =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        raiz.dataset.vgAnim === "desactivadas";
      /* El «modo ligero» (v418.2) y la quietud apagan con !important toda
         animación de la casa. Ahí no se finge una destrucción de un segundo:
         se hace un corte corto y honesto, y se entra en Vanguard. */
      corte = !calma && (raiz.dataset.vxLigero === "1" || raiz.dataset.vgMov === "quieto");
    } catch {
      /* sin matchMedia: se anima, que es lo normal */
    }

    // impredecible, pero sin repetirse dos veces seguidas: ver el mismo final
    // dos veces deja de ser una sorpresa y se vuelve un botón con truco.
    let elegido = alAzar(ORDEN_EFECTOS);
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

    if (calma) {
      router.push("/");
      return;
    }

    // el golpe sale del punto exacto donde estaba el sello: chispas y ondas
    try {
      const r = boton.current?.getBoundingClientRect();
      setOrigen(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    } catch {
      setOrigen({ x: 0, y: 0 });
    }

    setEfecto(elegido);
    setChispas(corte ? [] : hacerChispas());
    raiz.setAttribute("data-vg-salida", elegido);
    if (corte) raiz.setAttribute("data-vg-salida-corta", "1");

    const ms = corte ? CORTE : DURACION;
    temporizadores.current.push(window.setTimeout(() => router.push("/"), ms));
    // el cerrojo: pase lo que pase, la casa no se queda colgada
    temporizadores.current.push(
      window.setTimeout(() => {
        setEfecto(null);
        limpiar();
      }, ms + 1400)
    );
  }, [router, limpiar]);

  const g = SIGILOS[sigilo] ?? SIGILOS[0];

  if (!conCarcasa(ruta)) return null;

  const capa =
    efecto && typeof document !== "undefined"
      ? createPortal(
          <div
            className="vxs-capa"
            data-vg-salida-capa
            data-efecto={efecto}
            aria-hidden="true"
            style={{ "--vxs-x": `${origen.x}px`, "--vxs-y": `${origen.y}px` } as React.CSSProperties}
          >
            <span className="vxs-flash" />
            <span className="vxs-onda" />
            <span className="vxs-onda vxs-onda--2" />
            <span className="vxs-capa-fuego" />
            <span className="vxs-capa-astillas" />
            <span className="vxs-capa-lineas" />
            <span className="vxs-capa-nucleo" />
            <span className="vxs-vineta" />
            <span className="vxs-chispas">
              {chispas.map((c, i) => (
                <i
                  key={i}
                  style={
                    {
                      "--a": `${c.a}deg`,
                      "--d": `${c.d}px`,
                      "--t": `${c.t}ms`,
                      "--s": c.s,
                      "--l": `${c.largo}px`,
                      color: c.oro ? "#ffd98a" : "#8ee9f5",
                    } as React.CSSProperties
                  }
                />
              ))}
            </span>
            <span className="vxs-sigilo-grande" data-giro={g.giro}>
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d={g.d} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </span>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={boton}
        type="button"
        className="vxs-sello"
        data-late={late ? "1" : undefined}
        data-pulsado={pulsado ? "1" : undefined}
        data-efecto={efecto ?? undefined}
        onClick={salir}
        aria-label="Salir de este módulo y volver a Vanguard"
        title="Salir de este módulo: el módulo se rompe y vuelves a Vanguard"
      >
        <span className="vxs-sello-anillo" aria-hidden="true" />
        <span className="vxs-sello-glifo" aria-hidden="true" data-giro={g.giro}>
          <svg viewBox="0 0 32 32" width="19" height="19" focusable="false">
            <path d={g.d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </span>
        <span className="vxs-sello-txt" aria-hidden="true">
          SALIR
        </span>
        {/* en escritorio el sello se abre en píldora y dice a dónde lleva */}
        <span className="vxs-sello-largo" aria-hidden="true">
          SALIR A VANGUARD
        </span>
      </button>

      {llama
        ? createPortal(
            <p
              className="vxs-llama"
              aria-hidden="true"
              style={punto ? { top: punto.y, right: punto.x } : undefined}
            >
              <b>Salir del módulo</b>
              <span>y volver a Vanguard · el módulo se rompe por el camino</span>
              <span className="vxs-llama-hilo" aria-hidden="true" />
            </p>,
            document.body
          )
        : null}

      {/* La frase va en su propio portal a <body>: fuera de la barra (que abre
          su contexto de apilado) y fuera de las animaciones de la página. */}
      {efecto && typeof document !== "undefined"
        ? createPortal(
            <p className="vxs-dicho" role="status">
              <span className="vxs-dicho-verbo">{EFECTOS[efecto].verbo}</span>
              <span className="vxs-dicho-linea">{EFECTOS[efecto].linea}</span>
            </p>,
            document.body
          )
        : null}

      {capa}
    </>
  );
}
