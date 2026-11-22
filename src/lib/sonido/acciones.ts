// ═══════════════════════════════════════════════════════════════════════════
// v436.2 · EL CATÁLOGO DE VOCES — un sonido propio para cada acción
//
// El Dueño: «sonidos únicos para cada acción en Vanguard». Únicos de verdad, no
// el mismo bip con otra altura: cada acción elige su TIMBRE (madera = cuerpo,
// campana = aire, tono = color, ruido = piel), su INTERVALO, su DURACIÓN, su
// MEZCLA de sala y su momento. Dos acciones no comparten receta — la prueba
// (`tools/sonido/probar.mts`) falla si alguna se repite.
//
// Reglas de la casa que esta mesa respeta:
//   · Nada suena solo: se llama desde un gesto. El contexto se despierta al
//     primer toque (lib/sonido/tocar.ts).
//   · Registro medio-grave y ganancias bajas (≤ 0,09): se oye, no se sufre.
//     Nada de arpegios de juguete ni de chirridos: la casa es sobria.
//   · Silencio honrado: con el sonido apagado o en modo calma, esto no suena.
//   · Sin assets: ni un mp3, ni un wav. Todo se sintetiza (lib/sound.ts).
//
// Este archivo es PURO (datos + funciones sin DOM) para poder probarlo en node.
// ═══════════════════════════════════════════════════════════════════════════

import type { NotaVoz } from "@/lib/sound";

export type Voz = {
  /** qué se oye, en palabras — para la ficha y para la prueba */
  que: string;
  /** los golpes, en orden */
  notas: NotaVoz[];
  /** milisegundos mínimos entre dos disparos de la misma acción (anti-metralleta) */
  cada: number;
  /** familia sonora, para agrupar y para no repetir carácter */
  familia: "cuerpo" | "aire" | "color" | "piel" | "mixta";
};

const N = (n: NotaVoz): NotaVoz => n;

export const ACCIONES = {
  // ── la puerta y el viaje ────────────────────────────────────────────────
  "entrar-casa": {
    que: "llegar: dos golpes graves que suben, como abrir una puerta pesada",
    familia: "cuerpo",
    cada: 900,
    notas: [N({ tipo: "madera", f: 147, d: 0.22, g: 0.05 }), N({ tipo: "campana", f: 294, d: 0.6, g: 0.035, cuando: 0.1 })],
  },
  viaje: {
    que: "viajar a una sala: una campana con cola de sala",
    familia: "aire",
    cada: 260,
    notas: [N({ tipo: "campana", f: 587.33, d: 0.5, g: 0.032 }), N({ tipo: "campana", f: 880, d: 0.75, g: 0.026, cuando: 0.09 })],
  },
  "sala-nueva": {
    que: "pisar una sala por primera vez: aire + tercera, el sonido del descubrimiento",
    familia: "mixta",
    cada: 700,
    notas: [
      N({ tipo: "ruido", d: 0.06, g: 0.02 }),
      N({ tipo: "campana", f: 523.25, d: 0.42, g: 0.03, cuando: 0.03 }),
      N({ tipo: "campana", f: 659.25, d: 0.6, g: 0.028, cuando: 0.13 }),
    ],
  },

  // ── el descubrimiento ───────────────────────────────────────────────────
  "panel-abrir": {
    que: "abrir el mapa: una madera corta con un hilo de aire detrás",
    familia: "cuerpo",
    cada: 90,
    notas: [N({ tipo: "madera", f: 392, d: 0.07, g: 0.04 }), N({ tipo: "tono", f: 784, d: 0.22, g: 0.014, cuando: 0.02, onda: "sine", verb: 0.3 })],
  },
  "panel-cerrar": {
    que: "cerrar el mapa: la misma madera, cayendo",
    familia: "cuerpo",
    cada: 90,
    notas: [N({ tipo: "madera", f: 294, d: 0.06, g: 0.036 }), N({ tipo: "madera", f: 196, d: 0.09, g: 0.028, cuando: 0.05 })],
  },
  pestana: {
    que: "cambiar de cara: un toque seco y agudo, sin cola",
    familia: "cuerpo",
    cada: 60,
    notas: [N({ tipo: "madera", f: 660, d: 0.035, g: 0.028 })],
  },
  "paso-hecho": {
    que: "dar un paso por hecho: sello de madera y una campana que confirma",
    familia: "mixta",
    cada: 220,
    notas: [N({ tipo: "madera", f: 220, d: 0.08, g: 0.045 }), N({ tipo: "campana", f: 659.25, d: 0.34, g: 0.03, cuando: 0.06 })],
  },
  "paso-ir": {
    que: "ir a un paso de la guía: madera que empuja hacia delante",
    familia: "cuerpo",
    cada: 160,
    notas: [N({ tipo: "madera", f: 349.23, d: 0.06, g: 0.038 }), N({ tipo: "madera", f: 466.16, d: 0.08, g: 0.03, cuando: 0.06 })],
  },
  "guia-elegida": {
    que: "elegir un camino: dos campanas en tercera, sin ruido",
    familia: "aire",
    cada: 200,
    notas: [N({ tipo: "campana", f: 440, d: 0.3, g: 0.03 }), N({ tipo: "campana", f: 554.37, d: 0.45, g: 0.026, cuando: 0.1 })],
  },
  sorpresa: {
    que: "la sorpresa: un barrido de aire y cuatro notas que escapan",
    familia: "piel",
    cada: 600,
    notas: [
      N({ tipo: "ruido", d: 0.16, g: 0.022 }),
      N({ tipo: "campana", f: 392, d: 0.12, g: 0.028, cuando: 0.05 }),
      N({ tipo: "campana", f: 523.25, d: 0.12, g: 0.028, cuando: 0.12 }),
      N({ tipo: "campana", f: 698.46, d: 0.12, g: 0.026, cuando: 0.19 }),
      N({ tipo: "campana", f: 1046.5, d: 0.3, g: 0.024, cuando: 0.26 }),
    ],
  },
  filtro: {
    que: "filtrar por división: un golpe grave y corto, de madera oscura",
    familia: "cuerpo",
    cada: 70,
    notas: [N({ tipo: "madera", f: 174.61, d: 0.05, g: 0.038 })],
  },
  buscar: {
    que: "buscar: un tono limpio que abre el oído, sin insistir",
    familia: "color",
    cada: 240,
    notas: [N({ tipo: "tono", f: 784, d: 0.1, g: 0.016, onda: "sine", verb: 0.2 })],
  },
  "ficha-abrir": {
    que: "desplegar una ficha: aire corto y una nota que se abre",
    familia: "aire",
    cada: 90,
    notas: [N({ tipo: "ruido", d: 0.045, g: 0.016 }), N({ tipo: "tono", f: 587.33, d: 0.16, g: 0.015, cuando: 0.02, onda: "triangle", verb: 0.2 })],
  },
  "ficha-cerrar": {
    que: "plegar la ficha: la nota se cierra hacia abajo",
    familia: "color",
    cada: 90,
    notas: [N({ tipo: "tono", f: 493.88, d: 0.13, g: 0.014, onda: "triangle", verb: 0.15 }), N({ tipo: "tono", f: 369.99, d: 0.16, g: 0.012, cuando: 0.04, onda: "triangle" })],
  },
  "progreso-subir": {
    que: "subir de porcentaje: tres notas escalonadas, la última con aire",
    familia: "color",
    cada: 320,
    notas: [
      N({ tipo: "tono", f: 440, d: 0.1, g: 0.016, onda: "sine" }),
      N({ tipo: "tono", f: 554.37, d: 0.1, g: 0.016, cuando: 0.07, onda: "sine" }),
      N({ tipo: "campana", f: 659.25, d: 0.28, g: 0.024, cuando: 0.14 }),
    ],
  },
  "modo-libre": {
    que: "elegir el modo libre: un solo campanón grave, la casa se calla",
    familia: "aire",
    cada: 500,
    notas: [N({ tipo: "campana", f: 196, d: 0.9, g: 0.03 })],
  },
  reiniciar: {
    que: "reiniciar la memoria: el aire se vacía y la madera cierra",
    familia: "piel",
    cada: 800,
    notas: [N({ tipo: "ruido", d: 0.22, g: 0.02 }), N({ tipo: "madera", f: 130.81, d: 0.16, g: 0.038, cuando: 0.18 })],
  },

  // ── lo que hace la casa cuando trabajas ─────────────────────────────────
  copiar: {
    que: "copiar al portapapeles: dos toques de cristal, muy cortos",
    familia: "aire",
    cada: 300,
    notas: [N({ tipo: "campana", f: 1567.98, d: 0.06, g: 0.018 }), N({ tipo: "campana", f: 2093, d: 0.1, g: 0.014, cuando: 0.05 })],
  },
  guardar: {
    que: "guardar: madera firme y una campana de archivo",
    familia: "mixta",
    cada: 400,
    notas: [N({ tipo: "madera", f: 261.63, d: 0.07, g: 0.04 }), N({ tipo: "campana", f: 783.99, d: 0.3, g: 0.024, cuando: 0.05 })],
  },
  predecir: {
    que: "pedir una predicción: motor grave y una campana que responde",
    familia: "mixta",
    cada: 1200,
    notas: [
      N({ tipo: "tono", f: 110, d: 0.4, g: 0.03, onda: "sawtooth", verb: 0.2 }),
      N({ tipo: "tono", f: 220, d: 0.3, g: 0.012, cuando: 0.12, onda: "square", verb: 0.1 }),
      N({ tipo: "campana", f: 880, d: 0.4, g: 0.022, cuando: 0.34 }),
    ],
  },
  deshacer: {
    que: "deshacer: la nota va hacia atrás, descendiendo",
    familia: "color",
    cada: 200,
    notas: [N({ tipo: "tono", f: 587.33, d: 0.12, g: 0.014, onda: "triangle" }), N({ tipo: "tono", f: 440, d: 0.18, g: 0.012, cuando: 0.06, onda: "triangle" })],
  },
  logro: {
    que: "un logro de la casa: cuatro campanas, la última abierta",
    familia: "aire",
    cada: 1500,
    notas: [
      N({ tipo: "campana", f: 523.25, d: 0.16, g: 0.03 }),
      N({ tipo: "campana", f: 659.25, d: 0.16, g: 0.03, cuando: 0.09 }),
      N({ tipo: "campana", f: 783.99, d: 0.16, g: 0.03, cuando: 0.18 }),
      N({ tipo: "campana", f: 1046.5, d: 0.55, g: 0.028, cuando: 0.27 }),
    ],
  },
  aviso: {
    que: "un aviso sin alarma: dos notas iguales, separadas, en tono medio",
    familia: "color",
    cada: 900,
    notas: [N({ tipo: "tono", f: 440, d: 0.12, g: 0.02, onda: "sine" }), N({ tipo: "tono", f: 440, d: 0.12, g: 0.016, cuando: 0.16, onda: "sine" })],
  },
  error: {
    que: "algo no salió: madera grave, dos golpes que no suben",
    familia: "cuerpo",
    cada: 500,
    notas: [N({ tipo: "madera", f: 174.61, d: 0.12, g: 0.04 }), N({ tipo: "madera", f: 146.83, d: 0.18, g: 0.036, cuando: 0.1 })],
  },
  "permiso-voz": {
    que: "el micrófono se abre: el motivo de la casa en tres notas",
    familia: "mixta",
    cada: 2000,
    notas: [
      N({ tipo: "madera", f: 220, d: 0.09, g: 0.04 }),
      N({ tipo: "campana", f: 440, d: 0.3, g: 0.028, cuando: 0.18 }),
      N({ tipo: "campana", f: 330, d: 0.5, g: 0.024, cuando: 0.4 }),
    ],
  },
  // ── el mercado (v437.2) ─────────────────────────────────────────────────
  "puesto-abrir": {
    que: "abrir un puesto: madera que cede y una campana corta, como una lona que se sube",
    familia: "mixta",
    cada: 240,
    notas: [
      N({ tipo: "madera", f: 196, d: 0.1, g: 0.042 }),
      N({ tipo: "ruido", d: 0.05, g: 0.016, cuando: 0.02 }),
      N({ tipo: "campana", f: 659.25, d: 0.42, g: 0.026, cuando: 0.07 }),
    ],
  },
  "puesto-cerrar": {
    que: "cerrar un puesto: la misma madera, el aire que se recoge y una campana que baja",
    familia: "mixta",
    cada: 240,
    notas: [
      N({ tipo: "ruido", d: 0.06, g: 0.014 }),
      N({ tipo: "madera", f: 146.83, d: 0.12, g: 0.04, cuando: 0.03 }),
      N({ tipo: "campana", f: 440, d: 0.36, g: 0.022, cuando: 0.1 }),
    ],
  },
  moneda: {
    que: "una moneda que cambia de mano: dos campanas muy juntas y un cobre al final",
    familia: "aire",
    cada: 180,
    notas: [
      N({ tipo: "campana", f: 1046.5, d: 0.16, g: 0.02 }),
      N({ tipo: "campana", f: 1318.51, d: 0.24, g: 0.016, cuando: 0.05 }),
      N({ tipo: "madera", f: 261.63, d: 0.08, g: 0.022, cuando: 0.11 }),
    ],
  },
  "mercado-musica": {
    que: "la entrada de la contradanza de la plaza: campana en Do y el bajo que marca el pulso",
    familia: "mixta",
    cada: 500,
    notas: [
      N({ tipo: "campana", f: 523.25, d: 0.8, g: 0.018 }),
      N({ tipo: "madera", f: 130.81, d: 0.5, g: 0.03, cuando: 0.02 }),
      N({ tipo: "tono", f: 523.25, d: 0.55, g: 0.016, cuando: 0.02, onda: "triangle", verb: 0.12 }),
    ],
  },
  // ── la salida del módulo (v437.2) ───────────────────────────────────────
  "destruir": {
    que: "el módulo que se rompe: un ruido que cae, madera grave y una campana que se va lejos",
    familia: "mixta",
    cada: 1400,
    notas: [
      N({ tipo: "ruido", d: 0.18, g: 0.03 }),
      N({ tipo: "madera", f: 98, d: 0.3, g: 0.045, cuando: 0.04 }),
      N({ tipo: "campana", f: 73.42, d: 0.9, g: 0.028, cuando: 0.14 }),
    ],
  },
  silencio: {
    que: "apagar el sonido: un toque que se queda sin aire",
    familia: "cuerpo",
    cada: 400,
    notas: [N({ tipo: "madera", f: 246.94, d: 0.06, g: 0.03 }), N({ tipo: "tono", f: 246.94, d: 0.2, g: 0.008, cuando: 0.03, onda: "sine" })],
  },
} satisfies Record<string, Voz>;

export type Accion = keyof typeof ACCIONES;

export const TODAS: Accion[] = Object.keys(ACCIONES) as Accion[];

/** ¿Existe esta acción? Sirve para leer atributos del DOM sin romper nada. */
export function esAccion(x: unknown): x is Accion {
  return typeof x === "string" && Object.prototype.hasOwnProperty.call(ACCIONES, x);
}

/** La huella de una acción: timbre + altura + duración + momento de cada golpe. */
export function firma(accion: Accion): string {
  return ACCIONES[accion].notas
    .map((n) => `${n.tipo}${n.f ? `:${n.f}` : ""}:${n.d}:${n.cuando ?? 0}`)
    .join("|");
}

/** Todas las firmas distintas que hay en la casa. */
export function firmasUnicas(): string[] {
  return [...new Set(TODAS.map(firma))];
}

/** El golpe más largo de la acción, en segundos (para no solapar avisos). */
export function duracionDe(accion: Accion): number {
  return ACCIONES[accion].notas.reduce((max, n) => Math.max(max, (n.cuando ?? 0) + n.d), 0);
}

// ── El portero: la única ley de si algo puede sonar ───────────────────────
export type EstadoSonido = {
  /** el Dueño apagó el sonido de la casa */
  mudo: boolean;
  /** hay una sala de lectura abierta o pidió silencio (lib/calma.ts) */
  calma: boolean;
  /** ya hubo un gesto: sin gesto el navegador no deja sonar nada */
  gesto: boolean;
  /** la pestaña está oculta: ni un sonido mientras no mires */
  oculto?: boolean;
};

export function puedeSonar(e: EstadoSonido): boolean {
  if (e.mudo) return false;
  if (e.calma) return false;
  if (!e.gesto) return false;
  if (e.oculto) return false;
  return true;
}

/** El último disparo por acción: el anti-metralleta vive aquí, no en el DOM. */
const ultimo: Record<string, number> = {};

/** ¿Toca ya? (función pura respecto al reloj que se le pasa: se puede probar) */
export function tocaAhora(accion: Accion, ahora: number): boolean {
  const previo = ultimo[accion] ?? -Infinity;
  return ahora - previo >= ACCIONES[accion].cada;
}

export function marcarDisparo(accion: Accion, ahora: number): void {
  ultimo[accion] = ahora;
}

/** Solo para la prueba: deja el anti-metralleta como recién arrancado. */
export function olvidarDisparos(): void {
  for (const k of Object.keys(ultimo)) delete ultimo[k];
}

/** La acción por defecto de un botón que no dice nada: la madera de la casa. */
export const ACCION_POR_DEFECTO: Accion = "panel-abrir";
