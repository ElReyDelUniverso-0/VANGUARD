"use client";

// ============================================================
// v148.0 MUNDOS PROPIOS — CADA SECCIÓN, SU PROPIO UNIVERSO
// Mandato del Dueño: «cada sección Vanguard debería tener su
// propio mundo 3D y no ligarlas todas... y cada página emita
// sus frases». Este módulo es la FÁBRICA DE MUNDOS: al entrar
// a una rama, la sección deja de ser una placa flotando sobre
// el planeta compartido y RECIBE UN UNIVERSO ENTERO:
//   · EL TELÓN — gran plano tintado que AÍSLA el sector del
//     resto del universo: cada mundo tiene su propio cielo.
//   · LA PLATAFORMA — anillo holográfico de suelo bajo la sala
//     con retícula radial y baliza perimetral.
//   · LOS PROPIOS — velas-torre, silos, antenas, dados,
//     trofeos... cada mundo viste su paisaje con geometría
//     viva que gira, late y respira (nada de papel blanco).
//   · LAS FRASES — 2-3 lemas extruidos que el mundo EMITE al
//     entrar, escalonados: la voz de cada página, en letras
//     3D reales que flotan y respiran.
// Misma piel y protocolo que las salas (CtxSala3D). Un solo
// mundo montado a la vez; al cambiar de rama, el anterior se
// desecha (dispose completo) — cero fuga de memoria.
// ============================================================
import * as THREE from "three";
import {
  type CtxSala3D,
  type PayloadSala3D,
  texto3D,
  sanitizar,
  matMetal,
  matFilo,
  filos,
  polvo,
  acotar,
  COL_VERDE,
  COL_ROJO,
  COL_ORO,
} from "./salas-3d";

export interface Mundo3DInstancia {
  grupo: THREE.Group;
  tic: (t: number, dt: number) => void;
  liberar: () => void;
}

// registro de recursos — todo lo creado pasa por aquí: el
// liberar() barre geometrías y materiales sin huérfanos
function registrar() {
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  return {
    geo<T extends THREE.BufferGeometry>(g: T): T { geos.push(g); return g; },
    mat<T extends THREE.Material>(m: T): T { mats.push(m); return m; },
    liberar() { for (const g of geos) g.dispose(); for (const m of mats) m.dispose(); },
  };
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// aparecimiento escalonado — las frases NACEN una tras otra
function aparecer(
  animarP: CtxSala3D["animarP"],
  mats: THREE.Material[],
  hasta: number,
  ms: number,
  delay: number,
) {
  if (delay > 0) {
    const dummy = { t: 0 };
    animarP(dummy, { t: 1 }, delay, { onDone: () => aparecer(animarP, mats, hasta, ms, 0) });
    return;
  }
  const dif = { o: 0 };
  for (const m of mats) { m.transparent = true; m.opacity = 0; }
  animarP(dif, { o: hasta }, ms, {
    ease: easeOut,
    onUpdate: () => { for (const m of mats) m.opacity = dif.o; },
  });
}

// ────────────────────────────────────────────────────────────
// EL TELÓN — el cielo PRIVADO del mundo: un gran plano tintado
// con resplandor radial del color del sector que aparta al
// planeta compartido (cada rama respira SU atmósfera).
// ────────────────────────────────────────────────────────────
function telon(reg: ReturnType<typeof registrar>, cielo: number): { grupo: THREE.Group; mat: THREE.MeshBasicMaterial } {
  const cv = document.createElement("canvas");
  cv.width = 512; cv.height = 320;
  const g = cv.getContext("2d");
  if (g) {
    // base casi negra + resplandor radial del color del sector
    g.fillStyle = "#04070d";
    g.fillRect(0, 0, 512, 320);
    const hex = `#${cielo.toString(16).padStart(6, "0")}`;
    const rad = g.createRadialGradient(256, 208, 30, 256, 208, 300);
    rad.addColorStop(0, `${hex}55`);
    rad.addColorStop(0.45, `${hex}22`);
    rad.addColorStop(1, "#04070d00");
    g.fillStyle = rad;
    g.fillRect(0, 0, 512, 320);
    // retícula de estrellas tenues — el cosmos propio
    g.fillStyle = "rgba(255,255,255,0.5)";
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * 512, y = Math.random() * 320;
      const s = Math.random() < 0.85 ? 1 : 2;
      g.fillRect(x, y, s, s);
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  const mat = reg.mat(new THREE.MeshBasicMaterial({
    map: tex, transparent: true, opacity: 0.9, depthWrite: false,
  }));
  const plano = new THREE.Mesh(reg.geo(new THREE.PlaneGeometry(23, 12.5)), mat);
  plano.position.set(0, 0.4, -4.4);
  const grupo = new THREE.Group();
  grupo.add(plano);
  return { grupo, mat };
}

// ────────────────────────────────────────────────────────────
// LA PLATAFORMA — el suelo holográfico del sector: disco
// radial, retícula, anillo perimetral y polvo ascendente.
// ────────────────────────────────────────────────────────────
function plataforma(reg: ReturnType<typeof registrar>, color: number, bajo: boolean): THREE.Group {
  const g = new THREE.Group();
  const Y = -1.38;
  // disco de suelo con transparencia (el vacío sigue intuyéndose)
  const disco = new THREE.Mesh(
    reg.geo(new THREE.RingGeometry(1.15, 3.55, bajo ? 36 : 56)),
    reg.mat(new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.12, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })),
  );
  disco.rotation.x = -Math.PI / 2;
  disco.position.y = Y;
  g.add(disco);
  // retícula radial + círculos concéntricos (una sola geometría de líneas)
  const pts: number[] = [];
  const R = 3.55;
  const radios = [1.6, 2.3, 3.0, 3.55];
  const segs = bajo ? 28 : 44;
  for (const r of radios) {
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2, a1 = ((i + 1) / segs) * Math.PI * 2;
      pts.push(Math.cos(a0) * r, Y, Math.sin(a0) * r, Math.cos(a1) * r, Y, Math.sin(a1) * r);
    }
  }
  const nRad = bajo ? 10 : 14;
  for (let i = 0; i < nRad; i++) {
    const a = (i / nRad) * Math.PI * 2;
    pts.push(Math.cos(a) * 1.15, Y, Math.sin(a) * 1.15, Math.cos(a) * R, Y, Math.sin(a) * R);
  }
  const geo = reg.geo(new THREE.BufferGeometry());
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
  const ret = new THREE.LineSegments(geo, reg.mat(matFilo(color, 0.28)));
  g.add(ret);
  // baliza perimetral
  const aro = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(R, 0.014, 6, bajo ? 40 : 72)),
    reg.mat(new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })),
  );
  aro.rotation.x = Math.PI / 2;
  aro.position.y = Y + 0.01;
  g.add(aro);
  return g;
}

// ────────────────────────────────────────────────────────────
// LAS FRASES — la voz del mundo: lemas extruidos que EMITE al
// entrar (estalonados), flotan y respiran. Cada página habla.
// ────────────────────────────────────────────────────────────
interface FraseViva {
  obj: THREE.Object3D;
  y0: number;
  amp: number;
  vel: number;
  fase: number;
}

function frasesDe(
  ctx: CtxSala3D,
  reg: ReturnType<typeof registrar>,
  lemas: string[],
  color: number,
  colorSec: number,
  aparecen: (mats: THREE.Material[], hasta: number, ms: number, delay: number) => void,
  bobbers: FraseViva[],
): THREE.Group {
  const g = new THREE.Group();
  const principal = lemas[0] || "SECTOR VANGUARD";
  const sec = lemas.slice(1);
  // el lema mayor — firma del mundo, centrado arriba (v148 QA: la fila
  // vive en el espacio libre del cuadro, bajo el chrome DOM del techo)
  const may = texto3D(ctx, principal, { tam: 0.285, prof: 0.06, color, emis: 0.85 });
  // auto-ajuste: un lema largo JAMÁS desborda el cuadro
  if (may.ancho > 3.4) may.grupo.scale.setScalar(3.4 / may.ancho);
  may.grupo.position.set(-may.ancho / 2, 0.98, -0.5);
  g.add(may.grupo);
  reg.mat(may.mats[0]);
  aparecen(may.mats, 1, 640, 120);
  bobbers.push({ obj: may.grupo, y0: 0.98, amp: 0.024, vel: 0.7, fase: 0 });
  // los secundarios — flancos en arco, nacen después (v148 QA: ±1.45 —
  // a ±1.75 el flanco derecho moría contra el borde del cuadro)
  sec.forEach((txt, i) => {
    const f = texto3D(ctx, acotar(txt, 24), { tam: 0.145, prof: 0.042, color: colorSec, emis: 0.62 });
    const lado = i % 2 === 0 ? -1 : 1;
    const x = lado * (1.45 + (i > 1 ? 0.1 : 0));
    f.grupo.position.set(x - f.ancho / 2, 0.62 - (i > 1 ? 0.3 : 0), -0.5);
    g.add(f.grupo);
    aparecen(f.mats, 0.94, 520, 340 + i * 240);
    bobbers.push({ obj: f.grupo, y0: f.grupo.position.y, amp: 0.02, vel: 0.9 + i * 0.13, fase: 1.3 + i });
  });
  // subrayado volumétrico del lema mayor — barra con filo
  const barra = new THREE.Mesh(
    reg.geo(new THREE.BoxGeometry(Math.min(may.ancho * 0.62, 2.4), 0.018, 0.02)),
    reg.mat(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75 })),
  );
  barra.position.set(0, 0.8, -0.5);
  g.add(barra);
  aparecen([barra.material as THREE.Material], 0.75, 420, 60);
  return g;
}

// ────────────────────────────────────────────────────────────
// EL ESPACIO — la receta de cada mundo: cielo, lemas, propios
// (paisaje vivo) y su disposición en el anillo.
// ────────────────────────────────────────────────────────────
interface EspacioMundo {
  cielo: number;
  color: number;
  colorSec: number;
  lemas: string[];
  propios: (ctx: CtxSala3D, reg: ReturnType<typeof registrar>, bajo: boolean) => { g: THREE.Group; gira?: number; eje?: "y" | "z" }[];
  nPropios: [number, number]; // [escritorio, bajo/móvil]
  radioX: number;
  radioZ: number;
}

const ESPACIOS: Record<string, EspacioMundo> = {
  economia: {
    cielo: 0xf5c542, color: COL_ORO, colorSec: 0xd9a92f,
    lemas: ["BOLSA ORBITAL", "EL CAPITAL MANDA", "MERCADOS EN VIVO"],
    propios: propsEconomia, nPropios: [7, 4], radioX: 2.9, radioZ: 1.5,
  },
  conflictos: {
    cielo: 0xff4d5e, color: COL_ROJO, colorSec: 0xd93a4a,
    lemas: ["BUNKER DE MANDO", "LA GUERRA NO DUERME", "DECIDE EL FRENTE"],
    propios: propsConflictos, nPropios: [7, 4], radioX: 2.9, radioZ: 1.5,
  },
  memes: {
    cielo: 0xff4fd8, color: 0xff4fd8, colorSec: 0x4fd8ff,
    lemas: ["ARENA DEL HUMOR", "RIE O PERECE", "EL FRENTE DEL MEME"],
    propios: propsMemes, nPropios: [7, 4], radioX: 2.8, radioZ: 1.5,
  },
  noticias: {
    cielo: 0x4fd8ff, color: 0x4fd8ff, colorSec: 0x9ab4c8,
    lemas: ["ESTACION DE PRENSA", "EL MUNDO EN DIRECTO", "LA VERDAD EN VOLUMEN"],
    propios: propsNoticias, nPropios: [7, 4], radioX: 2.9, radioZ: 1.5,
  },
  quiz: {
    cielo: 0x4f7dff, color: 0x6f9bff, colorSec: COL_ORO,
    lemas: ["CATEDRAL DEL SABER", "LA MENTE ES ARMA", "APRENDE Y VENCE"],
    propios: propsQuiz, nPropios: [6, 4], radioX: 2.8, radioZ: 1.5,
  },
  votaciones: {
    cielo: 0x3ddc9a, color: 0x3ddc9a, colorSec: 0x2fae78,
    lemas: ["DOMO CIVICO", "EL PUEBLO DECIDE", "TU VOZ ES PODER"],
    propios: propsVotaciones, nPropios: [6, 4], radioX: 2.8, radioZ: 1.5,
  },
  perfil: {
    cielo: 0xb44fff, color: 0xc06aff, colorSec: COL_ORO,
    lemas: ["SANTUARIO DEL AGENTE", "AQUI VIVE TU LEYENDA", "TU NUCLEO VITAL"],
    propios: propsPerfil, nPropios: [6, 4], radioX: 2.8, radioZ: 1.5,
  },
  predicciones: {
    cielo: 0x2fd66b, color: 0x2fd66b, colorSec: COL_ORO,
    lemas: ["CASINO DEL DESTINO", "APUESTA AL FUTURO", "EL DESTINO SE COMPRA"],
    propios: propsPredicciones, nPropios: [7, 4], radioX: 2.9, radioZ: 1.5,
  },
  logros: {
    cielo: COL_ORO, color: COL_ORO, colorSec: 0xffe08a,
    lemas: ["SALON DE LA GLORIA", "TU GLORIA BRILLA", "LOS HEROES NO MUEREN"],
    propios: propsLogros, nPropios: [6, 4], radioX: 2.8, radioZ: 1.5,
  },
  tienda: {
    cielo: 0xff8a3d, color: 0xff8a3d, colorSec: COL_ORO,
    lemas: ["EL ARSENAL", "EL BOTIN ESPERA", "MEJORA O PERECE"],
    propios: propsTienda, nPropios: [7, 4], radioX: 2.9, radioZ: 1.5,
  },
  generica: {
    cielo: 0x4fc3d8, color: 0x4fc3d8, colorSec: 0x8fb8c8,
    lemas: [], // se firman con el título de la rama en el montaje
    propios: propsGenericas, nPropios: [6, 4], radioX: 2.8, radioZ: 1.5,
  },
};

// ────────────────────────────────────────────────────────────
// ENSAMBLAJE — un mundo = telón + plataforma + propios + frases
// ────────────────────────────────────────────────────────────
export function construirMundo3D(ctx: CtxSala3D, p: PayloadSala3D): Mundo3DInstancia {
  const reg = registrar();
  const bajo = ctx.calidadBaja || ctx.movil;
  const esp = ESPACIOS[p.tipo] ?? ESPACIOS.generica;

  const grupo = new THREE.Group();
  const tics: ((t: number, dt: number) => void)[] = [];
  const bobbers: FraseViva[] = [];

  // 1 — EL CIELO PRIVADO
  const cielo = telon(reg, esp.cielo);
  grupo.add(cielo.grupo);

  // 2 — EL SUELO DEL SECTOR
  const suelo = plataforma(reg, esp.color, bajo);
  grupo.add(suelo);

  // 3 — EL PAISAJE PROPIO: los monumentos del mundo en su anillo.
  // v148 QA: el arco debe REPARTIRSE por el semicírculo TRASERO entero
  // (π..2π) — antes los ángulos caían todos con cos<0 y los propios
  // se apiñaban a la izquierda del cuadro.
  const propios = esp.propios(ctx, reg, bajo);
  const n = Math.min(propios.length, bajo ? esp.nPropios[1] : esp.nPropios[0]);
  for (let i = 0; i < n; i++) {
    const { g, gira, eje } = propios[i];
    const a = Math.PI + ((i + 0.5) / n) * Math.PI; // arco trasero completo
    g.position.set(Math.cos(a) * esp.radioX * (0.86 + (i % 3) * 0.09), -1.38,
      Math.sin(a) * esp.radioZ * 0.9 - 0.62 - (i % 2) * 0.42);
    const s = 0.9 + ((i * 37) % 10) * 0.022;
    g.scale.setScalar(s);
    grupo.add(g);
    if (gira) {
      const ejeRot = eje ?? "y";
      tics.push((t) => {
        if (ejeRot === "y") g.rotation.y = t * gira;
        else g.rotation.z = t * gira;
      });
    }
  }
  // los CENTINELAS laterales: dos monumentos flanquean la vista
  for (const lado of [-1, 1]) {
    const idx = (lado < 0 ? 0 : 1) % propios.length;
    const { g } = propios[idx];
    const clon = g.clone(true);
    clon.position.set(lado * 3.15, -1.38, 0.35);
    clon.scale.setScalar(0.82);
    clon.rotation.y = lado * -0.5;
    grupo.add(clon);
  }

  // 4 — LAS FRASES: el mundo EMITE su voz al entrar
  const lemas = esp.lemas.length
    ? esp.lemas
    : [`SECTOR ${acotar(sanitizar(p.titulo || p.tab || "FRONTERA"), 13)}`, "SECTOR ACTIVO", "VANGUARD EN VIVO"];
  const aparecen = (mats: THREE.Material[], hasta: number, ms: number, delay: number) =>
    aparecer(ctx.animarP, mats, hasta, ms, delay);
  const voz = frasesDe(ctx, reg, lemas, esp.color, esp.colorSec, aparecen, bobbers);
  grupo.add(voz);

  // 5 — EL POLVO DEL SECTOR
  const motas = polvo(bajo ? 110 : 240, esp.color, 3.3, 3.1);
  motas.position.y = -1.36;
  grupo.add(motas);

  // 6 — LOS ANILLOS DE ACCESO: portales gemelos que enmarcan la entrada
  const aroIn = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(2.45, 0.012, 6, bajo ? 40 : 64)),
    reg.mat(new THREE.MeshBasicMaterial({
      color: esp.color, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })),
  );
  aroIn.position.set(0, 0.15, -1.35);
  grupo.add(aroIn);
  tics.push((t) => { aroIn.rotation.z = t * 0.16; });

  // ── EL LATIDO ──
  const tic = (t: number) => {
    for (const fn of tics) fn(t, 0);
    for (const b of bobbers) b.obj.position.y = b.y0 + Math.sin(t * b.vel + b.fase) * b.amp;
  };

  const liberar = () => {
    grupo.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mt = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mt)) mt.forEach((x) => x.dispose());
      else if (mt) mt.dispose();
    });
    cielo.mat.map?.dispose();
    reg.liberar();
  };

  return { grupo, tic, liberar };
}

// ────────────────────────────────────────────────────────────
// LOS PROPIOS — el paisaje vivo de cada mundo. Cada fábrica
// devuelve monumentos con volumen real que giran o laten.
// ────────────────────────────────────────────────────────────
type Propio = { g: THREE.Group; gira?: number; eje?: "y" | "z" };
type FabricaProps = (ctx: CtxSala3D, reg: ReturnType<typeof registrar>, bajo: boolean) => Propio[];

// ECONOMÍA — torres-vela, la moneda mayor y el anillo de cotizaciones
function propsEconomia(ctx: CtxSala3D, reg: ReturnType<typeof registrar>, bajo: boolean): Propio[] {
  const out: Propio[] = [];
  const alturas = [1.5, 1.05, 1.28, 0.82];
  alturas.forEach((h, i) => {
    const g = new THREE.Group();
    const sube = i % 2 === 0;
    const col = sube ? COL_VERDE : COL_ROJO;
    const cuerpo = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(0.17, h, 0.17)), reg.mat(matMetal(0x16233a)));
    cuerpo.position.y = h / 2;
    const filo = new THREE.LineSegments(cuerpo.geometry, reg.mat(matFilo(col, 0.9)));
    filo.position.copy(cuerpo.position);
    // la viva vela dentro de la torre
    const vela = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(0.09, h * 0.55, 0.09)),
      reg.mat(new THREE.MeshStandardMaterial({
        color: col, emissive: new THREE.Color(col), emissiveIntensity: 0.6,
        metalness: 0.4, roughness: 0.3, transparent: true, opacity: 0.95,
      })),
    );
    vela.position.y = h * 0.55;
    // mecha
    const mecha = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(0.014, h * 0.34, 0.014)),
      reg.mat(new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 })),
    );
    mecha.position.y = h * 0.85;
    // peana dorada
    const peana = new THREE.Mesh(
      reg.geo(new THREE.CylinderGeometry(0.19, 0.23, 0.05, 18)),
      reg.mat(new THREE.MeshStandardMaterial({ color: COL_ORO, metalness: 0.9, roughness: 0.25, emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.18 })),
    );
    peana.position.y = 0.025;
    g.add(cuerpo, filo, vela, mecha, peana);
    out.push({ g, gira: sube ? 0.14 : -0.11 });
  });
  // la MONEDA MAYOR — oro macizo de canto estriado
  const moneda = new THREE.Group();
  const disco = new THREE.Mesh(
    reg.geo(new THREE.CylinderGeometry(0.42, 0.42, 0.07, bajo ? 22 : 40)),
    reg.mat(new THREE.MeshStandardMaterial({ color: COL_ORO, metalness: 0.95, roughness: 0.18, emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.28 })),
  );
  disco.rotation.x = Math.PI / 2;
  disco.position.y = 0.95;
  const canto = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.42, 0.022, 8, bajo ? 26 : 44)),
    reg.mat(new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.9 })),
  );
  canto.position.y = 0.95;
  moneda.add(disco, canto);
  const soporte = new THREE.Mesh(
    reg.geo(new THREE.CylinderGeometry(0.1, 0.14, 0.6, 12)),
    reg.mat(matMetal(0x1a2438)),
  );
  soporte.position.y = 0.3;
  moneda.add(soporte);
  out.push({ g: moneda, gira: 0.55 });
  // anillo de cotizaciones — esferas orbitando un aro
  const ring = new THREE.Group();
  const aro = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.34, 0.016, 6, bajo ? 24 : 44)),
    reg.mat(new THREE.MeshBasicMaterial({ color: COL_VERDE, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  aro.position.y = 0.72;
  aro.rotation.x = 0.5;
  ring.add(aro);
  for (let i = 0; i < (bajo ? 4 : 7); i++) {
    const a = (i / (bajo ? 4 : 7)) * Math.PI * 2;
    const esf = new THREE.Mesh(
      reg.geo(new THREE.SphereGeometry(0.035, 8, 8)),
      reg.mat(new THREE.MeshBasicMaterial({ color: i % 2 ? COL_VERDE : COL_ROJO })),
    );
    esf.position.set(Math.cos(a) * 0.34, 0.72 + Math.sin(a) * 0.34 * Math.sin(0.5), Math.sin(a) * 0.34 * Math.cos(0.5));
    ring.add(esf);
  }
  const pie = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.06, 0.1, 0.42, 10)), reg.mat(matMetal(0x1a2438)));
  pie.position.y = 0.21;
  ring.add(pie);
  out.push({ g: ring, gira: -0.4 });
  return out;
}

// CONFLICTOS — silos, radar giratorio y la baliza de alerta
function propsConflictos(ctx: CtxSala3D, reg: ReturnType<typeof registrar>, bajo: boolean): Propio[] {
  const out: Propio[] = [];
  // SILOS — dos misiles en leve alerta
  for (const lado of [-1, 1]) {
    const g = new THREE.Group();
    const tubo = new THREE.Mesh(
      reg.geo(new THREE.CylinderGeometry(0.11, 0.13, 0.95, 12)),
      reg.mat(matMetal(0x1c2636)),
    );
    tubo.position.y = 0.475;
    tubo.rotation.z = lado * 0.14;
    const punta = new THREE.Mesh(
      reg.geo(new THREE.ConeGeometry(0.09, 0.24, 12)),
      reg.mat(new THREE.MeshStandardMaterial({ color: COL_ROJO, emissive: new THREE.Color(COL_ROJO), emissiveIntensity: 0.55, metalness: 0.5, roughness: 0.4 })),
    );
    punta.position.set(-lado * 0.066, 1.05, 0);
    punta.rotation.z = lado * 0.14;
    g.add(tubo, punta);
    const base = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.2, 0.24, 0.06, 14)), reg.mat(matMetal(0x141d2e)));
    base.position.y = 0.03;
    g.add(base);
    out.push({ g });
  }
  // RADAR — el plato que barre el horizonte
  const radar = new THREE.Group();
  const mastil = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.035, 0.05, 0.7, 10)), reg.mat(matMetal(0x1c2636)));
  mastil.position.y = 0.35;
  const plato = new THREE.Mesh(
    reg.geo(new THREE.CylinderGeometry(0.3, 0.06, 0.1, bajo ? 16 : 28, 1, true)),
    reg.mat(new THREE.MeshStandardMaterial({ color: 0x2a3a52, metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide })),
  );
  plato.position.y = 0.78;
  plato.rotation.x = -0.7;
  const foco = new THREE.Mesh(
    reg.geo(new THREE.SphereGeometry(0.035, 8, 8)),
    reg.mat(new THREE.MeshBasicMaterial({ color: COL_ROJO })),
  );
  foco.position.set(0, 0.88, 0.12);
  radar.add(mastil, plato, foco);
  out.push({ g: radar, gira: 0.9 });
  // BALIZA DE ALERTA — el octaedro que late rojo
  const baliza = new THREE.Group();
  const poste = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.025, 0.035, 1.15, 8)), reg.mat(matMetal(0x1c2636)));
  poste.position.y = 0.575;
  const nucleo = new THREE.Mesh(
    reg.geo(new THREE.OctahedronGeometry(0.12)),
    reg.mat(new THREE.MeshStandardMaterial({ color: COL_ROJO, emissive: new THREE.Color(COL_ROJO), emissiveIntensity: 0.9, metalness: 0.4, roughness: 0.3 })),
  );
  nucleo.position.y = 1.28;
  baliza.add(poste, nucleo);
  out.push({ g: baliza, gira: 0.7 });
  return out;
}

// MEMES — las bolas del elenco, el arco de neón y la estrella
function propsMemes(ctx: CtxSala3D, reg: ReturnType<typeof registrar>, bajo: boolean): Propio[] {
  const out: Propio[] = [];
  const colores = [0xff4fd8, 0x4fd8ff, 0xffd84f, 0x7dff4f];
  // BOLAS DEL ELENCO — esferas de neón en jaula
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group();
    const r = 0.16 + i * 0.045;
    const esf = new THREE.Mesh(
      reg.geo(new THREE.SphereGeometry(r, bajo ? 12 : 20, bajo ? 12 : 20)),
      reg.mat(new THREE.MeshStandardMaterial({
        color: colores[i], emissive: new THREE.Color(colores[i]),
        emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.25, transparent: true, opacity: 0.92,
      })),
    );
    esf.position.y = 0.42 + i * 0.34;
    const jaula = new THREE.Mesh(esf.geometry, reg.mat(matFilo(colores[(i + 1) % 4], 0.75)));
    jaula.position.copy(esf.position);
    jaula.scale.setScalar(1.08);
    g.add(esf, jaula);
    out.push({ g, gira: (i % 2 ? -0.6 : 0.5), eje: "z" });
  }
  // ARCO DE NEÓN — la entrada del estudio
  const arco = new THREE.Group();
  const medio = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.55, 0.035, 8, bajo ? 18 : 30, Math.PI)),
    reg.mat(new THREE.MeshBasicMaterial({ color: 0xff4fd8, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  medio.position.y = 0.02;
  arco.add(medio);
  for (const lado of [-1, 1]) {
    const pie = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.045, 0.06, 0.34, 10)), reg.mat(matMetal(0x181426)));
    pie.position.set(lado * 0.55, 0.17, 0);
    arco.add(pie);
  }
  out.push({ g: arco });
  // ESTRELLA DEL VIRAL — octaedro que gira rápido
  const estrella = new THREE.Group();
  const octa = new THREE.Mesh(
    reg.geo(new THREE.OctahedronGeometry(0.2)),
    reg.mat(new THREE.MeshStandardMaterial({ color: 0xffd84f, emissive: new THREE.Color(0xffd84f), emissiveIntensity: 0.7, metalness: 0.6, roughness: 0.2 })),
  );
  octa.position.y = 0.55;
  const asta = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.02, 0.03, 0.4, 8)), reg.mat(matMetal(0x181426)));
  asta.position.y = 0.2;
  estrella.add(octa, asta);
  out.push({ g: estrella, gira: 1.3 });
  return out;
}

// NOTICIAS — antenas parabólicas, el satélite y el anillo de emisión
function propsNoticias(ctx: CtxSala3D, reg: ReturnType<typeof registrar>, bajo: boolean): Propio[] {
  const out: Propio[] = [];
  // ANTENAS — dos platos hacia el cielo
  for (const lado of [-1, 1]) {
    const g = new THREE.Group();
    const mastil = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.03, 0.045, 0.85, 10)), reg.mat(matMetal(0x1a2a3a)));
    mastil.position.y = 0.425;
    const plato = new THREE.Mesh(
      reg.geo(new THREE.CylinderGeometry(0.26, 0.05, 0.09, bajo ? 16 : 26, 1, true)),
      reg.mat(new THREE.MeshStandardMaterial({ color: 0x2a3f55, metalness: 0.85, roughness: 0.28, side: THREE.DoubleSide })),
    );
    plato.position.y = 0.9;
    plato.rotation.x = -1.05;
    plato.rotation.z = lado * 0.3;
    const baliza = new THREE.Mesh(
      reg.geo(new THREE.SphereGeometry(0.03, 8, 8)),
      reg.mat(new THREE.MeshBasicMaterial({ color: 0x4fd8ff })),
    );
    baliza.position.set(lado * 0.1, 1.02, -0.08);
    g.add(mastil, plato, baliza);
    out.push({ g });
  }
  // SATÉLITE — cuerpo + paneles solares cian
  const sat = new THREE.Group();
  const cuerpo = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(0.2, 0.14, 0.14)), reg.mat(matMetal(0x22334a)));
  cuerpo.position.y = 0.75;
  sat.add(cuerpo);
  for (const lado of [-1, 1]) {
    const panel = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(0.26, 0.012, 0.13)),
      reg.mat(new THREE.MeshStandardMaterial({ color: 0x1a5f8a, emissive: new THREE.Color(0x4fd8ff), emissiveIntensity: 0.32, metalness: 0.6, roughness: 0.35 })),
    );
    panel.position.set(lado * 0.24, 0.75, 0);
    sat.add(panel);
  }
  const pilar = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.02, 0.03, 0.6, 8)), reg.mat(matMetal(0x1a2a3a)));
  pilar.position.y = 0.3;
  sat.add(pilar);
  out.push({ g: sat, gira: 0.35 });
  // ANILLO DE EMISIÓN — ondas que se difunden
  const onda = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const a = new THREE.Mesh(
      reg.geo(new THREE.TorusGeometry(0.18 + i * 0.1, 0.008, 6, bajo ? 20 : 36)),
      reg.mat(new THREE.MeshBasicMaterial({ color: 0x4fd8ff, transparent: true, opacity: 0.6 - i * 0.16, blending: THREE.AdditiveBlending, depthWrite: false })),
    );
    a.position.y = 0.5;
    a.rotation.x = 0.4;
    onda.add(a);
  }
  const torre = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.025, 0.04, 0.5, 8)), reg.mat(matMetal(0x1a2a3a)));
  torre.position.y = 0.25;
  onda.add(torre);
  out.push({ g: onda, gira: -0.5 });
  return out;
}

// QUIZ — cristales del saber y columnas del examen
function propsQuiz(ctx: CtxSala3D, reg: ReturnType<typeof registrar>, bajo: boolean): Propio[] {
  const out: Propio[] = [];
  // CRISTALES DEL SABER — octaedros de vidrio flotando
  for (let i = 0; i < 2; i++) {
    const g = new THREE.Group();
    const r = 0.2 + i * 0.07;
    const cristal = new THREE.Mesh(
      reg.geo(new THREE.OctahedronGeometry(r)),
      reg.mat(new THREE.MeshStandardMaterial({
        color: 0x4f7dff, emissive: new THREE.Color(0x4f7dff), emissiveIntensity: 0.42,
        metalness: 0.5, roughness: 0.15, transparent: true, opacity: 0.85,
      })),
    );
    cristal.position.y = 0.6 + i * 0.45;
    const jaula = new THREE.Mesh(cristal.geometry, reg.mat(matFilo(0x9bb8ff, 0.8)));
    jaula.position.copy(cristal.position);
    jaula.scale.setScalar(1.12);
    g.add(cristal, jaula);
    out.push({ g, gira: (i ? -0.45 : 0.55), eje: "z" });
  }
  // COLUMNAS DEL EXAMEN — pilonos con orbe
  for (const lado of [-1, 1]) {
    const g = new THREE.Group();
    const col = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(0.1, 1.05, 0.1)), reg.mat(matMetal(0x16233a)));
    col.position.y = 0.525;
    const filoCol = new THREE.LineSegments(col.geometry, reg.mat(matFilo(0x6f9bff, 0.85)));
    filoCol.position.copy(col.position);
    const orbe = new THREE.Mesh(
      reg.geo(new THREE.SphereGeometry(0.075, 12, 12)),
      reg.mat(new THREE.MeshStandardMaterial({ color: COL_ORO, emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.55, metalness: 0.8, roughness: 0.2 })),
    );
    orbe.position.y = 1.18;
    g.add(col, filoCol, orbe);
    out.push({ g });
  }
  // LA PREGUNTA MAYOR — aro + núcleo
  const enigma = new THREE.Group();
  const aro = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.3, 0.02, 8, bajo ? 22 : 40)),
    reg.mat(new THREE.MeshStandardMaterial({ color: COL_ORO, metalness: 0.9, roughness: 0.2, emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.3 })),
  );
  aro.position.y = 0.8;
  const nucleo = new THREE.Mesh(
    reg.geo(new THREE.IcosahedronGeometry(0.11)),
    reg.mat(new THREE.MeshStandardMaterial({ color: 0x6f9bff, emissive: new THREE.Color(0x6f9bff), emissiveIntensity: 0.65, metalness: 0.5, roughness: 0.25 })),
  );
  nucleo.position.y = 0.8;
  const pie = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.05, 0.09, 0.5, 10)), reg.mat(matMetal(0x16233a)));
  pie.position.y = 0.25;
  enigma.add(aro, nucleo, pie);
  out.push({ g: enigma, gira: 0.8, eje: "z" });
  return out;
}

// VOTACIONES — la urna, los pilares cívicos y la balota
function propsVotaciones(ctx: CtxSala3D, reg: ReturnType<typeof registrar>, bajo: boolean): Propio[] {
  const out: Propio[] = [];
  // LA URNA — el cofre del voto
  const urna = new THREE.Group();
  const caja = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(0.3, 0.36, 0.3)), reg.mat(matMetal(0x16233a)));
  caja.position.y = 0.22;
  const filoCaja = new THREE.LineSegments(caja.geometry, reg.mat(matFilo(0x3ddc9a, 0.9)));
  filoCaja.position.copy(caja.position);
  const ranura = new THREE.Mesh(
    reg.geo(new THREE.BoxGeometry(0.2, 0.018, 0.02)),
    reg.mat(new THREE.MeshBasicMaterial({ color: 0x0a0f18 })),
  );
  ranura.position.set(0, 0.36, 0.15);
  const halo = new THREE.Mesh(
    reg.geo(new THREE.RingGeometry(0.2, 0.3, 24)),
    reg.mat(new THREE.MeshBasicMaterial({ color: 0x3ddc9a, transparent: true, opacity: 0.25, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.005;
  urna.add(caja, filoCaja, ranura, halo);
  out.push({ g: urna, gira: 0.3 });
  // PILARES CÍVICOS — tres columnas con orbe
  for (let i = 0; i < 2; i++) {
    const g = new THREE.Group();
    const h = 0.95 + i * 0.2;
    const col = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.055, 0.075, h, 12)), reg.mat(matMetal(0x16233a)));
    col.position.y = h / 2;
    const filoCol = new THREE.LineSegments(col.geometry, reg.mat(matFilo(0x3ddc9a, 0.7)));
    filoCol.position.copy(col.position);
    const orbe = new THREE.Mesh(
      reg.geo(new THREE.SphereGeometry(0.07, 12, 12)),
      reg.mat(new THREE.MeshStandardMaterial({ color: 0x3ddc9a, emissive: new THREE.Color(0x3ddc9a), emissiveIntensity: 0.6, metalness: 0.5, roughness: 0.25 })),
    );
    orbe.position.y = h + 0.09;
    g.add(col, filoCol, orbe);
    out.push({ g });
  }
  // LA BALOTA — esfera flotante con aro
  const balota = new THREE.Group();
  const esf = new THREE.Mesh(
    reg.geo(new THREE.SphereGeometry(0.13, 16, 16)),
    reg.mat(new THREE.MeshStandardMaterial({ color: 0xe8f6f0, emissive: new THREE.Color(0x3ddc9a), emissiveIntensity: 0.2, metalness: 0.2, roughness: 0.4 })),
  );
  esf.position.y = 0.7;
  const aro = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.19, 0.012, 6, 28)),
    reg.mat(new THREE.MeshBasicMaterial({ color: 0x3ddc9a, transparent: true, opacity: 0.85 })),
  );
  aro.position.y = 0.7;
  aro.rotation.x = 0.5;
  balota.add(esf, aro);
  out.push({ g: balota, gira: 0.45 });
  return out;
}

// PERFIL — los anillos del trofeo, el estandarte y la corona
function propsPerfil(ctx: CtxSala3D, reg: ReturnType<typeof registrar>, bajo: boolean): Propio[] {
  const out: Propio[] = [];
  // ANILLOS DEL NÚCLEO — dos aros inclinados + icosaedro
  for (let i = 0; i < 2; i++) {
    const g = new THREE.Group();
    const aro = new THREE.Mesh(
      reg.geo(new THREE.TorusGeometry(0.3 - i * 0.06, 0.016, 6, bajo ? 24 : 44)),
      reg.mat(new THREE.MeshBasicMaterial({ color: i ? COL_ORO : 0xc06aff, transparent: true, opacity: 0.9 })),
    );
    aro.position.y = 0.8;
    aro.rotation.x = 0.9 + i * 0.5;
    const pie = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.05, 0.08, 0.5, 10)), reg.mat(matMetal(0x1c1830)));
    pie.position.y = 0.25;
    g.add(aro, pie);
    out.push({ g, gira: i ? -0.5 : 0.4, eje: "z" });
  }
  // EL ESTANDARTE — pilar con bandera violeta
  const estandarte = new THREE.Group();
  const pilar = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.03, 0.045, 1.3, 8)), reg.mat(matMetal(0x1c1830)));
  pilar.position.y = 0.65;
  const bandera = new THREE.Mesh(
    reg.geo(new THREE.PlaneGeometry(0.36, 0.22)),
    reg.mat(new THREE.MeshStandardMaterial({ color: 0x8a3fff, emissive: new THREE.Color(0xc06aff), emissiveIntensity: 0.4, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })),
  );
  bandera.position.set(0.2, 1.16, 0);
  estandarte.add(pilar, bandera);
  out.push({ g: estandarte });
  // LA CORONA — aro dorado con picos
  const corona = new THREE.Group();
  const base = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.2, 0.025, 8, 28)),
    reg.mat(new THREE.MeshStandardMaterial({ color: COL_ORO, metalness: 0.95, roughness: 0.15, emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.35 })),
  );
  base.position.y = 0.65;
  base.rotation.x = Math.PI / 2;
  corona.add(base);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const pico = new THREE.Mesh(
      reg.geo(new THREE.ConeGeometry(0.03, 0.12, 8)),
      reg.mat(new THREE.MeshStandardMaterial({ color: COL_ORO, metalness: 0.9, roughness: 0.2, emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.45 })),
    );
    pico.position.set(Math.cos(a) * 0.2, 0.73, Math.sin(a) * 0.2);
    corona.add(pico);
  }
  const peana = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.09, 0.13, 0.4, 10)), reg.mat(matMetal(0x1c1830)));
  peana.position.y = 0.2;
  corona.add(peana);
  out.push({ g: corona, gira: 0.6 });
  return out;
}

// PREDICCIONES — la ruleta, los dados y las fichas
function propsPredicciones(ctx: CtxSala3D, reg: ReturnType<typeof registrar>, bajo: boolean): Propio[] {
  const out: Propio[] = [];
  // LA RULETA DEL DESTINO — aro + radios girando
  const ruleta = new THREE.Group();
  const aro = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.36, 0.03, 8, bajo ? 24 : 44)),
    reg.mat(new THREE.MeshStandardMaterial({ color: COL_ORO, metalness: 0.92, roughness: 0.18, emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.3 })),
  );
  aro.position.y = 0.8;
  aro.rotation.x = Math.PI / 2.4;
  ruleta.add(aro);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const radio = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(0.016, 0.34, 0.016)),
      reg.mat(new THREE.MeshBasicMaterial({ color: i % 2 ? COL_VERDE : COL_ROJO, transparent: true, opacity: 0.9 })),
    );
    radio.position.set(Math.cos(a) * 0.18, 0.8 - Math.sin(a) * 0.15 * 0.4, Math.sin(a) * 0.15 * 0.4);
    radio.rotation.z = a;
    ruleta.add(radio);
  }
  const pie = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.06, 0.1, 0.55, 10)), reg.mat(matMetal(0x14201c)));
  pie.position.y = 0.275;
  ruleta.add(pie);
  out.push({ g: ruleta, gira: 0.75 });
  // LOS DADOS — dos cubos en juego
  for (let i = 0; i < 2; i++) {
    const g = new THREE.Group();
    const dado = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(0.2, 0.2, 0.2)),
      reg.mat(new THREE.MeshStandardMaterial({ color: 0xe8eef4, metalness: 0.3, roughness: 0.35 })),
    );
    dado.position.y = 0.14;
    dado.rotation.set(0.4 + i * 0.3, 0.5 - i * 0.2, 0.2);
    const filoDado = new THREE.LineSegments(dado.geometry, reg.mat(matFilo(i ? COL_ROJO : 0x2fd66b, 0.85)));
    filoDado.position.copy(dado.position);
    filoDado.rotation.copy(dado.rotation);
    g.add(dado, filoDado);
    out.push({ g, gira: (i ? -0.35 : 0.3) });
  }
  // LAS FICHAS — torres de fichas
  for (let i = 0; i < 2; i++) {
    const g = new THREE.Group();
    const col = i ? COL_ORO : 0x2fd66b;
    for (let j = 0; j < 4; j++) {
      const ficha = new THREE.Mesh(
        reg.geo(new THREE.CylinderGeometry(0.11, 0.11, 0.022, 18)),
        reg.mat(new THREE.MeshStandardMaterial({ color: col, metalness: 0.6, roughness: 0.3, emissive: new THREE.Color(col), emissiveIntensity: 0.22 })),
      );
      ficha.position.set(0, 0.014 + j * 0.024, 0);
      ficha.rotation.y = j * 0.35;
      g.add(ficha);
    }
    out.push({ g });
  }
  return out;
}

// LOGROS — los pilares de la gloria, el laurel y la estrella mayor
function propsLogros(ctx: CtxSala3D, reg: ReturnType<typeof registrar>, bajo: boolean): Propio[] {
  const out: Propio[] = [];
  // PILARES DE GLORIA — columnas con estrella dorada
  for (let i = 0; i < 2; i++) {
    const g = new THREE.Group();
    const h = 1.0 + i * 0.28;
    const col = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.06, 0.085, h, 12)), reg.mat(matMetal(0x241c10)));
    col.position.y = h / 2;
    const filoCol = new THREE.LineSegments(col.geometry, reg.mat(matFilo(COL_ORO, 0.8)));
    filoCol.position.copy(col.position);
    const estrella = new THREE.Mesh(
      reg.geo(new THREE.OctahedronGeometry(0.09 + i * 0.02)),
      reg.mat(new THREE.MeshStandardMaterial({ color: COL_ORO, emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.75, metalness: 0.9, roughness: 0.15 })),
    );
    estrella.position.y = h + 0.14;
    g.add(col, filoCol, estrella);
    out.push({ g, gira: i ? -0.5 : 0.45, eje: "z" });
  }
  // EL LAUREL — arco de oro del vencedor
  const laurel = new THREE.Group();
  const arco = new THREE.Mesh(
    reg.geo(new THREE.TorusGeometry(0.42, 0.028, 8, bajo ? 18 : 32, Math.PI)),
    reg.mat(new THREE.MeshStandardMaterial({ color: COL_ORO, metalness: 0.95, roughness: 0.15, emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.4 })),
  );
  arco.position.y = 0.05;
  laurel.add(arco);
  for (const lado of [-1, 1]) {
    const pie = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.05, 0.07, 0.3, 10)), reg.mat(matMetal(0x241c10)));
    pie.position.set(lado * 0.42, 0.15, 0);
    laurel.add(pie);
  }
  out.push({ g: laurel });
  // LA ESTRELLA MAYOR — icosaedro que gira sobre pedestal
  const mayor = new THREE.Group();
  const ico = new THREE.Mesh(
    reg.geo(new THREE.IcosahedronGeometry(0.2)),
    reg.mat(new THREE.MeshStandardMaterial({ color: 0xffe08a, emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.85, metalness: 0.9, roughness: 0.12 })),
  );
  ico.position.y = 0.85;
  const jaula = new THREE.Mesh(ico.geometry, reg.mat(matFilo(0xffe08a, 0.6)));
  jaula.position.copy(ico.position);
  jaula.scale.setScalar(1.15);
  const peana = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.1, 0.14, 0.55, 12)), reg.mat(matMetal(0x241c10)));
  peana.position.y = 0.275;
  mayor.add(ico, jaula, peana);
  out.push({ g: mayor, gira: 0.9, eje: "z" });
  return out;
}

// TIENDA — cofres, el armero y las cajas de suministro
function propsTienda(ctx: CtxSala3D, reg: ReturnType<typeof registrar>, bajo: boolean): Propio[] {
  const out: Propio[] = [];
  // COFRES — dos con tapa entreabierta y banda de oro
  for (let i = 0; i < 2; i++) {
    const g = new THREE.Group();
    const s = 1 + i * 0.15;
    const caja = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(0.34 * s, 0.22, 0.26 * s)), reg.mat(matMetal(0x1c2010)));
    caja.position.y = 0.11;
    const filoCaja = new THREE.LineSegments(caja.geometry, reg.mat(matFilo(0xff8a3d, 0.85)));
    filoCaja.position.copy(caja.position);
    const tapa = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(0.34 * s, 0.07, 0.26 * s)), reg.mat(matMetal(0x262a16)));
    tapa.position.set(0, 0.26, -0.1 * s);
    tapa.rotation.x = -0.9;
    const banda = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(0.06, 0.235, 0.265 * s)),
      reg.mat(new THREE.MeshStandardMaterial({ color: COL_ORO, metalness: 0.9, roughness: 0.2, emissive: new THREE.Color(COL_ORO), emissiveIntensity: 0.3 })),
    );
    banda.position.y = 0.11;
    g.add(caja, filoCaja, tapa, banda);
    out.push({ g });
  }
  // EL ARMERO — vitrina de armas con luz
  const armero = new THREE.Group();
  const marco = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(0.5, 0.8, 0.12)), reg.mat(matMetal(0x1c2636)));
  marco.position.y = 0.4;
  const filoMarco = new THREE.LineSegments(marco.geometry, reg.mat(matFilo(0xff8a3d, 0.9)));
  filoMarco.position.copy(marco.position);
  for (let i = 0; i < 2; i++) {
    const arma = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(0.3, 0.045, 0.03)),
      reg.mat(new THREE.MeshStandardMaterial({ color: 0x3a4456, metalness: 0.85, roughness: 0.3, emissive: new THREE.Color(0xff8a3d), emissiveIntensity: 0.12 })),
    );
    arma.position.set(0, 0.28 + i * 0.24, 0.06);
    armero.add(arma);
  }
  armero.add(marco, filoMarco);
  out.push({ g: armero });
  // LA CAJA DE SUMINISTRO — con aspas cruzadas
  const caja = new THREE.Group();
  const bulto = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(0.3, 0.3, 0.3)), reg.mat(matMetal(0x1e2420)));
  bulto.position.y = 0.16;
  const filoBulto = new THREE.LineSegments(bulto.geometry, reg.mat(matFilo(COL_ORO, 0.7)));
  filoBulto.position.copy(bulto.position);
  for (const rot of [Math.PI / 4, -Math.PI / 4]) {
    const aspa = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(0.32, 0.03, 0.31)),
      reg.mat(new THREE.MeshStandardMaterial({ color: COL_ORO, metalness: 0.8, roughness: 0.3 })),
    );
    aspa.position.y = 0.16;
    aspa.rotation.y = rot;
    caja.add(aspa);
  }
  caja.add(bulto, filoBulto);
  out.push({ g: caja });
  return out;
}

// GENÉRICA — el puesto avanzado: pilonos, mástil y pequeño radar
function propsGenericas(ctx: CtxSala3D, reg: ReturnType<typeof registrar>, bajo: boolean): Propio[] {
  const out: Propio[] = [];
  // PILONOS — dos torres con baliza
  for (const lado of [-1, 1]) {
    const g = new THREE.Group();
    const torre = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(0.09, 1.2, 0.09)), reg.mat(matMetal(0x16233a)));
    torre.position.y = 0.6;
    const filoTorre = new THREE.LineSegments(torre.geometry, reg.mat(matFilo(0x4fc3d8, 0.8)));
    filoTorre.position.copy(torre.position);
    const baliza = new THREE.Mesh(
      reg.geo(new THREE.OctahedronGeometry(0.085)),
      reg.mat(new THREE.MeshStandardMaterial({ color: 0x4fc3d8, emissive: new THREE.Color(0x4fc3d8), emissiveIntensity: 0.8, metalness: 0.5, roughness: 0.25 })),
    );
    baliza.position.y = 1.33;
    g.add(torre, filoTorre, baliza);
    out.push({ g, gira: lado * 0.4, eje: "z" });
  }
  // MÁSTIL — antena con travesaños
  const mastil = new THREE.Group();
  const asta = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.02, 0.035, 1.15, 8)), reg.mat(matMetal(0x1a2a3a)));
  asta.position.y = 0.575;
  mastil.add(asta);
  for (let i = 0; i < 3; i++) {
    const travesano = new THREE.Mesh(
      reg.geo(new THREE.BoxGeometry(0.26 - i * 0.06, 0.014, 0.014)),
      reg.mat(new THREE.MeshBasicMaterial({ color: 0x4fc3d8, transparent: true, opacity: 0.8 })),
    );
    travesano.position.y = 0.75 + i * 0.22;
    mastil.add(travesano);
  }
  out.push({ g: mastil });
  // PLATO PEQUEÑO — el radar del puesto
  const plato = new THREE.Group();
  const pie = new THREE.Mesh(reg.geo(new THREE.CylinderGeometry(0.04, 0.06, 0.55, 10)), reg.mat(matMetal(0x1a2a3a)));
  pie.position.y = 0.275;
  const cuenco = new THREE.Mesh(
    reg.geo(new THREE.CylinderGeometry(0.22, 0.04, 0.08, bajo ? 14 : 24, 1, true)),
    reg.mat(new THREE.MeshStandardMaterial({ color: 0x2a3a52, metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide })),
  );
  cuenco.position.y = 0.6;
  cuenco.rotation.x = -0.6;
  plato.add(pie, cuenco);
  out.push({ g: plato, gira: 0.85 });
  return out;
}
