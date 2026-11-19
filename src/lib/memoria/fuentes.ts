// ═══════════════════════════════════════════════════════════════════
// v419.0 · MEMORY ARCHIVE — el catálogo de fuentes
//
// El archivo no tiene fondos propios: tiene puertas. Este fichero declara,
// sin adornos, qué hay detrás de cada puerta, qué licencia publica, qué NO
// cubre y cómo se cita. Es la página /memoria/fuentes y la nota al pie de
// cada búsqueda.
//
// Si una fuente no está aquí, no está en el archivo. No hay cuarta puerta
// escondida. Europeana exige clave de API y no se incluye; UNESCO Memory of
// the World no ofrece interfaz de consulta: se dice, no se simula.
// ═══════════════════════════════════════════════════════════════════

import type { FuenteId } from "./tipos";

export interface FuenteArchivo {
  id: FuenteId;
  nombre: string;
  pais: string;
  url: string;
  /** qué se puede encontrar de verdad */
  cubre: string;
  /** qué no se puede encontrar, dicho antes de que el visitante lo busque */
  noCubre: string;
  /** cómo publica los derechos */
  derechos: string;
  /** el contrato de consulta que usa el archivo */
  contrato: string;
  /** cómo se cita una pieza de esta fuente */
  citar: string;
  /** si la fuente permite filtrar por fecha en la propia consulta */
  filtraPorFecha: boolean;
}

export const FUENTES_ARCHIVO: FuenteArchivo[] = [
  {
    id: "loc",
    nombre: "Library of Congress",
    pais: "Estados Unidos",
    url: "https://www.loc.gov/",
    cubre:
      "Fotografías, grabados, mapas, manuscritos, libros y grabaciones sonoras digitalizados por la biblioteca nacional de Estados Unidos, con piezas de todo el mundo.",
    noCubre:
      "No es un archivo universal: lo que no ha digitalizado o no custodia, no aparece. Muchas piezas solo tienen una cara digitalizada y el registro remite a la sala de lectura de Washington.",
    derechos:
      "Publica un aviso de derechos por pieza (`rights_advisory`). El archivo lo enseña literal y clasifica: solo muestra la imagen cuando el aviso dice «no known restrictions», «public domain» o equivalente.",
    contrato: "API JSON pública, sin clave: /{coleccion}/?fo=json y /item/{id}/?fo=json",
    citar: "Library of Congress, [título], [fecha], https://www.loc.gov/item/[id]/",
    filtraPorFecha: true,
  },
  {
    id: "ia",
    nombre: "Internet Archive",
    pais: "Estados Unidos (organización sin ánimo de lucro)",
    url: "https://archive.org/",
    cubre:
      "Libros escaneados, revistas, folletos, programas de radio, películas y colecciones donadas por bibliotecas de medio mundo. Miles de volúmenes anteriores a 1900 y fondos de derechos expirados.",
    noCubre:
      "No todo lo alojado es libre: hay material con préstamo restringido y colecciones sin licencia declarada. El archivo enlaza esas piezas pero no publica sus imágenes.",
    derechos:
      "Declara `licenseurl` cuando la pieza tiene licencia. Si falta, el archivo escribe «derechos sin declarar» y no muestra la imagen: la ausencia de licencia no es un permiso.",
    contrato: "Búsqueda avanzada JSON y metadatos por identificador, sin clave",
    citar: "Internet Archive, [título], [fecha], https://archive.org/details/[identificador]",
    filtraPorFecha: true,
  },
  {
    id: "commons",
    nombre: "Wikimedia Commons",
    pais: "Internacional (Wikimedia)",
    url: "https://commons.wikimedia.org/",
    cubre:
      "Fotografías, mapas, facsímiles de documentos y retratos con licencia declarada, subidos por instituciones y voluntarios. Es la fuente más rápida de las tres y la que mejor conserva el facsímil a gran resolución.",
    noCubre:
      "Depende de lo que se haya subido: la cobertura es desigual por país y época. La fecha de la obra y la del archivo digitalizado no siempre coinciden.",
    derechos:
      "Cada fichero declara su licencia (dominio público, CC0, CC BY, CC BY-SA…). El archivo la muestra y, en las licencias abiertas, exige citar autor y licencia al reutilizar.",
    contrato: "API MediaWiki (`action=query`, `generator=search`), sin clave",
    citar: "Wikimedia Commons, [título del fichero], [licencia], [URL del fichero]",
    filtraPorFecha: false,
  },
];

export const FUENTES_POR_ID: Record<FuenteId, FuenteArchivo> = Object.fromEntries(
  FUENTES_ARCHIVO.map((f) => [f.id, f])
) as Record<FuenteId, FuenteArchivo>;

export function fuente(id: FuenteId): FuenteArchivo {
  return FUENTES_POR_ID[id];
}

// ── Las puertas que NO están, dichas en la misma página ─────────────
export const PUERTAS_AUSENTES = [
  {
    nombre: "Europeana",
    motivo:
      "Su API exige una clave que la casa no tiene configurada. Sin clave no hay consulta: se enlaza la web y no se finge un buscador.",
    url: "https://www.europeana.eu/",
  },
  {
    nombre: "UNESCO · Memory of the World",
    motivo:
      "El registro se publica como página web, sin interfaz de consulta máquina a máquina. El archivo no lo copia a mano para no convertirlo en dato de segunda mano.",
    url: "https://www.unesco.org/en/memory-world",
  },
  {
    nombre: "National Archives (archives.gov)",
    motivo:
      "Su catálogo pide clave de API para consultas programáticas. Se enlaza; no se inventa un espejo.",
    url: "https://www.archives.gov/",
  },
] as const;
