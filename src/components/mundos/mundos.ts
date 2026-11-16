// ============================================================
// v405.9 UNA SOLA PORTADA — orden del Dueño: «las salas de juego fusiónalas con
// el VANGUARD de portada, el de noticias en un solo VANGUARD». Las dos puertas
// (Noticias y Juego) ya no llevan ilustraciones distintas: las dos enseñan la
// MISMA portada de la casa (public/portada-vanguard.jpg, foto real de la NASA
// en 3840x1920). La identidad no se parte en dos al entrar.
//
// v403.1 LOS DOS MUNDOS — orden del Dueño: «Vanguard tiene dos mundos, el de
// los juegos y el mundo de noticias: crear intro para entrar a esos mundos de
// manera épica». Fuente única de qué ruta pertenece a qué mundo: el módulo
// Juego (modulos.ts) es el MUNDO JUEGO; todo lo demás es el MUNDO NOTICIAS.
// Las cuentas salen de modulos.ts (cero cifras a mano).
// ============================================================
import { MODULOS, MODULOS_PUBLICOS, moduloDe } from "@/components/portada/modulos";

export type Mundo = "noticias" | "juego";

const SIN_MUNDO = ["/entrar", "/offline", "/api", "/estado", "/novedades", "/calidad", "/torre", "/catalogo", "/nucleo", "/escudo", "/privacidad"];
const DEL_JUEGO = ["/clasico", "/modulo/juego"];

export function mundoDe(ruta: string | null): Mundo | null {
  if (!ruta) return null;
  if (SIN_MUNDO.some((r) => ruta === r || ruta.startsWith(r + "/"))) return null;
  if (DEL_JUEGO.some((r) => ruta === r || ruta.startsWith(r + "/"))) return "juego";
  return moduloDe(ruta)?.id === "juego" ? "juego" : "noticias";
}

const JUEGO = MODULOS.find((m) => m.id === "juego");
const NOTICIAS = MODULOS_PUBLICOS.filter((m) => m.id !== "juego");

export const FICHA_MUNDOS = {
  noticias: {
    n: "01",
    nombre: "Noticias",
    lema: "Lo que pasa en el planeta, ahora",
    texto: "Conflictos en vivo, el globo 3D, conocimiento, secretos, arsenal, datos vivos y medios. Todo con su fuente.",
    img: "/portada-vanguard.jpg",
    destino: "/",
    chips: NOTICIAS.map((m) => m.corto),
    modulos: NOTICIAS.length,
    salas: NOTICIAS.reduce((t, m) => t + m.pestanas.length, 0),
    sub: "Conectando al cable",
  },
  juego: {
    n: "02",
    nombre: "Juego",
    lema: "Misiones, rango y gloria",
    texto: "El Cuartel, misiones diarias, retos, torneos, colecciones y un carnet de agente que sube de rango contigo.",
    img: "/portada-vanguard.jpg",
    destino: "/cuartel",
    chips: (JUEGO?.pestanas ?? []).map((p) => p.label),
    modulos: 1,
    salas: JUEGO?.pestanas.length ?? 0,
    sub: "Abriendo el Cuartel",
  },
} as const;

export const CLAVE_VISTA = "vg-puerta-v1"; // localStorage: ya cruzó la Puerta una vez
export const CLAVE_MUNDO = "vg-mundo"; // sessionStorage: mundo actual de esta visita
export const EVENTO_ABRIR = "vg-abrir-puerta";
