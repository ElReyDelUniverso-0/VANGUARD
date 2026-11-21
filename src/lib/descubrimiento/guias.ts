// ═══════════════════════════════════════════════════════════════════════════
// v435.2 · VANGUARD DISCOVERY SYSTEM — LAS GUÍAS
//
// Cuatro caminos para el que llega (y para el que vuelve y se perdió). Ninguno
// encierra a nadie: cada paso se puede saltar, y en cualquier momento se sale a
// «explorar por mi cuenta» sin perder el progreso.
//
// Regla dura: TODA ruta de una guía existe en el catálogo de fichas. La prueba
// `tools/descubrimiento/probar.mts` falla si alguna deja de existir — una guía
// que lleva a una puerta cerrada es peor que no tener guía.
// ═══════════════════════════════════════════════════════════════════════════

export type Paso = {
  /** ruta real de la casa */
  ruta: string;
  /** qué vas a ver allí, en una línea */
  que: string;
  /** qué hacer, en imperativo y en concreto */
  haz: string;
  /** cuántos minutos, redondeado */
  minutos: number;
};

export type Guia = {
  id: string;
  nombre: string;
  /** para quién es */
  para: string;
  /** qué se aprende */
  promesa: string;
  color: string;
  pasos: Paso[];
};

export const GUIAS: Guia[] = [
  {
    id: "primeros-pasos",
    nombre: "Los primeros 5 minutos",
    para: "Acabas de entrar y no sabes por dónde empezar.",
    promesa: "Al final sabrás qué pasa hoy en el mundo, dónde está cada cosa y cómo pedir lo que quieras.",
    color: "#e8c56a",
    pasos: [
      {
        ruta: "/guerra-hoy",
        que: "El resumen del día: los frentes abiertos, con su hora y su fuente.",
        haz: "Lee los tres primeros frentes. No hay que hacer nada más: solo entender qué se está cociendo.",
        minutos: 2,
      },
      {
        ruta: "/en-vivo",
        que: "El teletipo: cables entrando minuto a minuto.",
        haz: "Abre un cable y mira quién lo publicó y de cuándo es. Todo lo que dice la casa lleva fuente.",
        minutos: 1,
      },
      {
        ruta: "/mapas",
        que: "El globo con ocho capas geográficas.",
        haz: "Gira el globo y cambia dos capas. Toca un país y mira adónde te lleva.",
        minutos: 2,
      },
      {
        ruta: "/buscar",
        que: "Un solo campo para toda la casa.",
        haz: "Escribe «zona cero» y entra desde el buscador. Este es tu atajo cuando te pierdas.",
        minutos: 1,
      },
      {
        ruta: "/descubrir",
        que: "Esta misma guía y el mapa completo de la casa.",
        haz: "Vuelve aquí cuando quieras: tu progreso se queda apuntado en tu aparato.",
        minutos: 1,
      },
    ],
  },
  {
    id: "entender-el-mundo",
    nombre: "Entender el mundo",
    para: "Te interesa el análisis: qué pasa, dónde y por qué.",
    promesa: "Del cable suelto al mapa: seguir un conflicto con sus datos y sus protagonistas.",
    color: "#22d3ee",
    pasos: [
      {
        ruta: "/conflictos",
        que: "El tablero de regiones en seguimiento con su intensidad medida.",
        haz: "Ordena por intensidad y quédate con la región más caliente.",
        minutos: 2,
      },
      {
        ruta: "/mundos",
        que: "La ficha de cada país con fronteras reales.",
        haz: "Abre la ficha del país de esa región: vecinos, economía y puente al simulador.",
        minutos: 3,
      },
      {
        ruta: "/zona-cero",
        que: "El ojo de la casa: busca en noticias, países, conocimiento, armas e imágenes a la vez.",
        haz: "Busca el nombre de la región y pega dos hallazgos en tu tablero.",
        minutos: 3,
      },
      {
        ruta: "/teatro-3d",
        que: "Cualquier lugar del planeta convertido en teatro táctico.",
        haz: "Escribe el lugar del conflicto y míralo en 2D y en 3D.",
        minutos: 4,
      },
      {
        ruta: "/zona-cero/mesa",
        que: "La mesa de órdenes: lo que hay que hacer, numerado y con predicciones.",
        haz: "Escribe una orden con su fecha y pulsa predecir para ver en qué se basa.",
        minutos: 3,
      },
    ],
  },
  {
    id: "jugar-y-subir",
    nombre: "Jugar y subir de rango",
    para: "Has venido a jugar: misiones, monedas y progreso.",
    promesa: "Sabrás dónde se gana, qué se desbloquea y cómo se guarda tu avance.",
    color: "#4ade80",
    pasos: [
      {
        ruta: "/academia",
        que: "La escuela: cursos y quizzes a tu ritmo.",
        haz: "Haz la primera lección. Es la forma más rápida de subir sin perder el hilo.",
        minutos: 4,
      },
      {
        ruta: "/mi-universo",
        que: "Tu casa, a tu manera: elige piezas y colócalas.",
        haz: "Quita una pieza que no uses y pon otra. Se guarda en tu cuenta.",
        minutos: 3,
      },
      {
        ruta: "/novedades",
        que: "Lo que acaba de llegar, con su puerta para probarlo.",
        haz: "Prueba una función de la última expansión y vuelve con lo aprendido.",
        minutos: 3,
      },
    ],
  },
  {
    id: "de-vuelta",
    nombre: "Volver sin perderse",
    para: "Ya conoces la casa, pero hace días que no entras.",
    promesa: "Ponerte al día en tres pasos: qué ha cambiado, qué hay de nuevo y qué te perdiste.",
    color: "#f5a623",
    pasos: [
      {
        ruta: "/novedades",
        que: "Lo nuevo de la casa, versión por versión.",
        haz: "Lee las tres últimas novedades y abre una.",
        minutos: 2,
      },
      {
        ruta: "/cronica",
        que: "Qué pasó de verdad en las últimas horas, teatro por teatro.",
        haz: "Lee la crónica del día de arriba abajo: es el resumen más corto de la casa.",
        minutos: 3,
      },
      {
        ruta: "/orden",
        que: "El índice completo de las siete divisiones.",
        haz: "Mira la división que menos conozcas y abre una sala que no hayas visto.",
        minutos: 2,
      },
    ],
  },
];

export const GUIA_POR_ID = new Map(GUIAS.map((g) => [g.id, g]));

/** Total de pasos de una guía (para el tanto por ciento). */
export function totalPasos(id: string): number {
  return GUIA_POR_ID.get(id)?.pasos.length ?? 0;
}

/** El paso actual, acotado a lo que hay (nunca fuera de rango). */
export function pasoDe(id: string, indice: number): Paso | null {
  const guia = GUIA_POR_ID.get(id);
  if (!guia) return null;
  const i = Math.max(0, Math.min(guia.pasos.length - 1, indice));
  return guia.pasos[i] ?? null;
}

/** La primera guía que no está terminada (para el saludo de la casa). */
export function guiaSugerida(completadas: Record<string, number>): Guia {
  for (const g of GUIAS) {
    const hechos = completadas[g.id] ?? 0;
    if (hechos < g.pasos.length) return g;
  }
  return GUIAS[0];
}
