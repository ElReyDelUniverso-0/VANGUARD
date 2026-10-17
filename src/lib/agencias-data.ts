// ============================================================
// v127.0 LA COMUNIDAD — LOS 18 OJOS DE LA CASA
// La Comunidad de Inteligencia de los Estados Unidos: 18 agencias
// oficiales bajo la supervisión de la ODNI, convertidas en expedientes
// finos de la Casa. Contenido narrado según la doctrina del lujo:
// cada placa cuenta su origen, su oficio y su territorio (Ley 5).
//
// Fuentes: la orden del Dueño (el dossier enviado a la Casa) y el
// registro público de la propia Comunidad (intel.gov). Nada aquí es
// secreto ni ficticio: es conocimiento abierto, presentado como
// una colección de colección.
// ============================================================

export type CategoriaAgencia =
  | "coordinacion"   // la corona
  | "independiente"  // los ojos exteriores
  | "defensa"        // las cuatro grandes del Pentágono
  | "militar"        // los servicios armados
  | "seguridad"      // el escudo interno
  | "ministerio";    // los diplomáticos y los ministerios

export interface Agencia {
  id: string;
  num: number;              // Nº de expediente (01–18)
  sigla: string;
  nombre: string;           // nombre oficial completo (inglés)
  nombreEs: string;
  categoria: CategoriaAgencia;
  fundacion: number;
  sede: string;
  // posición en el mapa del Corredor (0–100, x=oeste→este, y=norte→sur)
  // null = fuera del corredor (se lista con nota al pie)
  pos: { x: number; y: number } | null;
  personal: string;
  especialidad: string;
  dominio: string[];        // etiquetas INT (HUMINT, SIGINT…)
  lema: string;
  mision: string;           // narrativa principal (la orden del Dueño, pulida)
  fichas: string[];         // el expediente en viñetas finas
}

export const CATEGORIA_META: Record<CategoriaAgencia, { etiqueta: string; color: string }> = {
  coordinacion:  { etiqueta: "LA CORONA",        color: "#D4AF37" },
  independiente: { etiqueta: "OJO EXTERIOR",     color: "#E8C56A" },
  defensa:       { etiqueta: "EL PENTÁGONO",     color: "#7FE3FF" },
  militar:       { etiqueta: "SERVICIO ARMADO",  color: "#A8B8C8" },
  seguridad:     { etiqueta: "ESCUDO INTERNO",   color: "#3DDC97" },
  ministerio:    { etiqueta: "MINISTERIO",       color: "#C9A0DC" },
};

export const AGENCIAS: Agencia[] = [
  // ─────────────────────────── LA CORONA ───────────────────────────
  {
    id: "odni", num: 1, sigla: "ODNI",
    nombre: "Office of the Director of National Intelligence",
    nombreEs: "Oficina del Director de Inteligencia Nacional",
    categoria: "coordinacion",
    fundacion: 2005, sede: "Washington, D.C.", pos: { x: 50, y: 46 },
    personal: "≈ 1.750 funcionarios", especialidad: "Coordinar los 17 ojos restantes",
    dominio: ["COORDINACIÓN", "PDB"],
    lema: "«Una comunidad, un objetivo: la seguridad de la nación»",
    mision:
      "Es la cabeza de toda la pirámide. Nació de la lección más cara del 11-S: diecisiete agencias " +
      "mirando en direcciones distintas se pierden el cuadro completo. La ODNI existe para que compartan " +
      "sus datos, hablen entre sí y dejen de operar aisladas. Cada mañana, su Director entrega al " +
      "Presidente el informe diario de amenazas — el documento más vigilado de Washington.",
    fichas: [
      "Creada por la Ley de Reforma de Inteligencia y Prevención del Terrorismo de 2004, operativa desde 2005",
      "El Director de Inteligencia Nacional (DNI) preside la Comunidad entera: 18 elementos en total",
      "El Presidente's Daily Brief (PDB) se compone y entrega bajo su supervisión directa",
      "Su edificio no aparece en las guías turísticas: es el punto menos fotogénico y más escuchado de la capital",
    ],
  },
  // ─────────────────────── OJO EXTERIOR ───────────────────────
  {
    id: "cia", num: 2, sigla: "CIA",
    nombre: "Central Intelligence Agency",
    nombreEs: "Agencia Central de Inteligencia",
    categoria: "independiente",
    fundacion: 1947, sede: "Langley, Virginia", pos: { x: 38, y: 52 },
    personal: "clasificado (decenas de miles)", especialidad: "El exterior del mapa",
    dominio: ["HUMINT", "OSINT", "ACCIONES ENCUBIERTAS"],
    lema: "«Y conoceréis la verdad, y la verdad os hará libres»",
    mision:
      "La agencia de inteligencia exterior por excelencia: todo lo que ocurre FUERA de las fronteras " +
      "estadounidenses pasa por sus manos. Espionaje humano (HUMINT), análisis de datos y operaciones " +
      "encubiertas. Pocas lo saben, pero también administra la Open-Source Enterprise (OSE): un sistema " +
      "con Inteligencia Artificial que monitorea noticias y redes sociales de todo el planeta — la " +
      "misma idea que inspiró a esta Casa, décadas después y sin fama de espía.",
    fichas: [
      "Fundada por la Ley de Seguridad Nacional de 1947, heredera de la OSS de la Segunda Guerra Mundial",
      "La OSE procesa fuentes abiertas del mundo entero: prensa, televisiones, foros y redes sociales",
      "El mosaico con la frase bíblica preside el vestíbulo de Langley: el lema es de Juan 8:32",
      "Su museo interno tiene artefactos desclasificados que no se pueden fotografiar (la ironía es intencional)",
    ],
  },
  // ─────────────────── EL PENTÁGONO (4 grandes) ───────────────────
  {
    id: "nsa", num: 3, sigla: "NSA",
    nombre: "National Security Agency",
    nombreEs: "Agencia de Seguridad Nacional",
    categoria: "defensa",
    fundacion: 1952, sede: "Fort Meade, Maryland", pos: { x: 66, y: 22 },
    personal: "la mayor plantilla de la Comunidad", especialidad: "Las señales del mundo",
    dominio: ["SIGINT", "CIBERSEGURIDAD"],
    lema: "«Defendiendo la nación. Asegurando el futuro»",
    mision:
      "La agencia más grande, más tecnológica y con el mayor presupuesto de inteligencia del país. " +
      "Su oficio es escuchar lo que viaja por cables, ondas y fibras: correos, llamadas y transmisiones " +
      "militares globales (SIGINT). El mismo músculo protege los sistemas informáticos secretos del " +
      "gobierno estadounidense — y, cuando hace falta, hackea las redes extranjeras. Dos caras, un solo " +
      "edificio sin ventanas.",
    fichas: [
      "Creada en secreto por Truman en 1952; su existencia se reconoció oficialmente décadas después",
      "Presuntamente puede almacenar y cribar volúmenes de comunicación que ninguna otra institución iguala",
      "Su campus de Fort Meade consume más electricidad que muchas ciudades pequeñas: los ordenadores nunca duermen",
      "Protege el «Diamante Negro»: los sistemas clasificados donde vive el flujo de la Comunidad",
    ],
  },
  {
    id: "dia", num: 4, sigla: "DIA",
    nombre: "Defense Intelligence Agency",
    nombreEs: "Agencia de Inteligencia de la Defensa",
    categoria: "defensa",
    fundacion: 1961, sede: "El Pentágono, Washington, D.C.", pos: { x: 55, y: 58 },
    personal: "≈ 17.000 (civil y militar)", especialidad: "Los ejércitos de los demás",
    dominio: ["INTEL. MILITAR"],
    lema: "«Comprometidos con la excelencia en defensa de la nación»",
    mision:
      "El brazo de espionaje del Pentágono. Produce inteligencia militar para soldados, generales y el " +
      "Departamento de Defensa: analiza los ejércitos de otros países, sus arsenales, sus búnkeres y las " +
      "capacidades tácticas de cualquier adversario potencial. Si un general pregunta «¿qué hay al otro " +
      "lado de la colina?», la respuesta lleva firma de la DIA.",
    fichas: [
      "Fundada en 1961 por orden de Robert McNamara para unificar la inteligencia militar dispersa",
      "Mantiene agregados de defensa en embajadas de todo el mundo — los oficiales de uniforme que no son turistas",
      "Su centro médico de análisis estudia desde tanques nuevos hasta pandemias que afectan a tropas",
      "Publica el «China Military Power Report»: el dossier anual más leído de las fuerzas armadas",
    ],
  },
  {
    id: "nga", num: 5, sigla: "NGA",
    nombre: "National Geospatial-Intelligence Agency",
    nombreEs: "Agencia Nacional de Inteligencia Geoespacial",
    categoria: "defensa",
    fundacion: 1996, sede: "Springfield, Virginia", pos: { x: 40, y: 64 },
    personal: "≈ 14.500 funcionarios", especialidad: "Los ojos del gobierno en el espacio",
    dominio: ["GEOINT", "IMÁGENES SATELITALES"],
    lema: "«Conocer la Tierra, mostrar el camino»",
    mision:
      "Analizan imágenes satelitales de alta resolución y mapas interactivos (GEOINT). Vigilan " +
      "visualmente bases militares extranjeras, movimientos de tropas en las fronteras, los efectos " +
      "del cambio climático y las zonas arrasadas por desastres naturales. Todo lo que la Casa muestra " +
      "en sus mapas bebe de la misma fuente que ellos abrieron: la Tierra como documento.",
    fichas: [
      "Nació en 1996 como NIMA (fusión de agencias cartográficas militares); nombre actual desde 2003",
      "Su campus nuevo en Springfield es uno de los edificios más caros del gobierno: un atlas de hormigón",
      "Los mapas de aterrizaje de la Marina y las rutas de ayuda humanitaria salen de la misma sala",
      "Ayudó a localizar restos de expediciones perdidas y a dibujar la costa antártica al centímetro",
    ],
  },
  {
    id: "nro", num: 6, sigla: "NRO",
    nombre: "National Reconnaissance Office",
    nombreEs: "Oficina Nacional de Reconocimiento",
    categoria: "defensa",
    fundacion: 1961, sede: "Chantilly, Virginia", pos: { x: 27, y: 50 },
    personal: "≈ 3.000 (la más pequeña de las grandes)", especialidad: "Los juguetes espaciales",
    dominio: ["SATÉLITES ESPÍA", "ÓRBITA"],
    lema: "«Nunca conformarse con menos; desafiar el mañana»",
    mision:
      "La agencia ultra secreta que diseña, construye y pone en órbita los satélites espía de Estados " +
      "Unidos. Trabaja de la mano con la NGA y la NSA: ellos fabrican los «juguetes espaciales» que las " +
      "demás agencias usan para tomar fotos o interceptar señales. Su emblema — un oso polar abrazando " +
      "el planeta — es el guiño mejor guardado de la ingeniería aeroespacial.",
    fichas: [
      "Existió en secreto desde 1961; el gobierno admitió su existencia en 1992 — 31 años de silencio",
      "Lanza bajo nombres de fachada: sus misiones viajan como «cargas del NRO» sin datos públicos",
      "Sus parches de misión son coleccionables: calaveras, dragones y lemas criptográficos",
      "Cada lanzamiento de un «NROL-XX» deja a los astrónomos aficionados adivinando qué mira esta vez",
    ],
  },
  // ─────────────────── SERVICIOS ARMADOS (5) ───────────────────
  {
    id: "inscom", num: 7, sigla: "INSCOM",
    nombre: "U.S. Army Intelligence and Security Command",
    nombreEs: "Mando de Inteligencia y Seguridad del Ejército de Tierra",
    categoria: "militar",
    fundacion: 1977, sede: "Fort Belvoir, Virginia", pos: { x: 42, y: 74 },
    personal: "≈ 17.500 soldados y civiles", especialidad: "Los ojos del ejército de tierra",
    dominio: ["INTEL. MILITAR", "SIGINT"],
    lema: "«Siempre primero» (heredado del servicio de inteligencia del Ejército)",
    mision:
      "El linaje más antiguo de la inteligencia estadounidense: el Ejército nombró su primer oficial de " +
      "inteligencia en 1885. Hoy INSCOM integra brigadas que escuchan, fotográfican y analizan en cada " +
      "teatro de operaciones. Su G-2 fue quien rastreó a Pancho Villa; sus brigadas actuales alimentan " +
      "los mapas que la DIA y el Pentágono leen cada mañana.",
    fichas: [
      "La Oficina del Jefe de Estado Mayor de Inteligencia (G-2) data de 1885 — antes que la CIA, que el FBI y que casi todo",
      "Opera brigadas de inteligencia desplegadas desde Corea hasta Alemania sin cambiar de sello",
      "Gestiona los archivos de inteligencia del Ejército: más de un siglo de expedientes",
      "Su pirámide invertida (el emblema) es uno de los parches más reconocibles del uniforme de campaña",
    ],
  },
  {
    id: "oni", num: 8, sigla: "ONI",
    nombre: "Office of Naval Intelligence",
    nombreEs: "Oficina de Inteligencia Naval",
    categoria: "militar",
    fundacion: 1882, sede: "Washington Navy Yard, D.C.", pos: { x: 62, y: 60 },
    personal: "civiles + oficiales navales", especialidad: "Todo lo que flota",
    dominio: ["INTEL. MILITAR", "MARÍTIMA"],
    lema: "«La más antigua de las inteligencias navales del mundo»",
    mision:
      "Fundada en 1882 por el teniente Theodorus Mason: la agencia de inteligencia más antigua de " +
      "Estados Unidos que sigue en servicio. Cuenta buques, rutas y arsenales navales extranjeros; " +
      "hoy su obsesión son las flotas que crecen en el Pacífico. Su primer informe notable fue un " +
      "estudio sobre el pequeño puerto de Pearl Harbor — la historia, a veces, tiene un humor cruel.",
    fichas: [
      "La agencia de inteligencia en servicio activo más antigua de toda la Comunidad (1882)",
      "Vigila submarinos, portaviones y movimientos mercantes en todos los océanos",
      "Su informe de 1887 sobre Pearl Harbor fue descartado como exagerado — se releyó 54 años después",
      "Comparte edificios y café con las inteligencias de la Armada de aliados históricos: la Royal Navy es su espejo",
    ],
  },
  {
    id: "mcia", num: 9, sigla: "MCIA",
    nombre: "Marine Corps Intelligence Activity",
    nombreEs: "Actividad de Inteligencia del Cuerpo de Marines",
    categoria: "militar",
    fundacion: 1978, sede: "Quantico, Virginia", pos: { x: 30, y: 90 },
    personal: "≈ 2.500 marines y civiles", especialidad: "Inteligencia de desembarco",
    dominio: ["INTEL. MILITAR"],
    lema: "«Semper Fidelis» — la intel del cuerpo que llega primero",
    mision:
      "Los Marines no conquistan territorios: los abren. Su inteligencia existe para que la primera " +
      "olada sepa exactamente qué encontrar en la playa, la colina o la ciudad. Nacida como actividad " +
      "coordinada en 1978, hoy produce análisis táctico-operativos en tiempo real para cada " +
      "destacamento desplegado — del Indo-Pacífico al Mediterráneo.",
    fichas: [
      "El Cuerpo de Marines creó su primera unidad formal de inteligencia en 1978 en Quantico",
      "Sus analistas viajan con las unidades: la inteligencia de los Marines viaja en el mismo vehículo",
      "Especializada en terreno costero y urbano — donde el mapa cambia en horas",
      "Cuanta con la mayor proporción de analistas de campo por soldado de todas las ramas",
    ],
  },
  {
    id: "afintel", num: 10, sigla: "16ª AF",
    nombre: "Sixteenth Air Force (Air Forces Cyber)",
    nombreEs: "Decimosexta Fuerza Aérea — Inteligencia, Vigilancia y Reconocimiento",
    categoria: "militar",
    fundacion: 2019, sede: "San Antonio, Texas (fuera del corredor)", pos: null,
    personal: "≈ 38.000 aéreos y civiles", especialidad: "El ala y la red",
    dominio: ["INTEL. AÉREA", "CIBERGUERRA"],
    lema: "«El cielo no es el límite: es el puesto de observación»",
    mision:
      "La fusión más moderna de la Comunidad: en 2019 la Fuerza Aérea unió su ala de inteligencia, " +
      "vigilancia y reconocimiento (la antigua 25ª AF) con el mando de ciberespacio. El resultado es " +
      "un solo mando que vuela, escucha y ataca en la red. Sus sensores incluyen drones que miran " +
      "desde 18.000 metros y antenas que barren continentes enteros.",
    fichas: [
      "Reorganizada en 2019: intel aérea + ciberdefensa bajo un mismo general",
      "Opera la red de drones de reconocimiento de mayor altitud del inventario",
      "Su cuartel de Lackland custodia los nodos que defienden la red militar global",
      "Analiza millones de imágenes de sensor al día: un río de píxeles convertido en decisiones",
    ],
  },
  {
    id: "sfintel", num: 11, sigla: "DELTA 7",
    nombre: "Space Delta 7 — Space Force Intelligence",
    nombreEs: "Delta Espacial 7 — Inteligencia de la Fuerza Espacial",
    categoria: "militar",
    fundacion: 2020, sede: "Peterson SFB, Colorado (fuera del corredor)", pos: null,
    personal: "el elemento más joven", especialidad: "La órbita como campo de batalla",
    dominio: ["INTEL. ESPACIAL"],
    lema: "«Por encima de todo»",
    mision:
      "El ojo recién nacido de la Comunidad: la Fuerza Espacial levantó su Delta de Inteligencia en " +
      "2020 para vigilar lo que orbita por encima de todos los otros ojos. Rastrea satélites ajenos, " +
      "maniobras sospechosas y basura espacial capaz de cegar una constelación entera. Cuando la " +
      "órbita se vuelva terreno disputado, los primeros analistas ya estarán de guardia.",
    fichas: [
      "La unidad de inteligencia más joven de toda la Comunidad: activada el 24 de julio de 2020",
      "Vigila el catálogo de objetos en órbita: más de 40.000 piezas rastreadas sin descanso",
      "Sus analistas son «guardianes» — el nombre oficial del personal de la Fuerza Espacial",
      "Mantiene la primera base de inteligencia dedicada a detectar mentiras orbitales: satélites que dicen estar donde no están",
    ],
  },
  // ─────────────────── ESCUDO INTERNO (4) ───────────────────
  {
    id: "fbi", num: 12, sigla: "FBI",
    nombre: "Federal Bureau of Investigation",
    nombreEs: "Oficina Federal de Investigación",
    categoria: "seguridad",
    fundacion: 1908, sede: "J. Edgar Hoover Building, Washington, D.C.", pos: { x: 58, y: 46 },
    personal: "≈ 38.000 empleados", especialidad: "El enemigo está dentro",
    dominio: ["CONTRAINTELIGENCIA", "POLICÍA FEDERAL"],
    lema: "«Fidelidad, Valentía, Integridad»",
    mision:
      "El espejo exacto de la CIA: donde la de Langley opera fuera, el FBI opera dentro del territorio " +
      "estadounidense. Es a la vez policía federal y servicio de seguridad interna: investiga delitos " +
      "federales, terrorismo doméstico, ciberataques contra infraestructura y rastrea espías extranjeros " +
      "infiltrados. Su archivo de huellas digitales — fundado en 1924 — fue el primer motor de memoria " +
      "criminal a escala nacional.",
    fichas: [
      "Fundada en 1908 como Bureau of Investigation (BOI); nombre actual desde 1935",
      "Su División de Contrainteligencia ha detenido a más espías rusos que ninguna otra agencia occidental",
      "El Laboratorio del FBI inventó la comparación de balística forense moderna",
      "Sus «Ten Most Wanted» nacieron en 1950 como un cartel de periódico — y siguen funcionando",
    ],
  },
  {
    id: "dhs", num: 13, sigla: "DHS · I&A",
    nombre: "Department of Homeland Security — Office of Intelligence and Analysis",
    nombreEs: "Departamento de Seguridad Nacional — Oficina de Inteligencia y Análisis",
    categoria: "seguridad",
    fundacion: 2007, sede: "Nebraska Avenue, Washington, D.C.", pos: { x: 48, y: 42 },
    personal: "≈ 250.000 (el ministerio completo)", especialidad: "Unir 22 agencias y 50 estados",
    dominio: ["FUSIÓN", "FRONTERAS"],
    lema: "«Preservar nuestra libertad, proteger América»",
    mision:
      "El súper-ministerio nacido del 11-S: creado en 2002, unifica 22 agencias distintas para blindar " +
      "las fronteras. Su Oficina de Inteligencia y Análisis (I&A) es la pieza que pertenece a la " +
      "Comunidad: conecta la información de la CIA y el FBI con las policías locales y estatales de los " +
      "50 estados. Es el puente entre la inteligencia federal y el sheriff de cualquier condado.",
    fichas: [
      "El ministerio más grande creado en la historia reciente de EE. UU.: 22 agencias fusionadas de golpe",
      "Su I&A es la única agencia de la Comunidad cuyo mandato principal es compartir con gobiernos estatales y locales",
      "Custodia desde la Guardia Costera hasta el Servicio Secreto: la casa tiene muchas puertas",
      "Publica boletines de amenaza que leen desde comisarías de pueblo hasta aeropuertos internacionales",
    ],
  },
  {
    id: "costera", num: 14, sigla: "USCG",
    nombre: "United States Coast Guard Intelligence",
    nombreEs: "Inteligencia de la Guardia Costera de EE. UU.",
    categoria: "seguridad",
    fundacion: 1915, sede: "Buzzard Point, Washington, D.C.", pos: { x: 56, y: 62 },
    personal: "≈ 41.000 guardacostas", especialidad: "La línea costera entera",
    dominio: ["MARÍTIMA", "PORTUARIA"],
    lema: "«Semper Paratus — Siempre Listos»",
    mision:
      "El servicio armado más antiguo del país en navegación continua (1915) y, a la vez, una agencia " +
      "de inteligencia portuaria y marítima. Vigila 95.000 millas de costa, intercepta cargas prohibidas " +
      "y detecta buques que no son lo que dicen ser. Su inteligencia resultó decisiva en cada guerra " +
      "naval del siglo XX — y en la anti-piratería moderna de la costa oeste africana.",
    fichas: [
      "Su inteligencia formal nació en 1915, un mes antes que el propio servicio moderno",
      "Única agencia que puede cambiar de sombrero: militar bajo el Pentágono en guerra, civil bajo el DHS en paz",
      "Los «Port Security Units» inspeccionan buques mercantes antes de que toquen puerto estadounidense",
      "Su red de radares costeros es una de las mayores fuentes de pistas sobre narcosubmarinos",
    ],
  },
  {
    id: "dea", num: 15, sigla: "DEA · ONSI",
    nombre: "Drug Enforcement Administration — Office of National Security Intelligence",
    nombreEs: "Administración para el Control de Drogas — Oficina de Inteligencia de Seguridad Nacional",
    categoria: "seguridad",
    fundacion: 2006, sede: "Arlington, Virginia", pos: { x: 44, y: 60 },
    personal: "≈ 5.000 agentes especiales", especialidad: "Las rutas del veneno",
    dominio: ["FININT", "NARCOTRÁFICO"],
    lema: "«Seguir el dinero hasta la raíz del cártel»",
    mision:
      "La agencia de la guerra contra el narcotráfico lleva su propia oficina de inteligencia desde 2006: " +
      "recopila información global sobre rutas de droga, producción de sustancias ilegales y finanzas de " +
      "los cárteles. Sus mapas de laboratorios, pistas clandestinas y lavadoras de dinero alimentan " +
      "operaciones en más de 70 países — y son la radiografía más precisa del crimen organizado global.",
    fichas: [
      "La DEA nació en 1973 (fusión de BNDD y ODALE); su oficina de inteligencia entró en la Comunidad en 2006",
      "Mantiene la base de datos de precursores químicos más completa del mundo: cada pastilla deja rastro",
      "Su programa de aviación rastrea pistas clandestinas desde el Golfo de México hasta Honduras",
      "El «Rome Laboratory» de la DEA en Italia persigue la ruta más antigua: la de la mafia siciliana",
    ],
  },
  // ─────────────────── MINISTERIOS (3) ───────────────────
  {
    id: "inr", num: 16, sigla: "INR",
    nombre: "Bureau of Intelligence and Research (Department of State)",
    nombreEs: "Oficina de Inteligencia e Investigación — Departamento de Estado",
    categoria: "ministerio",
    fundacion: 1946, sede: "Foggy Bottom, Washington, D.C.", pos: { x: 52, y: 48 },
    personal: "≈ 400 analistas (la más pequeña)", especialidad: "La voz de los diplomáticos",
    dominio: ["OSINT", "ANÁLISIS DIPLOMÁTICO"],
    lema: "«La más antigua tradición analítica civil del país»",
    mision:
      "La agencia de inteligencia de los diplomáticos. Analiza las noticias del mundo, la opinión " +
      "pública de otros países y los cables diplomáticos para aconsejar a los embajadores y al " +
      "Secretario de Estado. Es la analista más pequeña de la Comunidad — y la que menos se equivoca: " +
      "sus informes sobre Irak de 2002 discreparon de todo el mundo, y la historia le dio la razón.",
    fichas: [
      "Desciende directamente de la Oficina de Investigación Analítica creada en 1946 por el general Donovan",
      "Su informe de 2002 sobre las armas de destrucción masiva iraquíes fue el único que dudó — con razón",
      "Cada embajada estadounidense lleva un analista INR en su personal de mando",
      "Lee las noticias del mundo con una regla interna: «una fuente diplomática miente el doble de lo que habla»",
    ],
  },
  {
    id: "oia", num: 17, sigla: "OIA",
    nombre: "Office of Intelligence and Analysis (Department of the Treasury)",
    nombreEs: "Oficina de Inteligencia y Análisis — Departamento del Tesoro",
    categoria: "ministerio",
    fundacion: 2004, sede: "Departamento del Tesoro, Washington, D.C.", pos: { x: 57, y: 44 },
    personal: "analistas financieros de élite", especialidad: "El rastro del dinero",
    dominio: ["FININT", "SANCIONES"],
    lema: "«Todo dinero deja huella: solo hay que saber leerla»",
    mision:
      "La inteligencia financiera del país. Sigue el rastro del dinero a nivel global para bloquear " +
      "cuentas bancarias de terroristas y cárteles, y para aplicar sanciones económicas a gobiernos " +
      "enteros. Su arma favorita no lleva nitro: es una lista. Aparecer en la lista del Tesoro congeló " +
      "más patrimonios que cualquier explosivo de la historia.",
    fichas: [
      "Su antecedente histórico es la Oficina de Aduanas de 1789: perseguir contrabando es el oficio más viejo del Tesoro",
      "Administra la lista SDN: bloquear un nombre ahí cierra las puertas del sistema bancario global",
      "Detecta patrones de lavado que ninguna banca privada admite tener: el «seguimiento de dinastías del dinero»",
      "Sus sanciones macrofinancieras han encogido economías enteras sin disparar un solo tiro",
    ],
  },
  {
    id: "oici", num: 18, sigla: "OICI",
    nombre: "Office of Intelligence and Counterintelligence (Department of Energy)",
    nombreEs: "Oficina de Inteligencia y Contrainteligencia — Departamento de Energía",
    categoria: "ministerio",
    fundacion: 1977, sede: "James V. Forrestal Building, Washington, D.C.", pos: { x: 60, y: 52 },
    personal: "analistas nucleares + físicos", especialidad: "Vigilar el fuego atómico",
    dominio: ["NUCLEAR", "CONTRAINTELIGENCIA"],
    lema: "«El átomo no perdona la distracción»",
    mision:
      "El legado directo del Proyecto Manhattan. Vigila la seguridad nuclear a nivel mundial: monitorea " +
      "reactores extranjeros, detecta la proliferación de armas de destrucción masiva y protege las " +
      "plantas de energía atómica de Estados Unidos. Sus analistas saben distinguir una central civil " +
      "de un programa militar por la foto del humo — un oficio que se aprende solo en la Casa del Átomo.",
    fichas: [
      "Hereda los archivos del Proyecto Manhattan: la carpeta más importante de la física del siglo XX",
      "Sus 17 laboratorios nacionales (Los Álamos, Sandia, Oak Ridge…) son sensores científicos de la Comunidad",
      "Identifica ensayos nucleares subterráneos mediante sismógrafos: la Tierra misma delata al que miente",
      "Protege el transporte de material nuclear dentro del país con convoyes que nadie debe seguir",
    ],
  },
];

// ─────────── SALA ANEXA: las aliadas que el Dueño pidió por nombre ───────────
export interface Aliada {
  id: string;
  sigla: string;
  nombre: string;
  nota: string;
}

export const ALIADAS: Aliada[] = [
  {
    id: "fema",
    sigla: "FEMA",
    nombre: "Federal Emergency Management Agency",
    nota:
      "Dentro del DHS, coordina la respuesta ante desastres catastróficos — huracanes, terremotos, " +
      "pandemias. Usa los mapas de la NGA y el monitoreo de redes sociales en tiempo real para saber " +
      "dónde enviar ayuda, rescatistas y recursos en minutos. No es uno de los 18 ojos: es la mano " +
      "que actúa cuando los ojos ya vieron el desastre.",
  },
];

// ─────────── LOS CINCO SENTIDOS DE LA INTELIGENCIA ───────────
export interface Sentido {
  id: string;
  sigla: string;
  nombre: string;
  texto: string;
}

export const SENTIDOS: Sentido[] = [
  {
    id: "humint", sigla: "HUMINT", nombre: "Inteligencia humana",
    texto: "El oficio más antiguo: personas que hablan con personas. Agentes, fuentes, desertores y el arte de que un extraño te cuente lo que su gobierno quiere callar.",
  },
  {
    id: "sigint", sigla: "SIGINT", nombre: "Inteligencia de señales",
    texto: "Lo que viaja por el aire y el cable: llamadas, correos, transmisiones militares. La especialidad de la NSA — escuchar al mundo sin tocarlo.",
  },
  {
    id: "geoint", sigla: "GEOINT", nombre: "Inteligencia geoespacial",
    texto: "Imágenes satelitales, mapas y terreno. La NGA lo domina: convertir píxeles desde la órbita en decisiones sobre el suelo.",
  },
  {
    id: "osint", sigla: "OSINT", nombre: "Inteligencia de fuentes abiertas",
    texto: "Prensa, redes sociales, registros públicos. La Open-Source Enterprise de la CIA la elevó a oficio: leer el mundo entero con paciencia de relojero.",
  },
  {
    id: "finint", sigla: "FININT", nombre: "Inteligencia financiera",
    texto: "El dinero siempre deja rastro. El Tesoro (OIA) y la DEA lo persiguen: cada transferencia es una confesión escrita por alguien que cree que nadie mira.",
  },
];

// ─────────── PULSO REAL: palabras clave por agencia (cables de /api/news) ───────────
export const PULSO_KEYWORDS: Record<string, string[]> = {
  odni: ["intelligence community", "director of national intelligence", "intel chief"],
  cia: ["cia", "espionage", "espionaje", "spy", "intelligence agency", "langley"],
  nsa: ["nsa", "cyberattack", "cyber", "ciber", "hacker", "ransomware", "hackeo", "wiretap"],
  dia: ["pentagon", "pentágono", "military intelligence", "defense intelligence"],
  nga: ["satellite imagery", "satellite map", "geospatial", "satellite photos"],
  nro: ["spy satellite", "satellite launch", "orbital launch", "reconnaissance satellite"],
  inscom: ["us army", "army troops", "ejército de tierra"],
  oni: ["navy", "naval", "warship", "carrier", "flota"],
  mcia: ["marines", "marine corps"],
  afintel: ["air force", "drone strike", "reconnaissance aircraft", "fighter jet"],
  sfintel: ["space force", "anti-satellite", "military satellite", "space war"],
  fbi: ["fbi", "federal bureau of investigation", "counterintelligence", "espía ruso"],
  dhs: ["dhs", "border", "frontera", "homeland", "immigration", "migración", "customs"],
  costera: ["coast guard", "guardia costera", "maritime security"],
  dea: ["dea", "cartel", "narco", "drug", "fentanyl", "droga", "narcotráfico"],
  inr: ["state department", "diplomat", "embassy", "embajada", "diplomacia", "diplomatic"],
  oia: ["sanction", "sanciones", "treasury", "tesoro", "money laundering", "lavado de dinero"],
  oici: ["nuclear", "reactor", "reactor nuclear", "iaea", "atomic", "enriched uranium"],
};

// ─────────── cifras de la colección ───────────
export const COLECCION = {
  total: AGENCIAS.length,                     // 18
  enCorredor: AGENCIAS.filter((a) => a.pos).length,
  fueraCorredor: AGENCIAS.filter((a) => !a.pos).map((a) => a.sigla),
  masAntigua: AGENCIAS.reduce((m, a) => (a.fundacion < m.fundacion ? a : m)),  // ONI 1882
  masJoven: AGENCIAS.reduce((m, a) => (a.fundacion > m.fundacion ? a : m)),    // Delta 7 2020
  creadasPost11S: AGENCIAS.filter((a) => a.fundacion >= 2004).length,
};

export const agenciaDe = (id: string): Agencia | undefined =>
  AGENCIAS.find((a) => a.id === id);
