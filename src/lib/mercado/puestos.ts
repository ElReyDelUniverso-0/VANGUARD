// ═══════════════════════════════════════════════════════════════════
// v439.2 · LOS PUESTOS DE LA FERIA — un agente y un emblema por familia
//
// Cambio de rumbo del Dueño, textual: «mercado: cámbialo; por personaje, por
// los logos de Vanguard — el ojo, la V, los mapas, etc. — y que sea un lugar
// como una feria, con música feliz y luces parpadeando; y las voces hazlas tú,
// voces gruesas, sería de respeto, y nombre de agentes».
//
// Así que aquí ya no hay mercaderes de dibujo: hay DIEZ AGENTES de la casa
// (AGENTE 01 … AGENTE 10) y cada uno lleva delante su EMBLEMA —una pieza de la
// identidad de Vanguard: el ojo, la carta, el sello, el átomo, la cuenta, el
// libro, el orbe, la onda, la lupa y la V—. El nombre y el oficio son los de la
// casa; el emblema se dibuja en `components/mercado/emblema.tsx`.
//
// Lo demás sigue siendo verdad y no se toca: los datos salen de
// `lib/experiencia/registro` (la fuente única de las diez familias) y las
// secciones son sus rutas reales.
//
// Este archivo es PURO (sin React, sin DOM) para probarlo en node.
// ═══════════════════════════════════════════════════════════════════

import { EJES, EXPERIENCIAS, type Eje } from "@/lib/experiencia/registro";
// solo el TIPO: la boca de la casa no entra en el paquete del mercado por esto
import type { PersonaId } from "@/lib/voz/decir";

/** Los diez emblemas de la casa. Se dibujan en personaje→emblema.tsx. */
export type Emblema =
  | "ojo"
  | "mapa"
  | "sello"
  | "atomo"
  | "barras"
  | "libro"
  | "orbe"
  | "onda"
  | "lupa"
  | "uve";

/** Un agente de la casa: nombre, oficio, voz y emblema. */
export type Agente = {
  /** el nombre con el que firma: «AGENTE 01 · EL OJO» */
  nombre: string;
  /** el código suelto, para el rótulo: «AGENTE 01» */
  codigo: string;
  /** qué hace, en una línea llana */
  oficio: string;
  /** lo que dice al abrir el puesto (registro grave, sin marketing) */
  saludo: string;
  /** el emblema de Vanguard que lleva delante */
  emblema: Emblema;
  /** la persona de la boca de la casa con la que habla (lib/voz/decir) */
  voz: PersonaId;
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
  /** el agente que atiende el puesto */
  agente: Agente;
};

/**
 * Los diez agentes. Todos hablan con la persona grave de la casa («general»,
 * la más baja de tono) y el mercado le baja el tono todavía más al decir: voz
 * gruesa, de respeto, sin prisa y sin griterío.
 *
 * Los emblemas no se repiten y son los de la casa: el ojo que mira, la carta
 * del planeta, el sello del archivo, el átomo de la ciencia, la cuenta de los
 * datos, el libro de la escuela, el orbe de los escenarios, la onda de la voz,
 * la lupa del expediente y la V de Vanguard.
 */
export const AGENTES: Record<string, Agente> = {
  actualidad: {
    nombre: "AGENTE 01 · EL OJO",
    codigo: "AGENTE 01",
    oficio: "mira lo que acaba de pasar",
    saludo: "Aquí no entra el rumor. Entra la hora, la fuente y el cable. Mira tú mismo.",
    emblema: "ojo",
    voz: "general",
  },
  geografia: {
    nombre: "AGENTE 02 · LA CARTA",
    codigo: "AGENTE 02",
    oficio: "mide el planeta ficha a ficha",
    saludo: "El planeta, medido. Cada país con su frontera y su dato; nada dibujado a ojo.",
    emblema: "mapa",
    voz: "general",
  },
  historia: {
    nombre: "AGENTE 03 · EL SELLO",
    codigo: "AGENTE 03",
    oficio: "guarda el archivo con procedencia",
    saludo: "Papel con institución, licencia y fecha. Lo que no tiene procedencia, no entra.",
    emblema: "sello",
    voz: "general",
  },
  ciencia: {
    nombre: "AGENTE 04 · EL ÁTOMO",
    codigo: "AGENTE 04",
    oficio: "rastrea hasta el origen",
    saludo: "Cada hallazgo con su identificador y su nivel de evidencia. La duda también se publica.",
    emblema: "atomo",
    voz: "general",
  },
  datos: {
    nombre: "AGENTE 05 · LA CUENTA",
    codigo: "AGENTE 05",
    oficio: "pesa cada número con su fuente",
    saludo: "El número sale con su año, su unidad y su fuente. Sin eso, aquí no vale.",
    emblema: "barras",
    voz: "general",
  },
  educacion: {
    nombre: "AGENTE 06 · EL LIBRO",
    codigo: "AGENTE 06",
    oficio: "presta lo que enseña la casa",
    saludo: "Cursos, lecciones y ejercicios. Se aprende conectando, no memorizando.",
    emblema: "libro",
    voz: "general",
  },
  simulacion: {
    nombre: "AGENTE 07 · EL ORBE",
    codigo: "AGENTE 07",
    oficio: "mueve el mundo y mira qué pasa",
    saludo: "Mueve las reglas y observa. El resultado es un modelo, y la casa lo dice.",
    emblema: "orbe",
    voz: "general",
  },
  narrativa: {
    nombre: "AGENTE 08 · LA ONDA",
    codigo: "AGENTE 08",
    oficio: "cuenta con la voz y la imagen",
    saludo: "La crónica lleva su autor y su licencia. La casa también cuenta, y lo confiesa.",
    emblema: "onda",
    voz: "general",
  },
  investigacion: {
    nombre: "AGENTE 09 · LA LUPA",
    codigo: "AGENTE 09",
    oficio: "va de la pregunta al expediente",
    saludo: "Primero la pregunta; después el expediente. Lo que no está confirmado, se marca.",
    emblema: "lupa",
    voz: "general",
  },
  mundos: {
    nombre: "AGENTE 10 · LA V",
    codigo: "AGENTE 10",
    oficio: "abre la casa a lo que crees",
    saludo: "La V de la casa. Lo que creas aquí también es Vanguard, y lleva tu nombre.",
    emblema: "uve",
    voz: "general",
  },
};

/** Nombre viejo del catálogo, conservado para no romper otras tandas. */
export const MERCADERES = AGENTES;

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
 * no trae cifras, el puesto cuenta lo que vende — una cifra calculada.
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
    .map((x) =>
      x.cifra
        ? { nombre: x.nombre, href: x.href, detalle: x.detalle, cifra: x.cifra }
        : { nombre: x.nombre, href: x.href, detalle: x.detalle },
    );
  return [puerta, ...resto];
}

/** La feria entera: diez puestos, en el orden de la casa. */
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
    agente: AGENTES[eje.id] ?? {
      nombre: "AGENTE 00 · EL PUESTO",
      codigo: "AGENTE 00",
      oficio: "atiende este puesto",
      saludo: "Pasa y mira lo que hay.",
      emblema: "uve",
      voz: "general",
    },
  };
});

/** Todas las secciones de la feria, en un solo índice. */
export const SECCIONES: (Seccion & { puesto: string; puestoNombre: string; color: string })[] = PUESTOS.flatMap(
  (p) => p.secciones.map((s) => ({ ...s, puesto: p.id, puestoNombre: p.nombre, color: p.color })),
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
 * El buscador de la feria: por familia, lema, agente, emblema, sección o ruta.
 * Devuelve los puestos que responden y, dentro, solo las secciones que
 * responden (o todas, si lo que coincide es el puesto).
 */
export function buscar(consulta: string): Hallazgo[] {
  const q = llano(consulta);
  if (!q) return [];
  const salida: Hallazgo[] = [];
  for (const p of PUESTOS) {
    const delPuesto = llano(
      [p.nombre, p.lema, p.promesa, p.numero, p.agente.nombre, p.agente.codigo, p.agente.oficio, p.agente.emblema, p.agente.saludo].join(" "),
    );
    const coincidePuesto = delPuesto.includes(q) || q.split(" ").every((t) => delPuesto.includes(t));
    const secciones = p.secciones.filter((s) => llano([s.nombre, s.detalle, s.href].join(" ")).includes(q));
    if (secciones.length > 0) salida.push({ puesto: p, secciones });
    else if (coincidePuesto) salida.push({ puesto: p, secciones: p.secciones });
  }
  return salida;
}

/** Las cifras de la feria, derivadas — nunca escritas a mano. */
export function cifrasMercado() {
  return {
    puestos: PUESTOS.length,
    mercaderes: PUESTOS.length,
    agentes: PUESTOS.length,
    secciones: SECCIONES.length,
    familias: EJES.length,
    experiencias: EXPERIENCIAS.length,
    rutas: new Set(SECCIONES.map((s) => s.href)).size,
    emblemas: new Set(PUESTOS.map((p) => p.agente.emblema)).size,
  };
}

/** El puesto del día: rota con el día, sin azar y sin base de datos. */
export function puestoDelDia(fecha: Date = new Date()): Puesto {
  const dias = Math.floor(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) / 86400000);
  return PUESTOS[((dias % PUESTOS.length) + PUESTOS.length) % PUESTOS.length];
}
