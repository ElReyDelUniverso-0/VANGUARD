// ============================================================
// v367.1 EL OJO DEL DUEÑO — FUENTE Y FECHA (LA CADENA DE LA VERDAD)
//
// Server-safe, CERO JavaScript: el pie de procedencia que toda sala de la
// casa puede montar para decir de dónde sale su dato y de cuándo es. Usa
// las piezas puras de src/lib/procedencia.ts (formato determinista en UTC,
// sin `Intl`: el servidor y el cliente pintan lo mismo → cero desajuste de
// hidratación) y el `<details>` nativo para la explicación larga.
//
// Por qué existe: la doctrina ya estaba (v234 guardia de fecha no fingida,
// v243 reduced-motion, GOD'S EYE con ventana de fuente original y fecha
// real) pero vivía en cada sala a su manera. Esto es el ÚTIL compartido:
// una sola forma de no mentir, para que la fusión de la casa hermana pueda
// aplicarla en toda la casa en vez de en una sola sala.
// ============================================================

import { selloProcedencia } from "@/lib/procedencia";

export function FuenteYFecha({
  fuente,
  publicado,
  consultado,
  licencia,
  nota,
  compacto = false,
}: {
  /** nombre real de la fuente («GDELT», «el archivo de la casa», «USGS») */
  fuente: string;
  /** cuándo se publicó el dato (si no hay, se declara «sin fecha de publicación») */
  publicado?: Date | string | number | null;
  /** cuándo lo leyó la casa (por defecto, ahora) */
  consultado?: Date | string | number;
  /** atribución/licencia cuando la fuente la exige (CC BY 4.0, etc.) */
  licencia?: string;
  /** una línea extra de honestidad de la sala */
  nota?: string;
  /** versión mínima: solo la línea, sin el desplegable */
  compacto?: boolean;
}) {
  const sello = selloProcedencia({ fuente, publicado: publicado ?? null, consultado });

  if (compacto) {
    return (
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">{sello}</p>
    );
  }

  return (
    <details className="group mt-3 rounded-sm border border-zinc-800 bg-zinc-900/40 px-3 py-2">
      <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 outline-none marker:content-none hover:text-zinc-300">
        <span className="text-amber/70">▸ CADENA DE LA VERDAD</span>{" "}
        <span className="text-zinc-600">— {sello}</span>
      </summary>
      <div className="mt-2 flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
        <span>
          FUENTE · <span className="text-zinc-300">{fuente}</span>
        </span>
        <span>
          PUBLICADO ·{" "}
          <span className="text-zinc-300">
            {publicado ? new Date(publicado).toISOString() : "SIN FECHA DE PUBLICACIÓN"}
          </span>
        </span>
        <span>
          LEÍDO · <span className="text-zinc-300">{new Date(consultado ?? Date.now()).toISOString()}</span>
        </span>
        {licencia ? (
          <span>
            ATRIBUCIÓN · <span className="text-zinc-300">{licencia}</span>
          </span>
        ) : null}
        {nota ? <span className="normal-case tracking-normal text-zinc-500">{nota}</span> : null}
        <span className="normal-case tracking-normal text-zinc-600">
          Si una fuente no responde, esta casa dice SIN SEÑAL. No rellena huecos con
          invenciones.
        </span>
      </div>
    </details>
  );
}
