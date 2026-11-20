import type { Metadata } from "next";
import { Cabecera, BarraMovil } from "@/components/portada/cabecera";
import { Pie } from "@/components/portada/pie";
import { CentroInformacionPerfecta } from "@/components/vanguard/informacion/CentroInformacionPerfecta";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Centro de Información Perfecta · Vanguard",
  description:
    "Toda la inteligencia mundial fusionada en un solo centro: 16 potencias con radar de 6 ejes, arsenales estratégicos, puntos de estrangulamiento y ciencia de frontera.",
};

export default function PaginaInformacion() {
  return (
    <div className="min-h-screen bg-[#04060a] text-zinc-100">
      <Cabecera ruta="/informacion" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CentroInformacionPerfecta />
      </main>

      <Pie />
      <BarraMovil ruta="/informacion" />
    </div>
  );
}
