"use client";

// ============================================================================
// FÁBRICAS 3D PROCEDURALES COMPARTIDAS (Three.js puro, cero texturas externas)
// Genera soldados articulados, tanques MBT, IFV, artillería MLRS, lanzadores
// SAM, drones FPV con hélices giratorias, cazas, corbetas y camuflajes reales.
// ============================================================================

import * as THREE from "three";
import type { TipoUnidad3D, Uniforme3D } from "@/lib/teatro-total-data";

export function crearTexturaCamo(
  estilo: Uniforme3D["estiloCamo"],
  primario: string,
  secundario: string,
  acento: string
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = primario;
    ctx.fillRect(0, 0, 128, 128);

    const manchas = estilo === "urbano" || estilo === "vanguard" ? 42 : 55;
    for (let i = 0; i < manchas; i++) {
      const x = ((i * 73 + 17) % 128);
      const y = ((i * 41 + 29) % 128);
      const w = 10 + ((i * 19) % 24);
      const h = 8 + ((i * 23) % 22);
      ctx.fillStyle = i % 5 === 0 ? acento : secundario;
      ctx.globalAlpha = i % 5 === 0 ? (estilo === "vanguard" ? 0.38 : 0.22) : 0.65;
      if (estilo === "urbano" || estilo === "sigilo") {
        ctx.fillRect(x, y, w * 0.7, h * 0.55);
      } else {
        ctx.beginPath();
        ctx.ellipse(x, y, w * 0.6, h * 0.45, (i * 0.6) % Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    // Rejilla ripstop sutil
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let g = 0; g < 128; g += 8) {
      ctx.beginPath();
      ctx.moveTo(g, 0);
      ctx.lineTo(g, 128);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

export function materialTactico(
  color: number | string,
  emissive?: number | string,
  emissiveIntensity = 0.22
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.52,
    metalness: 0.25,
    emissive: emissive ?? color,
    emissiveIntensity,
  });
}

export function construirUnidadMini3D(
  tipo: TipoUnidad3D,
  colorHex: number,
  acentoHex = 0xffc94d
): THREE.Group {
  const g = new THREE.Group();
  const mat = materialTactico(colorHex, colorHex, 0.28);
  const dark = new THREE.MeshStandardMaterial({ color: 0x151821, roughness: 0.65, metalness: 0.35 });
  const glow = new THREE.MeshBasicMaterial({ color: acentoHex });

  if (tipo === "soldier") {
    const piernas = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 0.2), dark);
    piernas.position.y = 0.21;
    g.add(piernas);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.46, 0.24), mat);
    torso.position.y = 0.64;
    g.add(torso);
    const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), dark);
    cabeza.position.y = 0.98;
    g.add(cabeza);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.08), glow);
    visor.position.set(0.11, 0.99, 0);
    g.add(visor);
    const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.06), dark);
    rifle.position.set(0.28, 0.66, 0.14);
    g.add(rifle);
    return g;
  }

  if (tipo === "tank") {
    const orugas = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.26, 0.88), dark);
    orugas.position.y = 0.13;
    g.add(orugas);
    const casco = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.28, 0.78), mat);
    casco.position.y = 0.38;
    g.add(casco);
    const torreta = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.24, 0.62), mat);
    torreta.position.set(-0.08, 0.64, 0);
    torreta.name = "turret";
    const canon = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.15, 8), mat);
    canon.rotation.z = Math.PI / 2;
    canon.position.set(0.75, 0.02, 0);
    torreta.add(canon);
    // Jaula antidrón sutil
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.18), glow);
    visor.position.set(0.26, 0.14, 0.14);
    torreta.add(visor);
    g.add(torreta);
    return g;
  }

  if (tipo === "ifv") {
    const ruedas = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.24, 0.72), dark);
    ruedas.position.y = 0.12;
    g.add(ruedas);
    const casco = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.34, 0.7), mat);
    casco.position.y = 0.38;
    g.add(casco);
    const torreta = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.2, 8), mat);
    torreta.position.set(0.12, 0.64, 0);
    torreta.name = "turret";
    const autoCanon = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.75, 6), dark);
    autoCanon.rotation.z = Math.PI / 2;
    autoCanon.position.set(0.45, 0.02, 0);
    torreta.add(autoCanon);
    g.add(torreta);
    return g;
  }

  if (tipo === "artillery") {
    const chasis = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.28, 0.74), dark);
    chasis.position.y = 0.18;
    g.add(chasis);
    const cabina = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.7), mat);
    cabina.position.set(0.44, 0.48, 0);
    g.add(cabina);
    const pod = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.36, 0.62), mat);
    pod.position.set(-0.22, 0.56, 0);
    pod.rotation.z = 0.42;
    const boca = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.54), glow);
    boca.position.set(0.42, 0, 0);
    pod.add(boca);
    g.add(pod);
    return g;
  }

  if (tipo === "sam") {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.24, 0.8), dark);
    base.position.y = 0.14;
    g.add(base);
    const rack = new THREE.Group();
    rack.position.set(-0.08, 0.45, 0);
    rack.rotation.z = 0.82;
    for (const zOff of [-0.22, -0.07, 0.07, 0.22]) {
      const tubo = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.85, 8), mat);
      tubo.rotation.z = Math.PI / 2;
      tubo.position.set(0, 0, zOff);
      rack.add(tubo);
    }
    g.add(rack);
    const baliza = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), glow);
    baliza.position.set(0.35, 0.42, 0);
    g.add(baliza);
    return g;
  }

  if (tipo === "radar") {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.46, 0.32, 8), dark);
    base.position.y = 0.16;
    g.add(base);
    const plato = new THREE.Group();
    plato.position.y = 0.58;
    plato.name = "radarDish";
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.48, 0.68), mat);
    plato.add(panel);
    const emisor = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 0.48), glow);
    emisor.position.x = 0.06;
    plato.add(emisor);
    g.add(plato);
    return g;
  }

  if (tipo === "drone") {
    const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.28), mat);
    cuerpo.position.y = 0.35;
    g.add(cuerpo);
    const brazos = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.04, 0.06), dark);
    brazos.position.y = 0.37;
    brazos.rotation.y = Math.PI / 4;
    g.add(brazos);
    const brazos2 = brazos.clone();
    brazos2.rotation.y = -Math.PI / 4;
    g.add(brazos2);
    const ojiva = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.34, 8), glow);
    ojiva.rotation.z = -Math.PI / 2;
    ojiva.position.set(0.16, 0.22, 0);
    g.add(ojiva);
    const rotorMat = new THREE.MeshBasicMaterial({ color: acentoHex, transparent: true, opacity: 0.72 });
    const coords: [number, number][] = [
      [0.25, 0.25],
      [0.25, -0.25],
      [-0.25, 0.25],
      [-0.25, -0.25],
    ];
    for (const [rx, rz] of coords) {
      const helice = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.015, 0.04), rotorMat);
      helice.position.set(rx, 0.42, rz);
      helice.name = "rotor";
      g.add(helice);
    }
    return g;
  }

  if (tipo === "ship") {
    const casco = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.26, 0.48), mat);
    casco.position.y = 0.16;
    g.add(casco);
    const proa = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 4), mat);
    proa.rotation.z = -Math.PI / 2;
    proa.rotation.x = Math.PI / 4;
    proa.position.set(1.12, 0.16, 0);
    g.add(proa);
    const puente = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.34), dark);
    puente.position.set(-0.08, 0.44, 0);
    g.add(puente);
    const vls = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.28), glow);
    vls.position.set(0.45, 0.32, 0);
    g.add(vls);
    return g;
  }

  // jet
  const fuselaje = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.35, 6), mat);
  fuselaje.rotation.z = -Math.PI / 2;
  fuselaje.position.y = 0.35;
  g.add(fuselaje);
  const alas = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 1.35), mat);
  alas.position.set(-0.1, 0.35, 0);
  g.add(alas);
  const cabina = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), glow);
  cabina.scale.set(1.6, 0.7, 0.7);
  cabina.position.set(0.25, 0.44, 0);
  g.add(cabina);
  return g;
}
