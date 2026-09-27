// v63.0 PRIMERA PÁGINA — DATOS ESTÁTICOS DE LA BIBLIOTECA OSCURA
// Separados del store (oscura.ts) para poder importarlos desde componentes
// SERVIDOR (SEO /guerra-hoy) sin arrastrar el "use client". Mismo contenido
// verificado: cada teoría con veredicto REAL/MITO/PARCIAL y fuente real.

export type Veredicto = "MITO" | "REAL" | "PARCIAL";
export type OscuraRarity = "COMUN" | "RARO" | "EPICO" | "LEGENDARIO";

export interface TeoriaOscura {
  id: string;
  titulo: string;
  veredicto: Veredicto;
  rareza: OscuraRarity;
  origen: string;   // dónde y cuándo nació la historia
  creencia: string; // qué afirma la teoría
  realidad: string; // qué dicen los documentos reales
  url: string;      // fuente real verificada
  fuente: string;   // nombre de la fuente
}

export interface ArmaOscura {
  id: string;
  titulo: string;
  epoca: string;
  idea: string;   // la idea que la creó
  legado: string; // qué cambió en el mundo
  url: string;
  fuente: string;
}

export interface CivilizacionOscura {
  id: string;
  titulo: string;
  epoca: string;
  que: string;    // qué logró
  misterio: string; // cómo/por qué aterró y desapareció
  url: string;
  fuente: string;
}

// ============ COLECCIÓN 1: TEORÍAS OSCURAS (10) ============
export const TEORIAS: TeoriaOscura[] = [
  {
    id: "t-reptilianos",
    titulo: "REPTILIANOS: la élite cambiapieles",
    veredicto: "MITO",
    rareza: "LEGENDARIO",
    origen: "Nació en la ciencia-ficción de 1934 («La sombra del rey» de Robert E. Howard) y la relanzó David Icke en 1998 ante miles de personas en Londres.",
    creencia: "Que dirigentes, reyes y presidentes son en realidad reptiles gigantes con piel humana que beben sangre y controlan el mundo desde tuneles subterráneos.",
    realidad: "NINGUNA foto real existe jamás: ni una sola pieza de evidencia en 90 años. Lo que sí es real: la CIA desclasificó sus archivos OVNI y el avión espía U-2 explic medio milenio de avistamientos «reptilianos/aliens» — gente viendo cosas que no reconocía a 20 km de altura.",
    url: "https://www.cia.gov/readingroom/collection/ufo-collection",
    fuente: "CIA Reading Room · Colección OVNI",
  },
  {
    id: "t-mkultra",
    titulo: "MK-ULTRA: control mental de la CIA",
    veredicto: "REAL",
    rareza: "LEGENDARIO",
    origen: "1953, dirección de la CIA en Langley. Destruido el 90% de los archivos en 1973 por orden del director Helms… pero sobrevivieron 20.000 páginas mal archivadas.",
    creencia: "Que la CIA experimentó con mentes humanas para crear asesinos hipnotizados y robots diplomáticos.",
    realidad: "Confirmado por el propio Senado de EE.UU. (comite Church, 1975): LSD a ciudadanos sin saberlo, electroshocks, tortura sensorial en universidades, hospitales y prisiones. Puedes leer las páginas que sobrevivieron, hoy públicas.",
    url: "https://www.cia.gov/readingroom/collection/mkultra",
    fuente: "CIA Reading Room · Colección MK-ULTRA",
  },
  {
    id: "t-paperclip",
    titulo: "OPERACIÓN PAPERCLIP: los científicos nazis de EE.UU.",
    veredicto: "REAL",
    rareza: "EPICO",
    origen: "1945, los últimos días de la 2ª Guerra Mundial. Un programón secreto metió a 1.600 científicos alemanes en aviones hacia EE.UU.",
    creencia: "Que EE.UU. rescató criminales de guerra para robar su tecnología.",
    realidad: "Confirmado: Wernher von Braun (padre del Saturno V que llevó al hombre a la Luna) era oficial de las SS. El expediente completo está en los Archivos Nacionales; su contenido aterró al mundo cuando se desclasificó.",
    url: "https://www.archives.gov/research/military",
    fuente: "NARA · Registros militares",
  },
  {
    id: "t-area51",
    titulo: "ÁREA 51: el lago seco de los «platillos»",
    veredicto: "PARCIAL",
    rareza: "EPICO",
    origen: "Nevada, 1955. Los mapas marcaban solo un lago seco: Groom Lake. El Gobierno negó su existencia durante décadas… hasta desclasificarla en 2013.",
    creencia: "Que allí guardan alienígenas capturados y navegan naves invertidas.",
    realidad: "Lo desclasificado es casi mejor: allí voló el U-2 y el A-12 OXCART, aviones espía tan extraños que LA CIA admite que explicaron la mitad de los avistamientos OVNI de los años 50. No hay alienígenas: hay ingeniería que parecía de otro planeta.",
    url: "https://www.cia.gov/readingroom/collection/ufo-collection",
    fuente: "CIA Reading Room · U-2 y OVNI",
  },
  {
    id: "t-haarp",
    titulo: "HAARP: la antena que desperta terremotos",
    veredicto: "PARCIAL",
    rareza: "RARO",
    origen: "Alaska, 1993. 180 antenas de 22 metros clavadas en la tundra, capaces de calentar la ionosfera con 3.6 megavatios.",
    creencia: "Que es un arma climática que lanza huracanes, terremotos y controla mentes a distancia.",
    realidad: "La instalación es real y está abierta al público en visitas científicas (Universidad de Alaska). Estudia la ionosfera, no provoca catástrofes: su energía es millones de veces menor que la de un solo huracán natural.",
    url: "https://www.gi.alaska.edu/haarp",
    fuente: "Universidad de Alaska · HAARP oficial",
  },
  {
    id: "t-bermudas",
    titulo: "TRIÁNGULO DE LAS BERMUDAS: el cementerio de barcos",
    veredicto: "MITO",
    rareza: "RARO",
    origen: "Artículos de revistas sensacionalistas de los años 50-60 que encadenaron naufragios dispersos en un triángulo imaginario.",
    creencia: "Que un vórtice, magnetismo anormal o algo peor traga barcos y aviones sin explicación.",
    realidad: "La NOAA y los aseguradores Lloyd's de Londres lo cerraron: la zona no es más peligrosa que el resto del océano y las desapariciones tienen causas normales (meteorología, error humano). El mito vendió millones de libros.",
    url: "https://oceanservice.noaa.gov/facts/bermudatri.html",
    fuente: "NOAA · Ocean Service",
  },
  {
    id: "t-now",
    titulo: "NUEVO ORDEN MUNDIAL: el gobierno único",
    veredicto: "MITO",
    rareza: "COMUN",
    origen: "Discurso de George H. W. Bush en 1990 tras la Guerra Fría; antes ya sonaba en retórica de entreguerras.",
    creencia: "Que una casta global secreta (Bilderberg, Illuminati, Davos) planea un gobierno mundial único con moneda única y control total.",
    realidad: "Las reuniones existen, los organismos internacionales existen — pero cada país sigue actuando por su cuenta: guerras comerciales, invasiones y vetos en la ONU demuestran que nadie controla nada. La desunión es lo único constante.",
    url: "https://www.archives.gov/research/foreign-policy",
    fuente: "NARA · Política exterior",
  },
  {
    id: "t-doomsday",
    titulo: "LA BÓVEDA DEL FIN DEL MUNDO",
    veredicto: "REAL",
    rareza: "EPICO",
    origen: "Svalbard, Ártico noruego, 2008. A 1.300 km del Polo Norte, dentro de una montaña de permafrost.",
    creencia: "Que es una instalación secreta de clonación o refugio de élites.",
    realidad: "Es la Bóveda Global de Semillas: más de 1,2 millones de semillas de cultivos de casi todos los países, guardadas contra catástrofes globales. Junto a ella, los archivos de la Bóveda Nuclear documentan cómo cerca de estuvimos de aniquilarnos.",
    url: "https://nsarchive.gmu.edu",
    fuente: "National Security Archive · Nuclear Vault",
  },
  {
    id: "t-jfk",
    titulo: "JFK: los archivos que tardaron 60 años",
    veredicto: "PARCIAL",
    rareza: "LEGENDARIO",
    origen: "Dallas, 22 de noviembre de 1963. 5 millones de documentos federales, miles marcados «SECRETO» durante generaciones.",
    creencia: "Que una conspiración de la CIA, la mafia o Lyndon Johnson asesinó al presidente.",
    realidad: "Decenas de miles de páginas ya están públicas en el portal JFK de NARA y siguen liberándose por lotes. Han salido planes secretos reales (Operación Northwoods propuso atentados falsos como pretexto para invadir Cuba, rechazada). El 100% no está liberado.",
    url: "https://www.archives.gov/research/jfk",
    fuente: "NARA · Asesinato de JFK",
  },
  {
    id: "t-uap",
    titulo: "UAP: los videos que el Pentágono confirmó",
    veredicto: "PARCIAL",
    rareza: "EPICO",
    origen: "2004-2021, portaviones EE.UU. en el Pacífico. Videos filtrados que el propio Departamento de Defensa validó como auténticos en 2020.",
    creencia: "Que son naves de otros mundos observando a la humanidad.",
    realidad: "Los videos son reales y oficiales; los objetos no identificados también. La conclusión oficial es más inquietante: «no sabemos qué son». La Oficina AARO sigue investigando sin encontrar ni aliens ni secretos soviéticos. El vacío de respuestas es real.",
    url: "https://www.theblackvault.com",
    fuente: "The Black Vault · Archivo UAP/OVNI",
  },
  {
    id: "t-stargate",
    titulo: "PROYECTO STARGATE: los psíquicos del ejército",
    veredicto: "REAL",
    rareza: "EPICO",
    origen: "Años 70, EE.UU. El gobierno gastó más de 20 millones de dólares durante dos décadas en un programa secreto de «visión remota».",
    creencia: "Que soldados con poderes mentales espiaban bases soviéticas, submarinos y rehenes usando solo la mente desde una sala cerrada.",
    realidad: "Existió de verdad: 22 millones de dólares, laboratorios en Stanford y Fort Meade. La CIA desclasificó TODO el archivo: memorandos, sesiones y el informe final de 1995 que lo cerró al concluir que nunca produjo inteligencia utilizable. Los documentos son delirantes… y 100% auténticos.",
    url: "https://www.cia.gov/readingroom/collection/stargate",
    fuente: "CIA Reading Room · Colección STARGATE",
  },
  {
    id: "t-gateway",
    titulo: "GATEWAY: el documento CIA de la «salida del cuerpo»",
    veredicto: "PARCIAL",
    rareza: "RARO",
    origen: "1983, un informe técnico que la CIA archivó y que internet redescubrió décadas después convirtiéndolo en objeto de culto.",
    creencia: "Que el gobierno estudió cómo sacar la conciencia del cuerpo, viajar fuera del tiempo y contactar con otras dimensiones.",
    realidad: "El PDF original está en el archivo público de la CIA y puedes leerlo entero: es real como documento, con su análisis de ondas cerebrales Hemi-Sync. Lo que NO es real: sus conclusiones místicas. La CIA evaluó una técnica; internet escribió el resto de la historia.",
    url: "https://www.cia.gov/readingroom/docs/CIA-RDP96-00788R001900760001-9.pdf",
    fuente: "CIA Reading Room · Documento GATEWAY (PDF)",
  },
  {
    id: "t-cointelpro",
    titulo: "COINTELPRO: el FBI contra sus propios ciudadanos",
    veredicto: "REAL",
    rareza: "EPICO",
    origen: "1956-1971, el FBI de Hoover. Sobrevivió porque un grupo activista asaltó una oficina en Media (Pensilvania) y robó 1.000 documentos que envió a la prensa.",
    creencia: "Que el FBI espió, infiltró y destruyó movimientos civiles dentro de EE.UU. usando cartas falsas, delatores y acoso coordinado.",
    realidad: "Confirmado hasta la saciedad: el propio FBI reconoce el programa y el Senado (comité Church) documentó cartas anónimas diseñadas para romper matrimonios y provocar despidos. Las bóvedas FBI están públicas: lee las cartas falsas con tu propia firma.",
    url: "https://vault.fbi.gov/cointelpro",
    fuente: "FBI Vault · Bóveda COINTELPRO",
  },
  {
    id: "t-venona",
    titulo: "VENONA: 3.500 espías atrapados en mensajes rotos",
    veredicto: "REAL",
    rareza: "LEGENDARIO",
    origen: "1943-1980. La NSA descifró en secreto miles de cables soviéticos y lo mantuvo en secreto durante DÉCADAS — ni siquiera el presidente estaba al tanto del alcance.",
    creencia: "Que la Guerra Fría fue un nido de espías dobles en los laboratorios atómicos y el Departamento de Estado.",
    realidad: "Verdadero y demostrado por cables: los mensajes descifrados identificaron a los filtradores de secretos atómicos y a espías en la SSRAN y EE.UU. La NSA desclasificó los cables VENONA completos en 1995. La espía en tu cabeza siempre fue peor que la ficción.",
    url: "https://www.nsa.gov/News-Features/Declassified-VENONA/",
    fuente: "NSA · VENONA desclasificado",
  },
];

// ============ COLECCIÓN 2: ARMAS — IDEAS QUE CREARON MONSTRUOS (11) ============
export const ARMAS: ArmaOscura[] = [
  {
    id: "a-arco",
    titulo: "EL ARCO COMPUESTO: la primera arma de precisión",
    epoca: "~3000 a.C., estepas de Asia",
    idea: "Doblar madera, cuerno y tendón en capas: guardar energía muscular en un objeto del tamaño de un brazo.",
    legado: "Un arquero a caballo pudo tumbar imperios enteros antes de que el enemigo cerrara distancia. Los mongoles conquistaron el mayor imperio terrestre de la historia con esta idea.",
    url: "https://airandspace.si.edu",
    fuente: "Smithsonian · Air & Space",
  },
  {
    id: "a-falange",
    titulo: "LA FALANGE: cuando el orden mata al caos",
    epoca: "Siglo VII a.C., Grecia",
    idea: "Convertir individuos en UNA sola máquina: lanzas de 6 metros, escudos que se solapan, avanzar como un muro.",
    legado: "Demostró que la disciplina vale más que el valor. Alejo de Macedonia la mejoró con caballería y aterrorizó dos continentes hasta Roma.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "a-polvora",
    titulo: "LA PÓLVORA: el accidente que acabó con los castillos",
    epoca: "Siglo IX, China",
    idea: "Alquimistas chinos buscaban el elixir de la inmortalidad… y mezclaron salitre, azufre y carbón.",
    legado: "La búsqueda de vida eterna produjo el instrumento de muerte masiva. Murallas de 10 metros, invencibles durante 3.000 años, se volvieron inútiles en 50.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "a-enigma",
    titulo: "ENIGMA: la máquina que hablaba sola",
    epoca: "1932-1945, Alemania",
    idea: "Rotores eléctricos que cambiaban el alfabeto cada pulsación: 158 quintillones de claves posibles al día.",
    legado: "Quebrar su código en Bletchley Park (Alan Turing) acortó la guerra años y fundió la informática moderna. Tu teléfono existe por una máquina de descifrar la muerte.",
    url: "https://airandspace.si.edu",
    fuente: "Smithsonian · Air & Space",
  },
  {
    id: "a-v2",
    titulo: "EL V-2: el primer objeto humano en el espacio",
    epoca: "1944, Peenemünde",
    idea: "Un cohete de 12 toneladas con guía inercial que caía más rápido que el sonido: no había sirena posible.",
    legado: "Disparado a Londres sin poder ser frenado. Sus ingenieros acabaron en la NASA (Paperclip): el mismo cohete que aterrorizó a Europa puso al hombre en la Luna 25 años después.",
    url: "https://www.archives.gov/research/military",
    fuente: "NARA · Registros militares",
  },
  {
    id: "a-atomica",
    titulo: "LA BOMBA ATÓMICA: la energía de las estrellas en una ciudad",
    epoca: "1942-1945, Proyecto Manhattan",
    idea: "Quebrar el núcleo del átomo (fisión) libera la fuerza que mantiene unida la materia.",
    legado: "6 de agosto de 1945: una sola arma vaporizó una ciudad. Desde entonces, el mundo vive bajo 12.000 armas en alerta y una bóveda de archivos que documenta cuántas veces estuvimos a minutos del fin.",
    url: "https://nsarchive.gmu.edu",
    fuente: "National Security Archive",
  },
  {
    id: "a-gps",
    titulo: "EL GPS: una red militar que te guía",
    epoca: "1978-1995, EE.UU.",
    idea: "24 satélites con relojes atómicos: si conoces el retraso de la señal de 4 de ellos, sabes DÓNDE estás al centímetro.",
    legado: "Nació para apuntar misiles. Hoy decide tu ruta, tu comida a domicilio y tu banca. Un arma que se convirtió en sistema nervioso del planeta — y que el ejército puede degradar en guerra.",
    url: "https://airandspace.si.edu",
    fuente: "Smithsonian · Air & Space",
  },
  {
    id: "a-dron",
    titulo: "EL DRON: la guerra convertida en pantalla",
    epoca: "1995-hoy",
    idea: "Separar el pilotaje del peligro: matar desde otro continente vía satélite, con retraso de 2 segundos.",
    legado: "Cambiaron la guerra y la ética: operadores vuelven a casa a cenar tras una misión. En Vanguard los pilotas tú mismo en DRON DE GUERRA… aquí, sin consecuencias reales.",
    url: "https://www.archives.gov/research/foreign-policy",
    fuente: "NARA · Política exterior",
  },
  {
    id: "a-radar",
    titulo: "EL RADAR: los ojos que vieron venir la noche",
    epoca: "1935-1940, Reino Unido",
    idea: "Un pulso de radio rebota en el metal: midiendo el eco sabes dónde está el enemigo antes de verlo, de noche, entre nubes.",
    legado: "La Batalla de Bretaña se ganó con torres, no con aviones: una red de 21 estaciones detectaba la Luftwaffe a 160 km. Desde entonces TODA guerra moderna es una guerra de sensores — y tu coche y tu microondas usan la misma idea.",
    url: "https://airandspace.si.edu",
    fuente: "Smithsonian · Air & Space",
  },
  {
    id: "a-tanque",
    titulo: "EL TANQUE: un acorazado que aprendió a caminar",
    epoca: "1916, Somme (Primera Guerra Mundial)",
    idea: "Poner un barco de guerra sobre orugas: blindaje, cañones y un motor que avanza sobre alambre de espino y trincheras.",
    legado: "Los primeros modelos eran tan lentos que la infantería los superaba caminando — y aun así aterrorizaron a Alemania. En 1940 ya dictaban el mapa entero: la Blitzkrieg fue la idea del tanque corriendo a 40 km/h.",
    url: "https://www.worldhistory.org/Tank/",
    fuente: "World History Encyclopedia",
  },
  {
    id: "a-fuego-griego",
    titulo: "EL FUEGO GRIEGO: el arma secreta que se quemaba en el agua",
    epoca: "Siglo VII d.C., Bizancio",
    idea: "Un líquido que arde incluso sobre el mar, lanzado a presión desde proas de bronce como un dragón escupiendo fuego.",
    legado: "Salvó Constantinopla de dos asedios navales colosales. Su fórmula era secreto de Estado ABSOLUTO — se perdió para siempre cuando el imperio cayó. 1.500 años después, nadie sabe exactamente qué llevaba.",
    url: "https://www.worldhistory.org/Greek_Fire/",
    fuente: "World History Encyclopedia",
  },
];

// ============ COLECCIÓN 3: CIVILIZACIONES PERDIDAS (10) ============
export const CIVILIZACIONES: CivilizacionOscura[] = [
  {
    id: "c-sumeria",
    titulo: "SUMERIA: los primeros que lo escribieron todo",
    epoca: "4500-1900 a.C., Mesopotamia",
    que: "Inventaron la escritura (cuneiforme), la rueda, las ciudades, la escuela, la cerveza y el primer código legal escrito.",
    misterio: "Su capital, Ur, quedó enterrada por las arenas durante 2.000 años. Sus tablillas contienen el EPIC de Gilgamesh… con un diluvio que destruye el mundo siglos antes del relato bíblico.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-indus",
    titulo: "EL VALLE DEL INDUS: la civilización sin rostro",
    epoca: "3300-1300 a.C., Pakistán/India",
    que: "5 millones de personas en ciudades con alcantarillado perfecto, estandarización de pesos… y paz: casi cero armas encontradas.",
    misterio: "Su escritura NO ha podido ser descifrada en 100 años. Nadie sabe cómo se llamaban, quién gobernaba ni qué idioma hablaban. Toda una civilización muda para siempre.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-tartessos",
    titulo: "TARTESSOS: la Atlántida española",
    epoca: "Siglo IX-VI a.C., Andalucía",
    que: "Reino de minas de plata y oro en el suroeste de Iberia que fascinó a griegos y fenicios. Heródoto lo describió con el rey Argantonio que vivió 120 años.",
    misterio: "Desapareció de los mapas en un siglo, sin guerra documentada. Aristóteles ya lo llamaba «ciudad perdida»; los buscadores lo persiguen desde entonces bajo el Guadalquivir.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-minoica",
    titulo: "MINOICA: el laberinto del Minotauro era real",
    epoca: "3000-1450 a.C., Creta",
    que: "La primera potencia naval europea: palacios de 1.300 habitaciones (Cnossos), frescos de delfines, mujeres sacerdotisas con estatus alto.",
    misterio: "La erupción de Santorini (4× la de Krakatoa) la quebró; luego invasores micénicos acabaron el resto. El mito del Minotauro en el laberinto es la memoria de aquel palacio-enigma.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-nabateos",
    titulo: "NABATEA: Petra, la ciudad tallada en roca",
    epoca: "Siglo IV a.C.-106 d.C., Jordania",
    que: "Caravanas de incienso que hicieron rico al desierto. En piedra sin agua construyeron un oasis con presas, cisternas y canales de precisión milimétrica.",
    misterio: "Roma la absorbió y el comercio la abandonó; los terremotos sellaron sus puertas. Occidente la olvidó 700 años: solo los beduinos sabían que existía hasta 1812.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-khmer",
    titulo: "KHMER: Angkor, la ciudad-planetaria",
    epoca: "802-1431 d.C., Camboya",
    que: "Angkor Wat, el edificio religioso más grande del planeta, alineado con el solsticio; un sistema hidráulico de 1.000 km² que alimentó a un millón de personas.",
    misterio: "Colapsó en décadas: sequías megacíclicas y las canales se taponaron. Los árboles se comieron los templos y Europa no la creyó hasta el siglo XIX.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-mali",
    titulo: "MALI: el hombre más rico de la historia",
    epoca: "1235-1600 d.C., África Occidental",
    que: "Mansá Musa infló la economía de El Cairo solo de pasar de compras: repartió TANTO oro que lo devaluó 12 años. Su biblioteca de Tombuctú guardaba manuscritos de astrofísica medieval.",
    misterio: "Tombuctú, leyenda de riquezas, terminó saqueada y sus libros enterrados en arena por familias que aún hoy los ocultan. La biblioteca más preciada del mundo cabe en cajas de madera.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-rapanui",
    titulo: "RAPA NUI: la isla que se quedó sola",
    epoca: "1200-1722 d.C., Pacífico",
    que: "850 moáis de hasta 82 toneladas «caminados» por islas sin árboles ni ruedas, con una escritura (rongorongo) aún sin descifrar.",
    misterio: "El aislamiento extremo del planeta: 2.000 km al vecino más cercano. Cuando llegó el primer barco, los moáis ya estaban derribados y la población diezmada. ¿Colapso ecológico, esclavitud, enfermedad? El debate sigue ardiendo.",
    url: "https://www.worldhistory.org",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-gobekli",
    titulo: "GOBEKLI TEPE: el templo más antiguo lo enterraron a propósito",
    epoca: "~9500-8000 a.C., Turquía",
    que: "Pilares de 16 toneladas con serpientes, zorros y escorpiones tallados — levantados por CAZADORES pre-agrícolas, 7.000 años antes que las pirámides.",
    misterio: "Rompió la teoría oficial: la religión pudo nacer ANTES que la agricultura, no al revés. Y lo más inquietante: sus propios constructores lo enterraron todo con cuidado, montículo por montículo. Nadie sabe por qué.",
    url: "https://www.worldhistory.org/Gobekli_Tepe/",
    fuente: "World History Encyclopedia",
  },
  {
    id: "c-etruscos",
    titulo: "ETRUSCOS: el pueblo que enseñó a Roma y fue borrado",
    epoca: "Siglo VIII-III a.C., Toscana",
    que: "Dominaron Italia antes de Roma: ciudades con planificación ortogonal, arte funerario refinado, mujeres con estatus propio y drenaje que aún funciona.",
    misterio: "Roma los absorbió, copió su ejército, su arquitectura y hasta sus gladiadores… y luego borró su historia. Su idioma sigue sin descifrarse por completo: solo sabemos leer unas 200 palabras. El maestro enterrado bajo su alumno.",
    url: "https://www.worldhistory.org/Etruscan/",
    fuente: "World History Encyclopedia",
  },
];

// ====== v60.0 COLECCIÓN 4: SALA DE DOCUMENTOS (8) ======
// Enlaces directos a bóvedas y PDFs desclasificados reales. Nada de resúmenes:
// aquí se lee el documento original, con sus sellos y su miedo en bruto.
export interface DocumentoOscura {
  id: string;
  titulo: string;
  tag: string;    // tipo de material
  desc: string;   // qué contiene y por qué aterrora
  url: string;
  fuente: string;
}

export const DOCS: DocumentoOscura[] = [
  {
    id: "d-gateway",
    titulo: "ANÁLISIS Y EVALUACIÓN DEL GATEWAY EXPERIENCE",
    tag: "PDF · CIA · 1983",
    desc: "El documento completo que la CIA dedicó a estudiar si la conciencia puede salir del cuerpo. Tinta, sellos y física cuántica aplicada al alma — leído por agentes, guardado 20 años y ahora en tu pantalla.",
    url: "https://www.cia.gov/readingroom/docs/CIA-RDP96-00788R001900760001-9.pdf",
    fuente: "CIA Reading Room",
  },
  {
    id: "d-pdb",
    titulo: "PDB: los informes diarios que vio Kennedy",
    tag: "Bóveda · CIA · 1961-1969",
    desc: "El Presidente's Daily Brief real: qué sabía EE.UU. cada mañana durante la crisis de los misiles y Vietnam. Historia del mundo escrita en tiempo presente, con la tensión aún caliente en cada página.",
    url: "https://www.cia.gov/readingroom/collection/presidents-daily-brief-1961-1969",
    fuente: "CIA Reading Room",
  },
  {
    id: "d-stargate",
    titulo: "ARCHIVO STARGATE COMPLETO",
    tag: "Bóveda · CIA · 1970-1995",
    desc: "Miles de páginas de los psíquicos oficiales: sesiones de visión remota con coordenadas, dibujos de bases soviéticas hechos «con la mente» y la evaluación final que mató el programa.",
    url: "https://www.cia.gov/readingroom/collection/stargate",
    fuente: "CIA Reading Room",
  },
  {
    id: "d-ufo",
    titulo: "COLECCIÓN OVNI OFICIAL DE LA CIA",
    tag: "Bóveda · CIA · 1940-hoy",
    desc: "Los expedientes que explican medio siglo de avistamientos: pilotos militares reportando objetos, el U-2 cubierto por «platillos» y fotografías que el propio gobierno analizó con seriedad inquietante.",
    url: "https://www.cia.gov/readingroom/collection/ufo-collection",
    fuente: "CIA Reading Room",
  },
  {
    id: "d-german",
    titulo: "INTELIGENCIA EXTRANJERA ALEMANA: la red Gehlen",
    tag: "Bóveda · CIA · 1945-hoy",
    desc: "Cómo EE.UU. reconstruyó el servicio secreto alemán con material humano del Tercer Reich. La Guerra Fría vista desde el archivo: todos los compromisos, ninguno inventado.",
    url: "https://www.cia.gov/readingroom/collection/german-foreign-intelligence",
    fuente: "CIA Reading Room",
  },
  {
    id: "d-escritura",
    titulo: "SECRET WRITING: la ciencia de escribir invisible",
    tag: "Bóveda · CIA · 1917-hoy",
    desc: "Tintas simpáticas, mensajes bajo sellos postales y química del espionaje: los manuales reales para esconder un secreto a plena vista. Manual de paranoico hecho por profesionales.",
    url: "https://www.cia.gov/readingroom/collection/secret-writing",
    fuente: "CIA Reading Room",
  },
  {
    id: "d-coldwar",
    titulo: "ERA DE GUERRA FRÍA: la bóveda del borde del abismo",
    tag: "Bóveda · CIA · 1945-1991",
    desc: "Crisis de misiles, teléfonos rojos, golpes y espías: la colección de documentos que muestra cuántas veces el mundo estuvo a UNA decisión del fin. Escalofrío documental garantizado.",
    url: "https://www.cia.gov/readingroom/collection/cold-war-era",
    fuente: "CIA Reading Room",
  },
  {
    id: "d-nuclear",
    titulo: "BÓVEDA NUCLEAR: los minutos que faltaron para el fin",
    tag: "Bóveda · NSArchive · 1945-hoy",
    desc: "Documentos desclasificados sobre accidentes nucleares, falsas alarmas y oficiales que desobedecieron órdenes — probablemente salvando el mundo sin que nadie se enterara. El archivo más escalofriante que existe.",
    url: "https://nsarchive.gmu.edu",
    fuente: "National Security Archive",
  },
];
