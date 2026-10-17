"use client";

// ============================================================
// v121.0 LA CAMA MÁS CÓMODA — LETRAS ANIMADAS
// "haz que las letras tengan animación": todo título de la casa
// entra letra a letra (rotación X volumétrica + subida). Solo
// transform/opacity = 60 FPS. Respeta prefers-reduced-motion.
// Usado por PanelHeader (TODAS las salas) y por los héroes.
// ============================================================
import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface LetrasAnimadasProps {
  text: string;
  className?: string;
  /** Retardo inicial en segundos (para orquestar con el panel) */
  delay?: number;
  /** Paso entre letras en segundos */
  step?: number;
  /** Animación continua sutil después de entrar (brasas) */
  brasa?: boolean;
  /** v124.0 CAVIAR: clase aplicada a CADA glifo (ej: caviar-letra = oro) */
  letraClass?: string;
}

export function LetrasAnimadas({ text, className, delay = 0, step = 0.026, brasa = false, letraClass }: LetrasAnimadasProps) {
  const reduced = useReducedMotion();
  const letras = useMemo(() => Array.from(text), [text]);

  if (reduced) return <span className={[className, letraClass].filter(Boolean).join(" ") || undefined}>{text}</span>;

  return (
    <span className={className} role="text" aria-label={text}>
      {letras.map((ch, i) => (
        <motion.span
          key={`${i}-${ch}`}
          aria-hidden
          className={letraClass}
          style={{ display: "inline-block", whiteSpace: "pre", transformOrigin: "50% 100%" }}
          initial={{ opacity: 0, y: 10, rotateX: -64 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            delay: delay + i * step,
            duration: 0.42,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/** Versión BRASA: entra letra a letra y después respira con un
 *  brillo cálido sutil (opacity, sin layout). Para títulos héroe. */
export function LetrasBrasa({ text, className, delay = 0, step = 0.03, letraClass }: Omit<LetrasAnimadasProps, "brasa">) {
  const reduced = useReducedMotion();
  const letras = useMemo(() => Array.from(text), [text]);

  if (reduced) return <span className={[className, letraClass].filter(Boolean).join(" ") || undefined}>{text}</span>;

  return (
    <span className={className} role="text" aria-label={text}>
      {letras.map((ch, i) => (
        <motion.span
          key={`${i}-${ch}`}
          aria-hidden
          className={["vg-letra-brasa", letraClass].filter(Boolean).join(" ")}
          style={{ display: "inline-block", whiteSpace: "pre", transformOrigin: "50% 100%" }}
          initial={{ opacity: 0, y: 12, rotateX: -70, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ delay: delay + i * step, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}
