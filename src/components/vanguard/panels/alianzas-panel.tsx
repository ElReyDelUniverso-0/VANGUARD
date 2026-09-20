"use client";

// v13 — ALIANZAS/CLANES: crea o únete a una alianza (hasta 50 agentes),
// chat privado, guerras de alianzas (duelo de predicciones semanal entre
// clanes, las monedas del perdedor van al ganador) y ranking global.

import { useState, useEffect, useRef, useCallback } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Flag, Swords, Send, Users, Crown, Trophy, LogOut } from "lucide-react";
import { useGameStore } from "@/lib/game-store";

interface Member { name: string; level: number; coins: number; online: boolean; }
interface Alliance {
  id: string;
  tag: string;
  name: string;
  motto: string;
  members: Member[];
  wins: number;
  elo: number;
  warProgress: number; // -100..100 (positivo = ganando)
}

const SEED_ALLIANCES: Alliance[] = [
  { id: "al-otan", tag: "NATO", name: "Escudo Atlántico", motto: "Animus in consulendo liber", members: [], wins: 14, elo: 1842, warProgress: 24 },
  { id: "al-este", tag: "EJE", name: "Pacto del Este", motto: "El mapa se escribe con acero", members: [], wins: 12, elo: 1798, warProgress: -18 },
  { id: "al-osint", tag: "OSNT", name: "Célula OSINT", motto: "Todo es verificable", members: [], wins: 16, elo: 1887, warProgress: 8 },
  { id: "al-sur", tag: "SUR", name: "Brigada del Sur", motto: "Ni un paso atrás", members: [], wins: 9, elo: 1654, warProgress: -6 },
  { id: "al-neutral", tag: "AZUL", name: "Casco Azul Digital", motto: "Primero datos, después balas", members: [], wins: 11, elo: 1721, warProgress: 3 },
];

const BOT_FIRST = ["NAJERAX", "FOXTROT", "ORION", "VEGA", "KITE", "NOMAD", "LUPUS", "HAWK", "WOLF", "ASTRO", "MERIDIAN", "CIFRA", "TALON", "RAVEN"];
const BOT_LAST = ["", "_7", "_OP", "01", "_X", "99", "-2", "_PRIME"];
const CHAT_LINES = [
  "Alguien vio el movimiento naval cerca del Golfo? Prepárense para la crisis semanal.",
  "Puse 200 mon en que la tregua aguanta 7 días. Odds 2.4, apetecible.",
  "El caso del detective de esta semana es difícil, el instigador plantó 2 falsas.",
  "Gané la simulación AEREO con 61%. El front nunca bajó de +30.",
  "Recordad votar en el juicio histórico, la semana pasada perdimos por 3 votos.",
  "Estoy espiando al EJE, tienen 2 agentes subidos en la misma predicción.",
  "El termómetro subió 4 puntos hoy. A cargar monedas.",
  "Nuevo en el arcade: descifrar Morse a los 40s me costó la vida jajaja",
];
const WAR_MESSAGES = ["Aliado caído en el flanco de predicciones", "Capturamos una cuota del pozo rival", "Refuerzo: +3 aciertos por miembros de reserva", "El rival contraataca en la categoría de simulaciones"];

const LS_KEY = "vanguard-alianza-v13";
interface Save { allianceId: string | null; ownName: string | null; tag: string | null; chat: { who: string; text: string; mine?: boolean }[]; warContribution: number; }

function loadSave(): Save {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "") as Save; } catch { return { allianceId: null, ownName: null, tag: null, chat: [], warContribution: 0 }; }
}

function makeMembers(n: number): Member[] {
  return Array.from({ length: n }, (_, i) => ({
    name: `${BOT_FIRST[Math.floor(Math.random() * BOT_FIRST.length)]}${BOT_LAST[Math.floor(Math.random() * BOT_LAST.length)]}`,
    level: 2 + Math.floor(Math.random() * 24),
    coins: 200 + Math.floor(Math.random() * 9000),
    online: Math.random() < 0.45,
  })).sort((a, b) => b.level - a.level);
}

export function AlianzasPanel() {
  const { alias, level, coins, addCoins, addXp, spendCoins } = useGameStore();
  const [save, setSave] = useState<Save>(loadSave());
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [input, setInput] = useState("");
  const [warTimer, setWarTimer] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mineRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setAlliances(
        SEED_ALLIANCES.map((a) => ({ ...a, members: makeMembers(18 + Math.floor(Math.random() * 30)) }))
      );
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // guerra de alianza: cuenta atras hasta el lunes + progreso vivo + botin por rachas
  const warRef = useRef(alliances);
  useEffect(() => { warRef.current = alliances; }, [alliances]);

  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date();
      const nextMon = new Date(now);
      const diff = ((8 - now.getDay()) % 7 || 7);
      nextMon.setDate(now.getDate() + diff);
      nextMon.setHours(20, 0, 0, 0);
      const secs = Math.max(0, Math.floor((nextMon.getTime() - now.getTime()) / 1000));
      const d = Math.floor(secs / 86400);
      const h = Math.floor((secs % 86400) / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      setWarTimer(`${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);

      setAlliances((prev) =>
        prev.map((a) => ({ ...a, warProgress: Math.max(-95, Math.min(95, a.warProgress + (Math.random() * 3 - 1.5))) }))
      );
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // botin de guerra (fuera de updaters): si tu clan domina el frente, paga cada ~2 min
  const lootRef = useRef(0);
  useEffect(() => {
    const iv = setInterval(() => {
      if (!save.allianceId) return;
      const mine = warRef.current.find((a) => a.id === save.allianceId);
      if (mine && mine.warProgress > 55 && Date.now() - lootRef.current > 120_000) {
        lootRef.current = Date.now();
        addCoins(150, "ALIANZA: botín de guerra");
        toast.success("GUERRA DE ALIANZAS · tu clan domina el frente · +150 mon de botín");
      }
    }, 15000);
    return () => clearInterval(iv);
  }, [save.allianceId, addCoins]);

  // chat vivo
  useEffect(() => {
    if (!save.allianceId && !save.ownName) return;
    const iv = setInterval(() => {
      if (Math.random() < 0.5) {
        const mine = save.allianceId;
        setSave((s) => ({
          ...s,
          chat: [...s.chat, { who: BOT_FIRST[Math.floor(Math.random() * BOT_FIRST.length)], text: CHAT_LINES[Math.floor(Math.random() * CHAT_LINES.length)] }].slice(-40),
        }));
        mineRef.current = !!mine;
      }
    }, 6000);
    return () => clearInterval(iv);
  }, [save.allianceId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [save.chat.length]);

  const persist = (s: Save) => {
    setSave(s);
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  };

  const createAlliance = () => {
    if (save.ownName) return;
    if (!spendCoins(500, "ALIANZA: fundar clan")) { toast.error("Fundar un clan cuesta 500 mon"); return; }
    const name = `${alias}'s Command`;
    persist({ ...save, ownName: name, tag: "CMD", allianceId: "own", chat: [{ who: "SISTEMA", text: `Clan fundado. Invita hasta 50 agentes y entra en la próxima guerra de alianzas.` }], warContribution: 0 });
    addXp(100);
    toast.success("ALIANZA FUNDADA · +100 xp · plaza para 50 agentes");
  };

  const join = (a: Alliance) => {
    if (save.allianceId || save.ownName) { toast.error("Ya perteneces a una alianza"); return; }
    persist({ ...save, allianceId: a.id, tag: a.tag, chat: [...save.chat, { who: "SISTEMA", text: `Te uniste a ${a.name} (${a.tag}). Cuota: 50 agentes.` }] });
    addXp(40);
    toast.success(`TE UNISTE A ${a.tag} · +40 xp`);
  };

  const leave = () => {
    persist({ ...save, allianceId: null, ownName: null, tag: null, chat: [] });
    toast("Saliste de la alianza");
  };

  const send = () => {
    const t = input.trim();
    if (!t) return;
    setInput("");
    persist({ ...save, chat: [...save.chat, { who: alias || "TÚ", text: t, mine: true }].slice(-40) });
    addXp(2);
  };

  const current = save.allianceId === "own"
    ? { id: "own", tag: save.tag ?? "CMD", name: save.ownName ?? "Mi Alianza", motto: "Fundada por ti", members: [{ name: alias || "TÚ", level, coins, online: true }, ...makeMembers(7)], wins: 0, elo: 1500, warProgress: save.warContribution }
    : alliances.find((a) => a.id === save.allianceId) ?? null;

  const rankList = [...alliances];
  if (current && save.allianceId === "own") rankList.push(current);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Alianzas"
        subtitle="Clanes de hasta 50 agentes · guerras de predicciones · ranking global"
        icon={<Flag className="w-4 h-4 text-violet-hud" />}
        color="violet"
        right={current && (
          <Button variant="outline" size="sm" onClick={leave} className="font-mono text-[9px] uppercase border-crisis-hud text-crisis">
            <LogOut className="w-3 h-3 mr-1" /> Salir
          </Button>
        )}
      />

      {/* MI ALIANZA / CREAR */}
      {!current ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="hud-panel p-4 flex flex-col items-center justify-center text-center gap-2">
            <Users className="w-10 h-10 text-violet-hud" />
            <div className="font-display text-sm font-bold tracking-widest uppercase">Fundar tu alianza</div>
            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xs">
              500 mon de canon. Tu clan entra automáticamente en la próxima Guerra de Alianzas (duelo de predicciones entre clanes: las monedas del perdedor alimentan el botín del ganador).
            </p>
            <Button onClick={createAlliance} variant="outline" className="font-mono text-[10px] uppercase tracking-widest border-violet-hud text-violet-hud">
              <Flag className="w-3.5 h-3.5 mr-1" /> Fundar (500 mon)
            </Button>
          </div>
          <div className="hud-panel p-3">
            <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-2">Alianzas abiertas · toca para unirte</div>
            <div className="space-y-1.5">
              {alliances.map((a) => (
                <button key={a.id} onClick={() => join(a)} className="w-full flex items-center gap-2 px-2 py-2 border border-border hover:border-violet-hud vg-transition text-left">
                  <span className="px-1.5 py-0.5 bg-violet-hud border border-violet-hud text-violet-hud font-mono text-[9px] font-bold">{a.tag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-tech text-xs font-bold truncate">{a.name}</div>
                    <div className="font-mono text-[8px] text-muted-foreground truncate">{a.motto}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-tech text-[11px] font-bold text-electric tabular-nums">ELO {a.elo}</div>
                    <div className="font-mono text-[8px] text-muted-foreground">{a.members.length}/50 · {a.wins} guerras</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* CABECERA DEL CLAN + GUERRA */}
          <div className="hud-panel neon-border p-4">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="w-12 h-12 hud-corner border-violet-hud bg-violet-hud flex items-center justify-center font-mono font-black text-violet-hud">{current.tag}</div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-lg font-black tracking-wide truncate">{current.name}</div>
                <div className="font-mono text-[9px] text-muted-foreground">{current.motto} · ELO {current.elo} · {current.wins} guerras ganadas · {current.members.length}/50 agentes</div>
              </div>
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber" />
                <span className="font-tech text-sm font-bold text-amber tabular-nums">#{rankList.findIndex((x) => x.id === current.id) + 1 || "—"}</span>
              </div>
            </div>

            {/* GUERRA DE ALIANZAS */}
            <div className="border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-crisis">
                  <Swords className="w-3.5 h-3.5" /> Guerra de alianzas · vs {rankList.filter((x) => x.id !== current.id).sort((a, b) => b.elo - a.elo)[0]?.tag ?? "EJE"}
                </div>
                <span className="font-tech text-xs text-muted-foreground tabular-nums">resuelve en {warTimer}</span>
              </div>
              <div className="relative h-6 bg-secondary border border-border overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 bg-neon-hud border-r-2 border-neon"
                  animate={{ width: `${50 + current.warProgress / 2}%` }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-2 font-mono text-[9px] font-bold">
                  <span className="text-neon">{current.tag} · {50 + Math.round(current.warProgress / 2)}%</span>
                  <span className="text-crisis">{50 - Math.round(current.warProgress / 2)}% · RIVAL</span>
                </div>
              </div>
              <div className="mt-1.5 font-mono text-[8px] text-muted-foreground">
                Cada predicción acertada, crisis ganada y minijuego suma al frente de tu clan. Las monedas del perdedor van al botín del ganador.
              </div>
            </div>
          </div>

          {/* CHAT + MIEMBROS */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3">
            <div className="hud-panel p-3 flex flex-col" style={{ minHeight: 300 }}>
              <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-2">Chat privado del clan</div>
              <div className="flex-1 overflow-y-auto thin-scroll space-y-1.5 max-h-64 pr-1">
                {save.chat.map((m, i) => (
                  <div key={i} className={cn("max-w-[85%] px-2 py-1 border text-[11px] leading-snug", m.mine ? "ml-auto border-violet-hud bg-violet-hud" : "border-border bg-secondary/50")}>
                    <span className={cn("font-mono text-[8px] font-bold tracking-widest block", m.mine ? "text-violet-hud" : m.who === "SISTEMA" ? "text-neon" : "text-electric")}>{m.who}</span>
                    {m.text}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-1.5 mt-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Mensaje al clan..."
                  className="flex-1 bg-secondary/60 border border-border px-2 py-1.5 font-mono text-[11px] outline-none focus:border-violet-hud"
                />
                <Button variant="outline" size="sm" onClick={send} className="border-violet-hud text-violet-hud">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="hud-panel p-3">
              <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-2">Miembros ({current.members.length})</div>
              <div className="space-y-1 max-h-64 overflow-y-auto thin-scroll">
                {current.members.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 py-0.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", m.online ? "bg-neon" : "bg-muted-foreground/40")} />
                    <span className="font-mono text-[10px] truncate flex-1">{m.name}</span>
                    <span className="font-tech text-[10px] text-amber tabular-nums">N{m.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* RANKING GLOBAL DE CLANES */}
      <div className="hud-panel p-3">
        <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
          <Trophy className="w-3 h-3" /> Ranking global de alianzas
        </div>
        {[...rankList].sort((a, b) => b.elo - a.elo).map((a, i) => (
          <div key={a.id} className={cn("flex items-center gap-2 py-1 border-b border-border/40 last:border-0", current?.id === a.id && "text-violet-hud")}>
            <span className="font-tech text-[11px] w-5 text-muted-foreground">{i + 1}</span>
            <span className="px-1 py-0.5 border border-violet-hud text-violet-hud font-mono text-[8px] font-bold">{a.tag}</span>
            <span className="font-mono text-[10px] flex-1 truncate">{a.name}</span>
            <span className="font-tech text-[10px] text-electric tabular-nums">{a.elo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
