// ============================================================
// v128.0 LA RED MUNDIAL — LOS 18 SERVICIOS EXTRANJEROS
// La sala hermana de LA COMUNIDAD (v127): si allí viven los 18
// ojos de los Estados Unidos, aquí viven los 18 servicios del
// resto del planeta, expediente a expediente, nación por nación.
//
// Doctrina de la Casa: espacio negativo, placa numerada, narrativa
// (Ley 5) — cada expediente cuenta su origen, su oficio y su
// territorio. Conocimiento abierto, presentado como joya.
// ============================================================

export type CategoriaRed =
  | "cincoOjos"     // LA ALIANZA — UKUSA 1946
  | "bloque"        // EL BLOQUE — Moscú y Pekín
  | "levante"       // EL LEVANTE — Israel
  | "continental"   // LA CONTINENTAL — París, Berlín, Madrid
  | "subcontinente"; // EL SUBCONTINENTE — India y Pakistán

export interface ServicioExtranjero {
  id: string;
  num: number;              // Nº de expediente (01–18)
  sigla: string;
  nombre: string;           // nombre oficial completo
  nombreEs: string;
  pais: string;
  bandera: string;          // emoji de la nación
  categoria: CategoriaRed;
  fundacion: number;        // año del nacimiento formal
  linaje: string;           // de quién desciende (cuando el año miente)
  sede: string;
  lat: number;
  lng: number;
  // desplazamiento del pin en píxeles del mapa (1000×500) para
  // separar los trios de la misma ciudad — null si respira solo
  guiado: { dx: number; dy: number } | null;
  personal: string;
  especialidad: string;
  dominio: string[];
  lema: string;             // lema oficial o, a falta de él, su leyenda honesta
  mision: string;
  fichas: string[];
}

export const CATEGORIA_RED_META: Record<CategoriaRed, { etiqueta: string; color: string }> = {
  cincoOjos:     { etiqueta: "LA ALIANZA",    color: "#D4AF37" },
  bloque:        { etiqueta: "EL BLOQUE",     color: "#E05555" },
  levante:       { etiqueta: "EL LEVANTE",    color: "#7FE3FF" },
  continental:   { etiqueta: "LA CONTINENTAL", color: "#C9A0DC" },
  subcontinente: { etiqueta: "EL SUBCONTINENTE", color: "#3DDC97" },
};

// ─────────── LA ALIANZA — los Cinco Ojos (6 expedientes) ───────────
export const SERVICIOS: ServicioExtranjero[] = [
  {
    id: "mi6", num: 1, sigla: "MI6",
    nombre: "Secret Intelligence Service (SIS)",
    nombreEs: "Servicio de Inteligencia Secreta del Reino Unido",
    pais: "Reino Unido", bandera: "🇬🇧",
    categoria: "cincoOjos",
    fundacion: 1909, linaje: "Secret Service Bureau — la cuna común de los dos MI",
    sede: "Vauxhall Cross, Londres",
    lat: 51.4873, lng: -0.1242, guiado: { dx: -13, dy: 5 },
    personal: "≈ 2.800 oficiales (clasificado)", especialidad: "El exterior del mapa británico",
    dominio: ["HUMINT", "ACCIONES ENCUBIERTAS"],
    lema: "«Semper Occultus» — siempre oculto",
    mision:
      "El servicio de inteligencia exterior del Reino Unido y el abuelo de todos los servicios modernos: " +
      "de sus archivadores salió el espionaje con que el mundo lo imagina. Recolecta inteligencia humana " +
      "allá donde el Imperio ya no gobierna pero aún escucha, ejecuta acciones encubiertas bajo firma real " +
      "y alimenta a la alianza de los Cinco Ojos. Su jefe firma con una sola letra — C — y su edificio de " +
      "cristal y piedra sobre el Támesis es el templo más fotografiado del espionaje.",
    fichas: [
      "Nació en 1909 como Secret Service Bureau para vigilar la marina del Káiser; en 1909 la casa se partió en dos ramas: exterior (MI6) e interior (MI5)",
      "Su primer jefe, el capitán Mansfield Cumming, firmaba «C» con tinta verde — cada director lo sigue haciendo un siglo después",
      "Su edificio de Vauxhall Cross (1994) protagonizó la explosión de las películas de Bond: la Casa aprobó el rodaje con una condición — nada de interiores reales",
      "La UKUSA de 1946 la ata a la NSA estadounidense: comparten código, satélites y desde entonces casi ninguna escucha grande se hace en solitario",
    ],
  },
  {
    id: "mi5", num: 2, sigla: "MI5",
    nombre: "Security Service",
    nombreEs: "Servicio de Seguridad del Reino Unido",
    pais: "Reino Unido", bandera: "🇬🇧",
    categoria: "cincoOjos",
    fundacion: 1909, linaje: "Secret Service Bureau — la rama interior de la misma cuna",
    sede: "Thames House, Londres",
    lat: 51.4890, lng: -0.1185, guiado: { dx: -4, dy: -14 },
    personal: "≈ 4.400 oficiales", especialidad: "El enemigo dentro de casa",
    dominio: ["CONTRAINTELIGENCIA", "SEGURIDAD INTERIOR"],
    lema: "«Trabajamos en secreto para proteger al Reino Unido de las amenazas a su seguridad nacional»",
    mision:
      "El escudo interno británico: caza espías rusos en Londres, desactiva células terroristas antes de que " +
      "lleguen a la portada y vigila a los extremismos de todos los bandos. Es la otra mitad de la cuna de " +
      "1909 — donde el MI6 mira hacia fuera, el MI5 mira hacia dentro — y su archivo de contrainteligencia " +
      "es probablemente el más largo del mundo occidental: más de un siglo de fichas sobre cualquier persona " +
      "que haya mirado demasiado a la derecha o demasiado a la izquierda.",
    fichas: [
      "Misma cuna que el MI6: el Secret Service Bureau de 1909 se partió al año siguiente en la rama que espía fuera y la que caza dentro",
      "Su sede, Thames House, guarda el «Centro de Amenazas» donde se enciende el nivel de alerta del país — y una puerta de acero que nunca se ha fotografiado abierta",
      "El naturalista Maxwell Knight, jefe de su sección B5(b), es la inspiración más citada del «M» de Ian Fleming",
      "Durante la Guerra Fría cazó al «Círculo de Cambridge» a posteriori: los cinco traidores que dirigieron su propio espionaje durante décadas",
    ],
  },
  {
    id: "gchq", num: 3, sigla: "GCHQ",
    nombre: "Government Communications Headquarters",
    nombreEs: "Cuartel General de Comunicaciones del Gobierno",
    pais: "Reino Unido", bandera: "🇬🇧",
    categoria: "cincoOjos",
    fundacion: 1919, linaje: "Government Code and Cypher School — Bletchley Park y Enigma",
    sede: "«El Donut», Cheltenham",
    lat: 51.8994, lng: -2.0784, guiado: null,
    personal: "≈ 6.500 oficiales", especialidad: "Las señales del Imperio",
    dominio: ["SIGINT", "CIBERSEGURIDAD"],
    lema: "«Proteger la seguridad de la nación con inteligencia de señales y ciberseguridad»",
    mision:
      "La NSA británica y heredera directa de Bletchley Park: el lugar donde Alan Turing descifró Enigma y " +
      "donde nació, de paso, la informática moderna. Hoy escucha lo que viaja por cables, ondas y fibras " +
      "de medio planeta, protege las comunicaciones del gobierno y comparte con la NSA una alianza tan " +
      "estrecha que ambas casas se reparten el mundo en zonas de escucha desde 1946. Su edificio — un " +
      "donut de cristal y aluminio — es el anillo más grande de Gran Bretaña.",
    fichas: [
      "Desciende de la Government Code and Cypher School que descifró Enigma: Turing y su máquina nacieron entre sus descifres",
      "La UKUSA de 1946 la empareja con la NSA: Londres escucha una mitad del planeta, Fort Meade la otra, y se pasan las notas",
      "«El Donut» de Cheltenham (2003): 5.600 personas trabajando detrás de un anillo de cristal de 170 metros de diámetro",
      "Su instrumento más famoso no es una máquina sino una regla: el «two-man rule» — ningún descifre grande se ejecuta sin dos firmas",
    ],
  },
  {
    id: "asis", num: 4, sigla: "ASIS",
    nombre: "Australian Secret Intelligence Service",
    nombreEs: "Servicio Australiano de Inteligencia Secreta",
    pais: "Australia", bandera: "🇦🇺",
    categoria: "cincoOjos",
    fundacion: 1952, linaje: "nacida del giro del Imperio hacia el Pacífico",
    sede: "Canberra",
    lat: -35.2820, lng: 149.1286, guiado: null,
    personal: "clasificado (cientos de oficiales)", especialidad: "Los ojos del sur",
    dominio: ["HUMINT", "ACCIONES ENCUBIERTAS"],
    lema: "Sin lema público — su leyenda es «los ojos del sur de la alianza»",
    mision:
      "El ojo exterior australiano: recolecta inteligencia humana en el Pacífico, el Sudeste Asiático y las " +
      "islas que ninguna otra potencia mira con atención. Fue secreta incluso para los australianos durante " +
      "veinte años — su existencia se reconoció en 1972 y recién en 2001 obtuvo ley propia. Es el socio " +
      "silencioso de los Cinco Ojos en el hemisferio donde el Imperio dejó de mirar y ella sigue mirando.",
    fichas: [
      "Creada en 1952 por el primer ministro Menzies con una carta y un presupuesto sin nombre — ni el Parlamento sabía de ella",
      "Su existencia se filtró en 1972 con una manifestación frente a su sede: los estudiantes colgaron un cartel que decía «aquí vive el espionaje australiano»",
      "Su primer entrenamiento de agentes se hizo en el barco-container de un lago: la academia de secretos más australiana posible",
      "Desde 2001 opera bajo ley del Parlamento: antes trabajaba bajo una Orden Ejecutiva que nadie había leído",
    ],
  },
  {
    id: "csis", num: 5, sigla: "CSIS",
    nombre: "Canadian Security Intelligence Service",
    nombreEs: "Servicio Canadiense de Inteligencia de Seguridad",
    pais: "Canadá", bandera: "🇨🇦",
    categoria: "cincoOjos",
    fundacion: 1984, linaje: "Policía Montada Real — la Gendarmería que espiaba sin ley",
    sede: "Ottawa",
    lat: 45.4210, lng: -75.6900, guiado: null,
    personal: "≈ 3.500 oficiales", especialidad: "El escudo del norte",
    dominio: ["CONTRAINTELIGENCIA", "SEGURIDAD INTERIOR"],
    lema: "«Vigilans» — vigilando",
    mision:
      "El escudo interno de Canadá y el socio más limpio de la alianza: nació en 1984 después de que una " +
      "comisión real descubriera que la Policía Montada quemaba archivos, robaba papeles y espiaba sin ley. " +
      "Canadá respondió fundando un servicio civil con carta de derechos incorporada — el primer servicio de " +
      "inteligencia del mundo nacido con una constitución escrita sobre la mesa. Vigila espías, terrorismos e " +
      "interferencias extranjeras en el país más extenso de la alianza.",
    fichas: [
      "Nació de un escándalo: la Comisión McDonald (1981) desenmascaró las fechorías de la RCMP y el país la reemplazó por un servicio civil de ley",
      "Su lema «Vigilans» está grabado en su escudo: una sola palabra latina que lo resume todo",
      "Canadá es la puerta norte de los Cinco Ojos: su territorio da a Rusia por el Ártico — y sus antenas lo saben",
      "Su centro de análisis a veces informa directamente al Primer Ministro: el «Informe de Amenazas» semanal",
    ],
  },
  {
    id: "gcsb", num: 6, sigla: "GCSB",
    nombre: "Government Communications Security Bureau",
    nombreEs: "Oficina de Seguridad de las Comunicaciones del Gobierno",
    pais: "Nueva Zelanda", bandera: "🇳🇿",
    categoria: "cincoOjos",
    fundacion: 1977, linaje: "Joint Bureau — la estación de escucha del Pacífico británico",
    sede: "Wellington",
    lat: -41.2770, lng: 174.7770, guiado: null,
    personal: "≈ 450 oficiales (el ojo más pequeño)", especialidad: "El ojo más pequeño de la alianza",
    dominio: ["SIGINT", "CIBERSEGURIDAD"],
    lema: "Sin lema público — su tamaño es su anonimato",
    mision:
      "El sexto expediente de la alianza y el más pequeño: dos estaciones de escucha bajo cúpulas blancas en " +
      "colinas de ovejas — Waihopai y Tangimoana — capturan las señales del Pacífico Sur y las entregan a la " +
      "red de los Cinco Ojos. Nueva Zelanda aportó a la alianza algo que ningún otro socio tenía: un " +
      "hemisferio entero de satélites en fase descendente que nadie más escuchaba.",
    fichas: [
      "Sus estaciones de escucha son dos cúpulas blancas gigantes en medio de viñedos y ovejas: la vista más surrealista del espionaje mundial",
      "Es el socio junior de UKUSA desde 1956 — su firma entró por la puerta de atrás del tratado original",
      "En 2013 se supo que espió ilegalmente a 88 ciudadanos neozelandeses: el escándalo la obligó a reescribir su ley en público",
      "Su personal cabe en un piso de edificios que la NSA usa solo para el aparcamiento — y aun así, su cuota del planeta es única",
    ],
  },
  // ─────────── EL BLOQUE — Moscú y Pekín (4 expedientes) ───────────
  {
    id: "svr", num: 7, sigla: "SVR",
    nombre: "Sluzhba Vneshney Razvedki — Foreign Intelligence Service",
    nombreEs: "Servicio de Inteligencia Exterior de Rusia",
    pais: "Rusia", bandera: "🇷🇺",
    categoria: "bloque",
    fundacion: 1991, linaje: "PGU del KGB (1954) → Cheka (1920) — el linaje más largo del espionaje",
    sede: "Yasenevo, Moscú",
    lat: 55.5960, lng: 37.5170, guiado: { dx: -15, dy: 2 },
    personal: "≈ 13.000 oficiales", especialidad: "El exterior de la Madre Rusia",
    dominio: ["HUMINT", "DESINFORMACIÓN"],
    lema: "«Palabra de honor, valentía, devoción a la Patria»",
    mision:
      "El ojo exterior de Rusia y heredero directo de la Primera Dirección del KGB: espionaje humano " +
      "clásico, ilegales sin contrato bajo identidades prestadas, y una maquinaria de desinformación que " +
      "trabaja desde antes de que existiera la palabra «troll». Vive en Yasenevo, un bosque al sur de " +
      "Moscú con torres de cristal verde que los moscovitas llaman «el bosque de los espías». Su tradición " +
      "de infiltración es la más respetada del oficio — y la más temida.",
    fichas: [
      "Hereda la Primera Dirección del KGB y, antes, la Cheka de Dzerzhinski: un siglo de continuidad sin cambiar de archivo",
      "Su arma maestra son los «ilegales»: agentes sin embajada, sin inmunidad y sin derecho a error — los ilustres de la leyenda rusa",
      "Yasenevo, su cuartel al sur de Moscú, aparece en las películas rusas como Langley aparece en las americanas",
      "La acusación más citada contra ella: la red de «ilegales» desmantelada en 2010 — el intercambio de espías más grande desde la Guerra Fría",
    ],
  },
  {
    id: "fsb", num: 8, sigla: "FSB",
    nombre: "Federal'naya Sluzhba Bezopasnosti — Federal Security Service",
    nombreEs: "Servicio Federal de Seguridad de Rusia",
    pais: "Rusia", bandera: "🇷🇺",
    categoria: "bloque",
    fundacion: 1995, linaje: "KGB (1954) → Cheka (1917) — el escudo que nunca se fundió",
    sede: "Lubyanka, Moscú",
    lat: 55.7570, lng: 37.6246, guiado: { dx: 0, dy: -16 },
    personal: "≈ 200.000 (el servicio más grande de Europa)", especialidad: "El escudo interno del oso",
    dominio: ["CONTRAINTELIGENCIA", "SEGURIDAD INTERIOR", "CIBER"],
    lema: "«La espada y el escudo» — la herencia que el KGB dejó escrita en su ADN",
    mision:
      "El escudo interno de Rusia y el sucesor directo del KGB en casa: contrainteligencia, antiterrorismo, " +
      "ciberseguridad y vigilancia de fronteras en el país más extenso del planeta. Su edificio — la " +
      "Lubyanka, la gran plaza roja del espionaje soviético — sigue siendo el símbolo del oficio en el " +
      "mundo entero. Con plantilla de 200.000 y jurisdicción sobre casi todo, es más un ministerio del " +
      "espionaje que una agencia: el Estado dentro del Estado ruso.",
    fichas: [
      "Ocupa la Lubyanka desde 1919: el mismo edificio que dirigió el KGB, la Cheka y el NKVD — el suelo cambia de nombre, la silla nunca",
      "Su plantilla estimada de 200.000 la convierte en el servicio de seguridad más grande de Europa: tres veces el FBI",
      "La Cheka se fundó en 1917 y cambió de siglas once veces — el FSB es la duodécima piel del mismo escudo",
      "Su Academia forma a los criptógrafos que después fundan los antivirus rusos más famosos: el Kaspersky de turno estudió aquí",
    ],
  },
  {
    id: "gru", num: 9, sigla: "GRU",
    nombre: "Glavnoye Razvedyvatel'noye Upravleniye — Main Intelligence Directorate",
    nombreEs: "Dirección Principal de Inteligencia del Estado Mayor ruso",
    pais: "Rusia", bandera: "🇷🇺",
    categoria: "bloque",
    fundacion: 1918, linaje: "Estado Mayor del Ejército Rojo — más vieja que el propio KGB",
    sede: "Khoroshevskoye shosse, Moscú («el Aquarium»)",
    lat: 55.7966, lng: 37.4990, guiado: { dx: 15, dy: 0 },
    personal: "≈ 12.500 oficiales", especialidad: "Los ojos del ejército ruso",
    dominio: ["INTEL. MILITAR", "ACCIONES ENCUBIERTAS"],
    lema: "Sin lema público — los espías del mundo llaman a su cuartel «el Aquarium»",
    mision:
      "La inteligencia militar de Rusia y el servicio más viejo del bloque: nació en 1918 con el Ejército " +
      "Rojo y sobrevivió a purgas, guerras y desfiles de despidos. Sus spetsnaz son leyenda; sus hackers " +
      "de la unidad 26165 son el nombre en cada informe de ciberataque electoral; y su régimen de " +
      "silencio es tan absoluto que durante décadas no se sabía siquiera dónde estaba su cuartel — el " +
      "«Aquarium» de Khoroshevskoye, un recinto que ni los taxistas de Moscú señalan.",
    fichas: [
      "Fundada en 1918 por órdenes de Trotsky: es más vieja que el KGB, que el SVR y que la URSS misma",
      "Sobrevivió a la purga de Stalin del 37: Stalin fusiló a cuatro de sus jefes seguidos y el servicio siguió funcionando",
      "Su unidad 29155 es la que los tribunales europeos citan en los envenenamientos y sabotajes en suelo extranjero",
      "Su cuartel «Aquarium» aparece en los mapas como un cuartel militar común: el anonimato es su lujo",
    ],
  },
  {
    id: "mss", num: 10, sigla: "MSS",
    nombre: "Ministry of State Security (Guó'ānbù) — 国家安全部",
    nombreEs: "Ministerio de Seguridad del Estado de China",
    pais: "China", bandera: "🇨🇳",
    categoria: "bloque",
    fundacion: 1983, linaje: "fusión del aparato de espionaje del Partido con la contrainteligencia estatal",
    sede: "Pekín",
    lat: 39.9042, lng: 116.4074, guiado: null,
    personal: "estimado en cientos de miles (clasificado)", especialidad: "El ojo más opaco del planeta",
    dominio: ["HUMINT", "CIBER", "CONTRAINTELIGENCIA"],
    lema: "Sin lema público — su opacidad es la más completa del mundo",
    mision:
      "El servicio de inteligencia chino y el más opaco de los grandes: ni confirma su plantilla, ni " +
      "publica su organigrama, ni reconoce operaciones. Su oficio es doble: espionaje exterior (HUMINT " +
      "masivo a través de frentes civiles — universidades, empresas, asociaciones) y control de seguridad " +
      "interior. Trabaja en simbiosis con el ejército chino (el PLA) pero sin confundirse con él: dos " +
      "ojos que miran al mismo enemigo desde ministerios distintos. La casa más difícil de perfilar del " +
      "planeta — lo que aquí se cuenta es la suma de lo que Occidente ha reconstruido.",
    fichas: [
      "Fundada en 1983 por fusión de dos aparatos rivales: el espionaje del Partido y la seguridad del Estado — la cicatriz burocrática sigue viva",
      "Su plantilla no aparece en ningún documento oficial: las estimaciones serias van de 100.000 a 300.000",
      "Su método favorito: mil fuentes pequeñas y civiles en lugar de un agente grande — el espionaje como niebla",
      "Su rivalidad con el PLA es legendaria: los dos ojos chinos comparten objetivo y no siempre se comparten la información",
    ],
  },
  // ─────────── EL LEVANTE — Israel (3 expedientes) ───────────
  {
    id: "mossad", num: 11, sigla: "MOSSAD",
    nombre: "HaMossad leModi'in uleTafkidim Meyuhadim",
    nombreEs: "Instituto de Inteligencia y Operaciones Especiales de Israel",
    pais: "Israel", bandera: "🇮🇱",
    categoria: "levante",
    fundacion: 1949, linaje: "nacida con el Estado — el Instituto de Coordinación de Shiloah",
    sede: "Tel Aviv",
    lat: 32.0700, lng: 34.7870, guiado: { dx: -14, dy: 8 },
    personal: "≈ 7.000 oficiales", especialidad: "La mano larga de Israel",
    dominio: ["HUMINT", "ACCIONES ENCUBIERTAS"],
    lema: "«Donde no hay consejo, cae el pueblo; mas en la multitud de consejeros hay salvación» — Proverbios 11:14",
    mision:
      "El servicio exterior israelí y la leyenda viva del oficio: capturó a Eichmann en Buenos Aires, " +
      "desmanteló redes de secuestradores a miles de kilómetros de casa y convirtió el espionaje en " +
      "argumento nacional. Su regla interna es la negación sistemática — lo que no se confirma no " +
      "existió — y su plantilla es diminuta comparada con la de sus rivales: Israel compensa tamaño con " +
      "audacia, velocidad y una cultura de la responsabilidad personal que no existe en ningún otro " +
      "servicio del mundo.",
    fichas: [
      "Creada en 1949 por Reuven Shiloah como «Instituto de Coordinación»: su nombre actual se abrevia de una sigla imposible de pronunciar",
      "Su lema está grabado en su emblema: Proverbios 11:14 — consejo, no fuerza",
      "La captura de Eichmann en Buenos Aires (1960) — la operación que definió su leyenda y abrió el juicio del siglo",
      "Su regla no escrita: negar todo. Las operaciones que no confirma son, estadísticamente, más que las confirmadas",
    ],
  },
  {
    id: "shabak", num: 12, sigla: "SHABAK",
    nombre: "Sherut haBitahon haKlali — Israel Security Agency",
    nombreEs: "Agencia de Seguridad de Israel (Shin Bet)",
    pais: "Israel", bandera: "🇮🇱",
    categoria: "levante",
    fundacion: 1949, linaje: "nacida con el Estado — el Servicio de Seguridad General",
    sede: "Tel Aviv",
    lat: 32.0720, lng: 34.7900, guiado: { dx: 0, dy: -15 },
    personal: "≈ 5.500 oficiales", especialidad: "El escudo interno de Israel",
    dominio: ["CONTRAINTELIGENCIA", "CONTRATERRORISMO"],
    lema: "«Magen veTzina lo tireh» — escudo y abrigo ocultos, y no verá",
    mision:
      "El escudo interno de Israel: contrainteligencia, contraterrorismo y la protección del Estado en un " +
      "país que lleva setenta años en estado de alerta. Es la agencia que mejor ha aprendido de sus " +
      "fracasos — el asesinato de Rabin en 1995 abrió una comisión que la desnudó ante el país y la " +
      "obligó a reescribirse — y la que ha montado la red de fuentes humanas más eficaz del " +
      "contraterrorismo moderno. Su emblema lleva una inscripción hebrea que lo resume: escudo y abrigo " +
      "ocultos.",
    fichas: [
      "Nació con el Estado en 1949: la primera orden que cumplió fue vigilar a los propios fundadores del país",
      "El asesinato de Rabin (1995) — el fracaso que la desnudó: la comisión Shamgar cambió su doctrina y su ley",
      "Su red de colaboradores en Cisjordania es considerada la más eficaz del contraterrorismo moderno",
      "Su departamento de árabe-israelíes de colaboración mantiene una de las mayores redes HUMINT jamás montadas: fuentes vivas, no satélites",
    ],
  },
  {
    id: "aman", num: 13, sigla: "AMAN",
    nombre: "Agaf ha-Modi'in — Intelligence Directorate of the IDF",
    nombreEs: "Dirección de Inteligencia Militar de Israel",
    pais: "Israel", bandera: "🇮🇱",
    categoria: "levante",
    fundacion: 1950, linaje: "Estado Mayor de las FDI — la tercera pierna del trípode israelí",
    sede: "La Kirya, Tel Aviv",
    lat: 32.0810, lng: 34.7870, guiado: { dx: 14, dy: 8 },
    personal: "≈ 7.000 oficiales", especialidad: "Los ojos de los generales",
    dominio: ["INTEL. MILITAR", "SIGINT (Unidad 8200)"],
    lema: "Sin lema público — de sus estimaciones sale la advertencia de guerra de Israel",
    mision:
      "La inteligencia militar israelí y la tercera pierna del trípode: donde el Mossad espía fuera y el " +
      "Shabak caza dentro, AMAN mira los ejércitos de los vecinos y produce la estimación nacional de " +
      "amenaza — el documento que decide cuántos reservistas despierta Israel cada mañana. Su hija más " +
      "famosa es la Unidad 8200, la NSA israelí: una fábrica de SIGINT que es, al mismo tiempo, el " +
      "semillero de las startups de ciberdefensa más feroces del planeta.",
    fichas: [
      "Fundada en 1950 para que el ejército no dependiera solo del Mossad: el trípode israelí nació de la desconfianza entre hermanos",
      "La sorpresa de Yom Kipur (1973) fue su herida: la «conceptzia» — creer que Egipto no atacaría — la cegó y cambió la doctrina para siempre",
      "Su Unidad 8200 escucha las señales del Medio Oriente y produce la mitad de las startups de ciberseguridad israelíes",
      "Su estimación diaria de amenaza es el papel más leído del gobierno: decide cuántos días de reserva moviliza el país",
    ],
  },
  // ─────────── LA CONTINENTAL — París, Berlín, Madrid (3 expedientes) ───────────
  {
    id: "dgse", num: 14, sigla: "DGSE",
    nombre: "Direction Générale de la Sécurité Extérieure",
    nombreEs: "Dirección General de Seguridad Exterior de Francia",
    pais: "Francia", bandera: "🇫🇷",
    categoria: "continental",
    fundacion: 1982, linaje: "SDECE (1945) → 2e Bureau (1871) — la elegancia del espionaje galo",
    sede: "Les Tourelles, París",
    lat: 48.8600, lng: 2.4020, guiado: null,
    personal: "≈ 7.000 oficiales", especialidad: "La gracia exterior de Francia",
    dominio: ["HUMINT", "SIGINT", "ACCIONES ENCUBIERTAS"],
    lema: "Sin lema público — la diplomacia francesa habla; ella escucha",
    mision:
      "El ojo exterior de Francia y heredera del 2e Bureau, el servicio de espionaje más viejo de Europa " +
      "continental. Espía con un estilo propio: menos alianza, más soberanía — Francia vigila a sus " +
      "aliados con la misma naturalidad que a sus rivales y presume de no depender de nadie. Su sede de " +
      "Les Tourelles disimula una piscina interna legendaria donde se entrenan nadadores de combate, y " +
      "su historia guarda la mancha más famosa del espionaje aliado: hundir el Rainbow Warrior en " +
      "Auckland en 1985.",
    fichas: [
      "Desciende del 2e Bureau que ya espiaba a Prusia en 1871: el linaje continental más largo de todos",
      "La operación Satánico (1985): sus agentes hundieron el barco de Greenpeace en Auckland y mataron a un fotógrafo — el escándalo que la desnudó ante Francia",
      "Su sede de Boulevard Mortier esconde una piscina de entrenamiento para nadadores de combate — el secreto menos secreto de París",
      "Francia es el socio europeo menos alineado: escucha a Washington y a Berlín con la misma cortesía",
    ],
  },
  {
    id: "bnd", num: 15, sigla: "BND",
    nombre: "Bundesnachrichtendienst — Federal Intelligence Service",
    nombreEs: "Servicio Federal de Inteligencia de Alemania",
    pais: "Alemania", bandera: "🇩🇪",
    categoria: "continental",
    fundacion: 1956, linaje: "Organización Gehlen (1946) — el espionaje nazi del Este reclutado por la CIA",
    sede: "Chausseestraße, Berlín",
    lat: 52.5310, lng: 13.3845, guiado: null,
    personal: "≈ 12.000 oficiales", especialidad: "El ojo de la posguerra",
    dominio: ["HUMINT", "SIGINT"],
    lema: "Sin lema público — nació de una organización americana y aprendió a ser alemán",
    mision:
      "El ojo exterior alemán, hijo legítimo de la Guerra Fría: su padre fue Reinhard Gehlen, el general " +
      "de espionaje del Este del Tercer Reich que la CIA reclutó entero con sus archivos — la Organización " +
      "Gehlen funcionó con dinero americano hasta que Alemania la bautizó BND en 1956. Hoy es el servicio " +
      "más grande de Europa occidental, con un cuartel de vidrio y hormigón en plena Chausseestraße de " +
      "Berlín: 12.000 ojos en el lugar donde la Guerra Fría tuvo su frontera.",
    fichas: [
      "Su genealogía es incómoda: la Organización Gehlen (1946) fue un aparato nazi del Este reconvertido con fondos de la CIA",
      "El espía de la Stasi Günter Guillaume, colocado en la Cancillería, tiró al canciller Willy Brandt en 1974 — el mayor bochorno de su historia",
      "Su cuartel de la Chausseestraße (2018) está en el antiguo Berlín Este: el espionaje alemán volvió a cruzar el muro por la puerta grande",
      "Su lección interna: «espía a tus aliados con cortesía» — el escándalo de espiar a la Cancillería europea la obligó a una reforma ética",
    ],
  },
  {
    id: "cni", num: 16, sigla: "CNI",
    nombre: "Centro Nacional de Inteligencia",
    nombreEs: "Centro Nacional de Inteligencia de España",
    pais: "España", bandera: "🇪🇸",
    categoria: "continental",
    fundacion: 2002, linaje: "CESID (1977) → los criptógrafos de la corona desde el siglo XVI",
    sede: "El Pinar, Madrid",
    lat: 40.4530, lng: -3.6880, guiado: null,
    personal: "≈ 4.500 oficiales", especialidad: "Los ojos de la corona española",
    dominio: ["HUMINT", "CONTRATERRORISMO", "CIBER"],
    lema: "«La discreción es la cortesía de los reyes» — la máxima que le sienta como ninguna otra",
    mision:
      "El ojo español y el servicio de una nación que inventó la diplomacia secreta europea — la España " +
      "de los Austrias escribía códigos cifrados cuando Inglaterra todavía no tenía marina. El CNI moderno " +
      "nació en 2002 sobre el CESID, el servicio de la Transición, y su oficio es doble: contraterrorismo " +
      "— la ETA fue su escuela — y la vigilancia de Canarias, el Sahel y el Estrecho, las puertas del sur " +
      "de Europa. Discreto por ley, español por carácter: la Casa lo incluye con orgullo de idioma.",
    fichas: [
      "Desciende del CESID de la Transición y, por las ramas, de los criptógrafos de Felipe II — la cifra española del siglo XVI era la envidia de Europa",
      "Su escuela fue el contraterrorismo de ETA: cuatro décadas de caza sin escándalo de Estado",
      "Su sede «El Pinar» esconde un bosque dentro de Madrid: pinares, helipuerto y un muro que no aparece en las visitas guiadas",
      "Vigila las puertas del sur: Canarias, el Sahel y el Estrecho de Gibraltar — la ruta de migración más vigilada de Europa",
    ],
  },
  // ─────────── EL SUBCONTINENTE — India y Pakistán (2 expedientes) ───────────
  {
    id: "raw", num: 17, sigla: "RAW",
    nombre: "Research and Analysis Wing",
    nombreEs: "Ala de Investigación y Análisis de la India",
    pais: "India", bandera: "🇮🇳",
    categoria: "subcontinente",
    fundacion: 1968, linaje: "Intelligence Bureau — la rama exterior que se cortó sola",
    sede: "Nueva Delhi",
    lat: 28.6139, lng: 77.2090, guiado: null,
    personal: "≈ 10.000 oficiales (estimado)", especialidad: "Los ojos del gigante del sur",
    dominio: ["HUMINT", "ACCIONES ENCUBIERTAS"],
    lema: "Sin lema público — ni siquiera el Parlamento indio la legisla por su nombre",
    mision:
      "El ojo exterior de la India: nació en 1968 de la lección de dos guerras — la India aprendió que un " +
      "ejército grande sin ojos propios pierde contra un vecino más pequeño pero mejor informado. Su " +
      "primer jefe, R. N. Kao, la levantó desde cero con manos de policía secreta y la convirtió en el " +
      "servicio más cerrado del Subcontinente: ni el Parlamento la nombra en ley, ni el presupuesto " +
      "aparece desglosado. Su rivalidad con el ISI pakistaní es la espina gemela de la frontera.",
    fichas: [
      "Nació en 1968 tras las derrotas diplomáticas de 1962 y 1965: India decidió que nunca más pelearía ciega",
      "Su primer jefe, Rameshwar Nath Kao, es el espía más respetado de la historia india: lo llamaban «Ram» y todo el mundo le temía el teléfono",
      "Su hazaña más citada: la Operación Cactus en Maldivas (1988) — inteligencia y paracaidistas en 24 horas exactas",
      "Su existencia no aparece en ninguna ley india: el Estado la opera por decreto ejecutivo desde 1968",
    ],
  },
  {
    id: "isi", num: 18, sigla: "ISI",
    nombre: "Inter-Services Intelligence",
    nombreEs: "Inteligencia Inter-Servicios de Pakistán",
    pais: "Pakistán", bandera: "🇵🇰",
    categoria: "subcontinente",
    fundacion: 1948, linaje: "oficiales británicos del Subcontinente — el servicio que dejaron montado",
    sede: "Islamabad",
    lat: 33.6844, lng: 73.0479, guiado: null,
    personal: "≈ 25.000 (estimado, con red de informantes enorme)", especialidad: "El poder detrás del poder",
    dominio: ["HUMINT", "INTEL. MILITAR", "PROXIES"],
    lema: "Sin lema público — tres generaciones de generales la llaman «el Estado dentro del Estado»",
    mision:
      "El ojo militar de Pakistán y el servicio más influyente del Subcontinente: nació en 1948 de manos " +
      "británicas que dejaron el aparato montado al irse, y se ganó la leyenda canalizando la ayuda " +
      "americana a los muyahidines afganos en los años 80 — el trabajo que la convirtió en árbitro de " +
      "Medio Oriente. Gobierna junto a los generales, decide guerras por delegación y mantiene una " +
      "rivalidad con la RAW india que lleva setenta años midiendo la misma frontera.",
    fichas: [
      "Fundada en 1948 por oficiales británicos que dejaron el Subcontinente: el aparato colonial como herencia directa",
      "La guerra afgana de los 80 la hizo leyenda: canalizó la ayuda de la CIA a los muyahidines y eligió a los ganadores",
      "Cada golpe de Estado pakistaní la tuvo detrás — y cada elección se cuenta con su opinión previa",
      "Su rivalidad con la RAW india es la espina gemela del Subcontinente: dos ojos clavados en la misma frontera desde 1968",
    ],
  },
];

// ─────────── LOS CINCO BLOQUES — cómo se reparte el mundo ───────────
export const BLOQUES: { cat: CategoriaRed; leyenda: string }[] = [
  { cat: "cincoOjos", leyenda: "LA ALIANZA — los Cinco Ojos: nacidos del pacto UKUSA de 1946, comparten señales con la Casa" },
  { cat: "bloque", leyenda: "EL BLOQUE — Moscú y Pekín: los rivales que el resto del mundo vigila" },
  { cat: "levante", leyenda: "EL LEVANTE — Israel: tres servicios para un país del tamaño de Nueva Jersey" },
  { cat: "continental", leyenda: "LA CONTINENTAL — París, Berlín y Madrid: los ojos europeos con orgullo propio" },
  { cat: "subcontinente", leyenda: "EL SUBCONTINENTE — Nueva Delhi e Islamabad: dos ojos clavados en la misma frontera" },
];

// ─────────── LA RED — arcos del pacto UKUSA (1946) sobre el mapa ───────────
// Todos los caminos pasan por Londres (el hub) y uno cruza el Atlántico
// hacia Washington: el puente con LA COMUNIDAD (v127), la sala hermana.
export const REDES: { de: string; a: string; etiqueta: string; puente?: boolean }[] = [
  { de: "mi6", a: "gchq", etiqueta: "UKUSA 1946" },
  { de: "mi6", a: "csis", etiqueta: "UKUSA 1946" },
  { de: "mi6", a: "asis", etiqueta: "UKUSA 1946" },
  { de: "mi6", a: "gcsb", etiqueta: "UKUSA 1946" },
  { de: "mi6", a: "washington", etiqueta: "EL PACTO QUE UNE LAS DOS SALAS", puente: true },
];

// Washington, D.C. — la terminal del puente (vive en LA COMUNIDAD, v127)
export const TERMINAL_PUENTE = { lat: 38.8977, lng: -77.0365 };

// ─────────── PULSO REAL: palabras clave por servicio (cables de /api/news) ───────────
// Se compara contra el título en minúsculas (includes) — siglas ambiguas
// van con contexto para no capturar ruido («analysis» contiene «isi»).
export const PULSO_KEYWORDS_MUNDO: Record<string, string[]> = {
  mi6: ["mi6", "secret intelligence service", "british intelligence", "british spy"],
  mi5: ["mi5", "uk security service", "british counterintelligence", "thames house"],
  gchq: ["gchq", "cheltenham", "bletchley"],
  asis: ["asis", "australian intelligence", "australia spy", "canberra spy"],
  csis: ["csis", "canadian intelligence", "canada spy", "ottawa spy"],
  gcsb: ["gcsb", "new zealand intelligence", "wellington spy"],
  svr: ["svr", "russian foreign intelligence", "russian spy", "moscow spy", "russian illegals"],
  fsb: ["fsb", "lubyanka", "russian security service", "kremlin spy"],
  gru: ["gru russia", "russian military intelligence", "unit 29155", "aquarium moscow"],
  mss: ["ministry of state security", "chinese intelligence", "china spy", "beijing spy"],
  mossad: ["mossad", "israeli intelligence", "israel spy"],
  shabak: ["shin bet", "shabak", "israeli security agency"],
  aman: ["unit 8200", "idf intelligence", "israeli military intelligence"],
  dgse: ["dgse", "french intelligence", "france spy", "paris spy"],
  bnd: ["bnd", "german intelligence", "germany spy", "berlin spy"],
  cni: ["cni", "spanish intelligence", "spain spy", "madrid spy"],
  raw: ["research and analysis wing", "indian intelligence", "raw india", "delhi spy"],
  isi: ["inter-services intelligence", "pakistani intelligence", "isi pakistan", "islamabad spy"],
};

// ─────────── cifras de la colección ───────────
export const COLECCION_MUNDO = {
  total: SERVICIOS.length,                          // 18
  naciones: new Set(SERVICIOS.map((s) => s.pais)).size,  // 12
  enAlianza: SERVICIOS.filter((s) => s.categoria === "cincoOjos").length,  // 6
  masAntiguo: SERVICIOS.reduce((m, s) => (s.fundacion < m.fundacion ? s : m)),  // MI6 1909
  masJoven: SERVICIOS.reduce((m, s) => (s.fundacion > m.fundacion ? s : m)),    // CNI 2002
};

export const servicioDe = (id: string): ServicioExtranjero | undefined =>
  SERVICIOS.find((s) => s.id === id);
