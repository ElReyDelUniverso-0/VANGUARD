import type { Metadata } from "next";
import { Vitrina } from "@/components/creadores/vitrina";

// v406.1 LA FORJA — el ecosistema de creadores de VANGUARD.
export const metadata: Metadata = {
  title: "La Forja — publica mapas, escenarios, investigaciones, simulaciones y proyectos",
  description:
    "El ecosistema de creadores de VANGUARD: publica con tu nombre mapas, escenarios ¿y si…?, investigaciones con fuentes, simulaciones y proyectos. Versiones, comentarios, valoraciones, colecciones y moderación con bitácora.",
  alternates: { canonical: "/creadores" },
};

export default function CreadoresPage() {
  return (
    <main className="min-h-screen bg-[#06080c]">
      <Vitrina />
    </main>
  );
}
