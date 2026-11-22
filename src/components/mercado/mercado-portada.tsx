// ═══════════════════════════════════════════════════════════════════
// v438.3 · LA FRANJA DE LA PORTADA, CON TOLDO Y PREGÓN
//
// El Dueño dijo que no había visto nada de lo añadido. Parte de la culpa era
// de la portada: la franja del mercado seguía siendo una fila de etiquetas
// pequeñas. Ahora la franja tiene toldo de rayas, guirnalda de farolillos, el
// pregón del día escrito en grande y una entrada que se ve sin buscarla.
//
// Es de SERVIDOR (cero JavaScript): diez enlaces de verdad —uno por familia, a
// su puesto— y uno al mercado entero.
// ═══════════════════════════════════════════════════════════════════

import Link from "next/link";
import type { CSSProperties } from "react";
import "./mercado.css";
import { PUESTOS, cifrasMercado } from "@/lib/mercado/puestos";
import { Emblema } from "@/components/mercado/emblema";
import { pregonDelDia } from "@/lib/mercado/pregon";

export function MercadoPortada() {
  const cifras = cifrasMercado();
  const pregon = pregonDelDia();
  return (
    <section id="mercado" className="mp-franja" aria-labelledby="mp-franja-h">
      <div className="mp-toldo-grande" aria-hidden>
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="mp-franja-cab">
        <h2 id="mp-franja-h">El mercado de Vanguard</h2>
        <p>
          {cifras.puestos} puestos · {cifras.agentes} agentes · {cifras.emblemas} emblemas · {cifras.secciones} secciones
        </p>
      </div>

      {/* el pregón del día: escrito, no desfilando (la portada no se mueve sola) */}
      <p className="mp-pregon">
        <span>pregón de hoy</span>
        <b style={{ ["--mp-color" as string]: pregon.puesto.color } as CSSProperties}>{pregon.texto}</b>
      </p>

      {/* v438.1 · cada toldo abre ESE puesto en la plaza (#puesto-id) */}
      <ul className="mp-toldos">
        {PUESTOS.map((p) => (
          <li key={p.id}>
            <Link
              className="mp-toldo"
              href={`/mercado#puesto-${p.id}`}
              style={{ ["--mp-color" as string]: p.color } as CSSProperties}
              title={`${p.nombre} · ${p.agente.nombre}, ${p.agente.oficio}`}
            >
              <Emblema tipo={p.agente.emblema} color={p.color} nombre={p.agente.nombre} className="mp-toldo-emblema" />
              <span>{p.nombre}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mp-franja-pie">
        <p>
          Diez familias, diez puestos y un agente de la casa en cada uno, con su emblema delante y
          todas sus secciones. Pregón en la entrada, ronda guiada, cesta para apuntar y música de
          feria, si la quieres.
        </p>
        <Link className="mp-entrar" href="/mercado">
          entrar al mercado →
        </Link>
      </div>
    </section>
  );
}
