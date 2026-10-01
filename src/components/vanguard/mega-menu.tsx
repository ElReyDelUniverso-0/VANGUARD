"use client";

// Vanguard v78 — MENÚ COMPLETO a pantalla completa: cada tarjeta de sección
// lleva su PORTADA CINEMATOGRÁFICA (ilustración viva en Ken Burns + velo del
// color de la sección + destello al hover). La regla de oro también aquí.
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Home, Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTIONS, ALL_TABS, TOTAL_TABS, type TabKey } from "@/components/vanguard/tab-nav";
import { sfx } from "@/lib/sound";
import { useT, TAB_SHORTS } from "@/lib/i18n";
import { useGameStore } from "@/lib/game-store";

const HEX: Record<string, string> = {
  red: "#FF3B30",
  green: "#00FF87",
  cyan: "#38BDF8",
  amber: "#3EA6FF",
  violet: "#A855F7",
};

// v78.0 MENÚ DE CINE — portada de cada sección del mega-menú.
// Todas salen del banco de 91 ilustraciones propias (public/ilustraciones).
const SECTION_COVER: Record<string, string> = {
  hangar: "/ilustraciones/hangar.jpg",
  inicio: "/ilustraciones/verdades.jpg",
  juego: "/ilustraciones/mundo.jpg",
  mercado: "/ilustraciones/bolsa.jpg",
  archivo: "/ilustraciones/enciclopedia.jpg",
  comando: "/ilustraciones/briefing.jpg",
  inteligencia: "/ilustraciones/osint.jpg",
  emisora: "/ilustraciones/envivo.jpg",
  oscsuro: "/ilustraciones/abusos.jpg",
  creadores: "/ilustraciones/creador.jpg",
  social: "/ilustraciones/crisis.jpg",
  sistema: "/ilustraciones/agente.jpg",
};

function Portada({ src, hex, alt }: { src: string; hex: string; alt: string }) {
  return (
    <div className="portada-media relative h-24 w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        aria-label={alt}
        className="ken-burns absolute inset-0 w-full h-full object-cover"
      />
      {/* velo del color fuerte de la sección + fundido al cuerpo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(180deg, ${hex}3D 0%, ${hex}16 36%, rgba(6,6,10,0.76) 72%, rgba(6,6,10,0.97) 100%)` }}
        aria-hidden
      />
      <div className="portada-destello" aria-hidden />
    </div>
  );
}

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
  // v48.0 EXPLORADOR: progreso de descubrimiento en el corazón del menú
  const visited = useGameStore((s) => s.visitedTabs);
  const visitedSet = new Set(visited);
  const explorePct = Math.min(100, Math.round((visited.length / TOTAL_TABS) * 100));
  const sinDescubrir = TOTAL_TABS - visited.length;
  const surprise = () => {
    const unvisited = ALL_TABS.filter((k) => !visitedSet.has(k));
    const pool = unvisited.length > 0 ? unvisited : ALL_TABS;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    sfx.tab();
    onChange(pick);
    onClose();
  };
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

            {/* v48.0 EXPLORADOR DE MUNDOS — progreso + descubrimiento en un toque */}
            <div className="hud-panel p-4 mb-5" style={{ borderColor: "#3EA6FF55" }}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber">
                    Explorador de mundos
                  </div>
                  <div className="font-display text-lg sm:text-xl font-black tracking-wider text-soft">
                    {visited.length} / {TOTAL_TABS} secciones descubiertas
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">
                    {sinDescubrir > 0
                      ? `Te quedan ${sinDescubrir} por descubrir — recompensas al llegar a 10, 25, 50 y ${TOTAL_TABS}`
                      : "MAPA COMPLETO conquistado — eres leyenda"}
                  </p>
                </div>
                <button
                  onClick={surprise}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-sm border border-green-hud text-green-hud bg-green-hud/15 hover:bg-green-hud/40 transition-colors font-mono text-[11px] font-bold uppercase tracking-widest"
                >
                  <Dices className="w-4 h-4" />
                  Sorpréndeme
                </button>
              </div>
              <div className="mt-3 h-2 bg-secondary/40 overflow-hidden rounded-sm">
                <div
                  className="h-full bg-gradient-to-r from-amber-hud via-electric-hud to-green-hud transition-[width] duration-500"
                  style={{ width: `${Math.max(2, explorePct)}%` }}
                />
              </div>
            </div>

            {/* tarjetas de secciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-8">
              {/* atajo directo a INICIO — con portada viva también */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 }}
                onClick={() => {
                  sfx.tab();
                  onChange("inicio");
                  onClose();
                }}
                className="group hud-corner card-shine text-left border rounded-sm overflow-hidden border-amber-hud bg-amber-hud/10 hover:bg-amber-hud/25 transition-colors relative"
              >
                <Portada src="/ilustraciones/noticias.jpg" hex={HEX.amber} alt="Portada de Vanguard" />
                <div className="relative z-10 px-4 pb-4 -mt-7">
                  <div
                    className="w-9 h-9 rounded-sm flex items-center justify-center border mb-2 backdrop-blur-sm text-amber"
                    style={{ borderColor: "#3EA6FF88", background: "linear-gradient(150deg, #3EA6FF33, rgba(6,6,10,0.9))", boxShadow: "0 0 20px #3EA6FF44" }}
                  >
                    <Home className="w-4 h-4" />
                  </div>
                  <div className="font-display text-sm font-bold tracking-widest text-foreground" style={{ textShadow: "0 0 16px #3EA6FF55" }}>
                    PORTADA
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Vuelve al inicio con las últimas noticias y el menú de mundos.
                  </p>
                </div>
              </motion.button>

              {SECTIONS.map((s, i) => {
                const hex = HEX[s.color] ?? "#3EA6FF";
                const cover = SECTION_COVER[s.key] ?? "/ilustraciones/planeta.jpg";
                const sinVer = s.tabs.filter((tb) => !visitedSet.has(tb.key)).length;
                return (
                  <motion.div
                    key={s.key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 + i * 0.03 }}
                    className="group hud-corner card-shine relative overflow-hidden border rounded-sm"
                    style={{ borderColor: `${hex}55`, background: "rgba(7,7,11,0.92)" }}
                  >
                    {/* v78 PORTADA VIVA — ilustración en Ken Burns + velo del color */}
                    <Portada src={cover} hex={hex} alt={t(`sec.${s.key}`)} />
                    {sinVer > 0 && (
                      <span className="absolute top-2.5 right-2.5 z-10 min-w-[20px] h-[20px] px-1.5 rounded-full bg-amber text-black text-[9px] font-bold flex items-center justify-center shadow-lg" style={{ boxShadow: "0 0 14px rgba(255,176,32,0.5)" }}>
                        +{sinVer}
                      </span>
                    )}
                    <div className="relative z-10 px-4 pb-4 -mt-7">
                      <div className="flex items-end gap-2.5 mb-1.5">
                        <span
                          className="w-9 h-9 shrink-0 rounded-sm flex items-center justify-center border backdrop-blur-sm"
                          style={{ borderColor: `${hex}88`, color: hex, background: `linear-gradient(150deg, ${hex}33, rgba(6,6,10,0.9))`, boxShadow: `0 0 20px ${hex}44` }}
                        >
                          {s.icon}
                        </span>
                        <span className="font-display text-sm font-bold tracking-widest leading-tight pb-0.5" style={{ color: hex, textShadow: `0 0 16px ${hex}55` }}>
                          {t(`sec.${s.key}`)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-3 min-h-[2.2em]">{t(`sec.${s.key}.desc`)}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {s.tabs.map((tb) => (
                          <button
                            key={tb.key}
                            onClick={() => {
                              sfx.tab();
                              onChange(tb.key);
                              onClose();
                            }}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-sm border border-border/60 text-[9px] font-mono font-bold uppercase tracking-wide text-muted-foreground",
                              "hover:text-foreground hover:border-amber-hud/70 hover:bg-amber-hud/20 transition-colors"
                            )}
                          >
                            {tb.icon}
                            {TAB_SHORTS[lang]?.[tb.key] ?? tb.short}
                          </button>
                        ))}
                      </div>
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
