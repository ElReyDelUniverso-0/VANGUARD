import Link from "next/link";
import { FAMILIA_NEXO, type Nexo } from "@/lib/arquitectura/nexos";

// ═══════════════════════════════════════════════════════════════════
// v412.0 · LA BANDA DE NEXOS — «sigue por aquí», con el motivo escrito
//
// No es una lista de enlaces: cada salida dice qué hay al otro lado y por
// qué se enlaza desde aquí. Se monta en las fichas de laboratorio y en las
// fichas de país, que eran los dos nodos más ricos y más aislados de la casa.
// Componente de servidor: cero JavaScript enviado al visitante.
// ═══════════════════════════════════════════════════════════════════

export function BandaNexos({
  nexos,
  titulo = "Sigue por aquí",
  nota,
}: {
  nexos: Nexo[];
  titulo?: string;
  nota?: string;
}) {
  if (nexos.length === 0) return null;
  return (
    <section className="mt-12 border-t border-zinc-800 pt-6" aria-labelledby="banda-nexos">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="banda-nexos" className="font-orbitron text-lg font-black text-zinc-100">
          {titulo}
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {nexos.length} salidas · cada una dice qué hay al otro lado
        </p>
      </div>
      {nota ? <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-zinc-500">{nota}</p> : null}
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {nexos.map((n) => {
          const f = FAMILIA_NEXO[n.familia];
          return (
            <li key={n.ruta} className="rounded border border-zinc-800 bg-zinc-900/40 p-3 transition-colors hover:border-amber-400/40">
              <Link href={n.ruta} className="block focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/60">
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.2em]"
                  style={{ color: f.color }}
                >
                  {f.nombre}
                </span>
                <span className="mt-1 block text-[13px] font-semibold text-zinc-200">{n.etiqueta}</span>
                <span className="mt-1 block text-[11px] leading-snug text-zinc-500">{n.porque}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
