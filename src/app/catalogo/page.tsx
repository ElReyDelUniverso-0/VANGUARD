import type { Metadata } from "next";
import Link from "next/link";
import { VanguardMarkSvg } from "@/components/vanguard/vanguard-mark-svg";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { TOTAL_REAL, cuentaPorTipo } from "@/lib/catalogo-real";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { PortadaSala } from "@/components/vanguard/portada-sala";
// v405.4 — las 184 piezas, en fichas.
import { FichasCatalogo } from "@/components/vanguard/fichas-catalogo";

// ============================================================
// v367.4 EL CATÁLOGO DE LO QUE YA EXISTE — /catalogo
//
// Orden del Dueño: «no crees nada nuevo ni nada desde cero; agrega 100
// cosas que YA ESTÁN CREADAS y Vanguard las necesita, y cópialas
// exactamente».
//
// Esto no es una idea: es un ÍNDICE. Las piezas que ya estaban construidas
// en la casa, generadas leyendo el árbol real del repositorio — cada una con
// su ruta navegable o su archivo de origen como prueba. No se inventó nada:
// el que quiera comprobarlo abre el archivo y ahí está.
//
// v367.5: el Dueño mandó «sigue agregando las 100 ideas, cópialas» — la lista
// pasó de 100 a 140 piezas (20 puntos de datos, 12 motores y 8 paneles más).
// v367.6: «sigue agregando copiando y agregando» — de 140 a 160 (10 puntos de
// datos, 6 motores, 3 paneles y la sala nueva /perfil).
// v367.8: +3 piezas del parque militar (el motor de activos y sus dos paneles).
// El número del título y del JSON-LD se calcula solo desde TOTAL_REAL: aquí no
// se escribe una cifra a mano.
// ============================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: `El catálogo de lo que ya existe — ${TOTAL_REAL} piezas`,
  description:
    `Índice real de ${TOTAL_REAL} piezas que ya están construidas en VANGUARD: salas navegables, paneles, motores y puntos de datos, cada una con su ruta o su archivo de origen.`,
  alternates: { canonical: `${SITE_URL}/catalogo` },
};

const PUERTAS: EnlaceContextual[] = [
  {
    etiqueta: "EL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "el censo oficial de módulos, entidades y búsqueda",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "LA MÚSICA CON FORMA ▸",
    ruta: "/musica",
    motivo: "la música real de la casa, con licencia y fuente",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "LA VOZ MAESTRA ▸",
    ruta: "/voz",
    motivo: "la que explica estas salas hablando",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "LA TORRE DE CONTROL ▸",
    ruta: "/torre",
    motivo: "la salud real del arranque",
    tipoRelacion: "documenta",
  },
];

export default function CatalogoPage() {
  const cuenta = cuentaPorTipo();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "El catálogo de lo que ya existe — VANGUARD",
    description: `Índice real de ${TOTAL_REAL} piezas ya construidas en VANGUARD, generado desde el árbol del repositorio.`,
    url: `${SITE_URL}/catalogo`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <PortadaSala
        imagen="/ilustraciones/salas.jpg"
        alt="Galería de salas de una casa antigua con puertas numeradas"
        volanta="LA CASA · EL CATÁLOGO"
        titulo="TODO LO QUE YA EXISTE"
        acento="#94a3b8"
        sumario="Cada sala, panel, motor y punto de datos construido en Vanguard, con el archivo del que sale como prueba: el índice de lo que hay, no de lo que se promete."
        cifras={[
          { valor: TOTAL_REAL, etiqueta: "piezas", nota: "reales" },
          { valor: cuentaPorTipo().sala, etiqueta: "salas", nota: "con su puerta" },
          { valor: cuentaPorTipo().panel, etiqueta: "paneles", nota: "construidos" },
          { valor: cuentaPorTipo().api, etiqueta: "puntos de datos", nota: "en pie" }
        ]}
        puntos={[
          { titulo: "CON PRUEBA", texto:
              "Cada pieza viaja con su archivo de origen: si el archivo no existe, la pieza no está en la lista." },
          { titulo: "SIN INVENTO", texto:
              "No es una hoja de ruta: es el inventario de lo que ya está construido y funcionando." },
          { titulo: "PARA QUÉ", texto:
              "Para encontrar lo que ya existe antes de construir otra cosa igual. El Dueño lo pidió así: «no crees nada nuevo, agrega lo que ya está creado»." }
        ]}
        nota="Portada y cifras servidas desde la propia casa: la ilustración viaja en el repositorio y cada número sale de la fuente de esta sala, calculado en el render. Cero cifras escritas a mano."
      />

      <main className="min-h-screen bg-zinc-950 text-zinc-200">
        <div className="border-b border-zinc-800 bg-zinc-900/60">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
            >
              <VanguardMarkSvg size={18} idPrefix="catalogo-mark" />
              <span>VANGUARD</span>
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              GENERADO DEL ÁRBOL REAL · CERO INVENTO
            </span>
          </div>
        </div>

        <article className="mx-auto max-w-4xl px-5 py-10">
          <h2 className="vx-h-sala text-3xl font-bold text-zinc-100">El catálogo de lo que ya existe</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            {TOTAL_REAL} piezas que ya estaban construidas en Vanguard, con su puerta o su archivo. No
            hay una sola idea nueva en esta lista: se generó leyendo el árbol del repositorio, y cada
            entrada lleva la prueba de dónde vive. La lista sigue creciendo por orden del Dueño
            («sigue agregando las 100 ideas, cópialas»): lo que entra ya existía.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
            <span className="rounded-sm border border-amber-500/40 px-2 py-1 text-amber-300">
              {cuenta.sala} salas
            </span>
            <span className="rounded-sm border border-zinc-700 px-2 py-1">{cuenta.panel} paneles</span>
            <span className="rounded-sm border border-zinc-700 px-2 py-1">{cuenta.motor} motores</span>
            <span className="rounded-sm border border-zinc-700 px-2 py-1">{cuenta.api} puntos de datos</span>
          </div>

          {/* v405.4 — LAS PIEZAS, EN FICHAS (pilar 2): nombre, tipo y ruta a la
              vista; el lema de cada pieza sigue entero, a un toque. Antes el
              índice eran 22.985 letras en 11 visuales: 2.090 por visual. */}
          <FichasCatalogo />

          <FuenteYFecha
            fuente="el árbol del repositorio (src/app, src/components/vanguard/panels, src/lib)"
            nota="Cada entrada se generó leyendo los archivos reales; las salas llevan su ruta navegable y el resto su archivo de origen. Si una pieza no existe en el árbol, no aparece en esta lista. Nada aquí está escrito a mano ni prometido a futuro."
          />

          <section className="mt-10 pb-10">
            <EnlacesNucleo enlaces={PUERTAS} titulo="CONECTA CON EL NÚCLEO" />
          </section>
        </article>
      </main>
    </>
  );
}
