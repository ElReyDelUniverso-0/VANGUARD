"use client";

// v13 — RED DE ESPIONAJE: espiar predicciones de otros (20 mon), copiarlas
// (aciertas = ganas menos, fallas = pierdes el doble), modo encubierto que
// oculta tus predicciones y predicciones trampa que castigan a los espías.

import { useState, useEffect, useRef, useCallback } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { VenetianMask, Eye, Copy, Ghost, Bomb, ShieldOff, Skull, Coins } from "lucide-react";
import { useGameStore } from "@/lib/game-store";
import { PREDICTION_MARKETS } from "@/lib/game-data";

const SPY_COST = 20;
const UNDERCOVER_COST = 75;
const TRAP_COST = 30;
const LS_KEY = "vanguard-espionage";

interface SpyStats { spies: number; copiesWon: number; copiesLost: number; trapsPaid: number; earned: number; }
interface Agent {
  id: string;
  name: string;
  marketId: string;
  outcome: "YES" | "NO";
  stake: number;
  resolveAt: number;
  spied: boolean;
  copied: boolean;
  isTrap?: boolean; // trampa plantada por ti (visible para bots)
}
interface TrapVictim { agentName: string; lost: number; at: number; }

const BOT_NAMES = ["NAJERAX", "FOX_ROT", "KGB_TOM", "MOSSAD_LIA", "NSA_ZERO", "MI6_ORION", "MSS_WU", "DGSE_VESTA", "BND_LUPUS", "SVR_KITE", "CIA_NOMAD", "RAW_SHAKTI", "GCHQ_BEE", "FSB_VOLT", "CSE_HAWK"];
const NAMES = ["corredor_7", "analista_k", "osint_dog", "geo_wizard", "la_lupa", "el_mapa", "voto_frio", "agente_9", "mapmaker", "intel_ninja"];

function loadStats(): SpyStats {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "") as SpyStats;
  } catch {
    return { spies: 0, copiesWon: 0, copiesLost: 0, trapsPaid: 0, earned: 0 };
  }
}

export function EspionagePanel() {
  const { coins, spendCoins, addCoins, addXp } = useGameStore();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<SpyStats>({ spies: 0, copiesWon: 0, copiesLost: 0, trapsPaid: 0, earned: 0 });
  const [undercoverUntil, setUndercoverUntil] = useState(0);
  const [trapActive, setTrapActive] = useState<{ text: string; copiedBy: string[] } | null>(null);
  const [victims, setVictims] = useState<TrapVictim[]>([]);
  const resolvedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const s = loadStats();
    setStats(s);
    try {
      const uc = Number(localStorage.getItem(LS_KEY + ":uc") ?? 0);
      setUndercoverUntil(uc);
    } catch { /* noop */ }
  }, []);

  // generar agentes con predicciones vivas
  const spawnAgents = useCallback(() => {
    setAgents((prev) => {
      const alive = prev.filter((a) => Date.now() < a.resolveAt && !a.isTrap);
      const need = 6 - alive.length;
      const fresh: Agent[] = [];
      for (let i = 0; i < need; i++) {
        const m = PREDICTION_MARKETS[Math.floor(Math.random() * PREDICTION_MARKETS.length)];
        fresh.push({
          id: `ag-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
          marketId: m.id,
          outcome: Math.random() < 0.5 ? "YES" : "NO",
          stake: [50, 100, 150, 200][Math.floor(Math.random() * 4)],
          resolveAt: Date.now() + (70 + Math.floor(Math.random() * 60)) * 1000,
          spied: false,
          copied: false,
        });
      }
      return [...alive, ...fresh];
    });
  }, []);

  useEffect(() => {
    spawnAgents();
    const iv = setInterval(spawnAgents, 15000);
    return () => clearInterval(iv);
  }, [spawnAgents]);

  // liquidacion automatica de copias (FUERA de updaters)
  const agentsRef = useRef<Agent[]>([]);
  useEffect(() => { agentsRef.current = agents; }, [agents]);

  useEffect(() => {
    const iv = setInterval(() => {
      const due = agentsRef.current.filter((a) => a.copied && !resolvedRef.current.has(a.id) && Date.now() >= a.resolveAt);
      if (due.length === 0) return;
      let gained = 0;
      let lost = 0;
      let wins = 0;
      let losses = 0;
      const done = new Set<string>();
      for (const a of due) {
        resolvedRef.current.add(a.id);
        done.add(a.id);
        const m = PREDICTION_MARKETS.find((x) => x.id === a.marketId);
        const p = m?.probability ?? 0.5;
        const win = a.outcome === "YES" ? Math.random() < p : Math.random() > p;
        if (win) {
          gained += Math.round(a.stake * (m?.odds ?? 2) * 0.8); // copiar gana MENOS (x0.8)
          wins += 1;
        } else {
          lost += a.stake * 2; // fallar copiando pierde EL DOBLE
          losses += 1;
        }
      }
      setAgents((prev) => prev.map((x) => (done.has(x.id) ? { ...x, copied: false, spied: true } : x)));
      if (gained > 0) {
        addCoins(gained, "ESPIONAJE: copia acertada (x0.8)");
        setStats((s) => {
          const ns = { ...s, copiesWon: s.copiesWon + wins, earned: s.earned + gained };
          localStorage.setItem(LS_KEY, JSON.stringify(ns));
          return ns;
        });
        toast.success(`COPIA ACERTADA · +${gained} mon (80% de la apuesta original)`);
      }
      if (lost > 0) {
        spendCoins(lost, "ESPIONAJE: copia fallada (penalizacion x2)");
        setStats((s) => {
          const ns = { ...s, copiesLost: s.copiesLost + losses, earned: s.earned - lost };
          localStorage.setItem(LS_KEY, JSON.stringify(ns));
          return ns;
        });
        toast.error(`COPIA FALLADA · -${lost} mon (penalización doble)`);
      }
    }, 2000);
    return () => clearInterval(iv);
  }, [addCoins, spendCoins]);

  const spy = (a: Agent) => {
    if (a.spied) return;
    if (!spendCoins(SPY_COST, "ESPIONAJE: espiar predicción")) { toast.error("Monedas insuficientes para espiar"); return; }
    setStats((s) => {
      const ns = { ...s, spies: s.spies + 1 };
      localStorage.setItem(LS_KEY, JSON.stringify(ns));
      return ns;
    });
    setAgents((prev) => prev.map((x) => (x.id === a.id ? { ...x, spied: true } : x)));
    addXp(8);
    toast.success(`Archivo obtenido de ${a.name} · -$${SPY_COST} mon`);
  };

  const copyBet = (a: Agent) => {
    if (!a.spied || a.copied) return;
    if (!spendCoins(a.stake, "ESPIONAJE: copiar apuesta (fianza)")) { toast.error(`Necesitas ${a.stake} mon para copiar`); return; }
    setAgents((prev) => prev.map((x) => (x.id === a.id ? { ...x, copied: true } : x)));
    toast(`Copiaste la predicción de ${a.name} — se liquida al vencer`, { description: "Ganas x0.8 · pierdes el doble" });
  };

  const goUndercover = () => {
    if (Date.now() < undercoverUntil) return;
    if (!spendCoins(UNDERCOVER_COST, "ESPIONAJE: modo encubierto 24h")) { toast.error("Monedas insuficientes"); return; }
    const until = Date.now() + 24 * 3600 * 1000;
    setUndercoverUntil(until);
    localStorage.setItem(LS_KEY + ":uc", String(until));
    toast.success("MODO ENCUBIERTO ACTIVO · tus predicciones quedan ocultas 24h");
  };

  const plantTrap = () => {
    if (trapActive) return;
    if (!spendCoins(TRAP_COST, "ESPIONAJE: plantar predicción trampa")) { toast.error("Monedas insuficientes"); return; }
    const m = PREDICTION_MARKETS[Math.floor(Math.random() * PREDICTION_MARKETS.length)];
    setTrapActive({ text: `${Math.random() < 0.5 ? "SÍ" : "NO"} · ${m.title} — apuesta segura de ${100 + Math.floor(Math.random() * 5) * 50} mon`, copiedBy: [] });
    toast("TRAMPA PLANTADA · los espías que la copien perderán y te pagarán");
    // bots caen en la trampa
    setTimeout(() => {
      const n = 1 + Math.floor(Math.random() * 3);
      const fell: string[] = [];
      let paid = 0;
      for (let i = 0; i < n; i++) {
        fell.push(NAMES[Math.floor(Math.random() * NAMES.length)]);
        paid += 60 + Math.floor(Math.random() * 6) * 20;
      }
      setTrapActive((t) => (t ? { ...t, copiedBy: fell } : t));
      if (paid > 0) {
        addCoins(paid, "ESPIONAJE: botas de la trampa");
        setVictims((v) => [{ agentName: fell.join(", "), lost: paid, at: Date.now() }, ...v].slice(0, 6));
        setStats((s) => {
          const ns = { ...s, trapsPaid: s.trapsPaid + 1, earned: s.earned + paid };
          localStorage.setItem(LS_KEY, JSON.stringify(ns));
          return ns;
        });
        toast.success(`TRAMPA ACTIVADA · ${fell.length} espías cayeron · +${paid} mon`);
      }
    }, 9000);
  };

  const undercover = Date.now() < undercoverUntil;

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Red de Espionaje"
        subtitle="Espía, copia, ocúltate y enreda — el juego sucio de las predicciones"
        icon={<VenetianMask className="w-4 h-4 text-violet-hud" />}
        color="violet"
        right={
          <span className="font-tech text-sm font-bold text-violet-hud tabular-nums">{coins.toLocaleString()} mon</span>
        }
      />

      {/* estado del agente */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatBox label="Operaciones de espionaje" value={stats.spies} icon={<Eye className="w-3.5 h-3.5 text-electric" />} />
        <StatBox label="Copias acertadas" value={stats.copiesWon} icon={<Copy className="w-3.5 h-3.5 text-neon" />} />
        <StatBox label="Copias falladas" value={stats.copiesLost} icon={<Skull className="w-3.5 h-3.5 text-crisis" />} />
        <StatBox label="Ganancia neta" value={stats.earned} icon={<Coins className="w-3.5 h-3.5 text-amber" />} />
      </div>

      {/* acciones globales */}
      <div className="hud-panel p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center gap-3">
          <Ghost className={cn("w-8 h-8 flex-shrink-0", undercover ? "text-neon" : "text-muted-foreground")} />
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-widest font-bold">Modo encubierto</div>
            <div className="text-[10px] text-muted-foreground leading-snug">
              {undercover ? `ACTIVO hasta ${new Date(undercoverUntil).toLocaleString("es")}` : "Oculta tus predicciones de los espías rivales · 75 mon / 24h"}
            </div>
          </div>
          {!undercover && (
            <Button variant="outline" size="sm" onClick={goUndercover} className="font-mono text-[9px] uppercase border-neon-hud text-neon">
              Activar
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Bomb className="w-8 h-8 flex-shrink-0 text-amber" />
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-widest font-bold">Predicción trampa</div>
            <div className="text-[10px] text-muted-foreground leading-snug">
              {trapActive ? trapActive.copiedBy.length ? `CAYERON: ${trapActive.copiedBy.join(", ")}` : "Plantada — esperando espías descuidados..." : "Planta una apuesta falsa visible para espías · 30 mon"}
            </div>
          </div>
          {!trapActive && (
            <Button variant="outline" size="sm" onClick={plantTrap} className="font-mono text-[9px] uppercase border-amber-hud text-amber">
              Plantar
            </Button>
          )}
        </div>
      </div>

      {/* archivo de trampas pasadas */}
      {victims.length > 0 && (
        <div className="hud-panel p-2">
          <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-1 px-1">Espías caídos en tus trampas</div>
          {victims.map((v, i) => (
            <div key={i} className="flex items-center gap-2 px-1 py-0.5 font-mono text-[10px]">
              <ShieldOff className="w-3 h-3 text-crisis" />
              <span className="truncate">{v.agentName}</span>
              <span className="ml-auto text-neon">+{v.lost} mon</span>
            </div>
          ))}
        </div>
      )}

      {/* agentes con predicciones */}
      <div className="hud-panel p-2">
        <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-1 px-1">
          Predicciones activas de agentes rivales {undercover && <span className="text-neon">· TU PERFIL ESTÁ OCULTO</span>}
        </div>
        <AnimatePresence initial={false}>
          {agents.map((a) => {
            const m = PREDICTION_MARKETS.find((x) => x.id === a.marketId);
            const secs = Math.max(0, Math.round((a.resolveAt - Date.now()) / 1000));
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="flex flex-wrap items-center gap-2 px-2 py-2 border-b border-border/50 last:border-0"
              >
                <VenetianMask className="w-4 h-4 text-violet-hud flex-shrink-0" />
                <span className="font-mono text-[10px] font-bold w-24 truncate">{a.name}</span>
                <span className="font-mono text-[9px] text-muted-foreground flex-1 min-w-0 truncate hidden sm:inline">
                  {m?.title ?? "mercado geopolítico"}
                </span>
                {a.spied ? (
                  <>
                    <span className={cn("px-1.5 py-0.5 border font-mono text-[9px] font-bold", a.outcome === "YES" ? "text-neon border-neon-hud" : "text-crisis border-crisis-hud")}>
                      {a.outcome === "YES" ? "COMPRA SÍ" : "APUESTA NO"}
                    </span>
                    <span className="font-tech text-[11px] text-amber font-bold tabular-nums">{a.stake} mon</span>
                    {a.copied ? (
                      <span className="font-mono text-[9px] text-electric blink-soft">COPIADA · liquida en {secs}s</span>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => copyBet(a)} className="font-mono text-[9px] uppercase border-electric-hud text-electric">
                        <Copy className="w-3 h-3 mr-1" /> Copiar ({a.stake})
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <span className="font-mono text-[9px] text-muted-foreground flex-1 sm:hidden">cifrado</span>
                    <span className="font-mono text-[9px] text-muted-foreground">▓▓▓▓▓ · liquida en {secs}s</span>
                    <Button variant="outline" size="sm" onClick={() => spy(a)} className="font-mono text-[9px] uppercase border-violet-hud text-violet-hud">
                      <Eye className="w-3 h-3 mr-1" /> Espiar ({SPY_COST})
                    </Button>
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="font-mono text-[9px] text-muted-foreground leading-relaxed">
        REGLAS DE LA CASA · Espiar cuesta 20 mon. Copiar una apuesta acertada paga el 80% del premio original.
        Fallar la copia pierde el DOBLE de la fianza. Con el modo encubierto nadie puede espiarte (y tus trampas pesan más).
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="hud-panel p-2 flex items-center gap-2">
      {icon}
      <div>
        <div className="font-tech text-lg font-bold tabular-nums leading-none">{value.toLocaleString()}</div>
        <div className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );
}
