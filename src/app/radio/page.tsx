// ═══════════════════════════════════════════════════════════════════
// v431.2 RADIO VANGUARD · /radio — la casa en voz alta, ahora editada.
//
// QUÉ CAMBIA SOBRE v422.3, EN LA CARA DEL LECTOR:
//   · la cabecera deja de contar cables y cuenta ASUNTOS: «150 cables que
//     cuentan 96 asuntos distintos · 39 repetidos por otros medios». Son
//     cuentas reales del archivo (lib/radio/agrupar.ts), no adornos;
//   · debajo del estudio, cuatro reglas escritas que explican CÓMO se elige
//     lo que se cuenta (agrupar, diversidad, duración, honestidad);
//   · el estudio trae subtítulos de la frase que suena, rail de bloques,
//     presets, micrófono y memoria de conversación.
//
// Sigue sin ser un duplicado de /voz (v367.2, la Voz Maestra): esta sala lee
// el día; aquella da clase. Cada una enlaza a la otra.
// Server-rendered el marco; el audio nunca sale del aparato.
// ═══════════════════════════════════════════════════════════════════

import type { Metadata } from "next";
import Link from "next/link";
import "@/components/radio/radio.css";
import { RadioVanguard } from "@/components/radio/radio-vanguard";
import { obtenerNotas, type Nota } from "@/lib/portada/notas";
import { estadisticas } from "@/lib/radio/agrupar";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard.vanguard-casa.workers.dev";

export const metadata: Metadata = {
  title: "Radio Vanguard · la casa en voz alta, editada",
  description:
    "El programa del día leído de los cables reales: agrupa las noticias que cuentan lo mismo, elige con diversidad de región y fuente, dura lo que tú digas (2 a 15 minutos), pone subtítulos de la frase que suena y contesta con memoria y con cifras del archivo. Voz, ritmo, tono y pausas a tu gusto.",
  alternates: { canonical: `${SITE_URL}/radio` },
  openGraph: {
    title: "Radio Vanguard",
    description:
      "Un programa editado con los cables reales del día, pausas que se oyen, subtítulos y una conversación con memoria.",
    url: `${SITE_URL}/radio`,
    siteName: "VANGUARD",
    type: "website",
    locale: "es_ES",
  },
};

export const dynamic = "force-static";
export const revalidate = 600;

/** Los nombres que se leen, no las claves internas («europa» → «Europa»). */
const NOMBRE_REGION: Record<string, string> = {
  europa: "Europa",
  oriente: "Oriente Medio",
  americas: "América",
  africa: "África",
  asia: "Asia",
  mundo: "el mundo",
};

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

  const ahora = Date.now();
  const e = estadisticas(notas, ahora);
  const regionTop = e.regiones[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    name: "Radio Vanguard",
    url: `${SITE_URL}/radio`,
    description:
      "Programa de voz generado en el aparato a partir de los cables reales del archivo de VANGUARD, con agrupación de noticias repetidas, selección con diversidad de región y fuente, y la fuente de cada bloque.",
  };

  return (
    <div className="vxr-pagina">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />

      <header className="vxr-pagina-cab">
        <p className="vxr-sello">
          VANGUARD · RADIO DE LA CASA · {e.cables} {e.cables === 1 ? "CABLE" : "CABLES"} · {e.asuntos}{" "}
          {e.asuntos === 1 ? "ASUNTO" : "ASUNTOS"} · {e.medios} {e.medios === 1 ? "MEDIO" : "MEDIOS"}
        </p>
        <h1>
          La casa, <em>en voz alta</em>
        </h1>
        <p className="vxr-lema">
          Un programa editado con los cables reales de hoy: primero las cifras del archivo, luego los titulares y cada
          asunto con su fuente y su hora. Los cables que cuentan lo mismo se agrupan —y se dice cuántos medios lo
          firman—, la selección no repite región ni medio si hay alternativa, y entre bloque y bloque hay silencio de
          verdad. Puedes pedirlo de 2 a 15 minutos, seguir la frase que suena en pantalla y preguntarle con
          seguimientos: <em>«cuéntame más», «la segunda», «¿y en África?»</em>.
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
        <RadioVanguard notas={notas} ahoraServidor={ahora} />
      </div>

      <section className="vxr-reglas" aria-labelledby="vxr-reglas-titulo">
        <h2 id="vxr-reglas-titulo">Cómo se elige lo que se cuenta</h2>
        <p className="vxr-reglas-sub">
          Estas cuatro reglas no son una promesa de folleto: son el código que decide el programa
          (<code>lib/radio/agrupar.ts</code> y <code>lib/radio/guion.ts</code>), y las cifras de esta página salen de
          ellas.
        </p>
        <ol className="vxr-reglas-lista">
          <li>
            <span aria-hidden>01</span>
            <div>
              <h3>No repite la misma noticia</h3>
              <p>
                Hoy {e.cables} {e.cables === 1 ? "cable cuenta" : "cables cuentan"} {e.asuntos}{" "}
                {e.asuntos === 1 ? "asunto" : "asuntos"}: {e.repetidos}{" "}
                {e.repetidos === 1 ? "cable repite" : "cables repiten"} lo que ya cuenta otro medio. Se comparan por
                palabras (Jaccard) y por frente y región; el asunto se cuenta una vez y se dice quién más lo firma.
              </p>
            </div>
          </li>
          <li>
            <span aria-hidden>02</span>
            <div>
              <h3>No es cuatro veces el mismo sitio</h3>
              <p>
                La selección pide diversidad de región y de medio antes de completar por relevancia (que se calcula con
                la antigüedad, la foto, el frente y el resumen de cada cable). Hoy la región con más cables es{" "}
                {regionTop ? `${NOMBRE_REGION[regionTop.region] ?? regionTop.region}, con ${regionTop.cables} cables` : "—"}
                , y por eso el programa no empieza y acaba ahí si hay otras.
              </p>
            </div>
          </li>
          <li>
            <span aria-hidden>03</span>
            <div>
              <h3>Dura lo que tú digas</h3>
              <p>
                2, 5, 10 o 15 minutos: el número de asuntos sale de esa duración, no de un número fijo, y la duración
                estimada se ve antes de darle al play. Los silencios cuentan en el cálculo (14 caracteres por segundo
                más la pausa declarada de cada bloque).
              </p>
            </div>
          </li>
          <li>
            <span aria-hidden>04</span>
            <div>
              <h3>No se inventa nada</h3>
              <p>
                Ni una cifra, ni un país, ni una fuente que no esté en el archivo. Si un tema no aparece, la radio lo
                dice: «no tengo un cable sobre eso». Si no hay cables, el programa es una sola frase honesta.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <footer className="vxr-pagina-pie">
        <p>
          Cómo funciona, sin adornos: el guion se arma en el servidor con los mismos cables que ves en{" "}
          <Link href="/">la portada</Link>; la voz, el ritmo y los silencios los pone tu aparato a través de su motor de
          habla, así que la calidad depende de las voces instaladas (cada una lleva su nota medida en la lista). No se
          envía audio a ningún sitio y no hay cuenta. Si tu aparato no puede hablar, el programa sigue entero en
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
