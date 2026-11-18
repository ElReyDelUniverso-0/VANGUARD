import type { Metadata } from "next";
import Link from "next/link";
import { MODELOS_DATO, coberturaCatalogo, vecinosDeModelo } from "@/lib/datos/catalogo";

// ============================================================
// v407.0 · /datos — EL CATÁLOGO DE DATOS, A LA VISTA
//
// La página que faltaba: de dónde sale cada dato de la casa, con qué licencia,
// de qué fecha es, cada cuánto se actualiza y —lo más importante— qué NO dice.
//
// No hay ni una cifra nueva aquí: todo se lee de `src/lib/datos/catalogo.ts`,
// que es la fuente única. Si un modelo no declara procedencia, esta página lo
// enseñaría vacío, y el diagnóstico fallaría.
// ============================================================

export const metadata: Metadata = {
  title: "El catálogo de datos — de dónde sale cada cifra | VANGUARD",
  description:
    "Catálogo central de datos de VANGUARD: países, fichas, indicadores del Banco Mundial, cables, acontecimientos, puntos del frente, monedas, guerras y simulaciones, con procedencia, licencia, fecha de captura y límites declarados.",
  alternates: { canonical: "/datos" },
};

const caja = "rounded-md border border-zinc-800 bg-zinc-900/40 p-4";
const titulo = "font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70";

export default function DatosPage() {
  const c = coberturaCatalogo();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className={titulo}>EL CATÁLOGO DE DATOS</p>
      <h1 className="mt-2 text-2xl font-bold text-zinc-100">De dónde sale cada cifra</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
        {c.modelos} modelos declarados: {c.conProcedencia} con procedencia escrita, {c.conFechaDeCaptura} con
        fecha de captura, {c.conLimites} con sus límites a la vista y {c.relaciones} relaciones entre ellos.
        Donde la casa no sabe, escribe «sin dato»; donde el dato es de otro, lo dice con su licencia y su enlace.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/api/sistema/datos" className="rounded-sm border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-300 hover:border-amber hover:text-amber">
          JSON del catálogo ▸
        </Link>
        <Link href="/sistema" className="rounded-sm border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-300 hover:border-amber hover:text-amber">
          El sistema ▸
        </Link>
        <Link href="/nucleo" className="rounded-sm border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-300 hover:border-amber hover:text-amber">
          Buscar en el núcleo ▸
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {MODELOS_DATO.map((m) => (
          <article key={m.id} className={caja}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-bold text-zinc-100">{m.nombre}</h2>
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                {m.id} · {m.origen}
              </span>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{m.descripcion}</p>

            <dl className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              <div>
                <dt className={titulo}>DÓNDE VIVE</dt>
                <dd className="font-mono text-[11px] text-zinc-400">{m.vive}</dd>
              </div>
              <div>
                <dt className={titulo}>VOLUMEN</dt>
                <dd className="text-[12px] text-zinc-400">{m.volumen}</dd>
              </div>
              <div>
                <dt className={titulo}>ACTUALIZACIÓN</dt>
                <dd className="text-[12px] text-zinc-400">{m.actualizacion}</dd>
              </div>
              <div>
                <dt className={titulo}>CACHÉ</dt>
                <dd className="text-[12px] text-zinc-400">{m.cache === null ? "no se cachea" : `${m.cache} s`}</dd>
              </div>
            </dl>

            <div className="mt-3">
              <p className={titulo}>PROCEDENCIA</p>
              <ul className="mt-1 space-y-1">
                {m.procedencia.map((p, i) => (
                  <li key={i} className="text-[12px] leading-snug text-zinc-400">
                    <span className="text-zinc-200">{p.quien}</span> · {p.licencia}
                    {p.captura ? ` · captura ${p.captura}` : ""}
                    {p.fuente ? ` · ${p.fuente}` : ""}
                    {p.enlace ? (
                      <>
                        {" · "}
                        <a href={p.enlace} target="_blank" rel="noopener noreferrer" className="text-amber hover:underline">
                          original
                        </a>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <p className={titulo}>CAMPOS</p>
                <ul className="mt-1 space-y-0.5">
                  {m.campos.map((campo) => (
                    <li key={campo.nombre} className="text-[11px] leading-snug text-zinc-500">
                      <span className="font-mono text-zinc-300">{campo.nombre}</span> ({campo.tipo}) — {campo.descripcion}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={titulo}>SE UNE CON</p>
                <ul className="mt-1 space-y-0.5">
                  {vecinosDeModelo(m.id).slice(0, 6).map((r, i) => (
                    <li key={i} className="text-[11px] leading-snug text-zinc-500">
                      <span className="font-mono text-zinc-300">{r.con}</span> por {r.por} — {r.nota}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <p className={titulo}>LO QUE NO DICE</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {m.limites.map((l, i) => (
                    <li key={i} className="text-[11px] leading-snug text-amber/80">
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={titulo}>DÓNDE SE VE</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {m.rutas.map((r) => (
                    <Link
                      key={r}
                      href={r}
                      className="rounded-sm border border-zinc-700 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 hover:border-amber hover:text-amber"
                    >
                      {r}
                    </Link>
                  ))}
                  {m.endpoint ? (
                    <a
                      href={m.endpoint}
                      className="rounded-sm border border-amber/40 px-1.5 py-0.5 font-mono text-[10px] text-amber hover:underline"
                    >
                      {m.endpoint} ▸
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-10 text-[11px] leading-relaxed text-zinc-600">
        Este catálogo es documentación ejecutable: lo lee el diagnóstico de /sistema y lo vigilan las pruebas
        (scripts/pruebas-plataforma.mjs). Si un modelo miente —una ruta que no existe, una fuente sin
        licencia, un límite sin escribir— la casa lo dice en voz alta.
      </p>
    </main>
  );
}
