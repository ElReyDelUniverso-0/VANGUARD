"use client";

// v86.0 CENTINELA GLOBAL — ESPECTRO EN VIVO (tab: espectro)
// Monitoreo de tráfico aéreo y marítimo alrededor de las zonas calientes,
// estilo Flightradar/MarineTraffic:
//  · MAPA VIVO con WorldMapSVG + pings: aviones militares (rojo) y civiles
//    (ámbar), buques de guerra (cyan) y mercantes (cyan tenue).
//  · AÉREO REAL vía adsb.lol (la fuente viva de Pulso) — si falla, fallback
//    simulado honesto y etiquetado.
//  · MARÍTIMO AIS simulado por canales críticos (Ormuz, Mandeb, Malaca,
//    Taiwán, Mar Negro, Báltico) con estado de riesgo por canal.
//  · ESPECTRO HF: actividad de bandas + jamming de GPS coherente con tensión.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Anchor, Loader2, Plane, RefreshCw, Radio, Ship, Waves } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { WorldMapSVG, type MapPing } from "@/components/vanguard/world-map-svg";
import { getTension } from "@/lib/tension";
import { cn } from "@/lib/utils";

interface Avion {
  id: string; callsign: string; tipo: string; lat: number; lon: number;
  altM: number | null; velKmh: number | null; rumbo: number | null; mil: boolean; fuente: string;
}
interface Buque {
  id: string; nombre: string; tipo: string; bandera: string; lat: number; lon: number;
  velNudos: number; rumbo: number; canal: string; guerra: boolean;
}
interface CanalMar { id: string; nombre: string; riesgo: "NORMAL" | "ELEVADO" | "CRITICO"; nota: string; }
interface Banda { banda: string; actividad: number; jamming: boolean; }
interface EspectroResp {
  ok: boolean;
  aviones: Avion[];
  buques: Buque[];
  canales: CanalMar[];
  bandas: Banda[];
  fuentes: { adsb: boolean; ais: string; espectro: string };
  zonas: { id: string; nombre: string; total: number }[];
  ts: number;
}

const RIESGO_STYLES: Record<CanalMar["riesgo"], string> = {
  NORMAL: "text-green-hud border-green-hud/50 bg-green-hud/10",
  ELEVADO: "text-amber border-amber-hud/50 bg-amber-hud/10",
  CRITICO: "text-red-hud border-red-hud/50 bg-red-hud/15",
};

export function EspectroPanel() {
  const [data, setData] = useState<EspectroResp | null>(null);
  const [cargando, setCargando] = useState(true);
  const [sel, setSel] = useState<{ tipo: "avion" | "buque"; id: string } | null>(null);
  const vivoRef = useRef(true);

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      const t = Math.round(getTension());
      const r = await fetch(`/api/espectro?tension=${t}`, { cache: "no-store" });
      const j = (await r.json()) as EspectroResp;
      if (vivoRef.current && j?.ok) setData(j);
    } catch { /* el radar aguanta */ }
    finally { if (vivoRef.current) setCargando(false); }
  }, []);

  useEffect(() => {
    vivoRef.current = true;
    cargar();
    const iv = setInterval(() => cargar(true), 60_000);
    return () => { vivoRef.current = false; clearInterval(iv); };
  }, [cargar]);

  const pings: MapPing[] = useMemo(() => {
    if (!data) return [];
    const out: MapPing[] = [];
    for (const a of data.aviones) {
      out.push({
        id: `a-${a.id}`,
        lat: a.lat, lng: a.lon,
        color: a.mil ? "#FF4655" : "#FFB020",
        tipo: a.mil ? "AVION_MIL" : "AVION_CIVIL",
        etiqueta: a.mil ? a.callsign : undefined,
      });
    }
    for (const b of data.buques) {
      out.push({
        id: `b-${b.id}`,
        lat: b.lat, lng: b.lon,
        color: b.guerra ? "#00E5FF" : "#38BDF8",
        tipo: b.guerra ? "BUQUE_GUERRA" : "BUQUE_CIVIL",
        etiqueta: b.guerra ? b.nombre : undefined,
      });
    }
    return out;
  }, [data]);

  const avionSel = data?.aviones.find((a) => `a-${a.id}` === sel?.id && sel.tipo === "avion");
  const buqueSel = data?.buques.find((b) => `b-${b.id}` === sel?.id && sel.tipo === "buque");
  const milCount = data?.aviones.filter((a) => a.mil).length ?? 0;
  const guerraCount = data?.buques.filter((b) => b.guerra).length ?? 0;

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Espectro en Vivo"
        subtitle="Tráfico aéreo y marítimo alrededor de las zonas calientes del mundo"
        icon={<Waves className="w-4 h-4 text-cyan-hud" />}
        color="amber"
        right={
          <span className={cn(
            "flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-1 border bg-black/30",
            data?.fuentes.adsb ? "border-green-hud/60 text-green-hud" : "border-amber-hud/60 text-amber"
          )}>
            <span className={cn("beacon w-1.5 h-1.5 rounded-full", data?.fuentes.adsb ? "bg-green-hud" : "bg-amber")} style={{ color: data?.fuentes.adsb ? "#00FF87" : "#FFB020" }} />
            {data?.fuentes.adsb ? "ADS-B REAL" : "SIMULADO"}
          </span>
        }
      />

      {/* doctrina */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber mb-1">Doctrina del espectro</p>
        <p className="text-[12.5px] text-muted-foreground leading-relaxed max-w-3xl">
          La guerra también se lee en el cielo y en el mar: reabastecimientos en vuelo, patrullas sin plan
          de vuelo público, fragatas de escolta donde antes solo pasaba crudo. Aquí el comandante ve el
          tráfico REAL captado por la red ADS-B civil alrededor de 5 zonas calientes, el estado de los 6
          canales marítimos que sostienen el comercio del planeta, y el pulso del espectro de radio.
        </p>
      </div>

      {/* MAPA EN VIVO */}
      <div className="hud-panel relative overflow-hidden p-0">
        <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 text-[8.5px] font-mono uppercase px-1.5 py-0.5 border border-red-hud/50 text-red-hud bg-black/70"><Plane className="w-2.5 h-2.5" /> avión militar · {milCount}</span>
          <span className="flex items-center gap-1 text-[8.5px] font-mono uppercase px-1.5 py-0.5 border border-amber-hud/50 text-amber bg-black/70"><Plane className="w-2.5 h-2.5" /> civil</span>
          <span className="flex items-center gap-1 text-[8.5px] font-mono uppercase px-1.5 py-0.5 border border-cyan-hud/50 text-cyan-hud bg-black/70"><Ship className="w-2.5 h-2.5" /> buque de guerra · {guerraCount}</span>
        </div>
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 text-[8.5px] font-mono uppercase px-1.5 py-0.5 border border-amber-hud/50 text-amber bg-black/70 holo-flicker">
          {cargando ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />} barrido 60s
        </div>
        <WorldMapSVG pings={pings} showFronts={false} className="opacity-95" />
        <div className="barrido-map" aria-hidden />
      </div>

      {/* CANALES MARÍTIMOS */}
      <section className="hud-panel p-4" aria-label="Canales marítimos">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2.5 flex items-center gap-1.5">
          <Anchor className="w-3.5 h-3.5 text-cyan-hud" /> Canales que sostienen el mundo · AIS simulado honesto
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {data?.canales.map((c) => (
            <div key={c.id} className={cn("border rounded-sm p-2.5", RIESGO_STYLES[c.riesgo])}>
              <div className="flex items-center justify-between gap-1.5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wide">{c.nombre}</p>
                <span className="font-mono text-[8px] uppercase px-1 border border-current/40">{c.riesgo}</span>
              </div>
              <p className="text-[10px] opacity-75 mt-1 leading-snug">{c.nota}</p>
            </div>
          ))}
          {!data && <p className="text-[11px] font-mono text-muted-foreground">Cargando canales…</p>}
        </div>
      </section>

      {/* CONTACTOS: aéreo + marítimo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* AÉREO */}
        <section className="hud-panel p-3.5" aria-label="Contactos aéreos">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-red-hud" /> Contactos aéreos · primero los militares
          </p>
          <div className="space-y-1 max-h-[320px] overflow-y-auto thin-scroll pr-1">
            {data?.aviones.map((a) => (
              <button
                key={a.id}
                onClick={() => setSel({ tipo: "avion", id: `a-${a.id}` })}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 border rounded-sm text-left transition-colors active:scale-[0.99]",
                  sel?.id === `a-${a.id}` ? "border-amber-hud bg-amber-hud/15" : a.mil ? "border-red-hud/30 bg-red-hud/5 hover:border-red-hud/60" : "border-white/10 hover:border-amber-hud/40"
                )}
              >
                <Plane className={cn("w-3 h-3 shrink-0", a.mil ? "text-red-hud" : "text-amber")} />
                <span className="font-mono text-[10.5px] font-bold text-foreground w-[70px] truncate">{a.callsign}</span>
                <span className="font-mono text-[9px] text-muted-foreground w-10">{a.tipo}</span>
                <span className="font-mono text-[9px] text-muted-foreground tabular-nums ml-auto">{a.altM ? `${a.altM}m` : "—"}</span>
                <span className="font-mono text-[9px] text-muted-foreground tabular-nums w-14 text-right">{a.velKmh ? `${a.velKmh}km/h` : "—"}</span>
                <span className={cn("shrink-0 font-mono text-[7px] uppercase px-1 border", a.fuente === "ADS-B REAL" ? "border-green-hud/50 text-green-hud" : "border-amber-hud/50 text-amber")}>{a.fuente === "ADS-B REAL" ? "REAL" : "SIM"}</span>
              </button>
            ))}
            {!data && <p className="text-[11px] font-mono text-muted-foreground">Escaneando el cielo…</p>}
          </div>
        </section>

        {/* MARÍTIMO */}
        <section className="hud-panel p-3.5" aria-label="Contactos marítimos">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 flex items-center gap-1.5">
            <Ship className="w-3.5 h-3.5 text-cyan-hud" /> Contactos marítimos · AIS simulado
          </p>
          <div className="space-y-1 max-h-[320px] overflow-y-auto thin-scroll pr-1">
            {data?.buques.map((b) => (
              <button
                key={b.id}
                onClick={() => setSel({ tipo: "buque", id: `b-${b.id}` })}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 border rounded-sm text-left transition-colors active:scale-[0.99]",
                  sel?.id === `b-${b.id}` ? "border-cyan-hud bg-cyan-hud/15" : b.guerra ? "border-cyan-hud/30 bg-cyan-hud/5 hover:border-cyan-hud/60" : "border-white/10 hover:border-cyan-hud/40"
                )}
              >
                {b.guerra ? <Ship className="w-3 h-3 shrink-0 text-cyan-hud" /> : <Anchor className="w-3 h-3 shrink-0 text-muted-foreground" />}
                <span className="font-mono text-[10.5px] font-bold text-foreground w-[110px] truncate">{b.nombre}</span>
                <span className="font-mono text-[9px] text-muted-foreground truncate flex-1 text-left">{b.tipo}</span>
                <span className="font-mono text-[9px] text-muted-foreground tabular-nums w-14 text-right">{b.velNudos}kn</span>
                {b.guerra && <span className="shrink-0 font-mono text-[7px] uppercase px-1 border border-cyan-hud/50 text-cyan-hud">GUERRA</span>}
              </button>
            ))}
            {!data && <p className="text-[11px] font-mono text-muted-foreground">Rastreando la flota…</p>}
          </div>
        </section>
      </div>

      {/* FICHA DEL CONTACTO SELECCIONADO */}
      {(avionSel || buqueSel) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="hud-panel p-4"
        >
          {avionSel ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground w-full sm:w-auto">Contacto aéreo seleccionado</p>
              <p className="font-display text-lg font-black text-amber">{avionSel.callsign}</p>
              <p className="font-mono text-[11px] text-foreground/80">tipo {avionSel.tipo}</p>
              <p className="font-mono text-[11px] text-muted-foreground">alt {avionSel.altM ?? "?"} m · vel {avionSel.velKmh ?? "?"} km/h · rumbo {avionSel.rumbo ?? "?"}°</p>
              <p className={cn("font-mono text-[9px] uppercase px-1.5 py-0.5 border", avionSel.fuente === "ADS-B REAL" ? "border-green-hud/50 text-green-hud" : "border-amber-hud/50 text-amber")}>{avionSel.fuente}</p>
              <p className="font-mono text-[11px] text-cyan-hud">{Math.abs(avionSel.lat).toFixed(2)}°{avionSel.lat >= 0 ? "N" : "S"} {Math.abs(avionSel.lon).toFixed(2)}°{avionSel.lon >= 0 ? "E" : "W"}</p>
            </div>
          ) : buqueSel ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground w-full sm:w-auto">Contacto marítimo seleccionado</p>
              <p className="font-display text-lg font-black text-cyan-hud">{buqueSel.nombre}</p>
              <p className="font-mono text-[11px] text-foreground/80">{buqueSel.tipo} · bandera {buqueSel.bandera}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{buqueSel.velNudos} nudos · rumbo {buqueSel.rumbo}°</p>
              <p className="font-mono text-[11px] text-cyan-hud">{Math.abs(buqueSel.lat).toFixed(2)}°{buqueSel.lat >= 0 ? "N" : "S"} {Math.abs(buqueSel.lon).toFixed(2)}°{buqueSel.lon >= 0 ? "E" : "W"}</p>
            </div>
          ) : null}
        </motion.div>
      )}

      {/* ESPECTRO HF */}
      <section className="hud-panel p-4" aria-label="Espectro de radio">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-amber" /> Espectro de radio · actividad por banda
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {data?.bandas.map((b) => (
            <div key={b.banda} className="border border-white/10 bg-black/30 p-2.5 rounded-sm">
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <p className="font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground truncate">{b.banda}</p>
                {b.jamming && <span className="shrink-0 font-mono text-[7px] uppercase px-1 border border-red-hud/60 text-red-hud blink-soft">JAMMING</span>}
              </div>
              <div className="h-1.5 bg-black/60 border border-white/10 overflow-hidden rounded-sm">
                <motion.div
                  className="h-full"
                  style={{ background: b.jamming ? "#FF4655" : "#FFB020", boxShadow: `0 0 6px ${b.jamming ? "#FF4655" : "#FFB020"}66` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${b.actividad}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <p className="font-mono text-[9px] text-muted-foreground mt-1 tabular-nums">{b.actividad}% actividad</p>
            </div>
          ))}
          {!data && <p className="text-[11px] font-mono text-muted-foreground">Sintonizando bandas…</p>}
        </div>
        <p className="mt-3 text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
          Fuentes: aéreo {data?.fuentes.adsb ? "ADS-B REAL (adsb.lol)" : "SIMULADO (fuente primaria no alcanzó a responder)"} · marítimo AIS SIMULADO · espectro DERIVADO de la tensión global
        </p>
      </section>
    </div>
  );
}
