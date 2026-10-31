"use client";

// v211.0 EL VÉRTIGO — LA FÓRMULA TIKTOK + INSTAGRAM de la Casa.
// Un feed a PANTALLA COMPLETA donde cada cable ocupa todo el viewport:
// scrollea y la siguiente pieza se encaja sola (scroll-snap, el gesto
// nativo del celular ya es el gesto de TikTok). Fórmula ganadora aplicada,
// no copiada de adorno:
//  · TIKTOK: pantalla llena, un pieza por vez, deslizar = avanzar, riel de
//    progreso lateral, y EL FEED JAMÁS SE ACABA — al acercarte al final
//    pide más cables al archivo (cursor publishedAt) y si el archivo se
//    agota RECICLA las vistos mezcladas: nunca existe «fin del feed».
//  · INSTAGRAM: doble toque (o doble clic) sobre la pieza = ❤️ con ráfaga
//    de corazones; el conteo vive en tu aparato (localStorage, vg-vertigo).
//  · CORTESÍA DE LA CASA: «LEER COMPLETO» navega con ROUTER a la sala de
//    lectura (ley: la navegación jamás recarga), teclado ↑/↓ para el
//    escritorio, Escape sale, prefers-reduced-motion apaga el brillo.
//  · LEY v190: nada se recarga solo — el feed no recarga, no avisa, no
//    decide: solo desliza cuando TÚ deslizas.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { haceDe } from "@/lib/pulsos-data";
import { TEATROS } from "@/lib/teatros";

export type CableVertigo = {
  id: string;
  t: string;
  s: string;
  f: string;
  img: string;
  fecha: string;
  tag: string;
  conflicto: string;
  pais: string;
};

const LOTE_EXTRA = 24;

const TAG_COLOR: Record<string, string> = {
  ALERTA: "border-red-500/60 text-red-300 bg-red-500/10",
  DIPLOMACIA: "border-cyan-500/60 text-cyan-300 bg-cyan-500/10",
  ECONOMIA: "border-emerald-500/60 text-emerald-300 bg-emerald-500/10",
  HUMANITARIO: "border-violet-500/60 text-violet-300 bg-violet-500/10",
  ANALISIS: "border-amber-500/60 text-amber-300 bg-amber-500/10",
};

function imgDe(c: CableVertigo): string {
  return c.img && c.img.startsWith("http")
    ? c.img
    : "/icons/icon-512.png";
}

// ————— corazón local (fórmula Instagram) —————
function corazonesDe(id: string): number {
  try {
    const raw = window.localStorage.getItem(`vg-vertigo-${id}`);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}
function latir(id: string): number {
  const n = corazonesDe(id) + 1;
  try {
    window.localStorage.setItem(`vg-vertigo-${id}`, String(n));
  } catch {
    /* sin almacenamiento: el latido vive solo en la pantalla */
  }
  return n;
}

export function VertigoFeed({ iniciales }: { iniciales: CableVertigo[] }) {
  const router = useRouter();
  const [cables, setCables] = useState<CableVertigo[]>(iniciales);
  const [idx, setIdx] = useState(0);
  const [cargando, setCargando] = useState(false);
  const finDelArchivo = useRef(false);
  const agotado = iniciales.length === 0;
  const contRef = useRef<HTMLDivElement>(null);
  const [rafagas, setRafagas] = useState<Record<string, number>>({});
  const [corazones, setCorazones] = useState<Record<string, number>>({});
  const ultimoTap = useRef(0);
  const ultimoTapId = useRef("");

  // ————— corazón: contar y ráfaga visual —————
  const latirAhora = useCallback((id: string) => {
    const n = latir(id);
    setCorazones((c) => ({ ...c, [id]: n }));
    setRafagas((r) => ({ ...r, [id]: (r[id] || 0) + 1 }));
    window.setTimeout(() => {
      setRafagas((r) => {
        const copia = { ...r };
        delete copia[id];
        return copia;
      });
    }, 900);
  }, []);

  // doble toque / doble clic sobre la pieza visible
  const alTocarPieza = useCallback(
    (id: string) => {
      const ahora = Date.now();
      if (ultimoTapId.current === id && ahora - ultimoTap.current < 350) {
        ultimoTap.current = 0;
        ultimoTapId.current = "";
        latirAhora(id);
      } else {
        ultimoTap.current = ahora;
        ultimoTapId.current = id;
      }
    },
    [latirAhora]
  );

  // ————— la gasolina: más cables cuando el final se acerca —————
  const pedirMas = useCallback(async () => {
    if (cargando || agotado) return;
    setCargando(true);
    try {
      const ultimo = cables[cables.length - 1];
      const cursor = ultimo ? encodeURIComponent(ultimo.fecha) : "";
      if (!cursor) return;
      const res = await fetch(`/api/vertigo?antes=${cursor}`, {
        cache: "no-store",
      });
      const json = await res.json();
      const nuevos: CableVertigo[] = Array.isArray(json.items) ? json.items : [];
      if (nuevos.length === 0) {
        finDelArchivo.current = true;
      } else {
        setCables((prev) => {
          const vistos = new Set(prev.map((p) => p.id));
          const limpios = nuevos.filter((n) => !vistos.has(n.id));
          return limpios.length > 0 ? [...prev, ...limpios] : prev;
        });
      }
    } catch {
      finDelArchivo.current = true;
    } finally {
      setCargando(false);
    }
  }, [cables, cargando, agotado]);

  // ————— EL SECRETO DEL VÉRTIGO: el feed JAMÁS se acaba —————
  // Cuando el archivo se agota, las piezas ya vistas vuelven mezcladas
  // («reciclaje»): el usuario nunca choca con un cartel de «no hay más».
  const reciclar = useCallback(() => {
    setCables((prev) => {
      if (prev.length < 4) return prev;
      const cola = prev.slice(0, Math.min(prev.length, 12));
      const mezclados = [...cola].sort(() => Math.random() - 0.5);
      return [...prev, ...mezclados];
    });
  }, []);

  const alScrollear = useCallback(() => {
    const cont = contRef.current;
    if (!cont || cables.length === 0) return;
    const pieza = Math.round(cont.scrollTop / cont.clientHeight);
    setIdx(pieza);
    const restantes = cables.length - pieza;
    if (restantes <= 4) {
      if (finDelArchivo.current) reciclar();
      else pedirMas();
    }
  }, [cables.length, pedirMas, reciclar]);

  // teclado de escritorio (fórmula de sala): ↑/↓ saltan de pieza
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      const cont = contRef.current;
      if (!cont) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        cont.scrollBy({ top: cont.clientHeight, behavior: "smooth" });
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        cont.scrollBy({ top: -cont.clientHeight, behavior: "smooth" });
      } else if (e.key === "Escape") {
        router.push("/guerra-hoy");
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [router]);

  // corazones ya latidos en este aparato (tras montaje, sin mismatch)
  useEffect(() => {
    const t = window.setTimeout(() => {
      setCables((prev) => {
        // triggerea relectura de corazones por pieza visible
        setCorazones(() => {
          const mapa: Record<string, number> = {};
          for (const c of prev) {
            const n = corazonesDe(c.id);
            if (n > 0) mapa[c.id] = n;
          }
          return mapa;
        });
        return prev;
      });
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const riel = useMemo(() => Math.min(cables.length, 60), [cables.length]);
  const progreso = cables.length > 0 ? Math.min((idx / cables.length) * 100, 100) : 0;

  if (agotado) {
    return (
      <main className="h-[100dvh] bg-zinc-950 text-zinc-200 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
            ◉ VANGUARD · EL VÉRTIGO
          </p>
          <h1 className="mt-3 text-xl font-bold text-zinc-100">
            El archivo está callado ahora
          </h1>
          <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
            No hay cables en la redacción en este momento. Cuando el mundo
            vuelva a moverse, el vértigo regresa.
          </p>
          <Link
            href="/guerra-hoy"
            className="mt-6 inline-block px-5 py-2.5 rounded-sm bg-amber-400 text-zinc-950 font-mono text-[11px] uppercase tracking-widest font-bold hover:bg-amber-300"
          >
            Ir a guerra hoy
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] bg-black text-zinc-100 relative">
      {/* cabecera mínima flotante — la marca siempre presente */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
        >
          ◉ VANGUARD
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-300">
          EL VÉRTIGO · {idx + 1}/{cables.length}
        </span>
      </div>

      {/* riel de progreso lateral (fórmula TikTok) */}
      <div
        aria-hidden
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-[3px]"
      >
        {Array.from({ length: riel }).map((_, i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full transition-all duration-300 ${
              i === idx % riel ? "h-5 bg-amber-400" : "h-2 bg-zinc-700/70"
            }`}
          />
        ))}
      </div>

      {/* el feed — una pieza por pantalla, el gesto nativo manda */}
      <div
        ref={contRef}
        onScroll={alScrollear}
        className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {cables.map((c, i) => {
          const nombreTeatro = c.conflicto
            ? TEATROS[c.conflicto]?.nombre || c.conflicto
            : "";
          return (
            <section
              key={`${c.id}-${i}`}
              className="h-[100dvh] w-full snap-start relative overflow-hidden flex items-end"
              onClick={() => alTocarPieza(c.id)}
            >
              {/* la pieza de fondo — imagen real del cable */}
              <img
                src={imgDe(c)}
                alt=""
                aria-hidden
                loading={i < 2 ? "eager" : "lazy"}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/30" />

              {/* ráfaga de corazones (fórmula Instagram) */}
              {rafagas[c.id] ? (
                <div
                  key={rafagas[c.id]}
                  aria-hidden
                  className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                >
                  <span className="text-[110px] leading-none select-none animate-ping-once">
                    ❤️
                  </span>
                </div>
              ) : null}

              {/* columna derecha de señales */}
              <div className="absolute right-4 bottom-28 z-20 flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    latirAhora(c.id);
                  }}
                  aria-label="Latir este cable"
                  className="flex flex-col items-center gap-1 text-zinc-200 hover:text-red-400 transition-colors"
                >
                  <span className="text-3xl drop-shadow">
                    {corazones[c.id] ? "❤️" : "🤍"}
                  </span>
                  {corazones[c.id] ? (
                    <span className="font-mono text-[10px]">{corazones[c.id]}</span>
                  ) : null}
                </button>
                {nombreTeatro && (
                  <Link
                    href={`/conflicto/${c.conflicto}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col items-center gap-1 text-zinc-300 hover:text-amber-300 transition-colors"
                    aria-label={`Teatro ${nombreTeatro}`}
                  >
                    <span className="text-2xl">🗺️</span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-center max-w-[64px] leading-tight">
                      {nombreTeatro}
                    </span>
                  </Link>
                )}
              </div>

              {/* la información — abajo, estilo pieza */}
              <div className="relative z-10 px-5 pb-24 pr-20 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-widest border rounded px-1.5 py-0.5 ${TAG_COLOR[c.tag] || TAG_COLOR.ANALISIS}`}
                  >
                    {c.tag}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                    {c.f} · {haceDe(new Date(c.fecha).getTime())}
                  </span>
                </div>
                <h2 className="mt-2.5 text-xl sm:text-2xl font-bold leading-snug text-zinc-50 drop-shadow">
                  {c.t}
                </h2>
                {c.s && (
                  <p className="mt-2 text-[13px] sm:text-sm text-zinc-300 leading-relaxed line-clamp-3">
                    {c.s}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/noticia/${c.id}`);
                    }}
                    className="px-4 py-2 rounded-sm bg-amber-400 text-zinc-950 font-mono text-[11px] uppercase tracking-widest font-bold hover:bg-amber-300"
                  >
                    Leer completo →
                  </button>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hidden sm:inline">
                    desliza ↑ · doble toque ❤️
                  </span>
                </div>
              </div>
            </section>
          );
        })}

        {/* centinela: cerca del final pide más (o recicla) — JAMÁS cartel de fin */}
        <div className="h-[100dvh] snap-start flex items-center justify-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-600 animate-pulse">
            {cargando ? "◎ Trayendo más del mundo…" : "◎ El vértigo sigue…"}
          </p>
        </div>
      </div>

      {/* progreso global — una línea fina arriba */}
      <div aria-hidden className="absolute top-0 inset-x-0 z-40 h-[2px] bg-transparent">
        <div
          className="h-full bg-amber-400/70 transition-all duration-300"
          style={{ width: `${progreso}%` }}
        />
      </div>
    </main>
  );
}
