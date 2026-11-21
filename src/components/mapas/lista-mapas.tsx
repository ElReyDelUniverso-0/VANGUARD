"use client";

// v436.5 · La lista de mapas, con buscador y filtro. Un índice que se recorre.
import Link from "next/link";
import { useMemo, useState } from "react";
import type { MapaDeLaCasa, Vista } from "@/lib/mapas/indice";

const ACENTO = "#FF9F45";
const VERDE = "#4ADE80";

const VISTAS: (Vista | "todas")[] = ["todas", "3D", "2D", "2D y 3D", "capas", "tablero"];

export function ListaMapas({ mapas }: { mapas: MapaDeLaCasa[] }) {
  const [q, setQ] = useState("");
  const [vista, setVista] = useState<Vista | "todas">("todas");

  const filtrados = useMemo(() => {
    const t = q
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    return mapas.filter((m) => {
      if (vista !== "todas" && m.vista !== vista) return false;
      if (!t) return true;
      const heno = `${m.nombre} ${m.pregunta} ${m.fuente} ${m.motor} ${m.modulo} ${m.ruta}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return t.split(/\s+/).every((parte) => heno.includes(parte));
    });
  }, [mapas, q, vista]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar un mapa: lenguas, divisas, teatros, infraestructura…"
          className="min-w-[240px] flex-1 rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-slate-600"
          aria-label="Buscar un mapa"
        />
        {VISTAS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVista(v)}
            className="rounded border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{
              borderColor: vista === v ? ACENTO : "#1e293b",
              color: vista === v ? ACENTO : "#94a3b8",
              background: vista === v ? "#1a1206" : "transparent",
            }}
          >
            {v}
          </button>
        ))}
      </div>

      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
        {filtrados.length} de {mapas.length} superficies
      </p>

      {filtrados.length === 0 && (
        <p className="rounded border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
          Ningún mapa de la casa responde a eso todavía. Si lo que buscas no está en la lista, es
          porque no existe: puedes hacerlo tú en el{" "}
          <Link href="/mapas/taller" className="underline" style={{ color: ACENTO }}>
            Taller de Mapas
          </Link>{" "}
          y publicarlo.
        </p>
      )}

      <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtrados.map((m, i) => (
          <li key={m.id}>
            <Link
              href={m.ruta}
              className="block h-full rounded border border-slate-800 bg-slate-950/60 p-3 transition-colors hover:border-slate-600"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-mono text-[10px] tracking-[0.18em]" style={{ color: ACENTO }}>
                  {String(i + 1).padStart(2, "0")} · {m.vista.toUpperCase()}
                </p>
                <span className="font-mono text-[10px] text-slate-500">{m.modulo}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-100">{m.nombre}</p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-500">{m.ruta}</p>
              <p className="mt-2 text-[12px] leading-snug text-slate-400">{m.pregunta}</p>
              <p className="mt-2 border-t border-slate-800 pt-2 text-[11px] leading-snug text-slate-500">
                <span style={{ color: VERDE }}>MOTOR</span> {m.motor}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-slate-500">
                <span style={{ color: VERDE }}>FUENTE</span> {m.fuente}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
