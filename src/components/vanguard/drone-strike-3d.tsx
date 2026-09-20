"use client";

// Vanguard v10 — DRON STRIKE 3D: minijuego three.js de drone de ataque.
// Vuelo continuo sobre zona de guerra: esquivas edificios, localizas convoys
// y lanzas misiles. Campana de 4 dificultades (RECLUTA..LEYENDA) con medallas,
// efectos de sonido (Web Audio) y ranking global persistido en BD via /api/drone-scores.
// Optimizado: pooling de objetos, sin sombras, pixelRatio acotado, dispose total.
import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { Crosshair, Play, RotateCcw, Coins, Gem, Trophy, Timer, MousePointer2, Medal, ListOrdered, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";

const MISSION_TIME = 60; // tiempo base (VETERANO)
const WORLD_SPEED = 62; // velocidad a la que el mundo avanza hacia el dron (u/s)
const MISSILE_SPEED = 190;
const FIRE_COOLDOWN = 0.32;
const STRAFE_LIMIT = 38;
const ALT_MIN = 6;
const ALT_MAX = 40;

type Phase = "IDLE" | "RUNNING" | "OVER";

interface HudState {
  score: number;
  hits: number;
  combo: number;
  time: number;
}

// ---- v10: campana de dificultad ----
type Difficulty = "RECLUTA" | "VETERANO" | "ELITE" | "LEYENDA";

interface DiffCfg {
  key: Difficulty;
  label: string;
  tag: string;
  time: number; // duracion de la mision (s)
  speedMul: number; // multiplicador de velocidad del mundo
  spawnMul: number; // multiplicador del intervalo de spawn (menor = mas convoys)
  rewardMul: number; // multiplicador de monedas
  gemBonus: number; // gemas extra directas
  goal: number; // pts para certificar la medalla de campana
  text: string;
  border: string;
  bg: string;
}

const DIFFS: Record<Difficulty, DiffCfg> = {
  RECLUTA: { key: "RECLUTA", label: "RECLUTA", tag: "Entrenamiento", time: 75, speedMul: 0.8, spawnMul: 1.35, rewardMul: 1.0, gemBonus: 0, goal: 500, text: "text-green-hud", border: "border-green-hud", bg: "bg-green-hud" },
  VETERANO: { key: "VETERANO", label: "VETERANO", tag: "Servicio activo", time: 60, speedMul: 1.0, spawnMul: 1.0, rewardMul: 1.15, gemBonus: 0, goal: 1200, text: "text-cyan-hud", border: "border-cyan-hud", bg: "bg-cyan-hud" },
  ELITE: { key: "ELITE", label: "ELITE", tag: "Alto riesgo", time: 50, speedMul: 1.22, spawnMul: 0.78, rewardMul: 1.35, gemBonus: 1, goal: 2200, text: "text-violet-hud", border: "border-violet-hud", bg: "bg-violet-hud" },
  LEYENDA: { key: "LEYENDA", label: "LEYENDA", tag: "Pesadilla", time: 45, speedMul: 1.5, spawnMul: 0.6, rewardMul: 1.65, gemBonus: 2, goal: 3200, text: "text-red-hud", border: "border-red-hud", bg: "bg-red-hud" },
};
const DIFF_ORDER: Difficulty[] = ["RECLUTA", "VETERANO", "ELITE", "LEYENDA"];

const CAMPAIGN_KEY = "vanguard-drone-campaign";

function loadCampaign(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(CAMPAIGN_KEY) || "{}") || {}; } catch { return {}; }
}

function saveCampaign(c: Record<string, boolean>) {
  try { localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(c)); } catch {}
}

interface BoardRow {
  id: string;
  alias: string;
  score: number;
  hits: number;
  difficulty: string;
  createdAt: string;
}

export function DroneStrikePanel() {
  const best = useGameStore((s) => s.minigameBestScore);
  const [lastRun, setLastRun] = useState<{ score: number; coins: number; gems: number; px: number; diff: Difficulty; rank: number | null } | null>(null);
  const [campaign, setCampaign] = useState<Record<string, boolean>>(() => loadCampaign());
  const [boardKey, setBoardKey] = useState(0);
  const [myScoreId, setMyScoreId] = useState<string | null>(null);

  const handleFinish = useCallback(async (score: number, hits: number, diffKey: Difficulty) => {
    const cfg = DIFFS[diffKey];
    const st = useGameStore.getState();
    const coins = Math.floor((score / 20) * cfg.rewardMul);
    const gems = (score >= 2000 ? 3 : score >= 1000 ? 2 : score >= 400 ? 1 : 0) + cfg.gemBonus;
    const px = Math.floor(score / 100);
    if (coins > 0) st.addCoins(coins, `Dron Strike 3D (${diffKey}): ${score} puntos`);
    if (gems > 0) st.addGems(gems, `Dron Strike 3D (${diffKey}): hito de punteria`);
    if (px > 0) st.addPassXp(px);
    st.recordMinigameStats(score, hits);

    // campana: certificar medalla si alcanzas el objetivo
    const camp = loadCampaign();
    let newlyCertified = false;
    if (score >= cfg.goal && !camp[diffKey]) {
      camp[diffKey] = true;
      saveCampaign(camp);
      newlyCertified = true;
    }
    setCampaign({ ...camp });
    if (newlyCertified) {
      sfx.achievement();
      toast.success(`MEDALLA ${diffKey} CONSEGUIDA: campana certificada con ${score} pts`);
    }

    // ranking global en BD
    let rank: number | null = null;
    try {
      const res = await fetch("/api/drone-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias: st.alias || "OPERADOR", score, hits, difficulty: diffKey }),
      });
      const json = await res.json();
      if (json?.ok) {
        rank = json.rank;
        setMyScoreId(json.id);
      }
    } catch {}

    setLastRun({ score, coins, gems, px, diff: diffKey, rank });
    setBoardKey((k) => k + 1);
    toast.success(`MISION ${diffKey}: ${score} pts · +${coins} mon${gems ? ` · +${gems} gemas` : ""}${px ? ` · +${px} PX` : ""}${rank ? ` · PUESTO #${rank} GLOBAL` : ""}`);
  }, []);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Dron Strike 3D"
        subtitle="Campana de 4 dificultades · sonidos de combate · ranking global en BD"
        icon={<Crosshair className="w-4 h-4 text-red-hud" />}
        color="red"
        right={
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <Trophy className="w-3.5 h-3.5 text-amber" /> Mejor: {best}
          </div>
        }
      />

      {/* medallas de campana */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1">
          <Medal className="w-3.5 h-3.5 text-amber" /> Campana:
        </span>
        {DIFF_ORDER.map((m) => {
          const c = DIFFS[m];
          const got = !!campaign[m];
          return (
            <div key={m} className={cn("hud-corner px-2.5 py-1.5 flex items-center gap-1.5 border bg-secondary/40", got ? c.border : "border-border opacity-55")}>
              <Medal className={cn("w-3.5 h-3.5", got ? c.text : "text-muted-foreground")} />
              <div className="leading-none">
                <div className={cn("text-[10px] font-mono font-bold uppercase", got ? c.text : "text-muted-foreground")}>{c.label}</div>
                <div className="text-[8px] font-mono text-muted-foreground mt-0.5">{got ? "CERTIFICADO" : `${c.goal} pts`}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-4 gap-2">
        <HowTo icon={<MousePointer2 className="w-4 h-4 text-cyan-hud" />} title="Pilotar" desc="WASD / flechas o arrastra el dedo sobre la vista para moverte y ganar altura." />
        <HowTo icon={<Crosshair className="w-4 h-4 text-red-hud" />} title="Disparar" desc="ESPACIO o el botón DISPARAR lanza un misil. Racha de aciertos = combo hasta x5. Ahora con sonido de combate." />
        <HowTo icon={<Medal className="w-4 h-4 text-amber" />} title="Campana" desc="4 modos: RECLUTA (75s), VETERANO (60s), ELITE (50s) y LEYENDA (45s). Cada uno con objetivo de pts para certificar medalla." />
        <HowTo icon={<ListOrdered className="w-4 h-4 text-green-hud" />} title="Ranking" desc="Cada misión se registra en el ranking global de la BD. Multiplicador de botín hasta x1.65 en LEYENDA (+2 gemas)." />
      </div>

      <DroneStrike3D onFinish={handleFinish} />

      {lastRun && (
        <div className="hud-corner p-3 bg-secondary/40 flex flex-wrap items-center gap-4">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Última misión ({lastRun.diff}):</span>
          <span className="text-sm font-mono font-bold text-amber">{lastRun.score} pts</span>
          <span className="text-[11px] font-mono text-green-hud flex items-center gap-1"><Coins className="w-3.5 h-3.5" /> +{lastRun.coins} mon</span>
          {lastRun.gems > 0 && <span className="text-[11px] font-mono text-violet-hud flex items-center gap-1"><Gem className="w-3.5 h-3.5" /> +{lastRun.gems} gemas</span>}
          {lastRun.px > 0 && <span className="text-[11px] font-mono text-cyan-hud">+{lastRun.px} PX Pase</span>}
          {lastRun.rank != null && (
            <span className="text-[11px] font-mono text-amber flex items-center gap-1"><Crown className="w-3.5 h-3.5" /> #{lastRun.rank} global</span>
          )}
        </div>
      )}

      <DroneLeaderboard refreshKey={boardKey} myId={myScoreId} />
    </div>
  );
}

function DroneLeaderboard({ refreshKey, myId }: { refreshKey: number; myId: string | null }) {
  const [rows, setRows] = useState<BoardRow[] | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/drone-scores")
      .then((r) => r.json())
      .then((j) => { if (live && j?.ok) setRows(j.scores as BoardRow[]); })
      .catch(() => { if (live) setRows([]); });
    return () => { live = false; };
  }, [refreshKey]);

  const medalColor = (i: number) => (i === 0 ? "text-amber" : i === 1 ? "text-cyan-hud" : i === 2 ? "text-violet-hud" : "text-muted-foreground");
  const diffColor: Record<string, string> = {
    RECLUTA: "text-green-hud",
    VETERANO: "text-cyan-hud",
    ELITE: "text-violet-hud",
    LEYENDA: "text-red-hud",
  };

  return (
    <div className="hud-corner p-3 bg-secondary/40">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <ListOrdered className="w-4 h-4 text-amber" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-foreground">Ranking global · Dron Strike</span>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground uppercase">top 20 · BD</span>
      </div>
      {!rows ? (
        <div className="text-[10px] font-mono text-muted-foreground py-2">Sincronizando ranking...</div>
      ) : rows.length === 0 ? (
        <div className="text-[10px] font-mono text-muted-foreground py-2">Sin misiones registradas aún. Completa una misión para entrar en el ranking.</div>
      ) : (
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {rows.map((r, i) => (
            <div key={r.id} className={cn("flex items-center gap-2 px-2 py-1.5 border text-[11px] font-mono", r.id === myId ? "border-amber-hud bg-amber-hud/10" : "border-transparent bg-background/40")}>
              <span className={cn("w-7 font-bold", medalColor(i))}>#{i + 1}</span>
              <span className="flex-1 truncate font-bold text-foreground">{r.alias}</span>
              <span className={cn("hidden sm:inline text-[9px] uppercase", diffColor[r.difficulty] || "text-muted-foreground")}>{r.difficulty}</span>
              <span className="text-muted-foreground text-[9px]">{r.hits} ac.</span>
              <span className="w-14 text-right font-bold text-amber">{r.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HowTo({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="hud-corner p-3 bg-secondary/40">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[11px] font-mono font-bold uppercase text-foreground">{title}</span>
      </div>
      <div className="text-[10px] font-mono text-muted-foreground leading-relaxed">{desc}</div>
    </div>
  );
}

// ===================================================================
// motor 3D
// ===================================================================
function DroneStrike3D({ onFinish }: { onFinish: (score: number, hits: number, diff: Difficulty) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<Phase>("IDLE");
  const [diff, setDiff] = useState<Difficulty>("VETERANO");
  const diffRef = useRef<DiffCfg>(DIFFS.VETERANO);
  const [hud, setHud] = useState<HudState>({ score: 0, hits: 0, combo: 1, time: MISSION_TIME });
  const [runResult, setRunResult] = useState<{ score: number; hits: number; diff: Difficulty } | null>(null);
  const fireFnRef = useRef<(() => void) | null>(null);

  useEffect(() => { diffRef.current = DIFFS[diff]; }, [diff]);

  const start = () => {
    sfx.click();
    setRunResult(null);
    setHud({ score: 0, hits: 0, combo: 1, time: DIFFS[diff].time });
    setPhase("RUNNING");
  };

  const cfg = DIFFS[diff];

  return (
    <div className="hud-corner relative overflow-hidden select-none" style={{ height: "min(62vh, 560px)" }}>
      <div ref={containerRef} className="absolute inset-0" />
      {/* crosshair */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-10 h-10 opacity-70">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-red-hud/80" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-hud/80" />
          <div className="absolute inset-[38%] border border-red-hud rounded-full" />
        </div>
      </div>

      {/* HUD */}
      {phase === "RUNNING" && (
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex gap-2 flex-wrap">
            <HudChip label="PUNTOS" value={String(hud.score)} color="text-amber" />
            <HudChip label="COMBO" value={`x${hud.combo}`} color={hud.combo > 1 ? "text-green-hud" : "text-muted-foreground"} />
            <HudChip label="ACIERTOS" value={String(hud.hits)} color="text-cyan-hud" />
            <HudChip label="MODO" value={cfg.label} color={cfg.text} />
          </div>
          <HudChip label="TIEMPO" value={`${Math.ceil(hud.time)}s`} color={hud.time <= 10 ? "text-red-hud" : "text-foreground"} />
        </div>
      )}

      {/* botón disparar (táctil) */}
      {phase === "RUNNING" && (
        <button
          onPointerDown={(e) => { e.preventDefault(); fireFnRef.current?.(); }}
          className="absolute bottom-4 right-4 z-10 px-5 py-3.5 border-2 border-red-hud bg-red-hud/30 text-red-hud rounded-sm text-sm font-mono font-bold uppercase tracking-widest active:bg-red-hud/60 touch-none"
          aria-label="Disparar misil"
        >
          DISPARAR
        </button>
      )}

      {/* overlay inicio */}
      {phase === "IDLE" && (
        <div className="absolute inset-0 z-10 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 text-center">
          <Crosshair className="w-12 h-12 text-red-hud" />
          <h3 className="text-xl font-mono font-bold tracking-widest text-foreground uppercase">Dron Strike 3D</h3>
          <p className="text-[11px] font-mono text-muted-foreground max-w-md leading-relaxed">
            Pilotas un dron de ataque sobre la zona de guerra. Destruye convoys con misiles,
            esquiva los edificios y suma combo antes de que acabe el tiempo. Elige tu nivel
            de campana: mas dificultad = mision mas corta y caos, pero botin multiplicado.
          </p>
          {/* selector de dificultad */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full max-w-lg">
            {DIFF_ORDER.map((k) => {
              const c = DIFFS[k];
              const sel = diff === k;
              return (
                <button
                  key={k}
                  onClick={() => { sfx.hover(); setDiff(k); }}
                  className={cn(
                    "hud-corner px-2 py-2 border text-left bg-secondary/40 transition-colors",
                    sel ? cn(c.border, "bg-background/70") : "border-border hover:border-amber-hud/60"
                  )}
                >
                  <div className={cn("text-[10px] font-mono font-bold uppercase tracking-wider", sel ? c.text : "text-muted-foreground")}>{c.label}</div>
                  <div className="text-[8px] font-mono text-muted-foreground mt-0.5">{c.time}s · x{c.rewardMul.toFixed(2)} · {c.goal} pts</div>
                </button>
              );
            })}
          </div>
          <p className="text-[9px] font-mono text-muted-foreground">
            Objetivo de campana: <span className={cfg.text}>{cfg.goal} pts</span> en {cfg.label} para certificar la medalla · {cfg.tag}
          </p>
          <button
            onClick={start}
            className="mt-1 flex items-center gap-2 px-5 py-2.5 border border-red-hud bg-red-hud/25 text-red-hud rounded-sm text-sm font-mono font-bold uppercase tracking-widest hover:bg-red-hud/45"
          >
            <Play className="w-4 h-4" /> Iniciar misión
          </button>
        </div>
      )}

      {/* overlay fin */}
      {phase === "OVER" && runResult && (
        <div className="absolute inset-0 z-10 bg-background/88 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 text-center">
          <Trophy className="w-11 h-11 text-amber" />
          <h3 className="text-xl font-mono font-bold tracking-widest text-foreground uppercase">Fin de la misión</h3>
          <div className="flex gap-4 flex-wrap justify-center text-sm font-mono font-bold">
            <span className="text-amber">{runResult.score} PTS</span>
            <span className="text-cyan-hud">{runResult.hits} ACIERTOS</span>
            <span className={DIFFS[runResult.diff].text}>{runResult.diff}</span>
          </div>
          {runResult.score < DIFFS[runResult.diff].goal ? (
            <p className="text-[10px] font-mono text-muted-foreground">
              Te faltaron <span className="text-amber">{DIFFS[runResult.diff].goal - runResult.score} pts</span> para la medalla {runResult.diff}.
            </p>
          ) : (
            <p className="text-[10px] font-mono text-green-hud">Objetivo de campana cumplido en {runResult.diff}.</p>
          )}
          <button
            onClick={start}
            className="mt-1 flex items-center gap-2 px-5 py-2.5 border border-amber-hud bg-amber-hud/25 text-amber rounded-sm text-sm font-mono font-bold uppercase tracking-widest hover:bg-amber-hud/45"
          >
            <RotateCcw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      )}

      <GameEngine
        active={phase === "RUNNING"}
        containerRef={containerRef}
        fireRef={fireFnRef}
        diffRef={diffRef}
        onHud={(h) => setHud(h)}
        onEnd={(score, hits) => {
          setRunResult({ score, hits, diff: diffRef.current.key });
          setPhase("OVER");
          onFinish(score, hits, diffRef.current.key);
        }}
      />
    </div>
  );
}

function HudChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-background/80 px-2 py-1 hud-corner border-amber-hud">
      <div className="text-[7px] font-mono text-muted-foreground uppercase tracking-widest">{label}</div>
      <div className={cn("text-sm font-mono font-bold leading-none", color)}>{value}</div>
    </div>
  );
}

// ===================================================================
// GameEngine: three.js imperativo, montado una sola vez, corre cuando active=true
// ===================================================================
function GameEngine({
  active, containerRef, fireRef, diffRef, onHud, onEnd,
}: {
  active: boolean;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  fireRef: React.MutableRefObject<(() => void) | null>;
  diffRef: React.MutableRefObject<DiffCfg>;
  onHud: (h: HudState) => void;
  onEnd: (score: number, hits: number) => void;
}) {
  const apiRef = useRef<{ start: () => void; fire: () => void; stop: () => void } | null>(null);
  const activeRef = useRef(false);
  const onHudRef = useRef(onHud);
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onHudRef.current = onHud;
    onEndRef.current = onEnd;
    activeRef.current = active;
  }, [onHud, onEnd, active]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ---- renderer / escena / camara ----
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070c);
    scene.fog = new THREE.Fog(0x05070c, 190, 780);

    const camera = new THREE.PerspectiveCamera(64, container.clientWidth / container.clientHeight, 0.5, 900);

    scene.add(new THREE.HemisphereLight(0x9ab4d4, 0x2a2018, 1.6));
    const dir = new THREE.DirectionalLight(0xffd9a0, 1.35);
    dir.position.set(-60, 90, 40);
    scene.add(dir);

    const geoms: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];
    const box = () => { const g = new THREE.BoxGeometry(1, 1, 1); geoms.push(g); return g; };
    const lam = (c: number) => { const m = new THREE.MeshLambertMaterial({ color: c }); mats.push(m); return m; };
    const bas = (c: number, o = 1) => { const m = new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o }); mats.push(m); return m; };

    // ---- suelo + grid (2 planos que saltan) ----
    const groundMat = lam(0x0a0d16);
    const groundGeo = new THREE.PlaneGeometry(420, 1200);
    geoms.push(groundGeo);
    const grounds: THREE.Mesh[] = [];
    for (let i = 0; i < 2; i++) {
      const g = new THREE.Mesh(groundGeo, groundMat);
      g.rotation.x = -Math.PI / 2;
      g.position.set(0, 0, -600 + i * 1200);
      scene.add(g);
      grounds.push(g);
    }
    const grid = new THREE.GridHelper(2400, 120, 0x2a3550, 0x151d30);
    mats.push(grid.material as THREE.Material);
    geoms.push(grid.geometry);
    grid.position.y = 0.05;
    scene.add(grid);

    // ---- edificios reciclables ----
    const bldGeo = box();
    const bldMats = [lam(0x2b3550), lam(0x33405e), lam(0x26304a)];
    const buildings: THREE.Mesh[] = [];
    for (let i = 0; i < 44; i++) {
      const m = new THREE.Mesh(bldGeo, bldMats[i % bldMats.length]);
      const h = 5 + Math.random() * 26;
      m.scale.set(6 + Math.random() * 12, h, 6 + Math.random() * 14);
      m.position.set((Math.random() < 0.5 ? -1 : 1) * (22 + Math.random() * 70), h / 2, -Math.random() * 1100 + 60);
      scene.add(m);
      buildings.push(m);
    }

    // ---- dron ----
    const drone = new THREE.Group();
    const bodyMat = lam(0x3a4356);
    const accentMat = bas(0xf5a623);
    const body = new THREE.Mesh(box(), bodyMat);
    body.scale.set(2.6, 0.8, 3.4);
    drone.add(body);
    const nose = new THREE.Mesh(box(), accentMat);
    nose.scale.set(1.2, 0.5, 1);
    nose.position.set(0, -0.1, -2.1);
    drone.add(nose);
    const rotors: THREE.Mesh[] = [];
    const rotorGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.08, 10);
    geoms.push(rotorGeo);
    const rotorMat = bas(0x9aa8b8, 0.55);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      const arm = new THREE.Mesh(box(), bodyMat);
      arm.scale.set(0.4, 0.25, 2.2);
      arm.position.set(sx * 1.6, 0.25, sz * 1.5);
      arm.rotation.y = sx * sz * 0.5;
      drone.add(arm);
      const rotor = new THREE.Mesh(rotorGeo, rotorMat);
      rotor.position.set(sx * 2.2, 0.4, sz * 2.2);
      rotors.push(rotor);
      drone.add(rotor);
    }
    const camPod = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), bas(0x22d3ee));
    geoms.push(camPod.geometry);
    camPod.position.set(0, -0.65, -1.4);
    drone.add(camPod);
    drone.position.set(0, 14, 6);
    scene.add(drone);

    // ---- convoys objetivo (pool) ----
    interface Target { grp: THREE.Group; alive: boolean; drift: number; }
    const targets: Target[] = [];
    const hullMat = lam(0x5a6a48);
    const turretMat = lam(0x46543a);
    const tredMat = lam(0x2a2f22);
    const ringGeo = new THREE.RingGeometry(4.2, 5.4, 26);
    geoms.push(ringGeo);
    const ringMat = bas(0xff4a4a, 0.55);
    for (let i = 0; i < 7; i++) {
      const grp = new THREE.Group();
      // anillo marcador en el suelo: localiza el objetivo desde lejos
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.25;
      grp.add(ring);
      for (let j = 0; j < 2 + Math.floor(Math.random() * 2); j++) {
        const hull = new THREE.Mesh(box(), hullMat);
        hull.scale.set(3.4, 1.6, 6);
        hull.position.set(0, 1.1, j * 8);
        grp.add(hull);
        const turret = new THREE.Mesh(box(), turretMat);
        turret.scale.set(2, 1, 2.6);
        turret.position.set(0, 2.4, j * 8 - 0.6);
        grp.add(turret);
        for (const sx of [-1, 1]) {
          const tred = new THREE.Mesh(box(), tredMat);
          tred.scale.set(0.7, 0.9, 6.2);
          tred.position.set(sx * 1.5, 0.45, j * 8);
          grp.add(tred);
        }
      }
      grp.visible = false;
      scene.add(grp);
      targets.push({ grp, alive: false, drift: 0 });
    }
    const spawnTarget = (zMin: number) => {
      const t = targets.find((x) => !x.alive);
      if (!t) return;
      t.alive = true;
      t.grp.visible = true;
      t.drift = (Math.random() - 0.5) * 4;
      t.grp.position.set((Math.random() - 0.5) * 64, 0, zMin - Math.random() * 240);
    };

    // ---- misiles (pool) + explosiones (pool) ----
    interface Missile { mesh: THREE.Mesh; alive: boolean; target: Target | null; }
    const missiles: Missile[] = [];
    const misGeo = new THREE.SphereGeometry(0.5, 6, 6);
    geoms.push(misGeo);
    const misMat = bas(0xffa640);
    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(misGeo, misMat);
      mesh.visible = false;
      scene.add(mesh);
      missiles.push({ mesh, alive: false, target: null });
    }
    interface Boom { mesh: THREE.Mesh; t: number; }
    const booms: Boom[] = [];
    const boomGeo = new THREE.SphereGeometry(1, 10, 10);
    geoms.push(boomGeo);
    const boomMat = bas(0xff7a30, 0.9);
    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(boomGeo, boomMat.clone());
      mats.push(mesh.material as THREE.Material);
      mesh.visible = false;
      scene.add(mesh);
      booms.push({ mesh, t: 0 });
    }
    const explodeAt = (p: THREE.Vector3) => {
      const b = booms.find((x) => x.t <= 0);
      if (!b) return;
      b.t = 1;
      b.mesh.visible = true;
      b.mesh.position.copy(p);
      b.mesh.scale.setScalar(1);
    };

    // ---- estado de partida ----
    const keys = new Set<string>();
    let firing = false;
    let cooldown = 0;
    let score = 0, hits = 0, combo = 1, timeLeft = MISSION_TIME, elapsed = 0;
    let running = false;
    let targetTimer = 0.4;
    let curDiff: DiffCfg = diffRef.current; // v10: config de dificultad leida al iniciar cada mision
    const droneTarget = { x: 0, y: 14 };

    const fire = () => {
      if (!running || cooldown > 0) return;
      const m = missiles.find((x) => !x.alive);
      if (!m) return;
      m.alive = true;
      m.target = null;
      // v9 pulido: teledirigido suave — el misil busca el convoy mas cercano
      // en un cono frontal (|dx| < 34) para que acertar sea satisfactorio
      let best: Target | null = null;
      let bestDist = Infinity;
      for (const t of targets) {
        if (!t.alive) continue;
        const dz = drone.position.z - t.grp.position.z;
        if (dz <= 0) continue;
        if (Math.abs(t.grp.position.x - drone.position.x) > 34) continue;
        if (dz < bestDist) { bestDist = dz; best = t; }
      }
      m.target = best;
      m.alive = true;
      m.mesh.visible = true;
      m.mesh.position.copy(drone.position);
      m.mesh.position.z -= 3;
      cooldown = FIRE_COOLDOWN;
      firing = true;
      sfx.droneFire(); // v10: sonido de lanzamiento
      setTimeout(() => { firing = false; }, 90);
    };
    fireRef.current = fire;

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
      keys.add(k);
      if (k === " ") fire();
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // toque/arrastre: mover el dron
    const pointerState = { down: false, x: 0, y: 0 };
    const onPointerDown = (e: PointerEvent) => {
      pointerState.down = true;
      pointerState.x = e.clientX;
      pointerState.y = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!pointerState.down) return;
      const dx = e.clientX - pointerState.x;
      const dy = e.clientY - pointerState.y;
      pointerState.x = e.clientX;
      pointerState.y = e.clientY;
      droneTarget.x = Math.max(-STRAFE_LIMIT, Math.min(STRAFE_LIMIT, droneTarget.x + dx * 0.22));
      droneTarget.y = Math.max(ALT_MIN, Math.min(ALT_MAX, droneTarget.y - dy * 0.2));
    };
    const onPointerUp = () => { pointerState.down = false; };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // ---- reset ----
    const startRun = () => {
      curDiff = diffRef.current;
      score = 0; hits = 0; combo = 1; timeLeft = curDiff.time; elapsed = 0;
      cooldown = 0; targetTimer = 0.4;
      drone.position.set(0, 14, 6);
      droneTarget.x = 0; droneTarget.y = 14;
      for (const t of targets) { t.alive = false; t.grp.visible = false; }
      for (const m of missiles) { m.alive = false; m.target = null; m.mesh.visible = false; }
      for (const b of booms) { b.t = 0; b.mesh.visible = false; }
      running = true;
      onHudRef.current({ score, hits, combo, time: timeLeft });
    };

    const endRun = () => {
      running = false;
      sfx.droneEnd(); // v10: fanfarria de fin de mision
      onEndRef.current(score, hits);
    };
    apiRef.current = { start: startRun, fire, stop: endRun };

    // ---- resize ----
    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // ---- loop ----
    const clock = new THREE.Clock();
    let raf = 0;
    let hudAcc = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, clock.getDelta());
      const worldDz = WORLD_SPEED * curDiff.speedMul * dt; // v10: velocidad segun dificultad

      // rotors siempre
      for (const r of rotors) r.rotation.y += dt * 40;

      if (running && !document.hidden) {
        elapsed += dt;
        timeLeft -= dt;
        cooldown = Math.max(0, cooldown - dt);

        // input teclado
        const kx = (keys.has("d") || keys.has("arrowright") ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
        const ky = (keys.has("w") || keys.has("arrowup") ? 1 : 0) - (keys.has("s") || keys.has("arrowdown") ? 1 : 0);
        if (kx) droneTarget.x = Math.max(-STRAFE_LIMIT, Math.min(STRAFE_LIMIT, droneTarget.x + kx * 46 * dt));
        if (ky) droneTarget.y = Math.max(ALT_MIN, Math.min(ALT_MAX, droneTarget.y + ky * 30 * dt));

        // drone easing + bank
        drone.position.x += (droneTarget.x - drone.position.x) * Math.min(1, dt * 7);
        drone.position.y += (droneTarget.y - drone.position.y) * Math.min(1, dt * 7);
        drone.position.z = 6 + Math.sin(elapsed * 2.2) * 0.35;
        drone.rotation.z = -(droneTarget.x - drone.position.x) * 0.03;
        drone.rotation.x = firing ? 0.12 : Math.sin(elapsed * 1.7) * 0.02;

        // suelo y edificios
        for (const g of grounds) {
          g.position.z += worldDz;
          if (g.position.z > 600) g.position.z -= 2400;
        }
        grid.position.z = (grid.position.z + worldDz) % 20;
        for (const b of buildings) {
          b.position.z += worldDz;
          if (b.position.z > 60) {
            b.position.z -= 1100;
            b.position.x = (Math.random() < 0.5 ? -1 : 1) * (22 + Math.random() * 70);
          }
        }

        // convoys
        targetTimer -= dt;
        if (targetTimer <= 0) {
          targetTimer = (0.9 + Math.random() * 0.9) * curDiff.spawnMul; // v10: spawn segun dificultad
          spawnTarget(-480);
        }
        for (const t of targets) {
          if (!t.alive) continue;
          t.grp.position.z += worldDz * 1.04;
          t.grp.position.x += Math.sin(elapsed * 0.8 + t.grp.position.z * 0.02) * t.drift * dt;
          t.grp.children[0].scale.setScalar(1 + Math.sin(elapsed * 5 + t.grp.position.z) * 0.14);
          if (t.grp.position.z > 40) { t.alive = false; t.grp.visible = false; combo = 1; sfx.droneLeak(); }
        }

        // misiles (teledirigidos suaves)
        for (const m of missiles) {
          if (!m.alive) continue;
          if (m.target && m.target.alive) {
            const aim = m.target.grp.position.clone().setY(1.6);
            const dirv = aim.sub(m.mesh.position);
            const len = dirv.length() || 1;
            dirv.multiplyScalar(1 / len);
            m.mesh.position.addScaledVector(dirv, MISSILE_SPEED * dt);
          } else {
            m.mesh.position.z -= MISSILE_SPEED * dt;
          }
          if (m.mesh.position.z < -700) { m.alive = false; m.mesh.visible = false; m.target = null; combo = 1; continue; }
          // colision
          for (const t of targets) {
            if (!t.alive) continue;
            if (t.grp.position.distanceTo(m.mesh.position) < 7.2) {
              t.alive = false;
              t.grp.visible = false;
              m.alive = false;
              m.mesh.visible = false;
              m.target = null;
              hits += 1;
              score += 100 * combo;
              combo = Math.min(5, combo + 1);
              explodeAt(t.grp.position.clone().setY(2));
              sfx.droneExplosion(); // v10: estallido
              sfx.droneHit(combo); // v10: confirmacion tono por combo
              break;
            }
          }
        }

        // explosiones
        for (const b of booms) {
          if (b.t <= 0) continue;
          b.t -= dt * 2;
          b.mesh.scale.setScalar(1 + (1 - b.t) * 7);
          (b.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, b.t * 0.9);
          if (b.t <= 0) b.mesh.visible = false;
        }

        // camara persecucion
        camera.position.set(drone.position.x * 0.62, drone.position.y + 7.5, 18);
        camera.lookAt(drone.position.x * 0.85, drone.position.y * 0.7, -60);

        // HUD
        hudAcc += dt;
        if (hudAcc > 0.2) {
          hudAcc = 0;
          onHudRef.current({ score, hits, combo, time: Math.max(0, timeLeft) });
        }
        if (timeLeft <= 0) endRun();
      } else if (!running) {
        // camara orbita suave en idle/over
        camera.position.set(Math.sin(clock.elapsedTime * 0.25) * 30, 22, 24);
        camera.lookAt(0, 8, -40);
      }

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      fireRef.current = null;
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (mesh as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) (mat as THREE.Material).dispose();
      });
      geoms.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      renderer.dispose();
      if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
    };
     
  }, []);

  // arranca/para con la fase
  useEffect(() => {
    if (active) apiRef.current?.start();
  }, [active]);

  return null;
}
