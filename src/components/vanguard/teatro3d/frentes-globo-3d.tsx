"use client";

// ============================================================================
// GLOBO 3D EN VIVO DE FRENTES ACTUALES (Three.js + world-paths.json procedural)
// Dibuja todos los continentes reales sin imágenes externas y muestra los
// frentes activos ahora mismo con balizas pulsantes, arcos y vuelo de cámara.
// ============================================================================

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import worldPaths from "@/lib/world-paths.json";
import type { FrenteVivo3D } from "@/lib/teatro-total-data";

const R_GLOBO = 4.2;

function latLngAVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

// Dibuja un mapa equirectangular real desde world-paths.json (Natural Earth)
// para evitar dependencias de texturas remotas y garantizar nitidez offline.
function crearTexturaTierra(): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#071022");
    grad.addColorStop(0.5, "#050b18");
    grad.addColorStop(1, "#071022");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Cuadrícula lat/lng sutil
    ctx.strokeStyle = "rgba(56, 189, 248, 0.14)";
    ctx.lineWidth = 1;
    for (let lon = -150; lon <= 180; lon += 30) {
      const x = ((lon + 180) / 360) * W;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = ((90 - lat) / 180) * H;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Continentes desde GeoJSON simplificado de Natural Earth
    const countries = (worldPaths as {
      countries?: { name: string; polygons: [number, number][][] }[];
    }).countries ?? [];

    ctx.fillStyle = "#1a2538";
    ctx.strokeStyle = "rgba(255, 201, 77, 0.42)";
    ctx.lineWidth = 1.4;

    for (const c of countries) {
      for (const poly of c.polygons) {
        if (poly.length < 3) continue;
        ctx.beginPath();
        poly.forEach(([lng, lat], idx) => {
          const x = ((lng + 180) / 360) * W;
          const y = ((90 - lat) / 180) * H;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

export function FrentesGlobo3D({
  frentes,
  activoId,
  onSelectFrente,
  altura = 380,
}: {
  frentes: FrenteVivo3D[];
  activoId: string;
  onSelectFrente: (id: string) => void;
  altura?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const selectCbRef = useRef(onSelectFrente);
  const targetCamRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    selectCbRef.current = onSelectFrente;
  }, [onSelectFrente]);

  useEffect(() => {
    const f = frentes.find((x) => x.id === activoId);
    if (f) {
      targetCamRef.current = latLngAVec3(f.lat, f.lng, R_GLOBO * 2.55);
    }
  }, [activoId, frentes]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const width = el.clientWidth || 640;
    const height = altura;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04070f);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    const inicial = frentes.find((x) => x.id === activoId) ?? frentes[0];
    const camInit = inicial
      ? latLngAVec3(inicial.lat, inicial.lng, R_GLOBO * 2.55)
      : new THREE.Vector3(0, 2, R_GLOBO * 2.55);
    camera.position.copy(camInit);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = R_GLOBO * 1.45;
    controls.maxDistance = R_GLOBO * 4.2;
    controls.enablePan = false;

    scene.add(new THREE.AmbientLight(0xbcd2ff, 1.05));
    const dir = new THREE.DirectionalLight(0xfff1d6, 1.15);
    dir.position.set(10, 8, 10);
    scene.add(dir);

    const earthTex = crearTexturaTierra();
    const earthGeo = new THREE.SphereGeometry(R_GLOBO, 48, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.72,
      metalness: 0.12,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // Atmósfera exterior sutil
    const atmoGeo = new THREE.SphereGeometry(R_GLOBO * 1.045, 36, 24);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(atmoGeo, atmoMat));

    // Balizas de frentes en vivo + líneas de frente reales
    const pickables: { mesh: THREE.Mesh; id: string }[] = [];
    const pulses: { mesh: THREE.Mesh; fase: number; base: number }[] = [];

    frentes.forEach((f, idx) => {
      const esSel = f.id === activoId;
      const color = esSel ? 0xffc94d : f.intensidad >= 80 ? 0xff3b30 : 0xff9500;
      const pos = latLngAVec3(f.lat, f.lng, R_GLOBO * 1.015);
      const normal = pos.clone().normalize();

      const colH = 0.28 + (f.intensidad / 100) * 0.75;
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.06, colH, 8),
        new THREE.MeshBasicMaterial({ color })
      );
      col.position.copy(pos).addScaledVector(normal, colH / 2);
      col.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      scene.add(col);

      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(esSel ? 0.14 : 0.1, 12, 10),
        new THREE.MeshBasicMaterial({ color })
      );
      sphere.position.copy(pos).addScaledVector(normal, colH);
      scene.add(sphere);
      pickables.push({ mesh: sphere, id: f.id });

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.14, 0.24, 18),
        new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
        })
      );
      ring.position.copy(pos);
      ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      scene.add(ring);
      pulses.push({ mesh: ring, fase: idx * 0.8, base: esSel ? 1.4 : 1.0 });

      // Trazado del frente real sobre la esfera
      for (const fl of f.frentes) {
        if (fl.puntos.length < 2) continue;
        const pts = fl.puntos.map(([lat, lng]) => latLngAVec3(lat, lng, R_GLOBO * 1.018));
        const lGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lMat = new THREE.LineBasicMaterial({ color: esSel ? 0xffc94d : 0xff3b30 });
        scene.add(new THREE.Line(lGeo, lMat));
      }
    });

    // Raycaster para elegir frente al hacer clic
    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    let downPt: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      downPt = { x: e.clientX, y: e.clientY };
      targetCamRef.current = null; // el usuario tomó control manual
    };
    const onUp = (e: PointerEvent) => {
      if (!downPt) return;
      const dist = Math.hypot(e.clientX - downPt.x, e.clientY - downPt.y);
      downPt = null;
      if (dist > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      ptr.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ptr.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      ray.setFromCamera(ptr, camera);
      const hits = ray.intersectObjects(
        pickables.map((p) => p.mesh),
        false
      );
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        const found = pickables.find((p) => p.mesh === hitObj);
        if (found) selectCbRef.current(found.id);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    let raf = 0;
    const animate = (t: number) => {
      raf = requestAnimationFrame(animate);
      if (targetCamRef.current) {
        camera.position.lerp(targetCamRef.current, 0.06);
        if (camera.position.distanceTo(targetCamRef.current) < 0.08) {
          targetCamRef.current = null;
        }
      }
      for (const p of pulses) {
        const s = p.base * (1 + ((Math.sin(t * 0.004 + p.fase) + 1) * 0.5) * 0.65);
        p.mesh.scale.setScalar(s);
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
      earthGeo.dispose();
      earthMat.dispose();
      earthTex.dispose();
      atmoGeo.dispose();
      atmoMat.dispose();
      renderer.dispose();
    };
  }, [frentes, activoId, altura]);

  return (
    <div
      ref={hostRef}
      className="w-full rounded-lg overflow-hidden border border-red-hud/30 bg-black cursor-grab active:cursor-grabbing"
      style={{ height: altura }}
      aria-label="Globo 3D de frentes activos en vivo"
    />
  );
}
