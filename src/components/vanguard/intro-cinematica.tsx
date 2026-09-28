"use client";

// v72.0 INFINITA VERDADES — INTRO CINEMATOGRÁFICA (canvas 2D, cero assets).
// Secuencia: viaje warp por estrellas y nebulosas → la Tierra gira con atmósfera
// azul → zoom a una zona de conflicto con explosión de partículas naranjas/rojas
// → alarma de emergencia → VANGUARD letra a letra con LETRAS 3D REALISTAS
// (extrusión profunda, degradado blanco→oro→brasa, rim de luz de luna, glitch
// cromático) sobre un CIELO DE OCASO con LUNA LLENA con cráteres y BRASAS
// flotando → la pantalla se rompe como cristal y los fragmentos caen con
// gravedad real. Clic/tap = saltar. Una vez por sesión. Reduced-motion = sin intro.
// v70 la desmontó; el comandante pidió intro de vuelta con letras realistas.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { APP_VERSION_LABEL } from "@/lib/version";

const BOOT_KEY = "vanguard-booted"; // misma llave de la vieja pantalla de carga
const DURATION_MS = 8300;

type Phase = "warp" | "earth" | "conflict" | "title" | "shatter";

interface Shard {
  x: number; y: number; vx: number; vy: number; rot: number; vr: number; size: number;
  pts: { x: number; y: number }[];
}

export function IntroCinematica() {
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const t0 = setTimeout(() => {
      let shown = false;
      let reduced = false;
      try {
        shown = sessionStorage.getItem(BOOT_KEY) === "1";
        reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      } catch {
        shown = false;
      }
      if (!shown && !reduced) {
        // v72.0: va a jugar la intro — la llave se marca AL TERMINAR (en finish()),
        // así el bono/tutorial saben que deben esperar a que el cine termine.
        setVisible(true);
      } else {
        // no jugará: marca ya para que el bono/tutorial salgan sin esperar
        try {
          sessionStorage.setItem(BOOT_KEY, "1");
        } catch {
          /* noop */
        }
      }
    }, 0);
    return () => clearTimeout(t0);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0;
    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    // estrellas del warp
    const stars = Array.from({ length: 420 }, () => ({
      a: Math.random() * Math.PI * 2,
      r: Math.random() * Math.max(W, H) * 0.72 + 30,
      s: 0.5 + Math.random() * 2.2,
      z: Math.random(),
    }));
    // nebulosas (gradients fijos con drift)
    const nebulae = [
      { x: 0.22, y: 0.3, r: 0.55, c: "rgba(30,144,255,0.16)" },
      { x: 0.78, y: 0.62, r: 0.6, c: "rgba(120,40,200,0.14)" },
      { x: 0.5, y: 0.85, r: 0.5, c: "rgba(255,59,48,0.10)" },
    ];
    // continentes procedurales (blobs deterministas)
    const landBlobs = Array.from({ length: 26 }, (_, i) => {
      const seed = Math.sin(i * 127.1) * 43758.5453;
      const fx = seed - Math.floor(seed);
      const fy = Math.sin(i * 311.7) * 12345.678;
      const fyy = fy - Math.floor(fy);
      return { lon: fx * 360, lat: (fyy - 0.5) * 140, w: 18 + ((i * 37) % 40), h: 10 + ((i * 53) % 26) };
    });
    let shards: Shard[] = [];
    let shake = 0;

    const makeShards = (cx: number, cy: number): Shard[] => {
      const list: Shard[] = [];
      const rays = 9;
      for (let i = 0; i < rays; i++) {
        const a1 = (i / rays) * Math.PI * 2 + Math.random() * 0.3;
        const a2 = ((i + 1) / rays) * Math.PI * 2 - Math.random() * 0.3;
        const r1 = 80 + Math.random() * 160;
        const r2 = 120 + Math.random() * 220;
        const pts = [
          { x: cx, y: cy },
          { x: cx + Math.cos(a1) * r1, y: cy + Math.sin(a1) * r1 },
          { x: cx + Math.cos(a1) * r2, y: cy + Math.sin(a1) * r2 },
          { x: cx + Math.cos(a2) * r2, y: cy + Math.sin(a2) * r2 },
          { x: cx + Math.cos(a2) * r1, y: cy + Math.sin(a2) * r1 },
        ];
        const mx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const my = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        list.push({
          x: mx, y: my,
          vx: (mx - cx) * (0.8 + Math.random() * 1.6),
          vy: (my - cy) * (0.8 + Math.random() * 1.6) - 3,
          rot: 0, vr: (Math.random() - 0.5) * 0.16,
          size: 1, pts,
        });
      }
      return list;
    };

    let explosion: { x: number; y: number; vx: number; vy: number; life: number; hue: number }[] = [];
    let explosionAt = -1;

    // v72.0 — LUNA LLENA con cráteres + halo (se dibuja en el cielo del título)
    const drawMoon = () => {
      const mr = Math.min(W, H) * 0.085;
      const mx = W * 0.79;
      const my = H * 0.2;
      const halo = ctx.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 3.4);
      halo.addColorStop(0, "rgba(226,236,255,0.30)");
      halo.addColorStop(0.4, "rgba(180,200,255,0.10)");
      halo.addColorStop(1, "transparent");
      ctx.fillStyle = halo;
      ctx.fillRect(mx - mr * 3.5, my - mr * 3.5, mr * 7, mr * 7);
      const face = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.15, mx, my, mr);
      face.addColorStop(0, "#fff7e8");
      face.addColorStop(0.65, "#e8e2d2");
      face.addColorStop(1, "#b7b3a6");
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fillStyle = face;
      ctx.fill();
      // cráteres deterministas
      const craters = [
        { d: 0.42, a: 0.5, r: 0.2 }, { d: 1.9, a: 2.2, r: 0.13 },
        { d: 0.9, a: 3.4, r: 0.17 }, { d: 2.6, a: 4.3, r: 0.09 },
        { d: 1.4, a: 5.4, r: 0.11 }, { d: 2.1, a: 1.3, r: 0.08 },
      ];
      for (const c of craters) {
        const cx2 = mx + Math.cos(c.a) * c.d * mr * 0.42;
        const cy2 = my + Math.sin(c.a) * c.d * mr * 0.42;
        ctx.beginPath();
        ctx.arc(cx2, cy2, c.r * mr, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(120,116,104,0.35)";
        ctx.fill();
      }
    };

    // BRASAS flotantes del ocaso (entran con el título)
    let embers: { x: number; y: number; v: number; s: number; ph: number }[] = [];
    const drawOcaso = (dt: number) => {
      // horizonte cálido bajo + luna arriba: la puesta de sol del comandante
      const hor = ctx.createLinearGradient(0, H * 0.62, 0, H);
      hor.addColorStop(0, "transparent");
      hor.addColorStop(0.55, "rgba(255,110,40,0.10)");
      hor.addColorStop(1, "rgba(255,138,42,0.22)");
      ctx.fillStyle = hor;
      ctx.fillRect(0, H * 0.62, W, H * 0.38);
      drawMoon();
      if (embers.length === 0) {
        embers = Array.from({ length: 46 }, () => ({
          x: Math.random() * W,
          y: H * 0.55 + Math.random() * H * 0.5,
          v: 0.25 + Math.random() * 0.85,
          s: 0.8 + Math.random() * 2.1,
          ph: Math.random() * Math.PI * 2,
        }));
      }
      for (const e of embers) {
        e.y -= e.v * dt * 0.06;
        e.ph += 0.03;
        if (e.y < H * 0.12) { e.y = H + 8; e.x = Math.random() * W; }
        const a = 0.35 + 0.3 * Math.sin(e.ph * 2);
        ctx.beginPath();
        ctx.arc(e.x + Math.sin(e.ph) * 7, e.y, e.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${150 + Math.floor(40 * Math.sin(e.ph))},60,${a})`;
        ctx.fill();
      }
    };

    // v72.0 — LETRAS 3D REALISTAS: extrusión, degradado blanco→oro→brasa,
    // rim de luz de luna y glitch cromático al aterrizar cada letra.
    const drawTitle = (t: number) => {
      const word = "VANGUARD";
      const letters = word.split("");
      const fs = Math.min(72, Math.max(36, W / 11));
      ctx.save();
      ctx.translate(W / 2, H * 0.42);
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = `900 ${fs}px Orbitron, sans-serif`;
      // medir anchos letra a letra (con tracking)
      const track = fs * 0.06;
      const widths = letters.map((l) => ctx.measureText(l).width + track);
      const total = widths.reduce((s, w2) => s + w2, 0) - track;
      let x = -total / 2;
      const g = t < 1150 ? 1 : Math.max(0, 1 - (t - 1150) / 500);
      const jitter = g * (Math.random() - 0.5) * 10;
      for (let i = 0; i < letters.length; i++) {
        const lp = Math.min(1, Math.max(0, (t - i * 95) / 240)); // entrada por letra
        const ease = 1 - Math.pow(1 - lp, 3);
        const lx = x + jitter;
        const ly = (1 - ease) * -fs * 0.55;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.globalAlpha = 0.12 + 0.88 * ease;
        // EXTRUSIÓN 3D: capas oscuras hacia abajo-derecha
        const depth = Math.round(fs / 11);
        for (let k = depth; k >= 1; k--) {
          ctx.fillStyle = k > depth * 0.5 ? "#20100a" : "#3a1c0c";
          ctx.fillText(letters[i], k * 1.25, k * 1.5);
        }
        // CARA: degradado luz de luna → oro → brasa
        const face = ctx.createLinearGradient(0, -fs * 0.62, 0, fs * 0.62);
        face.addColorStop(0, "#ffffff");
        face.addColorStop(0.42, "#ffe9c0");
        face.addColorStop(0.78, "#ffb35c");
        face.addColorStop(1, "#ff7a1e");
        ctx.shadowColor = "rgba(255,150,60,0.55)";
        ctx.shadowBlur = 18 + 14 * ease;
        ctx.fillStyle = face;
        ctx.fillText(letters[i], 0, 0);
        ctx.shadowBlur = 0;
        // RIM de luna: trazo frío arriba-izquierda
        ctx.strokeStyle = `rgba(196,220,255,${0.5 * ease})`;
        ctx.lineWidth = Math.max(1, fs / 48);
        ctx.strokeText(letters[i], -0.8, -0.8);
        // GLITCH cromático al aterrizar
        if (g > 0 && lp >= 1 && Math.random() < 0.34) {
          ctx.globalAlpha = 0.55 * g;
          ctx.fillStyle = "#FF3B30";
          ctx.fillText(letters[i], -3.5 * g, (Math.random() - 0.5) * 3);
          ctx.fillStyle = "#00FF87";
          ctx.fillText(letters[i], 3.5 * g, (Math.random() - 0.5) * 3);
        }
        ctx.restore();
        x += widths[i];
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = "center";
      // subtítulo INFINITA VERDADES
      if (t > 760) {
        ctx.font = `600 ${Math.max(10, fs / 6.4)}px "JetBrains Mono", monospace`;
        ctx.fillStyle = "#ffb35c";
        ctx.globalAlpha = Math.min(1, (t - 760) / 420);
        ctx.shadowColor = "rgba(255,138,42,0.6)";
        ctx.shadowBlur = 12;
        ctx.fillText("I N F I N I T A   V E R D A D E S", 0, fs * 0.95);
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    };

    let lastT = start;
    const frame = (now: number) => {
      if (doneRef.current) return;
      const t = now - start;
      const dt = Math.min(48, Math.max(4, now - lastT)); // delta ms acotado
      lastT = now;
      let phase: Phase = "warp";
      if (t < 2600) phase = "warp";
      else if (t < 4400) phase = "earth";
      else if (t < 5900) phase = "conflict";
      else if (t < 7100) phase = "title";
      else phase = "shatter";

      // fondo base
      ctx.fillStyle = "#0A0A0F";
      ctx.fillRect(0, 0, W, H);

      // nebulosas
      nebulae.forEach((n, i) => {
        const drift = Math.sin(now / 4000 + i * 2) * 18;
        const grad = ctx.createRadialGradient(n.x * W + drift, n.y * H, 0, n.x * W + drift, n.y * H, n.r * Math.max(W, H));
        grad.addColorStop(0, n.c);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });

      // estrellas: warp acelerado al principio, luego fondo sereno
      const warpBoost = phase === "warp" ? 3.4 : 0.35;
      ctx.save();
      for (const st of stars) {
        st.r += st.s * warpBoost * 0.9;
        if (st.r > Math.max(W, H) * 0.75) st.r = 4 + Math.random() * 30;
        const x = W / 2 + Math.cos(st.a) * st.r;
        const y = H / 2 + Math.sin(st.a) * st.r * 0.86;
        const alpha = Math.min(1, st.r / (Math.max(W, H) * 0.3));
        ctx.fillStyle = `rgba(${200 + Math.floor(st.z * 55)},${205 + Math.floor(st.z * 40)},255,${alpha})`;
        const len = phase === "warp" ? st.s * 6 : st.s;
        ctx.fillRect(x, y, len, 1.4);
      }
      ctx.restore();

      // TIERRA: aparece en fase earth y crece hasta el zoom
      if (phase === "earth" || phase === "conflict" || phase === "title" || phase === "shatter") {
        const pEarth = Math.min(1, (t - 2600) / 900);
        const zoomP = phase === "earth" ? 0 : Math.min(1, (t - 4400) / 1500);
        const baseR = Math.min(W, H) * 0.21 * (0.4 + 0.6 * pEarth);
        const R = baseR * (1 + zoomP * 2.6);
        const cx = W / 2;
        const cy = H / 2 - zoomP * H * 0.08;
        // atmósfera azul brillante
        const atmo = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R * 1.35);
        atmo.addColorStop(0, "rgba(30,144,255,0.55)");
        atmo.addColorStop(0.55, "rgba(30,144,255,0.16)");
        atmo.addColorStop(1, "transparent");
        ctx.fillStyle = atmo;
        ctx.fillRect(cx - R * 1.5, cy - R * 1.5, R * 3, R * 3);
        // océano
        const ocean = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
        ocean.addColorStop(0, "#2a6fd6");
        ocean.addColorStop(0.7, "#123a7a");
        ocean.addColorStop(1, "#081c3f");
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = ocean;
        ctx.fill();
        // continentes girando (proyección simple con recorte circular)
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.clip();
        const rot = (t / 2400) % (Math.PI * 2);
        for (const b of landBlobs) {
          const lonRad = (b.lon * Math.PI) / 180 + rot;
          const visible = Math.cos(lonRad) > 0.05;
          if (!visible) continue;
          const x = cx + Math.sin(lonRad) * R * 0.94;
          const y = cy + (b.lat / 180) * R * 1.7;
          const wScale = Math.cos(lonRad);
          ctx.fillStyle = zoomP > 0.35 ? "#3d7a3a" : "#2f6b34";
          ctx.globalAlpha = 0.92 * Math.max(0.15, wScale);
          ctx.beginPath();
          ctx.ellipse(x, y, b.w * 0.5 * wScale * (R / (Math.min(W, H) * 0.21)), b.h * 0.5 * (R / (Math.min(W, H) * 0.21)), 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        // terminador día/noche
        const night = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
        night.addColorStop(0.55, "transparent");
        night.addColorStop(1, "rgba(4,6,12,0.72)");
        ctx.fillStyle = night;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
        ctx.restore();
        // marcas de conflicto pulsantes en el planeta
        if (phase !== "earth") {
          const pulse = 0.5 + 0.5 * Math.sin(now / 180);
          for (const m of [{ dx: 0.32, dy: -0.12 }, { dx: -0.4, dy: 0.18 }, { dx: 0.1, dy: 0.42 }]) {
            const mx = cx + m.dx * R;
            const my = cy + m.dy * R;
            ctx.beginPath();
            ctx.arc(mx, my, 3 + pulse * 5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,59,48,${0.45 + pulse * 0.5})`;
            ctx.fill();
          }
        }
      }

      // CONFLICTO: zoom termina en explosión de partículas naranjas/rojas + shake
      if (phase === "conflict") {
        if (explosionAt < 0) {
          explosionAt = t;
          const ex = W / 2 + W * 0.06;
          const ey = H / 2 - H * 0.04;
          explosion = Array.from({ length: 150 }, () => {
            const a = Math.random() * Math.PI * 2;
            const sp = 2 + Math.random() * 9;
            return { x: ex, y: ey, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, hue: 12 + Math.random() * 34 };
          });
          shake = 16;
        }
        const et = t - explosionAt;
        ctx.save();
        for (const p of explosion) {
          p.x += p.vx; p.y += p.vy;
          p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.06;
          p.life -= 0.008;
          if (p.life <= 0) continue;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5 + p.life * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 100%, ${45 + p.life * 25}%, ${p.life})`;
          ctx.fill();
        }
        // flash central
        const fl = Math.max(0, 1 - et / 350);
        if (fl > 0) {
          const fg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5);
          fg.addColorStop(0, `rgba(255,180,90,${fl * 0.85})`);
          fg.addColorStop(1, "transparent");
          ctx.fillStyle = fg;
          ctx.fillRect(0, 0, W, H);
        }
        ctx.restore();
      }
      if (phase === "title" || phase === "shatter") {
        // humo/brasas residuales de la explosión
        ctx.save();
        for (const p of explosion) {
          if (p.life <= 0) continue;
          p.x += p.vx * 0.4; p.y += p.vy * 0.4 + 0.05;
          p.life -= 0.004;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1 + p.life * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 95%, 50%, ${p.life * 0.6})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // TÍTULO GLITCH sobre cielo de ocaso con luna llena y brasas
      if (phase === "title" || phase === "shatter") drawOcaso(dt);
      if (phase === "title") drawTitle(t - 5900);
      if (phase === "shatter") drawTitle(1200 + Math.random() * 40);

      // SHATTER: cristal roto
      if (phase === "shatter") {
        const st = t - 7100;
        if (st > 0 && shards.length === 0) {
          shards = makeShards(W / 2, H * 0.42);
          shake = 22;
        }
        if (shards.length) {
          ctx.save();
          for (const sh of shards) {
            sh.x += sh.vx;
            sh.y += sh.vy;
            sh.vy += 0.55; // gravedad real
            sh.rot += sh.vr;
            ctx.save();
            ctx.translate(sh.x, sh.y);
            ctx.rotate(sh.rot);
            ctx.beginPath();
            ctx.moveTo(sh.pts[0].x - sh.x, sh.pts[0].y - sh.y);
            for (let i = 1; i < sh.pts.length; i++) ctx.lineTo(sh.pts[i].x - sh.x, sh.pts[i].y - sh.y);
            ctx.closePath();
            ctx.fillStyle = `rgba(140,190,255,${Math.max(0, 0.34 - st / 2400)})`;
            ctx.strokeStyle = `rgba(30,144,255,${Math.max(0, 0.7 - st / 1400)})`;
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
          ctx.restore();
        }
        // fundido final a negro → transparente
        const fade = Math.max(0, 1 - (DURATION_MS - t) / 700);
        if (t > DURATION_MS - 700) {
          ctx.fillStyle = `rgba(10,10,15,${Math.min(1, fade)})`;
          ctx.fillRect(0, 0, W, H);
        }
      }

      // shake de cámara global
      if (shake > 0.4) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        shake *= 0.88;
      }

      // barra de progreso discreta + pista de salto
      ctx.fillStyle = "rgba(30,144,255,0.7)";
      ctx.fillRect(W / 2 - 60, H - 14, Math.min(1, t / DURATION_MS) * 120, 2);
      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.fillStyle = "rgba(138,144,168,0.8)";
      ctx.textAlign = "center";
      ctx.fillText("TOCA PARA SALTAR", W / 2, H - 22);

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    // alarma al llegar al conflicto (gesto del usuario puede no existir aún: es mejor esfuerzo)
    const alarmTimer = setTimeout(() => {
      try {
        import("@/lib/sound").then(({ sfx }) => sfx.alarm());
      } catch { /* noop */ }
    }, 4400);

    const endTimer = setTimeout(() => finish(), DURATION_MS + 120);
    function finish() {
      if (doneRef.current) return;
      doneRef.current = true;
      cancelAnimationFrame(rafRef.current);
      // v72.0: la intro queda marcada SOLO al terminar o saltarse
      try {
        sessionStorage.setItem(BOOT_KEY, "1");
      } catch {
        /* noop */
      }
      setVisible(false);
    }
    const skip = () => finish();
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);

    return () => {
      doneRef.current = true;
      cancelAnimationFrame(rafRef.current);
      clearTimeout(alarmTimer);
      clearTimeout(endTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div key="intro" exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 0.4 }} className="fixed inset-0 z-[100] bg-[#0A0A0F]">
          <canvas ref={canvasRef} className="absolute inset-0" aria-label="Secuencia cinematográfica de entrada de VANGUARD" />
          <div className="absolute top-3 right-3 font-mono text-[9px] tracking-[0.3em] text-electric/70 uppercase">{APP_VERSION_LABEL}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
