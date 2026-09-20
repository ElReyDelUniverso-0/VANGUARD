"use client";

// v13 — RADAR DE DESINFORMACION: % de veracidad por noticia, voto comunitario
// REAL/FAKE, ranking de medios; y CONEXIONES OCULTAS: la IA detecta patrones
// entre eventos y la comunidad apuesta monedas a si estan relacionados.

import { useState, useEffect, useMemo, useRef } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, BadgeCheck, Link2, BrainCircuit, TrendingUp, Vote, Coins } from "lucide-react";
import { useGameStore } from "@/lib/game-store";

// ====== DATOS ======
interface NewsVeracity {
  id: string;
  title: string;
  source: string;
  veracity: number; // 0-100 calculado por "IA" (fuente + consistencia + coherencia)
  ago: string;
  flags: string[]; // señales detectadas
}

const NEWS_FEED: NewsVeracity[] = [
  { id: "nf-1", title: "EEUU despliega dos destructores adicionales cerca del Mar Rojo", source: "Reuters", veracity: 96, ago: "hace 40m", flags: ["Fuente agencia primaria", "Foto consistente", "2+ agencias confirman"] },
  { id: "nf-2", title: "IRAN declara cierre TOTAL del Golfo a partir de mañana", source: "Canal Telegram anónimo", veracity: 22, ago: "hace 1h", flags: ["Sin fuente primaria", "Sin evidencia visual", "Exagera magnitud"] },
  { id: "nf-3", title: "Finlandia detecta jamming GPS masivo en su frontera este", source: "BBC", veracity: 92, ago: "hace 2h", flags: ["Fuente institucional", "Datos de aviación civil"] },
  { id: "nf-4", title: "Video: 'columna de 500 tanques chinos hacia la costa'", source: "TikTok viral", veracity: 14, ago: "hace 3h", flags: ["Geolocalización falsa", "Metraje reciclado de 2021", "Sin fecha verificable"] },
  { id: "nf-5", title: "La UE aprueba paquete de sanciones nº14 contra Rusia", source: "AP", veracity: 97, ago: "hace 4h", flags: ["Fuente primaria", "Documento oficial"] },
  { id: "nf-6", title: "Filtración: 'otan planea base secreta en el Sahel'", source: "Blog geopolítico", veracity: 45, ago: "hace 5h", flags: ["Fuente única", "Imposible verificar", "Plausible pero sin prueba"] },
  { id: "nf-7", title: "Ucrania usa nuevos drones de largo alcance contra refinerías", source: "The Guardian", veracity: 88, ago: "hace 6h", flags: ["Imágenes satelitales", "Confirmación parcial"] },
  { id: "nf-8", title: "Corea del Norte prepara 7ª prueba nuclear para esta semana", source: "Al Jazeera", veracity: 74, ago: "hace 8h", flags: ["Fuente de inteligencia", "No confirmado oficialmente"] },
  { id: "nf-9", title: "'Zelenski compra mansión de 35M en Miami'", source: "Cadena pro-rusa", veracity: 8, ago: "hace 10h", flags: ["Narrativa conocida de desinformación", "Sin registros", "Fact-check desmiente"] },
  { id: "nf-10", title: "Taiwán amplía el servicio militar obligatorio a 12 meses", source: "DW", veracity: 95, ago: "hace 12h", flags: ["Fuente institucional", "Anuncio oficial"] },
];

const MEDIA_RANKING = [
  { name: "Reuters", score: 96, cor: "text-neon" },
  { name: "AP", score: 95, cor: "text-neon" },
  { name: "BBC", score: 93, cor: "text-neon" },
  { name: "The Guardian", score: 89, cor: "text-electric" },
  { name: "DW", score: 88, cor: "text-electric" },
  { name: "Al Jazeera", score: 84, cor: "text-electric" },
  { name: "CNN", score: 81, cor: "text-amber" },
  { name: "NY Times", score: 87, cor: "text-electric" },
  { name: "France 24", score: 86, cor: "text-electric" },
  { name: "Cadenas Telegram anónimas", score: 15, cor: "text-crisis" },
  { name: "Blogs no verificados", score: 24, cor: "text-crisis" },
];

interface Connection {
  id: string;
  a: string;
  b: string;
  similarity: number;
  why: string;
  betsRelated: number;
  betsNot: number;
  resolvesAt: number;
  myBet?: "RELACIONADOS" | "COINCIDENCIA";
  betAmount?: number;
}

const CONNECTION_POOL: Omit<Connection, "betsRelated" | "betsNot" | "resolvesAt">[] = [
  { id: "cx-1", a: "Corte del cable C-Lion1 en el Báltico", b: "Aumento de la flota sombra rusa de petroleros", similarity: 87, why: "Los 4 cortes de cables recientes coinciden con rutas de buques sombra con anclas arrastradas. Patrón de navegación anómala en 3 de 4 casos." },
  { id: "cx-2", a: "Jamming GPS en el Báltico", b: "Incidentes de drones no identificados sobre bases", similarity: 78, why: "Correlación temporal: cada episodio de jamming se sigue de avistamientos de drones en un radio de 200km en 72h." },
  { id: "cx-3", a: "Compras de drone-munición por Iran", b: "Ataques a refinerías ucranianas", similarity: 82, why: "Serial numbers de restos recuperados coinciden con lotes exportados en los últimos 2 meses." },
  { id: "cx-4", a: "Maniobras navales conjuntas China-Rusia", b: "Incursiones aéreas conjuntas cerca de Japón/Corea", similarity: 69, why: "Cada ejercicio bilateral va seguido de patrullas conjuntas de bombarderos en la misma semana (7 de 8 veces desde 2019)." },
  { id: "cx-5", a: "Escasez global de municiones 155mm", b: "Expansión de fábricas de artillería en 6 países", similarity: 74, why: "Contratos de defensa detectados via licitaciones públicas: 5 países ampliaron capacidad el mismo trimestre." },
];

const LS_KEY = "vanguard-radar-v13";
interface RadarSave { votes: Record<string, "REAL" | "FAKE">; }
function loadSave(): RadarSave {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "") as RadarSave; } catch { return { votes: {} }; }
}

export function RadarPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const addXp = useGameStore((s) => s.addXp);
  const [tab, setTab] = useState<"desinfo" | "conexiones">("desinfo");
  const [save, setSave] = useState<RadarSave>({ votes: {} });
  const [connections, setConnections] = useState<Connection[]>([]);
  const resolvedRef = useRef<Set<string>>(new Set());

  useEffect(() => setSave(loadSave()), []);
  useEffect(() => {
    setConnections(
      CONNECTION_POOL.map((c) => ({
        ...c,
        betsRelated: 120 + Math.floor(Math.random() * 400),
        betsNot: 80 + Math.floor(Math.random() * 300),
        resolvesAt: Date.now() + (70 + Math.floor(Math.random() * 80)) * 1000,
      }))
    );
  }, []);

  // liquidacion de conexiones FUERA de updaters: consenso >= 65% paga x2 a "relacionados"
  const connRef = useRef(connections);
  useEffect(() => { connRef.current = connections; }, [connections]);

  useEffect(() => {
    const iv = setInterval(() => {
      const due = connRef.current.filter((c) => !resolvedRef.current.has(c.id) && Date.now() >= c.resolvesAt);
      if (due.length === 0) return;
      let payout = 0;
      const done = new Set<string>();
      for (const c of due) {
        resolvedRef.current.add(c.id);
        done.add(c.id);
        const total = c.betsRelated + c.betsNot;
        const agreePct = (c.betsRelated / total) * 100;
        if (c.myBet === "RELACIONADOS" && agreePct >= 65) payout += (c.betAmount ?? 0) * 2;
        else if (c.myBet === "COINCIDENCIA" && agreePct < 65) payout += (c.betAmount ?? 0) * 2;
      }
      setConnections((prev) => prev.filter((c) => !done.has(c.id)));
      if (payout > 0) {
        addCoins(payout, "RADAR: teoría acertada");
        addXp(40);
        toast.success(`TEORÍA PREMIADA · +${payout} mon · +40 xp`);
      }
    }, 2000);
    return () => clearInterval(iv);
  }, [addCoins, addXp]);

  const vote = (id: string, v: "REAL" | "FAKE", veracity: number) => {
    if (save.votes[id]) return;
    const ns = { votes: { ...save.votes, [id]: v } };
    setSave(ns);
    localStorage.setItem(LS_KEY, JSON.stringify(ns));
    addCoins(10, "RADAR: veredicto comunitario");
    addXp(5);
    const agree = (v === "REAL" && veracity >= 60) || (v === "FAKE" && veracity < 60);
    if (agree) toast.success("Veredicto alineado con la IA · +10 mon");
    else toast("Veredicto registrado — la IA discrepa, interesante teoría");
  };

  const bet = (c: Connection, side: "RELACIONADOS" | "COINCIDENCIA", amount: number) => {
    if (c.myBet) return;
    if (!spendCoins(amount, "RADAR: apuesta en teoría")) { toast.error("Monedas insuficientes"); return; }
    setConnections((prev) =>
      prev.map((x) =>
        x.id === c.id
          ? { ...x, myBet: side, betAmount: amount, betsRelated: side === "RELACIONADOS" ? x.betsRelated + amount : x.betsRelated, betsNot: side === "COINCIDENCIA" ? x.betsNot + amount : x.betsNot }
          : x
      )
    );
    toast(`Apuesta de ${amount} mon en "${side.toLowerCase()}" · se liquida por consenso`);
  };

  const extend = (c: Connection, side: "RELACIONADOS" | "COINCIDENCIA") => bet(c, side, c.betAmount ? Math.min(500, c.betAmount * 2) : 100);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Radar de Desinformación"
        subtitle="Veracidad por IA + veredicto de la comunidad + patrones ocultos"
        icon={<ShieldCheck className="w-4 h-4 text-neon" />}
        color="green"
        right={
          <div className="flex border border-border">
            <button onClick={() => setTab("desinfo")} className={cn("px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest vg-transition", tab === "desinfo" ? "bg-neon-hud text-neon" : "text-muted-foreground")}>
              Desinfo
            </button>
            <button onClick={() => setTab("conexiones")} className={cn("px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest vg-transition flex items-center gap-1", tab === "conexiones" ? "bg-electric-hud text-electric" : "text-muted-foreground")}>
              <Link2 className="w-3 h-3" /> Conexiones
            </button>
          </div>
        }
      />

      <AnimatePresence mode="wait">
        {tab === "desinfo" ? (
          <motion.div key="d" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3">
            {/* FEED */}
            <div className="space-y-2">
              {NEWS_FEED.map((n) => {
                const my = save.votes[n.id];
                const badge = n.veracity >= 70
                  ? { cls: "text-neon border-neon-hud bg-neon-hud", icon: <BadgeCheck className="w-3 h-3" />, label: "VERIFICADA" }
                  : n.veracity >= 40
                  ? { cls: "text-amber border-amber-hud bg-amber-hud", icon: <ShieldAlert className="w-3 h-3" />, label: "DUDOSA" }
                  : { cls: "text-crisis border-crisis-hud bg-crisis-hud", icon: <ShieldAlert className="w-3 h-3" />, label: "NO VERIFICADA" };
                return (
                  <div key={n.id} className={cn("hud-panel p-3", n.veracity >= 70 ? "" : n.veracity < 40 ? "sombra-crisis border-crisis-hud" : "")}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold leading-snug mb-1">{n.title}</div>
                        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[8px] text-muted-foreground uppercase tracking-wide">
                          <span className={cn("px-1 py-0.5 border", n.veracity >= 70 ? "text-neon border-neon-hud" : "text-amber border-amber-hud")}>{n.source}</span>
                          <span>{n.ago}</span>
                        </div>
                      </div>
                      <div className={cn("flex items-center gap-1 px-1.5 py-1 border font-mono text-[9px] font-bold flex-shrink-0", badge.cls)}>
                        {badge.icon} {badge.label}
                      </div>
                    </div>
                    {/* barra de credibilidad */}
                    <div className="mt-2">
                      <div className="flex justify-between font-mono text-[8px] text-muted-foreground uppercase mb-0.5">
                        <span>Credibilidad IA</span>
                        <span className={cn("font-bold", n.veracity >= 70 ? "text-neon" : n.veracity >= 40 ? "text-amber" : "text-crisis")}>{n.veracity}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary overflow-hidden">
                        <div className="h-full" style={{ width: `${n.veracity}%`, background: n.veracity >= 70 ? "#00FF87" : n.veracity >= 40 ? "#FFD60A" : "#FF3B30" }} />
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {n.flags.map((f, i) => (
                          <span key={i} className="font-mono text-[8px] text-muted-foreground border border-border px-1 py-0.5">{f}</span>
                        ))}
                      </div>
                    </div>
                    {/* voto comunitario */}
                    <div className="mt-2 flex items-center gap-2">
                      {my ? (
                        <span className="font-mono text-[9px] text-muted-foreground">TU VOTO: <span className={cn("font-bold", my === "REAL" ? "text-neon" : "text-crisis")}>{my}</span></span>
                      ) : (
                        <>
                          <span className="font-mono text-[9px] text-muted-foreground">¿Real o fake?</span>
                          <Button variant="outline" size="sm" onClick={() => vote(n.id, "REAL", n.veracity)} className="font-mono text-[9px] uppercase border-neon-hud text-neon h-6 px-2">Real +10</Button>
                          <Button variant="outline" size="sm" onClick={() => vote(n.id, "FAKE", n.veracity)} className="font-mono text-[9px] uppercase border-crisis-hud text-crisis h-6 px-2">Fake +10</Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RANKING DE MEDIOS */}
            <div className="hud-panel p-3 h-max lg:sticky lg:top-32">
              <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" /> Ranking de medios
              </div>
              {[...MEDIA_RANKING].sort((a, b) => b.score - a.score).map((m, i) => (
                <div key={m.name} className="flex items-center gap-2 py-1 border-b border-border/40 last:border-0">
                  <span className="font-tech text-[10px] w-4 text-muted-foreground">{i + 1}</span>
                  <span className="font-mono text-[10px] flex-1 truncate">{m.name}</span>
                  <div className="w-14 h-1 bg-secondary">
                    <div className="h-full" style={{ width: `${m.score}%`, background: m.score >= 85 ? "#00FF87" : m.score >= 60 ? "#1E90FF" : "#FF3B30" }} />
                  </div>
                  <span className={cn("font-tech text-[11px] font-bold tabular-nums w-8 text-right", m.cor)}>{m.score}</span>
                </div>
              ))}
              <div className="mt-2 font-mono text-[8px] text-muted-foreground leading-relaxed">
                La IA combina fuente primaria, consistencia entre agencias y evidencia visual para calcular el % de veracidad.
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="c" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
            <div className="hud-panel p-3 flex items-center gap-2 border-electric-hud">
              <BrainCircuit className="w-5 h-5 text-electric flex-shrink-0" />
              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                La IA compara miles de eventos y señala patrones. La comunidad debate y apuesta: si el consenso
                supera el 65% de "relacionados" cuando venza el timer, los que apostaron a la conexión ganan x2.
              </p>
            </div>
            {connections.length === 0 && (
              <div className="hud-panel p-4 text-center font-mono text-[10px] text-muted-foreground uppercase">Teorías liquidadas — volviendo a escanear el mundo...</div>
            )}
            {connections.map((c) => {
              const total = c.betsRelated + c.betsNot;
              const agreePct = Math.round((c.betsRelated / total) * 100);
              const secs = Math.max(0, Math.round((c.resolvesAt - Date.now()) / 1000));
              return (
                <div key={c.id} className="hud-panel neon-border p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[9px] text-electric tracking-widest uppercase flex items-center gap-1">
                      <BrainCircuit className="w-3 h-3" /> IA encontró una conexión
                    </span>
                    <span className="font-tech text-sm font-bold tabular-nums text-electric">{c.similarity}% similitud</span>
                  </div>
                  <div className="font-tech text-sm font-bold leading-snug mb-1">
                    {c.a} <Link2 className="inline w-3.5 h-3.5 text-electric mx-1" /> {c.b}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{c.why}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1.5 bg-secondary overflow-hidden flex">
                      <div className="h-full bg-electric" style={{ width: `${agreePct}%` }} />
                      <div className="h-full bg-crisis-hud" style={{ width: `${100 - agreePct}%` }} />
                    </div>
                    <span className="font-mono text-[9px] text-muted-foreground tabular-nums">{agreePct}% relacionados</span>
                    <span className="font-tech text-[11px] font-bold text-amber tabular-nums">{secs}s</span>
                  </div>
                  {!c.myBet ? (
                    <div className="flex flex-wrap gap-1.5">
                      {[50, 100, 250].map((amt) => (
                        <Button key={amt} variant="outline" size="sm" onClick={() => bet(c, "RELACIONADOS", amt)} className="font-mono text-[9px] uppercase border-electric-hud text-electric">
                          <Coins className="w-3 h-3 mr-1" /> {amt} conectados
                        </Button>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => bet(c, "COINCIDENCIA", 100)} className="font-mono text-[9px] uppercase border-crisis-hud text-crisis">
                        <Vote className="w-3 h-3 mr-1" /> 100 casualidad
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 font-mono text-[9px]">
                      <span className="text-electric">TU APUESTA: {c.myBet} · {c.betAmount} mon</span>
                      <Button variant="outline" size="sm" onClick={() => extend(c, c.myBet!)} className="font-mono text-[9px] uppercase h-6">
                        Doblar apuesta
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
