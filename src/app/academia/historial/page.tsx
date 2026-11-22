import React from "react";
import type { Metadata } from "next";
import { HistorialProgreso } from "@/components/vanguard/academia/HistorialProgreso";

export const metadata: Metadata = {
  title: "Historial de Aprendizaje y Privacidad Local | Vanguard Academy",
  description:
    "Monitorea tus lecciones completadas, tiempos de estudio, racha y exporta o importa tus datos en formato JSON con privacidad absoluta.",
};

export default function PaginaHistorial() {
  return (
    <div className="space-y-8">
      {/* v436.9d · esta sala tenía h2 y ningún h1: se lo pone aquí, oculto a la
          vista y presente para lectores de pantalla y buscadores. */}
      <h1 className="sr-only">Historial de progreso</h1>
      <HistorialProgreso />
    </div>
  );
}
