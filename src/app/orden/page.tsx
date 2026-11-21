// ═══════════════════════════════════════════════════════════════════
// v432.0 · /orden — la sección principal de VANGUARD
//
// El Dueño: «todos los módulos deben estar en la sección principal». Esta es
// esa sección: un solo documento con las siete divisiones, los catorce módulos
// y las salas reales de cada uno, más lo que estaba enterrado en el cuartel.
// Lee de modulos.ts a través de lib/operacion/orden.ts: no inventa rutas.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import { OrdenDeBatalla } from "@/components/operacion/orden-de-batalla";
import { TOTAL_MODULOS, TOTAL_SALAS, ARBOL } from "@/lib/operacion/orden";

export const metadata: Metadata = {
  title: "Orden de batalla · toda la casa en un solo cuerpo",
  description: `Las ${TOTAL_SALAS} salas de VANGUARD ordenadas en ${ARBOL.length} divisiones y ${TOTAL_MODULOS} módulos, con lo que estaba enterrado en el cuartel. Un índice, ningún botón que tape a otro.`,
  alternates: { canonical: "/orden" },
};

export default function OrdenPage() {
  return (
    <main className="op-orden-pag">
      <OrdenDeBatalla />
    </main>
  );
}
