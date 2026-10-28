"use client";

// ============================================================
// v191.0 LA CINEMÁTICA DEL ESTRENO — el tráiler de la Casa.
// La lección de v187/v189 está escrita en piedra y aquí se cumple
// AL PIE DE LA LETRA:
//  · JAMÁS DURANTE LA CARGA: el cine solo puede arrancar cuando
//    document.readyState === "complete" + respiro de 1.6s. La
//    descarga MANDA; el cine es un invitado que llega después.
//  · SOLO UNA VEZ POR VERSIÓN (vg191-cine-visto) y siempre
//    OPT-IN después: el botón «VER CINEMÁTICA» de la portada.
//  · SI LA SESIÓN SUFRIÓ (vg186-n / vg187-sufrio) NO SE ESTRENA:
//    a quien le costó entrar no se le tapa la casa.
//  · SALTAR GIGANTE siempre visible (pulgar arriba y abajo) + tecla Esc.
//  · CERO FOTOS: todo CSS/SVG + WebAudio de la casa. 0 bytes de red.
//  · NADA SE RECARGA SOLO: cerrar el cine no toca caches ni rutas.
// Protagonismo de las VOCES: CENTINELA, LA ANALISTA y VG-ASSIST
// se presentan cada uno con su propia voz (v191 Consejo de Voces).
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { Clapperboard, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_VERSION_LABEL } from "@/lib/version";
import { sfx, isMuted } from "@/lib/sound";
import { hablarAgente, pararVoces, VOCES_ROSTER } from "@/lib/voces-agentes";

const LS_VISTO = "vg191-cine-visto";
const TIEMPOS = [0, 3_000, 6_000, 11_600, 13_800]; // escenas 0..4

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  /** auto = se estrena una sola vez por versión, si la casa despertó sana */
  auto?: boolean;
}

export function CinematicaVanguard({ abierto, alCerrar, auto = true }: Props) {
  const [autoActiva, setAutoActiva] = useState(false);
  const [escena, setEscena] = useState(-1);
  const [subtitulo, setSubtitulo] = useState<{ nombre: string; color: string; texto: string } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reproduciendo = abierto || autoActiva;

  const limpiarTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const detener = useCallback(() => {
    limpiarTimers();
    pararVoces();
    setEscena(-1);
    setSubtitulo(null);
  }, [limpiarTimers]);

  const cerrar = useCallback(() => {
    detener();
    setAutoActiva(false);
    alCerrar();
  }, [detener, alCerrar]);

  // ── la línea de tiempo (la pieza completa dura ~16s, saltable SIEMPRE) ──
  const reproducir = useCallback(() => {
    detener();
    limpiarTimers();
    const luego = (ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)); };

    setEscena(0);
    luego(60, () => sfx.beep());
    luego(2_650, () => { if (!isMuted()) sfx.error(); }); // el sello CLASIFICADO

    luego(TIEMPOS[1], () => { setEscena(1); if (!isMuted()) sfx.campana(); });

    luego(TIEMPOS[2], () => {
      setEscena(2);
      // los agentes se presentan CON SU PROPIA VOZ (subtítulo siempre)
      const presentar = (id: "centinela" | "analista" | "assist", delay: number) => {
        luego(delay, () => {
          const p = VOCES_ROSTER[id];
          setSubtitulo({ nombre: p.nombre, color: p.color, texto: p.frase });
          hablarAgente(id, p.frase, { onend: () => setSubtitulo((s) => (s && s.nombre === p.nombre ? null : s)) });
        });
      };
      presentar("centinela", 250);
      presentar("analista", 1_900);
      presentar("assist", 3_600);
    });

    luego(TIEMPOS[3], () => { setEscena(3); if (!isMuted()) sfx.unlock(); });
    luego(TIEMPOS[4], () => setEscena(4));
  }, [detener, limpiarTimers]);

  // montar la escena cuando se abre (manual o auto) — arranque async
  // (patrón de la casa: setTimeout 0, setState jamás síncrono en effect)
  useEffect(() => {
    if (!reproduciendo) return;
    const t = setTimeout(() => reproducir(), 0);
    // candado del fondo: el cine ocupa la pantalla entera
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
      detener();
    };
  }, [reproduciendo, reproducir, detener]);

  // tecla Esc = salida digna
  useEffect(() => {
    if (!reproduciendo) return;
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") cerrar(); };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [reproduciendo, cerrar]);

  // ── EL ESTRENO AUTOMÁTICO: una sola vez, casa sana, sin manos ──
  useEffect(() => {
    if (!auto) return;
    let cancelado = false;
    let tArranque: ReturnType<typeof setTimeout> | null = null;

    const conManos = () => { cancelado = true; }; // si el Dueño ya interactúa, no se estrena
    window.addEventListener("pointerdown", conManos, { once: true, passive: true });
    window.addEventListener("keydown", conManos, { once: true });
    window.addEventListener("wheel", conManos, { once: true, passive: true });

    tArranque = setTimeout(() => {
      window.removeEventListener("pointerdown", conManos);
      window.removeEventListener("keydown", conManos);
      window.removeEventListener("wheel", conManos);
      if (cancelado) return;
      try {
        // ley v189: solo si la casa despertó COMPLETA y la sesión no sufrió
        if (document.readyState !== "complete") return;
        if (document.visibilityState !== "visible") return;
        if (localStorage.getItem(LS_VISTO) === "1") return;
        if (sessionStorage.getItem("vg186-n") || sessionStorage.getItem("vg187-sufrio")) return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
        localStorage.setItem(LS_VISTO, "1"); // se marca al ARRANCAR: saltarlo cuenta como visto
      } catch { return; }
      setAutoActiva(true);
    }, 3_600);

    return () => {
      if (tArranque) clearTimeout(tArranque);
      window.removeEventListener("pointerdown", conManos);
      window.removeEventListener("keydown", conManos);
      window.removeEventListener("wheel", conManos);
    };
  }, [auto]);

  if (!reproduciendo || escena < 0) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black select-none vg191-cine"
      role="dialog"
      aria-label="Cinemática de Vanguard"
      data-vg191-cine
    >
      {/* barra de progreso tipo tráiler */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-white/10 z-20">
        <div className="h-full vg191-progreso" style={{ background: "#E8C56A" }} />
      </div>

      {/* SALTAR GIGANTE — arriba y abajo (los dos pulgares) */}
      <button
        onClick={cerrar}
        className="absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 min-h-[44px] px-5 rounded-md border border-white/35 bg-black/55 backdrop-blur text-white/90 font-mono text-xs font-bold uppercase tracking-[0.25em] hover:bg-white/10 hover:border-white/70"
        aria-label="Saltar la cinemática"
      >
        <X className="w-4 h-4" /> Saltar
      </button>

      {/* ══ ESCENA 0: CLASIFICADO ══ */}
      {escena === 0 && (
        <div className="absolute inset-0 grid place-items-center px-6">
          <div className="text-center">
            <p className="vg191-maquina font-mono text-[11px] sm:text-sm tracking-[0.4em] text-white/70 uppercase">
              AGENCIA VANGUARD · DOCUMENTO CLASIFICADO
            </p>
            <p className="mt-4 font-mono text-[10px] tracking-[0.3em] text-red-400/80 uppercase vg191-sello">
              SOLO PARA LOS OJOS DEL COMANDANTE
            </p>
          </div>
        </div>
      )}

      {/* ══ ESCENA 1: EL LOGO ══ */}
      {escena === 1 && (
        <div className="absolute inset-0 grid place-items-center px-6">
          <div className="text-center vg191-entra">
            <h1
              className="glitch font-display text-6xl sm:text-8xl font-black tracking-wider text-soft"
              data-text="VANGUARD"
              style={{ textShadow: "0 0 40px rgba(232,197,106,0.5)" }}
            >
              VANGUARD
            </h1>
            <div className="mt-3 h-px w-40 mx-auto bg-gradient-to-r from-transparent via-[#E8C56A] to-transparent" />
          </div>
        </div>
      )}

      {/* ══ ESCENA 2: EL CONSEJO DE VOCES ══ */}
      {escena === 2 && (
        <div className="absolute inset-0 grid place-items-center px-6">
          <div className="w-full max-w-3xl">
            <p className="text-center font-mono text-[10px] tracking-[0.35em] text-white/50 uppercase mb-5">
              Los agentes de tu casa hablan — cada uno con su voz
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["centinela", "analista", "assist"] as const).map((id, i) => {
                const p = VOCES_ROSTER[id];
                return (
                  <div
                    key={id}
                    className="vg191-agente rounded-lg border bg-white/[0.03] p-4 text-center"
                    style={{ borderColor: `${p.color}66`, animationDelay: `${i * 0.45}s` }}
                  >
                    <span
                      className="inline-block w-9 h-9 rounded-full border-2 mb-2"
                      style={{ borderColor: p.color, boxShadow: `0 0 16px ${p.color}66`, background: `${p.color}22` }}
                    />
                    <p className="font-mono text-xs font-bold tracking-widest" style={{ color: p.color }}>{p.nombre}</p>
                    <p className="mt-1 text-[10px] font-mono text-white/45 uppercase tracking-wider">{p.rol.split("·")[0]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ ESCENA 3: LA PROMESA ══ */}
      {escena === 3 && (
        <div className="absolute inset-0 grid place-items-center px-6 vg191-entra">
          <div className="text-center">
            <p className="font-display text-2xl sm:text-4xl font-black tracking-wide text-soft">
              EL MUNDO EN TIEMPO REAL
            </p>
            <p className="mt-2 font-mono text-[10px] sm:text-xs tracking-[0.3em] text-amber/80 uppercase">
              Noticias · Guerra · Economía · Inteligencia
            </p>
          </div>
        </div>
      )}

      {/* ══ ESCENA 4: FINAL CON BOTONES ══ */}
      {escena === 4 && (
        <div className="absolute inset-0 grid place-items-center px-6 vg191-entra">
          <div className="text-center">
            <h1
              className="glitch font-display text-5xl sm:text-7xl font-black tracking-wider text-soft"
              data-text="VANGUARD"
              style={{ textShadow: "0 0 40px rgba(232,197,106,0.5)" }}
            >
              VANGUARD
            </h1>
            <p className="mt-1 font-mono text-[10px] tracking-[0.3em] text-gradient uppercase">{APP_VERSION_LABEL}</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={cerrar}
                className="min-h-[48px] px-8 rounded-md font-mono text-sm font-bold uppercase tracking-[0.2em] bg-amber text-black hover:brightness-110"
                aria-label="Entrar a Vanguard"
              >
                Entrar a la casa
              </button>
              <button
                onClick={reproducir}
                className="min-h-[48px] px-6 rounded-md font-mono text-xs font-bold uppercase tracking-[0.2em] border border-white/30 text-white/80 hover:bg-white/10"
                aria-label="Ver la cinemática otra vez"
              >
                <Clapperboard className="w-4 h-4 inline mr-1.5 -mt-0.5" /> Ver otra vez
              </button>
            </div>
            <p className="mt-5 font-mono text-[9px] tracking-[0.25em] text-white/35 uppercase">
              Las voces que oíste son las de tus agentes — pruébalas en la portada
            </p>
          </div>
        </div>
      )}

      {/* subtítulos SIEMPRE (el cine funciona también sin voz) */}
      {subtitulo && (
        <div className="absolute bottom-8 inset-x-0 z-20 px-6 text-center pointer-events-none">
          <p className="inline-block max-w-2xl rounded-md bg-black/70 backdrop-blur px-4 py-2 border-l-2" style={{ borderColor: subtitulo.color }}>
            <span className="font-mono text-[10px] font-bold tracking-widest mr-2" style={{ color: subtitulo.color }}>
              {subtitulo.nombre}:
            </span>
            <span className="text-sm text-white/90">«{subtitulo.texto}»</span>
          </p>
        </div>
      )}

      {/* SALTAR inferior (pulgar en móvil) — desaparece en el final */}
      {escena < 4 && (
        <button
          onClick={cerrar}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 sm:hidden inline-flex items-center min-h-[44px] px-8 rounded-full border border-white/35 bg-black/55 text-white/85 font-mono text-xs font-bold uppercase tracking-[0.25em]"
          aria-label="Saltar la cinemática"
        >
          Saltar
        </button>
      )}

      <style dangerouslySetInnerHTML={{ __html: VG191_CINE_CSS }} />
    </div>
  );
}

const VG191_CINE_CSS = `
.vg191-cine { background: radial-gradient(circle at 50% 40%, #10101A 0%, #050508 70%, #000 100%); }
.vg191-maquina { overflow: hidden; white-space: nowrap; border-right: 2px solid rgba(232,197,106,0.8);
  animation: vg191-tipear 2.6s steps(38, end) forwards; width: 0; max-width: 100vw; }
@keyframes vg191-tipear { to { width: 100%; } }
.vg191-sello { opacity: 0; animation: vg191-aparecer 0.35s ease forwards; animation-delay: 2.7s; }
@keyframes vg191-aparecer { from { opacity: 0; transform: scale(1.6); } to { opacity: 0.9; transform: scale(1); } }
.vg191-entra { animation: vg191-entra 0.9s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes vg191-entra { from { opacity: 0; transform: translateY(26px) scale(0.97); } to { opacity: 1; transform: none; } }
.vg191-agente { opacity: 0; animation: vg191-agente 0.6s ease forwards; }
@keyframes vg191-agente { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
.vg191-progreso { animation: vg191-progreso 15.5s linear forwards; }
@keyframes vg191-progreso { from { width: 0%; } to { width: 100%; } }
@media (prefers-reduced-motion: reduce) {
  .vg191-maquina { animation: none !important; width: 100% !important; border-right: none; }
  .vg191-sello, .vg191-entra, .vg191-agente { animation: none !important; opacity: 1 !important; }
}
`;
