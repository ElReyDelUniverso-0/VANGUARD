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
import { APP_VERSION } from "@/lib/version";
import { translate, useLangStore } from "@/lib/i18n";
// v145 SALAS EN VOLUMEN: el CONTENIDO real de cada sala como escena 3D
import { construirSala3D, type PayloadSala3D, type Sala3DInstancia, type CtxSala3D } from "./salas-3d";
// v172 EL PULSO DE LA PARIDAD: el raycast del mundo se cuenta (3D)
import { contarAccion } from "@/lib/telemetria-paridad";
import { construirHud3D, type Hud3D } from "./hud-3d";
// v148 MUNDOS PROPIOS: cada sección recibe SU PROPIO universo — telón que
// aísla del planeta compartido, plataforma, paisaje vivo y frases 3D
import { construirMundo3D, type Mundo3DInstancia } from "./mundos-3d";

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
const VEL_LIBRE = 3.2;      // unidades/segundo (Shift = ×2.6) — v147: más ágil
// v157 — LA CORREA NUEVA: la Casa NO persigue al piloto. Mirar para atrás
// es libre y volar también: una baliza holo late sobre la Casa para guiar
// la vuelta; el rescate solo llega en el borde del universo y conservando
// la orientación de la Casa (NUNCA replantándose frente a la mirada — eso
// era «las cosas te siguen» del Dueño)
const CORREA_DIST = 7.2;
const CORREA_RESCATE = 11.5; // el borde honesto del rescate (móvil 9.5)
const Z_VENTANA = 3.35;     // distancia de la VENTANA HOLO a la cámara

// v158 — LA CIUDAD REAL: el menú de Vanguard deja de flotar pegado a la
// cámara (eso era «elementos mezclados») y pasa a ser una METRÓPOLIS
// ANCLADA en el espacio, muy por encima del corredor de vuelo — solo se
// llega a ella VOLANDO, y sus edificios NUNCA siguen al piloto.
const CIUDAD_CENTRO = new THREE.Vector3(0, 10.6, 0);

// v149 — CERO BASURA POR FRAME: los vuelos y acoples del loop reutilizan
// estos vectores (nada de `new THREE.Vector3` dentro del rAF: cada uno era
// un candidato a pausa de GC — los «tirones» que el Dueño siente como lag)
const _vA = new THREE.Vector3();
const _vB = new THREE.Vector3();
const _vC = new THREE.Vector3();
const _vD = new THREE.Vector3();
const _vE = new THREE.Vector3();
const _colA = new THREE.Color(); // v154: scratch de color (cero new por frame)

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

// v154 LA CIUDAD-MENÚ — el catálogo de secciones que la Casa envía al mundo:
// cada sección es un EDIFICIO con figura 3D propia y color de identidad
 type TabCiudad = { key: string; label: string };
type SeccionCiudad = { key: string; label: string; color: string; tabs: TabCiudad[] };

// v159 — LA LÍNEA DE SENTIDO: qué hay DENTRO de cada edificio, en una frase
// (el contenido ya no es un misterio: se lee desde la avenida)
const DESCRIPCIONES_CIUDAD: Record<string, string> = {
  inicio: "TU BASE · MISIONES DEL DÍA",
  inteligencia: "OSINT · EL MUNDO EN VIVO",
  hangar: "SIMULADORES Y ARCADE 3D",
  juego: "JUEGA · DUELOS Y RETOS",
  mercado: "TIENDA · CAJAS Y FICHAS",
  archivo: "EXPEDIENTES SECRETOS REALES",
  comando: "MANDO DIARIO · CRISIS ACTIVA",
  observatorio: "PREDICCIONES DEL FRENTE",
  estrategia: "MAPAS Y GUERRA HOY",
  emisora: "EMISORA · AUDIO EN VIVO",
  oscsuro: "LA VERDAD CRUDA DEL FRENTE",
  creadores: "MEMES Y CREACIONES",
  social: "FOROS DE LA COMUNIDAD",
  sistema: "AJUSTES · PERFIL · RANGO",
  experimental: "LABORATORIO DE LO NUEVO",
  arquitecto: "CONSTRUCCIÓN AUTOMÁTICA",
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
  // v148 — EL VIGÍA: si el bucle rAF se congela con la pestaña VISIBLE
  // (contexto vivo pero corazón parado — el «Vanguard congelado» del
  // Dueño), el vigilancia lo relanza solo. La pestaña oculta no cuenta:
  // dormir() ya pausa el mundo por diseño.
  ultimoFrame = 0;
  vigia: number | null = null;
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
  // v147 — EL JOYSTICK MÓVIL: el pulgar manda un vector analógico (-1..1)
  joy = { x: 0, y: 0 };
  joyId = -1;                         // pointerId capturado por la palanca
  joyEl: HTMLDivElement | null = null;
  joyKnob: HTMLDivElement | null = null;
  joyObj: CSS3DObject | null = null;
  joyFrac = 0.4;
  arrastrando = false;                // drag de mirada activo
  ultimoArrastre = 0;                 // freno de eventos (70ms)
  dirArrastre = new THREE.Vector3();  // dirección base del drag de mirada
  punteros = new Map<number, { x: number; y: number }>(); // para el pinza táctil
  correaActiva = false;              // v147: la correa ya aviso (un clank por estirada)
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
  // v156 MODO 3D PURO: la consola DOM de la insignia se guarda y la sala
  // volumétrica ES el módulo entero (el Dueño: «lo 3D debe ser lo principal»)
  holoOculto = false;
  // v167 BUG R19: el aterrizaje automático de la ciudad reintenta abrir la
  // ciudad hasta ~11s tras el boot — si el piloto ENTRA a un módulo dentro
  // de esa ventana, un reintento tardío la RE-ABRÍA encima del módulo y la
  // sala quedaba sin anclar (QA: dispatch tab a los 4.5s → ciudad viva para
  // siempre). Esta bandera muere al primer cierre explícito de ciudad.
  ciudadCerradaAlgunaVez = false;
  // v167 BUG R19 (2ª pata): una sala montada a mitad de un vuelo (el guard
  // de v159 la deja dormida) necesita UN ancla cuando el vuelo suelte la
  // cámara — sin esto, entrar a un módulo durante la ceremonia lo deja
  // invisible para siempre
  salaAnclaPendiente = false;
  private anclaUltima: { pos: THREE.Vector3; escala: number } | null = null;
  salaLlave = "";
  // v167 BUG R19 (cura definitiva del aterrizaje): el mundo recuerda la
  // PRIMERA sala que vio (la del arranque) — si la sala activa ya no es esa,
  // el piloto eligió otro módulo y el aterrizaje de la ciudad retira su
  // mano. Inmune al timing de hidratación de la Casa (la compara el mundo,
  // no la Casa).
  salaLlaveArranque = "";
  // v148 — EL CASCO DEL PILOTO: el HUD 3D real (adiós a los últimos DOM fijos)
  hud3D: Hud3D | null = null;
  rollActual = 0; // v148: el alabeo del caza (banking) del vuelo libre
  // v149 — EL GOBERNADOR DE FPS: si el aparato sufre, el mundo baja la
  // factura él solo (DPR por pasos, partículas y parpadeos congelados) y
  // la sube cuando respira. Nadie toca un ajuste: el mundo se autopila.
  dprBase = 1.5;            // techo DPR por aparato (móvil 1.3 / mesa 1.75)
  dprActual = 1.5;
  nivelCal = 0;             // 0=pleno … 3=economía de guerra
  fpsN = 0; fpsT0 = 0; calUltimo = 0;
  ecoOn = false;            // nivel>=2: los adornos respiran menos
  // v148 — MUNDOS PROPIOS: el universo PRIVADO de la sección activa
  mundoInst: Mundo3DInstancia | null = null;
  mundoLlave = "";
  // v154 — LA CIUDAD-MENÚ: el menú de Vanguard es una CIUDAD de secciones
  ciudadGrupo: THREE.Group | null = null;
  ciudadAbierta = false;
  ciudadCatalogo: SeccionCiudad[] = [];
  // v159 EL ATERRIZAJE: si la ciudad pide abrirse antes de que el catálogo
  // llegue (boot), se QUEDA PENDIENTE y nace sola cuando el catálogo aterrice
  ciudadPendiente = false;
  // v159 «TODO DESORDENADO»: en móvil, cuando una sala es el HÉROE, el mundo
  // de zona y sus títulos DUERMEN — una sola capa 3D manda (sala + planeta);
  // cero mezcla de gigantes detrás del módulo, menos draw calls, cero lag
  salaHeroMovil = false;
  // v159: la sala (y su mundo) despiertan AL ATERRIZAR del vuelo de ciudad,
  // nunca a mitad de descenso (nacían varadas en el cielo, fuera de la mira)
  ciudadRevivir = false;
  ciudadSucia = false;
  proxiesCiudad: THREE.Mesh[] = [];
  ciudadEdificios: { grupo: THREE.Group; x0: number; y0: number; z0: number; fase: number; fig: THREE.Object3D | null; plateMat: THREE.MeshStandardMaterial | null; nacido: boolean }[] = [];
  // v163 — LA CIUDAD TALLADA: cada torre se esculpe en 3 cuerpos con
  // retranqueos + portal + antena con baliza, y el vacío negro alrededor
  // se puebla con DECORACIONES TEMÁTICAS del módulo que orbitan despacio
  ciudadDecor: { g: THREE.Group; fase: number }[] = [];
  ciudadBlinkers: THREE.MeshBasicMaterial[] = [];
  ciudadPlateMats: THREE.MeshStandardMaterial[] = [];
  ciudadTituloMat: THREE.MeshStandardMaterial | null = null;
  ciudadSalaVisible = false;
  ciudadMundoVisible = false;
  // v158 — LA CIUDAD REAL: pose guardada para el regreso, vehículos que
  // patrullan la avenida, lámparas que laten, cielo propio y emblema vivo
  ciudadPose: { pos: THREE.Vector3; mir: THREE.Vector3 } | null = null;
  ciudadVehiculos: { g: THREE.Group; fase: number; vel: number; x: number; y: number }[] = [];
  ciudadLampMats: THREE.MeshBasicMaterial[] = [];
  ciudadVentanaMats: THREE.MeshBasicMaterial[] = [];
  ciudadCielo: THREE.Mesh | null = null;
  ciudadCieloMat: THREE.ShaderMaterial | null = null;
  ciudadEmblema: THREE.Object3D | null = null;
  ciudadBeaconMat: THREE.MeshBasicMaterial | null = null;
  ciudadAroA: THREE.Object3D | null = null;
  ciudadAroB: THREE.Object3D | null = null;
  ciudadUIOn = false;
  // v159 — EL VACÍO LIMPIO + LA PREGUNTA + LOS REVELADOS
  ciudadOcultos: { o: THREE.Object3D; v: boolean }[] = [];
  ciudadPrompt: THREE.Group | null = null;
  ciudadPromptProxies: THREE.Mesh[] = [];
  ciudadPromptTimer: number | null = null;
  ciudadRevelados: { g: THREE.Group; x: number; y: number; z: number; radio: number; dentro: boolean; visto: boolean }[] = [];
  ciudadHallados = 0;
  ciudadHallaGrupo: THREE.Group | null = null;
  // v161 — LA CIUDAD VIVA: revelados con datos EN VIVO (presencia real) +
  // recompensa única por hallar TODOS los datos ocultos de la expedición
  ciudadReveladosVivos: { idx: number; vivo: "online" | "pico"; grupo: THREE.Group | null; color: number }[] = [];
  ciudadRecompensada = false;
  // v162 — LA MEGAPÓLIS: TODO el sitio vive en la ciudad. Cada sección
  // levanta junto a su torre un TÓTEM con una placa-neón POR MÓDULO (las
  // 147 pestañas del sitio son tocables y abren SU módulo exacto), y un
  // RÓTULO compartido revela el nombre de la placa más cercana al volar.
  ciudadTotems: { g: THREE.Group; x0: number; y0: number; z0: number; nacido: boolean }[] = [];
  // v166 — EL FONDO CREADO POR EL MÓDULO: cúpula temática que ENVUELVE al
  // piloto mientras visita una casa (el acento del módulo pinta el cielo,
  // los hazes y las estrellas) y el planeta/da su corte DUERMEN: cada
  // módulo genera su propio universo. Al cerrar la casa, el mundo vuelve.
  salaCielo: THREE.Mesh | null = null;
  salaCieloMat: THREE.ShaderMaterial | null = null;
  salaFondoOcultos: { o: THREE.Object3D; v: boolean }[] = [];
  salaTemaOn = false;
  salaTemaPendiente = false;
  salaTemaGen = 0;
  // v166: el mundo privado se APARTA cuando el piloto entra a la casa
  mundoFueraDeCasa = false;
  ciudadSlabs: { x: number; y: number; z: number; nombre: string; color: number; tab: string }[] = [];
  ciudadCrownes: THREE.Object3D[] = [];
  ciudadColisTotems: { x0: number; z0: number }[] = [];
  ciudadRotulo: THREE.Group | null = null;
  ciudadRotuloPlaca: THREE.Mesh | null = null;
  ciudadRotuloTexto: THREE.Group | null = null;
  // v164 — EL TELETIPO DE LA CIUDAD: el titular EN VIVO flota sobre la
  // plaza con cartel de ÚLTIMA HORA — la megápolis respira con el mundo
  ciudadTeletipo: THREE.Group | null = null;
  ciudadTeletipoTexto: THREE.Group | null = null;
  ciudadTeletipoAlerta: THREE.MeshStandardMaterial | null = null;
  teletipoDato: { titulo: string; fuente: string; edad: string; ultimo: boolean } | null = null;
  teletipoMs = 0;
  onTeletipoEv = (e: Event) => {
    const d = (e as CustomEvent<{ tab?: string; tipo?: string; noticias?: { titulo?: string; fuente?: string; edad?: string }[]; ultimo?: boolean }>).detail;
    if (d?.tab !== "noticias" || d.tipo !== "noticias" || !Array.isArray(d.noticias) || !d.noticias.length) return;
    const n0 = d.noticias[0];
    if (!n0?.titulo) return;
    this.teletipoDato = { titulo: n0.titulo, fuente: n0.fuente || "AGENCIA", edad: n0.edad || "", ultimo: !!d.ultimo };
    if (this.ciudadAbierta) this.refrescarTeletipo();
  };
  ciudadRotuloNombre = "";
  ciudadRotuloColor = 0;
  ciudadTick = 0;
  // v154 — EL TINTE DE SECCIÓN: el fondo del universo lava con el color de la sección activa
  cumarTinte: THREE.Mesh | null = null;
  tinteObjetivo = new THREE.Color(0x0a1428);
  tinteAmbBase = new THREE.Color(0x35476b);
  luzAmb: THREE.AmbientLight | null = null;

  constructor(opts: MundoOpts) {
    this.calidadBaja = opts.calidadBaja;
    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.lienzo,
      antialias: !opts.calidadBaja,
      alpha: true,
      powerPreference: "high-performance",
    });
    // v149/v153: techo de píxeles honesto — el DPR 2 pintaba 4× los píxeles
    // en los móviles de alta densidad (el «mucho lag» del Dueño); v153 aprieta
    // el móvil a 1.2 (fusión de las dos rondas anti-lag)
    this.dprBase = opts.calidadBaja ? 1.2 : 1.75;
    this.dprActual = Math.min(window.devicePixelRatio || 1, this.dprBase);
    this.renderer.setPixelRatio(this.dprActual);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.escena = new THREE.Scene();
    this.camara = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 120);
    // v168 SIN MAPA EN LA INTRO: la cámara nace en la PANTALLA DE TÍTULO —
    // el logo dorado al centro y las estrellas por todas partes; el planeta
    // solo asoma abajo como escenario (NUNCA de frente como un mapa con
    // marcadores — mandato del Dueño «elimina el mapa de la intro»)
    this.camara.position.set(0, 0.75, 7.2);
    this.mirada.set(0, 1.75, 0);
    this.camara.lookAt(this.mirada.x, this.mirada.y, this.mirada.z);

    // LUCES — el frío del espacio + el rim magenta de la casa (globo SIEMPRE legible)
    // v154: la ambiental se CAPTURA — se tiñe con el color de la sección activa
    this.luzAmb = new THREE.AmbientLight(0x35476b, 1.5);
    this.escena.add(this.luzAmb);
    // v154 — EL TINTE DE SECCIÓN: una cúpula gigante envuelve al universo y
    // lava el fondo con el color del sector donde estás — el fondo del mundo
    // CAMBIA DE COLOR dependiendo de la sección (el mandato del Dueño)
    const cumarGeo = new THREE.SphereGeometry(92, 20, 14);
    const cumarMat = new THREE.MeshBasicMaterial({ color: 0x0a1428, transparent: true, opacity: 0.34, side: THREE.BackSide, depthWrite: false });
    this.cumarTinte = new THREE.Mesh(cumarGeo, cumarMat);
    this.cumarTinte.renderOrder = -9;
    this.escena.add(this.cumarTinte);
    // v154: asomo de QA (patrón v151 __vg2) — sondas en vivo desde consola
    (window as unknown as { __vgMundo?: MundoWGL }).__vgMundo = this;
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
    this.construirVida(); // v157: la vida orbital — el universo nunca quieto
    // v141: la capa holo (letras + portales) y los mundos por zona
    this.escena.add(this.holo);
    this.cargarFuente();
    this.construirMundos();
    // v143: la CÁPSULA de contenido (la Casa dentro del mundo) + la
    // consola de vuelo flotante — el último plano 2D se convierte en 3D
    this.construirCapsula();
    this.construirNavFlotante();
    this.construirJoystick();
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
    // v164: EL TELETIPO — los cables de ÚLTIMA HORA viven en la CIUDAD
    window.addEventListener("vg:sala3d-datos", this.onTeletipoEv);
    // v156: la Casa guarda/muestra la consola DOM — el héroe se re-ancla
    window.addEventListener("vg:sala3d-holo", this.onHoloEv);
    // v154: LA CIUDAD-MENÚ — catálogo de secciones + toggle desde la Casa
    window.addEventListener("vg:holo-ciudad", this.onCiudadCatalogoEv);
    window.addEventListener("vg:ciudad-toggle", this.onCiudadToggleEv);

    // la Tierra ya nace girando (REGLA 6) — v148: el ángulo de nacimiento
    // ya NO es 1.2 (mostraba el Pacífico central, -158°: SOLO MAR — queja
    // literal del Dueño «comienza en la parte trasera del mapa donde solo
    // hay mar»). Fórmula verificada: la longitud que mira la cámara es
    // L = -90 - θg·57.3 → θg=-1.92 mira 20°E: ÁFRICA + EUROPA de frente,
    // con Ucrania/Oriente Medio/Sudán latiendo en el flanco derecho.
    this.mundo.rotation.y = -1.92;
    this.escena.add(this.mundo);
    this.arranqueVigia(); // v148: el corazón JAMÁS se queda parado
    this.loop();
  }

  // ── LAS ESTRELLAS — dos capas de puntos con color propio ──
  construirEstrellas() {
    const n = this.calidadBaja ? 850 : 2600; // v149/v153: móvil respira (850 lucen igual)
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
    const seg = this.calidadBaja ? 40 : 64;
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
        new THREE.RingGeometry(esTeatro ? 0.075 : 0.048, esTeatro ? 0.115 : 0.072, this.calidadBaja ? 16 : 24),
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
      const n = this.calidadBaja ? 64 : 220; // v149/v153: menos en móvil, mismo brillo
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
  // v149: la consola es de TODA sala viva (insignia, contenido, genérica
  // recién nacida): mientras haya volumen 3D en la sala, la cápsula manda
  // poco y el universo manda mucho — el móvil gana 2.2× más cielo libre
  private dimensionarCapsula() {
    const movil = window.innerWidth < 768;
    const consola = !!this.salaInst;
    const w = movil ? Math.min(window.innerWidth - 30, 392) : consola ? 720 : 1000;
    const h = movil
      ? Math.round(Math.min(window.innerHeight * (consola ? 0.26 : 0.38), consola ? 240 : 420))
      : Math.round(Math.min(window.innerHeight * (consola ? 0.3 : 0.74), consola ? 290 : 660));
    this.capsulaEl.style.width = `${w}px`;
    this.capsulaEl.style.height = `${h}px`;
    this.capsulaPx = w;
    this.capsulaEl.dataset.consola = consola ? "1" : "0";
    // v157 MODO 3D PURO TOTAL: la consola DOM de CUALQUIER sala SE GUARDA
    // (CSS la retira con display:none) — el módulo volumétrico es entero
    const holo = consola && this.holoOculto;
    this.capsulaEl.dataset.holo = holo ? "1" : "0";
  }

  // v156 — EL PULSO DEL HOLO: la Casa manda el estado (dataset.vgHolo es la
  // fuente única) y el mundo re-ancla el héroe al centro del cuadro al vuelo
  private onHoloEv = () => {
    this.holoOculto = document.documentElement.dataset.vgHolo === "1";
    this.dimensionarCapsula();
    if (this.capsulaAcoplada && !this.modoMundo && this.zona !== 0) {
      this.anclarSala(true);
      if (!this.holoOculto && this.anclaUltima) this.armarHaz(this.anclaUltima.pos, this.anclaUltima.escala);
    }
  };

  private esMovil() { return window.innerWidth < 768; }

  // la ANCLA de la cápsula en una zona: EXACTAMENTE el punto de mira de la
  // pose (la cámara la tiene centrada — el planeta queda a la izquierda por
  // el desvío de la pose). La escala sale del frustum a esa distancia: la
  // cápsula ocupa una FRACCIÓN fija de la pantalla en cualquier zona.
  private anclaCapsula(zona: number): { pos: THREE.Vector3; escala: number } {
    const { pos, tgt } = this.poseDe(zona);
    const dir = new THREE.Vector3(tgt.x - pos[0], tgt.y - pos[1], tgt.z - pos[2]);
    const dist = Math.max(1.2, dir.length());
    const movil = this.esMovil();
    const consola = !!this.salaInst;
    const fracAncho = movil ? (consola ? 0.78 : 0.88) : consola ? 0.42 : 0.52;
    // v149 EL FILO SAGRADO: la escala sale de la distancia REAL cámara→pantalla
    // (no del eje de mira). El desvío hacia abajo acercaba la cápsula y la
    // inflaba ~30%: el marco se salía del cuadro y TODO leía «página 2D a
    // sangre». Con la distancia real, la cápsula ocupa SIEMPRE su fracción.
    const p = tgt.clone();
    p.y -= 2 * dist * Math.tan((this.camara.fov * Math.PI) / 360) * (consola ? (movil ? 0.34 : 0.3) : 0.05);
    const distReal = Math.max(1.1, p.distanceTo(this.camara.position));
    const altoReal = 2 * distReal * Math.tan((this.camara.fov * Math.PI) / 360);
    const anchoReal = altoReal * this.camara.aspect;
    // doble seguro: la cápsula jamás pasa del 88% del cuadro (consola 78%)
    const tope = movil ? 0.88 : 0.9;
    const fracFinal = Math.min(fracAncho, tope);
    const escala = (anchoReal * fracFinal) / this.capsulaPx;
    return { pos: p, escala };
  }

  // ACOPLAR: la cápsula vuela a la ancla de la zona y queda PARALELA a la
  // pantalla del piloto (quaternion de la cámara — cero skew: el contenido
  // se lee perfecto y aún así vive en el espacio, con paralaje y warp reales)
  acoplarCapsula(zona: number, instant = false) {
    if (this.modoMundo || zona === 0 || !this.capsula) return;
    const a = this.anclaCapsula(zona);
    this.anclaUltima = a; // v156: para re-encender el haz al salir del holo
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
  // v147 — EL JOYSTICK MÓVIL — el mandato del Dueño («moverse es muy
  // tosco: tengo que presionar un lado varias veces para solo moverme»).
  // En táctil NO había forma fluida de volar: el pinza apenas empuja.
  // Nace una palanca analógica acoplada a la cámara (abajo-izquierda):
  // el pulgar manda un vector (-1..1) y el mundo obedece CON INERCIA.
  // Los botones ▲▼ sintetizan Q/E (misma física del teclado).
  // ════════════════════════════════════════════════════════
  private quiereJoystick(): boolean {
    return typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
  }

  construirJoystick() {
    if (!this.quiereJoystick()) return;
    const host = document.createElement("div");
    host.className = "vg147-joyhost";
    host.innerHTML = `
      <div class="vg147-joy-base" data-joy="base">
        <div class="vg147-joy-anillo"></div>
        <div class="vg147-joy-knob" data-joy="knob"></div>
      </div>
      <div class="vg147-joy-alt">
        <button class="vg147-joy-btn" data-joy="sube" aria-label="Subir">▲</button>
        <button class="vg147-joy-btn" data-joy="baja" aria-label="Bajar">▼</button>
      </div>
      <button class="vg166-avanza" data-joy="avanza" aria-label="Avanzar (mantén pulsado)">AVANZAR</button>
      <p class="vg149-joy-hint" data-joy="hint">palanca o avanzar = volar · arrastrar = mirar</p>`;
    this.joyEl = host;
    this.joyKnob = host.querySelector('[data-joy="knob"]');
    this.joyObj = new CSS3DObject(host);
    this.cssEscena.add(this.joyObj);
    // v149: el hint de vuelo se despide solo (10s) — enseña, no estorba
    window.setTimeout(() => host.classList.add("vg149-hint-fuera"), 10000);
    // los listeners viven EN el host: el mundo jamás ve estos pointers
    host.addEventListener("pointerdown", this.onJoyDown);
    host.addEventListener("pointermove", this.onJoyMove);
    host.addEventListener("pointerup", this.onJoyUp);
    host.addEventListener("pointercancel", this.onJoyUp);
    this.acoplarJoystickFrame();
  }

  // el pulgar en el cuadro: el anillo se lee como palanca
  private joyBase: HTMLDivElement | null = null;
  private joyPulso(e: PointerEvent): { x: number; y: number } | null {
    const base = this.joyBase;
    if (!base) return null;
    const r = base.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const radio = r.width / 2;
    let dx = (e.clientX - cx) / radio, dy = (e.clientY - cy) / radio;
    const m = Math.hypot(dx, dy);
    if (m > 1) { dx /= m; dy /= m; }
    return { x: dx, y: dy };
  }

  private onJoyDown = (e: PointerEvent) => {
    const t = (e.target as HTMLElement)?.dataset?.joy;
    if (!t) return;
    e.stopPropagation();
    if (t === "sube" || t === "baja") {
      this.teclas.add(t === "sube" ? "e" : "q");
      try { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } catch { /* el dedo ya está capturado por el host */ }
      const up = () => { this.teclas.delete(t === "sube" ? "e" : "q"); };
      (e.target as HTMLElement).addEventListener("pointerup", up, { once: true });
      (e.target as HTMLElement).addEventListener("pointercancel", up, { once: true });
      return;
    }
    // v166 — EL BOTÓN AVANZAR: un solo dedo empuja la casa, el otro mira.
    // Mantener pulsado = mantener W (la misma física del teclado).
    if (t === "avanza") {
      this.teclas.add("w");
      try { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } catch { /* el dedo ya está capturado por el host */ }
      const up = () => { this.teclas.delete("w"); };
      (e.target as HTMLElement).addEventListener("pointerup", up, { once: true });
      (e.target as HTMLElement).addEventListener("pointercancel", up, { once: true });
      return;
    }
    if (t !== "base" && t !== "knob") return;
    this.joyId = e.pointerId;
    this.joyBase = (e.target as HTMLElement).closest(".vg147-joy-base") as HTMLDivElement | null;
    (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
    const p = this.joyPulso(e);
    if (p) this.moverKnob(p);
  };

  private onJoyMove = (e: PointerEvent) => {
    if (this.joyId !== e.pointerId) return;
    e.stopPropagation();
    const p = this.joyPulso(e);
    if (p) this.moverKnob(p);
  };

  private onJoyUp = (e: PointerEvent) => {
    if (this.joyId !== e.pointerId) return;
    e.stopPropagation();
    this.joyId = -1;
    this.joy = { x: 0, y: 0 };
    this.moverKnob({ x: 0, y: 0 });
  };

  private moverKnob(p: { x: number; y: number }) {
    this.joy = { x: p.x, y: -p.y }; // pantalla abajo = atrás
    if (this.joyKnob) {
      const R = 34; // px de recorrido del knob dentro del anillo
      this.joyKnob.style.transform = `translate(calc(-50% + ${p.x * R}px), calc(-50% + ${p.y * R}px))`;
    }
  }

  // pegado abajo-izquierda del cuadro, paralelo a la cámara (como el puente)
  // v149: SUBE al cielo libre — al 30% de la pantalla desde abajo, siempre
  // POR ENCIMA de la cápsula-consola: el pulgar nunca pelea con la Casa
  acoplarJoystickFrame() {
    if (!this.joyObj || !this.joyEl) return;
    const visible = this.consolaVisibleFin && this.quiereJoystick();
    this.joyObj.visible = visible;
    if (!visible) return;
    const zJ = 2.7;
    const fovR = (this.camara.fov * Math.PI) / 180;
    const alto = 2 * zJ * Math.tan(fovR / 2);
    const ancho = alto * this.camara.aspect;
    const px = this.joyEl.offsetWidth || 150;
    const hPx = this.joyEl.offsetHeight || 150;
    const escala = (ancho * this.joyFrac) / px;
    this.joyObj.scale.setScalar(escala);
    const mundoPorPx = alto / window.innerHeight;
    // v149: vectores reutilizados — cero basura por frame
    const f = _vA;
    this.camara.getWorldDirection(f);
    const arriba = _vB.set(0, 1, 0).applyQuaternion(this.camara.quaternion);
    const derecha = _vC.crossVectors(f, arriba).normalize();
    const x = -(ancho / 2) + (px * escala) / 2 + 14 * mundoPorPx;
    // v149: 30% del cuadro desde el borde inferior (antes 76px ≈ bajo la cápsula)
    const y = -alto / 2 + window.innerHeight * 0.3 * mundoPorPx;
    this.joyObj.position.copy(this.camara.position).addScaledVector(f, zJ).addScaledVector(derecha, x).addScaledVector(arriba, y);
    this.joyObj.quaternion.copy(this.camara.quaternion);
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
    // v148: la base «generica» JAMÁS degrada una sala ya ascendida (el
    // contenido real que el panel publicó) del mismo tab — la carrera de
    // arranque no borra contenido vivo
    if (p.tipo === "generica" && this.salaPayload && this.salaPayload.tab === p.tab && this.salaPayload.tipo !== "generica") return;
    const llave = `${p.tab}|${p.titulo}`;
    if (this.salaLlave === llave && this.salaInst) return;
    this.salaLlave = llave;
    // v167 BUG R19: la primera sala que el mundo ve ES la del arranque —
    // el aterrizaje de la ciudad se retira cuando esta llave cambie
    if (!this.salaLlaveArranque) this.salaLlaveArranque = llave;
    this.salaPayload = p;
    this.montarSala();
  };

  private onSala3dDatosEv = (e: Event) => {
    const p = (e as CustomEvent<PayloadSala3D>).detail;
    if (!p?.tab) return;
    // datos vivos de la sala montada (o de la que aún no nace)
    if (this.salaPayload && this.salaPayload.tab !== p.tab) return;
    const eraGenerica = this.salaPayload?.tipo === "generica";
    const esGenerica = p.tipo === "generica";
    // v150: nunca DEGRADAR — si la sala montada es «contenido» (filas reales
    // del panel en volumen) y llega un pulso genérico, el pulso se ignora:
    // el contenido manda sobre la estación informativa
    if (this.salaPayload?.tipo === "contenido" && esGenerica) return;
    this.salaPayload = p;
    // v148: la ESTACIÓN INFORMATIVA repinta sus letras/datos SIN rebote —
    // solo la ascensión genérica→insignia (o sala muerta) reconstruye
    if (this.salaInst && eraGenerica === esGenerica) {
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
    // v157 HOLO TOTAL: TODAS las salas nacen en 3D puro (genéricas también)
    // — la consola DOM se guarda en cualquier módulo, el chip la devuelve
    this.holoOculto = document.documentElement.dataset.vgHolo === "1";
    const ctx: CtxSala3D = {
      fuente: this.fuente,
      calidadBaja: this.calidadBaja,
      movil: this.esMovil(),
      camara: this.camara.position, // v165: la proximidad lee la cámara VIVA
      animarP: (obj, to, ms, opts) => this.animarP(obj as ObjNum, to, ms, opts),
      // v172: el mundo presta su voz — la cascada del ascenso
      sonar: (tp, p) => sonar(tp, p),
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
    // v166: EL MÓDULO PINTA SU FONDO — la cúpula temática envuelve al piloto
    this.despertarTemaSala(p.color || 0x7ab8ff);
    // v159: sala héroe en móvil → el mundo de zona duerme (una sola capa manda)
    this.salaHeroMovil = this.esMovil();
    this.visibleZona(this.zona);
    // v148: la sección recibe SU PROPIO mundo (si aún no lo tiene)
    this.montarMundo(p);
    // la cápsula se hace consola (o vuelve a pantalla) según la sala
    this.dimensionarCapsula();
    // v159: si un VUELO de ciudad sigue corriendo, NO se ancla — la pose
    // actual es intermedia y la sala quedaría varada en el cielo; el
    // aterrizaje del vuelo (volarCiudad onDone) la ancla y la enciende
    if (this.capsulaAcoplada && !this.modoMundo && this.zona !== 0 && !this.enVuelo) {
      this.acoplarCapsula(this.zona, true);
      this.anclarSala();
      sonar("ping");
    } else if (this.enVuelo && this.capsulaAcoplada && !this.modoMundo && this.zona !== 0) {
      // v167 BUG R19: el vuelo que manda NO es de ciudad (ceremonia) — el
      // WATCHDOG del loop ancla la sala en cuanto el aire se tranquiliza
      this.salaAnclaPendiente = true;
    }
  }

  desmontarSala(instant = false) {
    // v166: al salir de la casa, el fondo del módulo muere (el planeta vuelve)
    this.dormirTemaSala();
    this.desmontarMundo();
    const inst = this.salaInst;
    if (!inst) return;
    this.salaInst = null;
    // v159: sin sala héroe → el mundo de zona despierta otra vez
    if (this.salaHeroMovil) { this.salaHeroMovil = false; this.visibleZona(this.zona); }
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
    // v157 HOLO TOTAL: la genérica también manda el centro cuando la consola
    // está guardada — el módulo entero (cualquiera) es el héroe
    const insignia = p.tipo !== "generica" || this.holoOculto;
    const a = this.anclaSala(insignia);
    // v156: con el holo activo el héroe re-ancla SIN rebote (corte limpio)
    inst.grupo.position.copy(a.pos);
    inst.grupo.quaternion.copy(this.camara.quaternion);
    inst.grupo.quaternion.multiply(Q_YAW_CONSOLA);
    inst.grupo.visible = true;
    if (instant) { inst.grupo.scale.setScalar(a.escala); this.anclarMundo(true); return; }
    inst.grupo.scale.setScalar(a.escala * 0.84);
    this.animarP(inst.grupo.scale, { x: a.escala, y: a.escala, z: a.escala }, 620, { ease: easeOut });
    // v148: el mundo de la sección SE ANCLA con la sala — rodeándola
    this.anclarMundo();
  }

  // v148 MUNDOS PROPIOS — montaje del universo privado de la sección.
  // Llave = tipo|tab: los datos vivos (vg:sala3d-datos) NO remontan el
  // mundo; solo un cambio de rama lo sustituye (dispose completo).
  private montarMundo(p: PayloadSala3D) {
    const llave = `${p.tipo}|${p.tab}`;
    if (this.mundoLlave === llave && this.mundoInst) return;
    this.desmontarMundo();
    this.mundoLlave = llave;
    const ctx: CtxSala3D = {
      fuente: this.fuente!,
      calidadBaja: this.calidadBaja,
      movil: this.esMovil(),
      camara: this.camara.position, // v165: los mundos privados también ven la cámara
      animarP: (obj, to, ms, opts) => this.animarP(obj as ObjNum, to, ms, opts),
    };
    try {
      this.mundoInst = construirMundo3D(ctx, p);
    } catch (e) {
      // un mundo roto nunca tumba la sala: la placa sigue viva
      console.warn("[v148] montarMundo fallo:", e);
      this.mundoInst = null;
      return;
    }
    this.mundoInst.grupo.visible = false;
    this.escena.add(this.mundoInst.grupo);
    if (this.capsulaAcoplada && !this.modoMundo && this.zona !== 0) this.anclarMundo(true);
  }

  private desmontarMundo() {
    this.mundoLlave = "";
    const mi = this.mundoInst;
    if (!mi) return;
    this.mundoInst = null;
    this.escena.remove(mi.grupo);
    mi.liberar();
  }

  // v148 MUNDOS PROPIOS — EL ANCLA PROPIA DEL MUNDO (QA v148: reusar el
  // ancla de la sala hundía las frases fuera del encuadre — la placa
  // genérica vive SOBRE la cápsula y le sumaba +1.58 locales). El mundo
  // NO copia el ancla de su sala: tiene la SUYA, centrada en la VISTA,
  // calibrada para que el anillo de propios enmarque el cuadro entero:
  // plataforma al borde inferior, frases al superior, propios a los flancos.
  private anclarMundo(instant = false) {
    const mi = this.mundoInst;
    if (!mi || this.modoMundo || this.zona === 0 || !this.capsulaAcoplada) return;
    // v148 QA (3ª calibración, fov 50 medido): a 3.05 la cúpula del
    // planeta (cápsula frontal a 3.2) seguía comiendo la fila de frases.
    // El mundo abraza a 2.55 — TODO su contenido flota DELANTE del
    // planeta y las frases bajan al espacio libre del cuadro.
    // v157 — CAPAS LIMPIAS: en holo el héroe (2.3) manda el centro y el
    // mundo de la sección se retira a FONDO (4.6, escala menor) — escenario
    // lejano detrás del módulo, nada mezclado en el mismo plano (queja
    // «hay mucho elemento mezclado en lo 3D»). Sin holo abraza como siempre.
    const dist = this.holoOculto ? 4.6 : 2.55;
    const fovR = (this.camara.fov * Math.PI) / 180;
    const alto = 2 * dist * Math.tan(fovR / 2);
    const ancho = alto * this.camara.aspect;
    const movil = this.esMovil();
    // la escala CONVIERTE el mundo local (plataforma -1.62 → frases +1.58,
    // propios a radio 2.9) en un cuadro completo
    // v157: en holo el mundo respira como telón de fondo (más lejos Y más
    // pequeño) — el módulo es el protagonista absoluto del cuadro
    const escW = alto * (movil ? 0.3 : 0.28) * (this.holoOculto && this.salaInst ? 0.34 : 1);
    const f = new THREE.Vector3();
    this.camara.getWorldDirection(f);
    const arriba = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camara.quaternion);
    const derecha = new THREE.Vector3().crossVectors(f, arriba).normalize();
    const fx = movil ? 0 : 0.10;
    const fy = movil ? -0.02 : 0;
    mi.grupo.position.copy(this.camara.position)
      .addScaledVector(f, dist)
      .addScaledVector(derecha, ancho * fx)
      .addScaledVector(arriba, alto * fy);
    mi.grupo.quaternion.copy(this.camara.quaternion);
    mi.grupo.quaternion.multiply(Q_YAW_CONSOLA);
    mi.grupo.visible = true;
    if (instant) { mi.grupo.scale.setScalar(escW); return; }
    mi.grupo.scale.setScalar(escW * 0.9);
    this.animarP(mi.grupo.scale, { x: escW, y: escW, z: escW }, 700, { ease: easeOut });
  }

  private anclaSala(insignia: boolean): { pos: THREE.Vector3; escala: number } {
    // v145 QA: ancla EN COORDENADAS DE PANTALLA (como el puente de mando) —
    // el planeta vive al centro-izquierda del encuadre; la sala insignia
    // flota ARRIBA-DERECHA (desktop) o ARRIBA (móvil) sin que el globo la tape
    // v156 HOLO: el héroe SE ADELANTA a 2.3 — DELANTE del mundo de la sección
    // (2.55) y del planeta: flota como una proyección entre el piloto y la
    // Tierra, el módulo entero de frente sin que nada lo tape
    const dist = insignia ? (this.holoOculto ? 2.3 : 3.4) : 4.0;
    const fovR = (this.camara.fov * Math.PI) / 360;
    const altoMundo = 2 * dist * Math.tan(fovR);
    const anchoMundo = altoMundo * this.camara.aspect;
    const movil = this.esMovil();
    // v156 MODO 3D PURO: con la consola guardada el héroe manda el CENTRO
    // del cuadro — más grande y centrado, el módulo entero es volumen
    const holo = insignia && this.holoOculto;
    // v150: la estación informativa (genérica) vive en la franja derecha del
    // cuadro — 0.22 del ancho para caber íntegra entre la cápsula y el borde
    // v156 QA móvil: en RETRATO el ancho es el eje corto — el héroe manda
    // con 0.94 del ancho (la consola no vuelve a empequeñecer el módulo)
    const fracAncho = movil ? (holo ? 0.94 : 0.55) : insignia ? (holo ? 0.54 : 0.44) : 0.22;
    const f = new THREE.Vector3();
    this.camara.getWorldDirection(f);
    const arriba = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camara.quaternion);
    const derecha = new THREE.Vector3().crossVectors(f, arriba).normalize();
    const fx = insignia ? (movil ? 0 : holo ? 0 : 0.19) : 0;
    // v156 QA: la sala es pesada de arriba (título 0.98 + núcleo) — el holo
    // la BAJA para que el título respire bajo el borde superior del cuadro
    const fy = insignia ? (movil ? (holo ? -0.06 : 0.24) : (holo ? -0.16 : 0.05)) : 0;
    const pos = this.camara.position.clone()
      .addScaledVector(f, dist)
      .addScaledVector(derecha, anchoMundo * fx)
      .addScaledVector(arriba, altoMundo * fy);
    // v156 QA móvil: la cámara MIRA desviada del eje (el planeta vive a la
    // izquierda del encuadre) — el ancla de eje recto cae a la DERECHA del
    // centro. En holo el módulo aterriza EXACTAMENTE en la MIRA de la pose:
    // se mide dónde proyecta el tgt de la zona y se compensa ese desvío.
    if (holo) {
      const v = this.poseDe(this.zona).tgt.clone().project(this.camara);
      pos.addScaledVector(derecha, (v.x * anchoMundo) / 2);
      pos.addScaledVector(arriba, (v.y * altoMundo) / 2);
    }
    // v149: escala por DISTANCIA REAL cámara→héroe (el mismo filo sagrado de
    // la cápsula: el desvío vertical acercaba la sala y la inflaba)
    const distReal = Math.max(1.1, pos.distanceTo(this.camara.position));
    const anchoReal = 2 * distReal * Math.tan(fovR) * this.camara.aspect;
    const escala = (anchoReal * fracAncho) / 2.6;
    if (!insignia) {
      // placa genérica: FRANJA DERECHA (desktop) o sobre la cápsula (móvil)
      const rCaps = this.capsulaEl?.getBoundingClientRect();
      // v150 ESTACIÓN INFORMATIVA: en ESCRITORIO la cápsula llena el centro y
      // arriba solo queda una ranura — la estación vive en la FRANJA DERECHA
      // del cuadro (todo en el plano del ancla, dist delante de la cámara);
      // el ancla vieja caía detrás del planeta o fuera del cuadro: el «papel
      // sin estación» que el Dueño vio como una rama vacía
      if (!movil && rCaps && rCaps.width > 100) {
        const stationHalf = 1.3 * escala;
        const capsRightFrac = Math.min(rCaps.right / window.innerWidth, 0.92);
        const xFrac = Math.min(
          capsRightFrac + (stationHalf + 0.12) / anchoMundo,
          1 - stationHalf / anchoMundo - 0.012,
        );
        pos.copy(this.camara.position)
          .addScaledVector(f, dist)
          .addScaledVector(derecha, anchoMundo * (xFrac - 0.5))
          .addScaledVector(arriba, -altoMundo * 0.02);
      } else {
        // MÓVIL: la cápsula llena el ancho — la estación flota sobre su borde
        // superior real (fracción de pantalla → plano del ancla), sujeta al
        // cuadro: nunca detrás de la cápsula ni fuera del marco
        const capsTopFrac = rCaps ? rCaps.top / window.innerHeight : 0.25;
        const stationHalfH = 0.78 * escala;
        const yFrac = Math.max(
          capsTopFrac - (stationHalfH + 0.04) / altoMundo,
          stationHalfH / altoMundo + 0.01,
        );
        pos.copy(this.camara.position)
          .addScaledVector(f, dist)
          .addScaledVector(arriba, altoMundo * (0.5 - yFrac));
      }
    } else {
      pos.y += altoMundo * 0.02;
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
    // v147: sensibilidad por dispositivo — el móvil exige más giro por píxel
    // (el Dueño: «moverse es muy tosco»); el ratón conserva su fino control
    const s = this.esMovil() ? 0.0048 : 0.0032;
    const yaw = -dxPx * s;
    const pitch = -dyPx * s;
    // v149: vectores reutilizados — cero basura por frame
    const dir = _vA.copy(this.dirArrastre);
    // yaw alrededor del eje Y del mundo
    dir.applyAxisAngle(_vB.set(0, 1, 0), yaw);
    // pitch alrededor del eje DERECHA de la propia dirección
    const derecha = _vC.crossVectors(dir, _vB.set(0, 1, 0));
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
    const dir = _vA.subVectors(this.mirada, this.camara.position).normalize();
    this.vel.addScaledVector(dir, -delta * 0.0032);
  }

  // movimientos del teclado + joystick → velocidad objetivo; el loop integra con inercia
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
    // v147: el JOYSTICK suma su vector analógico (el pulgar manda con la
    // MISMA física del teclado — inercia de nave idéntica, cero tosquedad)
    fwd += this.joy.y;
    lado += this.joy.x;
    const obj = _vA.set(lado, vert, fwd);
    if (obj.lengthSq() > 0) {
      // v147: analógico — la MAGNITUD manda (palanca a medio camino = medio
      // gas); el teclado es binario y satur en 1 igual que siempre
      const mag = Math.min(1, obj.length());
      const turbo = (T.has("shift") ? 2.6 : 1) * (mag >= 0.92 ? 1.35 : 1); // al fondo del anillo = turbo suave
      // v166 — VUELO FINO EN LA CASA: dentro de un módulo la velocidad baja
      // (atravesar puertas sin pasarse de largo); fuera, el vuelo libre intacto
      const enCasa = !!this.salaInst && this.salaInst.grupo.visible && this.salaPayload?.tipo !== "generica";
      obj.normalize().multiplyScalar((enCasa ? VEL_LIBRE * 0.55 : VEL_LIBRE) * turbo * mag);
      // los ejes del VUELO salen de la CÁMARA: adelante = hacia la mirada
      const dirF = _vB.subVectors(this.mirada, this.camara.position).normalize();
      const dirR = _vC.crossVectors(dirF, _vD.set(0, 1, 0)).normalize();
      const dirU = _vD.crossVectors(dirR, dirF).normalize();
      const objetivo = _vE.set(0, 0, 0)
        .addScaledVector(dirF, obj.z)
        .addScaledVector(dirR, obj.x)
        .addScaledVector(dirU, obj.y);
      this.vel.lerp(objetivo, 1 - Math.exp(-dt * 10)); // v148: gas más vivo
    } else {
      this.vel.multiplyScalar(Math.max(0, 1 - dt * 5.2)); // frena suave (inercia)
    }
    if (this.vel.lengthSq() < 1e-7) { this.asentarVuelo(dt); return; }
    const p = _vA.copy(this.camara.position).addScaledVector(this.vel, dt);
    // v158 — CORREDOR DE LA CIUDAD: mientras eliges módulos, el vuelo vive
    // EN la metrópolis (anillo sobre la isla + techo/suelo del diorama).
    // Los límites del planeta NO aplican — estás a 10.6 del suelo del mundo.
    if (this.ciudadAbierta && this.ciudadGrupo) {
      const esc = this.ciudadGrupo.scale.x;
      const rel = _vC.copy(p).sub(this.ciudadGrupo.position);
      const rXZ = Math.sqrt(rel.x * rel.x + rel.z * rel.z);
      const rMax = 11.8 * esc;
      if (rXZ > rMax) {
        const k = rMax / Math.max(rXZ, 1e-6);
        rel.x *= k; rel.z *= k;
        _vB.set(rel.x, 0, rel.z).normalize();
        const fuera = _vB.dot(this.vel);
        if (fuera > 0) this.vel.addScaledVector(_vB, -fuera);
      }
      const yMin = 0.5 * esc, yMax = 5.4 * esc;
      if (rel.y < yMin) { rel.y = yMin; this.vel.y = Math.max(0, this.vel.y); }
      else if (rel.y > yMax) { rel.y = yMax; this.vel.y = Math.min(0, this.vel.y); }
      // v161 — COLISIÓN SUAVE CON LAS TORRES: el caza ya no atraviesa el
      // cristal de las manzanas. Cada edificio empuja por el eje MENOS
      // profundo y mata la velocidad entrante — rozar una torre es un
      // planeo (el mismo espíritu de los límites que deslizan del v148).
      const ly = rel.y / esc;
      if (ly < 1.8 && this.ciudadEdificios.length) {
        const lx = rel.x / esc, lz = rel.z / esc;
        for (const ed of this.ciudadEdificios) {
          const dx = lx - ed.x0;
          const dz = lz - ed.z0;
          const px = 0.58 - Math.abs(dx);
          const pz = 0.58 - Math.abs(dz);
          if (px <= 0 || pz <= 0) continue;
          if (px < pz) {
            const sx = dx >= 0 ? 1 : -1;
            rel.x = (ed.x0 + sx * 0.58) * esc;
            const vn = this.vel.x * sx;
            if (vn < 0) this.vel.x -= sx * vn;
          } else {
            const sz = dz >= 0 ? 1 : -1;
            rel.z = (ed.z0 + sz * 0.58) * esc;
            const vn = this.vel.z * sz;
            if (vn < 0) this.vel.z -= sz * vn;
          }
        }
        // v162 — COLISIÓN CON LOS TÓTEMS: la columna y sus placas también
        // son sólidas (más estrechas que una torre: x 0.58 · z 0.3)
        for (const tt of this.ciudadColisTotems) {
          const dx = lx - tt.x0;
          const dz = lz - tt.z0;
          const px = 0.58 - Math.abs(dx);
          const pz = 0.3 - Math.abs(dz);
          if (px <= 0 || pz <= 0) continue;
          if (px < pz) {
            const sx = dx >= 0 ? 1 : -1;
            rel.x = (tt.x0 + sx * 0.58) * esc;
            const vn = this.vel.x * sx;
            if (vn < 0) this.vel.x -= sx * vn;
          } else {
            const sz = dz >= 0 ? 1 : -1;
            rel.z = (tt.z0 + sz * 0.3) * esc;
            const vn = this.vel.z * sz;
            if (vn < 0) this.vel.z -= sz * vn;
          }
        }
      }
      p.copy(this.ciudadGrupo.position).add(rel);
    } else {
    // v148 — LÍMITES QUE DESLIZAN: antes el paso entero moría contra la
    // pared (la nave «pegote»). Ahora el movimiento se PROYECTA sobre la
    // superficie permitida: rozar el planeta o el muro es un planeo suave.
    const l = p.length();
    if (l < R_MIN_GLOBO) {
      p.multiplyScalar(R_MIN_GLOBO / Math.max(l, 1e-6));
      const n = _vB.copy(p).normalize();
      const hacia = n.dot(this.vel);          // componente radial entrante
      if (hacia < 0) this.vel.addScaledVector(n, -hacia); // muere lo que empuja, vive lo que roza
    } else if (l > R_MAX_UNI) {
      p.multiplyScalar(R_MAX_UNI / l);
      const n = _vB.copy(p).normalize();
      const fuera = n.dot(this.vel);
      if (fuera > 0) this.vel.addScaledVector(n, -fuera);
    }
    if (p.y < Y_MIN_LIBRE) { p.y = Y_MIN_LIBRE; this.vel.y = Math.max(0, this.vel.y); }
    else if (p.y > Y_MAX_LIBRE) { p.y = Y_MAX_LIBRE; this.vel.y = Math.min(0, this.vel.y); }
    }
    const d = _vB.subVectors(p, this.camara.position);
    this.camara.position.copy(p);
    this.mirada.add(d); // la mirada viaja CON la cámara (orientación intacta)
    this.camara.lookAt(this.mirada.x, this.mirada.y, this.mirada.z);
    this.asentarVuelo(dt);
  }

  // v148 — EL ALABEO Y EL FOV DE VELOCIDAD: la SENSACIÓN de fluidez.
  // El caza se inclina con el lateral (banking) y el objetivo visual abre
  // el ángulo con la velocidad — el vuelo se SIENTE rápido y suave sin
  // tocar una sola constante de física. Solo con la mano en el volante.
  private asentarVuelo(dt: number) {
    if (!this.libreOK() || this.enVuelo) {
      if (this.rollActual !== 0) {
        this.rollActual += (0 - this.rollActual) * Math.min(1, dt * 5);
        this.camara.rotateZ(this.rollActual);
        if (Math.abs(this.rollActual) < 0.001) this.rollActual = 0;
      }
      return;
    }
    const dirF = _vA.subVectors(this.mirada, this.camara.position).normalize();
    const dirR = _vB.crossVectors(dirF, _vC.set(0, 1, 0)).normalize();
    const lat = this.vel.dot(dirR);
    const objetivoRoll = THREE.MathUtils.clamp(-lat * 0.055, -0.15, 0.15);
    this.rollActual += (objetivoRoll - this.rollActual) * Math.min(1, dt * 4.2);
    if (Math.abs(this.rollActual) > 0.0008) this.camara.rotateZ(this.rollActual);
    const fovObj = 50 + Math.min(4.5, this.vel.length() * 0.5);
    if (Math.abs(this.camara.fov - fovObj) > 0.04) {
      this.camara.fov += (fovObj - this.camara.fov) * Math.min(1, dt * 3);
      this.camara.updateProjectionMatrix();
    }
  }

  // calmar el vuelo libre (al despegar a otra zona, todo se asienta)
  calmarLibre() {
    this.vel.set(0, 0, 0);
    this.rollActual = 0; // v148: sin alabeo residual tras el warp
    this.arrastrando = false;
    this.teclas.clear();
    this.joy = { x: 0, y: 0 };
    this.joyId = -1;
    this.moverKnob({ x: 0, y: 0 });
    this.pendiente = null;
    this.punteros.clear();
  }

  // ════════════════════════════════════════════════════════
  // v157 — LA CORREA NUEVA — el mandato del Dueño («no puedo mirar para
  // atrás, las cosas te siguen»): la Casa ya NO persigue ni se replanta
  // frente a la mirada. El piloto mira y vuela a donde quiera; una BALIZA
  // holo late sobre la Casa para señalar el camino de vuelta, y el rescate
  // físico solo llega al borde del universo — arrastrando a la Casa
  // conservando SU orientación, sin cazar nunca la vista del piloto.
  // ════════════════════════════════════════════════════════
  private seguirPiloto(dt: number) {
    if (!this.capsulaAcoplada || this.enVuelo || this.modoMundo || !this.capsula) return;
    if (!this.libreOK()) return;
    // v158: eligiendo módulos en la CIUDAD la correa descansa — la Casa
    // queda lejos (abajo del mundo) y su baliza no molesta en la metrópolis
    if (this.ciudadAbierta) { this.setBaliza(false); return; }
    const dist = this.camara.position.distanceTo(this.capsula.position);
    // LA BALIZA: desde que te alejas un poco, la columna dorada señala la Casa
    this.setBaliza(dist > CORREA_DIST * 0.42);
    const limiteRescate = this.esMovil() ? 9.5 : CORREA_RESCATE;
    // el rescate ARRANCA solo en el borde del universo, pero una vez activado
    // NO SUELTA hasta devolver la Casa a distancia cómoda (QA v157: parar en
    // el umbral abandonaba la Casa a mitad de camino)
    if (!this.correaActiva) {
      if (dist < limiteRescate) return; // libertad total: la Casa vive quieta
    } else if (dist <= CORREA_DIST * 0.55) {
      this.correaActiva = false; // rescate completado: la Casa vuelve a reposar
      return;
    }
    // RESCATE DE BORDE: la Casa vuela hacia el piloto por la mitad del camino
    // CONSERVANDO su orientación y llevándose a su sala y su mundo (poses
    // intactas) — la mirada del piloto jamás es secuestrada
    const objetivo = _vA.copy(this.capsula.position).lerp(this.camara.position, 0.5).sub(this.capsula.position);
    const paso = Math.min(objetivo.length(), dt * 3.2);
    if (paso < 1e-5) return;
    objetivo.normalize().multiplyScalar(paso);
    this.capsula.position.add(objetivo);
    if (this.salaInst) this.salaInst.grupo.position.add(objetivo);
    if (this.mundoInst) this.mundoInst.grupo.position.add(objetivo);
    this.armarHaz(this.capsula.position, this.anclaCapsula(this.zona).escala);
    if (!this.correaActiva) { this.correaActiva = true; sonar("clank"); } // un solo aviso por estirada
  }

  // ── LA BALIZA DE RETORNO (v157): columna holo + latido — la señal que
  // marca dónde quedó la Casa cuando el piloto sale de expedición ──
  private balizaCrono: THREE.Mesh | null = null;
  private balizaMat: THREE.MeshBasicMaterial | null = null;
  private balizaOn = false;
  private setBaliza(on: boolean) {
    if (on === this.balizaOn && this.balizaCrono) return;
    this.balizaOn = on;
    if (on && !this.balizaCrono) {
      const geo = new THREE.CylinderGeometry(0.05, 0.19, 1.9, 10, 1, true);
      this.balizaMat = new THREE.MeshBasicMaterial({
        color: 0xffd76a, transparent: true, opacity: 0.3,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      });
      this.balizaCrono = new THREE.Mesh(geo, this.balizaMat);
      this.balizaCrono.renderOrder = 7;
      this.escena.add(this.balizaCrono);
    }
    if (this.balizaCrono) this.balizaCrono.visible = on;
  }

  // ════════════════════════════════════════════════════════
  // v145 — EL HAZ DEL PROYECTOR — la cápsula no flota sola: una luz
  // volumétrica nace debajo de ella y la SOSTIENE en el aire (el truco
  // de los hologramas de cine: el cono aditivo que «proyecta» la pantalla)
  // ════════════════════════════════════════════════════════
  private armarHaz(pos: THREE.Vector3, escala: number) {
    // v156: con la cápsula guardada (holo) el proyector duerme — nada
    // ilumina una pantalla que no está
    if (this.capsulaEl?.dataset.holo === "1") return;
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

  // ════════════════════════════════════════════════════════
  // v157 — LA VIDA ORBITAL — el mandato del Dueño («lo 3D es muy simple,
  // solo un fondo, no dinamismo, es aburrido»): el universo NUNCA está
  // quieto — satélites con paneles solares orbitando la Tierra, jets de
  // guerra patrullando con luces de navegación, cometas que cruzan el
  // cielo profundo, drones guardianes alrededor de la Casa y la
  // respiración del piloto cuando se queda quieto.
  // ════════════════════════════════════════════════════════
  private vidaGrupo = new THREE.Group();
  private orbitas: { pivote: THREE.Group; g: THREE.Group; vel: number; fase: number }[] = [];
  private jets: { pivote: THREE.Group; g: THREE.Group; luz: THREE.MeshBasicMaterial; vel: number }[] = [];
  private cometas: THREE.Line[] = [];
  private cometaDatos: ({ ini: THREE.Vector3; dir: THREE.Vector3; vida: number; t: number } | null)[] = [];
  private cometaSiguiente = 4;
  private dronesCasa: { g: THREE.Group; r: number; vel: number; fase: number; y: number }[] = [];
  private idleT = 0;

  private construirVida() {
    const bajo = this.calidadBaja;
    this.escena.add(this.vidaGrupo);
    // SATÉLITES con paneles solares: órbitas inclinadas distintas, giran
    // sobre sí mismos mientras rodean el planeta
    const nSat = bajo ? 2 : 3;
    for (let i = 0; i < nSat; i++) {
      const pivote = new THREE.Group();
      pivote.rotation.set(0.38 + i * 0.52, i * 2.1, 0.3 - i * 0.24);
      const g = new THREE.Group();
      const cuerpo = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.052),
        new THREE.MeshStandardMaterial({ color: 0xbfe4ff, emissive: 0x3a6a8f, emissiveIntensity: 1.0, metalness: 0.6, roughness: 0.3 }),
      );
      const matPanel = new THREE.MeshStandardMaterial({ color: 0x1a3a6a, emissive: 0x2a5a9f, emissiveIntensity: 0.55, metalness: 0.7, roughness: 0.25 });
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.007, 0.05), matPanel);
      p1.position.x = 0.105;
      const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.007, 0.05), matPanel);
      p2.position.x = -0.105;
      g.add(cuerpo, p1, p2);
      g.position.set(2.75 + i * 0.36, 0, 0);
      pivote.add(g);
      this.vidaGrupo.add(pivote);
      this.orbitas.push({ pivote, g, vel: 0.21 - i * 0.05, fase: i * 1.7 });
    }
    // JETS DE GUERRA: patrullas lejanas con luz de navegación latiendo
    const nJets = bajo ? 1 : 2;
    for (let i = 0; i < nJets; i++) {
      const pivote = new THREE.Group();
      pivote.rotation.set(1.12 + i * 0.42, i * 3.3, -0.5 + i * 0.3);
      const g = new THREE.Group();
      const cuerpo = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.1, 6), new THREE.MeshBasicMaterial({ color: 0x9ab4c8 }));
      cuerpo.rotation.x = Math.PI / 2;
      const luz = new THREE.MeshBasicMaterial({ color: 0xff5a4a, transparent: true, opacity: 0.9 });
      const farol = new THREE.Mesh(new THREE.SphereGeometry(0.013, 6, 6), luz);
      farol.position.z = 0.052;
      g.add(cuerpo, farol);
      g.position.set(5.4 + i * 1.5, 0, 0);
      pivote.add(g);
      this.vidaGrupo.add(pivote);
      this.jets.push({ pivote, g, luz, vel: 0.05 + i * 0.021 });
    }
    // COMETAS: estelas efímeras que cruzan el cielo profundo (pool de 2)
    const nCom = bajo ? 1 : 2;
    for (let i = 0; i < nCom; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      const m = new THREE.LineBasicMaterial({ color: 0xffe9c4, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const line = new THREE.Line(geo, m);
      line.frustumCulled = false;
      line.visible = false;
      this.vidaGrupo.add(line);
      this.cometas.push(line);
      this.cometaDatos.push(null);
    }
    // DRONES GUARDIANES de la Casa (escritorio): tres centinelas orbitando
    if (!bajo) {
      for (let i = 0; i < 3; i++) {
        const g = new THREE.Group();
        const nucleo = new THREE.Mesh(
          new THREE.TetrahedronGeometry(0.032),
          new THREE.MeshBasicMaterial({ color: 0x7ab8ff, transparent: true, opacity: 0.85 }),
        );
        const aro = new THREE.Mesh(
          new THREE.TorusGeometry(0.055, 0.004, 6, 18),
          new THREE.MeshBasicMaterial({ color: 0x7ab8ff, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }),
        );
        g.add(nucleo, aro);
        g.visible = false;
        this.vidaGrupo.add(g);
        this.dronesCasa.push({ g, r: 0.92 + i * 0.14, vel: 0.42 - i * 0.09, fase: i * 2.09, y: 0.24 - i * 0.2 });
      }
    }
  }

  private lanzarCometa(i: number) {
    const d = this.cometaDatos[i];
    const line = this.cometas[i];
    if (!d || !line) return;
    // nace en la cáscara lejana y cruza tangencialmente — jamás hacia el planeta
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const r = 14 + Math.random() * 8;
    d.ini.set(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th));
    d.dir.set(Math.random() - 0.5, (Math.random() - 0.5) * 0.5, Math.random() - 0.5).normalize().multiplyScalar(9 + Math.random() * 6);
    d.vida = 1.1 + Math.random() * 0.6;
    d.t = 0;
    line.visible = true;
  }

  private ticVida(t: number, dt: number) {
    // satélites: órbita + giro propio + cabeceo
    for (const s of this.orbitas) {
      s.pivote.rotation.y += dt * s.vel;
      s.g.rotation.y = t * 0.85 + s.fase;
      s.g.rotation.x = Math.sin(t * 0.5 + s.fase) * 0.3;
    }
    // jets: patrulla + farol de navegación latiendo
    for (const j of this.jets) {
      j.pivote.rotation.y += dt * j.vel;
      j.g.rotation.z = Math.sin(t * 1.4 + j.vel * 30) * 0.18;
      j.luz.opacity = 0.3 + (Math.sin(t * 5.5 + j.vel * 40) * 0.5 + 0.5) * 0.65;
    }
    // cometas: vidas cruzadas en el cielo profundo
    if (this.cometaSiguiente > 0) this.cometaSiguiente -= dt;
    else {
      const libre = this.cometaDatos.findIndex((d) => !d);
      if (libre >= 0) {
        this.cometaDatos[libre] = { ini: new THREE.Vector3(), dir: new THREE.Vector3(), vida: 1, t: 0 };
        this.lanzarCometa(libre);
      }
      this.cometaSiguiente = 6 + Math.random() * 9;
    }
    for (let i = 0; i < this.cometas.length; i++) {
      const d = this.cometaDatos[i];
      if (!d) continue;
      d.t += dt;
      const k = d.t / d.vida;
      if (k >= 1) {
        this.cometas[i].visible = false;
        (this.cometas[i].material as THREE.LineBasicMaterial).opacity = 0;
        this.cometaDatos[i] = null;
        continue;
      }
      const pos = this.cometas[i].geometry.getAttribute("position") as THREE.BufferAttribute;
      const mx = d.ini.x + d.dir.x * k, my = d.ini.y + d.dir.y * k, mz = d.ini.z + d.dir.z * k;
      const largo = 1.7 * (1 - k * 0.55);
      const nl = d.dir.length();
      pos.setXYZ(0, mx, my, mz);
      pos.setXYZ(1, mx - (d.dir.x / nl) * largo, my - (d.dir.y / nl) * largo, mz - (d.dir.z / nl) * largo);
      pos.needsUpdate = true;
      (this.cometas[i].material as THREE.LineBasicMaterial).opacity = Math.sin(Math.PI * k) * 0.7;
    }
    // drones guardianes: giran alrededor de la Casa cuando está acoplada
    if (this.dronesCasa.length) {
      const activos = this.capsulaAcoplada && this.consolaVisibleFin && !!this.capsula;
      for (const d of this.dronesCasa) {
        d.g.visible = activos;
        if (!activos || !this.capsula) continue;
        const a = t * d.vel + d.fase;
        d.g.position.set(
          this.capsula.position.x + Math.cos(a) * d.r,
          this.capsula.position.y + d.y + Math.sin(t * 1.6 + d.fase) * 0.05,
          this.capsula.position.z + Math.sin(a) * d.r,
        );
        d.g.rotation.y = -a;
      }
    }
    // la baliza: sigue a la Casa y late para ser vista desde lejos
    if (this.balizaOn && this.balizaCrono && this.capsula) {
      this.balizaCrono.position.set(this.capsula.position.x, this.capsula.position.y + 0.92, this.capsula.position.z);
      if (this.balizaMat) this.balizaMat.opacity = 0.14 + (Math.sin(t * 3.4) * 0.5 + 0.5) * 0.3;
    }
  }

  // v157 — LA RESPIRACIÓN DEL PILOTO: quieto más de 6s, la cámara flota
  // (cabeceo suave + alabeo mínimo) — el universo se siente VIVO incluso
  // sin tocar nada. Cualquier entrada la apaga al instante.
  private respiracionIdle(t: number) {
    if (this.idleT <= 6 || !this.libreOK()) return;
    const k = Math.min(1, (this.idleT - 6) / 4);
    this.camara.lookAt(this.mirada.x, this.mirada.y + Math.sin(t * 0.5) * 0.014 * k, this.mirada.z);
    this.camara.rotateZ(Math.sin(t * 0.33 + 0.8) * 0.0045 * k);
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
  // v148 «MUNDOS SEPARADOS» — mandato del Dueño («cada sección Vanguard
  // tendrá su propio mundo 3D y no ligarlas todas» + «hay muchas secciones
  // en un solo»): se ABOLió el `modo ||` que en MODO MUNDO encendía los 4
  // mundos de zona a la vez (el universo entero renderizando = el lag que
  // mataba el móvil). Ahora CADA sección muestra SOLO su mundo: entrar a
  // Economía es estar en el mundo de Economía, nada más existe alrededor.
  visibleZona(zona: number) {
    // v159: con la sala héroe en móvil, el mundo de zona NO existe — la
    // zona efectiva es 0 (planeta desnudo): nada compite con el módulo
    const zEf = this.salaHeroMovil ? 0 : zona;
    for (const z of [1, 2, 3, 4]) {
      const g = this.mundosZona[z];
      if (!g) continue;
      const debe = z === zEf;
      if (debe && !g.visible) {
        g.visible = true;
        g.scale.setScalar(0.84);
        this.animarP(g.scale, { x: 1, y: 1, z: 1 }, 850, { ease: easeOut });
      } else if (!debe) g.visible = false;
    }
    for (const tz of this.titulosZona) tz.grupo.visible = tz.zona === zEf && zEf !== 0;
    // los portales (anillos de navegación) solo viven en la vista de la
    // ESTACIÓN (zona 1): ni en el planeta desnudo ni dentro de otra sala
    const portalesOn = zEf === 1;
    for (const p of this.portales) {
      p.grupo.visible = portalesOn;
      p.etiqueta.visible = portalesOn;
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
    // v148: EL CASCO DEL PILOTO nace con la fuente — el HUD de geometría
    // real que mata los últimos DOM fijos (temporada/combo/cabecera)
    if (!this.hud3D) {
      try {
        this.hud3D = construirHud3D({ fuente: f, calidadBaja: this.calidadBaja, movil: this.esMovil() });
        this.escena.add(this.hud3D.grupo);
        this.hud3D.grupo.visible = false; // despierta al terminar la entrada
        this.proxiesHolo.push(...this.hud3D.proxies);
      } catch (e) { console.warn("[v148] hud3d fallo:", e); }
    }
    this.construirLetras3D();
    // v161 — FIX MÓVIL (QA qa-v161-09: revelados=0): la ciudad puede nacer
    // ANTES de que helvetiker llegue (red lenta) — nace MUDA: sin revelados,
    // sin contador y sin nombres. Con fuente a bordo: si la ciudad está
    // abierta se reconstruye EN VIVO; si no, queda marcada sucia para que
    // el próximo abrirCiudad la levante YA con voz.
    if (this.ciudadAbierta) {
      if (this.ciudadGrupo) this.destruirCiudad();
      this.construirCiudad();
      this.ciudadSucia = false;
      // la ciudad SIGUE abierta: el grupo nuevo nace apagado (g.visible=false
      // en construirCiudad) — hay que encenderlo o el piloto queda a ciegas
      if (this.ciudadGrupo) this.ciudadGrupo.visible = true;
      // y el VACÍO LIMPIO se reaplica: el cielo nuevo nace con uOp=0 (se vería
      // el amanecer ámbar del mundo detrás — qa-v161-10), hay que encenderlo
      this.animarCielo(1);
    } else {
      this.ciudadSucia = true;
    }
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
  // v154 — LA CIUDAD-MENÚ: la Casa envía el catálogo de secciones
  onCiudadCatalogoEv = (e: Event) => {
    const d = (e as CustomEvent).detail;
    if (!d || !Array.isArray(d.secciones)) return;
    this.ciudadCatalogo = d.secciones as SeccionCiudad[];
    this.ciudadSucia = true;
    // v159 EL ATERRIZAJE: si el boot pidió la ciudad antes del catálogo, nace AHORA
    if (this.ciudadPendiente && !this.ciudadAbierta) {
      this.ciudadPendiente = false;
      this.abrirCiudad();
      return;
    }
    if (this.ciudadAbierta) { this.cerrarCiudad(true); this.abrirCiudad(); }
  };
  onCiudadToggleEv = () => {
    if (this.ciudadAbierta) this.cerrarCiudad();
    else this.abrirCiudad();
  };

  setPestanasHolo(lista: DatosPestana[], activa: string) {
    const nuevaLlave = JSON.stringify([lista, activa]);
    if (nuevaLlave === this.llavePuente.split("|§|")[0]) return; // cero churn
    this.llavePuente = `${nuevaLlave}|§|${this.llavePuente.split("|§|")[1] ?? ""}`;
    this.consolaDatos = { pestanas: lista.slice(0, 9), activa };
    // v154: el fondo del universo lava con el color de la sección activa
    // («el fondo puede cambiar de color dependiendo») y la ciudad se recoge
    // si estabas eligiendo un edificio (entraste a una sección)
    const act = lista.find((x) => x.key === activa);
    if (act?.color) { try { this.tinteObjetivo.set(act.color); } catch { /* color inválido */ } }
    // v158: entraste a un módulo desde la ciudad → el REGRESO es un vuelo
    // (no un teletransporte): la cámara desciende a la Casa y la ciudad queda atrás
    if (this.ciudadAbierta) this.cerrarCiudad(false);
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
    // v159 INTRO BRILLANTE: durante la ceremonia el sol acompaña a la cámara
    // — el globo muestra su CARA ILUMINADA (antes el piloto móvil veía un
    // disco casi negro); al aterrizar el sol vuelve a su órbita fija
    if (this.luzDir) {
      if (!fin) this.luzDir.position.copy(this.camara.position).add(_vA.set(0.4, 0.8, 0.6));
      else this.luzDir.position.set(5, 2.4, 4);
    }
    // v148: con el casco vivo, el chrome DOM fijo se aparta (CSS data-wgl-hud)
    if (fin) document.documentElement.setAttribute("data-wgl-hud", "1");
    else document.documentElement.removeAttribute("data-wgl-hud");
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

  // ════════════════════════════════════════════════════════════════
  // v158 — LA CIUDAD-MENÚ. El menú de Vanguard deja de ser un panel:
  // es una CIUDAD de secciones ALTA EN EL ESPACIO. Cada sección es un
  // edificio con su figura 3D propia y su nombre en letras extruidas;
  // tocas un edificio y ENTRAS a su mundo. La ciudad NO pega a la
  // cámara (es un lugar fijo del universo — nada sigue al piloto):
  // abrir el menú VUELA hasta ella, y cerrar VUELA de regreso a la Casa.
  // ════════════════════════════════════════════════════════════════

  // despiece total (geometrías propias de la ciudad + materiales)
  private destruirCiudad() {
    if (this.ciudadGrupo) {
      this.escena.remove(this.ciudadGrupo);
      this.ciudadGrupo.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
      this.ciudadGrupo = null;
    }
    this.ciudadEdificios = [];
    this.ciudadPlateMats = [];
    this.ciudadTituloMat = null;
    this.proxiesCiudad = [];
    this.ciudadVehiculos = [];
    this.ciudadLampMats = [];
    this.ciudadVentanaMats = [];
    this.ciudadCielo = null;
    this.ciudadCieloMat = null;
    this.ciudadEmblema = null;
    this.ciudadBeaconMat = null;
    this.ciudadAroA = null;
    this.ciudadAroB = null;
    this.cerrarPregunta();
    this.ciudadRevelados = [];
    this.ciudadHallados = 0;
    this.ciudadHallaGrupo = null;
    this.ciudadOcultos = [];
    this.ciudadReveladosVivos = [];
    this.ciudadRecompensada = false;
    // v162 — la MEGAPÓLIS se desmonta entera (los grupos viajan dentro de
    // ciudadGrupo: el traverse de arriba ya dispuso geometrías/materiales)
    this.ciudadTotems = [];
    this.ciudadSlabs = [];
    this.ciudadCrownes = [];
    this.ciudadColisTotems = [];
    this.ciudadRotulo = null;
    this.ciudadRotuloPlaca = null;
    this.ciudadRotuloTexto = null;
    this.ciudadRotuloNombre = "";
    this.ciudadRotuloColor = 0;
    // v163 — las decoraciones viajan dentro de ciudadGrupo (traverse dispone)
    this.ciudadDecor = [];
    this.ciudadBlinkers = [];
    // v164 — el teletipo viaja dentro de ciudadGrupo (dispose del traverse)
    this.ciudadTeletipo = null;
    this.ciudadTeletipoTexto = null;
    this.ciudadTeletipoAlerta = null;
  }

  // v159 — cirugía de dispose: geometrías y materiales PROPIOS de un grupo
  // (prompt y textos reconstruidos) — nunca toca materiales compartidos
  private eliminarRecursos(o: THREE.Object3D) {
    o.traverse((n) => {
      const m = n as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else if (mat) mat.dispose();
    });
  }

  // v163 — LAS DECORACIONES DEL MÓDULO: 3 piezas temáticas (2 en lite) que
  // orbitan cada torre DENTRO del vacío negro — el fondo nunca está vacío y
  // cada distrito se delata por lo que vuela a su lado. Piezas pequeñas
  // (≤0.26), a radio 1.15–1.5 (fuera del cuerpo y del rótulo), sin proxies:
  // no roban toques. El grupo entero gira despacio en ticCiudad.
  private decoracionModulo(key: string, matHi: THREE.Material, matGlow: THREE.Material, lite: boolean): THREE.Group {
    const g = new THREE.Group();
    const matOsc = new THREE.MeshStandardMaterial({ color: 0x0b1526, metalness: 0.7, roughness: 0.4 });
    const caja = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
    const nueva = (x: number, y: number, z: number) => {
      const p = new THREE.Group();
      p.position.set(x, y, z);
      g.add(p);
      return p;
    };
    const poner = (p: THREE.Group, geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      mesh.scale.set(sx, sy, sz);
      p.add(mesh);
      return mesh;
    };
    // LOS TRES PUESTOS fijos alrededor de la torre (el 3º solo escritorio)
    const s1: [number, number, number] = [1.32, 1.62, 0.30];
    const s2: [number, number, number] = [-1.24, 2.02, -0.44];
    const s3: [number, number, number] = [0.42, 2.30, -1.34];
    switch (key) {
      case "inicio": { // LA BASE: bandera + casa mascota + aro de llegada
        const p = nueva(...s1);
        poner(p, new THREE.CylinderGeometry(0.008, 0.008, 0.24, 5), matOsc, 0, 0.12, 0);
        poner(p, caja(0.12, 0.07, 0.012), matHi, 0.062, 0.2, 0);
        const q = nueva(...s2);
        poner(q, caja(0.14, 0.09, 0.11), matOsc, 0, 0.045, 0);
        poner(q, new THREE.ConeGeometry(0.1, 0.08, 4), matHi, 0, 0.13, 0, 0, Math.PI / 4, 0);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, new THREE.TorusGeometry(0.09, 0.012, 6, 14), matGlow, 0, 0, 0, Math.PI / 2.4, 0.4, 0);
        }
        break;
      }
      case "inteligencia": { // OSINT: satélite espía + plato radar + blip
        const p = nueva(...s1);
        poner(p, caja(0.09, 0.05, 0.13), matOsc, 0, 0, 0);
        poner(p, caja(0.14, 0.002, 0.06), matHi, 0.14, 0, 0);
        poner(p, caja(0.14, 0.002, 0.06), matHi, -0.14, 0, 0);
        const q = nueva(...s2);
        poner(q, new THREE.CylinderGeometry(0.006, 0.01, 0.1, 5), matOsc, 0, 0.05, 0);
        poner(q, new THREE.TorusGeometry(0.08, 0.012, 6, 16), matHi, 0, 0.12, 0, -0.8, 0, 0);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, new THREE.SphereGeometry(0.026, 6, 6), matGlow, 0, 0, 0);
          poner(r, new THREE.TorusGeometry(0.06, 0.006, 6, 12), matGlow, 0, 0, 0, 0.6, 0.3, 0);
        }
        break;
      }
      case "hangar": { // SIMULADORES: caza en miniatura + cajas de carga
        const p = nueva(...s1);
        poner(p, new THREE.ConeGeometry(0.045, 0.2, 6), matOsc, 0, 0, 0, Math.PI / 2, 0, 0);
        poner(p, caja(0.16, 0.008, 0.05), matHi, 0, 0, -0.02);
        const q = nueva(...s2);
        poner(q, caja(0.1, 0.08, 0.1), matOsc, 0.03, 0.04, 0, 0, 0.4, 0);
        poner(q, caja(0.09, 0.07, 0.09), matHi, -0.05, 0.115, 0.02, 0, -0.3, 0);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, new THREE.TorusGeometry(0.08, 0.01, 6, 14), matGlow, 0, 0, 0, 1.2, 0, 0);
        }
        break;
      }
      case "juego": { // DUELOS: dado + trofeo + estrella
        const p = nueva(...s1);
        poner(p, caja(0.11, 0.11, 0.11), matOsc, 0, 0.055, 0, 0.3, 0.5, 0.2);
        poner(p, caja(0.03, 0.03, 0.004), matGlow, 0, 0.055, 0.058, 0.3, 0.5, 0.2);
        const q = nueva(...s2);
        poner(q, new THREE.CylinderGeometry(0.05, 0.07, 0.03, 10), matHi, 0, 0.015, 0);
        poner(q, new THREE.SphereGeometry(0.05, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), matHi, 0, 0.03, 0, Math.PI, 0, 0);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, new THREE.OctahedronGeometry(0.07, 0), matGlow, 0, 0, 0);
        }
        break;
      }
      case "mercado": { // TIENDA: moneda + gema + caja de mercancía
        const p = nueva(...s1);
        poner(p, new THREE.CylinderGeometry(0.09, 0.09, 0.018, 16), matHi, 0, 0, 0, Math.PI / 2.4, 0, 0);
        const q = nueva(...s2);
        poner(q, new THREE.OctahedronGeometry(0.075, 0), matGlow, 0, 0.08, 0);
        poner(q, caja(0.1, 0.07, 0.1), matOsc, 0, -0.06, 0);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, caja(0.11, 0.08, 0.11), matOsc, 0, 0, 0, 0, 0.6, 0);
          poner(r, caja(0.115, 0.012, 0.02), matHi, 0, 0.01, 0.05, 0, 0.6, 0);
        }
        break;
      }
      case "archivo": { // EXPEDIENTES: carpetas desclasificadas + sello
        const p = nueva(...s1);
        poner(p, caja(0.16, 0.012, 0.11), matOsc, 0, 0, 0, 0, 0, 0.16);
        poner(p, caja(0.16, 0.012, 0.11), matHi, 0.01, 0.018, 0, 0, 0, -0.1);
        const q = nueva(...s2);
        poner(q, new THREE.TorusGeometry(0.07, 0.014, 6, 14), matGlow, 0, 0, 0, 0.7, 0.2, 0);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, caja(0.12, 0.02, 0.09), matOsc, 0, 0, 0, 0.2, 0.5, -0.12);
        }
        break;
      }
      case "comando": { // MANDO: diana + flecha de orden
        const p = nueva(...s1);
        poner(p, new THREE.TorusGeometry(0.09, 0.012, 6, 18), matHi, 0, 0, 0);
        poner(p, new THREE.SphereGeometry(0.028, 8, 8), matGlow, 0, 0, 0);
        const q = nueva(...s2);
        poner(q, new THREE.ConeGeometry(0.05, 0.13, 6), matHi, 0, 0, 0, 0, 0, -Math.PI / 2);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, new THREE.TorusGeometry(0.05, 0.008, 6, 12), matGlow, 0, 0, 0, 0.4, 0.6, 0);
        }
        break;
      }
      case "observatorio": { // PREDICCIONES: cúpula + telescopio + estrella
        const p = nueva(...s1);
        poner(p, new THREE.SphereGeometry(0.1, 10, 8), matOsc, 0, 0.04, 0, 0, 0, 0, 1, 0.66, 1);
        poner(p, new THREE.CylinderGeometry(0.02, 0.026, 0.16, 7), matHi, 0.05, 0.12, 0, 0, 0, -0.85);
        const q = nueva(...s2);
        poner(q, new THREE.OctahedronGeometry(0.055, 0), matGlow, 0, 0, 0);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, new THREE.TorusGeometry(0.07, 0.01, 6, 14), matHi, 0, 0, 0, 0.9, 0.3, 0);
        }
        break;
      }
      case "estrategia": { // MAPAS: tablero + dos banderitas de frente
        const p = nueva(...s1);
        poner(p, caja(0.2, 0.008, 0.14), matOsc, 0, 0, 0, 0.35, 0.2, 0);
        poner(p, caja(0.006, 0.07, 0.006), matHi, -0.05, 0.04, 0.02, 0.35, 0.2, 0);
        poner(p, caja(0.04, 0.025, 0.006), matGlow, -0.032, 0.066, 0.028, 0.35, 0.2, 0);
        const q = nueva(...s2);
        poner(q, caja(0.006, 0.06, 0.006), matOsc, 0, 0.03, 0);
        poner(q, caja(0.035, 0.022, 0.006), matHi, 0.018, 0.05, 0);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, caja(0.14, 0.006, 0.1), matOsc, 0, 0, 0, -0.3, -0.4, 0);
        }
        break;
      }
      case "emisora": { // EMISORA: altavoz + ondas de audio
        const p = nueva(...s1);
        poner(p, caja(0.1, 0.13, 0.07), matOsc, 0, 0.06, 0);
        poner(p, new THREE.ConeGeometry(0.03, 0.02, 10), matGlow, 0, 0.06, 0.038, Math.PI / 2, 0, 0);
        const q = nueva(...s2);
        poner(q, new THREE.TorusGeometry(0.06, 0.007, 6, 14), matHi, 0, 0, 0, 0.5, 0.2, 0);
        poner(q, new THREE.TorusGeometry(0.11, 0.007, 6, 14), matHi, 0, 0.03, 0, 0.5, 0.2, 0);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, new THREE.SphereGeometry(0.022, 6, 6), matGlow, 0, 0, 0);
        }
        break;
      }
      case "oscsuro": { // VERDAD CRUDA: monolitos rotos + ojo encendido
        const p = nueva(...s1);
        poner(p, new THREE.ConeGeometry(0.05, 0.2, 4), matOsc, 0, 0.1, 0, 0.15, 0.4, -0.1);
        const q = nueva(...s2);
        poner(q, caja(0.07, 0.16, 0.05), matOsc, 0, 0.08, 0, 0, -0.3, 0.12);
        poner(q, new THREE.SphereGeometry(0.02, 6, 6), matGlow, 0.01, 0.11, 0.028);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, new THREE.ConeGeometry(0.04, 0.14, 4), matOsc, 0, 0.07, 0, -0.2, 0.9, 0.15);
        }
        break;
      }
      case "creadores": { // MEMES: prisma + brotes de pintura
        const p = nueva(...s1);
        poner(p, new THREE.OctahedronGeometry(0.09, 0), matHi, 0, 0.09, 0);
        const q = nueva(...s2);
        poner(q, new THREE.SphereGeometry(0.032, 8, 8), matGlow, -0.05, 0, 0);
        poner(q, new THREE.SphereGeometry(0.026, 8, 8), matHi, 0.05, 0.03, 0.02);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, new THREE.OctahedronGeometry(0.05, 0), matGlow, 0, 0.05, 0);
        }
        break;
      }
      case "social": { // FOROS: red de nodos conectados
        const p = nueva(...s1);
        poner(p, new THREE.SphereGeometry(0.032, 8, 8), matHi, -0.07, 0.02, 0);
        poner(p, new THREE.SphereGeometry(0.032, 8, 8), matHi, 0.07, 0.02, 0);
        poner(p, new THREE.SphereGeometry(0.036, 8, 8), matGlow, 0, 0.11, 0);
        poner(p, new THREE.CylinderGeometry(0.005, 0.005, 0.14, 5), matOsc, 0, 0.065, 0, 0, 0, Math.PI / 2.1);
        poner(p, new THREE.CylinderGeometry(0.005, 0.005, 0.13, 5), matOsc, -0.035, 0.06, 0, 0, 0, -Math.PI / 2.4);
        const q = nueva(...s2);
        poner(q, new THREE.TorusGeometry(0.075, 0.008, 6, 16), matHi, 0, 0, 0, 0.7, 0.3, 0);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, new THREE.SphereGeometry(0.026, 6, 6), matGlow, 0, 0, 0);
        }
        break;
      }
      case "sistema": { // AJUSTES: engranaje + escudo
        const p = nueva(...s1);
        poner(p, new THREE.TorusGeometry(0.08, 0.016, 6, 16), matOsc, 0, 0.08, 0);
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2;
          poner(p, caja(0.03, 0.03, 0.02), matOsc, Math.cos(a) * 0.095, 0.08 + Math.sin(a) * 0.095, 0);
        }
        poner(p, new THREE.SphereGeometry(0.024, 6, 6), matGlow, 0, 0.08, 0);
        const q = nueva(...s2);
        poner(q, new THREE.CylinderGeometry(0.07, 0.07, 0.016, 3), matHi, 0, 0.06, 0, 0.4, 0, 0);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, new THREE.TorusGeometry(0.06, 0.008, 6, 14), matGlow, 0, 0, 0, 1.1, 0.2, 0);
        }
        break;
      }
      case "experimental": { // LABORATORIO: matraz + burbujas imposibles
        const p = nueva(...s1);
        poner(p, new THREE.ConeGeometry(0.07, 0.14, 10), matOsc, 0, 0.07, 0);
        poner(p, new THREE.CylinderGeometry(0.012, 0.012, 0.06, 6), matHi, 0, 0.17, 0);
        poner(p, new THREE.SphereGeometry(0.028, 6, 6), matGlow, 0, 0.12, 0.03);
        const q = nueva(...s2);
        poner(q, new THREE.SphereGeometry(0.03, 8, 8), matGlow, -0.04, 0.02, 0);
        poner(q, new THREE.SphereGeometry(0.022, 8, 8), matHi, 0.05, 0.06, 0.02);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, new THREE.TorusGeometry(0.055, 0.009, 6, 14), matGlow, 0, 0, 0, 0.8, 0.5, 0);
        }
        break;
      }
      case "arquitecto": { // AUTOMATIZACIÓN: bloques flotando + gancho
        const p = nueva(...s1);
        poner(p, caja(0.09, 0.07, 0.09), matOsc, -0.03, 0.035, 0, 0, 0.3, 0);
        poner(p, caja(0.07, 0.06, 0.07), matHi, 0.05, 0.1, 0.02, 0, -0.2, 0);
        const q = nueva(...s2);
        poner(q, new THREE.CylinderGeometry(0.007, 0.007, 0.14, 5), matOsc, 0, 0.07, 0);
        poner(q, new THREE.ConeGeometry(0.03, 0.05, 6), matHi, 0, -0.02, 0, Math.PI, 0, 0);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, caja(0.08, 0.05, 0.08), matOsc, 0, 0, 0, 0, 0.8, 0.1);
        }
        break;
      }
      default: { // comodín: el octaedro Vanguard + satélite menor
        const p = nueva(...s1);
        poner(p, new THREE.OctahedronGeometry(0.085, 0), matHi, 0, 0.085, 0);
        const q = nueva(...s2);
        poner(q, caja(0.07, 0.04, 0.1), matOsc, 0, 0.02, 0);
        poner(q, caja(0.11, 0.002, 0.045), matGlow, 0, 0.02, 0);
        if (!lite) {
          const r = nueva(...s3);
          poner(r, new THREE.TorusGeometry(0.07, 0.01, 6, 14), matHi, 0, 0, 0, 0.6, 0.4, 0);
        }
        break;
      }
    }
    // EL CARRIL: un aro tenue marca la órbita de las piezas (solo escritorio)
    if (!lite) {
      const carril = new THREE.Mesh(
        new THREE.TorusGeometry(1.34, 0.006, 5, 40),
        new THREE.MeshBasicMaterial({ color: 0x3fd6ff, transparent: true, opacity: 0.13 }),
      );
      carril.rotation.x = -Math.PI / 2;
      carril.position.y = 1.9;
      g.add(carril);
    }
    return g;
  }

  // LA FIGURA PROPIA DE CADA SECCIÓN — 16 siluetas que se reconocen
  // de lejos: hangar, radar, casa, castillo, moneda, libro, diana,
  // telescopio, brújula, antena, monolito, prisma, red, escudo,
  // matraz y robot. Geometrías propias (el despiece es total).
  private figuraCiudad(key: string, matHi: THREE.Material, matBase: THREE.Material): THREE.Group {
    const g = new THREE.Group();
    const poner = (geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      mesh.scale.set(sx, sy, sz);
      g.add(mesh);
      return mesh;
    };
    const caja = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
    switch (key) {
      case "hangar": // la base 3D: nave con techo de sierra
        poner(caja(0.3, 0.16, 0.24), matBase, 0, 0.08, 0);
        poner(new THREE.ConeGeometry(0.17, 0.12, 4), matHi, 0, 0.22, 0, 0, Math.PI / 4, 0);
        break;
      case "inteligencia": // radar: plato + haz
        poner(new THREE.SphereGeometry(0.11, 10, 8), matBase, 0, 0.1, 0, 0, 0, 0, 1, 0.6, 1);
        poner(new THREE.TorusGeometry(0.13, 0.02, 6, 16), matHi, 0, 0.1, 0.02, -0.7, 0, 0);
        poner(new THREE.CylinderGeometry(0.014, 0.02, 0.14, 6), matBase, 0, 0.02, 0);
        break;
      case "inicio": // la casa: hogar dorado de Vanguard
        poner(caja(0.26, 0.14, 0.2), matBase, 0, 0.07, 0);
        poner(new THREE.ConeGeometry(0.2, 0.14, 4), matHi, 0, 0.2, 0, 0, Math.PI / 4, 0);
        break;
      case "juego": // el castillo: dos torres y muralla
        poner(new THREE.CylinderGeometry(0.05, 0.06, 0.24, 8), matBase, -0.11, 0.12, 0);
        poner(new THREE.CylinderGeometry(0.05, 0.06, 0.24, 8), matBase, 0.11, 0.12, 0);
        poner(caja(0.3, 0.12, 0.1), matHi, 0, 0.06, 0);
        break;
      case "mercado": // la moneda de pie
        poner(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 16), matHi, 0, 0.13, 0, Math.PI / 2, 0, 0);
        poner(new THREE.TorusGeometry(0.13, 0.018, 6, 18), matBase, 0, 0.13, 0);
        break;
      case "archivo": // el libro abierto
        poner(caja(0.24, 0.03, 0.17), matBase, -0.11, 0.06, 0, 0, 0, 0.28);
        poner(caja(0.24, 0.03, 0.17), matHi, 0.11, 0.06, 0, 0, 0, -0.28);
        break;
      case "comando": // la diana del mando diario
        poner(new THREE.TorusGeometry(0.13, 0.02, 6, 18), matHi, 0, 0.14, 0);
        poner(caja(0.3, 0.016, 0.016), matBase, 0, 0.14, 0);
        poner(caja(0.016, 0.3, 0.016), matBase, 0, 0.14, 0);
        poner(new THREE.SphereGeometry(0.032, 8, 8), matHi, 0, 0.14, 0);
        break;
      case "observatorio": // el telescopio bajo la cúpula
        poner(new THREE.SphereGeometry(0.12, 10, 8), matBase, 0, 0.09, 0, 0, 0, 0, 1, 0.72, 1);
        poner(new THREE.CylinderGeometry(0.028, 0.036, 0.24, 8), matHi, 0.05, 0.2, 0, 0, 0, -0.9);
        break;
      case "estrategia": // la brújula táctica
        poner(new THREE.OctahedronGeometry(0.11, 0), matHi, 0, 0.13, 0);
        poner(new THREE.TorusGeometry(0.15, 0.014, 6, 18), matBase, 0, 0.13, 0, 0.5, 0.4, 0);
        break;
      case "emisora": // la antena con ondas
        poner(new THREE.CylinderGeometry(0.012, 0.02, 0.3, 6), matBase, 0, 0.15, 0);
        poner(new THREE.TorusGeometry(0.07, 0.008, 6, 14), matHi, 0, 0.2, 0);
        poner(new THREE.TorusGeometry(0.12, 0.008, 6, 14), matHi, 0, 0.26, 0);
        break;
      case "oscsuro": // el monolito de la verdad cruda
        poner(caja(0.14, 0.26, 0.1), matBase, 0, 0.13, 0);
        poner(new THREE.SphereGeometry(0.024, 6, 6), matHi, -0.04, 0.18, 0.05);
        poner(new THREE.SphereGeometry(0.024, 6, 6), matHi, 0.04, 0.18, 0.05);
        break;
      case "creadores": // el prisma de la creación
        poner(new THREE.OctahedronGeometry(0.13, 0), matHi, 0, 0.14, 0);
        poner(new THREE.OctahedronGeometry(0.06, 0), matBase, 0.14, 0.05, 0.06);
        break;
      case "social": // la red de la comunidad
        poner(new THREE.SphereGeometry(0.035, 8, 8), matHi, -0.1, 0.06, 0);
        poner(new THREE.SphereGeometry(0.035, 8, 8), matHi, 0.1, 0.06, 0);
        poner(new THREE.SphereGeometry(0.035, 8, 8), matHi, 0, 0.2, 0);
        poner(new THREE.CylinderGeometry(0.007, 0.007, 0.2, 5), matBase, 0, 0.1, 0, 0, 0, Math.PI / 2.6);
        poner(new THREE.CylinderGeometry(0.007, 0.007, 0.2, 5), matBase, -0.05, 0.13, 0, 0, 0, -Math.PI / 2.6);
        break;
      case "sistema": // el escudo del sistema
        poner(new THREE.CylinderGeometry(0.13, 0.13, 0.035, 14), matBase, 0, 0.12, 0, 0, 0, 0, 1, 1, 0.5);
        poner(new THREE.OctahedronGeometry(0.06, 0), matHi, 0, 0.13, 0.03);
        break;
      case "experimental": // el matraz de los imposibles
        poner(new THREE.ConeGeometry(0.1, 0.2, 10), matBase, 0, 0.1, 0);
        poner(new THREE.SphereGeometry(0.035, 8, 8), matHi, 0, 0.22, 0);
        break;
      case "arquitecto": // el robot que construye solo
        poner(caja(0.15, 0.11, 0.11), matBase, 0, 0.09, 0);
        poner(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 5), matHi, 0, 0.2, 0);
        poner(new THREE.SphereGeometry(0.024, 8, 8), matHi, 0, 0.26, 0);
        break;
      default: // la silueta comodín: el octaedro Vanguard
        poner(new THREE.OctahedronGeometry(0.12, 0), matHi, 0, 0.13, 0);
        break;
    }
    return g;
  }

  // ══════════════════════════════════════════════════════════════════
  // v158 — LA CIUDAD REAL. El menú de Vanguard es una METRÓPOLIS de
  // verdad, anclada ALTO en el espacio (nunca mezclada con el planeta ni
  // con las salas): una AVENIDA central ordenada, calles transversales,
  // y UN EDIFICIO ÚNICO POR MÓDULO a cada lado — cada uno con su torre,
  // su silueta 3D, su nombre extruido mirando a la avenida, sus ventanas
  // que parpadean y su aro de aterrizaje. Puerta monumental, plaza con
  // el emblema girando, farolas que laten y naves que patrullan el eje.
  // El piloto VUELA hasta ella (viaje visible), la recorre en vuelo libre
  // y toca un edificio para ENTRAR a su módulo. Nada flota pegado a la
  // cámara: la ciudad es un LUGAR, no un cartel.
  // ══════════════════════════════════════════════════════════════════
  private construirCiudad() {
    const cat = this.ciudadCatalogo;
    if (!cat.length) return;
    const movil = this.esMovil();
    const g = new THREE.Group();
    g.visible = false;
    g.position.copy(CIUDAD_CENTRO);
    g.scale.setScalar(movil ? 0.6 : 1);
    this.ciudadGrupo = g;
    this.ciudadEdificios = [];
    this.ciudadPlateMats = [];
    this.ciudadTituloMat = null;
    this.proxiesCiudad = [];
    this.ciudadVehiculos = [];
    this.ciudadLampMats = [];
    this.ciudadVentanaMats = [];
    this.ciudadEmblema = null;
    this.ciudadBeaconMat = null;
    this.ciudadAroA = null;
    this.ciudadAroB = null;
    // v162 — reset de la MEGAPÓLIS (tótems, placas, rótulo, colisiones)
    this.ciudadTotems = [];
    this.ciudadSlabs = [];
    this.ciudadCrownes = [];
    this.ciudadColisTotems = [];
    this.ciudadRotulo = null;
    this.ciudadRotuloPlaca = null;
    this.ciudadRotuloTexto = null;
    this.ciudadRotuloNombre = "";
    this.ciudadDecor = [];
    this.ciudadBlinkers = [];

    // v159 — PALETA DEL VACÍO: suelo y calle casi negros — la luz la ponen
    // los neones y las ventanas, no el asfalto (fondo negro limpio)
    const matSuelo = new THREE.MeshStandardMaterial({ color: 0x070d18, emissive: 0x0a1226, emissiveIntensity: 0.55, metalness: 0.5, roughness: 0.62 });
    const matCalle = new THREE.MeshStandardMaterial({ color: 0x0b1426, emissive: 0x101d3c, emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.52 });
    const matNeon = new THREE.MeshBasicMaterial({ color: 0xf5c542, transparent: true, opacity: 0.85 });
    const matNeonCian = new THREE.MeshBasicMaterial({ color: 0x3fd6ff, transparent: true, opacity: 0.55 });
    const matPodio = new THREE.MeshStandardMaterial({ color: 0x0b1526, metalness: 0.7, roughness: 0.4 });
    const matPoste = new THREE.MeshStandardMaterial({ color: 0x0e1930, metalness: 0.6, roughness: 0.45 });
    const matProxy = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, depthTest: false });
    // LA VIDA: 4 piscinas de ventanas + 2 de farolas — laten por fases en ticCiudad
    this.ciudadVentanaMats = [0xffd76a, 0x9fd8ff, 0xffc46a, 0xbfe4ff].map((c) =>
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.62 }));
    this.ciudadLampMats = [0xffd76a, 0x7ab8ff].map((c) =>
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.8 }));

    // ── EL SUELO: plataforma-isla sobre el vacío ──
    // v162 — la MEGAPÓLIS crece a los lados (12.6×16.2): junto a cada torre
    // se levanta su TÓTEM de módulos (todo el sitio vive en la ciudad)
    const suelo = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.3, 16.2), matSuelo);
    suelo.position.y = -0.15;
    g.add(suelo);
    const canto = new THREE.Mesh(
      new THREE.BoxGeometry(12.72, 0.05, 16.32),
      new THREE.MeshBasicMaterial({ color: 0x1d3a66, transparent: true, opacity: 0.5 }),
    );
    canto.position.y = -0.29;
    g.add(canto);

    // ── LA AVENIDA central + sus neones ──
    const avenida = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.06, 15.1), matCalle);
    avenida.position.y = 0.032;
    g.add(avenida);
    for (const sx of [-1, 1]) {
      const neon = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 14.9), matNeon);
      neon.position.set(sx * 0.9, 0.06, 0);
      g.add(neon);
    }

    // ── CALLES transversales — cada módulo separado por su callejón ──
    const zSlots = [4.4, 3.0, 1.6, 0.2, -1.2, -2.6, -4.0, -5.4];
    for (let i = 0; i < zSlots.length - 1; i++) {
      const zc = (zSlots[i] + zSlots[i + 1]) / 2;
      const calle = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.05, 0.62), matCalle);
      calle.position.set(0, 0.03, zc);
      g.add(calle);
      if (!this.calidadBaja && i % 2 === 0) {
        const luz = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.02, 0.03), matNeonCian);
        luz.position.set(0, 0.058, zc);
        g.add(luz);
      }
    }

    // ── v162 LAS CALLES LATERALES — la MEGAPÓLIS respira: dos avenidas
    // paralelas conectan las torres con sus tótems de módulos ──
    for (const sx of [-1, 1]) {
      const lateral = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 12.4), matCalle);
      lateral.position.set(sx * 3.45, 0.03, -0.5);
      g.add(lateral);
      if (!this.calidadBaja) {
        const neonL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 12.2), matNeonCian);
        neonL.position.set(sx * 3.45, 0.058, -0.5);
        g.add(neonL);
      }
    }

    // ── LOS EDIFICIOS — un módulo, una manzana, SIEMPRE el mismo sitio ──
    for (let i = 0; i < cat.length; i++) {
      const sec = cat[i];
      const nHex = parseInt(String(sec.color).replace("#", ""), 16);
      const hex = Number.isFinite(nHex) ? nHex : 0xf5c542;
      const lado = i % 2 === 0 ? 1 : -1;           // alternados: dos hileras parejas
      const x = lado * 2.2;
      const z = zSlots[i >> 1];
      const h = 0.74 + ((i * 7) % 4) * 0.15;       // alturas variadas pero fijas
      const ed = new THREE.Group();
      ed.position.set(x, 0, z);
      // manzana (acera) + aro de aterrizaje del color del módulo
      const acera = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.16, 1.18), matPodio);
      acera.position.y = 0.08;
      ed.add(acera);
      const aro = new THREE.Mesh(
        new THREE.TorusGeometry(0.58, 0.016, 6, 24),
        new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.45 }),
      );
      aro.rotation.x = -Math.PI / 2;
      aro.position.set(-lado * 0.36, 0.165, 0);
      ed.add(aro);
      // v163 — LA TORRE TALLADA: rascacielos de 3 CUERPOS con retranqueos
      // (base ancha, cintura, corona estrecha) + PORTAL de entrada con
      // dintel neón mirando a la avenida + ANTENA con baliza que parpadea.
      // Más edificio de verdad que el bloque único de la v160.
      const h1 = h * 0.46, h2 = h * 0.34, h3 = h - h1 - h2;
      const yBase = 0.16;
      const torreGeo = new THREE.BoxGeometry(0.94, h1, 0.94);
      const matTorre = new THREE.MeshStandardMaterial({ color: 0x14203a, emissive: hex, emissiveIntensity: 0.14, metalness: 0.78, roughness: 0.26 });
      const torre = new THREE.Mesh(torreGeo, matTorre);
      torre.position.y = yBase + h1 / 2;
      ed.add(torre);
      const cintura = new THREE.Mesh(new THREE.BoxGeometry(0.78, h2, 0.78), matTorre);
      cintura.position.y = yBase + h1 + h2 / 2;
      ed.add(cintura);
      const coronaCuerpo = new THREE.Mesh(new THREE.BoxGeometry(0.60, h3, 0.60), matTorre);
      coronaCuerpo.position.y = yBase + h1 + h2 + h3 / 2;
      ed.add(coronaCuerpo);
      // EL PORTAL — la puerta del módulo con su dintel encendido
      const matGlowT = new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.9 });
      const xF = -lado * 0.477;
      const puerta = new THREE.Mesh(new THREE.BoxGeometry(0.012, Math.min(0.17, h1 - 0.04), 0.24), matPodio);
      puerta.position.set(xF, yBase + Math.min(0.17, h1 - 0.04) / 2, 0);
      ed.add(puerta);
      for (const pz of [-0.16, 0.16]) {
        const pilar = new THREE.Mesh(new THREE.BoxGeometry(0.05, Math.min(0.22, h1 - 0.02), 0.06), matTorre);
        pilar.position.set(xF, yBase + Math.min(0.22, h1 - 0.02) / 2, pz);
        ed.add(pilar);
      }
      const dintel = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.032, 0.40), matGlowT);
      dintel.position.set(xF, yBase + Math.min(0.24, h1 - 0.03), 0);
      ed.add(dintel);
      // LA COLUMNA DE NEÓN por cuerpo — la espina que delata el módulo de noche
      const espina = new THREE.Mesh(new THREE.BoxGeometry(0.03, h1, 0.03), matGlowT);
      espina.position.set(0, yBase + h1 / 2, 0.472);
      ed.add(espina);
      const espina2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, h2, 0.03), matGlowT);
      espina2.position.set(0, yBase + h1 + h2 / 2, 0.392);
      ed.add(espina2);
      // LA CORONA luminosa sobre el cuerpo alto + la ANTENA con baliza
      const corona = new THREE.Mesh(
        new THREE.BoxGeometry(0.66, 0.035, 0.66),
        matGlowT,
      );
      corona.position.y = yBase + h + 0.017;
      ed.add(corona);
      const masto = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.017, 0.2, 5), matPoste);
      masto.position.set(0.2, yBase + h + 0.1, 0.2);
      ed.add(masto);
      const matCh = new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.3 });
      const chispa = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), matCh);
      chispa.position.set(0.2, yBase + h + 0.21, 0.2);
      ed.add(chispa);
      this.ciudadBlinkers.push(matCh);
      if (!this.calidadBaja) {
        const filo = new THREE.LineSegments(
          new THREE.EdgesGeometry(torreGeo),
          new THREE.LineBasicMaterial({ color: hex, transparent: true, opacity: 0.55 }),
        );
        filo.position.copy(torre.position);
        ed.add(filo);
      }
      // VENTANAS mirando a la avenida (piscinas compartidas que laten) —
      // v163: encajadas en CADA cuerpo — retícula en la base + cinta en la
      // cintura; nada flota fuera del edificio
      if (!this.calidadBaja) {
        const filas = h1 > 0.44 ? 3 : 2;
        for (let f = 0; f < filas; f++) {
          for (let c = 0; c < 3; c++) {
            const win = new THREE.Mesh(
              new THREE.BoxGeometry(0.012, 0.075, 0.11),
              this.ciudadVentanaMats[(i + f + c) % this.ciudadVentanaMats.length],
            );
            win.position.set(-lado * 0.477, yBase + 0.16 + f * 0.105, -0.26 + c * 0.26);
            ed.add(win);
          }
        }
        if (h2 > 0.26) {
          for (let c = 0; c < 2; c++) {
            const w2 = new THREE.Mesh(
              new THREE.BoxGeometry(0.012, 0.07, 0.1),
              this.ciudadVentanaMats[(i + 2) % this.ciudadVentanaMats.length],
            );
            w2.position.set(-lado * 0.393, yBase + h1 + h2 * 0.55, -0.15 + c * 0.3);
            ed.add(w2);
          }
        }
      }
      // LA FIGURA PROPIA — la silueta que delata el módulo de lejos
      const matHi = new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.26 });
      const fig = this.figuraCiudad(sec.key, matHi, matTorre);
      fig.scale.setScalar(movil ? 0.9 : 1.05);
      fig.position.y = 0.16 + h + 0.17;
      ed.add(fig);
      // v163 — LAS DECORACIONES DEL MÓDULO: el vacío negro alrededor de la
      // torre se puebla con 3 piezas temáticas que orbitan despacio (2 en
      // móvil) — cada distrito se reconoce por lo que vuela a su lado
      const dec = this.decoracionModulo(sec.key, matHi, matGlowT, this.calidadBaja);
      ed.add(dec);
      this.ciudadDecor.push({ g: dec, fase: i * 1.7 });
      // EL NOMBRE extruido — inclinado 45°: se lee volando por la avenida
      // Y también al llegar por la puerta (lección qa-v158-10)
      if (this.fuente && sec.label) {
        const t = this.hacerTexto3D(sec.label, { tam: 0.075, prof: 0.02, color: hex, emis: 0.95 });
        for (const l of t.letras) l.mesh.visible = true;
        const escP = Math.min(1, 1.18 / Math.max(t.ancho, 0.001));
        t.grupo.scale.setScalar(escP);
        t.grupo.rotation.y = -lado * Math.PI / 4;
        t.grupo.position.set(-lado * 0.58, 0.16 + h + 0.44, 0.5);
        ed.add(t.grupo);
        // v159 — RESPALDO del rótulo: placa oscura fina con filo del módulo —
        // el nombre se lee SIEMPRE, incluso contra el negro puro
        const placaR = new THREE.Mesh(
          new THREE.BoxGeometry(t.ancho * escP + 0.16, 0.15, 0.012),
          new THREE.MeshStandardMaterial({ color: 0x060b16, metalness: 0.7, roughness: 0.3, transparent: true, opacity: 0.82 }),
        );
        placaR.rotation.y = -lado * Math.PI / 4;
        placaR.position.set(-lado * 0.58, 0.16 + h + 0.44, 0.492);
        const filoR = new THREE.LineSegments(
          new THREE.EdgesGeometry(placaR.geometry),
          new THREE.LineBasicMaterial({ color: hex, transparent: true, opacity: 0.6 }),
        );
        filoR.raycast = () => {};
        placaR.add(filoR);
        ed.add(placaR);
        const plateMat = t.grupo.children.length ? ((t.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial) : null;
        if (plateMat) { plateMat.transparent = true; plateMat.opacity = 0; this.ciudadPlateMats.push(plateMat); }
        // v159 — LA LÍNEA DE SENTIDO: qué hay DENTRO, en una frase legible
        if (!this.calidadBaja) {
          const td = this.hacerTexto3D(DESCRIPCIONES_CIUDAD[sec.key] ?? "MUNDO 3D PROPIO", { tam: 0.041, prof: 0.012, color: 0xcfe0ff, emis: 0.5 });
          for (const l of td.letras) l.mesh.visible = true;
          if (td.grupo.children.length) ((td.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.85;
          const escD = Math.min(1, 1.34 / Math.max(td.ancho, 0.001));
          td.grupo.scale.setScalar(escD);
          td.grupo.rotation.y = -lado * Math.PI / 4;
          td.grupo.position.set(-lado * 0.56, 0.16 + h + 0.29, 0.5);
          ed.add(td.grupo);
        }
      }
      // EL PROXY — el edificio entero es un botón (v159: PREGUNTA antes de entrar)
      const proxy = new THREE.Mesh(new THREE.SphereGeometry(0.62, 8, 8), matProxy);
      proxy.position.y = 0.16 + h * 0.55;
      proxy.userData = { ciudad: { tab: sec.tabs?.[0]?.key ?? "", seccion: sec.key, nombre: sec.label, color: hex } };
      ed.add(proxy);
      this.proxiesCiudad.push(proxy);
      g.add(ed);
      this.ciudadEdificios.push({ grupo: ed, x0: x, y0: 0, z0: z, fase: (i * 1.31) % (Math.PI * 2), fig, plateMat: null, nacido: true });
    }

    // ── v162 LOS TÓTEMS DE MÓDULOS — la MEGAPÓLIS: TODO el sitio vive en
    // la ciudad. Junto a cada torre se levanta una columna de neón con una
    // PLACA por cada módulo de la sección (las 147 pestañas del sitio son
    // tocables): tocar una placa pregunta «¿ENTRAR?» y abre ESE módulo
    // exacto. Un solo RÓTULO compartido revela el nombre de la placa más
    // cercana al volar — 147 módulos legibles sin 147 letreros vivos.
    const matColT = new THREE.MeshStandardMaterial({ color: 0x0b1326, metalness: 0.75, roughness: 0.34 });
    for (let i = 0; i < cat.length; i++) {
      const sec = cat[i];
      if (!sec.tabs?.length) continue;
      const nHexT = parseInt(String(sec.color).replace("#", ""), 16);
      const hexT = Number.isFinite(nHexT) ? nHexT : 0xf5c542;
      const ladoT = i % 2 === 0 ? 1 : -1;
      const zT = zSlots[i >> 1];
      const tt = new THREE.Group();
      tt.position.set(ladoT * 4.35, 0, zT);
      // LA COLUMNA — espina dorsal del tótem
      const colT = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.1, 0.05), matColT);
      colT.position.y = 1.21;
      tt.add(colT);
      const colNeonT = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 2.1, 0.02),
        new THREE.MeshBasicMaterial({ color: hexT, transparent: true, opacity: 0.78 }),
      );
      colNeonT.position.set(0, 1.21, 0.032);
      tt.add(colNeonT);
      // LA CORONA — baliza del color de la sección, girando: delata el
      // tótem de lejos y guía el vuelo por las calles laterales
      const coronaT = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.075, 0),
        new THREE.MeshStandardMaterial({ color: hexT, emissive: hexT, emissiveIntensity: 0.6, metalness: 0.5, roughness: 0.26 }),
      );
      coronaT.position.y = 2.42;
      tt.add(coronaT);
      this.ciudadCrownes.push(coronaT);
      // LAS PLACAS — hasta 9 por columna × 2 columnas, compartiendo UN
      // material por sección (el despiece es barato y el latido es global)
      const matPlaca = new THREE.MeshStandardMaterial({ color: 0x0d1730, emissive: hexT, emissiveIntensity: 0.42, metalness: 0.7, roughness: 0.3 });
      const nP = Math.min(18, sec.tabs.length);
      for (let k = 0; k < nP; k++) {
        const colI = k < 9 ? 0 : 1;
        const fila = k % 9;
        const tb = sec.tabs[k];
        const pl = new THREE.Group();
        pl.position.set(colI === 0 ? -0.28 : 0.28, 0.62 + fila * 0.168, 0);
        const malla = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.115, 0.024), matPlaca);
        pl.add(malla);
        const proxyP = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), matProxy);
        proxyP.userData = { ciudad: { tab: tb.key, nombre: tb.label || sec.label, color: hexT } };
        pl.add(proxyP);
        this.proxiesCiudad.push(proxyP);
        tt.add(pl);
        // coordenadas LOCALES de ciudad para el rótulo de proximidad
        this.ciudadSlabs.push({ x: ladoT * 4.35 + (colI === 0 ? -0.28 : 0.28), y: 0.62 + fila * 0.168, z: zT, nombre: tb.label || sec.label, color: hexT, tab: tb.key });
      }
      g.add(tt);
      this.ciudadTotems.push({ g: tt, x0: ladoT * 4.35, y0: 0, z0: zT, nacido: true });
      this.ciudadColisTotems.push({ x0: ladoT * 4.35, z0: zT });
    }

    // ── v162 EL RÓTULO DE PROXIMIDAD — un SOLO texto compartido que se
    // re-escribe al volar: el módulo más cercano revela su nombre (la
    // escritura nace y muere por cirugía — cero fuga, cero coste)
    if (this.fuente) {
      const rg = new THREE.Group();
      rg.visible = false;
      this.ciudadRotulo = rg;
      this.ciudadRotuloPlaca = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.105, 0.008),
        new THREE.MeshStandardMaterial({ color: 0x050a14, metalness: 0.7, roughness: 0.3, transparent: true, opacity: 0.85 }),
      );
      rg.add(this.ciudadRotuloPlaca);
      g.add(rg);
    }

    // ── LA PUERTA monumental a la entrada de la avenida ──
    const puerta = new THREE.Group();
    puerta.position.set(0, 0, 6.35);
    for (const sx of [-1, 1]) {
      const pilar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.3, 0.24), matPodio);
      pilar.position.set(sx * 1.14, 0.65, 0);
      puerta.add(pilar);
      const pico = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.22, 4), matNeon);
      pico.position.set(sx * 1.14, 1.42, 0);
      pico.rotation.y = Math.PI / 4;
      puerta.add(pico);
    }
    const dintel = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.2, 0.3), matPodio);
    dintel.position.set(0, 1.24, 0);
    puerta.add(dintel);
    if (this.fuente) {
      const tit = this.hacerTexto3D("CIUDAD VANGUARD", { tam: 0.132, prof: 0.04, color: 0xf5c542, emis: 0.62 });
      for (const l of tit.letras) { l.mesh.visible = true; l.quieto = true; }
      const escT = Math.min(1, 2.5 / Math.max(tit.ancho, 0.001));
      tit.grupo.scale.setScalar(escT);
      tit.grupo.position.set(-tit.ancho * escT / 2, 1.6, 0);
      puerta.add(tit.grupo);
      this.ciudadTituloMat = tit.grupo.children.length ? ((tit.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial) : null;
      if (this.ciudadTituloMat) this.ciudadTituloMat.transparent = true;
    }
    g.add(puerta);

    // ── LA PLAZA del emblema: pedestal + octaedro girando + baliza + aros ──
    const plaza = new THREE.Group();
    plaza.position.set(0, 0, 3.55);
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.4, 8), matPodio);
    pedestal.position.y = 0.2;
    plaza.add(pedestal);
    const emblema = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.26, 0),
      new THREE.MeshStandardMaterial({ color: 0xf5c542, emissive: 0xf5c542, emissiveIntensity: 0.55, metalness: 0.75, roughness: 0.22 }),
    );
    emblema.position.y = 0.92;
    plaza.add(emblema);
    this.ciudadEmblema = emblema;
    const baliza = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.05, 2.4, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffd76a, transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    );
    baliza.position.y = 1.5;
    plaza.add(baliza);
    this.ciudadBeaconMat = baliza.material as THREE.MeshBasicMaterial;
    const aroA = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.014, 6, 26),
      new THREE.MeshBasicMaterial({ color: 0xf5c542, transparent: true, opacity: 0.7 }),
    );
    aroA.position.y = 0.92;
    plaza.add(aroA);
    this.ciudadAroA = aroA;
    const aroB = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.011, 6, 26),
      new THREE.MeshBasicMaterial({ color: 0x7ab8ff, transparent: true, opacity: 0.5 }),
    );
    aroB.position.y = 0.92;
    aroB.rotation.x = Math.PI / 2.4;
    plaza.add(aroB);
    this.ciudadAroB = aroB;
    g.add(plaza);

    // ── v164 EL TELETIPO EN VIVO — el titular de última hora flotando sobre
    // la plaza: cartel rojo de ÚLTIMA HORA que late + titular REAL del feed,
    // billboard a cámara. La ciudad entera respira con las noticias. ──
    const teletipo = new THREE.Group();
    teletipo.position.set(0, 2.62, 3.55);
    this.ciudadTeletipo = teletipo;
    const cartel = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.14, 0.02),
      new THREE.MeshStandardMaterial({
        color: 0x2a0810, emissive: new THREE.Color(0xff3d55), emissiveIntensity: 0.8,
        metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.94,
      }),
    );
    cartel.position.set(0, 0.14, 0);
    teletipo.add(cartel);
    const cartelFilo = new THREE.LineSegments(cartel.geometry, new THREE.LineBasicMaterial({ color: 0xff3d55, transparent: true, opacity: 0.95 }));
    cartelFilo.position.copy(cartel.position);
    teletipo.add(cartelFilo);
    this.ciudadTeletipoAlerta = cartel.material as THREE.MeshStandardMaterial;
    if (this.fuente) {
      const rot = this.hacerTexto3D("ULTIMA HORA", { tam: 0.062, prof: 0.016, color: 0xff5d75, emis: 0.95 });
      for (const l of rot.letras) { l.mesh.visible = true; l.quieto = true; }
      const escR = Math.min(1, 0.52 / Math.max(rot.ancho, 0.001));
      rot.grupo.scale.setScalar(escR);
      rot.grupo.position.set(-rot.ancho * escR / 2, 0.14, 0.015);
      teletipo.add(rot.grupo);
      // EL TITULAR — el texto vivo (refrescarTeletipo() lo re-escribe)
      this.ciudadTeletipoTexto = new THREE.Group();
      this.ciudadTeletipoTexto.position.set(0, -0.05, 0);
      teletipo.add(this.ciudadTeletipoTexto);
      this.pintarTeletipoTexto();
    }
    g.add(teletipo);

    // ── EL PAD DE REGRESO — VOLVER, junto a la puerta ──
    if (this.fuente) {
      const vol = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, 0.07, 20), matPodio);
      vol.position.set(0, 0.035, 5.1);
      g.add(vol);
      const volAro = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.014, 6, 26),
        new THREE.MeshBasicMaterial({ color: 0xff8ab5, transparent: true, opacity: 0.75 }),
      );
      volAro.rotation.x = -Math.PI / 2;
      volAro.position.set(0, 0.08, 5.1);
      g.add(volAro);
      const volTxt = this.hacerTexto3D("VOLVER", { tam: 0.085, prof: 0.02, color: 0xff8ab5, emis: 0.8 });
      for (const l of volTxt.letras) l.mesh.visible = true;
      const escV = Math.min(1, 0.72 / Math.max(volTxt.ancho, 0.001));
      volTxt.grupo.scale.setScalar(escV);
      volTxt.grupo.position.set(-volTxt.ancho * escV / 2, 0.22, 5.1);
      g.add(volTxt.grupo);
      const proxyV = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), matProxy);
      proxyV.position.set(0, 0.3, 5.1);
      proxyV.userData = { ciudad: { cerrar: true } };
      g.add(proxyV);
      this.proxiesCiudad.push(proxyV);
    }

    // ── FAROLAS que laten a los lados de la avenida ──
    const zFarolas = [5.6, 3.9, 2.1, 0.4, -1.4, -3.2, -5.0, -6.6];
    zFarolas.forEach((zf, i) => {
      const lado = i % 2 === 0 ? 1 : -1;
      const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, 0.5, 6), matPoste);
      poste.position.set(lado * 1.06, 0.28, zf);
      g.add(poste);
      const foco = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 8),
        this.ciudadLampMats[i % this.ciudadLampMats.length],
      );
      foco.position.set(lado * 1.06, 0.56, zf);
      g.add(foco);
    });
    // v162 — FAROLAS de las calles laterales (solo escritorio): la
    // MEGAPÓLIS se lee de noche hasta el fondo de los distritos
    if (!this.calidadBaja) {
      [4.4, 1.6, -1.2, -4.0].forEach((zf, i) => {
        const lado = i % 2 === 0 ? 1 : -1;
        const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.024, 0.46, 6), matPoste);
        poste.position.set(lado * 3.2, 0.26, zf);
        g.add(poste);
        const foco = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 8, 8),
          this.ciudadLampMats[(i + 1) % this.ciudadLampMats.length],
        );
        foco.position.set(lado * 3.2, 0.52, zf);
        g.add(foco);
      });
    }

    // ── NAVES que patrullan la avenida (la ciudad JAMÁS está quieta) ──
    for (let i = 0; i < 3; i++) {
      const nave = new THREE.Group();
      const cuerpo = new THREE.Mesh(
        new THREE.ConeGeometry(0.055, 0.3, 6),
        new THREE.MeshStandardMaterial({ color: 0x24406e, emissive: 0x3fd6ff, emissiveIntensity: 0.35, metalness: 0.7, roughness: 0.3 }),
      );
      cuerpo.rotation.x = Math.PI / 2;
      nave.add(cuerpo);
      const estela = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffd76a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      estela.position.z = 0.17;
      nave.add(estela);
      const xv = [-0.44, 0.44, 0][i];
      const yv = [0.55, 0.42, 1.7][i];
      nave.position.set(xv, yv, 4);
      g.add(nave);
      this.ciudadVehiculos.push({ g: nave, fase: i * 2.1, vel: 0.28 + i * 0.09, x: xv, y: yv });
    }

    // ── v159 LOS REVELADOS: datos que BROTAN del vacío cuando vuelas cerca.
    // Núcleos con aro y un lema flotante — lejos duermen (escala 0.001),
    // al acercarte despiertan, al alejarte vuelven al vacío (re-armables).
    if (this.fuente) {
      const datos = this.datosCiudad(cat.length);
      // v161 — móvil también merece una expedición rica: 6 hallazgos (antes 4)
      const nR = this.calidadBaja ? 6 : datos.length;
      for (let i = 0; i < nR; i++) {
        const d = datos[i];
        const ladoR = i % 2 === 0 ? 1 : -1;
        const rv = new THREE.Group();
        rv.position.set(ladoR * 0.62, d.y, d.z);
        rv.scale.setScalar(0.001);
        const nucleoR = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.055, 0),
          new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.95 }),
        );
        rv.add(nucleoR);
        const aroR = new THREE.Mesh(
          new THREE.TorusGeometry(0.13, 0.01, 6, 20),
          new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.5 }),
        );
        rv.add(aroR);
        const tR = this.hacerTexto3D(d.texto, { tam: 0.048, prof: 0.013, color: d.color, emis: 0.85 });
        for (const l of tR.letras) l.mesh.visible = true;
        if (tR.grupo.children.length) ((tR.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.95;
        const escR = Math.min(1, 1.5 / Math.max(tR.ancho, 0.001));
        tR.grupo.scale.setScalar(escR);
        tR.grupo.position.set(-tR.ancho * escR / 2, 0.16, 0);
        rv.add(tR.grupo);
        if (d.vivo) this.ciudadReveladosVivos.push({ idx: i, vivo: d.vivo, grupo: tR.grupo, color: d.color });
        g.add(rv);
        this.ciudadRevelados.push({ g: rv, x: ladoR * 0.62, y: d.y, z: d.z, radio: 1.45, dentro: false, visto: false });
      }
      // EL CONTADOR de la expedición: «HALLADOS n/8» sobre la puerta
      const cnt = new THREE.Group();
      cnt.position.set(0, 2.5, 6.9);
      this.ciudadHallaGrupo = new THREE.Group();
      cnt.add(this.ciudadHallaGrupo);
      this.refrescarHallados();
      g.add(cnt);
      // v161 — LA SEÑAL EN VIVO: al nacer la ciudad, un latido al servidor
      // reescribe los revelados vivos con la presencia REAL (online + pico)
      this.refrescarReveladosVivos();
    }

    // ── v159 EL CIELO de la ciudad: NEGRO LIMPIO con estrellas propias —
    // nada de amanecer ámbar ni planeta de fondo: la metrópolis flota en
    // un vacío legible donde SOLO importa la ciudad («fondo negro limpio»)
    const cieloGeo = new THREE.SphereGeometry(12.4, 22, 14);
    const cieloMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      uniforms: { uOp: { value: 0 } },
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        varying vec3 vP;
        uniform float uOp;
        void main() {
          float h = normalize(vP).y * 0.5 + 0.5;
          vec3 cenit = vec3(0.004, 0.005, 0.012);
          vec3 medio = vec3(0.010, 0.014, 0.030);
          vec3 horizonte = vec3(0.016, 0.022, 0.048);
          vec3 col = mix(horizonte, medio, smoothstep(0.18, 0.52, h));
          col = mix(col, cenit, smoothstep(0.52, 0.82, h));
          vec3 celda = floor(normalize(vP) * 170.0);
          float st = step(0.9982, fract(sin(dot(celda, vec3(12.9898, 78.233, 37.719))) * 43758.5453));
          col += vec3(0.42, 0.47, 0.58) * st * 0.55;
          gl_FragColor = vec4(col, uOp);
        }`,
    });
    const cielo = new THREE.Mesh(cieloGeo, cieloMat);
    cielo.position.y = 1.2;
    cielo.visible = false;
    g.add(cielo);
    this.ciudadCielo = cielo;
    this.ciudadCieloMat = cieloMat;

    // ── LUZ PROPIA DE LA CIUDAD: v159 la subimos — con el vacío negro la
    // isla necesita SU propia luz o muere en la penumbra (lección qa-v159-02)
    const luzPlaza = new THREE.PointLight(0xffd28a, 46, 13, 1.55);
    luzPlaza.position.set(0, 3.4, 3.4);
    g.add(luzPlaza);
    const luzFondo = new THREE.PointLight(0x6fb6ff, 34, 13, 1.55);
    luzFondo.position.set(0, 3.2, -4.6);
    g.add(luzFondo);
    const luzMedia = new THREE.PointLight(0xe8f0ff, 30, 12, 1.6);
    luzMedia.position.set(0, 4.2, 0);
    g.add(luzMedia);
    const luzLuna = new THREE.DirectionalLight(0xbfd4ff, 1.1);
    luzLuna.position.set(3, 8, 4);
    g.add(luzLuna);

    this.escena.add(g);
  }

  abrirCiudad() {
    if (this.ciudadAbierta || this.enVuelo) return;
    if (!this.ciudadCatalogo.length) { this.ciudadPendiente = true; return; } // v159: sin catálogo aún → pendiente, nace al llegar
    if (!this.ciudadGrupo || this.ciudadSucia) { this.destruirCiudad(); this.construirCiudad(); this.ciudadSucia = false; }
    if (!this.ciudadGrupo) return;
    this.ciudadAbierta = true;
    // la Casa se aparta: la ciudad es el ÚNICO contenido mientras eliges
    // (html[data-vg-ciudad] duerme cápsula, consola DOM y ventana holo)
    document.documentElement.setAttribute("data-vg-ciudad", "1");
    // LA POSE DE REGRESO — donde el piloto estaba VUELA de vuelta al cerrar
    this.ciudadPose = { pos: this.camara.position.clone(), mir: this.mirada.clone() };
    // CAPAS LIMPIAS: sala, mundo, puente y baliza duermen — solo la ciudad
    this.ciudadSalaVisible = this.salaInst?.grupo.visible ?? false;
    this.ciudadMundoVisible = this.mundoInst?.grupo.visible ?? false;
    if (this.salaInst) this.salaInst.grupo.visible = false;
    if (this.mundoInst) this.mundoInst.grupo.visible = false;
    this.setCiudadUI(true);
    this.setBaliza(false);
    this.calmarLibre();
    this.enVuelo = true;
    this.ciudadGrupo.visible = true;
    this.animarCielo(1);
    // v166: la ciudad manda SU vacío — la cúpula del módulo duerme
    this.dormirTemaSala();
    // v164 — el TELETIPO se sintoniza: el titular más nuevo del feed real
    this.sintonizarTeletipo();
    // v159 — EL VACÍO LIMPIO: el planeta, su atmósfera, partículas, logo y
    // marcadores DUERMEN mientras eliges — la ciudad flota en negro puro con
    // SU cielo de estrellas (nada «que no viene al caso» alrededor)
    this.ciudadOcultos = [];
    const esconder = (o: THREE.Object3D | null | undefined) => {
      if (!o) return;
      this.ciudadOcultos.push({ o, v: o.visible });
      o.visible = false;
    };
    esconder(this.tierra);
    esconder(this.atmosfera);
    esconder(this.particulasOro);
    esconder(this.particulasAzul);
    esconder(this.aroSpin);
    esconder(this.logoGrupo);
    for (const mk of this.marcadores) esconder(mk.grupo);
    for (const pt of this.portales) esconder(pt.grupo);
    for (const tz of this.titulosZona) esconder(tz.grupo);
    // los revelados vuelven al vacío para volver a brotar en cada visita
    for (const r of this.ciudadRevelados) { r.dentro = false; r.g.scale.setScalar(0.001); }
    // EL VIAJE VISIBLE — la cámara sube hasta la puerta de la avenida
    const esc = this.ciudadGrupo.scale.x;
    const movl = this.esMovil();
    const destino = {
      pos: CIUDAD_CENTRO.clone().add(_vA.set(0, movl ? 2.9 : 2.75, movl ? 9.6 : 9.0).multiplyScalar(esc)),
      mir: CIUDAD_CENTRO.clone().add(_vB.set(0, movl ? -0.1 : -0.12, -3.2).multiplyScalar(esc)),
    };
    this.volarCiudad(destino, 2000);
    // NACIMIENTO EN CASCADA — los edificios crecen ante tus ojos
    for (let i = 0; i < this.ciudadEdificios.length; i++) {
      const ed = this.ciudadEdificios[i];
      ed.nacido = false;
      ed.grupo.position.set(ed.x0, ed.y0 - 0.55, ed.z0);
      ed.grupo.scale.setScalar(0.55);
      const dummy = { d: 0 };
      this.animarP(dummy, { d: 1 }, 700 + i * 55, {
        onDone: () => {
          if (!this.ciudadAbierta) return;
          this.animarP(ed.grupo.position, { x: ed.x0, y: ed.y0, z: ed.z0 }, 560, { ease: easeOut });
          this.animarP(ed.grupo.scale, { x: 1, y: 1, z: 1 }, 560, { ease: easeOut, onDone: () => { ed.nacido = true; } });
        },
      });
    }
    // v162 — los TÓTEMS de módulos nacen en cascada también (la MEGAPÓLIS
    // se levanta de golpe: torres primero, distritos de placas después)
    for (let i = 0; i < this.ciudadTotems.length; i++) {
      const tt = this.ciudadTotems[i];
      tt.nacido = false;
      tt.g.position.set(tt.x0, tt.y0 - 0.5, tt.z0);
      tt.g.scale.setScalar(0.55);
      const dummy = { d: 0 };
      this.animarP(dummy, { d: 1 }, 820 + i * 65, {
        onDone: () => {
          if (!this.ciudadAbierta) return;
          this.animarP(tt.g.position, { x: tt.x0, y: tt.y0, z: tt.z0 }, 560, { ease: easeOut });
          this.animarP(tt.g.scale, { x: 1, y: 1, z: 1 }, 560, { ease: easeOut, onDone: () => { tt.nacido = true; } });
        },
      });
    }
    sonar("ping");
  }

  // cerrar: VOLVER volando a donde estaba el piloto (la ciudad queda atrás)
  cerrarCiudad(instant = false) {
    if (!this.ciudadAbierta) return;
    this.ciudadAbierta = false;
    // v167 BUG R19: un cierre de ciudad es SIEMPRE una acción del piloto
    // (entró a un módulo / ESC / VOLVER) — el aterrizaje automático del boot
    // jamás debe pelear con ella otra vez
    this.ciudadCerradaAlgunaVez = true;
    document.documentElement.removeAttribute("data-vg-ciudad");
    this.cerrarPregunta();
    // v159 — el planeta y su corte DESPIERTAN al cerrar (el regreso a casa)
    for (const oc of this.ciudadOcultos) oc.o.visible = oc.v;
    this.ciudadOcultos = [];
    // v166: si había una casa abierta, SU fondo vuelve a pintar el universo
    if (this.salaInst && this.salaPayload) this.despertarTemaSala(this.salaPayload.color || 0x7ab8ff);
    const volver = this.ciudadPose;
    this.ciudadPose = null;
    this.setCiudadUI(false);
    // la sección vuelve a su sitio — v159: la sala DESPIERTA AL ATERRIZAR
    // (volarCiudad onDone): encendida ahora nacería varada a mitad de vuelo
    if (!instant) this.ciudadRevivir = true;
    else {
      if (this.salaInst && this.ciudadSalaVisible) this.salaInst.grupo.visible = true;
      if (this.mundoInst && this.ciudadMundoVisible) this.mundoInst.grupo.visible = true;
    }
    this.animarCielo(0);
    if (instant) {
      if (volver) {
        this.camara.position.copy(volver.pos);
        this.mirada.copy(volver.mir);
        this.camara.lookAt(volver.mir.x, volver.mir.y, volver.mir.z);
      }
      if (this.ciudadGrupo) this.ciudadGrupo.visible = false;
      return;
    }
    // EL REGRESO CINEMATOGRÁFICO — la cámara desciende a la Casa mientras
    // la ciudad queda de fondo; al aterrizar la ciudad duerme (visible off)
    if (volver) {
      this.enVuelo = true;
      this.calmarLibre();
      this.volarCiudad(volver, 1600);
    }
    const g = this.ciudadGrupo;
    window.setTimeout(() => {
      if (!this.ciudadAbierta && g) g.visible = false;
    }, 1750);
  }

  // EL VUELO DE CÁMARA de la ciudad (ida y vuelta) — el mismo contrato del
  // vuelo de zona: suave, visible, sin secuestrar nada más
  private volarCiudad(dest: { pos: THREE.Vector3; mir: THREE.Vector3 }, dur: number) {
    const objPos = { x: this.camara.position.x, y: this.camara.position.y, z: this.camara.position.z };
    const objMir = { x: this.mirada.x, y: this.mirada.y, z: this.mirada.z };
    this.animarP(objPos, { x: dest.pos.x, y: dest.pos.y, z: dest.pos.z }, dur, {
      onUpdate: () => {
        this.camara.position.set(objPos.x, objPos.y, objPos.z);
        this.camara.lookAt(objMir.x, objMir.y, objMir.z);
      },
    });
    this.animarP(objMir, { x: dest.mir.x, y: dest.mir.y, z: dest.mir.z }, dur, {
      onUpdate: () => this.camara.lookAt(objPos.x, objPos.y, objPos.z),
      onDone: () => {
        this.mirada.copy(dest.mir);
        this.camara.lookAt(dest.mir.x, dest.mir.y, dest.mir.z);
        this.enVuelo = false;
        sonar("freno");
        // v159 EL ATERRIZAJE PERFECTO: al posar la cámara, la sala del módulo
        // se RE-ANCILA en la pose final y DESPIERTA — nacida a mitad de vuelo
        // quedaba varada en el cielo («las cosas se pierden / te siguen»)
        if (!this.ciudadAbierta && this.salaInst && this.capsulaAcoplada && !this.modoMundo && this.zona !== 0) {
          this.anclarSala(true);
          this.salaInst.grupo.visible = true;
          if (this.mundoInst && this.ciudadMundoVisible && this.mundoInst.grupo) this.mundoInst.grupo.visible = true;
        }
        this.ciudadRevivir = false;
      },
    });
  }

  // ──────────────────────────────────────────────────────────────
  // v166 — EL FONDO CREADO POR EL MÓDULO. Al entrar a una casa, su
  // acento PINTA el universo: cúpula shader (cenit profundo → horizonte
  // vivo del color del módulo, hazes girando, estrellas propias) y el
  // planeta con todo su corte DUERMEN. Nada del mundo viejo compite:
  // cada módulo genera su propio fondo. Al salir, todo despierta.
  // ──────────────────────────────────────────────────────────────
  despertarTemaSala(color: number) {
    if (this.ciudadAbierta) { this.salaTemaPendiente = true; return; }
    this.salaTemaPendiente = false;
    this.salaTemaGen++;
    if (!this.salaCielo || !this.salaCieloMat) {
      const geo = new THREE.SphereGeometry(10.5, 24, 16);
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        uniforms: {
          uOp: { value: 0 },
          uT: { value: 0 },
          uAcento: { value: new THREE.Color(color) },
        },
        vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
          varying vec3 vP;
          uniform float uOp;
          uniform float uT;
          uniform vec3 uAcento;
          void main() {
            vec3 d = normalize(vP);
            float h = d.y * 0.5 + 0.5;
            // el cielo lo PINTA el módulo: cenit profundo, horizonte vivo
            vec3 cenit = uAcento * 0.07 + vec3(0.004, 0.005, 0.012);
            vec3 medio = uAcento * 0.13 + vec3(0.008, 0.011, 0.024);
            vec3 horizonte = uAcento * 0.34 + vec3(0.014, 0.02, 0.045);
            vec3 col = mix(horizonte, medio, smoothstep(0.18, 0.52, h));
            col = mix(col, cenit, smoothstep(0.52, 0.85, h));
            // HAZES del módulo: columnas de luz del acento girando lento
            float ang = atan(d.x, d.z);
            float haz = pow(max(0.0, sin(ang * 7.0 + uT * 0.12)), 28.0);
            col += uAcento * haz * (1.0 - h) * (0.4 + 0.18 * sin(uT * 0.7));
            // ESTRELLAS propias, teñidas del acento
            vec3 celda = floor(d * 170.0);
            float st = step(0.9982, fract(sin(dot(celda, vec3(12.9898, 78.233, 37.719))) * 43758.5453));
            col += mix(vec3(0.42, 0.47, 0.58), uAcento, 0.45) * st * 0.5;
            gl_FragColor = vec4(col, uOp);
          }`,
      });
      this.salaCielo = new THREE.Mesh(geo, mat);
      this.salaCielo.frustumCulled = false;
      this.escena.add(this.salaCielo);
      this.salaCieloMat = mat;
    }
    (this.salaCieloMat.uniforms.uAcento.value as THREE.Color).setHex(color);
    this.salaCielo.visible = true;
    // EL PLANETA Y SU CORTE DUERMEN: el fondo lo firma el módulo
    this.salaFondoOcultos = [];
    const esconder = (o: THREE.Object3D | null | undefined) => {
      if (!o) return;
      this.salaFondoOcultos.push({ o, v: o.visible });
      o.visible = false;
    };
    esconder(this.tierra);
    esconder(this.atmosfera);
    esconder(this.particulasOro);
    esconder(this.particulasAzul);
    esconder(this.aroSpin);
    esconder(this.logoGrupo);
    for (const mk of this.marcadores) esconder(mk.grupo);
    for (const pt of this.portales) esconder(pt.grupo);
    for (const tz of this.titulosZona) esconder(tz.grupo);
    const gen = this.salaTemaGen;
    const obj = { o: this.salaCieloMat.uniforms.uOp.value as number };
    this.animarP(obj, { o: 1 }, 900, {
      onUpdate: () => { if (this.salaTemaGen === gen && this.salaCieloMat) this.salaCieloMat.uniforms.uOp.value = obj.o; },
    });
    this.salaTemaOn = true;
  }

  dormirTemaSala() {
    if (!this.salaTemaOn) { this.salaTemaPendiente = false; return; }
    this.salaTemaOn = false;
    this.salaTemaPendiente = false;
    this.salaTemaGen++;
    // EL PLANETA DESPIERTA YA (nada queda preso si algo falla después)
    for (const oc of this.salaFondoOcultos) oc.o.visible = oc.v;
    this.salaFondoOcultos = [];
    const mat = this.salaCieloMat;
    if (!mat || !this.salaCielo) return;
    this.salaCielo.visible = true;
    const gen = this.salaTemaGen;
    const obj = { o: mat.uniforms.uOp.value as number };
    this.animarP(obj, { o: 0 }, 420, {
      onUpdate: () => { if (this.salaTemaGen === gen && mat) mat.uniforms.uOp.value = obj.o; },
      onDone: () => { if (this.salaTemaGen === gen && this.salaCielo) this.salaCielo.visible = false; },
    });
  }

  // EL CIELO de la ciudad se enciende y se apaga (el fondo cambia de color)
  private animarCielo(destino: number) {
    const mat = this.ciudadCieloMat;
    const cielo = this.ciudadCielo;
    if (!mat || !cielo) return;
    cielo.visible = true;
    const obj = { o: mat.uniforms.uOp.value as number };
    this.animarP(obj, { o: destino }, 950, {
      onUpdate: () => {
        mat.uniforms.uOp.value = obj.o;
        cielo.visible = obj.o > 0.012;
      },
    });
  }

  // ──────────────────────────────────────────────────────────────
  // v159 — LA CIUDAD QUE HABLA: datos, contador y LA PREGUNTA.
  // ──────────────────────────────────────────────────────────────

  // LOS CONTENIDOS que esperan en el vacío: v161 — DOCE datos repartidos por
  // la avenida: dos EN VIVO (presencia real del servidor), datos del mundo,
  // del propio piloto y de la expedición. Los vivos nacen «sintonizando» y
  // refrescarReveladosVivos() los reescribe al llegar la señal real.
  private datosCiudad(nEdificios: number): { texto: string; color: number; y: number; z: number; vivo?: "online" | "pico" }[] {
    let nivel = 0, coins = 0, racha = 0;
    try {
      const crudo = localStorage.getItem("vanguard-game-state-v1");
      if (crudo) {
        const j = JSON.parse(crudo) as { state?: { level?: number; coins?: number; streak?: number } };
        nivel = j.state?.level ?? 0;
        coins = j.state?.coins ?? 0;
        racha = j.state?.streak ?? 0;
      }
    } catch { /* sin datos: la ciudad sigue viva igual */ }
    const teatros = GUERRAS.length;
    // v162 — LA MEGAPÓLIS: el catálogo entero vive en los tótems
    const modulos = this.ciudadCatalogo.reduce((a, s) => a + Math.min(18, s.tabs?.length ?? 0), 0);
    const zs = [5.2, 3.9, 2.6, 1.3, 0.0, -1.3, -2.6, -3.9, -5.2, -6.5, -7.8, -9.1];
    const ys = [2.5, 1.9, 2.2, 1.7, 2.4, 1.8, 2.1, 1.7, 2.5, 1.9, 2.3, 2.0];
    return [
      { texto: "OPERADORES EN LÍNEA · SINTONIZANDO…", color: 0x3fd6ff, y: ys[0], z: zs[0], vivo: "online" as const },
      { texto: "TOCA UN EDIFICIO Y CONFIRMA PARA ENTRAR", color: 0xf5c542, y: ys[1], z: zs[1] },
      { texto: "RÉCORD DE LA CIUDADELA · SINTONIZANDO…", color: 0xff7a5c, y: ys[2], z: zs[2], vivo: "pico" as const },
      { texto: `${teatros} TEATROS DE GUERRA VIGILADOS 24/7`, color: 0xff9a5c, y: ys[3], z: zs[3] },
      { texto: nivel > 0 ? `PILOTO NIVEL ${nivel} · RACHA ${racha} DÍAS` : "TU NIVEL TE ESPERA · JUEGA Y SUBE", color: 0x9fe8c8, y: ys[4], z: zs[4] },
      { texto: coins > 0 ? `${coins} MONEDAS EN TU BOLSA` : "GANA MONEDAS EN CADA MUNDO", color: 0xffd76a, y: ys[5], z: zs[5] },
      { texto: `${nEdificios} TORRES · ${modulos} MÓDULOS TOCABLES`, color: 0xc9a0ff, y: ys[6], z: zs[6] },
      { texto: "EXPEDIENTES SECRETOS REALES POR ABRIR", color: 0xb08cff, y: ys[7], z: zs[7] },
      { texto: `VANGUARD ${APP_VERSION} · EN CRECIMIENTO`, color: 0x7ab8ff, y: ys[8], z: zs[8] },
      { texto: "LOS TÓTEMS GUARDAN TODO EL SITIO · VUELA CERCA", color: 0x8fd0ff, y: ys[9], z: zs[9] },
      { texto: "EL UNIVERSO NO DUERME · VUELVE SIEMPRE", color: 0x7ab8ff, y: ys[10], z: zs[10] },
      { texto: "DATOS OCULTOS · HALLA TODOS Y GANA", color: 0x9fe8c8, y: ys[11], z: zs[11] },
    ];
  }

  // EL CONTADOR del explorador: «HALLADOS n/12» — se reconstruye al hallar.
  // v161: al COMPLETAR la expedición el letrero se vuelve ORO y anuncia la
  // recompensa (+150 monedas +50 XP, pagadas una sola vez por sesión).
  private refrescarHallados() {
    if (!this.ciudadHallaGrupo || !this.fuente) return;
    for (const hijo of [...this.ciudadHallaGrupo.children]) {
      this.ciudadHallaGrupo.remove(hijo);
      this.eliminarRecursos(hijo);
    }
    const total = Math.max(this.ciudadRevelados.length, 1);
    const completo = this.ciudadHallados >= total;
    const t = this.hacerTexto3D(
      completo ? "¡EXPEDICIÓN COMPLETA! +150 MONEDAS" : `HALLADOS ${this.ciudadHallados}/${total}`,
      { tam: 0.06, prof: 0.015, color: completo ? 0xffd76a : 0x9fe8c8, emis: completo ? 1 : 0.85 },
    );
    for (const l of t.letras) l.mesh.visible = true;
    if (t.grupo.children.length) ((t.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.95;
    const escT = Math.min(1, 1.5 / Math.max(t.ancho, 0.001));
    t.grupo.scale.setScalar(escT);
    t.grupo.position.set(-t.ancho * escT / 2, 0, 0);
    this.ciudadHallaGrupo.add(t.grupo);
  }

  // v161 — LA CIUDAD VIVA: los revelados «SINTONIZANDO…» se reescriben con
  // la presencia REAL del servidor (/api/presence → online + pico histórico).
  // Un solo latido, tolerante a fallos: sin señal, los lemas de espera siguen
  // siendo válidos y la expedición no se rompe.
  private refrescarReveladosVivos() {
    if (!this.fuente || !this.ciudadReveladosVivos.length) return;
    try {
      fetch("/api/presence", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j: { online?: number; peak?: number } | null) => {
          if (!j || !this.ciudadAbierta) return;
          if (typeof j.online === "number" && j.online > 0) {
            this.refrescarTextoRevelado("online", `${j.online} OPERADORES EN LÍNEA AHORA MISMO`);
          }
          if (typeof j.peak === "number" && j.peak > 0) {
            this.refrescarTextoRevelado("pico", `RÉCORD DE LA CIUDADELA · ${j.peak} A LA VEZ`);
          }
        })
        .catch(() => { /* sin señal: los lemas de espera siguen */ });
    } catch { /* fetch indisponible: la ciudad sigue viva igual */ }
  }

  // v161 — cirugía de texto: cambia SOLO el lema flotante de un revelado
  // (núcleo y aro quedan intactos; el grupo viejo se dispone con cuidado)
  private refrescarTextoRevelado(vivo: "online" | "pico", texto: string) {
    const reg = this.ciudadReveladosVivos.find((v) => v.vivo === vivo && v.grupo);
    if (!reg || !reg.grupo) return;
    const t = this.hacerTexto3D(texto, { tam: 0.048, prof: 0.013, color: reg.color, emis: 0.85 });
    for (const l of t.letras) l.mesh.visible = true;
    if (t.grupo.children.length) ((t.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.95;
    const escR = Math.min(1, 1.5 / Math.max(t.ancho, 0.001));
    t.grupo.scale.setScalar(escR);
    t.grupo.position.set(-t.ancho * escR / 2, 0.16, 0);
    const padre = reg.grupo.parent;
    if (!padre) return;
    padre.remove(reg.grupo);
    this.eliminarRecursos(reg.grupo);
    padre.add(t.grupo);
    reg.grupo = t.grupo;
  }

  // v162 — cirugía del rótulo: re-escribe SOLO el texto (la placa se
  // re-dimensiona con él); si el módulo no cambia, no se toca nada
  private refrescarRotulo(nombre: string, color: number) {
    if (!this.ciudadRotulo || !this.ciudadRotuloPlaca) return;
    if (this.ciudadRotuloTexto) {
      this.ciudadRotulo.remove(this.ciudadRotuloTexto);
      this.eliminarRecursos(this.ciudadRotuloTexto);
      this.ciudadRotuloTexto = null;
    }
    const t = this.hacerTexto3D(nombre, { tam: 0.05, prof: 0.014, color, emis: 0.9 });
    for (const l of t.letras) l.mesh.visible = true;
    if (t.grupo.children.length) ((t.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.98;
    const esc = Math.min(1, 0.72 / Math.max(t.ancho, 0.001));
    t.grupo.scale.setScalar(esc);
    t.grupo.position.set(-t.ancho * esc / 2, -0.028, 0.006);
    this.ciudadRotulo.add(t.grupo);
    this.ciudadRotuloTexto = t.grupo;
    // la placa acompaña al texto (se dispone y se re-crea — barato, 1 caja)
    const vieja = this.ciudadRotuloPlaca.geometry;
    this.ciudadRotuloPlaca.geometry = new THREE.BoxGeometry(t.ancho * esc + 0.1, 0.105, 0.008);
    vieja.dispose();
    const matPl = this.ciudadRotuloPlaca.material as THREE.MeshStandardMaterial;
    matPl.emissive = new THREE.Color(color);
    matPl.emissiveIntensity = 0.35;
    this.ciudadRotuloNombre = nombre;
    this.ciudadRotuloColor = color;
  }

  // v164 — EL TELETIPO: cirugía del titular vivo sobre la plaza. El cartel
  // y su filo nunca se tocan; SOLO el grupo del texto se dispone y re-nace
  // (el titular REAL del feed, fuente y edad, en volumen).
  private pintarTeletipoTexto() {
    if (!this.ciudadTeletipoTexto) return;
    const crudo = this.teletipoDato
      ? `${this.teletipoDato.fuente} · ${this.teletipoDato.titulo}`
      : "SINTONIZANDO LA REDACCIÓN…";
    const t = this.hacerTexto3D(
      crudo.length > 78 ? crudo.slice(0, 75).trimEnd() + "…" : crudo,
      { tam: 0.042, prof: 0.012, color: this.teletipoDato?.ultimo ? 0xffd76a : 0xdfeaff, emis: 0.8 },
    );
    for (const l of t.letras) l.mesh.visible = true;
    if (t.grupo.children.length) ((t.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.96;
    const esc = Math.min(1, 2.6 / Math.max(t.ancho, 0.001));
    t.grupo.scale.setScalar(esc);
    t.grupo.position.set(-t.ancho * esc / 2, 0, 0);
    // el texto nuevo entra flotando (nace y respira en ticCiudad)
    const nuevo = new THREE.Group();
    nuevo.position.set(0, -0.05, 0);
    nuevo.add(t.grupo);
    const viejo = this.ciudadTeletipoTexto;
    this.ciudadTeletipoTexto = nuevo;
    if (viejo.parent) viejo.parent.remove(viejo);
    this.eliminarRecursos(viejo);
    this.ciudadTeletipo?.add(nuevo);
  }

  private refrescarTeletipo() {
    if (!this.ciudadAbierta) return;
    this.pintarTeletipoTexto();
  }

  // v164 — LA SINTONÍA AUTÓNOMA: al abrir la ciudad se pide el cable más
  // nuevo al feed real (1 fetch por minuto como máximo) — el teletipo vive
  // aunque el módulo de noticias nunca se haya abierto.
  private sintonizarTeletipo() {
    const ahora = Date.now();
    if (ahora - this.teletipoMs < 60000) return;
    this.teletipoMs = ahora;
    try {
      fetch("/api/news?limit=5", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j: { items?: { title?: string; source?: string; publishedAt?: string }[] } | null) => {
          const it = j?.items?.[0];
          if (!it?.title || !this.ciudadAbierta) return;
          let edad = "";
          try {
            const min = Math.max(1, Math.round((Date.now() - new Date(it.publishedAt || Date.now()).getTime()) / 60000));
            edad = min < 60 ? `HACE ${min} MIN` : `HACE ${Math.round(min / 60)} H`;
          } catch { edad = ""; }
          const min15 = (() => { try { return Date.now() - new Date(it.publishedAt || 0).getTime() < 15 * 60000; } catch { return false; } })();
          this.teletipoDato = { titulo: it.title, fuente: (it.source || "AGENCIA").toUpperCase().slice(0, 14), edad, ultimo: min15 };
          this.refrescarTeletipo();
        })
        .catch(() => { /* sin señal: el lema de espera sigue siendo válido */ });
    } catch { /* fetch indisponible: la ciudad sigue viva igual */ }
  }

  // LA PREGUNTA: tocar un edificio NUNCA entra solo — un panel 3D anclado
  // a la cámara pregunta «¿ENTRAR?» con SÍ y NO reales (raycast, sonido)
  preguntarEntrada(ed: { tab: string; nombre: string; color: number }) {
    if (!this.fuente || !this.ciudadAbierta || !ed.tab) return;
    this.cerrarPregunta();
    const hex = ed.color;
    const g = new THREE.Group();
    const placa = new THREE.Mesh(
      new THREE.BoxGeometry(1.26, 0.68, 0.045),
      new THREE.MeshStandardMaterial({ color: 0x101a30, metalness: 0.55, roughness: 0.32, transparent: true, opacity: 0.95, emissive: 0x1a2946, emissiveIntensity: 0.5 }),
    );
    g.add(placa);
    const filo = new THREE.LineSegments(
      new THREE.EdgesGeometry(placa.geometry),
      new THREE.LineBasicMaterial({ color: hex, transparent: true, opacity: 0.9 }),
    );
    filo.raycast = () => {};
    placa.add(filo);
    const tit = this.hacerTexto3D("¿ENTRAR?", { tam: 0.082, prof: 0.02, color: 0xf5c542, emis: 0.9 });
    for (const l of tit.letras) l.mesh.visible = true;
    if (tit.grupo.children.length) ((tit.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 1;
    const escT = Math.min(1, 1.02 / Math.max(tit.ancho, 0.001));
    tit.grupo.scale.setScalar(escT);
    tit.grupo.position.set(-tit.ancho * escT / 2, 0.24, 0.03);
    g.add(tit.grupo);
    const nom = this.hacerTexto3D(ed.nombre || "MÓDULO", { tam: 0.072, prof: 0.018, color: hex, emis: 0.95 });
    for (const l of nom.letras) l.mesh.visible = true;
    if (nom.grupo.children.length) ((nom.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 1;
    const escN = Math.min(1, 1.14 / Math.max(nom.ancho, 0.001));
    nom.grupo.scale.setScalar(escN);
    nom.grupo.position.set(-nom.ancho * escN / 2, 0.06, 0.03);
    g.add(nom.grupo);
    const proxyMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, depthTest: false });
    const boton = (txt: string, x: number, color: number, si: boolean) => {
      const b = new THREE.Group();
      b.position.set(x, -0.2, 0.04);
      const p = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.17, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x0b1322, metalness: 0.6, roughness: 0.35, transparent: true, opacity: 0.95 }),
      );
      b.add(p);
      const fb = new THREE.LineSegments(new THREE.EdgesGeometry(p.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }));
      fb.raycast = () => {};
      p.add(fb);
      const t = this.hacerTexto3D(txt, { tam: 0.055, prof: 0.014, color, emis: 0.95 });
      for (const l of t.letras) l.mesh.visible = true;
      if (t.grupo.children.length) ((t.grupo.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 1;
      const escB = Math.min(1, 0.38 / Math.max(t.ancho, 0.001));
      t.grupo.scale.setScalar(escB);
      t.grupo.position.set(-t.ancho * escB / 2, -0.018, 0.025);
      b.add(t.grupo);
      const proxy = new THREE.Mesh(new THREE.SphereGeometry(0.21, 8, 8), proxyMat);
      proxy.userData = si ? { ciudad: { si: { tab: ed.tab } } } : { ciudad: { no: true } };
      b.add(proxy);
      this.proxiesCiudad.push(proxy);
      this.ciudadPromptProxies.push(proxy);
      g.add(b);
    };
    boton("SÍ", -0.3, hex, true);
    boton("NO", 0.3, 0xff6b9d, false);
    // v159 móvil: la placa entra COMPLETA en pantalla estrecha (qa-v159-10)
    const escFinal = this.esMovil() ? 0.62 : 1;
    g.scale.setScalar(escFinal * 0.6);
    this.escena.add(g);
    this.ciudadPrompt = g;
    this.animarP(g.scale, { x: escFinal, y: escFinal, z: escFinal }, 300, { ease: easeOut });
    if (this.ciudadPromptTimer) window.clearTimeout(this.ciudadPromptTimer);
    this.ciudadPromptTimer = window.setTimeout(() => this.cerrarPregunta(), 9000);
    sonar("tic");
  }

  // la pregunta se retira: proxies fuera del raycast, recursos liberados
  cerrarPregunta() {
    if (this.ciudadPromptTimer) { window.clearTimeout(this.ciudadPromptTimer); this.ciudadPromptTimer = null; }
    for (const px of this.ciudadPromptProxies) {
      const i = this.proxiesCiudad.indexOf(px);
      if (i >= 0) this.proxiesCiudad.splice(i, 1);
    }
    this.ciudadPromptProxies = [];
    const g = this.ciudadPrompt;
    this.ciudadPrompt = null;
    if (!g) return;
    this.escena.remove(g);
    this.eliminarRecursos(g);
  }

  // EL PUENTE Y SU CONSOLA duermen mientras eliges en la ciudad (capas limpias)
  private setCiudadUI(on: boolean) {
    if (this.ciudadUIOn === on) return;
    this.ciudadUIOn = on;
    if (on) {
      this.consola.visible = false;
      this.pieGrupo.visible = false;
      if (this.railObj) this.railObj.visible = false;
      this.entradaGrupo.visible = false;
      this.modoGrupo.visible = false;
      this.setVisibleWidges(false);
    } else {
      this.consola.visible = this.consolaVisibleFin && !this.modoMundo;
      this.pieGrupo.visible = this.consolaVisibleFin && !this.modoMundo && !this.esMovil();
      if (this.railObj) this.railObj.visible = this.consolaVisibleFin && !this.modoMundo;
      this.modoGrupo.visible = this.consolaVisibleFin && this.modoMundo && this.modoConstruido;
      this.setVisibleWidges(this.consolaVisibleFin && !this.modoMundo);
    }
  }

  // LA CIUDAD RESPIRA — placas que aparecen y laten, edificios que flotan,
  // figuras que giran, ventanas que parpadean, farolas que laten, naves que
  // patrullan la avenida y un emblema con baliza viva: un LUGAR vivo, no un cartel
  ticCiudad(t: number, dt: number) {
    for (const m of this.ciudadPlateMats) {
      if (m.opacity < 1) m.opacity = Math.min(1, m.opacity + dt * 1.8);
    }
    if (this.ciudadTituloMat) {
      if (this.ciudadTituloMat.opacity < 0.94) this.ciudadTituloMat.opacity = Math.min(0.94, this.ciudadTituloMat.opacity + dt * 1.8);
      this.ciudadTituloMat.emissiveIntensity = 0.55 + Math.sin(t * 2.1) * 0.18;
    }
    for (const ed of this.ciudadEdificios) {
      if (!ed.nacido) continue;
      ed.grupo.position.y = ed.y0 + Math.sin(t * 0.85 + ed.fase) * 0.014;
      if (ed.fig) ed.fig.rotation.y += dt * 0.7;
    }
    // v163 — DECORACIONES TEMÁTICAS orbitando cada torre + balizas de
    // antena parpadeando por fases — el vacío negro JAMÁS está quieto
    for (let i = 0; i < this.ciudadDecor.length; i++) {
      this.ciudadDecor[i].g.rotation.y = t * 0.16 + this.ciudadDecor[i].fase;
    }
    for (let i = 0; i < this.ciudadBlinkers.length; i++) {
      this.ciudadBlinkers[i].opacity = 0.22 + Math.max(0, Math.sin(t * 2.4 + i * 1.3)) * 0.78;
    }
    // ventanas por fases (4 piscinas compartidas)
    for (let i = 0; i < this.ciudadVentanaMats.length; i++) {
      this.ciudadVentanaMats[i].opacity = 0.42 + Math.sin(t * 1.6 + i * 1.9) * 0.3;
    }
    // farolas que laten (2 piscinas)
    for (let i = 0; i < this.ciudadLampMats.length; i++) {
      this.ciudadLampMats[i].opacity = 0.58 + Math.sin(t * 2.3 + i * 2.4) * 0.3;
    }
    // NAVES patrullando el eje — ping-pong suave a lo largo de la avenida
    for (let i = 0; i < this.ciudadVehiculos.length; i++) {
      const v = this.ciudadVehiculos[i];
      const z = Math.sin(t * v.vel + v.fase) * 6.0;
      const dz = Math.cos(t * v.vel + v.fase);
      v.g.position.set(v.x, v.y + Math.sin(t * 1.3 + v.fase) * 0.05, z);
      v.g.rotation.y = dz >= 0 ? 0 : Math.PI;
    }
    // EL EMBLEMA: octaedro girando, aros en contrafase, baliza que late
    if (this.ciudadEmblema) this.ciudadEmblema.rotation.y += dt * 0.85;
    if (this.ciudadAroA) this.ciudadAroA.rotation.z += dt * 0.6;
    if (this.ciudadAroB) this.ciudadAroB.rotation.y += dt * 0.45;
    if (this.ciudadBeaconMat) this.ciudadBeaconMat.opacity = 0.18 + Math.sin(t * 1.7) * 0.12;
    // v164 — EL TELETIPO: billboard a cámara (SOLO yaw — nunca persigue) +
    // cartel de ÚLTIMA HORA que late cuando el cable está caliente
    if (this.ciudadTeletipo) {
      const tp = this.ciudadTeletipo;
      _vA.copy(this.camara.position).sub(tp.position);
      tp.rotation.y = Math.atan2(_vA.x, _vA.z);
    }
    if (this.ciudadTeletipoAlerta) {
      const hot = !!this.teletipoDato?.ultimo;
      this.ciudadTeletipoAlerta.emissiveIntensity = hot
        ? 0.62 + Math.max(0, Math.sin(t * 8.2)) * 0.85
        : 0.55 + Math.sin(t * 2.0) * 0.18;
    }
    // v159 — LA PREGUNTA vive pegada a la cámara (nunca se queda atrás)
    if (this.ciudadPrompt) {
      _vA.set(0, 0, -1).applyQuaternion(this.camara.quaternion);
      this.ciudadPrompt.position.copy(this.camara.position).addScaledVector(_vA, 1.25);
      this.ciudadPrompt.quaternion.copy(this.camara.quaternion);
    }
    // v159 — REVELADOS: la proximidad los hace BROTAR del vacío (primera vez
    // suma al contador de hallazgos); al alejarte vuelven a dormir, re-armados
    if (this.ciudadGrupo && this.ciudadRevelados.length) {
      const esc = this.ciudadGrupo.scale.x;
      const cx = this.ciudadGrupo.position.x, cy = this.ciudadGrupo.position.y, cz = this.ciudadGrupo.position.z;
      for (const r of this.ciudadRevelados) {
        const dx = this.camara.position.x - (cx + r.x * esc);
        const dy = this.camara.position.y - (cy + r.y * esc);
        const dz = this.camara.position.z - (cz + r.z * esc);
        const d2 = dx * dx + dy * dy + dz * dz;
        if (!r.dentro && d2 < r.radio * r.radio) {
          r.dentro = true;
          if (!r.visto) {
            r.visto = true;
            this.ciudadHallados = Math.min(this.ciudadRevelados.length, this.ciudadHallados + 1);
            this.refrescarHallados();
            // v161 — LA RECOMPENSA del explorador: hallarlos TODOS paga una vez
            if (this.ciudadHallados >= this.ciudadRevelados.length && !this.ciudadRecompensada) {
              this.ciudadRecompensada = true;
              window.dispatchEvent(new CustomEvent("vg:ciudad-recompensa", { detail: { coins: 150, xp: 50 } }));
              sonar("onda");
              window.setTimeout(() => sonar("ping"), 260);
            }
          }
          this.animarP(r.g.scale, { x: 1, y: 1, z: 1 }, 460, { ease: easeOut });
          sonar("ping");
        } else if (r.dentro && d2 > r.radio * r.radio * 2.4) {
          r.dentro = false;
          this.animarP(r.g.scale, { x: 0.001, y: 0.001, z: 0.001 }, 380, { ease: easeOut });
        }
      }
    }
    // v162 — LAS CORONAS de los tótems giran (balizas vivas del distrito)
    for (let i = 0; i < this.ciudadCrownes.length; i++) {
      this.ciudadCrownes[i].rotation.y += dt * 1.1;
      this.ciudadCrownes[i].rotation.x = Math.sin(t * 1.3 + i) * 0.18;
    }
    // v162 — EL RÓTULO DE PROXIMIDAD: cada 6 frames se busca la placa más
    // cercana (radio ~1.07); si cambia el módulo, el texto se re-escribe
    // por cirugía. Siempre mira a la cámara (billboard) — los 147 módulos
    // del sitio se leen al vuelo sin 147 letreros vivos.
    this.ciudadTick++;
    if (this.ciudadRotulo && this.ciudadSlabs.length && this.ciudadGrupo) {
      if (this.ciudadTick % 6 === 0) {
        const escR = this.ciudadGrupo.scale.x;
        const relXR = (this.camara.position.x - this.ciudadGrupo.position.x) / escR;
        const relYR = (this.camara.position.y - this.ciudadGrupo.position.y) / escR;
        const relZR = (this.camara.position.z - this.ciudadGrupo.position.z) / escR;
        let mejorR = -1, md2R = 1.15;
        for (let i = 0; i < this.ciudadSlabs.length; i++) {
          const s = this.ciudadSlabs[i];
          const dx = relXR - s.x, dy = relYR - s.y, dz = relZR - s.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < md2R) { md2R = d2; mejorR = i; }
        }
        if (mejorR >= 0) {
          const s = this.ciudadSlabs[mejorR];
          if ((s.nombre !== this.ciudadRotuloNombre || s.color !== this.ciudadRotuloColor) && this.fuente) {
            this.refrescarRotulo(s.nombre, s.color);
          }
          if (this.ciudadRotuloTexto) {
            this.ciudadRotulo.position.set(s.x, s.y + 0.19, s.z);
            this.ciudadRotulo.visible = true;
          }
        } else {
          this.ciudadRotulo.visible = false;
        }
      }
      if (this.ciudadRotulo.visible) this.ciudadRotulo.quaternion.copy(this.camara.quaternion);
    }
  }

  // ── HOVER del puente — la placa respira más fuerte bajo el puntero ──
  apuntar(nx: number, ny: number) {
    let objetivo: THREE.Mesh | null = null;
    if (this.ciudadAbierta && this.proxiesCiudad.length) {
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(nx, ny), this.camara);
      const hit = ray.intersectObjects(this.proxiesCiudad, false)[0];
      if (hit && ancestroVisible(hit.object)) objetivo = hit.object as THREE.Mesh;
    } else if (this.proxiesHolo.length) {
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
  golpear(nx: number, ny: number, ignorarUI: boolean): { tipo: "holo" | "ciudad" | "portal" | "marcador" | "globo" | "sala" | "nada"; datos?: MarcadorWGL; punto?: THREE.Vector3; zona?: number; accion?: string; key?: string; edificio?: { tab: string; nombre: string; color: number } } {
    if (ignorarUI) return { tipo: "nada" };
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(nx, ny), this.camara);
    // v154: LA CIUDAD-MENÚ — los edificios pisan a TODO mientras eliges
    // (v158: no durante el vuelo de ida/regreso — la cámara viaja)
    // v159: tocar un edificio YA NO entra — devuelve la intención y el
    // mundo pregunta «¿ENTRAR?» con SÍ/NO; SÍ/NO del panel también viven aquí
    // v162 BUG DE QA: los botones del prompt compiten con los proxies de
    // las torres (una torre cercana robaba el toque del SÍ y re-abría la
    // pregunta equivocada) — el panel anclado a cámara SIEMPRE va primero
    if (this.ciudadAbierta && !this.enVuelo && this.ciudadPromptProxies.length) {
      const hitP = ray.intersectObjects(this.ciudadPromptProxies, false)[0];
      if (hitP && ancestroVisible(hitP.object)) {
        const u = hitP.object.userData?.ciudad;
        if (u?.no) return { tipo: "ciudad", key: "__no" };
        if (u?.si) return { tipo: "ciudad", key: "__si", edificio: { tab: String(u.si.tab), nombre: "", color: 0xf5c542 } };
      }
    }
    if (this.ciudadAbierta && !this.enVuelo && this.proxiesCiudad.length) {
      const hitC = ray.intersectObjects(this.proxiesCiudad, false)[0];
      if (hitC && ancestroVisible(hitC.object)) {
        const u = hitC.object.userData?.ciudad;
        if (u?.cerrar) return { tipo: "ciudad", key: "__cerrar" };
        if (u?.no) return { tipo: "ciudad", key: "__no" };
        if (u?.si) return { tipo: "ciudad", key: "__si", edificio: { tab: String(u.si.tab), nombre: "", color: 0xf5c542 } };
        if (u?.tab) return { tipo: "ciudad", key: "__preguntar", edificio: { tab: String(u.tab), nombre: String(u.nombre ?? ""), color: Number(u.color ?? 0xf5c542) } };
      }
    }
    // v144: EL PUENTE primero — las placas de mando pisan al resto del mundo
    if (this.proxiesHolo.length) {
      const hitH = ray.intersectObjects(this.proxiesHolo, false)[0];
      if (hitH && ancestroVisible(hitH.object) && hitH.object.userData?.holo) {
        return { tipo: "holo", accion: hitH.object.userData.holo.accion as string, key: hitH.object.userData.holo.key as string | undefined };
      }
    }
    // v145: LAS PLACAS DE LA SALA 3D — votar la crisis, abrir un meme…
    // v157 QA: solo si la sala está VISIBLE — una sala montada pero no
    // anclada (ceremonia, modo mundo) ya NO roba toques al globo (el
    // «TOUCH THE GLOBE» dejaba de funcionar si un payload llegó antes)
    if (this.salaInst && this.salaInst.grupo.visible && this.salaInst.proxies.length) {
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
    // v149: en economía de guerra las partículas duermen pase lo que pase
    this.particulasOro.visible = zona === 3 && !this.ecoOn;
    this.particulasAzul.visible = zona === 4 && !this.ecoOn;
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
  // v168 SIN MAPA EN LA INTRO — EL ENCENDIDO DEL MUNDO: el planeta y sus
  // teatros de guerra NO participan de la ceremonia; se encienden cuando el
  // piloto ENTRA (paridad exacta con reencuentro: atmósfera 1.35 + marcadores)
  encenderMundo() {
    const atmMat = this.atmosfera.material as THREE.ShaderMaterial;
    const op = { o: atmMat.uniforms.uOp.value };
    this.animarP(op, { o: 1.35 }, 900, {
      onUpdate: () => atmMat.uniforms.uOp.value = op.o,
    });
    this.encenderMarcadores(() => sonar("onda"));
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
  // v153 TOPE 30fps EN MÓVIL: frame-skip honesto que devuelve la mitad del
  // CPU/GPU/CSS3D al aparato (la física usa dt clampeado: cero impacto). La
  // RESOLUCIÓN ADAPTATIVA vive en el GOBERNADOR v149 (gobernarCalidad →
  // nivelCal → aplicarCalidad): aquí solo queda el tope de frecuencia —
  // un aparato sano renderiza 30fps estables (>27: el gobernador no castiga),
  // uno sufriendo cae por debajo y el gobernador baja la calidad solo.
  private acumFrame = 0;
  private vigiaMemT = 0; // v157: latido del vigilante de VRAM
  loop = () => {
    if (!this.vivo) return;
    this.raf = requestAnimationFrame(this.loop);
    this.ultimoFrame = performance.now();
    // v155.0 LA CORTINA: el primer latido del corazón es la señal de vida —
    // la pantalla de arranque estática (layout) se retira al verla
    if (!(window as unknown as { __vgvivo?: boolean }).__vgvivo) {
      (window as unknown as { __vgvivo?: boolean }).__vgvivo = true;
    }
    const dt = Math.min(0.05, this.reloj.getDelta());
    if (this.calidadBaja) {
      this.acumFrame += dt;
      if (this.acumFrame < 1 / 31) return; // frame-skip: el rAF sigue, el render no
      this.acumFrame = 0;
    }
    const t = this.reloj.elapsedTime;

    // v149 GOBERNADOR: mide el pulso real cada 1.6s y decide
    this.fpsN++;
    if (this.fpsT0 === 0) this.fpsT0 = t;
    else if (t - this.fpsT0 >= 1.6) {
      const fps = this.fpsN / (t - this.fpsT0);
      this.fpsN = 0; this.fpsT0 = t;
      this.gobernarCalidad(fps);
    }

    // v157 — EL VIGILANTE DE VRAM: en sesiones largas el heap de GPU puede
    // inflarse (contextos evictados = «lo 3D se borra»). Cada 8s mira los
    // contadores del renderizador: si algo respira raro, libera las listas
    // de render y deja constancia — el guard de recarga re-armable es la
    // segunda línea de defensa.
    this.vigiaMemT += dt;
    if (this.vigiaMemT >= 8) {
      this.vigiaMemT = 0;
      const mem = this.renderer.info.memory;
      if (mem.geometries > 1400 || mem.textures > 90) {
        this.renderer.renderLists.dispose();
        console.warn("[v157] vigilante de VRAM: geos=" + mem.geometries + " tex=" + mem.textures + " — listas de render liberadas");
      }
    }

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
    // v149 ECONOMÍA DE GUERRA (nivel>=2): los adornos dejan de respirar —
    // la fluidez del vuelo vale más que un parpadeo decorativo
    if (!this.ecoOn) {
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
    }

    // v145 — VUELO LIBRE: el teclado/drag/pinza mueven la cámara ANTES del
    // render (la consola, el rail y la ventana pegan a la nueva pose)
    this.integrarLibre(dt);
    // v157 — LA CORREA NUEVA: la Casa NO persigue (baliza de retorno)
    this.seguirPiloto(dt);
    // v157 — LA VIDA ORBITAL: satélites, jets, cometas, drones, baliza
    this.ticVida(t, dt);
    // v157 — LA RESPIRACIÓN DEL PILOTO: quietud medida por frame
    const quieto = this.punteros.size === 0 && !this.arrastrando && this.vel.lengthSq() < 1e-7 && !this.enVuelo;
    this.idleT = quieto ? this.idleT + dt : 0;
    this.respiracionIdle(t);

    // v148 — EL CASCO DEL PILOTO pega a la cámara y respira con los stores
    // v159: en la CIUDAD el casco DUERME — la metrópolis es el menú, cero
    // fichas/combos flotando sobre los edificios (una pantalla, un foco)
    if (this.hud3D) {
      this.hud3D.grupo.visible = this.consolaVisibleFin && !this.ciudadAbierta;
      // el logo del casco SOLO asoma si el del cielo no está (cero duplicado)
      this.hud3D.logo.visible = !this.logoGrupo?.visible;
      if (this.consolaVisibleFin) {
        this.hud3D.colocar(this.camara);
        this.hud3D.tic(t, dt);
      }
    }

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
    // v167 BUG R19 — EL WATCHDOG DEL ANCLA DIFERIDA: la sala montada a mitad
    // de vuelo despierta en cuanto el vuelo suelta la cámara
    if (this.salaAnclaPendiente && !this.enVuelo) {
      this.salaAnclaPendiente = false;
      if (this.salaInst && this.capsulaAcoplada && !this.modoMundo && this.zona !== 0 && !this.ciudadAbierta) {
        this.anclarSala(true);
        this.acoplarCapsula(this.zona, true);
        this.salaInst.grupo.visible = true;
      }
    }
    // v148: el mundo privado de la sección también respira
    if (this.mundoInst && this.mundoInst.grupo.visible) this.mundoInst.tic(t, dt);
    // v166 — CAPAS LIMPIAS EN LA CASA: cuando el piloto ENTRA (cámara en
    // local de la sala, z < -0.35), el mundo privado de la sección SE APARTA
    // — dentro manda la casa; al salir, el telón de fondo vuelve
    if (this.salaInst && this.mundoInst) {
      _vA.copy(this.camara.position);
      this.salaInst.grupo.worldToLocal(_vA);
      const dentro = _vA.z < -0.35 && _vA.z > -8.4 && Math.abs(_vA.x) < 2.8 && _vA.y > -3.6 && _vA.y < 3.2;
      if (dentro !== this.mundoFueraDeCasa) {
        this.mundoFueraDeCasa = dentro;
        this.mundoInst.grupo.visible = !dentro;
      }
    }
    // v166: LA CÚPULA DEL MÓDULO pega a la cámara (el fondo te envuelve) y respira
    if (this.salaTemaOn && this.salaCielo && this.salaCieloMat) {
      this.salaCielo.position.copy(this.camara.position);
      this.salaCieloMat.uniforms.uT.value = t;
    }
    // v154/v158 — LA CIUDAD-MENÚ: es un LUGAR fijo del universo (no se
    // ancla a nada); solo respira — naves, ventanas, farolas, emblema
    if (this.ciudadAbierta && this.ciudadGrupo) {
      this.ticCiudad(t, dt);
    }
    // v154 — EL TINTE DE SECCIÓN: el fondo del universo lava hacia el color
    // de la sección activa (y la luz ambiental lo acompaña) — cero new por frame
    if (this.cumarTinte) {
      const kT = 1 - Math.exp(-dt * 2.2);
      (this.cumarTinte.material as THREE.MeshBasicMaterial).color.lerp(this.tinteObjetivo, kT);
      if (this.luzAmb) {
        _colA.copy(this.tinteAmbBase).lerp(this.tinteObjetivo, 0.26);
        this.luzAmb.color.lerp(_colA, kT);
      }
    }
    this.acoplarConsolaFrame();
    this.acoplarNavFrame();
    this.acoplarVentanaFrame();
    this.acoplarWidgesFrame();
    this.acoplarJoystickFrame();
    this.cssEscena.updateMatrixWorld(true);
    this.renderer.render(this.escena, this.camara);
    // v149 QA: el render CSS3D va SIEMPRE — el salto condicional dejó
    // objetos nuevos sin DOM insertado (el joy host no nacía) y el ahorro
    // real es marginal: el coste está en el composite del navegador, no aquí
    this.cssRenderer.render(this.cssEscena, this.camara);
  };

  // v149 — EL GOBERNADOR DE CALIDAD: histéresis de 2.5s (nada de verja
  // oscilante), pasos de DPR y economía de adornos a partir del nivel 2.
  private gobernarCalidad(fps: number) {
    const ahora = performance.now();
    if (ahora - this.calUltimo < 2500) return;
    if (fps < 27 && this.nivelCal < 3) { this.nivelCal++; this.calUltimo = ahora; this.aplicarCalidad(); }
    else if (fps > 52 && this.nivelCal > 0) { this.nivelCal--; this.calUltimo = ahora; this.aplicarCalidad(); }
  }

  private aplicarCalidad() {
    // DPR por pasos: 100% → 88% → 78% → 68% del techo del aparato
    const pasos = [1, 0.88, 0.78, 0.68];
    this.dprActual = Math.max(0.72, this.dprBase * pasos[this.nivelCal]);
    this.renderer.setPixelRatio(this.dprActual);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const eco = this.nivelCal >= 2;
    if (eco !== this.ecoOn) {
      this.ecoOn = eco;
      // al salir de economía las partículas de zona despiertan (por zona)
      if (!eco) {
        this.particulasOro.visible = this.zona === 3;
        this.particulasAzul.visible = this.zona === 4;
      }
    }
  }

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

  // v148 — EL VIGÍA DEL CORAZÓN: latido cada 2.2s; si el rAF lleva
  // 2.6s sin latir con la pestaña visible, el bucle se relanza solo.
  arranqueVigia() {
    if (this.vigia !== null) return;
    this.vigia = window.setInterval(() => {
      if (!this.vivo) return; // dormido: pausa legítima
      if (performance.now() - this.ultimoFrame > 2600) {
        console.warn("[v148] bucle rAF estancado con pestaña visible — relanzando");
        cancelAnimationFrame(this.raf);
        this.reloj.getDelta(); // traga el delta muerto (nunca saltos)
        this.raf = requestAnimationFrame(this.loop);
      }
    }, 2200);
  }
  destruir() {
    this.dormir();
    if (this.vigia !== null) { window.clearInterval(this.vigia); this.vigia = null; }
    for (const c of [...this.cancelar]) c();
    this.cancelar.clear();
    // v145: la sala 3D muere con el mundo
    this.desmontarSala(true);
    // v157: la vida orbital y la baliza mueren con el mundo
    this.desechar(this.vidaGrupo);
    this.escena.remove(this.vidaGrupo);
    if (this.balizaCrono) {
      this.escena.remove(this.balizaCrono);
      this.balizaCrono.geometry.dispose();
      this.balizaMat?.dispose();
      this.balizaCrono = null;
      this.balizaMat = null;
      this.balizaOn = false;
    }
    // v148: el casco muere con el mundo — y el chrome DOM vuelve
    if (this.hud3D) {
      this.escena.remove(this.hud3D.grupo);
      this.hud3D.liberar();
      this.hud3D = null;
    }
    document.documentElement.removeAttribute("data-wgl-hud");
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
      window.removeEventListener("vg:sala3d-holo", this.onHoloEv);
      window.removeEventListener("vg:sala3d-datos", this.onSala3dDatosEv);
    window.removeEventListener("vg:sala3d-datos", this.onTeletipoEv);
      // v154: la ciudad y su catálogo mueren con el mundo
      window.removeEventListener("vg:holo-ciudad", this.onCiudadCatalogoEv);
      window.removeEventListener("vg:ciudad-toggle", this.onCiudadToggleEv);
      (window as unknown as { __vgMundo?: MundoWGL | null }).__vgMundo = null;
      this.destruirCiudad();
      if (this.cumarTinte) {
        this.escena.remove(this.cumarTinte);
        this.cumarTinte.geometry.dispose();
        (this.cumarTinte.material as THREE.Material).dispose();
        this.cumarTinte = null;
      }
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
    // v147: el joystick muere con el mundo (sus listeners van con él)
    try {
      this.joyEl?.remove();
      this.joyObj = null;
      this.joyEl = null;
      this.joyKnob = null;
    } catch { /* silencio honesto */ }
    this.renderer.dispose();
  }
}

// ────────────────────────────────────────────────────────────
// EL COMPONENTE — canvas fijo del mundo + secuencia de entrada
// + popup de conflicto + sincronía con la Casa (page.tsx)
// ────────────────────────────────────────────────────────────
const LLAVE_ENTRADA = "vg-wgl-entrada-v1";

// v168 SIN MAPA EN LA INTRO: las fases «globo» y «marcadores» (el mapa con
// los teatros de guerra latiendo) FUERA de la ceremonia — la entrada es
// cine → estrellas → logo → tagline → hint; el mundo real se enciende al ENTRAR
// v174 EL CINE DE VANGUARD: placas de noticias GTA-style ANTES del título —
// conflicto a conflicto, foto real + nombre gigante + acento propio (skip siempre)
type Fase = "cine" | "negro" | "estrellas" | "logo" | "tagline" | "hint" | "volando" | "fin";

// ═══ LAS PLACAS DEL CINE — cada conflicto con SU acento y SU dato duro.
// Fotos reales ya viviendo en /public (cero red, cero lag, móvil primero).
// Mandato del Dueño: «intros hermosas, diferentes, como las de GTA pero de
// noticias y personajes». GTA VI: tipografía condensada en itálica, acento
// propio por personaje, cámara en Ken Burns — aquí: la versión de la Agencia.
const CINE_MS = 2150;
const CINE_PLACAS: { foto: string; ceja: string; titulo: string; tituloAcc: string; sub: string; dato: string; acento: string }[] = [
  { foto: "/assets/real/tanks-1.jpg", ceja: "VANGUARD · CONFLICTOS EN VIVO", titulo: "RUSIA —", tituloAcc: "UCRANIA", sub: "El frente que no duerme", dato: "1.100+ KM DE FRENTE · DÍA 1.350+", acento: "#e8c476" },
  { foto: "/assets/real/missile-1.jpg", ceja: "VANGUARD · ORIENTE MEDIO", titulo: "LA REGIÓN", tituloAcc: "EN LLAMAS", sub: "Tres teatros abiertos a la vez", dato: "GAZA · LÍBANO · MAR ROJO", acento: "#ff5a3c" },
  { foto: "/assets/real/carrier-1.jpg", ceja: "VANGUARD · GEOESTRATEGIA", titulo: "LA RUTA", tituloAcc: "DEL PETRÓLEO", sub: "El estrecho que sostiene al mundo", dato: "12% DEL COMERCIO MUNDIAL EN JUEGO", acento: "#4fc3f7" },
  { foto: "/imagenes-reales/kremlin.jpg", ceja: "VANGUARD · EL PODER", titulo: "QUIÉN MANDA", tituloAcc: "EN EL MUNDO", sub: "Líderes, alianzas y tratados rotos", dato: "EL DINERO DETRÁS DE CADA GUERRA", acento: "#b388ff" },
  { foto: "/assets/real/city-1.jpg", ceja: "VANGUARD · EL MUNDO", titulo: "NO DUERME.", tituloAcc: "REPORTA.", sub: "Hora a hora, con fuente y contexto", dato: "NOTICIAS EN VIVO · 24/7 · MAPAS 3D", acento: "#00f0ff" },
  { foto: "/assets/real/jet-1.jpg", ceja: "VANGUARD · TU TURNO", titulo: "EL CENTRO", tituloAcc: "DE NOTICIAS", sub: "Del planeta, en primera persona", dato: "TOCA PARA DESPLEGAR EL UNIVERSO", acento: "#e8c476" },
];

export function MundoWebGL({ tabInicial }: { tabInicial?: string }) {
  const lienzoRef = useRef<HTMLCanvasElement>(null);
  const mundoRef = useRef<MundoWGL | null>(null);
  // v171: el hint de la intro en el IDIOMA DEL PILOTO (8 idiomas reales —
  // antes era español hardcodeado y convivió con el holo.entrar inglés viejo)
  const lang = useLangStore((s) => s.lang);
  const textoEntrar = translate(lang, "holo.entrar");
  // v144: la placa ENTRAR del puente vive fuera del ciclo de render — el
  // raycast del mundo la llama vía ref (el callback cambia con la fase)
  const entrarRef = useRef<(() => void) | null>(null);
  const [fase, setFase] = useState<Fase>("negro");
  const [soporte, setSoporte] = useState<boolean | null>(null); // null = verificando
  // v148 — BLINDAJE ANTI-2D: la sonda REINTENTA (el navegador a veces
  // agota los contextos con otras pestañas y los libera al cerrarlas)
  // y si el GPU retira el contexto en pleno vuelo, el mundo se avisa.
  const [sondeo, setSondeo] = useState(0);
  const [ctxPerdido, setCtxPerdido] = useState(false);
  const [escrito, setEscrito] = useState("");
  const [popup, setPopup] = useState<{ x: number; y: number; m: MarcadorWGL } | null>(null);
  const tiempos = useRef<number[]>([]);
  const TAGLINE = "El mundo no espera. Tú tampoco.";
  // v174 EL CINE — índice de placa + guard anti-doble-fin (tap y auto-timer
  // pueden chocar en la última placa: la ceremonia jamás se agenda dos veces)
  const [cineIdx, setCineIdx] = useState(0);
  const cineFinRef = useRef(false);

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
      if (!gl) {
        // v148 REINTENTO — jamás rendirse a la primera: el contexto puede
        // estar agotado por otra pestaña y liberarse al cerrarla
        if (sondeo < 2) {
          const id = window.setTimeout(() => setSondeo((s) => s + 1), 900 * (sondeo + 1));
          tiempos.current.push(id);
          return;
        }
        setSoporte(false);
        return;
      }
      setSoporte(true);
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

    // v148 — SI EL GPU RETIRA EL CONTEXTO en pleno vuelo (OOM, driver,
    // otra pestaña pesada): el mundo SE ENTERA — aviso holo + recuperación.
    // Si el navegador no restaura en 4s, UNA recarga de cortesía (guard
    // anti-bucle en sessionStorage) reentra limpia: eso mata el «arranca
    // 2D / mundo muerto» que el Dueño veía tras sesiones largas.
    const LLAVE_RECARGA = "vg148-recarga";
    let timerCtx = 0;
    const onCtxPerdido = (e: Event) => {
      e.preventDefault();
      setCtxPerdido(true);
      let ya = false;
      try { ya = window.sessionStorage.getItem(LLAVE_RECARGA) === "1"; } catch {}
      if (!ya) {
        timerCtx = window.setTimeout(() => {
          try { window.sessionStorage.setItem(LLAVE_RECARGA, "1"); } catch {}
          window.location.reload();
        }, 4000);
        tiempos.current.push(timerCtx);
      }
    };
    const onCtxRestaurado = () => {
      window.clearTimeout(timerCtx);
      try { window.sessionStorage.removeItem(LLAVE_RECARGA); } catch {}
      setCtxPerdido(false);
      mundo?.despertar();
      // v157 — EL GUARD RE-ARMABLE: la recarga de cortesía era UNA sola por
      // pestaña (sessionStorage la guardaba para siempre) — si el GPU perdía
      // el contexto OTRA VEZ en una sesión larga, el 3D moría SIN remedio
      // («cuando uno dura mucho tiempo lo 3D se borra»). Ahora el guard
      // expira 30s tras cada restauración: la recuperación vuelve a ARMARSE.
      const tRearm = window.setTimeout(() => {
        try { window.sessionStorage.removeItem(LLAVE_RECARGA); } catch {}
      }, 30000);
      tiempos.current.push(tRearm);
    };
    mundo.renderer.domElement.addEventListener("webglcontextlost", onCtxPerdido);
    mundo.renderer.domElement.addEventListener("webglcontextrestored", onCtxRestaurado);

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
      // v174: el CINE es pantalla de cine — sus toques NUNCA raycastean
      if (el && typeof el.closest === "function" && el.closest("button,a,input,textarea,select,[role=button],[data-wgl-panel],.vg143-capsula,.vg143-navhost,.vg145-ventana,.vg145-widhost,.vg147-joyhost,.vg174-cine")) return;
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
      // v154: CIUDAD-MENÚ — v159: el edificio PREGUNTA antes de entrar
      if (g.tipo === "ciudad") {
        sonar("click");
        if (g.key === "__cerrar") { m.cerrarCiudad(); return; }
        if (g.key === "__no") { m.cerrarPregunta(); return; }
        if (g.key === "__si" && g.edificio) {
          const tabSi = g.edificio.tab;
          m.cerrarPregunta();
          // ENTRAR confirmado: la Casa abre la pestaña y el cambio de pestaña
          // recoge la ciudad (setPestanasHolo → cerrar)
          window.dispatchEvent(new CustomEvent("vg:holo-accion", { detail: { accion: "tab", key: tabSi } }));
          return;
        }
        if (g.key === "__preguntar" && g.edificio) { m.preguntarEntrada(g.edificio); return; }
        // respaldo legacy: llave de tab directa
        window.dispatchEvent(new CustomEvent("vg:holo-accion", { detail: { accion: "tab", key: g.key } }));
        return;
      }
      if (g.tipo === "sala") {
        sonar("click");
        try {
          const acc = JSON.parse(g.key ?? "{}");
          // v172 PAGINACIÓN UNIVERSAL: las placas SIGUIENTE/ATRAS son un
          // asunto DEL MUNDO — pintan la página aquí, nunca viajan a la Casa
          if (acc?.accion === "__pagina") {
            m.salaInst?.paginar?.(acc.idx);
            return;
          }
          // v172 EL PULSO DE LA PARIDAD: el raycast del mundo se cuenta
          // (punto único; "fila" sin acción y navegación no son acciones)
          if (acc?.tab && acc?.accion && acc.accion !== "fila") {
            contarAccion(acc.tab, acc.accion, "3d");
          }
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
      // v154: ESC recoge la ciudad (la casa siempre responde)
      if (k === "escape" && down && m.ciudadAbierta) { m.cerrarCiudad(); return; }
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
      if (el && typeof el.closest === "function" && el.closest(".vg143-capsula,.vg145-ventana,.vg143-navhost,.vg145-widhost,.vg147-joyhost,.vg174-cine")) return;
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
      if (mundo) {
        mundo.renderer.domElement.removeEventListener("webglcontextlost", onCtxPerdido);
        mundo.renderer.domElement.removeEventListener("webglcontextrestored", onCtxRestaurado);
      }
      for (const id of tiempos.current) clearTimeout(id);
      mundo?.destruir();
      document.documentElement.removeAttribute("data-wgl");
      document.documentElement.removeAttribute("data-wgl-modo");
    };
  }, [sondeo]);

  // ════════════════════════════════════════════════════════
  // v159 EL ATERRIZAJE — «no veo nada de sentido, todo desordenado»:
  // el piloto YA NO aterriza en la sopa del corredor. Al terminar la
  // ceremonia (o el reencuentro) el mundo VUELA SOLO hasta la CIUDAD:
  // la metrópolis ordenada ES la pantalla de inicio — un edificio por
  // módulo, una sola acción clara (tocar para entrar). Con reintentos
  // por si el vuelo de zona inicial aún no soltó la cámara.
  // ════════════════════════════════════════════════════════
  const aterrizajeCiudad = useCallback(() => {
    let n = 0;
    const tic = () => {
      const m = mundoRef.current;
      if (!m || !m.vivo) return;
      if (m.ciudadAbierta) return;
      // v167 BUG R19: si la ciudad ya se cerró una vez (el piloto entró a un
      // módulo durante la ventana de reintentos), el aterrizaje RETIRA SU
      // MANO — jamás re-abre la ciudad encima del módulo vivo
      const retirarMano = () => {
        // v167 BUG R19 (4ª pata): el retiro COMPLETA el compromiso de zona —
        // si el piloto entró ANTES de que la ceremonia llegara a su zona
        // (zona 0 = limbo: sin ciudad, sin sala, sin mundo), el mundo vuela
        // a la zona base y el onDone del vuelo acopla la cápsula y ancla la
        // sala del módulo elegido. En mapped (crisis/arcade/perfil) la Casa
        // ya despachó su vg:wgl-ir-a — volarAZona es guardado (enVuelo/zona).
        const z = m.zona === 0 ? 1 : m.zona;
        if (!m.enVuelo) m.volarAZona(z);
      };
      if (m.ciudadCerradaAlgunaVez) { retirarMano(); return; }
      // v167 BUG R19 (cura definitiva): el mundo recuerda la sala del
      // arranque — si la activa ya es OTRA, el piloto eligió destino y el
      // aterrizaje retira su mano (inmune al timing de la Casa)
      if (m.salaLlaveArranque && m.salaLlave !== m.salaLlaveArranque) { retirarMano(); return; }
      if (!m.enVuelo) {
        m.abrirCiudad();
        if (m.ciudadAbierta) return;
      }
      if (++n < 7) window.setTimeout(tic, 900);
    };
    window.setTimeout(tic, 750);
  }, []);

  // ═══ v174 LA CEREMONIA DEL TÍTULO — agenda única, salta tras el cine ═══
  // (era el corazón de la secuencia de entrada; ahora es función propia para
  // que el cine GTA la llame al terminar — jamás agendada dos veces: cineFinRef)
  const arrancarCeremonia = useCallback(() => {
    const T = (s: number) => s * 1000;
    // v168 SIN MAPA EN LA INTRO — CEREMONIA PURA DE TÍTULO: estrellas →
    // logo → tagline → hint. Sin planeta de frente, sin marcadores latiendo
    // (el mapa ya no espera al piloto: el mundo se descubre volando)
    despues(T(1.0), () => { setFase("estrellas"); mundoRef.current?.setFaseEntrada("estrellas"); mundoRef.current?.nacerEstrellas(); });
    despues(T(2.0), () => { setFase("logo"); mundoRef.current?.setFaseEntrada("logo"); mundoRef.current?.nacerLogo(); });
    despues(T(3.0), () => { setFase("tagline"); mundoRef.current?.setFaseEntrada("tagline"); });
    despues(T(4.0), () => { setFase("hint"); mundoRef.current?.setFaseEntrada("hint"); mundoRef.current?.invitar(); });
  }, [despues]);

  // ═══ v174 EL CINE DE VANGUARD — la entrada GTA de noticias ═══
  // Tocar la placa avanza; SALTAR o la última placa sueltan a la ceremonia.
  const cineFin = useCallback(() => {
    if (cineFinRef.current) return;
    cineFinRef.current = true;
    setFase("negro");
    arrancarCeremonia();
  }, [arrancarCeremonia]);
  const avanzarCine = useCallback(() => {
    setCineIdx((i) => {
      if (i >= CINE_PLACAS.length - 1) { cineFin(); return i; }
      sonar("tic");
      return i + 1;
    });
  }, [cineFin]);
  const terminarCine = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    cineFin();
  }, [cineFin]);
  // auto-avance — cada placa respira CINE_MS y pasa sola (GTA-style)
  useEffect(() => {
    if (fase !== "cine") return;
    const id = window.setTimeout(avanzarCine, CINE_MS);
    return () => window.clearTimeout(id);
  }, [fase, cineIdx, avanzarCine]);

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
      // v148: el arranque ya no es 2D — la Casa despierta cuando el mundo está listo
      window.dispatchEvent(new CustomEvent("vg:wgl-entrada-estado", { detail: { on: false } }));
      setFase("fin");
      mundoRef.current?.reencuentro(z);
      mundoRef.current?.setFaseEntrada("fin");
      // v159 EL ATERRIZAJE: la recarga también nace en la CIUDAD — el hogar ordenado
      aterrizajeCiudad();
      return;
    }
    // v148 CEREMONIA PURA: la Casa se aparta — el negro y las estrellas SON la
    // pantalla de carga; nada de chrome plano alrededor del universo
    document.documentElement.setAttribute("data-wgl-entrada", "1");
    window.dispatchEvent(new CustomEvent("vg:wgl-entrada-estado", { detail: { on: true } }));
    // v174 EL CINE PRIMERO: placas de noticias GTA-style antes del título.
    // reduced-motion o ceremonia ya vista → directo al título (honesto: nada
    // obliga a ver el cine dos veces en la misma sesión)
    cineFinRef.current = false;
    setCineIdx(0);
    let cineOK = true;
    try { cineOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch {}
    if (cineOK) setFase("cine");
    else cineFin();
    return () => { for (const id of tiempos.current) clearTimeout(id); tiempos.current = []; };
  }, [soporte, aterrizajeCiudad, arrancarCeremonia, cineFin]);

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
      m.encenderMundo(); // v168: el planeta + teatros se encienden al ENTRAR (no en la intro)
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
      // v148: la ceremonia terminó — la Casa despierta (la cápsula ya nace
      // acoplada: cero flash del chrome plano entre el vuelo y el aterrizaje)
      window.dispatchEvent(new CustomEvent("vg:wgl-entrada-estado", { detail: { on: false } }));
      window.dispatchEvent(new CustomEvent("vg:wgl-entrada-fin"));
    });
    despues(1250, () => {
      setFase("fin");
      mundoRef.current?.setFaseEntrada("fin");
      // v159 EL ATERRIZAJE: terminada la ceremonia, el mundo vuela SOLO a la ciudad
      aterrizajeCiudad();
    });
  }, [fase, despues, aterrizajeCiudad]);

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
      {/* v174 EL CINE DE VANGUARD — placas GTA de noticias antes del título */}
      {fase === "cine" && (
        <div className="vg174-cine" onClick={avanzarCine} role="presentation">
          <div
            className="vg174-cine-card"
            key={cineIdx}
            style={{ "--vg174acc": CINE_PLACAS[Math.min(cineIdx, CINE_PLACAS.length - 1)].acento } as React.CSSProperties}
          >
            <div
              className="vg174-cine-foto"
              style={{ backgroundImage: `url(${CINE_PLACAS[Math.min(cineIdx, CINE_PLACAS.length - 1)].foto})` }}
              aria-hidden
            />
            <div className="vg174-cine-lava" aria-hidden />
            <div className="vg174-cine-txt">
              <em>{CINE_PLACAS[cineIdx].ceja}</em>
              <strong>
                {CINE_PLACAS[cineIdx].titulo} <b>{CINE_PLACAS[cineIdx].tituloAcc}</b>
              </strong>
              <span>{CINE_PLACAS[cineIdx].sub}</span>
            </div>
            <i className="vg174-cine-dato" aria-hidden>{CINE_PLACAS[cineIdx].dato}</i>
          </div>
          <div className="vg174-cine-barras" aria-hidden><i /><i /></div>
          <div className="vg174-cine-progreso" aria-hidden>
            {CINE_PLACAS.map((_, i) => (
              <i key={i} data-on={i <= cineIdx ? "1" : "0"} />
            ))}
          </div>
          <button type="button" className="vg174-cine-saltar" onClick={terminarCine}>
            Saltar »
          </button>
        </div>
      )}
      {/* LA ENTRADA — cine → negro → estrellas → logo → tagline → hint (v168: SIN mapa) */}
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
              {textoEntrar || "Toca para entrar"}
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
      {/* v148 — EL GPU RETIRÓ EL CONTEXTO: aviso holo mientras el mundo
          se recupera (restauración del navegador o recarga de cortesía) */}
      {ctxPerdido && (
        <div className="vg148-ctxperdido" role="alert">
          <span className="vg148-ctxperdido-aro" aria-hidden />
          <strong>REESTABLECIENDO EL UNIVERSO</strong>
          <em>El motor 3D perdió el enlace con tu GPU — reconectando</em>
        </div>
      )}
    </>
  );
}

// fallback honesto: sin WebGL la Casa no se rompe (REGLA 5 del mundo)
function IntroFallback() {
  const [Comp, setComp] = useState<React.ComponentType | null>(null);
  useEffect(() => {
    // v148: sin mundo WebGL la Casa DOM es el único cuerpo — despierta al instante
    window.dispatchEvent(new CustomEvent("vg:wgl-entrada-estado", { detail: { on: false } }));
    let vivo = true;
    import("@/components/vanguard/intro-cinematica").then((m) => {
      if (vivo) {
        setComp(() => m.IntroCinematica);
        // v155.0 LA CORTINA: la intro va a pintarse — señal de vida a la cortina
        (window as unknown as { __vgvivo?: boolean }).__vgvivo = true;
      }
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
function sonar(tipo: "ping" | "whoosh" | "onda" | "freno" | "tic" | "click" | "clank" | "cascada", pitch = 1) {
  try {
    ctxAudio = ctxAudio || new (window.AudioContext || (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (!ctxAudio || ctxAudio.state === "suspended") return;
    const t = ctxAudio.currentTime;
    const g = ctxAudio.createGain();
    g.connect(ctxAudio.destination);
    if (tipo === "cascada") {
      // v172: la CASCADA DEL ASCENSO — una gota de cristal por fila revelada
      // (sine corto, ganancia susurrada, pitch ascendente por índice de fila)
      const o = ctxAudio.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(640 * Math.max(0.5, Math.min(2.2, pitch)), t);
      g.gain.setValueAtTime(0.016, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      o.connect(g); o.start(t); o.stop(t + 0.08);
    } else if (tipo === "tic") {
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
