"use client";

// Vanguard v14 — MENÚ COMPLETO a pantalla completa: navegación llamativa
// con tarjetas gigantes por sección y acceso directo a los 57 subtemas.
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTIONS, type TabKey } from "@/components/vanguard/tab-nav";
import { sfx } from "@/lib/sound";
import { useT, TAB_SHORTS } from "@/lib/i18n";

const HEX: Record<string, string> = {
  red: "#FF3B30",
  green: "#00FF87",
  cyan: "#38BDF8",
  amber: "#3EA6FF",
  violet: "#A855F7",
};

export function MegaMenu({
  open,
  onChange,
  onClose,
}: {
  open: boolean;
  onChange: (k: TabKey) => void;
  onClose: () => void;
}) {
  const { t, lang } = useT();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 bg-[#0A0A0F]/96 backdrop-blur-md overflow-y-auto thin-scroll"
          role="dialog"
          aria-modal="true"
          aria-label="Menú completo de Vanguard"
        >
          <div className="min-h-full max-w-7xl mx-auto px-4 py-6 flex flex-col">
            {/* cabecera */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-hud">
                  Navegación global
                </div>
                <h2 className="glitch font-display text-2xl sm:text-3xl font-black tracking-wider text-soft" data-text="MENÚ VANGUARD">
                  MENÚ VANGUARD
                </h2>
              </div>
              <button
                autoFocus
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center border border-border rounded-sm text-muted-foreground hover:text-foreground hover:border-amber-hud transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* tarjetas de secciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-8">
              {/* atajo directo a INICIO */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 }}
                onClick={() => {
                  sfx.tab();
                  onChange("inicio");
                  onClose();
                }}
                className="hud-corner card-shine p-4 text-left border-amber-hud bg-amber-hud/10 hover:bg-amber-hud/25 transition-colors relative overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-5 h-5 text-amber" />
                  <span className="font-display text-sm font-bold tracking-widest text-foreground">PORTADA</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Vuelve al inicio con las últimas noticias y el menú de mundos.
                </p>
              </motion.button>

              {SECTIONS.map((s, i) => {
                const hex = HEX[s.color] ?? "#3EA6FF";
                return (
                  <motion.div
                    key={s.key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 + i * 0.03 }}
                    className="hud-corner card-shine relative overflow-hidden p-4 border"
                    style={{ borderColor: `${hex}55`, background: `linear-gradient(150deg, ${hex}14 0%, rgba(10,10,15,0.85) 60%)` }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-8 h-8 rounded-sm flex items-center justify-center border" style={{ borderColor: `${hex}66`, color: hex, background: `${hex}14` }}>
                        {s.icon}
                      </span>
                      <span className="font-display text-sm font-bold tracking-widest" style={{ color: hex }}>
                        {t(`sec.${s.key}`)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-3 min-h-[2.2em]">{t(`sec.${s.key}.desc`)}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.tabs.map((t) => (
                        <button
                          key={t.key}
                          onClick={() => {
                            sfx.tab();
                            onChange(t.key);
                            onClose();
                          }}
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-sm border border-border/60 text-[9px] font-mono font-bold uppercase tracking-wide text-muted-foreground",
                            "hover:text-foreground hover:border-amber-hud/70 hover:bg-amber-hud/20 transition-colors"
                          )}
                        >
                          {t.icon}
                          {TAB_SHORTS[lang]?.[t.key] ?? t.short}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-auto pb-4 text-center text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
              Pulsa ESC para cerrar · teclas 1-0 para saltar entre mundos
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
