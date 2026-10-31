// v208.0 LA LUPA — esqueleto de carga para /conflicto/[tag] (force-dynamic):
// los teatros de guerra entran desde Google y el buscador; sala visible
// desde el primer byte.
export default function LoadingConflicto() {
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-300">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="h-4 w-24 rounded bg-red-500/20 animate-pulse" />
        <div className="mt-3 h-9 w-2/3 max-w-lg rounded bg-zinc-800 animate-pulse" />
        <div className="mt-2 h-3 w-1/2 max-w-sm rounded bg-zinc-800/60 animate-pulse" style={{ animationDelay: "120ms" }} />
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 w-24 rounded border border-zinc-800 bg-zinc-900 animate-pulse" style={{ animationDelay: `${i * 110}ms` }} />
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-zinc-900 rounded-lg p-4 bg-zinc-950/60 space-y-2">
              <div className="h-3.5 w-10/12 rounded bg-zinc-800 animate-pulse" style={{ animationDelay: `${i * 90}ms` }} />
              <div className="h-3 w-2/3 rounded bg-zinc-800/70 animate-pulse" style={{ animationDelay: `${i * 90 + 70}ms` }} />
              <div className="h-2.5 w-24 rounded bg-zinc-900 animate-pulse" style={{ animationDelay: `${i * 90 + 140}ms` }} />
            </div>
          ))}
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-amber-500/50">
          Vanguard despliega el teatro…
        </p>
      </div>
    </div>
  );
}
