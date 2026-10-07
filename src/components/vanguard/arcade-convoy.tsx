"use client";

// VANGUARD v83.0 ESTADIO GLOBAL — ARCADE #11: CONVOY BAJO FUEGO.
// Canvas 60fps: noche de luna llena, un convoy de 3 camiones cruza el desierto
// y los drones caen en picado. Toca los drones antes de que alcancen los
// camiones · combo x2 a partir de 5 seguidos · 45 segundos · 3 camiones = 9 vidas.

import { useEffect, useRef, useState } from "react";
import { Truck, Crosshair, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/sound";

export const CONVOY_DURATION = 45; // segundos

interface Drone {
  x: number; y: number; vy: number; drift: number; phase: number; target: number; dead: boolean;
}
interface Boom {
  x: number; y: number; t: number; hue: "drone" | "truck";
}
interface TruckUnit {
  x: number; hp: number;
}

export function ArcadeConvoy({
  onEnd,
  onExit,
}: {
  onEnd: (score: number) => void;
  onExit: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [left, setLeft] = useState(CONVOY_DURATION);
  const [trucksHp, setTrucksHp] = useState([3, 3, 3]);
  const [running, setRunning] = useState(true);

  // estado del juego en refs (los callbacks del rAF no re-renderizan)
  const drones = useRef<Drone[]>([]);
  const booms = useRef<Boom[]>([]);
  const trucks = useRef<TruckUnit[]>([{ x: 170, hp: 3 }, { x: 330, hp: 3 }, { x: 490, hp: 3 }]);
  const scroll = useRef(0);
  const comboRef = useRef(0);
  const scoreRef = useRef(0);
  const spawnT = useRef(0);
  const finished = useRef(false);
  const timeRef = useRef(CONVOY_DURATION);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const W = 660, H = 380;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.scale(dpr, dpr);

    const endGame = () => {
      if (finished.current) return;
      finished.current = true;
      setRunning(false);
      sfx.levelUp();
      onEnd(scoreRef.current);
    };

    // ====== dibujo de la escena ======
    const drawMoon = () => {
      const g = ctx.createRadialGradient(560, 70, 8, 560, 70, 90);
      g.addColorStop(0, "rgba(255,236,190,0.95)");
      g.addColorStop(0.25, "rgba(255,214,140,0.35)");
      g.addColorStop(1, "rgba(255,180,90,0)");
      ctx.fillStyle = g;
      ctx.fillRect(460, -30, 200, 200);
      ctx.fillStyle = "#ffeec2";
      ctx.beginPath();
      ctx.arc(560, 70, 26, 0, 7);
      ctx.fill();
      ctx.fillStyle = "rgba(200,170,120,0.5)";
      ctx.beginPath(); ctx.arc(552, 64, 5, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(568, 76, 4, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(560, 58, 3, 0, 7); ctx.fill();
    };

    const drawTruck = (t: TruckUnit, idx: number) => {
      const y = 268 + (idx % 2) * 4;
      if (t.hp <= 0) {
        // chatarra humeante
        ctx.fillStyle = "rgba(30,25,22,0.9)";
        ctx.fillRect(t.x - 16, y - 8, 32, 14);
        ctx.fillStyle = "rgba(80,70,60,0.5)";
        ctx.beginPath(); ctx.arc(t.x, y - 16 + Math.sin(Date.now() / 300 + idx) * 3, 5, 0, 7); ctx.fill();
        return;
      }
      // faro que abre la noche
      const beam = ctx.createLinearGradient(t.x + 18, y, t.x + 90, y + 10);
      beam.addColorStop(0, "rgba(255,214,140,0.35)");
      beam.addColorStop(1, "rgba(255,214,140,0)");
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(t.x + 18, y - 2);
      ctx.lineTo(t.x + 95, y - 14);
      ctx.lineTo(t.x + 95, y + 16);
      ctx.lineTo(t.x + 18, y + 4);
      ctx.closePath(); ctx.fill();
      // caja + cabina
      ctx.fillStyle = idx === 0 ? "#8a5a2b" : "#6f4a24";
      ctx.fillRect(t.x - 16, y - 12, 34, 14);
      ctx.fillStyle = "#9c6a33";
      ctx.fillRect(t.x + 12, y - 18, 12, 20);
      // luna reflejada en la lona
      ctx.fillStyle = "rgba(255,238,194,0.18)";
      ctx.fillRect(t.x - 14, y - 11, 28, 4);
      // ruedas
      ctx.fillStyle = "#120e0a";
      for (const wx of [t.x - 8, t.x + 4, t.x + 18]) {
        ctx.beginPath(); ctx.arc(wx, y + 4, 5, 0, 7); ctx.fill();
      }
      // barra de vida mini
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(t.x - 16, y - 26, 32, 3);
      ctx.fillStyle = t.hp >= 3 ? "#00FF87" : t.hp === 2 ? "#FFB347" : "#FF3B30";
      ctx.fillRect(t.x - 16, y - 26, (t.hp / 3) * 32, 3);
    };

    const drawDrone = (d: Drone) => {
      ctx.save();
      ctx.translate(d.x, d.y);
      const tilt = Math.sin(d.phase) * 0.18;
      ctx.rotate(tilt);
      // hélices
      ctx.strokeStyle = "rgba(200,210,230,0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-13, -6); ctx.lineTo(13, -6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-9, -6 - Math.sin(Date.now() / 40) * 3); ctx.lineTo(-5, -6 + Math.sin(Date.now() / 40) * 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(5, -6 - Math.cos(Date.now() / 40) * 3); ctx.lineTo(9, -6 + Math.cos(Date.now() / 40) * 3); ctx.stroke();
      // cuerpo
      ctx.fillStyle = "#1c1620";
      ctx.fillRect(-8, -5, 16, 9);
      ctx.strokeStyle = "#FF3B30";
      ctx.lineWidth = 1;
      ctx.strokeRect(-8, -5, 16, 9);
      // LED y láser de objetivo
      ctx.fillStyle = "#FF3B30";
      ctx.beginPath(); ctx.arc(0, 3, 2, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(255,59,48,0.35)";
      ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(0, 34); ctx.stroke();
      ctx.restore();
    };

    const drawBooms = () => {
      booms.current = booms.current.filter((b) => b.t > 0);
      for (const b of booms.current) {
        b.t -= 1;
        const r = (1 - b.t / 22) * 26 + 4;
        const alpha = b.t / 22;
        const col = b.hue === "drone" ? "255,179,71" : "255,59,48";
        const g = ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, r);
        g.addColorStop(0, `rgba(${col},${alpha})`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, 7); ctx.fill();
      }
    };

    // ====== bucle ======
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(50, now - last) / 1000;
      last = now;

      if (running && !finished.current) {
        timeRef.current -= dt;
        if (timeRef.current <= 0) {
          timeRef.current = 0;
          endGame();
        }
        if (Math.ceil(timeRef.current) !== left) setLeft(Math.max(0, Math.ceil(timeRef.current)));

        scroll.current += 90 * dt;
        spawnT.current -= dt;
        const elapsed = CONVOY_DURATION - timeRef.current;
        const rate = Math.max(0.55, 1.5 - elapsed / 40); // aprieta con el tiempo
        if (spawnT.current <= 0) {
          spawnT.current = rate;
          const alive = trucks.current.filter((t) => t.hp > 0);
          if (alive.length > 0) {
            const target = alive[Math.floor(Math.random() * alive.length)];
            drones.current.push({
              x: 40 + Math.random() * (W - 80), y: -14,
              vy: 46 + Math.random() * 26 + elapsed * 1.1,
              drift: (Math.random() - 0.5) * 30, phase: Math.random() * 7,
              target: target.x, dead: false,
            });
          }
        }

        for (const d of drones.current) {
          d.phase += dt * 6;
          d.y += d.vy * dt;
          d.x += Math.sin(d.phase) * d.drift * dt + (d.target - d.x) * 0.35 * dt;
          if (d.y >= 250) {
            // impacto: busca el camión más cercano vivo
            d.dead = true;
            booms.current.push({ x: d.x, y: 252, t: 22, hue: "truck" });
            const alive = trucks.current.filter((t) => t.hp > 0);
            if (alive.length) {
              let best = alive[0], bd = 1e9;
              for (const t of alive) {
                const dist = Math.abs(t.x - d.x);
                if (dist < bd) { bd = dist; best = t; }
              }
              best.hp -= 1;
              comboRef.current = 0;
              setCombo(0);
              setTrucksHp(trucks.current.map((t) => t.hp));
              sfx.error();
              if (trucks.current.every((t) => t.hp <= 0)) endGame();
            }
          }
        }
        drones.current = drones.current.filter((d) => !d.dead);
      }

      // ====== pintar ======
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#0b0812");
      sky.addColorStop(0.55, "#16101c");
      sky.addColorStop(0.8, "#2b160e");
      sky.addColorStop(1, "#1a0f08");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // estrellas
      ctx.fillStyle = "rgba(255,244,220,0.8)";
      for (let i = 0; i < 26; i++) {
        const sx = (i * 71.3) % W;
        const sy = (i * 37.7) % 150;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 900 + i));
        ctx.globalAlpha = tw * 0.7;
        ctx.fillRect(sx, sy, 1.4, 1.4);
      }
      ctx.globalAlpha = 1;

      drawMoon();

      // dunas (parallax)
      ctx.fillStyle = "#120b16";
      ctx.beginPath();
      ctx.moveTo(0, 210);
      for (let x = 0; x <= W; x += 30) {
        ctx.lineTo(x, 210 + Math.sin((x + scroll.current * 0.35) / 90) * 14);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();

      // carretera
      ctx.fillStyle = "#0d0a08";
      ctx.fillRect(0, 246, W, 92);
      ctx.strokeStyle = "rgba(255,179,71,0.45)";
      ctx.lineWidth = 2;
      ctx.setLineDash([26, 22]);
      ctx.lineDashOffset = -(scroll.current % 48);
      ctx.beginPath(); ctx.moveTo(0, 292); ctx.lineTo(W, 292); ctx.stroke();
      ctx.setLineDash([]);

      for (const t of trucks.current) drawTruck(t, trucks.current.indexOf(t));
      for (const d of drones.current) drawDrone(d);
      drawBooms();

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  // ====== disparo ======
  const shoot = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!running || finished.current) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 660;
    const my = ((e.clientY - rect.top) / rect.height) * 380;
    let hit = -1, hd = 30;
    drones.current.forEach((d, i) => {
      const dist = Math.hypot(d.x - mx, d.y - my);
      if (dist < hd) { hd = dist; hit = i; }
    });
    if (hit >= 0) {
      const d = drones.current[hit];
      d.dead = true;
      drones.current.splice(hit, 1);
      booms.current.push({ x: d.x, y: d.y, t: 22, hue: "drone" });
      comboRef.current += 1;
      setCombo(comboRef.current);
      const mult = comboRef.current >= 5 ? 2 : 1;
      scoreRef.current += 10 * mult;
      setScore(scoreRef.current);
      sfx.click();
    } else {
      comboRef.current = 0;
      setCombo(0);
    }
  };

  return (
    <div className="space-y-2">
      {/* HUD */}
      <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
        <span className="px-2 py-1 border border-amber-hud/60 bg-amber-hud/15 text-amber flex items-center gap-1">
          <Truck className="w-3 h-3" /> PUNTOS: <b>{score}</b>
        </span>
        <span className={cn("px-2 py-1 border flex items-center gap-1", combo >= 5 ? "border-red-hud bg-red-hud/20 text-red-hud" : "border-border/60 text-muted-foreground")}>
          <Flame className="w-3 h-3" /> COMBO ×{combo >= 5 ? 2 : 1} ({combo})
        </span>
        <span className="px-2 py-1 border border-border/60 text-muted-foreground flex items-center gap-1">
          <Crosshair className="w-3 h-3" /> {left}s
        </span>
        <span className="px-2 py-1 border border-border/60 text-muted-foreground">
          CAMIONES: {trucksHp.map((h) => (h > 0 ? "▮".repeat(h) : "▯▯▯")).join(" ")}
        </span>
        <Button size="sm" variant="ghost" onClick={onExit} className="ml-auto h-7 px-2 text-[10px] font-mono text-muted-foreground">
          ABANDONAR
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={shoot}
        className="w-full rounded-sm border border-amber-hud/50 cursor-crosshair touch-none"
        style={{ aspectRatio: "660/380", background: "#0b0812" }}
      />
      <p className="text-[9px] font-mono text-muted-foreground">
        TOCA los drones antes de que toquen un camión · 5 seguidos = COMBO ×2 · los fallos rompen el combo
      </p>
    </div>
  );
}
