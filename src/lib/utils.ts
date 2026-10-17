import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** v125.0 CORRECCIÓN TOTAL — cuantizador anti-hidratación:
 *  React server redondea los números de estilo a 6 cifras significativas y los
 *  navegadores recortan tiempos CSS; un float largo (83.29604581548776) llegaba
 *  distinto a cada lado → error de hidratación y botones muertos al arrancar.
 *  Todo valor que entra a un style={...} de SSR pasa por aquí (2 decimales). */
export function q2(v: number): number {
  return Math.round(v * 100) / 100;
}
