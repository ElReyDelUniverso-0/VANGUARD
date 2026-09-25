"use client";

// v20 LÍNEAS DE FRENTE: vista táctica EN VIVO de los frentes del mundo con
// banderas VERDADERAS de los beligerantes.
// Canvas animado con tanques, soldados, trincheras, artillería, trazadoras y humo.
// JUGABLE: el operador llama strikes de artillería y drones (coste en monedas,
// recompensa por efectividad). Datos de frente + bajas en vivo + bitácora.

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/lib/flags";
import { useGameStore } from "@/lib/game-store";
import { toast } from "sonner";
import {
  Flame, Crosshair, Skull, Activity, Radio, Target, ShieldAlert, Coins,
} from "lucide-react";

interface FrontDef {
  id: string;
  name: string;
  // v51.2 — string[] en vez de tupla fija: Rusia/India/Gaza pasan 3 colores de bandera
  sideA: { name: string; colors: string[]; code?: string };
  sideB: { name: string; colors: string[]; code?: string };
  intensity: number; // 0-100
  casualties: number; // base estimada
  unitsA: number;
  unitsB: number;
  note: string;
}

// v51.2 — METEO OPERATIVA (viene de /api/meteo, Open-Meteo sin key)
interface MeteoEntry {
  id: string;
  name: string;
  temp: number | null;
  wind: number | null;
  cond: string;
  drone: "OK" | "RIESGO" | "NO";
}

const FRONTS: FrontDef[] = [
  {
    id: "donbas", name: "Frente de Donbás", sideA: { name: "Ucrania", colors: ["#0057B7", "#FFD700"], code: "ua" }, sideB: { name: "Rusia", colors: ["#FFFFFF", "#0039A6", "#D52B1E"], code: "ru" },
    intensity: 92, casualties: 812000, unitsA: 34, unitsB: 41,
    note: "Artillería pesada y drones FPV dominan la línea de contacto.",
  },
  {
    id: "gaza", name: "Franja de Gaza", sideA: { name: "Israel", colors: ["#FFFFFF", "#0038B8"], code: "il" }, sideB: { name: "Hamás", colors: ["#000000", "#FFFFFF", "#007A3D"], code: "ps" },
    intensity: 78, casualties: 128000, unitsA: 22, unitsB: 17,
    note: "Combate urbano túnel a túnel; potencia de fuego desigual.",
  },
  {
    id: "sahel", name: "Frente del Sahel", sideA: { name: "Juntas / FAMa", colors: ["#002A8F", "#FFD700"], code: "ml" }, sideB: { name: "JNIM / EIGS", colors: ["#000000", "#3a7d44"] },
    intensity: 64, casualties: 46000, unitsA: 12, unitsB: 19,
    note: "Emboscadas con IED y motos en el triángulo Liptako-Gourma.",
  },
  {
    id: "sudan", name: "Guerra Civil de Sudán", sideA: { name: "SAF (Ejército)", colors: ["#D21034", "#FFFFFF"], code: "sd" }, sideB: { name: "RSF (Rapid Forces)", colors: ["#000000", "#D21034"] },
    intensity: 85, casualties: 150000, unitsA: 18, unitsB: 24,
    note: "Batalla urbana en Jartum; crisis de refugiados récord.",
  },
  {
    id: "myanmar", name: "Resistencia de Myanmar", sideA: { name: "Junta (Tatmadaw)", colors: ["#CE1126", "#FFFFFF"], code: "mm" }, sideB: { name: "PDF / EAOs", colors: ["#000000", "#FCD116"] },
    intensity: 71, casualties: 74000, unitsA: 14, unitsB: 27,
    note: "Ofensiva 1024: guerrilla captura puestos fronterizos.",
  },
  {
    id: "kashmir", name: "Cachemira (LoC)", sideA: { name: "India", colors: ["#FF9933", "#FFFFFF", "#138808"], code: "in" }, sideB: { name: "Pakistán", colors: ["#01411C", "#FFFFFF"], code: "pk" },
    intensity: 47, casualties: 38000, unitsA: 16, unitsB: 15,
    note: "Intercambio de fuego de mortero a lo largo de la Línea de Control.",
  },
];

interface Unit { x: number; y: number; side: 0 | 1; type: "tank" | "soldier"; vx: number; hp: number; cool: number; }
interface Boom { x: number; y: number; r: number; max: number; }
interface Tracer { x1: number; y1: number; x2: number; y2: number; life: number; }
interface Smoke { x: number; y: number; r: number; vx: number; life: number; }

function drawSoldier(ctx: CanvasRenderingContext2D, u: Unit, t: number, colors: string[]) {
  const bob = Math.sin(t * 6 + u.x) * 1.2;
  ctx.save();
  ctx.translate(u.x, u.y + bob);
  // cuerpo
  ctx.fillStyle = colors[0];
  ctx.fillRect(-3, -10, 6, 10);
  // cabeza (casco)
  ctx.fillStyle = "#20242c";
  ctx.beginPath(); ctx.arc(0, -13, 3.4, 0, Math.PI * 2); ctx.fill();
  // rifle
  ctx.strokeStyle = "#111318"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(2, -7); ctx.lineTo(u.side === 0 ? 9 : -9, -5); ctx.stroke();
  ctx.restore();
}

function drawTank(ctx: CanvasRenderingContext2D, u: Unit, dir: 1 | -1, colors: string[]) {
  ctx.save();
  ctx.translate(u.x, u.y);
  // orugas
  ctx.fillStyle = "#14161c";
  ctx.fillRect(-14, -5, 28, 6);
  ctx.beginPath();
  for (const wx of [-10, -3, 4, 11]) { ctx.arc(wx, 1, 2.6, 0, Math.PI * 2); }
  ctx.fill();
  // casco
  ctx.fillStyle = colors[0];
  ctx.fillRect(-12, -11, 24, 7);
  // torreta + cañón
  ctx.fillRect(-5, -15, 10, 5);
  ctx.strokeStyle = colors[0]; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(3, -13); ctx.lineTo(dir * 17, -13); ctx.stroke();
  // insignia
  ctx.fillStyle = colors[1] ?? "#fff";
  ctx.fillRect(-2, -10, 4, 3);
  ctx.restore();
}

export function FrentePanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ units: [] as Unit[], booms: [] as Boom[], tracers: [] as Tracer[], smokes: [] as Smoke[], front: FRONTS[0], momentum: 0, lastSpawn: 0 });
  const [frontIdx, setFrontIdx] = useState(0);
  const front = FRONTS[frontIdx];
  const [log, setLog] = useState<string[]>([]);
  const [casualties, setCasualties] = useState(front.casualties);
  const [control, setControl] = useState(52); // % lado A
  // v51.2 — METEO OPERATIVA: condiciones en vivo por frente (una sola petición)
  const [meteo, setMeteo] = useState<MeteoEntry[] | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/meteo")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (alive && j?.ok) setMeteo(j.zones as MeteoEntry[]); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  const frontMeteo = meteo?.find((m) => m.id === front.id) ?? null;
  const addCoins = useGameStore((s) => s.addCoins);
  const spendCoins = useGameStore((s) => s.spendCoins);

  const pushLog = useCallback((line: string) => {
    setLog((l) => [`${new Date().toLocaleTimeString("es", { hour12: false })} — ${line}`, ...l].slice(0, 9));
  }, []);

  // reinicia escena al cambiar de frente
  useEffect(() => {
    const s = stateRef.current;
    s.front = FRONTS[frontIdx];
    s.units = []; s.booms = []; s.tracers = []; s.smokes = [];
    s.momentum = 0;
    setCasualties(FRONTS[frontIdx].casualties);
    setControl(52);
    setLog([`${new Date().toLocaleTimeString("es", { hour12: false })} — ENLACE TÁCTICO establecido: ${FRONTS[frontIdx].name}`]);
  }, [frontIdx]);

  // bucle de animación + simulación
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;

    const spawn = () => {
      const s = stateRef.current;
      if (s.units.length < 46 && t - s.lastSpawn > 22) {
        s.lastSpawn = t;
        const side = Math.random() < 0.5 ? 0 : 1;
        const type = Math.random() < 0.42 ? "tank" : "soldier";
        s.units.push({
          x: side === 0 ? Math.random() * 0.34 : 0.66 + Math.random() * 0.34,
          y: 0,
          side: side as 0 | 1,
          type: type as "tank" | "soldier",
          vx: (Math.random() - 0.5) * 0.0012,
          hp: 1,
          cool: Math.random() * 100,
        });
      }
    };

    const frame = () => {
      t++;
      const s = stateRef.current;
      const W = cv.width, H = cv.height;
      const ground = H * 0.72;
      const f = s.front;

      // cielo nocturno + horizonada
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#0a0d16"); sky.addColorStop(0.65, "#131a2a"); sky.addColorStop(1, "#0b0e15");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

      // resplandor del frente según intensidad
      const glow = ctx.createRadialGradient(W / 2, ground, 10, W / 2, ground, W * 0.6);
      glow.addColorStop(0, `rgba(255,90,40,${0.10 + (f.intensity / 100) * 0.16})`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

      // colinas de fondo
      ctx.fillStyle = "#0d1119";
      ctx.beginPath(); ctx.moveTo(0, ground);
      for (let x = 0; x <= W; x += 24) ctx.lineTo(x, ground - 18 - Math.sin(x * 0.01 + 2) * 14);
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();

      // terreno
      ctx.fillStyle = "#11151d";
      ctx.fillRect(0, ground, W, H - ground);

      // cráteres
      for (let i = 0; i < 7; i++) {
        const cx = ((i * 97 + 41) % 100) / 100 * W;
        const cy = ground + 14 + ((i * 53) % 30);
        ctx.fillStyle = "#0a0c11";
        ctx.beginPath(); ctx.ellipse(cx, cy, 16 + (i % 3) * 7, 5 + (i % 2) * 3, 0, 0, Math.PI * 2); ctx.fill();
      }

      // LÍNEA DE FRENTE (desplazada por el momentum)
      const frontX = W / 2 + s.momentum * (W * 0.18);
      ctx.save();
      ctx.setLineDash([10, 8]);
      ctx.strokeStyle = "#FF3B30"; ctx.lineWidth = 2;
      ctx.shadowColor = "#FF3B30"; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(frontX, ground - 40); ctx.lineTo(frontX, H); ctx.stroke();
      ctx.restore();
      // alambre de espino
      ctx.strokeStyle = "#2a2f3a"; ctx.lineWidth = 1;
      for (let y = ground - 30; y < H; y += 16) {
        ctx.beginPath();
        for (let x = frontX - 26; x < frontX + 26; x += 6) ctx.lineTo(x, y + (x % 12 === 0 ? -2 : 2));
        ctx.stroke();
      }

      // trincheras a ambos lados
      ctx.fillStyle = "#171b24";
      for (const tx of [frontX - 70, frontX + 70]) ctx.fillRect(tx - 20, ground + 6, 40, 6);

      spawn();

      // unidades
      if (s.units.length < 20) {
        for (let i = 0; i < 4; i++) {
          const side = Math.random() < 0.5 ? 0 : 1;
          s.units.push({
            x: (side === 0 ? Math.random() * 0.32 : 0.68 + Math.random() * 0.32),
            y: 0, side: side as 0 | 1,
            type: Math.random() < 0.4 ? "tank" : "soldier",
            vx: (Math.random() - 0.5) * 0.0012, hp: 1, cool: Math.random() * 120,
          });
        }
      }

      for (const u of s.units) {
        u.x += u.vx + (u.side === 0 ? 0.0004 : -0.0004) * (s.momentum === 0 ? 1 : s.momentum * -u.side * 2);
        u.x = Math.max(0.03, Math.min(0.97, u.x));
        const ux = u.x * W;
        const uy = ground + (u.type === "tank" ? 10 : 22) + ((u.x * 997) % 3) * 6;
        const colors = u.side === 0 ? f.sideA.colors : f.sideB.colors;
        u.cool--;
        if (u.cool <= 0 && Math.abs(u.x - 0.5) > 0.12) {
          u.cool = 60 + Math.random() * 160;
          // dispara hacia el otro lado
          const ex = (u.side === 0 ? 0.52 + Math.random() * 0.3 : 0.18 + Math.random() * 0.3) * W;
          const ey = ground + Math.random() * 20;
          s.tracers.push({ x1: ux, y1: uy - 12, x2: ex, y2: ey, life: 14 });
          if (Math.random() < 0.3) s.booms.push({ x: ex, y: ey, r: 2, max: 10 + Math.random() * 12 });
          if (Math.random() < 0.5) s.smokes.push({ x: ex, y: ey, r: 4, vx: 0.15, life: 90 });
        }
        if (u.type === "tank") drawTank(ctx, u, u.side === 0 ? 1 : -1, colors);
        else drawSoldier(ctx, u, t, colors);
      }
      // banderas de ambos ejércitos
      const flag = (fx: number, colors: string[], name: string, dir: number) => {
        ctx.fillStyle = "#1a1e27"; ctx.fillRect(fx, ground - 74, 2, 74);
        const w = 26, h = 16;
        const stripes = Math.max(2, colors.length);
        colors.slice(0, 3).forEach((c, i) => {
          ctx.fillStyle = c;
          ctx.fillRect(dir === 1 ? fx + 2 : fx + 2 - w, ground - 74 + (h / stripes) * i, w, h / stripes + 1);
        });
        ctx.fillStyle = "#7a8194"; ctx.font = "9px monospace"; ctx.textAlign = dir === 1 ? "left" : "right";
        ctx.fillText(name, dir === 1 ? fx + 4 : fx - 2, ground - 80);
      };
      flag(24, f.sideA.colors, f.sideA.name.toUpperCase(), 1);
      flag(W - 26, f.sideB.colors, f.sideB.name.toUpperCase(), -1);

      // trazadoras
      for (const tr of s.tracers) {
        tr.life--;
        ctx.strokeStyle = `rgba(255,210,80,${tr.life / 16})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(tr.x1, tr.y1); ctx.lineTo(tr.x2, tr.y2); ctx.stroke();
      }
      s.tracers = s.tracers.filter((tr) => tr.life > 0);

      // explosiones
      for (const b of s.booms) {
        b.r += 1.4;
        const a = 1 - b.r / b.max;
        if (a > 0) {
          const g = ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.r);
          g.addColorStop(0, `rgba(255,230,140,${a})`);
          g.addColorStop(0.5, `rgba(255,120,40,${a * 0.8})`);
          g.addColorStop(1, "transparent");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        }
      }
      s.booms = s.booms.filter((b) => b.r < b.max);

      // humo
      for (const sm of s.smokes) {
        sm.life--; sm.x += sm.vx; sm.r += 0.35;
        ctx.fillStyle = `rgba(140,140,150,${(sm.life / 90) * 0.25})`;
        ctx.beginPath(); ctx.arc(sm.x, sm.y - (90 - sm.life) * 0.25, sm.r, 0, Math.PI * 2); ctx.fill();
      }
      s.smokes = s.smokes.filter((sm) => sm.life > 0);

      // bajas en vivo + control
      if (t % 45 === 0) {
        setCasualties((c) => c + Math.round(Math.random() * f.intensity / 26));
        setControl((c) => Math.max(22, Math.min(78, c + (Math.random() - 0.5) * 1.4 + s.momentum * 0.3)));
      }
      if (t % 240 === 0) {
        pushLog(Math.random() < 0.5
          ? `Artillería de ${f.sideA.name} impacta en posiciones de ${f.sideB.name}`
          : `Drones FPV de ${f.sideB.name} interceptados sobre la línea de contacto`);
      }

      // HUD del canvas
      ctx.fillStyle = "#7a8194"; ctx.font = "10px monospace"; ctx.textAlign = "left";
      ctx.fillText(`CÁM. TÁCTICA · ${f.name.toUpperCase()} · ${new Date().toUTCString().slice(17, 25)} UTC`, 10, H - 8);
      ctx.fillStyle = "#FF3B30";
      ctx.beginPath(); ctx.arc(W - 60, H - 12, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#7a8194"; ctx.fillText("EN VIVO", W - 50, H - 8);

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [pushLog]);

  // STRIKE JUGABLE: artillería donde el operador haga clic
  const handleStrike = useCallback(async (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cv = canvasRef.current;
    if (!cv) return;
    if (!spendCoins(15, "Strike de artillería")) {
      toast.error("Monedas insuficientes para llamar fuego (15 ◉)");
      return;
    }
    const rect = cv.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * cv.width;
    const y = ((e.clientY - rect.top) / rect.height) * cv.height;
    const s = stateRef.current;
    const ground = cv.height * 0.72;
    // ráfaga de 3 impactos
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        s.booms.push({ x: x + (Math.random() - 0.5) * 46, y: y + (Math.random() - 0.5) * 20, r: 2, max: 18 });
        s.smokes.push({ x, y, r: 5, vx: 0.2, life: 80 });
      }, i * 130);
    }
    // efectividad: impactos cerca de unidades enemigas del lado B
    const enemies = s.units.filter((u) => u.side === 1);
    const hits = enemies.filter((u) => Math.abs(u.x * cv.width - x) < 55).length;
    const reward = hits > 0 ? 25 + hits * 15 : 5;
    const ground2 = ground; // (evita warning unused)
    void ground2;
    addCoins(reward, `Strike efectivo (${hits} impactos)`);
    if (hits > 0) {
      s.units = s.units.filter((u) => !(u.side === 1 && Math.abs(u.x * cv.width - x) < 55));
      s.momentum = Math.max(1, s.momentum + 0.12);
      setControl((c) => Math.min(78, c + 1.2));
    }
    pushLog(`STRIKE del operador → ${hits} blancos destruidos · +${reward} ◉`);
    toast.success(hits > 0 ? `¡${hits} blancos destruidos! +${reward} monedas` : `Impacto registrado · +${reward} monedas`);
  }, [addCoins, spendCoins, pushLog]);

  const droneStrike = useCallback(() => {
    if (!spendCoins(30, "Strike con dron")) {
      toast.error("Monedas insuficientes para el dron (30 ◉)");
      return;
    }
    const s = stateRef.current;
    const cv = canvasRef.current;
    if (!cv) return;
    const enemies = s.units.filter((u) => u.side === 1);
    const kill = Math.min(4, enemies.length);
    for (let i = 0; i < kill; i++) {
      const u = enemies[i * Math.max(1, Math.floor(enemies.length / 4))];
      if (u) {
        s.booms.push({ x: u.x * cv.width, y: cv.height * 0.72 + 14, r: 2, max: 22 });
        s.smokes.push({ x: u.x * cv.width, y: cv.height * 0.72 + 14, r: 6, vx: 0.25, life: 100 });
      }
    }
    s.units = s.units.filter((u) => !enemies.includes(u));
    s.momentum = Math.max(1, s.momentum + 0.2);
    const reward = 20 + kill * 25;
    addCoins(reward, "Dron táctico: columna aniquilada");
    setControl((c) => Math.min(78, c + 2));
    pushLog(`DRON FPV en acción → ${kill} vehículos destruidos · +${reward} ◉`);
    toast.success(`Dron: ${kill} blancos destruidos · +${reward} monedas`);
  }, [addCoins, spendCoins, pushLog]);

  const cb = useGameStore((s) => s.coins);

  return (
    <div className="space-y-4">
      {/* selector de frentes */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FRONTS.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setFrontIdx(i)}
            className={`shrink-0 px-3 py-2 rounded-md border text-left transition-colors ${
              i === frontIdx ? "border-red-hud/70 bg-red-hud/10" : "border-border hover:border-red-hud/40"
            }`}
            aria-pressed={i === frontIdx}
          >
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider">{f.name}</div>
            <div className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
              <Flame className="w-2.5 h-2.5 text-red-hud" /> intensidad {f.intensity}%
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* CANVAS TÁCTICO */}
        <div className="hud-panel overflow-hidden">
          <canvas
            ref={canvasRef}
            width={880}
            height={430}
            onClick={handleStrike}
            className="w-full h-auto block cursor-crosshair"
            aria-label={`Vista táctica en vivo de ${front.name}. Haz clic para llamar artillería.`}
          />
          <div className="px-3 py-2 border-t border-border flex flex-wrap items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <Crosshair className="w-3.5 h-3.5 text-red-hud" />
            CLIC EN EL MAPA = strike de artillería (15 ◉) · recompensa por blancos destruidos
            <Button size="sm" variant="outline" onClick={droneStrike} className="ml-auto h-7 font-mono text-[10px] gap-1.5 border-red-hud/40 text-red-hud hover:bg-red-hud/10">
              <Target className="w-3.5 h-3.5" /> STRIKE CON DRON · 30 ◉
            </Button>
          </div>
        </div>

        {/* PANEL DE INFORMACIÓN */}
        <div className="space-y-3">
          <div className="hud-panel p-4 space-y-3">
            <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-hud" /> {front.name}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{front.note}</p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="border border-border rounded p-2">
                <div className="text-muted-foreground flex items-center gap-1.5">
                  {front.sideA.code && <Flag code={front.sideA.code} size={16} />}
                  FUERZAS {front.sideA.name.toUpperCase()}
                </div>
                <div className="text-lg font-bold" style={{ color: front.sideA.colors[0] }}>{front.unitsA + stateRef.current.units.filter((u) => u.side === 0).length * 0} unidades</div>
              </div>
              <div className="border border-border rounded p-2">
                <div className="text-muted-foreground flex items-center gap-1.5">
                  {front.sideB.code && <Flag code={front.sideB.code} size={16} />}
                  FUERZAS {front.sideB.name.toUpperCase()}
                </div>
                <div className="text-lg font-bold" style={{ color: front.sideB.colors[0] }}>{front.unitsB} unidades</div>
              </div>
            </div>
            {/* control del territorio */}
            <div>
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground mb-1">
                <span className="flex items-center gap-1">{front.sideA.code && <Flag code={front.sideA.code} size={12} />}{front.sideA.name}</span>
                <span className="flex items-center gap-1">{front.sideB.name}{front.sideB.code && <Flag code={front.sideB.code} size={12} />}</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden bg-black/60 flex" aria-label="Control del frente">
                <div className="h-full transition-all duration-700" style={{ width: `${control}%`, background: front.sideA.colors[0] }} />
                <div className="h-full flex-1" style={{ background: front.sideB.colors[0] }} />
              </div>
              <div className="text-center text-[9px] font-mono text-muted-foreground mt-0.5">control del terreno {control.toFixed(0)}% / {(100 - control).toFixed(0)}%</div>
            </div>
            {/* bajas */}
            <div className="flex items-center gap-2 border border-red-hud/30 rounded p-2 bg-red-hud/5">
              <Skull className="w-4 h-4 text-red-hud" />
              <div>
                <div className="text-[9px] font-mono text-muted-foreground">BAJAS ESTIMADAS (acumulado del conflicto)</div>
                <div className="text-red-hud font-bold font-mono text-sm tabular-nums">{casualties.toLocaleString("es")}</div>
              </div>
            </div>
            {/* v51.2 — meteo operativa del frente (Open-Meteo, sin key) */}
            {frontMeteo && (
              <div className="border border-electric/30 rounded p-2 bg-electric/5 space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                  <span>METEO OPERATIVA · {frontMeteo.name}</span>
                  <span className={frontMeteo.drone === "OK" ? "text-green-hud" : frontMeteo.drone === "RIESGO" ? "text-amber" : "text-red-hud"}>
                    DRON FPV: {frontMeteo.drone === "OK" ? "VUELA" : frontMeteo.drone === "RIESGO" ? "RIESGO" : "EN TIERRA"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="font-bold">{frontMeteo.temp !== null ? `${frontMeteo.temp}°C` : "—"}</span>
                  <span className="text-muted-foreground">{frontMeteo.cond}</span>
                  <span className="text-muted-foreground">viento {frontMeteo.wind !== null ? `${frontMeteo.wind} m/s` : "—"}</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-amber" /> saldo: {cb.toLocaleString("es")} ◉</span>
              <span className="flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-electric" /> momentum aliado: {(stateRef.current.momentum * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* bitácora */}
          <div className="hud-panel p-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
              <Radio className="w-3.5 h-3.5 text-green-hud blink-soft" /> Bitácora del frente
            </div>
            <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {log.map((l, i) => (
                <li key={i} className="text-[10px] font-mono text-foreground/80 leading-snug">{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
