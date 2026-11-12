// ============================================================
// v367.2 LA VOZ MAESTRA — EL SABER DE LA CASA (saber.ts)
//
// «Necesito que sea una experta en el sentido de la geopolítica y explique
// navegando y dando ejemplos» (el Dueño). Un sintetizador no se vuelve sabio
// por sonar mejor: el saber se escribe. Este archivo es la cátedra mínima de
// la casa — 9 teatros y 15 conceptos — escrita a mano, con hechos públicos y
// SIN UNA SOLA CIFRA: las cifras las pone el archivo real (los cables), nunca
// esta tabla. Así la voz jamás puede inventar un número.
//
// Regla de la casa respetada al pie de la letra: aquí no hay datos volátiles
// (bajas, porcentajes, fechas de hoy). Solo geografía, actores y lógica —
// cosas que siguen siendo verdad mañana y no envejecen mal.
// ============================================================

export interface TeatroSaber {
  id: string;
  nombre: string;
  donde: string;
  actores: string[];
  porqueImporta: string;
  queVigilar: string[];
  errorComun: string;
}

export interface ConceptoSaber {
  id: string;
  nombre: string;
  alias: string[];
  definicion: string;
  ejemplo: string;
}

/** Los 9 teatros del feed de la casa (mismas claves que conflictTag). */
export const TEATROS_SABER: Record<string, TeatroSaber> = {
  ukraine: {
    id: "ukraine",
    nombre: "la guerra de Ucrania",
    donde:
      "El este y el sur de Ucrania, con el mar Negro como telón de fondo y una línea de frente que se mueve poco y cuesta mucho.",
    actores: [
      "Rusia, que ataca",
      "Ucrania, que defiende",
      "la OTAN, que arma y entrena sin entrar en combate",
      "la Unión Europea, que sanciona y financia",
    ],
    porqueImporta:
      "Es la primera guerra de desgaste a gran escala entre ejércitos convencionales en Europa desde la Segunda Guerra Mundial, y ha reordenado tres cosas del mundo: la energía europea, el precio del grano y la doctrina militar de la OTAN.",
    queVigilar: [
      "el grano: si el corredor del mar Negro se cierra, el precio del trigo sube en África y en Oriente Medio antes que en Europa",
      "la defensa aérea: la proporción entre misiles lanzados e interceptados dice más del frente que cualquier comunicado",
      "las líneas rojas de la OTAN: cada vez que un arma de largo alcance cruza una frontera declarada, el tablero entero se tensa",
    ],
    errorComun:
      "Creer que es una guerra de territorios. Es sobre todo una guerra de suministros: quien sostiene la cadena de munición y de reparación sostiene el frente.",
  },
  gaza: {
    id: "gaza",
    nombre: "la guerra de Gaza",
    donde:
      "Una franja costera de unos cuarenta kilómetros, entre Israel, Egipto y el Mediterráneo: una de las densidades de población más altas del planeta.",
    actores: [
      "Israel, que ataca",
      "Hamás, que gobierna la franja y combate",
      "Egipto, que controla la frontera sur",
      "la ONU y las agencias humanitarias, que sostienen la ayuda",
    ],
    porqueImporta:
      "Porque es el punto donde la guerra urbana, el derecho internacional humanitario y la política interna de Oriente Medio se cruzan: cada operación se mide a la vez en el campo de batalla, en los tribunales y en las calles de medio mundo.",
    queVigilar: [
      "los corredores de ayuda: cuántos camiones entran y por qué puerta es el termómetro humanitario real",
      "el frente diplomático: los reconocimientos de Estado y las resoluciones del Consejo de Seguridad",
      "la escalada regional: cualquier apertura de un segundo frente cambia el conflicto de escala",
    ],
    errorComun:
      "Leerlo solo como un conflicto local. Su peso viene de lo que arrastra: rutas marítimas, alianzas y opinión pública global.",
  },
  lebanon: {
    id: "lebanon",
    nombre: "la frontera de Líbano",
    donde:
      "El sur de Líbano, entre la línea azul con Israel y el valle de la Becá, con Hezbolá como actor armado dentro del propio Estado.",
    actores: ["Israel", "Hezbolá", "el Ejército libanés", "Irán, que sostiene a Hezbolá"],
    porqueImporta:
      "Porque es el segundo frente que puede encenderse solo: un intercambio de fuego sostenido en esta frontera obliga a dos países enteros y a su red de aliados a decidir si entran.",
    queVigilar: [
      "la profundidad de los ataques: un intercambio táctico en la frontera no es lo mismo que un ataque a la capital",
      "las evacuaciones: cuando se vacían pueblos enteros, la operación deja de ser disuasión y pasa a ser campaña",
      "el Estado libanés: un país sin monopolio de la fuerza no controla su propia frontera",
    ],
    errorComun:
      "Tratar Líbano como un Estado que decide. Buena parte de la decisión militar no está en manos de su gobierno.",
  },
  redsea: {
    id: "redsea",
    nombre: "el mar Rojo",
    donde:
      "El corredor marítimo entre el canal de Suez, el estrecho de Bab el Mandeb y el golfo de Adén: la autopista del comercio entre Asia y Europa.",
    actores: [
      "los hutíes de Yemen, que atacan barcos",
      "las coaliciones navales que escoltan",
      "las navieras, que deciden la ruta",
      "Egipto, que vive del canal",
    ],
    porqueImporta:
      "Porque aquí la geopolítica se convierte en precio: cuando las navieras rodean África por el cabo de Buena Esperanza, cada contenedor viaja más días y todo lo que compras llega más caro. Es el teatro donde un misil barato mueve la economía mundial.",
    queVigilar: [
      "las primas de seguro marítimo: suben antes de que se note en las tiendas",
      "las rutas alternativas: cuántos barcos rodean África es el dato que mide el daño real",
      "las escoltas: cada convoy militar es una decisión política, no solo naval",
    ],
    errorComun:
      "Pensar que es un problema de barcos. Es un problema de seguros, de plazos y de precios: el comercio no necesita que hundan mucho, solo que sea inseguro.",
  },
  sudan: {
    id: "sudan",
    nombre: "la guerra de Sudán",
    donde:
      "Todo el país, con Jartum como epicentro y Darfur como herida antigua que se reabre: un territorio del tamaño de media Europa Occidental.",
    actores: [
      "las Fuerzas Armadas Sudanesas",
      "las Fuerzas de Apoyo Rápido",
      "las milicias regionales de Darfur",
      "los países del Golfo, que sostienen a una u otra parte",
    ],
    porqueImporta:
      "Porque es la guerra con mayor desplazamiento humano del planeta y la que menos titulares recibe: dos ejércitos con respaldos exteriores se pelean por un Estado entero, y de ahí salen rutas de armas, de minerales y de personas.",
    queVigilar: [
      "el hambre: la clasificación de seguridad alimentaria dice más del avance de la guerra que los mapas",
      "Darfur: cuando el conflicto se vuelve comunal, la salida deja de ser militar",
      "quién arma a quién: cada flujo externo alarga la guerra años",
    ],
    errorComun:
      "Ignorarlo por falta de cobertura. La falta de prensa no es falta de guerra: es la guerra que se libra sin testigos.",
  },
  korea: {
    id: "korea",
    nombre: "las dos Coreas",
    donde:
      "La zona desmilitarizada más armada del mundo, con Seúl a tiro de artillería y Pyongyang a dos horas de coche.",
    actores: ["Corea del Norte y su programa nuclear", "Corea del Sur y su ejército", "Estados Unidos y sus bases", "China, como vecino decisivo"],
    porqueImporta:
      "Porque es una guerra de 1953 que nunca firmó la paz: técnicamente sigue abierta. Y porque una crisis aquí afecta a la fábrica de semiconductores más importante del mundo, es decir, a la electrónica global.",
    queVigilar: [
      "las pruebas de misiles: el alcance y la trayectoria dicen a quién se le habla (a Seúl, a Tokio o a Washington)",
      "el lenguaje del parlamento norcoreano: los cambios de doctrina se anuncian antes de probarse",
      "las cadenas de suministro: los chips son el verdadero argumento disuasorio de Corea del Sur",
    ],
    errorComun:
      "Verlo como una excentricidad. Es el lugar donde se ensayan las reglas de la disuasión nuclear entre potencias.",
  },
  taiwan: {
    id: "taiwan",
    nombre: "el estrecho de Taiwán",
    donde:
      "Un brazo de mar de unos ciento ochenta kilómetros entre la China continental y una isla que fabrica la mayor parte de los chips avanzados del planeta.",
    actores: ["China, que reclama la isla", "Taiwán, que vive su propia política", "Estados Unidos, que vende armas y disuade", "Japón y Filipinas, vecinos en la ruta"],
    porqueImporta:
      "Porque aquí se cruzan dos dependencias mundiales: la tecnológica (los chips) y la comercial (el paso marítimo). Es el punto del planeta donde un bloqueo naval tendría el efecto económico más rápido.",
    queVigilar: [
      "las maniobras militares alrededor de la isla: su frecuencia dice más que los discursos",
      "las líneas rojas declaradas por ambas capitales: el margen se mide en palabras",
      "la inversión en fábricas fuera de la isla: deslocalizar chips es prepararse para el riesgo",
    ],
    errorComun:
      "Creer que es solo un asunto chino. Es el asunto de todos los que tienen un teléfono en el bolsillo.",
  },
  hormuz: {
    id: "hormuz",
    nombre: "el estrecho de Ormuz",
    donde:
      "El desfiladero marítimo entre el golfo Pérsico y el golfo de Omán: dos tercios de la producción mundial de petróleo transportado en buques pasan por aquí.",
    actores: ["Irán, que controla la orilla norte", "Omán, la orilla sur", "las monarquías del Golfo, que exportan", "las armadas que patrullan"],
    porqueImporta:
      "Porque es la llave del precio del petróleo: aquí no hace falta una guerra abierta, basta con hacer el paso inseguro para que la prima de riesgo encoja la economía mundial. Es el estrecho donde la geografía manda más que las alianzas.",
    queVigilar: [
      "los apresamientos de petroleros: son el termómetro de la tensión",
      "las primas de los seguros de casco y máquina: el mercado habla antes que los gobiernos",
      "el paralelo diplomático con el mar Rojo: dos estrechos tensos a la vez cambian la economía del transporte",
    ],
    errorComun:
      "Reducirlo a «Irán cierra el estrecho». Cerrarlo mucho tiempo también le cuesta a Teherán: es una carta de amenaza, no un botón.",
  },
  sahel: {
    id: "sahel",
    nombre: "el Sahel",
    donde:
      "La franja que cruza África por debajo del Sáhara: Mali, Níger, Burkina Faso y sus vecinos, con Estados frágiles y desiertos que no se pueden vigilar.",
    actores: [
      "los gobiernos militares de la región",
      "los grupos yihadistas",
      "empresas de seguridad privadas y ejércitos extranjeros",
      "Moscú, que ha entrado como socio de seguridad",
    ],
    porqueImporta:
      "Porque es el ejemplo puro de guerra por delegación: los ejércitos extranjeros se van, los contratistas se quedan, los grupos armados se reacomodan y las rutas migratorias y minerales cambian de mano sin que haya un solo titular claro.",
    queVigilar: [
      "quién paga la seguridad: cada cambio de socio es una decisión estratégica disfrazada de contrato",
      "las rutas de oro y uranio: sostienen a todos los actores",
      "las salidas de ejércitos y de misiones internacionales: los vacíos no son pacíficos",
    ],
    errorComun:
      "Hablar de «terrorismo» y parar ahí. La geopolítica del Sahel es, sobre todo, geopolítica de la seguridad contratada y de los recursos.",
  },
};

/** La cátedra corta: conceptos que la voz sabe explicar con ejemplo real. */
export const CONCEPTOS_SABER: ConceptoSaber[] = [
  {
    id: "disuasion",
    nombre: "la disuasión",
    alias: ["disuasion", "disuadir", "disuasion nuclear"],
    definicion:
      "Convencer al otro de que atacar le costará más de lo que puede ganar. No busca vencer en la batalla, sino que la batalla no ocurra: se sostiene sobre la credibilidad de la respuesta, no sobre la fuerza bruta.",
    ejemplo:
      "Las bases de Estados Unidos en Corea del Sur no existen para ganar una guerra allí: existen para que China y Corea del Norte sepan que cualquier ataque implica directamente a Washington. La duda que siembra es el arma.",
  },
  {
    id: "escalada",
    nombre: "la escalada",
    alias: ["escalada", "escalar", "escalada vertical"],
    definicion:
      "Subir el nivel de un conflicto paso a paso, desde el reproche diplomático hasta el fuego directo. La escalada suele ser gradual porque cada lado busca una ventaja sin cruzar el punto en que el otro se sienta obligado a responder con todo.",
    ejemplo:
      "Un cierre de frontera puede responderse con expulsiones, luego con maniobras, luego con fuego de advertencia: cada paso se calibra para que el rival pierda algo sin sentirse obligado a responder con todo. Cuando alguien calcula mal, la escalada se vuelve involuntaria — y las guerras grandes casi nunca empiezan por un plan, sino por un error de cálculo.",
  },
  {
    id: "zona-gris",
    nombre: "la zona gris",
    alias: ["zona gris", "guerra hibrida", "guerra hibrida", "hibrida"],
    definicion:
      "Actuar contra el rival sin cruzar el umbral del ataque armado clásico: ciberataques, desinformación, presión económica, milicias sin bandera. El truco es quedarse por debajo de la línea en que la respuesta militar sería legítima.",
    ejemplo:
      "Un ciberataque a un oleoducto puede parar una refinería sin que nadie haya disparado un tiro: el cálculo de quien lo hace es que el daño sea real, pero la atribución (y la respuesta) quede en duda.",
  },
  {
    id: "chokepoint",
    nombre: "un punto de estrangulamiento",
    alias: ["punto de estrangulamiento", "chokepoint", "estrecho", "cuello de botella"],
    definicion:
      "Un paso geográfico estrecho por el que tiene que pasar un flujo global: petróleo, grano o chips. Quien lo controla, o quien puede hacerlo inseguro, tiene poder sin necesidad de ganar ninguna guerra.",
    ejemplo:
      "Ormuz y Bab el Mandeb son los dos ejemplos clásicos: no hace falta cerrarlos, basta con que el seguro de un petrolero sea tan caro que el viaje deje de compensar.",
  },
  {
    id: "sanciones",
    nombre: "las sanciones",
    alias: ["sancion", "sanciones", "embargo", "sancionar"],
    definicion:
      "Usar la economía como arma: cortar bancos, tecnología, minerales o mercados para subir el precio político de una conducta. Su eficacia es lenta y depende de que varios países las sostengan a la vez.",
    ejemplo:
      "El techo al precio del petróleo ruso funciona solo si suficientes clientes lo respetan: la sanción no gana por el documento, gana por la logística de quien la aplica.",
  },
  {
    id: "desgaste",
    nombre: "la guerra de desgaste",
    alias: ["desgaste", "guerra de attrition"],
    definicion:
      "En lugar de buscar una ruptura rápida, agotar al adversario: romper su logística, su economía y su gente hasta que no pueda sostener el esfuerzo. Frente al desgaste, los mapas se mueven poco y el precio es tiempo.",
    ejemplo:
      "Una ofensiva que avanza cinco kilómetros en un mes pero destruye la cadena de munición del rival puede valer más que una que toma una ciudad y la pierde al mes siguiente.",
  },
  {
    id: "derecho-humanitario",
    nombre: "el derecho internacional humanitario",
    alias: ["derecho humanitario", "derecho internacional", "ginebra", "civiles protegidos"],
    definicion:
      "Las reglas que separan un combate legítimo de un crimen: distinción entre objetivos militares y civiles, proporcionalidad y prohibición de las armas indiscriminadas. No decide quién tiene razón, decide cómo se puede pelear.",
    ejemplo:
      "Cuando un hospital se convierte en objetivo, la pregunta jurídica no es si dentro hay un combatiente, sino si el daño civil previsto es proporcionado a la ventaja militar: de eso se ocupan los tribunales, no los mapas.",
  },
  {
    id: "otanos",
    nombre: "el artículo cinco de la OTAN",
    alias: ["articulo cinco", "articulo 5", "otan", "nato"],
    definicion:
      "El compromiso de que un ataque contra un miembro se considera un ataque contra todos. Solo se ha invocado una vez, tras los atentados del 11 de septiembre de 2001. Es una cláusula de disuasión, no un botón automático de guerra.",
    ejemplo:
      "Polonia reforzó su frontera con Bielorrusia sin que se activara el artículo cinco: cuando la crisis no cruza el umbral del ataque armado, la cláusula no entra — para eso existe la zona gris.",
  },
  {
    id: "osint",
    nombre: "la inteligencia abierta, OSINT",
    alias: ["osint", "inteligencia abierta", "fuentes abiertas", "verificacion"],
    definicion:
      "Sacar inteligencia de lo que es público: imágenes de satélite, vídeos geolocalizados, vuelos registrados, bases de datos. Sirve para corroborar o desmentir, y su fuerza está en el método, no en el secreto.",
    ejemplo:
      "Una fotografía de un aeropuerto puede fecharse por la sombra que proyecta y ubicarse por una señal de una carretera: eso es OSINT, y por eso Vanguard exige fuente y fecha en cada dato.",
  },
  {
    id: "aire-bloqueo",
    nombre: "el bloqueo y la zona de exclusión aérea",
    alias: ["bloqueo", "zona de exclusion aerea", "no fly zone", "exclusion aerea"],
    definicion:
      "Cortar un espacio: el bloqueo corta el comercio, la zona de exclusión corta el aire. Ambos son actos de fuerza que no necesitan disparar para tener efecto: el otro no puede usar lo que antes usaba.",
    ejemplo:
      "Una zona de exclusión aérea obliga a quien la impone a derribar a quien la cruce: por eso casi nunca se anuncia sin intención real de sostenerla.",
  },
  {
    id: "delegacion",
    nombre: "la guerra por delegación",
    alias: ["guerra por delegacion", "proxy", "guerra por proxi", "delegacion"],
    definicion:
      "Las potencias no se pelean directamente: sostienen a un lado con dinero, armas o asesores. El coste humano cae sobre el país anfitrión y el coste político queda a distancia de quien paga.",
    ejemplo:
      "El Sahel es el modelo: cuando un ejército extranjero se retira y los contratistas se quedan, el conflicto cambia de dueño sin cambiar de bandera.",
  },
  {
    id: "energia",
    nombre: "la geopolítica de la energía",
    alias: ["energia", "gas", "petroleo", "petróleo", "corredores energeticos"],
    definicion:
      "Quién tiene la molécula y quién tiene la tubería. En energía, la infraestructura manda: el gasoducto crea dependencia, y la dependencia es política aunque el contrato sea comercial.",
    ejemplo:
      "Europa cambió el origen de su gas por barco en pocos años no solo por precio, sino porque una tubería que cruza un país adversario es una deuda política.",
  },
  {
    id: "gran-ajedrez",
    nombre: "la lógica del tablero",
    alias: ["tablero", "ajedrez", "logica del tablero", "equilibrio de poder"],
    definicion:
      "Ningún movimiento se lee solo: cada actor reacciona a lo que cree que harán los demás. La pregunta correcta no es «quién gana aquí», sino «quién cambia su cálculo si esto pasa».",
    ejemplo:
      "Un ejercicio militar en Taiwán también le habla a Tokio y a Washington: el mismo movimiento tiene tres destinatarios distintos.",
  },
  {
    id: "dependencia",
    nombre: "la dependencia de cadenas de suministro",
    alias: ["cadena de suministro", "dependencia", "semiconductores", "chips", "grano"],
    definicion:
      "Quién fabrica el insumo que no se puede sustituir rápido. Un país que produce el único chip avanzado del mundo tiene más poder disuasorio que muchas divisiones.",
    ejemplo:
      "El grano ucraniano y los chips taiwaneses son la misma lección: hay lugares donde la geografía tiene más peso económico que militar.",
  },
  {
    id: "opinion",
    nombre: "la legitimidad y la opinión pública",
    alias: ["legitimidad", "opinion publica", "propaganda", "relato"],
    definicion:
      "En una guerra, ganar el relato no es propaganda: es logística. Las alianzas que sostienen el esfuerzo y el dinero que llega dependen de que el público siga creyendo que la causa es legítima.",
    ejemplo:
      "La ayuda militar sostenida durante años exige votos sostenidos durante años: por eso los teatros con más cobertura mediática reciben más recursos que los de más víctimas.",
  },
];

// ── CÓMO SE RECONOCE (la prueba de campo) ──────────────────────
// Un concepto que solo se define sirve para un examen; uno que se
// reconoce sirve para leer el mundo. Cada línea es un criterio que el
// lector puede aplicar él mismo a los cables del día, sin que la casa
// le diga qué concluir. Cero cifras, cero predicciones.
export const SENALES_CONCEPTO: Record<string, string> = {
  disuasion:
    "se reconoce cuando el rival tiene la capacidad de atacar y no ataca; si deja de atacar porque no puede, eso no es disuasión, es debilidad",
  escalada:
    "se reconoce cuando cada respuesta es un escalón por encima de la anterior y ninguno de los dos quiere el choque total",
  "zona-gris":
    "se reconoce cuando hay daño real, autor atribuible con esfuerzo y ninguna declaración de guerra: si el ataque se firma, deja de ser zona gris",
  chokepoint:
    "se reconoce cuando basta con amenazar el paso — sin cerrarlo — para que cambien los seguros, los plazos y los precios",
  sanciones:
    "se reconoce cuando el castigo no está en el campo de batalla sino en los bancos, los puertos y las aduanas; y fracasa cuando hay quien compre igual",
  desgaste:
    "se reconoce cuando el mapa se mueve poco y, en cambio, se habla sin parar de munición, reparaciones y reemplazos",
  "derecho-humanitario":
    "se reconoce cuando la discusión deja de ser militar y pasa a ser jurídica: proporcionalidad, distinción y responsabilidad de mando",
  otanos:
    "se reconoce en la duda: cuando un miembro es atacado, la primera pregunta es si el ataque cruza el umbral, no cuántos soldados hay",
  osint:
    "se reconoce porque la prueba es pública y verificable: una sombra, una señal de tráfico, un registro de vuelo que cualquiera puede repetir",
  "aire-bloqueo":
    "se reconoce en la obligación que crea: quien cierra un espacio tiene que estar dispuesto a disparar contra quien lo cruce",
  delegacion:
    "se reconoce porque el que paga y el que muere no son el mismo país",
  energia:
    "se reconoce cuando el contrato es comercial pero la decisión es política: cambiar de proveedor cuesta años, no facturas",
  "gran-ajedrez":
    "se reconoce porque cada movimiento tiene varios destinatarios a la vez: el que está enfrente y el que mira desde lejos",
  dependencia:
    "se reconoce cuando un solo proveedor, o un solo paso marítimo, puede parar una industria entera",
  opinion:
    "se reconoce cuando el dinero y las armas siguen a la cobertura mediática más que a las víctimas: el relato también es logística",
};
