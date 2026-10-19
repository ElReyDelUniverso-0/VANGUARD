"use client";

// ============================================================
// v140.0 MUNDO WEBGL — LA EXPERIENCIA THREE.JS
// «El usuario no navega entre páginas: VIVE DENTRO DE UN MUNDO
// 3D y desde ese mundo accede a todo el contenido.»
//
// MOD de videojuego sobre la Casa existente (REGLA 1: ningún
// feature se borra — el contenido ya construido vive ahora en
// zonas del espacio y la cámara VUELA entre ellas):
//
//   ZONA 0 — EL ESPACIO        pos(0, 0, 8)   entrada AAA
//   ZONA 1 — EL GLOBO (HOY)    pos(0, 0, 4)   tab "inicio"
//   ZONA 2 — COMMAND CENTER    pos(-3, 2, 3)  tab "crisis"
//   ZONA 3 — LA ARENA          pos(3, -2, 3)  tab "arcade"
//   ZONA 4 — EL CUARTEL        pos(-4, 0, 3)  tab "perfil"
//
// REGLA 2 (adaptada a la Casa): TODO el mundo Three.js vive en
// ESTE archivo único. REGLA 3: móvil primero (calidad adaptativa,
// pointer events unificados, navbar con safe-area). REGLA 4:
// cero páginas — navegación 100% vuelo de cámara. REGLA 5:
// sin internet no pasa nada — los marcadores salen de
// guerras-activas-data.ts (OSINT de la Casa). REGLA 6: el globo
// JAMÁS deja de girar ni de respirar.
// Contrato 60 FPS del mundo: renderer pausado en hidden,
// pixelRatio capado, geometría adaptativa, un solo rAF.
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GUERRAS } from "@/lib/guerras-activas-data";

// ────────────────────────────────────────────────────────────
// MOTOR DE TWEEN — GSAP casero (power2.inOut = cúbica in-out).
// Cero dependencias nuevas: la Casa ya tiene suficiente carga.
// ────────────────────────────────────────────────────────────
type ObjNum = Record<string, number>;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function animar(
  obj: ObjNum,
  to: ObjNum,
  ms: number,
  opts: { ease?: (t: number) => number; onUpdate?: () => void; onDone?: () => void } = {},
): () => void {
  const from: ObjNum = {};
  for (const k in to) from[k] = obj[k] ?? 0;
  const t0 = performance.now();
  const ease = opts.ease ?? easeInOut;
  let raf = 0, vivo = true;
  const paso = (now: number) => {
    if (!vivo) return;
    const t = Math.min(1, (now - t0) / ms);
    const e = ease(t);
    for (const k in to) obj[k] = from[k] + (to[k] - from[k]) * e;
    opts.onUpdate?.();
    if (t < 1) raf = requestAnimationFrame(paso);
    else opts.onDone?.();
  };
  raf = requestAnimationFrame(paso);
  return () => { vivo = false; cancelAnimationFrame(raf); };
}

// lat/lng → posición sobre la esfera three (alineación equirect estándar)
function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

// ────────────────────────────────────────────────────────────
// LAS ZONAS — posiciones de cámara y miradas (mandato del Dueño)
// ────────────────────────────────────────────────────────────
export const ZONA_POS: Record<number, [number, number, number]> = {
  0: [0, 0, 8],
  1: [0, 0, 4],
  2: [-3, 2, 3],
  3: [3, -2, 3],
  4: [-4, 0, 3],
};
export const ZONA_TGT: Record<number, [number, number, number]> = {
  0: [0, 0, 0],
  1: [0, 0, 0],
  2: [-1, 1, 0],
  3: [1, -1, 0],
  4: [-2, 0, 0],
};
export const ZONA_TAB: Record<number, string> = { 1: "inicio", 2: "crisis", 3: "arcade", 4: "perfil" };
export const TAB_ZONA: Record<string, number> = { inicio: 1, crisis: 2, arcade: 3, perfil: 4 };

// marcadores: teatros de guerra de la Casa (OSINT real) + ciudades caliente
export interface MarcadorWGL {
  id: string;
  nombre: string;
  sub: string;
  intensidad: number; // 0..100
  lat: number;
  lng: number;
  tipo: "teatro" | "frente";
}

function construirMarcadores(): MarcadorWGL[] {
  const out: MarcadorWGL[] = [];
  for (const g of GUERRAS) {
    out.push({
      id: g.id,
      nombre: g.nombre,
      sub: g.activa ? `Intensidad ${g.intensidad}/100 · ${g.desde}` : `Teatro observado · ${g.subtitulo}`,
      intensidad: g.intensidad,
      lat: g.lat,
      lng: g.lng,
      tipo: "teatro",
    });
  }
  // ciudades en el fuego (frente/sitio/contendida) — 2 por teatro, techo 15
  for (const g of GUERRAS) {
    const calientes = (g.ciudades ?? [])
      .filter((c) => c.estado === "frente" || c.estado === "sitio" || c.estado === "contendida")
      .slice(0, 2);
    for (const c of calientes) {
      if (out.length >= 15) break;
      out.push({
        id: `${g.id}:${c.nombre}`,
        nombre: c.nombre.toUpperCase(),
        sub: `${c.estado.toUpperCase()} · teatro ${g.id.toUpperCase()}`,
        intensidad: Math.max(38, g.intensidad - 22),
        lat: c.lat,
        lng: c.lng,
        tipo: "frente",
      });
    }
    if (out.length >= 15) break;
  }
  return out.slice(0, 15);
}

// ────────────────────────────────────────────────────────────
// EL MUNDO — clase vanilla Three.js (un solo rAF, cero React)
// ────────────────────────────────────────────────────────────
interface MundoOpts {
  lienzo: HTMLCanvasElement;
  calidadBaja: boolean;
}

class MundoWGL {
  renderer: THREE.WebGLRenderer;
  escena: THREE.Scene;
  camara: THREE.PerspectiveCamera;
  mundo = new THREE.Group();
  tierra!: THREE.Mesh;
  atmosfera!: THREE.Mesh;
  estrellas!: THREE.Points;
  matEstrellas!: THREE.PointsMaterial;
  particulasOro!: THREE.Points;
  particulasAzul!: THREE.Points;
  luzDir!: THREE.DirectionalLight;
  luzRim!: THREE.PointLight;
  marcadores: { grupo: THREE.Group; nucleo: THREE.Mesh; anillo: THREE.Mesh; proxy: THREE.Mesh; datos: MarcadorWGL; fase: number }[] = [];
  zona = 0;
  mirada = new THREE.Vector3(0, 0, 0);
  cancelar: (() => void)[] = [];
  reloj = new THREE.Clock();
  raf = 0;
  vivo = true;
  respiro = 0.006;      // amplitud de la respiración del globo
  invitando = false;    // pulso de invitación en la entrada
  enVuelo = false;
  calidadBaja: boolean;
  baseEstrellas = 0.05;

  constructor(opts: MundoOpts) {
    this.calidadBaja = opts.calidadBaja;
    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.lienzo,
      antialias: !opts.calidadBaja,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.calidadBaja ? 1.5 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.escena = new THREE.Scene();
    this.camara = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 120);
    const p0 = ZONA_POS[0];
    this.camara.position.set(p0[0], p0[1], p0[2]);
    this.camara.lookAt(0, 0, 0);

    // LUCES — el frío del espacio + el rim magenta de la casa (globo SIEMPRE legible)
    this.escena.add(new THREE.AmbientLight(0x35476b, 1.5));
    this.luzDir = new THREE.DirectionalLight(0xbfd8ff, 2.3);
    this.luzDir.position.set(5, 2.4, 4);
    this.escena.add(this.luzDir);
    this.luzRim = new THREE.PointLight(0xff2d78, 14, 40);
    this.luzRim.position.set(-7, -2.5, -5);
    this.escena.add(this.luzRim);

    this.construirEstrellas();
    this.construirTierra();
    this.construirMarcadores();
    this.construirParticulas();

    // la Tierra ya nace girando (REGLA 6)
    this.mundo.rotation.y = 1.2;
    this.escena.add(this.mundo);
    this.loop();
  }

  // ── LAS ESTRELLAS — dos capas de puntos con color propio ──
  construirEstrellas() {
    const n = this.calidadBaja ? 1300 : 2600;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const tinte = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xbfe4ff),
      new THREE.Color(0xffd9ec),
      new THREE.Color(0xfff3c4),
    ];
    for (let i = 0; i < n; i++) {
      // cáscara esférica lejana — el espacio alrededor de TODO
      const r = 26 + Math.random() * 60;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(ph);
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      const c = tinte[(Math.random() * tinte.length) | 0];
      const brillo = 0.5 + Math.random() * 0.5;
      col[i * 3] = c.r * brillo; col[i * 3 + 1] = c.g * brillo; col[i * 3 + 2] = c.b * brillo;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    this.matEstrellas = new THREE.PointsMaterial({
      size: this.baseEstrellas,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      depthWrite: false,
    });
    this.estrellas = new THREE.Points(geo, this.matEstrellas);
    this.escena.add(this.estrellas);
  }

  // ── LA TIERRA — blue marble local + atmósfera fresnel ──
  construirTierra() {
    const seg = this.calidadBaja ? 48 : 64;
    const R = 1.35;
    const loader = new THREE.TextureLoader();
    const mapa = loader.load("/assets/globe/earth-blue-marble.jpg");
    mapa.colorSpace = THREE.SRGBColorSpace;
    mapa.anisotropy = this.calidadBaja ? 2 : 4;
    const mat = new THREE.MeshPhongMaterial({
      map: mapa,
      specular: new THREE.Color(0x1c2b40),
      shininess: 7,
      emissive: new THREE.Color(0x0a1826), // el planeta nunca muere en negro
    });
    this.tierra = new THREE.Mesh(new THREE.SphereGeometry(R, seg, seg), mat);
    this.mundo.add(this.tierra);

    // ATMÓSFERA — fresnel aditivo por detrás (el brillo azul de la entrada)
    const matAtm = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0x4da6ff) }, uOp: { value: 0 } },
      vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uColor; uniform float uOp; varying vec3 vN;
        void main(){ float f = pow(0.66 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(uColor, 1.0) * f * uOp; }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.atmosfera = new THREE.Mesh(new THREE.SphereGeometry(R * 1.22, seg, seg), matAtm);
    this.mundo.add(this.atmosfera);
  }

  // ── LOS MARCADORES — teatros y frentes reales de la Casa ──
  construirMarcadores() {
    const R = 1.36;
    for (const m of construirMarcadores()) {
      const esTeatro = m.tipo === "teatro";
      const t = Math.min(1, m.intensidad / 100);
      // color por intensidad: ámbar → rojo sangre
      const col = new THREE.Color().lerpColors(new THREE.Color(0xffb347), new THREE.Color(0xff2d3a), t);
      const grupo = new THREE.Group();
      grupo.position.copy(latLngToVec3(m.lat, m.lng, R));

      const nucleo = new THREE.Mesh(
        new THREE.SphereGeometry(esTeatro ? 0.05 : 0.03, 10, 10),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 }),
      );
      const anillo = new THREE.Mesh(
        new THREE.RingGeometry(esTeatro ? 0.075 : 0.048, esTeatro ? 0.115 : 0.072, 24),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      // el anillo respira mirando hacia fuera del planeta
      anillo.lookAt(latLngToVec3(m.lat, m.lng, R * 2));
      // PROXY invisible para el dedo (REGLA 3: móvil primero) — OJO: visible:false
      // hace que el Raycaster lo IGNORE: opacidad 0 es la forma honesta
      const proxy = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      proxy.userData = { marcador: m };
      grupo.add(nucleo, anillo, proxy);
      this.mundo.add(grupo);
      this.marcadores.push({ grupo, nucleo, anillo, proxy, datos: m, fase: Math.random() * Math.PI * 2 });
    }
  }

  // ── PARTÍCULAS DE AMBIENTE — oro en la Arena, azul en el Cuartel ──
  construirParticulas() {
    const hacer = (color: number) => {
      const n = this.calidadBaja ? 110 : 220;
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const r = 2.6 + Math.random() * 2.4;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = (r * Math.cos(ph)) * 0.6;
        pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color, size: 0.035, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      });
      const pts = new THREE.Points(geo, mat);
      pts.visible = false;
      this.escena.add(pts);
      return pts;
    };
    this.particulasOro = hacer(0xffd27a);
    this.particulasAzul = hacer(0x7ab8ff);
  }

  // ════════════════════════════════════════════════════════
  // EL VUELO — REGLA 1: SIEMPRE SUAVE · REGLA 2: SE VE EL VIAJE
  // ════════════════════════════════════════════════════════
  volarAZona(zona: number, dur = 1200) {
    if (this.enVuelo || zona === this.zona) return;
    this.enVuelo = true;
    this.zona = zona;
    // v140: la Casa entera se entera (page.tsx sincroniza tab y navbar)
    window.dispatchEvent(new CustomEvent("vg:wgl-zona", { detail: { zona } }));
    // REGLA 2 del vuelo: el usuario VE el viaje — bandera del warp CSS
    document.documentElement.setAttribute("data-wgl-volando", "1");
    window.setTimeout(() => {
      document.documentElement.removeAttribute("data-wgl-volando");
    }, Math.min(1500, dur) + 150);
    const pos = ZONA_POS[zona], tgt = ZONA_TGT[zona];
    const desde = { x: this.camara.position.x, y: this.camara.position.y, z: this.camara.position.z };
    const objPos = { x: desde.x, y: desde.y, z: desde.z };
    const objMir = { x: this.mirada.x, y: this.mirada.y, z: this.mirada.z };

    // WARP: estrellas gordas + fov punch — hipervelocidad suave (400ms)
    const fovBase = 50;
    this.cancelar.push(animar(this.camara, { fov: fovBase + 7 }, 380, {
      ease: easeOut,
      onUpdate: () => this.camara.updateProjectionMatrix(),
      onDone: () => this.cancelar.push(animar(this.camara, { fov: fovBase }, 620, {
        onUpdate: () => this.camara.updateProjectionMatrix(),
      })),
    }));
    this.cancelar.push(animar(this.matEstrellas, { size: this.baseEstrellas * 2.1 }, 400, {
      ease: easeOut,
      onDone: () => this.cancelar.push(animar(this.matEstrellas, { size: this.baseEstrellas }, 700)),
    }));

    this.cancelar.push(animar(objPos, { x: pos[0], y: pos[1], z: pos[2] }, dur, {
      onUpdate: () => {
        this.camara.position.set(objPos.x, objPos.y, objPos.z);
        this.camara.lookAt(objMir.x, objMir.y, objMir.z);
      },
    }));
    this.cancelar.push(animar(objMir, { x: tgt[0], y: tgt[1], z: tgt[2] }, dur, {
      onUpdate: () => this.camara.lookAt(objPos.x, objPos.y, objPos.z),
      onDone: () => {
        this.mirada.set(tgt[0], tgt[1], tgt[2]);
        this.camara.lookAt(tgt[0], tgt[1], tgt[2]);
        this.enVuelo = false;
      },
    }));

    this.ambientarZona(zona);
  }

  // ambiente por zona: Arena dorada, Cuartel azul (REGLA del mundo vivo)
  ambientarZona(zona: number) {
    const cDir = zona === 3 ? 0xffd9a0 : zona === 4 ? 0x8fc1ff : 0xbfd8ff;
    const cRim = zona === 3 ? 0xffb347 : zona === 4 ? 0x4da6ff : 0xff2d78;
    const dir = new THREE.Color(cDir), rim = new THREE.Color(cRim);
    const d0 = this.luzDir.color.clone(), r0 = this.luzRim.color.clone();
    const obj = { t: 0 };
    this.cancelar.push(animar(obj, { t: 1 }, 900, {
      onUpdate: () => {
        this.luzDir.color.lerpColors(d0, dir, obj.t);
        this.luzRim.color.lerpColors(r0, rim, obj.t);
      },
    }));
    this.particulasOro.visible = zona === 3;
    this.particulasAzul.visible = zona === 4;
    const opOro = { o: this.particulasOro.material.opacity };
    this.cancelar.push(animar(opOro, { o: zona === 3 ? 0.8 : 0 }, 900, {
      onUpdate: () => { (this.particulasOro.material as THREE.PointsMaterial).opacity = opOro.o; },
    }));
    const opAzul = { o: this.particulasAzul.material.opacity };
    this.cancelar.push(animar(opAzul, { o: zona === 4 ? 0.75 : 0 }, 900, {
      onUpdate: () => { (this.particulasAzul.material as THREE.PointsMaterial).opacity = opAzul.o; },
    }));
  }

  // ════════════════════════════════════════════════════════
  // LA SECUENCIA DE ENTRADA — los gestos del mundo (0-7s)
  // ════════════════════════════════════════════════════════
  nacerEstrellas() {
    this.cancelar.push(animar(this.matEstrellas, { opacity: 0.95 }, 1400, { ease: easeOut }));
  }
  subirGlobo() {
    const obj = { y: -5.4 };
    this.camara.position.y = -5.4;
    this.camara.lookAt(0, -1.2, 0);
    const atmMat = this.atmosfera.material as THREE.ShaderMaterial;
    this.cancelar.push(animar(obj, { y: 0 }, 1700, {
      ease: easeOut,
      onUpdate: () => {
        this.camara.position.y = obj.y;
        this.camara.lookAt(0, obj.y * 0.24, 0);
      },
    }));
    const op = { o: 0 };
    this.cancelar.push(animar(op, { o: 1.35 }, 1300, {
      onUpdate: () => atmMat.uniforms.uOp.value = op.o,
    }));
  }
  encenderMarcadores(alFinal: () => void) {
    const orden = [...this.marcadores].sort((a, b) => a.datos.intensidad - b.datos.intensidad);
    orden.forEach((m, i) => {
      const esUltimo = i === orden.length - 1;
      window.setTimeout(() => {
        if (!this.vivo) return;
        const nm = m.nucleo.material as THREE.MeshBasicMaterial;
        const na = m.anillo.material as THREE.MeshBasicMaterial;
        // destello: el núcleo nace gordo y se asienta
        this.cancelar.push(animar(m.nucleo.scale, { x: 3.2, y: 3.2, z: 3.2 }, 0, {}));
        m.nucleo.scale.setScalar(3.2);
        nm.opacity = 1;
        na.opacity = 0.9;
        this.cancelar.push(animar(m.nucleo.scale, { x: 1, y: 1, z: 1 }, 620, { ease: easeOut }));
        this.cancelar.push(animar(na, { opacity: 0.55 }, 620));
        if (esUltimo) {
          // ONDA EXPANSIVA del más grave
          const onda = new THREE.Mesh(
            new THREE.RingGeometry(0.09, 0.115, 40),
            new THREE.MeshBasicMaterial({ color: 0xff2d3a, transparent: true, opacity: 0.95, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
          );
          onda.position.copy(m.grupo.position);
          onda.lookAt(m.grupo.position.clone().multiplyScalar(3));
          this.mundo.add(onda);
          const om = onda.material as THREE.MeshBasicMaterial;
          const obj = { s: 0.3, o: 0.95 };
          this.cancelar.push(animar(obj, { s: 3.4, o: 0 }, 1000, {
            ease: easeOut,
            onUpdate: () => {
              onda.scale.setScalar(obj.s);
              om.opacity = obj.o;
            },
            onDone: () => { this.mundo.remove(onda); onda.geometry.dispose(); om.dispose(); },
          }));
          alFinal?.();
        }
      }, i * 170);
    });
  }
  invitar() {
    this.invitando = true;
    this.respiro = 0.014;
  }
  reencuentro(zonaInicial: number) {
    // entrada ya vivida esta sesión: el mundo espera en la zona de la sala
    this.zona = zonaInicial;
    window.dispatchEvent(new CustomEvent("vg:wgl-zona", { detail: { zona: zonaInicial } }));
    const pos = ZONA_POS[zonaInicial], tgt = ZONA_TGT[zonaInicial];
    this.camara.position.set(pos[0], pos[1], pos[2]);
    this.mirada.set(tgt[0], tgt[1], tgt[2]);
    this.camara.lookAt(tgt[0], tgt[1], tgt[2]);
    this.matEstrellas.opacity = 0.95;
    (this.atmosfera.material as THREE.ShaderMaterial).uniforms.uOp.value = 1.35;
    for (const m of this.marcadores) {
      (m.nucleo.material as THREE.MeshBasicMaterial).opacity = 1;
      (m.anillo.material as THREE.MeshBasicMaterial).opacity = 0.55;
    }
    this.ambientarZona(zonaInicial);
  }

  // ── RAYCAST — tocar el globo o un conflicto (window-level: los
  // paneles HTML nunca bloquean el mundo) ──
  golpear(nx: number, ny: number, ignorarUI: boolean): { tipo: "marcador" | "globo" | "nada"; datos?: MarcadorWGL; punto?: THREE.Vector3 } {
    if (ignorarUI) return { tipo: "nada" };
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(nx, ny), this.camara);
    const proxies = this.marcadores.map((m) => m.proxy);
    const hitM = ray.intersectObjects(proxies, false)[0];
    if (hitM && hitM.object.userData?.marcador) {
      return { tipo: "marcador", datos: hitM.object.userData.marcador as MarcadorWGL, punto: hitM.point.clone() };
    }
    const hitG = ray.intersectObject(this.tierra, false)[0];
    if (hitG) return { tipo: "globo", punto: hitG.point.clone() };
    return { tipo: "nada" };
  }

  proyectar(p: THREE.Vector3): { x: number; y: number } {
    const v = p.clone().project(this.camara);
    return {
      x: ((v.x + 1) / 2) * window.innerWidth,
      y: ((1 - v.y) / 2) * window.innerHeight,
    };
  }

  // ── EL CORAZÓN — un solo rAF para todo el mundo ──
  loop = () => {
    if (!this.vivo) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.reloj.getDelta());
    const t = this.reloj.elapsedTime;

    // REGLA 6: el globo JAMÁS deja de girar y respirar
    this.mundo.rotation.y += dt * 0.05;
    const brillo = 1 + Math.sin(t * 0.85) * this.respiro + (this.invitando ? Math.sin(t * 2.6) * 0.006 : 0);
    this.tierra.scale.setScalar(brillo);
    this.atmosfera.scale.setScalar(brillo);

    // marcadores: pulso por fases (el anillo exhala)
    for (const m of this.marcadores) {
      const s = 1 + Math.sin(t * 2 + m.fase) * 0.22;
      m.anillo.scale.setScalar(s);
      const nm = m.nucleo.material as THREE.MeshBasicMaterial;
      if (nm.opacity > 0.5) m.nucleo.position.setZ(0.004 + Math.sin(t * 3 + m.fase) * 0.004);
    }
    if (this.particulasOro.visible) this.particulasOro.rotation.y += dt * 0.06;
    if (this.particulasAzul.visible) this.particulasAzul.rotation.y -= dt * 0.05;
    this.estrellas.rotation.y += dt * 0.0035;

    // PARALLAX de paneles: la cámara cuenta dónde está — CSS vars
    const tgt = ZONA_TGT[this.zona] ?? [0, 0, 0];
    const cx = Math.max(-1, Math.min(1, (this.camara.position.x - tgt[0]) / 3.4));
    const cy = Math.max(-1, Math.min(1, (this.camara.position.y - tgt[1]) / 3.4));
    const st = document.documentElement.style;
    const px = parseFloat(st.getPropertyValue("--wgl-cx") || "0");
    const py = parseFloat(st.getPropertyValue("--wgl-cy") || "0");
    if (Math.abs(px - cx) > 0.003) st.setProperty("--wgl-cx", cx.toFixed(3));
    if (Math.abs(py - cy) > 0.003) st.setProperty("--wgl-cy", cy.toFixed(3));

    this.renderer.render(this.escena, this.camara);
  };

  redimensionar() {
    this.camara.aspect = window.innerWidth / window.innerHeight;
    this.camara.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  dormir() { this.vivo = false; cancelAnimationFrame(this.raf); }
  despertar() { if (!this.vivo) { this.vivo = true; this.reloj.getDelta(); this.loop(); } }
  destruir() {
    this.dormir();
    for (const c of this.cancelar) c();
    this.renderer.dispose();
  }
}

// ────────────────────────────────────────────────────────────
// EL COMPONENTE — canvas fijo del mundo + secuencia de entrada
// + popup de conflicto + sincronía con la Casa (page.tsx)
// ────────────────────────────────────────────────────────────
const LLAVE_ENTRADA = "vg-wgl-entrada-v1";

type Fase = "negro" | "estrellas" | "globo" | "marcadores" | "logo" | "tagline" | "hint" | "volando" | "fin";

export function MundoWebGL({ tabInicial }: { tabInicial?: string }) {
  const lienzoRef = useRef<HTMLCanvasElement>(null);
  const mundoRef = useRef<MundoWGL | null>(null);
  const [fase, setFase] = useState<Fase>("negro");
  const [soporte, setSoporte] = useState<boolean | null>(null); // null = verificando
  const [escrito, setEscrito] = useState("");
  const [popup, setPopup] = useState<{ x: number; y: number; m: MarcadorWGL } | null>(null);
  const tiempos = useRef<number[]>([]);
  const TAGLINE = "El mundo no espera. Tú tampoco.";

  const despues = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    tiempos.current.push(id);
    return id;
  }, []);

  // ── MONTAJE: soporte WebGL → mundo o fallback (IntroCinematica v72) ──
  useEffect(() => {
    let mundo: MundoWGL | null = null;
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      setSoporte(!!gl);
      if (!gl) return;
    } catch {
      setSoporte(false);
      return;
    }
    if (!lienzoRef.current) return;
    const calidadBaja =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    mundo = new MundoWGL({ lienzo: lienzoRef.current, calidadBaja });
    mundoRef.current = mundo;
    document.documentElement.setAttribute("data-wgl", "on");
    // puerta de QA (y de curiosos): el mundo examinable desde la consola
    (window as unknown as { __vgMundo?: MundoWGL }).__vgMundo = mundo;

    const onResize = () => mundo?.redimensionar();
    const onVis = () => (document.hidden ? mundo?.dormir() : mundo?.despertar());
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    // EL TOQUE — window-level: los paneles HTML jamás roban el mundo
    const onToque = (e: PointerEvent) => {
      if (!mundoRef.current) return;
      const el = e.target as HTMLElement | null;
      if (el && typeof el.closest === "function" && el.closest("button,a,input,textarea,select,[role=button],[data-wgl-panel]")) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      const g = mundoRef.current.golpear(nx, ny, false);
      if (g.tipo === "marcador" && g.datos && g.punto) {
        // CONFLICTO TOCADO: destello 2x + popup mínimo + vuelo al Command Center
        const { datos: m, punto } = g;
        try { sessionStorage.setItem("vg-wgl-conflicto", m.id); } catch {}
        window.dispatchEvent(new CustomEvent("vg:wgl-conflicto", { detail: m }));
        const p = mundoRef.current.proyectar(punto);
        setPopup({ x: p.x, y: p.y, m });
        window.setTimeout(() => setPopup(null), 3600);
        if (mundoRef.current.zona !== 0) {
          mundoRef.current.volarAZona(2);
          document.documentElement.setAttribute("data-wgl-zona", "2");
        } else {
          // primera vez: entrar + volar (la entrada vive en Zona 0)
          mundoRef.current.zona = 1;
          mundoRef.current.volarAZona(2);
          document.documentElement.setAttribute("data-wgl-zona", "2");
        }
        sonar("ping");
      } else if (g.tipo === "globo" && document.documentElement.getAttribute("data-wgl-entrada") === "1") {
        entrar();
      }
    };
    window.addEventListener("pointerdown", onToque, { passive: true });

    // vuelos pedidos por la Casa (navbar / cambios de tab)
    const onIr = (e: Event) => {
      const z = (e as CustomEvent).detail?.zona;
      if (typeof z !== "number" || !mundoRef.current) return;
      if (document.documentElement.getAttribute("data-wgl-entrada") === "1") return;
      mundoRef.current.volarAZona(z);
      document.documentElement.setAttribute("data-wgl-zona", String(z));
      sonar("whoosh");
    };
    window.addEventListener("vg:wgl-ir-a", onIr);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerdown", onToque);
      window.removeEventListener("vg:wgl-ir-a", onIr);
      for (const id of tiempos.current) clearTimeout(id);
      mundo?.destruir();
      document.documentElement.removeAttribute("data-wgl");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── LA SECUENCIA DE ENTRADA (segundo a segundo, mandato exacto) ──
  useEffect(() => {
    if (soporte !== true) return;
    let yaViva = false;
    try { yaViva = sessionStorage.getItem(LLAVE_ENTRADA) === "1"; } catch {}
    if (yaViva) {
      // REENCUENTRO: el mundo espera en la zona de la sala restaurada
      const z = (tabInicial && TAB_ZONA[tabInicial]) || 1;
      document.documentElement.setAttribute("data-wgl-entrada", "0");
      document.documentElement.setAttribute("data-wgl-zona", String(z));
      setFase("fin");
      mundoRef.current?.reencuentro(z);
      return;
    }
    document.documentElement.setAttribute("data-wgl-entrada", "1");
    const T = (s: number) => s * 1000;
    despues(T(1.0), () => { setFase("estrellas"); mundoRef.current?.nacerEstrellas(); });
    despues(T(2.0), () => { setFase("globo"); mundoRef.current?.subirGlobo(); });
    despues(T(3.2), () => {
      setFase("marcadores");
      mundoRef.current?.encenderMarcadores(() => sonar("onda"));
    });
    despues(T(4.4), () => setFase("logo"));
    despues(T(5.4), () => setFase("tagline"));
    despues(T(6.4), () => { setFase("hint"); mundoRef.current?.invitar(); });
    return () => { for (const id of tiempos.current) clearTimeout(id); tiempos.current = []; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soporte]);

  // typewriter del tagline (40ms/glifo)
  useEffect(() => {
    if (fase !== "tagline" && fase !== "hint") return;
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setEscrito(TAGLINE.slice(0, i));
      if (i >= TAGLINE.length) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [fase]);

  const entrar = useCallback(() => {
    if (fase === "volando" || fase === "fin") return;
    setFase("volando");
    sonar("whoosh");
    const m = mundoRef.current;
    if (m) {
      m.invitando = false;
      m.respiro = 0.006;
      // OJO: NO asignar m.zona aquí — volarAZona lo hace y su guard
      // (zona === this.zona) cancelaría el vuelo (bug cazado en QA)
      m.volarAZona(1);
    }
    document.documentElement.setAttribute("data-wgl-zona", "1");
    despues(500, () => {
      try { sessionStorage.setItem(LLAVE_ENTRADA, "1"); } catch {}
      document.documentElement.setAttribute("data-wgl-entrada", "0");
      window.dispatchEvent(new CustomEvent("vg:wgl-entrada-fin"));
    });
    despues(1250, () => setFase("fin"));
  }, [fase, despues]);

  // ── SIN WEBGL: la Casa vuelve a su intro cinematográfica v72 ──
  if (soporte === false) return <IntroFallback />;
  if (soporte === null) return <canvas ref={lienzoRef} className="vg140-lienzo" aria-hidden />;

  return (
    <>
      <canvas ref={lienzoRef} className="vg140-lienzo" aria-hidden />
      {/* EL TINTE DE ZONA — atmósfera por sala (Arena dorada, Cuartel azul) */}
      <div className="vg140-tinte" aria-hidden />
      {/* EL WARP — hipervelocidad suave durante el vuelo (REGLA 2) */}
      <div className="vg140-warp" aria-hidden />
      {/* LA ENTRADA — negro → estrellas → globo → conflictos → logo → tagline → hint */}
      {fase !== "fin" && (
        <div className="vg140-entrada" data-fase={fase} aria-hidden>
          <div className="vg140-negro" />
          <div className="vg140-estrellas-dom" aria-hidden>
            <i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
          </div>
          <div className="vg140-marca" data-visible={fase === "logo" || fase === "tagline" || fase === "hint" ? "1" : "0"}>
            <h1 className="vg140-logo" aria-label="VANGUARD">
              {"VANGUARD".split("").map((ch, i) => (
                <span key={i} style={{ ["--gi" as string]: `${i * 100}ms` }}>{ch}</span>
              ))}
            </h1>
            <p className="vg140-tagline">
              {escrito}
              <span className="vg140-cursor" aria-hidden />
            </p>
            <button
              type="button"
              className="vg140-hint"
              onClick={entrar}
              data-visible={fase === "hint" ? "1" : "0"}
            >
              Toca el globo para entrar
            </button>
          </div>
        </div>
      )}
      {/* POPUP MÍNIMO del conflicto tocado — nombre + intensidad, junto al punto */}
      {popup && (
        <div className="vg140-popup" style={{ left: popup.x, top: popup.y }} data-wgl-panel>
          <strong>{popup.m.nombre}</strong>
          <span>{popup.m.sub}</span>
          <em>{popup.m.intensidad >= 80 ? "GRAVE" : popup.m.intensidad >= 55 ? "ALTA" : "MEDIA"} · la cámara vuela al Command Center</em>
        </div>
      )}
    </>
  );
}

// fallback honesto: sin WebGL la Casa no se rompe (REGLA 5 del mundo)
function IntroFallback() {
  const [Comp, setComp] = useState<React.ComponentType | null>(null);
  useEffect(() => {
    let vivo = true;
    import("@/components/vanguard/intro-cinematica").then((m) => {
      if (vivo) setComp(() => m.IntroCinematica);
    });
    return () => { vivo = false; };
  }, []);
  return Comp ? <Comp /> : null;
}

// ────────────────────────────────────────────────────────────
// SONIDO MÍNIMO — Web Audio: ping de conflicto, whoosh de vuelo,
// onda del teatro grave. Todo try/catch: sin audio la Casa sigue.
// ────────────────────────────────────────────────────────────
let ctxAudio: AudioContext | null = null;
function sonar(tipo: "ping" | "whoosh" | "onda") {
  try {
    ctxAudio = ctxAudio || new (window.AudioContext || (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (!ctxAudio || ctxAudio.state === "suspended") return;
    const t = ctxAudio.currentTime;
    const g = ctxAudio.createGain();
    g.connect(ctxAudio.destination);
    if (tipo === "whoosh") {
      const o = ctxAudio.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(420, t + 0.5);
      o.frequency.exponentialRampToValueAtTime(90, t + 1.1);
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);
      o.connect(g); o.start(t); o.stop(t + 1.2);
    } else {
      const o = ctxAudio.createOscillator();
      o.type = tipo === "onda" ? "triangle" : "sine";
      o.frequency.setValueAtTime(tipo === "onda" ? 70 : 660, t);
      if (tipo === "ping") o.frequency.exponentialRampToValueAtTime(990, t + 0.14);
      g.gain.setValueAtTime(tipo === "onda" ? 0.09 : 0.06, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (tipo === "onda" ? 0.8 : 0.3));
      o.connect(g); o.start(t); o.stop(t + 0.9);
    }
  } catch { /* silencio honesto */ }
}

// ────────────────────────────────────────────────────────────
// EL NAVBAR DE ZONAS — los ÚNICOS 4 íconos siempre visibles.
// Sin menús, sin hamburguesas: la navegación es vuelo de cámara.
// ────────────────────────────────────────────────────────────
const ICONOS: Record<number, React.ReactNode> = {
  1: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  ),
  2: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M7 20h10M12 16v4M7 9l3 3 4-5 3 3" />
    </svg>
  ),
  3: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M6 9.5 4 12l2 2.5M18 9.5 20 12l-2 2.5" />
      <rect x="8" y="7" width="8" height="10" rx="1.5" />
      <path d="M10.5 11h3M10.5 14h3" />
    </svg>
  ),
  4: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c1.2-3.8 4-5.6 7.5-5.6S18.3 16.2 19.5 20" />
    </svg>
  ),
};
const NOMBRES_ZONA: Record<number, string> = { 1: "HOY", 2: "ANÁLISIS", 3: "ARENA", 4: "CUARTEL" };

export function NavZonas({ zona, onIr }: { zona: number; onIr: (z: number) => void }) {
  return (
    <nav className="vg140-nav" aria-label="Zonas del mundo VANGUARD">
      {[1, 2, 3, 4].map((z) => (
        <button
          key={z}
          type="button"
          className="vg140-nav-btn"
          data-activa={zona === z ? "1" : "0"}
          onClick={() => onIr(z)}
          aria-label={`Volar a la zona ${NOMBRES_ZONA[z]}`}
        >
          {ICONOS[z]}
          <span>{NOMBRES_ZONA[z]}</span>
        </button>
      ))}
    </nav>
  );
}
