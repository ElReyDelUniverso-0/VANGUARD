"use client";

// v84.0 FORTUNA DE GUERRA — celebración cinematográfica del GOLPE DE FORTUNA.
// Escucha el bus "vanguard:fortuna" (disparado por addCoins) y llueve monedas
// doradas con el multiplicador gigante. Perf: transform/opacity únicamente
// (60fps), auto-limpieza en 2.6s, respeta prefers-reduced-motion.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FortunaEvento } from "@/lib/fortuna";

interface Lluvia {
  id: number;
  ev: FortunaEvento;
}

let __seq = 0;

// 18 monedas con trayectorias fijas (x %, retraso, tamaño, giro) — sin Math.random
// en el render: cero hidratación rara, cero layout thrash.
const MONEDAS = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 37 + 11) % 96, // 0..95 %
  delay: (i % 6) * 0.09,
  size: 10 + ((i * 7) % 12),
  dur: 1.5 + ((i * 13) % 9) / 10,
  spin: i % 2 === 0 ? 360 : -540,
}));

export function FortunaLluvia() {
  const [lluvias, setLluvias] = useState<Lluvia[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const onFortuna = (e: Event) => {
      const ev = (e as CustomEvent<FortunaEvento>).detail;
      if (!ev || !ev.motivo || ev.extra <= 0) return;
      const id = ++__seq;
      setLluvias((prev) => [...prev.slice(-1), { id, ev }]);
      timers.current.push(
        setTimeout(() => setLluvias((prev) => prev.filter((l) => l.id !== id)), 2600)
      );
    };
    window.addEventListener("vanguard:fortuna", onFortuna);
    return () => {
      window.removeEventListener("vanguard:fortuna", onFortuna);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9980] overflow-hidden" aria-hidden>
      <AnimatePresence>
        {lluvias.map(({ id, ev }) => {
          const epico = ev.mult >= 3;
          return (
            <motion.div
              key={id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* destello radial de fondo */}
              <motion.div
                className={cn(
                  "absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full",
                  epico ? "w-[70vmin] h-[70vmin]" : "w-[52vmin] h-[52vmin]"
                )}
                style={{
                  background: `radial-gradient(circle, ${
                    epico ? "rgba(255,196,64,0.30)" : "rgba(255,176,32,0.20)"
                  } 0%, transparent 68%)`,
                }}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.4, 1.12, 1], opacity: [0, 1, 0.85] }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
              {/* lluvia de monedas */}
              {MONEDAS.map((m, i) => (
                <motion.span
                  key={i}
                  className="absolute top-[-6%] rounded-full flex items-center justify-center font-bold"
                  style={{
                    left: `${m.x}%`,
                    width: m.size,
                    height: m.size,
                    fontSize: m.size * 0.62,
                    background: "linear-gradient(145deg,#FFE9A8 0%,#F7C948 45%,#B8860B 100%)",
                    boxShadow: "0 0 8px rgba(247,201,72,0.55), inset 0 -2px 3px rgba(120,70,0,0.45)",
                    color: "#6b4a00",
                    willChange: "transform, opacity",
                  }}
                  initial={{ y: "-8vh", opacity: 0, rotate: 0 }}
                  animate={{ y: "108vh", opacity: [0, 1, 1, 0], rotate: m.spin }}
                  transition={{ duration: m.dur, delay: m.delay, ease: "easeIn" }}
                >
                  ⓒ
                </motion.span>
              ))}
              {/* letrero gigante */}
              <motion.div
                className="absolute left-1/2 top-[30%] -translate-x-1/2 text-center"
                initial={{ scale: 0.5, opacity: 0, y: 26 }}
                animate={{ scale: [0.5, 1.18, 1], opacity: [0, 1, 1], y: [26, -6, 0] }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className={cn(
                    "font-black tracking-tight drop-shadow-[0_2px_18px_rgba(247,201,72,0.65)]",
                    epico ? "text-5xl sm:text-7xl" : "text-4xl sm:text-6xl"
                  )}
                  style={{
                    color: "#FFD873",
                    WebkitTextStroke: "1px rgba(120,70,0,0.55)",
                  }}
                >
                  ×{ev.mult >= 10 ? ev.mult : ev.mult.toFixed(ev.mult % 1 === 0 ? 0 : 2).replace(/\.?0+$/, "")}
                </div>
                <div
                  className={cn(
                    "mt-1 font-mono font-bold tracking-[0.3em] text-amber",
                    epico ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                  )}
                  style={{ textShadow: "0 0 14px rgba(247,201,72,0.8)" }}
                >
                  {ev.motivo}
                </div>
                <div className="mt-1.5 inline-block px-3 py-1 rounded-full bg-black/70 border border-amber-hud/60 font-mono text-[11px] text-amber-hud">
                  +{ev.extra} ⓒ EXTRA
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
