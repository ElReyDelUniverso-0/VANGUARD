import React from "react";
import type { Metadata } from "next";
import { VisorTarjetas } from "@/components/vanguard/academia/VisorTarjetas";

export const metadata: Metadata = {
  title: "Tarjetas de Estudio Interactivas (Flashcards) | Vanguard Academy",
  description:
    "Domina conceptos clave con tarjetas de estudio estilo Quizlet: giro 3D, repaso espaciado, modo examen rápido y categorización por dominio.",
};

export default function PaginaTarjetasEstudio() {
  return (
    <div className="space-y-8">
      <VisorTarjetas />
    </div>
  );
}
