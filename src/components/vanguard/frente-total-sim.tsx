"use client";

// v53.0 FRENTE TOTAL — "EL PLANETA EN GUERRA EN DIRECTO". Nunca visto en una
// página de conflictos: un único canvas donde LOS 10 FRENTES REALES DEL
// PLANETA ARDEN SIMULTÁNEAMENTE, cada uno con su propio micro-teatro animado
// (soldados que avanzan y caen, duelos de tanques, jets que cruzan y bombardean,
// helicópteros, artillería, humo, cráteres). Vista PLANETA (todo a la vez,
// como ver la Tierra de noche desde órbita) y vista TOMA DIRECTA (zoom al
// frente con HUD y ficha). LO REAL DISPARA LO SIMULADO: cada titular violento
// de GDELT/Google Noticias (vía /api/geo-tablero, fuentes abiertas sin key)
// convierte una operación en el frente correspondiente. Aéreo militar REAL
// (adsb.lol) cruzando el cielo con matrículas verdaderas. Director automático
// estilo canal de guerra 24h. Anti-pantalla-negra: clientWidth/clientHeight,
// nunca canvas.style, try/catch por frame, pausa en background.

import { useCallback, useEffect, useRef, useState } from "react";
import { FRENTES, VIOLENT_RE } from "@/lib/frentes-data";
import { Radio, Satellite, Flame, Activity, Undo2, Zap, Newspaper } from "lucide-react";

// ------------------------------------------------------------- constantes ----
const SECTOR_W = 1000;
const WORLD_W = SECTOR_W * FRENTES.length;
const GROUND = 0.78; // línea de suelo (fracción de la altura)
const MAX_Z = 1.75; // DPR cap (lección Zona Cero)

interface Unit {
  x: number; side: 0 | 1; hp: number; cd: number;
  st: 0 | 1 | 2; // 0 avanza, 1 combate, 2 cayendo
  t: number; sp: number; respawn: number;
}
interface Tank { x: number; side: 0 | 1; hp: number; cd: number; recoil: number; dead: number }
interface Jet { x: number; y: number; vx: number; fi: number; side: 0 | 1; dropX: number; dropped: number; trail: number }
interface Heli { x: number; y: number; vx: number; fi: number; side: 0 | 1; cd: number; burst: number }
interface Shell { x: number; y: number; vx: number; vy: number; fi: number; big: boolean }
interface Tracer { x: number; y: number; vx: number; vy: number; life: number; side: 0 | 1; fi: number }
interface Boom { x: number; y: number; r: number; max: number; t: number; big: boolean; fi: number }
interface Smoke { x: number; y: number; r: number; vx: number; life: number; max: number; fi: number }
interface Part { x: number; y: number; vx: number; vy: number; life: number; max: number; kind: 0 | 1; r: number; fi: number }
interface Decal { x: number; r: number; a: number; wreck: boolean; burn: number; fi: number }
interface Flare { x: number; y: number; vy: number; life: number; fi: number }
interface RealPlane { cs: string; t: string; x: number; y: number; vx: number; wrap: number }

interface Sector {
  fi: number;
  front: number; // x de la línea de contacto (mundo)
  target: number;
  soldiers: Unit[];
  tanks: Tank[];
  coolArt: number; coolJet: number; coolHeli: number;
  heat: number; ops: number; flash: number;
  wind: number;
}

// paletas por terreno: [cieloArriba, cieloAbajo, suelo, silueta]
const PAL: Record<string, [string, string, string, string]> = {
  steppe: ["#232c3e", "#6b5a4a", "#3f4a3a", "#181e28"],
  city: ["#2a1f2e", "#7a4a3a", "#3a3a40", "#17141a"],
  sea: ["#1a2a3e", "#3a5a7a", "#17364d", "#0e1c2a"],
  desert: ["#33261e", "#8a5a3a", "#6b5233", "#2a2018"],
  jungle: ["#1e2e26", "#4a5a3a", "#2e4028", "#16221a"],
  mountain: ["#232a3a", "#5a6a8a", "#4a4f5a", "#20242e"],
  coast: ["#1e2a36", "#4a6a6a", "#3a4a42", "#141c1e"],
  tropic: ["#1e2e2a", "#5a6a4a", "#34442e", "#18221a"],
};

const FIRE = "#ffb84a";
const FLASH = "#ffd27a";
const TRACER = ["#ffdd66", "#ff8866"];

function rand(a: number, b: number) { return a + Math.random() * (b - a); }
function sideColor(fi: number, side: 0 | 1): string {
  const c = side === 0 ? FRENTES[fi].sideA.colors : FRENTES[fi].sideB.colors;
  return c[0] || "#cccccc";
}

// ------------------------------------------------------------ construcción ---
function mkSoldier(x: number, side: 0 | 1): Unit {
  return { x, side, hp: 1, cd: rand(0.3, 2), st: 0, t: 0, sp: rand(9, 16), respawn: 0 };
}
function mkTank(x: number, side: 0 | 1): Tank {
  return { x, side, hp: 3, cd: rand(2, 7), recoil: 0, dead: 0 };
}

function mkSector(fi: number): Sector {
  const f = FRENTES[fi];
  const inten = f.intensity / 100;
  const cx = fi * SECTOR_W + SECTOR_W / 2;
  const s: Sector = {
    fi,
    front: cx + rand(-60, 60),
    target: 0,
    soldiers: [], tanks: [],
    coolArt: rand(1, 5), coolJet: rand(4, 18), coolHeli: rand(6, 20),
    heat: inten * 3, ops: 0, flash: 0,
    wind: rand(-8, 8),
  };
  s.target = s.front;
  const nS = Math.round(3 + inten * 5);
  const nT = Math.round(1 + inten * 2);
  for (let k = 0; k < nS; k++) {
    s.soldiers.push(mkSoldier(cx - rand(240, 430), 0));
    s.soldiers.push(mkSoldier(cx + rand(240, 430), 1));
  }
  for (let k = 0; k < nT; k++) {
    s.tanks.push(mkTank(cx - rand(150, 380), 0));
    s.tanks.push(mkTank(cx + rand(150, 380), 1));
  }
  return s;
}

function relayout(s: Sector) {
  // re-sitúa unidades si la línea se movió demasiado (evita pilas raras)
  const cx = s.fi * SECTOR_W + SECTOR_W / 2;
  for (const u of s.soldiers) {
    if (u.side === 0 && u.x > s.front - 50) u.x = s.front - 50 - rand(0, 40);
    if (u.side === 1 && u.x < s.front + 50) u.x = s.front + 50 + rand(0, 40);
  }
  for (const t of s.tanks) {
    if (t.side === 0 && t.x > cx - 120) t.x = cx - rand(160, 300);
    if (t.side === 1 && t.x < cx + 120) t.x = cx + rand(160, 300);
  }
}

// ------------------------------------------------------------------ mundo ----
interface World {
  t: number;
  sectors: Sector[];
  jets: Jet[]; helis: Heli[];
  shells: Shell[]; tracers: Tracer[];
  booms: Boom[]; smokes: Smoke[]; parts: Part[];
  decals: Decal[]; flares: Flare[];
  planes: RealPlane[];
  shake: number;
}

function mkWorld(): World {
  return {
    t: 0,
    sectors: FRENTES.map((_, i) => mkSector(i)),
    jets: [], helis: [],
    shells: [], tracers: [],
    booms: [], smokes: [], parts: [], decals: [], flares: [],
    planes: [],
    shake: 0,
  };
}

// cap global de efectos (10 teatros a la vez: hay que contener la memoria)
const CAP = { shells: 140, tracers: 260, booms: 70, smokes: 110, parts: 360, decals: 160, flares: 40 };

function addBoom(w: World, x: number, y: number, big: boolean, fi: number) {
  if (w.booms.length >= CAP.booms) w.booms.shift();
  w.booms.push({ x, y, r: 2, max: big ? rand(26, 40) : rand(9, 16), t: 0, big, fi });
  const s = w.sectors[fi];
  s.flash = 1;
  if (big) w.shake = Math.min(1, w.shake + 0.35);
  const n = big ? 10 : 4;
  for (let k = 0; k < n; k++) {
    if (w.parts.length >= CAP.parts) w.parts.shift();
    w.parts.push({
      x, y: y + 4, vx: rand(-30, 30), vy: rand(20, 70), life: 0,
      max: rand(0.5, 1.4), kind: Math.random() < 0.5 ? 0 : 1, r: rand(1, 2.4), fi,
    });
  }
  if (Math.random() < (big ? 0.9 : 0.4) && w.smokes.length < CAP.smokes) {
    w.smokes.push({ x, y: y + 6, r: rand(5, 10), vx: s.wind * 0.4, life: 0, max: rand(4, 9), fi });
  }
  if (big && w.decals.length < CAP.decals) {
    w.decals.push({ x, r: rand(7, 13), a: rand(0.35, 0.6), wreck: false, burn: 0, fi });
  }
}

function fireArt(w: World, s: Sector, fromSide: 0 | 1) {
  const from = fromSide === 0 ? s.front - rand(180, 330) : s.front + rand(180, 330);
  const to = fromSide === 0 ? s.front + rand(20, 140) : s.front - rand(20, 140);
  const nShells = Math.round(rand(1, 2 + s.heat * 0.12));
  for (let k = 0; k < nShells; k++) {
    if (w.shells.length >= CAP.shells) w.shells.shift();
    const vx = (to - from) / rand(1.6, 2.4);
    w.shells.push({ x: from + rand(-15, 15), y: 2, vx, vy: rand(90, 120), fi: s.fi, big: Math.random() < 0.35 });
  }
}

function callRealOp(w: World, fi: number) {
  // operación disparada por un titular REAL: barrage + bengala + jet
  const s = w.sectors[fi];
  s.ops++; s.heat += 5;
  for (let k = 0; k < 3; k++) fireArt(w, s, Math.random() < 0.5 ? 0 : 1);
  if (w.flares.length < CAP.flares) {
    w.flares.push({ x: s.fi * SECTOR_W + s.front + rand(-60, 60), y: 120, vy: -6, life: 0, fi });
  }
  const jet: Jet = {
    x: s.fi * SECTOR_W + (Math.random() < 0.5 ? 40 : SECTOR_W - 40),
    y: rand(140, 190), vx: Math.random() < 0.5 ? 120 : -120,
    fi, side: Math.random() < 0.5 ? 0 : 1,
    dropX: s.fi * SECTOR_W + s.front + rand(-40, 40), dropped: 0, trail: 0,
  };
  w.jets.push(jet);
}

function stepWorld(w: World, dt: number) {
  w.t += dt;
  w.shake = Math.max(0, w.shake - dt * 2.2);

  for (const s of w.sectors) {
    const inten = FRENTES[s.fi].intensity / 100;
    const cx = s.fi * SECTOR_W + SECTOR_W / 2;
    s.flash = Math.max(0, s.flash - dt * 2.5);
    s.heat = Math.max(inten * 3, s.heat - dt * 0.4);

    // la línea de contacto late y cede poco a poco
    s.front += Math.sin(w.t * 0.11 + s.fi * 1.7) * dt * 4.5;
    if (Math.abs(s.front - cx) > 110) s.front = cx + Math.sign(s.front - cx) * 110;
    if (Math.abs(s.front - s.target) > 24) {
      s.front += Math.sign(s.target - s.front) * dt * 6;
    }

    // artillería por intensidad
    s.coolArt -= dt;
    if (s.coolArt <= 0) {
      fireArt(w, s, Math.random() < 0.5 ? 0 : 1);
      s.coolArt = rand(2.5, 9 - inten * 4.5);
    }
    // jets
    s.coolJet -= dt;
    if (s.coolJet <= 0 && w.jets.length < 14) {
      w.jets.push({
        x: s.fi * SECTOR_W + (Math.random() < 0.5 ? 30 : SECTOR_W - 30),
        y: rand(135, 195), vx: Math.random() < 0.5 ? rand(90, 130) : -rand(90, 130),
        fi: s.fi, side: Math.random() < 0.5 ? 0 : 1,
        dropX: s.fi * SECTOR_W + s.front + rand(-50, 50), dropped: 0, trail: 0,
      });
      s.coolJet = rand(7, 24 - inten * 12);
    }
    // helicópteros solo en frentes con historial de air mobile
    if (["donbas", "gaza", "rdc", "myanmar", "sudan"].includes(FRENTES[s.fi].id)) {
      s.coolHeli -= dt;
      if (s.coolHeli <= 0 && w.helis.length < 8) {
        w.helis.push({
          x: s.fi * SECTOR_W + rand(120, SECTOR_W - 120), y: rand(85, 115),
          vx: Math.random() < 0.5 ? 26 : -26, fi: s.fi,
          side: Math.random() < 0.5 ? 0 : 1, cd: rand(0.5, 2), burst: Math.round(rand(3, 8)),
        });
        s.coolHeli = rand(9, 26);
      }
    }

    // soldados
    for (const u of s.soldiers) {
      u.t += dt;
      if (u.st === 2) {
        u.respawn -= dt;
        if (u.respawn <= 0) {
          u.st = 0; u.hp = 1;
          u.x = u.side === 0 ? cx - rand(260, 430) : cx + rand(260, 430);
        }
        continue;
      }
      const toFront = u.side === 0 ? s.front - 55 : s.front + 55;
      const d = toFront - u.x;
      if (Math.abs(d) > 6 && u.st === 0) {
        u.x += Math.sign(d) * u.sp * dt;
      } else {
        u.st = 1;
        u.cd -= dt;
        if (u.cd <= 0) {
          if (w.tracers.length < CAP.tracers) {
            const aim = u.x + (u.side === 0 ? rand(30, 120) : -rand(30, 120));
            w.tracers.push({
              x: u.x, y: 10, vx: (aim - u.x) / rand(0.25, 0.5), vy: rand(-6, 10),
              life: 0, side: u.side, fi: s.fi,
            });
          }
          u.cd = rand(0.4, 2.4 - inten);
        }
        // en combate a veces se agachan / gatean y avanzan de nuevo
        if (Math.random() < dt * 0.35) u.st = 0;
      }
    }

    // tanques
    for (const tk of s.tanks) {
      tk.recoil = Math.max(0, tk.recoil - dt * 4);
      if (tk.dead > 0) { tk.dead -= dt; continue; }
      tk.cd -= dt;
      if (tk.cd <= 0) {
        if (w.shells.length < CAP.shells) {
          const to = tk.side === 0 ? tk.x + rand(140, 320) : tk.x - rand(140, 320);
          w.shells.push({
            x: tk.x + (tk.side === 0 ? 16 : -16), y: 9,
            vx: (to - tk.x) / rand(1.4, 2), vy: rand(70, 100), fi: s.fi, big: true,
          });
        }
        tk.recoil = 1;
        tk.cd = rand(4, 11 - inten * 4);
      }
    }

    relayout(s);
  }

  // shells (balística)
  for (let i = w.shells.length - 1; i >= 0; i--) {
    const sh = w.shells[i];
    sh.x += sh.vx * dt; sh.y += sh.vy * dt; sh.vy -= 55 * dt;
    if (sh.y <= 0) { addBoom(w, sh.x, 0, sh.big, sh.fi); w.shells.splice(i, 1); }
  }
  // tracers
  for (let i = w.tracers.length - 1; i >= 0; i--) {
    const tr = w.tracers[i];
    tr.x += tr.vx * dt; tr.y += tr.vy * dt; tr.life += dt;
    if (tr.life > 0.6) w.tracers.splice(i, 1);
  }
  // jets: cruzan y bombardean
  for (let i = w.jets.length - 1; i >= 0; i--) {
    const j = w.jets[i];
    j.x += j.vx * dt; j.trail += dt;
    if (j.dropped === 0 && Math.abs(j.x - j.dropX) < 26) {
      j.dropped = 1;
      for (let k = 0; k < 2; k++) {
        if (w.shells.length < CAP.shells) {
          w.shells.push({ x: j.x - k * 10, y: j.y, vx: j.vx * 0.35, vy: -6, fi: j.fi, big: true });
        }
      }
    }
    const lim = j.fi * SECTOR_W;
    if (j.x < lim - 80 || j.x > lim + SECTOR_W + 80) w.jets.splice(i, 1);
  }
  // helicópteros: ráfagas
  for (let i = w.helis.length - 1; i >= 0; i--) {
    const h = w.helis[i];
    h.x += h.vx * dt;
    h.cd -= dt;
    if (h.cd <= 0 && h.burst > 0) {
      h.burst--;
      h.cd = 0.12;
      if (w.tracers.length < CAP.tracers) {
        w.tracers.push({
          x: h.x, y: h.y, vx: h.vx * 3 + (Math.random() < 0.5 ? 40 : -40),
          vy: -rand(30, 60), life: 0, side: h.side, fi: h.fi,
        });
      }
    } else if (h.burst <= 0 && Math.random() < dt * 0.5) h.burst = Math.round(rand(3, 8));
    if (Math.random() < dt * 0.08) h.vx = -h.vx;
    const lim = h.fi * SECTOR_W;
    if (h.x < lim + 40 || h.x > lim + SECTOR_W - 40) h.vx = -h.vx;
  }
  // booms
  for (let i = w.booms.length - 1; i >= 0; i--) {
    const b = w.booms[i];
    b.t += dt;
    b.r = b.max * Math.min(1, b.t / 0.35);
    if (b.t > 0.9) w.booms.splice(i, 1);
  }
  // humo
  for (let i = w.smokes.length - 1; i >= 0; i--) {
    const sm = w.smokes[i];
    sm.life += dt; sm.x += (sm.vx + w.sectors[sm.fi].wind) * dt; sm.y += dt * 9; sm.r += dt * 3.5;
    if (sm.life > sm.max) w.smokes.splice(i, 1);
  }
  // partículas
  for (let i = w.parts.length - 1; i >= 0; i--) {
    const p = w.parts[i];
    p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= (p.kind === 1 ? 90 : 14) * dt;
    if (p.life > p.max) w.parts.splice(i, 1);
  }
  // bengalas
  for (let i = w.flares.length - 1; i >= 0; i--) {
    const f = w.flares[i];
    f.life += dt; f.y += f.vy * dt; f.vy -= 3 * dt;
    if (f.life > 7) w.flares.splice(i, 1);
  }
  // decals arden un rato y se apagan
  for (const d of w.decals) if (d.burn > 0) d.burn = Math.max(0, d.burn - dt * 0.05);
  // aviones reales ADS-B
  for (const p of w.planes) {
    p.x += p.vx * dt;
    if (p.x > p.wrap) p.x = -60;
    if (p.x < -60) p.x = p.wrap;
  }
}

// baja colateral de combate: al azar un soldado cae (estilizado, sin sangre)
function randomCasualties(w: World, dt: number) {
  for (const s of w.sectors) {
    if (Math.random() > dt * FRENTES[s.fi].intensity * 0.008) continue;
    const alive = s.soldiers.filter((u) => u.st !== 2);
    if (alive.length) {
      const v = alive[Math.floor(Math.random() * alive.length)];
      v.st = 2; v.respawn = rand(7, 18);
      if (w.decals.length < CAP.decals) {
        w.decals.push({ x: v.x, r: 1.6, a: 0.4, wreck: false, burn: 0, fi: s.fi });
      }
    }
    // contrabatería ocasional destruye un tanque
    if (Math.random() < 0.12) {
      const td = s.tanks.filter((t) => t.dead <= 0);
      if (td.length) {
        const t = td[Math.floor(Math.random() * td.length)];
        t.dead = rand(20, 45);
        addBoom(w, t.x, 6, true, s.fi);
        if (w.decals.length < CAP.decals) {
          w.decals.push({ x: t.x, r: 9, a: 0.5, wreck: true, burn: 1, fi: s.fi });
        }
      }
    }
  }
}

// ----------------------------------------------------------------- dibujo ----
interface Cam { x: number; z: number; tx: number; tz: number }

function drawSoldierU(ctx: CanvasRenderingContext2D, u: Unit, col: string, z: number) {
  if (u.st === 2) {
    // cayendo / en el suelo
    ctx.globalAlpha = Math.max(0.25, u.respawn / 18);
    ctx.fillStyle = col;
    ctx.fillRect(u.x - 5, 0.6, 10, 1.6);
    ctx.globalAlpha = 1;
    return;
  }
  const bob = u.st === 0 ? Math.sin(u.t * 7 + u.x) * 1.1 : 0;
  const h = 13;
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  // cabeza
  ctx.moveTo(u.x, 2.2 + bob);
  ctx.arc(u.x, 2 + bob, 1.4, 0, Math.PI * 2);
  // cuerpo
  ctx.moveTo(u.x, 3.4 + bob); ctx.lineTo(u.x, 8.6 + bob);
  // piernas
  ctx.moveTo(u.x, 8.6 + bob); ctx.lineTo(u.x - 2.2, h + bob);
  ctx.moveTo(u.x, 8.6 + bob); ctx.lineTo(u.x + 2.2, h + bob);
  // arma
  const gd = u.side === 0 ? 1 : -1;
  ctx.moveTo(u.x, 5 + bob); ctx.lineTo(u.x + 5 * gd, 4.2 + bob);
  ctx.stroke();
}

function drawTankU(ctx: CanvasRenderingContext2D, t: Tank, col: string, col2: string) {
  if (t.dead > 0) return; // el casco quemado lo pinta el decal
  const dir = t.side === 0 ? 1 : -1;
  ctx.fillStyle = col;
  ctx.fillRect(t.x - 15, 4.5, 30, 5); // casco
  ctx.fillRect(t.x - 8, 1.5, 14, 3);  // torreta
  ctx.strokeStyle = col2;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(t.x + 6 * dir, 3);
  ctx.lineTo(t.x + 20 * dir - t.recoil * 3 * dir, 3); // cañón con retroceso
  ctx.stroke();
  ctx.fillStyle = "#111";
  ctx.fillRect(t.x - 14, 9.5, 28, 2.6); // orugas
}

function drawJetU(ctx: CanvasRenderingContext2D, j: Jet, col: string, z: number) {
  const dir = Math.sign(j.vx) || 1;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(j.x + 9 * dir, j.y);
  ctx.lineTo(j.x - 7 * dir, j.y - 1.6);
  ctx.lineTo(j.x - 3 * dir, j.y);
  ctx.lineTo(j.x - 7 * dir, j.y + 1.6);
  ctx.closePath();
  ctx.fill();
  // estela
  if (z > 0.1) {
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(j.x - 8 * dir, j.y);
    ctx.lineTo(j.x - 40 * dir, j.y + 0.6);
    ctx.stroke();
  }
}

function drawHeliU(ctx: CanvasRenderingContext2D, h: Heli, col: string, t: number) {
  const dir = Math.sign(h.vx) || 1;
  ctx.strokeStyle = col;
  ctx.fillStyle = col;
  ctx.lineWidth = 1.5;
  ctx.fillRect(h.x - 5, h.y, 10, 2.4); // fuselaje
  ctx.beginPath();                     // rotor
  const rw = 7 + Math.sin(t * 30) * 1.2;
  ctx.moveTo(h.x - rw, h.y - 1.4); ctx.lineTo(h.x + rw, h.y - 1.4);
  ctx.moveTo(h.x, h.y - 1.4); ctx.lineTo(h.x, h.y);
  ctx.stroke();
  ctx.fillRect(h.x + 6 * dir, h.y + 0.8, 4, 0.8); // cola
}

function drawSectorBg(
  ctx: CanvasRenderingContext2D, fi: number, sx0: number, sx1: number,
  groundY: number, h: number, z: number,
) {
  const f = FRENTES[fi];
  const p = PAL[f.terrain] ?? PAL.steppe;
  const w = sx1 - sx0;
  // cielo
  const g = ctx.createLinearGradient(0, 0, 0, groundY);
  g.addColorStop(0, p[0]); g.addColorStop(1, p[1]);
  ctx.fillStyle = g;
  ctx.fillRect(sx0, 0, w, groundY);
  // silueta del terreno lejano
  ctx.fillStyle = p[3];
  ctx.beginPath();
  ctx.moveTo(sx0, groundY);
  const seed = fi * 97;
  const steps = 14;
  for (let k = 0; k <= steps; k++) {
    const q = k / steps;
    const wx = sx0 + q * w;
    const n =
      Math.sin(q * 6.28 + seed) * 0.5 +
      Math.sin(q * 15.7 + seed * 1.7) * 0.3 +
      Math.sin(q * 31.3 + seed * 0.6) * 0.2;
    let hh = 0.5 + n * 0.5; // 0..1
    if (f.terrain === "mountain") hh = 0.8 + n * 0.5;
    if (f.terrain === "sea") hh = 0.12;
    if (f.terrain === "city" || f.terrain === "coast") hh = 0.35 + (Math.sin(q * 40 + seed) > 0.3 ? 0.75 : 0.05);
    const top = groundY - Math.max(4, hh * h * 0.16 * (z > 0.15 ? 1 : 1.6));
    ctx.lineTo(wx, top);
  }
  ctx.lineTo(sx1, groundY);
  ctx.closePath();
  ctx.fill();
  // suelo
  ctx.fillStyle = p[2];
  ctx.fillRect(sx0, groundY, w, h - groundY);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(sx0, groundY, w, 2.5);
}

function drawEffects(
  ctx: CanvasRenderingContext2D, w: World, fi: number,
  x0: number, x1: number, z: number, t: number,
) {
  const inView = (x: number) => x >= x0 - 60 && x <= x1 + 60;
  // decals
  for (const d of w.decals) {
    if (d.fi !== fi || !inView(d.x)) continue;
    ctx.fillStyle = `rgba(10,8,6,${d.a})`;
    ctx.beginPath();
    ctx.ellipse(d.x, 1.4, d.r, d.r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    if (d.wreck) {
      ctx.fillStyle = d.burn > 0 ? "#3a2a1a" : "#222";
      ctx.fillRect(d.x - 8, 2, 16, 4);
      if (d.burn > 0) {
        ctx.fillStyle = `rgba(255,140,40,${0.3 + Math.sin(t * 9 + d.x) * 0.2})`;
        ctx.fillRect(d.x - 4, -3, 8, 5);
      }
    }
  }
  // trincheras junto a la línea
  const s = w.sectors[fi];
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let k = -2; k <= 2; k++) {
    const tx = s.front + k * 9;
    if (!inView(tx)) continue;
    ctx.moveTo(tx, 2.2); ctx.lineTo(tx + 4, 0.2);
  }
  ctx.stroke();
  // tracers
  for (const tr of w.tracers) {
    if (tr.fi !== fi || !inView(tr.x)) continue;
    ctx.strokeStyle = TRACER[tr.side];
    ctx.globalAlpha = Math.max(0, 1 - tr.life / 0.6);
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(tr.x, tr.y);
    ctx.lineTo(tr.x - tr.vx * 0.06, tr.y - tr.vy * 0.06);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // shells
  for (const sh of w.shells) {
    if (sh.fi !== fi || !inView(sh.x)) continue;
    ctx.fillStyle = sh.big ? FLASH : "#ff9a5a";
    ctx.beginPath();
    ctx.arc(sh.x, sh.y, sh.big ? 1.7 : 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  // booms
  for (const b of w.booms) {
    if (b.fi !== fi || !inView(b.x)) continue;
    const a = Math.max(0, 1 - b.t / 0.9);
    const rg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, Math.max(1.2, b.r));
    rg.addColorStop(0, `rgba(255,240,190,${0.95 * a})`);
    rg.addColorStop(0.4, `rgba(255,160,60,${0.8 * a})`);
    rg.addColorStop(1, "rgba(120,40,10,0)");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(b.x, b.y, Math.max(1.2, b.r), 0, Math.PI * 2);
    ctx.fill();
  }
  // humo
  for (const sm of w.smokes) {
    if (sm.fi !== fi || !inView(sm.x)) continue;
    const a = Math.max(0, 0.34 * (1 - sm.life / sm.max));
    ctx.fillStyle = `rgba(70,62,58,${a})`;
    ctx.beginPath();
    ctx.arc(sm.x, sm.y, Math.max(1.5, sm.r), 0, Math.PI * 2);
    ctx.fill();
  }
  // partículas
  for (const p of w.parts) {
    if (p.fi !== fi || !inView(p.x)) continue;
    const a = Math.max(0, 1 - p.life / p.max);
    ctx.fillStyle = p.kind === 0 ? `rgba(90,80,75,${a * 0.7})` : `rgba(255,170,60,${a})`;
    ctx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r);
  }
  // bengalas
  for (const f of w.flares) {
    if (f.fi !== fi || !inView(f.x)) continue;
    const a = Math.max(0, 1 - f.life / 7);
    const rg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 30);
    rg.addColorStop(0, `rgba(255,235,180,${0.5 * a})`);
    rg.addColorStop(1, "rgba(255,235,180,0)");
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(f.x, f.y, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,250,220,${a})`;
    ctx.beginPath(); ctx.arc(f.x, f.y, 1.6, 0, Math.PI * 2); ctx.fill();
  }
}

// capa estratégica: así se ve la guerra desde "órbita" (vista planeta)
function drawStrategic(
  ctx: CanvasRenderingContext2D, w: World, fi: number,
  sx0: number, sxw: number, groundY: number, t: number,
) {
  const s = w.sectors[fi];
  const inten = FRENTES[fi].intensity / 100;
  const fx = sx0 + (s.front / SECTOR_W) * sxw;
  // resplandor permanente del frente
  const rg = ctx.createRadialGradient(fx, groundY, 0, fx, groundY, sxw * 0.55);
  const pulse = 0.16 + Math.sin(t * (1.5 + inten) + fi) * 0.05 + s.flash * 0.35;
  rg.addColorStop(0, `rgba(255,150,50,${Math.min(0.85, pulse + inten * 0.25)})`);
  rg.addColorStop(1, "rgba(255,120,30,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(sx0, 0, sxw, groundY + 6);
  // columnas de humo
  for (const sm of w.smokes) {
    if (sm.fi !== fi) continue;
    const px = sx0 + (sm.x / SECTOR_W) * sxw;
    const hh = Math.min(groundY, sm.y * sxw / SECTOR_W * 1.6 + 8);
    ctx.fillStyle = `rgba(60,55,52,${0.4 * (1 - sm.life / sm.max)})`;
    ctx.fillRect(px - 1, groundY - hh, 2.2, hh);
  }
  // impactos: destellos
  for (const b of w.booms) {
    if (b.fi !== fi) continue;
    const px = sx0 + (b.x / SECTOR_W) * sxw;
    ctx.fillStyle = `rgba(255,230,160,${0.9 * (1 - b.t / 0.9)})`;
    ctx.fillRect(px - 1.5, groundY - 4, 3, 4);
  }
  // línea de contacto
  ctx.fillStyle = `rgba(255,90,40,${0.5 + s.flash * 0.5})`;
  ctx.fillRect(fx - 1, groundY - 3, 2, 5);
}

// -------------------------------------------------------------- componente ---
const INIT_TICKER = [
  "SINAL OSINT CONECTADO — GDELT (~100.000 medios) + adsb.lol en directo",
  "Toca cualquier frente del mural para entrar en su toma directa",
  "Cada titular violento REAL dispara una operación en su teatro",
];

export default function FrenteTotalSim() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<World | null>(null);
  const camRef = useRef<Cam>({ x: WORLD_W / 2, z: 0.04, tx: WORLD_W / 2, tz: 0.04 });
  const focusRef = useRef(-1);
  const dirRef = useRef({ last: 0, lastUser: 0 });

  const [focus, setFocusState] = useState(-1);
  const [hudTick, setHudTick] = useState(0);
  const [ticker, setTicker] = useState<string[]>(INIT_TICKER);
  const [mil, setMil] = useState<{ total: number; samples: { cs: string; t: string }[] } | null>(null);
  const [opsTotal, setOpsTotal] = useState(0);
  const [signal, setSignal] = useState<"..." | "OK" | "OFF">("...");
  const [card, setCard] = useState<{ t: string; s: string; real: boolean } | null>(null);
  const [artsV, setArtsV] = useState(0);
  const regionArts = useRef<Record<number, { title: string; url: string; domain: string }[]>>({});
  const seenRef = useRef<Set<string>>(new Set());

  const setFocus = useCallback((fi: number, byUser: boolean) => {
    focusRef.current = fi;
    setFocusState(fi);
    const cam = camRef.current;
    if (fi < 0) {
      cam.tz = -1; // -1 = planeta (se fija en el loop con el ancho del canvas)
      setCard({ t: "EL PLANETA EN GUERRA", s: "10 frentes ardiendo a la vez", real: false });
    } else {
      const f = FRENTES[fi];
      cam.tz = -2; // -2 = toma directa (se fija en el loop)
      setCard({ t: f.name, s: `${f.sideA.name} vs ${f.sideB.name}`, real: false });
    }
    if (byUser) dirRef.current.lastUser = performance.now();
  }, []);

  // ------------------------------------------------------------- datos OSINT
  const pushTicker = useCallback((s: string) => {
    setTicker((prev) => [s, ...prev].slice(0, 10));
  }, []);

  useEffect(() => {
    let alive = true;
    let ptr = 0;
    const poll = async () => {
      if (!alive) return;
      const r = ptr % 5; ptr++;
      try {
        const res = await fetch(`/api/geo-tablero?r=${r}`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const d = await res.json();
        setSignal("OK");
        if (d.mil?.total) setMil({ total: d.mil.total, samples: d.mil.samples ?? [] });
        // aviones militares REALES al cielo del mural
        const w = worldRef.current;
        if (w && d.mil?.samples?.length) {
          w.planes = d.mil.samples.slice(0, 4).map((smp: { cs: string; t: string }, i: number) => ({
            cs: smp.cs, t: smp.t,
            x: ((i + 0.5) / 4) * WORLD_W, y: 205 - i * 12,
            vx: (i % 2 ? 1 : -1) * (34 + i * 7), wrap: WORLD_W,
          }));
        }
        const arts: { title: string; url: string; domain: string }[] = d.region?.arts ?? [];
        if (arts.length) {
          regionArts.current[r] = arts;
          setArtsV((v) => v + 1);
          const fresh = arts.filter((a) => a.title && !seenRef.current.has(a.title));
          for (const a of fresh) seenRef.current.add(a.title);
          if (seenRef.current.size > 600) seenRef.current = new Set([...seenRef.current].slice(-300));
          const violent = fresh.filter((a) => VIOLENT_RE.test(a.title));
          if (violent.length && worldRef.current) {
            const cands = FRENTES.map((f, i) => ({ f, i })).filter((x) => x.f.regionIdx === r);
            if (cands.length) {
              cands.sort((a, b) => worldRef.current!.sectors[a.i].ops - worldRef.current!.sectors[b.i].ops);
              const pick = cands[0];
              callRealOp(worldRef.current, pick.i);
              setOpsTotal((o) => o + 1);
              pushTicker(`⚡ OPERACIÓN REAL en ${pick.f.name} — "${violent[0].title.slice(0, 90)}" (${violent[0].domain})`);
              setCard({ t: `⚡ OPERACIÓN REAL · ${pick.f.name}`, s: violent[0].title.slice(0, 110), real: true });
            }
          } else if (fresh.length && violent.length === 0) {
            pushTicker(`TITULAR · ${fresh[0].title.slice(0, 110)} — ${fresh[0].domain}`);
          }
        }
      } catch {
        setSignal("OFF");
      }
    };
    poll();
    const iv = setInterval(poll, 40_000);
    return () => { alive = false; clearInterval(iv); };
  }, [pushTicker]);

  // ------------------------------------------------------------- loop raíz
  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const world = mkWorld();
    worldRef.current = world;
    let cw = Math.max(280, wrap.clientWidth);
    let ch = Math.max(280, wrap.clientHeight);

    // v53.0 anti-pantalla-negra (lección Zona Cero): solo bitmap, nunca style
    const resize = () => {
      cw = Math.max(280, wrap.clientWidth);
      ch = Math.max(280, wrap.clientHeight);
      const dpr = Math.min(MAX_Z, window.devicePixelRatio || 1);
      canvas.width = Math.max(320, Math.floor(cw * dpr));
      canvas.height = Math.max(240, Math.floor(ch * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let hidden = false;
    const vis = () => { hidden = document.hidden; };
    document.addEventListener("visibilitychange", vis);

    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const drawFrame = () => {
      const dpr = Math.min(MAX_Z, window.devicePixelRatio || 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      const groundY = ch * GROUND;
      const cam = camRef.current;
      const strategic = cam.z < 0.12;

      // objetivos de cámara
      if (cam.tz < 0) {
        if (cam.tz === -1) { cam.tz = cw / WORLD_W; cam.tx = WORLD_W / 2; }
        if (cam.tz === -2) {
          const fi = Math.max(0, focusRef.current);
          const s = world.sectors[fi];
          const fx = Math.min(fi * SECTOR_W + SECTOR_W - 230, Math.max(fi * SECTOR_W + 230, s.front));
          cam.tz = Math.max(0.5, cw / 470);
          cam.tx = fx;
        }
      }
      // cámara exponencial + temblor
      cam.z += (cam.tz - cam.z) * 0.06;
      cam.x += (cam.tx - cam.x) * 0.08;
      const shx = world.shake > 0 ? rand(-1, 1) * world.shake * 5 : 0;
      const shy = world.shake > 0 ? rand(-1, 1) * world.shake * 3 : 0;
      const ox = cw / 2 - cam.x * cam.z + shx;
      const toS = (wx: number, wy: number): [number, number] => [wx * cam.z + ox, groundY - wy * cam.z + shy];

      const viewW = cw / cam.z;
      const x0 = cam.x - viewW / 2 - 40;
      const x1 = cam.x + viewW / 2 + 40;
      const fi0 = Math.max(0, Math.floor(x0 / SECTOR_W));
      const fi1 = Math.min(FRENTES.length - 1, Math.floor(x1 / SECTOR_W));

      // fondo por teatro
      for (let fi = fi0; fi <= fi1; fi++) {
        const [sx0] = toS(fi * SECTOR_W, 0);
        const [sx1] = toS((fi + 1) * SECTOR_W, 0);
        drawSectorBg(ctx, fi, Math.min(sx0, sx1), Math.max(sx0, sx1), groundY, ch, cam.z);
      }

      if (strategic) {
        // capa órbita: resplandores, humo, destellos, etiquetas
        for (let fi = fi0; fi <= fi1; fi++) {
          const [sx0] = toS(fi * SECTOR_W, 0);
          const [sx1] = toS((fi + 1) * SECTOR_W, 0);
          drawStrategic(ctx, world, fi, Math.min(sx0, sx1), Math.abs(sx1 - sx0), groundY, world.t);
        }
        // etiquetas
        ctx.font = "600 9px ui-monospace, monospace";
        ctx.textAlign = "center";
        for (let fi = fi0; fi <= fi1; fi++) {
          const [mx] = toS(fi * SECTOR_W + SECTOR_W / 2, 0);
          ctx.fillStyle = "rgba(255,255,255,0.82)";
          ctx.fillText(FRENTES[fi].name.slice(0, 14), mx, 14);
          ctx.fillStyle = "rgba(255,140,60,0.9)";
          ctx.fillText(`I${FRENTES[fi].intensity}`, mx, 26);
        }
        ctx.textAlign = "left";
      } else {
        // capa toma: unidades y efectos reales del motor
        for (let fi = fi0; fi <= fi1; fi++) {
          const s = world.sectors[fi];
          const [fx] = toS(s.front, 0);
          // zona de contacto iluminada
          const glow = ctx.createLinearGradient(fx, groundY - 120 * cam.z, fx, groundY);
          glow.addColorStop(0, "rgba(255,140,40,0)");
          glow.addColorStop(1, `rgba(255,140,40,${0.10 + s.flash * 0.15})`);
          ctx.fillStyle = glow;
          ctx.fillRect(fx - 140 * cam.z, groundY - 120 * cam.z, 280 * cam.z, 120 * cam.z);
          // unidades por bando (los decals van en drawEffects)
          for (const u of s.soldiers) {
            const [ux, uy] = toS(u.x, 0);
            if (ux < -30 || ux > cw + 30) continue;
            ctx.save();
            ctx.translate(ux, uy);
            ctx.scale(cam.z, cam.z);
            drawSoldierU(ctx, u, sideColor(fi, u.side), cam.z);
            ctx.restore();
          }
          for (const tk of s.tanks) {
            const [tx2, ty2] = toS(tk.x, 0);
            if (tx2 < -60 || tx2 > cw + 60) continue;
            ctx.save();
            ctx.translate(tx2, ty2);
            ctx.scale(cam.z, cam.z);
            if (tk.dead > 0) {
              ctx.fillStyle = "#241d16";
              ctx.fillRect(-15, -4, 30, 5);
              ctx.fillStyle = `rgba(255,130,30,${tk.dead > 30 ? 0.6 : 0.2})`;
              ctx.fillRect(-6, -9, 12, 5);
            } else {
              drawTankU(ctx, tk, sideColor(fi, tk.side), FRENTES[fi].sideA.colors[1] ?? "#ddd");
            }
            ctx.restore();
          }
        }
        // jets y helicópteros
        for (const j of world.jets) {
          const [jx, jy] = toS(j.x, j.y);
          if (jx < -80 || jx > cw + 80) continue;
          ctx.save();
          ctx.translate(jx, jy);
          ctx.scale(cam.z, cam.z);
          drawJetU(ctx, j, j.side === 0 ? "#cfd6e4" : "#b8c0cf", cam.z);
          ctx.restore();
        }
        for (const h of world.helis) {
          const [hx, hy] = toS(h.x, h.y);
          if (hx < -60 || hx > cw + 60) continue;
          ctx.save();
          ctx.translate(hx, hy);
          ctx.scale(cam.z, cam.z);
          drawHeliU(ctx, h, sideColor(h.fi, h.side), world.t);
          ctx.restore();
        }
      }

      // efectos en ambas escalas (con culling por teatro)
      for (let fi = fi0; fi <= fi1; fi++) {
        if (strategic) continue; // la capa órbita ya dibuja sus efectos
        drawEffects(ctx, world, fi, x0, x1, cam.z, world.t);
      }

      // aviones militares REALES (ADS-B) cruzando el mural
      for (const p of world.planes) {
        const [px, py] = toS(p.x, p.y);
        if (px < -140 || px > cw + 140) continue;
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(Math.max(0.5, cam.z * 0.9), Math.max(0.5, cam.z * 0.9));
        ctx.fillStyle = "#9fe8ff";
        ctx.beginPath();
        const dir = Math.sign(p.vx) || 1;
        ctx.moveTo(8 * dir, 0); ctx.lineTo(-6 * dir, -1.6); ctx.lineTo(-3 * dir, 0); ctx.lineTo(-6 * dir, 1.6);
        ctx.closePath(); ctx.fill();
        ctx.restore();
        if (cam.z > 0.1) {
          ctx.font = "600 8px ui-monospace, monospace";
          ctx.fillStyle = "rgba(159,232,255,0.85)";
          ctx.fillText(`${p.cs} · ${p.t}`, px + 10, py - 4);
        }
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (hidden) return;
      try {
        acc += dt;
        stepWorld(world, dt);
        randomCasualties(world, dt);
        // director automático (canal 24h): si nadie manda, salta al frente más caliente
        if (now - dirRef.current.last > 22_000 && now - dirRef.current.lastUser > 22_000) {
          dirRef.current.last = now;
          let hot = -1, best = -1;
          for (let i = 0; i < world.sectors.length; i++) {
            const heatScore = world.sectors[i].heat + world.sectors[i].ops * 2;
            if (heatScore > best) { best = heatScore; hot = i; }
          }
          if (hot >= 0 && focusRef.current !== hot) {
            setFocus(hot, false);
          } else if (hot >= 0 && focusRef.current === hot && focusRef.current !== -1) {
            // ya estábamos ahí: vista planeta y vuelve a salir
            setFocus(-1, false);
          }
        }
        drawFrame();
        if (acc > 2) { acc = 0; setHudTick((v) => v + 1); }
      } catch { /* un frame defectuoso nunca deja pantalla negra */ }
    };
    raf = requestAnimationFrame(frame);

    // interacción: tap para entrar en un frente / llamar fuego en toma
    const onPointer = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = ev.clientX - rect.left;
      const cam = camRef.current;
      const wx = (px - (cw / 2 - cam.x * cam.z)) / cam.z;
      dirRef.current.lastUser = performance.now();
      if (focusRef.current < 0) {
        const fi = Math.min(FRENTES.length - 1, Math.max(0, Math.floor(wx / SECTOR_W)));
        setFocus(fi, true);
      } else {
        // fuego propio del operador: misión de artillería al punto tocado
        const fi = focusRef.current;
        const s = world.sectors[fi];
        for (let k = 0; k < 3; k++) {
          world.shells.push({
            x: wx - rand(30, 80), y: 2,
            vx: rand(30, 60), vy: rand(70, 95), fi, big: true,
          });
        }
        s.heat += 2;
        pushTicker(`🎯 FUEGO PROPIO sobre ${FRENTES[fi].name} — misión de artillería aceptada`);
      }
    };
    canvas.addEventListener("pointerdown", onPointer);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", vis);
      canvas.removeEventListener("pointerdown", onPointer);
      worldRef.current = null;
    };
  }, [setFocus, pushTicker]);

  // deep link ?f=donbas
  useEffect(() => {
    try {
      const f = new URLSearchParams(window.location.search).get("f");
      if (f) {
        const i = FRENTES.findIndex((x) => x.id === f);
        if (i >= 0) setFocus(i, true);
      }
    } catch { /* sin deep link */ }
  }, [setFocus]);

  const focused = focus >= 0 ? FRENTES[focus] : null;
  // artsV y hudTick existen para refrescar el HUD sin estado derivado
  void hudTick; void artsV;
  const arts = focused ? regionArts.current[focused.regionIdx] ?? [] : [];

  // sector.ops ya incluye las operaciones reales (callRealOp): sin doble conteo
  const opsSum = worldRef.current ? worldRef.current.sectors.reduce((a, s) => a + s.ops, 0) : 0;

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative w-full h-[430px] sm:h-[520px] rounded-lg border border-red-500/30 overflow-hidden bg-[#101018] select-none touch-manipulation"
      >
        <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />

        {/* bug EN DIRECTO + estado de cámara */}
        <div className="absolute top-2 left-2 flex items-center gap-2 pointer-events-none">
          <span className="flex items-center gap-1.5 bg-black/70 rounded px-2 py-1 font-mono text-[10px] tracking-widest text-red-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
            EN DIRECTO
          </span>
          <span className="bg-black/60 rounded px-2 py-1 font-mono text-[10px] text-zinc-300 hidden sm:inline">
            {focused ? `TOMA DIRECTA · ${focused.name}` : "VISTA PLANETA · 10 FRENTES"}
          </span>
        </div>

        {/* HUD derecho */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5 pointer-events-none">
          <span className="flex items-center gap-1 bg-black/70 rounded px-2 py-1 font-mono text-[10px] text-amber-300">
            <Flame className="w-3 h-3" /> {Math.max(opsSum, opsTotal)} operaciones
          </span>
          <span className="flex items-center gap-1 bg-black/70 rounded px-2 py-1 font-mono text-[10px] text-sky-300">
            <Satellite className="w-3 h-3" /> {mil ? `${mil.total} naves mil. en el aire` : "aéreo militar…"}
          </span>
          <span className="flex items-center gap-1 bg-black/70 rounded px-2 py-1 font-mono text-[10px] text-emerald-300">
            <Radio className="w-3 h-3" /> OSINT {signal}
          </span>
        </div>

        {/* tarjeta de título estilo canal de guerra */}
        {card && (
          <div key={card.t} className="absolute bottom-14 left-3 right-3 sm:bottom-16 pointer-events-none">
            <div className="inline-block max-w-full bg-black/75 border-l-2 border-red-500 rounded-r px-3 py-2">
              <p className={`font-orbitron text-sm sm:text-lg font-black tracking-wide ${card.real ? "text-red-300" : "text-white"}`}>
                {card.t}
              </p>
              <p className="font-mono text-[10px] sm:text-xs text-zinc-400 mt-0.5 truncate">{card.s}</p>
            </div>
          </div>
        )}

        {/* botón volver al planeta */}
        {focused && (
          <button
            onClick={() => setFocus(-1, true)}
            className="absolute bottom-14 right-2 sm:bottom-16 flex items-center gap-1 bg-black/75 hover:bg-black border border-zinc-600 rounded px-2.5 py-1.5 font-mono text-[10px] text-zinc-200"
          >
            <Undo2 className="w-3 h-3" /> PLANETA
          </button>
        )}

        {/* teletipo */}
        <div className="absolute bottom-0 left-0 right-0 h-9 bg-black/80 border-t border-red-500/30 overflow-hidden flex items-center">
          <span className="shrink-0 bg-red-600 text-white font-mono text-[9px] font-bold px-2 py-1 ml-1 rounded-sm tracking-wider">
            TELETIPO
          </span>
          <div className="relative flex-1 overflow-hidden ml-1">
            <div
              className="whitespace-nowrap font-mono text-[10px] text-zinc-300"
              style={{
                animation: "ft-ticker 36s linear infinite",
                display: "inline-block",
                paddingLeft: "100%",
              }}
            >
              {ticker.map((t, i) => (
                <span key={i} className="mr-10">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes ft-ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>

      {/* selector de frentes */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setFocus(-1, true)}
          className={`shrink-0 rounded font-mono text-[10px] tracking-wider px-3 py-2 border transition-colors ${
            focus < 0 ? "bg-red-600 border-red-400 text-white" : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          🌍 PLANETA
        </button>
        {FRENTES.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setFocus(i, true)}
            className={`shrink-0 rounded font-mono text-[10px] tracking-wider px-3 py-2 border transition-colors ${
              focus === i ? "bg-red-600 border-red-400 text-white" : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* ficha del frente enfocado */}
      {focused && (
        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <div className="border border-zinc-800 rounded-md p-4 bg-zinc-900/50">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-orbitron text-base font-black text-white">{focused.name}</h3>
              <span className="flex items-center gap-1 font-mono text-[10px] text-amber-300">
                <Activity className="w-3 h-3" /> INTENSIDAD {focused.intensity}/100
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded bg-zinc-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-red-600" style={{ width: `${focused.intensity}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono">
              <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-200" style={{ borderLeft: `3px solid ${focused.sideA.colors[0]}` }}>
                A · {focused.sideA.name}
              </span>
              <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-200" style={{ borderLeft: `3px solid ${focused.sideB.colors[0]}` }}>
                B · {focused.sideB.name}
              </span>
            </div>
            <p className="mt-3 text-[12px] text-zinc-400 leading-relaxed">{focused.note}</p>
            <p className="mt-2 font-mono text-[10px] text-zinc-500">Estimación pública de bajas: {focused.casualties}</p>
            <p className="mt-2 font-mono text-[9px] text-sky-400/80 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Toca el terreno en la toma para llamar fuego de artillería
            </p>
          </div>
          <div className="border border-zinc-800 rounded-md p-4 bg-zinc-900/50">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-emerald-300 flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5" /> Despachos reales de la región
            </h4>
            {arts.length ? (
              <ul className="mt-2 space-y-2">
                {arts.slice(0, 5).map((a, i) => (
                  <li key={i} className="text-[12px] leading-snug">
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-amber-300 transition-colors">
                      {a.title.slice(0, 110)}
                    </a>
                    <span className="ml-1 font-mono text-[9px] text-zinc-500">({a.domain})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[12px] text-zinc-500">Escaneando GDELT y Google Noticias para esta región…</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
