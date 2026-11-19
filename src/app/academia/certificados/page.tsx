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
      <GeneradorCertificado />
    </div>
  );
}
