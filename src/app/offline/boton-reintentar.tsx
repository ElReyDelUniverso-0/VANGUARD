"use client";

// v210.0 EL REFUGIO — el único grano de JavaScript del refugio: el botón
// REINTENTAR. Vive aparte porque /offline es un server component (metadata
// y respuesta estática pura) y el onClick exige cliente. Recarga la sala:
// si la red volvió, la portada en vivo aparece con la versión nueva (ley
// v125); si no, el refugio vuelve a aparecer — sin drama.
export function BotonReintentar() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="mt-8 px-5 py-2.5 rounded-sm bg-amber-400 text-zinc-950 font-mono text-[11px] uppercase tracking-widest font-bold hover:bg-amber-300"
    >
      Reintentar conexión
    </button>
  );
}
