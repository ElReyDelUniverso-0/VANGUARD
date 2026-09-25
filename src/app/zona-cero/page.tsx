import type { Metadata } from "next";
import Link from "next/link";
import { ZonaCeroSim } from "@/components/vanguard/zona-cero-sim";

// v52.0 ZONA CERO — la ciudad que cae en vivo. El espectáculo de guerra que
// ninguna página de conflictos ha mostrado: un teatro completo que se destruye
// en directo, con fusión de noticias reales (GDELT), director cinematográfico
// automático, sonido sintetizado y destrucción persistente entre visitas.

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "ZONA CERO — la ciudad que cae en vivo | VANGUARD",
  description:
    "Mira una ciudad caer en directo: soldados, tanques, jets y drones peleando sin parar sobre una ciudad que se destruye de verdad y recuerda cada visita. Las noticias reales de guerra disparan las operaciones. Gratis, en español, sin instalar nada.",
  alternates: { canonical: "/zona-cero" },
  openGraph: {
    title: "ZONA CERO — la ciudad que cae en vivo · VANGUARD",
    description:
      "Un teatro de guerra que nunca se repite: destrucción persistente, director cinematográfico y operaciones disparadas por noticias reales del mundo.",
    url: `${SITE_URL}/zona-cero`,
    images: ["/api/og"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Zona Cero — la ciudad que cae en vivo",
  description:
    "Simulación de guerra en vivo con destrucción persistente de una ciudad, fusión de despachos reales GDELT y director cinematográfico automático.",
  url: `${SITE_URL}/zona-cero`,
  isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
};

export default function ZonaCeroPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-red-500/30 bg-black/50 px-5 pt-7 pb-5 max-w-6xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.3em] text-red-400 uppercase">
          VANGUARD · Teatro de operaciones en directo
        </p>
        <h1 className="font-orbitron text-3xl sm:text-5xl font-black mt-2 tracking-wide">
          ZONA <span className="text-red-500">CERO</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-3xl">
          La ciudad que cae. Aquí la guerra no se lee: se ve. Un teatro completo
          donde la infantería avanza calle abajo, los tanques intercambian fuego
          de cañón, los jets silban a baja cota y los drones vigilan la ruina —
          y cada edificio que ves caer, se queda caído.
        </p>
      </header>

      <section className="max-w-6xl mx-auto px-3 sm:px-5 pt-6">
        <ZonaCeroSim />
      </section>

      <section className="max-w-6xl mx-auto px-5 py-8 grid md:grid-cols-3 gap-4">
        <article className="border border-zinc-800 rounded-md p-5 bg-zinc-900/40">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-amber-300">
            La ciudad recuerda
          </h2>
          <p className="mt-2 text-[13px] text-zinc-400 leading-relaxed">
            La destrucción de Zona Cero es persistente: cada cráter, cada edificio
            colapsado y cada baja queda registrado en tu navegador. Si vuelves
            mañana, la ciudad estará más destrozada de como la dejaste, porque la
            guerra siguió avanzando mientras estuviste fuera. Es la primera página
            de conflictos donde el tiempo real deja cicatrices: ningún visitante ve
            la misma ciudad que el anterior.
          </p>
        </article>
        <article className="border border-zinc-800 rounded-md p-5 bg-zinc-900/40">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-emerald-300">
            Lo real dispara lo simulado
          </h2>
          <p className="mt-2 text-[13px] text-zinc-400 leading-relaxed">
            El radar de despachos escanea en directo el proyecto GDELT, que
            monitorea unos 100.000 medios de todo el mundo. Cada titular real de
            bombardeo, ataque con drones o toma de artillería que entra por el
            canal se convierte en una operación dentro de la ciudad: una ofensiva
            real con obuses y jets sobre un sector concreto. Cuando el mundo hace
            ruido, aquí cae un edificio.
          </p>
        </article>
        <article className="border border-zinc-800 rounded-md p-5 bg-zinc-900/40">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-sky-300">
            Director cinematográfico
          </h2>
          <p className="mt-2 text-[13px] text-zinc-400 leading-relaxed">
            No miras una pantalla fija: un director automático persigue la acción
            más caliente, se acerca a los duelos de tanques, entra en cámara lenta
            cuando estalla un depósito y rótula la escena como un corresponsal de
            guerra. Prefieres el mando: toma la cámara arrastrando, haz zoom y
            activa el modo ataque para llamar fuego sobre cualquier manzana con un
            toque. El sonido de la artillería se sintetiza en tu navegador.
          </p>
        </article>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-4">
        <div className="border border-zinc-800 rounded-md p-5 bg-zinc-900/40">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-300">
            Cómo se ve una guerra — los cuatro niveles del espectáculo
          </h2>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[12px] text-zinc-400">
            <p className="border border-zinc-800 rounded p-3 leading-relaxed">
              <strong className="text-zinc-200">Infantería:</strong> soldados que
              avanzan cuadra a cuadra, se traban en tiroteos con trazadoras
              cruzadas y caen dejando su marca en el asfalto.
            </p>
            <p className="border border-zinc-800 rounded p-3 leading-relaxed">
              <strong className="text-zinc-200">Blindados:</strong> tanques que
              empujan la línea con retroceso de cañón, percutando casamatas hasta
              que la fachada cede piso a piso.
            </p>
            <p className="border border-zinc-800 rounded p-3 leading-relaxed">
              <strong className="text-zinc-200">Aire:</strong> jets a baja cota
              soltando bombas de caída libre, helicópteros de ataque con andanadas
              de cohetes y drones en órbita de vigilancia.
            </p>
            <p className="border border-zinc-800 rounded p-3 leading-relaxed">
              <strong className="text-zinc-200">La ciudad:</strong> ventanas que se
              apagan, incendios que se contagian de manzana en manzana, columnas de
              humo que el viento empuja, bengalas sobre las ruinas y cráteres que
              se acumulan noche tras noche.
            </p>
          </div>
          <p className="mt-3 font-mono text-[9px] text-zinc-600 leading-relaxed">
            Zona Cero es una simulación artística sobre un teatro ficticio (Eje del
            Norte contra Coalición Sur): no representa a ningún ejército real ni
            muestra imágenes reales de víctimas. Los despachos del panel sí son
            titulares reales enlazados a sus medios originales vía GDELT.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-14">
        <div className="border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent rounded-lg p-7 text-center">
          <h2 className="font-orbitron text-xl sm:text-2xl font-black tracking-wide text-amber-300">
            ¿VER LA GUERRA TE SABE A POCO?
          </h2>
          <p className="mt-2 text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            En VANGUARD la juegas: mapa 3D militar en vivo con los frentes reales,
            guerra global multijugador por rondas, simulador táctico jugable,
            apuestas de guerra y misiones diarias. Gratis, sin registro, desde el
            navegador del móvil.
          </p>
          <Link
            href="/"
            className="inline-block mt-5 bg-amber-400 hover:bg-amber-300 text-black font-black font-mono uppercase tracking-widest text-sm rounded px-8 py-3.5 transition-colors"
          >
            Entrar al mando ahora →
          </Link>
        </div>
      </section>
    </main>
  );
}
