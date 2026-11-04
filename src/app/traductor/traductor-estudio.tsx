"use client";

// ════════════════════════════════════════════════════════════════
// v215.0 MODO TRADUCTOR — LOS IDIOMAS DE VANGUARD (client).
// El estudio: traduce cualquier texto con el núcleo de la casa
// (POST /api/traductor — IA con glosario táctico de emergencia) y
// baja los últimos cables REALES de /api/pulso para traducirlos al
// vuelo: «las noticias en vivo, en tu idioma». 8 idiomas, cero excusas.
// v236.0 LA PUERTA DEL CABLE: cada cable vivo abre SU sala
// /noticia/[id] — el id real viaja con el pulso (la sala EN VIVO solo
// sirve cables con origen real, externalId curated-* jamás pasan), así
// que la puerta jamás 404 por construcción.
// ════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { IDIOMAS_VANGUARD, nombreIdiomaMayus } from "@/lib/idiomas";

interface RespTraduccion {
  traduccion?: string;
  nota?: string;
  error?: string;
}

interface CablePulso {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
}

export function TraductorEstudio() {
  const [texto, setTexto] = useState("");
  const [de, setDe] = useState("es");
  const [a, setA] = useState("en");
  const [resultado, setResultado] = useState<RespTraduccion | null>(null);
  const [traduciendo, setTraduciendo] = useState(false);
  const [error, setError] = useState("");

  // los cables vivos para «las noticias en tu idioma»
  const [cables, setCables] = useState<CablePulso[]>([]);
  const [idiomaCables, setIdiomaCables] = useState("en"); // la agencia habla EN
  const [traducciones, setTraducciones] = useState<Record<string, RespTraduccion>>({});
  const [enCurso, setEnCurso] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const res = await fetch("/api/pulso", { cache: "no-store" });
        if (!res.ok) return;
        const j = (await res.json()) as { items?: CablePulso[] };
        if (vivo && Array.isArray(j.items)) setCables(j.items.slice(0, 8));
      } catch {
        /* el traductor funciona igual sin cables */
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const traducir = useCallback(async () => {
    const t = texto.trim();
    if (!t || traduciendo) return;
    setTraduciendo(true);
    setError("");
    setResultado(null);
    try {
      const res = await fetch("/api/traductor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: t, de, a }),
      });
      const j = (await res.json()) as RespTraduccion;
      if (!res.ok || j.error) setError(j.error || "El traductor no responde — reintenta en unos segundos.");
      else setResultado(j);
    } catch {
      setError("El traductor no responde — reintenta en unos segundos.");
    } finally {
      setTraduciendo(false);
    }
  }, [texto, de, a, traduciendo]);

  const traducirCable = useCallback(
    async (c: CablePulso) => {
      if (traducciones[c.id] || enCurso[c.id]) return;
      setEnCurso((prev) => ({ ...prev, [c.id]: true }));
      try {
        const res = await fetch("/api/traductor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: c.title.slice(0, 400), de: idiomaCables, a }),
        });
        const j = (await res.json()) as RespTraduccion;
        setTraducciones((prev) => ({ ...prev, [c.id]: j }));
      } catch {
        setTraducciones((prev) => ({ ...prev, [c.id]: { error: "Sin señal del traductor." } }));
      } finally {
        setEnCurso((prev) => ({ ...prev, [c.id]: false }));
      }
    },
    [a, idiomaCables, traducciones, enCurso]
  );

  const intercambiar = () => {
    setDe(a);
    setA(de);
  };

  return (
    <div className="space-y-8">
      {/* EL ESTUDIO */}
      <section className="border border-sky-500/30 rounded-md bg-zinc-900/40 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-sky-300 border border-sky-500/50 bg-sky-500/10 rounded px-2 py-0.5">
            Estudio de traducción
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
            8 idiomas · núcleo IA + glosario táctico de emergencia
          </span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_1fr] items-center">
          <select
            value={de}
            onChange={(e) => setDe(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-2 font-mono text-[12px] text-zinc-200 focus:outline-none focus:border-sky-400"
            aria-label="Idioma de origen"
          >
            {IDIOMAS_VANGUARD.map((i) => (
              <option key={i.code} value={i.code}>
                {i.nombre}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={intercambiar}
            className="mx-auto font-mono text-[14px] text-sky-300 hover:text-sky-200 px-3 py-1"
            aria-label="Intercambiar idiomas"
          >
            ⇄
          </button>
          <select
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-2 font-mono text-[12px] text-zinc-200 focus:outline-none focus:border-sky-400"
            aria-label="Idioma de destino"
          >
            {IDIOMAS_VANGUARD.map((i) => (
              <option key={i.code} value={i.code}>
                {i.nombre}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe o pega el texto a traducir — un titular, un despacho, una frase del frente…"
          rows={4}
          maxLength={900}
          className="mt-3 w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2.5 text-[13px] text-zinc-200 leading-relaxed focus:outline-none focus:border-sky-400 resize-y"
        />
        <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
          <span className="font-mono text-[9px] text-zinc-600">{texto.length}/900</span>
          <button
            type="button"
            onClick={() => void traducir()}
            disabled={traduciendo || !texto.trim()}
            className={`font-mono text-[11px] uppercase tracking-widest rounded px-4 py-2 border transition-colors ${
              traduciendo || !texto.trim()
                ? "border-sky-500/30 text-sky-500/50 cursor-wait"
                : "border-sky-400/70 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
            }`}
          >
            {traduciendo ? "Traduciendo…" : `Traducir ▸ ${nombreIdiomaMayus(a)}`}
          </button>
        </div>

        {error && (
          <p className="mt-3 border border-red-500/30 bg-red-500/5 rounded px-3 py-2 text-[12px] text-red-300">
            {error}
          </p>
        )}
        {resultado?.traduccion && (
          <div className="mt-3 border border-sky-500/40 bg-sky-500/5 rounded p-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-sky-300">
              Traducido por Vanguard ▸ {nombreIdiomaMayus(a)}
            </p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-100">{resultado.traduccion}</p>
            {resultado.nota && (
              <p className="mt-1.5 font-mono text-[10px] text-zinc-500">◈ {resultado.nota}</p>
            )}
          </div>
        )}
      </section>

      {/* LAS NOTICIAS EN TU IDIOMA */}
      <section>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
            Las últimas noticias en tu idioma — cables reales de la sala EN VIVO
          </h2>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
              los cables llegan en
            </span>
            <select
              value={idiomaCables}
              onChange={(e) => {
                setIdiomaCables(e.target.value);
                setTraducciones({});
              }}
              className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-sky-400"
              aria-label="Idioma original de los cables"
            >
              {IDIOMAS_VANGUARD.map((i) => (
                <option key={i.code} value={i.code}>
                  {i.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 border border-zinc-800 rounded-md bg-zinc-900/40 divide-y divide-zinc-800/70">
          {cables.map((c) => {
            const tr = traducciones[c.id];
            return (
              <div key={c.id} className="px-3.5 py-3">
                {/* v236.0: el título deja de ser dato muerto — abre SU sala */}
                <Link
                  href={`/noticia/${c.id}`}
                  className="text-[13px] leading-snug text-zinc-200 hover:text-sky-200 transition-colors"
                >
                  {c.title}
                </Link>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                  {c.source}
                </p>
                {!tr && (
                  <button
                    type="button"
                    onClick={() => void traducirCable(c)}
                    disabled={enCurso[c.id]}
                    className={`mt-1.5 font-mono text-[9px] uppercase tracking-widest rounded px-2 py-1 border transition-colors ${
                      enCurso[c.id]
                        ? "border-sky-500/30 text-sky-500/50 cursor-wait"
                        : "border-sky-500/40 text-sky-300 hover:bg-sky-500/10"
                    }`}
                  >
                    {enCurso[c.id] ? "Traduciendo…" : `Traducir a ${nombreIdiomaMayus(a)} ▸`}
                  </button>
                )}
                {tr?.traduccion && (
                  <div className="mt-2 border-l-2 border-sky-400/50 pl-2.5">
                    <p className="text-[13px] leading-snug text-sky-200">{tr.traduccion}</p>
                    {tr.nota && (
                      <p className="mt-0.5 font-mono text-[9px] text-zinc-600">◈ {tr.nota}</p>
                    )}
                  </div>
                )}
                {tr?.error && (
                  <p className="mt-1.5 text-[11px] text-red-300">{tr.error}</p>
                )}
              </div>
            );
          })}
          {!cables.length && (
            <p className="px-3.5 py-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Bajando los cables del planeta… si no llegan, el estudio de arriba funciona igual.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
