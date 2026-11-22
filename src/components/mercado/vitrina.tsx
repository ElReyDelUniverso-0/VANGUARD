"use client";

// ═══════════════════════════════════════════════════════════════════
// v440.3 · EL ESCAPARATE — los módulos de la casa, pasando sin parar
//
// El Dueño: «que verdaderamente literalmente módulos de Vanguard para que las
// personas los vean con una descripción y que vayan rotando infinitamente para
// que los vean». Esto es eso, y sólo eso:
//
//   · ARRIBA, LOS CUATRO MÓDULOS con su lema, su gancho y cuántas salas tiene
//     cada uno — la ficha grande, quieta, para leer.
//   · DEBAJO, LA CINTA: todas las salas de la casa (una por ruta, sin repetir)
//     con su descripción, en dos filas que corren sin fin en sentidos
//     contrarios. Se para al pasar el ratón, al tocar y al llegar con el
//     tabulador —para poder leer— y sigue sola cuando te vas.
//   · EN QUIETUD (o con «reducir movimiento»): las filas no corren; se quedan
//     como una cinta que se puede arrastrar con el dedo. Nada se mueve solo.
//
// Ninguna ficha es inventada: `lib/mercado/vitrina` las saca de
// `components/portada/modulos` (la fuente única de los módulos y sus salas).
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  FICHAS,
  MODULOS_VITRINA,
  cifrasVitrina,
  filas,
  recortar,
  type Ficha,
  type ModuloFicha,
} from "@/lib/mercado/vitrina";
import { EVENTO, debeAnimar, leer, sistemaQuieto } from "@/lib/interfaz/vivo";

/** Las filas de la cinta: dos, en sentidos contrarios, como las de una feria. */
const FILAS = filas(2, FICHAS);

const estiloFicha = (f: Ficha | ModuloFicha) =>
  ({ ["--vf-color" as string]: f.color } as CSSProperties);

function Tarjeta({ f, i, total }: { f: Ficha; i: number; total: number }) {
  return (
    <li className="vf-tarjeta" style={estiloFicha(f)}>
      <Link href={f.href} className="vf-enlace">
        <span className="vf-chip">
          {f.vivo ? <i className="vf-vivo" aria-hidden /> : null}
          {f.modulo}
        </span>
        <strong className="vf-titulo">{f.titulo}</strong>
        <span className="vf-desc">{recortar(f.descripcion)}</span>
        <span className="vf-pie">
          <span className="vf-ruta">{f.href}</span>
          <span className="vf-abrir" aria-hidden>
            abrir →
          </span>
        </span>
      </Link>
      <span className="vf-num" aria-hidden>
        {String(i + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
      </span>
    </li>
  );
}

function Cinta({ fichas, sentido }: { fichas: Ficha[]; sentido: 1 | -1 }) {
  // el contenido se pinta DOS veces: la animación va de 0 a -50 % y al llegar
  // está exactamente donde empezó — de ahí que no haya costura ni salto.
  const doble = [...fichas, ...fichas];
  return (
    <div className="vf-cinta" data-sentido={sentido === 1 ? "izq" : "der"}>
      <ul className="vf-pista">
        {doble.map((f, i) => (
          <Tarjeta key={`${f.href}-${i}`} f={f} i={i % fichas.length} total={fichas.length} />
        ))}
      </ul>
    </div>
  );
}

export function VitrinaModulos() {
  const [quieto, setQuieto] = useState(false);
  const [tocada, setTocada] = useState(false);

  useEffect(() => {
    const mirar = () => setQuieto(!debeAnimar(leer(), sistemaQuieto()));
    mirar();
    window.addEventListener(EVENTO, mirar);
    return () => window.removeEventListener(EVENTO, mirar);
  }, []);

  const cifras = cifrasVitrina();

  return (
    <section className="vf-seccion" id="escaparate" aria-labelledby="vf-titulo">
      <header className="vf-cabeza">
        <p className="vf-volanta">
          El escaparate · {cifras.modulos} módulos · {cifras.salas} salas
        </p>
        <h2 className="vf-h2" id="vf-titulo">
          Los módulos de Vanguard, uno detrás de otro
        </h2>
        <p className="vf-sumario">
          Todas las salas de la casa con lo que hace cada una, pasando sin parar para que las veas
          todas. Pasa el ratón (o toca) para detener la cinta y leer con calma.
        </p>
      </header>

      <ul className="vf-modulos">
        {MODULOS_VITRINA.map((m) => (
          <li key={m.id} className="vf-modulo" style={estiloFicha(m)}>
            <Link href={m.nav} className="vf-modulo-enlace">
              <span className="vf-modulo-num" aria-hidden>
                {m.salas}
              </span>
              <span className="vf-modulo-nombre">{m.nombre}</span>
              <span className="vf-modulo-lema">{m.lema}</span>
              <span className="vf-modulo-gancho">{recortar(m.gancho, 150)}</span>
              <span className="vf-modulo-pie">
                {m.salas} salas · abrir el módulo →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div
        className={quieto ? "vf-vitrina vf-quieta" : "vf-vitrina"}
        data-tocada={tocada ? "1" : undefined}
        // en el teléfono no hay ratón: al tocar se para un rato y se puede leer
        onTouchStart={() => {
          setTocada(true);
          window.setTimeout(() => setTocada(false), 6000);
        }}
      >
        {FILAS.map((f, i) => (
          <Cinta key={i} fichas={f} sentido={i % 2 === 0 ? 1 : -1} />
        ))}
      </div>
    </section>
  );
}
