import type { Metadata } from "next";
import Link from "next/link";
import { Censo100Visor } from "@/components/vanguard/motores/Censo100Visor";
import { Cabecera, BarraMovil } from "@/components/portada/cabecera";
import { Pie } from "@/components/portada/pie";

export const metadata: Metadata = {
  title: "Censo de las 100 Plataformas Globales · Vanguard",
  description:
    "Directorio exhaustivo y comparativo de las 100 plataformas líderes en inteligencia militar, OSINT, macroeconomía, predicción y telemetría espacial.",
};

export default function PaginaCenso() {
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100">
      <Cabecera ruta="/motores" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-purple-500/20 pb-4">
          <Link href="/motores" className="font-mono text-xs text-purple-400 hover:underline">
            ← Volver a Motores & Algoritmos
          </Link>
          <h1 className="mt-2 text-3xl font-black text-zinc-100">
            Censo de las 100 Plataformas de Referencia
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Mapeo taxonómico de los 100 sistemas globales líderes clasificados en 8 dimensiones operacionales.
          </p>
        </div>

        <Censo100Visor />
      </main>

      <Pie />
      <BarraMovil ruta="/motores" />
    </div>
  );
}
