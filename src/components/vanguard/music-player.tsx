"use client";

// VANGUARD v26 — RADIO VANGUARD: reproductor global de MÚSICA DE CONFLICTO.
// Widget flotante con 6 pistas sintetizadas en vivo (Web Audio, cero assets).
// Persistencia: vanguard_music {on, vol, track} — al recargar con ON se queda
// "en pausa lista" (los navegadores exigen un gesto del usuario para sonar).

import { useState, useSyncExternalStore } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Radio, ChevronUp, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MUSIC_TRACKS, startMusic, stopMusic, isMusicPlaying, currentTrackId,
  setMusicVolume, getMusicVolume, subscribeMusic,
} from "@/lib/conflict-music";

const LS_MUSIC = "vanguard_music";

function readSaved(): { on: boolean; vol: number; track: string } {
  try {
    const raw = localStorage.getItem(LS_MUSIC);
    if (raw) {
      const p = JSON.parse(raw);
      return { on: p.on === true, vol: typeof p.vol === "number" ? p.vol : 0.5, track: p.track || "marcha" };
    }
  } catch { /* noop */ }
  return { on: false, vol: 0.5, track: "marcha" };
}

function useMusicSnapshot() {
  return useSyncExternalStore(
    (cb) => subscribeMusic(cb),
    () => `${isMusicPlaying()}-${currentTrackId()}-${getMusicVolume().toFixed(2)}`
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

  const persist = (on: boolean, v: number, track: string) => {
    try {
      localStorage.setItem(LS_MUSIC, JSON.stringify({ on, vol: v, track }));
    } catch { /* noop */ }
  };

  const toggle = () => {
    if (playing) {
      stopMusic();
      setWantOn(false);
      persist(false, vol, selTrack);
    } else {
      const t = selTrack || "marcha";
      setSelTrack(t);
      setMusicVolume(vol);
      startMusic(t);
      setWantOn(true);
      persist(true, vol, t);
    }
  };

  const switchTrack = (id: string, autoplay = true) => {
    setSelTrack(id);
    persist(playing || wantOn, vol, id);
    if (autoplay && (playing || wantOn)) startMusic(id);
  };

  const changeVol = (v: number) => {
    setVol(v);
    setMusicVolume(v);
    persist(playing || wantOn, v, selTrack);
  };

  const cur = MUSIC_TRACKS.find((t) => t.id === (curId || selTrack)) || MUSIC_TRACKS[0];
  const idx = MUSIC_TRACKS.findIndex((t) => t.id === cur.id);
  void snap; // la suscripción re-renderiza el widget en play/stop/vol

  return (
    <div className="fixed bottom-14 right-2 sm:bottom-3 sm:right-3 z-40 select-none">
      <div
        className={cn(
          "hud-panel border-amber-hud overflow-hidden transition-all",
          expanded ? "w-64" : "w-auto"
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

          <div className="min-w-0 max-w-[120px] sm:max-w-[170px]">
            <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground leading-none">
              <Radio className={cn("w-2.5 h-2.5", playing ? "text-red-hud blink-soft" : "text-muted-foreground")} />
              RADIO VANGUARD
            </div>
            <div className="text-[10px] font-mono font-bold text-amber truncate leading-tight">
              {playing ? cur.name : wantOn ? `${cur.name} (pausada)` : cur.name}
            </div>
          </div>

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

        {/* expansión: 6 pistas de conflicto */}
        {expanded && (
          <div className="border-t border-amber-hud/30 max-h-56 overflow-y-auto thin-scroll">
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
              Música sintetizada en vivo · sin descargas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
