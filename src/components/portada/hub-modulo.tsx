// ============================================================
// v402.0 LOS CINCO MÓDULOS — EL VESTÍBULO DEL MÓDULO (servidor, cero JS)
// Las pestañas del módulo como tarjetas con ilustración de la casa: lo que
// antes eran salas sueltas y parecidas se ven como UNA casa con sus cuartos.
// Mismo uniforme que las salas de la portada (.vx-sala + esquinas de mira).
// ============================================================
import Link from "next/link";
import { MODULOS } from "./modulos";

export function HubModulo({
  modulo,
  actual,
  titulo,
  sello,
}: {
  modulo: string;
  actual?: string;
  titulo?: string;
  sello?: string;
}) {
  const m = MODULOS.find((x) => x.id === modulo);
  if (!m) return null;
  const salas = m.pestanas.filter((p) => p.href !== actual && p.img);
  return (
    <section className="vx vx-hub" aria-label={`Salas del módulo ${m.nombre}`}>
      <div className="vx-wrap">
        <div className="vx-sec-h">
          <div>
            <span className="vx-sello">{sello ?? `Módulo · ${m.nombre}`}</span>
            <h2>{titulo ?? m.lema}</h2>
          </div>
        </div>
        <div className="vx-hub-rejilla">
          {salas.map((p) => (
            <Link key={p.href} href={p.href} className="vx-sala vx-hub-sala">
              <span className="vx-mira vx-esquinas" aria-hidden />
              <div className="vx-sala-bg" style={{ backgroundImage: `url(${p.img})` }} />
              <span className="vx-sello">{p.vivo ? "● En vivo" : m.nombre}</span>
              <h3>{p.label}</h3>
              <p>{p.txt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
