"use client";
// ═══════════════════════════════════════════════════════════════════
// v440.3 · VANGUARD CINEMATIC EXPERIENCE — la escena.
//
// Un solo lienzo 2D y un solo requestAnimationFrame para las cinco piezas
// (ojo, V, planeta, radar, portales) y los cinco destellos. Se carga PEREZOSA
// (import() desde cine-disparador) y solo cuando una experiencia se dispara.
//
// Reglas que respeta:
//   · Todo lo que se mueve lo mueve el JS (lienzo + estilos en línea): el modo
//     ligero de la casa pone animation/transition a 0,001 ms con !important y
//     eso NO toca esto. Así el teléfono también ve la pieza.
//   · Sin shadowBlur ni filtros: el brillo es un sprite pre-pintado sumado
//     con «lighter». Partículas en Float32Array, DPR tope 1,5 en teléfono.
//   · El tiempo avanza con dt acotado: si la pestaña se oculta, se pausa.
//   · Siempre saltable (botón, Escape) y el sonido es WebAudio sintetizado,
//     bajito, solo si ya hubo un gesto y no se ha silenciado.
//   · Los símbolos son los OFICIALES (los mismos trazados que la entrada).
// ═══════════════════════════════════════════════════════════════════
import { useEffect, useRef } from "react";
import type { DatosCine, ExtraCine, FinCine, Material, TipoEscena } from "./tipos";
import { TIERRA } from "./tierra";

export type EscenaProps = {
  tipo: TipoEscena;
  datos: DatosCine;
  material?: Material;
  extra?: ExtraCine;
  onFin: (r?: FinCine) => void;
};

// ── utilidades ──────────────────────────────────────────────────────
const cl = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const fase = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const suave = (x: number) => x * x * (3 - 2 * x);
const sale = (x: number) => 1 - Math.pow(1 - x, 3);
const entra = (x: number) => x * x * x;
const mezcla = (a: number, b: number, k: number) => a + (b - a) * k;
const ORO = "232,197,106";
const CLARO = "248,223,152";
const TAU = Math.PI * 2;
function azar(semilla: number) {
  let s = semilla >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}
/** entra, se queda y sale: la curva de cada frase/tarjeta */
function ventana(t: number, a: number, b: number, e = 0.45) {
  return Math.min(fase(t, a, a + e), 1 - fase(t, b - e, b));
}

// ── los trazados oficiales (los de la entrada) ───────────────────────
const P_OJO = "M98 260 Q260 118 422 260 Q260 402 98 260Z"; // centro 260,260
const P_HEX = "M32 3 59 18v28L32 61 5 46V18z"; // centro 32,32
const P_V = "M17 20h8l7 18 7-18h8L35 47h-6z";
const V_IZQ: [number, number][] = [[17, 20], [25, 20], [32, 38], [32, 47], [29, 47]];
const V_DER: [number, number][] = [[39, 20], [47, 20], [35, 47], [32, 47], [32, 38]];
const V_BORDE: [number, number][] = [[17, 20], [25, 20], [32, 38], [39, 20], [47, 20], [35, 47], [29, 47]];
function estrella(R: number, r: number, n: number, giro = 0) {
  const p = new Path2D();
  for (let i = 0; i < n * 2; i++) {
    const a = ((giro - 90) * Math.PI) / 180 + (i * Math.PI) / n;
    const q = i % 2 ? r : R;
    const x = 260 + Math.cos(a) * q;
    const y = 260 + Math.sin(a) * q;
    if (i) p.lineTo(x, y);
    else p.moveTo(x, y);
  }
  p.closePath();
  return p;
}
function dentro(p: [number, number][], x: number, y: number) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i];
    const [xj, yj] = p[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
/** punto a una fracción u del perímetro de un polígono */
function perimetro(p: [number, number][]) {
  const seg: number[] = [];
  let L = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i];
    const b = p[(i + 1) % p.length];
    L += Math.hypot(b[0] - a[0], b[1] - a[1]);
    seg.push(L);
  }
  return (u: number): [number, number] => {
    const d = (((u % 1) + 1) % 1) * L;
    let i = 0;
    while (seg[i] < d) i++;
    const a = p[i];
    const b = p[(i + 1) % p.length];
    const l0 = i ? seg[i - 1] : 0;
    const k = (d - l0) / (seg[i] - l0 || 1);
    return [mezcla(a[0], b[0], k), mezcla(a[1], b[1], k)];
  };
}

/** lote de puntos: agrupa por opacidad (8 niveles) y color, y pinta cada grupo
 *  con UN solo fill. Miles de puntos = 8–16 llamadas en vez de miles. */
class Lote {
  private g: Map<string, number[]> = new Map();
  add(x: number, y: number, z: number, a: number, color: string) {
    if (a <= 0.02) return;
    const k = color + "|" + Math.min(7, Math.round(a * 7));
    let l = this.g.get(k);
    if (!l) this.g.set(k, (l = []));
    l.push(x, y, z);
  }
  pintar(c: CanvasRenderingContext2D) {
    this.g.forEach((l, k) => {
      const [color, n] = k.split("|");
      c.globalAlpha = Number(n) / 7;
      c.fillStyle = color;
      c.beginPath();
      for (let i = 0; i < l.length; i += 3) c.rect(l[i] - l[i + 2] / 2, l[i + 1] - l[i + 2] / 2, l[i + 2], l[i + 2]);
      c.fill();
    });
    c.globalAlpha = 1;
    this.g.clear();
  }
}

// ── la Tierra (puntos reales de Natural Earth) ──────────────────────
let TIERRA_CACHE: { sf: Float32Array; cf: Float32Array; lon: Float32Array; lat: Float32Array } | null = null;
function tierra() {
  if (TIERRA_CACHE) return TIERRA_CACHE;
  const b = atob(TIERRA);
  const n = (b.length / 3) | 0;
  const sf = new Float32Array(n);
  const cf = new Float32Array(n);
  const lon = new Float32Array(n);
  const lat = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const la = b.charCodeAt(3 * i) - 90;
    const lo = ((b.charCodeAt(3 * i + 1) << 8) | b.charCodeAt(3 * i + 2)) - 180;
    lat[i] = la;
    lon[i] = lo;
    sf[i] = Math.sin((la * Math.PI) / 180);
    cf[i] = Math.cos((la * Math.PI) / 180);
  }
  TIERRA_CACHE = { sf, cf, lon, lat };
  return TIERRA_CACHE;
}

// ── el sonido: WebAudio sintetizado, nunca un archivo ───────────────
type Sonido = {
  zumbido: (d: number) => void;
  soplo: (d: number, sube?: boolean) => void;
  golpe: () => void;
  ping: (f: number, v?: number) => void;
  silencio: (si: boolean) => void;
  cerrar: () => void;
};
function crearSonido(mini: boolean): Sonido | null {
  try {
    if (localStorage.getItem("vg-cine:mudo") === "1") return null;
    const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (ua && !ua.hasBeenActive) return null;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    const ac = new AC();
    if (ac.state === "suspended") void ac.resume().catch(() => {});
    const master = ac.createGain();
    const nivel = mini ? 0.12 : 0.3;
    master.gain.value = nivel;
    master.connect(ac.destination);
    const buf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d0 = buf.getChannelData(0);
    for (let i = 0; i < d0.length; i++) d0[i] = Math.random() * 2 - 1;
    const ahora = () => ac.currentTime;
    const env = (g: GainNode, a: number, pico: number, d: number) => {
      const t = ahora();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(pico, t + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    };
    return {
      zumbido(d) {
        const g = ac.createGain();
        const f = ac.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 420;
        [55, 55.4, 82.4].forEach((hz) => {
          const o = ac.createOscillator();
          o.type = "sawtooth";
          o.frequency.value = hz;
          o.connect(f);
          o.start();
          o.stop(ahora() + d + 0.2);
        });
        f.connect(g);
        g.connect(master);
        const t = ahora();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.16, t + 1.2);
        g.gain.setValueAtTime(0.16, t + Math.max(1.3, d - 1.2));
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      },
      soplo(d, sube = true) {
        const s = ac.createBufferSource();
        s.buffer = buf;
        s.loop = true;
        const f = ac.createBiquadFilter();
        f.type = "bandpass";
        f.Q.value = 1.2;
        const t = ahora();
        f.frequency.setValueAtTime(sube ? 300 : 2400, t);
        f.frequency.exponentialRampToValueAtTime(sube ? 2600 : 260, t + d);
        const g = ac.createGain();
        s.connect(f);
        f.connect(g);
        g.connect(master);
        env(g, d * 0.6, 0.35, d * 0.4);
        s.start();
        s.stop(t + d + 0.05);
      },
      golpe() {
        const o = ac.createOscillator();
        const g = ac.createGain();
        const t = ahora();
        o.frequency.setValueAtTime(120, t);
        o.frequency.exponentialRampToValueAtTime(38, t + 0.9);
        o.connect(g);
        g.connect(master);
        env(g, 0.01, 0.9, 1.1);
        o.start();
        o.stop(t + 1.2);
        const s = ac.createBufferSource();
        s.buffer = buf;
        const f = ac.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 900;
        const g2 = ac.createGain();
        s.connect(f);
        f.connect(g2);
        g2.connect(master);
        env(g2, 0.005, 0.4, 0.5);
        s.start();
        s.stop(t + 0.6);
      },
      ping(hz, v = 0.28) {
        const o = ac.createOscillator();
        const o2 = ac.createOscillator();
        const g = ac.createGain();
        o.type = "sine";
        o2.type = "triangle";
        o.frequency.value = hz;
        o2.frequency.value = hz * 2.01;
        o.connect(g);
        o2.connect(g);
        g.connect(master);
        env(g, 0.008, v, 1.4);
        o.start();
        o2.start();
        o.stop(ahora() + 1.5);
        o2.stop(ahora() + 1.5);
      },
      silencio(si) {
        master.gain.setTargetAtTime(si ? 0 : nivel, ahora(), 0.05);
      },
      cerrar() {
        try {
          master.gain.setTargetAtTime(0, ahora(), 0.15);
          setTimeout(() => void ac.close().catch(() => {}), 700);
        } catch {
          /* nada */
        }
      },
    };
  } catch {
    return null;
  }
}

// ── el guion de cada pieza ──────────────────────────────────────────
type Frase = [number, number, string];
type Cue = [number, (s: Sonido) => void];
type Lienzo = {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  S: number;
  cx: number;
  cy: number;
  movil: boolean;
  brillo: HTMLCanvasElement;
  /** 1 normal, 2 = el aparato va justo: la mitad de puntos */
  paso: number;
};
type Pieza = {
  titulo: string;
  dur: number;
  mini?: boolean;
  frases: Frase[];
  cues: Cue[];
  /** tarjetas DOM con su ventana de tiempo */
  tarjetas?: { a: number; b: number; kicker: string; txt: string }[];
  marca?: { a: number; txt: string; dato?: string };
  chip?: { txt: string; href?: string };
  dibujar: (L: Lienzo, t: number) => void;
  clic?: (L: Lienzo, t: number, x: number, y: number) => FinCine | null;
  /** opacidad del fondo negro (por defecto 0,94) */
  velo?: number;
};

function luz(L: Lienzo, x: number, y: number, r: number, a: number) {
  if (a <= 0.003 || r <= 0) return;
  const c = L.ctx;
  c.globalAlpha = cl(a);
  c.drawImage(L.brillo, x - r, y - r, r * 2, r * 2);
  c.globalAlpha = 1;
}

/** el sello completo de VANGUARD: estrellas, anillos, ojo y V */
function sello(
  L: Lienzo,
  x: number,
  y: number,
  k: number,
  a: number,
  o: { est?: number; ani?: number; ojo?: number; v?: number; abre?: number; mira?: number } = {},
) {
  if (a <= 0.003) return;
  const c = L.ctx;
  const est = o.est ?? 1;
  const ani = o.ani ?? 1;
  const ojo = o.ojo ?? 1;
  const v = o.v ?? 1;
  const abre = o.abre ?? 1;
  c.save();
  c.translate(x, y);
  c.scale(k, k);
  c.translate(-260, -260);
  if (est > 0) {
    c.globalAlpha = a * est;
    const g = c.createRadialGradient(260, 260, 10, 260, 260, 200);
    g.addColorStop(0, `rgba(${CLARO},.75)`);
    g.addColorStop(0.55, `rgba(${ORO},.28)`);
    g.addColorStop(1, `rgba(${ORO},0)`);
    c.fillStyle = g;
    c.fill(estrella(196, 70, 4));
    c.fill(estrella(152, 62, 4, 45));
    c.strokeStyle = `rgba(${ORO},.55)`;
    c.lineWidth = 1.4;
    c.stroke(estrella(196, 70, 4));
  }
  if (ani > 0) {
    c.globalAlpha = a * ani;
    c.strokeStyle = `rgba(${ORO},.85)`;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(260, 260, 200, 0, TAU);
    c.stroke();
    c.lineWidth = 1;
    c.beginPath();
    c.arc(260, 260, 186, 0, TAU);
    c.stroke();
    c.setLineDash([2, 9]);
    c.beginPath();
    c.arc(260, 260, 228, 0, TAU);
    c.stroke();
    c.setLineDash([]);
  }
  if (ojo > 0 && abre > 0.01) {
    c.globalAlpha = a * ojo;
    const pOjo = new Path2D(P_OJO);
    c.save();
    c.translate(0, 260);
    c.scale(1, abre);
    c.translate(0, -260);
    c.fillStyle = "#07090d";
    c.fill(pOjo);
    c.clip(pOjo);
    const mx = (o.mira ?? 0) * 26;
    const gi = c.createRadialGradient(260 + mx, 260, 8, 260 + mx, 260, 78);
    gi.addColorStop(0, "#fff3c8");
    gi.addColorStop(0.35, "#f0c95c");
    gi.addColorStop(0.8, "#a8781f");
    gi.addColorStop(1, "#3a2a0c");
    c.fillStyle = gi;
    c.beginPath();
    c.arc(260 + mx, 260, 78, 0, TAU);
    c.fill();
    c.strokeStyle = "rgba(60,40,8,.45)";
    c.lineWidth = 1.2;
    c.beginPath();
    for (let i = 0; i < 28; i++) {
      const an = (i / 28) * TAU;
      c.moveTo(260 + mx + Math.cos(an) * 40, 260 + Math.sin(an) * 40);
      c.lineTo(260 + mx + Math.cos(an) * 74, 260 + Math.sin(an) * 74);
    }
    c.stroke();
    c.fillStyle = "#050608";
    c.beginPath();
    c.arc(260 + mx, 260, 38, 0, TAU);
    c.fill();
    if (v > 0) {
      c.save();
      c.globalAlpha = a * ojo * v;
      c.translate(260 + mx, 260);
      c.scale(0.95, 0.95);
      c.translate(-32, -32);
      c.strokeStyle = `rgb(${ORO})`;
      c.lineWidth = 2.4;
      c.stroke(new Path2D(P_HEX));
      c.fillStyle = `rgb(${CLARO})`;
      c.fill(new Path2D(P_V));
      c.restore();
    }
    c.restore();
    c.globalAlpha = a * ojo;
    c.save();
    c.translate(0, 260);
    c.scale(1, Math.max(abre, 0.02));
    c.translate(0, -260);
    c.strokeStyle = `rgb(${ORO})`;
    c.lineWidth = 5;
    c.lineJoin = "round";
    c.stroke(pOjo);
    c.restore();
  } else if (v > 0) {
    // sin ojo: la V en su hexágono, sola en el centro
    c.globalAlpha = a * v;
    c.translate(260, 260);
    c.scale(1.6, 1.6);
    c.translate(-32, -32);
    c.strokeStyle = `rgb(${ORO})`;
    c.lineWidth = 2.4;
    c.stroke(new Path2D(P_HEX));
    c.fillStyle = `rgb(${CLARO})`;
    c.fill(new Path2D(P_V));
  }
  c.restore();
}

/** campo de partículas en coordenadas normalizadas (unidades de S desde el centro) */
function campo(n: number, semilla: number) {
  const r = azar(semilla);
  const x = new Float32Array(n);
  const y = new Float32Array(n);
  const vx = new Float32Array(n);
  const vy = new Float32Array(n);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = (r() - 0.5) * 2.2;
    y[i] = (r() - 0.5) * 2.2;
    vx[i] = (r() - 0.5) * 0.02;
    vy[i] = (r() - 0.5) * 0.02;
    s[i] = r();
  }
  return { n, x, y, vx, vy, s };
}

// ════════════════════════════════════════════════════════════════════
// 1 · EL DESPERTAR DEL OJO
// ════════════════════════════════════════════════════════════════════
function piezaOjo(_d: DatosCine, ex: ExtraCine, movil: boolean): Pieza {
  const P = campo(movil ? 160 : 320, 7);
  const T = tierra();
  const lote = new Lote();
  const etiquetas = (ex.etiquetas ?? []).slice(0, 8);
  return {
    titulo: "El despertar del ojo",
    dur: 11.4,
    frases: [
      [0.6, 3.3, "El mundo nunca deja de moverse. Nosotros nunca dejamos de observar"],
      [3.5, 6.0, "Donde otros ven acontecimientos, nosotros descubrimos conexiones"],
      [6.2, 7.8, "Nada ocurre en el vacío"],
      [8.0, 11.2, "El conocimiento comienza cuando aprendes a mirar"],
    ],
    cues: [
      [0.05, (s) => s.zumbido(11)],
      [2.45, (s) => s.golpe()],
      [3.0, (s) => s.soplo(1.8)],
      [8.6, (s) => s.ping(659)],
    ],
    dibujar(L, t) {
      const { ctx: c, W, H, S, cx, cy } = L;
      const k = Math.min(W * 0.92, H * 0.8, 640) / 360;
      // partículas: aparecen, derivan y el anillo las enciende al pasar
      const R = sale(fase(t, 3.0, 4.9)) * Math.hypot(W, H) * 0.62;
      const ap = fase(t, 0.3, 1.8) * (1 - fase(t, 10.2, 11.2));
      for (let i = 0; i < P.n; i += L.paso) {
        const px = cx + (P.x[i] + P.vx[i] * t) * S;
        const py = cy + (P.y[i] + P.vy[i] * t) * S;
        const dr = Math.abs(Math.hypot(px - cx, py - cy) - R);
        const enc = t > 3 && t < 5.2 ? Math.max(0, 1 - dr / 40) : 0;
        lote.add(px, py, 1 + P.s[i] * 1.4 + enc * 2, ap * (0.25 + 0.5 * P.s[i] + enc * 0.6), `rgb(${CLARO})`);
      }
      lote.pintar(c);
      // las siluetas del mundo: los países de verdad, alrededor del ojo
      const sil = fase(t, 3.8, 5.4) * (1 - fase(t, 8.2, 9.2));
      if (sil > 0) {
        const mw = Math.max(W * 1.05, k * 520);
        const mh = mw / 2;
        const ex2 = k * 170;
        const ey2 = k * 80;
        for (let i = 0; i < T.lat.length; i += movil ? 2 * L.paso : L.paso) {
          const px = cx + (T.lon[i] / 360) * mw;
          const py = cy - (T.lat[i] / 180) * mh;
          const e = ((px - cx) / ex2) ** 2 + ((py - cy) / ey2) ** 2;
          if (e < 1.1) continue;
          const onda = 0.5 + 0.5 * Math.sin(t * 2 + T.lon[i] * 0.05);
          lote.add(px, py, 1.6, sil * (0.16 + 0.18 * onda) * 2, `rgb(${ORO})`);
        }
        lote.pintar(c);
        // datos reales de la casa orbitando
        c.globalAlpha = 1;
        c.font = `600 ${movil ? 9.5 : 11}px ui-monospace, Menlo, monospace`;
        c.textAlign = "center";
        etiquetas.forEach((e, i) => {
          const an = (i / etiquetas.length) * TAU + t * 0.12;
          const rx = Math.min(W * 0.42, k * 250);
          const ry = Math.min(H * 0.3, k * 175);
          const x = cx + Math.cos(an) * rx;
          const y = cy + Math.sin(an) * ry;
          const ai = sil * fase(t, 4.2 + i * 0.12, 4.8 + i * 0.12);
          c.strokeStyle = `rgba(${ORO},${0.25 * ai})`;
          c.beginPath();
          c.moveTo(mezcla(cx, x, 0.62), mezcla(cy, y, 0.62));
          c.lineTo(mezcla(cx, x, 0.9), mezcla(cy, y, 0.9));
          c.stroke();
          c.fillStyle = `rgba(${CLARO},${0.85 * ai})`;
          const txt = e.toUpperCase();
          const mw2 = c.measureText(txt).width / 2 + 8;
          c.fillText(txt, cl(x, mw2, W - mw2), y + 4);
        });
      }
      // el anillo de escaneo
      if (t > 3 && t < 5.2) {
        const f = fase(t, 3.0, 5.2);
        c.strokeStyle = `rgba(${CLARO},${0.9 * (1 - f)})`;
        c.lineWidth = 2;
        c.beginPath();
        c.arc(cx, cy, R, 0, TAU);
        c.stroke();
        c.strokeStyle = `rgba(${ORO},${0.35 * (1 - f)})`;
        c.lineWidth = 14;
        c.beginPath();
        c.arc(cx, cy, Math.max(0, R - 9), 0, TAU);
        c.stroke();
        c.lineWidth = 1;
      }
      // el ojo: se dibuja, se abre con un destello y mira
      const fuera = 1 - fase(t, 8.2, 9.2);
      const trazo = fase(t, 0.9, 2.3);
      if (trazo > 0 && fuera > 0 && t < 2.8) {
        c.save();
        c.translate(cx, cy);
        c.scale(k, k);
        c.translate(-260, -260);
        c.globalAlpha = fuera * (1 - fase(t, 2.5, 2.8));
        c.strokeStyle = `rgba(${ORO},.9)`;
        c.lineWidth = 3;
        c.setLineDash([760 * suave(trazo), 800]);
        c.stroke(new Path2D(P_OJO));
        c.setLineDash([]);
        c.restore();
        const cabeza = t < 2.35;
        if (cabeza) luz(L, cx + (suave(trazo) < 0.5 ? -1 : 1) * k * 162 * Math.cos(suave(trazo) * Math.PI), cy, k * 40, 0.8);
      }
      const abre = suave(fase(t, 2.3, 2.8));
      if (abre > 0 && fuera > 0) {
        luz(L, cx, cy, k * 230, 0.35 * fuera);
        const parpadeo = t > 6.9 && t < 7.2 ? 1 - Math.sin(fase(t, 6.9, 7.2) * Math.PI) * 0.95 : 1;
        sello(L, cx, cy, k, fuera, { est: 0, ani: 0, abre: abre * parpadeo, mira: t > 3.5 ? Math.sin((t - 3.5) * 0.9) : 0 });
      }
      // destello al abrir
      const fl = t > 2.4 ? Math.max(0, 1 - (t - 2.45) / 0.7) : 0;
      if (fl > 0) {
        c.globalCompositeOperation = "lighter";
        luz(L, cx, cy, Math.max(W, H) * 0.9, fl * 0.9);
        c.globalCompositeOperation = "source-over";
      }
      // queda el símbolo
      const sim = sale(fase(t, 8.5, 9.6));
      if (sim > 0) {
        const fin = 1 - fase(t, 10.6, 11.4);
        luz(L, cx, cy, k * 200, 0.25 * sim * fin);
        sello(L, cx, cy, k * 0.62 * (0.9 + 0.1 * sim), sim * fin, { ojo: 0, v: 1 });
      }
    },
  };
}

// ════════════════════════════════════════════════════════════════════
// 2 · EL NACIMIENTO DE LA V
// ════════════════════════════════════════════════════════════════════
const FRASES_V = [
  "Una nueva perspectiva. Un universo sin fronteras",
  "El futuro no se contempla. Se explora",
  "Cada descubrimiento abre una nueva posibilidad",
];
function piezaV(_d: DatosCine, ex: ExtraCine, movil: boolean, material: Material): Pieza {
  const n = movil ? 300 : 680;
  const P = campo(n, 11);
  const lote = new Lote();
  const r = azar(23);
  // destinos dentro de cada mitad de la V (unidades del cuadro 64, centro 32,33.5)
  const tx = new Float32Array(n);
  const ty = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const pol = i % 2 ? V_DER : V_IZQ;
    let x = 0;
    let y = 0;
    for (let k = 0; k < 40; k++) {
      x = 17 + r() * 30;
      y = 20 + r() * 27;
      if (dentro(pol, x, y)) break;
    }
    tx[i] = x - 32;
    ty[i] = y - 33.5;
  }
  const borde = perimetro(V_BORDE);
  const frase = FRASES_V[(ex.cuenta ?? 0) % FRASES_V.length];
  const dato = ex.texto ?? (ex.cuenta ? `${ex.cuenta} salas descubiertas` : undefined);
  return {
    titulo: "El nacimiento de la V",
    dur: 9.2,
    frases: [[6.0, 9.0, frase]],
    marca: { a: 5.7, txt: "VANGUARD", dato },
    cues: [
      [0.1, (s) => s.zumbido(9)],
      [2.4, (s) => s.soplo(1.2)],
      [3.95, (s) => s.golpe()],
      [4.4, (s) => s.ping(880, 0.18)],
      [5.8, (s) => s.ping(1320, 0.16)],
    ],
    dibujar(L, t) {
      const { ctx: c, W, H, S, cx, cy } = L;
      const k = Math.min(W * 0.5, H * 0.3, 420) / 30; // la V mide 30 unidades
      const vy = cy - (movil ? 0.04 : 0.06) * H;
      const sep = Math.min(W * 0.26, k * 14);
      const fin = 1 - fase(t, 8.5, 9.2);
      // fase de partículas
      const jun = suave(fase(t, 3.0, 4.0));
      for (let i = 0; i < n; i += L.paso) {
        const d = P.s[i] * 0.6;
        const a1 = suave(fase(t, 1.0 + d, 2.6 + d));
        const lado = i % 2 ? 1 : -1;
        const gi = lado * 0.42 * (1 - jun);
        const ox = tx[i] * Math.cos(gi) - ty[i] * Math.sin(gi);
        const oy = tx[i] * Math.sin(gi) + ty[i] * Math.cos(gi);
        const sx = cx + ox * k + lado * sep * (1 - jun);
        const sy = vy + oy * k;
        const lx = cx + (P.x[i] + P.vx[i] * t) * S;
        const ly = cy + (P.y[i] + P.vy[i] * t) * S;
        let x = mezcla(lx, sx, a1);
        let y = mezcla(ly, sy, a1);
        if (material === "particulas" && t > 4) {
          x += Math.sin(t * 3 + i) * 0.8;
          y += Math.cos(t * 2.6 + i) * 0.8;
        }
        const desv = material === "particulas" ? 1 : 1 - 0.7 * fase(t, 4.0, 4.8);
        lote.add(x, y, 1.2 + P.s[i] * 1.6, fase(t, 0.2 + d, 1.2 + d) * (0.35 + 0.65 * P.s[i]) * desv * fin, i % 7 ? `rgb(${ORO})` : `rgb(${CLARO})`);
      }
      lote.pintar(c);
      // las dos estructuras: el contorno de cada mitad cuando ya está formada
      const est = fase(t, 2.2, 2.8) * (1 - jun);
      if (est > 0) {
        [V_IZQ, V_DER].forEach((pol, j) => {
          const lado = j ? 1 : -1;
          const gi = lado * 0.42 * (1 - jun);
          c.save();
          c.translate(cx + lado * sep * (1 - jun), vy);
          c.rotate(gi);
          c.scale(k, k);
          c.translate(-32, -33.5);
          c.strokeStyle = `rgba(${CLARO},${0.7 * est})`;
          c.lineWidth = 1.5 / k;
          c.beginPath();
          pol.forEach(([x, y], q) => (q ? c.lineTo(x, y) : c.moveTo(x, y)));
          c.closePath();
          c.stroke();
          c.restore();
        });
      }
      // el material
      const mat = fase(t, 4.0, 4.8) * fin;
      c.save();
      c.translate(cx, vy);
      c.scale(k, k);
      c.translate(-32, -33.5);
      const pV = new Path2D(P_V);
      if (mat > 0) {
        c.globalAlpha = mat;
        if (material === "metal") {
          const brillo = 17 + ((t - 4) * 18) % 50;
          const g = c.createLinearGradient(brillo - 12, 20, brillo + 12, 47);
          g.addColorStop(0, "#6d4f17");
          g.addColorStop(0.5, "#fff1c4");
          g.addColorStop(1, "#8a6420");
          c.fillStyle = "#b58a2e";
          c.fill(pV);
          c.fillStyle = g;
          c.globalAlpha = mat * 0.85;
          c.fill(pV);
        } else if (material === "cristal") {
          c.fillStyle = "rgba(200,232,255,.16)";
          c.fill(pV);
          c.strokeStyle = "rgba(255,255,255,.28)";
          c.lineWidth = 0.25;
          c.beginPath();
          V_BORDE.forEach(([x, y]) => {
            c.moveTo(32, 33);
            c.lineTo(x, y);
          });
          c.stroke();
          const sx = 10 + ((t - 4) * 22) % 60;
          c.save();
          c.clip(pV);
          const g = c.createLinearGradient(sx - 6, 0, sx + 6, 0);
          g.addColorStop(0, "rgba(255,255,255,0)");
          g.addColorStop(0.5, "rgba(255,255,255,.55)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          c.fillStyle = g;
          c.fillRect(0, 0, 64, 64);
          c.restore();
          c.strokeStyle = "rgba(225,245,255,.95)";
          c.lineWidth = 0.4;
          c.stroke(pV);
        } else if (material === "lineas") {
          c.save();
          c.clip(pV);
          c.strokeStyle = `rgba(${CLARO},.9)`;
          c.lineWidth = 0.35;
          const off = ((t * 6) % 1.6) - 1.6;
          c.beginPath();
          for (let y = 20 + off; y < 48; y += 1.6) {
            c.moveTo(16, y);
            c.lineTo(48, y);
          }
          c.stroke();
          c.restore();
          c.strokeStyle = `rgb(${ORO})`;
          c.lineWidth = 0.5;
          c.stroke(pV);
        }
      }
      // el hexágono se traza
      const hx = fase(t, 5.3, 6.3) * fin;
      if (hx > 0) {
        c.globalAlpha = hx;
        c.strokeStyle = `rgb(${ORO})`;
        c.lineWidth = 1.4;
        c.setLineDash([190 * suave(hx), 200]);
        c.translate(32, 33.5);
        c.scale(0.8, 0.8);
        c.translate(-32, -32);
        c.stroke(new Path2D(P_HEX));
        c.setLineDash([]);
      }
      c.restore();
      // la luz que recorre los bordes
      const rec = fase(t, 4.2, 5.8);
      if (rec > 0 && rec < 1) {
        c.globalCompositeOperation = "lighter";
        for (const dir of [1, -1]) {
          for (let q = 0; q < 6; q++) {
            const [bx, by] = borde(0.62 + dir * sale(rec) * 0.5 - dir * q * 0.012);
            luz(L, cx + (bx - 32) * k, vy + (by - 33.5) * k, k * (2.6 - q * 0.3), (1 - q / 6) * Math.sin(rec * Math.PI));
          }
        }
        c.globalCompositeOperation = "source-over";
      }
      if (jun > 0.95 && t < 4.6) {
        c.globalCompositeOperation = "lighter";
        luz(L, cx, vy, k * 22, (1 - fase(t, 4.0, 4.6)) * 0.8);
        c.globalCompositeOperation = "source-over";
      }
    },
  };
}

// ════════════════════════════════════════════════════════════════════
// 3 · EL PLANETA VANGUARD
// ════════════════════════════════════════════════════════════════════
const CIUDADES: [number, number][] = [
  [18.48, -69.93], // Santo Domingo
  [40.42, -3.7], // Madrid
  [-1.29, 36.82], // Nairobi
  [35.68, 139.69], // Tokio
  [-33.87, 151.21], // Sídney
  [40.71, -74.0], // Nueva York
  [-23.55, -46.63], // São Paulo
  [55.75, 37.62], // Moscú
];
const RUTAS: [number, number][] = [[0, 1], [0, 5], [0, 6], [1, 2], [1, 7], [5, 1], [7, 3], [3, 4], [2, 3]];
/** los cinco mundos de /worlds, con su caja geográfica */
const CONTINENTES: { n: string; la: [number, number]; lo: [number, number]; c: [number, number] }[] = [
  { n: "América", la: [-56, 72], lo: [-170, -30], c: [15, -80] },
  { n: "Europa", la: [35, 72], lo: [-25, 45], c: [52, 15] },
  { n: "África", la: [-36, 37], lo: [-20, 52], c: [5, 20] },
  { n: "Asia", la: [5, 78], lo: [45, 180], c: [45, 95] },
  { n: "Oceanía", la: [-48, 0], lo: [110, 180], c: [-25, 135] },
];
function piezaPlaneta(d: DatosCine, movil: boolean): Pieza {
  const T = tierra();
  const reg = new Int8Array(T.lat.length).fill(-1);
  for (let i = 0; i < T.lat.length; i++) {
    CONTINENTES.forEach((q, j) => {
      if (T.lat[i] >= q.la[0] && T.lat[i] <= q.la[1] && T.lon[i] >= q.lo[0] && T.lon[i] <= q.lo[1] && reg[i] < 0) reg[i] = j;
    });
  }
  const rad = Math.PI / 180;
  const lote = new Lote();
  const ventanas = d.ventanas.slice(0, 3);
  return {
    titulo: "El planeta Vanguard",
    dur: 10.6,
    frases: [
      [0.7, 3.7, "Un planeta. Millones de historias. Infinitas perspectivas"],
      [4.0, 6.7, "Cada territorio tiene una historia que contar"],
      [7.0, 9.8, "Comprender el mundo es comenzar a descubrirlo"],
    ],
    tarjetas: ventanas.map((v, i) => ({ a: 5.3 + i * 0.35, b: 8.6, kicker: v.label, txt: v.txt })),
    cues: [
      [0.05, (s) => s.zumbido(10.4)],
      [1.1, (s) => s.soplo(2.1)],
      [4.1, (s) => s.ping(523, 0.16)],
      [5.3, (s) => s.ping(659, 0.14)],
      [5.65, (s) => s.ping(784, 0.14)],
      [6.0, (s) => s.ping(988, 0.14)],
      [9.0, (s) => s.soplo(1.4)],
    ],
    velo: 0.95,
    dibujar(L, t) {
      const { ctx: c, W, H, S, cx } = L;
      const cy = L.cy + Math.sin(t * 1.4) * S * 0.012 * (1 - fase(t, 1, 3));
      const R0 = S * 0.05;
      const R1 = S * (movil ? 0.4 : 0.36);
      let R = mezcla(R0, R1, sale(fase(t, 1.1, 3.3)));
      R *= 1 - 0.16 * suave(fase(t, 8.2, 9.0));
      R *= 1 + 5 * entra(fase(t, 9.0, 10.4));
      const lon0 = -70 + t * 10;
      const lat0 = 14;
      const s0 = Math.sin(lat0 * rad);
      const c0 = Math.cos(lat0 * rad);
      const proj = (la: number, lo: number): [number, number, number] => {
        const sf = Math.sin(la * rad);
        const cf = Math.cos(la * rad);
        const l = (lo - lon0) * rad;
        const x = cf * Math.sin(l);
        const y = c0 * sf - s0 * cf * Math.cos(l);
        const z = s0 * sf + c0 * cf * Math.cos(l);
        return [cx + R * x, cy - R * y, z];
      };
      // atmósfera y esfera
      luz(L, cx, cy, R * 1.7, 0.28);
      const g = c.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      g.addColorStop(0, "#1c2a3c");
      g.addColorStop(0.7, "#0a1018");
      g.addColorStop(1, "#05070b");
      c.fillStyle = g;
      c.beginPath();
      c.arc(cx, cy, R, 0, TAU);
      c.fill();
      c.strokeStyle = `rgba(${ORO},.55)`;
      c.lineWidth = Math.max(1, R * 0.008);
      c.stroke();
      c.lineWidth = 1;
      // retícula: meridianos y paralelos
      const ret = fase(t, 2.8, 4.0);
      if (ret > 0) {
        c.strokeStyle = `rgba(${ORO},${0.22 * ret})`;
        c.beginPath();
        for (let lo = -180; lo < 180; lo += 30) {
          let ant = false;
          for (let la = -90; la <= 90; la += 6) {
            const [x, y, z] = proj(la, lo);
            if (z > 0) {
              if (ant) c.lineTo(x, y);
              else c.moveTo(x, y);
            }
            ant = z > 0;
          }
        }
        for (let la = -60; la <= 60; la += 30) {
          let ant = false;
          for (let lo = -180; lo <= 180; lo += 6) {
            const [x, y, z] = proj(la, lo);
            if (z > 0) {
              if (ant) c.lineTo(x, y);
              else c.moveTo(x, y);
            }
            ant = z > 0;
          }
        }
        c.stroke();
      }
      // la tierra: de esfera lisa a planeta detallado
      const det = fase(t, 1.6, 3.0);
      const enc = Math.floor((t - 5.0) / 0.55);
      const l0 = (lon0 * rad) as number;
      for (let i = 0; i < T.lat.length; i += L.paso) {
        const l = T.lon[i] * rad - l0;
        const cl2 = Math.cos(l);
        const z = s0 * T.sf[i] + c0 * T.cf[i] * cl2;
        if (z <= 0) continue;
        const x = cx + R * T.cf[i] * Math.sin(l);
        const y = cy - R * (c0 * T.sf[i] - s0 * T.cf[i] * cl2);
        const r = reg[i];
        const luzR = t > 5.0 && t < 8.4 && r >= 0 && r <= enc ? (r === enc ? 1 : 0.45) : 0;
        const zz = Math.max(1, (R / 150) * (0.6 + 0.6 * z) * (1 + luzR * 0.5));
        lote.add(x, y, zz, (0.15 + 0.85 * det) * (0.3 + 0.7 * z) * (0.75 + luzR * 0.25), luzR > 0.9 ? "#fff3c8" : luzR > 0 ? `rgb(${CLARO})` : `rgb(${ORO})`);
      }
      lote.pintar(c);
      // conexiones entre ciudades
      const con = fase(t, 4.0, 6.4) * (1 - fase(t, 8.6, 9.4));
      if (con > 0) {
        c.strokeStyle = `rgba(${CLARO},${0.7 * con})`;
        c.lineWidth = Math.max(1, R * 0.006);
        RUTAS.forEach(([a, b], q) => {
          const pr = sale(fase(t, 4.0 + q * 0.18, 5.2 + q * 0.18));
          const A = CIUDADES[a];
          const B = CIUDADES[b];
          c.beginPath();
          let ant = false;
          for (let u = 0; u <= pr + 1e-6; u += 0.04) {
            const la = mezcla(A[0], B[0], u);
            let dl = B[1] - A[1];
            if (dl > 180) dl -= 360;
            if (dl < -180) dl += 360;
            const lo = A[1] + dl * u;
            const [x, y, z] = proj(la, lo);
            const alto = 1 + Math.sin(u * Math.PI) * 0.12;
            const X = cx + (x - cx) * alto;
            const Y = cy + (y - cy) * alto;
            if (z > -0.05) {
              if (ant) c.lineTo(X, Y);
              else c.moveTo(X, Y);
            }
            ant = z > -0.05;
          }
          c.stroke();
        });
        c.lineWidth = 1;
        CIUDADES.forEach(([la, lo]) => {
          const [x, y, z] = proj(la, lo);
          if (z > 0) luz(L, x, y, R * 0.05, con * z);
        });
      }
      // coordenadas y nombres de los mundos
      const tx = fase(t, 3.2, 4.0) * (1 - fase(t, 8.6, 9.2));
      if (tx > 0) {
        c.font = `600 ${movil ? 9 : 11}px ui-monospace, Menlo, monospace`;
        c.textAlign = "left";
        const [x, y, z] = proj(18.48, -69.93);
        if (z > 0.1) {
          c.fillStyle = `rgba(${CLARO},${tx * z})`;
          c.fillRect(x - 2, y - 2, 4, 4);
          c.fillText("18.48°N · 69.93°W", x + 7, y - 6);
        }
        c.fillStyle = `rgba(${ORO},${0.55 * tx})`;
        [-30, 0, 30].forEach((la) => {
          const [, yy] = proj(la, lon0 - 88);
          c.fillText(la === 0 ? "0°" : `${Math.abs(la)}°${la > 0 ? "N" : "S"}`, cx - R - (movil ? 26 : 34), yy + 3);
        });
        if (t > 5.0 && t < 8.4) {
          c.textAlign = "center";
          c.font = `700 ${movil ? 11 : 14}px var(--font-orbitron, system-ui), system-ui, sans-serif`;
          CONTINENTES.forEach((q, j) => {
            if (j > enc) return;
            const [x2, y2, z2] = proj(q.c[0], q.c[1]);
            if (z2 < 0.2) return;
            c.fillStyle = `rgba(255,243,200,${(j === enc ? 1 : 0.55) * z2 * ventana(t, 5.0 + j * 0.55, 8.4, 0.3)})`;
            c.fillText(q.n.toUpperCase(), x2, y2);
          });
        }
      }
    },
  };
}

// ════════════════════════════════════════════════════════════════════
// 4 · EL RADAR DE LOS ACONTECIMIENTOS
// ════════════════════════════════════════════════════════════════════
function piezaRadar(d: DatosCine, movil: boolean): Pieza {
  const r = azar(41);
  const N = movil ? 34 : 48;
  const ba = new Float32Array(N);
  const br = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    ba[i] = r() * TAU;
    br[i] = 0.14 + r() * 0.82;
  }
  const pares: [number, number][] = [];
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++) {
      const dx = Math.cos(ba[i]) * br[i] - Math.cos(ba[j]) * br[j];
      const dy = Math.sin(ba[i]) * br[i] - Math.sin(ba[j]) * br[j];
      if (Math.hypot(dx, dy) < 0.3) pares.push([i, j]);
    }
  const ESP: [number, number][] = [[-0.6, 0.62], [1.9, 0.72], [3.6, 0.5]];
  const nov = d.novedades.slice(0, 3);
  const VEL = 2.4;
  const A0 = -Math.PI / 2;
  return {
    titulo: "El radar de los acontecimientos",
    dur: 10.2,
    frases: [
      [0.4, 2.9, "La información no espera. El conocimiento tampoco"],
      [3.1, 5.0, "Descubre lo que está ocurriendo"],
      [5.2, 7.6, "Cada acontecimiento tiene un contexto"],
      [7.8, 10.1, "Observa. Analiza. Comprende"],
    ],
    tarjetas: nov.map((n, i) => ({ a: 4.6 + i * 0.55, b: 8.4, kicker: `Novedad · ${n.version}`, txt: n.nombre })),
    cues: [
      [0.05, (s) => s.zumbido(10)],
      [0.8, (s) => s.ping(1760, 0.08)],
      [0.8 + TAU / VEL, (s) => s.ping(1760, 0.08)],
      [4.6, (s) => s.ping(784, 0.2)],
      [5.15, (s) => s.ping(988, 0.2)],
      [5.7, (s) => s.ping(1175, 0.2)],
      [8.1, (s) => s.golpe()],
    ],
    dibujar(L, t) {
      const { ctx: c, W, H, S, cx, cy } = L;
      const R = S * (movil ? 0.36 : 0.33) * (movil && H < 700 ? 0.86 : 1);
      const vive = 1 - suave(fase(t, 7.9, 9.0));
      const ang = A0 + Math.max(0, t - 0.8) * VEL;
      // anillos que se expanden
      const exp = sale(fase(t, 0, 1.2));
      c.strokeStyle = `rgba(${ORO},${0.45 * vive})`;
      c.lineWidth = 1;
      for (let q = 1; q <= 4; q++) {
        c.beginPath();
        c.arc(cx, cy, R * (q / 4) * exp, 0, TAU);
        c.stroke();
      }
      c.beginPath();
      c.moveTo(cx - R * exp, cy);
      c.lineTo(cx + R * exp, cy);
      c.moveTo(cx, cy - R * exp);
      c.lineTo(cx, cy + R * exp);
      c.stroke();
      c.beginPath();
      for (let q = 0; q < 72; q++) {
        const a = (q / 72) * TAU;
        const l = q % 6 ? 0.03 : 0.06;
        c.moveTo(cx + Math.cos(a) * R * exp, cy + Math.sin(a) * R * exp);
        c.lineTo(cx + Math.cos(a) * R * (1 + l) * exp, cy + Math.sin(a) * R * (1 + l) * exp);
      }
      c.stroke();
      // el barrido
      if (t > 0.8 && vive > 0) {
        const tramos = 14;
        for (let q = 0; q < tramos; q++) {
          c.fillStyle = `rgba(${ORO},${(0.22 * (1 - q / tramos)) * vive})`;
          c.beginPath();
          c.moveTo(cx, cy);
          c.arc(cx, cy, R, ang - (q + 1) * 0.05, ang - q * 0.05);
          c.closePath();
          c.fill();
        }
        c.strokeStyle = `rgba(${CLARO},${0.9 * vive})`;
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
        c.stroke();
        c.lineWidth = 1;
      }
      // puntos: aparecen cuando el barrido pasa por encima y quedan brillando
      const pos = (i: number): [number, number] => [cx + Math.cos(ba[i]) * br[i] * R, cy + Math.sin(ba[i]) * br[i] * R];
      const visto = (a: number) => {
        const da = (((a - A0) % TAU) + TAU) % TAU;
        return t > 0.8 + da / VEL;
      };
      const red = sale(fase(t, 3.4, 5.2)) * vive;
      if (red > 0) {
        c.strokeStyle = `rgba(${ORO},${0.35 * red})`;
        c.beginPath();
        pares.forEach(([i, j]) => {
          if (!visto(ba[i]) || !visto(ba[j])) return;
          const [x1, y1] = pos(i);
          const [x2, y2] = pos(j);
          c.moveTo(x1, y1);
          c.lineTo(mezcla(x1, x2, red), mezcla(y1, y2, red));
        });
        c.stroke();
      }
      for (let i = 0; i < N; i++) {
        if (!visto(ba[i])) continue;
        const dd = (((ang - ba[i]) % TAU) + TAU) % TAU;
        const b = Math.exp(-dd * 1.1);
        const [x, y] = pos(i);
        c.fillStyle = `rgba(${CLARO},${(0.35 + 0.65 * b) * vive})`;
        c.fillRect(x - 1.5, y - 1.5, 3, 3);
        if (b > 0.3) luz(L, x, y, 10, b * 0.5 * vive);
      }
      // las tres novedades REALES
      ESP.forEach(([a, rr], i) => {
        if (i >= nov.length) return;
        const on = fase(t, 4.6 + i * 0.55, 5.0 + i * 0.55) * vive;
        if (on <= 0) return;
        const x = cx + Math.cos(a) * rr * R;
        const y = cy + Math.sin(a) * rr * R;
        luz(L, x, y, 26, on);
        for (let q = 0; q < 2; q++) {
          const p = ((t - 4.6 - i * 0.55) * 0.8 + q * 0.5) % 1;
          c.strokeStyle = `rgba(${CLARO},${(1 - p) * on})`;
          c.beginPath();
          c.arc(x, y, 6 + p * 34, 0, TAU);
          c.stroke();
        }
        c.fillStyle = `rgba(255,243,200,${on})`;
        c.font = `700 ${movil ? 10 : 12}px ui-monospace, Menlo, monospace`;
        c.textAlign = "center";
        c.fillText(String(i + 1), x, y - 12);
      });
      // el radar se convierte en el símbolo
      const sim = sale(fase(t, 8.0, 9.2));
      if (sim > 0) {
        const fin = 1 - fase(t, 9.6, 10.2);
        const k = (R / 200) * mezcla(1.2, 0.86, sim);
        luz(L, cx, cy, R * 1.2, 0.3 * sim * fin);
        sello(L, cx, cy, k, sim * fin, { ojo: 1, abre: suave(fase(t, 8.5, 9.2)) });
      }
    },
  };
}

// ════════════════════════════════════════════════════════════════════
// 5 · EL UNIVERSO DE LOS MÓDULOS
// ════════════════════════════════════════════════════════════════════
function piezaPortales(ex: ExtraCine, movil: boolean): Pieza {
  const portales = ex.portales ?? [];
  const N = Math.max(1, portales.length);
  const obj = cl(ex.objetivo ?? 0, 0, N - 1);
  const r = azar(77);
  const F = 28;
  const fr = Array.from({ length: F }, (_, i) => ({ a: r() * TAU, d: 0.3 + r() * 0.5, g: r() * 6, p: i % N, s: 0.6 + r() * 0.8 }));
  const VEL = 0.36;
  // ángulo base: gira y, al final, deja el portal elegido delante (abajo, θ=π/2)
  const base = (t: number) => {
    const libre = (t - 2) * VEL;
    if (t < 7.2) return libre;
    const en72 = (7.2 - 2) * VEL;
    let meta = Math.PI / 2 - (obj / N) * TAU;
    while (meta < en72 + 0.6) meta += TAU;
    return mezcla(en72, meta, suave(fase(t, 7.2, 8.3)));
  };
  let ultimo: { x: number; y: number; r: number; i: number }[] = [];
  const nombre = portales[obj]?.nombre ?? "";
  return {
    titulo: "El universo de los módulos",
    dur: 10.6,
    frases: [
      [0.4, 2.5, "No existe una sola forma de descubrir el mundo"],
      [2.7, 4.9, "Cada módulo abre una nueva perspectiva"],
      [5.1, 7.3, "Un universo de conocimiento. Una sola plataforma"],
      [7.5, 10.3, "Explora más allá de lo conocido"],
    ],
    marca: nombre ? { a: 9.0, txt: nombre.toUpperCase() } : undefined,
    cues: [
      [0.05, (s) => s.zumbido(10.5)],
      [0.45, (s) => s.soplo(1.4)],
      ...portales.map((_, i) => [3.0 + i * 0.16, (s: Sonido) => s.ping(523 * Math.pow(1.26, i), 0.12)] as Cue),
      [8.3, (s) => s.soplo(1.6, true)],
      [9.5, (s) => s.golpe()],
    ],
    dibujar(L, t) {
      const { ctx: c, W, H, S, cx, cy } = L;
      const rx = Math.min(W * (movil ? 0.34 : 0.4), S * 0.5);
      const ry = rx * (movil ? 0.62 : 0.38);
      const pr0 = S * (movil ? 0.11 : 0.07);
      const b = base(t);
      const zoom = entra(fase(t, 8.3, 9.8));
      const tp = obj;
      const thT = b + (tp / N) * TAU;
      const fx = cx + Math.cos(thT) * rx;
      const fy = cy + Math.sin(thT) * ry;
      c.save();
      if (zoom > 0) {
        const Z = 1 + zoom * 26;
        c.translate(fx, fy);
        c.scale(Z, Z);
        c.translate(-fx, -fy);
      }
      // la V suspendida
      const vk = (S * 0.12) / 64;
      const flota = Math.sin(t * 1.3) * S * 0.01;
      const dibV = () => {
        luz(L, cx, cy + flota, S * 0.2, 0.35);
        c.save();
        c.translate(cx, cy + flota);
        c.scale(vk * 1.6, vk * 1.6);
        c.translate(-32, -32);
        c.globalAlpha = fase(t, 0, 0.6) * (1 - fase(zoom, 0, 0.08));
        c.strokeStyle = `rgb(${ORO})`;
        c.lineWidth = 2.4;
        c.stroke(new Path2D(P_HEX));
        c.fillStyle = `rgb(${CLARO})`;
        c.fill(new Path2D(P_V));
        c.restore();
        c.globalAlpha = 1;
      };
      const pos = (i: number) => {
        const th = b + (i / N) * TAU;
        const z = Math.sin(th);
        const e = 0.72 + 0.38 * ((z + 1) / 2);
        return { x: cx + Math.cos(th) * rx, y: cy + Math.sin(th) * ry, z, e };
      };
      const nace = fase(t, 3.0, 3.7);
      const orden = Array.from({ length: N }, (_, i) => i).sort((a, q) => pos(a).z - pos(q).z);
      const pintaPortal = (i: number) => {
        const p = pos(i);
        const po = portales[i];
        if (!po) return;
        const pr = pr0 * p.e * (0.3 + 0.7 * sale(nace));
        const al = nace * (0.55 + 0.45 * p.e) * (i === tp ? 1 : 1 - fase(t, 8.3, 8.9));
        if (al <= 0) return;
        c.save();
        c.globalAlpha = al;
        const g = c.createRadialGradient(p.x, p.y, pr * 0.1, p.x, p.y, pr * 1.3);
        g.addColorStop(0, `rgba(${po.color},.75)`);
        g.addColorStop(0.7, `rgba(${po.color},.18)`);
        g.addColorStop(1, `rgba(${po.color},0)`);
        c.fillStyle = g;
        c.beginPath();
        c.ellipse(p.x, p.y, pr * 0.82, pr * 1.12, 0, 0, TAU);
        c.fill();
        c.strokeStyle = po.tono === "nuevo" ? `rgb(${CLARO})` : `rgba(${ORO},.9)`;
        c.lineWidth = Math.max(1.2, pr * 0.05);
        c.beginPath();
        c.ellipse(p.x, p.y, pr * 0.82, pr * 1.12, 0, 0, TAU);
        c.stroke();
        c.lineWidth = 1;
        c.setLineDash([3, 6]);
        c.lineDashOffset = -t * 20;
        c.beginPath();
        c.ellipse(p.x, p.y, pr * 0.98, pr * 1.3, 0, 0, TAU);
        c.stroke();
        c.setLineDash([]);
        if (t < 8.3) {
          c.textAlign = "center";
          c.fillStyle = `rgba(255,243,200,${0.6 + 0.4 * p.e})`;
          c.font = `700 ${Math.round((movil ? 10 : 13) * (0.85 + 0.25 * p.e))}px var(--font-orbitron, system-ui), system-ui, sans-serif`;
          c.fillText(po.nombre.toUpperCase(), p.x, p.y + pr * 1.3 + 15);
          c.font = `600 ${movil ? 8.5 : 10}px ui-monospace, Menlo, monospace`;
          c.fillStyle = po.tono === "nuevo" ? `rgb(${CLARO})` : po.tono === "vacio" ? "rgb(150,220,240)" : `rgba(${ORO},.75)`;
          c.fillText(po.estado, p.x, p.y + pr * 1.3 + 28);
        }
        c.restore();
        ultimo.push({ x: p.x, y: p.y, r: pr * 1.3, i });
      };
      ultimo = [];
      // fragmentos: salen de la V y se convierten en portales
      const sal = sale(fase(t, 0.4, 2.0));
      const jun = suave(fase(t, 2.0, 3.4));
      if (jun < 1) {
        c.fillStyle = `rgba(${ORO},.8)`;
        c.strokeStyle = `rgba(${CLARO},.9)`;
        fr.forEach((f, q) => {
          const p = pos(f.p);
          const ox = cx + Math.cos(f.a) * f.d * S * sal;
          const oy = cy + Math.sin(f.a) * f.d * S * 0.6 * sal;
          const an = f.a + (q / F) * TAU;
          const x = mezcla(ox, p.x + Math.cos(an) * pr0 * 0.9, jun);
          const y = mezcla(oy, p.y + Math.sin(an) * pr0 * 1.2, jun);
          const z = S * 0.014 * f.s;
          c.save();
          c.globalAlpha = fase(t, 0.4, 0.8) * (1 - nace);
          c.translate(x, y);
          c.rotate(f.g + t * 2);
          c.beginPath();
          c.moveTo(0, -z);
          c.lineTo(z * 0.9, z * 0.7);
          c.lineTo(-z * 0.9, z * 0.7);
          c.closePath();
          c.fill();
          c.stroke();
          c.restore();
        });
      }
      orden.filter((i) => pos(i).z < 0).forEach(pintaPortal);
      if (zoom < 0.08) dibV();
      orden.filter((i) => pos(i).z >= 0).forEach(pintaPortal);
      c.restore();
      if (zoom > 0.55) {
        const po = portales[tp];
        if (po) {
          c.fillStyle = `rgba(${po.color},${0.35 * fase(zoom, 0.55, 1)})`;
          c.fillRect(0, 0, W, H);
        }
      }
    },
    clic(_L, t, x, y) {
      if (t < 3.4 || t > 8.2) return null;
      for (let q = ultimo.length - 1; q >= 0; q--) {
        const u = ultimo[q];
        if (Math.hypot(x - u.x, y - u.y) < u.r * 1.2) return { ir: portales[u.i]?.nav };
      }
      return null;
    },
  };
}

// ════════════════════════════════════════════════════════════════════
// LOS DESTELLOS — sorpresas pequeñas, sin bloquear nada (pointer-events:none)
// ════════════════════════════════════════════════════════════════════
function piezaDestello(tipo: TipoEscena, ex: ExtraCine, movil: boolean): Pieza {
  const esquina = (L: Lienzo): [number, number] => [L.W - (movil ? 54 : 84), L.H - (movil ? 150 : 96)];
  const comun = { mini: true, frases: [] as Frase[], velo: 0 };
  if (tipo === "d-anillo")
    return {
      ...comun,
      titulo: "Expansión",
      dur: 4,
      chip: { txt: "Cada descubrimiento abre una nueva posibilidad" },
      cues: [[0.05, (s) => s.soplo(1.4)]],
      dibujar(L, t) {
        const [x, y] = esquina(L);
        for (let q = 0; q < 3; q++) {
          const f = fase(t, q * 0.35, 2.6 + q * 0.35);
          if (f <= 0 || f >= 1) continue;
          L.ctx.strokeStyle = `rgba(${CLARO},${0.6 * (1 - f)})`;
          L.ctx.lineWidth = 2 - q * 0.5;
          L.ctx.beginPath();
          L.ctx.arc(x, y, sale(f) * Math.hypot(L.W, L.H), 0, TAU);
          L.ctx.stroke();
        }
        L.ctx.lineWidth = 1;
        luz(L, x, y, 50, 1 - fase(t, 0, 1.2));
      },
    };
  if (tipo === "d-ojo")
    return {
      ...comun,
      titulo: "El ojo",
      dur: 4.2,
      chip: { txt: "Nosotros nunca dejamos de observar" },
      cues: [[0.3, (s) => s.ping(659, 0.14)]],
      dibujar(L, t) {
        const [x, y] = esquina(L);
        const abre = suave(fase(t, 0.2, 0.7)) * (1 - suave(fase(t, 3.4, 3.9)));
        const parp = t > 2.2 && t < 2.45 ? 1 - Math.sin(fase(t, 2.2, 2.45) * Math.PI) * 0.95 : 1;
        luz(L, x, y, 70, 0.4 * abre);
        sello(L, x, y, movil ? 0.17 : 0.22, 1 - fase(t, 3.6, 4.2), { est: 0, ani: abre, abre: abre * parp, mira: Math.sin(t * 2.2) });
      },
    };
  if (tipo === "d-v") {
    const P = campo(90, 5);
    return {
      ...comun,
      titulo: "La V",
      dur: 4,
      chip: { txt: "El futuro no se contempla. Se explora" },
      cues: [[1.2, (s) => s.ping(880, 0.14)]],
      dibujar(L, t) {
        const [x, y] = esquina(L);
        const k = movil ? 1.5 : 2;
        const pf = perimetro(V_BORDE);
        const j = suave(fase(t, 0.2, 1.4));
        const fin = 1 - fase(t, 3.2, 4);
        for (let i = 0; i < P.n; i++) {
          const [bx, by] = pf(i / P.n);
          const tx = x + (bx - 32) * k;
          const ty = y + (by - 33.5) * k;
          const sx = x + P.x[i] * 160;
          const sy = y + P.y[i] * 160;
          L.ctx.globalAlpha = fin * (0.4 + 0.6 * P.s[i]);
          L.ctx.fillStyle = `rgb(${CLARO})`;
          L.ctx.fillRect(mezcla(sx, tx, j), mezcla(sy, ty, j), 1.8, 1.8);
        }
        L.ctx.globalAlpha = 1;
        luz(L, x, y, 46, 0.5 * fase(t, 1.2, 1.6) * fin);
      },
    };
  }
  if (tipo === "d-radar")
    return {
      ...comun,
      titulo: "Radar",
      dur: 4.4,
      chip: { txt: ex.cuenta != null && ex.total ? `Has descubierto ${ex.cuenta} de ${ex.total} salas` : "Descubre lo que está ocurriendo" },
      cues: [[0.4, (s) => s.ping(1760, 0.08)]],
      dibujar(L, t) {
        const [x, y] = esquina(L);
        const R = movil ? 34 : 44;
        const al = fase(t, 0, 0.4) * (1 - fase(t, 3.8, 4.4));
        const c = L.ctx;
        c.strokeStyle = `rgba(${ORO},${0.6 * al})`;
        [0.5, 1].forEach((q) => {
          c.beginPath();
          c.arc(x, y, R * q, 0, TAU);
          c.stroke();
        });
        const a = -Math.PI / 2 + t * 2.2;
        for (let q = 0; q < 10; q++) {
          c.fillStyle = `rgba(${ORO},${0.25 * (1 - q / 10) * al})`;
          c.beginPath();
          c.moveTo(x, y);
          c.arc(x, y, R, a - (q + 1) * 0.06, a - q * 0.06);
          c.closePath();
          c.fill();
        }
        const tot = Math.max(1, ex.total ?? 1);
        const n = Math.min(24, Math.round(((ex.cuenta ?? 0) / tot) * 24));
        for (let q = 0; q < 24; q++) {
          const an = (q / 24) * TAU;
          c.fillStyle = q < n ? `rgba(${CLARO},${al})` : `rgba(${ORO},${0.25 * al})`;
          c.fillRect(x + Math.cos(an) * R * 1.18 - 1.5, y + Math.sin(an) * R * 1.18 - 1.5, 3, 3);
        }
      },
    };
  // d-portal
  return {
    ...comun,
    titulo: "Portal",
    dur: 6,
    chip: ex.modulo ? { txt: `Aún no has entrado en ${ex.modulo.nombre} →`, href: ex.modulo.nav } : { txt: "Explora más allá de lo conocido" },
    cues: [[0.2, (s) => s.soplo(1.2)]],
    dibujar(L, t) {
      const [x, y] = esquina(L);
      const c = L.ctx;
      const ab = sale(fase(t, 0.1, 0.9)) * (1 - suave(fase(t, 5.2, 6)));
      const pr = (movil ? 26 : 34) * ab;
      if (pr <= 0.5) return;
      const g = c.createRadialGradient(x, y, 1, x, y, pr * 1.3);
      g.addColorStop(0, "rgba(150,220,240,.7)");
      g.addColorStop(1, "rgba(150,220,240,0)");
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(x, y, pr * 0.82, pr * 1.12, 0, 0, TAU);
      c.fill();
      c.strokeStyle = `rgba(${CLARO},.9)`;
      c.stroke();
      c.setLineDash([3, 6]);
      c.lineDashOffset = -t * 20;
      c.beginPath();
      c.ellipse(x, y, pr, pr * 1.32, 0, 0, TAU);
      c.stroke();
      c.setLineDash([]);
    },
  };
}

function crearPieza(p: EscenaProps, movil: boolean): Pieza {
  const ex = p.extra ?? {};
  switch (p.tipo) {
    case "ojo":
      return piezaOjo(p.datos, ex, movil);
    case "v":
      return piezaV(p.datos, ex, movil, p.material ?? "metal");
    case "planeta":
      return piezaPlaneta(p.datos, movil);
    case "radar":
      return piezaRadar(p.datos, movil);
    case "portales":
      return piezaPortales(ex, movil);
    default:
      return piezaDestello(p.tipo, ex, movil);
  }
}

// ════════════════════════════════════════════════════════════════════
// EL COMPONENTE
// ════════════════════════════════════════════════════════════════════
export default function Escena(props: EscenaProps) {
  const raiz = useRef<HTMLDivElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const fraseRef = useRef<HTMLParagraphElement>(null);
  const marcaRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const tarjRef = useRef<HTMLDivElement>(null);
  const mudoRef = useRef<HTMLButtonElement>(null);
  const saltarRef = useRef<HTMLButtonElement>(null);
  const finRef = useRef<(r?: FinCine) => void>(() => {});
  const movil = typeof window !== "undefined" && window.innerWidth < 760;
  const pieza = useRef<Pieza | null>(null);
  if (!pieza.current) pieza.current = crearPieza(props, movil);
  const P = pieza.current;

  useEffect(() => {
    const cv = lienzo.current;
    const el = raiz.current;
    if (!cv || !el) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    // sprite de brillo (una vez)
    const brillo = document.createElement("canvas");
    brillo.width = brillo.height = 64;
    const bc = brillo.getContext("2d");
    if (bc) {
      const g = bc.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,244,210,1)");
      g.addColorStop(0.25, `rgba(${CLARO},.55)`);
      g.addColorStop(0.6, `rgba(${ORO},.14)`);
      g.addColorStop(1, `rgba(${ORO},0)`);
      bc.fillStyle = g;
      bc.fillRect(0, 0, 64, 64);
    }
    const L: Lienzo = { ctx, W: 0, H: 0, S: 0, cx: 0, cy: 0, movil, brillo, paso: 1 };
    let tope = 2;
    let dpr = 1;
    const medir = () => {
      L.W = window.innerWidth;
      L.H = window.innerHeight;
      L.movil = L.W < 760;
      dpr = Math.min(window.devicePixelRatio || 1, L.movil ? 1.5 : 2, tope);
      cv.width = Math.round(L.W * dpr);
      cv.height = Math.round(L.H * dpr);
      L.S = Math.min(L.W, L.H * (L.movil ? 0.62 : 1));
      L.cx = L.W / 2;
      const hayTarj = !!P.tarjetas?.length;
      L.cy = L.H * (L.movil ? (hayTarj ? 0.52 : 0.42) : 0.45);
      if (!L.movil && hayTarj) L.cx = Math.min(L.W / 2, L.W - 360 - L.S * 0.38);
    };
    medir();
    window.addEventListener("resize", medir);

    const sonido = crearSonido(!!P.mini);
    let mudo = false;
    try {
      mudo = localStorage.getItem("vg-cine:mudo") === "1";
    } catch {
      /* nada */
    }
    if (mudoRef.current) {
      mudoRef.current.setAttribute("aria-pressed", String(mudo));
      mudoRef.current.textContent = mudo ? "Sonido: no" : "Sonido: sí";
    }
    const cues = P.cues.slice().sort((a, b) => a[0] - b[0]);
    let ci = 0;
    let t = 0;
    let ant = performance.now();
    let raf = 0;
    let acabando = -1;
    let terminado = false;
    let fraseActual = -1;
    let media = 1 / 60;
    let cuadros = 0;
    const tarjetas = tarjRef.current ? Array.from(tarjRef.current.children) as HTMLElement[] : [];
    const velo = P.velo ?? 0.94;

    const terminar = (r?: FinCine) => {
      if (terminado) return;
      terminado = true;
      cancelAnimationFrame(raf);
      sonido?.cerrar();
      props.onFin(r);
    };
    const cerrar = (r?: FinCine) => {
      if (acabando >= 0) return;
      if (r?.ir) return terminar(r);
      acabando = t;
      finRef.current = () => {};
      if (P.mini) return terminar(r);
      // fundido de 0,5 s y fuera
      const t0 = performance.now();
      const fx = () => {
        const k = cl((performance.now() - t0) / 500);
        el.style.opacity = String(1 - k);
        if (k < 1) requestAnimationFrame(fx);
        else terminar(r);
      };
      requestAnimationFrame(fx);
    };
    finRef.current = cerrar;

    const cuadro = (ahora: number) => {
      const dt = Math.min(0.1, (ahora - ant) / 1000);
      ant = ahora;
      t += dt;
      // calidad adaptable: si los cuadros pasan de ~30 ms, menos resolución y menos puntos
      media = media * 0.9 + dt * 0.1;
      if (++cuadros > 20 && media > 0.03 && L.paso < 2) {
        L.paso = 2;
        tope = 1;
        medir();
      }
      // sonido
      while (ci < cues.length && cues[ci][0] <= t) {
        if (sonido && !mudo) {
          try {
            cues[ci][1](sonido);
          } catch {
            /* sin sonido no pasa nada */
          }
        }
        ci++;
      }
      // fondo
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, L.W, L.H);
      if (velo > 0 && t < 0.75) el.style.background = `rgba(3,4,7,${(velo * fase(t, 0, 0.6)).toFixed(3)})`;
      ctx.lineCap = "round";
      try {
        P.dibujar(L, t);
      } catch {
        /* una pieza que falla no rompe la casa: se cierra */
        cerrar();
        return;
      }
      // frases
      const f = fraseRef.current;
      if (f) {
        let idx = -1;
        let al = 0;
        P.frases.forEach(([a, b], i) => {
          const w = ventana(t, a, b);
          if (w > 0) {
            idx = i;
            al = w;
          }
        });
        if (idx !== fraseActual) {
          fraseActual = idx;
          if (idx >= 0) f.textContent = P.frases[idx][2];
        }
        f.style.opacity = idx >= 0 ? String(al) : "0";
        f.style.transform = `translate3d(0,${(1 - al) * 14}px,0)`;
      }
      if (P.marca && marcaRef.current) {
        const k = sale(fase(t, P.marca.a, P.marca.a + 0.8)) * (1 - fase(t, P.dur - 0.6, P.dur));
        marcaRef.current.style.opacity = String(k);
        marcaRef.current.style.transform = `translate3d(-50%,0,0) scale(${0.92 + 0.08 * k})`;
      }
      if (P.chip && chipRef.current) {
        const k = ventana(t, 0.3, P.dur - 0.1, 0.4);
        chipRef.current.style.opacity = String(k);
        chipRef.current.style.transform = `translate3d(0,${(1 - k) * 10}px,0)`;
      }
      tarjetas.forEach((tj, i) => {
        const d = P.tarjetas?.[i];
        if (!d) return;
        const k = ventana(t, d.a, d.b, 0.4);
        tj.style.opacity = String(k);
        tj.style.transform = `translate3d(${(1 - k) * 18}px,0,0)`;
      });
      if (t >= P.dur) {
        cerrar();
        return;
      }
      raf = requestAnimationFrame(cuadro);
    };
    raf = requestAnimationFrame(cuadro);

    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !P.mini) cerrar();
    };
    window.addEventListener("keydown", tecla);
    const toque = (e: PointerEvent) => {
      if (!P.clic) return;
      const r = P.clic(L, t, e.clientX, e.clientY);
      if (r?.ir) cerrar(r);
    };
    if (!P.mini) cv.addEventListener("pointerup", toque);
    const mb = mudoRef.current;
    const alternar = () => {
      mudo = !mudo;
      try {
        localStorage.setItem("vg-cine:mudo", mudo ? "1" : "0");
      } catch {
        /* nada */
      }
      sonido?.silencio(mudo);
      if (mb) {
        mb.setAttribute("aria-pressed", String(mudo));
        mb.textContent = mudo ? "Sonido: no" : "Sonido: sí";
      }
    };
    mb?.addEventListener("click", alternar);
    if (!P.mini) saltarRef.current?.focus({ preventScroll: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", medir);
      window.removeEventListener("keydown", tecla);
      cv.removeEventListener("pointerup", toque);
      mb?.removeEventListener("click", alternar);
      if (!terminado) sonido?.cerrar();
    };
    // la escena se monta una vez por disparo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={raiz}
      className={P.mini ? "vc vc-mini" : "vc"}
      data-tipo={props.tipo}
      role={P.mini ? undefined : "dialog"}
      aria-modal={P.mini ? undefined : false}
      aria-label={`VANGUARD · ${P.titulo}`}
    >
      <canvas ref={lienzo} className="vc-lienzo" aria-hidden="true" />
      {P.marca && (
        <div ref={marcaRef} className="vc-marca" style={{ opacity: 0 }}>
          <span>{P.marca.txt}</span>
          {P.marca.dato && <small>{P.marca.dato}</small>}
        </div>
      )}
      {!P.mini && (
        <p ref={fraseRef} className="vc-frase" aria-live="polite" style={{ opacity: 0 }} />
      )}
      {P.tarjetas && (
        <div ref={tarjRef} className="vc-tarjetas">
          {P.tarjetas.map((tj, i) => (
            <div key={i} className="vc-tarjeta" style={{ opacity: 0 }}>
              <b>{tj.kicker}</b>
              <span>{tj.txt}</span>
            </div>
          ))}
        </div>
      )}
      {P.chip && (
        <div ref={chipRef} className="vc-chip" style={{ opacity: 0 }}>
          {P.chip.href ? (
            <a
              href={P.chip.href}
              onClick={(e) => {
                e.preventDefault();
                finRef.current({ ir: P.chip?.href });
              }}
            >
              {P.chip.txt}
            </a>
          ) : (
            <span>{P.chip.txt}</span>
          )}
        </div>
      )}
      {!P.mini && (
        <div className="vc-mandos">
          <button ref={mudoRef} type="button" className="vc-boton" aria-pressed="false">
            Sonido: sí
          </button>
          <button ref={saltarRef} type="button" className="vc-boton vc-saltar" onClick={() => finRef.current()}>
            Saltar ›
          </button>
        </div>
      )}
    </div>
  );
}
