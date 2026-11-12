import type { Metadata } from "next";
import Link from "next/link";
import { APP_VERSION, APP_CODENAME } from "@/lib/version";
import { FUNCIONES_EXPANSION_10, type FuncionExpansionId } from "@/lib/vanguard-expansion-data";
import { NovedadesCliente } from "./novedades-cliente";

export const metadata: Metadata = {
  title: "VANGUARD · Lo Nuevo y Expansión 10X (10 Funciones Nuevas con Links Directos)",
  description:
    "Explora todo lo agregado recientemente a VANGUARD con enlaces directos y usa las 10 funciones nuevas en vivo: Comparador 1v1, Termómetro Regional, Riesgo de Viaje, Impacto en Suministros, Radar Diplomático, Verificador OSINT, Duelo Relámpago, Vigía Sísmico/NASA, Generador de Briefings y Atlas 32→3D.",
  alternates: { canonical: "/novedades" },
};

const IDS_FUNCIONES = new Set<string>(FUNCIONES_EXPANSION_10.map((f) => f.id));

export default async function NovedadesPage({
  searchParams,
}: {
  searchParams: Promise<{ funcion?: string; vista?: string }>;
}) {
  const sp = await searchParams;
  const initialFuncion: FuncionExpansionId =
    sp.funcion && IDS_FUNCIONES.has(sp.funcion)
      ? (sp.funcion as FuncionExpansionId)
      : "comparador-fuerzas";
  const initialVista =
    sp.vista === "novedades" || sp.vista === "funciones" ? sp.vista : sp.funcion ? "funciones" : "todo";

  return (
    <main className="min-h-screen bg-[#05060b] text-foreground px-3 sm:px-6 py-4 max-w-[1440px] mx-auto space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-hud/30 pb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-2.5 py-1 rounded bg-[#FFC94D] text-black font-mono text-xs font-black tracking-widest">
            MENÚ VANGUARD · LO NUEVO
          </span>
          <h1 className="font-mono text-sm sm:text-base font-bold text-amber uppercase tracking-wider">
            EXPANSIÓN 10X · NOVEDADES + LINKS DIRECTOS + 10 FUNCIONES NUEVAS
          </h1>
          <span className="font-mono text-[10px] text-muted-foreground">
            {APP_VERSION} · {APP_CODENAME}
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Link
            href="/"
            className="px-3 py-1.5 rounded bg-amber-hud/15 border border-amber-hud/50 text-amber font-bold hover:bg-amber-hud/25 transition-colors"
          >
            ← PORTADA VANGUARD
          </Link>
          <Link
            href="/teatro-3d"
            className="px-3 py-1.5 rounded bg-[#FFC94D] text-black font-black hover:bg-[#ffd66b] transition-colors"
          >
            #1 TEATRO 3D / 2D
          </Link>
          <Link
            href="/universo"
            className="px-3 py-1.5 rounded bg-[#E879F9] text-black font-black hover:opacity-90 transition-colors"
          >
            DAILY UNIVERSE
          </Link>
          <Link
            href="/mundo"
            className="px-2.5 py-1.5 rounded border border-white/15 text-muted-foreground hover:text-foreground transition-colors"
          >
            /MUNDO
          </Link>
          <Link
            href="/en-vivo"
            className="px-2.5 py-1.5 rounded border border-white/15 text-muted-foreground hover:text-foreground transition-colors"
          >
            /EN-VIVO
          </Link>
          <Link
            href="/nucleo"
            className="px-2.5 py-1.5 rounded border border-white/15 text-muted-foreground hover:text-foreground transition-colors"
          >
            /NUCLEO
          </Link>
        </nav>
      </header>

      <NovedadesCliente initialVista={initialVista} initialFuncion={initialFuncion} />
    </main>
  );
}
