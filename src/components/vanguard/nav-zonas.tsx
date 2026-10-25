"use client";

// ============================================================
// v173.0 — NAVBAR DE ZONAS, TRASPLANTADA DEL UNIVERSO
// Antes vivía dentro de mundo-webgl.tsx y servía de doble fila:
// 4 zonas del mundo 3D + botón MUNDO. Con el universo retirado,
// queda lo que la consola plana siempre usó: 4 accesos rápidos
// (HOY · ANÁLISIS · ARENA · CUARTEL) con las mismas clases CSS
// (vg140-nav) para no romper un solo pixel de la casa.
// ============================================================

const NOMBRES: Record<number, string> = { 1: "HOY", 2: "ANÁLISIS", 3: "ARENA", 4: "CUARTEL" };

const ICONOS: Record<number, React.ReactNode> = {
  1: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  2: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 17l5-6 4 3 5-8 4 5" />
    </svg>
  ),
  3: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  ),
  4: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5z" />
      <path d="M12 22V12" />
    </svg>
  ),
};

export function NavZonas({ activa, onIr }: { activa: number; onIr: (z: number) => void }) {
  return (
    <nav className="vg140-nav" aria-label="Zonas de VANGUARD">
      {[1, 2, 3, 4].map((z) => (
        <button
          key={z}
          type="button"
          className="vg140-nav-btn"
          data-activa={activa === z ? "1" : "0"}
          onClick={() => onIr(z)}
          aria-label={`Ir a ${NOMBRES[z]}`}
        >
          {ICONOS[z]}
          <span>{NOMBRES[z]}</span>
        </button>
      ))}
    </nav>
  );
}
