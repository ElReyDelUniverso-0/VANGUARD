import React from "react";
import type { Metadata } from "next";
import { GlosarioInteractivo } from "@/components/vanguard/academia/GlosarioInteractivo";

export const metadata: Metadata = {
  title: "Glosario Temático Multidisciplinar | Vanguard Academy",
  description:
    "Diccionario y conceptos técnicos rigurosos organizados por las 10 disciplinas con explicaciones ampliadas y enlaces a lecciones.",
};

export default function PaginaGlosario() {
  return (
    <div className="space-y-8">
      {/* v436.9d · esta sala tenía h2 y ningún h1: se lo pone aquí, oculto a la
          vista y presente para lectores de pantalla y buscadores. */}
      <h1 className="sr-only">Glosario temático</h1>
      <GlosarioInteractivo />
    </div>
  );
}
