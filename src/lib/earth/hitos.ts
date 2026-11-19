// ═══════════════════════════════════════════════════════════════════
// v416.0 VANGUARD EARTH SYSTEM — EL CATÁLOGO DE HITOS GEOGRÁFICOS.
//
// Lo que faltaba en la casa: el planeta se pintaba por países, pero no se
// podía mirar su FÍSICA — ríos, montañas, océanos, desiertos e islas. Este
// archivo es esa capa: hitos de referencia con sus coordenadas reales.
//
// FUENTE Y HONESTIDAD: son coordenadas de referencia pública de geografía
// física estándar (Natural Earth, USGS, NGA GNS). No son medidas nuevas ni
// estimaciones de la casa: son los puntos que cualquier atlas escolar
// reconoce. El RELIEVE no se dibuja aquí — lo pinta el heightmap
// earth-topology de la casa (src/lib/globe-assets.ts), que sí es la textura
// real. Cada hito declara su tipo para que el explorador lo pinte con su
// color y lo agrupe en capas conmutables.
//
// Regla de la casa: una capa es una DECLARACIÓN. Añadir un hito nuevo es
// añadir una fila; no se toca ni el globo ni el explorador.
// ═══════════════════════════════════════════════════════════════════

export type TipoHito =
  | "rio"
  | "montana"
  | "oceano"
  | "mar"
  | "desierto"
  | "isla"
  | "lago";

export interface Hito {
  id: string;
  nombre: string;
  tipo: TipoHito;
  lat: number;
  lng: number;
  /** una línea: por qué ese hito importa en el tablero */
  nota: string;
}

export const COLOR_HITO: Record<TipoHito, string> = {
  rio: "#4DC9FF",
  montana: "#E8C56A",
  oceano: "#2E6FD8",
  mar: "#3DDCFF",
  desierto: "#F5A623",
  isla: "#3DDC97",
  lago: "#7FE3FF",
};

export const HITOS: Hito[] = [
  // ── ríos: las venas del planeta ────────────────────────────────────
  { id: "amazonas", nombre: "Río Amazonas", tipo: "rio", lat: -3.1, lng: -60.0, nota: "El mayor caudal del planeta: una quinta parte del agua dulce que llega al mar." },
  { id: "nilo", nombre: "Río Nilo", tipo: "rio", lat: 22.0, lng: 31.5, nota: "La agricultura de Egipto cuelga de sus 6.650 km. Etiopía y El Cairo se miran desde las dos orillas." },
  { id: "yangtse", nombre: "Río Yangtsé", tipo: "rio", lat: 30.5, lng: 114.0, nota: "La arteria industrial de China: un tercio de su población vive en su cuenca." },
  { id: "misisipi", nombre: "Río Misisipi", tipo: "rio", lat: 35.0, lng: -90.0, nota: "La carretera de grano de EE. UU.: del Medio Oeste al golfo sin una sola curva fiscal." },
  { id: "yenisei", nombre: "Río Yenisei", tipo: "rio", lat: 65.0, lng: 86.0, nota: "El gran río siberiano que hiela seis meses y abre el Ártico ruso." },
  { id: "congo", nombre: "Río Congo", tipo: "rio", lat: -3.0, lng: 22.0, nota: "El segundo mayor caudal del mundo y la frontera natural de la cuenca central." },
  { id: "niger", nombre: "Río Níger", tipo: "rio", lat: 10.0, lng: 8.0, nota: "El gran codo de África occidental: Tombuctú, Niamey y el delta interior." },
  { id: "ganges", nombre: "Río Ganges", tipo: "rio", lat: 25.5, lng: 83.0, nota: "La cuenca más poblada del planeta y la frontera líquida de dos naciones." },
  { id: "brahmaputra", nombre: "Río Brahmaputra", tipo: "rio", lat: 26.0, lng: 92.0, nota: "Nace en el Tíbet, cruza tres países y se encuentra con el Ganges en Bangladés." },
  { id: "danubio", nombre: "Río Danubio", tipo: "rio", lat: 45.5, lng: 20.0, nota: "El río más internacional: diez países y cuatro capitales en su orilla." },
  { id: "parana", nombre: "Río Paraná", tipo: "rio", lat: -25.0, lng: -56.0, nota: "La hidrovía del Cono Sur: soja y energía hidroeléctrica en la misma corriente." },
  { id: "mekong", nombre: "Río Mekong", tipo: "rio", lat: 15.0, lng: 106.0, nota: "La despensa de arroz del sudeste asiático, represado río arriba por seis países." },
  { id: "volga", nombre: "Río Volga", tipo: "rio", lat: 50.0, lng: 45.0, nota: "El río madre de Rusia: 3.500 km y medio país en su cuenca." },
  { id: "zambeze", nombre: "Río Zambeze", tipo: "rio", lat: -16.0, lng: 30.0, nota: "Las Cataratas Victoria y la represa de Cahora Bassa: agua que se vuelve luz." },
  { id: "eufrates", nombre: "Río Éufrates", tipo: "rio", lat: 33.0, lng: 42.0, nota: "La cuna de la escritura y hoy la presa más disputada de Oriente Próximo." },
  { id: "indo", nombre: "Río Indo", tipo: "rio", lat: 30.0, lng: 71.0, nota: "El tratado de 1960 reparte sus aguas entre India y Pakistán. Cada gota está firmada." },

  // ── montañas: los techos y las columnas ─────────────────────────────
  { id: "everest", nombre: "Everest", tipo: "montana", lat: 27.99, lng: 86.92, nota: "8.849 m: la frontera entre Nepal y China hecha de hielo." },
  { id: "k2", nombre: "K2", tipo: "montana", lat: 35.88, lng: 76.51, nota: "La montaña más técnica del planeta, en la línea de control más vigilada." },
  { id: "aconcagua", nombre: "Aconcagua", tipo: "montana", lat: -32.65, lng: -70.01, nota: "El techo de América y la columna vertebral de los Andes." },
  { id: "kilimanjaro", nombre: "Kilimanjaro", tipo: "montana", lat: -3.07, lng: 37.35, nota: "5.895 m de aislamiento: se ve desde la sabana entera." },
  { id: "elbrus", nombre: "Monte Elbrús", tipo: "montana", lat: 43.35, lng: 42.44, nota: "El techo de Europa, entre el mar Caspio y el mar Negro." },
  { id: "montblanc", nombre: "Mont Blanc", tipo: "montana", lat: 45.83, lng: 6.86, nota: "El techo de la UE: la frontera franco-italiana bajo el hielo." },
  { id: "denali", nombre: "Denali", tipo: "montana", lat: 63.07, lng: -151.01, nota: "El techo de América del Norte, con la mayor pendiente vertical del planeta." },
  { id: "toubkal", nombre: "Jebel Toubkal", tipo: "montana", lat: 31.06, lng: -7.92, nota: "El techo del Atlas: el norte de África se mide desde aquí." },
  { id: "fuji", nombre: "Monte Fuji", tipo: "montana", lat: 35.36, lng: 138.73, nota: "El volcán más simétrico del archipiélago y su mejor referencia visual." },
  { id: "alpes", nombre: "Alpes", tipo: "montana", lat: 46.0, lng: 10.0, nota: "La barrera que divide el norte del sur de Europa desde hace milenios." },
  { id: "rocas", nombre: "Montañas Rocosas", tipo: "montana", lat: 45.0, lng: -113.0, nota: "La columna de América del Norte: divisoria de aguas entre dos océanos." },
  { id: "himalaya", nombre: "Himalaya", tipo: "montana", lat: 28.5, lng: 84.0, nota: "La muralla de 2.400 km que decide el clima de medio continente." },
  { id: "altai", nombre: "Montes Altái", tipo: "montana", lat: 49.5, lng: 89.0, nota: "El nudo donde se encuentran Rusia, China, Mongolia y Kazajistán." },
  { id: "andes", nombre: "Cordillera de los Andes", tipo: "montana", lat: -30.0, lng: -70.0, nota: "La cadena continental más larga del planeta: 7.000 km de borde." },

  // ── océanos: los cinco que rodean todo ──────────────────────────────
  { id: "pacífico", nombre: "Océano Pacífico", tipo: "oceano", lat: 0.0, lng: -160.0, nota: "El mayor del planeta: un tercio de la superficie terrestre." },
  { id: "atlántico", nombre: "Océano Atlántico", tipo: "oceano", lat: 5.0, lng: -30.0, nota: "La autopista histórica entre dos mundos; la CORRIENTE que decide el clima." },
  { id: "índico", nombre: "Océano Índico", tipo: "oceano", lat: -20.0, lng: 80.0, nota: "El mar cálido por donde pasa la energía del planeta." },
  { id: "ártico", nombre: "Océano Ártico", tipo: "oceano", lat: 78.0, lng: 0.0, nota: "El techo del mundo: hielo que se abre y rutas que nacen." },
  { id: "antártico", nombre: "Océano Antártico", tipo: "oceano", lat: -68.0, lng: 20.0, nota: "El único que rodea un continente entero." },

  // ── mares: las habitaciones del planeta ─────────────────────────────
  { id: "mediterráneo", nombre: "Mar Mediterráneo", tipo: "mar", lat: 35.0, lng: 16.0, nota: "Tres continentes, veintidós países y ninguna costa sin dueño." },
  { id: "caribe", nombre: "Mar Caribe", tipo: "mar", lat: 15.0, lng: -75.0, nota: "El mar de las dos historias: turismo por encima, rutas por debajo." },
  { id: "china_meridional", nombre: "Mar de China Meridional", tipo: "mar", lat: 12.0, lng: 114.0, nota: "Un tercio del comercio marítimo mundial y la disputa que lo cruza." },
  { id: "bering", nombre: "Mar de Bering", tipo: "mar", lat: 63.0, lng: -175.0, nota: "La puerta entre Asia y América: la línea internacional cambia de fecha aquí." },
  { id: "arabia", nombre: "Mar de Arabia", tipo: "mar", lat: 16.0, lng: 60.0, nota: "La ruta corta entre el golfo Pérsico y el Índico." },
  { id: "norte", nombre: "Mar del Norte", tipo: "mar", lat: 56.0, lng: 3.0, nota: "Petróleo, gas y la pesca que enfrenta a las dos orillas." },
  { id: "rojo", nombre: "Mar Rojo", tipo: "mar", lat: 20.0, lng: 39.0, nota: "El corredor entre Suez y el Índico: un mar estrecho, inmensamente largo." },
  { id: "ojotsk", nombre: "Mar de Ojotsk", tipo: "mar", lat: 55.0, lng: 152.0, nota: "El mar cerrado de Rusia: submarinos y ballenas comparten el agua." },
  { id: "tasmania", nombre: "Mar de Tasmania", tipo: "mar", lat: -41.0, lng: 148.0, nota: "El pasillo entre Australia y Nueva Zelanda, de los más bravos." },

  // ── desiertos: los vacíos que también mandan ────────────────────────
  { id: "sahara", nombre: "Desierto del Sahara", tipo: "desierto", lat: 23.0, lng: 13.0, nota: "El mayor desierto cálido: once países y la ruta de las caravanas." },
  { id: "gobi", nombre: "Desierto de Gobi", tipo: "desierto", lat: 43.0, lng: 105.0, nota: "El desierto de la estepa: la Ruta de la Seda pasó por sus oasis." },
  { id: "kalahari", nombre: "Desierto de Kalahari", tipo: "desierto", lat: -24.0, lng: 21.0, nota: "El gran vacío del sur de África, con el delta del Okavango dentro." },
  { id: "arabia_desierto", nombre: "Desierto de Arabia", tipo: "desierto", lat: 24.0, lng: 45.0, nota: "El Rub al-Jali: el arenal continuo más grande del planeta." },
  { id: "atacama", nombre: "Desierto de Atacama", tipo: "desierto", lat: -24.5, lng: -69.5, nota: "El más seco de todos: hay estaciones que jamás han medido lluvia." },
  { id: "victoria", nombre: "Gran Desierto de Victoria", tipo: "desierto", lat: -29.0, lng: 129.0, nota: "El corazón árido de Australia, cruzado por una sola línea telegráfica." },
  { id: "patagonia_desierto", nombre: "Desierto Patagónico", tipo: "desierto", lat: -45.0, lng: -70.0, nota: "El desierto del viento: la estepa más grande de América del Sur." },
  { id: "antártida", nombre: "Antártida", tipo: "desierto", lat: -80.0, lng: 20.0, nota: "El desierto polar: el 70 % del agua dulce del planeta, congelada." },

  // ── islas: las piezas sueltas del tablero ───────────────────────────
  { id: "groenlandia", nombre: "Groenlandia", tipo: "isla", lat: 72.0, lng: -40.0, nota: "La isla más grande del planeta y la puerta del Ártico." },
  { id: "borneo", nombre: "Borneo", tipo: "isla", lat: 1.0, lng: 114.0, nota: "Una isla, tres países: Indonesia, Malasia y Brunéi." },
  { id: "madagascar", nombre: "Madagascar", tipo: "isla", lat: -19.0, lng: 47.0, nota: "El 90 % de su vida no existe en ningún otro lugar del planeta." },
  { id: "sumatra", nombre: "Sumatra", tipo: "isla", lat: 0.0, lng: 101.0, nota: "La línea de subducción que despertó en 2004 y movió el planeta." },
  { id: "islandia", nombre: "Islandia", tipo: "isla", lat: 64.5, lng: -19.0, nota: "La dorsal atlántica emergida: fuego y hielo sobre la misma roca." },
  { id: "java", nombre: "Java", tipo: "isla", lat: -7.5, lng: 110.0, nota: "La isla más poblada del planeta: 150 millones sobre un arco volcánico." },
  { id: "sajalín", nombre: "Sajalín", tipo: "isla", lat: 52.0, lng: 143.0, nota: "La gran isla rusa del Pacífico: petróleo, gas y tigres." },
  { id: "nueva_guinea", nombre: "Nueva Guinea", tipo: "isla", lat: -6.0, lng: 144.0, nota: "La segunda isla más grande: dos países y mil lenguas." },
  { id: "cuba", nombre: "Cuba", tipo: "isla", lat: 21.5, lng: -79.0, nota: "La llave del Caribe: a un paso de Florida y de Yucatán." },
  { id: "tsushima", nombre: "Estrecho de Tsushima", tipo: "isla", lat: 34.0, lng: 129.5, nota: "El pasillo entre Japón y Corea: la historia pasó aquí dos veces." },

  // ── lagos: los mares interiores ─────────────────────────────────────
  { id: "baikal", nombre: "Lago Baikal", tipo: "lago", lat: 53.5, lng: 108.0, nota: "El lago más profundo del planeta: un quinto del agua dulce líquida." },
  { id: "tanganica", nombre: "Lago Tanganica", tipo: "lago", lat: -6.0, lng: 29.5, nota: "El lago más largo de África y la frontera de cuatro países." },
  { id: "superior", nombre: "Lago Superior", tipo: "lago", lat: 47.5, lng: -87.5, nota: "El mayor lago de agua dulce por superficie: el begin again de los Grandes Lagos." },
  { id: "victoria_lago", nombre: "Lago Victoria", tipo: "lago", lat: -1.5, lng: 33.0, nota: "El lago tropical más grande: la fuente que alimenta el Nilo Blanco." },
  { id: "caspio", nombre: "Mar Caspio", tipo: "lago", lat: 42.0, lng: 51.0, nota: "El mar interior más grande del planeta: cinco orillas y un tratado." },
];

export function hitosPorTipo(tipo: TipoHito): Hito[] {
  return HITOS.filter((h) => h.tipo === tipo);
}

export const TIPOS_HITO: TipoHito[] = ["rio", "montana", "oceano", "mar", "desierto", "isla", "lago"];

export const ETIQUETA_HITO: Record<TipoHito, string> = {
  rio: "RÍOS",
  montana: "MONTAÑAS",
  oceano: "OCÉANOS",
  mar: "MARES",
  desierto: "DESIERTOS",
  isla: "ISLAS",
  lago: "LAGOS",
};
