import type { Metadata } from "next";
import { BotonReintentar } from "./boton-reintentar";

// v210.0 EL REFUGIO — la sala de emergencia. Vive en el service worker:
// si el visitante pierde la conexión (señal lenta, avión, corte del barrio),
// el refugio responde aunque la red no exista, con la verdad por delante
// («no hay conexión») y una salida honesta (REINTENTAR). No es una copia
// guardada de la portada — la ley v125 manda ver SIEMPRE la versión nueva
// del HTML, así que las navegaciones jamás se cachean: este refugio es la
// única página que el worker guarda, y solo para el caso sin red.

export const metadata: Metadata = {
  title: "Sin conexión | VANGUARD",
  robots: { index: false, follow: false },
};

export default function FueraDeLinea() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
          ◉ VANGUARD · REFUGIO
        </p>
        <h1 className="mt-4 text-2xl font-bold text-zinc-100">
          No hay conexión
        </h1>
        <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
          La Casa no puede llegar hasta aquí: tu aparato no tiene red en este
          momento (o la señal es tan débil que el pedido se perdió). Nada se
          rompió del lado del servidor — cuando la conexión vuelva, la portada
          en vivo aparece al instante con la versión más nueva.
        </p>
        <BotonReintentar />
        <p className="mt-6 font-mono text-[10px] text-zinc-600 uppercase tracking-wider">
          El refugio responde sin red · la Casa espera tu regreso
        </p>
      </div>
    </main>
  );
}
