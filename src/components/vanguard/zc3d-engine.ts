// zc3d-engine.ts — ZONA CERO 3D: motor de simulación de guerra en Three.js.
// Mapa 3D con relieve, río, carretera y ciudad; CUATRO FRENTES simultáneos con
// trincheras zigzag, países en guerra (Eje del Norte vs Coalición Sur),
// soldados animados que avanzan y caen, tanques con torreta y retroceso,
// jets, helicópteros, drones, artillería de baterías lejanas, explosiones,
// humo, cráteres persistentes, director de cámara automático y fusión con
// noticias reales (GDELT). Optimizado para móvil: sin shadow maps, materiales
// Lambert, pools de sprites y pixelRatio adaptativo.

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ---------------------------------------------------------------- tipos ----

export interface ZC3DFrontInfo {
  name: string;
  share: number; // 0..1 control del Norte (0.5 = empate)
  intensity: number; // 0..1 calor actual
  lastEvent: string;
}

export interface ZC3DStats {
  fronts: ZC3DFrontInfo[];
  casualties: number;
  bldgsDown: number;
  craters: number;
  opsReal: number;
  clock: number; // segundos de guerra simulada
  fps: number;
}

export interface ZC3DEvent {
  text: string;
  real?: boolean;
  url?: string;
  side?: 0 | 1;
}

export interface ZC3DSaveState {
  frontX: number[];
  destroyed: number[];
  craters: number;
  casualties: number;
  opsReal: number;
}

export interface ZC3DHandle {
  setDirector(on: boolean): void;
  setSound(on: boolean): void;
  setStrike(on: boolean): void;
  focusFront(i: number): void;
  triggerOp(frontIdx: number, headline: string, url?: string): void;
  getStats(): ZC3DStats;
  getSaveState(): ZC3DSaveState;
  dispose(): void;
}

export interface ZC3DOpts {
  onEvent?(ev: ZC3DEvent): void;
  onTick?(s: ZC3DStats): void;
  initial?: Partial<ZC3DSaveState>;
  quality?: "auto" | "low";
}

// ----------------------------------------------------------- constantes ----

const MAP_X = 110; // medio ancho (oeste-este)
const MAP_Z = 75; // medio alto (norte-sur)
const FRONT_Z = [-48, -16, 16, 48];
const FRONT_NAMES = ["FRENTE DEL BOSQUE", "FRENTE DE LA CARRETERA", "FRENTE DEL RÍO", "FRENTE DE LA CIUDAD"];
const SIDE = [
  { name: "EJE DEL NORTE", main: 0xff5a4e, dark: 0x7a221c, tracer: 0xff8878 },
  { name: "COALICIÓN SUR", main: 0x3fd6e0, dark: 0x155e66, tracer: 0x7df0f8 },
];

const R2 = (a: number, b: number) => a + Math.random() * (b - a);
const RI = (a: number, b: number) => Math.floor(R2(a, b + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ruido de valor determinista para el terreno
function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number): number {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

// altura del terreno en mundo (coherente con la malla)
function terrainH(x: number, z: number): number {
  const n =
    vnoise(x * 0.018 + 7.3, z * 0.018 + 2.1) * 1.7 +
    vnoise(x * 0.06 + 1.7, z * 0.06 + 9.4) * 0.7 +
    vnoise(x * 0.15, z * 0.15) * 0.22;
  let h = n - 1.3;
  // río serpenteante cerca de z=16
  const riverC = 16 + Math.sin(x * 0.05) * 6;
  const dr = Math.abs(z - riverC);
  if (dr < 7) h -= (1 - dr / 7) * 2.4;
  return h;
}

// ------------------------------------------------------------ audio 3D ----

class ZC3DAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private on = false;

  setOn(v: boolean) {
    this.on = v;
    if (v) this.ensure();
  }
  private ensure(): boolean {
    if (typeof window === "undefined") return false;
    if (!this.ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return true;
  }
  private noise(dur: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const n = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  boom(dist: number, big: boolean) {
    if (!this.on || !this.ensure() || !this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime;
    const dur = big ? 1.4 : 0.6;
    const src = this.ctx.createBufferSource();
    const buf = this.noise(dur);
    if (!buf) return;
    src.buffer = buf;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = big ? 220 : 420 - clamp(dist, 0, 100) * 2;
    const g = this.ctx.createGain();
    const vol = (big ? 0.9 : 0.42) * clamp(1 - dist / 130, 0.08, 1);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(lp).connect(g).connect(this.master);
    src.start(t0);
    src.stop(t0 + dur);
    // cuerpo grave
    const o = this.ctx.createOscillator();
    const og = this.ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(big ? 70 : 95, t0);
    o.frequency.exponentialRampToValueAtTime(28, t0 + dur * 0.8);
    og.gain.setValueAtTime(vol * 0.7, t0);
    og.gain.exponentialRampToValueAtTime(0.001, t0 + dur * 0.8);
    o.connect(og).connect(this.master);
    o.start(t0);
    o.stop(t0 + dur);
  }
  whistle(dur: number) {
    if (!this.on || !this.ensure() || !this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(1500, t0);
    o.frequency.exponentialRampToValueAtTime(280, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.16, t0 + dur * 0.75);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g).connect(this.master);
    o.start(t0);
    o.stop(t0 + dur);
  }
  rattle(dist: number) {
    if (!this.on || !this.ensure() || !this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime;
    const shots = RI(4, 7);
    for (let i = 0; i < shots; i++) {
      const dt = i * R2(0.05, 0.12);
      const src = this.ctx.createBufferSource();
      const buf = this.noise(0.05);
      if (!buf) return;
      src.buffer = buf;
      const hp = this.ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1400;
      const g = this.ctx.createGain();
      const vol = 0.2 * clamp(1 - dist / 90, 0.05, 1);
      g.gain.setValueAtTime(vol, t0 + dt);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dt + 0.06);
      src.connect(hp).connect(g).connect(this.master);
      src.start(t0 + dt);
      src.stop(t0 + dt + 0.07);
    }
  }
  siren() {
    if (!this.on || !this.ensure() || !this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "triangle";
    for (let i = 0; i < 3; i++) {
      o.frequency.setValueAtTime(420, t0 + i * 1.1);
      o.frequency.linearRampToValueAtTime(640, t0 + i * 1.1 + 0.5);
      o.frequency.linearRampToValueAtTime(420, t0 + i * 1.1 + 1.0);
    }
    g.gain.setValueAtTime(0.12, t0);
    g.gain.setValueAtTime(0.12, t0 + 3.1);
    g.gain.linearRampToValueAtTime(0.0001, t0 + 3.6);
    o.connect(g).connect(this.master);
    o.start(t0);
    o.stop(t0 + 3.7);
  }
}

// ------------------------------------------------- fábricas de texturas ----

function texRadial(inner: string, outer: string, size = 128): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.4, inner.replace(/[\d.]+\)$/, "0.55)"));
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function texFacade(): { map: THREE.Texture; emissive: THREE.Texture } {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#4b4640";
  g.fillRect(0, 0, 64, 128);
  g.fillStyle = "#3a362f";
  g.fillRect(0, 0, 64, 6);
  const e = document.createElement("canvas");
  e.width = 64; e.height = 128;
  const ge = e.getContext("2d")!;
  ge.fillStyle = "#000";
  ge.fillRect(0, 0, 64, 128);
  for (let y = 10; y < 118; y += 12) {
    for (let x = 6; x < 58; x += 11) {
      const lit = Math.random() < 0.28;
      g.fillStyle = lit ? "#c9a24a" : "#181a1e";
      g.fillRect(x, y, 7, 7);
      if (lit) {
        ge.fillStyle = "#ffb84d";
        ge.fillRect(x, y, 7, 7);
      }
    }
  }
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  const em = new THREE.CanvasTexture(e);
  em.colorSpace = THREE.SRGBColorSpace;
  return { map, emissive: em };
}

// --------------------------------------------------------- clases mundo ----

interface SoldierU {
  g: THREE.Group; legL: THREE.Mesh; legR: THREE.Mesh;
  side: 0 | 1; front: number; hp: number; state: 0 | 1 | 2;
  t: number; cd: number; dieT: number; speed: number; zOff: number;
  x: number; z: number; alive: boolean; shadow: THREE.Mesh;
}
interface TankU {
  g: THREE.Group; turret: THREE.Object3D; barrel: THREE.Mesh; muzzle: THREE.Sprite;
  side: 0 | 1; front: number; hp: number; cd: number; recoil: number;
  x: number; z: number; wreck: boolean; shadow: THREE.Mesh;
}
interface JetU {
  g: THREE.Group; side: 0 | 1; dir: 1 | -1; x: number; y: number; z: number;
  drops: number; bombT: number; alive: boolean; trailT: number;
}
interface HeliU {
  g: THREE.Group; rotor: THREE.Object3D; side: 0 | 1; x: number; z: number;
  y: number; cd: number; bob: number; alive: boolean;
}
interface DroneU {
  g: THREE.Group; side: 0 | 1; cx: number; cz: number; ang: number; cd: number; alive: boolean;
}
interface ShellP {
  m: THREE.Mesh; vx: number; vy: number; vz: number; fromSide: 0 | 1 | 2;
  big: boolean; t: number; whistle: boolean;
}
interface TracerP { m: THREE.Mesh; vx: number; vy: number; vz: number; life: number; fromSide: 0 | 1 }
interface BoomP { s: THREE.Sprite; t: number; dur: number; max: number }
interface SmokeP { s: THREE.Sprite; vx: number; vy: number; vz: number; t: number; dur: number; grow: number }
interface SparkP { s: THREE.Sprite; vx: number; vy: number; vz: number; t: number; dur: number }
interface BldgB {
  g: THREE.Group; m: THREE.Mesh; x: number; z: number; w: number; d: number; h: number;
  floors: number; hp: number; destroyed: boolean; burning: number; smokeT: number;
}
interface FrontF {
  idx: number; x: number; z: number; share: number; intensity: number;
  lastEvent: string; trench: THREE.Group | null; builtX: number;
  nextBarrage: [number, number]; nextPush: [number, number]; attacker: 0 | 1;
}

export class ZC3DEngine {
  private host: HTMLElement;
  private opts: ZC3DOpts;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private cam!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private clock = new THREE.Clock();
  private raf = 0;
  private disposed = false;

  // mundo
  private terrain!: THREE.Mesh;
  private fronts: FrontF[] = [];
  private bldgs: BldgB[] = [];
  private soldiers: SoldierU[] = [];
  private tanks: TankU[] = [];
  private jets: JetU[] = [];
  private helis: HeliU[] = [];
  private drones: DroneU[] = [];

  // pools
  private shells: ShellP[] = [];
  private tracers: TracerP[] = [];
  private booms: BoomP[] = [];
  private smokes: SmokeP[] = [];
  private sparks: SparkP[] = [];
  private craters: THREE.Mesh[] = [];
  private craterCap = 320;

  // shared
  private flash!: THREE.PointLight;
  private texBoom!: THREE.Texture;
  private texSmoke!: THREE.Texture;
  private texSpark!: THREE.Texture;
  private texFire!: THREE.Texture;
  private tracerGeo!: THREE.BoxGeometry;
  private craterGeo!: THREE.CircleGeometry;
  private blobGeo!: THREE.CircleGeometry;
  private facade!: { map: THREE.Texture; emissive: THREE.Texture };

  // estado
  private t = 0;
  private casualties = 0;
  private opsReal = 0;
  private stats: ZC3DStats = {
    fronts: [], casualties: 0, bldgsDown: 0, craters: 0, opsReal: 0, clock: 0, fps: 30,
  };
  private tickAcc = 0;
  private fpsRoll: number[] = [];
  private lowQuality = false;
  private pixelRatio = 1.5;

  // director
  private director = true;
  private manualUntil = 0;
  private nextCut = 5;
  private tween: { fromP: THREE.Vector3; toP: THREE.Vector3; fromT: THREE.Vector3; toT: THREE.Vector3; t: number; dur: number } | null = null;

  // modo ataque
  private strikeMode = false;
  private downXY: [number, number] | null = null;

  // audio
  private audio = new ZC3DAudio();

  constructor(host: HTMLElement, opts: ZC3DOpts = {}) {
    this.host = host;
    this.opts = opts;
    this.initRenderer();
    this.buildWorld();
    this.applySave(opts.initial);
    this.bindEvents();
    this.loop();
  }

  // ------------------------------------------------------ inicialización ----

  private initRenderer() {
    const r = this.renderer = new THREE.WebGLRenderer({
      antialias: (typeof window !== "undefined" && window.devicePixelRatio || 1) < 2,
      powerPreference: "high-performance",
    });
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    r.setPixelRatio(this.pixelRatio);
    r.setSize(this.host.clientWidth || 640, this.host.clientHeight || 360);
    r.domElement.style.display = "block";
    r.domElement.style.touchAction = "none";
    this.host.appendChild(r.domElement);

    this.cam = new THREE.PerspectiveCamera(
      55, (this.host.clientWidth || 640) / (this.host.clientHeight || 360), 0.5, 900
    );
    this.cam.position.set(0, 46, 96);

    this.controls = new OrbitControls(this.cam, r.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 170;
    this.controls.maxPolarAngle = 1.42;
    this.controls.target.set(0, 2, 10);
    this.controls.enablePan = false;
  }

  private buildWorld() {
    const S = this.scene = new THREE.Scene();
    S.fog = new THREE.Fog(0x11151f, 110, 340);

    // cielo de crepúsculo
    const skyC = document.createElement("canvas");
    skyC.width = 2; skyC.height = 256;
    const sg = skyC.getContext("2d")!;
    const grad = sg.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#0b0f1a");
    grad.addColorStop(0.55, "#232a3e");
    grad.addColorStop(0.8, "#7a4a34");
    grad.addColorStop(1, "#b96a3a");
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 2, 256);
    const skyT = new THREE.CanvasTexture(skyC);
    skyT.colorSpace = THREE.SRGBColorSpace;
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(420, 16, 12),
      new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false })
    );
    S.add(sky);

    // estrellas
    const starPos: number[] = [];
    for (let i = 0; i < 260; i++) {
      const a = R2(0, Math.PI * 2), e = R2(0.12, 1.2), rr = 400;
      starPos.push(rr * Math.cos(e) * Math.cos(a), rr * Math.sin(e), rr * Math.cos(e) * Math.sin(a));
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    S.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xcdd6ff, size: 1.4, sizeAttenuation: false, fog: false })));

    // luces de crepúsculo
    S.add(new THREE.HemisphereLight(0x9aa6c4, 0x322c22, 1.35));
    const sun = new THREE.DirectionalLight(0xffa25a, 1.5);
    sun.position.set(-120, 46, -30);
    S.add(sun);
    const fill = new THREE.DirectionalLight(0x4a5a8a, 0.5);
    fill.position.set(80, 60, 60);
    S.add(fill);

    // flash compartido de explosiones
    this.flash = new THREE.PointLight(0xffa050, 0, 90, 1.6);
    S.add(this.flash);

    // texturas compartidas
    this.texBoom = texRadial("rgba(255,240,190,1)", "rgba(255,110,30,0)");
    this.texSmoke = texRadial("rgba(120,115,110,0.55)", "rgba(60,58,56,0)");
    this.texSpark = texRadial("rgba(255,220,140,1)", "rgba(255,120,40,0)", 64);
    this.texFire = texRadial("rgba(255,190,90,0.95)", "rgba(255,70,10,0)", 64);
    this.facade = texFacade();

    this.tracerGeo = new THREE.BoxGeometry(0.06, 0.06, 1.6);
    this.craterGeo = new THREE.CircleGeometry(1, 12);
    this.craterGeo.rotateX(-Math.PI / 2);
    this.blobGeo = new THREE.CircleGeometry(1, 10);
    this.blobGeo.rotateX(-Math.PI / 2);

    this.buildTerrain();
    this.buildRoads();
    this.buildCity();
    this.buildBatteries();

    for (let i = 0; i < 4; i++) {
      const f: FrontF = {
        idx: i, x: 0, z: FRONT_Z[i], share: 0.5, intensity: 0.4,
        lastEvent: "línea estable", trench: null, builtX: 999,
        nextBarrage: [R2(4, 14), R2(6, 12)], nextPush: [R2(16, 34), R2(20, 40)],
        attacker: (i % 2) as 0 | 1,
      };
      this.fronts.push(f);
      this.spawnTrench(f);
      for (let s = 0 as 0 | 1; s <= 1; s = (s + 1) as 0 | 1) {
        const n = i === 1 || i === 3 ? 8 : 6;
        for (let k = 0; k < n; k++) this.spawnSoldier(f, s);
        const tn = i === 1 || i === 3 ? 2 : 1;
        for (let k = 0; k < tn; k++) this.spawnTank(f, s);
      }
    }
    this.spawnJet(0);
    this.spawnJet(1);
    this.spawnHeli(0);
    this.spawnHeli(1);
    this.spawnDrone(0);
    this.spawnDrone(1);
  }

  private buildTerrain() {
    const segX = 96, segZ = 64;
    const geo = new THREE.PlaneGeometry(MAP_X * 2 + 40, MAP_Z * 2 + 30, segX, segZ);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const cMud = new THREE.Color(0x4a4438), cGrass = new THREE.Color(0x3c4a33);
    const cDirt = new THREE.Color(0x5a5244), cRiver = new THREE.Color(0x142a34);
    const cRoad = new THREE.Color(0x2c2a26);
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      pos.setY(i, terrainH(x, z));
      const n = vnoise(x * 0.05 + 3, z * 0.05 + 8);
      tmp.copy(cMud).lerp(cGrass, clamp(n * 1.4 - 0.2, 0, 1));
      tmp.lerp(cDirt, clamp(vnoise(x * 0.11, z * 0.11) - 0.55, 0, 1) * 1.6);
      const riverC = 16 + Math.sin(x * 0.05) * 6;
      if (Math.abs(z - riverC) < 5.2) tmp.lerp(cRiver, 0.85);
      if (Math.abs(z + 16.5) < 2.6) tmp.lerp(cRoad, 0.8);
      // cicatriz tenue en cada línea de frente
      for (const fz of FRONT_Z) {
        const d = Math.abs(z - fz);
        if (d < 3.5) tmp.lerp(cDirt, (1 - d / 3.5) * 0.35);
      }
      colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    this.terrain = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
    this.scene.add(this.terrain);
  }

  private buildRoads() {
    const mat = new THREE.MeshLambertMaterial({ color: 0x2e2c28 });
    const mk = (cx: number, cz: number, w: number, d: number) => {
      const g = new THREE.PlaneGeometry(w, d, Math.max(2, Math.round(w / 6)), Math.max(2, Math.round(d / 6)));
      g.rotateX(-Math.PI / 2);
      const p = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) p.setY(i, terrainH(p.getX(i) + cx, p.getZ(i) + cz) + 0.06);
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, mat);
      m.position.set(cx, 0, cz);
      this.scene.add(m);
    };
    mk(0, -16.5, MAP_X * 2 + 30, 4.2); // carretera este-oeste
    mk(3, 6, 4.2, 150); // camino norte-sur hacia la ciudad
  }

  private buildCity() {
    const spots: [number, number][] = [
      [-24, 40], [-15, 42], [-6, 39], [3, 41], [12, 40], [21, 43],
      [-20, 50], [-10, 53], [0, 49], [9, 52], [18, 50], [-3, 59],
      [-26, 32], [16, 32], [26, 56], [8, 62],
    ];
    spots.forEach(([x, z], i) => {
      const floors = RI(2, 7);
      const w = R2(4.4, 7), d = R2(4.4, 7), h = floors * 1.55;
      const g = new THREE.Group();
      const mat = new THREE.MeshLambertMaterial({
        map: this.facade.map, emissive: 0xffffff, emissiveMap: this.facade.emissive, emissiveIntensity: 0.9,
      });
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.y = h / 2;
      g.add(m);
      // azotea
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.5, 0.5, d * 0.5),
        new THREE.MeshLambertMaterial({ color: 0x33302b })
      );
      roof.position.y = h + 0.25;
      g.add(roof);
      g.position.set(x, terrainH(x, z), z);
      this.scene.add(g);
      this.bldgs.push({
        g, m, x, z, w, d, h, floors, hp: 2, destroyed: false, burning: 0, smokeT: 0,
      });
      void i;
    });
  }

  private buildBatteries() {
    const mkBat = (x: number, z: number, side: 0 | 1) => {
      const g = new THREE.Group();
      for (let k = 0; k < 3; k++) {
        const base = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 0.7, 1.6),
          new THREE.MeshLambertMaterial({ color: 0x3a3f34 })
        );
        base.position.set(0, 0.35, k * 3.4);
        const barrel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.16, 3.2, 8),
          new THREE.MeshLambertMaterial({ color: 0x22261e })
        );
        barrel.rotation.z = Math.PI / 2 - (side === 0 ? 0.7 : -0.7);
        barrel.rotation.y = side === 0 ? -Math.PI / 2 : Math.PI / 2;
        barrel.position.set(side === 0 ? 1.1 : -1.1, 1.1, k * 3.4);
        g.add(base, barrel);
      }
      g.position.set(x, terrainH(x, z), z);
      this.scene.add(g);
    };
    mkBat(-96, -26, 0);
    mkBat(96, 28, 1);
  }

  // --------------------------------------------------- creación de unidades ----

private spawnTrench(f: FrontF) {
  if (f.trench) {
    this.scene.remove(f.trench);
    f.trench.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose();
    });
    f.trench = null;
  }
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: 0x26241f });
  const sand = new THREE.MeshLambertMaterial({ color: 0x6e6248 });
  const x0 = f.x;
  for (let z = f.z - 10; z <= f.z + 10; z += 2.1) {
    const seg = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 2.0), mat);
    seg.position.set(x0 + R2(-0.4, 0.4), terrainH(x0, z) + 0.12, z);
    seg.rotation.y = (Math.floor(z / 2.1) % 2 === 0 ? 0.6 : -0.6);
    g.add(seg);
    if (Math.random() < 0.75) {
      const sb = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.45), sand);
      sb.position.set(x0 + (Math.random() < 0.5 ? -1.1 : 1.1), terrainH(x0, z) + 0.18, z + R2(-0.5, 0.5));
      sb.rotation.y = R2(-0.4, 0.4);
      g.add(sb);
    }
  }
  // banderas de los dos países en los extremos de la línea
  for (const [sx, side] of [[-6, 0], [6, 1]] as const) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 4.4, 6),
      new THREE.MeshLambertMaterial({ color: 0x777777 })
    );
    pole.position.set(x0 + sx, terrainH(x0 + sx, f.z) + 2.2, f.z);
    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.95),
      new THREE.MeshLambertMaterial({
        color: SIDE[side].main, side: THREE.DoubleSide, emissive: SIDE[side].main, emissiveIntensity: 0.25,
      })
    );
    flag.position.set(x0 + sx + (side === 0 ? 0.85 : -0.85), terrainH(x0 + sx, f.z) + 3.9, f.z);
    flag.rotation.y = side === 0 ? -Math.PI / 2 : Math.PI / 2;
    g.add(pole, flag);
  }
  this.scene.add(g);
  f.trench = g;
  f.builtX = f.x;
}

private spawnSoldier(f: FrontF, side: 0 | 1) {
  const g = new THREE.Group();
  const uniform = new THREE.MeshLambertMaterial({ color: side === 0 ? 0x6e3a30 : 0x2f5a63 });
  const skin = new THREE.MeshLambertMaterial({ color: 0xb08a66 });
  const helmet = new THREE.MeshLambertMaterial({ color: side === 0 ? 0x4a2820 : 0x24444c });
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.42, 3, 8), uniform);
  torso.position.y = 0.95;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 7), skin);
  head.position.y = 1.42;
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.165, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), helmet);
  helm.position.y = 1.44;
  const gun = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.07), new THREE.MeshLambertMaterial({ color: 0x1a1a1a }));
  gun.position.set(0.16, 1.05, 0.12);
  gun.rotation.y = side === 0 ? Math.PI : 0;
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.5, 0.13), uniform);
  legL.position.set(-0.09, 0.3, 0);
  const legR = legL.clone();
  legR.position.x = 0.09;
  const shadow = new THREE.Mesh(this.blobGeo, SHADOW_MAT);
  shadow.scale.setScalar(0.42);
  g.add(torso, head, helm, gun, legL, legR);

  const dir = side === 0 ? 1 : -1;
  const x = f.x - dir * R2(4, 16);
  const z = f.z + R2(-8, 8);
  g.position.set(x, terrainH(x, z), z);
  this.scene.add(g);
  shadow.position.set(x, terrainH(x, z) + 0.04, z);
  this.scene.add(shadow);
  this.soldiers.push({
    g, legL, legR, side, front: f.idx, hp: 1, state: RI(0, 1) as 0 | 1,
    t: R2(0, 10), cd: R2(0.5, 4), dieT: 0, speed: R2(1.1, 1.9), zOff: R2(-0.4, 0.4),
    x, z, alive: true, shadow,
  });
}

private spawnTank(f: FrontF, side: 0 | 1) {
  const g = new THREE.Group();
  const hullMat = new THREE.MeshLambertMaterial({ color: side === 0 ? 0x5d4034 : 0x3c5a4a });
  const darkMat = new THREE.MeshLambertMaterial({ color: 0x1f201d });
  const hull = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.85, 1.85), hullMat);
  hull.position.y = 0.75;
  const trackL = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 0.42), darkMat);
  trackL.position.set(0, 0.3, 1.0);
  const trackR = trackL.clone();
  trackR.position.z = -1.0;
  const turret = new THREE.Group();
  const tBase = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 1.25), hullMat);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.3, 8), darkMat);
  barrel.rotation.z = Math.PI / 2;
  barrel.position.set(1.55, 0.08, 0);
  turret.add(tBase, barrel);
  turret.position.y = 1.35;
  const muzzle = new THREE.Sprite(new THREE.SpriteMaterial({
    map: this.texSpark, color: 0xffd090, transparent: true, opacity: 0, depthWrite: false,
  }));
  muzzle.scale.setScalar(2.2);
  muzzle.position.set(2.9, 1.45, 0);
  const shadow = new THREE.Mesh(this.blobGeo, SHADOW_MAT);
  shadow.scale.set(2.1, 1, 1.4);
  g.add(hull, trackL, trackR, turret, muzzle);
  const dir = side === 0 ? 1 : -1;
  const x = f.x - dir * R2(7, 14);
  const z = f.z + R2(-6, 6);
  g.position.set(x, terrainH(x, z), z);
  g.rotation.y = side === 0 ? 0 : Math.PI;
  this.scene.add(g);
  shadow.position.set(x, terrainH(x, z) + 0.05, z);
  this.scene.add(shadow);
  this.tanks.push({
    g, turret, barrel, muzzle, side, front: f.idx, hp: 3, cd: R2(2, 7),
    recoil: 0, x, z, wreck: false, shadow,
  });
}

private spawnJet(side: 0 | 1) {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: side === 0 ? 0x554640 : 0x40525c });
  const fus = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 5.4, 8), mat);
  fus.rotation.z = Math.PI / 2;
  const wing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.09, 5.4), mat);
  wing.position.set(-0.4, 0, 0);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 2.0), mat);
  tail.position.set(-2.2, 0.3, 0);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.08), mat);
  fin.position.set(-2.2, 0.55, 0);
  const burner = new THREE.Sprite(new THREE.SpriteMaterial({
    map: this.texSpark, color: 0x9ec8ff, transparent: true, opacity: 0.9, depthWrite: false,
  }));
  burner.scale.set(1.6, 0.9, 1);
  burner.position.set(-3.0, 0, 0);
  g.add(fus, wing, tail, fin, burner);
  const dir: 1 | -1 = side === 0 ? 1 : -1;
  g.rotation.y = dir === 1 ? 0 : Math.PI;
  this.scene.add(g);
  this.jets.push({
    g, side, dir,
    x: dir === 1 ? -MAP_X - 20 : MAP_X + 20,
    y: R2(38, 58), z: pick(FRONT_Z) + R2(-10, 10),
    drops: RI(2, 4), bombT: R2(4, 9), alive: true, trailT: 0,
  });
}

private spawnHeli(side: 0 | 1) {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: side === 0 ? 0x4d3a30 : 0x37474a });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 1.8, 4, 8), mat);
  body.rotation.z = Math.PI / 2;
  const tail = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 0.3), mat);
  tail.position.set(-2.4, 0.15, 0);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.08), mat);
  fin.position.set(-3.9, 0.45, 0);
  const rotor = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.05, 0.32), new THREE.MeshLambertMaterial({ color: 0x181a17 }));
  const blade2 = blade.clone();
  blade2.rotation.y = Math.PI / 2;
  rotor.add(blade, blade2);
  rotor.position.y = 0.95;
  g.add(body, tail, fin, rotor);
  this.scene.add(g);
  this.helis.push({
    g, rotor, side, x: R2(-60, 60), z: pick(FRONT_Z) + (side === 0 ? -14 : 14),
    y: R2(13, 19), cd: R2(2, 5), bob: R2(0, 6), alive: true,
  });
}

private spawnDrone(side: 0 | 1) {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: 0x2c2f2a });
  const wing = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.07, 0.4), mat);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.5), mat);
  const tailB = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 1.4), mat);
  tailB.position.z = -0.7;
  g.add(wing, body, tailB);
  this.scene.add(g);
  const f = pick(this.fronts);
  this.drones.push({ g, side, cx: f.x, cz: f.z, ang: R2(0, Math.PI * 2), cd: R2(6, 16), alive: true });
}

// -------------------------------------------------------- estado guardado ----

private applySave(init: Partial<ZC3DSaveState> | undefined) {
  if (!init) return;
  if (init.frontX) {
    init.frontX.forEach((x, i) => {
      if (this.fronts[i] && typeof x === "number" && isFinite(x)) {
        this.fronts[i].x = clamp(x, -26, 26);
        this.spawnTrench(this.fronts[i]);
      }
    });
  }
  if (init.destroyed) {
    init.destroyed.forEach((idx) => {
      const b = this.bldgs[idx];
      if (b && !b.destroyed) this.destroyBldg(b, true);
    });
  }
  if (init.casualties) this.casualties = init.casualties;
  if (init.opsReal) this.opsReal = init.opsReal;
  if (init.craters) {
    for (let i = 0; i < Math.min(init.craters, this.craterCap); i++) {
      const x = R2(-70, 70), z = R2(-64, 64);
      this.addCrater(x, z, R2(0.8, 2.4));
    }
  }
}

getSaveState(): ZC3DSaveState {
  return {
    frontX: this.fronts.map((f) => Math.round(f.x * 10) / 10),
    destroyed: this.bldgs.map((b, i) => (b.destroyed ? i : -1)).filter((i) => i >= 0),
    craters: this.craterTotal,
    casualties: this.casualties,
    opsReal: this.opsReal,
  };
}

// ------------------------------------------------------------- eventos UI ----

private bindEvents() {
  const el = this.renderer.domElement;
  el.addEventListener("pointerdown", this.onDown);
  el.addEventListener("pointerup", this.onUp);
  this.controls.addEventListener("start", () => {
    this.manualUntil = this.t + 25;
    this.tween = null;
  });
}

private onDown = (e: PointerEvent) => {
  this.downXY = [e.clientX, e.clientY];
};

private onUp = (e: PointerEvent) => {
  if (!this.downXY || !this.strikeMode) {
    this.downXY = null;
    return;
  }
  const dx = e.clientX - this.downXY[0], dy = e.clientY - this.downXY[1];
  this.downXY = null;
  if (dx * dx + dy * dy > 100) return; // fue un arrastre, no un toque
  const rect = this.renderer.domElement.getBoundingClientRect();
  const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  const rc = new THREE.Raycaster();
  rc.setFromCamera(new THREE.Vector2(nx, ny), this.cam);
  const hit = rc.intersectObject(this.terrain, false)[0];
  if (hit) {
    const p = hit.point;
    this.callBarrage(p.x, p.z, RI(5, 8), 2, true);
    this.opts.onEvent?.({ text: `Fuego manual solicitado sobre [${Math.round(p.x)}, ${Math.round(p.z)}]`, side: 2 });
  }
};

// ------------------------------------------------------------ efectos ----

private boomAt(x: number, y: number, z: number, big: boolean) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: this.texBoom, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  s.position.set(x, y, z);
  const max = big ? R2(16, 22) : R2(5, 9);
  s.scale.setScalar(max * 0.25);
  this.scene.add(s);
  this.booms.push({ s, t: 0, dur: big ? 0.85 : 0.5, max });
  const camD = this.cam.position.distanceTo(new THREE.Vector3(x, y, z));
  this.audio.boom(camD, big);
  // flash de luz
  if (big || camD < 60) {
    this.flash.position.set(x, y + 3, z);
    this.flash.intensity = big ? 240 : 90;
  }
  // chispas
  const nSp = big ? 10 : 5;
  for (let i = 0; i < nSp; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.texSpark, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    sp.position.set(x, y, z);
    sp.scale.setScalar(R2(0.5, 1.2));
    this.scene.add(sp);
    this.sparks.push({
      s: sp, vx: R2(-9, 9), vy: R2(4, 13), vz: R2(-9, 9), t: 0, dur: R2(0.5, 1.1),
    });
  }
  // humo
  const nSm = (big ? 6 : 3) * (this.lowQuality ? 0.5 : 1);
  for (let i = 0; i < nSm; i++) {
    this.spawnSmoke(x + R2(-1, 1), y + R2(0, 2), z + R2(-1, 1), big ? R2(3.5, 6) : R2(1.6, 2.6));
  }
  // sacudida de cámara si está cerca
  const near = camD < 55;
  if (near) this.shake = Math.max(this.shake, big ? 0.9 : 0.35);
}

private spawnSmoke(x: number, y: number, z: number, r0: number) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: this.texSmoke, transparent: true, depthWrite: false, opacity: 0.7,
  }));
  s.position.set(x, y, z);
  s.scale.setScalar(r0);
  this.scene.add(s);
  this.smokes.push({
    s, vx: R2(-0.4, 0.4), vy: R2(1.1, 2.2), vz: R2(-0.4, 0.4),
    t: 0, dur: R2(3.5, 6.5), grow: r0 * R2(1.8, 2.6),
  });
}

private addCrater(x: number, z: number, r: number) {
  const m = new THREE.Mesh(this.craterGeo, CRATER_MAT);
  m.position.set(x, terrainH(x, z) + 0.07, z);
  m.scale.set(r, 1, r);
  this.scene.add(m);
  this.craters.push(m);
  if (this.craters.length > this.craterCap) {
    const old = this.craters.shift();
    if (old) {
      this.scene.remove(old);
    }
  }
}

private fireShell(from: THREE.Vector3, to: THREE.Vector3, fromSide: 0 | 1 | 2, big: boolean, whistle: boolean) {
  const g = 20;
  const T = clamp(from.distanceTo(to) / 26, 1.6, 4.6);
  const vx = (to.x - from.x) / T;
  const vz = (to.z - from.z) / T;
  const vy = (to.y - from.y) / T + 0.5 * g * T;
  const m = new THREE.Mesh(SHELL_GEO, SHELL_MAT);
  m.position.copy(from);
  this.scene.add(m);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: this.texSpark, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9,
  }));
  glow.scale.setScalar(big ? 1.6 : 1.0);
  m.add(glow);
  this.shells.push({ m, vx, vy, vz, fromSide, big, t: 0, whistle });
  if (whistle) this.audio.whistle(T * 0.8);
}

private fireTracer(x: number, y: number, z: number, tx: number, ty: number, tz: number, side: 0 | 1) {
  const m = new THREE.Mesh(this.tracerGeo, TRACER_MATS[side]);
  m.position.set(x, y, z);
  const dx = tx - x, dy = ty - y, dz = tz - z;
  const d = Math.hypot(dx, dy, dz) || 1;
  const sp = R2(55, 85);
  const vx = (dx / d) * sp, vy = (dy / d) * sp, vz = (dz / d) * sp;
  m.lookAt(tx, ty, tz);
  this.scene.add(m);
  this.tracers.push({ m, vx, vy, vz, life: clamp(d / sp + 0.25, 0.3, 1.6), fromSide: side });
}

// ------------------------------------------------------------ daño y baja ----

private shake = 0;
private craterTotal = 0;

private killSoldier(s: SoldierU) {
  if (!s.alive) return;
  s.alive = false;
  s.state = 2;
  s.dieT = 0;
  this.casualties++;
  const f = this.fronts[s.front];
  f.intensity = clamp(f.intensity + 0.03, 0, 1.4);
  if (Math.random() < 0.22) {
    this.opts.onEvent?.({
      text: `${pick(BAJS_TXT)} en ${FRONT_NAMES[f.idx]} · ${SIDE[s.side].name}`,
      side: s.side,
    });
  }
}

private destroyBldg(b: BldgB, instant: boolean) {
  if (b.destroyed) return;
  b.destroyed = true;
  b.burning = 1;
  const { x, z, w, d, h } = b;
  const drop = () => {
    this.scene.remove(b.g);
    const rg = new THREE.Group();
    const rm = new THREE.MeshLambertMaterial({ color: 0x3a362f });
    const r1 = new THREE.Mesh(new THREE.BoxGeometry(w, Math.max(0.5, h * 0.2), d), rm);
    r1.position.y = h * 0.1;
    const r2 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, Math.max(0.6, h * 0.36), d * 0.6), rm);
    r2.position.set(R2(-0.6, 0.6), h * 0.18, R2(-0.6, 0.6));
    r2.rotation.y = R2(0, 1.2);
    rg.add(r1, r2);
    rg.position.set(x, terrainH(x, z), z);
    this.scene.add(rg);
    for (let i = 0; i < 8; i++) {
      this.spawnSmoke(x + R2(-w / 2, w / 2), terrainH(x, z) + R2(0, 2), z + R2(-d / 2, d / 2), R2(2.5, 4.5));
    }
    this.boomAt(x, terrainH(x, z) + 3, z, true);
    this.audio.siren();
    this.opts.onEvent?.({ text: "Un edificio de la ciudad acaba de colapsar en directo" });
  };
  if (instant) {
    drop();
  } else {
    const start = performance.now();
    const anim = () => {
      if (this.disposed) return;
      const k = clamp((performance.now() - start) / 620, 0, 1);
      b.m.scale.y = Math.max(0.02, 1 - k);
      b.m.position.y = (h / 2) * (1 - k);
      if (k < 1) requestAnimationFrame(anim);
      else drop();
    };
    anim();
  }
}

private damageBldgAt(x: number, z: number, r: number) {
  for (const b of this.bldgs) {
    if (b.destroyed) continue;
    if (Math.hypot(b.x - x, b.z - z) < r + 2.5) {
      b.hp--;
      if (b.hp <= 0) this.destroyBldg(b, false);
      else {
        b.burning = 1;
        (b.m.material as THREE.MeshLambertMaterial).emissiveIntensity = 0.18;
        this.opts.onEvent?.({ text: "Un bloque de la ciudad arde tras el impacto" });
      }
    }
  }
}

private callBarrage(tx: number, tz: number, n: number, fromSide: 0 | 1 | 2, big: boolean) {
  const from =
    fromSide === 0
      ? new THREE.Vector3(-96, 2.6, -26)
      : fromSide === 1
        ? new THREE.Vector3(96, 2.6, 28)
        : new THREE.Vector3(tx + R2(-40, 40), 15, tz + R2(-40, 40));
  for (let i = 0; i < n; i++) {
    const tx2 = clamp(tx + R2(-7, 7), -MAP_X, MAP_X);
    const tz2 = clamp(tz + R2(-7, 7), -MAP_Z, MAP_Z);
    window.setTimeout(() => {
      if (this.disposed) return;
      this.fireShell(from, new THREE.Vector3(tx2, terrainH(tx2, tz2), tz2), fromSide, big, i === 0 && big);
    }, i * R2(160, 420));
  }
}

// -------------------------------------------------------- API pública ----

setDirector(on: boolean) {
  this.director = on;
  if (!on) this.tween = null;
}

setSound(on: boolean) {
  this.audio.setOn(on);
}

setStrike(on: boolean) {
  this.strikeMode = on;
}

focusFront(i: number) {
  const f = this.fronts[clamp(i, 0, 3)];
  const tz = new THREE.Vector3(f.x, 2, f.z);
  const ang = R2(-0.8, 0.8);
  const r = R2(17, 26);
  const tp = new THREE.Vector3(
    clamp(f.x + Math.sin(ang) * r, -80, 80),
    R2(6, 12),
    clamp(f.z + Math.cos(ang) * r, -68, 68)
  );
  this.tween = {
    fromP: this.cam.position.clone(), toP: tp,
    fromT: this.controls.target.clone(), toT: tz, t: 0, dur: 2.2,
  };
  this.manualUntil = this.t + 22;
}

triggerOp(frontIdx: number, headline: string, url?: string) {
  const idx = clamp(frontIdx, 0, 3);
  const f = this.fronts[idx];
  this.opsReal++;
  this.callBarrage(f.x + R2(-6, 6), f.z, RI(6, 9), f.attacker, true);
  const cap = 92;
  for (let i = 0; i < 4 && this.soldiers.length < cap; i++) this.spawnSoldier(f, f.attacker);
  const jet = this.jets.find((j) => j.side === f.attacker);
  if (jet) {
    jet.z = f.z + R2(-4, 4);
    jet.drops = RI(2, 3);
  }
  f.intensity = clamp(f.intensity + 0.55, 0, 1.4);
  f.lastEvent = "OPERACIÓN REAL";
  this.opts.onEvent?.({
    text: `Despacho real → ofensiva total en ${FRONT_NAMES[idx]}: "${headline.slice(0, 88)}"`,
    real: true, url, side: f.attacker,
  });
}

getStats(): ZC3DStats {
  return {
    fronts: this.fronts.map((f) => ({
      name: FRONT_NAMES[f.idx],
      share: clamp((f.x + 26) / 52, 0, 1),
      intensity: clamp(f.intensity, 0, 1),
      lastEvent: f.lastEvent,
    })),
    casualties: this.casualties,
    bldgsDown: this.bldgs.filter((b) => b.destroyed).length,
    craters: this.craterTotal,
    opsReal: this.opsReal,
    clock: Math.floor(this.t),
    fps: this.fpsRoll.length
      ? Math.round(this.fpsRoll.reduce((a, b) => a + b, 0) / this.fpsRoll.length)
      : 30,
  };
}

dispose() {
  this.disposed = true;
  cancelAnimationFrame(this.raf);
  const el = this.renderer.domElement;
  el.removeEventListener("pointerdown", this.onDown);
  el.removeEventListener("pointerup", this.onUp);
  this.controls.dispose();
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
  this.facade.map.dispose();
  this.facade.emissive.dispose();
  this.texBoom.dispose();
  this.texSmoke.dispose();
  this.texSpark.dispose();
  this.texFire.dispose();
  this.renderer.dispose();
  if (el.parentElement) el.parentElement.removeChild(el);
}

// -------------------------------------------------------- bucles update ----

private updateSoldiers(dt: number) {
  for (const s of this.soldiers) {
    const f = this.fronts[s.front];
    if (s.state === 2) {
      s.dieT += dt;
      const k = clamp(s.dieT / 0.5, 0, 1);
      s.g.rotation.z = (s.side === 0 ? -1 : 1) * k * Math.PI * 0.47;
      if (s.dieT > 12) {
        s.alive = true;
        s.state = 1;
        s.hp = 1;
        s.g.rotation.z = 0;
        const dir = s.side === 0 ? 1 : -1;
        s.x = f.x - dir * R2(5, 15);
        s.z = f.z + R2(-8, 8);
      }
      continue;
    }
    s.t += dt;
    s.cd -= dt;
    const dir = s.side === 0 ? 1 : -1;
    s.g.rotation.y = s.side === 0 ? Math.PI / 2 : -Math.PI / 2;
    if (s.state === 0) {
      s.x += dir * s.speed * dt;
      s.z += s.zOff * 0.2 * dt;
      const swing = Math.sin(s.t * 9) * 0.55;
      s.legL.rotation.z = swing;
      s.legR.rotation.z = -swing;
      const goal = f.x - dir * 2.0;
      if ((dir === 1 && s.x >= goal) || (dir === -1 && s.x <= goal)) s.state = 1;
    } else {
      s.legL.rotation.z = 0;
      s.legR.rotation.z = 0;
      if (s.cd <= 0) {
        s.cd = R2(0.9, 2.8);
        let best: SoldierU | null = null;
        let bd = 1e9;
        for (const e of this.soldiers) {
          if (e.side === s.side || !e.alive || e.front !== s.front) continue;
          const d = Math.hypot(e.x - s.x, e.z - s.z);
          if (d < bd) { bd = d; best = e; }
        }
        if (best && bd < 26) {
          this.fireTracer(
            s.x + dir * 0.3, s.g.position.y + 1.05, s.z,
            best.x + R2(-0.6, 0.6), best.g.position.y + R2(0.6, 1.3), best.z + R2(-0.6, 0.6),
            s.side
          );
          if (Math.random() < 0.25) this.audio.rattle(bd);
          if (Math.random() < 0.15) this.killSoldier(best);
        }
        if (Math.random() < 0.15) s.state = 0;
      }
    }
    s.g.position.set(s.x, terrainH(s.x, s.z), s.z);
    s.shadow.position.set(s.x, terrainH(s.x, s.z) + 0.04, s.z);
  }
}

private updateTanks(dt: number) {
  for (const tk of this.tanks) {
    const f = this.fronts[tk.front];
    if (tk.wreck) {
      tk.cd -= dt;
      if (tk.cd <= 0) {
        tk.cd = 1.1;
        if (this.smokes.length < 60) this.spawnSmoke(tk.x, tk.g.position.y + 1.6, tk.z, 1.5);
      }
      continue;
    }
    tk.cd -= dt;
    tk.recoil = Math.max(0, tk.recoil - dt * 2.2);
    tk.barrel.position.x = 1.55 - tk.recoil * 0.5;
    (tk.muzzle.material as THREE.SpriteMaterial).opacity *= Math.exp(-9 * dt);
    const dir = tk.side === 0 ? 1 : -1;
    // empuje lento hacia la línea
    const distLine = Math.abs(f.x - dir * 8 - tk.x);
    if (distLine > 1.5) tk.x += dir * 0.28 * dt;
    // buscar objetivo
    let tx = 0, tz = 0, has = false, bd = 1e9;
    for (const e of this.tanks) {
      if (e.side === tk.side || e.wreck || e.front !== tk.front) continue;
      const d = Math.hypot(e.x - tk.x, e.z - tk.z);
      if (d < bd) { bd = d; tx = e.x; tz = e.z; has = true; }
    }
    if (!has) {
      for (const s of this.soldiers) {
        if (s.side === tk.side || !s.alive || s.front !== tk.front) continue;
        const d = Math.hypot(s.x - tk.x, s.z - tk.z);
        if (d < bd) { bd = d; tx = s.x; tz = s.z; has = true; }
      }
    }
    if (has && bd < 55) {
      const desired = Math.atan2(tz - tk.z, tx - tk.x) - (tk.side === 0 ? 0 : Math.PI);
      let dy = desired - tk.turret.rotation.y;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      tk.turret.rotation.y += dy * Math.min(1, dt * 2.5);
      if (tk.cd <= 0 && Math.abs(dy) < 0.2 && bd > 6) {
        tk.cd = R2(5, 11);
        tk.recoil = 1;
        (tk.muzzle.material as THREE.SpriteMaterial).opacity = 1;
        const from = new THREE.Vector3();
        tk.muzzle.getWorldPosition(from);
        this.fireShell(from, new THREE.Vector3(tx + R2(-1, 1), terrainH(tx, tz), tz + R2(-1, 1)), tk.side, false, false);
        this.audio.rattle(bd);
        f.intensity = clamp(f.intensity + 0.05, 0, 1.4);
      }
    }
    tk.g.position.set(tk.x, terrainH(tk.x, tk.z), tk.z);
    tk.shadow.position.set(tk.x, terrainH(tk.x, tk.z) + 0.05, tk.z);
  }
}

private updateJets(dt: number) {
  for (const j of this.jets) {
    j.x += j.dir * 30 * dt;
    j.bombT -= dt;
    j.g.position.set(j.x, j.y, j.z);
    if (Math.abs(j.x) < 68 && j.drops > 0 && j.bombT <= 0) {
      let f = this.fronts[0];
      for (const ff of this.fronts) if (Math.abs(ff.z - j.z) < Math.abs(f.z - j.z)) f = ff;
      j.bombT = R2(1.6, 3.2);
      j.drops--;
      const tx = clamp(f.x + R2(-8, 8), -60, 60);
      const tz = clamp(f.z + R2(-8, 8), -60, 60);
      this.fireShell(new THREE.Vector3(j.x, j.y, j.z), new THREE.Vector3(tx, terrainH(tx, tz), tz), j.side, true, true);
      f.intensity = clamp(f.intensity + 0.12, 0, 1.4);
    }
    if (j.dir === 1 && j.x > MAP_X + 22) {
      j.x = -MAP_X - 22;
      j.z = pick(FRONT_Z) + R2(-10, 10);
      j.y = R2(38, 58);
      j.drops = RI(2, 4);
      j.bombT = R2(4, 9);
    } else if (j.dir === -1 && j.x < -MAP_X - 22) {
      j.x = MAP_X + 22;
      j.z = pick(FRONT_Z) + R2(-10, 10);
      j.y = R2(38, 58);
      j.drops = RI(2, 4);
      j.bombT = R2(4, 9);
    }
  }
}

private updateHelis(dt: number) {
  for (const h of this.helis) {
    h.bob += dt;
    h.cd -= dt;
    h.rotor.rotation.y += 26 * dt;
    const f = this.fronts[Math.floor(this.t / 20) % 4];
    h.x += (clamp(f.x + (h.side === 0 ? -13 : 13), -70, 70) - h.x) * dt * 0.25;
    h.z += (f.z + (h.side === 0 ? -12 : 12) - h.z) * dt * 0.2;
    h.g.position.set(h.x, h.y + Math.sin(h.bob * 1.7) * 0.6, h.z);
    if (h.cd <= 0) {
      h.cd = R2(4, 8);
      for (let k = 0; k < 3; k++) {
        window.setTimeout(() => {
          if (this.disposed) return;
          const tx = clamp(f.x + R2(-5, 5), -60, 60);
          const tz = clamp(f.z + R2(-5, 5), -60, 60);
          this.fireShell(
            new THREE.Vector3(h.x, h.y, h.z),
            new THREE.Vector3(tx, terrainH(tx, tz), tz), h.side, false, false
          );
        }, k * 160);
      }
      this.audio.rattle(Math.abs(h.g.position.distanceTo(this.cam.position)));
      const ff = this.fronts[Math.floor(this.t / 20) % 4];
      ff.intensity = clamp(ff.intensity + 0.08, 0, 1.4);
    }
  }
}

private updateDrones(dt: number) {
  let hot = this.fronts[0];
  for (const f of this.fronts) if (f.intensity > hot.intensity) hot = f;
  for (const d of this.drones) {
    d.ang += dt * 0.3;
    d.cx += (hot.x + (d.side === 0 ? -9 : 9) - d.cx) * dt * 0.12;
    d.cz += (hot.z - d.cz) * dt * 0.12;
    const x = d.cx + Math.cos(d.ang) * 11;
    const z = d.cz + Math.sin(d.ang) * 11;
    d.g.position.set(x, 27 + Math.sin(d.ang * 2) * 0.8, z);
    d.g.rotation.y = -d.ang;
    d.cd -= dt;
    if (d.cd <= 0) {
      d.cd = R2(9, 18);
      const tx = clamp(hot.x + R2(-4, 4), -60, 60);
      const tz = clamp(hot.z + R2(-4, 4), -60, 60);
      this.fireShell(new THREE.Vector3(x, 27, z), new THREE.Vector3(tx, terrainH(tx, tz), tz), d.side, false, true);
    }
  }
}

private updateShells(dt: number) {
  for (let i = this.shells.length - 1; i >= 0; i--) {
    const sh = this.shells[i];
    sh.t += dt;
    sh.vy -= 20 * dt;
    sh.m.position.x += sh.vx * dt;
    sh.m.position.y += sh.vy * dt;
    sh.m.position.z += sh.vz * dt;
    const gh = terrainH(sh.m.position.x, sh.m.position.z);
    if (sh.m.position.y <= gh + 0.2 || sh.t > 9) {
      const big = sh.big;
      this.boomAt(sh.m.position.x, gh + 1.2, sh.m.position.z, big);
      if (big) this.addCrater(sh.m.position.x, sh.m.position.z, R2(1.1, 2.6));
      else if (Math.random() < 0.4) this.addCrater(sh.m.position.x, sh.m.position.z, R2(0.6, 1.1));
      // daño por radio
      const px = sh.m.position.x, pz = sh.m.position.z;
      for (const s of this.soldiers) {
        if (!s.alive) continue;
        if (Math.hypot(s.x - px, s.z - pz) < (big ? 4 : 2.4)) this.killSoldier(s);
      }
      for (const tk of this.tanks) {
        if (tk.wreck) continue;
        if (Math.hypot(tk.x - px, tk.z - pz) < (big ? 5 : 3.4)) {
          tk.hp -= big ? 2 : 1;
          if (tk.hp <= 0) {
            tk.wreck = true;
            tk.g.traverse((o) => {
              if (o instanceof THREE.Mesh) o.material = WRECK_MAT;
            });
            this.opts.onEvent?.({ text: `Blindado de ${SIDE[tk.side].name} destruido en ${FRONT_NAMES[tk.front]}`, side: tk.side });
          }
        }
      }
      this.damageBldgAt(px, pz, big ? 6 : 3.5);
      let f = this.fronts[0];
      for (const ff of this.fronts) if (Math.abs(ff.z - pz) < Math.abs(f.z - pz)) f = ff;
      f.intensity = clamp(f.intensity + 0.06, 0, 1.4);
      const glow = sh.m.children[0] as THREE.Sprite | undefined;
      if (glow) glow.material.dispose();
      this.scene.remove(sh.m);
      this.shells.splice(i, 1);
    }
  }
}

private updateTracers(dt: number) {
  for (let i = this.tracers.length - 1; i >= 0; i--) {
    const tr = this.tracers[i];
    tr.life -= dt;
    tr.m.position.x += tr.vx * dt;
    tr.m.position.y += tr.vy * dt;
    tr.m.position.z += tr.vz * dt;
    if (tr.life <= 0 || tr.m.position.y < terrainH(tr.m.position.x, tr.m.position.z)) {
      if (Math.random() < 0.3) {
        for (const s of this.soldiers) {
          if (!s.alive || s.side === tr.fromSide) continue;
          if (Math.hypot(s.x - tr.m.position.x, s.z - tr.m.position.z) < 1.5) {
            if (Math.random() < 0.5) this.killSoldier(s);
            break;
          }
        }
      }
      this.scene.remove(tr.m);
      this.tracers.splice(i, 1);
    }
  }
}

private updateEffects(dt: number) {
  this.flash.intensity *= Math.exp(-6.5 * dt);
  for (let i = this.booms.length - 1; i >= 0; i--) {
    const b = this.booms[i];
    b.t += dt;
    const k = b.t / b.dur;
    if (k >= 1) {
      this.scene.remove(b.s);
      b.s.material.dispose();
      this.booms.splice(i, 1);
      continue;
    }
    const e = 1 - Math.pow(1 - k, 2);
    b.s.scale.setScalar(b.max * (0.25 + e * 0.75));
    (b.s.material as THREE.SpriteMaterial).opacity = 1 - k;
  }
  for (let i = this.smokes.length - 1; i >= 0; i--) {
    const s = this.smokes[i];
    s.t += dt;
    if (s.t >= s.dur) {
      this.scene.remove(s.s);
      s.s.material.dispose();
      this.smokes.splice(i, 1);
      continue;
    }
    const k = s.t / s.dur;
    s.s.position.x += s.vx * dt;
    s.s.position.y += s.vy * dt;
    s.s.position.z += s.vz * dt;
    s.s.scale.setScalar(s.s.scale.x + s.grow * dt * 0.4);
    (s.s.material as THREE.SpriteMaterial).opacity = 0.7 * (1 - k);
  }
  for (let i = this.sparks.length - 1; i >= 0; i--) {
    const s = this.sparks[i];
    s.t += dt;
    if (s.t >= s.dur) {
      this.scene.remove(s.s);
      s.s.material.dispose();
      this.sparks.splice(i, 1);
      continue;
    }
    s.vy -= 9 * dt;
    s.s.position.x += s.vx * dt;
    s.s.position.y += s.vy * dt;
    s.s.position.z += s.vz * dt;
    (s.s.material as THREE.SpriteMaterial).opacity = 1 - s.t / s.dur;
  }
  // incendios de edificios
  for (const b of this.bldgs) {
    if (b.burning <= 0) continue;
    if (!b.destroyed) b.burning -= dt * 0.02;
    b.smokeT -= dt;
    if (b.smokeT <= 0 && this.smokes.length < (this.lowQuality ? 26 : 60)) {
      b.smokeT = b.destroyed ? R2(1.8, 3) : R2(0.9, 1.6);
      const fy = b.destroyed ? 1.5 : b.h;
      this.spawnSmoke(b.x + R2(-1.5, 1.5), terrainH(b.x, b.z) + fy, b.z + R2(-1.5, 1.5), R2(1.4, 2.6));
    }
  }
}

private updateFronts(dt: number) {
  for (const f of this.fronts) {
    f.intensity = Math.max(0.12, f.intensity - dt * 0.045);
    if (this.t > f.nextBarrage[0]) {
      f.nextBarrage[0] = this.t + R2(14, 30);
      this.callBarrage(f.x + R2(-5, 5), f.z + R2(-6, 6), RI(3, 6), f.attacker, Math.random() < 0.3);
      f.intensity = clamp(f.intensity + 0.25, 0, 1.4);
      f.lastEvent = `artillería de ${SIDE[f.attacker].name} castiga la línea`;
      if (Math.random() < 0.5) {
        this.opts.onEvent?.({
          text: `Artillería de ${SIDE[f.attacker].name} martillea ${FRONT_NAMES[f.idx]}`,
          side: f.attacker,
        });
      }
    }
    if (this.t > f.nextPush[0]) {
      f.nextPush[0] = this.t + R2(22, 45);
      if (Math.random() < 0.6) f.attacker = (1 - f.attacker) as 0 | 1;
      let count = 0;
      for (const s of this.soldiers) {
        if (s.front === f.idx && s.side === f.attacker && s.alive && count < 5) {
          s.state = 0;
          count++;
        }
      }
      f.intensity = clamp(f.intensity + 0.35, 0, 1.4);
      f.lastEvent = `asalto de infantería de ${SIDE[f.attacker].name}`;
      this.opts.onEvent?.({
        text: `${SIDE[f.attacker].name} lanza asalto de infantería en ${FRONT_NAMES[f.idx]}`,
        side: f.attacker,
      });
      if (Math.random() < 0.35) this.audio.siren();
    }
    // avance de línea según presión local
    let atk = 0, def = 0;
    for (const s of this.soldiers) {
      if (s.front !== f.idx || !s.alive) continue;
      const near = Math.abs(s.x - f.x) < 7;
      if (!near) continue;
      if (s.side === f.attacker) atk++;
      else def++;
    }
    const delta = atk - def * 0.8;
    if (Math.abs(delta) > 1) {
      const moveDir = delta > 0 ? (f.attacker === 0 ? 1 : -1) : f.attacker === 0 ? -1 : 1;
      f.x = clamp(f.x + moveDir * 0.5 * dt * clamp(Math.abs(delta) / 3, 0.2, 1.4), -26, 26);
      if (Math.abs(f.x - f.builtX) > 3.5) this.spawnTrench(f);
    }
    f.share = clamp((f.x + 26) / 52, 0, 1);
  }
}

private updateDirector(dt: number) {
  if (this.tween) {
    this.tween.t += dt;
    const k = clamp(this.tween.t / this.tween.dur, 0, 1);
    const e = k * k * (3 - 2 * k);
    this.cam.position.lerpVectors(this.tween.fromP, this.tween.toP, e);
    this.controls.target.lerpVectors(this.tween.fromT, this.tween.toT, e);
    if (k >= 1) this.tween = null;
  } else if (this.director && this.t > this.manualUntil && this.t > this.nextCut) {
    let hot = this.fronts[0];
    for (const f of this.fronts) if (f.intensity > hot.intensity) hot = f;
    const tz = new THREE.Vector3(hot.x, 2, hot.z);
    const ang = R2(-0.9, 0.9);
    const r = R2(20, 34);
    const tp = new THREE.Vector3(
      clamp(hot.x + Math.sin(ang) * r, -80, 80),
      R2(7, 16),
      clamp(hot.z + Math.cos(ang) * r * (Math.random() < 0.5 ? 1 : -1), -68, 68)
    );
    this.tween = {
      fromP: this.cam.position.clone(), toP: tp,
      fromT: this.controls.target.clone(), toT: tz, t: 0, dur: 2.6,
    };
    this.nextCut = this.t + R2(8, 13);
  }
}

private loop = () => {
  if (this.disposed) return;
  this.raf = requestAnimationFrame(this.loop);
  const dt = Math.min(this.clock.getDelta(), 0.05);
  if (typeof document !== "undefined" && document.hidden) return;
  this.t += dt;
  this.updateFronts(dt);
  this.updateSoldiers(dt);
  this.updateTanks(dt);
  this.updateJets(dt);
  this.updateHelis(dt);
  this.updateDrones(dt);
  this.updateShells(dt);
  this.updateTracers(dt);
  this.updateEffects(dt);
  this.updateDirector(dt);

  this.fpsRoll.push(1 / Math.max(dt, 0.001));
  if (this.fpsRoll.length > 120) {
    this.fpsRoll.shift();
    const avg = this.fpsRoll.reduce((a, b) => a + b, 0) / this.fpsRoll.length;
    if (!this.lowQuality && avg < 23) {
      this.lowQuality = true;
      this.renderer.setPixelRatio(1);
    }
  }
  this.tickAcc += dt;
  if (this.tickAcc >= 1) {
    this.tickAcc = 0;
    this.opts.onTick?.(this.getStats());
  }

  this.controls.update();
  const p0 = this.cam.position.clone();
  if (this.shake > 0.01) {
    this.shake *= Math.exp(-3.2 * dt);
    this.cam.position.x += R2(-1, 1) * this.shake * 0.35;
    this.cam.position.y += R2(-1, 1) * this.shake * 0.3;
    this.cam.position.z += R2(-1, 1) * this.shake * 0.35;
  }
  this.renderer.render(this.scene, this.cam);
  this.cam.position.copy(p0);
};
}

// ------------------------------------------------- recursos compartidos ----

const SHADOW_MAT = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false });
const CRATER_MAT = new THREE.MeshBasicMaterial({ color: 0x14120f, transparent: true, opacity: 0.75, depthWrite: false });
const SHELL_GEO = new THREE.SphereGeometry(0.14, 6, 5);
const SHELL_MAT = new THREE.MeshBasicMaterial({ color: 0xffd9a0 });
const WRECK_MAT = new THREE.MeshLambertMaterial({ color: 0x17150f });
const TRACER_MATS = [
  new THREE.MeshBasicMaterial({ color: SIDE[0].tracer }),
  new THREE.MeshBasicMaterial({ color: SIDE[1].tracer }),
];
const BAJS_TXT = ["Baja confirmada", "Soldado caído", "Baja en combate", "Posición perdida con bajas"];
