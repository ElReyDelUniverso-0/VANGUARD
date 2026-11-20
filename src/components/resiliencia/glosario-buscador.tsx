"use client";

// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · EL GLOSARIO BUSCABLE
//
// Un glosario de 35 términos que solo se lee en orden no es un glosario: es
// un rollo. El filtro es local (los términos ya vinieron en el HTML) y la
// búsqueda ignora acentos, porque quien busca «resiliencia» también escribe
// «resilencia» con las manos temblando.
// ═══════════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import type { Termino } from "@/lib/resiliencia/glosario";

function sinTildes(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function GlosarioBuscador({ terminos, temas }: { terminos: Termino[]; temas: { clave: string; nombre: string }[] }) {
  const [q, setQ] = useState("");
  const [tema, setTema] = useState<string>("");

  const filtrados = useMemo(() => {
    const termo = sinTildes(q.trim());
    return terminos.filter((t) => {
      if (tema && t.tema !== tema) return false;
      if (!termo) return true;
      return sinTildes(`${t.t} ${t.d} ${t.u}`).includes(termo);
    });
  }, [q, tema, terminos]);

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex-1">
          <span className="sr-only">Buscar en el glosario</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar: amenaza, alerta, resiliencia, simulacro…"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-[14px] text-zinc-100 placeholder:text-zinc-600 focus:border-teal-500/50 focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTema("")}
            aria-pressed={tema === ""}
            className={`rounded-full border px-2.5 py-1 text-[11.5px] ${
              tema === "" ? "border-teal-500/50 bg-teal-500/10 text-teal-200" : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            todos
          </button>
          {temas.map((t) => (
            <button
              key={t.clave}
              type="button"
              onClick={() => setTema(t.clave === tema ? "" : t.clave)}
              aria-pressed={tema === t.clave}
              className={`rounded-full border px-2.5 py-1 text-[11.5px] ${
                tema === t.clave ? "border-teal-500/50 bg-teal-500/10 text-teal-200" : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.nombre}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
        {filtrados.length} de {terminos.length} términos
      </p>

      <dl className="mt-4 space-y-2">
        {filtrados.map((t) => (
          <div key={t.t} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <dt className="flex flex-wrap items-baseline gap-2">
              <span className="text-[14px] font-semibold text-zinc-100">{t.t}</span>
              <span className="rounded border border-zinc-800 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-zinc-500">
                {t.tema}
              </span>
            </dt>
            <dd className="mt-1.5 text-[13px] leading-6 text-zinc-300">{t.d}</dd>
            <dd className="mt-1.5 text-[12px] leading-5 text-teal-200/80">{t.u}</dd>
          </div>
        ))}
        {filtrados.length === 0 ? (
          <p className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-[13px] text-zinc-400">
            Ese término todavía no está en el glosario. Si debería estarlo, es una línea más en{" "}
            <span className="font-mono text-[12px] text-zinc-300">src/lib/resiliencia/glosario.ts</span>.
          </p>
        ) : null}
      </dl>
    </div>
  );
}
