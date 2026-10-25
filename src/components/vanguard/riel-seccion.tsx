"use client";

// ══════════════════════════════════════════════════════════════════════
// v170.0 EL RIEL DE SECCIÓN — LA NAVEGACIÓN QUE FALTABA.
// El Dueño: «más fácil de navegar, más fluido, más hermoso».
// Antes: con ~160 módulos, saltar de hermano en hermano obligaba a abrir
// el menú (M) o el buscador (Ctrl+K). Ahora: los hermanos de TU sección
// viven SIEMPRE a un toque, pegados bajo la franja de cromo, y tus
// recientes viajan a la derecha. Además el riel PREFETCHA el módulo al
// pasar el ratón — abrir una sala es instantáneo (chunk ya en memoria).
// Contrato de rendimiento: solo transform/opacity, scroll horizontal con
// rueda propia, reduced-motion respeta, cero re-render de la Casa.
// ══════════════════════════════════════════════════════════════════════

import { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronsDownUp, ChevronsUpDown, History } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TABS,
  SECTIONS,
  sectionOfTab,
  accentOfSection,
  type TabKey,
} from "@/components/vanguard/tab-nav";
import { tabLabel, TAB_SHORTS, useT } from "@/lib/i18n";
import { useCama } from "@/lib/cama-store";

// el prefetch es UNA VEZ por módulo y por sesión (los chunks se quedan)
const prefetchados = new Set<string>();

export function RielSeccion({
  tab,
  onChange,
}: {
  tab: TabKey;
  onChange: (k: TabKey) => void;
}) {
  const { t, lang } = useT();
  const recientes = useCama((s) => s.recientes);
  const [montado, setMontado] = useState(false);
  const [plegado, setPlegado] = useState(false);

  useEffect(() => setMontado(true), []);
  useEffect(() => {
    try {
      setPlegado(localStorage.getItem("vg170-riel") === "1");
    } catch {}
  }, []);

  const alternarPlegado = useCallback(() => {
    setPlegado((v) => {
      const n = !v;
      try { localStorage.setItem("vg170-riel", n ? "1" : "0"); } catch {}
      return n;
    });
  }, []);

  const seccion = sectionOfTab(tab);
  const acc = accentOfSection(seccion.key);
  const esNueva = tab === "nueva";

  // PÍLDORAS: los hermanos de la sección (o las 16 secciones en la NUEVA)
  const pastillas = useMemo(() => {
    if (esNueva) {
      return SECTIONS.map((s) => ({
        k: s.tabs[0].key as TabKey,
        etiqueta: t(`sec.${s.key}`) || s.short,
        acc: accentOfSection(s.key),
        activa: false,
      }));
    }
    return seccion.tabs.map((tb) => {
      const def = TABS[tb.key];
      return {
        k: tb.key,
        etiqueta: (def ? tabLabel(lang, tb.key, def.label) : tb.key).split(" (")[0],
        acc,
        activa: tb.key === tab,
      };
    });
  }, [esNueva, seccion, tab, lang, acc, t]);

  // RECIENTES (solo escritorio; el camino de la casa ya lo aprende La Cama)
  const filaRecientes = useMemo(() => {
    if (!montado) return [];
    return recientes.filter((k) => k !== tab).slice(0, 6);
  }, [montado, recientes, tab]);

  // PREFETCH al hover: el módulo se baja ANTES de que lo pidas
  const alAguantar = useCallback((k: TabKey) => {
    if (prefetchados.has(k)) return;
    prefetchados.add(k);
    window.dispatchEvent(new CustomEvent("vg:prefetch-tab", { detail: { key: k } }));
  }, []);

  // rueda vertical → desplaza el riel horizontal (fluidez de escritorio)
  const alRodar = useCallback((e: React.WheelEvent) => {
    const el = e.currentTarget as HTMLElement;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      if (el.scrollWidth > el.clientWidth) e.preventDefault();
    }
  }, []);

  return (
    <div
      className="vg170-riel-wrap sticky top-[165px] sm:top-[199px] z-20"
      data-vg-riel="1"
      data-vg-riel-plegado={plegado ? "1" : "0"}
      style={{ "--riel-acc": acc } as React.CSSProperties}
    >
      <div className="vg170-riel">
        {/* IDENTIDAD DE SECCIÓN — chip ancla con el acento del mundo */}
        <button
          type="button"
          onClick={() => { if (!esNueva) onChange(seccion.tabs[0].key); else onChange("nueva"); }}
          className="vg170-riel-sec"
          title={t(`sec.${seccion.key}.desc`) || seccion.desc}
        >
          <span className="vg170-riel-ico">{seccion.icon}</span>
          <span className="vg170-riel-seclabel">{t(`sec.${seccion.key}`) || seccion.short}</span>
        </button>

        {!plegado && (
          <div className="vg170-riel-scroll" onWheel={alRodar}>
            <div className="vg170-riel-fila">
              {pastillas.map((p) => (
                <motion.button
                  key={p.k}
                  type="button"
                  onMouseEnter={() => alAguantar(p.k)}
                  onTouchStart={() => alAguantar(p.k)}
                  onClick={() => onChange(p.k)}
                  className={cn("vg170-riel-pill", p.activa && "vg170-riel-pill-act")}
                  style={p.activa ? ({ "--pill-acc": p.acc } as React.CSSProperties) : undefined}
                  whileTap={{ scale: 0.94 }}
                  aria-current={p.activa ? "page" : undefined}
                >
                  {p.etiqueta}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* RECIENTES — el camino de la casa (escritorio) */}
        {!plegado && filaRecientes.length > 0 && (
          <div className="vg170-riel-rec" aria-label={t("nueva.recientes") || "Recientes"}>
            <History className="w-3 h-3 opacity-50 shrink-0" aria-hidden />
            {filaRecientes.map((k) => {
              const def = TABS[k];
              return (
                <button
                  key={k}
                  type="button"
                  onMouseEnter={() => alAguantar(k)}
                  onClick={() => onChange(k)}
                  className="vg170-riel-recpill"
                  title={(def ? tabLabel(lang, k, def.label) : k).split(" (")[0]}
                >
                  <i style={{ background: accentOfSection(sectionOfTab(k).key) }} aria-hidden />
                  {TAB_SHORTS[lang]?.[k] ?? def?.short ?? ""}
                </button>
              );
            })}
          </div>
        )}

        {/* PLEGAR — el riel se aparta sin morir (persistente) */}
        <button
          type="button"
          onClick={alternarPlegado}
          className="vg170-riel-plegar"
          title={plegado ? "Desplegar riel de sección" : "Plegar riel de sección"}
          aria-expanded={!plegado}
        >
          {plegado ? <ChevronsUpDown className="w-3 h-3" aria-hidden /> : <ChevronsDownUp className="w-3 h-3" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
