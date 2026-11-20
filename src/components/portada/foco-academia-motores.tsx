// ============================================================
// FOCO PÚBLICO: VANGUARD ACADEMY & MOTORES GLOBALES (v423.0)
// Tarjetas de gran impacto visual en portada principal
// ============================================================
import Link from "next/link";
import { PortadaHermosaModulo } from "./portadas-hermosas";

export function FocoAcademiaMotores() {
  return (
    <section className="vx-wrap my-8" aria-label="Novedades destacadas de Vanguard">
      <div className="grid gap-4 md:grid-cols-2">
        {/* TARJETA 1: VANGUARD ACADEMY */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#020e0a]/80 shadow-[0_0_25px_rgba(16,185,129,0.12)] transition duration-300 hover:border-emerald-400 hover:shadow-[0_0_35px_rgba(16,185,129,0.25)]">
          <div className="relative h-44 w-full overflow-hidden border-b border-emerald-500/20">
            <PortadaHermosaModulo id="academia" />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                ★ CERTIFICACIÓN OFICIAL
              </span>
              <span className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] text-zinc-300 border border-zinc-700 backdrop-blur-md">
                10 CURSOS
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                FORMACIÓN ESTRATÉGICA & GEOPOLÍTICA
              </span>
              <h3 className="mt-1 text-2xl font-black tracking-wide text-zinc-100 group-hover:text-emerald-300 transition-colors">
                Vanguard Academy
              </h3>
              <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                Aprende análisis de inteligencia, lectura de mapas OSINT, doctrina militar y economía de guerra. Cuestionarios interactivos, rutas especializadas y certificados verificables por SHA-256.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-500/20 pt-4">
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                <Link href="/academia/cursos" className="rounded bg-emerald-950/60 px-2 py-1 text-emerald-300 hover:bg-emerald-900/60">
                  Catálogo
                </Link>
                <Link href="/academia/rutas" className="rounded bg-emerald-950/60 px-2 py-1 text-emerald-300 hover:bg-emerald-900/60">
                  Rutas
                </Link>
                <Link href="/academia/ejercicios" className="rounded bg-emerald-950/60 px-2 py-1 text-emerald-300 hover:bg-emerald-900/60">
                  Ejercicios
                </Link>
                <Link href="/academia/certificados" className="rounded bg-emerald-950/60 px-2 py-1 text-emerald-300 hover:bg-emerald-900/60">
                  Certificados
                </Link>
              </div>

              <Link
                href="/academia"
                className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition"
              >
                Entrar a la Academia →
              </Link>
            </div>
          </div>
        </div>

        {/* TARJETA 2: MOTORES & CENSO 100 PLATAFORMAS */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-purple-500/30 bg-[#090212]/80 shadow-[0_0_25px_rgba(168,85,247,0.12)] transition duration-300 hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.25)]">
          <div className="relative h-44 w-full overflow-hidden border-b border-purple-500/20">
            <PortadaHermosaModulo id="motores" />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-purple-300 border border-purple-500/40 backdrop-blur-md">
                ★ 100 PLATAFORMAS
              </span>
              <span className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] text-zinc-300 border border-zinc-700 backdrop-blur-md">
                SIMULADORES
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-purple-400">
                LABORATORIO DE CÁLCULO & BENCHMARK
              </span>
              <h3 className="mt-1 text-2xl font-black tracking-wide text-zinc-100 group-hover:text-purple-300 transition-colors">
                Motores & 100 Plataformas
              </h3>
              <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                Directorio taxonómico de los 100 sistemas globales líderes (Liveuamap, ACLED, Sentinel, SIPRI, Bloomberg) y simulador matemático en vivo: leyes de Lanchester, tipos soberanos y Brier score.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-purple-500/20 pt-4">
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                <Link href="/motores/censo" className="rounded bg-purple-950/60 px-2 py-1 text-purple-300 hover:bg-purple-900/60">
                  Censo 100
                </Link>
                <Link href="/motores/lanchester" className="rounded bg-purple-950/60 px-2 py-1 text-purple-300 hover:bg-purple-900/60">
                  Lanchester
                </Link>
                <Link href="/motores/curva-rendimiento" className="rounded bg-purple-950/60 px-2 py-1 text-purple-300 hover:bg-purple-900/60">
                  Tipos
                </Link>
                <Link href="/motores/disuasion" className="rounded bg-purple-950/60 px-2 py-1 text-purple-300 hover:bg-purple-900/60">
                  Disuasión
                </Link>
              </div>

              <Link
                href="/motores"
                className="inline-flex items-center gap-1 font-mono text-xs font-bold text-purple-400 group-hover:text-purple-300 transition"
              >
                Abrir Laboratorio →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
