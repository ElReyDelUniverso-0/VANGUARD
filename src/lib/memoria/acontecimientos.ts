// ═══════════════════════════════════════════════════════════════════
// v419.0 · MEMORY ARCHIVE — los acontecimientos y sus documentos
//
// La pieza que diferencia este archivo de un buscador: se abre un
// acontecimiento y aparecen los documentos ORIGINALES que lo sostienen.
//
// Cada pieza fijada es un registro real de una fuente real, comprobado en
// vivo al construir esto (identificador + título + fecha + derechos). Si
// mañana una fuente retira una pieza, la ficha lo dice: no se rellena.
//
// Lo que NO hay aquí: interpretación histórica larga. El archivo enseña
// documentos y su procedencia; el relato se apoya en lo que las fuentes
// publican y lo que no está se declara en «qué no está».
// ═══════════════════════════════════════════════════════════════════

import type { FuenteId, TipoDocumento } from "./tipos";

export interface PiezaFijada {
  fuente: FuenteId;
  id: string;
  /** qué papel juega esta pieza en el acontecimiento */
  papel: string;
}

export interface ConsultaDeclarada {
  fuente: FuenteId;
  q: string;
  tipo?: TipoDocumento | null;
  desde?: number | null;
  hasta?: number | null;
  /** qué se espera encontrar y con qué límite */
  nota: string;
}

export interface Acontecimiento {
  slug: string;
  titulo: string;
  /** volanta: país o ámbito y fechas del acontecimiento */
  volanta: string;
  desde: number;
  hasta: number;
  paises: string[];
  resumen: string;
  /** tres o cuatro líneas de contexto, cada una con su fecha si la tiene */
  contexto: string[];
  piezas: PiezaFijada[];
  consultas: ConsultaDeclarada[];
  /** lo que este expediente NO tiene, dicho antes de que se busque */
  noEsta: string[];
  /** fuentes de las afirmaciones de contexto */
  referencias: Array<{ texto: string; url: string }>;
}

export const ACONTECIMIENTOS: Acontecimiento[] = [
  {
    slug: "independencia-de-los-estados-unidos",
    titulo: "La independencia de los Estados Unidos",
    volanta: "Trece colonias · 1776",
    desde: 1776,
    hasta: 1776,
    paises: ["Estados Unidos", "Reino Unido"],
    resumen:
      "El Congreso Continental aprobó la Declaración de Independencia el 4 de julio de 1776. El archivo conserva el borrador de junio de Thomas Jefferson y la copia firmada que custodia la Library of Congress, además del facsímil de la versión impresa.",
    contexto: [
      "Junio de 1776: Jefferson redacta el borrador de la declaración; el documento conserva sus correcciones a mano (Library of Congress).",
      "4 de julio de 1776: el Congreso aprueba el texto; la copia manuscrita firmada se conoce como la versión «engrossed».",
      "La impresión de John Dunlap difundió el texto la noche del 4 de julio; de ahí salieron las copias que circularon por las colonias.",
    ],
    piezas: [
      { fuente: "loc", id: "mtjbib000156", papel: "Borrador de Jefferson, junio de 1776, con sus tachaduras" },
      { fuente: "loc", id: "mtjbib000159", papel: "Copia manuscrita del 4 de julio de 1776" },
      { fuente: "commons", id: "621811", papel: "Facsímil de la declaración, con las firmas" },
    ],
    consultas: [
      {
        fuente: "loc",
        q: "declaration of independence",
        tipo: "documento",
        desde: 1776,
        hasta: 1783,
        nota: "Papeles de Jefferson y del Congreso Continental sobre la declaración y la guerra.",
      },
      {
        fuente: "ia",
        q: "declaration of independence 1776",
        tipo: "publicacion",
        desde: 1776,
        hasta: 1790,
        nota: "Folletos y respuestas impresas que circularon en la época, a favor y en contra.",
      },
    ],
    noEsta: [
      "El archivo no tiene el registro sonoro de la lectura pública de 1776: no existe.",
      "La copia firmada se custodia en Washington y solo se consulta en sala; lo digitalizado es la imagen.",
    ],
    referencias: [
      { texto: "Library of Congress · Declaración de Independencia", url: "https://www.loc.gov/item/mtjbib000159/" },
      { texto: "Wikimedia Commons · facsímil", url: "https://commons.wikimedia.org/wiki/File:United_States_Declaration_of_Independence.jpg" },
    ],
  },
  {
    slug: "revolucion-francesa",
    titulo: "La Revolución francesa y los derechos del hombre",
    volanta: "Francia · 1789",
    desde: 1789,
    hasta: 1789,
    paises: ["Francia"],
    resumen:
      "La Asamblea Nacional aprobó la Declaración de los Derechos del Hombre y del Ciudadano el 26 de agosto de 1789. El archivo conserva el facsímil del texto aprobado y busca en las tres fuentes lo que se imprimió ese año.",
    contexto: [
      "14 de julio de 1789: la toma de la Bastilla; el proceso desemboca en la Asamblea Nacional Constituyente.",
      "26 de agosto de 1789: se aprueba la Declaración en diecisiete artículos.",
      "Los impresos de 1789 circularon en folletos y grabados; muchos están digitalizados en bibliotecas europeas, no en las tres fuentes de este archivo.",
    ],
    piezas: [{ fuente: "commons", id: "65758", papel: "Facsímil de la Declaración de 1789, con su encabezado impreso" }],
    consultas: [
      {
        fuente: "ia",
        q: "révolution françoise 1789",
        tipo: "publicacion",
        desde: 1789,
        hasta: 1794,
        nota: "Folletos y actas impresas del periodo revolucionario.",
      },
      {
        fuente: "commons",
        q: "French Revolution 1789",
        desde: 1789,
        hasta: 1799,
        nota: "Grabados y documentos de la década; la fecha es la que declara cada fichero.",
      },
    ],
    noEsta: [
      "La Library of Congress respondió con lentitud al construir este expediente y su colección francesa no se pudo verificar pieza a pieza: no figura.",
      "El expediente no incluye los debates parlamentarios completos: son series de cientos de volúmenes.",
    ],
    referencias: [
      { texto: "Wikimedia Commons · Declaración de 1789", url: "https://commons.wikimedia.org/wiki/File:Declaration_of_the_Rights_of_Man_and_of_the_Citizen_in_1789.jpg" },
    ],
  },
  {
    slug: "constitucion-de-cadiz",
    titulo: "La Constitución de Cádiz",
    volanta: "España · 1812",
    desde: 1812,
    hasta: 1812,
    paises: ["España"],
    resumen:
      "Las Cortes de Cádiz promulgaron la Constitución el 19 de marzo de 1812, en plena guerra contra Napoleón. El archivo conserva el facsímil del texto impreso y enlaza las digitalizaciones declaradas.",
    contexto: [
      "1810-1813: las Cortes se reúnen en Cádiz, la única ciudad española que resiste el asedio francés.",
      "19 de marzo de 1812: se promulga la Constitución, conocida como «la Pepa».",
      "1814: Fernando VII deroga la Constitución al volver al trono; se restablece en 1820 y de nuevo en 1836.",
    ],
    piezas: [
      { fuente: "commons", id: "1510123", papel: "Facsímil de la Constitución de Cádiz de 1812" },
    ],
    consultas: [
      {
        fuente: "commons",
        q: "Constitución de Cádiz 1812",
        desde: 1810,
        hasta: 1823,
        nota: "Facsímiles y grabados de las Cortes y del texto constitucional.",
      },
      {
        fuente: "ia",
        q: "constitución de Cádiz",
        desde: 1812,
        hasta: 1830,
        nota: "Ediciones impresas del texto y su circulación en América.",
      },
    ],
    noEsta: [
      "El archivo no tiene el original manuscrito de las Cortes: las fuentes incluidas solo ofrecen impresos y facsímiles.",
      "No hay traducciones al resto de lenguas del imperio verificadas pieza a pieza.",
    ],
    referencias: [
      { texto: "Wikimedia Commons · Constitución de 1812", url: "https://commons.wikimedia.org/wiki/File:Constitucion_Cadiz_1812.png" },
    ],
  },
  {
    slug: "abolicion-de-la-esclavitud",
    titulo: "La abolición de la esclavitud en Estados Unidos",
    volanta: "Estados Unidos · 1862-1865",
    desde: 1862,
    hasta: 1865,
    paises: ["Estados Unidos"],
    resumen:
      "Lincoln firmó la proclamación preliminar el 22 de septiembre de 1862 y la definitiva el 1 de enero de 1863. El archivo reúne el borrador de la preliminar que custodia la Library of Congress y las cinco caras del facsímil de la definitiva.",
    contexto: [
      "22 de septiembre de 1862: proclamación preliminar, tras la batalla de Antietam.",
      "1 de enero de 1863: proclamación definitiva; declaraba libres a las personas esclavizadas en los estados en rebeldía.",
      "1865: la decimotercera enmienda abole la esclavitud en todo el país; el archivo no tiene su facsímil verificado en estas fuentes.",
    ],
    piezas: [
      { fuente: "loc", id: "mal1859300", papel: "Borrador manuscrito de la proclamación preliminar (22 de septiembre de 1862)" },
      { fuente: "commons", id: "65440764", papel: "Facsímil de la proclamación definitiva, cara 1 de 5" },
    ],
    consultas: [
      {
        fuente: "loc",
        q: "emancipation proclamation",
        tipo: "documento",
        desde: 1862,
        hasta: 1865,
        nota: "Papeles de Lincoln y facsímiles de la proclamación.",
      },
      {
        fuente: "ia",
        q: "emancipation proclamation",
        tipo: "publicacion",
        desde: 1863,
        hasta: 1870,
        nota: "Impresos y discursos de la época sobre la abolición.",
      },
    ],
    noEsta: [
      "El archivo no incluye los debates del Congreso sobre la decimotercera enmienda.",
      "Las cinco caras del facsímil están en Commons: aquí se enlaza la primera y el resto en la fuente.",
    ],
    referencias: [
      { texto: "Library of Congress · papeles de Lincoln", url: "https://www.loc.gov/item/mal1859300/" },
      { texto: "Wikimedia Commons · proclamación de 1863", url: "https://commons.wikimedia.org/wiki/File:Emancipation_Proclamation,_01-01-1863_(Page_1_of_5)_(3695343876).jpg" },
    ],
  },
  {
    slug: "sufragio-femenino",
    titulo: "El sufragio femenino: la marcha de 1913",
    volanta: "Washington D. C. · 1913",
    desde: 1913,
    hasta: 1913,
    paises: ["Estados Unidos"],
    resumen:
      "El 3 de marzo de 1913, víspera de la toma de posesión presidencial, miles de mujeres marcharon por Washington para exigir el voto. El archivo conserva el programa oficial de la marcha que dibujó Benjamin M. Dale y las fotografías que el Library of Congress digitalizó.",
    contexto: [
      "3 de marzo de 1913: la marcha del sufragio recorre Pennsylvania Avenue; la multitud agrede a las manifestantes y la caballería interviene.",
      "El programa oficial, ilustrado por Benjamin M. Dale, anunciaba las secciones de la marcha.",
      "1920: la decimonovena enmienda reconoce el voto femenino en todo el país.",
    ],
    piezas: [
      { fuente: "commons", id: "81341836", papel: "Programa oficial de la marcha del 3 de marzo de 1913" },
      { fuente: "loc", id: "94507639", papel: "El mismo programa en la Library of Congress, con la ficha de la institución" },
    ],
    consultas: [
      {
        fuente: "loc",
        q: "woman suffrage",
        tipo: "fotografia",
        desde: 1910,
        hasta: 1920,
        nota: "Fotografías de la marcha y de las campañas estatales.",
      },
      {
        fuente: "commons",
        q: "woman suffrage 1913",
        desde: 1910,
        hasta: 1920,
        nota: "Fotografías y carteles del movimiento, con su licencia declarada.",
      },
    ],
    noEsta: [
      "El archivo no tiene los discursos completos de la jornada: lo que se conserva son programas, prensa y fotografías.",
      "No todas las fotografías de la marcha tienen autor identificado en la fuente.",
    ],
    referencias: [
      { texto: "Library of Congress · programa de 1913", url: "https://www.loc.gov/item/94507639/" },
      { texto: "Wikimedia Commons · programa oficial", url: "https://commons.wikimedia.org/wiki/File:Official_Program_Woman_Suffrage_Procession_-_March_3,_1913.jpg" },
    ],
  },
  {
    slug: "desembarco-de-normandia",
    titulo: "El desembarco de Normandía",
    volanta: "Francia · 1944",
    desde: 1944,
    hasta: 1944,
    paises: ["Estados Unidos", "Reino Unido", "Canadá", "Francia", "Alemania"],
    resumen:
      "El 6 de junio de 1944 los aliados desembarcaron en las playas de Normandía. El archivo reúne fotografías del día siguiente en Omaha Beach y una imagen de las tropas de invasión que la Library of Congress conserva con derechos condicionados.",
    contexto: [
      "6 de junio de 1944: desembarco en cinco playas (Utah, Omaha, Gold, Juno y Sword).",
      "7 de junio de 1944: fecha que la fuente da a la fotografía del sector Easy Red, tomada al día siguiente del asalto.",
      "25 de agosto de 1944: liberación de París.",
    ],
    piezas: [
      { fuente: "commons", id: "64214651", papel: "Fotografía del sector Easy Red, Omaha Beach, 7 de junio de 1944" },
      { fuente: "loc", id: "2019630501", papel: "«Invasion troops»: la Library of Congress avisa de que la publicación puede estar restringida, así que la imagen no se publica aquí" },
    ],
    consultas: [
      {
        fuente: "loc",
        q: "normandy invasion",
        tipo: "fotografia",
        desde: 1944,
        hasta: 1945,
        nota: "Fotografías oficiales del desembarco y de los meses siguientes.",
      },
      {
        fuente: "commons",
        q: "Normandy 1944",
        desde: 1944,
        hasta: 1945,
        nota: "Fotografías de dominio público de la campaña de Normandía.",
      },
    ],
    noEsta: [
      "El archivo no publica las imágenes con derechos condicionados: enseña la ficha y el enlace a la institución.",
      "No hay partes militares completos digitalizados en estas fuentes.",
    ],
    referencias: [
      { texto: "Wikimedia Commons · Omaha Beach, D+1", url: "https://commons.wikimedia.org/wiki/File:2nd_Infantry_Division,_E-1_draw,_Easy_Red_sector,_Omaha_Beach,_D%2B1,_June_7,_1944.jpg" },
      { texto: "Library of Congress · Invasion troops", url: "https://www.loc.gov/item/2019630501/" },
    ],
  },
  {
    slug: "declaracion-universal-de-derechos-humanos",
    titulo: "La Declaración Universal de los Derechos Humanos",
    volanta: "París · 1948",
    desde: 1948,
    hasta: 1948,
    paises: ["Internacional"],
    resumen:
      "La Asamblea General de la ONU aprobó la Declaración el 10 de diciembre de 1948 en París. El archivo conserva el facsímil del texto y las versiones en otras lenguas que el proyecto Rosetta del Internet Archive reunió.",
    contexto: [
      "10 de diciembre de 1948: la Asamblea General aprueba la Declaración con 48 votos a favor, ninguno en contra y ocho abstenciones.",
      "El texto tiene treinta artículos y no es un tratado: su fuerza es la de un compromiso declarado.",
      "Existen traducciones a cientos de lenguas; el archivo solo puede mostrar las que las fuentes publican.",
    ],
    piezas: [
      { fuente: "commons", id: "76089189", papel: "Facsímil de la Declaración, 10 de diciembre de 1948" },
      { fuente: "ia", id: "rosettaproject_ban_undec-1", papel: "Versión en balinés del proyecto Rosetta: la misma declaración, otra lengua" },
    ],
    consultas: [
      {
        fuente: "ia",
        q: "universal declaration of human rights",
        tipo: "publicacion",
        desde: 1948,
        hasta: 1960,
        nota: "Ediciones y traducciones impresas del texto.",
      },
      {
        fuente: "commons",
        q: "Universal Declaration of Human Rights",
        desde: 1948,
        hasta: 1960,
        nota: "Facsímiles y fotografías de la sesión.",
      },
    ],
    noEsta: [
      "El acta literal de la votación no está en estas tres fuentes: se enlaza el registro de la ONU, que no ofrece consulta máquina.",
      "El proyecto Rosetta no declara licencia en sus registros: el archivo enlaza y no publica la imagen.",
    ],
    referencias: [
      { texto: "Wikimedia Commons · Declaración de 1948", url: "https://commons.wikimedia.org/wiki/File:The_universal_declaration_of_human_rights_10_December_1948.jpg" },
      { texto: "Internet Archive · Rosetta Project", url: "https://archive.org/details/rosettaproject_ban_undec-1" },
    ],
  },
  {
    slug: "muro-de-berlin",
    titulo: "El Muro de Berlín: de la construcción a la caída",
    volanta: "Berlín · 1961-1989",
    desde: 1961,
    hasta: 1989,
    paises: ["Alemania", "República Democrática Alemana", "República Federal Alemana"],
    resumen:
      "El muro se levantó en agosto de 1961 y cayó la noche del 9 de noviembre de 1989. El archivo reúne una fotografía de la construcción que la Library of Congress no ha evaluado en derechos y una imagen de la caída con licencia CC0.",
    contexto: [
      "13 de agosto de 1961: la RDA cierra la frontera y empieza a levantar el muro.",
      "9 de noviembre de 1989: el portavoz del Politburó anuncia la libertad de paso y miles de personas cruzan los puestos fronterizos esa noche.",
      "1990: la reunificación alemana se formaliza el 3 de octubre.",
    ],
    piezas: [
      { fuente: "commons", id: "170199868", papel: "Fotografía de la caída del muro, noviembre de 1989 (CC0)" },
      { fuente: "commons", id: "3692038", papel: "Alemanes del Este y del Oeste en la puerta de Brandeburgo, 1989 (CC BY-SA 3.0): se cita autor y licencia" },
      { fuente: "loc", id: "2010651171", papel: "«Building Berlin Wall», 1961: la institución no ha evaluado los derechos, así que solo se enlaza" },
    ],
    consultas: [
      {
        fuente: "loc",
        q: "berlin wall",
        tipo: "fotografia",
        desde: 1961,
        hasta: 1991,
        nota: "Fotografías de la construcción, los años del muro y su caída.",
      },
      {
        fuente: "commons",
        q: "Berlin Wall 1989",
        desde: 1989,
        hasta: 1990,
        nota: "Fotografías de la noche y de las semanas siguientes.",
      },
    ],
    noEsta: [
      "El archivo no tiene las actas del Politburó ni los informes de la Stasi: no están en estas fuentes.",
      "Dos de las tres piezas fijadas no se pueden publicar aquí por derechos; se enlazan, que es lo que la casa hace.",
    ],
    referencias: [
      { texto: "Wikimedia Commons · Mauerfall 1989", url: "https://commons.wikimedia.org/wiki/File:Berlin-Mauerfall-3-10-November-1989.jpg" },
      { texto: "Library of Congress · Building Berlin Wall", url: "https://www.loc.gov/item/2010651171/" },
    ],
  },
];

export const ACONTECIMIENTO_POR_SLUG = new Map(ACONTECIMIENTOS.map((a) => [a.slug, a]));

export function acontecimiento(slug: string): Acontecimiento | null {
  return ACONTECIMIENTO_POR_SLUG.get(slug) ?? null;
}

/** Años cubiertos por todos los expedientes, para la cronología de la portada. */
export function extensionTemporal(): { desde: number; hasta: number } {
  const desde = Math.min(...ACONTECIMIENTOS.map((a) => a.desde));
  const hasta = Math.max(...ACONTECIMIENTOS.map((a) => a.hasta));
  return { desde, hasta };
}
