// ═══════════════════════════════════════════════════════════════════
// v420.3 · VANGUARD INFRASTRUCTURE ATLAS — EDIFICIO
// Grandes edificios y obras arquitectónicas emblemáticas, documentados
// en fuentes públicas. Edificios civiles de reconocido valor: nada de
// infraestructuras sensibles ni detalles operativos.
// ═══════════════════════════════════════════════════════════════════

import { e, type Infraestructura } from "./tipos";

const WIK = (nombre: string) => ({ nombre: `Wikipedia · «${nombre}» (fuente pública)`, url: `https://en.wikipedia.org/wiki/${nombre.replace(/ /g, "_")}`, licencia: "contenido de dominio público / libre" });

export const EDIFICIOS: Infraestructura[] = [
  e("edificio-eiffel", "Torre Eiffel", "edificio", "fr", { ciudad: "París", lat: 48.86, lng: 2.29 },
    "La torre de hierro de Gustave Eiffel, erigida para la Exposición Universal de 1889. Con sus 330 metros de altura, sigue siendo el monumento más visitado de Francia.",
    "1889",
    [
      { clave: "altura", valor: "330 m (con antena)" },
      { clave: "material", valor: "hierro fundido" },
      { clave: "visitas", valor: "≈ 7 millones al año" },
    ],
    WIK("Eiffel Tower"), "confirmado", [], true),
  e("edificio-guggenheim-ny", "Museo Solomon R. Guggenheim", "edificio", "us", { ciudad: "Nueva York", lat: 40.78, lng: -73.96 },
    "El museo de arte moderno de Nueva York, diseñado por Frank Lloyd Wright. Su rampa helicoidal, inaugurada en 1959, es una de las obras arquitectónicas más reproducidas del siglo XX.",
    "1959",
    [
      { clave: "arquitecto", valor: "Frank Lloyd Wright" },
      { clave: "forma", valor: "rampa helicoidal continua" },
    ],
    WIK("Solomon R. Guggenheim Museum"), "confirmado", [], true),
  e("edificio-fallingwater", "Casa Fallingwater", "edificio", "us", { ciudad: "Mill Run, Pensilvania", lat: 39.73, lng: -79.49 },
    "La casa sobre el agua diseñada por Frank Lloyd Wright en los años 1930. Es una de las obras más famosas del siglo XX y un Patrimonio de la Humanidad de la UNESCO.",
    "1939",
    [
      { clave: "arquitecto", valor: "Frank Lloyd Wright" },
      { clave: "patrimonio", valor: "UNESCO" },
    ],
    WIK("Fallingwater"), "confirmado", [], true),
  e("edificio-salk", "Instituto Salk", "edificio", "us", { ciudad: "La Jolla, California", lat: 32.81, lng: -117.23 },
    "El instituto de investigación biomédica diseñado por Louis Kahn, en La Jolla. Sus torres de hormigón frente al océano son un icono de la arquitectura moderna.",
    "1965",
    [
      { clave: "arquitecto", valor: "Louis Kahn" },
      { clave: "material", valor: "hormigón visto frente al océano" },
    ],
    WIK("Salk Institute"), "confirmado", [], true),
  e("edificio-mnac", "Museo Nacional de Arte de Cataluña", "edificio", "es", { ciudad: "Barcelona", lat: 41.37, lng: 2.16 },
    "El museo de arte catalán, instalado en el Palau Nacional construido para la Exposición Internacional de 1929. Su escalinata y sus fuentes son un icono de Montjuïc.",
    "1929",
    [
      { clave: "edificio", valor: "Palau Nacional, construido para la Exposición de 1929" },
      { clave: "colecciones", valor: "arte románico y gótico catalán" },
    ],
    WIK("National Art Museum of Catalonia"), "confirmado", [], true),
  e("edificio-sao-paulo-cathedral", "Catedral de São Paulo", "edificio", "br", { ciudad: "São Paulo", lat: -23.55, lng: -46.63 },
    "La catedral neogótica de São Paulo, terminada en 1954. Sus torres de 112 metros dominan la praça da Sé, el corazón de la ciudad.",
    "1954",
    [
      { clave: "altura de las torres", valor: "112 m" },
      { clave: "estilo", valor: "neogótico" },
    ],
    WIK("São Paulo Cathedral"), "confirmado", [], true),
  e("edificio-palacio-ajud", "Palacio da Ajuda", "edificio", "pt", { ciudad: "Lisboa", lat: 38.72, lng: -9.15 },
    "El palacio neoclásico que fue residencia real de Portugal y hoy acoge instituciones estatales. Su fachada de piedra domina el centro de Lisboa.",
    "1861",
    [
      { clave: "estilo", valor: "neoclásico" },
      { clave: "uso actual", valor: "instituciones estatales y museo" },
    ],
    WIK("Palace of Ajuda"), "confirmado", [], true),
  e("edificio-azulejo", "Palacio de las Bellas Artes de México", "edificio", "mx", { ciudad: "Ciudad de México", lat: 19.43, lng: -99.1 },
    "El palacio de la Ciudad de México, cubierto de azulejos y con una fachada de estilo ecléctico. Inaugurado en 1934, es el centro de la cultura y el arte de la capital.",
    "1934",
    [
      { clave: "fachada", valor: "azulejos y piedra de fachada" },
      { clave: "uso", valor: "palacio de la cultura y las artes" },
    ],
    WIK("Palacio de Bellas Artes"), "confirmado", [], true),
  e("edificio-chinese-theatre", "Teatro Chino de Hollywood", "edificio", "us", { ciudad: "Los Ángeles", lat: 34.03, lng: -118.34 },
    "El teatro chino de Hollywood, terminado en 1927. Su imitación de un templo chino y sus huellas de estrellas frente a la entrada son un icono del cine de Hollywood.",
    "1927",
    [
      { clave: "estilo", valor: "imitación de templo chino" },
      { clave: "monumento", valor: "Monumento Histórico-Cultural de Los Ángeles" },
    ],
    WIK("TCL Chinese Theatre"), "confirmado", [], true),
  e("edificio-london-tower", "Torre de Londres", "edificio", "gb", { ciudad: "Londres", lat: 51.51, lng: -0.08 },
    "La fortaleza histórica y palacio de los reyes de Inglaterra, construida en el siglo XI. Es uno de los monumentos más antiguos y visitados de Londres.",
    "1078",
    [
      { clave: "antigüedad", valor: "1078, la fortaleza más antigua de Londres" },
      { clave: "uso", valor: "fortaleza, palacio y hoy museo" },
    ],
    WIK("Tower of London"), "confirmado", [], true),
  e("edificio-sydney-opera", "Ópera de Sídney", "edificio", "au", { ciudad: "Sídney", lat: -33.86, lng: 151.21 },
    "La ópera de Sídney, con sus símbolos de blanco que se alzan sobre la bahía. Diseñada por Jørn Utzon e inaugurada en 1973, es un Patrimonio de la Humanidad de la UNESCO.",
    "1973",
    [
      { clave: "arquitecto", valor: "Jørn Utzon" },
      { clave: "patrimonio", valor: "UNESCO" },
    ],
    WIK("Sydney Opera House"), "confirmado", [], true),
  e("edificio-palacio-apostolico", "Palacio Apostolico de la Ciudad del Vaticano", "edificio", "va", { ciudad: "Ciudad del Vaticano", lat: 41.9, lng: 12.45 },
    "El palacio que alberga la sede del papa y la Santa Sede. Sus frescos y sus salas históricas, entre ellas la Capilla Sixtina, son el centro del arte renacentista.",
    null,
    [
      { clave: "uso", valor: "sede de la Santa Sede" },
      { clave: "arte", valor: "Capilla Sixtina, siglo XV, y salas con frescos" },
      { clave: "edificación", valor: "conjunto edificado entre los siglos XVI y XVII" },
    ],
    WIK("Apostolic Palace"), "confirmado", [], true),
  e("edificio-alhambra", "Palacios de la Alhambra", "edificio", "es", { ciudad: "Granada", lat: 37.17, lng: -3.6 },
    "El conjunto palaciego y fortaleza de la Alhambra, en Granada. Construido a partir del siglo XIII, es el ejemplo más famoso del arte islámico en Al-Ándalus.",
    "1333",
    [
      { clave: "estilo", valor: "arte islámico nazarí" },
      { clave: "patrimonio", valor: "UNESCO" },
    ],
    WIK("Alhambra"), "confirmado", [], true),
  e("edificio-petronas", "Torres Petronas", "edificio", "my", { ciudad: "Kuala Lumpur", lat: 3.16, lng: 101.71 },
    "Las dos torres gemelas de Kuala Lumpur, terminadas en 1998. Fueron los edificios más altos del mundo durante seis años y siguen siendo el símbolo de la ciudad.",
    "1998",
    [
      { clave: "altura", valor: "452 m" },
      { clave: "rank", valor: "edificios gemelas más altos del mundo" },
    ],
    WIK("Petronas Towers"), "confirmado", [], true),
  e("edificio-burj", "Burj Khalifa", "edificio", "ae", { ciudad: "Dubái", lat: 25.19, lng: 55.27 },
    "El edificio más alto del mundo, inaugurado en 2010. Su altura y su forma de hormigón armado lo convierten en el símbolo de la arquitectura moderna de Dubái.",
    "2010",
    [
      { clave: "altura", valor: "828 m (el edificio más alto del mundo)" },
      { clave: "pisos", valor: "163" },
    ],
    WIK("Burj Khalifa"), "confirmado", [], true),
  e("edificio-chrysler", "Edificio Chrysler", "edificio", "us", { ciudad: "Nueva York", lat: 40.75, lng: -73.98 },
    "El rascacielos de Nueva York terminado en 1930. Su corona de acero y su vértice triangular son uno de los iconos del skyline de Manhattan.",
    "1930",
    [
      { clave: "altura", valor: "319 m" },
      { clave: "estilo", valor: "arte deco" },
    ],
    WIK("Chrysler Building"), "confirmado", [], true),
  e("edificio-flatiron", "Edificio Flatiron", "edificio", "us", { ciudad: "Nueva York", lat: 40.74, lng: -73.99 },
    "El rascacielos en forma de plancha, terminado en 1902. Es el edificio más famoso de la intersección de Broadway y la Quinta Avenida en Nueva York.",
    "1902",
    [
      { clave: "forma", valor: "planta de tipo plancha triangular" },
      { clave: "antigüedad", valor: "1902, el rascacielos más famoso de su tiempo" },
    ],
    WIK("Flatiron Building"), "confirmado", [], true),
  e("edificio-casabat", "Casa Batlló", "edificio", "es", { ciudad: "Barcelona", lat: 41.4, lng: 2.17 },
    "La casa modernista remodelada por Antoni Gaudí en el Paseo de Gracia. Su fachada ondulante y sus elementos vegetales son un icono de la arquitectura modernista catalana.",
    "1904",
    [
      { clave: "arquitecto", valor: "Antoni Gaudí" },
      { clave: "estilo", valor: "modernista" },
    ],
    WIK("Casa Batlló"), "confirmado", [], true),
];
