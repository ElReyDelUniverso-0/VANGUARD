import React from "react";
import type { Metadata } from "next";
import { NavegacionAcademia } from "@/components/vanguard/academia/NavegacionAcademia";

export const metadata: Metadata = {
  title: "Vanguard Academy | Plataforma Educativa Interactiva",
  description:
    "Academia interdisciplinar interactiva en Vanguard: cursos modulares, rutas a medida, ejercicios numéricos estilo Brilliant, tarjetas de estudio y certificados de logro formativo con privacidad local absoluta.",
};

export default function LayoutAcademia({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <NavegacionAcademia />
        {children}
      </div>
    </div>
  );
}
