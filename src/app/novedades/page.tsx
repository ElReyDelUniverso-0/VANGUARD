import type { Metadata } from "next";
import { APP_VERSION, APP_CODENAME } from "@/lib/version";
import { FUNCIONES_EXPANSION_10, type FuncionExpansionId } from "@/lib/vanguard-expansion-data";
import { NovedadesCliente } from "./novedades-cliente";
// v403.8 LA PUERTA: «PARA TI» — el feed de descubrimiento de la v170, por fin
// enchufado. El algoritmo ya existía; nadie lo veía porque colgaba de una
// cáscara huérfana.
import { NovedadesParaTi } from "./novedades-para-ti";
import { PortadaSala } from "@/components/vanguard/portada-sala";

export const metadata: Metadata = {
  title: "Lo Nuevo — las últimas funciones, con enlace directo",
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
        imagen="/imagenes-reales/control.jpg"
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

      <section className="mx-auto w-full max-w-6xl px-4 pt-10">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-amber">Para ti</p>
            <h2 className="text-xl font-semibold text-foreground">Lo que encaja contigo</h2>
          </div>
          <p className="hidden max-w-[42ch] text-right text-[11px] text-muted-foreground sm:block">
            Se ordena con lo que abres, miras y marcas. Siempre deja un hueco a lo que no conoces.
          </p>
        </div>
        <NovedadesParaTi />
      </section>

      <NovedadesCliente initialVista={initialVista} initialFuncion={initialFuncion} />
      </div>
    </main>
  );
}
