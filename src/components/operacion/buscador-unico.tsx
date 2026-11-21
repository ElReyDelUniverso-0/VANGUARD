"use client";

// ═══════════════════════════════════════════════════════════════════
// v433.0 · EL BUSCADOR ÚNICO — mandato del Dueño: «hay muchos sitios de
// búsqueda, mucho menú; un solo».
//
// La casa tenía: ⌘K en la cabecera, /ciencia/buscar, /memoria/buscar,
// /conocimiento/enciclopedia/buscar, la lupa de Zona Cero, /directorio y el
// buscador de sección de cada sala. Seis puertas para lo mismo.
//
// Aquí hay UNA: indexa en el navegador las salas de los siete módulos y las
// salas del cuartel (que sigue funcionando por dentro), y pregunta a la casa
// por las noticias vivas cuando escribes tres letras o más. Sin servidor
// propio, sin índice inventado: todo sale de los registros reales.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MODULOS } from "@/components/portada/modulos";
import { CONSTELACIONES } from "@/lib/vanguard/mapa-salas";

type Hit = { href: string; nombre: string; grupo: string; nota?: string };

const plano = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** El índice completo, montado una sola vez desde los registros de la casa. */
const INDICE: Hit[] = (() => {
  const salas: Hit[] = [];
  const vistos = new Set<string>();
  for (const m of MODULOS) {
    for (const p of m.pestanas) {
      if (vistos.has(p.href)) continue;
      vistos.add(p.href);
      salas.push({ href: p.href, nombre: p.label, grupo: m.nombre, nota: p.txt });
    }
  }
  const cuartel: Hit[] = [];
  for (const c of CONSTELACIONES) {
    for (const s of c.salas) {
      if (vistos.has(`/sala/${s.clave}`)) continue;
      vistos.add(`/sala/${s.clave}`);
      cuartel.push({
        href: `/sala/${s.clave}`,
        nombre: s.corto || s.nombre,
        grupo: `Cuartel · ${c.nombre}`,
        nota: c.desc,
      });
    }
  }
  return [...salas, ...cuartel];
})();

export function BuscadorUnico() {
  const [q, setQ] = useState("");
  const [cables, setCables] = useState<{ titulo: string; href: string; fuente?: string }[]>([]);
  const [buscando, setBuscando] = useState(false);
  const t = plano(q.trim());

  const locales = useMemo(() => {
    if (t.length < 2) return [];
    return INDICE.filter((h) => plano(h.nombre).includes(t) || plano(h.href).includes(t)).slice(0, 60);
  }, [t]);

  useEffect(() => {
    if (t.length < 3) {
      setCables([]);
      return;
    }
    const c = new AbortController();
    setBuscando(true);
    fetch(`/api/noticias?q=${encodeURIComponent(q.trim())}`, { signal: c.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const lista = Array.isArray(d?.items) ? d.items : Array.isArray(d?.noticias) ? d.noticias : [];
        setCables(
          lista.slice(0, 8).map((n: { id?: string; t?: string; titulo?: string; f?: string; fuente?: string }) => ({
            titulo: n.t ?? n.titulo ?? "(sin titular)",
            href: n.id ? `/noticia/${n.id}` : "/en-vivo",
            fuente: n.fuente ?? n.f,
          })),
        );
      })
      .catch(() => setCables([]))
      .finally(() => setBuscando(false));
    return () => c.abort();
  }, [t, q]);

  const grupos = useMemo(() => {
    const g = new Map<string, Hit[]>();
    for (const h of locales) {
      const l = g.get(h.grupo) ?? [];
      l.push(h);
      g.set(h.grupo, l);
    }
    return [...g.entries()];
  }, [locales]);

  return (
    <div className="op-buscar">
      <header className="op-buscar-cab">
        <p className="op-buscar-sello">Buscador único · un solo sitio</p>
        <h1 className="op-buscar-titulo">Buscar en toda la casa</h1>
        <p className="op-buscar-lema">
          {INDICE.length} salas indexadas de los siete módulos y del cuartel, más las noticias vivas. No hay un segundo
          buscador en Vanguard: este es el de todas.
        </p>
        <div className="op-buscar-caja">
          <label htmlFor="op-b">Buscar</label>
          <input
            id="op-b"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="lingua, arsenal, misión, petróleo, Ucrania…"
            autoComplete="off"
            autoFocus
            spellCheck={false}
          />
          <span aria-live="polite" className="op-buscar-cuenta">
            {t.length < 2 ? "escribe dos letras" : `${locales.length} salas${cables.length ? ` · ${cables.length} cables` : ""}`}
          </span>
        </div>
      </header>

      {t.length >= 2 && grupos.length === 0 && cables.length === 0 && (
        <p className="op-buscar-vacio">Nada con «{q.trim()}».</p>
      )}

      {cables.length > 0 && (
        <section className="op-buscar-grupo" aria-labelledby="op-cables">
          <h2 id="op-cables">
            Cables vivos <span>{buscando ? "buscando…" : cables.length}</span>
          </h2>
          <ul>
            {cables.map((c, i) => (
              <li key={`${c.href}-${i}`}>
                <Link href={c.href}>
                  <b>{c.titulo}</b>
                  {c.fuente && <span>{c.fuente}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {grupos.map(([nombre, hits]) => (
        <section key={nombre} className="op-buscar-grupo">
          <h2>
            {nombre} <span>{hits.length}</span>
          </h2>
          <ul>
            {hits.map((h) => (
              <li key={h.href}>
                <Link href={h.href}>
                  <b>{h.nombre}</b>
                  {h.nota && <span>{h.nota}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {t.length < 2 && (
        <section className="op-buscar-grupo">
          <h2>Todo el sistema</h2>
          <ul className="op-buscar-atajos">
            {MODULOS.map((m) => (
              <li key={m.id}>
                <Link href={m.nav}>
                  <b>{m.nombre}</b>
                  <span>{m.lema}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/orden">
                <b>Orden de batalla</b>
                <span>El documento único con todas las divisiones y salas</span>
              </Link>
            </li>
          </ul>
        </section>
      )}
    </div>
  );
}
