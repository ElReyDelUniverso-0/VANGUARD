import type { Metadata } from "next";
import Link from "next/link";
import { ZonaCeroTabs } from "@/components/vanguard/zona-cero-tabs";
import { ZonaCeroGeo } from "@/components/vanguard/zona-cero-geo";

// v54.0 ZONA CERO — TEATRO GLOBAL. Tres simuladores en una página:
// · TEATRO GLOBAL 3D (nuevo): mesa de guerra MUNDIAL a nivel de PAÍSES —
//   mapa-mundo tridimensional con los 5 teatros reales de conflicto pulsando
//   (Europa del Este, Medio Oriente, África, Asia-Pacífico, América Latina),
//   marcadores OTAN de infantería y blindados orbitando, fogonazos de
//   artillería, arcos de misiles y AERONAVES MILITARES REALES en vuelo
//   (ADS-B) sobre su posición geográfica verdadera. Titulares reales de
//   GDELT por teatro con enlace directo.
// · FRENTE TÁCTICO 3D: el simulador de trincheras ampliado v54 — morteros,
//   francotiradores, convoyes logísticos emboscados, APC con desembarco,
//   lanzamisiles MLRS con salvos y defensas antiaéreas que DERIBAN cazas,
//   helicópteros y drones con caída en llamas. Operaciones reales con 4
//   variantes: asalto aéreo con paracaidistas, ataque de misiles balísticos
//   con estela, asalto mecanizado y ofensiva total.
// · CIUDAD 2D CLÁSICA: el lienzo original de la ciudad que cae.

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "TEATRO GLOBAL 3D — mesa de guerra mundial con países, frentes y trincheras | VANGUARD",
  description:
    "El simulador de guerra completo: mesa 3D del mundo con los 5 teatros reales de conflicto, aeronaves militares reales en vuelo, marcadores de países y arcos de misiles; más el frente táctico 3D con trincheras, morteros, francotiradores, convoyes, paracaidistas y derribos antiaéreos. Gratis, en español, sin instalar nada.",
  alternates: { canonical: "/zona-cero" },
  openGraph: {
    title: "TEATRO GLOBAL 3D — la mesa de guerra mundial · VANGUARD",
    description:
      "Mira el mundo entero en guerra: teatros reales pulsando, aviones militares en vivo sobre el mapa y el frente táctico con trincheras, tanques y paracaidistas.",
    url: `${SITE_URL}/zona-cero`,
    images: ["/api/og"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Teatro Global 3D — mesa de guerra mundial con países, frentes y trincheras",
  description:
    "Mesa de guerra mundial tridimensional con los teatros de conflicto reales, aeronaves militares en vuelo y frente táctico 3D con trincheras, tanques, paracaidistas y antiaéreos. Fusión de despachos reales vía GDELT y ADS-B.",
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
          VANGUARD · Simulador de guerra en directo
        </p>
        <h1 className="font-orbitron text-3xl sm:text-5xl font-black mt-2 tracking-wide">
          TEATRO <span className="text-red-500">GLOBAL</span> <span className="text-amber-300">3D</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-3xl">
          El simulador completo de países en guerra: una mesa de operaciones
          mundial en 3D donde ves TODOS los frentes del planeta a la vez —
          Europa del Este, Medio Oriente, África, Asia-Pacífico y América
          Latina— con aeronaves militares reales cruzando el mapa en vivo. Y
          cuando quieras el detalle de trinchera: morteros, francotiradores,
          convoyes emboscados, paracaidistas, lanzamisiles y antiaéreos que
          derriban cazas en llamas. Todo en un navegador, gratis.
        </p>
      </header>

      <section className="max-w-6xl mx-auto px-3 sm:px-5 pt-6">
        <ZonaCeroTabs />
      </section>

      <section className="max-w-6xl mx-auto px-3 sm:px-5 pt-6">
        <ZonaCeroGeo />
      </section>

      <section className="max-w-6xl mx-auto px-5 py-8 grid md:grid-cols-3 gap-4">
        <article className="border border-zinc-800 rounded-md p-5 bg-zinc-900/40">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-amber-300">
            El mapa 3D recuerda
          </h2>
          <p className="mt-2 text-[13px] text-zinc-400 leading-relaxed">
            La guerra de Zona Cero 3D es persistente: la posición de cada frente,
            los edificios colapsados de la ciudad y hasta el número de cráteres
            quedan guardados en tu navegador. Si vuelves mañana, las trincheras
            estarán donde la batalla las dejó y la ciudad tendrá más cicatrices,
            porque los frentes siguieron peleando mientras estuviste fuera. Es el
            primer mapa de guerra que envejece con el tiempo real: ningún
            visitante ve el mismo campo de batalla que el anterior.
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
            Director de cámara 3D
          </h2>
          <p className="mt-2 text-[13px] text-zinc-400 leading-relaxed">
            Un director automático vuela la cámara entre los cuatro frentes como
            un corresponsal de guerra: se acerca a los duelos de tanques, ronda
            las trincheras cuando suena el asalto y sube a vista de águila para
            mostrar toda la línea del frente de una vez. ¿Prefieres el mando?
            Arrastra para mirar donde quieras, haz zoom con los dedos, salta a
            cualquier frente con su botón VER y activa el MODO ATAQUE para pedir
            fuego sobre cualquier coordenada del mapa con un toque.
          </p>
        </article>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-4">
        <div className="border border-zinc-800 rounded-md p-5 bg-zinc-900/40">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-300">
            Todo lo que hay en una guerra — los ocho niveles del simulador
          </h2>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[12px] text-zinc-400">
            <p className="border border-zinc-800 rounded p-3 leading-relaxed">
              <strong className="text-zinc-200">Países en guerra:</strong> el Eje
              del Norte y la Coalición Sur luchan con banderas propias en cada
              trinchera, uniformes de su color y una barra de control que marca
              quién gana terreno en cada frente.
            </p>
            <p className="border border-zinc-800 rounded p-3 leading-relaxed">
              <strong className="text-zinc-200">Trincheras y terreno:</strong> el
              mapa 3D tiene relieve, un río que hay que cruzar, carreteras de
              suministro y líneas defensivas zigzag con sacos terreros que se
              mueven cuando el frente avanza o retrocede.
            </p>
            <p className="border border-zinc-800 rounded p-3 leading-relaxed">
              <strong className="text-zinc-200">Infantería viva:</strong> soldados
              con casco y fusil que avanzan cuadra a cuadra, se traban en
              tiroteos de trazadoras cruzadas, caen y son relevados por la
              siguiente oleada.
            </p>
            <p className="border border-zinc-800 rounded p-3 leading-relaxed">
              <strong className="text-zinc-200">Blindados:</strong> tanques con
              torreta que gira buscando objetivo, retroceso de cañón y coraza
              que aguanta tres impactos antes de quedar como chatarra humeante.
            </p>
            <p className="border border-zinc-800 rounded p-3 leading-relaxed">
              <strong className="text-zinc-200">Aire:</strong> jets a baja cota
              soltando bombas, helicópteros con andanadas de cohetes, drones en
              órbita de vigilancia con bombardeo de precisión y baterías de
              artillería que martillean desde atrás con obuses que silban.
            </p>
            <p className="border border-zinc-800 rounded p-3 leading-relaxed">
              <strong className="text-zinc-200">La ciudad:</strong> ventanas que
              se apagan al primer impacto, incendios que se contagian, columnas
              de humo y colapso total al segundo. Los edificios caídos siguen en
              ruinas tu próxima visita.
            </p>
            <p className="border border-zinc-800 rounded p-3 leading-relaxed">
              <strong className="text-amber-300">Armas de apoyo v54:</strong>{" "}
              equipos de mortero que bombardean en arco, francotiradores
              emboscados que cazan a 40 metros, lanzamisiles MLRS que descargan
              salvas de cohetes con estela y convoyes logísticos que cruzan la
              carretera y pueden caer en una emboscada.
            </p>
            <p className="border border-zinc-800 rounded p-3 leading-relaxed">
              <strong className="text-amber-300">Cielo en disputa v54:</strong>{" "}
              cañones antiaéreos que siguen cada caza con sus tubos gemelos y
              los DERIBAN: cazas y helicópteros caen en barrena dejando humo
              hasta explotar contra el suelo, y los drones son abatidos en
              vuelo. Paracaidistas que saltan de un transporte y se suman al
              asalto al tocar tierra.
            </p>
            <p className="border border-emerald-700/50 rounded p-3 leading-relaxed">
              <strong className="text-emerald-300">Teatro global v54:</strong> la
              mesa de guerra MUNDIAL con los teatros reales del planeta
              pulsando, marcadores de países, arcos de misiles entre
              posiciones y aeronaves militares REALES en vuelo sobre su
              posición geográfica verdadera, con su matrícula. Toca un teatro
              y la cámara vuela hasta él con sus despachos reales.
            </p>
          </div>
          <p className="mt-3 font-mono text-[9px] text-zinc-600 leading-relaxed">
            Zona Cero es una simulación artística sobre un teatro ficticio (Eje
            del Norte contra Coalición Sur): no representa a ningún ejército real
            ni muestra imágenes reales de víctimas. Los despachos del radio y las
            operaciones marcadas como REALES sí provienen de titulares verificados
            enlazados a sus medios originales vía GDELT; las aeronaves del teatro
            global provienen del feed público ADS-B de adsb.lol.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-14">
        <div className="border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent rounded-lg p-7 text-center">
          <h2 className="font-orbitron text-xl sm:text-2xl font-black tracking-wide text-amber-300">
            ¿VER LA GUERRA TE SABE A POCO?
          </h2>
          <p className="mt-2 text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            En VANGUARD la juegas tú: mapa 3D militar en vivo con los frentes
            reales del mundo, guerra global multijugador por rondas, simulador
            táctico jugable, apuestas de guerra y misiones diarias. Gratis, sin
            registro, desde el navegador del móvil.
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
