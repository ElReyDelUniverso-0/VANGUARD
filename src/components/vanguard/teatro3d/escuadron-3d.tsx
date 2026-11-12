"use client";

// ============================================================================
// VISOR 3D REAL DE ESCUADRONES Y FORMACIONES (MODELOS .GLB + HDRI + BLOOM)
// Cada integrante carga su modelo .glb real (Soldier, Tank, F-15, Drone,
// Scout-Drone, Atlas-V, Breach-Spider, CubeSat, Ship) con animaciones
// en vivo, sombras suaves reales sobre plataforma táctica y clic directo 3D.
// ============================================================================

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Escuadron3D } from "@/lib/teatro-total-data";
import {
  aplicarEntornoPBR,
  crearPipelinePBR,
  esDispositivoMovilOLigero,
  instanciarUnidadGLB,
  type InstanciaUnidadGLB,
} from "./glb-engine";

export function EscuadronInteractivo3D({
  escuadron,
  miembroActivoId,
  autoGiro,
  onSelectMiembro,
  altura = 390,
}: {
  escuadron: Escuadron3D;
  miembroActivoId: string;
  autoGiro: boolean;
  onSelectMiembro?: (id: string) => void;
  altura?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const activoRef = useRef(miembroActivoId);
  const giroRef = useRef(autoGiro);
  const cbRef = useRef(onSelectMiembro);

  useEffect(() => {
    activoRef.current = miembroActivoId;
  }, [miembroActivoId]);

  useEffect(() => {
    giroRef.current = autoGiro;
  }, [autoGiro]);

  useEffect(() => {
    cbRef.current = onSelectMiembro;
  }, [onSelectMiembro]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const width = el.clientWidth || 560;
    const height = altura;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060912);
    scene.fog = new THREE.FogExp2(0x060912, 0.025);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(0, 5.2, 8.2);

    const movil = esDispositivoMovilOLigero();
    const renderer = new THREE.WebGLRenderer({
      antialias: !movil,
      powerPreference: movil ? "default" : "high-performance",
    });
    renderer.setPixelRatio(movil ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
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
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.minDistance = 4.0;
    controls.maxDistance = 15.5;
    controls.target.set(0, 0.45, 0);

    const acento = escuadron.esVanguard ? 0xffc94d : 0x38bdf8;
    const baseColor = escuadron.esVanguard ? 0x26344a : 0x22405c;

    scene.add(new THREE.HemisphereLight(0xd0e2ff, 0x0b0f18, 0.75));
    const dir = new THREE.DirectionalLight(0xfff1dc, 2.1);
    dir.position.set(7, 12, 6);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    dir.shadow.camera.left = -6;
    dir.shadow.camera.right = 6;
    dir.shadow.camera.top = 6;
    dir.shadow.camera.bottom = -6;
    scene.add(dir);

    const stage = new THREE.Group();
    scene.add(stage);

    // Plataforma táctica PBR octogonal con reflejos metálicos
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(4.9, 5.2, 0.24, 24),
      new THREE.MeshStandardMaterial({ color: 0x0c1220, roughness: 0.35, metalness: 0.72 })
    );
    pad.position.y = -0.12;
    pad.receiveShadow = true;
    stage.add(pad);

    const grid = new THREE.GridHelper(8.6, 12, acento, 0x334155);
    grid.position.y = 0.015;
    const gridMats = Array.isArray(grid.material) ? grid.material : [grid.material];
    for (const gm of gridMats) {
      gm.transparent = true;
      gm.opacity = 0.28;
    }
    stage.add(grid);

    const anilloExt = new THREE.Mesh(
      new THREE.RingGeometry(4.65, 4.82, 56),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(acento).multiplyScalar(1.4),
        side: THREE.DoubleSide,
      })
    );
    anilloExt.rotation.x = -Math.PI / 2;
    anilloExt.position.y = 0.025;
    stage.add(anilloExt);

    // Instanciar cada miembro con su modelo .glb real
    const nodos: {
      id: string;
      inst: InstanciaUnidadGLB;
      ring: THREE.Mesh;
      baseY: number;
      tipo: string;
    }[] = [];

    for (const m of escuadron.miembros) {
      const escala = m.tipo === "soldier" ? 0.95 : m.tipo === "tank" ? 0.92 : 0.85;
      const inst = instanciarUnidadGLB(m.tipo, baseColor, acento, escala);
      const baseY = m.tipo === "drone" ? 1.45 : m.tipo === "jet" ? 2.15 : 0.02;
      inst.root.position.set(m.offset[0], baseY, m.offset[1]);
      inst.root.rotation.y = Math.PI / 2;
      stage.add(inst.root);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.55, 0.72, 24),
        new THREE.MeshBasicMaterial({
          color: acento,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.38,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(m.offset[0], 0.035, m.offset[1]);
      stage.add(ring);

      nodos.push({ id: m.id, inst, ring, baseY, tipo: m.tipo });
    }

    // Raycast click para seleccionar miembro del escuadrón
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
      const hits = ray.intersectObject(stage, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj) {
          const hit = nodos.find((n) => n.inst.root === obj);
          if (hit) {
            cbRef.current(hit.id);
            return;
          }
          obj = obj.parent;
        }
      }
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    let lastNow = performance.now();
    let raf = 0;
    const animate = (now: number) => {
      raf = requestAnimationFrame(animate);
      if (document.hidden) {
        lastNow = now;
        return;
      }
      const dt = Math.min(0.05, (now - lastNow) * 0.001);
      lastNow = now;

      if (giroRef.current) {
        stage.rotation.y += dt * 0.25;
      }

      for (const n of nodos) {
        const esSel = n.id === activoRef.current;
        const rMat = n.ring.material as THREE.MeshBasicMaterial;
        rMat.color.setHex(esSel ? 0xffc94d : acento);
        rMat.opacity = esSel ? 0.95 : 0.24;
        n.ring.scale.setScalar(esSel ? 1.18 + Math.sin(now * 0.006) * 0.12 : 0.92);

        if (n.tipo === "drone" || n.tipo === "jet") {
          n.inst.root.position.y = n.baseY + Math.sin(now * 0.0035 + n.inst.root.position.x) * 0.14;
        }
        n.inst.mixer?.update(dt);
        if (n.inst.turretNode) {
          n.inst.turretNode.rotation.y = Math.sin(now * 0.0011 + n.inst.root.position.x) * 0.3;
        }
        for (const r of n.inst.rotorNodes) {
          r.rotation.y += dt * 18;
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
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      for (const n of nodos) n.inst.dispose();
      disposeEnv();
      pipeline.dispose();
      controls.dispose();
      renderer.dispose();
    };
  }, [escuadron, altura]);

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden border border-cyan-hud/35 bg-black"
      style={{ height: altura }}
      aria-label={`Formación 3D del escuadrón ${escuadron.nombre}`}
    >
      <div ref={hostRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-2 left-2.5 z-10 pointer-events-none px-2 py-0.5 rounded bg-black/75 border border-white/10 font-mono text-[9.5px] text-slate-300">
        Formación .GLB Real (Soldier · Tank · F-15 · Drone · Scout · Vessel) · Clic para inspeccionar
      </div>
    </div>
  );
}
