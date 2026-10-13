"use client";

// VANGUARD v111.0 MÁQUINA DEL TIEMPO — RADIO VANGUARD+ con AUDITORIO.
// v109: 28 pistas con el motor ORQUESTA DE ORO + MODO AUDITORIO.
// v111: · ECUALIZADOR DE SALA (3 bandas Graves/Medios/Agudos ±12 dB)
//       · SESIÓN CONTINUA: la radio encadena obras sola, sin cortes
//       · CADA OBRA con su MINI-ESCENA 3D en la colección
//       · HORA REAL en las ciudades 3D y era 1950→2100 en el Motor 3D

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Radio, ChevronUp, ChevronDown, Clapperboard, Orbit, ListMusic, X, Repeat, SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  MUSIC_TRACKS, startMusic, stopMusic, isMusicPlaying, currentTrackId,
  setMusicVolume, getMusicVolume, subscribeMusic, getMusicSpectrum,
  aplicarEscena, setEscenaActiva, getEscenaActiva, edicionDeHoy, EDICIONES_TOTAL,
  setEqBand, type BandaEq,
  type EscenaKey, type TrackCat,
} from "@/lib/conflict-music";
import { Escena3D, hashDe, type VarianteEscena } from "@/components/vanguard/escenas-3d";
import { sfx } from "@/lib/sound";
import { getTension } from "@/lib/tension";
import { useT } from "@/lib/i18n";

const LS_MUSIC = "vanguard_music";

interface GuardadoRadio {
  on: boolean; vol: number; track: string; auto: boolean; escena: boolean;
  cont: boolean; eq: { bajo: number; medio: number; alto: number };
}

function readSaved(): GuardadoRadio {
  try {
    const raw = localStorage.getItem(LS_MUSIC);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        on: p.on === true,
        vol: typeof p.vol === "number" ? p.vol : 0.5,
        track: p.track || "orquesta",
        auto: p.auto === true,
        escena: p.escena === true,
        cont: p.cont === true,
        eq: {
          bajo: typeof p.eq?.bajo === "number" ? p.eq.bajo : 0,
          medio: typeof p.eq?.medio === "number" ? p.eq.medio : 0,
          alto: typeof p.eq?.alto === "number" ? p.eq.alto : 0,
        },
      };
    }
  } catch { /* noop */ }
  return { on: false, vol: 0.5, track: "orquesta", auto: false, escena: false, cont: false, eq: { bajo: 0, medio: 0, alto: 0 } };
}

function useMusicSnapshot() {
  return useSyncExternalStore(
    (cb) => subscribeMusic(cb),
    () => `${isMusicPlaying()}-${currentTrackId()}-${getMusicVolume().toFixed(2)}`
  );
}

// ====== MODO CINE: pista por nivel de tensión ======
// v109: la calma abre con la insignia de la casa — Orquesta de Oro
const AUTO_TRACKS = ["orquesta", "marcha", "cerco", "blitz"] as const;
const AUTO_NAMES = ["Orquesta de Oro", "Marcha de Acero", "Cerco Urbano", "Blitz Total"];
function tierOf(tension: number): 0 | 1 | 2 | 3 {
  if (tension >= 85) return 3; // PROTOCOLO ROJO
  if (tension >= 70) return 2; // CRISIS
  if (tension >= 40) return 1; // tensión base
  return 0; // calma
}

// ====== v109: familias de la colección ======
const CATS: { id: TrackCat; key: string; dot: string }[] = [
  { id: "vanguard", key: "radio109.cat.vanguard", dot: "bg-amber" },
  { id: "guerra", key: "radio109.cat.guerra", dot: "bg-red-hud" },
  { id: "ambiente", key: "radio109.cat.ambiente", dot: "bg-cyan-400" },
];
const catLabel = (c: TrackCat, tr: (k: string) => string) =>
  tr(CATS.find((x) => x.id === c)?.key ?? "radio109.cat.ambiente");

// v111: cada obra respira en su propia mini-escena 3D (familia → variante)
const CAT_ESCENA: Record<TrackCat, VarianteEscena> = {
  vanguard: "nucleo",
  guerra: "guerra",
  ambiente: "onda",
};

// ====== visualizador de espectro (solo transform por frame → 60fps) ======
function Spectrum({ bars, big = false }: { bars: number; big?: boolean }) {
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
    <div ref={ref} className={cn("flex items-end", big ? "h-24 sm:h-28 gap-[3px]" : "h-10 gap-[3px]")} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "origin-bottom rounded-sm will-change-transform flex-1",
            big ? "w-1.5" : "w-1",
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
  const { t } = useT();
  const [expanded, setExpanded] = useState(false);
  const [auditorio, setAuditorio] = useState(false);
  const [wantOn, setWantOn] = useState(false); // intención del usuario (persistida)
  // ssr:false en page.tsx → localStorage seguro en el primer render (sin efectos)
  const [saved] = useState(() => readSaved());
  const [vol, setVol] = useState(saved.vol);
  const [selTrack, setSelTrack] = useState(saved.track);
  const [auto, setAuto] = useState(saved.auto); // MODO CINE
  const [escena, setEscena] = useState(saved.escena); // v98.0 MODO ESCENA
  // v111: SESIÓN CONTINUA + ECUALIZADOR DE SALA
  const [cont, setCont] = useState(saved.cont);
  const [eq, setEq] = useState(saved.eq);
  const tierRef = useRef<number>(tierOf(getTension()));

  const persist = (on: boolean, v: number, track: string, autoFlag = auto, escenaFlag = escena, contFlag = cont, eqVal = eq) => {
    try {
      localStorage.setItem(LS_MUSIC, JSON.stringify({ on, vol: v, track, auto: autoFlag, escena: escenaFlag, cont: contFlag, eq: eqVal }));
    } catch { /* noop */ }
  };

  // v111: aplica el EQ guardado al encender la sala (los nodos toman el valor
  // aunque el AudioContext nazca después — setEqBand lo guarda en el motor)
  useEffect(() => {
    setEqBand("bajo", saved.eq.bajo);
    setEqBand("medio", saved.eq.medio);
    setEqBand("alto", saved.eq.alto);
  }, []);

  const toggle = () => {
    if (playing) {
      stopMusic();
      setWantOn(false);
      persist(false, vol, selTrack);
    } else {
      const trk = selTrack || "orquesta";
      setSelTrack(trk);
      setMusicVolume(vol);
      startMusic(trk);
      setWantOn(true);
      persist(true, vol, trk);
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

  // v111 SESIÓN CONTINUA — avance silencioso (no rompe los modos, sin toasts):
  // la obra siguiente de la colección entra con el fundido cruzado del motor.
  const avanzarSesion = () => {
    const idxActual = MUSIC_TRACKS.findIndex((x) => x.id === (currentTrackId() || selTrack));
    const nxt = MUSIC_TRACKS[(idxActual + 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length];
    if (!nxt) return;
    setSelTrack(nxt.id);
    if (playing || wantOn) startMusic(nxt.id);
    persist(playing || wantOn, vol, nxt.id);
  };

  // v111: mientras SESIÓN CONTINUA esté activa y suene música, cada ~3.5 min
  // pasa a la obra siguiente (la generativa respira 5 ciclos por obra)
  useEffect(() => {
    if (!cont || !playing) return;
    const iv = setInterval(avanzarSesion, 210_000);
    return () => clearInterval(iv);
  }, [cont, playing, selTrack, vol]);

  const toggleCont = () => {
    const nxt = !cont;
    setCont(nxt);
    if (nxt) {
      // una sola inteligencia musical a la vez
      setAuto(false);
      setEscena(false);
      if (!playing && !wantOn) {
        setWantOn(true);
        setMusicVolume(vol);
        startMusic(selTrack || "orquesta");
      }
      persist(playing || wantOn || true, vol, selTrack, false, false, true);
      toast.success("SESIÓN CONTINUA · activa", { description: "La radio encadena obras sola, sin cortes ni silencios" });
    } else {
      persist(playing || wantOn, vol, selTrack, auto, escena, false);
      toast.info("SESIÓN CONTINUA apagada");
    }
    sfx.click();
  };

  const cambiarBanda = (banda: BandaEq, v: number) => {
    const nxt = { ...eq, [banda]: v };
    setEq(nxt);
    setEqBand(banda, v);
    persist(playing || wantOn, vol, selTrack, auto, escena, cont, nxt);
  };

  const resetEq = () => {
    const cero = { bajo: 0, medio: 0, alto: 0 };
    setEq(cero);
    (Object.keys(cero) as BandaEq[]).forEach((b) => setEqBand(b, 0));
    persist(playing || wantOn, vol, selTrack, auto, escena, cont, cero);
    sfx.click();
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
    setCont(false); // v111: una sola inteligencia musical a la vez
    setSelTrack(track);
    if (!playing && !wantOn) {
      setWantOn(true);
      setMusicVolume(vol);
      startMusic(track);
    } else {
      startMusic(track);
    }
    persist(true, vol, track, true, escena, false);
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
      persist(playing || wantOn, vol, selTrack || "orquesta", auto, false);
      toast.info("MODO ESCENA apagado");
      return;
    }
    // activar escena apaga el modo cine (una sola inteligencia musical a la vez)
    setAuto(false);
    setCont(false); // v111: una sola inteligencia musical a la vez
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
      startMusic("orquesta");
    }
    persist(true, vol, "orquesta", false, true, false);
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

  // AUDITORIO: Esc sale (como el modo inmersión)
  useEffect(() => {
    if (!auditorio) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAuditorio(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [auditorio]);

  const cur = MUSIC_TRACKS.find((x) => x.id === (curId || selTrack)) || MUSIC_TRACKS[0];
  const idx = MUSIC_TRACKS.findIndex((x) => x.id === cur.id);
  void snap; // la suscripción re-renderiza el widget en play/stop/vol

  // ─────────────── MODO AUDITORIO (sala de escucha) ───────────────
  if (auditorio) {
    return (
      <div className="fixed inset-0 z-[70] overflow-y-auto thin-scroll v109-aud" role="dialog" aria-label={t("radio109.aud.titulo")}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(45,32,12,0.97),rgba(8,6,3,0.99))] backdrop-blur-md" />
        <div className="relative max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4 min-h-full">
          {/* cabecera */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
              <Radio className={cn("w-3.5 h-3.5", playing ? "text-red-hud blink-soft" : "text-muted-foreground")} />
              <span className="text-amber font-bold">RADIO VANGUARD+</span>
              <span className="px-1.5 py-0.5 border border-amber-hud/50 rounded-sm text-amber/90 text-[8px] tracking-widest">
                {t("radio109.aud.badge")}
              </span>
            </div>
            <button
              onClick={() => setAuditorio(false)}
              aria-label={t("radio109.aud.salir")}
              className="w-8 h-8 rounded-sm border border-amber-hud/40 flex items-center justify-center text-muted-foreground hover:text-amber hover:border-amber-hud transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* título */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-amber tracking-wide v109-brilla">{cur.name}</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">{cur.desc}</p>
            <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
              <span className="px-2 py-0.5 border border-amber-hud/40 rounded-sm text-[9px] font-mono text-amber/90">{cur.bpm} BPM</span>
              <span className="px-2 py-0.5 border border-amber-hud/40 rounded-sm text-[9px] font-mono text-foreground/80 flex items-center gap-1.5">
                <span className={cn("w-1.5 h-1.5 rounded-full", CATS.find((c) => c.id === cur.cat)?.dot ?? "bg-amber")} />
                {catLabel(cur.cat, t)}
              </span>
              <span className="px-2 py-0.5 border border-amber-hud/40 rounded-sm text-[9px] font-mono text-foreground/80">
                {t("radio109.aud.edicion")} Nº {edicionDeHoy()}/{EDICIONES_TOTAL}
              </span>
            </div>
          </div>

          {/* espectro grande */}
          <div className="hud-panel border-amber-hud/60 rounded-sm px-4 py-3">
            <Spectrum bars={32} big />
          </div>

          {/* controles */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => switchTrack(MUSIC_TRACKS[(idx - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length].id)}
              aria-label="Pista anterior"
              className="w-10 h-10 rounded-sm border border-amber-hud/40 flex items-center justify-center text-muted-foreground hover:text-amber transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={toggle}
              aria-label={playing ? "Pausar" : "Reproducir"}
              className={cn(
                "w-14 h-14 rounded-sm flex items-center justify-center border transition-colors",
                playing ? "bg-red-hud/40 border-red-hud text-red-hud" : "bg-amber-hud/30 border-amber-hud text-amber hover:bg-amber-hud/60"
              )}
            >
              {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={() => switchTrack(MUSIC_TRACKS[(idx + 1) % MUSIC_TRACKS.length].id)}
              aria-label="Pista siguiente"
              className="w-10 h-10 rounded-sm border border-amber-hud/40 flex items-center justify-center text-muted-foreground hover:text-amber transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 max-w-xs mx-auto w-full">
            <VolumeX className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              type="range" min={0} max={100}
              value={Math.round(vol * 100)}
              onChange={(e) => changeVol(parseInt(e.target.value, 10) / 100)}
              aria-label="Volumen de la música"
              className="w-full h-1 accent-amber"
            />
            <Volume2 className="w-3.5 h-3.5 text-amber shrink-0" />
          </div>

          {/* modos automáticos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={toggleAuto}
              aria-pressed={auto}
              className={cn(
                "flex items-center gap-2 px-3 py-2 border rounded-sm transition-colors text-left",
                auto ? "border-red-hud bg-red-hud/15" : "border-border/60 hover:border-amber-hud/60 hover:bg-amber-hud/10"
              )}
            >
              <Clapperboard className={cn("w-4 h-4 shrink-0", auto ? "text-red-hud" : "text-muted-foreground")} />
              <span className="min-w-0">
                <span className={cn("block text-[10px] font-mono font-bold uppercase tracking-wider", auto ? "text-red-hud" : "text-foreground")}>
                  MODO CINE {auto ? "· ON" : ""}
                </span>
                <span className="block text-[8px] font-mono text-muted-foreground leading-snug">
                  calma→Orquesta · guerra→Marcha · crisis→Cerco · rojo→Blitz
                </span>
              </span>
            </button>
            <button
              onClick={toggleEscena}
              aria-pressed={escena}
              className={cn(
                "flex items-center gap-2 px-3 py-2 border rounded-sm transition-colors text-left",
                escena ? "border-amber-hud bg-amber-hud/20" : "border-border/60 hover:border-amber-hud/60 hover:bg-amber-hud/10"
              )}
            >
              <Orbit className={cn("w-4 h-4 shrink-0", escena ? "text-amber" : "text-muted-foreground")} />
              <span className="min-w-0">
                <span className={cn("block text-[10px] font-mono font-bold uppercase tracking-wider", escena ? "text-amber" : "text-foreground")}>
                  MODO ESCENA {escena ? "· ON" : ""}
                </span>
                <span className="block text-[8px] font-mono text-muted-foreground leading-snug">
                  INICIO→Orquesta · OBSERVATORIO→Serena · SOCIAL→Sala · JUEGO→Frontera
                </span>
              </span>
            </button>
            {/* v111 SESIÓN CONTINUA — la radio DJ: encadena obras sin cortes */}
            <button
              onClick={toggleCont}
              aria-pressed={cont}
              className={cn(
                "flex items-center gap-2 px-3 py-2 border rounded-sm transition-colors text-left",
                cont ? "border-cyan-400 bg-cyan-400/15" : "border-border/60 hover:border-amber-hud/60 hover:bg-amber-hud/10"
              )}
            >
              <Repeat className={cn("w-4 h-4 shrink-0", cont ? "text-cyan-300" : "text-muted-foreground")} />
              <span className="min-w-0">
                <span className={cn("block text-[10px] font-mono font-bold uppercase tracking-wider", cont ? "text-cyan-300" : "text-foreground")}>
                  {t("radio111.cont")} {cont ? "· ON" : ""}
                </span>
                <span className="block text-[8px] font-mono text-muted-foreground leading-snug">
                  {t("radio111.contDesc")}
                </span>
              </span>
            </button>
          </div>

          {/* v111 ECUALIZADOR DE SALA — 3 bandas ±12 dB sobre la cadena de estudio */}
          <div className="hud-panel border-amber-hud/40 rounded-sm px-4 py-3">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-foreground/90">
                  {t("radio111.eq")}
                </span>
              </div>
              <button
                onClick={resetEq}
                className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground hover:text-amber transition-colors"
              >
                {t("radio111.eqReset")}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {([
                ["bajo", t("radio111.eqGraves")],
                ["medio", t("radio111.eqMedios")],
                ["alto", t("radio111.eqAgudos")],
              ] as const).map(([b, lbl]) => (
                <div key={b} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] font-mono tabular-nums text-amber/90">{eq[b] > 0 ? `+${eq[b]}` : eq[b]} dB</span>
                  <input
                    type="range" min={-12} max={12} step={1}
                    value={eq[b as BandaEq]}
                    onChange={(e) => cambiarBanda(b as BandaEq, parseInt(e.target.value, 10))}
                    aria-label={`${lbl} EQ`}
                    className="w-full h-1 accent-amber"
                  />
                  <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">{lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* colección por familias */}
          <div className="hud-panel border-amber-hud/40 rounded-sm overflow-hidden">
            {CATS.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-hud/5 border-b border-amber-hud/20">
                  <span className={cn("w-2 h-2 rounded-full", cat.dot)} />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-foreground/90">
                    {t(cat.key)}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground">
                    {MUSIC_TRACKS.filter((x) => x.cat === cat.id).length}
                  </span>
                </div>
                {MUSIC_TRACKS.filter((x) => x.cat === cat.id).map((trk) => (
                  <button
                    key={trk.id}
                    onClick={() => switchTrack(trk.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 border-b border-amber-hud/10 hover:bg-amber-hud/20 transition-colors flex items-center gap-3",
                      trk.id === cur.id && "bg-amber-hud/20"
                    )}
                  >
                    {/* v111: la obra respirando en su propia escena 3D (estática — 0 coste) */}
                    <Escena3D
                      variante={CAT_ESCENA[trk.cat]}
                      acento={trk.cat === "guerra" ? "#FF5A4E" : trk.cat === "ambiente" ? "#5EEAD4" : "#FFC94D"}
                      semilla={hashDe(trk.id)}
                      estatico
                      className="w-16 h-11 shrink-0 rounded-sm border border-amber-hud/20"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className={cn("text-[11px] font-mono font-bold uppercase tracking-wide", trk.id === cur.id ? "text-amber" : "text-foreground")}>
                          {trk.name}
                        </span>
                        <span className="text-[8px] font-mono text-muted-foreground shrink-0">{trk.bpm} BPM</span>
                      </span>
                      <span className="block text-[9px] text-muted-foreground leading-snug">{trk.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          <p className="text-center text-[8px] font-mono text-muted-foreground/70 uppercase tracking-[0.25em] pb-2">
            {t("radio109.aud.pie")}
          </p>
        </div>
      </div>
    );
  }

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
              <span className="hidden sm:inline text-[7px] text-amber/70 border border-amber-hud/40 px-0.5 rounded-sm">V4</span>
            </div>
            <div className="text-[10px] font-mono font-bold text-amber truncate leading-tight">
              {playing ? cur.name : wantOn ? `${cur.name} (pausada)` : cur.name}
            </div>
          </div>

          {/* mini espectro en vivo (solo si suena) */}
          {playing && (
            <div className="hidden sm:block shrink-0 w-8">
              <Spectrum bars={5} />
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

          {/* v109: MODO AUDITORIO */}
          <button
            onClick={() => setAuditorio(true)}
            aria-label={t("radio109.aud.entrar")}
            title={t("radio109.aud.entrar")}
            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-amber shrink-0"
          >
            <ListMusic className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Cerrar lista de pistas" : "Abrir lista de pistas"}
            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-amber shrink-0"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* expansión: espectro grande + MODO CINE + MODO ESCENA + entrada al AUDITORIO */}
        {expanded && (
          <div className="border-t border-amber-hud/30 max-h-[300px] overflow-y-auto thin-scroll">
            {/* visualizador grande */}
            <div className="px-3 pt-2.5 pb-1">
              <Spectrum bars={22} />
              <div className="flex items-center justify-between mt-1">
                <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                  espectro en vivo
                </span>
                <span className="text-[8px] font-mono text-amber/70 uppercase">
                  {cur.bpm} BPM · EDICIÓN Nº {edicionDeHoy()}
                </span>
              </div>
            </div>

            {/* v109: MODO AUDITORIO — la sala de escucha completa */}
            <button
              onClick={() => setAuditorio(true)}
              className="mx-3 mb-2 w-[calc(100%-24px)] flex items-center gap-2 px-2.5 py-2 border border-amber-hud rounded-sm bg-amber-hud/10 hover:bg-amber-hud/25 transition-colors text-left"
            >
              <ListMusic className="w-3.5 h-3.5 shrink-0 text-amber" />
              <span className="min-w-0">
                <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-amber">
                  {t("radio109.aud.titulo")}
                </span>
                <span className="block text-[8px] font-mono text-muted-foreground leading-snug">
                  {t("radio109.aud.sub")}
                </span>
              </span>
            </button>

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
                  La radio sigue el termómetro de tensión: calma→Orquesta · guerra→Marcha · crisis→Cerco · rojo→Blitz
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
                  INICIO→Orquesta · OBSERVATORIO→Serena · SOCIAL→Sala · JUEGO→Frontera
                </span>
              </span>
              {escena && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber blink-soft shrink-0" />}
            </button>

            {/* v111: SESIÓN CONTINUA en el widget — la radio DJ a un toque */}
            <button
              onClick={toggleCont}
              aria-pressed={cont}
              className={cn(
                "mx-3 mb-2 w-[calc(100%-24px)] flex items-center gap-2 px-2.5 py-2 border rounded-sm transition-colors text-left",
                cont ? "border-cyan-400 bg-cyan-400/15" : "border-border/60 hover:border-amber-hud/60 hover:bg-amber-hud/10"
              )}
            >
              <Repeat className={cn("w-3.5 h-3.5 shrink-0", cont ? "text-cyan-300" : "text-muted-foreground")} />
              <span className="min-w-0">
                <span className={cn("block text-[10px] font-mono font-bold uppercase tracking-wider", cont ? "text-cyan-300" : "text-foreground")}>
                  {t("radio111.cont")} {cont ? "· ACTIVA" : ""}
                </span>
                <span className="block text-[8px] font-mono text-muted-foreground leading-snug">
                  {t("radio111.contDesc")}
                </span>
              </span>
              {cont && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-300 blink-soft shrink-0" />}
            </button>

            {/* colección por familias con puntos de color */}
            {CATS.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-hud/5 border-b border-amber-hud/20">
                  <span className={cn("w-1.5 h-1.5 rounded-full", cat.dot)} />
                  <span className="text-[8px] font-mono font-bold uppercase tracking-[0.25em] text-foreground/80">
                    {t(cat.key)}
                  </span>
                </div>
                {MUSIC_TRACKS.filter((x) => x.cat === cat.id).map((trk) => (
                  <button
                    key={trk.id}
                    onClick={() => switchTrack(trk.id)}
                    className={cn(
                      "w-full text-left px-3 py-1.5 border-b border-amber-hud/10 hover:bg-amber-hud/20 transition-colors",
                      trk.id === cur.id && "bg-amber-hud/20"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("text-[10px] font-mono font-bold uppercase tracking-wide", trk.id === cur.id ? "text-amber" : "text-foreground")}>
                        {trk.name}
                      </span>
                      <span className="text-[8px] font-mono text-muted-foreground shrink-0">{trk.bpm} BPM</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground leading-snug">{trk.desc}</div>
                  </button>
                ))}
              </div>
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
              {t("radio109.aud.pie")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
