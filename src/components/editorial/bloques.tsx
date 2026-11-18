// ═══════════════════════════════════════════════════════════════════
// v406.3 EL CUERPO DE UN ARTÍCULO — de bloques tipados a HTML semántico.
// Componente de servidor: cero JavaScript en el cliente. Cada bloque tiene
// su etiqueta correcta (h2 con ancla, ol/ul, table con caption, blockquote,
// dl para fichas de datos) para que lectores de pantalla y buscadores lean
// la pieza igual que una persona.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import type { Articulo, Bloque } from "@/lib/editorial/tipos";
import { FECHA_ES, TIPO_ES, minutosLectura } from "@/lib/editorial";
import { area } from "@/lib/editorial/areas";

export function CuerpoArticulo({ bloques }: { bloques: Bloque[] }) {
  return (
    <div className="ed-cuerpo">
      {bloques.map((b, i) => {
        switch (b.t) {
          case "p":
            return <p key={i}>{b.x}</p>;
          case "h2":
            return (
              <h2 key={i} id={b.id}>
                {b.x}
              </h2>
            );
          case "lista":
            return b.numerada ? (
              <ol key={i} className="ed-lista">
                {b.items.map((x, j) => (
                  <li key={j}>{x}</li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="ed-lista">
                {b.items.map((x, j) => (
                  <li key={j}>{x}</li>
                ))}
              </ul>
            );
          case "datos":
            return (
              <aside key={i} className="ed-datos" aria-label={b.titulo ?? "Datos"}>
                {b.titulo && <p className="ed-datos-t">{b.titulo}</p>}
                <dl>
                  {b.filas.map(([k, v], j) => (
                    <div key={j}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </aside>
            );
          case "tabla":
            return (
              <div key={i} className="ed-tabla-env">
                <table className="ed-tabla">
                  <thead>
                    <tr>
                      {b.cab.map((c, j) => (
                        <th key={j} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.filas.map((fila, j) => (
                      <tr key={j}>
                        {fila.map((c, k) => (k === 0 ? <th key={k} scope="row">{c}</th> : <td key={k}>{c}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {b.nota && <p className="ed-nota">{b.nota}</p>}
              </div>
            );
          case "ranking":
            return (
              <figure key={i} className="ed-ranking">
                <figcaption>{b.titulo}</figcaption>
                <ol>
                  {b.filas.map((f) => (
                    <li key={f.href + f.pos} data-destacado={f.destacado ? "1" : undefined}>
                      <span className="ed-rk-pos">{f.pos}</span>
                      <Link href={f.href} className="ed-rk-nom">
                        {f.nombre}
                      </Link>
                      <span className="ed-rk-val">{f.valor}</span>
                    </li>
                  ))}
                </ol>
                {b.nota && <p className="ed-nota">{b.nota}</p>}
              </figure>
            );
          case "cita":
            return (
              <blockquote key={i} className="ed-cita">
                <p>«{b.x}»</p>
                <footer>{b.de}</footer>
              </blockquote>
            );
          case "aviso":
            return (
              <p key={i} className="ed-aviso" role="note">
                {b.x}
              </p>
            );
        }
      })}
    </div>
  );
}

/** Tarjeta de artículo para índices y relacionados. */
export function TarjetaArticulo({ a, grande = false }: { a: Articulo; grande?: boolean }) {
  const ar = area(a.area);
  return (
    <article className="ed-tarjeta" data-grande={grande ? "1" : undefined} style={{ ["--ed-acento" as string]: ar.color }}>
      <Link href={`/editorial/${a.slug}`} className="ed-tarjeta-enl">
        <img src={a.imagen} alt="" width={1408} height={704} loading="lazy" decoding="async" />
        <span className="ed-tarjeta-txt">
          <span className="ed-tarjeta-meta">
            <span className="ed-chip">{ar.nombre}</span>
            <span className="ed-tipo" data-tipo={a.tipo}>
              {TIPO_ES[a.tipo]}
            </span>
          </span>
          <span className="ed-tarjeta-t">{a.titulo}</span>
          {grande && <span className="ed-tarjeta-e">{a.entradilla}</span>}
          <span className="ed-tarjeta-pie">
            {FECHA_ES(a.publicado)} · {minutosLectura(a)} min de lectura
          </span>
        </span>
      </Link>
    </article>
  );
}
