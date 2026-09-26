"use client";

// v53.0 ZONA CERO 3D — envoltorio React del motor tridimensional.
// HUD de comando: barras de control por frente (Norte vs Sur), ticker de
// eventos en vivo (simulados + reales de GDELT con enlace), reloj de guerra,
// director automático, sonido sintetizado y MODO ATAQUE (tocar el mapa para
// pedir fuego). La guerra se guarda en localStorage: la ciudad recuerda.

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Clapperboard, Crosshair, Radio, Flame } from "lucide-react";
import { ZC3DEngine, type ZC3DEvent, type ZC3DStats, type ZC3DSaveState } from "./zc3d-engine";

const SAVE_KEY = "zc3d_state_v1";

const REGIONES = 5;

export function ZonaCero3D() {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ZC3DEngine | null>(null);
  const [stats, setStats] = useState<ZC3DStats | null>(null);
  const [events, setEvents] = useState<ZC3DEvent[]>([]);
  const [sound, setSound] = useState(false);
  const [director, setDirector] = useState(true);
  const [strike, setStrike] = useState(false);
  const usedArts = useRef<Set<string>>(new Set());

  const pushEvent = useCallback((ev: ZC3DEvent) => {
    setEvents((prev) => [ev, ...prev].slice(0, 6));
  }, []);

  // ---- ciclo de vida del motor ----
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let save: Partial<ZC3DSaveState> = {};
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) save = JSON.parse(raw) as Partial<ZC3DSaveState>;
    } catch { /* estado corrupto: empezar de cero */ }

    const eng = new ZC3DEngine(host, {
      onEvent: pushEvent,
      onTick: (s) => setStats(s),
      initial: save,
    });
    engineRef.current = eng;

    const persist = () => {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(eng.getSaveState())); } catch {}
    };
    const saveIv = window.setInterval(persist, 15000);
    const onVis = () => { if (document.visibilityState === "hidden") persist(); };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.clearInterval(saveIv);
      document.removeEventListener("visibilitychange", onVis);
      persist();
      eng.dispose();
      engineRef.current = null;
    };
  }, [pushEvent]);

  // ---- fusión real: GDELT dispara operaciones dentro del teatro 3D ----
  useEffect(() => {
    let alive = true;
    let idx = Math.floor(Math.random() * REGIONES);
    const pull = async () => {
      try {
        const res = await fetch(`/api/geo-tablero?r=${idx % REGIONES}`, { cache: "no-store" });
        idx++;
        if (!res.ok || !alive) return;
        const j = (await res.json()) as { region?: { arts?: { title: string; url: string }[] } | null };
        const arts = j?.region?.arts ?? [];
        const KW = /war|strike|attack|offensive|missile|drone|shell|troop|killed|militar|offensiva|ataque|bombardeo|misil|dron|guerra|artiller|tropas|muert|combate|airstrike|shelling/i;
        for (const a of arts) {
          if (!usedArts.current.has(a.url) && KW.test(a.title) && engineRef.current) {
            usedArts.current.add(a.url);
            engineRef.current.triggerOp(Math.floor(Math.random() * 4), a.title, a.url);
            break; // una operación real por ciclo
          }
        }
      } catch { /* reintento en el próximo ciclo */ }
    };
    const t0 = window.setTimeout(pull, 4500);
    const iv = window.setInterval(pull, 75000);
    return () => { alive = false; window.clearTimeout(t0); window.clearInterval(iv); };
  }, []);

  useEffect(() => { engineRef.current?.setSound(sound); }, [sound]);
  useEffect(() => { engineRef.current?.setDirector(director); }, [director]);
  useEffect(() => { engineRef.current?.setStrike(strike); }, [strike]);

  const clock = stats
    ? `${String(Math.floor(stats.clock / 60)).padStart(2, "0")}:${String(stats.clock % 60).padStart(2, "0")}`
    : "00:00";

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden bg-black">
      {/* barra de mando */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 border-b border-zinc-800 bg-zinc-950/90">
        <span className="font-mono text-[10px] tracking-[0.22em] text-red-400 uppercase">
          Teatro 3D · 4 frentes en directo
        </span>
        <span className="font-mono text-[9px] text-zinc-500">
          T+{clock} · {stats?.casualties ?? 0} bajas · {stats?.bldgsDown ?? 0} edificios caídos ·{" "}
          <span className="text-emerald-400">{stats?.opsReal ?? 0} ops reales</span>
        </span>
        <div className="ml-auto flex gap-1.5">
          <button
            onClick={() => setDirector((d) => !d)}
            className={`flex items-center gap-1 border rounded px-2 py-1 font-mono text-[9px] transition-colors ${
              director ? "border-amber-400/60 text-amber-300 bg-amber-400/10" : "border-zinc-700 text-zinc-500"
            }`}
            title="Director de cámara automático"
          >
            <Clapperboard className="w-3 h-3" /> DIRECTOR {director ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => setStrike((s) => !s)}
            className={`flex items-center gap-1 border rounded px-2 py-1 font-mono text-[9px] transition-colors ${
              strike ? "border-red-500/70 text-red-300 bg-red-500/15 animate-pulse" : "border-zinc-700 text-zinc-500"
            }`}
            title="Modo ataque: toca el mapa para pedir fuego"
          >
            <Crosshair className="w-3 h-3" /> ATAQUE {strike ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => setSound((s) => !s)}
            className={`border rounded px-2 py-1 transition-colors ${
              sound ? "border-emerald-400/60 text-emerald-300 bg-emerald-400/10" : "border-zinc-700 text-zinc-500"
            }`}
            title="Sonido sintetizado en vivo"
          >
            {sound ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* lienzo 3D */}
      <div className="relative">
        <div ref={hostRef} className="w-full h-[58vh] min-h-[380px] max-h-[660px] cursor-grab active:cursor-grabbing" />
        {strike && (
          <div className="absolute inset-0 pointer-events-none border-2 border-red-500/50">
            <p className="absolute top-1.5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-red-300 bg-black/60 px-2 py-0.5 rounded">
              MODO ATAQUE · toca cualquier punto del mapa para pedir fuego
            </p>
          </div>
        )}
        <p className="absolute bottom-1 right-2 font-mono text-[8px] text-zinc-600 bg-black/40 px-1 rounded pointer-events-none">
          {stats?.fps ?? 0} FPS · arrastra para mirar · pellizca/rueda para zoom
        </p>
      </div>

      {/* barras de control por frente */}
      <div className="grid sm:grid-cols-2 gap-px bg-zinc-800 border-t border-zinc-800">
        {(stats?.fronts ?? [0, 1, 2, 3].map((i) => ({
          name: ["FRENTE DEL BOSQUE", "FRENTE DE LA CARRETERA", "FRENTE DEL RÍO", "FRENTE DE LA CIUDAD"][i],
          share: 0.5, intensity: 0.2, lastEvent: "levantando el teatro…",
        }))).map((f, i) => (
          <div key={f.name} className="bg-zinc-950 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] tracking-wider text-zinc-300 flex-1 truncate">{f.name}</span>
              <Flame className={`w-3 h-3 ${f.intensity > 0.6 ? "text-red-400" : f.intensity > 0.3 ? "text-amber-400" : "text-zinc-600"}`} />
              <button
                onClick={() => engineRef.current?.focusFront(i)}
                className="font-mono text-[8.5px] text-sky-300 border border-sky-500/40 rounded px-1.5 py-0.5 hover:bg-sky-500/10 transition-colors"
              >
                VER
              </button>
            </div>
            <div className="mt-1 h-2 w-full rounded-sm overflow-hidden flex bg-zinc-800">
              <div className="h-full bg-gradient-to-r from-red-700 to-red-400 transition-all duration-1000" style={{ width: `${f.share * 100}%` }} />
              <div className="h-full bg-gradient-to-l from-cyan-600 to-cyan-300 transition-all duration-1000" style={{ width: `${(1 - f.share) * 100}%` }} />
            </div>
            <p className="mt-0.5 font-mono text-[8.5px] text-zinc-500 truncate">{f.lastEvent}</p>
          </div>
        ))}
      </div>

      {/* ticker de eventos */}
      <div className="border-t border-zinc-800 bg-black/60 px-3 py-2">
        <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 mb-1">
          <Radio className="w-3 h-3 text-emerald-400" /> Radio de guerra · eventos en vivo
        </p>
        {events.length === 0 ? (
          <p className="font-mono text-[10px] text-zinc-600">
            Subiendo el telón del teatro… los primeros artilleros ya están tomando posiciones.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {events.map((ev, i) => (
              <li
                key={`${ev.text}-${i}`}
                className={`font-mono text-[10px] leading-snug truncate ${
                  ev.real ? "text-emerald-300" : i === 0 ? "text-zinc-200" : "text-zinc-500"
                }`}
              >
                <span className={ev.side === 0 ? "text-red-400" : ev.side === 1 ? "text-cyan-300" : "text-amber-400"}>
                  {ev.real ? "▮ REAL " : "▸ "}
                </span>
                {ev.url ? (
                  <a href={ev.url} target="_blank" rel="noopener noreferrer nofollow" className="underline decoration-dotted hover:text-emerald-200 transition-colors">
                    {ev.text}
                  </a>
                ) : (
                  ev.text
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
