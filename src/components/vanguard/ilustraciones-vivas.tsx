"use client";

// ============================================================
// v121.0 LA CAMA MÁS CÓMODA — ILUSTRACIONES VIVAS
// "haz como imágenes e ilustraciones, funcionalas entre dos":
// una batería de ilustraciones PROCEDURALES (SVG dibujado a
// código, cero archivos de imagen) que son FUNCIONALES: respiran
// con la hora real del aparato, reaccionan a la sala y viven
// ENTRE los bloques de la casa (divisores, héroes, estados
// vacíos). Animación solo transform/opacity (60 FPS).
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type TipoIlustracion =
  | "globo"      // globo con meridianos girando y satélite en órbita
  | "satelite"   // satélite cruzando su órbita punteada
  | "ciudad"     // mini-skyline con ventanas que parpadean + sol/luna real
  | "antena"     // antena emitiendo ondas de radio
  | "cohete"     // cohete con llama encendida
  | "cama"       // LA CAMA: cama lunar con estrellas y Zzz flotando
  | "prensa";    // micrófono con ondas (la Redacción)

interface IlustracionVivaProps {
  tipo: TipoIlustracion;
  className?: string;
  /** ancho en px (el SVG escala solo, viewBox 120x80) */
  ancho?: number;
  /** tono del trazo (por defecto var(--vg-acento)) */
  tono?: string;
}

/** ¿Noche en el aparato del visitante? (la ilustración ciudad/cama respira con él).
 *  SSR-safe: primer render nocturno neutro; el reloj real llega por rAF
 *  (nunca setState síncrono dentro del efecto — contrato del linter). */
function useEsNoche() {
  const [noche, setNoche] = useState(true);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const h = new Date().getHours();
      setNoche(h >= 20 || h < 6);
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return noche;
}

export function IlustracionViva({ tipo, className, ancho = 120, tono }: IlustracionVivaProps) {
  const noche = useEsNoche();
  const t = tono ?? "var(--vg-acento, #FFC94D)";
  const id = useMemo(() => `iv-${tipo}-${Math.random().toString(36).slice(2, 7)}`, [tipo]);

  return (
    <svg
      viewBox="0 0 120 80"
      width={ancho}
      height={Math.round((ancho * 80) / 120)}
      className={cn("iv-ilustracion shrink-0", className)}
      role="img"
      aria-label={`Ilustración viva: ${tipo}`}
    >
      {tipo === "globo" && (
        <g>
          <circle cx="60" cy="42" r="26" fill="none" stroke={t} strokeWidth="1.6" className="iv-giro-eje" />
          <ellipse cx="60" cy="42" rx="10" ry="26" fill="none" stroke={t} strokeWidth="1" opacity="0.7" className="iv-latido-soft" />
          <ellipse cx="60" cy="42" rx="19" ry="26" fill="none" stroke={t} strokeWidth="0.8" opacity="0.45" />
          <line x1="34" y1="42" x2="86" y2="42" stroke={t} strokeWidth="0.8" opacity="0.45" />
          <path d="M36 32 Q60 26 84 32" fill="none" stroke={t} strokeWidth="0.8" opacity="0.45" />
          <path d="M36 52 Q60 58 84 52" fill="none" stroke={t} strokeWidth="0.8" opacity="0.45" />
          {/* satélite en órbita */}
          <g className="iv-orbita">
            <circle cx="96" cy="42" r="3" fill={t} />
            <line x1="93" y1="42" x2="99" y2="42" stroke={t} strokeWidth="1.2" />
          </g>
          <ellipse cx="60" cy="42" rx="36" ry="12" fill="none" stroke={t} strokeWidth="0.6" strokeDasharray="3 4" opacity="0.5" />
        </g>
      )}

      {tipo === "satelite" && (
        <g>
          <path d="M10 58 Q60 6 110 58" fill="none" stroke={t} strokeWidth="0.8" strokeDasharray="4 5" opacity="0.55" />
          <g className="iv-cruce">
            <g transform="translate(0,-6)">
              <rect x="52" y="36" width="16" height="10" rx="2" fill="none" stroke={t} strokeWidth="1.4" />
              <rect x="40" y="38" width="10" height="6" rx="1" fill={t} opacity="0.85" />
              <rect x="70" y="38" width="10" height="6" rx="1" fill={t} opacity="0.85" />
              <line x1="60" y1="46" x2="60" y2="52" stroke={t} strokeWidth="1.2" />
              <circle cx="60" cy="53.5" r="1.8" fill={t} className="iv-parpadeo" />
            </g>
          </g>
          <circle cx="14" cy="62" r="1.4" fill={t} opacity="0.7" className="iv-parpadeo" />
          <circle cx="104" cy="20" r="1.4" fill={t} opacity="0.7" className="iv-parpadeo iv-delay" />
        </g>
      )}

      {tipo === "ciudad" && (
        <g>
          {noche ? (
            <g>
              <circle cx="100" cy="16" r="8" fill={t} opacity="0.9" />
              <circle cx="97" cy="14" r="8" fill="#0B0B12" opacity="0.85" />
              <circle cx="30" cy="14" r="1.1" fill={t} className="iv-parpadeo" />
              <circle cx="44" cy="9" r="1.1" fill={t} className="iv-parpadeo iv-delay" />
              <circle cx="18" cy="20" r="1.1" fill={t} className="iv-parpadeo" />
            </g>
          ) : (
            <g>
              <circle cx="100" cy="16" r="7" fill={t} className="iv-latido-soft" />
              {[0, 1, 2].map((i) => (
                <line key={i} x1={110 + i * 4} y1="16" x2={114 + i * 4} y2="16" stroke={t} strokeWidth="1.2" strokeLinecap="round" className="iv-onda" style={{ animationDelay: `${i * 0.45}s` }} />
              ))}
            </g>
          )}
          {/* skyline */}
          <g stroke={t} strokeWidth="1.3" fill="none">
            <rect x="16" y="40" width="14" height="30" />
            <rect x="34" y="30" width="16" height="40" />
            <rect x="54" y="46" width="12" height="24" />
            <rect x="70" y="24" width="16" height="46" />
            <rect x="90" y="38" width="12" height="32" />
          </g>
          <line x1="6" y1="70" x2="114" y2="70" stroke={t} strokeWidth="1.6" />
          {/* ventanas que respiran */}
          <g fill={t}>
            {[[38, 36], [44, 42], [38, 48], [74, 30], [80, 36], [74, 42], [20, 46], [26, 52], [94, 44]].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="3" height="3" className="iv-ventana" style={{ animationDelay: `${(i % 5) * 0.6}s` }} />
            ))}
          </g>
        </g>
      )}

      {tipo === "antena" && (
        <g>
          <line x1="46" y1="66" x2="60" y2="26" stroke={t} strokeWidth="1.6" strokeLinecap="round" />
          <line x1="74" y1="66" x2="60" y2="26" stroke={t} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="60" cy="24" r="4" fill={t} className="iv-latido-soft" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${50 - i * 8} ${18 - i * 4} Q60 ${6 - i * 2} ${70 + i * 8} ${18 - i * 4}`} fill="none" stroke={t} strokeWidth="1.2" strokeLinecap="round" className="iv-onda" style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
          <line x1="30" y1="70" x2="90" y2="70" stroke={t} strokeWidth="1.4" />
        </g>
      )}

      {tipo === "cohete" && (
        <g>
          <g className="iv-flote">
            <path d="M60 14 Q70 30 68 48 L52 48 Q50 30 60 14 Z" fill="none" stroke={t} strokeWidth="1.6" />
            <circle cx="60" cy="32" r="4.5" fill="none" stroke={t} strokeWidth="1.2" className="iv-parpadeo" />
            <path d="M52 48 L44 60 L54 54" fill={t} opacity="0.75" />
            <path d="M68 48 L76 60 L66 54" fill={t} opacity="0.75" />
            <g className="iv-llama">
              <path d="M56 50 Q60 62 64 50 Q60 56 56 50 Z" fill={t} />
            </g>
          </g>
          <circle cx="20" cy="20" r="1.2" fill={t} className="iv-parpadeo" />
          <circle cx="100" cy="30" r="1.2" fill={t} className="iv-parpadeo iv-delay" />
          <circle cx="30" cy="62" r="1.2" fill={t} className="iv-parpadeo" />
        </g>
      )}

      {tipo === "cama" && (
        <g>
          {/* luna y estrellas */}
          <circle cx="98" cy="14" r="7" fill={t} opacity="0.9" />
          <circle cx="95" cy="12" r="7" fill="#0B0B12" opacity="0.85" />
          <circle cx="22" cy="12" r="1.2" fill={t} className="iv-parpadeo" />
          <circle cx="40" cy="8" r="1.2" fill={t} className="iv-parpadeo iv-delay" />
          {/* LA CAMA */}
          <g stroke={t} strokeWidth="1.5" fill="none">
            <path d="M20 58 L20 46 Q20 42 24 42 L84 42 Q88 42 88 46 L88 58" />
            <rect x="14" y="52" width="80" height="10" rx="3" />
            <path d="M28 42 L28 34 Q28 30 32 30 L40 30 Q44 30 44 34 L44 42" />
          </g>
          <rect x="46" y="46" width="36" height="6" rx="3" fill={t} opacity="0.55" className="iv-latido-soft" />
          {/* Zzz flotando */}
          <g fill={t} className="iv-zzz">
            <text x="92" y="46" fontSize="9" fontFamily="monospace" fontWeight="bold">z</text>
            <text x="100" y="38" fontSize="7" fontFamily="monospace" fontWeight="bold">z</text>
          </g>
          <line x1="8" y1="68" x2="112" y2="68" stroke={t} strokeWidth="1.4" />
        </g>
      )}

      {tipo === "prensa" && (
        <g>
          <rect x="52" y="20" width="16" height="26" rx="8" fill="none" stroke={t} strokeWidth="1.6" />
          <line x1="60" y1="46" x2="60" y2="56" stroke={t} strokeWidth="1.6" />
          <path d="M48 56 Q60 66 72 56" fill="none" stroke={t} strokeWidth="1.6" strokeLinecap="round" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${44 - i * 7} ${28 + i * 2} Q40 ${34 + i * 2} ${44 - i * 7} ${40 + i * 2}`} fill="none" stroke={t} strokeWidth="1.1" strokeLinecap="round" className="iv-onda" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
          {[0, 1, 2].map((i) => (
            <path key={`d${i}`} d={`M${76 + i * 7} ${28 + i * 2} Q80 ${34 + i * 2} ${76 + i * 7} ${40 + i * 2}`} fill="none" stroke={t} strokeWidth="1.1" strokeLinecap="round" className="iv-onda" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
        </g>
      )}

      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={t} stopOpacity="0" />
          <stop offset="50%" stopColor={t} stopOpacity="1" />
          <stop offset="100%" stopColor={t} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** FRANJA ILUSTRADA: divisoria funcional ENTRE bloques de la casa —
 *  tres ilustraciones vivas + la hora real del visitante. "Funciónalas
 *  entre dos": este es el cinturón que ata la portada. */
export function FranjaIlustrada({ titulo }: { titulo?: string }) {
  const hora = useHoraViva();
  return (
    <div className="hud-panel px-4 py-3 my-6 flex items-center justify-between gap-3 overflow-hidden" aria-hidden>
      <div className="flex items-center gap-4 min-w-0">
        <IlustracionViva tipo="satelite" ancho={78} />
        <IlustracionViva tipo="globo" ancho={86} className="hidden sm:block" />
        <IlustracionViva tipo="ciudad" ancho={96} className="hidden md:block" />
      </div>
      <div className="text-right shrink-0">
        {titulo && <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">{titulo}</p>}
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--vg-acento, #FFC94D)" }}>
          {hora}
        </p>
        <p className="font-mono text-[9px] text-muted-foreground">TU HORA · EL PLANETA GIRA</p>
      </div>
    </div>
  );
}

/** Hora viva (1 Hz, formateada al idioma del aparato). */
function useHoraViva() {
  const [hora, setHora] = useState("--:--");
  useEffect(() => {
    const tick = () => setHora(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return hora;
}
