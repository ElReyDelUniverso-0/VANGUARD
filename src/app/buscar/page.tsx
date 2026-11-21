// ═══════════════════════════════════════════════════════════════════
// v433.0 · /buscar — EL BUSCADOR ÚNICO
//
// La casa tenía seis puertas para buscar (⌘K, /ciencia/buscar, /memoria/buscar,
// /conocimiento/enciclopedia/buscar, la lupa de Zona Cero y el buscador de cada
// sección). Esta es la de todas: las tres rutas de búsqueda viejas redirigen
// aquí (next.config.ts) y el resto de lupas de sección apuntan a este sitio.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import { BuscadorUnico } from "@/components/operacion/buscador-unico";

export const metadata: Metadata = {
  title: "Buscar en toda la casa · un solo buscador",
  description:
    "El buscador único de VANGUARD: todas las salas de los siete módulos, las del cuartel y las noticias vivas, en un solo sitio.",
  alternates: { canonical: "/buscar" },
};

export default function BuscarPage() {
  return (
    <main className="op-buscar-pag">
      <BuscadorUnico />
    </main>
  );
}
