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
      <HistorialProgreso />
    </div>
  );
}
