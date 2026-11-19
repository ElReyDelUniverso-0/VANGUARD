import type { Articulo } from "../tipos";

// v417.0 — LOS SEIS CONTINENTES. Cifras con su año y su fuente; cuando la
// cifra depende de una convención (límites, cómputo de Estados) se dice.

const WPP = {
  titulo: "World Population Prospects 2024",
  editor: "Naciones Unidas · División de Población (DESA)",
  url: "https://population.un.org/wpp/",
  tipo: "datos" as const,
};

export const CONTINENTES: Articulo[] = [
  {
    slug: "africa",
    titulo: "África",
    categoria: "continentes",
    bajada: "La cuna de la humanidad, el continente más joven del planeta y una de las grandes reservas de recursos y lenguas del mundo.",
    introduccion: [
      "África es el segundo continente más extenso y el segundo más poblado de la Tierra. Ocupa alrededor de una quinta parte de la superficie emergida y está atravesado casi por la mitad por el ecuador, lo que explica que contenga a la vez el mayor desierto cálido del planeta, el Sahara, y la segunda gran selva tropical, la de la cuenca del Congo.",
      "Es también el lugar donde surgió nuestra especie. Los fósiles más antiguos atribuidos a Homo sapiens, hallados en Jebel Irhoud (Marruecos), tienen unos 300.000 años, y toda la población humana actual desciende de grupos que vivieron en África antes de dispersarse por el resto del mundo. Hoy es el continente con la población más joven y la que más crece: buena parte del aumento de la población mundial de aquí a 2050 ocurrirá en África.",
    ],
    secciones: [
      {
        titulo: "Relieve, aguas y climas",
        parrafos: [
          "Gran parte de África es una sucesión de mesetas antiguas, más altas en el sur y el este que en el oeste. La gran excepción es el sistema del Rift de África Oriental, una fractura de la corteza donde la placa africana se está separando lentamente: allí se alinean volcanes como el Kilimanjaro (5.895 m, el punto más alto del continente) y lagos profundos y alargados como el Tanganica y el Malaui.",
          "Los grandes ríos organizan la vida del continente. El Nilo, de unos 6.650 km, ha sostenido la agricultura del valle egipcio durante más de cinco milenios; el Congo es el segundo río del mundo por caudal; el Níger y el Zambeze articulan África occidental y austral. El lago Victoria, compartido por Uganda, Kenia y Tanzania, es el mayor lago de África y uno de los mayores de agua dulce del mundo.",
          "Los climas se ordenan casi en espejo a ambos lados del ecuador: selvas húmedas en el centro, sabanas con una estación seca marcada a su alrededor, estepas y desiertos —el Sahara al norte, el Kalahari y el Namib al sur— y franjas de clima mediterráneo en los extremos norte y sur. El régimen de lluvias del Sahel, la franja de transición al sur del Sahara, es uno de los más variables del mundo, y sus sequías han marcado la historia reciente de la región.",
        ],
      },
      {
        titulo: "Pueblos, lenguas y sociedades",
        parrafos: [
          "África concentra una diversidad cultural extraordinaria. Se hablan allí más de 2.000 lenguas, alrededor de un tercio de las del mundo, repartidas en grandes familias como la níger-congo (que incluye las lenguas bantúes), la afroasiática (árabe, bereber, hausa, amárico), la nilo-sahariana y las lenguas joisán del sur. A ellas se suman lenguas de comunicación amplia como el suajili y las lenguas heredadas de la colonización, sobre todo inglés, francés y portugués, que muchos Estados mantienen como oficiales.",
          "Su rasgo demográfico más llamativo es la juventud: la edad mediana ronda los 19 años, frente a más de 40 en Europa. Esto significa que millones de personas llegan cada año a la edad de trabajar, una oportunidad económica si encuentran empleo y educación, y una presión fuerte sobre ciudades, escuelas y servicios si no lo encuentran. Las ciudades crecen con rapidez: Lagos, Kinshasa, El Cairo o Luanda están entre las aglomeraciones de crecimiento más veloz del planeta.",
          "Las religiones mayoritarias son el cristianismo, dominante al sur del Sahara, y el islam, mayoritario en el norte y en buena parte del Sahel y de la costa oriental, ambos con fuertes rasgos locales y en convivencia con religiones tradicionales africanas.",
        ],
      },
      {
        titulo: "Recursos y economía",
        parrafos: [
          "El subsuelo africano es uno de los más ricos del mundo: el continente produce gran parte del cobalto del planeta (sobre todo la República Democrática del Congo), del platino (Sudáfrica), y tiene reservas importantes de oro, diamantes, bauxita, uranio, petróleo y gas. Esa riqueza no se ha traducido de forma automática en desarrollo: la dependencia de exportar materias primas sin transformar expone a muchas economías a la volatilidad de los precios, un fenómeno que los economistas estudian como «maldición de los recursos».",
          "La agricultura sigue empleando a una parte muy grande de la población, aunque con productividades bajas en muchas regiones. Al mismo tiempo crecen sectores nuevos: servicios financieros por teléfono móvil —con el caso pionero de M-Pesa en Kenia—, telecomunicaciones, energías renovables y manufactura ligera. El Área de Libre Comercio Continental Africana (AfCFTA), en vigor desde 2019 y con comercio operativo desde 2021, aspira a crear el mayor mercado del mundo por número de países participantes.",
        ],
      },
      {
        titulo: "África en el mundo de hoy",
        parrafos: [
          "La Unión Africana, que sucedió en 2002 a la Organización para la Unidad Africana (1963), agrupa a todos los Estados del continente y actúa en mediación de conflictos, integración económica y representación internacional; desde 2023 es miembro permanente del G20. El continente sigue afrontando conflictos armados persistentes —en el Sahel, el este de la República Democrática del Congo o Sudán—, pero también ha protagonizado algunas de las mejoras más rápidas del mundo en esperanza de vida, escolarización y acceso a la telefonía.",
        ],
      },
    ],
    historia: {
      titulo: "Contexto histórico",
      parrafos: [
        "En África nacieron algunas de las civilizaciones más antiguas: el Egipto faraónico (desde finales del IV milenio a. C.), el reino de Kush en el actual Sudán, el reino de Aksum en Etiopía y Eritrea —uno de los primeros Estados en adoptar el cristianismo, en el siglo IV— y, más tarde, los imperios de Ghana, Mali y Songhay en el Sahel occidental, enriquecidos por el comercio transahariano de oro y sal. La peregrinación a La Meca del emperador maliense Mansa Musa en 1324 hizo famosa en todo el Mediterráneo la riqueza de Mali. En el sur y el este florecieron el Gran Zimbabue y las ciudades suajilis del Índico, conectadas con Arabia, la India y China.",
        "Entre los siglos XVI y XIX, la trata atlántica de esclavos arrancó a más de 12 millones de personas de África con destino a América, con consecuencias demográficas, políticas y sociales profundas a ambos lados del océano. En la Conferencia de Berlín (1884-1885) las potencias europeas fijaron reglas para repartirse el continente; hacia 1914 solo Etiopía y Liberia conservaban la independencia.",
        "La descolonización llegó sobre todo entre 1950 y 1975: Ghana se independizó en 1957 y en 1960, el «año de África», lo hicieron diecisiete países. Las fronteras trazadas en la época colonial, a menudo sin relación con la geografía humana, siguen influyendo en la política del continente. El fin del apartheid en Sudáfrica, con las elecciones de 1994, cerró el último gran régimen de dominación racial institucionalizada.",
      ],
    },
    datos: [
      { etiqueta: "Superficie", valor: "≈ 30,3 millones de km²", nota: "alrededor del 20 % de la tierra emergida", fuente: 0 },
      { etiqueta: "Población", valor: "≈ 1.500 millones", nota: "estimación de 2024", fuente: 2 },
      { etiqueta: "Estados soberanos", valor: "54", nota: "miembros de la ONU", fuente: 0 },
      { etiqueta: "Punto más alto", valor: "Kilimanjaro, 5.895 m", nota: "Tanzania", fuente: 1 },
      { etiqueta: "Río más largo", valor: "Nilo, ≈ 6.650 km", fuente: 0 },
      { etiqueta: "Lenguas habladas", valor: "más de 2.000", nota: "cerca de un tercio de las del mundo", fuente: 1 },
    ],
    cronologia: [
      { fecha: "hace ≈ 300.000 años", texto: "Fósiles de Homo sapiens de Jebel Irhoud (Marruecos)." },
      { fecha: "≈ 3100 a. C.", texto: "Unificación del Egipto faraónico." },
      { fecha: "siglo IV", texto: "El reino de Aksum adopta el cristianismo." },
      { fecha: "1324", texto: "Peregrinación de Mansa Musa de Mali a La Meca." },
      { fecha: "1884-1885", texto: "Conferencia de Berlín y reparto colonial." },
      { fecha: "1960", texto: "«Año de África»: diecisiete independencias." },
      { fecha: "1994", texto: "Primeras elecciones multirraciales en Sudáfrica." },
      { fecha: "2021", texto: "Comienza a operar el comercio de la AfCFTA." },
    ],
    imagenes: [{ clave: "africa", alt: "Globo terráqueo centrado en África", pie: "África en proyección ortográfica: el continente se extiende casi por igual a ambos lados del ecuador." }],
    fuentes: [
      { titulo: "Africa", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/place/Africa", tipo: "enciclopedia" },
      { titulo: "Africa: Human Geography / Physical Geography", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/africa/", tipo: "educativa" },
      WPP,
      { titulo: "África", editor: "Wikipedia en español", url: "https://es.wikipedia.org/wiki/%C3%81frica", tipo: "enciclopedia" },
      { titulo: "Unión Africana — Estados miembros", editor: "Unión Africana", url: "https://au.int/en/member_states/countryprofiles2", tipo: "institucional" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["asia", "europa", "poblacion-mundial", "lenguas-del-mundo", "selvas-tropicales", "sistema-naciones-unidas"],
    lingua: [{ ruta: "/lingua/familias/atla1278", texto: "Familia atlántico-congo" }, { ruta: "/lingua/familias/afro1255", texto: "Familia afroasiática" }],
    conceptos: ["descolonizacion", "rentas-recursos", "demografia-transicion"],
    organizaciones: ["union-africana"],
    civilizaciones: ["egipto", "aksum", "mali"],
    paises: ["eg", "ng", "et", "cd", "za", "ke"],
    palabrasClave: ["Sahara", "Nilo", "Rift", "Sahel", "Unión Africana", "AfCFTA", "descolonización", "Homo sapiens"],
  },
  {
    slug: "america",
    titulo: "América",
    categoria: "continentes",
    bajada: "Un continente que va del Ártico al cabo de Hornos: la cordillera más larga, el río más caudaloso y una historia marcada por el encuentro de pueblos.",
    introduccion: [
      "América es la masa continental que se extiende desde el océano Glacial Ártico hasta el cabo de Hornos, a lo largo de más de 14.000 km de norte a sur. En la tradición geográfica hispana se considera un solo continente con tres partes —América del Norte, América Central con el Caribe y América del Sur—; en la tradición anglosajona se suele hablar de dos continentes, América del Norte y América del Sur. Ambas convenciones describen la misma realidad física.",
      "Su historia humana es más reciente que la de África, Asia o Europa, pero no menos rica: pueblos originarios desarrollaron de forma independiente la agricultura, las ciudades, la escritura y grandes Estados. Desde 1492 el continente fue escenario de la colonización europea, del colapso demográfico de sus pueblos indígenas y de la trata de millones de africanos esclavizados, procesos que dieron forma a sociedades profundamente mestizas.",
    ],
    secciones: [
      {
        titulo: "Un relieve de cordilleras y llanuras",
        parrafos: [
          "La estructura de América es sencilla a gran escala: una larga franja montañosa en el oeste, joven y activa, y grandes llanuras y escudos antiguos en el centro y el este. En el norte, las Montañas Rocosas y la cordillera costera; en el sur, los Andes, la cordillera continental más larga del mundo, de unos 7.000 km, cuya cumbre, el Aconcagua (6.961 m), es el punto más alto fuera de Asia. Ese borde occidental forma parte del Cinturón de Fuego del Pacífico, por lo que concentra volcanes y terremotos.",
          "Entre las montañas se abren llanuras inmensas: las Grandes Llanuras norteamericanas, los Llanos del Orinoco, la Pampa y, sobre todo, la cuenca del Amazonas. El Amazonas es el río de mayor caudal del planeta —vierte al Atlántico más agua que los siete ríos siguientes juntos— y su cuenca, de unos 7 millones de km², alberga la mayor selva tropical del mundo. En el norte, el sistema del Misisipi-Misuri y los Grandes Lagos, el mayor conjunto de agua dulce superficial de la Tierra, articulan el interior de América del Norte.",
        ],
      },
      {
        titulo: "Diversidad natural",
        parrafos: [
          "Por su enorme extensión en latitud, América reúne casi todos los climas de la Tierra: tundra y taiga en el norte, desiertos como el de Atacama —uno de los lugares más secos del planeta—, selvas ecuatoriales, sabanas, bosques templados lluviosos en la Patagonia chilena y glaciares en ambos extremos. Varios de los países considerados «megadiversos», como Brasil, Colombia, México, Perú y Ecuador, están en el continente.",
          "El Caribe, un mar semicerrado salpicado de islas, merece mención propia: es una región de arrecifes de coral, manglares y especies endémicas, muy expuesta a los huracanes que se forman en el Atlántico tropical entre junio y noviembre.",
        ],
      },
      {
        titulo: "Sociedades y economía",
        parrafos: [
          "Viven en América algo más de 1.000 millones de personas, repartidas en 35 Estados soberanos y varios territorios dependientes. El español, el inglés y el portugués son las lenguas más habladas, junto a centenares de lenguas indígenas —quechua, guaraní, náhuatl, aimara o las lenguas mayas, entre otras— y lenguas criollas como el criollo haitiano.",
          "Las economías son muy dispares. Estados Unidos es la mayor economía del mundo y Canadá una de las más ricas; América Latina y el Caribe forman una región de ingresos medios, altamente urbanizada, con grandes exportadores de materias primas agrícolas, mineras y energéticas, y con algunos de los niveles de desigualdad de ingresos más altos del mundo. La integración regional se ha ensayado por muchas vías: la OEA (1948), el Mercosur, la Comunidad Andina, el SICA, la CARICOM y el T-MEC, entre otras.",
        ],
      },
      {
        titulo: "Culturas del encuentro",
        parrafos: [
          "La cultura americana es, ante todo, una cultura de mezcla. El intercambio que siguió a 1492, al que el historiador Alfred Crosby llamó «intercambio colombino», cambió la alimentación del planeta: de América salieron el maíz, la papa, el tomate, el cacao, el ají, la yuca y el tabaco, y a América llegaron el trigo, la caña de azúcar, el café, el ganado vacuno y el caballo. Hoy la papa y el maíz están entre los alimentos básicos de buena parte de la humanidad.",
          "En la música, la religión, la cocina y la lengua se reconoce la huella simultánea de pueblos indígenas, europeos y africanos, a los que se sumaron más tarde inmigrantes asiáticos y de Oriente Medio. Del jazz y el blues al son cubano, el tango, la samba, la cumbia, el merengue o el reggae, muchos de los géneros musicales más influyentes del siglo XX nacieron de esa convergencia. La literatura latinoamericana, con seis premios Nobel concedidos a autores americanos en lengua española, de Gabriela Mistral (1945) a Mario Vargas Llosa (2010), pasando por Asturias, Neruda, García Márquez y Paz, es otra de sus grandes aportaciones al patrimonio universal.",
        ],
      },
    ],
    historia: {
      titulo: "Contexto histórico",
      parrafos: [
        "Los primeros pobladores llegaron desde Asia, probablemente a través de Beringia, el puente de tierra que unía Siberia y Alaska durante la última glaciación. La fecha es objeto de debate activo: el yacimiento de Monte Verde, en Chile, tiene unos 14.500 años, y huellas humanas halladas en White Sands (Nuevo México) se han datado en unos 21.000-23.000 años, una cronología que todavía se discute.",
        "Sobre esa base surgieron civilizaciones originales. Caral, en la costa de Perú, fue un centro urbano hace casi 5.000 años. Los olmecas, los mayas —con su escritura plenamente desarrollada y su astronomía—, Teotihuacán, los mexicas con su capital Tenochtitlan (fundada hacia 1325) y el Tawantinsuyu inca, que en el siglo XV unía más de 4.000 km de los Andes con una red de caminos, son algunos de sus logros mayores.",
        "La llegada de Cristóbal Colón al Caribe en 1492 abrió una conquista y colonización europea que provocó un colapso demográfico de enorme magnitud, causado sobre todo por epidemias, guerras y trabajos forzados. Millones de africanos esclavizados fueron trasladados al continente. Las independencias llegaron en oleadas: Estados Unidos (1776), Haití (1804), primera república independiente fundada tras una revolución de esclavizados, las repúblicas hispanoamericanas entre 1810 y 1825 y el Imperio del Brasil en 1822.",
      ],
    },
    datos: [
      { etiqueta: "Superficie", valor: "≈ 42 millones de km²", nota: "Norte, Centro y Caribe ≈ 24,7; Sur ≈ 17,8", fuente: 0 },
      { etiqueta: "Población", valor: "algo más de 1.000 millones", nota: "estimación de 2024", fuente: 2 },
      { etiqueta: "Estados soberanos", valor: "35", fuente: 0 },
      { etiqueta: "Punto más alto", valor: "Aconcagua, 6.961 m", nota: "Argentina", fuente: 0 },
      { etiqueta: "Cordillera más larga del mundo", valor: "Andes, ≈ 7.000 km", fuente: 1 },
      { etiqueta: "Río de mayor caudal del mundo", valor: "Amazonas", nota: "cuenca ≈ 7 millones de km²", fuente: 1 },
    ],
    cronologia: [
      { fecha: "≈ 14.500 años", texto: "Ocupación humana de Monte Verde (Chile)." },
      { fecha: "≈ 2600 a. C.", texto: "Apogeo de Caral, en la costa central de Perú." },
      { fecha: "250-900", texto: "Período Clásico maya." },
      { fecha: "1492", texto: "Llegada de Colón al Caribe." },
      { fecha: "1776", texto: "Declaración de independencia de Estados Unidos." },
      { fecha: "1804", texto: "Independencia de Haití." },
      { fecha: "1810-1825", texto: "Independencias hispanoamericanas." },
      { fecha: "1948", texto: "Fundación de la Organización de los Estados Americanos." },
    ],
    imagenes: [{ clave: "america", alt: "Globo terráqueo centrado en el continente americano", pie: "América en proyección ortográfica, del Ártico al cabo de Hornos." }],
    fuentes: [
      { titulo: "South America / North America", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/place/South-America", tipo: "enciclopedia" },
      { titulo: "South America", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/south-america/", tipo: "educativa" },
      WPP,
      { titulo: "América", editor: "Wikipedia en español", url: "https://es.wikipedia.org/wiki/Am%C3%A9rica", tipo: "enciclopedia" },
      { titulo: "North America", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/north-america/", tipo: "educativa" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["republica-dominicana", "pueblos-tainos", "selvas-tropicales", "europa", "lenguas-del-mundo", "tectonica-de-placas"],
    conceptos: ["descolonizacion", "desigualdad", "cuencas"],
    organizaciones: ["mercosur", "comunidad-andina", "sica", "caricom", "t-mec"],
    civilizaciones: ["maya", "teotihuacan", "inca", "mexica"],
    paises: ["us", "br", "mx", "ar", "co", "pe", "ht", "do"],
    palabrasClave: ["Andes", "Amazonas", "Caribe", "Beringia", "mayas", "incas", "independencias", "OEA"],
  },
  {
    slug: "asia",
    titulo: "Asia",
    categoria: "continentes",
    bajada: "El continente más grande y más poblado: el techo del mundo, las primeras ciudades y el centro de gravedad de la economía del siglo XXI.",
    introduccion: [
      "Asia es el mayor de los continentes: ocupa cerca de un tercio de la tierra emergida y en ella vive alrededor del 60 % de la humanidad. Contiene a la vez el punto más alto del planeta, el Everest, la depresión continental más profunda, la orilla del mar Muerto, el lago más profundo, el Baikal, y algunas de las mayores llanuras y desiertos del mundo.",
      "Fue escenario de varias de las primeras civilizaciones —en Mesopotamia, el valle del Indo y la China del río Amarillo— y lugar de nacimiento de las grandes religiones con más fieles. En las últimas décadas se ha convertido en el principal motor del crecimiento económico mundial.",
    ],
    secciones: [
      {
        titulo: "Dónde empieza y dónde termina",
        parrafos: [
          "Asia y Europa forman físicamente una sola masa, Eurasia; la frontera entre ambas es una convención histórica que suele trazarse por los montes Urales, el río Ural, el mar Caspio y el Cáucaso, y por los estrechos del Bósforo y los Dardanelos. Por eso algunos países, como Rusia, Turquía, Kazajistán o Georgia, se consideran transcontinentales, y el número de Estados asiáticos varía —en torno a cuarenta y ocho— según el criterio que se use. Al sureste, la frontera con Oceanía también es convencional y se discute en el caso de Nueva Guinea.",
        ],
      },
      {
        titulo: "Relieve y climas extremos",
        parrafos: [
          "El rasgo dominante del relieve asiático es el gran arco montañoso que forman el Himalaya, el Karakórum, el Hindu Kush y el Pamir, levantado por la colisión de la placa india con la euroasiática, un proceso que continúa. Allí están las catorce montañas de más de 8.000 metros, incluido el Everest, cuya altura oficial, 8.848,86 m, fue medida conjuntamente por China y Nepal en 2020. Al norte se extiende la meseta del Tíbet, la más alta y extensa del mundo.",
          "De esas montañas nacen los grandes ríos que alimentan a miles de millones de personas: el Yangtsé (unos 6.300 km, el más largo de Asia) y el Amarillo en China, el Ganges y el Brahmaputra en el subcontinente indio, el Indo, el Mekong y el Irawadi. El clima de buena parte del sur y el este de Asia está gobernado por el monzón, la inversión estacional de los vientos que trae lluvias intensas en verano y de la que dependen las cosechas de arroz.",
          "En contraste, el interior del continente es seco y continental: desiertos como el Gobi, el Taklamakán o el de Arabia, estepas en Asia central y los inviernos extremos de Siberia, donde se han registrado algunas de las temperaturas más bajas del hemisferio norte. El lago Baikal, en Siberia, con 1.642 m de profundidad, es el más profundo y antiguo del mundo y guarda alrededor de una quinta parte del agua dulce superficial no congelada del planeta.",
        ],
      },
      {
        titulo: "Pueblos, religiones y culturas",
        parrafos: [
          "En Asia nacieron el hinduismo, el budismo, el judaísmo, el cristianismo, el islam y el sijismo, además de tradiciones filosóficas como el confucianismo y el taoísmo. Sus dos países más poblados, India y China, superan cada uno los 1.400 millones de habitantes; India pasó a ser el más poblado del mundo en 2023, según Naciones Unidas.",
          "Su diversidad lingüística es inmensa: el chino mandarín es la lengua con más hablantes nativos del mundo, y conviven familias tan distintas como la sinotibetana, la indoeuropea (hindi, bengalí, persa), la austronesia (indonesio, tagalo), la dravídica (tamil), la túrquica, la semítica (árabe, hebreo) y lenguas aisladas como el japonés y el coreano.",
        ],
      },
      {
        titulo: "El centro de la economía mundial",
        parrafos: [
          "Tras siglos en que China y la India figuraban entre las mayores economías del mundo, la industrialización europea y la colonización desplazaron ese peso hacia Occidente en los siglos XIX y XX. La recuperación empezó con Japón tras la Restauración Meiji (1868) y, después de 1945, con su reconstrucción, siguió con los llamados «tigres asiáticos» (Corea del Sur, Taiwán, Hong Kong y Singapur) y se aceleró con las reformas chinas iniciadas en 1978 y la apertura de la India en 1991. Hoy Asia concentra las mayores fábricas, los puertos más activos y buena parte de la producción mundial de semiconductores, aunque persisten grandes bolsas de pobreza y fuertes tensiones geopolíticas.",
        ],
      },
    ],
    historia: {
      titulo: "Contexto histórico",
      parrafos: [
        "En Mesopotamia aparecieron hacia el IV milenio a. C. algunas de las primeras ciudades y la escritura; la civilización del Indo levantó entre 2600 y 1900 a. C. ciudades planificadas como Mohenjo-Daro y Harappa; en China, la dinastía Shang (hacia 1600-1046 a. C.) dejó las inscripciones más antiguas de la escritura china. Los grandes imperios —persa aqueménida, Maurya, Han, abasí, mongol, otomano, mogol o Ming— conectaron el continente mediante redes de caravanas y rutas marítimas que en el siglo XIX el geógrafo alemán Ferdinand von Richthofen bautizó como «Ruta de la Seda».",
        "El Imperio mongol del siglo XIII fue el mayor imperio terrestre contiguo de la historia. Desde el siglo XVI las potencias europeas se instalaron en las costas y, en el XIX, buena parte del continente quedó bajo dominio colonial o semicolonial. Las independencias de la segunda mitad del siglo XX —Filipinas (1946), India y Pakistán (1947), Indonesia (proclamada en 1945 y reconocida en 1949)— y la fundación de la República Popular China (1949) redibujaron el mapa político.",
      ],
    },
    datos: [
      { etiqueta: "Superficie", valor: "≈ 44,6 millones de km²", nota: "≈ 30 % de la tierra emergida", fuente: 0 },
      { etiqueta: "Población", valor: "≈ 4.800 millones", nota: "≈ 59 % de la humanidad, 2024", fuente: 2 },
      { etiqueta: "Punto más alto", valor: "Everest, 8.848,86 m", nota: "medición China-Nepal de 2020", fuente: 0 },
      { etiqueta: "Lago más profundo", valor: "Baikal, 1.642 m", fuente: 0 },
      { etiqueta: "Río más largo", valor: "Yangtsé, ≈ 6.300 km", fuente: 0 },
      { etiqueta: "País más poblado del mundo", valor: "India", nota: "desde 2023", fuente: 2 },
    ],
    cronologia: [
      { fecha: "≈ 3200 a. C.", texto: "Primeros textos cuneiformes en Mesopotamia." },
      { fecha: "2600-1900 a. C.", texto: "Fase madura de la civilización del Indo." },
      { fecha: "221 a. C.", texto: "Unificación imperial de China por los Qin." },
      { fecha: "siglo XIII", texto: "Máxima extensión del Imperio mongol." },
      { fecha: "1868", texto: "Restauración Meiji en Japón." },
      { fecha: "1947", texto: "Independencia y partición de la India británica." },
      { fecha: "1978", texto: "Inicio de las reformas económicas chinas." },
      { fecha: "2023", texto: "India supera a China como país más poblado." },
    ],
    imagenes: [
      { clave: "asia", alt: "Globo terráqueo centrado en Asia", pie: "Asia en proyección ortográfica: el mayor de los continentes." },
      { clave: "everest", alt: "Vista del monte Everest y la cordillera del Himalaya", pie: "El Everest en el Himalaya, punto más alto de la Tierra." },
    ],
    fuentes: [
      { titulo: "Asia", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/place/Asia", tipo: "enciclopedia" },
      { titulo: "Asia: Physical Geography", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/asia/", tipo: "educativa" },
      WPP,
      { titulo: "Asia", editor: "Wikipedia en español", url: "https://es.wikipedia.org/wiki/Asia", tipo: "enciclopedia" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["mesopotamia", "europa", "tectonica-de-placas", "religiones-del-mundo", "lenguas-del-mundo", "poblacion-mundial"],
    conceptos: ["estados-antiguos", "cadenas-valor", "semiconductores"],
    organizaciones: ["asean", "ocs", "brics"],
    civilizaciones: ["sumer", "indo", "shang", "han", "persia", "angkor", "song"],
    paises: ["cn", "in", "jp", "id", "kr", "sa", "np"],
    palabrasClave: ["Himalaya", "Everest", "monzón", "Ruta de la Seda", "Baikal", "Eurasia", "tigres asiáticos"],
  },
  {
    slug: "europa",
    titulo: "Europa",
    categoria: "continentes",
    bajada: "Una península de Eurasia, pequeña en superficie y decisiva en la historia moderna, hoy unida en buena parte por un proyecto de integración sin precedentes.",
    introduccion: [
      "Europa es, en sentido estricto, la gran península occidental de Eurasia. Su separación de Asia no responde a un océano sino a una convención trazada por geógrafos a partir del siglo XVIII. Es uno de los continentes más pequeños —alrededor del 7 % de la tierra emergida—, pero también uno de los más densamente poblados y urbanizados.",
      "Su influencia en la historia moderna ha sido desproporcionada respecto a su tamaño: de Europa partieron la expansión ultramarina, la revolución científica, la industrialización y los grandes imperios coloniales, pero también las dos guerras mundiales del siglo XX. Tras ellas, buena parte del continente construyó la Unión Europea, una forma de integración entre Estados soberanos sin equivalente en el mundo.",
    ],
    secciones: [
      {
        titulo: "Límites y relieve",
        parrafos: [
          "La frontera oriental de Europa se fija por convención en los montes Urales, el río Ural, el mar Caspio y el Cáucaso, aunque algunos autores prefieren la depresión de Kuma-Manych, al norte del Cáucaso. De esa elección depende cuál es su montaña más alta: el Elbrus (5.642 m), en el Cáucaso, o el Mont Blanc (unos 4.806 m), en los Alpes.",
          "El relieve combina tres grandes conjuntos: la gran llanura europea, que se extiende desde Francia hasta los Urales; los macizos antiguos y desgastados, como el escandinavo o el central francés; y las cordilleras jóvenes del sur, formadas por la presión de la placa africana —Alpes, Pirineos, Cárpatos, Apeninos, Balcanes—. La costa es extraordinariamente recortada, con penínsulas, fiordos, islas y mares interiores, lo que explica la temprana vocación marítima de muchos pueblos europeos.",
          "Los ríos han sido ejes de comercio y de frontera: el Volga, el más largo de Europa (unos 3.530 km), desemboca en el Caspio; el Danubio atraviesa o bordea diez países; el Rin une los Alpes con el mar del Norte y es una de las vías fluviales más transitadas del mundo.",
        ],
      },
      {
        titulo: "Climas templados por el océano",
        parrafos: [
          "Para su latitud, Europa occidental es notablemente templada. La deriva noratlántica, prolongación de la corriente del Golfo, y los vientos del oeste suavizan los inviernos de las costas atlánticas, de modo que ciudades como Londres o Bergen son mucho menos frías que otras situadas a la misma latitud en Canadá o Siberia. Hacia el este el clima se vuelve continental, con inviernos fríos y veranos cálidos, y en el sur domina el clima mediterráneo, de veranos secos.",
        ],
      },
      {
        titulo: "Sociedad, lenguas y economía",
        parrafos: [
          "Viven en Europa unos 745 millones de personas. Es la población más envejecida del mundo, con una edad mediana superior a los 40 años y tasas de fecundidad por debajo del nivel de reemplazo en casi todos los países; la inmigración aporta buena parte de su crecimiento demográfico. La mayoría de sus lenguas pertenecen a la familia indoeuropea —ramas románica, germánica, eslava, celta, báltica, griega—, con excepciones como el húngaro, el finés y el estonio (urálicas), el vasco (aislada) o el turco y el maltés.",
          "Europa alberga algunas de las economías más ricas del mundo y un denso sistema de protección social. La Unión Europea, con 27 Estados miembros desde la salida del Reino Unido en 2020, funciona como un mercado único con libre circulación de bienes, servicios, capitales y personas; veinte de sus miembros comparten el euro. El Consejo de Europa, distinto de la Unión, vela por los derechos humanos a través del Tribunal Europeo de Derechos Humanos.",
        ],
      },
    ],
    historia: {
      titulo: "Contexto histórico",
      parrafos: [
        "La Grecia antigua y Roma legaron a Europa instituciones, lenguas, derecho y formas de pensamiento. Tras la caída del Imperio romano de Occidente (476) se formaron los reinos medievales, unidos por la cristiandad latina en el oeste y por el Imperio bizantino en el este. El Renacimiento, la difusión de la imprenta de tipos móviles a partir de mediados del siglo XV y la Reforma protestante (1517) transformaron la cultura y la religión del continente.",
        "Desde el siglo XV, los viajes oceánicos portugueses y españoles abrieron una expansión colonial que, con Gran Bretaña, Francia y Países Bajos, llegó a abarcar buena parte del planeta. La revolución científica, la Ilustración, la Revolución francesa (1789) y la Revolución industrial, iniciada en Gran Bretaña en el siglo XVIII, configuraron el mundo moderno.",
        "El siglo XX fue el de las dos guerras mundiales, el Holocausto y la división del continente durante la Guerra Fría. La integración europea arrancó con la Comunidad Europea del Carbón y del Acero (1951) y los Tratados de Roma (1957), se profundizó con el Tratado de Maastricht (1992) y se amplió hacia el este tras la caída del Muro de Berlín (1989). La invasión rusa de Ucrania en 2022 devolvió la guerra a gran escala al continente.",
      ],
    },
    datos: [
      { etiqueta: "Superficie", valor: "≈ 10,2 millones de km²", nota: "según el límite convencional", fuente: 0 },
      { etiqueta: "Población", valor: "≈ 745 millones", nota: "estimación de 2024", fuente: 2 },
      { etiqueta: "Punto más alto", valor: "Elbrus, 5.642 m", nota: "si el Cáucaso se incluye en Europa", fuente: 0 },
      { etiqueta: "Río más largo", valor: "Volga, ≈ 3.530 km", fuente: 0 },
      { etiqueta: "Estados de la Unión Europea", valor: "27", nota: "desde 2020", fuente: 3 },
      { etiqueta: "Países que usan el euro", valor: "20", nota: "zona del euro", fuente: 3 },
    ],
    cronologia: [
      { fecha: "siglo V a. C.", texto: "Atenas clásica." },
      { fecha: "476", texto: "Fin del Imperio romano de Occidente." },
      { fecha: "≈ 1450", texto: "Difusión de la imprenta de tipos móviles." },
      { fecha: "1517", texto: "Comienzo de la Reforma protestante." },
      { fecha: "1789", texto: "Revolución francesa." },
      { fecha: "1914-1918 / 1939-1945", texto: "Primera y Segunda Guerra Mundial." },
      { fecha: "1957", texto: "Tratados de Roma." },
      { fecha: "1989", texto: "Caída del Muro de Berlín." },
    ],
    imagenes: [{ clave: "europa", alt: "Globo terráqueo centrado en Europa", pie: "Europa en proyección ortográfica: la gran península occidental de Eurasia." }],
    fuentes: [
      { titulo: "Europe", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/place/Europe", tipo: "enciclopedia" },
      { titulo: "Europe: Physical Geography", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/europe/", tipo: "educativa" },
      WPP,
      { titulo: "Países de la UE", editor: "Unión Europea", url: "https://european-union.europa.eu/principles-countries-history/eu-countries_es", tipo: "institucional" },
      { titulo: "Europa", editor: "Wikipedia en español", url: "https://es.wikipedia.org/wiki/Europa", tipo: "enciclopedia" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["asia", "revolucion-cientifica", "lenguas-del-mundo", "religiones-del-mundo", "sistema-naciones-unidas", "africa"],
    conceptos: ["revolucion-industrial", "envejecimiento", "soberania"],
    organizaciones: ["union-europea", "otan", "g7"],
    civilizaciones: ["grecia", "roma"],
    paises: ["fr", "de", "es", "it", "gb", "ru", "ua", "pl"],
    palabrasClave: ["Eurasia", "Urales", "Alpes", "corriente del Golfo", "Unión Europea", "euro", "Renacimiento"],
  },
  {
    slug: "oceania",
    titulo: "Oceanía",
    categoria: "continentes",
    bajada: "Un continente hecho de océano: Australia, Nueva Guinea, Nueva Zelanda y miles de islas poblados por algunos de los mejores navegantes de la historia.",
    introduccion: [
      "Oceanía agrupa Australia, Nueva Guinea, Nueva Zelanda y las islas del Pacífico central y sur. Es el continente con menos tierra firme y menos población después de la Antártida, pero ocupa una porción inmensa del planeta si se cuenta el océano que lo une: sus islas se dispersan por una superficie marina mayor que la de cualquier otro continente.",
      "Su historia humana incluye dos hazañas excepcionales: la llegada de los antepasados de los pueblos aborígenes australianos hace al menos 50.000 años, una de las presencias culturales continuas más antiguas del mundo, y la expansión de los pueblos austronesios por el Pacífico, que culminó con la colonización de Aotearoa (Nueva Zelanda), una de las últimas grandes tierras habitables en ser pobladas.",
    ],
    secciones: [
      {
        titulo: "Cuatro regiones",
        parrafos: [
          "Por tradición, Oceanía se divide en Australasia (Australia y Nueva Zelanda), Melanesia (Nueva Guinea, Islas Salomón, Vanuatu, Fiyi, Nueva Caledonia), Micronesia (islas pequeñas al norte del ecuador, como Palaos, Guam, Kiribati o las Marshall) y Polinesia (el gran triángulo entre Hawái, Nueva Zelanda y Rapa Nui o isla de Pascua). La clasificación procede del navegante francés Jules Dumont d'Urville, en el siglo XIX, y hoy se usa con cautela porque agrupa pueblos muy distintos y arrastra prejuicios de su época.",
          "El continente tiene catorce Estados soberanos —Australia, Nueva Zelanda, Papúa Nueva Guinea, Fiyi, Islas Salomón, Vanuatu, Samoa, Tonga, Kiribati, Tuvalu, Nauru, Palaos, Islas Marshall y Estados Federados de Micronesia— y varios territorios dependientes de Francia, Estados Unidos, Nueva Zelanda o el Reino Unido.",
        ],
      },
      {
        titulo: "Tierras e islas",
        parrafos: [
          "Australia, con 7,7 millones de km², es una masa antigua y en gran parte árida: más de dos tercios de su territorio reciben poca lluvia, y la población se concentra en la franja costera del este y el sureste. Su aislamiento prolongado explica una fauna singular, con marsupiales como el canguro y el koala y monotremas como el ornitorrinco.",
          "Nueva Guinea, la segunda isla más grande del mundo, es montañosa y selvática, y alberga una de las mayores concentraciones de lenguas del planeta: solo Papúa Nueva Guinea cuenta con más de 800. Nueva Zelanda, de origen volcánico y tectónico, tiene glaciares, fiordos y volcanes activos. Las islas del Pacífico son de dos tipos: altas, de origen volcánico, y bajas, atolones de coral que apenas se elevan unos metros sobre el mar.",
          "Frente a la costa de Queensland se extiende la Gran Barrera de Coral, el mayor sistema arrecifal del mundo, de unos 2.300 km, declarado Patrimonio Mundial por la UNESCO en 1981. Ha sufrido varios episodios de blanqueamiento masivo en la última década por el calentamiento del agua.",
        ],
      },
      {
        titulo: "El clima como cuestión de supervivencia",
        parrafos: [
          "Para los Estados formados por atolones, como Tuvalu, Kiribati o las Islas Marshall, la subida del nivel del mar no es un riesgo futuro sino una amenaza a su propia existencia territorial. Los países del Foro de las Islas del Pacífico han sido de los más activos en la diplomacia climática internacional, y en 2023 Australia y Tuvalu firmaron el tratado de la Unión Falepili, que incluye una vía de movilidad para ciudadanos tuvaluanos ante los efectos del cambio climático.",
        ],
      },
    ],
    historia: {
      titulo: "Contexto histórico",
      parrafos: [
        "Los antepasados de los aborígenes australianos y de los pueblos de Nueva Guinea llegaron cuando el nivel del mar era más bajo y ambas tierras formaban el continente de Sahul, aunque aun así tuvieron que cruzar brazos de mar. Las fechas exactas se debaten: hay consenso en que la presencia humana supera los 50.000 años y algunos yacimientos apuntan a fechas aún más antiguas.",
        "Mucho después, pueblos de lengua austronesia procedentes del sudeste asiático se expandieron por el Pacífico. La cultura lapita, reconocible por su cerámica decorada, se extendió entre aproximadamente 1600 y 500 a. C. hasta Fiyi, Tonga y Samoa. Desde allí, navegantes polinesios orientados por las estrellas, el oleaje, las aves y los vientos alcanzaron Hawái, Rapa Nui y, hacia los siglos XIII y XIV, Aotearoa.",
        "La exploración europea se intensificó en el siglo XVIII con los viajes de James Cook. En 1788 llegó a Australia la primera flota de convictos británicos, inicio de una colonización que desposeyó a los pueblos aborígenes de sus tierras; en 1840 se firmó en Nueva Zelanda el Tratado de Waitangi entre la Corona británica y jefes maoríes, aún hoy fundamento de la relación entre ambos. Samoa fue en 1962 la primera nación insular del Pacífico en recuperar la independencia.",
      ],
    },
    datos: [
      { etiqueta: "Superficie terrestre", valor: "≈ 8,5 millones de km²", fuente: 0 },
      { etiqueta: "Población", valor: "≈ 46 millones", nota: "estimación de 2024", fuente: 2 },
      { etiqueta: "Estados soberanos", valor: "14", fuente: 0 },
      { etiqueta: "Superficie de Australia", valor: "≈ 7,7 millones de km²", fuente: 0 },
      { etiqueta: "Gran Barrera de Coral", valor: "≈ 2.300 km", nota: "Patrimonio Mundial desde 1981", fuente: 3 },
      { etiqueta: "Lenguas en Papúa Nueva Guinea", valor: "más de 800", fuente: 1 },
    ],
    cronologia: [
      { fecha: "hace > 50.000 años", texto: "Primeros pobladores de Sahul (Australia y Nueva Guinea)." },
      { fecha: "≈ 1600-500 a. C.", texto: "Expansión de la cultura lapita." },
      { fecha: "siglos XIII-XIV", texto: "Llegada polinesia a Aotearoa (Nueva Zelanda)." },
      { fecha: "1770", texto: "James Cook recorre la costa oriental de Australia." },
      { fecha: "1788", texto: "Llega a Australia la primera flota británica." },
      { fecha: "1840", texto: "Tratado de Waitangi." },
      { fecha: "1962", texto: "Independencia de Samoa." },
      { fecha: "2023", texto: "Tratado de la Unión Falepili entre Australia y Tuvalu." },
    ],
    imagenes: [
      { clave: "oceania", alt: "Globo terráqueo centrado en Oceanía", pie: "Oceanía: Australia, Nueva Guinea, Nueva Zelanda y las islas del Pacífico." },
      { clave: "arrecife", alt: "Afloramiento de coral en el arrecife Flynn de la Gran Barrera", pie: "Corales del arrecife Flynn, en la Gran Barrera de Coral (Queensland)." },
    ],
    fuentes: [
      { titulo: "Oceania", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/place/Oceania-region-Pacific-Ocean", tipo: "enciclopedia" },
      { titulo: "Australia, Papua New Guinea and the Pacific Islands", editor: "Ethnologue · Wikipedia en español (Oceanía)", url: "https://es.wikipedia.org/wiki/Ocean%C3%ADa", tipo: "enciclopedia" },
      WPP,
      { titulo: "Great Barrier Reef", editor: "UNESCO · Centro del Patrimonio Mundial", url: "https://whc.unesco.org/en/list/154/", tipo: "institucional" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["asia", "biodiversidad", "clima-y-biomas", "lenguas-del-mundo", "antartida", "tectonica-de-placas"],
    lingua: [{ ruta: "/lingua/familias/aust1307", texto: "Familia austronesia" }, { ruta: "/lingua/familias/pama1250", texto: "Familia pama-ñungana" }],
    conceptos: ["costas", "riesgo-climatico", "ecosistemas-marinos"],
    paises: ["au", "nz", "pg", "fj", "tv", "ki", "ws"],
    palabrasClave: ["Australia", "Polinesia", "Melanesia", "Micronesia", "Gran Barrera de Coral", "atolones", "lapita", "maoríes"],
  },
  {
    slug: "antartida",
    titulo: "Antártida",
    categoria: "continentes",
    bajada: "El continente más frío, seco y ventoso: un desierto de hielo sin población permanente, gobernado por un tratado que lo reserva a la paz y a la ciencia.",
    introduccion: [
      "La Antártida es el continente que rodea el polo sur. Con unos 14 millones de km², es más extensa que Europa y que Oceanía, pero casi toda su superficie —alrededor del 98 %— está cubierta por un manto de hielo que en algunos puntos supera los 4.000 metros de espesor. Ese hielo contiene la mayor reserva de agua dulce del planeta.",
      "No tiene población permanente ni Estados propios. Siete países reclaman parte de su territorio, pero desde 1959 el Tratado Antártico ha congelado esas reclamaciones y ha convertido el continente en un espacio dedicado a la investigación científica, sin actividades militares ni explotación minera.",
    ],
    secciones: [
      {
        titulo: "Un desierto de hielo",
        parrafos: [
          "Aunque está cubierta de hielo, la Antártida es técnicamente un desierto: en su interior caen muy pocas precipitaciones, y el hielo se ha acumulado a lo largo de cientos de miles de años porque casi nunca se funde. Es el continente más frío, más seco, más ventoso y, por el grosor de su hielo, el de mayor altitud media. En la estación rusa de Vostok se registró el 21 de julio de 1983 una temperatura de −89,2 °C, la más baja medida directamente en la superficie terrestre según la Organización Meteorológica Mundial.",
          "La cordillera Transantártica divide el continente en dos partes de distinto carácter: la Antártida oriental, más extensa y elevada, que descansa sobre un escudo continental antiguo, y la Antártida occidental, cuyo hielo se apoya en gran parte sobre un lecho situado bajo el nivel del mar, lo que la hace más vulnerable al calentamiento del océano. Si todo el hielo antártico se fundiera, el nivel medio del mar subiría alrededor de 58 metros; nadie prevé algo así a escala de siglos, pero incluso pérdidas parciales tienen efectos importantes sobre las costas del mundo.",
        ],
      },
      {
        titulo: "Un archivo del clima y un laboratorio",
        parrafos: [
          "El hielo antártico es un archivo natural: las burbujas de aire atrapadas en él conservan muestras de la atmósfera del pasado. El testigo de hielo del proyecto europeo EPICA en el Domo C permitió reconstruir unos 800.000 años de temperaturas y de concentraciones de dióxido de carbono, y mostró la estrecha relación entre ambas a lo largo de los ciclos glaciales.",
          "Allí se descubrió también, en 1985, el agujero de la capa de ozono: científicos del British Antarctic Survey publicaron la disminución drástica del ozono estratosférico sobre el continente en primavera, causada por los clorofluorocarbonos. El hallazgo condujo al Protocolo de Montreal (1987), considerado uno de los acuerdos ambientales más eficaces de la historia; la capa de ozono está en vías de recuperación.",
          "Unas setenta estaciones científicas de una treintena de países trabajan en el continente. En verano viven allí unos pocos miles de personas y en invierno alrededor de un millar.",
        ],
      },
      {
        titulo: "La vida en el océano Austral",
        parrafos: [
          "La vida antártica depende del mar. El océano Austral, que rodea el continente, es muy rico en nutrientes y sostiene enormes cantidades de kril, un pequeño crustáceo que es la base de la cadena alimentaria de ballenas, focas, pingüinos y aves marinas. El pingüino emperador, que se reproduce sobre el hielo en pleno invierno, es la especie más emblemática. La Convención para la Conservación de los Recursos Vivos Marinos Antárticos (CCRVMA, 1980) regula la pesca, y en 2016 se acordó la creación del área marina protegida del mar de Ross, una de las mayores del mundo.",
        ],
      },
    ],
    historia: {
      titulo: "Contexto histórico",
      parrafos: [
        "La existencia de una gran tierra austral fue imaginada desde la Antigüedad, pero el continente no fue avistado hasta 1820, por expediciones rusas, británicas y estadounidenses casi simultáneas. A comienzos del siglo XX se vivió la llamada «edad heroica» de la exploración: el noruego Roald Amundsen alcanzó el polo sur el 14 de diciembre de 1911, y el británico Robert Falcon Scott llegó el 17 de enero de 1912 y murió con sus compañeros en el regreso.",
        "Durante el Año Geofísico Internacional (1957-1958), doce países establecieron bases científicas y colaboraron pese a la Guerra Fría. Esa experiencia llevó a la firma del Tratado Antártico en Washington el 1 de diciembre de 1959, en vigor desde 1961: reserva el continente para fines pacíficos, garantiza la libertad de investigación, prohíbe las explosiones nucleares y congela las reclamaciones territoriales de Argentina, Australia, Chile, Francia, Noruega, Nueva Zelanda y el Reino Unido. El Protocolo de Madrid (1991), en vigor desde 1998, designó la Antártida «reserva natural consagrada a la paz y a la ciencia» y prohibió toda actividad minera no científica.",
      ],
    },
    datos: [
      { etiqueta: "Superficie", valor: "≈ 14,2 millones de km²", fuente: 0 },
      { etiqueta: "Cubierta de hielo", valor: "≈ 98 %", fuente: 1 },
      { etiqueta: "Temperatura más baja medida", valor: "−89,2 °C", nota: "Vostok, 21 de julio de 1983", fuente: 4 },
      { etiqueta: "Subida del mar si se fundiera todo su hielo", valor: "≈ 58 m", fuente: 3 },
      { etiqueta: "Población permanente", valor: "ninguna", nota: "unos pocos miles de científicos en verano", fuente: 0 },
      { etiqueta: "Tratado Antártico", valor: "firmado en 1959", nota: "en vigor desde 1961", fuente: 2 },
    ],
    cronologia: [
      { fecha: "1820", texto: "Primeros avistamientos del continente." },
      { fecha: "1911", texto: "Amundsen alcanza el polo sur." },
      { fecha: "1957-1958", texto: "Año Geofísico Internacional." },
      { fecha: "1959", texto: "Firma del Tratado Antártico." },
      { fecha: "1983", texto: "−89,2 °C en la estación Vostok." },
      { fecha: "1985", texto: "Se publica el descubrimiento del agujero de ozono." },
      { fecha: "1991", texto: "Protocolo de Madrid sobre protección ambiental." },
      { fecha: "2016", texto: "Acuerdo sobre el área marina protegida del mar de Ross." },
    ],
    imagenes: [{ clave: "antartida", alt: "La Antártida vista desde el espacio en el mosaico Blue Marble de la NASA", pie: "La Antártida en el mosaico Blue Marble (NASA): casi todo el continente es hielo." }],
    fuentes: [
      { titulo: "Antarctica", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/place/Antarctica", tipo: "enciclopedia" },
      { titulo: "Antarctica", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/antarctica/", tipo: "educativa" },
      { titulo: "The Antarctic Treaty", editor: "Secretaría del Tratado Antártico", url: "https://www.ats.aq/e/antarctictreaty.html", tipo: "institucional" },
      { titulo: "Quick Facts on Ice Sheets", editor: "National Snow and Ice Data Center (NSIDC)", url: "https://nsidc.org/learn/parts-cryosphere/ice-sheets/ice-sheet-quick-facts", tipo: "datos" },
      { titulo: "WMO Weather and Climate Extremes Archive", editor: "Organización Meteorológica Mundial", url: "https://wmo.asu.edu/", tipo: "datos" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["oceania", "agua-dulce", "clima-y-biomas", "sistema-naciones-unidas", "biodiversidad", "tectonica-de-placas"],
    conceptos: ["clima-carbono", "circulacion-oceanica", "ecosistemas-marinos"],
    paises: ["ar", "cl", "au", "nz", "no"],
    palabrasClave: ["Tratado Antártico", "polo sur", "hielo", "Vostok", "ozono", "EPICA", "kril", "Protocolo de Madrid"],
  },
];
