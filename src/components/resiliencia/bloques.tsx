// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · EL RENDERIZADOR DE BLOQUES DEL CENTRO
//
// Las quince secciones no tienen cada una su maquetación: tienen un tipo de
// contenido y este componente lo pinta. La ventaja no es estética: es que una
// sección nueva no puede «olvidar» un estilo, y que ningún texto del centro
// se escribe dentro de un .tsx (donde nadie lo revisa y nadie lo traduce).
//
// Cero JavaScript de cliente: server components puros. Las únicas
// interacciones del centro viven en dos componentes propios (las listas
// marcables y el buscador del glosario) y en la herramienta.
//
// Regla 60 FPS de la casa: ningún transform continuo, ninguna animación
// infinita, ningún blur. Lo único que se mueve aquí es el hover de una
// tarjeta, y eso es color, no geometría.
// ═══════════════════════════════════════════════════════════════════

import Link from "next/link";
import type { Bloque, Salida } from "@/lib/resiliencia/tipos";
import { ENCUADRE } from "@/lib/resiliencia/secciones";

const ACENTO = "#2dd4bf";

function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: ACENTO }}>
      {children}
    </p>
  );
}

export function BloqueVista({ b, i }: { b: Bloque; i: number }) {
  switch (b.tipo) {
    case "prosa":
      return (
        <section className="mt-8" aria-labelledby={`bl-${i}`}>
          <h3 id={`bl-${i}`} className="sr-only">
            Presentación
          </h3>
          <div className="space-y-3">
            {b.items.map((t, k) => (
              <p key={k} className="max-w-3xl text-[15px] leading-7 text-zinc-300">
                {t}
              </p>
            ))}
          </div>
        </section>
      );

    case "pasos":
      return (
        <section className="mt-10" aria-label={b.titulo ?? "Pasos"}>
          {b.titulo ? <h3 className="text-lg font-semibold text-zinc-100">{b.titulo}</h3> : null}
          <ol className="mt-4 space-y-3">
            {b.items.map((it, k) => (
              <li key={k} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-sm font-semibold text-zinc-100">{it.titulo}</p>
                <p className="mt-1.5 whitespace-pre-line text-[13px] leading-6 text-zinc-400">{it.texto}</p>
              </li>
            ))}
          </ol>
        </section>
      );

    case "lista":
      return (
        <section className="mt-10" aria-label={b.titulo ?? "Lista"}>
          {b.titulo ? <h3 className="text-lg font-semibold text-zinc-100">{b.titulo}</h3> : null}
          {b.numerada ? (
            <ol className="mt-3 space-y-2">
              {b.items.map((t, k) => (
                <li key={k} className="flex gap-3 text-[13px] leading-6 text-zinc-300">
                  <span className="font-mono text-[11px] text-zinc-600">{String(k + 1).padStart(2, "0")}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          ) : (
            <ul className="mt-3 space-y-2">
              {b.items.map((t, k) => (
                <li key={k} className="flex gap-3 text-[13px] leading-6 text-zinc-300">
                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ background: ACENTO }} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      );

    case "conceptos":
      return (
        <section className="mt-10" aria-label={b.titulo ?? "Conceptos"}>
          {b.titulo ? <h3 className="text-lg font-semibold text-zinc-100">{b.titulo}</h3> : null}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {b.items.map((it, k) => (
              <article key={k} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-zinc-100">{it.titulo}</h4>
                  {it.etiqueta ? (
                    <span className="shrink-0 rounded border border-teal-500/30 bg-teal-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-teal-300">
                      {it.etiqueta}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-[13px] leading-6 text-zinc-400">{it.texto}</p>
              </article>
            ))}
          </div>
        </section>
      );

    case "cifras":
      return (
        <section className="mt-10" aria-label={b.titulo ?? "Cifras"}>
          {b.titulo ? <h3 className="text-lg font-semibold text-zinc-100">{b.titulo}</h3> : null}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {b.items.map((c, k) => (
              <div key={k} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="font-mono text-2xl text-zinc-100">{c.valor}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-300">{c.etiqueta}</p>
                {c.nota ? <p className="mt-1.5 text-[11px] leading-5 text-zinc-500">{c.nota}</p> : null}
              </div>
            ))}
          </div>
        </section>
      );

    case "mitos":
      return (
        <section className="mt-10" aria-label={b.titulo ?? "Mitos"}>
          {b.titulo ? <h3 className="text-lg font-semibold text-zinc-100">{b.titulo}</h3> : null}
          <div className="mt-4 space-y-3">
            {b.items.map((m, k) => (
              <div key={k} className="grid gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-2">
                <p className="text-[13px] leading-6 text-zinc-500">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-red-400">Mito · </span>
                  {m.mito}
                </p>
                <p className="text-[13px] leading-6 text-zinc-200">
                  <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: ACENTO }}>
                    Realidad ·{" "}
                  </span>
                  {m.realidad}
                </p>
              </div>
            ))}
          </div>
        </section>
      );

    case "tabla":
      return (
        <section className="mt-10" aria-label={b.titulo ?? "Tabla"}>
          {b.titulo ? <h3 className="text-lg font-semibold text-zinc-100">{b.titulo}</h3> : null}
          <div className="mt-4 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr>
                  {b.cabeceras.map((h, k) => (
                    <th key={k} className="border-b border-zinc-800 pb-2 pr-4 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.filas.map((fila, k) => (
                  <tr key={k} className="align-top">
                    {fila.map((celda, j) => (
                      <td
                        key={j}
                        className={`border-b border-zinc-900 py-3 pr-4 text-[13px] leading-6 ${
                          j === 0 ? "font-semibold text-zinc-100" : "text-zinc-400"
                        }`}
                      >
                        {celda}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );

    case "columnas":
      return (
        <section className="mt-12" aria-label={b.titulo ?? "Guías"}>
          {b.titulo ? <h3 className="text-lg font-semibold text-zinc-100">{b.titulo}</h3> : null}
          <div className="mt-5 space-y-4">
            {b.items.map((it, k) => (
              <article key={k} id={slug(it.area)} className="scroll-mt-20 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-base font-semibold text-zinc-100">{it.area}</h4>
                  {it.nota ? (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{it.nota}</span>
                  ) : null}
                </div>
                <p className="mt-1 text-[13px] italic text-teal-200/80">{it.lema}</p>
                <div
                  className="mt-4 gap-4"
                  style={{ display: "grid", gridTemplateColumns: `repeat(${it.columnas.length}, minmax(0, 1fr))` }}
                >
                  {it.columnas.map((col, j) => (
                    <div key={j}>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{col.titulo}</p>
                      <ul className="mt-2 space-y-2">
                        {col.items.map((t, n) => (
                          <li key={n} className="text-[12.5px] leading-6 text-zinc-300">
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {it.fuente ? <p className="mt-4 text-[11px] text-zinc-600">Fuente: {it.fuente}</p> : null}
              </article>
            ))}
          </div>
        </section>
      );

    case "lecciones":
      return (
        <section className="mt-10" aria-label={b.titulo ?? "Lecciones"}>
          {b.titulo ? <h3 className="text-lg font-semibold text-zinc-100">{b.titulo}</h3> : null}
          <div className="mt-4 space-y-3">
            {b.items.map((l, k) => (
              <article key={k} id={slug(l.titulo)} className="scroll-mt-20 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-[15px] font-semibold text-zinc-100">{l.titulo}</h4>
                  <span className="rounded border border-zinc-700 px-1.5 py-0.5 font-mono text-[10px] uppercase text-zinc-400">
                    {l.nivel}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-6 text-zinc-300">{l.idea}</p>
                <ul className="mt-3 space-y-1.5">
                  {l.claves.map((c, j) => (
                    <li key={j} className="flex gap-2 text-[12.5px] leading-6 text-zinc-400">
                      <span aria-hidden style={{ color: ACENTO }}>
                        ·
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[12.5px] leading-6 text-teal-200/90">Sirve para: {l.sirve}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {l.ver.map((v) => (
                    <Link
                      key={v.ruta}
                      href={v.ruta}
                      className="rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:border-teal-500/50 hover:text-teal-200"
                    >
                      {v.etiqueta}
                    </Link>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-zinc-600">Fuente: {l.fuente}</p>
              </article>
            ))}
          </div>
        </section>
      );

    case "aviso":
      return (
        <aside className="mt-10 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300">{b.titulo}</p>
          <p className="mt-1.5 text-[13px] leading-6 text-zinc-300">{b.texto}</p>
        </aside>
      );

    case "fuente":
      return (
        <p className="mt-10 border-t border-zinc-900 pt-4 text-[11px] leading-5 text-zinc-600">
          Fuentes citadas en el centro (paráfrasis, sin enlaces exteriores): {b.texto}
        </p>
      );
  }
}

export function Bloques({ bloques }: { bloques: Bloque[] }) {
  return (
    <>
      {bloques.map((b, i) => (
        <BloqueVista key={i} b={b} i={i} />
      ))}
    </>
  );
}

/** El encuadre de la MISIÓN 09, una sola vez escrita y repetida por componente. */
export function EncuadreCentro() {
  return (
    <aside className="mt-12 rounded-xl border border-teal-500/25 bg-teal-500/[0.05] p-5">
      <Etiqueta>{ENCUADRE.titulo}</Etiqueta>
      <p className="mt-2 text-[13px] leading-6 text-zinc-300">{ENCUADRE.texto}</p>
      <p className="mt-2 text-[12px] leading-6 text-zinc-500">{ENCUADRE.datosVivos}</p>
    </aside>
  );
}

/** Las salidas de una sección: el nexo con su motivo, pintado como tal. */
export function Salidas({ salidas }: { salidas?: Salida[] }) {
  if (!salidas?.length) return null;
  return (
    <nav aria-label="Salidas de esta sección" className="mt-12 border-t border-zinc-900 pt-5">
      <Etiqueta>Conecta con</Etiqueta>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {salidas.map((s) => (
          <li key={s.ruta}>
            <Link
              href={s.ruta}
              className="block rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 hover:border-teal-500/40"
            >
              <span className="text-[13px] font-semibold text-zinc-100">{s.etiqueta}</span>
              <span className="mt-1 block text-[11.5px] leading-5 text-zinc-500">{s.porque}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** el ancla de un título: la misma regla en toda la casa */
export function slug(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}
