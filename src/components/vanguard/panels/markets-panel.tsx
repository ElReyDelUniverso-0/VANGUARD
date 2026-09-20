"use client";

// Vanguard v9 — BOLSA GEOPOLITICA PULIDA:
// FIX "se traba": renders estratificados por divisor de tick (1s precio / 2s listas /
// 5s cinta) + React.memo en subtrees pesados + cero remounts de framer-motion por tick.
// FIX "no aparecen las barras": updates de velas con try/catch + fallback setData completo.
// NUEVO: inversion facil (montos rapidos en mon + slider + COMPRAR/VENTA TOTAL 1 toque)
// y CESTA multi-pais (elegir varios paises, reparto igualitario y comparador de lineas).
import { useState, useEffect, useMemo, useRef, useSyncExternalStore, memo, useCallback } from "react";
import {
  TrendingUp, TrendingDown, Wallet, Activity, ArrowUpRight, ArrowDownRight,
  Zap, CircleDollarSign, Newspaper, Info, Star, X, ListOrdered, LineChart,
  CandlestickChart, Clock, Layers, Plus, Check, ShoppingCart, Scale, Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createChart } from "lightweight-charts";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { StakingPanel, AlertsPanel } from "@/components/vanguard/panels/market-extras";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import {
  marketSim, ASSETS, formatPrice, formatVolume, formatClock, TIMEFRAMES,
  type CountryAsset, type AssetState, type Candle, type BookLevel, type TimeframeKey,
} from "@/lib/market-sim";
import { toast } from "sonner";

const FEE = 0.005; // comision taker 0.5%
const UP = "#4ade80";
const DOWN = "#ef4444";
const TF_KEYS = Object.keys(TIMEFRAMES) as TimeframeKey[];
const LINE_COLORS = ["#4ade80", "#f5a623", "#22d3ee", "#a855f7", "#ef4444", "#facc15"];

// ====== suscripcion estratificada: re-render solo cada N ticks ======
function useTickKey(divisor: number): number {
  return useSyncExternalStore(
    marketSim.subscribe,
    () => Math.floor(marketSim.getState().tickCount / divisor),
    () => 0
  );
}

export function MarketsPanel() {
  useTickKey(1); // refresco 1s para precio/cabecera/motor de ordenes
  const [selId, setSelId] = useState<string>("USDX");
  const [tf, setTf] = useState<TimeframeKey>("5m");
  const [chartType, setChartType] = useState<"candles" | "line">("candles");
  const [basket, setBasket] = useState<string[]>([]);

  const coins = useGameStore((s) => s.coins);
  const holdings = useGameStore((s) => s.marketHoldings);
  const trades = useGameStore((s) => s.marketTrades);
  const realized = useGameStore((s) => s.marketRealized);
  const feesPaid = useGameStore((s) => s.marketFeesPaid);
  const favorites = useGameStore((s) => s.marketFavorites);
  const orders = useGameStore((s) => s.marketOrders);
  const buyAsset = useGameStore((s) => s.buyAsset);
  const sellAsset = useGameStore((s) => s.sellAsset);
  const toggleFavorite = useGameStore((s) => s.toggleFavorite);
  const placeOrder = useGameStore((s) => s.placeOrder);
  const cancelOrder = useGameStore((s) => s.cancelOrder);
  const fillOrder = useGameStore((s) => s.fillOrder);

  useEffect(() => {
    marketSim.init();
  }, []);

  // motor de ordenes limite: se ejecutan cuando el precio cruza el limite
  useEffect(() => {
    const st = marketSim.getState();
    const pend = useGameStore.getState().marketOrders;
    for (const o of pend) {
      const p = st.assets[o.assetId]?.price;
      if (!p) continue;
      const crossed = o.side === "BUY" ? p <= o.limitPrice : p >= o.limitPrice;
      if (crossed) {
        const res = fillOrder(o.id, o.limitPrice);
        if (res.ok) {
          toast.success(`ORDEN EJECUTADA: ${o.side === "BUY" ? "COMPRA" : "VENTA"} ${o.qty} x ${o.assetId} @ ${formatPrice(o.limitPrice)}${res.pnl !== undefined ? ` (P/L ${res.pnl >= 0 ? "+" : ""}${res.pnl})` : ""}`);
        }
      }
    }
  }, [fillOrder]);

  const asset: CountryAsset = ASSETS.find((a) => a.id === selId) ?? ASSETS[0];
  const st: AssetState | undefined = marketSim.getState().assets[selId];
  const price = st?.price ?? asset.base;
  const change = st?.change24h ?? 0;
  const up = change >= 0;
  const holding = holdings[selId];

  const portfolioValue = useMemo(
    () => Object.entries(holdings).reduce((acc, [id, h]) => acc + (marketSim.getState().assets[id]?.price ?? 0) * h.qty, 0),
    [holdings]
  );
  const unrealized = useMemo(
    () => Object.entries(holdings).reduce((acc, [id, h]) => acc + ((marketSim.getState().assets[id]?.price ?? 0) - h.avgCost) * h.qty, 0),
    [holdings]
  );
  const invested = useMemo(
    () => Object.values(holdings).reduce((acc, h) => acc + h.avgCost * h.qty, 0),
    [holdings]
  );
  const roiPct = invested > 0 ? (unrealized / invested) * 100 : 0;

  // v11: venta total de una posicion desde el portafolio (1 toque)
  const handleSellAll = useCallback((id: string) => {
    const h = useGameStore.getState().marketHoldings[id];
    const price = marketSim.getState().assets[id]?.price;
    if (!h || !price) return;
    const fee = h.qty * price * FEE;
    const pnl = sellAsset(id, h.qty, price, fee);
    if (pnl > 0) { toast.success(`VENTA TOTAL ${id}: ${h.qty} u. · P/L +${pnl} mon`); sfx.coin(); }
    else if (pnl < 0) { toast.success(`VENTA TOTAL ${id}: ${h.qty} u. · P/L ${pnl} mon`); sfx.error(); }
    else toast.success(`VENTA TOTAL ${id}: ${h.qty} u. · sin cambios`);
  }, [sellAsset]);

  const toggleBasket = useCallback((id: string) => {
    setBasket((b) => {
      if (b.includes(id)) return b.filter((x) => x !== id);
      if (b.length >= 6) {
        toast.error("Máximo 6 países por cesta");
        return b;
      }
      return [...b, id];
    });
  }, []);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Bolsa geopolítica"
        subtitle="Exchange de países · velas en vivo · 34 activos soberanos · comisión taker 0.5%"
        icon={<Activity className="w-4 h-4 text-green-hud" />}
        color="green"
        right={
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Wallet className="w-3.5 h-3.5 text-amber" /> {coins} mon
            </span>
            <span className={cn("flex items-center gap-1", unrealized >= 0 ? "text-green-hud" : "text-red-hud")}>
              P/L {unrealized >= 0 ? "+" : ""}{Math.round(unrealized)}
            </span>
            {invested > 0 && (
              <span className={cn(
                "px-1.5 py-0.5 border rounded-sm font-bold",
                roiPct >= 0 ? "border-green-hud text-green-hud bg-green-hud/10" : "border-red-hud text-red-hud bg-red-hud/10"
              )}>
                ROI {roiPct >= 0 ? "+" : ""}{roiPct.toFixed(1)}%
              </span>
            )}
          </div>
        }
      />

      {/* cinta de cotizaciones (5s) */}
      <TickerTape tickKey5={Math.floor(marketSim.getState().tickCount / 5)} onSelect={setSelId} />

      <div className="grid lg:grid-cols-12 gap-4">
        {/* LISTA DE MERCADO (2s) */}
        <MarketList
          selId={selId}
          onSelect={setSelId}
          favorites={favorites}
          onToggleFav={toggleFavorite}
          basket={basket}
          onToggleBasket={toggleBasket}
        />

        {/* GRAFICA + LIBRO + TRADES */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-3">
          <div className="hud-corner p-3 bg-secondary/40">
            {/* cabecera del par */}
            <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
              <div className="flex items-center gap-2.5">
                <FlagBadge code={asset.flag} size="lg" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-mono font-bold text-foreground">{asset.id}</span>
                    <span className="text-[9px] font-mono text-muted-foreground">/MON</span>
                    <span className={cn(
                      "text-[8px] font-mono px-1.5 py-0.5 border rounded-sm uppercase",
                      asset.sector === "POTENCIA" ? "border-amber-hud text-amber"
                        : asset.sector === "EMERGENTE" ? "border-green-hud text-green-hud"
                        : "border-red-hud text-red-hud"
                    )}>
                      {asset.sector}
                    </span>
                    <button
                      onClick={() => { toggleFavorite(asset.id); }}
                      aria-label="Marcar favorito"
                      className="ml-0.5"
                    >
                      <Star className={cn(
                        "w-3.5 h-3.5 transition-colors",
                        favorites.includes(asset.id) ? "text-amber fill-amber" : "text-muted-foreground/50 hover:text-amber"
                      )} />
                    </button>
                    <button
                      onClick={() => toggleBasket(asset.id)}
                      aria-label="Añadir a cesta"
                      title="Añadir/quitar de la cesta multi-país"
                    >
                      {basket.includes(asset.id)
                        ? <Check className="w-3.5 h-3.5 text-green-hud" />
                        : <Plus className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-green-hud" />}
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">{asset.name} · cap. {(asset.mcap / 1000).toFixed(1)}B mon</div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-2xl font-mono font-bold leading-none tabular-nums", up ? "text-green-hud" : "text-red-hud")}>
                  {formatPrice(price)}
                </div>
                <div className={cn("text-xs font-mono font-bold mt-0.5 flex items-center justify-end gap-0.5", up ? "text-green-hud" : "text-red-hud")}>
                  {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {up ? "+" : ""}{change.toFixed(2)}% 24h
                </div>
              </div>
            </div>

            {/* temporalidades + tipo de grafico */}
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
              <div className="flex items-center gap-0.5 flex-wrap">
                {TF_KEYS.map((k) => (
                  <button
                    key={k}
                    onClick={() => setTf(k)}
                    className={cn(
                      "px-2 py-1 text-[10px] font-mono rounded-sm transition-colors",
                      tf === k ? "bg-amber-hud/30 text-amber border border-amber-hud/60" : "text-muted-foreground hover:text-foreground border border-transparent"
                    )}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setChartType("candles")}
                  aria-label="Velas"
                  className={cn("p-1.5 rounded-sm border", chartType === "candles" ? "border-amber-hud/60 text-amber bg-amber-hud/20" : "border-border/50 text-muted-foreground")}
                >
                  <CandlestickChart className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setChartType("line")}
                  aria-label="Linea"
                  className={cn("p-1.5 rounded-sm border", chartType === "line" ? "border-amber-hud/60 text-amber bg-amber-hud/20" : "border-border/50 text-muted-foreground")}
                >
                  <LineChart className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <TradingChart
              assetId={asset.id}
              tf={tf}
              type={chartType}
              tickKey1={Math.floor(marketSim.getState().tickCount / 1)}
            />

            <MiniStats assetId={asset.id} tickKey2={Math.floor(marketSim.getState().tickCount / 2)} />
            <div className="mt-2 flex items-start gap-1.5 text-[10px] font-mono text-muted-foreground">
              <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
              {asset.desc} Volatilidad {asset.vol < 0.004 ? "baja" : asset.vol < 0.009 ? "media" : asset.vol < 0.014 ? "alta" : "extrema"}.
              {holding && holding.qty > 0 && (
                <span className="text-amber ml-1">Posición: {holding.qty} u. · coste {formatPrice(holding.avgCost)}</span>
              )}
            </div>
          </div>

          {/* libro de ordenes + operaciones en vivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OrderBook assetId={asset.id} tickKey1={Math.floor(marketSim.getState().tickCount / 1)} />
            <LiveTrades assetId={asset.id} tickKey1={Math.floor(marketSim.getState().tickCount / 1)} />
          </div>
        </div>

        {/* OPERAR + CESTA + PORTAFOLIO */}
        <div className="lg:col-span-3 order-3 space-y-3">
          <QuickTrade
            selId={selId}
            coins={coins}
            holding={holding}
            onBuy={(qty, p) => {
              const fee = qty * p * FEE;
              const ok = buyAsset(selId, qty, p, fee);
              if (ok) toast.success(`COMPRA EJECUTADA: ${qty} x ${selId} @ ${formatPrice(p)} · comisión ${Math.round(fee)} mon`);
              else toast.error("Saldo insuficiente");
            }}
            onSell={(qty, p) => {
              const fee = qty * p * FEE;
              const pnl = sellAsset(selId, qty, p, fee);
              toast.success(`VENTA EJECUTADA: ${qty} x ${selId} · P/L ${pnl >= 0 ? "+" : ""}${pnl} mon`);
            }}
            onLimit={(side, qty, limit) => {
              const ok = placeOrder(selId, side, qty, limit);
              if (ok) toast.success(`ORDEN LÍMITE CREADA: ${side === "BUY" ? "COMPRA" : "VENTA"} ${qty} x ${selId} @ ${formatPrice(limit)}`);
              else toast.error(side === "BUY" ? "Saldo insuficiente para reservar la orden" : "No tienes suficientes unidades");
            }}
          />

          <BasketPanel
            basket={basket}
            onRemove={toggleBasket}
            onClear={() => setBasket([])}
            onSet={(ids) => setBasket(ids)}
            favorites={favorites}
            coins={coins}
            buyAsset={buyAsset}
          />

          {/* ordenes pendientes */}
          <PendingOrders
            orders={orders}
            tickKey1={Math.floor(marketSim.getState().tickCount / 1)}
            onCancel={cancelOrder}
          />

          {/* portafolio */}
          <Portfolio
            holdings={holdings}
            portfolioValue={portfolioValue}
            unrealized={unrealized}
            realized={realized}
            feesPaid={feesPaid}
            onSelect={setSelId}
            onSellAll={handleSellAll}
          />
        </div>
      </div>

      {/* staking + alertas (v8) */}
      <div className="grid lg:grid-cols-2 gap-4">
        <StakingPanel selId={selId} onSelect={setSelId} />
        <AlertsPanel selId={selId} price={price} market={marketSim.getState()} />
      </div>

      {/* eventos + historial */}
      <div className="grid lg:grid-cols-2 gap-4">
        <EventsFeed tickKey3={Math.floor(marketSim.getState().tickCount / 3)} />
        <MyTrades trades={trades} />
      </div>
    </div>
  );
}

// =================== cinta de cotizaciones (5s) ===================
const TickerTape = memo(function TickerTape({ tickKey5, onSelect }: { tickKey5: number; onSelect: (id: string) => void }) {
  const market = marketSim.getState();
  return (
    <div className="hud-corner overflow-hidden bg-secondary/40" aria-hidden={false}>
      <div className="flex whitespace-nowrap ticker">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0">
            {ASSETS.map((a) => {
              const s = market.assets[a.id];
              if (!s) return null;
              const ch = s.change24h;
              return (
                <button
                  key={`${dup}-${a.id}`}
                  onClick={() => onSelect(a.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono hover:bg-secondary/60"
                >
                  <FlagBadge code={a.flag} size="sm" />
                  <span className="font-bold text-foreground">{a.id}</span>
                  <span className="text-muted-foreground">{formatPrice(s.price)}</span>
                  <span className={ch >= 0 ? "text-green-hud" : "text-red-hud"}>
                    {ch >= 0 ? "+" : "-"}{Math.abs(ch).toFixed(2)}%
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

// =================== lista de mercado (2s, filas memo) ===================
function MarketList({
  selId, onSelect, favorites, onToggleFav, basket, onToggleBasket,
}: {
  selId: string;
  onSelect: (id: string) => void;
  favorites: string[];
  onToggleFav: (id: string) => void;
  basket: string[];
  onToggleBasket: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>("TODAS");
  const [sort, setSort] = useState<"CAP" | "CHG" | "PRICE" | "GAIN" | "LOSE">("CAP");
  const tickKey2 = useTickKey(2);

  const list = useMemo(() => {
    let l = ASSETS;
    if (group === "FAV") l = l.filter((a) => favorites.includes(a.id));
    else if (group !== "TODAS") l = l.filter((a) => a.sector === group);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      l = l.filter((a) => a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
    }
    const market = marketSim.getState();
    const sorted = [...l];
    if (sort === "CAP") sorted.sort((a, b) => b.mcap - a.mcap);
    if (sort === "CHG") sorted.sort((a, b) => (market.assets[b.id]?.change24h ?? 0) - (market.assets[a.id]?.change24h ?? 0));
    if (sort === "GAIN") sorted.sort((a, b) => (market.assets[b.id]?.change24h ?? 0) - (market.assets[a.id]?.change24h ?? 0));
    if (sort === "LOSE") sorted.sort((a, b) => (market.assets[a.id]?.change24h ?? 0) - (market.assets[b.id]?.change24h ?? 0));
    if (sort === "PRICE") sorted.sort((a, b) => (market.assets[b.id]?.price ?? 0) - (market.assets[a.id]?.price ?? 0));
    return sorted;
    // tickKey2 obliga a reordenar cada 2s con precios vivos
     
  }, [query, group, sort, favorites, tickKey2]);

  return (
    <div className="lg:col-span-3 order-2 lg:order-1">
      <div className="hud-corner bg-secondary/40">
        <div className="p-2.5 border-b border-amber-hud/30 flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Layers className="w-3 h-3" /> Mercado
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            aria-label="Ordenar mercado"
            className="bg-background border border-border/60 rounded-sm text-[9px] font-mono px-1 py-0.5 text-muted-foreground focus:outline-none"
          >
            <option value="CAP">CAP.</option>
            <option value="GAIN">SUBEN ↑</option>
            <option value="LOSE">BAJAN ↓</option>
            <option value="PRICE">PRECIO</option>
          </select>
        </div>
        <div className="p-2 border-b border-border/30 space-y-1.5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar pais o ticker..."
            aria-label="Buscar activo"
            className="w-full px-2 py-1.5 bg-background border border-border/60 rounded-sm text-[10px] font-mono text-foreground focus:outline-none focus:border-amber-hud/60"
          />
          <div className="flex gap-1 flex-wrap">
            {["FAV", "TODAS", "POTENCIA", "EMERGENTE", "FRONTERA"].map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={cn(
                  "px-1.5 py-0.5 border text-[8px] font-mono uppercase rounded-sm",
                  group === g ? "border-amber-hud/60 text-amber bg-amber-hud/20" : "border-border/50 text-muted-foreground hover:text-foreground"
                )}
              >
                {g === "FAV" ? "★ FAV" : g}
              </button>
            ))}
          </div>
        </div>
        <div className="max-h-[520px] overflow-y-auto thin-scroll divide-y divide-border/30">
          {list.length === 0 && (
            <div className="p-3 text-[10px] font-mono text-muted-foreground">Sin resultados.</div>
          )}
          {list.map((a) => (
            <MarketRow
              key={a.id}
              id={a.id}
              flag={a.flag}
              name={a.name}
              selected={selId === a.id}
              fav={favorites.includes(a.id)}
              inBasket={basket.includes(a.id)}
              onSelect={onSelect}
              onToggleFav={onToggleFav}
              onToggleBasket={onToggleBasket}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const MarketRow = memo(function MarketRow({
  id, flag, name, selected, fav, inBasket, onSelect, onToggleFav, onToggleBasket,
}: {
  id: string;
  flag: string;
  name: string;
  selected: boolean;
  fav: boolean;
  inBasket: boolean;
  onSelect: (id: string) => void;
  onToggleFav: (id: string) => void;
  onToggleBasket: (id: string) => void;
}) {
  const s = marketSim.getState().assets[id];
  if (!s) return null;
  const ch = s.change24h;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(id)}
      className={cn(
        "w-full text-left p-2.5 hover:bg-secondary/60 transition-colors cursor-pointer",
        selected && "bg-amber-hud/20"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFav(id); }}
            aria-label={`Favorito ${id}`}
            className="flex-shrink-0"
          >
            <Star className={cn("w-3 h-3", fav ? "text-amber fill-amber" : "text-muted-foreground/40 hover:text-amber")} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleBasket(id); }}
            aria-label={`Cesta ${id}`}
            title="Añadir/quitar de la cesta"
            className="flex-shrink-0"
          >
            {inBasket
              ? <Check className="w-3.5 h-3.5 text-green-hud" />
              : <Plus className="w-3 h-3 text-muted-foreground/40 hover:text-green-hud" />}
          </button>
          <FlagBadge code={flag} size="md" />
          <div className="min-w-0">
            <div className="text-[11px] font-mono font-bold text-foreground">{id}</div>
            <div className="text-[9px] font-mono text-muted-foreground truncate">{name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-mono font-bold text-foreground tabular-nums">{formatPrice(s.price)}</div>
          <div className={cn("text-[10px] font-mono flex items-center justify-end gap-0.5", ch >= 0 ? "text-green-hud" : "text-red-hud")}>
            {ch >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(ch).toFixed(2)}%
          </div>
        </div>
      </div>
      <Sparkline history={s.history.slice(-60)} up={ch >= 0} />
    </div>
  );
});

// =================== grafico profesional (lightweight-charts) ===================
// v9 FIX "no aparecen las barras": toda escritura al chart va en try/catch;
// si un update falla (p.ej. tiempo duplicado tras dormir la pestana) se recarga
// el dataset completo con setData en lugar de romper el render en silencio.
function TradingChart({
  assetId, tf, type, tickKey1,
}: {
  assetId: string;
  tf: TimeframeKey;
  type: "candles" | "line";
  tickKey1: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candleRef = useRef<any>(null);
  const areaRef = useRef<any>(null);
  const volRef = useRef<any>(null);
  const loadedRef = useRef(false);
  const dataCountRef = useRef(0);

  const fullReload = useCallback(() => {
    if (!chartRef.current) return;
    const candles: Candle[] = marketSim.getCandles(assetId, tf);
    const toUtc = (t: number) => t as never;
    const candleData = candles.map((c) => ({ time: toUtc(c.time), open: c.open, high: c.high, low: c.low, close: c.close }));
    const areaData = candles.map((c) => ({ time: toUtc(c.time), value: c.close }));
    const volData = candles.map((c) => ({
      time: toUtc(c.time),
      value: c.volume,
      color: c.close >= c.open ? "rgba(74,222,128,0.35)" : "rgba(239,68,68,0.35)",
    }));
    candleRef.current?.setData(candleData);
    areaRef.current?.setData(areaData);
    volRef.current?.setData(volData);
    candleRef.current?.applyOptions({ visible: type === "candles" });
    areaRef.current?.applyOptions({ visible: type === "line" });
    if (type === "line") {
      const last = candles[candles.length - 1];
      const upTrend = last ? last.close >= (candles[0]?.close ?? last.close) : true;
      areaRef.current?.applyOptions({
        lineColor: upTrend ? UP : DOWN,
        topColor: upTrend ? "rgba(74,222,128,0.22)" : "rgba(239,68,68,0.20)",
        bottomColor: upTrend ? "rgba(74,222,128,0)" : "rgba(239,68,68,0)",
      });
    }
    chartRef.current.timeScale().fitContent();
    loadedRef.current = true;
    dataCountRef.current = candleData.length;
  }, [assetId, tf, type]);

  // crear chart una sola vez
  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: "rgba(0,0,0,0)" },
        textColor: "#8a8f98",
        fontFamily: "ui-monospace, SFMono-Regular, monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: "rgba(217,167,32,0.06)" },
        horzLines: { color: "rgba(217,167,32,0.06)" },
      },
      timeScale: { timeVisible: true, secondsVisible: false, borderColor: "rgba(217,167,32,0.15)" },
      rightPriceScale: { borderColor: "rgba(217,167,32,0.15)" },
      crosshair: {
        mode: 0,
        vertLine: { color: "rgba(217,167,32,0.4)", labelBackgroundColor: "#5a4a10" },
        horzLine: { color: "rgba(217,167,32,0.4)", labelBackgroundColor: "#5a4a10" },
      },
    });
    candleRef.current = chart.addCandlestickSeries({
      upColor: UP,
      downColor: DOWN,
      borderVisible: false,
      wickUpColor: UP,
      wickDownColor: DOWN,
    });
    areaRef.current = chart.addAreaSeries({
      lineColor: UP,
      topColor: "rgba(74,222,128,0.22)",
      bottomColor: "rgba(74,222,128,0)",
      lineWidth: 2,
      priceLineColor: "rgba(217,167,32,0.5)",
    });
    volRef.current = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
      color: "rgba(138,143,152,0.4)",
    });
    chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      areaRef.current = null;
      volRef.current = null;
      loadedRef.current = false;
    };
  }, []);

  // recargar datos al cambiar activo/temporalidad/tipo
  useEffect(() => {
    try {
      fullReload();
    } catch (e) {
      console.warn("[bolsa] recarga de velas falló, reintento", e);
    }
  }, [fullReload]);

  // update en vivo: solo la ultima vela (eficiente) + fallback a recarga total
  useEffect(() => {
    if (!chartRef.current || !loadedRef.current) {
      fullReload();
      return;
    }
    try {
      const candles = marketSim.getCandles(assetId, tf);
      const last = candles[candles.length - 1];
      // v9 FIX "no aparecen las barras": si el chart quedo vacio (el sim aun no
      // tenia datos al montar) recargamos completo en cuanto existan velas.
      if (!last || dataCountRef.current === 0) {
        fullReload();
        return;
      }
      const t = last.time as never;
      candleRef.current?.update({ time: t, open: last.open, high: last.high, low: last.low, close: last.close });
      areaRef.current?.update({ time: t, value: last.close });
      volRef.current?.update({
        time: t,
        value: last.volume,
        color: last.close >= last.open ? "rgba(74,222,128,0.35)" : "rgba(239,68,68,0.35)",
      });
      dataCountRef.current = candles.length;
    } catch {
      // tiempo duplicado/antiguo (pestana dormida, cambio de bucket, resume) -> recarga completa
      try {
        fullReload();
      } catch {
        /* nada mas que hacer */
      }
    }
  }, [tickKey1, assetId, tf, type, fullReload]);

  return (
    <div ref={containerRef} className="w-full h-[280px] sm:h-[340px]" />
  );
}

// =================== mini estadisticas (2s) ===================
const MiniStats = memo(function MiniStats({ assetId, tickKey2 }: { assetId: string; tickKey2: number }) {
  const st = marketSim.getState().assets[assetId];
  return (
    <div className="grid grid-cols-4 gap-2 mt-2">
      <MiniStat label="Máx. 24h" value={st ? formatPrice(st.dayHigh) : "—"} />
      <MiniStat label="Mín. 24h" value={st ? formatPrice(st.dayLow) : "—"} />
      <MiniStat label="Volumen" value={st ? formatVolume(st.volume) : "—"} />
      <MiniStat label="Ticks" value={String(marketSim.getState().tickCount)} />
    </div>
  );
});

// =================== libro de ordenes (1s) ===================
const OrderBook = memo(function OrderBook({ assetId, tickKey1 }: { assetId: string; tickKey1: number }) {
  const price = marketSim.getState().assets[assetId]?.price ?? 0;
  const book = useMemo(() => marketSim.getBook(assetId), [assetId, tickKey1, price]);
  const maxCum = Math.max(
    book.bids[book.bids.length - 1]?.cum ?? 1,
    book.asks[book.asks.length - 1]?.cum ?? 1
  );
  const spreadPct = price > 0 ? (book.spread / price) * 100 : 0;

  const Row = ({ lvl, side }: { lvl: BookLevel; side: "bid" | "ask" }) => (
    <div className="relative flex items-center justify-between px-2 py-[3px] text-[9.5px] font-mono">
      <div
        className={cn("absolute inset-y-0 right-0", side === "bid" ? "bg-green-hud/15" : "bg-red-hud/15")}
        style={{ width: `${Math.min(100, (lvl.cum / maxCum) * 100)}%` }}
      />
      <span className={cn("relative z-10", side === "bid" ? "text-green-hud" : "text-red-hud")}>
        {formatPrice(lvl.price)}
      </span>
      <span className="relative z-10 text-muted-foreground">{lvl.qty}</span>
      <span className="relative z-10 text-muted-foreground/70 w-14 text-right">{formatVolume(lvl.cum)}</span>
    </div>
  );

  return (
    <div className="hud-corner bg-secondary/40">
      <div className="p-2 border-b border-amber-hud/30 flex items-center justify-between">
        <span className="text-[9px] font-mono text-muted-foreground uppercase flex items-center gap-1">
          <ListOrdered className="w-3 h-3" /> Libro de órdenes
        </span>
        <span className="text-[8px] font-mono text-muted-foreground">PRECIO / CANT. / ACUM.</span>
      </div>
      <div className="max-h-[220px] overflow-y-auto thin-scroll">
        <div className="flex flex-col-reverse">
          {book.asks.map((lvl, i) => <Row key={`a-${i}`} lvl={lvl} side="ask" />)}
        </div>
        <div className="flex items-center justify-between px-2 py-1 border-y border-amber-hud/25 bg-amber-hud/5">
          <span className="text-[10px] font-mono font-bold text-amber">{formatPrice(price)}</span>
          <span className="text-[8px] font-mono text-muted-foreground">spread {spreadPct.toFixed(3)}%</span>
        </div>
        {book.bids.map((lvl, i) => <Row key={`b-${i}`} lvl={lvl} side="bid" />)}
      </div>
    </div>
  );
});

// =================== operaciones en vivo (1s) ===================
const LiveTrades = memo(function LiveTrades({ assetId, tickKey1 }: { assetId: string; tickKey1: number }) {
  const feed = marketSim.getState().tradeFeed[assetId] ?? [];
  return (
    <div className="hud-corner bg-secondary/40">
      <div className="p-2 border-b border-amber-hud/30 flex items-center justify-between">
        <span className="text-[9px] font-mono text-muted-foreground uppercase flex items-center gap-1">
          <Clock className="w-3 h-3" /> Operaciones en vivo
        </span>
        <span className="text-[8px] font-mono text-green-hud blink-soft">STREAM</span>
      </div>
      <div className="max-h-[220px] overflow-y-auto thin-scroll divide-y divide-border/20">
        {feed.length === 0 && (
          <div className="p-3 text-[10px] font-mono text-muted-foreground">
            Esperando operaciones de mercado para {assetId}...
          </div>
        )}
        {feed.slice(0, 20).map((t) => (
          <div key={t.id} className="flex items-center justify-between px-2 py-[3px] text-[9.5px] font-mono">
            <span className="text-muted-foreground">{formatClock(t.ts)}</span>
            <span className={t.side === "BUY" ? "text-green-hud" : "text-red-hud"}>{formatPrice(t.price)}</span>
            <span className="text-muted-foreground">{t.qty}</span>
            <span className={cn("text-[8px] px-1 border rounded-sm", t.side === "BUY" ? "border-green-hud/50 text-green-hud" : "border-red-hud/50 text-red-hud")}>
              {t.side === "BUY" ? "COMP" : "VENT"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

// =================== inversion facil (v9): montos en mon + 1 toque ===================
function QuickTrade({
  selId, coins, holding, onBuy, onSell, onLimit,
}: {
  selId: string;
  coins: number;
  holding?: { qty: number; avgCost: number };
  onBuy: (qty: number, price: number) => void;
  onSell: (qty: number, price: number) => void;
  onLimit: (side: "BUY" | "SELL", qty: number, limit: number) => void;
}) {
  const [mode, setMode] = useState<"RAPIDO" | "AVANZADO">("RAPIDO");
  const price = marketSim.getState().assets[selId]?.price ?? 0;
  return (
    <div className="hud-corner p-3 bg-secondary/40">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase flex items-center gap-1">
          <Gauge className="w-3.5 h-3.5 text-green-hud" /> Operar {selId}
        </span>
        <div className="flex gap-1">
          {(["RAPIDO", "AVANZADO"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-1.5 py-0.5 border rounded-sm text-[8px] font-mono font-bold uppercase",
                mode === m ? "border-amber-hud/60 text-amber bg-amber-hud/20" : "border-border/50 text-muted-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      {mode === "RAPIDO" ? (
        <QuickInvest selId={selId} coins={coins} holding={holding} price={price} onBuy={onBuy} onSell={onSell} />
      ) : (
        <AdvancedTrade selId={selId} coins={coins} holding={holding} price={price} onBuy={onBuy} onSell={onSell} onLimit={onLimit} />
      )}
    </div>
  );
}

function QuickInvest({
  selId, coins, holding, price, onBuy, onSell,
}: {
  selId: string;
  coins: number;
  holding?: { qty: number; avgCost: number };
  price: number;
  onBuy: (qty: number, price: number) => void;
  onSell: (qty: number, price: number) => void;
}) {
  const [amount, setAmount] = useState(100);
  const maxSpend = Math.max(0, Math.floor(coins / (1 + FEE)));
  const minFor1 = price > 0 ? Math.ceil(price * (1 + FEE)) : 1;
  const units = price > 0 ? Math.floor(amount / (price * (1 + FEE))) : 0;
  const total = units * price;
  const fee = total * FEE;
  const canBuy = units >= 1 && total + fee <= coins;
  const pl = holding ? (price - holding.avgCost) * holding.qty : 0;
  const plPct = holding && holding.avgCost > 0 ? ((price - holding.avgCost) / holding.avgCost) * 100 : 0;

  const setPctOfBalance = (pct: number) => setAmount(Math.max(minFor1, Math.floor(maxSpend * pct)));

  return (
    <div>
      <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">
        ¿Cuánto quieres invertir? · saldo {coins.toLocaleString("es")} mon · mínimo {minFor1} mon por unidad
      </div>
      <div className="grid grid-cols-5 gap-1 mb-2">
        {[50, 100, 500, 2000, 5000].map((v) => {
          const eff = Math.max(v, minFor1); // siempre alcanza para 1+ unidades
          return (
            <button
              key={v}
              onClick={() => setAmount(eff)}
              className={cn(
                "py-1.5 border rounded-sm text-[10px] font-mono font-bold transition-colors",
                amount === eff ? "border-amber-hud bg-amber-hud/25 text-amber" : "border-border/60 text-muted-foreground hover:text-foreground hover:border-amber-hud/50"
              )}
            >
              {eff >= 1000 ? `${eff / 1000}K` : eff}
            </button>
          );
        })}
      </div>
      <input
        type="range"
        min={10}
        max={Math.max(100, maxSpend)}
        step={10}
        value={Math.min(amount, Math.max(100, maxSpend))}
        onChange={(e) => setAmount(Number(e.target.value))}
        aria-label="Monto a invertir"
        className="w-full accent-amber mb-1"
      />
      <div className="flex gap-1 mb-2">
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <button
            key={p}
            onClick={() => setPctOfBalance(p)}
            className="flex-1 py-1 border border-border/60 rounded-sm text-[9px] font-mono text-muted-foreground hover:text-foreground hover:border-amber-hud/50"
          >
            {p === 1 ? "MAX" : `${p * 100}%`}
          </button>
        ))}
      </div>
      <div className="space-y-0.5 text-[9px] font-mono text-muted-foreground border-t border-border/40 pt-1.5 mb-2">
        <div className="flex justify-between">
          <span>Recibes</span>
          <span className="text-foreground font-bold">{units} u. de {selId}</span>
        </div>
        <div className="flex justify-between"><span>Precio actual</span><span>{formatPrice(price)} mon</span></div>
        <div className="flex justify-between"><span>Comisión (0.5%)</span><span>{formatPrice(fee)} mon</span></div>
        <div className="flex justify-between font-bold">
          <span className="text-foreground">Pagar</span>
          <span className="text-green-hud">{formatPrice(total + fee)} mon</span>
        </div>
      </div>
      <button
        onClick={() => canBuy && onBuy(units, price)}
        disabled={!canBuy}
        className={cn(
          "w-full flex items-center justify-center gap-1.5 py-2.5 border rounded-sm text-xs font-mono font-bold uppercase tracking-wide transition-colors",
          canBuy ? "border-green-hud bg-green-hud/25 text-green-hud hover:bg-green-hud/45" : "border-border/50 text-muted-foreground opacity-50 cursor-not-allowed"
        )}
      >
        <ShoppingCart className="w-4 h-4" /> Comprar {units > 0 ? `${units} u.` : ""} ahora
      </button>
      {holding && holding.qty > 0 && (
        <button
          onClick={() => onSell(holding.qty, price)}
          className="w-full mt-1.5 flex items-center justify-center gap-1.5 py-2 border border-red-hud bg-red-hud/15 text-red-hud rounded-sm text-[11px] font-mono font-bold uppercase hover:bg-red-hud/35 transition-colors"
        >
          <TrendingDown className="w-4 h-4" /> Vender todo ({holding.qty} u.)
          <span className={cn("ml-1", pl >= 0 ? "text-green-hud" : "text-red-hud")}>
            P/L {pl >= 0 ? "+" : ""}{Math.round(pl)} ({plPct >= 0 ? "+" : ""}{plPct.toFixed(1)}%)
          </span>
        </button>
      )}
    </div>
  );
}

// =================== trade avanzado (mercado/limite) ===================
function AdvancedTrade({
  selId, coins, holding, price, onBuy, onSell, onLimit,
}: {
  selId: string;
  coins: number;
  holding?: { qty: number; avgCost: number };
  price: number;
  onBuy: (qty: number, price: number) => void;
  onSell: (qty: number, price: number) => void;
  onLimit: (side: "BUY" | "SELL", qty: number, limit: number) => void;
}) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [mode, setMode] = useState<"MARKET" | "LIMIT">("MARKET");
  const [qty, setQty] = useState("10");
  const [limit, setLimit] = useState("");

  const effPrice = mode === "LIMIT" ? Math.max(0.01, Number(limit) || 0) : price;
  const qtyNum = Math.max(0, Math.floor(Number(qty) || 0));
  const gross = qtyNum * effPrice;
  const fee = gross * FEE;
  const totalWithFee = gross + fee;
  const netAfterFee = gross - fee;

  const canBuy = side === "BUY" && qtyNum > 0 && (mode === "MARKET" ? coins >= totalWithFee : coins >= Math.round(qtyNum * effPrice * (1 + FEE)));
  const canSell = side === "SELL" && qtyNum > 0 && !!holding && holding.qty >= qtyNum;
  const canSubmit = mode === "MARKET" ? (side === "BUY" ? canBuy : canSell) : qtyNum > 0 && effPrice > 0 && (side === "BUY" ? canBuy : canSell);

  const setPct = (pct: number) => {
    if (side === "BUY") {
      setQty(String(Math.max(1, Math.floor((coins * pct) / Math.max(0.01, effPrice * (1 + FEE))))));
    } else if (holding && holding.qty > 0) {
      setQty(String(Math.max(1, Math.floor(holding.qty * pct))));
    }
  };

  const submit = () => {
    if (!canSubmit) return;
    if (mode === "MARKET") {
      if (side === "BUY") onBuy(qtyNum, price);
      else onSell(qtyNum, price);
    } else {
      onLimit(side, qtyNum, effPrice);
    }
  };

  const estPnl = holding && side === "SELL" ? (effPrice - holding.avgCost) * qtyNum - fee : 0;

  return (
    <div>
      <div className="grid grid-cols-2 gap-1 mb-2">
        <button
          onClick={() => setSide("BUY")}
          className={cn(
            "py-1.5 border rounded-sm text-[10px] font-mono font-bold uppercase",
            side === "BUY" ? "border-green-hud bg-green-hud/25 text-green-hud" : "border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          Comprar
        </button>
        <button
          onClick={() => setSide("SELL")}
          className={cn(
            "py-1.5 border rounded-sm text-[10px] font-mono font-bold uppercase",
            side === "SELL" ? "border-red-hud bg-red-hud/25 text-red-hud" : "border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          Vender
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1 mb-2">
        <button
          onClick={() => setMode("MARKET")}
          className={cn(
            "py-1 border rounded-sm text-[9px] font-mono uppercase",
            mode === "MARKET" ? "border-amber-hud/60 text-amber bg-amber-hud/15" : "border-border/50 text-muted-foreground"
          )}
        >
          Mercado
        </button>
        <button
          onClick={() => { setMode("LIMIT"); if (!limit) setLimit(price.toFixed(2)); }}
          className={cn(
            "py-1 border rounded-sm text-[9px] font-mono uppercase",
            mode === "LIMIT" ? "border-amber-hud/60 text-amber bg-amber-hud/15" : "border-border/50 text-muted-foreground"
          )}
        >
          Límite
        </button>
      </div>
      {mode === "LIMIT" && (
        <div className="mb-2">
          <label className="text-[8px] font-mono text-muted-foreground uppercase">Precio límite</label>
          <input
            value={limit}
            onChange={(e) => setLimit(e.target.value.replace(/[^0-9.]/g, ""))}
            inputMode="decimal"
            aria-label="Precio limite"
            className="w-full px-2 py-1.5 bg-background border border-amber-hud/50 rounded-sm text-xs font-mono text-foreground focus:outline-none focus:border-amber-hud"
            placeholder="0.00"
          />
        </div>
      )}
      <div className="mb-1">
        <label className="text-[8px] font-mono text-muted-foreground uppercase">
          Cantidad (u.) {side === "SELL" && holding ? `· disponibles ${holding.qty}` : ""}
        </label>
        <input
          value={qty}
          onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          aria-label="Cantidad"
          className="w-full px-2 py-1.5 bg-background border border-amber-hud/50 rounded-sm text-xs font-mono text-foreground focus:outline-none focus:border-amber-hud"
          placeholder="0"
        />
      </div>
      <div className="flex gap-1 mb-2">
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <button
            key={p}
            onClick={() => setPct(p)}
            className="flex-1 py-1 border border-border/60 rounded-sm text-[9px] font-mono text-muted-foreground hover:text-foreground hover:border-amber-hud/50"
          >
            {p === 1 ? "MAX" : `${p * 100}%`}
          </button>
        ))}
      </div>
      <div className="space-y-0.5 text-[9px] font-mono text-muted-foreground border-t border-border/40 pt-1.5">
        <div className="flex justify-between"><span>Total</span><span>{formatPrice(gross)} mon</span></div>
        <div className="flex justify-between"><span>Comisión (0.5%)</span><span>{formatPrice(fee)} mon</span></div>
        <div className="flex justify-between font-bold">
          <span className="text-foreground">{side === "BUY" ? "Pagar" : "Recibir"}</span>
          <span className={side === "BUY" ? "text-green-hud" : "text-amber"}>{formatPrice(side === "BUY" ? totalWithFee : netAfterFee)} mon</span>
        </div>
        {side === "SELL" && holding && (
          <div className="flex justify-between"><span>P/L estimado</span><span className={estPnl >= 0 ? "text-green-hud" : "text-red-hud"}>{estPnl >= 0 ? "+" : ""}{Math.round(estPnl)}</span></div>
        )}
      </div>
      <button
        onClick={submit}
        disabled={!canSubmit}
        className={cn(
          "w-full mt-2 flex items-center justify-center gap-1.5 py-2 border rounded-sm text-xs font-mono font-bold uppercase tracking-wide transition-colors",
          canSubmit
            ? side === "BUY"
              ? "border-green-hud bg-green-hud/20 text-green-hud hover:bg-green-hud/40"
              : "border-red-hud bg-red-hud/20 text-red-hud hover:bg-red-hud/40"
            : "border-border/50 text-muted-foreground opacity-50 cursor-not-allowed"
        )}
      >
        {side === "BUY" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {mode === "LIMIT" ? `Límite ${side === "BUY" ? "compra" : "venta"}` : side === "BUY" ? "Comprar mercado" : "Vender mercado"}
      </button>
      {mode === "LIMIT" && (
        <p className="mt-1 text-[8px] font-mono text-muted-foreground">
          Se ejecuta sola cuando el precio cruce tu límite (con la bolsa abierta).
        </p>
      )}
    </div>
  );
}

// =================== CESTA multi-pais (v9): elegir varios paises e invertir 1 toque ===================
function BasketPanel({
  basket, onRemove, onClear, onSet, favorites, coins, buyAsset,
}: {
  basket: string[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onSet: (ids: string[]) => void;
  favorites: string[];
  coins: number;
  buyAsset: (assetId: string, qty: number, price: number, fee?: number) => boolean;
}) {
  const [amount, setAmount] = useState("500");
  const [investing, setInvesting] = useState(false);

  const amt = Math.max(0, Math.floor(Number(amount) || 0));
  const per = basket.length > 0 ? Math.floor(amt / basket.length) : 0;

  const preview = useMemo(() => {
    const st = marketSim.getState();
    return basket.map((id) => {
      const price = st.assets[id]?.price ?? 0;
      const qty = price > 0 ? Math.max(1, Math.floor(per / (price * (1 + FEE)))) : 0;
      const cost = qty * price * (1 + FEE);
      const a = ASSETS.find((x) => x.id === id)!;
      return { id, name: a.name, flag: a.flag, price, qty, cost, ch: st.assets[id]?.change24h ?? 0 };
    });
    // tickKey suave: recalcula cuando cambia la cesta o el monto (precios vivos al invertir)
     
  }, [basket, per]);

  const totalCost = preview.reduce((acc, p) => acc + p.cost, 0);

  const invest = () => {
    if (basket.length === 0 || amt < basket.length) {
      toast.error("El monto no alcanza para repartir entre todos");
      return;
    }
    setInvesting(true);
    let bought = 0;
    let spent = 0;
    for (const p of preview) {
      if (p.qty < 1) continue;
      const livePrice = marketSim.getState().assets[p.id]?.price;
      if (!livePrice) continue;
      const qty = Math.max(1, Math.floor(per / (livePrice * (1 + FEE))));
      const fee = qty * livePrice * FEE;
      const ok = buyAsset(p.id, qty, livePrice, fee);
      if (ok) {
        bought += 1;
        spent += qty * livePrice + fee;
      }
    }
    setInvesting(false);
    if (bought > 0) {
      toast.success(`CESTA INVERTIDA: ${spent.toFixed(0)} mon en ${bought} países`);
    } else {
      toast.error("Saldo insuficiente para la cesta");
    }
  };

  const preset = (kind: "POT" | "EME" | "FRO" | "FAV") => {
    let ids: string[] = [];
    if (kind === "POT") ids = ASSETS.filter((a) => a.sector === "POTENCIA").sort((a, b) => b.mcap - a.mcap).slice(0, 4).map((a) => a.id);
    if (kind === "EME") ids = ASSETS.filter((a) => a.sector === "EMERGENTE").sort((a, b) => b.mcap - a.mcap).slice(0, 5).map((a) => a.id);
    if (kind === "FRO") ids = ASSETS.filter((a) => a.sector === "FRONTERA").sort((a, b) => b.mcap - a.mcap).slice(0, 5).map((a) => a.id);
    if (kind === "FAV") ids = favorites.slice(0, 6);
    onSet(ids);
  };

  return (
    <div className="hud-corner bg-secondary/40">
      <div className="p-2.5 border-b border-amber-hud/30 flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
          <Scale className="w-3.5 h-3.5 text-cyan-hud" /> Cesta multi-país ({basket.length}/6)
        </span>
        {basket.length > 0 && (
          <button onClick={onClear} className="text-[8px] font-mono text-muted-foreground hover:text-red-hud uppercase">
            Vaciar
          </button>
        )}
      </div>
      <div className="p-2 border-b border-border/30">
        <div className="flex gap-1 flex-wrap mb-1.5">
          {(["POT", "EME", "FRO", "FAV"] as const).map((k) => (
            <button
              key={k}
              onClick={() => preset(k)}
              className="px-1.5 py-0.5 border border-border/60 rounded-sm text-[8px] font-mono uppercase text-muted-foreground hover:text-amber hover:border-amber-hud/50"
            >
              {k === "POT" ? "Top potencias" : k === "EME" ? "Emergentes" : k === "FRO" ? "Frontera" : "★ Favoritas"}
            </button>
          ))}
        </div>
        {basket.length === 0 ? (
          <div className="text-[9px] font-mono text-muted-foreground leading-snug">
            Toca el <Plus className="w-3 h-3 inline -mt-0.5" /> de cualquier país de la lista (o de la cabecera del par) para armar tu cesta e invertir en varios países de una vez.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {basket.map((id, i) => {
              const a = ASSETS.find((x) => x.id === id)!;
              return (
                <span key={id} className="flex items-center gap-1 pl-1 pr-0.5 py-0.5 border rounded-sm text-[9px] font-mono" style={{ borderColor: LINE_COLORS[i % LINE_COLORS.length] + "66" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} />
                  <FlagBadge code={a.flag} size="sm" />
                  <span className="text-foreground font-bold">{id}</span>
                  <button onClick={() => onRemove(id)} aria-label={`Quitar ${id}`} className="text-muted-foreground hover:text-red-hud px-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
      {basket.length > 0 && (
        <>
          <BasketCompare basket={basket} tickKey2={Math.floor(marketSim.getState().tickCount / 2)} />
          <div className="p-2 border-t border-border/30">
            <div className="flex gap-1 items-center mb-1.5">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                aria-label="Monto total de la cesta"
                className="flex-1 px-2 py-1.5 bg-background border border-amber-hud/50 rounded-sm text-xs font-mono text-foreground focus:outline-none focus:border-amber-hud"
                placeholder="Monto total en mon"
              />
              <span className="text-[9px] font-mono text-muted-foreground">÷{basket.length}</span>
            </div>
            <div className="max-h-28 overflow-y-auto thin-scroll divide-y divide-border/20 mb-1.5">
              {preview.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-1 text-[9px] font-mono">
                  <span className="text-foreground font-bold">{p.id}</span>
                  <span className="text-muted-foreground">{p.qty} u. @ {formatPrice(p.price)}</span>
                  <span className={p.ch >= 0 ? "text-green-hud" : "text-red-hud"}>{p.ch >= 0 ? "+" : ""}{p.ch.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] font-mono mb-1.5">
              <span className="text-muted-foreground">Coste total (c/fee)</span>
              <span className={cn("font-bold", totalCost <= coins ? "text-amber" : "text-red-hud")}>{formatPrice(totalCost)} mon</span>
            </div>
            <button
              onClick={invest}
              disabled={investing || totalCost > coins}
              className={cn(
                "w-full flex items-center justify-center gap-1.5 py-2 border rounded-sm text-[11px] font-mono font-bold uppercase transition-colors",
                totalCost <= coins && !investing
                  ? "border-green-hud bg-green-hud/25 text-green-hud hover:bg-green-hud/45"
                  : "border-border/50 text-muted-foreground opacity-50 cursor-not-allowed"
              )}
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Invertir en {basket.length} países
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// =================== comparador de cesta: lineas normalizadas % ===================
const BasketCompare = memo(function BasketCompare({ basket, tickKey2 }: { basket: string[]; tickKey2: number }) {
  const series = useMemo(() => {
    const st = marketSim.getState();
    return basket.map((id, i) => {
      const hist = (st.assets[id]?.history ?? []).slice(-60);
      if (hist.length < 2) return { id, i, pts: "", ch: st.assets[id]?.change24h ?? 0 };
      const base = hist[0];
      const vals = hist.map((v) => (v / base - 1) * 100);
      const min = Math.min(...vals, 0);
      const max = Math.max(...vals, 0);
      const range = max - min || 1;
      const step = 100 / (vals.length - 1);
      const pts = vals.map((v, j) => `${j === 0 ? "M" : "L"} ${(j * step).toFixed(1)} ${(38 - ((v - min) / range) * 34).toFixed(1)}`).join(" ");
      return { id, i, pts, ch: st.assets[id]?.change24h ?? 0 };
    });
     
  }, [basket, tickKey2]);

  if (basket.length === 0) return null;
  return (
    <div className="px-2 py-2 border-t border-border/30">
      <div className="text-[8px] font-mono text-muted-foreground uppercase mb-1">Comparativa sesión (%)</div>
      <svg viewBox="0 0 100 40" className="w-full h-16" preserveAspectRatio="none">
        <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(217,167,32,0.25)" strokeWidth="0.4" strokeDasharray="2 2" />
        {series.map((s) => (
          <path key={s.id} d={s.pts} fill="none" stroke={LINE_COLORS[s.i % LINE_COLORS.length]} strokeWidth="1.4" opacity="0.9" />
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
        {series.map((s) => (
          <span key={s.id} className="text-[8px] font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: LINE_COLORS[s.i % LINE_COLORS.length] }} />
            <span className="text-muted-foreground">{s.id}</span>
            <span className={s.ch >= 0 ? "text-green-hud" : "text-red-hud"}>{s.ch >= 0 ? "+" : ""}{s.ch.toFixed(1)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
});

// =================== ordenes pendientes (1s) ===================
const PendingOrders = memo(function PendingOrders({
  orders, tickKey1, onCancel,
}: {
  orders: { id: string; assetId: string; side: "BUY" | "SELL"; qty: number; limitPrice: number }[];
  tickKey1: number;
  onCancel: (id: string) => void;
}) {
  if (orders.length === 0) return null;
  const market = marketSim.getState();
  return (
    <div className="hud-corner bg-secondary/40">
      <div className="p-2 border-b border-amber-hud/30 flex items-center justify-between">
        <span className="text-[9px] font-mono text-muted-foreground uppercase">Órdenes límite ({orders.length})</span>
        <span className="text-[8px] font-mono text-amber blink-soft">ARMADAS</span>
      </div>
      <div className="max-h-40 overflow-y-auto thin-scroll divide-y divide-border/30">
        {orders.map((o) => {
          const p = market.assets[o.assetId]?.price ?? 0;
          const dist = p > 0 ? ((o.limitPrice - p) / p) * 100 : 0;
          return (
            <div key={o.id} className="flex items-center justify-between p-2 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className={cn("px-1 py-0.5 border rounded-sm text-[8px] font-bold", o.side === "BUY" ? "border-green-hud text-green-hud" : "border-red-hud text-red-hud")}>
                  {o.side === "BUY" ? "COMPRA" : "VENTA"}
                </span>
                <span className="text-foreground font-bold">{o.assetId}</span>
                <span className="text-muted-foreground">x{o.qty} @ {formatPrice(o.limitPrice)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{dist >= 0 ? "+" : ""}{dist.toFixed(1)}%</span>
                <button onClick={() => onCancel(o.id)} aria-label="Cancelar orden" className="text-muted-foreground hover:text-red-hud">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// =================== portafolio (2s) ===================
const Portfolio = memo(function Portfolio({
  holdings, portfolioValue, unrealized, realized, feesPaid, onSelect, onSellAll,
}: {
  holdings: Record<string, { qty: number; avgCost: number }>;
  portfolioValue: number;
  unrealized: number;
  realized: number;
  feesPaid: number;
  onSelect: (id: string) => void;
  onSellAll: (id: string) => void;
}) {
  const market = marketSim.getState();
  const invested = Object.values(holdings).reduce((acc, h) => acc + h.avgCost * h.qty, 0);
  const roiPct = invested > 0 ? (unrealized / invested) * 100 : 0;
  return (
    <div className="hud-corner bg-secondary/40">
      <div className="p-2.5 border-b border-amber-hud/30 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-muted-foreground uppercase">Portafolio</span>
        {invested > 0 && (
          <span className={cn(
            "text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded-sm",
            roiPct >= 0 ? "border-green-hud text-green-hud" : "border-red-hud text-red-hud"
          )}>
            ROI {roiPct >= 0 ? "+" : ""}{roiPct.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="p-3 border-b border-border/30">
        <div className="text-[9px] font-mono text-muted-foreground uppercase">Valor posiciones</div>
        <div className="text-xl font-mono font-bold text-amber">{formatPrice(portfolioValue)} <span className="text-[10px] text-muted-foreground">mon</span></div>
        <div className={cn("text-[10px] font-mono", unrealized >= 0 ? "text-green-hud" : "text-red-hud")}>
          No realizado: {unrealized >= 0 ? "+" : ""}{Math.round(unrealized)} · Realizado: {realized >= 0 ? "+" : ""}{Math.round(realized)}
        </div>
        <div className="text-[9px] font-mono text-muted-foreground">Invertido: {formatPrice(invested)} mon · Comisiones: {Math.round(feesPaid)} mon</div>
      </div>
      <div className="max-h-40 overflow-y-auto thin-scroll divide-y divide-border/30">
        {Object.keys(holdings).length === 0 && (
          <div className="p-3 text-[10px] font-mono text-muted-foreground">
            Sin posiciones. Compra tu primer país para empezar.
          </div>
        )}
        {Object.entries(holdings).map(([id, h]) => {
          const a = ASSETS.find((x) => x.id === id);
          const p = market.assets[id]?.price ?? 0;
          const pl = (p - h.avgCost) * h.qty;
          const plPct = h.avgCost > 0 ? ((p - h.avgCost) / h.avgCost) * 100 : 0;
          return (
            <div key={id} className="p-2 hover:bg-secondary/60">
              <button onClick={() => onSelect(id)} className="w-full text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-foreground flex items-center gap-1">
                    {a && <FlagBadge code={a.flag} size="sm" />} {a?.id ?? id}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{h.qty} u.</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-muted-foreground">coste {formatPrice(h.avgCost)}</span>
                  <span className={cn("text-[10px] font-mono font-bold", pl >= 0 ? "text-green-hud" : "text-red-hud")}>
                    {pl >= 0 ? "+" : ""}{Math.round(pl)} ({plPct >= 0 ? "+" : ""}{plPct.toFixed(1)}%)
                  </span>
                </div>
              </button>
              <button
                onClick={() => onSellAll(id)}
                className="mt-1 w-full py-1 border border-red-hud/60 text-red-hud text-[9px] font-mono uppercase tracking-wider hover:bg-red-hud/20 rounded-sm transition-colors"
              >
                Vender todo ({Math.round(h.qty * p)} mon)
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// =================== eventos de mercado (3s) ===================
const EventsFeed = memo(function EventsFeed({ tickKey3 }: { tickKey3: number }) {
  const events = marketSim.getState().events;
  return (
    <div className="hud-corner bg-secondary/40">
      <div className="p-2.5 border-b border-amber-hud/30 flex items-center gap-1.5">
        <Newspaper className="w-3.5 h-3.5 text-amber" />
        <span className="text-[10px] font-mono text-muted-foreground uppercase">Eventos de mercado</span>
      </div>
      <div className="max-h-56 overflow-y-auto thin-scroll divide-y divide-border/30">
        {events.length === 0 && (
          <div className="p-3 text-[10px] font-mono text-muted-foreground">
            Sin eventos todavía. Los mercados reaccionan cada ~40-70s a noticias globales.
          </div>
        )}
        {events.slice(0, 10).map((ev) => (
          <div key={ev.id} className="p-2">
            <div className="flex items-start gap-1.5">
              <Zap className={cn("w-3 h-3 mt-0.5 flex-shrink-0", ev.severity >= 3 ? "text-red-hud" : ev.severity === 2 ? "text-amber" : "text-cyan-hud")} />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono text-foreground leading-snug">{ev.headline}</div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {ev.impact.map((id) => (
                    <span key={id} className="text-[8px] font-mono px-1 border border-border/50 rounded-sm text-muted-foreground">{id}</span>
                  ))}
                  <span className="text-[8px] font-mono text-muted-foreground/60 ml-auto">{formatClock(ev.ts)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// =================== historial propio ===================
function MyTrades({ trades }: { trades: { id: string; ts: number; assetId: string; side: "BUY" | "SELL"; qty: number; total: number; pnl?: number }[] }) {
  return (
    <div className="hud-corner bg-secondary/40">
      <div className="p-2.5 border-b border-amber-hud/30 flex items-center gap-1.5">
        <CircleDollarSign className="w-3.5 h-3.5 text-amber" />
        <span className="text-[10px] font-mono text-muted-foreground uppercase">Tus operaciones</span>
      </div>
      <div className="max-h-56 overflow-y-auto thin-scroll divide-y divide-border/30">
        {trades.length === 0 && (
          <div className="p-3 text-[10px] font-mono text-muted-foreground">Sin operaciones registradas.</div>
        )}
        {trades.slice(0, 14).map((t, i) => (
          <div key={`${t.id}-${i}`} className="flex items-center justify-between p-2 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "px-1 py-0.5 border rounded-sm text-[8px] font-bold",
                t.side === "BUY" ? "border-green-hud text-green-hud" : "border-red-hud text-red-hud"
              )}>
                {t.side === "BUY" ? "COMPRA" : "VENTA"}
              </span>
              <span className="text-foreground font-bold">{t.assetId}</span>
              <span className="text-muted-foreground">x{t.qty}</span>
              <span className="text-muted-foreground/60">{formatClock(t.ts)}</span>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground">{t.total} mon</div>
              {t.pnl !== undefined && (
                <span className={t.pnl >= 0 ? "text-green-hud" : "text-red-hud"}>
                  P/L {t.pnl >= 0 ? "+" : ""}{t.pnl}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =================== helpers visuales ===================
function Sparkline({ history, up }: { history: number[]; up: boolean }) {
  const pts = history;
  if (pts.length < 2) return <div className="h-4 mt-1" />;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  const step = 100 / (pts.length - 1);
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(16 - ((v - min) / range) * 14).toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 100 18" className="w-full h-4 mt-1" preserveAspectRatio="none">
      <path d={d} fill="none" stroke={up ? "#4ade80" : "#ef4444"} strokeWidth="1.4" opacity="0.8" />
    </svg>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="hud-corner p-1.5 bg-background/60">
      <div className="text-[8px] font-mono text-muted-foreground uppercase truncate">{label}</div>
      <div className="text-[11px] font-mono font-bold text-foreground">{value}</div>
    </div>
  );
}
