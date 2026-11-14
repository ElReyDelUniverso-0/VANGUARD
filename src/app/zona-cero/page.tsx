import type { Metadata } from "next";
import Link from "next/link";
import { ZonaCeroTabs } from "@/components/vanguard/zona-cero-tabs";
// v367.8 EL PARQUE MILITAR — las unidades reales (CC0) que asedian la ciudad
import { ParqueMilitarCarga } from "@/components/vanguard/parque-militar-carga";
import { FACCCIONES_ORDEN } from "@/lib/3d/activos-militares";
import { ZonaCeroGeo } from "@/components/vanguard/zona-cero-geo";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
// v230.0 EL ESPEJO — la ficción muestra la guerra real que la alimenta:
// teatros documentados con cables reales de la agencia y fichas del
// acontecimiento, más las puertas honestas al núcleo.
import { db } from "@/lib/db";
import { TEATROS } from "@/lib/teatros";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import {
  slugAcontecimientoDeTeatro,
  idAcontecimiento,
} from "@/lib/nucleo/acontecimientos";
import { PortadaSala } from "@/components/vanguard/portada-sala";

// v230.0 EL ESPEJO — el conteo REAL por teatro (una sola query groupBy).
// v256.0 LA ÚLTIMA SEÑAL — la MISMA query también trae el momento del último
// cable de cada teatro (_max.publishedAt): el espejo deja de dar solo el
// número acumulado y dice CUÁNDO sonó la última vez. Sin BD la página vive
// igual: sin chips, sin fingir conteos (ley de la casa).
interface MedicionTeatro {
  conteo: number;
  ultima: Date | null;
}
async function conteosPorTeatro(): Promise<Record<string, MedicionTeatro> | null> {
  try {
    const filas = await db.newsItem.groupBy({
      by: ["conflictTag"],
      _count: { _all: true },
      _max: { publishedAt: true },
      where: { conflictTag: { in: Object.keys(TEATROS) } },
    });
    const mapa: Record<string, MedicionTeatro> = {};
    for (const f of filas)
      if (f.conflictTag)
        mapa[f.conflictTag] = { conteo: f._count._all, ultima: f._max.publishedAt };
    return mapa;
  } catch {
    return null;
  }
}

// v256.0 LA ÚLTIMA SEÑAL — la edad del último cable, derivada al vuelo de
// los milisegundos reales (la página es force-dynamic: cada visita la
// recalcula). Cero fechas escritas a mano — la guardia v234 sigue pasando.
function textoEdad(ms: number): string {
  const minutos = Math.floor(ms / 60000);
  if (minutos < 60) return "hace minutos";
  const horas = Math.floor(minutos / 60);
  if (horas < 48) return `hace ${horas} h`;
  return `hace ${Math.floor(horas / 24)} días`;
}

// v256.0 — la hora exacta de la última señal, formateada con el aparato
// (mismo patrón que el refugio v251): derivada del dato real, nunca a mano.
function horaExacta(d: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export const dynamic = "force-dynamic";

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
    "El simulador de guerra completo: mesa 3D del mundo con los 5 teatros reales de conflicto y la hora de su última señal real, aeronaves militares reales en vuelo, marcadores de países y arcos de misiles; más el frente táctico 3D con trincheras, morteros, francotiradores, convoyes, paracaidistas y derribos antiaéreos. Gratis, en español, sin instalar nada.",
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

export default async function ZonaCeroPage() {
  // v230.0 EL ESPEJO — los conteos reales llegan del archivo; si la BD no
  // responde, la sección se declara ausente en lugar de fingir datos.
  const conteos = await conteosPorTeatro();
  const totalReal = conteos
    ? Object.keys(TEATROS).reduce((acc, t) => acc + (conteos[t]?.conteo ?? 0), 0)
    : null;
  // v256.0 LA ÚLTIMA SEÑAL — la señal más fresca de todos los teatros,
  // derivada de las mediciones ya hechas: cero consultas extra.
  const fresca = (() => {
    if (!conteos) return null;
    const ahora = Date.now();
    let mejor: { tag: string; edad: number } | null = null;
    for (const [tag, m] of Object.entries(conteos)) {
      if (!m.ultima) continue;
      const edad = ahora - m.ultima.getTime();
      if (!mejor || edad < mejor.edad) mejor = { tag, edad };
    }
    return mejor;
  })();
  return (
    <>
    <PortadaSala
      imagen="/ilustraciones/crisis.jpg"
      alt="Sala de crisis con mapas colgados y mesas de operaciones"
      volanta="LA CASA · ZONA CERO"
      titulo="EL TEATRO GLOBAL"
      nivel="p"
      acento="#ef4444"
      sumario="El simulador de guerra en directo: los teatros reales, los cables verificados de cada uno y las unidades del asedio en 3D."
      cifras={[
          { valor: Object.keys(TEATROS).length, etiqueta: "teatros", nota: "documentados" },
          { valor: totalReal ?? 0, etiqueta: "cables", nota: "verificados" },
          { valor: FACCCIONES_ORDEN.length, etiqueta: "uniformes", nota: "militares" }
      ]}
      puntos={[
          { titulo: "UN TEATRO, UN CABLE", texto:
              "Cada teatro se alimenta de los cables reales del archivo: la simulación no inventa el parte de guerra, lo recibe." },
          { titulo: "EL MAPA Y LAS UNIDADES", texto:
              "El teatro 3D, los modelos militares y el geovisor: la misma verdad desde tres alturas." },
          { titulo: "SI FALTA UN DATO", texto:
              "Se declara el hueco en vez de rellenarlo. Un teatro sin cables no se decora: se dice que está a oscuras." }
      ]}
      nota="Portada y cifras servidas desde la propia casa: la ilustración viaja en el repositorio y cada número sale de la fuente de esta sala, calculado en el render. Cero cifras escritas a mano."
    />

    <main className="min-h-screen bg-[#0A0A0F] text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
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

      {/* v230.0 EL ESPEJO — la ficción muestra la guerra real que la alimenta.
          Los teatros salen del catálogo documentado (TEATROS, cero nombres a
          mano), el conteo es REAL de la BD y las fechas históricas viven en el
          registro de acontecimientos (v219) — nunca escritas a mano aquí. */}
      {/* v367.8 LAS UNIDADES DEL ASEDIO — los modelos 3D que ya existían
          (Quaternius, CC0 1.0), copiados a la casa sin retocar la malla, con el
          uniforme del bando encima. Orden del Dueño: «no crees nada nuevo, solo
          copia los mejores que ya existen 3D y pégalos a Vanguard». */}
      <section className="max-w-6xl mx-auto px-5 py-8" aria-label="Las unidades del asedio">
        <h2 className="font-orbitron text-xl sm:text-2xl font-black tracking-wide">LAS UNIDADES DEL ASEDIO</h2>
        <p className="mt-2 max-w-3xl text-[13px] text-zinc-400 leading-relaxed">
          Esto no está modelado por Vanguard: son piezas 3D que ya existían,
          publicadas como CC0 1.0 (dominio público) y copiadas tal cual. Lo único
          que cambia la casa es el color del uniforme de cada bando.
        </p>
        <div className="mt-3">
          <ParqueMilitarCarga alto={380} compacto />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-8">
        <h2 className="font-orbitron text-xl sm:text-2xl font-black tracking-wide">
          LA GUERRA REAL DETRÁS DEL ESPEJO
        </h2>
        <p className="mt-1 text-sm text-zinc-500 leading-relaxed max-w-3xl">
          El lienzo simula una guerra ficticia (Eje del Norte contra Coalición
          Sur), pero el radar que la alimenta escanea el mundo REAL. Estos son
          los teatros documentados por la agencia ahora mismo, con sus cables
          verificados — la ficción es el espejo, esto es lo que refleja.
        </p>
        {conteos ? (
          <>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
              {totalReal} cables verificados en {Object.keys(TEATROS).length} teatros documentados
            </p>
            {fresca && (() => {
              const linea = `la señal más fresca del archivo: ${TEATROS[fresca.tag]?.nombre ?? fresca.tag} — última señal ${textoEdad(fresca.edad)}`;
              return (
                <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                  {linea}
                </p>
              );
            })()}
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(TEATROS).map(([tag, t]) => {
                const medicion = conteos[tag];
                const n = medicion?.conteo;
                const slug = slugAcontecimientoDeTeatro(tag);
                // v256.0 LA ÚLTIMA SEÑAL — la edad del último cable del teatro,
                // derivada al vuelo; sin cable no hay línea (vacío honesto).
                const ultima = medicion?.ultima ?? null;
                const edad = ultima ? Date.now() - ultima.getTime() : null;
                return (
                  <article key={tag} className="border border-zinc-800 rounded-md p-4 bg-zinc-900/40">
                    <h3 className="font-orbitron text-sm font-black text-white">{t.nombre}</h3>
                    <p className="mt-1.5 text-[12px] text-zinc-400 leading-relaxed">{t.resumen}</p>
                    {ultima && edad !== null && (() => {
                      const linea = `● última señal ${textoEdad(edad)}`;
                      return (
                        <p
                          title={`Último cable de este teatro: ${horaExacta(ultima)}`}
                          className={`mt-2 font-mono text-[10px] uppercase tracking-widest ${edad < 48 * 3_600_000 ? "text-amber-300" : "text-zinc-500"}`}
                        >
                          {linea}
                        </p>
                      );
                    })()}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {typeof n === "number" && n > 0 && (
                        <Link
                          href={`/conflicto/${tag}`}
                          title={`${n} cables reales de este teatro en la agencia de Vanguard, con su fuente y su sello de exactitud`}
                          className="font-mono text-[10px] uppercase tracking-widest border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 rounded px-2 py-1 transition-colors"
                        >
                          {n} cables en la agencia ▸
                        </Link>
                      )}
                      {slug && (
                        <Link
                          href={`/nucleo?id=${encodeURIComponent(idAcontecimiento(slug))}`}
                          title="El hecho real que reúne los cables de este teatro, con su fecha histórica pública y su cronología"
                          className="font-mono text-[10px] uppercase tracking-widest border border-zinc-700 text-zinc-300 hover:border-sky-400/50 hover:text-sky-300 rounded px-2 py-1 transition-colors"
                        >
                          EL ACONTECIMIENTO ▸
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-zinc-600 leading-relaxed">
            El archivo no responde en este momento — la casa no finge conteos: sin datos reales, sin chips.
          </p>
        )}
      </section>

      {/* v230.0 EL ESPEJO — la sala conecta explícitamente con el núcleo */}
      <section className="max-w-6xl mx-auto px-5 pb-4">
        <EnlacesNucleo
          titulo="CONECTA CON EL NÚCLEO"
          enlaces={[
            {
              etiqueta: "EL FRENTE TOTAL ▸",
              ruta: "/ver-guerra",
              motivo: "El mural donde los 10 frentes del planeta arden a la vez, disparados por titulares reales",
              tipoRelacion: "visible_en",
            },
            {
              etiqueta: "EL MUNDO 3D ▸",
              ruta: "/mundo",
              motivo: "El planeta girando con los teatros de guerra documentados y su tensión del día",
              tipoRelacion: "visible_en",
            },
            {
              etiqueta: "LA BÚSQUEDA DEL NÚCLEO ▸",
              ruta: "/nucleo",
              motivo: "Todo el archivo público de la casa, con filtros por tipo de entidad",
              tipoRelacion: "pertenece_a",
            },
            {
              etiqueta: "LOS ESCENARIOS ▸",
              ruta: "/escenarios",
              motivo: "El escenario del planeta con las piezas separadas — datos, supuestos, variables y reglas: nunca predicción",
              tipoRelacion: "simulado_en",
            },
          ]}
        />
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
            global provienen del feed público ADS-B de adsb.lol; los conteos de
            cables de la sección LA GUERRA REAL son del archivo verificado de la
            propia agencia.
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
    </>
  );
}
