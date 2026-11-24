// ═══════════════════════════════════════════════════════════════════
// v444.0 · EL MUNDO MUERTO — la escena del esqueleto (three.js puro)
//
// Sin React a propósito: la monta un componente cliente con import()
// para que three solo viaje al navegador cuando hace falta, y la misma
// pieza se puede probar sola en un HTML.
//
// · Modelo: esqueleto adulto completo de Innerscene (CC0), 238 huesos
//   con nombre anatómico (`anatomical_id`), comprimido con meshopt y
//   texturas WebP a 1K (≈2,5 MB, /mundo-muerto/esqueleto.glb).
// · Cada hueso pertenece a una ZONA (lib/mundo-muerto/modulos.ts). Al
//   pasar o tocar un hueso se ilumina toda su zona y se abre su módulo.
// · Etiquetas de lámina anatómica: un punto sobre el hueso y una línea
//   hasta su rótulo, repartidos a los lados sin pisarse.
// · Cuidado del aparato: píxeles ≤1,75×, pausa fuera de pantalla o con
//   la pestaña oculta, sin sombras, movimiento reducido si se pide.
// ═══════════════════════════════════════════════════════════════════
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { ZONAS, type ZonaId } from "@/lib/mundo-muerto/modulos";

export interface MarcaEscena {
  id: string;
  zona: ZonaId;
  numero: number;
  etiqueta: string;
  hueso: string;
  color: string;
}

export interface OpcionesEscena {
  url: string;
  marcas: MarcaEscena[];
  alSeleccionar: (id: string | null) => void;
  alProgreso?: (p: number) => void;
  alListo?: () => void;
  alError?: (e: unknown) => void;
  reducido?: boolean;
}

export interface Escena {
  enfocar: (id: string | null) => void;
  destruir: () => void;
}

/** Huesos que fijan el ancla de cada zona (para que los puntos no se amontonen en el eje). */
const ANCLAS: Partial<Record<ZonaId, RegExp>> = {
  hombros: /^R_clavicle$/,
  brazos: /^L_humerus$/,
  manos: /^R_(metacarpal_III|capitate)$/,
  costillas: /^rib_left_0[5-7]$/,
  toracicas: /^vertebra_T(6|7|8)$/,
  lumbares: /^vertebra_L(2|3)$/,
  piernas: /^L_(femur)$/,
  pies: /^R_(navicular|metatarsal_II|medial_cuneiform)$/,
  pelvis: /^(hip_bone_right|sacrum)$/,
};
/** Zonas que se miran mejor desde la espalda. */
const DE_ESPALDA: ZonaId[] = ["cervicales", "toracicas", "lumbares"];

interface ZonaViva {
  id: ZonaId;
  mallas: THREE.Mesh[];
  mats: THREE.MeshStandardMaterial[];
  centro: THREE.Vector3;
  ancla: THREE.Vector3;
  tam: number;
  normal: THREE.Vector3;
  color: THREE.Color;
  marca?: MarcaEscena;
  brillo: number;
  /** 1 = color propio; baja cuando se elige otra zona */
  luz: number;
  base: THREE.Color[];
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function montarEsqueleto(cont: HTMLElement, op: OpcionesEscena): Escena {
  const reducido = !!op.reducido;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  let vivo = true;

  // ── renderer
  const renderer = new THREE.WebGLRenderer({ antialias: dpr < 1.5, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.domElement.className = "mm-lienzo";
  cont.appendChild(renderer.domElement);

  // ── capa de rótulos
  const capa = document.createElement("div");
  capa.className = "mm-capa";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "mm-lineas");
  capa.appendChild(svg);
  cont.appendChild(capa);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x040203, 0.12);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 40);
  const CASA = { pos: new THREE.Vector3(0.5, 1.08, 3.5), tgt: new THREE.Vector3(0, 0.89, 0) };
  camera.position.set(0.9, 0.6, 7.5);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(CASA.tgt);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 0.55;
  controls.maxDistance = 5.2;
  controls.minPolarAngle = 0.25;
  controls.maxPolarAngle = Math.PI * 0.62;
  controls.rotateSpeed = 0.7;
  controls.zoomSpeed = 0.8;
  controls.autoRotateSpeed = 0.55;
  controls.autoRotate = false;

  // ── luz: sala oscura, foco de morgue, contraluz de sangre
  const hemi = new THREE.HemisphereLight(0x8d9bb5, 0x140707, 0.45);
  const clave = new THREE.DirectionalLight(0xfff0dc, 2.4);
  clave.position.set(1.8, 3.6, 2.6);
  const contra = new THREE.DirectionalLight(0xff2a1a, 2.6);
  contra.position.set(-1.6, 2.2, -2.8);
  const relleno = new THREE.DirectionalLight(0x4c6bff, 0.55);
  relleno.position.set(-3, 1.2, 1.2);
  const brasa = new THREE.PointLight(0xff3a22, 2.2, 3.2, 2);
  brasa.position.set(0, 0.06, 0.45);
  scene.add(hemi, clave, contra, relleno, brasa);
  const intensidades = [hemi, clave, contra, relleno, brasa].map((l) => l.intensity);

  // ── suelo que se pierde en la oscuridad
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const cx = cv.getContext("2d")!;
  const g = cx.createRadialGradient(128, 128, 4, 128, 128, 128);
  g.addColorStop(0, "rgba(70,18,16,1)");
  g.addColorStop(0.35, "rgba(26,10,10,0.9)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  cx.fillStyle = g;
  cx.fillRect(0, 0, 256, 256);
  const texSuelo = new THREE.CanvasTexture(cv);
  texSuelo.colorSpace = THREE.SRGBColorSpace;
  const suelo = new THREE.Mesh(
    new THREE.CircleGeometry(2.6, 64),
    new THREE.MeshBasicMaterial({ map: texSuelo, transparent: true, depthWrite: false }),
  );
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.y = -0.002;
  scene.add(suelo);

  // ── ceniza que flota
  const N = window.innerWidth < 700 ? 260 : 520;
  const pos = new Float32Array(N * 3);
  const vel = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = 0.3 + Math.random() * 2.2;
    const a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.random() * 2.8;
    pos[i * 3 + 2] = Math.sin(a) * r;
    vel[i] = 0.02 + Math.random() * 0.05;
  }
  const geoCeniza = new THREE.BufferGeometry();
  geoCeniza.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const matCeniza = new THREE.PointsMaterial({ color: 0xc9bfae, size: 0.011, transparent: true, opacity: 0.55, depthWrite: false });
  const ceniza = new THREE.Points(geoCeniza, matCeniza);
  scene.add(ceniza);

  // ── estado
  const zonas = new Map<ZonaId, ZonaViva>();
  const mallas: THREE.Mesh[] = [];
  const zonaDeMalla = new Map<THREE.Object3D, ZonaId>();
  const marcaPorId = new Map(op.marcas.map((m) => [m.id, m]));
  const botones = new Map<ZonaId, { btn: HTMLButtonElement; punto: HTMLSpanElement; linea: SVGLineElement }>();
  let sobre: ZonaId | null = null;
  let elegida: ZonaId | null = null;
  let listo = false;
  let visible = true;
  let tIntro = reducido ? 1 : 0;
  let inicioIntro = 0;
  let ultimoGesto = performance.now();
  let tween: null | { inicio: number; t: number; dur: number; p0: THREE.Vector3; p1: THREE.Vector3; t0: THREE.Vector3; t1: THREE.Vector3 } = null;

  const regex = Object.fromEntries(Object.entries(ZONAS).map(([k, v]) => [k, new RegExp(v)])) as Record<ZonaId, RegExp>;
  const zonaDe = (aid: string): ZonaId | null => {
    for (const k of Object.keys(regex) as ZonaId[]) if (regex[k].test(aid)) return k;
    return null;
  };

  // ── rótulos
  for (const m of op.marcas) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mm-et";
    btn.style.setProperty("--c", m.color);
    btn.setAttribute("aria-label", `${m.hueso}: ${m.etiqueta}`);
    btn.innerHTML = `<span class="mm-et-n">${String(m.numero).padStart(2, "0")}</span><span class="mm-et-t"><b>${m.etiqueta}</b><i>${m.hueso}</i></span>`;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      seleccionar(m.zona, true);
    });
    btn.addEventListener("pointerenter", () => marcarSobre(m.zona));
    btn.addEventListener("pointerleave", () => marcarSobre(null));
    const punto = document.createElement("span");
    punto.className = "mm-punto";
    punto.style.setProperty("--c", m.color);
    const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
    linea.setAttribute("stroke", m.color);
    svg.appendChild(linea);
    capa.appendChild(punto);
    capa.appendChild(btn);
    botones.set(m.zona, { btn, punto, linea });
  }

  // ── carga del modelo
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    op.url,
    (gltf) => {
      if (!vivo) return;
      const modelo = gltf.scene;
      // de pie, centrado y con los pies en el suelo
      const caja = new THREE.Box3().setFromObject(modelo);
      const tam = caja.getSize(new THREE.Vector3());
      if (tam.z > tam.y * 1.5) modelo.rotation.x = -Math.PI / 2;
      modelo.updateMatrixWorld(true);
      caja.setFromObject(modelo);
      const c = caja.getCenter(new THREE.Vector3());
      modelo.position.set(-c.x, -caja.min.y, -c.z);
      modelo.updateMatrixWorld(true);
      scene.add(modelo);

      const clones = new Map<string, THREE.MeshStandardMaterial>();
      modelo.traverse((o) => {
        const malla = o as THREE.Mesh;
        if (!malla.isMesh) return;
        const aid = String((malla.userData && malla.userData.anatomical_id) || (malla.parent && malla.parent.userData.anatomical_id) || "");
        const z = zonaDe(aid);
        if (!z) return;
        const base = malla.material as THREE.MeshStandardMaterial;
        const clave = `${z}:${base.uuid}`;
        let mat = clones.get(clave);
        if (!mat) {
          mat = base.clone();
          mat.emissive = new THREE.Color(0x000000);
          mat.emissiveIntensity = 1;
          mat.roughness = Math.min(1, (mat.roughness ?? 0.6) + 0.12);
          clones.set(clave, mat);
        }
        malla.material = mat;
        mallas.push(malla);
        zonaDeMalla.set(malla, z);
        let zv = zonas.get(z);
        if (!zv) {
          const marca = op.marcas.find((m) => m.zona === z);
          zv = {
            id: z,
            mallas: [],
            mats: [],
            centro: new THREE.Vector3(),
            ancla: new THREE.Vector3(),
            tam: 0.3,
            normal: new THREE.Vector3(0, 0, 1),
            color: new THREE.Color(marca ? marca.color : "#ffffff"),
            marca,
            brillo: 0,
            luz: 1,
            base: [],
          };
          zonas.set(z, zv);
        }
        zv.mallas.push(malla);
        if (!zv.mats.includes(mat)) {
          zv.mats.push(mat);
          zv.base.push(mat.color.clone());
        }
      });

      for (const zv of zonas.values()) {
        const bz = new THREE.Box3();
        const ba = new THREE.Box3();
        const re = ANCLAS[zv.id];
        for (const m of zv.mallas) {
          bz.expandByObject(m);
          const aid = String(m.userData.anatomical_id || "");
          if (re && re.test(aid)) ba.expandByObject(m);
        }
        bz.getCenter(zv.centro);
        const s = bz.getSize(new THREE.Vector3());
        zv.tam = Math.max(s.x, s.y, s.z);
        if (ba.isEmpty()) zv.ancla.copy(zv.centro);
        else ba.getCenter(zv.ancla);
        if (zv.id === "craneo") zv.ancla.y += s.y * 0.18;
        if (zv.id === "mandibula") zv.ancla.z = bz.max.z - 0.01;
        if (zv.id === "esternon") zv.ancla.z = bz.max.z;
        if (DE_ESPALDA.includes(zv.id)) zv.normal.set(0, 0, -1);
        else {
          zv.normal.set(zv.ancla.x, 0, zv.ancla.z + 0.12).normalize();
          if (zv.normal.lengthSq() < 0.01) zv.normal.set(0, 0, 1);
        }
      }
      listo = true;
      op.alProgreso?.(1);
      op.alListo?.();
    },
    (ev) => {
      if (ev.lengthComputable && ev.total > 0) op.alProgreso?.(Math.min(0.99, ev.loaded / ev.total));
    },
    (err) => op.alError?.(err),
  );

  // ── selección y paso del puntero
  function marcarSobre(z: ZonaId | null) {
    sobre = z;
    for (const [k, b] of botones) b.btn.classList.toggle("sobre", k === z);
    renderer.domElement.style.cursor = z ? "pointer" : "grab";
  }

  function volar(pos1: THREE.Vector3, tgt1: THREE.Vector3) {
    if (reducido) {
      camera.position.copy(pos1);
      controls.target.copy(tgt1);
      return;
    }
    tween = { inicio: performance.now(), t: 0, dur: 1.15, p0: camera.position.clone(), p1: pos1, t0: controls.target.clone(), t1: tgt1 };
  }

  function seleccionar(z: ZonaId | null, avisar: boolean) {
    elegida = z;
    for (const [k, b] of botones) b.btn.classList.toggle("elegida", k === z);
    cont.classList.toggle("mm-hay-eleccion", !!z);
    controls.autoRotate = false;
    ultimoGesto = performance.now();
    if (z && zonas.has(z)) {
      const zv = zonas.get(z)!;
      const tgt = zv.centro.clone();
      if (zv.id === "pies" || zv.id === "manos" || zv.id === "brazos" || zv.id === "piernas" || zv.id === "hombros") tgt.lerp(zv.ancla, 0.6);
      const dist = THREE.MathUtils.clamp(zv.tam * 2.4, 0.75, 2.6);
      const dirActual = camera.position.clone().sub(controls.target).normalize();
      let dir = dirActual.clone();
      if (dirActual.dot(zv.normal) < 0.15) dir = zv.normal.clone().multiplyScalar(0.85).add(new THREE.Vector3(0, 0.25, 0)).normalize();
      dir.y = THREE.MathUtils.clamp(dir.y, -0.15, 0.55);
      dir.normalize();
      volar(tgt.clone().add(dir.multiplyScalar(dist)), tgt);
    } else if (!z) {
      volar(CASA.pos.clone(), CASA.tgt.clone());
    }
    if (avisar) {
      const marca = z ? op.marcas.find((m) => m.zona === z) : undefined;
      op.alSeleccionar(marca ? marca.id : null);
    }
  }

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let pendiente: PointerEvent | null = null;
  let bajada: { x: number; y: number; t: number } | null = null;

  function elegirEn(ev: { clientX: number; clientY: number }): ZonaId | null {
    if (!listo) return null;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(mallas, false);
    return hits.length ? zonaDeMalla.get(hits[0].object) ?? null : null;
  }
  const onMove = (ev: PointerEvent) => {
    if (ev.pointerType === "mouse") pendiente = ev;
  };
  const onDown = (ev: PointerEvent) => {
    bajada = { x: ev.clientX, y: ev.clientY, t: performance.now() };
    ultimoGesto = performance.now();
    controls.autoRotate = false;
    tween = null;
  };
  const onUp = (ev: PointerEvent) => {
    if (!bajada) return;
    const d = Math.hypot(ev.clientX - bajada.x, ev.clientY - bajada.y);
    const dt = performance.now() - bajada.t;
    bajada = null;
    if (d < 7 && dt < 600) {
      const z = elegirEn(ev);
      if (z) seleccionar(z, true);
    }
  };
  const onLeave = () => marcarSobre(null);
  renderer.domElement.addEventListener("pointermove", onMove);
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointerup", onUp);
  renderer.domElement.addEventListener("pointerleave", onLeave);
  controls.addEventListener("start", () => {
    ultimoGesto = performance.now();
    tween = null;
  });

  // ── tamaño y visibilidad
  let W = 1;
  let H = 1;
  const medir = () => {
    W = Math.max(1, cont.clientWidth);
    H = Math.max(1, cont.clientHeight);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    // en vertical, alejar para que quepa el cuerpo entero
    camera.fov = W / H < 0.75 ? 34 : 30;
    camera.updateProjectionMatrix();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  };
  medir();
  const ro = new ResizeObserver(medir);
  ro.observe(cont);
  const io = new IntersectionObserver((e) => (visible = e[0]?.isIntersecting ?? true), { threshold: 0.01 });
  io.observe(cont);

  // ── rótulos: proyectar anclas y repartir a los lados
  const v = new THREE.Vector3();
  const aCam = new THREE.Vector3();
  function colocarRotulos() {
    const estrecho = W < 640;
    const items: { z: ZonaId; x: number; y: number; lado: 0 | 1; vis: number }[] = [];
    for (const zv of zonas.values()) {
      if (!botones.has(zv.id)) continue;
      v.copy(zv.ancla).project(camera);
      const x = (v.x * 0.5 + 0.5) * W;
      const y = (-v.y * 0.5 + 0.5) * H;
      aCam.copy(camera.position).sub(zv.ancla).normalize();
      const cara = DE_ESPALDA.includes(zv.id) ? 1 : THREE.MathUtils.clamp(0.35 + aCam.dot(zv.normal) * 0.9, 0.25, 1);
      const dentro = v.z < 1 && x > -40 && x < W + 40 && y > -40 && y < H + 40;
      items.push({ z: zv.id, x, y, lado: x < W / 2 ? 0 : 1, vis: dentro ? cara : 0 });
    }
    const alto = estrecho ? 30 : 38;
    const margenSup = estrecho ? 54 : 18;
    const margenInf = estrecho ? 12 : 18;
    for (const lado of [0, 1] as const) {
      const fila = items.filter((i) => i.lado === lado && i.vis > 0).sort((a, b) => a.y - b.y);
      const ys = fila.map((i) => i.y);
      for (let i = 0; i < ys.length; i++) ys[i] = Math.max(ys[i], i ? ys[i - 1] + alto : margenSup);
      const exceso = ys.length ? ys[ys.length - 1] - (H - margenInf) : 0;
      if (exceso > 0) {
        for (let i = ys.length - 1; i >= 0; i--) {
          ys[i] -= exceso;
          if (i < ys.length - 1) ys[i] = Math.min(ys[i], ys[i + 1] - alto);
        }
        for (let i = 0; i < ys.length; i++) ys[i] = Math.max(ys[i], i ? ys[i - 1] + alto * 0.92 : 4);
      }
      fila.forEach((it, i) => {
        const b = botones.get(it.z)!;
        const ly = ys[i];
        const bw = b.btn.offsetWidth || 120;
        const lx = lado === 0 ? 10 : W - 10 - bw;
        b.btn.style.transform = `translate(${lx.toFixed(1)}px, ${(ly - 14).toFixed(1)}px)`;
        b.btn.style.opacity = String(it.vis < 0.4 ? 0.55 : 1);
        b.btn.style.visibility = "visible";
        b.punto.style.transform = `translate(${it.x.toFixed(1)}px, ${it.y.toFixed(1)}px)`;
        b.punto.style.opacity = String(it.vis);
        b.punto.style.visibility = "visible";
        const x2 = lado === 0 ? lx + bw : lx;
        b.linea.setAttribute("x1", it.x.toFixed(1));
        b.linea.setAttribute("y1", it.y.toFixed(1));
        b.linea.setAttribute("x2", x2.toFixed(1));
        b.linea.setAttribute("y2", ly.toFixed(1));
        b.linea.setAttribute("opacity", String((elegida === it.z || sobre === it.z ? 0.95 : 0.38) * it.vis));
      });
    }
    for (const it of items) {
      if (it.vis > 0) continue;
      const b = botones.get(it.z)!;
      b.btn.style.visibility = "hidden";
      b.punto.style.visibility = "hidden";
      b.linea.setAttribute("opacity", "0");
    }
  }

  // ── bucle
  // tiempo real (no por fotograma): en un aparato lento la entrada y los
  // vuelos duran lo mismo, solo con menos fotogramas
  let antes = performance.now();
  let acumulado = 0;
  renderer.setAnimationLoop(() => {
    if (!vivo) return;
    const ahora = performance.now();
    const dt = Math.min(0.1, (ahora - antes) / 1000);
    antes = ahora;
    if (!visible || document.hidden) return;
    acumulado += dt;

    // entrada: la sala se enciende y la cámara se acerca
    if (tIntro < 1) {
      if (listo && !inicioIntro) inicioIntro = ahora;
      tIntro = listo ? Math.min(1, (ahora - inicioIntro) / 2600) : 0;
      const k = easeInOut(tIntro);
      if (listo) {
        camera.position.lerpVectors(new THREE.Vector3(0.9, 0.6, 7.5), CASA.pos, k);
        controls.target.copy(CASA.tgt);
      }
      [hemi, clave, contra, relleno, brasa].forEach((l, i) => (l.intensity = intensidades[i] * (listo ? k : 0.15)));
      if (tIntro >= 1) ultimoGesto = performance.now();
    }

    if (tween) {
      tween.t = Math.min(1, (ahora - tween.inicio) / 1000 / tween.dur);
      const k = easeInOut(tween.t);
      camera.position.lerpVectors(tween.p0, tween.p1, k);
      controls.target.lerpVectors(tween.t0, tween.t1, k);
      if (tween.t >= 1) tween = null;
    }

    if (!reducido && listo && tIntro >= 1 && !elegida && !tween && performance.now() - ultimoGesto > 7000) controls.autoRotate = true;
    controls.update();

    if (pendiente) {
      marcarSobre(elegirEn(pendiente));
      pendiente = null;
    }

    // las luces viajan con la mirada: el foco siempre delante, la sangre siempre detrás
    const az = Math.atan2(camera.position.x - controls.target.x, camera.position.z - controls.target.z);
    const cs = Math.cos(az);
    const sn = Math.sin(az);
    const giro = (l: THREE.Light, x: number, y: number, z: number) => l.position.set(x * cs + z * sn, y, -x * sn + z * cs);
    giro(clave, 1.8, 3.6, 2.6);
    giro(contra, -1.6, 2.2, -2.8);
    giro(relleno, -3, 1.2, 1.2);

    // brillo de zonas; al elegir una, las demás se hunden en la sombra
    for (const zv of zonas.values()) {
      const meta = zv.id === elegida ? 0.55 + (reducido ? 0 : Math.sin(acumulado * 3.2) * 0.15) : zv.id === sobre ? 0.32 : 0;
      zv.brillo += (meta - zv.brillo) * Math.min(1, dt * 8);
      const metaLuz = elegida && zv.id !== elegida ? 0.38 : 1;
      zv.luz += (metaLuz - zv.luz) * Math.min(1, dt * 5);
      zv.mats.forEach((m, k) => {
        m.emissive.copy(zv.color).multiplyScalar(zv.brillo);
        m.color.copy(zv.base[k]).multiplyScalar(zv.luz);
      });
    }

    // ceniza
    if (!reducido) {
      const p = geoCeniza.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < N; i++) {
        let y = p.getY(i) + vel[i] * dt;
        if (y > 2.9) y = 0;
        p.setY(i, y);
      }
      p.needsUpdate = true;
      ceniza.rotation.y += dt * 0.02;
    }
    brasa.intensity = (listo ? intensidades[4] : 0.3) * (reducido ? 1 : 0.85 + Math.sin(acumulado * 1.7) * 0.15) * (tIntro < 1 ? easeInOut(tIntro) : 1);

    renderer.render(scene, camera);
    if (listo) colocarRotulos();
  });

  return {
    enfocar(id) {
      if (!id) return seleccionar(null, false);
      const m = marcaPorId.get(id);
      if (m) seleccionar(m.zona, false);
    },
    destruir() {
      vivo = false;
      renderer.setAnimationLoop(null);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
      texSuelo.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      capa.remove();
    },
  };
}
