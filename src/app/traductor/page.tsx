import type { Metadata } from "next";
import Link from "next/link";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { BarraMundo } from "@/components/vanguard/barra-mundo";
import { IDIOMAS_VANGUARD } from "@/lib/idiomas";
import { TraductorEstudio } from "./traductor-estudio";

// v215.0 MODO TRADUCTOR — «un modo traductor en los idiomas de Vanguard».
// La puerta de los 8 idiomas de la casa: traduce cualquier texto con el
// núcleo de /api/traductor (IA + glosario táctico) y baja los últimos
// cables REALES de la sala EN VIVO para leerlos en tu lengua. El mundo
// entero sin salir de Vanguard — ni una barrera de idioma.

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "MODO TRADUCTOR — las noticias del mundo en tu idioma | VANGUARD",
  description:
    "El traductor de Vanguard: traduce cualquier texto o los últimos cables del planeta a los 8 idiomas de la casa — español, inglés, portugués, francés, alemán, italiano, chino y ruso. Gratis, al instante.",
  alternates: { canonical: `${SITE_URL}/traductor` },
  openGraph: {
    title: "MODO TRADUCTOR — el mundo en tu idioma · VANGUARD",
    description:
      "Traduce titulares y despachos de guerra a 8 idiomas al instante. Las noticias en vivo, sin barreras.",
    url: `${SITE_URL}/traductor`,
    siteName: "VANGUARD",
    type: "website",
  },
};

export default function TraductorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "MODO TRADUCTOR de VANGUARD",
    applicationCategory: "UtilitiesApplication",
    description:
      "Traductor geopolítico de Vanguard: textos y últimas noticias del mundo en 8 idiomas (es/en/pt/fr/de/it/zh/ru).",
    url: `${SITE_URL}/traductor`,
    inLanguage: "es",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />
      <main className="min-h-screen bg-zinc-950 text-zinc-200">
        <BarraMundo activa="traductor" />

        <header className="max-w-4xl mx-auto px-4 sm:px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wide text-soft">
              MODO TRADUCTOR <span className="text-sky-300">⇄</span>
            </h1>
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-sky-300 border border-sky-500/50 bg-sky-500/10 rounded px-2 py-0.5">
              Los idiomas de Vanguard
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-[13px] text-muted-foreground leading-relaxed">
            Un despacho en ruso, un comunicado en chino, un titular en inglés:
            nada se le escapa a un agente de Vanguard. Traduce cualquier texto
            con precisión de agencia — términos militares, diplomáticos y
            energéticos correctos — y baja los últimos cables reales del planeta
            para leerlos en tu lengua. {IDIOMAS_VANGUARD.map((i) => i.nombre).join(" · ")}.
          </p>
        </header>

        <section className="max-w-4xl mx-auto px-4 sm:px-5 pb-10">
          <TraductorEstudio />
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-5 pb-14 grid gap-3 sm:grid-cols-2">
          <Link
            href="/en-vivo"
            className="group border border-red-500/30 bg-zinc-900/40 rounded-md p-4 hover:border-red-400/70 transition-colors"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-red-300">
              EL PULSO ●
            </p>
            <p className="mt-1 font-display font-bold text-soft group-hover:text-red-200 transition-colors">
              La sala de última hora
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Cada cable del planeta con su hora, su fuente y su sello de exactitud.
            </p>
          </Link>
          <Link
            href="/mundo"
            className="group border border-amber-500/40 bg-zinc-900/40 rounded-md p-4 hover:border-amber-400/70 transition-colors"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300">
              MUNDO 3D ●
            </p>
            <p className="mt-1 font-display font-bold text-soft group-hover:text-amber-200 transition-colors">
              El planeta en vivo
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Las guerras de todo el mundo girando en un globo 3D con sus marcas y arcos.
            </p>
          </Link>
        </section>
      </main>
    </>
  );
}
