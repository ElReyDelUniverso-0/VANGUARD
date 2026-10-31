// ============================================================
// v214.0 LA PUERTA — EL CATÁLOGO DE MODOS DE VANGUARD
// «Poner un modo de seleccionar dónde quiere ir o qué quieren
// hacer en Vanguard». Cada modo es una PUERTA REAL de la casa
// (rutas que ya viven en producción), no un concepto nuevo:
//   · EL VÉRTIGO  → /vertigo     (v211 — el feed infinito)
//   · EN VIVO     → /en-vivo     (v213 — la redacción 24 h)
//   · GUERRA HOY  → /guerra-hoy  (el planeta vigilado + Ojo de Dios)
//   · ZONA CERO   → /zona-cero   (la ciudad que cae en vivo)
//   · MISIONES    → /mision      (la misión comunitaria)
//   · VANGUARD TODO → /          (la portada total)
// Puro dato, sin ventana: lo leen el ritual (client), la página
// /modo y el servidor (validación del registro y de /api/auth/modo).
// El Navegador v105 sigue mandando DENTRO del SPA (intenciones);
// los modos mandan ENTRE páginas — dos brújulas, cero pelea.
// ============================================================

export interface ModoVanguard {
  id: string;
  emoji: string;
  nombre: string;
  lema: string;
  detalle: string;
  ruta: string;
  hex: string;
}

export const MODOS: ModoVanguard[] = [
  {
    id: "vertigo",
    emoji: "📱",
    nombre: "EL VÉRTIGO",
    lema: "El mundo en deslizamientos",
    detalle: "Cada cable a pantalla completa: deslizas y la siguiente pieza del planeta encaja. Doble toque para latir ❤️.",
    ruta: "/vertigo",
    hex: "#FFC94D",
  },
  {
    id: "envivo",
    emoji: "🔴",
    nombre: "EN VIVO",
    lema: "La redacción abierta 24 h",
    detalle: "Última hora minuto a minuto, LO MÁS CALIENTE y exactitud visible: hora, fuente y sello en cada cable.",
    ruta: "/en-vivo",
    hex: "#FF3B30",
  },
  {
    id: "guerra",
    emoji: "⚔️",
    nombre: "GUERRA HOY",
    lema: "Frentes, mapa y Ojo de Dios",
    detalle: "El planeta vigilado: teatros, unidades, leyenda del globo y el pulso de última hora sobre el panel.",
    ruta: "/guerra-hoy",
    hex: "#FFA030",
  },
  {
    id: "zonacero",
    emoji: "🌆",
    nombre: "ZONA CERO",
    lema: "La ciudad que cae en vivo",
    detalle: "El espectáculo único de Vanguard: una ciudad en directo, bloque a bloque, mientras el mundo arde.",
    ruta: "/zona-cero",
    hex: "#A855F7",
  },
  {
    id: "misiones",
    emoji: "🎯",
    nombre: "MISIONES",
    lema: "Tu misión comunitaria",
    detalle: "La misión del día, retos semanales y el progreso que paga tu tiempo en monedas y XP.",
    ruta: "/mision",
    hex: "#3DDC97",
  },
  {
    id: "todo",
    emoji: "🌐",
    nombre: "VANGUARD TODO",
    lema: "La portada total",
    detalle: "La casa completa: redacción, mente, sensores, juegos y comunidad — todo a un salto, como siempre.",
    ruta: "/",
    hex: "#38BDF8",
  },
];

/** ¿Existe ese modo? (validación server + client) */
export function esModoValido(id: string): boolean {
  return MODOS.some((m) => m.id === id);
}

/** Devuelve el modo por id (null si no existe). */
export function modoDe(id: string | null | undefined): ModoVanguard | null {
  if (!id) return null;
  return MODOS.find((m) => m.id === id) ?? null;
}
