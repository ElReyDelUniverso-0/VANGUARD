import type { Articulo } from "../tipos";

export const westfalia: Articulo = {
  slug: "westfalia-1648-el-tratado-que-invento-el-mapa-moderno",
  titulo: "Westfalia, 1648: la paz que dio nombre al orden internacional (y el mito que la rodea)",
  entradilla:
    "Cada vez que un gobierno invoca su soberanía o denuncia una injerencia extranjera, repite una idea que los manuales atribuyen a dos tratados firmados hace casi cuatro siglos. La historia real es más interesante.",
  area: "historia",
  tipo: "permanente",
  publicado: "2026-11-18",
  revisado: "2026-11-18",
  revisarCada: 365,
  imagen: "/imagenes-reales/muroberlin.jpg",
  claves: [
    "La Paz de Westfalia son los tratados de Osnabrück y Münster, firmados en 1648, que pusieron fin a la guerra de los Treinta Años y a la de los Ochenta Años.",
    "Reconocieron la independencia de las Provincias Unidas (Países Bajos) y de la Confederación Suiza, y ampliaron la autonomía de los príncipes alemanes.",
    "La «soberanía westfaliana» como principio universal es en gran parte una lectura posterior: el sistema actual descansa en la Carta de la ONU de 1945.",
  ],
  cuerpo: [
    { t: "h2", x: "La guerra que lo hizo necesario", id: "guerra" },
    {
      t: "p",
      x: "La guerra de los Treinta Años (1618-1648) empezó como un conflicto religioso entre católicos y protestantes dentro del Sacro Imperio Romano Germánico y acabó convertida en una guerra europea por la hegemonía, con España, Francia, Suecia y Dinamarca enfrentadas sobre suelo alemán. Ejércitos que vivían del saqueo, hambrunas y epidemias dejaron millones de muertos: algunas regiones alemanas perdieron un tercio o más de su población.",
    },
    { t: "h2", x: "Dos ciudades, dos tratados", id: "tratados" },
    {
      t: "p",
      x: "Las negociaciones duraron años y se repartieron entre dos ciudades de Westfalia: en Osnabrück se reunían el emperador y Suecia con los príncipes protestantes; en Münster, el emperador y Francia. Los acuerdos se firmaron el 24 de octubre de 1648. Antes, en enero de ese año, la Paz de Münster entre España y las Provincias Unidas había cerrado la guerra de los Ochenta Años.",
    },
    {
      t: "datos",
      titulo: "Lo que decidió Westfalia",
      filas: [
        ["Provincias Unidas", "España reconoce su independencia (Paz de Münster, enero de 1648)"],
        ["Confederación Suiza", "queda exenta de la jurisdicción del Imperio"],
        ["Príncipes alemanes", "derecho a firmar alianzas propias, siempre que no fueran contra el emperador"],
        ["Religión", "se confirma la Paz de Augsburgo (1555) y se incluye a los calvinistas"],
        ["Territorios", "Francia gana posiciones en Alsacia; Suecia obtiene territorios en el Báltico"],
      ],
    },
    { t: "h2", x: "El mito de Westfalia", id: "mito" },
    {
      t: "p",
      x: "En las clases de relaciones internacionales se enseña que Westfalia inventó el Estado soberano: territorios con fronteras fijas, iguales entre sí y libres de toda autoridad superior. El historiador Andreas Osiander demostró en 2001 que los tratados no dicen tal cosa. No hablan de soberanía, mantuvieron el Sacro Imperio con su emperador y sus tribunales, e incluso otorgaron a Francia y a Suecia el papel de garantes de la constitución imperial, es decir, un derecho a intervenir en los asuntos alemanes. La imagen de 1648 como acta de nacimiento del sistema de Estados se construyó sobre todo en los siglos XIX y XX.",
    },
    {
      t: "p",
      x: "Eso no le quita importancia. Westfalia fue el primer gran congreso diplomático europeo, consagró la idea de que la guerra se cierra con una negociación multilateral y demostró que la religión ya no podía decidir quién gobernaba en el continente.",
    },
    { t: "h2", x: "Dónde vive hoy el principio", id: "hoy" },
    {
      t: "p",
      x: "Las reglas que se invocan como «westfalianas» están escritas en la Carta de las Naciones Unidas de 1945. Su artículo 2 establece la igualdad soberana de todos los miembros, prohíbe la amenaza o el uso de la fuerza contra la integridad territorial de otro Estado y excluye la intervención de la ONU en los asuntos que son esencialmente de jurisdicción interna, salvo las medidas coercitivas del Consejo de Seguridad.",
    },
    {
      t: "cita",
      x: "Los Miembros de la Organización, en sus relaciones internacionales, se abstendrán de recurrir a la amenaza o al uso de la fuerza contra la integridad territorial o la independencia política de cualquier Estado.",
      de: "Carta de las Naciones Unidas, artículo 2.4",
    },
    {
      t: "p",
      x: "La tensión entre soberanía e intervención, en guerras, sanciones o crisis humanitarias, es el gran debate del orden internacional. Conocer Westfalia, y su mito, ayuda a entender por qué cada bando la invoca a su manera.",
    },
  ],
  fuentes: [
    { nombre: "Avalon Project (Yale) · Treaty of Westphalia (texto)", url: "https://avalon.law.yale.edu/17th_century/westphal.asp", tipo: "primaria" },
    { nombre: "Osiander, A. (2001) · Sovereignty, International Relations, and the Westphalian Myth. International Organization 55(2)", url: "https://doi.org/10.1162/00208180151140577", tipo: "primaria" },
    { nombre: "ONU · Carta de las Naciones Unidas (texto completo)", url: "https://www.un.org/es/about-us/un-charter/full-text", tipo: "primaria" },
    { nombre: "Wikipedia · Paz de Westfalia", url: "https://es.wikipedia.org/wiki/Paz_de_Westfalia", tipo: "secundaria" },
  ],
  enlaces: [
    { href: "/historia", label: "Archivo de guerras" },
    { href: "/archivo-mundial#epocas", label: "Las eras" },
  ],
  salas: ["historia", "epocas"],
  etiquetas: ["Westfalia", "soberanía", "guerra de los Treinta Años", "ONU", "derecho internacional"],
  informe: "Archivo de guerras (/historia) · base doctrinal para las piezas de conflictos",
  complementa: "El archivo de /historia cubre diez guerras; ninguna es la de los Treinta Años ni trata el orden westfaliano",
  cambios: [{ fecha: "2026-11-18", nota: "Publicación." }],
};

export const chips: Articulo = {
  slug: "la-maquina-mas-compleja-del-mundo-chips-y-litografia-euv",
  titulo: "La máquina más compleja del mundo: por qué los chips se han vuelto geopolítica",
  entradilla:
    "Los procesadores más avanzados del planeta dependen de una sola empresa que fabrica las máquinas para imprimirlos y de un puñado de fábricas, la mayoría en Taiwán. Así funciona la cadena y así se disputa.",
  area: "ciencia",
  tipo: "permanente",
  publicado: "2026-11-18",
  revisado: "2026-11-18",
  revisarCada: 90,
  imagen: "/imagenes-reales/gps.jpg",
  claves: [
    "La litografía ultravioleta extrema (EUV), con luz de 13,5 nanómetros, es imprescindible para los chips más avanzados; solo la fabrica la neerlandesa ASML.",
    "La cadena está repartida: diseño en EE. UU., máquinas en Europa y Japón, fabricación de vanguardia en Taiwán y Corea, ensamblaje en el Sudeste Asiático y China.",
    "EE. UU. y la UE intentan relocalizar fábricas con grandes programas de ayudas; EE. UU. y sus aliados limitan la venta de equipos a China.",
  ],
  cuerpo: [
    { t: "h2", x: "Cómo se fabrica un chip", id: "como" },
    {
      t: "p",
      x: "Un chip es una lámina de silicio sobre la que se dibujan miles de millones de transistores, interruptores diminutos que encienden y apagan la corriente. Para dibujarlos se usa la fotolitografía: se proyecta luz a través de una máscara con el diseño sobre una oblea cubierta de un material fotosensible, capa tras capa, decenas de veces. Cuanto más corta es la longitud de onda de la luz, más pequeños pueden ser los transistores y más potente y eficiente es el chip.",
    },
    { t: "h2", x: "EUV: la máquina que nadie más sabe hacer", id: "euv" },
    {
      t: "p",
      x: "La litografía ultravioleta extrema trabaja con luz de 13,5 nanómetros, unas catorce veces más corta que la de la generación anterior. Producirla exige disparar un láser contra gotas de estaño fundido decenas de miles de veces por segundo para generar un plasma, y guiar la luz con espejos de una precisión extraordinaria, todo dentro del vacío, porque el aire la absorbe. La única empresa del mundo que vende estas máquinas es la neerlandesa ASML, con proveedores clave como la óptica alemana Zeiss. Cada sistema tiene el tamaño de un autobús y se transporta desmontado en varios aviones de carga.",
    },
    { t: "h2", x: "Una cadena repartida por el planeta", id: "cadena" },
    {
      t: "tabla",
      cab: ["Eslabón", "Quién domina", "Ejemplos"],
      filas: [
        ["Diseño y software de diseño", "Estados Unidos", "Nvidia, Apple, AMD, Qualcomm; Synopsys y Cadence"],
        ["Equipos de fabricación", "EE. UU., Países Bajos y Japón", "ASML, Applied Materials, Tokyo Electron"],
        ["Fabricación de vanguardia", "Taiwán y Corea del Sur", "TSMC, Samsung"],
        ["Materiales y obleas", "Japón y otros", "Shin-Etsu, SUMCO"],
        ["Ensamblaje y pruebas", "Sudeste Asiático y China", "Malasia, Vietnam, China"],
      ],
      nota: "Esquema general de la cadena de semiconductores; las cuotas exactas varían según el año y el tipo de chip.",
    },
    {
      t: "p",
      x: "Ningún país controla la cadena entera. Esa interdependencia es eficiente, pero también frágil: la escasez de chips de 2020-2022 paró fábricas de automóviles en medio mundo, y la concentración de la fabricación más avanzada en Taiwán convierte cualquier crisis en el estrecho en un riesgo para toda la economía digital.",
    },
    { t: "h2", x: "La carrera por las fábricas", id: "carrera" },
    {
      t: "lista",
      items: [
        "Estados Unidos aprobó en 2022 la Ley CHIPS y de Ciencia, con unos 52.000 millones de dólares para investigación y fabricación nacional.",
        "La Unión Europea aprobó en 2023 la Ley Europea de Chips, que aspira a movilizar más de 43.000 millones de euros y a duplicar su cuota de producción mundial hasta el 20 % en 2030.",
        "Japón, Corea del Sur, India y China mantienen sus propios programas de subvenciones multimillonarios.",
      ],
    },
    { t: "h2", x: "El frente con China", id: "china" },
    {
      t: "p",
      x: "China nunca ha podido comprar máquinas EUV: los Países Bajos no han concedido licencias de exportación para ellas. Desde 2022, EE. UU. restringe además la venta a China de chips avanzados para inteligencia artificial y de herramientas para fabricarlos, y los Países Bajos y Japón han limitado también la exportación de los equipos de generaciones anteriores (DUV). Pekín responde con inversión masiva en su industria propia y con su control de materias primas como el galio, el germanio y las tierras raras.",
    },
    {
      t: "p",
      x: "En la geopolítica del siglo XXI, la capacidad de fabricar chips avanzados pesa tanto como la de producir acero en el siglo XX: es la base de la economía, de la inteligencia artificial y de las armas modernas.",
    },
  ],
  fuentes: [
    { nombre: "ASML · EUV lithography systems", url: "https://www.asml.com/en/products/euv-lithography-systems", tipo: "primaria" },
    { nombre: "Semiconductor Industry Association · Strengthening the global semiconductor supply chain", url: "https://www.semiconductors.org/strengthening-the-global-semiconductor-supply-chain-in-an-uncertain-era/", tipo: "primaria" },
    { nombre: "Comisión Europea · European Chips Act", url: "https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/europe-fit-digital-age/european-chips-act_en", tipo: "primaria" },
  ],
  enlaces: [
    { href: "/conflicto/taiwan", label: "Teatro de Taiwán" },
    { href: "/mundos/tw", label: "Ficha de Taiwán" },
    { href: "/mundos/nl", label: "Ficha de los Países Bajos" },
  ],
  salas: ["maquina", "experimental"],
  etiquetas: ["chips", "semiconductores", "ASML", "Taiwán", "TSMC", "China", "tecnología"],
  informe: "Teatro de Taiwán (/conflicto/taiwan) · enlace con la pieza de tierras raras",
  complementa: "La armería cubre armamento; esta pieza explica la base industrial que lo hace posible",
  cambios: [{ fecha: "2026-11-18", nota: "Publicación." }],
};

export const verificar: Articulo = {
  slug: "como-verificar-una-foto-o-un-video-de-una-guerra",
  titulo: "Cómo verificar una foto o un vídeo de una guerra en siete pasos",
  entradilla:
    "En cada conflicto circulan imágenes antiguas, de otros países o generadas por inteligencia artificial. Estas son las técnicas que usan los verificadores profesionales, al alcance de cualquiera.",
  area: "educacion",
  tipo: "permanente",
  publicado: "2026-11-18",
  revisado: "2026-11-18",
  revisarCada: 120,
  imagen: "/imagenes-reales/control.jpg",
  claves: [
    "La primera pregunta no es «¿es verdad?», sino «¿cuándo y dónde se grabó por primera vez?».",
    "La búsqueda inversa de imágenes, la geolocalización y la sombra del sol resuelven la mayoría de los casos.",
    "Ningún detector de inteligencia artificial es infalible: la prueba más sólida sigue siendo encontrar el origen.",
  ],
  cuerpo: [
    { t: "h2", x: "Antes de empezar: detente", id: "detente" },
    {
      t: "p",
      x: "La desinformación de guerra funciona porque llega en el momento de máxima emoción. Si una imagen te indigna o te alegra mucho, es exactamente cuando conviene esperar antes de compartirla. Muchas falsificaciones no son montajes: son imágenes reales sacadas de contexto, de otra guerra, de otro año o de un videojuego.",
    },
    { t: "h2", x: "Los siete pasos", id: "pasos" },
    {
      t: "lista",
      numerada: true,
      items: [
        "Busca el origen. ¿Quién lo publicó primero? Retrocede por las cuentas que lo comparten hasta la más antigua. Una imagen sin fuente original es una alerta.",
        "Haz una búsqueda inversa. Sube la imagen, o fotogramas del vídeo, a varios buscadores (Google Lens, Bing, Yandex, TinEye). Si aparece publicada años antes, ya tienes la respuesta. El complemento InVID-WeVerify extrae fotogramas clave y lanza estas búsquedas de una vez.",
        "Geolocaliza. Fíjate en carteles, edificios, montañas, postes o señales de tráfico y compáralos con mapas y vistas de calle. Los manuales de Bellingcat enseñan a hacerlo paso a paso.",
        "Comprueba la hora con el sol. La longitud y la dirección de las sombras indican la hora aproximada. Herramientas como SunCalc muestran la posición del sol en cualquier lugar y fecha.",
        "Mira desde el espacio. Para incendios, cráteres o edificios destruidos, compara imágenes de satélite de antes y después. El EO Browser de Sentinel Hub da acceso gratuito a imágenes de los satélites europeos Sentinel.",
        "Busca señales de inteligencia artificial. Manos, textos ilegibles, sombras incoherentes o rostros que se deforman en el movimiento. Comprueba también si el archivo trae credenciales de contenido (estándar C2PA), que registran cómo y con qué se creó.",
        "Contrasta. ¿Lo confirman agencias, verificadores profesionales u otras grabaciones del mismo hecho desde ángulos distintos? Una sola fuente nunca basta.",
      ],
    },
    { t: "h2", x: "Las trampas más comunes", id: "trampas" },
    {
      t: "tabla",
      cab: ["Trampa", "Cómo detectarla"],
      filas: [
        ["Imagen de otra guerra", "La búsqueda inversa la encuentra publicada antes"],
        ["Escenas de videojuego", "Física extraña, iluminación perfecta, interfaz recortada en los bordes"],
        ["Vídeo recortado", "Busca la versión más larga: el contexto suele cambiar el sentido"],
        ["Pie de foto falso", "La imagen es real, el texto que la acompaña no: verifica el lugar y la fecha"],
        ["Imagen generada por IA", "Detalles incoherentes y ausencia de cualquier fuente original"],
      ],
    },
    { t: "h2", x: "Una regla para quedarse", id: "regla" },
    {
      t: "p",
      x: "Verificar no es demostrar que algo es falso, sino reunir pruebas sobre su origen. A veces la conclusión honesta es «no se puede confirmar», y decirlo también es periodismo. Vanguard aplica estos pasos a los cables de sus salas y marca como «sin confirmar» lo que no ha podido comprobar.",
    },
  ],
  fuentes: [
    { nombre: "InVID-WeVerify · complemento de verificación", url: "https://www.invid-project.eu/tools-and-services/invid-verification-plugin/", tipo: "primaria" },
    { nombre: "Bellingcat · Guías y tutoriales", url: "https://www.bellingcat.com/category/resources/how-tos/", tipo: "primaria" },
    { nombre: "SunCalc · posición del sol", url: "https://www.suncalc.org", tipo: "primaria" },
    { nombre: "Sentinel Hub · EO Browser", url: "https://apps.sentinel-hub.com/eo-browser/", tipo: "primaria" },
    { nombre: "C2PA · Coalition for Content Provenance and Authenticity", url: "https://c2pa.org", tipo: "primaria" },
  ],
  enlaces: [
    { href: "/verdad-cruda", label: "Verdad cruda" },
    { href: "/herramientas", label: "Herramientas" },
  ],
  salas: ["verifica", "osint"],
  etiquetas: ["verificación", "OSINT", "desinformación", "inteligencia artificial", "educación mediática"],
  informe: "Criterios de verificación de la redacción (/editorial/calendario#verificacion)",
  complementa: "Las salas clásicas «verifica» y «osint» son herramientas; esta pieza es el método escrito",
  cambios: [{ fecha: "2026-11-18", nota: "Publicación." }],
};

export const reconocimiento: Articulo = {
  slug: "estados-con-reconocimiento-limitado",
  titulo: "¿Cuántos países hay en el mundo? Los Estados que existen solo a medias",
  entradilla:
    "La ONU tiene 193 miembros, pero el mapa tiene más fronteras que eso. Taiwán, Kosovo, Palestina o Somalilandia muestran que ser un Estado depende tanto de los hechos como del reconocimiento de los demás.",
  area: "paises",
  tipo: "permanente",
  publicado: "2026-11-18",
  revisado: "2026-11-18",
  revisarCada: 60,
  imagen: "/imagenes-reales/satelite.jpg",
  claves: [
    "La ONU tiene 193 Estados miembros y dos Estados observadores: la Santa Sede y Palestina.",
    "El derecho internacional suele citar cuatro requisitos (Montevideo, 1933): población, territorio, gobierno y capacidad de relacionarse con otros Estados.",
    "Varias entidades cumplen esos requisitos de hecho, pero no logran el reconocimiento de la mayoría de los Estados.",
  ],
  cuerpo: [
    { t: "h2", x: "La respuesta corta: depende de a quién preguntes", id: "respuesta" },
    {
      t: "p",
      x: "La cifra más usada es 193, los Estados miembros de las Naciones Unidas. A ellos se suman dos Estados observadores no miembros: la Santa Sede y, desde la resolución 67/19 de la Asamblea General de 2012, Palestina. El mapa de Vanguard muestra 249 fichas porque sigue el estándar ISO 3166, que incluye también territorios dependientes como Puerto Rico, Groenlandia o las Malvinas. Ese mismo estándar muestra los límites del recuento: Taiwán y Palestina tienen código propio, pero Kosovo no lo tiene oficialmente y usa «XK», un código provisional que reconocen la Unión Europea y otros organismos.",
    },
    { t: "h2", x: "Qué hace falta para ser un Estado", id: "requisitos" },
    {
      t: "p",
      x: "La Convención de Montevideo de 1933 enumeró cuatro requisitos: una población permanente, un territorio definido, un gobierno y la capacidad de entablar relaciones con otros Estados. Pero el reconocimiento de los demás es lo que abre la puerta a la ONU, a los préstamos internacionales, a los pasaportes válidos y a las embajadas. Para ingresar en la ONU hace falta la recomendación del Consejo de Seguridad, donde cada uno de los cinco miembros permanentes tiene derecho de veto, y el voto de dos tercios de la Asamblea General.",
    },
    { t: "h2", x: "Los casos principales", id: "casos" },
    {
      t: "tabla",
      cab: ["Entidad", "Situación", "Quién la reconoce"],
      filas: [
        ["Palestina", "Estado observador en la ONU desde 2012", "La gran mayoría de los miembros de la ONU, tras la ola de reconocimientos de 2025"],
        ["Taiwán (República de China)", "Gobierno propio desde 1949; China lo reclama", "Una docena de Estados mantienen relaciones oficiales"],
        ["Kosovo", "Independencia declarada en 2008 frente a Serbia", "Alrededor de un centenar de Estados, según el recuento"],
        ["Sahara Occidental (RASD)", "Territorio no autónomo según la ONU; mayoritariamente controlado por Marruecos", "Miembro de la Unión Africana; reconocimientos cambiantes"],
        ["Chipre del Norte", "Autoproclamada en 1983 tras la invasión turca de 1974", "Solo Turquía"],
        ["Abjasia y Osetia del Sur", "Separadas de Georgia; con presencia militar rusa", "Rusia y unos pocos Estados más"],
        ["Somalilandia", "Separada de Somalia en 1991; gobierno y moneda propios", "Israel, desde diciembre de 2025"],
        ["Transnistria", "Separada de Moldavia tras la guerra de 1992", "Ningún Estado miembro de la ONU"],
      ],
      nota: "El número de reconocimientos cambia con frecuencia y varía según la fuente; Vanguard revisa esta tabla cada dos meses.",
    },
    { t: "h2", x: "Por qué importa", id: "importa" },
    {
      t: "lista",
      items: [
        "Seguridad: varios de estos territorios son focos de tensión entre potencias, como el estrecho de Taiwán o el Cáucaso.",
        "Comercio y finanzas: sin reconocimiento es difícil acceder a créditos, firmar tratados o proteger inversiones.",
        "Vida cotidiana: millones de personas viven con pasaportes que muchos países no aceptan.",
        "Precedente: cada reconocimiento se usa como argumento en otros casos, por eso los Estados con movimientos separatistas propios suelen ser los más reacios.",
      ],
    },
    {
      t: "p",
      x: "La cifra de «países del mundo» no es solo un dato de geografía: es el resultado de decisiones políticas que se renegocian cada año.",
    },
  ],
  fuentes: [
    { nombre: "ONU · Estados miembros", url: "https://www.un.org/es/about-us/member-states", tipo: "primaria" },
    { nombre: "ONU · Resolución A/RES/67/19 (Palestina, Estado observador no miembro)", url: "https://undocs.org/es/A/RES/67/19", tipo: "primaria" },
    { nombre: "ONU · Carta de las Naciones Unidas, artículo 4 (admisión de miembros)", url: "https://www.un.org/es/about-us/un-charter/full-text", tipo: "primaria" },
    { nombre: "Wikipedia · International recognition of Somaliland", url: "https://en.wikipedia.org/wiki/International_recognition_of_Somaliland", tipo: "secundaria" },
    { nombre: "Wikipedia · Estados con reconocimiento limitado", url: "https://es.wikipedia.org/wiki/Estados_con_reconocimiento_limitado", tipo: "secundaria" },
    { nombre: "Wikipedia · ISO 3166-1", url: "https://es.wikipedia.org/wiki/ISO_3166-1", tipo: "secundaria" },
  ],
  enlaces: [
    { href: "/mundos", label: "Los 249 mundos" },
    { href: "/mundos/tw", label: "Ficha de Taiwán" },
    { href: "/mundos/ps", label: "Ficha de Palestina" },
  ],
  salas: ["atlas", "mundo"],
  etiquetas: ["soberanía", "reconocimiento", "ONU", "Taiwán", "Kosovo", "Palestina", "Somalilandia"],
  informe: "Censo de /mundos (249 fichas ISO 3166) · revisión bimestral",
  complementa: "Las fichas de /mundos dan los datos de cada país; esta pieza explica por qué el recuento no es único",
  cambios: [{ fecha: "2026-11-18", nota: "Publicación." }],
};

export const muertos: Articulo = {
  slug: "como-se-cuentan-los-muertos-de-una-guerra",
  titulo: "Cómo se cuentan los muertos de una guerra (y por qué las cifras nunca coinciden)",
  entradilla:
    "Tras cada bombardeo llegan números distintos según quién los dé. No siempre es propaganda: hay métodos diferentes que miden cosas diferentes. Saber cuáles son es la mejor defensa contra la manipulación.",
  area: "conflictos",
  tipo: "permanente",
  publicado: "2026-11-18",
  revisado: "2026-11-18",
  revisarCada: 180,
  imagen: "/imagenes-reales/losangeles.jpg",
  claves: [
    "Muertes en combate, muertes violentas de civiles y exceso de mortalidad son tres medidas distintas.",
    "El UCDP de Uppsala llama «conflicto armado» a partir de 25 muertes en combate al año y «guerra» a partir de 1.000.",
    "El caso de Irak lo resume: el recuento documental de Iraq Body Count y la encuesta de The Lancet de 2006 diferían en cientos de miles.",
  ],
  cuerpo: [
    { t: "h2", x: "Tres preguntas distintas", id: "tres-preguntas" },
    {
      t: "lista",
      items: [
        "Muertes en combate: soldados y civiles que mueren en los enfrentamientos entre las partes armadas.",
        "Muertes violentas totales: todas las personas muertas por la violencia, incluidas masacres, ejecuciones y bombardeos sobre civiles.",
        "Exceso de mortalidad: todas las muertes que no habrían ocurrido sin la guerra, incluidas las causadas por hambre, enfermedades u hospitales destruidos. Suele ser la cifra más alta.",
      ],
    },
    {
      t: "p",
      x: "Cuando dos fuentes dan cifras muy diferentes, lo primero es comprobar si están respondiendo a la misma pregunta.",
    },
    { t: "h2", x: "Los métodos", id: "metodos" },
    {
      t: "tabla",
      cab: ["Método", "Cómo funciona", "Ventaja", "Límite"],
      filas: [
        ["Recuento documental", "Suma muertes confirmadas por prensa, hospitales y depósitos (p. ej., Iraq Body Count)", "Cada muerte tiene nombre, fecha o fuente", "Infraestima: lo que nadie reporta no se cuenta"],
        ["Registros oficiales", "Ministerios de Sanidad, ejércitos, autoridades locales", "Cobertura amplia", "Puede estar sesgado por la parte en guerra"],
        ["Bases de eventos", "Codifican cada incidente con fecha y lugar (UCDP, ACLED)", "Comparables entre países y años", "Dependen de las fuentes disponibles"],
        ["Encuestas en hogares", "Se pregunta a una muestra por las muertes en la familia y se extrapola", "Captura muertes no reportadas", "Margen de error amplio; difícil en zona de guerra"],
      ],
    },
    { t: "h2", x: "Las definiciones del UCDP", id: "ucdp" },
    {
      t: "p",
      x: "El Programa de Datos sobre Conflictos de Uppsala (UCDP), en Suecia, mantiene una de las bases de datos más usadas por académicos y gobiernos. Para el UCDP, un conflicto armado es una disputa sobre un gobierno o un territorio en la que se usa la fuerza armada entre dos partes, al menos una de ellas un Estado, y que causa como mínimo 25 muertes en combate en un año. Cuando supera las 1.000 muertes anuales, lo clasifica como guerra. También distingue la violencia entre grupos no estatales y la violencia unilateral contra civiles.",
    },
    { t: "h2", x: "El caso de Irak", id: "irak" },
    {
      t: "p",
      x: "En 2006, una encuesta en hogares publicada en The Lancet estimó unas 655.000 muertes en exceso en Irak desde la invasión de 2003. En las mismas fechas, el recuento documental de Iraq Body Count registraba una cifra de civiles muertos por la violencia varias veces menor. Las dos medían cosas distintas, con métodos distintos, y el debate entre ambas sigue siendo un caso de estudio sobre cómo medir la guerra.",
    },
    { t: "h2", x: "Cinco preguntas ante cualquier cifra", id: "preguntas" },
    {
      t: "lista",
      numerada: true,
      items: [
        "¿Quién la da? ¿Es una parte del conflicto, un organismo internacional o un equipo académico?",
        "¿Qué mide? ¿Combatientes, civiles, todos? ¿Muertes directas o exceso de mortalidad?",
        "¿Qué periodo y qué territorio cubre?",
        "¿Explica su método y su margen de error?",
        "¿Coincide, al menos en orden de magnitud, con otras fuentes independientes?",
      ],
    },
    {
      t: "aviso",
      x: "Vanguard publica las cifras de víctimas siempre con su fuente y su fecha, y señala cuándo proceden de una de las partes en guerra.",
    },
  ],
  fuentes: [
    { nombre: "UCDP (Universidad de Uppsala) · Definiciones", url: "https://www.uu.se/en/department/peace-and-conflict-research/research/ucdp/ucdp-definitions", tipo: "primaria" },
    { nombre: "ACLED · Armed Conflict Location & Event Data", url: "https://acleddata.com", tipo: "primaria" },
    { nombre: "Iraq Body Count", url: "https://www.iraqbodycount.org", tipo: "primaria" },
    { nombre: "Burnham, G. et al. (2006) · Mortality after the 2003 invasion of Iraq. The Lancet 368", url: "https://doi.org/10.1016/S0140-6736(06)69491-9", tipo: "primaria" },
    { nombre: "Wikipedia · Geneva Declaration on Armed Violence and Development", url: "https://en.wikipedia.org/wiki/Geneva_Declaration_on_Armed_Violence_and_Development", tipo: "secundaria" },
  ],
  enlaces: [
    { href: "/guerra-hoy", label: "Guerra hoy" },
    { href: "/verdad-cruda", label: "Verdad cruda" },
    { href: "/conflictos", label: "Conflictos" },
  ],
  salas: ["contadores", "memorial"],
  etiquetas: ["víctimas", "estadística", "UCDP", "ACLED", "Irak", "metodología"],
  informe: "Contadores de la sala de guerra (/sala/contadores) · criterio de cifras de víctimas",
  complementa: "Los contadores muestran cifras; esta pieza explica cómo leerlas",
  cambios: [{ fecha: "2026-11-18", nota: "Publicación." }],
};
