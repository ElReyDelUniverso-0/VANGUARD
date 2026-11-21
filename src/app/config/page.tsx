// ═══════════════════════════════════════════════════════════════════
// v435.0 · /config — EL SISTEMA DE CONFIGURACIÓN, EN PÁGINA
//
// El Dueño: «agrega un sistema de configuración para Vanguard». El panel
// entra por la derecha desde cualquier sala (engranaje de la cabecera); esta
// página es la misma cosa, quieta y explicada, con dirección propia.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import { PaginaAjustes } from "@/components/config/pagina-ajustes";

export const metadata: Metadata = {
  title: "Ajustes de la casa · pantalla, rendimiento, letra y fondo",
  description:
    "El sistema de configuración de VANGUARD: maqueta de pantalla grande o pequeña, modo ligero para aparatos justos, animaciones, densidad, tamaño de letra y fondo. Se guarda en tu aparato.",
  alternates: { canonical: "/config" },
};

export default function ConfigPage() {
  return (
    <main className="op-orden-pag">
      <div className="op-orden">
        <header className="op-orden-cab">
          <p className="op-orden-sello">Configuración · aparato local</p>
          <h1 className="op-orden-titulo">Ajustes de la casa</h1>
          <p className="op-orden-lema">
            VANGUARD tiene dos maquetas de verdad: una para pantallas grandes y otra para pantallas pequeñas. Aquí eliges
            cuál usar, si el aparato va justo de fuerzas, cuánto movimiento quieres y con qué letra y fondo se lee.
            Nada de esto viaja a un servidor.
          </p>
        </header>
        <PaginaAjustes />
      </div>
    </main>
  );
}
