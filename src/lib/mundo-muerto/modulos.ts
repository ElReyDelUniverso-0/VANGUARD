// ═══════════════════════════════════════════════════════════════════
// v444.0 · EL MUNDO MUERTO — el esqueleto de lo que nos mata
//
// Mandato del Dueño: «un esqueleto recreado a la perfección del mínimo
// detalle donde se pueda entrar a los módulos crudos: tráfico de
// personas, rutas de órganos, ver pedófilos cerca… y otros 10 módulos
// dentro del esqueleto, repartidos por sus partes, relacionados con la
// muerte».
//
// Trece módulos, uno por región del esqueleto. Datos puros (cero DOM,
// cero red): los usa la página del esqueleto 3D y la ficha de cada
// módulo. REGLAS:
//   · Cada cifra lleva su fuente, su fecha y lo que NO mide.
//   · Nada inventado: si la fuente es una estimación, se dice.
//   · «Depredadores cerca» NO publica nombres ni direcciones: remite a
//     los registros oficiales donde existen (y a sus condiciones de
//     uso) y a las líneas de denuncia de la República Dominicana.
//   · Suicidio: sin métodos, con líneas de ayuda reales.
// Revisado el 2026-11-14.
// ═══════════════════════════════════════════════════════════════════

/** Regiones del esqueleto 3D. Cada patrón se compara con `anatomical_id`
 *  (extras del GLB de Innerscene, CC0). */
export const ZONAS = {
  craneo: "^(hollow_neurocranium|coronal_suture|sagittal_suture|lambdoidal_suture)",
  mandibula: "^(mandible|hyoid|upper_left_tooth|upper_right_tooth|lower_left_tooth|lower_right_tooth)",
  cervicales: "^vertebra_C",
  hombros: "^[LR]_(clavicle|scapula)$",
  brazos: "^[LR]_(humerus|radius|ulna)$",
  manos: "^[LR]_(digit|metacarpal|scaphoid|lunate|triquetrum|pisiform|trapezium|trapezoid|capitate|hamate)",
  costillas: "^(rib_|cartilage_costal)",
  esternon: "^sternum$",
  toracicas: "^vertebra_T",
  lumbares: "^vertebra_L",
  pelvis: "^(hip_bone|sacrum|coccyx|cartilage_pubis)",
  piernas: "^[LR]_(femur|patella|tibia|fibula)$",
  pies: "^[LR]_(talus|calcaneus|navicular|cuboid|medial_cuneiform|intermediate_cuneiform|lateral_cuneiform|metatarsal|toe)",
} as const;

export type ZonaId = keyof typeof ZONAS;

export interface Fuente {
  titulo: string;
  url: string;
  fecha: string;
}
export interface Dato {
  texto: string;
  /** índice en `fuentes` */
  f: number;
}
export interface Ruta {
  de: [number, number];
  a: [number, number];
  etiqueta: string;
  f: number;
}
export interface Caso {
  titulo: string;
  lugar: string;
  anio: string;
  texto: string;
  f: number;
}
export interface Ayuda {
  nombre: string;
  contacto: string;
  nota?: string;
  url?: string;
}
export interface Registro {
  pais: string;
  nombre: string;
  url?: string;
  como: string;
}

export interface ModuloMuerte {
  id: string;
  /** Nombre del módulo */
  nombre: string;
  /** Hueso o región donde vive */
  hueso: string;
  zona: ZonaId;
  /** Color de la marca en el esqueleto */
  color: string;
  cifra: string;
  unidad: string;
  frase: string;
  intro: string;
  datos: Dato[];
  rutas?: Ruta[];
  tituloRutas?: string;
  casos?: Caso[];
  registros?: Registro[];
  senales?: { titulo: string; items: string[]; f?: number };
  ayuda?: Ayuda[];
  /** Muertes al año según la fuente (para el reloj; solo si la cifra es anual) */
  anual?: number;
  limites: string;
  fuentes: Fuente[];
  /** Salas de Vanguard relacionadas */
  relacionadas?: { href: string; label: string }[];
}

/** Líneas de la República Dominicana (verificadas en fuentes públicas). */
const RD_911: Ayuda = { nombre: "Sistema Nacional de Emergencias", contacto: "9-1-1", nota: "24 horas, si hay peligro inmediato." };
const RD_CONANI: Ayuda = { nombre: "CONANI (niñez y adolescencia)", contacto: "809-567-2233", url: "https://conani.gob.do/preguntas-frecuentes-2/" };
const RD_LINEA_VIDA: Ayuda = {
  nombre: "Línea Vida (Procuraduría General)",
  contacto: "809-200-1202",
  nota: "Denuncias de abuso y violencia, confidencial. 8:00 a. m. a 12:00 de la medianoche.",
  url: "https://conani.gob.do/preguntas-frecuentes-2/",
};
const RD_TRATA: Ayuda = {
  nombre: "Línea contra la trata y la explotación (Procuraduría)",
  contacto: "809-200-7393",
  nota: "Línea gratuita «Llama y vive» del departamento contra la trata y el tráfico de personas.",
  url: "https://www.coalicioncorett.com/denuncia?lang=en",
};

export const MODULOS: ModuloMuerte[] = [
  // ─────────────────────────────────────────── CRÁNEO
  {
    id: "pena-de-muerte",
    nombre: "La pena de muerte",
    hueso: "Cráneo",
    zona: "craneo",
    color: "#e8d9b0",
    cifra: "2.707",
    unidad: "ejecuciones registradas en 2025, en 17 países",
    frase: "La muerte que firma un tribunal.",
    intro:
      "Amnistía Internacional contó al menos 2.707 ejecuciones en 2025: la cifra más alta que ha registrado desde 1981 y un 78 % más que en 2024. No incluye a China, donde se cree que se ejecuta a miles de personas cada año, pero la cifra es secreto de Estado.",
    datos: [
      { texto: "Irán ejecutó al menos a 2.159 personas, más del doble que en 2024: el 80 % de todas las ejecuciones registradas.", f: 0 },
      { texto: "Arabia Saudí ejecutó al menos a 356 personas, la mayoría por delitos de drogas. Egipto, a 23.", f: 0 },
      { texto: "Estados Unidos ejecutó a 47 personas, su cifra más alta desde 2009. Florida sola sumó 19. Fue el único país de América que ejecutó.", f: 2 },
      { texto: "1.257 ejecuciones (el 46 %) fueron por delitos de drogas.", f: 1 },
      { texto: "Se dictaron 2.334 nuevas condenas a muerte, y 25.508 personas seguían condenadas a muerte al terminar 2025.", f: 1 },
      { texto: "Japón, Sudán del Sur, Taiwán y los Emiratos Árabes Unidos volvieron a ejecutar tras una pausa.", f: 0 },
      { texto: "Métodos usados en 2025: decapitación, ahorcamiento, inyección letal, fusilamiento y asfixia con gas nitrógeno.", f: 1 },
      { texto: "113 países han abolido la pena de muerte para todos los delitos. En 1977 eran 16.", f: 0 },
    ],
    anual: 2707,
    limites:
      "Son cifras mínimas: Amnistía solo cuenta lo que puede confirmar. China no publica datos, y en Corea del Norte y Vietnam hubo ejecuciones sin información suficiente para dar una cifra creíble.",
    fuentes: [
      { titulo: "Amnistía Internacional · Death Sentences and Executions 2025", url: "https://amnesty.ca/human-rights-news/death-penalty-report-2025-executions-surged-to-highest-recorded-figure-in-44-years/", fecha: "2026-05-18" },
      { titulo: "DW · Executions worldwide hit 40-year high, Amnesty says", url: "https://www.dw.com/en/executions-worldwide-hit-highest-level-since-1981-amnesty-says/a-77175005", fecha: "2026-05-18" },
      { titulo: "Davis Vanguard · Global Executions Surge to 44-Year High", url: "https://davisvanguard.org/2026/05/amnesty-iran-saudi-executions-increase/", fecha: "2026-05-18" },
    ],
  },
  // ─────────────────────────────────────────── MANDÍBULA
  {
    id: "periodistas",
    nombre: "Periodistas asesinados",
    hueso: "Mandíbula, dientes y hioides",
    zona: "mandibula",
    color: "#f2b04a",
    cifra: "129",
    unidad: "periodistas y trabajadores de prensa muertos por su trabajo en 2025",
    frase: "La voz que se calla a tiros.",
    intro:
      "El Comité para la Protección de los Periodistas (CPJ) contó 129 periodistas y trabajadores de prensa muertos en 2025: el año más letal desde que empezó a llevar la cuenta, hace más de tres décadas, y el segundo récord seguido.",
    datos: [
      { texto: "104 de los 129 murieron en relación con un conflicto armado.", f: 1 },
      { texto: "El CPJ atribuye 86 muertes al fuego israelí, la mayoría de periodistas palestinos en Gaza. El ejército israelí «rechaza firmemente» el informe y dice que no ataca a periodistas de forma intencionada.", f: 0 },
      { texto: "El CPJ clasificó 47 muertes como asesinatos selectivos; atribuye el 81 % de ellos a Israel.", f: 0 },
      { texto: "31 trabajadores de medios murieron en un ataque israelí contra un centro de medios hutí en Yemen, en septiembre. Israel lo describió como un aparato de propaganda.", f: 1 },
      { texto: "Fuera de Gaza y Yemen: 9 periodistas muertos en Sudán, 6 en México, 4 en Ucrania a manos de fuerzas rusas y 3 en Filipinas.", f: 1 },
      { texto: "En México, ninguno de los asesinatos de 2025 estaba resuelto cuando se publicó el informe.", f: 2 },
    ],
    anual: 129,
    limites:
      "El CPJ solo cuenta las muertes que puede vincular con el trabajo periodístico y verificar. Las restricciones de acceso a Gaza hacen que la cifra real pueda ser mayor.",
    fuentes: [
      { titulo: "Reuters · Record 129 journalists and media workers killed in 2025, says CPJ", url: "https://kelo.com/2026/02/25/record-129-journalists-and-media-workers-killed-in-2025-mostly-by-israel-says-cpj/", fecha: "2026-02-25" },
      { titulo: "NE Now · Record 129 journalists killed in 2025 (CPJ)", url: "https://nenow.in/world/record-129-journalists-killed-in-2025-two-thirds-in-israeli-strikes-cpj.html", fecha: "2026-02-26" },
      { titulo: "Daily Times · Record number of journalists killed worldwide in 2025", url: "https://dailytimes.com.pk/1456493/record-number-of-journalists-killed-worldwide-in-2025-cpj/", fecha: "2026-02-25" },
    ],
  },
  // ─────────────────────────────────────────── CERVICALES
  {
    id: "sobredosis",
    nombre: "Sobredosis y drogas",
    hueso: "Vértebras cervicales",
    zona: "cervicales",
    color: "#9fd8ff",
    cifra: "600.000",
    unidad: "muertes atribuibles al consumo de drogas en el mundo (OMS, 2019)",
    frase: "Por el cuello baja la orden de respirar. Los opioides la apagan.",
    intro:
      "Según la Organización Mundial de la Salud, unas 600.000 muertes en el mundo se atribuyeron al consumo de drogas en 2019. Casi el 80 % estaban relacionadas con los opioides, que en sobredosis frenan la respiración hasta detenerla.",
    datos: [
      { texto: "Unas 125.000 personas murieron por sobredosis de opioides en 2019.", f: 0 },
      { texto: "Estados Unidos: unas 69.973 muertes por sobredosis previstas en 2025, casi un 14 % menos que las 81.313 de 2024. Es el tercer año seguido de descenso.", f: 1 },
      { texto: "Las muertes con opioides en EE. UU. bajaron de unas 55.296 (2024) a 44.564 (2025).", f: 1 },
      { texto: "Algunos estados subieron: Nuevo México, Arizona y Colorado registraron más muertes que en 2024.", f: 1 },
      { texto: "Los opioides siguen siendo la primera causa de las sobredosis mortales en Estados Unidos.", f: 2 },
    ],
    anual: 600000,
    limites:
      "La cifra mundial es de 2019: es la última estimación comparable de la OMS. Los datos de EE. UU. de 2025 son provisionales: cada sobredosis exige una investigación toxicológica larga y las cifras pueden cambiar.",
    fuentes: [
      { titulo: "OMS · Opioid overdose (nota descriptiva)", url: "https://www.who.int/news-room/fact-sheets/detail/opioid-overdose", fecha: "2025-08-29" },
      { titulo: "ConsumerAffairs · CDC: U.S. drug overdose deaths are falling", url: "https://www.consumeraffairs.com/news/us-drug-overdose-deaths-are-falling-but-the-numbers-still-tell-a-serious-story-052626.html", fecha: "2026-05-26" },
      { titulo: "The Hill · CDC reports fatal drug overdoses fell for third straight year", url: "https://thehill.com/policy/healthcare/5876308-overdose-deaths-drop-three-years/", fecha: "2026-05-13" },
    ],
    relacionadas: [{ href: "/global-danger", label: "Global Danger" }],
  },
  // ─────────────────────────────────────────── HOMBROS
  {
    id: "suicidio",
    nombre: "Suicidio",
    hueso: "Clavículas y escápulas · los hombros",
    zona: "hombros",
    color: "#b8a9ff",
    cifra: "727.000",
    unidad: "personas murieron por suicidio en 2021 (OMS)",
    frase: "El peso que se carga en los hombros, en silencio.",
    intro:
      "La OMS estima que 727.000 personas murieron por suicidio en 2021. Detrás de cada cifra hay alguien que, muchas veces, avisó. Si estás pensando en quitarte la vida, no estás solo: abajo tienes a quién llamar ahora mismo.",
    datos: [
      { texto: "Es la tercera causa de muerte entre los jóvenes de 15 a 29 años: la segunda entre las mujeres y la tercera entre los hombres de esa edad.", f: 0 },
      { texto: "El 73 % de los suicidios ocurre en países de ingresos bajos y medianos.", f: 0 },
      { texto: "Más de la mitad (56 %) ocurre antes de los 50 años.", f: 0 },
      { texto: "En la República Dominicana, el Ministerio de Salud recuerda que una amenaza de suicidio es una emergencia y que hay que actuar siempre, aunque parezca manipulación.", f: 1 },
    ],
    ayuda: [
      RD_911,
      { nombre: "Línea de psicología y psiquiatría", contacto: "*462", url: "https://www.diariolibre.com/actualidad/salud/2022/09/09/lineas-de-ayuda-para-prevencion-de-suicidios-en-rd/2055738" },
      { nombre: "Salud Mental, Ministerio de Salud", contacto: "809-544-4223", nota: "En horario laboral." },
      { nombre: "Línea Familiar Contigo (UNICEF y Colegio Dominicano de Psicólogos)", contacto: "809-636-3507 · WhatsApp 849-258-4479", url: "https://elavancemedia.com/hoy-se-conmemora-el-dia-mundial-para-la-prevencion-del-suicidio-lineas-de-ayuda-en-rd/" },
      { nombre: "Unidades de intervención en crisis", contacto: "Hospitales Moscoso Puello, Salvador B. Gautier, Darío Contreras, Marcelino Vélez y Maternidad de Los Mina; también en Santiago, Barahona y San Juan de la Maguana." },
    ],
    anual: 727000,
    limites:
      "Son estimaciones de la OMS: en muchos países el registro de las muertes es incompleto y el estigma hace que no todos los suicidios se registren como tales. Esta ficha no describe métodos a propósito.",
    fuentes: [
      { titulo: "OMS · Suicide worldwide in 2021: global health estimates", url: "https://www.who.int/publications/i/item/9789240110069", fecha: "2025-05-23" },
      { titulo: "Diario Libre · Líneas de ayuda para prevención de suicidios en RD", url: "https://www.diariolibre.com/actualidad/salud/2022/09/09/lineas-de-ayuda-para-prevencion-de-suicidios-en-rd/2055738", fecha: "2022-09-09" },
      { titulo: "El Avance · Día Mundial para la Prevención del Suicidio; líneas de ayuda en RD", url: "https://elavancemedia.com/hoy-se-conmemora-el-dia-mundial-para-la-prevencion-del-suicidio-lineas-de-ayuda-en-rd/", fecha: "2024-09-10" },
    ],
  },
  // ─────────────────────────────────────────── BRAZOS
  {
    id: "depredadores",
    nombre: "Depredadores cerca",
    hueso: "Húmeros, radios y cúbitos · los brazos",
    zona: "brazos",
    color: "#ff5a6e",
    cifra: "20,5 millones",
    unidad: "denuncias de explotación sexual infantil recibidas por la CyberTipline de NCMEC en 2024",
    frase: "Los brazos que deberían proteger.",
    intro:
      "Cómo saber si hay agresores sexuales condenados cerca de ti, usando solo los registros oficiales y públicos que existen. Vanguard no publica nombres ni direcciones: los registros cambian, pueden tener errores y una lista copiada puede señalar a un inocente. Aquí tienes dónde consultar, cómo reconocer las señales y dónde denunciar.",
    datos: [
      { texto: "NCMEC (EE. UU.) recibió más de 20,5 millones de denuncias de presunta explotación sexual infantil en 2024, con casi 63 millones de archivos.", f: 0 },
      { texto: "Las denuncias de captación de menores por internet (online enticement) pasaron de 186.819 en 2023 a 546.333 en 2024: un 192 % más.", f: 0 },
      { texto: "67.000 denuncias tuvieron que ver con contenido generado por inteligencia artificial: un 1.325 % más que en 2023.", f: 0 },
      { texto: "3 de cada 5 víctimas sufren el abuso de alguien que conocen en su entorno, fuera de internet.", f: 0 },
      { texto: "En la sextorsión económica (chantaje por dinero), los chicos adolescentes han sido las víctimas más frecuentes en los casos recientes.", f: 1 },
    ],
    registros: [
      {
        pais: "Estados Unidos",
        nombre: "NSOPW · Registro Público Nacional de Agresores Sexuales (Departamento de Justicia)",
        url: "https://www.nsopw.gov",
        como: "Búsqueda gratuita por nombre o por dirección, que une los registros públicos de todos los estados, territorios y tribus. Sus condiciones de uso advierten: usar esa información para amenazar, intimidar o acosar a alguien puede acarrear persecución penal o responsabilidad civil.",
      },
      {
        pais: "Reino Unido (Inglaterra y Gales)",
        nombre: "Child Sex Offender Disclosure Scheme («Ley de Sarah»)",
        como: "No hay lista pública: un padre, madre o tutor puede preguntar a la policía si una persona con acceso a un niño tiene antecedentes de delitos sexuales contra menores.",
      },
      {
        pais: "República Dominicana",
        nombre: "Sin registro público de agresores sexuales",
        como: "No existe un registro público consultable. Si sospechas de un abuso, denúncialo en las líneas de abajo o en la fiscalía más cercana, aunque sea de forma anónima.",
      },
    ],
    senales: {
      titulo: "Señales de alerta de captación (grooming)",
      items: [
        "Un adulto pide al niño que guarde secretos «solo entre los dos».",
        "Regalos, dinero o recargas sin motivo, y favores que crean deuda.",
        "Lleva la conversación a aplicaciones privadas o a mensajes que se borran.",
        "Pide fotos, primero inocentes y luego íntimas, y después amenaza con publicarlas.",
        "Intenta aislar al niño de su familia o de sus amigos.",
        "Contacto excesivo, a deshoras, o interés insistente por quedar a solas.",
      ],
      f: 1,
    },
    ayuda: [
      RD_911,
      RD_CONANI,
      RD_LINEA_VIDA,
      RD_TRATA,
      { nombre: "PECDA (crímenes de alta tecnología)", contacto: "Fiscalía · Procuraduría Especializada", nota: "Cuando haya pruebas digitales: chats, fotos, perfiles." },
      { nombre: "CyberTipline de NCMEC (internacional)", contacto: "report.cybertip.org", url: "https://report.cybertip.org" },
    ],
    limites:
      "Las cifras de NCMEC son denuncias, no casos comprobados, y suben también cuando las plataformas denuncian más (en 2024 la ley REPORT Act obligó a denunciar la captación). Los registros públicos solo incluyen a personas condenadas, no a todos los agresores.",
    fuentes: [
      { titulo: "Safer (Thorn) · Online child sexual abuse and exploitation statistics (datos NCMEC 2024)", url: "https://safer.io/resources/csam-problem-of-epidemic-proportions/", fecha: "2026-03-04" },
      { titulo: "NCMEC · Sextortion", url: "https://www.ncmec.org/theissues/sextortion", fecha: "2024" },
      { titulo: "NSOPW · Conditions of use (registros tribales enlazados)", url: "https://jemez.nsopw.gov/ConditionsOfUse/true", fecha: "consultado 2026-11-14" },
      { titulo: "CONANI · ¿Cómo puedo denunciar un caso de abuso infantil?", url: "https://conani.gob.do/preguntas-frecuentes-2/", fecha: "consultado 2026-11-14" },
      { titulo: "El Demócrata · ¿Dónde denunciar abuso infantil en RD?", url: "https://eldemocrata.do/donde-y-a-quien-acudir-para-denunciar-hechos-de-abuso-infantil-en-republica-dominicana/", fecha: "2025-11-20" },
    ],
  },
  // ─────────────────────────────────────────── MANOS
  {
    id: "trabajo",
    nombre: "Muertes en el trabajo",
    hueso: "Manos: carpos, metacarpos y falanges",
    zona: "manos",
    color: "#f0d36b",
    cifra: "2,93 millones",
    unidad: "trabajadores mueren cada año por causas laborales (OIT)",
    frase: "Las manos que levantan el mundo, y lo que les cuesta.",
    intro:
      "La Organización Internacional del Trabajo estima que 2,93 millones de trabajadores mueren cada año por causas ligadas a su trabajo. La gran mayoría no muere en un accidente, sino por enfermedades que el trabajo provoca durante años.",
    datos: [
      { texto: "2,6 millones de esas muertes se deben a enfermedades laborales y unas 330.000 a accidentes de trabajo (estimación de 2019).", f: 0 },
      { texto: "395 millones de trabajadores sufren cada año una lesión laboral no mortal.", f: 0 },
      { texto: "2.410 millones de trabajadores están expuestos cada año a un calor excesivo.", f: 0 },
      { texto: "El factor de riesgo que más muertes causa son las jornadas de trabajo largas; le siguen el polvo, los gases y los humos.", f: 1 },
      { texto: "Los accidentes y las enfermedades laborales cuestan el 5,4 % del PIB mundial al año.", f: 1 },
    ],
    anual: 2930000,
    limites:
      "Es una estimación con datos de 2019. Muchos países no registran las enfermedades laborales mortales: la OIT cita un país con 1.972 accidentes mortales y cero enfermedades laborales mortales registradas en 2023.",
    fuentes: [
      { titulo: "OIT · We need to come together to renew our commitment to occupational safety and health", url: "https://www.ilo.org/resource/statement/we-need-come-together-renew-our-commitment-occupational-safety-and-health", fecha: "2025-04-29" },
      { titulo: "OIT · Safety and health at work (ficha)", url: "https://www.ilo.org/media/372546/download", fecha: "2023" },
    ],
  },
  // ─────────────────────────────────────────── COSTILLAS
  {
    id: "trata",
    nombre: "Tráfico de personas",
    hueso: "Costillas y cartílagos · la jaula torácica",
    zona: "costillas",
    color: "#ff3b30",
    cifra: "38 %",
    unidad: "de las víctimas de trata detectadas en el mundo son niños y niñas",
    frase: "Una jaula hecha de huesos: así se vive dentro de la trata.",
    intro:
      "La Oficina de las Naciones Unidas contra la Droga y el Delito (UNODC) detectó en 2022 un 25 % más de víctimas de trata que en 2019. Los niños ya son el 38 %. La trata para trabajo forzoso crece, y una forma nueva se extiende: obligar a las víctimas a cometer estafas por internet.",
    datos: [
      { texto: "Las víctimas detectadas subieron un 25 % entre 2019 y 2022; las detectadas para trabajo forzoso, un 47 %.", f: 1 },
      { texto: "Los niños detectados subieron un 31 %, y las niñas, un 38 %.", f: 1 },
      { texto: "Mujeres y niñas son el 61 % de las víctimas detectadas. El 60 % de las niñas fue explotada sexualmente; el 45 % de los niños, en trabajo forzoso.", f: 0 },
      { texto: "La criminalidad forzada (incluidas las estafas por internet) pasó del 1 % de las víctimas en 2016 al 8 % en 2022.", f: 0 },
      { texto: "En 2022 se detectaron víctimas de al menos 162 nacionalidades en 128 países de destino.", f: 0 },
      { texto: "La ONU estimó que al menos 120.000 personas en Myanmar y unas 100.000 en Camboya estaban atrapadas y obligadas a hacer estafas por internet.", f: 2 },
      { texto: "La OIT, Walk Free y la OIM estimaron que 49,6 millones de personas vivían en esclavitud moderna en un día cualquiera de 2021.", f: 3 },
      { texto: "La República Dominicana es país de origen, de tránsito y de destino de víctimas, según la OIM, citada por ECPAT.", f: 4 },
    ],
    tituloRutas: "Rutas documentadas",
    rutas: [
      { de: [-1.29, 36.82], a: [16.69, 98.51], etiqueta: "Kenia → centros de estafa en Myanmar", f: 2 },
      { de: [-23.55, -46.63], a: [16.69, 98.51], etiqueta: "Brasil → Myanmar", f: 2 },
      { de: [41.01, 28.97], a: [16.69, 98.51], etiqueta: "Turquía → Myanmar", f: 2 },
      { de: [28.61, 77.21], a: [10.63, 103.52], etiqueta: "Asia del Sur → Camboya", f: 2 },
      { de: [18.59, -72.31], a: [18.47, -69.9], etiqueta: "Haití → República Dominicana (niños y adolescentes)", f: 4 },
      { de: [18.47, -69.9], a: [-34.6, -58.38], etiqueta: "República Dominicana → Argentina (explotación sexual)", f: 4 },
    ],
    ayuda: [
      RD_911,
      RD_TRATA,
      { nombre: "CITIM · Comisión contra la Trata (Ministerio de Relaciones Exteriores)", contacto: "Buzón de denuncias virtuales", url: "https://servicios360.mirex.gob.do/buzon-de-denuncias-virtuales/" },
    ],
    limites:
      "UNODC cuenta las víctimas que las autoridades detectan, no todas las que existen: la trata es un delito oculto y ningún conjunto de datos mide su tamaño real. Un aumento puede deberse también a que se detecta mejor.",
    fuentes: [
      { titulo: "UNODC · Global Report on Trafficking in Persons 2024 (ReliefWeb)", url: "https://reliefweb.int/report/world/global-report-trafficking-persons-2024", fecha: "2024-12-11" },
      { titulo: "DevelopmentAid · UNODC global human trafficking report", url: "https://www.developmentaid.org/news-stream/post/189024/unodc-human-trafficking-report", fecha: "2024-12-11" },
      { titulo: "OCCRP · UN Report: Thousands trapped, forced into criminal activities in Southeast Asia (ACNUDH)", url: "https://www.occrp.org/en/news/un-report-thousands-trapped-forced-into-criminal-activities-in-south-east-asia", fecha: "2023-08-31" },
      { titulo: "We Are Not For Sale · Human trafficking statistics (OIT, Walk Free, OIM)", url: "https://wearenotforsale.org/human-trafficking/human-trafficking-statistics/", fecha: "2026-10-30" },
      { titulo: "ECPAT · Monitoreo global: República Dominicana", url: "https://ecpat.org/wp-content/uploads/2021/08/Global_Monitoring_Report-DOMINICAN_REPUBLIC.pdf", fecha: "2021" },
    ],
  },
  // ─────────────────────────────────────────── ESTERNÓN
  {
    id: "feminicidios",
    nombre: "Feminicidios",
    hueso: "Esternón · delante del corazón",
    zona: "esternon",
    color: "#ff7aa8",
    cifra: "50.000",
    unidad: "mujeres y niñas asesinadas por su pareja o un familiar en 2024",
    frase: "El esternón protege el corazón. La casa, para muchas, no.",
    intro:
      "Según la UNODC y ONU Mujeres, 83.000 mujeres y niñas fueron asesinadas intencionadamente en 2024. Unas 50.000 (el 60 %) murieron a manos de su pareja o de un familiar: 137 al día, casi una cada diez minutos.",
    datos: [
      { texto: "Entre los hombres, solo el 11 % de los homicidios los comete la pareja o un familiar.", f: 0 },
      { texto: "Tasa de feminicidio por pareja o familia: África 3 por cada 100.000 mujeres, América 1,5, Oceanía 1,4, Asia 0,7 y Europa 0,5.", f: 0 },
      { texto: "La estimación se basa en datos de 117 países.", f: 1 },
      { texto: "En 2023 la cifra fue de 51.100: la diferencia se debe sobre todo a qué países dieron datos, no a un descenso real.", f: 0 },
      { texto: "La ONU advierte que la violencia digital (acoso, amenazas, vigilancia) puede pasar al mundo físico y terminar en feminicidio.", f: 0 },
    ],
    ayuda: [RD_911, RD_LINEA_VIDA],
    anual: 50000,
    limites:
      "Solo mide los asesinatos dentro de la pareja o la familia, donde hay datos comparables. De los feminicidios fuera del hogar hay muy pocos datos.",
    fuentes: [
      { titulo: "UNODC y ONU Mujeres · Femicide Brief 2025 (UNODC Brasil)", url: "https://www.unodc.org/cofrb/en/noticias/2026/04/unodc-brazil--un-women-and-national-high-court-of-brazil-launch-portuguese-version-of-global-report-on-femicide.html", fecha: "2026-04-10" },
      { titulo: "CBS News · 137 women and girls killed every day by partners or family", url: "https://www.cbsnews.com/news/united-nations-femicide-report-violence-domestic-intimate-partner/", fecha: "2025-11-25" },
    ],
  },
  // ─────────────────────────────────────────── TORÁCICAS
  {
    id: "aire-toxico",
    nombre: "Aire tóxico",
    hueso: "Vértebras torácicas · donde se apoyaban los pulmones",
    zona: "toracicas",
    color: "#8fe3c3",
    cifra: "7 millones",
    unidad: "muertes prematuras al año por la contaminación del aire (OMS)",
    frase: "Aquí se apoyaban los pulmones. Respiraban esto.",
    intro:
      "La OMS asocia la contaminación del aire exterior y la del interior de los hogares con unos 7 millones de muertes prematuras cada año. Nueve de cada diez personas respiran un aire que no cumple las recomendaciones de la OMS.",
    datos: [
      { texto: "Unos 2.100 millones de personas están expuestas a niveles peligrosos de humo en casa: cocinan con fuego abierto o estufas simples de queroseno, leña, estiércol, residuos agrícolas o carbón.", f: 0 },
      { texto: "Las partículas finas del aire causan derrames cerebrales, enfermedades del corazón, cáncer de pulmón y enfermedades respiratorias.", f: 0 },
      { texto: "Las fuentes principales: los aparatos de combustión de los hogares, los vehículos, la industria y los incendios forestales.", f: 0 },
    ],
    anual: 7000000,
    limites:
      "Son muertes atribuibles estimadas con modelos: nadie muere con «contaminación» escrita en el certificado, sino de un infarto o un cáncer que el aire hizo más probable.",
    fuentes: [{ titulo: "OMS · Air pollution", url: "https://www.who.int/health-topics/air-pollution", fecha: "consultado 2026-11-14" }],
    relacionadas: [{ href: "/global-danger", label: "Global Danger: el aire medido hoy" }],
  },
  // ─────────────────────────────────────────── LUMBARES
  {
    id: "organos",
    nombre: "Rutas de órganos",
    hueso: "Vértebras lumbares · donde se apoyan los riñones",
    zona: "lumbares",
    color: "#d63d3d",
    cifra: "5–10 %",
    unidad: "de los trasplantes de riñón del mundo vendrían del comercio de órganos (estimación de la OMS)",
    frase: "Detrás de estas vértebras están los riñones: el órgano más traficado.",
    intro:
      "En 2007, una consulta mundial de la OMS estimó que entre el 5 % y el 10 % de los trasplantes de riñón que se hacen cada año en el mundo proceden del comercio de órganos. Es un mercado que se alimenta de personas pobres, migrantes y desplazados, a los que se promete dinero o un pasaje.",
    datos: [
      { texto: "El riñón es el órgano más traficado porque se puede vivir con uno solo.", f: 3 },
      { texto: "Global Financial Integrity sitúa el comercio ilegal de órganos entre los diez delitos más lucrativos del mundo, con beneficios ilegales de 614 a 1.200 millones de dólares al año.", f: 0 },
      { texto: "Una revisión científica documentó a 6.002 pacientes que se trasplantaron en el extranjero; 1.238 de los casos incluían una compraventa.", f: 0 },
      { texto: "El informe mundial de la UNODC de 2018 identificó más de 700 casos de trata para extracción de órganos, la mayoría en Oriente Medio y el norte de África.", f: 1 },
      { texto: "Comprar o vender un órgano es ilegal en todo el mundo, salvo en Irán.", f: 1 },
      { texto: "Solo se cubre en torno al 10 % de la demanda mundial de trasplantes cada año.", f: 1 },
    ],
    tituloRutas: "Casos documentados y sus rutas",
    rutas: [
      { de: [13.63, 25.35], a: [30.04, 31.24], etiqueta: "Darfur (Sudán) → El Cairo", f: 1 },
      { de: [6.52, 3.38], a: [51.51, -0.13], etiqueta: "Lagos → Londres", f: 1 },
      { de: [47.01, 28.86], a: [42.66, 21.16], etiqueta: "Moldavia → Clínica Medicus (Kosovo)", f: 2 },
      { de: [41.01, 28.97], a: [42.66, 21.16], etiqueta: "Turquía → Kosovo", f: 2 },
      { de: [43.24, 76.89], a: [42.66, 21.16], etiqueta: "Kazajistán → Kosovo", f: 2 },
      { de: [55.75, 37.62], a: [42.66, 21.16], etiqueta: "Rusia → Kosovo", f: 2 },
      { de: [32.08, 34.78], a: [42.66, 21.16], etiqueta: "Receptores (sobre todo de Israel) → Kosovo", f: 2 },
      { de: [-8.05, -34.9], a: [-29.86, 31.02], etiqueta: "Pacientes de Brasil → Durban", f: 3 },
      { de: [32.08, 34.78], a: [-29.86, 31.02], etiqueta: "Pacientes de Israel → Durban", f: 3 },
    ],
    casos: [
      {
        titulo: "«Ve ahora, paga después»",
        lugar: "Jartum → El Cairo",
        anio: "2023",
        texto:
          "Personas de Darfur salían de Jartum hacia El Cairo con la promesa de cruzar el Mediterráneo y pagar después. Al llegar, las obligaban a entregar un riñón como precio para seguir el viaje.",
        f: 1,
      },
      {
        titulo: "El primer juicio por tráfico de órganos en el Reino Unido",
        lugar: "Lagos → Londres",
        anio: "2023",
        texto:
          "Un político nigeriano, su esposa y un intermediario fueron condenados por conspirar para llevar a un hombre desde Lagos al Reino Unido para quitarle un riñón.",
        f: 1,
      },
      {
        titulo: "La clínica Medicus",
        lugar: "Pristina, Kosovo",
        anio: "2008 · condenas en 2013",
        texto:
          "Unos 30 trasplantes ilegales de riñón. Donantes pobres de Turquía, Rusia, Moldavia y Kazajistán a los que se prometían hasta 15.000 euros; los receptores, sobre todo israelíes, pagaban más de 70.000. El dueño de la clínica fue condenado a 8 años de cárcel.",
        f: 2,
      },
      {
        titulo: "El hospital St. Augustine's",
        lugar: "Durban, Sudáfrica",
        anio: "2001–2003",
        texto: "Más de 100 trasplantes ilegales de riñón, según los registros de la policía.",
        f: 3,
      },
      {
        titulo: "La redada de 2016",
        lugar: "Egipto",
        anio: "2016",
        texto: "45 detenidos, entre ellos médicos de hospitales prestigiosos, empresarios e intermediarios de una red de tráfico de órganos.",
        f: 3,
      },
    ],
    ayuda: [RD_911, RD_TRATA],
    limites:
      "El comercio es clandestino y casi nada se registra. La propia OMS califica sus cifras de «provisionales y tentativas», y no está claro cómo las corroboró. Las rutas del mapa son casos juzgados o documentados por periodistas, no el mercado entero.",
    fuentes: [
      { titulo: "Ambagtsheer et al. · On Patients Who Purchase Organ Transplants Abroad (American Journal of Transplantation)", url: "https://www.sciencedirect.com/science/article/pii/S160061352200716X", fecha: "2016" },
      { titulo: "The Guardian · Inside the global illegal organ trade", url: "https://www.theguardian.com/news/article/2024/sep/10/for-me-there-was-no-other-choice-inside-the-global-organ-trade", fecha: "2024-09-10" },
      { titulo: "Balkan Insight · Kosovo convicts five over human organ trafficking", url: "https://balkaninsight.com/2013/04/29/kosovo-convicts-five-over-human-organ-trafficking/", fecha: "2013-04-29" },
      { titulo: "Fair Planet · Illegal organ trafficking in Africa", url: "https://www.fairplanet.org/story/a-penny-for-a-kidney-illegal-organ-trafficking-in-africa/", fecha: "2020-05-07" },
      { titulo: "Delmonico · Organ Trafficking and Transplant Tourism (American Journal of Transplantation)", url: "https://www.amjtransplant.org/article/S1600-6135(22)05825-7/fulltext", fecha: "2008-05-01" },
    ],
  },
  // ─────────────────────────────────────────── PELVIS
  {
    id: "muerte-materna",
    nombre: "Muerte materna",
    hueso: "Pelvis: coxales, sacro y cóccix",
    zona: "pelvis",
    color: "#ffb38a",
    cifra: "260.000",
    unidad: "mujeres murieron por el embarazo o el parto en 2023 (OMS)",
    frase: "La pelvis que da la vida. Y donde, cada dos minutos, una madre la pierde.",
    intro:
      "Unas 260.000 mujeres murieron en 2023 durante el embarazo, el parto o después: más de 700 al día, una cada dos minutos. La mayoría de esas muertes se podían evitar.",
    datos: [
      { texto: "El 92 % ocurre en países de ingresos bajos y medianos bajos.", f: 0 },
      { texto: "África subsahariana concentra cerca del 70 % (182.000) y Asia meridional el 17 % (43.000).", f: 0 },
      { texto: "En los países de ingresos bajos mueren 346 madres por cada 100.000 nacidos vivos; en los de ingresos altos, 10.", f: 0 },
      { texto: "En las zonas en conflicto la tasa sube a 504, frente a 99 en los países sin conflicto ni fragilidad.", f: 0 },
      { texto: "37 países en conflicto o fragilidad suman el 61 % de las muertes maternas con solo el 25 % de los nacimientos.", f: 0 },
      { texto: "Desde 2000 la tasa ha bajado un 40 %: aquel año murieron unas 443.000 mujeres.", f: 1 },
    ],
    anual: 260000,
    limites: "Son estimaciones conjuntas de la OMS, UNICEF, el UNFPA, el Banco Mundial y la ONU, con un margen de entre 230.000 y 309.000 muertes.",
    fuentes: [
      { titulo: "OMS · Maternal mortality (nota descriptiva)", url: "https://www.who.int/news-room/fact-sheets/detail/maternal-mortality", fecha: "2025-04-07" },
      { titulo: "OMS, UNICEF, UNFPA, Banco Mundial y ONU · Trends in maternal mortality 2000 to 2023", url: "https://www.unfpa.org/sites/default/files/pub-pdf/9789240108462-eng.pdf", fecha: "2025" },
    ],
  },
  // ─────────────────────────────────────────── PIERNAS
  {
    id: "trafico-vial",
    nombre: "Muertes en la carretera",
    hueso: "Fémures, rótulas, tibias y peronés · las piernas",
    zona: "piernas",
    color: "#ffd166",
    cifra: "1,16 millones",
    unidad: "personas mueren cada año en accidentes de tráfico (OMS)",
    frase: "Las piernas que cruzaban la calle.",
    intro:
      "Según la OMS, cerca de 1,16 millones de personas mueren cada año en las carreteras. Es la primera causa de muerte de los niños y jóvenes de 5 a 29 años.",
    datos: [
      { texto: "El 92 % de las muertes en carretera ocurre en países de ingresos bajos y medianos, que tienen alrededor del 60 % de los vehículos del mundo.", f: 0 },
      { texto: "Más de la mitad de los muertos son peatones, ciclistas y motoristas.", f: 0 },
      { texto: "Dos tercios de los muertos tienen edad de trabajar: entre 18 y 59 años.", f: 0 },
      { texto: "La ONU se propuso reducir a la mitad las muertes y lesiones de tráfico para 2030.", f: 1 },
    ],
    anual: 1160000,
    limites: "Muchos países registran mal las muertes en carretera; la OMS corrige esos registros con modelos, por eso sus cifras superan a menudo las oficiales.",
    fuentes: [
      { titulo: "OMS · Road traffic injuries (nota descriptiva)", url: "https://www.who.int/news-room/fact-sheets/detail/road-traffic-injuries", fecha: "2026-07-20" },
      { titulo: "OMS · Global status report on road safety 2023", url: "https://www.who.int/teams/social-determinants-of-health/safety-and-mobility/global-status-report-on-road-safety-2023", fecha: "2023-12-13" },
    ],
  },
  // ─────────────────────────────────────────── PIES
  {
    id: "migrantes",
    nombre: "Migrantes muertos en el camino",
    hueso: "Pies: tarsos, metatarsos y falanges",
    zona: "pies",
    color: "#6fb7ff",
    cifra: "7.904",
    unidad: "personas murieron o desaparecieron en rutas migratorias en 2025 (OIM)",
    frase: "Los pies que caminaron hasta donde no llegaron.",
    intro:
      "El Proyecto Migrantes Desaparecidos de la OIM documentó 7.904 muertes y desapariciones en rutas migratorias en 2025. Desde 2014 ya son más de 80.000. La OIM insiste en que es solo el mínimo.",
    datos: [
      { texto: "2024 fue el año récord, con unas 9.200 muertes y desapariciones.", f: 0 },
      { texto: "Unas 3.400 personas murieron o desaparecieron en las rutas por mar hacia Europa: 1.330 en el Mediterráneo central y más de 1.200 en la ruta atlántica hacia Canarias.", f: 0 },
      { texto: "Casi 900 en el golfo de Bengala y el mar de Andamán, una ruta que usan casi solo refugiados rohinyás: el peor año registrado en esa ruta.", f: 0 },
      { texto: "En América cayeron con fuerza los viajes hacia el norte por Centroamérica, tras el cambio de política migratoria de EE. UU. y el cierre de la frontera sur.", f: 1 },
      { texto: "Al menos 1.500 personas más fueron dadas por desaparecidas en el mar sin que se pudiera verificar.", f: 2 },
      { texto: "Unas 340.000 familias o allegados sufren directamente la desaparición de un migrante desde 2014.", f: 0 },
    ],
    tituloRutas: "Las rutas más letales de 2025",
    rutas: [
      { de: [32.89, 13.19], a: [35.5, 12.6], etiqueta: "Libia → Lampedusa: Mediterráneo central (1.330)", f: 0 },
      { de: [20.94, -17.04], a: [28.29, -16.63], etiqueta: "África occidental → Canarias (más de 1.200)", f: 0 },
      { de: [21.43, 92.0], a: [5.55, 95.32], etiqueta: "Bangladés y Myanmar → Indonesia y Malasia (casi 900)", f: 0 },
      { de: [8.4, -77.6], a: [31.7, -106.4], etiqueta: "Darién → frontera de EE. UU. (fuerte descenso)", f: 1 },
    ],
    anual: 7904,
    limites:
      "La OIM advierte que la bajada de 2025 también se debe a que hay menos información y menos dinero para documentar las muertes, sobre todo en EE. UU. y México.",
    fuentes: [
      { titulo: "Euronews · Almost 8,000 people died or disappeared on migration routes in 2025, IOM says", url: "https://www.euronews.com/2026/04/21/almost-8000-people-died-or-disappeared-on-migration-routes-in-2025-iom-says", fecha: "2026-04-21" },
      { titulo: "Arab News (AFP) · 7,900 people died, disappeared on migration routes in 2025", url: "https://www.arabnews.com/node/2640735/world", fecha: "2026-04-21" },
      { titulo: "UN Web TV · UN / IOM migrant deaths 2025", url: "https://media.un.org/unifeed/en/asset/d353/d3539494", fecha: "2026-02-26" },
    ],
  },
];

export function moduloPorId(id: string): ModuloMuerte | undefined {
  return MODULOS.find((m) => m.id === id);
}

/** Versión ligera para el cliente (el visor 3D no necesita las fichas enteras). */
export interface ModuloLigero {
  id: string;
  nombre: string;
  hueso: string;
  zona: ZonaId;
  color: string;
  cifra: string;
  unidad: string;
  frase: string;
  anual?: number;
}
export function modulosLigeros(): ModuloLigero[] {
  return MODULOS.map(({ id, nombre, hueso, zona, color, cifra, unidad, frase, anual }) => ({ id, nombre, hueso, zona, color, cifra, unidad, frase, anual }));
}

/** Proyección equirectangular sobre el mapa 1000×500 de /abandonados/mundo.svg */
export function proyectarMM(lat: number, lon: number): { x: number; y: number } {
  return { x: ((lon + 180) / 360) * 1000, y: ((90 - lat) / 180) * 500 };
}
