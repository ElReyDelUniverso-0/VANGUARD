"use client";

// v75.0 PLANETA VIVO — "que TODA la información del planeta Tierra esté en este lugar".
// Tablero planetario dentro del OJO DE DIOS:
//  · POBLACIÓN MUNDIAL en vivo (contador segundo a segundo)
//  · ISS en vivo vía /api/pulso (lat/lon/velocidad, refresco 45s)
//  · FASE LUNAR calculada (iluminación %, hermana del cielo de ocaso de Vanguard)
//  · EVENTOS NATURALES ABIERTOS de la NASA (EONET): incendios, tormentas, volcanes…
//  · CLIMA ACTUAL de 10 capitales (Open-Meteo, sin clave)
//  · DIVISAS DEL MUNDO contra USD con flecha de movimiento
//  · SISMOS DEL DÍA top por magnitud (USGS)
// Todo falla elegante: si una sonda cae, el resto del planeta sigue en pantalla.

import { useEffect, useMemo, useState } from "react";
import {
  Globe2, Users, Satellite, Moon, Flame, CloudSun, Coins, Mountain, ExternalLink, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventoNatural { id: string; titulo: string; cat: string; fecha: string; lon: number; lat: number; link: string }
interface Divisa { code: string; rate: number; delta: number }
interface ClimaCapital { ciudad: string; pais: string; temp: number; codigo: number }
interface Sismo { mag: number; place: string; depth: number; time: number; lon: number; lat: number }
interface IssViva { lat: number; lon: number; altKm: number; velKmh: number; visibility: string }

interface PlanetaPayload {
  ts: string;
  eventos: EventoNatural[];
  divisas: Divisa[];
  climas: ClimaCapital[];
  iss: { lat: number; lon: number; vel: number; alt: number } | null;
  sismos: Sismo[];
}

// — colores fuertes por categoría EONET (regla Vanguard: cada cosa su tinte) —
const CAT_COLOR: Record<string, string> = {
  Wildfires: "#FF5A1F",
  "Severe Storms": "#38BDF8",
  Volcanoes: "#FF3B30",
  "Sea and Lake Ice": "#67E8F9",
  Drought: "#FFD166",
  "Dust and Haze": "#FFB347",
  Floods: "#3EA6FF",
  Earthquakes: "#00FF87",
  Landslides: "#A855F7",
  Snow: "#E0F2FE",
};
const CAT_ES: Record<string, string> = {
  Wildfires: "INCENDIO",
  "Severe Storms": "TORMENTA",
  Volcanoes: "VOLCÁN",
  "Sea and Lake Ice": "HIELO MARINO",
  Drought: "SEQUÍA",
  "Dust and Haze": "POLVO",
  Floods: "INUNDACIÓN",
  Earthquakes: "TERREMOTO",
  Landslides: "DERRUMBE",
  Snow: "NEVADA",
};

function climaInfo(codigo: number): { desc: string; tinte: string } {
  if (codigo === 0) return { desc: "despejado", tinte: "#FFB347" };
  if (codigo <= 3) return { desc: "parcial", tinte: "#FFD166" };
  if (codigo <= 48) return { desc: "niebla", tinte: "#9AA3AD" };
  if (codigo <= 57) return { desc: "llovizna", tinte: "#38BDF8" };
  if (codigo <= 67) return { desc: "lluvia", tinte: "#3EA6FF" };
  if (codigo <= 77) return { desc: "nieve", tinte: "#E0F2FE" };
  if (codigo <= 82) return { desc: "chubascos", tinte: "#3EA6FF" };
  if (codigo <= 86) return { desc: "nevada", tinte: "#E0F2FE" };
  return { desc: "tormenta", tinte: "#FF3B30" };
}

function tempColor(t: number): string {
  if (t <= 0) return "#67E8F9";
  if (t < 10) return "#38BDF8";
  if (t < 20) return "#00FF87";
  if (t < 29) return "#FFB347";
  return "#FF5A1F";
}

// — población mundial viva: base ONU + deriva neta ~2.42 personas/s —
const POB_BASE = 8_220_000_000;
const POB_T0 = Date.UTC(2026, 8, 1); // 1 sep 2026
const POB_POR_SEG = 2.42;
function poblacionAhora(): number {
  return POB_BASE + ((Date.now() - POB_T0) / 1000) * POB_POR_SEG;
}

// — fase lunar: mes sinódico 29.53 días desde la luna nueva del 6-ene-2000 —
function faseLunar(d = new Date()): { nombre: string; iluminacion: number; edad: number } {
  const sinodico = 29.53058867;
  const nuevaConocida = Date.UTC(2000, 0, 6, 18, 14);
  const dias = (d.getTime() - nuevaConocida) / 86_400_000;
  const edad = ((dias % sinodico) + sinodico) % sinodico;
  const frac = edad / sinodico;
  const ilum = Math.round(((1 - Math.cos(2 * Math.PI * frac)) / 2) * 100);
  let nombre = "Luna nueva";
  if (frac < 0.03 || frac > 0.97) nombre = "Luna nueva";
  else if (frac < 0.22) nombre = "Creciente iluminante";
  else if (frac < 0.28) nombre = "Cuarto creciente";
  else if (frac < 0.47) nombre = "Gibosa creciente";
  else if (frac < 0.53) nombre = "LUNA LLENA";
  else if (frac < 0.72) nombre = "Gibosa menguante";
  else if (frac < 0.78) nombre = "Cuarto menguante";
  else nombre = "Menguante";
  return { nombre, iluminacion: ilum, edad: Math.floor(edad) };
}

function haceDias(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff) || diff < 0) return "";
  const d = Math.floor(diff / 86_400_000);
  if (d <= 0) return "hoy";
  if (d === 1) return "ayer";
  return `hace ${d} d`;
}

export function PlanetaVivo() {
  const [data, setData] = useState<PlanetaPayload | null>(null);
  const [iss, setIss] = useState<IssViva | null>(null);
  const [pob, setPob] = useState(() => poblacionAhora());
  const [cargando, setCargando] = useState(true);

  // sondeo del tablero completo cada 5 min
  useEffect(() => {
    let vivo = true;
    const load = async () => {
      try {
        const r = await fetch("/api/planeta", { cache: "no-store" });
        const j = await r.json();
        if (vivo && j && typeof j === "object") setData(j as PlanetaPayload);
      } catch { /* el tablero aguanta con lo que tenga */ }
      finally { if (vivo) setCargando(false); }
    };
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => { vivo = false; clearInterval(t); };
  }, []);

  // ISS en vivo cada 45 s vía /api/pulso (caché servidor 45s, barato)
  useEffect(() => {
    let vivo = true;
    const load = async () => {
      try {
        const r = await fetch("/api/pulso", { cache: "no-store" });
        const j = await r.json();
        if (vivo && j?.iss) {
          setIss({
            lat: Number(j.iss.lat),
            lon: Number(j.iss.lon),
            altKm: Number(j.iss.altKm),
            velKmh: Number(j.iss.velKmh),
            visibility: String(j.iss.visibility ?? ""),
          });
        }
      } catch { /* silencio: ISS vuelve a aparecer */ }
    };
    load();
    const t = setInterval(load, 45_000);
    return () => { vivo = false; clearInterval(t); };
  }, []);

  // latido del contador de población
  useEffect(() => {
    const t = setInterval(() => setPob(poblacionAhora()), 1000);
    return () => clearInterval(t);
  }, []);

  const luna = useMemo(() => faseLunar(), []);
  const eventos = data?.eventos?.slice(0, 6) ?? [];
  const divisas = data?.divisas ?? [];
  const climas = data?.climas ?? [];
  const sismos = data?.sismos ?? [];

  return (
    <section className="hud-panel p-4 space-y-4" aria-label="Todo el planeta en vivo">
      {/* ===== cabecera con los latidos del planeta ===== */}
      <div className="flex items-center gap-2 flex-wrap">
        <Globe2 className="w-4 h-4 text-green-hud" />
        <h3 className="font-display text-sm font-bold tracking-widest uppercase text-gradient">
          El planeta entero en este lugar
        </h3>
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
          NASA · USGS · Open-Meteo · wheretheiss
        </span>
        <button
          onClick={() => { setCargando(true); fetch("/api/planeta", { cache: "no-store" }).then((r) => r.json()).then((j) => { if (j && typeof j === "object") setData(j); }).catch(() => {}).finally(() => setCargando(false)); }}
          className="ml-auto flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-2 py-1 border border-green-hud/50 text-green-hud hover:bg-green-hud/15 transition-colors rounded-sm active:scale-95"
          aria-label="Re-sondear el planeta"
        >
          <RefreshCw className={cn("w-3 h-3", cargando && "animate-spin")} /> Re-sondear
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {/* población mundial viva */}
        <div className="rounded-sm border border-green-hud/25 bg-black/40 p-2.5">
          <div className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-widest text-muted-foreground">
            <Users className="w-3 h-3" /> Humanos en la Tierra
          </div>
          <div className="font-tech text-lg sm:text-xl font-bold text-green-hud vivo-num tabular-nums mt-0.5">
            {pob.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[8px] font-mono text-muted-foreground">+2.4 por segundo · en vivo</div>
        </div>

        {/* ISS en vivo */}
        <div className="rounded-sm border border-cyan-hud/25 bg-black/40 p-2.5">
          <div className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-widest text-muted-foreground">
            <Satellite className="w-3 h-3" /> ISS en vivo
          </div>
          {iss ? (
            <>
              <div className="font-tech text-sm font-bold text-cyan-hud mt-0.5 tabular-nums">
                {iss.lat.toFixed(1)}° · {iss.lon.toFixed(1)}°
              </div>
              <div className="text-[8px] font-mono text-muted-foreground">
                {Math.round(iss.velKmh).toLocaleString("es-ES")} km/h · {Math.round(iss.altKm)} km
              </div>
            </>
          ) : (
            <div className="text-[10px] font-mono text-muted-foreground mt-1">adquiriendo señal…</div>
          )}
        </div>

        {/* fase lunar */}
        <div className="rounded-sm border border-amber-hud/25 bg-black/40 p-2.5">
          <div className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-widest text-muted-foreground">
            <Moon className="w-3 h-3" /> Luna de Vanguard
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="inline-block w-7 h-7 rounded-full shrink-0"
              style={{
                background: `radial-gradient(circle at 38% 36%, #fff6e0, #d8c9a8 68%, #9a8a68)`,
                boxShadow: `inset ${Math.round((1 - luna.iluminacion / 100) * 30) - 15}px 0 0 0 rgba(5,5,8,0.88), 0 0 14px rgba(255,246,224,0.35)`,
              }}
              aria-hidden
            />
            <div className="min-w-0">
              <div className="font-tech text-xs font-bold text-amber leading-tight truncate">{luna.nombre}</div>
              <div className="text-[8px] font-mono text-muted-foreground">{luna.iluminacion}% iluminada · día {luna.edad}</div>
            </div>
          </div>
        </div>

        {/* eventos abiertos */}
        <div className="rounded-sm border border-red-hud/25 bg-black/40 p-2.5">
          <div className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-widest text-muted-foreground">
            <Flame className="w-3 h-3" /> Eventos naturales abiertos
          </div>
          <div className="font-tech text-lg sm:text-xl font-bold text-red-hud mt-0.5">
            {eventos.length > 0 ? eventos.length : data ? "0" : "—"}
          </div>
          <div className="text-[8px] font-mono text-muted-foreground">satélites NASA EONET ahora</div>
        </div>
      </div>

      {/* ===== eventos naturales + clima ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-sm border border-red-hud/20 bg-black/30 p-3">
          <div className="flex items-center gap-1.5 mb-2 text-[9px] font-mono uppercase tracking-widest text-red-hud">
            <Flame className="w-3 h-3" /> NASA EONET — el planeta arde, llueve y ruge
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto thin-scroll pr-1">
            {eventos.length === 0 && (
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-4 text-center">
                {cargando ? "escaneando satélites…" : "sin eventos abiertos en este ciclo"}
              </div>
            )}
            {eventos.map((ev) => {
              const color = CAT_COLOR[ev.cat] ?? "#FFB347";
              return (
                <a
                  key={ev.id}
                  href={ev.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-[10px] leading-snug group/ev hover:bg-white/5 rounded-sm p-1 -m-1 transition-colors"
                >
                  <span
                    className="text-[7px] font-mono px-1 border uppercase shrink-0 mt-0.5 rounded-sm"
                    style={{ color, borderColor: `${color}66`, background: `${color}14` }}
                  >
                    {CAT_ES[ev.cat] ?? ev.cat}
                  </span>
                  <span className="text-foreground/90 flex-1 group-hover/ev:text-foreground">{ev.titulo}</span>
                  <span className="text-[8px] font-mono text-muted-foreground shrink-0 mt-0.5">{haceDias(ev.fecha)}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover/ev:opacity-100 transition-opacity" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="rounded-sm border border-cyan-hud/20 bg-black/30 p-3">
          <div className="flex items-center gap-1.5 mb-2 text-[9px] font-mono uppercase tracking-widest text-cyan-hud">
            <CloudSun className="w-3 h-3" /> Clima actual de las capitales del poder
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5">
            {climas.length === 0 && (
              <div className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-4 text-center">
                {cargando ? "sondeando atmósfera…" : "atmósfera sin respuesta"}
              </div>
            )}
            {climas.map((c) => {
              const info = climaInfo(c.codigo);
              return (
                <div key={c.ciudad} className="flex items-center justify-between gap-1.5 rounded-sm border border-white/5 bg-black/40 px-2 py-1.5 hover:border-cyan-hud/40 transition-colors">
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-foreground truncate">{c.ciudad}</div>
                    <div className="text-[8px] font-mono uppercase tracking-wider" style={{ color: info.tinte }}>{info.desc}</div>
                  </div>
                  <div className="font-tech text-sm font-bold tabular-nums shrink-0" style={{ color: tempColor(c.temp) }}>
                    {Math.round(c.temp)}°
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== divisas + sismos ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-sm border border-amber-hud/20 bg-black/30 p-3">
          <div className="flex items-center gap-1.5 mb-2 text-[9px] font-mono uppercase tracking-widest text-amber-hud">
            <Coins className="w-3 h-3" /> Divisas del mundo contra el dólar
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto thin-scroll pr-1">
            {divisas.length === 0 && (
              <div className="col-span-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-4 text-center">
                {cargando ? "cotizando…" : "mercado sin respuesta"}
              </div>
            )}
            {divisas.map((d) => (
              <div key={d.code} className="rounded-sm border border-white/5 bg-black/40 px-2 py-1.5 hover:border-amber-hud/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-foreground">{d.code}</span>
                  <span className={cn("text-[9px] font-mono", d.delta > 0.05 ? "text-green-hud" : d.delta < -0.05 ? "text-red-hud" : "text-muted-foreground")}>
                    {d.delta > 0.05 ? "▲" : d.delta < -0.05 ? "▼" : "="}
                  </span>
                </div>
                <div className="font-tech text-[11px] text-amber tabular-nums">{d.rate.toLocaleString("es-ES", { maximumFractionDigits: d.rate < 10 ? 4 : 2 })}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-violet-hud/20 bg-black/30 p-3">
          <div className="flex items-center gap-1.5 mb-2 text-[9px] font-mono uppercase tracking-widest text-violet-hud">
            <Mountain className="w-3 h-3" /> Sismos del día — top por magnitud
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto thin-scroll pr-1">
            {sismos.length === 0 && (
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-4 text-center">
                {cargando ? "calibrando sismógrafos…" : "día tranquilo en las placas"}
              </div>
            )}
            {sismos.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-mono text-[10px] px-1.5 py-0.5 border rounded-sm shrink-0",
                    s.mag >= 6 ? "text-red-hud border-red-hud/50 bg-red-hud/15" : s.mag >= 4.5 ? "text-amber border-amber-hud/50 bg-amber-hud/15" : "text-foreground/80 border-white/10 bg-white/5"
                  )}
                >
                  M{s.mag.toFixed(1)}
                </span>
                <span className="text-[10px] text-foreground/80 leading-tight flex-1 truncate">{s.place}</span>
                <span className="text-[8px] font-mono text-muted-foreground shrink-0">{Math.round(s.depth)} km</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
