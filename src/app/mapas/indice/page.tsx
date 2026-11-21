import type { Metadata } from "next";
import Link from "next/link";
import { ListaMapas } from "@/components/mapas/lista-mapas";
import {
  CAPAS_DEL_CENTRO,
  CAPAS_TACTICAS,
  MAPAS,
  TOTAL_SUPERFICIES,
} from "@/lib/mapas/indice";

// ═══════════════════════════════════════════════════════════════════
// v436.5 · /mapas/indice — el mapa de los mapas
//
// Orden del Dueño: «reúne los cien mapas de todo el mundo… Vanguard Maps
// infinitos, deja las puertas abiertas a que entre producto».
//
// Lo que esta sala es: el índice de TODA la superficie de mapa que la casa
// tiene de verdad. Cada línea dice su ruta, lo que responde, con qué motor se
// pinta y de qué fuente sale el dato, y cada línea se puede abrir.
//
// Lo que esta sala NO es: un catálogo de mapas inventados para llegar a cien.
// Se cuenta lo que hay —las superficies declaradas, las capas del Centro de
// Mapas y las clases de trazo que el motor ya sabe pintar— y se dice el número
// que sale. Lo infinito no es el catálogo: es el taller, donde cada mapa nuevo
// entra como un documento sin tocar ni el globo ni el índice.
// ═══════════════════════════════════════════════════════════════════

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "El índice de mapas — todas las superficies de mapa de VANGUARD, una por una",
  description:
    "El mapa de los mapas de VANGUARD: el Centro de Mapas y sus ocho capas, el globo de guerras, los países, el atlas, el poder, las divisas, la Tierra, los cinco mundos, la infraestructura, las lenguas, el teatro 3D, Zona Cero, los escenarios, los conflictos, la historia, el cruce y el Taller de Mapas — cada uno con su ruta, su motor y su fuente.",
  alternates: { canonical: `${SITE_URL}/mapas/indice` },
  openGraph: {
    title: "El índice de mapas — VANGUARD",
    description:
      "Toda la superficie de mapa de la casa en una lista: ruta, pregunta, motor y fuente de cada una.",
    url: `${SITE_URL}/mapas/indice`,
    siteName: "VANGUARD",
    type: "website",
  },
};

const ACENTO = "#FF9F45";
const VERDE = "#4ADE80";

export default function PaginaIndiceMapas() {
  return (
    <main className="mx-auto w-full max-w-[1500px] px-3 py-6 sm:px-5">
      <header className="mb-5 border-b border-slate-800 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.34em]" style={{ color: ACENTO }}>
          Índice · {TOTAL_SUPERFICIES} superficies declaradas
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
          El índice de mapas
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
          Todos los mapas que la casa tiene, uno por uno: su ruta, la pregunta que responde, con qué
          se pinta y de qué fuente sale cada cifra. No hay relleno — lo que no está, no existe
          todavía. Y lo que falte se puede hacer abajo, en el taller.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/mapas/taller"
            className="rounded border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em]"
            style={{ borderColor: ACENTO, color: ACENTO, background: "#1a1206" }}
          >
            Abrir el Taller de Mapas ▸
          </Link>
          <Link
            href="/mapas"
            className="rounded border border-slate-800 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-300 hover:border-slate-600"
          >
            Centro de Mapas
          </Link>
          <Link
            href="/mundos"
            className="rounded border border-slate-800 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-300 hover:border-slate-600"
          >
            Los países
          </Link>
        </div>
      </header>

      <ListaMapas mapas={MAPAS} />

      <section className="mt-8">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: VERDE }}>
          Las ocho capas del Centro de Mapas
        </h2>
        <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-slate-500">
          Cada capa es una declaración en <code className="text-slate-400">src/lib/mapas-capas.ts</code>:
          la novena no toca ni el globo ni la sala. Se conmutan sobre el mismo planeta en{" "}
          <Link href="/mapas" className="underline" style={{ color: ACENTO }}>
            /mapas
          </Link>
          .
        </p>
        <ul className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {CAPAS_DEL_CENTRO.map((c, i) => (
            <li key={c.id} className="rounded border border-slate-800 bg-slate-950/60 p-3">
              <p className="font-mono text-[10px] tracking-[0.16em] text-slate-500">
                CAPA {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{c.nombre}</p>
              <p className="mt-1 text-[11px] leading-snug text-slate-400">{c.pregunta}</p>
              <p className="mt-2 border-t border-slate-800 pt-2 text-[10px] leading-snug text-slate-500">
                {c.fuente}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: VERDE }}>
          Las seis clases de trazo que el planeta ya sabe pintar
        </h2>
        <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-slate-500">
          El motor de la casa no solo pinta países: sabe poner bases, rutas de energía, zonas de
          exclusión, bloqueos, manchas de población y rutas de suministro. El taller usa las mismas
          clases, así que un punto tuyo habla el idioma del resto de la casa.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {CAPAS_TACTICAS.map((t) => (
            <li
              key={t.id}
              className="rounded border border-slate-800 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-300"
            >
              <span className="font-mono text-[10px]" style={{ color: ACENTO }}>
                {t.nombre.toUpperCase()}
              </span>{" "}
              <span className="text-slate-500">{t.queEs}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: ACENTO }}>
          Por qué este índice no llega a cien
        </h2>
        <p className="mt-2 max-w-4xl text-[13px] leading-relaxed text-slate-400">
          Porque una casa que dice tener cien mapas cuando tiene {MAPAS.length} está mintiendo, y esa
          es la única cosa que aquí no se hace. Este índice cuenta lo que hay:{" "}
          <strong className="text-slate-200">{MAPAS.length} salas con mapa</strong>,{" "}
          <strong className="text-slate-200">{CAPAS_DEL_CENTRO.length} capas</strong> y{" "}
          <strong className="text-slate-200">{CAPAS_TACTICAS.length} clases de trazo</strong>, es
          decir <strong className="text-slate-200">{TOTAL_SUPERFICIES} superficies</strong>. Los
          mapas que faltan hasta cien no se inventan: se hacen. Cada uno que se haga en el taller se
          abre aquí mismo y se puede publicar en{" "}
          <Link href="/creadores/publicar" className="underline" style={{ color: ACENTO }}>
            La Forja
          </Link>
          . Ahí es donde la puerta queda abierta y el número sube solo.
        </p>
      </section>
    </main>
  );
}
