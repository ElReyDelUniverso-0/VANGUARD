"use client";

// Vanguard v12 — BETNACION: casa de apuestas estilo sportsbook real.
// Mercados definidos (1X2, doble oportunidad, over/under, handicap, marcador
// exacto), partidos EN VIVO minuto a minuto, cuotas que se mueven, combinadas,
// cashout y liquidacion automatica. Monedas virtuales del juego.

import { useState, useEffect, useRef, useCallback } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { Dice5, Coins, Radio, Clock, Ticket, TrendingUp, Ban, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { sfx } from "@/lib/sound";
import { useGameStore } from "@/lib/game-store";
import {
  generateEvents, advanceEvent, refreshOdds, choiceWon, settleWinnerEvent,
  cashoutValue, loadTickets, saveTickets, loadEvents, saveEvents,
  type BkEvent, type BkLeg, type BkTicket,
} from "@/lib/bookmaker-sim";

const STAKE_CHIPS = [50, 100, 250, 500];

interface BkStats { staked: number; payout: number; bets: number; wins: number; }
function loadStats(): BkStats {
  try { return JSON.parse(localStorage.getItem("vanguard-bk-stats") ?? "") as BkStats; }
  catch { return { staked: 0, payout: 0, bets: 0, wins: 0 }; }
}

function countdown(ms: number): string {
  if (ms <= 0) return "EN JUEGO";
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function BookmakerPanel() {
  const coins = useGameStore((s) => s.coins);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const recordBet = useGameStore((s) => s.recordBet);

  const [sub, setSub] = useState<"vivo" | "prox" | "politica" | "tickets">("vivo");
  const [events, setEvents] = useState<BkEvent[]>([]);
  const [tickets, setTickets] = useState<BkTicket[]>([]);
  const [slip, setSlip] = useState<BkLeg[]>([]);
  const [stake, setStake] = useState(100);
  const [marketSel, setMarketSel] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<BkStats>({ staked: 0, payout: 0, bets: 0, wins: 0 });
  const [flash, setFlash] = useState<string | null>(null); // evento con gol reciente

  const eventsRef = useRef<BkEvent[]>([]);
  const ticketsRef = useRef<BkTicket[]>([]);
  const tick = useRef(0);
  useEffect(() => { ticketsRef.current = tickets; }, [tickets]);

  // ====== INIT: cargar o generar jornada ======
  useEffect(() => {
    let evs = loadEvents();
    if (!evs) evs = generateEvents();
    // reembolsar tickets abiertos de una jornada anterior (evento inexistente)
    const tks = loadTickets();
    const ids = new Set(evs.map((e) => e.id));
    const refunded = tks.filter((t) => t.status === "ABIERTA" && t.legs.some((l) => !ids.has(l.eventId)));
    if (refunded.length > 0) {
      for (const t of tks) {
        if (t.status === "ABIERTA" && t.legs.some((l) => !ids.has(l.eventId))) {
          t.status = "COBRADA"; t.payout = t.stake;
        }
      }
      const total = refunded.reduce((a, t) => a + t.stake, 0);
      addCoins(total, "Reembolso jornada anterior BETNACION");
      toast.info(`Jornada rotada: ${refunded.length} apuesta(s) reembolsada(s)`, { description: `+${total} mon de vuelta` });
      saveTickets(tks);
    }
    eventsRef.current = evs;
    setEvents([...evs]);
    ticketsRef.current = tks;
    setTickets(tks);
    setStats(loadStats());
  }, [addCoins]);

  // ====== MOTOR EN VIVO (1s) ======
  useEffect(() => {
    const iv = setInterval(() => {
      tick.current++;
      const evs = eventsRef.current;
      if (!evs.length) return;
      const next = evs.map((e) => {
        const c = { ...e, corners: [...e.corners] as [number, number], cards: [...e.cards] as [number, number], xg: [...e.xg] as [number, number] };
        const before = c.status;
        const goalsBefore = c.hs + c.as;
        advanceEvent(c, 1);
        if (c.status === "EN_VIVO" && tick.current % 2 === 0) refreshOdds(c);
        if (before !== "FINALIZADO" && c.status === "FINALIZADO" && c.kind !== "FUTBOL") settleWinnerEvent(c);
        if (c.status === "EN_VIVO" && c.hs + c.as > goalsBefore) setFlash(c.id);
        return c;
      });
      eventsRef.current = next;
      setEvents(next);
      if (tick.current % 3 === 0) saveEvents(next);
      settleOpenTickets(next);
      if (flash) setTimeout(() => setFlash(null), 2500);
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== LIQUIDACION AUTOMATICA (pura: efectos fuera del updater) ======
  const settleOpenTickets = useCallback((evs: BkEvent[]) => {
    const map: Record<string, BkEvent> = {};
    for (const e of evs) map[e.id] = e;
    const prev = ticketsRef.current;
    let changed = false;
    let payoutDelta = 0, winsDelta = 0;
    const next = prev.map((t) => {
      if (t.status !== "ABIERTA") return t;
      if (!t.legs.every((l) => map[l.eventId] && map[l.eventId].status === "FINALIZADO")) return t;
      changed = true;
      const won = t.legs.every((l) => choiceWon(map[l.eventId], l) === true);
      if (won) {
        payoutDelta += t.potential; winsDelta += 1;
        addCoins(t.potential, `Apuesta GANADA BETNACION x${t.legs.length}`);
        addXp(35);
        recordBet(t.stake, true, t.potential);
        sfx.coin();
        toast.success(`¡APUESTA GANADA! +${t.potential} mon`, { description: t.legs.map((l) => `${l.choiceLabel} @${l.odd}`).join(" · ") });
        return { ...t, status: "GANADA" as const, payout: t.potential, settledAt: Date.now() };
      }
      recordBet(t.stake, false, 0);
      sfx.error();
      toast.error("Apuesta perdida", { description: t.legs.map((l) => l.choiceLabel).join(" · ") });
      return { ...t, status: "PERDIDA" as const, payout: 0, settledAt: Date.now() };
    });
    if (!changed) return;
    ticketsRef.current = next;
    saveTickets(next);
    setTickets(next);
    if (payoutDelta > 0 || winsDelta > 0) {
      setStats((s) => { const ns = { ...s, payout: s.payout + payoutDelta, wins: s.wins + winsDelta }; localStorage.setItem("vanguard-bk-stats", JSON.stringify(ns)); return ns; });
    }
  }, [addCoins, addXp, recordBet]);

  // ====== BOLETA ======
  const addLeg = (e: BkEvent, mKey: string, mLabel: string, cKey: string, cLabel: string, odd: number) => {
    sfx.beep();
    setSlip((prev) => {
      const filtered = prev.filter((l) => l.eventId !== e.id); // 1 seleccion por evento
      const leg: BkLeg = { eventId: e.id, eventTitle: e.title, marketKey: mKey, marketLabel: mLabel, choiceKey: cKey, choiceLabel: cLabel, odd };
      return [...filtered, leg].slice(0, 8);
    });
  };
  const totalOdd = slip.reduce((a, l) => a * l.odd, 1);
  const potential = Math.round(stake * totalOdd);

  const placeBet = () => {
    if (!slip.length) return;
    if (stake < 10) { toast.error("Apuesta minima: 10 mon"); return; }
    if (coins < stake) { toast.error("Monedas insuficientes"); return; }
    spendCoins(stake, `Apuesta BETNACION x${slip.length}`);
    const t: BkTicket = {
      id: `T-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
      placedAt: Date.now(), legs: [...slip], stake,
      potential: Math.round(stake * totalOdd), status: "ABIERTA", payout: 0,
    };
    const next = [t, ...loadTickets()];
    saveTickets(next); setTickets(next); setSlip([]);
    setStats((s) => { const ns = { ...s, staked: s.staked + stake, bets: s.bets + 1 }; localStorage.setItem("vanguard-bk-stats", JSON.stringify(ns)); return ns; });
    sfx.coin();
    toast.success(`Apuesta colocada · cuota ${totalOdd.toFixed(2)}`, { description: `Pago potencial: ${t.potential} mon` });
  };

  // ====== CASHOUT ======
  const doCashout = (t: BkTicket) => {
    const map: Record<string, BkEvent> = {};
    for (const e of eventsRef.current) map[e.id] = e;
    const val = cashoutValue(t, map);
    if (val == null) return;
    const next = loadTickets().map((x) => x.id === t.id ? { ...x, status: "COBRADA" as const, payout: val, cashedAtStatus: "EN VIVO" } : x);
    saveTickets(next); setTickets(next);
    addCoins(val, "CASHOUT BETNACION");
    recordBet(t.stake, val > t.stake, val);
    sfx.coin();
    toast.info(`CASHOUT cobrado: +${val} mon`, { description: val > t.stake ? "Cerraste con ganancia" : "Cerraste limitando perdida" });
  };

  // ====== LISTAS ======
  const live = events.filter((e) => e.status === "EN_VIVO" && e.kind === "FUTBOL");
  const prox = events.filter((e) => e.status === "PROXIMO" && e.kind === "FUTBOL").sort((a, b) => a.startAt - b.startAt);
  const polit = events.filter((e) => e.kind !== "FUTBOL");
  const fin = events.filter((e) => e.status === "FINALIZADO").slice(0, 4);
  const openTickets = tickets.filter((t) => t.status === "ABIERTA");
  const histTickets = tickets.filter((t) => t.status !== "ABIERTA");
  const roi = stats.staked > 0 ? Math.round(((stats.payout - stats.staked) / stats.staked) * 100) : 0;

  const SubBtn = ({ id, label, badge }: { id: typeof sub; label: string; badge?: number }) => (
    <button
      onClick={() => { sfx.tab(); setSub(id); }}
      className={cn(
        "relative px-3 py-1.5 rounded-sm font-mono text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap",
        sub === id ? "text-amber border-amber-hud bg-amber-hud/30" : "border-border/60 text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      {badge ? <span className="ml-1.5 px-1 rounded-sm bg-red-hud/40 text-red-hud text-[9px]">{badge}</span> : null}
    </button>
  );

  const OddsGrid = ({ e }: { e: BkEvent }) => {
    const sel = marketSel[e.id] ?? e.markets[0].key;
    const m = e.markets.find((mk) => mk.key === sel) ?? e.markets[0];
    const isExact = m.key === "EXACTO";
    return (
      <div>
        <div className="flex gap-1 flex-wrap mb-1.5">
          {e.markets.filter((mk) => mk.key !== "EXACTO" || sel === "EXACTO").map((mk) => (
            <button
              key={mk.key}
              onClick={() => { sfx.hover(); setMarketSel((s) => ({ ...s, [e.id]: mk.key })); }}
              className={cn(
                "px-1.5 py-0.5 text-[9px] font-mono uppercase rounded-sm border",
                sel === mk.key ? "text-cyan-hud border-cyan-hud bg-cyan-hud/20" : "border-border/50 text-muted-foreground"
              )}
            >
              {mk.key === "WINNER" ? "GANADOR" : mk.label}
            </button>
          ))}
          {!isExact && e.markets.some((mk) => mk.key === "EXACTO") && (
            <button onClick={() => setMarketSel((s) => ({ ...s, [e.id]: "EXACTO" }))}
              className={cn("px-1.5 py-0.5 text-[9px] font-mono rounded-sm border", sel === "EXACTO" ? "text-cyan-hud border-cyan-hud bg-cyan-hud/20" : "border-border/50 text-muted-foreground")}>
              EXACTO
            </button>
          )}
        </div>
        <div className={cn("grid gap-1", m.choices.length === 2 ? "grid-cols-2" : isExact ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-3")}>
          {m.choices.map((c) => {
            const picked = slip.some((l) => l.eventId === e.id && l.marketKey === m.key && l.choiceKey === c.key);
            return (
              <button
                key={c.key}
                onClick={() => addLeg(e, m.key, m.key === "WINNER" ? "GANADOR" : m.label, c.key, c.label, c.odd)}
                className={cn(
                  "px-1.5 py-1.5 rounded-sm border text-left transition-colors",
                  picked ? "border-amber-hud bg-amber-hud/30 text-amber" : "border-border/60 bg-secondary/40 hover:border-amber-hud/50"
                )}
              >
                <div className="text-[8px] sm:text-[9px] font-mono text-muted-foreground uppercase leading-tight truncate">{c.label}</div>
                <div className={cn("text-xs sm:text-sm font-mono font-bold", picked ? "text-amber" : "text-foreground")}>{c.odd.toFixed(2)}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const EventCard = ({ e }: { e: BkEvent }) => (
    <div className={cn("hud-corner border bg-secondary/20 p-3", flash === e.id && "border-red-hud shadow-[0_0_18px_rgba(239,68,68,0.35)]")}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest truncate">{e.comp}</span>
        {e.status === "EN_VIVO" && (
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-red-hud">
            <Radio className="w-2.5 h-2.5 blink-soft" /> {Math.floor(e.minute)}&apos;
          </span>
        )}
        {e.status === "PROXIMO" && (
          <span className="flex items-center gap-1 text-[9px] font-mono text-cyan-hud">
            <Clock className="w-2.5 h-2.5" /> {countdown(e.startAt - Date.now())}
          </span>
        )}
        {e.status === "FINALIZADO" && <span className="text-[9px] font-mono text-muted-foreground">FINAL</span>}
      </div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="font-mono text-xs sm:text-sm font-bold text-foreground">{e.title}</div>
        {(e.status !== "PROXIMO") && (
          <div className={cn("font-mono text-lg font-bold", e.status === "EN_VIVO" ? "text-red-hud" : "text-muted-foreground")}>
            {e.kind === "FUTBOL" ? `${e.hs}-${e.as}` : (e.drawn ? e.sides[e.hs]?.slice(0, 6) : "—")}
          </div>
        )}
      </div>
      {e.status === "FINALIZADO" && e.kind === "FUTBOL" && (
        <div className="flex gap-2 text-[9px] font-mono text-muted-foreground mb-1.5">
          <span>CORNERS {e.corners[0]}-{e.corners[1]}</span><span>TARJ. {e.cards[0]}-{e.cards[1]}</span>
        </div>
      )}
      {e.status !== "FINALIZADO" && <OddsGrid e={e} />}
      {e.status === "FINALIZADO" && (
        <div className="text-[10px] font-mono text-muted-foreground truncate">{e.events[0]}</div>
      )}
      {e.status === "EN_VIVO" && e.events[0] && (
        <div className="mt-1.5 text-[9px] font-mono text-muted-foreground/80 truncate">{e.events[0]}</div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <PanelHeader
        title="BETNACION"
        subtitle="Casa de apuestas · cuotas en vivo · mercados definidos"
        icon={<Dice5 className="w-4 h-4" />}
        color="green"
        right={<div className="flex items-center gap-1.5 font-mono text-xs text-amber"><VIcon k="M" className="w-3.5 h-3.5" />{coins.toLocaleString()}</div>}
      />

      {/* stats de la casa */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { l: "APOSTADO", v: stats.staked.toLocaleString(), c: "text-foreground" },
          { l: "DEVUELTO", v: stats.payout.toLocaleString(), c: "text-green-hud" },
          { l: "ROI", v: `${roi > 0 ? "+" : ""}${roi}%`, c: roi >= 0 ? "text-green-hud" : "text-red-hud" },
          { l: "GANADAS", v: `${stats.wins}/${stats.bets}`, c: "text-cyan-hud" },
        ].map((s) => (
          <div key={s.l} className="hud-corner border bg-secondary/20 p-2 text-center">
            <div className="text-[8px] font-mono text-muted-foreground uppercase">{s.l}</div>
            <div className={cn("text-xs sm:text-sm font-mono font-bold", s.c)}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <SubBtn id="vivo" label="EN VIVO" badge={live.length} />
        <SubBtn id="prox" label="PROXIMOS" badge={prox.length} />
        <SubBtn id="politica" label="POLITICA & GUERRA" badge={polit.length} />
        <SubBtn id="tickets" label="MIS APUESTAS" badge={openTickets.length} />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-3 items-start">
        <div className="space-y-2">
          {sub === "vivo" && (
            live.length ? <div className="grid md:grid-cols-2 gap-2">{live.map((e) => <EventCard key={e.id} e={e} />)}</div>
              : <div className="hud-corner border p-8 text-center text-xs font-mono text-muted-foreground uppercase">Sin partidos en vivo · mira PROXIMOS</div>
          )}
          {sub === "prox" && (
            <div className="grid md:grid-cols-2 gap-2">
              {prox.map((e) => <EventCard key={e.id} e={e} />)}
            </div>
          )}
          {sub === "politica" && (
            <div className="grid md:grid-cols-2 gap-2">
              {polit.map((e) => <EventCard key={e.id} e={e} />)}
              <div className="md:col-span-2 hud-corner border p-3">
                <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2 flex items-center gap-1"><Flame className="w-3 h-3 text-amber" /> RESULTADOS RECIENTES</div>
                <div className="space-y-1">
                  {fin.map((f) => (
                    <div key={f.id} className="flex justify-between text-[10px] font-mono">
                      <span className="text-foreground truncate">{f.title}</span>
                      <span className="text-muted-foreground">{f.kind === "FUTBOL" ? `${f.hs}-${f.as}` : f.sides[f.hs]}</span>
                    </div>
                  ))}
                  {!fin.length && <div className="text-[10px] font-mono text-muted-foreground">Sin resultados todavia</div>}
                </div>
              </div>
            </div>
          )}
          {sub === "tickets" && (
            <div className="space-y-2">
              {openTickets.map((t) => {
                const map: Record<string, BkEvent> = {};
                for (const e of eventsRef.current) map[e.id] = e;
                const cv = cashoutValue(t, map);
                return (
                  <div key={t.id} className="hud-corner border border-amber-hud/50 bg-secondary/20 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono text-amber font-bold uppercase flex items-center gap-1"><Ticket className="w-3 h-3" /> ABIERTA {t.legs.length > 1 ? `COMBINADA x${t.legs.length}` : "SIMPLE"}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">cuota {t.legs.reduce((a, l) => a * l.odd, 1).toFixed(2)}</span>
                    </div>
                    {t.legs.map((l, i) => (
                      <div key={i} className="flex justify-between text-[10px] font-mono py-0.5 border-b border-border/30">
                        <span className="text-foreground truncate">{l.eventTitle} · {l.choiceLabel}</span>
                        <span className="text-amber">{l.odd.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">{t.stake} mon → {t.potential} mon</span>
                      {cv != null && cv > 0 && (
                        <Button size="sm" onClick={() => doCashout(t)} className="h-6 text-[10px] font-mono bg-green-hud/30 text-green-hud border border-green-hud hover:bg-green-hud/50">
                          <Zap className="w-3 h-3 mr-1" /> CASHOUT {cv} mon
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {!openTickets.length && <div className="hud-corner border p-6 text-center text-xs font-mono text-muted-foreground uppercase">Sin apuestas abiertas</div>}
              {histTickets.slice(0, 12).map((t) => (
                <div key={t.id} className={cn("border p-2.5 flex items-center justify-between gap-2", t.status === "GANADA" ? "border-green-hud/50 bg-green-hud/10" : t.status === "PERDIDA" ? "border-red-hud/40 bg-red-hud/5" : "border-border/50")}>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono font-bold uppercase" style={{ color: t.status === "GANADA" ? "#4ade80" : t.status === "PERDIDA" ? "#f87171" : "#22d3ee" }}>{t.status}{t.cashedAtStatus ? " (CASHOUT)" : ""}</div>
                    <div className="text-[9px] font-mono text-muted-foreground truncate">{t.legs.map((l) => l.choiceLabel).join(" + ")}</div>
                  </div>
                  <div className={cn("text-xs font-mono font-bold whitespace-nowrap", t.status === "GANADA" || t.status === "COBRADA" ? "text-green-hud" : "text-red-hud")}>
                    {t.status === "PERDIDA" ? `-${t.stake}` : `+${t.payout}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOLETA */}
        <div className="hud-corner border border-amber-hud bg-background/90 p-3 lg:sticky lg:top-32">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber mb-2 flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5" /> BOLETA {slip.length > 1 && <span className="text-cyan-hud">· COMBINADA</span>}
          </div>
          {slip.length === 0 ? (
            <div className="text-[10px] font-mono text-muted-foreground py-3 text-center">Toca una cuota para agregar</div>
          ) : (
            <div className="space-y-1 mb-2 max-h-52 overflow-y-auto thin-scroll">
              {slip.map((l) => (
                <div key={`${l.eventId}-${l.marketKey}`} className="flex items-start justify-between gap-2 text-[10px] font-mono border-b border-border/30 pb-1">
                  <div className="min-w-0">
                    <div className="text-foreground truncate">{l.choiceLabel}</div>
                    <div className="text-muted-foreground/70 truncate">{l.eventTitle} · {l.marketLabel}</div>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-amber font-bold">{l.odd.toFixed(2)}</span>
                    <button onClick={() => setSlip((p) => p.filter((x) => x !== l))} aria-label="Quitar"><Ban className="w-3 h-3 text-red-hud/70" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-1 mb-2">
            {STAKE_CHIPS.map((v) => (
              <button key={v} onClick={() => { sfx.hover(); setStake(v); }}
                className={cn("flex-1 py-1 text-[10px] font-mono border rounded-sm", stake === v ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border/50 text-muted-foreground")}>
                {v}
              </button>
            ))}
            <button onClick={() => setStake(Math.max(10, Math.floor(coins / 2)))} className="flex-1 py-1 text-[10px] font-mono border border-border/50 rounded-sm text-muted-foreground">½</button>
          </div>
          <input
            type="number" min={10} value={stake}
            onChange={(e) => setStake(Math.max(10, Math.floor(Number(e.target.value) || 10)))}
            className="w-full bg-secondary/40 border border-border/60 rounded-sm px-2 py-1.5 text-xs font-mono text-foreground mb-2"
            placeholder="Monto (mon)"
          />
          <div className="flex justify-between text-[10px] font-mono mb-2">
            <span className="text-muted-foreground">CUOTA TOTAL</span>
            <span className="text-cyan-hud font-bold">{totalOdd.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono mb-2">
            <span className="text-muted-foreground">PAGO POTENCIAL</span>
            <motion.span key={potential} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="text-green-hud font-bold flex items-center gap-1">
              <Coins className="w-3 h-3" />{potential.toLocaleString()}
            </motion.span>
          </div>
          <Button onClick={placeBet} disabled={!slip.length} className="w-full font-mono font-bold uppercase tracking-widest bg-amber-hud/30 border border-amber-hud text-amber hover:bg-amber-hud/50">
            APOSTAR {stake} MON
          </Button>
          <div className="mt-2 text-[8px] font-mono text-muted-foreground/60 leading-relaxed">
            +18 · MONEDAS VIRTUALES SIN VALOR REAL · JUEGA RESPONSABLE · LAS CUOTAS PUEDEN CAMBIAR EN VIVO
          </div>
        </div>
      </div>
    </div>
  );
}
