import type { Articulo } from "../tipos";

// v417.0 — HISTORIA DE LAS CIVILIZACIONES Y CULTURAS Y SOCIEDADES.

export const HISTORIA: Articulo[] = [
  {
    slug: "mesopotamia",
    titulo: "Mesopotamia",
    categoria: "civilizaciones",
    bajada: "La tierra entre el Tigris y el Éufrates, donde surgieron algunas de las primeras ciudades, la escritura, las leyes escritas y los primeros imperios.",
    introduccion: [
      "Mesopotamia —«tierra entre ríos», en griego— es la región histórica comprendida entre los ríos Tigris y Éufrates, que corresponde en su mayor parte al actual Irak y a partes de Siria y Turquía. Allí, a partir del IV milenio a. C., se desarrolló una de las primeras civilizaciones urbanas del mundo.",
      "En sus ciudades se inventó la escritura, se compilaron algunas de las primeras leyes escritas, se dividió el tiempo en unidades basadas en el número 60 —que aún usamos para las horas, los minutos y los grados— y se escribieron obras literarias como la Epopeya de Gilgamesh. Sumerios, acadios, babilonios y asirios se sucedieron y convivieron en la región a lo largo de tres milenios.",
    ],
    secciones: [
      {
        titulo: "Ríos, riego y ciudades",
        parrafos: [
          "El sur de Mesopotamia es una llanura aluvial muy fértil pero de lluvias escasas. Su agricultura dependía del riego: canales y diques llevaban el agua de los ríos a los campos de cebada y palmeras datileras, y obligaban a coordinar el trabajo de muchas personas. Las crecidas, irregulares y a veces violentas, y la salinización progresiva de los suelos por el riego fueron problemas constantes.",
          "Hacia el 3500-3100 a. C., en el llamado periodo de Uruk, surgieron verdaderas ciudades. Uruk, la mayor de ellas, pudo reunir decenas de miles de habitantes y estaba presidida por grandes templos. Cada ciudad-Estado sumeria —Ur, Lagash, Nippur, Eridu, Kish— se consideraba propiedad de un dios, y el templo, con sus tierras, rebaños y talleres, era también un centro económico.",
          "El edificio más característico era el zigurat, una torre escalonada de adobe con un santuario en la cima. El zigurat de Ur, construido hacia el siglo XXI a. C. por el rey Ur-Nammu y restaurado en el siglo XX, es el mejor conservado y una de las fuentes probables del relato bíblico de la torre de Babel.",
        ],
      },
      {
        titulo: "La invención de la escritura",
        parrafos: [
          "La escritura nació en Mesopotamia como herramienta de administración. Antes de ella, los contables de los templos usaban fichas de arcilla para registrar cantidades de bienes. Hacia el 3300-3200 a. C., en Uruk, aparecieron tablillas con signos pictográficos que representaban productos y números. Con el tiempo los signos se simplificaron y se imprimieron en la arcilla húmeda con un cálamo de caña, dejando marcas en forma de cuña: de ahí el nombre de escritura cuneiforme.",
          "El cuneiforme pasó de registrar cuentas a escribir lenguas completas y se adaptó a idiomas muy distintos: el sumerio, el acadio, el hitita o el elamita. Se utilizó durante más de tres mil años; las últimas tablillas conocidas son del siglo I. Se han recuperado cientos de miles de tablillas, que contienen contratos, cartas, listas de reyes, tratados de matemáticas y astronomía, himnos y literatura.",
        ],
      },
      {
        titulo: "Leyes, ciencia y literatura",
        parrafos: [
          "El Código de Hammurabi, promulgado por el rey de Babilonia hacia 1754 a. C., es la recopilación de leyes más completa que se conserva de la Antigüedad oriental. Está grabado en una estela de basalto de más de dos metros de altura, hoy en el Museo del Louvre, encabezada por una imagen del rey ante el dios Shamash. Sus 282 disposiciones regulan el comercio, la familia, la propiedad, los salarios o la responsabilidad profesional, y aplican penas que varían según la condición social de las personas. Aunque es famoso por el principio de «ojo por ojo», no fue el primero: el código de Ur-Nammu es unos tres siglos más antiguo.",
          "Los escribas mesopotámicos desarrollaron un sistema de numeración posicional de base 60 que permitía cálculos complejos; tablillas como la Plimpton 322 muestran conocimientos de las ternas de números que hoy llamamos pitagóricas, más de un milenio antes de Pitágoras. Sus observaciones astronómicas, registradas durante siglos, sirvieron de base a la astronomía griega.",
          "La Epopeya de Gilgamesh, cuyas versiones más antiguas en sumerio datan de finales del III milenio a. C., narra la búsqueda de la inmortalidad de un rey de Uruk e incluye un relato del diluvio con paralelos sorprendentes con el bíblico. Se considera una de las obras literarias más antiguas de la humanidad.",
        ],
      },
    ],
    historia: {
      titulo: "Tres milenios de historia",
      parrafos: [
        "Tras el periodo de las ciudades-Estado sumerias, Sargón de Acad unificó la región hacia el 2334 a. C. (cronología media) y fundó el que suele considerarse el primer imperio de la historia. Le siguieron la tercera dinastía de Ur, el reino paleobabilónico de Hammurabi, el dominio casita y, en el I milenio a. C., el Imperio neoasirio, con capitales como Nínive, donde la biblioteca de Asurbanipal reunió miles de tablillas.",
        "El Imperio neobabilónico de Nabucodonosor II (siglo VI a. C.) embelleció Babilonia con la puerta de Ishtar y los legendarios Jardines Colgantes. En 539 a. C. Ciro el Grande conquistó Babilonia y la integró en el Imperio persa aqueménida; después llegaron Alejandro Magno, los seléucidas, los partos y los sasánidas. El conocimiento del cuneiforme se perdió y no fue descifrado hasta el siglo XIX, gracias en gran parte a la inscripción trilingüe de Behistún, en Irán.",
        "El patrimonio mesopotámico ha sufrido mucho en tiempos recientes: el saqueo del Museo Nacional de Irak en 2003 y la destrucción deliberada de sitios como Nimrud por el Estado Islámico en 2015. Al mismo tiempo, se han repatriado miles de piezas y se han reanudado excavaciones internacionales en el país.",
      ],
    },
    datos: [
      { etiqueta: "Primeras tablillas escritas", valor: "≈ 3300-3200 a. C.", nota: "Uruk", fuente: 0 },
      { etiqueta: "Código de Hammurabi", valor: "≈ 1754 a. C.", nota: "282 leyes; Museo del Louvre", fuente: 2 },
      { etiqueta: "Primer imperio", valor: "Acad, ≈ 2334 a. C.", nota: "cronología media", fuente: 0 },
      { etiqueta: "Uso del cuneiforme", valor: "más de 3.000 años", nota: "hasta el siglo I", fuente: 1 },
      { etiqueta: "Base de numeración", valor: "60 (sexagesimal)", fuente: 1 },
      { etiqueta: "Conquista persa de Babilonia", valor: "539 a. C.", fuente: 0 },
    ],
    cronologia: [
      { fecha: "≈ 3500-3100 a. C.", texto: "Periodo de Uruk: primeras ciudades." },
      { fecha: "≈ 3300-3200 a. C.", texto: "Primeras tablillas protocuneiformes." },
      { fecha: "≈ 2334 a. C.", texto: "Sargón funda el Imperio acadio." },
      { fecha: "siglo XXI a. C.", texto: "Ur-Nammu construye el zigurat de Ur." },
      { fecha: "≈ 1754 a. C.", texto: "Código de Hammurabi." },
      { fecha: "siglo VII a. C.", texto: "Biblioteca de Asurbanipal en Nínive." },
      { fecha: "539 a. C.", texto: "Ciro el Grande conquista Babilonia." },
    ],
    imagenes: [
      { clave: "zigurat", alt: "El zigurat de Ur, en el sur de Irak", pie: "El gran zigurat de Ur (siglo XXI a. C.), con su escalinata restaurada." },
      { clave: "hammurabi", alt: "La estela del Código de Hammurabi en el Museo del Louvre", pie: "Estela del Código de Hammurabi (≈ 1754 a. C.), Museo del Louvre." },
    ],
    fuentes: [
      { titulo: "Mesopotamia", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/place/Mesopotamia-historical-region-Asia", tipo: "enciclopedia" },
      { titulo: "Cuneiform", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/topic/cuneiform", tipo: "enciclopedia" },
      { titulo: "Law Code of Hammurabi, king of Babylon", editor: "Museo del Louvre", url: "https://collections.louvre.fr/en/ark:/53355/cl010174436", tipo: "institucional" },
      { titulo: "Mesopotamia", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/mesopotamia/", tipo: "educativa" },
      { titulo: "Mesopotamia", editor: "Wikipedia en español", url: "https://es.wikipedia.org/wiki/Mesopotamia", tipo: "enciclopedia" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["escritura", "asia", "imperio-bizantino", "religiones-del-mundo", "agua-dulce", "revolucion-cientifica"],
    lingua: [{ ruta: "/lingua/idioma/sume1241", texto: "Sumerio, lengua aislada" }, { ruta: "/lingua/escrituras/Xsux", texto: "Escritura cuneiforme" }],
    conceptos: ["estados-antiguos", "escritura", "riego", "patrimonio"],
    civilizaciones: ["sumer", "persia"],
    paises: ["iq", "sy", "ir"],
    palabrasClave: ["Sumer", "Babilonia", "Asiria", "cuneiforme", "Hammurabi", "zigurat", "Gilgamesh", "Tigris", "Éufrates"],
  },
  {
    slug: "imperio-bizantino",
    titulo: "Imperio bizantino",
    categoria: "civilizaciones",
    bajada: "La continuación del Imperio romano en Oriente durante mil años: Constantinopla, el derecho de Justiniano, Santa Sofía y el puente entre la Antigüedad y la Edad Moderna.",
    introduccion: [
      "Se llama Imperio bizantino a la parte oriental del Imperio romano que sobrevivió a la caída de Occidente y perduró hasta la conquista otomana de Constantinopla en 1453. Sus habitantes nunca se llamaron a sí mismos «bizantinos»: se consideraban romanos (rhomaioi), y su Estado era, para ellos, simplemente el Imperio romano. El término se generalizó entre los historiadores europeos a partir del siglo XVI, tomado del antiguo nombre de la ciudad, Bizancio.",
      "Durante un milenio fue una de las potencias más ricas y sofisticadas del mundo mediterráneo. Conservó y transmitió buena parte del legado griego y romano, dio forma al cristianismo ortodoxo y extendió su influencia religiosa, artística y política hacia los Balcanes y Rusia.",
    ],
    secciones: [
      {
        titulo: "Constantinopla, la nueva Roma",
        parrafos: [
          "En el año 330 el emperador Constantino refundó la antigua colonia griega de Bizancio como capital imperial con el nombre de Constantinopla. Su posición era excepcional: dominaba el Bósforo, paso obligado entre el mar Negro y el Mediterráneo y entre Europa y Asia, y estaba protegida por el mar en tres de sus lados. Las murallas terrestres levantadas en el siglo V por Teodosio II la hicieron prácticamente inexpugnable durante casi mil años.",
          "En su apogeo, Constantinopla fue la mayor y más rica ciudad de Europa, con varios cientos de miles de habitantes. Su moneda de oro, el sólido o nomisma, mantuvo su valor durante siglos y circuló como una divisa internacional desde la Europa occidental hasta la India.",
        ],
      },
      {
        titulo: "Justiniano: derecho y arquitectura",
        parrafos: [
          "El emperador Justiniano I (527-565) intentó restaurar la unidad del Mediterráneo romano y reconquistó el norte de África, Italia y parte de Hispania. Su legado más duradero fue jurídico: la compilación del derecho romano conocida desde la Edad Media como Corpus Iuris Civilis, que recogió siglos de leyes y doctrina jurídica. Redescubierto en Bolonia en el siglo XI, se convirtió en la base del derecho civil de buena parte de Europa y de América Latina.",
          "Justiniano mandó construir también Santa Sofía (Hagia Sophia, «Santa Sabiduría»), consagrada en 537 tras solo unos cinco años de obras dirigidas por Antemio de Tralles e Isidoro de Mileto. Su cúpula, de unos 31 metros de diámetro, parece flotar sobre una corona de ventanas y fue la mayor del mundo durante siglos. Tras 1453 se transformó en mezquita, en 1934 se convirtió en museo por decisión de la República de Turquía y en 2020 volvió a ser mezquita, una decisión que generó debate internacional. Forma parte de las Zonas Históricas de Estambul, Patrimonio Mundial de la UNESCO.",
        ],
      },
      {
        titulo: "Religión, cultura y legado",
        parrafos: [
          "La Iglesia bizantina y la de Roma se fueron distanciando por diferencias de lengua, liturgia, doctrina y autoridad hasta la ruptura de 1054, el llamado Cisma de Oriente y Occidente. Bizancio vivió además, entre los siglos VIII y IX, la crisis iconoclasta, un largo conflicto sobre la legitimidad de venerar imágenes religiosas que terminó con su restauración en 843.",
          "Los misioneros Cirilo y Metodio, enviados en el siglo IX a evangelizar a los eslavos, crearon el alfabeto glagolítico, del que derivó el cirílico que hoy usan el ruso, el ucraniano, el búlgaro o el serbio. La conversión del príncipe Vladimiro de Kiev al cristianismo bizantino hacia 988 vinculó durablemente el mundo ruso con la tradición ortodoxa. Los eruditos bizantinos copiaron y conservaron gran parte de la literatura griega antigua; muchos de ellos llevaron manuscritos a Italia en el siglo XV y contribuyeron al Renacimiento.",
        ],
      },
    ],
    historia: {
      titulo: "Mil años de historia",
      parrafos: [
        "En 395 el Imperio romano se dividió de forma definitiva entre Oriente y Occidente; el Occidente cayó en 476 y el Oriente continuó. En el siglo VII perdió Siria, Palestina y Egipto ante la expansión árabe islámica, y se reorganizó como un Estado de lengua y cultura griegas. Bajo la dinastía macedónica (867-1056) vivió una nueva etapa de esplendor.",
        "La derrota ante los turcos selyúcidas en Manzikert (1071) le hizo perder buena parte de Anatolia. En 1204 los cruzados de la Cuarta Cruzada saquearon Constantinopla y fundaron un Imperio latino; los bizantinos recuperaron la ciudad en 1261, pero el Imperio nunca recobró su fuerza. El 29 de mayo de 1453 el sultán otomano Mehmed II tomó Constantinopla tras un asedio de casi dos meses en el que empleó grandes cañones; el último emperador, Constantino XI, murió en la defensa. La fecha se usa a menudo como uno de los hitos que marcan el fin de la Edad Media.",
      ],
    },
    datos: [
      { etiqueta: "Refundación de Constantinopla", valor: "330", fuente: 0 },
      { etiqueta: "Duración del Imperio de Oriente", valor: "≈ 1.000 años", nota: "395-1453", fuente: 0 },
      { etiqueta: "Consagración de Santa Sofía", valor: "537", fuente: 1 },
      { etiqueta: "Diámetro de la cúpula de Santa Sofía", valor: "≈ 31 m", fuente: 1 },
      { etiqueta: "Cisma de Oriente y Occidente", valor: "1054", fuente: 0 },
      { etiqueta: "Caída de Constantinopla", valor: "29 de mayo de 1453", fuente: 0 },
    ],
    cronologia: [
      { fecha: "330", texto: "Constantino inaugura Constantinopla." },
      { fecha: "395", texto: "División definitiva del Imperio romano." },
      { fecha: "529-534", texto: "Compilación del derecho de Justiniano." },
      { fecha: "537", texto: "Consagración de Santa Sofía." },
      { fecha: "1054", texto: "Cisma entre Roma y Constantinopla." },
      { fecha: "1204", texto: "La Cuarta Cruzada saquea Constantinopla." },
      { fecha: "1453", texto: "Conquista otomana de Constantinopla." },
    ],
    imagenes: [{ clave: "santa-sofia", alt: "Interior de Santa Sofía en una litografía del siglo XIX", pie: "Interior de Santa Sofía, litografía de Louis Haghe según Gaspare Fossati (1852)." }],
    fuentes: [
      { titulo: "Byzantine Empire", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/place/Byzantine-Empire", tipo: "enciclopedia" },
      { titulo: "Hagia Sophia", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/topic/Hagia-Sophia", tipo: "enciclopedia" },
      { titulo: "Historic Areas of Istanbul", editor: "UNESCO · Centro del Patrimonio Mundial", url: "https://whc.unesco.org/en/list/356/", tipo: "institucional" },
      { titulo: "Byzantine Empire", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/byzantine-empire/", tipo: "educativa" },
      { titulo: "Imperio bizantino", editor: "Wikipedia en español", url: "https://es.wikipedia.org/wiki/Imperio_bizantino", tipo: "enciclopedia" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["europa", "religiones-del-mundo", "escritura", "mesopotamia", "lenguas-del-mundo", "revolucion-cientifica"],
    conceptos: ["patrimonio", "estados-antiguos", "estrechos"],
    civilizaciones: ["roma", "grecia"],
    paises: ["tr", "gr", "bg", "it"],
    palabrasClave: ["Bizancio", "Constantinopla", "Justiniano", "Santa Sofía", "ortodoxia", "cirílico", "1453", "Corpus Iuris Civilis"],
  },
  {
    slug: "pueblos-tainos",
    titulo: "Los taínos y el Caribe originario",
    categoria: "civilizaciones",
    bajada: "Los pueblos que habitaban las Antillas Mayores a la llegada de Colón: su sociedad, sus creencias, su herencia en la lengua y la cultura caribeñas y las pruebas de su continuidad genética.",
    introduccion: [
      "Los taínos eran los pueblos de lengua arahuaca que habitaban gran parte de las Antillas Mayores —La Española, Puerto Rico, Cuba y Jamaica— y las Bahamas a finales del siglo XV. Fueron los primeros pueblos americanos en recibir a los europeos, en 1492, y los primeros en sufrir las consecuencias de la conquista.",
      "El término «taíno» lo popularizaron historiadores del siglo XIX a partir de una palabra que, según las crónicas, significaba «bueno» o «noble»; ellos se identificaban por sus islas y cacicazgos. Aunque las fuentes coloniales hablaron durante siglos de su extinción, la investigación reciente muestra que su legado sigue vivo en la lengua, la alimentación, el paisaje cultural y el ADN de millones de caribeños.",
    ],
    secciones: [
      {
        titulo: "Origen y poblamiento",
        parrafos: [
          "Las Antillas se poblaron en varias oleadas. Los primeros grupos, de cazadores-recolectores con utensilios de piedra, llegaron hace unos 6.000 años. Hacia el 500 a. C., pueblos agricultores y alfareros procedentes de la cuenca del Orinoco, asociados a la cultura saladoide, avanzaron por las Antillas Menores hacia Puerto Rico. De la mezcla y evolución de estas poblaciones surgió, hacia los siglos XII-XIII, la cultura taína clásica, cuyo núcleo fue La Española y Puerto Rico.",
          "Un estudio de ADN antiguo publicado en Nature en 2021, basado en 263 individuos, confirmó que el Caribe se pobló en al menos dos grandes oleadas distintas, y estimó que la población de las islas a la llegada de los europeos era considerablemente menor que las cifras de millones que daban algunas crónicas: probablemente decenas de miles de personas en islas como La Española o Puerto Rico en el momento del contacto.",
        ],
      },
      {
        titulo: "Sociedad y vida cotidiana",
        parrafos: [
          "La sociedad taína estaba organizada en cacicazgos, unidades políticas encabezadas por un cacique, que podía heredar el cargo por línea materna. A la llegada de Colón, La Española estaba dividida en cinco grandes cacicazgos —Marién, Maguá, Maguana, Jaragua e Higüey—, gobernados por caciques como Guacanagarix, Caonabo y Anacaona. Por debajo del cacique estaban los nitaínos, una élite de consejeros y guerreros, y los naborías, la gente común.",
          "Vivían en aldeas de casas circulares llamadas bohíos, en torno a una plaza central donde se celebraban areítos —ceremonias de canto y danza que narraban la historia del pueblo— y el juego de pelota llamado batey. Su agricultura se basaba en montones de tierra o conucos donde cultivaban yuca, de la que hacían el casabe, un pan que todavía se consume en el Caribe, además de batata, maíz, maní, ají y algodón. Eran hábiles navegantes que recorrían las islas en grandes canoas.",
        ],
      },
      {
        titulo: "Creencias y arte",
        parrafos: [
          "La religión taína giraba en torno a los cemíes, espíritus de los antepasados y de las fuerzas de la naturaleza, representados en objetos de piedra, madera, hueso o algodón. Yúcahu era el espíritu de la yuca y del mar, y Atabey, la madre de las aguas y de la fertilidad. El behíque, o chamán, curaba enfermedades e intercedía ante los espíritus.",
          "Uno de los objetos más notables de su arte es el duho, un asiento ceremonial de madera tallada o piedra reservado a los caciques y behíques, que se usaba en la ceremonia de la cohoba, en la que se inhalaba un polvo alucinógeno para comunicarse con los cemíes. Se conservan duhos en museos de Santo Domingo, San Juan, Londres o Nueva York. Sus petroglifos y pictografías, como los de la cueva de las Maravillas o la del Pomier en la República Dominicana, figuran entre los conjuntos de arte rupestre más importantes del Caribe.",
        ],
      },
      {
        titulo: "Una herencia viva",
        parrafos: [
          "El español y otras lenguas europeas adoptaron numerosas palabras taínas, que han pasado a todo el mundo: huracán, hamaca, canoa, barbacoa, tabaco, maíz, yuca, batata, iguana, caimán, sabana o cacique. Muchos topónimos del Caribe son de origen taíno, entre ellos Haití, Jamaica, Cuba, Bahamas, Higüey o Bánica.",
          "La genética también ha corregido la idea de la desaparición total. Diversos estudios han encontrado en la población actual de Puerto Rico, la República Dominicana y Cuba un porcentaje relevante de ADN mitocondrial de origen indígena americano, que se transmite por línea materna, reflejo de uniones entre mujeres indígenas y hombres europeos o africanos en los primeros siglos coloniales. Hoy existen además movimientos de reivindicación de la identidad taína en el Caribe y en su diáspora.",
        ],
      },
    ],
    historia: {
      titulo: "La conquista y el colapso",
      parrafos: [
        "Colón llegó a una isla de las Bahamas llamada Guanahaní el 12 de octubre de 1492 y en diciembre a La Española, donde fundó el fuerte de La Navidad con ayuda del cacique Guacanagarix. Los asentamientos posteriores, como La Isabela (1494) y Santo Domingo (1496-1498), dieron paso a un sistema de explotación basado en la búsqueda de oro y en la encomienda, que obligaba a los indígenas a trabajar para los colonos.",
        "Las guerras, el trabajo forzado, el hambre y, sobre todo, las epidemias de enfermedades desconocidas en América, como la viruela que llegó en 1518, causaron un colapso demográfico catastrófico en pocas décadas. Hubo resistencia: el cacique Hatuey luchó en La Española y en Cuba, donde fue ejecutado en 1512, y el cacique Enriquillo sostuvo una rebelión en la sierra de Bahoruco entre 1519 y 1533 que terminó con un acuerdo de paz con la Corona. Las denuncias de fray Antón de Montesinos (1511) y de fray Bartolomé de las Casas contribuyeron a las Leyes de Burgos (1512) y las Leyes Nuevas (1542), que intentaron limitar los abusos.",
      ],
    },
    datos: [
      { etiqueta: "Primeros pobladores de las Antillas", valor: "hace ≈ 6.000 años", fuente: 1 },
      { etiqueta: "Llegada de agricultores saladoides", valor: "≈ 500 a. C.", fuente: 1 },
      { etiqueta: "Cacicazgos de La Española (1492)", valor: "5", fuente: 3 },
      { etiqueta: "Individuos en el estudio de ADN antiguo", valor: "263", nota: "Nature, 2021", fuente: 1 },
      { etiqueta: "Rebelión de Enriquillo", valor: "1519-1533", fuente: 0 },
      { etiqueta: "Palabras taínas en el español", valor: "huracán, hamaca, canoa, barbacoa, tabaco…", fuente: 2 },
    ],
    cronologia: [
      { fecha: "≈ 4000 a. C.", texto: "Primeros pobladores de las Antillas." },
      { fecha: "≈ 500 a. C.", texto: "Llegada de pueblos agricultores saladoides." },
      { fecha: "siglos XII-XIII", texto: "Florecimiento de la cultura taína clásica." },
      { fecha: "1492", texto: "Colón llega a Guanahaní y a La Española." },
      { fecha: "1511", texto: "Sermón de Montesinos en Santo Domingo." },
      { fecha: "1518", texto: "Epidemia de viruela en La Española." },
      { fecha: "1519-1533", texto: "Rebelión de Enriquillo en el Bahoruco." },
    ],
    imagenes: [{ clave: "duho", alt: "Duho taíno de madera tallada en el Museo Británico", pie: "Duho taíno, asiento ceremonial de caciques y behíques (Museo Británico)." }],
    fuentes: [
      { titulo: "Taino", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/topic/Taino", tipo: "enciclopedia" },
      { titulo: "A genetic history of the pre-contact Caribbean", editor: "Fernandes, D. M. et al. · Nature (2021)", url: "https://www.nature.com/articles/s41586-020-03053-2", tipo: "academica" },
      { titulo: "Diccionario de la lengua española (etimologías: huracán, hamaca, canoa)", editor: "Real Academia Española", url: "https://dle.rae.es/hurac%C3%A1n", tipo: "institucional" },
      { titulo: "Taínos", editor: "Wikipedia en español", url: "https://es.wikipedia.org/wiki/Ta%C3%ADnos", tipo: "enciclopedia" },
      { titulo: "Taíno: Native Heritage and Identity in the Caribbean", editor: "Smithsonian · National Museum of the American Indian", url: "https://americanindian.si.edu/taino/", tipo: "institucional" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["republica-dominicana", "america", "lenguas-del-mundo", "religiones-del-mundo", "biodiversidad", "escritura"],
    lingua: [{ ruta: "/lingua/idioma/tain1254", texto: "Ficha de la lengua taína" }, { ruta: "/lingua/familias/araw1281?n=tain1254", texto: "La familia arahuaca" }],
    conceptos: ["patrimonio", "diversidad-cultural", "datacion"],
    paises: ["do", "ht", "pr", "cu", "jm", "bs"],
    palabrasClave: ["taínos", "arahuacos", "cacicazgos", "cemíes", "duho", "areíto", "casabe", "Enriquillo", "Anacaona"],
  },
  {
    slug: "escritura",
    titulo: "La historia de la escritura",
    categoria: "culturas-sociedades",
    bajada: "Cómo la humanidad aprendió a fijar el lenguaje en signos: de las tablillas de Uruk al alfabeto, y cómo se descifraron escrituras olvidadas como los jeroglíficos.",
    introduccion: [
      "La escritura es un sistema de signos visibles que representa el lenguaje de manera convencional. No es lo mismo que el dibujo ni que la simple marca numérica: escribir significa poder registrar cualquier enunciado de una lengua para que otra persona, en otro lugar o en otro tiempo, lo reconstruya.",
      "Se inventó de forma independiente al menos tres o cuatro veces: en Mesopotamia hacia el 3300-3200 a. C., en China hacia el 1200 a. C. y en Mesoamérica en el I milenio a. C.; el caso egipcio, casi contemporáneo del mesopotámico, se discute como invención independiente o estimulada por el contacto. Casi todas las demás escrituras del mundo derivan de alguna de esas invenciones.",
    ],
    secciones: [
      {
        titulo: "Tres maneras de escribir",
        parrafos: [
          "Los sistemas de escritura se clasifican según qué unidad del lenguaje representan sus signos. Los sistemas logográficos usan signos que representan palabras o morfemas, como buena parte de la escritura china, aunque la mayoría de los caracteres chinos combinan un elemento de significado y otro de sonido. Los silabarios representan sílabas: el japonés kana, el cheroqui inventado por Sequoyah hacia 1821 o el lineal B micénico. Los alfabetos representan fonemas, es decir, sonidos individuales, y necesitan solo unas pocas decenas de signos.",
          "En la práctica, muchas escrituras son mixtas. Los jeroglíficos egipcios combinaban logogramas, signos fonéticos de una, dos o tres consonantes y determinativos que indicaban la categoría de la palabra. Las escrituras semíticas como el fenicio, el hebreo o el árabe, llamadas abyads, anotan sobre todo consonantes. Las abugidas de la India, como el devanagari, escriben cada consonante con una vocal inherente que se modifica con signos diacríticos.",
        ],
      },
      {
        titulo: "Del jeroglífico al alfabeto",
        parrafos: [
          "El alfabeto nació una sola vez. Hacia 1800 a. C., trabajadores de lengua semítica en el Sinaí y Egipto tomaron algunos signos jeroglíficos y los usaron para representar el sonido inicial de la palabra que designaban en su propia lengua: el signo de la cabeza de buey (ʾalp) pasó a valer por el sonido de su primera consonante. De esa escritura protosinaítica derivó el alfabeto fenicio, de 22 consonantes, que los comerciantes fenicios difundieron por el Mediterráneo.",
          "Hacia el siglo VIII a. C. los griegos adaptaron el alfabeto fenicio y añadieron signos para las vocales, creando el primer alfabeto completo en sentido estricto. Del griego derivaron el etrusco y de este el latino, que hoy es la escritura más usada del mundo; también del griego procede el cirílico. Por otra rama, el arameo dio origen al hebreo cuadrado, al árabe y, probablemente, a las escrituras brahmí de la India, de las que proceden decenas de escrituras del sur y el sudeste de Asia.",
        ],
      },
      {
        titulo: "Descifrar lo olvidado: la piedra de Rosetta",
        parrafos: [
          "La piedra de Rosetta es un fragmento de estela de granodiorita con un mismo decreto, promulgado en 196 a. C. en nombre del faraón Ptolomeo V, escrito en tres escrituras: jeroglífico egipcio, demótico (la escritura cursiva cotidiana) y griego antiguo. Fue hallada por soldados franceses en 1799 cerca de la ciudad de Rashid (Rosetta), en el delta del Nilo, y pasó a manos británicas en 1801 por el Tratado de Alejandría; se exhibe en el Museo Británico desde 1802, y Egipto ha solicitado su devolución.",
          "Como el texto griego podía leerse, la piedra ofrecía una clave para los jeroglíficos, cuyo conocimiento se había perdido desde finales de la Antigüedad. El británico Thomas Young identificó algunos signos fonéticos en los cartuchos que encerraban nombres reales, pero fue el francés Jean-François Champollion quien, en su Carta a M. Dacier de 1822, demostró que los jeroglíficos combinaban signos fonéticos e ideográficos y que representaban la lengua egipcia, emparentada con el copto. Fue el nacimiento de la egiptología moderna.",
          "Otros desciframientos fueron igual de notables: el cuneiforme, a partir de la inscripción trilingüe de Behistún, a mediados del siglo XIX; el lineal B micénico, que Michael Ventris demostró en 1952 que transcribía una forma antigua de griego; y la escritura maya, cuya lectura avanzó decisivamente desde la década de 1950 gracias a Yuri Knorózov, Tatiana Proskouriakoff y muchos otros. Algunas escrituras, como la del valle del Indo o el lineal A minoico, siguen sin descifrar.",
        ],
      },
      {
        titulo: "Escritura, poder y sociedad",
        parrafos: [
          "Durante la mayor parte de la historia leer y escribir fue privilegio de pequeñas élites de escribas, sacerdotes y funcionarios. La imprenta de tipos móviles —inventada en China por Bi Sheng en el siglo XI, desarrollada con tipos metálicos en Corea y difundida en Europa por Johannes Gutenberg hacia 1450— abarató los libros y favoreció la alfabetización. Según la UNESCO, la tasa mundial de alfabetización de adultos supera hoy el 85 %, pero unos 750 millones de adultos, en su mayoría mujeres, todavía no saben leer ni escribir.",
        ],
      },
    ],
    datos: [
      { etiqueta: "Primeras escrituras", valor: "≈ 3300-3200 a. C.", nota: "Mesopotamia y Egipto", fuente: 0 },
      { etiqueta: "Primer alfabeto (protosinaítico)", valor: "≈ 1800 a. C.", fuente: 0 },
      { etiqueta: "Letras del alfabeto fenicio", valor: "22 consonantes", fuente: 0 },
      { etiqueta: "Decreto de la piedra de Rosetta", valor: "196 a. C.", nota: "hallada en 1799", fuente: 1 },
      { etiqueta: "Desciframiento de los jeroglíficos", valor: "1822", nota: "Champollion", fuente: 1 },
      { etiqueta: "Adultos que no saben leer", valor: "≈ 750 millones", fuente: 3 },
    ],
    cronologia: [
      { fecha: "≈ 3300 a. C.", texto: "Primeras tablillas de Uruk." },
      { fecha: "≈ 1800 a. C.", texto: "Escritura protosinaítica, origen del alfabeto." },
      { fecha: "≈ 1200 a. C.", texto: "Inscripciones oraculares de la dinastía Shang." },
      { fecha: "siglo VIII a. C.", texto: "Alfabeto griego con vocales." },
      { fecha: "≈ 1450", texto: "Imprenta de Gutenberg." },
      { fecha: "1822", texto: "Champollion descifra los jeroglíficos." },
      { fecha: "1952", texto: "Ventris descifra el lineal B." },
    ],
    imagenes: [{ clave: "rosetta", alt: "La piedra de Rosetta en el Museo Británico", pie: "La piedra de Rosetta (196 a. C.): el mismo decreto en jeroglífico, demótico y griego." }],
    fuentes: [
      { titulo: "Writing", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/topic/writing", tipo: "enciclopedia" },
      { titulo: "Everything you ever wanted to know about the Rosetta Stone", editor: "British Museum", url: "https://www.britishmuseum.org/blog/everything-you-ever-wanted-know-about-rosetta-stone", tipo: "institucional" },
      { titulo: "Escritura", editor: "Wikipedia en español", url: "https://es.wikipedia.org/wiki/Escritura", tipo: "enciclopedia" },
      { titulo: "Literacy", editor: "UNESCO · Instituto de Estadística", url: "https://www.unesco.org/en/literacy", tipo: "datos" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["mesopotamia", "lenguas-del-mundo", "imperio-bizantino", "africa", "internet", "pueblos-tainos"],
    lingua: [{ ruta: "/lingua/escrituras", texto: "34 sistemas de escritura" }, { ruta: "/lingua/escrituras/comparar", texto: "Comparar escrituras" }, { ruta: "/lingua/alfabetos", texto: "Alfabetos con sus caracteres" }],
    conceptos: ["escritura", "educacion-aprendizaje", "patrimonio"],
    civilizaciones: ["sumer", "egipto", "shang", "maya"],
    paises: ["eg", "iq", "cn", "gr", "kr"],
    palabrasClave: ["escritura", "alfabeto", "jeroglíficos", "cuneiforme", "Rosetta", "Champollion", "fenicios", "imprenta"],
  },
  {
    slug: "lenguas-del-mundo",
    titulo: "Las lenguas del mundo",
    categoria: "culturas-sociedades",
    bajada: "Unas siete mil lenguas, agrupadas en familias, muy desigualmente repartidas y, casi la mitad, en peligro de desaparecer.",
    introduccion: [
      "En el mundo se hablan alrededor de siete mil lenguas. El catálogo Ethnologue registraba en su edición de 2025 unas 7.159 lenguas vivas; otros inventarios, como Glottolog, dan cifras algo distintas porque la frontera entre lengua y dialecto no es solo lingüística sino también social y política. Como dice una frase célebre atribuida al lingüista Max Weinreich, «una lengua es un dialecto con un ejército y una armada».",
      "Esa diversidad está repartida de forma muy desigual. Unas pocas lenguas concentran a la mayoría de los hablantes, mientras miles de lenguas son habladas por comunidades pequeñas y casi la mitad están en peligro. Cada lengua que desaparece se lleva consigo una manera única de nombrar el mundo, conocimientos sobre plantas, animales y territorios y una parte de la historia humana.",
    ],
    secciones: [
      {
        titulo: "Familias lingüísticas",
        parrafos: [
          "Los lingüistas agrupan las lenguas en familias cuando pueden demostrar que descienden de un antepasado común mediante correspondencias sistemáticas de sonidos y de gramática. La familia indoeuropea, que incluye desde el español, el inglés y el ruso hasta el persa, el hindi y el bengalí, es la que tiene más hablantes. La familia sinotibetana, con el chino y el birmano, es la segunda. Otras grandes familias son la níger-congo, con más de 1.500 lenguas en África; la austronesia, extendida desde Madagascar hasta Rapa Nui; la afroasiática, con el árabe, el hebreo, el amárico y el hausa; la dravídica del sur de la India; la túrquica y la urálica.",
          "Existen también lenguas aisladas, sin parientes conocidos, como el vasco en Europa, el burushaski en Pakistán o el kutenai en Norteamérica, y numerosas familias pequeñas en América, Nueva Guinea y Australia. Las lenguas criollas, como el criollo haitiano o el papiamento de Aruba, Bonaire y Curazao, surgieron del contacto intenso entre poblaciones de lenguas diferentes, a menudo en contextos coloniales y de esclavitud, y son lenguas plenas con gramáticas propias.",
        ],
      },
      {
        titulo: "Dónde hay más lenguas",
        parrafos: [
          "Asia y África concentran cada una alrededor de un tercio de las lenguas del mundo. Papúa Nueva Guinea es el país más diverso del planeta, con más de 800 lenguas para unos diez millones de habitantes, seguido de Indonesia, Nigeria, India y Estados Unidos. La diversidad lingüística tiende a coincidir con la diversidad biológica: las regiones tropicales, montañosas e insulares, donde los grupos humanos permanecieron más aislados, son las que tienen más lenguas.",
          "En el otro extremo, el mandarín es la lengua con más hablantes nativos, seguido del español, el inglés, el hindi y el árabe en sus variedades. Si se cuentan también los hablantes de segunda lengua, el inglés es la lengua más hablada del mundo, con más de 1.500 millones de personas. El español, oficial en una veintena de países, tiene cerca de 500 millones de hablantes nativos según el Instituto Cervantes.",
        ],
      },
      {
        titulo: "Lenguas en peligro",
        parrafos: [
          "Según Ethnologue, alrededor del 44 % de las lenguas vivas están amenazadas, muchas con menos de mil hablantes. La mayoría no desaparecen porque sus hablantes mueran, sino porque las nuevas generaciones dejan de aprenderlas en favor de una lengua dominante, asociada a la escuela, el trabajo, los medios o el prestigio social. La transmisión de padres a hijos es el indicador clave de la vitalidad de una lengua.",
          "Hay también casos de recuperación. El hebreo, que durante siglos fue sobre todo una lengua litúrgica y escrita, se revitalizó como lengua cotidiana a finales del siglo XIX y hoy es la lengua materna de millones de personas. El maorí en Nueva Zelanda, el galés en el Reino Unido o el euskera en España han ganado hablantes gracias a la escuela en la propia lengua y al apoyo institucional. Naciones Unidas proclamó el Decenio Internacional de las Lenguas Indígenas (2022-2032) para apoyar estos esfuerzos.",
        ],
      },
      {
        titulo: "Lenguas del Caribe",
        parrafos: [
          "El Caribe es un laboratorio lingüístico. En sus islas conviven el español, el inglés, el francés y el neerlandés heredados de las potencias coloniales con lenguas criollas nacidas en las plantaciones: el criollo haitiano, hablado por unos doce millones de personas y oficial en Haití junto al francés desde la Constitución de 1987; el papiamento de Aruba, Bonaire y Curazao, de base ibérica; o el patois jamaicano, de base inglesa. Las lenguas arahuacas de los taínos desaparecieron como lenguas habladas, pero dejaron decenas de palabras en el español y, a través de él, en todas las lenguas europeas.",
          "El español caribeño —el de Cuba, Puerto Rico, la República Dominicana y las costas de Venezuela, Colombia y Panamá— comparte rasgos con el de Andalucía y Canarias, de donde procedía buena parte de los colonos: la aspiración o pérdida de la «s» final de sílaba, la neutralización de «r» y «l» o el seseo. En la región dominicana del Cibao se escucha además la vocalización de esas consonantes en «i» («poique» por «porque»). La Real Academia Española y las demás corporaciones de la Asociación de Academias de la Lengua Española, veintitrés en total, describen hoy la norma del español como policéntrica: no existe una variedad «correcta» única, sino normas cultas propias de cada gran región.",
        ],
      },
    ],
    datos: [
      { etiqueta: "Lenguas vivas", valor: "≈ 7.159", nota: "Ethnologue, edición de 2025", fuente: 0 },
      { etiqueta: "Lenguas amenazadas", valor: "≈ 44 %", fuente: 0 },
      { etiqueta: "País con más lenguas", valor: "Papúa Nueva Guinea, > 800", fuente: 0 },
      { etiqueta: "Hablantes nativos de español", valor: "≈ 500 millones", fuente: 2 },
      { etiqueta: "Decenio de las Lenguas Indígenas", valor: "2022-2032", fuente: 3 },
    ],
    imagenes: [{ clave: "rosetta", alt: "La piedra de Rosetta, con un texto en tres escrituras", pie: "Tres escrituras y dos lenguas en una misma piedra: la diversidad lingüística como clave del pasado." }],
    fuentes: [
      { titulo: "How many languages are there in the world?", editor: "Ethnologue (SIL International)", url: "https://www.ethnologue.com/insights/how-many-languages/", tipo: "datos" },
      { titulo: "Language", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/topic/language", tipo: "enciclopedia" },
      { titulo: "El español: una lengua viva. Informe 2024", editor: "Instituto Cervantes", url: "https://cvc.cervantes.es/lengua/espanol_lengua_viva/", tipo: "institucional" },
      { titulo: "International Decade of Indigenous Languages 2022-2032", editor: "UNESCO", url: "https://www.unesco.org/en/decades/indigenous-languages", tipo: "institucional" },
      { titulo: "Glottolog", editor: "Instituto Max Planck de Antropología Evolutiva", url: "https://glottolog.org/", tipo: "academica" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["escritura", "religiones-del-mundo", "africa", "oceania", "pueblos-tainos", "poblacion-mundial"],
    lingua: [{ ruta: "/lingua", texto: "Lingua: 8.243 lenguas" }, { ruta: "/lingua/familias", texto: "Árbol de familias" }, { ruta: "/lingua/mapa", texto: "Mapa mundial de lenguas" }, { ruta: "/lingua/peligro", texto: "Lenguas en peligro" }, { ruta: "/lingua/conceptos", texto: "Lengua, dialecto y variedad" }],
    conceptos: ["diversidad-cultural", "patrimonio", "educacion-aprendizaje"],
    paises: ["pg", "id", "ng", "in", "ht", "nz"],
    palabrasClave: ["lenguas", "idiomas", "familias lingüísticas", "indoeuropeo", "criollo", "lenguas en peligro", "Ethnologue", "español"],
  },
  {
    slug: "religiones-del-mundo",
    titulo: "Las religiones del mundo",
    categoria: "culturas-sociedades",
    bajada: "Cómo se reparten las creencias de la humanidad, de dónde vienen las grandes tradiciones religiosas y cómo cambió el mapa religioso entre 2010 y 2020.",
    introduccion: [
      "Las religiones son sistemas de creencias, prácticas, rituales y comunidades que vinculan a las personas con lo que consideran sagrado. Han inspirado arte, leyes, calendarios, fiestas y formas de vida, y siguen siendo una parte central de la identidad de la mayoría de la población mundial: según el Pew Research Center, alrededor de tres de cada cuatro personas se identifican con alguna religión.",
      "Este artículo describe las grandes tradiciones y su distribución con criterios demográficos y descriptivos, sin juzgar sus doctrinas. Las cifras proceden del estudio del Pew Research Center publicado en junio de 2025, basado en más de 2.700 censos y encuestas de 201 países y territorios.",
    ],
    secciones: [
      {
        titulo: "El mapa religioso en cifras",
        parrafos: [
          "En 2020 los cristianos eran el grupo más numeroso, con unos 2.300 millones de personas, el 28,8 % de la población mundial. Les seguían los musulmanes, con unos 2.000 millones (25,6 %), y las personas sin afiliación religiosa —ateos, agnósticos y quienes no se identifican con ninguna religión—, unos 1.900 millones (24,2 %). Los hindúes sumaban alrededor de 1.200 millones (14,9 %), y los budistas, cerca del 4 %. Judíos, sijs, seguidores de religiones populares o tradicionales y de otras religiones completan el panorama.",
          "Entre 2010 y 2020 los musulmanes fueron el grupo que más creció: sumaron unos 347 millones de personas, más que todas las demás religiones juntas, sobre todo por su estructura de edad joven —una edad mediana de unos 24 años— y una fecundidad más alta. Los cristianos aumentaron en número, en unos 122 millones, pero su proporción en la población mundial bajó, en buena medida por el abandono de la religión en Europa, América y Oceanía. Las personas sin religión aumentaron tanto en número como en proporción. El África subsahariana ha pasado a ser la región con más cristianos del mundo.",
        ],
      },
      {
        titulo: "Las tradiciones abrahámicas",
        parrafos: [
          "El judaísmo, el cristianismo y el islam se denominan religiones abrahámicas porque reconocen a Abraham como patriarca y comparten la creencia en un solo Dios. El judaísmo, la más antigua de las tres, se basa en la Torá y en la alianza entre Dios y el pueblo de Israel; tiene unos 15 millones de fieles, la mayoría en Israel y Estados Unidos.",
          "El cristianismo surgió en el siglo I en torno a la figura de Jesús de Nazaret, al que sus seguidores consideran el Mesías y el Hijo de Dios. Se divide en tres grandes ramas: el catolicismo, la mayor; las iglesias ortodoxas, separadas de Roma desde el cisma de 1054; y las diversas iglesias protestantes surgidas de la Reforma del siglo XVI, a las que se suman los movimientos evangélicos y pentecostales, de fuerte crecimiento en América Latina y África.",
          "El islam nació en la península arábiga en el siglo VII con la predicación del profeta Mahoma, y su texto sagrado es el Corán. Sus dos grandes ramas, la suní, mayoritaria, y la chií, se separaron por la cuestión de la sucesión del profeta. Indonesia, Pakistán, la India y Bangladés son los países con más musulmanes del mundo.",
        ],
      },
      {
        titulo: "Las tradiciones de Asia",
        parrafos: [
          "El hinduismo, con raíces que se remontan a los Vedas, compuestos en el II milenio a. C., no tiene un fundador único ni una autoridad central; reúne una enorme variedad de escuelas, divinidades y prácticas en torno a ideas como el dharma, el karma y el ciclo de reencarnaciones. Alrededor del 95 % de los hindúes vive en la India.",
          "El budismo fue fundado en el norte de la India por Siddharta Gautama, el Buda, probablemente en el siglo V a. C., y se extendió por Asia en dos grandes corrientes: el theravada, en Sri Lanka y el sudeste asiático, y el mahayana, en China, Japón, Corea y Vietnam, del que forma parte el budismo tibetano. Otras tradiciones asiáticas son el sijismo, fundado por Guru Nanak en el Punyab en el siglo XV; el jainismo; y las tradiciones chinas, como el confucianismo y el taoísmo, que a menudo se practican junto con el budismo y la religión popular, y el sintoísmo japonés.",
        ],
      },
      {
        titulo: "Religión, sociedad y libertad",
        parrafos: [
          "La Declaración Universal de Derechos Humanos de 1948 reconoce en su artículo 18 el derecho de toda persona a la libertad de pensamiento, de conciencia y de religión, incluida la libertad de cambiar de religión o de creencia. Su aplicación varía mucho entre países: hay Estados laicos, otros con religión oficial y otros que imponen restricciones severas a minorías religiosas o a la falta de creencias.",
          "En el Caribe, la religiosidad combina el catolicismo heredado de la colonización con un crecimiento evangélico notable y con tradiciones de raíz africana, como el vudú haitiano o la santería cubana, nacidas del encuentro entre creencias africanas y cristianas.",
        ],
      },
    ],
    datos: [
      { etiqueta: "Cristianos", valor: "≈ 2.300 millones (28,8 %)", nota: "2020", fuente: 0 },
      { etiqueta: "Musulmanes", valor: "≈ 2.000 millones (25,6 %)", nota: "2020", fuente: 0 },
      { etiqueta: "Sin afiliación religiosa", valor: "≈ 1.900 millones (24,2 %)", nota: "2020", fuente: 0 },
      { etiqueta: "Hindúes", valor: "≈ 1.200 millones (14,9 %)", nota: "2020", fuente: 0 },
      { etiqueta: "Crecimiento musulmán 2010-2020", valor: "+347 millones", fuente: 0 },
      { etiqueta: "Fuentes del estudio Pew", valor: "≈ 2.700 censos y encuestas", nota: "201 países y territorios", fuente: 0 },
    ],
    imagenes: [{ clave: "santa-sofia", alt: "Interior de Santa Sofía de Estambul", pie: "Santa Sofía, basílica cristiana, mezquita, museo y de nuevo mezquita: un edificio que resume siglos de historia religiosa." }],
    fuentes: [
      { titulo: "How the Global Religious Landscape Changed From 2010 to 2020", editor: "Pew Research Center (9 de junio de 2025)", url: "https://www.pewresearch.org/religion/2025/06/09/how-the-global-religious-landscape-changed-from-2010-to-2020/", tipo: "datos" },
      { titulo: "Religion", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/topic/religion", tipo: "enciclopedia" },
      { titulo: "Declaración Universal de Derechos Humanos, artículo 18", editor: "Naciones Unidas", url: "https://www.un.org/es/about-us/universal-declaration-of-human-rights", tipo: "institucional" },
      { titulo: "Religión", editor: "Wikipedia en español", url: "https://es.wikipedia.org/wiki/Religi%C3%B3n", tipo: "enciclopedia" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["lenguas-del-mundo", "imperio-bizantino", "asia", "africa", "poblacion-mundial", "pueblos-tainos"],
    conceptos: ["diversidad-cultural", "patrimonio", "demografia-transicion"],
    paises: ["in", "id", "pk", "il", "sa", "va"],
    palabrasClave: ["religión", "cristianismo", "islam", "hinduismo", "budismo", "judaísmo", "Pew", "libertad religiosa"],
  },
];
