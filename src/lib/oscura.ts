"use client";

// v59.0 ALEJANDRÍA OSCURA — LA BIBLIOTECA DE ALEJANDRÍA GEOPOLÍTICA
// v60.0 CONOCIMIENTO PROHIBIDO — ampliación: 26 → 43 entradas en 4 colecciones
// (+STARGATE, +GATEWAY, +COINTELPRO, +VENONA, +RADAR, +TANQUE, +FUEGO GRIEGO,
// +GÖBEKLI TEPE, +ETRUSCOS) y nueva colección SALA DE DOCUMENTOS: enlaces
// directos a los archivos desclasificados reales (PDFs y bóvedas de la CIA,
// NARA y el National Security Archive). + QUIZ DE ALEJANDRÍA con XP.
// v61.0 ERUDITOS DEL ABISMO — banco de quiz 24 → 49 preguntas, RACHA DEL
// EXAMEN (días consecutivos con hitos pagados) e INTERROGATORIO: contrarreloj
// de 60 segundos contra TODO el banco con récord personal guardado.
// Regla de oro: cada teoría lleva veredicto MITO / REAL / PARCIAL y fuente
// real desclasificada. Nada inventado: el miedo real está en los documentos.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

// ====== PROGRESO Y RANGOS ======
export const OSCURA_TOTAL = TEORIAS.length + ARMAS.length + CIVILIZACIONES.length + DOCS.length; // 43

export interface OscuraMilestone {
  at: number;
  coins: number;
  gems: number;
  xp: number;
  label: string;
}

export const OSCURA_MILESTONES: OscuraMilestone[] = [
  { at: 5, coins: 150, gems: 2, xp: 60, label: "LECTOR DE SOMBRAS: 5 entradas absorbidas" },
  { at: 15, coins: 450, gems: 6, xp: 180, label: "ANALISTA DEL ABISMO: 15 entradas" },
  { at: 28, coins: 900, gems: 12, xp: 300, label: "GUARDIÁN DEL ARCHIVO: 28 entradas" },
  { at: 40, coins: 1400, gems: 18, xp: 400, label: "ERUDITO PROHIBIDO: 40 entradas" },
  { at: OSCURA_TOTAL, coins: 2000, gems: 25, xp: 500, label: "ALEJANDRÍA COMPLETA: lo sabes TODO" },
];

const RANKS_OSCURA: { at: number; name: string }[] = [
  { at: 0, name: "RECLUTA OSCURO" },
  { at: 2, name: "LECTOR DE SOMBRAS" },
  { at: 6, name: "ANALISTA DEL ABISMO" },
  { at: 12, name: "ARCHIVISTA DE ALEJANDRÍA" },
  { at: 20, name: "GUARDIÁN DEL ARCHIVO" },
  { at: 30, name: "ERUDITO PROHIBIDO" },
  { at: OSCURA_TOTAL, name: "OJO QUE TODO LO LEE" },
];

export function oscuraRank(reads: number): string {
  let rank = RANKS_OSCURA[0].name;
  for (const r of RANKS_OSCURA) if (reads >= r.at) rank = r.name;
  return rank;
}

export function nextOscuraRankAt(reads: number): { rank: string; at: number } | null {
  for (const r of RANKS_OSCURA) if (reads < r.at) return { rank: r.name, at: r.at };
  return null;
}

// Entrada destacada del día (x1.5 botín) — seed UTC estable
export function entradaDelDia(): { titulo: string; coleccion: string; id: string } {
  const day = Math.floor(Date.now() / 86400000);
  const pool = [
    ...TEORIAS.map((t) => ({ id: t.id, titulo: t.titulo, coleccion: "TEORÍAS" })),
    ...ARMAS.map((a) => ({ id: a.id, titulo: a.titulo, coleccion: "ARMAS" })),
    ...CIVILIZACIONES.map((c) => ({ id: c.id, titulo: c.titulo, coleccion: "CIVILIZACIONES" })),
    ...DOCS.map((d) => ({ id: d.id, titulo: d.titulo, coleccion: "DOCUMENTOS" })),
  ];
  return pool[day % pool.length];
}

export function isEntradaDelDia(id: string): boolean {
  return entradaDelDia().id === id;
}

export function lecturaOscuraReward(isDaily: boolean): { coins: number; xp: number } {
  const base = { coins: 12, xp: 8 };
  return isDaily
    ? { coins: Math.round(base.coins * 1.5), xp: Math.round(base.xp * 1.5) }
    : base;
}

// ====== v60.0 QUIZ DE ALEJANDRÍA (ampliado en v61.0) ======
// 49 preguntas extraídas de las propias entradas de la biblioteca.
// Cada día el archivo elige 6 (determinista por seed UTC). Acierto = botín
// que viaja a TEMPORADA/SEMANA por el espejo XP global. Completar el set
// diario libera el BOTÍN DEL DÍA y mantiene la RACHA DEL EXAMEN (hitos en
// 3/7/14/30 días consecutivos). Solo se paga la primera vez por pregunta
// y por día: el conocimiento no se cobra dos veces.
// v61.0 INTERROGATORIO: contrarreloj de 60 s contra TODO el banco —
// recompensa menor por acierto, récord personal guardado para siempre.

export interface QuizQuestion {
  id: string;
  q: string;
  opts: [string, string, string];
  correct: 0 | 1 | 2;
}

export const QUIZ_BANK: QuizQuestion[] = [
  { id: "q-rept-veredicto", q: "Según la biblioteca, ¿qué veredicto tiene la tarjeta REPTILIANOS?", opts: ["MITO — nunca existió una sola foto real", "REAL — hay evidencia oficial", "PARCIAL — sigue en estudio"], correct: 0 },
  { id: "q-rept-icke", q: "¿Quién relanzó el mito reptiliano en 1998 ante miles de personas?", opts: ["Erich von Däniken", "David Icke", "Zecharia Sitchin"], correct: 1 },
  { id: "q-u2", q: "¿Qué avión espía explicó miles de avistamientos OVNI de los años 50?", opts: ["El SR-71", "El B-2 Spirit", "El U-2"], correct: 2 },
  { id: "q-mkultra-pct", q: "MK-ULTRA: ¿qué porcentaje de archivos destruyó el director Helms en 1973?", opts: ["~90%", "~50%", "~25%"], correct: 0 },
  { id: "q-mkultra-church", q: "¿Qué comité del Senado de EE.UU. confirmó MK-ULTRA en 1975?", opts: ["Comité McCarthy", "Comité Church", "Comité Warren"], correct: 1 },
  { id: "q-paperclip-n", q: "Operación Paperclip: ¿cuántos científicos alemanes llegó a EE.UU.?", opts: ["~160", "~1.600", "~16.000"], correct: 1 },
  { id: "q-vonbraun", q: "¿Qué científico de Paperclip era oficial de las SS y acabó llevando al hombre a la Luna?", opts: ["Wernher von Braun", "Kurt Blome", "Hubertus Strughold"], correct: 0 },
  { id: "q-area51-year", q: "¿En qué año desclasificó el Gobierno de EE.UU. la existencia del Área 51?", opts: ["1991", "2001", "2013"], correct: 2 },
  { id: "q-haarp-antenas", q: "HAARP: ¿cuántas antenas de 22 metros hay en Alaska?", opts: ["18", "180", "1.800"], correct: 1 },
  { id: "q-bermudas-quien", q: "¿Qué agencia cerró científicamente el mito del Triángulo de las Bermudas?", opts: ["La NASA", "La NOAA", "La ESA"], correct: 1 },
  { id: "q-nwo-quien", q: "¿Quién pronunció el discurso del «Nuevo Orden Mundial» en 1990?", opts: ["Ronald Reagan", "George H. W. Bush", "Mijaíl Gorbachov"], correct: 1 },
  { id: "q-svalbard", q: "¿Qué guarda la bóveda de Svalbard (Ártico)?", opts: ["Más de 1,2 millones de semillas", "Oro del FMI", "Servidores de la NSA"], correct: 0 },
  { id: "q-northwoods", q: "¿Qué proponía el plan Northwoods (rechazado)?", opts: ["Atentados falsos como pretexto para invadir Cuba", "Invadir México", "Bombardear Vietnam"], correct: 0 },
  { id: "q-uap-veredicto", q: "¿Qué dijo oficialmente el Pentágono sobre los videos UAP filtrados?", opts: ["Que son falsificaciones", "Que son auténticos y «no sabemos qué son»", "Que son drones chinos"], correct: 1 },
  { id: "q-stargate-coste", q: "Proyecto STARGATE: ¿cuánto gastó el gobierno en psíquicos?", opts: ["~2 millones $", "~22 millones $", "~2.200 millones $"], correct: 1 },
  { id: "q-stargate-cierre", q: "¿Por qué se cerró el proyecto STARGATE en 1995?", opts: ["Filtración a la prensa", "Nunca produjo inteligencia utilizable", "Falta de presupuesto militar"], correct: 1 },
  { id: "q-polvora-elixir", q: "La pólvora nació cuando alquimistas chinos buscaban…", opts: ["el elixir de la inmortalidad", "pintura impermeable", "medicina para caballos"], correct: 0 },
  { id: "q-enigma-turing", q: "¿Quién quebró el código Enigma en Bletchley Park?", opts: ["Alan Turing", "Claude Shannon", "John von Neumann"], correct: 0 },
  { id: "q-v2-ciudad", q: "El V-2 caía más rápido que el sonido: no había sirena posible. ¿Qué ciudad sufrió sus impactos?", opts: ["París", "Londres", "Moscú"], correct: 1 },
  { id: "q-gps-origen", q: "El GPS nació militar para…", opts: ["apuntar misiles", "guiar barcos mercantes", "mapas turísticos"], correct: 0 },
  { id: "q-falange-clave", q: "La falange griega demostró que vale más que el valor individual…", opts: ["la disciplina", "la caballería", "la numería"], correct: 0 },
  { id: "q-indus-escritura", q: "Del Valle del Indus NO se ha podido descifrar en 100 años…", opts: ["su escritura", "su calendario", "su moneda"], correct: 0 },
  { id: "q-mali-oro", q: "Mansá Musa devaluó el oro de una ciudad al gastar: ¿cuál?", opts: ["Tombuctú", "El Cairo", "Fez"], correct: 1 },
  { id: "q-rapanui-escritura", q: "¿Cómo se llama la escritura aún sin descifrar de Rapa Nui?", opts: ["rongorongo", "cuneiforme", "lineal A"], correct: 0 },
  // v61.0 ERUDITOS DEL ABISMO — segunda hornada: 25 preguntas más (banco 49)
  { id: "q-venona-agencia", q: "VENONA: ¿qué agencia descifró en secreto miles de cables soviéticos?", opts: ["La NSA", "El FBI", "La KGB"], correct: 0 },
  { id: "q-venona-anio", q: "¿En qué año desclasificó la NSA los cables VENONA completos?", opts: ["1975", "1995", "2013"], correct: 1 },
  { id: "q-cointelpro-robo", q: "¿Cómo se destapó COINTELPRO ante la prensa?", opts: ["Una filtración del Senado", "Un grupo activista robó 1.000 documentos en Media (Pensilvania)", "Una confesión de Hoover"], correct: 1 },
  { id: "q-cointelpro-hoover", q: "¿Qué director del FBI dirigió COINTELPRO de 1956 a 1971?", opts: ["J. Edgar Hoover", "Allen Dulles", "William Casey"], correct: 0 },
  { id: "q-gateway-anio", q: "¿De qué año es el informe GATEWAY que la CIA archivó?", opts: ["1963", "1983", "1999"], correct: 1 },
  { id: "q-stargate-lugar", q: "Los psíquicos de STARGATE tuvieron laboratorios en…", opts: ["Stanford y Fort Meade", "West Point y Langley", "MIT y Los Álamos"], correct: 0 },
  { id: "q-stargate-veredicto", q: "¿Qué concluyó la evaluación final de 1995 sobre STARGATE?", opts: ["Que funcionaba al 80%", "Que nunca produjo inteligencia utilizable", "Que había que ampliarlo"], correct: 1 },
  { id: "q-radar-batalla", q: "¿Qué batalla se ganó con torres de radar y no con aviones?", opts: ["Midway", "La Batalla de Bretaña", "El Alamein"], correct: 1 },
  { id: "q-radar-estaciones", q: "¿Cuántas estaciones de radar detectaban la Luftwaffe a 160 km?", opts: ["5", "21", "120"], correct: 1 },
  { id: "q-tanque-debut", q: "¿En qué batalla debutó el tanque en 1916?", opts: ["Verdún", "El Somme", "Gallípoli"], correct: 1 },
  { id: "q-fuego-agua", q: "¿Qué hacía de aterradora al fuego griego?", opts: ["Arde incluso sobre el mar", "Explota bajo la arena", "Convierte en piedra"], correct: 0 },
  { id: "q-fuego-perdido", q: "¿Qué pasó con la fórmula del fuego griego?", opts: ["La heredó Venecia", "Se perdió para siempre", "Napoleón la recuperó"], correct: 1 },
  { id: "q-gobekli-piramides", q: "GÖBEKLI TEPE es 7.000 años más antiguo que…", opts: ["las pirámides", "Stonehenge", "la Gran Muralla"], correct: 0 },
  { id: "q-gobekli-entierro", q: "¿Qué hicieron sus constructores con GÖBEKLI TEPE?", opts: ["Lo vendieron a Roma", "Lo enterraron todo con cuidado, nadie sabe por qué", "Lo dejaron caer en ruinas"], correct: 1 },
  { id: "q-etruscos-palabras", q: "Del idioma etrusco solo sabemos leer unas…", opts: ["20 palabras", "200 palabras", "2.000 palabras"], correct: 1 },
  { id: "q-tartessos-rio", q: "¿Bajo qué río se busca a Tartessos desde hace siglos?", opts: ["El Tajo", "El Ebro", "El Guadalquivir"], correct: 2 },
  { id: "q-minoica-volcan", q: "¿Qué erupción quebró la civilización minoica?", opts: ["El Vesubio", "Santorini (4× Krakatoa)", "El Krakatoa"], correct: 1 },
  { id: "q-nabateos-anio", q: "¿En qué año redescubrió Occidente Petra?", opts: ["1666", "1812", "1912"], correct: 1 },
  { id: "q-khmer-hidra", q: "¿Cuántos km² regaba el sistema hidráulico de Angkor?", opts: ["100", "1.000", "10.000"], correct: 1 },
  { id: "q-indus-armas", q: "¿Qué es rarísimo en las ciudades del Valle del Indus?", opts: ["Casi cero armas encontradas", "Sin alcantarillado", "Sin edificios"], correct: 0 },
  { id: "q-sumeria-gilgamesh", q: "Las tablillas de Ur contienen un diluvio anterior al bíblico en la epopeya de…", opts: ["Gilgamesh", "Hammurabi", "Nabucodonosor"], correct: 0 },
  { id: "q-enigma-claves", q: "¿Cuántas claves posibles al día tenía la máquina Enigma?", opts: ["158 quintillones", "158 millones", "1.58 billones"], correct: 0 },
  { id: "q-gps-satelites", q: "El GPS militar original usaba 24 satélites con…", opts: ["relojes atómicos", "espejos solares", "cámaras espía"], correct: 0 },
  { id: "q-atomic-alerta", q: "¿Cuántas armas nucleares siguen en alerta hoy según la biblioteca?", opts: ["~1.200", "~12.000", "~120.000"], correct: 1 },
  { id: "q-pdb-que", q: "¿Qué era el PDB que Kennedy leía cada mañana?", opts: ["El informe diario de inteligencia del presidente", "La agenda diplomática", "El boletín de bolsa"], correct: 0 },
];

export const QUIZ_PER_DAY = 6;
export const QUIZ_REWARD = { coins: 10, xp: 6 };           // por acierto
export const QUIZ_DAILY_BONUS = { coins: 50, gems: 2, xp: 30 }; // set completo

// v61.0 RACHA DEL EXAMEN: días consecutivos completando el set. Al cobrar el
// botín del día, si ayer también se cobró, la racha crece; si no, vuelve a 1.
export interface QuizStreakMilestone { at: number; coins: number; gems: number; xp: number }
export const QUIZ_STREAK_MILESTONES: QuizStreakMilestone[] = [
  { at: 3,  coins: 100,  gems: 1,  xp: 50 },
  { at: 7,  coins: 250,  gems: 3,  xp: 120 },
  { at: 14, coins: 500,  gems: 5,  xp: 250 },
  { at: 30, coins: 1500, gems: 15, xp: 600 },
];

// v61.0 INTERROGATORIO: contrarreloj contra el banco completo.
export const INTERRO_SECONDS = 60;
export const INTERRO_REWARD = { coins: 8, xp: 5 }; // por acierto (menor que el set diario)

export function dayKeyUtc(d = new Date()): string {
  return d.toISOString().slice(0, 10); // "2026-09-27"
}

// Set diario determinista: 6 preguntas distintas cada día (seed UTC estable)
export function quizSetOfDay(): QuizQuestion[] {
  const day = Math.floor(Date.now() / 86400000);
  const start = (day * 7) % QUIZ_BANK.length;
  const out: QuizQuestion[] = [];
  for (let i = 0; i < QUIZ_PER_DAY; i++) out.push(QUIZ_BANK[(start + i) % QUIZ_BANK.length]);
  return out;
}

// ====== STORE PERSISTENTE ======
interface OscuraState {
  readIds: string[];
  claimedMilestones: number[];
  // v60.0 QUIZ
  quizSolved: string[];       // aciertos históricos (ids de pregunta, nunca repetibles)
  quizDayKey: string;         // día del set actual
  quizSolvedToday: string[];  // aciertos del set de HOY
  quizBonusDay: string;       // día en que se cobró el botín del set completo
  // v61.0 racha + interrogatorio
  quizStreak: number;         // días consecutivos completando el examen
  quizLastClaim: string;      // último día UTC en que se cobró el botín
  bestInterrogatorio: number; // récord personal de aciertos en 60 s
  registerRead: (id: string) => boolean; // true si es nueva
  claimMilestone: (at: number) => boolean;
  solveQuiz: (id: string) => boolean;    // true si es nuevo acierto de HOY
  claimQuizBonus: () => { ok: boolean; streak: number; milestone: number }; // v61: paga y devuelve racha
  setBestInterrogatorio: (n: number) => boolean; // true si hay récord nuevo
  resetProgress: () => void;
}

export const useOscura = create<OscuraState>()(
  persist(
    (set, get) => ({
      readIds: [],
      claimedMilestones: [],
      quizSolved: [],
      quizDayKey: "",
      quizSolvedToday: [],
      quizBonusDay: "",
      quizStreak: 0,
      quizLastClaim: "",
      bestInterrogatorio: 0,

      registerRead: (id) => {
        if (get().readIds.includes(id)) return false;
        set({ readIds: [...get().readIds, id] });
        return true;
      },

      claimMilestone: (at) => {
        if (get().claimedMilestones.includes(at)) return false;
        set({ claimedMilestones: [...get().claimedMilestones, at] });
        return true;
      },

      // v60.0: marca un acierto del set diario. Si cambia el día UTC,
      // rota el set (quizSolvedToday se vacía). Devuelve true si el acierto
      // es NUEVO hoy (paga botín una sola vez por pregunta/día).
      solveQuiz: (id) => {
        const today = dayKeyUtc();
        if (get().quizDayKey !== today) {
          set({ quizDayKey: today, quizSolvedToday: [] });
        }
        if (get().quizSolvedToday.includes(id)) return false;
        set({
          quizSolvedToday: [...get().quizSolvedToday, id],
          quizSolved: get().quizSolved.includes(id)
            ? get().quizSolved
            : [...get().quizSolved, id],
        });
        return true;
      },

      // v60.0: botín por completar el set diario (idempotente por día UTC).
      // v61.0: además actualiza la RACHA (ayer cobrado → +1; si no → 1) y
      // devuelve el hito de racha alcanzado (3/7/14/30) para que el panel pague.
      claimQuizBonus: () => {
        const today = dayKeyUtc();
        const st = get();
        if (st.quizBonusDay === today) return { ok: false, streak: st.quizStreak, milestone: 0 };
        if (st.quizDayKey !== today || st.quizSolvedToday.length < QUIZ_PER_DAY)
          return { ok: false, streak: st.quizStreak, milestone: 0 };
        const yesterday = dayKeyUtc(new Date(Date.now() - 86400000));
        const streak = st.quizLastClaim === yesterday ? st.quizStreak + 1 : 1;
        const milestone = QUIZ_STREAK_MILESTONES.some((m) => m.at === streak) ? streak : 0;
        set({ quizBonusDay: today, quizStreak: streak, quizLastClaim: today });
        return { ok: true, streak, milestone };
      },

      // v61.0: récord personal del INTERROGATORIO (aciertos en 60 s)
      setBestInterrogatorio: (n) => {
        if (n <= get().bestInterrogatorio) return false;
        set({ bestInterrogatorio: n });
        return true;
      },

      resetProgress: () => set({ readIds: [], claimedMilestones: [], quizSolved: [], quizDayKey: "", quizSolvedToday: [], quizBonusDay: "", quizStreak: 0, quizLastClaim: "", bestInterrogatorio: 0 }),
    }),
    {
      name: "vg_oscura_v59",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
