"use client";

// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · LAS LISTAS QUE SE PUEDEN MARCAR
//
// El único JavaScript de las secciones del centro, y con un propósito
// concreto: una lista de preparación que no se puede marcar no se termina.
//
// DÓNDE SE GUARDA: en localStorage de este navegador, con una clave propia
// de la casa (`vg.resiliencia.listas`). No viaja a ningún servidor, no toca
// la base de datos, no sincroniza: lo que un vecino marca es suyo. Y se
// puede borrar con el botón, porque la preparación no puede ser un registro
// de la vida de nadie.
// ═══════════════════════════════════════════════════════════════════

import { useState } from "react";
import type { Lista } from "@/lib/resiliencia/listas";

const CLAVE = "vg.resiliencia.listas";

type Marcas = Record<string, string[]>;

function leer(): Marcas {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return {};
    const obj = JSON.parse(crudo) as unknown;
    if (!obj || typeof obj !== "object") return {};
    const salida: Marcas = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (Array.isArray(v)) salida[k] = v.filter((x): x is string => typeof x === "string");
    }
    return salida;
  } catch {
    return {};
  }
}

export function ListasPreparacion({ listas }: { listas: Lista[] }) {
  const [marcas, setMarcas] = useState<Marcas>({});
  const [abierta, setAbierta] = useState<string>(listas[0]?.id ?? "");
  const [listo, setListo] = useState(false);
  const [leido, setLeido] = useState(false);

  // se lee durante el render, una sola vez: en el servidor no hay localStorage
  // y devolvería el estado vacío, que es exactamente el primer frame correcto.
  if (!leido) {
    setLeido(true);
    const guardado = leer();
    if (Object.keys(guardado).length > 0) setMarcas(guardado);
  }

  function marcar(idLista: string, item: string) {
    setMarcas((prev) => {
      const actual = prev[idLista] ?? [];
      const siguiente = actual.includes(item) ? actual.filter((x) => x !== item) : [...actual, item];
      const nuevo: Marcas = { ...prev, [idLista]: siguiente };
      try {
        localStorage.setItem(CLAVE, JSON.stringify(nuevo));
      } catch {
        /* almacenamiento lleno o bloqueado: la lista se puede seguir usando */
      }
      return nuevo;
    });
  }

  function borrar() {
    try {
      localStorage.removeItem(CLAVE);
    } catch {
      /* nada que borrar */
    }
    setMarcas({});
    setListo(true);
    window.setTimeout(() => setListo(false), 1800);
  }

  const total = listas.reduce((t, l) => t + l.items.length, 0);
  const hechas = listas.reduce((t, l) => t + (marcas[l.id]?.length ?? 0), 0);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
        <p className="text-[12.5px] text-zinc-300">
          <span className="font-mono text-teal-300">
            {hechas}/{total}
          </span>{" "}
          casillas marcadas en este navegador.
        </p>
        <div className="flex items-center gap-2">
          <div aria-hidden className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-teal-400"
              style={{ width: `${total ? Math.round((hechas / total) * 100) : 0}%`, transition: "width 200ms linear" }}
            />
          </div>
          <button
            type="button"
            onClick={borrar}
            className="rounded border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400 hover:border-red-500/40 hover:text-red-300"
          >
            {listo ? "borrado" : "borrar todo"}
          </button>
        </div>
      </div>

      <div role="tablist" aria-label="Listas de preparación" className="mt-4 flex flex-wrap gap-2">
        {listas.map((l) => {
          const n = marcas[l.id]?.length ?? 0;
          return (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={abierta === l.id}
              onClick={() => setAbierta(l.id)}
              className={`rounded-full border px-3 py-1.5 text-[12px] ${
                abierta === l.id
                  ? "border-teal-500/50 bg-teal-500/10 text-teal-200"
                  : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              {l.titulo}
              <span className="ml-1.5 font-mono text-[10px] text-zinc-500">
                {n}/{l.items.length}
              </span>
            </button>
          );
        })}
      </div>

      {listas
        .filter((l) => l.id === abierta)
        .map((l) => {
          const marcados = marcas[l.id] ?? [];
          return (
            <section key={l.id} className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h3 className="text-[15px] font-semibold text-zinc-100">{l.titulo}</h3>
              <p className="mt-1 text-[12.5px] italic text-teal-200/80">{l.lema}</p>
              <p className="mt-2 text-[11.5px] text-zinc-500">
                Para: {l.paraQuien} · Tiempo: {l.tiempo}
              </p>
              <ul className="mt-4 space-y-1.5">
                {l.items.map((it, i) => {
                  const id = `${l.id}:${i}`;
                  const esta = marcados.includes(id);
                  return (
                    <li key={id}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-2 hover:border-zinc-800 hover:bg-zinc-950/50">
                        <input
                          type="checkbox"
                          checked={esta}
                          onChange={() => marcar(l.id, id)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-teal-400"
                        />
                        <span className={`text-[13px] leading-6 ${esta ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                          {it.texto}
                          {it.critico ? (
                            <span className="ml-1.5 rounded border border-red-500/30 bg-red-500/10 px-1 py-0.5 align-middle font-mono text-[9px] uppercase tracking-wider text-red-300">
                              crítico
                            </span>
                          ) : null}
                          {it.nota ? <span className="mt-0.5 block text-[11.5px] leading-5 text-zinc-500">{it.nota}</span> : null}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 border-t border-zinc-900 pt-3 text-[11px] text-zinc-600">Fuente: {l.fuente}</p>
            </section>
          );
        })}
    </div>
  );
}
