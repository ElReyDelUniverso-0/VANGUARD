"use client";

// ============================================================================
// VISOR 3D INTERACTIVO DE UNIFORMES TÁCTICOS (Three.js + OrbitControls)
// Operador articulado con textura de camuflaje procedural, modo despiece de
// capas balísticas, selección por pieza con resaltado luminoso y giro 360°.
// ============================================================================

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { CapaUniforme, Uniforme3D } from "@/lib/teatro-total-data";
import { crearTexturaCamo } from "./fabricas-3d";

export function UniformeInteractivo3D({
  uniforme,
  capaActiva,
  despiece,
  autoGiro,
  onSelectCapa,
  altura = 380,
}: {
  uniforme: Uniforme3D;
  capaActiva: CapaUniforme["id"];
  despiece: boolean;
  autoGiro: boolean;
  onSelectCapa?: (id: CapaUniforme["id"]) => void;
  altura?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const despieceRef = useRef(despiece);
  const giroRef = useRef(autoGiro);
  const capaRef = useRef(capaActiva);
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
    cbRef.current = onSelectCapa;
  }, [onSelectCapa]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const width = el.clientWidth || 520;
    const height = altura;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a12);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 60);
    camera.position.set(1.6, 1.6, 3.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1.05, 0);
    controls.minDistance = 2.0;
    controls.maxDistance = 6.2;

    scene.add(new THREE.AmbientLight(0xdbeafe, 0.9));
    const keyLight = new THREE.DirectionalLight(0xfff5e4, 1.35);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(new THREE.Color(uniforme.colores.acento), 0.75);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    // Pedestal holográfico
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.05, 0.1, 32),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.35, metalness: 0.75 })
    );
    ped.position.y = 0.05;
    scene.add(ped);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.88, 0.96, 40),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(uniforme.colores.acento), side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.105;
    scene.add(ring);

    const camoTex = crearTexturaCamo(
      uniforme.estiloCamo,
      uniforme.colores.primario,
      uniforme.colores.secundario,
      uniforme.colores.acento
    );

    const matUniforme = new THREE.MeshStandardMaterial({ map: camoTex, roughness: 0.72, metalness: 0.08 });
    const matChaleco = new THREE.MeshStandardMaterial({ color: uniforme.colores.chaleco, roughness: 0.55, metalness: 0.2 });
    const matCasco = new THREE.MeshStandardMaterial({ color: uniforme.colores.casco, roughness: 0.45, metalness: 0.3 });
    const matPiel = new THREE.MeshStandardMaterial({ color: uniforme.colores.piel, roughness: 0.68 });
    const matBotas = new THREE.MeshStandardMaterial({ color: 0x14171f, roughness: 0.75 });
    const matVisor = new THREE.MeshBasicMaterial({ color: uniforme.colores.visor });
    const matAcento = new THREE.MeshBasicMaterial({ color: uniforme.colores.acento });

    const operador = new THREE.Group();
    scene.add(operador);

    // Grupo por capa para poder separar y seleccionar en 3D
    const partes = new Map<
      CapaUniforme["id"],
      { grp: THREE.Group; basePos: THREE.Vector3; explodeOffset: THREE.Vector3; mats: THREE.MeshStandardMaterial[] }
    >();

    // 1. BOTAS / MOVILIDAD
    const grpBotas = new THREE.Group();
    for (const sx of [-0.16, 0.16]) {
      const bota = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.26), matBotas.clone());
      bota.position.set(sx, 0.22, 0.04);
      grpBotas.add(bota);
    }
    operador.add(grpBotas);
    partes.set("botas", {
      grp: grpBotas,
      basePos: new THREE.Vector3(0, 0, 0),
      explodeOffset: new THREE.Vector3(0, -0.15, 0.25),
      mats: grpBotas.children.map((m) => (m as THREE.Mesh).material as THREE.MeshStandardMaterial),
    });

    // 2. UNIFORME (piernas + torso + brazos + cabeza)
    const grpUnif = new THREE.Group();
    const uMats: THREE.MeshStandardMaterial[] = [];
    for (const sx of [-0.16, 0.16]) {
      const muslo = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.085, 0.68, 10), matUniforme.clone());
      muslo.position.set(sx, 0.66, 0);
      grpUnif.add(muslo);
      uMats.push(muslo.material as THREE.MeshStandardMaterial);
    }
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.56, 0.26), matUniforme.clone());
    torso.position.set(0, 1.26, 0);
    grpUnif.add(torso);
    uMats.push(torso.material as THREE.MeshStandardMaterial);

    for (const sx of [-0.31, 0.31]) {
      const brazo = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.058, 0.54, 10), matUniforme.clone());
      brazo.position.set(sx, 1.24, 0);
      brazo.rotation.z = sx < 0 ? 0.1 : -0.1;
      grpUnif.add(brazo);
      uMats.push(brazo.material as THREE.MeshStandardMaterial);

      const mano = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), matPiel);
      mano.position.set(sx * 1.08, 0.94, 0);
      grpUnif.add(mano);
    }
    const parche = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.07), matAcento);
    parche.position.set(0.35, 1.38, 0);
    grpUnif.add(parche);

    const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.145, 14, 12), matPiel);
    cabeza.position.set(0, 1.69, 0);
    grpUnif.add(cabeza);
    operador.add(grpUnif);
    partes.set("uniforme", {
      grp: grpUnif,
      basePos: new THREE.Vector3(0, 0, 0),
      explodeOffset: new THREE.Vector3(0, 0, 0),
      mats: uMats,
    });

    // 3. CHALECO BALÍSTICO
    const grpChaleco = new THREE.Group();
    const placa = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.44, 0.32), matChaleco.clone());
    placa.position.set(0, 1.28, 0);
    grpChaleco.add(placa);
    const bolsas = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.08), matBotas.clone());
    bolsas.position.set(0, 1.16, 0.18);
    grpChaleco.add(bolsas);
    const insignia = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.02), matAcento);
    insignia.position.set(0, 1.4, 0.165);
    grpChaleco.add(insignia);
    operador.add(grpChaleco);
    partes.set("chaleco", {
      grp: grpChaleco,
      basePos: new THREE.Vector3(0, 0, 0),
      explodeOffset: new THREE.Vector3(0, 0.06, 0.48),
      mats: [placa.material as THREE.MeshStandardMaterial],
    });

    // 4. CASCO + VISOR NVG
    const grpCasco = new THREE.Group();
    const cupula = new THREE.Mesh(
      new THREE.SphereGeometry(0.175, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62),
      matCasco.clone()
    );
    cupula.position.set(0, 1.71, 0);
    grpCasco.add(cupula);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.065, 0.14), matVisor);
    visor.position.set(0, 1.72, 0.14);
    grpCasco.add(visor);
    const nvgMount = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), matBotas.clone());
    nvgMount.position.set(0, 1.84, 0.16);
    grpCasco.add(nvgMount);
    operador.add(grpCasco);
    partes.set("casco", {
      grp: grpCasco,
      basePos: new THREE.Vector3(0, 0, 0),
      explodeOffset: new THREE.Vector3(0, 0.38, 0.12),
      mats: [cupula.material as THREE.MeshStandardMaterial],
    });

    // 5. MOCHILA TÁCTICA + RADIO
    const grpMochila = new THREE.Group();
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.46, 0.2), matChaleco.clone());
    pack.position.set(0, 1.28, -0.24);
    grpMochila.add(pack);
    const antena = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.46, 6), matAcento);
    antena.position.set(0.14, 1.65, -0.26);
    grpMochila.add(antena);
    operador.add(grpMochila);
    partes.set("mochila", {
      grp: grpMochila,
      basePos: new THREE.Vector3(0, 0, 0),
      explodeOffset: new THREE.Vector3(0, 0.05, -0.52),
      mats: [pack.material as THREE.MeshStandardMaterial],
    });

    // 6. CINTURÓN MODULAR + CARGADORES
    const grpCint = new THREE.Group();
    const cint = new THREE.Mesh(new THREE.BoxGeometry(0.49, 0.09, 0.3), matBotas.clone());
    cint.position.set(0, 0.98, 0);
    grpCint.add(cint);
    const funda = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.12), matBotas.clone());
    funda.position.set(0.28, 0.88, 0.02);
    grpCint.add(funda);
    operador.add(grpCint);
    partes.set("cinturon", {
      grp: grpCint,
      basePos: new THREE.Vector3(0, 0, 0),
      explodeOffset: new THREE.Vector3(0.42, -0.04, 0.25),
      mats: [cint.material as THREE.MeshStandardMaterial],
    });

    // Raycast clic para elegir pieza directamente sobre el modelo 3D
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
      const hits = ray.intersectObject(operador, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj) {
          for (const [k, v] of partes.entries()) {
            if (v.grp === obj) {
              cbRef.current(k);
              return;
            }
          }
          obj = obj.parent;
        }
      }
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    let raf = 0;
    let factorDespiece = 0;
    const accentColor = new THREE.Color(uniforme.colores.acento);

    const animate = (t: number) => {
      raf = requestAnimationFrame(animate);
      const objetivo = despieceRef.current ? 1 : 0;
      factorDespiece += (objetivo - factorDespiece) * 0.1;

      if (giroRef.current) {
        operador.rotation.y += 0.0065;
      }

      for (const [k, v] of partes.entries()) {
        v.grp.position.copy(v.basePos).addScaledVector(v.explodeOffset, factorDespiece);
        const activo = k === capaRef.current;
        for (const m of v.mats) {
          m.emissive.copy(activo ? accentColor : new THREE.Color(0x000000));
          m.emissiveIntensity = activo ? 0.35 + Math.sin(t * 0.006) * 0.12 : 0;
        }
      }

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
      camoTex.dispose();
      matUniforme.dispose();
      renderer.dispose();
    };
  }, [uniforme, altura]);

  return (
    <div
      ref={hostRef}
      className="w-full rounded-lg overflow-hidden border border-amber-hud/30 bg-black cursor-grab active:cursor-grabbing"
      style={{ height: altura }}
      aria-label={`Modelo 3D del uniforme ${uniforme.nombre}`}
    />
  );
}
