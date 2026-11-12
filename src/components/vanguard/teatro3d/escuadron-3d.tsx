"use client";

// ============================================================================
// VISOR 3D INTERACTIVO DE ESCUADRONES Y FORMACIONES (Three.js + OrbitControls)
// Muestra la formación exacta de vehículos, soldados, drones y radares con
// baliza luminosa bajo el miembro seleccionado y clic directo en 3D.
// ============================================================================

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Escuadron3D } from "@/lib/teatro-total-data";
import { construirUnidadMini3D } from "./fabricas-3d";

export function EscuadronInteractivo3D({
  escuadron,
  miembroActivoId,
  autoGiro,
  onSelectMiembro,
  altura = 380,
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

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(0, 5.2, 7.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.minDistance = 3.5;
    controls.maxDistance = 14;
    controls.target.set(0, 0.35, 0);

    scene.add(new THREE.AmbientLight(0xd0e2ff, 0.9));
    const dir = new THREE.DirectionalLight(0xfff1dc, 1.3);
    dir.position.set(6, 10, 5);
    scene.add(dir);

    const acento = escuadron.esVanguard ? 0xffc94d : 0x38bdf8;
    const baseColor = escuadron.esVanguard ? 0x26344a : 0x22405c;

    // Plataforma táctica octogonal + rejilla
    const stage = new THREE.Group();
    scene.add(stage);

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(4.6, 4.9, 0.22, 16),
      new THREE.MeshStandardMaterial({ color: 0x0d1320, roughness: 0.55, metalness: 0.5 })
    );
    pad.position.y = -0.11;
    stage.add(pad);

    const grid = new THREE.GridHelper(8.4, 12, acento, 0x334155);
    grid.position.y = 0.01;
    stage.add(grid);

    const anilloExt = new THREE.Mesh(
      new THREE.RingGeometry(4.35, 4.5, 48),
      new THREE.MeshBasicMaterial({ color: acento, side: THREE.DoubleSide })
    );
    anilloExt.rotation.x = -Math.PI / 2;
    anilloExt.position.y = 0.02;
    stage.add(anilloExt);

    // Miembros del escuadrón
    const nodos: {
      id: string;
      grp: THREE.Group;
      ring: THREE.Mesh;
      baseY: number;
      tipo: string;
    }[] = [];

    for (const m of escuadron.miembros) {
      const unitGrp = construirUnidadMini3D(m.tipo, baseColor, acento);
      const baseY = m.tipo === "drone" ? 1.1 : m.tipo === "jet" ? 1.65 : 0.02;
      unitGrp.position.set(m.offset[0], baseY, m.offset[1]);
      unitGrp.rotation.y = Math.PI / 2; // mirando al frente (-Z)
      stage.add(unitGrp);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.45, 0.58, 20),
        new THREE.MeshBasicMaterial({
          color: acento,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(m.offset[0], 0.04, m.offset[1]);
      stage.add(ring);

      nodos.push({ id: m.id, grp: unitGrp, ring, baseY, tipo: m.tipo });
    }

    // Raycast click para elegir integrante
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
          const hit = nodos.find((n) => n.grp === obj);
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

    let raf = 0;
    const animate = (t: number) => {
      raf = requestAnimationFrame(animate);
      if (giroRef.current) {
        stage.rotation.y += 0.0045;
      }

      for (const n of nodos) {
        const esSel = n.id === activoRef.current;
        const rMat = n.ring.material as THREE.MeshBasicMaterial;
        rMat.color.setHex(esSel ? 0xffc94d : acento);
        rMat.opacity = esSel ? 0.95 : 0.25;
        n.ring.scale.setScalar(esSel ? 1.25 + Math.sin(t * 0.006) * 0.14 : 0.95);

        if (n.tipo === "drone" || n.tipo === "jet") {
          n.grp.position.y = n.baseY + Math.sin(t * 0.004 + n.grp.position.x) * 0.12;
        }
        n.grp.traverse((child) => {
          if (child.name === "rotor") child.rotation.y += 0.36;
          if (child.name === "radarDish") child.rotation.y += 0.04;
          if (child.name === "turret") child.rotation.y = Math.sin(t * 0.0012) * 0.28;
        });
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
      renderer.dispose();
    };
  }, [escuadron, altura]);

  return (
    <div
      ref={hostRef}
      className="w-full rounded-lg overflow-hidden border border-cyan-hud/30 bg-black cursor-grab active:cursor-grabbing"
      style={{ height: altura }}
      aria-label={`Formación 3D del escuadrón ${escuadron.nombre}`}
    />
  );
}
