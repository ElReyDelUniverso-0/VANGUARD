"use client";

// ============================================================
// VANGUARD-2 · MOTOR — el corazón del NUEVO Vanguard.
//
// Mandato del Dueño: «cada sección con su propio mundo 3D y no
// ligarlas todas; todo debe tener 3D, cada mínimo detalle».
//
// Decisiones de hierro:
//  · CERO CSS3D, CERO DOM: un solo canvas WebGL. Es
//    estructuralmente imposible que una capa 2D tape el mundo
//    (la causa histórica del «arranca en 2D»).
//  · El primer frame ya es 3D (campo de estrellas) aunque la
//    fuente 3D siga cargando: el universo JAMÁS nace plano.
//  · Cada mundo es una THREE.Scene independiente: se construye
//    al entrar, se DESPIEZA al salir. Nada comparte estado.
//  · Vuelo libre con inercia (teclado + gestos) y raycast 3D.
//  · Gobernador de FPS: DPR adaptativo, pausa si la pestaña
//    duerme, cero basura por frame.
// ============================================================
import * as THREE from "three";
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
// v151: la typeface VIVE EN EL BUNDLE — cero red, cero fetch, cero SW.
// (QA: fetch/FontLoader.load se colgaban en el build de producción del lab)
import rajdhaniJson from "../../../public/assets/fonts/rajdhani_bold.typeface.json";

// ────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────
export interface MundoV2 {
  key: string;
  titulo: string;
  escena: THREE.Scene;
  /** pose de cámara al entrar: posición y punto de mira */
  camaraPos: THREE.Vector3;
  camaraMira: THREE.Vector3;
  /** niebla y tinte de cielo propios del mundo */
  niebla?: THREE.Fog;
  pickables: THREE.Object3D[];
  tick?(t: number, dt: number): void;
  accion?(nombre: string, obj: THREE.Object3D): void;
  /** construido tras cargar datos asíncronos (opcional) */
  listo?: boolean;
}

export type ConstructorMundo = (motor: MotorV2) => MundoV2;

interface ToqueActivo {
  id: number;
  x: number;
  y: number;
  x0: number;
  y0: number;
  t0: number;
}

// ────────────────────────────────────────────────────────────
// UTILIDADES
// ────────────────────────────────────────────────────────────
/** RNG determinista por semilla (mundos procedurales únicos). */
export function rngDe(semilla: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < semilla.length; i++) {
    h ^= semilla.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

/** Limpia acentos/puntos que la typeface no tiene (lección v145). */
export function seguro(txt: string): string {
  return txt
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/gi, "N")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\.\.\./g, "");
}

/** Corta texto a n caracteres sin partir palabras (helvetiker sin elipsis). */
export function acotar(txt: string, n: number): string {
  const t = seguro(txt);
  if (t.length <= n) return t;
  const corte = t.slice(0, n);
  const ult = corte.lastIndexOf(" ");
  return (ult > n * 0.5 ? corte.slice(0, ult) : corte).trimEnd();
}

// ────────────────────────────────────────────────────────────
// EL MOTOR
// ────────────────────────────────────────────────────────────
export class MotorV2 {
  renderer: THREE.WebGLRenderer;
  camara: THREE.PerspectiveCamera;
  mundo: MundoV2 | null = null;
  font: Font | null = null;
  fontReserva: Font | null = null;
  movil: boolean;
  dprCap: number;
  dpr: number;

  private reloj = new THREE.Clock();
  private raf = 0;
  private activo = true;
  private canvas: HTMLCanvasElement;

  // cámara libre
  yaw = 0;
  pitch = 0;
  private vel = new THREE.Vector3();
  private velMirada = { yaw: 0, pitch: 0 };
  private miraObjetivo = new THREE.Vector3();
  private transicionMira = 0; // >0 mientras la cámara viaja a la pose del mundo

  // entrada
  private toques = new Map<number, ToqueActivo>();
  private ultimoTapT = 0;
  private teclas = new Set<string>();
  private empujeDoble = false; // doble toque mantenido = empuje
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2();

  // materiales compartidos (NUNCA se despiezan)
  private mats = new Map<string, THREE.Material>();
  // transición warp
  private grupoWarp = new THREE.Group();
  private warpActivo = 0; // 0..1 en curso
  private colaMundo: { ctor: ConstructorMundo; key: string } | null = null;
  // pickables del mundo EN CONSTRUCCIÓN (botones registran aquí)
  private pickablesObjetivo: THREE.Object3D[] = [];
  // reconstrucción del mundo actual cuando la typeface llegue tarde
  private ctorActual: ConstructorMundo | null = null;
  private keyActual = "inicio";
  private fuenteAlConstruir = false;
  private fuenteReconstruida = false;
  /** Navegación central: la cablea el montaje React con constructorDe. */
  navegar?: (key: string) => void;

  // gobernador
  private fpsMuestra = 0;
  private fpsT = 0;

  onLedger?: () => void; // hook opcional (futuro)

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.movil =
      typeof navigator !== "undefined" &&
      (navigator.maxTouchPoints > 0 || /Mobi|Android/i.test(navigator.userAgent));
    this.dprCap = this.movil ? 1.25 : 1.6;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !this.movil,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setClearColor(0x02040a, 1);
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);

    this.camara = new THREE.PerspectiveCamera(
      62,
      window.innerWidth / window.innerHeight,
      0.05,
      900
    );
    this.camara.position.set(0, 0, 9);

    this.cargarFuentes();
    this.escuchar();
    this.reloj.start();
    this.bucle();
  }

  // ── FUENTES ──────────────────────────────────────────────
  /** Parse síncrono de la typeface embebida; reserva vía red si hiciera falta. */
  private cargarFuentes() {
    try {
      this.font = new FontLoader().parse(
        rajdhaniJson as unknown as Parameters<FontLoader["parse"]>[0]
      );
    } catch (e) {
      console.warn("[v2] typeface embebida fallo:", e instanceof Error ? e.message : e);
    }
    if (!this.font) {
      // rescate por red (helvetiker) — mejor que bloques
      fetch("/assets/fonts/helvetiker_bold.typeface.json")
        .then((r) => r.json())
        .then((d) => {
          this.font = new FontLoader().parse(d);
          if (this.mundo && this.ctorActual) this.establecerMundo(this.ctorActual, this.keyActual);
        })
        .catch(() => console.warn("[v2] sin typeface — las letras nacen de bloques"));
      return;
    }
    fetch("/assets/fonts/helvetiker_bold.typeface.json")
      .then((r) => r.json())
      .then((d) => {
        this.fontReserva = new FontLoader().parse(d);
      })
      .catch(() => { /* la reserva es opcional */ });
  }

  get fuenteLista(): boolean {
    return !!this.font;
  }

  // ── MATERIALES COMPARTIDOS ───────────────────────────────
  mat(nombre: string): THREE.Material {
    let m = this.mats.get(nombre);
    if (m) return m;
    switch (nombre) {
      case "texto":
        m = new THREE.MeshStandardMaterial({ color: 0xf2f6ff, emissive: 0x8fb4ff, emissiveIntensity: 0.8, metalness: 0.4, roughness: 0.3 });
        break;
      case "oro":
        m = new THREE.MeshStandardMaterial({ color: 0xffc84d, emissive: 0xff9d00, emissiveIntensity: 0.5, metalness: 0.85, roughness: 0.22 });
        break;
      case "cian":
        m = new THREE.MeshStandardMaterial({ color: 0x6ff2ff, emissive: 0x18c8ff, emissiveIntensity: 0.6, metalness: 0.5, roughness: 0.25 });
        break;
      case "verde":
        m = new THREE.MeshStandardMaterial({ color: 0x7dffb0, emissive: 0x1fce6a, emissiveIntensity: 0.55, metalness: 0.4, roughness: 0.3 });
        break;
      case "rojo":
        m = new THREE.MeshStandardMaterial({ color: 0xff7d7d, emissive: 0xe02424, emissiveIntensity: 0.55, metalness: 0.4, roughness: 0.3 });
        break;
      case "violeta":
        m = new THREE.MeshStandardMaterial({ color: 0xd0a3ff, emissive: 0x8a3cff, emissiveIntensity: 0.55, metalness: 0.5, roughness: 0.3 });
        break;
      case "cristal":
        m = new THREE.MeshStandardMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.16, metalness: 0.2, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false });
        break;
      case "cristalOro":
        m = new THREE.MeshStandardMaterial({ color: 0xffd98a, transparent: true, opacity: 0.2, metalness: 0.3, roughness: 0.12, side: THREE.DoubleSide, depthWrite: false });
        break;
      case "cristalOscuro":
        m = new THREE.MeshStandardMaterial({ color: 0x0a1428, transparent: true, opacity: 0.55, metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide });
        break;
      case "malla":
        m = new THREE.MeshBasicMaterial({ color: 0x2a6a9a, wireframe: true, transparent: true, opacity: 0.35 });
        break;
      case "mallaCian":
        m = new THREE.MeshBasicMaterial({ color: 0x38e0ff, wireframe: true, transparent: true, opacity: 0.4 });
        break;
      case "punto":
        m = new THREE.PointsMaterial({ color: 0xbfe4ff, size: 0.045, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
        break;
      case "puntoOro":
        m = new THREE.PointsMaterial({ color: 0xffd27a, size: 0.06, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
        break;
      case "nucleo":
        m = new THREE.MeshStandardMaterial({ color: 0x12325a, emissive: 0x0d4a7a, emissiveIntensity: 0.7, metalness: 0.7, roughness: 0.3 });
        break;
      case "placa":
        m = new THREE.MeshStandardMaterial({ color: 0x071527, emissive: 0x0c2f55, emissiveIntensity: 0.35, metalness: 0.6, roughness: 0.4, transparent: true, opacity: 0.92 });
        break;
      default:
        m = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    }
    this.mats.set(nombre, m);
    return m;
  }

  // ── CONSTRUCTORES 3D DE ALTO NIVEL ───────────────────────
  /** Letras 3D extruidas centradas; si la fuente no llegó, bloques de rescate. */
  texto3D(
    padre: THREE.Object3D,
    txt: string,
    op: {
      tam?: number; prof?: number; mat?: string; pos?: THREE.Vector3;
      rotX?: number; rotY?: number; max?: number; curve?: number;
    } = {}
  ): THREE.Mesh {
    const tam = op.tam ?? 0.3;
    const prof = op.prof ?? tam * 0.28;
    const contenido = op.max ? acotar(txt, op.max) : seguro(txt);
    const g = this.geometriaTexto(contenido, tam, prof, op.curve ?? 3);
    const mesh = new THREE.Mesh(g, this.mat(op.mat ?? "texto"));
    if (op.pos) mesh.position.copy(op.pos);
    if (op.rotX) mesh.rotation.x = op.rotX;
    if (op.rotY) mesh.rotation.y = op.rotY;
    padre.add(mesh);
    return mesh;
  }

  /** TextGeometry (fuente) o rescate por bloques si no hay fuente. */
  private geometriaTexto(txt: string, tam: number, prof: number, curve: number): THREE.BufferGeometry {
    const f = this.font ?? this.fontReserva;
    if (f && txt.length > 0) {
      const g = new TextGeometry(txt, {
        font: f,
        size: tam,
        depth: prof,
        curveSegments: curve,
        bevelEnabled: tam > 0.14,
        bevelThickness: tam * 0.04,
        bevelSize: tam * 0.03,
        bevelSegments: 2,
      });
      g.computeBoundingBox();
      const bb = g.boundingBox!;
      const cx = (bb.max.x + bb.min.x) / 2;
      const cy = (bb.max.y + bb.min.y) / 2;
      g.translate(-cx, -cy, -prof / 2);
      return g;
    }
    // RESCATE: bloques que insinúan la palabra (el mundo jamás queda mudo)
    const grupo = new THREE.Group();
    const n = Math.max(3, Math.min(txt.length, 18));
    const g = new THREE.BoxGeometry(tam * n * 0.62, tam, prof);
    void grupo;
    return g;
  }

  /** Placa holográfica (caja fina) con marco. */
  placa3D(padre: THREE.Object3D, w: number, h: number, matNombre: string, pos?: THREE.Vector3): THREE.Mesh {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.022), this.mat(matNombre));
    if (pos) m.position.copy(pos);
    padre.add(m);
    return m;
  }

  /** Botón 3D tocable: placa + texto + userData.accion. */
  boton3D(
    padre: THREE.Object3D,
    texto: string,
    accion: string,
    op: { w?: number; h?: number; matTexto?: string; matPlaca?: string; tam?: number; pos?: THREE.Vector3 } = {}
  ): THREE.Group {
    const w = op.w ?? 0.72;
    const h = op.h ?? 0.2;
    const g = new THREE.Group();
    this.placa3D(g, w, h, op.matPlaca ?? "cristal");
    const marco = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.03, h + 0.03, 0.012),
      this.mat("mallaCian")
    );
    marco.position.z = -0.008;
    g.add(marco);
    const t = this.texto3D(g, texto, { tam: op.tam ?? h * 0.42, mat: op.matTexto ?? "texto", prof: (op.tam ?? h * 0.42) * 0.25 });
    g.userData.accion = accion;
    if (op.pos) g.position.copy(op.pos);
    padre.add(g);
    this.registrarPickable(g);
    return g;
  }

  /** Nuevo array de pickables para el mundo que va a nacer. */
  nuevoPickables(): THREE.Object3D[] {
    this.pickablesObjetivo = [];
    return this.pickablesObjetivo;
  }

  /** Registra un objeto tocable en el mundo actual. */
  registrarPickable(o: THREE.Object3D) {
    this.pickablesObjetivo.push(o);
  }

  /** Campo de estrellas propio de cada mundo. */
  cielo(escena: THREE.Scene, op: { n?: number; radio?: number; tinte?: number } = {}): THREE.Points {
    const n = op.n ?? (this.movil ? 700 : 1400);
    const radio = op.radio ?? 70;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const base = new THREE.Color(op.tinte ?? 0x9fc8ff);
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(radio * (0.35 + Math.random() * 0.65));
      pos.set([v.x, v.y, v.z], i * 3);
      const c = base.clone().multiplyScalar(0.5 + Math.random() * 0.5);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    escena.add(p);
    return p;
  }

  /** Anillo de frases girando alrededor de un eje. */
  anilloFrases(padre: THREE.Object3D, frases: string[], radio: number, matNombre = "cian", tam = 0.14): THREE.Group {
    const g = new THREE.Group();
    const paso = (Math.PI * 2) / frases.length;
    frases.forEach((f, i) => {
      const m = this.texto3D(g, f, { tam, prof: tam * 0.2, mat: matNombre, max: 42 });
      const a = i * paso;
      m.position.set(Math.cos(a) * radio, 0, Math.sin(a) * radio);
      m.rotation.y = -a + Math.PI / 2;
    });
    padre.add(g);
    return g;
  }

  /** Barra volumétrica (progreso, %, riesgo). */
  barraVolumen(padre: THREE.Object3D, frac: number, w: number, h: number, matNombre: string, pos?: THREE.Vector3): THREE.Group {
    const g = new THREE.Group();
    const fondo = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), this.mat("cristalOscuro"));
    g.add(fondo);
    const f = THREE.MathUtils.clamp(frac, 0.001, 1);
    const lleno = new THREE.Mesh(new THREE.BoxGeometry(w * f, h * 0.92, 0.045), this.mat(matNombre));
    lleno.position.x = -(w * (1 - f)) / 2;
    g.add(lleno);
    if (pos) g.position.copy(pos);
    padre.add(g);
    return g;
  }

  // ── MUNDOS ───────────────────────────────────────────────
  /** Reemplaza el mundo actual (despieza el viejo). Vuelo warp opcional. */
  irA(ctor: ConstructorMundo, key: string, warp = true) {
    if (this.warpActivo > 0) return; // ya viajando
    if (warp) {
      this.colaMundo = { ctor, key };
      this.warpActivo = 0.0001;
      this.prepararWarp();
      return;
    }
    this.establecerMundo(ctor, key);
  }

  private establecerMundo(ctor: ConstructorMundo, key: string) {
    if (this.grupoWarp.parent) this.grupoWarp.parent.remove(this.grupoWarp);
    if (this.mundo) this.despiezar(this.mundo);
    this.ctorActual = ctor;
    this.keyActual = key;
    this.fuenteAlConstruir = !!this.font;
    this.nuevoPickables(); // los botones del mundo nacen aquí dentro
    const m = ctor(this);
    m.key = key;
    m.pickables = this.pickablesObjetivo;
    this.mundo = m;
    this.camara.position.copy(m.camaraPos);
    this.miraObjetivo.copy(m.camaraMira);
    this.yaw = Math.atan2(m.camaraPos.x - m.camaraMira.x, m.camaraPos.z - m.camaraMira.z);
    this.pitch = 0;
    this.vel.set(0, 0, 0);
    this.transicionMira = 1.2; // la mira viaja suave al corazón del mundo
    this.aplicarCamara();
    this.renderer.render(m.escena, this.camara); // PRIMER FRAME INMEDIATO
  }

  private despiezar(m: MundoV2) {
    m.escena.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      // los materiales son compartidos: se conservan
    });
    m.escena.clear();
  }

  // ── WARP (hiperespacio entre mundos) ────────────────────
  private prepararWarp() {
    if (this.grupoWarp.children.length) return;
    const n = this.movil ? 220 : 420;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.4 + Math.random() * 3.2;
      pos.set([Math.cos(a) * r, Math.sin(a) * r, -Math.random() * 40], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9fe8ff, size: 0.09, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.grupoWarp.add(p);
  }

  private tickWarp(dt: number) {
    if (this.warpActivo <= 0) return;
    this.warpActivo += dt * 1.6;
    const pts = this.grupoWarp.children[0] as THREE.Points;
    const pos = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      let z = pos.getZ(i) + dt * 60;
      if (z > 2) z = -40;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    const mitad = this.warpActivo >= 0.5;
    if (mitad && this.colaMundo) {
      const { ctor, key } = this.colaMundo;
      this.colaMundo = null;
      this.establecerMundo(ctor, key);
    }
    // el warp vive en la escena activa durante el viaje
    if (this.mundo && this.grupoWarp.parent !== this.mundo.escena) {
      this.mundo.escena.add(this.grupoWarp);
    }
    this.grupoWarp.visible = true;
    if (this.warpActivo >= 1.15) {
      this.warpActivo = 0;
      this.grupoWarp.visible = false;
    }
  }

  // ── ENTRADA ──────────────────────────────────────────────
  private escuchar() {
    const c = this.canvas;
    window.addEventListener("resize", this.alRedimensionar);
    document.addEventListener("visibilitychange", this.alVisibilidad);
    window.addEventListener("keydown", this.alTecla);
    window.addEventListener("keyup", this.alTeclaSuelta);
    c.addEventListener("pointerdown", this.alPunteroAbajo);
    c.addEventListener("pointermove", this.alPunteroMueve);
    c.addEventListener("pointerup", this.alPunteroArriba);
    c.addEventListener("pointercancel", this.alPunteroArriba);
    c.addEventListener("wheel", this.alRueda, { passive: true });
    c.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  private alRedimensionar = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camara.aspect = w / h;
    this.camara.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  };

  private alVisibilidad = () => {
    this.activo = !document.hidden;
    if (this.activo) {
      this.reloj.getDelta(); // limpia el delta acumulado
      this.bucle();
    } else if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  };

  private alTecla = (e: KeyboardEvent) => {
    this.teclas.add(e.code);
  };
  private alTeclaSuelta = (e: KeyboardEvent) => {
    this.teclas.delete(e.code);
  };

  private alPunteroAbajo = (e: PointerEvent) => {
    this.canvas.setPointerCapture(e.pointerId);
    const t: ToqueActivo = { id: e.pointerId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: performance.now() };
    const ahora = performance.now();
    if (ahora - this.ultimoTapT < 300 && this.toques.size === 0) {
      this.empujeDoble = true; // doble toque mantenido = avanzar
      setTimeout(() => (this.empujeDoble = false), 900);
    }
    this.ultimoTapT = ahora;
    this.toques.set(e.pointerId, t);
  };

  private alPunteroMueve = (e: PointerEvent) => {
    const t = this.toques.get(e.pointerId);
    if (!t) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    t.x = e.clientX;
    t.y = e.clientY;
    const dedos = this.toques.size;
    if (dedos === 1) {
      // un dedo: mirar (inercia)
      this.velMirada.yaw = -dx * 0.0028;
      this.velMirada.pitch = -dy * 0.0026;
      this.yaw += this.velMirada.yaw;
      this.pitch = THREE.MathUtils.clamp(this.pitch + this.velMirada.pitch, -1.25, 1.25);
    } else if (dedos >= 2) {
      // dos dedos: deslizar = volar lateral/vertical
      this.vel.x += -dx * 0.004 * dtSeg();
      this.vel.y += dy * 0.004 * dtSeg();
    }
  };

  private alPunteroArriba = (e: PointerEvent) => {
    const t = this.toques.get(e.pointerId);
    if (!t) return;
    this.toques.delete(e.pointerId);
    if (this.toques.size === 0) this.empujeDoble = false;
    const dist = Math.hypot(t.x - t.x0, t.y - t.y0);
    const dur = performance.now() - t.t0;
    this.diag.tapValidos++;
    this.diag.ultimoTap = { dist: Math.round(dist * 10) / 10, dur: Math.round(dur) };
    if (dist < 14 && dur < 700) this.seleccionar(t.x, t.y);
  };

  /** Contadores de diagnóstico (QA en vivo). */
  diag: { tapValidos: number; seleccion: number; rayHits: number; ultimoTap: { dist: number; dur: number } } = {
    tapValidos: 0,
    seleccion: 0,
    rayHits: 0,
    ultimoTap: { dist: 0, dur: 0 },
  };

  private alRueda = (e: WheelEvent) => {
    if (!this.mundo) return;
    const dir = this.direccionMira();
    this.vel.addScaledVector(dir, -e.deltaY * 0.004);
  };

  /** Raycast de selección (tap). */
  private seleccionar(px: number, py: number) {
    this.diag.seleccion++;
    if (!this.mundo || this.warpActivo > 0) return;
    // poda de pickables muertos (grupos reconstruidos ya sin padre)
    if (this.mundo.pickables.some((p) => !p.parent)) {
      this.mundo.pickables = this.mundo.pickables.filter((p) => p.parent);
      this.pickablesObjetivo = this.mundo.pickables;
    }
    this.ndc.set((px / window.innerWidth) * 2 - 1, -(py / window.innerHeight) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camara);
    const hits = this.raycaster.intersectObjects(this.mundo.pickables, true);
    this.diag.rayHits = hits.length;
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object;
      while (o && !o.userData.accion) o = o.parent;
      if (o?.userData.accion) {
        const a = String(o.userData.accion);
        // navegación central (los botones VOLVER/INDICE de baseMundo)
        if (a === "volver") { this.navegar?.("inicio"); return; }
        if (a === "indice") { this.navegar?.("todas"); return; }
        this.mundo.accion?.(a, o);
        return;
      }
    }
  }

  private direccionMira(): THREE.Vector3 {
    const d = new THREE.Vector3();
    this.camara.getWorldDirection(d);
    return d;
  }

  // ── VUELO ────────────────────────────────────────────────
  private volar(dt: number) {
    const boost = this.teclas.has("ShiftLeft") || this.teclas.has("ShiftRight") ? 2.1 : 1;
    const a = 14 * dt;
    const fwd = this.direccionMira();
    const der = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    if (this.teclas.has("KeyW") || this.teclas.has("ArrowUp")) this.vel.addScaledVector(fwd, a * boost);
    if (this.teclas.has("KeyS") || this.teclas.has("ArrowDown")) this.vel.addScaledVector(fwd, -a * boost);
    if (this.teclas.has("KeyD") || this.teclas.has("ArrowRight")) this.vel.addScaledVector(der, a * boost);
    if (this.teclas.has("KeyA") || this.teclas.has("ArrowLeft")) this.vel.addScaledVector(der, -a * boost);
    if (this.teclas.has("KeyE") || this.teclas.has("Space")) this.vel.y += a * boost;
    if (this.teclas.has("KeyQ") || this.teclas.has("KeyC")) this.vel.y -= a * boost;
    if (this.empujeDoble) this.vel.addScaledVector(fwd, a * 1.4);
    // inercia + freno
    const freno = Math.pow(0.14, dt);
    this.vel.multiplyScalar(freno);
    const vmax = 12;
    if (this.vel.length() > vmax) this.vel.setLength(vmax);
    this.camara.position.addScaledVector(this.vel, dt);
    // límites que deslizan (lección v149: muere solo el componente)
    const p = this.camara.position;
    const r = Math.hypot(p.x, p.z);
    const RMAX = 46;
    if (r > RMAX) {
      const f = RMAX / r;
      p.x *= f;
      p.z *= f;
      this.vel.x *= 0.2;
      this.vel.z *= 0.2;
    }
    if (p.y > 26) { p.y = 26; this.vel.y = Math.min(0, this.vel.y); }
    if (p.y < -14) { p.y = -14; this.vel.y = Math.max(0, this.vel.y); }
    // inercia de mirada
    this.yaw += this.velMirada.yaw * 0.4;
    this.pitch = THREE.MathUtils.clamp(this.pitch + this.velMirada.pitch * 0.4, -1.25, 1.25);
    this.velMirada.yaw *= Math.pow(0.02, dt);
    this.velMirada.pitch *= Math.pow(0.02, dt);
  }

  // ── BUCLE ────────────────────────────────────────────────
  private bucle = () => {
    this.raf = 0;
    if (!this.activo) return;
    this.raf = requestAnimationFrame(this.bucle);
    const dt = Math.min(this.reloj.getDelta(), 0.05);
    const t = this.reloj.elapsedTime;

    if (this.mundo) {
      if (this.transicionMira > 0) {
        // la cámara viaja suave a la pose del mundo nuevo
        this.transicionMira -= dt;
        const k = Math.min(1, 1 - this.transicionMira / 1.2);
        const destino = this.mundo.camaraMira;
        const mirando = new THREE.Vector3();
        this.camara.getWorldDirection(mirando).add(this.camara.position);
        mirando.lerp(destino, dt * 3.2);
        const q = new THREE.Quaternion();
        const m = new THREE.Matrix4().lookAt(this.camara.position, mirando, new THREE.Vector3(0, 1, 0));
        q.setFromRotationMatrix(m);
        const euler = new THREE.Euler().setFromQuaternion(q, "YXZ");
        this.yaw = euler.y;
        this.pitch = THREE.MathUtils.clamp(euler.x, -1.25, 1.25);
        void k;
        if (this.transicionMira <= 0) this.velMirada.yaw = 0;
      } else {
        this.volar(dt);
      }
      this.aplicarCamara();
      this.mundo.tick?.(t, dt);
    }

    this.tickWarp(dt);
    if (this.mundo) this.renderer.render(this.mundo.escena, this.camara);

    // gobernador de FPS (lección v149)
    this.fpsMuestra++;
    this.fpsT += dt;
    if (this.fpsT >= 1.6) {
      const fps = this.fpsMuestra / this.fpsT;
      this.fpsMuestra = 0;
      this.fpsT = 0;
      if (fps < 38 && this.dpr > 0.6) {
        this.dpr = Math.max(0.6, this.dpr - 0.15);
        this.renderer.setPixelRatio(this.dpr);
      } else if (fps > 56 && this.dpr < this.dprCap) {
        this.dpr = Math.min(this.dprCap, this.dpr + 0.1);
        this.renderer.setPixelRatio(this.dpr);
      }
    }
  };

  private aplicarCamara() {
    const e = new THREE.Euler(this.pitch, this.yaw, 0, "YXZ");
    this.camara.quaternion.setFromEuler(e);
  }

  destruir() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.activo = false;
    window.removeEventListener("resize", this.alRedimensionar);
    document.removeEventListener("visibilitychange", this.alVisibilidad);
    window.removeEventListener("keydown", this.alTecla);
    window.removeEventListener("keyup", this.alTeclaSuelta);
    this.canvas.removeEventListener("pointerdown", this.alPunteroAbajo);
    this.canvas.removeEventListener("pointermove", this.alPunteroMueve);
    this.canvas.removeEventListener("pointerup", this.alPunteroArriba);
    this.canvas.removeEventListener("pointercancel", this.alPunteroArriba);
    this.canvas.removeEventListener("wheel", this.alRueda);
    if (this.mundo) this.despiezar(this.mundo);
    this.mats.forEach((m) => m.dispose());
    this.renderer.dispose();
  }
}

// delta de un frame aproximado para gestos (suficiente para inercia)
let _ultimoT = 0;
function dtSeg(): number {
  const ahora = performance.now();
  const dt = Math.min((ahora - _ultimoT) / 1000, 0.05) || 0.016;
  _ultimoT = ahora;
  return dt;
}
