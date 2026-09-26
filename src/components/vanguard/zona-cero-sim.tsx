"use client";

// v52.0 ZONA CERO — "LA CIUDAD QUE CAE": espectáculo de guerra nunca visto en
// una página de conflictos. Motor de simulación propio sobre canvas 2D:
// - Ciudad procedural que colapsa piso por piso bajo artillería, bombs de jets,
//   cohetes de helicópteros y drones. El daño es PERSISTENTE (localStorage):
//   mientras no miras, la guerra sigue avanzando en tu ciudad.
// - DIRECTOR CINEMATOGRÁFICO: la cámara persigue la acción sola, entra en
//   cámara lenta en las grandes explosiones y rótula con rótulos de corresponsal.
// - FUSIÓN REAL: despachos de GDELT (proyecto abierto, 100k medios, sin key)
//   disparan operaciones dentro de la simulación. Lo que pasa en el mundo
//   pasa en Zona Cero.
// - SONIDO 100% sintetizado con WebAudio (artillería lejana, silbido de obús,
//   ametralladoras, sirena de colapso). Sin assets ni copyright.
// - Muñecos en vivo: soldados que avanzan y caen, tanques, jets, helicópteros
//   y drones peleando sin parar sobre una ciudad que se convierte en ruinas.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Volume2, VolumeX, Clapperboard, Crosshair, ZoomIn, ZoomOut, RotateCcw, Radio,
} from "lucide-react";

// ---------------------------------------------------------------- tipos ----

interface Bldg {
  x: number; w: number; h0: number; h: number; floors: number;
  seed: number; burn: number; holes: number[]; // huecos: fracción de h0
  collapsed: boolean; targetH: number; winT: number;
}
interface Soldier {
  x: number; dir: 1 | -1; side: 0 | 1; hp: number; t: number; cd: number;
  state: 0 | 1 | 2; // 0 avanza, 1 combate, 2 cayendo
  dieT: number; speed: number;
}
interface Tank { x: number; dir: 1 | -1; side: 0 | 1; hp: number; cd: number; recoil: number }
interface Jet {
  x: number; y: number; dir: 1 | -1; side: 0 | 1; dropped: number; drops: number;
  tx: number; trail: number;
}
interface Heli { x: number; y: number; side: 0 | 1; dir: 1 | -1; cd: number; bob: number }
interface Drone { x: number; y: number; side: 0 | 1; cd: number; t: number }
interface Shell { x: number; y: number; vx: number; vy: number; big: boolean; silent: boolean }
interface Tracer { x: number; y: number; vx: number; vy: number; life: number; side: 0 | 1 }
interface Boom { x: number; y: number; r: number; max: number; t: number; big: boolean }
interface Shock { x: number; y: number; r: number; t: number }
interface Part {
  x: number; y: number; vx: number; vy: number; life: number; max: number;
  kind: 0 | 1 | 2; r: number; // 0 humo, 1 restos, 2 chispa
}
interface Decal { x: number; r: number; a: number; kind: 0 | 1 } // 0 cráter, 1 baja
interface Fire { x: number; y: number; life: number; max: number; r: number }
interface Flare { x: number; y: number; vy: number; life: number }
interface Heat { x: number; y: number; t: number; p: number }
interface Kill { id: number; text: string; real: boolean; url?: string; t: number }

interface Sim {
  t: number; timeScale: number; wind: number;
  bldgs: Bldg[]; soldiers: Soldier[]; tanks: Tank[]; jets: Jet[];
  helis: Heli[]; drones: Drone[]; shells: Shell[]; tracers: Tracer[];
  booms: Boom[]; shocks: Shock[]; parts: Part[]; decals: Decal[];
  fires: Fire[]; flares: Flare[]; heat: Heat[]; kills: Kill[];
  stars: { x: number; y: number; r: number; p: number }[];
  cam: { x: number; y: number; z: number; tx: number; ty: number; tz: number; shake: number };
  slow: number; flash: number;
  stats: { dev: number; collapsed: number; craters: number; cas: number; strikes: number; ops: number };
  caption: { text: string; life: number } | null;
  nextBarrage: number; nextJet: [number, number]; nextHeli: [number, number];
  nextDrone: [number, number]; nextFlare: number; nextWave: [number, number];
  waveN: [number, number];
  strikeMode: boolean; manual: boolean;
  audioRef?: Audio | null;
}

// ------------------------------------------------------------ constantes ----

const W = 1600, H = 900, GROUND = 792;
const SIDE = [
  { name: "EJE DEL NORTE", main: "#ff5a4e", dark: "#7a221c", glow: "rgba(255,90,78," },
  { name: "COALICIÓN SUR", main: "#3fd6e0", dark: "#155e66", glow: "rgba(63,214,224," },
];
const DEV_MAX = 78; // % de devastación del récord narrativo

const r2 = (a: number, b: number) => a + Math.random() * (b - a);
const ri = (a: number, b: number) => Math.floor(r2(a, b + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ------------------------------------------------------- motor de sonido ----

function makeAudio() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let on = false;
  function ensure(): boolean {
    if (typeof window === "undefined") return false;
    if (!ctx) {
      const AC = window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return true;
  }
  function noiseBuf(dur: number): AudioBuffer | null {
    if (!ctx) return null;
    const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  // estallido lejano/cercano; dist 0 = en cámara
  function boom(dist: number, big: boolean) {
    if (!on || !ensure() || !ctx || !master) return;
    const t0 = ctx.currentTime;
    const dur = big ? 1.5 : 0.7;
    const buf = noiseBuf(dur); if (!buf) return;
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] *= Math.pow(1 - i / d.length, 2.1);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "lowpass";
    f.frequency.value = big ? 150 : 240;
    const g = ctx.createGain();
    const vol = (big ? 0.85 : 0.42) * clamp(1 - dist / 1.7, 0.12, 1);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t0);
    // golpe grave del impacto
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(big ? 52 : 70, t0);
    o.frequency.exponentialRampToValueAtTime(28, t0 + (big ? 0.9 : 0.4));
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(vol * 0.8, t0);
    g2.gain.exponentialRampToValueAtTime(0.001, t0 + (big ? 1.1 : 0.5));
    o.connect(g2); g2.connect(master); o.start(t0); o.stop(t0 + 1.2);
  }
  function whistle(dur: number) {
    if (!on || !ensure() || !ctx || !master) return;
    const t0 = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(1500, t0);
    o.frequency.exponentialRampToValueAtTime(240, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.16, t0 + dur * 0.75);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function chatter() {
    if (!on || !ensure() || !ctx || !master) return;
    const n = ri(4, 8);
    for (let i = 0; i < n; i++) {
      const t0 = ctx.currentTime + i * r2(0.05, 0.1);
      const buf = noiseBuf(0.045); if (!buf) return;
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1100;
      const g = ctx.createGain();
      g.gain.setValueAtTime(r2(0.05, 0.11), t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
      src.connect(f); f.connect(g); g.connect(master); src.start(t0);
    }
  }
  function siren() {
    if (!on || !ensure() || !ctx || !master) return;
    const t0 = ctx.currentTime;
    for (let c = 0; c < 3; c++) {
      const o = ctx.createOscillator(); o.type = "triangle";
      const base = t0 + c * 1.3;
      o.frequency.setValueAtTime(560, base);
      o.frequency.linearRampToValueAtTime(760, base + 0.6);
      o.frequency.linearRampToValueAtTime(560, base + 1.2);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, base);
      g.gain.exponentialRampToValueAtTime(0.1, base + 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, base + 1.25);
      o.connect(g); g.connect(master); o.start(base); o.stop(base + 1.3);
    }
  }
  return {
    get on() { return on; },
    toggle(): boolean { on = !on; if (on) ensure(); return on; },
    boom, whistle, chatter, siren,
  };
}
type Audio = ReturnType<typeof makeAudio>;

// ------------------------------------------------------ creación del mundo ----

function buildCity(): Bldg[] {
  const out: Bldg[] = [];
  let x = 70;
  while (x < W - 110) {
    const w = r2(46, 96);
    const floors = ri(5, 16);
    const fh = r2(21, 26);
    const h0 = floors * fh;
    out.push({
      x: x + w / 2, w, h0, h: h0, floors, seed: Math.random() * 1000,
      burn: 0, holes: [], collapsed: false, targetH: h0, winT: Math.random() * 10,
    });
    x += w + r2(10, 34);
  }
  return out;
}

function newSoldier(side: 0 | 1, x: number): Soldier {
  return {
    x, dir: side === 0 ? 1 : -1, side, hp: ri(60, 100), t: Math.random() * 9,
    cd: r2(0.5, 2), state: 0, dieT: 0, speed: r2(26, 44),
  };
}

function createSim(restored?: { dev: number; collapsed: number; craters: number; cas: number; awayMin: number }): Sim {
  const bldgs = buildCity();
  // descanso: la ciudad ya viene dañada si el visitante ya estuvo aquí
  if (restored) {
    const dmg = clamp(restored.dev / 100, 0, 0.72) + clamp(restored.awayMin * 0.0009, 0, 0.18);
    for (const b of bldgs) {
      const k = clamp(dmg * r2(0.4, 1.35), 0, 1);
      b.h = Math.max(30, b.h0 * (1 - k * 0.85));
      b.targetH = b.h;
      if (b.h < b.h0 * 0.28) { b.collapsed = true; }
      else if (k > 0.3 && Math.random() < 0.5) b.holes.push(r2(0.2, 0.75));
      if (Math.random() < k * 0.35) b.burn = r2(0.4, 1);
    }
    for (let i = 0; i < restored.craters + restored.collapsed * 2; i++) {
      // los cráteres restaurados se agregan tras crear el mundo
    }
  }
  const sim: Sim = {
    t: 0, timeScale: 1, wind: r2(-0.3, 0.3),
    bldgs,
    soldiers: [], tanks: [], jets: [], drones: [], helis: [],
    shells: [], tracers: [], booms: [], shocks: [], parts: [], decals: [],
    fires: [], flares: [], heat: [], kills: [],
    stars: Array.from({ length: 110 }, () => ({
      x: Math.random() * W, y: Math.random() * 380, r: r2(0.4, 1.4), p: Math.random() * 6.28,
    })),
    cam: { x: W / 2, y: H * 0.46, z: 1, tx: W / 2, ty: H * 0.46, tz: 1, shake: 0 },
    slow: 0, flash: 0,
    stats: { dev: 0, collapsed: 0, craters: 0, cas: 0, strikes: 0, ops: 0 },
    caption: { text: "ZONA CERO — TRANSMISIÓN EN DIRECTO DESDE LA CIUDAD CERCADA", life: 6 },
    nextBarrage: 4,
    nextJet: [r2(8, 20), r2(14, 30)],
    nextHeli: [r2(6, 14), r2(10, 22)],
    nextDrone: [r2(10, 22), r2(16, 30)],
    nextFlare: 8,
    nextWave: [1.5, 2.5],
    waveN: [0, 0],
    strikeMode: false, manual: false,
  };
  // restaurar marcas del terreno
  if (restored) {
    for (let i = 0; i < clamp(restored.craters, 0, 60); i++) {
      sim.decals.push({ x: r2(80, W - 80), r: r2(9, 26), a: r2(0.25, 0.5), kind: 0 });
    }
    sim.stats.cas = restored.cas;
    sim.stats.collapsed = sim.bldgs.filter((b) => b.collapsed).length;
  }
  // guarniciones iniciales
  for (let i = 0; i < 8; i++) { sim.soldiers.push(newSoldier(0, r2(20, 220))); sim.soldiers.push(newSoldier(1, r2(W - 220, W - 20))); }
  sim.tanks.push({ x: 90, dir: 1, side: 0, hp: 100, cd: r2(3, 6), recoil: 0 });
  sim.tanks.push({ x: W - 90, dir: -1, side: 1, hp: 100, cd: r2(3, 6), recoil: 0 });
  recomputeDev(sim);
  return sim;
}

function recomputeDev(sim: Sim) {
  let acc = 0;
  for (const b of sim.bldgs) acc += clamp(1 - b.h / b.h0, 0, 1);
  sim.stats.dev = clamp((acc / sim.bldgs.length) * 100, 0, 100);
  sim.stats.collapsed = sim.bldgs.filter((b) => b.collapsed).length;
  sim.stats.craters = sim.decals.filter((d) => d.kind === 0).length;
}

function addKill(sim: Sim, text: string, real = false, url?: string) {
  sim.kills.push({ id: Date.now() + Math.random(), text, real, url, t: sim.t });
  if (sim.kills.length > 34) sim.kills.splice(0, sim.kills.length - 34);
}

function heatAt(sim: Sim, x: number, y: number, p: number) {
  sim.heat.push({ x, y, t: sim.t, p });
  if (sim.heat.length > 40) sim.heat.shift();
}

function nearestBldg(sim: Sim, x: number): Bldg | null {
  let best: Bldg | null = null; let bd = 1e9;
  for (const b of sim.bldgs) {
    const d = Math.abs(b.x - x) - b.w / 2;
    if (d < bd) { bd = d; best = b; }
  }
  return bd < 140 ? best : null;
}

function damageBldg(sim: Sim, b: Bldg | null, power: number, x: number, y: number) {
  if (!b || b.collapsed) return;
  const k = clamp(power / 100, 0.1, 1.4);
  b.h = Math.max(b.collapsed ? b.h : 26, b.h - k * r2(18, 42));
  b.targetH = b.h;
  if (Math.random() < 0.7) b.holes.push(clamp((y < GROUND - b.h ? 0.15 : (GROUND - y) / b.h), 0.08, 0.92));
  if (Math.random() < 0.34 + k * 0.3) b.burn = Math.min(1, b.burn + r2(0.4, 0.9));
  if (b.h < b.h0 * 0.26) {
    b.collapsed = true; b.targetH = r2(24, 44);
    sim.shocks.push({ x: b.x, y: GROUND - 30, r: 10, t: 0 });
    sim.flash = Math.max(sim.flash, 0.25);
    addKill(sim, `COLAPSO TOTAL: edificio de ${b.floors} pisos en el sector ${sectorOf(b.x)}`);
    if (sim.audioRef) sim.audioRef.siren();
  }
  // el fuego se contagia al vecino
  if (Math.random() < 0.22) {
    const nb = nearestBldg(sim, x + (Math.random() < 0.5 ? 1 : -1) * r2(60, 120));
    if (nb && !nb.collapsed) nb.burn = Math.min(1, nb.burn + r2(0.2, 0.5));
  }
}

function sectorOf(x: number): string {
  if (x < W / 3) return "NOROESTE";
  if (x < (W * 2) / 3) return "CENTRO";
  return "NORESTE";
}

// ---------------------------------------------------------- explosiones ----

function explode(sim: Sim, x: number, y: number, big: boolean, quiet = false) {
  const max = big ? r2(60, 95) : r2(26, 44);
  sim.booms.push({ x, y, r: 4, max, t: 0, big });
  if (big) sim.shocks.push({ x, y, r: 8, t: 0 });
  heatAt(sim, x, y, big ? 3 : 1);
  const nP = big ? 26 : 12;
  for (let i = 0; i < nP; i++) {
    const a = Math.random() * Math.PI * 2, sp = r2(30, big ? 190 : 110);
    sim.parts.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - r2(20, 90),
      life: 0, max: r2(0.7, big ? 2.6 : 1.4),
      kind: Math.random() < 0.55 ? 2 : 1, r: r2(1, big ? 3.4 : 2.2),
    });
  }
  for (let i = 0; i < (big ? 10 : 4); i++) {
    sim.parts.push({
      x: x + r2(-10, 10), y: y + r2(-6, 6), vx: r2(-14, 14) + sim.wind * 26,
      vy: r2(-46, -14), life: 0, max: r2(1.8, 4.2), kind: 0, r: r2(8, big ? 22 : 13),
    });
  }
  const dist = Math.abs(x - sim.cam.x) / (W * 0.5);
  if (!quiet && sim.audioRef) { sim.audioRef.boom(dist, big); if (big && dist < 0.55) sim.audioRef.chatter(); }
  const sh = big ? 14 : 6;
  sim.cam.shake = Math.min(26, sim.cam.shake + sh * clamp(1 - dist, 0.15, 1));
  if (big && dist < 0.4) { sim.slow = Math.max(sim.slow, 1.15); sim.flash = Math.max(sim.flash, 0.3); }
  // bajas y daño en radio
  const R = max * 1.15;
  for (const s of sim.soldiers) {
    if (s.state !== 2 && Math.abs(s.x - x) < R && Math.random() < (big ? 0.75 : 0.4)) {
      s.state = 2; s.dieT = 0; sim.stats.cas++;
      sim.decals.push({ x: s.x, r: 7, a: 1, kind: 1 });
      if (sim.decals.length > 140) sim.decals.shift();
      addKill(sim, `Baja confirmada — infantería ${SIDE[s.side].name} en el sector ${sectorOf(s.x)}`);
    }
  }
  for (const tk of sim.tanks) {
    if (Math.abs(tk.x - x) < R * 0.8 && Math.random() < (big ? 0.5 : 0.2)) {
      tk.hp -= big ? 120 : 40;
      if (tk.hp <= 0) {
        addKill(sim, `Tanque ${SIDE[tk.side].name} destruido — bola de fuego en el sector ${sectorOf(tk.x)}`);
        explode(sim, tk.x, GROUND - 14, true, true);
        tk.x = tk.side === 0 ? r2(30, 160) : r2(W - 160, W - 30);
        tk.hp = 100; tk.cd = r2(4, 9);
        sim.stats.cas += 2;
      }
    }
  }
  const b = nearestBldg(sim, x);
  if (b && y > GROUND - b.h - 40) damageBldg(sim, b, big ? 110 : 45, x, y);
  if (y > GROUND - 26) {
    sim.decals.push({ x, r: big ? r2(16, 30) : r2(8, 15), a: 0.55, kind: 0 });
    if (sim.decals.length > 140) sim.decals.shift();
  }
  recomputeDev(sim);
}

// ------------------------------------------------------------ ataques ----

function fireShellAt(sim: Sim, tx: number, ty: number, big: boolean, silent = false) {
  const fromLeft = tx > W / 2;
  const sx = fromLeft ? tx - r2(500, 800) : tx + r2(500, 800);
  const sy = -40;
  const T = r2(1.5, 2.2);
  const vx = (tx - sx) / T, vy = (ty - sy - 0.5 * 430 * T * T) / T;
  sim.shells.push({ x: sx, y: sy, vx, vy, big, silent });
  if (!silent && Math.abs(tx - sim.cam.x) < W * 0.42 && sim.audioRef) sim.audioRef.whistle(T * 0.85);
}

function barrage(sim: Sim, x: number, n: number, big: boolean) {
  for (let i = 0; i < n; i++) {
    const tx = x + r2(-90, 90);
    const ty = Math.random() < 0.6 ? GROUND - r2(10, 120) : GROUND - 8;
    window.setTimeout(() => { fireShellAt(sim, tx, ty, big); }, i * r2(120, 420));
  }
}

function realOperation(sim: Sim, title: string, url?: string) {
  const x = r2(200, W - 200);
  sim.stats.ops++;
  const op = pick(["OFENSIVA", "BOMBARDEO", "ATAQUE CON DRONES", "TOMA DE FUEGO", "ASALTO"]);
  addKill(sim, `REAL · ${op} disparado por despacho: ${title.slice(0, 76)}`, true, url);
  barrage(sim, x, ri(4, 7), true);
  if (Math.random() < 0.5) {
    const side: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
    sim.jets.push({
      x: side === 0 ? -80 : W + 80, y: r2(110, 190), dir: side === 0 ? 1 : -1, side,
      dropped: 0, drops: 2, tx: x, trail: 0,
    });
  }
  sim.caption = { text: `DESPACHO REAL → ${op} EN EL SECTOR ${sectorOf(x)}`, life: 5 };
}

// ------------------------------------------------- lógica de simulación ----

function stepSim(sim: Sim, dt0: number, audio: Audio | null) {
  const dt = dt0 * sim.timeScale;
  sim.t += dt;
  sim.wind = Math.sin(sim.t * 0.05) * 0.42;
  if (sim.slow > 0) { sim.slow -= dt0; sim.timeScale = 0.32; }
  else sim.timeScale = lerp(sim.timeScale, 1, 0.06);
  if (sim.flash > 0) sim.flash = Math.max(0, sim.flash - dt0 * 1.4);

  // ---- soldados
  for (const s of sim.soldiers) {
    s.t += dt;
    if (s.state === 2) { s.dieT += dt; continue; }
    const foes = sim.soldiers.filter((f) => f.side !== s.side && f.state !== 2);
    let foe: Soldier | null = null; let fd = 1e9;
    for (const f of foes) { const d = Math.abs(f.x - s.x); if (d < fd) { fd = d; foe = f; } }
    if (foe && fd < 240) {
      s.state = 1;
      s.cd -= dt;
      if (s.cd <= 0) {
        s.cd = r2(0.4, 1.6);
        const aim = foe.x + r2(-14, 14);
        const dx = aim - s.x, dy = -(GROUND - 26 - (GROUND - 20));
        const L = Math.hypot(dx, dy) || 1;
        sim.tracers.push({
          x: s.x + s.dir * 6, y: GROUND - 24,
          vx: (dx / L) * r2(700, 900) + r2(-40, 40), vy: (dy / L) * r2(700, 900) + r2(-30, 30),
          life: r2(0.24, 0.4), side: s.side,
        });
        if (Math.random() < 0.3 && audio) audio.chatter();
        if (Math.random() < 0.16) {
          foe.hp -= r2(30, 70);
          if (foe.hp <= 0 && foe.state !== 2) {
            foe.state = 2; foe.dieT = 0; sim.stats.cas++;
            sim.decals.push({ x: foe.x, r: 7, a: 1, kind: 1 });
            addKill(sim, `Baja en combate — soldado ${SIDE[foe.side].name} abatido en el sector ${sectorOf(foe.x)}`);
            recomputeDev(sim);
          }
        }
      }
    } else {
      s.state = 0;
      s.x += s.dir * s.speed * dt;
      s.x = clamp(s.x, 14, W - 14);
    }
  }
  sim.soldiers = sim.soldiers.filter((s) => !(s.state === 2 && s.dieT > 4));

  // ---- tanques
  for (const tk of sim.tanks) {
    tk.recoil = Math.max(0, tk.recoil - dt * 3);
    const foe = sim.tanks.find((f) => f.side !== tk.side);
    const dx = foe ? foe.x - tk.x : 0;
    const ad = Math.abs(dx);
    if (ad > 460) { tk.x += tk.dir * 17 * dt; }
    tk.cd -= dt;
    if (tk.cd <= 0 && ad < 900) {
      tk.cd = r2(4, 8);
      tk.recoil = 1;
      const tx = (foe ? foe.x : W / 2) + r2(-70, 70);
      const ty = GROUND - r2(4, 30);
      const sx = tk.x + tk.dir * 26, sy = GROUND - 18;
      const T = r2(1.1, 1.6);
      sim.shells.push({
        x: sx, y: sy,
        vx: (tx - sx) / T, vy: (ty - sy - 0.5 * 430 * T * T) / T, big: true, silent: false,
      });
      sim.booms.push({ x: sx + tk.dir * 30, y: sy, r: 12, max: 20, t: 0, big: false });
      heatAt(sim, tk.x, GROUND, 1.4);
      if (audio) audio.boom(Math.abs(tk.x - sim.cam.x) / (W * 0.5), false);
      sim.cam.shake = Math.min(20, sim.cam.shake + 5);
    }
  }

  // ---- jets
  sim.jets = sim.jets.filter((j) => j.x > -220 && j.x < W + 220);
  for (const j of sim.jets) {
    j.x += j.dir * 460 * dt;
    j.trail += dt;
    if (j.dropped < j.drops && ((j.dir === 1 && j.x > j.tx - 160) || (j.dir === -1 && j.x < j.tx + 160))) {
      j.dropped++;
      // bomba de caída libre con inercia del jet
      sim.shells.push({ x: j.x, y: j.y + 8, vx: j.dir * 55, vy: 40, big: true, silent: false });
      if (audio) audio.whistle(0.7);
    }
  }

  // ---- helicópteros
  for (const h of sim.helis) {
    h.bob += dt;
    h.x += h.dir * 30 * dt;
    if (h.x > W * 0.62 && h.dir === 1) h.dir = -1;
    if (h.x < W * 0.38 && h.dir === -1) h.dir = 1;
    h.y = 300 + Math.sin(h.bob * 1.7) * 26;
    h.cd -= dt;
    if (h.cd <= 0) {
      h.cd = r2(2.6, 5.5);
      const tx = h.x + h.dir * r2(160, 320), ty = GROUND - r2(6, 60);
      for (let i = 0; i < 4; i++) {
        const T = r2(0.5, 0.9);
        sim.shells.push({
          x: h.x, y: h.y + 12, vx: (tx - h.x + r2(-30, 30)) / T,
          vy: (ty - h.y - 0.5 * 430 * T * T) / T, big: false, silent: true,
        });
      }
      if (audio && Math.abs(h.x - sim.cam.x) < W * 0.4) audio.chatter();
    }
  }

  // ---- drones
  for (const d of sim.drones) {
    d.t += dt;
    d.x = W / 2 + Math.sin(d.t * 0.24 + d.side * 2.1) * 430;
    d.y = 218 + Math.sin(d.t * 0.9) * 14;
    d.cd -= dt;
    if (d.cd <= 0) {
      d.cd = r2(6, 11);
      const tx = d.x + r2(-40, 40), ty = GROUND - r2(8, 70);
      const T = 1.0;
      sim.shells.push({ x: d.x, y: d.y + 6, vx: (tx - d.x) / T, vy: (ty - d.y - 0.5 * 430 * T * T) / T, big: false, silent: false });
      if (audio) audio.whistle(0.8);
    }
  }

  // ---- proyectiles balísticos
  for (const sh of sim.shells) {
    sh.vy += 430 * dt;
    sh.x += sh.vx * dt; sh.y += sh.vy * dt;
    if (sh.y >= GROUND - 4 || (sh.y > 120 && Math.random() < 0.0004)) {
      explode(sim, sh.x, Math.min(sh.y, GROUND - 4), sh.big);
      sh.y = 1e9;
    }
  }
  sim.shells = sim.shells.filter((s) => s.y < 1e8);

  // ---- trazadoras
  for (const tr of sim.tracers) { tr.x += tr.vx * dt; tr.y += tr.vy * dt; tr.life -= dt; }
  sim.tracers = sim.tracers.filter((t) => t.life > 0 && t.y < GROUND);

  // ---- explosiones/partículas
  for (const b of sim.booms) b.t += dt;
  sim.booms = sim.booms.filter((b) => b.t < 0.55);
  for (const s of sim.shocks) { s.t += dt; s.r += (s.t < 0.4 ? 900 * dt : 140 * dt); }
  sim.shocks = sim.shocks.filter((s) => s.t < 0.8);
  for (const p of sim.parts) {
    p.life += dt;
    if (p.kind === 0) { p.vy -= 14 * dt; p.vx = lerp(p.vx, sim.wind * 40, dt); }
    else p.vy += 300 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.kind === 1 && p.y > GROUND - 2) { p.y = GROUND - 2; p.vy *= -0.28; p.vx *= 0.6; }
  }
  sim.parts = sim.parts.filter((p) => p.life < p.max);
  if (sim.parts.length > 260) sim.parts.splice(0, sim.parts.length - 260);

  // ---- fuegos y humo de edificios
  for (const b of sim.bldgs) {
    b.winT += dt;
    if (b.burn > 0.05 && !b.collapsed) {
      b.burn = Math.max(0, b.burn - dt * 0.012);
      if (Math.random() < b.burn * dt * 5.2) {
        sim.fires.push({ x: b.x + r2(-b.w / 2.6, b.w / 2.6), y: GROUND - b.h * r2(0.35, 1), life: 0, max: r2(2.5, 6), r: r2(7, 15) });
      }
      if (Math.random() < b.burn * dt * 9) {
        sim.parts.push({
          x: b.x + r2(-b.w / 3, b.w / 3), y: GROUND - b.h,
          vx: r2(-8, 8), vy: r2(-58, -30), life: 0, max: r2(3, 6.5), kind: 0, r: r2(10, 24),
        });
      }
    }
  }
  for (const f of sim.fires) f.life += dt;
  sim.fires = sim.fires.filter((f) => f.life < f.max);
  if (sim.fires.length > 60) sim.fires.splice(0, sim.fires.length - 60);

  // ---- bengalas
  for (const fl of sim.flares) { fl.y += fl.vy * dt; fl.life -= dt; }
  sim.flares = sim.flares.filter((f) => f.life > 0 && f.y < GROUND - 60);

  // ---- director automático
  const now = sim.t;
  sim.heat = sim.heat.filter((h) => now - h.t < 9);
  if (!sim.manual) {
    let best: Heat | null = null; let score = -1;
    for (const h of sim.heat) {
      const sc = h.p * (1 - (now - h.t) / 9) * (1 - Math.abs(h.x - sim.cam.tx) / (W * 1.6) * 0.4);
      if (sc > score) { score = sc; best = h; }
    }
    if (best) {
      sim.cam.tx = clamp(best.x, W * 0.22, W * 0.78);
      sim.cam.ty = clamp(best.y - 60, H * 0.3, H * 0.62);
      sim.cam.tz = clamp(1.18 + best.p * 0.07, 1, 1.5);
    } else {
      sim.cam.tx = W / 2 + Math.sin(now * 0.13) * 240;
      sim.cam.ty = H * 0.5; sim.cam.tz = 1.02;
    }
  }
  sim.cam.x = lerp(sim.cam.x, sim.cam.tx, clamp(dt0 * 1.6, 0, 1));
  sim.cam.y = lerp(sim.cam.y, sim.cam.ty, clamp(dt0 * 1.6, 0, 1));
  sim.cam.z = lerp(sim.cam.z, sim.cam.tz, clamp(dt0 * 1.1, 0, 1));
  sim.cam.shake = Math.max(0, sim.cam.shake - dt0 * 30);

  // ---- generadores de guerra
  sim.nextBarrage -= dt;
  if (sim.nextBarrage <= 0) {
    sim.nextBarrage = r2(7, 16);
    const zones = sim.heat.filter((h) => now - h.t < 12);
    const x = zones.length ? zones[ri(0, zones.length - 1)]!.x : r2(W * 0.25, W * 0.75);
    barrage(sim, x, ri(3, 7), Math.random() < 0.5);
    if (Math.random() < 0.4) addKill(sim, `Toma de fuego intensa de artillería sobre el sector ${sectorOf(x)}`);
  }
  for (const side of [0, 1] as const) {
    sim.nextJet[side] -= dt;
    if (sim.nextJet[side] <= 0) {
      sim.nextJet[side] = r2(20, 44);
      sim.jets.push({
        x: side === 0 ? -90 : W + 90, y: r2(105, 200), dir: side === 0 ? 1 : -1, side,
        dropped: 0, drops: ri(1, 2), tx: r2(W * 0.3, W * 0.7), trail: 0,
      });
    }
    sim.nextHeli[side] -= dt;
    if (sim.nextHeli[side] <= 0 && sim.helis.filter((h) => h.side === side).length < 1) {
      sim.nextHeli[side] = r2(26, 50);
      sim.helis.push({ x: side === 0 ? r2(120, 300) : r2(W - 300, W - 120), y: 300, side, dir: side === 0 ? 1 : -1, cd: r2(1, 3), bob: Math.random() * 6 });
    }
    sim.nextDrone[side] -= dt;
    if (sim.nextDrone[side] <= 0 && sim.drones.length < 2) {
      sim.nextDrone[side] = r2(30, 60);
      sim.drones.push({ x: W / 2, y: 220, side, cd: r2(2, 5), t: Math.random() * 20 });
    }
    sim.nextWave[side] -= dt;
    if (sim.nextWave[side] <= 0 && sim.waveN[side] > 0) {
      sim.nextWave[side] = r2(9, 20);
      let n = sim.waveN[side]; sim.waveN[side] = 0;
      while (n-- > 0) {
        const x = side === 0 ? r2(10, 190) : r2(W - 190, W - 10);
        sim.soldiers.push(newSoldier(side, x));
      }
    }
    if (sim.soldiers.filter((s) => s.side === side && s.state !== 2).length < 6) {
      sim.waveN[side] = Math.max(sim.waveN[side], ri(3, 6));
      sim.nextWave[side] = Math.min(sim.nextWave[side], 1.2);
    }
  }
  sim.nextFlare -= dt;
  if (sim.nextFlare <= 0) {
    sim.nextFlare = r2(9, 26);
    sim.flares.push({ x: r2(150, W - 150), y: 40, vy: r2(26, 40), life: r2(9, 14) });
  }
  if (sim.caption) {
    sim.caption.life -= dt0;
    if (sim.caption.life <= 0) sim.caption = null;
  }
}

// --------------------------------------------------------- renderizado ----

interface View { w: number; h: number }

function drawSky(ctx: CanvasRenderingContext2D, sim: Sim, v: View, t: number) {
  const g = ctx.createLinearGradient(0, 0, 0, v.h);
  g.addColorStop(0, "#05060d");
  g.addColorStop(0.45, "#0b1020");
  g.addColorStop(0.8, "#1a1420");
  g.addColorStop(1, "#241318");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, v.w, v.h);
  // estrellas
  ctx.save();
  for (const s of sim.stars) {
    const sx = s.x / W * v.w;
    const sy = s.y / H * v.h * 0.9;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.8 + s.p));
    ctx.globalAlpha = tw * 0.8;
    ctx.fillStyle = "#cfd8ff";
    ctx.fillRect(sx, sy, s.r, s.r);
  }
  ctx.restore();
  // luna tras humo
  const mx = v.w * 0.78 - (sim.cam.x / W) * 30;
  const my = v.h * 0.16;
  const mg = ctx.createRadialGradient(mx, my, 2, mx, my, 46);
  mg.addColorStop(0, "rgba(255,244,214,0.9)");
  mg.addColorStop(0.25, "rgba(255,236,190,0.28)");
  mg.addColorStop(1, "rgba(255,236,190,0)");
  ctx.fillStyle = mg;
  ctx.fillRect(mx - 50, my - 50, 100, 100);
  ctx.fillStyle = "#f5e8c8";
  ctx.beginPath();
  ctx.arc(mx, my, 13, 0, 6.29);
  ctx.fill();
  ctx.fillStyle = "rgba(9,10,18,0.35)";
  ctx.beginPath();
  ctx.arc(mx - 4.5, my - 3, 11.4, 0, 6.29);
  ctx.fill();
}

// siluetas lejanas (2 capas parallax), precalculadas
const SKY1 = Array.from({ length: 34 }, (_, i) => ({
  x: i * 52 + (i * 37 % 23), w: 30 + (i * 53 % 40), h: 60 + (i * 89 % 130),
}));
const SKY2 = Array.from({ length: 26 }, (_, i) => ({
  x: i * 68 + (i * 41 % 31), w: 40 + (i * 67 % 54), h: 110 + (i * 97 % 190),
}));

function drawFar(ctx: CanvasRenderingContext2D, sim: Sim, v: View) {
  const scale = v.h / H;
  const off = sim.cam.x * scale * 0.18;
  ctx.fillStyle = "#0c0e18";
  for (const b of SKY1) {
    ctx.fillRect(((b.x - off) % (v.w + 160) + v.w + 160) % (v.w + 160) - 80, v.h * 0.52 - b.h * scale * 0.9, b.w * scale, b.h * scale * 0.9 + v.h * 0.5);
  }
  const off2 = sim.cam.x * scale * 0.32;
  ctx.fillStyle = "#12101a";
  for (const b of SKY2) {
    ctx.fillRect(((b.x - off2) % (v.w + 200) + v.w + 200) % (v.w + 200) - 100, v.h * 0.58 - b.h * scale * 0.9, b.w * scale, b.h * scale * 0.9 + v.h * 0.5);
  }
}

function drawBuilding(ctx: CanvasRenderingContext2D, b: Bldg) {
  const top = GROUND - b.h;
  // caja
  ctx.fillStyle = b.collapsed ? "#17141a" : "#232028";
  ctx.fillRect(b.x - b.w / 2, top, b.w, b.h);
  // lado iluminado por incendios
  if (b.burn > 0.04) {
    ctx.fillStyle = `rgba(255,120,40,${0.1 * b.burn})`;
    ctx.fillRect(b.x - b.w / 2, top, b.w, b.h);
  }
  // ventanas
  const cols = Math.max(2, Math.floor(b.w / 16));
  const rows = Math.max(2, Math.floor(b.h / 24));
  const cw = b.w / cols, chh = b.h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = b.x - b.w / 2 + c * cw + cw * 0.22;
      const wy = top + r * chh + chh * 0.2;
      const on = (Math.sin(b.seed + r * 7.3 + c * 3.1) > 0.55) && !b.collapsed;
      if (b.burn > 0.3 && Math.random() < 0.04) {
        ctx.fillStyle = "rgba(255,140,50,0.8)";
      } else if (on && b.winT % 7 < 6.6) {
        ctx.fillStyle = "rgba(255,196,110,0.5)";
      } else {
        ctx.fillStyle = "rgba(10,12,20,0.85)";
      }
      ctx.fillRect(wx, wy, cw * 0.56, chh * 0.5);
    }
  }
  // cráteres/huecos de impacto
  ctx.fillStyle = "rgba(8,6,8,0.88)";
  for (const hy of b.holes.slice(-9)) {
    const hyx = b.x - b.w / 2 + ((b.seed * 7.7 * hy) % 1) * (b.w - 22) + 8;
    const hyy = top + hy * b.h;
    ctx.beginPath();
    ctx.ellipse(hyx, hyy, 11, 8, 0, 0, 6.29);
    ctx.fill();
  }
  // borde superior dentado según daño
  if (!b.collapsed) {
    ctx.fillStyle = "#2c2833";
    ctx.fillRect(b.x - b.w / 2, top - 3, b.w, 4);
  } else {
    // ruina: montículo de escombros
    ctx.fillStyle = "#2a2530";
    ctx.beginPath();
    ctx.moveTo(b.x - b.w / 2 - 8, GROUND);
    ctx.lineTo(b.x - b.w / 4, top + b.h * 0.35);
    ctx.lineTo(b.x + 4, top + b.h * 0.2);
    ctx.lineTo(b.x + b.w / 3, top + b.h * 0.42);
    ctx.lineTo(b.x + b.w / 2 + 8, GROUND);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(80,70,80,0.5)";
    for (let i = 0; i < 5; i++) {
      const rx = b.x + Math.sin(b.seed + i * 2.4) * b.w * 0.4;
      ctx.fillRect(rx, GROUND - 4 - (i % 3) * 3, 6, 4);
    }
  }
}

function drawSoldier(ctx: CanvasRenderingContext2D, s: Soldier) {
  const C = SIDE[s.side];
  if (s.state === 2) {
    // cayendo / caído
    const k = Math.min(1, s.dieT / 0.5);
    ctx.save();
    ctx.translate(s.x, GROUND - 4);
    ctx.rotate((s.dir === 1 ? 1 : -1) * k * Math.PI / 2);
    ctx.globalAlpha = Math.max(0.15, 1 - s.dieT / 4);
    ctx.fillStyle = C.dark;
    ctx.fillRect(-2, -12, 4, 9);
    ctx.beginPath();
    ctx.arc(0, -14, 2.6, 0, 6.29);
    ctx.fill();
    ctx.restore();
    return;
  }
  const walk = s.state === 0 ? Math.sin(s.t * 9) : Math.sin(s.t * 2) * 0.15;
  const by = GROUND - 2 + Math.abs(walk) * -1.4;
  ctx.save();
  ctx.translate(s.x, by);
  ctx.scale(s.dir, 1);
  // piernas
  ctx.strokeStyle = C.dark;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(0, -8); ctx.lineTo(walk * 3, 0);
  ctx.moveTo(0, -8); ctx.lineTo(-walk * 3, 0);
  ctx.stroke();
  // torso
  ctx.fillStyle = C.main;
  ctx.fillRect(-2.4, -16.5, 4.8, 9);
  // casco
  ctx.fillStyle = C.dark;
  ctx.beginPath();
  ctx.arc(0, -19, 3.1, 0, 6.29);
  ctx.fill();
  // rifle
  ctx.strokeStyle = "#0d0d10";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-1, -14); ctx.lineTo(8.5, -13 + (s.state === 1 ? Math.sin(s.t * 21) * 0.7 : 0));
  ctx.stroke();
  ctx.restore();
}

function drawTank(ctx: CanvasRenderingContext2D, tk: Tank) {
  const C = SIDE[tk.side];
  ctx.save();
  ctx.translate(tk.x, GROUND - 2);
  ctx.scale(tk.dir, 1);
  const rec = tk.recoil * 4;
  // orugas
  ctx.fillStyle = "#0c0c10";
  ctx.fillRect(-19, -7, 38, 7);
  ctx.fillStyle = "#1c1c24";
  for (let i = -17; i < 17; i += 4.6) ctx.fillRect(i, -6.2, 2.2, 5.4);
  // casco
  ctx.fillStyle = C.dark;
  ctx.fillRect(-17, -13, 34, 6.5);
  ctx.fillStyle = C.main;
  ctx.fillRect(-15, -15.5, 30, 3.4);
  // torreta + cañón
  ctx.fillStyle = C.main;
  ctx.fillRect(-6 - rec * 0.4, -20.5, 13, 5.6);
  ctx.strokeStyle = C.dark;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(6 - rec, -18); ctx.lineTo(24 - rec, -18.6);
  ctx.stroke();
  ctx.restore();
}

function drawJet(ctx: CanvasRenderingContext2D, j: Jet, t: number) {
  const C = SIDE[j.side];
  ctx.save();
  ctx.translate(j.x, j.y);
  ctx.scale(j.dir, 1);
  ctx.fillStyle = "#0f1116";
  ctx.beginPath();
  ctx.moveTo(16, 0); ctx.lineTo(-6, -4.4); ctx.lineTo(-13, 0); ctx.lineTo(-6, 4.4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = C.main;
  ctx.beginPath();
  ctx.moveTo(4, 0); ctx.lineTo(-8, -9); ctx.lineTo(-12, -8.4); ctx.lineTo(-2, -0.6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, 0); ctx.lineTo(-8, 9); ctx.lineTo(-12, 8.4); ctx.lineTo(-2, 0.6);
  ctx.closePath();
  ctx.fill();
  // postburner
  ctx.fillStyle = `rgba(120,190,255,${0.5 + Math.sin(t * 31) * 0.3})`;
  ctx.fillRect(-14.5, -1.6, 5 + Math.random() * 4, 3.2);
  ctx.restore();
  // estela
  ctx.strokeStyle = "rgba(180,200,230,0.16)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(j.x - j.dir * 16, j.y);
  ctx.lineTo(j.x - j.dir * (70 + (j.trail % 1) * 30), j.y + 3);
  ctx.stroke();
}

function drawHeli(ctx: CanvasRenderingContext2D, h: Heli, t: number) {
  const C = SIDE[h.side];
  ctx.save();
  ctx.translate(h.x, h.y);
  ctx.scale(h.dir, 1);
  ctx.fillStyle = C.dark;
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 5.4, 0, 0, 6.29);
  ctx.fill();
  ctx.fillStyle = C.main;
  ctx.fillRect(-3, -3.4, 13, 2.2);
  ctx.fillRect(-19, -1.4, 8, 1.6);
  ctx.beginPath();
  ctx.moveTo(-11, 0); ctx.lineTo(-16, 5); ctx.lineTo(-14, 5.4); ctx.lineTo(-8, 1);
  ctx.closePath();
  ctx.fill();
  // rotor
  ctx.strokeStyle = "rgba(200,210,230,0.75)";
  ctx.lineWidth = 1.6;
  const rot = t * 26;
  ctx.beginPath();
  ctx.moveTo(Math.cos(rot) * 17, -7 + Math.sin(rot) * 1.4);
  ctx.lineTo(-Math.cos(rot) * 17, -7 - Math.sin(rot) * 1.4);
  ctx.stroke();
  ctx.strokeStyle = "rgba(200,210,230,0.3)";
  ctx.beginPath();
  ctx.moveTo(0, -7); ctx.lineTo(0, -4);
  ctx.stroke();
  ctx.restore();
}

function drawDrone(ctx: CanvasRenderingContext2D, d: Drone) {
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.strokeStyle = "#3a4152";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-6, -4); ctx.lineTo(6, 4); ctx.moveTo(6, -4); ctx.lineTo(-6, 4);
  ctx.stroke();
  ctx.fillStyle = SIDE[d.side].main;
  ctx.fillRect(-2.6, -2.4, 5.2, 4.8);
  const p = 0.4 + Math.abs(Math.sin(d.t * 30)) * 0.5;
  ctx.fillStyle = `rgba(160,190,220,${p * 0.5})`;
  ctx.fillRect(-9, -6, 4, 1.4); ctx.fillRect(5, -6, 4, 1.4);
  ctx.fillRect(-9, 4.6, 4, 1.4); ctx.fillRect(5, 4.6, 4, 1.4);
  ctx.restore();
}

function drawWorld(ctx: CanvasRenderingContext2D, sim: Sim, v: View, dpr: number) {
  const scale = (v.h / H) * sim.cam.z;
  const shake = sim.cam.shake;
  const sx = (Math.random() - 0.5) * shake;
  const sy = (Math.random() - 0.5) * shake;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawSky(ctx, sim, v, sim.t);
  drawFar(ctx, sim, v);
  // reflectores barriendo el cielo
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = "#cfd8ff";
  for (let i = 0; i < 2; i++) {
    const bx = v.w * (0.22 + i * 0.5);
    const sw = Math.sin(sim.t * (0.2 + i * 0.11) + i * 3) * v.w * 0.24;
    ctx.beginPath();
    ctx.moveTo(bx, v.h * 0.62);
    ctx.lineTo(bx + sw - 26, -20);
    ctx.lineTo(bx + sw + 26, -20);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  const ox = v.w / 2 - sim.cam.x * scale + sx;
  const oy = v.h / 2 - sim.cam.y * scale + sy;
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy);

  // edificios (de atrás hacia adelante no importa: no se solapan)
  for (const b of sim.bldgs) drawBuilding(ctx, b);

  // suelo + carretera
  ctx.fillStyle = "#131217";
  ctx.fillRect(-40, GROUND, W + 80, H - GROUND + 60);
  ctx.fillStyle = "#1b1a20";
  ctx.fillRect(-40, GROUND, W + 80, 7);
  ctx.strokeStyle = "rgba(220,190,90,0.34)";
  ctx.lineWidth = 2;
  ctx.setLineDash([26, 30]);
  ctx.beginPath();
  ctx.moveTo(-40, GROUND + 26);
  ctx.lineTo(W + 40, GROUND + 26);
  ctx.stroke();
  ctx.setLineDash([]);

  // decals: cráteres y caídos
  for (const d of sim.decals) {
    if (d.kind === 0) {
      ctx.fillStyle = `rgba(5,4,6,${d.a})`;
      ctx.beginPath();
      ctx.ellipse(d.x, GROUND + 6, d.r, d.r * 0.32, 0, 0, 6.29);
      ctx.fill();
      ctx.strokeStyle = `rgba(90,80,86,${d.a * 0.6})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(d.x, GROUND + 6, d.r + 2, d.r * 0.36, 0, 0, 6.29);
      ctx.stroke();
    } else {
      ctx.strokeStyle = `rgba(150,150,160,${d.a * 0.5})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(d.x - 4, GROUND + 2); ctx.lineTo(d.x + 4, GROUND + 8);
      ctx.moveTo(d.x + 4, GROUND + 2); ctx.lineTo(d.x - 4, GROUND + 8);
      ctx.stroke();
    }
  }

  // fuegos
  for (const f of sim.fires) {
    const k = 1 - f.life / f.max;
    const fl = Math.sin(sim.t * 17 + f.x) * 0.25 + 0.75;
    const gg = ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, f.r * 2.6 * fl);
    gg.addColorStop(0, `rgba(255,150,40,${0.5 * k})`);
    gg.addColorStop(1, "rgba(255,90,20,0)");
    ctx.fillStyle = gg;
    ctx.fillRect(f.x - f.r * 3, f.y - f.r * 3, f.r * 6, f.r * 6);
    ctx.fillStyle = `rgba(255,${120 + Math.random() * 60},30,${0.75 * k})`;
    ctx.beginPath();
    ctx.moveTo(f.x - f.r * 0.5, f.y);
    ctx.lineTo(f.x, f.y - f.r * 1.7 * fl);
    ctx.lineTo(f.x + f.r * 0.5, f.y);
    ctx.closePath();
    ctx.fill();
  }

  // humo y partículas
  for (const p of sim.parts) {
    const k = 1 - p.life / p.max;
    if (p.kind === 0) {
      ctx.fillStyle = `rgba(46,44,50,${0.34 * k})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (1.6 - k * 0.6), 0, 6.29);
      ctx.fill();
    } else if (p.kind === 1) {
      ctx.fillStyle = `rgba(120,105,95,${0.9 * k})`;
      ctx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r);
    } else {
      ctx.fillStyle = `rgba(255,${170 + Math.random() * 60},60,${k})`;
      ctx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r);
    }
  }

  // unidades
  for (const tk of sim.tanks) drawTank(ctx, tk);
  for (const s of sim.soldiers) drawSoldier(ctx, s);
  for (const h of sim.helis) drawHeli(ctx, h, sim.t);
  for (const d of sim.drones) drawDrone(ctx, d);
  for (const j of sim.jets) drawJet(ctx, j, sim.t);

  // proyectiles
  ctx.fillStyle = "#ffd9a0";
  for (const sh of sim.shells) {
    ctx.beginPath();
    ctx.arc(sh.x, sh.y, sh.big ? 2.6 : 1.7, 0, 6.29);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,190,120,0.3)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(sh.x, sh.y);
    ctx.lineTo(sh.x - sh.vx * 0.02, sh.y - sh.vy * 0.02);
    ctx.stroke();
  }

  // trazadoras
  for (const tr of sim.tracers) {
    ctx.strokeStyle = tr.side === 0 ? "rgba(255,120,80,0.9)" : "rgba(120,230,255,0.9)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(tr.x, tr.y);
    ctx.lineTo(tr.x - tr.vx * 0.014, tr.y - tr.vy * 0.014);
    ctx.stroke();
  }

  // explosiones
  for (const b of sim.booms) {
    const k = b.t / 0.55;
    const r = b.r + (b.max - b.r) * Math.min(1, k * 2.2);
    const a = 1 - k;
    const gg = ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, r);
    gg.addColorStop(0, `rgba(255,240,190,${a})`);
    gg.addColorStop(0.35, `rgba(255,150,50,${a * 0.85})`);
    gg.addColorStop(0.7, `rgba(200,60,20,${a * 0.4})`);
    gg.addColorStop(1, "rgba(60,20,10,0)");
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, 6.29);
    ctx.fill();
  }
  // ondas de choque
  for (const s of sim.shocks) {
    const a = Math.max(0, 1 - s.t / 0.8);
    ctx.strokeStyle = `rgba(255,220,170,${a * 0.5})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, s.r, s.r * 0.34, 0, 0, 6.29);
    ctx.stroke();
  }

  // bengalas
  for (const fl of sim.flares) {
    const k = Math.min(1, fl.life / 3);
    const gg = ctx.createRadialGradient(fl.x, fl.y, 1, fl.x, fl.y, 120 * k);
    gg.addColorStop(0, "rgba(255,240,200,0.85)");
    gg.addColorStop(0.3, "rgba(255,210,140,0.25)");
    gg.addColorStop(1, "rgba(255,200,120,0)");
    ctx.fillStyle = gg;
    ctx.fillRect(fl.x - 130, fl.y - 130, 260, 260);
    ctx.fillStyle = "#fff3d0";
    ctx.beginPath();
    ctx.arc(fl.x, fl.y, 2.4, 0, 6.29);
    ctx.fill();
  }

  // flash de pantalla
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (sim.flash > 0.01) {
    ctx.fillStyle = `rgba(255,220,170,${sim.flash * 0.4})`;
    ctx.fillRect(0, 0, v.w, v.h);
  }
  // viñeta
  const vg = ctx.createRadialGradient(v.w / 2, v.h / 2, v.h * 0.34, v.w / 2, v.h / 2, v.h * 0.95);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, v.w, v.h);
}

// ------------------------------------------------------------ componente ----

interface Hud {
  dev: number; collapsed: number; craters: number; cas: number; strikes: number; ops: number;
}
interface Dispatch { url: string; title: string; domain: string; country: string }

const LS_KEY = "vanguard-zonacero-v1";

function loadRestored(): { dev: number; collapsed: number; craters: number; cas: number; awayMin: number } | undefined {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return undefined;
    const d = JSON.parse(raw) as { d?: number; col?: number; cr?: number; cas?: number; t?: number };
    if (typeof d.d !== "number" || typeof d.t !== "number") return undefined;
    const awayMin = clamp((Date.now() - d.t) / 60000, 0, 1440);
    return {
      dev: clamp(d.d, 0, 100),
      collapsed: clamp(d.col ?? 0, 0, 40),
      craters: clamp(d.cr ?? 0, 0, 80),
      cas: clamp(d.cas ?? 0, 0, 1e9),
      awayMin,
    };
  } catch { return undefined; }
}

function saveState(sim: Sim) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      d: sim.stats.dev, col: sim.stats.collapsed, cr: sim.stats.craters,
      cas: sim.stats.cas, t: Date.now(),
    }));
  } catch { /* almacenamiento lleno o bloqueado: la guerra continúa igual */ }
}

export function ZonaCeroSim() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const simRef = useRef<Sim | null>(null);
  const audioRef = useRef<Audio | null>(null);
  const viewRef = useRef<View>({ w: 1280, h: 720 });
  const opCbRef = useRef<((title: string, url?: string) => void) | null>(null);
  const seenRef = useRef<Set<string>>(new Set());

  const [hud, setHud] = useState<Hud>({ dev: 0, collapsed: 0, craters: 0, cas: 0, strikes: 0, ops: 0 });
  const [feed, setFeed] = useState<Kill[]>([]);
  const [caption, setCaption] = useState<string | null>(null);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [signal, setSignal] = useState<"ok" | "wait" | "off">("wait");
  const [sound, setSound] = useState(false);
  const [director, setDirector] = useState(true);
  const [strike, setStrike] = useState(false);
  const [awayMsg, setAwayMsg] = useState<string | null>(null);

  // ---- bucle principal
  useEffect(() => {
    const audio = makeAudio();
    audioRef.current = audio;
    const restored = loadRestored();
    const sim = createSim(restored);
    sim.audioRef = audio;
    simRef.current = sim;
    let awayText: string | null = null;
    if (restored && restored.awayMin > 25) {
      awayText = `Mientras no mirabas (${Math.round(restored.awayMin / 60) > 0 ? `${Math.round(restored.awayMin / 60)} h ` : ""}${Math.round(restored.awayMin % 60)} min) la guerra siguió: devastación ${restored.dev.toFixed(1)}%`;
    }

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // v52.1 FIX pantalla negra: se mide con clientWidth/clientHeight (EXCLUYEN el
    // borde del contenedor). Antes se usaba getBoundingClientRect() y se escribía
    // canvas.style.height con ese valor (que incluía los 2px de borde) → el canvas
    // crecía +2px en cada disparo del ResizeObserver → bucle de realimentación que
    // lo hinchaba hasta ~5000px → la escena se dibujaba a 5.5× y solo se veía el
    // cielo negro ampliado. Ahora el tamaño de layout lo gobierna el CSS
    // (h-[64vh] min-h-[420px]) y aquí SOLO se ajusta el bitmap interno.
    const resize = () => {
      const w = Math.max(280, wrap.clientWidth);
      const h = Math.max(280, wrap.clientHeight);
      const dpr = Math.min(1.75, window.devicePixelRatio || 1);
      viewRef.current = { w, h };
      canvas.width = Math.max(320, Math.floor(w * dpr));
      canvas.height = Math.max(240, Math.floor(h * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    let last = performance.now();
    let hudT = 0;
    // v52.1 FIX sim obsoleto: el bucle ahora lee simRef.current en CADA frame.
    // Antes capturaba `sim` por clausura, así que "Reconstruir ciudad" sustituía
    // simRef.current pero el bucle seguía pintando el mundo viejo.
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (document.hidden) return;
      const s = simRef.current;
      if (!s) return;
      try {
        stepSim(s, dt, audio.on ? audio : null);
        drawWorld(ctx, s, viewRef.current, Math.min(1.75, window.devicePixelRatio || 1));
      } catch { /* un frame defectuoso nunca debe dejar la pantalla negra */ }
      hudT += dt;
      if (hudT > 0.3) {
        hudT = 0;
        setHud({ ...s.stats });
        setFeed(s.kills.slice(-6).reverse());
        setCaption(s.caption?.text ?? null);
        if (awayText) { setAwayMsg(awayText); awayText = null; }
      }
    };
    raf = requestAnimationFrame(loop);

    // v52.1: guardar SIEMPRE el sim vigente (no el capturado al montar)
    const save = () => { const cur = simRef.current; if (cur) saveState(cur); };
    const iv = window.setInterval(save, 20000);
    const onVis = () => { if (document.hidden) save(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", save);

    opCbRef.current = (title, url) => realOperation(sim, title, url);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", save);
      save();
      opCbRef.current = null;
      simRef.current = null;
    };
  }, []);

  // ---- despachos reales (GDELT, sin key, CORS abierto)
  useEffect(() => {
    let alive = true;
    const QS = encodeURIComponent(
      '(bombardeo OR "ataque aéreo" OR obuses OR dron OR misiles OR airstrike OR shelling) sourcelang:spanish'
    );
    const QS2 = encodeURIComponent("(airstrike OR shelling OR artillery OR offensive)");
    async function pull() {
      type Art = { url?: string; title?: string; domain?: string; sourcecountry?: string };
      let arts: Art[] = [];
      for (const q of [QS, QS2]) {
        try {
          const r = await fetch(
            `https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=artlist&maxrecords=10&format=json&sort=datedesc`,
            { signal: AbortSignal.timeout ? AbortSignal.timeout(9000) : undefined }
          );
          if (!r.ok) continue;
          const d = (await r.json()) as { articles?: Art[] };
          if (d.articles && d.articles.length) { arts = d.articles; break; }
        } catch { /* sin señal: se reintenta en el siguiente ciclo */ }
      }
      // v52.1 respaldo: si el GDELT directo no da nada (rate-limit por IP), sirve el
      // radar del tablero server-side (/api/geo-tablero: GDELT con reintento + Google
      // Noticias en español cacheado) — la transmisión NUNCA se queda sin señal
      if (!arts.length) {
        try {
          const r2 = await fetch(`/api/geo-tablero?r=${ri(0, 4)}`, { cache: "no-store" });
          if (r2.ok) {
            const j = (await r2.json()) as { region?: { arts?: { url: string; title: string; domain: string }[] } };
            if (j.region?.arts?.length) {
              arts = j.region.arts.map((a) => ({ url: a.url, title: a.title, domain: a.domain }));
            }
          }
        } catch { /* se reintenta en el próximo ciclo */ }
      }
      if (!alive) return;
      const fresh: Dispatch[] = [];
      let ops = 0;
      for (const a of arts) {
        if (!a.url || !a.title || seenRef.current.has(a.url)) continue;
        seenRef.current.add(a.url);
        fresh.push({ url: a.url, title: a.title, domain: a.domain ?? "GDELT", country: (a as { sourcecountry?: string }).sourcecountry ?? "" });
        if (ops < 2) { ops++; opCbRef.current?.(a.title, a.url); }
      }
      if (fresh.length) {
        setSignal("ok");
        setDispatches((prev) => [...fresh, ...prev].slice(0, 8));
      } else if (arts.length) setSignal("ok");
    }
    const t0 = window.setTimeout(pull, 2500);
    const iv = window.setInterval(pull, 120000);
    return () => { alive = false; window.clearTimeout(t0); window.clearInterval(iv); };
  }, []);

  // ---- interacción: arrastrar = cámara manual; toque = ataque del operador
  const dragRef = useRef<{ on: boolean; x: number; moved: number }>({ on: false, x: 0, moved: 0 });

  const worldXFromEvent = (clientX: number): number => {
    const sim = simRef.current;
    const canvas = canvasRef.current;
    if (!sim || !canvas) return W / 2;
    const rect = canvas.getBoundingClientRect();
    const scale = (viewRef.current.h / H) * sim.cam.z;
    return (clientX - rect.left - viewRef.current.w / 2) / scale + sim.cam.x;
  };

  const onDown = (e: React.PointerEvent) => {
    dragRef.current = { on: true, x: e.clientX, moved: 0 };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const sim = simRef.current;
    if (!dragRef.current.on || !sim) return;
    const dx = e.clientX - dragRef.current.x;
    dragRef.current.x = e.clientX;
    dragRef.current.moved += Math.abs(dx);
    if (dragRef.current.moved > 10) {
      sim.manual = true;
      const scale = (viewRef.current.h / H) * sim.cam.z;
      sim.cam.tx = clamp(sim.cam.tx - dx / scale, W * 0.16, W * 0.84);
      sim.cam.x = sim.cam.tx;
    }
  };
  const onUp = (e: React.PointerEvent) => {
    const sim = simRef.current;
    dragRef.current.on = false;
    if (!sim) return;
    if (dragRef.current.moved < 10 && sim.strikeMode) {
      const wx = worldXFromEvent(e.clientX);
      barrage(sim, clamp(wx, 60, W - 60), 3, true);
      sim.stats.strikes++;
      sim.cam.tx = clamp(wx, W * 0.22, W * 0.78);
      sim.manual = false;
      sim.caption = { text: `ATAQUE DEL OPERADOR EN EL SECTOR ${sectorOf(wx)}`, life: 3.5 };
    }
  };

  const toggleSound = () => {
    const a = audioRef.current;
    if (!a) return;
    setSound(a.toggle());
  };
  const toggleDirector = () => {
    const sim = simRef.current;
    if (!sim) return;
    const nd = !director;
    sim.manual = !nd;
    setDirector(nd);
  };
  const toggleStrike = () => {
    const sim = simRef.current;
    if (!sim) return;
    sim.strikeMode = !strike;
    setStrike(!strike);
  };
  const zoom = (k: number) => {
    const sim = simRef.current;
    if (!sim) return;
    sim.cam.tz = clamp(sim.cam.tz * k, 0.8, 2.1);
  };
  const resetCity = () => {
    try { localStorage.removeItem(LS_KEY); } catch { /* sin almacenamiento */ }
    const sim = createSim();
    sim.audioRef = audioRef.current;
    sim.manual = !director;
    simRef.current = sim;
    // v52.1: el bucle lee simRef cada frame — solo reenganchamos el callback real
    opCbRef.current = (title, url) => realOperation(sim, title, url);
    setHud({ ...sim.stats });
    setAwayMsg(null);
    setCaption(sim.caption?.text ?? null);
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black select-none" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="block w-full h-[64vh] min-h-[420px] touch-none cursor-crosshair"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => { dragRef.current.on = false; }}
        aria-label="Simulación en vivo de Zona Cero: ciudad bajo asedio con soldados, tanques, jets y drones"
        role="img"
      />

      {/* barra de devastación */}
      <div className="absolute top-0 inset-x-0 h-1 bg-zinc-900/80">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 transition-all duration-700"
          style={{ width: `${Math.min(100, hud.dev)}%` }}
        />
      </div>

      {/* cabecera */}
      <div className="absolute top-2.5 left-3 flex items-center gap-2 pointer-events-none max-w-[calc(100%-176px)] sm:max-w-[60%]">
        <span className="flex items-center gap-1.5 bg-black/70 border border-red-500/50 rounded px-2 py-1 sm:px-2.5 font-mono text-[10px] tracking-[0.2em] text-red-300 uppercase whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
          <span className="sm:hidden">En vivo</span>
          <span className="hidden sm:inline">Zona Cero · en vivo</span>
        </span>
        <span className="hidden sm:inline-block bg-black/60 border border-zinc-700 rounded px-2 py-1 font-mono text-[10px] text-zinc-300 whitespace-nowrap">
          Devastación {hud.dev.toFixed(1)}% · récord del teatro {DEV_MAX}%
        </span>
      </div>

      {/* mandos */}
      <div className="absolute top-2.5 right-3 flex gap-1.5">
        <button
          onClick={toggleSound}
          className="min-w-10 h-10 sm:min-w-11 sm:h-11 flex items-center justify-center bg-black/70 border border-zinc-700 hover:border-amber-400/70 rounded text-zinc-300 transition-colors"
          aria-label={sound ? "Silenciar" : "Activar sonido"}
          title={sound ? "Silenciar" : "Activar sonido de guerra"}
        >
          {sound ? <Volume2 className="w-4.5 h-4.5 text-amber-300" /> : <VolumeX className="w-4.5 h-4.5" />}
        </button>
        <button
          onClick={toggleDirector}
          className={`min-w-10 h-10 sm:min-w-11 sm:h-11 flex items-center justify-center border rounded transition-colors ${director ? "bg-amber-500/20 border-amber-400/70 text-amber-300" : "bg-black/70 border-zinc-700 text-zinc-300 hover:border-amber-400/70"}`}
          aria-label="Director automático"
          title="Director cinematográfico automático"
        >
          <Clapperboard className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={toggleStrike}
          className={`min-w-10 h-10 sm:min-w-11 sm:h-11 flex items-center justify-center border rounded transition-colors ${strike ? "bg-red-500/25 border-red-400/80 text-red-300" : "bg-black/70 border-zinc-700 text-zinc-300 hover:border-red-400/70"}`}
          aria-label="Modo ataque: toca el mapa para lanzar"
          title="Modo ataque: toca la ciudad para llamar fuego"
        >
          <Crosshair className="w-4.5 h-4.5" />
        </button>
        <button onClick={() => zoom(1.25)} className="min-w-10 h-10 sm:min-w-11 sm:h-11 flex items-center justify-center bg-black/70 border border-zinc-700 hover:border-amber-400/70 rounded text-zinc-300" aria-label="Acercar" title="Acercar">
          <ZoomIn className="w-4.5 h-4.5" />
        </button>
        <button onClick={() => zoom(0.8)} className="hidden min-w-10 h-10 sm:flex sm:min-w-11 sm:h-11 items-center justify-center bg-black/70 border border-zinc-700 hover:border-amber-400/70 rounded text-zinc-300" aria-label="Alejar" title="Alejar">
          <ZoomOut className="w-4.5 h-4.5" />
        </button>
        <button onClick={resetCity} className="min-w-10 h-10 sm:min-w-11 sm:h-11 hidden sm:flex items-center justify-center bg-black/70 border border-zinc-700 hover:border-red-400/70 rounded text-zinc-400" aria-label="Reconstruir ciudad" title="Reconstruir la ciudad (borra el historial de destrucción)">
          <RotateCcw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* estadísticas */}
      <div className="absolute top-14 left-3 flex flex-wrap gap-1.5 pointer-events-none max-w-[62%]">
        <span className="bg-black/70 border border-zinc-700 rounded px-2 py-0.5 font-mono text-[10px] text-orange-300">
          {hud.collapsed} edificios colapsados
        </span>
        <span className="bg-black/70 border border-zinc-700 rounded px-2 py-0.5 font-mono text-[10px] text-zinc-300">
          {hud.craters} cráteres
        </span>
        <span className="bg-black/70 border border-zinc-700 rounded px-2 py-0.5 font-mono text-[10px] text-red-300">
          {hud.cas.toLocaleString("es")} bajas en la simulación
        </span>
        <span className="bg-black/70 border border-zinc-700 rounded px-2 py-0.5 font-mono text-[10px] text-amber-300">
          {hud.ops} operaciones reales
        </span>
      </div>

      {/* bitácora de guerra */}
      <div className="absolute right-3 top-28 w-[46%] max-w-[290px] hidden md:flex flex-col gap-1 pointer-events-none">
        {feed.map((k) => (
          <div
            key={k.id}
            className={`bg-black/65 border rounded px-2 py-1 font-mono text-[9.5px] leading-snug ${k.real ? "border-amber-400/60 text-amber-200" : "border-zinc-800 text-zinc-400"}`}
          >
            {k.text}
          </div>
        ))}
      </div>

      {/* rótulo del director */}
      {caption && (
        <div className="absolute bottom-40 sm:bottom-16 inset-x-0 flex justify-center pointer-events-none px-6">
          <span className="bg-black/75 border border-zinc-700 rounded px-3 py-1.5 font-mono text-[10px] sm:text-[11px] tracking-[0.14em] text-zinc-100 uppercase text-center">
            {caption}
          </span>
        </div>
      )}

      {/* despachos reales */}
      <div className="absolute left-3 bottom-3 w-[52%] max-w-[330px]">
        <div className="bg-black/75 border border-zinc-800 rounded p-2">
          <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-300 mb-1">
            <Radio className="w-3 h-3" />
            Despachos reales · GDELT
            <span className={`ml-auto normal-case tracking-normal ${signal === "ok" ? "text-zinc-500" : "text-amber-400"}`}>
              {signal === "ok" ? "señal activa" : "buscando señal..."}
            </span>
          </p>
          {dispatches.length === 0 && (
            <p className="font-mono text-[9.5px] text-zinc-600 leading-snug">
              El radar de medios escanea 100.000 portadas del mundo. Cada titular de
              guerra que entra dispara una operación aquí, en la ciudad.
            </p>
          )}
          <ul className="flex flex-col gap-1">
            {dispatches.slice(0, 3).map((d, i) => (
              <li key={d.url} className={i === 2 ? "hidden sm:block" : ""}>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="block font-mono text-[9.5px] leading-snug text-zinc-400 hover:text-amber-200 transition-colors line-clamp-2"
                >
                  <span className="text-emerald-400">REAL</span> · {d.title}
                  <span className="text-zinc-600"> — {d.domain}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* aviso de regreso + pista */}
      {awayMsg && (
        <div className="absolute top-24 inset-x-0 flex justify-center px-6 pointer-events-none">
          <span className="bg-amber-500/15 border border-amber-400/50 rounded px-3 py-1.5 font-mono text-[10px] text-amber-200 text-center">
            {awayMsg}
          </span>
        </div>
      )}
      <p className="absolute right-3 bottom-3 hidden md:block font-mono text-[9px] text-zinc-600 pointer-events-none">
        arrastra para mover la cámara {strike ? "· MODO ATAQUE: toca para llamar fuego" : ""}
      </p>
    </div>
  );
}
