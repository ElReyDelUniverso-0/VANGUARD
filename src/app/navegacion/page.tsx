import type { Metadata } from "next";
import Link from "next/link";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { NavegacionSala } from "./navegacion-sala";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { ESPACIOS, TOTAL_HERRAMIENTAS } from "@/lib/navegacion/espacios";
import { auditoria, fusiones } from "@/lib/navegacion/destinos";
import { canonicosDeEspacio } from "@/lib/navegacion/destinos";

// ═══════════════════════════════════════════════════════════════════
// v405.10 · LA ARQUITECTURA DE NAVEGACIÓN ADAPTATIVA — la sala donde se ve
// entera y se toca.
//
// LA AUDITORÍA: la casa tenía seis navegaciones simultáneas (la barra de 155
// pestañas del cuartel, el menú grande, la brújula de intenciones, los nueve
// módulos de rutas, las 20 constelaciones y las 155 puertas /sala/<clave>)
// y 56 rutas públicas. Los mismos sitios aparecían con nombres distintos en
// cada una: el mapa 3D era sala Y ruta; el atlas, sala Y ruta; las salas, 155
// pestañas Y 20 constelaciones Y 9 módulos Y 155 puertas.
//
// LA RESPUESTA: un registro de DIEZ espacios de trabajo, un catálogo de
// destinos DERIVADO de las fuentes que ya existían, una tabla de FUSIONES que
// declara la puerta canónica de cada familia (sin cerrar ninguna) y una barra
// que enseña, en cada sala, las herramientas de lo que estás haciendo.
//
// NADA SE HA BORRADO: las seis navegaciones siguen ahí; esta las conecta.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Navegación adaptativa · diez espacios de trabajo en VANGUARD",
  description:
    "La arquitectura de navegación de VANGUARD: diez espacios de trabajo con sus herramientas, contexto detectado desde la URL, paneles configurables y la fusión declarada de las puertas duplicadas.",
  alternates: { canonical: "/navegacion" },
};

const PUERTAS: EnlaceContextual[] = [
  { etiqueta: "EL CENTRO DE MAPAS ▸", ruta: "/mapas", motivo: "el espacio geografía, con sus ocho capas y su buscador de países", tipoRelacion: "pertenece_a" },
  { etiqueta: "TODAS LAS SALAS ▸", ruta: "/modulos", motivo: "el índice de las 155 salas y las 20 constelaciones: la puerta canónica del índice", tipoRelacion: "pertenece_a" },
  { etiqueta: "EL CUARTEL ▸", ruta: "/cuartel", motivo: "la barra de pestañas de siempre, intacta, con sus 155 salas", tipoRelacion: "pertenece_a" },
  { etiqueta: "EL ESTADO ▸", ruta: "/estado", motivo: "la salud y la auditoría de la casa, donde vive el espacio La Casa", tipoRelacion: "pertenece_a" },
];

export default function NavegacionPage() {
  const a = auditoria();
  const f = fusiones();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Navegación adaptativa de VANGUARD",
    applicationCategory: "Navigation",
    operatingSystem: "Web",
    description:
      "Diez espacios de trabajo con herramientas contextuales, paneles configurables y fusión declarada de las puertas duplicadas de la casa.",
    inLanguage: "es",
  };

  return (
    <>
      <main className="mx-auto max-w-[1408px] px-4 pb-16 pt-6 sm:px-6">
        <PortadaSala
          imagen="/imagenes-reales/control.jpg"
          alt="Cartografía iluminada sobre una mesa de operaciones"
          volanta="LA CASA · NAVEGACIÓN"
          titulo="LA NAVEGACIÓN ADAPTATIVA"
          nivel="h1"
          acento="#94a3b8"
          sumario="La casa tenía seis formas de navegar y ninguna sabía qué estabas haciendo. Ahora hay diez espacios de trabajo: si estás en los mapas, tienes las herramientas geográficas; si simulas, las del simulador. Todo lo que había sigue abierto."
          cifras={[
            { valor: a.destinos, etiqueta: "destinos", nota: "con espacio asignado" },
            { valor: ESPACIOS.length, etiqueta: "espacios", nota: "de trabajo" },
            { valor: TOTAL_HERRAMIENTAS, etiqueta: "herramientas", nota: "contextuales" },
            { valor: a.puertasDuplicadas, etiqueta: "puertas fusionadas", nota: "ninguna cerrada" },
          ]}
          puntos={[
            {
              titulo: "CONTEXTO SIN ADIVINAR",
              texto:
                "El espacio sale de la URL con una función pura: la sala activa del cuartel manda y, si no hay, gana el prefijo de ruta más largo. Servidor y cliente dicen siempre lo mismo.",
            },
            {
              titulo: "FUSIONAR NO ES CERRAR",
              texto:
                "Donde había tres puertas para el mismo sitio se declara una canónica y las demás siguen funcionando como alias, buscables y enlazables. Nada de lo que había desaparece.",
            },
            {
              titulo: "PANELES QUE SON TUYOS",
              texto:
                "Cada espacio ordena y enciende sus herramientas a tu manera, y se guarda en tu aparato. Una herramienta apagada sigue existiendo; una nueva aparece sola.",
            },
          ]}
          nota="La barra se pliega, se adapta al móvil y no aparece en las salas inmersivas (lectura, puerta, offline) donde estorbaría."
        />

        {/* ── la auditoría medida ─────────────────────────────────────── */}
        <section className="mt-10" aria-label="La auditoría en cifras">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">LO QUE HABÍA, MEDIDO</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: "navegaciones que convivían", v: "6", n: "cuartel · menú grande · brújula · módulos · constelaciones · puertas" },
              { k: "rutas públicas", v: String(a.rutas), n: `${a.porOrigen.modulos} salas de módulo + ${a.porOrigen.rutasVivas} rutas vivas` },
              { k: "salas del cuartel", v: String(a.salas), n: `${a.constelaciones} constelaciones · generadas de tab-nav.tsx` },
              { k: "familias con varias puertas", v: String(a.familiasConVariasPuertas), n: `${a.puertasDuplicadas} alias declarados, ninguno cerrado` },
            ].map((c) => (
              <article key={c.k} className="rounded-sm border border-zinc-800 bg-zinc-900/40 p-3">
                <b className="block font-mono text-[22px] leading-none text-slate-200">{c.v}</b>
                <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">{c.k}</span>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">{c.n}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── los diez espacios, con sus herramientas y su detector ───── */}
        <section className="mt-10" aria-label="Los diez espacios y sus herramientas">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">LOS DIEZ ESPACIOS DE TRABAJO</h2>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {ESPACIOS.map((e) => {
              const canon = canonicosDeEspacio(e.clave).slice(0, 5);
              return (
                <article key={e.clave} className="rounded-sm border border-zinc-800 bg-zinc-900/40 p-4" style={{ borderLeft: `3px solid ${e.color}` }}>
                  <header className="flex items-baseline justify-between gap-3">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: e.color }}>{e.nombre}</h3>
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-600">
                      {e.herramientas.length} herramientas · {canon.length ? `${canon.length}+ destinos` : ""}
                    </span>
                  </header>
                  <p className="mt-1 text-[12px] text-zinc-400">{e.lema}</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {e.herramientas.map((h) => (
                      <li key={h.id}>
                        <Link
                          href={h.href}
                          className="inline-block rounded-full border border-zinc-700 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
                          title={h.desc}
                        >
                          {h.nombre}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 font-mono text-[9px] leading-relaxed text-zinc-600">
                    detecta: {e.detecta.rutas.map((r) => (r === "" ? "/" : r)).join(" · ")}
                    {e.detecta.salas.length ? ` · salas: ${e.detecta.salas.slice(0, 6).join(", ")}${e.detecta.salas.length > 6 ? "…" : ""}` : ""}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── las fusiones, derivadas ─────────────────────────────────── */}
        <section className="mt-10" aria-label="Fusiones declaradas">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">
            LAS PUERTAS DUPLICADAS, FUSIONADAS SIN CERRAR NINGUNA
          </h2>
          <p className="mt-2 max-w-3xl text-[12.5px] leading-relaxed text-zinc-500">
            No es una lista escrita a mano: sale de comparar los destinos derivados de{" "}
            <code className="font-mono text-zinc-300">mapa-salas.ts</code> y{" "}
            <code className="font-mono text-zinc-300">modulos.ts</code> por familia. Una ruta propia gana a
            una sala del cuartel porque se puede compartir y la rastrea Google; el resto queda como alias.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-left font-mono text-[10.5px]">
              <thead>
                <tr className="text-zinc-500">
                  <th className="border-b border-zinc-800 py-1.5 pr-3 uppercase tracking-[0.12em]">familia</th>
                  <th className="border-b border-zinc-800 py-1.5 pr-3 uppercase tracking-[0.12em]">puerta canónica</th>
                  <th className="border-b border-zinc-800 py-1.5 pr-3 uppercase tracking-[0.12em]">alias que siguen vivos</th>
                  <th className="border-b border-zinc-800 py-1.5 uppercase tracking-[0.12em]">por qué</th>
                </tr>
              </thead>
              <tbody>
                {f.map((x) => (
                  <tr key={x.familia} className="align-top">
                    <td className="border-b border-zinc-900 py-1.5 pr-3 text-zinc-300">{x.familia}</td>
                    <td className="border-b border-zinc-900 py-1.5 pr-3">
                      <Link href={x.canonico.href} className="text-teal-300 hover:underline">{x.canonico.corto}</Link>
                      <span className="block text-[9px] text-zinc-600">{x.canonico.href}</span>
                    </td>
                    <td className="border-b border-zinc-900 py-1.5 pr-3 text-zinc-400">
                      {x.alias.map((al) => (
                        <Link key={al.id} href={al.href} className="mr-2 inline-block text-zinc-400 hover:text-zinc-200 hover:underline">
                          {al.corto}
                        </Link>
                      ))}
                    </td>
                    <td className="border-b border-zinc-900 py-1.5 text-[10px] leading-relaxed text-zinc-500">{x.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── la parte viva: probador + configurador ──────────────────── */}
        <NavegacionSala />

        <FuenteYFecha
          fuente="Registro de espacios (src/lib/navegacion/espacios.ts) · catálogo de destinos derivado de src/lib/vanguard/mapa-salas.ts (155 salas, generado de tab-nav.tsx), src/components/portada/modulos.ts (los módulos públicos) y las rutas reales del árbol src/app · contexto y ranking: funciones puras de src/lib/navegacion/contexto.ts"
          nota="Ninguna herramienta apunta a un sitio inventado: los scripts de prueba comprueban que cada href es una ruta real del repo o una sala real del cuartel, que ningún prefijo se declara en dos espacios y que ninguna sala del cuartel se queda sin espacio."
        />

        <section className="mt-10 pb-10">
          <EnlacesNucleo enlaces={PUERTAS} titulo="CONECTA CON EL NÚCLEO" />
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
    </>
  );
}
