"use client";

// v106.0 PESTAÑAS DE CROMO — la página NUEVA PESTAÑA.
// El corazón del mandato "pestañas como Chrome eligiendo": al pulsar el + de la
// franja se abre esta página y aquí se ELIGE el destino — un ómnibox que busca
// entre TODAS las pestañas de Vanguard, los descubrimientos recientes, los 14
// mundos con su color propio y el índice completo. Todo interno, cero enlaces
// externos, cero fotos IA: oro sobre cielo nocturno, como la casa manda.

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Dices, Clock3, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SECTIONS,
  ALL_TABS,
  TOTAL_TABS,
  TABS,
  sectionOfTab,
  accentOfSection,
  type TabKey,
} from "@/components/vanguard/tab-nav";
import { tabLabel, TAB_SHORTS, useT } from "@/lib/i18n";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import { APP_VERSION_LABEL } from "@/lib/version";

// Atajos de cortesía para el operador recién llegado (el mundo de Vanguard en 8)
const ATAJOS_INICIALES: TabKey[] = [
  "redaccion", "googles", "mente", "tierra", "mapa", "mundo", "bolsa", "obras",
];

function irA(k: TabKey) {
  sfx.tab();
  window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: k }));
}

export function NuevaPanel() {
  const { t, lang } = useT();
  const visited = useGameStore((s) => s.visitedTabs);
  const [q, setQ] = useState("");
  const [hora, setHora] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // reloj vivo — la página de inicio del navegador nunca está muerta
  useEffect(() => {
    const tick = () => {
      setHora(new Date().toLocaleTimeString(lang === "es" ? "es-ES" : lang, { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const iv = setInterval(tick, 30_000);
    return () => clearInterval(iv);
  }, [lang]);

  // foco suave al montar: la nueva pestaña espera tu primera tecla
  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350);
    return () => clearTimeout(id);
  }, []);

  const qNorm = q.trim().toLowerCase();
  const resultados = useMemo(() => {
    if (!qNorm) return [];
    return ALL_TABS.filter((k) => {
      const def = TABS[k];
      if (!def) return false;
      const etiqueta = tabLabel(lang, k, def.label).toLowerCase();
      const corto = (TAB_SHORTS[lang]?.[k] ?? def.short).toLowerCase();
      const mundo = sectionOfTab(k).label.toLowerCase();
      return etiqueta.includes(qNorm) || corto.includes(qNorm) || mundo.includes(qNorm);
    }).slice(0, 8);
  }, [qNorm, lang]);

  // descubiertos recientes (el orden de visita de la tienda del explorador)
  const descubiertos = useMemo(() => {
    const vis = [...visited].reverse().filter((k): k is TabKey => k in TABS);
    const base = vis.length >= 4 ? vis : [...vis, ...ATAJOS_INICIALES.filter((k) => !vis.includes(k))];
    return base.slice(0, 8);
  }, [visited]);

  const saludo = useMemo(() => {
    const h = new Date().getHours();
    if (h < 6) return t("nueva.noche");
    if (h < 13) return t("nueva.dia");
    if (h < 20) return t("nueva.tarde");
    return t("nueva.noche");
  }, [t]);

  const sorpresa = () => {
    const sinVer = ALL_TABS.filter((k) => !visited.includes(k));
    const pool = sinVer.length > 0 ? sinVer : ALL_TABS;
    irA(pool[Math.floor(Math.random() * pool.length)]);
  };

  return (
    <section className="space-y-5" aria-label={t("nueva.titulo")}>
      {/* cabecera: hora + saludo + versión — la calma de la nueva pestaña */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="text-center pt-2 pb-1"
      >
        <div className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-amber">
          <Clock3 className="w-3.5 h-3.5" />
          {hora || "--:--"} · {t("nueva.sub")}
        </div>
        <h1 className="glitch font-display text-2xl sm:text-4xl font-black tracking-wider text-soft mt-2" data-text={t("nueva.titulo")}>
          {t("nueva.titulo")}
        </h1>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-1.5 max-w-xl mx-auto">
          {saludo} — {t("nueva.saludoLinea")}
        </p>
      </motion.div>

      {/* ómnibox: escribe y elige entre TODAS las pestañas de Vanguard */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.35 }}
        className="relative max-w-2xl mx-auto"
      >
        <div className="relative flex items-center v106-omnibox">
          <Search className="absolute left-4 w-4 h-4 text-amber pointer-events-none" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && resultados.length > 0) {
                irA(resultados[0]);
                setQ("");
              }
              if (e.key === "Escape") setQ("");
            }}
            placeholder={t("nueva.buscarPh")}
            aria-label={t("nueva.buscarPh")}
            className="w-full h-12 pl-11 pr-24 rounded-xl bg-[#0b0b12]/90 border border-amber-hud/35 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-amber-hud/80 focus:shadow-[0_0_24px_-6px_rgba(255,201,77,0.45)] transition-all"
          />
          <button
            onClick={sorpresa}
            className="absolute right-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-green-hud/60 text-green-hud bg-green-hud/10 hover:bg-green-hud/25 font-mono text-[9px] font-bold uppercase tracking-widest transition-colors"
            title={t("nueva.sorprendeme")}
          >
            <Dices className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("nueva.sorprendeme")}</span>
          </button>
        </div>

        {/* resultados del ómnibox */}
        {qNorm && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-xl border border-amber-hud/30 bg-[#0a0a10]/97 backdrop-blur-md overflow-hidden shadow-2xl">
            {resultados.length === 0 ? (
              <div className="px-4 py-3 text-[11px] font-mono text-muted-foreground">{t("nueva.sinResultados")}</div>
            ) : (
              resultados.map((k, i) => {
                const def = TABS[k];
                const acc = accentOfSection(sectionOfTab(k).key);
                return (
                  <button
                    key={k}
                    onClick={() => { irA(k); setQ(""); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-amber-hud/10 transition-colors",
                      i > 0 && "border-t border-border/40"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: acc, boxShadow: `0 0 8px ${acc}` }} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-bold text-foreground truncate">
                        {tabLabel(lang, k, def.label).split(" (")[0]}
                      </span>
                      <span className="block font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
                        {sectionOfTab(k).label} · {TAB_SHORTS[lang]?.[k] ?? def.short}
                      </span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        )}
      </motion.div>

      {/* descubrimientos recientes: continúa donde dejaste el mapa */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.35 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber" />
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber">{t("nueva.recientes")}</h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {descubiertos.map((k) => {
            const def = TABS[k];
            if (!def) return null;
            const acc = accentOfSection(sectionOfTab(k).key);
            return (
              <button
                key={k}
                onClick={() => irA(k)}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 bg-secondary/30 hover:bg-secondary/60 hover:border-amber-hud/50 transition-colors"
              >
                <span style={{ color: acc }} className="shrink-0">{def.icon}</span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-foreground/90 group-hover:text-foreground">
                  {tabLabel(lang, k, def.label).split(" (")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* los 14 mundos: cada uno con su color — la identidad v98 intacta */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.35 }}
      >
        <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber mb-2">{t("nueva.mundos")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {SECTIONS.map((s, i) => {
            const acc = accentOfSection(s.key);
            return (
              <motion.button
                key={s.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.02 }}
                onClick={() => irA(s.tabs[0].key)}
                title={s.desc}
                className="group text-left p-3 rounded-xl border bg-[#0b0b12]/70 hover:bg-[#101018]/90 transition-colors v106-mundo"
                style={{ borderColor: `${acc}33` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center border shrink-0"
                    style={{ borderColor: `${acc}55`, color: acc, background: `linear-gradient(150deg, ${acc}22, rgba(6,6,10,0.9))` }}
                  >
                    {s.icon}
                  </span>
                  <span className="font-display text-[11px] font-black tracking-wider leading-tight" style={{ color: acc }}>
                    {t(`sec.${s.key}`)}
                  </span>
                </div>
                <p className="mt-2 font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
                  {s.tabs.length} {t("nueva.pestanas")}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* índice completo: todas las pestañas por mundo — nada queda enterrado */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.35 }}
      >
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber">{t("nueva.indice")}</h2>
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            {TOTAL_TABS} {t("nueva.pestanas")} · {visited.length} {t("nueva.descubiertas")}
          </span>
        </div>
        <div className="space-y-3">
          {SECTIONS.map((s) => {
            const acc = accentOfSection(s.key);
            return (
              <div key={s.key}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span style={{ color: acc }}>{s.icon}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: acc }}>
                    {t(`sec.${s.key}`)}
                  </span>
                  <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${acc}44, transparent)` }} />
                </div>
                <div className="flex flex-wrap gap-1">
                  {s.tabs.map((tb) => {
                    const descubierta = visited.includes(tb.key);
                    return (
                      <button
                        key={tb.key}
                        onClick={() => irA(tb.key)}
                        title={tabLabel(lang, tb.key, tb.label)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[9px] font-mono font-bold uppercase tracking-wide transition-colors",
                          descubierta
                            ? "border-border/60 text-muted-foreground hover:text-foreground hover:border-amber-hud/60 hover:bg-amber-hud/15"
                            : "border-dashed border-electric-hud/40 text-electric/80 hover:bg-electric-hud/15"
                        )}
                      >
                        {tb.icon}
                        {TAB_SHORTS[lang]?.[tb.key] ?? tb.short}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <p className="text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 pt-1">
        {APP_VERSION_LABEL} · {t("nueva.pie")}
      </p>
    </section>
  );
}
