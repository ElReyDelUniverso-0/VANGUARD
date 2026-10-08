"use client";

// v87.0 EL DESPERTAR — LATIDO DE LA COMUNIDAD
// SOCIAL estaba muerto por dentro: listas quietas, tableros sin aliento. Este
// componente comparte el pulso real de Vanguard con TODAS las salas sociales:
// cuenta guerreros en línea (presencia real vía subscribeOnline), enseña el
// récord histórico, late con un ecualizador vivo y va rotando señales de lo
// que está pasando ahora mismo dentro del mundo. Un corazón, ocho paneles.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Crown, MessagesSquare, Users, Vote, Swords, Handshake, Globe2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { subscribeOnline, subscribePeak } from "@/components/vanguard/presence-ping";

// señales de vida — lo que la comunidad respira dentro de Vanguard
const SENALES = [
  { icon: MessagesSquare, texto: "mensajes cruzándose en las salas ahora mismo" },
  { icon: Vote, texto: "votos cayendo en la encuesta del mundo" },
  { icon: Swords, texto: "batallas por territorios en el mundo de guerra" },
  { icon: Handshake, texto: "alianzas negociando tratados en secreto" },
  { icon: Users, texto: "operadores eligiendo su puesto de trabajo" },
  { icon: Globe2, texto: "expedientes leyendo la tierra de norte a sur" },
  { icon: Radio, texto: "alertas de tensión viajando por la red" },
  { icon: Crown, texto: "récords de presencia que quieren caer" },
];

// ecualizador: 14 barras que respiran con desfase — pura vida sin JS
function Ecualizador({ color }: { color: string }) {
  return (
    <div className="flex items-end gap-[3px] h-6" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="w-[3px] rounded-sm latido-barra"
          style={{
            background: color,
            animationDelay: `${(i * 0.13) % 1.1}s`,
            height: "30%",
          }}
        />
      ))}
    </div>
  );
}

export function LatidoSocial({ tono = "violet" }: { tono?: "violet" | "amber" | "cyan" | "green" | "red" }) {
  const [online, setOnline] = useState(0);
  const [peak, setPeak] = useState(0);
  const [senal, setSenal] = useState(0);

  useEffect(() => {
    const off1 = subscribeOnline(setOnline);
    const off2 = subscribePeak(setPeak);
    return () => { off1(); off2(); };
  }, []);

  // la señal rota cada 4.2s — la sala nunca se queda muda
  useEffect(() => {
    const iv = setInterval(() => setSenal((s) => (s + 1) % SENALES.length), 4200);
    return () => clearInterval(iv);
  }, []);

  const colores = {
    violet: { barra: "rgba(192,132,252,0.85)", texto: "text-violet-hud", borde: "border-violet-hud/40" },
    amber: { barra: "rgba(255,176,32,0.85)", texto: "text-amber", borde: "border-amber-hud/40" },
    cyan: { barra: "rgba(34,211,238,0.85)", texto: "text-cyan-hud", borde: "border-cyan-hud/40" },
    green: { barra: "rgba(0,255,135,0.85)", texto: "text-neon", borde: "border-neon-hud/40" },
    red: { barra: "rgba(255,70,85,0.85)", texto: "text-crisis", borde: "border-crisis-hud/40" },
  }[tono];

  const IconoSenal = SENALES[senal].icon;

  return (
    <div className={cn("hud-panel relative overflow-hidden p-3 flex items-center gap-3", colores.borde)}>
      {/* brillo de fondo que respira */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{ background: `radial-gradient(ellipse at 20% 50%, ${colores.barra} 0%, transparent 60%)` }}
        aria-hidden
      />

      {/* ecualizador vivo */}
      <div className="relative z-[1] flex-shrink-0">
        <Ecualizador color={colores.barra} />
      </div>

      {/* online + récord — los números de la casa */}
      <div className="relative z-[1] flex items-center gap-3 flex-shrink-0">
        <div className="text-center">
          <div className={cn("font-display text-lg font-bold leading-none tabular-nums flex items-center gap-1.5", colores.texto)}>
            <Activity className="w-3.5 h-3.5" />
            <motion.span
              key={online}
              initial={{ scale: 1.25, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 16 }}
            >
              {online}
            </motion.span>
          </div>
          <div className="font-mono text-[7.5px] uppercase tracking-widest text-muted-foreground mt-0.5">en línea</div>
        </div>
        <div className="text-center hidden sm:block">
          <div className="font-display text-sm font-bold leading-none text-amber tabular-nums flex items-center gap-1">
            <Crown className="w-3 h-3" /> {Math.max(peak, online)}
          </div>
          <div className="font-mono text-[7.5px] uppercase tracking-widest text-muted-foreground mt-0.5">récord</div>
        </div>
      </div>

      {/* señal rotante de vida comunitaria */}
      <div className="relative z-[1] flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={senal}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-2 min-w-0"
          >
            <IconoSenal className={cn("w-3.5 h-3.5 flex-shrink-0", colores.texto)} />
            <p className="text-[11px] leading-tight text-foreground/85 truncate">
              {SENALES[senal].texto}
            </p>
          </motion.div>
        </AnimatePresence>
        <div className="font-mono text-[7.5px] uppercase tracking-[0.3em] text-muted-foreground mt-1">
          latido de la comunidad · el mundo está dentro de vanguard
        </div>
      </div>
    </div>
  );
}
