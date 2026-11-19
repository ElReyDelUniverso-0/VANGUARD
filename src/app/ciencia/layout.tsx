import type { Metadata } from "next";
import "@/components/ciencia/ciencia.css";

export const metadata: Metadata = {
  title: "Science Frontier · VANGUARD",
  description:
    "Centro mundial de ciencia de VANGUARD: publicaciones reales con enlace original, tipo editorial y nivel de evidencia separados, y un explorador para seguir cómo evoluciona una idea científica.",
};

export default function CienciaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
