"use client";
// ═══════════════════════════════════════════════════════════════════
// v441.3 · ABANDONED WORLD — el explorador (única pieza de cliente)
// Filtra por categoría con un atributo data-filtro (el CSS oculta lo que
// no toca: cero re-render de las 35 fichas) y abre la ficha cuando se
// pulsa un punto del mapa o se llega con #lugar-id. Sin JS, los filtros
// son enlaces ?cat= que resuelve el servidor.
// ═══════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useState, type ReactNode } from "react";

export interface OpcionFiltro {
  id: string;
  nombre: string;
  color: string;
  cantidad: number;
}

export function ExploradorAbandonos({
  opciones,
  inicial,
  total,
  children,
}: {
  opciones: OpcionFiltro[];
  inicial: string;
  total: number;
  children: ReactNode;
}) {
  const [filtro, setFiltro] = useState(inicial);

  const elegir = useCallback((id: string) => {
    setFiltro(id);
    const url = new URL(window.location.href);
    if (id === "todos") url.searchParams.delete("cat");
    else url.searchParams.set("cat", id);
    url.hash = "";
    window.history.replaceState(null, "", url.toString());
  }, []);

  useEffect(() => {
    const abrir = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      if (!h.startsWith("lugar-")) return;
      const el = document.getElementById(h);
      if (!(el instanceof HTMLDetailsElement)) return;
      const cat = el.dataset.cat;
      setFiltro((f) => (f !== "todos" && f !== cat ? "todos" : f));
      el.open = true;
      requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
    };
    abrir();
    window.addEventListener("hashchange", abrir);
    return () => window.removeEventListener("hashchange", abrir);
  }, []);

  const todas: OpcionFiltro[] = [{ id: "todos", nombre: "Todos", color: "#ebe5d6", cantidad: total }, ...opciones];

  return (
    <div className="aw-explorador" data-filtro={filtro}>
      <div className="aw-filtros" role="group" aria-label="Filtrar por categoría">
        {todas.map((o) => (
          <a
            key={o.id}
            href={o.id === "todos" ? "?" : `?cat=${o.id}`}
            className="aw-filtro"
            role="button"
            aria-pressed={filtro === o.id}
            style={{ ["--c" as string]: o.color }}
            onClick={(e) => {
              e.preventDefault();
              elegir(o.id);
            }}
          >
            <i aria-hidden="true" />
            {o.nombre} <small>{o.cantidad}</small>
          </a>
        ))}
      </div>
      {children}
    </div>
  );
}
