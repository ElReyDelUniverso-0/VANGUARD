"use client";

// v13 — SIMULADOR DE GUERRAS: pais A vs pais B con estadisticas reales,
// configuracion avanzada, simulacion animada en el mapa, eventos aleatorios,
// resultado con probabilidad/bajas/costo e hipotesis "¿Y SI...?".

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Play, RotateCcw, Share2, Shuffle, Users, Plane, Ship, Rocket, Radiation, Banknote, ShieldHalf, Mountain, BrainCircuit, Dice5 } from "lucide-react";
import { useGameStore } from "@/lib/game-store";

interface WarPower {
  id: string;
  name: string;
  code: string; // ISO para bandera
  army: number; // miles de efectivos activos
  air: number; // aeronaves
  naval: number; // buques mayores
  missiles: number; // arsenal de misiles
  nuclear: boolean;
  budget: number; // miles de millones USD
  defense: number; // 0-10 defensa antimisiles
  alliances: string[];
  geo: number; // 0-10 ventaja geografica
  exp: number; // 0-10 experiencia reciente
}

const POWERS: WarPower[] = [
  { id: "us", name: "Estados Unidos", code: "US", army: 1330, air: 13200, naval: 490, missiles: 400, nuclear: true, budget: 916, defense: 9, alliances: ["OTAN", "AUKUS"], geo: 8, exp: 8 },
  { id: "ru", name: "Rusia", code: "RU", army: 1320, air: 4200, naval: 320, missiles: 580, nuclear: true, budget: 109, defense: 7, alliances: ["CSTO"], geo: 7, exp: 9 },
  { id: "cn", name: "China", code: "CN", army: 2035, air: 3300, naval: 370, missiles: 350, nuclear: true, budget: 296, defense: 7, alliances: ["SCO"], geo: 7, exp: 4 },
  { id: "in", name: "India", code: "IN", army: 1450, air: 2200, naval: 150, missiles: 180, nuclear: true, budget: 83, defense: 5, alliances: [], geo: 7, exp: 6 },
  { id: "fr", name: "Francia", code: "FR", army: 205, air: 1050, naval: 100, missiles: 90, nuclear: true, budget: 61, defense: 7, alliances: ["OTAN", "UE"], geo: 6, exp: 7 },
  { id: "gb", name: "Reino Unido", code: "GB", army: 185, air: 700, naval: 75, missiles: 80, nuclear: true, budget: 74, defense: 7, alliances: ["OTAN", "AUKUS"], geo: 6, exp: 7 },
  { id: "tr", name: "Turquia", code: "TR", army: 425, air: 1050, naval: 60, missiles: 70, nuclear: false, budget: 15, defense: 4, alliances: ["OTAN"], geo: 7, exp: 8 },
  { id: "il", name: "Israel", code: "IL", army: 170, air: 600, naval: 40, missiles: 90, nuclear: true, budget: 27, defense: 10, alliances: [], geo: 4, exp: 9 },
  { id: "ir", name: "Iran", code: "IR", army: 610, air: 350, naval: 90, missiles: 200, nuclear: false, budget: 10, defense: 4, alliances: ["Eje"], geo: 6, exp: 7 },
  { id: "kr", name: "Corea del Sur", code: "KR", army: 555, air: 1600, naval: 90, missiles: 100, nuclear: false, budget: 47, defense: 8, alliances: ["OTAN-like"], geo: 4, exp: 5 },
  { id: "kp", name: "Corea del Norte", code: "KP", army: 1280, air: 950, naval: 60, missiles: 220, nuclear: true, budget: 6, defense: 2, alliances: [], geo: 6, exp: 3 },
  { id: "pk", name: "Pakistan", code: "PK", army: 654, air: 1400, naval: 40, missiles: 140, nuclear: true, budget: 10, defense: 3, alliances: [], geo: 6, exp: 7 },
  { id: "de", name: "Alemania", code: "DE", army: 181, air: 700, naval: 65, missiles: 60, nuclear: false, budget: 66, defense: 5, alliances: ["OTAN", "UE"], geo: 6, exp: 3 },
  { id: "ua", name: "Ucrania", code: "UA", army: 900, air: 320, naval: 20, missiles: 120, nuclear: false, budget: 64, defense: 5, alliances: ["UE (candidata)"], geo: 6, exp: 10 },
  { id: "eg", name: "Egipto", code: "EG", army: 440, air: 1050, naval: 50, missiles: 60, nuclear: false, budget: 12, defense: 4, alliances: [], geo: 6, exp: 6 },
  { id: "br", name: "Brasil", code: "BR", army: 360, air: 680, naval: 70, missiles: 40, nuclear: false, budget: 22, defense: 3, alliances: [], geo: 8, exp: 2 },
];

const WAR_TYPES = ["TOTAL", "FRONTERIZO", "NAVAL", "AEREO", "NUCLEAR"] as const;
const YEARS = ["ACTUAL", "HISTORICO (1990)", "FUTURO 2050", "FUTURO 2100"] as const;
const ALLY_OPTIONS = ["NINGUNA", "OTAN", "RUSIA", "CHINA"] as const;
const SPEEDS = [1, 5, 10] as const;

interface SimState {
  day: number;
  front: number; // -100 (gana B) .. +100 (gana A)
  casualtiesA: number;
  casualtiesB: number;
  cost: number; // miles de millones
  events: string[];
  winner: "A" | "B" | null;
  winProb: number; // % del ganador
}

interface WildcardEvent { text: string; bias: number; }
const WILDCARDS: WildcardEvent[] = [
  { text: "Crisis politica interna debilita el frente", bias: -8 },
  { text: "Intervencion diplomatica de la ONU — tregua parcial", bias: 4 },
  { text: "Golpe de estado sorpresa en la retaguardia", bias: -12 },
  { text: "Alianza inesperada aporta inteligencia satelital", bias: 8 },
  { text: "Escasez de municiones en la linea principal", bias: -6 },
  { text: "Ciberataque paraliza la logistica enemiga", bias: 10 },
  { text: "Envio secreto de drones aliados", bias: 7 },
  { text: "Bloqueo economico aprieta al bando perdedor", bias: 5 },
];

function powerScore(p: WarPower, type: (typeof WAR_TYPES)[number], year: string, ally: string): number {
  let s =
    Math.log10(p.army * 1000) * 14 +
    Math.log10(p.air + 10) * 10 +
    Math.log10(p.naval + 10) * 8 +
    Math.log10(p.missiles + 10) * 8 +
    Math.log10(p.budget * 10) * 12 +
    p.defense * 2.2 + p.exp * 2.2 + p.geo * 1.8 +
    (p.nuclear ? 10 : 0);
  if (type === "AEREO") s += Math.log10(p.air) * 8;
  if (type === "NAVAL") s += Math.log10(p.naval + 10) * 14;
  if (type === "NUCLEAR") s += p.nuclear ? 60 : -30;
  if (type === "FRONTERIZO") s += p.exp * 3;
  if (year === "FUTURO 2050") s += p.budget > 200 ? 18 : p.budget > 60 ? 8 : 0;
  if (year === "FUTURO 2100") s += p.budget > 200 ? 30 : 4;
  if (year === "HISTORICO (1990)") s += p.id === "ru" || p.id === "us" ? 12 : 0;
  if (ally !== "NINGUNA" && p.alliances.some((a) => a.includes(ally.slice(0, 4)))) s += 14;
  else if (ally === "RUSIA" && p.id !== "ru") s -= 2;
  return s;
}

export function WarsimPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const [a, setA] = useState<WarPower | null>(null);
  const [b, setB] = useState<WarPower | null>(null);
  const [search, setSearch] = useState("");
  const [warType, setWarType] = useState<(typeof WAR_TYPES)[number]>("TOTAL");
  const [year, setYear] = useState<string>("ACTUAL");
  const [allyA, setAllyA] = useState<string>("NINGUNA");
  const [allyB, setAllyB] = useState<string>("NINGUNA");
  const [wildcards, setWildcards] = useState(true);
  const [speed, setSpeed] = useState<number>(5);
  const [sim, setSim] = useState<SimState | null>(null);
  const [randomSeed, setRandomSeed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? POWERS.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)) : POWERS;
  }, [search]);

  const pick = (p: WarPower) => {
    if (!a || (a && b)) { setA(p); setB(null); }
    else if (p.id === a.id) return;
    else setB(p);
    setSearch("");
    setSim(null);
  };
  const randomMatch = () => {
    const shuffled = [...POWERS].sort(() => Math.random() - 0.5);
    setA(shuffled[0]); setB(shuffled[1]); setSim(null); setRandomSeed((s) => s + 1);
  };

  const scoreA = a ? powerScore(a, warType, year, allyA) : 0;
  const scoreB = b ? powerScore(b, warType, year, allyB) : 0;
  const probA = useMemo(() => {
    if (!a || !b) return 50;
    const diff = scoreA - scoreB;
    const base = 50 + (diff / (Math.abs(scoreA) + Math.abs(scoreB))) * 130;
    return Math.max(4, Math.min(96, Math.round(base)));
  }, [a, b, scoreA, scoreB]);

  const startSim = () => {
    if (!a || !b) { toast.error("Elige dos países para simular"); return; }
    setSim({ day: 0, front: 0, casualtiesA: 0, casualtiesB: 0, cost: 0, events: [], winner: null, winProb: probA });
  };

  const simRunning = !!sim && sim.winner === null;

  // motor de simulacion (solo se (re)crea cuando arranca/termina/cambia config)
  useEffect(() => {
    if (!simRunning || !a || !b) return;
    const tickMs = 900 / speed;
    timerRef.current = setInterval(() => {
      setSim((prev) => {
        if (!prev || prev.winner) return prev;
        const day = prev.day + (warType === "NUCLEAR" ? 3 : 8);
        let drift = (probA - 50) * 0.035 + (Math.random() * 8 - 4);
        let events = prev.events;
        if (wildcards && Math.random() < 0.22) {
          const w = WILDCARDS[Math.floor(Math.random() * WILDCARDS.length)];
          drift += w.bias * (Math.random() < 0.5 ? 1 : -1) * 0.45;
          events = [`D${day} · ${w.text}`, ...events].slice(0, 40);
        }
        if (Math.random() < 0.1) {
          const flavor = ["Cuerpo de ejercitos reforzado en el flanco norte", "Ofensiva aerea nocturna sobre la retaguardia", "Combate naval en aguas cercanas", "Cambio de mando en el frente este", "Ambas partes reportan victorias simultaneas"];
          events = [`D${day} · ${flavor[Math.floor(Math.random() * flavor.length)]}`, ...events].slice(0, 40);
        }
        const front = Math.max(-100, Math.min(100, prev.front + drift));
        const scale = warType === "TOTAL" || warType === "NUCLEAR" ? 3.4 : 1;
        const casA = prev.casualtiesA + Math.round(Math.max(0, -drift) * 120 * scale + Math.random() * 90 * scale);
        const casB = prev.casualtiesB + Math.round(Math.max(0, drift) * 120 * scale + Math.random() * 90 * scale);
        const cost = prev.cost + (a.budget + b.budget) * 0.0018 * scale;
        const over = Math.abs(front) >= 88 || day > 1400;
        const winner: "A" | "B" | null = over ? (front > 0 ? "A" : front < 0 ? "B" : Math.random() < probA / 100 ? "A" : "B") : null;
        return { day, front, casualtiesA: casA, casualtiesB: casB, cost, events, winner, winProb: probA };
      });
    }, tickMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simRunning, probA, speed, warType, wildcards, addCoins, addXp]);

  // recompensa al terminar (FUERA del updater para no hacer setState en render)
  const rewardedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sim?.winner || !a || !b) return;
    const key = `${a.id}-${b.id}-${sim.day}`;
    if (rewardedRef.current === key) return;
    rewardedRef.current = key;
    const won = sim.winner === "A";
    const prize = won ? 250 : 60;
    addCoins(prize, "SIMULADOR DE GUERRAS: analisis completado");
    addXp(60);
    toast.success(`Análisis completado · +${prize} mon · +60 xp`);
  }, [sim?.winner, sim?.day, a, b, addCoins, addXp]);

  // ¿Y SI...? alternativas al terminar
  const alternatives = useMemo(() => {
    if (!sim?.winner || !a || !b) return [];
    const wName = sim.winner === "A" ? a.name : b.name;
    const lName = sim.winner === "A" ? b.name : a.name;
    return [
      `¿Y si ${lName} hubiera movilizado reservas antes? La ofensiva inicial habría durado 2 semanas más y ${wName} habría pagado un 30% más de bajas.`,
      `¿Y si la OTAN/China hubiera intervenido directamente? El conflicto escalaba a guerra de coaliciones con riesgo nuclear en ${warType === "NUCLEAR" ? "horas" : "meses"}.`,
      `¿Y si hubiera habido embargo total de petróleo? La economía de ${lName} caía 8% por trimestre y ${wName} negociaba una paz amistosa.`,
      `¿Y si un ciberataque hubiera tumbado los mandos y control? La primera semana habría sido de caos táctico sin avance definitivo.`,
    ];
  }, [sim?.winner, a, b, warType]);

  const share = useCallback(() => {
    if (!sim?.winner || !a || !b) return;
    const wName = sim.winner === "A" ? a.name : b.name;
    const text = `⚔️ SIMULACIÓN VANGUARD: ${a.name} vs ${b.name} (${warType}) → GANA ${wName} con ${Math.max(sim.winProb, 100 - sim.winProb)}% · ${sim.day} días · ${(sim.casualtiesA + sim.casualtiesB).toLocaleString()} bajas estimadas · $${sim.cost.toFixed(0)}B`;
    navigator.clipboard?.writeText(text).then(() => toast.success("Resultado copiado para compartir"), () => toast.error("No se pudo copiar"));
  }, [sim, a, b, warType]);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Simulador de Guerras"
        subtitle="Enfrenta potencias con datos reales y descubre el desenlace"
        icon={<Swords className="w-4 h-4 text-red-hud" />}
        color="red"
        right={
          <Button variant="outline" size="sm" onClick={randomMatch} className="font-mono text-[10px] uppercase tracking-widest border-electric-hud text-electric">
            <Shuffle className="w-3.5 h-3.5 mr-1" /> Aleatorio
          </Button>
        }
      />

      {/* SELECCION DE PAISES */}
      <div className="hud-panel p-3">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar país (autocompletado)..."
            className="w-full bg-secondary/60 border border-border px-3 py-2 font-mono text-xs outline-none focus:border-electric-hud"
          />
          {search && (
            <div className="absolute z-30 left-0 right-0 mt-1 hud-panel max-h-44 overflow-y-auto thin-scroll">
              {filtered.map((p) => (
                <button key={p.id} onClick={() => pick(p)} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-electric-hud text-left">
                  <FlagBadge code={p.code} />
                  <span className="font-mono text-[11px]">{p.name}</span>
                  <span className="ml-auto font-tech text-[10px] text-muted-foreground">{p.army}K tropas · ${p.budget}B</span>
                </button>
              ))}
              {filtered.length === 0 && <div className="px-3 py-2 font-mono text-[10px] text-muted-foreground">Sin resultados</div>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <PowerCard power={a} side="A" onClear={() => setA(null)} />
          <PowerCard power={b} side="B" onClear={() => setB(null)} />
        </div>
      </div>

      {a && b && (
        <>
          {/* COMPARATIVA DE ESTADISTICAS */}
          <div className="hud-panel p-3">
            <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-2">Comparativa militar</div>
            <StatRow icon={<Users className="w-3.5 h-3.5" />} label="Ejército activo" va={a.army} vb={b.army} fa={`${a.army}K`} fb={`${b.army}K`} ca="#1E90FF" cb="#FF3B30" />
            <StatRow icon={<Plane className="w-3.5 h-3.5" />} label="Flota aérea" va={a.air} vb={b.air} fa={`${a.air}`} fb={`${b.air}`} ca="#1E90FF" cb="#FF3B30" />
            <StatRow icon={<Ship className="w-3.5 h-3.5" />} label="Flota naval" va={a.naval} vb={b.naval} fa={`${a.naval}`} fb={`${b.naval}`} ca="#1E90FF" cb="#FF3B30" />
            <StatRow icon={<Rocket className="w-3.5 h-3.5" />} label="Misiles" va={a.missiles} vb={b.missiles} fa={`${a.missiles}`} fb={`${b.missiles}`} ca="#1E90FF" cb="#FF3B30" />
            <StatRow icon={<Banknote className="w-3.5 h-3.5" />} label="Presupuesto ($B)" va={a.budget} vb={b.budget} fa={`$${a.budget}B`} fb={`$${b.budget}B`} ca="#1E90FF" cb="#FF3B30" />
            <StatRow icon={<ShieldHalf className="w-3.5 h-3.5" />} label="Defensa antimisiles" va={a.defense} vb={b.defense} fa={`${a.defense}/10`} fb={`${b.defense}/10`} ca="#1E90FF" cb="#FF3B30" />
            <StatRow icon={<Mountain className="w-3.5 h-3.5" />} label="Ventaja geográfica" va={a.geo} vb={b.geo} fa={`${a.geo}/10`} fb={`${b.geo}/10`} ca="#1E90FF" cb="#FF3B30" />
            <StatRow icon={<BrainCircuit className="w-3.5 h-3.5" />} label="Experiencia reciente" va={a.exp} vb={b.exp} fa={`${a.exp}/10`} fb={`${b.exp}/10`} ca="#1E90FF" cb="#FF3B30" />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="font-mono text-[9px] text-muted-foreground">
                ☢️ Nuclear: <span className={a.nuclear ? "text-crisis" : "text-muted-foreground"}>{a.nuclear ? "SÍ" : "NO"}</span> · Alianzas: {a.alliances.join(", ") || "—"}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground md:text-right">
                ☢️ Nuclear: <span className={b.nuclear ? "text-crisis" : "text-muted-foreground"}>{b.nuclear ? "SÍ" : "NO"}</span> · Alianzas: {b.alliances.join(", ") || "—"}
              </div>
            </div>
          </div>

          {/* CONFIGURACION AVANZADA */}
          <div className="hud-panel p-3 space-y-2">
            <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-1">Configuración avanzada</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <OptionRow label="Tipo de guerra" options={[...WAR_TYPES]} value={warType} onChange={(v) => setWarType(v as (typeof WAR_TYPES)[number])} />
              <OptionRow label="Año" options={[...YEARS]} value={year} onChange={setYear} />
              <OptionRow label="Alianza A" options={[...ALLY_OPTIONS]} value={allyA} onChange={setAllyA} />
              <OptionRow label="Alianza B" options={[...ALLY_OPTIONS]} value={allyB} onChange={setAllyB} />
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button onClick={() => setWildcards(!wildcards)} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide">
                <span className={cn("w-8 h-4 rounded-full border relative transition-colors", wildcards ? "bg-neon-hud border-neon-hud" : "bg-secondary border-border")}>
                  <span className={cn("absolute top-0.5 w-3 h-3 rounded-full transition-all", wildcards ? "left-4 bg-neon" : "left-0.5 bg-muted-foreground")} />
                </span>
                <Dice5 className="w-3.5 h-3.5 text-amber" /> Eventos aleatorios
              </button>
              <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide">
                Velocidad:
                {SPEEDS.map((s) => (
                  <button key={s} onClick={() => setSpeed(s)} className={cn("px-2 py-0.5 border vg-transition", speed === s ? "border-electric-hud bg-electric-hud text-electric" : "border-border text-muted-foreground")}>
                    {s}x
                  </button>
                ))}
              </div>
              <div className="ml-auto font-tech text-sm">
                Prob. {a.code}: <span className="text-electric font-bold tabular-nums">{probA}%</span> · {b.code}: <span className="text-crisis font-bold tabular-nums">{100 - probA}%</span>
              </div>
              {!sim && (
                <Button onClick={startSim} className="font-mono text-xs uppercase tracking-widest neon-border" variant="outline">
                  <Play className="w-4 h-4 mr-1" /> Simular
                </Button>
              )}
            </div>
          </div>

          {/* SIMULACION EN CURSO */}
          {sim && (
            <div className="hud-panel p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Simulación en curso — mapa de avance</div>
                <div className="font-tech text-xl font-bold tabular-nums">DÍA <span className="text-electric">{sim.day}</span></div>
              </div>
              {/* frente de guerra */}
              <div className="relative h-8 bg-secondary overflow-hidden border border-border">
                <motion.div
                  className="absolute inset-y-0 bg-electric-hud border-r-2 border-electric"
                  animate={{ width: `${50 + sim.front / 2}%` }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  className="absolute inset-y-0 right-0 bg-crisis-hud border-l-2 border-crisis"
                  animate={{ width: `${50 - sim.front / 2}%` }}
                  transition={{ duration: 0.4 }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-2 font-mono text-[10px] font-bold">
                  <span className="text-electric">{a.code} ←</span>
                  <span className="text-soft">LÍNEA DE FRENTE</span>
                  <span className="text-crisis">→ {b.code}</span>
                </div>
                {/* flechas de movimiento de tropas */}
                <motion.div className="absolute top-1/2 -translate-y-1/2 text-electric" animate={{ left: ["8%", "42%"] }} transition={{ repeat: Infinity, duration: 2.6, ease: "linear" }}>
                  ▶▶
                </motion.div>
                <motion.div className="absolute top-1/2 -translate-y-1/2 text-crisis" animate={{ right: ["8%", "42%"] }} transition={{ repeat: Infinity, duration: 2.9, ease: "linear" }}>
                  ◀◀
                </motion.div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2 font-tech">
                <div className="hud-corner p-2 border border-border">
                  <div className="font-mono text-[8px] text-muted-foreground uppercase">Bajas {a.code}</div>
                  <div className="text-lg font-bold text-electric tabular-nums">{sim.casualtiesA.toLocaleString()}</div>
                </div>
                <div className="hud-corner p-2 border border-border">
                  <div className="font-mono text-[8px] text-muted-foreground uppercase">Costo económico</div>
                  <div className="text-lg font-bold text-amber tabular-nums">${sim.cost.toFixed(1)}B</div>
                </div>
                <div className="hud-corner p-2 border border-border">
                  <div className="font-mono text-[8px] text-muted-foreground uppercase">Bajas {b.code}</div>
                  <div className="text-lg font-bold text-crisis tabular-nums">{sim.casualtiesB.toLocaleString()}</div>
                </div>
              </div>

              {/* eventos emergentes */}
              <div className="mt-2 max-h-24 overflow-y-auto thin-scroll space-y-0.5">
                {sim.events.map((e, i) => (
                  <div key={i} className="font-mono text-[9px] text-muted-foreground flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-amber" /> {e}
                  </div>
                ))}
                {sim.events.length === 0 && <div className="font-mono text-[9px] text-muted-foreground">Escuchando informes del frente...</div>}
              </div>
            </div>
          )}

          {/* RESULTADO FINAL */}
          <AnimatePresence>
            {sim?.winner && a && b && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hud-panel neon-border p-4">
                <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-1">Resultado final</div>
                <div className="font-display text-xl sm:text-2xl font-black tracking-wide mb-2">
                  <span className={sim.winner === "A" ? "text-electric" : "text-crisis"}>
                    GANA {sim.winner === "A" ? a.name : b.name}
                  </span>{" "}
                  <span className="text-soft text-base">con {Math.max(sim.winProb, 100 - sim.winProb)}% de probabilidad calculada</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-tech mb-3">
                  <ResBox label="Duración" value={`${sim.day} días`} color="text-electric" />
                  <ResBox label="Bajas totales est." value={(sim.casualtiesA + sim.casualtiesB).toLocaleString()} color="text-crisis" />
                  <ResBox label="Costo económico est." value={`$${sim.cost.toFixed(0)}B`} color="text-amber" />
                  <ResBox label="Impacto regional" value={warType === "NUCLEAR" ? "GLOBAL" : Math.abs(sim.front) > 60 ? "ALTO" : "MEDIO"} color="text-neon" />
                </div>

                <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-1">¿Y si hubiera pasado X?</div>
                <div className="space-y-1 mb-3">
                  {alternatives.map((alt, i) => (
                    <div key={i} className="font-mono text-[10px] text-soft/85 leading-relaxed border-l-2 border-amber-hud pl-2">{alt}</div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={share} className="font-mono text-[10px] uppercase tracking-widest border-neon-hud text-neon">
                    <Share2 className="w-3.5 h-3.5 mr-1" /> Compartir resultado
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setSim(null); setRandomSeed((s) => s + 1); }} className="font-mono text-[10px] uppercase tracking-widest">
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Nueva simulación
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {!a && (
        <div className="hud-panel p-4 text-center font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Busca y elige DOS países arriba (o toca ALEATORIO) para armar el enfrentamiento
        </div>
      )}
    </div>
  );
}

function PowerCard({ power, side, onClear }: { power: WarPower | null; side: "A" | "B"; onClear: () => void }) {
  if (!power) {
    return (
      <div className="hud-corner border border-dashed border-border p-4 text-center font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
        {side === "A" ? "País A — sin seleccionar" : "País B — sin seleccionar"}
      </div>
    );
  }
  return (
    <div className={cn("hud-corner border p-3 flex items-center gap-3", side === "A" ? "border-electric-hud" : "border-crisis-hud")}>
      <div className="w-11 h-11 flex items-center justify-center border" style={{ borderColor: side === "A" ? "#1E90FF55" : "#FF3B3055" }}>
        <FlagBadge code={power.code} size="lg" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-tech text-base font-bold truncate">{power.name}</div>
        <div className="font-mono text-[9px] text-muted-foreground">{power.army}K tropas · {power.air} aviones · {power.nuclear ? "☢️ nuclear" : "no nuclear"}</div>
      </div>
      <button onClick={onClear} className="font-mono text-[9px] text-muted-foreground hover:text-crisis uppercase">quitar</button>
    </div>
  );
}

function StatRow({ icon, label, va, vb, fa, fb, ca, cb }: { icon: React.ReactNode; label: string; va: number; vb: number; fa: string; fb: string; ca: string; cb: string }) {
  const total = va + vb || 1;
  return (
    <div className="mb-1.5">
      <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground mb-0.5">
        <span className="tabular-nums">{fa}</span>
        <span className="flex items-center gap-1 uppercase tracking-wide">{icon} {label}</span>
        <span className="tabular-nums">{fb}</span>
      </div>
      <div className="h-1.5 flex overflow-hidden bg-secondary">
        <div style={{ width: `${(va / total) * 100}%`, background: ca }} />
        <div style={{ width: `${(vb / total) * 100}%`, background: cb }} />
      </div>
    </div>
  );
}

function OptionRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block font-mono text-[8px] text-muted-foreground uppercase tracking-widest mb-0.5">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-secondary/60 border border-border px-2 py-1.5 font-mono text-[10px] outline-none focus:border-electric-hud"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function ResBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="hud-corner border border-border p-2">
      <div className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">{label}</div>
      <div className={cn("text-lg font-bold tabular-nums", color)}>{value}</div>
    </div>
  );
}
