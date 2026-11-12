import type { Metadata } from "next";
import Link from "next/link";
import { APP_VERSION, APP_CODENAME } from "@/lib/version";
import { Teatro3DCliente } from "./teatro-3d-cliente";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "VANGUARD 3D · Simulador Mundial 2D/3D, Frentes, Uniformes, Escuadrones y Armas",
  description:
    "Convierte cualquier coordenada o ciudad del mundo en un teatro 3D/2D para simulaciones de guerra, observa los frentes activos ahora mismo e inspecciona uniformes, escuadrones y armas interactivas en 3D y 2D.",
  alternates: { canonical: "/teatro-3d" },
};

export default async function Teatro3DPage({
  searchParams,
}: {
  searchParams: Promise<{
    modulo?: string;
    frente?: string;
    lat?: string;
    lng?: string;
    nombre?: string;
    modo?: string;
    war?: string;
    paisA?: string;
    paisB?: string;
  }>;
}) {
  const sp = await searchParams;
  const modValido =
    sp.modulo === "frentes" ||
    sp.modulo === "uniformes" ||
    sp.modulo === "escuadrones" ||
    sp.modulo === "armas" ||
    sp.modulo === "mundial"
      ? sp.modulo
      : "mundial";
  const parsedLat = sp.lat !== undefined ? Number(sp.lat) : undefined;
  const parsedLng = sp.lng !== undefined ? Number(sp.lng) : undefined;
  const initialLat = parsedLat !== undefined && Number.isFinite(parsedLat) ? Math.max(-85, Math.min(85, parsedLat)) : undefined;
  const initialLng = parsedLng !== undefined && Number.isFinite(parsedLng) ? Math.max(-180, Math.min(180, parsedLng)) : undefined;
  const initialModoSim =
    sp.modo === "libre" || sp.modo === "tiempo" || sp.modo === "real" ? sp.modo : undefined;

  return (
    <main className="min-h-screen bg-[#05060b] text-foreground px-3 sm:px-6 py-4 max-w-[1440px] mx-auto space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-hud/30 pb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-2.5 py-1 rounded bg-[#FFC94D] text-black font-mono text-xs font-black tracking-widest shadow-[0_0_12px_rgba(255,201,77,0.3)]">
            #1 VANGUARD · SIEMPRE PRIMERO
          </span>
          <h1 className="font-mono text-sm sm:text-base font-bold text-amber uppercase tracking-wider">
            TEATRO GLOBAL 2D / 3D · SIMULACIÓN DE GUERRA Y ARSENAL INTERACTIVO
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
            href="/novedades"
            className="px-3 py-1.5 rounded bg-[#FFC94D] text-black font-bold hover:bg-[#ffd66b] transition-colors"
          >
            LO NUEVO · +10 FUNCIONES
          </Link>
          <Link
            href="/mundo"
            className="px-2.5 py-1.5 rounded border border-white/15 text-muted-foreground hover:text-foreground transition-colors"
          >
            GLOBO /MUNDO
          </Link>
          <Link
            href="/guerra-hoy"
            className="px-2.5 py-1.5 rounded border border-white/15 text-muted-foreground hover:text-foreground transition-colors"
          >
            GUERRA HOY
          </Link>
          <Link
            href="/nucleo"
            className="px-2.5 py-1.5 rounded border border-white/15 text-muted-foreground hover:text-foreground transition-colors"
          >
            EL NÚCLEO
          </Link>
        </nav>
      </header>

      <Teatro3DCliente
        initialModulo={modValido}
        initialFrente={sp.frente}
        initialLat={initialLat}
        initialLng={initialLng}
        initialNombre={sp.nombre}
        initialModoSim={initialModoSim}
        initialWarId={sp.war}
        initialPaisA={sp.paisA}
        initialPaisB={sp.paisB}
      />
    </main>
  );
}
