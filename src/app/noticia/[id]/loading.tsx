// v208.0 LA LUPA — esqueleto de carga para /noticia/[id] (force-dynamic):
// cada cable es una PUERTA de entrada de Google; el visitante ve el alto
// del artículo al instante en vez de una página en blanco.
export default function LoadingNoticia() {
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-300">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="h-3 w-28 rounded bg-amber-500/20 animate-pulse" />
        <div className="mt-4 space-y-2.5">
          <div className="h-7 w-full rounded bg-zinc-800 animate-pulse" />
          <div className="h-7 w-5/6 rounded bg-zinc-800 animate-pulse" style={{ animationDelay: "100ms" }} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-zinc-900 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-2.5 w-32 rounded bg-zinc-800/70 animate-pulse" />
            <div className="h-2.5 w-24 rounded bg-zinc-900 animate-pulse" style={{ animationDelay: "140ms" }} />
          </div>
        </div>
        <div className="mt-6 aspect-video w-full rounded-lg bg-zinc-900 animate-pulse" />
        <div className="mt-6 space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 rounded bg-zinc-800/60 animate-pulse" style={{ width: `${100 - (i % 3) * 9}%`, animationDelay: `${i * 90}ms` }} />
          ))}
        </div>
        <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-amber-500/50">
          Vanguard traduce el cable…
        </p>
      </div>
    </div>
  );
}
