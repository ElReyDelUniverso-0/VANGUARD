// ═══════════════════════════════════════════════════════════════════════════
// v435.2 · VANGUARD DISCOVERY SYSTEM — LO DESTACADO
//
// La sección de novedades que pide el mandato, en su forma más corta: las
// últimas versiones de la casa, cada una con UNA frase y UNA puerta para
// probarla. No es un blog: es un índice de lo que acaba de llegar, con el
// botón al lado.
//
// Cada destacado cita una versión real del repositorio y una ruta que existe
// (la prueba falla si la ruta desaparece). Lo que no tiene puerta propia no se
// lista aquí: ya está contado en /novedades.
// ═══════════════════════════════════════════════════════════════════════════

export type Destacado = {
  /** versión tal cual figura en la casa */
  version: string;
  nombre: string;
  /** qué te da, en una línea */
  que: string;
  /** dónde probarlo */
  ruta: string;
  /** qué hacer allí, en concreto */
  prueba: string;
};

export const DESTACADOS: Destacado[] = [
  {
    version: "v435.2",
    nombre: "Sistema de descubrimiento",
    que: "La casa se explica sola: guías, fichas por sala, ejemplos y tu progreso.",
    ruta: "/descubrir",
    prueba: "Elige una guía y da el primer paso; el resto queda apuntado.",
  },
  {
    version: "v434.2",
    nombre: "La mesa de órdenes",
    que: "La Zona Cero gana el papel: órdenes numeradas, tablero, capturas y predicciones.",
    ruta: "/zona-cero/mesa",
    prueba: "Escribe la orden 1, señala el tablero y pulsa predecir.",
  },
  {
    version: "v434.1",
    nombre: "Cada sala con su URL",
    que: "Las 156 salas tienen dirección propia: se pueden enlazar y compartir.",
    ruta: "/orden",
    prueba: "Abre una sala desde el índice y copia su dirección.",
  },
  {
    version: "v433.0",
    nombre: "Siete módulos, un universo",
    que: "La casa entera en siete divisiones; fuera los menús que se tapaban.",
    ruta: "/orden",
    prueba: "Recorre las siete divisiones de arriba abajo.",
  },
  {
    version: "v431.6",
    nombre: "El cuaderno",
    que: "Escribir, señalar el tramo que importa, unir piezas con hilos y verlo en 3D.",
    ruta: "/cuaderno",
    prueba: "Escribe una nota, subraya una idea y arrastra el tablero.",
  },
  {
    version: "v420.0",
    nombre: "Lingua",
    que: "Las lenguas del mundo: familias, mapa, escrituras y pronunciación.",
    ruta: "/lingua",
    prueba: "Busca una palabra y escucha cómo suena.",
  },
  {
    version: "v417.0",
    nombre: "Enciclopedia",
    que: "Artículos de fondo con fuentes, imágenes con licencia y fecha de revisión.",
    ruta: "/conocimiento/enciclopedia",
    prueba: "Abre un artículo y mira su fecha y sus fuentes al pie.",
  },
  {
    version: "v405.12",
    nombre: "El mapa de los mundos",
    que: "249 países con ficha, 177 con fronteras reales y doce capas de datos.",
    ruta: "/mundos",
    prueba: "Abre tu propio país y compara su ficha con la de un vecino.",
  },
];

/** Los destacados de arriba (los más nuevos primero, tal como están escritos). */
export function ultimosDestacados(cuantos = 4): Destacado[] {
  return DESTACADOS.slice(0, Math.max(1, cuantos));
}
