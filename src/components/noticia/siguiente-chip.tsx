"use client";

// v211.0 EL VÉRTIGO — LA FÓRMULA YOUTUBE de la Casa: el «up next».
// En YouTube nadie termina un video y se queda sentado mirando el techo:
// el siguiente ya está esperando. En la sala de lectura de VANGUARD pasa
// lo contrario: lees el cable, llegas abajo… y el artículo muere en
// silencio. Este chip lo cura: cuando el visitante ya leyó más de la
// mitad de la página, aparece fijo abajo-derecha «SIGUIENTE ▸» con el
// titular del próximo cable (mismo teatro primero — la selección ya la
// hace la server page con la lógica de relacionadas de LA LUPA). Un toque
// y el ROUTER te lleva (ley: la navegación jamás recarga).
// LEY v190: nada se navega solo — el chip NUNCA auto-navega ni cuenta
// atrás: aparece, espera, y la decisión es del lector.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function SiguienteChip({ id, titulo }: { id: string; titulo: string }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alScrollear = () => {
      const doc = document.documentElement;
      const alto = doc.scrollHeight - window.innerHeight;
      const leido = alto > 0 ? window.scrollY / alto : 0;
      setVisible(leido > 0.5);
    };
    alScrollear();
    window.addEventListener("scroll", alScrollear, { passive: true });
    return () => window.removeEventListener("scroll", alScrollear);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-[300px] sm:max-w-[340px]">
      <button
        type="button"
        onClick={() => router.push(`/noticia/${id}`)}
        className="group w-full text-left rounded-md border border-amber-500/50 bg-zinc-950/95 shadow-2xl backdrop-blur px-4 py-3 hover:border-amber-400 transition-colors"
        aria-label={`Siguiente cable: ${titulo}`}
      >
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-amber-400">
          SIGUIENTE ▸
        </span>
        <span className="mt-1 block text-[13px] font-bold leading-snug text-zinc-200 group-hover:text-amber-200 line-clamp-2">
          {titulo}
        </span>
      </button>
    </div>
  );
}
