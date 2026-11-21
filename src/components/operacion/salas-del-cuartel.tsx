// ═══════════════════════════════════════════════════════════════════
// v433.0 · EL CUARTEL, DISUELTO EN EL ÍNDICE
//
// El Dueño: «que el cuartel no exista, porque todos los módulos comparten un
// solo universo». El cuartel no era un módulo: era un CAJÓN con 155 salas
// dentro de una sola página (/cuartel?sala=…), al que solo se llegaba entrando
// a «Juego» y bajando. Ahí estaban los módulos buenos y olvidados.
//
// Este bloque publica esas 155 salas donde se ven: dentro del índice, por
// constelación, con su nombre y su enlace real. El cuartel deja de ser un
// destino y pasa a ser lo que siempre fue por dentro: el motor de esas salas.
// Se renderiza en el servidor: cero JavaScript.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { CONSTELACIONES } from "@/lib/vanguard/mapa-salas";

export function SalasDelCuartel() {
  const total = CONSTELACIONES.reduce((t, c) => t + c.salas.length, 0);
  return (
    <section id="d-cuartel" className="op-cuartel" aria-labelledby="op-cuartel-h">
      <div className="op-div-cab">
        <span className="op-div-codigo">D-VIII</span>
        <h2 id="op-cuartel-h">El cuartel, disuelto</h2>
        <span className="op-div-cuenta">
          {CONSTELACIONES.length} constelaciones · {total} salas
        </span>
      </div>
      <p className="op-div-lema">
        Las {total} salas que vivían encerradas en el cuartel. Ya no hay que entrar a «Juego» y bajar: están aquí,
        con su nombre y su enlace. El cuartel deja de ser un sitio y pasa a ser el motor que las abre.
      </p>
      <div className="op-cuartel-rejilla">
        {CONSTELACIONES.map((c) => (
          <article key={c.clave} className="op-cuartel-c">
            <h3>{c.nombre}</h3>
            <p>{c.desc}</p>
            <ul>
              {c.salas.map((s) => (
                <li key={s.clave}>
                  <Link href={`/cuartel?sala=${s.clave}`}>{s.corto || s.nombre}</Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
