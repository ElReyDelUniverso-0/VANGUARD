// ═══════════════════════════════════════════════════════════════════
// v419.0 · MEMORY ARCHIVE — colecciones temáticas y períodos
//
// Una colección NO es una lista de folios escrita a mano: es una consulta
// declarada. Se dice qué se busca, en qué fuente, con qué filtros y por qué;
// los documentos que aparecen son los que la fuente publica hoy. Si mañana
// hay otros, la colección cambia con ella y no miente.
//
// Los períodos hacen lo mismo con el tiempo: un siglo, sus años y las tres
// puertas abiertas.
// ═══════════════════════════════════════════════════════════════════

import type { PiezaFijada } from "./acontecimientos";
import type { FuenteId, TipoDocumento } from "./tipos";

export interface Coleccion {
  slug: string;
  titulo: string;
  /** la pregunta que responde la colección */
  pregunta: string;
  intro: string;
  q: string;
  tipo: TipoDocumento | null;
  desde: number | null;
  hasta: number | null;
  /** puertas que se consultan; el resto se calla */
  fuentes: FuenteId[];
  /** piezas fijadas que anclan la colección (opcional) */
  piezas?: PiezaFijada[];
  /** qué hay que advertir de esta consulta */
  nota: string;
  noEsta: string;
}

export const COLECCIONES_MEMORIA: Coleccion[] = [
  {
    slug: "mapas-que-abrieron-el-mundo",
    titulo: "Los mapas que abrieron el mundo",
    pregunta: "¿Cómo se dibujó el planeta antes de que se conociera entero?",
    intro:
      "Cartografía europea de los siglos XVI a XVIII: cartas portulanas, atlas impresos y mapas de las nuevas costas, con la fecha que declara cada fuente.",
    q: "map world",
    tipo: "mapa",
    desde: 1500,
    hasta: 1800,
    fuentes: ["commons", "loc"],
    piezas: [{ fuente: "commons", id: "4413774", papel: "Mapa de América de Diego Gutiérrez, 1562, grabado en Amberes" }],
    nota:
      "En Commons los mapas se buscan por su título; en el Library of Congress por la colección de mapas. Los dos resultados se mezclan sin corregir su fecha.",
    noEsta:
      "El archivo no tiene un visor cartográfico georreferenciado: enseña la digitalización, no la superpone a un mapa actual.",
  },
  {
    slug: "fotografia-de-guerra",
    titulo: "La fotografía en la guerra",
    pregunta: "¿Qué se vio de las guerras del siglo XX y quién lo fotografió?",
    intro:
      "Fotografía de prensa y oficial de la Primera y la Segunda Guerra Mundial, con la autoría y la licencia que declare cada archivo.",
    q: "war",
    tipo: "fotografia",
    desde: 1914,
    hasta: 1945,
    fuentes: ["loc", "commons"],
    nota:
      "El Library of Congress avisa muchas veces de que la publicación puede estar restringida: esas piezas se enseñan como ficha y enlace, sin imagen.",
    noEsta:
      "No hay aquí censura ni montaje editorial: se enseña lo que la institución conserva y describe, sin añadir pies que la fuente no firma.",
  },
  {
    slug: "la-calle-y-la-ciudad",
    titulo: "La calle y la ciudad",
    pregunta: "¿Cómo cambió la vida urbana entre 1890 y 1950?",
    intro:
      "Fotografía urbana y documental del cambio de siglo: calles, mercados, obras y multitudes, tal como las digitalizaron los archivos.",
    q: "street city life",
    tipo: "fotografia",
    desde: 1890,
    hasta: 1950,
    fuentes: ["loc", "commons"],
    nota: "La fecha es la que publica la fuente para la toma, no la de la digitalización.",
    noEsta: "No todas las fotografías identifican a las personas retratadas; cuando la fuente no lo dice, aquí tampoco.",
  },
  {
    slug: "prensa-y-panfletos",
    titulo: "Prensa y panfletos",
    pregunta: "¿Qué se imprimió y se hizo circular antes de internet?",
    intro:
      "Folletos, gacetas y libros impresos entre 1700 y 1900 digitalizados por el Internet Archive y la Library of Congress.",
    q: "pamphlet",
    tipo: "publicacion",
    desde: 1700,
    hasta: 1900,
    fuentes: ["ia", "loc"],
    nota:
      "El Internet Archive declara licencia en una parte de sus fondos; cuando no la declara, el archivo enlaza la pieza y no publica la imagen.",
    noEsta: "El texto completo no se copia aquí: se enlaza la digitalización y se describe lo que la fuente dice del ejemplar.",
  },
  {
    slug: "abolicion-y-derechos-civiles",
    titulo: "Abolición y derechos civiles",
    pregunta: "¿Qué documentos sostienen la lucha contra la esclavitud y por los derechos civiles?",
    intro:
      "Panfletos abolicionistas, proclamas y fotografías del movimiento por los derechos civiles en Estados Unidos.",
    q: "abolition slavery",
    tipo: null,
    desde: 1830,
    hasta: 1970,
    fuentes: ["loc", "ia", "commons"],
    nota: "Se mezclan documentos, folletos y fotografías porque la colección es temática, no documental por soporte.",
    noEsta: "No hay transcripciones propias: el archivo describe y enlaza, no reescribe la fuente.",
  },
  {
    slug: "retratos-del-poder",
    titulo: "Retratos del poder",
    pregunta: "¿Cómo se ha retratado a quien mandaba?",
    intro:
      "Retratos oficiales, fotografías de prensa y grabados de gobernantes entre 1860 y 1950, con la institución que los custodia.",
    q: "portrait president",
    tipo: "fotografia",
    desde: 1860,
    hasta: 1950,
    fuentes: ["loc", "commons"],
    nota: "La autoría del retrato muchas veces no consta: si la fuente no la declara, aquí se escribe que no consta.",
    noEsta: "No se identifican personas por parecido ni con reconocimiento facial: solo lo que dice la ficha de la fuente.",
  },
];

export const COLECCION_POR_SLUG = new Map(COLECCIONES_MEMORIA.map((c) => [c.slug, c]));

export function coleccion(slug: string): Coleccion | null {
  return COLECCION_POR_SLUG.get(slug) ?? null;
}

// ── Períodos ────────────────────────────────────────────────────────
export interface Periodo {
  slug: string;
  siglo: string;
  desde: number;
  hasta: number;
  titulo: string;
  resumen: string;
}

export const PERIODOS: Periodo[] = [
  {
    slug: "xvi",
    siglo: "XVI",
    desde: 1500,
    hasta: 1599,
    titulo: "El siglo XVI",
    resumen:
      "Impresión tipográfica, cartografía de las nuevas rutas y las primeras gacetas. Lo que las fuentes digitalizan de este siglo suele ser obra impresa o grabado.",
  },
  {
    slug: "xvii",
    siglo: "XVII",
    desde: 1600,
    hasta: 1699,
    titulo: "El siglo XVII",
    resumen: "Prensa periódica, panfletos de guerra y atlas impresos; mucha pérdida documental y mucha digitalización desigual.",
  },
  {
    slug: "xviii",
    siglo: "XVIII",
    desde: 1700,
    hasta: 1799,
    titulo: "El siglo XVIII",
    resumen:
      "El siglo de las constituciones y de la prensa política: declaraciones, folletos y debates impresos que llegaron a las colonias.",
  },
  {
    slug: "xix",
    siglo: "XIX",
    desde: 1800,
    hasta: 1899,
    titulo: "El siglo XIX",
    resumen:
      "La fotografía aparece y cambia lo que se puede documentar; también es el siglo de los grandes impresos y de la prensa industrial.",
  },
  {
    slug: "xx",
    siglo: "XX",
    desde: 1900,
    hasta: 1999,
    titulo: "El siglo XX",
    resumen:
      "Fotografía de prensa, carteles, radio y registros oficiales. En este siglo los derechos de autor siguen vivos: el archivo lo dice pieza a pieza.",
  },
];

export const PERIODO_POR_SLUG = new Map(PERIODOS.map((p) => [p.slug, p]));

export function periodo(slug: string): Periodo | null {
  return PERIODO_POR_SLUG.get(slug) ?? null;
}
