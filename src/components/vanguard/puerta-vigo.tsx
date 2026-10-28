"use client";

// ============================================================
// v193.1 LA PUERTA DE VIGO — la entrada que dirige a lo que importa.
// Primera visita: Vigo pregunta «¿Qué te importa?» y con UN toque
// te lleva a tu sala (guerra hoy / para ti / TV / mapa 3D / memes).
// Visita siguiente: la puerta recuerda y el botón gigante ENTRA
// directo — la casa se vuelve fácil de entrar de verdad.
//
// Leyes de la casa respetadas:
//  · NADA SE RECARGA SOLO: la navegación usa el evento interno
//    vanguard:navigate (page.tsx lo escucha) — jamás location.
//  · CERO BYTES DE RED: todo es lógica local + localStorage
//    (vg193-tu-sala). La elección del Dueño NUNCA sale del aparato.
//  · VOZ JAMÁS AUTOMÁTICA: el saludo del CENTINELA solo suena con
//    el gesto del Dueño (botón de voz) y respeta el MUTE (v192).
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  Siren, Flame, MonitorPlay, Radar, Laugh, DoorOpen, Repeat, Volume2, VolumeX, UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navigateTo } from "@/lib/nav";
import type { TabKey } from "@/components/vanguard/tab-nav";
import { useGameStore } from "@/lib/game-store";
import { hablarAgente, pararVoces } from "@/lib/voces-agentes";
import { Vigo } from "@/components/vanguard/vigo";

const LS_SALA = "vg193-tu-sala";

interface Sala {
  tab: TabKey;
  nombre: string;
  desc: string;
  color: string;
  icono: React.ReactNode;
}

const SALAS: Sala[] = [
  { tab: "centro",   nombre: "GUERRA HOY", desc: "El mundo ardiendo en vivo",        color: "#FF3B30", icono: <Siren className="w-5 h-5" /> },
  { tab: "foryou",   nombre: "PARA TI",    desc: "Tu feed con algoritmo propio",     color: "#FF6B4A", icono: <Flame className="w-5 h-5" /> },
  { tab: "pantalla", nombre: "TV EN VIVO", desc: "Pases verticales del planeta",     color: "#E8C56A", icono: <MonitorPlay className="w-5 h-5" /> },
  { tab: "osint",    nombre: "MAPA 3D",    desc: "15 capas de inteligencia",         color: "#38BDF8", icono: <Radar className="w-5 h-5" /> },
  { tab: "memes",    nombre: "MEMES",      desc: "El estudio del pueblo",            color: "#A855F7", icono: <Laugh className="w-5 h-5" /> },
];

export function PuertaVigo() {
  const [sala, setSala] = useState<Sala | null>(null);
  const [listo, setListo] = useState(false);
  const [hablando, setHablando] = useState(false);
  // v195 TU LADO: la puerta también invita a crear cuenta — sin pasaporte
  // no hay lado que declarar ni progreso que guardar en la nube.
  const account = useGameStore((s) => s.account);

  const abrirCuenta = useCallback(() => {
    // v195: el centinela pide el pasaporte con SU motivo — el modal abre
    // directamente en CREAR CUENTA (registro primero, no login).
    window.dispatchEvent(new CustomEvent("vanguard:pasaporte", {
      detail: { motivo: "El centinela Vigo te invita: crea tu cuenta gratis en 10 segundos — +300 monedas, progreso en la nube y tu lado declarado en los problemas del mundo." },
    }));
  }, []);

  // la sala guardada manda (post-hidratación, patrón v132/v179/v191: setTimeout 0)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const g = localStorage.getItem(LS_SALA);
        const s = SALAS.find((x) => x.tab === g);
        if (s) setSala(s);
      } catch {}
      setListo(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const elegir = useCallback((s: Sala) => {
    setSala(s);
    try { localStorage.setItem(LS_SALA, s.tab); } catch {}
    // dirigir YA: un toque y estás dentro (evento interno, jamás recarga)
    navigateTo(s.tab);
  }, []);

  const entrar = useCallback(() => {
    if (sala) navigateTo(sala.tab);
  }, [sala]);

  const cambiar = useCallback(() => {
    setSala(null);
    try { localStorage.removeItem(LS_SALA); } catch {}
  }, []);

  const saludo = useCallback(() => {
    if (hablando) {
      pararVoces();
      setHablando(false);
      return;
    }
    setHablando(true);
    const texto = sala
      ? `Bienvenido de vuelta, agente. Tu sala ${sala.nombre} te espera. Un toque y estás dentro.`
      : "Soy Vigo, centinela de Vanguard. Dime qué te importa y te llevo en un toque.";
    const ok = hablarAgente("centinela", texto);
    if (!ok) setHablando(false);
    else window.setTimeout(() => setHablando(false), Math.min(9000, texto.length * 62));
  }, [hablando, sala]);

  if (!listo) {
    // antes de hidratar: nada parpadea (ley: jamás parece carga)
    return <div data-vig193-puerta="espera" className="hidden" />;
  }

  const burbuja = sala
    ? "Bienvenido de vuelta, agente. Tu sala te espera."
    : "¿Qué te importa hoy? Un toque y te llevo.";

  return (
    <section
      data-vig193-puerta={sala ? `sala-${sala.tab}` : "pregunta"}
      className="relative rounded-md border border-amber-hud/25 bg-secondary/30 p-4 sm:p-5"
      aria-label="La puerta de Vigo: elige tu sala"
    >
      <div className="flex items-start gap-4">
        {/* EL GUÍA */}
        <div className="shrink-0 hidden sm:block">
          <Vigo size={132} burbuja={burbuja} />
        </div>
        <div className="shrink-0 sm:hidden">
          <Vigo size={92} burbuja={burbuja} />
        </div>

        {/* LA PUERTA */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-amber-hud">
                La puerta de Vigo · entrada directa
              </div>
              <h2 className="font-display text-lg sm:text-xl font-black tracking-wide text-foreground">
                {sala ? "TU SALA TE ESPERA" : "¿QUÉ TE IMPORTA HOY?"}
              </h2>
            </div>
            <button
              onClick={saludo}
              className={cn(
                "inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-md border font-mono text-[10px] uppercase tracking-widest transition-colors",
                hablando
                  ? "border-red-hud/60 bg-red-hud/10 text-red-300"
                  : "border-amber-hud/40 text-amber hover:bg-amber-hud/15"
              )}
              aria-label={hablando ? "Silenciar a Vigo" : "Vigo te saluda con la voz del Centinela"}
            >
              {hablando ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {habandoLabel(hablando)}
            </button>
          </div>

          {sala ? (
            /* ── MODO SALA ASIGNADA: ENTRAR EN UN TOQUE ── */
            <div className="mt-3">
              <button
                onClick={entrar}
                className="w-full min-h-[64px] rounded-md font-display text-base sm:text-lg font-black uppercase tracking-widest border-2 transition-transform active:scale-[0.99]"
                style={{
                  borderColor: `${sala.color}99`,
                  background: `linear-gradient(180deg, ${sala.color}26, ${sala.color}0d)`,
                  color: sala.color,
                  boxShadow: `0 0 22px ${sala.color}22`,
                }}
                aria-label={`Entrar a tu sala ${sala.nombre}`}
              >
                <span className="inline-flex items-center justify-center gap-2.5">
                  <DoorOpen className="w-5 h-5" />
                  Entrar a tu sala: {sala.nombre}
                </span>
              </button>
              <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                <p className="text-[10px] font-mono text-muted-foreground">
                  {sala.desc} — elegida por ti, guardada en TU aparato.
                </p>
                <button
                  onClick={cambiar}
                  className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Elegir otra sala"
                >
                  <Repeat className="w-3 h-3" /> cambiar de sala
                </button>
              </div>
            </div>
          ) : (
            /* ── MODO PRIMERA VEZ: 5 SALAS GRANDES ── */
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              {SALAS.map((s) => (
                <button
                  key={s.tab}
                  onClick={() => elegir(s)}
                  className="group text-left rounded-md border border-border/60 bg-black/30 p-3 min-h-[64px] transition-colors hover:bg-black/50"
                  style={{ ["--vg193-s" as string]: s.color }}
                  aria-label={`Entrar a ${s.nombre}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="grid place-items-center w-8 h-8 rounded-sm border"
                      style={{ borderColor: `${s.color}66`, background: `${s.color}14`, color: s.color }}
                    >
                      {s.icono}
                    </span>
                    <span className="font-display text-[13px] font-bold tracking-wide" style={{ color: s.color }}>
                      {s.nombre}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] font-mono text-muted-foreground leading-snug">{s.desc}</p>
                </button>
              ))}
              <div className="rounded-md border border-dashed border-border/40 p-3 min-h-[64px] flex items-center">
                <p className="text-[10px] font-mono text-muted-foreground leading-snug">
                  Tu elección se recuerda: la próxima vez <b className="text-foreground">entras en un toque</b>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* v195 TU LADO — la invitación del centinela a los sin pasaporte */}
      {!account && listo && (
        <div className="mt-3 rounded-md border border-dashed border-amber-hud/40 bg-amber-hud/5 px-3 py-2.5 flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[10px] font-mono text-amber leading-relaxed min-w-0">
            <b className="text-foreground">¿Sin cuenta?</b> Créala gratis en 10 segundos: +300 monedas, guardas tu progreso en la nube y declaras tu lado en los problemas del mundo.
          </p>
          <button
            onClick={abrirCuenta}
            className="shrink-0 inline-flex items-center gap-1.5 min-h-[34px] px-3 rounded-md border border-amber-hud/60 bg-amber-hud/15 font-mono text-[10px] uppercase tracking-widest text-amber hover:bg-amber-hud/30 transition-colors"
            aria-label="Crear cuenta gratis en Vanguard"
            data-vg195-cta-cuenta="1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Crear cuenta
          </button>
        </div>
      )}
    </section>
  );
}

function habandoLabel(hablando: boolean) {
  return hablando ? "Callar" : "Vigo saluda";
}
