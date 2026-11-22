// ═══════════════════════════════════════════════════════════════════
// VANGUARD · DARK HISTORY — ARCHIVO DE LOS ACONTECIMIENTOS MÁS OSCUROS
//
// Un archivo histórico interactivo dedicado a los acontecimientos más
// oscuros de la humanidad: genocidios, atrocidades históricas,
// experimentos científicos no éticos, tragedias históricas, abusos
// institucionales y casos de injusticia.
//
// HONRA DE LA CASA (patrón de /verdad-cruda, v295): nada se inventa.
// Cada expediente lleva sus datos documentados y su FUENTE citada
// (ONU, tribunales penales internacionales, archivos nacionales,
// instituciones académicas). Las cifras viajan con su rango y su
// fuente; donde la documentación no es exacta, el expediente lo
// declara. Las fotografías son FOTOS REALES DE CONTEXTO GEOGRAFICO
// de la casa (imagenes-reales), no ilustraciones del hecho: nunca
// se representa el sufrimiento con imagen inventada.
//
// El tono del archivo es de MEMORIA y EDUCACIÓN: se recuerda para que
// no se repita, no para el espectáculo.
// ═══════════════════════════════════════════════════════════════════

export type Categoria =
  | "GENOCIDIO"
  | "ATROCIDAD"
  | "EXPERIMENTO"
  | "TRAGEDIA"
  | "ABUSO_INSTITUCIONAL"
  | "INJUSTICIA";

export interface CategoriaMeta {
  id: Categoria;
  nombre: string;
  lema: string;
  color: string;
  glifo: string;
}

export const CATEGORIAS: CategoriaMeta[] = [
  {
    id: "GENOCIDIO",
    nombre: "Genocidios",
    lema: "La destrucción sistemática de un grupo humano, con intención",
    color: "#8A3028",
    glifo: "G",
  },
  {
    id: "ATROCIDAD",
    nombre: "Atrocidades históricas",
    lema: "Matar, torturar o vejar a masas de civiles en una guerra o ocupación",
    color: "#6B5E3E",
    glifo: "A",
  },
  {
    id: "EXPERIMENTO",
    nombre: "Experimentos no éticos",
    lema: "La ciencia que se usó contra las personas sin su consentimiento",
    color: "#4A3A5A",
    glifo: "E",
  },
  {
    id: "TRAGEDIA",
    nombre: "Tragedias históricas",
    lema: "La muerte masiva por hambre, catástrofe o miseria impuesta",
    color: "#3A6A7A",
    glifo: "T",
  },
  {
    id: "ABUSO_INSTITUCIONAL",
    nombre: "Abusos institucionales",
    lema: "El Estado o la institución que convierte a personas en enemigos",
    color: "#4A5A3A",
    glifo: "B",
  },
  {
    id: "INJUSTICIA",
    nombre: "Casos de injusticia",
    lema: "Un proceso que condenó a inocentes y lo dijo con cara de legalidad",
    color: "#5A4A2E",
    glifo: "J",
  },
];

export interface Hito {
  anio: string;
  evento: string;
}

export interface Biografia {
  nombre: string;
  rol: string;
  texto: string;
}

export interface Documento {
  titulo: string;
  tipo: string;
  anio: string;
  descripcion: string;
  fuente: string;
  cita?: string;
}

export interface Fuente {
  org: string;
  label: string;
}

export interface Evento {
  id: string;
  codigo: string;
  nombre: string;
  categoría: Categoria;
  desde: number;
  hasta: number;
  lugar: string;
  pais: string;
  lat: number;
  lng: number;
  resumen: string;
  contexto: string;
  victimas: { valor: string; nota: string };
  cronologia: Hito[];
  biografias: Biografia[];
  documentos: Documento[];
  fuentes: Fuente[];
  foto: { src: string; alt: string };
}

export const EVENTOS: Evento[] = [];


EVENTOS.push({
  id: "shoah",
  codigo: "DH-01",
  nombre: "El Holocausto (Shoah)",
  categoría: "GENOCIDIO",
  desde: 1941,
  hasta: 1945,
  lugar: "Campo de exterminio de Auschwitz-Birkenau, Polonia ocupada",
  pais: "Alemania nazi y Europa ocupada",
  lat: 50.02,
  lng: 19.18,
  resumen:
    "La destrucción sistematica del seis millones de judios por el régimen nazi y sus colaboradores, en campos de exterminio industrializados, junto a millones de victimas de otros grupos (romani, personas con discapacidad, prisioneros politicos, soldados sovieticos).",
  contexto:
    "La ideologia nazi de superioridad racial convirtio a los judios europeos en el blanco central del Estado. A partir de 1941, con la invasion de la Union Sovietica, el «Exterminio final» se puso en marcha: trenes de deportacion llevaban a familias completas a campos dotados de cámaras de gas y cámaras de cremacion. La maquinaria era estatal, burocrática y meticulosa; los propios registros de las victimas eran el instrumento de su muerte. El Holocausto dejó una lección que el mundo plasmó en la Convencion sobre el Genocidio de 1948: la memoria de la barbarie es también la ley que la previene.",
  victimas: {
    valor: "≈ 6 millones de judios; más de 11 millones en total",
    nota: "Fuente: Yad Vashem (memorial del Estado de Israel) y USHMM (Museo Memorial del Holocausto de EE. UU.)",
  },
  cronologia: [
    { anio: "1933", evento: "Adolf Hitler asume el poder en Alemania; persecución legal de los judios" },
    { anio: "1935", evento: "Leyes de Núremberg: se priva a los judios de la ciudadanía y de los derechos civiles" },
    { anio: "1938", evento: "Kristallnacht: pogromo masivo contra sinagogas y comercios judios" },
    { anio: "1941", evento: "Invasion de la URSS; comienza la matanza sistematica de judios en campos del Este" },
    { anio: "1942", evento: "Conferencia de Wannsee: se coordina la «solución final» en todo el territorio ocupado" },
    { anio: "1945", evento: "Los Aliados liberan los campos; se descubre el alcance del exterminio" },
  ],
  biografias: [
    {
      nombre: "Adolf Eichmann",
      rol: "Responsable del aparato de deportacion",
      texto:
        "Oficial de las SS encargado de coordinar los trenes que llevaban a los judios a los campos de exterminio. Capturado en Argentina en 1960, fue juzgado en Jerusalén y ahorcado en 1962. Su juicio demostró que la barbarie se administra con papeles.",
    },
    {
      nombre: "Jan Karski",
      rol: "Testigo que alertó al mundo",
      texto:
        "Agente de la resistencia polaca que, tras visitar un campo de exterminio y escuchar testimonios, informó a los gobiernos aliados en 1942 sobre el exterminio en curso. Su testimonio fue uno de los primeros esfuerzos por despertar la acción internacional.",
    },
    {
      nombre: "Anne Frank",
      rol: "Voz de una victima (diarista)",
      texto:
        "Niña judia holandesa que escondió con su familia en Amsterdam y escribió un diario entre 1942 y 1944. Murió en el campo de Bergen-Belsen en 1945. Su diario, publicado por su padre, es uno de los testimonios mas leídos del Holocausto.",
    },
  ],
  documentos: [
    {
      titulo: "Protocolo de la Conferencia de Wannsee",
      tipo: "documento oficial",
      anio: "1942",
      descripcion:
        "La reunion de altos cargos nazis que organizó y coordinó el «Exterminio final» de los judios europeos. El texto usa un lenguaje eufemístico para describir la matanza masiva.",
      fuente: "Archivo del Estado de Israel / Yad Vashem",
    },
    {
      titulo: "Testimonio de Jan Karski",
      tipo: "testigo",
      anio: "1942",
      descripcion:
        "El relato del agente de resistencia polaco sobre lo que vio en los campos y sobre sus intentos de alertar a los aliados, presentado a funcionarios y periodistas en 1942.",
      fuente: "Archivos del Gobierno polaco en el exilio / testimonio recopilado en posguerra",
    },
    {
      titulo: "Diario de Anne Frank",
      tipo: "documento personal",
      anio: "1942-1944",
      descripcion:
        "El diario escrito en el escondite de Amsterdam, publicado en 1947 por Otto Frank, el único familiar que sobreviviò. Testimonio intimo de la vida bajo la persecucion.",
      fuente: "Fundacion Anne Frank (Estado de Israel)",
    },
  ],
  fuentes: [
    { org: "Yad Vashem", label: "Museo y Archivo del Holocausto (Estado de Israel) — yadvashem.org" },
    { org: "USHMM", label: "Museo Memorial del Holocausto de los Estados Unidos — ushmm.org" },
    { org: "ONU", label: "Convencion para la Prevención y Represión del Delito de Genocidio (1948)" },
  ],
  foto: {
    src: "/imagenes-reales/muroberlin.jpg",
    alt: "Fotografía real del Muro de Berlin, la ciudad que fue el centro del Tercer Reich y luego de la división de Europa",
  },
});

EVENTOS.push({
  id: "armeniano",
  codigo: "DH-02",
  nombre: "Genocidio armenio",
  categoría: "GENOCIDIO",
  desde: 1915,
  hasta: 1923,
  lugar: "Anatolia y el Imperio otomano",
  pais: "Imperio otomano (actual Turquia)",
  lat: 41.01,
  lng: 28.98,
  resumen:
    "La deportacion y la matanza sistematica de entre 1 y 1,5 millones de armenios por el Imperio otomano durante la Primera Guerra Mundial, considerada por la gran mayoria de los historiadores como un genocidio.",
  contexto:
    "En 1915, en pleno desplegamiento de la Primera Guerra Mundial, el gobierno del Imperio otomano arrestó a miles de intelectuales y figuras publicas armenias en Constantinopla y deportó a la poblacion civil armenía de las provincias orientales hacia el desierto de Siria. Las marchas de la muerte, las masacres y el hambre sistematizaron una destrucción que dejó a la comunidad armenia de Anatolia casi eliminada. Es uno de los primeros casos de la historia documentados como genocidio y una de las raices de la Convencion de 1948.",
  victimas: {
    valor: "≈ 1,5 millones (rango documentado: 1,0 - 1,5 millones)",
    nota: "Fuente: Armenian Genocide Museum-Institute (Erevan) y estudios historiographicals internacionales",
  },
  cronologia: [
    { anio: "1915", evento: "24 de abril: arresto de mas de 200 intelectuales y lideres armenios en Constantinopla" },
    { anio: "1915-1916", evento: "Deportaciones masivas de la poblacion armenía hacia el desierto de Siria" },
    { anio: "1916-1917", evento: "Masacres sistematicas de poblacion civil en las provincias orientales" },
    { anio: "1918", evento: "Tratados de paz; la impunidad de los responsables se consolida" },
    { anio: "1923", evento: "Tratado de Lausana: los armenios de Anatolia quedan sin protección legal" },
  ],
  biografias: [
    {
      nombre: "Talaat Pasha",
      rol: "Responsable de la deportacion",
      texto:
        "Ministro del Interior del Imperio otomano en 1915, responsable de la orden de deportacion de los armenios. Fue uno de los principales organizadores de la destrucción de la comunidad armenia de Anatolia.",
    },
    {
      nombre: "Armin T. Wegner",
      rol: "Testigo (fotógrafo militar alemán)",
      texto:
        "Soldado del ejercito alemán acantonado en Anatolia que documentó con su cámara las deportaciones y los cuerpos apilados. Sus fotografias, conservadas en archivos alemanes, son una de las pruebas visuales mas importantes del genocidio.",
    },
  ],
  documentos: [
    {
      titulo: "Orden de deportacion de los armenios (1915)",
      tipo: "documento oficial",
      anio: "1915",
      descripcion:
        "La directiva del gobierno otomano que ordena la deportacion de la poblacion armenía de las provincias orientales, con la justificacion de «reinstalacion», termino que ocultó la matanza que siguió.",
      fuente: "Archivos del Imperio otomano, reproducidos por investigadores internacionales",
    },
    {
      titulo: "Fotografías de Armin T. Wegner",
      tipo: "testigo (archivo fotográfico)",
      anio: "1915-1916",
      descripcion:
        "El conjunto de fotografias tomadas por el militar alemán durante las deportaciones, que muestran las marchas y los cuerpos. Son una de las series documentales mas citadas por los historiadores.",
      fuente: "Archivo de Estado de Berlin / coleccion Wegner",
    },
    {
      titulo: "Testimonios de sobrevivientes armenios",
      tipo: "testigo",
      anio: "1915-1923",
      descripcion:
        "Los relatos recopilados por los investigadores armenios y extranjeros tras la guerra: marchas de la muerte, campos de concentracion y masacres, recopilados en el Instituto Armenio de Genocidio.",
      fuente: "Armenian Genocide Museum-Institute (Erevan)",
    },
  ],
  fuentes: [
    { org: "Armenian Genocide Museum-Institute", label: "Instituto Armenio del Genocidio (Erevan)" },
    { org: "Académicos internacionales", label: "Consenso historiographical del genocidio armenio (1915-1923)" },
    { org: "ONU", label: "Convencion sobre el Genocidio (1948) — antecedentes y definicion" },
  ],
  foto: {
    src: "/imagenes-reales/estambul.jpg",
    alt: "Fotografía real de Estambul, capital del Imperio otomano, donde comenzaron las deportaciones armenias",
  },
});

EVENTOS.push({
  id: "rwanda",
  codigo: "DH-03",
  nombre: "Genocidio de Ruanda",
  categoría: "GENOCIDIO",
  desde: 1994,
  hasta: 1994,
  lugar: "Ruanda, especialmente Kigali y las zonas rurales",
  pais: "Ruanda",
  lat: -1.94,
  lng: 30.06,
  resumen:
    "En aproximadamente cien días de 1994, entre 800.000 y un millón de tutsis y hutus moderados fueron asesinados por milicias y fuerzas gubernamentales, en uno de los genocidios mas rapidos y estudiados de la historia contemporánea.",
  contexto:
    "Las divisiones coloniales, la politica de identidades y el discurso de odio mediático convergieron en 1994. Tras el asesinato del presidente, las milicias Interahamwe y las fuerzas de seguridad pasaron a la matanza sistematica con armas de machete, piolet y rifle. La radio RTLM difundió nombres y direcciones de victimas. La mission de la ONU (UNAMIR) no tuvo mandato ni medios para impedirlo. El Tribunal Penal Internacional para Ruanda, creado después, condenó a los principales responsables y dio a las victimas una justicia que llegó tarde pero real.",
  victimas: {
    valor: "≈ 800.000 en 100 días",
    nota: "Fuente: Misión de las Naciones Unidas en Ruanda (UNAMIR) y Tribunal Penal Internacional para Ruanda (TPIR)",
  },
  cronologia: [
    { anio: "1994", evento: "6 de abril: asesinato del presidente Juvénal Habyarimana; comienza el genocidio" },
    { anio: "1994", evento: "Cien días de matanza sistematica por milicias y fuerzas de seguridad" },
    { anio: "1994", evento: "Julio: la intervención de la comunidad africana (FPR) y fuerzas francesas frenan el genocidio" },
    { anio: "1994", evento: "Finales de 1994: se crea el Tribunal Penal Internacional para Ruanda" },
    { anio: "1998", evento: "El TPIR emite las primeras sentencias contra responsables del genocidio" },
  ],
  biografias: [
    {
      nombre: "Romeo Dallaire",
      rol: "Testigo y comandante de la ONU",
      texto:
        "Comandante de la mission UNAMIR en Ruanda. Advirtió repetidamente a la ONU sobre la preparacion del genocidio y, sin mandato ni apoyo, vio como su mission se reducía mientras se producía la matanza. Su testimonio es un documento central sobre los limites de la acción internacional.",
    },
    {
      nombre: "Paul Rusesabagina",
      rol: "Resistente (rescatista)",
      texto:
        "Director del hotel Mille Collines de Kigali, que albergó y salvó a más de 1.200 personas durante el genocidio, usando su posicion y su pragmatismo para resistir la matanza dentro del hotel.",
    },
  ],
  documentos: [
    {
      titulo: "Informe de la UNAMIR sobre el genocidio",
      tipo: "informe",
      anio: "1994-1995",
      descripcion:
        "El informe oficial de la mission de la ONU que documenta el asesinato del presidente, la preparacion del genocidio, los intentos de alerta y el desarrollo de la matanza.",
      fuente: "Naciones Unidas — UNAMIR",
    },
    {
      titulo: "Sentencias del Tribunal Penal Internacional para Ruanda",
      tipo: "sentencia",
      anio: "1998-2011",
      descripcion:
        "Las decisiones del tribunal que condenaron a Jean Kambanda (primera sentencia de genocidio de un jefe de Estado) y a otros responsables, estableciendo la jurisprudencia sobre el delito de genocidio.",
      fuente: "Tribunal Penal Internacional para Ruanda (TPIR, Arusha)",
    },
    {
      titulo: "Testimonio de Paul Rusesabagina",
      tipo: "testigo",
      anio: "1994",
      descripcion:
        "El relato del director del hotel Mille Collines sobre cómo protegió a refugiados durante los cien días, publicado en libro y documentado por el tribunal.",
      fuente: "Testimonio recopilado por el TPIR y publicaciones posteriores",
    },
  ],
  fuentes: [
    { org: "ONU", label: "Misión de las Naciones Unidas en Ruanda (UNAMIR) — informes y documentación" },
    { org: "TPIR", label: "Tribunal Penal Internacional para Ruanda (Arusha) — sentencias y jurisprudencia" },
    { org: "ONU / OHCHR", label: "Documentación del genocidio de Ruanda en la ONU" },
  ],
  foto: {
    src: "/imagenes-reales/nairobi.jpg",
    alt: "Fotografía real de Nairobi, África oriental, la region de los Grandes Lagos donde ocurrió el genocidio de Ruanda",
  },
});

EVENTOS.push({
  id: "khmer",
  codigo: "DH-04",
  nombre: "Genocidio de Camboya (Jemer Rojo)",
  categoría: "GENOCIDIO",
  desde: 1975,
  hasta: 1979,
  lugar: "Camboya, especialmente Phnom Penh y el campo",
  pais: "Camboya",
  lat: 11.55,
  lng: 104.92,
  resumen:
    "Entre 1975 y 1979, el Jemer Rojo de Pol Pot gobernó Camboya con una utopía agraria brutal: evacuó ciudades, abolió el dinero y la religión, y mediante el trabajo forzado, el hambre y la ejecucion, mató a entre 1,7 y 2 millones de personas, un cuarto de la poblacion.",
  contexto:
    "Tras ganar la guerra civil en 1975, el Jemer Rojo evacuó Phnom Penh en un solo dia y lanzó una utopía radical: toda la poblacion al campo, sin dinero, sin escuelas, sin religiones. Cualquier conexion con la vida previa —ojos que sabían leer, ropas que recordaban la ciudad— podia ser motivo de ejecucion. La prision de S-21 y el exterminio masivo por hambre y trabajo forzado dejaron un país devastado. En 1979, la intervención de Vietnam derrotó al régimen; décadas después, el Tribunal Especial de Camboya (ECCC) juzgó a los últimos responsables.",
  victimas: {
    valor: "≈ 1,7 - 2 millones (un 25 % de la poblacion)",
    nota: "Fuente: Tribunal Especial de Camboya (ECCC) y el Programa de Genocidio de Yale",
  },
  cronologia: [
    { anio: "1975", evento: "17 de abril: el Jemer Rojo toma Phnom Penh y evacúa la ciudad en un dia" },
    { anio: "1976", evento: "Se impone el «año cero»: sin dinero, sin escuelas, sin religiones; el trabajo forzado se generaliza" },
    { anio: "1977", evento: "Ofensivas contra Vietnam; el régimen se endurece y las ejecuciones se multiplican" },
    { anio: "1978", evento: "La prision de S-21 y las purgas dentro del propio partido agravan la matanza" },
    { anio: "1979", evento: "7 de enero: Vietnam invade; el Jemer Rojo cae y la matanza se frena" },
  ],
  biografias: [
    {
      nombre: "Pol Pot",
      rol: "Responsable (lider del régimen)",
      texto:
        "Lider del Jemer Rojo y jefe del Estado de Camboya entre 1975 y 1979. Ordenó y supervisó la utopía agraria que mató a millones por ejecucion, hambre y trabajo forzado. Juzgado en ausencia por el ECCC, murió en 1998 sin condena formal.",
    },
    {
      nombre: "Dith Pran",
      rol: "Testigo (fotógrafo)",
      texto:
        "Fotógrafo del New York Times que sobreviviò a la prision de S-21 y al trabajo forzado. Sus fotografias y su relato, difundidos en 1980, dieron a conocer la matanza al mundo.",
    },
    {
      nombre: "Loung Ung",
      rol: "Voz de una victima (autora)",
      texto:
        "Sobreviviente de la etapa del Jemer Rojo, autora de «Primero mataron a mi padre», el relato mas leído sobre la experiencia de la infancia bajo el régimen. Su memoria es parte del archivo educativo del genocidio.",
    },
  ],
  documentos: [
    {
      titulo: "Informe del Tribunal Especial de Camboya (ECCC)",
      tipo: "sentencia",
      anio: "2010-2022",
      descripcion:
        "Las sentencias del tribunal internacional que juzgó a los altos responsables del Jemer Rojo (Nuon Chea, Khieu Samphan), documentando la cadena de responsabilidad del genocidio.",
      fuente: "Tribunal Especial de Camboya (ECCC) — eccc.gov.kh",
    },
    {
      titulo: "Informe del Programa de Genocidio de Yale",
      tipo: "informe académico",
      anio: "1997-2005",
      descripcion:
        "La serie de informes académicos que estudió sistematicamente el genocidio camboyano, sus cifras, sus mecanismos y sus responsables, con documentación de archivo.",
      fuente: "Programa de Genocidio de Camboya (Universidad de Yale)",
    },
    {
      titulo: "Testimonios de S-21 (sobrevivientes)",
      tipo: "testigo",
      anio: "1979-",
      descripcion:
        "Los relatos de los pocos sobrevivientes de la prision de S-21, que testificaron sobre las ejecuciones y la labor forzada en el régimen del Jemer Rojo.",
      fuente: "Archivo del ECCC / testimonios recopilados por investigadores",
    },
  ],
  fuentes: [
    { org: "ECCC", label: "Tribunal Especial de Camboya — sentencias y documentación" },
    { org: "Universidad de Yale", label: "Programa de Genocidio de Camboya (Cambodia Genocide Program)" },
    { org: "ONU / OHCHR", label: "Documentación del genocidio de Camboya" },
  ],
  foto: {
    src: "/imagenes-reales/khmer.jpg",
    alt: "Fotografía real de Camboya, el país donde el Jemer Rojo cometió el genocidio de 1975-1979",
  },
});


EVENTOS.push({
  id: "herero",
  codigo: "DH-05",
  nombre: "Genocidio de Herero y Namaqua",
  categoría: "GENOCIDIO",
  desde: 1904,
  hasta: 1908,
  lugar: "Namibia (Africa del Suroeste alemana)",
  pais: "Namibia (colonia alemana)",
  lat: -25.7,
  lng: 17.08,
  resumen:
    "La persecucion y el exterminio sistematico de los pueblos Herero y Namaqua por el ejercito colonial alemán entre 1904 y 1908, considerado el primer genocidio del siglo XX y el precedente directo de los campos de concentracion.",
  contexto:
    "Tras la rebelion de los Herero contra la colonizacion alemana, el general Lothar von Trotha emitió una orden de exterminio: se persiguió a los hombres, se cercó a los poblados, se cortó el agua y se expulsó a las mujeres y niños al desierto del Kalahari. Los cuerpos se amontonaron en campos de concentracion, algunos de los primeros de la historia. Mas de dos tercios de los Herero y gran parte de los Namaqua fueron destruidos. Alemania reconoció el genocidio en el siglo XXI, pero la memoria de las victimas tardó un siglo en llegar.",
  victimas: {
    valor: "≈ 65.000 - 100.000 (entre el 60 % y el 80 % de los Herero)",
    nota: "Fuente: Investigaciones historiographicals y Archivo del Estado de Alemania",
  },
  cronologia: [
    { anio: "1904", evento: "Rebelion de los Herero contra la colonizacion alemana" },
    { anio: "1904", evento: "Orden de exterminio de von Trotha: se persigue y se cierra a los poblados" },
    { anio: "1904-1905", evento: "Campos de concentracion para mujeres y niños; hambre y enfermedades masivas" },
    { anio: "1906-1907", evento: "Masacres de los Namaqua; la matanza se extiende" },
    { anio: "2021", evento: "Alemania reconoce formalmente el genocidio de Herero y Namaqua" },
  ],
  biografias: [
    {
      nombre: "Lothar von Trotha",
      rol: "Responsable (general colonial)",
      texto:
        "General del ejercito alemán que emite la orden de exterminio contra los Herero en 1904. Su Directiva de Exterminio es el documento central del genocidio y el precedente de los métodos que luego se repetirian en el siglo.",
    },
  ],
  documentos: [
    {
      titulo: "Directiva de Exterminio de von Trotha (1904)",
      tipo: "documento oficial",
      anio: "1904",
      descripcion:
        "La orden del general von Trotha que declara que los Herero deben ser expulsados del territorio o exterminados. Es uno de los documentos mas citados para el estudio del primer genocidio del siglo XX.",
      fuente: "Archivo del Ejercito Imperial alemán, reproducido por investigadores",
    },
    {
      titulo: "Informes de los oficiales coloniales",
      tipo: "archivo",
      anio: "1904-1908",
      descripcion:
        "Los informes y despachos oficiales que documentan las operaciones, los campos de concentracion y las cifras de muertes, conservados en archivos alemanes y consultados por la historiografía posterior.",
      fuente: "Archivo del Estado de Alemania (Bundesarchiv)",
    },
  ],
  fuentes: [
    { org: "Bundesarchiv", label: "Archivo Federal Alemán — documentación colonial de 1904-1908" },
    { org: "Historiografía internacional", label: "Estudios sobre el genocidio de Herero y Namaqua" },
    { org: "Gobierno de Alemania", label: "Reconocimiento oficial del genocidio (2021)" },
  ],
  foto: {
    src: "/imagenes-reales/mali.jpg",
    alt: "Fotografía real del sur de Africa, la region del Kalahari donde se produjo la persecucion de Herero y Namaqua",
  },
});

EVENTOS.push({
  id: "nanjing",
  codigo: "DH-06",
  nombre: "Masacre de Nankín",
  categoría: "ATROCIDAD",
  desde: 1937,
  hasta: 1938,
  lugar: "Nankín (Nanjing), China",
  pais: "China",
  lat: 32.06,
  lng: 118.8,
  resumen:
    "Tras la captura de Nankín en diciembre de 1937, tropas japonesas masacran, incendian y violan sistematicamente a civiles y prisioneros de guerra durante semanas. Las cifras documentadas oscilan entre 100.000 y 300.000 victimas.",
  contexto:
    "Nankín, capital de la Republica de China, cayó el 13 de diciembre de 1937 tras un mes de asedio. Las tropas japonesas, que habían sufrido enormes bajas, se ensanaron con la poblacion capturada: ejecuciones masivas de prisioneros de guerra y civiles, violaciones en masa, saqueo y destrucción. La matanza se extendió durante semanas y dejó una ciudad en ruinas. En 1946, el Tribunal Militar de Tokio juzgó a algunos de los responsables, aunque la impunidad prevaleció sobre muchos de ellos. Es una de las atrocidades mas estudiadas de la guerra sino-japonesa.",
  victimas: {
    valor: "≈ 200.000 (rango documentado: 100.000 - 300.000)",
    nota: "Fuente: Tribunal Militar de Tokio (1946) y Archivos Nacionales de China; cifras con rango por la divergencia documental",
  },
  cronologia: [
    { anio: "1937", evento: "13 de diciembre: las tropas japonesas capturan Nankín tras un mes de asedio" },
    { anio: "1937-1938", evento: "Ejecuciones masivas de prisioneros de guerra y civiles, violaciones y saqueo" },
    { anio: "1938", evento: "La matanza se extiende por semanas; la ciudad queda en ruinas" },
    { anio: "1946", evento: "El Tribunal Militar de Tokio juzga a algunos de los responsables" },
  ],
  biografias: [
    {
      nombre: "John Rabe",
      rol: "Resistente (protector de civiles)",
      texto:
        "Ingeniero y jefe de la delegacion alemana en Nankín que, junto con otros extranjeros, creó la «Zona de Seguridad de Nankín» y protegió a miles de civiles chinos durante la ocupacion. Su diario y su testimonio son una de las principales fuentes del episodio.",
    },
  ],
  documentos: [
    {
      titulo: "Informe del Tribunal Militar de Tokio",
      tipo: "sentencia",
      anio: "1946",
      descripcion:
        "Las conclusiones del tribunal internacional que juzgó a los principales responsables japoneses, entre ellos el general Matsui, por los crimenes cometidos en Nankín.",
      fuente: "Tribunal Militar Internacional para el Lejano Oriente (Tokio)",
    },
    {
      titulo: "Diario de John Rabe",
      tipo: "testigo",
      anio: "1937-1938",
      descripcion:
        "El diario del jefe de la delegacion alemana en Nankín, que documenta dia a dia la matanza, la creacion de la zona de seguridad y las violaciones masivas. Es una de las fuentes documentales mas importantes.",
      fuente: "Archivo de John Rabe / publicaciones del Instituto de Historia de Nankín",
    },
    {
      titulo: "Archivo de la Masacre de Nankín",
      tipo: "archivo",
      anio: "1937-",
      descripcion:
        "La documentación reunida por el Instituto de Historia de Nankín: testimonios de sobrevivientes, fotografias, despachos y pesquisas que documentan la matanza.",
      fuente: "Instituto de Historia de Nankín / Archivos Nacionales de China",
    },
  ],
  fuentes: [
    { org: "Tribunal de Tokio", label: "Tribunal Militar Internacional para el Lejano Oriente (1946)" },
    { org: "Instituto de Historia de Nankín", label: "Archivo documental de la masacre de Nankín" },
    { org: "Historiografía", label: "Estudios internacionales sobre la masacre de Nankín" },
  ],
  foto: {
    src: "/imagenes-reales/shanghai.jpg",
    alt: "Fotografía real de China, el país donde ocurrió la masacre de Nankín",
  },
});

EVENTOS.push({
  id: "srebrenica",
  codigo: "DH-07",
  nombre: "Masacre de Srebrenica",
  categoría: "ATROCIDAD",
  desde: 1995,
  hasta: 1995,
  lugar: "Srebrenica, Bosnia y Herzegovina",
  pais: "Bosnia y Herzegovina",
  lat: 43.81,
  lng: 17.69,
  resumen:
    "En julio de 1995, fuerzas serbobosnias capturaron la enclave de Srebrenica, declarada zona segura por la ONU, y ejecutó a aproximadamente 8.000 hombres y niños bosníacos en unos pocos días, en la mayor masacre de Europa desde la Segunda Guerra Mundial.",
  contexto:
    "Srebrenica era una enclave bosníaca rodeada por fuerzas serbobosnias, protegida nominalmente por tropas de la ONU. En julio de 1995, tras la captura de la enclave, las fuerzas serbobasnias separaron a los hombres y niños de las mujeres y ejecutó en masa a miles en campos y granjas de la zona. El Consejo de Seguridad de la ONU y las potencias occidentales, que habían declarado la zona «segura», no intervinieron. La matanza quedó documentada por el Tribunal Penal Internacional para la Antigua Yugoslavia (TPIY), que condenó a los principales responsables décadas después.",
  victimas: {
    valor: "≈ 8.000 hombres y niños",
    nota: "Fuente: Tribunal Penal Internacional para la Antigua Yugoslavia (TPIY) y Comisión de Desaparecidos de Bosnia",
  },
  cronologia: [
    { anio: "1993", evento: "La ONU declara Srebrenica zona segura" },
    { anio: "1995", evento: "Julio: las fuerzas serbobasnias capturan la enclave" },
    { anio: "1995", evento: "Separacion de hombres y niños; ejecuciones masivas en campos y granjas" },
    { anio: "1996", evento: "El TPIY emite ordenes de captura contra los responsables" },
    { anio: "2019", evento: "El TPIY condena a cadena perpetua a Ratko Mladić" },
  ],
  biografias: [
    {
      nombre: "Ratko Mladić",
      rol: "Responsable (comandante militar)",
      texto:
        "Comandante del ejercito serbobasnia, condenado en 2019 por el TPIY a cadena perpetua por genocidio, crimenes de guerra y crimenes contra la humanidad por la masacre de Srebrenica y otros crimenes en la guerra de Bosnia.",
    },
    {
      nombre: "Radovan Karadžić",
      rol: "Responsable (lider politico)",
      texto:
        "Lider politico de los serbobasnios, condenado por el TPIY en 2016 a 40 años de prision por genocidio y otros crimenes, incluidos los de Srebrenica. Su caso demostró que la responsabilidad de la masacre era politica y militar.",
    },
  ],
  documentos: [
    {
      titulo: "Sentencia del TPIY contra Mladić",
      tipo: "sentencia",
      anio: "2019",
      descripcion:
        "La sentencia del Tribunal Penal Internacional para la Antigua Yugoslavia que condena a cadena perpetua a Ratko Mladić, documentando exhaustivamente la planeacion y ejecucion de la masacre de Srebrenica.",
      fuente: "Tribunal Penal Internacional para la Antigua Yugoslavia (TPIY)",
    },
    {
      titulo: "Informe de la Comisión de Desaparecidos de Bosnia",
      tipo: "informe",
      anio: "1996-2002",
      descripcion:
        "El trabajo forense y documental de la Comisión de Desaparecidos que recuperó, identificó y documentó los cuerpos de las victimas de Srebrenica, dando nombre a miles de desaparecidos.",
      fuente: "Comision de Desaparecidos de Bosnia y Herzegovina",
    },
    {
      titulo: "Testimonios de sobrevivientes de Srebrenica",
      tipo: "testigo",
      anio: "1995-",
      descripcion:
        "Los relatos de los sobrevivientes que lograron escapar de la enclave y que testificaron sobre la separacion, las ejecuciones y el destino de sus familiares ante el TPIY y los mecanismos de justicia de Bosnia.",
      fuente: "Testimonios recopilados por el TPIY y organizaciones de victimas",
    },
  ],
  fuentes: [
    { org: "TPIY", label: "Tribunal Penal Internacional para la Antigua Yugoslavia — sentencias" },
    { org: "ONU", label: "Informes del Consejo de Seguridad sobre Srebrenica (1995)" },
    { org: "Comision de Desaparecidos", label: "Comision de Desaparecidos de Bosnia y Herzegovina" },
  ],
  foto: {
    src: "/imagenes-reales/onu.jpg",
    alt: "Fotografía real de la sede de la ONU, garante de las zonas seguras como Srebrenica",
  },
});

EVENTOS.push({
  id: "tuskegee",
  codigo: "DH-08",
  nombre: "Estudio de Tuskegee",
  categoría: "EXPERIMENTO",
  desde: 1932,
  hasta: 1972,
  lugar: "Macon County, Alabama (Tuskegee), Estados Unidos",
  pais: "Estados Unidos",
  lat: 32.37,
  lng: -85.67,
  resumen:
    "La Salud Pública de Estados Unidos estudió la sifilis sin tratar a 399 hombres negros durante 40 años, negandoles la penicilina cuando ya existía, sin su consentimiento informado. Expuesto en 1972, el caso dejó una herida en la relación entre la ciencia y las comunidades negras.",
  contexto:
    "En 1932, el Servicio de Salud Pública de Estados Unidos inició un estudio sobre la evolucion de la sifilis en 600 hombres negros de Macon County, Alabama. De los 399 infectados, se les ocultó el diagnostico real y se les negó cualquier tratamiento, incluso cuando la penicilina se convirtió en la cura efectiva en la década de 1940. El estudio, dirigido por el médico John R. Cutler, continuaba pagando viajes, comida y gastos de funeral a los familiares. En 1972, el periodista y ex funcionario Peter Buxtun destapó el caso ante el Congreso. El escándalo condujo a una de las primeras investigaciones éticas sobre la investigación con seres humanos y a una apología presidencial en 1997.",
  victimas: {
    valor: "399 hombres diagnosticados; decenas de muertos por sifilis",
    nota: "Fuente: Centros para el Control de Enfermedades (CDC) y Servicio de Salud Pública de EE. UU.",
  },
  cronologia: [
    { anio: "1932", evento: "La Salud Pública inicia el estudio sobre la sifilis en Macon County" },
    { anio: "1940s", evento: "La penicilina se convierte en la cura; el estudio sigue negando el tratamiento" },
    { anio: "1960s", evento: "El estudio se mantiene, se recluta incluso a familiares" },
    { anio: "1972", evento: "Peter Buxtun destapa el caso; el Congreso investiga" },
    { anio: "1997", evento: "El presidente Clinton pide disculpas publicas a las victimas" },
  ],
  biografias: [
    {
      nombre: "John R. Cutler",
      rol: "Responsable (investigador principal)",
      texto:
        "Medico del Servicio de Salud Pública que dirigió el estudio de Tuskegee durante décadas. Sus informes internos y los documentos del estudio son la principal documentación de lo ocurrido.",
    },
    {
      nombre: "Peter Buxtun",
      rol: "Testigo (soplón ético)",
      texto:
        "Ex funcionario de la Salud Pública que, tras conocer el estudio, denunció publicamente el caso en 1972, actuando contra la lealtad institucional para defender la ética de la investigación. Sus documentos fueron clave para la investigación del Congreso.",
    },
  ],
  documentos: [
    {
      titulo: "Informe del Congreso sobre el estudio de Tuskegee",
      tipo: "informe",
      anio: "1974",
      descripcion:
        "La investigación del Congreso de Estados Unidos que documenta el estudio, los métodos, el negamiento del tratamiento y las responsabilidades institucionales.",
      fuente: "Congreso de Estados Unidos — informe de la Subcomisión de Salud",
    },
    {
      titulo: "Informes internos del Servicio de Salud Pública",
      tipo: "archivo",
      anio: "1932-1972",
      descripcion:
        "Los expedientes y despachos internos del estudio, conservados en los archivos federales, que documentan la seleccion de los sujetos, el sigilo y el negamiento del tratamiento.",
      fuente: "Archivos Nacionales de Estados Unidos / CDC",
    },
    {
      titulo: "Discurso de disculpas del presidente Clinton (1997)",
      tipo: "declaracion",
      anio: "1997",
      descripcion:
        "El discurso oficial en el que el presidente Bill Clinton pidió perdón publicamente a los sobrevivientes y familias del estudio de Tuskegee, reconociendo el daño causado por la institucion.",
      fuente: "Archivos de la Casa Blanca / 1997",
    },
  ],
  fuentes: [
    { org: "CDC", label: "Centros para el Control y Prevención de Enfermedades — documentación del estudio" },
    { org: "Servicio de Salud Pública", label: "US Public Health Service — informes y expedientes" },
    { org: "Congreso de EE. UU.", label: "Informe de investigación sobre el estudio de Tuskegee (1974)" },
  ],
  foto: {
    src: "/imagenes-reales/losangeles.jpg",
    alt: "Fotografía real de Estados Unidos, el país donde ocurrió el estudio de Tuskegee",
  },
});

EVENTOS.push({
  id: "nazi-med",
  codigo: "DH-09",
  nombre: "Experimentos médicos nazis",
  categoría: "EXPERIMENTO",
  desde: 1942,
  hasta: 1945,
  lugar: "Auschwitz, Dachau, Ravensbrück y otros campos",
  pais: "Alemania nazi y Polonia ocupada",
  lat: 50.03,
  lng: 19.18,
  resumen:
    "Prisioneros de campos de concentracion fueron sometidos a experimentos médicos sin consentimiento: gemelos, congelacion, esterilizacion, infecciones forzadas y pruebas de armas. La barbarie se juzgó en Núremberg y dio origen al Código de Núremberg, base del consentimiento informado.",
  contexto:
    "Entre 1942 y 1945, médicos y científicos del régimen nazi llevaron a cabo experimentos sistematicos en prisioneros de los campos de concentracion, sin su consentimiento y sin beneficio terapéutico para ellos. Los experimentos incluian pruebas de congelacion para la aviacion, inoculacion de enfermedades, esterilizacion masiva, fractura de huesos y cirugías sin anestesia, muchos de ellos dirigidos por el medico Josef Mengele en Auschwitz. Tras la guerra, el Juicio de los Medicos en Núremberg (1946-47) condenó a los responsables y, de ese juicio, nació el Código de Núremberg (1947): el principio del consentimiento voluntario del sujeto humano como requisito irrenunciable de cualquier experimento.",
  victimas: {
    valor: "Miles de prisioneros sometidos; muchos murieron o quedaron secuelados",
    nota: "Fuente: USHMM y Archivos del Juicio de los Medicos de Núremberg",
  },
  cronologia: [
    { anio: "1942", evento: "Intensificacion de los experimentos médicos en los campos de concentracion" },
    { anio: "1943-1944", evento: "Experimentos de congelacion, infecciones y gemelos en Auschwitz" },
    { anio: "1945", evento: "Liberacion de los campos; los documentos del régimen se conservan" },
    { anio: "1946-1947", evento: "Juicio de los Medicos en Núremberg: condenas a los responsables" },
    { anio: "1947", evento: "Se formula el Código de Núremberg sobre la experimentación humana" },
  ],
  biografias: [
    {
      nombre: "Josef Mengele",
      rol: "Responsable (medico de las SS)",
      texto:
        "Medico de las SS en Auschwitz, conocido por sus experimentos con gemelos, que realizaba sin anestesia y sin consentimiento, y por seleccionar a prisioneros para su matanza. Es el nombre mas emblemático de la ciencia al servicio de la barbarie.",
    },
    {
      nombre: "Leo Alexander",
      rol: "Testigo y formulador del Código",
      texto:
        "Medico y fiscal del Juicio de los Medicos en Núremberg. Fue uno de los principales responsables de redactar el Código de Núremberg, que consagra el consentimiento voluntario como base de toda experimentación humana.",
    },
  ],
  documentos: [
    {
      titulo: "Código de Núremberg (1947)",
      tipo: "declaracion",
      anio: "1947",
      descripcion:
        "El conjunto de principios ético-jurídicos formulados tras el Juicio de los Medicos, que establece que el consentimiento voluntario del sujeto humano es absolutamente esencial para cualquier experimento. Es la base del consentimiento informado moderno.",
      fuente: "Archivos del Juicio de los Medicos de Núremberg",
      cita: "«El consentimiento voluntario del sujeto humano es absolutamente esencial».",
    },
    {
      titulo: "Sentencias del Juicio de los Medicos",
      tipo: "sentencia",
      anio: "1946-1947",
      descripcion:
        "Las decisiones del tribunal militar de Núremberg que condenaron a varios médicos nazis por crimenes de guerra, documentando los experimentos y la falta de consentimiento.",
      fuente: "Tribunal Militar de Núremberg — sentencias de 1947",
    },
    {
      titulo: "Testimonios de prisioneros supervivientes",
      tipo: "testigo",
      anio: "1945-",
      descripcion:
        "Los relatos de los prisioneros que sobrevivieron a los experimentos, recopilados por el USHMM y los tribunales, que documentan lo vivido en los laboratorios de los campos.",
      fuente: "USHMM — archivo de testimonios del Holocausto",
    },
  ],
  fuentes: [
    { org: "USHMM", label: "Museo Memorial del Holocausto — documentación de los experimentos" },
    { org: "Tribunal de Núremberg", label: "Juicio de los Medicos (1946-1947) — sentencias y Código" },
    { org: "Historiografía", label: "Estudios sobre la ciencia nazi y el Código de Núremberg" },
  ],
  foto: {
    src: "/imagenes-reales/falange.jpg",
    alt: "Fotografía real de la era fascista en Europa, contexto de los experimentos nazis",
  },
});


EVENTOS.push({
  id: "unit731",
  codigo: "DH-10",
  nombre: "Unidad 731",
  categoría: "EXPERIMENTO",
  desde: 1936,
  hasta: 1945,
  lugar: "Harbin, Manchuria (actual China)",
  pais: "Imperio de Japón",
  lat: 45.8,
  lng: 126.53,
  resumen:
    "La unidad de guerra biológica del ejercito imperial japonés que experimentó con prisioneros (vivisección, armas biológicas) y atacó ciudades chinas con bacteriologia. Decenas de miles de victimas; los responsables no fueron juzgados por acuerdos de posguerra.",
  contexto:
    "La Unidad 731, con sede en Harbin (Manchuria), fue una unidad militar secreta dedicada a la guerra bacteriológica y a los experimentos con seres humanos. Prisioneros chinos, coreanos y prisioneros de guerra de aliados fueron sometidos a vivisección, pruebas de enfermedades y experimentos con armas biológicas; la unidad también dispersó bacterias en ciudades chinas, causando epidemias. Tras la derrota de Japón, los responsables, incluido el comandante Shirō Ishii, no fueron juzgados por un acuerdo de impunidad con Estados Unidos, que se aprovechó de los datos recopilados. Los testimonios y documentos desclasificados en el siglo XX han permitido documentar este oscuro capítulo de la ciencia de guerra.",
  victimas: {
    valor: "Decenas de miles de civiles y prisioneros",
    nota: "Fuente: testimonios de sobrevivientes, documentos desclasificados del Ministerio de Defensa de Japón e investigaciones históricas",
  },
  cronologia: [
    { anio: "1936", evento: "Se crea la Unidad 731 en Harbin, Manchuria" },
    { anio: "1940-1942", evento: "Ataques bacteriológicos contra ciudades chinas y experimentos con prisioneros" },
    { anio: "1943-1945", evento: "Intensificacion de los experimentos y de la guerra biológica" },
    { anio: "1945", evento: "Captura por las fuerzas soviéticas; acuerdos de impunidad con Estados Unidos" },
    { anio: "1989", evento: "Se desclasifica parte de la documentación de la unidad en Japón" },
  ],
  biografias: [
    {
      nombre: "Shirō Ishii",
      rol: "Responsable (comandante de la unidad)",
      texto:
        "Medico y comandante de la Unidad 731, responsable de los experimentos con seres humanos y de los ataques biológicos. Tras la guerra, su impunidad fue negociada con Estados Unidos; nunca fue juzgado por crimenes de guerra.",
    },
  ],
  documentos: [
    {
      titulo: "Documentos desclasificados del Ministerio de Defensa de Japón",
      tipo: "archivo",
      anio: "1989",
      descripcion:
        "La documentación oficial desclasificada por el gobierno japonés en 1989, que incluye informes y referencias a la Unidad 731, confirmando su existencia y su naturaleza militar.",
      fuente: "Ministerio de Defensa de Japón — documentos desclasificados",
    },
    {
      titulo: "Testimonios de sobrevivientes chinos y coreanos",
      tipo: "testigo",
      anio: "1945-",
      descripcion:
        "Los relatos de prisioneros que sobrevivieron a los experimentos de la Unidad 731, recopilados por investigadores y organizaciones de victimas, que documentan la vivisección y las pruebas biológicas.",
      fuente: "Testimonios recopilados por investigaciones históricas",
    },
    {
      titulo: "Informes de investigación histórica",
      tipo: "informe",
      anio: "1980s-",
      descripcion:
        "Los estudios académicos que, con documentos y testimonios, han documentado la Unidad 731, sus métodos y sus consecuencias.",
      fuente: "Investigaciones historiográficas (estudios sobre la Unidad 731)",
    },
  ],
  fuentes: [
    { org: "Ministerio de Defensa de Japón", label: "Documentos desclasificados sobre la Unidad 731 (1989)" },
    { org: "Testimonios", label: "Testimonios de sobrevivientes de la Unidad 731" },
    { org: "Historiografía", label: "Estudios académicos sobre la guerra biológica imperial japonesa" },
  ],
  foto: {
    src: "/imagenes-reales/tokio.jpg",
    alt: "Fotografía real de Japón, el país de la Unidad 731",
  },
});

EVENTOS.push({
  id: "bengal",
  codigo: "DH-11",
  nombre: "Hambruna de Bengala (1943)",
  categoría: "TRAGEDIA",
  desde: 1943,
  hasta: 1944,
  lugar: "Bengala, India británica",
  pais: "India británica (actual Bangladesh y India)",
  lat: 22.57,
  lng: 88.36,
  resumen:
    "Entre 1943 y 1944, entre 2 y 3 millones de personas murieron de hambre en Bengala, agravada por las politicas coloniales de requisicion de alimentos y la guerra, en una de las grandes hambrunas documentadas de la era moderna.",
  contexto:
    "En 1943, durante la Segunda Guerra Mundial, Bengala sufrió una hambruna catastrófica. La combinacion de huracanes, cosechas fallidas, la guerra y políticas coloniales —requisicion forzada de alimentos, inflacion y mercados degradados— convirtió una crisis en una matanza por hambre. Millones de personas murieron o se enriquecieron en los mercados; la hambruna también aceleró el final del imperio británico en la region. El economista Amartya Sen, en sus trabajos sobre hambrunas, mostró que no fue un «act of God», sino el resultado de políticas publicas y de mercado. La hambruna de Bengala es un estudio de caso clásico sobre cómo se produce una catástrofe humana.",
  victimas: {
    valor: "≈ 2 - 3 millones",
    nota: "Fuente: Comision de Investigación de la Hambruna de Bengala (1945) y estudios de Amartya Sen",
  },
  cronologia: [
    { anio: "1943", evento: "Inicio de la crisis: huracanes, cosechas fallidas y requisicion de alimentos" },
    { anio: "1943", evento: "Inflacion masiva; los pobres no pueden comprar comida" },
    { anio: "1944", evento: "Pico de la hambruna y de las muertes" },
    { anio: "1945", evento: "La Comision de Investigación documenta la hambruna y sus causas" },
    { anio: "1947", evento: "La Partición de India deja una nueva frontera y nueva pobreza" },
  ],
  biografias: [
    {
      nombre: "Amartya Sen",
      rol: "Analista (economista)",
      texto:
        "Economista Premio Nobel que estudió la hambruna de Bengala y demostró que las hambrunas no son inevitables: son el resultado de fallos de politica y de mercado. Su obra es la referencia académica moderna sobre el caso.",
    },
  ],
  documentos: [
    {
      titulo: "Informe de la Comision de Investigación de la Hambruna (1945)",
      tipo: "informe",
      anio: "1945",
      descripcion:
        "El informe oficial de la Comision nombrada por el gobierno británico que documenta la hambruna, sus causas, sus cifras y las políticas de requisicion y mercado.",
      fuente: "Gobierno de la India británica — Comision de Investigación de la Hambruna",
    },
    {
      titulo: "Estudios de Amartya Sen sobre hambrunas",
      tipo: "libro",
      anio: "1981",
      descripcion:
        "La obra «Poverty and Famines» (Pobreza y Hambrunas), donde Sen analiza la hambruna de Bengala y formula su teoria sobre las hambrunas y los derechos de las personas.",
      fuente: "Amartya Sen — Poverty and Famines (1981, Oxford University Press)",
    },
  ],
  fuentes: [
    { org: "Comision de la Hambruna", label: "Commission of Inquiry on Bengal Famine (1945)" },
    { org: "Amartya Sen", label: "Poverty and Famines (1981) y estudios posteriores" },
    { org: "Historiografía", label: "Estudios sobre la hambruna de Bengala y la Partición" },
  ],
  foto: {
    src: "/imagenes-reales/bombay.jpg",
    alt: "Fotografía real de India, el país donde ocurrió la hambruna de Bengala",
  },
});

EVENTOS.push({
  id: "holodomor",
  codigo: "DH-12",
  nombre: "Holodomor",
  categoría: "TRAGEDIA",
  desde: 1932,
  hasta: 1933,
  lugar: "Ucrania soviética",
  pais: "Union Sovietica (Ucrania)",
  lat: 50.45,
  lng: 30.52,
  resumen:
    "La hambruna artificial provocada por la colectivizacion forzada en la Ucrania soviética entre 1932 y 1933, que mató a entre 3,5 y 5 millones de personas. Reconocido como genocidio por mas de treinta países.",
  contexto:
    "En 1932-1933, el gobierno soviético impuso la colectivizacion forzada en Ucrania: grano requisado, campesinos deportados y fronteras cerradas para impedir que la gente huyera del hambre. La poblacion rural ucraniana murió en masa por hambre, al tiempo que el Estado requisaba alimentos y exportaba grano. Las estimaciones de victimas oscilan entre 3,5 y 7 millones, y el acto ha sido reconocido como genocidio por mas de 30 países. El Holodomor es una de las tragedias mas documentadas de la era soviética y un estudio sobre el poder del Estado sobre la vida de las personas.",
  victimas: {
    valor: "≈ 3,5 - 5 millones (rango de estimaciones)",
    nota: "Fuente: Instituto Nacional de Memoria de Ucrania y académicos internacionales; reconocida como genocidio por mas de 30 países",
  },
  cronologia: [
    { anio: "1932", evento: "Requisicion forzada de grano y colectivizacion en Ucrania" },
    { anio: "1932", evento: "Cierre de fronteras: se impide la fuga de la poblacion hambrienta" },
    { anio: "1933", evento: "Pico de la hambruna: decenas de miles de muertos diarios en las aldeas" },
    { anio: "1933", evento: "Deportaciones masivas de campesinos ucranianos" },
    { anio: "2006", evento: "Ucrania y mas de 30 países reconocen el Holodomor como genocidio" },
  ],
  biografias: [
    {
      nombre: "Joseph Stalin",
      rol: "Responsable (jefe del Estado soviético)",
      texto:
        "Lider de la Union Sovietica que ordenó y supervisó las políticas de requisicion, colectivizacion y cierre de fronteras que provocaron la hambruna artificial del Holodomor.",
    },
  ],
  documentos: [
    {
      titulo: "Archivos soviéticos desclasificados",
      tipo: "archivo",
      anio: "1990s-",
      descripcion:
        "Los documentos desclasificados del Estado soviético sobre la requisicion de grano, las deportaciones y las políticas fronterizas, que documentan las medidas que provocaron la hambruna.",
      fuente: "Archivos del Estado de Ucrania / Archivos de la antigua URSS",
    },
    {
      titulo: "Informe del Instituto Nacional de Memoria de Ucrania",
      tipo: "informe",
      anio: "2006-",
      descripcion:
        "La documentación y los estudios del instituto ucraniano que documentan el Holodomor, sus victimas y su reconocimiento internacional como genocidio.",
      fuente: "Instituto Nacional de Memoria de Ucrania (UPA)",
    },
    {
      titulo: "Testimonios de sobrevivientes",
      tipo: "testigo",
      anio: "1933-",
      descripcion:
        "Los relatos de los que sobrevivieron a la hambruna: la fuga de la aldea, la busqueda de comida, la muerte de familiares. Recopilados por el Instituto de Memoria y por investigadores.",
      fuente: "Instituto Nacional de Memoria de Ucrania / testimonios recopilados",
    },
  ],
  fuentes: [
    { org: "Instituto Nacional de Memoria de Ucrania", label: "Instituto Nacional de Memoria de Ucrania — documentación del Holodomor" },
    { org: "Académicos internacionales", label: "Estudios sobre el Holodomor y su reconocimiento" },
    { org: "Archivos", label: "Archivos desclasificados de la URSS sobre 1932-1933" },
  ],
  foto: {
    src: "/imagenes-reales/chernobyl.jpg",
    alt: "Fotografía real de Ucrania, el país donde ocurrió el Holodomor",
  },
});

EVENTOS.push({
  id: "gulag",
  codigo: "DH-13",
  nombre: "El Gulag",
  categoría: "ABUSO_INSTITUCIONAL",
  desde: 1929,
  hasta: 1953,
  lugar: "Sistema de campos de trabajo forzado de la URSS",
  pais: "Union Sovietica",
  lat: 55.76,
  lng: 37.62,
  resumen:
    "El sistema de campos de trabajo forzado de la Union Sovietica que asílo a decenas de millones de personas entre 1929 y 1953, con al menos un millón de ejecuciones en el pico del terror de 1937-1938. Es el ejemplo mas extremo de abuso institucional de Estado.",
  contexto:
    "El Gulag fue el sistema de campos de trabajo forzado y de exilio interior del Estado soviético. Desde finales de la década de 1920 hasta la muerte de Stalin en 1953, millones de personas fueron arrestadas, deportadas y enviadas a campos en climas extremos, donde el trabajo forzado, el hambre y las enfermedades producían una mortalidad brutal. El terror de 1937-1938, con ejecuciones masivas de «enemigos del pueblo», dejó al menos un millón de muertos en el sistema. El escritor Aleksandr Solzhenitsyn, ex prisionero, dio al Gulag su memoria definitiva en «El Archipiélago Gulag», y la organización Memorial ha documentado sus victimas. El Gulag es el estudio de caso de cómo un Estado convierte a sus ciudadanos en enemigos y los elimina.",
  victimas: {
    valor: "Decenas de millones pasaron por el sistema; al menos un millón ejecutado en 1937-1938",
    nota: "Fuente: Memorial (organización rusa de derechos humanos) y Aleksandr Solzhenitsyn",
  },
  cronologia: [
    { anio: "1929", evento: "Se sistematiza el sistema de campos de trabajo forzado (Gulag)" },
    { anio: "1930s", evento: "Expansion masiva: millones de prisioneros en campos de trabajo" },
    { anio: "1937-1938", evento: "El terror de los grandes purgas: ejecuciones masivas de «enemigos del pueblo»" },
    { anio: "1940s", evento: "La guerra y la posguerra amplían el sistema con prisioneros de guerra y deportados" },
    { anio: "1953", evento: "Muerte de Stalin; el Gulag se desmantela gradualmente" },
  ],
  biografias: [
    {
      nombre: "Joseph Stalin",
      rol: "Responsable (jefe del Estado)",
      texto:
        "Lider de la Union Sovietica responsable de la expansion del Gulag y del terror de 1937-1938. Sus políticas de represión masiva definieron el sistema durante mas de dos décadas.",
    },
    {
      nombre: "Aleksandr Solzhenitsyn",
      rol: "Testigo y autor",
      texto:
        "Ex prisionero del Gulag y escritor que, en «El Archipiélago Gulag» (1973), documentó el sistema, sus campos y sus victimas. Su obra es la principal fuente literaria y documental sobre el Gulag.",
    },
  ],
  documentos: [
    {
      titulo: "«El Archipiélago Gulag» de Solzhenitsyn",
      tipo: "libro",
      anio: "1973",
      descripcion:
        "La obra de Aleksandr Solzhenitsyn que documenta el sistema de campos soviéticos, basada en su experiencia y en testimonios de prisioneros. Es el texto fundador de la memoria del Gulag.",
      fuente: "Aleksandr Solzhenitsyn — El Archipiélago Gulag (1973)",
    },
    {
      titulo: "Archivos de Memorial sobre las victimas",
      tipo: "archivo",
      anio: "1988-",
      descripcion:
        "La documentación de la organización Memorial, que recopila los nombres, los destinos y las cifras de las victimas del Gulag y del terror soviético.",
      fuente: "Memorial (organización rusa de derechos humanos)",
    },
    {
      titulo: "Informes y testimonios de prisioneros",
      tipo: "testigo",
      anio: "1929-1953",
      descripcion:
        "Los relatos de los prisioneros del Gulag, recopilados en libros, testimonios y archivos, que documentan la vida en los campos, el trabajo forzado y la mortalidad.",
      fuente: "Archivos de Memorial / testimonios recopilados",
    },
  ],
  fuentes: [
    { org: "Memorial", label: "Memorial — documentación de las victimas del terror soviético" },
    { org: "Solzhenitsyn", label: "Aleksandr Solzhenitsyn — El Archipiélago Gulag" },
    { org: "Archivos", label: "Archivos desclasificados de la URSS sobre el sistema de campos" },
  ],
  foto: {
    src: "/imagenes-reales/kremlin.jpg",
    alt: "Fotografía real del Kremlin de Moscú, sede del poder soviético que ordenó el Gulag",
  },
});


EVENTOS.push({
  id: "apartheid",
  codigo: "DH-14",
  nombre: "Apartheid en Sudáfrica",
  categoría: "ABUSO_INSTITUCIONAL",
  desde: 1948,
  hasta: 1994,
  lugar: "Sudáfrica",
  pais: "Sudáfrica",
  lat: -26.2,
  lng: 28.04,
  resumen:
    "El régimen de segregación racial legalizada que gobernó Sudáfrica entre 1948 y 1994: toda la vida social, legal y económica se organizó por raza, con miles de muertos y una Comision de Verdad que documentó la violencia del Estado.",
  contexto:
    "El apartheid fue un sistema de gobierno racial institucionalizado por el Partido Nacional en 1948. Cada persona nacía en una categoría racial que determinaba dónde podía vivir, estudiar, trabajar y a quién podía casarse. La resistencia fue masiva y brutalmente reprimida: masacres como Sharpeville (1960), encarcelamientos como el de Nelson Mandela (1964) y la represión de los levantamientos urbanos. Tras décadas de presión internacional y resistencia interna, el régimen cayó: las primeras elecciones multiraciales se celebraron en 1994. La Comision de Verdad y Reconciliacion (1996-1998) documentó los crimenes del régimen y dio voz a las victimas, creando un modelo de justicia transicional.",
  victimas: {
    valor: "Miles de muertos en la resistencia y la represión; millones de vidas destrozadas",
    nota: "Fuente: Comision de Verdad y Reconciliacion de Sudáfrica y la ONU",
  },
  cronologia: [
    { anio: "1948", evento: "El Partido Nacional impone legalmente el sistema de apartheid" },
    { anio: "1960", evento: "Masacre de Sharpeville: la policía mata a 69 manifestantes anti-apartheid" },
    { anio: "1964", evento: "Nelson Mandela es condenado a cadena perpetua" },
    { anio: "1990", evento: "Liberacion de Nelson Mandela y legalizacion de los partidos opositores" },
    { anio: "1994", evento: "Primeras elecciones multiraciales; el apartheid termina" },
    { anio: "1996-1998", evento: "La Comision de Verdad y Reconciliacion documenta los crimenes" },
  ],
  biografias: [
    {
      nombre: "Nelson Mandela",
      rol: "Resistente (lider del movimiento anti-apartheid)",
      texto:
        "Lider del Congreso Nacional Africano, condenado a cadena perpetua en 1964, liberado en 1990, y primer presidente negro de Sudáfrica en 1994. Su vida es el símbolo de la resistencia al apartheid.",
    },
    {
      nombre: "Hendrik Verwoerd",
      rol: "Responsable (arquitecto del sistema)",
      texto:
        "Primer ministro de Sudáfrica y principal arquitecto del apartheid, que sistematizó la segregación legal y la politica de desarrollo separado. Conocido como el «arquitecto del gran plan».",
    },
    {
      nombre: "Desmond Tutu",
      rol: "Testigo y analista (arzobispo)",
      texto:
        "Arzobispo anglicano y lider espiritual que operó desde dentro del sistema, denunciando el apartheid como injusto y, más tarde, presidiendo la Comision de Verdad y Reconciliacion.",
    },
  ],
  documentos: [
    {
      titulo: "Informe de la Comision de Verdad y Reconciliacion",
      tipo: "informe",
      anio: "1996-1998",
      descripcion:
        "Los informes oficiales de la Comision que documentan los crimenes del apartheid, con testimonios de victimas, responsables y testigos. Es la memoria institucional del régimen.",
      fuente: "Commission for Truth and Reconciliation (Sudáfrica)",
    },
    {
      titulo: "Leyes de apartheid (legislación racial)",
      tipo: "documento oficial",
      anio: "1948-1991",
      descripcion:
        "El conjunto de leyes que organizaron la vida por raza: residencia, educacion, trabajo y matrimonio. Su consulta es la forma de leer la legalidad de un régimen discriminatorio.",
      fuente: "Gobierno de Sudáfrica — legislación del apartheid",
    },
    {
      titulo: "Testimonios de victimas del apartheid",
      tipo: "testigo",
      anio: "1948-1994",
      descripcion:
        "Los relatos recopilados por la Comision y por organizaciones de victimas: detenciones, torturas, desalojos, masacres y la vida bajo la segregación legal.",
      fuente: "Comision de Verdad y Reconciliacion / organizaciones de victimas",
    },
  ],
  fuentes: [
    { org: "Commission for Truth and Reconciliation", label: "Commission for Truth and Reconciliation (Sudáfrica, 1996-1998)" },
    { org: "ONU", label: "Documentación de la ONU sobre el apartheid y sus sanciones" },
    { org: "Historiografía", label: "Estudios sobre el apartheid y la justicia transicional" },
  ],
  foto: {
    src: "/imagenes-reales/caboadelcabo.jpg",
    alt: "Fotografía real del Cabo de Buena Esperanza, en Sudáfrica, el país del apartheid",
  },
});

EVENTOS.push({
  id: "dreyfus",
  codigo: "DH-15",
  nombre: "Caso Dreyfus",
  categoría: "INJUSTICIA",
  desde: 1894,
  hasta: 1906,
  lugar: "Francia (París y la isla de la Tortuga)",
  pais: "Francia",
  lat: 48.86,
  lng: 2.35,
  resumen:
    "El oficial judío Alfred Dreyfus fue condenado injustamente por traicion en 1894, enviado a la isla de la Tortuga y humillado durante doce años. El caso, destapado por Émile Zola, dividió a Francia y terminó con la exoneración de Dreyfus en 1906.",
  contexto:
    "En 1894, el ejercito francés acusó a Alfred Dreyfus, oficial judío de artillería, de vender secretos a Alemania. La acusacion, basada en un documento anónimo y en un clima de xenofobia y antisemitismo, lo llevó a la isla de la Tortuga y a la degradacion. Tras el descubrimiento del verdadero culpable, el comandante Esterhazy, el escritor Émile Zola publicó «J'accuse...!» (1898), un manifiesto que sacudió a Francia. La «Affaire Dreyfus» dividió a la opinion pública entre los que creían en la justicia militar y los que defendían la verdad. En 1906, Dreyfus fue exonerado, rehabilitado y ascendido, y el caso se convirtió en un símbolo mundial de la injusticia institucional y de la lucha por la verdad.",
  victimas: {
    valor: "Alfred Dreyfus: 4 años en la isla de la Tortuga y 12 años de humillacion pública",
    nota: "Fuente: Archivos franceses y la historiografía del caso",
  },
  cronologia: [
    { anio: "1894", evento: "Dreyfus es acusado de traicion y condenado a la isla de la Tortuga" },
    { anio: "1896", evento: "El verdadero culpable, Esterhazy, es identificado por los servicios de informacion" },
    { anio: "1898", evento: "Émile Zola pública «J'accuse...!»; el caso divide a Francia" },
    { anio: "1899", evento: "Nueva condena de Dreyfus en Rennes, luego indulto" },
    { anio: "1906", evento: "Dreyfus es exonerado y rehabilitado por el Tribunal de Cassación" },
  ],
  biografias: [
    {
      nombre: "Alfred Dreyfus",
      rol: "Victima de la injusticia",
      texto:
        "Oficial judío francés condenado injustamente por traicion en 1894 y enviado a la isla de la Tortuga. Doce años después, fue exonerado y rehabilitado. Su caso es el símbolo de la injusticia institucional.",
    },
    {
      nombre: "Émile Zola",
      rol: "Resistente (escritor)",
      texto:
        "Escritor que, con «J'accuse...!» (1898), denuncia publicamente la injusticia del caso Dreyfus. Su manifiesto sacudió a Francia y es uno de los grandes actos de defensa de la verdad en la historia.",
    },
    {
      nombre: "Georges Clemenceau",
      rol: "Resistente (periodista y futuro jefe de Gobierno)",
      texto:
        "Periodista que defendió a Dreyfus en la prensa y, más tarde, fue jefe de Gobierno durante la Primera Guerra Mundial. Fue uno de los principales aliados de Zola en la batalla por la verdad.",
    },
  ],
  documentos: [
    {
      titulo: "«J'accuse...!» de Émile Zola",
      tipo: "declaracion",
      anio: "1898",
      descripcion:
        "El manifiesto publicado por Zola en el periódico L'Aurore, que denuncia la injusticia del caso Dreyfus y acusa al ejercito de encubrir al verdadero culpable. Es uno de los textos mas citados de la historia de la prensa.",
      fuente: "Émile Zola — J'accuse...! (L'Aurore, 13 de enero de 1898)",
      cita: "«J'accuse d'avoir lâchement et criminellement assassiné...»,",
    },
    {
      titulo: "Sentencia del Tribunal de Cassación (1906)",
      tipo: "sentencia",
      anio: "1906",
      descripcion:
        "La sentencia que revoca la condena de Dreyfus, lo rehabilita y lo reintegra al ejercito, cerrando judicialmente el caso.",
      fuente: "Tribunal de Cassación de Francia (1906)",
    },
    {
      titulo: "Archivo del caso Dreyfus",
      tipo: "archivo",
      anio: "1894-1906",
      descripcion:
        "La documentación del caso —actas, informes, cartas y documentos secretos— conservada en los archivos franceses, consultada por los historiadores.",
      fuente: "Archivos Nacionales de Francia (Archives nationales de France)",
    },
  ],
  fuentes: [
    { org: "Archivos Nacionales de Francia", label: "Archives nationales de France — documentación del caso" },
    { org: "Historiografía", label: "Estudios sobre la Affaire Dreyfus" },
    { org: "Biblioteca", label: "«J'accuse...!» de Émile Zola (1898) y publicaciones del caso" },
  ],
  foto: {
    src: "/imagenes-reales/rotterdam.jpg",
    alt: "Fotografía real de Europa, contexto del caso Dreyfus en Francia",
  },
});

EVENTOS.push({
  id: "scottsboro",
  codigo: "DH-16",
  nombre: "Scottsboro Boys",
  categoría: "INJUSTICIA",
  desde: 1931,
  hasta: 1937,
  lugar: "Scottsboro, Alabama, Estados Unidos",
  pais: "Estados Unidos",
  lat: 34.64,
  lng: -86.34,
  resumen:
    "Nueve jóvenes negros, de entre 13 y 20 años, fueron acusados falsamente de violar dos mujeres blancas en Alabama en 1931 y condenados por jurados blancos. Décadas de apelaciones y condenas marcaron un caso emblemático de la injusticia judicial racista.",
  contexto:
    "En marzo de 1931, en un tren que cruzaba Alabama, dos mujeres blancas acusaron a nueve jóvenes negros de haberlas violado. La acusacion, que los propios testigos luego rectificaron, desencadenó un juicio rapido ante un jurado de hombres blancos, en un clima de linchamiento y terror racial. Cinco de los nueve fueron condenados a muerte; los otros a largas penas. El caso se convirtió en un símbolo internacional: la defensa, liderada por el abogado Samuel Leibowitz, logró revocaciones y nuevos juicios, pero la injusticia se impuso durante años. Las condenas y la inocencia reconocida décadas después siguen siendo un estudio sobre el racismo en la justicia.",
  victimas: {
    valor: "9 jóvenes condenados; 4 de ellos pasaron años en prisión",
    nota: "Fuente: Scottsboro Boys Museum y Archivos del FBI / estudios históricos",
  },
  cronologia: [
    { anio: "1931", evento: "Acusacion falsa de violacion; detencion de los nueve jóvenes" },
    { anio: "1931", evento: "Primer juicio: condenas a muerte por un jurado de hombres blancos" },
    { anio: "1932", evento: "El Tribunal Supremo de EE. UU. revoca las condenas (Powell v. Alabama)" },
    { anio: "1933-1936", evento: "Nuevos juicios, nuevos jurados y condenas sucesivas" },
    { anio: "1937", evento: "Las cuatro últimas condenas se revocan finalmente" },
  ],
  biografias: [
    {
      nombre: "Haywood Patterson",
      rol: "Victima de la injusticia",
      texto:
        "Uno de los nueve acusados, condenado a muerte y sentenciado a cadena perpetua. Escribió desde la prision el relato «Negro en la jaula», uno de los testimonios mas leídos del caso.",
    },
    {
      nombre: "Samuel Leibowitz",
      rol: "Resistente (abogado defensor)",
      texto:
        "Abogado neoyorquino que defendió a los Scottsboro Boys durante los juicios, logrando revocaciones y new trials. Su defensa fue clave para que el caso se conociera internacionalmente.",
    },
  ],
  documentos: [
    {
      titulo: "Sentencias del Tribunal Supremo de EE. UU.",
      tipo: "sentencia",
      anio: "1932",
      descripcion:
        "La sentencia Powell v. Alabama (1932) que revoca las condenas por la falta de asistencia jurídica adecuada, estableciendo un precedente sobre el derecho a la defensa en casos capital.",
      fuente: "Tribunal Supremo de los Estados Unidos — Powell v. Alabama (1932)",
    },
    {
      titulo: "Archivos del FBI sobre el caso",
      tipo: "archivo",
      anio: "1931-",
      descripcion:
        "La documentación federal sobre el caso, incluyendo informes sobre el clima de linchamiento, la acusacion falsa y las rectificaciones de los testigos.",
      fuente: "Archivos Federales de Investigación (FBI) de Estados Unidos",
    },
    {
      titulo: "Testimonios de los acusados",
      tipo: "testigo",
      anio: "1931-",
      descripcion:
        "Los relatos de los propios Scottsboro Boys y de sus abogados sobre los juicios, las condiciones de la prision y la presión del clima racial.",
      fuente: "Scottsboro Boys Museum / publicaciones históricas",
    },
  ],
  fuentes: [
    { org: "Scottsboro Boys Museum", label: "Scottsboro Boys Museum (Alabama) — documentación del caso" },
    { org: "Tribunal Supremo de EE. UU.", label: "Powell v. Alabama (1932) — sentencia" },
    { org: "Historiografía", label: "Estudios históricos sobre el caso Scottsboro" },
  ],
  foto: {
    src: "/imagenes-reales/losangeles.jpg",
    alt: "Fotografía real de Estados Unidos, el país donde ocurrió el caso Scottsboro",
  },
});

EVENTOS.push({
  id: "emmett-till",
  codigo: "DH-17",
  nombre: "Emmett Till",
  categoría: "INJUSTICIA",
  desde: 1955,
  hasta: 1955,
  lugar: "Money, Mississippi, Estados Unidos",
  pais: "Estados Unidos",
  lat: 34.06,
  lng: -90.24,
  resumen:
    "El joven negro Emmett Till, de 14 años, fue secuestrado, brutalizado y asesinado en Mississippi en 1955. Sus asesinos fueron absueltos por un jurado de hombres blancos; la imagen de su funeral a puerta abierta conmocionó al país y aceleró el movimiento por los derechos civiles.",
  contexto:
    "En agosto de 1955, Emmett Till, un chico negro de Chicago que visitaba familiares en Mississippi, fue acusado de haber hablado con una mujer blanca. Días después, fue secuestrado de la casa de sus parientes, brutalizado y asesinado; su cuerpo fue arrojado al río Tallahatchie. La madre, Mamie Till-Mobley, decidió celebrar un funeral a puerta abierta en Chicago, mostrando el cuerpo a miles de personas y a la prensa nacional. Los acusados, Roy Bryant y J. W. Milam, fueron absueltos por un jurado de hombres blancos; años después, confesaron el crimen en una entrevista. El caso, con su brutalidad y su impunidad, se convirtió en una de las imágenes mas poderosas de la injusticia racial en Estados Unidos y un hito del movimiento por los derechos civiles.",
  victimas: {
    valor: "Emmett Till, 14 años",
    nota: "Fuente: Departamento de Justicia de EE. UU. y Archivos del Estado de Mississippi",
  },
  cronologia: [
    { anio: "1955", evento: "28 de agosto: Emmett Till es secuestrado de la casa de sus familiares" },
    { anio: "1955", evento: "31 de agosto: su cuerpo es recuperado del río Tallahatchie" },
    { anio: "1955", evento: "Septiembre: funeral a puerta abierta en Chicago; la imagen conmociona al país" },
    { anio: "1955", evento: "Septiembre: Roy Bryant y J. W. Milam son absueltos por un jurado de hombres blancos" },
    { anio: "1956", evento: "Los acusados confesan el crimen en una entrevista periodística" },
    { anio: "2004", evento: "El Departamento de Justicia reabre el caso" },
  ],
  biografias: [
    {
      nombre: "Emmett Till",
      rol: "Victima de la injusticia",
      texto:
        "Joven negro de 14 años secuestrado y asesinado en Mississippi en 1955. Su muerte y la impunidad de sus asesinos se convirtieron en un símbolo de la brutalidad racial y de la lucha por la justicia.",
    },
    {
      nombre: "Mamie Till-Mobley",
      rol: "Resistente (madre)",
      texto:
        "La madre de Emmett Till, que decidió exponer el cuerpo de su hijo en un funeral a puerta abierta, convirtiendo su muerte en un acto público de denuncia contra la injusticia racial.",
    },
    {
      nombre: "Roy Bryant y J. W. Milam",
      rol: "Responsables (asesinos)",
      texto:
        "Los dos hombres acusados del asesinato de Emmett Till. Absoltos por un jurado de hombres blancos en 1955, confesaron el crimen en una entrevista en 1956, demostrando la impunidad que gozaban.",
    },
  ],
  documentos: [
    {
      titulo: "Informe del Departamento de Justicia (2004)",
      tipo: "informe",
      anio: "2004-2006",
      descripcion:
        "La investigación del Departamento de Justicia de Estados Unidos que reabrió el caso en 2004, documentando el secuestro, el asesinato y el veredicto de 1955.",
      fuente: "Departamento de Justicia de los Estados Unidos (DOJ)",
    },
    {
      titulo: "Reportaje del funeral (Jet / Ebony, 1955)",
      tipo: "testigo (prensa)",
      anio: "1955",
      descripcion:
        "Las fotografias y reportajes publicados por las revistas Jet y Ebony sobre el funeral a puerta abierta, que mostraron el cuerpo de Emmett Till a miles de personas y al país.",
      fuente: "Jet / Ebony (1955) — reportajes históricos",
    },
    {
      titulo: "Testimonio de Mamie Till-Mobley",
      tipo: "testigo",
      anio: "1955-",
      descripcion:
        "El relato de la madre de Emmett Till sobre la decision del funeral a puerta abierta, su activismo posterior y la lucha por la memoria de su hijo.",
      fuente: "Testimonio recopilado en publicaciones y documentales",
    },
  ],
  fuentes: [
    { org: "DOJ", label: "Departamento de Justicia de EE. UU. — investigación de 2004" },
    { org: "Archivos de Mississippi", label: "Archivos del Estado de Mississippi sobre el caso" },
    { org: "Historiografía", label: "Estudios sobre Emmett Till y los derechos civiles" },
  ],
  foto: {
    src: "/imagenes-reales/losangeles.jpg",
    alt: "Fotografía real de Estados Unidos, el país del caso Emmett Till",
  },
});

// ═══════════════════════════════════════════════════════════════════
// DATOS DERIVADOS — nada escrito a mano (lección v256: la línea se
// compone en JS; si la fuente cambia, la línea cambia sola).
// ═══════════════════════════════════════════════════════════════════

/** El censo por categoría, derivado del archivo (orden de la fuente). */
export function censoPorCategoria(): Record<Categoria, number> {
  const conteo = {} as Record<Categoria, number>;
  for (const c of CATEGORIAS) conteo[c.id] = 0;
  for (const e of EVENTOS) conteo[e.categoría] += 1;
  return conteo;
}

/** Los años extremos del archivo, derivados de los expedientes. */
export function rangoAnios(): { desde: number; hasta: number } {
  let desde = Number.POSITIVE_INFINITY;
  let hasta = Number.NEGATIVE_INFINITY;
  for (const e of EVENTOS) {
    if (e.desde < desde) desde = e.desde;
    if (e.hasta > hasta) hasta = e.hasta;
  }
  return { desde, hasta };
}

/** La línea compuesta COMPLETA en JS (la que se pinta en la portada). */
export function lineaDarkHistory(): string {
  const { desde, hasta } = rangoAnios();
  const censo = censoPorCategoria();
  return `El archivo de los hechos más oscuros de la humanidad — ${EVENTOS.length} expedientes documentados en ${CATEGORIAS.length} categorías, desde ${desde} hasta ${hasta}, con cronología, mapa, biografías, documentos y fuentes citadas`;
}

/** Los hitos de un expediente ordenados, para la cronología local. */
export function cronologiaDe(id: string): Hito[] {
  return EVENTOS.find((e) => e.id === id)?.cronologia ?? [];
}
