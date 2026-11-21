import type { Metadata } from "next";
import Link from "next/link";
// v431.6 EL CUADERNO — el anotador de la casa, en su propia sala.
// Orden del Dueño, textual: «Mejora la anotadero, que sea un módulo aparte, que
// sea más hermoso, que sea más fluido, que pueda agregar más cosas; este módulo
// también uno pueda escribir, señalar y mucho más. También agrega más
// variaciones, pueda editar el logo, o sea todo anotar y poner mapas 3D de todo,
// hacerlo expansible más».
import { Cuaderno } from "@/components/cuaderno/cuaderno";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";

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
    images: ["/api/og"],
  },
};

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
    "Siete clases de pieza: nota, cita, enlace, lugar, cifra, tarea e imagen",
    "Texto con negrita, cursiva, listas, tareas, citas y enlaces",
    "Señalar un tramo del texto propio",
    "Hilos entre piezas y piezas relacionadas por etiquetas",
    "Tablero de arrastre y mapa 3D con las coordenadas reales",
    "Cuatro pieles y emblema editable con descarga en SVG",
    "Exportar a Markdown y JSON, importar y traer el tablero de la Zona Cero",
  ],
};

const COMO: { titulo: string; texto: string }[] = [
  {
    titulo: "Escribe",
    texto:
      "Siete clases de pieza y un editor con negrita, cursiva, código, listas, tareas, citas y enlaces. La vista previa te enseña cómo queda antes de guardar, y el contador dice cuántas palabras son y cuánto se tarda en leerlas.",
  },
  {
    titulo: "Señala",
    texto:
      "Eliges un tramo del texto y pulsas «Señalar»: queda resaltado con el acento de la piel. Si repites sobre el mismo tramo, el resaltado se va. Lo señalado se marca igual en la lista, en la vista previa y en el Markdown exportado.",
  },
  {
    titulo: "Ordena y une",
    texto:
      "La vista de tablero deja arrastrar las fichas (dedo, ratón o lápiz) y unirlas con hilos: un país, una cifra y una noticia que cuentan la misma historia. «Acomodar» las reparte sin amontonarlas.",
  },
  {
    titulo: "Míralo en 3D",
    texto:
      "Cada pieza con coordenadas es un punto del planeta y cada hilo un arco sobre el globo. Toca el globo y el cuaderno fija ahí el lugar; lo que no tiene sitio se queda en la lista, sin inventarse una geografía.",
  },
  {
    titulo: "Cámbialo de piel",
    texto:
      "Cuatro pieles (cuaderno de campo, pizarra táctica, constelación y terminal) cambian el papel, la tinta y la letra. El emblema —forma, icono, monograma, tintas y lema— se edita y se descarga en SVG.",
  },
  {
    titulo: "Se queda contigo",
    texto:
      "Todo vive en tu aparato: no hay cuentas ni servidor que guarden lo que escribes. Exporta a Markdown o a JSON cuando quieras, importa lo que tengas y trae de una vez el tablero que hubieras hecho en la Zona Cero.",
  },
];

export default function CuadernoPage() {
  return (
    <main className="cu-sala">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />

      <header className="cu-sala-cab">
        <p className="cu-sala-sello">Anotación de la casa · sin cuentas</p>
        <h1>
          EL CUADERNO
          <span>escribe, señala y anota el mundo</span>
        </h1>
        <p className="cu-sala-intro">
          Aquí se apunta lo que no quieres perder: una nota tuya, una cita con su fuente, una cifra con su
          unidad, una tarea, un enlace a una sala, una imagen con su crédito o un lugar con sus coordenadas.
          Todo lo que escribas se queda <b>en tu aparato</b> —ni cuentas ni servidor— y se puede sacar cuando
          quieras en Markdown o en JSON.
        </p>
        <nav className="cu-sala-puertas" aria-label="Puertas del cuaderno">
          <Link href="/zona-cero">◎ Buscar en toda la casa (Zona Cero)</Link>
          <Link href="/radio">▶ Oír la radio de la casa</Link>
          <Link href="/en-vivo">▤ Leer los cables de hoy</Link>
          <Link href="/cuartel">◇ Todas las salas</Link>
        </nav>
      </header>

      <Cuaderno />

      <section className="cu-como" aria-label="Cómo funciona el cuaderno">
        <h2>Lo que puedes hacer aquí</h2>
        <div className="cu-como-rejilla">
          {COMO.map((c, i) => (
            <article key={c.titulo}>
              <span className="cu-como-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{c.titulo}</h3>
              <p>{c.texto}</p>
            </article>
          ))}
        </div>
        <p className="cu-como-nota">
          Lo que la casa <b>no</b> hace: no inventa notas por ti, no rellena huecos con datos de ejemplo y no
          guarda nada fuera de tu aparato. Si algo no lo has escrito, no está.
        </p>
      </section>

      <style>{`
        .cu-sala {
          max-width: 1280px;
          margin: 0 auto;
          padding: 26px 14px 72px;
          color: #e9eef7;
        }
        .cu-sala-cab { max-width: 78ch; margin-bottom: 20px; }
        .cu-sala-sello {
          margin: 0;
          font: 700 10px/1 ui-monospace, Menlo, monospace;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: #e8c56a;
        }
        .cu-sala-cab h1 {
          margin: 8px 0 10px;
          font: 900 clamp(2rem, 5vw, 3.2rem)/1.02 system-ui, sans-serif;
          letter-spacing: .02em;
        }
        .cu-sala-cab h1 span {
          display: block;
          margin-top: 6px;
          font: 600 clamp(.95rem, 2.2vw, 1.2rem)/1.3 system-ui, sans-serif;
          letter-spacing: .02em;
          color: #b9c4d6;
        }
        .cu-sala-intro { margin: 0; font: 400 15px/1.65 system-ui, sans-serif; color: #c3cddd; }
        .cu-sala-intro b { color: #fff; }
        .cu-sala-puertas { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
        .cu-sala-puertas a {
          font: 600 12px/1 system-ui, sans-serif;
          color: #cdf3fa;
          text-decoration: none;
          border: 1px solid rgba(34, 211, 238, .35);
          border-radius: 999px;
          padding: 8px 12px;
        }
        .cu-sala-puertas a:hover { background: rgba(34, 211, 238, .12); }
        .cu-como { margin-top: 34px; }
        .cu-como h2 {
          margin: 0 0 14px;
          font: 800 clamp(1.1rem, 2.4vw, 1.5rem)/1.2 system-ui, sans-serif;
          letter-spacing: .04em;
        }
        .cu-como-rejilla {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        }
        .cu-como-rejilla article {
          border: 1px solid rgba(147, 161, 184, .22);
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(12, 17, 28, .9), rgba(7, 10, 16, .9));
          padding: 14px 15px;
        }
        .cu-como-num {
          font: 700 10px/1 ui-monospace, monospace;
          letter-spacing: .18em;
          color: #e8c56a;
        }
        .cu-como-rejilla h3 {
          margin: 7px 0 6px;
          font: 700 14px/1.25 system-ui, sans-serif;
          letter-spacing: .03em;
        }
        .cu-como-rejilla p { margin: 0; font: 400 12.5px/1.6 system-ui, sans-serif; color: #aeb8c8; }
        .cu-como-nota {
          margin: 16px 0 0;
          font: 400 12.5px/1.6 system-ui, sans-serif;
          color: #8d99ab;
          border-left: 2px solid #e8c56a;
          padding-left: 12px;
        }
        .cu-como-nota b { color: #e9eef7; }
      `}</style>
    </main>
  );
}
