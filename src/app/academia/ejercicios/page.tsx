import React from "react";
import type { Metadata } from "next";
import { BancoEjercicios } from "@/components/vanguard/academia/BancoEjercicios";

export const metadata: Metadata = {
  title: "Banco de Ejercicios y Retos Prácticos | Vanguard Academy",
  description:
    "Desafíos interactivos estilo Brilliant con escenarios reales, pistas guiadas escalonadas y comprobación inmediata.",
  // v421.1 — su canónica propia. Antes la heredaba del layout raíz («/»),
  // que en la práctica le pedía a Google que la tratase como duplicado de la
  // portada. Medida en vivo: canónica a https://…/ en una página con 200.
  alternates: { canonical: "/academia/ejercicios" },
};

export default function PaginaBancoEjercicios() {
  return (
    <div className="space-y-8">
      <BancoEjercicios />
    </div>
  );
}
