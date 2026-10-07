"use client";

// v72.0 INFINITA VERDADES — CÁMARAS PÚBLICAS DEL MUNDO (en El Ojo de Dios).
// El comandante pidió "acceder a todas las cámaras públicas o fáciles del mundo".
// Doctrina:
//  · DIRECTO: la ISS de NASA en VIVO embebida (canal oficial, embed verificado 200).
//  · POR PAÍS: tarjetas de fuentes públicas GRATIS y estables (SkylineWebcams por
//    país, EarthCam Times Square, Windy Webcams, Opentopia) — cada tarjeta abre la
//    red de cámaras de ese país en un toque.
//  · INTEL DE PAÍS: al elegir país se muestra hora local en vivo + clima actual de
//    su capital (Open-Meteo, gratis y sin clave) + atajo a sus verdades.

import { useEffect, useMemo, useState } from "react";
import { Video, ExternalLink, Clock3, CloudSun, Eye, Loader2, Grid3x3, CircleDot } from "lucide-react";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { countryName } from "@/lib/world-data";
import { cn } from "@/lib/utils";

// Fuentes públicas verificadas (HTTP 200 al cierre de v72.0)
const FUENTES: { pais: string; slug: string; nota: string }[] = [
  { pais: "IT", slug: "italia", nota: "Roma, Venecia, Milán, Nápoles…" },
  { pais: "US", slug: "united-states", nota: "Nueva York, Miami, Las Vegas…" },
  { pais: "ES", slug: "espana", nota: "Madrid, Barcelona, Sevilla…" },
  { pais: "FR", slug: "france", nota: "París, Riviera, Alpes…" },
  { pais: "GB", slug: "united-kingdom", nota: "Londres, Edimburgo…" },
  { pais: "RU", slug: "russia", nota: "Moscú, San Petersburgo…" },
  { pais: "BR", slug: "brasil", nota: "Río, São Paulo, playas…" },
  { pais: "MX", slug: "mexico", nota: "CDMX, Cancún, Guadalajara…" },
  { pais: "JP", slug: "japan", nota: "Tokio, Osaka, Kioto…" },
  { pais: "CN", slug: "china", nota: "Shanghái, Pekín, Hong Kong…" },
  { pais: "TR", slug: "turkey", nota: "Estambul, Capadocia…" },
  { pais: "AR", slug: "argentina", nota: "Buenos Aires, Bariloche…" },
  { pais: "AU", slug: "australia", nota: "Sídney, Melbourne…" },
];

// Nombres en español de los países con cámaras (WORLD_FLAG_MAP no cubre todos)
const NOMBRE_PAIS: Record<string, string> = {
  IT: "Italia", US: "Estados Unidos", ES: "España", FR: "Francia", GB: "Reino Unido",
  RU: "Rusia", BR: "Brasil", MX: "México", JP: "Japón", CN: "China", TR: "Turquía",
  AR: "Argentina", AU: "Australia",
};

const EXTRAS = [
  { nombre: "Times Square 4K", url: "https://www.earthcam.com/usa/newyork/timessquare/", iso: "US", nota: "EarthCam — el cruce más famoso del planeta" },
  { nombre: "Windy Webcams", url: "https://www.windy.com/webcams/", iso: "", nota: "Mapa global de miles de cámaras" },
  { nombre: "Opentopia", url: "https://www.opentopia.com/", iso: "", nota: "Cámaras abiertas de todo el mundo" },
];

// Coordenadas de capitales para la intel de clima (Open-Meteo, sin clave)
const CAPITALES: Record<string, { nombre: string; lat: number; lng: number; tz: string }> = {
  IT: { nombre: "Roma", lat: 41.9, lng: 12.5, tz: "Europe/Rome" },
  US: { nombre: "Washington D.C.", lat: 38.9, lng: -77.04, tz: "America/New_York" },
  ES: { nombre: "Madrid", lat: 40.42, lng: -3.7, tz: "Europe/Madrid" },
  FR: { nombre: "París", lat: 48.86, lng: 2.35, tz: "Europe/Paris" },
  GB: { nombre: "Londres", lat: 51.5, lng: -0.13, tz: "Europe/London" },
  RU: { nombre: "Moscú", lat: 55.76, lng: 37.62, tz: "Europe/Moscow" },
  BR: { nombre: "Brasilia", lat: -15.79, lng: -47.88, tz: "America/Sao_Paulo" },
  MX: { nombre: "Ciudad de México", lat: 19.43, lng: -99.13, tz: "America/Mexico_City" },
  JP: { nombre: "Tokio", lat: 35.68, lng: 139.69, tz: "Asia/Tokyo" },
  CN: { nombre: "Pekín", lat: 39.9, lng: 116.4, tz: "Asia/Shanghai" },
  TR: { nombre: "Ankara", lat: 39.93, lng: 32.86, tz: "Europe/Istanbul" },
  AR: { nombre: "Buenos Aires", lat: -34.6, lng: -58.38, tz: "America/Argentina/Buenos_Aires" },
  AU: { nombre: "Canberra", lat: -35.28, lng: 149.13, tz: "Australia/Sydney" },
};

interface Clima {
  temp: number;
  viento: number;
  codigo: number;
}

export function CamarasMundo() {
  const [pais, setPais] = useState<string | null>(null);
  const [clima, setClima] = useState<Clima | null>(null);
  const [cargandoClima, setCargandoClima] = useState(false);
  const [hora, setHora] = useState(() => new Date());
  const [senalISS, setSenalISS] = useState(false); // v72.0: el iframe solo se monta si el guerrero pide la señal

  useEffect(() => {
    const t = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!pais) { setClima(null); return; }
    const cap = CAPITALES[pais];
    if (!cap) return;
    setCargandoClima(true);
    setClima(null);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cap.lat}&longitude=${cap.lng}&current=temperature_2m,wind_speed_10m,weather_code`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.current) {
          setClima({ temp: d.current.temperature_2m, viento: d.current.wind_speed_10m, codigo: d.current.weather_code });
        }
      })
      .catch(() => {})
      .finally(() => setCargandoClima(false));
  }, [pais]);

  const cap = pais ? CAPITALES[pais] : null;
  // v82.0 MODO VIGILANCIA — mosaico CCTV global con barrido, REC y relojes en vivo
  const [mosaico, setMosaico] = useState(false);
  const [focoMosaico, setFocoMosaico] = useState(0);
  const [horaMosaico, setHoraMosaico] = useState(() => new Date());
  useEffect(() => {
    if (!mosaico) return;
    const a = window.setInterval(() => setFocoMosaico((f) => (f + 1) % (FUENTES.length + 1)), 4800);
    const b = window.setInterval(() => setHoraMosaico(new Date()), 1000);
    return () => { window.clearInterval(a); window.clearInterval(b); };
  }, [mosaico]);
  const celdas = useMemo(() => [
    { id: "ISS", iso: "", tz: "UTC", lat: 0, lng: 0, nombre: "ISS · Órbita baja" },
    ...FUENTES.map((f) => ({
      id: f.pais, iso: f.pais, tz: CAPITALES[f.pais]?.tz ?? "UTC",
      lat: CAPITALES[f.pais]?.lat ?? 0, lng: CAPITALES[f.pais]?.lng ?? 0,
      nombre: NOMBRE_PAIS[f.pais] ?? countryName(f.pais),
    })),
  ], []);

  return (
    <section className="space-y-3" aria-label="Cámaras públicas del mundo">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-cyan-hud" aria-hidden />
        <h3 className="font-display font-bold uppercase tracking-wide text-sm text-foreground">Cámaras públicas del mundo</h3>
        <span className="font-mono text-[9px] uppercase tracking-widest text-green-hud border border-green-hud/40 bg-green-hud/10 px-1.5 py-0.5">señales libres</span>
      </div>

      {/* ISS EN VIVO — la cámara pública definitiva (señal bajo demanda) */}
      <div className="hud-panel overflow-hidden">
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            La cámara pública máxima — <span className="text-cyan-hud">ISS · NASA en vivo</span>
          </p>
          <a href="https://www.nasa.gov/nasatv" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-cyan-hud hover:text-foreground transition-colors">
            nasa tv <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        {senalISS ? (
          <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
            <iframe
              src="https://www.youtube.com/embed/live_stream?channel=UCLA_DiR1FfKNvjuUpBHmylQ&autoplay=1"
              title="ISS NASA en vivo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : (
          <button
            onClick={() => setSenalISS(true)}
            className="relative w-full group text-left"
            style={{ aspectRatio: "21/9" }}
            aria-label="Conectar la señal en vivo de la ISS"
          >
            {/* visor orbital en espera — la Tierra y la luna pintadas en CSS */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_35%,#0d1f3c_0%,#05070d_62%)]">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_78%_38%,rgba(226,236,255,0.5)_0%,transparent_9%),radial-gradient(circle_at_80.6%_41%,rgba(120,116,104,0.5)_0%,transparent_2.5%),radial-gradient(circle_at_76%_41.5%,rgba(120,116,104,0.4)_0%,transparent_2%)]" aria-hidden />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.6)_100%)]" aria-hidden />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-cyan-hud animate-pulse">señal en espera</span>
              <span className="inline-flex items-center gap-2 px-5 py-3 min-h-[48px] rounded-sm font-mono text-xs uppercase tracking-[0.25em] font-bold text-black bg-gradient-to-b from-[#8fd3ff] to-[#1E90FF] border border-[#c9e9ff]/60 shadow-[0_6px_26px_rgba(30,144,255,0.45)] group-hover:brightness-110 group-active:scale-95 transition-all">
                <Video className="w-4 h-4" /> Conectar la señal en vivo
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                la Tierra desde la ISS · órbita cada 92 min ·{" "}
                <a href="https://www.youtube.com/@NASA/live" target="_blank" rel="noopener noreferrer" className="text-cyan-hud hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                  directo en YouTube
                </a>
              </span>
            </div>
          </button>
        )}
      </div>

      {/* v82.0 MODO VIGILANCIA — interruptor del mosaico CCTV */}
      <div className="hud-panel p-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {mosaico ? "mosaico de vigilancia activo — la señal recorre la red cada pocos segundos" : "activa el mosaico de vigilancia para patrullar la red de cámaras"}
          </p>
          <button onClick={() => setMosaico((m) => !m)}
            className={cn("inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] border rounded-sm text-[10px] font-mono uppercase font-bold tracking-widest transition-all active:scale-95",
              mosaico ? "border-cyan-hud text-cyan-hud bg-cyan-hud/20 shadow-[0_0_18px_rgba(30,144,255,0.35)]" : "border-cyan-hud/50 text-cyan-hud hover:bg-cyan-hud/10")}>
            <Grid3x3 className="w-3.5 h-3.5" /> {mosaico ? "cerrar mosaico" : "modo vigilancia"}
          </button>
        </div>

        {mosaico && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-1.5">
            {celdas.map((c, i) => {
              const hora = new Intl.DateTimeFormat("es", { timeZone: c.tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(horaMosaico);
              const esIss = c.id === "ISS";
              const enFoco = focoMosaico === i;
              return (
                <button key={c.id}
                  onClick={() => (esIss ? setSenalISS(true) : setPais(c.id))}
                  title={`${c.nombre} — abrir señal`}
                  className={cn("cctv-tile cctv-tile-ciclo group relative rounded-sm border bg-[#04070c] p-2 h-24 text-left transition-all hover:-translate-y-0.5 active:scale-[0.97]",
                    enFoco ? "border-cyan-hud" : "border-white/10 hover:border-cyan-hud/50")}>
                  {/* fósforo de la pantalla */}
                  <div className="absolute inset-0 opacity-70 pointer-events-none bg-[radial-gradient(ellipse_at_50%_30%,rgba(56,189,248,0.10),transparent_65%)]" aria-hidden />
                  <div className="relative z-[4] flex items-center justify-between">
                    <span className="flex items-center gap-1 font-mono text-[7px] tracking-widest text-crisis">
                      <CircleDot className={cn("w-2 h-2", enFoco && "animate-pulse")} /> REC
                    </span>
                    <span className="font-mono text-[7px] text-cyan-hud tracking-widest">CAM-{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="relative z-[4] mt-2">
                    <p className="text-[10px] font-bold text-foreground/95 leading-tight truncate">{c.nombre}</p>
                    <p className="font-mono text-[8px] text-cyan-hud/80 tabular-nums">{hora}</p>
                    <p className="font-mono text-[7px] text-muted-foreground tabular-nums">{c.lat.toFixed(1)}° · {c.lng.toFixed(1)}°</p>
                  </div>
                  <div className="absolute bottom-1 left-2 right-2 z-[4] flex items-center justify-between">
                    {c.iso ? <FlagBadge code={c.iso} /> : <span className="font-mono text-[7px] text-amber tracking-widest">NASA</span>}
                    <span className={cn("font-mono text-[7px] tracking-widest", enFoco ? "text-cyan-hud" : "text-muted-foreground")}>
                      {enFoco ? "EN FOCO" : "ver señal"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* RED POR PAÍS */}
      <div className="hud-panel p-3.5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2.5">
          Elige un país — abre su red pública de cámaras en un toque
        </p>
        <div className="flex flex-wrap gap-1.5">
          {FUENTES.map((f) => (
            <button
              key={f.slug}
              onClick={() => setPais(pais === f.pais ? null : f.pais)}
              aria-pressed={pais === f.pais}
              title={`${countryName(f.pais)} — ${f.nota}`}
              className={cn(
                "transition-all active:scale-90 rounded-sm hover:-translate-y-0.5",
                pais === f.pais ? "ring-1 ring-cyan-hud shadow-[0_0_16px_rgba(30,144,255,0.35)]" : "opacity-85 hover:opacity-100"
              )}
            >
              <FlagBadge code={f.pais} />
            </button>
          ))}
        </div>

        {/* INTEL DEL PAÍS ELEGIDO */}
        {pais && cap ? (
          <div className="mt-3 rounded-sm border border-cyan-hud/30 bg-black/40 p-3.5 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 flex-wrap">
              <FlagBadge code={pais} />
              <span className="font-display font-bold text-sm uppercase tracking-wide text-foreground">{NOMBRE_PAIS[pais] || countryName(pais)}</span>
              <span className="font-mono text-[10px] text-muted-foreground">· cámaras públicas</span>
            </div>

            {/* acción principal: abrir las cámaras */}
            <a
              href={`https://www.skylinewebcams.com/en/webcam/${FUENTES.find((f) => f.pais === pais)?.slug}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-sm border border-cyan-hud/50 bg-cyan-hud/10 hover:bg-cyan-hud/20 px-3.5 py-3 min-h-[52px] transition-all active:scale-[0.98] group"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-hud" aria-hidden />
                <span className="text-[13px] font-semibold text-foreground group-hover:text-cyan-hud transition-colors">
                  Ver cámaras de {NOMBRE_PAIS[pais] || countryName(pais)} ahora
                </span>
              </span>
              <ExternalLink className="w-4 h-4 text-cyan-hud" aria-hidden />
            </a>

            {/* hora + clima */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-sm border border-white/5 bg-black/30 p-2.5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Clock3 className="w-3 h-3" /> {cap.nombre}
                </p>
                <p className="font-mono text-sm text-foreground tabular-nums mt-0.5">
                  {new Intl.DateTimeFormat("es", { timeZone: cap.tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(hora)}
                </p>
              </div>
              <div className="rounded-sm border border-white/5 bg-black/30 p-2.5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <CloudSun className="w-3 h-3" /> clima actual
                </p>
                {cargandoClima ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mt-1" aria-hidden />
                ) : clima ? (
                  <p className="font-mono text-sm text-foreground mt-0.5">{Math.round(clima.temp)}°C · viento {Math.round(clima.viento)} km/h</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground mt-0.5">—</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* EXTRAS GLOBALES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {EXTRAS.map((e) => (
          <a
            key={e.nombre}
            href={e.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hud-panel p-3.5 group hover:border-cyan-hud/50 hover:shadow-[0_8px_26px_rgba(30,144,255,0.15)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <p className="flex items-center justify-between font-display font-bold text-[13px] uppercase tracking-wide text-foreground group-hover:text-cyan-hud transition-colors">
              {e.nombre}
              {e.iso ? <FlagBadge code={e.iso} /> : null}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{e.nota}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
