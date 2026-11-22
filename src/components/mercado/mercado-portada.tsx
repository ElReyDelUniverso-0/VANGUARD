// ═══════════════════════════════════════════════════════════════════
// v437.2 · LA FRANJA DEL MERCADO EN LA PORTADA
//
// Orden del Dueño: las diez familias «ocupan mucho espacio» en la entrada y
// «quítalos del menú principal». Aquí queda lo que la portada necesita para no
// perder la puerta: una sola franja, de una fila, con los diez toldos en
// miniatura y una entrada grande. El resto vive en `/mercado`.
//
// Es de SERVIDOR: cero JavaScript. Diez enlaces de verdad (uno por familia, a
// su puerta) y uno al mercado entero.
// ═══════════════════════════════════════════════════════════════════

import Link from "next/link";
import type { CSSProperties } from "react";
import "./mercado.css";
import { PUESTOS, cifrasMercado } from "@/lib/mercado/puestos";

export function MercadoPortada() {
  const cifras = cifrasMercado();
  return (
    <section id="mercado" className="mp-franja" aria-labelledby="mp-franja-h">
      <div className="mp-franja-cab">
        <h2 id="mp-franja-h">El mercado de Vanguard</h2>
        <p>
          {cifras.puestos} puestos · {cifras.mercaderes} mercaderes · {cifras.secciones} secciones
        </p>
      </div>

      {/* v438.1 · cada toldo abre ESE puesto en la plaza (#puesto-id) */}
      <ul className="mp-toldos">
        {PUESTOS.map((p) => (
          <li key={p.id}>
            <Link
              className="mp-toldo"
              href={`/mercado#puesto-${p.id}`}
              style={{ ["--mp-color" as string]: p.color } as CSSProperties}
              title={`${p.nombre} · ${p.personaje.nombre}, ${p.personaje.oficio}`}
            >
              <span>{p.nombre}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mp-franja-pie">
        <p>
          Diez familias, diez puestos y un mercader en cada uno que enseña lo suyo, con todas sus
          secciones. Pregón en la entrada, ronda guiada, cesta para apuntar y música propia de la
          plaza, si la quieres.
        </p>
        <Link className="mp-entrar" href="/mercado">
          entrar al mercado →
        </Link>
      </div>
    </section>
  );
}
