// v208.0 LA LUPA — esqueleto de carga para /guerra-hoy (force-dynamic):
// antes la página era UN BLOQUE BLANCO hasta que la BD + 3 APIs externas
// respondían. Ahora el visitante (y Google) ve la sala desde el primer byte.
export default function LoadingGuerraHoy() {
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-300">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* cabecera */}
        <div className="h-4 w-40 rounded bg-amber-500/20 animate-pulse" />
        <div className="mt-3 h-8 w-3/4 max-w-xl rounded bg-zinc-800/80 animate-pulse" />
        <div className="mt-2 h-3 w-2/3 max-w-md rounded bg-zinc-800/50 animate-pulse" />
        {/* chips de teatros */}
        <div className="mt-5 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 w-20 rounded border border-zinc-800 bg-zinc-900 animate-pulse" style={{ animationDelay: `${i * 120}ms` }} />
          ))}
        </div>
        {/* lista de cables */}
        <div className="mt-8 space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex gap-4 border border-zinc-900 rounded-lg p-4 bg-zinc-950/60">
              <div className="h-16 w-20 shrink-0 rounded bg-zinc-900 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-11/12 rounded bg-zinc-800 animate-pulse" style={{ animationDelay: "80ms" }} />
                <div className="h-3 w-2/3 rounded bg-zinc-800/70 animate-pulse" style={{ animationDelay: "160ms" }} />
                <div className="h-2.5 w-32 rounded bg-zinc-900 animate-pulse" style={{ animationDelay: "240ms" }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-amber-500/50">
          Vanguard abre el mapa del día…
        </p>
      </div>
    </div>
  );
}
