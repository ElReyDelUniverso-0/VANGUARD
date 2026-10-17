// ============================================================
// v110.0 MATRIZ 2100 — BITÁCORA DE VANGUARD
// "Configura las secciones ACTUALIZACIONES que nunca se pusieron"
// — RESUELTO: registro oficial y honesto de la evolución del
// sistema, de la era 1800 a la MATRIZ 2100. Fuente: historial
// real de despliegues. Se pinta en CAMBIOS y en AYUDA.
// v111.0 MÁQUINA DEL TIEMPO — la bitácora se ALIMENTA SOLA:
// version.ts es la fuente única; si la versión en marcha no
// tiene entrada, bitacoraViva() la antepone automáticamente
// (ningún release volverá a ser invisible en la bitácora).
// ============================================================

import { APP_VERSION, APP_CODENAME } from "@/lib/version";

export interface EntradaBitacora {
  version: string;
  nombre: string;
  hitos: string[];
  /** etiqueta de familia para el color */
  tipo: "nav" | "musica" | "mundo" | "ia" | "tecno" | "reten" | "luxe";
}

export const BITACORA: EntradaBitacora[] = [
  {
    version: "v126.0",
    nombre: "LA CASA · ATELIER",
    tipo: "luxe",
    hitos: [
      "LAS CINCO LEYES DEL LUJO dictadas por el Dueño, ahora constitución de la Casa: espacio negativo, materia honesta, escasez verdadera, artesanía con nombre y una historia que contar",
      "EL ATELIER (sala nueva en SISTEMA): el armario de ACABADOS finos (Oro Caviar, Platino Nocturno, Obsidiana, Champán Viejo, Oro Rosa, Marfil Real) — tocas uno y la casa entera cambia de piel con su campana de salón",
      "EDICIONES LIMITADAS de verdad: una por estación del planeta (solsticios y equinoccios), 2500 piezas numeradas, barra de escasez y cuenta atrás real — tu unidad Nº queda reservada por tu serie",
      "LA PLACA DE SERIE: cada visitante recibe SU número único grabado (no se repite ni se vende), con grano propio y fecha de forja; vive también en la cabecera de la casa junto a la firma 3D",
      "MODO GALERÍA (Ley del espacio negativo): un interruptor retira avisos, franja de estadísticas, banderines y rivales en TODAS las salas — el aire se ensancha y queda solo la obra",
      "LA HISTORIA DE LA CASA: las eras (la primera forja, las 158 salas, la lección de caviar, las cinco leyes), las horas de taller contadas desde la bitácora real y la firma del fundador",
      "MATERIALES EN CSS: texturas de oro pulido, metal cepillado, vidrio volcánico, satinado, grano artesanal y mate profundo + brillo de luz que barre la tarjeta al pasar (solo transform/opacity, 60 FPS)",
    ],
  },
  {
    version: "v125.0",
    nombre: "CORRECCIÓN TOTAL",
    tipo: "tecno",
    hitos: [
      "EL BUG MÁS VIEJO DE LA CAÍDO: la hidratación fallaba en CADA visita fresca — IlustracionViva firmaba sus gradientes SVG con Math.random() (servidor y cliente tiraban sufijos distintos) y las escenas 3D escribían floats de precisión completa (83.29604581548776px) que React redondeaba distinto a cada lado. Ahora: useId() para los gradientes y cuantizador q2() en TODO valor que entra a un estilo — cero errores de hidratación verificado en cargas frescas",
      "BOTONES REVIVIDOS: durante la recuperación del error de hidratación la casa entera quedaba sorda — clics muertos, secciones que no respondían al primer toque. Con la hidratación limpia, los 1415 botones responden al primer intento",
      "RESOLUTOR DE SALAS: 10 de las 16 salas del mega-menú (juego, inteligencia, mercado, archivo, comando, emisora, oscsuro, creadores, social y sistema) quedaban con el PANEL VACÍO si llegaba su clave de sección por swipe de borde o navegación programática — ahora handleTabChange resuelve cada clave de sala a su primera pestaña real. Barrido completo: 158 pestañas, cero paneles vacíos",
      "LEY CONTRA LA PÁGINA VIEJA: el HTML de la app se sirve ahora con no-cache/no-store — el navegador y cualquier gateway ya NUNCA muestran una versión caducada (la causa «a veces no se actualiza»), mientras los assets /_next/static conservan su caché inmutable",
      "PEAK DE PRESENCIA ARREGLADO: /api/presence usaba GREATEST() (función que SQLite no tiene) y el récord global de guerreros en línea nunca se actualizaba — sustituido por MAX() nativo",
      "PURGA DE ZOMBIS: múltiples servidores de desarrollo competían por el puerto y servían código viejo desde la caché de Turbopack — purga completa de .next y proceso único limpio (2.1 GB → 384 MB de RAM)",
      "QA EN VIVO: barrido de las 158 salas con cero paneles vacíos, cero errores de consola; noticias reales cargando, bono diario, cámaras, GOD VIEW, ATLAS, LA CAMA y la radio verificados clic a clic",
    ],
  },
  {
    version: "v124.0",
    nombre: "CAVIAR",
    tipo: "nav",
    hitos: [
      "LA CASA SE VISTE DE ALTA CLASE: la paleta completa pasa del neón frío a la sala de lujo — noir cálido de terciopelo, marfil, ORO #E8C56A como acento de la casa, champán en lugar del azul eléctrico y esmeralda fina en lugar del verde neón (279 sustituciones en 59 archivos, la crisis sigue siendo roja)",
      "TIPOGRAFÍA DE COLECCIÓN: los títulos de TODAS las salas y el wordmark del HUD van ahora en la serif caviar (Didot · Bodoni · Playfair · Georgia) con ORO EN CADA GLIFO — gradiente champán→oro→bronce por letra",
      "EL TELÓN DE ORO, el 6º estilo de viaje: telas de terciopelo noir con bastilla de oro brillante, costura dorada donde se encuentran y polvo de oro cayendo — y es el nuevo viaje POR DEFECTO de toda la casa (migración de lujo única que conserva tus visitas, favoritos y color)",
      "LA CAMPANA DEL SALÓN: entrar a una sala ya no suena a madera sino a lujo — dos notas de campana (Si5→Mi6, quinta justa) con cola de sala larga en cada cambio de sección",
      "SALÓN CAVIAR, la obra del lounge de la élite: 58 BPM en Fa con séptimas (Fmaj7·Dm7·Bbmaj7·C7), piano de cristal, contrabajo de terciopelo, shaker y swing — la RADIO la programa en la sala SOCIAL y puedes pedir-la en COLECCIÓN",
      "VANGUARD 3D EN ORO: las letras volumétricas de la portada pasan de material brasa a material ORO — la ciudad vive bajo un rótulo de lingote",
      "EL CRISTAL DE LA CASA: hud-panel y glass con veta cálida de terciopelo, rejilla tejida en oro, hilatura dorada en cada borde, selección y foco en oro — hasta el escáner CRT se apacigua para la sala de lujo",
    ],
  },
  {
    version: "v123.0",
    nombre: "GLORIA ETERNA",
    tipo: "musica",
    hitos: [
      "LA ORQUESTA ÉPICA NACE: cinco voces nuevas sintetizadas de cero — TIMBAL afinado al acorde, CORO CELESTIAL que canta \"aah\" con formantes humanos, PLATILLO con cola dorada, TROMPETA HEROICA y ARPA de glissando — todo 100% Web Audio, cero muestras, cero copyright para siempre",
      "GLORIA ETERNA, el himno de la casa: 72 BPM en Re menor que asciende a un clímax de coro, timbales y trompetas con platillo — la portada ahora se abre con el himno épico de Vanguard",
      "EL MOTIVO GLORIA, la firma reconocible en 3 notas: raíz·raíz·raíz→octava→5ª compartida por las 5 obras nuevas — GLORIA ETERNA, MARCHA DEL TRIUNFO, CORO DE LOS HÉROES, SERENIDAD DORADA y NOCHE DE ESTRELLAS son de la misma sangre",
      "MARCHA DEL TRIUNFO: trompetas victoriosas y tambores de desfile a 100 BPM — la guerra de Vanguard ya no entra con metales fríos sino con la marcha que cierra las guerras",
      "CORO DE LOS HÉROES: cien voces sintéticas cantando el arco del héroe — la obra más solemne de la casa, asignada al SISTEMA",
      "CALMA GLORIOSA: SERENIDAD DORADA (arpa de cristal + coro lejano) y NOCHE DE ESTRELLAS (campana sobre drones profundos) — las dos nuevas obras relajantes para mirar el cielo y quedarse; el OBSERVATORIO ahora duerme con ellas",
      "EL CIELO GANA POBLACIÓN: 16 estrellas nuevas (34 en total), AURORA BOREAL en las noches limpias y la luna con sus cráteres — la bóveda ya no es un desierto",
      "EL SOL CORONADO: halo que pulsa lento y noble sobre el astro — la firma de Vanguard brilla con más vida",
      "LA CIUDAD RESPIRA GENTE: tres bandadas de aves cruzando el día, el dron de la casa patrullando la noche, antenas con baliza en los altos, luces de aviación en las torres, tanques de agua en el Puerto y la Meseta",
      "LA CALLE VIVA: 8 faroles que se encienden solos al anochecer y tránsito perpetuo — dos pisos de luz (blancos que van, rojos que vuelven) recorriendo el horizonte noche y día",
      "VENTANAS CON PALETA: los edificios mezclan cálido, frío, blanco cálido, menta y el acento de la región — la ciudad ya no apaga todos los colores al caer el sol",
    ],
  },
  {
    version: "v122.0",
    nombre: "RUTAS DE PODER",
    tipo: "nav",
    hitos: [
      "RUTAS DE PODER EN EL ATLAS: los 15 ejes reales del planeta dibujados como arcos de vuelo animados sobre el mapa — GRAN PARIDAD, SIN LÍMITES, EJE NORTE–SUR, PETRODÓLAR... toca un pin y SUS rutas se encienden con tu color",
      "COMPARADOR DE NACIONES: nueva vista del ATLAS que pone dos países cara a cara — población, superficie y densidad en barras que coronan al ganador, con capital, moneda, idiomas, líder y su hora viva al lado",
      "TU SALA AL ARRANCAR: LA CAMA gana TU SALA DE SIEMPRE — eliges tu sala favorita y Vanguard puede aterrizar directo en ella cuando despierta sin sesión guardada, como entrar a tu habitación y no al hall",
      "LA MORAL RESIENTE EL CIELO: la tormenta pega −12% a la moral de los dos bandos, la nieve −10% y la nieve acumulada castiga −3 por día seguido; el despejado levanta el ánimo +4% — el teatro del Karsk ahora se siente",
      "TARJETA DEL COMANDANTE: cada cronología de localidad se exporta como PNG 1200×630 — su línea de 21 días, sus cambios de mano y sus despachos listos para enviar",
      "PRIORIDAD ALERTA EN EL HUD: los cables marcados ALERTA van PRIMERO en el mini-noticiero 2100 y lo visten de rojo con su chip parpadeante — la casa no entierra un ataque entre el ruido",
      "LA CIUDAD VIGILADA: la sala de CÁMARAS estrena su skyline procedural — vive con tu reloj real (luna y ventanas encendidas de noche, sol de día) mientras el dron de la red la barre en bucle",
      "SEÑALES REALES EN EL ESPEJO Y EL BRIEFING: los frentes del briefing lucen badges de señales en escucha y el espejo estrena su franja REAL separada del SIM — todo se lee dentro de Vanguard con la SALA DE LECTURA",
    ],
  },
  {
    version: "v121.0",
    nombre: "LA CAMA MÁS CÓMODA",
    tipo: "nav",
    hitos: [
      "MODO ATLAS MUNDIAL: la sala que faltaba — 66 países con capital, población, superficie, idiomas, moneda, gobierno y líder; 70 personas importantes del planeta (gobierno, organismos, dinero, ciencia y cultura) con SU UBICACIÓN REAL en el mapa, hora local EN VIVO de donde están y ficha completa con su historia",
      "EL MAPA DEL PLANETA: pines vivos por categoría sobre el mapa real de Vanguard (Natural Earth) — toca un pin y ves quién es, dónde está y qué hora es allí ahora mismo; relojes de las 8 potencias latiendo al segundo",
      "5 FORMAS DE VIAJAR ENTRE SALAS: elige tu movimiento (DESLIZAR direccional, CINE 3D con puertas volumétricas, TELÓN de teatro, HIPERESPACIO con anillos o DISOLVER de calma absoluta) — con vista previa jugable en LA CAMA",
      "LETRAS ANIMADAS EN TODA LA CASA: los títulos de todas las salas entran ahora letra a letra con rotación volumétrica (solo transform/opacity, 60 FPS)",
      "LA CAMA: la habitación de personalización total — tamaño de las letras de la casa entera (85%–130%), densidad del aire, intensidad de movimiento 0–120%, tu color personal (6 acentos que tiñen selección, brillos y transiciones), MODO CAMA de calma cálida y AUTO-CAMA que se pone solo a las 22:00",
      "LA CASA APRENDE TU CAMINO: cada visita queda registrada — tus salas más pisadas y tus recientes aparecen en LA CAMA a un toque",
      "ILUSTRACIONES VIVAS FUNCIONALES: satélite, globo, ciudad, antena, cohete, prensa y una cama lunar — dibujadas a código (cero imágenes), respiran con tu hora real y viven ENTRE los bloques de la portada",
    ],
  },
  {
    version: "v120.0",
    nombre: "GRAN SALTO 3D",
    tipo: "tecno",
    hitos: [
      "LA CIUDAD REINA EN LA PORTADA: el ocaso estático (v71) se jubila — lo primero que ves es la MEGALÓPOLIS viva: cielo real según tu reloj, la región del día con su mojón y el clima del planeta",
      "GIRAR REGIÓN A MANO: botón nuevo sobre la ciudad — salta a la región vecina con el fundido de 2.4 s de la casa (la rotación diaria sigue sola)",
      "VANGUARD EN LETRAS 3D DE VERDAD: el título de la portada se extruye en 7 capas con material BRASA (la identidad dorada) — volumen real, entrada letra a letra, se inclina con tu puntero",
      "LA SANGRE VUELVE A LA CASA: el schema de la BD quedó en PostgreSQL de la era v30 y la casa corre en SQLite — reparado: la BD vuelve a estar viva, las noticias curadas y los perfiles respiran otra vez",
      "MÁS NOTICIEROS QUE NUNCA: 4 canales nuevos en la red OSINT (20 en total) y 8 cables curados nuevos — la portada amanece llena",
    ],
  },
  {
    version: "v119.0",
    nombre: "CRONOTEATRO",
    tipo: "tecno",
    hitos: [
      "EL CLIMA TIÑE LA GUERRA: las estadísticas de campaña ya no son ajenas al cielo — nieve corta la artillería (−40 %) pero endurece la logística (convoyes +20 %), la tormenta aterriza la aviación y deja los drones en el suelo, la niebla dispara a ciegas; cada parte lleva sus modificadores a la vista",
      "NIEVE QUE SE ACUMULA: los días seguidos de nieve velan el terreno del teatro día tras día (hasta ×4) y el chip del clima lo cuenta — NIEVE ×3 DÍAS, como un invierno de verdad",
      "CRONOLOGÍA DE LOCALIDAD: toca cualquier localidad del teatro y la campaña se cuenta desde SU esquina — quién la tuvo cada uno de los 21 días (línea de puntos ROJO/GRIS/AZUL), cuántas veces cambió de mano y qué despachos la mencionaron",
      "LA VOZ DEL PARTE: los despachos del frente se ESCUCHAN — la casa narra su propio parte en es-ES con ritmo de operador de radio, nace en tu máquina, respeta el MUTE de Vanguard y se corta al cambiar de día",
      "EXPORTAR EL TEATRO: el día completo de campaña se descarga como PNG 1600×1080 — serializa el SVG vivo y lo rasteriza en tu máquina, sin servicios ni costes: vanguard-karsk-dia{N}.png",
      "INTEL EN VIVO EN EL MAPA GRANDE: el mapa militar de la casa también recibe los cables emparejados por conflicto — badges pulsantes en la lista, bloque INTEL EN VIVO en la ficha y lectura DENTRO de Vanguard con la SALA DE LECTURA (cero saltos fuera)",
      "SWIPE PARA TODAS LAS SECCIONES: con una sola pestaña abierta el gesto del borde ya no muere — recorre el CATÁLOGO COMPLETO de SECTIONS y abre la sala que toca como pestaña",
    ],
  },
  {
    version: "v118.0",
    nombre: "CRONOATLAS",
    tipo: "tecno",
    hitos: [
      "MÁQUINA DEL TIEMPO REALISTA: la campaña del Karsk pasa de 14 a 21 días con terreno de verdad — río con su puente estratégico, carreteras, contornos de elevación y la sombra de KARSKGRAD al este",
      "CLIMA DIARIO EN EL TEATRO: cada día amanece con su parte — despejado, lluvia, tormenta con relámpago, niebla a ras, nieve o viento — determinista y reproducible, con temperatura y viento por dirección",
      "DESPACHOS DEL FRENTE: el parte diario de la casa — 2-3 despachos por hora y sector sobre las localidades reales del día, escritos por Vanguard",
      "ESTADÍSTICAS DE CAMPAÑA: bajas por bando, bombardeos, drones derribados, convoyes logísticos y la moral de ROJO y AZUL moviéndose con el empuje del frente, día a día",
      "REPRODUCTOR NUEVO: velocidad ×0.5/×1/×2, avance y retroceso paso a paso, y TICKS rojos en la línea de tiempo marcando los días en que una localidad cambia de mano; ejes de presión con flechas que respiran según la fuerza del día",
      "ARCHIVO REAL AMPLIADO: dos cronologías verificables más — COINTELPRO (FBI, 1956-1971) y ECHELON (UKUSA, 1966-2001) — con fases, fuente nombrada y enlaces al grafo; el ARCHIVO pasa de 3 a 5 expedientes reales",
      "ATLAS QUE INFORMA: GOOGLE MAPS DE CONFLICTOS pasa de 8 a 12 zonas (Líbano Sur, Mar Negro, Cáucaso y Congo Este) con FICHA RICA: actores del conflicto, cifras clave e historial del frente",
      "INTEL EN VIVO EN LOS MAPAS: los cables de la casa se emparejan a cada zona por palabras clave y se leen DENTRO de Vanguard con la SALA DE LECTURA — el enlace externo a Google muere: las coordenadas se COPIAN y quedan como nota",
      "FLUIDEZ DIRECCIONAL: las salas entran desde el lado que les toca — adelante entra por la derecha y atrás invierte el movimiento, como un navegador de verdad; el ciclo de pestañas (flechas) viaja en su dirección",
      "SWIPE EN BORDES (móvil): desliza desde el borde para cambiar de pestaña abierta, con umbral honesto, bordes de 44 px y respeto a modales e interactivos; chips con scroll-snap y rebote contenido en toda la casa",
    ],
  },
  {
    version: "v117.0",
    nombre: "ATMÓSFERA",
    tipo: "mundo",
    hitos: [
      "CLIMA REAL EN LA CIUDAD: el METEO del planeta (/api/meteo) tiñe la megalópolis — lluvia que cae, nieve con deriva, niebla que se arrastra, tormenta con relámpagos de la casa y nubes cubiertas; chip CLIMA en vivo con temperatura",
      "TERMINADOR POR HORA: cada edificio recibe la LUZ del lado que mira al sol y sombra en el contrario, siguiendo la posición real del sol en tu reloj (alba este, ocaso oeste) — la ciudad sombreada de verdad",
      "CROSSFADE DE REGIÓN: cuando la ciudad cambia de región, la antigua se desvanece sobre la nueva durante 2.4 s (y el evento vanguard:rotar-region permite girarla a mano) — el cambio de día se SIENTE",
      "VOZ DE LA CIUDAD: audio ambiente 100% procedural de la casa (ciudad-audio.ts) — tráfico lejano que respira con la fase del día, aire y pitidos lejanos; se apaga con el MUTE y nunca arrastra muestras",
      "LECTURA NEURONA: la SALA DE LECTURA gana el veredicto del núcleo v4 sobre cada cable — riesgo/tensión/confianza, sentimiento y neuronas activas, computado EN TU DISPOSITIVO con el mismo motor del Monitor Global",
      "MINI-NOTICIERO 2100 EN EL HUD: titular rotativo de la casa cada 7 s — un toque abre la SALA DE LECTURA interna (cero enlaces externos) — y el CHIP DEL ARQUITECTO respira junto a la brújula con su ciclo vivo",
      "EL ARQUITECTO EXPANDIDO: ARCHIVO DE OBRA exportable (memoria visible descargable como JSON), SALAS SATÉLITE navegables (cada fundación abre su sala real por semilla determinista) y sus OBRAS audibles aquí mismo con sello OBRA DEL ARQUITECTO",
      "BAUTIZAR LA CIUDAD: la FORJA da nombres populares a las regiones — tu bautizo luce en la ciudad del INICIO con su estrella ★ (local en tu dispositivo, retirable)",
    ],
  },
  {
    version: "v116.0",
    nombre: "MEGALÓPOLIS",
    tipo: "mundo",
    hitos: [
      "MEGALÓPOLIS: la ciudad del INICIO rota de REGIÓN cada día (Núcleo Cromo, Distrito Neón, Meseta Solar, Puerto Abierto, Jardines Verticales, Ciudadela Vanguard) — cada región con su propia skyline, mojón y color, en 3 capas de volumen 3D que se inclinan contigo",
      "CICLO DÍA/NOCHE EN TIEMPO REAL: el cielo vive TU hora — noche profunda, alba, día pleno y ocaso interpolados minuto a minuto; sol y luna recorren su arco real, las estrellas y las ventanas obedecen a la luz, hay meteoros de noche y nubes de día",
      "SALA DE LECTURA: ningún cable te manda ya fuera de Vanguard — todo se lee DENTRO (portada 3D viva, credibilidad de fuente, bandera, EL CONTEXTO VANGUARD y salas relacionadas); la fuente original queda como nota al pie, sin enlaces",
      "MÁS NOTICIEROS: 4 canales nuevos (VANGUARD·2100 INFORMATIVO, ALERTA ROJA 24H, Mareas Azules, El Corresponsal) y la fila MÁS SEÑALES con 8 cables más en la portada",
      "3 MATERIALES NUEVOS en la FORJA: PLASMA (energía ionizada), AURORA (boreal en volumen) y TITANIO (el blindaje de la casa) — 11 materiales en total",
      "CERO IMÁGENES PLANAS: el héroe de INICIO y las miniaturas de los cables son ahora escenas 3D vivas derivadas del propio cable (PortadaNoticia) — adiós al <img> de la portada",
    ],
  },
  {
    version: "v115.0",
    nombre: "SINGULARIDAD",
    tipo: "ia",
    hitos: [
      "EL ARQUITECTO: el 16º mundo — el agente autónomo que mejora Vanguard sin manos. Se PROMPTEA A SÍ MISMO (cada ciclo escribe su próximo prompt citando lo que acaba de construir) y trabaja en un bucle que no termina",
      "TRABAJO REAL Y PERMANENTE: instala 6 módulos funcionales (sismógrafo de letras, telemetro neuronal, brújula del frente, faro de misiones, espejo de eras, cartógrafo de semillas), compone obras con voces V4, firma doctrinas, funda salas satélite y audita su propia obra",
      "MODO PERPETUO GLOBAL: sigue construyendo mientras navegas cualquier sala (MotorArquitecto en page.tsx) con 4 velocidades — LENTA/NORMAL/RÁPIDA/TURBO — y memoria eterna en vg-arquitecto-v115",
      "IA REAL CON RED DE SEGURIDAD: cada ciclo intenta el gateway (nueva ruta /api/arquitecto con iaParalela); si el modelo no responde, el núcleo embebido determinista toma el turno — el agente NUNCA se detiene",
      "LAS OBRAS DEL ARQUITECTO SUENAN: sus partituras aparecen como botones verdes ◈ en el ESTUDIO de CREADORES y son jugables al toque",
      "RONDAS PENDIENTES CERRADAS: FIRMA 3D junto al alias en el HUD · SOL con posición y sombras reales por TU hora en la ciudad de INICIO · SUB-SALAS de era (· ESTUDIO y · FORJA) · FORJA exporta .PNG · la radio FUNDE 7 s al cambiar de era (1950↔2100)",
    ],
  },
  {
    version: "v114.0",
    nombre: "ECLIPSE",
    tipo: "tecno",
    hitos: [
      "TERMINADOR SOLAR en VANGUARD EARTH: una cúpula shader oscurece el hemisferio nocturno del globo con crepúsculo suave — la MISMA matemática solar del mini-mapa (lib/sol.ts), el uniforme respira cada 60 s",
      "ERA POR SUB-SALA: el AUDITORIO son dos salas (SALA y COLECCIÓN) y cada una viste SU época — el auditorio en 2100 con la colección en 1980 conviven",
      "CHIP DE GRUPO EXPANDIDO ARRASTRABLE: el chip sobre su bloque mueve el grupo entero pestaña a pestaña (ratón al instante, pulsación larga en táctil) — como Chrome",
      "CROSSFADE DE FAMILIA: al cruzar de franja (alba→día→noche) la SESIÓN INTELIGENTE funde 7 s en vez de 0.8 — el anochecer se OYE llegar",
      "FIRMA 3D DE PERFIL: la FORJA exporta tu composición (texto, material, profundidad, acento) y el PERFIL del agente la luce con el motor de letras — se quita desde el propio perfil",
      "3 MATERIALES NUEVOS de letras: VIDRIO (cristal translúcido con filos de luz), ORO LÍQUIDO (metal dorado en bandas) y GLITCH (aberración cromática RGB con temblor de señal)",
    ],
  },
  {
    version: "v113.0",
    nombre: "LETRAS VIVAS",
    tipo: "tecno",
    hitos: [
      "MOTOR DE LETRAS 3D: cada letra de la casa tiene VOLUMEN real — capas extruidas en preserve-3d, 5 materiales (HOLOGRAMA, NEÓN, CROMO, MATRIZ y la BRASA dorada) y tilt con la persona vía el Motor 3D",
      "TODOS LOS HÉROES visten letras 3D: el título grande de cada sala se extruye por capas y se inclina contigo (mandato: todo sea 3D letras)",
      "EXPERIMENTAL — LA PÁGINA DE LOS IMPOSIBLES: el 15º mundo con la FORJA DE LETRAS (escribe → volumen 3D vivo, material, profundidad, giro orbital y arrastre), la ÓRBITA DE PALABRAS y la LLUVIA DE LETRAS con TU alfabeto",
      "GIROSCOPIO CON VISTA PREVIA EN VIVO: un cubo 3D en Ajustes respira tu mano (o tu móvil) y muestra tu calibración al segundo",
      "RADIO: la PRÓXIMA OBRA ya se ve en la píldora — con SESIÓN INTELIGENTE manda la familia de la hora",
      "ARREGLO: las etiquetas nueva/observatorio de los diccionarios ruso y chino estaban intercambiadas — Rusia y China leen su idioma",
    ],
  },
  {
    version: "v112.0",
    nombre: "SOLSTICIO",
    tipo: "tecno",
    hitos: [
      "ERA POR SALA: presets que visten cada sala de su época al entrar — la MURALLA en 1950, el AUDITORIO en 2100 — y devuelven la casa a su era al salir",
      "ARRASTRAR EL CHIP DE GRUPO: el grupo completo (chip + sus pestañas) viaja por la franja de cromo con pulsación larga en móvil",
      "ESTUDIO DEL CREADOR CON INSTRUMENTOS V4: campana FM, cristal y metal, pad con séptimas, sub-bajo y cadena de estudio en las composiciones publicables",
      "GIROSCOPIO CON CALIBRACIÓN FINA: tu pose de reposo es el cero (mediana de 700 ms) — y el defecto del listener siempre-activo de v111 queda cazado",
      "MURALLA con TERMINADOR SOLAR REAL (declinación + ecuación del tiempo) y las 10 PATRULLAS cruzando el planeta en vivo",
      "SESIÓN CONTINUA INTELIGENTE: la radio encadena la familia que pide la hora — alba→ambiente · día→vanguard · noche→guerra · madrugada→ambiente",
    ],
  },
  {
    version: "v111.0",
    nombre: "MÁQUINA DEL TIEMPO",
    tipo: "tecno",
    hitos: [
      "MÁQUINA DEL TIEMPO 1950→2100: toda la casa viaja de era — CRT verde, terminal ámbar, presentes y MATRIZ HOLO",
      "GIROSCOPIO: en el móvil la matriz se inclina con tu mano (permiso iOS en Ajustes)",
      "Los 14 mundos del MENÚ con profundidad 3D real heredando las escenas holo",
      "RADIO: ECUALIZADOR de 3 bandas ±12 dB + SESIÓN CONTINUA (encadena obras sin cortes) + cada obra con su mini-escena 3D",
      "BITÁCORA AUTO-ALIMENTADA desde version.ts · MURALLA con mapa sísmico en canvas · CONSEJO se reconvoca solo",
    ],
  },
  {
    version: "v110.0",
    nombre: "MATRIZ 2100",
    tipo: "tecno",
    hitos: [
      "MOTOR 3D: todo lo plano se vuelve escena holográfica viva (15 variantes) que se inclina con tu puntero",
      "PORTADA 3D en CADA noticia — nunca más un cable sin portada, funciona sin red",
      "OJO DE DIOS con escena orbital viva · CÁMARAS con KIT DE BIENVENIDA gratis (3 cámaras al entrar)",
      "TECNOLOGÍA 3D personalizable en Ajustes: intensidad, tilt, paralaje, rejilla",
      "BITÁCORA DE VANGUARD: las actualizaciones por fin visibles para todos",
    ],
  },
  {
    version: "v109.0",
    nombre: "ORQUESTA DE ORO",
    tipo: "musica",
    hitos: [
      "Motor de música v4: cadena de estudio (reverb de sala, chorus, ping-pong, compresor + limitador)",
      "Melodías que respiran: motivo → variante → puente → cadencia, humanizadas",
      "4 insignias nuevas + MODO AUDITORIO a pantalla completa con espectro de 32 barras",
    ],
  },
  {
    version: "v108.0",
    nombre: "LA CIUDAD VIVA",
    tipo: "nav",
    hitos: [
      "El mega-menú se vuelve una ciudad nocturna con portadas reales en CSS para cada mundo",
      "VITRINA DE SALAS: ves qué hay en cada subsección antes de entrar",
      "Fijar, renombrar, duplicar y previsualizar pestañas + MODO INMERSIÓN (tecla F)",
    ],
  },
  {
    version: "v107.0",
    nombre: "GRUPOS DE CROMO",
    tipo: "nav",
    hitos: [
      "Arrastra pestañas para reordenarlas (ratón al instante, móvil con pulsación larga)",
      "Grupos de pestañas con color como Chrome: chip contraíble, renombrable, recoloreable",
      "Los personajes del CONSEJO hablan con el modelo fuerte en producción",
    ],
  },
  {
    version: "v106.0",
    nombre: "PESTAÑAS DE CROMO",
    tipo: "nav",
    hitos: [
      "Cada vista es una pestaña que se abre, se elige y se cierra",
      "La NUEVA PESTAÑA trae ómnibox para buscar en todo el índice",
      "Muralla de Vigilancia en el Observatorio con USGS e ISS en vivo",
    ],
  },
  {
    version: "v105.0",
    nombre: "LA MENTE BLINDADA",
    tipo: "ia",
    hitos: [
      "Carrera de IA en paralelo (gateway privado ∥ núcleo público) con memoria de caída",
      "IA embebida de RESERVA en tu navegador: la sala nunca calla",
    ],
  },
  {
    version: "v104.0",
    nombre: "LA VITRINA",
    tipo: "mundo",
    hitos: [
      "Obras de la comunidad con fama real, comentarios y evaluación del agente",
      "Repeticiones de simulación y talleres con precarga",
    ],
  },
  {
    version: "v101.0",
    nombre: "EL REGRESO",
    tipo: "reten",
    hitos: [
      "Informe de regreso: qué cambió en el mundo desde tu última visita",
      "Tres corrientes: pulsos del mundo, noticias reales y expediente del día",
    ],
  },
  {
    version: "v89.0",
    nombre: "RED NEURONAL",
    tipo: "tecno",
    hitos: ["La red neuronal de Vanguard visible y entrenable desde NOTICIAS"],
  },
  {
    version: "v87.0",
    nombre: "SIGNOS VITALES",
    tipo: "mundo",
    hitos: ["Población que nace, tensiones que respiran y ECG planetario que nunca para"],
  },
  {
    version: "v82.0",
    nombre: "TODO EL MUNDO",
    tipo: "mundo",
    hitos: ["Teletipo en vivo: cinta de última hora + mensajes constantes en NOTICIAS"],
  },
  {
    version: "v78.0",
    nombre: "MENÚ DE CINE",
    tipo: "nav",
    hitos: ["El menú de Vanguard se vuelve cinematográfico: ken-burns, destellos, horizonte"],
  },
  {
    version: "v73.0",
    nombre: "REGLA DE ORO",
    tipo: "nav",
    hitos: ["Héroe universal en cada sala: título grande, escena y texto fácil"],
  },
  {
    version: "v72.0",
    nombre: "INFINITA VERDADES",
    tipo: "mundo",
    hitos: ["El mayor centro de noticias de Vanguard con título épico universal"],
  },
  {
    version: "v56.0",
    nombre: "MURO INFINITO",
    tipo: "mundo",
    hitos: ["Carga por lotes del archivo histórico completo en el OJO DE DIOS"],
  },
  {
    version: "v55.0",
    nombre: "TEMPORADA CERO",
    tipo: "reten",
    hitos: [
      "Pase de temporada de 30 días, combo por permanencia y cofres por rareza",
      "Informe de Ausencia con datos reales del pulso del mundo",
    ],
  },
];

export const BITACORA_COLOR: Record<EntradaBitacora["tipo"], string> = {
  nav: "#FF8A2A",
  musica: "#FFC53D",
  mundo: "#5EEAD4",
  ia: "#A8C7FF",
  tecno: "#34C759",
  reten: "#FF3B30",
  luxe: "#D4AF37",
};

// ── v111: ALIMENTACIÓN AUTOMÁTICA — la versión en marcha SIEMPRE está ──
// Si el release actual no tiene entrada escrita a mano, la bitácora la genera
// (título = codename de version.ts, hito honesto de publicación).
export function bitacoraViva(): EntradaBitacora[] {
  const yaEsta = BITACORA.some((e) => e.version === APP_VERSION);
  if (yaEsta) return BITACORA;
  return [
    {
      version: APP_VERSION,
      nombre: APP_CODENAME,
      tipo: "tecno",
      hitos: [
        `${APP_VERSION} · ${APP_CODENAME} — publicado y en marcha (entrada automática de la bitácora viva)`,
        "Los hitos detallados se escriben con cada ronda — esta línea garantiza que ningún release sea invisible",
      ],
    },
    ...BITACORA,
  ];
}
