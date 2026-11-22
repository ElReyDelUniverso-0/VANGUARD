import type { Metadata } from "next";
import { Teatro3DCliente } from "./teatro-3d-cliente";
import { PortadaSala } from "@/components/vanguard/portada-sala";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Arsenal 3D — simulador 2D/3D de frentes, uniformes, escuadrones y armas",
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
    <main className="min-h-screen bg-[#05060b] text-foreground">
      {/* v402.2 — portada de sala (módulo Mapa 3D). Fuera la cabecera propia y su
          barra de botones repetida: la carcasa ya da cabecera y pestañas. */}
      <PortadaSala ruta="/teatro-3d"
        imagen="/assets/real/jet-1.jpg"
        alt="Simulador de mando con pantallas tácticas en penumbra"
        volanta="Mapa 3D · Arsenal 3D"
        titulo="Arsenal 3D"
        sumario="Convierte cualquier ciudad o coordenada del mundo en un teatro 2D/3D, mira los frentes activos e inspecciona uniformes, escuadrones y armas."
        anclas={[
          { etiqueta: "Mundial", href: "/teatro-3d?modulo=mundial" },
          { etiqueta: "Frentes", href: "/teatro-3d?modulo=frentes" },
          { etiqueta: "Uniformes", href: "/teatro-3d?modulo=uniformes" },
          { etiqueta: "Escuadrones", href: "/teatro-3d?modulo=escuadrones" },
          { etiqueta: "Armas", href: "/teatro-3d?modulo=armas" },
        ]}
        acento="#e8c56a"
      />
      <div className="px-3 sm:px-6 py-4 max-w-[1440px] mx-auto space-y-4">

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
      </div>
    </main>
  );
}
