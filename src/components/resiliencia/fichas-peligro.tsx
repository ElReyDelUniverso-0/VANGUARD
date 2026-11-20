// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · LA VISTA DE PELIGROS
//
// Doce fichas, todas con el mismo esqueleto: qué es · cómo se mide · señales
// · exposición · cifras · mitos · qué lo reduce · fuente. El orden de las
// fichas es el del dato (PELIGROS); nadie reordena aquí, para que el día que
// se añada una ficha nadie tenga que acordarse de tocar este archivo.
// ═══════════════════════════════════════════════════════════════════

import Link from "next/link";
import { PELIGROS } from "@/lib/resiliencia/peligros";
import type { FichaPeligro } from "@/lib/resiliencia/tipos";
import { GUIA_POR_ID } from "@/lib/resiliencia/guias";
import { slug } from "./bloques";
import { Pictograma } from "./pictograma";

const COLOR_FAMILIA: Record<string, string> = {
  geológico: "text-orange-300 border-orange-500/30 bg-orange-500/10",
  hidrometeorológico: "text-sky-300 border-sky-500/30 bg-sky-500/10",
  climático: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  volcánico: "text-red-300 border-red-500/30 bg-red-500/10",
  ambiental: "text-teal-300 border-teal-500/30 bg-teal-500/10",
};

function Ficha({ p }: { p: FichaPeligro }) {
  const guia = GUIA_POR_ID[p.id];
  return (
    <article id={slug(p.nombre)} className="scroll-mt-20 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <header className="flex flex-wrap items-center gap-3">
        <span className="rounded-lg border border-zinc-700 bg-zinc-900 p-2">
          <Pictograma nombre={p.icono} className="h-5 w-5 text-teal-300" />
        </span>
        <h3 className="text-lg font-semibold text-zinc-100">{p.nombre}</h3>
        <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${COLOR_FAMILIA[p.familia] ?? "border-zinc-700 text-zinc-400"}`}>
          {p.familia}
        </span>
      </header>

      <p className="mt-3 text-[13.5px] leading-6 text-zinc-300">{p.queEs}</p>

      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Cómo se mide</p>
        <p className="mt-1 text-[13px] font-semibold text-zinc-100">{p.medicion.escala}</p>
        <p className="mt-1 text-[12.5px] leading-6 text-zinc-400">{p.medicion.texto}</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Señales que enseña el terreno</p>
          <ul className="mt-2 space-y-2">
            {p.senales.map((s, i) => (
              <li key={i} className="flex gap-2 text-[12.5px] leading-6 text-zinc-300">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-400" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Dónde está el peligro</p>
          <p className="mt-2 text-[12.5px] leading-6 text-zinc-300">{p.exposicion}</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-2 sm:grid-cols-3">
        {p.datos.map((d, i) => (
          <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
            <dt className="text-[11px] uppercase tracking-wide text-zinc-500">{d.etiqueta}</dt>
            <dd className="mt-1 font-mono text-base text-zinc-100">{d.valor}</dd>
            <dd className="mt-1 text-[11px] leading-5 text-zinc-500">{d.nota}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Mitos que matan</p>
        {p.mitos.map((m, i) => (
          <div key={i} className="grid gap-1 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 sm:grid-cols-2">
            <p className="text-[12.5px] leading-6 text-zinc-500">
              <span className="font-mono text-[10px] uppercase text-red-400">Mito · </span>
              {m.mito}
            </p>
            <p className="text-[12.5px] leading-6 text-zinc-200">
              <span className="font-mono text-[10px] uppercase text-teal-300">Realidad · </span>
              {m.realidad}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-teal-500/20 bg-teal-500/[0.05] p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-teal-300">Qué lo reduce</p>
        <ul className="mt-2 space-y-1.5">
          {p.reduccion.map((r, i) => (
            <li key={i} className="text-[12.5px] leading-6 text-zinc-300">
              {r}
            </li>
          ))}
        </ul>
      </div>

      <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-900 pt-3">
        {guia ? (
          <Link
            href={`/resiliencia/guias#${slug(guia.nombre)}`}
            className="rounded border border-zinc-700 px-2 py-1 text-[11.5px] text-zinc-200 hover:border-teal-500/50 hover:text-teal-200"
          >
            La guía de conducta: {guia.nombre}
          </Link>
        ) : null}
        <span className="text-[11px] text-zinc-600">Fuente: {p.fuente}</span>
      </footer>
    </article>
  );
}

export function FichasPeligro() {
  const familias: string[] = [];
  for (const p of PELIGROS) if (!familias.includes(p.familia)) familias.push(p.familia);

  return (
    <>
      <nav aria-label="Índice de peligros" className="mt-8 flex flex-wrap gap-2">
        {PELIGROS.map((p) => (
          <Link
            key={p.id}
            href={`#${slug(p.nombre)}`}
            className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[12px] text-zinc-300 hover:border-teal-500/40 hover:text-teal-200"
          >
            <Pictograma nombre={p.icono} className="h-3.5 w-3.5" />
            {p.nombre}
          </Link>
        ))}
      </nav>
      <p className="mt-4 text-[12px] text-zinc-500">
        {PELIGROS.length} fichas en {familias.length} familias de peligro · orden del dato, no de gravedad: ningún
        listado de este centro dice qué va a pasar ni dónde.
      </p>
      <div className="mt-6 space-y-4">
        {PELIGROS.map((p) => (
          <Ficha key={p.id} p={p} />
        ))}
      </div>
    </>
  );
}
