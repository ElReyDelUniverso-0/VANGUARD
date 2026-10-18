"use client";

// ============================================================
// v135.0 NEXUS-HYPNOS — ENJAMBRE DE OJOS (OJO DE DIOS 3D)
// "El Feed Ojo de Dios": una esfera de micro-pantallas flotantes
// orbitando en el espacio 3D de la sala VISTA DIOS. Cada pantalla
// es una transmisión de la propia Casa (feed del Mundo de Guerra,
// cables OSINT reales, directos observados) — cero enlaces
// externos, todo nace y muere dentro de Vanguard.
//   · las pantallas flotan en 3 anillos orbitales (CSS puro,
//     solo transform/opacity = 60 FPS)
//   · al POSAR el cursor: la pantalla se agranda, el enjambre se
//     congela y suena un BLIP DE INTERCEPCIÓN ESPACIALIZADO
//     (el pitido nace del lado del oído donde vive la pantalla,
//     StereoPanner del Web Audio — sin ficheros, sin derechos)
//   · debajo, la TRANSCRIPCIÓN DE INTERCEPCIÓN SATELITAL se
//     descifra letra a letra
// Respeta prefers-reduced-motion: el enjambre queda estático.
// ============================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TransmisionOjo {
  id: string;
  /** titular corto de la micro-pantalla */
  titulo: string;
  /** cuerpo completo para la transcripción */
  cuerpo: string;
  /** etiqueta de origen (SALA · canal · fuente) */
  origen: string;
  /** color de acento del borde */
  color: string;
}

let audioOjo: AudioContext | null = null;

/** blip de intercepción espacializado: nace del oído del lado de la pantalla */
function blipIntercepcion(pan: number) {
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioOjo) audioOjo = new Ctor();
    const ctx = audioOjo;
    void ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(880 + Math.random() * 500, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.16);
    const gan = ctx.createGain();
    gan.gain.setValueAtTime(0.0001, t);
    gan.gain.exponentialRampToValueAtTime(0.045, t + 0.02);
    gan.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    const panNodo = ctx.createStereoPanner();
    panNodo.pan.value = Math.max(-1, Math.min(1, pan));
    osc.connect(gan).connect(panNodo).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.26);
  } catch {
    /* sin audio disponible: el ojo sigue viendo */
  }
}

const ANILLOS = [
  { radio: 150, pantalla: 21, dur: 47, tilt: 8 },
  { radio: 225, pantalla: 19, dur: 68, tilt: -5 },
  { radio: 300, pantalla: 17, dur: 91, tilt: 13 },
];

export function EnjambreOjos({ transmisiones }: { transmisiones: TransmisionOjo[] }) {
  const reduced = useReducedMotion();
  const [activa, setActiva] = useState<TransmisionOjo | null>(null);
  const contenedor = useRef<HTMLDivElement>(null);

  // reparte las transmisiones en los anillos (hasta 15 ojos)
  const ojos = useMemo(() => {
    const lista = transmisiones.slice(0, 15);
    const reparto: { t: TransmisionOjo; anillo: number; angulo: number; x: number; y: number }[] = [];
    lista.forEach((t, i) => {
      const a = i % 3;
      const porAnillo = Math.ceil(lista.length / 3);
      const angulo = (i % porAnillo) * (360 / Math.max(1, porAnillo)) + a * 24;
      const y = ((i * 37) % 60) - 30;
      reparto.push({ t, anillo: a, angulo, x: 0, y });
    });
    return reparto;
  }, [transmisiones]);

  // la transcripción se descifra: revelado letra a letra (contador pequeño)
  const [revelado, setRevelado] = useState(0);
  useEffect(() => {
    if (!activa) { setRevelado(0); return; }
    setRevelado(0);
    if (reduced) { setRevelado(activa.cuerpo.length); return; }
    const iv = window.setInterval(() => {
      setRevelado((r) => {
        if (r >= activa.cuerpo.length) { window.clearInterval(iv); return r; }
        return r + 2;
      });
    }, 24);
    return () => window.clearInterval(iv);
  }, [activa, reduced]);

  useEffect(() => () => { try { void audioOjo?.close(); } catch { /* noop */ } }, []);

  const alPosar = (t: TransmisionOjo) => (e: React.MouseEvent) => {
    setActiva(t);
    const rect = contenedor.current?.getBoundingClientRect();
    if (rect) blipIntercepcion(((e.clientX - rect.left) / rect.width) * 2 - 1);
  };

  if (transmisiones.length === 0) return null;

  return (
    <div ref={contenedor} className={cn("hud-corner p-3 relative overflow-hidden", reduced && "v135-enjambre-quieto")}
      onPointerLeave={() => setActiva(null)}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
          <Eye className="w-3 h-3 text-cyan-hud" /> enjambre de ojos · transmisiones interceptadas
        </p>
        <span className="text-[9px] font-mono text-cyan-hud/70 uppercase">{ojos.length} señales en órbita</span>
      </div>

      {/* el escenario 3D — el bloque entero se inclina con el puntero vía --vg-mx/--vg-my (Motor3D) */}
      <div className="relative h-[300px] sm:h-[380px] overflow-hidden rounded-sm bg-[#05070c]"
        style={{ perspective: "1050px" }}>
        <div className="absolute inset-0 v135-nebulosa" aria-hidden />
        <div className="absolute inset-0 flex items-center justify-center v135-escenario"
          style={{ transformStyle: "preserve-3d", transform: "rotateX(calc(var(--vg-my, 0) * -7deg)) rotateY(calc(var(--vg-mx, 0) * 9deg))" }}>
          {/* el corazón del enjambre: el ojo que todo lo ve */}
          <div className="v135-ojo-central" aria-hidden>
            <div className="v135-ojo-iris" />
          </div>
          {ANILLOS.map((an, ai) => (
            <div key={ai} className={cn("absolute", reduced ? "" : ai === 0 ? "v135-orbita-a" : ai === 1 ? "v135-orbita-b" : "v135-orbita-c")}
              style={{ transformStyle: "preserve-3d", width: 0, height: 0 }}>
              {ojos.filter((o) => o.anillo === ai).map(({ t, angulo, y }) => (
                <div key={t.id}
                  className={cn("absolute v135-pantalla", activa?.id === t.id && "v135-pantalla-activa")}
                  onMouseEnter={alPosar(t)}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${angulo}deg) translateZ(${an.radio}px) translateY(${y}px) rotateY(${-angulo * 0.72}deg) rotateX(${an.tilt}deg)`,
                    width: `${an.pantalla * 3}px`,
                    borderColor: t.color,
                    animationDelay: reduced ? undefined : `${(angulo % 90) * -0.05}s`,
                  }}>
                  <div className="flex items-center gap-1 px-1 py-0.5 border-b" style={{ borderColor: `${t.color}55` }}>
                    <span className="w-1 h-1 rounded-full v135-rec" style={{ background: t.color }} />
                    <span className="text-[6px] font-mono uppercase truncate" style={{ color: t.color }}>{t.origen}</span>
                  </div>
                  <p className="px-1 pt-0.5 text-[7px] font-mono leading-tight text-foreground/85 line-clamp-3">{t.titulo}</p>
                  <div className="v135-scanline" aria-hidden />
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* viñeta del búnker */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 42%, rgba(5,7,12,0.92) 100%)" }} aria-hidden />
      </div>

      {/* transcripción de intercepción satelital */}
      <div className={cn("mt-2 border border-cyan-hud/40 bg-black/60 p-2 min-h-[52px] transition-opacity", activa ? "opacity-100" : "opacity-60")}>
        <p className="text-[8px] font-mono uppercase tracking-[0.24em] text-cyan-hud/80 mb-1">
          {activa ? `transcripción de intercepción · ${activa.origen}` : "posa el cursor sobre una pantalla para interceptar su señal"}
        </p>
        {activa ? (
          <p className="text-[10px] font-mono text-foreground/90 leading-snug">
            {activa.cuerpo.slice(0, revelado)}
            {revelado < activa.cuerpo.length && <span className="v135-cursor">▊</span>}
          </p>
        ) : (
          <p className="text-[10px] font-mono text-muted-foreground leading-snug truncate">▊ esperando señal...</p>
        )}
      </div>
    </div>
  );
}
