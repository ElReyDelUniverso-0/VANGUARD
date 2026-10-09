"use client";

// VANGUARD v83.0 ESTADIO GLOBAL — RADIO VANGUARD+ (reproductor global).
// v26: 6 pistas sintetizadas en vivo. v31: motor cinematográfico v2.
// v83: · 15 pistas (ocaso / blitz / himno nuevas)
//      · VISUALIZADOR de espectro en vivo (AnalyserNode, barras a transform, 60fps)
//      · MODO CINE: la radio elige la pista según el TERMÓMETRO DE TENSIÓN
//        (getTension) — calma → ocaso · tensión → marcha · crisis → cerco ·
//        PROTOCOLO ROJO → Blitz Total. Persistencia: vanguard_music {on,vol,track,auto}.
// v98.0 ORO TOTAL: · 24 pistas (oro / grafo / neon / bóveda nuevas, motor v3 con
//        variación diaria y ensanche estéreo)
//      · MODO ESCENA: la radio cambia de pista sola según la SECCIÓN donde estás
//        (escucha el evento vanguard:escena que dispara la app al cambiar de
//        mundo), con fundido cruzado — tu banda sonora te sigue.

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Radio, ChevronUp, ChevronDown, Clapperboard, Orbit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  MUSIC_TRACKS, startMusic, stopMusic, isMusicPlaying, currentTrackId,
  setMusicVolume, getMusicVolume, subscribeMusic, getMusicSpectrum,
  aplicarEscena, setEscenaActiva, getEscenaActiva, type EscenaKey,
} from "@/lib/conflict-music";
import { getTension } from "@/lib/tension";

const LS_MUSIC = "vanguard_music";

function readSaved(): { on: boolean; vol: number; track: string; auto: boolean; escena: boolean } {
  try {
    const raw = localStorage.getItem(LS_MUSIC);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        on: p.on === true,
        vol: typeof p.vol === "number" ? p.vol : 0.5,
        track: p.track || "amanecer",
        auto: p.auto === true,
        escena: p.escena === true,
      };
    }
  } catch { /* noop */ }
  return { on: false, vol: 0.5, track: "amanecer", auto: false, escena: false };
}

function useMusicSnapshot() {
  return useSyncExternalStore(
    (cb) => subscribeMusic(cb),
    () => `${isMusicPlaying()}-${currentTrackId()}-${getMusicVolume().toFixed(2)}`
  );
}

// ====== MODO CINE: pista por nivel de tensión ======
// v88: la calma ahora abre con "amanecer" (nueva sesión) — el ocaso queda a un clic
const AUTO_TRACKS = ["amanecer", "marcha", "cerco", "blitz"] as const;
const AUTO_NAMES = ["Operación Amanecer", "Marcha de Acero", "Cerco Urbano", "Blitz Total"];
function tierOf(tension: number): 0 | 1 | 2 | 3 {
  if (tension >= 85) return 3; // PROTOCOLO ROJO
  if (tension >= 70) return 2; // CRISIS
  if (tension >= 40) return 1; // tensión base
  return 0; // calma
}

// ====== visualizador de espectro (solo transform por frame → 60fps) ======
function Spectrum({ bars, mini = false }: { bars: number; mini?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    let idle = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        const spec = getMusicSpectrum(bars);
        const kids = el.children;
        for (let i = 0; i < kids.length; i++) {
          let v: number;
          if (spec) {
            v = spec[i] ?? 0.05;
          } else {
            // reposo: onda mínima que respira (no está sonando)
            idle += 0.03;
            v = 0.05 + Math.abs(Math.sin(idle + i * 0.55)) * 0.06;
          }
          (kids[i] as HTMLElement).style.transform = `scaleY(${Math.max(0.05, v).toFixed(3)})`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [bars]);
  return (
    <div ref={ref} className={cn("flex items-end", mini ? "h-4 gap-[2px]" : "h-10 gap-[3px]")} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "origin-bottom rounded-sm will-change-transform",
            mini ? "w-[3px]" : "w-1 flex-1",
            i > bars - 5
              ? "bg-gradient-to-t from-red-hud/60 to-red-hud"
              : "bg-gradient-to-t from-amber/40 via-amber-hud/90 to-amber"
          )}
          style={{ height: "100%", transform: "scaleY(0.05)" }}
        />
      ))}
    </div>
  );
}

export function MusicPlayer() {
  const snap = useMusicSnapshot();
  const playing = isMusicPlaying();
  const curId = currentTrackId();
  const [expanded, setExpanded] = useState(false);
  const [wantOn, setWantOn] = useState(false); // intención del usuario (persistida)
  // ssr:false en page.tsx → localStorage seguro en el primer render (sin efectos)
  const [saved] = useState(() => readSaved());
  const [vol, setVol] = useState(saved.vol);
  const [selTrack, setSelTrack] = useState(saved.track);
  const [auto, setAuto] = useState(saved.auto); // MODO CINE
  const [escena, setEscena] = useState(saved.escena); // v98.0 MODO ESCENA
  const tierRef = useRef<number>(tierOf(getTension()));

  const persist = (on: boolean, v: number, track: string, autoFlag = auto, escenaFlag = escena) => {
    try {
      localStorage.setItem(LS_MUSIC, JSON.stringify({ on, vol: v, track, auto: autoFlag, escena: escenaFlag }));
    } catch { /* noop */ }
  };

  const toggle = () => {
    if (playing) {
      stopMusic();
      setWantOn(false);
      persist(false, vol, selTrack);
    } else {
      const t = selTrack || "amanecer";
      setSelTrack(t);
      setMusicVolume(vol);
      startMusic(t);
      setWantOn(true);
      persist(true, vol, t);
    }
  };

  const switchTrack = (id: string, autoplay = true) => {
    setSelTrack(id);
    // elegir pista a mano apaga el MODO CINE y el MODO ESCENA (el DJ eres tú)
    if (auto || escena) {
      setAuto(false);
      setEscena(false);
      persist(playing || wantOn, vol, id, false, false);
      toast.info("DJ manual", { description: "Elegiste la pista a mano — la radio ya no cambia sola" });
    } else {
      persist(playing || wantOn, vol, id, false, false);
    }
    if (autoplay && (playing || wantOn)) startMusic(id);
  };

  const changeVol = (v: number) => {
    setVol(v);
    setMusicVolume(v);
    persist(playing || wantOn, v, selTrack);
  };

  const toggleAuto = () => {
    if (auto) {
      setAuto(false);
      persist(playing || wantOn, vol, selTrack, false);
      toast.info("MODO CINE apagado");
      return;
    }
    const tier = tierOf(getTension());
    tierRef.current = tier;
    const track = AUTO_TRACKS[tier];
    setAuto(true);
    setSelTrack(track);
    if (!playing && !wantOn) {
      setWantOn(true);
      setMusicVolume(vol);
      startMusic(track);
    } else {
      startMusic(track);
    }
    persist(true, vol, track, true);
    toast.success(`MODO CINE · tensión ${Math.round(getTension())}`, {
      description: `Suena ${AUTO_NAMES[tier]} — la radio sigue el termómetro del mundo`,
    });
  };

  // v98.0 MODO ESCENA — cambia de pista al escuchar vanguard:escena (lo dispara
  // la app al cambiar de sección; el motor hace el fundido cruzado)
  useEffect(() => {
    const onEscena = (e: Event) => {
      const key = (e as CustomEvent).detail as EscenaKey;
      if (!key) return;
      setEscenaActiva(key);
      if (escena && (playing || wantOn)) aplicarEscena(key);
    };
    window.addEventListener("vanguard:escena", onEscena);
    // si la escena ya estaba activa al montar (o arranque en frío tras recargar),
    // sincroniza con la sección actual — la radio nunca empieza desorientada
    if (escena && (playing || wantOn)) {
      const act = getEscenaActiva();
      aplicarEscena(act ?? "inicio");
    }
    return () => window.removeEventListener("vanguard:escena", onEscena);
  }, [escena, playing, wantOn]);

  const toggleEscena = () => {
    if (escena) {
      setEscena(false);
      persist(playing || wantOn, vol, selTrack || "amanecer", auto, false);
      toast.info("MODO ESCENA apagado");
      return;
    }
    // activar escena apaga el modo cine (una sola inteligencia musical a la vez)
    setAuto(false);
    const act = getEscenaActiva();
    setEscena(true);
    if (!playing && !wantOn) {
      setWantOn(true);
      setMusicVolume(vol);
    }
    if (act) {
      aplicarEscena(act); // arranca (o funde a) la pista de la sección actual
      setSelTrack("");
    } else {
      startMusic("oro");
    }
    persist(true, vol, act ? "oro" : "oro", false, true);
    toast.success("MODO ESCENA · activo", {
      description: "La radio cambia de pista sola según la sección de Vanguard donde estés",
    });
  };

  // MODO CINE activo: revisa el termómetro cada 30 s y cambia de pista al cruzar umbrales
  useEffect(() => {
    if (!auto || !playing) return;
    tierRef.current = tierOf(getTension());
    const iv = setInterval(() => {
      const tier = tierOf(getTension());
      if (tier === tierRef.current) return;
      tierRef.current = tier;
      const track = AUTO_TRACKS[tier];
      setSelTrack(track);
      startMusic(track);
      persist(true, vol, track, true);
      toast.info(`MODO CINE · suena ${AUTO_NAMES[tier]}`, {
        description: `El termómetro de tensión marcó ${Math.round(getTension())}`,
      });
    }, 30000);
    return () => clearInterval(iv);
  }, [auto, playing]); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = MUSIC_TRACKS.find((t) => t.id === (curId || selTrack)) || MUSIC_TRACKS[0];
  const idx = MUSIC_TRACKS.findIndex((t) => t.id === cur.id);
  void snap; // la suscripción re-renderiza el widget en play/stop/vol

  return (
    <div className="fixed bottom-14 right-2 sm:bottom-3 sm:right-3 z-40 select-none">
      <div
        className={cn(
          "hud-panel border-amber-hud overflow-hidden transition-all",
          expanded ? "w-72" : "w-auto"
        )}
      >
        {/* fila principal */}
        <div className="flex items-center gap-1 px-2 py-1.5">
          <button
            onClick={toggle}
            aria-label={playing ? "Pausar música de conflicto" : "Reproducir música de conflicto"}
            className={cn(
              "w-7 h-7 rounded-sm flex items-center justify-center border transition-colors shrink-0",
              playing
                ? "bg-red-hud/40 border-red-hud text-red-hud"
                : "bg-amber-hud/30 border-amber-hud text-amber hover:bg-amber-hud/60"
            )}
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <div className="min-w-0 max-w-[104px] sm:max-w-[150px]">
            <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground leading-none">
              <Radio className={cn("w-2.5 h-2.5", playing ? "text-red-hud blink-soft" : "text-muted-foreground")} />
              RADIO VANGUARD+
            </div>
            <div className="text-[10px] font-mono font-bold text-amber truncate leading-tight">
              {playing ? cur.name : wantOn ? `${cur.name} (pausada)` : cur.name}
            </div>
          </div>

          {/* mini espectro en vivo (solo si suena) */}
          {playing && (
            <div className="hidden sm:block shrink-0 w-8">
              <Spectrum bars={5} mini />
            </div>
          )}

          <div className="hidden sm:flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => switchTrack(MUSIC_TRACKS[(idx - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length].id)}
              aria-label="Pista anterior"
              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-amber"
            >
              <SkipBack className="w-3 h-3" />
            </button>
            <button
              onClick={() => switchTrack(MUSIC_TRACKS[(idx + 1) % MUSIC_TRACKS.length].id)}
              aria-label="Pista siguiente"
              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-amber"
            >
              <SkipForward className="w-3 h-3" />
            </button>
          </div>

          {/* volumen compacto */}
          <div className="hidden md:flex items-center gap-1 shrink-0 w-16">
            <VolumeX className="w-3 h-3 text-muted-foreground shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(vol * 100)}
              onChange={(e) => changeVol(parseInt(e.target.value, 10) / 100)}
              aria-label="Volumen de la música"
              className="w-full h-1 accent-amber"
            />
            <Volume2 className="w-3 h-3 text-amber shrink-0" />
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Cerrar lista de pistas" : "Abrir lista de pistas"}
            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-amber shrink-0"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* expansión: espectro grande + MODO CINE + 20 pistas */}
        {expanded && (
          <div className="border-t border-amber-hud/30 max-h-[300px] overflow-y-auto thin-scroll">
            {/* visualizador grande */}
            <div className="px-3 pt-2.5 pb-1">
              <Spectrum bars={22} />
              <div className="flex items-center justify-between mt-1">
                <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                  espectro en vivo
                </span>
                <span className="text-[8px] font-mono text-amber/70 uppercase">{cur.bpm} BPM</span>
              </div>
            </div>

            {/* MODO CINE */}
            <button
              onClick={toggleAuto}
              className={cn(
                "mx-3 mb-2 w-[calc(100%-24px)] flex items-center gap-2 px-2.5 py-2 border rounded-sm transition-colors text-left",
                auto
                  ? "border-red-hud bg-red-hud/15"
                  : "border-border/60 hover:border-amber-hud/60 hover:bg-amber-hud/10"
              )}
              aria-pressed={auto}
            >
              <Clapperboard className={cn("w-3.5 h-3.5 shrink-0", auto ? "text-red-hud" : "text-muted-foreground")} />
              <span className="min-w-0">
                <span className={cn("block text-[10px] font-mono font-bold uppercase tracking-wider", auto ? "text-red-hud" : "text-foreground")}>
                  MODO CINE {auto ? "· ACTIVO" : ""}
                </span>
                <span className="block text-[8px] font-mono text-muted-foreground leading-snug">
                  La radio sigue el termómetro de tensión: calma→ocaso · guerra→marcha · crisis→cerco · rojo→blitz
                </span>
              </span>
              {auto && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-hud blink-soft shrink-0" />}
            </button>

            {/* v98.0 MODO ESCENA — la banda sonora sigue tu posición en Vanguard */}
            <button
              onClick={toggleEscena}
              className={cn(
                "mx-3 mb-2 w-[calc(100%-24px)] flex items-center gap-2 px-2.5 py-2 border rounded-sm transition-colors text-left",
                escena
                  ? "border-amber-hud bg-amber-hud/20"
                  : "border-border/60 hover:border-amber-hud/60 hover:bg-amber-hud/10"
              )}
              aria-pressed={escena}
            >
              <Orbit className={cn("w-3.5 h-3.5 shrink-0", escena ? "text-amber" : "text-muted-foreground")} />
              <span className="min-w-0">
                <span className={cn("block text-[10px] font-mono font-bold uppercase tracking-wider", escena ? "text-amber" : "text-foreground")}>
                  MODO ESCENA {escena ? "· ACTIVO" : ""}
                </span>
                <span className="block text-[8px] font-mono text-muted-foreground leading-snug">
                  La banda sonora te sigue: INICIO→Oro · INTELIGENCIA→Pulso del Grafo · EMISORA→Neón Vertical · ARCHIVO→Bóveda Secreta
                </span>
              </span>
              {escena && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber blink-soft shrink-0" />}
            </button>

            {MUSIC_TRACKS.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTrack(t.id)}
                className={cn(
                  "w-full text-left px-3 py-1.5 border-b border-amber-hud/10 hover:bg-amber-hud/20 transition-colors",
                  t.id === cur.id && "bg-amber-hud/20"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("text-[10px] font-mono font-bold uppercase tracking-wide", t.id === cur.id ? "text-amber" : "text-foreground")}>
                    {t.name}
                  </span>
                  <span className="text-[8px] font-mono text-muted-foreground shrink-0">{t.bpm} BPM</span>
                </div>
                <div className="text-[9px] text-muted-foreground leading-snug">{t.desc}</div>
              </button>
            ))}
            <div className="px-3 py-2 md:hidden flex items-center gap-1">
              <VolumeX className="w-3 h-3 text-muted-foreground shrink-0" />
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(vol * 100)}
                onChange={(e) => changeVol(parseInt(e.target.value, 10) / 100)}
                aria-label="Volumen de la música"
                className="w-full h-1 accent-amber"
              />
              <Volume2 className="w-3 h-3 text-amber shrink-0" />
            </div>
            <p className="px-3 py-1.5 text-[8px] font-mono text-muted-foreground/70 uppercase tracking-widest">
              24 pistas sintetizadas en vivo · variación diaria única · sin descargas · sesión v98
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
