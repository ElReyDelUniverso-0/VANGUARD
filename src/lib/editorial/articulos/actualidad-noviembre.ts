import type { Articulo } from "../tipos";

export const midterms: Articulo = {
  slug: "midterms-2026-congreso-democrata-que-cambia",
  titulo: "Elecciones de medio mandato 2026: qué cambia para el mundo con un Congreso demócrata",
  entradilla:
    "Los demócratas recuperan la Cámara de Representantes y el Senado en plena guerra con Irán. El presidente sigue dirigiendo la política exterior, pero el Congreso controla el dinero, los tratados y las investigaciones.",
  area: "geopolitica",
  tipo: "actualidad",
  publicado: "2026-11-18",
  revisado: "2026-11-18",
  revisarCada: 7,
  hito: { fecha: "2027-01-03", que: "toma de posesión del 120.º Congreso de EE. UU." },
  imagen: "/imagenes-reales/kremlin.jpg",
  claves: [
    "Los demócratas suman al menos 55 escaños del Senado; Alaska seguía sin proclamar el 17 de noviembre.",
    "En la Cámara de Representantes, las proyecciones de NBC News les dan una mayoría amplia, muy por encima de los 218 escaños necesarios.",
    "El nuevo Congreso toma posesión en enero de 2027: desde entonces podrá condicionar el gasto de la guerra, la ayuda exterior y los aranceles.",
  ],
  cuerpo: [
    { t: "h2", x: "Qué se votó el 3 de noviembre", id: "que-se-voto" },
    {
      t: "p",
      x: "Las elecciones de medio mandato (midterms) se celebran a mitad del periodo presidencial de cuatro años. Se renuevan los 435 escaños de la Cámara de Representantes y un tercio del Senado, además de numerosas gobernaciones. Tradicionalmente castigan al partido del presidente, y 2026 no fue la excepción: los demócratas ganaron el control de las dos cámaras.",
    },
    {
      t: "datos",
      titulo: "El nuevo reparto (proyecciones a 17 de noviembre de 2026)",
      filas: [
        ["Senado", "al menos 55 escaños alineados con los demócratas, 44 republicanos; Alaska sin proclamar"],
        ["Cámara de Representantes", "mayoría demócrata amplia (la mayoría absoluta es de 218)"],
        ["Escaños del Senado arrebatados a los republicanos", "Iowa, Kansas, Maine, Misisipi, Carolina del Norte, Ohio, Carolina del Sur y Texas"],
        ["Alaska", "Mary Peltola (D) rozaba el 50 % frente a Dan Sullivan (R); por debajo del 50 % decide el voto preferencial"],
      ],
    },
    {
      t: "p",
      x: "Entre los resultados más simbólicos figuran la victoria de James Talarico en Texas, un estado que no elegía a un senador demócrata desde los años ochenta, y la de Scott Colom en Misisipi, decidida por un margen mínimo. El presidente Donald Trump atribuyó la derrota a la guerra con Irán.",
    },
    { t: "h2", x: "Qué puede hacer el Congreso en política exterior", id: "poderes" },
    {
      t: "p",
      x: "La Constitución reparte la política exterior entre los dos poderes. El presidente es el comandante en jefe y dirige la diplomacia; el Congreso declara la guerra, aprueba los presupuestos y, a través del Senado, ratifica los tratados y confirma a embajadores y altos cargos.",
    },
    {
      t: "lista",
      items: [
        "El dinero: ninguna operación militar prolongada se sostiene sin fondos aprobados por el Congreso. Es su palanca más fuerte sobre la guerra con Irán.",
        "La Resolución de Poderes de Guerra de 1973: obliga a retirar las tropas de las hostilidades a los 60 días, prorrogables 30, si el Congreso no las autoriza. El Congreso puede votar resoluciones para forzar esa retirada, aunque el presidente puede vetarlas.",
        "Los nombramientos: el Senado confirma a embajadores, ministros y jueces. Una mayoría opositora puede bloquear o retrasar candidatos.",
        "Las investigaciones: las comisiones pueden citar a funcionarios y exigir documentos sobre la conducción de la guerra o la política comercial.",
        "Los aranceles: la Constitución atribuye al Congreso la potestad de fijar impuestos y regular el comercio, aunque leyes posteriores delegaron amplios márgenes en la Casa Blanca.",
      ],
    },
    { t: "h2", x: "Los límites del cambio", id: "limites" },
    {
      t: "p",
      x: "Una mayoría simple no basta para todo. Para superar un veto presidencial hacen falta dos tercios de ambas cámaras, y en el Senado la mayoría de las leyes necesita 60 votos para cerrar el debate. Además, el nuevo Congreso no toma posesión hasta el 3 de enero de 2027: hasta entonces sigue en funciones la mayoría saliente.",
    },
    { t: "h2", x: "Lo que mira el resto del mundo", id: "mundo" },
    {
      t: "lista",
      items: [
        "Irán y el golfo Pérsico: el control demócrata del presupuesto puede presionar para una salida negociada.",
        "China: la derrota llega dos semanas antes del encuentro de Trump con Xi Jinping en la cumbre de APEC en Shenzhen.",
        "América Latina: el comercio, la migración y las remesas dependen en buena parte de leyes que pasan por el Congreso.",
      ],
    },
    {
      t: "aviso",
      x: "Resultados provisionales. Esta pieza se actualizará cuando se proclame el escaño de Alaska y se certifiquen los totales de la Cámara.",
    },
  ],
  fuentes: [
    { nombre: "The New York Times · Resultados del Senado en Alaska", url: "https://www.nytimes.com/interactive/2026/11/03/us/elections/results-alaska-us-senate.html", tipo: "secundaria", fecha: "2026-11-17" },
    { nombre: "NBC News · Resultados en Alaska y reparto del Congreso", url: "https://www.nbcnews.com/politics/2026-elections/alaska-results", tipo: "secundaria", fecha: "2026-11-17" },
    { nombre: "RTVE · Los demócratas ganan las elecciones de EE. UU.", url: "https://www.rtve.es/noticias/20261103/elecciones-midterm-estados-unidos-2026-directo-ultima-hora-ganador-resultado/17296947.shtml", tipo: "secundaria", fecha: "2026-11-04" },
    { nombre: "Telemundo · Sigue el conteo en Alaska, Misisipi y Kansas", url: "https://www.telemundo.com/noticias/noticias-telemundo/elecciones-estados-unidos-2026/live-blog/elecciones-de-medio-termino-2026-sigue-el-conteo-de-votos-en-alaska-mi-rcna607613", tipo: "secundaria", fecha: "2026-11-06" },
    { nombre: "Constitución de EE. UU., artículo I (poderes del Congreso)", url: "https://constitution.congress.gov/constitution/article-1/", tipo: "primaria" },
  ],
  enlaces: [
    { href: "/rostros", label: "Rostros del poder" },
    { href: "/mundos/us", label: "Ficha de Estados Unidos" },
    { href: "/conflicto/hormuz", label: "La guerra en Ormuz" },
  ],
  salas: ["gobierno", "briefing"],
  etiquetas: ["Estados Unidos", "elecciones", "Congreso", "Senado", "Trump", "Irán"],
  informe: "Rostros del poder (/rostros) · cables de la crónica del día",
  complementa: "Tema nuevo: la casa no tenía piezas de política institucional de EE. UU.",
  cambios: [{ fecha: "2026-11-18", nota: "Publicación con resultados provisionales a 17 de noviembre." }],
};

export const cumbres: Articulo = {
  slug: "apec-shenzhen-y-g20-miami-las-cumbres-que-cierran-2026",
  titulo: "De Shenzhen a Miami: las dos cumbres que cierran 2026",
  entradilla:
    "En menos de un mes, las grandes economías se sientan dos veces a la misma mesa: el foro Asia-Pacífico en China y el G20 en Florida. Qué es cada uno, quién falta y qué hay en juego.",
  area: "relaciones",
  tipo: "actualidad",
  publicado: "2026-11-18",
  revisado: "2026-11-18",
  revisarCada: 5,
  hito: { fecha: "2026-12-15", que: "cierre de la cumbre del G20 en Miami" },
  imagen: "/imagenes-reales/onu.jpg",
  claves: [
    "APEC: 33.ª reunión de líderes, 18 y 19 de noviembre en Shenzhen, con 21 economías y la primera cumbre a tres entre Xi Jinping, Donald Trump y Vladímir Putin.",
    "G20: 14 y 15 de diciembre en el Trump National Doral, cerca de Miami, bajo presidencia estadounidense y sin Sudáfrica.",
    "En el fondo, la tregua comercial entre EE. UU. y China, prorrogada hasta el 10 de enero de 2027.",
  ],
  cuerpo: [
    { t: "h2", x: "APEC: el foro del Pacífico", id: "apec" },
    {
      t: "p",
      x: "El Foro de Cooperación Económica Asia-Pacífico (APEC) nació en 1989 y reúne a 21 economías de las dos orillas del Pacífico, entre ellas EE. UU., China, Rusia, Japón, México, Chile y Perú. Habla de «economías» y no de «países» para poder incluir a Taiwán (con el nombre de Taipéi Chino) y a Hong Kong. Sus miembros suman unos 3.000 millones de habitantes y más del 60 % de la economía mundial. Sus acuerdos no son vinculantes: es un foro de coordinación, no un tratado.",
    },
    {
      t: "datos",
      titulo: "APEC 2026",
      filas: [
        ["Sede y fechas", "Shenzhen (China), 18 y 19 de noviembre"],
        ["Edición", "33.ª reunión de líderes; tercera en China, tras Shanghái (2001) y Pekín (2014)"],
        ["Agenda oficial", "conectividad, economía digital, inteligencia artificial y cadenas de suministro"],
        ["Reunión a tres", "Xi, Trump y Putin, jueves 19 de noviembre (confirmada por la Cancillería china)"],
        ["Taiwán", "representado por Stan Shih, fundador de Acer"],
      ],
    },
    {
      t: "p",
      x: "La elección de Shenzhen, la ciudad de Huawei, Tencent y BYD, es un escaparate tecnológico. El encuentro bilateral entre Trump y Xi llega con la tregua comercial a punto de caducar: Pekín acaba de prorrogar hasta el 10 de enero de 2027 la suspensión de sus controles a la exportación de tierras raras y de su arancel adicional del 24 % a los productos estadounidenses. La Casa Blanca ha señalado el control de armas nucleares e Irán como temas de la reunión a tres; Ucrania, según Washington, no será el centro.",
    },
    { t: "h2", x: "G20: el club de las grandes economías", id: "g20" },
    {
      t: "p",
      x: "El Grupo de los Veinte nació en 1999 como reunión de ministros de Finanzas y se elevó a cumbre de jefes de Estado en 2008, en plena crisis financiera. Lo forman 19 países, la Unión Europea y, desde 2023, la Unión Africana. Representa alrededor del 85 % del PIB mundial y dos tercios de la población. La presidencia rota cada año y el anfitrión fija la agenda.",
    },
    {
      t: "datos",
      titulo: "G20 2026",
      filas: [
        ["Sede y fechas", "Trump National Doral, Miami (Florida), 14 y 15 de diciembre"],
        ["Presidencia", "Estados Unidos"],
        ["Agenda", "reducida a economía, energía y tecnología"],
        ["Ausencia", "Sudáfrica, miembro fundador y presidenta del G20 en 2025, no ha sido invitada"],
        ["Invitado destacado", "Polonia"],
        ["Próxima cumbre", "Mánchester (Reino Unido), 28 y 29 de noviembre de 2027"],
      ],
    },
    {
      t: "p",
      x: "La exclusión de Sudáfrica no tiene precedentes en la historia del grupo. Trump la anunció en noviembre de 2025, tras boicotear la cumbre de Johannesburgo, alegando abusos contra los afrikáneres y una disputa sobre el traspaso de la presidencia. Pretoria respondió que es miembro «por derecho propio». Sin Sudáfrica, la única voz africana en Miami será la de la Unión Africana.",
    },
    { t: "h2", x: "Qué vigilar", id: "que-vigilar" },
    {
      t: "lista",
      items: [
        "Si Trump y Xi convierten la tregua en un acuerdo más largo antes del 10 de enero.",
        "Qué sale de la primera reunión a tres entre EE. UU., China y Rusia, y si incluye control de armas.",
        "Si el G20 de Miami logra una declaración conjunta, algo que en los últimos años ha costado cerrar.",
      ],
    },
    {
      t: "aviso",
      x: "Vanguard publicará un balance de Shenzhen el 20 de noviembre y otro del G20 el 16 de diciembre (ver calendario editorial).",
    },
  ],
  fuentes: [
    { nombre: "Noticias SIN · Trump, Xi y Putin se reunirán en la cumbre APEC de Shenzhen (EFE)", url: "https://noticiassin.com/mundo/mundo-general/2026/11/15/trump-xi-y-putin-se-reuniran-en-la-cumbre-apec-de-shenzhen-2170327", tipo: "secundaria", fecha: "2026-11-15" },
    { nombre: "Primicias · Cumbre de la APEC en China: guerra comercial, Ucrania, armas nucleares e IA", url: "https://www.primicias.ec/internacional/china-shenzhen-cumbre-apec-2026-137312/", tipo: "secundaria", fecha: "2026-11-17" },
    { nombre: "Portal Innova · Cumbre trilateral confirmada por la Cancillería china", url: "https://portalinnova.cl/apec-2026-cumbre-trilateral-historica-trump-xi-putin/", tipo: "secundaria", fecha: "2026-11-16" },
    { nombre: "IFM Noticias · EE. UU. alista la cumbre del G20 en Miami", url: "https://ifmnoticias.com/economicas/estados-unidos-alista-la-cumbre-del-g20-en-miami-con-una-agenda-economica-recort/", tipo: "secundaria", fecha: "2026-11-15" },
    { nombre: "The Rio Times · US Drops South Africa From G20 Invites", url: "https://www.riotimesonline.com/us-drops-south-africa-from-g20-invites/", tipo: "secundaria", fecha: "2026-10-30" },
    { nombre: "Investing.com · Trump excluye a Sudáfrica de la cumbre del G20 de 2026", url: "https://mx.investing.com/news/world-news/trump-excluye-a-sudafrica-de-la-cumbre-del-g20-de-2026-corta-toda-ayuda-93CH-3391502", tipo: "secundaria", fecha: "2025-11-26" },
  ],
  enlaces: [
    { href: "/mundos/cn", label: "Ficha de China" },
    { href: "/mundos/za", label: "Ficha de Sudáfrica" },
    { href: "/rostros", label: "Rostros del poder" },
  ],
  salas: ["redmundial", "gobierno"],
  etiquetas: ["APEC", "G20", "China", "Estados Unidos", "Rusia", "Sudáfrica", "diplomacia"],
  informe: "Inteligencia mundial (/servicios) · balances programados el 20-nov y el 16-dic",
  complementa: "Tema nuevo: la casa no cubría las cumbres multilaterales",
  cambios: [{ fecha: "2026-11-18", nota: "Publicación en la apertura de la cumbre de APEC." }],
};

export const espanol: Articulo = {
  slug: "el-espanol-en-el-mundo-2026-640-millones",
  titulo: "El español en el mundo en 2026: 640 millones de hablantes y un nuevo mapa que pasa por China",
  entradilla:
    "El anuario del Instituto Cervantes, presentado por primera vez fuera de España, confirma que el idioma sigue creciendo y que una parte cada vez mayor de quienes lo hablan vive lejos de los países hispanohablantes.",
  area: "sociedad",
  tipo: "actualidad",
  publicado: "2026-11-18",
  revisado: "2026-11-18",
  revisarCada: 120,
  imagen: "/imagenes-reales/onu.jpg",
  claves: [
    "Más de 640 millones de usuarios potenciales, un 1,5 % más que en 2025.",
    "Más de 520 millones con dominio nativo: es la tercera lengua materna del mundo, tras el chino mandarín y el hindi.",
    "Uno de cada diez hablantes nativos vive en un país donde el español no es oficial, sobre todo por la migración.",
  ],
  cuerpo: [
    { t: "h2", x: "Las cifras del anuario", id: "cifras" },
    {
      t: "p",
      x: "El Instituto Cervantes publica cada año «El español en el mundo», el informe de referencia sobre la demografía del idioma. La edición de 2026 se presentó el 24 de octubre en Pekín, coincidiendo con los veinte años del centro del Cervantes en la capital china, y es la primera que se presenta fuera de España.",
    },
    {
      t: "datos",
      titulo: "El español en 2026 (Instituto Cervantes)",
      filas: [
        ["Usuarios potenciales", "más de 640 millones (+1,5 %)"],
        ["Dominio nativo", "más de 520 millones"],
        ["Competencia limitada", "más de 95 millones (+3,3 %)"],
        ["Posición mundial", "3.ª lengua por hablantes nativos"],
        ["Fuera de los países hispanohablantes", "1 de cada 10 nativos"],
        ["Matrículas de español en China", "+12,6 % entre 2023 y 2025"],
      ],
    },
    { t: "h2", x: "Qué significa «usuario potencial»", id: "conceptos" },
    {
      t: "p",
      x: "El Cervantes suma tres grupos: quienes lo hablan como lengua materna, quienes lo usan con competencia limitada (por ejemplo, hijos de inmigrantes o hablantes de zonas bilingües) y quienes lo estudian. Por eso habla de usuarios potenciales y no de hablantes a secas. Comparar estas cifras con las de otras lenguas exige usar la misma definición: las clasificaciones que mezclan criterios dan resultados distintos.",
    },
    { t: "h2", x: "Dónde vive el español", id: "geografia" },
    {
      t: "p",
      x: "México es el país con más hablantes nativos, seguido de Colombia, España y Argentina. Estados Unidos alberga una de las mayores comunidades hispanohablantes del planeta, y la migración ha llevado el idioma a Europa, Canadá y Asia. Para el Caribe, incluida la República Dominicana, el español es además el puente con una diáspora de millones de personas.",
    },
    { t: "h2", x: "El caso de China", id: "china" },
    {
      t: "p",
      x: "El anuario dedica una sección monográfica a China, donde las matrículas de español crecieron un 12,6 % entre 2023 y 2025 y el número de universidades que ofrecen la carrera se ha multiplicado en dos décadas. El director del Cervantes, Luis García Montero, vinculó ese auge al peso económico del idioma y advirtió del retroceso general de las humanidades.",
    },
    {
      t: "cita",
      x: "Lo que baja no es el español exactamente, sino los departamentos de humanidades.",
      de: "Luis García Montero, director del Instituto Cervantes (EFE, 24 de octubre de 2026)",
    },
    {
      t: "p",
      x: "El reto del español ya no es crecer en número, sino en peso: en ciencia, en publicaciones técnicas y en internet, donde su presencia es menor de lo que correspondería a su número de hablantes.",
    },
  ],
  fuentes: [
    { nombre: "Centro Virtual Cervantes · El español: una lengua viva (anuarios)", url: "https://cvc.cervantes.es/lengua/espanol_lengua_viva/", tipo: "primaria" },
    { nombre: "EFE · El español supera los 640 millones de usuarios potenciales y crece en las aulas de China", url: "https://efe.com/cultura/2026-10-24/espanol-usuarios-potenciales-mundo/", tipo: "secundaria", fecha: "2026-10-24" },
    { nombre: "Cadena SER · El español ganó diez millones de hablantes en 2026", url: "https://cadenaser.com/nacional/2026/10/24/el-espanol-gano-diez-millones-de-hablantes-en-el-mundo-en-2026-un-15-mas-que-el-ano-anterior-cadena-ser/", tipo: "secundaria", fecha: "2026-10-24" },
  ],
  enlaces: [
    { href: "/traductor", label: "Traductor" },
    { href: "/mundos/mx", label: "Ficha de México" },
    { href: "/mundos/do", label: "Ficha de la República Dominicana" },
  ],
  salas: ["comunidad", "biblioteca"],
  etiquetas: ["español", "idiomas", "Instituto Cervantes", "China", "migración"],
  informe: "Ficha de idiomas del atlas (/atlas) · revisión con el anuario 2027",
  complementa: "El atlas lista idiomas oficiales por país; esta pieza da la demografía global del español",
  cambios: [{ fecha: "2026-11-18", nota: "Publicación con el anuario 2026 del Instituto Cervantes." }],
};
