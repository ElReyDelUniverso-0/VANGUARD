import type { Metadata } from "next";
import {normalizar} from "@/lib/conocimiento/indice";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import censo from "@/lib/arquitectura/censo.json";
import { CONTRATOS, DEPARTAMENTOS, resumenDepartamentos, type EstadoDepartamento } from "@/lib/arquitectura/departamentos";
import { cuentaNexos, FAMILIA_NEXO } from "@/lib/arquitectura/nexos";
import { MODELOS, estadisticasLabs } from "@/lib/labs/registro";
import { MODULOS_NUCLEO } from "@/lib/nucleo/registro";
import { TOTALES } from "@/lib/navegacion/destinos";
import { PAISES_GEO } from "@/lib/geo-paises";

// ═══════════════════════════════════════════════════════════════════
// v412.0 · /arquitectura — EL MAPA DE LA CASA, CON LO QUE FALTA
//
// Lo que esta página es: el censo real del árbol (88 páginas y 111 rutas de
// API contadas desde src/app, con sus referencias entrantes), los nexos que
// unen las seis familias de contenido y el estado honesto de los 22
// departamentos del plan.
//
// Lo que esta página NO es: un escaparate. Cada número sale de un registro
// que se puede abrir; cada departamento dice «sin construir» cuando no hay
// motor detrás, aunque el plan lo pida con entusiasmo.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "La arquitectura de Vanguard: qué existe, cómo se conecta y qué falta",
  description:
    "El censo real de la plataforma —páginas, rutas de API y puertas de entrada—, los nexos entre países, datos, mapas, cronologías y simuladores, y el estado de los 22 departamentos con lo que queda por construir.",
  alternates: { canonical: "/arquitectura" },
  openGraph: {
    type: "article",
    title: "La arquitectura de Vanguard",
    description:
      "Censo del árbol, motor de nexos y auditoría de los 22 departamentos: lo que existe de verdad y lo que todavía no.",
    url: "/arquitectura",
    siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    locale: "es_ES",
  },
};

const COLOR_ESTADO: Record<EstadoDepartamento, { borde: string; texto: string; fondo: string }> = {
  "en pie": { borde: "border-emerald-500/30", texto: "text-emerald-300", fondo: "bg-emerald-500/10" },
  parcial: { borde: "border-amber-500/30", texto: "text-amber-300", fondo: "bg-amber-500/10" },
  "sin construir": { borde: "border-zinc-700", texto: "text-zinc-400", fondo: "bg-zinc-800/40" },
};

export default async function ArquitecturaPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const params=await searchParams;const q=typeof params.q==='string'?params.q.slice(0,180):'';
  const tokens=normalizar(q).split(/\s+/).filter(Boolean);
  const departamentosFiltrados=DEPARTAMENTOS.filter(d=>tokens.every(t=>normalizar(JSON.stringify(d)).includes(t)));
  const resumen = resumenDepartamentos();
  const nexos = cuentaNexos();
  const labs = estadisticasLabs();
  const delgadas = censo.rutas.filter((r) => r.tipo === "pagina" && r.referencias === 1);
  const huerfanas = censo.huerfanas;

  const cifras: { n: number; t: string; pie: string }[] = [
    { n: censo.paginas, t: "páginas", pie: `contadas en src/app el ${censo.fecha}` },
    { n: censo.rutasApi, t: "rutas de API", pie: "endpoints reales, no documentación" },
    { n: TOTALES.destinos, t: "destinos", pie: "catálogo de /directorio" },
    { n: MODULOS_NUCLEO.length, t: "módulos", pie: "censo del Núcleo" },
    { n: MODELOS.length, t: "simuladores", pie: `${labs.variables} variables, ${labs.limites} límites` },
    { n: PAISES_GEO.length, t: "fichas de país", pie: "prerenderizadas" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "La arquitectura de Vanguard",
    description:
      "Censo del árbol, motor de nexos y auditoría de los 22 departamentos de Vanguard.",
    url: `${SITE_URL}/arquitectura`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
  };

  return (
    <main className="min-h-screen bg-zinc-950 pb-24 text-zinc-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />

      <header className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 px-5 pb-10 pt-16">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-400/80">Vanguard · arquitectura</p>
          <h1 className="mt-3 font-orbitron text-4xl font-black leading-[1.05] text-zinc-50 sm:text-5xl">
            LA CASA <span className="text-amber-300">CONECTADA</span>
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-zinc-400">
            Qué existe, cómo se une y qué falta. Esta sala no enseña lo que la plataforma quiere ser: enseña lo que
            el árbol del repositorio tiene hoy, contado por una máquina que lo recorre, y lo que todavía no tiene
            motor detrás.
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {cifras.map((x) => (
              <div key={x.t} className="rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2">
                <dt className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">{x.t}</dt>
                <dd className="font-orbitron text-xl font-black text-amber-200">{x.n}</dd>
                <p className="mt-0.5 text-[10px] leading-tight text-zinc-500">{x.pie}</p>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5">
        {/* ── 1. lo que el censo encontró ───────────────────────── */}
        <section className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Lo que el censo encontró</h2>

          <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-zinc-300">
            La primera medición desmintió la sospecha fácil. <strong className="text-zinc-100">No faltaban puertas</strong>:
            las {censo.paginas} páginas se alcanzan pulsando, no hay ninguna huérfana y la media es de{" "}
            {censo.mediaReferencias.toFixed(2).replace(".", ",")} enlaces entrantes por página. Lo que faltaba era otra cosa: los enlaces eran{" "}
            <em>menús</em>. Un menú dice «esto existe»; no dice «esto se relaciona con lo que estás mirando». La ficha de un
            país y el simulador que explica su mecanismo no se conocían.
          </p>

          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded border border-zinc-800 bg-zinc-950/40 p-3">
              <dt className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Páginas alcanzables</dt>
              <dd className="font-orbitron text-xl font-black text-emerald-300">
                {censo.paginasConReferencias}/{censo.paginas}
              </dd>
              <p className="mt-1 text-[11px] leading-snug text-zinc-500">
                {huerfanas.length === 0
                  ? "Ninguna página pública queda sin una puerta de entrada."
                  : `Sin puerta: ${huerfanas.join(", ")}.`}
              </p>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-950/40 p-3">
              <dt className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Enlaces entrantes (media)</dt>
              <dd className="font-orbitron text-xl font-black text-amber-200">{censo.mediaReferencias.toFixed(2).replace(".", ",")}</dd>
              <p className="mt-1 text-[11px] leading-snug text-zinc-500">
                Antes de esta ronda, 14,49 de media sobre 88 páginas. Hoy {censo.mediaReferencias.toFixed(2).replace(".", ",")} sobre {censo.paginas}.
              </p>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-950/40 p-3">
              <dt className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Una sola entrada</dt>
              <dd className="font-orbitron text-xl !text-zinc-100">{delgadas.length}</dd>
              <p className="mt-1 text-[11px] leading-snug text-zinc-500">
                {delgadas.length === 0
                  ? "Ninguna página depende de un único enlace."
                  : `Se pierden si alguien reorganiza un menú: ${delgadas.map((d) => d.ruta).join(", ")}.`}
              </p>
            </div>
          </dl>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-zinc-800 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                  <th className="py-1.5 pr-3">Puerta</th>
                  <th className="py-1.5 pr-3">Antes</th>
                  <th className="py-1.5 pr-3">Ahora</th>
                  <th className="py-1.5">Qué se añadió</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                {[
                  ["/labs (el laboratorio)", "4", "7", "La banda de nexos en el catálogo, la ficha de modelo y este mapa"],
                  ["/labs/<modelo> (15 fichas)", "4", "7", "Salidas propias de cada modelo, con su motivo"],
                  ["/mundos/<iso> (249 fichas)", "32", "35", "Siete salidas al mecanismo, al comparador y al dato"],
                  ["/datos (el catálogo)", "5", "8", "Enlace desde el laboratorio, la ficha de país y esta sala"],
                  ["/arquitectura (nueva)", "—", "4", "Núcleo, espacio «La Casa», laboratorio y sitemap"],
                ].map(([puerta, antes, ahora, que]) => (
                  <tr key={puerta} className="border-b border-zinc-900">
                    <td className="py-1.5 pr-3 font-mono text-[11px] text-zinc-300">{puerta}</td>
                    <td className="py-1.5 pr-3 font-mono text-zinc-500">{antes}</td>
                    <td className="py-1.5 pr-3 font-mono text-amber-200">{ahora}</td>
                    <td className="py-1.5 text-zinc-500">{que}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 border-t border-zinc-800 pt-3 text-[12px] leading-relaxed text-zinc-500">
            Las dos columnas se midieron con el mismo programa: la de «antes», sobre el árbol del commit{" "}
            <span className="font-mono text-zinc-400">5aa37ae</span>, y la de «ahora», sobre este. El censo lo escribe{" "}
            <span className="font-mono text-zinc-400">tools/arquitectura/censar.mjs</span> y se versiona en{" "}
            <span className="font-mono text-zinc-400">src/lib/arquitectura/censo.json</span>: si el número cambia, el
            fichero cambia con él.
          </p>
        </section>

        {/* ── 2. los nexos ─────────────────────────────────────── */}
        <section className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-orbitron text-xl font-black text-zinc-100">El motor de nexos</h2>
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              {nexos.enlaces} enlaces declarados · {nexos.modelos} laboratorios
            </p>
          </div>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-zinc-400">
            Un nexo no es un enlace decorativo: dice qué familia de contenido hay al otro lado y por qué se sale hacia
            ella desde esta página. Cada laboratorio declara sus salidas —a países, datos, mapas, cronologías y otros
            simuladores— y cada ficha de país declara las suyas. Todos los destinos se comprueban contra el censo antes
            de publicar: un nexo que apunte a una ruta inexistente rompe la prueba.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(FAMILIA_NEXO) as (keyof typeof FAMILIA_NEXO)[]).map((k) => {
              const f = FAMILIA_NEXO[k];
              return (
                <li
                  key={k}
                  className="rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
                  style={{ borderColor: `${f.color}44`, color: f.color, backgroundColor: `${f.color}0f` }}
                >
                  {f.nombre} · {nexos.porFamilia[k]}
                </li>
              );
            })}
          </ul>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              href="/labs/macro"
              className="rounded border border-zinc-800 bg-zinc-900/40 p-3 text-[13px] text-zinc-300 hover:border-amber-400/40 hover:text-amber-200"
            >
              Ver la banda en un laboratorio → <span className="text-zinc-500">/labs/macro</span>
            </Link>
            <Link
              href="/mundos/do"
              className="rounded border border-zinc-800 bg-zinc-900/40 p-3 text-[13px] text-zinc-300 hover:border-amber-400/40 hover:text-amber-200"
            >
              Ver la banda en una ficha de país → <span className="text-zinc-500">/mundos/do</span>
            </Link>
          </div>
        </section>

        {/* ── 3. los 22 departamentos ──────────────────────────── */}
        <section id="departamentos" className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-orbitron text-xl font-black text-zinc-100">Los 22 departamentos</h2>
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              {resumen["en pie"]} en pie · {resumen.parcial} parciales · {resumen["sin construir"]} sin construir
            </p>
          </div>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-zinc-400">
            Cada ficha dice qué infraestructura existe hoy con su ruta, qué falta y cuál es la siguiente pieza
            concreta. «En pie» significa que hay una base funcional, no que toda la misión esté completada. Una pantalla sin función no cuenta.
          </p>

          <form action="/arquitectura#departamentos" className="mt-4 flex flex-wrap gap-3"><label className="flex-1 text-sm">Buscar departamento, ruta o archivo<input name="q" type="search" maxLength={180} defaultValue={q} className="mt-2 block w-full rounded border border-zinc-700 bg-zinc-900 p-3"/></label><button type="submit" className="self-end rounded border border-amber-400/50 px-4 py-3 text-sm text-amber-300">Filtrar</button><Link className="self-end p-3 text-sm text-amber-300" href="/arquitectura#departamentos">Restablecer</Link></form>
          <p className="mt-3 text-xs text-zinc-500" role="status">{departamentosFiltrados.length} departamentos con el filtro actual.</p>
          <ol className="mt-4 space-y-3">
            {departamentosFiltrados.map((d) => {
              const c = COLOR_ESTADO[d.estado];
              return (
                <li key={d.id} className={`rounded-lg border ${c.borde} bg-zinc-900/40 p-4`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-orbitron text-[15px] font-black text-zinc-100">
                      <span className="mr-2 font-mono text-[10px] text-zinc-500">{String(d.n).padStart(2, "0")}</span>
                      {d.nombre}
                    </h3>
                    <span className={`rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${c.borde} ${c.texto} ${c.fondo}`}>
                      {d.estado}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-snug text-zinc-500">{d.mision}</p>

                  {d.existe.length > 0 ? (
                    <ul className="mt-3 space-y-1">
                      {d.existe.map((p, i) => (
                        <li key={i} className="text-[12px] leading-snug text-zinc-400">
                          <span className="text-emerald-400/80">·</span>{" "}
                          {p.ruta ? (
                            <Link href={p.ruta} className="font-semibold text-zinc-200 underline decoration-zinc-700 underline-offset-2 hover:text-amber-200">
                              {p.etiqueta}
                            </Link>
                          ) : (
                            <span className="font-semibold text-zinc-200">{p.etiqueta}</span>
                          )}
                          {p.ruta ? <span className="ml-1 font-mono text-[10px] text-zinc-600">{p.ruta}</span> : null}
                          <span className="text-zinc-500"> — {p.nota}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-[12px] italic text-zinc-500">No hay ninguna pieza viva de este departamento.</p>
                  )}

                  <details className="mt-2">
                    <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-zinc-500 hover:text-amber-300">
                      Qué falta ({d.falta.length}) y por dónde sigue
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {d.falta.map((f, i) => (
                        <li key={i} className="text-[12px] leading-snug text-zinc-400">
                          <span className="text-amber-400/70">·</span> {f}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 border-l-2 border-amber-400/40 pl-3 text-[12px] leading-snug text-zinc-300">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-amber-300/80">siguiente</span>{" "}
                      {d.siguiente}
                    </p>
                  </details>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ── 4. contratos ─────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="font-orbitron text-xl font-black text-zinc-100">Los {CONTRATOS.length} contratos de integración</h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-zinc-400">
            Las reglas que cualquier área nueva tiene que cumplir para entrar sin romper lo que ya funciona. Están aquí
            para que los veintidós departamentos no construyan veintidós plataformas distintas.
          </p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {CONTRATOS.map((c) => (
              <li key={c.n} className="rounded border border-zinc-800 bg-zinc-900/40 p-3">
                <p className="text-[13px] font-semibold text-zinc-100">
                  <span className="mr-2 font-mono text-[10px] text-amber-300/80">{String(c.n).padStart(2, "0")}</span>
                  {c.titulo}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-zinc-400">{c.regla}</p>
                <p className="mt-1 font-mono text-[10px] leading-snug text-zinc-600">Comprobación: {c.comprobacion}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── 5. cómo comprobarlo ──────────────────────────────── */}
        <section className="mt-10 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Cómo se comprueba</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
            Los dos ficheros de herramientas que sostienen esta sala están en el repositorio y no necesitan nada más
            que Node:
          </p>
          <pre className="mt-3 overflow-x-auto rounded border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-300">
{`node tools/arquitectura/censar.mjs   # recuenta el árbol y reescribe censo.json
node tools/arquitectura/probar.mjs   # comprueba que todo nexo apunta a una ruta real`}
          </pre>
          <p className="mt-3 text-[12px] leading-relaxed text-zinc-500">
            Si un nexo, un departamento o una pieza citan una ruta que ya no existe, la prueba falla y el envío no
            debe salir. Es la misma ley que se aplica al resto de la casa: el registro no se escribe a mano en la
            página.
          </p>
        </section>

        <nav className="mt-10 flex flex-wrap gap-2 border-t border-zinc-800 pt-6">
          {[
            { r: "/directorio", t: "El directorio completo" },
            { r: "/navegacion", t: "Los diez espacios" },
            { r: "/nucleo", t: "El Núcleo" },
            { r: "/labs", t: "El laboratorio" },
            { r: "/datos", t: "El catálogo de datos" },
            { r: "/calidad", t: "La sala de la calidad" },
          ].map((x) => (
            <Link
              key={x.r}
              href={x.r}
              className="rounded border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-[12px] text-zinc-300 hover:border-amber-400/50 hover:text-amber-200"
            >
              {x.t}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
