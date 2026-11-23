import type { Metadata } from "next";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { CentinelaPanel } from "@/components/vanguard/centinela-panel";
import { parteDelDia } from "@/lib/cronica";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { PortadaSala } from "@/components/vanguard/portada-sala";

// ============================================================
// v367.1 EL OJO DEL DUEÑO — TU CENTINELA (/centinela)
//
// La sala del vínculo honesto: pones bajo vigilancia los teatros y los
// medios que te importan y la casa te dice, cada vez que entras, cuánto han
// hablado y cuándo fue su última señal. Ni una notificación falsa, ni un
// permiso del navegador, ni un «alguien acaba de comprar»: el aviso se lee
// aquí, con la fecha real del archivo.
//
// La página es server-rendered (el parte del día viaja ya calculado) y el
// panel cliente pone lo único que el servidor no puede saber: TU lista, que
// vive en tu aparato y no sale de él.
// ============================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard.vanguard-casa.workers.dev";

export const metadata: Metadata = {
  title: "Tu Centinela — sigue lo que te importa",
  description:
    "Pon bajo vigilancia teatros y medios reales: VANGUARD te cuenta cuánto han hablado en 24 horas y cuándo fue su última señal. Sin notificaciones falsas y sin salir de la casa.",
  alternates: { canonical: `${SITE_URL}/centinela` },
};

export const dynamic = "force-dynamic";

const PUERTAS_DEL_CENTINELA: EnlaceContextual[] = [
  {
    etiqueta: "LA CRÓNICA DEL DÍA ▸",
    ruta: "/cronica",
    motivo: "el parte completo de las últimas 24 h, del que esta sala te cuenta solo lo tuyo",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL PULSO · EN VIVO ▸",
    ruta: "/en-vivo",
    motivo: "cuando tu centinela avise, el pulso te da el minuto a minuto con fuente",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL CENSO DEL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "los teatros son entidades del núcleo: cada uno tiene su ficha con fuente",
    tipoRelacion: "documenta",
  },
];

export default async function CentinelaPage() {
  const parte = await parteDelDia();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Tu Centinela — VANGUARD",
    description:
      "Vigilancia personal de teatros y medios reales, con las cuentas y fechas del archivo de la casa.",
    url: `${SITE_URL}/centinela`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <main className="min-h-screen bg-zinc-950 text-zinc-200">
        {/* v402.2 — portada de sala: cifras del parte del día (cables vivos) */}
        <PortadaSala ruta="/centinela"
          imagen="/imagenes-reales/satelite.jpg"
          alt="Sala de vigilancia con un gran indicador circular sobre el mapa del mundo"
          volanta="Inteligencia · Centinela"
          titulo="Tu Centinela"
          sumario="Pon bajo vigilancia los frentes y los medios que te importan. Cada vez que entras te dice cuánto han hablado de verdad y cuándo fue su última señal."
          cifras={[
            { valor: parte.censo.teatros24, etiqueta: "Frentes con señal", nota: "últimas 24 h" },
            { valor: parte.censo.medios24, etiqueta: "Medios vigilables", nota: "firmaron en 24 h" },
            { valor: parte.censo.ultimas24, etiqueta: "Cables", nota: "últimas 24 h" },
          ]}
          acento="#38bdf8"
        />

        <article className="mx-auto max-w-3xl px-5 py-10">
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            La casa tiene un vigía desde v181, pero vigilaba la casa. Este es el tuyo: pones bajo
            vigilancia los teatros y los medios que te importan y, cada vez que entras, te dice
            cuánto han hablado de verdad y cuándo fue su última señal. Cero permisos de
            notificaciones, cero avisos inventados, cero enlaces que te saquen de Vanguard.
          </p>

          <div className="mt-8">
            <CentinelaPanel inicial={parte} />
          </div>

          <FuenteYFecha
            fuente="el archivo de cables de la casa (tabla NewsItem)"
            consultado={parte.consultadoEn}
            publicado={parte.masReciente?.publicado ?? null}
            nota="Las cuentas de esta sala son las mismas del parte del día: una sola lectura del archivo real, cero cifras escritas a mano."
          />

          <section className="mt-10 pb-10">
            <EnlacesNucleo enlaces={PUERTAS_DEL_CENTINELA} titulo="CONECTA CON EL NÚCLEO" />
          </section>
        </article>
      </main>
    </>
  );
}
