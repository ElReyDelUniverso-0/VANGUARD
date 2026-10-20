"use client";

// ============================================================
// v145.0 SALAS EN VOLUMEN — EL CONTENIDO 3D REAL
// Mandato del Dueño: «cuando entro a cualquier rama de Vanguard,
// TODO es 3D — el gráfico de la economía 3D, las letras 3D, el
// estudio de memes 3D, la sala de conflictos 3D». No es el
// universo ni un mapa: es EL CONTENIDO YA CONSTRUIDO viviendo
// en volumen. Este módulo es la FÁBRICA de esas salas.
//
//   · ECONOMÍA (bolsa · mercados · hacienda · divisas):
//     velas japonesas REALES como cajas 3D con mechas naciendo
//     de una base holográfica, ticker extruido con símbolo +
//     precio + cambio, monedas de oro girando.
//   · SALA DE CONFLICTOS (crisis · salaguerra): mesa de mando
//     holográfica, la crisis flotando en letras extruidas, las
//     opciones A·B·C·D como placas 3D TOCABLES — se vota desde
//     dentro del mundo.
//   · ESTUDIO DE MEMES: la galería como arco de hologramas —
//     el caption de cada meme en LETRAS 3D, las bolas del elenco
//     como esferas reales, contador de likes volumétrico.
//   · TODAS LAS DEMÁS SALAS: placa de título extruida + arco
//     holográfico + partículas de acento — toda rama tiene
//     presencia volumétrica real desde el segundo uno.
//
// Protocolo Casa ⇄ Mundo (eventos window):
//   vg:sala3d       {tab, titulo, tipo, color}  → montar/cambiar sala
//   vg:sala3d-datos {tab, ...payload}           → datos vivos (sin remontar)
//   vg:sala3d-accion {tab, accion, idx}         → el 3D manda a la sala DOM
// ============================================================
import * as THREE from "three";
import { type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { TextureLoader } from "three/examples/jsm/loaders/TextureLoader.js";

// ────────────────────────────────────────────────────────────
// TIPOS DEL PROTOCOLO
// ────────────────────────────────────────────────────────────
export type TipoSala3D =
  | "economia"
  | "conflictos"
  | "memes"
  | "noticias"
  | "quiz"
  | "votaciones"
  | "perfil"
  | "generica";

export interface BaseSala3D {
  tab: string;
  titulo: string;
  color: number;
  tipo: TipoSala3D;
}
export interface SalaEconomia3D extends BaseSala3D {
  tipo: "economia";
  velas: { o: number; h: number; l: number; c: number }[];
  simbolo: string;
  precio: string;
  cambio: string;
  sube: boolean;
}
export interface SalaConflictos3D extends BaseSala3D {
  tipo: "conflictos";
  id: string;
  crisis: string;
  region: string;
  opciones: string[];
  votos: number[];
  votada: number | null;
}
export interface SalaMemes3D extends BaseSala3D {
  tipo: "memes";
  memes: { caption: string; autor: string; likes: number; bg: string; bolas: string[]; textos: string[] }[];
}
// v146 ÓRBITA DE NOTICIAS — los cables REALES como hologramas, ahora CON
// SU IMAGEN como plano texturizado (v147: las imágenes también son 3D)
export interface SalaNoticias3D extends BaseSala3D {
  tipo: "noticias";
  noticias: { titulo: string; fuente: string; edad: string; tag: string; color: string; img?: string }[];
}
// v145.1 EXAMEN HOLOGRÁFICO — la pregunta y las respuestas A·D en volumen
export interface SalaQuiz3D extends BaseSala3D {
  tipo: "quiz";
  categoria: string;
  dificultad: string;
  pregunta: string;
  opciones: string[];
  correcta: number | null;
  seleccionada: number | null;
  revelada: boolean;
  aciertos: number;
  total: number;
}
// v145.1 PORTAL DE VOTO — encuestas con barras de volumen tocables
export interface SalaVotaciones3D extends BaseSala3D {
  tipo: "votaciones";
  pregunta: string;
  opciones: string[];
  votos: number[];
  votada: number | null;
  indice: number;
  total: number;
}
// v145.1 NÚCLEO DEL AGENTE — el avatar, el nivel y el botín en volumen
export interface SalaPerfil3D extends BaseSala3D {
  tipo: "perfil";
  nombre: string;
  nivel: number;
  xp: number;
  monedas: number;
  gemas: number;
  racha: number;
}
export interface SalaGenerica3D extends BaseSala3D {
  tipo: "generica";
}
export type PayloadSala3D =
  | SalaEconomia3D
  | SalaConflictos3D
  | SalaMemes3D
  | SalaNoticias3D
  | SalaQuiz3D
  | SalaVotaciones3D
  | SalaPerfil3D
  | SalaGenerica3D;

// la instancia viva de una sala montada en el mundo
export interface Sala3DInstancia {
  grupo: THREE.Group;
  proxies: THREE.Mesh[];
  actualizar: (p: PayloadSala3D) => void;
  tic: (t: number, dt: number) => void;
  liberar: () => void;
}

// contexto que presta el mundo (fuente, tweens, calidad)
export interface CtxSala3D {
  fuente: Font;
  calidadBaja: boolean;
  movil: boolean; // v145.1: el desplazamiento derecho solo existe en escritorio
  animarP: (
    obj: Record<string, number> | THREE.Vector3 | THREE.Material | { opacity: number },
    to: Record<string, number>,
    ms: number,
    opts?: { ease?: (t: number) => number; onUpdate?: () => void; onDone?: () => void },
  ) => void;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// la fuente typeface no trae acentos: como un HUD militar, se caen
function sanitizar(t: string): string {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

// ────────────────────────────────────────────────────────────
// MATERIALES — la piel del holograma (misma estética del mundo:
// metal oscuro + filo de neón + oro de la Casa)
// ────────────────────────────────────────────────────────────
const COL_VERDE = 0x3ddc84;
const COL_ROJO = 0xff4d5e;
const COL_ORO = 0xf5c542;

function matMetal(color = 0x141d2e) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: 0.34 });
}
function matFilo(color: number, op = 0.9) {
  return new THREE.LineBasicMaterial({ color, transparent: true, opacity: op });
}
function filos(mesh: THREE.Mesh, color: number, op = 0.9) {
  return new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 24), matFilo(color, op));
}
function matVela(sube: boolean) {
  return new THREE.MeshStandardMaterial({
    color: sube ? COL_VERDE : COL_ROJO,
    emissive: new THREE.Color(sube ? COL_VERDE : COL_ROJO),
    emissiveIntensity: 0.55,
    metalness: 0.4,
    roughness: 0.3,
    transparent: true,
    opacity: 0.94,
  });
}

// texto extruido — cada glifo con volumen real (letras de la sala)
function texto3D(
  ctx: CtxSala3D,
  texto: string,
  o: { tam: number; prof: number; color: number; emis: number },
): { grupo: THREE.Group; ancho: number; mats: THREE.MeshStandardMaterial[] } {
  const grupo = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: o.color,
    metalness: 0.78,
    roughness: 0.3,
    emissive: new THREE.Color(o.color),
    emissiveIntensity: o.emis,
    transparent: true,
    opacity: 1,
  });
  const mats: THREE.MeshStandardMaterial[] = [mat];
  let cursor = 0;
  for (const crudo of sanitizar(texto)) {
    if (crudo === " ") { cursor += o.tam * 0.55; continue; }
    let geo: TextGeometry | null = null;
    try {
      geo = new TextGeometry(crudo, {
        font: ctx.fuente,
        size: o.tam,
        depth: o.prof,
        curveSegments: ctx.calidadBaja ? 3 : 5,
        bevelEnabled: false,
      });
    } catch { continue; }
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const w = Math.max(0.001, bb.max.x - bb.min.x);
    geo.translate(-bb.min.x - w / 2, -(bb.max.y + bb.min.y) / 2, -o.prof / 2);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cursor + w / 2, 0, 0);
    grupo.add(mesh);
    cursor += w + o.tam * 0.13;
  }
  return { grupo, ancho: Math.max(cursor - o.tam * 0.13, 0.001), mats };
}

// placa holográfica — el soporte de vidrio con filo de neón
function placaHolo(w: number, h: number, color: number): { cuerpo: THREE.Mesh; borde: THREE.LineSegments } {
  const cuerpo = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 0.022),
    new THREE.MeshStandardMaterial({
      color: 0x0c1526,
      metalness: 0.9,
      roughness: 0.22,
      transparent: true,
      opacity: 0.82,
    }),
  );
  const borde = filos(cuerpo, color, 0.95);
  return { cuerpo, borde };
}

// pedestal — el disco del que nace la sala
function pedestal(r: number, color: number): THREE.Group {
  const g = new THREE.Group();
  const disco = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.06, 0.035, 42), matMetal(0x101a2c));
  const anillo = new THREE.Mesh(
    new THREE.TorusGeometry(r * 0.94, 0.008, 8, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  anillo.rotation.x = Math.PI / 2;
  anillo.position.y = 0.02;
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(r * 0.7, r * 0.98, 42),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.03;
  g.add(disco, anillo, halo);
  return g;
}

// partículas ascendentes — el polvo dorado del holograma
function polvo(n: number, color: number, radio: number, altura: number): THREE.Points {
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = radio * (0.3 + Math.random() * 0.7);
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.random() * altura;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    color, size: 0.02, transparent: true, opacity: 0.65,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  }));
}

// acotar — el helvetiker no tiene elipsis: corte honesto
function acotar(s: string, n: number): string {
  const t = (s || "").trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + "." : t;
}

// la textura de RESERVA — portada generada (degradado del tag + inicial de
// la fuente): si la imagen real no cruza CORS, la tarjeta JAMÁS nace vacía
function portadaDeReserva(tag: string, color: string, fuente: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 64;
  const g = c.getContext("2d");
  if (!g) return c;
  const grad = g.createLinearGradient(0, 0, 128, 64);
  grad.addColorStop(0, color || "#1a2a44");
  grad.addColorStop(1, "#0a0f1c");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 64);
  g.fillStyle = "rgba(255,255,255,0.85)";
  g.font = "bold 26px monospace";
  g.fillText((fuente || tag || "V").trim().charAt(0).toUpperCase(), 54, 42);
  g.strokeStyle = "rgba(255,255,255,0.25)";
  g.strokeRect(2, 2, 124, 60);
  return c;
}

// la IMAGEN 3D — plano texturizado con la foto real del cable (si CORS
// la cruza) o la portada generada: las imágenes de Vanguard viven EN el espacio
function planoImagen3D(url: string, tag: string, color: string, fuente: string, w: number, h: number): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(w, h);
  const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.96 });
  const mesh = new THREE.Mesh(geo, mat);
  const pintarReserva = () => {
    const tex = new THREE.CanvasTexture(portadaDeReserva(tag, color, fuente));
    mat.map = tex;
    mat.needsUpdate = true;
  };
  try {
    new TextureLoader().setCrossOrigin("anonymous").load(
      url,
      (tex) => { mat.map = tex; mat.needsUpdate = true; },
      undefined,
      () => pintarReserva(),
    );
  } catch { pintarReserva(); }
  return mesh;
}

// mono de la instancia — registro de tweens/geos para liberar
function registrar() {
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  return {
    geo<T extends THREE.BufferGeometry>(g: T): T { geos.push(g); return g; },
    mat<T extends THREE.Material>(m: T): T { mats.push(m); return m; },
    liberar() { for (const g of geos) g.dispose(); for (const m of mats) m.dispose(); },
  };
}

// ────────────────────────────────────────────────────────────
// SALA DE ECONOMÍA — el gráfico 3D real: velas japonesas con
// volumen, mechas, ticker extruido y monedas girando
// ────────────────────────────────────────────────────────────
function construirEconomia(ctx: CtxSala3D, p: SalaEconomia3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const animables: { m: THREE.Object3D; fase: number; y0: number }[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  // EL TÍTULO — la sala firmada en volumen
  const titulo = texto3D(ctx, p.titulo, { tam: 0.155, prof: 0.05, color: p.color, emis: 0.55 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.9, 0);
  grupo.add(titulo.grupo);

  // LA BASE HOLOGRÁFICA del gráfico
  const baseW = 2.5, baseD = 0.6;
  const base = placaHolo(baseW, baseD, p.color);
  base.cuerpo.position.set(0, -0.78, 0);
  base.borde.position.copy(base.cuerpo.position);
  grupo.add(base.cuerpo, base.borde);
  const peana = pedestal(1.55, p.color);
  peana.position.y = -0.81;
  grupo.add(peana);

  // EL GRÁFICO — hasta 26 velas con volumen real
  const contenedorVelas = new THREE.Group();
  contenedorVelas.position.set(-baseW / 2 + 0.16, -0.75, 0);
  grupo.add(contenedorVelas);
  let cuerpoVelas: THREE.Group | null = null;

  const pintarVelas = (velas: { o: number; h: number; l: number; c: number }[]) => {
    if (cuerpoVelas) {
      contenedorVelas.remove(cuerpoVelas);
      cuerpoVelas.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      cuerpoVelas = null;
    }
    cuerpoVelas = new THREE.Group();
    const datos = (velas || []).slice(-26);
    if (!datos.length) {
      contenedorVelas.add(cuerpoVelas);
      return;
    }
    let min = Infinity, max = -Infinity;
    for (const v of datos) { min = Math.min(min, v.l); max = Math.max(max, v.h); }
    const rango = Math.max(max - min, 1e-9);
    const paso = (baseW - 0.32) / datos.length;
    const anchoV = Math.min(paso * 0.62, 0.085);
    datos.forEach((v, i) => {
      const sube = v.c >= v.o;
      // mecha — la línea del rango alto/bajo
      const altoTotal = ((v.h - v.l) / rango) * 1.34;
      const mecha = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(anchoV * 0.16, Math.max(altoTotal, 0.012), anchoV * 0.16)),
        reg.mat(new THREE.MeshBasicMaterial({ color: sube ? COL_VERDE : COL_ROJO, transparent: true, opacity: 0.75 })),
      );
      const yMecha = ((v.h + v.l) / 2 - min) / rango * 1.34;
      mecha.position.set(i * paso + paso / 2, yMecha, 0);
      // cuerpo — la caja open/close con volumen
      const yA = ((v.h - Math.max(v.o, v.c)) / rango) * 1.34;
      const hCuerpo = Math.max((Math.abs(v.c - v.o) / rango) * 1.34, 0.014);
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(anchoV, hCuerpo, anchoV)),
        reg.mat(matVela(sube)),
      );
      cuerpo.position.set(i * paso + paso / 2, yA + hCuerpo / 2, 0);
      const filo = new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(sube ? COL_VERDE : COL_ROJO, 0.5)));
      filo.position.copy(cuerpo.position);
      // nacimiento escalonado — el gráfico CRECE ante el piloto
      cuerpo.scale.y = 0.001;
      mecha.scale.y = 0.001;
      const dif = { s: 0.001 };
      window.setTimeout(() => {
        ctx.animarP(dif, { s: 1 }, 460, {
          ease: easeOut,
          onUpdate: () => { cuerpo.scale.y = Math.max(dif.s, 0.001); mecha.scale.y = Math.max(dif.s, 0.001); },
        });
      }, 90 + i * 26);
      cuerpoVelas!.add(mecha, cuerpo, filo);
    });
    contenedorVelas.add(cuerpoVelas);
  };
  pintarVelas(p.velas);

  // EL TICKER — símbolo, precio y cambio en letras extruidas
  const ticker = texto3D(ctx, [p.simbolo, p.precio].filter(Boolean).join(" "), { tam: 0.12, prof: 0.04, color: COL_ORO, emis: 0.6 });
  ticker.grupo.position.set(-ticker.ancho / 2, -0.42, 0.02);
  grupo.add(ticker.grupo);
  const cambio = texto3D(ctx, p.cambio || "", { tam: 0.1, prof: 0.035, color: p.sube ? COL_VERDE : COL_ROJO, emis: 0.6 });
  cambio.grupo.position.set(0.72, -0.42, 0.03);
  grupo.add(cambio.grupo);

  // LAS MONEDAS — oro girando alrededor del gráfico
  const monedas: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const moneda = new THREE.Mesh(
      reg.geo(new THREE.CylinderGeometry(0.075, 0.075, 0.016, 24)),
      reg.mat(new THREE.MeshStandardMaterial({ color: COL_ORO, metalness: 0.95, roughness: 0.18, emissive: new THREE.Color(0x4a3405), emissiveIntensity: 0.5 })),
    );
    const a = (i / 5) * Math.PI * 2;
    moneda.position.set(Math.cos(a) * 1.62, 0.1 + (i % 3) * 0.28, Math.sin(a) * 0.8);
    moneda.rotation.x = Math.PI / 2;
    grupo.add(moneda);
    monedas.push(moneda);
    animables.push({ m: moneda, fase: a, y0: moneda.position.y });
  }

  // EL POLVO dorado de la sala
  const polvoOro = polvo(ctx.calidadBaja ? 60 : 110, p.color, 1.7, 2.1);
  polvoOro.position.y = -0.78;
  grupo.add(polvoOro);

  tics.push((t, dt) => {
    polvoOro.rotation.y += dt * 0.18;
    for (const a of animables) {
      a.m.rotation.z += dt * 0.85;
      a.m.position.y = a.y0 + Math.sin(t * 1.2 + a.fase) * 0.05;
    }
    (base.borde.material as THREE.LineBasicMaterial).opacity = 0.72 + Math.sin(t * 1.8) * 0.22;
  });

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "economia") return;
      pintarVelas(nuevo.velas);
      // el ticker vive: se repinta entero (barato: pocas letras)
      grupo.remove(ticker.grupo, cambio.grupo);
      ticker.mats.forEach((m) => m.dispose());
      cambio.mats.forEach((m) => m.dispose());
      const nt = texto3D(ctx, `${nuevo.simbolo} ${nuevo.precio}`, { tam: 0.12, prof: 0.04, color: COL_ORO, emis: 0.6 });
      nt.grupo.position.set(-nt.ancho / 2, -0.42, 0.02);
      ticker.grupo = nt.grupo; ticker.ancho = nt.ancho; ticker.mats = nt.mats;
      const nc = texto3D(ctx, nuevo.cambio, { tam: 0.1, prof: 0.035, color: nuevo.sube ? COL_VERDE : COL_ROJO, emis: 0.6 });
      nc.grupo.position.set(0.72, -0.42, 0.03);
      cambio.grupo = nc.grupo; cambio.mats = nc.mats;
      grupo.add(ticker.grupo, cambio.grupo);
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => { reg.liberar(); titulo.mats.forEach((m) => m.dispose()); ticker.mats.forEach((m) => m.dispose()); cambio.mats.forEach((m) => m.dispose()); },
  };
}

// ────────────────────────────────────────────────────────────
// SALA DE CONFLICTOS — la mesa de mando holográfica: la crisis
// en letras extruidas flotando sobre la mesa, las opciones A-D
// como placas 3D TOCABLES (raycast → vg:sala3d-accion) con
// barras de votos que laten
// ────────────────────────────────────────────────────────────
function construirConflictos(ctx: CtxSala3D, p: SalaConflictos3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  // EL TÍTULO de la sala
  const titulo = texto3D(ctx, p.titulo, { tam: 0.15, prof: 0.05, color: p.color, emis: 0.55 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.98, 0);
  grupo.add(titulo.grupo);

  // LA MESA DE MANDO — disco holográfico con anillo de neón
  const mesa = new THREE.Group();
  mesa.position.y = -0.72;
  const disco = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(1.05, 1.12, 0.07, 44)), reg.mat(matMetal(0x101a2c)));
  const anilloMesa = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(1.06, 0.01, 8, 56)),
    reg.mat(new THREE.MeshBasicMaterial({ color: 0xff2d3a, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  anilloMesa.rotation.x = Math.PI / 2;
  anilloMesa.position.y = 0.04;
  const rejilla = new THREE.Mesh(
    reg.geo(new THREE.RingGeometry(0.32, 0.98, 40)),
    reg.mat(new THREE.MeshBasicMaterial({ color: 0xff2d3a, transparent: true, opacity: 0.09, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  rejilla.rotation.x = -Math.PI / 2;
  rejilla.position.y = 0.04;
  mesa.add(disco, anilloMesa, rejilla);
  grupo.add(mesa);

  // LA CRISIS — el título de la crisis flotando sobre la mesa
  let crisisWrap = new THREE.Group();
  const pintarCrisis = (texto: string, region: string) => {
    const tx = (texto || "CRISIS GLOBAL").trim();
    const rg = (region || "").trim();
    grupo.remove(crisisWrap);
    crisisWrap.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
    });
    crisisWrap = new THREE.Group();
    crisisWrap.userData.id = p.id || "";
    // partir en 2 líneas si es larga
    const palabras = tx.split(" ");
    const l1: string[] = [], l2: string[] = [];
    palabras.forEach((w, i) => (i < palabras.length / 2 ? l1 : l2).push(w));
    const lineas = [l1.join(" "), l2.join(" ")].filter(Boolean).slice(0, 2);
    lineas.forEach((ln, i) => {
      const t = texto3D(ctx, ln, { tam: 0.105, prof: 0.035, color: 0xff6b7a, emis: 0.6 });
      t.grupo.position.set(-t.ancho / 2, (lineas.length - 1 - i) * 0.17 + 0.34, 0.05);
      crisisWrap.add(t.grupo);
    });
    if (rg) {
      const reg3 = texto3D(ctx, rg, { tam: 0.075, prof: 0.025, color: COL_ORO, emis: 0.5 });
      reg3.grupo.position.set(-reg3.ancho / 2, -0.06, 0.05);
      crisisWrap.add(reg3.grupo);
    }
    crisisWrap.position.y = 0.02;
    grupo.add(crisisWrap);
  };
  pintarCrisis(p.crisis, p.region);

  // LAS OPCIONES A·D — placas 3D TOCABLES en abanico frente a la mesa
  const contenedorOps = new THREE.Group();
  contenedorOps.position.set(0, -0.16, 0.62);
  grupo.add(contenedorOps);
  const placasOps: { grupo: THREE.Group; mat: THREE.LineBasicMaterial; baseY: number; fase: number; proxy: THREE.Mesh }[] = [];
  const pintarOpciones = (opciones: string[], votos: number[], votada: number | null) => {
    while (contenedorOps.children.length) {
      const c = contenedorOps.children[0];
      contenedorOps.remove(c);
    }
    placasOps.length = 0;
    proxies.length = 0;
    const ops = opciones || [];
    const vts = votos || [];
    const n = Math.min(ops.length, 4);
    const totalVotos = Math.max(1, vts.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0));
    for (let i = 0; i < n; i++) {
      const placa = new THREE.Group();
      const w = 0.62, h = 0.3;
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w, h, 0.02)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: votada === i ? 0x2a1a08 : 0x0c1526,
          metalness: 0.9, roughness: 0.22, transparent: true, opacity: 0.86,
          emissive: new THREE.Color(votada === i ? COL_ORO : 0x000000),
          emissiveIntensity: votada === i ? 0.35 : 0,
        })),
      );
      const borde = new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(votada === i ? COL_ORO : 0x7ab8ff, 0.9)));
      const matBorde = borde.material as THREE.LineBasicMaterial;
      placa.add(cuerpo, borde);
      // LA LETRA de la opción — extruida, real
      const letra = texto3D(ctx, String.fromCharCode(65 + i), { tam: 0.09, prof: 0.03, color: votada === i ? COL_ORO : 0x7ab8ff, emis: 0.6 });
      letra.grupo.position.set(-w / 2 + 0.09, -0.02, 0.02);
      placa.add(letra.grupo);
      // LA BARRA DE VOTOS — volumen proporcional real
      const frac = (vts[i] || 0) / totalVotos;
      const barra = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry((w - 0.3) * Math.max(frac, 0.02), 0.035, 0.012)),
        reg.mat(new THREE.MeshBasicMaterial({ color: COL_ORO, transparent: true, opacity: 0.85 })),
      );
      barra.position.set(-0.02, -h / 2 + 0.07, 0.02);
      placa.add(barra);
      // el núcleo de votos con el número
      const nv = texto3D(ctx, `${Math.round(frac * 100)}%`, { tam: 0.055, prof: 0.02, color: COL_ORO, emis: 0.55 });
      nv.grupo.position.set(w / 2 - 0.11, 0.045, 0.02);
      placa.add(nv.grupo);
      // PROXY invisible-opaco para el dedo (el Raycaster ignora visible:false)
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w + 0.06, h + 0.06, 0.05)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: p.tab, accion: "voto", idx: i } };
      placa.add(proxy);
      proxies.push(proxy);
      // abanico: 4 en fila (2×2 en móvil lo resuelve la escala del grupo)
      const cols = 2;
      const col = i % cols, fila = Math.floor(i / cols);
      placa.position.set((col - 0.5) * (w + 0.14), (0.5 - fila) * (h + 0.12), -fila * 0.06);
      contenedorOps.add(placa);
      placasOps.push({ grupo: placa, mat: matBorde, baseY: placa.position.y, fase: i * 1.4, proxy });
    }
  };
  pintarOpciones(p.opciones, p.votos, p.votada);

  const pulso = polvo(ctx.calidadBaja ? 50 : 90, 0xff2d3a, 1.5, 1.9);
  pulso.position.y = -0.7;
  grupo.add(pulso);

  tics.push((t, dt) => {
    pulso.rotation.y -= dt * 0.22;
    (anilloMesa.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(t * 2.2) * 0.3;
    rejilla.rotation.z += dt * 0.12;
    for (const op of placasOps) {
      op.grupo.position.y = op.baseY + Math.sin(t * 1.5 + op.fase) * 0.012;
    }
    // la crisis flota sobre la mesa
    crisisWrap.position.y = 0.02 + Math.sin(t * 1.1) * 0.016;
  });

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "conflictos") return;
      // la crisis vive cada segundo (los votos respiran): SOLO se repinta
      // cuando la FIRMA cambia — cero churn de geometría (lección v144)
      const sig = `${nuevo.id}|${nuevo.crisis}|${nuevo.opciones.length}|${nuevo.votos.join(",")}|${nuevo.votada}`;
      if (crisisWrap.userData.sig === sig) return;
      crisisWrap.userData.sig = sig;
      if (nuevo.id !== crisisWrap.userData.id) {
        pintarCrisis(nuevo.crisis, nuevo.region);
      }
      pintarOpciones(nuevo.opciones, nuevo.votos, nuevo.votada);
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => { reg.liberar(); titulo.mats.forEach((m) => m.dispose()); },
  };
}

// ────────────────────────────────────────────────────────────
// ESTUDIO DE MEMES — la galería en volumen: cada meme es un
// holograma con su caption en LETRAS 3D, las bolas del elenco
// como esferas reales y su contador de likes en oro
// ────────────────────────────────────────────────────────────
function construirMemes(ctx: CtxSala3D, p: SalaMemes3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  const titulo = texto3D(ctx, p.titulo, { tam: 0.15, prof: 0.05, color: p.color, emis: 0.55 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.96, 0);
  grupo.add(titulo.grupo);

  const peana = pedestal(1.6, p.color);
  peana.position.y = -0.85;
  grupo.add(peana);

  // LA GALERÍA — arco de hologramas con el contenido real
  const contenedor = new THREE.Group();
  contenedor.position.y = 0.02;
  contenedor.scale.setScalar(0.86); // el arco de 5 cabe en el ancho nominal
  grupo.add(contenedor);
  const marcos: { grupo: THREE.Group; fase: number; baseY: number }[] = [];
  const pintarGaleria = (memes: SalaMemes3D["memes"]) => {
    while (contenedor.children.length) {
      const c = contenedor.children[0] as THREE.Group;
      contenedor.remove(c);
    }
    marcos.length = 0;
    proxies.length = 0;
    const lista = (memes || []).slice(0, 5);
    const sep = 0.68;
    lista.forEach((m, i) => {
      const marco = new THREE.Group();
      const w = 0.72, h = 0.54;
      const fondo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w, h, 0.02)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: 0x0c1526, metalness: 0.85, roughness: 0.3, transparent: true, opacity: 0.9,
          emissive: new THREE.Color(m.bg || "#101a2c").multiplyScalar(0.35),
          emissiveIntensity: 0.5,
        })),
      );
      const borde = new THREE.LineSegments(fondo.geometry, reg.mat(matFilo(p.color, 0.85)));
      marco.add(fondo, borde);
      // LAS BOLAS del elenco — esferas reales con el color del meme
      const nB = Math.min(m.bolas.length, 2);
      for (let b = 0; b < nB; b++) {
        const col = new THREE.Color(m.bolas[b] || "#f5c542");
        const bola = new THREE.Mesh(
          reg.geo(new THREE.SphereGeometry(0.085, 18, 14)),
          reg.mat(new THREE.MeshStandardMaterial({ color: col, metalness: 0.25, roughness: 0.4, emissive: col.clone().multiplyScalar(0.25), emissiveIntensity: 0.6 })),
        );
        bola.position.set(nB === 1 ? 0 : (b === 0 ? -0.2 : 0.2), 0.08, 0.04);
        marco.add(bola);
      }
      // EL CAPTION en letras 3D (la primera línea del texto real)
      const lin = (m.textos[0] || m.caption).slice(0, 22);
      const cap = texto3D(ctx, lin, { tam: 0.052, prof: 0.018, color: 0xffffff, emis: 0.5 });
      cap.grupo.position.set(-cap.ancho / 2, -0.13, 0.03);
      marco.add(cap.grupo);
      // AUTOR + LIKES en oro
      const meta = texto3D(ctx, `+${m.likes} ${m.autor}`.slice(0, 18), { tam: 0.04, prof: 0.014, color: COL_ORO, emis: 0.5 });
      meta.grupo.position.set(-meta.ancho / 2, -0.22, 0.03);
      marco.add(meta.grupo);
      // proxy de apertura
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w + 0.05, h + 0.05, 0.04)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: p.tab, accion: "abrir", idx: i } };
      marco.add(proxy);
      proxies.push(proxy);
      // arco: el del centro más alto
      const x = (i - (lista.length - 1) / 2) * sep;
      const y = -Math.abs(i - (lista.length - 1) / 2) * 0.13;
      marco.position.set(x, y, -Math.abs(i - (lista.length - 1) / 2) * 0.1);
      marco.rotation.y = -(i - (lista.length - 1) / 2) * 0.1;
      contenedor.add(marco);
      marcos.push({ grupo: marco, fase: i * 1.1, baseY: y });
    });
  };
  pintarGaleria(p.memes);

  const polvoGold = polvo(ctx.calidadBaja ? 55 : 100, p.color, 1.7, 2.0);
  polvoGold.position.y = -0.82;
  grupo.add(polvoGold);

  tics.push((t, dt) => {
    polvoGold.rotation.y += dt * 0.2;
    for (const mk of marcos) {
      mk.grupo.position.y = mk.baseY + Math.sin(t * 1.25 + mk.fase) * 0.022;
    }
  });

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "memes") return;
      pintarGaleria(nuevo.memes);
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => { reg.liberar(); titulo.mats.forEach((m) => m.dispose()); },
  };
}

// ────────────────────────────────────────────────────────────
// SALA GENÉRICA — TODAS las demás ramas: placa de título
// extruida + arco holográfico + partículas del acento de la
// sección. Toda sala de Vanguard tiene presencia volumétrica.
// ────────────────────────────────────────────────────────────
function construirGenerica(ctx: CtxSala3D, p: SalaGenerica3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  // EL TÍTULO en volumen — la firma de la sala
  const titulo = texto3D(ctx, p.titulo, { tam: 0.165, prof: 0.055, color: p.color, emis: 0.6 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.62, 0);
  grupo.add(titulo.grupo);

  // EL ARCO holográfico que abraza el título
  const arco = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.88, 0.012, 8, 60, Math.PI)),
    reg.mat(new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  arco.position.y = 0.1;
  grupo.add(arco);
  const arcoInt = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.78, 0.006, 8, 60, Math.PI)),
    reg.mat(new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  arcoInt.position.y = 0.1;
  grupo.add(arcoInt);

  // LAS COLUMNAS del portal (dos estelas verticales)
  for (const s of [-1, 1]) {
    const col = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(0.035, 1.0, 0.035)),
      reg.mat(matMetal(0x101a2c)),
    );
    col.position.set(s * 0.92, 0.08, 0);
    grupo.add(col);
    const filo = new THREE.LineSegments(col.geometry, reg.mat(matFilo(p.color, 0.85)));
    filo.position.copy(col.position);
    grupo.add(filo);
  }

  const peana = pedestal(1.25, p.color);
  peana.position.y = -0.62;
  grupo.add(peana);

  const polvoSala = polvo(ctx.calidadBaja ? 55 : 100, p.color, 1.35, 1.7);
  polvoSala.position.y = -0.6;
  grupo.add(polvoSala);

  tics.push((t, dt) => {
    polvoSala.rotation.y += dt * 0.2;
    arco.rotation.z = Math.sin(t * 0.6) * 0.05;
    (arco.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(t * 1.6) * 0.25;
    titulo.grupo.position.y = 0.62 + Math.sin(t * 1.05) * 0.015;
  });

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "generica" && nuevo.tab !== p.tab) return;
      // el título vivo: si cambia la sala, se repinta la placa
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => { reg.liberar(); titulo.mats.forEach((m) => m.dispose()); },
  };
}

// ────────────────────────────────────────────────────────────
// ÓRBITA DE NOTICIAS — los cables REALES del teletipo viviendo
// como satélites holográficos: cada noticia es una tarjeta 3D
// con titular en letras extruidas orbitando un núcleo de radar.
// Tocar una tarjeta abre LA SALA DE LECTURA de la Casa.
// ────────────────────────────────────────────────────────────
function construirNoticias(ctx: CtxSala3D, p: SalaNoticias3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  const titulo = texto3D(ctx, p.titulo, { tam: 0.15, prof: 0.05, color: p.color, emis: 0.55 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.98, 0);
  grupo.add(titulo.grupo);

  // v145.1 QA: desplazamiento al espacio derecho del cuadro (responsive:
  // en móvil el cuadro es el planeta entero y el desplazamiento es mínimo)
  const DESPLAZ = ctx.movil ? 0.04 : 0.22;

  // EL NÚCLEO — radar holográfico en el centro de la órbita
  const nucleo = new THREE.Group();
  nucleo.position.set(DESPLAZ, 0.34, -0.1);
  const corazon = new THREE.Mesh(
    reg.geo(new THREE.IcosahedronGeometry(0.13, 0)),
    reg.mat(new THREE.MeshStandardMaterial({
      color: p.color, metalness: 0.7, roughness: 0.25,
      emissive: new THREE.Color(p.color), emissiveIntensity: 0.8, transparent: true, opacity: 0.9,
    })),
  );
  nucleo.add(corazon);
  for (const [r, tilt, spd] of [[0.24, 0.5, 0.9], [0.31, -0.9, -0.6]] as const) {
    const an = new THREE.Mesh(
      reg.geo(new THREE.TorusGeometry(r, 0.006, 8, 44)),
      reg.mat(new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })),
    );
    an.rotation.x = Math.PI / 2 + tilt;
    an.userData.spd = spd;
    nucleo.add(an);
    tics.push((t, dt) => { an.rotation.z += dt * (an.userData.spd as number); });
  }
  grupo.add(nucleo);

  // LA ÓRBITA — las tarjetas giran en el plano del cuadro, texto siempre derecho
  const orbita = new THREE.Group();
  orbita.position.set(DESPLAZ, 0.36, 0);
  orbita.scale.setScalar(0.88); // la órbita completa cabe en el ancho nominal
  grupo.add(orbita);
  const RX = 1.12, RY = 0.52, N = 5;
  const tarjetas: { g: THREE.Group; ang: number; spd: number }[] = [];

  // la renovación NO filtra: lo que sale, se desintegra
  const limpiar = (o: THREE.Object3D) => {
    o.traverse((x) => {
      const m = x as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });
  };

  const pintarTarjetas = (noticias: SalaNoticias3D["noticias"]) => {
    while (orbita.children.length) {
      const c = orbita.children[0] as THREE.Group;
      orbita.remove(c);
      limpiar(c);
    }
    tarjetas.length = 0;
    proxies.length = 0;
    const lista = (noticias || []).slice(0, N);
    lista.forEach((n, i) => {
      const card = new THREE.Group();
      const w = 0.72, h = 0.4;
      const fondo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w, h, 0.018)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: 0x0c1526, metalness: 0.88, roughness: 0.24, transparent: true, opacity: 0.88,
        })),
      );
      const borde = new THREE.LineSegments(fondo.geometry, reg.mat(matFilo(p.color, 0.9)));
      card.add(fondo, borde);
      // LA FUENTE + antigüedad en oro
      const meta = texto3D(ctx, acotar(`${n.fuente} ${n.edad}`.toUpperCase(), 24), { tam: 0.032, prof: 0.012, color: COL_ORO, emis: 0.5 });
      meta.grupo.position.set(-meta.ancho / 2, h / 2 - 0.07, 0.02);
      card.add(meta.grupo);
      // EL TITULAR — dos líneas de letras reales
      const limpio = acotar(n.titulo || "SIN TITULAR", 52).toUpperCase();
      const mitad = Math.ceil(limpio.length / 2);
      const cortado = limpio.slice(0, mitad).lastIndexOf(" ");
      const p1 = acotar(limpio.slice(0, cortado > 12 ? cortado : mitad), 27);
      const p2 = acotar(limpio.slice(p1.length).trim(), 27);
      [p1, p2].filter(Boolean).forEach((ln, li) => {
        const t = texto3D(ctx, ln, { tam: 0.038, prof: 0.014, color: 0xffffff, emis: 0.42 });
        t.grupo.position.set(-t.ancho / 2, 0.035 - li * 0.075, 0.025);
        card.add(t.grupo);
      });
      // LA ETIQUETA táctica con su color
      const col = new THREE.Color(n.color || "#8b98ad");
      const tag = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(0.16, 0.045, 0.008)),
        reg.mat(new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.4 })),
      );
      tag.position.set(-w / 2 + 0.11, -h / 2 + 0.055, 0.02);
      card.add(tag);
      const tagT = texto3D(ctx, acotar((n.tag || "INFO").toUpperCase(), 8), { tam: 0.028, prof: 0.01, color: col.getHex(), emis: 0.6 });
      tagT.grupo.position.set(tag.position.x - tagT.ancho / 2, tag.position.y, 0.025);
      card.add(tagT.grupo);
      // proxy de apertura — tocar la tarjeta abre la lectura
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.04)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: p.tab, accion: "abrir", idx: i } };
      card.add(proxy);
      proxies.push(proxy);
      // posición orbital inicial repartida
      const ang = (i / N) * Math.PI * 2;
      card.position.set(Math.cos(ang) * RX, Math.sin(ang) * RY, Math.sin(ang) * 0.14);
      orbita.add(card);
      tarjetas.push({ g: card, ang, spd: 0.085 });
    });
  };
  pintarTarjetas(p.noticias);

  const polvoAzul = polvo(ctx.calidadBaja ? 50 : 90, p.color, 1.7, 2.0);
  polvoAzul.position.y = -0.78;
  grupo.add(polvoAzul);

  tics.push((t, dt) => {
    polvoAzul.rotation.y += dt * 0.16;
    corazon.rotation.y += dt * 0.7;
    corazon.rotation.x += dt * 0.35;
    (corazon.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + Math.sin(t * 2.1) * 0.3;
    for (const tj of tarjetas) {
      tj.ang += dt * tj.spd;
      tj.g.position.set(Math.cos(tj.ang) * RX, Math.sin(tj.ang) * RY, Math.sin(tj.ang) * 0.14);
      const prof = (Math.sin(tj.ang) + 1) / 2; // 1 = cerca
      tj.g.scale.setScalar(0.9 + prof * 0.16);
    }
  });

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "noticias") return;
      pintarTarjetas(nuevo.noticias);
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => { reg.liberar(); titulo.mats.forEach((m) => m.dispose()); },
  };
}

// ────────────────────────────────────────────────────────────
// EXAMEN HOLOGRÁFICO — la pregunta del quiz flotando en letras
// extruidas y las 4 respuestas como placas 3D TOCABLES: verde
// acierta, rojo falla, y el botón SIGUIENTE también es 3D.
// ────────────────────────────────────────────────────────────
function construirQuiz(ctx: CtxSala3D, p: SalaQuiz3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  const titulo = texto3D(ctx, p.titulo, { tam: 0.15, prof: 0.05, color: p.color, emis: 0.55 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.98, 0);
  grupo.add(titulo.grupo);

  const peana = pedestal(1.5, p.color);
  peana.position.y = -0.85;
  grupo.add(peana);

  // viven fuera de las funciones para que actualizar() las repinte
  let metaWrap = new THREE.Group();
  let pregWrap = new THREE.Group();
  let opsWrap = new THREE.Group();
  let sigWrap: THREE.Group | null = null;
  let sigKey = "";

  // la renovación NO filtra: lo que sale, se desintegra
  const limpiar = (w: THREE.Group) => {
    w.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });
  };

  const pintar = (q: SalaQuiz3D) => {
    grupo.remove(metaWrap, pregWrap, opsWrap);
    if (sigWrap) { grupo.remove(sigWrap); limpiar(sigWrap); sigWrap = null; }
    limpiar(metaWrap); limpiar(pregWrap); limpiar(opsWrap);
    metaWrap = new THREE.Group(); pregWrap = new THREE.Group(); opsWrap = new THREE.Group();
    // v145.1 QA: en escritorio el ancla deja el planeta a la IZQUIERDA — el
    // examen vive en el espacio DERECHO del cuadro. En móvil el cuadro es el
    // planeta entero: desplazamiento mínimo para no recortar placas.
    metaWrap.position.x = ctx.movil ? 0.05 : 0.18;
    pregWrap.position.x = ctx.movil ? 0.06 : 0.24;
    opsWrap.position.x = ctx.movil ? 0.08 : 0.4;
    proxies.length = 0;

    // categoría + dificultad + progreso en oro
    const meta = texto3D(ctx, acotar(`${q.categoria} ${q.dificultad}`.toUpperCase(), 26), { tam: 0.045, prof: 0.016, color: COL_ORO, emis: 0.5 });
    meta.grupo.position.set(-meta.ancho / 2, 0.72, 0);
    metaWrap.add(meta.grupo);
    const prog = texto3D(ctx, `${q.aciertos}/${q.total} ACIERTOS`, { tam: 0.05, prof: 0.018, color: q.color, emis: 0.55 });
    prog.grupo.position.set(1.3 - prog.ancho, 0.72, 0);
    metaWrap.add(prog.grupo);

    // LA PREGUNTA — dos líneas de volumen
    const limpio = acotar(q.pregunta || "CARGANDO PREGUNTA", 60).toUpperCase();
    const mitad = Math.ceil(limpio.length / 2);
    const cortado = limpio.slice(0, mitad).lastIndexOf(" ");
    const p1 = acotar(limpio.slice(0, cortado > 14 ? cortado : mitad), 30);
    const p2 = acotar(limpio.slice(p1.length).trim(), 30);
    [p1, p2].filter(Boolean).forEach((ln, li) => {
      const t = texto3D(ctx, ln, { tam: 0.062, prof: 0.022, color: 0xffffff, emis: 0.45 });
      t.grupo.position.set(-t.ancho / 2, 0.52 - li * 0.1, 0);
      pregWrap.add(t.grupo);
    });

    // LAS RESPUESTAS — placas 2×2 con letra y texto reales
    const w = 1.18, h = 0.3;
    (q.opciones || []).slice(0, 4).forEach((op, i) => {
      const placa = new THREE.Group();
      const esCorrecta = q.revelada && q.correcta === i;
      const esFallo = q.revelada && q.seleccionada === i && q.correcta !== i;
      const apagada = q.revelada && !esCorrecta && !esFallo;
      const col = esCorrecta ? COL_VERDE : esFallo ? COL_ROJO : apagada ? 0x5a6a80 : 0x7ab8ff;
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w, h, 0.02)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: 0x0c1526, metalness: 0.9, roughness: 0.22, transparent: true, opacity: apagada ? 0.5 : 0.86,
          emissive: new THREE.Color(esCorrecta ? COL_VERDE : esFallo ? COL_ROJO : 0x000000), emissiveIntensity: 0.22,
        })),
      );
      const borde = new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(col, apagada ? 0.4 : 0.9)));
      placa.add(cuerpo, borde);
      const letra = texto3D(ctx, String.fromCharCode(65 + i), { tam: 0.08, prof: 0.026, color: col, emis: 0.6 });
      letra.grupo.position.set(-w / 2 + 0.1, -0.015, 0.02);
      placa.add(letra.grupo);
      const txt = texto3D(ctx, acotar(op || "-", 22).toUpperCase(), { tam: 0.042, prof: 0.014, color: apagada ? 0x5a6a80 : col, emis: 0.45 });
      txt.grupo.position.set(-w / 2 + 0.24, -0.015, 0.02);
      placa.add(txt.grupo);
      if (!q.revelada) {
        const proxy = new THREE.Mesh(
          reg.geo(new THREE.BoxGeometry(w + 0.05, h + 0.05, 0.05)),
          reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
        );
        proxy.userData = { salaAccion: { tab: p.tab, accion: "responder", idx: i } };
        placa.add(proxy);
        proxies.push(proxy);
      }
      const colG = i % 2, fila = Math.floor(i / 2);
      placa.position.set((colG - 0.5) * (w + 0.12), -0.06 - fila * (h + 0.1), -fila * 0.05);
      opsWrap.add(placa);
    });

    // SIGUIENTE — la placa dorada nace al revelar
    if (q.revelada) {
      sigWrap = new THREE.Group();
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(1.0, 0.22, 0.02)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: 0x2a1a08, metalness: 0.85, roughness: 0.3, transparent: true, opacity: 0.92,
          emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.3,
        })),
      );
      const borde = new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(COL_ORO, 0.95)));
      sigWrap.add(cuerpo, borde);
      const txt = texto3D(ctx, "SIGUIENTE", { tam: 0.06, prof: 0.02, color: COL_ORO, emis: 0.65 });
      txt.grupo.position.set(-txt.ancho / 2, -0.015, 0.02);
      sigWrap.add(txt.grupo);
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(1.06, 0.27, 0.05)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: p.tab, accion: "siguiente", idx: -1 } };
      sigWrap.add(proxy);
      proxies.push(proxy);
      sigWrap.position.set(0, -0.62, 0.1);
      grupo.add(sigWrap);
    }

    grupo.add(metaWrap, pregWrap, opsWrap);
  };

  pintar(p);

  const polvoVerde = polvo(ctx.calidadBaja ? 50 : 90, p.color, 1.5, 1.9);
  polvoVerde.position.y = -0.82;
  grupo.add(polvoVerde);

  tics.push((t, dt) => {
    polvoVerde.rotation.y += dt * 0.18;
    if (sigWrap) sigWrap.position.y = -0.62 + Math.sin(t * 2.2) * 0.012;
  });

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "quiz") return;
      const sig = `${nuevo.pregunta}|${nuevo.revelada}|${nuevo.seleccionada}|${nuevo.aciertos}|${nuevo.total}`;
      if (sig === sigKey) return;
      sigKey = sig;
      pintar(nuevo);
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => {
      reg.liberar(); titulo.mats.forEach((m) => m.dispose());
      limpiar(metaWrap); limpiar(pregWrap); limpiar(opsWrap);
    },
  };
}

// ────────────────────────────────────────────────────────────
// PORTAL DE VOTO — la encuesta activa como portal holográfico:
// la pregunta en letras extruidas y las opciones con barras de
// volumen que laten — se vota DESDE DENTRO del mundo 3D.
// ────────────────────────────────────────────────────────────
function construirVotaciones(ctx: CtxSala3D, p: SalaVotaciones3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  const titulo = texto3D(ctx, p.titulo, { tam: 0.15, prof: 0.05, color: p.color, emis: 0.55 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.98, 0);
  grupo.add(titulo.grupo);

  const peana = pedestal(1.5, p.color);
  peana.position.y = -0.85;
  grupo.add(peana);

  const anillo = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(1.12, 0.008, 8, 56)),
    reg.mat(new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  anillo.rotation.x = Math.PI / 2;
  anillo.position.y = -0.7;
  grupo.add(anillo);

  let pregWrap = new THREE.Group();
  let opsWrap = new THREE.Group();
  let sigKey = "";
  const placasOps: { g: THREE.Group; baseY: number; fase: number }[] = [];

  // la renovación NO filtra: lo que sale, se desintegra
  const limpiar = (w: THREE.Group) => {
    w.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });
  };

  const pintar = (v: SalaVotaciones3D) => {
    grupo.remove(pregWrap, opsWrap);
    limpiar(pregWrap); limpiar(opsWrap);
    pregWrap = new THREE.Group(); opsWrap = new THREE.Group();
    // v145.1 QA: desplazamiento derecho del portal de voto (responsive)
    pregWrap.position.x = ctx.movil ? 0.06 : 0.24;
    opsWrap.position.x = ctx.movil ? 0.08 : 0.4;
    proxies.length = 0;
    placasOps.length = 0;

    const limpio = acotar(v.pregunta || "CARGANDO ENCUESTA", 58).toUpperCase();
    const mitad = Math.ceil(limpio.length / 2);
    const cortado = limpio.slice(0, mitad).lastIndexOf(" ");
    const p1 = acotar(limpio.slice(0, cortado > 14 ? cortado : mitad), 30);
    const p2 = acotar(limpio.slice(p1.length).trim(), 30);
    [p1, p2].filter(Boolean).forEach((ln, li) => {
      const t = texto3D(ctx, ln, { tam: 0.058, prof: 0.02, color: 0xffffff, emis: 0.45 });
      t.grupo.position.set(-t.ancho / 2, 0.6 - li * 0.095, 0);
      pregWrap.add(t.grupo);
    });
    const cnt = texto3D(ctx, `ENCUESTA ${v.indice}/${v.total}`, { tam: 0.04, prof: 0.014, color: COL_ORO, emis: 0.5 });
    cnt.grupo.position.set(1.28 - cnt.ancho, 0.76, 0);
    pregWrap.add(cnt.grupo);

    const vts = v.votos || [];
    const totalV = Math.max(1, vts.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0));
    const w = 1.18, h = 0.26;
    (v.opciones || []).slice(0, 4).forEach((op, i) => {
      const placa = new THREE.Group();
      const votada = v.votada === i;
      const col = votada ? COL_ORO : 0x7ab8ff;
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w, h, 0.02)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: votada ? 0x2a1a08 : 0x0c1526, metalness: 0.9, roughness: 0.22, transparent: true, opacity: 0.86,
          emissive: new THREE.Color(votada ? COL_ORO : 0x000000), emissiveIntensity: votada ? 0.3 : 0,
        })),
      );
      const borde = new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(col, 0.9)));
      placa.add(cuerpo, borde);
      const letra = texto3D(ctx, String.fromCharCode(65 + i), { tam: 0.07, prof: 0.022, color: col, emis: 0.6 });
      letra.grupo.position.set(-w / 2 + 0.09, -0.01, 0.02);
      placa.add(letra.grupo);
      const txt = texto3D(ctx, acotar(op || "-", 18).toUpperCase(), { tam: 0.038, prof: 0.013, color: col, emis: 0.4 });
      txt.grupo.position.set(-w / 2 + 0.22, 0.045, 0.02);
      placa.add(txt.grupo);
      // LA BARRA DE VOTOS — volumen proporcional que respira
      const frac = (vts[i] || 0) / totalV;
      const barra = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry((w - 0.36) * Math.max(frac, 0.02), 0.03, 0.012)),
        reg.mat(new THREE.MeshBasicMaterial({ color: COL_ORO, transparent: true, opacity: 0.85 })),
      );
      barra.position.set(-w / 2 + 0.22 + ((w - 0.36) * Math.max(frac, 0.02)) / 2, -0.055, 0.02);
      placa.add(barra);
      const pct = texto3D(ctx, `${Math.round(frac * 100)}%`, { tam: 0.048, prof: 0.016, color: COL_ORO, emis: 0.55 });
      pct.grupo.position.set(w / 2 - 0.09 - pct.ancho, 0.045, 0.02);
      placa.add(pct.grupo);
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w + 0.05, h + 0.05, 0.05)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: p.tab, accion: "voto", idx: i } };
      placa.add(proxy);
      proxies.push(proxy);
      const colG = i % 2, fila = Math.floor(i / 2);
      placa.position.set((colG - 0.5) * (w + 0.12), -0.08 - fila * (h + 0.1), -fila * 0.05);
      opsWrap.add(placa);
      placasOps.push({ g: placa, baseY: placa.position.y, fase: i * 1.3 });
    });

    grupo.add(pregWrap, opsWrap);
  };

  pintar(p);

  const polvoVoto = polvo(ctx.calidadBaja ? 50 : 90, p.color, 1.45, 1.85);
  polvoVoto.position.y = -0.8;
  grupo.add(polvoVoto);

  tics.push((t, dt) => {
    polvoVoto.rotation.y += dt * 0.2;
    anillo.rotation.z += dt * 0.3;
    (anillo.material as THREE.MeshBasicMaterial).opacity = 0.45 + Math.sin(t * 1.7) * 0.22;
    for (const op of placasOps) op.g.position.y = op.baseY + Math.sin(t * 1.5 + op.fase) * 0.01;
  });

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "votaciones") return;
      const sig = `${nuevo.pregunta}|${nuevo.votos?.join(",")}|${nuevo.votada}|${nuevo.indice}|${nuevo.total}`;
      if (sig === sigKey) return;
      sigKey = sig;
      pintar(nuevo);
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => {
      reg.liberar(); titulo.mats.forEach((m) => m.dispose());
      limpiar(pregWrap); limpiar(opsWrap);
    },
  };
}

// ────────────────────────────────────────────────────────────
// NÚCLEO DEL AGENTE — el avatar del cuartel como ser de energía:
// icosaedro del color del nivel con anillos de logros orbitando,
// el nombre en letras extruidas y el botín flotando en oro.
// ────────────────────────────────────────────────────────────
function construirPerfil(ctx: CtxSala3D, p: SalaPerfil3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  const titulo = texto3D(ctx, p.titulo, { tam: 0.15, prof: 0.05, color: p.color, emis: 0.55 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.98, 0);
  grupo.add(titulo.grupo);

  const peana = pedestal(1.4, p.color);
  peana.position.y = -0.85;
  grupo.add(peana);

  // EL COLOR DEL NIVEL — azul recluta, verde operativo, oro veterano, rojo leyenda
  const nivelColor = p.nivel >= 10 ? 0xff3b30 : p.nivel >= 7 ? 0xf5c542 : p.nivel >= 4 ? 0x3ddc84 : 0x7ab8ff;

  const avatar = new THREE.Group();
  avatar.position.set(0, 0.36, 0);
  grupo.add(avatar);
  const solido = new THREE.Mesh(
    reg.geo(new THREE.IcosahedronGeometry(0.3, 0)),
    reg.mat(new THREE.MeshStandardMaterial({
      color: nivelColor, metalness: 0.6, roughness: 0.25,
      emissive: new THREE.Color(nivelColor), emissiveIntensity: 0.45, transparent: true, opacity: 0.92,
    })),
  );
  const malla = new THREE.Mesh(
    reg.geo(new THREE.IcosahedronGeometry(0.36, 0)),
    reg.mat(new THREE.MeshBasicMaterial({ color: nivelColor, wireframe: true, transparent: true, opacity: 0.5 })),
  );
  avatar.add(solido, malla);

  // LOS ANILLOS DE LOGROS — tres órbitas inclinadas girando
  for (const [r, tilt, spd] of [[0.48, 0.4, 0.7], [0.6, -0.7, -0.45], [0.72, 1.2, 0.3]] as const) {
    const an = new THREE.Mesh(
      reg.geo(new THREE.TorusGeometry(r, 0.007, 8, 52)),
      reg.mat(new THREE.MeshBasicMaterial({ color: nivelColor, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })),
    );
    an.rotation.x = Math.PI / 2 + tilt;
    an.userData.spd = spd;
    avatar.add(an);
    tics.push((_t, dt) => { an.rotation.z += dt * (an.userData.spd as number); });
  }

  // EL NOMBRE en volumen — la firma del agente
  const nombre = texto3D(ctx, acotar(p.nombre || "AGENTE", 14), { tam: 0.095, prof: 0.032, color: COL_ORO, emis: 0.6 });
  nombre.grupo.position.set(-nombre.ancho / 2, -0.14, 0);
  grupo.add(nombre.grupo);

  // EL BOTÍN flotante — nivel, XP, monedas, gemas, racha
  let botinWrap = new THREE.Group();
  let sigKey = "";
  const limpiarBotin = (o: THREE.Object3D) => {
    o.traverse((x) => {
      const m = x as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });
  };
  const pintarBotin = (b: SalaPerfil3D) => {
    grupo.remove(botinWrap);
    limpiarBotin(botinWrap);
    botinWrap = new THREE.Group();
    const linea = texto3D(
      ctx,
      acotar(`NIVEL ${b.nivel}  ${b.xp}XP  ${b.monedas}C  ${b.gemas}G  RACHA ${b.racha}`, 34),
      { tam: 0.05, prof: 0.018, color: nivelColor, emis: 0.55 },
    );
    linea.grupo.position.set(-linea.ancho / 2, -0.36, 0);
    botinWrap.add(linea.grupo);
    grupo.add(botinWrap);
  };
  pintarBotin(p);

  const polvoAgente = polvo(ctx.calidadBaja ? 55 : 100, nivelColor, 1.5, 1.9);
  polvoAgente.position.y = -0.8;
  grupo.add(polvoAgente);

  tics.push((t, dt) => {
    polvoAgente.rotation.y += dt * 0.18;
    solido.rotation.y += dt * 0.5;
    malla.rotation.y -= dt * 0.3;
    malla.rotation.x += dt * 0.12;
    const respira = 1 + Math.sin(t * 1.4) * 0.035;
    avatar.scale.setScalar(respira);
    (solido.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + Math.sin(t * 2) * 0.2;
    botinWrap.position.y = Math.sin(t * 1.2) * 0.012;
    nombre.grupo.position.y = -0.14 + Math.sin(t * 1.1 + 1) * 0.008;
  });

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "perfil") return;
      const sig = `${nuevo.nivel}|${nuevo.xp}|${nuevo.monedas}|${nuevo.gemas}|${nuevo.racha}|${nuevo.nombre}`;
      if (sig === sigKey) return;
      sigKey = sig;
      pintarBotin(nuevo);
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => {
      reg.liberar(); titulo.mats.forEach((m) => m.dispose());
      limpiarBotin(botinWrap);
    },
  };
}

// ────────────────────────────────────────────────────────────
// EL DESPACHADOR — construye la sala según su tipo
// ────────────────────────────────────────────────────────────
export function construirSala3D(ctx: CtxSala3D, p: PayloadSala3D): Sala3DInstancia {
  switch (p.tipo) {
    case "economia": return construirEconomia(ctx, p);
    case "conflictos": return construirConflictos(ctx, p);
    case "memes": return construirMemes(ctx, p);
    case "noticias": return construirNoticias(ctx, p);
    case "quiz": return construirQuiz(ctx, p);
    case "votaciones": return construirVotaciones(ctx, p);
    case "perfil": return construirPerfil(ctx, p);
    default: return construirGenerica(ctx, p);
  }
}
