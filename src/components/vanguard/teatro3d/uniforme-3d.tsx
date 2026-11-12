"use client";

// ============================================================================
// VISOR 3D REAL DE UNIFORMES Y CASCO BALÍSTICO (GLB + HDRI PBR + BLOOM)
// Alterna entre:
//   1) Operador humano / exoesqueleto animado (.glb: soldier.glb / xbot.glb)
//      con texturas reales de camuflaje, selector de postura y anillos por capa.
//   2) Casco Táctico Balístico PBR (damaged-helmet.glb de Khronos) bajo HDRI.
// Clic 3D en cualquier zona del cuerpo selecciona la capa NIJ correspondiente.
// ============================================================================

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { CapaUniforme, Uniforme3D } from "@/lib/teatro-total-data";
import { crearTexturaCamo } from "./fabricas-3d";
import {
  aplicarEntornoPBR,
  crearPipelinePBR,
  loadGLBCached,
  normalizarModeloGLB,
} from "./glb-engine";

type ModoVisorUniforme = "operador" | "casco-pbr";
type PosturaOp = "idle" | "walk" | "run";

const ZONAS_ANATOMICAS: {
  id: CapaUniforme["id"];
  y: number;
  rInner: number;
  rOuter: number;
  explodeVec: [number, number, number];
}[] = [
  { id: "casco", y: 1.72, rInner: 0.22, rOuter: 0.28, explodeVec: [0, 0.42, 0] },
  { id: "chaleco", y: 1.32, rInner: 0.34, rOuter: 0.41, explodeVec: [0, 0.06, 0.55] },
  { id: "uniforme", y: 1.05, rInner: 0.36, rOuter: 0.43, explodeVec: [0, 0, 0] },
  { id: "mochila", y: 1.36, rInner: 0.3, rOuter: 0.36, explodeVec: [0, 0.14, -0.58] },
  { id: "cinturon", y: 0.96, rInner: 0.32, rOuter: 0.38, explodeVec: [0.55, 0, 0] },
  { id: "botas", y: 0.22, rInner: 0.28, rOuter: 0.35, explodeVec: [0, -0.1, 0.35] },
];

export function UniformeInteractivo3D({
  uniforme,
  capaActiva,
  despiece,
  autoGiro,
  onSelectCapa,
  altura = 390,
}: {
  uniforme: Uniforme3D;
  capaActiva: CapaUniforme["id"];
  despiece: boolean;
  autoGiro: boolean;
  onSelectCapa?: (id: CapaUniforme["id"]) => void;
  altura?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [modo, setModo] = useState<ModoVisorUniforme>("operador");
  const [postura, setPostura] = useState<PosturaOp>("idle");

  const despieceRef = useRef(despiece);
  const giroRef = useRef(autoGiro);
  const capaRef = useRef(capaActiva);
  const posturaRef = useRef(postura);
  const cbRef = useRef(onSelectCapa);

  useEffect(() => {
    despieceRef.current = despiece;
  }, [despiece]);

  useEffect(() => {
    giroRef.current = autoGiro;
  }, [autoGiro]);

  useEffect(() => {
    capaRef.current = capaActiva;
  }, [capaActiva]);

  useEffect(() => {
    posturaRef.current = postura;
  }, [postura]);

  useEffect(() => {
    cbRef.current = onSelectCapa;
  }, [onSelectCapa]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const width = el.clientWidth || 520;
    const height = altura;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a12);
    scene.fog = new THREE.FogExp2(0x070a12, 0.04);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 60);
    camera.position.set(1.5, modo === "casco-pbr" ? 1.1 : 1.55, modo === "casco-pbr" ? 2.65 : 3.45);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    const disposeEnv = aplicarEntornoPBR(renderer, scene, "studio");
    const pipeline = crearPipelinePBR(renderer, scene, camera, width, height, {
      strength: 0.16,
      radius: 0.18,
      threshold: 1.24,
    });
    renderer.toneMappingExposure = 0.88;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, modo === "casco-pbr" ? 0.95 : 1.0, 0);
    controls.minDistance = 1.6;
    controls.maxDistance = 6.2;

    const acentoColor = new THREE.Color(uniforme.colores.acento);

    scene.add(new THREE.HemisphereLight(0xdbeafe, 0x0b0f18, 0.75));
    const keyLight = new THREE.DirectionalLight(0xfff5e4, 2.2);
    keyLight.position.set(3.5, 5.5, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(acentoColor, 1.4);
    rimLight.position.set(-4, 2.5, -3);
    scene.add(rimLight);

    // Pedestal metálico PBR + sombra en piso
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.08, 0.1, 40),
      new THREE.MeshStandardMaterial({ color: 0x101725, roughness: 0.28, metalness: 0.82 })
    );
    ped.position.y = 0.05;
    ped.receiveShadow = true;
    scene.add(ped);

    const ringPed = new THREE.Mesh(
      new THREE.RingGeometry(0.88, 0.96, 48),
      new THREE.MeshBasicMaterial({
        color: acentoColor,
        side: THREE.DoubleSide,
      })
    );
    ringPed.rotation.x = -Math.PI / 2;
    ringPed.position.y = 0.105;
    scene.add(ringPed);

    const stage = new THREE.Group();
    scene.add(stage);

    const camoTex = crearTexturaCamo(
      uniforme.estiloCamo,
      uniforme.colores.primario,
      uniforme.colores.secundario,
      uniforme.colores.acento
    );

    // Zonas anatómicas interactivas (anillos + hitbox + indicadores de despiece)
    const zonaRings = new Map<
      CapaUniforme["id"],
      { ring: THREE.Mesh; baseY: number; marker: THREE.Mesh; explode: THREE.Vector3 }
    >();
    const pickables: { obj: THREE.Object3D; id: CapaUniforme["id"] }[] = [];

    if (modo === "operador") {
      for (const z of ZONAS_ANATOMICAS) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(z.rOuter, 0.014, 10, 36),
          new THREE.MeshBasicMaterial({
            color: acentoColor,
            transparent: true,
            opacity: 0.35,
          })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = z.y;
        stage.add(ring);

        const marker = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.065, 0),
          new THREE.MeshBasicMaterial({ color: acentoColor })
        );
        marker.position.set(z.rOuter + 0.08, z.y, 0);
        stage.add(marker);

        const hitbox = new THREE.Mesh(
          new THREE.CylinderGeometry(z.rOuter, z.rOuter, 0.24, 14),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        hitbox.position.y = z.y;
        stage.add(hitbox);

        pickables.push({ obj: hitbox, id: z.id }, { obj: marker, id: z.id });
        zonaRings.set(z.id, {
          ring,
          marker,
          baseY: z.y,
          explode: new THREE.Vector3(...z.explodeVec),
        });
      }
    }

    // Módulos blindados satélite que orbitan en modo despiece para mostrar capas
    const placasDespiece = new THREE.Group();
    stage.add(placasDespiece);
    const escudoPlaca = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.44, 0.05),
      new THREE.MeshStandardMaterial({
        color: uniforme.colores.chaleco,
        map: camoTex,
        roughness: 0.45,
        metalness: 0.35,
      })
    );
    escudoPlaca.position.set(0, 1.3, 0.38);
    escudoPlaca.visible = false;
    placasDespiece.add(escudoPlaca);

    const mochilaPlaca = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.42, 0.16),
      new THREE.MeshStandardMaterial({
        color: uniforme.colores.primario,
        map: camoTex,
        roughness: 0.55,
      })
    );
    mochilaPlaca.position.set(0, 1.34, -0.34);
    mochilaPlaca.visible = false;
    placasDespiece.add(mochilaPlaca);

    let alive = true;
    let mixer: THREE.AnimationMixer | null = null;
    const actions = new Map<PosturaOp, THREE.AnimationAction>();
    let activeAction: THREE.AnimationAction | null = null;
    let currentPostura: PosturaOp = posturaRef.current;

    const modelUrl =
      modo === "casco-pbr"
        ? "/assets/models/damaged-helmet.glb"
        : uniforme.esVanguard || uniforme.id === "ew-nrbq"
        ? "/assets/models/xbot.glb"
        : "/assets/models/soldier.glb";

    loadGLBCached(modelUrl)
      .then(({ scene: glbRoot, animations }) => {
        if (!alive) return;

        // En modo casco PBR flotante, levantamos un poco sobre el pedestal
        const norm = normalizarModeloGLB(glbRoot, {
          targetSize: modo === "casco-pbr" ? 1.15 : 1.82,
          fitBy: modo === "casco-pbr" ? "max" : "height",
          baseY: modo === "casco-pbr" ? 0.55 : 0.1,
          rotateY: modo === "casco-pbr" ? 0 : 0,
        });

        // Aplicar camuflaje real y color táctico sobre los materiales del modelo real
        const priCol = new THREE.Color(uniforme.colores.primario);
        const visCol = new THREE.Color(uniforme.colores.visor);
        const armorCol = new THREE.Color(uniforme.colores.chaleco);

        norm.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            const mesh = obj;
            const nLow = mesh.name.toLowerCase();
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            const nextMats = mats.map((m) => {
              if (!m) return m;
              const c = m.clone();
              if (c instanceof THREE.MeshStandardMaterial) {
                if (modo === "casco-pbr") {
                  // Mantener todas las texturas PBR de Khronos; tintar suave el tono de doctrina
                  c.color.lerp(priCol, 0.25);
                  c.emissive.lerp(visCol, 0.28);
                  c.emissiveIntensity = 1.05;
                } else if (nLow.includes("visor") || nLow.includes("eye")) {
                  c.color.copy(visCol);
                  c.emissive.copy(visCol);
                  c.emissiveIntensity = 1.25;
                  c.roughness = 0.2;
                  c.metalness = 0.7;
                } else if (nLow.includes("joint")) {
                  // Exoesqueleto/articulaciones en grafito-titanio oscuro de alto contraste
                  c.color.setHex(0x181e2c).lerp(priCol, 0.22);
                  c.roughness = 0.36;
                  c.metalness = 0.78;
                } else if (modelUrl.includes("xbot")) {
                  c.map = camoTex;
                  c.color.lerp(armorCol, 0.35);
                  c.roughness = 0.52;
                  c.metalness = 0.32;
                } else {
                  // soldier.glb ya tiene mapa PBR realista; mezclamos suavemente el camuflaje
                  c.color.lerp(priCol, 0.38);
                }
                c.needsUpdate = true;
              }
              return c;
            });
            mesh.material = Array.isArray(mesh.material) ? nextMats : nextMats[0];
          }
        });

        stage.add(norm);

        // Configurar animaciones reales del esqueleto
        if (animations.length > 0 && modo === "operador") {
          mixer = new THREE.AnimationMixer(glbRoot);
          const findClip = (re: RegExp) => animations.find((a) => re.test(a.name));
          const idleClip = findClip(/idle|tpose/i) ?? animations[0];
          const walkClip = findClip(/walk|sneak/i) ?? idleClip;
          const runClip = findClip(/run/i) ?? walkClip;

          if (idleClip) actions.set("idle", mixer.clipAction(idleClip));
          if (walkClip) actions.set("walk", mixer.clipAction(walkClip));
          if (runClip) actions.set("run", mixer.clipAction(runClip));

          const startAct = actions.get(posturaRef.current) ?? actions.get("idle");
          if (startAct) {
            startAct.play();
            activeAction = startAct;
          }
        }
      })
      .catch(() => undefined);

    // Raycast clic para elegir capa
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

      const hits = ray.intersectObjects(
        pickables.map((p) => p.obj),
        true
      );
      if (hits.length > 0) {
        const match = pickables.find((p) => p.obj === hits[0].object);
        if (match) {
          cbRef.current(match.id);
          return;
        }
      }

      // Si toca el cuerpo del modelo, mapeamos altura Y a la capa más cercana
      const bodyHits = ray.intersectObject(stage, true);
      if (bodyHits.length > 0) {
        const hy = bodyHits[0].point.y;
        let bestId: CapaUniforme["id"] = "uniforme";
        let bestDist = Infinity;
        for (const z of ZONAS_ANATOMICAS) {
          const d = Math.abs(hy - z.y);
          if (d < bestDist) {
            bestDist = d;
            bestId = z.id;
          }
        }
        cbRef.current(bestId);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    let explProgress = despieceRef.current ? 1 : 0;
    let lastNow = performance.now();
    let raf = 0;

    const animate = (now: number) => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastNow) * 0.001);
      lastNow = now;

      if (giroRef.current) {
        stage.rotation.y += dt * 0.45;
      }

      // Cambio suave de animación Idle / Walk / Run
      if (mixer) {
        if (posturaRef.current !== currentPostura) {
          const next = actions.get(posturaRef.current);
          if (next && next !== activeAction) {
            next.reset().fadeIn(0.25).play();
            activeAction?.fadeOut(0.25);
            activeAction = next;
          }
          currentPostura = posturaRef.current;
        }
        mixer.update(dt);
      }

      const targetExpl = despieceRef.current ? 1 : 0;
      explProgress += (targetExpl - explProgress) * 0.1;

      escudoPlaca.visible = explProgress > 0.08 && modo === "operador";
      mochilaPlaca.visible = explProgress > 0.08 && modo === "operador";
      escudoPlaca.position.z = 0.25 + explProgress * 0.42;
      mochilaPlaca.position.z = -0.22 - explProgress * 0.42;

      for (const [id, item] of zonaRings.entries()) {
        const esAct = id === capaRef.current;
        const rMat = item.ring.material as THREE.MeshBasicMaterial;
        const mMat = item.marker.material as THREE.MeshBasicMaterial;
        rMat.color.setHex(esAct ? 0xffc94d : acentoColor.getHex());
        rMat.opacity = esAct ? 0.92 : 0.22;
        item.ring.scale.setScalar(esAct ? 1.08 + Math.sin(now * 0.006) * 0.04 : 0.94);

        mMat.color.setHex(esAct ? 0xffc94d : acentoColor.getHex());
        item.marker.rotation.y += dt * (esAct ? 2.8 : 0.9);
        item.marker.position.y = item.baseY + explProgress * item.explode.y * 0.5;
        item.marker.position.z = explProgress * item.explode.z * 0.6;
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
      camoTex.dispose();
      renderer.dispose();
    };
  }, [uniforme, modo, altura]);

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden border border-amber-hud/35 bg-black"
      style={{ height: altura }}
      aria-label={`Modelo 3D interactivo de uniforme ${uniforme.nombre}`}
    >
      <div ref={hostRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1 pointer-events-auto">
        <button
          type="button"
          onClick={() => setModo("operador")}
          className={`px-2 py-1 rounded font-mono text-[10px] font-bold border ${
            modo === "operador"
              ? "bg-[#FFC94D] text-black border-[#FFC94D]"
              : "bg-black/80 text-slate-200 border-white/20"
          }`}
        >
          OPERADOR .GLB
        </button>
        <button
          type="button"
          onClick={() => setModo("casco-pbr")}
          className={`px-2 py-1 rounded font-mono text-[10px] font-bold border ${
            modo === "casco-pbr"
              ? "bg-[#38BDF8] text-black border-[#38BDF8]"
              : "bg-black/80 text-slate-200 border-white/20"
          }`}
        >
          CASCO PBR (KHRONOS)
        </button>
        {modo === "operador" && (
          <>
            {(["idle", "walk", "run"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPostura(p)}
                className={`px-2 py-1 rounded font-mono text-[10px] font-bold uppercase border ${
                  postura === p
                    ? "bg-white/20 text-[#FFC94D] border-[#FFC94D]/60"
                    : "bg-black/75 text-slate-300 border-white/15"
                }`}
              >
                {p === "idle" ? "GUARDIA" : p === "walk" ? "MARCHA" : "ASALTO"}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="absolute bottom-2 left-2.5 z-10 pointer-events-none px-2 py-0.5 rounded bg-black/75 border border-white/10 font-mono text-[9.5px] text-slate-300">
        {modo === "casco-pbr"
          ? "Khronos DamagedHelmet.glb · HDRI IBL + Bloom PBR"
          : `${uniforme.esVanguard || uniforme.id === "ew-nrbq" ? "Xbot" : "Soldier (vanguard_Mesh)"} .GLB Animado · Clic en zona corporal`}
      </div>
    </div>
  );
}
