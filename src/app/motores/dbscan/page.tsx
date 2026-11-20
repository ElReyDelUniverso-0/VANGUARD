import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera, BarraMovil } from "@/components/portada/cabecera";
import { Pie } from "@/components/portada/pie";

export const metadata: Metadata = {
  title: "Clustering Espacial DBSCAN · Vanguard",
  description: "Agrupación espacial basada en densidad para detección automática de frentes cinéticos y zonas calientes.",
};

export default function PaginaDBSCAN() {
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100">
      <Cabecera ruta="/motores" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-purple-500/20 pb-4">
          <Link href="/motores" className="font-mono text-xs text-purple-400 hover:underline">
            ← Volver a Motores & Algoritmos
          </Link>
          <h1 className="mt-2 text-3xl font-black text-zinc-100">
            DBSCAN: Clustering Espacial de Conflictos
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Algoritmo de agrupación espacial basado en densidad con distancia Haversine geodésica para aislar puntos de impacto y frentes activos sin asumir geometrías esféricas.
          </p>
        </div>

        <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-6">
          <h2 className="text-xl font-bold text-zinc-100">Fundamento Matemático del Agrupador Espacial</h2>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
            DBSCAN (Density-Based Spatial Clustering of Applications with Noise) clasifica puntos en tres categorías:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            <li><strong className="text-purple-300">• Puntos Núcleo (Core Points):</strong> Eventos que tienen al menos <code>minPts</code> vecinos en un radio geodésico <code>epsKm</code>.</li>
            <li><strong className="text-purple-300">• Puntos de Frontera (Border Points):</strong> Incidentes dentro del radio de un núcleo pero con densidad insuficiente para generar nuevos frentes.</li>
            <li><strong className="text-purple-300">• Ruido (Noise):</strong> Detonaciones o reportes aislados que no pertenecen a ningún conglomerado táctico activo.</li>
          </ul>

          <div className="mt-6 flex gap-3">
            <Link
              href="/zona-cero"
              className="rounded bg-purple-600 px-4 py-2 font-mono text-xs font-bold text-white shadow-lg transition hover:bg-purple-500"
            >
              Ver Frente Activo en /zona-cero →
            </Link>
          </div>
        </div>
      </main>

      <Pie />
      <BarraMovil ruta="/motores" />
    </div>
  );
}
