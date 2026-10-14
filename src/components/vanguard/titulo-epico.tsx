"use client";

// v72.0 INFINITA VERDADES — TÍTULO ÉPICO UNIVERSAL.
// La regla de oro del comandante para TODA sección de Vanguard:
//   1) ARRIBA: título GRANDE y llamativo (letras con luz de luna y brasa).
//   2) DEBAJO: una escena HERMOSA (v110: escena 3D holográfica viva —
//      nada plano, cero imágenes muertas; imagen solo como legado).
//   3) DEBAJO: texto rápido y fácil de leer.
// v110.0 MATRIZ 2100: la ilustración se vuelve ESCENA 3D del motor
// procedural (interactúa con la persona, sello EN VIVO con reloj real,
// personalizable desde Ajustes → Tecnología 3D).
// Animado con framer-motion. Respeta prefers-reduced-motion.

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Escena3D, SelloVivo, type VarianteEscena } from "./escenas-3d";
import { useEstilo3D } from "@/lib/estilo3d";
import { TituloLetras3D, type MaterialLetra } from "./letras-3d";

interface TituloEpicoProps {
  /** Título grande y llamativo */
  titulo: string;
  /** Línea pequeña encima del título (ej. "EL MAYOR CENTRO DE NOTICIAS DEL MUNDO") */
  volanta?: string;
  /** Ilustración hero (LEGADO v109 — se usa solo si no hay `escena`) */
  imagen: string;
  /** v110: variante de la escena 3D procedural (mata a la imagen plana) */
  escena?: VarianteEscena;
  /** v110: semilla determinista de la escena (varía el detalle) */
  semilla?: number;
  /** v110: mostrar sello EN VIVO con reloj real (default true) */
  sello?: boolean;
  /** Texto fácil de leer debajo de la ilustración */
  texto: string;
  /** Altura de la ilustración en px (default 260) */
  altura?: number;
  /** Prioridad de carga de la imagen (hero visible al abrir) */
  prioritaria?: boolean;
  /** Tinte del resplandor: "brasa" (ámbar) | "luna" (frío) */
  tinte?: "brasa" | "luna";
  /** v73.0: acento vibrante ÚNICO de la sección (hex) — tiñe glow, borde y volanta */
  acento?: string;
  /** v113.0: material del MOTOR DE LETRAS 3D (default: brasa→BRASA, luna→HOLOGRAMA) */
  materialLetras?: MaterialLetra;
  /** v113.0: capas de extrusión de las letras (default 5) */
  profundidadLetras?: number;
  className?: string;
}

export function TituloEpico({
  titulo,
  volanta,
  imagen,
  escena,
  semilla = 7,
  sello = true,
  texto,
  altura = 260,
  prioritaria = false,
  tinte = "brasa",
  acento,
  materialLetras,
  profundidadLetras = 5,
  className,
}: TituloEpicoProps) {
  const reduced = useReducedMotion();
  const sellos = useEstilo3D((s) => s.sellosVivos);
  // v113.0 LETRAS VIVAS: el título deja de ser tinta plana y gana VOLUMEN real
  const materialFinal: MaterialLetra = materialLetras ?? (tinte === "luna" ? "holo" : "brasa");
  // v73.0 REGLA DE ORO: acento hex por sección (si no hay, usa el tinte clásico)
  const acc = acento && /^#[0-9a-fA-F]{6}$/.test(acento) ? acento : tinte === "luna" ? "#A8C7FF" : "#FF8A2A";
  const accSuave = `${acc}2E`; // ~18% alpha para glows
  const accMedio = `${acc}47`; // ~28% alpha para bordes

  return (
    <section className={cn("relative overflow-hidden", className)} aria-label={titulo}>
      {/* resplandor atmosférico detrás del título (acento de la sección) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[130%] -translate-x-1/2 blur-3xl"
        style={{ background: `radial-gradient(ellipse at center, ${accSuave}, transparent 65%)` }}
      />

      <div className="relative text-center px-2 pt-4 pb-2">
        {volanta ? (
          <motion.p
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.35em]"
            style={{ color: acc, textShadow: `0 0 14px ${accMedio}` }}
          >
            {volanta}
          </motion.p>
        ) : null}

        {/* v113.0 TÍTULO GIGANTE = MOTOR DE LETRAS 3D: cada letra es un volumen
            extruido por capas que se inclina con la persona (Motor3D vars).
            La identidad dorada (BRASA) y la lunar (HOLOGRAMA) se conservan. */}
        <div className="mt-1 mb-3">
          <TituloLetras3D
            texto={titulo}
            acento={acc}
            material={materialFinal}
            profundidad={profundidadLetras}
            className="text-[clamp(1.9rem,6.5vw,3.6rem)]"
            etiqueta={titulo}
          />
        </div>
      </div>

      {/* ESCENA hero — v110: 3D holográfica viva (o imagen legado) */}
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 1.04, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        className="relative rounded-md overflow-hidden"
        style={{
          height: `min(${altura}px, 46vw)`,
          border: `1px solid ${accMedio}`,
          boxShadow: `0 18px 50px rgba(0,0,0,0.65), 0 0 38px ${accSuave}`,
        }}
      >
        {escena ? (
          <Escena3D variante={escena} acento={acc} semilla={semilla} className="absolute inset-0" />
        ) : (
          <Image
            src={imagen}
            alt={`Ilustración de ${titulo}`}
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            priority={prioritaria}
            className="object-cover"
          />
        )}
        {/* sello EN VIVO con reloj real — Vanguard late en tiempo real */}
        {sello && sellos ? (
          <div className="absolute top-2 right-2 z-30">
            <SelloVivo acento={acc} etiqueta="EN VIVO" />
          </div>
        ) : null}
        {/* viñeta cinematográfica, coherente con v71.1 (más suave: la escena debe verse) */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_62%,rgba(0,0,0,0.42)_100%)] pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/55 to-transparent pointer-events-none"
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
