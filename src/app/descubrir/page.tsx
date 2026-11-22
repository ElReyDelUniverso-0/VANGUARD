import type { Metadata } from "next";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { TOTAL_FICHAS } from "@/lib/descubrimiento/fichas";
import { GUIAS } from "@/lib/descubrimiento/guias";
import { DESTACADOS } from "@/lib/descubrimiento/destacados";
import { APP_VERSION, APP_CODENAME } from "@/lib/version";
import { DescubrirCliente } from "./descubrir-cliente";
import "./descubrir.css";

// ═══════════════════════════════════════════════════════════════════════════
// v435.2 · /descubrir — VANGUARD DISCOVERY SYSTEM
//
// El mandato del Dueño, entero y en una sala: guía interactiva para el que
// llega, explicación breve de cada módulo, ejemplos de cada herramienta,
// descubrimiento de las salas, sección de novedades destacadas y —lo más
// importante— que nadie se sienta perdido SIN quitarle la libertad de explorar.
//
// Todo lo que hay aquí sale del catálogo real de la casa (lib/operacion/orden)
// y de las versiones reales del repositorio. Cero contenido inventado.
// ═══════════════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Descubrir Vanguard — la guía de la casa, sin perderte",
  description: `${GUIAS.length} guías paso a paso, ${TOTAL_FICHAS} salas explicadas con ejemplos y lo último que llegó, cada cosa con su puerta. Sin obligar a nadie: puedes apagar la guía y explorar a tu aire.`,
  alternates: { canonical: "/descubrir" },
};

export default function DescubrirPage() {
  return (
    <main className="dsc-pag">
      <PortadaSala ruta="/descubrir"
        imagen="/imagenes-reales/control.jpg"
        alt="Centralita antigua con luces rojas, mandos y notas sobre la mesa"
        volanta="Descubrir · la guía de la casa"
        titulo="No estás perdido: hay un mapa"
        sumario={`${GUIAS.length} caminos para entrar, ${TOTAL_FICHAS} salas explicadas y lo último que llegó, cada cosa con su puerta. Y si prefieres ir por libre, se apaga la guía y se acabó.`}
        cifras={[
          { valor: GUIAS.length, etiqueta: "Guías", nota: "paso a paso, con minutos" },
          { valor: TOTAL_FICHAS, etiqueta: "Salas", nota: "con qué es y qué hacer" },
          { valor: DESTACADOS.length, etiqueta: "Destacadas", nota: "lo último, con puerta" },
          { valor: APP_VERSION, etiqueta: "Versión", nota: APP_CODENAME },
        ]}
        acento="#22d3ee"
      />
      <div className="dsc-envoltorio">
        <DescubrirCliente />
      </div>
    </main>
  );
}
