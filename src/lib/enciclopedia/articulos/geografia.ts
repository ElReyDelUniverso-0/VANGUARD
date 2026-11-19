import type { Articulo } from "../tipos";

// v417.0 — GEOGRAFÍA FÍSICA, GEOGRAFÍA HUMANA Y RECURSOS NATURALES.

export const GEOGRAFIA: Articulo[] = [
  {
    slug: "tectonica-de-placas",
    titulo: "Tectónica de placas",
    categoria: "geografia-fisica",
    bajada: "La teoría que explica por qué se mueven los continentes, dónde nacen las montañas y por qué los terremotos y volcanes se concentran en ciertas franjas.",
    introduccion: [
      "La tectónica de placas es la teoría científica que describe la capa exterior rígida de la Tierra, la litosfera, como un mosaico de grandes fragmentos —las placas— que se desplazan lentamente sobre una capa más caliente y deformable del manto, la astenosfera. Se mueven a velocidades de pocos centímetros al año, más o menos lo que crecen las uñas, pero a lo largo de millones de años esos movimientos abren océanos, levantan cordilleras y cambian por completo el mapa del mundo.",
      "Es para la geología lo que la evolución es para la biología: el marco que da sentido a observaciones que antes parecían inconexas, desde la forma de las costas y la distribución de los fósiles hasta el mapa mundial de los terremotos.",
    ],
    secciones: [
      {
        titulo: "Las placas y su motor",
        parrafos: [
          "Se reconocen siete u ocho grandes placas —Pacífica, Norteamericana, Sudamericana, Euroasiática, Africana, Indoaustraliana (a veces dividida en India y Australia) y Antártica— y decenas de placas menores, como la de Nazca, la de Cocos, la Filipina, la Arábiga o la del Caribe. Algunas llevan sobre ellas corteza continental, más gruesa y ligera; otras, corteza oceánica, más delgada y densa.",
          "El motor del movimiento es el calor interno de la Tierra, que procede en buena parte de la desintegración de elementos radiactivos. Ese calor mantiene en convección muy lenta el manto, pero hoy se considera que la fuerza principal es el propio peso de la litosfera oceánica, que al enfriarse y volverse más densa se hunde en las zonas de subducción y «tira» del resto de la placa.",
        ],
      },
      {
        titulo: "Tres tipos de límites",
        parrafos: [
          "En los límites divergentes las placas se separan y el magma asciende para formar nueva corteza. Ocurre sobre todo en las dorsales oceánicas, como la dorsal mesoatlántica, una cadena volcánica submarina que recorre el Atlántico de norte a sur y que asoma en Islandia; en tierra, el Rift de África Oriental es un ejemplo de continente que comienza a abrirse.",
          "En los límites convergentes las placas chocan. Si una es oceánica, se hunde bajo la otra (subducción), lo que genera fosas profundas —la de las Marianas supera los 10.900 metros—, volcanes explosivos y los terremotos más potentes, como el de Chile de 1960 (magnitud 9,5, el mayor registrado) o el de Japón de 2011. Si chocan dos continentes, ninguno se hunde con facilidad y la corteza se pliega y engrosa: así se levantaron el Himalaya y la meseta del Tíbet, por la colisión de la India con Asia, que continúa a unos 4-5 cm al año.",
          "En los límites transformantes las placas se deslizan lateralmente una junto a otra. La falla de San Andrés en California y la falla septentrional que atraviesa el norte de La Española son ejemplos de este tipo, capaces de generar terremotos destructivos sin vulcanismo asociado.",
        ],
      },
      {
        titulo: "Consecuencias para la vida humana",
        parrafos: [
          "Alrededor del 90 % de los terremotos del mundo y la mayoría de los volcanes activos se concentran en el Cinturón de Fuego del Pacífico, el anillo de zonas de subducción que bordea ese océano desde Chile hasta Nueva Zelanda pasando por Japón. El Caribe, en el borde de la placa del Caribe con la Norteamericana, también es una región sísmica: el terremoto de Haití de 2010 y el de 1946 en el nordeste de la República Dominicana lo recuerdan.",
          "La tectónica explica además la localización de muchos recursos: los yacimientos de cobre de los Andes, ligados al magmatismo de subducción, la energía geotérmica de Islandia o Kenia y la formación de cuencas sedimentarias donde se acumulan petróleo y gas. Entender dónde y cómo se deforman las placas es la base de los mapas de peligrosidad sísmica que orientan las normas de construcción.",
        ],
      },
    ],
    historia: {
      titulo: "Contexto histórico",
      parrafos: [
        "En 1912 el meteorólogo alemán Alfred Wegener propuso la «deriva continental»: los continentes habrían estado unidos en un supercontinente, Pangea, que luego se fragmentó. Sus pruebas eran sólidas —el encaje de las costas de África y Sudamérica, fósiles idénticos a ambos lados del Atlántico, huellas de antiguos glaciares en regiones hoy tropicales—, pero no supo explicar qué fuerza movía los continentes y la idea fue rechazada por la mayoría de los geólogos.",
        "La exploración de los fondos oceánicos tras la Segunda Guerra Mundial cambió el panorama. Marie Tharp y Bruce Heezen cartografiaron las dorsales y su valle central; Harry Hess propuso en 1962 la expansión del fondo oceánico; y en 1963 Vine, Matthews y Morley interpretaron las bandas magnéticas simétricas a ambos lados de las dorsales como el registro de las inversiones del campo magnético terrestre en corteza recién formada. Hacia 1967-1968 la tectónica de placas quedó establecida como teoría unificadora. Hoy los satélites GNSS miden directamente el movimiento de las placas, milímetro a milímetro.",
      ],
    },
    datos: [
      { etiqueta: "Grandes placas", valor: "7 u 8", nota: "más decenas de placas menores", fuente: 1 },
      { etiqueta: "Velocidad típica", valor: "2-10 cm al año", fuente: 1 },
      { etiqueta: "Terremotos en el Cinturón de Fuego", valor: "≈ 90 %", fuente: 2 },
      { etiqueta: "Mayor terremoto registrado", valor: "Valdivia (Chile), M 9,5", nota: "22 de mayo de 1960", fuente: 2 },
      { etiqueta: "Altura oficial del Everest", valor: "8.848,86 m", nota: "medición China-Nepal, 2020", fuente: 0 },
      { etiqueta: "Propuesta de la deriva continental", valor: "1912", nota: "Alfred Wegener", fuente: 0 },
    ],
    cronologia: [
      { fecha: "1912", texto: "Wegener presenta la deriva continental." },
      { fecha: "1950s", texto: "Tharp y Heezen cartografían las dorsales oceánicas." },
      { fecha: "1962", texto: "Hess propone la expansión del fondo oceánico." },
      { fecha: "1963", texto: "Vine, Matthews y Morley explican las bandas magnéticas." },
      { fecha: "1967-1968", texto: "Se formula la tectónica de placas como teoría unificada." },
    ],
    imagenes: [
      { clave: "placas", alt: "Mapa de las placas tectónicas del mundo", pie: "Las principales placas tectónicas y sus límites (USGS)." },
      { clave: "everest", alt: "El monte Everest", pie: "El Himalaya, levantado por la colisión de la India con Asia." },
    ],
    fuentes: [
      { titulo: "Plate tectonics", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/science/plate-tectonics", tipo: "enciclopedia" },
      { titulo: "This Dynamic Earth: The Story of Plate Tectonics", editor: "U.S. Geological Survey", url: "https://pubs.usgs.gov/gip/dynamic/dynamic.html", tipo: "institucional" },
      { titulo: "Earthquake Hazards Program — Ring of Fire / largest earthquakes", editor: "U.S. Geological Survey", url: "https://www.usgs.gov/programs/earthquake-hazards", tipo: "datos" },
      { titulo: "Plate Tectonics", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/plate-tectonics/", tipo: "educativa" },
      { titulo: "Tectónica de placas", editor: "Wikipedia en español", url: "https://es.wikipedia.org/wiki/Tect%C3%B3nica_de_placas", tipo: "enciclopedia" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["asia", "america", "clima-y-biomas", "republica-dominicana", "energia", "antartida"],
    conceptos: ["tectonica", "riesgo-climatico", "metodo-cientifico"],
    paises: ["jp", "cl", "np", "is", "ht", "do"],
    palabrasClave: ["placas", "Wegener", "Pangea", "subducción", "dorsal", "terremotos", "volcanes", "Cinturón de Fuego"],
  },
  {
    slug: "clima-y-biomas",
    titulo: "Climas y biomas del mundo",
    categoria: "geografia-fisica",
    bajada: "Por qué hace calor en el ecuador y frío en los polos, cómo se clasifican los climas y qué paisajes vivos crea cada uno.",
    introduccion: [
      "El clima es el estado medio de la atmósfera en un lugar a lo largo de muchos años —la Organización Meteorológica Mundial usa periodos de referencia de 30 años—, mientras que el tiempo es lo que ocurre en un día concreto. Los climas del mundo no se reparten al azar: siguen la geometría de la radiación solar, la circulación de la atmósfera y los océanos y la disposición del relieve.",
      "Cada clima favorece un tipo de vegetación y de fauna. A esas grandes comunidades de seres vivos adaptadas a condiciones climáticas parecidas se las llama biomas: la selva tropical, la sabana, el desierto, el bosque templado, la taiga o la tundra, entre otros.",
    ],
    secciones: [
      {
        titulo: "Los factores del clima",
        parrafos: [
          "El factor fundamental es la latitud. En las regiones ecuatoriales los rayos del sol llegan casi perpendiculares todo el año y calientan más cada metro cuadrado que en latitudes altas, donde llegan inclinados. Ese desequilibrio de energía pone en marcha la circulación general de la atmósfera: el aire caliente asciende en el ecuador, produce lluvias abundantes y desciende seco hacia los 30° de latitud, donde se sitúan los grandes desiertos subtropicales como el Sahara o el de Arabia. Los vientos alisios, que soplan del nordeste en el hemisferio norte, son parte de ese sistema y traen la humedad que riega las laderas norte de muchas islas del Caribe.",
          "Otros factores modifican ese patrón. La altitud enfría el aire unos 6,5 °C por cada 1.000 metros, por eso hay glaciares en el Kilimanjaro, casi sobre el ecuador. La distancia al mar marca la diferencia entre climas oceánicos, de temperaturas suaves, y continentales, de grandes contrastes. Las corrientes oceánicas calientan o enfrían las costas: la deriva noratlántica templa Europa occidental, mientras que la fría corriente de Humboldt contribuye a la aridez extrema del desierto de Atacama. Las montañas, por último, crean «sombras de lluvia»: descargan la humedad en la ladera expuesta al viento y dejan seca la opuesta.",
        ],
      },
      {
        titulo: "La clasificación de Köppen",
        parrafos: [
          "La clasificación más usada fue propuesta por el climatólogo ruso-alemán Wladimir Köppen a partir de 1884 y revisada después con Rudolf Geiger. Se basa en las temperaturas y precipitaciones medias mensuales, y su idea central es que la vegetación es el mejor indicador del clima. Distingue cinco grandes grupos, identificados con letras: A, climas tropicales, sin invierno y con todos los meses por encima de 18 °C; B, climas secos, donde la evaporación supera a la precipitación; C, climas templados; D, climas continentales o fríos, con inviernos rigurosos; y E, climas polares, donde ningún mes supera los 10 °C.",
          "Cada grupo se subdivide con letras adicionales según la estacionalidad de las lluvias y el calor del verano: Af es la selva ecuatorial sin estación seca, Aw la sabana con invierno seco, BWh el desierto cálido, Cfb el clima oceánico de Europa occidental, Csa el mediterráneo de verano caluroso, Dfc la taiga subártica y ET la tundra. En 2018 y en 2023 un equipo dirigido por Hylke Beck publicó mapas mundiales de alta resolución de la clasificación para el periodo 1991-2020 y proyecciones futuras, que muestran cómo se desplazan las zonas climáticas con el calentamiento global.",
        ],
      },
      {
        titulo: "Los grandes biomas",
        parrafos: [
          "Las selvas tropicales húmedas, en la franja ecuatorial de Amazonía, la cuenca del Congo y el sudeste asiático, son los biomas terrestres con más especies. Alrededor de ellas, las sabanas combinan pastos y árboles dispersos y sostienen las grandes manadas de herbívoros africanos. Los desiertos, cálidos o fríos, cubren cerca de un tercio de la superficie terrestre y albergan especies con adaptaciones notables para ahorrar agua.",
          "En las latitudes medias se encuentran los bosques templados caducifolios, las praderas y estepas —convertidas en buena parte en tierras de cultivo, como la Pampa o las Grandes Llanuras— y los bosques y matorrales mediterráneos. Más al norte, la taiga o bosque boreal, dominada por coníferas, forma el bioma terrestre más extenso del planeta, y la tundra, sin árboles y con el suelo permanentemente helado (permafrost), cierra la secuencia hacia el polo. La misma sucesión se repite en altura en las montañas: subir una cordillera tropical es como viajar del ecuador a los polos en pocos kilómetros.",
        ],
      },
      {
        titulo: "Un clima que cambia",
        parrafos: [
          "Según el Sexto Informe de Evaluación del IPCC (2021-2023), la temperatura media de la superficie del planeta en 2011-2020 fue unos 1,1 °C más alta que en 1850-1900, y es inequívoco que la influencia humana, sobre todo por la emisión de gases de efecto invernadero, ha calentado la atmósfera, el océano y la tierra. La Organización Meteorológica Mundial confirmó que 2024 fue el año más cálido del registro instrumental, el primero con una media anual de alrededor de 1,55 °C por encima del nivel preindustrial. El calentamiento desplaza los biomas hacia los polos y hacia mayores altitudes, intensifica los extremos de calor y de lluvia y altera los regímenes de los que dependen la agricultura y los ecosistemas.",
        ],
      },
    ],
    datos: [
      { etiqueta: "Periodo de referencia climático", valor: "30 años", nota: "normal actual: 1991-2020", fuente: 3 },
      { etiqueta: "Grupos climáticos de Köppen", valor: "5 (A, B, C, D, E)", fuente: 0 },
      { etiqueta: "Descenso de temperatura con la altura", valor: "≈ 6,5 °C por km", nota: "gradiente medio de la troposfera", fuente: 0 },
      { etiqueta: "Calentamiento 2011-2020", valor: "≈ 1,1 °C", nota: "respecto a 1850-1900", fuente: 2 },
      { etiqueta: "Año más cálido registrado", valor: "2024", nota: "≈ 1,55 °C sobre el nivel preindustrial", fuente: 3 },
      { etiqueta: "Bioma terrestre más extenso", valor: "Taiga (bosque boreal)", fuente: 4 },
    ],
    imagenes: [{ clave: "koppen", alt: "Mapa mundial de la clasificación climática de Köppen", pie: "Clasificación de Köppen-Geiger para 1991-2020 (Beck et al., 2023)." }],
    fuentes: [
      { titulo: "Köppen climate classification", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/science/Koppen-climate-classification", tipo: "enciclopedia" },
      { titulo: "High-resolution (1 km) Köppen-Geiger maps for 1901–2099", editor: "Beck, H. E. et al. · Scientific Data (2023)", url: "https://www.nature.com/articles/s41597-023-02549-6", tipo: "academica" },
      { titulo: "AR6 Synthesis Report: Climate Change 2023", editor: "IPCC", url: "https://www.ipcc.ch/report/ar6/syr/", tipo: "institucional" },
      { titulo: "WMO confirms 2024 as warmest year on record", editor: "Organización Meteorológica Mundial", url: "https://wmo.int/news/media-centre/wmo-confirms-2024-warmest-year-record-about-155degc-above-pre-industrial-level", tipo: "institucional" },
      { titulo: "Biome", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/biome/", tipo: "educativa" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["selvas-tropicales", "biodiversidad", "agua-dulce", "antartida", "tectonica-de-placas", "africa"],
    conceptos: ["clima-carbono", "riesgo-climatico", "circulacion-oceanica", "ciclo-agua"],
    organizaciones: [],
    palabrasClave: ["Köppen", "biomas", "alisios", "monzón", "desierto", "taiga", "tundra", "calentamiento global", "IPCC"],
  },
  {
    slug: "poblacion-mundial",
    titulo: "Población mundial y ciudades",
    categoria: "geografia-humana",
    bajada: "Cómo pasó la humanidad de mil millones a más de ocho mil, por qué el crecimiento se frena y qué significa vivir en un planeta de ciudades.",
    introduccion: [
      "La población humana tardó prácticamente toda su historia en alcanzar los mil millones de personas, cifra a la que llegó a comienzos del siglo XIX. Después se multiplicó por ocho en apenas dos siglos: Naciones Unidas fijó simbólicamente el 15 de noviembre de 2022 como el día en que la humanidad alcanzó los 8.000 millones.",
      "Ese crecimiento no fue causado por un aumento de los nacimientos, sino por la caída de la mortalidad gracias a la mejora de la alimentación, el agua potable, la higiene, las vacunas y la medicina. Hoy el ritmo se desacelera en casi todo el mundo, y la gran transformación pendiente ya no es tanto cuántos somos, sino dónde y cómo vivimos: más gente que nunca vive en ciudades.",
    ],
    secciones: [
      {
        titulo: "La transición demográfica",
        parrafos: [
          "Los demógrafos describen el proceso con el modelo de la transición demográfica. En una primera fase, natalidad y mortalidad son altas y la población crece poco. Cuando la mortalidad baja —sobre todo la infantil— y la natalidad sigue alta, la población se dispara. Con el tiempo, la urbanización, la educación de las mujeres, el acceso a la anticoncepción y el cambio en el valor económico de los hijos reducen también la natalidad, y el crecimiento se frena. Europa recorrió ese camino a lo largo del siglo XIX y XX; muchos países de Asia y América Latina lo hicieron en pocas décadas.",
          "La fecundidad mundial ha caído de unos 5 hijos por mujer en 1950 a alrededor de 2,2 en 2024, muy cerca del nivel de reemplazo de 2,1. Más de la mitad de los países tienen ya una fecundidad inferior a ese nivel. Las proyecciones de las Naciones Unidas (World Population Prospects 2024) estiman que la población mundial, de unos 8.200 millones en 2024, alcanzará un máximo de alrededor de 10.300 millones a mediados de la década de 2080 y después comenzará a descender ligeramente.",
        ],
      },
      {
        titulo: "Dónde vive la humanidad",
        parrafos: [
          "La población está muy desigualmente repartida. India y China reúnen juntas más de una de cada tres personas. Las grandes concentraciones se encuentran en Asia oriental y meridional, en Europa, en el noreste de Estados Unidos y en valles fluviales y costas fértiles como el delta del Nilo o la llanura del Ganges; en cambio, desiertos, selvas densas, altas montañas y regiones polares están casi vacíos. Los mapas de densidad y las imágenes nocturnas de satélite, que muestran las luces de las ciudades, revelan con claridad ese patrón.",
          "La geografía del crecimiento también está cambiando. Según Naciones Unidas, más de la mitad del aumento de la población mundial de aquí a 2050 se concentrará en ocho países, cinco de ellos africanos. Mientras tanto, muchos países de Europa y de Asia oriental, como Japón, Italia o Corea del Sur, ya pierden población y afrontan un envejecimiento rápido, con menos personas en edad de trabajar por cada persona mayor.",
        ],
      },
      {
        titulo: "Un planeta de ciudades",
        parrafos: [
          "Medir la urbanización no es sencillo, porque cada país define lo «urbano» a su manera. Por eso el informe World Urbanization Prospects 2025 de Naciones Unidas, publicado en noviembre de 2025, aplicó por primera vez un método armonizado, el «Grado de Urbanización», que clasifica cada kilómetro cuadrado del planeta según su densidad y tamaño de asentamiento. Con ese criterio común, en 2025 el 45 % de los 8.200 millones de habitantes vive en ciudades, el 36 % en pueblos y localidades intermedias y el 19 % en zonas rurales. En 1950 las ciudades reunían solo el 20 % de la población.",
          "El número de megaciudades —aglomeraciones de 10 millones de habitantes o más— se ha cuadruplicado, de 8 en 1975 a 33 en 2025, diecinueve de ellas en Asia. Con la nueva metodología, la mayor del mundo es Yakarta, con cerca de 42 millones de habitantes, seguida de Daca, con casi 40 millones, y Tokio, con 33 millones. Dos tercios del crecimiento de la población hasta 2050 se producirá en ciudades, y se prevé que la población rural mundial alcance su máximo en la década de 2040.",
          "Las ciudades concentran oportunidades —empleo, servicios, innovación— y también problemas: alrededor de 1.100 millones de personas viven en barrios informales o asentamientos precarios según ONU-Hábitat, y la expansión urbana desordenada presiona sobre el suelo, el agua y el transporte. La forma en que crezcan las ciudades del sur global en las próximas décadas será decisiva para el bienestar humano y el clima.",
        ],
      },
    ],
    historia: {
      titulo: "Contexto histórico",
      parrafos: [
        "Durante milenios la población creció muy lentamente porque epidemias, hambrunas y guerras compensaban los nacimientos: se estima que hacia el año 1 vivían en el mundo entre 200 y 300 millones de personas, y que la Peste Negra del siglo XIV mató a entre un tercio y la mitad de la población europea. La humanidad llegó a 1.000 millones hacia 1804, a 2.000 millones en 1927, a 3.000 millones en 1960 y, desde entonces, sumó mil millones cada 12 o 13 años.",
        "El temor a una «explosión demográfica» marcó los debates de los años sesenta y setenta. La Conferencia Internacional sobre la Población y el Desarrollo de El Cairo (1994) desplazó el énfasis de las metas numéricas hacia los derechos, la salud reproductiva y la educación de las mujeres, un cambio de enfoque que sigue orientando las políticas de población.",
      ],
    },
    datos: [
      { etiqueta: "Población mundial", valor: "≈ 8.200 millones", nota: "2024-2025", fuente: 0 },
      { etiqueta: "Máximo proyectado", valor: "≈ 10.300 millones", nota: "mediados de la década de 2080", fuente: 0 },
      { etiqueta: "Fecundidad mundial", valor: "≈ 2,2 hijos por mujer", nota: "2024; 1950: ≈ 5", fuente: 0 },
      { etiqueta: "Población en ciudades", valor: "45 %", nota: "2025, Grado de Urbanización; 1950: 20 %", fuente: 1 },
      { etiqueta: "Megaciudades", valor: "33", nota: "2025; 1975: 8", fuente: 1 },
      { etiqueta: "Mayor ciudad del mundo", valor: "Yakarta, ≈ 42 millones", nota: "WUP 2025", fuente: 1 },
    ],
    cronologia: [
      { fecha: "≈ 1804", texto: "La humanidad alcanza 1.000 millones." },
      { fecha: "1927", texto: "2.000 millones." },
      { fecha: "1960", texto: "3.000 millones." },
      { fecha: "1994", texto: "Conferencia de El Cairo sobre población y desarrollo." },
      { fecha: "15 nov. 2022", texto: "Día de los 8.000 millones, según la ONU." },
      { fecha: "2023", texto: "India pasa a ser el país más poblado." },
      { fecha: "nov. 2025", texto: "WUP 2025: el 45 % vive en ciudades." },
    ],
    imagenes: [
      { clave: "densidad", alt: "Mapa mundial de la densidad de población", pie: "Densidad de población mundial: la humanidad se concentra en Asia meridional y oriental, Europa y los valles fluviales." },
      { clave: "luces", alt: "La Tierra de noche vista desde satélite, con las luces de las ciudades", pie: "La Tierra de noche (NASA Black Marble, 2016): las luces dibujan el mapa urbano del planeta." },
    ],
    fuentes: [
      { titulo: "World Population Prospects 2024: Summary of Results", editor: "Naciones Unidas · DESA, División de Población", url: "https://population.un.org/wpp/", tipo: "datos" },
      { titulo: "World Urbanization Prospects 2025: Summary of Results", editor: "Naciones Unidas · DESA", url: "https://www.un.org/en/desa/WUP-2025", tipo: "datos" },
      { titulo: "Day of Eight Billion", editor: "Naciones Unidas", url: "https://www.un.org/en/dayof8billion", tipo: "institucional" },
      { titulo: "Urban Settlements Over the Years / Slums data", editor: "ONU-Hábitat", url: "https://unhabitat.org/", tipo: "institucional" },
      { titulo: "Population", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/population/", tipo: "educativa" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["asia", "africa", "religiones-del-mundo", "lenguas-del-mundo", "agua-dulce", "internet"],
    conceptos: ["demografia-transicion", "envejecimiento", "urbanizacion", "vivienda"],
    organizaciones: [],
    paises: ["in", "cn", "id", "bd", "jp", "ng"],
    palabrasClave: ["demografía", "transición demográfica", "fecundidad", "urbanización", "megaciudades", "Yakarta", "8.000 millones"],
  },
  {
    slug: "agua-dulce",
    titulo: "El agua dulce del planeta",
    categoria: "recursos-naturales",
    bajada: "Solo una pequeña parte del agua de la Tierra es dulce y accesible: dónde está, cómo la usamos y por qué miles de millones de personas carecen de un servicio seguro.",
    introduccion: [
      "La Tierra es el planeta azul, pero casi toda su agua es salada. Alrededor del 97,5 % del agua del planeta está en los océanos; del 2,5 % restante, que es dulce, cerca de dos tercios se encuentra congelada en glaciares y casquetes polares, y casi todo el resto está bajo tierra. Los ríos y lagos, de donde procede buena parte del agua que usamos, representan una fracción mínima del total.",
      "El agua dulce es un recurso renovable gracias al ciclo hidrológico, pero está repartida de forma muy desigual en el espacio y en el tiempo. Garantizar agua suficiente y segura para beber, producir alimentos, sostener la industria y conservar los ecosistemas es uno de los grandes desafíos del siglo XXI, y el objetivo 6 de los Objetivos de Desarrollo Sostenible de Naciones Unidas.",
    ],
    secciones: [
      {
        titulo: "El ciclo del agua",
        parrafos: [
          "El sol evapora agua de los océanos, los lagos, el suelo y la vegetación (a través de la transpiración de las plantas). El vapor asciende, se enfría y se condensa en nubes; después cae como lluvia o nieve. Parte de esa agua corre por la superficie hasta los ríos, parte se infiltra y recarga los acuíferos, y parte vuelve a evaporarse. El ciclo funciona como una enorme planta desalinizadora movida por energía solar: cada año devuelve a los continentes agua dulce que procede en buena medida del mar.",
          "Los acuíferos, formaciones de roca o sedimento capaces de almacenar y transmitir agua, son la principal reserva de agua dulce líquida. Algunos se recargan rápidamente; otros contienen agua «fósil» acumulada durante miles de años, como el Sistema Acuífero de Arenisca de Nubia bajo Egipto, Libia, Sudán y Chad. Extraer agua de un acuífero más rápido de lo que se recarga equivale a gastar un ahorro que no se repone.",
        ],
      },
      {
        titulo: "Para qué usamos el agua",
        parrafos: [
          "Según AQUASTAT, el sistema de información de la FAO, la agricultura —sobre todo el riego— representa alrededor del 70 % de las extracciones mundiales de agua dulce, la industria cerca del 20 % y el uso doméstico y municipal en torno al 12 %. Las proporciones varían mucho: en los países de ingresos bajos el riego puede superar el 90 %, mientras que en países industrializados predomina el uso industrial, incluida la refrigeración de centrales eléctricas.",
          "El riego permite producir aproximadamente el 40 % de los alimentos del mundo en alrededor del 20 % de las tierras cultivadas, pero también ha provocado algunos de los mayores desastres ambientales, como la casi desaparición del mar de Aral, en Asia central, tras el desvío de sus ríos para regar algodón a partir de la década de 1960.",
        ],
      },
      {
        titulo: "Acceso, escasez y conflicto",
        parrafos: [
          "Según el Programa Conjunto de Monitoreo de la OMS y UNICEF, en 2022 unos 2.200 millones de personas carecían de agua potable gestionada de forma segura —es decir, disponible en casa, cuando se necesita y libre de contaminación— y unos 3.500 millones no tenían saneamiento gestionado de forma segura. La falta de agua limpia y saneamiento sigue causando cientos de miles de muertes al año por enfermedades diarreicas, sobre todo de niños pequeños.",
          "El estrés hídrico —la relación entre el agua que se extrae y la disponible— es alto en Oriente Medio, el norte de África, Asia central y meridional y en regiones áridas de América y Australia. El cambio climático lo agrava al alterar los regímenes de lluvia y reducir los glaciares de montaña, que funcionan como depósitos estacionales para cientos de millones de personas en Asia y en los Andes.",
          "Hay en el mundo más de 300 cuencas fluviales transfronterizas. Aunque el agua suele invocarse como causa de futuras «guerras», la historia muestra que la cooperación ha sido más frecuente que el conflicto: acuerdos como el Tratado de las Aguas del Indo (1960) entre India y Pakistán sobrevivieron décadas a guerras entre ambos países, aunque India anunció su suspensión en 2025. Las negociaciones sobre la Gran Presa del Renacimiento Etíope, en el Nilo Azul, ilustran las tensiones actuales.",
        ],
      },
      {
        titulo: "Soluciones y tecnologías",
        parrafos: [
          "No existe una única solución a la escasez de agua, pero sí un repertorio probado. El riego por goteo, desarrollado comercialmente en Israel en la década de 1960 a partir de las ideas del ingeniero Simcha Blass, lleva el agua directamente a la raíz de cada planta y puede reducir mucho el consumo frente al riego por inundación. La desalinización del agua de mar, cada vez más eficiente gracias a la ósmosis inversa, abastece ya a buena parte de la población de países como Israel, Arabia Saudí o los Emiratos Árabes Unidos, aunque consume mucha energía y genera salmuera que debe gestionarse para no dañar el litoral.",
          "La reutilización de aguas residuales tratadas es otra vía: Singapur, con su programa NEWater, obtiene de ella una parte importante de su suministro, y muchas ciudades la usan para riego y para la industria. Reducir las fugas de las redes urbanas, que en algunas ciudades pierden un tercio del agua tratada o más, cobrar tarifas que reflejen el valor del recurso protegiendo a los hogares pobres y conservar los bosques y humedales que regulan los caudales —las llamadas soluciones basadas en la naturaleza— completan la caja de herramientas. La gestión integrada de cuencas, que coordina a todos los usuarios de un mismo río, es el marco que recomiendan los organismos de Naciones Unidas.",
        ],
      },
    ],
    datos: [
      { etiqueta: "Agua dulce del total", valor: "≈ 2,5 %", fuente: 3 },
      { etiqueta: "Agua dulce congelada", valor: "≈ 69 %", nota: "glaciares y casquetes", fuente: 3 },
      { etiqueta: "Extracciones para la agricultura", valor: "≈ 70 %", fuente: 1 },
      { etiqueta: "Sin agua potable segura", valor: "≈ 2.200 millones", nota: "2022", fuente: 0 },
      { etiqueta: "Sin saneamiento seguro", valor: "≈ 3.500 millones", nota: "2022", fuente: 0 },
      { etiqueta: "Cuencas transfronterizas", valor: "más de 300", fuente: 2 },
    ],
    imagenes: [{ clave: "iguazu", alt: "Las cataratas del Iguazú", pie: "Cataratas del Iguazú, en la frontera de Argentina y Brasil, sobre la cuenca del Paraná." }],
    fuentes: [
      { titulo: "Progress on household drinking water, sanitation and hygiene 2000–2022", editor: "OMS / UNICEF · Programa Conjunto de Monitoreo (JMP)", url: "https://washdata.org/", tipo: "datos" },
      { titulo: "AQUASTAT — Water uses", editor: "FAO", url: "https://www.fao.org/aquastat/en/overview/methodology/water-use", tipo: "datos" },
      { titulo: "UN World Water Development Report", editor: "UNESCO · ONU-Agua", url: "https://www.unwater.org/publications/un-world-water-development-report", tipo: "institucional" },
      { titulo: "Where is Earth's Water?", editor: "U.S. Geological Survey", url: "https://www.usgs.gov/special-topics/water-science-school/science/where-earths-water", tipo: "educativa" },
      { titulo: "Freshwater (Lakes and Rivers) and the Water Cycle", editor: "National Geographic Education", url: "https://education.nationalgeographic.org/resource/water-cycle/", tipo: "educativa" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["clima-y-biomas", "energia", "poblacion-mundial", "selvas-tropicales", "antartida", "sistema-naciones-unidas"],
    conceptos: ["agua-dulce", "riego", "cuencas", "ciclo-agua", "sistemas-alimentarios"],
    paises: ["eg", "et", "in", "pk", "kz", "uz"],
    palabrasClave: ["agua", "ciclo hidrológico", "acuíferos", "riego", "saneamiento", "estrés hídrico", "ODS 6", "mar de Aral"],
  },
  {
    slug: "energia",
    titulo: "La energía del mundo",
    categoria: "recursos-naturales",
    bajada: "De dónde sale la energía que mueve la economía, por qué sigue dominada por los combustibles fósiles y cómo avanza la transición hacia fuentes limpias.",
    introduccion: [
      "Toda actividad humana necesita energía: cocinar, iluminar, transportar, fabricar, calentar o enfriar. La historia económica puede leerse como una sucesión de transiciones energéticas: de la leña y la fuerza muscular al carbón, que alimentó la Revolución industrial; del carbón al petróleo, que hizo posible el automóvil y la aviación; y, en curso, de los combustibles fósiles a fuentes con bajas emisiones de carbono.",
      "Los combustibles fósiles —petróleo, carbón y gas natural— siguen aportando alrededor de cuatro quintas partes de la energía primaria del mundo, y su combustión es la principal causa del cambio climático. Al mismo tiempo, cientos de millones de personas aún no tienen electricidad. Conciliar el acceso universal a la energía con la reducción de emisiones es uno de los problemas centrales de nuestro tiempo.",
    ],
    secciones: [
      {
        titulo: "Las fuentes de energía",
        parrafos: [
          "El petróleo es la primera fuente de energía del mundo y domina el transporte. Sus reservas están muy concentradas: Venezuela, Arabia Saudí, Irán, Canadá e Irak figuran entre los países con mayores reservas probadas. La Organización de Países Exportadores de Petróleo (OPEP), fundada en Bagdad en 1960, y su alianza ampliada con otros productores (OPEP+) influyen en los precios mediante cuotas de producción.",
          "El carbón sigue siendo la principal fuente de generación eléctrica del mundo, sobre todo en China y la India, y es el combustible que más dióxido de carbono emite por unidad de energía. El gas natural se usa para generar electricidad, en la industria y en la calefacción; se transporta por gasoductos o licuado (GNL) en buques metaneros.",
          "Entre las fuentes con bajas emisiones, la hidroeléctrica es la renovable más antigua y aún una de las más importantes; la nuclear aporta alrededor del 9 % de la electricidad mundial sin emisiones directas, aunque plantea debates sobre residuos y costes; y la solar fotovoltaica y la eólica son las que más rápido crecen. El coste de los módulos solares cayó alrededor de un 90 % en la década de 2010, lo que convirtió a la energía solar en una de las formas más baratas de generar electricidad en buena parte del mundo.",
        ],
      },
      {
        titulo: "La transición energética",
        parrafos: [
          "La Agencia Internacional de la Energía (AIE) registra cada año récords de nueva capacidad renovable instalada, impulsados sobre todo por la solar en China. En 2023, durante la COP28 de Dubái, los países acordaron triplicar la capacidad renovable mundial para 2030 y «transitar fuera de los combustibles fósiles en los sistemas energéticos», la primera vez que una cumbre climática mencionaba explícitamente esos combustibles.",
          "La transición plantea retos nuevos. Las redes eléctricas deben adaptarse a fuentes variables, lo que exige almacenamiento, interconexiones y gestión de la demanda. La electrificación del transporte y la industria aumenta la necesidad de minerales como el litio, el cobalto, el níquel, el cobre y las tierras raras, cuya extracción y refinado están muy concentrados geográficamente. Y los países y regiones que dependen de los ingresos del petróleo o del empleo en el carbón necesitan alternativas económicas, lo que se conoce como «transición justa».",
        ],
      },
      {
        titulo: "Acceso y seguridad",
        parrafos: [
          "Según el informe Tracking SDG7, elaborado por la AIE, IRENA, la ONU, el Banco Mundial y la OMS, en 2022 unos 685 millones de personas vivían sin electricidad, cuatro de cada cinco de ellas en el África subsahariana, y más de 2.000 millones seguían cocinando con leña, carbón vegetal o queroseno, con graves efectos sobre la salud por la contaminación del aire en los hogares.",
          "La seguridad energética —disponer de energía suficiente, asequible y estable— volvió al centro de la política internacional tras la invasión rusa de Ucrania en 2022, que provocó una crisis de precios del gas en Europa. Los estrechos por donde pasa una parte enorme del petróleo y el gas del mundo, como Ormuz o Malaca, son puntos críticos de la geopolítica energética.",
        ],
      },
    ],
    historia: {
      titulo: "Contexto histórico",
      parrafos: [
        "Hasta el siglo XVIII casi toda la energía procedía de la biomasa, de la fuerza humana y animal y, en menor medida, del viento y el agua. La máquina de vapor perfeccionada por James Watt (patente de 1769) multiplicó el uso del carbón. El primer pozo petrolífero comercial moderno se perforó en Pensilvania en 1859, y la electricidad llegó a las ciudades a finales del siglo XIX. Las crisis del petróleo de 1973 y 1979 mostraron la vulnerabilidad de las economías importadoras y dieron origen a la AIE (1974). Desde el Acuerdo de París (2015) la transición energética se ha convertido en un eje central de la política climática.",
      ],
    },
    datos: [
      { etiqueta: "Fósiles en la energía primaria", valor: "≈ 80 %", fuente: 0 },
      { etiqueta: "Electricidad de origen nuclear", valor: "≈ 9 %", fuente: 0 },
      { etiqueta: "Personas sin electricidad", valor: "≈ 685 millones", nota: "2022", fuente: 1 },
      { etiqueta: "Sin acceso a cocina limpia", valor: "> 2.000 millones", nota: "2022", fuente: 1 },
      { etiqueta: "Meta de la COP28", valor: "triplicar renovables a 2030", fuente: 2 },
      { etiqueta: "Fundación de la OPEP", valor: "1960, Bagdad", fuente: 3 },
    ],
    cronologia: [
      { fecha: "1769", texto: "Patente de Watt sobre la máquina de vapor." },
      { fecha: "1859", texto: "Primer pozo petrolífero comercial moderno (Pensilvania)." },
      { fecha: "1960", texto: "Fundación de la OPEP." },
      { fecha: "1973", texto: "Primera crisis del petróleo." },
      { fecha: "2015", texto: "Acuerdo de París." },
      { fecha: "2023", texto: "La COP28 acuerda transitar fuera de los combustibles fósiles." },
    ],
    imagenes: [{ clave: "plataforma", alt: "Plataforma marina de petróleo y gas en el mar del Norte", pie: "Plataforma de petróleo y gas en aguas noruegas." }],
    fuentes: [
      { titulo: "World Energy Outlook / Renewables", editor: "Agencia Internacional de la Energía (AIE)", url: "https://www.iea.org/reports/world-energy-outlook-2024", tipo: "institucional" },
      { titulo: "Tracking SDG7: The Energy Progress Report 2024", editor: "AIE, IRENA, ONU, Banco Mundial y OMS", url: "https://trackingsdg7.esmap.org/", tipo: "datos" },
      { titulo: "Outcome of the first global stocktake (COP28)", editor: "CMNUCC", url: "https://unfccc.int/topics/global-stocktake", tipo: "institucional" },
      { titulo: "OPEC — Brief history", editor: "OPEP", url: "https://www.opec.org/opec_web/en/about_us/24.htm", tipo: "institucional" },
      { titulo: "Energy", editor: "Encyclopaedia Britannica", url: "https://www.britannica.com/science/energy", tipo: "enciclopedia" },
    ],
    actualizado: "2026-11-19",
    relacionados: ["agua-dulce", "clima-y-biomas", "tectonica-de-placas", "africa", "sistema-naciones-unidas", "revolucion-cientifica"],
    conceptos: ["transicion-energetica", "seguridad-energetica", "rentas-recursos", "materiales", "estrechos"],
    organizaciones: ["opep"],
    paises: ["sa", "ve", "cn", "us", "ru", "no"],
    palabrasClave: ["petróleo", "carbón", "gas", "renovables", "solar", "eólica", "nuclear", "OPEP", "transición energética", "COP28"],
  },
];
