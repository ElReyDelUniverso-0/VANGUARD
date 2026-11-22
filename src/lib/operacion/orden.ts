// ═══════════════════════════════════════════════════════════════════
// v432.0 · ORDEN DE BATALLA — LA CASA ENTERA, ORDENADA EN UN SOLO CUERPO
//
// Mandato del Dueño: «está muy saturado, hay muchas salas no ordenadas y
// olvidadas, hay muchos botones en el menú y en el segundo menú unos opacan a
// otros. Ordena todos los módulos, organízalos, los botones también. Hay
// módulos buenísimos olvidados que están en el cuartel y todos deben estar en
// la sección principal».
//
// Problema real medido: la cabecera llevaba 13 módulos seguidos + 4 botones;
// cada módulo abría una barra de hasta 13 pestañas (94 en total) y varias de
// esas pestañas apuntaban al MISMO href (las 6 de Información Perfecta, por
// ejemplo): botones que se tapan entre sí.
//
// Lo que hace este archivo: NO inventa salas ni rutas. Toma `modulos.ts` —la
// fuente única que ya usan la cabecera, la carcasa y el sitemap— y la reagrupa
// en SIETE DIVISIONES con su código. Todo lo que estaba enterrado en el cuartel
// sube a la superficie con su nombre propio.
// ═══════════════════════════════════════════════════════════════════
import { MODULOS, type Modulo } from "@/components/portada/modulos";

export type Division = {
  id: string;
  /** código de orden de batalla: D-I … D-VII */
  codigo: string;
  nombre: string;
  /** para qué sirve la división, en una línea */
  lema: string;
  /** ids de módulos de `modulos.ts`, en el orden en que se leen */
  modulos: string[];
};

/** Las siete divisiones. Todo módulo de la casa cae en una y solo una. */
export const DIVISIONES: Division[] = [
  {
    id: "redaccion",
    codigo: "D-I",
    nombre: "La redacción",
    lema: "Qué está pasando ahora y cómo lo cuenta la casa: cables, crónica, radio, foto y voz",
    modulos: ["redaccion"],
  },
  {
    id: "mundo",
    codigo: "D-II",
    nombre: "El mundo",
    lema: "Dónde pasa y quién manda ahí: el planeta, sus países, sus datos y su poder",
    modulos: ["mundo"],
  },
  {
    id: "saber",
    codigo: "D-III",
    nombre: "El saber",
    lema: "Por qué pasa y con qué se mide: historia, lenguas, ciencia, academia y motores",
    modulos: ["saber"],
  },
  {
    id: "casa",
    codigo: "D-IV",
    nombre: "La casa",
    lema: "Tu expediente, el latido del sistema y el índice de todas las salas",
    modulos: ["casa"],
  },
];

/**
 * LO QUE ESTABA ENTERRADO EN EL CUARTEL.
 * Salas buenas que solo se alcanzaban entrando a «Juego» y bajando: aquí suben
 * a la superficie, con su nombre y su porqué. Los href son los reales del
 * cuartel, comprobados en producción (nada inventado).
 */
export type Rescatada = { href: string; nombre: string; nota: string; division: string };

export const RESCATADAS: Rescatada[] = [
  { href: "/teatro-3d", nombre: "Teatro 3D", nota: "Ahora dentro de El saber: escuadrones, uniformes y armas en volumen", division: "saber" },
  { href: "/teatro-3d?modo=libre", nombre: "Teatro 3D · modo libre", nota: "Países y nuclear, sin guion", division: "saber" },
  { href: "/teatro-3d?modo=tiempo", nombre: "Máquina del tiempo 3D", nota: "La guerra contada en el mapa que cambia", division: "saber" },
  { href: "/zona-cero", nombre: "Zona Cero", nota: "El ojo de la casa, dentro de El mundo", division: "mundo" },
  { href: "/en-vivo", nombre: "En vivo", nota: "El río de cables, con hora y fuente, dentro de La redacción", division: "redaccion" },
  { href: "/mision", nombre: "Misión 100", nota: "Cien objetivos que enseñan la casa jugando, dentro de La casa", division: "casa" },
  { href: "/objetivos", nombre: "Objetivos", nota: "Lo que llevas hecho, medido", division: "casa" },
  { href: "/universo", nombre: "Colecciones", nota: "Las piezas que has ido reuniendo", division: "casa" },
  { href: "/creadores", nombre: "La Forja", nota: "Publica lo tuyo dentro de la casa", division: "casa" },
  { href: "/novedades", nombre: "Novedades", nota: "Lo último que ha entrado al sistema", division: "casa" },
];

const POR_ID = new Map(MODULOS.map((m) => [m.id, m]));

export type Sala = { href: string; nombre: string };
export type ModuloOrdenado = Modulo & { salas: Sala[]; codigo: string };
export type DivisionOrdenada = Division & { modulosResueltos: ModuloOrdenado[]; salas: number };

/**
 * Las salas REALES de un módulo: se quitan los href repetidos (las pestañas
 * que apuntan al mismo sitio son las que se tapan entre sí) y se queda la
 * primera etiqueta de cada destino.
 */
export function salasDe(m: Modulo): Sala[] {
  const vistas = new Set<string>();
  const salas: Sala[] = [];
  for (const p of m.pestanas) {
    if (vistas.has(p.href)) continue;
    vistas.add(p.href);
    salas.push({ href: p.href, nombre: p.label });
  }
  return salas;
}

/** El árbol completo, ya numerado. Es lo que pintan el índice y la terminal. */
export const ARBOL: DivisionOrdenada[] = DIVISIONES.map((d) => {
  let n = 0;
  const modulosResueltos: ModuloOrdenado[] = d.modulos
    .map((id) => POR_ID.get(id))
    .filter((m): m is Modulo => !!m)
    .map((m) => {
      n += 1;
      const salas = salasDe(m);
      return { ...m, salas, codigo: `${d.codigo}-M${String(n).padStart(2, "0")}` };
    });
  return {
    ...d,
    modulosResueltos,
    salas: modulosResueltos.reduce((t, m) => t + m.salas.length, 0),
  };
});

export const TOTAL_MODULOS = ARBOL.reduce((t, d) => t + d.modulosResueltos.length, 0);
export const TOTAL_SALAS = ARBOL.reduce((t, d) => t + d.salas, 0);

/** División de una ruta, para encender la luz correcta. */
export function divisionDe(ruta: string): string | null {
  for (const d of ARBOL) {
    for (const m of d.modulosResueltos) {
      if (ruta === m.nav || ruta.startsWith(m.nav + "/")) return d.id;
      if (m.salas.some((s) => ruta === s.href || ruta.startsWith(s.href + "/"))) return d.id;
    }
  }
  return null;
}

/**
 * LA CABECERA, ADELGAZADA.
 * Antes: 13 módulos seguidos + 4 botones (17 destinos que se tapaban).
 * Ahora: un índice, un buscador y una puerta por módulo (v436.0: cuatro).
 * Todo lo demás no desaparece: vive ordenado dentro de /orden.
 */
export const NAV_PRIMARIO = [
  { href: "/orden", label: "Orden" },
  { href: "/buscar", label: "Buscar" },
  // v438.3 · la puerta del mercado (una sola: las diez familias viven dentro).
  // Se perdió en una de las podas de la cabecera; vuelve porque es la única
  // entrada visible a /mercado desde el escritorio.
  { href: "/mercado", label: "Mercado" },
  { href: "/guerra-hoy", label: "Redacción" },
  { href: "/mundos", label: "Mundo" },
  { href: "/conocimiento", label: "Saber" },
  { href: "/mi-universo", label: "Casa" },
];
