"use client";

// v72.0 INFINITA VERDADES — TÍTULO ÉPICO UNIVERSAL.
// La regla de oro del comandante para TODA sección de Vanguard:
//   1) ARRIBA: título GRANDE y llamativo (letras con luz de luna y brasa).
//   2) DEBAJO: una ilustración hermosa (imagen real, nada plano).
//   3) DEBAJO: texto rápido y fácil de leer.
// Animado con framer-motion (entrada por letras + la ilustración sube con
// resplandor cálido). Respeta prefers-reduced-motion.

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TituloEpicoProps {
  /** Título grande y llamativo */
  titulo: string;
  /** Línea pequeña encima del título (ej. "EL MAYOR CENTRO DE NOTICIAS DEL MUNDO") */
  volanta?: string;
  /** Ilustración hero debajo del título */
  imagen: string;
  /** Texto fácil de leer debajo de la ilustración */
  texto: string;
  /** Altura de la ilustración en px (default 260) */
  altura?: number;
  /** Prioridad de carga de la imagen (hero visible al abrir) */
  prioritaria?: boolean;
  /** Tinte del resplandor: "brasa" (ámbar) | "luna" (frío) */
  tinte?: "brasa" | "luna";
  className?: string;
}

export function TituloEpico({
  titulo,
  volanta,
  imagen,
  texto,
  altura = 260,
  prioritaria = false,
  tinte = "brasa",
  className,
}: TituloEpicoProps) {
  const reduced = useReducedMotion();
  const letras = Array.from(titulo);

  return (
    <section className={cn("relative overflow-hidden", className)} aria-label={titulo}>
      {/* resplandor atmosférico detrás del título */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-24 left-1/2 h-64 w-[130%] -translate-x-1/2 blur-3xl",
          tinte === "brasa"
            ? "bg-[radial-gradient(ellipse_at_center,rgba(255,138,42,0.16),transparent_65%)]"
            : "bg-[radial-gradient(ellipse_at_center,rgba(168,199,255,0.14),transparent_65%)]"
        )}
      />

      <div className="relative text-center px-2 pt-4 pb-2">
        {volanta ? (
          <motion.p
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "font-mono text-[10px] md:text-[11px] uppercase tracking-[0.35em]",
              tinte === "brasa" ? "text-amber" : "text-cyan-hud"
            )}
          >
            {volanta}
          </motion.p>
        ) : null}

        {/* TÍTULO GIGANTE letra a letra: luz de luna arriba, brasa abajo */}
        <motion.h2
          initial={reduced ? false : "oculto"}
          animate="visible"
          aria-label={titulo}
          className="font-display font-black uppercase leading-none tracking-tight text-[clamp(1.9rem,6.5vw,3.6rem)] mt-1 mb-3 select-none"
        >
          {letras.map((l, i) => (
            <motion.span
              key={i}
              aria-hidden
              variants={{
                oculto: { opacity: 0, y: 22, rotateX: -70, filter: "blur(6px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  filter: "blur(0px)",
                  transition: { delay: 0.04 * i, duration: 0.55, ease: [0.2, 0.9, 0.25, 1] },
                },
              }}
              className="inline-block whitespace-pre bg-gradient-to-b from-white via-[#ffe9c4] via-45% to-[#ff8a2a] bg-clip-text text-transparent"
              style={{
                textShadow:
                  "0 0 22px rgba(255,150,60,0.35), 0 2px 0 rgba(0,0,0,0.85), 0 10px 28px rgba(0,0,0,0.6)",
                transformStyle: "preserve-3d",
              }}
            >
              {l}
            </motion.span>
          ))}
        </motion.h2>
      </div>

      {/* ILUSTRACIÓN hero — imagen primero, nada plano */}
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 1.04, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        className="relative rounded-md overflow-hidden border border-amber-hud/25 shadow-[0_18px_50px_rgba(0,0,0,0.65),0_0_38px_rgba(255,138,42,0.13)]"
        style={{ height: `min(${altura}px, 46vw)` }}
      >
        <Image
          src={imagen}
          alt={`Ilustración de ${titulo}`}
          fill
          sizes="(max-width: 768px) 100vw, 900px"
          priority={prioritaria}
          className="object-cover"
        />
        {/* viñeta cinematográfica + brasa baja, coherente con v71.1 */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent"
        />
        <div
          aria-hidden
          className="hairline-gradient absolute top-0 left-0 right-0 opacity-70"
        />
      </motion.div>

      {/* TEXTO fácil de leer */}
      <motion.p
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.35 }}
        className="relative mt-3 mb-1 px-1 text-[13px] md:text-[15px] leading-relaxed text-foreground/85 text-center"
      >
        {texto}
      </motion.p>
    </section>
  );
}
