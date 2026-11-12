"use client";

// ============================================================================
// ARMERÍA TÁCTICA 3D REAL CON DESPIECE DE SUBMALLAS .GLB, ANIMACIONES Y RAYOS-X
// Cada una de las 10 armas de ARMAS_3D carga un modelo .glb real de alta
// definición, clasifica automáticamente sus submallas en las 5 piezas CAD
// (cañón/rotor, cajón/torreta, óptica/blindaje, cargador/barcaza, culata/orugas),
// permite despiece suave 0..100%, Rayos-X wireframe PBR y accionar mecanismos.
// ============================================================================

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Arma3D, TipoArma3D } from "@/lib/teatro-total-data";
import {
  aplicarEntornoPBR,
  crearPipelinePBR,
  loadGLBCached,
  normalizarModeloGLB,
} from "./glb-engine";

interface ArmaModelSpec {
  url: string;
  label: string;
  rotateY: number;
  rotateZ?: number;
  vanguardFinish?: boolean;
}

const ARMA_GLB_MAP: Record<TipoArma3D, ArmaModelSpec> = {
  vanguard_rifle: {
    url: "/assets/models/ak47.glb",
    label: "VANGUARD X-1 · Plataforma Táctica PBR (.GLB)",
    rotateY: Math.PI / 2,
    vanguardFinish: true,
  },
  rifle_nato: {
    url: "/assets/models/m590a1.glb",
    label: "Mossberg / Plataforma Riel Picatinny (.GLB)",
    rotateY: Math.PI / 2,
  },
  rifle_ak: {
    url: "/assets/models/ak47.glb",
    label: "AK-47 / AKM Kalashnikov Real · 79 Piezas (.GLB)",
    rotateY: Math.PI / 2,
  },
  sniper: {
    url: "/assets/models/awp-sniper.glb",
    label: "Rifle Francotirador AWP (.GLB)",
    rotateY: Math.PI / 2,
  },
  atgm: {
    url: "/assets/models/atlas-v.glb",
    label: "Sistema Balístico / Misil Multi-Etapa (.GLB)",
    rotateY: 0,
    rotateZ: -Math.PI / 2.2,
  },
  fpv: {
    url: "/assets/models/drone.glb",
    label: "Cuadricóptero Táctico S9 FPV (.GLB)",
    rotateY: Math.PI / 4,
  },
  mlrs: {
    url: "/assets/models/scout-drone.glb",
    label: "Plataforma Móvil Táctica 4×4 · 54 Piezas (.GLB)",
    rotateY: Math.PI / 2,
  },
  mbt: {
    url: "/assets/models/tank.glb",
    label: "Carro de Combate MBT 120mm · 41 Piezas (.GLB)",
    rotateY: Math.PI / 3,
  },
  sam: {
    url: "/assets/models/breach-spider.glb",
    label: "Plataforma Robótica Defensiva · 189 Piezas (.GLB)",
    rotateY: Math.PI / 3,
  },
  cruise: {
    url: "/assets/models/f15.glb",
    label: "Vector Aéreo / F-15 Eagle (.GLB)",
    rotateY: Math.PI / 3,
  },
};

function clasificarIndicePieza(meshName: string, tipo: TipoArma3D, idxFallback: number): number {
  const n = meshName.toLowerCase();

  if (tipo === "mbt") {
    if (/barrel|cannon|muzzle|gun/.test(n)) return 0; // cañón
    if (/turret|gear_24|gear_turret|glass_turret/.test(n)) return 1; // torreta
    if (/applique/.test(n)) return 2; // bloques ERA
    if (/hull|skirt|gear_hull|glass_hull/.test(n)) return 3; // barcaza
    if (/track|wheel|hub/.test(n)) return 4; // orugas
  }

  if (tipo === "vanguard_rifle" || tipo === "rifle_ak" || tipo === "rifle_nato") {
    if (/barrel|handguard|forend|muzzle|gas_|front_sight|cleaning|bayonet|action_bars/.test(n)) return 0;
    if (/receiver|bolt|trigger|selector|pistol_grip|trunnion|rivet|chamber|elevator|safety/.test(n)) return 1;
    if (/sight|rail|dust_cover|recoil_spring/.test(n)) return 2;
    if (/magazine|shell|top_round/.test(n)) return 3;
    if (/stock|buttplate|recoil_pad|sling/.test(n)) return 4;
  }

  if (tipo === "atgm") {
    if (/fairing/.test(n)) return 0;
    if (/adapter/.test(n)) return 1;
    if (/centaur|_nd_/.test(n)) return 2;
    if (/cube/.test(n)) return 3;
    return 4;
  }

  if (tipo === "mlrs") {
    if (/wheel|tyre|rim|hub|disc|arm_/.test(n)) return 1;
    if (/nose|lens|ir|shutter/.test(n)) return 2;
    if (/antenna|thumper/.test(n)) return 4;
    if (/deck|skirt|screw|led/.test(n)) return 3;
    return 0;
  }

  if (tipo === "sam") {
    if (/turret|barrel|laser|fx_/.test(n)) return 0;
    if (/leg_/.test(n)) return 1;
    if (/head|eye|lens/.test(n)) return 2;
    if (/abdomen|charge|thorax|body|hip/.test(n)) return 3;
    return 4;
  }

  return idxFallback % 5;
}

interface SubMallaPart {
  pieceIdx: number;
  pieceId: string;
  mesh: THREE.Mesh;
  basePos: THREE.Vector3;
  explodeVec: THREE.Vector3;
  origMat: THREE.Material | THREE.Material[];
  xrayMat: THREE.MeshBasicMaterial;
}

export function ArmaInteractiva3D({
  arma,
  piezaActivaId,
  despiece,
  rayosX,
  autoGiro,
  onSelectPieza,
  altura = 390,
}: {
  arma: Arma3D;
  piezaActivaId: string;
  despiece: number;
  rayosX: boolean;
  autoGiro: boolean;
  onSelectPieza?: (id: string) => void;
  altura?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [tieneAnim, setTieneAnim] = useState(false);
  const [animNombre, setAnimNombre] = useState("");
  const triggerAnimRef = useRef<(() => void) | null>(null);

  const piezaRef = useRef(piezaActivaId);
  const despieceRef = useRef(despiece);
  const rayosRef = useRef(rayosX);
  const giroRef = useRef(autoGiro);
  const cbRef = useRef(onSelectPieza);

  useEffect(() => {
    piezaRef.current = piezaActivaId;
  }, [piezaActivaId]);

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
    cbRef.current = onSelectPieza;
  }, [onSelectPieza]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const width = el.clientWidth || 560;
    const height = altura;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a14);
    scene.fog = new THREE.FogExp2(0x060a14, 0.035);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.05, 80);
    camera.position.set(0.4, 1.35, 3.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    const disposeEnv = aplicarEntornoPBR(renderer, scene, "studio");
    const pipeline = crearPipelinePBR(renderer, scene, camera, width, height, {
      strength: 0.22,
      radius: 0.22,
      threshold: 1.15,
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.55, 0);
    controls.minDistance = 1.6;
    controls.maxDistance = 7.8;

    scene.add(new THREE.HemisphereLight(0xdbeafe, 0x0b0f18, 0.75));
    const key = new THREE.DirectionalLight(0xfff4e0, 2.3);
    key.position.set(4, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    const rim = new THREE.DirectionalLight(arma.esVanguard ? 0xffc94d : 0x38bdf8, 1.3);
    rim.position.set(-4, -2, -4);
    scene.add(rim);

    // Mesa armería PBR
    const mesa = new THREE.Mesh(
      new THREE.CylinderGeometry(2.15, 2.35, 0.14, 48),
      new THREE.MeshStandardMaterial({ color: 0x0b111d, roughness: 0.35, metalness: 0.75 })
    );
    mesa.position.y = -0.58;
    mesa.receiveShadow = true;
    scene.add(mesa);

    const grid = new THREE.GridHelper(3.8, 14, arma.esVanguard ? 0xffc94d : 0x38bdf8, 0x1e293b);
    grid.position.y = -0.5;
    scene.add(grid);

    const holder = new THREE.Group();
    holder.position.y = 0.5;
    scene.add(holder);

    const spec = ARMA_GLB_MAP[arma.modelo3D];
    const parts: SubMallaPart[] = [];
    let mixer: THREE.AnimationMixer | null = null;
    let alive = true;
    setTieneAnim(false);
    setAnimNombre("");
    triggerAnimRef.current = null;

    loadGLBCached(spec.url)
      .then(({ scene: glbRoot, animations }) => {
        if (!alive) return;

        if (spec.rotateZ) glbRoot.rotation.z += spec.rotateZ;
        const norm = normalizarModeloGLB(glbRoot, {
          targetSize: 2.55,
          fitBy: "max",
          baseY: -0.55,
          rotateY: spec.rotateY,
        });

        let fallbackIdx = 0;
        const vanguardDark = new THREE.Color(0x1f2532);
        const vanguardGold = new THREE.Color(0xffc94d);
        const vanguardCyan = new THREE.Color(0x38bdf8);

        norm.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;
          const mesh = obj;
          const idx = clasificarIndicePieza(mesh.name, arma.modelo3D, fallbackIdx++);
          const pDef = arma.piezas[idx] ?? arma.piezas[0];
          const explodeVec = pDef
            ? new THREE.Vector3(pDef.offset[0] * 0.45, pDef.offset[1] * 0.45, pDef.offset[2] * 0.45)
            : new THREE.Vector3();

          // Acabado especial VANGUARD Grafito-Oro PBR para el modelo X-1
          if (spec.vanguardFinish) {
            const ms = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            const custom = ms.map((m) => {
              if (!m) return m;
              const c = m.clone();
              if (c instanceof THREE.MeshStandardMaterial) {
                if (idx === 2) {
                  c.color.copy(vanguardCyan);
                  c.emissive.copy(vanguardCyan);
                  c.emissiveIntensity = 1.1;
                } else if (idx === 3 || /trigger|selector|bolt/.test(mesh.name.toLowerCase())) {
                  c.color.copy(vanguardGold);
                  c.metalness = 0.8;
                  c.roughness = 0.25;
                } else {
                  c.color.lerp(vanguardDark, 0.72);
                  c.metalness = 0.65;
                  c.roughness = 0.32;
                }
              }
              return c;
            });
            mesh.material = Array.isArray(mesh.material) ? custom : custom[0];
          }

          // Clonamos materiales propios por submalla para iluminar sin afectar otras
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => m.clone());
          } else if (mesh.material) {
            mesh.material = mesh.material.clone();
          }

          const xrayMat = new THREE.MeshBasicMaterial({
            color: pDef?.id === piezaRef.current ? 0xffc94d : 0x38bdf8,
            wireframe: true,
            transparent: true,
            opacity: 0.55,
          });

          parts.push({
            pieceIdx: idx,
            pieceId: pDef?.id ?? `part-${idx}`,
            mesh,
            basePos: mesh.position.clone(),
            explodeVec,
            origMat: mesh.material,
            xrayMat,
          });
        });

        holder.add(norm);

        if (animations.length > 0) {
          mixer = new THREE.AnimationMixer(glbRoot);
          const clip = animations[0];
          setTieneAnim(true);
          setAnimNombre(clip.name || "Ciclo");

          if (arma.modelo3D === "fpv") {
            const act = mixer.clipAction(clip);
            act.play();
          }

          triggerAnimRef.current = () => {
            if (!mixer || animations.length === 0) return;
            const c = animations[0];
            const act = mixer.clipAction(c);
            act.reset();
            act.setLoop(THREE.LoopOnce, 1);
            act.clampWhenFinished = false;
            act.play();
          };
        }
      })
      .catch(() => undefined);

    // Raycast click directo sobre cualquier pieza del .glb
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
      const hits = ray.intersectObject(holder, true);
      if (hits.length > 0) {
        const hitMesh = hits[0].object;
        const found = parts.find((p) => p.mesh === hitMesh);
        if (found) cbRef.current(found.pieceId);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    let suavizadoDespiece = despieceRef.current;
    let lastNow = performance.now();
    let raf = 0;

    const animate = (now: number) => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastNow) * 0.001);
      lastNow = now;

      if (giroRef.current) {
        holder.rotation.y += dt * 0.38;
      }

      mixer?.update(dt);

      suavizadoDespiece += (despieceRef.current - suavizadoDespiece) * 0.14;
      const isXray = rayosRef.current;
      const activeId = piezaRef.current;

      for (const p of parts) {
        p.mesh.position.copy(p.basePos).addScaledVector(p.explodeVec, suavizadoDespiece);
        const esAct = p.pieceId === activeId;

        if (isXray) {
          p.mesh.material = p.xrayMat;
          p.xrayMat.color.setHex(esAct ? 0xffc94d : 0x38bdf8);
          p.xrayMat.opacity = esAct ? 0.95 : 0.35;
        } else {
          p.mesh.material = p.origMat;
          const mats = Array.isArray(p.origMat) ? p.origMat : [p.origMat];
          for (const m of mats) {
            if (m instanceof THREE.MeshStandardMaterial) {
              if (esAct) {
                m.emissive.setHex(0xffc94d);
                m.emissiveIntensity = 0.42 + Math.sin(now * 0.007) * 0.18;
              } else if (!(spec.vanguardFinish && p.pieceIdx === 2)) {
                m.emissive.setHex(0x000000);
                m.emissiveIntensity = 0;
              }
            }
          }
        }
      }

      controls.update();
      pipeline.render();
    };
    raf = requestAnimationFrame(animate);

    const ro = new ResizeObserver(() => {
      if (!el) return;
      const w = el.clientWidth || width;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      pipeline.resize(w, height);
    });
    ro.observe(el);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      mixer?.stopAllAction();
      disposeEnv();
      pipeline.dispose();
      controls.dispose();
      renderer.dispose();
    };
  }, [arma, altura]);

  const specInfo = ARMA_GLB_MAP[arma.modelo3D];

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden border border-amber-hud/35 bg-black"
      style={{ height: altura }}
      aria-label={`Modelo 3D interactivo de ${arma.nombre}`}
    >
      <div ref={hostRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {tieneAnim && (
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-auto">
          <button
            type="button"
            onClick={() => triggerAnimRef.current?.()}
            className="px-2.5 py-1 rounded bg-[#FFC94D] text-black font-mono text-[10px] font-black shadow hover:bg-[#ffd86b]"
          >
            ACCIONAR MECANISMO ({animNombre.toUpperCase()})
          </button>
        </div>
      )}

      <div className="absolute bottom-2 left-2.5 z-10 pointer-events-none px-2 py-0.5 rounded bg-black/75 border border-white/10 font-mono text-[9.5px] text-slate-300">
        {specInfo.label} · HDRI + Rayos-X + Despiece Real
      </div>
    </div>
  );
}
