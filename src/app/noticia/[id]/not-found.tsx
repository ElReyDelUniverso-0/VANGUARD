import Link from "next/link";

// v202.0 PUERTAS ABIERTAS — si un cable salió del aire (se retiró del pozo),
// el visitante de Google no se pierde: se le ofrece el mundo en vivo.

export default function NoticiaNotFound() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center px-5">
      <div className="max-w-md text-center py-16">
        <div className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
          ◉ VANGUARD
        </div>
        <h1 className="mt-4 text-2xl font-bold text-zinc-100">
          Este cable salió del aire
        </h1>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          La noticia que buscas ya no está en la redacción, pero el mundo sigue
          girando y la guerra no para. El mapa en vivo, las alertas por fuente
          verificada y la primera página completa te esperan ahora mismo.
        </p>
        <div className="mt-6 flex flex-col gap-3 items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm uppercase tracking-wider rounded px-6 py-2.5 transition-colors"
          >
            Entrar al mundo en vivo →
          </Link>
          <Link
            href="/guerra-hoy"
            className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
          >
            Ver la primera página
          </Link>
        </div>
      </div>
    </main>
  );
}
