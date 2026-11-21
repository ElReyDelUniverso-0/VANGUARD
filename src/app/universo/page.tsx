import type { Metadata } from "next";
import type { VistaUniverso } from "@/components/vanguard/panels/universo-diario-panel";
import { UniversoCliente } from "./universo-cliente";
import { PortadaSala } from "@/components/vanguard/portada-sala";

export const metadata: Metadata = {
  title: "El universo diario — créditos, colecciones, mercado y base personal",
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
    <main className="min-h-screen bg-[#05060b] text-foreground">
      {/* v402.2 — portada de sala (módulo Juego). Fuera la cabecera propia en inglés
          y su barra de botones: la carcasa ya da cabecera y pestañas. */}
      <PortadaSala
        imagen="/imagenes-reales/dubai.jpg"
        alt="Cofre del tesoro con monedas y un catalejo sobre un mapa antiguo"
        volanta="Juego · Colecciones"
        titulo="El universo diario"
        sumario="Créditos que se ganan jugando, álbumes de colección, un mercado sin pagar para ganar y tu base personal. Sin penalizaciones por faltar un día."
        cifras={[{ valor: VISTAS.size, etiqueta: "Secciones", nota: "hoy, colecciones, créditos, mercado y base" }]}
        anclas={[
          { etiqueta: "Hoy", href: "/universo?vista=hoy" },
          { etiqueta: "Colecciones", href: "/universo?vista=colecciones" },
          { etiqueta: "Créditos", href: "/universo?vista=creditos" },
          { etiqueta: "Mercado", href: "/universo?vista=marketplace" },
          { etiqueta: "Base personal", href: "/universo?vista=base" },
        ]}
        acento="#e8c56a"
      />
      <div className="px-3 sm:px-6 py-4 max-w-[1440px] mx-auto space-y-4">

      <UniversoCliente initialVista={initialVista} />
      </div>
    </main>
  );
}
