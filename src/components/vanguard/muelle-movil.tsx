"use client";

// ═══════════════════════════════════════════════════════════════════
// v436.0 · EL MUELLE DE UNA SOLA FILA
//
// El Dueño: «en celulares pequeños los botones se opacan, los textos se
// reúnen, la interfaz es un desastre», y después: muelle único SÍ, pero
// con la radio a un toque.
//
// Lo que había (medido a 320×780, v435.0): tres niveles fijos en el
// borde inferior — muelle de cinco (58 px) + fila de caras y emisora
// (40 px) + orbe (46 px) —, es decir 156 px de cromo, el 22 % del alto.
//
// Lo que hace este componente: el muelle se queda con CUATRO destinos y
// un botón MÁS. Lo que no cabe en la barra —Explorar, Orden, las caras
// HOY/SALAS/RADIO, la voz, la guía y el buscador— vive en una hoja que
// se abre desde abajo, con las dos manos y sin tapar la barra. La radio
// NO se mete en la hoja: su ▶ sigue en la barra, siempre a un toque
// (lo pinta la emisora de la casa, que es la única que hace sonar algo).
//
// Reglas de la casa que respeta:
//   · una sola voz — aquí no se crea ningún reproductor; el ▶ es el de
//     `emisora-global`, que ya es el único de la casa;
//   · no se duplica navegación — cada destino aparece UNA vez: o en la
//     barra o en la hoja, nunca en las dos;
//   · nada de cristal decorativo — la hoja es opaca donde hay texto;
//   · se cierra con Escape, con el fondo y con el mismo botón; el foco
//     entra en la hoja y vuelve al botón al cerrar.
// ═══════════════════════════════════════════════════════════════════

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { leerGustos } from "@/lib/voz/decir";
import { idiomaActual } from "@/lib/voz/idiomas";
import { usaEmision } from "@/lib/radio/usa-emision";
import type { Programa } from "@/lib/radio/guion";
import { IcoMenu, IcoCerrar, IcoBuscar } from "../portada/iconos";

type Destino = { href: string; etiqueta: string; nota: string };

// Lo que no cabe en la barra. Cada uno con su nota de una línea, porque
// una hoja sin explicación es otro menú que nadie lee.
const GRUPOS: { titulo: string; destinos: Destino[] }[] = [
  {
    titulo: "La casa",
    destinos: [
      { href: "/entrar", etiqueta: "Explorar", nota: "los siete mundos, uno por uno" },
      // «Salas» y «Orden» son la misma puerta desde que el Cuartel se disolvió
      // (v433): /cuartel redirige a /orden. Aquí va una sola vez, no dos.
      { href: "/orden", etiqueta: "Salas y orden", nota: "todas las salas y el tablero" },
      // v437.2 · el mercado, en el muelle: las diez familias ya no van en el menú
      { href: "/mercado", etiqueta: "El mercado", nota: "las diez familias, puesto a puesto" },
    ],
  },
  {
    titulo: "Leer y oír",
    destinos: [
      { href: "/radio", etiqueta: "Radio", nota: "la casa en voz alta" },
      { href: "/voz", etiqueta: "La voz", nota: "cómo suena y a qué velocidad" },
      { href: "/cuaderno", etiqueta: "El cuaderno", nota: "escribe, señala, anota" },
    ],
  },
  {
    // la búsqueda vive arriba, en su botón: aquí no se repite (una puerta, un sitio)
    titulo: "Aprender el camino",
    destinos: [
      // v435.2 · el camino de los primeros pasos es /descubrir, no un modal
            { href: "/descubrir", etiqueta: "Primeros pasos", nota: "el camino, paso a paso, y dónde quedó" },
    ],
  },
];

export function BotonMasMovil() {
  const [abierta, setAbierta] = useState(false);
  const ruta = usePathname() || "/";
  const boton = useRef<HTMLButtonElement | null>(null);
  const hoja = useRef<HTMLDivElement | null>(null);

  // se cierra al cambiar de sala (nadie quiere la hoja abierta en la sala nueva)
  useEffect(() => setAbierta(false), [ruta]);

  useEffect(() => {
    if (!abierta) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierta(false);
        boton.current?.focus();
      }
    };
    window.addEventListener("keydown", alPulsar);
    hoja.current?.focus();
    return () => window.removeEventListener("keydown", alPulsar);
  }, [abierta]);

  return (
    <>
      <button
        ref={boton}
        type="button"
        className="vx-mas-boton"
        aria-expanded={abierta}
        aria-controls="vx-mas-hoja"
        onClick={() => setAbierta((v) => !v)}
        data-on={abierta ? "1" : "0"}
      >
        {abierta ? <IcoCerrar /> : <IcoMenu />}
        Más
      </button>

      {abierta ? (
        <div
          className="vx-mas-fondo"
          role="presentation"
          onClick={() => {
            setAbierta(false);
            boton.current?.focus();
          }}
        >
          <div
            id="vx-mas-hoja"
            className="vx-mas-hoja"
            role="dialog"
            aria-modal="true"
            aria-label="Todo lo que no cabe en la barra"
            tabIndex={-1}
            ref={hoja}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="vx-mas-cab">
              <b>Todo lo demás</b>
              <Link href="/buscar" className="vx-mas-buscar">
                <IcoBuscar /> Buscar
              </Link>
            </header>
            {GRUPOS.map((g) => (
              <section key={g.titulo} className="vx-mas-grupo" aria-label={g.titulo}>
                <span className="vx-mas-titulo">{g.titulo}</span>
                <ul>
                  {g.destinos.map((d) => (
                    <li key={d.href}>
                      <Link href={d.href} aria-current={ruta === d.href ? "page" : undefined}>
                        <b>{d.etiqueta}</b>
                        <small>{d.nota}</small>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <p className="vx-mas-pie">La radio sigue en la barra: su ▶ está siempre a un toque.</p>
          </div>
        </div>
      ) : null}
    </>
  );
}

// ───────────────────────────────────────────────────────────────────
// v436.1 · EL ▶ DE LA RADIO, EN LA BARRA
//
// Condición del Dueño: «muelle único, pero la radio a un toque». Y la
// ley de la casa: UNA sola voz. Así que este botón NO inventa reproductor:
// usa el mismo motor que el estudio de /radio —`usaEmision` sobre la boca
// única `decir()` y el mismo `/api/radio/programa`—, con los gustos de voz
// que el operador ya ajustó. En las salas que ya tienen voz propia (/radio,
// /voz) no se pinta: allí manda el estudio y no se pisan dos voces.
// ───────────────────────────────────────────────────────────────────

const RUTAS_CON_VOZ_PROPIA = ["/radio", "/voz", "/vanguard2"];

export function BotonRadioMuelle() {
  const ruta = usePathname() || "/";
  const propia = RUTAS_CON_VOZ_PROPIA.some((r) => ruta === r || ruta.startsWith(r + "/"));
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [pidiendo, setPidiendo] = useState(false);
  const [fallo, setFallo] = useState("");
  const arrancarAlLlegar = useRef(false);

  const bloques = programa?.bloques ?? [];
  // el idioma va en la emisión: la boca dice el programa en la lengua pedida
  const emision = usaEmision(bloques, leerGustos(), { idioma: idiomaActual() });

  const pedir = useCallback(async () => {
    setPidiendo(true);
    setFallo("");
    try {
      // v437.0 · el programa se pide en el idioma de la casa: las fórmulas
      // (sintonía, cifras, puentes, cierre) viajan traducidas desde el servidor
      const idioma = idiomaActual();
      const r = await fetch(`/api/radio/programa?min=5&lang=${idioma}`, {
        headers: { accept: "application/json" },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as { ok: boolean; programa: Programa };
      setPrograma(j.programa);
      arrancarAlLlegar.current = true;
      return j.programa;
    } catch (e) {
      setFallo(`No he podido traer el programa (${(e as Error).message}).`);
      return null;
    } finally {
      setPidiendo(false);
    }
  }, []);

  // el play pulsado antes de tener el guion arranca en cuanto llega
  useEffect(() => {
    if (!arrancarAlLlegar.current || bloques.length === 0) return;
    arrancarAlLlegar.current = false;
    emision.empezar(0);
  }, [bloques.length, emision]);

  const alternar = useCallback(async () => {
    if (emision.sonando) {
      emision.parar();
      return;
    }
    if (!programa) {
      await pedir();
      return;
    }
    emision.empezar(0);
  }, [emision, pedir, programa]);

  if (propia) return null;

  // v436.1 · EL SILENCIO SE DECLARA. En un aparato sin voces del sistema (o
  // cuando el programa no llega) el ▶ no puede quedarse mudo y parecer roto:
  // el botón lo dice, y la casa manda a la sala donde el texto se lee.
  const sinVoz = emision.sinVoz;
  const motivo = fallo || (sinVoz ? "Este aparato no tiene voz: en /radio el programa se lee." : "");
  const etiqueta = emision.sonando
    ? "Parar la radio de la casa"
    : sinVoz
      ? "La radio no puede sonar en este aparato; el programa se lee en la sala Radio"
      : "Escuchar la radio de la casa";

  return (
    <>
      <button
        type="button"
        className="vx-radio-muelle"
        data-sonando={emision.sonando ? "1" : "0"}
        data-pidiendo={pidiendo ? "1" : "0"}
        data-sin-voz={sinVoz ? "1" : "0"}
        onClick={alternar}
        aria-label={etiqueta}
        aria-pressed={emision.sonando}
        title={motivo || etiqueta}
      >
        <span className="vx-radio-punto" aria-hidden />
        {emision.sonando ? "❚❚" : "▶"}
      </button>
      {/* el aviso, para quien no ve el título del botón */}
      <span className="vx-sr-solo" role="status" aria-live="polite">
        {motivo}
      </span>
    </>
  );
}
