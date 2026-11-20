// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 — VANGUARD CIVIL RESILIENCE · TIPOS
//
// El modelo de contenido del CENTRO DE PREVENCIÓN, PREPARACIÓN Y
// RESILIENCIA. Todo el centro se pinta desde estos tipos: no hay una
// sola página escrita a mano con su texto dentro del .tsx.
//
// TRES REGLAS QUE ESTE ARCHIVO GARANTIZA CON EL TIPO (no con la
// buena voluntad, con el compilador):
//  ① cada pieza de contenido declara su FUENTE → no existe una línea
//     de recomendación sin procedencia (lección de la casa: «fuente o
//     no existe»).
//  ② un bloque NO PUEDE decir «alerta activa», «zona afectada» ni
//     ninguna cifra de suceso real: el vocabulario de este archivo es
//     educativo y preventivo. Las alertas las emite la autoridad
//     oficial; aquí no se emiten.
//  ③ todo nexo de salida lleva su `porque` → ninguna puerta promete
//     datos que el destino no tenga (contrato del motor de nexos).
//
// Cero enlaces exteriores (regla de oro): las instituciones se citan
// por su nombre y su rol, en texto; el enlace lo mantiene cada lector
// en su propio país, donde el número de emergencia cambia.
// ═══════════════════════════════════════════════════════════════════

/** Un bloque de contenido renderizable. La sala no inventa estilos por
 *  sección: el renderizador conoce estos ocho bloques y nada más. */
export type Bloque =
  | { tipo: "prosa"; items: string[] }
  | { tipo: "pasos"; titulo?: string; items: { titulo: string; texto: string }[] }
  | { tipo: "lista"; titulo?: string; items: string[]; numerada?: boolean }
  | { tipo: "cifras"; titulo?: string; items: { etiqueta: string; valor: string; nota?: string }[] }
  | { tipo: "mitos"; titulo?: string; items: { mito: string; realidad: string }[] }
  | { tipo: "tabla"; titulo?: string; cabeceras: string[]; filas: string[][] }
  | { tipo: "aviso"; titulo: string; texto: string }
  | { tipo: "fuente"; texto: string }
  /** tarjetas de texto: título + párrafo, para conceptos y lecciones */
  | { tipo: "conceptos"; titulo?: string; items: { titulo: string; texto: string; etiqueta?: string }[] }
  /** columnas comparadas: el formato de las guías (antes/durante/después, o
   *  qué hacer / qué exigir / qué no hacer). Cada ítem es un caso real. */
  | {
      tipo: "columnas";
      titulo?: string;
      items: {
        area: string;
        lema: string;
        columnas: { titulo: string; items: string[] }[];
        nota?: string;
        fuente?: string;
      }[];
    }
  /** lecciones de la biblioteca de educación sobre riesgos */
  | {
      tipo: "lecciones";
      titulo?: string;
      items: {
        titulo: string;
        idea: string;
        claves: string[];
        sirve: string;
        nivel: string;
        fuente: string;
        ver: { ruta: string; etiqueta: string }[];
      }[];
    };

export interface Salida {
  ruta: string;
  etiqueta: string;
  porque: string;
}

/** Una de las QUINCE SECCIONES obligatorias de la MISIÓN 09. */
export interface Seccion {
  /** 1..15 — el orden del encargo del Dueño, que es el orden de lectura */
  n: number;
  /** slug real de URL: /resiliencia/<id> */
  id: string;
  titulo: string;
  /** una línea: qué resuelve */
  lema: string;
  /** el sumario honesto (va en la portada y en la meta description) */
  resumen: string;
  /** nombre de pictograma lucide — cero emoji en la interfaz (regla de oro) */
  icono: string;
  /** qué renderizador usa la página: `bloques` para el genérico, y cuatro
   *  vistas propias para lo que necesita interacción o estructura especial */
  vista: "bloques" | "fichas" | "listas" | "glosario" | "pais";
  bloques: Bloque[];
  /** salidas reales hacia el resto de la casa */
  saleA?: Salida[];
}

/** Familias de peligro natural (clasificación usada por los organismos de
 *  protección civil: no es una invención de la casa). */
export type FamiliaPeligro =
  | "geológico"
  | "hidrometeorológico"
  | "climático"
  | "volcánico"
  | "ambiental";

/** Ficha de peligro natural: qué es, cómo se mide, cómo se anuncia solo. */
export interface FichaPeligro {
  id: string;
  nombre: string;
  familia: FamiliaPeligro;
  /** pictograma lucide */
  icono: string;
  /** qué es, en dos frases claras */
  queEs: string;
  /** cómo lo miden los científicos y qué significa la escala */
  medicion: { escala: string; texto: string };
  /** señales que el propio peligro enseña (aprendizaje, no tecnología) */
  senales: string[];
  /** exposición: quién está donde importa */
  exposicion: string;
  /** cifras que ayudan a dimensionar (con su nota de fuente) */
  datos: { etiqueta: string; valor: string; nota: string }[];
  /** mito → realidad */
  mitos: { mito: string; realidad: string }[];
  /** qué reduce el riesgo de este peligro, en general */
  reduccion: string[];
  fuente: string;
}

/** Guía por tipo de emergencia: ANTES / DURANTE / DESPUÉS, siempre educativo. */
export interface GuiaEmergencia {
  id: string;
  nombre: string;
  /** el peligro al que pertenece (enlaza la ficha con la guía) */
  peligro: string;
  lema: string;
  antes: string[];
  durante: string[];
  despues: string[];
  /** lo que la gente hace y empeora las cosas */
  noHagas: string[];
  /** consideraciones para personas con discapacidad o necesidades de apoyo */
  inclusion: string;
  fuente: string;
}

/** Cifra de portada del centro (derivada, nunca escrita a mano). */
export interface CifraCentro {
  valor: string;
  etiqueta: string;
  nota: string;
}
