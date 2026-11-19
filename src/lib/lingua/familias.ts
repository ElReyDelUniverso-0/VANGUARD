// ═══════════════════════════════════════════════════════════════════
// v420.0 VANGUARD LINGUA — fichas editoriales de las grandes familias.
// La estructura (ramas, lenguas, dialectos, coordenadas, estado) sale de
// Glottolog 5.4; aquí solo va lo que Glottolog no trae: nombre en
// español, protolengua, hipótesis de origen y relaciones históricas,
// redactado con la cautela que exige cada dato (las fechas de
// protolenguas son estimaciones y se presentan como tales) y con fuentes.
// ═══════════════════════════════════════════════════════════════════

export interface FuenteFamilia {
  titulo: string;
  url: string;
}

export interface FichaFamilia {
  id: string;
  /** nombre en español */
  es: string;
  protolengua?: string;
  /** estimación de antigüedad, siempre como rango o aproximación */
  antiguedad?: string;
  origen?: string;
  /** primeros testimonios escritos */
  testimonios?: string;
  /** párrafos de historia y relaciones */
  texto: string[];
  /** lenguas conocidas (glottocodes) para enlazar */
  destacadas: string[];
  fuentes: FuenteFamilia[];
}

const glotto = (id: string, nombre: string): FuenteFamilia => ({
  titulo: `Glottolog 5.4 · ${nombre}`,
  url: `https://glottolog.org/resource/languoid/id/${id}`,
});
const wiki = (titulo: string): FuenteFamilia => ({
  titulo: `Wikipedia en español · ${titulo}`,
  url: `https://es.wikipedia.org/wiki/${encodeURIComponent(titulo.replace(/ /g, "_"))}`,
});

/** nombres en español para las familias de primer nivel más citadas */
export const NOMBRES_FAMILIA_ES: Record<string, string> = {
  atla1278: "Atlántico-Congo",
  aust1307: "Austronesia",
  indo1319: "Indoeuropea",
  sino1245: "Sinotibetana",
  afro1255: "Afroasiática",
  nucl1709: "Trans-Nueva Guinea nuclear",
  pama1250: "Pama-ñungana",
  otom1299: "Otomangue",
  aust1305: "Austroasiática",
  taik1256: "Tai-kadai",
  drav1251: "Dravídica",
  araw1281: "Arahuaca",
  mand1469: "Mandé",
  tupi1275: "Tupí",
  utoa1244: "Yutoazteca",
  ural1272: "Urálica",
  turk1311: "Túrquica",
  quec1387: "Quechua",
  maya1287: "Maya",
  cari1283: "Caribe",
  japo1237: "Japónica",
  kore1284: "Coreánica",
  eski1264: "Esquimo-aleutiana",
  iroq1247: "Iroquesa",
  nakh1245: "Najo-daguestaní",
  kart1248: "Kartveliana",
  mong1349: "Mongólica-kitán",
  tung1282: "Tungúsica",
  cent2225: "Sudánica central",
  nilo1247: "Nilótica",
  khoe1240: "Khoe-kwadi",
  chib1249: "Chibcha",
  tuca1253: "Tucana",
  pano1259: "Pano-tacana",
  algi1248: "Álgica",
  ayma1253: "Aimara",
  mixe1284: "Mixe-zoque",
  toto1251: "Totonaca",
  jiva1245: "Chicham (jíbara)",
  nucl1710: "Macro-yê nuclear",
  sign1238: "Lenguas de señas",
  uncl1493: "Inclasificables",
  pidg1258: "Pidgins",
  unat1236: "No atestiguadas",
  arti1236: "Lenguas construidas",
  spee1234: "Registros de habla",
  mixe1287: "Lenguas mixtas",
  book1242: "Registros bibliográficos",
};

/** pseudofamilias de Glottolog: contenedores que NO son familias genealógicas */
export const PSEUDOFAMILIAS: Record<string, string> = {
  sign1238:
    "Glottolog agrupa aquí las lenguas de señas para poder catalogarlas, pero no forman una familia: cada una surge en su comunidad sorda y se relaciona con otras por historia escolar o contacto, no por descender de una lengua oral.",
  uncl1493: "Lenguas con tan pocos datos que no se pueden asignar a ninguna familia. No es un grupo genealógico.",
  pidg1258: "Lenguas de contacto sin hablantes nativos. Se agrupan por tipo, no por origen común.",
  unat1236: "Lenguas de las que consta la existencia (por nombres en crónicas o censos) pero sin datos lingüísticos conservados.",
  arti1236: "Lenguas diseñadas conscientemente, como el esperanto. No descienden de un antepasado común.",
  spee1234: "Registros especiales (rituales, de evitación, secretos) que Glottolog cataloga aparte de la lengua en que se basan.",
  mixe1287: "Lenguas nacidas de la fusión de dos lenguas (por ejemplo, el michif, con sustantivos franceses y verbos cree).",
};

export const AGRUPACIONES_PROPUESTAS: { nombre: string; nota: string; fuente: FuenteFamilia }[] = [
  {
    nombre: "Nigerocongolesa",
    nota: "Macrofamilia propuesta que uniría Atlántico-Congo con mandé, dogón, ijoide y otras. Su unidad no está demostrada; Glottolog trata Atlántico-Congo como familia de primer nivel.",
    fuente: wiki("Lenguas nigerocongolesas"),
  },
  {
    nombre: "Nilo-sahariana",
    nota: "Agrupación de Greenberg (1963) para lenguas del Sahel y el Nilo. Hoy se considera un conjunto de familias independientes (nilótica, sudánica central, sahariana…).",
    fuente: wiki("Lenguas nilo-saharianas"),
  },
  {
    nombre: "Altaica",
    nota: "Hipótesis que uniría las familias túrquica, mongólica y tungúsica (a veces también coreano y japonés). La mayoría de especialistas atribuye las semejanzas al contacto prolongado, no a un origen común.",
    fuente: wiki("Lenguas altaicas"),
  },
  {
    nombre: "Papúes",
    nota: "Etiqueta geográfica para las lenguas de Nueva Guinea y alrededores que no son austronesias. Reúne decenas de familias sin parentesco demostrado entre sí.",
    fuente: wiki("Lenguas papúes"),
  },
];

export const FICHAS_FAMILIA: FichaFamilia[] = [
  {
    id: "indo1319",
    es: "Indoeuropea",
    protolengua: "Protoindoeuropeo (reconstruido, sin testimonios escritos)",
    antiguedad: "Se suele situar entre el V y el III milenio a. C.; la fecha depende de la hipótesis de origen.",
    origen:
      "Dos hipótesis principales: las estepas pónticas y caspias (hipótesis de los kurganes, la más aceptada hoy, reforzada por estudios de ADN antiguo) y Anatolia, ligada a la expansión de la agricultura.",
    testimonios: "Textos hititas en tablillas cuneiformes del II milenio a. C.; poco después, griego micénico en lineal B y sánscrito védico de transmisión oral.",
    texto: [
      "La familia con más hablantes del mundo: el español, el inglés, el hindi, el bengalí, el ruso, el portugués y el persa descienden de una misma lengua prehistórica. El parentesco se hizo célebre en 1786, cuando William Jones señaló que el sánscrito, el griego y el latín compartían raíces y gramática demasiado parecidas para ser casualidad.",
      "Las ramas reconocidas son diez: anatolia (extinta, con el hitita), indoirania, griega, itálica (de donde salen las lenguas romances), germánica, armenia, tocaria (extinta, en el actual Xinjiang), celta, baltoeslava y albanesa. Glottolog organiza estas ramas en niveles intermedios que puedes recorrer en el árbol.",
      "La expansión colonial europea llevó al español, el inglés, el portugués y el francés a todos los continentes, y de su contacto con otras lenguas surgieron criollos como el haitiano o el papiamento, que Glottolog clasifica dentro de la familia de su lengua léxica.",
    ],
    destacadas: ["stan1288", "stan1293", "hind1269", "beng1280", "russ1263", "port1283", "stan1290", "west2369", "hait1244", "lati1261", "hitt1242", "anci1242"],
    fuentes: [
      { titulo: "Encyclopaedia Britannica · Indo-European languages", url: "https://www.britannica.com/topic/Indo-European-languages" },
      wiki("Lenguas indoeuropeas"),
      wiki("Hipótesis de los kurganes"),
      glotto("indo1319", "Indo-European"),
    ],
  },
  {
    id: "sino1245",
    es: "Sinotibetana",
    protolengua: "Protosinotibetano",
    antiguedad: "Estudios filogenéticos publicados en 2019 la sitúan hace aproximadamente entre 6.000 y 7.000 años.",
    origen: "Norte de China, en la cuenca del río Amarillo, según esos mismos estudios; otras propuestas apuntan al suroeste de China o al noreste de la India.",
    testimonios: "Inscripciones oraculares chinas sobre hueso y caparazón de la dinastía Shang (hacia 1250 a. C.).",
    texto: [
      "Reúne el chino en todas sus variedades (mandarín, cantonés, wu, min…), el tibetano, el birmano y cientos de lenguas del Himalaya y el sudeste asiático. La división clásica en dos ramas, sinítica y tibetobirmana, está hoy en discusión: muchos especialistas ven el chino como una rama más dentro de un abanico amplio.",
      "Muchas de sus lenguas son tonales y monosilábicas en su raíz, aunque esos rasgos también se encuentran en lenguas vecinas no emparentadas por contacto prolongado.",
    ],
    destacadas: ["mand1415", "yuec1235", "wuch1236", "tibe1272", "nucl1310", "minn1241"],
    fuentes: [wiki("Lenguas sinotibetanas"), glotto("sino1245", "Sino-Tibetan")],
  },
  {
    id: "afro1255",
    es: "Afroasiática",
    protolengua: "Protoafroasiático",
    antiguedad: "Probablemente más de diez mil años, en el límite de lo que el método comparativo puede reconstruir.",
    origen: "Discutido: noreste de África (Cuerno de África o Sahara oriental) o el Levante.",
    testimonios: "Egipcio (finales del IV milenio a. C.) y acadio (III milenio a. C.), entre los textos más antiguos de la humanidad.",
    texto: [
      "Abarca el norte de África, el Cuerno de África y Oriente Próximo. Sus ramas son la semítica (árabe, hebreo, amhárico, tigriña y el extinto acadio), la egipcia (extinta, con el copto como lengua litúrgica), la bereber, la chádica (hausa), la cusita (somalí, oromo) y la omótica, cuya pertenencia se discute.",
      "Comparten rasgos como raíces consonánticas o el género gramatical marcado con t. Las escrituras semíticas, del fenicio al hebreo y el árabe, salen de esta área.",
    ],
    destacadas: ["stan1318", "hebr1245", "amha1245", "haus1257", "soma1255", "egyp1246", "akka1240", "kaby1243"],
    fuentes: [wiki("Lenguas afroasiáticas"), glotto("afro1255", "Afro-Asiatic")],
  },
  {
    id: "atla1278",
    es: "Atlántico-Congo",
    protolengua: "Protoatlántico-congo",
    origen: "África occidental.",
    texto: [
      "La familia con más lenguas del mundo según Glottolog. Incluye el yoruba, el igbo, el fula, el wolof y, sobre todo, las lenguas bantúes: unas quinientas lenguas (suajili, zulú, xhosa, shona, lingala, kikuyu…) nacidas de la expansión bantú, que partió de la frontera entre Nigeria y Camerún hace unos 4.000 a 5.000 años y llegó al este y al sur del continente.",
      "A menudo se presenta dentro de una macrofamilia nigerocongolesa más amplia, junto al mandé y otras familias. Glottolog no la acepta como unidad demostrada y por eso Atlántico-Congo aparece aquí como familia de primer nivel.",
    ],
    destacadas: ["swah1253", "yoru1245", "nucl1417", "zulu1248", "xhos1239", "shon1251", "ling1263", "nucl1347"],
    fuentes: [wiki("Lenguas atlántico-congoleñas"), wiki("Expansión bantú"), glotto("atla1278", "Atlantic-Congo")],
  },
  {
    id: "aust1307",
    es: "Austronesia",
    protolengua: "Protoaustronesio",
    antiguedad: "Expansión iniciada hace unos 5.000 años.",
    origen: "Taiwán: allí se encuentran casi todas las ramas primarias (las lenguas formosanas); todas las demás forman la rama malayo-polinesia.",
    texto: [
      "Antes de la era colonial era la familia de mayor extensión geográfica: desde Madagascar, frente a África, hasta Rapa Nui (isla de Pascua), y desde Taiwán y Hawái hasta Nueva Zelanda. Ese recorrido es obra de navegantes que colonizaron islas remotas del Pacífico a lo largo de milenios.",
      "Incluye el malayo e indonesio, el javanés, el tagalo, el malgache, el maorí, el samoano y el hawaiano. Muchas lenguas del Pacífico tienen pocos miles de hablantes.",
    ],
    destacadas: ["indo1316", "stan1306", "java1254", "taga1270", "plat1254", "maor1246", "hawa1245", "samo1305"],
    fuentes: [wiki("Lenguas austronesias"), glotto("aust1307", "Austronesian")],
  },
  {
    id: "nucl1709",
    es: "Trans-Nueva Guinea nuclear",
    origen: "Tierras altas de Nueva Guinea.",
    texto: [
      "La mayor familia de Nueva Guinea, la isla con mayor densidad lingüística del planeta. La propuesta clásica «Trans-Nueva Guinea» era muy amplia; Glottolog reconoce un núcleo más estrecho, cuyas lenguas comparten pronombres y morfología verbal.",
      "La mayoría de sus lenguas tiene pocos miles de hablantes y documentación escasa: buena parte solo cuenta con listas de palabras o esbozos gramaticales.",
    ],
    destacadas: [],
    fuentes: [wiki("Lenguas trans-neoguineanas"), glotto("nucl1709", "Nuclear Trans New Guinea")],
  },
  {
    id: "pama1250",
    es: "Pama-ñungana",
    protolengua: "Protopama-ñungano",
    antiguedad: "Un estudio filogenético de 2018 sitúa su origen hace unos 6.000 años.",
    origen: "Norte de Australia, en el entorno del golfo de Carpentaria, según ese estudio.",
    texto: [
      "Ocupa cerca de nueve décimas partes del territorio australiano. Tras la colonización británica, la mayoría de sus lenguas dejó de transmitirse; muchas están extintas o casi extintas, aunque hay programas de revitalización.",
      "Del guugu yimithirr procede la palabra «canguro». El warlpiri y el pitjantjatjara siguen aprendiéndose en algunas comunidades.",
    ],
    destacadas: ["warl1254", "pitj1243", "gugu1255"],
    fuentes: [wiki("Lenguas pama-ñunganas"), glotto("pama1250", "Pama-Nyungan")],
  },
  {
    id: "otom1299",
    es: "Otomangue",
    origen: "Centro y sur de México.",
    texto: [
      "Familia mesoamericana de lenguas tonales: zapoteco, mixteco, otomí, mazahua, chinanteco, mazateco, triqui. Las variedades de zapoteco y mixteco forman cadenas de lenguas emparentadas, a menudo no inteligibles entre sí.",
      "El chorotega, hablado en Nicaragua y Costa Rica, es una rama extinta. La escritura zapoteca figura entre las más antiguas de Mesoamérica.",
    ],
    destacadas: [],
    fuentes: [wiki("Lenguas otomangues"), glotto("otom1299", "Otomanguean")],
  },
  {
    id: "aust1305",
    es: "Austroasiática",
    origen: "Discutido: sur de China o el sudeste asiático continental.",
    texto: [
      "Incluye el vietnamita y el jemer (camboyano), lenguas nacionales con larga tradición escrita, además del mon y de las lenguas munda de la India, como el santali. Su distribución fragmentada sugiere que otras familias (tai-kadai, sinotibetana, indoeuropea) ocuparon después parte de su territorio.",
    ],
    destacadas: ["viet1252", "cent1989", "sant1410", "monn1252"],
    fuentes: [wiki("Lenguas austroasiáticas"), glotto("aust1305", "Austroasiatic")],
  },
  {
    id: "taik1256",
    es: "Tai-kadai",
    origen: "Sur de China.",
    texto: [
      "También llamada kra-dai. Incluye el tailandés, el lao, el shan y el zhuang, la minoría más numerosa de China. Sus hablantes se desplazaron hacia el sur hace unos mil años y llegaron al actual territorio de Tailandia y Laos.",
    ],
    destacadas: ["thai1261", "laoo1244"],
    fuentes: [wiki("Lenguas tai-kadai"), glotto("taik1256", "Tai-Kadai")],
  },
  {
    id: "drav1251",
    es: "Dravídica",
    protolengua: "Protodravídico",
    origen: "Subcontinente indio.",
    testimonios: "Inscripciones en tamil-brahmi de los últimos siglos antes de nuestra era; la literatura tamil del Sangam tiene unos dos mil años.",
    texto: [
      "Predomina en el sur de la India y el norte de Sri Lanka: tamil, telugu, canarés y malayalam. El brahui, hablado en Pakistán, es un enclave aislado mil kilómetros al norte.",
      "Se ha propuesto que la escritura del valle del Indo representara una lengua dravídica, pero esa escritura no está descifrada y la hipótesis no está probada.",
    ],
    destacadas: ["tami1289", "telu1262", "nucl1305", "mala1464", "brah1256"],
    fuentes: [wiki("Lenguas drávidas"), glotto("drav1251", "Dravidian")],
  },
  {
    id: "araw1281",
    es: "Arahuaca",
    origen: "Amazonia occidental (la hipótesis más citada).",
    texto: [
      "Antes de 1492 era la familia más extendida de Sudamérica y el Caribe. El taíno, la lengua de La Española, Cuba y Puerto Rico, era arahuaco y está extinto, pero dejó en el español palabras como canoa, huracán, hamaca, tabaco o barbacoa.",
      "Hoy siguen vivas el wayuunaiki (Colombia y Venezuela), el asháninka (Perú) y el garífuna, que se habla en Honduras, Belice, Guatemala y Nicaragua y desciende de la lengua de las Antillas Menores.",
    ],
    destacadas: ["tain1254", "gari1256", "isla1278", "wayu1243"],
    fuentes: [wiki("Lenguas arahuacas"), wiki("Idioma taíno"), glotto("araw1281", "Arawakan")],
  },
  {
    id: "tupi1275",
    es: "Tupí",
    origen: "Suroeste de la Amazonia (actual Rondonia, Brasil), donde se concentra la mayor diversidad de la familia.",
    texto: [
      "El guaraní, oficial en Paraguay junto al español, es la lengua indígena americana con mayor proporción de hablantes no indígenas. El tupinambá, hablado en la costa de Brasil en el siglo XVI, dio origen a la «lengua general» que todavía sobrevive como ñe'engatu en el río Negro.",
    ],
    destacadas: ["para1311", "tupi1273", "nhen1239"],
    fuentes: [wiki("Lenguas tupíes"), glotto("tupi1275", "Tupian")],
  },
  {
    id: "utoa1244",
    es: "Yutoazteca",
    texto: [
      "Se extiende desde la Gran Cuenca de Estados Unidos (shoshón, comanche, hopi) hasta Centroamérica (pipil en El Salvador), pasando por el rarámuri, el yaqui y el náhuatl, la lengua de Tenochtitlan, de la que el español tomó tomate, chocolate o aguacate.",
    ],
    destacadas: ["clas1250", "hopi1249", "coma1245", "pipi1250"],
    fuentes: [wiki("Lenguas yutoaztecas"), glotto("utoa1244", "Uto-Aztecan")],
  },
  {
    id: "ural1272",
    es: "Urálica",
    protolengua: "Protourálico",
    origen: "Entorno de los montes Urales y la cuenca del Volga.",
    texto: [
      "Incluye el húngaro, el finés, el estonio, las lenguas sami y varias lenguas de Rusia (mordvino, mari, komi, udmurto, nenets). El húngaro y el finés están emparentados, pero se separaron hace miles de años y no son inteligibles entre sí.",
    ],
    destacadas: ["hung1274", "finn1318", "esto1258", "nort2671"],
    fuentes: [wiki("Lenguas urálicas"), glotto("ural1272", "Uralic")],
  },
  {
    id: "turk1311",
    es: "Túrquica",
    testimonios: "Inscripciones del Orjón (Mongolia), siglo VIII.",
    texto: [
      "Del turco y el azerí, en el oeste, al yakuto en Siberia, pasando por el uzbeko, el kazajo, el kirguís, el turcomano y el uigur. Es una familia muy homogénea; el chuvasio forma una rama aparte, la oghur.",
      "La hipótesis altaica, que la uniría al mongol y las lenguas tungúsicas, no goza hoy de aceptación mayoritaria.",
    ],
    destacadas: ["nucl1301", "nort2697", "nort2690", "kaza1248", "uigh1240", "yaku1245", "chuv1255"],
    fuentes: [wiki("Lenguas túrquicas"), wiki("Lenguas altaicas"), glotto("turk1311", "Turkic")],
  },
  {
    id: "quec1387",
    es: "Quechua",
    origen: "Costa y sierra central del Perú.",
    texto: [
      "No es una sola lengua sino una familia, con dos grandes ramas (quechua I, central, y quechua II, que se extendió con el comercio y con el Imperio inca). Se habla en Perú, Bolivia, Ecuador, el sur de Colombia, el noroeste de Argentina y el norte de Chile, con varios millones de hablantes.",
      "Tras la conquista, la Iglesia lo usó como «lengua general» de evangelización, lo que extendió algunas variedades fuera de su área original.",
    ],
    destacadas: [],
    fuentes: [wiki("Lenguas quechuas"), glotto("quec1387", "Quechuan")],
  },
  {
    id: "maya1287",
    es: "Maya",
    protolengua: "Protomaya",
    origen: "Altos de Guatemala (la hipótesis más citada).",
    testimonios: "Inscripciones jeroglíficas desde los últimos siglos antes de nuestra era; la escritura maya se descifró en gran parte en la segunda mitad del siglo XX.",
    texto: [
      "Una treintena de lenguas en Guatemala, el sureste de México, Belice y Honduras: k'iche', q'eqchi', kaqchikel, mam, tsotsil, tseltal y maya yucateco. En Guatemala son la mayoría de las lenguas reconocidas oficialmente.",
      "La escritura maya era logosilábica: combinaba signos de palabra con signos de sílaba, como la cuneiforme o la japonesa.",
    ],
    destacadas: ["yuca1254", "kich1262", "kekc1242", "kaqc1270", "mamm1241", "tzot1259"],
    fuentes: [wiki("Lenguas mayenses"), glotto("maya1287", "Mayan")],
  },
  {
    id: "cari1283",
    es: "Caribe",
    texto: [
      "Familia del norte de Sudamérica (Guayanas, Venezuela, norte de Brasil). Dio nombre al mar Caribe, pero la lengua de los kalinago de las Antillas Menores era en realidad arahuaca, con un registro masculino de origen caribe.",
    ],
    destacadas: ["isla1278"],
    fuentes: [wiki("Lenguas caribes"), glotto("cari1283", "Cariban")],
  },
  {
    id: "japo1237",
    es: "Japónica",
    texto: [
      "El japonés y las lenguas ryukyuenses de Okinawa y las islas vecinas, que no son dialectos del japonés sino lenguas emparentadas; varias están amenazadas.",
    ],
    destacadas: ["nucl1643", "cent2126"],
    fuentes: [wiki("Lenguas japónicas"), glotto("japo1237", "Japonic")],
  },
  {
    id: "kore1284",
    es: "Coreánica",
    texto: ["Una familia pequeña: el coreano y la lengua de la isla de Jeju, considerada en peligro."],
    destacadas: ["kore1280", "jeju1234"],
    fuentes: [wiki("Lenguas coreánicas"), glotto("kore1284", "Koreanic")],
  },
  {
    id: "eski1264",
    es: "Esquimo-aleutiana",
    texto: [
      "Desde Siberia oriental hasta Groenlandia a través de Alaska y el Ártico canadiense: lenguas yupik, inuktitut, kalaallisut (groenlandés, oficial en Groenlandia) y aleutiano. Son polisintéticas: una palabra puede equivaler a una frase entera.",
    ],
    destacadas: ["kala1399", "east2534"],
    fuentes: [wiki("Lenguas esquimo-aleutianas"), glotto("eski1264", "Eskimo-Aleut")],
  },
];

const POR_ID = new Map(FICHAS_FAMILIA.map((f) => [f.id, f]));
export const fichaFamilia = (id: string) => POR_ID.get(id);
