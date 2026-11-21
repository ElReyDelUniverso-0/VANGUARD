// ═══════════════════════════════════════════════════════════════════
// v437.2 · LOS PUESTOS DEL MERCADO — una familia, un puesto, un mercader
//
// Orden del Dueño: «las 10 familias ahora son todos los módulos de Vanguard;
// haz que la presentación sea un módulo aparte, El Mercado de Vanguard, con
// estética de mercado, cada módulo con un personaje que lo presente, y que se
// enseñe cada módulo perfectamente con sus secciones».
//
// QUÉ ES ESTE FICHERO: datos puros (sin React, sin DOM) para que el mercado se
// pueda probar en node. No escribe ni una ruta a mano: lee la fuente única de
// las familias (`lib/experiencia/registro`) y le añade lo único que aquí es
// escritura propia — el mercader de cada puesto.
//
// REGLA: `EMPLEADOS` tiene que cubrir los diez ejes. La prueba del mercado
// falla si falta un mercader, si dos comparten nombre, oficio, pieza o saludo,
// o si una sección apunta a una ruta que no existe en `src/app`.
// ═══════════════════════════════════════════════════════════════════

import { EJES, EXPERIENCIAS, type Eje } from "@/lib/experiencia/registro";

/** La pieza que el mercader tiene entre las manos (se dibuja en personaje.tsx). */
export type Pieza =
  | "pregon"
  | "globo"
  | "legajo"
  | "matraz"
  | "balanza"
  | "libro"
  | "maqueta"
  | "camara"
  | "lupa"
  | "torno";

export type Mercader = {
  /** nombre de pila: el puesto no es un icono, es alguien que te atiende */
  nombre: string;
  oficio: string;
  /** lo primero que dice al abrir el puesto (en minúscula, sin gritar) */
  saludo: string;
  pieza: Pieza;
};

export type Seccion = { nombre: string; href: string; detalle: string; cifra?: string };

export type Puesto = {
  id: string;
  numero: string;
  nombre: string;
  lema: string;
  promesa: string;
  /** la puerta principal de la familia: la ruta que mejor la representa */
  puerta: string;
  /** portada real de la casa (public/) que el puesto usa como cartel */
  img: string;
  /** color del toldo: el de la familia, sin inventar otro */
  color: string;
  /** el mismo color llevado a la sombra, para el mostrador y el rótulo */
  hondo: string;
  cifras: { valor: string; etiqueta: string }[];
  /** la puerta + todas las experiencias reales de la familia */
  secciones: Seccion[];
  personaje: Mercader;
};

/**
 * Los diez mercaderes. Uno por eje, y cada oficio es el de su familia: la
 * pregonera cuenta lo que pasa, el cartógrafo reparte el planeta, la archivista
 * guarda el papel, el boticario mide, la contable pesa, el librero presta, el
 * titiritero mueve el mundo, la cuentacuentos graba, el detective pregunta y el
 * alfarero deja que lo hagas tú.
 */
export const MERCADERES: Record<string, Mercader> = {
  actualidad: {
    nombre: "Nora",
    oficio: "la pregonera",
    saludo: "¡Última hora, última hora! Lo que acaba de pasar, con su hora y su fuente.",
    pieza: "pregon",
  },
  geografia: {
    nombre: "Amílcar",
    oficio: "el cartógrafo",
    saludo: "El planeta entero cabe en esta mesa. Dime un país y te saco su ficha.",
    pieza: "globo",
  },
  historia: {
    nombre: "Elena",
    oficio: "la archivista",
    saludo: "Cada papel de este cajón tiene institución y licencia. Nada entra sin procedencia.",
    pieza: "legajo",
  },
  ciencia: {
    nombre: "Teo",
    oficio: "el boticario",
    saludo: "Aquí no se vende humo: cada frasco trae su DOI o su arXiv, y dice cuánto se sabe.",
    pieza: "matraz",
  },
  datos: {
    nombre: "Rita",
    oficio: "la contable",
    saludo: "Todo número sale de la balanza con su año, su unidad y su fuente. Pesa antes de creer.",
    pieza: "balanza",
  },
  educacion: {
    nombre: "Ibo",
    oficio: "el librero",
    saludo: "Pasa, pasa. Los cursos se prestan gratis y se devuelven sabiendo algo más.",
    pieza: "libro",
  },
  simulacion: {
    nombre: "Kilombo",
    oficio: "el titiritero",
    saludo: "Mueve tú los hilos: el mundo de esta maqueta hace lo que le pidas, y lo dice.",
    pieza: "maqueta",
  },
  narrativa: {
    nombre: "Vera",
    oficio: "la cuentacuentos",
    saludo: "Siéntate. Esto se cuenta despacio, con su autor y su licencia a la vista.",
    pieza: "camara",
  },
  investigacion: {
    nombre: "Sergio",
    oficio: "el detective",
    saludo: "Traigo la pregunta, no la respuesta. Lo que no está confirmado, lo digo.",
    pieza: "lupa",
  },
  mundos: {
    nombre: "Aurelio",
    oficio: "el alfarero",
    saludo: "El barro es tuyo: lo que hagas aquí también pasa a ser parte de la casa.",
    pieza: "torno",
  },
};

/** Lleva un color de familia a la sombra del mostrador (nunca a otro tono). */
export function hondo(color: string): string {
  const m = /^#([0-9a-fA-F]{6})$/.exec(color.trim());
  if (!m) return "#1b1720";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mezcla = (c: number) => Math.round(c * 0.22 + 12 * 0.78);
  return `#${[mezcla(r), mezcla(g), mezcla(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Dos cifras por puesto como mucho (la misma ley del registro): si la familia
 * no trae cifras, el puesto cuenta lo que vende — una cifra calculada, no un
 * adorno escrito a mano.
 */
function cifrasDe(eje: Eje, secciones: Seccion[]): { valor: string; etiqueta: string }[] {
  if (eje.cifras.length > 0) return eje.cifras.slice(0, 2);
  return [{ valor: String(secciones.length), etiqueta: secciones.length === 1 ? "sección" : "secciones" }];
}

/** Las secciones de una familia: su puerta primero y luego todo lo demás. */
function seccionesDe(eje: Eje): Seccion[] {
  const puerta: Seccion = { nombre: eje.nombre, href: eje.puerta, detalle: eje.promesa };
  const resto: Seccion[] = eje.experiencias
    .filter((x) => x.href !== eje.puerta)
    .map((x) => (x.cifra ? { nombre: x.nombre, href: x.href, detalle: x.detalle, cifra: x.cifra } : { nombre: x.nombre, href: x.href, detalle: x.detalle }));
  return [puerta, ...resto];
}

/** La plaza entera: diez puestos, en el orden de la casa. */
export const PUESTOS: Puesto[] = EJES.map((eje) => {
  const secciones = seccionesDe(eje);
  return {
    id: eje.id,
    numero: eje.numero,
    nombre: eje.nombre,
    lema: eje.lema,
    promesa: eje.promesa,
    puerta: eje.puerta,
    img: eje.img,
    color: eje.color,
    hondo: hondo(eje.color),
    cifras: cifrasDe(eje, secciones),
    secciones,
    personaje: MERCADERES[eje.id] ?? {
      nombre: "El mercader",
      oficio: "de este puesto",
      saludo: "Pasa y mira lo que hay.",
      pieza: "libro",
    },
  };
});

/** Todas las secciones del mercado, en un solo índice (la puerta de cada una). */
export const SECCIONES: (Seccion & { puesto: string; puestoNombre: string; color: string })[] =
  PUESTOS.flatMap((p) =>
    p.secciones.map((s) => ({ ...s, puesto: p.id, puestoNombre: p.nombre, color: p.color })),
  );

export function puestoDeId(id: string): Puesto | null {
  return PUESTOS.find((p) => p.id === id) ?? null;
}

/** Sin tildes, sin mayúsculas y sin guiones: para buscar como se escribe. */
export function llano(texto: string): string {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type Hallazgo = { puesto: Puesto; secciones: Seccion[] };

/**
 * El buscador de la plaza: por familia, lema, mercader, oficio, sección o ruta.
 * Devuelve los puestos que responden y, dentro, solo las secciones que
 * responden (o todas, si lo que coincide es el puesto).
 */
export function buscar(consulta: string): Hallazgo[] {
  const q = llano(consulta);
  if (!q) return [];
  const salida: Hallazgo[] = [];
  for (const p of PUESTOS) {
    const delPuesto = llano(
      [p.nombre, p.lema, p.promesa, p.numero, p.personaje.nombre, p.personaje.oficio, p.personaje.saludo].join(" "),
    );
    const coincidePuesto = delPuesto.includes(q) || q.split(" ").every((t) => delPuesto.includes(t));
    const secciones = p.secciones.filter((s) => llano([s.nombre, s.detalle, s.href].join(" ")).includes(q));
    if (secciones.length > 0) salida.push({ puesto: p, secciones });
    else if (coincidePuesto) salida.push({ puesto: p, secciones: p.secciones });
  }
  return salida;
}

/** Las cifras de la plaza, derivadas — nunca escritas a mano. */
export function cifrasMercado() {
  return {
    puestos: PUESTOS.length,
    mercaderes: PUESTOS.length,
    secciones: SECCIONES.length,
    familias: EJES.length,
    experiencias: EXPERIENCIAS.length,
    rutas: new Set(SECCIONES.map((s) => s.href)).size,
  };
}

/** El puesto del día: rota con el día, sin azar y sin base de datos. */
export function puestoDelDia(fecha: Date = new Date()): Puesto {
  const dias = Math.floor(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) / 86400000);
  return PUESTOS[((dias % PUESTOS.length) + PUESTOS.length) % PUESTOS.length];
}
