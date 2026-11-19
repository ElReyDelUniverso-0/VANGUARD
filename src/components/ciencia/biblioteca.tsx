"use client";

// ============================================================
// v421.9 MI ESTANTERÍA — lecturas guardadas en el navegador.
// Nada viaja al servidor: la lista vive en localStorage y se puede
// borrar con un botón. Si el navegador no lo permite, la página sigue
// funcionando (solo se pierde el guardado).
//
// El estado se lee con useSyncExternalStore: el servidor pinta la
// estantería vacía y el cliente la rellena al hidratar, sin mezclar
// dos verdades ni disparar renders en cascada.
// ============================================================

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { normalizar, rutaPublicacion } from "@/lib/ciencia/indice";

const CLAVE = "vanguard:ciencia:lecturas:v1";
const EVENTO = "vanguard:ciencia:estanteria";

function suscribir(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENTO, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENTO, cb);
  };
}

const leerCrudo = () => {
  try {
    return localStorage.getItem(CLAVE) ?? "[]";
  } catch {
    return "[]";
  }
};

function escribir(ids: string[]) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(ids));
  } catch {
    /* sin almacenamiento: no se guarda, pero la página no se rompe */
  }
  window.dispatchEvent(new Event(EVENTO));
}

function useEstanteria(): string[] {
  const crudo = useSyncExternalStore(suscribir, leerCrudo, () => "[]");
  return useMemo(() => {
    try {
      const v = JSON.parse(crudo);
      return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  }, [crudo]);
}

export type LecturaMinima = {
  id: string;
  titulo: string;
  anio: number;
  medio: string;
  tipo: string;
  nivelEtiqueta: string;
};

export function BotonGuardar({ id, titulo }: { id: string; titulo: string }) {
  const ids = useEstanteria();
  const guardado = ids.includes(id);
  return (
    <button
      type="button"
      className="vx-sc-guardar"
      aria-pressed={guardado}
      onClick={() => escribir(guardado ? ids.filter((x) => x !== id) : [...ids, id])}
      title={guardado ? `Quitar «${titulo}» de mi estantería` : `Guardar «${titulo}» en mi estantería`}
    >
      {guardado ? "★ Guardada en mi estantería" : "☆ Guardar en mi estantería"}
    </button>
  );
}

export function MiEstanteria({ lecturas }: { lecturas: LecturaMinima[] }) {
  const ids = useEstanteria();
  const [q, setQ] = useState("");

  const porId = useMemo(() => new Map(lecturas.map((l) => [l.id, l])), [lecturas]);
  const guardadas = ids.map((id) => porId.get(id)).filter((x): x is LecturaMinima => Boolean(x));
  const texto = normalizar(q);
  const catalogo = lecturas.filter((l) => !texto || normalizar(`${l.titulo} ${l.medio} ${l.anio}`).includes(texto));

  return (
    <div>
      <div className="vx-sc-panel" style={{ marginBottom: 12 }}>
        <div className="vx-sc-sellos" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Mi estantería ({guardadas.length})</h2>
          {guardadas.length > 0 ? (
            <button type="button" className="vx-sc-guardar" onClick={() => escribir([])}>
              Vaciar
            </button>
          ) : null}
        </div>
        {guardadas.length === 0 ? (
          <p style={{ marginBottom: 0, fontSize: 13 }}>
            Todavía no has guardado lecturas. Usa «☆ Guardar en mi estantería» en cualquier ficha; la lista se queda en
            este navegador y puedes borrarla cuando quieras.
          </p>
        ) : (
          <ul style={{ margin: "8px 0 0", paddingLeft: 16, fontSize: 13.5, lineHeight: 1.6 }}>
            {guardadas.map((l) => (
              <li key={l.id}>
                <Link href={rutaPublicacion(l.id)} style={{ color: "#22d3ee" }}>
                  {l.titulo}
                </Link>{" "}
                <span className="vx-sc-hueco">
                  · {l.anio} · {l.medio}
                </span>{" "}
                <button
                  type="button"
                  onClick={() => escribir(ids.filter((x) => x !== l.id))}
                  style={{ background: "none", border: 0, color: "#6d7f94", cursor: "pointer", fontSize: 12 }}
                  aria-label={`Quitar ${l.titulo} de la estantería`}
                >
                  quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="vx-sc-panel">
        <h2>Añadir desde el catálogo</h2>
        <label htmlFor="sc-biblioteca-q" className="vx-sc-kicker">
          Filtrar
        </label>
        <input
          id="sc-biblioteca-q"
          type="search"
          className="vx-sc-campo"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="título, revista, año…"
          style={{ margin: "4px 0 10px" }}
        />
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
          {catalogo.slice(0, 60).map((l) => {
            const dentro = ids.includes(l.id);
            return (
              <li key={l.id} style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="vx-sc-guardar"
                  aria-pressed={dentro}
                  onClick={() => escribir(dentro ? ids.filter((x) => x !== l.id) : [...ids, l.id])}
                  style={{ padding: "3px 8px" }}
                  aria-label={dentro ? `Quitar ${l.titulo}` : `Guardar ${l.titulo}`}
                >
                  {dentro ? "★" : "☆"}
                </button>
                <Link href={rutaPublicacion(l.id)} style={{ color: "#d6dfea", fontSize: 13, textDecoration: "none" }}>
                  {l.titulo}
                </Link>
                <span className="vx-sc-hueco">
                  {l.anio} · {l.medio} · {l.nivelEtiqueta}
                </span>
              </li>
            );
          })}
        </ul>
        {catalogo.length > 60 ? <p className="vx-sc-hueco">Mostrando 60 de {catalogo.length}: afina el filtro.</p> : null}
      </div>
    </div>
  );
}
