"use client";

// v67.0 EL HANGAR — EL HUB 3D. El menú principal del prompt original hecho realidad:
// un hangar militar en tercera persona donde TU agente camina (WASD / joystick
// táctil) entre puertas holográficas que abren las salas del juego, con otros
// agentes conectados visibles como avatares de luz con nombre flotante, aura
// por rango, fichas de misión flotantes y la Isla del Oráculo escondida en el
// extremo norte. Render Three.js puro, sin assets externos, 60fps móvil.
// v70.1 ANTI-FREEZE: pixelRatio limitado (1 móvil / 1.25 desktop, antes 2.0),
// materiales PBR → Lambert (el 70% del coste GPU), calidad adaptativa en 3 pasos
// si el FPS medio cae de 38, y cero allocations Vector3 dentro del bucle.

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGameStore } from "@/lib/game-store";
import { getRankForLevel } from "@/lib/game-data";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";
import { getTension } from "@/lib/tension";
import { claimOraculo, oraculoClaimed, ORACULO_DOCS, ORACULO_SECRET } from "@/lib/oraculo";
import { TarotModal, PropagandaModal, DiarioModal } from "@/components/vanguard/hangar-modals";
import { Warehouse, Flame, Coins, Users, Thermometer, Compass } from "lucide-react";

// ---- geometría del hangar ----
const HALF_W = 26; // semiancho interior
const HALF_D = 20; // semiprofundidad
const WALL_H = 9;

interface DoorDef {
  label: string;
  sub: string;
  tab: string; // TabKey destino vía vanguard:navigate
  x: number;
  z: number;
  rotY: number;
  hex: number;
}

const DOORS: DoorDef[] = [
  { label: "SALA DE MAPAS", sub: "globo + frentes en vivo", tab: "mapa", x: -14, z: -HALF_D, rotY: 0, hex: 0x1e90ff },
  { label: "MISIONES", sub: "fichas y botines", tab: "misiones", x: 0, z: -HALF_D, rotY: 0, hex: 0xff3b30 },
  { label: "BIBLIOTECA SECRETA", sub: "archivos del abismo", tab: "biblioteca", x: 14, z: -HALF_D, rotY: 0, hex: 0xa855f7 },
  { label: "SIMULADOR", sub: "guerras y drones", tab: "warsim", x: -HALF_W, z: -6, rotY: Math.PI / 2, hex: 0x00ff87 },
  { label: "COMUNICACIONES", sub: "radio + en vivo", tab: "envivo", x: HALF_W, z: -6, rotY: -Math.PI / 2, hex: 0x38bdf8 },
  { label: "MERCADO", sub: "tienda + bolsa", tab: "tienda", x: HALF_W, z: 8, rotY: -Math.PI / 2, hex: 0xffd60a },
];

interface StationDef { key: "tarot" | "propaganda" | "diario"; label: string; sub: string; x: number; z: number; hex: number; }

const STATIONS: StationDef[] = [
  { key: "tarot", label: "TAROT GEOPOLÍTICO", sub: "3 cartas cada lunes", x: -8, z: 14, hex: 0xa855f7 },
  { key: "propaganda", label: "DETECTOR DE PROPAGANDA", sub: "examina cualquier texto", x: 0, z: 16, hex: 0xff3b30 },
  { key: "diario", label: "DIARIO DEL AGENTE", sub: "tu año en VANGUARD", x: 8, z: 14, hex: 0xffd60a },
];

const RANK_AURA: Record<string, number> = {
  GENERAL: 0xffd60a,
  MARISCAL: 0xffd60a,
  CORONEL: 0xffd60a,
  MAYOR: 0xffd60a,
  CAPITAN: 0x00b4d8,
  TENIENTE: 0x00b4d8,
  SARGENTO: 0x00ff87,
  CABO: 0x00ff87,
  RECLUTA: 0x8a90a8,
};

const GHOST_NAMES = ["AGT-NAVAJO", "AGT-CONDOR", "AGT-MARTE", "AGT-LUNA", "AGT-ORION", "AGT-ZORRO", "AGT-BRAL", "AGT-VESPER"];

function makeLabelTexture(title: string, sub: string, hex: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 256;
  const ctx = c.getContext("2d")!;
  const col = `#${hex.toString(16).padStart(6, "0")}`;
  ctx.fillStyle = "rgba(6,8,14,0.88)";
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = col;
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 492, 236);
  // esquinas holo
  ctx.fillStyle = col;
  ctx.fillRect(10, 10, 26, 6); ctx.fillRect(10, 10, 6, 26);
  ctx.fillRect(476, 240, 26, 6); ctx.fillRect(496, 220, 6, 26);
  ctx.textAlign = "center";
  ctx.fillStyle = col;
  ctx.font = "900 44px Orbitron, sans-serif";
  const words = title.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 14) { lines.push(cur.trim()); cur = w; } else cur += " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  lines.forEach((ln, i) => ctx.fillText(ln, 256, 92 + i * 48));
  ctx.fillStyle = "rgba(240,240,240,0.75)";
  ctx.font = "600 24px 'JetBrains Mono', monospace";
  ctx.fillText(sub.toUpperCase(), 256, 204);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

function makeNameTexture(name: string, hex: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.font = "700 30px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = hex;
  ctx.shadowColor = hex;
  ctx.shadowBlur = 12;
  ctx.fillText(name, 128, 42);
  return new THREE.CanvasTexture(c);
}

function makeNameSprite(name: string, hex: string): THREE.Sprite {
  const tex = makeNameTexture(name, hex);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(4.4, 1.1, 1);
  return sp;
}

export function HangarPanel() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [online, setOnline] = useState(0);
  const [tension, setTension] = useState(0);
  const [modal, setModal] = useState<"tarot" | "propaganda" | "diario" | "oraculo" | null>(null);
  const [hint, setHint] = useState("Acércate a una puerta holográfica y toca ENTRAR");
  const { alias, level, rank, coins, streak } = useGameStore();
  const rankInfo = getRankForLevel(level);

  const openModal = useCallback((m: typeof modal) => {
    sfx.unlock();
    setModal(m);
  }, []);

  // presencia real + tensión (lecturas diferidas para evitar cascada de renders)
  useEffect(() => {
    const t0 = setTimeout(() => setTension(getTension()), 0);
    const f = fetch("/api/presence", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setOnline(typeof j.online === "number" ? j.online : 0))
      .catch(() => setOnline(0));
    void f;
    return () => clearTimeout(t0);
  }, []);

  // confirmación de isla del oráculo: paga +250 la primera vez
  useEffect(() => {
    if (modal !== "oraculo") return;
    const first = claimOraculo();
    if (first) {
      useGameStore.getState().addCoins(250, "ISLA DEL ORÁCULO descubierta");
      toast.success("ISLA DEL ORÁCULO · +250ⓒ", { description: "Los secretos del morse te pertenecen. Vuelve por los documentos cuando quieras." });
      sfx.achievement();
    }
  }, [modal]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    // v71.0 OCASO: noche cálida — el hangar vive bajo una puesta de sol eterna
    scene.background = new THREE.Color(0x0b0709);
    scene.fog = new THREE.Fog(0x120a08, 30, 80);

    const cam = new THREE.PerspectiveCamera(58, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 220);
    // v70.1 ANTI-FREEZE: resolución controlada + AA solo desktop + degradación adaptativa
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    const QUALITY_STEPS: number[] = isMobile ? [1, 0.72] : [1.25, 1, 0.72];
    let qStep = 0;
    let fpsFrames = 0;
    let fpsTime = 0;
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: "high-performance" });
    renderer.setPixelRatio(QUALITY_STEPS[0]);
    renderer.setSize(mount.clientWidth, Math.max(320, mount.clientHeight));
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";

    // ---- luces del ocaso (v71.0): sol bajo cálido + hemisferio brasa + rim naranja ----
    scene.add(new THREE.HemisphereLight(0xff9f5a, 0x140a06, 0.8));
    const key = new THREE.DirectionalLight(0xffc890, 1.3);
    key.position.set(-18, 7, -14); // sol bajo, tocando el horizonte
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff6b35, 0.55); // contraluz de brasa
    rim.position.set(20, 5, 16);
    scene.add(rim);
    const spot = new THREE.SpotLight(0xffb347, 80, 40, 0.5, 0.5);
    spot.position.set(0, WALL_H - 0.5, 4);
    spot.target.position.set(0, 0, 4);
    scene.add(spot, spot.target);

    // ---- suelo militar con rejilla ----
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x17100c });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2, HALF_D * 2), floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    const grid = new THREE.GridHelper(HALF_W * 2, 26, 0x6b3a1c, 0x33210f);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.5;
    grid.position.y = 0.01;
    scene.add(grid);
    // plataforma iluminada central
    const podium = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.9, 0.22, 36),
      new THREE.MeshLambertMaterial({ color: 0x2a1c12, emissive: 0x4a2410, emissiveIntensity: 0.5 })
    );
    podium.position.set(0, 0.11, 4);
    scene.add(podium);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.75, 0.05, 10, 60),
      new THREE.MeshBasicMaterial({ color: 0xffa050, transparent: true, opacity: 0.8 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.24;
    scene.add(ring);

    // ---- muros con paneles ----
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x120c0a });
    const mkWall = (w: number, h: number, x: number, y: number, z: number, ry: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.4), wallMat);
      m.position.set(x, y, z);
      m.rotation.y = ry;
      scene.add(m);
    };
    mkWall(HALF_W * 2, WALL_H, 0, WALL_H / 2, -HALF_D, 0);
    mkWall(HALF_W * 2, WALL_H, 0, WALL_H / 2, HALF_D, 0);
    mkWall(HALF_D * 2, WALL_H, -HALF_W, WALL_H / 2, 0, Math.PI / 2);
    mkWall(HALF_D * 2, WALL_H, HALF_W, WALL_H / 2, 0, Math.PI / 2);
    // luces de pared (franjas de neón)
    for (const z of [-HALF_D + 0.3, HALF_D - 0.3]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(HALF_W * 2 - 2, 0.08, 0.06), new THREE.MeshBasicMaterial({ color: 0xffa050 }));
      strip.position.set(0, WALL_H - 0.8, z + (z < 0 ? 0.3 : -0.3));
      scene.add(strip);
    }

    // ---- puertas holográficas ----
    const doorMeshes: { mesh: THREE.Mesh; def: DoorDef; mat: THREE.MeshBasicMaterial }[] = [];
    for (const d of DOORS) {
      const tex = makeLabelTexture(d.label, d.sub, d.hex);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.7), mat);
      mesh.position.set(d.x, 2.6, d.z + (d.rotY === 0 ? 0.3 : 0));
      mesh.rotation.y = d.rotY === 0 ? 0 : d.rotY;
      if (d.rotY === Math.PI / 2) mesh.position.x = d.x + 0.3;
      if (d.rotY === -Math.PI / 2) mesh.position.x = d.x - 0.3;
      scene.add(mesh);
      doorMeshes.push({ mesh, def: d, mat });
      // marco emisivo
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(5.8, 3.1, 0.08),
        new THREE.MeshBasicMaterial({ color: d.hex, transparent: true, opacity: 0.22 })
      );
      frame.position.copy(mesh.position);
      frame.position.y = 2.6;
      frame.rotation.copy(mesh.rotation);
      frame.position.add(new THREE.Vector3(0, 0, d.rotY === 0 ? (d.z < 0 ? -0.06 : 0.06) : 0));
      if (d.rotY === Math.PI / 2) frame.position.x += 0.06;
      if (d.rotY === -Math.PI / 2) frame.position.x -= 0.06;
      scene.add(frame);
    }

    // ---- estaciones (pedestales) ----
    const stationMeshes: { group: THREE.Group; def: StationDef; core: THREE.Mesh }[] = [];
    for (const s of STATIONS) {
      const g = new THREE.Group();
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 1.1, 1.0, 24),
        new THREE.MeshLambertMaterial({ color: 0x141a26 })
      );
      pedestal.position.y = 0.5;
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.42, 0),
        new THREE.MeshLambertMaterial({ color: s.hex, emissive: s.hex, emissiveIntensity: 1.4 })
      );
      core.position.y = 1.6;
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.7, 0.03, 8, 40),
        new THREE.MeshBasicMaterial({ color: s.hex, transparent: true, opacity: 0.7 })
      );
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 1.6;
      g.add(pedestal, core, halo);
      g.position.set(s.x, 0, s.z);
      scene.add(g);
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeNameTexture(s.label, `#${s.hex.toString(16).padStart(6, "0")}`), transparent: true, depthWrite: false }));
      label.scale.set(7.5, 1.9, 1);
      label.position.set(s.x, 2.7, s.z);
      scene.add(label);
      stationMeshes.push({ group: g, def: s, core });
    }

    // ---- fichas de misión flotantes junto a la puerta de misiones ----
    const missionCards: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const card = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 2.1),
        new THREE.MeshBasicMaterial({
          map: makeLabelTexture(`MISIÓN ${String.fromCharCode(65 + i)}`, "toca para abrir", 0xff3b30),
          transparent: true, opacity: 0.95, side: THREE.DoubleSide,
        })
      );
      card.position.set(-2.4 + i * 2.4, 3.6 + (i % 2) * 0.5, -HALF_D + 1.6);
      scene.add(card);
      missionCards.push(card);
    }

    // ---- agente del jugador (low-poly, uniforme por rango) ----
    const uniformColor = level >= 25 ? 0x8a1420 : level >= 16 ? 0x7a5a10 : level >= 8 ? 0x0e4a5a : level >= 3 ? 0x14401e : 0x3a3f4a;
    const agent = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: uniformColor });
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xd8a77a });
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.62, 4, 12), bodyMat);
    torso.position.y = 1.18;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 16), skinMat);
    head.position.y = 1.92;
    const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.5, 4, 8), bodyMat);
    armL.position.set(-0.47, 1.22, 0);
    const armR = armL.clone(); armR.position.x = 0.47;
    const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.5, 4, 8), new THREE.MeshLambertMaterial({ color: 0x1a1d26 }));
    legL.position.set(-0.18, 0.42, 0);
    const legR = legL.clone(); legR.position.x = 0.18;
    agent.add(torso, head, armL, armR, legL, legR);
    // insignia de rango en el pecho
    const badge = new THREE.Mesh(
      new THREE.CircleGeometry(0.09, 16),
      new THREE.MeshBasicMaterial({ color: rankInfo.name === "RECLUTA" ? 0x8a90a8 : rankInfo.name === "MARISCAL" || rankInfo.name === "GENERAL" ? 0xffd60a : 0x1e90ff })
    );
    badge.position.set(0.2, 1.36, 0.3);
    agent.add(badge);
    agent.position.set(0, 0.22, 4);
    scene.add(agent);
    // aura por rango (anillo en el suelo)
    const auraColor = RANK_AURA[rankInfo.name] ?? 0x1e90ff;
    const aura = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.05, 8, 48),
      new THREE.MeshBasicMaterial({ color: auraColor, transparent: true, opacity: 0.75 })
    );
    aura.rotation.x = Math.PI / 2;
    aura.position.y = 0.05;
    agent.add(aura);

    // ---- otros agentes conectados (avatares de luz) ----
    const ghosts: { group: THREE.Group; t: number; from: THREE.Vector3; to: THREE.Vector3; speed: number }[] = [];
    const ghostCount = Math.min(8, Math.max(2, online));
    for (let i = 0; i < ghostCount; i++) {
      const g = new THREE.Group();
      const isHigh = i === 0 && online >= 2; // el primero siempre luce aura dorada de Oráculo
      const col = isHigh ? 0xffd60a : i % 3 === 0 ? 0x9b5cff : 0x1e90ff;
      const phantom = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.3, 0.75, 4, 10),
        new THREE.MeshLambertMaterial({ color: col, emissive: col, emissiveIntensity: 1.1, transparent: true, opacity: 0.75 })
      );
      phantom.position.y = 1.0;
      const haloG = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.035, 8, 40),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8 })
      );
      haloG.rotation.x = Math.PI / 2;
      haloG.position.y = 0.06;
      g.add(phantom, haloG);
      const name = isHigh ? "ORÁCULO" : GHOST_NAMES[i % GHOST_NAMES.length];
      const label = makeNameSprite(name, isHigh ? "#ffd60a" : "#8ab4ff");
      label.position.y = 2.1;
      g.add(label);
      const from = new THREE.Vector3(-HALF_W + 4 + Math.random() * (HALF_W * 2 - 8), 0, -HALF_D + 4 + Math.random() * (HALF_D * 2 - 8));
      g.position.copy(from);
      scene.add(g);
      ghosts.push({ group: g, t: Math.random(), from, to: from.clone(), speed: 0.06 + Math.random() * 0.1 });
    }

    // ---- isla del oráculo: brillo en el extremo norte (x > 22, z < -17) ----
    const islandGlow = new THREE.PointLight(0xffd60a, 22, 12);
    islandGlow.position.set(24.5, 1.4, -18.5);
    scene.add(islandGlow);
    const islandCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.5, 0),
      new THREE.MeshLambertMaterial({ color: 0xffd60a, emissive: 0xffd60a, emissiveIntensity: 2, transparent: true, opacity: oraculoClaimed() ? 0.4 : 0.95 })
    );
    islandCore.position.copy(islandGlow.position);
    scene.add(islandCore);
    const islandLabel = makeNameSprite("··· ¿ISLA? ···", "#ffd60a");
    islandLabel.position.set(24.5, 2.6, -18.5);
    scene.add(islandLabel);

    // ---- v71.0 OCASO: LUNA LLENA gigante sobre el muro norte (textura canvas con cráteres) ----
    const moonTex = (() => {
      const c = document.createElement("canvas");
      c.width = 256; c.height = 256;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(108, 98, 30, 128, 128, 126);
      g.addColorStop(0, "#fffdf4");
      g.addColorStop(0.55, "#ffefc9");
      g.addColorStop(0.88, "#f0d7a0");
      g.addColorStop(1, "rgba(240,210,150,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(128, 128, 124, 0, Math.PI * 2);
      ctx.fill();
      // cráteres
      const crater = (x: number, y: number, r: number, a: number) => {
        const cg = ctx.createRadialGradient(x, y, 1, x, y, r);
        cg.addColorStop(0, `rgba(150,110,60,${a})`);
        cg.addColorStop(1, "rgba(150,110,60,0)");
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };
      crater(96, 88, 20, 0.30);
      crater(160, 150, 15, 0.26);
      crater(120, 170, 11, 0.22);
      crater(172, 96, 9, 0.20);
      crater(88, 140, 7, 0.20);
      return new THREE.CanvasTexture(c);
    })();
    const moon = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 40),
      new THREE.MeshBasicMaterial({ map: moonTex, transparent: true, fog: false })
    );
    moon.position.set(16, 7.4, -HALF_D + 0.4);
    scene.add(moon);
    const moonGlowMat = new THREE.SpriteMaterial({
      map: moonTex, transparent: true, opacity: 0.55, depthWrite: false,
      blending: THREE.AdditiveBlending, fog: false,
    });
    const moonGlow = new THREE.Sprite(moonGlowMat);
    moonGlow.scale.set(15, 15, 1);
    moonGlow.position.copy(moon.position);
    moonGlow.position.z -= 0.15;
    scene.add(moonGlow);

    // ---- movimiento ----
    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        keys.add(k);
        e.preventDefault();
      }
      if (k === "e" || k === "enter") tryInteract();
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // joystick táctil
    const joy = { active: false, dx: 0, dy: 0, id: -1 };
    const joyEl = document.getElementById("hangar-joystick");
    const knob = document.getElementById("hangar-joystick-knob");
    const onJoyMove = (e: PointerEvent) => {
      if (!joy.active || !joyEl) return;
      const r = joyEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      let dx = e.clientX - cx;
      let dy = e.clientY - cy;
      const max = r.width / 2;
      const len = Math.hypot(dx, dy);
      if (len > max) { dx = (dx / len) * max; dy = (dy / len) * max; }
      joy.dx = dx / max; joy.dy = dy / max;
      if (knob) knob.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const onJoyStart = (e: PointerEvent) => {
      joy.active = true; joy.id = e.pointerId;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      onJoyMove(e);
    };
    const onJoyEnd = () => {
      joy.active = false; joy.dx = 0; joy.dy = 0;
      if (knob) knob.style.transform = "translate(0px, 0px)";
    };
    joyEl?.addEventListener("pointerdown", onJoyStart);
    window.addEventListener("pointermove", onJoyMove);
    window.addEventListener("pointerup", onJoyEnd);
    window.addEventListener("pointercancel", onJoyEnd);

    // raycast de clics: puertas / estaciones / fichas / isla
    const raycaster = new THREE.Raycaster();
    const clickPoint = new THREE.Vector2();
    let downAt = 0;
    const onDown = (e: PointerEvent) => { downAt = Date.now(); };
    const onUp = (e: PointerEvent) => {
      if (Date.now() - downAt > 350) return; // fue arrastre
      const rect = renderer.domElement.getBoundingClientRect();
      clickPoint.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      clickPoint.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(clickPoint, cam);
      const doorHits = raycaster.intersectObjects(doorMeshes.map((d) => d.mesh));
      if (doorHits.length) {
        const d = doorMeshes.find((dm) => dm.mesh === doorHits[0].object)!;
        sfx.success();
        window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: d.def.tab }));
        return;
      }
      const cardHits = raycaster.intersectObjects(missionCards);
      if (cardHits.length) {
        sfx.success();
        window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: "misiones" }));
        return;
      }
      const coreHits = raycaster.intersectObjects(stationMeshes.map((s) => s.core));
      if (coreHits.length) {
        const st = stationMeshes.find((s) => s.core === coreHits[0].object)!;
        sfx.unlock();
        setModal(st.def.key);
        return;
      }
      const islandHits = raycaster.intersectObject(islandCore);
      if (islandHits.length) {
        sfx.alarm();
        setModal("oraculo");
      }
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    function nearestDoor(): DoorDef | null {
      let best: DoorDef | null = null;
      let bd = 1e9;
      for (const d of DOORS) {
        const dist = Math.hypot(agent.position.x - d.x, agent.position.z - d.z);
        if (dist < bd) { bd = dist; best = d; }
      }
      return bd < 4.2 ? best : null;
    }
    function nearestStation(): StationDef | null {
      for (const s of STATIONS) {
        if (Math.hypot(agent.position.x - s.x, agent.position.z - s.z) < 2.6) return s;
      }
      return null;
    }
    function tryInteract() {
      const st = nearestStation();
      if (st) { sfx.unlock(); setModal(st.key); return; }
      const d = nearestDoor();
      if (d) {
        sfx.success();
        window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: d.tab }));
      }
    }

    // ---- bucle ----
    const clock = new THREE.Clock();
    let islandHintShown = false;
    let raf = 0;
    const camTarget = new THREE.Vector3();
    const camGoal = new THREE.Vector3(); // v70.1: vector reutilizable (antes 60 allocations/seg)
    let walkPhase = 0;
    // v67.1: la cámara NACE en su posición de seguimiento (sin lerp desde el origen)
    cam.position.set(agent.position.x * 0.7, 6.4, agent.position.z + 9.2);
    cam.lookAt(agent.position.x * 0.55, 1.6, agent.position.z * 0.55 + 3.5);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;

      // input → velocidad
      let mx = 0, mz = 0;
      if (keys.has("w") || keys.has("arrowup")) mz -= 1;
      if (keys.has("s") || keys.has("arrowdown")) mz += 1;
      if (keys.has("a") || keys.has("arrowleft")) mx -= 1;
      if (keys.has("d") || keys.has("arrowright")) mx += 1;
      if (joy.active) { mx += joy.dx; mz += joy.dy; }
      const len = Math.hypot(mx, mz);
      const SPEED = 7.4;
      if (len > 0.15) {
        mx = (mx / Math.max(len, 1)) * SPEED * dt;
        mz = (mz / Math.max(len, 1)) * SPEED * dt;
        const nx = THREE.MathUtils.clamp(agent.position.x + mx, -HALF_W + 1.2, HALF_W - 1.2);
        const nz = THREE.MathUtils.clamp(agent.position.z + mz, -HALF_D + 1.2, HALF_D - 1.2);
        agent.position.x = nx;
        agent.position.z = nz;
        agent.rotation.y = Math.atan2(mx, mz);
        walkPhase += dt * 9;
        legL.rotation.x = Math.sin(walkPhase) * 0.55;
        legR.rotation.x = -Math.sin(walkPhase) * 0.55;
        armL.rotation.x = -Math.sin(walkPhase) * 0.4;
        armR.rotation.x = Math.sin(walkPhase) * 0.4;
      } else {
        legL.rotation.x *= 0.9; legR.rotation.x *= 0.9;
        armL.rotation.x *= 0.9; armR.rotation.x *= 0.9;
      }

      // idle: respiración + vaivén sutil
      const breathe = 1 + Math.sin(t * 1.7) * 0.015;
      torso.scale.set(1, breathe, 1);
      head.position.y = 1.92 + Math.sin(t * 1.7) * 0.012;
      aura.rotation.z = t * 0.8;

      // cámara tercera persona suave
      camTarget.set(agent.position.x * 0.55, 0, agent.position.z * 0.55 + 3.5);
      camGoal.set(agent.position.x * 0.7, 6.4, agent.position.z + 9.2);
      cam.position.lerp(camGoal, 0.06);
      cam.lookAt(camTarget.x, 1.6, camTarget.z);

      // puertas: proximidad las enciende
      for (const dm of doorMeshes) {
        const dist = Math.hypot(agent.position.x - dm.def.x, agent.position.z - dm.def.z);
        const near = Math.max(0, 1 - dist / 7);
        dm.mat.opacity = 0.55 + near * 0.45;
        dm.mesh.position.y = 2.6 + Math.sin(t * 2 + dm.def.x) * 0.06;
        dm.mesh.scale.setScalar(1 + near * 0.06);
      }

      // estaciones: núcleo orbita y pulsa
      for (const s of stationMeshes) {
        s.core.rotation.y = t * 1.2;
        s.core.rotation.x = t * 0.7;
        s.core.position.y = 1.6 + Math.sin(t * 2.2 + s.def.x) * 0.12;
      }

      // fichas de misión flotando
      for (let i = 0; i < missionCards.length; i++) {
        missionCards[i].position.y = 3.6 + Math.sin(t * 1.8 + i * 2) * 0.22;
        missionCards[i].rotation.y = Math.sin(t * 0.9 + i) * 0.35;
      }

      // fantasmas caminando entre waypoints
      for (const g of ghosts) {
        g.t += dt * g.speed;
        if (g.t >= 1) {
          g.t = 0;
          g.from.copy(g.to);
          g.to.set(-HALF_W + 3 + Math.random() * (HALF_W * 2 - 6), 0, -HALF_D + 3 + Math.random() * (HALF_D * 2 - 6));
        }
        g.group.position.lerpVectors(g.from, g.to, g.t);
        g.group.position.y = Math.abs(Math.sin(g.t * Math.PI)) * 0.18;
      }

      // isla: latido
      islandCore.rotation.y = t * 1.4;
      islandGlow.intensity = 18 + Math.sin(t * 3) * 8;

      // v71.0 OCASO: la luna llena respira — halo que late lento
      moonGlowMat.opacity = 0.5 + Math.sin(t * 0.7) * 0.12;
      moon.rotation.z = Math.sin(t * 0.05) * 0.06;

      // descubrimiento por proximidad
      if (!islandHintShown && agent.position.x > 21 && agent.position.z < -15) {
        islandHintShown = true;
        sfx.alarm();
        setModal("oraculo");
      }

      // hint contextual
      const nd = nearestDoor();
      const nst = nearestStation();
      const nextHint = nst ? `TOCA EL NÚCLEO para abrir ${nst.label}` : nd ? `TOCA LA PUERTA para entrar en ${nd.label}` : "WASD / joystick para caminar · E para interactuar";
      setHint((h) => (h === nextHint ? h : nextHint));

      // v70.1 calidad adaptativa: FPS medio cada 1.6s → baja la resolución un paso
      fpsFrames++;
      fpsTime += dt;
      if (fpsTime >= 1.6) {
        const fps = fpsFrames / fpsTime;
        fpsFrames = 0;
        fpsTime = 0;
        if (fps < 38 && qStep < QUALITY_STEPS.length - 1) {
          qStep++;
          renderer.setPixelRatio(QUALITY_STEPS[qStep]);
          renderer.setSize(mount.clientWidth, Math.max(320, mount.clientHeight));
        }
      }

      renderer.render(scene, cam);
    };
    tick();

    const onResize = () => {
      if (!mount) return;
      cam.aspect = mount.clientWidth / Math.max(1, mount.clientHeight);
      cam.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, Math.max(320, mount.clientHeight));
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("pointermove", onJoyMove);
      window.removeEventListener("pointerup", onJoyEnd);
      window.removeEventListener("pointercancel", onJoyEnd);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      joyEl?.removeEventListener("pointerdown", onJoyStart);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const m = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
        else if (m) m.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, [online, level, rank]);

  const showMorse = () => {
    toast.info(`··· — ·−− −−− ·−· ·−· ·· ·− ·−·−− ··− ·−· −−− ··· · −−−− ·−−− ·−· −−− ·−−− ·−−− ·−−− ·· ·− ·−·−−`, {
      description: `Pista de la agencia: escribe ${ORACULO_SECRET} en cualquier pantalla con el teclado.`,
      duration: 10000,
    });
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="EL HANGAR · Base de Operaciones 3D"
        subtitle="Tu agente, tus puertas, tu mundo — camina con WASD o joystick táctil"
        icon={<Warehouse className="w-4 h-4 text-electric" />}
        color="cyan"
        right={
          <div className="hidden sm:flex items-center gap-3 font-mono text-[10px]">
            <span className="text-amber flex items-center gap-1"><Coins className="w-3 h-3" />{coins}</span>
            <span className="text-crisis flex items-center gap-1"><Flame className="w-3 h-3" />{streak}</span>
            <span className="text-neon flex items-center gap-1"><Users className="w-3 h-3" />{online}</span>
            <span className="text-crisis flex items-center gap-1"><Thermometer className="w-3 h-3" />{Math.round(tension)}°</span>
          </div>
        }
      />

      <div className="relative hud-corner overflow-hidden" style={{ height: "min(72vh, 620px)", background: "#07070d" }}>
        <div ref={mountRef} className="absolute inset-0" />

        {/* HUD del agente */}
        <div className="absolute top-2 left-2 font-mono text-[9px] uppercase tracking-widest pointer-events-none select-none">
          <div className="px-2 py-1 bg-black/60 border border-electric-hud text-electric">
            {alias || "AGENTE SIN NOMBRE"} · NIVEL {level} · {rankInfo.name}
          </div>
        </div>
        <div className="absolute top-2 right-2 pointer-events-none select-none">
          <button onClick={showMorse} className="px-2 py-1 bg-black/60 border border-amber-hud/60 text-amber/90 font-mono text-[9px] tracking-[0.25em] vg-transition hover:text-amber">
            ··· — ·−−
          </button>
        </div>

        {/* hint contextual */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="px-3 py-1 bg-black/70 border border-border font-mono text-[9px] text-soft/80 uppercase tracking-widest whitespace-nowrap">
            <Compass className="inline w-3 h-3 mr-1 text-electric" /> {hint}
          </div>
        </div>

        {/* joystick táctil */}
        <div
          id="hangar-joystick"
          className="absolute bottom-4 left-4 w-28 h-28 rounded-full touch-none select-none"
          style={{ background: "radial-gradient(circle, rgba(30,144,255,0.14), rgba(10,10,15,0.5))", border: "1px solid rgba(30,144,255,0.4)" }}
          aria-label="Joystick táctil del hangar"
        >
          <div
            id="hangar-joystick-knob"
            className="absolute top-1/2 left-1/2 w-11 h-11 -mt-5.5 -ml-5.5 rounded-full"
            style={{ transform: "translate(0px,0px)", background: "radial-gradient(circle at 35% 30%, #3ea6ff, #123a7a)", boxShadow: "0 0 16px rgba(30,144,255,0.6)" }}
          />
        </div>

        {/* accesos directos (móvil sin raycast fino) */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
          {DOORS.map((d) => (
            <button
              key={d.tab}
              onClick={() => {
                sfx.success();
                window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: d.tab }));
              }}
              className="px-2 py-1 font-mono text-[8px] uppercase tracking-widest bg-black/60 vg-transition"
              style={{ border: `1px solid #${d.hex.toString(16).padStart(6, "0")}66`, color: `#${d.hex.toString(16).padStart(6, "0")}` }}
            >
              {d.label}
            </button>
          ))}
          <button onClick={() => openModal("tarot")} className="px-2 py-1 font-mono text-[8px] uppercase tracking-widest bg-black/60 border border-violet/60 text-violet vg-transition">TAROT</button>
          <button onClick={() => openModal("propaganda")} className="px-2 py-1 font-mono text-[8px] uppercase tracking-widest bg-black/60 border border-crisis/60 text-crisis vg-transition">PROPAGANDA</button>
          <button onClick={() => openModal("diario")} className="px-2 py-1 font-mono text-[8px] uppercase tracking-widest bg-black/60 border border-amber-hud/60 text-amber vg-transition">DIARIO</button>
        </div>
      </div>

      {/* leyenda de estaciones */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {STATIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => openModal(s.key)}
            className="hud-corner p-2.5 text-left vg-transition hover:border-electric-hud"
            style={{ borderColor: `#${s.hex.toString(16).padStart(6, "0")}44` }}
          >
            <div className="font-display text-[11px] font-bold tracking-wide" style={{ color: `#${s.hex.toString(16).padStart(6, "0")}` }}>{s.label}</div>
            <div className="font-mono text-[9px] text-muted-foreground">{s.sub}</div>
          </button>
        ))}
      </div>

      <TarotModal open={modal === "tarot"} onClose={() => setModal(null)} />
      <PropagandaModal open={modal === "propaganda"} onClose={() => setModal(null)} />
      <DiarioModal open={modal === "diario"} onClose={() => setModal(null)} />

      {/* Isla del Oráculo */}
      <Dialogish open={modal === "oraculo"} onClose={() => setModal(null)} docs={ORACULO_DOCS} />
    </div>
  );
}

// modo del diálogo compartido por la isla
function Dialogish({ open, onClose, docs }: { open: boolean; onClose: () => void; docs: typeof ORACULO_DOCS }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="font-display tracking-widest text-amber">🏝️ BIBLIOTECA DEL ORÁCULO</DialogTitle>
          <DialogDescription>
            Una isla que no aparece en ningún mapa. Cuatro documentos que la historia dejó a medias — con veredicto de la agencia.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {docs.map((d) => (
            <div key={d.id} className="border border-amber-hud/40 p-3 bg-secondary/20">
              <div className="flex items-center justify-between gap-2">
                <div className="font-mono text-[10px] font-bold text-amber tracking-widest">{d.title}</div>
                <span className="font-mono text-[9px]">{d.tag}</span>
              </div>
              <p className="text-[11px] text-soft/85 leading-relaxed mt-1">{d.body}</p>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={onClose} className="w-full font-mono text-[10px] uppercase tracking-widest">
          Salir de la isla
        </Button>
      </DialogContent>
    </Dialog>
  );
}
