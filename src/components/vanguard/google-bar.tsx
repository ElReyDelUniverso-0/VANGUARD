"use client";

// VANGUARD v96.0 · GOOGLE VIVO — BARRA ESTRUCTURA GOOGLE
// La estructura de las webs más usadas del mundo, con identidad atardecer:
//   [ LETRAS VIVAS ]  [ barra de búsqueda central con autocompletado ]  [ INVESTIGAR ] [ rejilla de apps ]
// Buscar = investigar: Enter lleva a GOOGLES DE VANGUARD con la consulta cargada.
// La rejilla abre el LANZADOR (launcher) con los 14 mundos + el MENÚ DE CINE.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Dices, Fingerprint, X, Clapperboard, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTIONS, type TabKey } from "@/components/vanguard/tab-nav";
import { sugerenciasGoogles } from "@/lib/googles";
import { sfx } from "@/lib/sound";
import { useT } from "@/lib/i18n";

// paleta atardecer de Vanguard para las letras vivas
const LETRA_HEX = ["#FFE3A0", "#FFD07A", "#FFC94D", "#FFB347", "#FF9A3C", "#FF8A2A", "#FFC94D", "#FFE3A0"];

// ── LETRAS VIVAS: las 8 letras de VANGUARD entran en cascada, flotan,
// laten y saltan al pasar el ratón (pura animación CSS, 60fps) ──
export function LetrasVivas({ compact = false, onClick }: { compact?: boolean; onClick?: () => void }) {
  const letras = "VANGUARD".split("");
  return (
    <button
      onClick={onClick}
      className="gbar-logo flex items-end select-none shrink-0"
      aria-label="VANGUARD — ir al inicio"
      title="VANGUARD · The World Intelligence Platform"
    >
      {letras.map((l, i) => (
        <span
          key={i}
          className={cn("lv-letra font-display font-black", compact ? "text-[15px] sm:text-lg" : "text-lg sm:text-2xl")}
          style={
            {
              "--i": i,
              color: LETRA_HEX[i % LETRA_HEX.length],
              textShadow: `0 0 ${10 + (i % 3) * 4}px ${LETRA_HEX[i % LETRA_HEX.length]}66`,
            } as React.CSSProperties
          }
        >
          {l}
        </span>
      ))}
    </button>
  );
}

// mapa cálido del atardecer para el lanzador (identidad Vanguard, no azul genérico)
const APP_HEX: Record<string, string> = {
  amber: "#FFC94D",
  cyan: "#38BDF8",
  red: "#FF5A4E",
  green: "#00FF87",
  violet: "#B48CFF",
};

export function GoogleBar({
  active,
  onChange,
  onOpenMenu,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
  onOpenMenu: () => void;
}) {
  const { t, lang } = useT();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [idx, setIdx] = useState(-1);
  const [launcher, setLauncher] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // sugerencias en vivo del índice de conocimiento (derivadas en render, sin efectos)
  const sugs = useMemo(() => {
    const v = q.trim();
    if (!focus || v.length < 2) return [];
    return sugerenciasGoogles(v, 7).filter((s) => s.toLowerCase() !== v.toLowerCase());
  }, [q, focus]);
  const idxOk = idx >= 0 && idx < sugs.length ? idx : -1;

  // cerrar lanzador y sugerencias con Escape / clic fuera
  useEffect(() => {
    if (!launcher) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLauncher(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setLauncher(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [launcher]);

  const buscar = useCallback(
    (texto: string) => {
      const v = texto.trim();
      if (!v) return;
      try {
        sessionStorage.setItem("vg-gbar-q", v);
      } catch {
        /* almacenamiento no disponible — el evento igual llega */
      }
      window.dispatchEvent(new CustomEvent("vanguard:buscar", { detail: { q: v } }));
      sfx.tab();
      setFocus(false);
      setLauncher(false);
      onChange("googles");
    },
    [onChange]
  );

  const suerte = () => {
    // dado del atardecer: una búsqueda al azar del mundo — siempre hay hallazgo
    const pool = ["Valle del Karsk", "Emirato de Sarn", "Ojo de Dios", "Estrecho de Vand", "MK-ULTRA", "República de Zenit", "Grafo Mundial", "VANGUARD EARTH", "Alejandría Oscura", "Operación PAPERCLIP"];
    buscar(pool[Math.floor(Math.random() * pool.length)]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setFocus(false);
      inputRef.current?.blur();
      return;
    }
    if (!sugs.length) {
      if (e.key === "Enter") buscar(q);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => (i + 1) % sugs.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => (i <= 0 ? sugs.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      buscar(idxOk >= 0 ? sugs[idxOk] : q);
    }
  };

  return (
    <div className="sticky top-[78px] sm:top-[109px] z-[25] hud-panel border-b border-amber-hud/70" ref={boxRef}>
      <div className="h-[46px] sm:h-[49px] px-2 sm:px-4 max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-3">
        {/* logo de letras vivas */}
        <LetrasVivas compact onClick={() => { sfx.tab(); onChange("inicio"); }} />

        {/* barra de búsqueda central — la estructura Google */}
        <div className="relative flex-1 min-w-0 max-w-xl mx-auto">
          <div
            className={cn(
              "gbar-search flex items-center gap-1.5 h-9 rounded-full border px-3 transition-colors",
              focus ? "gbar-search-on" : ""
            )}
          >
            <Search className={cn("w-4 h-4 shrink-0 transition-colors", focus ? "text-amber" : "text-muted-foreground")} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setTimeout(() => setFocus(false), 140)}
              onKeyDown={onKeyDown}
              placeholder={t("gbar.ph")}
              aria-label={t("gbar.ph")}
              className="flex-1 min-w-0 bg-transparent outline-none text-[12px] sm:text-sm text-foreground placeholder:text-muted-foreground/70 font-mono"
            />
            {q && (
              <button onClick={() => { setQ(""); inputRef.current?.focus(); }} aria-label="Limpiar" className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={suerte}
              title={t("gbar.suerte")}
              aria-label={t("gbar.suerte")}
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center border border-amber-hud/60 text-amber hover:bg-amber-hud/25 transition-colors"
            >
              <Dices className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* autocompletado — la lista viva del índice */}
          <AnimatePresence>
            {focus && sugs.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -6, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.99 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute left-0 right-0 top-[42px] z-50 rounded-2xl border border-amber-hud/40 bg-[#0B0E14]/97 backdrop-blur-md overflow-hidden shadow-[0_18px_50px_-12px_rgba(0,0,0,0.9)]"
                role="listbox"
              >
                {sugs.map((s, i) => (
                  <li key={s}>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); buscar(s); }}
                      onMouseEnter={() => setIdx(i)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[12px] sm:text-sm font-mono transition-colors",
                        i === idxOk ? "bg-amber-hud/20 text-amber" : "text-muted-foreground hover:text-foreground"
                      )}
                      role="option"
                      aria-selected={i === idxOk}
                    >
                      <Search className="w-3.5 h-3.5 shrink-0 opacity-60" />
                      <span className="truncate">{s}</span>
                      {i === idxOk && <CornerDownLeft className="w-3 h-3 ml-auto shrink-0 opacity-70" />}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* INVESTIGAR — el modo investigación ahora tiene su asiento en la barra */}
        <button
          onClick={() => { sfx.tab(); onChange("expedientes"); }}
          title={t("gbar.inv")}
          aria-label={t("gbar.inv")}
          className={cn(
            "btn-cine shrink-0 flex items-center gap-1.5 h-9 px-2.5 sm:px-3.5 rounded-full border font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-colors",
            active === "expedientes"
              ? "border-amber text-amber bg-amber-hud/40"
              : "border-amber-hud/70 text-amber hover:bg-amber-hud/25"
          )}
        >
          <Fingerprint className="w-4 h-4" />
          <span className="hidden md:inline">{t("gbar.inv")}</span>
        </button>

        {/* rejilla de apps — 9 puntos como las webs más usadas del mundo */}
        <button
          onClick={() => { sfx.click(); setLauncher((v) => !v); }}
          title={t("gbar.apps")}
          aria-label={t("gbar.apps")}
          aria-expanded={launcher}
          className={cn(
            "shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-colors",
            launcher ? "border-amber text-amber bg-amber-hud/30" : "border-border/70 text-muted-foreground hover:text-foreground hover:border-amber-hud/60"
          )}
        >
          <span className="grid grid-cols-3 gap-[2.5px]" aria-hidden>
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className={cn("w-[3.5px] h-[3.5px] rounded-full", launcher ? "bg-amber" : "bg-current")} />
            ))}
          </span>
        </button>
      </div>

      {/* LANZADOR DE MUNDOS — panel de aplicaciones con los 14 sectores + MENÚ DE CINE */}
      <AnimatePresence>
        {launcher && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-2 sm:right-4 top-full mt-2 w-[320px] sm:w-[420px] rounded-2xl border border-amber-hud/40 bg-[#0B0E14]/97 backdrop-blur-md shadow-[0_24px_70px_-16px_rgba(0,0,0,0.95)] overflow-hidden z-50"
            role="dialog"
            aria-label={t("gbar.apps")}
          >
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-amber">{t("gbar.apps")}</span>
              <button onClick={() => setLauncher(false)} aria-label="Cerrar" className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-3 pt-1 max-h-[62vh] overflow-y-auto thin-scroll">
              {/* INVESTIGAR como primera aplicación del lanzador */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 }}
                onClick={() => { sfx.tab(); setLauncher(false); onChange("expedientes"); }}
                className="app-tile flex flex-col items-center gap-1.5 rounded-xl border border-amber-hud/60 bg-amber-hud/15 hover:bg-amber-hud/30 transition-colors py-3.5 px-1"
              >
                <span className="w-9 h-9 rounded-lg flex items-center justify-center text-amber" style={{ background: "linear-gradient(150deg, #FFC94D33, rgba(6,6,10,0.9))", boxShadow: "0 0 18px #FFC94D44" }}>
                  <Fingerprint className="w-4.5 h-4.5" />
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber text-center leading-tight">{t("gbar.inv")}</span>
              </motion.button>

              {SECTIONS.map((s, i) => {
                const hex = APP_HEX[s.color] ?? "#FFC94D";
                return (
                  <motion.button
                    key={s.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 + i * 0.025 }}
                    onClick={() => { sfx.tab(); setLauncher(false); onChange(s.tabs[0].key); }}
                    title={s.desc}
                    className="app-tile flex flex-col items-center gap-1.5 rounded-xl border border-border/50 hover:border-amber-hud/50 transition-colors py-3.5 px-1"
                    style={{ background: "rgba(10,12,18,0.6)" }}
                  >
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ color: hex, background: `linear-gradient(150deg, ${hex}2E, rgba(6,6,10,0.9))`, boxShadow: `0 0 16px ${hex}33` }}
                    >
                      {s.icon}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground text-center leading-tight" style={{ color: `${hex}CC` }}>
                      {t(`sec.${s.key}`)}
                    </span>
                  </motion.button>
                );
              })}

              {/* MENÚ DE CINE — el mega-menú cinematográfico de v78 sigue vivo */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 + SECTIONS.length * 0.025 }}
                onClick={() => { sfx.tab(); setLauncher(false); onOpenMenu(); }}
                className="app-tile flex flex-col items-center gap-1.5 rounded-xl border border-electric-hud/50 bg-electric-hud/10 hover:bg-electric-hud/25 transition-colors py-3.5 px-1"
              >
                <span className="w-9 h-9 rounded-lg flex items-center justify-center text-electric" style={{ background: "linear-gradient(150deg, #38BDF82E, rgba(6,6,10,0.9))", boxShadow: "0 0 16px #38BDF833" }}>
                  <Clapperboard className="w-4.5 h-4.5" />
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-electric text-center leading-tight">{t("gbar.cine")}</span>
              </motion.button>
            </div>
            <div className="px-4 py-2 border-t border-border/40 text-[8px] font-mono uppercase tracking-[0.25em] text-muted-foreground/60 text-center">
              VANGUARD · {lang.toUpperCase()} · ESC para cerrar
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
