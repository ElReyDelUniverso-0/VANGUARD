"use client";

// v20 DIVISAS MUNDIALES + ATLAS DE BANDERAS: los 247 países con moneda y su
// BANDERA VERDADERA (flagcdn). Selecciona cualquier país del mundo, ve su moneda
// oficial (código, símbolo, tasa vs USD en vivo) y opera con monedas VANGUARD.

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Countryball, STICKER_CODES } from "@/components/vanguard/countryball";
import { Flag } from "@/lib/flags";
import { WORLD_CURRENCIES, REGIONS, type WorldCurrency } from "@/lib/currency-data";
import { WORLD_FLAGS, countryName } from "@/lib/world-data";
import { useGameStore } from "@/lib/game-store";
import { toast } from "sonner";
import { Banknote, TrendingUp, TrendingDown, Search, Wallet, ArrowLeftRight, LayoutGrid, List } from "lucide-react";

interface Live extends WorldCurrency { live: number; dir: 1 | -1 | 0; }

export function DivisasPanel() {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("Todas");
  const [q, setQ] = useState("");
  const [selIdx, setSelIdx] = useState(0);
  const [atlas, setAtlas] = useState(false);
  const [lives, setLives] = useState<Live[]>(() => WORLD_CURRENCIES.map((c) => ({ ...c, live: c.rate, dir: 0 as const })));
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  const coins = useGameStore((s) => s.coins);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const addCoins = useGameStore((s) => s.addCoins);

  // mercado simulado: cada 2.4s una divisa se mueve ±0.2-1.4%
  useEffect(() => {
    const iv = setInterval(() => {
      setLives((ls) => {
        const next = [...ls];
        const i = Math.floor(Math.random() * next.length);
        const pct = (Math.random() * 1.2 + 0.2) * (Math.random() < 0.5 ? -1 : 1);
        next[i] = { ...next[i], live: next[i].live * (1 + pct / 100), dir: pct > 0 ? 1 : -1 };
        return next;
      });
    }, 2400);
    return () => clearInterval(iv);
  }, []);

  const filtered = useMemo(() => {
    const byRegion = region === "Todas" ? lives : lives.filter((c) => c.region === region);
    if (!q.trim()) return byRegion;
    const ql = q.toLowerCase();
    return byRegion.filter((c) => c.country.toLowerCase().includes(ql) || c.currency.toLowerCase().includes(ql) || c.code.toLowerCase().includes(ql));
  }, [lives, region, q]);

  const sel = filtered[Math.min(selIdx, Math.max(0, filtered.length - 1))];

  const holdings = useMemo(
    () => Object.entries(portfolio).map(([code, units]) => {
      const c = WORLD_CURRENCIES.find((x) => x.code === code);
      const l = lives.find((x) => x.code === code);
      const usd = units / (l?.live ?? c?.rate ?? 1);
      return { code, units, usd, country: c?.country ?? code, symbol: c?.symbol ?? "" };
    }),
    [portfolio, lives]
  );
  const portfolioUsd = holdings.reduce((n, h) => n + h.usd, 0);

  const buy = () => {
    if (!sel) return;
    if (!spendCoins(100, `Comprar ${sel.code}`)) { toast.error("Necesitas 100 ◉"); return; }
    const units = 100 * sel.live;
    setPortfolio((p) => ({ ...p, [sel.code]: (p[sel.code] ?? 0) + units }));
    toast.success(`+${units.toLocaleString("es", { maximumFractionDigits: 0 })} ${sel.code} (${sel.symbol})`);
  };
  const sell = () => {
    if (!sel) return;
    const units = portfolio[sel.code] ?? 0;
    if (units <= 0) { toast.info(`No tienes ${sel.code}`); return; }
    const usd = units / sel.live;
    const vgc = Math.round(usd * 100);
    addCoins(vgc, `Vender ${sel.code}`);
    setPortfolio((p) => { const n = { ...p }; delete n[sel.code]; return n; });
    toast.success(`Vendidos ${units.toLocaleString("es", { maximumFractionDigits: 0 })} ${sel.code} → +${vgc} ◉`);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      {/* LISTADO MUNDIAL */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-52">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setSelIdx(0); }} placeholder="Busca país o divisa: Japón, Yen, RUB…" className="pl-8 font-mono text-xs h-9" aria-label="Buscar país o divisa" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => { setRegion(r); setSelIdx(0); }}
                className={`px-2.5 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider border transition-colors ${region === r ? "border-electric text-electric bg-electric/10" : "border-border text-muted-foreground hover:border-electric/40"}`}
                aria-pressed={region === r}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
            {atlas ? `Atlas de banderas · ${WORLD_FLAGS.length} países` : `${filtered.length} divisas en vivo`}
          </div>
          <button
            onClick={() => setAtlas((a) => !a)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider border transition-colors ${atlas ? "border-amber-hud/60 text-amber bg-amber/10" : "border-border text-muted-foreground hover:border-amber/40"}`}
            aria-pressed={atlas}
          >
            {atlas ? <List className="w-3 h-3" /> : <LayoutGrid className="w-3 h-3" />}
            {atlas ? "Ver divisas" : "Atlas de banderas"}
          </button>
        </div>

        {atlas ? (
          <div className="hud-panel p-3 max-h-[540px] overflow-y-auto">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {WORLD_FLAGS.map((f) => (
                <button
                  key={f.code}
                  onClick={() => {
                    const idx = WORLD_CURRENCIES.findIndex((c) => c.flag === f.code);
                    if (idx >= 0) {
                      setAtlas(false);
                      setRegion("Todas");
                      setQ("");
                      setSelIdx(0);
                      const livesIdx = lives.findIndex((c) => c.flag === f.code);
                      if (livesIdx >= 0) setSelIdx(livesIdx);
                    } else {
                      toast.info(`${f.name}: territorio sin moneda propia`);
                    }
                  }}
                  className="group flex flex-col items-center gap-1 p-1.5 rounded border border-transparent hover:border-electric/40 hover:bg-electric/5 transition-colors"
                  title={`${f.name} — ver su divisa`}
                >
                  <Flag code={f.code} size={38} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[7.5px] font-mono text-muted-foreground leading-tight text-center line-clamp-2">{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
        <div className="hud-panel divide-y divide-border max-h-[540px] overflow-y-auto">
          {filtered.map((c, i) => (
            <button
              key={`${c.code}-${c.country}`}
              onClick={() => setSelIdx(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${sel?.country === c.country && sel?.code === c.code ? "bg-electric/10" : "hover:bg-white/[0.03]"}`}
            >
              <Flag code={c.flag} size={30} title={countryName(c.flag)} />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono font-bold truncate">{c.country}</div>
                <div className="text-[9px] text-muted-foreground font-mono truncate">{c.currency}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] font-mono font-bold">{c.symbol} <span className="text-electric">{c.code}</span></div>
                <div className={`text-[9px] font-mono tabular-nums flex items-center justify-end gap-1 ${c.dir === 1 ? "text-green-hud" : c.dir === -1 ? "text-red-hud" : "text-muted-foreground"}`}>
                  {c.dir === 1 ? <TrendingUp className="w-2.5 h-2.5" /> : c.dir === -1 ? <TrendingDown className="w-2.5 h-2.5" /> : null}
                  {c.live.toLocaleString("es", { maximumFractionDigits: c.live < 10 ? 3 : 0 })}/USD
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs font-mono text-muted-foreground">Sin resultados para «{q}»</div>
          )}
        </div>
        )}
      </div>

      {/* DETALLE + OPERATIVA */}
      <div className="space-y-3">
        {sel && (
          <div className="hud-panel p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Flag code={sel.flag} size={52} title={sel.country} />
              <div>
                <h3 className="font-orbitron text-sm tracking-wider uppercase text-gradient">{sel.country}</h3>
                <div className="text-[10px] font-mono text-muted-foreground">{sel.currency} · {sel.region}</div>
              </div>
            </div>
            <div className="border border-border rounded p-3 text-center">
              <div className="text-[9px] font-mono text-muted-foreground uppercase">Tasa en vivo</div>
              <div className={`text-2xl font-bold font-mono tabular-nums ${sel.dir === 1 ? "text-green-hud" : sel.dir === -1 ? "text-red-hud" : "text-foreground"}`}>
                {sel.symbol} {sel.live.toLocaleString("es", { maximumFractionDigits: sel.live < 10 ? 4 : 0 })}
              </div>
              <div className="text-[9px] font-mono text-muted-foreground">por 1 USD · {sel.code}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" onClick={buy} className="font-mono text-[11px] gap-1.5"><Wallet className="w-3.5 h-3.5" /> Comprar · 100 ◉</Button>
              <Button size="sm" variant="outline" onClick={sell} className="font-mono text-[11px] gap-1.5 border-amber-hud/40 text-amber hover:bg-amber/10"><ArrowLeftRight className="w-3.5 h-3.5" /> Vender todo</Button>
            </div>
            <p className="text-[9px] font-mono text-muted-foreground leading-relaxed">
              Operativa simulada con monedas VANGUARD: compras a tasa actual y vendes según el mercado en vivo — puedes ganar o perder ◉.
            </p>
          </div>
        )}

        <div className="hud-panel p-4">
          <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient mb-2 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-green-hud" /> Tu cartera de divisas
          </h3>
          {holdings.length === 0 ? (
            <p className="text-[10px] font-mono text-muted-foreground">Vacía. Selecciona un país y compra su divisa con 100 ◉.</p>
          ) : (
            <ul className="space-y-1.5">
              {holdings.map((h) => (
                <li key={h.code} className="flex items-center justify-between text-[10px] font-mono border-b border-border/60 pb-1">
                  <span className="truncate">{h.country} · {h.code}</span>
                  <span className="text-green-hud tabular-nums">{h.units.toLocaleString("es", { maximumFractionDigits: 0 })} {h.symbol}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground">Valor total cartera</span>
            <span className="font-bold text-amber">≈ {portfolioUsd.toFixed(2)} USD · saldo {coins.toLocaleString("es")} ◉</span>
          </div>
        </div>

        <div className="hud-panel p-3">
          <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Countryballs con bandera real · stickers</div>
          <div className="grid grid-cols-8 gap-1">
            {STICKER_CODES.slice(0, 24).map((c) => (
              <Countryball key={c.code} code={c.code} size={22} className="mx-auto" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
