// ============================================================
// v403.1 LOS DOS MUNDOS → v432.0 UN SOLO MUNDO
// Orden nueva del Dueño: «fusiona los dos mundos de Vanguard en un solo mundo,
// la portada y el del juego; todos esos módulos con un mismo estilo, cada uno
// con su información». Ya no hay Noticias contra Juego: el juego es un módulo
// más de la casa, bajo la misma carcasa y la misma piel. La Puerta conserva su
// entrada épica, pero ahora ofrece la casa entera y su centro: la Zona Cero.
// Las cuentas salen de modulos.ts (cero cifras a mano).
// ============================================================
import { MODULOS_PUBLICOS } from "@/components/portada/modulos";

/** Las dos salidas de la Puerta: la casa entera y su centro. */
export type Salida = "vanguard" | "zona";

export const FICHA_SALIDAS = {
  vanguard: {
    n: "01",
    nombre: "Vanguard",
    lema: "Un solo mundo",
    texto:
      "Noticias en vivo, el globo, conocimiento, simulación, arsenal y el juego con tu rango: todo en la misma casa, con el mismo estilo y cada módulo con su información.",
    img: "/ilustraciones/noticias.jpg",
    destino: "/",
    chips: MODULOS_PUBLICOS.map((m) => m.corto),
    modulos: MODULOS_PUBLICOS.length,
    salas: MODULOS_PUBLICOS.reduce((t, m) => t + m.pestanas.length, 0),
    sub: "Abriendo la casa",
  },
  zona: {
    n: "00",
    nombre: "Zona Cero",
    lema: "El ojo de Vanguard",
    texto:
      "Una zona oscura con el ojo de la casa en el centro: tócalo, busca en todos los módulos y pega aquí noticias, países, armas, conocimiento e imágenes.",
    img: "/ilustraciones/ojo-dios.jpg",
    destino: "/zona-cero",
    chips: ["Buscar", "Pegar", "Noticias", "Países", "Armas", "Imágenes"],
    modulos: MODULOS_PUBLICOS.length,
    salas: 0,
    sub: "Abriendo el ojo",
  },
} as const;

export const CLAVE_VISTA = "vg-puerta-v1"; // localStorage: ya cruzó la Puerta una vez
export const EVENTO_ABRIR = "vg-abrir-puerta";
