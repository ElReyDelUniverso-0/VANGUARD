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
    <section aria-label={titulo} className="vx-enl mt-6">
      <p className="vx-enl-t">
        {titulo}
      </p>
      <div className="vx-enl-lista">
        {enlaces.map((e) => (
          <Link
            key={`${e.tipoRelacion}-${e.ruta}`}
            href={e.ruta}
            title={e.motivo}
            className="vx-enl-chip"
          >
            {e.etiqueta}
          </Link>
        ))}
      </div>
    </section>
  );
}
