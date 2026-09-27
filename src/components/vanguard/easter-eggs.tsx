"use client";

// v67.0 EL HANGAR — EASTER EGGS GLOBALES.
// 1) KONAMI (↑↑↓↓←→←→BA): la primera vez de la vida paga +1000ⓒ y suelta el
//    MODO ARCADE 1986 durante 60s (la app entera vira a neón con scanlines y
//    fanfarria 8-bit). Siempre que se acierte: modo neón de cortesía.
// 2) PALABRA SECRETA "ORACULO" tecleada en cualquier pantalla: abre la Isla
//    del Oráculo (el morse del hangar la delata). +250ⓒ la primera vez.

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import { claimOraculo, ORACULO_SECRET, ORACULO_DOCS } from "@/lib/oraculo";

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const KONAMI_KEY = "vanguard-konami-v67";

export function EasterEggs() {
  const [arcade, setArcade] = useState(false);
  const [islandOpen, setIslandOpen] = useState(false);

  useEffect(() => {
    let progress: string[] = [];
    let word = "";

    const triggerArcade = () => {
      setArcade(true);
      // neón 80s aplicado directo sobre el documento (sin styled-jsx)
      document.documentElement.style.filter = "hue-rotate(86deg) saturate(1.75) contrast(1.12)";
      sfx.streak();
      sfx.coin();
      setTimeout(() => sfx.achievement(), 700);
      const first = (() => {
        try {
          if (localStorage.getItem(KONAMI_KEY) === "1") return false;
          localStorage.setItem(KONAMI_KEY, "1");
          return true;
        } catch {
          return false;
        }
      })();
      toast.success(
        first ? "🕹️ CÓDIGO KONAMI ACEPTADO · +1000ⓒ · MODO ARCADE 1986" : "🕹️ MODO ARCADE 1986 · la agencia vuelve a los 80",
        { description: first ? "Los veteranos nunca mueren: 60 segundos de neón puro. Bonus permanente registrado en tu cuenta." : "60 segundos de neón puro por dominar el código de los viejos.", duration: 8000 }
      );
      if (first) useGameStore.getState().addCoins(1000, "CÓDIGO KONAMI — secreto de veteranos");
      setTimeout(() => {
        setArcade(false);
        document.documentElement.style.filter = "";
      }, 60000);
    };

    const triggerIsland = () => {
      const first = claimOraculo();
      if (first) {
        useGameStore.getState().addCoins(250, "ISLA DEL ORÁCULO descubierta");
        sfx.achievement();
        toast.success("ISLA DEL ORÁCULO · +250ⓒ", { description: "El morse nunca mintió. Abriendo los documentos…" });
      }
      setIslandOpen(true);
    };

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      // konami
      progress.push(k);
      if (progress.length > KONAMI.length) progress = progress.slice(-KONAMI.length);
      if (progress.length === KONAMI.length && KONAMI.every((kk, i) => progress[i] === kk)) {
        progress = [];
        triggerArcade();
      }
      // palabra secreta
      if (/^[a-z]$/.test(k)) {
        word = (word + k).slice(-ORACULO_SECRET.length);
        if (word === ORACULO_SECRET.toLowerCase()) {
          word = "";
          triggerIsland();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {arcade && <div className="fixed inset-0 pointer-events-none z-[90] vg-scanlines" aria-hidden />}
      {islandOpen && (
        <div className="fixed inset-0 z-[96] flex items-center justify-center p-4 bg-black/80" onClick={() => setIslandOpen(false)}>
          <div
            className="max-w-lg w-full max-h-[80vh] overflow-y-auto p-5 bg-card"
            style={{ border: "2px solid rgba(255,214,10,0.6)", boxShadow: "0 0 60px rgba(255,214,10,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-display text-xl font-black tracking-widest text-amber mb-1">🏝️ BIBLIOTECA DEL ORÁCULO</div>
            <p className="text-xs text-muted-foreground mb-3">
              Una isla que no aparece en ningún mapa. Documentos que la historia dejó a medias, con veredicto de la agencia.
            </p>
            <div className="space-y-2">
              {ORACULO_DOCS.map((d) => (
                <div key={d.id} className="border border-amber-hud/40 p-3 bg-secondary/20">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-[10px] font-bold text-amber tracking-widest">{d.title}</div>
                    <span className="font-mono text-[9px]">{d.tag}</span>
                  </div>
                  <p className="text-[11px] text-soft/85 leading-relaxed mt-1">{d.body}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIslandOpen(false)}
              className="mt-3 w-full py-2 border border-border font-mono text-[10px] uppercase tracking-widest vg-transition hover:border-amber-hud"
            >
              Salir de la isla
            </button>
          </div>
        </div>
      )}
    </>
  );
}
