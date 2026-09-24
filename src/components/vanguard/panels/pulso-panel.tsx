"use client";

// v51.0 PULSO MUNDIAL — intel REAL en vivo sin API key:
// 🛰️ ISS (wheretheiss.at) · ✈️ OpenSky Network · 🚀 Spaceflight News API
// Datos reales de satélites, aviones sobre zonas calientes y señales espaciales.

import { useCallback, useEffect, useRef, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { toast } from "sonner";
import { Satellite, Plane as PlaneIcon, Rocket, RefreshCw, Radar, ScanLine, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/game-store";
import { motion } from "framer-motion";

interface IssState {
  lat: number; lon: number; altKm: number; velKmh: number;
  visibility: string; footprintKm: number;
}
interface Plane {
  icao: string; callsign: string; country: string;
  altM: number | null; velKmh: number | null; heading: number | null; mil: boolean;
}
interface Zone { id: string; label: string; total: number; planes: Plane[]; }
interface NewsItem { id: string; title: string; url: string; site: string; published: string; }
interface PulsoResp {
  ok: boolean; iss: IssState | null; zones: Zone[]; news: NewsItem[];
  sources?: { iss: boolean; opensky: boolean; spaceflight: boolean };
  error?: string;
}

const SCAN_KEY = "vanguard_pulso_last_scan_v1";
const SCAN_COOLDOWN = 60_000;

export function PulsoPanel() {
  const [data, setData] = useState<PulsoResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const aliveRef = useRef(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await fetch("/api/pulso", { cache: "no-store" });
      const j = (await r.json()) as PulsoResp;
      if (aliveRef.current && r.ok && j.ok) setData(j);
    } catch { /* el panel nunca se rompe */ }
    finally { if (aliveRef.current) setLoading(false); }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    load();
    const iv = setInterval(() => load(true), 60_000);
    const last = Number(localStorage.getItem(SCAN_KEY) ?? 0);
    const rest = SCAN_COOLDOWN - (Date.now() - last);
    if (rest > 0) setCooldown(Math.ceil(rest / 1000));
    const cd = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => { aliveRef.current = false; clearInterval(iv); clearInterval(cd); };
  }, [load]);

  const scan = async () => {
    if (cooldown > 0 || scanning) return;
    setScanning(true);
    const last = Number(localStorage.getItem(SCAN_KEY) ?? 0);
    if (Date.now() - last >= SCAN_COOLDOWN) {
      localStorage.setItem(SCAN_KEY, String(Date.now()));
      addCoins(5, "Escaneo Pulso Mundial");
      addXp(2);
      toast.success("+5 mon · escaneo completado", { description: "Satélite, radar y señales espaciales actualizados" });
    }
    await load(true);
    setCooldown(60);
    setScanning(false);
  };

  const iss = data?.iss ?? null;

  return (
    <div className="flex flex-col gap-3">
      <PanelHeader
        title="PULSO MUNDIAL"
        subtitle="Satélite espía · radar aéreo en vivo · señales espaciales — datos REALES, sin API key"
        icon={<Radar className="w-5 h-5" />}
        color="cyan"
      />

      {/* ACCIÓN */}
      <div className="flex items-center gap-2">
        <button
          onClick={scan}
          disabled={cooldown > 0 || scanning}
          className={cn(
            "flex-1 hud-panel px-4 py-3 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest",
            cooldown > 0 || scanning ? "opacity-50 cursor-not-allowed" : "hover:border-cyan-400/60 text-cyan"
          )}
        >
          <ScanLine className={cn("w-4 h-4", scanning && "animate-spin")} />
          {cooldown > 0 ? `ESCANEO LISTO EN ${cooldown}s` : scanning ? "ESCANEANDO..." : "ESCANEAR AHORA (+5 mon)"}
        </button>
        <button
          onClick={() => load()}
          className="hud-panel p-3 text-muted-foreground hover:text-foreground"
          aria-label="Refrescar Pulso Mundial"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* ISS SATÉLITE */}
      <div className="hud-panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <Satellite className="w-4 h-4 text-cyan" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-cyan">Satélite ISS — en vivo</span>
          {iss && <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> SEÑAL</span>}
        </div>
        {loading && !iss ? (
          <p className="font-mono text-[11px] text-muted-foreground">Contactando satélite...</p>
        ) : iss ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { k: "LATITUD", v: `${iss.lat > 0 ? "+" : ""}${iss.lat}°` },
              { k: "LONGITUD", v: `${iss.lon > 0 ? "+" : ""}${iss.lon}°` },
              { k: "ALTITUD", v: `${iss.altKm} km` },
              { k: "VELOCIDAD", v: `${iss.velKmh.toLocaleString("es")} km/h` },
            ].map((m) => (
              <div key={m.k} className="bg-muted/40 rounded p-2">
                <div className="font-mono text-[9px] text-muted-foreground">{m.k}</div>
                <div className="font-mono text-sm text-foreground">{m.v}</div>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-4 relative rounded overflow-hidden bg-muted/30 h-24">
              <svg viewBox="0 0 360 180" className="w-full h-full opacity-40">
                {Array.from({ length: 13 }).map((_, i) => (
                  <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="180" stroke="currentColor" strokeWidth="0.3" />
                ))}
                {Array.from({ length: 7 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 30} x2="360" y2={i * 30} stroke="currentColor" strokeWidth="0.3" />
                ))}
                <rect x="0" y="0" width="360" height="180" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </svg>
              <motion.div
                className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_4px_rgba(34,211,238,0.6)]"
                style={{ left: `${((iss.lon + 180) / 360) * 100}%`, top: `${((90 - iss.lat) / 180) * 100}%`, transform: "translate(-50%,-50%)" }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <div className="absolute bottom-1 right-2 font-mono text-[9px] text-muted-foreground">
                huella ~{iss.footprintKm.toLocaleString("es")} km · {iss.visibility === "daylight" ? "DÍA" : iss.visibility === "eclipsed" ? "NOCHE" : "VISIBLE"}
              </div>
            </div>
          </div>
        ) : (
          <p className="font-mono text-[11px] text-muted-foreground">Satélite sin contacto — reintenta con ESCANEAR</p>
        )}
      </div>

      {/* RADAR AÉREO */}
      {data?.zones?.map((z) => (
        <div key={z.id} className="hud-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <PlaneIcon className="w-4 h-4 text-amber" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-amber">{z.label}</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">{z.total} aeronaves en zona</span>
          </div>
          {z.planes.length === 0 ? (
            <p className="font-mono text-[11px] text-muted-foreground">Sin tráfico aéreo detectado ahora mismo</p>
          ) : (
            <div className="flex flex-col gap-1">
              {z.planes.map((p) => (
                <div key={p.icao} className={cn("flex items-center gap-2 rounded px-2 py-1.5 font-mono text-[11px]", p.mil ? "bg-red-500/10 border border-red-500/30" : "bg-muted/30")}>
                  <span className={cn("font-bold tracking-wider", p.mil ? "text-red-400" : "text-foreground")}>{p.callsign}</span>
                  {p.mil && <span className="px-1 rounded bg-red-500/20 text-red-300 text-[9px] font-bold">MILITAR</span>}
                  <span className="text-muted-foreground truncate hidden sm:inline">{p.country}</span>
                  <span className="ml-auto text-muted-foreground">{p.altM ? `${p.altM.toLocaleString("es")} m` : "—"}</span>
                  <span className="text-muted-foreground w-20 text-right">{p.velKmh ? `${p.velKmh.toLocaleString("es")} km/h` : "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* SEÑALES ESPACIALES */}
      <div className="hud-panel p-4">
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="w-4 h-4 text-violet" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-violet">Señales espaciales — lanzamientos y satélites</span>
          <Radio className="ml-auto w-3.5 h-3.5 text-muted-foreground" />
        </div>
        {(data?.news?.length ?? 0) === 0 ? (
          <p className="font-mono text-[11px] text-muted-foreground">Sin señales nuevas — escanea de nuevo</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {data!.news.map((n) => (
              <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" className="group rounded px-2 py-1.5 hover:bg-muted/40">
                <div className="text-[12px] leading-snug text-foreground group-hover:text-cyan transition-colors">{n.title}</div>
                <div className="font-mono text-[9px] text-muted-foreground mt-0.5">{n.site} · {n.published}</div>
              </a>
            ))}
          </div>
        )}
      </div>

      <p className="font-mono text-[9px] text-muted-foreground text-center">
        Fuentes públicas reales: wheretheiss.at · opensky-network.org · spaceflightnewsapi.net — datos en vivo, sin claves
      </p>
    </div>
  );
}
