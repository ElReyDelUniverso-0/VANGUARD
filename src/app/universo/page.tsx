import type { Metadata } from "next";
import Link from "next/link";
import { APP_VERSION, APP_CODENAME } from "@/lib/version";
import type { VistaUniverso } from "@/components/vanguard/panels/universo-diario-panel";
import { UniversoCliente } from "./universo-cliente";

export const metadata: Metadata = {
  title: "VANGUARD · The Daily Universe (Credits, Collections, Marketplace & Base Personal)",
  description:
    "Economía diaria y semanal sin penalizaciones, Vanguard Credits (VC), VANGUARD Collections con 8 álbumes educativos mejorables en 3D Holo-Foil, Marketplace ético sin pay-to-win y Base Personal.",
  alternates: { canonical: "/universo" },
};

const VISTAS = new Set<string>(["hoy", "colecciones", "creditos", "marketplace", "base"]);

export default async function UniversoPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>;
}) {
  const sp = await searchParams;
  const initialVista: VistaUniverso =
    sp.vista && VISTAS.has(sp.vista) ? (sp.vista as VistaUniverso) : "hoy";

  return (
    <main className="min-h-screen bg-[#05060b] text-foreground px-3 sm:px-6 py-4 max-w-[1440px] mx-auto space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-hud/30 pb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-2.5 py-1 rounded bg-[#FFC94D] text-black font-mono text-xs font-black tracking-widest">
            THE DAILY UNIVERSE
          </span>
          <h1 className="font-mono text-sm sm:text-base font-bold text-amber uppercase tracking-wider">
            VANGUARD CREDITS · COLLECTIONS (8 ÁLBUMES) · MARKETPLACE ÉTICO · BASE PERSONAL
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
            href="/novedades"
            className="px-3 py-1.5 rounded bg-[#38BDF8] text-black font-black hover:opacity-90 transition-colors"
          >
            LO NUEVO 10X
          </Link>
        </nav>
      </header>

      <UniversoCliente initialVista={initialVista} />
    </main>
  );
}
