"use client";

// ============================================================
// v148.0 EL CASCO DEL PILOTO — EL HUD 3D REAL
// Mandato del Dueño: «solo el fondo es 3D, lo demás es 2D… todo
// literal: cada imagen, cada letra, cada gráfico, cada elemento
// que sea 3D totalmente». Los últimos DOM fijos que flotaban sobre
// el universo (cabecera, TEMPORADA CERO, COMBO) mueren: su sucesor
// es este casco — un HUD de GEOMETRÍA WEBGL acoplada a la cámara:
//   · arriba-izquierda:  VANGUARD en letras extruidas
//   · arriba-derecha:    ficha del agente (alias · nivel · botín)
//   · abajo-izquierda:   TEMPORADA CERO (nivel + barra + cuenta atrás)
//   · abajo-derecha:     COMBO de sesión (multiplicador + barra)
// Todo tocable (los proxies viven en proxiesHolo → el raycast del
// puente ya los obedece) y alimentado por los stores REALES del
// juego (vanguard-game-state-v1 + vg_retention_v55).
// ============================================================
import * as THREE from "three";
import { type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

export interface CtxHud3D {
  fuente: Font;
  calidadBaja: boolean;
  movil: boolean;
}

export interface Hud3D {
  grupo: THREE.Group;
  proxies: THREE.Mesh[];
  logo: THREE.Group;      // v148: el mundo decide si el logo del casco asoma (no duplicar el del cielo)
  tic: (t: number, dt: number) => void;
  sincronizar: () => void; // lee los stores y repinta lo que cambió
  colocar: (cam: THREE.PerspectiveCamera) => void; // se planta frente a la cámara (cada frame)
  liberar: () => void;
}

// la typeface no trae acentos: como un HUD militar, se caen
function sanitizar(t: string): string {
  return (t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

const COL_ORO = 0xf5c542;
const COL_CIAN = 0x7ab8ff;
const COL_VERDE = 0x3ddc84;

function matHud(color: number, emis: number) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.8,
    roughness: 0.28,
    emissive: new THREE.Color(color),
    emissiveIntensity: emis,
    transparent: true,
    opacity: 1,
  });
}

// texto extruido — cada glifo con volumen real
function textoHud(
  ctx: CtxHud3D,
  texto: string,
  o: { tam: number; prof: number; color: number; emis: number },
): { grupo: THREE.Group; ancho: number; mats: THREE.MeshStandardMaterial[] } {
  const grupo = new THREE.Group();
  const mat = matHud(o.color, o.emis);
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
        curveSegments: ctx.calidadBaja ? 2 : 4,
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
    cursor += w + o.tam * 0.12;
  }
  return { grupo, ancho: Math.max(cursor - o.tam * 0.12, 0.001), mats };
}

// placa de casco — cristal oscuro finísimo con filo de neón
function placaHud(w: number, h: number, color: number): { cuerpo: THREE.Mesh; borde: THREE.LineSegments } {
  const cuerpo = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 0.012),
    new THREE.MeshStandardMaterial({
      color: 0x0a111e,
      metalness: 0.92,
      roughness: 0.18,
      transparent: true,
      opacity: 0.58,
    }),
  );
  const borde = new THREE.LineSegments(
    new THREE.EdgesGeometry(cuerpo.geometry, 24),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 }),
  );
  return { cuerpo, borde };
}

// barra de volumen — el progreso como caja real
function barraHud(wMax: number, frac: number, color: number): THREE.Mesh {
  const f = Math.max(0.02, Math.min(1, frac));
  return new THREE.Mesh(
    new THREE.BoxGeometry(wMax * f, 0.014, 0.007),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.88 }),
  );
}

interface DatosPiloto {
  alias: string;
  nivel: number;
  coins: number;
  gems: number;
  racha: number;
  tier: number;
  tierProg: number;   // 0..1
  diasTemp: number;
  combo: number;
}

function leerPiloto(): DatosPiloto {
  const d: DatosPiloto = { alias: "AGENTE", nivel: 1, coins: 0, gems: 0, racha: 0, tier: 1, tierProg: 0, diasTemp: 30, combo: 1 };
  try {
    const g = JSON.parse(localStorage.getItem("vanguard-game-state-v1") || "null")?.state;
    if (g) {
      d.alias = (g.alias || "AGENTE").slice(0, 14);
      d.nivel = Number(g.level) || 1;
      d.coins = Number(g.coins) || 0;
      d.gems = Number(g.gems) || 0;
      d.racha = Number(g.streak) || 0;
    }
  } catch { /* sin estado: el HUD respira con valores honestos */ }
  try {
    const r = JSON.parse(localStorage.getItem("vg_retention_v55") || "null")?.state;
    if (r) {
      const xp = Number(r.seasonXp) || 0;
      d.tier = Math.floor(xp / 120) + 1;
      d.tierProg = (xp % 120) / 120;
      const ini = r.seasonStart ? new Date(r.seasonStart).getTime() : Date.now();
      d.diasTemp = Math.max(0, Math.ceil((ini + 30 * 86400000 - Date.now()) / 86400000));
    }
  } catch { /* sin temporada */ }
  try {
    const c = (window as unknown as { __vgCombo?: number }).__vgCombo;
    if (typeof c === "number" && isFinite(c)) d.combo = c;
  } catch { /* sin combo */ }
  return d;
}

export function construirHud3D(ctx: CtxHud3D): Hud3D {
  const grupo = new THREE.Group();
  const proxies: THREE.Mesh[] = [];
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const reg = {
    geo: <T extends THREE.BufferGeometry>(g: T): T => { geos.push(g); return g; },
    mat: <T extends THREE.Material>(m: T): T => { mats.push(m); return m; },
  };

  // ── EL LOGO — VANGUARD en letras extruidas arriba-izquierda ──
  const logo = textoHud(ctx, "VANGUARD", { tam: 0.03, prof: 0.011, color: COL_CIAN, emis: 0.7 });
  logo.grupo.position.set(-logo.ancho / 2, 0, 0);
  grupo.add(logo.grupo);
  const subraya = reg.mat(new THREE.MeshBasicMaterial({ color: COL_CIAN, transparent: true, opacity: 0.75 }));
  const linea = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(logo.ancho, 0.004, 0.003)), subraya);
  linea.position.set(0, -0.032, 0);
  logo.grupo.add(linea);

  // ── LOS CHIPS vivos — se repintan cuando los datos cambian ──
  const agenteChip = new THREE.Group();
  const temporadaChip = new THREE.Group();
  const comboChip = new THREE.Group();
  const vivos: { chip: THREE.Group; contenido: THREE.Group | null }[] = [
    { chip: agenteChip, contenido: null },
    { chip: temporadaChip, contenido: null },
    { chip: comboChip, contenido: null },
  ];

  const limpiarContenido = (v: { chip: THREE.Group; contenido: THREE.Group | null }) => {
    if (!v.contenido) return;
    v.contenido.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });
    v.chip.remove(v.contenido);
    v.contenido = null;
  };

  const pintarAgente = (d: DatosPiloto) => {
    const v = vivos[0];
    limpiarContenido(v);
    const c = new THREE.Group();
    const alias = textoHud(ctx, d.alias, { tam: mov ? 0.016 : 0.019, prof: 0.006, color: COL_ORO, emis: 0.6 });
    alias.grupo.position.set(-W_AGENTE / 2 + alias.ancho / 2 + 0.02, mov ? 0.014 : 0.012, 0.012);
    c.add(alias.grupo);
    if (!mov) {
      const rango = textoHud(ctx, `NV ${d.nivel}`, { tam: 0.014, prof: 0.005, color: COL_CIAN, emis: 0.4 });
      rango.grupo.position.set(-W_AGENTE / 2 + rango.ancho / 2 + 0.02, -0.016, 0.012);
      c.add(rango.grupo);
    }
    // LA SEPARACIÓN del botín — a la derecha del chip (en móvil compacto)
    const botinTxt = mov ? `C ${d.coins} G ${d.gems}` : `C ${d.coins}   G ${d.gems}   R ${d.racha}`;
    const botin = textoHud(ctx, botinTxt, { tam: mov ? 0.015 : 0.019, prof: 0.006, color: 0xd6e6ff, emis: 0.5 });
    botin.grupo.position.set(W_AGENTE / 2 - botin.ancho / 2 - 0.02, mov ? -0.014 : 0, 0.012);
    c.add(botin.grupo);
    v.chip.add(c);
    v.contenido = c;
  };

  const pintarTemporada = (d: DatosPiloto) => {
    const v = vivos[1];
    limpiarContenido(v);
    const c = new THREE.Group();
    const et = textoHud(ctx, `TEMPORADA CERO NV ${d.tier}`, { tam: 0.016, prof: 0.006, color: COL_VERDE, emis: 0.55 });
    et.grupo.position.set(-0.17 + et.ancho / 2, 0.014, 0.012);
    c.add(et.grupo);
    const fin = textoHud(ctx, `FIN EN ${d.diasTemp}D`, { tam: 0.014, prof: 0.005, color: 0x9fb8dd, emis: 0.35 });
    fin.grupo.position.set(0.17 - fin.ancho / 2, 0.014, 0.012);
    c.add(fin.grupo);
    const pista = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(0.3, 0.014, 0.005)), reg.mat(new THREE.MeshBasicMaterial({ color: 0x1a2a44, transparent: true, opacity: 0.8 })));
    pista.position.set(0, -0.016, 0.012);
    c.add(pista);
    const bar = barraHud(0.3, d.tierProg, COL_VERDE);
    bar.position.set(-0.15 + (0.3 * Math.max(0.02, Math.min(1, d.tierProg))) / 2, -0.016, 0.014);
    c.add(bar);
    v.chip.add(c);
    v.contenido = c;
  };

  const pintarCombo = (d: DatosPiloto) => {
    const v = vivos[2];
    limpiarContenido(v);
    const c = new THREE.Group();
    const caliente = d.combo >= 2;
    const et = textoHud(ctx, `COMBO x${d.combo.toFixed(1)}`, { tam: 0.018, prof: 0.006, color: caliente ? COL_ORO : COL_CIAN, emis: caliente ? 0.7 : 0.45 });
    et.grupo.position.set(-et.ancho / 2, 0.008, 0.012);
    c.add(et.grupo);
    const pista = new THREE.Mesh(reg.geo(new THREE.BoxGeometry(0.16, 0.012, 0.005)), reg.mat(new THREE.MeshBasicMaterial({ color: 0x1a2a44, transparent: true, opacity: 0.8 })));
    pista.position.set(0, -0.02, 0.012);
    c.add(pista);
    const bar = barraHud(0.16, (d.combo - 1) / 2, caliente ? COL_ORO : COL_CIAN);
    bar.position.set(-0.08 + (0.16 * Math.max(0.02, Math.min(1, (d.combo - 1) / 2))) / 2, -0.02, 0.014);
    c.add(bar);
    v.chip.add(c);
    v.contenido = c;
  };

  // ── LAS PLACAS base (cristal) + PROXIES tocables ──
  const mov = ctx.movil;
  // v148 QA móvil: el frustum en 390px mide ~0.39 de ancho — el chip de 0.4
  // se recortaba. En móvil: chip estrecho con lo esencial (C y G, sin racha).
  const W_AGENTE = mov ? 0.3 : 0.52;
  const placaA = placaHud(W_AGENTE, 0.062, COL_CIAN);
  agenteChip.add(placaA.cuerpo, placaA.borde);
  const proxyA = new THREE.Mesh(
    reg.geo(new THREE.BoxGeometry(W_AGENTE + 0.04, 0.09, 0.04)),
    reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
  );
  proxyA.userData = { holo: { accion: "cuenta" } };
  agenteChip.add(proxyA);
  proxies.push(proxyA);

  const placaT = placaHud(mov ? 0.3 : 0.46, 0.062, COL_VERDE);
  temporadaChip.add(placaT.cuerpo, placaT.borde);
  const proxyT = new THREE.Mesh(
    reg.geo(new THREE.BoxGeometry((mov ? 0.3 : 0.46) + 0.04, 0.09, 0.04)),
    reg.mat(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
  );
  proxyT.userData = { holo: { accion: "tab", key: "inicio" } };
  temporadaChip.add(proxyT);
  proxies.push(proxyT);

  const placaC = placaHud(0.26, 0.062, COL_ORO);
  comboChip.add(placaC.cuerpo, placaC.borde);
  comboChip.scale.setScalar(0.92);

  grupo.add(logo.grupo, agenteChip, temporadaChip, comboChip);
  if (mov) temporadaChip.visible = false; // en móvil manda lo esencial

  // ── SINCRONÍA — los stores reales alimentan el casco ──
  let sig = "";
  const sincronizar = () => {
    const d = leerPiloto();
    const s = [d.alias, d.nivel, d.coins, d.gems, d.racha, d.tier, d.tierProg.toFixed(2), d.diasTemp, d.combo.toFixed(1)].join("|");
    if (s === sig) return;
    sig = s;
    pintarAgente(d);
    if (!mov) pintarTemporada(d);
    pintarCombo(d);
  };
  sincronizar();

  // ── COLOCACIÓN — frente a la cámara, esquinas del frustum ──
  const Z_HUD = mov ? 0.9 : 1.0;
  const f = new THREE.Vector3();
  const colocar = (cam: THREE.PerspectiveCamera) => {
    cam.getWorldDirection(f);
    const alto = 2 * Z_HUD * Math.tan((cam.fov * Math.PI) / 360);
    const ancho = alto * cam.aspect;
    const mX = ancho * (mov ? 0.035 : 0.028);
    const mY = alto * (mov ? 0.05 : 0.045);
    grupo.position.copy(cam.position).addScaledVector(f, Z_HUD);
    grupo.quaternion.copy(cam.quaternion);
    // arriba-izquierda: el logo (v148: DEBAJO de la fila del puente)
    logo.grupo.position.set(-ancho / 2 + mX + logo.ancho / 2, alto / 2 - mY - 0.085, 0);
    // IZQUIERDA: la ficha del agente bajo el logo — la derecha la pisan el
    // puente y el ticker (lección de la captura qa-v148-05)
    agenteChip.position.set(-ancho / 2 + mX + W_AGENTE / 2, alto / 2 - mY - 0.185, 0);
    // abajo-izquierda: la temporada — sobre el badge del enlace (wid-izq)
    temporadaChip.position.set(-ancho / 2 + mX + (mov ? 0.17 : 0.23), -alto / 2 + mY + 0.13, 0);
    // abajo-derecha: el combo — sobre la radio (wid-der)
    comboChip.position.set(ancho / 2 - mX - 0.14, -alto / 2 + mY + 0.13, 0);
  };

  // ── TIC — respiración del casco ──
  let accSin = 0;
  const tic = (_t: number, dt: number) => {
    accSin += dt;
    if (accSin >= 1) { accSin = 0; sincronizar(); }
    const m = subraya as THREE.MeshBasicMaterial;
    m.opacity = 0.55 + Math.sin(_t * 1.8) * 0.25;
  };

  return {
    grupo,
    proxies,
    logo: logo.grupo,
    tic,
    sincronizar,
    colocar,
    liberar: () => {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      logo.mats.forEach((m) => m.dispose());
      vivos.forEach(limpiarContenido);
    },
  };
}
