"use client";

// ============================================================================
// MOTOR 3D DE TERRENO MUNDIAL Y SIMULACIÓN DE GUERRA (Three.js + OrbitControls)
// Convierte cualquier coordenada del planeta en relieve 3D interactivo,
// soporta sensores (Táctico, Satélite, Nocturno NVG, Térmico FLIR) y clic
// directo con raycaster para desplegar unidades o ataques quirúrgicos.
// ============================================================================

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { BiomaTeatro, ModoSensor, TeatroMundial } from "@/lib/teatro-total-data";
import {
  edificiosDeTeatro,
  elevacionEn,
  type SimEstado,
} from "@/lib/teatro-sim-engine";
import { construirUnidadMini3D } from "./fabricas-3d";

const MUNDO_SIZE = 36;
const HALF = MUNDO_SIZE / 2;
const SEGS = 56;

interface CiudadPin {
  nombre: string;
  nx: number;
  nz: number;
  estado: string;
}

function colorTerreno(
  el: number,
  bioma: BiomaTeatro,
  sensor: ModoSensor
): [number, number, number] {
  if (sensor === "nocturno") {
    const lum = Math.max(0.08, Math.min(0.85, 0.25 + el * 0.42));
    return [0.06 * lum, 0.92 * lum, 0.28 * lum];
  }
  if (sensor === "termico") {
    const calor = Math.max(0.08, Math.min(0.95, 0.28 + Math.abs(el) * 0.25));
    return [0.08 + calor * 0.22, 0.14 + calor * 0.18, 0.42 + (1 - calor) * 0.35];
  }
  if (sensor === "tactico") {
    if (el < 0) return [0.04, 0.16, 0.28];
    if (el > 0.72) return [0.68, 0.64, 0.54];
    if (bioma === "desierto") return [0.48 + el * 0.25, 0.36 + el * 0.2, 0.22 + el * 0.12];
    if (bioma === "artico") return [0.55 + el * 0.35, 0.65 + el * 0.3, 0.78 + el * 0.2];
    if (bioma === "urbano") return [0.18 + el * 0.22, 0.21 + el * 0.22, 0.27 + el * 0.22];
    if (bioma === "selva") return [0.08 + el * 0.18, 0.24 + el * 0.28, 0.11 + el * 0.14];
    return [0.14 + el * 0.26, 0.22 + el * 0.28, 0.16 + el * 0.22];
  }
  // satélite natural
  if (el < 0) return [0.05, 0.22, 0.38];
  if (bioma === "montana") {
    if (el > 0.68) return [0.88, 0.91, 0.96];
    if (el > 0.36) return [0.42, 0.39, 0.36];
    return [0.22, 0.32, 0.2];
  }
  if (bioma === "desierto") return [0.74 + el * 0.14, 0.58 + el * 0.12, 0.36 + el * 0.1];
  if (bioma === "artico") return [0.78 + el * 0.18, 0.86 + el * 0.12, 0.94];
  if (bioma === "selva") return [0.1 + el * 0.15, 0.36 + el * 0.25, 0.13 + el * 0.12];
  if (bioma === "urbano") return [0.26 + el * 0.18, 0.28 + el * 0.18, 0.32 + el * 0.18];
  return [0.22 + el * 0.25, 0.35 + el * 0.24, 0.2 + el * 0.18];
}

export function TerrenoGuerra3D({
  teatro,
  simRef,
  sensor,
  onTerrenoClick,
  ciudades = [],
  altura = 440,
}: {
  teatro: TeatroMundial;
  simRef: React.MutableRefObject<SimEstado>;
  sensor: ModoSensor;
  onTerrenoClick?: (nx: number, nz: number) => void;
  ciudades?: CiudadPin[];
  altura?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sensorRef = useRef<ModoSensor>(sensor);
  const clickCbRef = useRef(onTerrenoClick);

  useEffect(() => {
    sensorRef.current = sensor;
  }, [sensor]);

  useEffect(() => {
    clickCbRef.current = onTerrenoClick;
  }, [onTerrenoClick]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const width = el.clientWidth || 720;
    const height = altura;

    const scene = new THREE.Scene();
    const bgHex =
      sensor === "nocturno"
        ? 0x041208
        : sensor === "termico"
        ? 0x05091c
        : sensor === "satelite"
        ? 0x0c192c
        : 0x070a12;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.0115);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.2, 180);
    camera.position.set(0, 22, 26);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.minDistance = 10;
    controls.maxDistance = 54;
    controls.target.set(0, 0.8, 0);

    // Luces
    const hemi = new THREE.HemisphereLight(
      sensor === "nocturno" ? 0x3dff7a : 0x9ec5ff,
      0x111520,
      sensor === "satelite" ? 1.15 : 0.9
    );
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(
      sensor === "nocturno" ? 0x6dff96 : sensor === "termico" ? 0xff9a52 : 0xffeed6,
      sensor === "satelite" ? 1.45 : 1.1
    );
    sun.position.set(18, 28, 14);
    scene.add(sun);

    const rim = new THREE.DirectionalLight(0x38bdf8, 0.42);
    rim.position.set(-20, 12, -16);
    scene.add(rim);

    // Terreno 3D desplazado por elevacionEn()
    const terrainGeo = new THREE.PlaneGeometry(MUNDO_SIZE, MUNDO_SIZE, SEGS, SEGS);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(posAttr.count * 3);

    for (let i = 0; i < posAttr.count; i++) {
      const wx = posAttr.getX(i);
      const wz = posAttr.getZ(i);
      const nx = wx / HALF;
      const nz = wz / HALF;
      const e = elevacionEn(nx, nz, teatro);
      const wy = e * teatro.relieveAmplitud;
      posAttr.setY(i, wy);
      const [r, g, b] = colorTerreno(e, teatro.bioma, sensor);
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    terrainGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.82,
      metalness: 0.08,
      flatShading: teatro.bioma === "montana",
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    scene.add(terrainMesh);

    // Rejilla táctica sutil
    const grid = new THREE.GridHelper(MUNDO_SIZE, 12, 0xffc94d, 0x38bdf8);
    grid.position.y = 0.04;
    const gridMat = grid.material as THREE.Material | THREE.Material[];
    if (Array.isArray(gridMat)) {
      for (const gm of gridMat) {
        gm.transparent = true;
        gm.opacity = 0.13;
      }
    } else {
      gridMat.transparent = true;
      gridMat.opacity = 0.13;
    }
    scene.add(grid);

    // Zócalo base de mesa táctica
    const baseRim = new THREE.Mesh(
      new THREE.BoxGeometry(MUNDO_SIZE + 0.5, 0.9, MUNDO_SIZE + 0.5),
      new THREE.MeshStandardMaterial({ color: 0x0b0f18, roughness: 0.55, metalness: 0.45 })
    );
    baseRim.position.y = -2.25;
    scene.add(baseRim);

    // Plano de agua si el teatro es costero / fluvial / estrecho
    let waterMesh: THREE.Mesh | null = null;
    if (teatro.agua) {
      const wGeo = new THREE.PlaneGeometry(MUNDO_SIZE - 0.1, MUNDO_SIZE - 0.1, 1, 1);
      wGeo.rotateX(-Math.PI / 2);
      const wMat = new THREE.MeshStandardMaterial({
        color: sensor === "nocturno" ? 0x0a3818 : sensor === "termico" ? 0x0b1745 : 0x0d3b66,
        transparent: true,
        opacity: 0.72,
        roughness: 0.18,
        metalness: 0.35,
      });
      waterMesh = new THREE.Mesh(wGeo, wMat);
      waterMesh.position.y = 0.01;
      scene.add(waterMesh);
    }

    // Edificios / estructuras urbanas deterministas
    const edificios = edificiosDeTeatro(teatro);
    const cityGroup = new THREE.Group();
    const bMatTorre = new THREE.MeshStandardMaterial({
      color: sensor === "termico" ? 0xff9f43 : sensor === "nocturno" ? 0x3ddc97 : 0x3b4459,
      emissive: sensor === "termico" ? 0x6b2700 : 0x161c28,
      emissiveIntensity: 0.45,
      roughness: 0.45,
    });
    const bMatBloque = new THREE.MeshStandardMaterial({
      color: sensor === "termico" ? 0xd97706 : 0x28303f,
      roughness: 0.6,
    });
    for (const ed of edificios) {
      const yBase = Math.max(0.02, elevacionEn(ed.x, ed.z, teatro) * teatro.relieveAmplitud);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(ed.w, ed.h, ed.d),
        ed.tipo === "torre" ? bMatTorre : bMatBloque
      );
      mesh.position.set(ed.x * HALF, yBase + ed.h / 2 - 0.05, ed.z * HALF);
      cityGroup.add(mesh);
    }
    scene.add(cityGroup);

    // Pines de ciudades reales del frente si los hay
    const cityPinGroup = new THREE.Group();
    for (const c of ciudades) {
      const yPin = Math.max(0.08, elevacionEn(c.nx, c.nz, teatro) * teatro.relieveAmplitud);
      const pinColor =
        c.estado === "frente" || c.estado === "sitio"
          ? 0xff3b30
          : c.estado === "ocupada"
          ? 0xf97316
          : c.estado === "contendida"
          ? 0xffc94d
          : 0x38bdf8;
      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.14, 1.4, 8),
        new THREE.MeshBasicMaterial({ color: pinColor })
      );
      spire.position.set(c.nx * HALF, yPin + 0.7, c.nz * HALF);
      cityPinGroup.add(spire);
      const beacon = new THREE.Mesh(
        new THREE.RingGeometry(0.35, 0.5, 18),
        new THREE.MeshBasicMaterial({ color: pinColor, side: THREE.DoubleSide })
      );
      beacon.rotation.x = -Math.PI / 2;
      beacon.position.set(c.nx * HALF, yPin + 0.08, c.nz * HALF);
      cityPinGroup.add(beacon);
    }
    scene.add(cityPinGroup);

    // Línea del frente dinámica (9 puntos en Z)
    const frontPts: THREE.Vector3[] = [];
    for (let i = 0; i < 9; i++) {
      frontPts.push(new THREE.Vector3(0, 0.4, (-0.8 + (i / 8) * 1.6) * HALF));
    }
    const frontGeo = new THREE.BufferGeometry().setFromPoints(frontPts);
    const frontMat = new THREE.LineBasicMaterial({ color: 0xffc94d });
    const frontLine = new THREE.Line(frontGeo, frontMat);
    scene.add(frontLine);

    // Grupos dinámicos de simulación
    const unitPool = new Map<string, { group: THREE.Group; ring: THREE.Mesh }>();
    const unitsLayer = new THREE.Group();
    const projLayer = new THREE.Group();
    const explLayer = new THREE.Group();
    const craterLayer = new THREE.Group();
    scene.add(unitsLayer, projLayer, explLayer, craterLayer);

    // Raycaster para desplegar en clic
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPt: { x: number; y: number } | null = null;

    const onDown = (e: PointerEvent) => {
      downPt = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      if (!downPt || !clickCbRef.current) return;
      const dist = Math.hypot(e.clientX - downPt.x, e.clientY - downPt.y);
      downPt = null;
      if (dist > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(terrainMesh, false);
      if (hits.length > 0) {
        const pt = hits[0].point;
        const nx = Math.max(-0.92, Math.min(0.92, pt.x / HALF));
        const nz = Math.max(-0.88, Math.min(0.88, pt.z / HALF));
        clickCbRef.current(nx, nz);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    let lastCraterCount = -1;
    let raf = 0;

    const animate = (now: number) => {
      raf = requestAnimationFrame(animate);
      const st = simRef.current;

      if (waterMesh) {
        waterMesh.position.y = 0.015 + Math.sin(now * 0.0018) * 0.025;
      }

      // Sincronizar unidades vivas sin reconstruir en cada frame
      const vivosIds = new Set(st.unidades.map((u) => u.id));
      for (const [id, item] of unitPool.entries()) {
        if (!vivosIds.has(id)) {
          unitsLayer.remove(item.group);
          unitsLayer.remove(item.ring);
          unitPool.delete(id);
        }
      }

      for (const u of st.unidades) {
        let entry = unitPool.get(u.id);
        if (!entry) {
          const colorBando =
            sensorRef.current === "termico"
              ? u.bando === "A"
                ? 0xffb703
                : 0xff4d6d
              : u.bando === "A"
              ? 0x38bdf8
              : 0xff3b30;
          const acento = u.bando === "A" ? 0xffc94d : 0xff6b6b;
          const grp = construirUnidadMini3D(u.tipo, colorBando, acento);
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.45, 0.58, 16),
            new THREE.MeshBasicMaterial({
              color: u.bando === "A" ? 0xffc94d : 0xff3b30,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.72,
            })
          );
          ring.rotation.x = -Math.PI / 2;
          unitsLayer.add(grp);
          unitsLayer.add(ring);
          entry = { group: grp, ring };
          unitPool.set(u.id, entry);
        }

        const wx = u.x * HALF;
        const wz = u.z * HALF;
        const terrainY = Math.max(0.02, elevacionEn(u.x, u.z, teatro) * teatro.relieveAmplitud);
        const airOffset = u.tipo === "jet" ? 4.2 : u.tipo === "drone" ? 2.1 + Math.sin(now * 0.007 + wx) * 0.15 : 0;

        entry.group.position.set(wx, terrainY + airOffset, wz);
        entry.group.rotation.y = -u.rot;
        entry.ring.position.set(wx, terrainY + 0.07, wz);

        const hpRatio = Math.max(0.25, u.hp / u.maxHp);
        entry.ring.scale.setScalar(0.85 + hpRatio * 0.25);

        entry.group.traverse((obj) => {
          if (obj.name === "rotor") obj.rotation.y += 0.35;
          if (obj.name === "radarDish") obj.rotation.y += 0.05;
        });
      }

      // Línea del frente dinámica
      const fPos = frontGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < 9; i++) {
        const fx = st.frenteLinea[i] ?? 0;
        const fz = -0.8 + (i / 8) * 1.6;
        const fy = Math.max(0.18, elevacionEn(fx, fz, teatro) * teatro.relieveAmplitud + 0.32);
        fPos.setXYZ(i, fx * HALF, fy, fz * HALF);
      }
      fPos.needsUpdate = true;

      // Proyectiles
      projLayer.clear();
      for (const pr of st.proyectiles) {
        const px = (pr.x0 + (pr.x1 - pr.x0) * pr.p) * HALF;
        const pz = (pr.z0 + (pr.z1 - pr.z0) * pr.p) * HALF;
        const arco =
          pr.estilo === "artilleria" || pr.estilo === "misil"
            ? Math.sin(pr.p * Math.PI) * 5.2
            : pr.estilo === "sam"
            ? Math.sin(pr.p * Math.PI) * 2.8
            : Math.sin(pr.p * Math.PI) * 0.6;
        const py =
          (pr.y0 + (pr.y1 - pr.y0) * pr.p) * teatro.relieveAmplitud + arco + 0.3;
        const col = pr.bando === "A" ? 0xffc94d : 0xff3b30;
        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(pr.estilo === "trazadora" ? 0.1 : 0.22, 6, 6),
          new THREE.MeshBasicMaterial({ color: col })
        );
        orb.position.set(px, py, pz);
        projLayer.add(orb);
      }

      // Explosiones
      explLayer.clear();
      for (const ex of st.explosiones) {
        const k = ex.edad / ex.maxEdad;
        const r = (0.25 + k * 1.55) * ex.radio;
        const ey = Math.max(0.05, ex.y * teatro.relieveAmplitud) + 0.25;
        const bola = new THREE.Mesh(
          new THREE.SphereGeometry(r * 0.55, 8, 6),
          new THREE.MeshBasicMaterial({
            color: k < 0.35 ? 0xffc94d : 0xff4500,
            transparent: true,
            opacity: Math.max(0, 0.85 * (1 - k)),
          })
        );
        bola.position.set(ex.x * HALF, ey, ex.z * HALF);
        explLayer.add(bola);

        const onda = new THREE.Mesh(
          new THREE.RingGeometry(r * 0.7, r, 16),
          new THREE.MeshBasicMaterial({
            color: 0xffc94d,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: Math.max(0, 0.65 * (1 - k)),
          })
        );
        onda.rotation.x = -Math.PI / 2;
        onda.position.set(ex.x * HALF, ey + 0.05, ex.z * HALF);
        explLayer.add(onda);
      }

      // Cráteres persistentes
      if (st.crateres.length !== lastCraterCount) {
        lastCraterCount = st.crateres.length;
        craterLayer.clear();
        for (const cr of st.crateres) {
          const cy = Math.max(0.03, elevacionEn(cr.x, cr.z, teatro) * teatro.relieveAmplitud) + 0.04;
          const marca = new THREE.Mesh(
            new THREE.CircleGeometry(cr.radio * HALF * 1.25, 10),
            new THREE.MeshBasicMaterial({ color: 0x090a0f, transparent: true, opacity: 0.72 })
          );
          marca.rotation.x = -Math.PI / 2;
          marca.position.set(cr.x * HALF, cy, cr.z * HALF);
          craterLayer.add(marca);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    raf = requestAnimationFrame(animate);

    const onResize = () => {
      if (!el) return;
      const w = el.clientWidth || width;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      controls.dispose();
      terrainGeo.dispose();
      terrainMat.dispose();
      renderer.dispose();
    };
  }, [teatro, sensor, altura, simRef, ciudades]);

  return (
    <div
      ref={hostRef}
      className="w-full rounded-lg overflow-hidden border border-amber-hud/30 bg-black cursor-crosshair"
      style={{ height: altura }}
      aria-label={`Simulador táctico 3D de ${teatro.nombre}`}
    />
  );
}
