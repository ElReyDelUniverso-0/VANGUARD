import Link from "next/link";

// v215.0 EL MUNDO — la barra superior compartida por las tres puertas
// nuevas del planeta: /mundo (globo 3D), /espia (radar de gobiernos)
// y /traductor (los idiomas de Vanguard). Server-safe: solo enlaces,
// el salto SIEMPRE es un toque del usuario (ley v190).

type Puerta = "mundo" | "espia" | "traductor";

const PUERTAS: Array<{ id: Puerta; href: string; texto: string; clase: string; activa: string }> = [
  {
    id: "mundo",
    href: "/mundo",
    texto: "MUNDO 3D ●",
    clase: "text-amber-400 hover:text-amber-300",
    activa: "text-amber-300 border-b border-amber-400",
  },
  {
    id: "espia",
    href: "/espia",
    texto: "ESPÍA ◈",
    clase: "text-cyan-400/90 hover:text-cyan-300",
    activa: "text-cyan-300 border-b border-cyan-400",
  },
  {
    id: "traductor",
    href: "/traductor",
    texto: "TRADUCTOR ⇄",
    clase: "text-sky-400/90 hover:text-sky-300",
    activa: "text-sky-300 border-b border-sky-400",
  },
];

export function BarraMundo({ activa }: { activa: Puerta }) {
  return (
    <div className="border-b border-zinc-800 bg-zinc-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
        >
          ◉ VANGUARD
        </Link>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {PUERTAS.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              className={`font-mono text-[10px] uppercase tracking-widest ${
                activa === p.id ? p.activa : p.clase
              }`}
            >
              {p.texto}
            </Link>
          ))}
          <Link
            href="/en-vivo"
            className="font-mono text-[10px] uppercase tracking-widest text-red-400/90 hover:text-red-300"
          >
            EN VIVO ●
          </Link>
          <Link
            href="/guerra-hoy"
            className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
          >
            Primera página
          </Link>
        </div>
      </div>
    </div>
  );
}
