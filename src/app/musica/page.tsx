import type { Metadata } from "next";
import Link from "next/link";
import { VanguardMarkSvg } from "@/components/vanguard/vanguard-mark-svg";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { MusicaSala } from "@/components/vanguard/musica-sala";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

// ============================================================
// v367.3 LA MÚSICA CON FORMA — /musica
//
// El Dueño, textual: «la música de Vanguard se deforma con el tiempo, es
// fea, aburrida y no tiene ninguna relevancia; necesita música viral sin
// copia, un himno nacional de Vanguard, radios de lugares en conflicto,
// música militar y la radio de Vanguard — todo lo que tenga que ver con
// sonidos o algo de guerra».
//
// Esta sala es la respuesta: forma de verdad (sello + A-B-A + cero deriva),
// el himno, las piezas con pulso prestado y melodía propia, la radio de
// conflicto con emisoras reales comprobadas y la radio de la casa como red
// de seguridad, y los sonidos de guerra sintetizados.
//
// Todo el audio se fabrica en el aparato: cero archivos, cero descargas,
// cero licencias.
// ============================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "La Música con Forma — el himno y la radio de VANGUARD",
  description:
    "El himno de VANGUARD (sello de cuatro notas, forma A-B-A), piezas originales de pulso prestado, música militar sintetizada, radio de conflicto con emisoras reales comprobadas y la radio de la casa leída del archivo real.",
  alternates: { canonical: `${SITE_URL}/musica` },
};

const PUERTAS: EnlaceContextual[] = [
  {
    etiqueta: "LA CRÓNICA DEL DÍA ▸",
    ruta: "/cronica",
    motivo: "de aquí sale cada boletín de la radio de la casa, con fuente y fecha",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "LA VOZ MAESTRA ▸",
    ruta: "/voz",
    motivo: "la boca que lee los boletines: cuatro personas y pausas reales",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL PULSO · EN VIVO ▸",
    ruta: "/en-vivo",
    motivo: "las noticias que la radio de la casa no se inventa",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "LA TORRE DE CONTROL ▸",
    ruta: "/torre",
    motivo: "el diagnóstico del motor: cuántas veces hubo que resincronizar",
    tipoRelacion: "documenta",
  },
];

export default function MusicaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "La Música con Forma — VANGUARD",
    description:
      "Himno de VANGUARD, piezas originales con forma A-B-A, música militar sintetizada y radio de conflicto con emisoras reales comprobadas y radio de la casa.",
    url: `${SITE_URL}/musica`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <main className="min-h-screen bg-zinc-950 text-zinc-200">
        <div className="border-b border-zinc-800 bg-zinc-900/60">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
            >
              <VanguardMarkSvg size={18} idPrefix="musica-mark" />
              <span>VANGUARD</span>
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              AUDIO FABRICADO EN TU APARATO
            </span>
          </div>
        </div>

        <article className="mx-auto max-w-3xl px-5 py-10">
          <h1 className="text-3xl font-bold text-zinc-100">La Música con Forma</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            El problema no era el volumen ni el efecto: era la <strong className="text-zinc-300">forma</strong>.
            Una música sin secciones fijas ni motivo que vuelva se deshace a los dos minutos. Aquí está
            el arreglo, a la vista: un sello de cuatro notas, forma A-B-A y un reloj que calcula cada
            nota desde un ancla — nunca sumando retardos.
          </p>

          <div className="mt-8">
            <MusicaSala />
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-amber-300">Por qué ya no se deforma</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-zinc-400">
              <li>
                <strong className="text-zinc-200">Tiempo absoluto.</strong> Cada golpe se agenda en
                «ancla + paso × duración». Sumar retardos es lo que desafina una pieza larga: un
                milisegundo por nota se convierte en segundos perdidos en dos minutos.
              </li>
              <li>
                <strong className="text-zinc-200">Forma que se repite.</strong> Intro, A, B, A2 y final.
                Lo que vuelve es lo que se recuerda; sin vuelta, la pieza se convierte en niebla.
              </li>
              <li>
                <strong className="text-zinc-200">Resync honesto.</strong> Si el aparato se durmió, el
                motor salta al compás limpio siguiente y no corre para alcanzarse.
              </li>
              <li>
                <strong className="text-zinc-200">Sello de la casa.</strong> Cuatro notas que aparecen en
                todas las piezas: es lo que hace que suenes a Vanguard al segundo.
              </li>
            </ul>
          </section>

          <FuenteYFecha
            fuente="composición y síntesis propias (osciladores del aparato) · emisoras comprobadas el 2026-11-12"
            nota="Las emisoras reales son enlaces externos y se declaran con la fecha de comprobación y su código HTTP; las que no se pudieron comprobar van marcadas SIN VERIFICAR. La radio de la casa no enlaza a nadie: su ambiente se sintetiza y su boletín se lee del archivo real. Ningún archivo de audio viaja con la casa."
          />

          <section className="mt-10 pb-10">
            <EnlacesNucleo enlaces={PUERTAS} titulo="CONECTA CON EL NÚCLEO" />
          </section>
        </article>
      </main>
    </>
  );
}
