// ============================================================================
// VANGUARD 3D · MOTOR DE SIMULACIÓN DE GUERRA Y RELIEVE DETERMINISTA
// Misma función de elevación en 3D y 2D (paridad 1:1): una colina, costa o
// edificio urbano vive exactamente en las mismas coordenadas en ambas vistas.
// ============================================================================

import type { TeatroMundial, TipoUnidad3D, Escuadron3D } from "./teatro-total-data";

export interface SimUnidad {
  id: string;
  bando: "A" | "B";
  tipo: TipoUnidad3D;
  nombre: string;
  x: number; // -1 .. +1
  z: number; // -1 .. +1
  hp: number;
  maxHp: number;
  alcance: number; // en espacio normalizado
  dano: number;
  velocidad: number;
  cadencia: number; // segundos entre disparos
  cd: number; // cooldown restante
  rot: number; // orientación en radianes
  antiAereo: boolean;
  antiBlindaje: number; // multiplicador
}

export interface SimProyectil {
  id: string;
  bando: "A" | "B";
  estilo: "artilleria" | "misil" | "sam" | "trazadora" | "bomba";
  x0: number;
  y0: number;
  z0: number;
  x1: number;
  y1: number;
  z1: number;
  p: number; // 0..1 progreso
  velocidad: number;
  dano: number;
  radio: number;
  objetivoId?: string;
}

export interface SimExplosion {
  id: string;
  x: number;
  y: number;
  z: number;
  radio: number;
  edad: number;
  maxEdad: number;
  color: string;
}

export interface SimCrater {
  x: number;
  z: number;
  radio: number;
}

export interface SimEvento {
  t: number;
  bando: "A" | "B" | "SYS";
  texto: string;
}

export interface SimEstado {
  unidades: SimUnidad[];
  proyectiles: SimProyectil[];
  explosiones: SimExplosion[];
  crateres: SimCrater[];
  frenteLinea: number[]; // 9 puntos en X para Z = -0.85..+0.85
  bitacora: SimEvento[];
  tiempo: number;
  bajasA: number;
  bajasB: number;
  disparosA: number;
  disparosB: number;
  seq: number;
}

export interface EdificioTeatro {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  tipo: "torre" | "bloque" | "bunker";
}

// ── PRNG DETERMINISTA & RUIDO DE VALOR SUAVE ────────────────────────────────
function hash2(ix: number, iz: number, seed: number): number {
  let n = Math.imul(ix, 374761393) + Math.imul(iz, 668265263) + Math.imul(seed | 0, 1442695041);
  n = (n ^ (n >>> 13)) >>> 0;
  n = Math.imul(n, 1274126177) >>> 0;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, z: number, seed: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = smooth(x - ix);
  const fz = smooth(z - iz);
  const a = hash2(ix, iz, seed);
  const b = hash2(ix + 1, iz, seed);
  const c = hash2(ix, iz + 1, seed);
  const d = hash2(ix + 1, iz + 1, seed);
  const top = a + (b - a) * fx;
  const bot = c + (d - c) * fx;
  return top + (bot - top) * fz;
}

function fbm(x: number, z: number, seed: number, octaves = 4): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, z * freq, seed + i * 101);
    norm += amp;
    amp *= 0.5;
    freq *= 2.05;
  }
  return sum / norm;
}

/**
 * Devuelve la altura del terreno en espacio normalizado `nx, nz in [-1..1]`.
 * Valores negativos = bajo el agua (si `teatro.agua === true`).
 * Escala multiplicada por `teatro.relieveAmplitud` en 3D.
 */
export function elevacionEn(nx: number, nz: number, teatro: TeatroMundial): number {
  const s = teatro.semilla;
  const rx = (nx + 1.5) * 2.4;
  const rz = (nz + 1.5) * 2.4;
  const base = fbm(rx, rz, s, 4); // 0..1
  const ridgeRaw = 1 - Math.abs(fbm(rx * 1.4, rz * 1.4, s + 77, 3) * 2 - 1);

  let h = (base - 0.35) * 1.25;

  if (teatro.bioma === "montana") {
    h = ridgeRaw * ridgeRaw * 1.35 + (base - 0.35) * 0.45 - 0.05;
  } else if (teatro.bioma === "desierto") {
    const duna = Math.sin(nx * 9.5 + nz * 3.2 + base * 5.0) * 0.16;
    const mesa = base > 0.64 ? 0.34 : 0;
    h = (base - 0.32) * 0.65 + duna + mesa;
  } else if (teatro.bioma === "costa") {
    const orient = ((s % 4) - 1.5) * 0.3;
    const pendienteCosta = nx * 0.55 + nz * orient * 0.35;
    const bahia = Math.sin(nz * 3.4 + base * 2.2) * 0.22;
    h = (base - 0.34) * 0.95 - Math.max(0, pendienteCosta + bahia) * 1.15;
    // Asegura tierra a ambos extremos o ribera navegable
    if (nx < -0.58) h = Math.max(0.18, h + 0.25);
  } else if (teatro.bioma === "urbano") {
    // Cuenca fluvial suave con meseta edificable
    const rioCentro = Math.sin(nz * 2.6 + (s % 10) * 0.3) * 0.18;
    const distRio = Math.abs(nx - rioCentro);
    h = (base - 0.42) * 0.45 + 0.12;
    if (teatro.agua && distRio < 0.11) {
      h = -0.28 * (1 - distRio / 0.11);
    }
  } else if (teatro.bioma === "selva") {
    const rio = Math.sin(nx * 2.8 + (s % 7)) * 0.22;
    const distRio = Math.abs(nz - rio);
    h = (base - 0.32) * 0.95 + ridgeRaw * 0.25;
    if (teatro.agua && distRio < 0.09) {
      h = -0.22;
    }
  } else if (teatro.bioma === "artico") {
    h = (ridgeRaw * 0.7 + base * 0.5 - 0.42);
    if (teatro.agua && nx > 0.18 && base < 0.48) h = -0.24;
  } else {
    // llanura
    h = (base - 0.38) * 0.68 + ridgeRaw * 0.14;
    if (teatro.agua && Math.abs(nx - Math.sin(nz * 2.4) * 0.14) < 0.085) {
      h = -0.2;
    }
  }

  // Atenua ligeramente en los bordes extremos para evitar cortes abruptos
  const borde = Math.max(Math.abs(nx), Math.abs(nz));
  if (borde > 0.92) {
    h *= 1 - (borde - 0.92) * 3.5;
  }

  return Number(h.toFixed(4));
}

/** Genera edificios/estructuras urbanas deterministas sobre tierra seca. */
export function edificiosDeTeatro(teatro: TeatroMundial): EdificioTeatro[] {
  const nMax = Math.round(teatro.urbanoDensidad * 44);
  if (nMax <= 0) return [];
  const lista: EdificioTeatro[] = [];
  for (let i = 0; i < nMax; i++) {
    const rx = (hash2(i, 11, teatro.semilla) - 0.5) * 1.56;
    const rz = (hash2(i, 29, teatro.semilla) - 0.5) * 1.56;
    const el = elevacionEn(rx, rz, teatro);
    if (teatro.agua && el <= 0.04) continue;
    const factor = hash2(i, 47, teatro.semilla);
    const tipo: EdificioTeatro["tipo"] =
      teatro.bioma === "urbano" && factor > 0.68
        ? "torre"
        : factor < 0.18
        ? "bunker"
        : "bloque";
    const h =
      tipo === "torre"
        ? 1.5 + factor * 2.4
        : tipo === "bloque"
        ? 0.65 + factor * 1.05
        : 0.38 + factor * 0.25;
    lista.push({
      x: rx,
      z: rz,
      w: tipo === "bunker" ? 0.95 : 0.7 + (i % 3) * 0.16,
      d: tipo === "bunker" ? 0.95 : 0.7 + ((i + 1) % 3) * 0.16,
      h,
      tipo,
    });
  }
  return lista;
}

// ── PERFILES DE COMBATE POR TIPO DE UNIDAD ─────────────────────────────────
const PERFIL_UNIDAD: Record<
  TipoUnidad3D,
  { nombre: string; hp: number; alcance: number; dano: number; vel: number; cadencia: number; antiAereo: boolean; antiBlindaje: number }
> = {
  soldier: { nombre: "Escuadra Infantería", hp: 100, alcance: 0.28, dano: 11, vel: 0.055, cadencia: 1.1, antiAereo: false, antiBlindaje: 0.75 },
  ifv: { nombre: "Blindado IFV", hp: 185, alcance: 0.36, dano: 18, vel: 0.085, cadencia: 1.4, antiAereo: true, antiBlindaje: 1.1 },
  tank: { nombre: "Tanque MBT", hp: 310, alcance: 0.42, dano: 34, vel: 0.065, cadencia: 2.3, antiAereo: false, antiBlindaje: 1.5 },
  artillery: { nombre: "Artillería MLRS", hp: 130, alcance: 1.15, dano: 42, vel: 0.032, cadencia: 3.8, antiAereo: false, antiBlindaje: 1.25 },
  sam: { nombre: "Defensa Aérea SAM", hp: 145, alcance: 0.95, dano: 46, vel: 0.025, cadencia: 2.2, antiAereo: true, antiBlindaje: 0.3 },
  drone: { nombre: "Enjambre Dron FPV", hp: 65, alcance: 0.24, dano: 38, vel: 0.16, cadencia: 1.9, antiAereo: true, antiBlindaje: 1.65 },
  radar: { nombre: "Radar Contrabatería", hp: 120, alcance: 0.65, dano: 8, vel: 0.018, cadencia: 2.5, antiAereo: true, antiBlindaje: 0.5 },
  jet: { nombre: "Caza de Apoyo", hp: 170, alcance: 0.85, dano: 40, vel: 0.24, cadencia: 2.4, antiAereo: true, antiBlindaje: 1.35 },
  ship: { nombre: "Corbeta Misilera", hp: 340, alcance: 1.05, dano: 44, vel: 0.048, cadencia: 3.0, antiAereo: true, antiBlindaje: 1.4 },
};

export interface OpcionesEscenario {
  bonoBlindajeA?: number;
  bonoFuegoA?: number;
  bandoANombre?: string;
  bandoBNombre?: string;
  escuadronA?: Escuadron3D;
}

export function crearUnidadSim(
  seq: number,
  bando: "A" | "B",
  tipo: TipoUnidad3D,
  x: number,
  z: number,
  bonoBlindaje = 1,
  bonoFuego = 1,
  etiquetaCustom?: string
): SimUnidad {
  const p = PERFIL_UNIDAD[tipo];
  const hpMax = Math.round(p.hp * (bando === "A" ? bonoBlindaje : 1));
  return {
    id: `u-${seq}-${tipo}-${bando}`,
    bando,
    tipo,
    nombre: etiquetaCustom ?? p.nombre,
    x: Math.max(-0.92, Math.min(0.92, x)),
    z: Math.max(-0.88, Math.min(0.88, z)),
    hp: hpMax,
    maxHp: hpMax,
    alcance: p.alcance,
    dano: Math.round(p.dano * (bando === "A" ? bonoFuego : 1)),
    velocidad: p.vel,
    cadencia: p.cadencia,
    cd: (seq % 5) * 0.25,
    rot: bando === "A" ? 0 : Math.PI,
    antiAereo: p.antiAereo,
    antiBlindaje: p.antiBlindaje,
  };
}

function posSecaCercana(x: number, z: number, teatro: TeatroMundial): [number, number] {
  if (!teatro.agua) return [x, z];
  if (elevacionEn(x, z, teatro) > 0.02) return [x, z];
  for (let r = 0.08; r <= 0.75; r += 0.08) {
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      const cx = Math.max(-0.9, Math.min(0.9, x + Math.cos(ang) * r));
      const cz = Math.max(-0.85, Math.min(0.85, z + Math.sin(ang) * r));
      if (elevacionEn(cx, cz, teatro) > 0.02) return [cx, cz];
    }
  }
  return [x, z];
}

function posAguaCercana(x: number, z: number, teatro: TeatroMundial): [number, number] {
  if (!teatro.agua) return [x, z];
  if (elevacionEn(x, z, teatro) <= -0.02) return [x, z];
  for (let r = 0.1; r <= 1.2; r += 0.1) {
    for (let a = 0; a < 10; a++) {
      const ang = (a / 10) * Math.PI * 2;
      const cx = Math.max(-0.9, Math.min(0.9, x + Math.cos(ang) * r));
      const cz = Math.max(-0.85, Math.min(0.85, z + Math.sin(ang) * r));
      if (elevacionEn(cx, cz, teatro) <= -0.02) return [cx, cz];
    }
  }
  return [x, z];
}

export function crearEscenarioInicial(
  teatro: TeatroMundial,
  opts: OpcionesEscenario = {}
): SimEstado {
  const bA = opts.bonoBlindajeA ?? 1.15;
  const fA = opts.bonoFuegoA ?? 1.1;
  let seq = 1;
  const unidades: SimUnidad[] = [];

  const plantillasA: [TipoUnidad3D, number, number][] = [
    ["tank", -0.46, -0.35],
    ["tank", -0.44, 0.25],
    ["ifv", -0.52, -0.05],
    ["soldier", -0.34, -0.52],
    ["soldier", -0.32, 0.02],
    ["soldier", -0.36, 0.48],
    ["artillery", -0.78, -0.42],
    ["sam", -0.74, 0.36],
    ["drone", -0.28, -0.18],
    ["jet", -0.68, 0.0],
  ];

  const plantillasB: [TipoUnidad3D, number, number][] = [
    ["tank", 0.46, -0.28],
    ["tank", 0.45, 0.34],
    ["ifv", 0.54, 0.05],
    ["soldier", 0.35, -0.46],
    ["soldier", 0.33, 0.08],
    ["soldier", 0.37, 0.52],
    ["artillery", 0.78, 0.38],
    ["sam", 0.74, -0.35],
    ["drone", 0.28, 0.22],
    ["jet", 0.68, -0.08],
  ];

  if (teatro.bioma === "costa" && teatro.agua) {
    plantillasA.push(["ship", -0.18, -0.62]);
    plantillasB.push(["ship", 0.24, 0.58]);
  }

  for (const [tipo, rx, rz] of plantillasA) {
    const [ux, uz] =
      tipo === "ship"
        ? posAguaCercana(rx, rz, teatro)
        : tipo === "jet" || tipo === "drone"
        ? [rx, rz]
        : posSecaCercana(rx, rz, teatro);
    unidades.push(crearUnidadSim(seq++, "A", tipo, ux, uz, bA, fA));
  }

  for (const [tipo, rx, rz] of plantillasB) {
    const [ux, uz] =
      tipo === "ship"
        ? posAguaCercana(rx, rz, teatro)
        : tipo === "jet" || tipo === "drone"
        ? [rx, rz]
        : posSecaCercana(rx, rz, teatro);
    unidades.push(crearUnidadSim(seq++, "B", tipo, ux, uz, 1, 1));
  }

  return {
    unidades,
    proyectiles: [],
    explosiones: [],
    crateres: [],
    frenteLinea: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    bitacora: [
      {
        t: 0,
        bando: "SYS",
        texto: `Teatro ${teatro.nombre} (${teatro.lat.toFixed(2)}°, ${teatro.lng.toFixed(2)}°) listo en 3D + 2D.`,
      },
      {
        t: 0,
        bando: "A",
        texto: `${opts.bandoANombre ?? teatro.bandoA} desplegado al oeste (${plantillasA.length} unidades).`,
      },
    ],
    tiempo: 0,
    bajasA: 0,
    bajasB: 0,
    disparosA: 0,
    disparosB: 0,
    seq,
  };
}

export function desplegarEscuadronEnSim(
  estado: SimEstado,
  escuadron: Escuadron3D,
  bando: "A" | "B",
  x: number,
  z: number,
  teatro: TeatroMundial,
  bonoBlindaje = 1,
  bonoFuego = 1
): SimEstado {
  let seq = estado.seq;
  const nuevas: SimUnidad[] = [];
  for (const m of escuadron.miembros.slice(0, 5)) {
    const ox = x + m.offset[0] * 0.04;
    const oz = z + m.offset[1] * 0.04;
    const [ux, uz] =
      m.tipo === "ship"
        ? posAguaCercana(ox, oz, teatro)
        : m.tipo === "jet" || m.tipo === "drone"
        ? [ox, oz]
        : posSecaCercana(ox, oz, teatro);
    nuevas.push(crearUnidadSim(seq++, bando, m.tipo, ux, uz, bonoBlindaje, bonoFuego, m.rol));
  }
  return {
    ...estado,
    seq,
    unidades: [...estado.unidades, ...nuevas],
    bitacora: [
      {
        t: Number(estado.tiempo.toFixed(1)),
        bando,
        texto: `Desplegado ${escuadron.nombre} (${nuevas.length} elementos) en (${x.toFixed(2)}, ${z.toFixed(2)}).`,
      },
      ...estado.bitacora,
    ].slice(0, 28),
  };
}

export function lanzarAtaqueQuirurgico(
  estado: SimEstado,
  bando: "A" | "B",
  tx: number,
  tz: number,
  teatro: TeatroMundial
): SimEstado {
  const origenX = bando === "A" ? -0.9 : 0.9;
  const origenZ = tz * 0.65;
  const y0 = Math.max(0.1, elevacionEn(origenX, origenZ, teatro)) + 0.15;
  const y1 = Math.max(0, elevacionEn(tx, tz, teatro));
  const nextSeq = estado.seq + 3;
  const proyectiles: SimProyectil[] = [
    ...estado.proyectiles,
    {
      id: `p-${estado.seq}`,
      bando,
      estilo: "misil",
      x0: origenX,
      y0,
      z0: origenZ,
      x1: tx,
      y1,
      z1: tz,
      p: 0,
      velocidad: 0.72,
      dano: 72,
      radio: 0.18,
    },
    {
      id: `p-${estado.seq + 1}`,
      bando,
      estilo: "misil",
      x0: origenX,
      y0: y0 + 0.1,
      z0: origenZ + 0.08,
      x1: Math.max(-0.9, Math.min(0.9, tx + 0.06)),
      y1,
      z1: Math.max(-0.85, Math.min(0.85, tz - 0.05)),
      p: 0,
      velocidad: 0.66,
      dano: 54,
      radio: 0.15,
    },
  ];
  return {
    ...estado,
    seq: nextSeq,
    proyectiles,
    bitacora: [
      {
        t: Number(estado.tiempo.toFixed(1)),
        bando,
        texto: `Salva de misiles guiados lanzada sobre cuadrícula (${tx.toFixed(2)}, ${tz.toFixed(2)}).`,
      },
      ...estado.bitacora,
    ].slice(0, 28),
  };
}

export function avanzarSimulacion(
  estado: SimEstado,
  teatro: TeatroMundial,
  dt: number
): SimEstado {
  const step = Math.min(0.08, Math.max(0.008, dt));
  const tiempo = estado.tiempo + step;
  let seq = estado.seq;
  let bajasA = estado.bajasA;
  let bajasB = estado.bajasB;
  let disparosA = estado.disparosA;
  let disparosB = estado.disparosB;

  const unidades = estado.unidades.map((u) => ({ ...u }));
  const proyectiles: SimProyectil[] = [];
  const explosiones: SimExplosion[] = estado.explosiones
    .map((e) => ({ ...e, edad: e.edad + step }))
    .filter((e) => e.edad < e.maxEdad);
  const crateres = [...estado.crateres];
  const eventos = [...estado.bitacora];

  const registrarEvento = (bando: "A" | "B" | "SYS", texto: string) => {
    eventos.unshift({ t: Number(tiempo.toFixed(1)), bando, texto });
  };

  // 1) Movimiento y selección de blancos
  for (const u of unidades) {
    if (u.hp <= 0) continue;
    u.cd = Math.max(0, u.cd - step);

    const esAereo = u.tipo === "jet" || u.tipo === "drone";
    const enemigos = unidades.filter((e) => e.hp > 0 && e.bando !== u.bando);
    if (enemigos.length === 0) continue;

    // Prioriza blancos alcanzables o más cercanos
    let blanco: SimUnidad | null = null;
    let mejorDist = Infinity;
    for (const e of enemigos) {
      const eAereo = e.tipo === "jet" || e.tipo === "drone";
      if (eAereo && !u.antiAereo) continue;
      if (!eAereo && u.tipo === "sam") continue;
      const d = Math.hypot(e.x - u.x, e.z - u.z);
      if (d < mejorDist) {
        mejorDist = d;
        blanco = e;
      }
    }
    if (!blanco) {
      blanco = enemigos[0];
      mejorDist = Math.hypot(blanco.x - u.x, blanco.z - u.z);
    }

    const dx = blanco.x - u.x;
    const dz = blanco.z - u.z;
    const ang = Math.atan2(dz, dx);

    // Movimiento táctico: cazas orbitan, artillería/SAM mantienen distancia
    if (u.tipo === "jet") {
      const orbitAng = tiempo * 0.55 + (u.bando === "A" ? 0 : Math.PI);
      const tx = Math.cos(orbitAng) * 0.55;
      const tz = Math.sin(orbitAng * 0.8) * 0.58;
      const mx = tx - u.x;
      const mz = tz - u.z;
      const len = Math.hypot(mx, mz) || 1;
      u.x += (mx / len) * u.velocidad * step;
      u.z += (mz / len) * u.velocidad * step;
      u.rot = Math.atan2(mz, mx);
    } else if (u.tipo === "artillery" || u.tipo === "sam" || u.tipo === "radar") {
      u.rot = ang;
      if (mejorDist > u.alcance * 0.92 && u.tipo === "artillery") {
        const nx = u.x + (dx / (mejorDist || 1)) * u.velocidad * step;
        const nz = u.z + (dz / (mejorDist || 1)) * u.velocidad * step;
        if (!teatro.agua || elevacionEn(nx, nz, teatro) > 0.01) {
          u.x = nx;
          u.z = nz;
        }
      }
    } else if (u.tipo === "ship") {
      u.rot = ang;
      if (mejorDist > u.alcance * 0.65) {
        const nx = u.x + (dx / (mejorDist || 1)) * u.velocidad * step;
        const nz = u.z + (dz / (mejorDist || 1)) * u.velocidad * step;
        if (!teatro.agua || elevacionEn(nx, nz, teatro) <= -0.01) {
          u.x = nx;
          u.z = nz;
        }
      }
    } else {
      u.rot = ang;
      const distanciaOptima = u.alcance * 0.68;
      if (mejorDist > distanciaOptima) {
        const nx = u.x + (dx / (mejorDist || 1)) * u.velocidad * step;
        const nz = u.z + (dz / (mejorDist || 1)) * u.velocidad * step;
        const el = elevacionEn(nx, nz, teatro);
        if (esAereo || !teatro.agua || el > 0.0) {
          u.x = Math.max(-0.92, Math.min(0.92, nx));
          u.z = Math.max(-0.88, Math.min(0.88, nz));
        } else {
          // Rodea el río/costa suavemente
          const perpX = -dz / (mejorDist || 1);
          const perpZ = dx / (mejorDist || 1);
          const rx = Math.max(-0.92, Math.min(0.92, u.x + perpX * u.velocidad * step));
          const rz = Math.max(-0.88, Math.min(0.88, u.z + perpZ * u.velocidad * step));
          if (elevacionEn(rx, rz, teatro) > -0.04) {
            u.x = rx;
            u.z = rz;
          }
        }
      }
    }

    // Disparo si está dentro de alcance (bono de altura en cimas)
    const elevPropia = elevacionEn(u.x, u.z, teatro);
    const bonoAltura = elevPropia > 0.25 ? 1.12 : 1.0;
    if (mejorDist <= u.alcance * bonoAltura && u.cd <= 0) {
      u.cd = u.cadencia;
      if (u.bando === "A") disparosA++;
      else disparosB++;

      const y0 = Math.max(0, elevPropia) + (esAereo ? 0.45 : 0.08);
      const y1 = Math.max(0, elevacionEn(blanco.x, blanco.z, teatro)) + (blanco.tipo === "jet" || blanco.tipo === "drone" ? 0.45 : 0.04);
      const estilo: SimProyectil["estilo"] =
        u.tipo === "artillery" || u.tipo === "ship"
          ? "artilleria"
          : u.tipo === "sam"
          ? "sam"
          : u.tipo === "jet"
          ? "bomba"
          : u.tipo === "drone"
          ? "misil"
          : "trazadora";

      const multBlindado = blanco.tipo === "tank" || blanco.tipo === "ifv" ? u.antiBlindaje : 1;
      proyectiles.push({
        id: `pr-${seq++}`,
        bando: u.bando,
        estilo,
        x0: u.x,
        y0,
        z0: u.z,
        x1: blanco.x,
        y1,
        z1: blanco.z,
        p: 0,
        velocidad: estilo === "trazadora" ? 2.1 : estilo === "sam" ? 1.5 : 0.88,
        dano: Math.round(u.dano * multBlindado),
        radio: estilo === "artilleria" || estilo === "bomba" ? 0.12 : 0.05,
        objetivoId: blanco.id,
      });
    }
  }

  // 2) Avanzar proyectiles e impactos
  for (const pr of estado.proyectiles) {
    const pNuevo = pr.p + pr.velocidad * step;
    if (pNuevo < 1) {
      proyectiles.push({ ...pr, p: pNuevo });
      continue;
    }

    // Impacto en destino
    let huboImpactoFuerte = pr.estilo !== "trazadora";
    for (const u of unidades) {
      if (u.hp <= 0 || u.bando === pr.bando) continue;
      const dist = Math.hypot(u.x - pr.x1, u.z - pr.z1);
      if (u.id === pr.objetivoId || dist <= pr.radio) {
        const atenuacion = dist <= pr.radio ? Math.max(0.45, 1 - dist / (pr.radio * 1.4)) : 1;
        const elevU = elevacionEn(u.x, u.z, teatro);
        const cobertura = elevU > 0.25 ? 0.85 : 1.0;
        const dmg = Math.max(4, Math.round(pr.dano * atenuacion * cobertura));
        u.hp = Math.max(0, u.hp - dmg);
        if (u.hp === 0) {
          huboImpactoFuerte = true;
          if (u.bando === "A") bajasA++;
          else bajasB++;
          registrarEvento(pr.bando, `${u.nombre} (${u.bando === "A" ? "Vanguard" : "OPFOR"}) neutralizado.`);
        }
      }
    }

    if (huboImpactoFuerte) {
      explosiones.push({
        id: `ex-${seq++}`,
        x: pr.x1,
        y: pr.y1,
        z: pr.z1,
        radio: pr.estilo === "misil" || pr.estilo === "artilleria" ? 1.5 : 0.95,
        edad: 0,
        maxEdad: 0.75,
        color: pr.bando === "A" ? "#FFC94D" : "#FF4D4D",
      });
      if (pr.estilo === "artilleria" || pr.estilo === "misil" || pr.estilo === "bomba") {
        crateres.push({ x: pr.x1, z: pr.z1, radio: 0.038 });
        if (crateres.length > 36) crateres.shift();
      }
    }
  }

  // 3) Actualizar línea del frente dinámica en 9 bandas de Z
  const vivas = unidades.filter((u) => u.hp > 0);
  const frenteLinea: number[] = [];
  for (let i = 0; i < 9; i++) {
    const bandZ = -0.8 + (i / 8) * 1.6;
    let pesoA = 0;
    let pesoB = 0;
    let sumXA = 0;
    let sumXB = 0;
    for (const u of vivas) {
      const w = Math.exp(-Math.pow((u.z - bandZ) * 2.6, 2));
      if (u.bando === "A") {
        pesoA += w;
        sumXA += u.x * w;
      } else {
        pesoB += w;
        sumXB += u.x * w;
      }
    }
    const avgA = pesoA > 0.01 ? sumXA / pesoA : -0.35;
    const avgB = pesoB > 0.01 ? sumXB / pesoB : 0.35;
    const medio = (avgA + avgB) * 0.5;
    const previo = estado.frenteLinea[i] ?? 0;
    frenteLinea.push(Number((previo + (medio - previo) * 0.15).toFixed(3)));
  }

  return {
    unidades: vivas,
    proyectiles,
    explosiones: explosiones.slice(-24),
    crateres,
    frenteLinea,
    bitacora: eventos.slice(0, 28),
    tiempo,
    bajasA,
    bajasB,
    disparosA,
    disparosB,
    seq,
  };
}
