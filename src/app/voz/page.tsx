import { SITE_URL as SITE_URL_CASA } from "@/lib/site";
import type { Metadata } from "next";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { VozSala } from "@/components/vanguard/voz-sala";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { PERSONAS } from "@/lib/voz/decir";
import { TEATROS_SABER, CONCEPTOS_SABER } from "@/lib/agente/saber";
import { NAVEGACION } from "@/lib/agente/maestro";

// ============================================================
// v367.2 LA VOZ MAESTRA — /voz
//
// El Dueño, textual: «su voz… tiene una voz robótica, no tiene diferentes
// voces, una voz sin pausa, una voz molesta y lee sin sentido; tampoco
// explica las noticias, no navega, no te ayuda, no puede tener una
// conversación larga; necesito que sea experta en geopolítica, que explique
// navegando y dando ejemplos».
//
// Esta sala es la respuesta entera, en una página: cuatro personas con voz
// propia, boca que respira (frases con silencio real), texto limpiado para
// decir (no para leer código), un maestro que explica con estructura de
// analista sobre el archivo REAL, que navega a las salas de la casa y que
// sostiene la conversación con memoria de doce turnos.
//
// Server-rendered el marco; la voz vive en el aparato (cero audio enviado).
// ============================================================

const SITE_URL = SITE_URL_CASA; // v404.1: una sola fuente del dominio (@/lib/site)

export const metadata: Metadata = {
  title: "La Voz Maestra — la voz que explica la casa",
  description:
    "La voz de VANGUARD con cuatro personas, boca que respira y un maestro experto en geopolítica: explica los teatros con datos reales, da clase de conceptos, lee la crónica del día y navega la casa hablando.",
  alternates: { canonical: `${SITE_URL}/voz` },
};

const PUERTAS_DE_LA_VOZ: EnlaceContextual[] = [
  {
    etiqueta: "LA CRÓNICA DEL DÍA ▸",
    ruta: "/cronica",
    motivo: "lo que el maestro te cuenta de viva voz, fechado y con fuente",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL PULSO · EN VIVO ▸",
    ruta: "/en-vivo",
    motivo: "cuando el maestro diga «hay señal», aquí está el minuto a minuto",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "LA TORRE DE CONTROL ▸",
    ruta: "/torre",
    motivo: "la salud real del arranque: por qué la casa a veces tarda en despertar",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "EL CENSO DEL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "todas las salas a las que la voz puede llevarte, declaradas",
    tipoRelacion: "documenta",
  },
];

export default function VozPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "La Voz Maestra — VANGUARD",
    description:
      "Asistente de voz de VANGUARD: cuatro personas, respiración real, explicaciones de geopolítica con datos del archivo y navegación por la casa.",
    url: `${SITE_URL}/voz`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <main className="min-h-screen bg-zinc-950 text-zinc-200">
        {/* v402.2 — portada de sala: cifras del cerebro del Maestro */}
        <PortadaSala
          imagen="/ilustraciones/canales.jpg"
          alt="Operador con auriculares frente a pantallas de transmisión en la noche"
          volanta="Inteligencia · La voz"
          titulo="La Voz Maestra"
          sumario="Elige con quién hablas y pídele que te explique un frente, un concepto o el parte del día. Sigue hablando: se acuerda de lo último que te explicó."
          cifras={[
            { valor: Object.keys(PERSONAS).length, etiqueta: "Voces", nota: "con tono y ritmo propios" },
            { valor: Object.keys(TEATROS_SABER).length, etiqueta: "Frentes", nota: "explicados a fondo" },
            { valor: CONCEPTOS_SABER.length, etiqueta: "Conceptos", nota: "con su clase" },
            { valor: NAVEGACION.length, etiqueta: "Salas", nota: "a las que te lleva" },
          ]}
          acento="#38bdf8"
        />

        <article className="mx-auto max-w-3xl px-5 py-10">
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            La voz de la casa ya no es un portero de órdenes cortas. Elige con quién hablas — la
            locutora, el analista, el general o el cronista — y pídele que te explique un teatro,
            que te dé clase de un concepto, que te lea el parte del día o que te lleve a una sala.
            Y sigue hablando: se acuerda de lo último que te explicó.
          </p>

          <div className="mt-8">
            <VozSala />
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-amber-300">Por qué antes sonaba mal (sin excusas)</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-zinc-400">
              <li>
                <strong className="text-zinc-200">Leía sin sentido</strong> porque recibía texto de
                pantalla: viñetas, URLs, claves internas y porcentajes pegados. Ahora todo pasa por
                un limpiador de boca que convierte el texto de panel en texto hablado y no toca ni
                una cifra.
              </li>
              <li>
                <strong className="text-zinc-200">Sonaba sin pausa</strong> porque se lanzaba un
                párrafo entero de golpe. Ahora se trocea por frases y párrafos con silencios reales
                de 260 y 700 milisegundos.
              </li>
              <li>
                <strong className="text-zinc-200">No tenía voces distintas</strong> porque solo
                había un ajuste global. Ahora hay cuatro personas con velocidad, tono y voz
                preferida propias, y puedes forzar cualquiera de las voces instaladas.
              </li>
              <li>
                <strong className="text-zinc-200">Sonaba robótica</strong> porque el navegador
                elegía la primera voz del sistema. Ahora se puntúan todas y se elige la neuronal; y
                si tu aparato no tiene ninguna decente, esta sala te lo dice en la cara y te explica
                cómo instalar una mejor.
              </li>
              <li>
                <strong className="text-zinc-200">No explicaba ni navegaba</strong> porque su
                cerebro respondía en 220 caracteres y solo abría pestañas. Ahora responde con
                estructura de analista sobre el archivo real y conoce las rutas de la casa.
              </li>
            </ul>
          </section>

          <FuenteYFecha
            fuente="el archivo de cables de la casa (tabla NewsItem) · Web Speech del aparato"
            nota="Cada cifra que la voz pronuncia sale de una lectura real del archivo. El saber de fondo (teatros y conceptos) está escrito a mano y no contiene datos volátiles: no envejece ni se inventa. El audio nunca sale de tu aparato."
          />

          <section className="mt-10 pb-10">
            <EnlacesNucleo enlaces={PUERTAS_DE_LA_VOZ} titulo="CONECTA CON EL NÚCLEO" />
          </section>
        </article>
      </main>
    </>
  );
}
