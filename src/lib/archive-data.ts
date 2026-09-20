// Vanguard v12 — ARCHIVO MUNDIAL: datos de curiosidades, epocas de la
// antigüedad, contadores de muertes y organizaciones criminales (carteles).

// ================= CURIOSIDADES =================
export type CurioCat = "GUERRA" | "POLITICA" | "RELIGION" | "ANTIGUEDAD" | "ECONOMIA" | "ESPIONAJE";

export interface CurioItem { id: string; cat: CurioCat; text: string; }

export const CURIOSITIES: CurioItem[] = [
  { id: "c01", cat: "GUERRA", text: "En la 2GM, los sovieticos usaban perros anticarro: corrian hacia los tanques con minas adosadas. Los alemanes temian a los 'perros bomba'." },
  { id: "c02", cat: "GUERRA", text: "El ejercito estadounidense desarrollo 'proyectiles de murcielagos' con bombas incendiarias durante la 2GM." },
  { id: "c03", cat: "GUERRA", text: "La batalla de Karansebes (1788): el ejercito austriaco se atacó a si mismo por error y sufrió miles de bajas sin enemigo delante." },
  { id: "c04", cat: "GUERRA", text: "El 'kilroy was here' era el meme de los soldados aliados: aparecia pintado en frentes de todo el mundo." },
  { id: "c05", cat: "GUERRA", text: "En la guerra de Corea, los marines de Chosin sobrevivieron durante dias a -40C sin calefaccion." },
  { id: "c06", cat: "GUERRA", text: "Un gato llamado Simon recibió la medalla Dickin por cazar ratas y sobrevivir bombardeos en el barco HMS Amethyst (1949)." },
  { id: "c07", cat: "POLITICA", text: "El papa que valido un imperio: Leon III coronó a Carlomagno el ano 800, inventando de facto el 'sacro' en el imperio romano." },
  { id: "c08", cat: "POLITICA", text: "El reino de Andorra tiene 2 coprincipes: el presidente de Francia y el obispo de Urgell. Ni siquiera necesitan estar presentes." },
  { id: "c09", cat: "POLITICA", text: "La democracia ateniense usaba ostracismo: 6.000 ciudadanos podian votar exiliar a un politico demasiado poderoso." },
  { id: "c10", cat: "POLITICA", text: "San Marino elige sus gobierno cada 6 meses: ha tenido mas de 1.400 jefes de Estado desde 1243." },
  { id: "c11", cat: "POLITICA", text: "El microestado de Sealand es una plataforma militar abandonada con 'constitucion' propia y moneda oficial." },
  { id: "c12", cat: "POLITICA", text: "Liechtenstein alquilo su ejercito entero en 1866: fueron 80 hombres y volvieron con 81 (se trajo un amigo austriaco)." },
  { id: "c13", cat: "RELIGION", text: "El vatican es el estado con menor poblacion (~800) y mayor consumo de vino per capita del mundo." },
  { id: "c14", cat: "RELIGION", text: "El Dalai Lama viaja con un equipo de cocineros que preparan comida tibetana y mantiene un chat oficial con cientificos desde 1987." },
  { id: "c15", cat: "RELIGION", text: "El Islam prohíbe el interes financiero (riba): por eso nacieron los bancos islamicos con participacion en beneficios." },
  { id: "c16", cat: "RELIGION", text: "Los monjes irlandeses salvaron textos clasicos romanos copiandolos a mano durante la edad oscura europea." },
  { id: "c17", cat: "RELIGION", text: "La Kaaba se 'viste': la kiswa de seda bordada con oro se renueva cada ano y cuesta ~6 M US$." },
  { id: "c18", cat: "RELIGION", text: "El judaismo prohíbe pronunciar el nombre completo de Dios: se escribe G-d en algunos textos tradicionales." },
  { id: "c19", cat: "ANTIGUEDAD", text: "Cleopatra vivio mas cerca de la llegada a la Luna (1969) que de la construccion de la Gran Piramide (2560 a.C.)." },
  { id: "c20", cat: "ANTIGUEDAD", text: "Los romanos usaban orina (recolectada en recipientes publicos) como detergente porque el amoniaco blanqueaba la ropa." },
  { id: "c21", cat: "ANTIGUEDAD", text: "Esparta prohibio escribir demasiado: 'la brevedad laconica' (laconica) viene de sus respuestas de una linea." },
  { id: "c22", cat: "ANTIGUEDAD", text: "El coliseo romano podia inundarse para simulacros navales (naumachiae) en sus primeros anos." },
  { id: "c23", cat: "ANTIGUEDAD", text: "Herodoto, padre de la historia, tambien escribio relatos de hormigas gigantes que excavaban oro en la India." },
  { id: "c24", cat: "ANTIGUEDAD", text: "Los egipcios pagaban a los trabajadores de las piramides en pan y cerveza: ~4-5 litros de cerveza al dia por obrero." },
  { id: "c25", cat: "ECONOMIA", text: "El tulipan mania (1637): un bulbo llego a costar el precio de una casa en Amsterdam, y la burbuja explotó en una semana." },
  { id: "c26", cat: "ECONOMIA", text: "El bitcoin nacio en 2009 con un mensaje escondido: 'Chancellor on brink of second bailout for banks' — un titular real del Times." },
  { id: "c27", cat: "ECONOMIA", text: "La sal fue tan valiosa que 'salary' viene de 'salarium': soldados romanos cobraban asignaciones para comprar sal." },
  { id: "c28", cat: "ECONOMIA", text: "En 1923, en la hiperinflacion alemana, la gente quemaba billetes de marca porque calentaban mas barato que leña." },
  { id: "c29", cat: "ECONOMIA", text: "El PIB de Nvidia superó el PIB de Rusia en 2024: una empresa de chips vale mas que una superpotencia energetica." },
  { id: "c30", cat: "ECONOMIA", text: "El 'hombre de McDonalds' (índice Big Mac) compara monedas por el precio de una hamburguesa en cada pais." },
  { id: "c31", cat: "ESPIONAJE", text: "La CIA desarrollo un 'gato acoustic' con microfonos implantados para espiar al Kremlin. Lo atropellaron al salir de la base." },
  { id: "c32", cat: "ESPIONAJE", text: "En la 2GM los aliados fingian ataques con inflables: tanques de goma para confundir a la aviacion nazi." },
  { id: "c33", cat: "ESPIONAJE", text: "El MI5 usó espías 'calentitos': palomas mensajeras con camaras de fotos sobre el enemigo." },
  { id: "c34", cat: "ESPIONAJE", text: "La 'Operacion Mincemeat' plantó un cadaver con documentos falsos para convencer a Hitler del falso desembarco en Grecia." },
  { id: "c35", cat: "ESPIONAJE", text: "El numero de telefono del KGB que aparecia en TV sovietica recibia denuncias ciudadanas... y denuncias de espías." },
  { id: "c36", cat: "ESPIONAJE", text: "En la Guerra Fria se usaban monedas huecas con microfilmes dentro para pasar mensajes sin ser detectados." },
  { id: "c37", cat: "GUERRA", text: "Los vikingos llegaron a America 500 anos antes que Colon: L'Anse aux Meadows (Canada) es la prueba arqueologica." },
  { id: "c38", cat: "GUERRA", text: "La guerra mas corta de la historia duro 38 minutos: Reino Unido vs Zanzibar (1896)." },
  { id: "c39", cat: "GUERRA", text: "Los tanques T-34 sovieticos salian de fabricas en llamas y entraban en combate con el humo todavia saliendo del motor." },
  { id: "c40", cat: "POLITICA", text: "El 'Partido de la Pirateria' de Suecia legalmente propuso descatalogar patentes y compartir cultura en internet." },
  { id: "c41", cat: "ANTIGUEDAD", text: "Los mayas tenian el concepto del cero antes que los romanos, y calculaban eclipses con precision de minutos." },
  { id: "c42", cat: "RELIGION", text: "La Ciudad del Vaticano tiene su propio equipo de futbol y su campeonato entre guardias suizos, musculos y administracion." },
  { id: "c43", cat: "ECONOMIA", text: "El pais mas 'bancarizado' del mundo es Kenia por el movil: M-Pesa mueve mas dinero que muchas redes bancarias tradicionales." },
  { id: "c44", cat: "GUERRA", text: "En la 2GM el psicologo B.F. Skinner entreno palomas para guiar misiles picoteando una pantalla con la imagen del objetivo." },
];

// ================= EPOCAS DE LA ANTIGUEDAD =================
export interface EraItem {
  id: string;
  name: string;
  period: string;
  img?: string;
  desc: string;
  empires: string[];
  inventions: string[];
  thenNow: { old: string; now: string };
  quiz: { q: string; options: string[]; answer: number };
}

export const ERAS: EraItem[] = [
  {
    id: "prehistoria", name: "Prehistoria", period: "2,5 M a.C. – 3500 a.C.",
    desc: "La era antes de la escritura: del primer cantaro tallado a las pinturas rupestres de Lascaux y Altamira. El humano domino el fuego, inventó la agricultura y paso de nomada a sedentario, sentando la base de todo lo que vendria.\n\nSin ciudades ni Estados, las bandas de cazadores-recolectores dibujaron en cuevas los primeros documentos visuales de la humanidad: bisontes, manos y escenas de caza que siguen vivas 30.000 anos despues.",
    empires: ["Bandas tribales", "Primeras aldeas agricolas"],
    inventions: ["Fuego controlado", "Rueda ceramica", "Agricultura", "Ganaderia", "Pintura rupestre"],
    thenNow: { old: "Herramientas de piedra tallada", now: "El 'piedra' vive en nuestro smartphone (silicio)" },
    quiz: { q: "Que invento convirtio a los nomadas en sedentarios?", options: ["La rueda de carro", "La agricultura", "La escritura", "La moneda"], answer: 1 },
  },
  {
    id: "mesopotamia", name: "Mesopotamia", period: "3500 – 539 a.C.",
    img: "/assets/wiki/era-mesopotamia.jpg",
    desc: "Entre el Tigris y el Eufrates nacio la civilizacion: escritura cuneiforme en tablillas de barro, las primeras ciudades (Uruk, Ur), el Codigo de Hammurabi y la epopeya de Gilgamesh, la primera historia literaria del mundo.\n\nBabilonia calculo astronomia de precision y heredó al mundo los 60 minutos de la hora. Sumerios, acadios, asirios y caldeos se sucedieron entre guerras de carros y torres escalonadas (ziggurats).",
    empires: ["Sumeria", "Acadio", "Babilonia", "Asiria"],
    inventions: ["Escritura cuneiforme", "Codigo legal", "Astronomia", "El 60 (horas/minutos)", "Epica literaria"],
    thenNow: { old: "Tablillas de arcilla con cuneiforme", now: "Notas de voz y mensajes digitales" },
    quiz: { q: "Que invento sumerio usamos cada vez que miramos un reloj?", options: ["El reloj de arena", "La base 60", "El calendario gregoriano", "El meridiano cero"], answer: 1 },
  },
  {
    id: "egipto", name: "Antiguo Egipto", period: "3100 – 30 a.C.",
    img: "/assets/wiki/era-egipto.jpg",
    desc: "30 dinastias a orillas del Nilo: piramides de Giza, esfinges, jeroglificos descifrados con la Piedra de Rosetta y faraones considerados dioses vivos. Cleopatra, la ultima, murio cuando Egipto pasò a manos de Roma.\n\nLa agricultura del nilo (crecidas e inundaciones predecibles) sustentó un Estado milenario con tesoros que aun hoy asombran: la tumba de Tutankamon, intacta en 1922, llenó museos del planeta.",
    empires: ["Imperio Antiguo", "Imperio Medio", "Imperio Nuevo"],
    inventions: ["Jeroglificos", "Papiro", "Calendario solar de 365 dias", "Mumificacion", "Aritmetica y geometria practica"],
    thenNow: { old: "Papiro y jeroglificos sagrados", now: "Papel y emojis" },
    quiz: { q: "Que piedra permitio descifrar los jeroglificos?", options: ["La piedra de Rosetta", "La piedra filosofal", "El obelisco de Luxor", "La esfinge de Giza"], answer: 0 },
  },
  {
    id: "grecia", name: "Grecia Clásica", period: "800 – 146 a.C.",
    img: "/assets/wiki/era-grecia.jpg",
    desc: "Poleis independientes —Atenas, Esparta, Corinto— que inventaron la democracia, el teatro, la filosofia y los Juegos Olimpicos. Solo, un puñado de ciudades frenó al imperio persa en Maratón y Salamina.\n\nSocrates, Plato y Aristotle fundaron la tradicion filosofica occidental; Herodoto y Tucidides la historia critica; Euclides la geometria. Alejandria (heredera griega) guardo la mayor biblioteca del mundo antiguo.",
    empires: ["Atenas", "Esparta", "Liga de Corinto", "Macedonia de Alejandro"],
    inventions: ["Democracia", "Filosofia", "Teatro", "Olimpiadas", "Geometria euclidiana"],
    thenNow: { old: "Agora y asamblea con sorteo", now: "Parlamentos y encuestas online" },
    quiz: { q: "En que ciudad nacio la democracia?", options: ["Esparta", "Atenas", "Corinto", "Tebas"], answer: 1 },
  },
  {
    id: "roma", name: "Roma", period: "753 a.C. – 476 d.C.",
    img: "/assets/wiki/era-roma.jpg",
    desc: "De aldea en las siete colinas a imperio de 5 millones de km2: acueductos, calzadas, derecho civil, legiones y coliseos. La republica romana dio el senado; el imperio, augures y cesares. Julio Cesar cruzo el Rubicon y murio por la república que ya no existia.\n\nSu herencia es estructural: el latín se convirtió en frances, español, italiano; su derecho sostiene codigos civiles modernos; sus caminos dibujan rutas que hoy son autopistas.",
    empires: ["Republica Romana", "Imperio Romano", "Imperio de Occidente y Oriente"],
    inventions: ["Derecho civil", "Acueductos y hormigon", "Calzadas", "Legion profesional", "Calendario juliano"],
    thenNow: { old: "Calzadas de piedra para legiones", now: "Autopistas que copian sus rutas" },
    quiz: { q: "Que heredamos juridicamente de Roma?", options: ["El common law ingles", "El derecho civil codificado", "La constitucion escrita", "El jurado popular"], answer: 1 },
  },
  {
    id: "edadmedia", name: "Edad Media", period: "476 – 1492",
    desc: "Mil anos entre la caída de Roma y el renacimiento: castillos, catedrales, caballeros, peste negra y monasterios que copiaron el saber antiguo. El islam brilló en Cordoba y Bagdad mientras Europa feudal contaba con molinos y catedrales góticas.\n\nDel sistema feudal a las universidades (Bolonia 1088), de la peste (1347-51, mato ~1/3 de Europa) a la imprenta (1450): el puente que conecta el mundo antiguo con el moderno.",
    empires: ["Bizancio", "Califato islamico", "Sacramento Imperio", "Reinos feudales"],
    inventions: ["Universidades", "Molinos y arado pesado", "Brújula y papel (via islam)", "Catedral gotica", "Imprenta de tipos moviles"],
    thenNow: { old: "Monjes copistas en scriptorium", now: "Imprenta digital y PDF" },
    quiz: { q: "Cual fue la primera universidad de Europa?", options: ["Oxford", "Sorbona", "Bolonia", "Salamanca"], answer: 2 },
  },
  {
    id: "renacimiento", name: "Renacimiento", period: "1400 – 1600",
    desc: "El redescubrimiento del mundo clasico y del humano: Leonardo, Miguel Angel, Rafael y Tiziano; Gutenberg multiplica libros; Colón abre America; Copernico mueve la Tierra del centro del universo. Florencia, con los Medici, es su motor.\n\nPerspectiva en la pintura, anatomia en el dibujo, razon en la politica (Maquiavelo) y Global en la economia: el humanismo que preparó la ciencia moderna.",
    empires: ["Republica de Florencia", "España de los Austrias", "Papado renacentista"],
    inventions: ["Imprenta moderna", "Perspectiva pictorica", "Navegacion oceanica", "Maquinas de Leonardo"],
    thenNow: { old: "Codices ilustrados a mano", now: "Libros impresos y escaneados" },
    quiz: { q: "Quien pinto la Capilla Sixtina?", options: ["Leonardo da Vinci", "Miguel Angel", "Rafael", "Tiziano"], answer: 1 },
  },
  {
    id: "colonial", name: "Era Colonial", period: "1492 – 1914",
    desc: "Los imperios europeos reparten el planeta: America, Africa, Asia y Oceania bajo banderas espanola, portuguesa, britanica, francesa, holandesa y belga. Plataforma de oro y plata, comercio triangulo, esclavitud y epidemias que mataron millones de indigenas.\n\nDel tratado de Tordesillas (1494) a la Conferencia de Berlin (1884-85), la era creó la globalizacion capitalista y sus cicatrices: fronteras artificiales y desigualdades que hoy siguen vivas.",
    empires: ["Imperio español", "Imperio britanico", "Imperio frances", "Imperio portugues"],
    inventions: ["Carracas y galeones", "Companias de comercio (EIC, VOC)", "Plantaciones y triangulo atlantico", "Cartografia global"],
    thenNow: { old: "Compania de Indias con ejercito propio", now: "Multinacionales con capital mayor al PIB de paises" },
    quiz: { q: "Que conferencia repartió Africa en 1884-85?", options: ["Congreso de Viena", "Conferencia de Berlin", "Concilio de Trento", "Tratado de Utrecht"], answer: 1 },
  },
];

// ================= CONTADORES DE MUERTES =================
export interface DeathCounter { id: string; name: string; years: string; total: number; perDay: number; note: string; color: string; }

export const WAR_DEATHS: DeathCounter[] = [
  { id: "ww2", name: "Segunda Guerra Mundial", years: "1939–1945", total: 75_000_000, perDay: 34_246, note: "~2.500 muertes por hora durante 6 anos", color: "#ef4444" },
  { id: "ww1", name: "Primera Guerra Mundial", years: "1914–1918", total: 17_000_000, perDay: 11_643, note: "El dia mas sangriento: 1 julio 1916 (Somme)", color: "#f59e0b" },
  { id: "mongol", name: "Invasiones mongolas", years: "1206–1368", total: 40_000_000, perDay: 878, note: "Redujo la poblacion mundial ~11%", color: "#a855f7" },
  { id: "taiping", name: "Rebelion Taiping", years: "1850–1864", total: 20_000_000, perDay: 3_653, note: "La guerra civil mas letal de la historia", color: "#22d3ee" },
  { id: "vietnam", name: "Guerra de Vietnam", years: "1955–1975", total: 2_500_000, perDay: 342, note: "Bajas civiles superiores a militares", color: "#22c55e" },
  { id: "corea", name: "Guerra de Corea", years: "1950–1953", total: 2_500_000, perDay: 1_712, note: "Sin tratado de paz formal aun hoy", color: "#f97316" },
];

// tasas reales aprox. del mundo (ONU/WHO 2024): nacen ~4.3/s, mueren ~2.0/s
export const LIVE_RATES = { birthsPerSec: 4.3, deathsPerSec: 1.97, popStart: 8_180_000_000 };

export const GLOBAL_CRIME = [
  { label: "Homicidios anuales (mundo)", value: "~458.000", note: "0,6 por cada 100.000 hab." },
  { label: "Trata de personas", value: "~27,6 M en esclavitud moderna", note: "Ganancias ilegales ~150.000 M US$/ano" },
  { label: "Ciberdelincuencia", value: "~10,5 billones US$/ano est. 2025", note: "3a 'economia' del mundo si fuera pais" },
  { label: "Contrabando de fauna", value: "~20.000 M US$/ano", note: "4o trafico ilegal mas lucrativo" },
];

// ================= CARTELES Y CRIMEN ORGANIZADO =================
export interface CartelItem {
  id: string;
  name: string;
  origin: string;
  founded: string;
  territory: string;
  income: string;
  leader: { name: string; img?: string; note: string };
  structure: string;
  desc: string;
  timeline: { year: string; text: string }[];
  presence: { lat: number; lng: number; r: number };
}

export const CARTELS: CartelItem[] = [
  {
    id: "medellin", name: "Cartel de Medellín", origin: "Colombia", founded: "1976–1993", territory: "Antioquia, corredor caribeño a Miami", income: "~60 M US$/dia en su pico (1989)",
    leader: { name: "Pablo Escobar", img: "/assets/wiki/cartel-escobar.jpg", note: "El 'capo' mas famoso: de contrabandista a congresista, murio tiroteado en 1993" },
    structure: "Vertical: la palabra de Escobar era ley; jefes de plaza y sicarios a pie de calle",
    desc: "El cartel de Medellín monopolizó el 80% del trafico de cocaina a EEUU en los 80. Escobar aplico terror de Estado: carros bomba, avionetas y el bombardeo de un avion civil con 107 muertos. Financio barrios enteros ('Medellín sin tugurios') mientras declaraba guerra al Estado.\n\nSu caida —caza operada con el Bloque de Busqueda y los Pepes— instalo la era del cartel Cali y la paraestatal 'narco-paramilitarismo' colombiano.",
    timeline: [{ year: "1976", text: "Escobar consolida rutas hacia Miami" }, { year: "1984", text: "Asesinato del ministro Lara: guerra abierta" }, { year: "1989", text: "Bomba al avion de Avianca: 107 muertos" }, { year: "1991", text: "Escobar entra a su carcel privada 'La Catedral'" }, { year: "1993", text: "Muerto en la azotea de Medellín" }],
    presence: { lat: 6.25, lng: -75.56, r: 22 },
  },
  {
    id: "sinaloa", name: "Cártel de Sinaloa", origin: "México", founded: "1989–hoy", territory: "Sinaloa, Durango, frontera norte, 50+ paises", income: "Est. 3.000–10.000 M US$/ano",
    leader: { name: "Joaquin 'El Chapo' Guzmán", img: "/assets/wiki/cartel-chapo.jpg", note: "Escapo 2 veces de prisiones de maxima seguridad; extraditado a EEUU en 2017" },
    structure: "Federacion de cells con autonomia logistica; hoy fragmentado en facciones de los Chapitos y Mayo Zambada",
    desc: "El cartel de Sinaloa industrializó el trafico: tuneles bajo la frontera con rieles y ventilacion, submarinos semisumergibles, aviones y 'mochileros' en la sierra. Su modelo de corrupcion vertical (policia, politica, ejercito) se volvio plantilla regional.\n\nDesde la captura de El Chapo, la federacion se fragmento y la violencia entre facciones (Chapitos vs Mayo, CJNG) convirtio a Sinaloa en el epicentro de la crisis de fentanilo que cruza la frontera norte.",
    timeline: [{ year: "1989", text: "Guzman se independiza del cartel de Guadalajara" }, { year: "2001", text: "Primera fuga (carro de ropa en Puente Grande)" }, { year: "2014", text: "Captura en Mazatlan; escapa por tunel en 2015" }, { year: "2016", text: "Recaptura en Los Mochis" }, { year: "2017", text: "Extradicion a EEUU; cadena perpetua" }],
    presence: { lat: 25.0, lng: -107.4, r: 26 },
  },
  {
    id: "cjng", name: "CJNG (Jalisco Nueva Generación)", origin: "México", founded: "2010–hoy", territory: "Jalisco, Guanajuato, 28+ estados, expansion internacional", income: "Est. 5.000+ M US$/ano",
    leader: { name: "Nemesio 'El Mencho' Oseguera", note: "El hombre mas buscado de Mexico; recompensa de 10 M US$ del DEA" },
    structure: "Militarizada: cells jerarquicas, entrenamiento paramilitar y propaganda con videos de ejecucion",
    desc: "El CJNG es la organizacion criminal de crecimiento mas rapido del siglo: derribó un helicóptero militar en 2015, opera metanfetamina de síntesis a escala industrial y disputa plaza por plaza contra Sinaloa. El fentanilo y el metanfetamino son su sello quimico.\n\nEl Mencho, ex-policia y aguacatero, construyo una estructura tipo guerrilla con presencia declarada en decenas de paises; el gobierno mexicano lo considera la amenaza criminal numero uno.",
    timeline: [{ year: "2010", text: "Nace de una cell milenaria de Sinaloa" }, { year: "2015", text: "Derriban un helicóptero del ejercito en Jalisco" }, { year: "2020", text: "Intento de atentado contra el jefe de policia de CDMX" }, { year: "Hoy", text: "Mayor cartel de metanfetamina del mundo" }],
    presence: { lat: 20.6, lng: -103.3, r: 24 },
  },
  {
    id: "ndrangheta", name: "'Ndrangheta", origin: "Italia (Calabria)", founded: "s. XIX–hoy", territory: "Calabria, Europa entera, cocaína global", income: "Est. ~3-4% del PIB italiano",
    leader: { name: "Colleggio (directorio de capos)", note: "Estructura horizontal y familiar: casi imposible decapitar" },
    structure: "Horizontal por familias de sangre; matrimonios como alianzas; 'ndrine autónomas",
    desc: "Menos famosa que la mafia siciliana y mas poderosa: la 'Ndrangheta controla gran parte de la cocaina europea (acuerdo con productores latinoamericanos), lava dinero en construcciones, restaurantes y agricultura, y practica el silencio absoluto (omerta) con castigos dinasticos.\n\nEl macro-juicio 'Rinascita-Reset' (2023) mostro su mapa: 400+ operativos juzgados y familias asentadas en Alemania, Belgica y Australia desde hace decadas.",
    timeline: [{ year: "1861", text: "Nace en la Calabria pos-unificacion" }, { year: "1991", text: "Guerra de Duisburgo (Alemania): 6 muertos" }, { year: "2010", text: "Operacion Crimine: el 'superclan' a juicio" }, { year: "2023", text: "Macro-juicio de Lamezia: 200+ condenas" }],
    presence: { lat: 39.0, lng: 16.5, r: 18 },
  },
  {
    id: "yakuza", name: "Yakuza", origin: "Japón", founded: "s. XVII–hoy", territory: "Japon, expansion en Asia y EEUU", income: "Est. ~5.000 M US$/ano",
    leader: { name: "Kobe Yamaguchi-gumi (el gran clan)", note: "El mayor grupo: ~10.000 miembros en su pico" },
    structure: "Vertical paternalista: oyabun (padrino) y kobun (hijos); oficinas con placas legales",
    desc: "Los 'boryokudan' (grupos violentos) japoneses heredan tradiciones de los tekiya (vendedores ambulantes) y bakuto (jugadores). Aunque mostraban oficinas abiertas y hasta revistas internas, su modelo tradicional (proteccion, apuestas ilegales, deuda) choco con la ley moderna: las leyes de 1992 y 2011 los expulsaron de la vida economica formal.\n\nHoy fragmentados y envejecidos, subsisten en finanzas, fraudes constructivos y ciberfraude, con presencia en el nicho de las drogas sinteticas asiaticas.",
    timeline: [{ year: "1660s", text: "Origenes: bakuto y tekiya" }, { year: "1915", text: "Fundacion del Yamaguchi-gumi" }, { year: "1992", text: "Ley anti-boryokudan" }, { year: "2011", text: "Ley que criminaliza pagos de proteccion" }],
    presence: { lat: 34.7, lng: 135.5, r: 15 },
  },
  {
    id: "triadas", name: "Tríadas", origin: "China / Hong Kong", founded: "s. XVIII–hoy", territory: "Hong Kong, Macao, Chinatowns globales", income: "Difuso (redes de cells)",
    leader: { name: "14K, Wo Shing Wo, Sun Yee On", note: "Las tres mayores tríadas, decenas de miles de afiliados" },
    structure: "Rango ritual (numerado 426, 415...); cells flexibles tipo franquicia",
    desc: "Nacidas como sociedades secretas antimanchu ('triada' por el triangulo sagrado), las triadas se volvieron sindicatos del crimen: extorsion en Chinatowns, contrabando portuario, falsificacion, juego ilegal y lavado via Hong Kong y Macao.\n\nSu flexibilidad celular —cada nucleo opera casi independiente— las hace mas dificiles de decapitar que una piramide; se fusionan con 'snakeheads' (trafico de personas) y casinos de la region.",
    timeline: [{ year: "1760s", text: "Sociedad del Loto Blanco y precursoras" }, { year: "1949", text: "Migracion a Hong Kong tras la revolucion" }, { year: "1997", text: "Handover: presion policial en HK" }, { year: "Hoy", text: "Ciberfraude y lavado via Macao" }],
    presence: { lat: 22.3, lng: 114.2, r: 14 },
  },
  {
    id: "bratva", name: "Bratva (mafia rusa)", origin: "URSS / Rusia", founded: "anos 70–hoy", territory: "Rusia, ex-URSS, Europa, Israel, EEUU", income: "Multi-sectorial",
    leader: { name: "Vory v zakone ('ladrones de ley')", note: "Corona de tatuajes: codigos de honor carcelario" },
    structure: "Casta de 'vory' sobre obshchak (caja comun); subordinacion por tatuajes y codigos",
    desc: "Nacida en el gulag, la mafia rusa exportó su modelo cuando la URSS cayo: privatizaciones de los 90 (aluminio, petroleo, banca) las convirtieron en socios de oligarcas. El 'vory v zakone' (ladrones con ley) juro autoridad sobre el crimen con codigo medieval: prohibido colaborar con el Estado.\n\nHoy la línea entre bratva, FSB y capitalismo de amigos es deliberadamente borrosa; el crimen organizado ruso opera ciberataques de rehenes (ransomware) y contrabando de sanciones global.",
    timeline: [{ year: "1930s", text: "Nace la casta vory en el gulag" }, { year: "1990s", text: "Privatizaciones: boom post-sovietico" }, { year: "2000s", text: "Expansion europea y telones de humo" }, { year: "2020s", text: "Ransomware y evasion de sanciones" }],
    presence: { lat: 55.75, lng: 37.6, r: 20 },
  },
  {
    id: "ms13", name: "Mara Salvatrucha (MS-13)", origin: "El Salvador / Los Ángeles", founded: "anos 80–hoy", territory: "Triangulo Norte de Centroamerica, EEUU", income: "Extorsion + narcomenudeo",
    leader: { name: "Sin un solo jefe: clicas ('programas locales')", note: "Cada 'clica' opera semi-autonomamente" },
    structure: "Cells territoriales ('programas') con rituales de ingreso violentos",
    desc: "Nacida entre refugiados salvadorenos de la guerra civil en Los Angeles, la MS-13 fue deportada masivamente a Centroamerica en los 90 y encontro terreno fertil: extorsión de transporte y comercios, reclutamiento de menores y violencia ritual que la hizo infame.\n\nEl regimen de Bukele la aplasto con estado de excepcion y mega-carcel CECOT (2023): mas de 70.000 detenidos, tasa de homicidios historica minima y un debate internacional sobre derechos humanos.",
    timeline: [{ year: "1980s", text: "Nace en las calles de LA" }, { year: "1996", text: "Ley de deportaciones: retorno masivo" }, { year: "2015", text: "El Salvador: pais mas violento del mundo" }, { year: "2023", text: "CECOT: mega-carcel de Bukele" }],
    presence: { lat: 13.7, lng: -89.2, r: 16 },
  },
];
