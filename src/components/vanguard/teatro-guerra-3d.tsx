"use client";

// ============================================================
// v129.0 LA SALA DE GUERRA — EL TEATRO 3D
// "Entrar y ver una guerra": el teatro activo representado como
// una mesa tridimensional viva — terreno del país, ciudades con
// su estado real, frentes encendidos con artillería, unidades
// con símbolos OTAN, drones orbitando y misiles en arco.
// Doctrina de la Casa: todo procedural, todo en vivo, 60 FPS
// (solo transform/opacity), calidad adaptativa y limpieza total.
// ============================================================
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Play, Pause, Moon, Sun, Maximize2 } from "lucide-react";
import type { GuerraActiva } from "@/lib/guerras-activas-data";
import { COLOR_ESTADO } from "@/lib/guerras-activas-data";
import { cn } from "@/lib/utils";

// ── paletas por terreno ──
const TERRENO_PAL: Record<string, { suelo: number; grid: string; bruma: number }> = {
  llanura:  { suelo: 0x232a1c, grid: "rgba(90,140,90,0.16)", bruma: 0x0d1210 },
  urbano:   { suelo: 0x22242a, grid: "rgba(140,140,160,0.14)", bruma: 0x0e0f13 },
  desierto: { suelo: 0x453b26, grid: "rgba(200,170,90,0.14)", bruma: 0x141009 },
  sabana:   { suelo: 0x313d27, grid: "rgba(150,180,90,0.13)", bruma: 0x0e130c },
  selva:    { suelo: 0x1b2e1c, grid: "rgba(80,160,80,0.12)", bruma: 0x0a120a },
  maritimo: { suelo: 0x0d1822, grid: "rgba(90,170,220,0.15)", bruma: 0x081018 },
};

// ── texturas canvas (baratas, una vez por montaje) ──
function texRadial(inner: string, outer: string, size = 96): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function texNato(kind: "inf" | "arm", color: string): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.strokeStyle = color;
  g.fillStyle = "rgba(8,10,12,0.6)";
  g.lineWidth = 4;
  if (kind === "inf") {
    g.beginPath(); g.rect(8, 16, 48, 32); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(8, 16); g.lineTo(56, 48); g.moveTo(56, 16); g.lineTo(8, 48); g.stroke();
  } else {
    g.beginPath(); g.ellipse(32, 32, 26, 16, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function texEtiqueta(txt: string, color: string): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 56;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(4,6,10,0.72)";
  g.fillRect(0, 0, 256, 56);
  g.strokeStyle = color;
  g.lineWidth = 3;
  g.strokeRect(2, 2, 252, 52);
  g.fillStyle = color;
  g.font = "bold 26px monospace";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(txt.slice(0, 14).toUpperCase(), 128, 30);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// proyección del bbox del teatro a la mesa (x: -56..56, z: -28..28)
function mesaXY(guerra: GuerraActiva, lat: number, lng: number): [number, number] {
  const { bbox } = guerra;
  const x = ((lng - bbox.minLng) / (bbox.maxLng - bbox.minLng) - 0.5) * 112;
  const z = ((bbox.maxLat - lat) / (bbox.maxLat - bbox.minLat) - 0.5) * 56;
  return [x, z];
}

// punto aleatorio a lo largo de una polilínea [lat,lng]
function puntoEnPolilinea(puntos: [number, number][], t: number): [number, number] {
  const seg = (puntos.length - 1) * Math.min(0.9999, Math.max(0, t));
  const i = Math.floor(seg);
  const f = seg - i;
  const a = puntos[i], b = puntos[Math.min(puntos.length - 1, i + 1)];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

const SITREP_TIEMPO = 3500;

export function TeatroGuerra3D({ guerra, alto = 430 }: { guerra: GuerraActiva; alto?: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [pausa, setPausa] = useState(false);
  const [noche, setNoche] = useState(false);
  const [vel, setVel] = useState(1);
  const [sitrep, setSitrep] = useState({ id: guerra.id, n: 0 });
  // índice derivado: si cambió el teatro, la rotación arranca en su primera ciudad
  const sitrepIdx = sitrep.id === guerra.id ? sitrep.n : 0;
  const refs = useRef<{
    pausa: boolean; vel: number; noche: boolean;
    luzSol?: THREE.DirectionalLight; luzHemi?: THREE.HemisphereLight;
    bg?: THREE.Scene; bruma?: THREE.Fog;
  }>({ pausa, vel, noche });

  // sincronía de controles → ref (fuera del render: contrato React)
  useEffect(() => {
    refs.current.pausa = pausa;
    refs.current.vel = vel;
    refs.current.noche = noche;
  }, [pausa, vel, noche]);

  // ── SITREP: el parte rotatorio de ciudades (sin setState síncrono: la
  // rotación se reinicia sola cuando el id del teatro cambia) ──
  useEffect(() => {
    const id = setInterval(() => {
      setSitrep((s) => {
        const n = s.id === guerra.id ? s.n + 1 : 1;
        return { id: guerra.id, n: n % Math.max(1, guerra.ciudades.length) };
      });
    }, SITREP_TIEMPO);
    return () => clearInterval(id);
  }, [guerra.id, guerra.ciudades.length]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    const pal = TERRENO_PAL[guerra.terreno] ?? TERRENO_PAL.llanura;

    // ── renderer ──
    const W0 = host.clientWidth || 640;
    const H0 = alto;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    const esMovil = window.matchMedia("(pointer: coarse)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, esMovil ? 1 : 1.25));
    renderer.setSize(W0, H0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(pal.bruma);
    const bruma = new THREE.Fog(pal.bruma, 90, 220);
    scene.fog = bruma;

    const cam = new THREE.PerspectiveCamera(52, W0 / H0, 0.1, 480);
    cam.position.set(0, 36, 50);
    const controls = new OrbitControls(cam, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 16;
    controls.maxDistance = 105;
    controls.maxPolarAngle = 1.42;
    controls.minPolarAngle = 0.15;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;

    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(d: T): T => { disposables.push(d); return d; };
    const mesh = (geo: THREE.BufferGeometry, m: THREE.Material) => {
      track(geo); track(m);
      return new THREE.Mesh(geo, m);
    };

    // ── luces (día por defecto; noche ajusta al vuelo) ──
    const hemi = new THREE.HemisphereLight(0xcfd8e8, pal.suelo, 0.85);
    scene.add(hemi);
    const sol = new THREE.DirectionalLight(0xffe8c0, 1.15);
    sol.position.set(40, 60, -30);
    scene.add(sol);
    const brasa = new THREE.DirectionalLight(0xff5a30, 0.35);
    brasa.position.set(-40, 10, 20);
    scene.add(brasa);
    const glowFrente = new THREE.PointLight(0xff4a2a, 0.5, 80, 1.6);
    glowFrente.position.set(0, 6, 0);
    scene.add(glowFrente);
    refs.current.luzSol = sol;
    refs.current.luzHemi = hemi;
    refs.current.bg = scene;
    refs.current.bruma = bruma;

    // ── terreno con colinas ──
    const gGeo = track(new THREE.PlaneGeometry(150, 84, 64, 28));
    gGeo.rotateX(-Math.PI / 2);
    const gp = gGeo.attributes.position;
    for (let i = 0; i < gp.count; i++) {
      const x = gp.getX(i), z = gp.getZ(i);
      const lejos = Math.abs(z) > 26;
      const h = Math.sin(x * 0.09 + z * 0.05) * 0.6 + Math.sin(x * 0.23 + 2) * 0.35 + Math.cos(z * 0.31) * 0.3;
      gp.setY(i, h * (lejos ? 2.6 : 0.4));
    }
    gGeo.computeVertexNormals();
    const sueloMesh = mesh(gGeo, track(new THREE.MeshLambertMaterial({ color: pal.suelo })));
    scene.add(sueloMesh);

    // ── retícula de sala de operaciones (tablero) ──
    {
      const c = document.createElement("canvas");
      c.width = c.height = 512;
      const g = c.getContext("2d")!;
      g.clearRect(0, 0, 512, 512);
      g.strokeStyle = pal.grid;
      g.lineWidth = 1;
      for (let i = 0; i <= 16; i++) {
        const p = (i / 16) * 512;
        g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 512); g.stroke();
        g.beginPath(); g.moveTo(0, p); g.lineTo(512, p); g.stroke();
      }
      const t = new THREE.CanvasTexture(c);
      track(t);
      const plano = mesh(
        track(new THREE.PlaneGeometry(150, 84)),
        track(new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.9 })),
      );
      plano.rotation.x = -Math.PI / 2;
      plano.position.y = 0.06;
      scene.add(plano);
    }

    // ── atrezzo por terreno ──
    if (guerra.terreno === "urbano") {
      for (let i = 0; i < 16; i++) {
        const bw = 1.6 + (i % 3) * 0.9;
        const bh = 2.4 + ((i * 7) % 5) * 1.4;
        const b = mesh(new THREE.BoxGeometry(bw, bh, bw), track(new THREE.MeshLambertMaterial({ color: 0x181b20 })));
        const [x, z] = mesaXY(guerra, guerra.lat, guerra.lng);
        b.position.set(x - 20 + (i % 6) * 8, bh / 2, z - 12 + ((i * 3) % 5) * 4);
        scene.add(b);
      }
    } else if (guerra.terreno === "selva" || guerra.terreno === "sabana") {
      const n = guerra.terreno === "selva" ? 26 : 14;
      for (let i = 0; i < n; i++) {
        const h = 1.6 + ((i * 5) % 4) * 0.7;
        const p = mesh(new THREE.ConeGeometry(0.9, h, 6), track(new THREE.MeshLambertMaterial({ color: guerra.terreno === "selva" ? 0x14261a : 0x2c3a20 })));
        p.position.set(-46 + ((i * 13) % 92), h / 2, -20 + ((i * 7) % 40));
        scene.add(p);
      }
    } else if (guerra.terreno === "desierto") {
      for (let i = 0; i < 8; i++) {
        const d = mesh(new THREE.SphereGeometry(2.8 + (i % 3), 8, 5), track(new THREE.MeshLambertMaterial({ color: 0x574a2e })));
        d.scale.y = 0.22;
        d.position.set(-46 + i * 12.5, 0.1, -18 - (i % 3) * 5);
        scene.add(d);
      }
    } else if (guerra.terreno === "maritimo") {
      // buques: cajas alargadas de ambos bandos
      for (let i = 0; i < 10; i++) {
        const azul = i % 2 === 0;
        const b = mesh(new THREE.BoxGeometry(3.2, 0.7, 1.1), track(new THREE.MeshLambertMaterial({ color: azul ? 0x1c3a5c : 0x5c1c1c })));
        b.position.set(-40 + (i % 5) * 18 + (azul ? 4 : -4), 0.5, -8 + ((i * 5) % 16) - 6);
        b.rotation.y = Math.PI / 2 + (i % 3) * 0.14;
        scene.add(b);
      }
    } else {
      for (let i = 0; i < 10; i++) {
        const h = 5 + ((i * 3) % 4) * 1.8;
        const p = mesh(new THREE.ConeGeometry(3.6 + (i % 3), h, 6), track(new THREE.MeshLambertMaterial({ color: 0x2a3138 })));
        p.position.set(-52 + i * 11.5, h / 2 - 1, -26 - (i % 2) * 6);
        scene.add(p);
        if (h > 7) {
          const nieve = mesh(new THREE.ConeGeometry(1.2, h * 0.2, 6), track(new THREE.MeshLambertMaterial({ color: 0xdde3ec })));
          nieve.position.set(p.position.x, h - 0.4, p.position.z);
          scene.add(nieve);
        }
      }
    }

    // ── ciudades: marcador + humo + etiqueta ──
    const humos: THREE.Sprite[] = [];
    const luzCiudades: THREE.PointLight[] = [];
    const addSprite = (inner: string, outer: string, x: number, y: number, z: number, s: number, additive = true) => {
      const m = track(new THREE.SpriteMaterial({
        map: track(texRadial(inner, outer)),
        transparent: true, depthWrite: false,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      }));
      const sp = new THREE.Sprite(m);
      sp.position.set(x, y, z);
      sp.scale.set(s, s, 1);
      scene.add(sp);
      return sp;
    };
    for (const ciu of guerra.ciudades) {
      const [x, z] = mesaXY(guerra, ciu.lat, ciu.lng);
      const color = COLOR_ESTADO[ciu.estado] ?? "#8A93A6";
      const enLlamas = ciu.estado === "frente" || ciu.estado === "sitio" || ciu.estado === "contendida";
      // pedestal
      const marcador = mesh(
        track(new THREE.CylinderGeometry(0.55, 0.75, enLlamas ? 0.7 : 0.5, 8)),
        track(new THREE.MeshLambertMaterial({ color: enLlamas ? 0x2a0d0a : 0x1c2229 })),
      );
      marcador.position.set(x, (enLlamas ? 0.7 : 0.5) / 2, z);
      scene.add(marcador);
      const bombilla = addSprite(`${color}dd`, `${color}00`, x, 1.4, z, enLlamas ? 3.4 : 2.4);
      bombilla.material.fog = false;
      // etiqueta flotante
      const et = track(texEtiqueta(ciu.nombre, color));
      const mEt = track(new THREE.SpriteMaterial({ map: et, transparent: true, depthWrite: false }));
      const spEt = new THREE.Sprite(mEt);
      spEt.position.set(x, 2.6, z);
      spEt.scale.set(6.4, 1.4, 1);
      scene.add(spEt);
      // humo de guerra
      if (enLlamas) {
        for (let h = 0; h < 3; h++) {
          const humo = addSprite("rgba(120,110,100,0.34)", "rgba(60,55,50,0)", x + (h - 1) * 0.5, 1.8 + h * 1.5, z, 2.2 - h * 0.4, false);
          humos.push(humo);
        }
      }
      if (ciu.estado === "capital" || ciu.estado === "puerto") {
        const luz = new THREE.PointLight(new THREE.Color(color).getHex(), 0.5, 14, 2);
        luz.position.set(x, 2.4, z);
        scene.add(luz);
        luzCiudades.push(luz);
      }
    }

    // ── frentes: línea encendida + fogonazos ──
    const flashes: THREE.Sprite[] = [];
    for (const fr of guerra.frentes) {
      const pts: THREE.Vector3[] = fr.puntos.map(([la, ln]) => {
        const [x, z] = mesaXY(guerra, la, ln);
        return new THREE.Vector3(x, 0.4, z);
      });
      const curva = new THREE.CatmullRomCurve3(pts);
      const geo = track(new THREE.TubeGeometry(curva, 48, 0.18, 6, false));
      const mat = track(new THREE.MeshBasicMaterial({ color: 0xff4a3a, transparent: true, opacity: 0.9 }));
      scene.add(new THREE.Mesh(geo, mat));
      // halo superior
      const halo = track(new THREE.TubeGeometry(curva, 48, 0.4, 6, false));
      const mHalo = track(new THREE.MeshBasicMaterial({ color: 0xff4a3a, transparent: true, opacity: 0.22 }));
      scene.add(new THREE.Mesh(halo, mHalo));
    }

    // ── unidades con símbolos OTAN a ambos lados del frente ──
    const unidades: THREE.Sprite[] = [];
    {
      const texInfA = track(texNato("inf", "#5AB8FF"));
      const texArmA = track(texNato("arm", "#5AB8FF"));
      const texInfB = track(texNato("inf", "#FF6A55"));
      const texArmB = track(texNato("arm", "#FF6A55"));
      for (const fr of guerra.frentes) {
        const n = Math.max(4, Math.round(guerra.intensidad / 14));
        for (let i = 0; i < n; i++) {
          const t = (i + 0.5) / n;
          const [la, ln] = puntoEnPolilinea(fr.puntos, t);
          const [x, z] = mesaXY(guerra, la, ln);
          // normal aproximada a la polilínea: empuja A a un lado y B al otro
          const [la2, ln2] = puntoEnPolilinea(fr.puntos, Math.min(0.999, t + 0.02));
          const dx = ln2 - ln, dz = la2 - la; // en lat/lng
          const nx = dz, nz = -dx; // perpendicular
          const norm = Math.hypot(nx, nz) || 1;
          const lado = guerra.terreno === "maritimo" ? 2.4 : 2.6;
          for (const bando of [0, 1]) {
            const s = bando === 0 ? -1 : 1;
            const tex = bando === 0 ? (i % 3 === 0 ? texArmA : texInfA) : (i % 3 === 0 ? texArmB : texInfB);
            const m = track(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
            const sp = new THREE.Sprite(m);
            const off = (1.6 + (i % 3) * 0.8) * lado;
            sp.position.set(x + (nx / norm) * off * s + (bando ? 0.6 : -0.6), 1.1, z + (nz / norm) * off * s);
            sp.scale.set(2.4, 2.4, 1);
            scene.add(sp);
            unidades.push(sp);
          }
        }
      }
    }

    // ── drones: cruces que orbitan el frente ──
    const drones: THREE.Sprite[] = [];
    {
      const texDr = track(texNato("inf", "#FFD24A"));
      for (let i = 0; i < 3; i++) {
        const m = track(new THREE.SpriteMaterial({ map: texDr, transparent: true, depthWrite: false, opacity: 0.85 }));
        const sp = new THREE.Sprite(m);
        sp.scale.set(1.5, 1.5, 1);
        scene.add(sp);
        drones.push(sp);
      }
    }

    // ── misil: cono en arco parabólico (uno activo a la vez) ──
    const misil = mesh(track(new THREE.ConeGeometry(0.28, 1.5, 6)), track(new THREE.MeshBasicMaterial({ color: 0xffd9a0 })));
    misil.visible = false;
    scene.add(misil);
    const impacto = addSprite("rgba(255,220,150,0.95)", "rgba(255,90,30,0)", 0, 0, 0, 0);
    impacto.visible = false;

    // ── bucle ──
    const raf = { id: 0 };
    const reloj = new THREE.Clock();
    const estado = { flashT: 0, flashI: 0, misilT: -1, misilA: new THREE.Vector3(), misilB: new THREE.Vector3(), t: 0 };
    const puntosFrente = guerra.frentes.flatMap((f) => f.puntos);
    const ciudadesLlamas = guerra.ciudades.filter((c) => c.estado === "frente" || c.estado === "sitio" || c.estado === "contendida");

    const tick = () => {
      if (disposed) return;
      raf.id = requestAnimationFrame(tick);
      const dt = Math.min(0.05, reloj.getDelta());
      if (!refs.current.pausa) estado.t += dt * refs.current.vel;
      const t = estado.t;

      // día/noche en vuelo
      const esNoche = refs.current.noche;
      sol.intensity = esNoche ? 0.12 : 1.15;
      hemi.intensity = esNoche ? 0.22 : 0.85;
      brasa.intensity = esNoche ? 0.5 : 0.35;
      bruma.color.setHex(esNoche ? 0x070a12 : pal.bruma);
      if (scene.background instanceof THREE.Color) scene.background.setHex(esNoche ? 0x070a12 : pal.bruma);

      // fogonazos de artillería sobre el frente
      if (!refs.current.pausa && puntosFrente.length > 0) {
        estado.flashT -= dt * refs.current.vel;
        if (estado.flashT <= 0 && flashes.length > 0) {
          estado.flashT = Math.max(0.28, 1.6 - guerra.intensidad / 90);
          estado.flashI = (estado.flashI + 1) % flashes.length;
          const f = flashes[estado.flashI];
          const [la, ln] = puntoEnPolilinea(puntosFrente, Math.random());
          const [x, z] = mesaXY(guerra, la, ln);
          f.position.set(x + (Math.random() - 0.5) * 2, 0.8, z + (Math.random() - 0.5) * 2);
          f.userData.t = 0;
        }
        for (const f of flashes) {
          if (f.userData.t === undefined) continue;
          f.userData.t += dt * refs.current.vel * 2.2;
          const k = Math.max(0, 1 - Math.abs(f.userData.t - 0.35) * 2.4);
          f.scale.setScalar(0.6 + k * 3.6);
          f.material.opacity = k;
        }
      }

      // misil en arco hacia una ciudad en llamas
      if (!refs.current.pausa && guerra.activa && ciudadesLlamas.length > 0) {
        if (estado.misilT < 0) {
          estado.misilT = 0;
          const [la, ln] = puntoEnPolilinea(puntosFrente, Math.random());
          const [x, z] = mesaXY(guerra, la, ln);
          estado.misilA.set(x, 0.6, z);
          const c = ciudadesLlamas[Math.floor(Math.random() * ciudadesLlamas.length)];
          const [cx, cz] = mesaXY(guerra, c.lat, c.lng);
          estado.misilB.set(cx, 0.6, cz);
          misil.visible = true;
        } else {
          estado.misilT += dt * refs.current.vel * 0.85;
          const k = Math.min(1, estado.misilT);
          const p = new THREE.Vector3().lerpVectors(estado.misilA, estado.misilB, k);
          p.y += Math.sin(k * Math.PI) * 14;
          misil.position.copy(p);
          misil.rotation.x = -(1 - k) * Math.PI * 0.5;
          misil.rotation.z = k * Math.PI;
          if (k >= 1) {
            misil.visible = false;
            impacto.visible = true;
            impacto.position.copy(estado.misilB).setY(0.9);
            impacto.userData.t = 0;
            estado.misilT = -1;
          }
        }
      }
      if (impacto.visible) {
        impacto.userData.t = (impacto.userData.t ?? 0) + dt * 2.6;
        const kk = Math.max(0, 1 - impacto.userData.t);
        impacto.scale.setScalar(1 + (1 - kk) * 7);
        impacto.material.opacity = kk;
        if (kk <= 0) impacto.visible = false;
      }

      // humo que sube (ciclo por fase)
      for (let i = 0; i < humos.length; i++) {
        const h = humos[i];
        const fase = (t * 0.35 + i * 0.37) % 1;
        h.position.y = 1.8 + fase * 4.2;
        h.material.opacity = 0.3 * (1 - fase);
      }

      // unidades que respiran + drones que orbitan
      for (let i = 0; i < unidades.length; i++) {
        unidades[i].position.y = 1.1 + Math.sin(t * 2 + i) * 0.08;
      }
      for (let i = 0; i < drones.length; i++) {
        const ang = t * 0.5 + i * 2.1;
        const r = 10 + i * 6;
        drones[i].position.set(Math.cos(ang) * r, 5.5 + Math.sin(t * 0.8 + i) * 0.8, Math.sin(ang) * r * 0.55);
      }

      // campana del frente
      glowFrente.intensity = 0.4 + Math.sin(t * 2.4) * 0.18 + guerra.intensidad / 300;

      controls.update();
      renderer.render(scene, cam);
    };

    // pool de fogonazos
    for (let i = 0; i < 7; i++) {
      const f = addSprite("rgba(255,230,170,0.95)", "rgba(255,80,20,0)", 0, -20, 0, 0.1);
      f.material.opacity = 0;
      f.userData.t = undefined;
      flashes.push(f);
    }

    tick();

    const onResize = () => {
      const w = host.clientWidth || W0;
      renderer.setSize(w, alto);
      cam.aspect = w / alto;
      cam.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf.id);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      for (const d of disposables) d.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [guerra, alto]);

  const ciu = guerra.ciudades[sitrepIdx] ?? guerra.ciudades[0];
  const colorCiu = ciu ? COLOR_ESTADO[ciu.estado] : "#8A93A6";

  return (
    <div className="relative rounded border border-border/70 overflow-hidden bg-[#070a0f]" style={{ height: alto + 8 }}>
      <div ref={hostRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* HUD superior: identidad del teatro */}
      <div className="absolute top-2.5 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
        <div className="rounded bg-black/55 backdrop-blur px-2.5 py-1.5 border border-border/60">
          <p className="font-mono text-[9px] font-bold tracking-[0.22em] text-foreground leading-none">
            {guerra.bandoA.bandera} {guerra.nombre.split(" — ")[0]}
          </p>
          <p className="font-mono text-[8px] tracking-widest mt-1" style={{ color: guerra.activa ? "#FF4A3A" : "#7FE3FF" }}>
            {guerra.activa ? "● EN VIVO" : "○ TEATRO OBSERVADO"} · INTENSIDAD {guerra.intensidad}/100
          </p>
        </div>
        <div className="rounded bg-black/55 backdrop-blur px-2.5 py-1.5 border border-border/60 text-right">
          <p className="font-mono text-[8px] tracking-widest text-muted-foreground leading-none">ESCALADA</p>
          <p className="mt-1 flex gap-0.5 justify-end">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={cn("w-1.5 h-3 rounded-sm", i <= guerra.escalada ? "bg-red-500" : "bg-border")} />
            ))}
          </p>
        </div>
      </div>

      {/* HUD inferior: SITREP + controles */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
        <div className="rounded bg-black/55 backdrop-blur px-2.5 py-1.5 border border-border/60 max-w-[62%] pointer-events-none">
          <p className="font-mono text-[8px] tracking-[0.2em] text-muted-foreground">SITREP · {ciu?.nombre.toUpperCase() ?? "—"}</p>
          <p className="text-[10px] leading-snug mt-0.5" style={{ color: colorCiu }}>
            {ciu ? `${ciu.nota ?? ciu.estado}` : "el teatro respira"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setVel((v) => (v === 1 ? 2 : v === 2 ? 0.5 : 1))}
            className="rounded bg-black/55 backdrop-blur border border-border/60 px-2 py-1 font-mono text-[9px] font-bold text-foreground hover:border-foreground/40 transition-all"
            title="velocidad del teatro"
          >
            {vel}×
          </button>
          <button
            onClick={() => setNoche((v) => !v)}
            className="rounded bg-black/55 backdrop-blur border border-border/60 p-1.5 text-foreground hover:border-foreground/40 transition-all"
            title={noche ? "vuelve el día" : "cae la noche sobre el teatro"}
          >
            {noche ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setPausa((v) => !v)}
            className="rounded bg-black/55 backdrop-blur border border-border/60 p-1.5 text-foreground hover:border-foreground/40 transition-all"
            title={pausa ? "reanudar" : "pausar"}
          >
            {pausa ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              const el = hostRef.current?.closest("[data-teatro-vivo]");
              el?.requestFullscreen?.().catch(() => {/* el navegador manda */});
            }}
            className="rounded bg-amber-hud/20 backdrop-blur border border-amber-hud/50 px-2 py-1.5 font-mono text-[9px] font-bold text-amber flex items-center gap-1 hover:bg-amber-hud/30 transition-all"
            title="ENTRAR AL TEATRO — pantalla completa"
          >
            <Maximize2 className="w-3 h-3" /> ENTRAR
          </button>
        </div>
      </div>
    </div>
  );
}