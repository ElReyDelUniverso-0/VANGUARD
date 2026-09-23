"use client";

// v40 GEOPOLÍTICA EN VIVO — el tablón del planeta con datos REALES y sin API key.
//   · Banco Mundial: gasto militar %PIB, PIB, población (mrnev = último valor oficial)
//   · USGS: sismos M4.5+ de las últimas 24h
//   · Wikipedia: los 10 temas que el mundo más mira (pageviews globales)
//   · EEI en vivo (wheretheiss.at) + fronteras terrestres por país (mledoze)
// Doctrina v36 aplicada: caché local (vanguard-geo-cache), reintentos, y la API
// /api/geo ya sirve stale/barebones — este panel JAMÁS queda vacío.

import { useEffect, useMemo, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import {
  Landmark, RefreshCw, Satellite, Mountain, Users, DollarSign, Swords,
  TrendingUp, MapPin, Clock, Globe2, ExternalLink, Flag, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type RankRow = { iso3: string; name: string; value: number; year: string };
type Quake = { mag: number; place: string; time: number; url: string; lat: number; lng: number; depth: number };
type Trend = { article: string; title: string; views: number };
type CountryRow = {
  iso3: string; name: string; capital: string; region: string;
  income: string; lat: number; lng: number; borders: string[];
};
type GeoData = {
  ok: boolean; ts: string;
  iss: { lat: number; lng: number; velocity: number; altitude: number } | null;
  quakes: Quake[]; trending: Trend[];
  military: RankRow[]; population: RankRow[]; gdp: RankRow[];
  countries: CountryRow[]; sources: Record<string, boolean>;
};

const CACHE_KEY = "vanguard-geo-cache";

const fmt = new Intl.NumberFormat("es", { notation: "compact", maximumFractionDigits: 1 });
const fmtFull = new Intl.NumberFormat("es");

function agoTs(ts: string | number): string {
  const ms = Date.now() - (typeof ts === "number" ? ts : new Date(ts).getTime());
  const m = Math.floor(ms / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function quakeColor(mag: number): string {
  return mag >= 6.5 ? "text-crisis border-crisis-hud bg-crisis-hud/40"
    : mag >= 5.5 ? "text-amber border-amber-hud bg-amber-hud/40"
    : "text-electric border-electric-hud bg-electric-hud/30";
}

type Metric = "military" | "population" | "gdp";
const METRIC_LABEL: Record<Metric, { t: string; sub: string; icon: React.ReactNode; color: string }> = {
  military: { t: "GASTO MILITAR", sub: "% del PIB · Banco Mundial", icon: <Swords className="w-3.5 h-3.5" />, color: "#FF3B30" },
  population: { t: "POBLACIÓN", sub: "habitantes · Banco Mundial", icon: <Users className="w-3.5 h-3.5" />, color: "#00FF87" },
  gdp: { t: "POTENCIA ECONÓMICA", sub: "PIB en dólares · Banco Mundial", icon: <DollarSign className="w-3.5 h-3.5" />, color: "#FFD60A" },
};

export function GeopoliticaPanel() {
  const [data, setData] = useState<GeoData | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      return c && typeof c === "object" ? c : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<Metric>("military");
  const [showAll, setShowAll] = useState(false);
  const [fichaIso, setFichaIso] = useState("");

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await fetch("/api/geo", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      if (!d || typeof d !== "object") throw new Error("bad payload");
      setData(d);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ...d, countries: (d.countries || []).slice(0, 250) }));
      } catch {
        /* storage lleno: seguimos en memoria */
      }
    } catch {
      /* caché local ya visible; la API sirve stale/barebones igualmente */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t0 = setTimeout(() => {
      load();
      const iv = setInterval(() => load(true), 300_000); // 5 min
      return () => clearInterval(iv);
    }, 0);
    return () => clearTimeout(t0);
  }, []);

  const rankRows = data ? data[metric] : [];
  const rows = showAll ? rankRows : rankRows.slice(0, 8);
  const maxValue = rankRows[0]?.value ?? 1;

  const countryMap = useMemo(() => {
    const m = new Map<string, CountryRow>();
    for (const c of data?.countries ?? []) m.set(c.iso3, c);
    return m;
  }, [data?.countries]);

  const popMap = useMemo(() => new Map((data?.population ?? []).map((r) => [r.iso3, r.value])), [data?.population]);
  const gdpMap = useMemo(() => new Map((data?.gdp ?? []).map((r) => [r.iso3, r.value])), [data?.gdp]);
  const milMap = useMemo(() => new Map((data?.military ?? []).map((r) => [r.iso3, r.value])), [data?.military]);

  const ficha = fichaIso ? countryMap.get(fichaIso) : null;

  const sourcesOk = data ? Object.values(data.sources).filter(Boolean).length : 0;
  const sourcesTotal = data ? Math.max(1, Object.keys(data.sources).length) : 1;

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Geopolítica en vivo"
        subtitle="Datos reales: Banco Mundial · USGS · Wikipedia"
        icon={<Landmark className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
        right={
          <Button
            size="sm"
            onClick={() => load()}
            disabled={loading}
            variant="outline"
            className="h-8 font-mono text-[10px] uppercase border-cyan-hud text-cyan-hud hover:bg-cyan-hud"
          >
            <RefreshCw className={cn("w-3 h-3 mr-1", loading && "animate-spin")} /> Refrescar
          </Button>
        }
      />

      {/* barra de estado */}
      <div className="hud-corner p-2 flex items-center gap-3 text-[10px] font-mono flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-hud blink-soft" />
          <span className="text-green-hud">FUENTES {sourcesOk}/{sourcesTotal}</span>
        </div>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{data ? `actualizado ${agoTs(data.ts)}` : "sintonizando…"}</span>
        <span className="text-muted-foreground ml-auto hidden sm:inline">renovación automática 5 min</span>
      </div>

      {!data ? (
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="hud-corner p-3">
              <Skeleton className="h-3 w-2/3 bg-secondary mb-2" />
              <Skeleton className="h-3 w-1/2 bg-secondary" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* ===== EEI EN VIVO ===== */}
          {data.iss && (
            <div className="hud-panel p-3 flex items-center gap-3 border border-electric-hud/30">
              <Satellite className="w-4 h-4 text-electric shrink-0" />
              <div className="min-w-0 text-[11px] font-mono">
                <span className="text-electric uppercase tracking-widest">Estación Espacial Intl.</span>{" "}
                <span className="text-muted-foreground">
                  sobre {Math.abs(data.iss.lat).toFixed(1)}°{data.iss.lat >= 0 ? "N" : "S"} {Math.abs(data.iss.lng).toFixed(1)}°{data.iss.lng >= 0 ? "E" : "O"} · {fmt.format(data.iss.velocity)} km/h · {fmt.format(data.iss.altitude)} km
                </span>
              </div>
            </div>
          )}

          {/* ===== RANKINGS DE PODER ===== */}
          <div className="hud-panel p-3">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {(["military", "population", "gdp"] as Metric[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMetric(m); setShowAll(false); }}
                  className={cn(
                    "px-2 py-1 border text-[9px] font-mono uppercase tracking-widest",
                    metric === m ? "border-cyan-hud text-cyan-hud bg-cyan-hud/20" : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {METRIC_LABEL[m].t}
                </button>
              ))}
              <span className="ml-auto text-[9px] font-mono text-muted-foreground hidden sm:inline">{METRIC_LABEL[metric].sub}</span>
            </div>
            {rows.length === 0 ? (
              <p className="text-[11px] font-mono text-muted-foreground p-3 text-center">Banco Mundial sin respuesta — reintentando en automático…</p>
            ) : (
              <ol className="space-y-1.5">
                {rows.map((r, i) => (
                  <li key={r.iso3}>
                    <button
                      onClick={() => { setFichaIso(r.iso3); }}
                      className="w-full text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-muted-foreground w-5 text-right">{i + 1}</span>
                        <span className="flex-1 min-w-0 text-[11px] truncate group-hover:text-cyan-hud transition-colors">
                          {countryMap.get(r.iso3)?.name || r.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold" style={{ color: METRIC_LABEL[metric].color }}>
                          {metric === "gdp" ? `$${fmt.format(r.value)}` : metric === "population" ? fmt.format(r.value) : `${r.value.toFixed(1)}%`}
                        </span>
                      </div>
                      <div className="ml-7 h-1 bg-secondary overflow-hidden mt-0.5 max-w-[90%]">
                        <div className="h-full transition-all" style={{ width: `${Math.max(2, (r.value / maxValue) * 100)}%`, background: METRIC_LABEL[metric].color, opacity: 0.75 }} />
                      </div>
                    </button>
                  </li>
                ))}
              </ol>
            )}
            {rankRows.length > 8 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="mt-2 text-[9px] font-mono uppercase tracking-widest text-cyan-hud hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                {showAll ? "ver top 8" : `ver top ${rankRows.length}`} <ChevronDown className={cn("w-3 h-3 transition-transform", showAll && "rotate-180")} />
              </button>
            )}
          </div>

          {/* ===== SISMOS M4.5+ 24H ===== */}
          <div className="hud-panel p-3">
            <div className="flex items-center gap-2 mb-2">
              <Mountain className="w-4 h-4 text-crisis" />
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                El planeta hoy — sismos M4.5+ (24h)
              </h3>
              <span className="ml-auto text-[9px] font-mono text-muted-foreground">USGS</span>
            </div>
            {data.quakes.length === 0 ? (
              <p className="text-[11px] font-mono text-muted-foreground p-2 text-center">Sin sismos M4.5+ registrados en las últimas 24 horas — calma sísmica.</p>
            ) : (
              <ul className="space-y-1.5">
                {data.quakes.slice(0, 7).map((q, i) => (
                  <li key={i}>
                    <a
                      href={q.url && q.url.startsWith("http") ? q.url : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 group"
                    >
                      <span className={cn("shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 border", quakeColor(q.mag))}>
                        M{q.mag.toFixed(1)}
                      </span>
                      <span className="flex-1 min-w-0 text-[11px] truncate group-hover:text-amber transition-colors">{q.place}</span>
                      <span className="shrink-0 text-[9px] font-mono text-muted-foreground inline-flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {agoTs(q.time)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ===== FICHA DE PAÍS ===== */}
          <div className="hud-panel p-3">
            <div className="flex items-center gap-2 mb-2">
              <Globe2 className="w-4 h-4 text-cyan-hud" />
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Ficha geopolítica de país</h3>
            </div>
            <select
              value={fichaIso}
              onChange={(e) => setFichaIso(e.target.value)}
              className="w-full h-9 bg-background/70 border border-border rounded-sm px-2 text-[12px] font-mono text-foreground outline-none focus:border-cyan-hud"
              aria-label="Elegir país para la ficha geopolítica"
            >
              <option value="">— elige un país ({(data.countries || []).length} disponibles) —</option>
              {(data.countries || []).slice().sort((a, b) => a.name.localeCompare(b.name, "es")).map((c) => (
                <option key={c.iso3} value={c.iso3}>{c.name}</option>
              ))}
            </select>
            {ficha && (
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="hud-corner p-2">
                  <div className="text-[9px] uppercase text-muted-foreground tracking-widest">Capital</div>
                  <div className="text-foreground mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3 text-cyan-hud" /> {ficha.capital}</div>
                </div>
                <div className="hud-corner p-2">
                  <div className="text-[9px] uppercase text-muted-foreground tracking-widest">Región</div>
                  <div className="text-foreground mt-0.5">{ficha.region}</div>
                </div>
                <div className="hud-corner p-2">
                  <div className="text-[9px] uppercase text-muted-foreground tracking-widest">Nivel de ingreso</div>
                  <div className="text-foreground mt-0.5">{ficha.income}</div>
                </div>
                <div className="hud-corner p-2">
                  <div className="text-[9px] uppercase text-muted-foreground tracking-widest">Población</div>
                  <div className="text-foreground mt-0.5">{popMap.get(ficha.iso3) ? fmtFull.format(popMap.get(ficha.iso3)!) : "—"}</div>
                </div>
                <div className="hud-corner p-2">
                  <div className="text-[9px] uppercase text-muted-foreground tracking-widest">PIB</div>
                  <div className="text-foreground mt-0.5">{gdpMap.get(ficha.iso3) ? `$${fmt.format(gdpMap.get(ficha.iso3)!)}` : "—"}</div>
                </div>
                <div className="hud-corner p-2">
                  <div className="text-[9px] uppercase text-muted-foreground tracking-widest">Gasto militar</div>
                  <div className="text-foreground mt-0.5">{milMap.get(ficha.iso3) != null ? `${milMap.get(ficha.iso3)!.toFixed(1)}% PIB` : "—"}</div>
                </div>
                <div className="hud-corner p-2 col-span-2">
                  <div className="text-[9px] uppercase text-muted-foreground tracking-widest mb-1">Fronteras terrestres ({ficha.borders.length})</div>
                  {ficha.borders.length === 0 ? (
                    <div className="text-muted-foreground">Sin fronteras terrestres — isla o territorio de ultramar</div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {ficha.borders.map((b) => (
                        <button
                          key={b}
                          onClick={() => setFichaIso(b)}
                          className="text-[9px] font-mono px-1.5 py-0.5 border border-border text-muted-foreground hover:text-cyan-hud hover:border-cyan-hud uppercase"
                          title={countryMap.get(b)?.name || b}
                        >
                          <Flag className="w-2.5 h-2.5 inline mr-1" />{countryMap.get(b)?.name || b}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ===== LO QUE EL MUNDO MIRA ===== */}
          <div className="hud-panel p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber" />
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Lo que el mundo mira — Wikipedia top</h3>
              <span className="ml-auto text-[9px] font-mono text-muted-foreground">24h</span>
            </div>
            {data.trending.length === 0 ? (
              <p className="text-[11px] font-mono text-muted-foreground p-2 text-center">Wikipedia sin señal — reintentando…</p>
            ) : (
              <ol className="space-y-1.5">
                {data.trending.map((t, i) => (
                  <li key={t.article}>
                    <a
                      href={`https://en.wikipedia.org/wiki/${t.article}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 group"
                    >
                      <span className="text-[9px] font-mono text-muted-foreground w-5 text-right">{i + 1}</span>
                      <span className="flex-1 min-w-0 text-[11px] truncate group-hover:text-amber transition-colors">{t.title}</span>
                      <span className="shrink-0 text-[9px] font-mono text-muted-foreground inline-flex items-center gap-1">
                        {fmt.format(t.views)} <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <p className="text-[9px] font-mono text-muted-foreground leading-relaxed px-1">
            Datos públicos reales: Banco Mundial (indicadores oficiales por país), USGS (sismología global), Wikimedia (pageviews globales), wheretheiss.at (EEI) y dataset de fronteras mledoze. La actualización se renueva sola cada 5 minutos; los indicadores económicos usan el último año oficial disponible.
          </p>
        </>
      )}
    </div>
  );
}
