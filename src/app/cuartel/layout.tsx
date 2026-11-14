import type { Metadata } from "next";

// v400.0 EL REDISEÑO — el cuartel (la app de juego y salas de siempre) vive
// ahora en /cuartel; la portada "/" es la redacción nueva.
export const metadata: Metadata = {
  title: "Cuartel — juego, misiones y salas",
  description: "El cuartel de VANGUARD: guerra global multijugador, misiones, quiz, mercado, simulador y todas las salas.",
  alternates: { canonical: "/cuartel" },
};

export default function CuartelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
