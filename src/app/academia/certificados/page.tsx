import React from "react";
import type { Metadata } from "next";
import { GeneradorCertificado } from "@/components/vanguard/academia/GeneradorCertificado";

export const metadata: Metadata = {
  title: "Certificados Internos de Finalización | Vanguard Academy",
  description:
    "Acreditación de logro formativo con código único verificable y competencias Bloom adquiridas. Reconocimiento interno Vanguard.",
};

export default function PaginaCertificados() {
  return (
    <div className="space-y-8">
      {/* v436.9d · esta sala tenía h2 y ningún h1: se lo pone aquí, oculto a la
          vista y presente para lectores de pantalla y buscadores. */}
      <h1 className="sr-only">Certificados</h1>
      <GeneradorCertificado />
    </div>
  );
}
