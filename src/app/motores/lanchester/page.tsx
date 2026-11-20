import type { Metadata } from "next";
import Link from "next/link";
import { SimuladorMotores } from "@/components/vanguard/motores/SimuladorMotores";
import { Cabecera, BarraMovil } from "@/components/portada/cabecera";
import { Pie } from "@/components/portada/pie";

export const metadata: Metadata = {
  title: "Leyes de Combate de Lanchester · Vanguard",
  description: "Simulación determinista de atrición bélica y cálculo de superioridad de fuego lineal y cuadrática.",
};

export default function PaginaLanchester() {
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100">
      <Cabecera ruta="/motores" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-purple-500/20 pb-4">
          <Link href="/motores" className="font-mono text-xs text-purple-400 hover:underline">
            ← Volver a Motores & Algoritmos
          </Link>
          <h1 className="mt-2 text-3xl font-black text-zinc-100">
            Leyes de Combate y Atrición de Lanchester
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Modelos diferenciales formulados por Frederick Lanchester (1916) para evaluar la dinámica de bajas en fuego concentrado.
          </p>
        </div>

        <SimuladorMotores />
      </main>

      <Pie />
      <BarraMovil ruta="/motores" />
    </div>
  );
}
