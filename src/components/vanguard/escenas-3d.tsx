"use client";

// ============================================================
// v198.0 LA CASA LIGERA — EL PORTAL DE LAS ESCENAS 3D
// Este archivo es la FIRMA pública del motor: el tipo, los helpers
// puros (hashDe/escenaDePanel), el sello EN VIVO y el componente
// Escena3D como PORTAL. El motor real (600 líneas de escenas SVG/CSS3D,
// megalópolis incluida) vive en ./escenas-3d-real y baja como chunk
// APARTE la primera vez que una escena aparece — la portada ya no
// arrastra el motor entero al arranque.
//   · Mismo contrato para los 8 consumidores: nada cambia en nadie.
//   · Mientras el motor llega, la escena muestra un lecho holo fiel
//     (mismo marco, mismas esquinas, acento y suelo) — nunca un hueco.
// ============================================================

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type VarianteEscena =
  | "orbita" | "noticias" | "red" | "radar" | "guerra" | "moneda"
  | "diana" | "archivo" | "libro" | "nucleo" | "onda" | "camaras"
  | "hangar" | "ciudad" | "prisma";

// ---------- azar determinista (misma escena en cada render) ----------
export function hashDe(txt: string): number {
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// ---------- SELLO VIVO: reloj real latiendo (tiempo real visible) ----------
export function SelloVivo({ acento = "#5EEAD4", etiqueta = "EN VIVO", className }: { acento?: string; etiqueta?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tick = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      el.textContent = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
    };
    tick();
    const iv = window.setInterval(tick, 1000);
    return () => window.clearInterval(iv);
  }, []);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] tracking-widest backdrop-blur-sm", className)}
      style={{ background: "rgba(0,0,0,0.45)", border: `1px solid ${acento}55`, color: acento }}>
      <span className="v110-latido inline-block w-1.5 h-1.5 rounded-full" style={{ background: acento, boxShadow: `0 0 8px ${acento}` }} />
      {etiqueta}
      <span ref={ref} className="opacity-90 tabular-nums" />
    </span>
  );
}

type MotorReal = typeof import("./escenas-3d-real");
let motorCache: MotorReal | null = null;

/**
 * EL MOTOR REAL — baja como chunk aparte SOLO cuando la primera escena
 * pinta. Una vez en memoria (motorCache), las siguientes escenas son
 * instantáneas. El lecho holo cubre el mismo espacio mientras llega.
 */
function useMotorReal(): MotorReal | null {
  const [motor, setMotor] = useState<MotorReal | null>(motorCache);
  useEffect(() => {
    if (motorCache) return;
    let vivo = true;
    import("./escenas-3d-real")
      .then((m) => { motorCache = m; if (vivo) setMotor(m); })
      .catch(() => { /* sin motor el lecho sigue de pie: la casa no se rompe */ });
    return () => { vivo = false; };
  }, []);
  return motor;
}

/** Lecho fiel mientras el motor real baja: suelo holo + esquinas HUD. */
function LechoHolo({ acento }: { acento: string }) {
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="v110-suelo absolute inset-x-[-20%] bottom-[-32%] h-[62%]" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 120%, ${acento}33 0%, transparent 62%)` }} />
      <div className="v110-scanline absolute inset-x-0 top-0 h-10" />
      <div className="absolute inset-0 pointer-events-none z-20">
        <span className="absolute top-1.5 left-1.5 w-4 h-4 opacity-80 border-t border-l" style={{ borderColor: acento }} />
        <span className="absolute top-1.5 right-1.5 w-4 h-4 opacity-80 border-t border-r" style={{ borderColor: acento }} />
        <span className="absolute bottom-1.5 left-1.5 w-4 h-4 opacity-80 border-b border-l" style={{ borderColor: acento }} />
        <span className="absolute bottom-1.5 right-1.5 w-4 h-4 opacity-80 border-b border-r" style={{ borderColor: acento }} />
      </div>
    </div>
  );
}

export function Escena3D({
  variante, acento = "#FF8A2A", semilla = 7, className, estilo, hijos, estatico,
}: {
  variante: VarianteEscena;
  acento?: string;
  semilla?: number;
  className?: string;
  estilo?: CSSProperties;
  hijos?: ReactNode;
  /** v111: tarjetas diminutas — sin tilt ni rAF (cero coste, 60 FPS garantizado) */
  estatico?: boolean;
}) {
  const motor = useMotorReal();
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ ...estilo, ["--vg-acc" as string]: acento }}>
      {motor ? (
        <motor.Escena3DReal
          variante={variante}
          acento={acento}
          semilla={semilla}
          className="absolute inset-0"
          hijos={hijos}
          estatico={estatico}
        />
      ) : (
        <LechoHolo acento={acento} />
      )}
    </div>
  );
}

// ============================================================
// MAPA PANEL → VARIANTE (los 130 mundos de la casa + extras)
// ============================================================
const GRUPOS: Record<VarianteEscena, string[]> = {
  noticias: ["noticias", "redaccion", "briefing", "briefings", "canalbrief", "envivo", "verdades", "verifica", "ayuda", "registro"],
  orbita: ["mapa", "maps", "conquistas3d", "geoint", "planeta", "cielos", "tierra", "sismo", "pulso", "pulsos", "centinela", "espectro", "monitorglobal", "ojodios", "observatorio", "rostros"],
  guerra: ["salaguerra", "operaciones", "estrategia", "frentes", "evaluacion", "mundo", "warsim", "combate", "frente", "crisis", "dronguerra", "edad", "imperio", "sala18", "incidentes", "abusos", "memorial", "muertes", "perdidas"],
  red: ["multijugador", "foryou", "contribuidores", "memes", "creador", "obras", "foros", "amigos", "notificaciones", "enclaves", "extranjera", "grafo"],
  radar: ["osint", "radar"],
  moneda: ["hacienda", "divisas", "bookmaker", "apuestas", "predicciones", "pronosticos", "mercados", "bolsa", "bolsamonedas", "gancho", "empleos"],
  diana: ["misiones", "retos", "logros", "recompensas", "racha", "arcade", "minijuego", "quiz", "torneos", "ranking"],
  archivo: ["espionaje", "carteles", "oscura", "detective", "expedientes"],
  libro: ["biblioteca", "enciclopedia", "epocas", "historia", "wikiguerra"],
  nucleo: ["agente", "agenteia", "mente", "consejoia", "analista", "curiosidades", "simulador", "taller", "mapascrea", "studios", "laboratorio", "fusion", "espejo", "maquina", "perfil", "ciber", "agentes"],
  onda: ["estudio", "videos", "pantalla", "canales", "directos", "imagenes", "galeria", "telegram"],
  camaras: ["camaras"],
  hangar: ["hangar", "armeria", "fortaleza"],
  ciudad: ["gobierno", "mipais", "alianzas", "tribunal", "embajadores", "estadisticas"],
  prisma: [],
};

const PANEL_A_ESCENA: Map<string, VarianteEscena> = (() => {
  const m = new Map<string, VarianteEscena>();
  (Object.keys(GRUPOS) as VarianteEscena[]).forEach((v) => GRUPOS[v].forEach((p) => m.set(p, v)));
  return m;
})();

export function escenaDePanel(panel: string): VarianteEscena {
  return PANEL_A_ESCENA.get(panel) ?? "prisma";
}
