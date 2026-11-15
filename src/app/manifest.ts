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
    background_color: "#06080c",
    theme_color: "#06080c",
    lang: "es",
    categories: ["news", "games", "education"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      // v208.0 LA LUPA — iconos PNG reales: Chrome exigía bitmap para el
      // check de instalabilidad e iOS NO soporta SVG como apple-touch-icon
      // (mostraba una captura de la página en vez de la marca).
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // v402.4 ATAJOS — mantener pulsado el icono instalado abre directo las
    // cuatro puertas más usadas (Android/Chrome/Edge; iOS los ignora sin daño).
    shortcuts: [
      { name: "En vivo — el mundo minuto a minuto", short_name: "En vivo", url: "/en-vivo?origen=atajo", icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }] },
      { name: "Mapa 3D — todas las guerras en un globo", short_name: "Mapa 3D", url: "/mundo?origen=atajo", icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }] },
      { name: "La crónica — las claves del día", short_name: "Crónica", url: "/cronica?origen=atajo", icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }] },
      { name: "Cuartel — juego y misiones", short_name: "Cuartel", url: "/cuartel?origen=atajo", icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }] },
    ],
  };
}
