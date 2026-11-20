import type { Metadata } from "next";
import Link from "next/link";
import { SimuladorMotores } from "@/components/vanguard/motores/SimuladorMotores";
import { Censo100Visor } from "@/components/vanguard/motores/Censo100Visor";
import { Cabecera, BarraMovil } from "@/components/portada/cabecera";
import { Pie } from "@/components/portada/pie";

export const metadata: Metadata = {
  title: "Motores & Algoritmos Globales · Vanguard",
  description:
    "Laboratorio analítico interactivo: Leyes de Lanchester, Nelson-Siegel, gravedad geopolítica, Brier Score, escala de escalada Kahn y censo de las 100 plataformas líderes de inteligencia.",
};

export default function PaginaMotores() {
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100">
      <Cabecera ruta="/motores" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Cabecera de Sección */}
        <div className="mb-8 border-b border-purple-500/20 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-purple-500/10 px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-purple-400 border border-purple-500/30">
              VANGUARD LABS · v423.0
            </span>
            <span className="font-mono text-xs text-zinc-500">
              MOTORES MATEMÁTICOS & CENSO GLOBAL
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-100 sm:text-4xl">
            Motores Analíticos & Censo de las 100 Plataformas
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400 sm:text-base">
            Modelos cuantitativos deterministas y comparativa taxonómica con las 100 plataformas
            líderes del mundo en OSINT cinético, telemetría espacial, macroeconomía y predicción de crisis.
          </p>

          {/* Atajos Rápidos */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/motores/censo"
              className="rounded border border-purple-500/40 bg-purple-950/30 px-3 py-1 font-mono text-xs text-purple-300 transition hover:bg-purple-900/40"
            >
              📊 Censo 100 Plataformas
            </Link>
            <Link
              href="/motores/lanchester"
              className="rounded border border-zinc-800 bg-zinc-900/60 px-3 py-1 font-mono text-xs text-zinc-300 transition hover:border-purple-500/40 hover:text-purple-300"
            >
              ⚔️ Atrición de Lanchester
            </Link>
            <Link
              href="/motores/escalada"
              className="rounded border border-zinc-800 bg-zinc-900/60 px-3 py-1 font-mono text-xs text-zinc-300 transition hover:border-purple-500/40 hover:text-purple-300"
            >
              ☢️ Escalada Kahn & DEFCON
            </Link>
            <Link
              href="/motores/dbscan"
              className="rounded border border-zinc-800 bg-zinc-900/60 px-3 py-1 font-mono text-xs text-zinc-300 transition hover:border-purple-500/40 hover:text-purple-300"
            >
              🗺️ Clustering DBSCAN
            </Link>
            <Link
              href="/motores/curva-rendimiento"
              className="rounded border border-zinc-800 bg-zinc-900/60 px-3 py-1 font-mono text-xs text-zinc-300 transition hover:border-purple-500/40 hover:text-purple-300"
            >
              📈 Curva Nelson-Siegel
            </Link>
            <Link
              href="/motores/disuasion"
              className="rounded border border-zinc-800 bg-zinc-900/60 px-3 py-1 font-mono text-xs text-zinc-300 transition hover:border-purple-500/40 hover:text-purple-300"
            >
              ⚖️ Disuasión Lotka-Volterra
            </Link>
          </div>
        </div>

        {/* 1. SIMULADOR MATEMÁTICO */}
        <section className="mb-12">
          <SimuladorMotores />
        </section>

        {/* 2. CENSO 100 PLATAFORMAS */}
        <section className="mb-12">
          <div className="mb-4">
            <span className="font-mono text-xs uppercase tracking-wider text-purple-400">
              TAXONOMÍA GLOBAL DE REFERENCIA
            </span>
            <h2 className="text-2xl font-bold text-zinc-100">
              Censo de las 100 Plataformas Mundiales
            </h2>
            <p className="text-xs text-zinc-400">
              Cada plataforma de referencia cuenta con su equivalencia funcional y operativa viva dentro del ecosistema Vanguard.
            </p>
          </div>

          <Censo100Visor />
        </section>
      </main>

      <Pie />
      <BarraMovil ruta="/motores" />
    </div>
  );
}
