import type { Metadata } from "next";
import { APP_VERSION, APP_CODENAME } from "@/lib/version";
import { FUNCIONES_EXPANSION_10, type FuncionExpansionId } from "@/lib/vanguard-expansion-data";
import { NovedadesCliente } from "./novedades-cliente";
import { PortadaSala } from "@/components/vanguard/portada-sala";

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
    <main className="min-h-screen bg-[#05060b] text-foreground">
      {/* v402.2 — portada de sala (Estado de Vanguard). Fuera la cabecera propia. */}
      <PortadaSala
        imagen="/ilustraciones/notificaciones.jpg"
        alt="Centralita antigua con luces rojas y notas sobre la mesa"
        volanta="Estado de Vanguard · Novedades"
        titulo="Lo nuevo de Vanguard"
        sumario="Las funciones que llegaron a la casa, cada una con su puerta para probarla ahora mismo."
        cifras={[
          { valor: FUNCIONES_EXPANSION_10.length, etiqueta: "Funciones", nota: "de la última expansión" },
          { valor: APP_VERSION, etiqueta: "Versión", nota: APP_CODENAME },
        ]}
        acento="#38bdf8"
      />
      <div className="px-3 sm:px-6 py-4 max-w-[1440px] mx-auto space-y-4">

      <NovedadesCliente initialVista={initialVista} initialFuncion={initialFuncion} />
      </div>
    </main>
  );
}
