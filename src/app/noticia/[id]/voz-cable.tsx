"use client";

// ============================================================
// v252.0 LA SALA QUE HABLA — la puerta de lectura (/noticia/[id]) gana
// la voz y la salida. Llegaba de Google, leía y se iba: la sala no
// HABLABA (la casa tiene emisora v217 y asistente v117 — la puerta SEO
// se quedaba muda) y no daba SALIDA (compartir solo existía en el
// vértigo v250). Dos capacidades, cero servidor nuevo:
//  · ESCUCHAR: speechSynthesis del APARATO (gratis, sin API, la misma
//    boca del asistente v117) — lee título + resumen con la voz en
//    español que el aparato trate; toggle honesto (▶ escuchar / ■ parar);
//    cancel() en desmontaje — la sala nunca deja una voz huérfana;
//    sin voz disponible, la sala lo DECLARA — jamás se finge.
//  · COMPARTIR: el patrón v250 exacto — hoja nativa Web Share si el
//    aparato la trae, portapapeles + aviso «Enlace copiado» si no,
//    y última red honesta (prompt de copia manual) al final.
// Ley v190: la voz solo arranca con UN TOQUE del visitante — nada
// suena solo, jamás.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";

export function VozCable({
  titulo,
  resumen,
  url,
}: {
  titulo: string;
  resumen: string;
  url: string;
}) {
  const [hablando, setHablando] = useState(false);
  const [sinVoz, setSinVoz] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const timer = useRef(0);

  // la sala jamás deja una voz huérfana: al desmontar, silencio
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* sin voz no hay nada que callar */
      }
    },
    []
  );

  const alternarVoz = useCallback(() => {
    const sint = window.speechSynthesis;
    if (!sint) {
      setSinVoz(true);
      return;
    }
    if (hablando) {
      try {
        sint.cancel();
      } catch {
        /* ya callada */
      }
      setHablando(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(`${titulo}. ${resumen}`.trim());
    u.lang = "es-ES";
    try {
      const vozEs = sint
        .getVoices()
        .find((v) => (v.lang || "").toLowerCase().startsWith("es"));
      if (vozEs) u.voice = vozEs;
    } catch {
      /* sin catálogo de voces: la por defecto del aparato */
    }
    u.onend = () => setHablando(false);
    u.onerror = () => setHablando(false);
    try {
      sint.cancel();
      sint.speak(u);
      setHablando(true);
    } catch {
      setSinVoz(true);
    }
  }, [hablando, titulo, resumen]);

  const compartir = useCallback(async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: titulo, url });
        return;
      } catch (e) {
        // cancelar la hoja nativa no es un error; cualquier otro fallo
        // cae al portapapeles
        if ((e as DOMException)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopiado(false), 2200);
    } catch {
      // sin permiso de portapapeles: la última red decide
      window.prompt("Copia el enlace del cable:", url);
    }
  }, [titulo, url]);

  return (
    <div
      className="mt-5 flex items-center gap-2 flex-wrap border border-zinc-800 rounded-md bg-zinc-900/40 px-3 py-2.5"
      data-vg-sala-habla
    >
      <button
        type="button"
        onClick={alternarVoz}
        aria-label="Escuchar este cable"
        className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest rounded px-3 py-1.5 border transition-colors ${
          hablando
            ? "border-red-500/60 text-red-300 bg-red-500/10 hover:bg-red-500/20"
            : "border-sky-500/50 text-sky-300 bg-sky-500/10 hover:bg-sky-500/20"
        }`}
      >
        {hablando ? "■ Parar la voz" : "▶ Escuchar"}
      </button>
      <button
        type="button"
        onClick={compartir}
        aria-label="Compartir este cable"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest rounded px-3 py-1.5 border border-amber-500/50 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
      >
        {copiado ? "✓ Enlace copiado" : "⇪ Compartir"}
      </button>
      {sinVoz && (
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Tu aparato no tiene voz para leer — la casa no finge
        </span>
      )}
    </div>
  );
}
