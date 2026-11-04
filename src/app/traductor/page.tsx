import type { Metadata } from "next";
import Link from "next/link";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { BarraMundo } from "@/components/vanguard/barra-mundo";
import { IDIOMAS_VANGUARD } from "@/lib/idiomas";
import { paresGlosario } from "@/lib/glosario-tactico";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { TraductorEstudio } from "./traductor-estudio";

// v215.0 MODO TRADUCTOR — «un modo traductor en los idiomas de Vanguard».
// La puerta de los 8 idiomas de la casa: traduce cualquier texto con el
// núcleo de /api/traductor (IA + glosario táctico) y baja los últimos
// cables REALES de la sala EN VIVO para leerlos en tu lengua. El mundo
// entero sin salir de Vanguard — ni una barrera de idioma.
//
// v236.0 EL GLOSARIO — el traductor muestra sus tuercas y abre sus
// cables. ① EL GLOSARIO TÁCTICO A LA VISTA: el inventario de emergencia
// (vía 3 de la API — si el núcleo IA se apaga, el traductor nunca
// calla) vivía enterrado en route.ts; ahora es fuente única en
// src/lib/glosario-tactico.ts y esta página lo renderiza COMPLETO con
// su conteo derivado — cero términos escritos a mano (patrón v233: la
// maquinaria editorial se muestra y se discute). ② LA PUERTA DEL
// CABLE: cada cable vivo del estudio abre SU sala /noticia/[id] — el
// id real viaja con el pulso (datos muertos → puertas). ③ CONECTA CON
// EL NÚCLEO (patrón v230/v233/v234/v235) + noscript.

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

// ── v236.0 EL GLOSARIO TÁCTICO — la fuente única, mostrada entera ──
const PARES_GLOSARIO = paresGlosario();

// ── v236.0 CONECTA CON EL NÚCLEO (patrón v230) — solo rutas reales ──
const ENLACES_NUCLEO: EnlaceContextual[] = [
  {
    etiqueta: "EL ARCHIVO DE CABLES ▸",
    ruta: "/nucleo?tipo=noticia",
    motivo: "la materia prima entera que el traductor trabaja",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "LA SALA DEL VÉRTIGO ▸",
    ruta: "/vertigo",
    motivo: "el flujo infinito de cables — la fuente que alimenta la traducción",
    tipoRelacion: "fuente_de",
  },
  {
    etiqueta: "LA BÚSQUEDA DEL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "busca el despacho original antes de traducirlo",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "PRIMERA PÁGINA ▸",
    ruta: "/guerra-hoy",
    motivo: "la guerra de hoy que da contexto a cada palabra",
    tipoRelacion: "pertenece_a",
  },
];

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

        {/* v236.0 EL GLOSARIO TÁCTICO — la maquinaria de emergencia a la vista */}
        <section
          aria-label="El glosario táctico"
          className="max-w-4xl mx-auto px-4 sm:px-5 pb-10"
        >
          <div className="border border-sky-500/30 rounded-md bg-zinc-900/40 p-4">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <p className="font-mono text-[10px] uppercase tracking-widest text-sky-300">
                El glosario táctico · lo que Vanguard nunca traduce mal
              </p>
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                {PARES_GLOSARIO.length} términos es ⇄ en
              </span>
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
              Si el núcleo de IA alguna vez queda sin conexión, el traductor no
              se queda mudo: sustituye este inventario geopolítico local y lo
              declara con su nota. No es un secreto — es el plan B, a la vista.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PARES_GLOSARIO.map(({ es, en }) => (
                <span
                  key={es}
                  className="font-mono text-[10px] rounded border border-zinc-700 bg-zinc-950/70 px-2 py-1 text-zinc-300"
                >
                  {`${es} ⇄ ${en}`}
                </span>
              ))}
            </div>
          </div>
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

        {/* v236.0 CONECTA CON EL NÚCLEO (patrón v230) */}
        <section className="max-w-4xl mx-auto px-4 sm:px-5 pb-14">
          <EnlacesNucleo enlaces={ENLACES_NUCLEO} titulo="CONECTA CON EL NÚCLEO" />
        </section>

        {/* v236.0 noscript — las puertas esenciales sin JS */}
        <noscript>
          <div className="border-t border-zinc-800 bg-zinc-900/80 px-5 py-8 text-center">
            <p className="font-mono text-[11px] uppercase tracking-widest text-sky-300">
              ◉ VANGUARD · MODO TRADUCTOR
            </p>
            <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
              El estudio de traducción necesita JavaScript. Las puertas de la
              casa siguen abiertas:
            </p>
            <p className="mt-3 flex flex-wrap justify-center gap-3 text-sm">
              <Link href="/en-vivo" className="text-sky-300 underline">
                LA SALA EN VIVO
              </Link>
              <Link href="/guerra-hoy" className="text-sky-300 underline">
                PRIMERA PÁGINA
              </Link>
              <Link href="/nucleo" className="text-sky-300 underline">
                LA BÚSQUEDA
              </Link>
            </p>
          </div>
        </noscript>
      </main>
    </>
  );
}
