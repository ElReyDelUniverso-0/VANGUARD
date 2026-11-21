// ═══════════════════════════════════════════════════════════════════
// v422.1 REBIRTH · EL REGISTRO DEL ECOSISTEMA — una sola puerta para leer
// la casa entera sin repetir listas.
//
// PROBLEMA QUE RESUELVE: la portada ofrecía TRES front doors distintas y
// ninguna completa — `AreasRejilla` (8 áreas), `ModulosRejilla` (9 módulos)
// y el directorio (/directorio). Cada una se escribía a mano y ninguna
// cubría las diez familias que el Dueño pidió en el encargo de REBIRTH
// (actualidad, geografía, historia, ciencia, economía y datos, educación,
// simulaciones, narrativa, investigación y mundos creados). El visitante
// tenía que adivinar cuál de las tres listas era «la buena».
//
// LO QUE ES ESTE FICHERO: la lista única de las diez familias (ejes), cada
// una con su puerta real, sus experiencias reales y sus CIFRAS DERIVADAS de
// los mismos módulos que usan las salas (`PUBLICACIONES.length`, no «45»
// escrito a mano). Si mañana el índice científico crece, la portada lo dice
// sin que nadie edite una cifra.
//
// REGLAS:
//  · Ningún href se inventa: `scripts/pruebas-experiencia.mjs` comprueba que
//    cada ruta existe como `page.tsx` y que cada cifra coincide con su fuente.
//  · No sustituye a `lib/navegacion` (espacios y herramientas): cada eje
//    declara su `espacio`, que es la misma clave que usa la barra adaptativa.
//  · Es puro y de servidor: no toca window, ni BD, ni red.
// ═══════════════════════════════════════════════════════════════════

import type { ClaveEspacio } from "@/lib/navegacion/tipos";
import { PUBLICACIONES, IDEAS } from "@/lib/ciencia/indice";
import { CANTIDAD_TOTAL as OBRAS_INFRA } from "@/lib/infraestructura/catalogo";
import { ACONTECIMIENTOS } from "@/lib/memoria/acontecimientos";
import { MODELOS } from "@/lib/labs/registro";
import { CURSOS_ACADEMIA } from "@/lib/academia/datos-cursos";
import { PAISES_GEO } from "@/lib/geo-paises";
import { MODULOS_PUBLICOS } from "@/components/portada/modulos";

export type ClaveEje =
  | "actualidad"
  | "geografia"
  | "historia"
  | "ciencia"
  | "datos"
  | "educacion"
  | "simulacion"
  | "narrativa"
  | "investigacion"
  | "mundos";

/** Una experiencia concreta dentro de un eje: siempre una ruta que existe. */
export type ExperienciaEje = {
  nombre: string;
  href: string;
  /** qué se hace ahí, en una línea, sin promesas que la sala no cumpla */
  detalle: string;
  /** cifra REAL derivada de la fuente de esa sala (o "" si no hay cifra) */
  cifra?: string;
  /** portada REAL del módulo (imagen de la casa) cuando la experiencia es un módulo */
  img?: string;
};

export type Eje = {
  id: ClaveEje;
  /** número de orden en la composición (01…10) */
  numero: string;
  nombre: string;
  lema: string;
  promesa: string;
  /** la puerta principal: la ruta que mejor representa el eje */
  puerta: string;
  /** ilustración REAL de la casa (public/ilustraciones) */
  img: string;
  color: string;
  /** el espacio de trabajo al que pertenece (lib/navegacion/tipos) */
  espacio: ClaveEspacio;
  /** dos cifras como mucho: la composición no es un panel de datos */
  cifras: { valor: string; etiqueta: string }[];
  experiencias: ExperienciaEje[];
};

/** Total de lecciones de la Academia, contado en el propio dato. */
function leccionesAcademia(): number {
  return CURSOS_ACADEMIA.reduce(
    (total, curso) =>
      total +
      (curso.capitulos ?? []).reduce((n, cap) => n + (cap.lecciones?.length ?? 0), 0),
    0,
  );
}

export const EJES: Eje[] = [
  {
    id: "actualidad",
    numero: "01",
    nombre: "Actualidad",
    lema: "El mundo, mientras ocurre",
    promesa:
      "Cables con fuente y hora, sin relleno: la última hora de cada frente y el mapa donde se mueve.",
    puerta: "/en-vivo",
    img: "/imagenes-reales/suez.jpg",
    color: "#ff5a5f",
    espacio: "leer",
    cifras: [{ valor: `${MODULOS_PUBLICOS.length}`, etiqueta: "módulos con puerta propia" }],
    experiencias: [
      { nombre: "El Pulso", href: "/en-vivo", detalle: "La última hora, minuto a minuto." },
      { nombre: "Frentes abiertos", href: "/guerra-hoy", detalle: "Cada conflicto con sus cables y su hora." },
      { nombre: "Vértigo", href: "/vertigo", detalle: "Las noticias en deslizamiento continuo." },
      { nombre: "El mapa vivo", href: "/mundo", detalle: "El planeta con la guerra encendida." },
      // v436.1 · EL MÓDULO EN LA FAMILIA — los módulos de la casa entran en
      // su familia con su portada real: el módulo Frente es la puerta de
      // la actualidad (frentes, cables, la hora).
      { nombre: "Frente", href: "/modulo/frente", detalle: "El módulo: frentes, cables y la hora, con su portada.", img: "/imagenes-reales/portaaviones.jpg" },
    ],
  },
  {
    id: "geografia",
    numero: "02",
    nombre: "Geografía",
    lema: "El planeta, ficha a ficha",
    promesa:
      "Cada país con su geografía real, sus cifras y su historia; el mundo en 3D y el atlas en 2D sobre los mismos polígonos.",
    puerta: "/mundos",
    img: "/imagenes-reales/satelite.jpg",
    color: "#3ddcff",
    espacio: "geo",
    cifras: [{ valor: `${PAISES_GEO.length}`, etiqueta: "países con ficha" }],
    experiencias: [
      { nombre: "Fichas de país", href: "/mundos", detalle: "Doce capas de datos por país." },
      { nombre: "Explorador mundial", href: "/tierra", detalle: "Globo 3D y atlas 2D con capas físicas." },
      { nombre: "Mapas", href: "/mapas", detalle: "Ocho capas sobre el globo de la casa." },
      { nombre: "Atlas", href: "/atlas", detalle: "El archivo de naciones y sus fichas." },
      // v436.1 · EL MÓDULO EN LA FAMILIA — el módulo Terreno (globo, mapas,
      // mundos, países) entra en la familia de la geografía con su portada.
      { nombre: "Terreno", href: "/modulo/terreno", detalle: "El módulo: el planeta, sus países y sus rostros, con su portada.", img: "/imagenes-reales/satelite.jpg" },
    ],
  },
  {
    id: "historia",
    numero: "03",
    nombre: "Historia",
    lema: "El archivo, con procedencia",
    promesa:
      "Documentos y acontecimientos con su institución, su licencia y lo que el expediente NO tiene.",
    puerta: "/memoria",
    img: "/imagenes-reales/muroberlin.jpg",
    color: "#e8c56a",
    espacio: "archivo",
    cifras: [{ valor: `${ACONTECIMIENTOS.length}`, etiqueta: "expedientes históricos" }],
    experiencias: [
      { nombre: "Memoria", href: "/memoria", detalle: "Seis colecciones y cinco siglos." },
      { nombre: "Archivo mundial", href: "/archivo-mundial", detalle: "El archivo completo de la casa." },
      { nombre: "Historia", href: "/historia", detalle: "Las épocas y sus relatos." },
      { nombre: "El editorial", href: "/editorial", detalle: "Piezas largas firmadas por la casa." },
    ],
  },
  {
    id: "ciencia",
    numero: "04",
    nombre: "Ciencia",
    lema: "Rastreada hasta su origen",
    promesa:
      "Publicaciones reales con DOI o arXiv, tipo editorial y nivel de evidencia separados; una hipótesis nunca se presenta como hallazgo.",
    puerta: "/ciencia",
    img: "/imagenes-reales/control.jpg",
    color: "#22d3ee",
    espacio: "investigar",
    cifras: [
      { valor: `${PUBLICACIONES.length}`, etiqueta: "registros con identificador" },
      { valor: `${IDEAS.length}`, etiqueta: "ideas en evolución" },
    ],
    experiencias: [
      { nombre: "Science Frontier", href: "/ciencia", detalle: "El centro científico de la casa." },
      { nombre: "Explorador de descubrimientos", href: "/ciencia/explorador", detalle: "Nueve ideas, paso a paso." },
      { nombre: "Buscador", href: "/ciencia/buscar", detalle: "Por disciplina, tipo, nivel y años." },
      { nombre: "Biblioteca científica", href: "/ciencia/biblioteca", detalle: "Cinco estanterías curadas." },
    ],
  },
  {
    id: "datos",
    numero: "05",
    nombre: "Economía y datos",
    lema: "El número con su fuente",
    promesa:
      "Indicadores con año, unidad, método y fuente; comparadores de países y series reales, nunca cifras huérfanas.",
    puerta: "/datos-mundiales",
    img: "/imagenes-reales/losangeles.jpg",
    color: "#5eead4",
    espacio: "mercado",
    cifras: [{ valor: `${OBRAS_INFRA}`, etiqueta: "obras de infraestructura documentadas" }],
    experiencias: [
      { nombre: "Datos mundiales", href: "/datos-mundiales", detalle: "Indicadores por país y comparador." },
      { nombre: "Laboratorios", href: "/labs", detalle: "Quince modelos con parámetros propios." },
      { nombre: "Divisas", href: "/divisas", detalle: "Tipos de cambio con su serie." },
      { nombre: "Rankings", href: "/rankings", detalle: "Clasificaciones con su método." },
      // v436.1 · EL MÓDULO EN LA FAMILIA — el módulo Método (los motores con
      // los que la casa calcula) entra en la familia de la economía y los datos.
      { nombre: "Método", href: "/modulo/metodo", detalle: "El módulo: censo, Lanchester, DBSCAN y la curva, con su portada.", img: "/assets/real/radar-1.jpg" },
    ],
  },
  {
    id: "educacion",
    numero: "06",
    nombre: "Educación",
    lema: "Aprender conectando",
    promesa:
      "Cursos con capítulos y lecciones, ejercicios con respuesta explicada y glosario; progreso local y borrable.",
    puerta: "/academia",
    img: "/imagenes-reales/tokio.jpg",
    color: "#a78bfa",
    espacio: "leer",
    cifras: [
      { valor: `${CURSOS_ACADEMIA.length}`, etiqueta: "cursos" },
      { valor: `${leccionesAcademia()}`, etiqueta: "lecciones" },
    ],
    experiencias: [
      { nombre: "Academia", href: "/academia", detalle: "Cursos, rutas y tarjetas." },
      { nombre: "Ejercicios", href: "/academia/ejercicios", detalle: "Práctica con respuesta explicada." },
      { nombre: "Glosario", href: "/academia/glosario", detalle: "Los términos de la casa." },
      { nombre: "Conocimiento global", href: "/conocimiento", detalle: "Treinta áreas con fuentes." },
      // v436.1 · EL MÓDULO EN LA FAMILIA — el módulo Conocimiento (enciclopedia,
      // lingua, ciencia, academia) entra en la familia de la educación.
      { nombre: "Conocimiento", href: "/modulo/conocimiento", detalle: "El módulo: historia, lenguas, ciencia y escuela, con su portada.", img: "/imagenes-reales/satelite.jpg" },
    ],
  },
  {
    id: "simulacion",
    numero: "07",
    nombre: "Simulaciones",
    lema: "Mover el mundo y ver qué pasa",
    promesa:
      "Escenarios y teatros con reglas escritas; el resultado es un modelo, y la casa lo dice.",
    puerta: "/escenarios",
    img: "/assets/real/jet-1.jpg",
    color: "#fb923c",
    espacio: "simular",
    cifras: [{ valor: `${MODELOS.length}`, etiqueta: "modelos de laboratorio" }],
    experiencias: [
      { nombre: "Escenarios", href: "/escenarios", detalle: "Qué pasaría si, con supuestos a la vista." },
      { nombre: "Zona Cero", href: "/zona-cero", detalle: "La ciudad en guerra, en directo." },
      { nombre: "Teatro 3D", href: "/teatro-3d", detalle: "El terreno real de cada frente." },
      { nombre: "El Cuartel", href: "/cuartel", detalle: "Salas de mando y juego." },
    ],
  },
  {
    id: "narrativa",
    numero: "08",
    nombre: "Narrativa",
    lema: "El documental y la voz",
    promesa:
      "Crónicas, galerías y audio con su autor y su licencia: la casa también cuenta, y lo dice cuando cuenta.",
    puerta: "/cronica",
    img: "/imagenes-reales/tokio.jpg",
    color: "#f472b6",
    espacio: "archivo",
    cifras: [],
    experiencias: [
      { nombre: "Crónica", href: "/cronica", detalle: "El relato largo de lo que pasa." },
      { nombre: "Galería", href: "/galeria", detalle: "Imágenes reales con su procedencia." },
      { nombre: "Audios", href: "/audios", detalle: "Piezas sonoras de la casa." },
      { nombre: "La voz", href: "/voz", detalle: "Cuatro personas que leen la casa." },
      // v436.1 · EL MÓDULO EN LA FAMILIA — el módulo Archivo y voz (fototeca,
      // radio, música y voz) entra en la familia de la narrativa.
      { nombre: "Archivo y voz", href: "/modulo/archivo", detalle: "El módulo: fototeca, radio, música y voz, con su portada.", img: "/imagenes-reales/arco.jpg" },
    ],
  },
  {
    id: "investigacion",
    numero: "09",
    nombre: "Investigación",
    lema: "De la pregunta al expediente",
    promesa:
      "Un lugar donde la pregunta se convierte en dossier con citas comprobadas, y donde se ve qué quedó sin confirmar.",
    puerta: "/inteligencia",
    img: "/imagenes-reales/area51.jpg",
    color: "#38bdf8",
    espacio: "investigar",
    cifras: [],
    experiencias: [
      { nombre: "Cámara de inteligencia", href: "/inteligencia", detalle: "Afirmaciones con cita o marcadas como no confirmadas." },
      { nombre: "El Núcleo", href: "/nucleo", detalle: "El motor de búsqueda de toda la casa." },
      { nombre: "Investigación", href: "/investigacion", detalle: "Los diez dossieres sistémicos." },
      { nombre: "Directorio", href: "/directorio", detalle: "Todo lo que existe, en un índice." },
      // v436.1 · EL MÓDULO EN LA FAMILIA — el módulo Inteligencia (consola,
      // servicios, armería, poder) entra en la familia de la investigación.
      { nombre: "Inteligencia", href: "/modulo/inteligencia", detalle: "El módulo: quién manda y con qué, con su portada.", img: "/assets/real/radar-1.jpg" },
    ],
  },
  {
    id: "mundos",
    numero: "10",
    nombre: "Nuevos mundos",
    lema: "Lo que creas aquí también es la casa",
    promesa:
      "Obras, colecciones y perfiles con moderación y licencia; el visitante deja de ser solo visitante.",
    puerta: "/creadores",
    img: "/imagenes-reales/panama.jpg",
    color: "#c084fc",
    espacio: "crear",
    cifras: [],
    experiencias: [
      { nombre: "Creadores", href: "/creadores", detalle: "Publica una obra o una colección." },
      { nombre: "Colecciones", href: "/colecciones", detalle: "Selecciones de la casa y de sus lectores." },
      { nombre: "Travesía", href: "/navegacion", detalle: "Tu recorrido por la casa." },
      { nombre: "Tu perfil", href: "/perfil", detalle: "Lo tuyo, en tu aparato." },
      // v436.1 · EL MÓDULO EN LA FAMILIA — el módulo La casa (mi universo,
      // objetivos, perfil, estado) entra en la familia de los nuevos mundos.
      { nombre: "La casa", href: "/modulo/casa", detalle: "El módulo: tu expediente y el estado del sistema, con su portada.", img: "/imagenes-reales/kremlin.jpg" },
    ],
  },
];

export const EJE_POR_ID: Record<ClaveEje, Eje> = Object.fromEntries(
  EJES.map((e) => [e.id, e]),
) as Record<ClaveEje, Eje>;

/** Todas las experiencias de todos los ejes, en un solo índice (sin duplicados). */
export const EXPERIENCIAS: (ExperienciaEje & { eje: ClaveEje })[] = EJES.flatMap((eje) =>
  eje.experiencias.map((x) => ({ ...x, eje: eje.id })),
);

/** Cifras de cabecera de la entrada: derivadas, nunca escritas a mano. */
export function cifrasEcosistema() {
  return {
    ejes: EJES.length,
    experiencias: EXPERIENCIAS.length,
    paises: PAISES_GEO.length,
    publicaciones: PUBLICACIONES.length,
    cursos: CURSOS_ACADEMIA.length,
    lecciones: leccionesAcademia(),
  };
}

/**
 * El eje de una ruta: prefijo más largo gana. Se usa para que la entrada de la
 * portada pueda decir «estás en Ciencia» sin una segunda tabla de rutas.
 */
export function ejeDeRuta(ruta: string): Eje | null {
  const limpia = (ruta || "/").split("?")[0].replace(/\/+$/, "") || "/";
  let mejor: { eje: Eje; largo: number } | null = null;
  for (const eje of EJES) {
    const candidatos = [eje.puerta, ...eje.experiencias.map((x) => x.href)];
    for (const c of candidatos) {
      const prefijo = c.startsWith("/") ? c : `/${c}`;
      if (limpia === prefijo || limpia.startsWith(prefijo + "/")) {
        if (!mejor || prefijo.length > mejor.largo) mejor = { eje, largo: prefijo.length };
      }
    }
  }
  return mejor?.eje ?? null;
}
