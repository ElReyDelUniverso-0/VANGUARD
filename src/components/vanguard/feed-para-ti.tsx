"use client";

// ============================================================
// VANGUARD v170.0 — FEED «PARA TI»
// Mecánica vertical tipo TikTok: tarjetas a pantalla completa,
// snap-scroll, razón del algoritmo visible, acciones
// (ABRIR / ME GUSTA / NO ME INTERESA) y cascada sonora.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIAS, type EstadoAgente, type TarjetaRecomendada } from "@/lib/vanguard/tipos";
import { calcularFeed } from "@/lib/vanguard/algoritmo";
import { sfxClick, sfxExito, sfxSala, tickCascada } from "@/lib/vanguard/sonido";

interface PropsFeed {
  agente: EstadoAgente;
  semillaSesion: string;
  onAbrir: (salaId: string) => void;
  onLike: (salaId: string) => boolean;
  onNoInteresa: (salaId: string) => void;
  sonido: boolean;
  montado: boolean;
}

export function FeedParaTi({ agente, semillaSesion, onAbrir, onLike, onNoInteresa, sonido, montado }: PropsFeed) {
  const resultado = useMemo<ResultadoAlgoritmoSafe>(
    () => (montado ? calcularFeed(agente, semillaSesion) : { tarjetas: [], stats: { evaluadas: 0, ocultas: 0, exploracion: 0, afinidadTop: null } }),
    [agente, semillaSesion, montado]
  );
  const [indice, setIndice] = useState(0);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const ultimoTick = useRef(-1);

  // cascada sonora al cambiar de tarjeta
  useEffect(() => {
    if (!sonido || !montado) return;
    if (ultimoTick.current !== indice && indice >= 0) {
      ultimoTick.current = indice;
      tickCascada(indice, resultado.tarjetas.length);
    }
  }, [indice, sonido, montado, resultado.tarjetas.length]);

  const irA = useCallback(
    (nuevo: number) => {
      const total = resultado.tarjetas.length;
      if (total === 0) return;
      const objetivo = Math.max(0, Math.min(total - 1, nuevo));
      setIndice(objetivo);
      const cont = contenedorRef.current;
      if (cont) cont.scrollTo({ top: objetivo * cont.clientHeight, behavior: "smooth" });
    },
    [resultado.tarjetas.length]
  );

  // teclado: flechas arriba/abajo (navegación de feed)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); irA(indice + 1); }
      if (e.key === "ArrowUp") { e.preventDefault(); irA(indice - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [indice, irA]);

  const onScroll = useCallback(() => {
    const cont = contenedorRef.current;
    if (!cont) return;
    const nuevo = Math.round(cont.scrollTop / Math.max(cont.clientHeight, 1));
    if (nuevo !== indice) setIndice(nuevo);
  }, [indice]);

  if (!montado) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-sm tracking-[0.3em] text-white/40">SINTONIZANDO LA RED…</div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div
        ref={contenedorRef}
        onScroll={onScroll}
        className="h-full snap-y snap-mandatory overflow-y-auto no-scrollbar"
      >
        {resultado.tarjetas.map((t, i) => (
          <Tarjeta
            key={t.sala.id}
            tarjeta={t}
            activa={i === indice}
            senal={agente.senales[t.sala.id]}
            onAbrir={() => { sfxSala(); onAbrir(t.sala.id); }}
            onLike={() => {
              const nuevo = onLike(t.sala.id);
              if (nuevo && sonido) sfxExito();
            }}
            onNoInteresa={() => { sfxClick(); onNoInteresa(t.sala.id); irA(indice + 1); }}
          />
        ))}
      </div>

      {/* rail de progreso del feed */}
      <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 flex-col gap-1 sm:flex">
        {resultado.tarjetas.slice(0, 12).map((t, i) => (
          <div
            key={t.sala.id}
            className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
              i === indice ? "scale-150 bg-white" : "bg-white/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

type ResultadoAlgoritmoSafe = ReturnType<typeof calcularFeed>;

function Tarjeta({
  tarjeta,
  activa,
  senal,
  onAbrir,
  onLike,
  onNoInteresa,
}: {
  tarjeta: TarjetaRecomendada;
  activa: boolean;
  senal?: { vistas: number; likes: number; noInteresa: boolean; tiempoMs: number; ultimaVistaTs: number };
  onAbrir: () => void;
  onLike: () => void;
  onNoInteresa: () => void;
}) {
  const { sala, razon, puntaje } = tarjeta;
  const cat = CATEGORIAS[sala.categoria];

  return (
    <section
      aria-label={`Sala ${sala.nombre}`}
      className="relative flex h-full w-full snap-start items-center justify-center px-3 py-4 sm:px-6"
    >
      <article
        className={`group relative flex h-full w-full max-w-md flex-col overflow-hidden rounded-3xl border ${cat.borde} bg-[#0a0c12]/90 transition-all duration-500 ${
          activa ? "opacity-100 scale-100" : "opacity-60 scale-[0.97]"
        }`}
      >
        {/* fondo del gradiente de categoría */}
        <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradiente} opacity-20 transition-opacity duration-500 group-hover:opacity-30`} />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/10 to-transparent" />

        {/* cabecera de la tarjeta */}
        <div className="relative flex items-start justify-between gap-2 p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${cat.borde} bg-black/40 text-2xl ${cat.glow}`}>
              {sala.icono}
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider text-white">{sala.nombre}</h2>
              <span className={`text-[10px] font-bold tracking-[0.2em] ${cat.texto}`}>{cat.etiqueta}</span>
            </div>
          </div>
          <span className="rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[9px] font-bold tracking-widest text-white/70">
            {sala.fuenteEtiqueta}
          </span>
        </div>

        {/* razón del algoritmo — transparencia estilo TikTok */}
        <div className="relative mx-5 mt-4 flex items-center gap-2">
          <span className={`rounded-full border ${cat.borde} bg-black/50 px-3 py-1 text-[10px] font-bold tracking-wider ${cat.texto}`}>
            ⚡ {razon.toUpperCase()}
          </span>
          <span className="text-[9px] font-mono text-white/35">afin. {(puntaje * 100).toFixed(0)}</span>
        </div>

        {/* cuerpo */}
        <div className={`relative flex-1 overflow-y-auto px-5 pt-4 transition-all duration-700 ${activa ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          <p className="text-lg font-bold leading-snug text-white">{sala.tagline}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/60">{sala.descripcion}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {sala.tags.map((tag) => (
              <span key={tag} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                #{tag}
              </span>
            ))}
          </div>

          {/* métricas */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-2">
              <div className="text-[9px] tracking-widest text-white/40">PODER</div>
              <div className="text-sm font-black text-white">{sala.poder}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-2">
              <div className="text-[9px] tracking-widest text-white/40">TUS VISTAS</div>
              <div className="text-sm font-black text-white">{senal?.vistas ?? 0}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-2">
              <div className="text-[9px] tracking-widest text-white/40">TU ♥</div>
              <div className="text-sm font-black text-rose-300">{senal?.likes ?? 0}</div>
            </div>
          </div>
        </div>

        {/* acciones */}
        <div className="relative flex items-center gap-2 p-5 pt-4">
          <button
            onClick={onAbrir}
            className={`flex-1 rounded-2xl bg-gradient-to-r ${cat.gradiente} px-4 py-3 text-sm font-black tracking-widest text-white transition-transform active:scale-95 hover:brightness-110`}
          >
            ENTRAR A LA SALA →
          </button>
          <button
            onClick={onLike}
            aria-label="Me gusta"
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all active:scale-90 ${
              (senal?.likes ?? 0) > 0
                ? "border-rose-400/60 bg-rose-500/20 text-rose-300"
                : "border-white/15 bg-black/40 text-white/70 hover:text-rose-300"
            }`}
          >
            ♥
          </button>
          <button
            onClick={onNoInteresa}
            aria-label="No me interesa"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-black/40 text-white/50 transition-all active:scale-90 hover:text-white/80"
          >
            ✕
          </button>
        </div>
      </article>
    </section>
  );
}
