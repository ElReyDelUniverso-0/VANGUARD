"use client";

// v54.0 TEATRO GLOBAL 3D — "MESA DE GUERRA MUNDIAL".
// Simulador estratégico a nivel de PAÍSES: un mapa-mundo tridimensional sobre
// la mesa de operaciones donde cada teatro de conflicto real (Europa del Este,
// Medio Oriente, África, Asia-Pacífico, América Latina) se representa con
// anillos pulsantes, marcadores OTAN de infantería y blindados, fogonazos de
// artillería y arcos de misiles. Se alimenta de datos OSINT abiertos:
//   · GDELT / Google Noticias → titulares reales por teatro (con enlace)
//   · adsb.lol → aeronaves militares en vuelo AHORA (posición real lat/lon)
//   · NOAA SWPC → índice Kp (tormenta geomagnética global)
// Todo público y sin credenciales. Compatible con móvil: calidad adaptativa.

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Globe2, Radio, Plane, Activity, Volume2, VolumeX } from "lucide-react";

// ------------------------------------------------------------- geografía ----
// Contornos simplificados [lon, lat] para la mesa de guerra (estilo sala de
// operaciones: reconocibles a vista de pájaro, no cartografía precisa).
const CONTINENTS: number[][][] = [
  // América del Norte
  [[-168, 66], [-158, 71], [-140, 70], [-125, 70], [-110, 68], [-95, 72], [-80, 73], [-70, 68], [-60, 60], [-64, 47], [-70, 42], [-75, 35], [-81, 25], [-84, 30], [-90, 29], [-97, 26], [-105, 20], [-115, 29], [-124, 35], [-130, 52], [-150, 59], [-165, 60]],
  // América del Sur
  [[-80, 9], [-75, 11], [-70, 12], [-60, 8], [-52, 5], [-44, -2], [-35, -7], [-38, -13], [-40, -22], [-48, -28], [-53, -34], [-58, -39], [-65, -45], [-68, -52], [-72, -54], [-75, -48], [-72, -40], [-70, -30], [-70, -18], [-77, -10], [-80, 0]],
  // Eurasia + África (bloque principal)
  [[-10, 36], [0, 44], [3, 43], [12, 38], [20, 40], [28, 41], [35, 36], [44, 38], [50, 37], [57, 25], [60, 25], [67, 24], [72, 20], [77, 8], [80, 14], [87, 21], [92, 21], [95, 16], [98, 8], [104, 2], [107, 11], [109, 17], [108, 21], [112, 22], [117, 23], [121, 30], [122, 37], [126, 40], [130, 43], [135, 48], [142, 53], [147, 60], [157, 62], [162, 60], [170, 66], [180, 66], [180, 71], [160, 72], [140, 73], [120, 74], [100, 76], [80, 73], [68, 69], [60, 69], [45, 68], [35, 70], [28, 71], [18, 69], [12, 65], [8, 58], [5, 53], [0, 51], [-5, 48], [-10, 43],
   [-13, 30], [-17, 15], [-16, 22], [-10, 30], [-6, 35], [0, 37], [10, 37], [12, 33], [20, 32], [30, 31], [34, 28], [37, 22], [39, 15], [43, 11], [51, 12], [48, 5], [42, 0], [40, -5], [36, -14], [35, -20], [32, -26], [28, -33], [22, -34], [18, -33], [15, -27], [12, -18], [13, -10], [9, -2], [8, 4], [-8, 4], [-13, 9]],
  // Australia
  [[114, -22], [113, -26], [115, -33], [119, -34], [125, -32], [129, -32], [132, -32], [137, -35], [140, -38], [147, -38], [150, -37], [153, -30], [153, -25], [149, -20], [145, -15], [142, -11], [136, -12], [131, -11], [125, -14], [122, -17]],
  // Groenlandia
  [[-45, 60], [-40, 64], [-32, 68], [-25, 70], [-20, 70], [-22, 74], [-30, 78], [-45, 80], [-55, 77], [-58, 72], [-53, 66]],
  // Madagascar
  [[44, -16], [48, -14], [50, -17], [48, -23], [45, -25], [43, -21]],
  // Gran Bretaña
  [[-5, 50], [-3, 53], [-4, 56], [-3, 58], [-6, 58], [-8, 54]],
  // Japón
  [[130, 31], [133, 34], [137, 35], [140, 36], [141, 40], [142, 44], [144, 44], [141, 39], [139, 34], [134, 33], [131, 30]],
  // Nueva Zelanda
  [[173, -35], [176, -38], [178, -39], [174, -41], [171, -44], [167, -46], [170, -43], [172, -40]],
];

const THEATERS = [
  { id: "este", name: "EUROPA DEL ESTE", lat: 49, lon: 32, color: 0xff4a3a },
  { id: "oriente", name: "MEDIO ORIENTE", lat: 31.5, lon: 34.5, color: 0xff7a2a },
  { id: "africa", name: "ÁFRICA / SAHEL", lat: 15, lon: 30, color: 0xffb02a },
  { id: "asia", name: "ASIA-PACÍFICO", lat: 28, lon: 121, color: 0xff3a6a },
  { id: "latam", name: "AMÉRICA LATINA", lat: 8, lon: -70, color: 0x2aff9a },
];

const HALF_W = 120; // medio ancho de la mesa (x: -120..120)
const HALF_H = 62; // medio alto (z: -62..62)

const lonLatToXZ = (lon: number, lat: number): [number, number] => [
  (lon / 180) * HALF_W,
  -(lat / 90) * HALF_H,
];

// ------------------------------------------------------------ texturas ----
function texRadial(inner: string, outer: string, size = 128): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// símbolo OTAN dibujado en canvas: infantería (rectángulo con X) o blindado (óvalo)
function texNato(kind: "inf" | "arm", color: string): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.strokeStyle = color;
  g.fillStyle = "rgba(10,12,10,0.55)";
  g.lineWidth = 4;
  if (kind === "inf") {
    g.beginPath(); g.rect(8, 16, 48, 32); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(8, 16); g.lineTo(56, 48); g.moveTo(56, 16); g.lineTo(8, 48); g.stroke();
  } else {
    g.beginPath(); g.ellipse(32, 32, 26, 16, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function texLabel(txt: string): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 40;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(0,0,0,0.55)";
  g.fillRect(0, 0, 128, 40);
  g.strokeStyle = "rgba(255,190,90,0.7)";
  g.lineWidth = 2;
  g.strokeRect(1, 1, 126, 38);
  g.fillStyle = "#ffd9a0";
  g.font = "bold 20px monospace";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(txt.slice(0, 8), 64, 21);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function buildMapTexture(): THREE.Texture {
  const W = 2048, H = 1024;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  // mar
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#0a1018");
  grad.addColorStop(0.5, "#0d1520");
  grad.addColorStop(1, "#0a1018");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  // retícula cada 20°
  g.strokeStyle = "rgba(90,140,180,0.14)";
  g.lineWidth = 2;
  for (let lon = -180; lon <= 180; lon += 20) {
    const x = ((lon + 180) / 360) * W;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
  }
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * H;
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
  }
  g.strokeStyle = "rgba(120,170,210,0.35)";
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
  // continentes
  const px = (lon: number) => ((lon + 180) / 360) * W;
  const py = (lat: number) => ((90 - lat) / 180) * H;
  for (const poly of CONTINENTS) {
    g.beginPath();
    poly.forEach(([lon, lat], i) => {
      if (i === 0) g.moveTo(px(lon), py(lat));
      else g.lineTo(px(lon), py(lat));
    });
    g.closePath();
    g.fillStyle = "#1b2530";
    g.fill();
    g.strokeStyle = "#3d566e";
    g.lineWidth = 4;
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// --------------------------------------------------------------- tipos ----
interface TheaterObj {
  id: string;
  name: string;
  cx: number;
  cz: number;
  color: number;
  ring: THREE.Mesh;
  glow: THREE.Sprite;
  pillar: THREE.Mesh;
  units: { s: THREE.Sprite; ang: number; r: number; spd: number }[];
  intensity: number;
  arts: { title: string; url: string; domain: string }[];
  live: boolean;
  src: string;
}

interface MilDot {
  s: THREE.Sprite;
  cs: string;
  x: number;
  z: number;
  vx: number;
  vz: number;
  born: number;
}

interface ArcP {
  mesh: THREE.Mesh;
  a: THREE.Vector3;
  b: THREE.Vector3;
  t: number;
  dur: number;
  peak: number;
}

interface Headline {
  text: string;
  url: string;
  domain: string;
  theater: string;
}

interface TGStats {
  teatros: number;
  milAir: number;
  opsReal: number;
  clock: number;
  fps: number;
}

// ------------------------------------------------------------ motor 3D ----
class TeatroGlobalEngine {
  private host: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private cam!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private clockT = new THREE.Clock();
  private raf = 0;
  private disposed = false;
  private t = 0;
  private theaters: TheaterObj[] = [];
  private milDots: MilDot[] = [];
  private arcs: ArcP[] = [];
  private flashes: { s: THREE.Sprite; t: number; dur: number; max: number }[] = [];
  private opsReal = 0;
  private texBoom!: THREE.Texture;
  private texSpark!: THREE.Texture;
  private mapTex!: THREE.Texture;
  private natoInf!: THREE.Texture;
  private natoArm!: THREE.Texture;
  private labelTexs: THREE.Texture[] = [];
  private nextFlash = 2;
  private nextArc = 6;
  private fpsRoll: number[] = [];
  private pixelRatio: number;
  onTick?: (s: TGStats) => void;

  constructor(host: HTMLElement) {
    this.host = host;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    this.init();
  }

  private init() {
    const r = this.renderer = new THREE.WebGLRenderer({
      antialias: this.pixelRatio < 1.5, powerPreference: "high-performance",
    });
    r.setPixelRatio(this.pixelRatio);
    r.setSize(this.host.clientWidth || 640, this.host.clientHeight || 360);
    r.domElement.style.display = "block";
    r.domElement.style.touchAction = "none";
    this.host.appendChild(r.domElement);

    const S = this.scene = new THREE.Scene();
    S.fog = new THREE.Fog(0x05070c, 180, 560);
    S.background = new THREE.Color(0x05070c);

    this.cam = new THREE.PerspectiveCamera(
      50, (this.host.clientWidth || 640) / (this.host.clientHeight || 360), 0.5, 900
    );
    this.cam.position.set(0, 95, 130);

    this.controls = new OrbitControls(this.cam, r.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.minDistance = 26;
    this.controls.maxDistance = 260;
    this.controls.maxPolarAngle = 1.32;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
    this.controls.target.set(0, 0, 0);
    this.controls.addEventListener("start", () => { this.controls.autoRotate = false; });
    this.controls.addEventListener("end", () => {
      window.setTimeout(() => { if (!this.disposed) this.controls.autoRotate = true; }, 12000);
    });

    S.add(new THREE.HemisphereLight(0x8aa4c8, 0x0a0d12, 1.1));
    const key = new THREE.DirectionalLight(0xcfe0ff, 0.9);
    key.position.set(-80, 120, 60);
    S.add(key);

    // mesa de guerra: mapa mundial
    this.mapTex = buildMapTexture();
    const mapGeo = new THREE.PlaneGeometry(HALF_W * 2, HALF_H * 2);
    mapGeo.rotateX(-Math.PI / 2);
    const map = new THREE.Mesh(mapGeo, new THREE.MeshBasicMaterial({ map: this.mapTex }));
    S.add(map);
    // bisel de la mesa
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(HALF_W * 2 + 8, 3, HALF_H * 2 + 8),
      new THREE.MeshBasicMaterial({ color: 0x11161f })
    );
    frame.position.y = -1.7;
    S.add(frame);
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(HALF_W * 2 + 9.5, 0.5, HALF_H * 2 + 9.5),
      new THREE.MeshBasicMaterial({ color: 0x2b4257 })
    );
    edge.position.y = 0.1;
    S.add(edge);

    // texturas compartidas
    this.texBoom = texRadial("rgba(255,235,180,1)", "rgba(255,100,20,0)");
    this.texSpark = texRadial("rgba(255,220,150,1)", "rgba(255,120,40,0)", 64);
    this.natoInf = texNato("inf", "#ff5a4a");
    this.natoArm = texNato("arm", "#ff8a4a");

    // teatros
    for (const th of THEATERS) {
      const [cx, cz] = lonLatToXZ(th.lon, th.lat);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(5.4, 6.2, 40),
        new THREE.MeshBasicMaterial({ color: th.color, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(cx, 0.35, cz);
      S.add(ring);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.texBoom, color: th.color, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      glow.position.set(cx, 1.2, cz);
      glow.scale.setScalar(9);
      S.add(glow);
      // pilar de luz de alerta
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.9, 34, 10, 1, true),
        new THREE.MeshBasicMaterial({
          color: th.color, transparent: true, opacity: 0.13,
          blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
        })
      );
      pillar.position.set(cx, 17, cz);
      S.add(pillar);
      // marcadores OTAN: 2 de infantería + 1 blindado orbitando (agresor vs defensor)
      const units: TheaterObj["units"] = [];
      const kinds: ("inf" | "arm")[] = ["inf", "inf", "arm"];
      kinds.forEach((k, i) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({
          map: k === "inf" ? this.natoInf : this.natoArm,
          transparent: true, opacity: 0.95, depthWrite: false,
        }));
        s.scale.setScalar(3.4);
        S.add(s);
        units.push({ s, ang: (i / 3) * Math.PI * 2, r: k === "arm" ? 8.5 : 6.4, spd: k === "arm" ? 0.24 : 0.16 });
      });
      this.theaters.push({
        id: th.id, name: th.name, cx, cz, color: th.color,
        ring, glow, pillar, units, intensity: 0.35, arts: [], live: false, src: "—",
      });
    }

    this.loop();
  }

  // ---- datos OSINT entrantes ----
  ingestRegion(id: string, arts: { title: string; url: string; domain: string }[], live: boolean, src: string) {
    const th = this.theaters.find((x) => x.id === id);
    if (!th) return;
    if (arts.length) {
      th.arts = arts.slice(0, 5);
      const fresh = th.arts.filter((a) => !th.arts.includes(a)).length;
      th.intensity = Math.min(1, 0.35 + th.arts.length * 0.09 + (live ? 0.15 : 0));
      if (fresh >= 0) this.opsReal += 1;
      th.live = live;
      th.src = src;
    }
  }

  ingestMil(samples: { cs: string; lat: number; lon: number }[]) {
    for (const sm of samples) {
      if (this.milDots.some((d) => d.cs === sm.cs)) continue;
      if (!Number.isFinite(sm.lat) || !Number.isFinite(sm.lon)) continue;
      const [x, z] = lonLatToXZ(sm.lon, sm.lat);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.texSpark, color: 0xffc35a, transparent: true, opacity: 0.95,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      s.position.set(x, 2.2, z);
      s.scale.setScalar(2.2);
      this.scene.add(s);
      const lt = texLabel(sm.cs);
      this.labelTexs.push(lt);
      const lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: lt, transparent: true, depthWrite: false }));
      lab.position.set(x, 5.4, z);
      lab.scale.set(7, 2.2, 1);
      this.scene.add(lab);
      const ang = Math.random() * Math.PI * 2;
      this.milDots.push({ s, cs: sm.cs, x, z, vx: Math.cos(ang) * 2.4, vz: Math.sin(ang) * 2.4, born: this.t });
      (this.milDots[this.milDots.length - 1] as MilDot & { lab?: THREE.Sprite }).lab = lab;
    }
    // máximo 12 puntos simultáneos en la mesa
    while (this.milDots.length > 12) {
      const d = this.milDots.shift();
      if (d) this.removeMil(d);
    }
  }

  private removeMil(d: MilDot) {
    this.scene.remove(d.s);
    d.s.material.dispose();
    const lab = (d as MilDot & { lab?: THREE.Sprite }).lab;
    if (lab) {
      this.scene.remove(lab);
      lab.material.dispose();
    }
  }

  focusTheater(id: string) {
    const th = this.theaters.find((x) => x.id === id);
    if (!th) return;
    this.controls.autoRotate = false;
    const dist = 34;
    const camTo = new THREE.Vector3(th.cx + dist * 0.55, 26, th.cz + dist * 0.8);
    const tgt = new THREE.Vector3(th.cx, 2, th.cz);
    this.tween = { fromP: this.cam.position.clone(), toP: camTo, fromT: this.controls.target.clone(), toT: tgt, t: 0, dur: 1.6 };
    window.setTimeout(() => { if (!this.disposed) this.controls.autoRotate = true; }, 14000);
  }

  private tween: { fromP: THREE.Vector3; toP: THREE.Vector3; fromT: THREE.Vector3; toT: THREE.Vector3; t: number; dur: number } | null = null;

  getTheaters() {
    return this.theaters.map((th) => ({
      id: th.id, name: th.name, intensity: th.intensity, live: th.live, src: th.src, arts: th.arts,
    }));
  }

  getStats(): TGStats {
    return {
      teatros: this.theaters.filter((x) => x.arts.length > 0).length,
      milAir: this.milDots.length,
      opsReal: this.opsReal,
      clock: Math.floor(this.t),
      fps: this.fpsRoll.length ? Math.round(this.fpsRoll.reduce((a, b) => a + b, 0) / this.fpsRoll.length) : 30,
    };
  }

  private flashAt(x: number, z: number, big: number) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.texBoom, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    s.position.set(x, 1.5, z);
    s.scale.setScalar(big * 3.2);
    this.scene.add(s);
    this.flashes.push({ s, t: 0, dur: 0.55, max: big * 3.2 });
  }

  private launchArc(th: TheaterObj) {
    const ang = Math.random() * Math.PI * 2;
    const d = R2(10, 26);
    const ax = th.cx + Math.cos(ang) * d;
    const az = th.cz + Math.sin(ang) * d;
    const a = new THREE.Vector3(th.cx + R2(-4, 4), 0.6, th.cz + R2(-4, 4));
    const b = new THREE.Vector3(th.cx + Math.cos(ang) * d * 0.4 + R2(-4, 4), 0.6, th.cz + Math.sin(ang) * d * 0.4 + R2(-4, 4));
    void ax; void az;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 6, 5),
      new THREE.MeshBasicMaterial({ color: 0xffd9a0 })
    );
    mesh.position.copy(a);
    this.scene.add(mesh);
    this.arcs.push({ mesh, a, b, t: 0, dur: R2(1.4, 2.2), peak: R2(10, 20) });
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.controls.dispose();
    for (const d of this.milDots) this.removeMil(d);
    this.scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
        o.geometry?.dispose();
        const m = o.material as THREE.Material | THREE.Material[];
        if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
        else m?.dispose();
      } else if (o instanceof THREE.Sprite) {
        o.material.dispose();
      }
    });
    this.texBoom.dispose();
    this.texSpark.dispose();
    this.natoInf.dispose();
    this.natoArm.dispose();
    this.mapTex.dispose();
    for (const lt of this.labelTexs) lt.dispose();
    this.renderer.dispose();
    const el = this.renderer.domElement;
    if (el.parentElement) el.parentElement.removeChild(el);
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clockT.getDelta(), 0.05);
    if (typeof document !== "undefined" && document.hidden) return;
    this.t += dt;

    // pulso de teatros + marcadores orbitando
    for (const th of this.theaters) {
      const pulse = 0.62 + Math.sin(this.t * (1.4 + th.intensity * 2.2)) * 0.28 * (0.4 + th.intensity);
      (th.ring.material as THREE.MeshBasicMaterial).opacity = pulse;
      th.ring.scale.setScalar(1 + Math.sin(this.t * 2.1) * 0.05 * (0.5 + th.intensity));
      (th.pillar.material as THREE.MeshBasicMaterial).opacity = 0.09 + th.intensity * 0.14;
      for (const u of th.units) {
        u.ang += u.spd * dt * (0.6 + th.intensity);
        u.s.position.set(th.cx + Math.cos(u.ang) * u.r, 1.6, th.cz + Math.sin(u.ang) * u.r);
      }
    }

    // fogonazos de artillería
    this.nextFlash -= dt;
    if (this.nextFlash <= 0) {
      const hot = this.theaters.filter((x) => x.arts.length > 0);
      const th = hot.length ? hot[Math.floor(Math.random() * hot.length)] : this.theaters[Math.floor(Math.random() * this.theaters.length)];
      this.flashAt(th.cx + R2(-8, 8), th.cz + R2(-8, 8), R2(0.7, 1.6) * (0.6 + th.intensity));
      this.nextFlash = R2(0.7, 2.6) / (0.5 + th.intensity);
    }

    // arcos de misiles
    this.nextArc -= dt;
    if (this.nextArc <= 0) {
      const hot = this.theaters.filter((x) => x.arts.length > 0);
      if (hot.length) this.launchArc(hot[Math.floor(Math.random() * hot.length)]);
      this.nextArc = R2(3.5, 9);
    }
    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const a = this.arcs[i];
      a.t += dt;
      const k = a.t / a.dur;
      if (k >= 1) {
        this.flashAt(a.b.x, a.b.z, R2(1.2, 2.0));
        this.scene.remove(a.mesh);
        a.mesh.geometry.dispose();
        (a.mesh.material as THREE.Material).dispose();
        this.arcs.splice(i, 1);
        continue;
      }
      const p = new THREE.Vector3().lerpVectors(a.a, a.b, k);
      p.y += Math.sin(k * Math.PI) * a.peak;
      a.mesh.position.copy(p);
      if (Math.random() < 0.5) {
        const sm = new THREE.Sprite(new THREE.SpriteMaterial({
          map: this.texSpark, color: 0xcfcfcf, transparent: true, opacity: 0.35, depthWrite: false,
        }));
        sm.position.copy(p);
        sm.scale.setScalar(1.4);
        this.scene.add(sm);
        this.flashes.push({ s: sm, t: 0, dur: 0.8, max: 1.4 });
      }
    }

    // aeronaves militares derivando
    for (const d of this.milDots) {
      d.x += d.vx * dt;
      d.z += d.vz * dt;
      if (Math.abs(d.x) > HALF_W * 0.98 || Math.abs(d.z) > HALF_H * 0.98 || this.t - d.born > 240) {
        d.vx = -d.vx; d.vz = -d.vz; d.born = this.t - 120;
      }
      d.s.position.set(d.x, 2.2, d.z);
      const lab = (d as MilDot & { lab?: THREE.Sprite }).lab;
      if (lab) lab.position.set(d.x, 5.4, d.z);
    }

    // flashes
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.t += dt;
      const k = f.t / f.dur;
      if (k >= 1) {
        this.scene.remove(f.s);
        f.s.material.dispose();
        this.flashes.splice(i, 1);
        continue;
      }
      (f.s.material as THREE.SpriteMaterial).opacity = 0.9 * (1 - k);
      f.s.scale.setScalar(f.max * (0.5 + k * 0.9));
    }

    // tween de cámara
    if (this.tween) {
      this.tween.t += dt;
      const k = Math.min(1, this.tween.t / this.tween.dur);
      const e = k * k * (3 - 2 * k);
      this.cam.position.lerpVectors(this.tween.fromP, this.tween.toP, e);
      this.controls.target.lerpVectors(this.tween.fromT, this.tween.toT, e);
      if (k >= 1) this.tween = null;
    }

    this.fpsRoll.push(1 / Math.max(dt, 0.001));
    if (this.fpsRoll.length > 120) {
      this.fpsRoll.shift();
      const avg = this.fpsRoll.reduce((a, b) => a + b, 0) / this.fpsRoll.length;
      if (avg < 23 && this.pixelRatio > 1) {
        this.pixelRatio = 1;
        this.renderer.setPixelRatio(1);
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.cam);
  };
}

const R2 = (a: number, b: number) => a + Math.random() * (b - a);

// ------------------------------------------------------------ componente ----
export function TeatroGlobal3D() {
  const hostRef = useRef<HTMLDivElement>(null);
  const engRef = useRef<TeatroGlobalEngine | null>(null);
  const [stats, setStats] = useState<TGStats | null>(null);
  const [regions, setRegions] = useState<{ id: string; name: string; intensity: number; live: boolean; src: string; arts: { title: string; url: string; domain: string }[] }[]>([]);
  const [feed, setFeed] = useState<Headline[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [sound, setSound] = useState(false);

  // ciclo de vida
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const eng = new TeatroGlobalEngine(host);
    engRef.current = eng;
    const iv = window.setInterval(() => setStats(eng.getStats()), 1000);
    const rIv = window.setInterval(() => setRegions(eng.getTheaters() as typeof regions), 3000);
    return () => {
      window.clearInterval(iv);
      window.clearInterval(rIv);
      eng.dispose();
      engRef.current = null;
    };
  }, []);

  // fusión OSINT: rota los 5 teatros pidiendo titulares + aeronaves + Kp
  useEffect(() => {
    let alive = true;
    let idx = 0;
    const pull = async () => {
      const r = idx % THEATERS.length;
      idx++;
      try {
        const res = await fetch(`/api/geo-tablero?r=${r}`, { cache: "no-store" });
        if (!res.ok || !alive) return;
        const j = (await res.json()) as {
          region?: { name?: string; arts?: { title: string; url: string; domain: string }[]; live?: boolean; src?: string } | null;
          mil?: { total?: number; samples?: { cs: string; lat: number; lon: number }[] } | null;
        };
        const eng = engRef.current;
        if (!eng) return;
        const th = THEATERS[r];
        const arts = (j.region?.arts ?? []).slice(0, 5);
        eng.ingestRegion(th.id, arts, !!j.region?.live, j.region?.src ?? "—");
        if (j.mil?.samples?.length) eng.ingestMil(j.mil.samples);
        const latest = arts[0];
        if (latest) {
          setFeed((prev) => {
            if (prev.some((h) => h.url === latest.url)) return prev;
            return [{ text: latest.title, url: latest.url, domain: latest.domain, theater: th.name }, ...prev].slice(0, 8);
          });
        }
      } catch { /* reintento en el próximo ciclo */ }
    };
    const t0 = window.setTimeout(pull, 2500);
    const iv = window.setInterval(pull, 7000);
    return () => { alive = false; window.clearTimeout(t0); window.clearInterval(iv); };
  }, []);

  const clock = stats
    ? `${String(Math.floor(stats.clock / 60)).padStart(2, "0")}:${String(stats.clock % 60).padStart(2, "0")}`
    : "00:00";

  const selectedRegion = regions.find((r) => r.id === selected);

  const focusAndSelect = useCallback((id: string) => {
    setSelected(id);
    engRef.current?.focusTheater(id);
  }, []);

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden bg-black">
      {/* barra de mando */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 border-b border-zinc-800 bg-zinc-950/90">
        <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.22em] text-emerald-400 uppercase">
          <Globe2 className="w-3.5 h-3.5" /> Teatro Global · mesa de guerra mundial
        </span>
        <span className="font-mono text-[9px] text-zinc-500">
          T+{clock} · {stats?.teatros ?? 0} teatros activos ·{" "}
          <span className="text-amber-300">{stats?.milAir ?? 0} aeronaves mil.</span> ·{" "}
          <span className="text-emerald-400">{stats?.opsReal ?? 0} despachos</span>
        </span>
        <div className="ml-auto">
          <button
            onClick={() => setSound((s) => !s)}
            className={`border rounded px-2 py-1 transition-colors ${
              sound ? "border-emerald-400/60 text-emerald-300 bg-emerald-400/10" : "border-zinc-700 text-zinc-500"
            }`}
            title="Sonido del entorno (próximamente radio OSINT)"
          >
            {sound ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* mesa 3D */}
      <div className="relative">
        <div ref={hostRef} className="w-full h-[56vh] min-h-[360px] max-h-[640px] cursor-grab active:cursor-grabbing" />
        <p className="absolute bottom-1 right-2 font-mono text-[8px] text-zinc-600 bg-black/40 px-1 rounded pointer-events-none">
          {stats?.fps ?? 0} FPS · arrastra para girar la mesa · pellizca/rueda para zoom
        </p>
        <p className="absolute top-1.5 left-2 font-mono text-[8px] text-zinc-500 bg-black/50 px-1.5 py-0.5 rounded pointer-events-none">
          DATOS ABIERTOS · GDELT + ADS-B + NOAA
        </p>
      </div>

      {/* lista de teatros */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800 border-t border-zinc-800">
        {(regions.length ? regions : THEATERS.map((th) => ({ id: th.id, name: th.name, intensity: 0.2, live: false, src: "—", arts: [] }))).map((r) => (
          <button
            key={r.id}
            onClick={() => focusAndSelect(r.id)}
            className={`text-left bg-zinc-950 px-3 py-2 transition-colors hover:bg-zinc-900 ${selected === r.id ? "bg-zinc-900" : ""}`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${r.live ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
              <span className="font-mono text-[9px] tracking-wider text-zinc-200 flex-1 truncate">{r.name}</span>
              <Activity className={`w-3 h-3 ${r.intensity > 0.6 ? "text-red-400" : r.intensity > 0.35 ? "text-amber-400" : "text-zinc-600"}`} />
            </div>
            <div className="mt-1 h-1.5 w-full rounded-sm overflow-hidden bg-zinc-800">
              <div className="h-full bg-gradient-to-r from-red-700 to-amber-400 transition-all duration-1000" style={{ width: `${Math.round(r.intensity * 100)}%` }} />
            </div>
            <p className="mt-0.5 font-mono text-[8px] text-zinc-500">{r.arts.length} despachos · vía {r.src}</p>
          </button>
        ))}
      </div>

      {/* panel del teatro seleccionado */}
      {selectedRegion && selectedRegion.arts.length > 0 && (
        <div className="border-t border-zinc-800 bg-zinc-950/80 px-3 py-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-300 mb-1">
            {selectedRegion.name} · últimos despachos del frente
          </p>
          <ul className="flex flex-col gap-0.5">
            {selectedRegion.arts.slice(0, 4).map((a) => (
              <li key={a.url} className="font-mono text-[10px] leading-snug truncate text-zinc-300">
                <span className="text-amber-400">▸ </span>
                <a href={a.url} target="_blank" rel="noopener noreferrer nofollow" className="underline decoration-dotted hover:text-amber-200 transition-colors">
                  {a.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ticker global */}
      <div className="border-t border-zinc-800 bg-black/60 px-3 py-2">
        <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 mb-1">
          <Radio className="w-3 h-3 text-emerald-400" /> Radio global · últimos despachos del mundo
          <Plane className="w-3 h-3 text-amber-400 ml-2" /> aeronaves militares en vuelo: {stats?.milAir ?? 0}
        </p>
        {feed.length === 0 ? (
          <p className="font-mono text-[10px] text-zinc-600">
            Conectando con la red de despachos OSINT… los primeros informes llegan en segundos.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {feed.slice(0, 5).map((h, i) => (
              <li key={h.url} className={`font-mono text-[10px] leading-snug truncate ${i === 0 ? "text-emerald-200" : "text-zinc-500"}`}>
                <span className="text-emerald-400">▮ {h.theater} </span>
                <a href={h.url} target="_blank" rel="noopener noreferrer nofollow" className="underline decoration-dotted hover:text-emerald-200 transition-colors">
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
