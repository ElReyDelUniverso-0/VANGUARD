"use client";

// v215.0 MODO TRADUCTOR EN CADA NOTICIA — el chip que rompe la barrera
// del idioma: traduce el titular y el resumen del cable a cualquiera de
// los 8 idiomas de Vanguard con el núcleo de la casa (POST /api/traductor).
// El destino queda recordado en el aparato (vg-traductor-idioma) — la
// próxima noticia ya nace en TU lengua con un solo toque.

import { useEffect, useState } from "react";
import { IDIOMAS_VANGUARD, nombreIdiomaMayus } from "@/lib/idiomas";

interface RespTraduccion {
  traduccion?: string;
  nota?: string;
  error?: string;
}

const STORAGE_KEY = "vg-traductor-idioma";

export function TraductorChip({ titulo, resumen }: { titulo: string; resumen: string }) {
  const [idioma, setIdioma] = useState("en");
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [tituloTr, setTituloTr] = useState("");
  const [resumenTr, setResumenTr] = useState("");
  const [nota, setNota] = useState("");
  const [error, setError] = useState("");

  // el idioma elegido la vez anterior vuelve solo (ley del aparato)
  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v && IDIOMAS_VANGUARD.some((i) => i.code === v)) setIdioma(v);
    } catch {
      /* sin almacenamiento no pasa nada */
    }
  }, []);

  const traducir = async () => {
    if (cargando) return;
    setCargando(true);
    setError("");
    setTituloTr("");
    setResumenTr("");
    setNota("");
    try {
      const r1 = await fetch("/api/traductor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: titulo.slice(0, 400), de: "es", a: idioma }),
      });
      const j1 = (await r1.json()) as RespTraduccion;
      if (j1.error) throw new Error(j1.error);
      setTituloTr(j1.traduccion ?? "");
      setNota(j1.nota ?? "");
      if (resumen.trim()) {
        const r2 = await fetch("/api/traductor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: resumen.slice(0, 600), de: "es", a: idioma }),
        });
        const j2 = (await r2.json()) as RespTraduccion;
        setResumenTr(j2.traduccion ?? "");
      }
      try {
        localStorage.setItem(STORAGE_KEY, idioma);
      } catch {
        /* noop */
      }
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "El traductor no responde — reintenta.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="font-mono text-[9px] uppercase tracking-widest rounded px-2 py-1 border border-sky-500/40 text-sky-300 hover:bg-sky-500/10 transition-colors"
        >
          Traducir ⇄ {abierto ? "▴" : "▾"}
        </button>
        {abierto && (
          <>
            <select
              value={idioma}
              onChange={(e) => setIdioma(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-sky-400"
              aria-label="Idioma de destino"
            >
              {IDIOMAS_VANGUARD.map((i) => (
                <option key={i.code} value={i.code}>
                  {i.nombre}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void traducir()}
              disabled={cargando}
              className={`font-mono text-[9px] uppercase tracking-widest rounded px-2 py-1 border transition-colors ${
                cargando
                  ? "border-sky-500/30 text-sky-500/50 cursor-wait"
                  : "border-sky-400/70 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
              }`}
            >
              {cargando ? "Traduciendo…" : `▸ ${nombreIdiomaMayus(idioma)}`}
            </button>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-[11px] text-red-300">{error}</p>}

      {tituloTr && (
        <div className="mt-2.5 border border-sky-500/40 bg-sky-500/5 rounded p-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-sky-300">
            Traducido por Vanguard ▸ {nombreIdiomaMayus(idioma)}
          </p>
          <p className="mt-1.5 text-[14px] font-bold leading-snug text-zinc-100">{tituloTr}</p>
          {resumenTr && (
            <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-300">{resumenTr}</p>
          )}
          {nota && <p className="mt-1.5 font-mono text-[9px] text-zinc-500">◈ {nota}</p>}
        </div>
      )}
    </div>
  );
}
