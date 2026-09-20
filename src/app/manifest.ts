import type { MetadataRoute } from "next";

// v18 PWA: manifiesto instalable — los usuarios pueden "Añadir a pantalla
// de inicio" y VANGUARD se comporta como app nativa (clave para retención).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    short_name: "VANGUARD",
    description:
      "Noticias de guerra en vivo, mapa OSINT 3D, guerra global multijugador, duelos 1v1 con ELO, simulador de guerras y más. Gratis, en español.",
    id: "/",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0A0A0F",
    theme_color: "#0A0A0F",
    lang: "es",
    categories: ["news", "games", "education"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
