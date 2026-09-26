import type { Metadata } from "next";
import Link from "next/link";
import FrenteTotalSim from "@/components/vanguard/frente-total-sim";
import { FRENTES } from "@/lib/frentes-data";

// v53.0 FRENTE TOTAL — /ver-guerra. Lo que pidió el comando: VER GUERRA de
// verdad. Nunca visto en una página de conflictos: un solo canvas donde los
// 10 frentes reales del planeta arden SIMULTÁNEAMENTE (soldados, tanques,
// jets, helicópteros, artillería, humo, cráteres), con teletipo de despachos
// reales (GDELT/Google Noticias vía /api/geo-tablero), aéreo militar REAL
// (adsb.lol) cruzando el cielo, director automático estilo canal de guerra
// 24h y fuego propio del operador. Complementa a /zona-cero (la ciudad que
// cae) con la escala planetaria.

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "FRENTE TOTAL — el planeta en guerra en directo | VANGUARD",
  description:
    "Mira los 10 frentes de guerra del planeta arder a la vez en un solo mapa en vivo: soldados, tanques y aviones peleando en directo, teletipo de noticias reales y aeronaves militares reales en el aire. Gratis, en español, sin instalar nada.",
  alternates: { canonical: "/ver-guerra" },
  openGraph: {
    title: "FRENTE TOTAL — el planeta en guerra en directo · VANGUARD",
    description:
      "Diez frentes ardiendo a la vez en un solo lienzo en vivo, disparados por titulares reales del mundo. Una página de conflictos como ninguna otra.",
    url: `${SITE_URL}/ver-guerra`,
    images: ["/api/og"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Frente Total — el planeta en guerra en directo",
  description:
    "Mural en vivo con los diez principales teatros de operación del mundo animados simultáneamente, fusión de despachos reales GDELT y aéreo militar ADS-B.",
  url: `${SITE_URL}/ver-guerra`,
  isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
};

const faqs = [
  {
    q: "¿Qué estoy viendo exactamente en Frente Total?",
    a: "Un mural en vivo donde cada franja es un teatro de operaciones real (Donbás, Gaza, Sudán, Sahel, Mar Rojo…). Dentro de cada franja pelean en animación continua soldados, tanques, jets y helicópteros con la intensidad pública estimada de ese frente. No es grabado ni video: se simula en tu navegador frame a frame y nunca se repite.",
  },
  {
    q: "¿Qué tiene de real si es una animación?",
    a: "Tres cosas son 100% reales: los despachos del teletipo (titulares de GDELT y Google Noticias sobre cada región), el aéreo militar (aeronaves militares ahora mismo en el aire según el rastro ADS-B público de adsb.lol, con sus matrículas verdaderas) y los datos de contexto de cada frente. Además, cada titular violento real dispara una operación dentro del mural: lo que pasa en el mundo se ve aquí.",
  },
  {
    q: "¿Puedo interactuar o solo mirar?",
    a: "Puedes hacer de todo: toca cualquier franja para entrar en su toma directa con ficha de frente y despachos de la región, toca el terreno dentro de una toma para llamar fuego de artillería, y si no tocas nada un director automático salta solo al frente más caliente como un canal de guerra 24 horas.",
  },
  {
    q: "¿Representa ejércitos o víctimas reales?",
    a: "No. La animación es artística y estilizada (sin sangre, sin imágenes reales de víctimas): los dos bandos de cada frente se representan con colores neutrales. Las cifras de bajas son estimaciones públicas de organizaciones de monitoreo y los titulares enlazan a sus medios originales.",
  },
];

export default function VerGuerraPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <header className="border-b border-red-500/30 bg-black/50 px-5 pt-7 pb-5 max-w-6xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.3em] text-red-400 uppercase">
          VANGUARD · Canal de guerra 24 horas
        </p>
        <h1 className="font-orbitron text-3xl sm:text-5xl font-black mt-2 tracking-wide">
          FRENTE <span className="text-red-500">TOTAL</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-3xl">
          El planeta entero en guerra en una sola pantalla. Diez frentes reales
          ardiendo al mismo tiempo — la estepa del Donbás, Gaza, el Mar Rojo,
          Sudán, el Sahel, Somalia, el este del Congo, Myanmar, Cachemira y
          Haití — cada uno con su propia batalla en vivo: infantería avanzando,
          duelos de tanques, jets que cruzan y bombardean, artillería que no
          calla nunca. Nadie lo había mostrado antes así.
        </p>
      </header>

      <section className="max-w-6xl mx-auto px-3 sm:px-5 pt-6">
        <FrenteTotalSim />
      </section>

      <section className="max-w-6xl mx-auto px-5 py-8 grid md:grid-cols-3 gap-4">
        <article className="border border-zinc-800 rounded-md p-5 bg-zinc-900/40">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-amber-300">
            Los 10 frentes a la vez
          </h2>
          <p className="mt-2 text-[13px] text-zinc-400 leading-relaxed">
            Otras páginas te enseñan un mapa con chinchetas. Frente Total te
            enseña la guerra entera: cada frente es un diorama que pelea solo,
            con terreno propio (estepa industrial, ciudad densa, dunas,
            selva, mar), su línea de contacto que late y cede, y su cadencia
            de fuego ajustada a la intensidad pública real de ese teatro.
            Desde lejos parece la Tierra de noche desde órbita: diez incendios
            que no se apagan.
          </p>
        </article>
        <article className="border border-zinc-800 rounded-md p-5 bg-zinc-900/40">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-emerald-300">
            El teletipo manda
          </h2>
          <p className="mt-2 text-[13px] text-zinc-400 leading-relaxed">
            Cada 40 segundos el canal escanea GDELT (proyecto abierto que
            monitorea ~100.000 medios) y Google Noticias por región. Cuando
            entra un titular real de bombardeo, ofensiva o ataque, el mural
            responde: una operación estalla en el frente correspondiente y el
            teletipo lo marca con un rayo. Si el mundo calla, el frente se
            calma. La simulación nunca desconecta de la realidad.
          </p>
        </article>
        <article className="border border-zinc-800 rounded-md p-5 bg-zinc-900/40">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-sky-300">
            Aéreo militar de verdad
          </h2>
          <p className="mt-2 text-[13px] text-zinc-400 leading-relaxed">
            Cruzando el cielo del mural vuelan aeronaves militares REALES que
            están en el aire ahora mismo, tomadas del rastro ADS-B público de
            adsb.lol con sus matrículas verdaderas (transportes C-17,
            reabastecedores, patrulleros…). El chip del HUD dice cuántas hay
            en este momento. Cuando tu jet simulado pase cerca, fíjate: el
            cielo no es de mentira del todo.
          </p>
        </article>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-2">
        <h2 className="font-orbitron text-xl sm:text-2xl font-black tracking-wide">
          LOS DIEZ TEATROS DE OPERACIÓN
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Contexto real de cada franja del mural: beligerantes, intensidad pública estimada y qué está pasando.
        </p>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FRENTES.map((f) => (
            <article key={f.id} className="border border-zinc-800 rounded-md p-4 bg-zinc-900/40">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-orbitron text-sm font-black text-white">{f.name}</h3>
                <span className="font-mono text-[10px] text-amber-300">I{f.intensity}</span>
              </div>
              <div className="mt-1.5 h-1 rounded bg-zinc-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-red-600" style={{ width: `${f.intensity}%` }} />
              </div>
              <p className="mt-2 text-[12px] text-zinc-300 font-mono">
                {f.sideA.name} <span className="text-red-400">vs</span> {f.sideB.name}
              </p>
              <p className="mt-1.5 text-[12px] text-zinc-400 leading-relaxed">{f.note}</p>
              <p className="mt-1.5 font-mono text-[9px] text-zinc-600">{f.casualties}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-8">
        <h2 className="font-orbitron text-xl sm:text-2xl font-black tracking-wide">
          PREGUNTAS FRECUENTES
        </h2>
        <div className="mt-4 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="border border-zinc-800 rounded-md bg-zinc-900/40 p-4">
              <summary className="cursor-pointer text-sm font-bold text-zinc-200">{f.q}</summary>
              <p className="mt-2 text-[13px] text-zinc-400 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 font-mono text-[9px] text-zinc-600 leading-relaxed">
          Frente Total es una simulación artística y estilizada: no representa
          a ningún ejército con fidelidad y no muestra imágenes reales de
          víctimas. Los bandos usan colores neutrales. Despachos: GDELT /
          Google Noticias (enlaces a medios originales). Aéreo: adsb.lol
          (ADS-B público). Cifras: estimaciones públicas de monitoreo. Si algo
          te incomoda, cierra la pestaña — esta página es voluntaria.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-14">
        <div className="border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent rounded-lg p-7 text-center">
          <h2 className="font-orbitron text-xl sm:text-2xl font-black tracking-wide text-amber-300">
            ¿QUIERES MÁS GUERRA? LA JUEGAS
          </h2>
          <p className="mt-2 text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            VANGUARD es el juego de guerra global en tiempo real: mapa 3D con
            los frentes reales, conquista por rondas, mercado de guerra,
            apuestas y misiones diarias. Y si quieres ver UNA ciudad caer
            piso por piso, entra a Zona Cero.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="bg-amber-400 hover:bg-amber-300 text-black font-black font-mono uppercase tracking-widest text-sm rounded px-8 py-3.5 transition-colors"
            >
              Entrar al mando →
            </Link>
            <Link
              href="/zona-cero"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-black font-mono uppercase tracking-widest text-sm rounded px-8 py-3.5 transition-colors"
            >
              Ver Zona Cero
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
