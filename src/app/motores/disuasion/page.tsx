import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera, BarraMovil } from "@/components/portada/cabecera";
import { Pie } from "@/components/portada/pie";

export const metadata: Metadata = {
  title: "Disuasión & Dinámica Lotka-Volterra · Vanguard",
  description: "Equilibrios dinámicos de disuasión, carreras armamentistas y estabilidad estratégica nuclear.",
};

export default function PaginaDisuasion() {
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100">
      <Cabecera ruta="/motores" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-purple-500/20 pb-4">
          <Link href="/motores" className="font-mono text-xs text-purple-400 hover:underline">
            ← Volver a Motores & Algoritmos
          </Link>
          <h1 className="mt-2 text-3xl font-black text-zinc-100">
            Dinámica de Disuasión & Equilibrio Estratégico
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Sistemas acoplados no lineales inspirados en Lotka-Volterra y Richardson para modelar la acumulación defensiva mutua y las fases críticas de inestabilidad prebélica.
          </p>
        </div>

        <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-6">
          <h2 className="text-xl font-bold text-zinc-100">Ecuaciones de Richardson & Disuasión</h2>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
            El modelo postula que el crecimiento del arsenal del actor A responde a la amenaza percibida del actor B, modulado por la fatiga económica interna:
          </p>
          <div className="my-4 rounded bg-zinc-950 p-4 font-mono text-sm text-purple-300">
            dx/dt = k·y - α·x + g<br />
            dy/dt = l·x - β·y + h
          </div>
          <p className="text-xs text-zinc-400">
            Donde <code>k, l</code> son coeficientes de desconfianza recíproca, <code>α, β</code> son restricciones presupuestarias y <code>g, h</code> representan agravios históricos permanentes.
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/escenarios"
              className="rounded bg-purple-600 px-4 py-2 font-mono text-xs font-bold text-white shadow-lg transition hover:bg-purple-500"
            >
              Simular en el Estratega (/escenarios) →
            </Link>
          </div>
        </div>
      </main>

      <Pie />
      <BarraMovil ruta="/motores" />
    </div>
  );
}
