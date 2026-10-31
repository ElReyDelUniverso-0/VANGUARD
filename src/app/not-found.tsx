import Link from "next/link";
import type { Metadata } from "next";
import { TEATROS } from "@/lib/teatros";

// v210.0 EL REFUGIO — la puerta que faltaba. Next.js servía su 404 de
// fábrica: una página blanca, sin marca, sin salida, que rompía la sala
// de la Casa y se llevaba al visitante (v206 construyó puertas de entrada;
// nadie curó la puerta rota por dentro). Este 404 del refugio recibe a
// quien llegó a una URL muerta, le dice la verdad («esta sala no existe»)
// y le ofrece las salas vivas: portada, guerra en vivo, teatros de conflicto
// y la pista del buscador Ctrl+K. Estilo house (zinc-950 + ámbar), sin
// JavaScript: un server component puro que responde rápido ante Google.

export const metadata: Metadata = {
  title: "Página no encontrada | VANGUARD",
  robots: { index: false, follow: true },
};

export default function NoEncontrado() {
  const teatros = Object.entries(TEATROS).slice(0, 6);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col">
      <div className="border-b border-zinc-800 bg-zinc-900/60">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
          >
            ◉ VANGUARD
          </Link>
          <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-wider">
            Error 404 · Sala inexistente
          </span>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-5 py-16 w-full">
        <p className="font-mono text-6xl font-bold text-amber-400 tracking-tight">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold text-zinc-100">
          Esta sala no existe en la Casa
        </h1>
        <p className="mt-3 text-sm text-zinc-500 leading-relaxed max-w-xl">
          El enlace que seguiste apunta a una dirección que VANGUARD no
          reconoce: puede que la sala se moviera, que el cable se retirara o
          que la dirección estuviera mal escrita. Nada se perdió: el mundo
          sigue en vivo en las salas de abajo.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-sm bg-amber-400 text-zinc-950 font-mono text-[11px] uppercase tracking-widest font-bold hover:bg-amber-300"
          >
            Volver a la portada
          </Link>
          <Link
            href="/guerra-hoy"
            className="px-4 py-2 rounded-sm border border-zinc-700 text-zinc-300 font-mono text-[11px] uppercase tracking-widest hover:border-amber-400 hover:text-amber-300"
          >
            Guerra en vivo
          </Link>
          <Link
            href="/zona-cero"
            className="px-4 py-2 rounded-sm border border-zinc-700 text-zinc-300 font-mono text-[11px] uppercase tracking-widest hover:border-amber-400 hover:text-amber-300"
          >
            Zona cero
          </Link>
        </div>

        <h2 className="mt-10 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
          Teatros en vivo
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {teatros.map(([tag, t]) => (
            <Link
              key={tag}
              href={`/conflicto/${tag}`}
              className="px-3 py-1.5 rounded-sm border border-zinc-800 bg-zinc-900/60 text-zinc-300 text-xs hover:border-amber-400 hover:text-amber-300"
            >
              {t.nombre}
            </Link>
          ))}
        </div>

        <p className="mt-10 text-xs text-zinc-600 leading-relaxed">
          Consejo de la Casa: pulsa{" "}
          <kbd className="px-1.5 py-0.5 border border-zinc-700 rounded-sm font-mono text-[10px] text-zinc-400">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="px-1.5 py-0.5 border border-zinc-700 rounded-sm font-mono text-[10px] text-zinc-400">
            K
          </kbd>{" "}
          dentro de la plataforma para buscar cualquier noticia, sección o
          expediente antes de vagar por URLs oscuras.
        </p>
      </article>

      <footer className="mt-auto border-t border-zinc-800">
        <div className="max-w-3xl mx-auto px-5 py-3 font-mono text-[10px] text-zinc-600 uppercase tracking-wider">
          VANGUARD · El mundo en tiempo real · v210.0
        </div>
      </footer>
    </main>
  );
}
