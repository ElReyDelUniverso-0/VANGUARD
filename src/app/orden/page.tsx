// ═══════════════════════════════════════════════════════════════════
// v432.0 · /orden — la sección principal de VANGUARD
//
// El Dueño: «todos los módulos deben estar en la sección principal». Esta es
// esa sección: un solo documento con todas las divisiones, sus módulos
// y las salas reales de cada uno, más lo que estaba enterrado en el cuartel.
// Lee de modulos.ts a través de lib/operacion/orden.ts: no inventa rutas.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import { OrdenDeBatalla } from "@/components/operacion/orden-de-batalla";
import { SalasDelCuartel } from "@/components/operacion/salas-del-cuartel";
import { TOTAL_MODULOS, TOTAL_SALAS, ARBOL } from "@/lib/operacion/orden";

export const metadata: Metadata = {
  title: "Orden de batalla · toda la casa en un solo cuerpo",
  description: `Las ${TOTAL_SALAS} salas de VANGUARD ordenadas en ${ARBOL.length} divisiones y ${TOTAL_MODULOS} módulos, con lo que estaba enterrado en el cuartel. Un índice, ningún botón que tape a otro.`,
  alternates: { canonical: "/orden" },
};

export default function OrdenPage() {
  return (
    <main className="op-orden-pag">
      {/* v435.2: quien llega aquí por primera vez no debería comerse 92 salas de
          golpe. Esta banda lleva a la guía; no tapa nada, va en el flujo. */}
      <nav className="op-banda-guia" aria-label="Guía para quien llega">
        <p>
          <b>¿Primera vez en la casa?</b> Hay una guía de 7 minutos que te deja
          andando, y cada sala tiene su ficha con un ejemplo real.
        </p>
        <a href="/descubrir">Descubrir Vanguard →</a>
      </nav>
      <OrdenDeBatalla />
      <SalasDelCuartel />
    </main>
  );
}
