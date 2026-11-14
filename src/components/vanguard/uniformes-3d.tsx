"use client";

// ============================================================
// v367.8 EL PARQUE MILITAR (src/components/vanguard/uniformes-3d.tsx)
//
// Orden del Dueño: «mejora los uniformes, personajes, vehículos militares; no
// crees nada nuevo, solo copia los mejores que ya existen 3D con todo y pégalos
// a Vanguard, así con el simulador de guerra».
//
// Este componente MONTA los seis modelos CC0 de Quaternius que ya se copiaron a
// /assets/3d/militar (ver lib/3d/activos-militares.ts) en una escena viva:
//   · una escuadra de infantería en formación, con el UNIFORME del bando
//     elegido aplicado a la tela del modelo;
//   · dos carros de combate con su animación propia de avance;
//   · un mech de apoyo que camina de verdad (animación del propio GLB).
//
// Leyes de la casa que respeta:
//  ① CERO INVENTO: la malla es la de Quaternius, tal cual. Lo único que se
//     toca es el COLOR de los materiales de tela (uniforme) — y se dice.
//  ② SI UN MODELO NO ABRE, LA ESCENA NO SE QUEDA MUDA: se pinta la figura
//     procedural de la casa y el HUD lo confiesa con el nombre del archivo.
//  ③ NADA DE GASTAR EL APARATO DEL DUEÑO: DPR topado, pausa cuando la escena
//     sale de pantalla (IntersectionObserver), respeto de «reducir movimiento»
//     y limpieza total de geometrías, materiales, mixers y renderer.
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RelojTres } from "@/lib/reloj-tres";
import { cn } from "@/lib/utils";
import { Boxes, AlertTriangle, Loader2 } from "lucide-react";
import {
  ACTIVOS_MILITARES,
  COLOR_RESPALDO,
  FACCCIONES_ORDEN,
  UNIFORMES,
  activoPorId,
  bytesTotales,
  cuentaActivos,
  type ActivoMilitar,
  type FaccionId,
} from "@/lib/3d/activos-militares";

// ── caché de modelos: un archivo se baja UNA vez por sesión (escena + clips)
interface GltfCache {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}
const cache = new Map<string, Promise<GltfCache>>();
const loader = new GLTFLoader();

function cargarGltf(url: string): Promise<GltfCache> {
  const ya = cache.get(url);
  if (ya) return ya;
  const p = new Promise<GltfCache>((res, rej) => {
    loader.load(
      url,
      (gltf) => res({ scene: gltf.scene, animations: gltf.animations }),
      undefined,
      () => rej(new Error(`no abrió ${url}`)),
    );
  });
  cache.set(url, p);
  return p;
}

/** Copia un modelo ya cargado (las animaciones se instancian aparte). */
function copiarModelo(src: THREE.Object3D): THREE.Object3D {
  const copia = src.clone(true);
  // los materiales se comparten a propósito: el tinte se aplica una vez
  return copia;
}

/** Ajusta la altura del modelo a la que pide la ficha y lo apoya en el suelo. */
function normalizarAltura(obj: THREE.Object3D, altura: number) {
  const caja = new THREE.Box3().setFromObject(obj);
  const tam = new THREE.Vector3();
  caja.getSize(tam);
  const alto = tam.y || 1;
  const e = altura / alto;
  obj.scale.multiplyScalar(e);
  const caja2 = new THREE.Box3().setFromObject(obj);
  obj.position.y -= caja2.min.y;
  // se recuerda el apoyo real: el balanceo del bucle oscila ALREDEDOR de él
  obj.userData.baseY = obj.position.y;
}

/** Aplica el uniforme: tiñe SOLO las telas de la ficha, nunca piel ni visor. */
function vestir(obj: THREE.Object3D, activo: ActivoMilitar, tela: string, chaleco: string) {
  const t = new THREE.Color(tela);
  const c = new THREE.Color(chaleco);
  obj.traverse((o) => {
    const malla = o as THREE.Mesh;
    if (!malla.isMesh) return;
    const mats = Array.isArray(malla.material) ? malla.material : [malla.material];
    for (const m of mats) {
      const mat = m as THREE.MeshStandardMaterial;
      const nombre = (mat.name || "").toLowerCase();
      if (!nombre) continue;
      if (activo.intactos.some((i) => nombre.includes(i.toLowerCase()))) continue;
      if (!activo.telas.some((x) => nombre.includes(x.toLowerCase()))) continue;
      if (!mat.color) continue;
      // el chaleco va un tono más oscuro que la tela
      const esChaleco = /vest|chaleco|dark/i.test(nombre);
      mat.color.copy(esChaleco ? c : t);
      mat.needsUpdate = true;
    }
  });
}

/** Figura de respaldo — la de siempre, de la casa (nunca un hueco negro). */
function figuraRespaldo(tipo: ActivoMilitar["tipo"], tela: string, chaleco: string): THREE.Group {
  const g = new THREE.Group();
  const mTela = new THREE.MeshStandardMaterial({ color: new THREE.Color(tela), roughness: 0.85 });
  const mChal = new THREE.MeshStandardMaterial({ color: new THREE.Color(chaleco), roughness: 0.7 });
  const mAcero = new THREE.MeshStandardMaterial({ color: COLOR_RESPALDO.acero, metalness: 0.35, roughness: 0.5 });
  if (tipo === "personaje") {
    const cuerpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.9, 4, 8), mTela);
    cuerpo.position.y = 1.15;
    const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), mChal);
    cabeza.position.y = 1.85;
    const pierna = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.7, 4, 6), mTela);
    pierna.position.set(0.16, 0.45, 0);
    const pierna2 = pierna.clone();
    pierna2.position.x = -0.16;
    g.add(cuerpo, cabeza, pierna, pierna2);
  } else if (tipo === "vehiculo") {
    const casco = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 3.6), mTela);
    casco.position.y = 1.0;
    const torreta = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.5, 10), mChal);
    torreta.position.y = 1.65;
    const cañon = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.2, 8), mAcero);
    cañon.rotation.z = Math.PI / 2;
    cañon.position.set(0, 1.7, 1.7);
    g.add(casco, torreta, cañon);
  } else {
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 1.0), mTela);
    torso.position.y = 3.0;
    const cabeza = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), mChal);
    cabeza.position.y = 4.1;
    const p1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 1.6, 4, 8), mAcero);
    p1.position.set(0.45, 1.2, 0);
    const p2 = p1.clone();
    p2.position.x = -0.45;
    g.add(torso, cabeza, p1, p2);
  }
  return g;
}

export interface ParqueMilitarProps {
  faccionInicial?: FaccionId;
  alto?: number;
  compacto?: boolean;
  /** se avisa cuando la escena está montada (para telemetría de la casa) */
  onListo?: () => void;
}

export function ParqueMilitar({ faccionInicial = "otan", alto = 420, compacto = false, onListo }: ParqueMilitarProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [faccion, setFaccion] = useState<FaccionId>(faccionInicial);
  const [cargando, setCargando] = useState(true);
  const [fallos, setFallos] = useState<string[]>([]);
  const escenaRef = useRef<{ aplicarUniforme: (f: FaccionId) => void } | null>(null);

  const uniforme = UNIFORMES[faccion];
  const cuenta = useMemo(() => cuentaActivos(), []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let vivo = true;
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const movil = window.matchMedia("(pointer: coarse)").matches;

    const W0 = host.clientWidth || 640;
    const renderer = new THREE.WebGLRenderer({ antialias: !movil, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, movil ? 1 : 1.5));
    renderer.setSize(W0, alto);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    host.appendChild(renderer.domElement);

    const escena = new THREE.Scene();
    escena.background = new THREE.Color(0x0a0d12);
    escena.fog = new THREE.Fog(0x0a0d12, 26, 62);

    const cam = new THREE.PerspectiveCamera(48, W0 / alto, 0.1, 200);
    cam.position.set(9, 6.5, 13);
    const controls = new OrbitControls(cam, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 6;
    controls.maxDistance = 30;
    controls.maxPolarAngle = 1.45;
    controls.target.set(0, 1.6, 0);
    controls.autoRotate = !reducir;
    controls.autoRotateSpeed = 0.45;

    // ── luces ──
    escena.add(new THREE.HemisphereLight(0xcfd8e8, 0x1b2118, 1.05));
    const sol = new THREE.DirectionalLight(0xffe8c0, 1.5);
    sol.position.set(10, 16, 8);
    escena.add(sol);
    const contra = new THREE.DirectionalLight(0x6fa8ff, 0.45);
    contra.position.set(-12, 6, -10);
    escena.add(contra);

    const disposables: { dispose(): void }[] = [];
    const guardar = <T extends { dispose(): void }>(x: T): T => {
      disposables.push(x);
      return x;
    };

    // ── suelo: plataforma discreta de la casa ──
    const discoGeo = guardar(new THREE.CircleGeometry(13, 48));
    const discoMat = guardar(new THREE.MeshStandardMaterial({ color: 0x161b16, roughness: 0.95, metalness: 0.05 }));
    const disco = new THREE.Mesh(discoGeo, discoMat);
    disco.rotation.x = -Math.PI / 2;
    escena.add(disco);
    const rejilla = guardar(new THREE.GridHelper(26, 26, 0x35502f, 0x1d2a1c));
    rejilla.position.y = 0.02;
    escena.add(rejilla);

    // ── grupos de la escena ──
    const grupoSoldados = new THREE.Group();
    const grupoVehiculos = new THREE.Group();
    escena.add(grupoSoldados, grupoVehiculos);

    type Mixer = { mixer: THREE.AnimationMixer; accion: THREE.AnimationAction; base: number };
    const mixers: Mixer[] = [];
    const tinteables: { obj: THREE.Object3D; activo: ActivoMilitar }[] = [];

    const faltantes: string[] = [];

    const montar = async () => {
      const config: { id: string; x: number; z: number; ry: number; grupo: THREE.Group; anim?: string }[] = [
        { id: "soldado-swat", x: -2.4, z: 1.6, ry: 0.15, grupo: grupoSoldados },
        { id: "soldado-swat", x: -0.8, z: 2.2, ry: 0.1, grupo: grupoSoldados },
        { id: "soldado-obrero", x: 0.9, z: 1.9, ry: -0.05, grupo: grupoSoldados },
        { id: "soldado-swat", x: 2.5, z: 2.3, ry: -0.12, grupo: grupoSoldados },
        { id: "tanque-1", x: -3.6, z: -2.4, ry: 0.42, grupo: grupoVehiculos, anim: "Tank_Forward" },
        { id: "tanque-2", x: 3.4, z: -3.1, ry: -0.55, grupo: grupoVehiculos, anim: "Tank_Forward" },
        { id: "mech-leela", x: 0.2, z: -5.4, ry: 0.05, grupo: grupoVehiculos, anim: "Walk" },
      ];

      for (const c of config) {
        const activo = activoPorId(c.id);
        if (!activo) continue;
        try {
          const gltf = await cargarGltf(activo.archivo);
          if (!vivo) return;
          const obj = copiarModelo(gltf.scene);
          normalizarAltura(obj, activo.altura);
          obj.position.x = c.x;
          obj.position.z = c.z;
          obj.rotation.y = c.ry;
          c.grupo.add(obj);
          tinteables.push({ obj, activo });

          // la animación del PROPIO modelo (tanques y mech la traen dentro)
          if (c.anim && gltf.animations.length > 0) {
            const clip =
              gltf.animations.find((a) => a.name.toLowerCase().includes(c.anim!.toLowerCase())) ??
              gltf.animations.find((a) => /idle/i.test(a.name)) ??
              gltf.animations[0];
            const mixer = new THREE.AnimationMixer(obj);
            const accion = mixer.clipAction(clip);
            accion.setLoop(THREE.LoopRepeat, Infinity);
            accion.play();
            mixers.push({ mixer, accion, base: 1 });
          }
        } catch {
          if (!vivo) return;
          const resp = figuraRespaldo(activo.tipo, UNIFORMES[faccionInicial].tela, UNIFORMES[faccionInicial].chaleco);
          resp.position.set(c.x, 0, c.z);
          resp.rotation.y = c.ry;
          resp.userData.baseY = 0;
          c.grupo.add(resp);
          tinteables.push({ obj: resp, activo });
          faltantes.push(activo.archivo.split("/").pop() || activo.id);
        }
      }

      if (!vivo) return;
      setFallos(faltantes);
      setCargando(false);
      onListo?.();
    };

    const aplicar = (f: FaccionId) => {
      const u = UNIFORMES[f];
      for (const t of tinteables) vestir(t.obj, t.activo, u.tela, u.chaleco);
    };
    escenaRef.current = { aplicarUniforme: aplicar };
    aplicar(faccionInicial);
    void montar();

    // ── bucle ──
    const reloj = new RelojTres();
    let raf = { id: 0 };
    let visible = true;
    const tick = () => {
      if (!vivo) return;
      raf.id = requestAnimationFrame(tick);
      const dt = Math.min(reloj.getDelta(), 0.05);
      if (!visible) return;
      if (!reducir) {
        for (const m of mixers) m.mixer.update(dt);
        // la infantería respira: un balanceo mínimo para que no parezca congelada
        const t = performance.now();
        grupoSoldados.children.forEach((s, i) => {
          const base = typeof s.userData.baseY === "number" ? s.userData.baseY : 0;
          s.position.y = base + Math.sin(t / 900 + i) * 0.012;
        });
        grupoVehiculos.children.forEach((v, i) => {
          if (i >= 2) return;
          const base = typeof v.userData.baseY === "number" ? v.userData.baseY : 0;
          v.position.y = base + Math.sin(t / 700 + i * 2) * 0.02;
        });
      }
      controls.update();
      renderer.render(escena, cam);
    };
    tick();

    // ── pausa cuando la escena no se ve (no gastar el aparato) ──
    const io = new IntersectionObserver(
      (ent) => {
        visible = ent[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );
    io.observe(host);

    const onResize = () => {
      const w = host.clientWidth || W0;
      renderer.setSize(w, alto);
      cam.aspect = w / alto;
      cam.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      vivo = false;
      cancelAnimationFrame(raf.id);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      controls.dispose();
      for (const m of mixers) m.mixer.stopAllAction();
      escena.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry?.dispose?.();
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          mats.forEach((x) => x?.dispose?.());
        }
      });
      for (const d of disposables) d.dispose();
      renderer.dispose();
      escenaRef.current = null;
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
    // el alto y el uniforme inicial no recrean la escena: el tinte se aplica aparte
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alto]);

  // cambio de uniforme en caliente (sin recrear la escena)
  useEffect(() => {
    escenaRef.current?.aplicarUniforme(faccion);
  }, [faccion]);

  return (
    <div className={cn("overflow-hidden rounded-sm border border-amber-hud/40 bg-[#0a0d12]", compacto && "border-zinc-800")}>
      {/* HUD del parque */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <Boxes className="h-3.5 w-3.5 text-amber" />
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-amber/90">
            PARQUE MILITAR · MODELOS REALES CC0
          </p>
          <span className="rounded-sm border border-zinc-700 px-1 font-mono text-[8px] uppercase tracking-widest text-zinc-500">
            {cuenta.personaje} personajes · {cuenta.vehiculo} carros · {cuenta.mech} mech
          </span>
        </div>
        <div className="flex items-center gap-1">
          {FACCCIONES_ORDEN.map((f) => (
            <button
              key={f}
              onClick={() => setFaccion(f)}
              title={UNIFORMES[f].nombre}
              aria-label={`Uniforme ${UNIFORMES[f].nombre}`}
              className={cn(
                "h-4 w-4 rounded-sm border-2 transition-transform",
                faccion === f ? "scale-110 border-amber" : "border-zinc-700 hover:border-zinc-500",
              )}
              style={{ background: UNIFORMES[f].tela }}
            />
          ))}
        </div>
      </div>

      {/* canvas */}
      <div className="relative">
        <div ref={hostRef} className="h-full w-full cursor-grab active:cursor-grabbing" style={{ height: alto }} />

        {cargando ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0a0d12]/70">
            <div className="flex items-center gap-2 rounded-sm border border-amber-hud/40 bg-black/60 px-3 py-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber" />
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-amber/90">
                copiando los modelos a la escena…
              </p>
            </div>
          </div>
        ) : null}

        {fallos.length > 0 ? (
          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-start gap-1.5 rounded-sm border border-amber-hud/40 bg-black/70 px-2 py-1">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber" />
            <p className="font-mono text-[8px] leading-relaxed text-amber/90">
              no abrieron {fallos.join(", ")} — su puesto lo ocupa la figura de la casa (nada queda vacío)
            </p>
          </div>
        ) : null}
      </div>

      {/* pie honesto */}
      <div className="border-t border-zinc-800 px-2.5 py-1.5">
        <p className="font-mono text-[8px] leading-relaxed text-zinc-500">
          <span className="text-amber/80">{uniforme.nombre}</span> · {uniforme.nota}. Modelos de Quaternius,
          CC0 1.0 (dominio público), copiados sin retocar la malla desde{" "}
          <span className="text-zinc-400">github.com/trebeljahr/quaternius-showcase</span> y servidos por la casa
          ({(bytesTotales() / 1024 / 1024).toFixed(1)} MB, {ACTIVOS_MILITARES.length} archivos .glb). Lo único que
          cambia Vanguard es el color de la tela: el uniforme.
        </p>
      </div>
    </div>
  );
}

export default ParqueMilitar;
