"use client";

// ============================================================
// v173.0 LA CASA EN VIVO — EL MERCADO COMO HÉROE DE LA PORTADA
// Los mejores gráficos de la casa, a la manera de los grandes
// sitios de mercado: cinta de cotizaciones que camina sola,
// gráfico de velas 1m con volumen (lightweight-charts, el motor
// open-source de TradingView), lista de seguimiento con chispas
// y flash verde/rojo en cada tick. Datos reales keyless
// (Binance + Yahoo Finance) llegando solos cada 5 segundos.
// ============================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { createChart, ColorType, CrosshairMode, type IChartApi, type ISeriesApi, type CandlestickData, type UTCTimestamp, type HistogramData } from "lightweight-charts";
import { useMercadoVivo, fmtPrecio, fmtPct, type Ticker, type Clase, type Direccion } from "@/lib/mercado-vivo";

const VERDE = "#26a69a";
const ROJO = "#ef5350";
const CLASES: Array<{ k: Clase | "todas"; label: string }> = [
  { k: "todas", label: "TODAS" },
  { k: "cripto", label: "CRIPTO" },
  { k: "acciones", label: "ACCIONES" },
  { k: "indices", label: "ÍNDICES" },
  { k: "divisas", label: "DIVISAS" },
];

// ── CHISPA: mini-gráfico SVG (la firma de las watchlists) ────
function Chispa({ datos, sube }: { datos: number[]; sube: boolean }) {
  if (!datos || datos.length < 3) return <span className="inline-block w-16 h-6" aria-hidden />;
  const min = Math.min(...datos);
  const max = Math.max(...datos);
  const rango = max - min || 1;
  const W = 64, H = 24, N = datos.length;
  const pts = datos.map((v, i) => `${((i / (N - 1)) * W).toFixed(1)},${(H - 2 - ((v - min) / rango) * (H - 4)).toFixed(1)}`).join(" ");
  const color = sube ? VERDE : ROJO;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

// ── PILDORA Δ% ───────────────────────────────────────────────
function Pct({ d }: { d: number }) {
  const sube = d >= 0;
  return (
    <span className={`font-mono text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded ${sube ? "text-[#26a69a] bg-[#26a69a]/10" : "text-[#ef5350] bg-[#ef5350]/10"}`}>
      {fmtPct(d)}
    </span>
  );
}

// ── CINTA DE COTIZACIONES: camina sola, pausa al hover ──────
function CintaTickers({ activos, onElegir }: { activos: Ticker[]; onElegir: (id: string) => void }) {
  const lista = activos.slice(0, 24);
  if (lista.length === 0) return null;
  // v173: función de render (no componente) — la regla static-components exige
  // no crear componentes durante el render; el elemento se pinta por llamada.
  const fila = (duplicada?: boolean) => (
    <div className="flex items-center gap-5 pr-5 shrink-0" aria-hidden={duplicada || undefined} key={duplicada ? "cinta-2" : "cinta-1"}>
      {lista.map((a) => {
        const sube = a.d >= 0;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onElegir(a.id)}
            className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] whitespace-nowrap hover:text-amber transition-colors"
            title={a.n}
            tabIndex={duplicada ? -1 : 0}
          >
            <span className="font-bold text-foreground/90">{a.id}</span>
            <span className="text-muted-foreground">{fmtPrecio(a.p)}</span>
            <span className={sube ? "text-[#26a69a]" : "text-[#ef5350]"}>{fmtPct(a.d)}</span>
          </button>
        );
      })}
    </div>
  );
  return (
    <div className="vg173-cinta overflow-hidden border-y border-amber-hud/20 bg-black/30">
      <div className="vg173-marquee flex w-max py-1.5">
        {fila()}
        {fila(true)}
      </div>
    </div>
  );
}

// ── GRÁFICO EN VIVO: velas 1m + volumen (motor TradingView) ──
function GraficoVivo({ activo, tick }: { activo: Ticker | undefined; tick: Direccion }) {
  const caja = useRef<HTMLDivElement | null>(null);
  const grafico = useRef<IChartApi | null>(null);
  const velas = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumen = useRef<ISeriesApi<"Histogram"> | null>(null);
  const area = useRef<ISeriesApi<"Area"> | null>(null);
  const ultima = useRef<{ t: number; o: number; h: number; l: number; c: number } | null>(null);

  // nacimiento del gráfico (una vez)
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const g = createChart(el, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#8b93a7", fontSize: 10, fontFamily: "ui-monospace, SFMono-Regular, monospace" },
      grid: { vertLines: { color: "rgba(140,150,170,0.06)" }, horzLines: { color: "rgba(140,150,170,0.06)" } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "rgba(140,150,170,0.18)" },
      timeScale: { borderColor: "rgba(140,150,170,0.18)", timeVisible: true, secondsVisible: false, rightOffset: 4 },
    });
    grafico.current = g;
    return () => { g.remove(); grafico.current = null; velas.current = null; volumen.current = null; area.current = null; ultima.current = null; };
  }, []);

  // velas: al cambiar de activo, traer el histórico y sembrar
  useEffect(() => {
    let muerto = false;
    const g = grafico.current;
    if (!g || !activo) return;
    (async () => {
      try {
        const r = await fetch(`/api/mercado?id=${encodeURIComponent(activo.id)}`, { cache: "no-store" });
        const j = (await r.json()) as { ok: boolean; velas?: Array<{ t: number; o: number; h: number; l: number; c: number; v: number }> };
        if (muerto || !j.ok || !j.velas?.length) return;
        const limpias = new Map<number, { t: number; o: number; h: number; l: number; c: number; v: number }>();
        for (const v of j.velas) limpias.set(v.t, v); // dedupe + orden
        const orden = [...limpias.values()].sort((a, b) => a.t - b.t);
        if (!orden.length) return;
        if (velas.current) { g.removeSeries(velas.current); velas.current = null; }
        if (volumen.current) { g.removeSeries(volumen.current); volumen.current = null; }
        if (area.current) { g.removeSeries(area.current); area.current = null; }
        if (orden.length >= 10) {
          velas.current = g.addCandlestickSeries({ upColor: VERDE, downColor: ROJO, borderVisible: false, wickUpColor: VERDE, wickDownColor: ROJO });
          const cd: CandlestickData[] = orden.map((v) => ({ time: v.t as UTCTimestamp, open: v.o, high: v.h, low: v.l, close: v.c }));
          velas.current.setData(cd);
          volumen.current = g.addHistogramSeries({ priceFormat: { type: "volume" }, priceScaleId: "vol" });
          g.priceScale("vol").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
          const hd: HistogramData[] = orden.map((v) => ({ time: v.t as UTCTimestamp, value: v.v, color: v.c >= v.o ? "rgba(38,166,154,0.35)" : "rgba(239,83,80,0.35)" }));
          volumen.current.setData(hd);
          ultima.current = orden[orden.length - 1];
        } else {
          area.current = g.addAreaSeries({ lineColor: "#d4af37", topColor: "rgba(212,175,55,0.25)", bottomColor: "rgba(212,175,55,0.02)", lineWidth: 2 });
          const base = Math.floor(Date.now() / 60000) * 60 - (orden.length - 1) * 60;
          area.current.setData(orden.map((v, i) => ({ time: (base + i * 60) as UTCTimestamp, value: v.c })));
          ultima.current = orden[orden.length - 1];
        }
        g.timeScale().fitContent();
      } catch { /* el gráfico espera el próximo latido */ }
    })();
    return () => { muerto = true; };
  }, [activo?.id]);

  // latido: el precio vivo mueve la última vela (o abre una nueva)
  useEffect(() => {
    const g = grafico.current;
    const u = ultima.current;
    if (!g || !u || !activo || !activo.p) return;
    const bloque = Math.floor(Date.now() / 60000) * 60;
    try {
      if (bloque > u.t) {
        const nueva = { t: bloque, o: activo.p, h: activo.p, l: activo.p, c: activo.p };
        ultima.current = nueva;
        if (velas.current) velas.current.update({ time: bloque as UTCTimestamp, open: nueva.o, high: nueva.h, low: nueva.l, close: nueva.c });
        if (area.current) area.current.update({ time: bloque as UTCTimestamp, value: activo.p });
        if (volumen.current) volumen.current.update({ time: bloque as UTCTimestamp, value: 0, color: "rgba(140,150,170,0.2)" });
      } else {
        u.c = activo.p;
        u.h = Math.max(u.h, activo.p);
        u.l = Math.min(u.l, activo.p);
        if (velas.current) velas.current.update({ time: u.t as UTCTimestamp, open: u.o, high: u.h, low: u.l, close: u.c });
        if (area.current) area.current.update({ time: u.t as UTCTimestamp, value: activo.p });
      }
    } catch { /* lightweight-charts es quisquilloso con tiempos: nunca romper */ }
  }, [activo?.p, activo?.id, tick]);

  return (
    <div className={`relative rounded-lg border border-amber-hud/15 bg-black/40 overflow-hidden ${tick === "sube" ? "vg173-flash-up" : tick === "baja" ? "vg173-flash-down" : ""}`}>
      <div ref={caja} className="w-full h-[280px] sm:h-[380px]" />
      {!activo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[10px] text-muted-foreground animate-pulse">ABRIENDO EL GRÁFICO…</span>
        </div>
      )}
    </div>
  );
}

// ── FILA DE WATCHLIST ────────────────────────────────────────
function FilaWatch({ a, activa, dir, onElegir }: { a: Ticker; activa: boolean; dir: Direccion; onElegir: (id: string) => void }) {
  const sube = a.d >= 0;
  return (
    <button
      type="button"
      onClick={() => onElegir(a.id)}
      className={`w-full grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-2 rounded-md border text-left transition-colors ${
        activa ? "border-amber-hud/50 bg-amber-hud/10" : "border-transparent hover:bg-white/5"
      } ${dir === "sube" ? "vg173-flash-up" : dir === "baja" ? "vg173-flash-down" : ""}`}
    >
      <span className="min-w-0">
        <span className="block font-mono text-[11px] font-bold text-foreground/90 truncate">{a.id}</span>
        <span className="block text-[9px] text-muted-foreground truncate">{a.n}</span>
      </span>
      <Chispa datos={a.ch} sube={sube} />
      <span className="text-right">
        <span className={`block font-mono text-[11px] font-bold ${dir === "sube" ? "text-[#26a69a]" : dir === "baja" ? "text-[#ef5350]" : "text-foreground/90"}`}>{fmtPrecio(a.p)}</span>
        <Pct d={a.d} />
      </span>
    </button>
  );
}

// ── EL HUB ───────────────────────────────────────────────────
export default function MercadoVivo() {
  const { activos, dirs, ts, vivo, error } = useMercadoVivo();
  const [clase, setClase] = useState<Clase | "todas">("todas");
  const [activoId, setActivoId] = useState("BTC");

  const filtrados = useMemo(() => (clase === "todas" ? activos : activos.filter((a) => a.c === clase)), [activos, clase]);
  const activo = activos.find((a) => a.id === activoId);
  const hora = ts ? new Date(ts).toLocaleTimeString("es-ES", { hour12: false }) : "";

  const elegir = (id: string) => { setActivoId(id); setClase("todas"); };

  return (
    <section className="vg173-terminal mx-auto max-w-7xl px-3 sm:px-4 pt-4" aria-label="Mercado en vivo">
      {/* cabecera del hub */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
        <h2 className="font-mono text-sm sm:text-base font-black tracking-widest text-gradient">MERCADO EN VIVO</h2>
        <span className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground">
          <i className="vg173-pulso inline-block w-1.5 h-1.5 rounded-full bg-[#26a69a]" aria-hidden />
          {vivo ? `ÚLTIMO TICK ${hora}` : "CONECTANDO…"}
        </span>
        <span className="hidden sm:inline font-mono text-[9px] text-muted-foreground/70 border border-amber-hud/20 rounded px-1.5 py-0.5">
          BINANCE · YAHOO FINANCE · SIN API KEYS
        </span>
        {error && vivo === false && (
          <span className="font-mono text-[9px] text-[#ef5350]">{error} · reintentando</span>
        )}
      </div>

      {/* la cinta que camina */}
      <CintaTickers activos={activos} onElegir={elegir} />

      {/* cuerpo: gráfico + watchlist */}
      <div className="mt-3 grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-3">
        <div>
          {/* pestañas de clase + precio grande del activo */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {CLASES.map((c) => (
              <button
                key={c.k}
                type="button"
                onClick={() => setClase(c.k)}
                className={`font-mono text-[9px] sm:text-[10px] font-bold tracking-wider px-2 py-1 rounded border transition-colors ${
                  clase === c.k ? "border-amber-hud/60 bg-amber-hud/15 text-amber" : "border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          {activo && (
            <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-2 px-1 ${dirs[activo.id] === "sube" ? "vg173-flash-up" : dirs[activo.id] === "baja" ? "vg173-flash-down" : ""}`}>
              <span className="font-mono text-base sm:text-lg font-black text-foreground">{activo.id}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">{activo.n} · {activo.f.toUpperCase()}</span>
              <span className={`font-mono text-lg sm:text-2xl font-black ${dirs[activo.id] === "sube" ? "text-[#26a69a]" : dirs[activo.id] === "baja" ? "text-[#ef5350]" : "text-foreground"}`}>
                {fmtPrecio(activo.p)}
              </span>
              <Pct d={activo.d} />
            </div>
          )}
          {/* pastillas rápidas del universo filtrado */}
          <div className="flex flex-wrap gap-1 mb-2">
            {filtrados.slice(0, 14).map((a) => {
              const sube = a.d >= 0;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setActivoId(a.id)}
                  className={`font-mono text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                    activoId === a.id ? "border-amber-hud/60 text-amber bg-amber-hud/10" : sube ? "border-[#26a69a]/25 text-[#26a69a] hover:bg-[#26a69a]/10" : "border-[#ef5350]/25 text-[#ef5350] hover:bg-[#ef5350]/10"
                  }`}
                  title={`${a.n} · ${fmtPrecio(a.p)}`}
                >
                  {a.id}
                </button>
              );
            })}
          </div>
          <GraficoVivo activo={activo} tick={dirs[activoId] ?? null} />
          <p className="mt-1.5 font-mono text-[9px] text-muted-foreground/60 px-1">
            VELAS 1M EN VIVO · datos públicos keyless · la casa se actualiza sola cada 5 s
          </p>
        </div>

        {/* watchlist */}
        <aside className="rounded-lg border border-amber-hud/15 bg-black/40 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-amber-hud/15">
            <span className="font-mono text-[10px] font-bold tracking-widest text-foreground/80">LISTA DE SEGUIMIENTO</span>
            <span className="font-mono text-[9px] text-muted-foreground">{filtrados.length} ACTIVOS</span>
          </div>
          <div className="max-h-[300px] lg:max-h-[440px] overflow-y-auto vg173-scroll p-1.5 flex flex-col gap-0.5">
            {filtrados.length === 0 && (
              <div className="px-3 py-8 text-center font-mono text-[10px] text-muted-foreground animate-pulse">
                {vivo ? "SIN ACTIVOS EN ESTA CLASE" : "SINTONIZANDO EL MERCADO…"}
              </div>
            )}
            {filtrados.map((a) => (
              <FilaWatch key={a.id} a={a} activa={a.id === activoId} dir={dirs[a.id] ?? null} onElegir={setActivoId} />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
