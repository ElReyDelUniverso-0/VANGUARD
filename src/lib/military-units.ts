// VANGUARD v32 CIELO DE ACERO — GENERADOR DE UNIDADES MILITARES 3D.
// Convierte el estado del Mundo de Guerra (mp:state) en una flota visible sobre
// el globo: aviones de patrulla en altura, columnas de blindados y clusters de
// infantería alrededor de cada territorio con dueño.
//  · Modelos low-poly con primitivas Three.js (cero assets, cero descargas)
//  · Determinista: mismo estado → mismas posiciones (hash territorio+dueño)
//  · Cache de objetos THREE por id+sig: los ticks de 1s NO reconstruyen geometría
// Solo se importa desde componentes ssr:false (necesita WebGL/three).

import * as THREE from "three";

export type UnitKind = "jet" | "tank" | "inf";

export interface UnitTerrMeta {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface UnitPlayer {
  name: string;
  color: string;
}

export interface UnitTerritory {
  owner: string | null;
  troops: number;
}

/** Datum para globe.gl objectsData (ver Globe3DUnit en globe-map-3d). */
export interface MilUnit {
  id: string;
  kind: UnitKind;
  lat: number;
  lng: number;
  alt: number;
  color: string;
  object: unknown;
  labelTag: string;
  label: string;
  terrId: string;
}

// ===== RNG determinista (mulberry32) =====
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ===== geometrías compartidas (se crean UNA vez por sesión) =====
const G = {
  jetBody: new THREE.BoxGeometry(0.5, 0.34, 4.2),
  jetNose: new THREE.ConeGeometry(0.25, 1.1, 4),
  jetWing: new THREE.BoxGeometry(4.6, 0.08, 1.35),
  jetTail: new THREE.BoxGeometry(0.07, 0.78, 0.65),
  jetStab: new THREE.BoxGeometry(1.55, 0.06, 0.5),
  tankHull: new THREE.BoxGeometry(1.6, 0.5, 2.6),
  tankTurret: new THREE.BoxGeometry(0.9, 0.42, 1.05),
  tankBarrel: new THREE.CylinderGeometry(0.08, 0.08, 1.8, 6),
  tankTrack: new THREE.BoxGeometry(0.38, 0.36, 2.85),
  infBody: new THREE.CapsuleGeometry(0.2, 0.55, 3, 6),
  infHead: new THREE.SphereGeometry(0.17, 6, 5),
};

// materiales por color (compartidos entre unidades del mismo dueño)
const MAT_CACHE = new Map<string, THREE.MeshLambertMaterial>();
function mat(color: string): THREE.MeshLambertMaterial {
  let m = MAT_CACHE.get(color);
  if (!m) {
    m = new THREE.MeshLambertMaterial({ color });
    MAT_CACHE.set(color, m);
  }
  return m;
}

const M = (geo: THREE.BufferGeometry, color: string) => new THREE.Mesh(geo, mat(color));

// ===== constructores low-poly (avanzan hacia +Z local; el grupo se orienta a la superficie) =====
function makeJet(color: string): THREE.Group {
  const g = new THREE.Group();
  g.add(M(G.jetBody, color));
  const nose = M(G.jetNose, color);
  nose.rotation.x = Math.PI / 2; // cono apuntando a +Z
  nose.position.set(0, 0, 2.65);
  g.add(nose);
  const wing = M(G.jetWing, color);
  wing.position.set(0, 0, -0.35);
  g.add(wing);
  const tail = M(G.jetTail, color);
  tail.position.set(0, 0.42, -1.85);
  g.add(tail);
  const stab = M(G.jetStab, color);
  stab.position.set(0, 0.1, -2.0);
  g.add(stab);
  g.scale.setScalar(1.15);
  return g;
}

function makeTank(color: string): THREE.Group {
  const g = new THREE.Group();
  const hull = M(G.tankHull, color);
  hull.position.y = 0.45;
  g.add(hull);
  const tL = M(G.tankTrack, color);
  tL.position.set(-0.78, 0.18, 0);
  g.add(tL);
  const tR = M(G.tankTrack, color);
  tR.position.set(0.78, 0.18, 0);
  g.add(tR);
  const tur = M(G.tankTurret, color);
  tur.position.set(0, 0.92, -0.18);
  g.add(tur);
  const barrel = M(G.tankBarrel, color);
  barrel.rotation.x = Math.PI / 2; // cilindro apuntando a +Z
  barrel.position.set(0, 0.95, 1.0);
  g.add(barrel);
  g.scale.setScalar(1.05);
  return g;
}

function makeInf(color: string): THREE.Group {
  const g = new THREE.Group();
  const spots: Array<[number, number]> = [
    [0, 0],
    [0.85, 0.55],
    [-0.7, -0.5],
  ];
  for (const [x, z] of spots) {
    const body = M(G.infBody, color);
    body.position.set(x, 0.55, z);
    g.add(body);
    const head = M(G.infHead, color);
    head.position.set(x, 1.12, z);
    g.add(head);
  }
  g.scale.setScalar(1.25);
  return g;
}

function makeUnit(kind: UnitKind, color: string): THREE.Group {
  return kind === "jet" ? makeJet(color) : kind === "tank" ? makeTank(color) : makeInf(color);
}

// orientación: eje Y del modelo → normal de la superficie en (lat,lng);
// convención idéntica a three-globe polar2Cartesian (theta = 90-lng).
const UP = new THREE.Vector3(0, 1, 0);
function surfaceQuaternion(lat: number, lng: number): THREE.Quaternion {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((90 - lng) * Math.PI) / 180;
  const n = new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta)
  );
  return new THREE.Quaternion().setFromUnitVectors(UP, n);
}

// ===== cache de objetos THREE por unidad (id → sig + grupo) =====
export interface MilUnitCacheEntry {
  sig: string;
  object: THREE.Group;
}
export type MilUnitCache = Map<string, MilUnitCacheEntry>;

export function newMilUnitCache(): MilUnitCache {
  return new Map();
}

const KIND_KEY: Record<UnitKind, string> = { jet: "god.unidad.avion", tank: "god.unidad.tanque", inf: "god.unidad.soldado" };
export const UNIT_KIND_KEY = KIND_KEY;

/**
 * Genera la flota completa del mundo. Determinista; reutiliza objetos THREE
 * entre llamadas vía cache (los ticks de 1s no reconstruyen nada).
 * kindLabel: función de traducción para los tooltips (p.ej. t("god.unidad.avion")).
 */
export function buildMilitaryUnits(
  meta: UnitTerrMeta[],
  territories: Record<string, UnitTerritory>,
  players: Record<string, UnitPlayer>,
  cache: MilUnitCache,
  kindLabel: (k: UnitKind) => string
): MilUnit[] {
  const units: MilUnit[] = [];

  for (const tm of meta) {
    const st = territories[tm.id];
    if (!st?.owner) continue;
    const player = players[st.owner];
    if (!player?.color) continue;
    const color = player.color;
    const rng = mulberry32(hashStr(`${tm.id}|${st.owner}`));
    const troops = st.troops;

    const plan: Array<{ kind: UnitKind; n: number; jitter: number; alt: number }> = [
      { kind: "jet", n: Math.min(2, 1 + Math.floor(troops / 45)), jitter: 2.6, alt: 0.062 },
      { kind: "tank", n: Math.min(2, 1 + Math.floor(troops / 30)), jitter: 1.7, alt: 0.012 },
      { kind: "inf", n: 1, jitter: 1.1, alt: 0.008 },
    ];

    for (const p of plan) {
      for (let i = 0; i < p.n; i++) {
        const id = `${tm.id}-${p.kind}-${i}`;
        const heading = rng() * Math.PI * 2;
        const lat = tm.lat + (rng() - 0.5) * p.jitter * 2;
        const lng = tm.lng + (rng() - 0.5) * p.jitter * 2;

        const sig = `${p.kind}|${color}|${heading.toFixed(2)}|${lat.toFixed(1)}|${lng.toFixed(1)}`;
        let entry = cache.get(id);
        if (!entry || entry.sig !== sig) {
          const obj = makeUnit(p.kind, color);
          obj.quaternion.copy(surfaceQuaternion(lat, lng));
          obj.rotateY(heading);
          entry = { sig, object: obj };
          cache.set(id, entry);
        }

        units.push({
          id,
          kind: p.kind,
          lat,
          lng,
          alt: p.alt,
          color,
          object: entry.object,
          labelTag: kindLabel(p.kind).toUpperCase(),
          label: `${tm.name} · ${player.name} · ${troops}`,
          terrId: tm.id,
        });
      }
    }
  }

  // límite duro de seguridad para móviles modestos
  return units.length > 150 ? units.slice(0, 150) : units;
}
