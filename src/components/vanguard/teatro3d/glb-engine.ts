"use client";

// ============================================================================
// MOTOR COMPARTIDO PBR + CARGA DE MODELOS .GLB REALES (Three.js 0.185.1)
// - Caché global de GLTFLoader y HDRI (descarga única por sesión).
// - Clonación con SkeletonUtils para preservar animaciones esqueléticas.
// - Normalización geométrica exacta (centrado X/Z y base apoyada en Y=0).
// - Pipeline HDR cinematográfico: ACESFilmic + PCFSoftShadow + HDRI/PMREM
//   + EffectComposer (RenderPass + UnrealBloomPass + OutputPass).
// ============================================================================

import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { TipoUnidad3D } from "@/lib/teatro-total-data";

export interface ModeloCargado {
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
}

const gltfCache = new Map<string, Promise<GLTF>>();
const hdrCache = new Map<string, Promise<THREE.DataTexture>>();
let gltfLoaderSingleton: GLTFLoader | null = null;
let rgbeLoaderSingleton: RGBELoader | null = null;

function getGltfLoader(): GLTFLoader {
  if (!gltfLoaderSingleton) gltfLoaderSingleton = new GLTFLoader();
  return gltfLoaderSingleton;
}

function getRgbeLoader(): RGBELoader {
  if (!rgbeLoaderSingleton) rgbeLoaderSingleton = new RGBELoader();
  return rgbeLoaderSingleton;
}

export function loadGLBCached(url: string): Promise<ModeloCargado> {
  let promise = gltfCache.get(url);
  if (!promise) {
    promise = getGltfLoader().loadAsync(url);
    gltfCache.set(url, promise);
  }
  return promise.then((gltf) => ({
    scene: cloneSkinned(gltf.scene),
    animations: gltf.animations ?? [],
  }));
}

export function precargarModelosPrincipales(): void {
  const urls = [
    "/assets/models/soldier.glb",
    "/assets/models/tank.glb",
    "/assets/models/drone.glb",
  ];
  for (const u of urls) {
    loadGLBCached(u).catch(() => undefined);
  }
}

export function loadHDRICached(url: string): Promise<THREE.DataTexture> {
  let promise = hdrCache.get(url);
  if (!promise) {
    promise = getRgbeLoader().loadAsync(url);
    hdrCache.set(url, promise);
  }
  return promise;
}

export function aplicarEntornoPBR(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  tipo: "studio" | "outdoor" = "studio"
): () => void {
  let vivo = true;
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  // Entorno inmediato cero-espera mientras carga el HDRI local
  const fallbackRoom = new RoomEnvironment();
  let envRT: THREE.WebGLRenderTarget | null = pmrem.fromScene(fallbackRoom, 0.04);
  fallbackRoom.dispose();
  scene.environment = envRT.texture;
  scene.environmentIntensity = tipo === "studio" ? 0.95 : 0.72;

  const hdrUrl = tipo === "studio" ? "/assets/env/studio.hdr" : "/assets/env/outdoor.hdr";
  loadHDRICached(hdrUrl)
    .then((tex) => {
      if (!vivo) return;
      tex.mapping = THREE.EquirectangularReflectionMapping;
      const nextRT = pmrem.fromEquirectangular(tex);
      if (envRT) envRT.dispose();
      envRT = nextRT;
      scene.environment = envRT.texture;
      scene.environmentIntensity = tipo === "studio" ? 1.15 : 0.85;
    })
    .catch(() => undefined);

  return () => {
    vivo = false;
    if (envRT) {
      envRT.dispose();
      envRT = null;
    }
    pmrem.dispose();
  };
}

export function esDispositivoMovilOLigero(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const ancho = window.innerWidth || 1024;
    const tactil = (navigator.maxTouchPoints ?? 0) > 0 || window.matchMedia?.("(pointer: coarse)")?.matches;
    const nucleos = navigator.hardwareConcurrency ?? 8;
    const ahorro = (navigator as unknown as { connection?: { saveData?: boolean } })?.connection?.saveData;
    return ancho < 820 || (Boolean(tactil) && ancho < 1024) || nucleos <= 4 || Boolean(ahorro);
  } catch {
    return false;
  }
}

export interface PipelinePBR {
  composer: EffectComposer | null;
  bloomPass: UnrealBloomPass | null;
  eco: boolean;
  render: () => void;
  resize: (w: number, h: number) => void;
  dispose: () => void;
}

export function crearPipelinePBR(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  width: number,
  height: number,
  bloom: { strength?: number; radius?: number; threshold?: number; ecoMode?: boolean } = {}
): PipelinePBR {
  const eco = bloom.ecoMode ?? esDispositivoMovilOLigero();
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !eco;
  if (!eco) {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  if (eco) {
    return {
      composer: null,
      bloomPass: null,
      eco: true,
      render: () => {
        renderer.render(scene, camera);
      },
      resize: (w: number, h: number) => {
        renderer.setSize(w, h);
      },
      dispose: () => {
        // Sin EffectComposer que liberar en modo eco
      },
    };
  }

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    bloom.strength ?? 0.28,
    bloom.radius ?? 0.24,
    bloom.threshold ?? 1.05
  );
  composer.addPass(bloomPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  return {
    composer,
    bloomPass,
    eco: false,
    render: () => {
      composer.render();
    },
    resize: (w: number, h: number) => {
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.setSize(w, h);
    },
    dispose: () => {
      composer.dispose();
    },
  };
}

/**
 * Centra un modelo .glb en X/Z, lo escala para que su dimensión máxima (o altura)
 * coincida con `targetSize` y apoya exactamente `box.min.y` en `y = baseY`.
 */
export function normalizarModeloGLB(
  root: THREE.Object3D,
  opts: {
    targetSize?: number;
    fitBy?: "max" | "height";
    baseY?: number;
    rotateY?: number;
    rotateX?: number;
    shadows?: boolean;
  } = {}
): THREE.Group {
  const {
    targetSize = 2.0,
    fitBy = "max",
    baseY = 0,
    rotateY = 0,
    rotateX = 0,
    shadows = true,
  } = opts;

  const wrapper = new THREE.Group();
  if (rotateX) root.rotation.x += rotateX;
  if (rotateY) root.rotation.y += rotateY;
  wrapper.add(root);

  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const refDim =
    fitBy === "height"
      ? Math.max(0.001, size.y)
      : Math.max(0.001, size.x, size.y, size.z);
  const scale = targetSize / refDim;
  root.scale.multiplyScalar(scale);

  root.updateMatrixWorld(true);
  const scaledBox = new THREE.Box3().setFromObject(root);
  const scaledCenter = new THREE.Vector3();
  scaledBox.getCenter(scaledCenter);

  root.position.x -= scaledCenter.x;
  root.position.z -= scaledCenter.z;
  root.position.y -= scaledBox.min.y - baseY;

  if (shadows) {
    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mesh = obj;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }

  return wrapper;
}

export interface UnidadGLBSpec {
  url: string;
  targetSize: number;
  fitBy?: "max" | "height";
  rotateY?: number;
  baseY?: number;
  tintMode?: "visor" | "subtle" | "none";
}

export const MAPA_UNIDADES_GLB: Record<TipoUnidad3D, UnidadGLBSpec> = {
  soldier: {
    url: "/assets/models/soldier.glb",
    targetSize: 1.45,
    fitBy: "height",
    rotateY: Math.PI / 2,
    tintMode: "visor",
  },
  tank: {
    url: "/assets/models/tank.glb",
    targetSize: 2.15,
    fitBy: "max",
    rotateY: Math.PI / 2,
    tintMode: "subtle",
  },
  ifv: {
    url: "/assets/models/scout-drone.glb",
    targetSize: 1.75,
    fitBy: "max",
    rotateY: Math.PI / 2,
    tintMode: "subtle",
  },
  artillery: {
    url: "/assets/models/atlas-v.glb",
    targetSize: 1.95,
    fitBy: "height",
    rotateY: 0,
    tintMode: "subtle",
  },
  sam: {
    url: "/assets/models/breach-spider.glb",
    targetSize: 1.65,
    fitBy: "max",
    rotateY: Math.PI / 2,
    tintMode: "subtle",
  },
  radar: {
    url: "/assets/models/cubesat.glb",
    targetSize: 1.4,
    fitBy: "max",
    baseY: 0.2,
    tintMode: "subtle",
  },
  drone: {
    url: "/assets/models/drone.glb",
    targetSize: 1.25,
    fitBy: "max",
    baseY: 0.15,
    tintMode: "subtle",
  },
  ship: {
    url: "/assets/models/naval-vessel.glb",
    targetSize: 2.35,
    fitBy: "max",
    rotateY: Math.PI / 2,
    tintMode: "subtle",
  },
  jet: {
    url: "/assets/models/f15.glb",
    targetSize: 2.3,
    fitBy: "max",
    rotateY: Math.PI / 2,
    tintMode: "subtle",
  },
};

export interface InstanciaUnidadGLB {
  root: THREE.Group;
  mixer: THREE.AnimationMixer | null;
  turretNode: THREE.Object3D | null;
  rotorNodes: THREE.Object3D[];
  dispose: () => void;
}

/**
 * Crea un contenedor inmediato con marcador holográfico mínimo mientras
 * carga el .glb real y lo reemplaza de forma asíncrona sin bloquear el render.
 */
export function instanciarUnidadGLB(
  tipo: TipoUnidad3D,
  colorBandoHex: number,
  acentoHex: number,
  escalaExtra = 1.0
): InstanciaUnidadGLB {
  const root = new THREE.Group();
  let disposed = false;
  let mixer: THREE.AnimationMixer | null = null;
  let turretNode: THREE.Object3D | null = null;
  const rotorNodes: THREE.Object3D[] = [];

  // Baliza temporal discreta mientras resuelve la promesa local (<20ms)
  const placeholder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.26, 0.12, 12),
    new THREE.MeshBasicMaterial({ color: acentoHex, transparent: true, opacity: 0.55 })
  );
  placeholder.position.y = 0.06;
  root.add(placeholder);

  const spec = MAPA_UNIDADES_GLB[tipo] ?? MAPA_UNIDADES_GLB.soldier;

  const instance: InstanciaUnidadGLB = {
    root,
    get mixer() {
      return mixer;
    },
    get turretNode() {
      return turretNode;
    },
    rotorNodes,
    dispose: () => {
      disposed = true;
      mixer?.stopAllAction();
    },
  };

  loadGLBCached(spec.url)
    .then(({ scene: model, animations }) => {
      if (disposed) return;
      root.remove(placeholder);
      placeholder.geometry.dispose();
      (placeholder.material as THREE.Material).dispose();

      // Para artillería inclinamos suavemente el cohete sobre rampa móvil
      if (tipo === "artillery") {
        model.rotation.z = -0.38;
      }

      const norm = normalizarModeloGLB(model, {
        targetSize: spec.targetSize * escalaExtra,
        fitBy: spec.fitBy,
        baseY: spec.baseY ?? 0,
        rotateY: spec.rotateY ?? 0,
      });

      // Tintado sutil de identificación de bando sin destruir texturas PBR reales
      const bandColor = new THREE.Color(colorBandoHex);
      const accentColor = new THREE.Color(acentoHex);
      norm.traverse((obj) => {
        const nameLower = obj.name.toLowerCase();
        if (nameLower.includes("turret") && !turretNode) {
          turretNode = obj;
        }
        if (
          nameLower.includes("propell") ||
          nameLower.includes("backrotor") ||
          nameLower.includes("rotor")
        ) {
          rotorNodes.push(obj);
        }
        if (obj instanceof THREE.Mesh) {
          const mesh = obj;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const clonedMats = mats.map((m) => {
            if (!m) return m;
            const c = m.clone();
            if (c instanceof THREE.MeshStandardMaterial) {
              if (nameLower.includes("visor") || nameLower.includes("led") || nameLower.includes("glass")) {
                c.emissive.copy(accentColor);
                c.emissiveIntensity = 1.4;
              } else if (spec.tintMode === "subtle" && !c.map) {
                c.color.lerp(bandColor, 0.28);
              }
            }
            return c;
          });
          mesh.material = Array.isArray(mesh.material) ? clonedMats : clonedMats[0];
        }
      });

      // Reproducir clip natural del modelo si existe
      if (animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        const clip =
          animations.find((a) => /idle/i.test(a.name)) ??
          animations.find((a) => /walk|take|deploy|drive/i.test(a.name)) ??
          animations[0];
        if (clip) {
          const action = mixer.clipAction(clip);
          action.play();
        }
      }

      root.add(norm);
    })
    .catch(() => {
      // Silencio limpio si el browser aborta durante navegación
    });

  return instance;
}
