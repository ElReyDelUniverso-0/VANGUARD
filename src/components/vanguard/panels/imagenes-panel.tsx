"use client";

// v98.0 ORO TOTAL — IMÁGENES DE VANGUARD
// La búsqueda visual de la plataforma: FOTOS REALES de la capa REAL del juego
// (lugares estratégicos, sedes del poder, archivo desclasificado, armas
// históricas y civilizaciones perdidas), descargadas y servidas localmente.
// Estructura del buscador de imágenes más usado del mundo (mosaico +
// buscador + lightbox), contenido 100% Vanguard: cada nota editorial es
// original y la capa SIM sigue usando las ilustraciones declaradas del juego.
// Animación en cada acción (reveal al scroll vía CineVivo, zoom de hover,
// lightbox con entrada de cine), 60fps (solo transform/opacity), móvil y
// escritorio, reduced-motion respetado por los bloques v96/v98.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Images, Search, X, MapPin, Landmark, FolderOpen, Swords, Hourglass, ExternalLink, Camera, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { navigateTo } from "@/lib/nav";
import { useGameStore } from "@/lib/game-store";
import { HeroOro } from "@/components/vanguard/hero-oro";
import {
  IMAGENES_REALES, IMAGENES_CATS, buscarImagenes, imagenesDeCat,
  type ImagenReal, type ImagenCat,
} from "@/lib/imagenes-data";

const LS_VISTAS = "vg-imagenes-v98";
const RECOMPENSA_DIA = 5; // máx. de fotos nuevas que pagan al día

function readVistas(): string[] {
  try {
    const raw = localStorage.getItem(LS_VISTAS);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

const CAT_ICON: Record<ImagenCat | "todo", React.ReactNode> = {
  todo: <Images className="w-3 h-3" />,
  lugares: <MapPin className="w-3 h-3" />,
  poder: <Landmark className="w-3 h-3" />,
  archivo: <FolderOpen className="w-3 h-3" />,
  armas: <Swords className="w-3 h-3" />,
  civilizaciones: <Hourglass className="w-3 h-3" />,
};

export function ImagenesPanel() {
  const { t, lang } = useT();
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ImagenCat | "todo">("todo");
  // ssr:false → el primer render ya corre en el navegador: los inicializadores
  // perezosos leen localStorage/sessionStorage sin efectos (patrón v98)
  const [sel, setSel] = useState<ImagenReal | null>(() => {
    try {
      const id = sessionStorage.getItem("vg-imagenes-sel");
      if (id) {
        sessionStorage.removeItem("vg-imagenes-sel");
        return IMAGENES_REALES.find((x) => x.id === id) ?? null;
      }
    } catch { /* noop */ }
    return null;
  });
  const [diaKey] = useState(() => new Date().toISOString().slice(0, 10));
  const [cobradas, setCobradas] = useState<string[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_VISTAS) || "{}") as { dia?: string; ids?: string[] };
      const hoy = new Date().toISOString().slice(0, 10);
      return raw.dia === hoy ? (raw.ids || []) : [];
    } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);


  // lista filtrada: búsqueda + categoría
  const lista = useMemo(() => {
    const base = q.trim() ? buscarImagenes(q) : imagenesDeCat(cat);
    return base;
  }, [q, cat]);

  const cobrarVista = useCallback((im: ImagenReal) => {
    try {
      const vistas = new Set(readVistas());
      const esNueva = !vistas.has(im.id);
      vistas.add(im.id);
      localStorage.setItem(LS_VISTAS, JSON.stringify({ dia: diaKey, ids: cobradas }));
      localStorage.setItem("vg-imagenes-historial", JSON.stringify([...vistas]));
      if (esNueva && !cobradas.includes(im.id) && cobradas.length < RECOMPENSA_DIA) {
        const nuevas = [...cobradas, im.id];
        setCobradas(nuevas);
        localStorage.setItem(LS_VISTAS, JSON.stringify({ dia: diaKey, ids: nuevas }));
        addCoins(4, "ojo fotografico");
        addXp(3);
      }
    } catch { /* noop */ }
  }, [cobradas, diaKey, addCoins, addXp]);

  // v98.0 BÚSQUEDA UNIVERSAL: si la barra Google pide una foto mientras la sala
  // ya está montada, escucha el evento y abre su lightbox
  useEffect(() => {
    const abrir = (e: Event) => {
      const id = (e as CustomEvent).detail as string;
      const im = IMAGENES_REALES.find((x) => x.id === id);
      if (im) { setSel(im); cobrarVista(im); }
    };
    window.addEventListener("vanguard:abrir-imagen", abrir);
    return () => window.removeEventListener("vanguard:abrir-imagen", abrir);
  }, [cobrarVista]);

  // teclado en el lightbox: Esc cierra, ←/→ navega
  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSel(null);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const i = lista.findIndex((x) => x.id === sel.id);
        const next = lista[(i + (e.key === "ArrowRight" ? 1 : -1) + lista.length) % lista.length];
        if (next) { setSel(next); cobrarVista(next); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, lista]); // eslint-disable-line react-hooks/exhaustive-deps

  const catLabel = (c: string) => {
    const map: Record<string, string> = {
      lugares: t("img.catLugares"), poder: t("img.catPoder"), archivo: t("img.catArchivo"),
      armas: t("img.catArmas"), civilizaciones: t("img.catCivil"),
    };
    return map[c] || c;
  };

  return (
    <div className="space-y-3">
      {/* regla de oro de la sala (patrón estándar de Vanguard) */}
      <HeroOro panel="imagenes" />

      {/* cabecera con buscador estilo Google Imágenes */}
      <div className="hud-panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-sm bg-cyan-hud/20 border border-cyan-hud/40 flex items-center justify-center shrink-0">
            <Images className="w-4.5 h-4.5 text-cyan-hud" />
          </div>
          <div className="min-w-0">
            <h2 className="font-mono font-bold text-sm sm:text-base text-foreground uppercase tracking-wider leading-tight">
              {t("img.title")}
            </h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug">
              {t("img.sub")} · {IMAGENES_REALES.length} {t("img.contador")}
            </p>
          </div>
          <span className="ml-auto shrink-0 text-[9px] font-mono px-2 py-1 rounded-sm border border-green-hud/50 bg-green-hud/10 text-green-hud uppercase tracking-widest">
            {t("img.real")}
          </span>
        </div>

        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("img.ph")}
            aria-label={t("img.ph")}
            className="w-full pl-9 pr-9 py-2.5 rounded-sm bg-background/80 border border-border/70 text-sm focus:outline-none focus:border-cyan-hud/70 focus:shadow-[0_0_18px_-4px_rgba(80,220,230,0.4)] transition-colors"
          />
          {q && (
            <button
              onClick={() => { setQ(""); inputRef.current?.focus(); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={t("img.limpiar")}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* filtros por colección */}
        <div className="flex gap-1.5 overflow-x-auto thin-scroll pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {IMAGENES_CATS.map((c) => (
            <button
              key={c.key}
              onClick={() => { setCat(c.key); setQ(""); }}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border font-mono text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors shrink-0",
                cat === c.key && !q
                  ? "border-cyan-hud/70 bg-cyan-hud/20 text-cyan-hud"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-cyan-hud/40"
              )}
            >
              {CAT_ICON[c.key]}
              {c.key === "todo" ? t("img.catTodo") : catLabel(c.key)}
            </button>
          ))}
          <span className="ml-auto self-center text-[9px] font-mono text-muted-foreground/60 whitespace-nowrap px-1">
            {lista.length} {t("img.resultados")}
          </span>
        </div>
      </div>

      {/* regla de la casa: doble capa honesta */}
      <div className="hud-panel px-3 py-2 text-[10px] font-mono text-muted-foreground leading-snug flex items-start gap-2">
        <Camera className="w-3.5 h-3.5 text-cyan-hud shrink-0 mt-0.5" />
        <span>{t("img.reglacasa")}</span>
      </div>

      {/* mosaico masonry estilo buscador de imágenes */}
      {lista.length === 0 ? (
        <div className="hud-panel p-8 text-center text-sm text-muted-foreground font-mono">
          {t("img.sinresult")}
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:balance]">
          {lista.map((im) => (
            <button
              key={im.id}
              onClick={() => { setSel(im); cobrarVista(im); }}
              className="group relative w-full mb-3 break-inside-avoid overflow-hidden rounded-sm border border-border/60 hover:border-cyan-hud/70 transition-colors text-left block"
              aria-label={im.label}
            >
              <img
                src={im.src}
                alt={im.label}
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              />
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-sm bg-black/70 border border-green-hud/50 text-[8px] font-mono font-bold text-green-hud uppercase tracking-widest">
                {t("img.real")}
              </span>
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 pt-6 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="block text-[11px] font-mono font-bold text-white truncate">{im.label}</span>
                <span className="block text-[9px] font-mono text-white/70 uppercase tracking-widest">
                  {catLabel(im.cat)} · {im.fuente}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* lightbox con ficha completa */}
      {
        createPortal(
          <AnimatePresence>
            {sel && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[95] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
                onClick={() => setSel(null)}
                role="dialog"
                aria-modal="true"
                aria-label={sel.label}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-4xl w-full max-h-[92vh] overflow-y-auto thin-scroll hud-panel"
                >
                  <div className="relative">
                    <img src={sel.src} alt={sel.label} className="w-full max-h-[52vh] object-cover" />
                    <button
                      onClick={() => setSel(null)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-sm bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                      aria-label={t("img.cerrar")}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="absolute top-2 left-2 px-2 py-1 rounded-sm bg-black/70 border border-green-hud/50 text-[9px] font-mono font-bold text-green-hud uppercase tracking-widest">
                      {t("img.real")} · {catLabel(sel.cat)}
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-mono font-bold text-base text-foreground uppercase tracking-wide">{sel.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{sel.nota}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                      <Globe2 className="w-3.5 h-3.5 text-cyan-hud" />
                      <span>{t("img.fuente")}: {sel.fuente}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => { setSel(null); navigateTo("tierra"); }}
                        className="btn-cine flex items-center gap-1.5 px-3 py-2 rounded-sm border border-amber-hud bg-amber-hud/20 text-amber font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hud/40 transition-colors"
                      >
                        <Globe2 className="w-3.5 h-3.5" />
                        {t("img.verTierra")}
                      </button>
                      <button
                        onClick={() => { setSel(null); navigateTo("googles"); }}
                        className="btn-cine flex items-center gap-1.5 px-3 py-2 rounded-sm border border-border/70 bg-secondary/40 text-foreground font-mono text-[10px] font-bold uppercase tracking-widest hover:border-cyan-hud/60 hover:text-cyan-hud transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {t("img.explorar")}
                      </button>
                    </div>
                    {/* navegación ←/→ */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          const i = lista.findIndex((x) => x.id === sel.id);
                          const prev = lista[(i - 1 + lista.length) % lista.length];
                          if (prev) { setSel(prev); cobrarVista(prev); }
                        }}
                        className="text-[10px] font-mono text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                      >
                        ← {t("img.anterior")}
                      </button>
                      <span className="text-[9px] font-mono text-muted-foreground/60">
                        {lista.findIndex((x) => x.id === sel.id) + 1} / {lista.length}
                      </span>
                      <button
                        onClick={() => {
                          const i = lista.findIndex((x) => x.id === sel.id);
                          const next = lista[(i + 1) % lista.length];
                          if (next) { setSel(next); cobrarVista(next); }
                        }}
                        className="text-[10px] font-mono text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                      >
                        {t("img.siguiente")} →
                      </button>
                    </div>
                    {/* progreso de recompensa del día */}
                    <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest text-center pt-1">
                      {t("img.recompensa")} · {Math.min(cobradas.length, RECOMPENSA_DIA)}/{RECOMPENSA_DIA}
                    </p>
                    <p className="text-[9px] font-mono text-muted-foreground/40 text-center">
                      {lang === "es" ? "Esc: cerrar · ←/→: navegar" : "Esc: close · ←/→: navigate"}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
