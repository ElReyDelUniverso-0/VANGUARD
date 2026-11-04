// ============================================================
// v237.0 EL RELIEVE — FUENTE ÚNICA de las pieles del planeta.
// La casa jamás duplica una constante: las cuatro salas 3D
// (globe-3d, globe-map-3d, tierra-panel, conquistas-3d-panel)
// repartían las rutas de las texturas ESCRITAS A MANO desde v7
// (el mapa VIEW_TEXTURES vivía duplicado en dos archivos y el
// tipo GlobeViewMode también) — una sola fuente ahora.
//
// Cliente-seguro: constantes puras, cero imports, cero BD/red
// (ley de la casa para todo lo que cruza la frontera client).
//
// EL RELIEVE A DIETA: el heightmap earth-topology (2048x1024
// gris) pesaba 378 KB en PNG y quedó fuera de la dieta v199
// (EL TURBO puso blue-marble 1427→208 KB y night 698→85 KB con
// quality 78). Ahora viaja como WebP q95: 124 KB (−67 %), error
// medido píxel a píxel contra el original — Δmedio 0.28/255,
// Δmax 7/255 en crestas: el ojo no nota diferencia y el relieve
// del planeta queda intacto. El NEGATIVO ORIGINAL (PNG) no se
// borra jamás: sigue servido junto al WebP, como constancia.
// ============================================================

export type GlobeViewMode = "oscuridad" | "satelite" | "noche";

/** el relieve del planeta que sostiene todas las pieles (v237: a dieta) */
export const TEXTURA_RELIEVE = "/assets/globe/earth-topology.webp";

/** el negativo original — la casa no borra obra; sirve como constancia */
export const TEXTURA_RELIEVE_ORIGINAL = "/assets/globe/earth-topology.png";

/** pieles por modo de vista (v31): la misma en las cuatro salas 3D */
export const TEXTURAS_VISTA: Record<GlobeViewMode, string> = {
  oscuridad: "/assets/globe/earth-dark.jpg",
  satelite: "/assets/globe/earth-blue-marble.jpg",
  noche: "/assets/globe/earth-night.jpg",
};
