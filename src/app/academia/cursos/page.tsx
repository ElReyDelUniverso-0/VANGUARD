import React from "react";
import type { Metadata } from "next";
import { CatalogoCursos } from "@/components/vanguard/academia/CatalogoCursos";

export const metadata: Metadata = {
  title: "Cursos y Biblioteca Académica | Vanguard Academy",
  description:
    "Catálogo formativo completo con 10 disciplinas clave, capítulos secuenciales, lecciones estructuradas y evaluaciones automáticas.",
};

export default function PaginaCatalogoCursos() {
  return (
    <div className="space-y-8">
      {/* v436.9d · esta sala tenía h2 y ningún h1: se lo pone aquí, oculto a la
          vista y presente para lectores de pantalla y buscadores. */}
      <h1 className="sr-only">Cursos de la Academia</h1>
      <CatalogoCursos />
    </div>
  );
}
