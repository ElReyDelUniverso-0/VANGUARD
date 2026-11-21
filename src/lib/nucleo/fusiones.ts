// ============================================================
// v435.4 · LAS FAMILIAS DE MÓDULOS — lo que ya es UNA sola cosa (15 familias)
//
// EL DEFECTO, medido sobre el árbol real de la casa (main, 18-nov-2026):
// 73 rutas vivas, 434 componentes y 264 librerías. El censo del Núcleo conocía
// 39 módulos: la geografía entera (/mundos, /mapas, /mundo, /atlas, /poder,
// /divisas, /conflictos, /archivo-mundial…) no existía para el catálogo, y la
// misma función se ofrecía desde cuatro o cinco puertas sin que ninguna dijera
// cuál es la buena.
//
// Este archivo NO cierra nada (ley de la casa: la evolución es aditiva). Lo que
// hace es DECLARAR, con nombre y cifra, qué módulos son la misma cosa vista
// desde otro ángulo, cuál es la puerta canónica y qué papel cumple cada una.
// Con eso la casa deja de ser 73 herramientas sueltas y pasa a ser un mapa que
// se puede leer.
//
// Se pinta en /nucleo y se valida en scripts/pruebas-nucleo.mjs: cada ruta que
// aparezca aquí tiene que existir de verdad en src/app (la prueba lo vigila).
// ============================================================

/** Una pieza dentro de una familia: su ruta real y el papel que cumple. */
export interface PiezaFamilia {
  ruta: string;
  nombre: string;
  /** qué hace esta puerta y por qué no sobra */
  papel: string;
}

/** Una familia de módulos que responden a la misma pregunta. */
export interface FamiliaModulos {
  id: string;
  /** la pregunta que responde la familia, en palabras del lector */
  pregunta: string;
  /** la puerta canónica: por donde se entra primero */
  canonico: PiezaFamilia;
  /** las demás puertas: siguen abiertas, con su papel declarado */
  piezas: PiezaFamilia[];
  /** por qué es una sola cosa y no cinco herramientas */
  motivo: string;
  /** la cifra que lo demuestra (medida sobre la casa, no estimada) */
  cifra: string;
}

export const FAMILIAS_MODULO: FamiliaModulos[] = [
  {
    id: "familia-planeta",
    pregunta: "¿Cómo es este país y dónde queda?",
    canonico: {
      ruta: "/mundos",
      nombre: "El mapa de los mundos",
      papel: "El índice: 177 países con polígono real, doce medidas, fronteras y los 24 macroterritorios de la casa.",
    },
    piezas: [
      {
        ruta: "/mundos/[iso]",
        nombre: "La ficha del país",
        papel: "La ficha única de los 249 países: geografía, economía, política, cultura, historia y vecinos.",
      },
      {
        ruta: "/mapas",
        nombre: "El globo por capas",
        papel: "El mismo planeta en 3D con capas conmutables (población, PIB, renta, esperanza de vida…).",
      },
      {
        ruta: "/mundo",
        nombre: "El mundo vivo",
        papel: "El globo que respira: los nueve teatros con su peso de 24 h y su último cable.",
      },
      {
        ruta: "/atlas",
        nombre: "El atlas",
        papel: "La lectura larga: capital, gobierno, líder y el dato estratégico de cada nación.",
      },
      {
        ruta: "/poder",
        nombre: "El poder",
        papel: "La misma geografía medida en poder militar y gasto (Banco Mundial, con su año).",
      },
      {
        ruta: "/divisas",
        nombre: "Las divisas",
        papel: "La moneda de cada país frente al tablero: la cara económica del mismo censo.",
      },
    ],
    motivo:
      "Seis puertas abiertas sobre el mismo planeta y ninguna decía cuál abrir. No se cierra ninguna: se declara que /mundos es el índice y que las otras cinco son lecturas de la misma tabla (geo-paises une las cinco por identidad ISO).",
    cifra: "6 puertas · 1 planeta · 249 fichas",
  },
  // v407.1 EL PLANETA EN CIFRAS — la ficha de un país dice cómo es; esta
  // familia responde la pregunta siguiente: cuánto pesa frente a los demás.
  {
    id: "familia-cifras",
    pregunta: "¿Cuánto pesa un país frente a los demás?",
    canonico: {
      ruta: "/comparador",
      nombre: "El comparador internacional",
      papel: "La puerta de entrada: de dos a cuatro países cara a cara, con su puesto mundial y el año de cada cifra.",
    },
    piezas: [
      {
        ruta: "/rankings",
        nombre: "Los rankings",
        papel: "Las ocho listas mundiales completas, con el peso de cada país sobre el total.",
      },
      {
        ruta: "/demografia",
        nombre: "Población y demografía",
        papel: "La lectura humana de la misma tabla: cuántos somos, dónde y cuánto vivimos.",
      },
      {
        ruta: "/regiones",
        nombre: "Territorios y regiones",
        papel: "La misma tabla sumada por las 24 subregiones del mundo.",
      },
      {
        ruta: "/organizaciones",
        nombre: "Las organizaciones",
        papel: "La misma tabla sumada por bloques: OTAN, BRICS, OPEP, SICA y doce más.",
      },
    ],
    motivo:
      "Cinco centros nuevos y una sola tabla: src/lib/planeta/datos.ts lee la ficha canónica del país, así que el comparador, los rankings, las regiones, la demografía y los bloques dicen siempre la misma cifra que /mundos/[iso].",
    cifra: "5 centros · 1 tabla · 8 indicadores",
  },
  {
    id: "familia-redaccion",
    pregunta: "¿Qué está pasando ahora?",
    canonico: {
      ruta: "/en-vivo",
      nombre: "El pulso · en vivo",
      papel: "La redacción abierta 24 h: cables reales con hora, fuente y sello de exactitud.",
    },
    piezas: [
      {
        ruta: "/vertigo",
        nombre: "El vértigo",
        papel: "El mismo archivo, en feed infinito a pantalla completa: otra forma de leer, no otra redacción.",
      },
      {
        ruta: "/guerra-hoy",
        nombre: "Guerra hoy",
        papel: "El mismo archivo filtrado por el Ojo de Dios: el planeta vigilado, no un archivo distinto.",
      },
      {
        ruta: "/archivo-mundial",
        nombre: "El archivo mundial",
        papel: "El mismo archivo ordenado por geografía, para quien busca un país y no una hora.",
      },
      {
        ruta: "/noticia/[id]",
        nombre: "La puerta del cable",
        papel: "Cada cable con su propia página (JSON-LD NewsArticle): la entrada desde Google.",
      },
      {
        ruta: "/oscura",
        nombre: "El expediente oscuro",
        papel: "La otra redacción: archivo de expedientes documentados, no cables del día.",
      },
      {
        ruta: "/conflictos",
        nombre: "El tablero de conflictos",
        papel: "El mismo archivo ordenado por región: 33 teatros con su nivel y su dossier, para ir por geografía.",
      },
      {
        ruta: "/conflicto",
        nombre: "Las salas del conflicto",
        papel: "La entrada por teatro: cada guerra con su archivo de cables, su señal fresca y su mapa.",
      },
    ],
    motivo:
      "Ocho puertas que sirven la MISMA tabla NewsItem con distinto orden. Un cable que entra por /noticia aparece en /en-vivo, /vertigo y /archivo-mundial; antes no había ni un enlace entre ellas.",
    cifra: "8 puertas · 1 archivo · 1 tabla (NewsItem)",
  },
  {
    id: "familia-simulacion",
    pregunta: "¿Qué pasaría si…?",
    canonico: {
      ruta: "/teatro-3d",
      nombre: "El teatro global 3D",
      papel: "La mesa de guerra: teatros reales, arcos de misiles y aeronaves; el simulador con coordenadas de la casa.",
    },
    piezas: [
      {
        ruta: "/ver-guerra",
        nombre: "La sala de guerra",
        papel: "El parque militar: las unidades y modelos reales que alimentan la simulación.",
      },
      {
        ruta: "/zona-cero",
        nombre: "Zona cero",
        papel: "El asedio: cuatro frentes simultáneos con la simulación de unidades (zc3d-engine).",
      },
      {
        ruta: "/escenarios",
        nombre: "Los escenarios",
        papel: "El «qué pasa si» con piezas reales: el escenario, no la batalla.",
      },
      {
        ruta: "/objetivos",
        nombre: "Los objetivos",
        papel: "La capa de misión: qué se juega y qué se cumple, sobre el mismo estado de juego.",
      },
      {
        ruta: "/armeria",
        nombre: "La armería",
        papel: "El catálogo de material: la munición de la simulación, con sus fichas.",
      },
    ],
    motivo:
      "Cinco salas que parecían cinco juegos distintos. Comparten estado (game-store) y ahora comparten puerta: desde la ficha de cualquier país se entra al simulador con sus coordenadas reales (v405.12) y desde aquí se vuelve al país.",
    cifra: "5 salas · 1 estado de juego · 249 países simulables",
  },
  {
    id: "familia-personas",
    pregunta: "¿Quién manda y quién lo cuenta?",
    canonico: {
      ruta: "/rostros",
      nombre: "Rostros del poder",
      papel: "Quién manda en cada país y desde qué sede, con la fuente a la vista.",
    },
    piezas: [
      {
        ruta: "/espia",
        nombre: "El espía",
        papel: "El mismo censo de personas leído como tablero de inteligencia.",
      },
      {
        ruta: "/creadores",
        nombre: "Los creadores",
        papel: "La otra cara: la comunidad que produce, no los gobernantes.",
      },
      {
        ruta: "/perfil",
        nombre: "El perfil",
        papel: "Tu ficha como jugador: el mismo sistema de identidad, del lado de casa.",
      },
      {
        ruta: "/informacion",
        nombre: "El centro de información",
        papel: "El mismo censo de potencias con radar de seis ejes y arsenales: quien manda, medido en seis ejes.",
      },
    ],
    motivo:
      "Cinco miradas sobre «quién es quién»: las personas del planeta, tu agente y la comunidad. Comparten la identidad de la casa; no se fusionan porque una es dato público y otra es cuenta.",
    cifra: "5 puertas · 1 censo de personas",
  },
  {
    id: "familia-conocimiento",
    pregunta: "¿Dónde encuentro todo lo que hay?",
    canonico: {
      ruta: "/nucleo",
      nombre: "El núcleo",
      papel: "El salón central: censo de módulos, búsqueda global, fichas de entidad y frontera de datos.",
    },
    piezas: [
      {
        ruta: "/catalogo",
        nombre: "El catálogo real",
        papel: "El inventario contado: cuántos destinos, herramientas y fusiones tiene la casa.",
      },
      {
        ruta: "/herramientas",
        nombre: "Las herramientas",
        papel: "Lo que se puede HACER (calculadoras, traductores, tableros), no lo que se puede leer.",
      },
      {
        ruta: "/espacio",
        nombre: "Mi espacio",
        papel: "Donde lo encontrado se convierte en proyecto: la mesa de trabajo.",
      },
      {
        ruta: "/navegacion",
        nombre: "La navegación",
        papel: "El mapa de las salas y sus transiciones: cómo se mueve uno por la casa.",
      },
      {
        ruta: "/editorial",
        nombre: "La editorial",
        papel: "Lo que la casa escribe de sí misma: artículos con fecha y área.",
      },
      {
        ruta: "/sistema",
        nombre: "El sistema",
        papel: "Los contratos, los catálogos y el diagnóstico: la casa por dentro, con sus límites declarados.",
      },
      {
        ruta: "/datos",
        nombre: "El catálogo de datos",
        papel: "Qué modelo hay, de dónde sale, con qué licencia y de qué fecha — y qué no dice.",
      },
    ],
    motivo:
      "Seis puertas para «¿qué hay aquí?». El núcleo es el índice (censo + búsqueda + fichas); las otras cinco son vistas del mismo inventario y ahora se enlazan entre sí por los chips contextuales.",
    cifra: "8 puertas · 1 censo · búsqueda global única",
  },
  {
    id: "familia-casa",
    pregunta: "¿Dónde está cada cosa dentro de la propia casa?",
    canonico: {
      ruta: "/orden",
      nombre: "El orden de batalla",
      papel:
        "La casa entera en un solo cuerpo: siete divisiones, las 156 salas con su código y un buscador que filtra mientras escribes.",
    },
    piezas: [
      {
        ruta: "/",
        nombre: "La portada",
        papel: "La puerta de calle: lo que pasa ahora, y desde ahí se baja a todo lo demás.",
      },
      {
        ruta: "/buscar",
        nombre: "El buscador único",
        papel: "Una sola caja para toda la casa: salas, noticias vivas y fichas, sin repetir buscadores por módulo.",
      },
      {
        ruta: "/directorio",
        nombre: "El directorio",
        papel: "Las mismas puertas, buscables y filtrables, con tus favoritos y tus recientes.",
      },
      {
        ruta: "/descubrir",
        nombre: "Descubrir",
        papel: "La guía para el que acaba de entrar, escrita en el idioma del que no conoce la casa.",
      },
      {
        ruta: "/entrar",
        nombre: "La travesía",
        papel: "La entrada larga: una ruta guiada por la casa que se retoma donde la dejaste.",
      },
      {
        ruta: "/mi-universo",
        nombre: "Mi universo",
        papel: "Tus puertas repartidas en grupos, con la memoria de tu aparato: lo visto, lo marcado y lo aprendido.",
      },
      {
        ruta: "/colecciones",
        nombre: "Las colecciones",
        papel: "Recorridos de cinco a siete paradas: una guerra o un país contados en el orden en que se entienden.",
      },
      {
        ruta: "/novedades",
        nombre: "Lo nuevo",
        papel: "Lo último que entró a la casa, con su enlace directo: nada se anuncia sin puerta.",
      },
      {
        ruta: "/estado",
        nombre: "El latido",
        papel: "Proceso, base de datos, memoria y tiempo de vida, servidos por la API. El pulso se ve, no se promete.",
      },
      {
        ruta: "/torre",
        nombre: "La torre de control",
        papel: "La salud del arranque noche a noche: supervivencia y los salvavidas de la casa.",
      },
      {
        ruta: "/calidad",
        nombre: "La sala de la calidad",
        papel: "Seis agentes revisan la casa y publican su informe, con los defectos abiertos.",
      },
      {
        ruta: "/ecosistema",
        nombre: "El ecosistema",
        papel: "Las diez familias de la casa vistas desde arriba, como se mira un organigrama.",
      },
      {
        ruta: "/config",
        nombre: "Los ajustes",
        papel: "Maqueta grande o pequeña, modo ligero, animaciones, densidad, letra y fondo. Se guarda en tu aparato.",
      },
      {
        ruta: "/offline",
        nombre: "Sin conexión",
        papel: "La casa cuando se cae la red: lo que se puede leer guardado y lo que habrá que pedir otra vez.",
      },
      {
        ruta: "/privacidad",
        nombre: "La privacidad",
        papel: "Qué se guarda y qué no, dicho antes de que lo preguntes: identidad local, cuenta aparte, cookie de sesión.",
      },
      {
        ruta: "/cuaderno",
        nombre: "El cuaderno",
        papel: "Tu bloc de la casa: notas, citas, cifras, tareas, lugares e imágenes con cuatro pieles.",
      },
      {
        ruta: "/modo",
        nombre: "Tu modo y tu cuenta",
        papel: "Eliges con qué casa quieres tratar (vértigo, en vivo, guerra hoy, misiones) y con qué alias.",
      },
      {
        ruta: "/mision",
        nombre: "Misión 100",
        papel: "Los cien enlaces para repartir la casa, contados como una misión de reclutamiento.",
      },
      {
        ruta: "/universo",
        nombre: "El universo diario",
        papel: "Créditos, colecciones y base personal: la economía de la casa sin penalizaciones por no venir.",
      },
      {
        ruta: "/zona-cero/mesa",
        nombre: "La mesa de órdenes",
        papel: "El puesto de mando: órdenes numeradas, tablero para señalar y capturas pegadas.",
      },
      {
        ruta: "/oportunidades",
        nombre: "Las oportunidades",
        papel: "El panel interno de búsqueda orgánica: qué pregunta la gente y con qué página se responde.",
      },
      {
        ruta: "/creadores/publicar",
        nombre: "Publicar en La Forja",
        papel: "Donde lo tuyo entra a la casa: mapas, escenarios, investigaciones y proyectos con tu nombre.",
      },
      {
        ruta: "/creadores/moderacion",
        nombre: "La moderación",
        papel: "La otra mitad de la Forja: lo que se revisa antes de publicarse y por qué se rechaza.",
      },
      {
        ruta: "/editorial/calendario",
        nombre: "El calendario editorial",
        papel: "Las próximas cuatro semanas de la redacción: prioridades, piezas programadas y plan de acción.",
      },
      {
        ruta: "/vanguard2",
        nombre: "Vanguard 2",
        papel: "La vista espejo de la app, para quien quiere el árbol completo a la vista.",
      },
      {
        ruta: "/clasico",
        nombre: "El clásico",
        papel: "La casa de siempre, sin capas nuevas: lo que ya funcionaba no se tira.",
      },
      {
        ruta: "/sala/[clave]",
        nombre: "La puerta de cada sala",
        papel: "Cada una de las 156 salas con su página de servidor y su enlace canónico, sin pasar por ninguna otra.",
      },
    ],
    motivo:
      "La casa también es un módulo: dónde está cada puerta (/orden), cómo se mide su salud (/estado, /torre, /calidad), qué guarda de ti (/privacidad, /mi-universo, /cuaderno) y cómo se ajusta a tu pantalla (/config). El cuartel ya no existe como destino: cada sala tiene su URL y el índice las declara todas.",
    cifra: "28 puertas · 156 salas · 1 buscador",
  },,
  {
    id: "familia-lengua",
    pregunta: "¿Cómo habla el planeta?",
    canonico: {
      ruta: "/lingua",
      nombre: "Lingua, el centro de lenguas",
      papel:
        "Más de 8.000 lenguas con su familia, su escritura y su estado de amenaza, sobre Glottolog 5.4.",
    },
    piezas: [
      {
        ruta: "/lingua/idiomas",
        nombre: "El catálogo de idiomas",
        papel: "Las 8.000 lenguas buscables por nombre, código ISO 639-3 o glottocode, con filtro por macroárea.",
      },
      {
        ruta: "/lingua/mapa",
        nombre: "El mapa de lenguas",
        papel: "El mismo catálogo puesto sobre el planeta, por familia o por grado de amenaza.",
      },
      {
        ruta: "/lingua/familias",
        nombre: "El árbol de familias",
        papel: "El parentesco: de la atlántico-congo al indoeuropeo, qué lengua desciende de cuál.",
      },
      {
        ruta: "/lingua/escrituras",
        nombre: "Los sistemas de escritura",
        papel: "34 sistemas explicados: alfabetos, abyads, abugidas, silabarios y logográficos.",
      },
      {
        ruta: "/lingua/escrituras/comparar",
        nombre: "Dos escrituras frente a frente",
        papel: "Tipo, dirección, origen y antepasado común de dos sistemas, lado a lado.",
      },
      {
        ruta: "/lingua/alfabetos",
        nombre: "Los alfabetos",
        papel: "Las letras que usa cada idioma según Unicode CLDR: conjunto principal y letras auxiliares.",
      },
      {
        ruta: "/lingua/regiones",
        nombre: "Lenguas por región",
        papel: "Cuántas lenguas se hablan en cada lugar y de qué familia, por macroárea y por país.",
      },
      {
        ruta: "/lingua/peligro",
        nombre: "Lenguas en peligro",
        papel: "Qué lenguas dejan de transmitirse, dónde se concentran y cuáles ya se extinguieron.",
      },
      {
        ruta: "/lingua/comparador",
        nombre: "La misma palabra en varias lenguas",
        papel: "Agua, fuego, madre, sol: la comparación de vocabulario que se ve a simple vista.",
      },
      {
        ruta: "/lingua/diccionario",
        nombre: "El diccionario",
        papel: "Definiciones, etimología, pronunciación grabada y traducciones de una palabra.",
      },
      {
        ruta: "/lingua/pronunciacion",
        nombre: "La pronunciación",
        papel: "Grabaciones de hablantes reales traídas de Wikimedia Commons, no voz sintética.",
      },
      {
        ruta: "/lingua/expresiones",
        nombre: "Las expresiones",
        papel: "Cómo se dice hola, gracias o te quiero en cientos de lenguas, con su contexto.",
      },
      {
        ruta: "/lingua/conceptos",
        nombre: "Lengua, dialecto y variedad",
        papel: "Lo que Lingua cuenta antes de contar nada: qué es cada cosa y por qué la frontera se discute.",
      },
      {
        ruta: "/lingua/traductor",
        nombre: "El traductor de Lingua",
        papel: "Texto de un lado a otro entre las lenguas del centro, con el original a la vista.",
      },
      {
        ruta: "/traductor",
        nombre: "El traductor de noticias",
        papel: "La otra cara: traduce titulares y despachos de guerra a ocho idiomas, no documentos.",
      },
    ],
    motivo:
      "Quince puertas al mismo censo de lenguas. El catálogo, el mapa, el árbol, la escritura, el diccionario y la voz son capas del mismo dato; el traductor de noticias es la única que trabaja sobre texto vivo, y por eso se declara aparte.",
    cifra: "16 puertas · 8.000 lenguas · 34 escrituras",
  },
  {
    id: "familia-escuela",
    pregunta: "¿Dónde aprendo esto de verdad, con orden?",
    canonico: {
      ruta: "/academia",
      nombre: "La Academia",
      papel:
        "Diez disciplinas con cursos modulares, capítulos secuenciales y rutas que se pueden seguir de principio a fin.",
    },
    piezas: [
      {
        ruta: "/academia/cursos",
        nombre: "Los cursos",
        papel: "El catálogo formativo completo con sus capítulos y lecciones estructuradas.",
      },
      {
        ruta: "/academia/rutas",
        nombre: "Las rutas",
        papel: "El constructor de recorridos: lecciones, mapas y evaluaciones en el orden que elige el que estudia.",
      },
      {
        ruta: "/academia/ejercicios",
        nombre: "Los ejercicios",
        papel: "Desafíos con escenario real y pistas escalonadas: el mismo temario, puesto a prueba.",
      },
      {
        ruta: "/academia/tarjetas",
        nombre: "Las tarjetas de estudio",
        papel: "Repaso espaciado de los conceptos duros: la memoria a corto plazo tiene su puerta.",
      },
      {
        ruta: "/academia/glosario",
        nombre: "El glosario",
        papel: "El vocabulario técnico por disciplina, para no fingir que se entiende una palabra.",
      },
      {
        ruta: "/academia/certificados",
        nombre: "Los certificados",
        papel: "La acreditación con código único verificable y las competencias que declara.",
      },
      {
        ruta: "/academia/historial",
        nombre: "El historial",
        papel: "Tus lecciones completadas y tu racha, guardados en tu aparato y exportables.",
      },
      {
        ruta: "/conocimiento",
        nombre: "El conocimiento",
        papel: "La puerta del fondo: el mismo temario, pero como lectura, no como curso.",
      },
      {
        ruta: "/conocimiento/aprender",
        nombre: "Aprender",
        papel: "El puente entre las dos: lo que se lee convertido en lo que se practica.",
      },
      {
        ruta: "/conocimiento/enciclopedia",
        nombre: "La enciclopedia",
        papel: "Artículos de fondo sobre continentes, países, civilizaciones, culturas y naturaleza.",
      },
      {
        ruta: "/conocimiento/enciclopedia/buscar",
        nombre: "Buscar en la enciclopedia",
        papel: "La única caja de la casa que busca texto largo y no puertas.",
      },
    ],
    motivo:
      "La Academia pone el orden (curso, ruta, ejercicio, tarjeta, certificado) y la Enciclopedia pone el fondo. Es la misma escuela: una pone el plan y la otra el texto, y hasta ahora nadie las había declarado juntas.",
    cifra: "12 puertas · 10 disciplinas",
  },
  {
    id: "familia-ciencia",
    pregunta: "¿Qué se ha medido y cómo lo sabemos?",
    canonico: {
      ruta: "/ciencia",
      nombre: "Science Frontier",
      papel:
        "El índice de publicaciones con enlace al artículo original, filtros por disciplina y nivel de evidencia declarado.",
    },
    piezas: [
      {
        ruta: "/ciencia/buscar",
        nombre: "El buscador de publicaciones",
        papel: "Por tema, autor, revista o identificador, con filtro por tipo editorial.",
      },
      {
        ruta: "/ciencia/biblioteca",
        nombre: "La biblioteca científica",
        papel: "Cinco estanterías curadas y la tuya propia: lo leído se guarda.",
      },
      {
        ruta: "/ciencia/cronologia",
        nombre: "La cronología",
        papel: "De 1896 a hoy: publicaciones, prepublicaciones, revisiones, premios e hitos.",
      },
      {
        ruta: "/ciencia/explorador",
        nombre: "El explorador",
        papel: "Una idea seguida paso a paso: de la pregunta a la medición y a lo que se descartó.",
      },
      {
        ruta: "/ciencia/experimentos",
        nombre: "Los experimentos históricos",
        papel: "Interferómetros, testigos de hielo y ensayos aleatorizados: qué pregunta respondió cada uno.",
      },
      {
        ruta: "/ciencia/instituciones",
        nombre: "Las instituciones",
        papel: "Laboratorios, observatorios, agencias e institutos del índice, con su sitio oficial.",
      },
      {
        ruta: "/ciencia/premios",
        nombre: "Los premios",
        papel: "Nobel del índice con la motivación oficial literal, no el resumen de nadie.",
      },
      {
        ruta: "/ciencia/tecnologia",
        nombre: "La tecnología",
        papel: "Interferometría, óptica criogénica, fotometría de tránsito: el instrumento detrás del dato.",
      },
      {
        ruta: "/ciencia/metodo",
        nombre: "El método",
        papel: "Cómo se construye el índice: fuentes, clasificación editorial y límites declarados.",
      },
    ],
    motivo:
      "Nueve puertas al mismo índice. Buscar, leer, situar en el tiempo, ver el instrumento y declarar la procedencia son partes de una sola pieza: la casa no publica ciencia sin decir de dónde sale.",
    cifra: "10 puertas · 1 índice con fuente",
  },
  {
    id: "familia-voz",
    pregunta: "¿Quién me lo cuenta en voz alta?",
    canonico: {
      ruta: "/radio",
      nombre: "Radio Vanguard",
      papel:
        "Un programa editado con los cables reales del día: pausas que se oyen, subtítulos y una conversación con el oyente.",
    },
    piezas: [
      {
        ruta: "/audios",
        nombre: "La emisora de guerra",
        papel: "El parte completo narrado: teatros, cables y contexto, para escuchar sin mirar.",
      },
      {
        ruta: "/voz",
        nombre: "La voz maestra",
        papel: "Cuatro personas con respiración real que explican la casa y responden preguntas.",
      },
      {
        ruta: "/musica",
        nombre: "La música",
        papel: "El himno, las piezas originales con forma A-B-A y la música militar sintetizada.",
      },
      {
        ruta: "/galeria",
        nombre: "La galería",
        papel: "Cincuenta fotografías reales del planeta, servidas desde la casa y no desde fuera.",
      },
      {
        ruta: "/cronica",
        nombre: "La crónica del día",
        papel: "El mismo parte, escrito: quién habló en 24 horas y quién firmó, derivado del archivo real.",
      },
      {
        ruta: "/trailer",
        nombre: "El tráiler",
        papel: "La casa explicada en ochenta segundos: para el que no va a leer nada todavía.",
      },
    ],
    motivo:
      "La misma redacción en cuatro formatos: texto escrito, voz leída, música de la casa y fotografía real. El cronista, el locutor y el fotógrafo trabajan sobre el mismo archivo; sólo cambia el canal.",
    cifra: "7 puertas · texto, voz, música y foto",
  },
  {
    id: "familia-motores",
    pregunta: "¿Con qué se calcula lo que la casa afirma?",
    canonico: {
      ruta: "/motores",
      nombre: "Motores y algoritmos",
      papel:
        "Un laboratorio analítico con las fórmulas a la vista: Lanchester, Kahn, Lotka-Volterra, Nelson-Siegel y DBSCAN.",
    },
    piezas: [
      {
        ruta: "/motores/lanchester",
        nombre: "Lanchester",
        papel: "La atrición bélica calculada: superioridad de fuego lineal y cuadrática, con sus variables.",
      },
      {
        ruta: "/motores/escalada",
        nombre: "La escala de Kahn",
        papel: "Los cuarenta y cuatro peldaños de la escalada estratégica, con sus umbrales.",
      },
      {
        ruta: "/motores/disuasion",
        nombre: "Disuasión y Lotka-Volterra",
        papel: "Carreras armamentistas y equilibrio como dos especies que compiten. Se ve el modelo, no el titular.",
      },
      {
        ruta: "/motores/dbscan",
        nombre: "Clustering espacial",
        papel: "Densidad para detectar frentes: qué puntos se agrupan solos y por qué eso es una zona caliente.",
      },
      {
        ruta: "/motores/curva-rendimiento",
        nombre: "La curva de deuda",
        papel: "Nelson-Siegel sobre tipos soberanos: la estructura temporal y la alerta de recesión.",
      },
      {
        ruta: "/motores/censo",
        nombre: "El censo de plataformas",
        papel: "Cien plataformas de inteligencia y OSINT comparadas, para saber de dónde se puede tirar.",
      },
      {
        ruta: "/labs",
        nombre: "Los quince simuladores",
        papel: "Economía, sociedad, geografía y sistemas complejos: variables que se mueven a mano.",
      },
      {
        ruta: "/arquitectura",
        nombre: "La arquitectura y sus nexos",
        papel: "El censo del árbol y el motor de nexos: cómo se conecta lo que existe, departamento por departamento.",
      },
    ],
    motivo:
      "Un motor por pregunta, no un cajón de fórmulas. Están juntos porque comparten lo mismo: variable de entrada visible, cálculo declarado y resultado que se puede discutir. Antes vivían repartidos en tres módulos sin enlace entre ellos.",
    cifra: "9 puertas · 15 simuladores · 6 modelos",
  },
  {
    id: "familia-tierra",
    pregunta: "¿Cómo está el planeta por dentro, más allá de sus fronteras?",
    canonico: {
      ruta: "/tierra",
      nombre: "Earth System",
      papel:
        "El planeta capa por capa: globo 3D y atlas 2D con regiones, relieve, ríos y las capas que se encienden.",
    },
    piezas: [
      {
        ruta: "/worlds",
        nombre: "Los cinco mundos",
        papel: "América, Europa, África, Asia y Oceanía como zonas reales, no como secciones de menú.",
      },
      {
        ruta: "/datos-mundiales",
        nombre: "Los datos mundiales",
        papel: "Cincuenta y dos indicadores de doscientos países, cada uno con su fuente y su año.",
      },
      {
        ruta: "/datos-mundiales/panel",
        nombre: "El panel de desarrollo",
        papel: "La trayectoria del mundo y sus regiones en series largas, con los agregados oficiales.",
      },
      {
        ruta: "/datos-mundiales/comparar",
        nombre: "El comparador",
        papel: "Hasta seis indicadores frente a frente con su serie histórica, no una foto del año pasado.",
      },
      {
        ruta: "/datos-mundiales/pais/do",
        nombre: "La ficha de datos de un país",
        papel: "El indicador por país, con su año y su fuente: la puerta larga del mismo censo.",
      },
      {
        ruta: "/infraestructura",
        nombre: "El atlas de infraestructura",
        papel: "Aeropuertos, puertos, puentes, presas y grandes obras: el territorio construido.",
      },
      {
        ruta: "/infraestructura/explorador",
        nombre: "El explorador de infraestructura",
        papel: "Lo mismo por transporte, energía y arquitectura, para ir por sistema y no por país.",
      },
      {
        ruta: "/infraestructura/gran-obra",
        nombre: "Las grandes obras",
        papel: "Las obras icónicas de la ingeniería civil, con su ficha y su ubicación.",
      },
      {
        ruta: "/pulso-mundial",
        nombre: "World Pulse",
        papel: "Economía, sociedad y clima por país sobre los datos del Banco Mundial, en una sola pantalla.",
      },
    ],
    motivo:
      "La geografía física, los indicadores y lo construido son tres capas del mismo territorio, y estaban en tres módulos que no se hablaban. La familia no las fusiona: declara que /tierra es la puerta y que las otras ocho son la misma Tierra medida de otra forma.",
    cifra: "10 puertas · 52 indicadores · 200 países",
  },
  {
    id: "familia-vigilancia",
    pregunta: "¿Qué vigilo y qué me avisa?",
    canonico: {
      ruta: "/centinela",
      nombre: "El centinela",
      papel:
        "Pones bajo vigilancia un teatro o un medio y la casa te dice cuánto habló en veinticuatro horas y cuándo fue la última vez.",
    },
    piezas: [
      {
        ruta: "/cruce",
        nombre: "El cruce",
        papel: "Sismos y alertas ordenados por distancia real a tu casa, en kilómetros calculados aquí.",
      },
      {
        ruta: "/verdad-cruda",
        nombre: "Verdad cruda",
        papel: "Los abusos de guerra documentados, cada uno con su fuente citada y su fecha.",
      },
      {
        ruta: "/resiliencia",
        nombre: "Resiliencia civil",
        papel: "La preparación comunitaria evaluada por categorías, como material educativo y no como pronóstico.",
      },
      {
        ruta: "/resiliencia/evaluacion",
        nombre: "La evaluación",
        papel: "El cuestionario largo: qué tienes previsto y qué te falta, sin nota ni carné.",
      },
      {
        ruta: "/escudo",
        nombre: "El escudo",
        papel: "El buscador de llaves: vigila que ningún secreto se publique en el código de la casa.",
      },
      {
        ruta: "/escudo/detector",
        nombre: "El detector de bolsillo",
        papel: "Lo mismo sobre lo tuyo, en tu navegador y sin enviar nada a ningún servidor.",
      },
    ],
    motivo:
      "Cuatro clases de aviso y una herramienta que los vigila: lo que se acerca a tu casa, lo que se documenta como abuso, lo que hay que tener previsto y lo que no debe salir publicado. Comparten la misma lógica —un umbral, un aviso, una fuente— y hasta ahora estaban en cuatro módulos distintos.",
    cifra: "7 puertas · 4 clases de aviso",
  },
  {
    id: "familia-archivo",
    pregunta: "¿De dónde sale lo que la casa afirma?",
    canonico: {
      ruta: "/memoria",
      nombre: "El archivo de la memoria",
      papel:
        "Documentos originales, fotografías y mapas históricos con procedencia y derechos declarados, no copias sin dueño.",
    },
    piezas: [
      {
        ruta: "/memoria/buscar",
        nombre: "Buscar en el archivo",
        papel: "Tres instituciones a la vez —Library of Congress, Internet Archive y Wikimedia— con filtros de fecha.",
      },
      {
        ruta: "/memoria/comparar",
        nombre: "Comparar dos piezas",
        papel: "Metadatos, fecha, autoría, institución y derechos de dos documentos, con las dos imágenes al lado.",
      },
      {
        ruta: "/memoria/fuentes",
        nombre: "Las fuentes",
        papel: "Qué institución sostiene el archivo y con qué licencia publica cada pieza.",
      },
      {
        ruta: "/historia",
        nombre: "El archivo de la historia",
        papel: "De las Guerras Púnicas a la Guerra Fría: diez guerras que enseñan a leer las de hoy.",
      },
      {
        ruta: "/inteligencia",
        nombre: "La cámara de inteligencia",
        papel: "Preguntar, elegir fuentes y guardar el rastro: la investigación como procedimiento, no como opinión.",
      },
      {
        ruta: "/investigacion",
        nombre: "La investigación sistémica",
        papel: "El método largo: descubrir, comprender, comparar y simular un tema con sus conexiones.",
      },
      {
        ruta: "/organizaciones/redes",
        nombre: "Las redes de organizaciones",
        papel: "Quién está con quién: los vínculos entre organismos, alianzas y agencias.",
      },
      {
        ruta: "/servicios",
        nombre: "Los servicios",
        papel: "Treinta y seis expedientes de la inteligencia mundial, de la comunidad de EE. UU. a la red europea.",
      },
    ],
    motivo:
      "El archivo no es un adorno: es la prueba. Búsqueda en tres instituciones, comparación de dos piezas, ficha de quién publica cada cosa y el método con el que se investiga. Sin esta familia, la casa afirma cosas sin poder mostrar el papel.",
    cifra: "9 puertas · 3 instituciones · derechos declarados",
  },
] as FamiliaModulos[];

/** Todas las rutas declaradas en las familias (para las pruebas). */
export function rutasDeFamilias(): string[] {
  const rutas: string[] = [];
  for (const f of FAMILIAS_MODULO) {
    rutas.push(f.canonico.ruta);
    for (const p of f.piezas) rutas.push(p.ruta);
  }
  return [...new Set(rutas)];
}

/** La familia a la que pertenece una ruta (o null si vive sola). */
export function familiaDeRuta(ruta: string): FamiliaModulos | null {
  return (
    FAMILIAS_MODULO.find(
      (f) => f.canonico.ruta === ruta || f.piezas.some((p) => p.ruta === ruta)
    ) ?? null
  );
}

/** Las familias de las que forma parte un módulo del censo (por su ruta). */
export function familiasDeModulo(ruta: string): FamiliaModulos[] {
  return FAMILIAS_MODULO.filter(
    (f) => f.canonico.ruta === ruta || f.piezas.some((p) => p.ruta === ruta)
  );
}
