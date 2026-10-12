"use client";

// v105.0 EL NAVEGADOR — la respuesta a "hay muchas cosas pero no sé qué hacer,
// ni a dónde ir". Una brújula con las 8 intenciones reales dentro de Vanguard:
// cada tarjeta es una acción concreta, no un lugar más. Se abre desde el HUD
// (botón brújula) y desde el evento vanguard:navegador.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper, Brain, Search, Castle, Palette, Target, Radar, LayoutGrid, X, Compass,
} from "lucide-react";
// v105.0: abrir la brújula también es momento protegido — nada la cubre
import { useCalma } from "@/lib/calma";

const ACC = "#FFC94D";

const INTENCIONES: { tab: string; titulo: string; desc: string; icon: React.ReactNode; hex: string }[] = [
  { tab: "redaccion", titulo: "LEER EL MUNDO", desc: "La Redacción: noticias reales con contexto y porqués, en modo lectura sin interrupciones", icon: <Newspaper className="w-5 h-5" />, hex: "#FFC94D" },
  { tab: "mente", titulo: "INVESTIGAR", desc: "Pregúntale a LA MENTE — responde de verdad y puede investigar la red en vivo por ti", icon: <Brain className="w-5 h-5" />, hex: "#BEF264" },
  { tab: "googles", titulo: "EXPLORAR EL MUNDO", desc: "El buscador de los problemas geopolíticos: tendencias, traductor y el saber de Vanguard", icon: <Search className="w-5 h-5" />, hex: "#3DDCFF" },
  { tab: "mundo", titulo: "JUGAR", desc: "Conquista territorios en 3D, guerra por turnos, detective, arcade y los juegos de la comunidad", icon: <Castle className="w-5 h-5" />, hex: "#FF3B30" },
  { tab: "agenteia", titulo: "CREAR", desc: "El MODO AGENTE crea contigo: juegos, escenarios e informes que se publican firmados", icon: <Palette className="w-5 h-5" />, hex: "#BEF264" },
  { tab: "misiones", titulo: "PROGRESAR HOY", desc: "Tus misiones del día, retos semanales, logros y la temporada que paga tu tiempo", icon: <Target className="w-5 h-5" />, hex: "#FFA030" },
  { tab: "pulso", titulo: "VER EL PULSO REAL", desc: "El planeta en vivo: terremotos, clima espacial, tensiones y señales de los sensores", icon: <Radar className="w-5 h-5" />, hex: "#38BDF8" },
  { tab: "obras", titulo: "LA VITRINA", desc: "El muro de la comunidad: juega, vota y remezcla lo que otros operadores crearon", icon: <LayoutGrid className="w-5 h-5" />, hex: "#A855F7" },
];

export function Navegador() {
  const [abierto, setAbierto] = useState(false);
  const activarLectura = useCalma((s) => s.activarLectura);
  const desactivarLectura = useCalma((s) => s.desactivarLectura);

  useEffect(() => {
    const abrir = () => setAbierto(true);
    window.addEventListener("vanguard:navegador", abrir);
    return () => window.removeEventListener("vanguard:navegador", abrir);
  }, []);

  // mientras la brújula está abierta, nada interrumpe (bono en espera, cero avisos)
  useEffect(() => {
    if (!abierto) return;
    activarLectura();
    return () => desactivarLectura();
  }, [abierto, activarLectura, desactivarLectura]);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAbierto(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  const ir = (tab: string) => {
    setAbierto(false);
    setTimeout(() => window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: tab })), 60);
  };

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-start sm:items-center justify-center overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button aria-label="Cerrar navegador" onClick={() => setAbierto(false)} className="absolute inset-0 bg-black/80 backdrop-blur-[3px] cursor-default" />

          <motion.div
            className="relative z-10 w-[min(760px,94vw)] my-auto rounded-2xl border overflow-hidden"
            style={{ borderColor: `${ACC}55`, background: "linear-gradient(160deg, #14100a 0%, #0a0806 60%, #050508 100%)" }}
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACC}1f`, border: `1px solid ${ACC}55` }}>
                <Compass className="w-5 h-5" style={{ color: ACC }} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif font-bold text-[19px] sm:text-[22px] text-foreground leading-tight">¿QUÉ QUIERES HACER HOY?</h2>
                <p className="text-[11.5px] text-muted-foreground leading-snug mt-0.5">
                  Ocho intenciones, cero laberinto. Cada tarjeta te lleva directo a la acción — sin buscar en el menú.
                </p>
              </div>
              <button onClick={() => setAbierto(false)} className="rounded-lg border border-white/15 p-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0" aria-label="Cerrar">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INTENCIONES.map((it, i) => (
                <motion.button
                  key={it.tab}
                  onClick={() => ir(it.tab)}
                  className="v105-entra text-left rounded-xl border border-white/10 bg-black/40 p-3.5 hover:bg-black/60 transition-colors group relative overflow-hidden"
                  style={{ animationDelay: `${i * 40}ms` }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                >
                  <div className="absolute inset-x-0 top-0 h-[2px] opacity-70" style={{ background: `linear-gradient(90deg, transparent, ${it.hex}, transparent)` }} />
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${it.hex}1a`, border: `1px solid ${it.hex}44`, color: it.hex }}>
                      {it.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[12px] font-bold tracking-wider" style={{ color: it.hex }}>{it.titulo}</p>
                      <p className="text-[11.5px] leading-snug text-foreground/70 mt-0.5">{it.desc}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <p className="px-4 sm:px-5 pb-4 text-[10px] text-muted-foreground font-mono">
              Consejo del comandante: Ctrl+K abre el buscador total de Vanguard · la brújula del HUD siempre te trae aquí
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
