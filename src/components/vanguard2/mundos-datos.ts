"use client";

// ============================================================
// VANGUARD-2 · MUNDOS DE DATOS (parte 1) — NOTICIAS, QUIZ,
// ENCUESTAS, PERFIL. Datos reales, letras 3D, cero DOM.
// Patrón: pintar() reconstruye el grupo dinámico con dispose
// limpio; __fuente_lista__ repinta cuando la typeface llega.
// ============================================================
import * as THREE from "three";
import { type MotorV2, type MundoV2, acotar } from "./motor";
import { baseMundo, type BaseMundo } from "./mundos";
import { QUIZ_QUESTIONS, PREDICTION_MARKETS, RANKS, getRankForLevel, type AchievementState } from "@/lib/game-data";
import { leerLedger, mutarLedger, xpANivel, xpParaSiguiente, leerEstadoOriginal, type LedgerV2 } from "./progreso";

/** Dispose limpio de un grupo dinámico. */
function limpiar(g: THREE.Group) {
  g.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
  });
  g.clear();
}

interface NoticiaV2 { titulo: string; medio: string; fecha: string }

async function fetchNoticias(modo: "gdelt" | "redaccion"): Promise<NoticiaV2[]> {
  try {
    if (modo === "gdelt") {
      const r = await fetch("/api/news", { cache: "no-store" });
      const j = await r.json();
      const arr = Array.isArray(j) ? j : (j.items ?? j.articulos ?? []);
      console.info("[v2] noticias gdelt:", Array.isArray(arr) ? arr.length : "no-array");
      return arr.slice(0, 6).map((a: Record<string, unknown>) => ({
        titulo: String(a.title ?? "SIN TITULAR"),
        medio: String(a.domain ?? a.source ?? a.medio ?? "GDELT"),
        fecha: String(a.seendate ?? a.publishedAt ?? "").slice(0, 10),
      }));
    }
    const r = await fetch("/api/noticias", { cache: "no-store" });
    const j = await r.json();
    const arr = j.piezas ?? j.noticias ?? j.portada ?? [];
    return (Array.isArray(arr) ? arr : []).slice(0, 6).map((a: Record<string, unknown>) => ({
      titulo: String(a.titulo ?? a.title ?? "SIN TITULAR"),
      medio: String(a.fuente ?? a.source ?? a.medio ?? "REDACCION"),
      fecha: String(a.fecha ?? a.publishedAt ?? "").slice(0, 10),
    }));
  } catch (e) {
    console.warn("[v2] noticias fallo:", e instanceof Error ? e.message : e);
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// NOTICIAS / REDACCIÓN — monolitos con el titular en volumen
// ────────────────────────────────────────────────────────────
export function construirMundoNoticias(motor: MotorV2, modo: "gdelt" | "redaccion"): MundoV2 {
  const esRedaccion = modo === "redaccion";
  const m = baseMundo(
    motor,
    esRedaccion ? "redaccion" : "noticias",
    esRedaccion ? "LA REDACCION" : "NOTICIAS",
    esRedaccion ? "EL LUGAR PARA LEER EL MUNDO" : "INTEL REAL - GDELT + 15 MEDIOS",
    "oro",
    esRedaccion
      ? ["PORTADA CON RESUMEN", "POR QUE IMPORTA", "INVESTIGACION EN VIVO"]
      : ["TITULARES EN VOLUMEN", "FUENTES REALES", "EL MUNDO EN 3D"]
  );

  let piezas: NoticiaV2[] | null = null;
  const pintar = () => {
    limpiar(m.contenido);
    if (!piezas) {
      motor.texto3D(m.contenido, "SINTONIZANDO LA RED GLOBAL", { tam: 0.22, prof: 0.05, mat: "cian" });
      motor.texto3D(m.contenido, "GDELT 2.0 - 15 MEDIOS", { tam: 0.1, prof: 0.02, mat: "texto", pos: new THREE.Vector3(0, -0.3, 0) });
      return;
    }
    if (piezas.length === 0) {
      motor.texto3D(m.contenido, "SIN SENAL DEL PLANETA", { tam: 0.2, prof: 0.05, mat: "rojo" });
      return;
    }
    piezas.forEach((n, i) => {
      const g = new THREE.Group();
      const col = i % 2 === 0 ? "oro" : "cian";
      // número de pieza
      motor.texto3D(g, String(i + 1).padStart(2, "0"), { tam: 0.16, prof: 0.05, mat: col, pos: new THREE.Vector3(-1.02, 0.18, 0.02) });
      // titular en 2 líneas
      const t = n.titulo.toUpperCase();
      const mitad = t.length <= 34 ? [t] : [t.slice(0, t.lastIndexOf(" ", 34) > 0 ? t.lastIndexOf(" ", 34) : 34), t.slice(t.lastIndexOf(" ", 34) > 0 ? t.lastIndexOf(" ", 34) : 34)];
      mitad.slice(0, 2).forEach((linea, li) => {
        motor.texto3D(g, acotar(linea, 34), { tam: 0.093, prof: 0.022, mat: "texto", pos: new THREE.Vector3(0.1, 0.12 - li * 0.14, 0.02) });
      });
      // medio + fecha
      motor.texto3D(g, acotar(n.medio, 22) + "  -  " + n.fecha, { tam: 0.06, prof: 0.012, mat: col, pos: new THREE.Vector3(0.1, -0.16, 0.02) });
      // placa de fondo + filo
      const placa = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.56, 0.025), motor.mat("placa"));
      placa.position.z = -0.016;
      g.add(placa);
      const filo = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 0.012), motor.mat("malla"));
      filo.position.z = -0.022;
      g.add(filo);
      g.position.set(0, 1.05 - i * 0.72, 0.6 - i * 0.12);
      m.contenido.add(g);
    });
  };
  pintar();
  fetchNoticias(modo).then((ps) => {
    piezas = ps;
    pintar();
  });
  m.accion = (nombre) => {
    if (nombre === "__fuente_lista__") pintar();
  };
  m.tick = (t) => {
    m.fraseGrupo.rotation.y = t * 0.12;
    m.contenido.rotation.y = Math.sin(t * 0.25) * 0.05;
  };
  return m;
}

// ────────────────────────────────────────────────────────────
// QUIZ — jugable dentro del mundo (recompensa al ledger v2)
// ────────────────────────────────────────────────────────────
export function construirMundoQuiz(motor: MotorV2): MundoV2 {
  const m = baseMundo(motor, "quiz", "QUIZ", "DEMUESTRA TU IQ GEOPOLITICO", "verde", [
    "TOCA TU RESPUESTA",
    "ACIERTA Y GANA MONEDAS Y XP",
    "EL MUNDO TE PONE A PRUEBA",
  ]);
  let idx = 0;
  let revelado: number | null = null;
  const ORDEN = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);

  const pintar = () => {
    limpiar(m.contenido);
    const l = leerLedger();
    if (ORDEN.length === 0) {
      motor.texto3D(m.contenido, "SIN PREGUNTAS EN EL BANCO", { tam: 0.18, prof: 0.04, mat: "rojo" });
      return;
    }
    const q = ORDEN[Math.min(idx, ORDEN.length - 1)];
    // pregunta en 2 líneas
    const p = q.question.toUpperCase();
    const corte = p.lastIndexOf(" ", 40) > 0 ? p.lastIndexOf(" ", 40) : 40;
    const lineas = p.length <= 40 ? [p] : [p.slice(0, corte), p.slice(corte)];
    lineas.slice(0, 2).forEach((s, i) => {
      motor.texto3D(m.contenido, acotar(s, 40), { tam: 0.135, prof: 0.035, mat: "texto", pos: new THREE.Vector3(0, 1.35 - i * 0.2, 0) });
    });
    motor.texto3D(m.contenido, `PREGUNTA ${idx + 1}/${ORDEN.length} - ${q.difficulty}`, { tam: 0.075, prof: 0.015, mat: "cian", pos: new THREE.Vector3(0, 0.95, 0) });

    // respuestas A-D
    const letras = ["A", "B", "C", "D"];
    q.options.slice(0, 4).forEach((op, i) => {
      const g = new THREE.Group();
      const lado = i % 2 === 0 ? -1 : 1;
      const fila = Math.floor(i / 2);
      g.position.set(lado * 1.62, 0.34 - fila * 0.52, 0);
      const mat = revelado === null ? "placa" : i === q.answerIdx ? "placa" : "placa";
      const placa = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.36, 0.03), motor.mat(mat));
      placa.position.z = -0.02;
      g.add(placa);
      motor.texto3D(g, letras[i], { tam: 0.1, prof: 0.028, mat: "oro", pos: new THREE.Vector3(-0.62, 0, 0.03) });
      motor.texto3D(g, acotar(op, 24), { tam: 0.078, prof: 0.016, mat: revelado !== null && i === q.answerIdx ? "verde" : revelado !== null && i === revelado && i !== q.answerIdx ? "rojo" : "texto", pos: new THREE.Vector3(0.08, 0, 0.03) });
      if (revelado === null) {
        g.userData.accion = `resp:${i}`;
        motor.registrarPickable(g);
      }
      m.contenido.add(g);
    });

    // revelación + explicación + siguiente
    if (revelado !== null) {
      const acierto = revelado === q.answerIdx;
      motor.texto3D(m.contenido, acierto ? `CORRECTO +${q.coinReward}C +${q.xpReward}XP` : `FALLO - ERA ${letras[q.answerIdx]}`, { tam: 0.13, prof: 0.03, mat: acierto ? "verde" : "rojo", pos: new THREE.Vector3(0, -0.78, 0) });
      motor.texto3D(m.contenido, acotar(q.explanation, 52), { tam: 0.07, prof: 0.014, mat: "texto", pos: new THREE.Vector3(0, -0.98, 0) });
      const sig = motor.boton3D(m.contenido, "SIGUIENTE", "siguiente", { w: 0.7, h: 0.18, tam: 0.07, matPlaca: "cristal", pos: new THREE.Vector3(0, -1.28, 0) });
      sig.userData.accion = "siguiente";
    }
    // marcador
    motor.texto3D(m.contenido, `ACIERTOS ${l.aciertos} - RACHA ${l.rachaQuiz}`, { tam: 0.08, prof: 0.016, mat: "oro", pos: new THREE.Vector3(1.55, -1.5, 0.4) });
  };
  pintar();

  m.accion = (nombre) => {
    if (nombre === "__fuente_lista__") { pintar(); return; }
    if (nombre.startsWith("resp:") && revelado === null) {
      const i = parseInt(nombre.slice(5), 10);
      revelado = i;
      const q = ORDEN[Math.min(idx, ORDEN.length - 1)];
      const acierto = i === q.answerIdx;
      mutarLedger((l: LedgerV2) => {
        if (acierto) {
          l.aciertos++;
          l.rachaQuiz++;
          l.coins += q.coinReward;
          l.gems += Math.random() < 0.12 ? 1 : 0;
          l.xp += q.xpReward;
        } else {
          l.fallos++;
          l.rachaQuiz = 0;
        }
        l.nivel = xpANivel(l.xp);
      });
      pintar();
    } else if (nombre === "siguiente") {
      idx = (idx + 1) % ORDEN.length;
      revelado = null;
      pintar();
    }
  };
  m.tick = (t) => {
    m.fraseGrupo.rotation.y = t * 0.12;
  };
  return m;
}

// ────────────────────────────────────────────────────────────
// ENCUESTAS — mercados SÍ/NO votables en el mundo
// ────────────────────────────────────────────────────────────
export function construirMundoEncuestas(motor: MotorV2): MundoV2 {
  const m = baseMundo(motor, "encuestas", "ENCUESTAS", "VOTA EL DESTINO DEL MUNDO", "cian", [
    "SÍ O NO - EL MUNDO DECIDE",
    "TU VOTO MUEVE LA BARRA",
    "MERCADOS DE PREDICCION REALES",
  ]);
  const mercados = PREDICTION_MARKETS.slice(0, 5);
  let repinta = 0; // fuerza re-render al votar

  const pintar = () => {
    limpiar(m.contenido);
    const l = leerLedger();
    mercados.forEach((mk, i) => {
      const g = new THREE.Group();
      const lado = i % 2 === 0 ? -1 : 1;
      const fila = Math.floor(i / 2);
      g.position.set(lado * 1.85, 0.85 - fila * 0.95, -fila * 0.3);
      motor.texto3D(g, acotar(mk.title, 26), { tam: 0.085, prof: 0.02, mat: "texto", pos: new THREE.Vector3(0, 0.24, 0.02) });
      // barra SÍ%
      const votos = l.votos[mk.id];
      const prob = THREE.MathUtils.clamp(mk.probability + (votos === 1 ? 0.03 : votos === 2 ? -0.03 : 0), 0.04, 0.96);
      const barra = motor.barraVolumen(g, prob, 1.7, 0.1, "verde", new THREE.Vector3(0, 0.02, 0.02));
      barra.rotation.y = 0;
      motor.texto3D(g, `SI ${Math.round(prob * 100)}%`, { tam: 0.055, prof: 0.012, mat: "verde", pos: new THREE.Vector3(-0.62, -0.1, 0.02) });
      motor.texto3D(g, `NO ${Math.round((1 - prob) * 100)}%`, { tam: 0.055, prof: 0.012, mat: "rojo", pos: new THREE.Vector3(0.62, -0.1, 0.02) });
      motor.texto3D(g, `x${mk.odds.toFixed(1)} - ${mk.closesAt}`, { tam: 0.05, prof: 0.01, mat: "oro", pos: new THREE.Vector3(0, -0.24, 0.02) });
      // botones SÍ / NO
      const bSi = motor.boton3D(g, "SI", `voto1:${mk.id}`, { w: 0.4, h: 0.14, tam: 0.055, matTexto: "verde", matPlaca: "cristal", pos: new THREE.Vector3(-0.28, -0.42, 0.02) });
      const bNo = motor.boton3D(g, "NO", `voto2:${mk.id}`, { w: 0.4, h: 0.14, tam: 0.055, matTexto: "rojo", matPlaca: "cristal", pos: new THREE.Vector3(0.28, -0.42, 0.02) });
      if (votos) {
        motor.texto3D(g, votos === 1 ? "TU VOTO: SI" : "TU VOTO: NO", { tam: 0.05, prof: 0.01, mat: "cian", pos: new THREE.Vector3(0, -0.62, 0.02) });
      }
      void bSi; void bNo;
      const placa = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.5, 0.02), motor.mat("placa"));
      placa.position.z = -0.03;
      g.add(placa);
      m.contenido.add(g);
    });
    motor.texto3D(m.contenido, `VOTOS EMITIDOS ${Object.keys(l.votos).length}`, { tam: 0.08, prof: 0.016, mat: "cian", pos: new THREE.Vector3(0, -1.55, 0.4) });
  };
  pintar();

  m.accion = (nombre) => {
    if (nombre === "__fuente_lista__") { pintar(); return; }
    if (nombre.startsWith("voto1:") || nombre.startsWith("voto2:")) {
      const id = nombre.slice(6);
      const val = nombre.startsWith("voto1") ? 1 : 2;
      mutarLedger((l) => { l.votos[id] = val; });
      repinta++;
      pintar();
    }
  };
  m.tick = (t) => {
    m.fraseGrupo.rotation.y = t * 0.12;
    m.contenido.children.forEach((c, i) => {
      c.position.y += Math.sin(t * 1.3 + i) * 0.0004;
    });
    void repinta;
  };
  return m;
}

// ────────────────────────────────────────────────────────────
// PERFIL — la ficha del agente en volumen (v2 + original)
// ────────────────────────────────────────────────────────────
export function construirMundoPerfil(motor: MotorV2): MundoV2 {
  const m = baseMundo(motor, "perfil", "PERFIL DEL AGENTE", "TU FICHA VIVA EN VOLUMEN", "violeta", [
    "ESTE ERES TU EN EL SISTEMA",
    "CADA ACCION TE HACE SUBIR",
    "TEMPORADA CERO",
  ]);

  const pintar = () => {
    limpiar(m.contenido);
    const l = leerLedger();
    const orig = leerEstadoOriginal();
    const nivel = orig.nivel ?? l.nivel;
    const rank = getRankForLevel(nivel);
    const alias = orig.alias ?? l.alias;

    // monumento: cristal del agente
    const cristal = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), motor.mat("violeta"));
    cristal.position.set(0, 0.35, 0);
    m.contenido.add(cristal);
    const red = new THREE.Mesh(new THREE.OctahedronGeometry(0.72, 0), motor.mat("mallaCian"));
    m.contenido.add(red);
    (m as BaseMundo & { _cristal?: THREE.Mesh })._cristal = cristal;
    (m as BaseMundo & { _red?: THREE.Mesh })._red = red;

    motor.texto3D(m.contenido, acotar(alias, 14), { tam: 0.24, prof: 0.06, mat: "oro", pos: new THREE.Vector3(0, -0.5, 0) });
    motor.texto3D(m.contenido, rank.name, { tam: 0.12, prof: 0.03, mat: "cian", pos: new THREE.Vector3(0, -0.82, 0) });

    // placas de botín
    const datos: Array<[string, string, string]> = [
      ["NIVEL", String(nivel), "texto"],
      ["MONEDAS", String(orig.coins ?? l.coins), "oro"],
      ["GEMAS", String(orig.gems ?? l.gems), "cian"],
      ["RACHA", `${orig.streak ?? 0}D`, "rojo"],
      ["XP V2", String(l.xp), "verde"],
      ["ACIERTOS", String(l.aciertos), "violeta"],
    ];
    datos.forEach(([k, v, cm], i) => {
      const g = new THREE.Group();
      motor.texto3D(g, k, { tam: 0.06, prof: 0.014, mat: "texto" });
      motor.texto3D(g, v, { tam: 0.12, prof: 0.032, mat: cm, pos: new THREE.Vector3(0, -0.15, 0) });
      const placa = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.44, 0.02), motor.mat("placa"));
      placa.position.z = -0.014;
      g.add(placa);
      g.position.set(((i % 3) - 1) * 1.35, 0.72 - Math.floor(i / 3) * 0.0 - 0.0, 1.15 + Math.floor(i / 3) * 0.001);
      g.position.set(((i % 3) - 1) * 1.35, 0.75 - Math.floor(i / 3) * 0.62, 1.15);
      m.contenido.add(g);
    });

    // barra de XP hacia el siguiente nivel (curva v2)
    const base = xpParaSiguiente(Math.max(1, l.nivel - 1));
    const techo = xpParaSiguiente(l.nivel);
    const frac = THREE.MathUtils.clamp((l.xp - base) / Math.max(1, techo - base), 0.02, 1);
    motor.barraVolumen(m.contenido, frac, 2.4, 0.12, "verde", new THREE.Vector3(0, -1.12, 0.9));
    motor.texto3D(m.contenido, `XP ${l.xp} / ${techo} - NIVEL V2 ${l.nivel}`, { tam: 0.065, prof: 0.014, mat: "texto", pos: new THREE.Vector3(0, -1.34, 0.9) });
    void RANKS;
  };
  pintar();

  m.accion = (nombre) => {
    if (nombre === "__fuente_lista__") pintar();
  };
  m.tick = (t) => {
    m.fraseGrupo.rotation.y = t * 0.12;
    const cristal = (m as BaseMundo & { _cristal?: THREE.Mesh })._cristal;
    const red = (m as BaseMundo & { _red?: THREE.Mesh })._red;
    if (cristal) { cristal.rotation.y = t * 0.6; cristal.rotation.x = Math.sin(t * 0.5) * 0.2; }
    if (red) { red.rotation.y = -t * 0.35; }
  };
  return m;
}

// ────────────────────────────────────────────────────────────
// TIENDA — pedestales con el equipo real, compra con ledger v2
// ────────────────────────────────────────────────────────────
import { SHOP_ITEMS, ACHIEVEMENTS, CONFLICTS } from "@/lib/game-data";

export function construirMundoTienda(motor: MotorV2): MundoV2 {
  const m = baseMundo(motor, "tienda", "TIENDA", "EQUIPO REAL PARA TU AGENTE", "oro", [
    "TOCA COMPRAR - SE COBRA AQUI MISMO",
    "TODO EN VOLUMEN",
    "TU BOTIN TU PODER",
  ]);
  const items = SHOP_ITEMS.slice(0, 8);
  let aviso = "";
  let avisoT = 0;

  const pintar = () => {
    limpiar(m.contenido);
    const l = leerLedger();
    items.forEach((it, i) => {
      const g = new THREE.Group();
      const lado = i % 2 === 0 ? -1 : 1;
      const fila = Math.floor(i / 2);
      g.position.set(lado * 1.95, 0.8 - fila * 0.92, -fila * 0.35);
      // pedestal
      const pie = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.1, 8), motor.mat("placa"));
      pie.position.y = -0.32;
      g.add(pie);
      const orbe = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 0), motor.mat("oro"));
      orbe.position.y = -0.16;
      g.add(orbe);
      motor.texto3D(g, acotar(it.title, 16), { tam: 0.072, prof: 0.018, mat: "texto" });
      motor.texto3D(g, `${it.cost} ${it.currency === "GEMS" ? "G" : "C"} - ${it.category}`, { tam: 0.055, prof: 0.012, mat: "oro", pos: new THREE.Vector3(0, -0.11, 0.02) });
      motor.boton3D(g, "COMPRAR", `comprar:${it.id}:${i}`, { w: 0.5, h: 0.13, tam: 0.05, matPlaca: "cristalOro", pos: new THREE.Vector3(0, -0.26, 0.02) });
      const dueño = l.compras[it.id] ?? 0;
      if (dueño > 0) motor.texto3D(g, `X${dueño} TUYO`, { tam: 0.05, prof: 0.01, mat: "verde", pos: new THREE.Vector3(0, 0.18, 0.02) });
      const placa = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.85, 0.02), motor.mat("placa"));
      placa.position.z = -0.03;
      g.add(placa);
      m.contenido.add(g);
    });
    motor.texto3D(m.contenido, `CARTERA ${l.coins}C - ${l.gems}G`, { tam: 0.1, prof: 0.022, mat: "oro", pos: new THREE.Vector3(0, -1.55, 0.5) });
    if (aviso && performance.now() - avisoT < 2600) {
      motor.texto3D(m.contenido, aviso, { tam: 0.1, prof: 0.024, mat: aviso.includes("COMPRADO") ? "verde" : "rojo", pos: new THREE.Vector3(0, 1.62, 0.3) });
    }
  };
  pintar();

  m.accion = (nombre) => {
    if (nombre === "__fuente_lista__") { pintar(); return; }
    if (nombre.startsWith("comprar:")) {
      const [, id] = nombre.split(":");
      const it = SHOP_ITEMS.find((s) => s.id === id);
      if (!it) return;
      let ok = false;
      mutarLedger((l) => {
        if (it.currency === "COINS" && l.coins >= it.cost) { l.coins -= it.cost; l.compras[it.id] = (l.compras[it.id] ?? 0) + 1; ok = true; }
        else if (it.currency === "GEMS" && l.gems >= it.cost) { l.gems -= it.cost; l.compras[it.id] = (l.compras[it.id] ?? 0) + 1; ok = true; }
      });
      aviso = ok ? `COMPRADO ${acotar(it.title, 14)}` : "FONDOS INSUFICIENTES";
      avisoT = performance.now();
      pintar();
    }
  };
  m.tick = (t) => {
    m.fraseGrupo.rotation.y = t * 0.12;
    m.contenido.children.forEach((c, i) => {
      c.position.y += Math.sin(t * 1.4 + i * 0.8) * 0.0005;
      const orbe = c.children.find((o) => (o as THREE.Mesh).geometry?.type === "IcosahedronGeometry") as THREE.Mesh | undefined;
      if (orbe) orbe.rotation.y = t * 1.2;
    });
    if (aviso && performance.now() - avisoT >= 2600) { aviso = ""; pintar(); }
  };
  return m;
}

// ────────────────────────────────────────────────────────────
// LOGROS — muro de honor con progreso real del Vanguard original
// ────────────────────────────────────────────────────────────
export function construirMundoLogros(motor: MotorV2): MundoV2 {
  const m = baseMundo(motor, "logros", "LOGROS", "EL MURO DE HONOR DEL AGENTE", "violeta", [
    "PROGRESO REAL LEIDO DE TU EXPEDIENTE",
    "RAREZA COMUN A LEGENDARIO",
  ]);
  const lista = ACHIEVEMENTS.slice(0, 12);
  const MAT_RAREZA: Record<string, string> = { COMUN: "texto", RARO: "cian", EPICO: "violeta", LEGENDARIO: "oro" };

  const pintar = () => {
    limpiar(m.contenido);
    let estadoOriginal: AchievementState | null = null;
    try {
      const raw = window.localStorage.getItem("vanguard-game-state-v1");
      if (raw) estadoOriginal = ((JSON.parse(raw)?.state ?? {}) as AchievementState);
    } catch { estadoOriginal = null; }
    lista.forEach((a, i) => {
      const g = new THREE.Group();
      const col = i % 3;
      const fila = Math.floor(i / 3);
      g.position.set((col - 1) * 2.2, 0.95 - fila * 0.85, -0.15);
      motor.texto3D(g, acotar(a.title, 18), { tam: 0.072, prof: 0.018, mat: MAT_RAREZA[a.rarity] ?? "texto" });
      motor.texto3D(g, acotar(a.description, 26), { tam: 0.05, prof: 0.011, mat: "texto", pos: new THREE.Vector3(0, -0.09, 0.02) });
      let frac = 0;
      try { const p = a.progress(estadoOriginal as AchievementState); frac = p.target > 0 ? p.current / p.target : 0; } catch { frac = 0; }
      motor.barraVolumen(g, frac, 1.5, 0.07, frac >= 1 ? "verde" : "cian", new THREE.Vector3(0, -0.22, 0.02));
      motor.texto3D(g, `${a.rarity} - ${a.coinReward}C ${a.xpReward}XP`, { tam: 0.048, prof: 0.01, mat: MAT_RAREZA[a.rarity] ?? "texto", pos: new THREE.Vector3(0, -0.36, 0.02) });
      const placa = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.72, 0.02), motor.mat("placa"));
      placa.position.z = -0.028;
      g.add(placa);
      m.contenido.add(g);
    });
    motor.texto3D(m.contenido, `${ACHIEVEMENTS.length} LOGROS EN EL CODIGO - 12 EN EL MURO`, { tam: 0.07, prof: 0.014, mat: "oro", pos: new THREE.Vector3(0, -1.5, 0.4) });
  };
  pintar();
  m.accion = (nombre) => { if (nombre === "__fuente_lista__") pintar(); };
  m.tick = (t) => { m.fraseGrupo.rotation.y = t * 0.12; };
  return m;
}

// ────────────────────────────────────────────────────────────
// CONFLICTOS — globo vivo con marcadores de las guerras reales
// ────────────────────────────────────────────────────────────
export function construirMundoConflictos(motor: MotorV2): MundoV2 {
  const m = baseMundo(motor, "conflictos", "CONFLICTOS", "EL PLANETA EN GUERRA - TOCA UN MARCADOR", "rojo", [
    "CADA PIN ES UNA GUERRA ACTIVA",
    "INTENSIDAD EN VOLUMEN",
    "DATOS DE TU EXPEDIENTE DE CAMPO",
  ]);
  let seleccion: string | null = null;
  const pins: Array<{ id: string; mesh: THREE.Mesh; base: number }> = [];

  const latLngAVec = (lat: number, lng: number, r: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  };

  const pintar = () => {
    limpiar(m.contenido);
    pins.length = 0;
    const globo = new THREE.Group();
    globo.position.set(0, 0.15, 0);
    const esfera = new THREE.Mesh(new THREE.SphereGeometry(1.7, 28, 20), motor.mat("nucleo"));
    globo.add(esfera);
    const red = new THREE.Mesh(new THREE.SphereGeometry(1.78, 16, 12), motor.mat("mallaCian"));
    globo.add(red);
    m.contenido.add(globo);
    (m as BaseMundo & { _globo?: THREE.Group })._globo = globo;

    CONFLICTS.slice(0, 12).forEach((c, i) => {
      const g = new THREE.Group();
      const pos = latLngAVec(c.lat, c.lng, 1.85);
      const pin = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.2, 6), motor.mat(c.intensity > 66 ? "rojo" : c.intensity > 33 ? "oro" : "cian"));
      pin.position.copy(pos);
      pin.lookAt(0, 0.15, 0);
      pin.rotateX(Math.PI / 2);
      g.add(pin);
      motor.texto3D(g, acotar(c.name, 12), { tam: 0.055, prof: 0.012, mat: "texto", pos: pos.clone().multiplyScalar(1.22) });
      g.userData.accion = `pin:${c.id}`;
      globo.add(g);
      motor.registrarPickable(g);
      pins.push({ id: c.id, mesh: pin, base: 1 + i * 0.01 });
    });

    const c = CONFLICTS.find((x) => x.id === seleccion);
    if (c) {
      const info = new THREE.Group();
      info.position.set(0, -1.35, 1.4);
      motor.texto3D(info, acotar(c.name, 24), { tam: 0.11, prof: 0.028, mat: "rojo" });
      motor.texto3D(info, `${c.flag} ${c.country} - DESDE ${c.since}`, { tam: 0.06, prof: 0.012, mat: "texto", pos: new THREE.Vector3(0, -0.16, 0.02) });
      motor.barraVolumen(info, c.intensity / 100, 1.8, 0.09, "rojo", new THREE.Vector3(0, -0.3, 0.02));
      motor.texto3D(info, `INTENSIDAD ${c.intensity}% - BAJAS ${acotar(c.casualties, 16)}`, { tam: 0.05, prof: 0.01, mat: "oro", pos: new THREE.Vector3(0, -0.44, 0.02) });
      const placa = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.66, 0.02), motor.mat("placa"));
      placa.position.z = -0.02;
      info.add(placa);
      m.contenido.add(info);
    }
  };
  pintar();

  m.accion = (nombre) => {
    if (nombre === "__fuente_lista__") { pintar(); return; }
    if (nombre.startsWith("pin:")) {
      seleccion = nombre.slice(4);
      pintar();
    }
  };
  m.tick = (t) => {
    m.fraseGrupo.rotation.y = t * 0.12;
    const globo = (m as BaseMundo & { _globo?: THREE.Group })._globo;
    if (globo) globo.rotation.y = t * 0.1;
    pins.forEach((p, i) => {
      const s = 1 + Math.sin(t * 2.4 + i) * 0.25;
      p.mesh.scale.set(s, s, s);
    });
  };
  return m;
}

// ────────────────────────────────────────────────────────────
// MEMES — la galería comunitaria en volumen
// ────────────────────────────────────────────────────────────
interface MemeV2 { caption: string; likes: number }
export function construirMundoMemes(motor: MotorV2): MundoV2 {
  const m = baseMundo(motor, "memes", "ESTUDIO DE MEMES", "HUMOR GEOPOLITICO EN VOLUMEN", "violeta", [
    "EL CAPTION EN LETRAS 3D",
    "LIKES EN BARRA DE VOLUMEN",
    "MEME DEL DIA EN EL TRONO",
  ]);
  let memes: MemeV2[] | null = null;
  let dia: MemeV2 | null = null;

  const pintar = () => {
    limpiar(m.contenido);
    if (!memes) {
      motor.texto3D(m.contenido, "REVELANDO LA GALERIA", { tam: 0.2, prof: 0.05, mat: "violeta" });
      return;
    }
    if (dia) {
      const g = new THREE.Group();
      motor.texto3D(g, "MEME DEL DIA", { tam: 0.07, prof: 0.016, mat: "oro" });
      motor.texto3D(g, acotar(dia.caption, 32), { tam: 0.1, prof: 0.026, mat: "texto", pos: new THREE.Vector3(0, -0.16, 0.02) });
      motor.barraVolumen(g, Math.min(1, dia.likes / 500), 1.7, 0.09, "oro", new THREE.Vector3(0, -0.32, 0.02));
      motor.texto3D(g, `${dia.likes} LIKES`, { tam: 0.055, prof: 0.012, mat: "oro", pos: new THREE.Vector3(0, -0.46, 0.02) });
      const trono = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.8, 0.02), motor.mat("placa"));
      trono.position.z = -0.025;
      g.add(trono);
      g.position.set(0, 1.2, 0.4);
      m.contenido.add(g);
    }
    if (memes.length === 0 && !dia) {
      motor.texto3D(m.contenido, "GALERIA SIN SENAL - VUELVE LUEGO", { tam: 0.15, prof: 0.04, mat: "rojo" });
      return;
    }
    memes.slice(0, 6).forEach((mm, i) => {
      const g = new THREE.Group();
      const lado = i % 2 === 0 ? -1 : 1;
      const fila = Math.floor(i / 2);
      g.position.set(lado * 1.85, 0.1 - fila * 0.62, -fila * 0.25);
      motor.texto3D(g, acotar(mm.caption, 20), { tam: 0.062, prof: 0.014, mat: "texto" });
      motor.barraVolumen(g, Math.min(1, mm.likes / 300), 1.2, 0.06, "violeta", new THREE.Vector3(0, -0.12, 0.02));
      motor.texto3D(g, `${mm.likes} LIKES`, { tam: 0.045, prof: 0.01, mat: "violeta", pos: new THREE.Vector3(0, -0.24, 0.02) });
      const marco = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.5, 0.02), motor.mat("placa"));
      marco.position.z = -0.02;
      g.add(marco);
      m.contenido.add(g);
    });
  };
  pintar();
  fetch("/api/memes?limit=12", { cache: "no-store" })
    .then((r) => r.json())
    .then((j) => {
      const arr = (j.memes ?? []) as Array<Record<string, unknown>>;
      memes = arr.map((x) => ({
        caption: String(x.caption ?? x.texto ?? x.title ?? "MEME"),
        likes: Number(x.likes ?? 0),
      }));
      const d = j.memeOfDay as Record<string, unknown> | null;
      dia = d ? { caption: String(d.caption ?? d.texto ?? "MEME DEL DIA"), likes: Number(d.likes ?? 0) } : null;
      pintar();
    })
    .catch(() => { memes = []; pintar(); });
  m.accion = (nombre) => { if (nombre === "__fuente_lista__") pintar(); };
  m.tick = (t) => {
    m.fraseGrupo.rotation.y = t * 0.12;
    m.contenido.children.forEach((c, i) => c.position.y += Math.sin(t * 1.5 + i) * 0.0004);
  };
  return m;
}

// ────────────────────────────────────────────────────────────
// PREDICCIONES — tablero de escenarios con riesgo en volumen
// ────────────────────────────────────────────────────────────
export function construirMundoPredicciones(motor: MotorV2): MundoV2 {
  const m = baseMundo(motor, "predicciones", "PRONOSTICO", "ESCENARIOS DE INTELIGENCIA - QUE VIENE", "verde", [
    "PROBABILIDAD EN BARRA VIVA",
    "EL FUTURO SE LEE EN 3D",
  ]);
  const mkts = PREDICTION_MARKETS.slice(0, 6);

  const pintar = () => {
    limpiar(m.contenido);
    mkts.forEach((mk, i) => {
      const g = new THREE.Group();
      const col = i % 3;
      const fila = Math.floor(i / 3);
      g.position.set((col - 1) * 2.25, 0.85 - fila * 1.15, -fila * 0.5);
      motor.texto3D(g, acotar(mk.title, 24), { tam: 0.075, prof: 0.018, mat: "texto" });
      motor.barraVolumen(g, mk.probability, 1.7, 0.1, mk.probability > 0.6 ? "verde" : mk.probability > 0.35 ? "oro" : "rojo", new THREE.Vector3(0, -0.12, 0.02));
      motor.texto3D(g, `RIESGO ${Math.round(mk.probability * 100)}% - PAGA x${mk.odds.toFixed(1)}`, { tam: 0.05, prof: 0.011, mat: "cian", pos: new THREE.Vector3(0, -0.26, 0.02) });
      motor.texto3D(g, acotar(mk.description, 34), { tam: 0.048, prof: 0.01, mat: "texto", pos: new THREE.Vector3(0, -0.38, 0.02) });
      motor.texto3D(g, `CIERRA ${mk.closesAt.toUpperCase()}`, { tam: 0.048, prof: 0.01, mat: "oro", pos: new THREE.Vector3(0, -0.5, 0.02) });
      const placa = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.95, 0.02), motor.mat("placa"));
      placa.position.z = -0.028;
      g.add(placa);
      m.contenido.add(g);
    });
  };
  pintar();
  m.accion = (nombre) => { if (nombre === "__fuente_lista__") pintar(); };
  m.tick = (t) => { m.fraseGrupo.rotation.y = t * 0.12; };
  return m;
}

// ────────────────────────────────────────────────────────────
// ECONOMÍA — la bóveda central v2 con cartera viva
// ────────────────────────────────────────────────────────────
export function construirMundoEconomia(motor: MotorV2): MundoV2 {
  const m = baseMundo(motor, "economia", "BANCO CENTRAL V2", "LA BÓVEDA DE TU ECONOMÍA", "oro", [
    "TODO LO QUE GANAS VIVE AQUI",
    "QUIZ + ENCUESTAS + COMPRAS",
    "MONEDAS Y GEMAS EN VOLUMEN",
  ]);

  const pintar = () => {
    limpiar(m.contenido);
    const l = leerLedger();
    // bóveda: cilindro oro + moneda giratoria
    const bóveda = new THREE.Group();
    const tambor = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.5, 20), motor.mat("placa"));
    bóveda.add(tambor);
    const moneda = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.12, 12, 32), motor.mat("oro"));
    moneda.rotation.x = Math.PI / 2;
    moneda.position.y = 0.45;
    bóveda.add(moneda);
    (m as BaseMundo & { _moneda?: THREE.Mesh })._moneda = moneda;
    bóveda.position.set(0, -0.2, 0);
    m.contenido.add(bóveda);

    const datos: Array<[string, string, string]> = [
      ["MONEDAS", String(l.coins), "oro"],
      ["GEMAS", String(l.gems), "cian"],
      ["NIVEL V2", String(l.nivel), "verde"],
      ["ACIERTOS", String(l.aciertos), "violeta"],
    ];
    datos.forEach(([k, v, cm], i) => {
      const g = new THREE.Group();
      motor.texto3D(g, k, { tam: 0.06, prof: 0.014, mat: "texto" });
      motor.texto3D(g, v, { tam: 0.13, prof: 0.034, mat: cm, pos: new THREE.Vector3(0, -0.16, 0) });
      const placa = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.46, 0.02), motor.mat("placa"));
      placa.position.z = -0.014;
      g.add(placa);
      g.position.set((i < 2 ? -1 : 1) * 1.35, 0.55 - (i % 2) * 0.75, 1.2);
      m.contenido.add(g);
    });
    motor.barraVolumen(m.contenido, THREE.MathUtils.clamp(l.xp / xpParaSiguiente(l.nivel), 0.02, 1), 2.2, 0.11, "verde", new THREE.Vector3(0, -1.3, 0.8));
    motor.texto3D(m.contenido, `XP ${l.xp}/${xpParaSiguiente(l.nivel)} - SIGUIENTE NIVEL ${l.nivel + 1}`, { tam: 0.06, prof: 0.012, mat: "texto", pos: new THREE.Vector3(0, -1.52, 0.8) });
  };
  pintar();
  m.accion = (nombre) => { if (nombre === "__fuente_lista__") pintar(); };
  m.tick = (t) => {
    m.fraseGrupo.rotation.y = t * 0.12;
    const moneda = (m as BaseMundo & { _moneda?: THREE.Mesh })._moneda;
    if (moneda) { moneda.rotation.z = t * 0.9; moneda.position.y = 0.45 + Math.sin(t * 1.4) * 0.06; }
  };
  return m;
}
