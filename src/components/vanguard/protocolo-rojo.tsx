"use client";

// v67.0 EL HANGAR — CAPA GLOBAL DE EMERGENCIA.
// Vigila el termómetro de tensión y transforma TODA la interfaz:
//   ≥80 → MODO CRISIS: viñeta roja pulsante, temblor sutil, alarmas
//         periódicas y mensajes clasificados cayendo (toast rotativo).
//   ≥90 → PROTOCOLO ROJO: toma de mando a pantalla completa (una vez por
//         activación): muro rojo, cuenta atrás de 6h, x2 monedas y misión
//         global de +500ⓒ por ganar 300ⓒ durante el protocolo.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import {
  getTension,
  isProtocolo,
  activateProtocolo,
  protocoloState,
  trackProtocoloEarnings,
  markAlertLevel,
  TENSION_THRESHOLDS,
} from "@/lib/tension";

const CLASSIFIED_MSGS = [
  "INTERCEPTADO: movimientos de columnas blindadas cerca de la frontera este.",
  "SEÑAL CIFRADA: 3 transmisiones navales repetidas en el estrecho. Patrón de bloqueo.",
  "FUENTE LOCAL: apagones masivos en zona portuaria. No es mantenimiento.",
  "SATÉLITE: movimiento térmico anómalo en base abandonada. Verificar en Sala OSINT.",
  "ESCUCHA: compradores de artillería ligera en mercado negro. Pago en diamantes.",
  "AVISOS AÉREOS: ruta civil cancelada sin explicación oficial. 4ª vez esta semana.",
];

function fmtCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// rotador de mensajes clasificados (alcance de módulo: lo usa ClassifiedToastText)
const msgIdx = { current: 0 };

export function ProtocoloRojo() {
  const [tension, setTensionState] = useState(0);
  const [crisis, setCrisis] = useState(false);
  const [takeover, setTakeover] = useState(false);
  const [proto, setProto] = useState<{ active: boolean; until: number; earned: number; bonusClaimed: boolean }>({ active: false, until: 0, earned: 0, bonusClaimed: false });
  const [now, setNow] = useState(Date.now());
  const addCoins = useGameStore((s) => s.addCoins);
  const offeredRef = useRef(false);

  // encuesta de tensión + reloj
  useEffect(() => {
    const poll = () => {
      const t = getTension();
      setTensionState(t);
      setCrisis(t >= TENSION_THRESHOLDS.CRISIS_AT);
      const p = protocoloState();
      setProto(p);
      // toma de control automática al cruzar 90 si el protocolo no está activo
      // (una sola vez por sesión de página para no acosar; vuelve a ofrecerse al recargar)
      if (t >= TENSION_THRESHOLDS.PROTOCOLO_AT && !p.active && !offeredRef.current) {
        offeredRef.current = true;
        setTakeover(true);
      }
      if (t >= TENSION_THRESHOLDS.CRISIS_AT && markAlertLevel(t >= 90 ? 2 : 1)) {
        sfx.alarm();
      }
      if (t < 80) markAlertLevel(0);
    };
    poll();
    const iv = setInterval(poll, 20000);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    const onTension = () => poll();
    window.addEventListener("vanguard:tension", onTension);
    return () => {
      clearInterval(iv);
      clearInterval(clock);
      window.removeEventListener("vanguard:tension", onTension);
    };
  }, []);

  // modo crisis: alarma + mensaje clasificado cada 45s
  useEffect(() => {
    if (!crisis || takeover) return;
    const iv = setInterval(() => {
      sfx.alarm();
      toast(ClassifiedToastText(), {
        description: "MODO CRISIS — el termómetro global supera 80. Gana el doble mirando el mundo.",
        duration: 6000,
      });
    }, 45000);
    return () => clearInterval(iv);
  }, [crisis, takeover]);

  // bonus +500 al cruzar 300ⓒ dentro del protocolo (escucha addCoins vía evento de tensión)
  useEffect(() => {
    const iv = setInterval(() => {
      const p = protocoloState();
      setProto(p);
      if (p.active && !p.bonusClaimed && p.earned >= 300) {
        const bonus = trackProtocoloEarnings(0);
        if (bonus > 0) {
          addCoins(bonus, "PROTOCOLO ROJO — misión global cumplida");
          toast.success("PROTOCOLO ROJO · MISIÓN GLOBAL CUMPLIDA · +500ⓒ", { description: "La agencia no olvida a quien asume el mando." });
          sfx.achievement();
        }
      }
    }, 5000);
    return () => clearInterval(iv);
  }, [addCoins]);

  const assume = () => {
    activateProtocolo();
    setTakeover(false);
    setProto(protocoloState());
    sfx.levelUp();
    toast.success("PROTOCOLO ROJO ASUMIDO · x2 MONEDAS DURANTE 6H", {
      description: "Misión global: gana 300ⓒ durante el protocolo → +500ⓒ extra para toda la resistencia.",
    });
  };

  const protoActive = proto.active && proto.until > now;

  return (
    <>
      {/* MODO CRISIS: viñeta roja pulsante + temblor del mundo */}
      <AnimatePresence>
        {crisis && !takeover && (
          <motion.div
            key="crisis-vignette"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[70]"
            aria-hidden
          >
            <div
              className="absolute inset-0 vg-crisis-vignette"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 42%, rgba(255,59,48,0.16) 78%, rgba(255,59,48,0.38) 100%)",
                animation: "vg-crisis-pulse 1.6s ease-in-out infinite",
              }}
            />
            {/* barras rojas giratorias en las esquinas */}
            <div className="absolute top-0 left-0 w-24 h-1 bg-crisis/80" style={{ animation: "vg-sweep 3.2s linear infinite" }} />
            <div className="absolute bottom-0 right-0 w-24 h-1 bg-crisis/80" style={{ animation: "vg-sweep 3.2s linear infinite reverse" }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHIP permanente mientras el protocolo está activo */}
      <AnimatePresence>
        {protoActive && !takeover && (
          <motion.div
            key="proto-chip"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-3 right-3 z-[72] pointer-events-auto"
          >
            <button
              onClick={() => {
                sfx.beep();
                toast(`PROTOCOLO ROJO ACTIVO · x2 monedas`, {
                  description: `Progreso de la misión global: ${Math.min(proto.earned, 300)}/300ⓒ — termina en ${fmtCountdown(proto.until - Date.now())}`,
                });
              }}
              className="vg-proto-chip px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-white"
              style={{
                background: "linear-gradient(135deg, rgba(255,59,48,0.92), rgba(120,10,10,0.92))",
                border: "1px solid rgba(255,120,110,0.8)",
                boxShadow: "0 0 24px rgba(255,59,48,0.55)",
                animation: "vg-crisis-pulse 2s ease-in-out infinite",
              }}
            >
              ⛔ PROTOCOLO ROJO · x2ⓒ · {fmtCountdown(proto.until - now)}
              <span className="block text-[9px] opacity-90 normal-case tracking-normal">
                misión global {Math.min(proto.earned, 300)}/300ⓒ → +500ⓒ
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOMA DE MANDO: pantalla completa al cruzar 90 */}
      <AnimatePresence>
        {takeover && (
          <motion.div
            key="proto-takeover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-4"
            style={{ background: "radial-gradient(circle at 50% 35%, #2a0505 0%, #0A0A0F 75%)" }}
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute font-mono text-[10px] text-crisis/50 whitespace-nowrap"
                  style={{ top: `${(i * 7.3 + 4) % 100}%`, left: 0, animation: `vg-news-slide ${6 + (i % 5)}s linear infinite`, animationDelay: `${i * 0.7}s` }}
                >
                  {CLASSIFIED_MSGS[i % CLASSIFIED_MSGS.length]} ··· ÚLTIMA HORA ··· {CLASSIFIED_MSGS[(i + 3) % CLASSIFIED_MSGS.length]}
                </div>
              ))}
            </div>
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="relative max-w-lg w-full p-6 sm:p-8 text-center"
              style={{
                background: "linear-gradient(160deg, rgba(30,6,6,0.96), rgba(10,10,15,0.97))",
                border: "2px solid rgba(255,59,48,0.75)",
                boxShadow: "0 0 80px rgba(255,59,48,0.4), inset 0 0 40px rgba(255,59,48,0.12)",
              }}
            >
              <div className="font-mono text-[10px] tracking-[0.4em] text-crisis/90 uppercase mb-2">Tensión global {Math.round(tension)}/100 · nivel EXTINCIÓN</div>
              <h2 className="font-display text-3xl sm:text-4xl font-black tracking-widest text-crisis" style={{ textShadow: "0 0 30px rgba(255,59,48,0.8)" }}>
                PROTOCOLO ROJO
              </h2>
              <p className="mt-3 text-sm text-soft/90 leading-relaxed">
                El planeta ha cruzado el umbral 90. El hangar pasa a control de guerra: <b className="text-crisis">x2 monedas durante 6 horas</b> para todos los agentes,
                muro de noticias en vivo y una misión global: gana <b>300ⓒ</b> bajo protocolo y la agencia paga <b>+500ⓒ</b> a tu cuenta.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-widest">
                <div className="border border-crisis/40 p-2"><div className="text-crisis text-base font-bold">x2</div>monedas 6h</div>
                <div className="border border-crisis/40 p-2"><div className="text-crisis text-base font-bold">300ⓒ</div>objetivo global</div>
                <div className="border border-crisis/40 p-2"><div className="text-crisis text-base font-bold">+500ⓒ</div>recompensa única</div>
              </div>
              <button
                onClick={assume}
                className="mt-5 w-full py-3 font-display font-black tracking-[0.3em] text-white uppercase text-sm vg-transition"
                style={{ background: "linear-gradient(90deg, #FF3B30, #8a0f0f)", boxShadow: "0 0 30px rgba(255,59,48,0.55)" }}
              >
                Asumir el mando
              </button>
              <button
                onClick={() => setTakeover(false)}
                className="mt-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest hover:text-foreground vg-transition"
              >
                atender luego (el mundo no espera)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ClassifiedToastText(): string {
  const msg = CLASSIFIED_MSGS[msgIdx.current % CLASSIFIED_MSGS.length];
  msgIdx.current += 1;
  return `📡 ${msg}`;
}
