// ══════════════════════════════════════════════════════════════════════
// v365.0 LA ARMERÍA DEL MUNDO — LA ESTANTERÍA ARSENAL
// Mandato del Dueño: «no solo armas nucleares, si no todas las armas
// posibles» en la biblioteca. Esta estantería es el ARCHIVO ESCOLAR de las
// armas: programas, sistemas, reglas y defensas que cambiaron el tablero
// geopolítico — de la pólvora al enjambre de drones.
//
//   · LA REGLA DE HONESTIDAD (publicada): el arsenal enseña HISTORIA y
//     CONTROL de armas — qué fue, cuándo fue, por qué cambió el mundo y
//     cómo el mundo intentó controlar la familia. Es un archivo escolar:
//     enseña CONSECUENCIAS, no recetas. Aquí no hay manuales de fabricación
//     — eso no es historia, es delito — y la ficha lo confiesa en su pie.
//   · FAMILIAS — NUCLEAR, QUÍMICA, BIOLÓGICA, BLINDADA, AÉREA, NAVAL,
//     MISILES, DRONES, CIBERNÉTICA. Las reglas de control (CWC, BWC, TNP…)
//     también son piezas de la estantería: el límite forma parte del arma.
//   · CLASES — PROGRAMA (el esfuerzo de un país), SISTEMA (el hierro),
//     ARMA (el uso que hizo época), REGLA (el tratado que la cercó),
//     DEFENSA (el escudo que la responde).
//   · SANITY en la propia fuente (ley v364): dossier sin resumen o sin
//     «por qué cambió el mundo» → error. Año fuera de rango → error.
//   · EL EXAMEN gira con esta estantería: pregunta [6] derivada del
//     ARSENAL — cero datos inventados.
// ══════════════════════════════════════════════════════════════════════

export type FamiliaArma =
  | "NUCLEAR" | "QUÍMICA" | "BIOLÓGICA" | "BLINDADA" | "AÉREA"
  | "NAVAL" | "MISILES" | "DRONES" | "CIBERNÉTICA";

export const FAMILIAS_ARMAS: FamiliaArma[] = [
  "NUCLEAR", "QUÍMICA", "BIOLÓGICA", "BLINDADA", "AÉREA",
  "NAVAL", "MISILES", "DRONES", "CIBERNÉTICA",
];

export type ClaseArma = "PROGRAMA" | "SISTEMA" | "ARMA" | "REGLA" | "DEFENSA";
export const CLASES_ARMAS: ClaseArma[] = ["PROGRAMA", "SISTEMA", "ARMA", "REGLA", "DEFENSA"];

export interface PiezaArma {
  id: string;             // "ars:manhattan"
  nombre: string;         // "Proyecto Manhattan"
  familia: FamiliaArma;
  clase: ClaseArma;
  año: number;            // año del hito fundacional
  resumen: string;        // qué fue, en dos frases
  comoCambioElMundo: string; // la consecuencia geopolítica
  dato?: string;          // el dato para el examen
  nota?: string;          // honestidad: la sombra de la pieza se confiesa
}

export const ARSENAL: PiezaArma[] = [
  // ─── NUCLEAR ────────────────────────────────────────────────────
  { id: "ars:manhattan", nombre: "Proyecto Manhattan", familia: "NUCLEAR", clase: "PROGRAMA", año: 1942,
    resumen: "El programa secreto de EE. UU. y Reino Unido que produjo las primeras armas nucleares: laboratorios en Los Álamos, enriquecimiento en Oak Ridge y reactores en Hanford, con más de 130.000 personas trabajando bajo sello.",
    comoCambioElMundo: "Inauguró la era nuclear: la ciencia dejó de ser neutral y se volvió asunto de Estado. Todo el régimen de no proliferación (el TNP, el OIEA) nace para responder a este proyecto.",
    dato: "El director científico fue J. Robert Oppenheimer; el director militar, el general Leslie Groves.",
    nota: "La física que enseña aquí es la historia de su uso y control — el cómo técnico de cada arma vive clasificado y no es material escolar." },
  { id: "ars:hiroshima", nombre: "Little Boy y Fat Man", familia: "NUCLEAR", clase: "ARMA", año: 1945,
    resumen: "Las únicas armas nucleares usadas en combate: Little Boy (uranio) sobre Hiroshima el 6 de agosto de 1945 y Fat Man (plutonio) sobre Nagasaki el 9. Japón capituló el 15.",
    comoCambioElMundo: "El mundo vio lo que una sola bomba hace a una ciudad. Desde entonces, la disuasión — y el terror — gobiernan las relaciones entre grandes potencias.",
    dato: "Las estimaciones de víctimas rondan entre 110.000 y 210.000 muertos al final de 1945 — varían por fuente, y la ficha no las fija.",
    nota: "Las cifras exactas siguen en disputa historiográfica; lo que no está en disputa es el precedente." },
  { id: "ars:sovietico", nombre: "Proyecto atómico soviético (RDS-1)", familia: "NUCLEAR", clase: "PROGRAMA", año: 1949,
    resumen: "La URSS detonó «First Lightning» en el polígono de Semipalatinsk y rompió el monopolio nuclear americano, combinando su propio esfuerzo (Kurchatov) con información de espionaje (Klaus Fuchs).",
    comoCambioElMundo: "Arrancó la carrera armamentista: dos bloques con bombas es la geometría exacta de la Guerra Fría.",
    dato: "El polígono de Semipalatinsk (Kazajistán) sufrió 456 pruebas soviéticas entre 1949 y 1989." },
  { id: "ars:tsarbomba", nombre: "Tsar Bomba (RDS-220)", familia: "NUCLEAR", clase: "ARMA", año: 1961,
    resumen: "La explosión más grande de la historia: la URSS probó en Novaya Zemlya una bomba de ~50 megatones, más de tres mil veces Hiroshima; el hongo subió ~60 km y la onda dio tres vueltas al planeta.",
    comoCambioElMundo: "Marcó el techo del absurdo: ni la propia URSS la desplegó jamás. El escándalo empujó los primeros tratados de límites (parcial, 1963).",
    dato: "Se redujo de 100 a 50 megatones para no envenenar media URSS con la lluvia radiactiva." },
  { id: "ars:596", nombre: "Programa 596 de China", familia: "NUCLEAR", clase: "PROGRAMA", año: 1964,
    resumen: "China detonó su primera bomba en el polígono de Lop Nor tras romper con Moscú — el proyecto llevó el nombre del día en que la URSS retiró a sus asesores (junio de 1959).",
    comoCambioElMundo: "Pekín entró al club nuclear por la puerta del TNP: China probó en 1964 y firma el tratado en 1992, ya consumado el hecho.",
    dato: "Lop Nor hoy es uno de los sitios más vigilados por satélite del planeta." },
  { id: "ars:dimona", nombre: "El reactor de Dimona", familia: "NUCLEAR", clase: "PROGRAMA", año: 1958,
    resumen: "Israel construyó en el desierto del Néguev, con Francia, el reactor que sostiene su capacidad nuclear desde los años sesenta.",
    comoCambioElMundo: "Consolidó la política de «ambigüedad nuclear»: Israel ni confirma ni niega — y esa sombra equilibra (y desequilibra) Oriente Medio desde hace medio siglo.",
    dato: "Mordejái Vanunu, técnico de Dimona, entregó imágenes al Sunday Times en 1986 y pagó con 18 años de cárcel.",
    nota: "Israel nunca ha confirmado el arsenal — esta ficha registra política pública, no afirmaciones." },
  { id: "ars:surasiatico", nombre: "Pokhran y Chagai", familia: "NUCLEAR", clase: "PROGRAMA", año: 1998,
    resumen: "India probó en Pokhran (primera vez 1974, ronda abierta en mayo de 1998) y Pakistán respondió en Chagai días después: dos rivales, dos arsenales, sin firmar el TNP.",
    comoCambioElMundo: "Llevó la disuasión a la región más tensa del mundo — Cachemira con fondo nuclear — y desnudó los límites del régimen de no proliferación.",
    dato: "La prueba india de 1994-98 tardó años en esconderse de los satélites; en 1998 EE. UU. no la vio venir." },
  { id: "ars:dprk", nombre: "El programa de Corea del Norte", familia: "NUCLEAR", clase: "PROGRAMA", año: 2006,
    resumen: "Pionyang se retiró del TNP (2003) y detona su primera arma en 2006; desde entonces seis pruebas y un arsenal declarado que apunta a misiles capaces de llegar a EE. UU.",
    comoCambioElMundo: "El segundo país en salir del tratado y el único que lo hizo probando: la sanción más dura del mundo convive con el club de hecho.",
    dato: "Las pruebas de 2017 (de ~100-250 kt) multiplicaron por diez la potencia de las primeras." },
  // ─── QUÍMICA ────────────────────────────────────────────────────
  { id: "ars:ypres", nombre: "Ypres y la guerra química", familia: "QUÍMICA", clase: "ARMA", año: 1915,
    resumen: "El 22 de abril de 1915, en Ypres, Alemania liberó 168 toneladas de cloro sobre las trincheras aliadas: nació la guerra química industrial (cloro, fosgeno, mostaza).",
    comoCambioElMundo: "El horror de los gases produjo el Protocolo de Ginebra (1925): la primera prohibición moderna de una familia entera de armas.",
    dato: "Un cruce de vientos podía devolver la nube al que la lanzó — la química no distingue banderas.",
    nota: "Las víctimas de la Primera Guerra por gas se estiman ~90.000 muertos y un millón de heridos." },
  { id: "ars:nervinos", nombre: "Sarín y Novichok", familia: "QUÍMICA", clase: "ARMA", año: 1938,
    resumen: "Los nervinos: de la alemana tabun/sarín (1938) al programa soviético Novichok (años setenta-ochenta). Usados en Matsumoto y el metro de Tokio (Aum), en la guerra de Siria (documentado por la OPCW) y en los casos Skripal y Navalni.",
    comoCambioElMundo: "Demostraron que el arma química sobrevivió a su tratado: miligramos frente a un individuo bastan para un escándalo de Estado.",
    dato: "El Novichok se diseñó para esquivar la inspección del CWC — el tratado mordido por diseño.",
    nota: "Los usos de nervinos están documentados por la OPCW y por investigaciones nacionales; los mandatos se discuten en cortes." },
  { id: "ars:naranja", nombre: "Agente Naranja", familia: "QUÍMICA", clase: "ARMA", año: 1961,
    resumen: "El defoliante que EE. UU. roció sobre Vietnam (~72 millones de litros) para desnudar la selva y descubrir el enemigo; la dioxina que llevaba quedó en el suelo y en la sangre.",
    comoCambioElMundo: "Forzó el debate sobre el ambiente como víctima de la guerra — y sobre dónde termina la línea entre herbicida y arma.",
    dato: "Vietnam reclama millones de afectados por la dioxina; los juicios y las reparaciones siguen abiertos.",
    nota: "Su clasificación (¿arma química o herbicida?) sigue siendo disputa legal — la ficha no la cierra." },
  { id: "ars:cwc", nombre: "Convención de Armas Químicas (CWC)", familia: "QUÍMICA", clase: "REGLA", año: 1993,
    resumen: "El tratado que prohíbe desarrollar, producir, almacenar y usar armas químicas, con la OPCW como inspección permanente: 193 Estados parte y los arsenales declarados destruidos en plazos.",
    comoCambioElMundo: "La familia química es la única con prohibición total Y verificación industrial — el estándar al que la biológica todavía no llega.",
    dato: "La OPCW ganó el Nobel de la Paz 2013 por la misión que desmontó el arsenal químico de Siria." },
  // ─── BIOLÓGICA ──────────────────────────────────────────────────
  { id: "ars:unit731", nombre: "Unidad 731", familia: "BIOLÓGICA", clase: "PROGRAMA", año: 1936,
    resumen: "El programa japonés de guerra biológica en Harbin: experimentos con peste, ántrax y cólera sobre prisioneros, y ensayos de dispersión en China.",
    comoCambioElMundo: "El crimen biomédico de Estado más documentado — y su impunidad pactada (los datos a cambio del silencio) enseñó qué cuesta negociar con el archivo del horror.",
    dato: "Los líderes de la unidad escaparon al juicio de Tokio a cambio de sus resultados con los militares de EE. UU.",
    nota: "La impunidad es parte de la historia: la ficha no la esconde." },
  { id: "ars:viruela", nombre: "La viruela como arma colonial", familia: "BIOLÓGICA", clase: "ARMA", año: 1763,
    resumen: "El precedente más antiguo documentado: en 1763, durante la rebelión de Pontiac, hay actas de entrega de mantas de pacientes de viruela a poblaciones nativas en Fort Pitt.",
    comoCambioElMundo: "Marcó el piso de la ética biológica: la enfermedad como arma se discute desde antes de saber qué era un microbio.",
    dato: "La carta de Amherst (1763) es el documento más citado — y también el más debatido por los historiadores.",
    nota: "El alcance real del episodio es disputa historiográfica; la ficha firma el documento, no la leyenda." },
  { id: "ars:antrax", nombre: "Las cartas con ántrax", familia: "BIOLÓGICA", clase: "ARMA", año: 2001,
    resumen: "Una semana después del 11-S, sobres con esporas de Bacillus anthracis mataron a 5 personas en EE. UU. y cerraron el Senado: el bioterrorismo doméstico (caso Amerithrax).",
    comoCambioElMundo: "Cambió el mapa del riesgo biológico: el enemigo no era un Estado sino un sobre — y la bioseguridad de los laboratorios se volvió ley.",
    dato: "El FBI cerró el caso en 2008 apuntando a un científico de Fort Detrick, que murió antes del proceso." },
  { id: "ars:bwc", nombre: "Convención de Armas Biológicas (BWC)", familia: "BIOLÓGICA", clase: "REGLA", año: 1972,
    resumen: "El primer tratado que prohíbe una familia entera de armas de destrucción masiva: sin producción ni almacenamiento de agentes biológicos ofensivos, 180+ Estados parte.",
    comoCambioElMundo: "La norma existe, los dientes no: la BWC sigue SIN órgano de verificación (la ficha confiesa la grieta) — la lección comparada frente a la CWC.",
    dato: "Una propuesta de verificación (2001) cayó con la salida de EE. UU. del protocolo negociado." },
  // ─── BLINDADA ───────────────────────────────────────────────────
  { id: "ars:t34", nombre: "T-34", familia: "BLINDADA", clase: "SISTEMA", año: 1940,
    resumen: "El tanque soviético de blindaje inclinado, motor diésel y diseño manufacturable que aguantó a la Wehrmacht en Moscú, Stalingrado y Kursk.",
    comoCambioElMundo: "Enseñó la lección industrial del siglo: en la guerra de largo aliento gana la fábrica, no el taller de precisión — 50.000+ unidades.",
    dato: "Fue el tanque más producido de la Segunda Guerra Mundial y su diseño influyó en los MBT hasta hoy." },
  { id: "ars:tiger", nombre: "Tiger I", familia: "BLINDADA", clase: "SISTEMA", año: 1942,
    resumen: "El tanque pesado alemán con su cañón de 88 mm: letal en duelo, pesadilla en mantenimiento, ~1.350 unidades frente a las decenas de miles aliadas.",
    comoCambioElMundo: "La contrafigura del T-34: la lección logística de que el mejor hierro no gana si no puede salir del taller.",
    dato: "Casi cada Tiger capturado se estudió en Moscú, Detroit y Kubinka — el duelo de escuelas de diseño." },
  { id: "ars:abrams", nombre: "M1 Abrams", familia: "BLINDADA", clase: "SISTEMA", año: 1980,
    resumen: "El MBT americano de turbina y blindaje compuesto que barrió en la Guerra del Golfo (1991) y estandarizó la doctrina occidental de superioridad técnica.",
    comoCambioElMundo: "Su demostración de 100 horas consolidó «la guerra de precisión» como marca de la superpotencia — y como imagen exportada a medio mundo.",
    dato: "La turbina de gas le permite beber combustible de casi cualquier cosa — a cambio de un consumo brutal." },
  { id: "ars:leopard", nombre: "Leopard 2", familia: "BLINDADA", clase: "SISTEMA", año: 1979,
    resumen: "El MBT estándar europeo (Alemania, fabricado en líneas de varios países), protagonista del rearme continental desde 2022.",
    comoCambioElMundo: "En 2023, autorizar o no enviar Leopards a Ucrania se volvió decisión geopolítica de coalición: el tanque como permiso político.",
    dato: "Más de 3.000 unidades en ~20 ejércitos — el blindado con más banderas de Europa." },
  { id: "ars:rpg7", nombre: "RPG-7", familia: "BLINDADA", clase: "SISTEMA", año: 1961,
    resumen: "El lanzagranadas soviético barato y sin partes sensibles que combate en casi cada conflicto desde Vietnam hasta hoy.",
    comoCambioElMundo: "La asimetría clásica: unos cientos de dólares contra millones de blindado — desde el Mogadishu de 1993 hasta el Sahel.",
    dato: "Se fabrica y copia en más de una decena de países; su ficha de mantenimiento cabe en una cartilla." },
  // ─── AÉREA ──────────────────────────────────────────────────────
  { id: "ars:spitfire", nombre: "Spitfire y la Batalla de Inglaterra", familia: "AÉREA", clase: "SISTEMA", año: 1938,
    resumen: "El caza británico que, con el Hurricane y la red de radar, sostuvo la primera defensa aérea que detuvo a una Luftwaffe en campaña (1940).",
    comoCambioElMundo: "Probó que una isla podía defender el cielo con interceptores e información — el radar, no solo el avión, ganó la batalla.",
    dato: "El sistema Dowding (radar + observadores + control) es el abuelo de todo el mando aéreo moderno." },
  { id: "ars:b29", nombre: "B-29 Superfortress", familia: "AÉREA", clase: "SISTEMA", año: 1944,
    resumen: "El bombardero estratégico presurizado de largo alcance que quemó Tokio (marzo de 1945) y llevó Little Boy y Fat Man a sus objetivos.",
    comoCambioElMundo: "Fundó el bombardero como plataforma de disuasión — la primera pata del triángulo nuclear (bombardeo, misiles, submarinos).",
    dato: "El programa B-29 costó más que el propio Proyecto Manhattan." },
  { id: "ars:f16", nombre: "F-16 Fighting Falcon", familia: "AÉREA", clase: "SISTEMA", año: 1978,
    resumen: "El caza ligero multimisión con más de 4.500 unidades y dos decenas de usuarios: la exportación aérea americana por excelencia.",
    comoCambioElMundo: "Vender F-16 fue siempre política exterior: de la paz de Camp David (Egipto e Israel) a los entrenamientos con Ucrania (2024) — el caza como moneda de alianza.",
    dato: "Su mandato de control por cables (fly-by-wire) hizo posible un diseño inestable y ágil a propósito." },
  { id: "ars:f35", nombre: "F-35 Lightning II", familia: "AÉREA", clase: "SISTEMA", año: 2006,
    resumen: "El programa de caza furtivo más caro de la historia: una familia de tres variantes, socios de desarrollo y una cadena industrial global.",
    comoCambioElMundo: "Convertir al caza en proyecto geopolítico compartido: quien compra F-35 compra pertenencia a la alianza — y dependencia de software.",
    dato: "Costó ~1,7 billones de dólares estimados a ciclo de vida completo — más que el PIB de varios G20." },
  { id: "ars:su27", nombre: "Su-27 Flanker", familia: "AÉREA", clase: "SISTEMA", año: 1984,
    resumen: "La respuesta soviética al F-15: gran alcance, maniobra extrema y una familia (Su-30/33/34/35, el chino J-11/J-16) que domina el catálogo eurasático.",
    comoCambioElMundo: "El Flanker desplazó el eje de los exportadores: India, China y el Sudeste Asiático volaron la bandera técnica de Moscú y Pekín.",
    dato: "La maniobra Cobra de Pugachev (1989) la popularizó ante la cámara en Farnborough." },
  // ─── NAVAL ──────────────────────────────────────────────────────
  { id: "ars:yamato", nombre: "Yamato", familia: "NAVAL", clase: "SISTEMA", año: 1941,
    resumen: "El acorazado más grande jamás construido (72.000 t, cañones de 460 mm), hundido por aviones americanos en abril de 1945 casi sin haber librado batalla decisiva.",
    comoCambioElMundo: "Enterró la era de los acorazados: desde entonces el portaaviones manda el mar — la muerte de una era registrada en una sola hundición.",
    dato: "Su flota de escolta era de ~10 barcos; los atacantes, casi 400 aviones." },
  { id: "ars:nimitz", nombre: "Los superportaaviones (Nimitz → Ford)", familia: "NAVAL", clase: "SISTEMA", año: 1975,
    resumen: "De la clase Nimitz a la Gerald R. Ford: 100.000 toneladas, ~75 aviones y una base militar flotante que ningún otro país mantiene en escala.",
    comoCambioElMundo: "«4,5 acres de soberanía»: la proyección de poder americana desde 1945 se explica con estos barcos — y sus despliegues son los avisos de cada crisis.",
    dato: "Un portaaviones lleva ~5.000 personas — una ciudad con pistola de vuelo." },
  { id: "ars:ohio", nombre: "Los submarinos balísticos (Ohio, Borei)", familia: "NAVAL", clase: "SISTEMA", año: 1981,
    resumen: "La pata submarina del triángulo nuclear: SLBM a bordo, meses de patrulla y sin dirección fija — la represalia que ningún primer golpe puede borrar.",
    comoCambioElMundo: "Con los boomers en el fondo del mar, la disuasión dejó de depender del aviso: es la razón técnica de que el MAD sobreviva.",
    dato: "Un submarino clase Ohio lleva hasta 20 misiles Trident II — cada uno con varias cabezas independientes." },
  { id: "ars:fujian", nombre: "El programa de portaaviones chino", familia: "NAVAL", clase: "SISTEMA", año: 2012,
    resumen: "De la reacondicionada Liaoning (2012) al Fujian con catapulta electromagnética (2022): China construyó en una década la tercera flota de portaaviones del mundo.",
    comoCambioElMundo: "El golfo de Taiwán y las rutas del Mar del Sur dejaron de ser solo asunto americano: la paridad naval es el proyecto de Pekín para 2035.",
    dato: "El Shandong (2019) fue el primero construido íntegramente en China; el Fujian dejó el salto de esquí." },
  // ─── MISILES ────────────────────────────────────────────────────
  { id: "ars:v2", nombre: "La V-2 de Peenemünde", familia: "MISILES", clase: "SISTEMA", año: 1944,
    resumen: "El primer misil balístico guiado de la historia, disparado por la Alemania nazi sobre Londres y Amberes desde septiembre de 1944: imposible de interceptar entonces.",
    comoCambioElMundo: "Nació el cohete moderno — y con él su sombra: fue construido por trabajadores esclavos del Mittelbau-Dora, y sus ingenieros acabaron en los programas americano y soviético.",
    dato: "Más trabajadores murieron fabricando la V-2 (~12.000) que civiles bajo sus impactos.",
    nota: "La ficha firma la cifra: el arma fundacional del cohete es también un crimen de trabajo esclavo." },
  { id: "ars:icbm", nombre: "Los ICBM (Minuteman, R-36)", familia: "MISILES", clase: "SISTEMA", año: 1962,
    resumen: "Los misiles intercontinentales en silos y trenes: alerta permanente, decisión en minutos y dos arsenales que miran por encima del Ártico.",
    comoCambioElMundo: "Acortaron la toma de decisión estratégica a media hora — por eso existen los teléfonos rojos, los tratados de límites y el reloj del Juicio Final.",
    dato: "El R-36 soviético (nombre OTAN: «Satan») sigue siendo el ICBM pesado más capaz del mundo." },
  { id: "ars:tomahawk", nombre: "BGM-109 Tomahawk", familia: "MISILES", clase: "SISTEMA", año: 1983,
    resumen: "El crucero de precisión lanzable desde barco o submarino que abrió la Guerra del Golfo (1991) y se volvió el gesto diplomático favorito de las décadas siguientes.",
    comoCambioElMundo: "La «diplomacia por misil»: castigar sin invadir. Cada coalición occidental de los últimos 30 años empezó con una salva de Tomahawk.",
    dato: "Vuelan a alturas de rasante y esquivan terreno — por eso las defensas de área los odian." },
  { id: "ars:himars", nombre: "HIMARS", familia: "MISILES", clase: "SISTEMA", año: 2005,
    resumen: "El lanzador ligero de cohetes guiados que EE. UU. entregó a Ucrania en 2022: precisión a 80 km contra depósitos y mandos detrás del frente.",
    comoCambioElMundo: "Cambió la guerra de Ucrania al obligar a Rusia a mover su logística — y demostró que la ayuda de precisión vale más que el volumen.",
    dato: "Su fama de 2022 nació de destruir puentes de mando a un solo obús guiado por ronda." },
  { id: "ars:sam", nombre: "Patriot y S-400", familia: "MISILES", clase: "DEFENSA", año: 1984,
    resumen: "Los dos grandes sistemas antiaéreos que se venden como alianza: el Patriot americano y el S-400 ruso — Turquía, India y Arabia comprando a los dos lados.",
    comoCambioElMundo: "El cielo se volvió mercado: qué SAM compra un país es hoy el mejor predictor de su alineación estratégica.",
    dato: "La compra del S-400 por Turquía (2017-2019) la expulsó del programa F-35 — un misil que reordenó alianzas." },
  { id: "ars:hipersonico", nombre: "Avangard y Kinzhal", familia: "MISILES", clase: "SISTEMA", año: 2018,
    resumen: "Los vectores «hipersónicos» anunciados por Rusia (planeador Avangard, aerobalistico Kinzhal) y perseguidos por China y EE. UU.: velocidad extrema con maniobra.",
    comoCambioElMundo: "Reabrieron la carrera defensiva: la promesa de esquivar a los escudos existentes empuja nuevos radares, interceptores y tratados por escribir.",
    dato: "El Kinzhal es un Iskander lanzado desde MiG-31 — el anuncio hizo más ruido que el invento.",
    nota: "Los rendimientos exactos son declaraciones estatales con verificación limitada — la ficha confiesa la fuente." },
  // ─── DRONES ─────────────────────────────────────────────────────
  { id: "ars:reaper", nombre: "MQ-9 Reaper", familia: "DRONES", clase: "SISTEMA", año: 2007,
    resumen: "El dron armado americano de larga permanencia: vigilancia de horas y misiles Hellfire bajo control remoto desde otro continente.",
    comoCambioElMundo: "Inventó la guerra remota — y su dilema: el ataque con firma mínima (Solimani, 2020) sin soldado propio en el frente.",
    dato: "Un Reaper vuela ~27 horas seguidas; su piloto baja del turno y va a casa en coche." },
  { id: "ars:bayraktar", nombre: "Bayraktar TB2", familia: "DRONES", clase: "SISTEMA", año: 2018,
    resumen: "El dron turco de Baykar que reordenó los campos de Karabaj (2020) y Ucrania (2022) a un precio que una media potencia puede pagar.",
    comoCambioElMundo: "Demostró que la potencia aérea ya no es monopolio de las grandes: el TB2 se volvió arma y meme — hasta canción — exportado a medio mundo.",
    dato: "Ucrania lo elevó a símbolo nacional en 2022; su video de destrucción de columnas hizo época." },
  { id: "ars:shahed", nombre: "Shahed-136", familia: "DRONES", clase: "SISTEMA", año: 2021,
    resumen: "El dron kamikaze iraní de motor de pistón que Rusia lanza en enjambres sobre ciudades ucranianas: barato, ruidoso y difícil de justificar con interceptores caros.",
    comoCambioElMundo: "Invirtió la asimetría económica de la defensa: el ataque de decenas de miles de dólares fuerza a gastar millones en interceptar — el cálculo que aterra a los planificadores.",
    dato: "Las defensas ucranianas y sus socios respondieron con ametralladoras, móvil y su propia familia de drones." },
  { id: "ars:fpv", nombre: "FPV y el enjambre", familia: "DRONES", clase: "SISTEMA", año: 2022,
    resumen: "Drones de primera persona con cámaras de consumo, cargas improvisadas y una industria artesanal de sótano que ahora mata a escala industrial en Ucrania.",
    comoCambioElMundo: "El frente se volvió tienda de electrónica: la pregunta no es si el tanque sobrevive al enjambre, sino cuánto sobrevive el ejército sin dominio de dron.",
    dato: "El intercambio de drones entre Ucrania y Rusia se mide en cientos de miles de unidades anuales desde 2023." },
  // ─── CIBERNÉTICA ────────────────────────────────────────────────
  { id: "ars:stuxnet", nombre: "Stuxnet", familia: "CIBERNÉTICA", clase: "ARMA", año: 2010,
    resumen: "El gusano que saboteó las centrífugas de Natanz mandándoles órdenes falsas mientras el monitor decía que todo iba bien — el primer arma cibernética confirmada contra infraestructura física.",
    comoCambioElMundo: "El código destruyó hierro: desde entonces el software es campo de batalla y las centrífugas, objetivos con firma digital.",
    dato: "Se propagó por memorias USB y explotó cuatro vulnerabilidades de día cero a la vez.",
    nota: "Ningún país lo reclamó oficialmente; la atribución de prensa apunta a un programa estatal — la ficha no firma nombres." },
  { id: "ars:notpetya", nombre: "NotPetya", familia: "CIBERNÉTICA", clase: "ARMA", año: 2017,
    resumen: "El borrador de discos dirigido a Ucrania que escapó a todo el mundo vía software de gestión: Maersk, Merck, FedEx y ~10.000 millones de dólares en daños.",
    comoCambioElMundo: "El arma «dirigida» que no distingue dirección: enseñó que la guerra cibernética tiene daño colateral global igual que la bomba errada.",
    dato: "La Casa Blanca lo llamó «el ciberataque más costoso de la historia» — y el ransomware aprendió de su éxito." },
  { id: "ars:asat", nombre: "ASAT: antisatélites", familia: "CIBERNÉTICA", clase: "ARMA", año: 2007,
    resumen: "Las pruebas de destrucción de satélites: China (2007), EE. UU. (2008), India (2019), Rusia (2021) — cada una deja una nube de escombros que orbita por décadas.",
    comoCambioElMundo: "El espacio dejó de ser santuario: el satélite que guía el GPS, la banca y el frente es hoy objetivo militar declarado.",
    dato: "La prueba china de 2007 sumó ~3.000 fragmentos rastreables — el mayor desastre de basura espacial de un solo evento.",
    nota: "La ficha agrupa bajo CIBERNÉTICA la guerra orbital de sensores y señal — la familia del espectro." },
  { id: "ars:guerra-electronica", nombre: "Guerra electrónica", familia: "CIBERNÉTICA", clase: "SISTEMA", año: 1943,
    resumen: "De los radares chaff de 1943 al bloqueo de GPS y el atasco de dron que decide hoy el frente ucraniano: el espectro como terreno que se ocupa y se niega.",
    comoCambioElMundo: "La EW es la familia silenciosa: sin explosión ni titular, decide si el misil ve, si el dron vuela y si el mando escucha.",
    dato: "En Ucrania, ambos bandos rotan sistemas de interferencia cada semanas — el frente se mide también en gigahercios." },
];

// sanity de la estantería arsenal (la fuente vigila su propio dato)
for (const a of ARSENAL) {
  if (!a.resumen || !a.comoCambioElMundo) throw new Error(`biblioteca-armas-data: ${a.id} sin resumen`);
  if (a.año < 800 || a.año > 2025) throw new Error(`biblioteca-armas-data: ${a.id} año fuera de rango`);
}
const idsArmas = new Set<string>();
for (const a of ARSENAL) {
  if (idsArmas.has(a.id)) throw new Error(`biblioteca-armas-data: ${a.id} duplicado`);
  idsArmas.add(a.id);
}

export const TOTAL_ARSENAL = ARSENAL.length;

export const ARSENAL_POR_FAMILIA = FAMILIAS_ARMAS.map((f) => ({
  familia: f,
  piezas: ARSENAL.filter((a) => a.familia === f),
}));
