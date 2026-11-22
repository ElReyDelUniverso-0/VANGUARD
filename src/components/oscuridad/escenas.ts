// ═══════════════════════════════════════════════════════════════════
// v442.0 · LA OSCURIDAD PROFUNDA — el clima de fondo de la casa
//
// Ocho escenas que se turnan al azar detrás de Vanguard: lluvia, tormenta,
// día de sol, niebla, nieve, noche estrellada, aurora boreal y brasas.
// Se pintan en un lienzo de baja resolución (la mitad de la pantalla) y muy
// tenues: se sienten, no se miran. Cero dependencias, cero imágenes.
//
// Cada escena reutiliza su propio arreglo de partículas (ninguna
// asignación por fotograma) y pinta en lotes (un solo path por capa).
// ═══════════════════════════════════════════════════════════════════

export type NombreEscena = "lluvia" | "tormenta" | "sol" | "niebla" | "nieve" | "estrellas" | "aurora" | "brasas";

export const ESCENAS: NombreEscena[] = ["lluvia", "tormenta", "sol", "niebla", "nieve", "estrellas", "aurora", "brasas"];

export interface Escena {
  nombre: NombreEscena;
  /** Prepara las partículas para un lienzo w×h (px del lienzo) con densidad 0…1. */
  iniciar(w: number, h: number, densidad: number): void;
  /** Pinta un fotograma. dt en segundos, t en segundos, a = opacidad de la escena (0…1). */
  pintar(c: CanvasRenderingContext2D, w: number, h: number, dt: number, t: number, a: number): void;
}

const azar = (a: number, b: number) => a + Math.random() * (b - a);

// ─────────────────────────── LLUVIA / TORMENTA ───────────────────────────
function crearLluvia(tormenta: boolean): Escena {
  let gotas: { x: number; y: number; l: number; v: number }[] = [];
  let viento = 0;
  let proximoRayo = azar(5, 12);
  let rayo = -1; // segundos desde el inicio del rayo, -1 = ninguno
  let rayoX = 0.5;
  return {
    nombre: tormenta ? "tormenta" : "lluvia",
    iniciar(w, h, d) {
      const n = Math.round((tormenta ? 190 : 120) * d);
      viento = tormenta ? azar(0.18, 0.3) : azar(0.06, 0.14);
      gotas = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, l: azar(6, tormenta ? 16 : 12), v: azar(tormenta ? 420 : 300, tormenta ? 620 : 440) }));
      proximoRayo = azar(4, 10);
      rayo = -1;
    },
    pintar(c, w, h, dt, t, a) {
      c.lineWidth = 1;
      c.strokeStyle = `rgba(165,185,215,${(tormenta ? 0.5 : 0.42) * a})`;
      c.beginPath();
      for (const g of gotas) {
        g.y += g.v * dt;
        g.x += g.v * viento * dt;
        if (g.y > h + g.l) {
          g.y = -g.l - Math.random() * 40;
          g.x = Math.random() * (w + h * viento) - h * viento;
        }
        if (g.x > w + 20) g.x -= w + 40;
        c.moveTo(g.x, g.y);
        c.lineTo(g.x - g.l * viento, g.y - g.l);
      }
      c.stroke();
      if (!tormenta) return;
      // Rayo: dos pulsos suaves y lejanos, nunca un estroboscopio (mínimo 4 s entre rayos).
      proximoRayo -= dt;
      if (proximoRayo <= 0 && rayo < 0) {
        rayo = 0;
        rayoX = azar(0.15, 0.85);
        proximoRayo = azar(7, 18);
      }
      if (rayo >= 0) {
        rayo += dt;
        const p = rayo < 0.12 ? rayo / 0.12 : rayo < 0.22 ? 1 - (rayo - 0.12) / 0.1 : rayo < 0.34 ? ((rayo - 0.22) / 0.12) * 0.6 : Math.max(0, 0.6 - (rayo - 0.34) / 0.9);
        if (rayo > 1.3) rayo = -1;
        const gr = c.createRadialGradient(rayoX * w, 0, 0, rayoX * w, 0, h * 1.1);
        gr.addColorStop(0, `rgba(200,215,255,${0.38 * p * a})`);
        gr.addColorStop(1, "rgba(200,215,255,0)");
        c.fillStyle = gr;
        c.fillRect(0, 0, w, h);
      }
      void t;
    },
  };
}

// ─────────────────────────── DÍA DE SOL ───────────────────────────
function crearSol(): Escena {
  let motas: { x: number; y: number; r: number; vx: number; vy: number; f: number }[] = [];
  let izq = true;
  return {
    nombre: "sol",
    iniciar(w, h, d) {
      izq = Math.random() < 0.5;
      motas = Array.from({ length: Math.round(46 * d) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: azar(0.6, 1.8), vx: azar(-6, 6), vy: azar(-5, 3), f: Math.random() * 6.28 }));
    },
    pintar(c, w, h, dt, t, a) {
      const sx = izq ? -w * 0.05 : w * 1.05;
      const sy = -h * 0.12;
      // halo cálido de la fuente
      const halo = c.createRadialGradient(sx, sy, 0, sx, sy, Math.max(w, h) * 0.75);
      halo.addColorStop(0, `rgba(255,200,120,${0.32 * a})`);
      halo.addColorStop(0.4, `rgba(255,170,80,${0.1 * a})`);
      halo.addColorStop(1, "rgba(255,170,80,0)");
      c.fillStyle = halo;
      c.fillRect(0, 0, w, h);
      // rayos de luz: abanico que se mece despacio
      const L = Math.hypot(w, h) * 1.3;
      c.save();
      c.translate(sx, sy);
      const base = izq ? 0.55 : Math.PI - 0.55;
      for (let i = 0; i < 6; i++) {
        const ang = base + (izq ? 1 : -1) * (i * 0.16 - 0.35 + Math.sin(t * 0.07 + i * 1.7) * 0.05);
        const ancho = 0.035 + 0.02 * Math.sin(t * 0.11 + i);
        const alfa = (0.06 + 0.04 * Math.sin(t * 0.2 + i * 2.1)) * a;
        const g = c.createLinearGradient(0, 0, Math.cos(ang) * L, Math.sin(ang) * L);
        g.addColorStop(0, `rgba(255,214,150,${alfa})`);
        g.addColorStop(1, "rgba(255,214,150,0)");
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(Math.cos(ang - ancho) * L, Math.sin(ang - ancho) * L);
        c.lineTo(Math.cos(ang + ancho) * L, Math.sin(ang + ancho) * L);
        c.closePath();
        c.fill();
      }
      c.restore();
      // polvo dorado flotando en la luz
      c.fillStyle = `rgba(255,222,160,${0.55 * a})`;
      c.beginPath();
      for (const m of motas) {
        m.x += m.vx * dt;
        m.y += m.vy * dt + Math.sin(t * 0.6 + m.f) * 4 * dt;
        if (m.x < -4) m.x = w + 4;
        if (m.x > w + 4) m.x = -4;
        if (m.y < -4) m.y = h + 4;
        if (m.y > h + 4) m.y = -4;
        const r = m.r * (0.6 + 0.4 * Math.sin(t * 1.3 + m.f));
        c.moveTo(m.x + r, m.y);
        c.arc(m.x, m.y, Math.max(0.2, r), 0, 6.283);
      }
      c.fill();
    },
  };
}

// ─────────────────────────── NIEBLA ───────────────────────────
function crearNiebla(): Escena {
  let bancos: { x: number; y: number; r: number; v: number }[] = [];
  return {
    nombre: "niebla",
    iniciar(w, h) {
      bancos = Array.from({ length: 7 }, (_, i) => ({ x: Math.random() * w, y: h * (0.15 + (i / 7) * 0.85), r: azar(0.35, 0.6) * Math.max(w, h), v: azar(4, 11) * (Math.random() < 0.5 ? -1 : 1) }));
    },
    pintar(c, w, _h, dt, _t, a) {
      for (const b of bancos) {
        b.x += b.v * dt;
        if (b.x - b.r > w) b.x = -b.r;
        if (b.x + b.r < 0) b.x = w + b.r;
        const g = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(150,160,175,${0.13 * a})`);
        g.addColorStop(1, "rgba(150,160,175,0)");
        c.fillStyle = g;
        c.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
      }
    },
  };
}

// ─────────────────────────── NIEVE ───────────────────────────
function crearNieve(): Escena {
  let copos: { x: number; y: number; r: number; v: number; f: number }[] = [];
  return {
    nombre: "nieve",
    iniciar(w, h, d) {
      copos = Array.from({ length: Math.round(110 * d) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: azar(0.5, 1.9), v: azar(12, 34), f: Math.random() * 6.28 }));
    },
    pintar(c, w, h, dt, t, a) {
      c.fillStyle = `rgba(235,240,250,${0.62 * a})`;
      c.beginPath();
      for (const s of copos) {
        s.y += s.v * dt;
        s.x += Math.sin(t * 0.8 + s.f) * 10 * dt;
        if (s.y > h + 3) {
          s.y = -3;
          s.x = Math.random() * w;
        }
        c.moveTo(s.x + s.r, s.y);
        c.arc(s.x, s.y, s.r, 0, 6.283);
      }
      c.fill();
    },
  };
}

// ─────────────────────────── NOCHE ESTRELLADA ───────────────────────────
function crearEstrellas(): Escena {
  let estrellas: { x: number; y: number; r: number; f: number; v: number }[] = [];
  let fugaz: { x: number; y: number; vx: number; vy: number; vida: number } | null = null;
  let proxima = azar(4, 9);
  return {
    nombre: "estrellas",
    iniciar(w, h, d) {
      estrellas = Array.from({ length: Math.round(150 * d) }, () => ({ x: Math.random() * w, y: Math.random() * h * 0.85, r: azar(0.4, 1.3), f: Math.random() * 6.28, v: azar(0.6, 2.2) }));
      fugaz = null;
      proxima = azar(3, 8);
    },
    pintar(c, w, h, dt, t, a) {
      c.fillStyle = `rgba(225,232,255,${0.75 * a})`;
      for (const s of estrellas) {
        const k = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.v + s.f));
        c.globalAlpha = k;
        c.fillRect(s.x, s.y, s.r, s.r);
      }
      c.globalAlpha = 1;
      proxima -= dt;
      if (!fugaz && proxima <= 0) {
        const izq = Math.random() < 0.5;
        fugaz = { x: izq ? azar(0, w * 0.5) : azar(w * 0.5, w), y: azar(0, h * 0.35), vx: (izq ? 1 : -1) * azar(260, 380), vy: azar(90, 150), vida: 0 };
        proxima = azar(6, 14);
      }
      if (fugaz) {
        fugaz.vida += dt;
        fugaz.x += fugaz.vx * dt;
        fugaz.y += fugaz.vy * dt;
        const k = Math.sin(Math.min(1, fugaz.vida / 0.9) * Math.PI);
        const g = c.createLinearGradient(fugaz.x, fugaz.y, fugaz.x - fugaz.vx * 0.18, fugaz.y - fugaz.vy * 0.18);
        g.addColorStop(0, `rgba(255,255,255,${0.85 * k * a})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        c.strokeStyle = g;
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(fugaz.x, fugaz.y);
        c.lineTo(fugaz.x - fugaz.vx * 0.18, fugaz.y - fugaz.vy * 0.18);
        c.stroke();
        if (fugaz.vida > 0.9) fugaz = null;
      }
    },
  };
}

// ─────────────────────────── AURORA BOREAL ───────────────────────────
function crearAurora(): Escena {
  const bandas = [
    { y: 0.12, amp: 0.05, f: 2.1, v: 0.11, col: "70,230,170" },
    { y: 0.2, amp: 0.06, f: 1.5, v: -0.08, col: "120,120,255" },
    { y: 0.08, amp: 0.035, f: 3.2, v: 0.06, col: "60,210,200" },
  ];
  return {
    nombre: "aurora",
    iniciar() {},
    pintar(c, w, h, _dt, t, a) {
      for (const b of bandas) {
        const alto = h * 0.26;
        const g = c.createLinearGradient(0, h * (b.y - b.amp), 0, h * (b.y + b.amp) + alto);
        const pulso = 0.7 + 0.3 * Math.sin(t * 0.15 + b.f);
        g.addColorStop(0, `rgba(${b.col},0)`);
        g.addColorStop(0.25, `rgba(${b.col},${0.24 * pulso * a})`);
        g.addColorStop(1, `rgba(${b.col},0)`);
        c.fillStyle = g;
        c.beginPath();
        const paso = Math.max(8, w / 48);
        c.moveTo(0, h);
        for (let x = 0; x <= w + paso; x += paso) {
          const yy = h * b.y + Math.sin((x / w) * b.f * 3.14 + t * b.v * 3) * h * b.amp + Math.sin((x / w) * 9 + t * 0.4) * h * 0.008;
          c.lineTo(x, yy);
        }
        for (let x = w + paso; x >= 0; x -= paso) {
          const yy = h * b.y + Math.sin((x / w) * b.f * 3.14 + t * b.v * 3) * h * b.amp + alto * (0.8 + 0.2 * Math.sin(x * 0.01 + t * 0.3));
          c.lineTo(x, yy);
        }
        c.closePath();
        c.fill();
      }
    },
  };
}

// ─────────────────────────── BRASAS ───────────────────────────
function crearBrasas(): Escena {
  let brasas: { x: number; y: number; r: number; v: number; f: number }[] = [];
  return {
    nombre: "brasas",
    iniciar(w, h, d) {
      brasas = Array.from({ length: Math.round(55 * d) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: azar(0.6, 1.8), v: azar(14, 40), f: Math.random() * 6.28 }));
    },
    pintar(c, w, h, dt, t, a) {
      const suelo = c.createLinearGradient(0, h, 0, h * 0.62);
      suelo.addColorStop(0, `rgba(255,110,30,${0.14 * a})`);
      suelo.addColorStop(1, "rgba(255,110,30,0)");
      c.fillStyle = suelo;
      c.fillRect(0, h * 0.62, w, h * 0.38);
      c.fillStyle = `rgba(255,150,60,${0.8 * a})`;
      c.beginPath();
      for (const b of brasas) {
        b.y -= b.v * dt;
        b.x += Math.sin(t * 1.1 + b.f) * 12 * dt;
        if (b.y < -4) {
          b.y = h + 4;
          b.x = Math.random() * w;
        }
        const r = b.r * (0.5 + 0.5 * Math.abs(Math.sin(t * 3 + b.f)));
        c.moveTo(b.x + r, b.y);
        c.arc(b.x, b.y, Math.max(0.2, r), 0, 6.283);
      }
      c.fill();
    },
  };
}

export function crearEscena(n: NombreEscena): Escena {
  switch (n) {
    case "lluvia":
      return crearLluvia(false);
    case "tormenta":
      return crearLluvia(true);
    case "sol":
      return crearSol();
    case "niebla":
      return crearNiebla();
    case "nieve":
      return crearNieve();
    case "estrellas":
      return crearEstrellas();
    case "aurora":
      return crearAurora();
    case "brasas":
      return crearBrasas();
  }
}

/** Pesos según la hora local: de día manda el sol, de noche las estrellas. */
export function elegirEscena(hora: number, evitar?: NombreEscena): NombreEscena {
  const dia = hora >= 7 && hora < 18;
  const pesos: [NombreEscena, number][] = dia
    ? [["sol", 3], ["lluvia", 2], ["niebla", 2], ["tormenta", 1], ["brasas", 1], ["nieve", 0.5], ["aurora", 0.3], ["estrellas", 0.2]]
    : [["estrellas", 3], ["aurora", 2], ["niebla", 2], ["lluvia", 2], ["tormenta", 1], ["brasas", 1], ["nieve", 0.5]];
  const lista = pesos.filter(([n]) => n !== evitar);
  const total = lista.reduce((s, [, p]) => s + p, 0);
  let r = Math.random() * total;
  for (const [n, p] of lista) {
    r -= p;
    if (r <= 0) return n;
  }
  return lista[0][0];
}
