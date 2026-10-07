"use client";

// v86.0 CENTINELA GLOBAL — FICHA TÉCNICA
// El "diccionario interactivo" del portal definitivo: si la noticia menciona un
// Iskander, un HIMARS o a Hezbolá, el comandante toca el chip y abre la ficha
// con alcance, origen, operadores, poder y un dato que nadie te cuenta.
// Animada, 60fps (solo transform/opacity), responsive.

import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Users, X } from "lucide-react";
import { useEffect } from "react";
import type { Ficha } from "@/lib/dossier";
import { cn } from "@/lib/utils";

function Barra({ label, valor, color }: { label: string; valor: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{valor}</span>
      </div>
      <div className="h-1.5 bg-black/50 border border-white/10 overflow-hidden rounded-sm">
        <motion.div
          className="h-full rounded-sm"
          style={{ background: color, boxShadow: `0 0 8px ${color}88` }}
          initial={{ width: 0 }}
          animate={{ width: `${valor}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
        />
      </div>
    </div>
  );
}

export function FichaTecnica({ ficha, onClose }: { ficha: Ficha | null; onClose: () => void }) {
  // cerrar con ESC + bloquear scroll de fondo
  useEffect(() => {
    if (!ficha) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [ficha, onClose]);

  return (
    <AnimatePresence>
      {ficha && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Ficha técnica: ${ficha.nombre}`}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" aria-hidden />
          <motion.div
            className={cn(
              "relative w-full sm:max-w-lg max-h-[88vh] overflow-y-auto thin-scroll",
              "hud-panel border-2 shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
            )}
            style={{ borderColor: ficha.clase === "arma" ? "rgba(255,138,42,0.5)" : "rgba(0,229,255,0.45)" }}
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* banda superior */}
            <div
              className="relative px-4 pt-4 pb-3 border-b border-white/10"
              style={{ background: ficha.clase === "arma" ? "linear-gradient(160deg, rgba(255,138,42,0.16), rgba(0,0,0,0.4))" : "linear-gradient(160deg, rgba(0,229,255,0.14), rgba(0,0,0,0.4))" }}
            >
              <button
                onClick={onClose}
                className="absolute top-2.5 right-2.5 w-8 h-8 hud-corner border-amber-hud text-amber flex items-center justify-center hover:bg-amber-hud/30 transition-colors"
                aria-label="Cerrar ficha"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-1.5">
                {ficha.clase === "arma" ? <Crosshair className="w-3 h-3 text-amber" /> : <Users className="w-3 h-3 text-cyan-hud" />}
                {ficha.clase === "arma" ? "Ficha técnica · Armamento" : "Ficha técnica · Actor"}
              </p>
              <h3 className="font-display text-xl sm:text-2xl font-black tracking-wide text-foreground mt-1 pr-8">
                {ficha.nombre}
              </h3>
              <p className="text-[11px] text-amber mt-0.5">{ficha.clase === "arma" ? ficha.tipo : ficha.clase}</p>
            </div>

            <div className="p-4 space-y-3.5">
              {/* grids de datos */}
              <div className="grid grid-cols-2 gap-2">
                {(ficha.clase === "arma"
                  ? [
                      ["Origen", ficha.origen],
                      ["En servicio desde", ficha.desde],
                      ["Alcance", ficha.alcance],
                      ["Operadores", ficha.operadores],
                    ]
                  : [
                      ["Sede", ficha.sede],
                      ["Fundado", ficha.fundado],
                      ["Ámbito", ficha.ambito],
                      ["Fuerza", ficha.fuerza],
                    ]
                ).map(([k, v]) => (
                  <div key={k as string} className="hud-corner border border-white/10 bg-black/30 p-2.5">
                    <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">{k}</p>
                    <p className="text-[11px] text-foreground/90 leading-snug mt-0.5">{v}</p>
                  </div>
                ))}
              </div>

              {/* specs */}
              <div className="hud-corner border border-white/10 bg-black/30 p-2.5">
                <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground mb-1">
                  {ficha.clase === "arma" ? "Especificaciones" : "Perfil"}
                </p>
                <p className="text-[11.5px] text-foreground/85 leading-relaxed">
                  {ficha.clase === "arma" ? ficha.specs : ficha.ambito}
                </p>
              </div>

              {/* barras */}
              <div className="grid grid-cols-2 gap-3">
                <Barra
                  label={ficha.clase === "arma" ? "Poder destructivo" : "Poder"}
                  valor={ficha.poder}
                  color="#ff8a2a"
                />
                <Barra
                  label={ficha.clase === "arma" ? "Precisión" : "Cohesión"}
                  valor={ficha.clase === "arma" ? ficha.precision : ficha.cohesion}
                  color="#00e5ff"
                />
              </div>

              {/* estado */}
              <div className="flex items-center gap-2 px-2.5 py-2 border border-green-hud/40 bg-green-hud/10">
                <span className="beacon w-1.5 h-1.5 rounded-full bg-green-hud" style={{ color: "#00FF87" }} />
                <span className="font-mono text-[10px] uppercase tracking-widest text-green-hud">{ficha.estado}</span>
              </div>

              {/* dato curioso */}
              <div className="border-l-2 border-amber pl-3 py-1">
                <p className="font-mono text-[8px] uppercase tracking-widest text-amber mb-0.5">El dato incómodo</p>
                <p className="text-[12px] text-foreground/90 leading-relaxed">{ficha.dato}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
