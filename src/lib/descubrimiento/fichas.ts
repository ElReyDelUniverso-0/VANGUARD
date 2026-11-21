// ═══════════════════════════════════════════════════════════════════════════
// v434.4 · VANGUARD DISCOVERY SYSTEM — LAS FICHAS (qué es cada sala)
//
// Mandato del Dueño: «crear una guía interactiva para nuevos visitantes,
// incorporar explicaciones breves en los módulos, añadir ejemplos de lo que
// puede hacer cada herramienta, facilitar el descubrimiento de módulos, crear
// una sección de novedades y funciones destacadas, permitir que el usuario
// descubra Vanguard sin sentirse perdido, SIN eliminar la libertad de explorar
// por su cuenta».
//
// Regla de la casa que este fichero respeta al pie de la letra: NO inventar
// catálogo. Las fichas salen de `lib/operacion/orden` (el árbol de las siete
// divisiones) que a su vez sale de `modulos.ts` — la fuente única. Cada sala ya
// traía su `txt` (una línea de qué es) y su `img`. Aquí solo se ordenan, se les
// añaden EJEMPLOS concretos y se les da una forma que la pantalla pueda pintar.
//
// Los ejemplos de las salas insignia están escritos a mano con las mecánicas
// reales de cada una (capas del globo, ojo de la Zona Cero, mesa de órdenes…).
// El resto se derivan de su propia descripción declarada: nunca de relleno.
//
// Puro: sin red, sin almacenamiento, sin React. Se prueba con
// `npx tsx tools/descubrimiento/probar.mts`.
// ═══════════════════════════════════════════════════════════════════════════

import { ARBOL } from "@/lib/operacion/orden";

export type Ficha = {
  href: string;
  nombre: string;
  /** qué es esta sala, en una línea (la de la casa, no inventada) */
  que: string;
  /** qué puedes hacer aquí, en concreto */
  ejemplos: string[];
  /** D-I … D-VII */
  division: string;
  divisionNombre: string;
  /** código del módulo: D-II-M01 */
  codigo: string;
  modulo: string;
  img?: string;
  vivo?: boolean;
  /** el primer paso, ya escrito como acción */
  primerPaso: string;
  /** "sin prisa" (2 min) · "a fondo" (10 min) */
  nivel: "sin prisa" | "a fondo";
};

/**
 * EJEMPLOS ESCRITOS A MANO — solo para las puertas que se visitan primero y
 * para las que tienen mecánicas que no se adivinan. Rutas verificadas contra el
 * catálogo (la prueba falla si alguna deja de existir).
 */
const CURADOS: Record<string, string[]> = {
  "/guerra-hoy": [
    "Abre el resumen del día y mira qué frentes están abiertos ahora mismo",
    "Entra en un frente y sigue sus cables, cada uno con su hora y su fuente",
    "Salta a la crónica de las últimas 24 horas para ver qué pasó de verdad",
  ],
  "/en-vivo": [
    "Mira los cables entrando minuto a minuto, con hora y fuente",
    "Abre uno y lee quién lo publicó y de cuándo es",
    "Deja la sala abierta: se actualiza sola",
  ],
  "/mapas": [
    "Gira el globo y cambia entre sus ocho capas: política, física, económica, demográfica, temática, histórica y de acontecimientos",
    "Enciende la capa de acontecimientos y busca el último cable del día",
    "Toca un país y salta a su ficha con sus fronteras reales",
  ],
  "/mundos": [
    "Elige un mundo (América, Europa, África, Asia u Oceanía) y recórrelo",
    "Abre la ficha de un país: fronteras, vecinos y puente al simulador",
    "Si el 3D va lento en tu aparato, cambia a la vista 2D",
  ],
  "/zona-cero": [
    "Toca el ojo y busca a la vez en las noticias, los países, el conocimiento, las armas y las imágenes de la casa",
    "Pega lo que encuentres en tu tablero para no perderlo",
    "Baja al teatro global y mira la mesa de guerra en 3D",
  ],
  "/zona-cero/mesa": [
    "Escribe la orden 1 y ponle prioridad, fecha y estado",
    "Señala en el tablero dónde está el problema y arrastra la señal",
    "Pega una captura con Ctrl+V y ponle su fuente",
    "Pulsa predecir: cada número trae sus factores y su confianza",
  ],
  "/teatro-3d": [
    "Escribe un lugar cualquiera del planeta y conviértelo en teatro táctico",
    "Pasa de 2D a 3D sin salir de la sala",
    "Carga las unidades del parque militar y colócalas en el terreno",
  ],
  "/conflictos": [
    "Lee el tablero de regiones en seguimiento y su intensidad medida",
    "Ordena por intensidad para ver qué se está calentando",
    "Abre una región y sigue sus cables",
  ],
  "/divisas": [
    "Compara el tipo de cambio de dos monedas",
    "Mira qué se ha movido hoy y cuánto",
    "Cruza la divisa con el país que la usa",
  ],
  "/academia": [
    "Empieza por el primer curso y ve a tu ritmo",
    "Haz un quiz para fijar lo que has leído",
    "Vuelve cada día: la racha se mantiene con una lección",
  ],
  "/mi-universo": [
    "Elige qué piezas quieres en tu casa y arrástralas a tu sitio",
    "Guarda tu disposición: se queda en tu cuenta",
    "Quita lo que no uses: la casa se amolda a ti",
  ],
  "/cuaderno": [
    "Escribe una nota y señala el tramo que importa",
    "Une dos piezas con un hilo para no perder la relación",
    "Arrastra el tablero y mira el mapa 3D de todo lo anotado",
  ],
  "/novedades": [
    "Mira qué llegó en las últimas versiones, cada cosa con su puerta para probarla",
    "Prueba las funciones de la última expansión en vivo",
    "Deja que «Para ti» te ordene lo nuevo según lo que abres",
  ],
  "/buscar": [
    "Escribe el nombre de una sala y entra en un solo toque",
    "Busca un país y salta a su ficha",
    "Úsalo cuando sepas qué quieres pero no dónde está",
  ],
  "/orden": [
    "Recorre las siete divisiones con sus módulos y sus salas",
    "Abre cualquier sala desde el índice, sin menús que se tapen",
    "Vuelve aquí cuando te pierdas: es el mapa de la casa",
  ],
  "/lingua": [
    "Explora las familias de lenguas y su mapa",
    "Escucha la pronunciación de una palabra",
    "Traduce una frase y mira de qué familia es la lengua",
  ],
  "/ciencia": [
    "Lee un tema de ciencia con su fuente",
    "Salta de un concepto a su artículo de fondo",
    "Busca la cifra que necesitas y mira de qué año es",
  ],
  "/atlas": [
    "Busca una nación y mira su capital, población, moneda y líder real",
    "Compara dos fichas sin salir de la sala",
    "Salta del atlas al globo con la misma selección",
  ],
  "/en-vivo#cables": [
    "Sigue el teletipo con la hora y la fuente de cada cable",
  ],
  "/mundo": [
    "Gira el globo y mira los teatros encendidos",
    "Toca un teatro para leer sus cables",
    "Cambia de capa para ver el mundo de otra manera",
  ],
  "/radio": [
    "Pon el pulso del día y déjalo de fondo",
    "Cambia de emisora sin salir de la casa",
    "Sube el volumen a lo que te interese y sigue leyendo",
  ],
  "/descubrir": [
    "Elige una guía y da el primer paso: la casa te lleva de la mano hasta el final",
    "Mira tu progreso y las salas que aún no has abierto",
    "Apaga el modo guía cuando quieras explorar a tu aire",
  ],
  "/pulso-mundial": [
    "Mira los indicadores del Banco Mundial y su año",
    "Sigue la cronología del planeta",
    "Cruza un indicador con un país concreto",
  ],
};

/**
 * Puertas de la casa que existen pero NO están en el árbol de módulos: las
 * nuevas (descubrimiento, mesa de órdenes) y las de servicio (buscar, orden).
 * Se declaran aquí para que la guía pueda llevarte a ellas sin inventar nada.
 */
export const PUERTAS_EXTRA: { href: string; nombre: string; que: string; ejemplos: string[]; division: string; divisionNombre: string }[] = [
  {
    href: "/descubrir",
    nombre: "Descubrir",
    que: "La guía de la casa: por dónde empezar, qué hace cada sala y qué te falta por ver.",
    ejemplos: CURADOS["/descubrir"] ?? [],
    division: "D-0",
    divisionNombre: "La puerta",
  },
  {
    href: "/buscar",
    nombre: "Buscador único",
    que: "Un solo campo para encontrar cualquier sala, país o dato de la casa.",
    ejemplos: CURADOS["/buscar"] ?? [],
    division: "D-0",
    divisionNombre: "La puerta",
  },
  {
    href: "/orden",
    nombre: "Orden de batalla",
    que: "El índice completo: siete divisiones, sus módulos y todas sus salas.",
    ejemplos: CURADOS["/orden"] ?? [],
    division: "D-0",
    divisionNombre: "La puerta",
  },
  {
    href: "/zona-cero/mesa",
    nombre: "Mesa de órdenes",
    que: "El puesto de mando de la Zona Cero: órdenes numeradas, tablero, capturas y predicciones.",
    ejemplos: CURADOS["/zona-cero/mesa"] ?? [],
    division: "D-II",
    divisionNombre: "Terreno",
  },
];

/** Frases que no dicen nada si aparecen solas: se filtran de los ejemplos. */
const RELLENO = /^(aquí|esto|todo|varios|varias|cosas|más|ver|mira|entra)$/i;

/**
 * Ejemplos de una sala: los escritos a mano si existen; si no, los que su
 * propia descripción declara (partiendo por frases y por los dos puntos).
 * Nunca se rellena con una frase vacía.
 */
export function ejemplosDe(href: string, txt: string, nombre: string): string[] {
  const curado = CURADOS[href];
  if (curado && curado.length) return curado.slice(0, 4);

  const base = (txt || "").replace(/\s+/g, " ").trim();
  const trozos: string[] = [];
  for (const s of base.split(/(?<=[.;])\s+/)) {
    const limpio = s.replace(/[.;]$/, "").trim();
    if (limpio.length >= 14 && !RELLENO.test(limpio)) trozos.push(limpio);
  }
  // Si la frase tiene dos puntos, lo que viene detrás son capacidades sueltas
  const conDosPuntos = base.match(/:\s*(.+)$/);
  if (trozos.length < 2 && conDosPuntos) {
    for (const parte of conDosPuntos[1].split(/[,;·]/)) {
      const limpio = parte.replace(/\.$/, "").trim();
      if (limpio.length >= 4) trozos.push(limpio);
    }
  }
  const unicos = Array.from(new Set(trozos)).slice(0, 3);
  if (unicos.length === 0) unicos.push(`Abrir ${nombre} y recorrerlo con calma`);
  return unicos;
}

function nivelDe(href: string): "sin prisa" | "a fondo" {
  const ligero = ["/guerra-hoy", "/en-vivo", "/cronica", "/novedades", "/divisas", "/radio", "/mapas", "/clima", "/buscar", "/descubrir"];
  return ligero.includes(href) ? "sin prisa" : "a fondo";
}

function primerPasoDe(nombre: string, ejemplos: string[]): string {
  const primero = ejemplos[0] ?? `Abrir ${nombre}`;
  return primero.charAt(0).toUpperCase() + primero.slice(1);
}

/** TODAS las fichas: las del árbol de la casa + las puertas nuevas. */
export const FICHAS: Ficha[] = (() => {
  const salida: Ficha[] = [];
  const vistos = new Set<string>();

  for (const division of ARBOL) {
    for (const modulo of division.modulosResueltos) {
      // la portada del módulo (no siempre es una pestaña más)
      if (modulo.nav && !vistos.has(modulo.nav)) {
        vistos.add(modulo.nav);
        const ejemplos = ejemplosDe(modulo.nav, modulo.gancho ?? modulo.lema, modulo.nombre);
        salida.push({
          href: modulo.nav,
          nombre: modulo.nombre,
          que: modulo.lema,
          ejemplos,
          division: division.codigo,
          divisionNombre: division.nombre,
          codigo: modulo.codigo,
          modulo: modulo.nombre,
          img: modulo.img,
          primerPaso: primerPasoDe(modulo.nombre, ejemplos),
          nivel: nivelDe(modulo.nav),
        });
      }
      for (const sala of modulo.salas) {
        if (vistos.has(sala.href)) continue;
        vistos.add(sala.href);
        const pestana = modulo.pestanas.find((p) => p.href === sala.href);
        const txt = pestana?.txt ?? "";
        const ejemplos = ejemplosDe(sala.href, txt, sala.nombre);
        salida.push({
          href: sala.href,
          nombre: sala.nombre,
          que: txt || modulo.lema,
          ejemplos,
          division: division.codigo,
          divisionNombre: division.nombre,
          codigo: modulo.codigo,
          modulo: modulo.nombre,
          img: pestana?.img,
          vivo: pestana?.vivo,
          primerPaso: primerPasoDe(sala.nombre, ejemplos),
          nivel: nivelDe(sala.href),
        });
      }
    }
  }

  for (const extra of PUERTAS_EXTRA) {
    if (vistos.has(extra.href)) continue;
    vistos.add(extra.href);
    salida.push({
      href: extra.href,
      nombre: extra.nombre,
      que: extra.que,
      ejemplos: extra.ejemplos.length ? extra.ejemplos : ejemplosDe(extra.href, extra.que, extra.nombre),
      division: extra.division,
      divisionNombre: extra.divisionNombre,
      codigo: "P-00",
      modulo: "La puerta",
      primerPaso: primerPasoDe(extra.nombre, extra.ejemplos),
      nivel: "sin prisa",
    });
  }

  return salida;
})();

/** Índice por ruta exacta (sin query ni hash) para buscar rápido. */
const POR_RUTA = new Map<string, Ficha>();
for (const f of FICHAS) {
  const limpia = f.href.split("#")[0];
  if (!POR_RUTA.has(limpia)) POR_RUTA.set(limpia, f);
}

/**
 * La ficha de una ruta. Coincidencia exacta primero; si no, la ruta más larga
 * que sea prefijo (para que /mundos/do caiga en /mundos y /zona-cero/mesa en sí
 * misma y no en /zona-cero).
 */
export function fichaDe(ruta: string): Ficha | null {
  const limpia = (ruta || "/").split("#")[0].split("?")[0].replace(/\/+$/, "") || "/";
  const exacta = POR_RUTA.get(limpia);
  if (exacta) return exacta;
  let mejor: Ficha | null = null;
  for (const f of FICHAS) {
    const href = f.href.split("#")[0];
    if (href === "/") continue;
    if (limpia.startsWith(href + "/") && (!mejor || href.length > mejor.href.length)) mejor = f;
  }
  return mejor;
}

/** ¿Existe esta puerta en la casa? (la usan las pruebas y el recomendador) */
export function existePuerta(href: string): boolean {
  const limpia = href.split("#")[0];
  return POR_RUTA.has(limpia) || FICHAS.some((f) => f.href.split("#")[0] === limpia);
}

/** Las fichas agrupadas por división, en el orden de la casa. */
export function porDivision(): { codigo: string; nombre: string; fichas: Ficha[] }[] {
  const mapa = new Map<string, Ficha[]>();
  for (const f of FICHAS) {
    const lista = mapa.get(f.division) ?? [];
    lista.push(f);
    mapa.set(f.division, lista);
  }
  return [...mapa.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([codigo, fichas]) => ({ codigo, nombre: fichas[0].divisionNombre, fichas }));
}

/** Las puertas que sirven para EMPEZAR: pocas, grandes y con ejemplo claro. */
export const PUERTAS_DE_ENTRADA: string[] = [
  "/guerra-hoy",
  "/mapas",
  "/zona-cero",
  "/mundos",
  "/en-vivo",
  "/novedades",
  "/buscar",
  "/orden",
];

/** Cuántas fichas tiene la casa (para las cifras de la pantalla). */
export const TOTAL_FICHAS = FICHAS.length;
