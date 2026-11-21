"use client";

// ═══════════════════════════════════════════════════════════════════
// v432.0 · EL ÍNDICE ÚNICO — todo el sistema en un solo cuerpo
//
// Una sola pantalla: siete divisiones, todos los módulos y todas las salas
// reales, con su código. Buscador que filtra mientras escribes. Y arriba, lo
// que estaba enterrado en el cuartel, con nombre y apellido.
//
// No es una lista de botones sueltos: es un orden de batalla. Cada línea tiene
// su código (D-I-M01) y su destino; nada compite con nada.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { useMemo, useState } from "react";
import { ARBOL, RESCATADAS, TOTAL_MODULOS, TOTAL_SALAS } from "@/lib/operacion/orden";

const normal = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function OrdenDeBatalla() {
  const [q, setQ] = useState("");
  const busqueda = normal(q.trim());

  const arbol = useMemo(() => {
    if (!busqueda) return ARBOL;
    return ARBOL.map((d) => {
      const divCasa = normal(d.nombre).includes(busqueda) || normal(d.lema).includes(busqueda);
      const modulos = d.modulosResueltos
        .map((m) => {
          const modCasa = divCasa || normal(m.nombre).includes(busqueda) || normal(m.lema).includes(busqueda);
          const salas = modCasa ? m.salas : m.salas.filter((s) => normal(s.nombre).includes(busqueda) || normal(s.href).includes(busqueda));
          return { ...m, salas };
        })
        .filter((m) => m.salas.length > 0);
      const salas = modulos.reduce((t, m) => t + m.salas.length, 0);
      return { ...d, modulosResueltos: modulos, salas };
    }).filter((d) => d.salas > 0);
  }, [busqueda]);

  const encontradas = arbol.reduce((t, d) => t + d.salas, 0);
  const rescatadas = busqueda
    ? RESCATADAS.filter((r) => normal(r.nombre).includes(busqueda) || normal(r.nota).includes(busqueda))
    : RESCATADAS;

  return (
    <div className="op-orden">
      <header className="op-orden-cab">
        <p className="op-orden-sello">Orden de batalla · documento único</p>
        <h1 className="op-orden-titulo">
          Toda la casa, en un solo cuerpo
        </h1>
        <p className="op-orden-lema">
          {ARBOL.length} divisiones · {TOTAL_MODULOS} módulos · {TOTAL_SALAS} salas distintas. Antes eran 13 botones en la cabecera y 94
          pestañas donde varias apuntaban al mismo sitio. Ahora cada cosa tiene su código y su sitio, y nada tapa a nada.
        </p>
        <div className="op-orden-buscador">
          <label htmlFor="op-q">Buscar en la casa</label>
          <input
            id="op-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="lingua, arsenal, radio, 3D, misión…"
            autoComplete="off"
            spellCheck={false}
          />
          <span aria-live="polite" className="op-orden-cuenta">
            {busqueda ? `${encontradas} salas` : `${TOTAL_SALAS} salas`}
          </span>
        </div>
      </header>

      {rescatadas.length > 0 && (
        <section className="op-rescatadas" aria-labelledby="op-resc">
          <h2 id="op-resc">Salas que estaban enterradas en el cuartel</h2>
          <p className="op-rescatadas-nota">
            Estaban ahí, buenas, y solo se llegaba entrando a «Juego» y bajando. Suben a la superficie con su nombre.
          </p>
          <ul>
            {rescatadas.map((r) => (
              <li key={r.href + r.nombre}>
                <Link href={r.href}>
                  <b>{r.nombre}</b>
                  <span>{r.nota}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {arbol.map((d) => (
        <section key={d.id} id={`d-${d.id}`} className="op-div" aria-labelledby={`h-${d.id}`}>
          <div className="op-div-cab">
            <span className="op-div-codigo">{d.codigo}</span>
            <h2 id={`h-${d.id}`}>{d.nombre}</h2>
            <span className="op-div-cuenta">
              {d.modulosResueltos.length} módulos · {d.salas} salas
            </span>
          </div>
          <p className="op-div-lema">{d.lema}</p>
          <div className="op-div-cuerpo">
            {d.modulosResueltos.map((m) => (
              <article key={m.id} className="op-mod">
                <div className="op-mod-cab">
                  <span className="op-mod-codigo">{m.codigo}</span>
                  <h3>
                    <Link href={m.nav}>{m.nombre}</Link>
                  </h3>
                </div>
                <p className="op-mod-lema">{m.lema}</p>
                <ul className="op-mod-salas">
                  {m.salas.map((s) => (
                    <li key={s.href}>
                      <Link href={s.href}>{s.nombre}</Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ))}

      {arbol.length === 0 && (
        <p className="op-orden-vacio">
          Nada con «{q}». <button type="button" onClick={() => setQ("")}>Limpiar</button>
        </p>
      )}
    </div>
  );
}
