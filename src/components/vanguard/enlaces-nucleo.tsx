// ============================================================
// v218.0 EL NÚCLEO — ENLACES CONTEXTUALES (server, cero JS)
// Los chips «RELACIONADO EN VANGUARD» que montan las páginas
// server (/conflicto/[tag], /noticia/[id], /nucleo?id=…).
// Server-rendered: sin hidratación, sin petición extra — la
// relación se calcula en el mismo render con relaciones.ts.
// ============================================================

import Link from "next/link";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

export function EnlacesNucleo({
  enlaces,
  titulo = "RELACIONADO EN VANGUARD",
}: {
  enlaces: EnlaceContextual[];
  titulo?: string;
}) {
  if (enlaces.length === 0) return null;
  return (
    <section aria-label={titulo} className="mt-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
        {titulo}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {enlaces.map((e) => (
          <Link
            key={`${e.tipoRelacion}-${e.ruta}`}
            href={e.ruta}
            title={e.motivo}
            className="inline-flex items-center rounded-sm border border-zinc-700 bg-zinc-900/70 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-amber-hud hover:text-amber"
          >
            {e.etiqueta}
          </Link>
        ))}
      </div>
    </section>
  );
}
