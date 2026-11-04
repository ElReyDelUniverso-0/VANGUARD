"use client";

// ============================================================
// v224.0 EL ESTRATEGA — LA ISLA DEL ESCENARIO (client)
// v233.0 LA BALANZA — la cadena de procedencia se vuelve
// NAVEGABLE: el nombre de cada teatro abre su sala real
// (/conflicto/[slug], solo con cables — la puerta 404 se evita,
// no se finge); cada factor con dato abre su origen (el
// acontecimiento documentado con id REAL de la semilla, el mapa
// de frentes, las fichas de país); cada peso declara qué
// significan 0 y 2 y enlaza el dato que multiplica.
// Los ÚNICOS mandos de la simulación: 4 deslizadores de peso y
// el botón RECALCULAR. Todo lo demás (datos, supuestos, reglas)
// vive en el servidor — la ley del mandato: sin ejecutar código
// arbitrario de usuarios, solo números dentro del rango que el
// catálogo declara; un rechazo vuelve con su 400 y su mensaje.
// La tabla inicial llega server-rendered (cero parpadeo, cero
// fetch al montar). Sin setState en effects (ley v176).
// ============================================================

import { useState } from "react";
import Link from "next/link";
import type { Escenario, ResultadoTeatro } from "@/lib/nucleo/simulacion";

const BARRA = (v: number | null) => ({
  width: `${Math.max(0, Math.min(100, v ?? 0))}%`,
});

function FilaTeatro({ r }: { r: ResultadoTeatro }) {
  const sinDato = r.total === null;
  // v233.0 — puertas HONESTAS: el teatro abre su sala solo si
  // tiene cables (0 cables = 404 real en /conflicto — se evita, no
  // se finge); el acontecimiento abre con el id REAL de la
  // semilla (null = sin hecho sembrado = sin puerta); frentes y
  // capacidad abren su origen solo cuando el dato existe.
  const conCables = r.factores.cobertura.valor !== null && r.factores.cobertura.valor > 0;
  const puertas: Record<keyof ResultadoTeatro["factores"], string | null> = {
    tiempo: r.puertaAcontecimiento
      ? `/nucleo?id=${encodeURIComponent(r.puertaAcontecimiento)}`
      : null,
    cobertura: conCables ? `/conflicto/${r.slug}` : null,
    frentes: r.factores.frentes.valor !== null ? "/ver-guerra" : null,
    capacidad: r.factores.capacidad.valor !== null ? "/nucleo?tipo=pais" : null,
  };
  return (
    <li className="rounded-md border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-bold text-zinc-100">
          {conCables ? (
            <Link
              href={`/conflicto/${r.slug}`}
              className="hover:text-amber transition-colors underline decoration-zinc-700 underline-offset-4 hover:decoration-amber-hud"
              title={`La sala real del teatro: ${r.nombre} en /conflicto/${r.slug}`}
            >
              {r.nombre}
            </Link>
          ) : (
            r.nombre
          )}
          <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
            {r.slug}
          </span>
        </p>
        <p
          className={`font-orbitron text-xl font-black shrink-0 ${
            sinDato ? "text-zinc-600" : "text-amber"
          }`}
          aria-label={`presión ${sinDato ? "sin puntuación" : r.total}`}
        >
          {sinDato ? "—" : r.total}
        </p>
      </div>

      {/* la barra de la presión */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${sinDato ? "bg-zinc-700" : "bg-amber-500/80"}`}
          style={BARRA(r.total)}
        />
      </div>

      {/* el desglose: cada factor con su crudo y su valor — nada de caja negra.
       * v233.0: el factor CON dato abre su origen (la cadena navegable). */}
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
        {(
          [
            ["tiempo", r.factores.tiempo],
            ["cobertura", r.factores.cobertura],
            ["frentes", r.factores.frentes],
            ["capacidad", r.factores.capacidad],
          ] as const
        ).map(([clave, f]) => {
          const puerta = puertas[clave];
          return (
            <div key={clave} title={`${f.crudo} · ${f.ancla}`}>
              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                {puerta && f.valor !== null ? (
                  <Link
                    href={puerta}
                    className="uppercase hover:text-amber transition-colors"
                    title={`Ver el dato de ${clave} en su origen: ${f.crudo}`}
                  >
                    {clave} ▸
                  </Link>
                ) : (
                  <>
                    {clave} {f.valor === null ? "· sin dato" : ""}
                  </>
                )}
              </p>
              <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full ${f.valor === null ? "bg-zinc-700" : "bg-cyan-500/70"}`}
                  style={BARRA(f.valor)}
                />
              </div>
              <p className="mt-0.5 truncate text-[10px] text-zinc-400" title={f.crudo}>
                {f.crudo}
              </p>
            </div>
          );
        })}
      </div>

      {r.faltantes.length > 0 && (
        <p className="mt-2 text-[11px] italic text-zinc-500">
          Sin dato para: {r.faltantes.join(", ")} — excluido del cálculo (declarado, no fingido).
        </p>
      )}
    </li>
  );
}

export function EscenarioControles({ inicial }: { inicial: Escenario }) {
  const [escenario, setEscenario] = useState<Escenario>(inicial);
  const [pesos, setPesos] = useState<Record<string, number>>(inicial.variables.aplicadas);
  const [calculando, setCalculando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function recalcular() {
    setCalculando(true);
    setError(null);
    try {
      const res = await fetch("/api/nucleo/simulacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variables: pesos }),
      });
      const cuerpo = await res.json().catch(() => null);
      if (res.status === 429) {
        setError("Demasiados recálculos — respira y vuelve en un minuto.");
      } else if (res.status === 400 && cuerpo?.errores) {
        setError(cuerpo.errores.join(" · "));
      } else if (!res.ok || cuerpo?.ok !== true) {
        setError(cuerpo?.error ?? "El escenario no respondió — nada fingido, inténtalo de nuevo.");
      } else {
        setEscenario(cuerpo as Escenario);
        setPesos(cuerpo.variables.aplicadas);
      }
    } catch {
      setError("La red falló — el escenario no se recalculó (nada fingido).");
    } finally {
      setCalculando(false);
    }
  }

  const conPuntuacion = escenario.resultados.filter((r) => r.total !== null).length;

  return (
    <section className="mt-8" aria-label="El escenario y sus mandos">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/80">
        {escenario.etiqueta}
      </p>
      <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
        {escenario.escena.es}
      </p>
      <p className="mt-2 rounded-md border border-red-hud/40 bg-red-hud/5 p-3 text-xs font-bold text-red-hud leading-relaxed">
        ⚠ {escenario.escena.noEs}
      </p>

      {/* LA TABLA DEL ESCENARIO — datos y resultados separados */}
      <ul className="mt-4 space-y-2.5">
        {escenario.resultados.map((r) => (
          <FilaTeatro key={r.slug} r={r} />
        ))}
      </ul>

      <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
        {conPuntuacion} de {escenario.resultados.length} teatros con puntuación · generado{" "}
        {escenario.generado.slice(0, 16).replace("T", " ")} UTC
        {escenario.notaBd ? ` · ${escenario.notaBd}` : ""}
      </p>

      {/* LOS MANDOS — lo único que el usuario mueve */}
      <div className="mt-6 rounded-md border border-amber-hud/40 bg-zinc-900/60 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/80">
          LOS PESOS — tu lectura del escenario
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Mueve lo que quieras (0 = ese factor no cuenta · 2 = cuenta el doble). Solo números
          dentro del rango: el servidor rechaza todo lo demás.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {escenario.variables.catalogo.map((v) => (
            <div key={v.id}>
              <label className="block">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-bold text-zinc-200">{v.nombre}</span>
                  <span className="font-mono text-xs text-amber">{(pesos[v.id] ?? v.porDefecto).toFixed(1)}</span>
                </span>
                <input
                  type="range"
                  min={v.min}
                  max={v.max}
                  step={v.paso}
                  value={pesos[v.id] ?? v.porDefecto}
                  onChange={(e) => setPesos({ ...pesos, [v.id]: Number(e.target.value) })}
                  className="mt-1.5 w-full accent-amber-500"
                  aria-label={v.nombre}
                />
                <span className="mt-0.5 block text-[11px] text-zinc-500 leading-snug">{v.descripcion}</span>
              </label>
              {/* v233.0 — los extremos explicados y la puerta del dato */}
              <span className="mt-0.5 block text-[10px] text-zinc-600 leading-snug">
                {v.cero} · {v.dos}
                {" · "}
                <Link
                  href={v.puerta.ruta}
                  className="text-cyan-hud/80 hover:text-amber transition-colors"
                  title={`El dato que multiplica este peso vive en ${v.puerta.etiqueta}`}
                >
                  {v.puerta.etiqueta} ▸
                </Link>
              </span>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-red-hud/40 bg-red-hud/5 p-2.5 text-xs text-red-hud">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={recalcular}
          disabled={calculando}
          className="mt-4 w-full rounded-md border border-amber-hud bg-amber-500/10 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.25em] text-amber hover:bg-amber-500/20 disabled:opacity-50 sm:w-auto"
        >
          {calculando ? "Recalculando…" : "Recalcular el escenario ▸"}
        </button>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
          determinista: mismos pesos → mismo resultado · sin azar · sin código de usuarios
        </p>
      </div>

      <p className="mt-4 text-xs text-zinc-500 leading-relaxed">
        ¿De dónde sale cada dato? La <Link href="/nucleo" className="text-cyan-hud hover:text-amber">ficha de cada entidad</Link>{" "}
        en el Núcleo muestra la cadena completa: mapa → acontecimiento → país → indicadores →
        fuente. Los supuestos y los límites del modelo están más abajo, a la vista.
      </p>
    </section>
  );
}
