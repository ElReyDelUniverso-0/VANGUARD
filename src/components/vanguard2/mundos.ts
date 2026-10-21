"use client";

// ============================================================
// VANGUARD-2 · MUNDOS (parte A) — base compartida, HUB, índice
// total de las 147 secciones y generador procedural.
// Cada sección vive en SU PROPIO mundo: se construye al entrar,
// se despieza al salir. Nada comparte escena.
// ============================================================
import * as THREE from "three";
import { type MotorV2, type MundoV2, rngDe, acotar, seguro } from "./motor";
import TABS_V2 from "./tabs-v2.json";
import { construirMundoNoticias, construirMundoQuiz, construirMundoEncuestas, construirMundoPerfil, construirMundoTienda, construirMundoLogros, construirMundoConflictos, construirMundoMemes, construirMundoPredicciones, construirMundoEconomia } from "./mundos-datos";

export interface MetaTab { key: string; short: string; label: string; color: string }
export const SECCIONES: MetaTab[] = TABS_V2 as MetaTab[];
export const metaDe = (key: string): MetaTab =>
  SECCIONES.find((t) => t.key === key) ?? { key, short: seguro(key).slice(0, 9), label: "Sección de Vanguard", color: "cyan" };

const MAT_COLOR: Record<string, string> = {
  amber: "oro", red: "rojo", green: "verde", cyan: "cian",
  violet: "violeta", sky: "cian", blue: "cian",
};
export const colorDe = (c: string): string => MAT_COLOR[c] ?? "texto";
const TINTE: Record<string, number> = {
  amber: 0xffd9a0, red: 0xffb0a8, green: 0xa8ffd0, cyan: 0x9fe8ff, violet: 0xd8b0ff,
};

// ────────────────────────────────────────────────────────────
// BASE DE MUNDO: cielo + título extruido + VOLVER + frases
// ────────────────────────────────────────────────────────────
export interface BaseMundo extends MundoV2 {
  contenido: THREE.Group; // grupo dinámico reconstruible
  fraseGrupo: THREE.Group; // anillo de frases girando
  nucleo?: THREE.Group; // monumento central
}

export function baseMundo(
  motor: MotorV2,
  key: string,
  titulo: string,
  sub: string,
  colorMat: string,
  frases: string[]
): BaseMundo {
  const escena = new THREE.Scene();
  escena.fog = new THREE.Fog(0x02040a, 18, 78);
  motor.cielo(escena, { tinte: TINTE[Object.keys(MAT_COLOR).find((k) => MAT_COLOR[k] === colorMat) ?? "cyan"] ?? 0x9fe8ff });

  const contenido = new THREE.Group();
  escena.add(contenido);

  // pickables oficiales del mundo (PRIMERO: todo botón que nazca después
  // se registra aquí dentro — lección QA v151)
  const pickables = motor.nuevoPickables();

  // TÍTULO EXTRUIDO GRANDE (las letras del mundo)
  motor.texto3D(escena, titulo, { tam: 0.52, prof: 0.14, mat: colorMat, pos: new THREE.Vector3(0, 2.55, -1.6) });
  motor.texto3D(escena, acotar(sub, 46), { tam: 0.13, prof: 0.03, mat: "texto", pos: new THREE.Vector3(0, 2.18, -1.6) });

  // VOLVER + ÍNDICE (botones 3D)
  motor.boton3D(escena, "VOLVER", "volver", { w: 0.62, h: 0.17, tam: 0.072, matPlaca: "cristal", pos: new THREE.Vector3(-1.7, -1.72, -1.4) });
  motor.boton3D(escena, "INDICE", "indice", { w: 0.62, h: 0.17, tam: 0.072, matPlaca: "cristal", pos: new THREE.Vector3(-1.0, -1.72, -1.4) });

  // ANILLO DE FRASES DEL MUNDO (emite sus propias frases)
  const fraseGrupo = motor.anilloFrases(escena, frases, 3.4, colorMat, 0.115);
  fraseGrupo.position.y = -1.15;

  const mundo: BaseMundo = {
    key,
    titulo,
    escena,
    camaraPos: new THREE.Vector3(0, 0.5, 7.4),
    camaraMira: new THREE.Vector3(0, 0.35, 0),
    pickables,
    contenido,
    fraseGrupo,
    tick(t) {
      fraseGrupo.rotation.y = t * 0.12;
    },
  };
  return mundo;
}

/** Portal 3D: anillo + cristal + nombre extruido + lema. */
export function portal3D(
  motor: MotorV2,
  padre: THREE.Object3D,
  nombre: string,
  lema: string,
  colorMat: string,
  pos: THREE.Vector3,
  accion: string
): THREE.Group {
  const g = new THREE.Group();
  const anillo = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.035, 8, 40), motor.mat(colorMat));
  g.add(anillo);
  const cristal = new THREE.Mesh(new THREE.CircleGeometry(0.5, 28), motor.mat("cristal"));
  g.add(cristal);
  motor.texto3D(g, nombre, { tam: 0.14, prof: 0.045, mat: colorMat, max: 11, pos: new THREE.Vector3(0, 0.12, 0.06) });
  motor.texto3D(g, acotar(lema, 16), { tam: 0.062, prof: 0.014, mat: "texto", pos: new THREE.Vector3(0, -0.12, 0.05) });
  g.position.copy(pos);
  g.userData.accion = accion;
  padre.add(g);
  motor.registrarPickable(g);
  return g;
}

/** Monumento procedural único por semilla. */
export function nucleoTematico(motor: MotorV2, semilla: string, colorMat: string): THREE.Group {
  const rng = rngDe(semilla);
  const g = new THREE.Group();
  const tipo = Math.floor(rng() * 5);
  let geo: THREE.BufferGeometry;
  switch (tipo) {
    case 0: geo = new THREE.IcosahedronGeometry(0.85, 0); break;
    case 1: geo = new THREE.TorusKnotGeometry(0.55, 0.16, 64, 10); break;
    case 2: geo = new THREE.OctahedronGeometry(0.9, 0); break;
    case 3: geo = new THREE.ConeGeometry(0.7, 1.5, 6); break;
    default: geo = new THREE.TorusGeometry(0.62, 0.2, 10, 36); break;
  }
  const cuerpo = new THREE.Mesh(geo, motor.mat(colorMat));
  g.add(cuerpo);
  const envoltura = new THREE.Mesh(geo.clone().scale(1.28, 1.28, 1.28), motor.mat("mallaCian"));
  g.add(envoltura);
  // anillos de órbita
  for (let i = 0; i < 2; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(1.15 + i * 0.28, 0.012, 6, 48), motor.mat("malla"));
    r.rotation.x = Math.PI / 2 + (rng() - 0.5) * 0.9;
    r.rotation.y = (rng() - 0.5) * 0.9;
    g.add(r);
  }
  // partículas orbitales
  const n = motor.movil ? 40 : 80;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(1.6 + rng() * 0.7);
    pos.set([v.x, v.y, v.z], i * 3);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.add(new THREE.Points(pg, motor.mat("puntoOro") as THREE.PointsMaterial));
  return g;
}

// ────────────────────────────────────────────────────────────
// HUB — el portaviones de mundos (sección inicio)
// ────────────────────────────────────────────────────────────
export function construirHub(motor: MotorV2): MundoV2 {
  const m = baseMundo(motor, "inicio", "VANGUARD", "CADA SECCION - SU PROPIO MUNDO 3D - NADA AMARRADO", "oro", [
    "TOCA UN PORTAL PARA VIAJAR",
    "ARRASTRA PARA MIRAR - DOS DEDOS PARA VOLAR",
    "TODO EN VOLUMEN - CADA MINIMO DETALLE",
    "147 MUNDOS EN EL INDICE",
  ]);

  // núcleo planeta
  const nucleo = new THREE.Group();
  const esfera = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95, 2), motor.mat("nucleo"));
  nucleo.add(esfera);
  const red = new THREE.Mesh(new THREE.IcosahedronGeometry(1.08, 1), motor.mat("mallaCian"));
  nucleo.add(red);
  nucleo.position.set(0, 0.1, 0);
  m.escena.add(nucleo);
  m.nucleo = nucleo;

  // anillo interior de portales insignia (5)
  const insignia: Array<[string, string, string]> = [
    ["noticias", "NOTICIAS", "intel real"],
    ["quiz", "QUIZ", "demuestra IQ"],
    ["encuestas", "ENCUESTAS", "vota el mundo"],
    ["tienda", "TIENDA", "equipo real"],
    ["perfil", "PERFIL", "tu ficha"],
  ];
  insignia.forEach(([key, nom, lema], i) => {
    const a = (i / insignia.length) * Math.PI * 2 + 0.5;
    portal3D(motor, m.escena, nom, lema, "cian", new THREE.Vector3(Math.cos(a) * 2.5, 0.55, Math.sin(a) * 2.5), `ir:${key}`);
  });
  // anillo exterior (6)
  const externa: Array<[string, string, string]> = [
    ["conflictos", "CONFLICTOS", "globo vivo"],
    ["memes", "MEMES", "humor geo"],
    ["predicciones", "PRONOSTICO", "que viene"],
    ["logros", "LOGROS", "tu honor"],
    ["economia", "ECONOMIA", "banco v2"],
    ["todas", "INDICE", "147 mundos"],
  ];
  externa.forEach(([key, nom, lema], i) => {
    const a = (i / externa.length) * Math.PI * 2;
    portal3D(motor, m.escena, nom, lema, "oro", new THREE.Vector3(Math.cos(a) * 4.1, -0.5, Math.sin(a) * 4.1), `ir:${key}`);
  });

  m.tick = (t) => {
    m.fraseGrupo.rotation.y = t * 0.12;
    nucleo.rotation.y = t * 0.18;
    nucleo.rotation.x = Math.sin(t * 0.3) * 0.08;
    m.escena.children.forEach((o) => {
      if (o.userData.accion?.startsWith("ir:")) {
        o.position.y += Math.sin(t * 1.6 + o.position.x * 2.1) * 0.0006;
      }
    });
  };
  m.accion = (nombre) => {
    if (nombre.startsWith("ir:")) motor.navegar?.(nombre.slice(3));
  };
  return m;
}

// ────────────────────────────────────────────────────────────
// INDICE TOTAL — las 147 secciones como portales
// ────────────────────────────────────────────────────────────
export function construirIndice(motor: MotorV2): MundoV2 {
  const m = baseMundo(motor, "todas", "INDICE TOTAL", `${SECCIONES.length} SECCIONES - CADA UNA SU MUNDO`, "cian", [
    "CADA PLACA ES UN MUNDO INDEPENDIENTE",
    "TOCA PARA VIAJAR",
  ]);
  // muro curvo de portales (cilindro abierto frente a la cámara)
  const cols = motor.movil ? 9 : 12;
  const filas = Math.ceil(SECCIONES.length / cols);
  const radio = 6.6;
  const grupo = new THREE.Group();
  grupo.position.set(0, 0.4, 0);
  SECCIONES.forEach((tab, i) => {
    const col = i % cols;
    const fila = Math.floor(i / cols);
    const a = ((col - (cols - 1) / 2) / cols) * 1.9;
    const y = ((filas - 1) / 2 - fila) * 0.62;
    const g = new THREE.Group();
    const placa = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.4, 0.02), motor.mat("placa"));
    g.add(placa);
    const marco = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.44, 0.012), motor.mat("mallaCian"));
    marco.position.z = -0.006;
    g.add(marco);
    motor.texto3D(g, tab.short, { tam: 0.095, prof: 0.024, mat: colorDe(tab.color), max: 9 });
    motor.texto3D(g, String(i + 1).padStart(3, "0"), { tam: 0.045, prof: 0.01, mat: "oro", pos: new THREE.Vector3(0.21, 0.13, 0.02) });
    g.position.set(Math.sin(a) * radio, y, -Math.cos(a) * radio + 0.001);
    g.rotation.y = -a;
    g.userData.accion = `tab:${tab.key}`;
    grupo.add(g);
    motor.registrarPickable(g);
  });
  m.escena.add(grupo);
  m.camaraPos.set(0, 0.5, 7.8);
  m.camaraMira.set(0, 0.4, 0);
  m.accion = (nombre) => {
    if (nombre.startsWith("tab:")) motor.navegar?.(nombre.slice(4));
  };
  return m;
}

// ────────────────────────────────────────────────────────────
// MUNDO PROCEDURAL — para CUALQUIER sección (semilla única)
// ────────────────────────────────────────────────────────────
export function construirProcedural(motor: MotorV2, key: string): MundoV2 {
  const meta = metaDe(key);
  const cm = colorDe(meta.color);
  const rng = rngDe(key);
  const m = baseMundo(motor, key, meta.short, acotar(meta.label, 52), cm, [
    "MUNDO INDEPENDIENTE DE " + meta.short,
    "CONSTRUIDO AL ENTRAR - DESPIEZADO AL SALIR",
    "SEMILLA " + Math.floor(rng() * 8999 + 1000),
  ]);
  const nucleo = nucleoTematico(motor, key, cm);
  nucleo.position.set(0, 0.15, 0);
  m.escena.add(nucleo);
  m.nucleo = nucleo;

  // 3 placas de datos vivos derivadas del propio nombre de la sección
  const datos = [
    ["SECCION", meta.short],
    ["CLASE", meta.color.toUpperCase()],
    ["MUNDO", "INDEPENDIENTE"],
  ];
  datos.forEach(([k, v], i) => {
    const g = new THREE.Group();
    motor.texto3D(g, k, { tam: 0.07, prof: 0.016, mat: "texto" });
    motor.texto3D(g, v, { tam: 0.13, prof: 0.04, mat: cm, pos: new THREE.Vector3(0, -0.14, 0) });
    const placa = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.5, 0.02), motor.mat("placa"));
    placa.position.z = -0.014;
    g.add(placa);
    g.position.set((i - 1) * 1.55, -1.1, 0.4);
    m.escena.add(g);
  });

  const fase = rng() * Math.PI * 2;
  m.tick = (t) => {
    m.fraseGrupo.rotation.y = t * 0.12;
    nucleo.rotation.y = t * (0.22 + rng_fija(key));
    nucleo.rotation.x = Math.sin(t * 0.4 + fase) * 0.1;
  };
  m.accion = () => { /* procedural: solo volver/indice */ };
  return m;
}

function rng_fija(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 997;
  return 0.1 + (h % 20) / 100;
}

// ────────────────────────────────────────────────────────────
// REGISTRO — flagship primero, procedural para el resto
// ────────────────────────────────────────────────────────────
export function constructorDe(key: string): (motor: MotorV2) => MundoV2 {
  switch (key) {
    case "inicio": return construirHub;
    case "noticias": return (mo) => construirMundoNoticias(mo, "gdelt");
    case "redaccion": return (mo) => construirMundoNoticias(mo, "redaccion");
    case "quiz": return construirMundoQuiz;
    case "encuestas": return construirMundoEncuestas;
    case "perfil": return construirMundoPerfil;
    case "agente": return construirMundoPerfil;
    case "tienda": return construirMundoTienda;
    case "logros": return construirMundoLogros;
    case "conflictos": return construirMundoConflictos;
    case "memes": return construirMundoMemes;
    case "predicciones": return construirMundoPredicciones;
    case "hacienda": return construirMundoEconomia;
    case "economia": return construirMundoEconomia;
    case "todas": return construirIndice;
    default: return (mo) => construirProcedural(mo, key);
  }
}
