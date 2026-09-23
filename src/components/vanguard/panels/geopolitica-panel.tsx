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
  Trophy, Dices, GraduationCap, Check, X as XIcon,
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
// v41 — indicadores por país (217) para la ficha completa, el duelo VS y el quiz
type PowerCell = { pop: number | null; gdp: number | null; mil: number | null };
type GeoData = {
  ok: boolean; ts: string;
  iss: { lat: number; lng: number; velocity: number; altitude: number } | null;
  quakes: Quake[]; trending: Trend[];
  military: RankRow[]; population: RankRow[]; gdp: RankRow[];
  countries: CountryRow[]; power?: Record<string, PowerCell>; sources: Record<string, boolean>;
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

  // v41: rankings top-15 + mapa completo de poder (217 países) — la ficha y los
  // juegos funcionan para CUALQUIER país, no solo el top mundial
  const popMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of data?.population ?? []) m.set(r.iso3, r.value);
    for (const [iso, cell] of Object.entries(data?.power ?? {})) if (cell?.pop != null && !m.has(iso)) m.set(iso, cell.pop);
    return m;
  }, [data]);
  const gdpMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of data?.gdp ?? []) m.set(r.iso3, r.value);
    for (const [iso, cell] of Object.entries(data?.power ?? {})) if (cell?.gdp != null && !m.has(iso)) m.set(iso, cell.gdp);
    return m;
  }, [data]);
  const milMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of data?.military ?? []) m.set(r.iso3, r.value);
    for (const [iso, cell] of Object.entries(data?.power ?? {})) if (cell?.mil != null && !m.has(iso)) m.set(iso, cell.mil);
    return m;
  }, [data]);

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

          {/* ===== v41 ¿QUIÉN GANA? — DUELO DE PODER ===== */}
          <VsDuel countries={Array.from(countryMap.values())} popMap={popMap} gdpMap={gdpMap} milMap={milMap} />

          {/* ===== v41 DESAFÍO GEO — JUEGO DE GEOPOLÍTICA ===== */}
          <GeoQuiz data={data} countryMap={countryMap} />

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

// ===== v41 ¿QUIÉN GANA? — duelo de poder entre dos países (datos Banco Mundial) =====
function VsDuel({
  countries,
  popMap,
  gdpMap,
  milMap,
}: {
  countries: CountryRow[];
  popMap: Map<string, number>;
  gdpMap: Map<string, number>;
  milMap: Map<string, number>;
}) {
  const [a, setA] = useState("USA");
  const [b, setB] = useState("CHN");

  const sorted = useMemo(
    () => countries.slice().sort((x, y) => x.name.localeCompare(y.name, "es")),
    [countries]
  );

  const metrics = useMemo(() => {
    const row = (iso: string) => ({
      pop: popMap.get(iso) ?? null,
      gdp: gdpMap.get(iso) ?? null,
      milEst: milMap.get(iso) != null && gdpMap.get(iso) != null ? (milMap.get(iso)! * gdpMap.get(iso)!) / 100 : null,
      milPct: milMap.get(iso) ?? null,
    });
    return { a: row(a), b: row(b) };
  }, [a, b, popMap, gdpMap, milMap]);

  const nameOf = (iso: string) => sorted.find((c) => c.iso3 === iso)?.name ?? iso;

  // peso: PIB 45%, gasto militar estimado 35%, población 20% (renormalizado si falta dato)
  const verdict = useMemo(() => {
    const parts: { w: number; share: number }[] = [];
    const push = (va: number | null, vb: number | null, w: number) => {
      if (va == null || vb == null || va + vb <= 0) return;
      parts.push({ w, share: va / (va + vb) });
    };
    push(metrics.a.gdp, metrics.b.gdp, 0.45);
    push(metrics.a.milEst, metrics.b.milEst, 0.35);
    push(metrics.a.pop, metrics.b.pop, 0.2);
    if (!parts.length) return null;
    const wsum = parts.reduce((s, p) => s + p.w, 0);
    return parts.reduce((s, p) => s + p.share * p.w, 0) / wsum; // % a favor de A
  }, [metrics]);

  const bar = (label: string, va: number | null, vb: number | null, fmtV: (n: number) => string) => {
    if (va == null || vb == null || va + vb <= 0) {
      return (
        <div className="text-[9px] font-mono text-muted-foreground py-1">{label}: dato oficial no disponible para alguno de los dos</div>
      );
    }
    const pa = Math.round((va / (va + vb)) * 100);
    return (
      <div>
        <div className="flex justify-between text-[9px] font-mono text-muted-foreground mb-0.5">
          <span className="text-cyan-hud">{fmtV(va)}</span>
          <span>{label}</span>
          <span className="text-red-hud">{fmtV(vb)}</span>
        </div>
        <div className="h-2 flex overflow-hidden rounded-sm bg-secondary">
          <div className="bg-cyan-hud/80" style={{ width: `${pa}%` }} />
          <div className="bg-red-hud/80" style={{ width: `${100 - pa}%` }} />
        </div>
      </div>
    );
  };

  const pa = verdict == null ? null : Math.round(verdict * 100);

  return (
    <div className="hud-panel p-3">
      <div className="flex items-center gap-2 mb-2">
        <Swords className="w-4 h-4 text-red-hud" />
        <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">¿Quién gana? — duelo de poder</h3>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mb-3">
        <select value={a} onChange={(e) => setA(e.target.value)} className="w-full h-9 bg-background/70 border border-border rounded-sm px-2 text-[12px] font-mono text-foreground outline-none focus:border-cyan-hud" aria-label="País A del duelo">
          {sorted.map((c) => <option key={c.iso3} value={c.iso3}>{c.name}</option>)}
        </select>
        <span className="text-[11px] font-black font-mono text-amber">VS</span>
        <select value={b} onChange={(e) => setB(e.target.value)} className="w-full h-9 bg-background/70 border border-border rounded-sm px-2 text-[12px] font-mono text-foreground outline-none focus:border-red-hud" aria-label="País B del duelo">
          {sorted.map((c) => <option key={c.iso3} value={c.iso3}>{c.name}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {bar("POBLACIÓN", metrics.a.pop, metrics.b.pop, (n) => fmt.format(n))}
        {bar("PIB TOTAL", metrics.a.gdp, metrics.b.gdp, (n) => `$${fmt.format(n)}`)}
        {bar("GASTO MILITAR EST.", metrics.a.milEst, metrics.b.milEst, (n) => `$${fmt.format(n)}`)}
      </div>

      {pa != null && (
        <div className="mt-3 hud-corner p-2 text-center" style={{ borderColor: pa >= 50 ? "#22D3EE66" : "#FF3B3066" }}>
          <p className="text-[11px] font-mono uppercase tracking-widest">
            <span className={pa >= 50 ? "text-cyan-hud font-bold" : "text-red-hud font-bold"}>
              VENTAJA {pa >= 50 ? nameOf(a) : nameOf(b)} · {Math.max(pa, 100 - pa)}%
            </span>
          </p>
          <p className="text-[9px] font-mono text-muted-foreground mt-1">
            Índice combinado: PIB 45% · gasto militar est. 35% · población 20% — cifras oficiales del Banco Mundial, no una predicción.
          </p>
        </div>
      )}
    </div>
  );
}

// ===== v41 DESAFÍO GEO — quiz rápido generado con los datos reales del panel =====
type QuizQ = { q: string; tag: string; options: { label: string; iso: string }[]; correctIso: string };

function generateQuiz(data: GeoData, countryMap: Map<string, CountryRow>): QuizQ[] {
  const qs: QuizQ[] = [];
  const pick4 = (rows: RankRow[]): RankRow[] | null => {
    if (!rows || rows.length < 4) return null;
    const pool = rows.slice(0, 12);
    const out: RankRow[] = [];
    while (out.length < 4 && pool.length) out.push(...pool.splice(Math.floor(Math.random() * pool.length), 1));
    return out.length === 4 ? out : null;
  };
  const top = (rows: RankRow[]) => rows.reduce((x, y) => (y.value > x.value ? y : x));

  const mil = pick4(data.military);
  if (mil) qs.push({
    q: "¿Cuál dedica MAYOR porcentaje de su PIB al ejército?",
    tag: "GASTO MILITAR",
    options: mil.map((r) => ({ label: r.name, iso: r.iso3 })),
    correctIso: top(mil).iso3,
  });
  const pop = pick4(data.population);
  if (pop) qs.push({
    q: "¿Cuál de estos países tiene MÁS habitantes?",
    tag: "POBLACIÓN",
    options: pop.map((r) => ({ label: r.name, iso: r.iso3 })),
    correctIso: top(pop).iso3,
  });
  const gdp = pick4(data.gdp);
  if (gdp) qs.push({
    q: "¿Cuál tiene la economía MÁS grande?",
    tag: "PIB",
    options: gdp.map((r) => ({ label: r.name, iso: r.iso3 })),
    correctIso: top(gdp).iso3,
  });

  const withCap = data.countries.filter((c) => c.capital && c.capital !== "—");
  if (withCap.length >= 4) {
    const pool = withCap.slice();
    const opts: CountryRow[] = [];
    while (opts.length < 4 && pool.length) opts.push(...pool.splice(Math.floor(Math.random() * pool.length), 1));
    qs.push({
      q: `¿Cuál es la capital de ${opts[0].name}?`,
      tag: "CAPITALES",
      options: opts.map((c) => ({ label: c.capital, iso: c.iso3 })),
      correctIso: opts[0].iso3,
    });
  }

  return qs.sort(() => Math.random() - 0.5).slice(0, 5);
}

const QUIZ_BEST_KEY = "vanguard-geoquiz-best";

function GeoQuiz({ data, countryMap }: { data: GeoData; countryMap: Map<string, CountryRow> }) {
  const [questions, setQuestions] = useState<QuizQ[]>(() => generateQuiz(data, countryMap));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try { return parseInt(localStorage.getItem(QUIZ_BEST_KEY) || "0", 10) || 0; } catch { return 0; }
  });

  const answer = (iso: string) => {
    if (picked || done || !questions.length) return;
    setPicked(iso);
    const ok = iso === questions[idx].correctIso;
    const final = score + (ok ? 1 : 0);
    if (ok) setScore(final);
    setTimeout(() => {
      setPicked(null);
      if (idx + 1 >= questions.length) {
        setDone(true);
        if (final > best) {
          setBest(final);
          try { localStorage.setItem(QUIZ_BEST_KEY, String(final)); } catch { /* noop */ }
        }
      } else {
        setIdx((i) => i + 1);
      }
    }, 900);
  };

  const newRound = () => {
    setQuestions(generateQuiz(data, countryMap));
    setIdx(0);
    setScore(0);
    setPicked(null);
    setDone(false);
  };

  return (
    <div className="hud-panel p-3">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="w-4 h-4 text-amber" />
        <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Desafío Geo — demuestra lo que sabes</h3>
        <span className="ml-auto text-[9px] font-mono text-amber">RÉCORD {best}/5</span>
      </div>

      {questions.length === 0 ? (
        <p className="text-[11px] font-mono text-muted-foreground p-2 text-center">Preparando preguntas con datos oficiales…</p>
      ) : !done ? (
        <>
          <div className="flex items-center gap-2 mb-1.5 text-[9px] font-mono text-muted-foreground">
            <span className="text-amber">{questions[idx].tag}</span>
            <span>·</span>
            <span>{idx + 1}/{questions.length}</span>
            <span className="ml-auto inline-flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {score} aciertos</span>
          </div>
          <p className="text-[12px] font-bold mb-2">{questions[idx].q}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {questions[idx].options.map((o) => {
              const isCorrect = o.iso === questions[idx].correctIso;
              const show = picked != null;
              return (
                <button
                  key={o.iso}
                  onClick={() => answer(o.iso)}
                  disabled={show}
                  className={cn(
                    "p-2 border text-left text-[11px] font-mono transition-all",
                    !show && "border-border hover:border-amber-hud hover:text-amber",
                    show && isCorrect && "border-green-hud text-green-hud bg-green-hud/10",
                    show && o.iso === picked && !isCorrect && "border-red-hud text-red-hud bg-red-hud/10",
                    show && o.iso !== picked && !isCorrect && "border-border/50 text-muted-foreground"
                  )}
                >
                  {show && isCorrect && <Check className="w-3 h-3 inline mr-1" />}
                  {show && o.iso === picked && !isCorrect && <XIcon className="w-3 h-3 inline mr-1" />}
                  {o.label}
                </button>
              );
            })}
          </div>
          <p className="text-[9px] font-mono text-muted-foreground mt-2">Preguntas generadas en vivo con los rankings oficiales del Banco Mundial.</p>
        </>
      ) : (
        <div className="text-center py-3">
          <p className="text-2xl font-black font-mono text-amber">{score}/5</p>
          <p className="text-[11px] font-mono text-muted-foreground mt-1 max-w-[280px] mx-auto">
            {score === 5
              ? "¡INTELIGENCIA DE ELITE, comandante! 5 de 5 con datos oficiales."
              : score >= 3
                ? "Buen ojo estratégico — una ronda más y lo bordas."
                : "El mundo es difícil — otra ronda y mejoras."}
          </p>
          <Button size="sm" onClick={newRound} className="mt-2 h-8 font-mono text-[10px] uppercase border-amber-hud text-amber hover:bg-amber-hud hover:text-background" variant="outline">
            <Dices className="w-3 h-3 mr-1" /> Otra ronda
          </Button>
        </div>
      )}
    </div>
  );
}
