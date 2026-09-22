"use client";

// VANGUARD v33 ESCUELA DE GUERRA — TUTORIAL / MANUAL DEL COMANDANTE.
// Un recorrido de 10 pasos que enseña TODO: navegación, mapa militar 3D,
// guerra multijugador, mercado, juegos, creadores, comunidad, idiomas y
// la conexión en directo. Funciona en dos modos:
//  · AUTO: se abre solo la primera vez que alguien entra (localStorage).
//  · MANUAL: cualquier panel puede disparar el evento "vanguard:open-tutorial"
//    (ej. botón VER TUTORIAL en el Centro de ayuda).
// Todo el texto viene del i18n (tutorial.*) — 8 idiomas.

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Rocket, Compass, Globe2, Castle, Coins, Gamepad2, Palette, MessagesSquare,
  Languages, Zap, ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { navigateTo } from "@/lib/nav";
import type { TabKey } from "@/components/vanguard/tab-nav";

const STORE_KEY = "vanguard-tutorial-v33";

// pasos: cada uno enseña una zona; con `tab` muestra el botón IR ALLÁ
const STEPS: { icon: React.ReactNode; s: string; tab?: TabKey; accent: string }[] = [
  { icon: <Rocket className="w-7 h-7" />, s: "s1", accent: "text-amber", tab: "inicio" },
  { icon: <Compass className="w-7 h-7" />, s: "s2", accent: "text-cyan-hud" },
  { icon: <Globe2 className="w-7 h-7" />, s: "s3", accent: "text-cyan-hud", tab: "mapa" },
  { icon: <Castle className="w-7 h-7" />, s: "s4", accent: "text-red-hud", tab: "mundo" },
  { icon: <Coins className="w-7 h-7" />, s: "s5", accent: "text-green-hud", tab: "bolsa" },
  { icon: <Gamepad2 className="w-7 h-7" />, s: "s6", accent: "text-red-hud", tab: "dron" },
  { icon: <Palette className="w-7 h-7" />, s: "s7", accent: "text-violet-hud", tab: "creador" },
  { icon: <MessagesSquare className="w-7 h-7" />, s: "s8", accent: "text-cyan-hud", tab: "salas" },
  { icon: <Languages className="w-7 h-7" />, s: "s9", accent: "text-amber" },
  { icon: <Zap className="w-7 h-7" />, s: "s10", accent: "text-green-hud", tab: "inicio" },
];

export function TutorialModal() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // AUTO: primera visita → se abre solo, tras el boot (una sola vez por versión)
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(STORE_KEY) === "1";
    } catch { /* modo privado */ }
    const fire = () => {
      if (!seen) {
        setOpen(true);
        try { localStorage.setItem(STORE_KEY, "1"); } catch { /* noop */ }
      }
    };
    const tm = setTimeout(fire, 2400);
    // MANUAL: evento global (Centro de ayuda, HUD, etc.)
    const onOpen = () => {
      clearTimeout(tm);
      setStep(0);
      setOpen(true);
      try { localStorage.setItem(STORE_KEY, "1"); } catch { /* noop */ }
    };
    window.addEventListener("vanguard:open-tutorial", onOpen);
    return () => {
      clearTimeout(tm);
      window.removeEventListener("vanguard:open-tutorial", onOpen);
    };
  }, []);

  const close = () => setOpen(false);
  const total = STEPS.length;
  const cur = STEPS[Math.min(step, total - 1)];
  const pct = useMemo(() => Math.round(((step + 1) / total) * 100), [step, total]);

  // teclado: ←/→ navegan, Escape cierra
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" && step < total - 1) setStep(step + 1);
      if (e.key === "ArrowLeft" && step > 0) setStep(step - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step, total]);

  const goToTab = (tab: TabKey) => {
    close();
    navigateTo(tab);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="tutorial"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9990] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="hud-corner w-full max-w-md bg-background border border-amber-hud shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("tutorial.title")}
          >
            {/* barra superior: título + progreso + cerrar */}
            <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-amber-hud/30 bg-gradient-to-r from-amber-hud/15 to-transparent">
              <span className={cn("flex-shrink-0", cur.accent)}>{cur.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                  {t("tutorial.step", { n: step + 1, total })}
                </div>
                <div className="text-sm font-mono font-bold text-amber truncate">{t("tutorial.title")}</div>
              </div>
              <button
                onClick={close}
                aria-label={t("common.close")}
                className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-amber-hud transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* barra de progreso */}
            <div className="h-1 bg-secondary">
              <div className="h-full bg-amber-hud transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>

            {/* contenido del paso */}
            <div className="px-4 py-4 min-h-[168px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.16 }}
                >
                  <div className={cn("text-base font-mono font-bold uppercase tracking-wide mb-2", cur.accent)}>
                    {t(`tutorial.${cur.s}.t`)}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(`tutorial.${cur.s}.b`)}</p>
                  {cur.tab && (
                    <button
                      onClick={() => goToTab(cur.tab as TabKey)}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 border border-cyan-hud text-cyan-hud bg-cyan-hud/15 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-cyan-hud/30 active:scale-95 transition-all"
                    >
                      <Rocket className="w-3 h-3" /> {t("tutorial.go")}
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* pie: saltar / atrás / puntos / siguiente-terminar */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-secondary/40">
              <button
                onClick={close}
                className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("tutorial.skip")}
              </button>
              <div className="flex-1 flex items-center justify-center gap-1">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    aria-label={`step ${i + 1}`}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      i === step ? "bg-amber-hud w-3" : i < step ? "bg-amber-hud/50" : "bg-secondary"
                    )}
                  />
                ))}
              </div>
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1 px-2.5 py-1.5 border border-border text-[10px] font-mono uppercase text-muted-foreground hover:text-foreground hover:border-amber-hud transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" /> {t("tutorial.back")}
                </button>
              )}
              <button
                onClick={() => (step < total - 1 ? setStep(step + 1) : close())}
                className="flex items-center gap-1 px-3 py-1.5 border border-amber-hud bg-amber-hud/20 text-amber text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-amber-hud/40 active:scale-95 transition-all"
              >
                {step < total - 1 ? (
                  <>{t("tutorial.next")} <ChevronRight className="w-3 h-3" /></>
                ) : (
                  <><Zap className="w-3 h-3" /> {t("tutorial.done")}</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
