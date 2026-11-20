// ═══════════════════════════════════════════════════════════════════
// v421.8 · MY UNIVERSE — /mi-universo
//
// La puerta del espacio personal. El servidor arma el catálogo desde los
// registros reales de la casa (módulos + los once espacios de trabajo) y se lo
// pasa al cliente; el cliente pone la parrilla, el arrastre, los temas y el
// guardado. No hay ninguna herramienta reimplementada: cada pieza es la puerta
// de una sala que ya existe.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { CATALOGO, CIFRAS_CATALOGO, CLAVES_INICIALES } from "@/lib/mi-universo/catalogo";
import { UniversoCliente } from "./universo-cliente";

export const metadata: Metadata = {
  title: "Mi universo — tu espacio, configurable pieza a pieza",
  description:
    "Un espacio personal dentro de Vanguard: añade módulos reales, arrástralos, cámbialos de tamaño, agrúpalos en zonas, crea espacios independientes y guarda el trazado que te sirve. Guardado en tu dispositivo con clave por cuenta, y exportable a un archivo.",
  alternates: { canonical: "/mi-universo" },
};

export default function MiUniversoPage() {
  return (
    <main className="min-h-screen bg-[#05060b] text-foreground">
      <PortadaSala
        imagen="/ilustraciones/frentes.jpg"
        alt="Mapa de operaciones sobre una mesa oscura"
        volanta="Mi espacio · Personal"
        titulo="Mi universo"
        sumario="Tu mesa dentro de la casa. Añade los módulos que uses de verdad, colócalos donde te sirvan, agrúpalos en zonas y guarda el trazado. Sin paneles flotantes de más y sin copias de las herramientas: las puertas son las de siempre."
        cifras={[
          { valor: CIFRAS_CATALOGO.piezas, etiqueta: "Puertas disponibles", nota: "módulos y salas reales de la casa" },
          { valor: CATALOGO.length, etiqueta: "En el catálogo", nota: "desde los registros de módulos y espacios" },
          { valor: 4, etiqueta: "Distribuciones", nota: "mando, mosaico, lectura y torre" },
          { valor: 4, etiqueta: "Temas", nota: "obsidiana, abisal, ámbar y jade" },
        ]}
        acento="#c084fc"
        nota="Se guarda en este dispositivo, con una clave por cuenta. Se puede exportar e importar. No se dice «nube» porque hoy no lo es: la base de la casa es efímera."
      />

      <UniversoCliente catalogo={CATALOGO} clavesIniciales={CLAVES_INICIALES} />
    </main>
  );
}
