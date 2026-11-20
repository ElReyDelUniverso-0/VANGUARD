// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · EL DIRECTORIO DE PAÍSES
//
// La conexión entre el centro y la geografía de la casa. Cada tarjeta sale de
// PAISES (el mismo objeto que alimenta la ficha /resiliencia/recursos/<iso>)
// y enlaza con la ficha geográfica /mundos/<iso>, que es la que tiene la
// población, el territorio y los vecinos del país.
//
// Cero países inventados: los ISO se cruzan con PAISES_GEO (el censo
// geográfico de la casa, ISO 3166). Si un ISO del directorio no estuviera en
// el censo, esta página lo diría — porque un enlace roto a /mundos/xx es peor
// que una tarjeta menos.
// ═══════════════════════════════════════════════════════════════════

import Link from "next/link";
import { PAISES, ORGANISMOS_GLOBALES, NOTA_VERIFICACION } from "@/lib/resiliencia/organismos";
import { PELIGRO_POR_ID } from "@/lib/resiliencia/peligros";
import { POR_ISO2 } from "@/lib/geo-paises";
import { Pictograma } from "./pictograma";
import { slug } from "./bloques";

export function DirectorioPaises() {
  const entries = Object.entries(PAISES);
  const huerfanos = entries.filter(([iso]) => !POR_ISO2.get(iso)).map(([iso]) => iso);

  return (
    <>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {entries.map(([iso, p]) => {
          const geo = POR_ISO2.get(iso);
          return (
            <article key={iso} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[15px] font-semibold text-zinc-100">{geo?.nombre ?? iso.toUpperCase()}</h3>
                {p.numero ? (
                  <span className="rounded border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 font-mono text-[12px] text-teal-200">
                    {p.numero}
                  </span>
                ) : (
                  <span className="rounded border border-zinc-700 px-2 py-0.5 font-mono text-[10px] uppercase text-zinc-500">
                    verifica en tu municipio
                  </span>
                )}
              </header>

              <p className="mt-2 text-[12.5px] leading-6 text-zinc-400">{p.aviso}</p>

              <ul className="mt-3 flex flex-wrap gap-1.5">
                {p.peligros.map((id) => {
                  const ficha = PELIGRO_POR_ID[id];
                  if (!ficha) return null;
                  return (
                    <li key={id}>
                      <Link
                        href={`/resiliencia/peligros#${slug(ficha.nombre)}`}
                        className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/60 px-2 py-1 text-[11px] text-zinc-300 hover:border-teal-500/40 hover:text-teal-200"
                      >
                        <Pictograma nombre={ficha.icono} className="h-3 w-3" />
                        {ficha.nombre}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <ul className="mt-3 space-y-1">
                {p.organismos.slice(0, 4).map((o) => (
                  <li key={o.nombre} className="text-[12px] leading-5 text-zinc-400">
                    <span className="font-semibold text-zinc-200">{o.nombre}</span>
                    {o.siglas ? <span className="font-mono text-[11px] text-teal-300"> · {o.siglas}</span> : null}
                    <span className="text-zinc-500"> — {o.rol}</span>
                  </li>
                ))}
                {p.organismos.length > 4 ? (
                  <li className="text-[11.5px] text-zinc-600">y {p.organismos.length - 4} más en la ficha</li>
                ) : null}
              </ul>

              <footer className="mt-3 flex flex-wrap gap-3 border-t border-zinc-900 pt-3">
                <Link href={`/resiliencia/recursos/${iso}`} className="text-[12px] font-semibold text-teal-300 hover:text-teal-200">
                  Ficha de recursos →
                </Link>
                {geo ? (
                  <Link href={`/mundos/${iso}`} className="text-[12px] text-zinc-400 hover:text-zinc-200">
                    Ficha del país
                  </Link>
                ) : null}
                <Link href="/regiones" className="text-[12px] text-zinc-500 hover:text-zinc-300">
                  Su región
                </Link>
              </footer>
            </article>
          );
        })}
      </div>

      {huerfanos.length ? (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/[0.06] p-3 text-[12px] text-red-200">
          Averiguado en el render: {huerfanos.join(", ")} no está en el censo geográfico de la casa, así que su
          enlace a /mundos se ha retirado. Es un defecto del directorio, no del censo.
        </p>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-100">La capa internacional</h2>
        <p className="mt-1 text-[13px] text-zinc-400">
          Lo que sostiene el marco, los datos y la coordinación cuando un país se queda solo. {entries.length} países
          tienen ficha propia; los demás se sirven de esta capa y de su autoridad local.
        </p>
        <ul className="mt-4 space-y-2">
          {ORGANISMOS_GLOBALES.map((o) => (
            <li key={o.nombre} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
              <p className="text-[13px] font-semibold text-zinc-100">
                {o.nombre}
                {o.siglas ? <span className="ml-1.5 font-mono text-[11px] text-teal-300">{o.siglas}</span> : null}
              </p>
              <p className="mt-1 text-[12px] leading-5 text-zinc-400">{o.rol}</p>
            </li>
          ))}
        </ul>
      </section>

      <aside className="mt-8 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300">Antes de confiar en un número</p>
        <p className="mt-1.5 text-[13px] leading-6 text-zinc-300">{NOTA_VERIFICACION}</p>
      </aside>
    </>
  );
}
