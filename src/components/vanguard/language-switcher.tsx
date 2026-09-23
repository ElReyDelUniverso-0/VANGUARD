"use client";

// VANGUARD v21 — SELECTOR DE IDIOMA: 7 idiomas en dropdown compacto del HUD.
import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANGS, useLangStore, useT, type Lang } from "@/lib/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { t } = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  // v42: el idioma fue detectado del navegador (el usuario nunca eligió a mano)
  const autoDetected = useLangStore((s) => s.autoDetected);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const current = LANGS.find((l) => l.id === lang) ?? LANGS[0];

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        title={t("hud.language")}
        aria-label={t("hud.language")}
        className={cn(
          "hud-corner flex items-center justify-center gap-1 border-amber-hud text-amber hover:bg-amber-hud transition-colors font-mono font-bold",
          compact ? "w-6 h-6 text-[8px]" : "w-6 h-6 sm:w-8 sm:h-8 text-[9px] sm:text-[11px]"
        )}
      >
        <Globe className={compact ? "w-3 h-3" : "w-3 h-3 sm:w-4 sm:h-4"} />
        <span className="hidden sm:inline">{current.short}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-44 hud-corner bg-background/95 backdrop-blur border border-amber-hud shadow-2xl"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.7)" }}
        >
          <div className="px-2.5 py-1.5 border-b border-amber-hud/30 text-[9px] font-mono font-bold text-amber uppercase tracking-widest">
            {t("hud.language")} · {LANGS.length}
            {autoDetected && (
              <span className="ml-1 text-green-hud" title="Idioma detectado del navegador">
                · AUTO
              </span>
            )}
          </div>
          {LANGS.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setLang(l.id as Lang);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-2 text-left font-mono text-[11px] uppercase tracking-wide transition-colors hover:bg-amber-hud/20",
                l.id === lang ? "text-amber font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="w-5 h-5 hud-corner border-amber-hud/50 flex items-center justify-center text-[9px] font-bold text-amber flex-shrink-0">
                {l.glyph}
              </span>
              <span className="flex-1">{l.native}</span>
              {l.id === lang && <Check className="w-3.5 h-3.5 text-amber" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
