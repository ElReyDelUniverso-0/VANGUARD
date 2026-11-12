import type { Metadata } from "next";
import Link from "next/link";
import { VanguardMarkSvg } from "@/components/vanguard/vanguard-mark-svg";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { CentinelaPanel } from "@/components/vanguard/centinela-panel";
import { parteDelDia } from "@/lib/cronica";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "Tu Centinela — sigue lo que te importa | VANGUARD",
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
        <div className="border-b border-zinc-800 bg-zinc-900/60">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
            >
              <VanguardMarkSvg size={18} idPrefix="centinela-mark" />
              <span>VANGUARD</span>
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              {parte.version} · {parte.codename}
            </span>
          </div>
        </div>

        <article className="mx-auto max-w-3xl px-5 py-10">
          <h1 className="text-3xl font-bold text-zinc-100">Tu Centinela</h1>
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
