"use client";

// ============================================================
// v134.0 EL ESTRENO — EL TRÁILER DE VANGUARD
// Orden del Dueño: «agrega una intro a Vanguard tipo tráiler
// cuando está cargando». El estreno de la Casa: 4.6 segundos de
// cine (emblema → nombre → tres destellos de salas → bienvenida)
// con barra de progreso, botón SALTAR siempre a la vista y una
// sola proyección por sesión (el visitante recurrente entra
// directo — la retención no se toca).
// Contrato 60 FPS: solo transform/opacity. Reduced-motion: no
// hay estreno. SSR-safe: nada se pinta hasta el montaje.
// ============================================================
import { useEffect, useState } from "react";
import { APP_VERSION_LABEL } from "@/lib/version";
import { useGameStore } from "@/lib/game-store";

const CLAVE_SESION = "vg-intro-v134";
const DURACION_MS = 4800;

export function IntroTrailer() {
  const [montado, setMontado] = useState(false);
  const [enPantalla, setEnPantalla] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const muted = useGameStore((s) => s.muted);

  useEffect(() => setMontado(true), []);

  useEffect(() => {
    if (!montado) return;
    // reduced-motion: el cine no es para todos los aparatos — entrar directo
    let reducido = false;
    try { reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* sin media query */ }
    let visto = false;
    try { visto = sessionStorage.getItem(CLAVE_SESION) === "1"; } catch { /* sin sesión */ }
    if (reducido || visto) return;
    setEnPantalla(true);
    try { sessionStorage.setItem(CLAVE_SESION, "1"); } catch { /* sin sesión: se repite, no se rompe */ }
    // la campana del estreno (los navegadores pueden callarla sin gesto: la casa no se queja)
    if (!muted) {
      import("@/lib/sound").then(({ sfx }) => { try { sfx.campana(); } catch { /* el salón calla */ } });
    }
    const t = setTimeout(() => setSaliendo(true), DURACION_MS - 600);
    const t2 = setTimeout(() => setEnPantalla(false), DURACION_MS);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [montado, muted]);

  const saltar = () => {
    setSaliendo(true);
    setTimeout(() => setEnPantalla(false), 420);
  };

  if (!montado || !enPantalla) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden v134-intro-bg"
      style={{ opacity: saliendo ? 0 : 1, transition: "opacity 560ms ease", pointerEvents: saliendo ? "none" : "auto" }}
      aria-label="El estreno de Vanguard"
      role="dialog"
    >
      {/* la bóveda: dos capas de respiración dorada */}
      <div className="absolute inset-0 v134-intro-velo" aria-hidden />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full v134-intro-pulso" aria-hidden
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.05) 38%, transparent 68%)" }} />

      {/* SALTAR — siempre a la vista, como debe ser el cine de la casa */}
      <button
        onClick={saltar}
        className="absolute top-4 right-4 z-10 rounded-sm border px-3 py-1.5 font-mono text-[10px] tracking-[0.3em] uppercase transition-opacity hover:opacity-100"
        style={{ borderColor: "rgba(212,175,55,0.45)", color: "#D4AF37", background: "rgba(0,0,0,0.4)", opacity: 0.75 }}
      >
        SALTAR ▸
      </button>

      {/* LA PROYECCIÓN */}
      <div className="relative flex flex-col items-center px-6 text-center">
        {/* el emblema: el ojo de la Casa se abre */}
        <svg viewBox="0 0 64 64" className="w-16 h-16 sm:w-20 sm:h-20 v134-intro-emblema" aria-hidden>
          <defs>
            <linearGradient id="intro-oro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffe08a" />
              <stop offset="45%" stopColor="#f5c542" />
              <stop offset="100%" stopColor="#c98a10" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="33" r="17.5" fill="#0e0a04" stroke="url(#intro-oro)" strokeWidth="2" />
          <ellipse cx="32" cy="33" rx="8.2" ry="17.5" fill="none" stroke="url(#intro-oro)" strokeWidth="1.4" opacity="0.8" />
          <path d="M14.5 33 H49.5" stroke="url(#intro-oro)" strokeWidth="1.4" opacity="0.8" />
          <path d="M20.5 33 Q32 24.5 43.5 33 Q32 41.5 20.5 33 Z" fill="#0d0304" stroke="#f5c542" strokeWidth="1.8" />
          <circle cx="32" cy="33" r="6.2" fill="url(#intro-oro)" />
          <circle cx="32" cy="33" r="2.6" fill="#050001" />
          <circle cx="29.9" cy="30.9" r="1.2" fill="#fff6e0" opacity="0.95" />
          <path d="M32 2.6 L33.4 7.8 L38.4 6.2 L35.2 10.3 L38.4 14.4 L33.4 12.8 L32 18 L30.6 12.8 L25.6 14.4 L28.8 10.3 L25.6 6.2 L30.6 7.8 Z" fill="url(#intro-oro)" />
        </svg>

        {/* el nombre: las letras entran una a una */}
        <h1 className="mt-5 font-caviar font-bold uppercase leading-none flex" style={{ letterSpacing: "0.18em" }}>
          {"VANGUARD".split("").map((ch, i) => (
            <span key={i} className="v134-intro-letra inline-block text-3xl sm:text-5xl" style={{ color: "#F5E7C8", textShadow: "0 0 18px rgba(212,175,55,0.55), 0 2px 12px rgba(0,0,0,0.8)", animationDelay: `${0.5 + i * 0.09}s` }}>
              {ch}
            </span>
          ))}
        </h1>

        <p className="mt-3 font-mono text-[9px] sm:text-[10px] tracking-[0.34em] uppercase v134-intro-sub" style={{ color: "rgba(245,231,200,0.65)", animationDelay: "1.5s" }}>
          {APP_VERSION_LABEL}
        </p>

        {/* los tres destellos: EL MUNDO · LA INTELIGENCIA · EL TIEMPO */}
        <div className="mt-7 flex items-center justify-center gap-5 sm:gap-8">
          {([
            { tipo: "globo", frase: "EL MUNDO" },
            { tipo: "ciudad", frase: "LA INTELIGENCIA" },
            { tipo: "cohete", frase: "EL TIEMPO" },
          ] as const).map((esc, i) => (
            <div key={esc.tipo} className="v134-intro-escena flex flex-col items-center" style={{ animationDelay: `${2.1 + i * 0.75}s` }}>
              <EscenaEstreno tipo={esc.tipo} />
              <span className="mt-1 font-mono text-[7.5px] sm:text-[8px] tracking-[0.3em]" style={{ color: "rgba(212,175,55,0.85)" }}>
                {esc.frase}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-7 font-caviar text-[11px] sm:text-[13px] tracking-[0.2em] v134-intro-sub" style={{ color: "#F5E7C8", animationDelay: "3.9s" }}>
          BIENVENIDO A LA CASA · ESTÁS DENTRO
        </p>
      </div>

      {/* la barra de progreso del estreno */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[42%] max-w-[300px] h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(212,175,55,0.16)" }} aria-hidden>
        <div className="h-full v134-intro-progreso" style={{ background: "linear-gradient(90deg, #8a6410, #D4AF37, #ffe08a)" }} />
      </div>
    </div>
  );
}

/** las tres escenas del estreno — SVG inline mínimo (sin hidratación rara) */
function EscenaEstreno({ tipo }: { tipo: "globo" | "ciudad" | "cohete" }) {
  const oro = "#D4AF37";
  if (tipo === "globo") {
    return (
      <svg viewBox="0 0 60 44" width="66" height="48" className="v134-intro-ken" aria-hidden>
        <circle cx="30" cy="22" r="14" fill="none" stroke={oro} strokeWidth="1.4" opacity="0.9" />
        <ellipse cx="30" cy="22" rx="5.6" ry="14" fill="none" stroke={oro} strokeWidth="0.6" opacity="0.6" />
        <path d="M17 18 H43 M17 26 H43" stroke={oro} strokeWidth="0.6" opacity="0.5" />
        <path d="M22 16 Q27 12 32 15 Q36 17 33 21 Q28 24 23 22 Z" fill={oro} opacity="0.35" />
        <ellipse cx="30" cy="22" rx="21" ry="6.5" fill="none" stroke={oro} strokeWidth="0.5" strokeDasharray="1.5 3" opacity="0.55" transform="rotate(-16 30 22)" />
        <circle cx="46" cy="14" r="1.6" fill={oro} />
      </svg>
    );
  }
  if (tipo === "ciudad") {
    return (
      <svg viewBox="0 0 60 44" width="66" height="48" className="v134-intro-ken" aria-hidden>
        <circle cx="50" cy="9" r="3.4" fill="#FFF3D0" />
        {[5, 13, 21, 29, 37, 45].map((x, i) => (
          <rect key={x} x={x} y={16 + (i % 3) * 4} width="6" height={28 - (i % 3) * 4} fill="none" stroke={oro} strokeWidth="0.9" opacity="0.85" />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={6.5 + i * 8} y={20 + (i % 3) * 4} width="1.2" height="1.6" fill="#FFD98A" opacity="0.85" />
        ))}
        <line x1="0" y1="44" x2="60" y2="44" stroke={oro} strokeWidth="0.8" opacity="0.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 60 44" width="66" height="48" className="v134-intro-ken" aria-hidden>
      <path d="M30 6 Q35 14 35 26 L25 26 Q25 14 30 6 Z" fill="none" stroke={oro} strokeWidth="1.3" />
      <circle cx="30" cy="18" r="2.6" fill="none" stroke={oro} strokeWidth="1" />
      <path d="M25 26 L19 38 L25 34 Z M35 26 L41 38 L35 34 Z" fill={oro} opacity="0.7" />
      <path d="M30 30 Q33 36 30 42 Q27 36 30 30 Z" fill="#FFB84D" />
      <path d="M14 20 h-6 M46 24 h6" stroke={oro} strokeWidth="0.9" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
}
