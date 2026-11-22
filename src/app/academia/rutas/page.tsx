import React from "react";
import type { Metadata } from "next";
import { ConstructorRutas } from "@/components/vanguard/academia/ConstructorRutas";

export const metadata: Metadata = {
  title: "Constructor de Rutas de Aprendizaje | Vanguard Academy",
  description:
    "Diseña tu ruta formativa personalizada articulando lecciones, mapas, actividades y evaluaciones a la medida de tus objetivos.",
};

export default function PaginaConstructorRutas() {
  return (
    <div className="space-y-8">
      {/* v436.9d · esta sala tenía h2 y ningún h1: se lo pone aquí, oculto a la
          vista y presente para lectores de pantalla y buscadores. */}
      <h1 className="sr-only">Rutas de aprendizaje</h1>
      <ConstructorRutas />
    </div>
  );
}
