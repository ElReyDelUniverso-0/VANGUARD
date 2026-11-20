"use client";

// ═══════════════════════════════════════════════════════════════════════
// v431.3 · EL BOTÓN QUE ABRE LA MENTE DESDE CUALQUIER SITIO
//
// La portada es un componente de servidor: no puede escuchar clics. Este
// botón es la única pieza de cliente de la entrada y hace una sola cosa:
// avisar al panel global (montado en el layout) de que abra la conversación.
// Si el panel no está montado (por ejemplo en /vanguard2), no pasa nada.
// ═══════════════════════════════════════════════════════════════════════

export function BotonMente({
  children,
  className,
  mensaje,
}: {
  children: React.ReactNode;
  className?: string;
  /** si viene, la mente abre con esta frase ya escrita */
  mensaje?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        try {
          window.dispatchEvent(new CustomEvent("vg:mente:abrir", { detail: { mensaje } }));
        } catch {
          /* navegador sin CustomEvent: el botón no hace nada, no rompe nada */
        }
      }}
    >
      {children}
    </button>
  );
}
