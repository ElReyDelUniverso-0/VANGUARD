// ═══════════════════════════════════════════════════════════════════
// v431.3 · LA ENTRADA, OTRA VEZ — primero dice DÓNDE HAS ENTRADO.
//
// LO QUE DIJO EL DUEÑO (textual): «su inicio es feo totalmente, no hay emoción,
// no hay nada; cuando entro que sepa dónde uno entra a VANGUARD, porque
// VANGUARD nunca se explica el mismo... uno se pierde mucho».
//
// LO QUE FALLABA DE VERDAD: la entrada anterior empezaba con «Un universo
// digital. Diez formas de entrar» — bonito y vacío: no decía qué es esto, ni
// qué se hace aquí, y mandaba a un ancla que llevaba a diez tarjetas iguales.
// Las cifras (familias, DOI, lecciones) eran números para el que ya vivía
// dentro. Quien llegaba de un enlace no sabía ni dónde estaba.
//
// LO QUE HACE AHORA, en este orden y en menos de tres segundos:
//   ① el NOMBRE, grande, para que sepa dónde ha entrado;
//   ② qué es, en una frase que se entiende sin conocer la casa;
//   ③ a qué se viene: cuatro puertas con verbo («ver qué pasa», «mirar el
//      planeta», «jugar», «pedir que te lleven») y su ruta real;
//   ④ el mundo de verdad: los frentes abiertos AHORA con sus cables, sacados
//      de los mismos datos que pinta la portada (no hay cifras a mano);
//   ⑤ la salida de emergencia: ocho puertas más, en una cinta, para el que se
//      pierde —y LA MENTE, que te lleva si se lo pides.
//
// SIN TRAMPAS: todo es servidor (cero estado, cero red en cliente), la única
// pieza de cliente es el botón de LA MENTE, el fondo es CSS puro (ni imágenes
// ni vídeo, que es lo que hace lenta una portada) y el movimiento se apaga con
// `prefers-reduced-motion`.
// ═══════════════════════════════════════════════════════════════════

import Link from "next/link";
import { cifrasEcosistema } from "@/lib/experiencia/registro";
import { BotonMente } from "@/components/mente/boton-mente";

export type FrenteVivo = { key: string; nombre: string; n: number };

const PUERTAS: { n: string; titulo: string; detalle: string; href: string }[] = [
  { n: "01", titulo: "Ver qué pasa", detalle: "La última hora del mundo, con su fuente a la vista.", href: "/en-vivo" },
  { n: "02", titulo: "Mirar el planeta", detalle: "El globo vivo: guerras, fronteras y mapas.", href: "/mundo" },
  { n: "03", titulo: "Jugar la misión", detalle: "El Cuartel: salas, misiones y mando.", href: "/cuartel" },
];

/** La cinta de las que salvan al que se pierde. Rutas que existen todas. */
const CINTA: { href: string; nombre: string }[] = [
  { href: "/mapas", nombre: "Mapas" },
  { href: "/conocimiento", nombre: "Conocimiento" },
  { href: "/historia", nombre: "Historia" },
  { href: "/academia", nombre: "Academia" },
  { href: "/investigacion", nombre: "Investigación" },
  { href: "/teatro-3d", nombre: "Teatro 3D" },
  { href: "/radio", nombre: "Radio" },
  { href: "/divisas", nombre: "Divisas" },
];

export function Entrada({
  cables,
  frentes,
  hora,
}: {
  cables: number;
  frentes: FrenteVivo[];
  hora: string;
}) {
  const c = cifrasEcosistema();
  const top = frentes.slice(0, 4);

  return (
    <section className="vxe-ent" aria-labelledby="vxe-ent-titulo">
      {/* ── el fondo: la Tierra de noche (imagen propia, /portada/entrada-mundo.jpg),
             la aurora y el grano. Sin vídeo y sin recursos externos: si la imagen
             no estuviera, quedan los degradados y no se pierde nada. ── */}
      <div className="vxe-ent-fondo" aria-hidden>
        <span className="vxe-ent-tierra" />
        <span className="vxe-ent-aurora vxe-ent-a1" />
        <span className="vxe-ent-aurora vxe-ent-a2" />
        <span className="vxe-ent-grano" />
      </div>

      <div className="vxe-ent-caja">
        <p className="vxe-ent-sello">
          <span className="vxe-ent-punto" aria-hidden />
          en vivo
          <span className="vxe-ent-sep" aria-hidden>·</span>
          <span className="vxe-ent-hora">{hora} UTC</span>
          <span className="vxe-ent-sep" aria-hidden>·</span>
          <span className="vxe-ent-cables">{cables} cables abiertos</span>
        </p>

        <h1 id="vxe-ent-titulo" className="vxe-ent-titulo">
          <span className="vxe-ent-nombre">VANGUARD</span>
          <span className="vxe-ent-def">
            El mundo <em>en directo</em>: qué pasa, dónde pasa y por qué.
          </span>
        </h1>

        <p className="vxe-ent-lema">
          Un periódico vivo del planeta —con la fuente a la vista— y, dentro, el mapa del mundo, un atlas de{" "}
          {c.paises} países, simuladores, historia, ciencia, academia y un juego de guerra. En español. Gratis. Sin
          registrarte para leer.
        </p>

        <div className="vxe-ent-acciones">
          {PUERTAS.map((p) => (
            <Link key={p.href} href={p.href} className="vxe-puerta">
              <span className="vxe-puerta-n">{p.n}</span>
              <span className="vxe-puerta-t">{p.titulo}</span>
              <span className="vxe-puerta-d">{p.detalle}</span>
              <span className="vxe-puerta-flecha" aria-hidden>→</span>
            </Link>
          ))}
          <BotonMente className="vxe-puerta vxe-puerta--mente">
            <span className="vxe-puerta-n">04</span>
            <span className="vxe-puerta-t">Que te lleven</span>
            <span className="vxe-puerta-d">LA MENTE te lleva a cualquier sala. Pídelo y te lleva.</span>
            <span className="vxe-puerta-flecha" aria-hidden>◈</span>
          </BotonMente>
        </div>

        <nav className="vxe-ent-cinta" aria-label="Otras puertas de la casa">
          <span className="vxe-ent-cinta-rotulo">o entra por donde quieras</span>
          {CINTA.map((q) => (
            <Link key={q.href} href={q.href}>
              {q.nombre}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── el mundo de verdad, ahora mismo ── */}
      <aside className="vxe-ent-frentes" aria-label="Frentes abiertos ahora">
        <p className="vxe-ent-frentes-rotulo">frentes abiertos</p>
        {top.length === 0 ? (
          <p className="vxe-ent-frentes-vacio">Sin cables clasificados ahora mismo.</p>
        ) : (
          <ul>
            {top.map((f) => (
              <li key={f.key}>
                <Link href={`/conflicto/${f.key}`}>
                  <span className="vxe-ent-frente-nombre">{f.nombre}</span>
                  <span className="vxe-ent-frente-n">{f.n}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link className="vxe-ent-frentes-mas" href="/conflictos">
          todos los frentes →
        </Link>
      </aside>

      <a className="vxe-ent-bajar" href="#ecosistema" aria-label="Bajar al ecosistema">
        <span aria-hidden>↓</span>
        <em>qué hay dentro</em>
      </a>
    </section>
  );
}
