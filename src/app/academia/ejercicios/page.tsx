import React from "react";
import type { Metadata } from "next";
import { BancoEjercicios } from "@/components/vanguard/academia/BancoEjercicios";

export const metadata: Metadata = {
  title: "Banco de Ejercicios y Retos Prácticos | Vanguard Academy",
  description:
    "Desafíos interactivos estilo Brilliant con escenarios reales, pistas guiadas escalonadas y comprobación inmediata.",
};

export default function PaginaBancoEjercicios() {
  return (
    <div className="space-y-8">
      <BancoEjercicios />
    </div>
  );
}
