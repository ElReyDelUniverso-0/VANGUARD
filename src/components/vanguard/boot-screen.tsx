"use client";

// v13 — PANTALLA DE CARGA MILITAR: globo 3D girando (CSS), barra de progreso
// con textos de conexión y cierre automatico a los 3s. Solo 1 vez por sesion.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_LINES = [
  "Conectando con fuentes globales...",
  "Cargando datos de conflictos...",
  "Sincronizando inteligencia mundial...",
  "Sistema listo — Bienvenido Agente",
];

const BOOT_KEY = "vanguard-booted";

export function BootScreen() {
  const [visible, setVisible] = useState(false);
  const [line, setLine] = useState(0);

  useEffect(() => {
    // solo mostrar una vez por sesion de navegador (async para evitar cascada de renders)
    const t0 = setTimeout(() => {
      let shown = false;
      try {
        shown = sessionStorage.getItem(BOOT_KEY) === "1";
      } catch {
        shown = false;
      }
      if (!shown) setVisible(true);
      try {
        sessionStorage.setItem(BOOT_KEY, "1");
      } catch {
        /* storage bloqueado: no importa */
      }
    }, 0);
    const step = setInterval(() => setLine((l) => Math.min(l + 1, BOOT_LINES.length - 1)), 700);
    const end = setTimeout(() => setVisible(false), 3000);
    return () => {
      clearTimeout(t0);
      clearInterval(step);
      clearTimeout(end);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 section-gradient overflow-hidden"
          style={{ background: "radial-gradient(circle at 50% 40%, #0d1526 0%, #0A0A0F 70%)" }}
          aria-label="Pantalla de carga del sistema"
          role="status"
        >
          {/* v16: aurora de fondo */}
          <div className="aurora-orb aurora-orb-1" style={{ position: "absolute", filter: "blur(60px)" }} aria-hidden />
          <div className="aurora-orb aurora-orb-2" style={{ position: "absolute", filter: "blur(60px)" }} aria-hidden />

          {/* Globo girando en 3D (CSS) */}
          <div className="boot-globe w-32 h-32 sm:w-40 sm:h-40" />

          {/* Titulo militar — v16 degradado animado */}
          <div className="text-center px-4">
            <div
              className="font-display text-xl sm:text-3xl font-black tracking-[0.3em] text-gradient"
              style={{ filter: "drop-shadow(0 0 18px rgba(30,144,255,0.55))" }}
            >
              VANGUARD
            </div>
            <div className="font-mono text-[9px] sm:text-[11px] tracking-[0.45em] text-electric mt-1 uppercase">
              Centro de Mando Global
            </div>
            <div className="mt-2 inline-flex items-center gap-2">
              <span className="text-gradient font-mono text-[9px] font-bold uppercase tracking-[0.3em]">
                Multijugador Terminado · v17.0
              </span>
            </div>
          </div>

          {/* Barra de progreso + texto militar con typewriter */}
          <div className="w-64 sm:w-80">
            <div className="h-1.5 w-full bg-black/60 border border-electric-hud overflow-hidden rounded-sm">
              <div className="boot-bar h-full bg-gradient-to-r from-electric via-neon to-neon" />
            </div>
            <div className="mt-2 h-4 text-center font-mono text-[10px] sm:text-xs text-neon typewriter-caret tracking-widest">
              {BOOT_LINES[line]}
            </div>
          </div>

          {/* Puntos de sistema */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-electric blink-soft"
                style={{ animationDelay: `${i * 0.22}s` }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
