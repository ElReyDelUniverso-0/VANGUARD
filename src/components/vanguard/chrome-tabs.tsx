"use client";

// v106.0 PESTAÑAS DE CROMO — la franja de pestañas de Vanguard.
// Mandato del comandante: "quiero en vez de secciones pestañas como Chrome
// eligiendo y se vea todo completo". Vanguard ahora navega como el navegador
// más usado del mundo: cada vista abre una PESTAÑA arriba, se cambia con un
// toque (o Alt+1..9), se cierra con la × y el botón + abre la NUEVA PESTAÑA
// para elegir destino. El índice completo vive en la NUEVA PESTAÑA, en el
// buscador (Ctrl+K) y en el mega-menú (M) — cero secciones anidadas.
// Rendimiento: la píldora activa viaja con layoutId (transform puro), las
// flechas y el auto-scroll se portan de la barra clásica — 60 FPS garantizado.

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { X, Plus, Search, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TABS,
  sectionOfTab,
  accentOfSection,
  TOTAL_TABS,
  type TabKey,
} from "@/components/vanguard/tab-nav";
import { tabLabel, TAB_SHORTS, useT } from "@/lib/i18n";
import { useGameStore } from "@/lib/game-store";

// Límite honesto de pestañas abiertas: como pestañas del navegador, pero sin
// apilar 20 módulos pesados en el DOM — al llegar a 9 avisamos y pedimos cerrar.
export const MAX_PESTANAS = 9;

export function ChromeTabs({
  pestanas,
  activa,
  onElegir,
  onCerrar,
  onNueva,
  onOpenMenu,
  onOpenSearch,
}: {
  pestanas: TabKey[];
  activa: TabKey;
  onElegir: (k: TabKey) => void;
  onCerrar: (k: TabKey) => void;
  onNueva: () => void;
  onOpenMenu?: () => void;
  onOpenSearch?: () => void;
}) {
  const { t, lang } = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  // v48.0 BRÚJULA: el progreso del Explorador sobrevive en la franja — la línea
  // fina de abajo es el mapa que se va conquistando (herencia de la barra clásica)
  const visited = useGameStore((s) => s.visitedTabs);
  const explorePct = Math.min(100, Math.round((visited.length / TOTAL_TABS) * 100));

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    const onScroll = () => updateArrows();
    el?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateArrows);
    };
  }, [pestanas.length, activa, updateArrows]);

  // auto-scroll: la pestaña activa siempre a la vista (patrón de la barra clásica)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const btn = el.querySelector(`[data-pestana="${activa}"]`) as HTMLElement | null;
    if (btn) {
      const left = btn.offsetLeft - el.clientWidth / 2 + btn.clientWidth / 2;
      el.scrollTo({ left, behavior: "smooth" });
    }
  }, [activa, pestanas.length]);

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <nav
      className="sticky top-[126px] sm:top-[160px] z-20"
      aria-label={t("cromo.franga")}
    >
      <div className="relative bg-[#07070b]/88 backdrop-blur-md border-b border-amber-hud/25 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.9)]">
        {/* degradados + flechas: nada queda opacado en móvil (herencia v48) */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#07070b] to-transparent z-10 pointer-events-none transition-opacity",
            canLeft ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#07070b] to-transparent z-10 pointer-events-none transition-opacity",
            canRight ? "opacity-100" : "opacity-0"
          )}
        />
        {canLeft && (
          <button
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-0 bottom-0 z-20 px-0.5 flex items-center bg-[#07070b]/80 hover:bg-amber-hud/30"
            aria-label={t("cromo.anterior")}
          >
            <ChevronLeft className="w-3.5 h-3.5 text-amber" />
          </button>
        )}
        {canRight && (
          <button
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-0 bottom-0 z-20 px-0.5 flex items-center bg-[#07070b]/80 hover:bg-amber-hud/30"
            aria-label={t("cromo.siguiente")}
          >
            <ChevronRight className="w-3.5 h-3.5 text-amber" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="overflow-x-auto thin-scroll"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex items-end gap-0.5 px-2 sm:px-3 pt-1.5 min-w-max">
            <AnimatePresence initial={false}>
              {pestanas.map((k) => {
                const def = TABS[k];
                if (!def) return null;
                const esActiva = k === activa;
                const acc = accentOfSection(sectionOfTab(k).key);
                return (
                  <motion.div
                    key={k}
                    data-pestana={k}
                    initial={{ opacity: 0, scale: 0.88, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88, y: 6 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="relative shrink-0"
                  >
                    {/* píldora activa que VIAJA entre pestañas (transform puro) */}
                    {esActiva && (
                      <motion.div
                        layoutId="v106-tab-activa"
                        className="absolute inset-x-0 -top-0.5 -bottom-px rounded-t-[10px]"
                        style={{
                          backgroundColor: "rgba(10,10,15,0.98)",
                          boxShadow: `inset 0 1px 0 ${acc}44, 0 -6px 18px -10px ${acc}66`,
                          border: `1px solid ${acc}40`,
                          borderBottom: "none",
                        }}
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <button
                      onClick={() => onElegir(k)}
                      title={tabLabel(lang, k, def.label)}
                      aria-current={esActiva ? "page" : undefined}
                      className={cn(
                        "group relative z-10 flex items-center gap-1.5 h-8 pl-2.5 rounded-t-[10px] font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors max-w-[168px] sm:max-w-[190px]",
                        esActiva ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.045]"
                      )}
                      style={esActiva ? { color: acc } : undefined}
                    >
                      {/* favicon del mundo: punto del color de la sección */}
                      <span
                        className={cn("w-2 h-2 rounded-full shrink-0", esActiva && "vg-acc-dot")}
                        style={{ backgroundColor: acc, boxShadow: esActiva ? `0 0 8px ${acc}` : `${acc}55` }}
                      />
                      <span className="truncate">
                        <span className="sm:hidden">{TAB_SHORTS[lang]?.[k] ?? def.short}</span>
                        <span className="hidden sm:inline truncate">
                          {tabLabel(lang, k, def.label).split(" (")[0]}
                        </span>
                      </span>
                      {/* la × cierra la pestaña — como el navegador, nunca oculta */}
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`${t("cromo.cerrar")}: ${tabLabel(lang, k, def.label).split(" (")[0]}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCerrar(k);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            onCerrar(k);
                          }
                        }}
                        className={cn(
                          "ml-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors",
                          esActiva
                            ? "hover:bg-white/15 text-muted-foreground hover:text-foreground"
                            : "opacity-0 group-hover:opacity-100 hover:bg-white/10 focus:opacity-100"
                        )}
                      >
                        <X className="w-2.5 h-2.5" />
                      </span>
                      {/* subrayado del acento bajo la pestaña activa */}
                      {esActiva && (
                        <span
                          className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full"
                          style={{ backgroundColor: acc, boxShadow: `0 0 10px ${acc}` }}
                          aria-hidden
                        />
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* el + abre la NUEVA PESTAÑA — elegir destino como el navegador */}
            <motion.button
              layout
              onClick={onNueva}
              title={t("cromo.nueva")}
              aria-label={t("cromo.nueva")}
              className="shrink-0 mb-0.5 ml-1 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-amber hover:bg-amber-hud/20 border border-transparent hover:border-amber-hud/40 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </motion.button>

            {/* buscar + menú: los dos acompañantes fijos de la franja */}
            <div className="shrink-0 ml-auto flex items-center gap-1 mb-0.5 pl-3 pr-1">
              {onOpenSearch && (
                <button
                  onClick={onOpenSearch}
                  title={t("nav.searchTitle")}
                  aria-label={t("nav.searchTitle")}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-amber-hud/50 text-amber bg-amber-hud/10 hover:bg-amber-hud/30 transition-colors"
                >
                  <Search className="w-3 h-3" />
                  <span className="hidden sm:inline">{t("nav.search")}</span>
                </button>
              )}
              {onOpenMenu && (
                <button
                  onClick={onOpenMenu}
                  title={t("nav.openFull")}
                  aria-label={t("nav.openFull")}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-electric-hud text-electric bg-electric-hud/30 hover:bg-electric-hud/60 transition-colors"
                >
                  <LayoutGrid className="w-3 h-3" />
                  <span className="hidden sm:inline">{t("nav.menu")}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* línea del Explorador: el mapa se conquista pestaña a pestaña */}
      <div
        className="h-[3px] bg-secondary/40 relative overflow-hidden"
        role="progressbar"
        aria-label={t("cromo.explorador")}
        aria-valuemin={0}
        aria-valuemax={TOTAL_TABS}
        aria-valuenow={visited.length}
        title={`${t("cromo.exploradorTitle1")} ${visited.length}/${TOTAL_TABS} (${explorePct}%)`}
      >
        <div
          className="h-full transition-[width] duration-500"
          style={{
            width: `${Math.max(2, explorePct)}%`,
            background: `linear-gradient(90deg, #FFC94D, ${accentOfSection(sectionOfTab(activa).key)}, #4ADE80)`,
          }}
        />
      </div>
    </nav>
  );
}
