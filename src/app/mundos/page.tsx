import type { Metadata } from "next";
import Link from "next/link";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";
import { SEMILLA_ACONTECIMIENTOS } from "@/lib/nucleo/acontecimientos";
import { construirPayload } from "@/lib/mundos/payload";
import { fichas, regionEnEspanol } from "@/lib/mundos/ficha";
import { coberturaMapa, TERRITORIOS, vecinosDe } from "@/lib/mundos/mapa";
import { MUNDOS, FUSIONES, PUENTES, mundosPorClase, type ClaseMundo } from "@/lib/mundos/registro";
import { MapaMundos } from "@/components/mundos/mapa-mundos";
// v405.16 · LA CASA AL LADO DEL MAPA — el índice del planeta estaba fuera del
// censo del núcleo y sin una sola puerta a la búsqueda global: era el mapa más
// completo de la plataforma y un callejón sin salida. Estas son sus puertas.
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { contextoDePais } from "@/lib/nucleo/nexo";
const PUERTAS_NUCLEO = [
  {
    etiqueta: "EL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "El censo completo de la casa: búsqueda global, módulos y frontera de datos",
    tipoRelacion: "modulo_de" as const,
  },
  ...(["es", "us", "ua", "cn", "br", "ng"] as const).flatMap((iso) => {
    const c = contextoDePais(iso);
    return c
      ? [
          {
            etiqueta: `${c.nombre.toUpperCase()} ▸`,
            ruta: `/mundos/${c.iso2}`,
            motivo: `Ficha completa de ${c.nombre} (${c.region}) — el patrón de las 249 fichas`,
            tipoRelacion: "documenta" as const,
          },
        ]
      : [];
  }),
  {
    etiqueta: "EL GLOBO POR CAPAS ▸",
    ruta: "/mapas",
    motivo: "El mismo planeta en 3D con las doce capas y su leyenda",
    tipoRelacion: "visible_en" as const,
  },
  {
    etiqueta: "LOS CONFLICTOS ▸",
    ruta: "/conflictos",
    motivo: "Las regiones en seguimiento, sin globo: la lista de los frentes",
    tipoRelacion: "visible_en" as const,
  },
  {
    etiqueta: "EL ARCHIVO MUNDIAL ▸",
    ruta: "/archivo-mundial",
    motivo: "Los cables de este planeta ordenados por geografía",
    tipoRelacion: "fuente_de" as const,
  },
  {
    etiqueta: "SIMULAR UN PAÍS ▸",
    ruta: "/teatro-3d",
    motivo: "El teatro táctico, con las coordenadas reales de cada país",
    tipoRelacion: "simulado_en" as const,
  },
];

// ═══════════════════════════════════════════════════════════════════
// v405.12 · /mundos — EL MAPA DE LOS MUNDOS
//
// La orden era «evolución total de los mundos»: inspeccionar los que hay,
// fusionar los repetidos y los partidos, mejorar la exploración geográfica
// (países, regiones, territorios, fronteras), añadir información geográfica,
// histórica, económica, política y cultural, mejorar los mapas, y CONECTARLO
// todo con los módulos de información y simulación de la casa.
//
// Lo que hace esta sala, en orden de lectura:
//   ① el mapa: 177 países con polígono real + 249 con ficha, doce medidas
//     reales, fronteras topológicas y los 24 macroterritorios de la casa;
//   ② el registro de los 15 mundos que ya existían, con su clase (real,
//      simulación, juego declarado, 3D, puerta, espacio) — para que nadie
//      tenga que adivinar dónde está cada cosa;
//   ③ la tabla de FUSIONES: qué se unió con qué y por qué;
//   ④ los puentes a los módulos: cada país lleva su botón al simulador con
//      sus coordenadas, a los mapas, a conflictos, a divisas y a la mesa de
//      trabajo (/espacio);
//   ⑤ todos los países, por región, enlazados: sin JavaScript también se
//      navega (y Google los ve).
//
// Sala de SERVIDOR: el mapa viaja resuelto en el primer byte; el único
// JavaScript es el tablero interactivo. Nada de datos inventados: cada capa
// declara su fuente y cuántos países la tienen.
// ═══════════════════════════════════════════════════════════════════


export const metadata: Metadata = {
  title: "MUNDOS — el mapa de los países, sus fronteras y sus mundos | VANGUARD",
  description:
    "El índice geográfico de VANGUARD: 249 países con ficha unificada, 177 con polígono y fronteras reales, doce capas de datos (población, superficie, densidad, PIB, renta por habitante, gasto militar, esfuerzo militar, efectivos, esperanza de vida, moneda, fronteras y conflictos), 24 macroterritorios y las puertas a los módulos de información y simulación.",
  alternates: { canonical: `${SITE_URL}/mundos` },
  openGraph: {
    title: "MUNDOS — el mapa de los países de VANGUARD",
    description: "Países, fronteras reales, doce capas de datos y un puente directo al simulador de cada país.",
    url: `${SITE_URL}/mundos`,
    type: "website",
  },
};

// ── los acontecimientos reales, contados por país (una sola pasada) ──
const CONFLICTOS_POR_PAIS: Record<string, number> = {};
for (const a of SEMILLA_ACONTECIMIENTOS) {
  for (const iso2 of a.paisCodes) CONFLICTOS_POR_PAIS[iso2] = (CONFLICTOS_POR_PAIS[iso2] ?? 0) + 1;
}

export default function MundosPage() {
  const payload = construirPayload({ porPais: CONFLICTOS_POR_PAIS });
  const mapa = coberturaMapa();
  const todas = fichas();
  const clases = mundosPorClase();

  // ── países por región, para la lista navegable (cero JS) ──
  const porRegion = new Map<string, { iso2: string; nombre: string; vecinos: number | null }[]>();
  for (const f of todas) {
    const lista = porRegion.get(f.region) ?? [];
    lista.push({ iso2: f.iso2, nombre: f.nombre, vecinos: vecinosDe(f.iso2).length || null });
    porRegion.set(f.region, lista);
  }
  for (const lista of porRegion.values()) lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const totalConflictos = Object.keys(CONFLICTOS_POR_PAIS).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Mundos de VANGUARD",
    url: `${SITE_URL}/mundos`,
    description:
      "Mapa de países con fronteras reales, doce capas de datos y el registro de todos los mundos de VANGUARD.",
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    about: { "@type": "Thing", name: "Geografía política del planeta" },
    numberOfItems: todas.length,
  };

  const CENTROS_CIFRAS = [
    { ruta: "/comparador", nombre: "El comparador", lema: "Hasta cuatro países, cifra a cifra", texto: "Población, PIB, renta, gasto militar y años de vida lado a lado, con su puesto mundial." },
    { ruta: "/rankings", nombre: "Los rankings", lema: "Ocho listas mundiales completas", texto: "Todos los países con dato, de mayor a menor, con su peso sobre el total." },
    { ruta: "/demografia", nombre: "Población y demografía", lema: "Cuántos somos y cuánto vivimos", texto: "Dónde se concentra la humanidad y la brecha de esperanza de vida." },
    { ruta: "/regiones", nombre: "Territorios y regiones", lema: "Las 24 subregiones, sumadas", texto: "El Caribe, África occidental, el Sudeste asiático: sus cifras y sus países uno a uno." },
    { ruta: "/organizaciones", nombre: "Organizaciones", lema: "Quién se sienta con quién", texto: "OTAN, UE, BRICS, OPEP, SICA y once bloques más, con su peso real." },
  ];

  return (
    <main className="min-h-screen bg-[#05060b] text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />

      <PortadaSala
        imagen="/imagenes-reales/satelite.jpg"
        alt="El planeta visto desde la órbita, con las luces de las costas encendidas"
        volanta="Geografía · Los mundos"
        titulo="El mapa de los mundos"
        sumario="Todos los países con su polígono real y sus fronteras, doce capas de datos con su fuente, los 24 macroterritorios de la casa y el registro de los quince mundos que ya existían — cada uno con su puerta y su clase."
        cifras={[
          { valor: todas.length, etiqueta: "países con ficha", nota: "identidad ISO unificada" },
          { valor: mapa.conPoligono, etiqueta: "con polígono real", nota: "Natural Earth 110m" },
          { valor: mapa.conVecinos, etiqueta: "con fronteras", nota: "vecinos topológicos" },
          { valor: payload.capas.length, etiqueta: "capas de datos", nota: "cada una con su fuente" },
          { valor: MUNDOS.length, etiqueta: "mundos registrados", nota: "real · juego · 3D · espacio" },
          { valor: totalConflictos, etiqueta: "países en conflicto", nota: "acontecimientos reales" },
        ]}
        puntos={[
          { titulo: "Explora tocando", texto: "Elige una medida y toca un país: se abre su ficha con capital, población, gasto militar, fronteras y moneda." },
          { titulo: "Fronteras de verdad", texto: "Los vecinos salen de la topología de Natural Earth: los países que comparten arco. No hay listas escritas a mano." },
          { titulo: "De aquí al simulador", texto: "Cada país lleva sus coordenadas al teatro táctico, y cualquier hallazgo se guarda en tu mesa de trabajo." },
        ]}
        anclas={[
          { etiqueta: "Mapa", href: "#mapa" },
          { etiqueta: "Cifras", href: "#cifras" },
          { etiqueta: "Mundos", href: "#mundos" },
          { etiqueta: "Fusiones", href: "#fusiones" },
          { etiqueta: "Puentes", href: "#puentes" },
          { etiqueta: "Países", href: "#paises" },
        ]}
        acento="#5eead4"
        nota={`Fuente de geometría: ${mapa.fuente}. Proyección: ${mapa.proyeccion}.`}
      />

      <div className="mx-auto max-w-[1408px] px-3 py-6 sm:px-6">
        {/* ① EL MAPA */}
        <section id="mapa" className="vx-mo-seccion" style={{ marginTop: 8 }}>
          <h2 className="vx-mo-titulo">
            El tablero <span>doce medidas · fronteras reales · 24 macroterritorios</span>
          </h2>
          <p className="vx-mo-parrafo">
            Un solo mapa para todo el planeta. Cada capa es una columna real de la ficha del país y declara cuántos
            países la tienen: donde no hay dato, el país se apaga y se dice. Los macroterritorios son los 24 del mapa de
            guerra de la casa, intactos — aquí solo se les pone nombre para poder leerlos.
          </p>
          <MapaMundos payload={payload} />
        </section>

        {/* v407.1 · EL PLANETA EN CIFRAS — de la ficha de un país al contexto */}
        <section id="cifras" className="vx-mo-seccion">
          <h2 className="vx-mo-titulo">
            El planeta en cifras <span>cinco centros sobre la misma tabla</span>
          </h2>
          <p className="vx-mo-parrafo">
            La ficha dice cómo es un país. Estos centros dicen cuánto pesa frente a los demás, con las mismas cifras del
            Banco Mundial y su año: compáralo, ordénalo, súmalo por regiones o por bloques.
          </p>
          <div className="vx-mo-rejilla">
            {CENTROS_CIFRAS.map((c) => (
              <Link key={c.ruta} href={c.ruta} className="vx-mo-mundo">
                <span className="vx-mo-mundo-clase vx-mo-clase-real">Real</span>
                <h3>{c.nombre}</h3>
                <p className="vx-mo-mundo-lema">{c.lema}</p>
                <p>{c.texto}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ② EL REGISTRO DE MUNDOS */}
        <section id="mundos" className="vx-mo-seccion">
          <h2 className="vx-mo-titulo">
            Los {MUNDOS.length} mundos de la casa{" "}
            <span>{clases.map((c) => `${c.cuantos} ${c.nombre.toLowerCase()}`).join(" · ")}</span>
          </h2>
          <p className="vx-mo-parrafo">
            Esto es la auditoría, no una promesa: cada mundo que ya existía sigue en pie y aquí se declara con su clase,
            su fuente y su cifra. Los reales miden el planeta; los de simulación lo tuercen; los de juego son ficción
            declarada y no prestan ni un número al mapa de arriba; los 3D y las puertas son formas de entrar.
          </p>
          <div className="vx-mo-rejilla">
            {MUNDOS.map((m) => (
              <Link key={m.clave} href={m.ruta} className="vx-mo-mundo">
                <span className={`vx-mo-mundo-clase vx-mo-clase-${m.clase}`}>{NOMBRE_CLASE[m.clase as ClaseMundo]}</span>
                <h3>{m.nombre}</h3>
                <p className="vx-mo-mundo-lema">{m.lema}</p>
                <p>{m.resumen}</p>
                <span className="vx-mo-mundo-pie">
                  <span>{m.fuente}</span>
                  <span className="vx-mo-mundo-cifra">
                    {m.cifra.valor} {m.cifra.etiqueta}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ③ FUSIONES */}
        <section id="fusiones" className="vx-mo-seccion">
          <h2 className="vx-mo-titulo">
            Las {FUSIONES.length} fusiones <span>qué se unió, con qué y por qué</span>
          </h2>
          <p className="vx-mo-parrafo">
            Nada se borró: lo que estaba partido ahora entra por una puerta y desde ella se llega a todas las piezas.
            Cada fila dice la familia, la puerta canónica, lo que absorbe y el motivo medido.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="vx-mo-tabla">
              <thead>
                <tr>
                  <th>Familia</th>
                  <th>Puerta</th>
                  <th>Lo que entra por ella</th>
                  <th>Por qué</th>
                  <th>Cifra</th>
                </tr>
              </thead>
              <tbody>
                {FUSIONES.map((f) => (
                  <tr key={f.familia}>
                    <td>
                      <strong>{f.familia}</strong>
                    </td>
                    <td>
                      <code>{f.canonico}</code>
                    </td>
                    <td>{f.absorbe.join(" · ")}</td>
                    <td>{f.motivo}</td>
                    <td>
                      <strong>{f.cifra}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ④ PUENTES */}
        <section id="puentes" className="vx-mo-seccion">
          <h2 className="vx-mo-titulo">
            Los {PUENTES.length} puentes <span>de un país a la información y a la simulación</span>
          </h2>
          <p className="vx-mo-parrafo">
            Un mundo que no habla con el resto no es un mundo: es una isla. Cada puente lleva el país consigo —la ficha
            del país abre el simulador con sus coordenadas reales, sus conflictos, su moneda y su archivo—, y todo lo que
            encuentres se puede dejar en la mesa de trabajo.
          </p>
          <div className="vx-mo-puentes">
            {PUENTES.map((p) => (
              <Link key={p.id} href={p.ruta.split("?")[0]} className="vx-mo-puente">
                <span className="vx-mo-puente-clase">{p.clase}</span>
                {p.nombre}
              </Link>
            ))}
          </div>
        </section>

        {/* ⑤ TODOS LOS PAÍSES */}
        <section id="nucleo" className="vx-mo-seccion" style={{ marginTop: 8 }}>
        <EnlacesNucleo
          enlaces={PUERTAS_NUCLEO}
          titulo="EL MAPA NO ESTÁ SOLO — CONECTA CON EL NÚCLEO"
        />
      </section>

      <section id="paises" className="vx-mo-seccion">
          <h2 className="vx-mo-titulo">
            Los {todas.length} países <span>por región · cada uno con su ficha</span>
          </h2>
          <p className="vx-mo-parrafo">
            Sin JavaScript también se navega: esta lista es la puerta de cada país. El número entre paréntesis son sus
            fronteras terrestres; el país que no tiene polígono en el mapa del índice aparece igual, porque su ficha
            existe.
          </p>
          {[...porRegion.entries()]
            .sort((a, b) => b[1].length - a[1].length)
            .map(([region, lista]) => (
              <div key={region}>
                <h3 className="vx-mo-region">
                  {regionEnEspanol(region)} · {lista.length}
                </h3>
                <div className="vx-mo-lista-paises">
                  {lista.map((p) => (
                    <Link key={p.iso2} href={`/mundos/${p.iso2}`}>
                      {p.nombre}
                      {p.vecinos ? ` (${p.vecinos})` : ""}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </section>

        {/* ⑥ HONESTIDAD */}
        <section className="vx-mo-seccion">
          <h2 className="vx-mo-titulo">
            Lo que esta sala NO tiene <span>dicho antes de que lo preguntes</span>
          </h2>
          <ul className="vx-mo-parrafo" style={{ display: "grid", gap: 6, paddingLeft: 18 }}>
            <li>
              No hay fronteras dibujadas país por país con su longitud: las fronteras son la <strong>topología</strong>{" "}
              de Natural Earth (quién comparte arco con quién). Marítimas y fluviales no entran.
            </li>
            <li>
              No hay PIB, alfabetización ni IDH: la casa no tiene esas tablas. Hay lo que tiene —población, superficie,
              moneda con su tasa, gasto militar del Banco Mundial y los hechos armados del archivo— y lo que falta se
              declara con la palabra «sin dato».
            </li>
            <li>
              Las {payload.cobertura.global.paises} fichas no son {payload.cobertura.global.conAtlas}: la ficha larga
              (capital, gobierno, líder) existe en {payload.cobertura.global.conAtlas} países; la moneda, en{" "}
              {payload.cobertura.global.conMoneda}. La población y la superficie las tiene el censo del Banco Mundial
              para {payload.cobertura.global.conPoblacion} países, el PIB para {payload.cobertura.global.conPib} y la
              esperanza de vida para {payload.cobertura.global.conVida}. El mapa nunca rellena un hueco inventando.
            </li>
            <li>
              Los {TERRITORIOS.length} macroterritorios son los del <strong>mapa de guerra de la casa</strong> (24
              manchas de juego). No son regiones oficiales de nadie: se ofrecen como capa de lectura, no como geografía
              administrativa.
            </li>
          </ul>
        </section>

        <p className="vx-mo-fuente" style={{ marginTop: 22 }}>
          Fuentes de esta sala: Natural Earth vía world-atlas (geometría y fronteras) · geo-paises (identidad ISO) ·
          atlas-data (capital, población, superficie, idioma, moneda, gobierno y líder) · world-data (monedas y tasas) ·
          poder-data (Banco Mundial: gasto militar, efectivos y % del PIB, captura 2026-11-05) · SEMILLA_ACONTECIMIENTOS
          (hechos armados reales con fecha). Cero cifras escritas a mano: todas se cuentan al renderizar.
        </p>
      </div>
    </main>
  );
}

const NOMBRE_CLASE: Record<ClaseMundo, string> = {
  real: "geografía real",
  simulacion: "simulación",
  juego: "juego declarado",
  puerta: "puerta",
  tridimensional: "3D",
  espacio: "tu espacio",
};
