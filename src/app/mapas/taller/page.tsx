import type { Metadata } from "next";
import Link from "next/link";
import { TallerMapa } from "@/components/mapas/taller-mapa";

// ═══════════════════════════════════════════════════════════════════
// v436.5 · /mapas/taller — crear un mapa dentro de Vanguard
//
// Orden del Dueño: «necesita herramientas para crear mapas 3D 2D interactivos
// con informaciones, o sea crearlos dentro de Vanguard…».
//
// Lo que esta sala es: el taller. Se pone un punto sobre el planeta —en el
// plano con las fronteras reales o en el globo de verdad—, se le escribe qué es
// y de dónde sale el dato, se dibujan trazos y el mapa se saca de aquí en
// GeoJSON, en JSON o en un HTML autónomo que se abre solo.
//
// Lo que esta sala NO es: un mapa nuevo. Usa el mismo planeta que el resto de
// la casa (Natural Earth 110m, la misma proyección de /mundos) y el mismo globo
// (globe.gl). No hay un segundo motor que pueda contradecir al primero.
//
// Nada inventado: un punto sin fuente se marca «sin fuente» en el propio taller
// y en el índice; el contador de la barra lo dice antes de exportar.
// ═══════════════════════════════════════════════════════════════════

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "El Taller de Mapas — crear mapas 2D y 3D con información, dentro de VANGUARD",
  description:
    "Herramienta de creación de mapas interactivos de VANGUARD: pon puntos sobre el planeta, escribe qué es cada uno y su fuente, dibuja trazos, míralo en plano o en globo 3D y expórtalo en GeoJSON, JSON o un HTML autónomo. Importa mapas de fuera y publica los tuyos en La Forja.",
  alternates: { canonical: `${SITE_URL}/mapas/taller` },
  openGraph: {
    title: "El Taller de Mapas — VANGUARD",
    description:
      "Crear mapas 2D y 3D con fichas y fuentes, verlos en plano o en globo, y exportarlos en GeoJSON, JSON o HTML autónomo.",
    url: `${SITE_URL}/mapas/taller`,
    siteName: "VANGUARD",
    type: "website",
  },
};

const ACENTO = "#FF9F45";

export default function PaginaTallerMapas() {
  return (
    <main className="mx-auto w-full max-w-[1500px] px-3 py-6 sm:px-5">
      <header className="mb-5 border-b border-slate-800 pb-4">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.34em]"
          style={{ color: ACENTO }}
        >
          Herramienta · 2D y 3D · exportable
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
          El Taller de Mapas
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
          Aquí un mapa se hace a mano y se sostiene en su fuente. Toca el planeta para poner un
          punto, escribe qué es y de dónde sale el dato, dibuja un trazo si hace falta, y mira el
          resultado en plano o en globo. Después se lo lleva cualquiera: GeoJSON para un SIG, JSON
          para volver a abrirlo, o un HTML autónomo que se abre sin Vanguard y sin internet.
        </p>
        <nav className="mt-3 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
          <Link href="/mapas" className="text-slate-400 underline-offset-4 hover:text-slate-100 hover:underline">
            ◂ Centro de Mapas
          </Link>
          <Link href="/mapas/indice" className="text-slate-400 underline-offset-4 hover:text-slate-100 hover:underline">
            Índice de mapas
          </Link>
          <Link href="/mundos" className="text-slate-400 underline-offset-4 hover:text-slate-100 hover:underline">
            Los países
          </Link>
          <Link href="/creadores/publicar" className="text-slate-400 underline-offset-4 hover:text-slate-100 hover:underline">
            Publicar en La Forja ▸
          </Link>
        </nav>
      </header>

      <TallerMapa />

      <footer className="mt-8 border-t border-slate-800 pt-4 text-[11px] leading-relaxed text-slate-500">
        <p className="max-w-4xl">
          El taller no guarda nada en un servidor: tu mapa vive en este navegador hasta que lo
          exportas. La geografía es Natural Earth 110m, la misma que usan el resto de las salas de
          mapa de la casa. Los datos son los que escribas, con la fuente que declares.
        </p>
      </footer>
    </main>
  );
}
