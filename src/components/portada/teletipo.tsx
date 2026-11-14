// v401 — EL TELETIPO: la cinta de cables de siempre, ahora con titulares reales
// que se pueden tocar. Una sola línea, se pausa al pasar el ratón.
import Link from "next/link";
import type { Nota } from "@/lib/portada/notas";
import { horaCorta } from "@/lib/portada/clasificar";

export function Teletipo({ notas }: { notas: Nota[] }) {
  const lista = notas.slice(0, 14);
  if (!lista.length) return null;
  const pista = [...lista, ...lista]; // doble para el bucle continuo
  return (
    <div className="vx-tele" aria-label="Teletipo de última hora">
      <span className="vx-tele-et">
        <span className="vx-punto" /> CABLES
      </span>
      <div className="vx-tele-pista">
        {pista.map((n, i) => (
          <Link key={n.id + i} href={`/lectura/${n.id}`} aria-hidden={i >= lista.length ? true : undefined} tabIndex={i >= lista.length ? -1 : undefined}>
            <time dateTime={n.fecha}>{horaCorta(n.fecha)}</time>
            {n.titulo}
          </Link>
        ))}
      </div>
    </div>
  );
}
