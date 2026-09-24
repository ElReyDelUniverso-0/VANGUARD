"use client";

// v47.0 RADAR TOTAL — BUSCADOR DE SECCIONES (paleta de comandos).
// Problema real reportado por el comandante: con 81 subtemas y scroll
// horizontal, las secciones del fondo quedan "opacadas" — nadie las ve.
// Solución estándar: paleta de búsqueda (Ctrl+K o /) que salta a CUALQUIER
// sección en 2 toques, con recientes persistentes y flechas del teclado.

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SECTIONS } from "./tab-nav";
import { tabLabel, useT } from "@/lib/i18n";
import { Search, CornerDownLeft, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LS_RECENT = "vanguard_recent_tabs_v1";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

interface Item {
  key: string;
  label: string;
  short: string;
  icon: React.ReactNode;
  sectionKey: string;
  sectionLabel: string;
  icon_color: string;
}

export function SectionSearch({
  open,
  onClose,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  onChange: (tab: string) => void;
}) {
  const { t, lang } = useT();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  // v47.1: la paleta va en PORTAL a <body> — el wrapper raíz (.z-10) atrapaba
  // el z-index en su contexto de apilamiento y los modales Radix la tapaban.
  const [portalReady, setPortalReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // índice plano de TODAS las secciones de TODOS los grupos
  // v48.0: deps [t] — el compilador exige coherencia y además las etiquetas
  // ahora SÍ se re-traducen cuando el comandante cambia de idioma
  const all: Item[] = useMemo(
    () =>
      SECTIONS.flatMap((s) =>
        s.tabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
          short: tab.short,
          icon: tab.icon,
          sectionKey: s.key,
          sectionLabel: t(`sec.${s.key}`) || s.label,
          icon_color: tab.color,
        }))
      ),
    [t]
  );

  // montaje del portal (solo cliente)
  useEffect(() => {
    const t = setTimeout(() => setPortalReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    // patrón verificado: setState síncrono en effect → setTimeout(0)
    const tt = setTimeout(() => {
      try {
        const arr = JSON.parse(localStorage.getItem(LS_RECENT) || "[]");
        setRecent(Array.isArray(arr) ? arr.slice(0, 6) : []);
      } catch { setRecent([]); }
      setQ("");
      setIdx(0);
    }, 0);
    // enfocar tras el mount del overlay
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => { clearTimeout(tt); clearTimeout(t); };
  }, [open]);

  const results: Item[] = useMemo(() => {
    const query = norm(q.trim());
    if (!query) {
      const recItems = recent
        .map((k) => all.find((a) => a.key === k))
        .filter((x): x is Item => Boolean(x));
      return recItems.length > 0 ? recItems : all.slice(0, 12);
    }
    return all
      .filter((a) =>
        norm(`${a.label} ${a.short} ${a.sectionLabel} ${a.key}`).includes(query)
      )
      .slice(0, 20);
  }, [q, all, recent]);

  // reset del cursor al filtrar (patrón setTimeout(0) para lint)
  useEffect(() => {
    const t = setTimeout(() => setIdx(0), 0);
    return () => clearTimeout(t);
  }, [q]);

  // teclado dentro de la paleta
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); onClose(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[idx]) { e.preventDefault(); pick(results[idx]); }
  };

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-i="${idx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [idx, open]);

  const pick = (item: Item) => {
    try {
      const arr = JSON.parse(localStorage.getItem(LS_RECENT) || "[]");
      const next = [item.key, ...arr.filter((k: string) => k !== item.key)].slice(0, 8);
      localStorage.setItem(LS_RECENT, JSON.stringify(next));
    } catch { /* sin storage */ }
    onChange(item.key);
    onClose();
  };

  if (!open || !portalReady) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-start justify-center bg-black/80 backdrop-blur-sm px-3 pt-[8vh]"
      style={{ zIndex: 150 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Buscador de secciones"
    >
      <div
        className="w-full max-w-xl rounded-xl border border-amber-hud bg-zinc-950 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* input */}
        <div className="flex items-center gap-2 border-b border-amber-hud/40 px-4 py-3">
          <Search className="w-4 h-4 text-amber shrink-0" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Busca una sección… (ej. drones, apuestas, mapa)"
            className="flex-1 bg-transparent outline-none text-sm font-mono placeholder:text-zinc-600"
            aria-label="Buscar sección"
          />
          <button onClick={onClose} aria-label="Cerrar buscador" className="text-zinc-500 hover:text-zinc-200">
            <X className="w-4 h-4" aria-hidden />
          </button>
        </div>

        {/* resultados */}
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-1.5">
          {q.trim() === "" && results.length > 0 && recent.length > 0 && (
            <p className="flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              <Clock className="w-3 h-3" aria-hidden /> Recientes
            </p>
          )}
          {q.trim() === "" && recent.length === 0 && (
            <p className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {results.length} secciones — escribe para filtrar
            </p>
          )}
          {results.map((a, i) => (
            <button
              key={a.key}
              data-i={i}
              onClick={() => pick(a)}
              onMouseEnter={() => setIdx(i)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors",
                i === idx ? "bg-amber-hud/30 border border-amber-hud/60" : "border border-transparent hover:bg-secondary/40"
              )}
            >
              <span className="shrink-0 text-amber">{a.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold text-zinc-100">
                  {tabLabel(lang, a.key, a.label)}
                </span>
                <span className="block truncate font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  {a.sectionLabel}
                </span>
              </span>
              {i === idx && <CornerDownLeft className="w-3.5 h-3.5 shrink-0 text-amber" aria-hidden />}
            </button>
          ))}
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-zinc-500">
              Nada con «{q}». Prueba con otra palabra.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-zinc-800 px-4 py-2 font-mono text-[10px] text-zinc-600">
          <span>↑↓ navegar</span>
          <span>⏎ abrir</span>
          <span>esc cerrar</span>
          <span className="ml-auto">{results.length} / {all.length} secciones</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
