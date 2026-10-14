"use client";

// ============================================================
// v114.0 ECLIPSE — 3 MATERIALES NUEVOS votados por la casa:
//   · VIDRIO (transparente, filos de luz) · ORO LÍQUIDO (metal
//     dorado en bandas) · GLITCH (aberración cromática RGB).
// v113.0 LETRAS VIVAS — MOTOR DE TIPOGRAFÍA 3D PROCEDURAL
// Mandato del comandante: "todo sea 3D, letras". Este motor
// convierte CUALQUIER texto en letras con VOLUMEN real:
//   · Cada letra se extruye por CAPAS (spans apilados en Z con
//     preserve-3d) — profundidad real sin WebGL ni imágenes.
//   · 5 MATERIALES: HOLOGRAMA, NEÓN, CROMO, MATRIZ (glifo vivo)
//     y BRASA (la identidad dorada de la casa).
//   · Interactúa con la persona: el bloque entero se inclina con
//     el puntero/giroscopio consumiendo --vg-mx/--vg-my que el
//     Motor3D ya escribe en :root (cero re-render, puro CSS calc).
//   · Personalizable: respeta --vg-3d-i (intensidad) y
//     --vg-3d-tilt (tilt on/off) de Ajustes → Tecnología 3D.
//   · Contrato 60 FPS: solo transform/opacity; la entrada es una
//     animación CSS por letra; hover levanta la letra en Z.
//     prefers-reduced-motion apaga entrada, giro y ciclo MATRIZ.
// ============================================================

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MaterialLetra = "holo" | "neon" | "cromo" | "matriz" | "brasa" | "vidrio" | "oro" | "glitch";

export const MATERIALES_LETRA: { id: MaterialLetra; clave: string }[] = [
  { id: "holo", clave: "exp113.m.holo" },
  { id: "neon", clave: "exp113.m.neon" },
  { id: "cromo", clave: "exp113.m.cromo" },
  { id: "matriz", clave: "exp113.m.matriz" },
  { id: "brasa", clave: "exp113.m.brasa" },
  { id: "vidrio", clave: "exp114.m.vidrio" },  // v114
  { id: "oro", clave: "exp114.m.oro" },        // v114
  { id: "glitch", clave: "exp114.m.glitch" },  // v114
];

// el alfabeto vivo del material MATRIZ (glifos que respiran)
const GLIFOS = "ΛΞΣΦΨΩΔΘ01#%&$@VANGUARD";

// ---------- paleta de cada material (acento = color de sección) ----------
interface PaletaMaterial {
  /** gradiente de la cara frontal */
  frente: (acc: string) => string;
  /** color de una capa de profundidad i (0..n) */
  capa: (acc: string, i: number, n: number) => string;
  /** sombra luminosa de la cara frontal */
  brillo: (acc: string) => string;
  /** ¿la cara usa recorte de gradiente (bg-clip-text)? */
  recorte: boolean;
  /** color base si no hay recorte */
  plano?: string;
  mono?: boolean;
  /** v114 GLITCH: desvío horizontal (px) de cada capa de profundidad */
  desvio?: (i: number) => number;
  /** v114 GLITCH: la cara frontal respira con el temblor v114-glitch */
  temblor?: boolean;
}

const PALETAS: Record<MaterialLetra, PaletaMaterial> = {
  holo: {
    frente: (acc) => `linear-gradient(180deg, #ffffff 0%, ${acc} 42%, color-mix(in srgb, ${acc} 40%, #05070c) 100%)`,
    capa: (acc, i, n) => `color-mix(in srgb, ${acc} ${Math.max(18, 62 - Math.round((i / n) * 44))}%, #05070c)`,
    brillo: (acc) => `0 0 18px color-mix(in srgb, ${acc} 55%, transparent), 0 2px 0 rgba(0,0,0,0.8)`,
    recorte: true,
  },
  neon: {
    frente: () => "linear-gradient(180deg, #ffffff 8%, #eafcff 60%, #bfefff 100%)",
    capa: (acc) => acc,
    brillo: (acc) => `0 0 6px #ffffff, 0 0 14px ${acc}, 0 0 30px ${acc}, 0 0 54px color-mix(in srgb, ${acc} 60%, transparent)`,
    recorte: true,
  },
  cromo: {
    frente: () => "linear-gradient(180deg, #ffffff 0%, #d9e2f2 26%, #7d8aa5 46%, #f2f7ff 58%, #939fb8 78%, #cfd9ea 100%)",
    capa: (_acc, i) => `color-mix(in srgb, #8b98b0 ${Math.max(24, 78 - i * 12)}%, #0a0e16)`,
    brillo: () => "0 2px 0 rgba(0,0,0,0.85), 0 8px 24px rgba(0,0,0,0.55)",
    recorte: true,
  },
  matriz: {
    frente: () => "linear-gradient(180deg, #eaffef 0%, #5eff9a 48%, #12a054 100%)",
    capa: (_acc, i) => `color-mix(in srgb, #22c55e ${Math.max(20, 70 - i * 14)}%, #04120a)`,
    brillo: () => "0 0 14px rgba(94,255,154,0.75), 0 0 34px rgba(34,197,94,0.4)",
    recorte: true,
    mono: true,
  },
  brasa: {
    frente: () => "linear-gradient(180deg, #ffffff 0%, #ffe9c4 45%, #ff8a2a 100%)",
    capa: (acc, i) => `color-mix(in srgb, ${acc} ${Math.max(22, 58 - i * 10)}%, #140a04)`,
    brillo: (acc) => `0 0 20px color-mix(in srgb, ${acc} 45%, transparent), 0 2px 0 rgba(0,0,0,0.85)`,
    recorte: true,
  },
  // ── v114.0 ECLIPSE — los 3 materiales votados por la casa ──
  vidrio: {
    // cristal esmerilado: la cara deja VER a través (gradiente translúcido
    // con bg-clip-text) y las capas interiores son refracciones tenues
    frente: () => "linear-gradient(160deg, rgba(255,255,255,0.92) 0%, rgba(214,240,255,0.42) 38%, rgba(150,205,240,0.30) 58%, rgba(235,252,255,0.78) 100%)",
    capa: (acc, i) => {
      const mezcla = Math.max(6, 26 - i * 4);
      const alfa = Math.max(0.05, 0.3 - i * 0.045).toFixed(3);
      return `color-mix(in srgb, ${acc} ${mezcla}%, rgba(215,240,255,${alfa}))`;
    },
    brillo: () => "0 0 1px rgba(255,255,255,0.95), 0 1px 0 rgba(255,255,255,0.55), 0 0 20px rgba(190,232,255,0.40), inset 0 0 8px rgba(255,255,255,0.28)",
    recorte: true,
  },
  oro: {
    // ORO LÍQUIDO: bandas de metal dorado — luz blanca arriba, sombra
    // profunda abajo, reflejo caliente en el centro (el lingote de la casa)
    frente: () => "linear-gradient(180deg, #fffbe6 0%, #ffe27a 26%, #d4a017 47%, #fff3b0 58%, #a8720a 82%, #ffd75e 100%)",
    capa: (_acc, i) => `color-mix(in srgb, #d4a017 ${Math.max(26, 74 - i * 11)}%, #1c1204)`,
    brillo: () => "0 0 18px rgba(255,203,74,0.55), 0 2px 0 rgba(58,36,0,0.9), 0 10px 26px rgba(120,80,0,0.35)",
    recorte: true,
  },
  glitch: {
    // GLITCH: la señal rota — cara blanca con temblor (clase v114-glitch)
    // y capas que se desvían en X alternando magenta/cian (aberración RGB)
    frente: () => "linear-gradient(180deg, #ffffff 0%, #f2f6ff 55%, #d9e4ff 100%)",
    capa: (_acc, i) => (i % 2 === 0 ? "rgba(255,45,120,0.85)" : "rgba(0,240,255,0.85)"),
    brillo: () => "-2px 0 0 rgba(255,45,120,0.75), 2px 0 0 rgba(0,240,255,0.75), 0 0 12px rgba(160,120,255,0.35)",
    recorte: true,
    desvio: (i) => (i % 2 === 0 ? -1.7 : 1.7) * Math.ceil(i / 2),
    temblor: true,
  },
};

interface Letra3DProps {
  char: string;
  acento: string;
  material: MaterialLetra;
  /** capas de extrusión (1..10) */
  profundidad: number;
  /** índice de letra (para el retardo de entrada y el ciclo MATRIZ) */
  idx: number;
  /** tick compartido del ciclo MATRIZ (cambia el glifo) */
  tick?: number;
  /** desactivar la animación de entrada (reduced motion) */
  quieto?: boolean;
  /** tamaño de fuente (hereda del contenedor por defecto) */
  className?: string;
}

const PROF_CAPA_PX = 2.1; // grosor de cada capa de extrusión en px

export function Letra3D({ char, acento, material, profundidad, idx, tick, quieto, className }: Letra3DProps) {
  const pal = PALETAS[material];
  const n = Math.max(1, Math.min(10, profundidad));
  const esEspacio = char === " " || char === "\u00A0";
  // el glifo vivo del material MATRIZ: respira con el tick global
  const glifo = material === "matriz" && tick !== undefined && !esEspacio
    ? GLIFOS[(idx * 7 + tick * 3 + char.charCodeAt(0)) % GLIFOS.length]
    : char;

  if (esEspacio) {
    return <span aria-hidden className={cn("inline-block whitespace-pre", className)}>{char}</span>;
  }

  const capas: React.ReactNode[] = [];
  for (let i = 1; i <= n; i++) {
    // v114 GLITCH: cada capa se desvía en X (aberración cromática en volumen)
    const dx = pal.desvio ? pal.desvio(i) : 0;
    capas.push(
      <span
        key={i}
        aria-hidden
        className="absolute inset-0 select-none"
        style={{
          transform: `translateX(${dx.toFixed(1)}px) translateZ(${(-PROF_CAPA_PX * i).toFixed(1)}px)`,
          color: pal.capa(acento, i, n),
          textShadow: "0 1px 0 rgba(0,0,0,0.6)",
        }}
      >
        {glifo}
      </span>
    );
  }

  return (
    <span aria-hidden className={cn("v113-letra inline-block whitespace-pre", className)} style={{ animationDelay: `${Math.min(0.045 * idx, 1.4)}s` }}>
      <span className="v113-cuerpo inline-block" style={{ transformStyle: "preserve-3d" }}>
        {capas}
        <span
          className={cn("relative select-none", pal.temblor && "v114-glitch")}
          style={
            pal.recorte
              ? {
                  backgroundImage: pal.frente(acento),
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  textShadow: pal.brillo(acento),
                }
              : { color: pal.plano, textShadow: pal.brillo(acento) }
          }
        >
          {glifo}
        </span>
      </span>
    </span>
  );
}

interface TituloLetras3DProps {
  texto: string;
  acento?: string;
  material?: MaterialLetra;
  /** capas de extrusión (default 5) */
  profundidad?: number;
  /** la entrada letra a letra (default true) */
  entrada?: boolean;
  /** clase del bloque (tamaño de fuente vive aquí) */
  className?: string;
  /** aria-label del bloque (default = texto) */
  etiqueta?: string;
}

export function TituloLetras3D({
  texto,
  acento = "#5EEAD4",
  material = "holo",
  profundidad = 5,
  entrada = true,
  className,
  etiqueta,
}: TituloLetras3DProps) {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  const mono = PALETAS[material].mono;

  // ciclo del material MATRIZ: un solo reloj para todas las letras (5.5 Hz)
  useEffect(() => {
    if (material !== "matriz" || reduced) return;
    const iv = window.setInterval(() => setTick((v) => (v + 1) % 97), 180);
    return () => window.clearInterval(iv);
  }, [material, reduced]);

  const letras = Array.from(texto.toUpperCase());
  return (
    <span
      role="heading"
      aria-level={2}
      aria-label={etiqueta ?? texto}
      className={cn(
        "v113-bloque inline-block select-none font-black uppercase leading-none tracking-tight",
        mono && "font-mono tracking-normal",
        className
      )}
      style={{ perspective: "900px" }}
    >
      {/* el bloque entero se inclina con la persona — CSS calc puro,
          consume las vars del Motor3D (--vg-mx/--vg-my), cero re-render */}
      <span
        aria-hidden
        className="inline-block"
        style={{
          transformStyle: "preserve-3d",
          transform:
            "rotateX(calc(var(--vg-my, 0) * -11deg * var(--vg-3d-i, 0))) rotateY(calc(var(--vg-mx, 0) * 13deg * var(--vg-3d-i, 0)))",
        }}
      >
        {letras.map((l, i) => (
          <Letra3D
            key={`${i}-${l}`}
            char={l}
            idx={i}
            acento={acento}
            material={material}
            profundidad={profundidad}
            tick={tick}
            quieto={reduced || !entrada}
            className={reduced || !entrada ? "v113-letra-quieto" : undefined}
          />
        ))}
      </span>
    </span>
  );
}
