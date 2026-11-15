// v403.1 LOS DOS MUNDOS — /entrar: la Puerta como página propia (para compartir).
import type { Metadata } from "next";
import { PuertaPagina } from "@/components/mundos/puerta-mundos";

export const metadata: Metadata = {
  title: "Elige tu mundo — Noticias o Juego",
  description: "Dos mundos, una sola casa: entra al mundo de Noticias, el planeta en tiempo real y en español, o al mundo de Juego, con misiones, retos y rango.",
  alternates: { canonical: "/entrar" },
  openGraph: { title: "VANGUARD · Elige tu mundo", description: "Noticias en tiempo real o el Cuartel de juego. Tú eliges.", images: ["/ilustraciones/noticias.jpg"] },
};

export default function Entrar() {
  return (
    <main>
      <h1 className="sr-only">Elige tu mundo en Vanguard: Noticias o Juego</h1>
      <PuertaPagina />
    </main>
  );
}
