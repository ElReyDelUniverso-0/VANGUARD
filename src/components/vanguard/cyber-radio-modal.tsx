"use client";

import { useEffect, useRef, useState } from "react";
import { Radio, Volume2, VolumeX, Play, Square, Sparkles, Disc } from "lucide-react";
import { EMISORAS, type Emisora } from "@/lib/musica/radios";
import {
  iniciarCyberSynth,
  pararCyberSynth,
  estaCyberSynthSonando,
  setVolumenCyberSynth,
} from "@/lib/musica/cyber-synth";

export function BotonCyberRadio() {
  const [abierto, setAbierto] = useState(false);
  const [emisoraActiva, setEmisoraActiva] = useState<Emisora | null>(null);
  const [sonandoRadio, setSonandoRadio] = useState(false);
  const [synthActivo, setSynthActivo] = useState(false);
  const [volumen, setVolumen] = useState(0.5);
  const [mudo, setMudo] = useState(false);
  const [aviso, setAviso] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Detener todo al desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      pararCyberSynth();
    };
  }, []);

  const encenderEmisora = (e: Emisora) => {
    if (synthActivo) {
      pararCyberSynth();
      setSynthActivo(false);
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    setEmisoraActiva(e);
    setAviso("Sintonizando estación...");

    const audio = new Audio(e.url);
    audio.volume = mudo ? 0 : volumen;
    audioRef.current = audio;

    audio.addEventListener("playing", () => {
      setSonandoRadio(true);
      setAviso("");
    });

    audio.addEventListener("error", () => {
      setSonandoRadio(false);
      setAviso(`La estación ${e.nombre} está temporalmente inaccesible. Prueba otra.`);
    });

    void audio.play().catch(() => {
      setAviso("Haz clic de nuevo para autorizar el audio en tu navegador.");
    });
  };

  const apagarRadio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setSonandoRadio(false);
    setEmisoraActiva(null);
    setAviso("");
  };

  const alternarSynth = () => {
    if (sonandoRadio) {
      apagarRadio();
    }

    if (synthActivo) {
      pararCyberSynth();
      setSynthActivo(false);
    } else {
      iniciarCyberSynth(mudo ? 0.001 : volumen);
      setSynthActivo(true);
    }
  };

  const cambiarVolumen = (v: number) => {
    setVolumen(v);
    if (audioRef.current) {
      audioRef.current.volume = mudo ? 0 : v;
    }
    setVolumenCyberSynth(mudo ? 0.001 : v);
  };

  const estaSonando = sonandoRadio || synthActivo;

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-label="Abrir Cyber Radio & Música Táctica"
        className={`group relative flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono transition-all ${
          estaSonando
            ? "border-sky-400 bg-sky-950/60 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
            : "border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-sky-500/50 hover:text-zinc-100"
        }`}
      >
        <span className="relative flex h-2 w-2">
          {estaSonando && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              estaSonando ? "bg-sky-400" : "bg-zinc-600 group-hover:bg-sky-400"
            }`}
          />
        </span>

        <Radio size={13} className={estaSonando ? "text-sky-300 animate-pulse" : "text-zinc-400"} />
        <span className="hidden sm:inline font-bold tracking-wider">
          {synthActivo ? "CYBERSYNTH" : emisoraActiva ? emisoraActiva.nombre.slice(0, 14) : "RADIO"}
        </span>

        {/* Barras de ecualizador activas */}
        {estaSonando && (
          <span className="flex items-end gap-0.5 h-3 ml-0.5">
            <span className="w-0.5 bg-sky-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-full" />
            <span className="w-0.5 bg-sky-400 rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-2" />
            <span className="w-0.5 bg-sky-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-3" />
          </span>
        )}
      </button>

      {/* MODAL / DOCK DE RADIO */}
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-xl border border-sky-500/30 bg-[#090b14] p-5 shadow-[0_0_30px_rgba(56,189,248,0.25)] text-zinc-100">
            {/* Header del dock */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                  <Radio size={16} />
                </span>
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-zinc-100">
                    VANGUARD CYBER RADIO & SYNTH
                  </h3>
                  <span className="font-mono text-[10px] text-sky-400 uppercase tracking-widest">
                    Audio Táctico & Paisajes Hiperfuturistas
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAbierto(false)}
                className="rounded p-1 font-mono text-xs text-zinc-500 hover:text-zinc-200"
              >
                ✕ CERRAR
              </button>
            </div>

            {/* Ecualizador Visual / Status */}
            <div className="my-4 rounded-lg border border-sky-500/20 bg-zinc-950 p-4 text-center">
              {estaSonando ? (
                <div>
                  <span className="font-mono text-[10px] text-sky-400 uppercase tracking-widest">
                    {synthActivo ? "GENERADOR NEURAL ACTIVO" : `EMITIENDO EN DIRECTO`}
                  </span>
                  <p className="mt-1 font-mono text-base font-bold text-zinc-100">
                    {synthActivo ? "Deep Blade Runner Ambient Pads" : emisoraActiva?.nombre}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {synthActivo
                      ? "Sintetizador Web Audio nativo en modo Dórico (cero ruidos ni sirenas)"
                      : emisoraActiva?.nota}
                  </p>

                  {/* Visualizador de frecuencias */}
                  <div className="mt-3 flex h-8 items-end justify-center gap-1">
                    {[12, 28, 16, 32, 24, 18, 30, 14, 26, 20, 32, 18, 24, 12].map((alt, i) => (
                      <span
                        key={i}
                        className="w-1.5 rounded-t bg-gradient-to-t from-sky-500 to-amber-300 animate-pulse"
                        style={{
                          height: `${alt}px`,
                          animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <p className="font-mono text-xs text-zinc-400">Sintonizador en silencio</p>
                  <p className="text-[11px] text-zinc-500">
                    Elige una emisora en directo o arranca el sintetizador cyberpunk.
                  </p>
                </div>
              )}

              {aviso && (
                <p className="mt-2 rounded bg-amber-500/10 p-1 font-mono text-xs text-amber-300">
                  {aviso}
                </p>
              )}
            </div>

            {/* Selector de Modo Rápido */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={alternarSynth}
                className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 font-mono text-xs font-bold transition ${
                  synthActivo
                    ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,197,66,0.3)]"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-amber-500/50"
                }`}
              >
                <Sparkles size={14} />
                {synthActivo ? "DETENER SYNTH" : "ACTIVAR CYBERSYNTH"}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (sonandoRadio) apagarRadio();
                  else encenderEmisora(EMISORAS[0]);
                }}
                className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 font-mono text-xs font-bold transition ${
                  sonandoRadio
                    ? "border-sky-400 bg-sky-500/20 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-sky-500/50"
                }`}
              >
                <Disc size={14} />
                {sonandoRadio ? "APAGAR STREAM" : "DEF CON CYBER LIVE"}
              </button>
            </div>

            {/* Lista de Emisoras Verificadas */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                EMISORAS TÁCTICAS DISPONIBLES
              </span>
              {EMISORAS.map((e) => {
                const activa = emisoraActiva?.id === e.id && sonandoRadio;
                return (
                  <div
                    key={e.id}
                    className={`flex items-center justify-between rounded border p-2 transition ${
                      activa
                        ? "border-sky-500/50 bg-sky-950/40 text-sky-200"
                        : "border-zinc-800/80 bg-zinc-950/40 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-xs truncate">{e.nombre}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{e.idioma} · {e.pais}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => (activa ? apagarRadio() : encenderEmisora(e))}
                      className={`shrink-0 rounded px-2.5 py-1 font-mono text-[10px] uppercase font-semibold transition ${
                        activa
                          ? "bg-red-500/20 text-red-300 border border-red-500/40"
                          : "bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30"
                      }`}
                    >
                      {activa ? "DETENER" : "SINTONIZAR"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Barra de Control de Volumen */}
            <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const nm = !mudo;
                    setMudo(nm);
                    if (audioRef.current) audioRef.current.volume = nm ? 0 : volumen;
                    setVolumenCyberSynth(nm ? 0.001 : volumen);
                  }}
                  className="text-zinc-400 hover:text-zinc-100"
                >
                  {mudo || volumen === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={mudo ? 0 : volumen}
                  onChange={(e) => cambiarVolumen(Number(e.target.value))}
                  className="w-24 accent-sky-400"
                />
              </div>

              <span className="font-mono text-[10px] text-zinc-500">
                VANGUARD SOUND SYSTEM
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
