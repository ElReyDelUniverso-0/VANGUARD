"use client";

// VANGUARD v27 — BOLSA DE MONEDAS COMUNITARIAS
// Cada jugador puede CREAR SU PROPIA MONEDA (ticker, nombre, símbolo, país,
// supply) y el mercado la cotiza en monedas Vanguard. El precio se mueve con
// las operaciones reales de los jugadores: comprar sube, vender baja.
// Crear una moneda cuesta 100 monedas Vanguard (sumidero de economía).

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Coins, TrendingUp, TrendingDown, Plus, Loader2, Wallet, ArrowUpRight, ArrowDownRight, BadgeDollarSign,
} from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Countryball } from "@/components/vanguard/countryball";
import { WORLD_FLAGS, countryName } from "@/lib/world-data";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/components/vanguard/creador-parts";

interface Currency {
  id: string; code: string; name: string; symbol: string; country: string; creator: string;
  description: string; supply: number; price: number; basePrice: number;
  volume: number; trades: number; holders: number; createdAt: string;
}
interface RecentTrade { id: string; code: string; user: string; side: string; amount: number; price: number; createdAt: string }
interface Position { user: string; code: string; amount: number }

const SYMBOLS = ["🪙", "💰", "🥇", "⚙️", "🔥", "⚔️", "🌟", "🛢️", "💎", "🚩"];

export function BolsaPanel() {
  const alias = useGameStore((s) => s.alias);
  const addCoins = useGameStore((s) => s.addCoins);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [recent, setRecent] = useState<RecentTrade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [createCost, setCreateCost] = useState(100);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [amount, setAmount] = useState(10);
  // crear moneda
  const [nc, setNc] = useState({ code: "", name: "", symbol: "🪙", country: "", description: "", supply: "1000000" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/currencies", { cache: "no-store" });
      const data = await res.json();
      setCurrencies(data.currencies ?? []);
      setRecent(data.recent ?? []);
      setPositions(data.positions ?? []);
      setCreateCost(data.createCost ?? 100);
    } catch {
      toast.error("Sin conexión con la bolsa");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createCurrency = async () => {
    if (busy) return;
    if (!spendCoins(createCost, `Fundar moneda ${nc.code.toUpperCase()}`)) {
      toast.error(`Necesitas ${createCost} monedas para fundar una moneda`);
      sfx.error();
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", creator: alias || "ANÓNIMO", ...nc }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "La bolsa rechazó el registro");
        sfx.error();
        addCoins(createCost, "Devolución — ticker ocupado");
        return;
      }
      sfx.reward();
      toast.success(`¡${data.currency.name} (${data.currency.code}) listada en la bolsa!`, { description: `Emitidas ${data.currency.supply.toLocaleString()} unidades a ⓥ10` });
      setNc({ code: "", name: "", symbol: "🪙", country: "", description: "", supply: "1000000" });
      void load();
    } catch {
      toast.error("Sin conexión");
    } finally {
      setBusy(false);
    }
  };

  const trade = async (code: string, side: "BUY" | "SELL") => {
    if (busy || amount <= 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trade", user: alias || "ANÓNIMO", code, side, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Operación rechazada");
        sfx.error();
        return;
      }
      if (side === "BUY") {
        if (!spendCoins(data.cost, `Comprar ${amount} ${code}`)) {
          toast.error(`Necesitas ⓥ${data.cost} — no te alcanza`);
          sfx.error();
          return;
        }
      } else {
        addCoins(data.cost, `Vender ${amount} ${code}`);
      }
      sfx.reward();
      toast.success(
        side === "BUY" ? `Compraste ${amount} ${code} por ⓥ${data.cost}` : `Vendiste ${amount} ${code} por ⓥ${data.cost}`,
        { description: `Nuevo precio: ⓥ${data.newPrice.toFixed(2)} (${side === "BUY" ? "subió" : "bajó"} por tu operación)` }
      );
      void load();
    } catch {
      toast.error("Sin conexión");
    } finally {
      setBusy(false);
    }
  };

  const myPositions = positions.filter((p) => p.user === (alias || "ANÓNIMO"));
  const sel = currencies.find((c) => c.code === selected);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="BOLSA DE MONEDAS"
        subtitle="Crea tu propia moneda, cítala en monedas Vanguard y specula con las monedas de la comunidad — el precio lo mueven las operaciones reales"
        icon={<Coins className="w-5 h-5" />}
        color="amber"
      />

      <div className="grid lg:grid-cols-[360px_1fr] gap-4">
        {/* crear moneda + portafolio */}
        <div className="space-y-3">
          <div className="hud-panel p-3 border-amber-hud/40 space-y-2">
            <h3 className="text-[11px] font-mono uppercase text-amber flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Funda tu propia moneda
            </h3>
            <p className="text-[10px] text-muted-foreground leading-snug">
              Coste de emisión: <b className="text-amber">ⓥ{createCost}</b>. Eliges ticker, nombre y supply; la bolsa la
              cotiza a ⓥ10 y el mercado la mueve.
            </p>
            <div className="grid grid-cols-[100px_1fr] gap-1.5">
              <input value={nc.code} onChange={(e) => setNc({ ...nc, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })}
                maxLength={6} placeholder="TICKER"
                className="bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px] font-mono uppercase" />
              <input value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })}
                maxLength={40} placeholder="Nombre (Rublo Rojo…)"
                className="bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px]" />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[9px] font-mono uppercase text-muted-foreground">Símbolo:</span>
              {SYMBOLS.map((s) => (
                <button key={s} onClick={() => setNc({ ...nc, symbol: s })}
                  className={cn("w-7 h-7 text-sm border rounded-sm", nc.symbol === s ? "border-amber-hud bg-amber-hud/20" : "border-amber-hud/25")}>
                  {s}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <label>
                <span className="text-[9px] font-mono uppercase text-muted-foreground">Supply</span>
                <select value={nc.supply} onChange={(e) => setNc({ ...nc, supply: e.target.value })}
                  className="w-full bg-secondary border border-amber-hud/30 rounded-sm px-1 py-1.5 text-[10px]">
                  <option value="100000">100,000</option>
                  <option value="1000000">1,000,000</option>
                  <option value="10000000">10,000,000</option>
                  <option value="100000000">100,000,000</option>
                </select>
              </label>
              <label>
                <span className="text-[9px] font-mono uppercase text-muted-foreground">País</span>
                <select value={nc.country} onChange={(e) => setNc({ ...nc, country: e.target.value })}
                  className="w-full bg-secondary border border-amber-hud/30 rounded-sm px-1 py-1.5 text-[10px]">
                  <option value="">🌍 Mundo</option>
                  {WORLD_FLAGS.map((f) => (
                    <option key={f.code} value={f.code}>{f.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <input value={nc.description} onChange={(e) => setNc({ ...nc, description: e.target.value })}
              maxLength={120} placeholder="Descripción (respaldo, ideología, chiste…)"
              className="w-full bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px]" />
            <button onClick={() => void createCurrency()}
              disabled={busy || nc.code.length < 2 || nc.name.trim().length < 2}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-hud/40 border border-amber-hud text-amber rounded-sm text-[11px] font-mono uppercase font-bold hover:bg-amber-hud/70 disabled:opacity-40 transition-colors">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BadgeDollarSign className="w-3.5 h-3.5" />}
              Fundar moneda (ⓥ{createCost})
            </button>
          </div>

          {/* portafolio */}
          <div className="hud-panel p-3 border-cyan-hud/40 space-y-1.5">
            <h3 className="text-[11px] font-mono uppercase text-cyan-hud flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" /> Mi portafolio
            </h3>
            {myPositions.length === 0 && <p className="text-[10px] text-muted-foreground">Sin posiciones — compra en el mercado.</p>}
            {myPositions.map((p) => {
              const cur = currencies.find((c) => c.code === p.code);
              const value = cur ? Math.round(cur.price * p.amount) : 0;
              return (
                <div key={p.code} className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="w-12 font-bold">{cur?.symbol} {p.code}</span>
                  <span className="flex-1 text-muted-foreground">{p.amount} u.</span>
                  <span className="text-amber">≈ ⓥ{value}</span>
                </div>
              );
            })}
          </div>

          {/* últimas operaciones */}
          <div className="hud-panel p-3 border-violet-hud/40 space-y-1">
            <h3 className="text-[11px] font-mono uppercase text-violet-hud">Tape — últimas operaciones</h3>
            {recent.length === 0 && <p className="text-[10px] text-muted-foreground">Sin operaciones aún.</p>}
            {recent.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center gap-1.5 text-[9px] font-mono">
                {t.side === "BUY" ? <ArrowUpRight className="w-3 h-3 text-green-hud" /> : <ArrowDownRight className="w-3 h-3 text-red-hud" />}
                <span className="text-foreground">@{t.user}</span>
                <span className={t.side === "BUY" ? "text-green-hud" : "text-red-hud"}>{t.side === "BUY" ? "compró" : "vendió"}</span>
                <span>{t.amount} {t.code}</span>
                <span className="text-muted-foreground">a ⓥ{t.price.toFixed(2)} · {timeAgo(t.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* mercado */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-mono uppercase text-cyan-hud flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Mercado ({currencies.length} monedas listadas)
            </h3>
            <button onClick={() => void load()} className="text-[9px] font-mono uppercase text-muted-foreground hover:text-amber">actualizar</button>
          </div>
          {loading && <div className="text-[10px] font-mono text-muted-foreground">cargando cotizaciones…</div>}
          {!loading && currencies.length === 0 && (
            <div className="hud-panel p-4 text-center text-[11px] text-muted-foreground">
              La bolsa está vacía — sé el banco central de la comunidad y funda la primera moneda.
            </div>
          )}
          <div className="space-y-1.5">
            {currencies.map((c) => {
              const delta = ((c.price - c.basePrice) / c.basePrice) * 100;
              const up = delta >= 0;
              const myPos = myPositions.find((p) => p.code === c.code)?.amount ?? 0;
              return (
                <div key={c.id} className={cn("hud-panel p-2.5 border transition-colors", selected === c.code ? "border-amber-hud" : "border-amber-hud/30")}>
                  <div className="flex items-center gap-2 flex-wrap cursor-pointer" onClick={() => setSelected(selected === c.code ? "" : c.code)}>
                    <span className="text-lg leading-none">{c.symbol}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-foreground">{c.code}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{c.name}</span>
                        {c.country && <Countryball code={c.country} size={14} />}
                      </div>
                      <div className="text-[9px] font-mono text-muted-foreground">
                        por @{c.creator} · {c.holders} tenedores · {c.trades} operaciones · vol {c.volume.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-mono font-bold text-amber">ⓥ{c.price.toFixed(2)}</div>
                      <div className={cn("text-[9px] font-mono flex items-center gap-0.5 justify-end", up ? "text-green-hud" : "text-red-hud")}>
                        {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                        {up ? "+" : ""}{delta.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  {c.description && <div className="text-[9px] text-muted-foreground mt-1 truncate">{c.description}</div>}
                  {myPos > 0 && <div className="text-[9px] font-mono text-cyan-hud mt-0.5">tienes {myPos} {c.code}</div>}
                  {selected === c.code && (
                    <div className="mt-2 pt-2 border-t border-amber-hud/20 flex items-center gap-1.5 flex-wrap">
                      <input type="number" min={1} max={100000} value={amount} onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-20 bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1 text-[11px] font-mono" aria-label="cantidad" />
                      <span className="text-[9px] font-mono text-muted-foreground">
                        {c.code} ≈ ⓥ{(c.price * amount).toFixed(2)}
                      </span>
                      <button onClick={() => void trade(c.code, "BUY")} disabled={busy}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-green-hud/30 border border-green-hud text-green-hud rounded-sm text-[10px] font-mono uppercase font-bold disabled:opacity-40">
                        <ArrowUpRight className="w-3 h-3" /> Comprar
                      </button>
                      <button onClick={() => void trade(c.code, "SELL")} disabled={busy || myPos <= 0}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-hud/30 border border-red-hud text-red-hud rounded-sm text-[10px] font-mono uppercase font-bold disabled:opacity-40">
                        <ArrowDownRight className="w-3 h-3" /> Vender {myPos > 0 ? `(${myPos})` : ""}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {sel && (
            <div className="text-[9px] font-mono text-muted-foreground">
              {countryName(sel.country) ? `${sel.name} opera desde ${countryName(sel.country)}` : `${sel.name} — moneda global`}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
