"use client";

// v74.0 GRAN OCASO — CIELO REUTILIZABLE: capa absoluta con estrellas titilantes,
// luna llena con halo y horizonte de brasa. Se coloca DETRÁS de los globos
// (globe.gl usa fondo transparente) y detrás de las arenas de juego.
// CSS puro: cero canvas, cero allocations, 60fps móvil garantizado.

export function CieloOcaso({
  luna = true,
  className = "",
}: {
  /** mostrar la luna llena en la esquina */
  luna?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`cielo-ocaso estrellas-v74 pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {luna && (
        <div
          className="absolute right-[8%] top-[10%]"
          style={{ width: 26, height: 26 }}
        >
          <div className="luna-v74 h-full w-full" />
          {/* halo de luna */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 84,
              height: 84,
              background:
                "radial-gradient(circle, rgba(255,246,224,0.18) 0%, rgba(255,246,224,0.05) 45%, transparent 70%)",
            }}
          />
        </div>
      )}
      {/* horizonte encendido abajo */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "linear-gradient(to top, rgba(255,122,46,0.14) 0%, transparent 100%)",
        }}
      />
      {/* silueta de ciudad lejana */}
      <div
        className="absolute inset-x-0 bottom-0 h-10 opacity-60"
        style={{
          background:
            "linear-gradient(to top, rgba(4,4,8,0.9) 55%, transparent 100%)",
          maskImage:
            "repeating-linear-gradient(90deg, black 0 14px, transparent 14px 22px, black 22px 34px, black 42px 58px, transparent 58px 64px)",
          WebkitMaskImage:
            "repeating-linear-gradient(90deg, black 0 14px, transparent 14px 22px, black 22px 34px, black 42px 58px, transparent 58px 64px)",
        }}
      />
    </div>
  );
}
