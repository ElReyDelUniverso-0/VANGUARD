import type { Metadata } from "next";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { CentroMapas } from "@/components/vanguard/centro-mapas";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { construirPayload, paisesDeAcontecimiento } from "@/lib/mapas-payload";

// ═══════════════════════════════════════════════════════════════════
// v405.9 · EL CENTRO DE MAPAS — la casa deja de tener «un mapa» y pasa a
// tener un sistema de mapas.
//
// LO QUE HABÍA: el planeta 3D de la casa (globe.gl + Natural Earth) sabía
// pintar 24 territorios de juego y poner marcadores. Una sola lectura.
//
// LO QUE HAY: el mismo planeta —no se ha tocado su motor, se le ha añadido el
// pintado por país— con OCHO capas conmutables, cada una con su dato real y su
// fuente citada: mundial (regiones ISO), político (bloques del Banco Mundial),
// físico (NASA), económico (gasto militar), demográfico (personal en servicio),
// temático (divisas), histórico (las guerras del archivo) y acontecimientos
// (los teatros vivos del núcleo, con sus países encendidos).
//
// Arquitectura: una capa es una DECLARACIÓN en src/lib/mapas-capas.ts. La
// novena capa no toca ni el globo ni esta página. Cero mapas falsos: toda capa
// que no tiene dato lo dice en su propia ficha.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "El Centro de Mapas · ocho capas del planeta, un solo globo",
  description:
    "Explorador geográfico de VANGUARD: mapa mundial, político, físico, económico, demográfico, temático, histórico y de acontecimientos sobre un globo 3D con datos reales del Banco Mundial, Natural Earth y el archivo de la casa.",
  alternates: { canonical: "/mapas" },
};

const PUERTAS: EnlaceContextual[] = [
  {
    // v436.5 — EL TALLER: la orden del Dueño de poder CREAR mapas dentro de la
    // casa. No es un mapa más: es el sitio donde un mapa se hace (punto, ficha,
    // fuente) y sale de aquí en GeoJSON, JSON o HTML autónomo.
    etiqueta: "EL TALLER DE MAPAS ▸",
    ruta: "/mapas/taller",
    motivo: "crear un mapa 2D o 3D con fichas y fuentes, verlo en plano o en globo y exportarlo",
    tipoRelacion: "pertenece_a",
  },
  {
    // v436.5 — EL ÍNDICE: todos los mapas de la casa en una lista, cada línea
    // con su ruta, su motor y su fuente. Sin mapas de relleno.
    etiqueta: "EL ÍNDICE DE MAPAS ▸",
    ruta: "/mapas/indice",
    motivo: "todas las superficies de mapa de la casa, una por una, y las que faltan por hacer",
    tipoRelacion: "pertenece_a",
  },
  {
    // v405.12 — EL MAPA DE LOS MUNDOS: el índice de países de la casa. Esta
    // sala pinta el planeta en 3D por capas; /mundos es su tabla de países
    // (ficha unificada, fronteras y puentes) en 2D sobre Natural Earth.
    etiqueta: "EL MAPA DE LOS MUNDOS ▸",
    ruta: "/mundos",
    motivo: "los 249 países con ficha, 177 con polígono y fronteras reales, y el registro de los quince mundos",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL MUNDO 3D ▸",
    ruta: "/mundo",
    motivo: "el globo de las guerras vivas: los mismos teatros que aquí se encienden por país",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL ATLAS ▸",
    ruta: "/atlas",
    motivo: "la ficha larga de cada país: capital, población, gobierno y superficie",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL PODER ▸",
    ruta: "/poder",
    motivo: "la captura del Banco Mundial que alimenta las capas económica y demográfica",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "LAS DIVISAS ▸",
    ruta: "/divisas",
    motivo: "las 247 monedas que dan color a la capa temática",
    tipoRelacion: "pertenece_a",
  },
];

export default function MapasPage() {
  const payload = construirPayload();
  const paisesPorAcontecimiento = paisesDeAcontecimiento();

  const capasCoropleta = payload.capas.filter((c) => c.tipo === "coropleta");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "El Centro de Mapas de VANGUARD",
    applicationCategory: "GeographyApplication",
    operatingSystem: "Web",
    inLanguage: "es",
    description:
      "Explorador geográfico con ocho capas sobre un globo 3D: mundial, político, físico, económico, demográfico, temático, histórico y de acontecimientos, con datos reales y fuentes citadas.",
    featureList: payload.capas.map((c) => `${c.nombre}: ${c.pregunta}`),
  };

  return (
    <>
      <main className="mx-auto max-w-[1408px] px-4 pb-16 pt-6 sm:px-6">
        <PortadaSala
          imagen="/imagenes-reales/satelite.jpg"
          alt="El planeta visto desde el espacio, con la luz del amanecer sobre el horizonte"
          volanta="LA CASA · GEOGRAFÍA"
          titulo="EL CENTRO DE MAPAS"
          nivel="h1"
          acento="#5eead4"
          sumario="Un solo planeta 3D y ocho formas de mirarlo: dónde está cada país, a qué bloque pertenece, cuánto gasta en armas, cuánta gente tiene en armas, qué moneda usa, qué guerras lo atravesaron y qué está pasando en él ahora mismo."
          cifras={[
            { valor: payload.capas.length, etiqueta: "capas", nota: "conmutables" },
            { valor: payload.totales.paises, etiqueta: "países", nota: "con identidad ISO" },
            { valor: payload.totales.guerras, etiqueta: "guerras", nota: "del archivo" },
            { valor: payload.totales.acontecimientos, etiqueta: "acontecimientos", nota: "vivos" },
          ]}
          puntos={[
            {
              titulo: "UNA SOLA MÁQUINA, OCHO LECTURAS",
              texto:
                "No hay ocho mapas duplicados: hay un globo, el de siempre, y un registro de capas. Añadir la novena es declarar una capa nueva.",
            },
            {
              titulo: "CERO MAPAS FALSOS",
              texto:
                "Cada capa declara su fuente: el Banco Mundial, Natural Earth, NASA o el archivo de la casa. La que no tiene dato para un país lo dice en vez de rellenar el hueco.",
            },
            {
              titulo: "DEL PAÍS A LA NOTICIA",
              texto:
                "Toca un país y verás sus cifras en todas las capas y los acontecimientos del núcleo que lo tocan, con su puerta para seguir leyendo.",
            },
          ]}
          nota="Se puede arrastrar, girar con la rueda, buscar un país por su nombre y volar hasta él. En móvil, el mismo globo con los mandos a mano."
        />

        <CentroMapas payload={payload} paisesPorAcontecimiento={paisesPorAcontecimiento} />

        {/* las capas con dato numérico, una por una, con su extremo real */}
        <section className="mt-10" aria-label="Las capas con dato medido">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">
            LAS CAPAS QUE MIDEN ALGO
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {capasCoropleta.map((c) => (
              <article key={c.id} className="rounded-sm border border-zinc-800 bg-zinc-900/40 p-3">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-200">{c.nombre}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{c.pregunta}</p>
                {c.escala && (
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-teal-300">
                    {`${c.escala.minTexto} → ${c.escala.maxTexto} · ${c.escala.unidad}`}
                  </p>
                )}
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-zinc-600">
                  {`${c.cobertura.conPoligono} de ${c.cobertura.conDato} países con polígono · ${c.fuente}`}
                </p>
              </article>
            ))}
          </div>
        </section>

        <FuenteYFecha
          fuente="Natural Earth 110m (polígonos e identidad ISO vía mledoze/countries) · Banco Mundial MS.MIL.XPND.CD y MS.MIL.TOTL.P1 (captura poder-data.ts) · open.er-api.com (world-data.ts) · game-data.ts HISTORICAL_WARS · núcleo de acontecimientos de la casa"
          nota="Ninguna capa inventa un dato: si una fuente no cubre un país, ese país queda sin color y su ficha lo dice. Las coordenadas de teatros y guerras son las ya documentadas en el repositorio, no estimaciones nuevas."
        />

        <section className="mt-10 pb-10">
          <EnlacesNucleo enlaces={PUERTAS} titulo="CONECTA CON EL NÚCLEO" />
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
    </>
  );
}
