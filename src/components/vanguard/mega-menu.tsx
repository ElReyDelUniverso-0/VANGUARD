"use client";

// v108.0 LA CIUDAD VIVA — el MENÚ VANGUARD deja de ser una parrilla aburrida:
//  ① PORTADAS REALES EN CSS: cada sección lleva su escena dibujada (el lugar en
//     sí: hangar, redacción, cúpula del observatorio, mesa de guerra...) —
//     cero fotos IA (mandato: "que no sean IA sino mejor, que se vea el lugar").
//  ② LA CIUDAD VIVA: horizonte de ciudad nocturna con luna llena y ventanas
//     encendidas sobre el menú — Vanguard es una ciudad de mundos.
//  ③ PORTADA PARA CADA SUBSECCIÓN: botón "VER LAS SALAS" expande la vitrina
//     con una mini-portada por pestaña — ves qué hay en cada una ANTES de entrar.
// Hereda: Explorador de mundos (v48), Sorpréndeme, badges de no visitadas.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Home, Dices, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTIONS, TOTAL_TABS, accentOfSection, type TabKey } from "@/components/vanguard/tab-nav";
import { PortadaMundo, VitrinaSala } from "@/components/vanguard/portadas";
import { sfx } from "@/lib/sound";
import { useT, TAB_SHORTS } from "@/lib/i18n";
import { useGameStore } from "@/lib/game-store";

export function MegaMenu({
  open,
  onChange,
  onClose,
  onOpenSearch,
}: {
  open: boolean;
  onChange: (k: TabKey) => void;
  onClose: () => void;
  onOpenSearch?: () => void;
}) {
  const { t, lang } = useT();
  // v48.0 EXPLORADOR: progreso de descubrimiento en el corazón del menú
  const visited = useGameStore((s) => s.visitedTabs);
  const visitedSet = new Set(visited);
  const explorePct = Math.min(100, Math.round((visited.length / TOTAL_TABS) * 100));
  const sinDescubrir = TOTAL_TABS - visited.length;
  // v108: qué sección tiene su vitrina de salas desplegada (una a la vez).
  // Derivado, sin efecto: con el menú cerrado ninguna vitrina queda abierta.
  const [vitrinaElegida, setVitrinaAbierta] = useState<string | null>(null);
  const vitrinaAbierta = open ? vitrinaElegida : null;

  const surprise = () => {
    const unvisited = SECTIONS.flatMap((s) => s.tabs.map((tb) => tb.key)).filter(
      (k) => !visitedSet.has(k)
    );
    const pool = unvisited.length > 0 ? unvisited : SECTIONS.flatMap((s) => s.tabs.map((tb) => tb.key));
    const pick = pool[Math.floor(Math.random() * pool.length)] as TabKey;
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
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-hud">
                  Navegación global
                </div>
                <h2 className="glitch font-display text-2xl sm:text-3xl font-black tracking-wider text-soft" data-text="MENÚ VANGUARD">
                  MENÚ VANGUARD
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {onOpenSearch && (
                  <button
                    onClick={() => {
                      sfx.tab();
                      onClose();
                      onOpenSearch();
                    }}
                    className="h-11 px-3 flex items-center gap-1.5 border border-amber-hud/60 rounded-sm text-amber bg-amber-hud/10 hover:bg-amber-hud/30 transition-colors font-mono text-[10px] font-bold uppercase tracking-widest"
                    aria-label={t("nav.searchTitle")}
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("nav.search")}</span>
                  </button>
                )}
                <button
                  autoFocus
                  onClick={onClose}
                  className="w-11 h-11 flex items-center justify-center border border-border rounded-sm text-muted-foreground hover:text-foreground hover:border-amber-hud transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* v108 LA CIUDAD VIVA — horizonte nocturno con luna llena: la ciudad
                de mundos donde vive Vanguard (CSS puro, cero imágenes) */}
            <div className="relative h-28 sm:h-36 rounded-md overflow-hidden border border-amber-hud/30 mb-4" data-portada="ciudad-viva">
              <PortadaMundo mundo="inicio" className="absolute inset-0" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-amber/90">
                  {t("sec.inicio")} · {SECTIONS.length} mundos · {TOTAL_TABS} salas
                </div>
                <div
                  className="font-display text-xl sm:text-3xl font-black tracking-[0.08em] text-soft"
                  style={{ textShadow: "0 0 24px rgba(255,201,77,0.55), 0 2px 12px rgba(0,0,0,0.9)" }}
                >
                  LA CIUDAD VIVA
                </div>
                <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  {visited.length} descubiertas · {sinDescubrir} por conquistar
                </div>
              </div>
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

            {/* tarjetas de secciones — cada una con su escena real */}
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
                className="group hud-corner card-shine text-left border rounded-sm overflow-hidden border-amber-hud bg-amber-hud/10 hover:bg-amber-hud/25 transition-colors relative"
              >
                <PortadaMundo mundo="inicio" className="portada-media h-24 w-full" />
                <div className="relative z-10 px-4 pb-4 -mt-7">
                  <div
                    className="w-9 h-9 rounded-sm flex items-center justify-center border mb-2 backdrop-blur-sm text-amber"
                    style={{ borderColor: "#FFC94D88", background: "linear-gradient(150deg, #FFC94D33, rgba(6,6,10,0.9))", boxShadow: "0 0 20px #FFC94D44" }}
                  >
                    <Home className="w-4 h-4" />
                  </div>
                  <div className="font-display text-sm font-bold tracking-widest text-foreground" style={{ textShadow: "0 0 16px #FFC94D55" }}>
                    {t("sec.inicio")}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {t("sec.inicio.desc")}
                  </p>
                </div>
              </motion.button>

              {SECTIONS.map((s, i) => {
                const abierta = vitrinaAbierta === s.key;
                const sinVer = s.tabs.filter((tb) => !visitedSet.has(tb.key)).length;
                return (
                  <motion.div
                    key={s.key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 + i * 0.03 }}
                    className="group hud-corner card-shine relative overflow-hidden border rounded-sm"
                    style={{ borderColor: `${accentOfSection(s.key)}55`, background: "rgba(7,7,11,0.92)" }}
                  >
                    {/* v108 PORTADA REAL — la escena del lugar, dibujada en CSS */}
                    <PortadaMundo mundo={s.key} className="portada-media h-24 w-full" />
                    {sinVer > 0 && (
                      <span className="absolute top-2.5 right-2.5 z-10 min-w-[20px] h-[20px] px-1.5 rounded-full bg-amber text-black text-[9px] font-bold flex items-center justify-center shadow-lg" style={{ boxShadow: "0 0 14px rgba(255,176,32,0.5)" }}>
                        +{sinVer}
                      </span>
                    )}
                    <div className="relative z-10 px-4 pb-4 -mt-7">
                      <div className="flex items-end gap-2.5 mb-1.5">
                        <span
                          className="w-9 h-9 shrink-0 rounded-sm flex items-center justify-center border backdrop-blur-sm"
                          style={{ borderColor: `${accentOfSection(s.key)}88`, color: accentOfSection(s.key) }}
                        >
                          {s.icon}
                        </span>
                        <span className="font-display text-sm font-bold tracking-widest leading-tight pb-0.5" style={{ color: accentOfSection(s.key) }}>
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
                      {/* v108: la vitrina de salas — portada para cada subsección */}
                      <button
                        onClick={() => {
                          sfx.tab();
                          setVitrinaAbierta(abierta ? null : s.key);
                        }}
                        aria-expanded={abierta}
                        className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-sm border border-border/60 text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-amber-hud/70 hover:bg-amber-hud/15 transition-colors"
                      >
                        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", abierta && "rotate-180")} />
                        {abierta ? t("port.ocultar") : `${t("port.verSalas")} (${s.tabs.length})`}
                      </button>
                      <AnimatePresence initial={false}>
                        {abierta && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 pt-2.5">
                              {s.tabs.map((tb) => (
                                <button
                                  key={tb.key}
                                  onClick={() => {
                                    sfx.tab();
                                    onChange(tb.key);
                                    onClose();
                                  }}
                                  title={TAB_SHORTS[lang]?.[tb.key] ?? tb.short}
                                  className="text-left"
                                >
                                  <VitrinaSala tab={tb.key} modo="card" className="h-16 w-full transition-transform duration-200 hover:scale-[1.03]" />
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
