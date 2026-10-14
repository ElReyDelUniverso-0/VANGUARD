"use client";

// ============================================================
// v113.0 LETRAS VIVAS — EXPERIMENTAL: LA PÁGINA DE LOS IMPOSIBLES
// Mandato del comandante: "una página para experimental". Aquí la
// persona TOCA la materia tipográfica de Vanguard:
//   · FORJA DE LETRAS: escribes cualquier texto y sale como
//     VOLUMEN 3D real — material, profundidad, tamaño y giro
//     orbitales a tu gusto; la escena se ARRASTRA para rotarla.
//   · ÓRBITA DE PALABRAS: tus palabras viven sobre una esfera de
//     datos que gira y responde a la mano.
//   · LLUVIA DE LETRAS: tu alfabeto llueve sobre la matriz
//     (canvas propio, sin imágenes, se apaga al salir).
// Todo en TIEMPO REAL, CERO imágenes, personalizable (la forja
// recuerda tu material y tu profundidad) y con contrato 60 FPS:
// drag/rotación vía refs imperativas + CSS vars, sin re-render.
// ============================================================

import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { Eraser, FlaskConical, RotateCw, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { TituloEpico } from "../titulo-epico";
import { TituloLetras3D, MATERIALES_LETRA, type MaterialLetra } from "../letras-3d";
import { SelloVivo } from "../escenas-3d";

const ACC = "#FF5EDB"; // magenta holográfico — acento único de EXPERIMENTAL
const LS_FORJA = "vg-exp113-forja";

const PALABRAS_ORBITA = ["VANGUARD", "PAZ", "GUERRA", "DATOS", "VERDAD", "ORO", "2100", "REAL", "VIVO", "3D", "LETRAS", "FUTURO"];

interface ForjaConf {
  texto: string;
  material: MaterialLetra;
  profundidad: number;
  tamano: number;
  giro: boolean;
}

function confDefault(): ForjaConf {
  return { texto: "VANGUARD 2100", material: "holo", profundidad: 5, tamano: 52, giro: false };
}

function leerForja(): ForjaConf {
  try {
    const raw = localStorage.getItem(LS_FORJA);
    if (!raw) return confDefault();
    const p = JSON.parse(raw) as Partial<ForjaConf>;
    const d = confDefault();
    return {
      texto: typeof p.texto === "string" && p.texto.trim() ? p.texto.slice(0, 24) : d.texto,
      material: (["holo", "neon", "cromo", "matriz", "brasa"] as const).includes(p.material as MaterialLetra) ? (p.material as MaterialLetra) : d.material,
      profundidad: Math.max(2, Math.min(9, Math.round(p.profundidad ?? d.profundidad))),
      tamano: Math.max(26, Math.min(92, Math.round(p.tamano ?? d.tamano))),
      giro: p.giro === true,
    };
  } catch {
    return confDefault();
  }
}

// ---------- ÓRBITA DE PALABRAS: esfera fibonacci en CSS 3D ----------
function OrbitaPalabras({ palabras, acento }: { palabras: string[]; acento: string }) {
  const reduced = useReducedMotion();
  const dragRef = useRef<HTMLDivElement>(null);
  const zonaRef = useRef<HTMLDivElement>(null);
  const pose = useRef({ rx: -8, ry: 0, activo: false, x: 0, y: 0 });

  // esfera fibonacci: reparte las palabras sin agruparse en los polos
  const nodos = palabras.map((palabra, i) => {
    const N = palabras.length;
    const phi = Math.acos(-1 + (2 * i + 1) / N);
    const theta = Math.sqrt(N * Math.PI) * phi;
    return {
      palabra,
      x: Math.cos(theta) * Math.sin(phi),
      y: Math.sin(phi),
      z: Math.sin(theta) * Math.sin(phi),
    };
  });
  const R = 118;

  const aplicaPose = () => {
    if (dragRef.current) {
      dragRef.current.style.transform = `rotateX(${pose.current.rx.toFixed(1)}deg) rotateY(${pose.current.ry.toFixed(1)}deg)`;
    }
  };
  useEffect(aplicaPose, []);

  const onDown = (e: React.PointerEvent) => {
    pose.current.activo = true;
    pose.current.x = e.clientX;
    pose.current.y = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!pose.current.activo) return;
    pose.current.ry += (e.clientX - pose.current.x) * 0.45;
    pose.current.rx -= (e.clientY - pose.current.y) * 0.35;
    pose.current.rx = Math.max(-80, Math.min(80, pose.current.rx));
    pose.current.x = e.clientX;
    pose.current.y = e.clientY;
    aplicaPose();
  };
  const onUp = () => { pose.current.activo = false; };

  return (
    <div
      ref={zonaRef}
      className="relative h-[340px] overflow-hidden rounded-md border bg-black/40"
      style={{ borderColor: `${acento}47`, perspective: "820px", touchAction: "none", cursor: pose.current.activo ? "grabbing" : "grab" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 62%, ${acento}14, transparent 62%)` }} />
      <div ref={dragRef} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        <div className={cn("absolute left-1/2 top-1/2 -mt-4", !reduced && "v113-orbita")} style={{ transformStyle: "preserve-3d" }}>
          {nodos.map((n, i) => (
            <span
              key={i}
              className="v113-orbita-palabra absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[11px] font-bold uppercase tracking-widest"
              style={{
                color: i % 3 === 0 ? acento : "#E8EAF2",
                opacity: 0.42 + n.z * 0.58,
                transform: `translateZ(${(n.z * R).toFixed(1)}px) translateX(${(n.x * R).toFixed(1)}px) translateY(${(n.y * R * 0.9).toFixed(1)}px)`,
              }}
            >
              {n.palabra}
            </span>
          ))}
        </div>
      </div>
      {/* núcleo pulsante de la esfera */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full v110-latido" style={{ background: acento, boxShadow: `0 0 16px ${acento}` }} />
      <SelloVivo acento={acento} etiqueta="ÓRBITA" className="absolute bottom-2 right-2 z-10" />
    </div>
  );
}

// ---------- LLUVIA DE LETRAS: canvas con TU alfabeto ----------
function LluviaLetras({ texto, acento }: { texto: string; acento: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.scale(dpr, dpr);

    // el alfabeto ES TUYO: los glifos salen de tu texto (default VANGUARD)
    const glifos = (Array.from(new Set(Array.from(texto.toUpperCase()))).filter((c) => c !== " ").slice(0, 22).join("") || "VANGUARD").split("");
    const fs = 15;
    const cols = Math.max(6, Math.floor(W / fs));
    const gotas = Array.from({ length: cols }, () => Math.floor(Math.random() * -60));

    const pinta = () => {
      ctx.fillStyle = "rgba(2,4,10,0.16)";
      ctx.fillRect(0, 0, W, H);
      ctx.font = `bold ${fs}px ui-monospace, monospace`;
      for (let c = 0; c < cols; c++) {
        const ch = glifos[Math.floor(Math.random() * glifos.length)];
        const y = gotas[c] * fs;
        // cabeza luminosa + estela que se apaga sola
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = acento;
        ctx.shadowBlur = 9;
        ctx.fillText(ch, c * fs + 2, y);
        ctx.shadowBlur = 0;
        ctx.fillStyle = acento;
        ctx.globalAlpha = 0.7;
        const ch2 = glifos[Math.floor(Math.random() * glifos.length)];
        ctx.fillText(ch2, c * fs + 2, y - fs);
        ctx.globalAlpha = 1;
        if (y > H && Math.random() > 0.975) gotas[c] = Math.floor(Math.random() * -30);
        else gotas[c]++;
      }
    };

    if (reduced) {
      // reduced-motion: un fotograma estático (la lluvia no cae)
      ctx.fillStyle = "rgba(2,4,10,0.85)";
      ctx.fillRect(0, 0, W, H);
      ctx.font = `bold ${fs}px ui-monospace, monospace`;
      ctx.fillStyle = acento;
      for (let c = 0; c < cols; c++) {
        ctx.fillText(glifos[c % glifos.length], c * fs + 2, (Math.abs(gotas[c]) % (H / fs)) * fs);
      }
      return;
    }

    let raf = 0;
    let frame = 0;
    const loop = () => {
      frame++;
      if (frame % 2 === 0) pinta(); // ~30 fps — suave y barato
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [texto, acento, reduced]);

  return (
    <div className="relative h-[210px] overflow-hidden rounded-md border bg-black/60" style={{ borderColor: `${acento}47` }}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
}

// ============================================================

export function ExperimentalPanel() {
  const { t } = useT();
  const reduced = useReducedMotion();
  const [conf, setConf] = useState<ForjaConf>(confDefault);
  const [montado, setMontado] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const pose = useRef({ rx: 6, ry: -14, activo: false, x: 0, y: 0 });

  // la forja recuerda TU material, TU profundidad y TU texto
  useEffect(() => {
    setConf(leerForja());
    setMontado(true);
  }, []);
  useEffect(() => {
    if (!montado) return;
    try { localStorage.setItem(LS_FORJA, JSON.stringify(conf)); } catch { /* noop */ }
  }, [conf, montado]);

  // giro orbital: clase CSS (el wrapper del spin no toca el drag)
  useEffect(() => {
    if (spinRef.current) spinRef.current.className = conf.giro && !reduced ? "v113-giro" : "";
  }, [conf.giro, reduced]);

  const aplicaPose = useCallback(() => {
    if (dragRef.current) {
      dragRef.current.style.transform = `rotateX(${pose.current.rx.toFixed(1)}deg) rotateY(${pose.current.ry.toFixed(1)}deg)`;
    }
  }, []);
  useEffect(aplicaPose, [aplicaPose]);

  const onDown = (e: React.PointerEvent) => {
    pose.current.activo = true;
    pose.current.x = e.clientX;
    pose.current.y = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!pose.current.activo) return;
    pose.current.ry += (e.clientX - pose.current.x) * 0.5;
    pose.current.rx -= (e.clientY - pose.current.y) * 0.4;
    pose.current.rx = Math.max(-75, Math.min(75, pose.current.rx));
    pose.current.x = e.clientX;
    pose.current.y = e.clientY;
    aplicaPose();
  };
  const onUp = () => { pose.current.activo = false; };

  const textoForja = conf.texto.trim() ? conf.texto : "VANGUARD";
  const palabrasOrbita = (() => {
    const propias = textoForja.split(/\s+/).filter((w) => w.length > 1).map((w) => w.toUpperCase());
    const todas = [...propias, ...PALABRAS_ORBITA];
    const unicas = Array.from(new Set(todas)).slice(0, 14);
    return unicas;
  })();

  return (
    <div className="mx-auto max-w-5xl px-2 pb-14">
      <TituloEpico
        titulo={t("exp113.hero.titulo")}
        volanta={t("exp113.hero.volanta")}
        texto={t("exp113.hero.texto")}
        imagen="/img/cover-lab.jpg"
        escena="prisma"
        semilla={13}
        altura={210}
        tinte="luna"
        acento={ACC}
        materialLetras="neon"
        profundidadLetras={6}
      />

      {/* ═══ FORJA DE LETRAS — escribe y mira tus palabras ganar volumen ═══ */}
      <section className="mt-5 rounded-lg border bg-black/30 p-3" style={{ borderColor: `${ACC}47` }}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: ACC }}>
            <Type className="h-3.5 w-3.5" /> {t("exp113.forja")}
          </h3>
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{t("exp113.arrstra")}</span>
        </div>

        {/* ESCENA DE FORJA: arrastra para rotar · tilt del Motor3D en vivo */}
        <div
          className="relative h-[280px] cursor-grab select-none overflow-hidden rounded-md border bg-[radial-gradient(ellipse_at_50%_120%,rgba(255,94,219,0.10),rgba(0,0,0,0.9)_70%)] active:cursor-grabbing"
          style={{ borderColor: `${ACC}33`, perspective: "760px", touchAction: "none" }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        >
          {/* suelo de rejilla holográfica */}
          <div aria-hidden className="v113-suelo pointer-events-none absolute inset-x-[-20%] bottom-[-8%] h-[46%]" />
          <div ref={dragRef} className="absolute inset-0 grid place-items-center" style={{ transformStyle: "preserve-3d" }}>
            <div
              style={{
                transformStyle: "preserve-3d",
                transform:
                  "rotateX(calc(var(--vg-my, 0) * -9deg * var(--vg-3d-i, 0))) rotateY(calc(var(--vg-mx, 0) * 11deg * var(--vg-3d-i, 0)))",
              }}
            >
              <div ref={spinRef} style={{ transformStyle: "preserve-3d" }}>
                <TituloLetras3D
                  texto={textoForja}
                  acento={ACC}
                  material={conf.material}
                  profundidad={conf.profundidad}
                  className="text-[clamp(1.6rem,5vw,3.2rem)]"
                  etiqueta={textoForja}
                />
              </div>
            </div>
          </div>
          <SelloVivo acento={ACC} etiqueta="FORJA" className="absolute bottom-2 right-2 z-10" />
        </div>

        {/* PANEL DE CONTROL — todo personalizable y recordado */}
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{t("exp113.escribe")}</span>
            <div className="flex items-center gap-1.5">
              <input
                value={conf.texto}
                onChange={(e) => setConf((c) => ({ ...c, texto: e.target.value.slice(0, 24) }))}
                maxLength={24}
                className="w-full rounded-sm border bg-black/50 px-2 py-1.5 font-mono text-sm text-foreground outline-none focus:border-amber-hud"
                style={{ borderColor: `${ACC}47` }}
                placeholder="VANGUARD 2100"
                aria-label={t("exp113.escribe")}
              />
              <button
                onClick={() => setConf(confDefault())}
                aria-label={t("exp113.reset")}
                title={t("exp113.reset")}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-sm border text-muted-foreground hover:text-foreground"
                style={{ borderColor: `${ACC}47` }}
              >
                <Eraser className="h-3.5 w-3.5" />
              </button>
            </div>
          </label>

          <div>
            <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{t("exp113.material")}</span>
            <div className="flex flex-wrap gap-1">
              {MATERIALES_LETRA.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setConf((c) => ({ ...c, material: m.id }))}
                  aria-pressed={conf.material === m.id}
                  className={cn(
                    "rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors",
                    conf.material === m.id ? "text-black" : "text-muted-foreground hover:text-foreground"
                  )}
                  style={{
                    borderColor: conf.material === m.id ? ACC : `${ACC}47`,
                    background: conf.material === m.id ? ACC : "transparent",
                  }}
                >
                  {t(m.clave)}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 flex justify-between font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              {t("exp113.profundidad")} <span className="tabular-nums" style={{ color: ACC }}>{conf.profundidad}</span>
            </span>
            <input
              type="range" min={2} max={9} step={1}
              value={conf.profundidad}
              onChange={(e) => setConf((c) => ({ ...c, profundidad: parseInt(e.target.value, 10) }))}
              className="w-full accent-amber"
              aria-label={t("exp113.profundidad")}
            />
          </label>

          <label className="block">
            <span className="mb-1 flex justify-between font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              {t("exp113.tamano")} <span className="tabular-nums" style={{ color: ACC }}>{conf.tamano}</span>
            </span>
            <input
              type="range" min={26} max={92} step={2}
              value={conf.tamano}
              onChange={(e) => setConf((c) => ({ ...c, tamano: parseInt(e.target.value, 10) }))}
              className="w-full accent-amber"
              aria-label={t("exp113.tamano")}
            />
          </label>

          <button
            onClick={() => setConf((c) => ({ ...c, giro: !c.giro }))}
            aria-pressed={conf.giro}
            className={cn(
              "flex items-center justify-center gap-2 rounded-sm border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors",
              conf.giro ? "text-black" : "text-muted-foreground hover:text-foreground"
            )}
            style={{ borderColor: conf.giro ? ACC : `${ACC}47`, background: conf.giro ? ACC : "transparent" }}
          >
            <RotateCw className="h-3.5 w-3.5" /> {t("exp113.giro")} {conf.giro ? "■" : "□"}
          </button>
        </div>
      </section>

      {/* ═══ ÓRBITA DE PALABRAS ═══ */}
      <section className="mt-5 rounded-lg border bg-black/30 p-3" style={{ borderColor: `${ACC}47` }}>
        <h3 className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: ACC }}>
          <FlaskConical className="h-3.5 w-3.5" /> {t("exp113.orbita")}
        </h3>
        <p className="mb-2 font-mono text-[10px] leading-snug text-muted-foreground">{t("exp113.orbitaDesc")}</p>
        <OrbitaPalabras palabras={palabrasOrbita} acento={ACC} />
      </section>

      {/* ═══ LLUVIA DE LETRAS ═══ */}
      <section className="mt-5 rounded-lg border bg-black/30 p-3" style={{ borderColor: `${ACC}47` }}>
        <h3 className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: ACC }}>
          <Type className="h-3.5 w-3.5" /> {t("exp113.lluvia")}
        </h3>
        <p className="mb-2 font-mono text-[10px] leading-snug text-muted-foreground">{t("exp113.lluviaDesc")}</p>
        <LluviaLetras texto={textoForja} acento={ACC} />
      </section>
    </div>
  );
}
