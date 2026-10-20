"use client";

// ============================================================
// v140.0 MUNDO WEBGL — LA EXPERIENCIA THREE.JS
// «El usuario no navega entre páginas: VIVE DENTRO DE UN MUNDO
// 3D y desde ese mundo accede a todo el contenido.»
//
// MOD de videojuego sobre la Casa existente (REGLA 1: ningún
// feature se borra — el contenido ya construido vive ahora en
// zonas del espacio y la cámara VUELA entre ellas):
//
//   ZONA 0 — EL ESPACIO        pos(0, 0, 8)   entrada AAA
//   ZONA 1 — EL GLOBO (HOY)    pos(0, 0, 4)   tab "inicio"
//   ZONA 2 — COMMAND CENTER    pos(-3, 2, 3)  tab "crisis"
//   ZONA 3 — LA ARENA          pos(3, -2, 3)  tab "arcade"
//   ZONA 4 — EL CUARTEL        pos(-4, 0, 3)  tab "perfil"
//
// v141 WEBGL EXPERIENCE: letras extruidas REALES (logo + títulos
// + etiquetas), portales entra­bles, pose de panel (planeta a la
// izquierda, contenido a la derecha), MODO MUNDO (5º botón),
// mundos por zona, piel holograma de paneles, cada línea 3D.
// v142 UNIVERSO COMPLETO: cada zona tiene SU mundo (el HOY vive
// dentro de un ANILLO ORBITAL que abraza al planeta), el MODO
// MUNDO es el universo entero de una vez (todos los mundos,
// títulos y portales visibles desde la pose del universo), un
// marcador tocado aterriza en el Command Center con SU crisis
// puesta en la mesa, las banderas ondean, las balizas laten y
// cada aterrizaje suena a nave que frena.
//
// v143 LA CASA EN EL MUNDO: el ÚLTIMO plano 2D cae. Las salas de
// la Casa dejan de ser una capa DOM encima del universo y pasan
// a VIVIR DENTRO de él: una CÁPSULA holográfica (CSS3DRenderer —
// DOM real proyectado con matriz 3D real) se ACOPLA a la ancla
// de la zona donde aterriza la cámara, vuela con el universo,
// escala con la distancia y se apaga en el MODO MUNDO. La
// navbar de zonas también flota en el espacio, acoplada a la
// cámara: la consola de vuelo del comandante.
//
// REGLA 2 (adaptada a la Casa): TODO el mundo Three.js vive en
// ESTE archivo único. REGLA 3: móvil primero (calidad adaptativa,
// pointer events unificados, navbar con safe-area). REGLA 4:
// cero páginas — navegación 100% vuelo de cámara. REGLA 5:
// sin internet no pasa nada — los marcadores salen de
// guerras-activas-data.ts (OSINT de la Casa). REGLA 6: el globo
// JAMÁS deja de girar ni de respirar.
// Contrato 60 FPS del mundo: renderer pausado en hidden,
// pixelRatio capado, geometría adaptativa, un solo rAF.
// ============================================================
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
// v141 WEBGL EXPERIENCE: letras 3D REALES — cada glifo extruido con volumen
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
// v143: DOM REAL dentro de la escena — la Casa vive en el mundo
import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { GUERRAS } from "@/lib/guerras-activas-data";
// v145 SALAS EN VOLUMEN: el CONTENIDO real de cada sala como escena 3D
import { construirSala3D, type PayloadSala3D, type Sala3DInstancia, type CtxSala3D } from "./salas-3d";

// ────────────────────────────────────────────────────────────
// MOTOR DE TWEEN — GSAP casero (power2.inOut = cúbica in-out).
// Cero dependencias nuevas: la Casa ya tiene suficiente carga.
// ────────────────────────────────────────────────────────────
type ObjNum = Record<string, number>;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function animar(
  obj: ObjNum | THREE.Vector3 | THREE.Object3D | THREE.Material | { opacity: number; size?: number; fov?: number },
  to: ObjNum,
  ms: number,
  opts: { ease?: (t: number) => number; onUpdate?: () => void; onDone?: () => void } = {},
): () => void {
  const o = obj as ObjNum;
  const from: ObjNum = {};
  for (const k in to) from[k] = o[k] ?? 0;
  const t0 = performance.now();
  const ease = opts.ease ?? easeInOut;
  let raf = 0, vivo = true;
  const paso = (now: number) => {
    if (!vivo) return;
    const t = Math.min(1, (now - t0) / ms);
    const e = ease(t);
    for (const k in to) o[k] = from[k] + (to[k] - from[k]) * e;
    opts.onUpdate?.();
    if (t < 1) raf = requestAnimationFrame(paso);
    else opts.onDone?.();
  };
  raf = requestAnimationFrame(paso);
  return () => { vivo = false; cancelAnimationFrame(raf); };
}

// lat/lng → posición sobre la esfera three (alineación equirect estándar)
function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

// ────────────────────────────────────────────────────────────
// LAS ZONAS — posiciones de cámara y miradas (mandato del Dueño)
// ────────────────────────────────────────────────────────────
export const ZONA_POS: Record<number, [number, number, number]> = {
  0: [0, 0, 8],
  1: [0, 0, 4],
  2: [-3, 2, 3],
  3: [3, -2, 3],
  4: [-4, 0, 3],
};
export const ZONA_TGT: Record<number, [number, number, number]> = {
  0: [0, 0, 0],
  1: [0, 0, 0],
  2: [-1, 1, 0],
  3: [1, -1, 0],
  4: [-2, 0, 0],
};
export const ZONA_TAB: Record<number, string> = { 1: "inicio", 2: "crisis", 3: "arcade", 4: "perfil" };
export const TAB_ZONA: Record<string, number> = { inicio: 1, crisis: 2, arcade: 3, perfil: 4 };

// ────────────────────────────────────────────────────────────
// v141 WEBGL EXPERIENCE — TODO el mundo es 3D:
//  · LETRAS 3D: logo VANGUARD extruido + un título 3D por zona
//    + subtítulo + etiquetas de portales (TextGeometry real).
//  · PORTALES: anillos 3D flotando alrededor del planeta — se
//    TOCAN y la cámara VUELA a ese mundo y abre su sala.
//  · POSE DE PANEL: cuando la Casa (contenido DOM) está abierta,
//    el punto de mira se desplaza hacia la DERECHA de la cámara
//    → el planeta vive a la IZQUIERDA y el contenido a la derecha:
//    se acaba el «el menú opaca al planeta».
//  · MODO MUNDO: la Casa entera se aparta y solo queda el
//    universo 3D — tocar un portal o un título = entrar.
// ────────────────────────────────────────────────────────────
const POSE_PANEL_DESV = 0.62; // desvío del punto de mira (unidades de mundo)

// v144 P1: yaw de la CONSOLA — 6° de giro para el aire «consola de mando»
const Q_YAW_CONSOLA = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.105);

// v145 — VUELO LIBRE: límites del universo piloteable (la cámara JAMÁS se
// pierde ni atraviesa el planeta) y física del vuelo (inercia = suavidad)
const R_MIN_GLOBO = 2.05;   // radio mínimo al centro (la Tierra es 1.35)
const R_MAX_UNI = 13.5;     // radio máximo (no abandonar el universo)
const Y_MIN_LIBRE = -5.6;   // techo/suelo del corredor de vuelo
const Y_MAX_LIBRE = 6.6;
const VEL_LIBRE = 2.6;      // unidades/segundo (Shift = ×2.3)
const Z_VENTANA = 3.35;     // distancia de la VENTANA HOLO a la cámara

// v145 — TIPOGRAFÍA FUTURISTA: Rajdhani Bold (angular, HUD militar, cero
// caricatura). Si no llegara, helvetiker_bold rescata el mundo.
const FUENTE_PRIMARIA = "/assets/fonts/rajdhani_bold.typeface.json";
const FUENTE_RESERVA = "/assets/fonts/helvetiker_bold.typeface.json";

interface Titulo3D {
  zona: number;
  texto: string;
  sub: string;
  p: [number, number, number];
  color: number;
  emis: number;
  tam: number;
}

// LOS TÍTULOS 3D DE CADA MUNDO (ASCII-seguro: la fuente typeface
// no trae acentos; el sanitizador los elimina como un HUD militar)
const TITULOS_3D: Titulo3D[] = [
  { zona: 1, texto: "HOY", sub: "EL MUNDO EN VIVO", p: [0, 2.02, 0.42], color: 0xf5c542, emis: 0.42, tam: 0.3 },
  { zona: 2, texto: "COMMAND CENTER", sub: "CRISIS MUNDIAL", p: [-1.7, 2.2, -0.9], color: 0x00f0ff, emis: 0.6, tam: 0.2 },
  { zona: 3, texto: "ARENA", sub: "JUEGA LA GUERRA", p: [2.3, 0.5, -0.95], color: 0xffd27a, emis: 0.55, tam: 0.25 },
  { zona: 4, texto: "CUARTEL", sub: "TU BASE SECRETA", p: [-2.55, 0.98, -1.05], color: 0x8fc1ff, emis: 0.55, tam: 0.24 },
];

// LOS PORTALES — mundos entra­bles flotando junto al planeta
// v142: el CUARTEL sube a una órbita visible desde la pose del universo
// (a y=-2.05 llevaba toda la vida bajo el borde inferior del cuadro).
// `pm` = órbita de RETRATO: en móvil el cuadro es estrecho y alto — los
// portales se reordenan en vertical para que los tres sean tocables.
const PORTALES_3D: { zona: number; texto: string; p: [number, number, number]; pm?: [number, number, number]; color: number }[] = [
  { zona: 2, texto: "COMMAND", p: [-2.05, 0.95, 1.15], pm: [-0.72, 1.8, 0.9], color: 0x00f0ff },
  { zona: 3, texto: "ARENA", p: [2.05, -0.75, 1.15], pm: [0.78, -1.35, 0.9], color: 0xffb347 },
  { zona: 4, texto: "CUARTEL", p: [-1.9, -1.15, 0.6], pm: [0.95, 1.35, 0.5], color: 0x4da6ff },
];

type Letra3D = { mesh: THREE.Mesh; fase: number; base: THREE.Vector3; expandida?: THREE.Vector3; quieto?: boolean };

// v142: en MODO MUNDO la cámara vuela a LA POSE DEL UNIVERSO — el mundo entero
// en cuadro: planeta + anillo orbital + los 3 mundos + todos los títulos y
// portales. Desde ahí se toca CUALQUIER mundo y la cámara entra a él.
const POSE_MUNDO: [number, number, number] = [0, 0.3, 5.6];
const TGT_MUNDO: [number, number, number] = [0, 0.1, 0];

// ────────────────────────────────────────────────────────────
// v144 HOLOGRAMA TOTAL — EL PUENTE DE MANDO.
// El chrome plano de la Casa (cabecera HUD, franja de pestañas, pie) MUERE:
// ahora vive DENTRO del universo como un puente holográfico acoplado a la
// cámara — placas 3D con LETRAS EXTRUIDAS reales para cada pestaña abierta,
// botones de mando (BUSCAR · MENU · CUENTA · AJUSTES · NUEVA), el mini logo
// VANGUARD, el pie de la Casa y hasta la UI del MODO MUNDO. Todo se toca con
// raycast, todo respira, nada es 2D.
// ────────────────────────────────────────────────────────────
const Z_CONSOLA = 4.2; // distancia del puente a la cámara (plano de mando)

type DatosPestana = { key: string; label: string; color: number };

interface PlatoHolo {
  grupo: THREE.Group;
  marco: THREE.Mesh;
  filos: THREE.LineSegments;
  proxy: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  accion: string;
  key?: string;
  baseY: number;
  baseZ: number;
  fase: number;
  activa: boolean;
  cierre?: boolean;
}

// v144: un proxy de placa solo cuenta si todo su árbol está visible —
// (el Raycaster ignora visible=false? NO: los objetos invisibles TAMBIÉN
// se raycastean — hay que vigilar la cadena de ancestros a mano)
function ancestroVisible(o: THREE.Object3D | null): boolean {
  let cur: THREE.Object3D | null = o;
  while (cur) {
    if (cur.visible === false) return false;
    cur = cur.parent;
  }
  return true;
}

type EtiquetasHolo = {
  buscar: string; menu: string; cuenta: string; ajustes: string; nueva: string;
  hintEntrar: string; salir: string; hintMundo: string; pieIzq: string; pieDer: string;
};

const ETIQUETAS_DEFECTO: EtiquetasHolo = {
  buscar: "BUSCAR", menu: "MENU", cuenta: "CUENTA", ajustes: "AJUSTES", nueva: "+",
  hintEntrar: "TOCA EL GLOBO PARA ENTRAR", salir: "SALIR DEL MUNDO",
  hintMundo: "TOCA UN PORTAL · ENTRA A UN MUNDO 3D",
  pieIzq: "SISTEMA VIVO", pieDer: "M MENU · 1-9 PESTAÑAS · F PANTALLA",
};

// marcadores: teatros de guerra de la Casa (OSINT real) + ciudades caliente
export interface MarcadorWGL {
  id: string;
  nombre: string;
  sub: string;
  intensidad: number; // 0..100
  lat: number;
  lng: number;
  tipo: "teatro" | "frente";
}

function construirMarcadores(): MarcadorWGL[] {
  const out: MarcadorWGL[] = [];
  for (const g of GUERRAS) {
    out.push({
      id: g.id,
      nombre: g.nombre,
      sub: g.activa ? `Intensidad ${g.intensidad}/100 · ${g.desde}` : `Teatro observado · ${g.subtitulo}`,
      intensidad: g.intensidad,
      lat: g.lat,
      lng: g.lng,
      tipo: "teatro",
    });
  }
  // ciudades en el fuego (frente/sitio/contendida) — 2 por teatro, techo 15
  for (const g of GUERRAS) {
    const calientes = (g.ciudades ?? [])
      .filter((c) => c.estado === "frente" || c.estado === "sitio" || c.estado === "contendida")
      .slice(0, 2);
    for (const c of calientes) {
      if (out.length >= 15) break;
      out.push({
        id: `${g.id}:${c.nombre}`,
        nombre: c.nombre.toUpperCase(),
        sub: `${c.estado.toUpperCase()} · teatro ${g.id.toUpperCase()}`,
        intensidad: Math.max(38, g.intensidad - 22),
        lat: c.lat,
        lng: c.lng,
        tipo: "frente",
      });
    }
    if (out.length >= 15) break;
  }
  return out.slice(0, 15);
}

// ────────────────────────────────────────────────────────────
// EL MUNDO — clase vanilla Three.js (un solo rAF, cero React)
// ────────────────────────────────────────────────────────────
interface MundoOpts {
  lienzo: HTMLCanvasElement;
  calidadBaja: boolean;
}

class MundoWGL {
  renderer: THREE.WebGLRenderer;
  escena: THREE.Scene;
  camara: THREE.PerspectiveCamera;
  mundo = new THREE.Group();
  tierra!: THREE.Mesh;
  atmosfera!: THREE.Mesh;
  estrellas!: THREE.Points;
  matEstrellas!: THREE.PointsMaterial;
  particulasOro!: THREE.Points;
  particulasAzul!: THREE.Points;
  luzDir!: THREE.DirectionalLight;
  luzRim!: THREE.PointLight;
  marcadores: { grupo: THREE.Group; nucleo: THREE.Mesh; anillo: THREE.Mesh; proxy: THREE.Mesh; datos: MarcadorWGL; fase: number }[] = [];
  zona = 0;
  mirada = new THREE.Vector3(0, 0, 0);
  cancelar = new Set<() => void>();  // v144 P6: Set con auto-poda (no crece eterno)
  reloj = new THREE.Clock();
  raf = 0;
  vivo = true;
  respiro = 0.006;      // amplitud de la respiración del globo
  invitando = false;    // pulso de invitación en la entrada
  enVuelo = false;
  calidadBaja: boolean;
  baseEstrellas = 0.05;
  // v141 — la capa HOLO: letras y portales que NO giran con la Tierra
  holo = new THREE.Group();
  fuente: Font | null = null;
  letrasLogo: Letra3D[] = [];
  logoGrupo!: THREE.Group;
  titulosZona: { grupo: THREE.Group; zona: number; letras: Letra3D[] }[] = [];
  portales: { grupo: THREE.Group; nucleo: THREE.Mesh; proxy: THREE.Mesh; etiqueta: THREE.Group; zona: number; fase: number }[] = [];
  mundosZona: Record<number, THREE.Group> = {};
  proxiesClic: THREE.Mesh[] = [];
  // v142 — la vida del universo: anillo orbital, sus balizas, banderas y balizas tácticas
  aroSpin!: THREE.Group;
  balizasOrb: THREE.Mesh[] = [];
  banderas: THREE.Mesh[] = [];
  balizasC2: THREE.Mesh[] = [];
  logoNacido = false;
  pendienteLogo = false;
  modoMundo = false;
  // v143 — LA CÁPSULA DE CONTENIDO (la Casa vive dentro del mundo)
  cssRenderer!: CSS3DRenderer;
  cssEscena = new THREE.Scene();
  capsula!: CSS3DObject;
  capsulaEl!: HTMLDivElement;     // el cuerpo visual (marco holográfico)
  capsulaScroll!: HTMLDivElement; // AQUÍ la Casa porta sus salas (React portal)
  capsulaPx = 1000;               // ancho CSS del cuerpo (px) — para la escala
  capsulaAcoplada = false;
  navObj!: CSS3DObject;           // la consola de vuelo — flota pegada a la cámara
  navEl!: HTMLDivElement;
  navPx = 470;
  navFrac = 0.44;
  // v144 — EL PUENTE DE MANDO (chrome 3D acoplado a la cámara)
  consola = new THREE.Group();    // placas de pestañas + botones de mando
  consolaVisibleFin = true;       // el puente despierta al terminar la entrada
  consolaDatos: { pestanas: DatosPestana[]; activa: string } = { pestanas: [], activa: "" };
  etiquetas: EtiquetasHolo = { ...ETIQUETAS_DEFECTO };
  platosHolo: PlatoHolo[] = [];
  proxiesHolo: THREE.Mesh[] = [];
  logoMiniSlot: THREE.Group | null = null;
  pieGrupo = new THREE.Group();   // pie de la Casa en letras 3D
  pieIzq: THREE.Group | null = null;
  pieDer: THREE.Group | null = null;
  entradaGrupo = new THREE.Group(); // tagline + placa ENTRAR (letras 3D)
  letrasTagline: Letra3D[] = [];
  platoEntrar: THREE.Group | null = null;
  modoGrupo = new THREE.Group();  // UI del MODO MUNDO en 3D (salir + hint)
  modoConstruido = false;
  faseHolo = "negro";
  holoHover: THREE.Mesh | null = null;
  desbordeHolo = 0;             // pestañas que no cupieron en el puente
  llavePuente = "";             // anti-churn: no reconstruir si nada cambió
  // v144 — EL RAIL DEL ESTADO: la franja viva (StatsTicker) como tira
  // holográfica CSS3D acoplada a la cámara bajo el puente
  railObj: CSS3DObject | null = null;
  railEl: HTMLDivElement | null = null;
  railPx = 900;
  railFrac = 0.62;
  // v145 — LA VENTANA HOLO: el MENÚ (y la búsqueda) dejan de ser capas planas
  // fijas al viewport: ahora son una PANTALLA de proyección flotando en el
  // espacio, acoplada a la cámara como el puente — un holograma que sale de
  // la Casa y se planta frente al piloto (CSS3D real, scrollable, clicable)
  ventanaObj!: CSS3DObject;
  ventanaEl!: HTMLDivElement;
  ventanaHost!: HTMLDivElement;
  ventanaPx = 1100;
  ventanaFrac = 0.84;
  ventanaOn = false;
  ventanaNacida = false;
  // v145 — VUELO LIBRE: la cámara obedece AL PILOTO (adelante/atrás, lados,
  // arriba/abajo) con inercia de nave; la mirada se arrastra con el dedo o
  // el ratón y el pinza (o la rueda) acercan/alejan. Nada de menús 2D: el
  // mundo SE RECORRE.
  vel = new THREE.Vector3();          // velocidad actual (inercia)
  teclas = new Set<string>();         // WASD/QE/flechas/shift
  arrastrando = false;                // drag de mirada activo
  ultimoArrastre = 0;                 // freno de eventos (70ms)
  dirArrastre = new THREE.Vector3();  // dirección base del drag de mirada
  punteros = new Map<number, { x: number; y: number }>(); // para el pinza táctil
  distPinza = 0;                      // distancia inicial del pinza
  // v145 — pendiente de toque: los portales/marcadores/globo ahora se
  // ejecutan en pointerup si NO hubo arrastre (así mirar nunca dispara vuelos)
  pendiente: { zona?: number; datos?: MarcadorWGL; punto?: THREE.Vector3; x: number; y: number } | null = null;
  origenToque = { x: 0, y: 0 };
  toqueArrastrado = false;
  // v145 — HOLOGRAMA VIVO: parpadeo de proyector en las letras + haz
  // volumétrico bajo la cápsula + placas del puente que respiran hacia el piloto
  matsFlicker: { mat: THREE.MeshStandardMaterial; base: number; fase: number }[] = [];
  hazCrono: THREE.Mesh | null = null;
  hazActivo = false;
  matHaz!: THREE.MeshBasicMaterial;
  // v145 P2 — LOS WIDGETS FLOTANTES: la radio (der) y el estado del enlace
  // (izq) dejan de ser capas DOM fijas y viven como mini-pantallas CSS3D en
  // las esquinas del plano de mando
  widIzqObj: CSS3DObject | null = null;
  widIzqEl: HTMLDivElement | null = null;
  widIzqPx = 210;
  widDerObj: CSS3DObject | null = null;
  widDerEl: HTMLDivElement | null = null;
  widDerPx = 300;
  // v145 P4 — la ciudad héroe: materiales de ventana que parpadean por fases
  ciudadWinsMats: THREE.MeshBasicMaterial[] = [];
  // v145 — SALAS EN VOLUMEN: el contenido real de la sala activa
  salaInst: Sala3DInstancia | null = null;
  salaPayload: PayloadSala3D | null = null;
  salaLlave = "";

  constructor(opts: MundoOpts) {
    this.calidadBaja = opts.calidadBaja;
    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.lienzo,
      antialias: !opts.calidadBaja,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.calidadBaja ? 1.5 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.escena = new THREE.Scene();
    this.camara = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 120);
    const p0 = ZONA_POS[0];
    this.camara.position.set(p0[0], p0[1], p0[2]);
    this.camara.lookAt(0, 0, 0);

    // LUCES — el frío del espacio + el rim magenta de la casa (globo SIEMPRE legible)
    this.escena.add(new THREE.AmbientLight(0x35476b, 1.5));
    this.luzDir = new THREE.DirectionalLight(0xbfd8ff, 2.3);
    this.luzDir.position.set(5, 2.4, 4);
    this.escena.add(this.luzDir);
    this.luzRim = new THREE.PointLight(0xff2d78, 14, 40);
    this.luzRim.position.set(-7, -2.5, -5);
    this.escena.add(this.luzRim);

    this.construirEstrellas();
    this.construirTierra();
    this.construirMarcadores();
    this.construirParticulas();
    // v141: la capa holo (letras + portales) y los mundos por zona
    this.escena.add(this.holo);
    this.cargarFuente();
    this.construirMundos();
    // v143: la CÁPSULA de contenido (la Casa dentro del mundo) + la
    // consola de vuelo flotante — el último plano 2D se convierte en 3D
    this.construirCapsula();
    this.construirNavFlotante();
    // v144: EL PUENTE DE MANDO — el chrome entero de la Casa como holograma
    this.construirConsola();
    // v145: LA VENTANA HOLO — el menú flotando como proyección en el espacio
    this.construirVentana();
    // v145 P2: LOS WIDGETS FLOTANTES — radio y estado en las esquinas 3D
    this.construirWidges();
    // v144: la Casa publica sus pestañas y sus etiquetas i18n por eventos
    window.addEventListener("vg:holo-pestanas", this.onPestanasEv);
    window.addEventListener("vg:holo-etiquetas", this.onEtiquetasEv);
    // v145: la Casa manda abrir/cerrar LA VENTANA HOLO (menú / búsqueda)
    window.addEventListener("vg:holo-ventana", this.onVentanaEv);
    // v145: la Casa publica la SALA activa y sus datos vivos — el contenido
    // real de Vanguard nace en volumen dentro del mundo
    window.addEventListener("vg:sala3d", this.onSala3dEv);
    window.addEventListener("vg:sala3d-datos", this.onSala3dDatosEv);

    // la Tierra ya nace girando (REGLA 6)
    this.mundo.rotation.y = 1.2;
    this.escena.add(this.mundo);
    this.loop();
  }

  // ── LAS ESTRELLAS — dos capas de puntos con color propio ──
  construirEstrellas() {
    const n = this.calidadBaja ? 1300 : 2600;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const tinte = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xbfe4ff),
      new THREE.Color(0xffd9ec),
      new THREE.Color(0xfff3c4),
    ];
    for (let i = 0; i < n; i++) {
      // cáscara esférica lejana — el espacio alrededor de TODO
      const r = 26 + Math.random() * 60;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(ph);
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      const c = tinte[(Math.random() * tinte.length) | 0];
      const brillo = 0.5 + Math.random() * 0.5;
      col[i * 3] = c.r * brillo; col[i * 3 + 1] = c.g * brillo; col[i * 3 + 2] = c.b * brillo;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    this.matEstrellas = new THREE.PointsMaterial({
      size: this.baseEstrellas,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      depthWrite: false,
    });
    this.estrellas = new THREE.Points(geo, this.matEstrellas);
    this.escena.add(this.estrellas);
  }

  // ── LA TIERRA — blue marble local + atmósfera fresnel ──
  construirTierra() {
    const seg = this.calidadBaja ? 48 : 64;
    const R = 1.35;
    const loader = new THREE.TextureLoader();
    const mapa = loader.load("/assets/globe/earth-blue-marble.jpg");
    mapa.colorSpace = THREE.SRGBColorSpace;
    mapa.anisotropy = this.calidadBaja ? 2 : 4;
    const mat = new THREE.MeshPhongMaterial({
      map: mapa,
      specular: new THREE.Color(0x1c2b40),
      shininess: 7,
      emissive: new THREE.Color(0x0a1826), // el planeta nunca muere en negro
    });
    this.tierra = new THREE.Mesh(new THREE.SphereGeometry(R, seg, seg), mat);
    this.mundo.add(this.tierra);

    // ATMÓSFERA — fresnel aditivo por detrás (el brillo azul de la entrada)
    const matAtm = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0x4da6ff) }, uOp: { value: 0 } },
      vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uColor; uniform float uOp; varying vec3 vN;
        void main(){ float f = pow(0.66 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(uColor, 1.0) * f * uOp; }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.atmosfera = new THREE.Mesh(new THREE.SphereGeometry(R * 1.22, seg, seg), matAtm);
    this.mundo.add(this.atmosfera);
  }

  // ── LOS MARCADORES — teatros y frentes reales de la Casa ──
  construirMarcadores() {
    const R = 1.36;
    for (const m of construirMarcadores()) {
      const esTeatro = m.tipo === "teatro";
      const t = Math.min(1, m.intensidad / 100);
      // color por intensidad: ámbar → rojo sangre
      const col = new THREE.Color().lerpColors(new THREE.Color(0xffb347), new THREE.Color(0xff2d3a), t);
      const grupo = new THREE.Group();
      grupo.position.copy(latLngToVec3(m.lat, m.lng, R));

      const nucleo = new THREE.Mesh(
        new THREE.SphereGeometry(esTeatro ? 0.05 : 0.03, 10, 10),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 }),
      );
      const anillo = new THREE.Mesh(
        new THREE.RingGeometry(esTeatro ? 0.075 : 0.048, esTeatro ? 0.115 : 0.072, 24),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      // el anillo respira mirando hacia fuera del planeta
      anillo.lookAt(latLngToVec3(m.lat, m.lng, R * 2));
      // PROXY invisible para el dedo (REGLA 3: móvil primero) — OJO: visible:false
      // hace que el Raycaster lo IGNORE: opacidad 0 es la forma honesta
      const proxy = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      proxy.userData = { marcador: m };
      grupo.add(nucleo, anillo, proxy);
      this.mundo.add(grupo);
      this.marcadores.push({ grupo, nucleo, anillo, proxy, datos: m, fase: Math.random() * Math.PI * 2 });
    }
  }

  // ── PARTÍCULAS DE AMBIENTE — oro en la Arena, azul en el Cuartel ──
  construirParticulas() {
    const hacer = (color: number) => {
      const n = this.calidadBaja ? 110 : 220;
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const r = 2.6 + Math.random() * 2.4;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = (r * Math.cos(ph)) * 0.6;
        pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color, size: 0.035, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      });
      const pts = new THREE.Points(geo, mat);
      pts.visible = false;
      this.escena.add(pts);
      return pts;
    };
    this.particulasOro = hacer(0xffd27a);
    this.particulasAzul = hacer(0x7ab8ff);
  }

  // ════════════════════════════════════════════════════════
  // v143 — LA CÁPSULA DE CONTENIDO — el último plano 2D cae.
  // La Casa (las salas, el contenido de page.tsx) vive DENTRO de una
  // pantalla holográfica que se ACOPLA a la zona donde aterriza la
  // cámara: posición real en el espacio, escala real con la distancia,
  // orientación real mirando al piloto. CSS3DRenderer = DOM real con
  // matriz 3D real: todo sigue siendo clicable/scrollable por dentro.
  // ════════════════════════════════════════════════════════
  construirCapsula() {
    this.cssRenderer = new CSS3DRenderer();
    const el = this.cssRenderer.domElement;
    el.style.position = "fixed";
    el.style.inset = "0";
    el.style.zIndex = "1"; // sobre el lienzo (-1), bajo el HUD de la Casa (z20+)
    el.style.pointerEvents = "none";
    // v143 QA: el renderer CSS debe vivir DENTRO del árbol de la Casa —
    // el div raíz (#vg-casa, z-10) crea un contexto de apilamiento: si el
    // renderer cuelga de <body>, el lienzo WebGL (z -1 dentro del contexto
    // de la Casa) pintaría ENCIMA de la cápsula y el planeta la taparía
    const casa = document.getElementById("vg-casa") || document.body;
    casa.appendChild(el);
    this.cssRenderer.setSize(window.innerWidth, window.innerHeight);

    // el CUERPO: marco holográfico → paralaje → ventana de scroll.
    // page.tsx porta las salas DENTRO de capsulaScroll (createPortal).
    const cuerpo = document.createElement("div");
    cuerpo.className = "vg143-capsula";
    cuerpo.dataset.acoplada = "0";
    const marco = document.createElement("div");
    marco.className = "vg143-marco";
    const paralaje = document.createElement("div");
    paralaje.className = "vg143-paralaje";
    const scroll = document.createElement("div");
    scroll.className = "vg143-scroll";
    paralaje.appendChild(scroll);
    marco.appendChild(paralaje);
    cuerpo.appendChild(marco);
    this.capsulaScroll = scroll;
    this.capsulaEl = cuerpo;
    this.dimensionarCapsula();
    this.capsula = new CSS3DObject(cuerpo);
    this.capsula.visible = false; // nace dormida: despierta al acoplar
    this.cssEscena.add(this.capsula);
    document.documentElement.setAttribute("data-wgl-capsula", "1");
    // la Casa se entera: su contenido nace DENTRO del mundo (portal React)
    (window as unknown as { __vgCapsulaHost?: HTMLDivElement }).__vgCapsulaHost = scroll;
    window.dispatchEvent(new CustomEvent("vg:wgl-capsula", { detail: scroll }));
  }

  // el tamaño CSS del cuerpo (px) — la escala 3D lo normaliza por zona
  // v145: MODO CONSOLA — las salas insignia ponen su escenario 3D arriba
  // y la cápsula se hace consola de mando compacta abajo
  private dimensionarCapsula() {
    const movil = window.innerWidth < 768;
    const consola = this.esInsignia() && !!this.salaInst;
    const w = movil ? Math.min(window.innerWidth - 26, 420) : consola ? 720 : 1000;
    const h = movil
      ? Math.round(window.innerHeight * (consola ? 0.3 : 0.56))
      : Math.round(Math.min(window.innerHeight * (consola ? 0.3 : 0.74), consola ? 290 : 660));
    this.capsulaEl.style.width = `${w}px`;
    this.capsulaEl.style.height = `${h}px`;
    this.capsulaPx = w;
    this.capsulaEl.dataset.consola = consola ? "1" : "0";
  }

  private esMovil() { return window.innerWidth < 768; }

  // la ANCLA de la cápsula en una zona: EXACTAMENTE el punto de mira de la
  // pose (la cámara la tiene centrada — el planeta queda a la izquierda por
  // el desvío de la pose). La escala sale del frustum a esa distancia: la
  // cápsula ocupa una FRACCIÓN fija de la pantalla en cualquier zona.
  private anclaCapsula(zona: number): { pos: THREE.Vector3; escala: number } {
    const { pos, tgt } = this.poseDe(zona);
    const dir = new THREE.Vector3(tgt.x - pos[0], tgt.y - pos[1], tgt.z - pos[2]);
    const dist = Math.max(1.2, dir.length());
    const altoMundo = 2 * dist * Math.tan((this.camara.fov * Math.PI) / 360);
    const anchoMundo = altoMundo * this.camara.aspect;
    const movil = this.esMovil();
    const consola = this.esInsignia() && !!this.salaInst;
    const fracAncho = movil ? (consola ? 0.82 : 0.92) : consola ? 0.42 : 0.52;
    const escala = (anchoMundo * fracAncho) / this.capsulaPx;
    // la pantalla flota un pelín POR DEBAJO del eje de mira: respire el
    // ticker superior del chrome (la corona de la Casa sigue siendo HUD).
    // En consola baja MÁS: el escenario 3D de la sala vive arriba
    const p = tgt.clone();
    p.y -= altoMundo * (consola ? (movil ? 0.33 : 0.29) : 0.035);
    return { pos: p, escala };
  }

  // ACOPLAR: la cápsula vuela a la ancla de la zona y queda PARALELA a la
  // pantalla del piloto (quaternion de la cámara — cero skew: el contenido
  // se lee perfecto y aún así vive en el espacio, con paralaje y warp reales)
  acoplarCapsula(zona: number, instant = false) {
    if (this.modoMundo || zona === 0 || !this.capsula) return;
    const a = this.anclaCapsula(zona);
    this.capsula.position.copy(a.pos);
    // v144 P1: POSE DE CONSOLA — yaw deliberado de 6° (la pantalla ya no es
    // una pared paralela: es la consola de mando del universo)
    this.capsula.quaternion.copy(this.camara.quaternion);
    this.capsula.quaternion.multiply(Q_YAW_CONSOLA);
    this.capsula.visible = true;
    this.capsulaAcoplada = true;
    this.capsulaEl.dataset.acoplada = "1";
    // v145: el HAZ DEL PROYECTOR enciende — la pantalla flota SOBRE una luz
    this.armarHaz(a.pos, a.escala);
    if (instant) { this.capsula.scale.setScalar(a.escala); this.anclarSala(true); return; }
    this.capsula.scale.setScalar(a.escala * 0.9);
    this.animarP(this.capsula.scale, { x: a.escala, y: a.escala, z: a.escala }, 620, { ease: easeOut });
    // v144 P1: el ACOPLE suena a metal asentándose
    sonar("clank");
    // v145: la SALA 3D de la zona nace con el aterrizaje
    this.anclarSala();
  }

  // DESACOPLAR: la pantalla se apaga mientras la cámara vuela (o en MODO MUNDO)
  desacoplarCapsula() {
    if (!this.capsulaAcoplada) return;
    this.capsulaAcoplada = false;
    this.capsulaEl.dataset.acoplada = "0";
    this.apagarHaz(); // v145: el proyector duerme con la pantalla
  }

  // ════════════════════════════════════════════════════════
  // v143 — LA CONSOLA DE VUELO — la navbar de zonas flotando en el
  // espacio, acoplada a la cámara (hija espiritual del HUD militar):
  // respira con el FOV del warp y siempre queda al fondo del cuadro.
  // ════════════════════════════════════════════════════════
  construirNavFlotante() {
    const el = document.createElement("div");
    el.className = "vg143-navhost";
    this.navEl = el;
    this.recalibrarNav();
    this.navObj = new CSS3DObject(el);
    this.cssEscena.add(this.navObj);
    (window as unknown as { __vgNavHost?: HTMLDivElement }).__vgNavHost = el;
    window.dispatchEvent(new CustomEvent("vg:wgl-navhost", { detail: el }));
  }

  private recalibrarNav() {
    const movil = this.esMovil();
    const w = movil ? 322 : 470;
    this.navEl.style.width = `${w}px`;
    this.navPx = w;
    this.navFrac = movil ? 0.9 : 0.44;
  }

  // ════════════════════════════════════════════════════════
  // v145 — SALAS EN VOLUMEN — el contenido real de la sala
  // activa (el gráfico de la economía, la mesa de conflictos, la
  // galería de memes, la placa de cualquier otra rama) vive en
  // el mundo 3D, anclado a la zona donde aterriza la cámara.
  // ════════════════════════════════════════════════════════

  // las salas INSIGNIA tienen constructor propio (economía,
  // conflictos, memes) — el resto lleva su placa genérica
  private esInsignia(): boolean {
    return !!this.salaPayload && this.salaPayload.tipo !== "generica";
  }

  private onSala3dEv = (e: Event) => {
    const p = (e as CustomEvent<PayloadSala3D>).detail;
    if (!p?.tab) return;
    const llave = `${p.tab}|${p.titulo}`;
    if (this.salaLlave === llave && this.salaInst) return;
    this.salaLlave = llave;
    this.salaPayload = p;
    this.montarSala();
  };

  private onSala3dDatosEv = (e: Event) => {
    const p = (e as CustomEvent<PayloadSala3D>).detail;
    if (!p?.tab) return;
    // datos vivos de la sala montada (o de la que aún no nace)
    if (this.salaPayload && this.salaPayload.tab !== p.tab) return;
    const eraGenerica = this.salaPayload?.tipo === "generica";
    this.salaPayload = p;
    if (this.salaInst && !eraGenerica && p.tipo !== "generica") {
      this.salaInst.actualizar(p);
    } else {
      // la sala nace/asciende a insignia con datos reales
      this.montarSala();
    }
  };

  montarSala() {
    if (!this.fuente || !this.salaPayload) return;
    this.desmontarSala(true);
    const p = this.salaPayload;
    const ctx: CtxSala3D = {
      fuente: this.fuente,
      calidadBaja: this.calidadBaja,
      movil: this.esMovil(),
      animarP: (obj, to, ms, opts) => this.animarP(obj as ObjNum, to, ms, opts),
    };
    try {
      this.salaInst = construirSala3D(ctx, p);
    } catch (e) {
      // el fallo se VE: una sala rota nunca muere en silencio
      console.warn("[v145] montarSala fallo:", e);
      this.salaInst = null;
      return;
    }
    this.salaInst.grupo.visible = false;
    this.escena.add(this.salaInst.grupo);
    // la cápsula se hace consola (o vuelve a pantalla) según la sala
    this.dimensionarCapsula();
    if (this.capsulaAcoplada && !this.modoMundo && this.zona !== 0) {
      this.acoplarCapsula(this.zona, true);
      this.anclarSala();
      sonar("ping");
    }
  }

  desmontarSala(instant = false) {
    const inst = this.salaInst;
    if (!inst) return;
    this.salaInst = null;
    if (instant) {
      this.escena.remove(inst.grupo);
      this.desechar(inst.grupo);
      inst.liberar();
      return;
    }
    const g = inst.grupo;
    const s0 = g.scale.x;
    const obj = { t: 0 };
    this.animarP(obj, { t: 1 }, 300, {
      onUpdate: () => g.scale.setScalar(Math.max(s0 * (1 - obj.t), 0.001)),
      onDone: () => { this.escena.remove(g); this.desechar(g); inst.liberar(); },
    });
  }

  // barrido de geometrías/materiales del grupo (los compartidos se
  // disponen dos veces — dispose es idempotente en three)
  private desechar(g: THREE.Object3D) {
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else if (mat) mat.dispose();
    });
  }

  // la ANCLA del escenario 3D de la sala: sobre el punto de mira de
  // la pose. Insignia: héroe ARRIBA (la cápsula-consola vive abajo).
  // Genérica: placa flotando SOBRE la cápsula completa.
  private anclarSala(instant = false) {
    const inst = this.salaInst;
    const p = this.salaPayload;
    if (!inst || !p || this.modoMundo || this.zona === 0 || !this.capsulaAcoplada) return;
    const insignia = p.tipo !== "generica";
    const a = this.anclaSala(insignia);
    inst.grupo.position.copy(a.pos);
    inst.grupo.quaternion.copy(this.camara.quaternion);
    inst.grupo.quaternion.multiply(Q_YAW_CONSOLA);
    inst.grupo.visible = true;
    if (instant) { inst.grupo.scale.setScalar(a.escala); return; }
    inst.grupo.scale.setScalar(a.escala * 0.84);
    this.animarP(inst.grupo.scale, { x: a.escala, y: a.escala, z: a.escala }, 620, { ease: easeOut });
  }

  private anclaSala(insignia: boolean): { pos: THREE.Vector3; escala: number } {
    // v145 QA: ancla EN COORDENADAS DE PANTALLA (como el puente de mando) —
    // el planeta vive al centro-izquierda del encuadre; la sala insignia
    // flota ARRIBA-DERECHA (desktop) o ARRIBA (móvil) sin que el globo la tape
    const dist = insignia ? 3.4 : 4.0;
    const altoMundo = 2 * dist * Math.tan((this.camara.fov * Math.PI) / 360);
    const anchoMundo = altoMundo * this.camara.aspect;
    const movil = this.esMovil();
    const fracAncho = movil ? 0.94 : insignia ? 0.44 : 0.46;
    // los constructores miden ~2.6 unidades de ancho
    const escala = (anchoMundo * fracAncho) / 2.6;
    const f = new THREE.Vector3();
    this.camara.getWorldDirection(f);
    const arriba = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camara.quaternion);
    const derecha = new THREE.Vector3().crossVectors(f, arriba).normalize();
    // fracciones del cuadro: insignia → x +19%, y +9% (desktop); genérica →
    // placa SOBRE la cápsula completa
    const fx = insignia ? (movil ? 0 : 0.19) : 0;
    const fy = insignia ? (movil ? 0.22 : 0.05) : 0;
    const pos = this.camara.position.clone()
      .addScaledVector(f, dist)
      .addScaledVector(derecha, anchoMundo * fx)
      .addScaledVector(arriba, altoMundo * fy);
    if (!insignia) {
      const { tgt } = this.poseDe(this.zona);
      const dir = new THREE.Vector3(tgt.x - this.camara.position.x, tgt.y - this.camara.position.y, tgt.z - this.camara.position.z);
      const distT = Math.max(1.2, dir.length());
      const altoT = 2 * distT * Math.tan((this.camara.fov * Math.PI) / 360);
      const escCaps = (altoT * this.camara.aspect * (movil ? 0.92 : 0.52)) / this.capsulaPx;
      const altoCapsMundo = (this.capsulaEl?.offsetHeight || 600) * escCaps;
      pos.copy(tgt);
      pos.y += altoT * 0.035 + altoCapsMundo / 2 + 0.75 * escala;
    }
    return { pos, escala };
  }

  // por frame: posición/orientación/escala de la consola pegadas a la cámara
  private acoplarNavFrame() {
    if (!this.navObj) return;
    const zNav = 3.1;
    const fovR = (this.camara.fov * Math.PI) / 180;
    const alto = 2 * zNav * Math.tan(fovR / 2);
    const ancho = alto * this.camara.aspect;
    const escala = (ancho * this.navFrac) / this.navPx;
    this.navObj.scale.setScalar(escala);
    const hPx = this.navEl.offsetHeight || 58;
    const mundoPorPx = alto / window.innerHeight;
    const y = -(alto / 2) + (hPx * escala) / 2 + 16 * mundoPorPx;
    const f = new THREE.Vector3();
    this.camara.getWorldDirection(f);
    const arriba = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camara.quaternion);
    this.navObj.position.copy(this.camara.position).addScaledVector(f, zNav).addScaledVector(arriba, y);
    this.navObj.quaternion.copy(this.camara.quaternion);
  }

  // ════════════════════════════════════════════════════════
  // v145 P2 — LOS WIDGETS FLOTANTES — la radio y el estado del enlace
  // como mini-pantallas holográficas en las ESQUINAS del plano de mando.
  // position:fixed no sobrevive un portal CSS3D… pero el CONTAINING BLOCK
  // de un elemento transformado sí atrapa a los fixed: el widget ancla a
  // la esquina de SU host, y el host flota en el espacio del puente.
  // ════════════════════════════════════════════════════════
  construirWidges() {
    const hacer = (clase: string, w: number, h: number) => {
      const host = document.createElement("div");
      host.className = `vg145-widhost ${clase}`;
      host.style.width = `${w}px`;
      host.style.height = `${h}px`;
      const obj = new CSS3DObject(host);
      obj.visible = false; // despiertan al terminar la entrada
      this.cssEscena.add(obj);
      return { obj, host };
    };
    const izq = hacer("vg145-wid-izq", this.widIzqPx, 52);
    this.widIzqObj = izq.obj;
    this.widIzqEl = izq.host;
    const der = hacer("vg145-wid-der", this.widDerPx, 96);
    this.widDerObj = der.obj;
    this.widDerEl = der.host;
    (window as unknown as { __vgWidIzqHost?: HTMLDivElement }).__vgWidIzqHost = izq.host;
    (window as unknown as { __vgWidDerHost?: HTMLDivElement }).__vgWidDerHost = der.host;
    window.dispatchEvent(new CustomEvent("vg:wgl-widhosts", { detail: { izq: izq.host, der: der.host } }));
  }

  private setVisibleWidges(on: boolean) {
    if (this.widIzqObj) this.widIzqObj.visible = on;
    if (this.widDerObj) this.widDerObj.visible = on;
  }

  // por frame: cada widget clavado en SU esquina del plano de mando
  private acoplarWidgesFrame() {
    const f = new THREE.Vector3();
    this.camara.getWorldDirection(f);
    const arriba = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camara.quaternion);
    const derecha = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camara.quaternion);
    const movil = this.esMovil();
    const colocar = (obj: CSS3DObject | null, el: HTMLDivElement | null, px: number, frac: number, lado: number) => {
      if (!obj || !el || !obj.visible) return;
      const alto = this.altoPlano(Z_CONSOLA);
      const ancho = alto * this.camara.aspect;
      const escala = (ancho * frac) / Math.max(px, 1);
      obj.scale.setScalar(escala);
      const hPx = el.offsetHeight || 48;
      const x = lado * (ancho / 2 - (px * escala) / 2 - 0.2);
      const y = -(alto / 2) + (hPx * escala) / 2 + (movil ? 0.3 : 0.36);
      obj.position.copy(this.camara.position).addScaledVector(f, Z_CONSOLA).addScaledVector(arriba, y).addScaledVector(derecha, x);
      obj.quaternion.copy(this.camara.quaternion);
    };
    colocar(this.widIzqObj, this.widIzqEl, this.widIzqPx, movil ? 0.42 : 0.15, -1);
    colocar(this.widDerObj, this.widDerEl, this.widDerPx, movil ? 0.5 : 0.185, 1);
  }

  // ════════════════════════════════════════════════════════
  // v145 — LA VENTANA HOLO — el MENÚ y la BÚSQUEDA como proyección 3D.
  // Fin de las capas fijas al viewport: el menú SALE de la pantalla como un
  // holograma, se planta frente al piloto con su marco remachado, respira
  // con la cámara y su contenido es DOM real (React portal): clicable y
  // scrollable por dentro, volumétrico por fuera.
  // ════════════════════════════════════════════════════════
  construirVentana() {
    const cuerpo = document.createElement("div");
    cuerpo.className = "vg145-ventana";
    cuerpo.dataset.abierta = "0";
    const marco = document.createElement("div");
    marco.className = "vg145-marco-ventana";
    const scan = document.createElement("div");
    scan.className = "vg145-scan";
    const host = document.createElement("div");
    host.className = "vg145-ventana-host";
    marco.appendChild(scan);
    marco.appendChild(host);
    cuerpo.appendChild(marco);
    this.ventanaEl = cuerpo;
    this.ventanaHost = host;
    this.recalibrarVentana();
    this.ventanaObj = new CSS3DObject(cuerpo);
    this.ventanaObj.visible = false;
    this.cssEscena.add(this.ventanaObj);
    this.ventanaNacida = true;
    (window as unknown as { __vgVentanaHost?: HTMLDivElement }).__vgVentanaHost = host;
    window.dispatchEvent(new CustomEvent("vg:wgl-ventanahost", { detail: host }));
  }

  private recalibrarVentana() {
    const movil = this.esMovil();
    const w = movil ? Math.min(window.innerWidth - 16, 430) : Math.min(Math.round(window.innerWidth * 0.86), 1240);
    const h = movil ? Math.round(window.innerHeight * 0.8) : Math.round(Math.min(window.innerHeight * 0.82, 800));
    this.ventanaEl.style.width = `${w}px`;
    this.ventanaEl.style.height = `${h}px`;
    this.ventanaPx = w;
    this.ventanaFrac = movil ? 0.97 : 0.84;
  }

  // abrir/cerrar la proyección (la Casa manda por vg:holo-ventana)
  setVentana(on: boolean) {
    if (!this.ventanaNacida || on === this.ventanaOn) return;
    this.ventanaOn = on;
    if (on) {
      this.ventanaEl.dataset.abierta = "1";
      this.ventanaObj.visible = true;
      // nace un pelín pequeña y se ASIENTA en el aire (acople de proyector)
      const escala = this.escalaVentana();
      this.ventanaObj.scale.setScalar(escala * 0.86);
      this.animarP(this.ventanaObj.scale, { x: escala, y: escala, z: escala }, 560, { ease: easeOut });
      sonar("clank");
    } else {
      this.ventanaEl.dataset.abierta = "0";
      const escala = this.escalaVentana();
      this.animarP(this.ventanaObj.scale, { x: escala * 0.86, y: escala * 0.86, z: escala * 0.86 }, 300, {
        ease: easeInOut,
        onDone: () => { if (!this.ventanaOn) this.ventanaObj.visible = false; },
      });
      sonar("tic");
    }
  }

  // la escala que llena una FRACCIÓN fija del cuadro a la distancia de la ventana
  private escalaVentana(): number {
    const alto = this.altoPlano(Z_VENTANA);
    const ancho = alto * this.camara.aspect;
    return (ancho * this.ventanaFrac) / Math.max(this.ventanaPx, 1);
  }

  // por frame: pegada a la cámara (delante del puente — sale HACIA el piloto)
  private acoplarVentanaFrame() {
    if (!this.ventanaNacida || !this.ventanaObj.visible) return;
    const f = new THREE.Vector3();
    this.camara.getWorldDirection(f);
    this.ventanaObj.position.copy(this.camara.position).addScaledVector(f, Z_VENTANA);
    this.ventanaObj.quaternion.copy(this.camara.quaternion);
    this.ventanaObj.quaternion.multiply(Q_YAW_CONSOLA);
  }

  // ════════════════════════════════════════════════════════
  // v145 — VUELO LIBRE — el piloto toma el mando:
  //  · TECLADO: WASD/flechas (adelante/atrás/lados), Q/E (abajo/arriba),
  //    Shift = impulso. Inercia de nave: la velocidad llega y se va suave.
  //  · ARRASTRE (ratón o dedo): girar la mirada libremente.
  //  · RUEDA / PINZA: acercar y alejar el vuelo.
  // Límites: la cámara NUNCA atraviesa el planeta ni abandona el universo.
  // ════════════════════════════════════════════════════════
  private libreOK(): boolean {
    // después de la entrada (o en pleno modo mundo), nunca en pleno vuelo de zona
    return this.consolaVisibleFin && !this.enVuelo;
  }

  iniciarMirada() {
    if (!this.libreOK()) return;
    this.arrastrando = true;
    this.dirArrastre.copy(this.mirada).sub(this.camara.position).normalize();
  }

  moverMirada(dxPx: number, dyPx: number) {
    if (!this.arrastrando) return;
    const yaw = -dxPx * 0.0030;
    const pitch = -dyPx * 0.0030;
    const dir = this.dirArrastre.clone();
    // yaw alrededor del eje Y del mundo
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    // pitch alrededor del eje DERECHA de la propia dirección
    const derecha = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));
    if (derecha.lengthSq() > 1e-6) {
      dir.applyAxisAngle(derecha.normalize(), pitch);
      // límite de cabeza: jamás más de ±72° de inclinación
      const len = dir.length();
      const maxY = len * Math.sin(1.25);
      if (dir.y > maxY) dir.y = maxY;
      if (dir.y < -maxY) dir.y = -maxY;
      dir.normalize();
    }
    this.dirArrastre.copy(dir);
    this.mirada.copy(this.camara.position).addScaledVector(dir, 4);
    this.camara.lookAt(this.mirada.x, this.mirada.y, this.mirada.z);
  }

  terminarMirada() { this.arrastrando = false; }

  // rueda / pinza: empujón de dolly con la misma inercia del vuelo
  dolar(delta: number) {
    if (!this.libreOK()) return;
    const dir = new THREE.Vector3().subVectors(this.mirada, this.camara.position).normalize();
    this.vel.addScaledVector(dir, -delta * 0.0032);
  }

  // movimientos del teclado → velocidad objetivo; el loop integra con inercia
  private integrarLibre(dt: number) {
    if (!this.libreOK()) { this.vel.multiplyScalar(Math.max(0, 1 - dt * 6)); return; }
    const T = this.teclas;
    let fwd = 0, lado = 0, vert = 0;
    if (T.has("w") || T.has("arrowup")) fwd += 1;
    if (T.has("s") || T.has("arrowdown")) fwd -= 1;
    if (T.has("d") || T.has("arrowright")) lado += 1;
    if (T.has("a") || T.has("arrowleft")) lado -= 1;
    if (T.has("e")) vert += 1;
    if (T.has("q")) vert -= 1;
    const obj = new THREE.Vector3(lado, vert, fwd);
    if (obj.lengthSq() > 0) {
      obj.normalize().multiplyScalar(VEL_LIBRE * (T.has("shift") ? 2.3 : 1));
      // los ejes del VUELO salen de la CÁMARA: adelante = hacia la mirada
      const dirF = new THREE.Vector3().subVectors(this.mirada, this.camara.position).normalize();
      const dirR = new THREE.Vector3().crossVectors(dirF, new THREE.Vector3(0, 1, 0)).normalize();
      const dirU = new THREE.Vector3().crossVectors(dirR, dirF).normalize();
      const objetivo = new THREE.Vector3()
        .addScaledVector(dirF, obj.z)
        .addScaledVector(dirR, obj.x)
        .addScaledVector(dirU, obj.y);
      this.vel.lerp(objetivo, 1 - Math.exp(-dt * 7.5));
    } else {
      this.vel.multiplyScalar(Math.max(0, 1 - dt * 5.2)); // frena suave (inercia)
    }
    if (this.vel.lengthSq() < 1e-7) return;
    const p = this.camara.position.clone().addScaledVector(this.vel, dt);
    // LÍMITES del universo piloteable
    const r = Math.hypot(p.x, p.z);
    if (p.length() < R_MIN_GLOBO) return;       // el planeta es intocable
    if (p.length() > R_MAX_UNI) return;         // el universo tiene pared
    p.y = Math.max(Y_MIN_LIBRE, Math.min(Y_MAX_LIBRE, p.y));
    const d = p.clone().sub(this.camara.position);
    this.camara.position.copy(p);
    this.mirada.add(d); // la mirada viaja CON la cámara (orientación intacta)
    this.camara.lookAt(this.mirada.x, this.mirada.y, this.mirada.z);
  }

  // calmar el vuelo libre (al despegar a otra zona, todo se asienta)
  calmarLibre() {
    this.vel.set(0, 0, 0);
    this.arrastrando = false;
    this.teclas.clear();
    this.pendiente = null;
    this.punteros.clear();
  }

  // ════════════════════════════════════════════════════════
  // v145 — EL HAZ DEL PROYECTOR — la cápsula no flota sola: una luz
  // volumétrica nace debajo de ella y la SOSTIENE en el aire (el truco
  // de los hologramas de cine: el cono aditivo que «proyecta» la pantalla)
  // ════════════════════════════════════════════════════════
  private armarHaz(pos: THREE.Vector3, escala: number) {
    if (!this.hazCrono) {
      const geo = new THREE.ConeGeometry(0.62, 1.5, 26, 1, true);
      this.matHaz = new THREE.MeshBasicMaterial({
        color: 0x00e5ff, transparent: true, opacity: 0.075,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      });
      this.hazCrono = new THREE.Mesh(geo, this.matHaz);
      this.escena.add(this.hazCrono);
    }
    this.hazCrono.visible = true;
    this.hazActivo = true;
    this.hazCrono.scale.setScalar(escala);
    // la punta del cono toca la BASE de la pantalla: nace abajo y abre hacia arriba
    this.hazCrono.position.set(pos.x, pos.y - 0.75 * escala, pos.z);
  }

  private apagarHaz() {
    this.hazActivo = false;
    if (this.hazCrono) this.hazCrono.visible = false;
  }
  //  · MODO MUNDO: LA POSE DEL UNIVERSO (v142) — todo el mundo en cuadro
  //  · Z0: el espacio centrado (entrada pura)
  //  · panel abierto: el mira se desvía a la DERECHA de la
  //    pantalla → planeta a la izquierda, contenido a la derecha
  // ════════════════════════════════════════════════════════
  private poseDe(zona: number): { pos: [number, number, number]; tgt: THREE.Vector3 } {
    if (this.modoMundo && zona !== 0) {
      return { pos: POSE_MUNDO, tgt: new THREE.Vector3(TGT_MUNDO[0], TGT_MUNDO[1], TGT_MUNDO[2]) };
    }
    const t0 = ZONA_TGT[zona];
    const tgt = new THREE.Vector3(t0[0], t0[1], t0[2]);
    if (zona === 0) return { pos: ZONA_POS[0], tgt };
    // desviar el punto de mira sobre el vector DERECHA de la cámara:
    // funciona igual en las 5 zonas sin recalcular poses a mano
    const pos = ZONA_POS[zona];
    const dir = new THREE.Vector3(t0[0] - pos[0], t0[1] - pos[1], t0[2] - pos[2]).normalize();
    const derecha = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    tgt.addScaledVector(derecha, POSE_PANEL_DESV);
    return { pos, tgt };
  }
  // EL VUELO DE CÁMARA puro (compartido por volarAZona e irAPose)
  // v142: al aterrizar suena el FRENO — dos notas graves que anclan la sala
  private volarCamara(pos: [number, number, number], tgt: THREE.Vector3, dur: number) {
    this.calmarLibre(); // v145: el vuelo de zona SIEMPRE calma el vuelo libre
    const objPos = { x: this.camara.position.x, y: this.camara.position.y, z: this.camara.position.z };
    const objMir = { x: this.mirada.x, y: this.mirada.y, z: this.mirada.z };
    this.animarP(objPos, { x: pos[0], y: pos[1], z: pos[2] }, dur, {
      onUpdate: () => {
        this.camara.position.set(objPos.x, objPos.y, objPos.z);
        this.camara.lookAt(objMir.x, objMir.y, objMir.z);
      },
    });
    this.animarP(objMir, { x: tgt.x, y: tgt.y, z: tgt.z }, dur, {
      onUpdate: () => this.camara.lookAt(objPos.x, objPos.y, objPos.z),
      onDone: () => {
        this.mirada.copy(tgt);
        this.camara.lookAt(tgt.x, tgt.y, tgt.z);
        this.enVuelo = false;
        sonar("freno");
        // v143: al aterrizar, la CÁPSULA de contenido se acopla a la ancla
        // de la zona — la Casa vive donde la cámara posa (el MODO MUNDO
        // la mantiene apagada: el universo queda desnudo)
        this.acoplarCapsula(this.zona);
      },
    });
  }

  // re-volar a la MISMA zona (para alternar pose panel/mundo sin cambiar de sala)
  irAPose(dur = 950) {
    if (this.enVuelo) return;
    const { pos, tgt } = this.poseDe(this.zona);
    // v142: la VISIBILIDAD también viaja con la pose — al entrar/salir del
    // modo mundo el universo se viste o se desviste sin cambiar de zona
    this.visibleZona(this.zona);
    this.volarCamara(pos, tgt, dur);
  }

  // qué es visible en cada zona: mundos 1-4, títulos 3D y portales
  // v142: en MODO MUNDO se ve TODO — cada lugar del universo a la vista
  visibleZona(zona: number) {
    const modo = this.modoMundo;
    for (const z of [1, 2, 3, 4]) {
      const g = this.mundosZona[z];
      if (!g) continue;
      const debe = modo || z === zona;
      if (debe && !g.visible) {
        g.visible = true;
        g.scale.setScalar(0.84);
        this.animarP(g.scale, { x: 1, y: 1, z: 1 }, 850, { ease: easeOut });
      } else if (!debe) g.visible = false;
    }
    for (const tz of this.titulosZona) tz.grupo.visible = modo || (tz.zona === zona && zona !== 0);
    const portalesOn = modo || zona === 1;
    for (const p of this.portales) {
      p.grupo.visible = portalesOn;
      // v142: en MODO MUNDO las etiquetas de los portales sobran — cada mundo
      // ya luce su TÍTULO 3D encima (adiós al texto duplicado apilado).
      // En MÓVIL se quedan: los títulos de los mundos viven fuera del cuadro
      // retrato y la etiqueta es la única placa con nombre del portal.
      p.etiqueta.visible = !modo || this.calidadBaja;
    }
  }

  // ════════════════════════════════════════════════════════
  // v141 — LAS LETRAS 3D — tipografía volumétrica real
  // ════════════════════════════════════════════════════════
  // v145: Rajdhani primero; si el JSON no llegara (REGLA 5 del mundo),
  // helvetiker rescata las letras — el universo JAMÁS queda mudo
  cargarFuente() {
    new FontLoader().load(FUENTE_PRIMARIA, (f) => this.aplicarFuente(f), undefined, () => {
      new FontLoader().load(FUENTE_RESERVA, (f) => this.aplicarFuente(f), undefined, () => {
        /* sin fuente el mundo sigue: los títulos DOM ya existen */
      });
    });
  }

  private aplicarFuente(f: Font) {
    if (!this.vivo) return;
    this.fuente = f;
    this.construirLetras3D();
    // v142: si el reencuentro corrió ANTES de que la fuente llegara, los
    // portales/títulos nacen con su visibilidad por defecto (apagada) —
    // se reaplica el vestido de la zona actual para ganar la carrera
    this.visibleZona(this.zona);
    if (this.pendienteLogo) { this.pendienteLogo = false; this.nacerLogo(); }
    // v144: con fuente a bordo, EL PUENTE se viste completo
    this.reconstruirPuente();
    this.vestirDecoracion();
    // v145: si la sala 3D llegó antes que la fuente, nace ahora
    if (this.salaPayload) this.montarSala();
  }

  // la fuente typeface no trae acentos: como un HUD militar, se caen
  private sanitizar(t: string): string {
    return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  }

  // convierte un texto en letras extruidas individuales (volumen real)
  // v145: Rajdhani es condensada — compensa ×1.12 · metal más frío (menos
  // caricatura: acero antracita con filo de neón que el filoLetra cuelga)
  private hacerTexto3D(texto: string, o: { tam: number; prof: number; color: number; emis: number }): { grupo: THREE.Group; letras: Letra3D[]; ancho: number } {
    const grupo = new THREE.Group();
    const letras: Letra3D[] = [];
    const mat = new THREE.MeshStandardMaterial({
      color: o.color,
      metalness: 0.86,
      roughness: 0.24,
      emissive: new THREE.Color(o.color),
      emissiveIntensity: o.emis,
      transparent: true,
      opacity: 0,
    });
    const tam = o.tam * 1.12;
    let cursor = 0;
    for (const crudo of this.sanitizar(texto)) {
      if (crudo === " ") { cursor += tam * 0.55; continue; }
      let geo: TextGeometry | null = null;
      try {
        geo = new TextGeometry(crudo, {
          font: this.fuente!,
          size: tam,
          depth: o.prof,
          curveSegments: this.calidadBaja ? 3 : 5,
          bevelEnabled: false,
        });
      } catch { continue; }
      geo.computeBoundingBox();
      const bb = geo.boundingBox!;
      const w = Math.max(0.001, bb.max.x - bb.min.x);
      geo.translate(-bb.min.x - w / 2, -(bb.max.y + bb.min.y) / 2, -o.prof / 2);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cursor + w / 2, 0, 0);
      mesh.visible = false;
      grupo.add(mesh);
      letras.push({ mesh, fase: Math.random() * Math.PI * 2, base: mesh.position.clone() });
      cursor += w + tam * 0.13;
    }
    return { grupo, letras, ancho: Math.max(cursor - tam * 0.13, 0.001) };
  }

  // v145 — FILO DE NEÓN: aristas luminosas sobre una letra (el logo y los
  // títulos leen como hardware holográfico militar, no como juguete)
  private filoLetra(mesh: THREE.Mesh, color: number, op = 0.42) {
    const filo = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry, 18),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: op }),
    );
    filo.raycast = () => {}; // el filo NO intercepta el dedo
    mesh.add(filo);
  }

  private construirLetras3D() {
    if (!this.fuente) return;
    // EL LOGO — 8 letras de oro extruido flotando sobre el planeta
    const logo = this.hacerTexto3D("VANGUARD", { tam: 0.34, prof: 0.11, color: 0xf5c542, emis: 0.5 });
    logo.grupo.position.set(-logo.ancho / 2, 2.02, 0.55);
    this.holo.add(logo.grupo);
    this.logoGrupo = logo.grupo;
    this.letrasLogo = logo.letras;
    for (const l of this.letrasLogo) { l.expandida = l.base.clone(); this.filoLetra(l.mesh, 0xffe9a0, 0.4); }
    if (this.logoNacido) this.compactarLogoInstante();
    // LOS TÍTULOS DE CADA MUNDO — tocables (tocar el título = entrar)
    for (const t of TITULOS_3D) {
      const tit = this.hacerTexto3D(t.texto, { tam: t.tam, prof: t.tam * 0.38, color: t.color, emis: t.emis });
      tit.grupo.position.set(t.p[0] - tit.ancho / 2, t.p[1], t.p[2]);
      for (const l of tit.letras) {
        (l.mesh.material as THREE.MeshStandardMaterial).opacity = 1;
        l.mesh.visible = true;
        this.filoLetra(l.mesh, t.color, 0.5);
      }
      const sub = this.hacerTexto3D(t.sub, { tam: t.tam * 0.4, prof: t.tam * 0.18, color: t.color, emis: t.emis * 0.72 });
      sub.grupo.position.set(t.p[0] - sub.ancho / 2, t.p[1] - t.tam * 0.9, t.p[2]);
      for (const l of sub.letras) {
        (l.mesh.material as THREE.MeshStandardMaterial).opacity = 0.92;
        l.mesh.visible = true;
      }
      const envoltura = new THREE.Group();
      envoltura.add(tit.grupo, sub.grupo);
      const proxy = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(tit.ancho * 0.55, 0.75), 8, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      proxy.position.set(t.p[0], t.p[1] - t.tam * 0.42, t.p[2]);
      proxy.userData = { portal: t.zona }; // tocar el título de un mundo = entrar a él
      envoltura.add(proxy);
      envoltura.visible = false;
      this.holo.add(envoltura);
      this.titulosZona.push({ grupo: envoltura, zona: t.zona, letras: [...tit.letras, ...sub.letras] });
      this.proxiesClic.push(proxy);
    }
    // LOS PORTALES — anillos de estela alrededor del planeta
    for (const pt of PORTALES_3D) {
      const grupo = new THREE.Group();
      // v142: en móvil (retrato) los portales viven en su órbita vertical
      const P = (this.calidadBaja && pt.pm) ? pt.pm : pt.p;
      grupo.position.set(P[0], P[1], P[2]);
      const nucleo = new THREE.Mesh(
        new THREE.TorusGeometry(0.34, 0.026, 10, 36),
        new THREE.MeshBasicMaterial({ color: pt.color, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.2, 0.235, 30),
        new THREE.MeshBasicMaterial({ color: pt.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      const etiqueta = this.hacerTexto3D(pt.texto, { tam: 0.13, prof: 0.05, color: pt.color, emis: 0.65 });
      etiqueta.grupo.position.set(-etiqueta.ancho / 2, -0.56, 0);
      for (const l of etiqueta.letras) {
        (l.mesh.material as THREE.MeshStandardMaterial).opacity = 0.95;
        l.mesh.visible = true;
      }
      const proxy = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      proxy.userData = { portal: pt.zona };
      grupo.add(nucleo, halo, etiqueta.grupo, proxy);
      grupo.visible = false;
      this.holo.add(grupo);
      this.portales.push({ grupo, nucleo, proxy, etiqueta: etiqueta.grupo, zona: pt.zona, fase: Math.random() * Math.PI * 2 });
      this.proxiesClic.push(proxy);
    }
  }

  // ════════════════════════════════════════════════════════
  // v141 — LOS MUNDOS — cada zona es un lugar 3D propio
  // ════════════════════════════════════════════════════════
  construirMundos() {
    const lim = (m: THREE.Material & { opacity: number }, v: number) => { m.transparent = true; m.opacity = v; };

    // ZONA 1 — EL ANILLO ORBITAL (v142): la estación que abraza al planeta —
    // el mundo del HOY: un aro metálico inclinado con módulos habitados y
    // balizas que laten. Gira despacio alrededor de la Tierra, para siempre.
    const g1 = new THREE.Group();
    this.aroSpin = new THREE.Group();
    const aroOrb = new THREE.Mesh(
      new THREE.TorusGeometry(1.95, 0.028, 10, this.calidadBaja ? 64 : 96),
      new THREE.MeshBasicMaterial({ color: 0x16233a, transparent: true, opacity: 0.95 }),
    );
    const aroFilo = new THREE.Mesh(
      new THREE.TorusGeometry(1.95, 0.009, 8, this.calidadBaja ? 64 : 96),
      new THREE.MeshBasicMaterial({ color: 0xf5c542, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    this.aroSpin.add(aroOrb, aroFilo);
    // módulos habitados sobre el aro (cajas con filo dorado)
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const mod = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.1, 0.1),
        new THREE.MeshBasicMaterial({ color: 0x0d1524, transparent: true, opacity: 0.95 }),
      );
      mod.position.set(Math.cos(a) * 1.95, Math.sin(a) * 1.95, 0);
      mod.lookAt(mod.position.clone().multiplyScalar(2));
      const filos = new THREE.LineSegments(
        new THREE.EdgesGeometry(mod.geometry),
        new THREE.LineBasicMaterial({ color: 0xf5c542, transparent: true, opacity: 0.8 }),
      );
      filos.position.copy(mod.position);
      filos.lookAt(mod.position.clone().multiplyScalar(2));
      this.aroSpin.add(mod, filos);
      // baliza del módulo (late en el loop)
      const b = new THREE.Mesh(
        new THREE.SphereGeometry(0.026, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      b.position.set(Math.cos(a + 0.28) * 1.95, Math.sin(a + 0.28) * 1.95, 0);
      this.balizasOrb.push(b);
      this.aroSpin.add(b);
    }
    // inclinación de la órbita: el aro abraza al planeta en diagonal
    this.aroSpin.rotation.x = Math.PI / 2 - 0.38;
    this.aroSpin.rotation.y = 0.22;
    g1.add(this.aroSpin);

    // v145 P4 — LA CIUDAD HÉROE: una mini-metrópolis holográfica flotando
    // junto al anillo — la capital visible del HOY. Geometría y materiales
    // COMPARTIDOS (un solo BoxGeometry + un solo EdgesGeometry + 3 luces de
    // ventanas con fase propia): 12 torres, ~27 draw calls, 60 FPS intactos.
    const ciudad = new THREE.Group();
    const nTorres = this.calidadBaja ? 7 : 12;
    const geoTorre = new THREE.BoxGeometry(1, 1, 1);
    const geoFilo = new THREE.EdgesGeometry(geoTorre);
    const matCuerpo = new THREE.MeshBasicMaterial({ color: 0x0a1120, transparent: true, opacity: 0.92 });
    const matFilo = new THREE.LineBasicMaterial({ color: 0xf5c542, transparent: true, opacity: 0.7 });
    this.ciudadWinsMats = [0, 1, 2].map((i) =>
      new THREE.MeshBasicMaterial({ color: i === 1 ? 0x7ab8ff : 0xffd27a, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    // la plataforma-baliza donde crece la ciudad
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.7, 0.05, 22),
      new THREE.MeshBasicMaterial({ color: 0x0d1524, transparent: true, opacity: 0.95 }),
    );
    const aroBase = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.012, 8, 44),
      new THREE.MeshBasicMaterial({ color: 0xf5c542, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    aroBase.rotation.x = Math.PI / 2;
    ciudad.add(base, aroBase);
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < nTorres; i++) {
      const w = 0.1 + rnd() * 0.12;
      const h = 0.24 + rnd() * 0.68;
      const d = 0.1 + rnd() * 0.12;
      const a = (i / nTorres) * Math.PI * 2 + rnd() * 0.5;
      const r = 0.12 + rnd() * 0.38;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const caja = new THREE.Mesh(geoTorre, matCuerpo);
      caja.scale.set(w, h, d);
      caja.position.set(x, h / 2 + 0.03, z);
      const filos = new THREE.LineSegments(geoFilo, matFilo);
      filos.scale.copy(caja.scale);
      filos.position.copy(caja.position);
      ciudad.add(caja, filos);
      // ventanas: chapa emisiva en el frente de la torre (fase compartida)
      if (rnd() > 0.25) {
        const matWin = this.ciudadWinsMats[i % 3];
        const win = new THREE.Mesh(geoTorre, matWin);
        win.scale.set(w * 0.62, h * 0.5, 0.012);
        win.position.set(x, h * 0.48 + 0.03, z + d / 2 + 0.004);
        ciudad.add(win);
      }
    }
    // la capital flota JUNTO al anillo en el fondo (que no tape al planeta:
    // lección de QA — a z=1.02 las torres hacían primer plano gigante)
    ciudad.position.set(-1.78, -1.18, -0.35);
    ciudad.scale.setScalar(0.85);
    ciudad.rotation.y = 0.45;
    g1.add(ciudad);
    g1.visible = false;
    this.escena.add(g1);
    this.mundosZona[1] = g1;

    // ZONA 2 — COMMAND CENTER: globo táctico holográfico + rejilla de mando
    const g2 = new THREE.Group();
    const holoGlobo = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.8, 1),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    holoGlobo.position.set(-1.7, 1.02, -0.95);
    const anilloEq = new THREE.Mesh(
      new THREE.TorusGeometry(1.12, 0.012, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    anilloEq.position.copy(holoGlobo.position);
    anilloEq.rotation.x = Math.PI / 2.15;
    const anilloPol = new THREE.Mesh(
      new THREE.TorusGeometry(0.96, 0.008, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0xff2d78, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    anilloPol.position.copy(holoGlobo.position);
    anilloPol.rotation.z = Math.PI / 2.6;
    const piso2 = new THREE.GridHelper(9, 18, 0x00f0ff, 0x0d5a68);
    piso2.position.set(-1.7, -1.35, -0.75);
    lim(piso2.material as THREE.LineBasicMaterial, 0.34);
    const balizas: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff2d3a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      const a = (i / 3) * Math.PI * 2;
      b.position.set(holoGlobo.position.x + Math.cos(a) * 1.12, holoGlobo.position.y, holoGlobo.position.z + Math.sin(a) * 1.12);
      balizas.push(b);
      this.balizasC2.push(b);
      g2.add(b);
    }
    g2.add(holoGlobo, anilloEq, anilloPol, piso2);
    g2.visible = false;
    this.escena.add(g2);
    this.mundosZona[2] = g2;

    // ZONA 3 — LA ARENA: piso Tron dorado + monolitos de juego con filo de neón
    const g3 = new THREE.Group();
    const piso3 = new THREE.GridHelper(10, 20, 0xffb347, 0x6b4a12);
    piso3.position.set(1.25, -2.28, -0.6);
    lim(piso3.material as THREE.LineBasicMaterial, 0.5);
    const piso3b = new THREE.GridHelper(10, 10, 0xff2d78, 0x5a1230);
    piso3b.position.set(1.25, -2.27, -0.62);
    lim(piso3b.material as THREE.LineBasicMaterial, 0.2);
    g3.add(piso3, piso3b);
    const monolitos: { p: [number, number, number]; t: [number, number, number] }[] = [
      { p: [0.25, -1.68, -1.05], t: [0.52, 1.14, 0.34] },
      { p: [1.4, -1.52, -1.5], t: [0.44, 0.86, 0.3] },
      { p: [2.42, -1.72, -0.85], t: [0.5, 0.98, 0.32] },
    ];
    for (const mo of monolitos) {
      const caja = new THREE.Mesh(
        new THREE.BoxGeometry(mo.t[0], mo.t[1], mo.t[2]),
        new THREE.MeshBasicMaterial({ color: 0x0d0d16, transparent: true, opacity: 0.9 }),
      );
      caja.position.set(mo.p[0], mo.p[1] + mo.t[1] / 2 + 0.06, mo.p[2]);
      const filos = new THREE.LineSegments(
        new THREE.EdgesGeometry(caja.geometry),
        new THREE.LineBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.85 }),
      );
      filos.position.copy(caja.position);
      g3.add(caja, filos);
    }
    const aro3 = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.02, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    aro3.position.set(1.4, -0.62, -1.15);
    aro3.rotation.x = 1.25;
    g3.add(aro3);
    g3.visible = false;
    this.escena.add(g3);
    this.mundosZona[3] = g3;

    // ZONA 4 — EL CUARTEL: plataforma-búnker con astas y banderas azules
    const g4 = new THREE.Group();
    const base4 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.55, 1.78, 0.16, 26),
      new THREE.MeshBasicMaterial({ color: 0x0a1420, transparent: true, opacity: 0.95 }),
    );
    base4.position.set(-2.55, -0.62, -1.1);
    const aro4 = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.016, 8, 56),
      new THREE.MeshBasicMaterial({ color: 0x4da6ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    aro4.position.set(-2.55, -0.54, -1.1);
    aro4.rotation.x = Math.PI / 2;
    g4.add(base4, aro4);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.5;
      const x = -2.55 + Math.cos(a) * 1.25, z = -1.1 + Math.sin(a) * 1.05;
      const asta = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.95, 6),
        new THREE.MeshBasicMaterial({ color: 0x8fc1ff, transparent: true, opacity: 0.8 }),
      );
      asta.position.set(x, -0.16, z);
      const bandera = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.24),
        new THREE.MeshBasicMaterial({ color: 0x4da6ff, transparent: true, opacity: 0.6, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      bandera.position.set(x + 0.21, 0.18, z);
      this.banderas.push(bandera);
      g4.add(asta, bandera);
    }
    const muro4 = new THREE.Mesh(
      new THREE.BoxGeometry(3.3, 1.0, 0.06),
      new THREE.MeshBasicMaterial({ color: 0x1a3550, wireframe: true, transparent: true, opacity: 0.4 }),
    );
    muro4.position.set(-2.55, 0.02, -2.0);
    g4.add(muro4);
    g4.visible = false;
    this.escena.add(g4);
    this.mundosZona[4] = g4;
  }

  // ════════════════════════════════════════════════════════
  // v141 — EL LOGO 3D y EL MODO MUNDO
  // ════════════════════════════════════════════════════════
  // reencuentro (recarga): el logo aparece YA compacto, sin animación
  private compactarLogoInstante() {
    this.logoNacido = true;
    for (const l of this.letrasLogo) {
      if (!l.expandida) continue;
      l.mesh.visible = true;
      (l.mesh.material as THREE.MeshStandardMaterial).opacity = 1;
      l.mesh.scale.setScalar(0.6);
      l.base.copy(l.expandida).multiplyScalar(0.62).add(new THREE.Vector3(0, 0.3, 0));
      l.mesh.position.copy(l.base);
    }
  }

  nacerLogo() {
    if (!this.letrasLogo.length) { this.pendienteLogo = true; return; }
    this.logoNacido = true;
    this.letrasLogo.forEach((l, i) => {
      window.setTimeout(() => {
        if (!this.vivo) return;
        l.mesh.visible = true;
        const m = l.mesh.material as THREE.MeshStandardMaterial;
        m.opacity = 0;
        l.mesh.scale.setScalar(2.6);
        this.animarP(l.mesh.scale, { x: 1, y: 1, z: 1 }, 480, { ease: easeOut });
        this.animarP(m, { opacity: 1 }, 380);
      }, i * 110);
    });
  }

  // tras entrar(): el logo se condensa en un arco compacto que vive en el cielo
  condensarLogo() {
    if (!this.logoNacido) return;
    if (this.logoGrupo) this.animarP(this.logoGrupo.position, { y: 2.02 }, 950, { ease: easeInOut });
    for (const l of this.letrasLogo) {
      if (!l.expandida) continue;
      l.quieto = true;
      this.animarP(l.mesh.scale, { x: 0.6, y: 0.6, z: 0.6 }, 900, { ease: easeInOut });
      this.animarP(l.mesh.position, { x: l.expandida.x * 0.62, y: l.expandida.y + 0.3, z: l.expandida.z * 0.62 }, 950, {
        onDone: () => {
          l.base.set(l.mesh.position.x, l.mesh.position.y, l.mesh.position.z);
          l.quieto = false;
        },
      });
    }
  }

  // MODO MUNDO: el arco completo VANGUARD vuelve a abrirse sobre el planeta
  // v142: y el logo ENTERO sube al cielo (y 2.02 → 2.5) para no pisar el
  // título HOY del mundo que vive justo debajo (2.72 se salía del cuadro)
  expandirLogo() {
    if (!this.logoNacido) return;
    if (this.logoGrupo) this.animarP(this.logoGrupo.position, { y: 2.5 }, 950, { ease: easeInOut });
    for (const l of this.letrasLogo) {
      if (!l.expandida) continue;
      l.quieto = true;
      l.mesh.visible = true;
      this.animarP(l.mesh.scale, { x: 1, y: 1, z: 1 }, 900, { ease: easeInOut });
      this.animarP(l.mesh.position, { x: l.expandida.x, y: l.expandida.y, z: l.expandida.z }, 950, {
        onDone: () => {
          l.base.copy(l.expandida!);
          l.quieto = false;
        },
      });
    }
  }

  // v142: SALIR DEL MODO MUNDO — un solo camino honesto (volando o quieto)
  // `volar` en false cuando el vuelo lo hace otro (volarAZona/irAPose)
  salirModo(volar = true) {
    if (!this.modoMundo) return;
    this.modoMundo = false;
    document.documentElement.removeAttribute("data-wgl-modo");
    window.dispatchEvent(new CustomEvent("vg:wgl-modo", { detail: { on: false } }));
    this.condensarLogo();
    // v144: el puente vuelve con la Casa
    this.setModoMundoUI(false);
    // v145: la sala 3D vuelve con la Casa
    if (this.capsulaAcoplada) this.anclarSala();
    if (volar) this.irAPose(1000);
  }

  // tocar un portal o un título 3D = entrar a ese mundo (vuela + abre su sala)
  // v142: el modo se sale ANTES de volar — si el portal es de la MISMA zona,
  // volarAZona no se mueve (guard zona===zona) y el modo se quedaría pegado
  entrarPortal(zona: number) {
    const antes = this.zona;
    const estabaModo = this.modoMundo;
    this.salirModo(false);
    this.volarAZona(zona);
    if (estabaModo && antes === zona) this.irAPose(1000);
    document.documentElement.setAttribute("data-wgl-zona", String(zona));
    window.dispatchEvent(new CustomEvent("vg:wgl-sala", { detail: { zona } }));
    sonar("whoosh");
  }

  alternarModo() {
    this.modoMundo = !this.modoMundo;
    if (this.modoMundo) document.documentElement.setAttribute("data-wgl-modo", "1");
    else document.documentElement.removeAttribute("data-wgl-modo");
    window.dispatchEvent(new CustomEvent("vg:wgl-modo", { detail: { on: this.modoMundo } }));
    if (this.modoMundo) this.expandirLogo(); else this.condensarLogo();
    // v143: en el MUNDO la cápsula se apaga — solo existe el universo
    if (this.modoMundo) {
      this.desacoplarCapsula();
      // v145: la sala 3D también se apaga — el universo queda desnudo
      if (this.salaInst) this.salaInst.grupo.visible = false;
    }
    // v144: el puente se apaga y la UI 3D del modo despierta
    this.setModoMundoUI(this.modoMundo);
    this.irAPose(1000);
    sonar("whoosh");
  }

  // la Casa (page.tsx) ordena el modo (Esc, abrir sala) — sin bucles
  syncModo(on: boolean) {
    this.modoMundo = on;
    if (on) document.documentElement.setAttribute("data-wgl-modo", "1");
    else document.documentElement.removeAttribute("data-wgl-modo");
    if (on) this.expandirLogo(); else this.condensarLogo();
    // v143: la cápsula obedece al modo (apagada dentro del universo)
    if (on) {
      this.desacoplarCapsula();
      // v145: la sala 3D obedece al modo
      if (this.salaInst) this.salaInst.grupo.visible = false;
    }
    // v144: el puente obedece al modo
    this.setModoMundoUI(on);
    this.irAPose(1000);
  }

  // ════════════════════════════════════════════════════════
  // v144 — EL PUENTE DE MANDO — construcción y vida
  // ════════════════════════════════════════════════════════

  // alto del frustum a una distancia dada (unidades de mundo)
  private altoPlano(z: number): number {
    return 2 * z * Math.tan((this.camara.fov * Math.PI) / 360);
  }

  // v144 P6 — animación con registro AUTO-PODADO: al terminar, el cancelador
  // se saca del Set (antes this.cancelar crecía para siempre → OOM del dev)
  private animarP(
    obj: ObjNum | THREE.Vector3 | THREE.Object3D | THREE.Material | { opacity: number; size?: number; fov?: number },
    to: ObjNum,
    ms: number,
    opts: { ease?: (t: number) => number; onUpdate?: () => void; onDone?: () => void } = {},
  ): () => void {
    const cancel = animar(obj, to, ms, {
      ...opts,
      onDone: () => {
        this.cancelar.delete(cancel);
        opts.onDone?.();
      },
    });
    this.cancelar.add(cancel);
    return cancel;
  }

  construirConsola() {
    this.escena.add(this.consola);
    this.escena.add(this.pieGrupo);
    this.escena.add(this.entradaGrupo);
    this.escena.add(this.modoGrupo);
    this.consola.visible = false;       // despierta al terminar la entrada
    this.pieGrupo.visible = false;
    this.entradaGrupo.visible = false;
    this.modoGrupo.visible = false;
    // EL RAIL DEL ESTADO — la franja viva de la Casa como tira holográfica
    const railHost = document.createElement("div");
    railHost.className = "vg144-railhost";
    const railInner = document.createElement("div");
    railInner.className = "vg144-rail";
    railHost.appendChild(railInner);
    this.railEl = railInner;
    this.recalibrarRail();
    this.railObj = new CSS3DObject(railHost);
    this.railObj.visible = false;
    this.cssEscena.add(this.railObj);
    (window as unknown as { __vgRailHost?: HTMLDivElement }).__vgRailHost = railInner;
    window.dispatchEvent(new CustomEvent("vg:wgl-railhost", { detail: railInner }));
    // el html entero se entera: el chrome plano debe dormirse (data-holo)
    document.documentElement.setAttribute("data-holo", "1");
  }

  private recalibrarRail() {
    const movil = this.esMovil();
    const frac = movil ? 0.94 : 0.62;
    const w = Math.min(window.innerWidth * frac, 1040);
    if (this.railEl) {
      const host = this.railEl.parentElement;
      if (host) host.style.width = `${w}px`;
      this.railEl.style.width = `${w}px`;
    }
    this.railPx = w;
    this.railFrac = frac;
  }

  // ── la Casa publica pestañas/etiquetas (page.tsx) ──
  onPestanasEv = (e: Event) => {
    const d = (e as CustomEvent).detail;
    if (!d || !Array.isArray(d.lista)) return;
    this.setPestanasHolo(d.lista as DatosPestana[], String(d.activa ?? ""));
  };
  onEtiquetasEv = (e: Event) => {
    const d = (e as CustomEvent).detail;
    if (!d) return;
    this.setEtiquetas(d as Partial<EtiquetasHolo>);
  };
  // v145: la orden de proyección del menú/búsqueda (viene de la Casa)
  onVentanaEv = (e: Event) => {
    const d = (e as CustomEvent).detail;
    this.setVentana(!!d?.on);
  };

  setPestanasHolo(lista: DatosPestana[], activa: string) {
    const nuevaLlave = JSON.stringify([lista, activa]);
    if (nuevaLlave === this.llavePuente.split("|§|")[0]) return; // cero churn
    this.llavePuente = `${nuevaLlave}|§|${this.llavePuente.split("|§|")[1] ?? ""}`;
    this.consolaDatos = { pestanas: lista.slice(0, 9), activa };
    this.reconstruirPuente();
  }

  setEtiquetas(e: Partial<EtiquetasHolo>) {
    const nuevaLlave = JSON.stringify(e);
    if (nuevaLlave === (this.llavePuente.split("|§|")[1] ?? "")) return; // cero churn
    this.llavePuente = `${this.llavePuente.split("|§|")[0]}|§|${nuevaLlave}`;
    this.etiquetas = { ...ETIQUETAS_DEFECTO, ...e };
    this.reconstruirPuente();
    this.vestirDecoracion();
  }

  // limpiar un grupo entero (geometrías + materiales) sin piedad
  private limpiarGrupo(g: THREE.Group | null) {
    if (!g) return;
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = (m as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else if (mat) mat.dispose();
    });
    g.clear();
  }

  // RECONSTRUIR EL PUENTE — placas de pestañas + botones de mando.
  // Sin fuente cargada las placas nacen desnudas; vestirPlatos las viste.
  reconstruirPuente() {
    for (const p of this.platosHolo) {
      this.consola.remove(p.grupo);
      this.limpiarGrupo(p.grupo);
    }
    this.platosHolo = [];
    this.proxiesHolo = [];
    if (this.logoMiniSlot) { this.consola.remove(this.logoMiniSlot); this.limpiarGrupo(this.logoMiniSlot); this.logoMiniSlot = null; }
    const movil = this.esMovil();
    const alto = this.altoPlano(Z_CONSOLA);
    const ancho = alto * this.camara.aspect;
    const topY = alto / 2 - 0.26;
    const E = this.etiquetas;
    const hacerPlato = (wP: number, colorAcento: number, activo: boolean, accion: string, key?: string, cierre = false): PlatoHolo => {
      const grupo = new THREE.Group();
      const h = 0.2, d = 0.035;
      const geo = new THREE.BoxGeometry(wP, h, d);
      const acento = new THREE.Color(colorAcento);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x0d1626,
        metalness: 0.62,
        roughness: 0.34,
        emissive: acento.clone().multiplyScalar(activo ? 0.5 : 0.14),
        transparent: true,
        opacity: 0.94,
        depthTest: false,
      });
      const marco = new THREE.Mesh(geo, mat);
      marco.renderOrder = 940;
      const filos = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: colorAcento, transparent: true, opacity: activo ? 0.95 : 0.38, depthTest: false }),
      );
      filos.renderOrder = 941;
      // PROXY invisible para el dedo (opacidad 0 — el Raycaster la ignora si
      // es visible:false, lección v141) — levantado un pelín hacia la cámara
      const proxy = new THREE.Mesh(
        new THREE.BoxGeometry(wP + 0.05, h + 0.06, d + 0.02),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, depthTest: false }),
      );
      proxy.renderOrder = 945;
      proxy.userData = { holo: { accion, key } };
      grupo.add(marco, filos, proxy);
      this.proxiesHolo.push(proxy);
      if (cierre) {
        const s = 0.026;
        const g1 = new THREE.Mesh(
          new THREE.BoxGeometry(s * 2.5, s * 0.7, 0.01),
          new THREE.MeshBasicMaterial({ color: colorAcento, transparent: true, opacity: 0.9, depthTest: false }),
        );
        const g2 = new THREE.Mesh(g1.geometry, g1.material as THREE.Material);
        g1.rotation.z = Math.PI / 4;
        g2.rotation.z = -Math.PI / 4;
        g1.position.set(wP / 2 - 0.088, 0, d / 2 + 0.01);
        g2.position.copy(g1.position);
        g1.renderOrder = 942; g2.renderOrder = 942;
        const proxyC = new THREE.Mesh(
          new THREE.SphereGeometry(0.058, 8, 8),
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, depthTest: false }),
        );
        proxyC.position.set(wP / 2 - 0.088, 0, d / 2 + 0.03);
        proxyC.renderOrder = 946;
        proxyC.userData = { holo: { accion: "cerrar", key } };
        grupo.add(g1, g2, proxyC);
        this.proxiesHolo.push(proxyC);
      }
      this.consola.add(grupo);
      return { grupo, marco, filos, proxy, mat, accion, key, baseY: topY, baseZ: 0, fase: Math.random() * Math.PI * 2, activa: activo, cierre };
    };

    // ── LAYOUT — izquierda: logo mini + pestañas; derecha: mandos ──
    let cursor = -ancho / 2 + 0.22;
    if (!movil) {
      // el MINI LOGO VANGUARD — letras extruidas vivas en el puente
      this.logoMiniSlot = new THREE.Group();
      this.logoMiniSlot.position.set(cursor, topY, 0.01);
      this.consola.add(this.logoMiniSlot);
      cursor += 0.86 + 0.2;
    }
    const mandos = movil
      ? [{ id: "nueva", label: "+", w: 0.28 }, { id: "menu", label: E.menu, w: Math.max(0.36, E.menu.length * 0.048 + 0.14) }]
      : [
          { id: "nueva", label: "+", w: 0.28 },
          { id: "buscar", label: E.buscar, w: Math.max(0.42, E.buscar.length * 0.048 + 0.16) },
          { id: "menu", label: E.menu, w: Math.max(0.38, E.menu.length * 0.048 + 0.16) },
          { id: "cuenta", label: E.cuenta, w: Math.max(0.42, E.cuenta.length * 0.048 + 0.16) },
          { id: "ajustes", label: E.ajustes, w: Math.max(0.44, E.ajustes.length * 0.048 + 0.16) },
        ];
    const wMandos = mandos.reduce((s, c) => s + c.w, 0) + (mandos.length - 1) * 0.09;
    const finTabs = ancho / 2 - wMandos - 0.24;
    const maxPlacas = movil ? 2 : 6;
    let puestas = 0;
    let desborde = 0;
    this.desbordeHolo = 0;
    for (const p of this.consolaDatos.pestanas) {
      const esActiva = p.key === this.consolaDatos.activa;
      const extra = esActiva && this.consolaDatos.pestanas.length > 1 && !movil ? 0.17 : 0;
      const w = Math.min(Math.max((p.label?.length || 4) * 0.052 + 0.2 + extra, 0.42), 1.2);
      if (cursor + w > finTabs || puestas >= maxPlacas) {
        desborde = this.consolaDatos.pestanas.length - puestas;
        break;
      }
      const plato = hacerPlato(w, p.color, esActiva, "tab", p.key, !movil && this.consolaDatos.pestanas.length > 1);
      plato.grupo.position.set(cursor + w / 2, topY, esActiva ? 0.03 : 0);
      plato.baseZ = plato.grupo.position.z;
      this.platosHolo.push(plato);
      cursor += w + 0.09;
      puestas++;
    }
    if (desborde > 0) {
      this.desbordeHolo = desborde;
      const w = 0.36;
      const plato = hacerPlato(w, 0xf5c542, false, "menu");
      plato.grupo.position.set(cursor + w / 2, topY, 0);
      plato.baseZ = 0;
      this.platosHolo.push(plato);
    }
    // mandos desde la derecha
    let rc = ancho / 2 - 0.16;
    for (let i = mandos.length - 1; i >= 0; i--) {
      const c = mandos[i];
      const plato = hacerPlato(c.w, c.id === "nueva" ? 0xf5c542 : 0x8fd8ff, false, c.id);
      plato.grupo.position.set(rc - c.w / 2, topY, 0);
      plato.baseZ = 0;
      this.platosHolo.push(plato);
      rc -= c.w + 0.09;
    }
    if (this.fuente) this.vestirPlatos();
  }

  // VESTIR LAS PLACAS — letras extruidas reales dentro de cada placa
  private vestirPlatos() {
    if (!this.fuente) return;
    for (const p of this.platosHolo) {
      const datos = this.consolaDatos.pestanas.find((x) => x.key === p.key);
      let texto = "";
      let colorTxt = 0xdfe9ff;
      let emisTxt = 0.3;
      if (p.accion === "tab") { texto = datos?.label ?? ""; colorTxt = p.activa ? datos?.color ?? 0xf5c542 : 0xe8f1ff; emisTxt = p.activa ? 0.85 : 0.55; }
      else if (p.accion === "nueva") { texto = "+"; colorTxt = 0xf5c542; emisTxt = 0.9; }
      else if (p.accion === "menu") { texto = this.desbordeHolo > 0 ? `+${this.desbordeHolo}` : this.etiquetas.menu; colorTxt = 0xbfe4ff; emisTxt = 0.75; }
      else { texto = (this.etiquetas as Record<string, string>)[p.accion] ?? p.accion.toUpperCase(); colorTxt = 0xbfe4ff; emisTxt = 0.75; }
      if (!texto) continue;
      // el cierre × roba sitio a la derecha de la placa: centrar la letra un pelín a la izquierda
      const tieneCierre = !!p.cierre;
      const t = this.hacerTexto3D(texto, { tam: 0.072, prof: 0.018, color: colorTxt, emis: emisTxt });
      const m = t.grupo.children.length ? (t.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial : null;
      if (m) { m.depthTest = false; m.opacity = 1; }
      for (const l of t.letras) { l.mesh.visible = true; l.mesh.renderOrder = 948; l.quieto = true; }
      t.grupo.position.set(-t.ancho / 2 - (tieneCierre ? 0.05 : 0), 0, 0.028);
      p.grupo.add(t.grupo);
    }
    // MINI LOGO
    if (this.logoMiniSlot && !this.logoMiniSlot.children.length) {
      const logo = this.hacerTexto3D("VANGUARD", { tam: 0.112, prof: 0.028, color: 0xf5c542, emis: 0.6 });
      const m = logo.grupo.children.length ? (logo.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial : null;
      if (m) { m.depthTest = false; m.opacity = 1; }
      for (const l of logo.letras) { l.mesh.visible = true; l.mesh.renderOrder = 948; l.quieto = true; }
      logo.grupo.position.set(0, 0, 0.012);
      this.logoMiniSlot.add(logo.grupo);
    }
  }

  // DECORACIÓN del puente: pie de la Casa + tagline de entrada + UI del MODO MUNDO
  vestirDecoracion() {
    if (!this.fuente) return;
    const movil = this.esMovil();
    const alto = this.altoPlano(Z_CONSOLA);
    const ancho = alto * this.camara.aspect;
    // PIE — dos líneas de letras 3D en las esquinas bajas (solo escritorio)
    this.limpiarGrupo(this.pieGrupo);
    this.pieIzq = null;
    this.pieDer = null;
    if (!movil) {
      const izq = this.hacerTexto3D(this.etiquetas.pieIzq, { tam: 0.05, prof: 0.012, color: 0x8fa8cf, emis: 0.35 });
      const mI = izq.grupo.children.length ? (izq.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial : null;
      if (mI) { mI.depthTest = false; mI.opacity = 0.9; }
      for (const l of izq.letras) { l.mesh.visible = true; l.mesh.renderOrder = 948; l.quieto = true; }
      izq.grupo.position.set(-ancho / 2 + 0.22, -alto / 2 + 0.15, 0.01);
      this.pieGrupo.add(izq.grupo);
      this.pieIzq = izq.grupo;
      const der = this.hacerTexto3D(this.etiquetas.pieDer, { tam: 0.05, prof: 0.012, color: 0x8fa8cf, emis: 0.35 });
      const mD = der.grupo.children.length ? (der.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial : null;
      if (mD) { mD.depthTest = false; mD.opacity = 0.9; }
      for (const l of der.letras) { l.mesh.visible = true; l.mesh.renderOrder = 948; l.quieto = true; }
      der.grupo.position.set(ancho / 2 - 0.18 - der.ancho, -alto / 2 + 0.15, 0.01);
      this.pieGrupo.add(der.grupo);
      this.pieDer = der.grupo;
    }
    // ENTRADA — tagline letra a letra + placa ENTRAR (la placa es 3D y se toca)
    this.limpiarGrupo(this.entradaGrupo);
    this.letrasTagline = [];
    this.platoEntrar = null;
    const tag = this.hacerTexto3D("El mundo no espera. Tu tampoco.", { tam: 0.082, prof: 0.02, color: 0xffe9b0, emis: 0.7 });
    const mT = tag.grupo.children.length ? (tag.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial : null;
    if (mT) { mT.depthTest = false; }
    for (const l of tag.letras) { l.mesh.visible = false; l.mesh.renderOrder = 948; l.quieto = true; }
    const escalaTag = Math.min(1, (ancho * 0.92) / tag.ancho);
    tag.grupo.scale.setScalar(escalaTag);
    tag.grupo.position.set(-tag.ancho * escalaTag / 2, -alto / 2 + 0.9, 0.01);
    this.entradaGrupo.add(tag.grupo);
    this.letrasTagline = tag.letras;
    const plato = new THREE.Group();
    const geoP = new THREE.BoxGeometry(2.0, 0.21, 0.03);
    const matP = new THREE.MeshStandardMaterial({ color: 0x14202f, metalness: 0.6, roughness: 0.35, emissive: new THREE.Color(0xf5c542).multiplyScalar(0.4), transparent: true, opacity: 0.95, depthTest: false });
    const marco = new THREE.Mesh(geoP, matP);
    marco.renderOrder = 944;
    const filos = new THREE.LineSegments(new THREE.EdgesGeometry(geoP), new THREE.LineBasicMaterial({ color: 0xf5c542, transparent: true, opacity: 0.9, depthTest: false }));
    filos.renderOrder = 945;
    const proxyE = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.27, 0.05), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
    proxyE.renderOrder = 946;
    proxyE.userData = { holo: { accion: "entrar" } };
    plato.add(marco, filos, proxyE);
    const txt = this.hacerTexto3D(this.etiquetas.hintEntrar, { tam: 0.062, prof: 0.016, color: 0xf5c542, emis: 0.8 });
    const mX = txt.grupo.children.length ? (txt.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial : null;
    if (mX) { mX.depthTest = false; mX.opacity = 1; }
    for (const l of txt.letras) { l.mesh.visible = true; l.mesh.renderOrder = 948; l.quieto = true; }
    txt.grupo.position.set(-txt.ancho / 2, 0, 0.024);
    plato.add(txt.grupo);
    plato.position.set(0, -alto / 2 + 0.56, 0.01);
    plato.visible = false;
    this.entradaGrupo.add(plato);
    this.platoEntrar = plato;
    this.proxiesHolo = this.proxiesHolo.filter((px) => { const a = px.userData?.holo?.accion; return a !== "entrar" && a !== "modo"; });
    this.proxiesHolo.push(proxyE);
    // MODO MUNDO — placa SALIR (arriba-izquierda) + hint (abajo) en letras 3D
    this.limpiarGrupo(this.modoGrupo);
    this.modoConstruido = false;
    const platoS = new THREE.Group();
    const geoS = new THREE.BoxGeometry(Math.max(1.05, this.etiquetas.salir.length * 0.058 + 0.24), 0.2, 0.03);
    const matS = new THREE.MeshStandardMaterial({ color: 0x14202f, metalness: 0.6, roughness: 0.35, emissive: new THREE.Color(0xff2d78).multiplyScalar(0.45), transparent: true, opacity: 0.95, depthTest: false });
    const marcoS = new THREE.Mesh(geoS, matS);
    marcoS.renderOrder = 944;
    const filosS = new THREE.LineSegments(new THREE.EdgesGeometry(geoS), new THREE.LineBasicMaterial({ color: 0xff2d78, transparent: true, opacity: 0.9, depthTest: false }));
    filosS.renderOrder = 945;
    const proxyS = new THREE.Mesh(new THREE.BoxGeometry(geoS.parameters.width + 0.06, 0.26, 0.05), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
    proxyS.renderOrder = 946;
    proxyS.userData = { holo: { accion: "modo" } };
    this.proxiesHolo.push(proxyS);
    platoS.add(marcoS, filosS, proxyS);
    const txtS = this.hacerTexto3D(this.etiquetas.salir, { tam: 0.062, prof: 0.016, color: 0xff8ab5, emis: 0.75 });
    const mS = txtS.grupo.children.length ? (txtS.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial : null;
    if (mS) { mS.depthTest = false; mS.opacity = 1; }
    for (const l of txtS.letras) { l.mesh.visible = true; l.mesh.renderOrder = 948; l.quieto = true; }
    txtS.grupo.position.set(-txtS.ancho / 2, 0, 0.024);
    platoS.add(txtS.grupo);
    platoS.position.set(-ancho / 2 + 0.24 + geoS.parameters.width / 2, alto / 2 - 0.28, 0.01);
    this.modoGrupo.add(platoS);
    const hint = this.hacerTexto3D(this.etiquetas.hintMundo, { tam: 0.062, prof: 0.016, color: 0x00f0ff, emis: 0.7 });
    const mH = hint.grupo.children.length ? (hint.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial : null;
    if (mH) { mH.depthTest = false; mH.opacity = 0.95; }
    for (const l of hint.letras) { l.mesh.visible = true; l.mesh.renderOrder = 948; l.quieto = true; }
    const escalaH = Math.min(1, (ancho * 0.9) / hint.ancho);
    hint.grupo.scale.setScalar(escalaH);
    hint.grupo.position.set(-hint.ancho * escalaH / 2, -alto / 2 + 0.6, 0.01);
    this.modoGrupo.add(hint.grupo);
    this.modoConstruido = true;
    this.modoGrupo.visible = this.modoMundo && this.consolaVisibleFin;
  }

  // LA FASE DE ENTRADA manda sobre el puente: pestañas dormidas durante la
  // ceremonia, tagline letra a letra, placa ENTRAR al final, todo despierta al fin
  setFaseEntrada(fase: string) {
    this.faseHolo = fase;
    const fin = fase === "volando" || fase === "fin";
    this.consolaVisibleFin = fin;
    this.consola.visible = fin && !this.modoMundo;
    this.pieGrupo.visible = fin && !this.modoMundo && !this.esMovil();
    if (this.railObj) this.railObj.visible = fin && !this.modoMundo;
    this.modoGrupo.visible = fin && this.modoMundo;
    this.setVisibleWidges(fin && !this.modoMundo); // v145 P2
    if (fase === "tagline") {
      this.entradaGrupo.visible = true;
      if (this.platoEntrar) this.platoEntrar.visible = false;
      this.letrasTagline.forEach((l, i) => {
        window.setTimeout(() => {
          if (!this.vivo) return;
          l.mesh.visible = true;
          const m = l.mesh.material as THREE.MeshStandardMaterial;
          m.opacity = 0;
          this.animarP(m, { opacity: 1 }, 260);
        }, i * 30);
      });
    } else if (fase === "hint") {
      this.entradaGrupo.visible = true;
      if (this.platoEntrar) this.platoEntrar.visible = true;
    } else if (fin) {
      this.entradaGrupo.visible = false;
    }
  }

  // EL MODO MUNDO — el puente se apaga y solo queda la UI 3D del universo
  setModoMundoUI(on: boolean) {
    this.consola.visible = this.consolaVisibleFin && !on;
    this.pieGrupo.visible = this.consolaVisibleFin && !on && !this.esMovil();
    if (this.railObj) this.railObj.visible = this.consolaVisibleFin && !on;
    this.modoGrupo.visible = this.consolaVisibleFin && on && this.modoConstruido;
    this.setVisibleWidges(this.consolaVisibleFin && !on); // v145 P2
  }

  // ── HOVER del puente — la placa respira más fuerte bajo el puntero ──
  apuntar(nx: number, ny: number) {
    let objetivo: THREE.Mesh | null = null;
    if (this.proxiesHolo.length) {
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(nx, ny), this.camara);
      const hit = ray.intersectObjects(this.proxiesHolo, false)[0];
      if (hit && ancestroVisible(hit.object)) objetivo = hit.object as THREE.Mesh;
    }
    if (objetivo === this.holoHover) return;
    // restaurar el anterior
    if (this.holoHover) {
      const g = this.holoHover.parent;
      if (g) { g.scale.setScalar(1); }
      this.holoHover = null;
      document.documentElement.style.cursor = "";
    }
    if (objetivo) {
      this.holoHover = objetivo;
      const g = objetivo.parent;
      if (g) g.scale.setScalar(1.07);
      document.documentElement.style.cursor = "pointer";
      sonar("tic");
    }
  }

  // golpe visual al pulsar una placa
  pulsarPlato(ref: string) {
    const plato = this.platosHolo.find((p) => p.key === ref || p.accion === ref);
    if (!plato) return;
    this.animarP(plato.grupo.scale, { x: 0.92, y: 0.92, z: 0.92 }, 80, {
      ease: easeOut,
      onDone: () => this.animarP(plato.grupo.scale, { x: 1, y: 1, z: 1 }, 180, { ease: easeOut }),
    });
  }

  // por frame: el puente, el pie, la entrada, el modo y el rail pegan a la cámara
  private acoplarConsolaFrame() {
    const f = new THREE.Vector3();
    this.camara.getWorldDirection(f);
    const arriba = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camara.quaternion);
    const colocar = (g: THREE.Group) => {
      g.position.copy(this.camara.position).addScaledVector(f, Z_CONSOLA);
      g.quaternion.copy(this.camara.quaternion);
    };
    colocar(this.consola);
    colocar(this.pieGrupo);
    colocar(this.entradaGrupo);
    colocar(this.modoGrupo);
    // RAIL — tira holográfica bajo el puente (CSS3D, la Casa vive dentro)
    if (this.railObj && this.railEl) {
      const alto = this.altoPlano(Z_CONSOLA);
      const ancho = alto * this.camara.aspect;
      // la MISMA matemática de la consola de vuelo (v143): el elemento css
      // ocupa una fracción fija del cuadro a la distancia del plano de mando
      const escala = (ancho * this.railFrac) / Math.max(this.railPx, 1);
      this.railObj.scale.setScalar(escala);
      const hPx = this.railEl.offsetHeight || 26;
      const y = alto / 2 - 0.26 - 0.2 - 0.09 - (hPx * escala) / 2 - 0.015;
      this.railObj.position.copy(this.camara.position).addScaledVector(f, Z_CONSOLA).addScaledVector(arriba, y);
      this.railObj.quaternion.copy(this.camara.quaternion);
    }
  }

  // ── RAYCAST — portales/títulos → marcadores → globo ──
  golpear(nx: number, ny: number, ignorarUI: boolean): { tipo: "holo" | "portal" | "marcador" | "globo" | "sala" | "nada"; datos?: MarcadorWGL; punto?: THREE.Vector3; zona?: number; accion?: string; key?: string } {
    if (ignorarUI) return { tipo: "nada" };
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(nx, ny), this.camara);
    // v144: EL PUENTE primero — las placas de mando pisan al resto del mundo
    if (this.proxiesHolo.length) {
      const hitH = ray.intersectObjects(this.proxiesHolo, false)[0];
      if (hitH && ancestroVisible(hitH.object) && hitH.object.userData?.holo) {
        return { tipo: "holo", accion: hitH.object.userData.holo.accion as string, key: hitH.object.userData.holo.key as string | undefined };
      }
    }
    // v145: LAS PLACAS DE LA SALA 3D — votar la crisis, abrir un meme…
    if (this.salaInst && this.salaInst.proxies.length) {
      const hitS = ray.intersectObjects(this.salaInst.proxies, false)[0];
      if (hitS && hitS.object.userData?.salaAccion) {
        return { tipo: "sala", key: JSON.stringify(hitS.object.userData.salaAccion) };
      }
    }
    const hitP = ray.intersectObjects(this.proxiesClic, false)[0];
    if (hitP && hitP.object.userData?.portal) {
      return { tipo: "portal", zona: hitP.object.userData.portal as number };
    }
    const proxies = this.marcadores.map((m) => m.proxy);
    const hitM = ray.intersectObjects(proxies, false)[0];
    if (hitM && hitM.object.userData?.marcador) {
      return { tipo: "marcador", datos: hitM.object.userData.marcador as MarcadorWGL, punto: hitM.point.clone() };
    }
    const hitG = ray.intersectObject(this.tierra, false)[0];
    if (hitG) return { tipo: "globo", punto: hitG.point.clone() };
    return { tipo: "nada" };
  }

  // ════════════════════════════════════════════════════════
  // EL VUELO — REGLA 1: SIEMPRE SUAVE · REGLA 2: SE VE EL VIAJE
  // v141: la pose la decide poseDe() (mundo centrado en MODO MUNDO,
  // planeta a la izquierda cuando la Casa está abierta)
  // ════════════════════════════════════════════════════════
  volarAZona(zona: number, dur = 1200) {
    if (this.enVuelo || zona === this.zona) return;
    this.enVuelo = true;
    // v142: CUALQUIER vuelo de zona cierra el modo mundo (navbar, portal,
    // marcador, Casa) — la pose del universo solo se pide a propósito
    this.salirModo(false);
    this.zona = zona;
    // v140: la Casa entera se entera (page.tsx sincroniza tab y navbar)
    window.dispatchEvent(new CustomEvent("vg:wgl-zona", { detail: { zona } }));
    // REGLA 2 del vuelo: el usuario VE el viaje — bandera del warp CSS
    document.documentElement.setAttribute("data-wgl-volando", "1");
    window.setTimeout(() => {
      document.documentElement.removeAttribute("data-wgl-volando");
    }, Math.min(1500, dur) + 150);
    const { pos, tgt } = this.poseDe(zona);

    // WARP: estrellas gordas + fov punch — hipervelocidad suave (400ms)
    const fovBase = 50;
    this.animarP(this.camara, { fov: fovBase + 7 }, 380, {
      ease: easeOut,
      onUpdate: () => this.camara.updateProjectionMatrix(),
      onDone: () => this.animarP(this.camara, { fov: fovBase }, 620, {
        onUpdate: () => this.camara.updateProjectionMatrix(),
      }),
    });
    this.animarP(this.matEstrellas, { size: this.baseEstrellas * 2.1 }, 400, {
      ease: easeOut,
      onDone: () => this.animarP(this.matEstrellas, { size: this.baseEstrellas }, 700),
    });

    this.volarCamara(pos, tgt, dur);
    this.visibleZona(zona);
    this.ambientarZona(zona);
  }

  // ambiente por zona: Arena dorada, Cuartel azul (REGLA del mundo vivo)
  ambientarZona(zona: number) {
    const cDir = zona === 3 ? 0xffd9a0 : zona === 4 ? 0x8fc1ff : 0xbfd8ff;
    const cRim = zona === 3 ? 0xffb347 : zona === 4 ? 0x4da6ff : 0xff2d78;
    const dir = new THREE.Color(cDir), rim = new THREE.Color(cRim);
    const d0 = this.luzDir.color.clone(), r0 = this.luzRim.color.clone();
    const obj = { t: 0 };
    this.animarP(obj, { t: 1 }, 900, {
      onUpdate: () => {
        this.luzDir.color.lerpColors(d0, dir, obj.t);
        this.luzRim.color.lerpColors(r0, rim, obj.t);
      },
    });
    this.particulasOro.visible = zona === 3;
    this.particulasAzul.visible = zona === 4;
    const opOro = { o: (this.particulasOro.material as THREE.PointsMaterial).opacity };
    this.animarP(opOro, { o: zona === 3 ? 0.8 : 0 }, 900, {
      onUpdate: () => { (this.particulasOro.material as THREE.PointsMaterial).opacity = opOro.o; },
    });
    const opAzul = { o: (this.particulasAzul.material as THREE.PointsMaterial).opacity };
    this.animarP(opAzul, { o: zona === 4 ? 0.75 : 0 }, 900, {
      onUpdate: () => { (this.particulasAzul.material as THREE.PointsMaterial).opacity = opAzul.o; },
    });
  }

  // ════════════════════════════════════════════════════════
  // LA SECUENCIA DE ENTRADA — los gestos del mundo (0-7s)
  // ════════════════════════════════════════════════════════
  nacerEstrellas() {
    this.animarP(this.matEstrellas, { opacity: 0.95 }, 1400, { ease: easeOut });
  }
  subirGlobo() {
    const obj = { y: -5.4 };
    this.camara.position.y = -5.4;
    this.camara.lookAt(0, -1.2, 0);
    const atmMat = this.atmosfera.material as THREE.ShaderMaterial;
    this.animarP(obj, { y: 0 }, 1700, {
      ease: easeOut,
      onUpdate: () => {
        this.camara.position.y = obj.y;
        this.camara.lookAt(0, obj.y * 0.24, 0);
      },
    });
    const op = { o: 0 };
    this.animarP(op, { o: 1.35 }, 1300, {
      onUpdate: () => atmMat.uniforms.uOp.value = op.o,
    });
  }
  encenderMarcadores(alFinal: () => void) {
    const orden = [...this.marcadores].sort((a, b) => a.datos.intensidad - b.datos.intensidad);
    orden.forEach((m, i) => {
      const esUltimo = i === orden.length - 1;
      window.setTimeout(() => {
        if (!this.vivo) return;
        const nm = m.nucleo.material as THREE.MeshBasicMaterial;
        const na = m.anillo.material as THREE.MeshBasicMaterial;
        // destello: el núcleo nace gordo y se asienta
        this.animarP(m.nucleo.scale, { x: 3.2, y: 3.2, z: 3.2 }, 0, {});
        m.nucleo.scale.setScalar(3.2);
        nm.opacity = 1;
        na.opacity = 0.9;
        this.animarP(m.nucleo.scale, { x: 1, y: 1, z: 1 }, 620, { ease: easeOut });
        this.animarP(na, { opacity: 0.55 }, 620);
        if (esUltimo) {
          // ONDA EXPANSIVA del más grave
          const onda = new THREE.Mesh(
            new THREE.RingGeometry(0.09, 0.115, 40),
            new THREE.MeshBasicMaterial({ color: 0xff2d3a, transparent: true, opacity: 0.95, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
          );
          onda.position.copy(m.grupo.position);
          onda.lookAt(m.grupo.position.clone().multiplyScalar(3));
          this.mundo.add(onda);
          const om = onda.material as THREE.MeshBasicMaterial;
          const obj = { s: 0.3, o: 0.95 };
          this.animarP(obj, { s: 3.4, o: 0 }, 1000, {
            ease: easeOut,
            onUpdate: () => {
              onda.scale.setScalar(obj.s);
              om.opacity = obj.o;
            },
            onDone: () => { this.mundo.remove(onda); onda.geometry.dispose(); om.dispose(); },
          });
          alFinal?.();
        }
      }, i * 170);
    });
  }
  invitar() {
    this.invitando = true;
    this.respiro = 0.014;
  }
  reencuentro(zonaInicial: number) {
    // entrada ya vivida esta sesión: el mundo espera en la zona de la sala
    // v141: el logo 3D aparece YA compacto (antes no nacía tras recargar)
    if (!this.logoNacido) this.compactarLogoInstante();
    this.zona = zonaInicial;
    window.dispatchEvent(new CustomEvent("vg:wgl-zona", { detail: { zona: zonaInicial } }));
    const { pos, tgt } = this.poseDe(zonaInicial);
    this.camara.position.set(pos[0], pos[1], pos[2]);
    this.mirada.copy(tgt);
    this.camara.lookAt(tgt.x, tgt.y, tgt.z);
    this.matEstrellas.opacity = 0.95;
    (this.atmosfera.material as THREE.ShaderMaterial).uniforms.uOp.value = 1.35;
    for (const m of this.marcadores) {
      (m.nucleo.material as THREE.MeshBasicMaterial).opacity = 1;
      (m.anillo.material as THREE.MeshBasicMaterial).opacity = 0.55;
    }
    this.visibleZona(zonaInicial);
    this.ambientarZona(zonaInicial);
    // v143: el reencuentro acopla la cápsula YA (sin animación) —
    // la Casa vive en su zona desde el primer fotograma
    this.acoplarCapsula(zonaInicial, true);
  }

  // ── RAYCAST — tocar el globo o un conflicto (window-level: los
  // paneles HTML nunca bloquean el mundo) ──
  // v141: el raycast PORTAL/TÍTULO vive en el golpear de arriba
  proyectar(p: THREE.Vector3): { x: number; y: number } {
    const v = p.clone().project(this.camara);
    return {
      x: ((v.x + 1) / 2) * window.innerWidth,
      y: ((1 - v.y) / 2) * window.innerHeight,
    };
  }

  // ── EL CORAZÓN — un solo rAF para todo el mundo ──
  loop = () => {
    if (!this.vivo) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.reloj.getDelta());
    const t = this.reloj.elapsedTime;

    // REGLA 6: el globo JAMÁS deja de girar y respirar
    this.mundo.rotation.y += dt * 0.05;
    const brillo = 1 + Math.sin(t * 0.85) * this.respiro + (this.invitando ? Math.sin(t * 2.6) * 0.006 : 0);
    this.tierra.scale.setScalar(brillo);
    this.atmosfera.scale.setScalar(brillo);

    // marcadores: pulso por fases (el anillo exhala)
    for (const m of this.marcadores) {
      const s = 1 + Math.sin(t * 2 + m.fase) * 0.22;
      m.anillo.scale.setScalar(s);
      const nm = m.nucleo.material as THREE.MeshBasicMaterial;
      if (nm.opacity > 0.5) m.nucleo.position.setZ(0.004 + Math.sin(t * 3 + m.fase) * 0.004);
    }
    if (this.particulasOro.visible) this.particulasOro.rotation.y += dt * 0.06;
    if (this.particulasAzul.visible) this.particulasAzul.rotation.y -= dt * 0.05;
    this.estrellas.rotation.y += dt * 0.0035;

    // v141: CADA LETRA 3D RESPIRA (flota con su propia fase) y los
    // portales giran/pulsan — el universo entero está vivo
    const flota = (arr: Letra3D[], amp = 0.018) => {
      for (const l of arr) {
        if (l.quieto) continue;
        l.mesh.position.y = l.base.y + Math.sin(t * 1.15 + l.fase) * amp;
      }
    };
    flota(this.letrasLogo);
    for (const tz of this.titulosZona) if (tz.grupo.visible) flota(tz.letras, 0.012);
    for (const p of this.portales) {
      if (!p.grupo.visible) continue;
      p.nucleo.rotation.z += dt * 0.55;
      p.grupo.scale.setScalar(1 + Math.sin(t * 2 + p.fase) * 0.07);
    }
    // los mundos por zona también respiran (holo-globo y aros)
    const g2v = this.mundosZona[2];
    if (g2v?.visible) g2v.rotation.y += dt * 0.1;
    const g3v = this.mundosZona[3];
    if (g3v?.visible) g3v.rotation.y -= dt * 0.015;

    // v142 — EL ANILLO ORBITAL gira para siempre; sus balizas laten; las
    // banderas del cuartel ondean; las balizas del globo táctico pulsan
    if (this.mundosZona[1]?.visible) this.aroSpin.rotation.y += dt * 0.07;
    // v145 P4 — las ventanas de la CIUDAD HÉROE parpadean como vida real
    for (let i = 0; i < this.ciudadWinsMats.length; i++) {
      const wm = this.ciudadWinsMats[i];
      if (!wm) continue;
      wm.opacity = 0.3 + Math.max(0, Math.sin(t * (1.6 + i * 0.7) + i * 2.2)) * 0.45;
    }
    for (let i = 0; i < this.balizasOrb.length; i++) {
      const bm = this.balizasOrb[i].material as THREE.MeshBasicMaterial;
      bm.opacity = 0.5 + Math.sin(t * 2.6 + i * 1.7) * 0.45;
    }
    for (let i = 0; i < this.balizasC2.length; i++) {
      const bm = this.balizasC2[i].material as THREE.MeshBasicMaterial;
      bm.opacity = 0.55 + Math.sin(t * 3.1 + i * 2.1) * 0.4;
    }
    for (let i = 0; i < this.banderas.length; i++) {
      this.banderas[i].rotation.y = Math.sin(t * 2.1 + i * 1.3) * 0.42;
    }

    // v145 — VUELO LIBRE: el teclado/drag/pinza mueven la cámara ANTES del
    // render (la consola, el rail y la ventana pegan a la nueva pose)
    this.integrarLibre(dt);

    // PARALLAX de paneles: la cámara cuenta dónde está — CSS vars
    const tgt = ZONA_TGT[this.zona] ?? [0, 0, 0];
    const cx = Math.max(-1, Math.min(1, (this.camara.position.x - tgt[0]) / 3.4));
    const cy = Math.max(-1, Math.min(1, (this.camara.position.y - tgt[1]) / 3.4));
    const st = document.documentElement.style;
    const px = parseFloat(st.getPropertyValue("--wgl-cx") || "0");
    const py = parseFloat(st.getPropertyValue("--wgl-cy") || "0");
    if (Math.abs(px - cx) > 0.003) st.setProperty("--wgl-cx", cx.toFixed(3));
    if (Math.abs(py - cy) > 0.003) st.setProperty("--wgl-cy", cy.toFixed(3));

    // v145 — EL PARPADEO DEL PROYECTOR: la luz de proyección tiembla (el
    // universo respira como holograma real, sin tocar opacidades animadas)
    const fl = 0.88 + Math.sin(t * 11.7) * 0.06 + Math.sin(t * 27.3) * 0.06;
    const letra0 = (g?: THREE.Object3D): THREE.MeshStandardMaterial | null => {
      let cur = g;
      let pasos = 0;
      while (cur && !(cur as THREE.Mesh).isMesh && pasos++ < 3) cur = cur.children[0];
      return cur && (cur as THREE.Mesh).isMesh ? ((cur as THREE.Mesh).material as THREE.MeshStandardMaterial) : null;
    };
    if (this.logoGrupo?.visible) {
      const m = letra0(this.logoGrupo);
      if (m) m.emissiveIntensity = 0.5 * fl;
    }
    for (const tz of this.titulosZona) {
      if (!tz.grupo.visible) continue;
      const m = letra0(tz.grupo);
      if (m) m.emissiveIntensity = 0.6 * fl;
    }
    if (this.hazActivo && this.hazCrono) {
      this.matHaz.opacity = 0.075 * (0.8 + Math.sin(t * 2.9) * 0.14 + Math.sin(t * 9.1) * 0.06);
    }

    // v143: la CONSOLA DE VUELO flota pegada a la cámara y la CASA
    // (cápsula CSS3D) se proyecta con la misma matriz que el mundo —
    // un solo universo: WebGL detrás, DOM real dentro del espacio.
    // v144: EL PUENTE DE MANDO pega a la cámara y sus placas respiran.
    for (const p of this.platosHolo) {
      if (!p.grupo.visible) continue;
      p.grupo.position.y = p.baseY + Math.sin(t * 1.3 + p.fase) * 0.006;
      // v145: cada placa PULSA hacia el piloto — el holograma sale de la pantalla
      p.grupo.position.z = p.baseZ + Math.sin(t * 1.55 + p.fase) * 0.014;
    }
    // v145: la SALA 3D vive — velas que laten, monedas que giran, placas
    if (this.salaInst && this.salaInst.grupo.visible) this.salaInst.tic(t, dt);
    this.acoplarConsolaFrame();
    this.acoplarNavFrame();
    this.acoplarVentanaFrame();
    this.acoplarWidgesFrame();
    this.cssEscena.updateMatrixWorld(true);
    this.renderer.render(this.escena, this.camara);
    this.cssRenderer.render(this.cssEscena, this.camara);
  };

  redimensionar() {
    this.camara.aspect = window.innerWidth / window.innerHeight;
    this.camara.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // v143: la proyección CSS y el cuerpo de la cápsula siguen al viewport;
    // si estaba acoplada, re-acopla AL INSTANTE con la nueva geometría
    this.cssRenderer?.setSize(window.innerWidth, window.innerHeight);
    this.dimensionarCapsula();
    this.recalibrarNav();
    this.recalibrarVentana();
    // v144: el puente se re-mide con el viewport nuevo (sin guard: la
    // geometría SÍ cambia con el aspecto)
    this.llavePuente = "";
    this.recalibrarRail();
    this.reconstruirPuente();
    this.vestirDecoracion();
    if (this.capsulaAcoplada) this.acoplarCapsula(this.zona, true);
  }
  dormir() { this.vivo = false; cancelAnimationFrame(this.raf); }
  despertar() { if (!this.vivo) { this.vivo = true; this.reloj.getDelta(); this.loop(); } }
  destruir() {
    this.dormir();
    for (const c of [...this.cancelar]) c();
    this.cancelar.clear();
    // v145: la sala 3D muere con el mundo
    this.desmontarSala(true);
    // v143: la cápsula muere con el mundo — la Casa vuelve al DOM plano
    try {
      (window as unknown as { __vgCapsulaHost?: HTMLDivElement | null }).__vgCapsulaHost = null;
      (window as unknown as { __vgNavHost?: HTMLDivElement | null }).__vgNavHost = null;
      window.dispatchEvent(new CustomEvent("vg:wgl-capsula", { detail: null }));
      window.dispatchEvent(new CustomEvent("vg:wgl-navhost", { detail: null }));
      document.documentElement.removeAttribute("data-wgl-capsula");
      this.cssRenderer?.domElement?.remove();
    } catch { /* silencio honesto */ }
    // v144: el puente muere con el mundo — el chrome plano resucita
    try {
      window.removeEventListener("vg:holo-pestanas", this.onPestanasEv);
      window.removeEventListener("vg:holo-etiquetas", this.onEtiquetasEv);
      window.removeEventListener("vg:holo-ventana", this.onVentanaEv);
      // v145: los eventos de la sala 3D también se retiran
      window.removeEventListener("vg:sala3d", this.onSala3dEv);
      window.removeEventListener("vg:sala3d-datos", this.onSala3dDatosEv);
      (window as unknown as { __vgRailHost?: HTMLDivElement | null }).__vgRailHost = null;
      window.dispatchEvent(new CustomEvent("vg:wgl-railhost", { detail: null }));
      document.documentElement.removeAttribute("data-holo");
      document.documentElement.style.cursor = "";
      this.limpiarGrupo(this.consola);
      this.limpiarGrupo(this.pieGrupo);
      this.limpiarGrupo(this.entradaGrupo);
      this.limpiarGrupo(this.modoGrupo);
      this.platosHolo = [];
      this.proxiesHolo = [];
    } catch { /* silencio honesto */ }
    // v145: la ventana holo y el haz del proyector también mueren
    try {
      (window as unknown as { __vgVentanaHost?: HTMLDivElement | null }).__vgVentanaHost = null;
      window.dispatchEvent(new CustomEvent("vg:wgl-ventanahost", { detail: null }));
      (window as unknown as { __vgWidIzqHost?: HTMLDivElement | null }).__vgWidIzqHost = null;
      (window as unknown as { __vgWidDerHost?: HTMLDivElement | null }).__vgWidDerHost = null;
      window.dispatchEvent(new CustomEvent("vg:wgl-widhosts", { detail: { izq: null, der: null } }));
      if (this.hazCrono) {
        this.escena.remove(this.hazCrono);
        this.hazCrono.geometry.dispose();
        this.matHaz?.dispose();
        this.hazCrono = null;
      }
    } catch { /* silencio honesto */ }
    this.renderer.dispose();
  }
}

// ────────────────────────────────────────────────────────────
// EL COMPONENTE — canvas fijo del mundo + secuencia de entrada
// + popup de conflicto + sincronía con la Casa (page.tsx)
// ────────────────────────────────────────────────────────────
const LLAVE_ENTRADA = "vg-wgl-entrada-v1";

type Fase = "negro" | "estrellas" | "globo" | "marcadores" | "logo" | "tagline" | "hint" | "volando" | "fin";

export function MundoWebGL({ tabInicial }: { tabInicial?: string }) {
  const lienzoRef = useRef<HTMLCanvasElement>(null);
  const mundoRef = useRef<MundoWGL | null>(null);
  // v144: la placa ENTRAR del puente vive fuera del ciclo de render — el
  // raycast del mundo la llama vía ref (el callback cambia con la fase)
  const entrarRef = useRef<(() => void) | null>(null);
  const [fase, setFase] = useState<Fase>("negro");
  const [soporte, setSoporte] = useState<boolean | null>(null); // null = verificando
  const [escrito, setEscrito] = useState("");
  const [popup, setPopup] = useState<{ x: number; y: number; m: MarcadorWGL } | null>(null);
  const tiempos = useRef<number[]>([]);
  const TAGLINE = "El mundo no espera. Tú tampoco.";

  const despues = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    tiempos.current.push(id);
    return id;
  }, []);

  // ── MONTAJE: soporte WebGL → mundo o fallback (IntroCinematica v72) ──
  // v143: useLayoutEffect — el mundo (y su CÁPSULA de contenido) nace
  // ANTES del primer pintado: la Casa monta su contenido ya dentro del
  // mundo 3D sin parpadeo de la capa plana antigua.
  useLayoutEffect(() => {
    let mundo: MundoWGL | null = null;
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      setSoporte(!!gl);
      if (!gl) return;
    } catch {
      setSoporte(false);
      return;
    }
    if (!lienzoRef.current) return;
    const calidadBaja =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    mundo = new MundoWGL({ lienzo: lienzoRef.current, calidadBaja });
    mundoRef.current = mundo;
    document.documentElement.setAttribute("data-wgl", "on");
    // puerta de QA (y de curiosos): el mundo examinable desde la consola
    (window as unknown as { __vgMundo?: MundoWGL }).__vgMundo = mundo;

    const onResize = () => mundo?.redimensionar();
    const onVis = () => (document.hidden ? mundo?.dormir() : mundo?.despertar());
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    // v144 HOVER del puente: la placa despierta bajo el puntero (con freno)
    let ultimoApunte = 0;
    const onMover = (e: PointerEvent) => {
      const m = mundoRef.current;
      if (!m) return;
      // v145: el hover solo respira con la mano quieta (nada de placas
      // temblando mientras el piloto gira la mirada)
      const ahora = performance.now();
      if (ahora - ultimoApunte >= 70 && !m.arrastrando && m.punteros.size === 0) {
        ultimoApunte = ahora;
        m.apuntar((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      }
      // v145: seguimiento de punteros (pinza táctil + arrastre de mirada)
      const prev = m.punteros.get(e.pointerId);
      if (!prev) return;
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      prev.x = e.clientX; prev.y = e.clientY;
      if (m.punteros.size >= 2) {
        // PINZA: dos dedos — acercar/alejar (dolly) + deslizar lateral/vertical
        const [a, b] = [...m.punteros.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (m.distPinza > 0 && d > 0) m.dolar(-(d - m.distPinza) * 2.4);
        m.distPinza = d;
        m.vel.add(new THREE.Vector3(dx * 0.0035, -dy * 0.0035, 0).applyQuaternion(m.camara.quaternion));
        return;
      }
      if (Math.abs(e.clientX - m.origenToque.x) + Math.abs(e.clientY - m.origenToque.y) > 7) m.toqueArrastrado = true;
      if (m.arrastrando) m.moverMirada(dx, dy);
    };
    window.addEventListener("pointermove", onMover, { passive: true });

    // EL TOQUE — window-level: los paneles HTML jamás roban el mundo.
    // v145: el toque guarda la INTENCIÓN (portal/marcador) y el alzado la
    // ejecuta SOLO si no hubo arrastre — mirar nunca dispara vuelos.
    const onToque = (e: PointerEvent) => {
      if (!mundoRef.current) return;
      const el = e.target as HTMLElement | null;
      // v143/v145: cápsula, consola y VENTANA HOLO son UI de la Casa
      if (el && typeof el.closest === "function" && el.closest("button,a,input,textarea,select,[role=button],[data-wgl-panel],.vg143-capsula,.vg143-navhost,.vg145-ventana,.vg145-widhost")) return;
      const m = mundoRef.current;
      m.punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (m.punteros.size === 2) {
        const [a, b] = [...m.punteros.values()];
        m.distPinza = Math.hypot(a.x - b.x, a.y - b.y);
        m.arrastrando = false;
        m.pendiente = null;
        return;
      }
      m.origenToque = { x: e.clientX, y: e.clientY };
      m.toqueArrastrado = false;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      const g = m.golpear(nx, ny, false);
      // v144: EL PUENTE — una placa de mando tocada obedece al instante
      if (g.tipo === "holo") {
        const acc = g.accion ?? "";
        const key = g.key;
        if (key) m.pulsarPlato(key);
        else if (acc) m.pulsarPlato(acc);
        sonar("click");
        if (acc === "entrar") {
          entrarRef.current?.();
        } else if (acc === "modo") {
          window.dispatchEvent(new CustomEvent("vg:wgl-modo-toggle"));
        } else {
          window.dispatchEvent(new CustomEvent("vg:holo-accion", { detail: { accion: acc, key } }));
        }
        return;
      }
      // v145: SALA 3D — una placa del contenido 3D tocada (votar la crisis,
      // abrir un meme…) manda la acción a la sala DOM de la Casa
      if (g.tipo === "sala") {
        sonar("click");
        try {
          const acc = JSON.parse(g.key ?? "{}");
          window.dispatchEvent(new CustomEvent("vg:sala3d-accion", { detail: acc }));
        } catch { /* llave corrupta: silencio honesto */ }
        return;
      }
      if (g.tipo === "globo" && document.documentElement.getAttribute("data-wgl-entrada") === "1") {
        entrar(); // la ceremonia de entrada: tocar el globo despierta la Casa
        return;
      }
      if (g.tipo === "portal" && typeof g.zona === "number") {
        m.pendiente = { zona: g.zona, x: e.clientX, y: e.clientY };
        return;
      }
      if (g.tipo === "marcador" && g.datos && g.punto) {
        m.pendiente = { datos: g.datos, punto: g.punto, x: e.clientX, y: e.clientY };
        return;
      }
      m.iniciarMirada(); // espacio vacío = girar la mirada (vuelo libre)
    };
    window.addEventListener("pointerdown", onToque, { passive: true });

    // v145 EL ALZADO — la intención se ejecuta si el dedo no arrastró
    const onLevantar = (e: PointerEvent) => {
      const m = mundoRef.current;
      if (!m) return;
      m.punteros.delete(e.pointerId);
      if (m.punteros.size < 2) m.distPinza = 0;
      m.terminarMirada();
      const pend = m.pendiente;
      m.pendiente = null;
      if (!pend || m.toqueArrastrado) return;
      if (typeof pend.zona === "number") {
        // v141: PORTAL o TÍTULO 3D tocado — la cámara vuela a ese mundo
        m.entrarPortal(pend.zona);
      } else if (pend.datos && pend.punto) {
        // CONFLICTO TOCADO: destello + popup mínimo + vuelo al Command Center
        const { datos: mrk, punto } = pend;
        try { sessionStorage.setItem("vg-wgl-conflicto", mrk.id); } catch {}
        window.dispatchEvent(new CustomEvent("vg:wgl-conflicto", { detail: mrk }));
        const pr = m.proyectar(punto);
        setPopup({ x: pr.x, y: pr.y, m: mrk });
        window.setTimeout(() => setPopup(null), 3600);
        if (m.zona !== 0) {
          // v142: desde el MODO MUNDO sobre la zona 2 el vuelo no se mueve
          if (m.modoMundo && m.zona === 2) m.salirModo();
          m.volarAZona(2);
          document.documentElement.setAttribute("data-wgl-zona", "2");
        } else {
          m.zona = 1;
          m.volarAZona(2);
          document.documentElement.setAttribute("data-wgl-zona", "2");
        }
        sonar("ping");
      }
    };
    window.addEventListener("pointerup", onLevantar, { passive: true });

    // v145: el gesto cancelado no ejecuta NADA (dedo que sale del cuadro)
    const onCancelar = (e: PointerEvent) => {
      const m = mundoRef.current;
      if (!m) return;
      m.punteros.delete(e.pointerId);
      m.distPinza = 0;
      m.terminarMirada();
      m.pendiente = null;
    };
    window.addEventListener("pointercancel", onCancelar, { passive: true });

    // v145 EL TECLADO DEL PILOTO — WASD/flechas (vuelo), Q/E (altura), Shift turbo
    const teclaValida = (k: string) => ["w", "a", "s", "d", "q", "e", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(k);
    const onTecla = (e: KeyboardEvent, down: boolean) => {
      const m = mundoRef.current;
      if (!m) return;
      const objetivo = e.target as HTMLElement | null;
      if (objetivo && (objetivo.tagName === "INPUT" || objetivo.tagName === "TEXTAREA" || objetivo.tagName === "SELECT" || objetivo.isContentEditable)) return;
      const k = e.key.toLowerCase();
      if (!teclaValida(k)) return;
      if (down) m.teclas.add(k); else m.teclas.delete(k);
    };
    const onTeclaDown = (e: KeyboardEvent) => onTecla(e, true);
    const onTeclaUp = (e: KeyboardEvent) => onTecla(e, false);
    window.addEventListener("keydown", onTeclaDown);
    window.addEventListener("keyup", onTeclaUp);

    // v145 LA RUEDA — acercar/alejar el vuelo (el scroll de la Casa es SUYO)
    const onRueda = (e: WheelEvent) => {
      const m = mundoRef.current;
      if (!m) return;
      const el = e.target as HTMLElement | null;
      if (el && typeof el.closest === "function" && el.closest(".vg143-capsula,.vg145-ventana,.vg143-navhost,.vg145-widhost")) return;
      m.dolar(e.deltaY);
    };
    window.addEventListener("wheel", onRueda, { passive: true });

    // vuelos pedidos por la Casa (navbar / cambios de tab)
    const onIr = (e: Event) => {
      const z = (e as CustomEvent).detail?.zona;
      if (typeof z !== "number" || !mundoRef.current) return;
      if (document.documentElement.getAttribute("data-wgl-entrada") === "1") return;
      mundoRef.current.volarAZona(z);
      document.documentElement.setAttribute("data-wgl-zona", String(z));
      sonar("whoosh");
    };
    window.addEventListener("vg:wgl-ir-a", onIr);

    // v141 MODO MUNDO: el botón MUNDO del navbar y la Casa (Esc / abrir sala)
    const onModoToggle = () => mundoRef.current?.alternarModo();
    const onModoSync = (e: Event) => mundoRef.current?.syncModo(!!(e as CustomEvent).detail?.on);
    window.addEventListener("vg:wgl-modo-toggle", onModoToggle);
    window.addEventListener("vg:wgl-modo-sync", onModoSync);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerdown", onToque);
      window.removeEventListener("pointermove", onMover);
      window.removeEventListener("pointerup", onLevantar);
      window.removeEventListener("pointercancel", onCancelar);
      window.removeEventListener("keydown", onTeclaDown);
      window.removeEventListener("keyup", onTeclaUp);
      window.removeEventListener("wheel", onRueda);
      window.removeEventListener("vg:wgl-ir-a", onIr);
      window.removeEventListener("vg:wgl-modo-toggle", onModoToggle);
      window.removeEventListener("vg:wgl-modo-sync", onModoSync);
      for (const id of tiempos.current) clearTimeout(id);
      mundo?.destruir();
      document.documentElement.removeAttribute("data-wgl");
      document.documentElement.removeAttribute("data-wgl-modo");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── LA SECUENCIA DE ENTRADA (segundo a segundo, mandato exacto) ──
  useEffect(() => {
    if (soporte !== true) return;
    let yaViva = false;
    try { yaViva = sessionStorage.getItem(LLAVE_ENTRADA) === "1"; } catch {}
    if (yaViva) {
      // REENCUENTRO: el mundo espera en la zona de la sala restaurada
      const z = (tabInicial && TAB_ZONA[tabInicial]) || 1;
      document.documentElement.setAttribute("data-wgl-entrada", "0");
      document.documentElement.setAttribute("data-wgl-zona", String(z));
      setFase("fin");
      mundoRef.current?.reencuentro(z);
      mundoRef.current?.setFaseEntrada("fin");
      return;
    }
    document.documentElement.setAttribute("data-wgl-entrada", "1");
    const T = (s: number) => s * 1000;
    despues(T(1.0), () => { setFase("estrellas"); mundoRef.current?.setFaseEntrada("estrellas"); mundoRef.current?.nacerEstrellas(); });
    despues(T(2.0), () => { setFase("globo"); mundoRef.current?.setFaseEntrada("globo"); mundoRef.current?.subirGlobo(); });
    despues(T(3.2), () => {
      setFase("marcadores");
      mundoRef.current?.setFaseEntrada("marcadores");
      mundoRef.current?.encenderMarcadores(() => sonar("onda"));
    });
    despues(T(4.4), () => { setFase("logo"); mundoRef.current?.setFaseEntrada("logo"); mundoRef.current?.nacerLogo(); });
    despues(T(5.4), () => { setFase("tagline"); mundoRef.current?.setFaseEntrada("tagline"); });
    despues(T(6.4), () => { setFase("hint"); mundoRef.current?.setFaseEntrada("hint"); mundoRef.current?.invitar(); });
    return () => { for (const id of tiempos.current) clearTimeout(id); tiempos.current = []; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soporte]);

  // typewriter del tagline (40ms/glifo)
  useEffect(() => {
    if (fase !== "tagline" && fase !== "hint") return;
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setEscrito(TAGLINE.slice(0, i));
      if (i >= TAGLINE.length) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [fase]);

  const entrar = useCallback(() => {
    if (fase === "volando" || fase === "fin") return;
    setFase("volando");
    mundoRef.current?.setFaseEntrada("volando");
    sonar("whoosh");
    const m = mundoRef.current;
    if (m) {
      m.invitando = false;
      m.respiro = 0.006;
      // v141: el logo 3D se condensa y vive para siempre en el cielo del mundo
      m.condensarLogo();
      // OJO: NO asignar m.zona aquí — volarAZona lo hace y su guard
      // (zona === this.zona) cancelaría el vuelo (bug cazado en QA)
      m.volarAZona(1);
    }
    document.documentElement.setAttribute("data-wgl-zona", "1");
    despues(500, () => {
      try { sessionStorage.setItem(LLAVE_ENTRADA, "1"); } catch {}
      document.documentElement.setAttribute("data-wgl-entrada", "0");
      window.dispatchEvent(new CustomEvent("vg:wgl-entrada-fin"));
    });
    despues(1250, () => {
      setFase("fin");
      mundoRef.current?.setFaseEntrada("fin");
    });
  }, [fase, despues]);

  entrarRef.current = entrar;

  // ── SIN WEBGL: la Casa vuelve a su intro cinematográfica v72 ──
  if (soporte === false) return <IntroFallback />;
  if (soporte === null) return <canvas ref={lienzoRef} className="vg140-lienzo" aria-hidden />;

  return (
    <>
      <canvas ref={lienzoRef} className="vg140-lienzo" aria-hidden />
      {/* EL TINTE DE ZONA — atmósfera por sala (Arena dorada, Cuartel azul) */}
      <div className="vg140-tinte" aria-hidden />
      {/* EL WARP — hipervelocidad suave durante el vuelo (REGLA 2) */}
      <div className="vg140-warp" aria-hidden />
      {/* LA ENTRADA — negro → estrellas → globo → conflictos → logo → tagline → hint */}
      {fase !== "fin" && (
        <div className="vg140-entrada" data-fase={fase} aria-hidden>
          <div className="vg140-negro" />
          <div className="vg140-estrellas-dom" aria-hidden>
            <i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
          </div>
          <div className="vg140-marca" data-visible={fase === "logo" || fase === "tagline" || fase === "hint" ? "1" : "0"}>
            {/* v141: el LOGO ya no es DOM — son 8 LETRAS 3D EXTRUIDAS de oro
                viviendo en el lienzo WebGL (nacen con glitch letra a letra);
                el DOM solo firma el tagline y el hint debajo del planeta */}
            <span className="sr-only">VANGUARD</span>
            <p className="vg140-tagline">
              {escrito}
              <span className="vg140-cursor" aria-hidden />
            </p>
            <button
              type="button"
              className="vg140-hint"
              onClick={entrar}
              data-visible={fase === "hint" ? "1" : "0"}
            >
              Toca el globo para entrar
            </button>
          </div>
        </div>
      )}
      {/* POPUP MÍNIMO del conflicto tocado — nombre + intensidad, junto al punto */}
      {popup && (
        <div className="vg140-popup" style={{ left: popup.x, top: popup.y }} data-wgl-panel>
          <strong>{popup.m.nombre}</strong>
          <span>{popup.m.sub}</span>
          <em>{popup.m.intensidad >= 80 ? "GRAVE" : popup.m.intensidad >= 55 ? "ALTA" : "MEDIA"} · la cámara vuela al Command Center</em>
        </div>
      )}
    </>
  );
}

// fallback honesto: sin WebGL la Casa no se rompe (REGLA 5 del mundo)
function IntroFallback() {
  const [Comp, setComp] = useState<React.ComponentType | null>(null);
  useEffect(() => {
    let vivo = true;
    import("@/components/vanguard/intro-cinematica").then((m) => {
      if (vivo) setComp(() => m.IntroCinematica);
    });
    return () => { vivo = false; };
  }, []);
  return Comp ? <Comp /> : null;
}

// ────────────────────────────────────────────────────────────
// SONIDO MÍNIMO — Web Audio: ping de conflicto, whoosh de vuelo,
// onda del teatro grave. Todo try/catch: sin audio la Casa sigue.
// ────────────────────────────────────────────────────────────
let ctxAudio: AudioContext | null = null;
function sonar(tipo: "ping" | "whoosh" | "onda" | "freno" | "tic" | "click" | "clank") {
  try {
    ctxAudio = ctxAudio || new (window.AudioContext || (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (!ctxAudio || ctxAudio.state === "suspended") return;
    const t = ctxAudio.currentTime;
    const g = ctxAudio.createGain();
    g.connect(ctxAudio.destination);
    if (tipo === "tic") {
      // v144: el SUSURRO del puente — la placa avisa que está viva bajo el dedo
      const o = ctxAudio.createOscillator();
      o.type = "square";
      o.frequency.setValueAtTime(1720, t);
      g.gain.setValueAtTime(0.012, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      o.connect(g); o.start(t); o.stop(t + 0.06);
    } else if (tipo === "click") {
      // v144: el MANDO se obedece — dos notas de consola militar
      const o = ctxAudio.createOscillator();
      const o2 = ctxAudio.createOscillator();
      o.type = "square"; o2.type = "square";
      o.frequency.setValueAtTime(720, t);
      o2.frequency.setValueAtTime(1080, t + 0.055);
      g.gain.setValueAtTime(0.028, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g); o2.connect(g);
      o.start(t); o.stop(t + 0.06); o2.start(t + 0.055); o2.stop(t + 0.13);
    } else if (tipo === "clank") {
      // v144 P1: el ACOPLE de la pantalla holográfica — metal que se asienta
      const o = ctxAudio.createOscillator();
      const o2 = ctxAudio.createOscillator();
      o.type = "triangle"; o2.type = "square";
      o.frequency.setValueAtTime(196, t);
      o.frequency.exponentialRampToValueAtTime(131, t + 0.09);
      o2.frequency.setValueAtTime(1244, t);
      o2.frequency.exponentialRampToValueAtTime(622, t + 0.05);
      g.gain.setValueAtTime(0.03, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g); o2.connect(g);
      o.start(t); o.stop(t + 0.24); o2.start(t); o2.stop(t + 0.06);
    } else if (tipo === "freno") {
      // v142: el aterrizaje — nota grave + quinta que se asientan (el anillo
      // de la nave frena); cortita y grave para no cansar en vuelos seguidos
      const o = ctxAudio.createOscillator();
      const o2 = ctxAudio.createOscillator();
      o.type = "sine"; o2.type = "triangle";
      o.frequency.setValueAtTime(196, t);
      o.frequency.exponentialRampToValueAtTime(98, t + 0.28);
      o2.frequency.setValueAtTime(294, t);
      o2.frequency.exponentialRampToValueAtTime(147, t + 0.28);
      g.gain.setValueAtTime(0.035, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
      o.connect(g); o2.connect(g);
      o.start(t); o2.start(t);
      o.stop(t + 0.36); o2.stop(t + 0.36);
    } else if (tipo === "whoosh") {
      const o = ctxAudio.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(420, t + 0.5);
      o.frequency.exponentialRampToValueAtTime(90, t + 1.1);
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);
      o.connect(g); o.start(t); o.stop(t + 1.2);
    } else {
      const o = ctxAudio.createOscillator();
      o.type = tipo === "onda" ? "triangle" : "sine";
      o.frequency.setValueAtTime(tipo === "onda" ? 70 : 660, t);
      if (tipo === "ping") o.frequency.exponentialRampToValueAtTime(990, t + 0.14);
      g.gain.setValueAtTime(tipo === "onda" ? 0.09 : 0.06, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (tipo === "onda" ? 0.8 : 0.3));
      o.connect(g); o.start(t); o.stop(t + 0.9);
    }
  } catch { /* silencio honesto */ }
}

// ────────────────────────────────────────────────────────────
// EL NAVBAR DE ZONAS — los ÚNICOS 4 íconos siempre visibles.
// Sin menús, sin hamburguesas: la navegación es vuelo de cámara.
// ────────────────────────────────────────────────────────────
const ICONOS: Record<number, React.ReactNode> = {
  1: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  ),
  2: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M7 20h10M12 16v4M7 9l3 3 4-5 3 3" />
    </svg>
  ),
  3: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M6 9.5 4 12l2 2.5M18 9.5 20 12l-2 2.5" />
      <rect x="8" y="7" width="8" height="10" rx="1.5" />
      <path d="M10.5 11h3M10.5 14h3" />
    </svg>
  ),
  4: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c1.2-3.8 4-5.6 7.5-5.6S18.3 16.2 19.5 20" />
    </svg>
  ),
};
const NOMBRES_ZONA: Record<number, string> = { 1: "HOY", 2: "ANÁLISIS", 3: "ARENA", 4: "CUARTEL" };

// v141: el ícono del MODO MUNDO — el planeta dentro de una órbita con flechas
const ICONO_MUNDO = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <circle cx="12" cy="12" r="5.2" />
    <path d="M3.2 8.6c-1.5 2.9 3.4 7 10 9.3s12 1.7 12.6-1.2" opacity="0.85" />
    <path d="M4.2 6.4 3 9l2.7.4" />
    <path d="M19.8 17.6 21 15l-2.7-.4" />
  </svg>
);

export function NavZonas({ zona, modo, flotante, onIr, onMundo }: { zona: number; modo: boolean; flotante?: boolean; onIr: (z: number) => void; onMundo: () => void }) {
  return (
    <nav className={flotante ? "vg143-nav3d" : "vg140-nav"} aria-label="Zonas del mundo VANGUARD">
      {[1, 2, 3, 4].map((z) => (
        <button
          key={z}
          type="button"
          className="vg140-nav-btn"
          data-activa={!modo && zona === z ? "1" : "0"}
          onClick={() => onIr(z)}
          aria-label={`Volar a la zona ${NOMBRES_ZONA[z]}`}
        >
          {ICONOS[z]}
          <span>{NOMBRES_ZONA[z]}</span>
        </button>
      ))}
      {/* v141: MODO MUNDO — la Casa se aparta y solo queda el universo 3D:
          tocar un portal o un título de letras = entrar a ese mundo */}
      <button
        type="button"
        className="vg140-nav-btn vg141-nav-mundo"
        data-activa={modo ? "1" : "0"}
        onClick={onMundo}
        aria-pressed={modo}
        aria-label="Modo mundo: volar libre por el universo Vanguard en 3D"
      >
        {ICONO_MUNDO}
        <span>MUNDO</span>
      </button>
    </nav>
  );
}
