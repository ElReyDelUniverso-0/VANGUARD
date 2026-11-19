import type { Articulo } from "../tipos";

// v417.0 — CIENCIA Y TECNOLOGÍA · NATURALEZA Y BIODIVERSIDAD.

export const CIENCIA_NATURALEZA: Articulo[] = [
  {
    slug: "revolucion-cientifica",
    titulo: "La revolución científica",
    categoria: "ciencia-tecnologia",
    bajada: "Entre Copérnico y Newton, Europa transformó su manera de conocer la naturaleza: observación, experimento y matemáticas como base del saber.",
    introduccion: [
      "Se llama revolución científica al conjunto de cambios en la astronomía, la física, la medicina y los métodos del conocimiento que tuvo lugar en Europa entre mediados del siglo XVI y finales del XVII. Se suele situar entre 1543, cuando Nicolás Copérnico publicó su sistema heliocéntrico, y 1687, cuando Isaac Newton publicó sus Principia.",
      "En ese periodo se abandonó la imagen del cosmos heredada de Aristóteles y Ptolomeo, con la Tierra inmóvil en el centro, y se consolidó la idea de que la naturaleza sigue leyes que pueden descubrirse mediante la observación sistemática, el experimento y las matemáticas. De esa transformación nacieron las instituciones y los hábitos de la ciencia moderna.",
    ],
    secciones: [
      {
        titulo: "Del cosmos cerrado al universo infinito",
        parrafos: [
          "Durante casi dos mil años, la astronomía europea y del mundo islámico se basó en el modelo geocéntrico sistematizado por Claudio Ptolomeo en el siglo II, que explicaba los movimientos de los planetas mediante complejas combinaciones de círculos. En 1543 Copérnico propuso en De revolutionibus orbium coelestium que el Sol ocupaba el centro y que la Tierra giraba sobre sí misma y alrededor de él. Su sistema era más elegante, aunque no más preciso que el de Ptolomeo, porque seguía usando órbitas circulares.",
          "Johannes Kepler, trabajando con las observaciones extraordinariamente precisas del astrónomo danés Tycho Brahe, demostró en 1609 que la órbita de Marte es una elipse y formuló las leyes del movimiento planetario que llevan su nombre. Por primera vez, un modelo heliocéntrico predecía las posiciones de los planetas mejor que cualquier otro.",
        ],
      },
      {
        titulo: "Galileo y el telescopio",
        parrafos: [
          "En 1609 Galileo Galilei construyó un telescopio basado en un invento holandés reciente y lo apuntó al cielo. En El mensajero sideral (Sidereus nuncius, 1610) describió montañas en la Luna, innumerables estrellas invisibles a simple vista y cuatro satélites que giraban alrededor de Júpiter, prueba de que no todo giraba en torno a la Tierra. Observó después las fases de Venus, incompatibles con el modelo de Ptolomeo, y las manchas solares.",
          "Galileo fue también uno de los fundadores de la física experimental: estudió la caída de los cuerpos y el movimiento en planos inclinados y defendió que «el libro de la naturaleza está escrito en lenguaje matemático». Su defensa pública del copernicanismo, en especial en el Diálogo sobre los dos máximos sistemas del mundo (1632), le llevó a ser juzgado por la Inquisición romana en 1633, obligado a abjurar y condenado a arresto domiciliario hasta su muerte en 1642. En 1992 el papa Juan Pablo II reconoció públicamente los errores cometidos en su condena.",
        ],
      },
      {
        titulo: "Un nuevo método",
        parrafos: [
          "Francis Bacon defendió en el Novum Organum (1620) un conocimiento basado en la acumulación ordenada de observaciones y experimentos, y René Descartes, en el Discurso del método (1637), un razonamiento riguroso a partir de principios claros y matemáticos. El método científico que hoy conocemos combina ambas tradiciones: formular hipótesis, deducir consecuencias que puedan comprobarse, contrastarlas con experimentos y observaciones y revisar las ideas si no se sostienen.",
          "La revolución afectó también a otras disciplinas. Andreas Vesalio publicó en 1543 De humani corporis fabrica, un atlas anatómico basado en disecciones directas que corrigió muchos errores de la medicina antigua; William Harvey demostró en 1628 la circulación de la sangre; Robert Boyle sentó bases de la química experimental; y Antonie van Leeuwenhoek observó por primera vez microorganismos con sus microscopios en la década de 1670.",
        ],
      },
      {
        titulo: "Newton y la síntesis",
        parrafos: [
          "En 1687 Isaac Newton publicó los Philosophiae naturalis principia mathematica, donde formuló las tres leyes del movimiento y la ley de la gravitación universal. Con ellas mostró que la misma fuerza que hace caer una manzana mantiene a la Luna en su órbita y a los planetas alrededor del Sol, y dedujo matemáticamente las leyes de Kepler. Fue la primera gran síntesis de la física: un solo conjunto de leyes para el cielo y la Tierra. Newton y Gottfried Leibniz desarrollaron además, de manera independiente, el cálculo infinitesimal.",
        ],
      },
      {
        titulo: "Instituciones y legado",
        parrafos: [
          "La ciencia se organizó en sociedades que discutían y publicaban resultados: la Academia de los Linces en Roma (1603), de la que fue miembro Galileo; la Royal Society de Londres (1660), que en 1665 lanzó la revista científica más antigua que sigue publicándose, Philosophical Transactions; y la Academia de Ciencias de París (1666). La comunicación abierta de resultados para que otros pudieran comprobarlos se convirtió en un principio central de la ciencia.",
          "Los historiadores actuales matizan la imagen de una ruptura repentina y puramente europea. La revolución se apoyó en saberes previos —la astronomía y la óptica del mundo islámico, como las de Ibn al-Haytham o la escuela de Maragha, las matemáticas indias y árabes, la artesanía y la navegación—, y convivió durante mucho tiempo con la astrología y la alquimia: el propio Newton dedicó años a esta última.",
        ],
      },
    ],
    datos: [
      { etiqueta: "De revolutionibus (Copérnico)", valor: "1543", fuente: 0 },
      { etiqueta: "Leyes de Kepler (las dos primeras)", valor: "1609", fuente: 0 },
      { etiqueta: "Sidereus nuncius (Galileo)", valor: "1610", fuente: 1 },
      { etiqueta: "Juicio de Galileo", valor: "1633", fuente: 1 },
      { etiqueta: "Fundación de la Royal Society", valor: "1660", fuente: 3 },
      { etiqueta: "Principia (Newton)", valor: "1687", fuente: 0 },
    ],
    cronologia: [
      { fecha: "1543", texto: "Copérnico y Vesalio publican sus obras fundamentales." },
      { fecha: "1609", texto: "Kepler publica Astronomia nova; Galileo construye su telescopio." },
      { fecha: "1610", texto: "Sidereus nuncius: los satélites de Júpiter." },
      { fecha: "1628", texto: "Harvey describe la circulación de la sangre." },
      { fecha: "1633", texto: "Condena de Galileo por la Inquisición." },
      { fecha: "1660", texto: "Fundación de la Royal Society." },
      { fecha: "1687", texto: "Newton publica los Principia." },
    ],
    imagenes: [{ clave: "galileo", alt: "Retrato de Galileo Galilei por Justus Sustermans", pie: "Galileo Galilei retratado por Justus Sustermans en 1636." }],
    fuentes: [
      { titulo: "Scientific Revolution", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/science/Scientific-Revolution", tipo: "enciclopedia" },
      { titulo: "Galileo", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/biography/Galileo-Galilei", tipo: "enciclopedia" },
      { titulo: "Revolución científica", editor: "Wikipedia en español", url: "https://es.wikipedia.org/wiki/Revoluci%C3%B3n_cient%C3%ADfica", tipo: "enciclopedia" },
      { titulo: "History of the Royal Society", editor: "The Royal Society", url: "https://royalsociety.org/about-us/who-we-are/history/", tipo: "institucional" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["europa", "internet", "escritura", "tectonica-de-placas", "imperio-bizantino", "energia"],
    conceptos: ["metodo-cientifico", "gravitacion", "sistema-solar", "incertidumbre"],
    paises: ["it", "pl", "gb", "de", "dk"],
    palabrasClave: ["Copérnico", "Galileo", "Kepler", "Newton", "heliocentrismo", "método científico", "telescopio", "Royal Society"],
  },
  {
    slug: "internet",
    titulo: "Internet",
    categoria: "ciencia-tecnologia",
    bajada: "La red de redes que conecta a 6.000 millones de personas: cómo nació, cómo funciona por dentro y quiénes siguen fuera.",
    introduccion: [
      "Internet es una red mundial formada por decenas de miles de redes independientes que se interconectan mediante un lenguaje común, el conjunto de protocolos TCP/IP. No tiene un dueño ni un centro: funciona porque operadores, universidades, empresas y gobiernos acuerdan intercambiar datos siguiendo las mismas normas técnicas.",
      "Con frecuencia se confunde internet con la World Wide Web, pero no son lo mismo: la web es uno de los servicios que funcionan sobre internet, igual que el correo electrónico, la mensajería o las videollamadas. Según la Unión Internacional de Telecomunicaciones, en 2025 alrededor del 74 % de la humanidad, unos 6.000 millones de personas, usa internet, y unos 2.200 millones siguen desconectados.",
    ],
    secciones: [
      {
        titulo: "Cómo funciona",
        parrafos: [
          "Internet transmite la información dividida en pequeños paquetes. Cada paquete viaja de forma independiente, puede seguir caminos distintos y se reensambla en el destino. El protocolo IP se encarga de la dirección y el encaminamiento —cada dispositivo conectado tiene una dirección IP— y el protocolo TCP garantiza que los paquetes lleguen completos y en orden. Esta «conmutación de paquetes» hace que la red sea robusta: si un tramo falla, el tráfico busca otra ruta.",
          "El sistema de nombres de dominio (DNS) traduce nombres fáciles de recordar, como un sitio web, en direcciones IP numéricas. Su coordinación mundial corresponde a ICANN, una organización sin ánimo de lucro con un modelo de participación de múltiples partes interesadas. Las normas técnicas se elaboran de forma abierta en organismos como el Grupo de Trabajo de Ingeniería de Internet (IETF), que publica sus especificaciones como documentos RFC.",
          "Bajo la apariencia inmaterial hay una infraestructura muy física: más de 500 cables submarinos de fibra óptica transportan la gran mayoría del tráfico intercontinental, junto con centros de datos, puntos de intercambio de tráfico, antenas de telefonía móvil y, cada vez más, constelaciones de satélites en órbita baja. La imagen del Opte Project, que representa como un mapa las conexiones entre redes, da una idea de esa complejidad.",
        ],
      },
      {
        titulo: "La web y la internet móvil",
        parrafos: [
          "En marzo de 1989 Tim Berners-Lee, entonces en el CERN, el laboratorio europeo de física de partículas cercano a Ginebra, propuso un sistema de gestión de información basado en hipertexto. Desarrolló el lenguaje HTML, el protocolo HTTP, las direcciones URL, el primer servidor y el primer navegador. La web se abrió al público en 1991 y, el 30 de abril de 1993, el CERN puso su tecnología en el dominio público, una decisión que permitió su difusión explosiva.",
          "El teléfono inteligente llevó internet al bolsillo a partir de la segunda mitad de la década de 2000. Hoy la mayoría de las personas se conecta principalmente a través del móvil, y en muchos países de África, Asia y América Latina el teléfono ha sido el primer y único acceso a internet. Las redes 5G cubren ya a más de la mitad de la población mundial, aunque con enormes diferencias entre países ricos y pobres.",
        ],
      },
      {
        titulo: "La brecha digital",
        parrafos: [
          "El informe Facts and Figures 2025 de la UIT muestra que la conexión está muy desigualmente repartida. En los países de ingresos altos usa internet el 94 % de la población, frente al 23 % en los de ingresos bajos; el 96 % de las personas desconectadas vive en países de ingresos bajos y medios. También hay brechas dentro de cada país: el 85 % de la población urbana usa internet frente al 58 % de la rural, y el 77 % de los hombres frente al 71 % de las mujeres. Los jóvenes de 15 a 24 años son los más conectados, con un 82 %.",
          "La UIT distingue entre cobertura y uso: unos 312 millones de personas viven en lugares sin ninguna cobertura de banda ancha móvil, casi la mitad en África, pero muchas más tienen cobertura y no usan internet por el coste de los dispositivos y los datos, la falta de habilidades digitales o la escasez de contenidos útiles en su lengua. Por eso los organismos internacionales hablan hoy de «conectividad significativa»: no basta con estar conectado; hace falta una conexión asequible, rápida, segura y útil.",
        ],
      },
    ],
    historia: {
      titulo: "Contexto histórico",
      parrafos: [
        "Internet nació de la investigación militar y académica de la Guerra Fría. En los años sesenta, Paul Baran en Estados Unidos y Donald Davies en el Reino Unido desarrollaron de forma independiente la idea de la conmutación de paquetes. La agencia estadounidense ARPA financió ARPANET, cuyo primer mensaje entre la Universidad de California en Los Ángeles y el Instituto de Investigación de Stanford se envió el 29 de octubre de 1969; el sistema falló tras transmitir las dos primeras letras de la palabra «LOGIN».",
        "Vinton Cerf y Robert Kahn diseñaron en 1974 el protocolo TCP/IP para interconectar redes diferentes, y el 1 de enero de 1983 ARPANET lo adoptó como estándar: es la fecha que muchos consideran el nacimiento de internet. En la década de 1990, la apertura al uso comercial y la web convirtieron una red de investigadores en una infraestructura global. Una parte creciente de la vida económica, social y política depende hoy de ella, lo que ha traído beneficios inmensos y también problemas nuevos: desinformación, ciberataques, vigilancia y concentración de poder en pocas plataformas.",
      ],
    },
    datos: [
      { etiqueta: "Personas conectadas", valor: "≈ 6.000 millones (74 %)", nota: "2025", fuente: 0 },
      { etiqueta: "Personas desconectadas", valor: "≈ 2.200 millones", nota: "2025", fuente: 0 },
      { etiqueta: "Uso en países de ingresos altos / bajos", valor: "94 % / 23 %", nota: "2025", fuente: 0 },
      { etiqueta: "Cobertura 5G", valor: "55 % de la población", nota: "2025", fuente: 0 },
      { etiqueta: "Primer mensaje de ARPANET", valor: "29 de octubre de 1969", fuente: 1 },
      { etiqueta: "La web pasa al dominio público", valor: "30 de abril de 1993", fuente: 2 },
    ],
    cronologia: [
      { fecha: "1969", texto: "Primer enlace de ARPANET." },
      { fecha: "1974", texto: "Cerf y Kahn describen TCP/IP." },
      { fecha: "1983", texto: "ARPANET adopta TCP/IP." },
      { fecha: "1989", texto: "Berners-Lee propone la World Wide Web en el CERN." },
      { fecha: "1993", texto: "El CERN libera la web al dominio público." },
      { fecha: "2007", texto: "Despegue del teléfono inteligente." },
      { fecha: "2025", texto: "El 74 % de la humanidad usa internet." },
    ],
    imagenes: [{ clave: "internet", alt: "Mapa visual de las conexiones de internet del Opte Project", pie: "Representación de las rutas de internet (The Opte Project): cada línea une dos redes." }],
    fuentes: [
      { titulo: "Facts and Figures 2025", editor: "Unión Internacional de Telecomunicaciones (UIT)", url: "https://www.itu.int/itu-d/reports/statistics/facts-figures-2025/", tipo: "datos" },
      { titulo: "Internet", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/technology/Internet", tipo: "enciclopedia" },
      { titulo: "The birth of the Web", editor: "CERN", url: "https://home.cern/science/computing/birth-web", tipo: "institucional" },
      { titulo: "Submarine Cable Map", editor: "TeleGeography", url: "https://www.submarinecablemap.com/", tipo: "datos" },
      { titulo: "Internet", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/internet/", tipo: "educativa" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["revolucion-cientifica", "escritura", "poblacion-mundial", "sistema-naciones-unidas", "energia", "africa"],
    conceptos: ["infraestructura-digital", "semiconductores", "resiliencia-redes"],
    paises: ["us", "ch", "gb"],
    palabrasClave: ["internet", "web", "ARPANET", "TCP/IP", "Berners-Lee", "CERN", "brecha digital", "5G", "UIT"],
  },
  {
    slug: "biodiversidad",
    titulo: "Biodiversidad",
    categoria: "naturaleza-biodiversidad",
    bajada: "La variedad de la vida en la Tierra: cuántas especies conocemos, dónde se concentran, qué las amenaza y qué acordó el mundo para protegerlas.",
    introduccion: [
      "La biodiversidad o diversidad biológica es la variedad de la vida en todas sus formas y niveles. El Convenio sobre la Diversidad Biológica, adoptado en la Cumbre de la Tierra de Río de Janeiro en 1992, la define en tres niveles: la diversidad genética dentro de cada especie, la diversidad de especies y la diversidad de ecosistemas.",
      "La biodiversidad no es solo un catálogo de seres vivos. De ella dependen la polinización de los cultivos, la fertilidad de los suelos, la depuración del agua, la pesca, muchos medicamentos y la regulación del clima. La ciencia advierte que la pérdida de biodiversidad avanza hoy a un ritmo sin precedentes en la historia humana.",
    ],
    secciones: [
      {
        titulo: "¿Cuántas especies hay?",
        parrafos: [
          "Nadie lo sabe con exactitud. Los científicos han descrito y dado nombre a algo más de dos millones de especies, pero se estima que existen muchas más. Un estudio muy citado de Camilo Mora y colaboradores, publicado en 2011 en PLOS Biology, calculó que en la Tierra viven unos 8,7 millones de especies de organismos con células nucleadas (eucariotas), de las que la gran mayoría —en especial insectos, hongos y organismos marinos— seguiría sin describir. Si se incluyen bacterias y arqueas, las estimaciones se disparan.",
          "Los insectos son el grupo con más especies descritas, en particular los escarabajos. Cada año se describen unas 15.000-20.000 especies nuevas, muchas en regiones tropicales y en las profundidades marinas.",
        ],
      },
      {
        titulo: "Dónde se concentra la vida",
        parrafos: [
          "La biodiversidad aumenta en general de los polos hacia el ecuador. Las selvas tropicales y los arrecifes de coral son los ecosistemas más ricos en especies. Unos diecisiete países, llamados megadiversos —entre ellos Brasil, Colombia, México, Perú, Ecuador, Indonesia, Madagascar, Australia o China—, albergan juntos alrededor del 70 % de las especies conocidas.",
          "Las islas merecen atención especial porque su aislamiento favorece la aparición de especies endémicas, que solo existen en un lugar. Las islas Galápagos, cuyas tortugas gigantes, pinzones y sinsontes ayudaron a Charles Darwin a desarrollar la teoría de la evolución por selección natural, publicada en 1859, son el ejemplo clásico. Las islas del Caribe, incluida La Española, forman uno de los «puntos calientes» de biodiversidad del mundo, regiones con muchas especies endémicas y una gran pérdida de hábitat.",
        ],
      },
      {
        titulo: "Las amenazas",
        parrafos: [
          "La Evaluación Mundial de la Biodiversidad publicada en 2019 por la IPBES, el organismo científico intergubernamental sobre biodiversidad, concluyó que alrededor de un millón de especies de animales y plantas están amenazadas de extinción, muchas en las próximas décadas. Identificó cinco causas directas, por orden de impacto global: los cambios en el uso de la tierra y el mar, sobre todo la conversión de bosques y humedales en tierras agrícolas; la explotación directa de organismos, como la pesca excesiva y la caza; el cambio climático; la contaminación; y las especies exóticas invasoras.",
          "La Lista Roja de la Unión Internacional para la Conservación de la Naturaleza (UICN) es el principal inventario del estado de conservación de las especies. En 2025 había evaluado unas 170.000 especies, de las cuales más de 47.000 —alrededor del 28 %— estaban amenazadas. Están en especial riesgo los anfibios, los corales formadores de arrecifes, las cícadas, los tiburones y rayas y los árboles. El Informe Planeta Vivo 2024 del WWF y la Sociedad Zoológica de Londres estimó un descenso medio del 73 % en el tamaño de las poblaciones de vertebrados silvestres monitoreadas entre 1970 y 2020.",
          "Los científicos debaten si estamos entrando en una sexta extinción masiva, comparable a las cinco grandes extinciones de la historia de la Tierra, como la que acabó con los dinosaurios no avianos hace 66 millones de años. Haya llegado o no a esa escala, las tasas actuales de extinción son muy superiores a las naturales de fondo.",
        ],
      },
      {
        titulo: "Proteger la vida",
        parrafos: [
          "En diciembre de 2022, durante la COP15 del Convenio sobre la Diversidad Biológica, casi 200 países adoptaron el Marco Mundial de Biodiversidad de Kunming-Montreal. Su meta más conocida, la llamada «30×30», propone conservar al menos el 30 % de las tierras y aguas continentales y el 30 % de los océanos para 2030, respetando los derechos de los pueblos indígenas y las comunidades locales, que gestionan una parte importante de las zonas mejor conservadas del planeta.",
          "Las herramientas de conservación incluyen las áreas protegidas, la restauración de ecosistemas, el control del comercio de especies amenazadas mediante la Convención CITES (1973), la lucha contra las especies invasoras y los programas de cría en cautividad y reintroducción. Hay éxitos documentados: la recuperación de las tortugas gigantes de la isla Española en Galápagos, que pasaron de 14 ejemplares a más de 2.000 gracias a un programa de cría, o la de la ballena jorobada tras la moratoria de la caza comercial de 1986.",
        ],
      },
    ],
    datos: [
      { etiqueta: "Especies descritas", valor: "más de 2 millones", fuente: 3 },
      { etiqueta: "Especies eucariotas estimadas", valor: "≈ 8,7 millones", nota: "Mora et al., 2011", fuente: 2 },
      { etiqueta: "Especies amenazadas de extinción", valor: "≈ 1 millón", nota: "IPBES, 2019", fuente: 0 },
      { etiqueta: "Especies evaluadas por la UICN", valor: "≈ 170.000", nota: "2025; > 47.000 amenazadas", fuente: 3 },
      { etiqueta: "Descenso medio de poblaciones monitoreadas", valor: "73 %", nota: "1970-2020, Informe Planeta Vivo 2024", fuente: 4 },
      { etiqueta: "Meta 30×30", valor: "30 % de tierras y mares protegidos en 2030", fuente: 1 },
    ],
    imagenes: [{ clave: "tortuga", alt: "Tortuga gigante de Galápagos en la isla Santa Cruz", pie: "Tortuga gigante de la isla Santa Cruz (Galápagos), símbolo de la biodiversidad insular." }],
    fuentes: [
      { titulo: "Global Assessment Report on Biodiversity and Ecosystem Services", editor: "IPBES (2019)", url: "https://www.ipbes.net/global-assessment", tipo: "institucional" },
      { titulo: "Kunming-Montreal Global Biodiversity Framework", editor: "Convenio sobre la Diversidad Biológica", url: "https://www.cbd.int/gbf", tipo: "institucional" },
      { titulo: "How Many Species Are There on Earth and in the Ocean?", editor: "Mora, C. et al. · PLOS Biology (2011)", url: "https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1001127", tipo: "academica" },
      { titulo: "The IUCN Red List of Threatened Species", editor: "UICN", url: "https://www.iucnredlist.org/", tipo: "datos" },
      { titulo: "Living Planet Report 2024", editor: "WWF y Sociedad Zoológica de Londres", url: "https://www.livingplanetindex.org/", tipo: "datos" },
      { titulo: "Biodiversity", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/biodiversity/", tipo: "educativa" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["selvas-tropicales", "arrecifes-de-coral", "clima-y-biomas", "republica-dominicana", "oceania", "agua-dulce"],
    conceptos: ["diversidad-biologica", "evolucion", "ecosistemas-marinos", "genetica"],
    paises: ["ec", "br", "co", "mx", "mg", "id"],
    palabrasClave: ["biodiversidad", "especies", "extinción", "Lista Roja", "UICN", "IPBES", "30x30", "Galápagos", "Darwin"],
  },
  {
    slug: "selvas-tropicales",
    titulo: "Las selvas tropicales y la Amazonía",
    categoria: "naturaleza-biodiversidad",
    bajada: "Los ecosistemas terrestres más ricos del planeta: cómo funcionan, por qué importan para el clima y el agua y cuánto se están perdiendo.",
    introduccion: [
      "Las selvas tropicales húmedas crecen en la franja ecuatorial, donde hace calor todo el año y llueve de forma abundante, por lo general más de 2.000 milímetros anuales. Aunque cubren una pequeña parte de la superficie terrestre, se estima que albergan más de la mitad de las especies terrestres del planeta.",
      "Las tres grandes regiones de selva tropical son la Amazonía, la cuenca del Congo y el sudeste asiático con Nueva Guinea. La Amazonía, la mayor de todas, se reparte entre nueve países y territorios —Brasil, Perú, Colombia, Venezuela, Ecuador, Bolivia, Guyana, Surinam y la Guayana Francesa— y es una pieza clave del sistema climático de Sudamérica y del mundo.",
    ],
    secciones: [
      {
        titulo: "La arquitectura de la selva",
        parrafos: [
          "La selva se organiza en estratos. Los árboles emergentes, que pueden superar los 50 metros, sobresalen por encima del dosel, una capa continua de copas a 30-40 metros de altura donde vive la mayoría de los animales y llega casi toda la luz. Por debajo se encuentran el sotobosque, de plantas adaptadas a la sombra, y el suelo, donde solo penetra alrededor del 2 % de la luz solar.",
          "Paradójicamente, los suelos de muchas selvas son pobres. Los nutrientes están en la propia vegetación y se reciclan con gran rapidez: hojas, frutos y animales muertos se descomponen en semanas gracias a hongos, bacterias e insectos, y las raíces los absorben de inmediato. Por eso, cuando se tala la selva, los suelos pierden fertilidad en pocos años y la regeneración natural es lenta.",
        ],
      },
      {
        titulo: "La Amazonía, una bomba de agua",
        parrafos: [
          "La cuenca del Amazonas abarca unos 7 millones de km², y la selva amazónica, unos 5,5 millones. Sus árboles transpiran cantidades enormes de agua: buena parte de la lluvia que cae en la Amazonía procede del propio bosque, que recicla la humedad llegada del Atlántico y la transporta tierra adentro. Esos «ríos voladores» de vapor contribuyen a las lluvias de regiones agrícolas del centro y el sur de Sudamérica.",
          "La Amazonía almacena además una gran cantidad de carbono en su vegetación y en sus suelos. Científicos como Carlos Nobre y Thomas Lovejoy han advertido que, si la deforestación y el calentamiento continúan, partes de la selva podrían cruzar un «punto de inflexión» a partir del cual se degradarían hacia ecosistemas más secos, parecidos a la sabana, con pérdida de especies y liberación de carbono. Las sequías extremas de 2023 y 2024, que llevaron algunos ríos amazónicos a sus niveles más bajos registrados, han aumentado la preocupación.",
          "En la Amazonía viven más de 40 millones de personas, entre ellas cientos de pueblos indígenas, algunos en aislamiento voluntario. Numerosos estudios han mostrado que los territorios indígenas reconocidos tienden a tener tasas de deforestación más bajas que las áreas circundantes.",
        ],
      },
      {
        titulo: "Deforestación",
        parrafos: [
          "Según la Universidad de Maryland y Global Forest Watch, los trópicos perdieron en 2024 una superficie récord de bosque primario, unos 6,7 millones de hectáreas, casi el doble que el año anterior, sobre todo por incendios agravados por la sequía. Las causas principales de la deforestación a largo plazo son la expansión de la ganadería y los cultivos comerciales —soja, palma aceitera, cacao—, la tala, la minería, incluida la extracción ilegal de oro, y las carreteras que abren el bosque a la colonización.",
          "Las políticas importan. En la Amazonía brasileña, la deforestación cayó más de un 70 % entre 2004 y 2012 gracias a la vigilancia por satélite, la creación de áreas protegidas y la presión sobre las cadenas de suministro, volvió a subir en los años siguientes y descendió de nuevo a partir de 2023: el sistema PRODES del Instituto Nacional de Investigaciones Espaciales de Brasil registró unos 6.288 km² entre agosto de 2023 y julio de 2024, alrededor de un 30 % menos que en el periodo anterior.",
        ],
      },
      {
        titulo: "Más allá de la Amazonía: el Congo y el sudeste asiático",
        parrafos: [
          "La selva de la cuenca del Congo, compartida por la República Democrática del Congo, la República del Congo, Gabón, Camerún, la República Centroafricana y Guinea Ecuatorial, es la segunda mayor del mundo. Alberga gorilas, chimpancés, bonobos —que solo viven al sur del río Congo— y elefantes de bosque. En 2017 un equipo internacional publicó en Nature el hallazgo de una gran turbera tropical bajo sus bosques pantanosos, la Cuvette Centrale, de unos 145.000 km², que almacena alrededor de 30.000 millones de toneladas de carbono, una cantidad comparable a varios años de emisiones mundiales de combustibles fósiles. Su conservación depende de que no se drene ni se queme.",
          "En el sudeste asiático, las selvas de Borneo, Sumatra y Nueva Guinea figuran entre las más antiguas y ricas del planeta y son el hogar de los orangutanes, el único gran simio asiático. Durante las últimas décadas han sufrido una pérdida enorme por la expansión de las plantaciones de palma aceitera —Indonesia y Malasia producen la gran mayoría del aceite de palma del mundo— y de la industria papelera, así como por los incendios en turberas drenadas, que en años secos como 2015 cubrieron de humo buena parte de la región. Las moratorias sobre nuevas concesiones y los compromisos de cadenas de suministro sin deforestación han contribuido a reducir la pérdida de bosque primario en Indonesia en los últimos años.",
        ],
      },
    ],
    datos: [
      { etiqueta: "Cuenca del Amazonas", valor: "≈ 7 millones de km²", fuente: 0 },
      { etiqueta: "Países y territorios amazónicos", valor: "9", fuente: 0 },
      { etiqueta: "Pérdida de bosque primario tropical en 2024", valor: "≈ 6,7 millones de ha", nota: "récord", fuente: 1 },
      { etiqueta: "Deforestación en la Amazonía brasileña", valor: "≈ 6.288 km²", nota: "ago. 2023-jul. 2024 (PRODES)", fuente: 2 },
      { etiqueta: "Luz que llega al suelo de la selva", valor: "≈ 2 %", fuente: 3 },
    ],
    imagenes: [{ clave: "amazonia", alt: "Vista aérea de la selva amazónica atravesada por un río", pie: "La selva amazónica vista desde el aire." }],
    fuentes: [
      { titulo: "Amazon Rainforest", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/place/Amazon-Rainforest", tipo: "enciclopedia" },
      { titulo: "Global Forest Review — Tree cover loss 2024", editor: "World Resources Institute · Global Forest Watch", url: "https://research.wri.org/gfr/latest-analysis-deforestation-trends", tipo: "datos" },
      { titulo: "PRODES — Monitoramento do desmatamento da Amazônia", editor: "INPE (Brasil)", url: "https://terrabrasilis.dpi.inpe.br/", tipo: "datos" },
      { titulo: "Rain Forest", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/rain-forest/", tipo: "educativa" },
      { titulo: "Science Panel for the Amazon — Amazon Assessment Report", editor: "Science Panel for the Amazon (SDSN)", url: "https://www.theamazonwewant.org/", tipo: "academica" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["biodiversidad", "clima-y-biomas", "america", "agua-dulce", "africa", "arrecifes-de-coral"],
    conceptos: ["diversidad-biologica", "clima-carbono", "ciclo-agua", "cuencas"],
    paises: ["br", "pe", "co", "bo", "ec", "cd", "id"],
    palabrasClave: ["selva", "Amazonía", "Amazonas", "deforestación", "bosque tropical", "ríos voladores", "punto de inflexión", "Congo"],
  },
  {
    slug: "arrecifes-de-coral",
    titulo: "Arrecifes de coral",
    categoria: "naturaleza-biodiversidad",
    bajada: "Ciudades vivas construidas por animales diminutos: ocupan una fracción mínima del océano y sostienen una cuarta parte de la vida marina conocida.",
    introduccion: [
      "Los arrecifes de coral son estructuras construidas a lo largo de miles de años por colonias de pólipos, pequeños animales emparentados con las medusas que segregan esqueletos de carbonato de calcio. Se forman sobre todo en aguas tropicales cálidas, claras y poco profundas, y figuran entre los ecosistemas más diversos del planeta.",
      "Aunque cubren bastante menos del 1 % del fondo oceánico, se estima que alrededor de una cuarta parte de todas las especies marinas conocidas dependen de ellos en algún momento de su vida. Protegen las costas del oleaje, sostienen la pesca de cientos de millones de personas y atraen al turismo. También son de los ecosistemas más amenazados por el calentamiento del océano.",
    ],
    secciones: [
      {
        titulo: "Una alianza entre animal y alga",
        parrafos: [
          "La clave del éxito de los corales formadores de arrecifes es una simbiosis. Dentro de sus tejidos viven algas microscópicas llamadas zooxantelas, que realizan la fotosíntesis y ceden al coral la mayor parte del alimento que producen; a cambio, el coral les ofrece refugio y compuestos que necesitan. Las zooxantelas son también las responsables de buena parte del color de los corales. Por eso los arrecifes necesitan luz y crecen en aguas poco profundas y transparentes, pobres en nutrientes.",
          "Charles Darwin propuso en 1842 una explicación de los atolones, anillos de coral en medio del océano que todavía se considera correcta: el arrecife crece alrededor de una isla volcánica y, a medida que la isla se hunde lentamente, el coral sigue creciendo hacia la superficie hasta que solo queda el anillo arrecifal en torno a una laguna. Según la forma, se distinguen arrecifes costeros o de franja, arrecifes de barrera, separados de la costa por una laguna, y atolones.",
        ],
      },
      {
        titulo: "Dónde están",
        parrafos: [
          "La mayor concentración de diversidad de corales se encuentra en el llamado Triángulo de Coral, entre Indonesia, Filipinas, Malasia, Papúa Nueva Guinea, las Islas Salomón y Timor Oriental. La Gran Barrera de Coral de Australia es el mayor sistema arrecifal del mundo, y el arrecife mesoamericano, que se extiende frente a México, Belice, Guatemala y Honduras, es el segundo arrecife de barrera más largo.",
          "El Caribe tiene arrecifes con especies propias, distintas de las del Indopacífico, y los ha visto declinar de forma severa desde la década de 1970 por enfermedades, la muerte masiva del erizo Diadema en 1983, la sobrepesca, la contaminación y el calentamiento. En la República Dominicana, los arrecifes del Parque Nacional del Este, Montecristi o Bayahíbe son importantes para la pesca y el turismo, y existen programas de restauración con viveros de coral.",
        ],
      },
      {
        titulo: "El blanqueamiento",
        parrafos: [
          "Cuando la temperatura del agua sube apenas uno o dos grados por encima del máximo habitual durante varias semanas, la simbiosis se rompe: el coral expulsa sus zooxantelas, pierde el color y deja ver su esqueleto blanco. Un coral blanqueado no está muerto, pero si el calor persiste puede morir de hambre o por enfermedades.",
          "Se han registrado cuatro episodios de blanqueamiento global, en 1998, 2010, 2014-2017 y el que empezó en 2023 y la Administración Nacional Oceánica y Atmosférica de Estados Unidos (NOAA) confirmó en abril de 2024. Este último es el más extenso registrado: según la NOAA y la Iniciativa Internacional sobre los Arrecifes de Coral, ha afectado a más del 80 % de la superficie arrecifal del mundo en más de 80 países y territorios. El IPCC estima que con un calentamiento global de 1,5 °C se perdería entre el 70 % y el 90 % de los arrecifes tropicales, y con 2 °C más del 99 %.",
          "Además del calor, los corales sufren la acidificación del océano, que dificulta la formación de sus esqueletos porque el mar absorbe parte del CO₂ emitido, así como la contaminación por sedimentos y nutrientes, la pesca destructiva y las enfermedades. La protección de los arrecifes combina reducir las emisiones globales con medidas locales: áreas marinas protegidas, control de la contaminación, pesca sostenible y restauración activa.",
        ],
      },
      {
        titulo: "Lo que valen los arrecifes",
        parrafos: [
          "Los arrecifes son una defensa costera natural. Un análisis publicado en 2014 en Nature Communications por Filippo Ferrario y colaboradores, basado en decenas de estudios, estimó que los arrecifes de coral reducen en promedio un 97 % la energía del oleaje que llega a la costa; la cresta del arrecife, por sí sola, disipa la mayor parte. Para islas bajas y costas turísticas, esa protección frente a tormentas y huracanes evita daños materiales enormes y frena la erosión de las playas, cuya arena blanca procede en gran parte de la erosión de los propios corales y de los peces loro que los mordisquean.",
          "Cientos de millones de personas dependen de los arrecifes para alimentarse y ganarse la vida, sobre todo en pequeños Estados insulares y en el sudeste asiático, y el turismo de buceo y playa asociado a ellos genera decenas de miles de millones de dólares al año. Los arrecifes son también una farmacia potencial: de una esponja caribeña, Tectitethya crypta, se aislaron en la década de 1950 los nucleósidos que inspiraron la citarabina, usada contra la leucemia, y fármacos antivirales posteriores. Cada arrecife que se degrada se lleva consigo especies que aún no se han estudiado.",
        ],
      },
    ],
    datos: [
      { etiqueta: "Superficie del fondo oceánico", valor: "< 1 %", fuente: 0 },
      { etiqueta: "Especies marinas que dependen de los arrecifes", valor: "≈ 25 %", fuente: 0 },
      { etiqueta: "Episodios de blanqueamiento global", valor: "4", nota: "1998, 2010, 2014-2017, 2023-", fuente: 1 },
      { etiqueta: "Superficie arrecifal afectada (4.º episodio)", valor: "> 80 %", fuente: 1 },
      { etiqueta: "Pérdida proyectada con +1,5 °C", valor: "70-90 %", nota: "IPCC", fuente: 2 },
      { etiqueta: "Pérdida proyectada con +2 °C", valor: "> 99 %", nota: "IPCC", fuente: 2 },
    ],
    imagenes: [{ clave: "arrecife", alt: "Corales y peces en el arrecife Flynn de la Gran Barrera de Coral", pie: "Corales del arrecife Flynn, Gran Barrera de Coral (Australia)." }],
    fuentes: [
      { titulo: "Coral reef", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/science/coral-reef", tipo: "enciclopedia" },
      { titulo: "NOAA confirms 4th global coral bleaching event", editor: "NOAA", url: "https://www.noaa.gov/news-release/noaa-confirms-4th-global-coral-bleaching-event", tipo: "institucional" },
      { titulo: "Special Report: Global Warming of 1.5 °C", editor: "IPCC (2018)", url: "https://www.ipcc.ch/sr15/", tipo: "institucional" },
      { titulo: "Coral Reef", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/coral-reef/", tipo: "educativa" },
      { titulo: "Arrecife de coral", editor: "Wikipedia en español", url: "https://es.wikipedia.org/wiki/Arrecife_de_coral", tipo: "enciclopedia" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["biodiversidad", "oceania", "selvas-tropicales", "republica-dominicana", "clima-y-biomas", "tectonica-de-placas"],
    conceptos: ["ecosistemas-marinos", "costas", "clima-carbono", "diversidad-biologica"],
    paises: ["au", "id", "ph", "bz", "do", "mv"],
    palabrasClave: ["corales", "arrecifes", "blanqueamiento", "zooxantelas", "atolón", "Gran Barrera", "acidificación", "Triángulo de Coral"],
  },
];
