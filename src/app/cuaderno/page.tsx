import type { Metadata } from "next";
import Link from "next/link";
// ═══════════════════════════════════════════════════════════════════
// v432.4 · EL CUADERNO · LA SALA
//
// El Dueño, textual: «Lo que no me gusta esos colores azules sin imágenes, en
// serio, sin guías ni animaciones. Mejora eso: agrega cada texto a cada color
// de Vanguard, mejóralo de verdad».
//
// Lo que cambió aquí, y por qué:
//   ① SE VA EL AZUL SIN IMAGEN. La sala deja de ser un párrafo con enlaces
//      cian sobre azul oscuro y pasa a vestirse como las demás salas de la
//      casa: la MISMA portada (PortadaSala: ilustración grande, velo, sellos,
//      cifras) y la MISMA piel de oro.
//   ② CADA TEXTO CON SU COLOR DE VANGUARD. Cada bloque toma el acento de su
//      familia de la casa (SECTION_ACCENT de tab-navegación): oro, rojo
//      batalla, cian vivo, turquesa, amatista y verde mercado. No se inventan
//      colores: se leen de la paleta que la casa ya usa en su navegación.
//   ③ FOTOS REALES, CON SU RAZÓN. La casa dejó de usar ilustraciones (v434:
//      «fotos reales»), así que las seis cartas llevan una fotografía que ya
//      viaja en /public/imagenes-reales y /public/assets/real —ninguna se
//      dibuja aquí— y cada una dice por qué está puesta. Las alts describen lo
//      que de verdad se ve en la foto, no lo que nos gustaría que se viera.
//   ④ GUÍA. Tres pasos numerados con flecha: escribir, ordenar, sacarlo.
//   ⑤ ANIMACIÓN CON PROPÓSITO. Las tarjetas entran una tras otra, la imagen
//      respira al pasar el ratón, la barra de color barre una vez y el rombo
//      del paso late. Todo se apaga con `prefers-reduced-motion`.
//   ⑥ CIFRAS QUE NO SE ESCRIBEN A MANO. Salen del modelo del cuaderno
//      (tipos, pieles, vistas, iconos, formas, piezas máximas).
// ═══════════════════════════════════════════════════════════════════

import { PortadaSala } from "@/components/vanguard/portada-sala";
import { Cuaderno } from "@/components/cuaderno/cuaderno";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { FORMAS, ICONOS, MARCA_INFO, MAX_PIEZAS, TIPO_INFO } from "@/lib/cuaderno/modelo";
import { PIELES, TINTAS, VISTAS } from "@/lib/cuaderno/pieles";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "EL CUADERNO — escribe, señala y anota el mundo · cuatro pieles y mapa 3D",
  description:
    "El cuaderno de Vanguard: escribe notas, citas, cifras, tareas, enlaces e imágenes; señala el texto que importa, únelo con hilos, míralo en un mapa 3D del planeta, cambia de piel y edita tu propio emblema. Vive en tu aparato: sin cuentas y sin servidor.",
  alternates: { canonical: "/cuaderno" },
  openGraph: {
    title: "EL CUADERNO — escribe, señala y anota el mundo · VANGUARD",
    description:
      "Notas, citas, cifras, tareas, lugares e imágenes con cuatro pieles, un tablero que se arrastra, un mapa 3D de todo y un emblema editable. Se guarda en tu aparato.",
    url: `${SITE_URL}/cuaderno`,
    images: ["/imagenes-reales/control.jpg"],
  },
};

// La paleta de la casa, leída de donde la casa la tiene (SECTION_ACCENT de
// tab-navegación: un color por familia, no ocurrencias sueltas). El script
// scripts/pruebas-cuaderno.mjs comprueba que estos seis hexes siguen siendo
// los de la navegación: si la casa repinta un mundo, aquí se nota.
const ORO = "#FFC94D";      // inicio — la identidad de la casa
const ROJO = "#FF6B5A";     // juego — lo que importa: señalar y la guerra
const CIAN = "#7FE3FF";     // inteligencia — conocimiento: hilos y relaciones
const TURQUESA = "#5EEAD4"; // observatorio — el planeta: el mapa 3D
const AMATISTA = "#A855F7"; // universo — lo tuyo: pieles y emblema
const VERDE = "#34D399";    // sistema — lo que se guarda y no se pierde

const N_TIPOS = Object.keys(TIPO_INFO).length;
const N_MARCAS = Object.keys(MARCA_INFO).length;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "EL CUADERNO — VANGUARD",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  description:
    "Cuaderno de anotación con siete clases de pieza, texto con marcas, señalar, hilos entre piezas, tablero arrastrable, mapa 3D del planeta, cuatro pieles y emblema editable.",
  url: `${SITE_URL}/cuaderno`,
  isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  featureList: [
    `${N_TIPOS} clases de pieza: ${Object.values(TIPO_INFO).map((t) => t.nombre.toLowerCase()).join(", ")}`,
    "Texto con negrita, cursiva, listas, tareas, citas y enlaces",
    "Señalar un tramo del texto propio",
    "Hilos entre piezas y piezas relacionadas por etiquetas",
    "Tablero de arrastre y mapa 3D con las coordenadas reales",
    "Cuatro pieles y emblema editable con descarga en SVG",
    "Exportar a Markdown y JSON, importar y traer el tablero de la Zona Cero",
  ],
};

type Bloque = {
  n: string;
  titulo: string;
  color: string;
  familia: string;
  imagen: string;
  alt: string;
  pie: string;
  texto: string;
  puerta: { href: string; que: string };
};

const BLOQUES: Bloque[] = [
  {
    n: "01",
    titulo: "Escribe",
    color: ORO,
    familia: "oro · la identidad de la casa",
    imagen: "/imagenes-reales/khmer.jpg",
    alt: "Los templos de Angkor, entre la selva, vistos desde lo alto",
    pie: "Angkor · la piedra que guardó siglos de inscripciones",
    texto: `${N_TIPOS} clases de pieza y un editor con negrita, cursiva, código, listas, tareas, citas y enlaces. La vista previa te enseña cómo queda antes de guardar, y el contador dice cuántas palabras son y cuánto se tarda en leerlas.`,
    puerta: { href: "#el-cuaderno", que: "Escribir la primera" },
  },
  {
    n: "02",
    titulo: "Señala",
    color: ROJO,
    familia: "rojo batalla · lo que importa",
    imagen: "/assets/real/parade-1.jpg",
    alt: "Un desfile militar en una avenida, con banderas rojas y una tribuna al fondo",
    pie: "Un desfile · lo que se pone delante para que todos lo vean",
    texto:
      "Eliges un tramo del texto y pulsas «Señalar»: queda resaltado con el acento de la piel. Si repites sobre el mismo tramo, el resaltado se va. Lo señalado se ve igual en la lista, en la vista previa y en el Markdown exportado.",
    puerta: { href: "#guia", que: "Ver los tres pasos" },
  },
  {
    n: "03",
    titulo: "Ordena y une",
    color: CIAN,
    familia: "cian vivo · conocimiento",
    imagen: "/assets/real/radar-1.jpg",
    alt: "Sala de radar con un tablero de mapas iluminado y trazos de tinta",
    pie: "Una sala de trazos · fichas unidas a mano sobre el mapa",
    texto:
      "La vista de tablero deja arrastrar las fichas (dedo, ratón o lápiz) y unirlas con hilos: un país, una cifra y una noticia que cuentan la misma historia. «Acomodar» las reparte sin amontonarlas.",
    puerta: { href: "#el-cuaderno", que: "Abrir el tablero" },
  },
  {
    n: "04",
    titulo: "Míralo en 3D",
    color: TURQUESA,
    familia: "turquesa · el planeta",
    imagen: "/imagenes-reales/satelite.jpg",
    alt: "Un satélite en órbita sobre la Tierra, con el planeta al fondo",
    pie: "Un satélite sobre el planeta · el globo de la casa",
    texto:
      "Cada pieza con coordenadas es un punto del planeta y cada hilo un arco sobre el globo. Toca el globo y el cuaderno fija ahí el lugar; lo que no tiene sitio se queda en la lista, sin inventarse una geografía.",
    puerta: { href: "#el-cuaderno", que: "Encender el globo" },
  },
  {
    n: "05",
    titulo: "Cámbialo de piel y de emblema",
    color: AMATISTA,
    familia: "amatista · lo tuyo",
    imagen: "/imagenes-reales/rapanui.jpg",
    alt: "Los moáis de Rapa Nui alineados mirando al mar",
    pie: "Rapa Nui · figuras talladas: el emblema en la piedra",
    texto: `${PIELES.length} pieles (cuaderno de campo, pizarra táctica, constelación y terminal) cambian el papel, la tinta y la letra. El emblema —${FORMAS.length} formas, ${ICONOS.length} iconos, monograma, lema y ${TINTAS.length} tintas— se edita y se descarga en SVG.`,
    puerta: { href: "#el-cuaderno", que: "Editar el emblema" },
  },
  {
    n: "06",
    titulo: "Se queda contigo",
    color: VERDE,
    familia: "verde · lo que no se pierde",
    imagen: "/imagenes-reales/svalbard.jpg",
    alt: "La bóveda de semillas de Svalbard, sola en la nieve",
    pie: "Svalbard · la bóveda donde se guarda lo que no se puede perder",
    texto:
      "Todo vive en tu aparato: no hay cuentas ni servidor que guarden lo que escribes. Exporta a Markdown o a JSON cuando quieras, importa lo que tengas y trae de una vez el tablero que hubieras hecho en la Zona Cero.",
    puerta: { href: "/zona-cero", que: "Ver la Zona Cero" },
  },
];

const PASOS = [
  {
    n: "1",
    color: ORO,
    titulo: "Escribe la primera pieza",
    texto: "Pulsa «✎ Escribir», ponle título y escribe. Con ==dos iguales== señalas, con - [ ] haces una tarea.",
  },
  {
    n: "2",
    color: CIAN,
    titulo: "Ordénala con las demás",
    texto: "Cambia a «Tablero», arrastra la ficha, y con ⇄ únela a otra: los hilos quedan guardados.",
  },
  {
    n: "3",
    color: VERDE,
    titulo: "Sácala o mírala en el planeta",
    texto: "«↓ Markdown» y «↓ JSON» la sacan de la casa; «Mapa 3D» la pone en el globo si tiene coordenadas.",
  },
];

export default function CuadernoPage() {
  return (
    <main className="cuds">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />

      <PortadaSala ruta="/cuaderno"
        nivel="h1"
        prioritaria
        imagen="/imagenes-reales/control.jpg"
        alt="Sala de control con una gran pantalla de mapa y consolas encendidas"
        ancho={1600}
        alto={1200}
        volanta="LA CASA · ANOTACIÓN"
        titulo="EL CUADERNO"
        acento={ORO}
        sumario="Escribe, señala y anota el mundo: notas, citas, cifras, tareas, lugares e imágenes, unidas con hilos, en un mapa 3D del planeta y con tu propio emblema. Se queda en tu aparato."
        cifras={[
          { valor: N_TIPOS, etiqueta: "clases de pieza", nota: "con su fuente" },
          { valor: PIELES.length, etiqueta: "pieles", nota: "cambian el papel" },
          { valor: VISTAS.length, etiqueta: "vistas", nota: "lista, tablero, globo" },
          { valor: `${FORMAS.length}×${ICONOS.length}`, etiqueta: "emblemas", nota: "formas × iconos" },
          { valor: MAX_PIEZAS, etiqueta: "piezas", nota: "por cuaderno" },
        ]}
        puntos={[
          {
            titulo: "Escribir y señalar",
            texto: "Editor con formato, vista previa y resaltado del tramo que eliges. Lo señalado viaja al Markdown.",
          },
          {
            titulo: "Unirlo todo",
            texto: "Hilos entre piezas y piezas relacionadas por etiquetas: un país, una cifra y un cable en la misma historia.",
          },
          {
            titulo: "Mapa 3D de todo",
            texto: "El globo de la casa con tus piezas como puntos y tus hilos como arcos sobre el planeta.",
          },
        ]}
        anclas={[
          { etiqueta: "El cuaderno", href: "#el-cuaderno" },
          { etiqueta: "Guía en tres pasos", href: "#guia" },
          { etiqueta: "Lo que hay dentro", href: "#lo-que-hay" },
          { etiqueta: "Los colores", href: "#colores" },
        ]}
        nota="Sin cuentas y sin servidor: lo que escribes vive en este aparato."
      />

      {/* ─────────── el módulo, a lo ancho ─────────── */}
      <section id="el-cuaderno" className="cuds-cuerpo" aria-label="El cuaderno">
        <Cuaderno />
      </section>

      {/* ─────────── la guía: tres pasos, con flechas ─────────── */}
      <section id="guia" className="cuds-guia" aria-labelledby="cuds-guia-t">
        <header className="cuds-cab">
          <span className="cuds-volanta">GUÍA · DE LA MANO</span>
          <h2 id="cuds-guia-t">Tres pasos y ya está dentro</h2>
          <p>No hay que configurar nada ni crear cuenta: se escribe, se ordena y se saca.</p>
        </header>
        <ol className="cuds-pasos">
          {PASOS.map((p, i) => (
            <li key={p.n} className="cuds-paso" style={{ ["--c" as string]: p.color }}>
              <span className="cuds-paso-n" aria-hidden>
                {p.n}
              </span>
              <div>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </div>
              {i < PASOS.length - 1 ? (
                <svg className="cuds-flecha" viewBox="0 0 60 24" aria-hidden focusable="false">
                  <path d="M2 12h50" />
                  <path d="M46 5l8 7-8 7" />
                </svg>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="cuds-atajos">
          Atajos de la casa: <kbd>/</kbd> buscar · <kbd>n</kbd> pieza nueva · <kbd>s</kbd> señalar ·{" "}
          <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> vistas · <kbd>Ctrl</kbd>+<kbd>Z</kbd> deshacer ·{" "}
          <kbd>Esc</kbd> cerrar
        </p>
      </section>

      {/* ─────────── lo que hay dentro: cada texto con su color ─────────── */}
      <section id="lo-que-hay" className="cuds-rejilla" aria-labelledby="cuds-rejilla-t">
        <header className="cuds-cab">
          <span className="cuds-volanta">DENTRO DEL CUADERNO</span>
          <h2 id="cuds-rejilla-t">Lo que puedes hacer aquí</h2>
          <p>
            Seis cosas, cada una con su color de la casa y una foto real que dice por qué
            está. Ninguna es un adorno: todas se pueden tocar en el cuaderno de arriba.
          </p>
        </header>
        <div className="cuds-cartas">
          {BLOQUES.map((b, i) => (
            <article key={b.titulo} className="cuds-carta" style={{ ["--c" as string]: b.color, ["--i" as string]: i }}>
              {/* La foto va como FONDO del marco: con <img> + su propio filtro o
                  escala, este motor la rasterizaba en negro y la tarjeta salía
                  vacía (lo destapó la QA con navegador). Como fondo se pinta
                  siempre, conserva su zoom al pasar el ratón y lleva su
                  descripción para quien no la ve. */}
              <div
                className="cuds-carta-foto"
                role="img"
                aria-label={b.alt}
                style={{ backgroundImage: `url(${b.imagen})` }}
              >
                <span className="cuds-carta-n">{b.n}</span>
                <span className="cuds-carta-familia">{b.familia}</span>
              </div>
              <p className="cuds-carta-pie">{b.pie}</p>
              <div className="cuds-carta-txt">
                <h3>{b.titulo}</h3>
                <p>{b.texto}</p>
                <a className="cuds-carta-puerta" href={b.puerta.href}>
                  {b.puerta.que} <span aria-hidden>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─────────── la leyenda de colores ─────────── */}
      <section id="colores" className="cuds-paleta" aria-labelledby="cuds-paleta-t">
        <header className="cuds-cab">
          <span className="cuds-volanta">LA PALETA</span>
          <h2 id="cuds-paleta-t">Cada cosa con su color</h2>
          <p>
            Los mismos colores que la casa usa en su navegación, con su significado. El cuaderno los respeta:
            dentro, la piel que elijas los ordena a su manera.
          </p>
        </header>
        <ul className="cuds-leyenda">
          {[
            { c: ORO, n: "Oro", q: "la identidad: lo que se lee y se escribe" },
            { c: ROJO, n: "Rojo", q: "lo que importa: señalar y la guerra" },
            { c: CIAN, n: "Cian", q: "conocimiento: hilos y relaciones" },
            { c: TURQUESA, n: "Turquesa", q: "el planeta: el mapa 3D" },
            { c: AMATISTA, n: "Amatista", q: "lo tuyo: pieles y emblema" },
            { c: VERDE, n: "Verde", q: "lo que se guarda y no se pierde" },
          ].map((l) => (
            <li key={l.n} style={{ ["--c" as string]: l.c }}>
              <i aria-hidden />
              <b>{l.n}</b>
              <span>{l.q}</span>
            </li>
          ))}
        </ul>
        <p className="cuds-nota">
          <b>Lo que la casa no hace</b>: no inventa notas por ti, no rellena huecos con datos de ejemplo y no
          guarda nada fuera de tu aparato. Si algo no lo has escrito, no está. Dentro hay {N_MARCAS} marcas
          (señalada, importante, por comprobar, comprobada) para que tú mismo digas qué está comprobado.
        </p>
      </section>

      {/* ─────────── puertas ─────────── */}
      <nav className="cuds-puertas" aria-label="Puertas desde el cuaderno">
        <Link href="/zona-cero">
          <span aria-hidden>◎</span> Buscar en toda la casa
        </Link>
        <Link href="/radio">
          <span aria-hidden>▶</span> Oír la radio
        </Link>
        <Link href="/en-vivo">
          <span aria-hidden>▤</span> Los cables de hoy
        </Link>
        <Link href="/academia">
          <span aria-hidden>◇</span> Academia
        </Link>
      </nav>

      <style>{`
        /* ── la sala viste la piel de la casa: oro, no azul ── */
        .cuds {
          --oro: ${ORO};
          --linea: rgba(232, 197, 106, .22);
          max-width: 1320px;
          margin: 0 auto;
          /* el muelle de la casa (caras + emisora + orbe) y el riel de iconos
             son fijos: se les deja su sitio para que no tapen nada */
          padding: 0 14px 172px;
          color: #e9eef7;
        }
        @media (min-width: 900px) { .cuds { padding-left: 74px; padding-right: 24px; } }
        @media (max-width: 760px) { .cuds { padding-bottom: 200px; } }

        .cuds-cuerpo { margin-top: 18px; scroll-margin-top: 84px; }

        .cuds-cab { max-width: 70ch; margin: 0 0 16px; }
        .cuds-volanta {
          font: 800 10px/1 ui-monospace, Menlo, monospace;
          letter-spacing: .22em;
          color: var(--oro);
        }
        .cuds-cab h2 {
          margin: 8px 0 6px;
          font: 900 clamp(1.35rem, 3vw, 2rem)/1.05 Orbitron, system-ui, sans-serif;
          letter-spacing: .02em;
          color: #fff;
        }
        .cuds-cab p { margin: 0; font: 400 14px/1.6 system-ui, sans-serif; color: #b9c2d0; }

        /* ── guía: tres pasos con flecha ── */
        .cuds-guia { margin-top: 40px; scroll-margin-top: 84px; }
        .cuds-pasos {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
          counter-reset: paso;
        }
        .cuds-paso {
          position: relative;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 12px;
          align-items: start;
          padding: 16px 16px 18px;
          border: 1px solid var(--linea);
          border-top: 2px solid var(--c);
          border-radius: 12px;
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--c) 12%, transparent), transparent 62%),
            linear-gradient(180deg, rgba(14, 17, 24, .94), rgba(8, 10, 15, .94));
          animation: cuds-sube .5s ease both;
        }
        .cuds-paso:nth-child(2) { animation-delay: .08s; }
        .cuds-paso:nth-child(3) { animation-delay: .16s; }
        .cuds-paso-n {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid var(--c);
          color: var(--c);
          font: 800 15px/1 Orbitron, system-ui, sans-serif;
          animation: cuds-late 2.6s ease-in-out infinite;
        }
        .cuds-paso h3 { margin: 2px 0 5px; font: 800 14px/1.25 system-ui, sans-serif; color: #fff; letter-spacing: .01em; }
        .cuds-paso p { margin: 0; font: 400 12.5px/1.6 system-ui, sans-serif; color: #b3bdcc; }
        .cuds-flecha {
          position: absolute;
          right: -14px;
          top: 50%;
          width: 28px;
          height: 24px;
          transform: translateY(-50%);
          fill: none;
          stroke: var(--oro);
          stroke-width: 1.6;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: .55;
        }
        @media (max-width: 760px) { .cuds-flecha { display: none; } }
        .cuds-atajos {
          margin: 14px 0 0;
          font: 500 11.5px/1.9 system-ui, sans-serif;
          color: #8e99a8;
        }
        .cuds-atajos kbd {
          font: 700 10.5px/1 ui-monospace, monospace;
          color: var(--oro);
          border: 1px solid var(--linea);
          border-bottom-width: 2px;
          border-radius: 5px;
          padding: 3px 5px;
          background: rgba(255, 201, 77, .07);
        }

        /* ── las seis cartas: imagen + color propio ── */
        .cuds-rejilla { margin-top: 44px; scroll-margin-top: 84px; }
        .cuds-cartas {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 16px;
        }
        .cuds-carta {
          position: relative;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--linea);
          border-radius: 14px;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(14, 17, 24, .96), rgba(7, 9, 14, .96));
          animation: cuds-sube .6s ease both;
          animation-delay: calc(var(--i) * .07s);
          transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
        }
        .cuds-carta:hover {
          transform: translateY(-3px);
          border-color: color-mix(in srgb, var(--c) 55%, transparent);
          box-shadow: 0 18px 40px rgba(0, 0, 0, .45);
        }
        .cuds-carta::before {
          /* la barra de color de la familia: barre una vez al entrar */
          content: "";
          position: absolute;
          inset: 0 auto auto 0;
          height: 3px;
          width: 100%;
          background: var(--c);
          transform-origin: left;
          animation: cuds-barre .9s ease both;
          animation-delay: calc(var(--i) * .07s + .15s);
          z-index: 2;
        }
        .cuds-carta-foto {
          position: relative;
          aspect-ratio: 2 / 1;
          overflow: hidden;
          background-color: #0a0d13;
          background-position: center 42%;
          background-size: 100%;
          background-repeat: no-repeat;
          transition: background-size 1.1s ease;
        }
        .cuds-carta:hover .cuds-carta-foto { background-size: 107%; }
        .cuds-carta-foto::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(180deg, transparent 42%, rgba(7, 9, 14, .9) 100%);
        }
        .cuds-carta-n {
          position: absolute;
          left: 10px;
          top: 9px;
          z-index: 3;
          font: 800 10px/1 ui-monospace, monospace;
          letter-spacing: .18em;
          color: #06101a;
          background: var(--c);
          padding: 4px 7px;
          border-radius: 4px;
        }
        .cuds-carta-pie {
          margin: 0;
          padding: 8px 18px 0;
          color: color-mix(in srgb, var(--c) 62%, #8a93a3);
          font-size: 10.5px;
          letter-spacing: .1em;
          text-transform: uppercase;
          line-height: 1.5;
        }
        .cuds-carta-familia {
          position: absolute;
          left: 12px;
          bottom: 8px;
          z-index: 3;
          font: 700 9.5px/1 ui-monospace, monospace;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: var(--c);
        }
        .cuds-carta-txt { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .cuds-carta-txt h3 {
          margin: 0;
          font: 800 15px/1.2 system-ui, sans-serif;
          color: #fff;
          letter-spacing: .01em;
        }
        .cuds-carta-txt p { margin: 0; font: 400 12.5px/1.62 system-ui, sans-serif; color: #aeb8c6; flex: 1; }
        .cuds-carta-puerta {
          align-self: flex-start;
          font: 700 11.5px/1 system-ui, sans-serif;
          color: var(--c);
          text-decoration: none;
          border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
          border-radius: 999px;
          padding: 7px 11px;
          background: color-mix(in srgb, var(--c) 10%, transparent);
          transition: background .2s ease, color .2s ease;
        }
        .cuds-carta-puerta:hover { background: var(--c); color: #06101a; }
        .cuds-carta-puerta span { display: inline-block; transition: transform .2s ease; }
        .cuds-carta-puerta:hover span { transform: translateX(3px); }

        /* ── la leyenda de colores ── */
        .cuds-paleta { margin-top: 44px; scroll-margin-top: 84px; }
        .cuds-leyenda {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 10px;
        }
        .cuds-leyenda li {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 4px 9px;
          align-items: center;
          padding: 11px 12px;
          border: 1px solid var(--linea);
          border-radius: 10px;
          background: rgba(10, 13, 19, .8);
        }
        .cuds-leyenda i {
          grid-row: span 2;
          width: 14px;
          height: 14px;
          border-radius: 3px;
          background: var(--c);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 18%, transparent);
          transform: rotate(45deg);
        }
        .cuds-leyenda b { font: 800 12px/1 system-ui, sans-serif; color: var(--c); letter-spacing: .04em; }
        .cuds-leyenda span { font: 400 11.5px/1.45 system-ui, sans-serif; color: #9fabb9; }
        .cuds-nota {
          margin: 16px 0 0;
          font: 400 12.5px/1.65 system-ui, sans-serif;
          color: #93a0af;
          border-left: 2px solid var(--oro);
          padding-left: 12px;
        }
        .cuds-nota b { color: #e9eef7; }

        /* ── puertas ── */
        .cuds-puertas { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 34px; }
        .cuds-puertas a {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font: 700 12px/1 system-ui, sans-serif;
          color: #e9eef7;
          text-decoration: none;
          border: 1px solid var(--linea);
          border-radius: 999px;
          padding: 9px 13px;
          background: rgba(10, 13, 19, .8);
          transition: border-color .2s ease, background .2s ease, transform .2s ease;
        }
        .cuds-puertas a:hover {
          border-color: var(--oro);
          background: rgba(255, 201, 77, .1);
          transform: translateY(-1px);
        }
        .cuds-puertas a span { color: var(--oro); }

        @keyframes cuds-sube { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes cuds-barre { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes cuds-late {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--c) 0%, transparent); }
          50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--c) 14%, transparent); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cuds-paso, .cuds-carta, .cuds-carta::before, .cuds-paso-n { animation: none !important; }
          .cuds-carta, .cuds-carta-foto img, .cuds-puertas a { transition: none !important; }
        }
      `}</style>
    </main>
  );
}
