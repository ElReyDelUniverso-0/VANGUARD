"use client";

// ============================================================
// v218.0 EL NÚCLEO — LA ISLA DE BÚSQUEDA GLOBAL
// Client ligero que pregunta a /api/nucleo/busqueda (debounce
// 350 ms, abort a 6 s — el patrón de la paleta v208). Server
// renderiza la página; esta isla SOLO la búsqueda interactiva.
// Estados honestos: buscando, sin red, vacío — jamás relleno.
// ============================================================

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Radio, AlertTriangle } from "lucide-react";
import { ETIQUETA_TIPO, type TipoEntidad } from "@/lib/nucleo/tipos";
import { cn } from "@/lib/utils";

interface Rdo {
  entidad?: { id: string; tipo: TipoEntidad; nombre: string };
  moduloId?: string;
  titulo: string;
  subtitulo: string;
  ruta: string;
  fecha?: string;
  origen: string;
}

interface Resp {
  ok: boolean;
  q: string;
  resultados?: Rdo[];
  fuentes?: { id: string; nombre: string; n: number; fallo?: boolean }[];
  error?: string;
}

const COLOR_TIPO: Record<TipoEntidad, string> = {
  pais: "text-emerald-400 border-emerald-500/40",
  region: "text-red-hud border-red-hud/40",
  acontecimiento: "text-cyan-hud border-cyan-hud/40",
  documento: "text-amber border-amber/40",
  fuente: "text-zinc-300 border-zinc-600",
  mapa: "text-sky-300 border-sky-400/40",
  analisis: "text-violet-400 border-violet-500/40",
  simulacion: "text-orange-300 border-orange-400/40",
};

export function NucleoBusqueda({ consultaInicial = "" }: { consultaInicial?: string }) {
  const [q, setQ] = useState(consultaInicial);
  const [resp, setResp] = useState<Resp | null>(null);
  const [estado, setEstado] = useState<"idle" | "buscando" | "sin-red">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  // consulta inicial por URL (?q=) — se consume UNA vez al montar
  useEffect(() => {
    const t = setTimeout(() => {
      if (consultaInicial) inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [consultaInicial]);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      const t = setTimeout(() => {
        setResp(null);
        setEstado("idle");
      }, 0);
      return () => clearTimeout(t);
    }
    let vivo = true;
    const ctrl = new AbortController();
    const corte = setTimeout(() => ctrl.abort(), 6000);
    const t = setTimeout(() => {
      setEstado("buscando");
      fetch(`/api/nucleo/busqueda?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((j: Resp) => {
          if (!vivo) return;
          setResp(j);
          setEstado("idle");
        })
        .catch(() => {
          if (!vivo) return;
          setResp(null);
          setEstado("sin-red");
        });
    }, 350);
    return () => {
      vivo = false;
      clearTimeout(corte);
      clearTimeout(t);
    };
  }, [q]);

  const resultados = resp?.ok ? resp.resultados ?? [] : [];
  const fuentes = resp?.ok ? resp.fuentes ?? [] : [];

  return (
    <div className="rounded-xl border border-amber-hud/50 bg-zinc-950/80">
      <div className="flex items-center gap-2 border-b border-amber-hud/40 px-4 py-3">
        <Search className="w-4 h-4 text-amber shrink-0" aria-hidden />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busca el planeta entero: países, teatros, cables, expedientes, audios…"
          className="flex-1 bg-transparent outline-none text-sm font-mono placeholder:text-zinc-600"
          aria-label="Búsqueda global del núcleo"
        />
        {q.trim().length >= 2 && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">
            {estado === "buscando" ? "buscando…" : `${resultados.length} rdos`}
          </span>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto p-2">
        {q.trim().length < 2 && (
          <p className="px-3 py-6 text-center font-mono text-[11px] uppercase tracking-widest text-zinc-600">
            El núcleo busca SOLO en fuentes autorizadas — nada privado, nada inventado
          </p>
        )}
        {q.trim().length >= 2 && estado === "buscando" && resultados.length === 0 && (
          <p className="px-3 py-4 font-mono text-[10px] uppercase tracking-widest text-cyan-hud/80">
            ◎ El núcleo pregunta a todas las fuentes…
          </p>
        )}
        {q.trim().length >= 2 && estado === "sin-red" && (
          <p className="px-3 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            ◎ Sin señal con el núcleo ahora — inténtalo de nuevo
          </p>
        )}
        {resp?.ok === false && resp.error && (
          <p className="px-3 py-4 font-mono text-[10px] uppercase tracking-widest text-red-hud/80">
            {resp.error}
          </p>
        )}
        {resultados.map((r, i) => {
          const tipo = r.entidad?.tipo;
          return (
            <Link
              key={`${r.origen}-${r.moduloId ?? r.entidad?.id ?? i}`}
              href={r.ruta}
              className="block px-3 py-2 rounded-md hover:bg-amber-hud/20 border border-transparent hover:border-amber-hud/50 transition-colors"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="block truncate text-[13px] font-bold text-zinc-100">{r.titulo}</span>
                {tipo && (
                  <span
                    className={cn(
                      "shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest",
                      COLOR_TIPO[tipo]
                    )}
                  >
                    {ETIQUETA_TIPO[tipo]}
                  </span>
                )}
              </span>
              <span className="block truncate font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                {r.subtitulo}
              </span>
            </Link>
          );
        })}
        {resp?.ok && q.trim().length >= 2 && resultados.length === 0 && estado === "idle" && (
          <p className="px-3 py-6 text-center text-sm text-zinc-500">
            Nada con «{resp.q}» en las fuentes del núcleo. Prueba con otra palabra.
          </p>
        )}
      </div>

      {/* honestidad: qué fuentes contestaron y cuáles fallaron */}
      {fuentes.length > 0 && (
        <div className="border-t border-zinc-800 px-4 py-2">
          <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
            <Radio className="w-3 h-3" aria-hidden /> fuentes consultadas
          </p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            {fuentes.map((f) => (
              <span key={f.id} className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                {f.fallo ? (
                  <span className="inline-flex items-center gap-1 text-zinc-700">
                    <AlertTriangle className="w-2.5 h-2.5" aria-hidden /> {f.nombre} sin respuesta
                  </span>
                ) : (
                  `${f.nombre} · ${f.n}`
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
