"use client";

// ════════════════════════════════════════════════════════════════
// v213.0 EL PULSO — LA SALA EN VIVO (el cliente de /en-vivo)
// La redacción abierta las 24 h: sondea /api/pulso cada 30 s SOLO con
// la pestaña visible, y los cables nuevos entran SOLOS, con su hora,
// su sello de exactitud (fuente + credibilidad) y su impacto — la
// página JAMÁS se recarga (ley v190: nada navega solo, nada se
// recarga). El morbo con regla: LO MÁS CALIENTE ranquea por impacto.
// ════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export interface CableVivo {
  id: string;
  t: string;          // título
  f: string;          // fuente
  u: string;          // url original
  fecha: string;      // ISO
  impacto: number;
  tier: "urgente" | "critico" | "alto" | "desarrollo" | "contexto";
  cred: number;
  tag: string;        // etiqueta táctica (ALERTA…)
  conflicto: string;  // teatro (gaza, ucrania…)
  pais: string;       // código ISO
  paisNombre: string;
  s: string;          // resumen real o redactado por la Agencia
}

export interface StatsVivo {
  hoy: number;
  ultimaHora: number;
  urgente: number;
  teatros: number;
  paises: number;
  frescoMin: number | null;
  generado: string;
}

const TIER_ESTILO: Record<CableVivo["tier"], { label: string; chip: string; punto: string; barra: string }> = {
  urgente:    { label: "URGENTE",    chip: "border-red-500/60 bg-red-500/15 text-red-300",           punto: "bg-red-500",    barra: "bg-red-500" },
  critico:    { label: "CRÍTICO",    chip: "border-orange-400/60 bg-orange-400/15 text-orange-300",  punto: "bg-orange-400", barra: "bg-orange-400" },
  alto:       { label: "ALTO",       chip: "border-amber-500/60 bg-amber-500/15 text-amber-300",     punto: "bg-amber-500",  barra: "bg-amber-500" },
  desarrollo: { label: "DESARROLLO", chip: "border-cyan-400/60 bg-cyan-400/15 text-cyan-300",        punto: "bg-cyan-400",   barra: "bg-cyan-400" },
  contexto:   { label: "CONTEXTO",   chip: "border-zinc-600 bg-zinc-700/30 text-zinc-300",           punto: "bg-zinc-500",   barra: "bg-zinc-500" },
};

function edadViva(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const min = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (min < 1) return "AHORA MISMO";
  if (min < 60) return `HACE ${min} MIN`;
  const h = Math.round(min / 60);
  if (h < 24) return `HACE ${h} H`;
  return `HACE ${Math.round(h / 24)} D`;
}

function nivelDe(cred: number): string {
  if (cred >= 9) return "AGENCIA A++";
  if (cred >= 8) return "AGENCIA A+";
  if (cred >= 6) return "MEDIO A";
  if (cred >= 5) return "MEDIO B";
  return "FUENTE C";
}

interface PropsSala {
  iniciales: CableVivo[];
  calientesIniciales: CableVivo[];
  statsIniciales: StatsVivo;
}

export function SalaEnVivo({ iniciales, calientesIniciales, statsIniciales }: PropsSala) {
  const [cables, setCables] = useState<CableVivo[]>(iniciales);
  const [calientes, setCalientes] = useState<CableVivo[]>(calientesIniciales);
  const [stats, setStats] = useState<StatsVivo>(statsIniciales);
  const [reloj, setReloj] = useState("");              // solo cliente (sin mismatch)
  const [sondeadoHace, setSondeadoHace] = useState(0); // segundos desde el último sondeo
  const [flash, setFlash] = useState<Set<string>>(new Set());
  const [filtro, setFiltro] = useState<"todo" | "urgente" | "teatro">("todo");
  const [teatroElegido, setTeatroElegido] = useState("");
  const vistos = useRef<Set<string>>(new Set(iniciales.map((c) => c.id)));
  // v254.0 EL LATIDO QUE RESPETA — la pausa es honesta: el visitante
  // congela el sondeo con SU mano y lo reanuda con SU mano (ley v190:
  // nada se para ni se reanuda solo). El ref evita la cáscara vieja
  // del closure — el latido SIEMPRE lee el estado real de la pausa.
  const [pausado, setPausado] = useState(false);
  const pausaRef = useRef(false);
  // la pila de los que llegaron mientras leías: si el visitante está
  // bajado en la línea del tiempo, los nuevos no se le esconden — la
  // sala los cuenta y le ofrece la subida con UN toque (nada automático).
  const [nuevosEspera, setNuevosEspera] = useState(0);
  const abajoRef = useRef(false);

  // el reloj de la sala: segundos vivos (la edad de los cables se mueve con él)
  useEffect(() => {
    setReloj(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    let vivo = true;
    let seg = 0;
    const iv = window.setInterval(() => {
      if (!vivo) return;
      seg++;
      setSondeadoHace(seg);
      setReloj(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => { vivo = false; window.clearInterval(iv); };
  }, []);

  // EL LATIDO: sondeo cada 30 s, solo con la pestaña visible; la página
  // nunca se recarga — los cables entran solos (ley v190). v254: si el
  // visitante puso el latido EN PAUSA, el sondeo duerme y reintenta en
  // 5 s — al reanudar, la misma cadena retoma el pulso sin cadenas dobles.
  useEffect(() => {
    let vivo = true;
    let timer = 0;
    const sondear = async () => {
      if (!vivo) return;
      if (pausaRef.current) {
        timer = window.setTimeout(sondear, 5000); // en pausa: reintentar pronto
        return;
      }
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        timer = window.setTimeout(sondear, 5000); // dormida: reintentar pronto
        return;
      }
      try {
        const r = await fetch("/api/pulso", { cache: "no-store" });
        if (r.ok) {
          const j = (await r.json()) as { ok?: boolean; items?: CableVivo[]; calientes?: CableVivo[]; stats?: StatsVivo };
          if (j.ok && Array.isArray(j.items) && vivo) {
            const nuevos = j.items.filter((c) => c && c.id && !vistos.current.has(c.id));
            for (const c of j.items) vistos.current.add(c.id);
            if (nuevos.length > 0) {
              setFlash(new Set(nuevos.map((c) => c.id)));
              window.setTimeout(() => setFlash(new Set()), 5000);
              // llegaron mientras leías (lejos de la cabeza): contarlos,
              // no escondértelos — la subida es UN toque tuyo (ley v190)
              if (abajoRef.current) setNuevosEspera((n) => n + nuevos.length);
            }
            setCables(j.items);
            if (Array.isArray(j.calientes)) setCalientes(j.calientes);
            if (j.stats) setStats(j.stats);
            setSondeadoHace(0);
          }
        }
      } catch { /* sin señal: el próximo latido reintenta */ }
      if (vivo) timer = window.setTimeout(sondear, 30_000);
    };
    timer = window.setTimeout(sondear, 30_000);
    return () => { vivo = false; window.clearTimeout(timer); };
  }, []);

  // el guardián de la posición: ¿está el visitante lejos de la cabeza?
  // (la pila solo se ofrece si los nuevos llegaron fuera de su vista;
  // al volver cerca de la cabeza, la cuenta se limpia sola)
  useEffect(() => {
    const enScroll = () => {
      const lejos = window.scrollY > 480;
      abajoRef.current = lejos;
      if (!lejos) setNuevosEspera(0);
    };
    enScroll();
    window.addEventListener("scroll", enScroll, { passive: true });
    return () => window.removeEventListener("scroll", enScroll);
  }, []);

  // los teatros vivos de la muestra (chips de filtro, top 6 por cables)
  const teatrosChips = useMemo(() => {
    const cuenta = new Map<string, number>();
    for (const c of cables) if (c.conflicto) cuenta.set(c.conflicto, (cuenta.get(c.conflicto) ?? 0) + 1);
    return [...cuenta.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [cables]);

  const filtrados = useMemo(() => {
    if (filtro === "urgente") return cables.filter((c) => c.tier === "urgente" || c.tier === "critico");
    if (filtro === "teatro") return cables.filter((c) => c.conflicto === teatroElegido);
    return cables;
  }, [cables, filtro, teatroElegido]);

  const rompiendo = stats.frescoMin !== null && stats.frescoMin <= 15 && cables[0]
    ? cables[0]
    : null;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* ===== cabecera de la sala ===== */}
      <div className="border-b border-zinc-800 bg-zinc-950/95 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300">
            ◉ VANGUARD
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/vertigo" className="font-mono text-[10px] uppercase tracking-widest text-amber-500/90 hover:text-amber-300">
              VÉRTIGO ▸▸
            </Link>
            <Link href="/guerra-hoy" className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300">
              Primera página
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 pb-16">
        {/* ===== título de la sala ===== */}
        <header className="pt-8 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-red-400 border border-red-500/50 bg-red-500/10 rounded px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
              En vivo · directo
            </span>
            <span className="font-mono text-sm text-zinc-400 tabular-nums" suppressHydrationWarning>{reloj}</span>
          </div>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-black tracking-tight text-zinc-100">
            EL PULSO — ÚLTIMA HORA DEL MUNDO
          </h1>
          <p className="mt-2 text-[13px] text-zinc-400 leading-relaxed">
            La redacción de Vanguard abierta las 24 horas: cada cable real del
            planeta entra aquí SOLO, con su hora, su fuente y su sello de
            exactitud. Sondeo cada 30 segundos — esta sala nunca se recarga,
            nunca te deja con la noticia vieja.
          </p>
        </header>

        {/* ===== ÚLTIMA HORA (rompe si el cable más nuevo tiene ≤ 15 min) ===== */}
        {rompiendo && (
          <Link
            href={`/noticia/${rompiendo.id}`}
            className="block border border-red-500/60 bg-gradient-to-r from-red-950/70 via-zinc-950 to-zinc-950 rounded-md p-4 hover:border-red-400 transition-colors"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-red-300 border border-red-500/60 bg-red-500/15 rounded px-2 py-0.5">
                ● ÚLTIMA HORA
              </span>
              <span className="font-mono text-[10px] uppercase text-red-400/90">{edadViva(rompiendo.fecha)}</span>
            </div>
            <p className="mt-2 font-display text-lg font-bold leading-snug text-zinc-100">
              {rompiendo.t}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-red-300">
              Leer el cable completo →
            </p>
          </Link>
        )}

        {/* ===== EL MEDIDOR DEL PLANETA ===== */}
        <section className="mt-5 grid grid-cols-3 sm:grid-cols-5 gap-2">
          {([
            { l: "Cables hoy", v: stats.hoy, c: "text-zinc-100" },
            { l: "Última hora", v: stats.ultimaHora, c: "text-red-300" },
            { l: "Urgentes", v: stats.urgente, c: "text-orange-300" },
            { l: "Teatros vivos", v: stats.teatros, c: "text-amber-300" },
            { l: "Países", v: stats.paises, c: "text-cyan-300" },
          ] as const).map((m) => (
            <div key={m.l} className="border border-zinc-800 rounded-md bg-zinc-900/60 px-3 py-2.5">
              <div className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">{m.l}</div>
              <div className={`font-display text-xl font-black mt-0.5 tabular-nums ${m.c}`}>{m.v}</div>
            </div>
          ))}
        </section>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-zinc-600 text-right flex items-center justify-end gap-3 flex-wrap">
          <span>
            {pausado
              ? `latido en pausa · última señal hace ${sondeadoHace}s · ${cables.length} cables en sala`
              : `sondeado hace ${sondeadoHace}s · ${cables.length} cables en sala`}
          </span>
          <button
            type="button"
            onClick={() => {
              const nuevo = !pausado;
              pausaRef.current = nuevo; // el latido lee el ref, no la cáscara
              setPausado(nuevo);
            }}
            aria-pressed={pausado}
            className={`font-mono text-[9px] uppercase tracking-widest rounded px-2 py-0.5 border transition-colors ${pausado ? "border-amber-500/60 text-amber-300 hover:bg-amber-500/10" : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"}`}
          >
            {pausado ? "REANUDAR EL LATIDO ▸" : "PAUSAR EL LATIDO ❚❚"}
          </button>
        </p>

        {/* ===== LO MÁS CALIENTE (el morbo con regla: impacto 0-100) ===== */}
        {calientes.length > 0 && (
          <section className="mt-6">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-400">
              LO MÁS CALIENTE — POR IMPACTO
            </h2>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
              {calientes.map((c) => {
                const t = TIER_ESTILO[c.tier] ?? TIER_ESTILO.contexto;
                return (
                  <Link
                    key={c.id}
                    href={`/noticia/${c.id}`}
                    className="shrink-0 w-64 border border-zinc-800 rounded-md bg-zinc-900/60 p-3 hover:border-amber-500/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-display text-2xl font-black tabular-nums ${c.tier === "urgente" ? "text-red-400" : c.tier === "critico" ? "text-orange-300" : "text-amber-300"}`}>
                        {c.impacto}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className={`h-full ${t.barra}`} style={{ width: `${c.impacto}%` }} />
                      </div>
                    </div>
                    <p className="mt-2 text-[12px] font-bold leading-snug text-zinc-200 line-clamp-3">
                      {c.t}
                    </p>
                    <p className="mt-1.5 font-mono text-[8px] uppercase tracking-widest text-zinc-500 truncate">
                      {c.f} · {edadViva(c.fecha)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== FILTROS ===== */}
        <section className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltro("todo")}
            className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest border transition-colors ${filtro === "todo" ? "border-amber-500 text-amber-300 bg-amber-500/10" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
          >
            TODO
          </button>
          <button
            type="button"
            onClick={() => setFiltro("urgente")}
            className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest border transition-colors ${filtro === "urgente" ? "border-red-500 text-red-300 bg-red-500/10" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
          >
            URGENTE + CRÍTICO
          </button>
          {teatrosChips.map(([tag, n]) => (
            <button
              key={tag}
              type="button"
              onClick={() => { setFiltro("teatro"); setTeatroElegido(tag); }}
              className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest border transition-colors ${filtro === "teatro" && teatroElegido === tag ? "border-cyan-400 text-cyan-300 bg-cyan-400/10" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
            >
              {tag} · {n}
            </button>
          ))}
        </section>

        {/* ===== LA LÍNEA DEL TIEMPO ===== */}
        <section className="mt-4 space-y-2">
          {filtrados.length === 0 && (
            <div className="border border-zinc-800 rounded-md bg-zinc-900/40 px-4 py-8 text-center">
              <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                nada con ese filtro en la muestra — la sala sigue latiendo
              </p>
            </div>
          )}
          {filtrados.map((c) => {
            const t = TIER_ESTILO[c.tier] ?? TIER_ESTILO.contexto;
            const esNuevo = flash.has(c.id);
            return (
              <article
                key={c.id}
                className={`border rounded-md p-3.5 transition-colors ${esNuevo ? "border-amber-500/70 bg-amber-500/5" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600"}`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <time
                    dateTime={c.fecha}
                    className="font-mono text-[11px] font-bold text-zinc-300 tabular-nums"
                    suppressHydrationWarning
                  >
                    {new Date(c.fecha).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                  </time>
                  <span className={`font-mono text-[8px] uppercase tracking-widest border rounded px-1.5 py-0.5 ${t.chip}`}>
                    {t.label}
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
                    IMPACTO {c.impacto}
                  </span>
                  {c.conflicto && (
                    <Link
                      href={`/conflicto/${c.conflicto}`}
                      className="font-mono text-[8px] uppercase tracking-widest text-cyan-300/90 hover:text-cyan-200 border border-cyan-400/30 rounded px-1.5 py-0.5"
                    >
                      {c.conflicto}
                    </Link>
                  )}
                  {esNuevo && (
                    <span className="font-mono text-[8px] uppercase tracking-widest text-amber-300">
                      ● NUEVO
                    </span>
                  )}
                  <span className="ml-auto font-mono text-[9px] uppercase text-zinc-500 tabular-nums">
                    {edadViva(c.fecha)}
                  </span>
                </div>
                <Link href={`/noticia/${c.id}`} className="block mt-2">
                  <h3 className="font-display text-[15px] font-bold leading-snug text-zinc-100 hover:text-amber-200 transition-colors">
                    {c.t}
                  </h3>
                </Link>
                {c.s && (
                  <p className="mt-1.5 text-[12px] text-zinc-400 leading-relaxed line-clamp-2">
                    {c.s}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2 flex-wrap font-mono text-[8px] uppercase tracking-widest">
                  <span className="text-zinc-400">{c.f}</span>
                  <span className={`border rounded px-1 py-0.5 ${c.cred >= 8 ? "border-green-500/50 text-green-300" : c.cred >= 5 ? "border-cyan-400/40 text-cyan-300/90" : "border-zinc-700 text-zinc-500"}`}>
                    {nivelDe(c.cred)}
                  </span>
                  {c.paisNombre && c.paisNombre !== "Internacional" && (
                    <span className="text-zinc-600">{c.paisNombre}</span>
                  )}
                  {c.u && c.u.startsWith("http") && (
                    <a
                      href={c.u}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-zinc-500 hover:text-zinc-300"
                    >
                      VER FUENTE ↗
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        {/* ===== v254.0 LA PILA DE LOS QUE LLEGARON MIENTRAS LEÍAS —
            solo existe si llegaron lejos de tu vista y nunca se navega
            sola: la subida es UN toque del visitante (ley v190). Cero
            mismatch: en el SSR la cuenta es 0 y la pila no existe. */}
        {nuevosEspera > 0 && (
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setNuevosEspera(0);
            }}
            aria-live="polite"
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 font-mono text-[10px] uppercase tracking-widest rounded-full border border-amber-500/70 bg-amber-500/15 text-amber-200 px-4 py-2 shadow-lg shadow-black/50 hover:bg-amber-500/25 transition-colors"
          >
            ▲ {nuevosEspera} cable{nuevosEspera === 1 ? "" : "s"} nuevo{nuevosEspera === 1 ? "" : "s"} mientras leías — subir
          </button>
        )}

        {/* ===== salidas de la sala ===== */}
        <footer className="mt-10 border-t border-zinc-800 pt-5 text-center space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
            sondeo cada 30 s · la página jamás se recarga · exactitud: solo cables reales con fuente
          </p>
          <div className="flex items-center justify-center gap-5 font-mono text-[10px] uppercase tracking-widest">
            <Link href="/vertigo" className="text-amber-400 hover:text-amber-300">VÉRTIGO ▸▸</Link>
            <Link href="/guerra-hoy" className="text-zinc-500 hover:text-zinc-300">GUERRA HOY</Link>
            <Link href="/zona-cero" className="text-red-400/90 hover:text-red-300">ZONA CERO</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
