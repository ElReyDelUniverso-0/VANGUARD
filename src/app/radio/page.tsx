// ═══════════════════════════════════════════════════════════════════
// v422.3 RADIO VANGUARD · /radio — la casa en voz alta, con pausas que se
// oyen y una conversación que se puede sostener.
//
// POR QUÉ ESTA PÁGINA Y NO OTRA: /voz (v367.2) es la VOZ MAESTRA —una mesa
// de consulta con cuatro personas y un maestro de geopolítica—; lo que el
// Dueño pidió ahora es un PROGRAMA: que la casa lea sus cables del día
// seguidos, con respiración entre bloques, y que además conteste. No es un
// duplicado: esta sala no repite el maestro ni sus clases. Lee el archivo
// tal como está, dice de dónde sale cada bloque y, cuando no sabe algo, lo
// dice en vez de inventarlo.
//
// QUÉ HACE DE VERDAD (nada de esto es una promesa de folleto):
//   · El guion (`lib/radio/guion`) es puro: ordena los cables reales en
//     sintonía → titulares → desarrollo → cierre, y calcula el silencio
//     que va DESPUÉS de cada bloque (`pausaMs`). El reproductor no simula
//     pausas con puntos suspensivos: encadena `decir()` por bloque y espera
//     ese silencio real antes del siguiente.
//   · La conversación (`lib/radio/conversar`) interpreta la pregunta,
//     busca en los cables y contesta citando fuente. Si no encuentra nada,
//     contesta que no lo tiene.
//   · La voz la pone el aparato con la boca que ya usa la casa
//     (`lib/voz/decir`): mismas personas, mismos gustos guardados, misma
//     lista de voces medidas. Aquí se añade estilo de programa, longitud y
//     el silencio entre bloques. Todo se guarda en el aparato.
//
// Server-rendered el marco; el audio nunca sale del aparato.
// ═══════════════════════════════════════════════════════════════════

import type { Metadata } from "next";
import Link from "next/link";
import "@/components/radio/radio.css";
import { RadioVanguard } from "@/components/radio/radio-vanguard";
import { obtenerNotas, type Nota } from "@/lib/portada/notas";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "Radio Vanguard · la casa en voz alta",
  description:
    "El programa del día leído en voz alta a partir de los cables reales, con silencios que se oyen, fuente en pantalla y una conversación que contesta solo con lo que hay en el archivo. Voz, ritmo, tono, estilo y pausas a tu gusto, guardados en tu aparato.",
  alternates: { canonical: `${SITE_URL}/radio` },
  openGraph: {
    title: "Radio Vanguard",
    description:
      "Lee los cables del día con pausas naturales, los explica y contesta tus preguntas citando la fuente.",
    url: `${SITE_URL}/radio`,
    siteName: "VANGUARD",
    type: "website",
    locale: "es_ES",
  },
};

export const dynamic = "force-static";
export const revalidate = 600;

const PUERTAS = [
  { href: "/voz", etiqueta: "LA VOZ MAESTRA ▸", detalle: "cuatro personas y clases de geopolítica" },
  { href: "/cronica", etiqueta: "LA CRÓNICA DEL DÍA ▸", detalle: "el parte escrito, por si prefieres leer" },
  { href: "/en-vivo", etiqueta: "EL PULSO ▸", detalle: "lo que entra minuto a minuto" },
  { href: "/ecosistema", etiqueta: "EL ECOSISTEMA ▸", detalle: "las diez familias de la casa" },
];

export default async function PaginaRadio() {
  let notas: Nota[] = [];
  try {
    notas = await obtenerNotas();
  } catch {
    notas = [];
  }

  const fuentes = new Set(notas.map((n) => n.fuente)).size;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    name: "Radio Vanguard",
    url: `${SITE_URL}/radio`,
    description:
      "Programa de voz generado en el aparato a partir de los cables reales del archivo de VANGUARD, con la fuente de cada bloque.",
  };

  return (
    <div className="vxr-pagina">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />

      <header className="vxr-pagina-cab">
        <p className="vxr-sello">
          VANGUARD · RADIO DE LA CASA · {notas.length} {notas.length === 1 ? "CABLE" : "CABLES"} · {fuentes}{" "}
          {fuentes === 1 ? "FUENTE" : "FUENTES"}
        </p>
        <h1>
          La casa, <em>en voz alta</em>
        </h1>
        <p className="vxr-lema">
          Un programa leído de los cables reales de hoy: primero los titulares, luego cada asunto con su fuente y su
          hora, y un cierre. Entre bloque y bloque hay silencio de verdad — el que deja la boca antes de la frase
          siguiente, no tres puntos suspensivos. Y si le preguntas algo que no está en el archivo, te lo dice.
        </p>
        <nav className="vxr-puertas" aria-label="Puertas de la casa relacionadas">
          {PUERTAS.map((p) => (
            <Link key={p.href} href={p.href} className="vxr-puerta" title={p.detalle}>
              {p.etiqueta}
            </Link>
          ))}
        </nav>
      </header>

      <div className="vxr-pagina-cuerpo">
        <RadioVanguard notas={notas} ahoraServidor={Date.now()} />
      </div>

      <footer className="vxr-pagina-pie">
        <p>
          Cómo funciona, sin adornos: el guion se arma en el servidor con los mismos cables que ves en{" "}
          <Link href="/">la portada</Link>; la voz, el ritmo y los silencios los pone tu aparato a través de su motor
          de habla, así que la calidad depende de las voces instaladas (cada una lleva su nota medida en la lista). No
          se envía audio a ningún sitio y no hay cuenta. Si tu aparato no puede hablar, el programa sigue entero en
          pantalla y se puede copiar.
        </p>
        <p>
          Si lo que buscas es que la casa te explique un teatro o un concepto, eso es{" "}
          <Link href="/voz">la Voz Maestra</Link>. Si buscas el parte escrito,{" "}
          <Link href="/cronica">la Crónica del Día</Link>.
        </p>
      </footer>
    </div>
  );
}
