import type { Metadata } from "next";
import Link from "next/link";
import { VanguardMarkSvg } from "@/components/vanguard/vanguard-mark-svg";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { COSAS_REALES, TOTAL_REAL, cuentaPorTipo, cosasPorTipo, type TipoCosa } from "@/lib/catalogo-real";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

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
// pasó de 100 a 140 piezas, todas archivos que ya existían (20 puntos de
// datos más, 12 motores más, 8 paneles más). El número del título se calcula
// solo desde TOTAL_REAL: aquí no se escribe una cifra a mano.
// ============================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: `El catálogo de lo que ya existe — ${TOTAL_REAL} piezas de VANGUARD`,
  description:
    `Índice real de ${TOTAL_REAL} piezas que ya están construidas en VANGUARD: salas navegables, paneles, motores y puntos de datos, cada una con su ruta o su archivo de origen.`,
  alternates: { canonical: `${SITE_URL}/catalogo` },
};

const TITULO_TIPO: Record<TipoCosa, string> = {
  sala: "SALAS NAVEGABLES",
  panel: "PANELES YA CONSTRUIDOS",
  motor: "MOTORES DE LA CASA",
  api: "PUNTOS DE DATOS",
};

const NOTA_TIPO: Record<TipoCosa, string> = {
  sala: "puertas que ya existen: se abren con un clic",
  panel: "piezas ya escritas que viven dentro de las salas",
  motor: "código de la casa que hace el trabajo pesado",
  api: "endpoints reales que sirven datos a la casa",
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
          <h1 className="text-3xl font-bold text-zinc-100">El catálogo de lo que ya existe</h1>
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

          {(["sala", "panel", "motor", "api"] as TipoCosa[]).map((tipo) => {
            const lista = cosasPorTipo(tipo);
            if (lista.length === 0) return null;
            return (
              <section key={tipo} className="mt-8">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300">
                  {TITULO_TIPO[tipo]} · {lista.length}
                </h2>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-600">
                  {NOTA_TIPO[tipo]}
                </p>
                <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {lista.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-sm border border-zinc-800 bg-zinc-900/40 px-2.5 py-1.5"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="min-w-0 truncate font-mono text-[10px] uppercase tracking-widest text-zinc-200">
                          {c.ruta && !c.ruta.includes("[") ? (
                            <Link href={c.ruta} className="hover:text-amber">
                              {c.nombre}
                            </Link>
                          ) : (
                            c.nombre
                          )}
                        </p>
                        <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                          {c.tipo}
                        </span>
                      </div>
                      <p className="truncate font-mono text-[8px] leading-relaxed text-zinc-600" title={c.archivo}>
                        {c.ruta ?? c.archivo}
                      </p>
                      {c.lema ? (
                        <p className="truncate font-mono text-[8px] text-zinc-700" title={c.lema}>
                          {c.lema}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}

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
