"use client";

// frente-3d.tsx — v66.0 TERCERA DIMENSIÓN
// Espejo 3D (Three.js) del combate de LÍNEAS DE FRENTE: NO tiene lógica propia —
// lee el MISMO stateRef del canvas 2D (unidades, obuses, explosiones, cajas,
// contrafuego, combo, fiebre, puesto de mando) y lo reconstruye en una escena
// tridimensional orbitable. Toda la economía, strikes y sonido siguen viviendo
// en frente-panel.tsx; aquí solo se renderiza y se traducen los clics a strikes.
// Optimizado para móvil: Lambert sin sombras, pools de objetos, pixelRatio tope 2.

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ---- ciclo día/noche (duplicado ligero para evitar import circular) ----
type Phase = "noche" | "amanecer" | "día" | "ocaso";
function dayPhase(d = new Date()): Phase {
  const h = d.getUTCHours();
  if (h >= 5 && h < 8) return "amanecer";
  if (h >= 8 && h < 17) return "día";
  if (h >= 17 && h < 21) return "ocaso";
  return "noche";
}
const PAL3D: Record<Phase, { bg: number; fog: number; sun: number; sunI: number; hemi: number; ground: number }> = {
  noche: { bg: 0x0d1220, fog: 0x05070d, sun: 0x8fa8ff, sunI: 0.5, hemi: 0.68, ground: 0x0a0d14 },
  amanecer: { bg: 0x6e4433, fog: 0x241f2e, sun: 0xffb070, sunI: 0.9, hemi: 0.72, ground: 0x1a1410 },
  día: { bg: 0x3d4f68, fog: 0x1f2c42, sun: 0xfff2dd, sunI: 1.15, hemi: 0.85, ground: 0x141922 },
  ocaso: { bg: 0x7c422a, fog: 0x311c26, sun: 0xff8050, sunI: 0.95, hemi: 0.72, ground: 0x1c1210 },
};
const TERRAIN_COLOR: Record<string, number> = {
  urbano: 0x191c22, bosque: 0x101a12, desierto: 0x5a4b2c, "montaña": 0x232a22, costa: 0x3d3a28,
};

// ---- mapeo de coordenadas: el canvas 2D es 880×430, ground = 0.72·H ----
const VW = 880;
const VH = 430;
const GROUND = VH * 0.72;
const WW = 80; // ancho del mundo en unidades
const KY = 0.16; // escala vertical px → mundo
const px2wx = (px: number) => (px / VW - 0.5) * WW;
const px2wy = (px: number) => (GROUND - px) * KY;
const nx2wx = (nx: number) => (nx - 0.5) * WW;

export interface F3DState {
  units: { x: number; side: 0 | 1; type: "tank" | "soldier" | "apc" | "art" }[];
  booms: { x: number; y: number; r: number; max: number }[];
  smokes: { x: number; y: number; r: number; vx: number; life: number }[];
  tracers: { x1: number; y1: number; x2: number; y2: number; life: number }[];
  shells: { x0: number; y0: number; x1: number; y1: number; p: number; side: 0 | 1 }[];
  crates: { x: number; y: number; land: number; life: number }[];
  jets: { x: number; y: number; vx: number; side: 0 | 1 }[];
  hcos: { x: number; y: number; side: 0 | 1 }[];
  decs: { x: number; y: number; tank: boolean }[];
  flares: { x: number; y: number; life: number }[];
  momentum: number;
  shake: number;
  cpHp: number;
  cpDown: number;
  flash: number;
}

export interface F3DFront {
  name: string;
  intensity: number;
  terrain: string;
  sideA: { name: string; colors: string[] };
  sideB: { name: string; colors: string[] };
}

// ------------------------------------------------------------ fábricas ----

function lam(color: number) {
  return new THREE.MeshLambertMaterial({ color });
}

// material de unidad: emisión leve del color del bando para VER los ejércitos de noche
function unitMat(color: number) {
  return new THREE.MeshLambertMaterial({ color, emissive: new THREE.Color(color), emissiveIntensity: 0.3 });
}

function buildSoldier(main: number) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.9, 6), unitMat(main));
  body.position.y = 0.5;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 6, 5), lam(0x20242c));
  head.position.y = 1.1;
  g.add(head);
  const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.06), lam(0x111318));
  rifle.position.set(0.3, 0.7, 0);
  g.add(rifle);
  return g;
}

function buildTank(main: number) {
  const g = new THREE.Group();
  const tracks = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 1.1), lam(0x14161c));
  tracks.position.y = 0.24;
  g.add(tracks);
  const hull = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.52, 0.95), unitMat(main));
  hull.position.y = 0.68;
  g.add(hull);
  const turret = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.38, 0.78), unitMat(main));
  turret.position.set(-0.1, 1.08, 0);
  g.add(turret);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.7, 6), unitMat(main));
  barrel.rotation.z = Math.PI / 2;
  barrel.position.set(0.95, 1.1, 0);
  g.add(barrel);
  return g;
}

function buildAPC(main: number) {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 1.0), unitMat(main));
  hull.position.y = 0.62;
  g.add(hull);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.95), unitMat(main));
  cabin.position.set(-0.4, 1.1, 0);
  cabin.rotation.z = -0.18;
  g.add(cabin);
  for (const wx of [-0.9, -0.3, 0.3, 0.9]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.18, 8), lam(0x14161c));
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, 0.26, 0.52);
    g.add(wheel);
    const wheel2 = wheel.clone();
    wheel2.position.z = -0.52;
    g.add(wheel2);
  }
  return g;
}

function buildArt(main: number) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.35, 0.9), lam(0x14161c));
  base.position.y = 0.2;
  g.add(base);
  const mount = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.8), unitMat(main));
  mount.position.y = 0.6;
  g.add(mount);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.2, 6), unitMat(main));
  barrel.rotation.z = Math.PI / 2 - 0.65;
  barrel.position.set(0.62, 1.15, 0);
  g.add(barrel);
  return g;
}

function buildJet(color: number) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.32, 2.8, 6), unitMat(color));
  body.rotation.z = -Math.PI / 2;
  body.position.y = 0.2;
  g.add(body);
  const wings = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 2.1), unitMat(color));
  wings.position.set(-0.25, 0.12, 0);
  g.add(wings);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.06), lam(color));
  fin.position.set(-0.9, 0.35, 0);
  g.add(fin);
  return g;
}

function buildHco(color: number) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 0.85), lam(color));
  g.add(body);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.24, 0.24), lam(color));
  tail.position.set(-1.65, 0.25, 0);
  g.add(tail);
  const rotor = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.05, 0.2), lam(0xb4bed6));
  rotor.position.y = 0.48;
  g.add(rotor);
  g.userData.rotor = rotor;
  return g;
}

function buildCrate() {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.7, 0.95), lam(0x6b5322));
  g.add(box);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.97, 0.12, 0.97), lam(0xffb800));
  g.add(stripe);
  const chute = new THREE.Mesh(
    new THREE.ConeGeometry(1.0, 1.1, 8, 1, true),
    new THREE.MeshLambertMaterial({ color: 0xdce1eb, transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
  );
  chute.position.y = 1.5;
  g.add(chute);
  g.userData.chute = chute;
  return g;
}

function radialTex(inner: string, outer: string, size = 96) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 1, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ----------------------------------------------------------- componente ----

export function Frente3D({ stateRef, front, onStrike }: {
  stateRef: { current: F3DState };
  front: F3DFront;
  onStrike: (xPx: number, yPx: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;

    const W0 = host.clientWidth || 640;
    const H0 = host.clientHeight || 380;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W0, H0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const P = PAL3D[dayPhase()];
    scene.background = new THREE.Color(P.bg);
    scene.fog = new THREE.Fog(P.fog, 70, 175);

    const cam = new THREE.PerspectiveCamera(55, W0 / H0, 0.1, 420);
    cam.position.set(0, 23, 45);
    const controls = new OrbitControls(cam, renderer.domElement);
    controls.target.set(0, 2, 3);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 14;
    controls.maxDistance = 85;
    controls.maxPolarAngle = 1.42;
    controls.minPolarAngle = 0.12;

    // luces: hemisférica + sol + resplandor rojo del frente
    scene.add(new THREE.HemisphereLight(P.bg, P.ground, P.hemi));
    const sun = new THREE.DirectionalLight(P.sun, P.sunI);
    sun.position.set(30, 55, -25);
    scene.add(sun);
    const frontGlow = new THREE.PointLight(0xff5030, 0.35 + front.intensity / 150, 60, 1.6);
    frontGlow.position.set(0, 5, 2);
    scene.add(frontGlow);

    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(d: T): T => { disposables.push(d); return d; };
    const mesh = (geo: THREE.BufferGeometry, m: THREE.Material) => {
      track(geo); track(m);
      return new THREE.Mesh(geo, m);
    };

    // ---- TERRENO con colinas al fondo
    const gGeo = track(new THREE.PlaneGeometry(175, 66, 56, 16));
    gGeo.rotateX(-Math.PI / 2);
    const gp = gGeo.attributes.position;
    for (let i = 0; i < gp.count; i++) {
      const x = gp.getX(i), z = gp.getZ(i);
      const h = Math.sin(x * 0.11 + z * 0.07) * 0.5 + Math.sin(x * 0.31 + 2) * 0.3;
      gp.setY(i, h * (z < -10 ? 2.2 : 0.45));
    }
    gGeo.computeVertexNormals();
    const groundMesh = mesh(gGeo, track(new THREE.MeshLambertMaterial({ color: TERRAIN_COLOR[front.terrain] ?? 0x14181f })));
    scene.add(groundMesh);

    // ---- UTILERÍA POR TEATRO (horizonte 3D del frente)
    const blinkers: THREE.Sprite[] = [];
    const addSprite = (inner: string, outer: string, x: number, y: number, z: number, s: number, additive = true) => {
      const m = track(new THREE.SpriteMaterial({
        map: track(radialTex(inner, outer)),
        transparent: true, depthWrite: false,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      }));
      const sp = new THREE.Sprite(m);
      sp.position.set(x, y, z);
      sp.scale.set(s, s, 1);
      scene.add(sp);
      return sp;
    };
    if (front.terrain === "urbano") {
      for (let i = 0; i < 13; i++) {
        const bw = 2.2 + (i % 3) * 1.1;
        const bh = 3 + ((i * 7) % 5) * 1.6;
        const b = mesh(new THREE.BoxGeometry(bw, bh, bw), track(new THREE.MeshLambertMaterial({ color: 0x1c2026 })));
        b.position.set(-38 + i * 6.1, bh / 2, -14 - (i % 4) * 3.4);
        scene.add(b);
        if (i % 4 === 1) blinkers.push(addSprite("rgba(255,150,50,0.9)", "rgba(255,60,10,0)", b.position.x, bh + 0.4, b.position.z, 3.2));
      }
    } else if (front.terrain === "bosque") {
      for (let i = 0; i < 18; i++) {
        const h = 2.4 + ((i * 5) % 4) * 0.8;
        const pine = mesh(new THREE.ConeGeometry(1.0, h, 6), track(new THREE.MeshLambertMaterial({ color: 0x14261a })));
        pine.position.set(-40 + i * 4.7 + (i % 3), h / 2, -13 - (i % 5) * 3);
        scene.add(pine);
      }
    } else if (front.terrain === "desierto") {
      for (let i = 0; i < 6; i++) {
        const dune = mesh(new THREE.SphereGeometry(3.4 + (i % 3), 8, 5), track(new THREE.MeshLambertMaterial({ color: 0x6b5a34 })));
        dune.scale.y = 0.24;
        dune.position.set(-36 + i * 13, 0.1, -15 - (i % 3) * 4);
        scene.add(dune);
      }
      for (const tx of [-12, 21]) {
        const trunk = mesh(new THREE.CylinderGeometry(0.09, 0.13, 1.8, 5), track(new THREE.MeshLambertMaterial({ color: 0x2c2418 })));
        trunk.position.set(tx, 0.9, -12);
        scene.add(trunk);
      }
    } else if (front.terrain === "montaña") {
      for (let i = 0; i < 6; i++) {
        const h = 9 + ((i * 3) % 4) * 2.4;
        const peak = mesh(new THREE.ConeGeometry(5.5 + (i % 3), h, 6), track(new THREE.MeshLambertMaterial({ color: 0x2c3138 })));
        peak.position.set(-36 + i * 14.5, h / 2 - 1, -20 - (i % 2) * 6);
        scene.add(peak);
        const tip = mesh(new THREE.ConeGeometry(1.7, h * 0.22, 6), track(new THREE.MeshLambertMaterial({ color: 0xdde3ec })));
        tip.position.set(peak.position.x, peak.position.y + h * 0.39, peak.position.z);
        scene.add(tip);
      }
    } else if (front.terrain === "costa") {
      const sea = mesh(new THREE.PlaneGeometry(175, 24), track(new THREE.MeshLambertMaterial({ color: 0x0e2733 })));
      sea.rotation.x = -Math.PI / 2;
      sea.position.set(0, 0.06, -20);
      scene.add(sea);
      for (const sx of [-16, 9]) {
        const ship = mesh(new THREE.BoxGeometry(2.6, 0.9, 0.9), track(new THREE.MeshLambertMaterial({ color: 0x20262e })));
        ship.position.set(sx, 0.5, -18);
        scene.add(ship);
      }
      const lh = mesh(new THREE.CylinderGeometry(0.45, 0.62, 6, 8), track(new THREE.MeshLambertMaterial({ color: 0x9aa2ae })));
      lh.position.set(34, 3, -16);
      scene.add(lh);
      blinkers.push(addSprite("rgba(255,240,180,0.95)", "rgba(255,180,60,0)", 34, 6.4, -16, 3.6));
    }

    // ---- LÍNEA DE FRENTE + trincheras + banderas + puesto de mando
    const lineMat = track(new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.42 }));
    const frontLine = mesh(new THREE.BoxGeometry(0.35, 2.2, 30), lineMat);
    scene.add(frontLine);
    const trenchMat = track(new THREE.MeshLambertMaterial({ color: 0x171b24 }));
    const tr1 = mesh(new THREE.BoxGeometry(4.6, 0.5, 1.4), trenchMat);
    const tr2 = mesh(new THREE.BoxGeometry(4.6, 0.5, 1.4), trenchMat);
    scene.add(tr1, tr2);

    const flagPole = (x: number, colors: string[]) => {
      const pole = mesh(new THREE.CylinderGeometry(0.05, 0.05, 5.2, 5), track(new THREE.MeshLambertMaterial({ color: 0x1a1e27 })));
      pole.position.set(x, 2.6, 5.5);
      scene.add(pole);
      const f1 = mesh(new THREE.BoxGeometry(2.0, 0.75, 0.06), track(new THREE.MeshLambertMaterial({ color: new THREE.Color(colors[0] ?? "#888") })));
      f1.position.set(x + (x < 0 ? 1.05 : -1.05), 4.7, 5.5);
      scene.add(f1);
      const f2 = mesh(new THREE.BoxGeometry(2.0, 0.38, 0.06), track(new THREE.MeshLambertMaterial({ color: new THREE.Color(colors[1] ?? colors[0] ?? "#888") })));
      f2.position.set(f1.position.x, 3.95, 5.5);
      scene.add(f2);
    };
    flagPole(-37.5, front.sideA.colors);
    flagPole(37.5, front.sideB.colors);

    // puesto de mando del operador (borde izquierdo)
    const cp = new THREE.Group();
    const bagMat = track(new THREE.MeshLambertMaterial({ color: 0x5a5340 }));
    for (let i = 0; i < 3; i++) {
      const bag = mesh(new THREE.BoxGeometry(0.9, 0.34, 0.55), bagMat);
      bag.position.set(-1 + i * 0.95, 0.17, 0);
      cp.add(bag);
      const bag2 = mesh(new THREE.BoxGeometry(0.9, 0.34, 0.55), bagMat);
      bag2.position.set(-0.55 + i * 0.95, 0.51, -0.1);
      cp.add(bag2);
    }
    const antenna = mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 5), track(new THREE.MeshLambertMaterial({ color: 0x2a2f3a })));
    antenna.position.set(-1.4, 1.5, 0);
    cp.add(antenna);
    cp.position.set(-34.5, 0, 7);
    scene.add(cp);
    const cpLight = addSprite("rgba(0,255,135,0.95)", "rgba(0,255,135,0)", -34.5, 1.4, 7, 1.6);

    // ---- POOLS DE UNIDADES (por tipo y bando)
    const colA = new THREE.Color(front.sideA.colors[0] ?? "#888");
    const colB = new THREE.Color(front.sideB.colors[0] ?? "#888");
    const pools: Record<string, THREE.Group[]> = {};
    const poolDef: [string, "tank" | "soldier" | "apc" | "art", 0 | 1, number][] = [
      ["tank0", "tank", 0, 16], ["tank1", "tank", 1, 16],
      ["soldier0", "soldier", 0, 30], ["soldier1", "soldier", 1, 30],
      ["apc0", "apc", 0, 12], ["apc1", "apc", 1, 12],
      ["art0", "art", 0, 8], ["art1", "art", 1, 8],
    ];
    for (const [key, type, side] of poolDef) {
      const col = (side === 0 ? colA : colB).getHex();
      const n = poolDef.find((d) => d[0] === key)![3];
      pools[key] = [];
      for (let i = 0; i < n; i++) {
        const g = type === "tank" ? buildTank(col) : type === "apc" ? buildAPC(col) : type === "art" ? buildArt(col) : buildSoldier(col);
        g.visible = false;
        if (type === "soldier") g.scale.setScalar(1.6);
        g.rotation.y = side === 0 ? 0 : Math.PI;
        scene.add(g);
        pools[key].push(g);
      }
    }

    // ---- POOLS DE EFECTOS
    const boomTex = track(radialTex("rgba(255,235,150,1)", "rgba(255,60,10,0)", 96));
    const boomPool: THREE.Sprite[] = [];
    for (let i = 0; i < 30; i++) {
      const m = track(new THREE.SpriteMaterial({ map: boomTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      const sp = new THREE.Sprite(m);
      sp.visible = false;
      scene.add(sp);
      boomPool.push(sp);
    }
    const smokeTex = track(radialTex("rgba(150,150,160,0.85)", "rgba(120,120,130,0)", 96));
    const smokePool: THREE.Sprite[] = [];
    for (let i = 0; i < 40; i++) {
      const m = track(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0.3 }));
      const sp = new THREE.Sprite(m);
      sp.visible = false;
      scene.add(sp);
      smokePool.push(sp);
    }
    const flarePool: THREE.Sprite[] = [];
    for (let i = 0; i < 4; i++) {
      const m = track(new THREE.SpriteMaterial({ map: boomTex, color: 0xfff8e0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      const sp = new THREE.Sprite(m);
      sp.visible = false;
      sp.scale.set(9, 9, 1);
      scene.add(sp);
      flarePool.push(sp);
    }

    // trazadoras: un solo LineSegments con buffer dinámico
    const TR_N = 64;
    const trGeo = track(new THREE.BufferGeometry());
    trGeo.setAttribute("position", track(new THREE.BufferAttribute(new Float32Array(TR_N * 2 * 3), 3)));
    const trMat = track(new THREE.LineBasicMaterial({ color: 0xffd250, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }));
    const trLines = new THREE.LineSegments(trGeo, trMat);
    trLines.frustumCulled = false;
    scene.add(trLines);

    // obuses
    const shellMat0 = track(new THREE.MeshBasicMaterial({ color: 0xffc85a }));
    const shellMat1 = track(new THREE.MeshBasicMaterial({ color: 0xff5a3c }));
    const shellGeo = track(new THREE.SphereGeometry(0.24, 6, 5));
    const shellPool: THREE.Mesh[] = [];
    for (let i = 0; i < 16; i++) {
      const sh = new THREE.Mesh(shellGeo, shellMat0);
      sh.visible = false;
      scene.add(sh);
      shellPool.push(sh);
    }

    // jets y helicópteros
    const jetPool: THREE.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const j = buildJet(0x8a93a6);
      j.visible = false;
      scene.add(j);
      jetPool.push(j);
    }
    const hcoPool: THREE.Group[] = [];
    for (let i = 0; i < 2; i++) {
      const h = buildHco(0x3a4048);
      h.visible = false;
      scene.add(h);
      hcoPool.push(h);
    }

    // cajas de suministro (con raycast para recogerlas con clic)
    const cratePool: THREE.Group[] = [];
    for (let i = 0; i < 4; i++) {
      const c = buildCrate();
      c.visible = false;
      scene.add(c);
      cratePool.push(c);
    }

    // restos / bajas
    const decPool: THREE.Mesh[] = [];
    for (let i = 0; i < 24; i++) {
      const d = mesh(new THREE.BoxGeometry(1.6, 0.28, 0.8), track(new THREE.MeshLambertMaterial({ color: 0x0a0c10 })));
      d.visible = false;
      scene.add(d);
      decPool.push(d);
    }

    // ---- CLIQUEO: raycast al suelo (strike) y a las cajas (recoger)
    const ray = new THREE.Raycaster();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hitPt = new THREE.Vector3();
    const ndc = new THREE.Vector2();
    let downX = 0, downY = 0;
    const onDown = (e: PointerEvent) => { downX = e.clientX; downY = e.clientY; };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 7) return; // fue arrastre de cámara
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, cam);
      // 1) ¿caja de suministro?
      const activeCrates = cratePool.filter((c) => c.visible);
      if (activeCrates.length) {
        const hits = ray.intersectObjects(activeCrates, true);
        if (hits.length) {
          const p = hits[0].point;
          let best: F3DState["crates"][number] | null = null;
          let bestD = 9;
          for (const cc of stateRef.current.crates) {
            const d = Math.abs(nx2wx(cc.x) - p.x);
            if (d < bestD) { bestD = d; best = cc; }
          }
          if (best) { onStrike(best.x * VW, best.y * VH); return; }
        }
      }
      // 2) strike sobre el terreno
      if (ray.ray.intersectPlane(groundPlane, hitPt)) {
        const nx = Math.max(0.02, Math.min(0.98, (hitPt.x + WW / 2) / WW));
        onStrike(nx * VW, 0.78 * VH);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    // ---- RESIZE
    const ro = new ResizeObserver(() => {
      const w = host.clientWidth || W0, h = host.clientHeight || H0;
      renderer.setSize(w, h);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    });
    ro.observe(host);

    // ---- BUCLE DE RENDER: sincroniza la escena con el stateRef del juego 2D
    const boomA = new THREE.Color();
    let raf = 0;
    let frame = 0;
    const counts: Record<string, number> = {};
    const loop = () => {
      if (disposed) return;
      frame++;
      const s = stateRef.current;
      const t = frame / 60;

      // línea de frente según momentum
      const fx = nx2wx(0.5 + s.momentum * 0.18);
      frontLine.position.set(fx, 1.1, 0);
      tr1.position.set(fx - 6.4, 0.25, 2);
      tr2.position.set(fx + 6.4, 0.25, 2);
      frontGlow.position.x = fx;
      frontGlow.intensity = 0.35 + front.intensity / 150 + Math.sin(t * 9) * 0.08;

      // unidades
      for (const k of Object.keys(pools)) for (const g of pools[k]) g.visible = false;
      for (const key of Object.keys(counts)) delete counts[key];
      for (const u of s.units) {
        const key = `${u.type}${u.side}`;
        const arr = pools[key];
        if (!arr) continue;
        const i = counts[key] ?? 0;
        if (i >= arr.length) continue;
        counts[key] = i + 1;
        const g = arr[i];
        g.visible = true;
        g.position.set(nx2wx(u.x), 0, 1.6 + ((u.x * 997) % 3) * 2.6);
        if (u.type === "soldier") {
          g.scale.setScalar(2.0);
          g.position.y = Math.abs(Math.sin(t * 6 + u.x * 40)) * 0.11;
        } else {
          g.scale.setScalar(1.18);
        }
      }

      // obuses en vuelo (mismo arco paramétrico que el 2D)
      let si = 0;
      for (const sh of s.shells) {
        if (sh.p < 0 || sh.p >= 1 || si >= shellPool.length) continue;
        const q = sh.p;
        const m = shellPool[si++];
        m.visible = true;
        const nx = sh.x0 + (sh.x1 - sh.x0) * q;
        const peak = Math.min(0.34, Math.abs(sh.x1 - sh.x0) * 0.42);
        const py = (sh.y0 + (sh.y1 - sh.y0) * q) * VH - Math.sin(Math.PI * q) * peak * VH;
        m.position.set(nx2wx(nx), Math.max(0.3, px2wy(py) + 1.1), 2.4);
        m.material = sh.side === 0 ? shellMat0 : shellMat1;
      }
      for (; si < shellPool.length; si++) shellPool[si].visible = false;

      // explosiones
      let bi = 0;
      for (const b of s.booms) {
        if (bi >= boomPool.length) break;
        const sp = boomPool[bi++];
        sp.visible = true;
        const a = Math.max(0, 1 - b.r / b.max);
        sp.position.set(px2wx(b.x), Math.max(0.7, px2wy(b.y)), 2.2);
        const sc = Math.max(0.8, b.r * 0.2);
        sp.scale.set(sc, sc, 1);
        (sp.material as THREE.SpriteMaterial).opacity = a;
        boomA.setHSL(0.09 - (1 - a) * 0.05, 1, 0.55 + a * 0.2);
        (sp.material as THREE.SpriteMaterial).color = boomA;
      }
      for (; bi < boomPool.length; bi++) boomPool[bi].visible = false;

      // humo
      let mi = 0;
      for (const sm of s.smokes) {
        if (mi >= smokePool.length) break;
        const sp = smokePool[mi++];
        sp.visible = true;
        sp.position.set(px2wx(sm.x), Math.max(0.5, px2wy(sm.y) + (90 - sm.life) * 0.045), 2.6);
        const sc = Math.max(1, sm.r * 0.22);
        sp.scale.set(sc, sc, 1);
        (sp.material as THREE.SpriteMaterial).opacity = Math.max(0, (sm.life / 90) * 0.32);
      }
      for (; mi < smokePool.length; mi++) smokePool[mi].visible = false;

      // trazadoras
      const posAttr = trGeo.attributes.position as THREE.BufferAttribute;
      let ti = 0;
      for (const tr of s.tracers) {
        if (ti >= TR_N) break;
        const o = ti * 6;
        posAttr.array[o] = px2wx(tr.x1); posAttr.array[o + 1] = Math.max(0.4, px2wy(tr.y1) + 0.9); posAttr.array[o + 2] = 2.0;
        posAttr.array[o + 3] = px2wx(tr.x2); posAttr.array[o + 4] = Math.max(0.4, px2wy(tr.y2) + 0.5); posAttr.array[o + 5] = 2.0;
        ti++;
      }
      trGeo.setDrawRange(0, ti * 2);
      posAttr.needsUpdate = true;

      // jets
      let ji = 0;
      for (const j of s.jets) {
        if (ji >= jetPool.length) break;
        const g = jetPool[ji++];
        g.visible = true;
        g.position.set(nx2wx(j.x), Math.max(14, px2wy(j.y * VH) + 12), -6);
        g.rotation.y = j.vx > 0 ? 0 : Math.PI;
        g.rotation.z = Math.sin(t * 2.2 + ji) * 0.06;
      }
      for (; ji < jetPool.length; ji++) jetPool[ji].visible = false;

      // helicópteros
      let hi = 0;
      for (const h of s.hcos) {
        if (hi >= hcoPool.length) break;
        const g = hcoPool[hi++];
        g.visible = true;
        g.position.set(nx2wx(h.x), Math.max(8, px2wy(h.y * VH) + 6) + Math.sin(t * 3 + hi) * 0.5, 3.5);
        (g.userData.rotor as THREE.Mesh).rotation.y += 0.55;
      }
      for (; hi < hcoPool.length; hi++) hcoPool[hi].visible = false;

      // cajas de suministro
      let ci = 0;
      for (const cr of s.crates) {
        if (ci >= cratePool.length) break;
        const g = cratePool[ci++];
        g.visible = true;
        g.position.set(nx2wx(cr.x), Math.max(0.45, px2wy(cr.y * VH) + 0.5), 4.5);
        (g.userData.chute as THREE.Mesh).visible = cr.y < cr.land;
        g.rotation.y = Math.sin(t * 1.4 + ci) * 0.25;
      }
      for (; ci < cratePool.length; ci++) cratePool[ci].visible = false;

      // restos ardiendo
      let di = 0;
      for (const d of s.decs) {
        if (di >= decPool.length) break;
        const m = decPool[di++];
        m.visible = true;
        m.position.set(px2wx(d.x), 0.14, 2.2 + (di % 3) * 1.4);
        m.scale.x = d.tank ? 1.25 : 0.55;
        m.rotation.y = (di * 0.7) % Math.PI;
      }
      for (; di < decPool.length; di++) decPool[di].visible = false;

      // bengalas
      let fi = 0;
      for (const fl of s.flares) {
        if (fi >= flarePool.length) break;
        const sp = flarePool[fi++];
        sp.visible = true;
        sp.position.set(nx2wx(fl.x), px2wy(fl.y * VH), 0);
        (sp.material as THREE.SpriteMaterial).opacity = (fl.life / 26) * 0.55;
      }
      for (; fi < flarePool.length; fi++) flarePool[fi].visible = false;

      // puesto de mando: luz verde en línea / roja fuera
      const cpAlive = s.cpDown <= 0;
      cpLight.material.color.set(cpAlive ? 0x00ff87 : 0xff3b30);
      cpLight.material.opacity = Math.floor(frame / 20) % 2 === 0 ? 0.95 : 0.4;
      cpLight.scale.setScalar(cpAlive ? 1.6 : 2.2);

      // utilería que parpadea (incendios urbanos, faro)
      for (let i = 0; i < blinkers.length; i++) {
        blinkers[i].material.opacity = 0.5 + Math.sin(t * (2.2 + i * 0.7)) * 0.4;
      }

      // temblor de cámara SIN contaminar el estado de OrbitControls: el jitter se
      // aplica solo para el render y se restaura después (antes derivaba la cámara)
      controls.update();
      const bx = cam.position.x, by = cam.position.y, bz = cam.position.z;
      if (s.shake > 0.4) {
        cam.position.x = bx + (Math.random() - 0.5) * s.shake * 0.05;
        cam.position.y = by + (Math.random() - 0.5) * s.shake * 0.05;
      }
      if (flashRef.current) flashRef.current.style.opacity = String(Math.min(0.5, s.flash * 0.28));

      renderer.render(scene, cam);
      cam.position.set(bx, by, bz);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // flash de impacto (capa DOM sobre el lienzo 3D)
    const flashEl = document.createElement("div");
    flashEl.style.cssText = "position:absolute;inset:0;background:#fff5e0;pointer-events:none;opacity:0;transition:opacity 40ms linear;";
    host.appendChild(flashEl);
    flashRef.current = flashEl;

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      flashRef.current = null;
      controls.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
        else mat?.dispose();
      });
      for (const d of disposables) d.dispose();
      boomTex.dispose();
      smokeTex.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
      if (flashEl.parentNode === host) host.removeChild(flashEl);
    };
  }, [front, onStrike, stateRef]);

  return <div ref={hostRef} className="relative h-full w-full" aria-label="Vista 3D orbitable del frente" />;
}
