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
      <CatalogoCursos />
    </div>
  );
}
