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
import { TextureLoader } from "three";

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
  | "predicciones"
  | "logros"
  | "tienda"
  | "contenido"
  | "misiones"
  | "ranking"
  | "juegos"
  | "generica";
// v164 LA GALERÍA DE JUEGOS — los cartuchos reales de Vanguard en volumen:
// cada juego es un cartucho 3D con su puntuación real, el trofeo dorado
// gira en lo alto y JUGAR se toca desde dentro del mundo
export interface SalaJuegos3DFila {
  nombre: string;
  detalle: string;   // puntuación/récord/victorias reales del agente
  color: string;
  jugable?: boolean; // false = placa de datos (sin JUGAR, sin proxy)
}
export interface SalaJuegos3D extends BaseSala3D {
  tipo: "juegos";
  juegos: SalaJuegos3DFila[];
  partida: string;   // el juego del día o la partida activa
  records: string;   // resumen de récords del piloto
}

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
  // v165 LA SALA COMPLETA — el mercado ENTERO vive en la sala: lista de
  // activos TOCABLES (invertir de verdad desde el mundo) + cartera del piloto
  lista?: { id: string; nombre: string; precio: string; chg: string; sube: boolean }[];
  cartera?: { id: string; qty: string; pnl: string; gana: boolean }[];
  monedas?: number;
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
// v164 LA REDACCIÓN EN VIVO — la sala RESPIRA: cartel EN VIVO pulsante,
// espectadores reales del servidor y faro de ÚLTIMA HORA cuando el cable
// más nuevo sigue caliente (< 15 min de nacido)
export interface SalaNoticias3D extends BaseSala3D {
  tipo: "noticias";
  noticias: { titulo: string; fuente: string; edad: string; tag: string; color: string; img?: string }[];
  espectadores?: number;  // operadores conectados AHORA (presencia real)
  ultimo?: boolean;       // el cable más nuevo es de ÚLTIMA HORA
  ultimoTitulo?: string;  // el titular caliente que enciende el faro
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
  // v172 EL PULSO DE LA PARIDAD: el agente lleva su propia telemetría
  acc3d?: number;
  acc2d?: number;
}
// v147 PORTAL DE CUOTAS — el mercado de predicciones en volumen:
// SÍ/NO gigantes con su cuota, fichas de apuesta tocables y el premio
export interface SalaPredicciones3D extends BaseSala3D {
  tipo: "predicciones";
  pregunta: string;
  horizonte: string; // "SEMANAL · 7d" etc.
  cuotaSi: number;
  cuotaNo: number;
  probSi: number; // 0..100
  stake: number;
  mult: number;
  resuelto: string | null; // "SÍ" acertó · "NO" falló · null = en juego
}
// v147 CORONA DE HITOS — los logros como anillos orbitales + próximos
export interface SalaLogros3D extends BaseSala3D {
  tipo: "logros";
  desbloqueados: number;
  total: number;
  reclamados: number;
  xpGanada: number;
  proximos: { titulo: string; pct: number; botin: string; reclamar: boolean }[];
}
// v147 VITRINA DE COFRES — la tienda como arca holográfica tocable
// v165 CATÁLOGO COMPLETO: la vitrina ya no enseña 4 cofres y ya —
// el panel manda TODO el catálogo (cada item con su descripción como
// detalle de proximidad) y la sala levanta cofres + estantería de filas
export interface SalaTienda3D extends BaseSala3D {
  tipo: "tienda";
  monedas: number;
  gemas: number;
  items: { titulo: string; costo: number; moneda: "COINS" | "GEMS"; activo: boolean; d?: string; cat?: string }[];
}
// v148/v153 ESTACIÓN INFORMATIVA (remota) — TODA rama vive en volumen:
// letras 3D informativas + placas de datos vivas
// v153 TABLERO DE MISIONES — la tercera ola local: el centro de misiones
// en volumen (placas con barra de progreso de VOLUMEN + RECLAMAR en oro)
export interface SalaMisiones3D extends BaseSala3D {
  tipo: "misiones";
  hechas: number;
  total: number;
  monedas: number;
  misiones: { titulo: string; cat: string; pct: number; recompensa: string; reclamar: boolean }[];
}
// v153 PODIO GLOBAL — el ranking semanal en volumen: podio de 3 columnas
// (oro/plata/bronce) + filas con barra proporcional al puntaje
export interface SalaRanking3D extends BaseSala3D {
  tipo: "ranking";
  disciplina: string; // "XP" | "CONQ" | "TRADER"
  filas: { nombre: string; tag: string; puntos: number; jugador: boolean }[];
  posicion: number;
  semana: string;
  dias: number;
}
export interface SalaGenerica3D extends BaseSala3D {
  tipo: "generica";
  lineas?: string[];                 // letras informativas extruidas (qué es este módulo)
  stats?: { k: string; v: string }[]; // datos vivas del agente (nivel, monedas…)
}
// v148 SALA DE CONTENIDO — la tercera ola del mandato «100% 3D»: CUALQUIER
// rama sin constructor insignia muestra su contenido real en volumen:
// filas de cristal con texto extruido, valor en oro, barra de volumen e
// IMAGEN texturizada cuando la fila la trae. El panel manda filas; el
// mundo las levanta.
export interface FilaContenido3D {
  t: string;              // texto de la fila
  v?: string;             // valor (oro, a la derecha)
  p?: number;             // barra 0..100 (volumen proporcional)
  img?: string;           // url de imagen → plano texturizado
  color?: string;         // acento hexadecimal de la fila
  d?: string;             // v165 EL DETALLE — la info nueva que la PROXIMIDAD revela (letra que va y viene)
  a?: string;             // v165 LA ACCIÓN — comprar/invertir/vender… (la fila ejecuta de verdad)
}
export interface SalaContenido3D extends BaseSala3D {
  tipo: "contenido";
  filas: FilaContenido3D[];
  resumen?: string;       // línea fina bajo el título
  mas?: number;           // v165 filas que quedan en el panel (pie «+N MÁS»)
}
export type PayloadSala3D =
  | SalaEconomia3D
  | SalaConflictos3D
  | SalaMemes3D
  | SalaNoticias3D
  | SalaQuiz3D
  | SalaVotaciones3D
  | SalaPerfil3D
  | SalaPredicciones3D
  | SalaLogros3D
  | SalaTienda3D
  | SalaContenido3D
  | SalaMisiones3D
  | SalaRanking3D
  | SalaJuegos3D
  | SalaGenerica3D;

// la instancia viva de una sala montada en el mundo
export interface Sala3DInstancia {
  grupo: THREE.Group;
  proxies: THREE.Mesh[];
  actualizar: (p: PayloadSala3D) => void;
  tic: (t: number, dt: number) => void;
  liberar: () => void;
  // v172 PAGINACIÓN UNIVERSAL: la casa de vidrio pagea sus filas — el
  // mundo llama aquí cuando el raycast toca la placa SIGUIENTE/ANTERIOR
  // (accion "__pagina": asunto del mundo, nunca viaja a la Casa)
  paginar?: (pagina: number) => void;
}

// contexto que presta el mundo (fuente, tweens, calidad)
export interface CtxSala3D {
  fuente: Font;
  calidadBaja: boolean;
  movil: boolean; // v145.1: el desplazamiento derecho solo existe en escritorio
  // v165 LA PROXIMIDAD: la posición VIVA de la cámara — las filas la leen
  // para revelar su detalle cuando el piloto se acerca (letra que va y viene)
  camara?: THREE.Vector3;
  animarP: (
    obj: Record<string, number> | THREE.Vector3 | THREE.Material | { opacity: number },
    to: Record<string, number>,
    ms: number,
    opts?: { ease?: (t: number) => number; onUpdate?: () => void; onDone?: () => void },
  ) => void;
  // v172 SONIDO DE CASCADA: una gota de cristal por fila revelada —
  // el mundo presta su AudioContext (las salas no tienen uno propio)
  sonar?: (tipo: "cascada", pitch?: number) => void;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// la fuente typeface no trae acentos: como un HUD militar, se caen
export function sanitizar(t: string): string {
  return (t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

// ────────────────────────────────────────────────────────────
// MATERIALES — la piel del holograma (misma estética del mundo:
// metal oscuro + filo de neón + oro de la Casa)
// ────────────────────────────────────────────────────────────
// v148: exportados — la FÁBRICA DE MUNDOS (mundos-3d.ts) comparte la piel
export const COL_VERDE = 0x3ddc84;
export const COL_ROJO = 0xff4d5e;
export const COL_ORO = 0xf5c542;

export function matMetal(color = 0x141d2e) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: 0.34 });
}
export function matFilo(color: number, op = 0.9) {
  return new THREE.LineBasicMaterial({ color, transparent: true, opacity: op });
}
export function filos(mesh: THREE.Mesh, color: number, op = 0.9) {
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
export function texto3D(
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
// v148 REDESIGN DEL DUEÑO («los botones son feos, muy grandes»): placas
// FINAS (cristal de 13mm en escala de sala), más transparentes y con
// cuerpo más oscuro — el filo de neón manda, la caja apenas se ve
// v152: exportada — la FÁBRICA DE MUNDOS (mundos-3d.ts) comparte la piel
export function placaHolo(w: number, h: number, color: number): { cuerpo: THREE.Mesh; borde: THREE.LineSegments } {
  const cuerpo = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 0.013),
    new THREE.MeshStandardMaterial({
      color: 0x0a111e,
      metalness: 0.92,
      roughness: 0.16,
      transparent: true,
      opacity: 0.66,
    }),
  );
  const borde = filos(cuerpo, color, 0.95);
  return { cuerpo, borde };
}

// v156 — LAS LETRAS VIVAS: el título de la sala RESPIRA — flota con una
// marea lenta y su emisión late (el Dueño: «las letras... tiene animaciones»).
// Cero new por frame, cero coste en GPU: dos senos por título.
export function animarTitulo(
  tics: ((t: number, dt: number) => void)[],
  titulo: { grupo: THREE.Group; mats: THREE.MeshStandardMaterial[] },
  baseY: number,
  fase = 0,
) {
  tics.push((t) => {
    titulo.grupo.position.y = baseY + Math.sin(t * 1.25 + fase) * 0.016;
    const em = 0.55 + Math.sin(t * 1.8 + fase) * 0.24;
    for (const m of titulo.mats) m.emissiveIntensity = em;
  });
}

// pedestal — el disco del que nace la sala
export function pedestal(r: number, color: number): THREE.Group {
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
export function polvo(n: number, color: number, radio: number, altura: number): THREE.Points {
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
export function acotar(s: string, n: number): string {
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
  animarTitulo(tics, titulo, 0.9);
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
    const paso = ((baseW - 0.32) * (ctx.movil ? 0.62 : 0.55)) / datos.length; // v165: el mercado entra a la derecha
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

  // ═══ v165 EL MERCADO ENTERO — lista tocable + cartera del piloto ═══
  // la derecha de la sala ES la lista: cada activo con su precio y su %,
  // tocable para INVERTIR de verdad; debajo, la cartera con VENDER
  let listaWrap: THREE.Group | null = null;
  let sigLista = "";
  const limpiarG = (g: THREE.Group) => {
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mm = m.material as THREE.Material | undefined;
      if (mm) mm.dispose();
    });
  };
  const pintarLista = (nuevo: SalaEconomia3D) => {
    const lista = (nuevo.lista || []).slice(0, ctx.movil ? 4 : 5);
    const cartera = (nuevo.cartera || []).slice(0, ctx.movil ? 2 : 3);
    const sig = JSON.stringify([lista, cartera, nuevo.monedas ?? 0]);
    if (sig === sigLista) return;
    sigLista = sig;
    if (listaWrap) { grupo.remove(listaWrap); limpiarG(listaWrap); listaWrap = null; }
    proxies.length = 0;
    if (!lista.length && !cartera.length) return;
    listaWrap = new THREE.Group();
    const listW = ctx.movil ? 0.82 : 0.94;
    const listX = ctx.movil ? 0.5 : 0.62;
    const cab = texto3D(ctx, "MERCADO EN VIVO", { tam: 0.026, prof: 0.009, color: COL_ORO, emis: 0.5 });
    cab.grupo.position.set(listX - listW / 2, 0.585, 0);
    listaWrap.add(cab.grupo);
    lista.forEach((a, i) => {
      const fila = new THREE.Group();
      const col = a.sube ? COL_VERDE : COL_ROJO;
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(listW, 0.095, 0.011)),
        reg.mat(new THREE.MeshStandardMaterial({ color: 0x0a111e, metalness: 0.92, roughness: 0.16, transparent: true, opacity: 0.6 })),
      );
      fila.add(cuerpo, new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(col, 0.75))));
      const nom = texto3D(ctx, `${a.id} ${a.chg}`.toUpperCase(), { tam: 0.02, prof: 0.007, color: col, emis: 0.5 });
      nom.grupo.position.set(-listW / 2 + 0.04, 0.006, 0.01);
      fila.add(nom.grupo);
      const pre = texto3D(ctx, acotar(a.precio.toUpperCase(), 9), { tam: 0.021, prof: 0.007, color: COL_ORO, emis: 0.55 });
      pre.grupo.position.set(listW / 2 - 0.04 - pre.ancho, 0.006, 0.01);
      fila.add(pre.grupo);
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(listW + 0.03, 0.12, 0.035)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: nuevo.tab, accion: "invertir", idx: i } };
      fila.add(proxy);
      proxies.push(proxy);
      fila.position.set(0, 0.47 - i * 0.123, -0.01 * i);
      listaWrap!.add(fila);
    });
    cartera.forEach((c, i) => {
      const fila = new THREE.Group();
      const col = c.gana ? COL_VERDE : COL_ROJO;
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(listW, 0.085, 0.011)),
        reg.mat(new THREE.MeshStandardMaterial({ color: 0x0a111e, metalness: 0.92, roughness: 0.16, transparent: true, opacity: 0.55 })),
      );
      fila.add(cuerpo, new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(col, 0.6))));
      const nom = texto3D(ctx, `${c.id} ${c.qty}`.toUpperCase(), { tam: 0.019, prof: 0.006, color: 0xd6e6ff, emis: 0.4 });
      nom.grupo.position.set(-listW / 2 + 0.04, 0.005, 0.01);
      fila.add(nom.grupo);
      const pnl = texto3D(ctx, c.pnl.toUpperCase(), { tam: 0.019, prof: 0.006, color: col, emis: 0.5 });
      pnl.grupo.position.set(listW / 2 - 0.04 - pnl.ancho, 0.005, 0.01);
      fila.add(pnl.grupo);
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(listW + 0.03, 0.11, 0.035)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: nuevo.tab, accion: "vender", idx: i } };
      fila.add(proxy);
      proxies.push(proxy);
      fila.position.set(0, -0.115 - i * 0.112, -0.01 * i);
      listaWrap!.add(fila);
    });
    grupo.add(listaWrap);
  };
  pintarLista(p);

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
      pintarLista(nuevo); // v165: la lista y la cartera viven con el mercado
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
    liberar: () => {
      if (listaWrap) limpiarG(listaWrap); // v165: la lista viaja con la sala
      reg.liberar(); titulo.mats.forEach((m) => m.dispose()); ticker.mats.forEach((m) => m.dispose()); cambio.mats.forEach((m) => m.dispose());
    },
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
  animarTitulo(tics, titulo, 0.98);
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
      // v148: la opción respiró — 24% menos de caja, cristal fino, letra
      // ajustada: mandan el neón y el dato, no el ladrillo
      const w = 0.5, h = 0.21;
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w, h, 0.013)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: votada === i ? 0x2a1a08 : 0x0a111e,
          metalness: 0.92, roughness: 0.16, transparent: true, opacity: 0.7,
          emissive: new THREE.Color(votada === i ? COL_ORO : 0x000000),
          emissiveIntensity: votada === i ? 0.35 : 0,
        })),
      );
      const borde = new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(votada === i ? COL_ORO : 0x7ab8ff, 0.9)));
      const matBorde = borde.material as THREE.LineBasicMaterial;
      placa.add(cuerpo, borde);
      // LA LETRA de la opción — extruida, real
      const letra = texto3D(ctx, String.fromCharCode(65 + i), { tam: 0.064, prof: 0.02, color: votada === i ? COL_ORO : 0x7ab8ff, emis: 0.6 });
      letra.grupo.position.set(-w / 2 + 0.07, -0.01, 0.015);
      placa.add(letra.grupo);
      // LA BARRA DE VOTOS — volumen proporcional real
      const frac = (vts[i] || 0) / totalVotos;
      const barra = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry((w - 0.26) * Math.max(frac, 0.02), 0.026, 0.009)),
        reg.mat(new THREE.MeshBasicMaterial({ color: COL_ORO, transparent: true, opacity: 0.85 })),
      );
      barra.position.set(-0.02, -h / 2 + 0.05, 0.015);
      placa.add(barra);
      // el núcleo de votos con el número
      const nv = texto3D(ctx, `${Math.round(frac * 100)}%`, { tam: 0.042, prof: 0.015, color: COL_ORO, emis: 0.55 });
      nv.grupo.position.set(w / 2 - 0.09, 0.032, 0.015);
      placa.add(nv.grupo);
      // PROXY invisible-opaco para el dedo (el Raycaster ignora visible:false)
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w + 0.05, h + 0.05, 0.04)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: p.tab, accion: "voto", idx: i } };
      placa.add(proxy);
      proxies.push(proxy);
      // abanico: 4 en fila (2×2 en móvil lo resuelve la escala del grupo)
      const cols = 2;
      const col = i % cols, fila = Math.floor(i / cols);
      placa.position.set((col - 0.5) * (w + 0.12), (0.5 - fila) * (h + 0.1), -fila * 0.05);
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
  animarTitulo(tics, titulo, 0.96, 1.3);
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
// LA GALERÍA DE JUEGOS (v164) — los juegos REALES de Vanguard en volumen:
// cada juego es un CARTUCHO 3D con su puntuación real del piloto, el
// trofeo dorado gira en lo alto, y tocar un cartucho manda JUGAR al
// panel — se juega desde dentro del mundo, sin salir del 3D.
// ────────────────────────────────────────────────────────────
function construirJuegos(ctx: CtxSala3D, p: SalaJuegos3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  const titulo = texto3D(ctx, p.titulo, { tam: 0.15, prof: 0.05, color: p.color, emis: 0.55 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.94, 0);
  animarTitulo(tics, titulo, 0.94);
  grupo.add(titulo.grupo);

  // LA PARTIDA ACTIVA — la línea fina bajo el título (juego del día / partida)
  const partida = texto3D(ctx, acotar(p.partida || "LISTOS PARA JUGAR", 46).toUpperCase(), { tam: 0.034, prof: 0.012, color: COL_ORO, emis: 0.6 });
  partida.grupo.position.set(-partida.ancho / 2, 0.7, 0);
  grupo.add(partida.grupo);

  const peana = pedestal(1.3, p.color);
  peana.position.y = -0.74;
  grupo.add(peana);

  // EL TROFEO dorado girando en lo alto de la peana + dos aros orbitando
  const trofeo = new THREE.Group();
  trofeo.position.set(0, -0.38, -0.12);
  const copa = new THREE.Mesh(
    reg.geo(new THREE.OctahedronGeometry(0.15, 0)),
    reg.mat(new THREE.MeshStandardMaterial({
      color: COL_ORO, metalness: 0.85, roughness: 0.18,
      emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.7, transparent: true, opacity: 0.95,
    })),
  );
  trofeo.add(copa);
  const arosTrofeo: THREE.Mesh[] = [];
  for (const [r, tilt] of [[0.27, 0.5], [0.35, -0.9]] as const) {
    const an = new THREE.Mesh(
      reg.geo(new THREE.TorusGeometry(r, 0.007, 8, 44)),
      reg.mat(new THREE.MeshBasicMaterial({ color: COL_ORO, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })),
    );
    an.rotation.x = Math.PI / 2 + tilt;
    trofeo.add(an);
    arosTrofeo.push(an);
  }
  grupo.add(trofeo);

  // LOS CARTUCHOS — dos columnas de placas con nombre + puntuación real
  let cartWrap = new THREE.Group();
  grupo.add(cartWrap);
  const cartuchos: { g: THREE.Group; baseY: number; fase: number }[] = [];
  const limpiar = (w: THREE.Group) => {
    w.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });
  };

  const pintar = (c: SalaJuegos3D) => {
    grupo.remove(cartWrap);
    limpiar(cartWrap);
    cartWrap = new THREE.Group();
    cartWrap.position.x = ctx.movil ? 0.05 : 0.24;
    proxies.length = 0;
    cartuchos.length = 0;

    const lista = (c.juegos || []).slice(0, 6);
    const w = 0.96, h = 0.135;
    lista.forEach((j, i) => {
      const colHex = parseInt(String(j.color || "").replace("#", ""), 16) || p.color;
      const card = new THREE.Group();
      const col = i % 2 === 0 ? -1 : 1;
      const fil = Math.floor(i / 2);
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w, h, 0.013)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: 0x0a111e, metalness: 0.92, roughness: 0.16, transparent: true, opacity: 0.64,
        })),
      );
      card.add(cuerpo, new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(colHex, 0.85))));

      // EL MUESCO de cartucho (la muesca superior como cartucho real)
      const muesca = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(0.16, 0.02, 0.015)),
        reg.mat(new THREE.MeshBasicMaterial({ color: colHex, transparent: true, opacity: 0.75 })),
      );
      muesca.position.set(0, h / 2 - 0.014, 0.012);
      card.add(muesca);

      // EL NOMBRE del juego
      const nom = texto3D(ctx, acotar(j.nombre || "JUEGO", 24).toUpperCase(), { tam: 0.03, prof: 0.01, color: colHex, emis: 0.5 });
      nom.grupo.position.set(-w / 2 + 0.045, h / 2 - 0.052, 0.012);
      card.add(nom.grupo);
      // LA PUNTUACIÓN real en oro
      if (j.detalle) {
        const det = texto3D(ctx, acotar(j.detalle, 26).toUpperCase(), { tam: 0.024, prof: 0.008, color: COL_ORO, emis: 0.5 });
        det.grupo.position.set(-w / 2 + 0.045, -h / 2 + 0.036, 0.012);
        card.add(det.grupo);
      }
      // JUGAR — el verbo en cian, invitación a tocar (solo cartuchos jugables)
      const jugable = j.jugable !== false;
      if (jugable) {
        const jugar = texto3D(ctx, "JUGAR", { tam: 0.026, prof: 0.009, color: 0x3fd6ff, emis: 0.7 });
        jugar.grupo.position.set(w / 2 - 0.045 - jugar.ancho, -h / 2 + 0.034, 0.012);
        card.add(jugar.grupo);
      }

      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.04)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: c.tab, accion: "jugar", idx: i } };
      proxy.visible = jugable; // las placas de datos no roban toques
      if (jugable) proxies.push(proxy);
      card.add(proxy);

      const baseY = 0.44 - fil * (h + 0.078);
      card.position.set(col * (w / 2 + 0.02), baseY, -fil * 0.03);
      card.userData.baseY = baseY;
      cartuchos.push({ g: card, baseY, fase: i * 1.7 });
      cartWrap.add(card);
    });

    if (!lista.length) {
      const espera = texto3D(ctx, "LOS JUEGOS LLEGAN A ESTA SALA", { tam: 0.03, prof: 0.01, color: 0x7ab8ff, emis: 0.35 });
      espera.grupo.position.set(-espera.ancho / 2, 0.42, 0);
      cartWrap.add(espera.grupo);
    }
    grupo.add(cartWrap);
  };
  pintar(p);

  // LOS RÉCORDS — la línea fina bajo la peana
  if (p.records) {
    const rec = texto3D(ctx, acotar(p.records, 52).toUpperCase(), { tam: 0.028, prof: 0.01, color: 0x9fb8dd, emis: 0.32 });
    rec.grupo.position.set(-rec.ancho / 2, -0.98, 0.02);
    grupo.add(rec.grupo);
  }

  const polvoJ = polvo(ctx.calidadBaja ? 50 : 90, p.color, 1.35, 1.9);
  polvoJ.position.y = -0.7;
  grupo.add(polvoJ);

  tics.push((t, dt) => {
    polvoJ.rotation.y += dt * 0.2;
    copa.rotation.y += dt * 0.8;
    copa.position.y = Math.sin(t * 1.6) * 0.02;
    for (const [i, an] of arosTrofeo.entries()) an.rotation.z += dt * (i === 0 ? 0.7 : -0.5);
    for (const c of cartuchos) {
      c.g.position.y = c.baseY + Math.sin(t * 1.35 + c.fase) * 0.009;
    }
  });

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "juegos") return;
      pintar(nuevo);
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => { reg.liberar(); titulo.mats.forEach((m) => m.dispose()); },
  };
}

// ────────────────────────────────────────────────────────────
// SALA GENÉRICA — v148 ESTACIÓN INFORMATIVA: TODAS las demás ramas viven
// en volumen real — título extruido + LETRAS INFORMATIVAS (qué es este
// módulo) + placas de datos vivas del agente + núcleo temático propio
// (geometría por hash del tab) + arco holográfico + partículas.
// ────────────────────────────────────────────────────────────
function construirGenerica(ctx: CtxSala3D, p: SalaGenerica3D): Sala3DInstancia {
  const reg = registrar();
  const regDin = registrar(); // las letras/datos que se repintan en vivo
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  // hash determinista del tab — cada módulo tiene su núcleo temático
  const hashDe = (s: string): number => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h;
  };

  // ── EL TÍTULO en volumen — la firma de la sala (escala honesta: un título
  // largo nunca desborda el portal, se acota como un HUD militar) ──
  const titulo = texto3D(ctx, p.titulo, { tam: 0.165, prof: 0.055, color: p.color, emis: 0.6 });
  const escalaT = Math.min(1, 1.92 / titulo.ancho);
  titulo.grupo.scale.setScalar(escalaT);
  titulo.grupo.position.set(-titulo.ancho * escalaT / 2, 0.55, 0);
  animarTitulo(tics, titulo, 0.55, 0.7);
  grupo.add(titulo.grupo);

  // ── LAS LETRAS INFORMATIVAS — qué es este módulo, en volumen real ──
  const grupoLineas = new THREE.Group();
  const matsLineas: THREE.MeshStandardMaterial[] = [];
  const pintarLineas = (lineas: string[]) => {
    limpiarGrupoLocal(grupoLineas);
    matsLineas.length = 0;
    // v167 BUG R19: en móvil el texto era microscópico (cola v159) — sube 1.3×
    const tamLinea = ctx.movil ? 0.068 : 0.052;
    const limpias = (lineas || []).slice(0, 3).map((l) => acotar(l, 44)).filter(Boolean);
    limpias.forEach((linea, i) => {
      const t = texto3D(ctx, linea, { tam: tamLinea, prof: ctx.movil ? 0.02 : 0.016, color: 0xbfe3ff, emis: 0.4 });
      const esc = Math.min(1, 1.9 / t.ancho);
      t.grupo.scale.setScalar(esc);
      t.grupo.position.set(-t.ancho * esc / 2, 0.37 - i * 0.072, 0);
      grupoLineas.add(t.grupo);
      matsLineas.push(...t.mats);
    });
    grupoLineas.visible = limpias.length > 0;
  };
  grupo.add(grupoLineas);

  // ── LAS PLACAS DE DATOS — las stats vivas del agente como hologramas ──
  const grupoStats = new THREE.Group();
  const pintarStats = (stats: { k: string; v: string }[]) => {
    limpiarGrupoLocal(grupoStats);
    // v167 BUG R19: en móvil 4 placas en 2 filas eran ilegibles — 2 en una fila, más grandes
    const vivas = (stats || []).filter((s) => s && s.k && s.v).slice(0, ctx.movil ? 2 : 4);
    vivas.forEach((s, i) => {
      const lado = i % 2 === 0 ? -1 : 1;
      const fila = Math.floor(i / 2);
      const placa = new THREE.Group();
      const caja = new THREE.Mesh(
        regDin.geo(new THREE.BoxGeometry(0.56, 0.15, 0.014)),
        regDin.mat(new THREE.MeshStandardMaterial({
          color: 0x0c1526, metalness: 0.9, roughness: 0.22, transparent: true, opacity: 0.78,
        })),
      );
      const filo = new THREE.LineSegments(caja.geometry, regDin.mat(matFilo(p.color, 0.8)));
      const tk = texto3D(ctx, s.k, { tam: 0.038, prof: 0.012, color: 0x9fc7e8, emis: 0.3 });
      const escK = Math.min(1, 0.24 / tk.ancho);
      tk.grupo.scale.setScalar(escK);
      tk.grupo.position.set(-0.24, 0.028, 0.01);
      const tv = texto3D(ctx, acotar(s.v, 10), { tam: 0.05, prof: 0.014, color: COL_ORO, emis: 0.65 });
      const escV = Math.min(1, 0.3 / tv.ancho);
      tv.grupo.scale.setScalar(escV);
      tv.grupo.position.set(-0.24, -0.032, 0.01);
      placa.add(caja, filo, tk.grupo, tv.grupo);
      placa.position.set(lado * 0.66, 0.04 - fila * 0.22, 0.12);
      placa.rotation.y = lado * -0.16;
      if (ctx.movil) placa.scale.setScalar(1.22);
      grupoStats.add(placa);
    });
    grupoStats.visible = vivas.length > 0;
  };
  grupo.add(grupoStats);

  // repintado con firma anti-churn (los datos laten, la sala no rebota)
  let sigDatos = "";
  const repintarDatos = (lineas?: string[], stats?: { k: string; v: string }[]) => {
    const sig = JSON.stringify([lineas ?? [], stats ?? []]);
    if (sig === sigDatos) return;
    sigDatos = sig;
    pintarLineas(lineas ?? []);
    pintarStats(stats ?? []);
  };
  repintarDatos(p.lineas, p.stats);

  // ── EL NÚCLEO TEMÁTICO — cada módulo con su geometría propia (hash del tab):
  // esfera · icosaedro · octaedro · toro · dodecaedro · cono — con su gemelo
  // wireframe y dos anillos orbitando en direcciones opuestas ──
  const formas = ["esfera", "icosa", "octa", "toro", "dodeca", "cono"] as const;
  const forma = formas[hashDe(p.tab) % formas.length];
  let geoNucleo: THREE.BufferGeometry;
  switch (forma) {
    case "icosa": geoNucleo = new THREE.IcosahedronGeometry(0.155, 0); break;
    case "octa": geoNucleo = new THREE.OctahedronGeometry(0.17, 0); break;
    case "toro": geoNucleo = new THREE.TorusGeometry(0.115, 0.045, 10, 26); break;
    case "dodeca": geoNucleo = new THREE.DodecahedronGeometry(0.16, 0); break;
    case "cono": geoNucleo = new THREE.ConeGeometry(0.14, 0.24, 24); break;
    default: geoNucleo = new THREE.SphereGeometry(0.15, 24, 18);
  }
  reg.geo(geoNucleo);
  const nucleo = new THREE.Mesh(geoNucleo, reg.mat(new THREE.MeshStandardMaterial({
    color: p.color, metalness: 0.75, roughness: 0.28,
    emissive: new THREE.Color(p.color), emissiveIntensity: 0.4, transparent: true, opacity: 0.92,
  })));
  nucleo.position.set(0, -0.12, 0);
  grupo.add(nucleo);
  // el gemelo wireframe — el esqueleto del núcleo late un 5% alrededor
  let geoWire: THREE.BufferGeometry;
  switch (forma) {
    case "icosa": geoWire = new THREE.IcosahedronGeometry(0.172, 0); break;
    case "octa": geoWire = new THREE.OctahedronGeometry(0.188, 0); break;
    case "toro": geoWire = new THREE.TorusGeometry(0.115, 0.045, 8, 18); break;
    case "dodeca": geoWire = new THREE.DodecahedronGeometry(0.178, 0); break;
    case "cono": geoWire = new THREE.ConeGeometry(0.14, 0.24, 18); break;
    default: geoWire = new THREE.SphereGeometry(0.166, 14, 10);
  }
  reg.geo(geoWire);
  const wireNucleo = new THREE.Mesh(
    geoWire,
    reg.mat(new THREE.MeshBasicMaterial({ color: p.color, wireframe: true, transparent: true, opacity: 0.3 })),
  );
  wireNucleo.position.copy(nucleo.position);
  grupo.add(wireNucleo);
  const anillosNucleo: THREE.Mesh[] = [];
  for (const [r, incl] of [[0.26, 0.5], [0.34, -0.35]] as const) {
    const an = new THREE.Mesh(
      reg.geo(new THREE.TorusGeometry(r, 0.006, 6, 44)),
      reg.mat(new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })),
    );
    an.position.copy(nucleo.position);
    an.rotation.x = Math.PI / 2 + incl;
    grupo.add(an);
    anillosNucleo.push(an);
  }

  // ── EL ARCO holográfico que abraza el título ──
  const arco = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.74, 0.012, 8, 60, Math.PI)),
    reg.mat(new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  arco.position.y = 0.14;
  grupo.add(arco);
  const arcoInt = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.66, 0.006, 8, 60, Math.PI)),
    reg.mat(new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  arcoInt.position.y = 0.14;
  grupo.add(arcoInt);

  // ── LAS COLUMNAS del portal (dos estelas verticales) ──
  for (const s of [-1, 1]) {
    const col = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(0.035, 0.86, 0.035)),
      reg.mat(matMetal(0x101a2c)),
    );
    col.position.set(s * 0.86, 0.02, 0);
    grupo.add(col);
    const filo = new THREE.LineSegments(col.geometry, reg.mat(matFilo(p.color, 0.85)));
    filo.position.copy(col.position);
    grupo.add(filo);
  }

  const peana = pedestal(1.1, p.color);
  peana.position.y = -0.58;
  grupo.add(peana);

  const polvoSala = polvo(ctx.calidadBaja ? 55 : 100, p.color, 1.35, 1.7);
  polvoSala.position.y = -0.6;
  grupo.add(polvoSala);

  tics.push((t, dt) => {
    polvoSala.rotation.y += dt * 0.2;
    arco.rotation.z = Math.sin(t * 0.6) * 0.05;
    (arco.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(t * 1.6) * 0.25;
    // v156: la marea del título la lleva animarTitulo (único dueño de position.y)
    // el núcleo respira y sus anillos orbitan en sentidos opuestos
    nucleo.rotation.y += dt * 0.45;
    nucleo.rotation.x += dt * 0.18;
    wireNucleo.rotation.y -= dt * 0.3;
    wireNucleo.rotation.z += dt * 0.12;
    const pulso = 1 + Math.sin(t * 1.7) * 0.05;
    wireNucleo.scale.setScalar(pulso);
    anillosNucleo[0].rotation.z += dt * 0.8;
    anillosNucleo[1].rotation.z -= dt * 0.55;
    // las letras informativas flotan en bloque (una vida suave)
    grupoLineas.position.y = Math.sin(t * 0.9) * 0.008;
    grupoStats.position.y = Math.sin(t * 0.75 + 1.3) * 0.006;
  });

  // desposeedor local de los grupos dinámicos (dispose honesto en cada repintado)
  function limpiarGrupoLocal(g: THREE.Group) {
    for (const hijo of [...g.children]) {
      g.remove(hijo);
      hijo.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mm = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mm)) mm.forEach((x) => x.dispose());
        else if (mm) mm.dispose();
      });
    }
  }

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "generica") return;
      const g = nuevo as SalaGenerica3D;
      repintarDatos(g.lineas, g.stats);
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => { reg.liberar(); regDin.liberar(); titulo.mats.forEach((m) => m.dispose()); matsLineas.forEach((m) => m.dispose()); },
  };
}

// ────────────────────────────────────────────────────────────
// SALA DE CONTENIDO — v148 «NADA 2D»: la tercera ola. Las ramas
// sin constructor insignia ya NO caen a una pantalla plana: el
// panel manda sus filas reales (título, valor, barra, imagen) y
// este constructor las levanta como filas de cristal con letras
// extruidas, barras de volumen y fotos texturizadas. El contenido
// de Vanguard vive EN el espacio.
// ────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────
// v166.0 «LA CASA HABITADA» — LA CASA DEL MÓDULO.
// El Dueño: «cada módulo parezca una casa y voy entrando por
// habitaciones; la información va llegando con el tiempo y por
// el movimiento». La sala nace FACHADA con PORTAL: dentro, el
// VESTÍBULO y las HABITACIONES (vidrio, lámpara, umbral, cristal
// grande) guardan TODAS las filas del panel. Cada habitación
// DORMIDA se enciende sola por TIEMPO (olas ~6s) o por
// MOVIMIENTO (entrar a la sala anterior la despierta) — la info
// nunca llega de golpe: llega cuando el piloto la gana. El
// detalle de proximidad (letra que va y viene) y las acciones
// reales (comprar/invertir) siguen vivos fila a fila.
// ────────────────────────────────────────────────────────────
function construirContenido(ctx: CtxSala3D, p: SalaContenido3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  // ── MEDIDAS DE LA CASA ──
  const SUELO = -1.32;               // el suelo de la casa
  const TECHO = 1.42;                // el techo
  const MEDIO = 1.04;                // media anchura (paredes a ±MEDIO)
  const PROF = 2.55;                 // profundidad de cada habitación
  const PUERTA_X = 0.78;             // media anchura del vano de la puerta
  const PUERTA_Y = 0.4;              // altura del vano (desde el suelo)
  const NHABS = 3;                   // vestíbulo + 2 habitaciones
  const ALTO = TECHO - SUELO;
  const YC = (SUELO + TECHO) / 2;
  const tmpV = new THREE.Vector3();  // cero basura por frame
  const tmpW = new THREE.Vector3();

  const limpiar = (o: THREE.Object3D) => {
    o.traverse((x) => {
      const m = x as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });
  };

  interface Habitacion {
    i: number;
    filasWrap: THREE.Group;
    revelada: boolean;
    lampMats: THREE.MeshBasicMaterial[];
    vidrioMats: THREE.MeshStandardMaterial[];
    lineMats: { m: THREE.Material; base: number; vivo: number }[];
    letrero?: { mats: THREE.MeshStandardMaterial[] };
    cristal?: THREE.Group;
    luz?: THREE.PointLight;
  }
  const habs: Habitacion[] = [];

  // ── VIDRIO DORMIDO/DESPIERTO: la casa se ve brillar desde fuera ──
  const vidrioDe = () => reg.mat(new THREE.MeshStandardMaterial({
    color: 0x0b1526, metalness: 0.82, roughness: 0.24,
    transparent: true, opacity: 0.1, side: THREE.DoubleSide,
  }));
  const lineaDe = () => reg.mat(matFilo(p.color, 0.22));
  const neonDe = (op: number) => reg.mat(new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));

  // ── LA ENVOLVENTE (nace UNA vez; los datos solo repintan filas) ──
  for (let i = 0; i < NHABS; i++) {
    const zc = -(i + 0.5) * PROF;    // centro de la habitación
    const zf = -i * PROF;            // puerta frontal de la habitación
    const hab: Habitacion = { i, filasWrap: new THREE.Group(), revelada: false, lampMats: [], vidrioMats: [], lineMats: [] };

    // PARED FRONTAL con VANO (la fachada es la del vestíbulo)
    const segs: [number, number, number, number][] = [
      [-(MEDIO + PUERTA_X) / 2, YC, MEDIO - PUERTA_X, ALTO],
      [(MEDIO + PUERTA_X) / 2, YC, MEDIO - PUERTA_X, ALTO],
      [0, (PUERTA_Y + TECHO) / 2, PUERTA_X * 2, TECHO - PUERTA_Y],
    ];
    for (const [x, y, w, h] of segs) {
      const m = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(w, h, 0.05)), vidrioDe());
      m.position.set(x, y, zf);
      hab.vidrioMats.push(m.material as THREE.MeshStandardMaterial);
      const ln = new THREE.LineSegments(m.geometry, lineaDe());
      hab.lineMats.push({ m: ln.material as THREE.Material, base: 0.22, vivo: 0.55 });
      grupo.add(m, ln);
    }

    // PARED del FONDO (solo la última habitación cierra la casa)
    if (i === NHABS - 1) {
      const fondo = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(MEDIO * 2 + 0.1, ALTO, 0.06)), vidrioDe());
      fondo.position.set(0, YC, zf - PROF);
      hab.vidrioMats.push(fondo.material as THREE.MeshStandardMaterial);
      const lnF = new THREE.LineSegments(fondo.geometry, lineaDe());
      hab.lineMats.push({ m: lnF.material as THREE.Material, base: 0.22, vivo: 0.5 });
      grupo.add(fondo, lnF);
    }

    // PAREDES LATERALES de vidrio (el interior brilla desde fuera)
    for (const sx of [-1, 1]) {
      const lat = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(0.05, ALTO, PROF)), vidrioDe());
      lat.position.set(sx * (MEDIO + 0.025), YC, zc);
      hab.vidrioMats.push(lat.material as THREE.MeshStandardMaterial);
      const ln = new THREE.LineSegments(lat.geometry, lineaDe());
      hab.lineMats.push({ m: ln.material as THREE.Material, base: 0.22, vivo: 0.55 });
      grupo.add(lat, ln);
    }

    // SUELO + zócalos de neón + TECHO
    const suelo = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(MEDIO * 2 + 0.1, 0.05, PROF)), reg.mat(matMetal(0x0a1220)));
    suelo.position.set(0, SUELO - 0.025, zc);
    grupo.add(suelo);
    for (const sx of [-1, 1]) {
      const zoc = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(0.035, 0.02, PROF)), neonDe(0.14));
      zoc.position.set(sx * (MEDIO - 0.02), SUELO + 0.012, zc);
      hab.lineMats.push({ m: zoc.material as THREE.Material, base: 0.14, vivo: 0.6 });
      grupo.add(zoc);
    }
    const techo = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(MEDIO * 2 + 0.1, 0.05, PROF)), reg.mat(matMetal(0x080e1a)));
    techo.position.set(0, TECHO + 0.025, zc);
    grupo.add(techo);

    // LÁMPARA del techo (dormida: 0.05 — despierta al revelar: 0.9)
    const lampMat = reg.mat(new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.05, depthWrite: false }));
    const lamp = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(0.8, 0.02, 0.8)), lampMat);
    lamp.position.set(0, TECHO - 0.03, zc);
    hab.lampMats.push(lampMat);
    grupo.add(lamp);
    // v166 QA: la habitación necesita LUZ REAL — punto de neón del acento
    // que se enciende al revelar (intensidad 0 → 1.7): el interior se LEE
    const luz = new THREE.PointLight(p.color, 0, 7.5, 1.75);
    luz.position.set(0, TECHO - 0.4, zc);
    hab.luz = luz;
    grupo.add(luz);

    // UMBRAL luminoso en cada puerta (guía al piloto de sala en sala)
    const umbral = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(PUERTA_X * 2 - 0.08, 0.018, 0.1)), neonDe(i === 0 ? 0.8 : 0.12));
    umbral.position.set(0, SUELO + 0.012, zf);
    grupo.add(umbral);
    if (i > 0) hab.lineMats.push({ m: umbral.material as THREE.Material, base: 0.12, vivo: 0.6 });

    // LETRERO de la puerta: «SALA II» / «SALA III»
    if (i > 0) {
      const rom = i === 1 ? "II" : "III";
      const letr = texto3D(ctx, `SALA ${rom}`, { tam: 0.042, prof: 0.012, color: p.color, emis: 0.3 });
      letr.grupo.position.set(-letr.ancho / 2, PUERTA_Y + 0.34, zf + 0.035);
      for (const m of letr.mats) { m.transparent = true; m.opacity = 0.2; }
      hab.letrero = { mats: letr.mats };
      grupo.add(letr.grupo);
    }

    // v166 EL CRISTAL GRANDE — figura viva de la habitación (hab 2 y 3),
    // gema sobre columna de luz: la «figura grande que puedo ver»
    if (i > 0) {
      const cristal = new THREE.Group();
      const col = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.045, 0.075, 1.55, 12)), neonDe(0.3));
      col.position.set(0, SUELO + 0.8, 0);
      cristal.add(col);
      const pie = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.11, 0.15, 0.05, 24)), reg.mat(matMetal(0x101a2c)));
      pie.position.set(0, SUELO + 0.028, 0);
      cristal.add(pie);
      const gema = new THREE.Mesh(
        reg.geo(new THREE.OctahedronGeometry(0.23, 0)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: p.color, metalness: 0.7, roughness: 0.22,
          emissive: new THREE.Color(p.color), emissiveIntensity: 0.75, transparent: true, opacity: 0.92,
        })),
      );
      gema.position.y = 0.5;
      cristal.add(gema);
      const anillo = new THREE.Mesh(reg.geo(new THREE.TorusGeometry(0.34, 0.007, 8, 44)), neonDe(0.5));
      anillo.position.y = 0.5;
      anillo.rotation.x = Math.PI / 2.2;
      cristal.add(anillo);
      cristal.position.set(ctx.movil ? 0.52 : 0.44, 0, 0.5);
      const idxC = i;
      tics.push((t, dt) => {
        if (!hab.revelada) return;
        gema.rotation.y += dt * 0.7;
        anillo.rotation.z += dt * 0.9;
        gema.position.y = 0.5 + Math.sin(t * 1.2 + idxC) * 0.02;
      });
      hab.cristal = cristal;
      grupo.add(cristal);
    }

    habs.push(hab);
  }

  // ── LA FACHADA: título sobre el portal + arco vivo ──
  const titulo = texto3D(ctx, p.titulo, { tam: 0.15, prof: 0.05, color: p.color, emis: 0.55 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.95, 0.05);
  animarTitulo(tics, titulo, 0.95);
  grupo.add(titulo.grupo);

  const arco = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(PUERTA_X + 0.05, 0.011, 8, 60, Math.PI)),
    reg.mat(new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  arco.position.set(0, PUERTA_Y, 0.04);
  grupo.add(arco);

  // v165 EL MONUMENTO — la FIGURA GRANDE del vestíbulo: torre de 3 cuerpos
  // coronada por la INICIAL del módulo girando con su aro orbital
  const monumento = new THREE.Group();
  monumento.position.set(ctx.movil ? 0.4 : 0.48, SUELO + 0.02, -1.6);
  monumento.scale.setScalar(ctx.movil ? 0.62 : 0.72);
  let acuY = 0;
  for (const [cw, ch] of [[0.17, 0.52], [0.125, 0.4], [0.085, 0.3]] as const) {
    const c = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(cw, ch, cw)),
      reg.mat(new THREE.MeshStandardMaterial({ color: 0x0e1626, metalness: 0.9, roughness: 0.2, transparent: true, opacity: 0.96 })),
    );
    c.position.y = acuY + ch / 2;
    monumento.add(c, new THREE.LineSegments(c.geometry, reg.mat(matFilo(p.color, 0.7))));
    acuY += ch;
  }
  const letraInicial = (p.titulo || "?").replace(/\s+/g, "").charAt(0).toUpperCase() || "?";
  const letraBig = texto3D(ctx, letraInicial, { tam: 0.36, prof: 0.13, color: p.color, emis: 0.75 });
  const ejeLetra = new THREE.Group();
  letraBig.grupo.position.set(-letraBig.ancho / 2, 0, 0);
  ejeLetra.add(letraBig.grupo);
  ejeLetra.position.y = acuY + 0.34;
  monumento.add(ejeLetra);
  const aroM = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.3, 0.008, 8, 44)),
    reg.mat(new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  aroM.position.y = acuY + 0.34;
  aroM.rotation.x = Math.PI / 2.25;
  monumento.add(aroM);
  grupo.add(monumento);
  tics.push((t, dt) => {
    ejeLetra.rotation.y += dt * 0.55;
    aroM.rotation.z += dt * 0.85;
    monumento.position.y = SUELO + 0.02 + Math.sin(t * 0.9) * 0.012;
  });

  // contenedor del resumen (se repinta con datos)
  let rzObj: THREE.Group | null = null;
  // contenedor del estado vacío
  let esperaObj: THREE.Group | null = null;
  // firma anti-churn de los datos
  let sigKey = "";

  // ═══ v165/v166 EL DETALLE DE PROXIMIDAD ═══
  // al ACERCARSE a una fila, SU info nueva brota en letras doradas que van
  // y vienen (entra flotando, sale desvaneciéndose) — ahora en TODA la casa
  const filasVivas: { g: THREE.Group; f: FilaContenido3D; hab: Habitacion }[] = [];
  let detGrupo: THREE.Group | null = null;
  let detMats: { m: THREE.Material; base: number }[] = [];
  let detObjetivo = -1;
  let detOp = 0;
  let detEscaneo = 0;
  const detQ = new THREE.Quaternion();
  const detE = new THREE.Euler();

  const matarDetalle = () => {
    if (detGrupo) { grupo.remove(detGrupo); limpiar(detGrupo); detGrupo = null; detMats = []; }
  };

  const brotarDetalle = (texto: string) => {
    matarDetalle();
    detGrupo = new THREE.Group();
    const tx = texto3D(ctx, acotar(texto.toUpperCase(), 52), { tam: 0.023, prof: 0.008, color: COL_ORO, emis: 0.7 });
    tx.grupo.position.set(-tx.ancho / 2, 0, 0);
    detGrupo.add(tx.grupo);
    for (const m of tx.mats) detMats.push({ m, base: 1 });
    const pin = new THREE.Mesh(
      reg.geo(new THREE.ConeGeometry(0.013, 0.045, 4)),
      reg.mat(new THREE.MeshBasicMaterial({ color: COL_ORO, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })),
    );
    pin.rotation.x = Math.PI;
    pin.position.set(0.015, -0.05, 0);
    detGrupo.add(pin);
    detMats.push({ m: pin.material as THREE.Material, base: 0.85 });
    detGrupo.visible = false;
    grupo.add(detGrupo);
  };

  // ═══ v166 REVELAR UNA HABITACIÓN — la lámpara se enciende, el vidrio
  // sube, el umbral arde y las filas ENTRAN en cascada ═══
  const revelarHab = (hab: Habitacion) => {
    if (hab.revelada) return;
    hab.revelada = true;
    for (const m of hab.lampMats) ctx.animarP(m, { opacity: 0.9 }, 750, { ease: easeOut });
    for (const m of hab.vidrioMats) ctx.animarP(m, { opacity: 0.48 }, 850, { ease: easeOut });
    if (hab.luz) {
      const lo = { i: 0 };
      ctx.animarP(lo, { i: 1.7 }, 800, { ease: easeOut, onUpdate: () => { if (hab.luz) hab.luz.intensity = lo.i; } });
    }
    for (const l of hab.lineMats) ctx.animarP(l.m, { opacity: l.vivo }, 850, { ease: easeOut });
    if (hab.letrero) for (const m of hab.letrero.mats) ctx.animarP(m, { opacity: 0.9 }, 750, { ease: easeOut });
    hab.filasWrap.visible = true;
    if (hab.cristal) {
      hab.cristal.scale.setScalar(0.001);
      const cr = { d: 0 };
      ctx.animarP(cr, { d: 1 }, 620, { ease: easeOut, onDone: () => { if (hab.cristal) hab.cristal.scale.setScalar(1); } });
    }
    hab.filasWrap.children.forEach((ch, i) => {
      const ret = { d: 0 };
      ctx.animarP(ret, { d: 1 }, Math.max(1, 80 + i * 130), {
        ease: easeOut,
        onDone: () => {
          ch.scale.setScalar(1);
          // v172 SONIDO DE CASCADA: una gota de cristal por fila revelada
          // (pitch ascendente 1 → ~1.7; solo filas reales, no placas de pie)
          if (ch.userData.baseY !== undefined) ctx.sonar?.("cascada", 1 + i * 0.09);
        },
      });
      ch.scale.setScalar(0.001);
    });
  };

  // ── v166 LA INFORMACIÓN LLEGA POR MOVIMIENTO ──
  // entrar (o volar cerca) de una habitación despierta la SIGUIENTE;
  // la cámara se lee en coordenadas LOCALES de la casa
  const chequearMovimiento = () => {
    const cam = ctx.camara;
    if (!cam) return;
    tmpV.copy(cam);
    grupo.worldToLocal(tmpV);
    if (Math.abs(tmpV.x) > 3.2 || tmpV.y < SUELO - 2 || tmpV.y > TECHO + 2.5) return;
    const iz = Math.floor(-tmpV.z / PROF);
    if (iz < 0 || iz >= NHABS) return;
    if (!habs[iz].revelada) revelarHab(habs[iz]);
    if (iz + 1 < NHABS && !habs[iz + 1].revelada) revelarHab(habs[iz + 1]);
  };

  const escanear = () => {
    chequearMovimiento();
    const cam = ctx.camara;
    if (!cam || !filasVivas.length) { detObjetivo = -1; return; }
    let mejor = -1;
    let mejorD = Infinity;
    for (let i = 0; i < filasVivas.length; i++) {
      const fv = filasVivas[i];
      if (!fv.hab.revelada) continue; // una sala dormida no habla
      fv.g.getWorldPosition(tmpW);
      const dd = tmpW.distanceTo(cam);
      if (dd < mejorD) { mejorD = dd; mejor = i; }
    }
    const radio = ctx.movil ? 2.0 : 2.55;
    if (mejorD > radio) mejor = -1;
    if (mejor === detObjetivo) return;
    detObjetivo = mejor;
    if (mejor >= 0) {
      const fv = filasVivas[mejor];
      const f = fv.f;
      const piezas = [
        f.d,
        f.v ? `VALOR ${f.v}` : "",
        typeof f.p === "number" && isFinite(f.p) ? `NIVEL ${Math.round(f.p)}%` : "",
        f.a ? `TOCA PARA ${f.a.toUpperCase()}` : "",
      ].filter(Boolean) as string[];
      brotarDetalle(piezas.join(" · ") || acotar(f.t, 44));
      // el detalle nace JUNTO a la fila (coordenadas locales de la casa)
      fv.g.getWorldPosition(tmpW);
      grupo.worldToLocal(tmpW);
      detGrupo!.position.set(tmpW.x, tmpW.y + 0.11, tmpW.z);
      detGrupo!.userData.basePos = { x: tmpW.x, y: tmpW.y + 0.11, z: tmpW.z };
    }
  };

  // ═══ v166 LA INFORMACIÓN LLEGA CON EL TIEMPO — olas: el vestíbulo
  // nace encendido; cada habitación despierta sola cada ~6s ═══
  let reloj = 0;

  // ═══ v172 PAGINACIÓN UNIVERSAL (patrón BOLSA) ═══
  // ninguna fila se pierde: las que no caben en la casa esperan su página
  // tras las placas SIGUIENTE/ATRAS — el mundo las pagea con __pagina
  let pag = 0;
  let totalPag = 1;
  let ultimaC: SalaContenido3D | null = null;

  const pintar = (c: SalaContenido3D) => {
    // las filas viejas se desintegran (dispose completo)
    for (const hab of habs) {
      if (hab.filasWrap.parent) grupo.remove(hab.filasWrap);
      limpiar(hab.filasWrap);
      hab.filasWrap = new THREE.Group();
      hab.filasWrap.position.set(0, 0, -(hab.i + 0.5) * PROF);
      if (!hab.revelada) hab.filasWrap.visible = false;
      grupo.add(hab.filasWrap);
    }
    proxies.length = 0;
    filasVivas.length = 0;
    detObjetivo = -1;
    matarDetalle();

    // RESUMEN — la línea fina sobre el portal
    if (rzObj) { grupo.remove(rzObj); limpiar(rzObj); rzObj = null; }
    if (c.resumen) {
      const rz = texto3D(ctx, acotar(c.resumen, 46), { tam: 0.032, prof: 0.011, color: 0x9fb8dd, emis: 0.32 });
      rz.grupo.position.set(-rz.ancho / 2, 0.62, 0.05);
      grupo.add(rz.grupo);
      rzObj = rz.grupo;
    }

    // reparto de filas por habitación: estanterías de 3 (7 máximo en móvil)
    // v172: el slice se vuelve PÁGINA — densidad adaptativa (ley móvil):
    // misma estantería, pero el resto es TOCABLE, no una confesión
    const MAX = ctx.movil ? 7 : 9;
    const w = 1.02, h = 0.115;
    ultimaC = c;
    const todas = c.filas || [];
    totalPag = Math.max(1, Math.ceil(todas.length / MAX));
    if (pag >= totalPag) pag = totalPag - 1;
    const visibles = todas.slice(pag * MAX, (pag + 1) * MAX);
    const POR_HAB = 3;
    visibles.forEach((f, gi) => {
      const hab = habs[Math.min(NHABS - 1, Math.floor(gi / POR_HAB))];
      const j = gi % POR_HAB;
      const fila = new THREE.Group();
      const colFila = parseInt(String(f.color || "").replace("#", ""), 16) || p.color;
      const tieneImg = !!f.img;
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w, h, 0.013)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: 0x0a111e, metalness: 0.92, roughness: 0.16, transparent: true, opacity: 0.74,
        })),
      );
      fila.add(cuerpo, new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(colFila, 0.8))));

      // LA IMAGEN de la fila — plano texturizado (miniatura de la estantería)
      let dx = -w / 2 + 0.045;
      if (tieneImg) {
        const img = planoImagen3D(f.img!, acotar(f.t, 10), `#${colFila.toString(16).padStart(6, "0")}`, f.t, 0.1, 0.066);
        img.position.set(-w / 2 + 0.068, 0, 0.012);
        fila.add(img);
        dx = -w / 2 + 0.135;
      }

      // EL TEXTO extruido de la fila
      const txt = texto3D(ctx, acotar(f.t || "-", tieneImg ? 22 : 28).toUpperCase(), { tam: 0.025, prof: 0.008, color: colFila, emis: 0.45 });
      txt.grupo.position.set(dx, h / 2 - 0.036, 0.012);
      fila.add(txt.grupo);

      // LA ACCIÓN — botón real verde (COMPRAR / INVERTIR / RECLAMAR…)
      let actX = w / 2 - 0.04;
      let actW = 0.09;
      if (f.a) {
        const act = texto3D(ctx, acotar(f.a, 9).toUpperCase(), { tam: 0.017, prof: 0.006, color: 0x0b1626, emis: 0.12 });
        actW = Math.max(act.ancho + 0.026, 0.09);
        const boton = new THREE.Mesh(
          reg.geo(new THREE.BoxGeometry(actW, 0.032, 0.012)),
          reg.mat(new THREE.MeshBasicMaterial({ color: COL_VERDE, transparent: true, opacity: 0.92 })),
        );
        actX = w / 2 - 0.04 - actW / 2;
        boton.position.set(actX, h / 2 - 0.036, 0.014);
        act.grupo.position.set(-act.ancho / 2, 0, 0.006);
        boton.add(act.grupo);
        fila.add(boton);
      }

      // EL VALOR en oro (a la derecha; si hay botón, a su izquierda)
      if (f.v) {
        const val = texto3D(ctx, acotar(f.v, 14).toUpperCase(), { tam: 0.026, prof: 0.008, color: COL_ORO, emis: 0.55 });
        const bordeVal = f.a ? actX - actW / 2 - 0.03 : w / 2 - 0.045;
        val.grupo.position.set(bordeVal - val.ancho, h / 2 - 0.036, 0.012);
        fila.add(val.grupo);
      }

      // LA BARRA de volumen (0..100)
      if (typeof f.p === "number" && isFinite(f.p)) {
        const frac = Math.max(0.02, Math.min(1, f.p / 100));
        const barra = new THREE.Mesh(
          reg.geo(new THREE.BoxGeometry((w - 0.09) * frac, 0.016, 0.008)),
          reg.mat(new THREE.MeshBasicMaterial({ color: colFila, transparent: true, opacity: 0.85 })),
        );
        barra.position.set(-w / 2 + 0.045 + ((w - 0.09) * frac) / 2, -h / 2 + 0.02, 0.012);
        fila.add(barra);
      }

      // PROXY — la fila es tocable (la acción viaja al panel y EJECUTA)
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.04)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: c.tab, accion: f.a || "fila", idx: gi } };
      fila.add(proxy);
      proxies.push(proxy);

      // LA ESTANTERÍA de la pared izquierda (la fila mira al pasillo)
      fila.rotation.y = Math.PI / 2 - 0.55;
      fila.position.set(-MEDIO + 0.07, 0.62 - j * 0.34, (j - 1) * 0.82);
      fila.userData.baseY = fila.position.y;
      hab.filasWrap.add(fila);
      filasVivas.push({ g: fila, f, hab });

      // v166 EL CUADRO GRANDE — las filas con imagen cuelgan ENMARCADAS
      // en la pared derecha: figuras grandes que el piloto ve al entrar
      if (tieneImg && j < 2) {
        const cuadro = new THREE.Group();
        const marco = new THREE.Mesh(
          reg.geo(new THREE.BoxGeometry(0.62, 0.44, 0.02)),
          reg.mat(new THREE.MeshStandardMaterial({ color: 0x0a111e, metalness: 0.9, roughness: 0.2, transparent: true, opacity: 0.72 })),
        );
        cuadro.add(marco, new THREE.LineSegments(marco.geometry, reg.mat(matFilo(colFila, 0.85))));
        const grande = planoImagen3D(f.img!, acotar(f.t, 10), `#${colFila.toString(16).padStart(6, "0")}`, f.t, 0.54, 0.36);
        grande.position.z = 0.014;
        cuadro.add(grande);
        const pieC = texto3D(ctx, acotar(f.t || "-", 20).toUpperCase(), { tam: 0.022, prof: 0.007, color: colFila, emis: 0.5 });
        pieC.grupo.position.set(-pieC.ancho / 2, -0.27, 0.012);
        cuadro.add(pieC.grupo);
        cuadro.rotation.y = -Math.PI / 2 + 0.55;
        cuadro.position.set(MEDIO - 0.07, 0.42 - j * 0.62, (j - 1) * 0.3 + 0.2);
        cuadro.userData.baseY = cuadro.position.y;
        hab.filasWrap.add(cuadro);
      }
    });

    // v172 LAS PLACAS DE PÁGINA — todo lo que no cabe ES TOCABLE (patrón
    // BOLSA): SIGUIENTE/ATRAS como placas doradas al pie de la última
    // habitación; el raycast las devuelve al mundo (accion "__pagina",
    // asunto del mundo: nunca viaja a la Casa ni se cuenta como acción)
    if (todas.length > MAX) {
      const placaPag = (texto: string, destino: number, x: number) => {
        const wrap = new THREE.Group();
        const cuerpo = new THREE.Mesh(
          reg.geo(new THREE.BoxGeometry(0.66, 0.14, 0.013)),
          reg.mat(new THREE.MeshStandardMaterial({
            color: 0x2a1a08, metalness: 0.88, roughness: 0.24, transparent: true, opacity: 0.82,
            emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.3,
          })),
        );
        const borde = new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(COL_ORO, 0.95)));
        wrap.add(cuerpo, borde);
        const txt = texto3D(ctx, acotar(texto, 14), { tam: 0.036, prof: 0.012, color: COL_ORO, emis: 0.65 });
        txt.grupo.position.set(-txt.ancho / 2, -0.01, 0.015);
        wrap.add(txt.grupo);
        const proxy = new THREE.Mesh(
          reg.geo(new THREE.BoxGeometry(0.72, 0.19, 0.04)),
          reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
        );
        proxy.userData = { salaAccion: { tab: c.tab, accion: "__pagina", idx: destino } };
        wrap.add(proxy);
        proxies.push(proxy);
        wrap.position.set(x, -0.52, -PROF / 2 + 0.22);
        habs[NHABS - 1].filasWrap.add(wrap);
      };
      if (pag < totalPag - 1) placaPag(`SIGUIENTE ${pag + 2}/${totalPag}`, pag + 1, 0.42);
      if (pag > 0) placaPag(`ATRAS ${pag}/${totalPag}`, pag - 1, -0.42);
    }

    // estado vacío: la casa confiesa que espera al panel
    if (esperaObj) { grupo.remove(esperaObj); limpiar(esperaObj); esperaObj = null; }
    if (!(c.filas || []).length) {
      const espera = texto3D(ctx, "EL PANEL ALIMENTA ESTA CASA", { tam: 0.03, prof: 0.01, color: 0x7ab8ff, emis: 0.35 });
      espera.grupo.position.set(-espera.ancho / 2, 0.44, -1.2);
      grupo.add(espera.grupo);
      esperaObj = espera.grupo;
    }
  };

  pintar({
    ...p,
    filas: (p.filas || []).map((f) => ({ ...f, p: Number(f.p) })),
  });

  // EL VESTÍBULO nace encendido (la cascada de entrada)
  revelarHab(habs[0]);

  const polvoC = polvo(ctx.calidadBaja ? 50 : 90, p.color, 1.5, 2.0);
  polvoC.position.set(0, SUELO + 0.5, -PROF * 1.5);
  grupo.add(polvoC);

  tics.push((t, dt) => {
    polvoC.rotation.y += dt * 0.2;
    arco.rotation.z = Math.sin(t * 0.6) * 0.04;
    (arco.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(t * 1.6) * 0.22;
    // v166 LAS OLAS DEL TIEMPO: cada ~6s despierta la siguiente habitación
    reloj += dt;
    if (!habs[1].revelada && reloj > 6) revelarHab(habs[1]);
    if (!habs[2].revelada && reloj > 12) revelarHab(habs[2]);
    // el escaneo de proximidad (detalle + movimiento) late cada 0.12s
    detEscaneo += dt;
    if (detEscaneo >= 0.12) { detEscaneo = 0; escanear(); }
    // LA MAREA — cada habitación encendida respirando
    for (const hab of habs) {
      if (!hab.revelada) continue;
      hab.filasWrap.children.forEach((ch, i) => {
        if (ch === detGrupo) return;
        const baseY = (ch.userData.baseY as number | undefined) ?? ch.position.y;
        ch.position.y = baseY + Math.sin(t * 1.4 + i * 0.9) * 0.006;
      });
    }
    if (!detGrupo) return;
    // LA LETRA VA Y VIENE: entra flotando al acercarse, se desvanece al irse
    detOp = detObjetivo >= 0 ? Math.min(1, detOp + dt * 4.5) : Math.max(0, detOp - dt * 3.4);
    detGrupo.visible = detOp > 0.02;
    if (!detGrupo.visible) return;
    for (const d of detMats) (d.m as THREE.Material).opacity = d.base * detOp;
    const bp = detGrupo.userData.basePos as { x: number; y: number; z: number } | undefined;
    if (bp) {
      detGrupo.position.set(bp.x, bp.y + Math.sin(t * 2.3) * 0.005, bp.z);
      if (ctx.camara) {
        // billboard SOLO yaw: la letra mira al piloto sin marear la casa
        detGrupo.getWorldPosition(tmpW);
        grupo.getWorldQuaternion(detQ);
        detE.setFromQuaternion(detQ, "YXZ");
        detGrupo.rotation.y = Math.atan2(ctx.camara.x - tmpW.x, ctx.camara.z - tmpW.z) - detE.y;
      }
    }
  });

  return {
    grupo,
    proxies,
    // v172: la página vive EN el mundo — pintar directo (la firma
    // anti-churn de actualizar queda intacta: los datos no cambiaron)
    paginar: (destino) => {
      const MAXP = ctx.movil ? 7 : 9;
      const total = Math.max(1, Math.ceil((ultimaC?.filas || []).length / MAXP));
      const dest = Math.max(0, Math.min(total - 1, destino));
      if (!ultimaC || dest === pag) return;
      pag = dest;
      pintar(ultimaC);
    },
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "contenido") return;
      const sig = JSON.stringify((nuevo.filas || []).map((f) => [f.t, f.v, f.p, f.img, f.color, f.d, f.a])) + `|${nuevo.resumen ?? ""}|${nuevo.mas ?? ""}`;
      if (sig === sigKey) return;
      sigKey = sig;
      pintar(nuevo);
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => {
      matarDetalle();
      reg.liberar(); titulo.mats.forEach((m) => m.dispose());
      for (const hab of habs) limpiar(hab.filasWrap);
      if (rzObj) limpiar(rzObj);
      if (esperaObj) limpiar(esperaObj);
    },
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
  animarTitulo(tics, titulo, 0.98);
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

  // ── v164 LA REDACCIÓN EN VIVO ──────────────────────────────
  // (1) EL CARTEL EN VIVO — letras rojas que palpitan como un pulso de
  //     cabina de emisión; junto a él, los ESPECTADORES reales del server.
  // (2) EL FARO DE ÚLTIMA HORA — anillo dorado que late alrededor del
  //     núcleo cuando el cable más nuevo sigue caliente (< 15 min).
  const enVivo = texto3D(ctx, "EN VIVO", { tam: 0.055, prof: 0.02, color: 0xff3d55, emis: 1.0 });
  enVivo.grupo.position.set(0.62 - enVivo.ancho, 1.08, 0);
  grupo.add(enVivo.grupo);
  const penna = new THREE.Mesh(
    reg.geo(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 6)),
    reg.mat(new THREE.MeshBasicMaterial({ color: 0xff3d55 })),
  );
  penna.position.set(0.58, 1.055, 0);
  grupo.add(penna);

  let especWrap = new THREE.Group();
  especWrap.position.set(DESPLAZ, -0.52, 0.05);
  grupo.add(especWrap);
  const pintarEspectadores = (n: number | undefined) => {
    grupo.remove(especWrap);
    especWrap.traverse((x) => {
      const m = x as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mm = m.material as THREE.Material | undefined;
      if (mm) mm.dispose();
    });
    especWrap = new THREE.Group();
    especWrap.position.set(DESPLAZ, -0.52, 0.05);
    const txt = typeof n === "number" && n > 0
      ? `${n} ESPECTADORES EN DIRECTO`
      : "DIRECTO · SINTONIZANDO…";
    const t = texto3D(ctx, txt, { tam: 0.028, prof: 0.01, color: 0x3fd6ff, emis: 0.65 });
    t.grupo.position.set(-t.ancho / 2, 0, 0);
    especWrap.add(t.grupo);
    grupo.add(especWrap);
  };
  pintarEspectadores(p.espectadores);

  // EL FARO — anillo dorado latiendo cuando hay ÚLTIMA HORA
  const faro = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.34, 0.012, 8, 40)),
    reg.mat(new THREE.MeshBasicMaterial({ color: 0xffd76a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  faro.position.copy(nucleo.position);
  grupo.add(faro);
  const flash = { t: 0 }; // segundos restantes del destello (recargado al renovar)
  if (p.ultimo) flash.t = 6;

  tics.push((t, dt) => {
    polvoAzul.rotation.y += dt * 0.16;
    corazon.rotation.y += dt * 0.7;
    corazon.rotation.x += dt * 0.35;
    (corazon.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + Math.sin(t * 2.1) * 0.3;
    // EL PULSO del cartel EN VIVO (latido de cabina, 1.4 Hz)
    const latido = 0.62 + Math.max(0, Math.sin(t * 8.8)) * 0.55;
    for (const m of enVivo.mats) {
      m.emissiveIntensity = latido;
      m.opacity = 0.72 + latido * 0.28;
    }
    // EL FARO late mientras el cable está caliente y se apaga solo
    if (flash.t > 0) {
      flash.t -= dt;
      const ola = 0.5 + Math.sin(t * 5.2) * 0.5;
      faro.rotation.x += dt * 0.9;
      faro.rotation.y += dt * 1.3;
      (faro.material as THREE.MeshBasicMaterial).opacity = Math.min(0.85, flash.t / 3) * ola;
      faro.scale.setScalar(1 + Math.sin(t * 3.1) * 0.08);
    } else if ((faro.material as THREE.MeshBasicMaterial).opacity !== 0) {
      (faro.material as THREE.MeshBasicMaterial).opacity = 0;
      flash.t = 0;
    }
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
      pintarEspectadores(nuevo.espectadores);
      if (nuevo.ultimo) flash.t = 6;
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => { reg.liberar(); titulo.mats.forEach((m) => m.dispose()); enVivo.mats.forEach((m) => m.dispose()); },
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
  animarTitulo(tics, titulo, 0.98);
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
    // v148: 22% menos de caja + cristal fino — el examen respira
    const w = 0.9, h = 0.21;
    (q.opciones || []).slice(0, 4).forEach((op, i) => {
      const placa = new THREE.Group();
      const esCorrecta = q.revelada && q.correcta === i;
      const esFallo = q.revelada && q.seleccionada === i && q.correcta !== i;
      const apagada = q.revelada && !esCorrecta && !esFallo;
      const col = esCorrecta ? COL_VERDE : esFallo ? COL_ROJO : apagada ? 0x5a6a80 : 0x7ab8ff;
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w, h, 0.013)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: 0x0a111e, metalness: 0.92, roughness: 0.16, transparent: true, opacity: apagada ? 0.4 : 0.7,
          emissive: new THREE.Color(esCorrecta ? COL_VERDE : esFallo ? COL_ROJO : 0x000000), emissiveIntensity: 0.22,
        })),
      );
      const borde = new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(col, apagada ? 0.4 : 0.9)));
      placa.add(cuerpo, borde);
      const letra = texto3D(ctx, String.fromCharCode(65 + i), { tam: 0.06, prof: 0.02, color: col, emis: 0.6 });
      letra.grupo.position.set(-w / 2 + 0.075, -0.012, 0.015);
      placa.add(letra.grupo);
      const txt = texto3D(ctx, acotar(op || "-", 26).toUpperCase(), { tam: 0.034, prof: 0.011, color: apagada ? 0x5a6a80 : col, emis: 0.45 });
      txt.grupo.position.set(-w / 2 + 0.185, -0.012, 0.015);
      placa.add(txt.grupo);
      if (!q.revelada) {
        const proxy = new THREE.Mesh(
          reg.geo(new THREE.BoxGeometry(w + 0.05, h + 0.05, 0.04)),
          reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
        );
        proxy.userData = { salaAccion: { tab: p.tab, accion: "responder", idx: i } };
        placa.add(proxy);
        proxies.push(proxy);
      }
      const colG = i % 2, fila = Math.floor(i / 2);
      placa.position.set((colG - 0.5) * (w + 0.1), -0.04 - fila * (h + 0.09), -fila * 0.045);
      opsWrap.add(placa);
    });

    // SIGUIENTE — la placa dorada nace al revelar (v148: chip fino y compacto)
    if (q.revelada) {
      sigWrap = new THREE.Group();
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(0.68, 0.15, 0.013)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: 0x2a1a08, metalness: 0.88, roughness: 0.24, transparent: true, opacity: 0.82,
          emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.3,
        })),
      );
      const borde = new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(COL_ORO, 0.95)));
      sigWrap.add(cuerpo, borde);
      const txt = texto3D(ctx, "SIGUIENTE", { tam: 0.042, prof: 0.014, color: COL_ORO, emis: 0.65 });
      txt.grupo.position.set(-txt.ancho / 2, -0.011, 0.015);
      sigWrap.add(txt.grupo);
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(0.74, 0.2, 0.04)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: p.tab, accion: "siguiente", idx: -1 } };
      sigWrap.add(proxy);
      proxies.push(proxy);
      sigWrap.position.set(0, -0.56, 0.1);
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
    if (sigWrap) sigWrap.position.y = -0.56 + Math.sin(t * 2.2) * 0.012;
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
  animarTitulo(tics, titulo, 0.98);
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
    // v148: portal de voto esbelto — cristal fino, letra ajustada
    const w = 0.9, h = 0.2;
    (v.opciones || []).slice(0, 4).forEach((op, i) => {
      const placa = new THREE.Group();
      const votada = v.votada === i;
      const col = votada ? COL_ORO : 0x7ab8ff;
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w, h, 0.013)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: votada ? 0x2a1a08 : 0x0a111e, metalness: 0.92, roughness: 0.16, transparent: true, opacity: 0.7,
          emissive: new THREE.Color(votada ? COL_ORO : 0x000000), emissiveIntensity: votada ? 0.3 : 0,
        })),
      );
      const borde = new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(col, 0.9)));
      placa.add(cuerpo, borde);
      const letra = texto3D(ctx, String.fromCharCode(65 + i), { tam: 0.055, prof: 0.018, color: col, emis: 0.6 });
      letra.grupo.position.set(-w / 2 + 0.07, -0.012, 0.015);
      placa.add(letra.grupo);
      const txt = texto3D(ctx, acotar(op || "-", 22).toUpperCase(), { tam: 0.032, prof: 0.011, color: col, emis: 0.4 });
      txt.grupo.position.set(-w / 2 + 0.18, 0.038, 0.015);
      placa.add(txt.grupo);
      // LA BARRA DE VOTOS — volumen proporcional que respira
      const frac = (vts[i] || 0) / totalV;
      const barra = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry((w - 0.3) * Math.max(frac, 0.02), 0.024, 0.009)),
        reg.mat(new THREE.MeshBasicMaterial({ color: COL_ORO, transparent: true, opacity: 0.85 })),
      );
      barra.position.set(-w / 2 + 0.18 + ((w - 0.3) * Math.max(frac, 0.02)) / 2, -0.048, 0.015);
      placa.add(barra);
      const pct = texto3D(ctx, `${Math.round(frac * 100)}%`, { tam: 0.04, prof: 0.013, color: COL_ORO, emis: 0.55 });
      pct.grupo.position.set(w / 2 - 0.075 - pct.ancho, 0.038, 0.015);
      placa.add(pct.grupo);
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.04)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: p.tab, accion: "voto", idx: i } };
      placa.add(proxy);
      proxies.push(proxy);
      const colG = i % 2, fila = Math.floor(i / 2);
      placa.position.set((colG - 0.5) * (w + 0.1), -0.06 - fila * (h + 0.09), -fila * 0.045);
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
  animarTitulo(tics, titulo, 0.98);
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
    // v172 EL PULSO DE LA PARIDAD — la cuenta del agente vive en su sala:
    // verde si el mundo 3D manda, azul apagado si la Casa gana por ahora
    if ((b.acc3d ?? 0) > 0 || (b.acc2d ?? 0) > 0) {
      const manda3d = (b.acc3d ?? 0) >= (b.acc2d ?? 0);
      const par = texto3D(
        ctx,
        acotar(`PARIDAD 3D ${b.acc3d ?? 0} / 2D ${b.acc2d ?? 0}`, 30),
        { tam: 0.034, prof: 0.012, color: manda3d ? COL_VERDE : 0x9fb8dd, emis: 0.5 },
      );
      par.grupo.position.set(-par.ancho / 2, -0.5, 0);
      botinWrap.add(par.grupo);
    }
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
      const sig = `${nuevo.nivel}|${nuevo.xp}|${nuevo.monedas}|${nuevo.gemas}|${nuevo.racha}|${nuevo.nombre}|${nuevo.acc3d ?? -1}|${nuevo.acc2d ?? -1}`;
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
// v147 PORTAL DE CUOTAS — el mercado de predicciones en volumen:
// las dos caras del mercado (SÍ/NO) como placas monumentales con
// su cuota extruida, la barra de probabilidad como VOLUMEN y las
// fichas de apuesta tocables (10/25/50/100). Tocar = apostar de
// verdad: el mundo ejecuta el MISMO handlePredict del panel.
// ────────────────────────────────────────────────────────────
function construirPredicciones(ctx: CtxSala3D, p: SalaPredicciones3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  const titulo = texto3D(ctx, p.titulo, { tam: 0.15, prof: 0.05, color: p.color, emis: 0.55 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.98, 0);
  animarTitulo(tics, titulo, 0.98);
  grupo.add(titulo.grupo);

  const peana = pedestal(1.5, p.color);
  peana.position.y = -0.85;
  grupo.add(peana);

  const anillo = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(1.14, 0.008, 8, 56)),
    reg.mat(new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  anillo.rotation.x = Math.PI / 2;
  anillo.position.y = -0.7;
  grupo.add(anillo);

  let pregWrap = new THREE.Group();
  let opsWrap = new THREE.Group();
  let sigKey = "";
  const placas: { g: THREE.Group; baseY: number; fase: number }[] = [];

  const limpiar = (w: THREE.Group) => {
    w.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });
  };

  const pintar = (v: SalaPredicciones3D) => {
    grupo.remove(pregWrap, opsWrap);
    limpiar(pregWrap); limpiar(opsWrap);
    pregWrap = new THREE.Group(); opsWrap = new THREE.Group();
    // desplazamiento derecho del contenido (el ancla deja el globo a la izquierda)
    pregWrap.position.x = ctx.movil ? 0.06 : 0.24;
    opsWrap.position.x = ctx.movil ? 0.08 : 0.4;
    proxies.length = 0;
    placas.length = 0;

    const limpio = acotar(v.pregunta || "CARGANDO MERCADO", 62).toUpperCase();
    const mitad = Math.ceil(limpio.length / 2);
    const cortado = limpio.slice(0, mitad).lastIndexOf(" ");
    const p1 = acotar(limpio.slice(0, cortado > 14 ? cortado : mitad), 32);
    const p2 = acotar(limpio.slice(p1.length).trim(), 32);
    [p1, p2].filter(Boolean).forEach((ln, li) => {
      const t = texto3D(ctx, ln, { tam: 0.055, prof: 0.02, color: 0xffffff, emis: 0.45 });
      t.grupo.position.set(-t.ancho / 2, 0.62 - li * 0.09, 0);
      pregWrap.add(t.grupo);
    });
    const hz = texto3D(ctx, acotar(`${v.horizonte} · PREMIO x${v.mult}`, 40), { tam: 0.038, prof: 0.014, color: COL_ORO, emis: 0.5 });
    hz.grupo.position.set(-hz.ancho / 2, 0.44, 0);
    pregWrap.add(hz.grupo);

    // LAS DOS CARAS DEL MERCADO — SÍ (verde) y NO (rojo)
    // v148: monumentales ya no — elegantes: 17% menos de caja, cristal fino
    const w = 0.68, h = 0.34;
    const caras: { letra: string; cuota: number; col: number; fondo: number; idx: number }[] = [
      { letra: "SÍ", cuota: v.cuotaSi, col: COL_VERDE, fondo: 0x0a1f14, idx: 0 },
      { letra: "NO", cuota: v.cuotaNo, col: COL_ROJO, fondo: 0x1f0a0e, idx: 1 },
    ];
    caras.forEach((c, i) => {
      const placa = new THREE.Group();
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w, h, 0.014)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: c.fondo, metalness: 0.92, roughness: 0.16, transparent: true, opacity: 0.74,
          emissive: new THREE.Color(c.col), emissiveIntensity: 0.14,
        })),
      );
      placa.add(cuerpo, new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(c.col, 0.95))));
      const letra = texto3D(ctx, c.letra, { tam: 0.072, prof: 0.022, color: c.col, emis: 0.62 });
      letra.grupo.position.set(-w / 2 + 0.12, 0.03, 0.02);
      placa.add(letra.grupo);
      const cuota = texto3D(ctx, `x${c.cuota.toFixed(2)}`, { tam: 0.054, prof: 0.018, color: 0xffffff, emis: 0.5 });
      cuota.grupo.position.set(w / 2 - 0.08 - cuota.ancho, 0.05, 0.02);
      placa.add(cuota.grupo);
      // LA BARRA DE PROBABILIDAD como volumen (solo en SÍ)
      if (i === 0) {
        const frac = Math.max(0.02, Math.min(0.98, v.probSi / 100));
        const barra = new THREE.Mesh(
          reg.geo(new THREE.BoxGeometry((w - 0.12) * frac, 0.022, 0.009)),
          reg.mat(new THREE.MeshBasicMaterial({ color: COL_VERDE, transparent: true, opacity: 0.85 })),
        );
        barra.position.set(-w / 2 + 0.06 + ((w - 0.12) * frac) / 2, -0.085, 0.02);
        placa.add(barra);
        const pct = texto3D(ctx, `${Math.round(v.probSi)}%`, { tam: 0.03, prof: 0.011, color: COL_VERDE, emis: 0.5 });
        pct.grupo.position.set(w / 2 - 0.06 - pct.ancho, -0.095, 0.02);
        placa.add(pct.grupo);
      }
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.04)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: p.tab, accion: "apostar", idx: c.idx } };
      placa.add(proxy);
      proxies.push(proxy);
      placa.position.set((i - 0.5) * (w + 0.12), -0.04, 0);
      opsWrap.add(placa);
      placas.push({ g: placa, baseY: placa.position.y, fase: i * 1.7 });
    });

    // LAS FICHAS DE APUESTA — el stake se toca desde el mundo (v148: fichas finas)
    const fichas = [10, 25, 50, 100];
    fichas.forEach((val, i) => {
      const chip = new THREE.Group();
      const activo = v.stake === val;
      const fw = 0.22, fh = 0.1;
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.CylinderGeometry(fw / 2, fw / 2, 0.02, 22)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: activo ? 0x2a1a08 : 0x101a2c, metalness: 0.88, roughness: 0.24,
          emissive: new THREE.Color(activo ? COL_ORO : 0x000000), emissiveIntensity: activo ? 0.35 : 0,
          transparent: true, opacity: 0.9,
        })),
      );
      cuerpo.rotation.x = Math.PI / 2;
      chip.add(cuerpo);
      const borde = new THREE.Mesh(
        reg.geo(new THREE.TorusGeometry(fw / 2, 0.0045, 6, 26)),
        reg.mat(new THREE.MeshBasicMaterial({ color: activo ? COL_ORO : 0x7ab8ff, transparent: true, opacity: 0.9 })),
      );
      chip.add(borde);
      const txt = texto3D(ctx, `${val}`, { tam: 0.032, prof: 0.009, color: activo ? COL_ORO : 0xd6e6ff, emis: activo ? 0.6 : 0.35 });
      txt.grupo.position.set(-txt.ancho / 2, -0.016, 0.018);
      txt.grupo.rotation.x = Math.PI / 2;
      txt.grupo.rotation.z = 0;
      chip.add(txt.grupo);
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(fw + 0.04, fh + 0.04, 0.05)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: p.tab, accion: "stake", idx: val } };
      chip.add(proxy);
      proxies.push(proxy);
      chip.position.set((i - 1.5) * 0.34, -0.36, i * 0.02);
      opsWrap.add(chip);
      placas.push({ g: chip, baseY: chip.position.y, fase: 2 + i * 1.1 });
    });

    // EL ESTADO — premio potencial o el veredicto de la casa
    if (v.resuelto) {
      const gano = v.resuelto === "SÍ";
      const ver = texto3D(ctx, gano ? "PREDICCIÓN ACERTADA" : "PREDICCIÓN FALLIDA", { tam: 0.042, prof: 0.014, color: gano ? COL_VERDE : COL_ROJO, emis: 0.62 });
      ver.grupo.position.set(-ver.ancho / 2, -0.52, 0);
      opsWrap.add(ver.grupo);
    } else {
      const premio = texto3D(ctx, `PREMIO: ${v.stake} × ${v.cuotaSi.toFixed(2)} = ${Math.round(v.stake * v.cuotaSi * v.mult)}`, { tam: 0.036, prof: 0.012, color: COL_ORO, emis: 0.55 });
      premio.grupo.position.set(-premio.ancho / 2, -0.52, 0);
      opsWrap.add(premio.grupo);
    }

    grupo.add(pregWrap, opsWrap);
  };

  pintar({
    ...p,
    pregunta: p.pregunta || "CARGANDO MERCADO",
    horizonte: p.horizonte || "SEMANAL",
    cuotaSi: Number(p.cuotaSi) || 2,
    cuotaNo: Number(p.cuotaNo) || 1.8,
    probSi: Number(p.probSi) || 50,
    stake: Number(p.stake) || 10,
    mult: Number(p.mult) || 1.5,
  });

  const polvoApu = polvo(ctx.calidadBaja ? 50 : 90, COL_ORO, 1.45, 1.85);
  polvoApu.position.y = -0.8;
  grupo.add(polvoApu);

  tics.push((t, dt) => {
    polvoApu.rotation.y += dt * 0.22;
    anillo.rotation.z += dt * 0.32;
    (anillo.material as THREE.MeshBasicMaterial).opacity = 0.45 + Math.sin(t * 1.6) * 0.22;
    for (const pl of placas) pl.g.position.y = pl.baseY + Math.sin(t * 1.5 + pl.fase) * 0.011;
  });

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "predicciones") return;
      const sig = `${nuevo.pregunta}|${nuevo.cuotaSi}|${nuevo.cuotaNo}|${nuevo.probSi}|${nuevo.stake}|${nuevo.mult}|${nuevo.resuelto ?? ""}`;
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
// v147 CORONA DE HITOS — los logros como anillos orbitales que
// giran alrededor del núcleo del comando: cada anillo es una
// ronda de progreso (más brillo = más desbloqueados) y los
// PRÓXIMOS TRES hitos cuelgan como placas con barra de volumen;
// si uno está listo, late en oro y TOCARLO LO RECLAMA.
// ────────────────────────────────────────────────────────────
function construirLogros(ctx: CtxSala3D, p: SalaLogros3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  const titulo = texto3D(ctx, p.titulo, { tam: 0.15, prof: 0.05, color: p.color, emis: 0.55 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.98, 0);
  animarTitulo(tics, titulo, 0.98);
  grupo.add(titulo.grupo);

  const peana = pedestal(1.5, p.color);
  peana.position.y = -0.85;
  grupo.add(peana);

  // EL NÚCLEO DEL COMANDO — icosaedro que late según el progreso total
  // (color y anillos se ACTUALIZAN en pintar con los datos reales)
  const nucleo = new THREE.Mesh(
    reg.geo(new THREE.IcosahedronGeometry(0.16, ctx.calidadBaja ? 0 : 1)),
    reg.mat(new THREE.MeshStandardMaterial({
      color: COL_ORO, metalness: 0.5, roughness: 0.25,
      emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.55,
      transparent: true, opacity: 0.95,
    })),
  );
  nucleo.position.y = 0.32;
  grupo.add(nucleo);
  const alambre = new THREE.LineSegments(
    reg.geo(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.2, 0))),
    reg.mat(new THREE.LineBasicMaterial({ color: COL_ORO, transparent: true, opacity: 0.4 })),
  );
  alambre.position.y = 0.32;
  grupo.add(alambre);

  // LOS ANILROS DE HITOS — su opacidad es el progreso total
  const anillos: THREE.Mesh[] = [];
  const radios = [0.46, 0.64, 0.82];
  radios.forEach((r, i) => {
    const a = new THREE.Mesh(
      reg.geo(new THREE.TorusGeometry(r, 0.007, 6, 64)),
      reg.mat(new THREE.MeshBasicMaterial({ color: COL_ORO, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false })),
    );
    a.rotation.x = Math.PI / 2.6 + i * 0.35;
    a.rotation.y = i * 0.8;
    a.position.y = 0.32;
    grupo.add(a);
    anillos.push(a);
  });

  let contWrap = new THREE.Group();
  grupo.add(contWrap);

  let listaWrap = new THREE.Group();
  let sigKey = "";
  const placas: { g: THREE.Group; baseY: number; fase: number }[] = [];

  const limpiar = (w: THREE.Group) => {
    w.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });
  };

  const pintar = (v: SalaLogros3D) => {
    // el contador y el núcleo viven con los DATOS REALES (el montaje base
    // llega sin números — nunca más «UNDEFINED/UNDEFINED HITOS»)
    grupo.remove(contWrap); limpiar(contWrap);
    contWrap = new THREE.Group();
    const frac = v.total > 0 ? Math.min(1, v.desbloqueados / v.total) : 0;
    const colN = new THREE.Color(COL_ORO).lerp(new THREE.Color(0x7ab8ff), Math.min(1, frac * 1.6));
    (nucleo.material as THREE.MeshStandardMaterial).color.copy(colN);
    (nucleo.material as THREE.MeshStandardMaterial).emissive.copy(colN);
    (alambre.material as THREE.LineBasicMaterial).color.copy(colN);
    for (const a of anillos) (a.material as THREE.MeshBasicMaterial).opacity = 0.16 + frac * 0.55;
    const cont = texto3D(ctx, `${v.desbloqueados}/${v.total} HITOS`, { tam: 0.062, prof: 0.02, color: COL_ORO, emis: 0.58 });
    cont.grupo.position.set(-cont.ancho / 2, 0.82, 0);
    contWrap.add(cont.grupo);
    grupo.add(contWrap);

    grupo.remove(listaWrap);
    limpiar(listaWrap);
    listaWrap = new THREE.Group();
    listaWrap.position.x = ctx.movil ? 0.06 : 0.4;
    proxies.length = 0;
    placas.length = 0;

    const meta = texto3D(ctx, `${v.reclamados} RECLAMADOS · ${v.xpGanada} XP GANADA`, { tam: 0.034, prof: 0.012, color: 0x9fb8dd, emis: 0.35 });
    meta.grupo.position.set(-meta.ancho / 2, 0.66, 0);
    listaWrap.add(meta.grupo);

    // LOS PRÓXIMOS TRES — placas con barra de volumen; listos = oro latente
    // v148: placas esbeltas — cristal fino de 13mm, datos apretados
    const w = 0.86, h = 0.17;
    (v.proximos || []).slice(0, 3).forEach((lx, i) => {
      const placa = new THREE.Group();
      const listo = lx.reclamar;
      const col = listo ? COL_ORO : 0x7ab8ff;
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w, h, 0.013)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: listo ? 0x2a1a08 : 0x0a111e, metalness: 0.92, roughness: 0.16, transparent: true, opacity: 0.7,
          emissive: new THREE.Color(listo ? COL_ORO : 0x000000), emissiveIntensity: listo ? 0.3 : 0,
        })),
      );
      placa.add(cuerpo, new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(col, 0.9))));
      const txt = texto3D(ctx, acotar(lx.titulo || "-", 26).toUpperCase(), { tam: 0.032, prof: 0.011, color: col, emis: 0.45 });
      txt.grupo.position.set(-w / 2 + 0.08, 0.03, 0.015);
      placa.add(txt.grupo);
      // barra de progreso como volumen
      const fracB = Math.max(0.02, Math.min(1, (lx.pct || 0) / 100));
      const barra = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry((w - 0.16) * fracB, 0.02, 0.009)),
        reg.mat(new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 })),
      );
      barra.position.set(-w / 2 + 0.08 + ((w - 0.16) * fracB) / 2, -0.04, 0.015);
      placa.add(barra);
      const botin = texto3D(ctx, listo ? "TOCAR PARA RECLAMAR" : acotar(lx.botin || "", 18).toUpperCase(), { tam: 0.024, prof: 0.008, color: listo ? COL_ORO : 0x9fb8dd, emis: listo ? 0.62 : 0.3 });
      botin.grupo.position.set(w / 2 - 0.06 - botin.ancho, 0.03, 0.015);
      placa.add(botin.grupo);
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.04)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: p.tab, accion: "logro", idx: i } };
      placa.add(proxy);
      proxies.push(proxy);
      placa.position.set(0, 0.02 - i * (h + 0.07), -i * 0.04);
      listaWrap.add(placa);
      placas.push({ g: placa, baseY: placa.position.y, fase: i * 1.4 + (listo ? 10 : 0) });
    });

    grupo.add(listaWrap);
  };

  pintar({
    ...p,
    desbloqueados: Number(p.desbloqueados) || 0,
    total: Number(p.total) || 1,
    reclamados: Number(p.reclamados) || 0,
    xpGanada: Number(p.xpGanada) || 0,
    proximos: p.proximos || [],
  });

  const polvoH = polvo(ctx.calidadBaja ? 50 : 90, COL_ORO, 1.4, 1.9);
  polvoH.position.y = -0.8;
  grupo.add(polvoH);

  tics.push((t, dt) => {
    polvoH.rotation.y += dt * 0.2;
    nucleo.rotation.y += dt * 0.5;
    nucleo.rotation.x = Math.sin(t * 0.6) * 0.2;
    alambre.rotation.y -= dt * 0.3;
    alambre.position.y = 0.32 + Math.sin(t * 1.2) * 0.012;
    for (let i = 0; i < anillos.length; i++) {
      anillos[i].rotation.z += dt * (0.24 + i * 0.14) * (i % 2 ? -1 : 1);
    }
    for (const pl of placas) {
      const late = pl.fase >= 10; // los listos laten más fuerte
      pl.g.position.y = pl.baseY + Math.sin(t * (late ? 2.6 : 1.4) + pl.fase) * (late ? 0.02 : 0.009);
    }
  });

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "logros") return;
      const sig = `${nuevo.desbloqueados}|${nuevo.total}|${nuevo.reclamados}|${nuevo.xpGanada}|${(nuevo.proximos || []).map((x) => `${x.titulo}:${x.pct}:${x.reclamar}`).join(";")}`;
      if (sig === sigKey) return;
      sigKey = sig;
      pintar(nuevo);
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => {
      reg.liberar(); titulo.mats.forEach((m) => m.dispose());
      limpiar(contWrap); limpiar(listaWrap);
    },
  };
}

// ────────────────────────────────────────────────────────────
// v147 VITRINA DE COFRES — la tienda como arca holográfica:
// cuatro cofres reales (caja + tapa con bisagra que respira)
// sobre la peana, su precio extruido en oro/violeta y el botín
// del comando flotando encima. Tocar un cofre = COMPRAR de
// verdad (el mundo ejecuta el MISMO handleBuy del panel) y su
// tapa se abre en silencio de victoria.
// ────────────────────────────────────────────────────────────
function construirTienda(ctx: CtxSala3D, p: SalaTienda3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  const titulo = texto3D(ctx, p.titulo, { tam: 0.15, prof: 0.05, color: p.color, emis: 0.55 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.98, 0);
  animarTitulo(tics, titulo, 0.98);
  grupo.add(titulo.grupo);

  const peana = pedestal(1.5, p.color);
  peana.position.y = -1.52; // v165: la estantería del catálogo completo baja la peana
  grupo.add(peana);

  let vitrina = new THREE.Group();
  let sigKey = "";
  const tapas: { g: THREE.Group; abierto: boolean; base: number; fase: number }[] = [];
  const brillos: THREE.MeshBasicMaterial[] = [];

  const limpiar = (w: THREE.Group) => {
    w.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });
  };

  // UN COFRE — caja + tapa con bisagra en el canto trasero
  const cofre = (col: number, abierto: boolean) => {
    const g = new THREE.Group();
    const W = 0.34, H = 0.18, D = 0.24;
    const base = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(W, H, D)),
      reg.mat(new THREE.MeshStandardMaterial({ color: 0x101a2c, metalness: 0.85, roughness: 0.3, transparent: true, opacity: 0.95 })),
    );
    base.position.y = H / 2;
    g.add(base, new THREE.LineSegments(base.geometry, reg.mat(matFilo(col, 0.95))));
    // banda de oro de la cerradura
    const banda = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(W + 0.012, 0.03, D + 0.012)),
      reg.mat(new THREE.MeshStandardMaterial({ color: COL_ORO, metalness: 0.7, roughness: 0.35, emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.32, transparent: true, opacity: 0.95 })),
    );
    banda.position.y = H;
    g.add(banda);
    // LA TAPA con bisagra en el fondo-trasero (rotation.x abre hacia atrás)
    const tapa = new THREE.Group();
    const solapa = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(W + 0.01, 0.055, D + 0.01)),
      reg.mat(new THREE.MeshStandardMaterial({ color: 0x16233c, metalness: 0.88, roughness: 0.26, transparent: true, opacity: 0.96 })),
    );
    solapa.position.set(0, 0.028, -D / 2);
    tapa.add(solapa, new THREE.LineSegments(solapa.geometry, reg.mat(matFilo(col, 0.8))));
    tapa.position.set(0, H + 0.015, D / 2);
    tapa.rotation.x = abierto ? -1.15 : -0.06;
    g.add(tapa);
    return { g, tapa };
  };

  const pintar = (v: SalaTienda3D) => {
    grupo.remove(vitrina);
    limpiar(vitrina);
    vitrina = new THREE.Group();
    vitrina.position.x = ctx.movil ? 0.05 : 0.24;
    proxies.length = 0;
    tapas.length = 0;
    brillos.length = 0;

    const botin = texto3D(ctx, `BOTÍN: ${v.monedas} COINS · ${v.gemas} GEMS`, { tam: 0.042, prof: 0.014, color: COL_ORO, emis: 0.55 });
    botin.grupo.position.set(-botin.ancho / 2, 0.66, 0);
    vitrina.add(botin.grupo);

    // EL ARCO DE COFRES — hasta 4 items reales de la tienda
    const items = (v.items || []).slice(0, 4);
    items.forEach((it, i) => {
      const col = it.moneda === "GEMS" ? 0xb18cff : COL_ORO;
      const c = cofre(col, it.activo);
      const paso = ctx.movil ? 0.44 : 0.5;
      c.g.position.set((i - (items.length - 1) / 2) * paso, -0.34, Math.abs(i - (items.length - 1) / 2) * -0.1);
      vitrina.add(c.g);
      tapas.push({ g: c.tapa, abierto: it.activo, base: c.tapa.rotation.x, fase: i * 1.3 });
      const nom = texto3D(ctx, acotar(it.titulo || "-", 14).toUpperCase(), { tam: 0.032, prof: 0.011, color: 0xd6e6ff, emis: 0.4 });
      nom.grupo.position.set(c.g.position.x - nom.ancho / 2, -0.58, c.g.position.z + 0.02);
      vitrina.add(nom.grupo);
      const precio = texto3D(ctx, `${it.costo} ${it.moneda === "GEMS" ? "GEMS" : "COINS"}`, { tam: 0.03, prof: 0.01, color: col, emis: 0.55 });
      precio.grupo.position.set(c.g.position.x - precio.ancho / 2, -0.64, c.g.position.z + 0.02);
      vitrina.add(precio.grupo);
      // resplandor bajo el cofre activo
      const halo = new THREE.Mesh(
        reg.geo(new THREE.RingGeometry(0.16, 0.24, 32)),
        reg.mat(new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: it.activo ? 0.4 : 0.12, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })),
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(c.g.position.x, -0.5 + 0.001, c.g.position.z);
      vitrina.add(halo);
      brillos.push(halo.material as THREE.MeshBasicMaterial);
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(0.42, 0.34, 0.34)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.position.set(c.g.position.x, -0.24, c.g.position.z);
      proxy.userData = { salaAccion: { tab: p.tab, accion: "comprar", idx: i } };
      vitrina.add(proxy);
      proxies.push(proxy);
    });

    // v165 LA ESTANTERÍA — el catálogo COMPLETO: los items que no caben en
    // el arco de cofres viven como filas tocables con su COMPRAR real
    const extras = (v.items || []).slice(4, 4 + (ctx.movil ? 4 : 6));
    extras.forEach((it, j) => {
      const idx = 4 + j;
      const col = it.moneda === "GEMS" ? 0xb18cff : COL_ORO;
      const fila = new THREE.Group();
      const w2 = 1.16, h2 = 0.082;
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w2, h2, 0.011)),
        reg.mat(new THREE.MeshStandardMaterial({ color: 0x0a111e, metalness: 0.92, roughness: 0.16, transparent: true, opacity: 0.6 })),
      );
      fila.add(cuerpo, new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(col, 0.75))));
      const nom = texto3D(ctx, acotar(it.titulo || "-", 20).toUpperCase(), { tam: 0.02, prof: 0.007, color: 0xd6e6ff, emis: 0.4 });
      nom.grupo.position.set(-w2 / 2 + 0.04, 0.006, 0.01);
      fila.add(nom.grupo);
      const precio = texto3D(ctx, `${it.costo} ${it.moneda === "GEMS" ? "GEMS" : "COINS"}`, { tam: 0.02, prof: 0.007, color: col, emis: 0.55 });
      precio.grupo.position.set(w2 / 2 - 0.34 - precio.ancho, 0.006, 0.01);
      fila.add(precio.grupo);
      const act = texto3D(ctx, it.activo ? "ACTIVO" : "COMPRAR", { tam: 0.016, prof: 0.005, color: 0x0b1626, emis: 0.12 });
      const actW = Math.max(act.ancho + 0.024, 0.08);
      const boton = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(actW, 0.028, 0.011)),
        reg.mat(new THREE.MeshBasicMaterial({ color: it.activo ? COL_VERDE : COL_ORO, transparent: true, opacity: 0.92 })),
      );
      boton.position.set(w2 / 2 - 0.045 - actW / 2, 0.006, 0.012);
      act.grupo.position.set(-act.ancho / 2, 0, 0.005);
      boton.add(act.grupo);
      fila.add(boton);
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w2 + 0.03, h2 + 0.03, 0.035)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: p.tab, accion: "comprar", idx } };
      fila.add(proxy);
      proxies.push(proxy);
      fila.position.set(0, -0.84 - j * 0.105, -0.01 * j);
      vitrina.add(fila);
    });

    // v165 el pie honesto: lo que queda en la tienda
    const restoT = (v.items || []).length - 4 - extras.length;
    const pieY = -0.84 - extras.length * 0.105 - (restoT > 0 ? 0.042 : 0.028);
    if (restoT > 0) {
      const pie = texto3D(ctx, `+${restoT} MAS EN LA TIENDA`, { tam: 0.022, prof: 0.007, color: 0x7ab8ff, emis: 0.4 });
      pie.grupo.position.set(-pie.ancho / 2, pieY, 0.05);
      vitrina.add(pie.grupo);
    }

    const pista = texto3D(ctx, items.length ? "TOCA UN COFRE O UNA FILA PARA COMPRAR" : "CARGANDO VITRINA", { tam: 0.032, prof: 0.011, color: 0x7ab8ff, emis: 0.4 });
    pista.grupo.position.set(-pista.ancho / 2, pieY - 0.055, 0.1);
    vitrina.add(pista.grupo);

    grupo.add(vitrina);
  };

  pintar({
    ...p,
    monedas: Number(p.monedas) || 0,
    gemas: Number(p.gemas) || 0,
    items: p.items || [],
  });

  const polvoT = polvo(ctx.calidadBaja ? 50 : 90, p.color, 1.4, 1.9);
  polvoT.position.y = -1.24; // v165: el polvo sigue a la estantería
  grupo.add(polvoT);

  tics.push((t, dt) => {
    polvoT.rotation.y += dt * 0.2;
    // LA TAPA VIVA: cerrada respira (queriendo abrirse), comprada queda abierta
    for (const tp of tapas) {
      const objetivo = tp.abierto ? -1.15 : tp.base + Math.sin(t * 1.9 + tp.fase) * 0.05;
      tp.g.rotation.x += (objetivo - tp.g.rotation.x) * Math.min(1, dt * 6);
    }
    for (let i = 0; i < brillos.length; i++) {
      brillos[i].opacity = (tapas[i]?.abierto ? 0.4 : 0.12) + Math.sin(t * 2.2 + i * 1.1) * 0.06;
    }
  });

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "tienda") return;
      const sig = `${nuevo.monedas}|${nuevo.gemas}|${(nuevo.items || []).map((x) => `${x.titulo}:${x.costo}:${x.moneda}:${x.activo}`).join(";")}`;
      if (sig === sigKey) return;
      sigKey = sig;
      pintar(nuevo);
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => {
      reg.liberar(); titulo.mats.forEach((m) => m.dispose());
      limpiar(vitrina);
    },
  };
}

// ────────────────────────────────────────────────────────────
// v148 TERCERA OLA — TABLERO DE MISIONES: el centro de misiones
// vive en volumen: objetivo girando, contador HECHAS, placas con
// barra de progreso de VOLUMEN y RECLAMAR en oro latente (tocable).
// ────────────────────────────────────────────────────────────
function construirMisiones(ctx: CtxSala3D, p: SalaMisiones3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  const titulo = texto3D(ctx, p.titulo, { tam: 0.15, prof: 0.05, color: p.color, emis: 0.55 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.98, 0);
  animarTitulo(tics, titulo, 0.98);
  grupo.add(titulo.grupo);

  const peana = pedestal(1.5, p.color);
  peana.position.y = -0.85;
  grupo.add(peana);

  // EL OBJETIVO — diana de mando: toro + núcleo que late (la misión esperando)
  const diana = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.17, 0.028, 10, ctx.calidadBaja ? 28 : 44)),
    reg.mat(new THREE.MeshStandardMaterial({
      color: COL_ORO, metalness: 0.55, roughness: 0.28,
      emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.5,
      transparent: true, opacity: 0.95,
    })),
  );
  diana.position.set(-0.72, 0.34, 0);
  grupo.add(diana);
  const pupila = new THREE.Mesh(
    reg.geo(new THREE.SphereGeometry(0.055, 12, 12)),
    reg.mat(new THREE.MeshStandardMaterial({
      color: 0xff4d5e, metalness: 0.4, roughness: 0.3,
      emissive: new THREE.Color(0xff4d5e), emissiveIntensity: 0.7,
      transparent: true, opacity: 0.95,
    })),
  );
  pupila.position.set(-0.72, 0.34, 0.02);
  grupo.add(pupila);

  let contWrap = new THREE.Group();
  grupo.add(contWrap);

  let listaWrap = new THREE.Group();
  let sigKey = "";
  const placas: { g: THREE.Group; baseY: number; fase: number }[] = [];

  const limpiar = (w: THREE.Group) => {
    w.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });
  };

  const pintar = (v: SalaMisiones3D) => {
    // contador + meta con DATOS REALES (el montaje base llega sin números)
    grupo.remove(contWrap); limpiar(contWrap);
    contWrap = new THREE.Group();
    const frac = v.total > 0 ? Math.min(1, v.hechas / v.total) : 0;
    const cont = texto3D(ctx, `${v.hechas}/${v.total} MISIONES`, { tam: 0.062, prof: 0.02, color: COL_ORO, emis: 0.58 });
    cont.grupo.position.set(-cont.ancho / 2, 0.82, 0);
    contWrap.add(cont.grupo);
    const meta = texto3D(ctx, `${v.monedas} COINS EN BOLSILLO · ${Math.round(frac * 100)}% DEL TABLERO`, { tam: 0.032, prof: 0.011, color: 0x9fb8dd, emis: 0.35 });
    meta.grupo.position.set(-meta.ancho / 2, 0.66, 0);
    contWrap.add(meta.grupo);
    grupo.add(contWrap);

    grupo.remove(listaWrap);
    limpiar(listaWrap);
    listaWrap = new THREE.Group();
    listaWrap.position.x = ctx.movil ? 0.06 : 0.4;
    proxies.length = 0;
    placas.length = 0;

    const w = 1.06, h = 0.24;
    (v.misiones || []).slice(0, 4).forEach((ms, i) => {
      const placa = new THREE.Group();
      const lista = ms.reclamar;
      const col = lista ? COL_ORO : ms.pct >= 100 ? COL_VERDE : 0x7ab8ff;
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w, h, 0.02)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: lista ? 0x2a1a08 : 0x0c1526, metalness: 0.9, roughness: 0.22, transparent: true, opacity: 0.86,
          emissive: new THREE.Color(lista ? COL_ORO : 0x000000), emissiveIntensity: lista ? 0.3 : 0,
        })),
      );
      placa.add(cuerpo, new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(col, 0.9))));
      const cat = texto3D(ctx, acotar(ms.cat || "-", 10), { tam: 0.024, prof: 0.008, color: 0x9fb8dd, emis: 0.3 });
      cat.grupo.position.set(-w / 2 + 0.08, h / 2 - 0.035, 0.02);
      placa.add(cat.grupo);
      const txt = texto3D(ctx, acotar(ms.titulo || "-", 22).toUpperCase(), { tam: 0.042, prof: 0.014, color: col, emis: 0.45 });
      txt.grupo.position.set(-w / 2 + 0.08, 0.012, 0.02);
      placa.add(txt.grupo);
      // barra de progreso como VOLUMEN
      const fracB = Math.max(0.02, Math.min(1, (ms.pct || 0) / 100));
      const barra = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry((w - 0.16) * fracB, 0.024, 0.012)),
        reg.mat(new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 })),
      );
      barra.position.set(-w / 2 + 0.08 + ((w - 0.16) * fracB) / 2, -0.062, 0.02);
      placa.add(barra);
      const botin = texto3D(ctx, lista ? "TOCAR PARA RECLAMAR" : acotar(ms.recompensa || "", 18).toUpperCase(), { tam: 0.026, prof: 0.009, color: lista ? COL_ORO : 0x9fb8dd, emis: lista ? 0.62 : 0.3 });
      botin.grupo.position.set(w / 2 - 0.07 - botin.ancho, 0.012, 0.02);
      placa.add(botin.grupo);
      const proxy = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.05)),
        reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
      );
      proxy.userData = { salaAccion: { tab: p.tab, accion: "reclamar", idx: i } };
      placa.add(proxy);
      proxies.push(proxy);
      placa.position.set(0, 0.34 - i * (h + 0.09), -i * 0.05);
      listaWrap.add(placa);
      placas.push({ g: placa, baseY: placa.position.y, fase: i * 1.4 + (lista ? 10 : 0) });
    });

    if (!(v.misiones || []).length) {
      const vacio = texto3D(ctx, "CARGANDO TABLERO", { tam: 0.04, prof: 0.013, color: 0x7ab8ff, emis: 0.4 });
      vacio.grupo.position.set(-vacio.ancho / 2, 0.3, 0);
      listaWrap.add(vacio.grupo);
    }

    grupo.add(listaWrap);
  };

  pintar({
    ...p,
    hechas: Number(p.hechas) || 0,
    total: Number(p.total) || 1,
    monedas: Number(p.monedas) || 0,
    misiones: p.misiones || [],
  });

  const polvoM = polvo(ctx.calidadBaja ? 50 : 90, p.color, 1.4, 1.9);
  polvoM.position.y = -0.8;
  grupo.add(polvoM);

  tics.push((t, dt) => {
    polvoM.rotation.y += dt * 0.2;
    diana.rotation.y += dt * 0.65;
    diana.rotation.x = Math.sin(t * 0.7) * 0.18;
    pupila.position.z = 0.02 + Math.sin(t * 2.4) * 0.012;
    for (const pl of placas) {
      const late = pl.fase >= 10;
      pl.g.position.y = pl.baseY + Math.sin(t * (late ? 2.6 : 1.4) + pl.fase) * (late ? 0.02 : 0.009);
    }
  });

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "misiones") return;
      const sig = `${nuevo.hechas}|${nuevo.total}|${nuevo.monedas}|${(nuevo.misiones || []).map((x) => `${x.titulo}:${x.pct}:${x.reclamar}`).join(";")}`;
      if (sig === sigKey) return;
      sigKey = sig;
      pintar(nuevo);
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => {
      reg.liberar(); titulo.mats.forEach((m) => m.dispose());
      limpiar(contWrap); limpiar(listaWrap);
    },
  };
}

// ────────────────────────────────────────────────────────────
// v148 TERCERA OLA — PODIO GLOBAL: el ranking semanal en volumen:
// copa dorada girando, podio de 3 columnas (oro/plata/bronce) con
// el nombre extruido, filas con barra proporcional al puntaje y
// el AGENTE en oro (el gancho: siempre hay alguien a 1 puesto).
// ────────────────────────────────────────────────────────────
function construirRanking(ctx: CtxSala3D, p: SalaRanking3D): Sala3DInstancia {
  const reg = registrar();
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const tics: ((t: number, dt: number) => void)[] = [];

  const titulo = texto3D(ctx, p.titulo, { tam: 0.15, prof: 0.05, color: p.color, emis: 0.55 });
  titulo.grupo.position.set(-titulo.ancho / 2, 0.98, 0);
  animarTitulo(tics, titulo, 0.98);
  grupo.add(titulo.grupo);

  const peana = pedestal(1.5, p.color);
  peana.position.y = -0.85;
  grupo.add(peana);

  // LA COPA — cono invertido dorado + base (el trofeo semanal)
  const copa = new THREE.Group();
  const campana = new THREE.Mesh(
    reg.geo(new THREE.ConeGeometry(0.11, 0.2, ctx.calidadBaja ? 10 : 16)),
    reg.mat(new THREE.MeshStandardMaterial({
      color: COL_ORO, metalness: 0.85, roughness: 0.2,
      emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.4,
      transparent: true, opacity: 0.96,
    })),
  );
  campana.rotation.z = Math.PI; // invertida: copa
  campana.position.y = 0.16;
  const tallo = new THREE.Mesh(
    reg.geo(new THREE.CylinderGeometry(0.014, 0.014, 0.07, 8)),
    reg.mat(new THREE.MeshStandardMaterial({ color: COL_ORO, metalness: 0.85, roughness: 0.25 })),
  );
  tallo.position.y = 0.03;
  const base = new THREE.Mesh(
    reg.geo(new THREE.CylinderGeometry(0.05, 0.055, 0.02, 14)),
    reg.mat(new THREE.MeshStandardMaterial({ color: 0x8a6a1c, metalness: 0.7, roughness: 0.35 })),
  );
  base.position.y = -0.01;
  copa.add(campana, tallo, base);
  copa.position.set(-0.82, 0.3, 0);
  grupo.add(copa);

  let contWrap = new THREE.Group();
  grupo.add(contWrap);

  let podioWrap = new THREE.Group();
  let filasWrap = new THREE.Group();
  let sigKey = "";
  const filasAnim: { g: THREE.Group; baseY: number; fase: number }[] = [];

  const limpiar = (w: THREE.Group) => {
    w.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });
  };

  const pintar = (v: SalaRanking3D) => {
    grupo.remove(contWrap); limpiar(contWrap);
    contWrap = new THREE.Group();
    const disc = (v.disciplina || "XP").toUpperCase();
    const meta = texto3D(ctx, `${disc} · SEMANA ${v.semana || "-"} · ${v.dias || 0} DIAS · POS #${v.posicion || "-"}`, { tam: 0.032, prof: 0.011, color: 0x9fb8dd, emis: 0.35 });
    meta.grupo.position.set(-meta.ancho / 2, 0.82, 0);
    contWrap.add(meta.grupo);
    grupo.add(contWrap);

    // EL PODIO — 3 columnas con alturas de honor
    grupo.remove(podioWrap); limpiar(podioWrap);
    podioWrap = new THREE.Group();
    podioWrap.position.set(-0.62, -0.28, 0);
    const alturas = [0.46, 0.32, 0.24];
    const cols = [COL_ORO, 0xc0c8d8, 0xcd7f32];
    const top3 = (v.filas || []).slice(0, 3);
    for (let i = 0; i < 3; i++) {
      const f = top3[i];
      const hCol = alturas[i];
      const col = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(0.3, hCol, 0.22)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: 0x101a2c, metalness: 0.85, roughness: 0.3,
          emissive: new THREE.Color(cols[i]), emissiveIntensity: 0.12,
          transparent: true, opacity: 0.92,
        })),
      );
      col.position.set((i - 1) * 0.42, hCol / 2, 0);
      podioWrap.add(col, new THREE.LineSegments(col.geometry, reg.mat(matFilo(cols[i], 0.85))));
      const num = texto3D(ctx, `${i + 1}`, { tam: 0.075, prof: 0.02, color: cols[i], emis: 0.6 });
      num.grupo.position.set((i - 1) * 0.42 - num.ancho / 2, hCol + 0.05, 0);
      podioWrap.add(num.grupo);
      if (f) {
        const nom = texto3D(ctx, acotar(f.nombre || "-", 9).toUpperCase(), { tam: 0.026, prof: 0.009, color: f.jugador ? COL_ORO : 0x9fb8dd, emis: f.jugador ? 0.6 : 0.32 });
        nom.grupo.position.set((i - 1) * 0.42 - nom.ancho / 2, -0.12, 0.001);
        podioWrap.add(nom.grupo);
        const pts = texto3D(ctx, `${f.puntos || 0}`, { tam: 0.022, prof: 0.008, color: cols[i], emis: 0.45 });
        pts.grupo.position.set((i - 1) * 0.42 - pts.ancho / 2, -0.19, 0.001);
        podioWrap.add(pts.grupo);
      }
    }
    grupo.add(podioWrap);

    // LAS FILAS 4-8 — placas con barra proporcional al puntaje
    grupo.remove(filasWrap); limpiar(filasWrap);
    filasWrap = new THREE.Group();
    filasWrap.position.x = ctx.movil ? 0.28 : 0.52;
    proxies.length = 0;
    filasAnim.length = 0;
    const resto = (v.filas || []).slice(3, ctx.movil ? 6 : 8);
    const maxP = Math.max(1, ...(v.filas || []).map((x) => x.puntos || 0));
    const w = 0.94, h = 0.17;
    resto.forEach((f, i) => {
      const placa = new THREE.Group();
      const col = f.jugador ? COL_ORO : 0x7ab8ff;
      const cuerpo = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry(w, h, 0.016)),
        reg.mat(new THREE.MeshStandardMaterial({
          color: f.jugador ? 0x2a1a08 : 0x0c1526, metalness: 0.9, roughness: 0.22, transparent: true, opacity: 0.86,
          emissive: new THREE.Color(f.jugador ? COL_ORO : 0x000000), emissiveIntensity: f.jugador ? 0.26 : 0,
        })),
      );
      placa.add(cuerpo, new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(col, 0.8))));
      const nom = texto3D(ctx, `#${(v.filas || []).indexOf(f) + 1} ${acotar(f.nombre || "-", 10).toUpperCase()}`, { tam: 0.028, prof: 0.009, color: col, emis: f.jugador ? 0.55 : 0.38 });
      nom.grupo.position.set(-w / 2 + 0.06, 0.024, 0.018);
      placa.add(nom.grupo);
      const fracB = Math.max(0.02, Math.min(1, (f.puntos || 0) / maxP));
      const barra = new THREE.Mesh(
        reg.geo(new THREE.BoxGeometry((w - 0.12) * fracB, 0.017, 0.01)),
        reg.mat(new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8 })),
      );
      barra.position.set(-w / 2 + 0.06 + ((w - 0.12) * fracB) / 2, -0.038, 0.018);
      placa.add(barra);
      const pts = texto3D(ctx, `${f.puntos || 0}`, { tam: 0.022, prof: 0.008, color: col, emis: 0.42 });
      pts.grupo.position.set(w / 2 - 0.05 - pts.ancho, 0.024, 0.018);
      placa.add(pts.grupo);
      placa.position.set(0, 0.5 - i * (h + 0.062), -i * 0.04);
      filasWrap.add(placa);
      filasAnim.push({ g: placa, baseY: placa.position.y, fase: i * 1.3 + (f.jugador ? 9 : 0) });
    });
    grupo.add(filasWrap);
  };

  pintar({
    ...p,
    filas: p.filas || [],
    posicion: Number(p.posicion) || 0,
    dias: Number(p.dias) || 0,
  });

  const polvoR = polvo(ctx.calidadBaja ? 50 : 90, COL_ORO, 1.4, 1.9);
  polvoR.position.y = -0.8;
  grupo.add(polvoR);

  tics.push((t, dt) => {
    polvoR.rotation.y += dt * 0.2;
    copa.rotation.y += dt * 0.8;
    copa.position.y = 0.3 + Math.sin(t * 1.3) * 0.014;
    for (const f of filasAnim) {
      const late = f.fase >= 9;
      f.g.position.y = f.baseY + Math.sin(t * (late ? 2.4 : 1.3) + f.fase) * (late ? 0.016 : 0.008);
    }
  });

  return {
    grupo,
    proxies,
    actualizar: (nuevo) => {
      if (nuevo.tipo !== "ranking") return;
      const sig = `${nuevo.disciplina}|${nuevo.semana}|${nuevo.posicion}|${(nuevo.filas || []).map((x) => `${x.nombre}:${x.puntos}:${x.jugador}`).join(";")}`;
      if (sig === sigKey) return;
      sigKey = sig;
      pintar(nuevo);
    },
    tic: (t, dt) => { for (const f of tics) f(t, dt); },
    liberar: () => {
      reg.liberar(); titulo.mats.forEach((m) => m.dispose());
      limpiar(contWrap); limpiar(podioWrap); limpiar(filasWrap);
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
    case "predicciones": return construirPredicciones(ctx, p);
    case "logros": return construirLogros(ctx, p);
    case "tienda": return construirTienda(ctx, p);
    case "contenido": return construirContenido(ctx, p);
    case "misiones": return construirMisiones(ctx, p);
    case "ranking": return construirRanking(ctx, p);
    case "juegos": return construirJuegos(ctx, p);
    default: return construirGenerica(ctx, p);
  }
}
