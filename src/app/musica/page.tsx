import type { Metadata } from "next";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { MusicStudio } from "@/components/vanguard/music-studio";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "Música y radios del mundo — VANGUARD",
  description: "Elige música real, marchas, ambiente, emisoras de radio de países del mundo o tus propios archivos privados. Reproducción continua opcional.",
  alternates: { canonical: `${SITE_URL}/musica` },
};

const PUERTAS: EnlaceContextual[] = [
  { etiqueta: "LA CRÓNICA DEL DÍA ▸", ruta: "/cronica", motivo: "boletines reales, con fuente y fecha", tipoRelacion: "pertenece_a" },
  { etiqueta: "EL PULSO · EN VIVO ▸", ruta: "/en-vivo", motivo: "noticias y fuentes en directo", tipoRelacion: "pertenece_a" },
  { etiqueta: "RADIO ▸", ruta: "/radio", motivo: "más formas de seguir las voces del mundo", tipoRelacion: "pertenece_a" },
];

export default function MusicaPage() {
  const jsonLd = {
    "@context": "https://schema.org", "@type": "WebPage", name: "Música y radios del mundo — VANGUARD",
    description: "Música real seleccionable, emisoras internacionales y reproducción de archivos de audio locales.",
    url: `${SITE_URL}/musica`, isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL }, inLanguage: "es",
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <main className="min-h-screen bg-[#07080c] text-zinc-100">
        <header className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(ellipse_at_82%_0%,rgba(220,164,78,.16),transparent_48%),linear-gradient(130deg,#11131a,#07080c)]">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
            <p className="text-[11px] font-semibold uppercase tracking-[.24em] text-amber-200/65">VANGUARD · SONIDO Y CULTURA</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Música, noticias y radios del mundo.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">Escoge una banda sonora, sintoniza emisoras de cualquier país o escucha tu propia música. Tú decides qué suena.</p>
          </div>
        </header>
        <article className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
          <MusicStudio />
          <aside className="mx-auto mt-5 max-w-4xl rounded-2xl border border-white/10 bg-white/[.025] p-4 text-xs leading-5 text-zinc-500">
            <strong className="text-zinc-300">Sobre el inicio automático:</strong> el navegador no permite que una página recién abierta emita sonido sin un toque previo. Por eso Vanguard empieza cuando eliges y pulsas una pista; con «Continuar» activado, la siguiente suena automáticamente al terminar. Tus archivos personales se leen localmente y no se cargan a nuestros servidores.
          </aside>
          <section className="mx-auto mt-10 max-w-4xl pb-6"><EnlacesNucleo enlaces={PUERTAS} titulo="SIGUE EXPLORANDO" /></section>
        </article>
      </main>
    </>
  );
}
