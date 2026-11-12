"use client";

// ============================================================================
// ARMERÍA TÁCTICA 3D INTERACTIVA CON DESPIECE CAD (Three.js + OrbitControls)
// Cada arma tiene 5 subgrupos articulados (cañón, cajón, óptica, cargador,
// culata/plataforma) que se separan suavemente en vista explotada (0..100%),
// modo Rayos-X wireframe, resaltado de pieza y rotación 360°.
// ============================================================================

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Arma3D } from "@/lib/teatro-total-data";

interface ParteNode {
  id: string;
  grp: THREE.Group;
  offset: THREE.Vector3;
  mats: THREE.MeshStandardMaterial[];
}

function construirModeloArma(arma: Arma3D): { root: THREE.Group; partes: ParteNode[] } {
  const root = new THREE.Group();
  const partes: ParteNode[] = [];
  const acento = arma.esVanguard ? 0xffc94d : 0x38bdf8;
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x262c38, roughness: 0.4, metalness: 0.65 });
  const gunMetal = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.72 });
  const accentMat = new THREE.MeshStandardMaterial({
    color: acento,
    emissive: acento,
    emissiveIntensity: 0.2,
    roughness: 0.35,
    metalness: 0.55,
  });
  const opticMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.8,
  });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a4b24, roughness: 0.7, metalness: 0.1 });
  const oliveMat = new THREE.MeshStandardMaterial({ color: 0x4b5d34, roughness: 0.62, metalness: 0.25 });
  const warheadMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.42, metalness: 0.45 });

  const makePart = (idx: number, meshes: THREE.Mesh[]) => {
    const grp = new THREE.Group();
    const mats: THREE.MeshStandardMaterial[] = [];
    for (const m of meshes) {
      const cloned = (m.material as THREE.MeshStandardMaterial).clone();
      m.material = cloned;
      mats.push(cloned);
      grp.add(m);
    }
    const pDef = arma.piezas[idx];
    const off = pDef ? new THREE.Vector3(...pDef.offset) : new THREE.Vector3();
    root.add(grp);
    partes.push({ id: pDef?.id ?? `part-${idx}`, grp, offset: off, mats });
  };

  const t = arma.modelo3D;

  if (t === "vanguard_rifle" || t === "rifle_nato" || t === "rifle_ak" || t === "sniper") {
    const largo = t === "sniper" ? 1.95 : 1.35;
    const isAK = t === "rifle_ak";
    const bodyMat = arma.esVanguard ? accentMat : isAK ? darkMetal : gunMetal;
    const stockMat = isAK ? woodMat : darkMetal;

    // 0: Cañón + freno / supresor
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.048, largo, 14),
      gunMetal
    );
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(0.85, 0.08, 0);
    const muzzle = new THREE.Mesh(
      t === "sniper"
        ? new THREE.BoxGeometry(0.24, 0.14, 0.16)
        : new THREE.CylinderGeometry(0.075, 0.075, 0.42, 14),
      arma.esVanguard ? accentMat : darkMetal
    );
    if (t !== "sniper") muzzle.rotation.z = Math.PI / 2;
    muzzle.position.set(0.85 + largo / 2 + 0.15, 0.08, 0);
    const handguard = new THREE.Mesh(
      new THREE.BoxGeometry(largo * 0.62, 0.16, 0.15),
      isAK ? woodMat : darkMetal
    );
    handguard.position.set(0.55, 0.06, 0);
    makePart(0, [barrel, muzzle, handguard]);

    // 1: Receptor / Cajón de mecanismos + empuñadura
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.22, 0.17), bodyMat);
    upper.position.set(-0.08, 0.06, 0);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.34, 0.12), darkMetal);
    grip.position.set(-0.28, -0.2, 0);
    grip.rotation.z = 0.25;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.04, 0.12), gunMetal);
    rail.position.set(0.02, 0.19, 0);
    makePart(1, [upper, grip, rail]);

    // 2: Óptica / Mira
    const scopeTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.065, t === "sniper" ? 0.72 : 0.42, 14),
      t === "sniper" ? darkMetal : opticMat
    );
    scopeTube.rotation.z = Math.PI / 2;
    scopeTube.position.set(-0.02, 0.31, 0);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.05, 14), opticMat);
    lens.rotation.z = Math.PI / 2;
    lens.position.set(t === "sniper" ? 0.35 : 0.2, 0.31, 0);
    makePart(2, [scopeTube, lens]);

    // 3: Cargador
    const mag = new THREE.Mesh(
      new THREE.BoxGeometry(isAK ? 0.17 : 0.18, isAK ? 0.56 : 0.48, 0.11),
      arma.esVanguard ? accentMat : darkMetal
    );
    mag.position.set(0.08, -0.28, 0);
    mag.rotation.z = isAK ? -0.26 : -0.1;
    makePart(3, [mag]);

    // 4: Culata
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.24, 0.13), stockMat);
    stock.position.set(-0.88, 0.01, 0);
    const butt = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.32, 0.15), darkMetal);
    butt.position.set(-1.26, -0.02, 0);
    makePart(4, [stock, butt]);
  } else if (t === "atgm") {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 2.2, 16), oliveMat);
    tube.rotation.z = Math.PI / 2;
    makePart(0, [tube]);

    const clu = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.32), darkMetal);
    clu.position.set(-0.35, 0.12, 0.36);
    makePart(1, [clu]);

    const seeker = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), opticMat);
    seeker.position.set(1.22, 0, 0);
    makePart(2, [seeker]);

    const warhead = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.72, 12), warheadMat);
    warhead.rotation.z = Math.PI / 2;
    warhead.position.set(0.75, 0, 0);
    makePart(3, [warhead]);

    const booster = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.9, 12), gunMetal);
    booster.rotation.z = Math.PI / 2;
    booster.position.set(-0.25, 0, 0);
    makePart(4, [booster]);
  } else if (t === "fpv") {
    // 4 hélices y motores
    const rotorMeshes: THREE.Mesh[] = [];
    for (const [mx, mz] of [
      [0.65, 0.65],
      [0.65, -0.65],
      [-0.65, 0.65],
      [-0.65, -0.65],
    ]) {
      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 12), gunMetal);
      motor.position.set(mx, 0.12, mz);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.025, 0.08), opticMat);
      blade.position.set(mx, 0.21, mz);
      blade.name = "fpvRotor";
      rotorMeshes.push(motor, blade);
    }
    makePart(0, rotorMeshes);

    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.52), darkMetal);
    const arm1 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.05, 0.1), darkMetal);
    arm1.rotation.y = Math.PI / 4;
    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.05, 0.1), darkMetal);
    arm2.rotation.y = -Math.PI / 4;
    makePart(1, [plate, arm1, arm2]);

    const cam = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), accentMat);
    cam.position.set(0.42, 0.08, 0);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 12), opticMat);
    lens.rotation.z = Math.PI / 2;
    lens.position.set(0.54, 0.08, 0);
    makePart(2, [cam, lens]);

    const batt = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.34), oliveMat);
    batt.position.set(-0.08, 0.18, 0);
    makePart(3, [batt]);

    const rpg = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.85, 12), warheadMat);
    rpg.rotation.z = -Math.PI / 2;
    rpg.position.set(0.2, -0.26, 0);
    makePart(4, [rpg]);
  } else if (t === "mlrs" || t === "sam") {
    const podColor = t === "sam" ? gunMetal : oliveMat;
    const tubes: THREE.Mesh[] = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const tub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.35, 10), podColor);
        tub.rotation.z = Math.PI / 2;
        tub.position.set(-0.25, 0.45 + r * 0.22, -0.22 + c * 0.22);
        tubes.push(tub);
      }
    }
    makePart(0, tubes);

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.34, 0.96), darkMetal);
    chassis.position.set(0, -0.18, 0);
    makePart(1, [chassis]);

    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.56, 0.92), podColor);
    cab.position.set(0.75, 0.24, 0);
    makePart(2, [cab]);

    const rocket = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 10), warheadMat);
    rocket.rotation.z = Math.PI / 2;
    rocket.position.set(0.45, 0.62, 0);
    makePart(3, [rocket]);

    const baseHyd = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.24, 0.72), accentMat);
    baseHyd.position.set(-0.35, 0.12, 0);
    makePart(4, [baseHyd]);
  } else if (t === "mbt") {
    const canon = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 1.85, 14), gunMetal);
    canon.rotation.z = Math.PI / 2;
    canon.position.set(1.05, 0.38, 0);
    makePart(0, [canon]);

    const turret = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.42, 0.92), oliveMat);
    turret.position.set(-0.08, 0.42, 0);
    makePart(1, [turret]);

    const era = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 1.05), accentMat);
    era.position.set(0.65, 0.1, 0);
    makePart(2, [era]);

    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 1.12), oliveMat);
    hull.position.set(0, -0.05, 0);
    makePart(3, [hull]);

    const tracks = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.34, 1.28), darkMetal);
    tracks.position.set(0, -0.32, 0);
    makePart(4, [tracks]);
  } else {
    // cruise missile
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 12), accentMat);
    nose.rotation.z = -Math.PI / 2;
    nose.position.set(1.35, 0, 0);
    makePart(0, [nose]);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.0, 14), gunMetal);
    body.rotation.z = Math.PI / 2;
    makePart(1, [body]);

    const wings = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.05, 2.1), opticMat);
    wings.position.set(0.05, 0.04, 0);
    makePart(2, [wings]);

    const war = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.72, 12), warheadMat);
    war.rotation.z = Math.PI / 2;
    war.position.set(0.55, 0, 0);
    makePart(3, [war]);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.58, 0.58), darkMetal);
    tail.position.set(-1.12, 0, 0);
    makePart(4, [tail]);
  }

  return { root, partes };
}

export function ArmaInteractiva3D({
  arma,
  piezaActivaId,
  despiece,
  rayosX,
  autoGiro,
  onSelectPieza,
  altura = 380,
}: {
  arma: Arma3D;
  piezaActivaId: string;
  despiece: number; // 0 .. 1
  rayosX: boolean;
  autoGiro: boolean;
  onSelectPieza?: (id: string) => void;
  altura?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const despieceRef = useRef(despiece);
  const rayosRef = useRef(rayosX);
  const giroRef = useRef(autoGiro);
  const piezaRef = useRef(piezaActivaId);
  const cbRef = useRef(onSelectPieza);

  useEffect(() => {
    despieceRef.current = despiece;
  }, [despiece]);

  useEffect(() => {
    rayosRef.current = rayosX;
  }, [rayosX]);

  useEffect(() => {
    giroRef.current = autoGiro;
  }, [autoGiro]);

  useEffect(() => {
    piezaRef.current = piezaActivaId;
  }, [piezaActivaId]);

  useEffect(() => {
    cbRef.current = onSelectPieza;
  }, [onSelectPieza]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const width = el.clientWidth || 560;
    const height = altura;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060810);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(2.3, 1.35, 3.3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.8;
    controls.maxDistance = 7.5;
    controls.target.set(0, 0.1, 0);

    scene.add(new THREE.AmbientLight(0xd6e6ff, 0.95));
    const key = new THREE.DirectionalLight(0xfff1d6, 1.35);
    key.position.set(4, 5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(arma.esVanguard ? 0xffc94d : 0x38bdf8, 0.85);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    // Rejilla CAD de fondo bajo el arma
    const grid = new THREE.GridHelper(6, 14, arma.esVanguard ? 0xffc94d : 0x38bdf8, 0x1e293b);
    grid.position.y = -1.15;
    scene.add(grid);

    const { root, partes } = construirModeloArma(arma);
    scene.add(root);

    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    let downPt: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      downPt = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      if (!downPt || !cbRef.current) return;
      const dist = Math.hypot(e.clientX - downPt.x, e.clientY - downPt.y);
      downPt = null;
      if (dist > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      ptr.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ptr.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      ray.setFromCamera(ptr, camera);
      const hits = ray.intersectObject(root, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj) {
          const found = partes.find((p) => p.grp === obj);
          if (found) {
            cbRef.current(found.id);
            return;
          }
          obj = obj.parent;
        }
      }
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    let raf = 0;
    let curExplode = 0;
    const selCol = new THREE.Color(arma.esVanguard ? 0xffc94d : 0x38bdf8);

    const animate = (t: number) => {
      raf = requestAnimationFrame(animate);
      curExplode += (despieceRef.current - curExplode) * 0.12;

      if (giroRef.current) {
        root.rotation.y += 0.007;
      }

      for (const p of partes) {
        p.grp.position.copy(p.offset).multiplyScalar(curExplode * 0.8);
        const esSel = p.id === piezaRef.current;
        for (const m of p.mats) {
          m.wireframe = rayosRef.current;
          m.emissive.copy(esSel ? selCol : new THREE.Color(0x000000));
          m.emissiveIntensity = esSel ? 0.42 + Math.sin(t * 0.006) * 0.14 : 0;
        }
      }

      root.traverse((obj) => {
        if (obj.name === "fpvRotor") obj.rotation.y += 0.3;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);

    const ro = new ResizeObserver(() => {
      if (!el) return;
      const w = el.clientWidth || width;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      controls.dispose();
      renderer.dispose();
    };
  }, [arma, altura]);

  return (
    <div
      ref={hostRef}
      className="w-full rounded-lg overflow-hidden border border-amber-hud/30 bg-black cursor-grab active:cursor-grabbing"
      style={{ height: altura }}
      aria-label={`Modelo 3D interactivo de ${arma.nombre}`}
    />
  );
}
