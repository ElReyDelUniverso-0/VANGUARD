"use client";

// ═══════════════════════════════════════════════════════════════════
// v406.0 LA TRAVESÍA — en tu perfil: la brújula (qué espacios van delante)
// y tu rastro (cuánto llevas recorrido), con su botón de borrar.
// Todo vive en el aparato; esta pieza solo lo enseña y lo cambia.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { useEffect, useState } from "react";
import { borrarRastro, guardarBrujula, leerBrujula, leerRastro, salasCuartelVistas, type Paso } from "@/lib/travesia/rastro";
import { ESPACIOS, TOTAL_PUERTAS, TOTAL_SALAS } from "@/lib/travesia/espacios";

export function PanelTravesia() {
  const [rastro, setRastro] = useState<Paso[]>([]);
  const [intereses, setIntereses] = useState<string[]>([]);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const leer = () => {
      setRastro(leerRastro());
      setIntereses(leerBrujula()?.intereses ?? []);
    };
    leer();
    window.addEventListener("vg-rastro", leer);
    return () => window.removeEventListener("vg-rastro", leer);
  }, []);

  const rutas = new Set(rastro.map((p) => p.r));
  const puertas = ESPACIOS.reduce((t, e) => t + e.puertas.filter((p) => rutas.has(p.href)).length, 0);
  const salas = salasCuartelVistas(rastro).length;

  const alternar = (id: string) => {
    const l = intereses.includes(id) ? intereses.filter((x) => x !== id) : intereses.length >= 3 ? [...intereses.slice(1), id] : [...intereses, id];
    setIntereses(l);
    guardarBrujula(l);
    setGuardado(true);
    window.setTimeout(() => setGuardado(false), 1600);
  };

  return (
    <section className="mx-auto max-w-4xl px-5 pb-6" aria-labelledby="tv-perfil-t">
      <div className="rounded-xl border border-amber-300/25 bg-zinc-900/60 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-amber-300">Tu travesía</p>
        <h2 id="tv-perfil-t" className="mt-2 text-xl font-bold text-zinc-100">
          La brújula y tu rastro
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Elige hasta 3 espacios: van delante cuando entras a la Travesía. {guardado && <span className="text-emerald-400">Guardado.</span>}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ESPACIOS.map((e) => {
            const on = intereses.includes(e.id);
            return (
              <button
                key={e.id}
                type="button"
                aria-pressed={on}
                onClick={() => alternar(e.id)}
                className="min-h-[44px] rounded-full border px-4 text-sm font-semibold transition"
                style={{ borderColor: on ? e.color : "rgba(255,255,255,.15)", color: on ? e.color : undefined, background: on ? "rgba(255,255,255,.06)" : "transparent" }}
              >
                {on ? `${intereses.indexOf(e.id) + 1} · ` : ""}
                {e.nombre}
              </button>
            );
          })}
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-zinc-950/70 p-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Pasos guardados</dt>
            <dd className="mt-1 text-lg font-bold text-zinc-100">{rastro.length}</dd>
          </div>
          <div className="rounded-lg bg-zinc-950/70 p-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Puertas abiertas</dt>
            <dd className="mt-1 text-lg font-bold text-zinc-100">
              {puertas} / {TOTAL_PUERTAS}
            </dd>
          </div>
          <div className="rounded-lg bg-zinc-950/70 p-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Salas del cuartel</dt>
            <dd className="mt-1 text-lg font-bold text-zinc-100">
              {salas} / {TOTAL_SALAS}
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/entrar" className="inline-flex min-h-[44px] items-center rounded-full bg-amber-300 px-5 text-sm font-bold text-zinc-950">
            Abrir mi Travesía →
          </Link>
          {rastro.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Borrar tu rastro? Solo vive en este aparato y no se puede recuperar.")) borrarRastro();
              }}
              className="inline-flex min-h-[44px] items-center rounded-full border border-zinc-700 px-5 text-sm text-zinc-300"
            >
              Borrar mi rastro
            </button>
          )}
        </div>
        <p className="mt-3 text-xs text-zinc-500">El rastro y la brújula viven solo en este aparato (localStorage). No se envían a ningún servidor.</p>
      </div>
    </section>
  );
}
