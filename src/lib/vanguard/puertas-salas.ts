// ═══════════════════════════════════════════════════════════════════
// v405.8 · LAS PUERTAS DE LAS SALAS — el texto público de /sala/<clave>.
//
// GENERADO por scripts/generar-puertas-salas.mjs. NO se edita a mano.
// Cero texto nuevo: lema = paréntesis del rótulo de tab-nav; textos = las
// tarjetas de la casa que abren ESA sala (home-panel.tsx, navegador.tsx, puerta-vigo.tsx).
// indexable = ≥ 45 caracteres reales y no es sala personal ni interna.
// 155 puertas · 51 indexables.
// Solo lo importan páginas de servidor (no viaja al bundle del ⌘K).
// ═══════════════════════════════════════════════════════════════════

export type PuertaSala = {
  titulo: string;
  lema: string;
  textos: string[];
  otrosNombres: string[];
  indexable: boolean;
};

export const TOTAL_PUERTAS = 155;
export const TOTAL_INDEXABLES = 51;

export const PUERTAS_SALAS: Record<string, PuertaSala> = {
  "teatro3d": {
    "titulo": "VANGUARD 3D",
    "lema": "Cualquier lugar del planeta en 3D y 2D + frentes activos en vivo + uniformes, escuadrones y armas interactivas",
    "textos": [
      "Convierte cualquier ciudad o coordenada en teatro 3D/2D de guerra + frentes en vivo + uniformes, escuadrones y armas interactivas en 3D y 2D"
    ],
    "otrosNombres": [
      "VANGUARD 3D · MUNDO, FRENTES Y ARSENAL",
      "SIMULAR EN 3D / 2D"
    ],
    "indexable": true
  },
  "novedades": {
    "titulo": "LO NUEVO · EXPANSIÓN 10X",
    "lema": "Registro de todo lo recién añadido a VANGUARD con links directos + 10 funciones nuevas en vivo",
    "textos": [
      "Menú de novedades con links directos a cada cambio recién agregado + 10 funciones nuevas en vivo: Comparador 1v1, Termómetro Regional, Riesgo de Viaje, Suministros, Radar Diplomático, Verificador OSINT, Duelo, Vigía, Briefing y Atlas 32→3D"
    ],
    "otrosNombres": [
      "LO NUEVO · EXPANSIÓN 10 FUNCIONES"
    ],
    "indexable": false
  },
  "universo": {
    "titulo": "THE DAILY UNIVERSE",
    "lema": "Vanguard Credits VC, 8 Colecciones con Cartas 3D mejorables, Marketplace Ético 7 categorías y Base Personal",
    "textos": [
      "Economía diaria sin penalizaciones: Vanguard Credits (VC), Cartas Mejoradas 3D Holo-Foil (Países, Civilizaciones, Monumentos, Espacio, Ciencia...), Marketplace ético de 7 categorías y Base Personal"
    ],
    "otrosNombres": [
      "THE DAILY UNIVERSE · CREDITS & COLLECTIONS"
    ],
    "indexable": true
  },
  "hangar": {
    "titulo": "EL HANGAR",
    "lema": "Base 3D",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "salaguerra": {
    "titulo": "LA SALA DE GUERRA",
    "lema": "el mando supremo: entra a un teatro 3D de la guerra en vivo, mapa maestro de frentes y control, fuerzas enfrentadas, pulso real y la bolsa de guerra",
    "textos": [],
    "otrosNombres": [],
    "indexable": true
  },
  "comunidad": {
    "titulo": "LA COMUNIDAD",
    "lema": "los 18 ojos de la Casa: la Comunidad de Inteligencia de EE. UU. — ODNI, CIA, NSA y 15 más: pirámide, corredor de sedes, expedientes y pulso real",
    "textos": [],
    "otrosNombres": [],
    "indexable": true
  },
  "redmundial": {
    "titulo": "LA RED MUNDIAL",
    "lema": "los 18 servicios del resto del planeta: MI6, Mossad, SVR/FSB/GRU, MSS, DGSE, BND, CNI, RAW, ISI y los Cinco Ojos — mapa del mundo, expedientes y pulso real",
    "textos": [],
    "otrosNombres": [],
    "indexable": true
  },
  "rostros": {
    "titulo": "LOS ROSTROS DEL PODER",
    "lema": "el dossier de las personas que mueven el mundo: presidentes, banqueros centrales, jueces y nuevos poderes — mapa de ubicaciones reales, expedientes finos y pulso real",
    "textos": [],
    "otrosNombres": [],
    "indexable": true
  },
  "googles": {
    "titulo": "GOOGLES DE VANGUARD",
    "lema": "buscador, tendencias, traductor, académico, noticias y alertas",
    "textos": [
      "El Google de los problemas geopolíticos: buscador de todo el mundo Vanguard, tendencias, traductor de 8 idiomas, noticias, académico y alertas"
    ],
    "otrosNombres": [
      "EXPLORAR EL MUNDO"
    ],
    "indexable": true
  },
  "mente": {
    "titulo": "LA MENTE DE VANGUARD",
    "lema": "IA central: pulso autónomo del mundo, charla y expedientes neuronales",
    "textos": [
      "El cerebro central de IA: el mundo avanza en pulsos de 5 minutos y ella lo cuenta — habla con ella, pégale un titular y te firma el expediente con proyección",
      "Pregúntale a LA MENTE — responde de verdad y puede investigar la red en vivo por ti"
    ],
    "otrosNombres": [
      "INVESTIGAR"
    ],
    "indexable": true
  },
  "imagenes": {
    "titulo": "IMÁGENES DE VANGUARD",
    "lema": "búsqueda visual de fotos reales: lugares, poder, archivo, armas y civilizaciones",
    "textos": [
      "La búsqueda visual de la plataforma: fotos reales de lugares estratégicos, sedes del poder, archivo desclasificado, armas históricas y civilizaciones perdidas"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "grafo": {
    "titulo": "GRAFO MUNDIAL",
    "lema": "la red del conocimiento geopolítico de Vanguard",
    "textos": [
      "La red del conocimiento geopolítico: 150+ entidades del mundo Vanguard conectadas por conflicto, alianza, comercio y ruta, con ficha y veredicto neuronal"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "espejo": {
    "titulo": "EL ESPEJO",
    "lema": "una crisis, todas las perspectivas: confirmado, omitido y en disputa",
    "textos": [],
    "otrosNombres": [],
    "indexable": true
  },
  "maquina": {
    "titulo": "MÁQUINA DEL TIEMPO",
    "lema": "viaja por la historia de cada crisis, teatro del Karsk en vivo",
    "textos": [
      "Viaja por la historia de cada crisis: el frente del Karsk en vivo día a día, capítulos de Vand, Zenit y Sarn, y cronologías reales del archivo"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "tierra": {
    "titulo": "VANGUARD EARTH",
    "lema": "el googles de Vanguard",
    "textos": [
      "El googles de Vanguard: satélite espía con contactos en vivo, sensores 1-7, cockpit y vuelo cinematográfico por todo el planeta"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "expedientes": {
    "titulo": "Archivo Secreto",
    "lema": "expedientes desclasificados",
    "textos": [
      "Expedientes desclasificados del FBI, CIA y NARA: ábrelos todos y súbele al rango OJO DE DIOS"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "ojodios": {
    "titulo": "Vista Dios",
    "lema": "Ojo de Dios",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "osint": {
    "titulo": "Sala OSINT",
    "lema": "15 capas",
    "textos": [
      "15 capas de inteligencia sobre un globo interactivo"
    ],
    "otrosNombres": [
      "SALA OSINT 3D",
      "MAPA 3D"
    ],
    "indexable": true
  },
  "mapa": {
    "titulo": "Mapa mundial",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "canales": {
    "titulo": "Canales OSINT en vivo",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "mundial": {
    "titulo": "Dossier Mundial de Naciones",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "wikiguerra": {
    "titulo": "WIKIGUERRA",
    "lema": "enciclopedia del conflicto",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "centro": {
    "titulo": "CENTRO MUNDIAL",
    "lema": "noticias en vivo por importancia e impacto + mapa 3D",
    "textos": [
      "El mayor centro de noticias del mundo: en vivo POR IMPORTANCIA E IMPACTO, cada cable con su pie de foto e información, y EL MAPA MUNDIAL 3D en primera persona con gráficos de guerra"
    ],
    "otrosNombres": [
      "CENTRO MUNDIAL DE NOTICIAS",
      "GUERRA HOY"
    ],
    "indexable": true
  },
  "fichas": {
    "titulo": "LA COLECCIÓN DE GUERRA",
    "lema": "fichas coleccionables de cada conflicto: rareza viva, stats y la noticia única de cada frente",
    "textos": [],
    "otrosNombres": [],
    "indexable": true
  },
  "inicio": {
    "titulo": "Inicio",
    "lema": "Noticias",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "redaccion": {
    "titulo": "LA REDACCIÓN",
    "lema": "el lugar para leer el mundo: portada real con resumen, ¿por qué importa? e investigación en vivo",
    "textos": [
      "El lugar optimizado para leer el mundo: noticias reales con resumen, el ¿POR QUÉ IMPORTA? de cada pieza, investigación en vivo con fuentes citadas y modo lectura sin interrupciones"
    ],
    "otrosNombres": [
      "LEER EL MUNDO"
    ],
    "indexable": true
  },
  "cambios": {
    "titulo": "EL MUNDO CAMBIA",
    "lema": "informe de regreso: qué cambió desde tu última visita, con fechas y fuentes verificables",
    "textos": [
      "Tu informe de regreso: qué cambió desde tu última visita — pulsos del mundo, noticias reales con su fuente y fecha, y todo lo que rotó hoy. Que nunca sea la misma página de ayer"
    ],
    "otrosNombres": [],
    "indexable": false
  },
  "verdades": {
    "titulo": "INFINITA VERDADES",
    "lema": "el mayor centro de noticias",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "verifica": {
    "titulo": "Mesa de Verificación",
    "lema": "OSINT: sellos + las dos orillas",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "noticias": {
    "titulo": "Noticias",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "mundo": {
    "titulo": "Mundo de Guerra",
    "lema": "",
    "textos": [
      "Conquista territorios en 3D, guerra por turnos, detective, arcade y los juegos de la comunidad"
    ],
    "otrosNombres": [
      "JUGAR"
    ],
    "indexable": true
  },
  "multijugador": {
    "titulo": "Multijugador",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "frente": {
    "titulo": "Líneas de Frente en Vivo",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "detective": {
    "titulo": "Archivos Nación",
    "lema": "Detective",
    "textos": [
      "Resuelve casos históricos con pistas y engaños"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "edad": {
    "titulo": "Age of Nations",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "mipais": {
    "titulo": "MI PAÍS",
    "lema": "simulador de nación",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "arcade": {
    "titulo": "Arcade Pack",
    "lema": "",
    "textos": [
      "10 minijuegos con premios en monedas y récords — nuevo RADAR FURIA"
    ],
    "otrosNombres": [
      "ARCADE"
    ],
    "indexable": true
  },
  "taller": {
    "titulo": "TALLER DE JUEGOS",
    "lema": "crea, publica y juega juegos de la comunidad — sin código",
    "textos": [
      "Crea juegos SIN código con tres motores (quiz, ordena la historia, verdad o mentira), publícalos firmados con tu pasaporte y juega a los de la comunidad en el arcade de la Ciudadela"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "dron": {
    "titulo": "Dron Strike 3D",
    "lema": "",
    "textos": [
      "Vuela el dron, marca objetivos y multiplica combos"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "minijuego": {
    "titulo": "Minijuegos",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "combate": {
    "titulo": "Simulador de combate",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "warsim": {
    "titulo": "Simulador de Guerras",
    "lema": "",
    "textos": [
      "Cualquier país contra cualquier país, en segundos"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "conquista": {
    "titulo": "Conquista",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "bolsa": {
    "titulo": "Mercado geopolítico",
    "lema": "",
    "textos": [
      "Invierte en monedas de países: gana o pierde al instante"
    ],
    "otrosNombres": [
      "BOLSA GEOPOLÍTICA"
    ],
    "indexable": true
  },
  "hacienda": {
    "titulo": "Banco Central",
    "lema": "sueldo, bóvedas, tesorería",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "divisas": {
    "titulo": "Divisas del Mundo",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "bookmaker": {
    "titulo": "BetNación",
    "lema": "Casa de Apuestas",
    "textos": [
      "Cuotas vivas, combinadas y cashout como una casa real"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "apuestas": {
    "titulo": "Apuestas de guerra",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "lados": {
    "titulo": "¿De qué lado estás?",
    "lema": "",
    "textos": [
      "Declara tu bando en los problemas del mundo: el pueblo se parte en % vivo, apuesta por tu lado con cuotas honestas y al cierre EL MUNDO DECIDE"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "predicciones": {
    "titulo": "Predicciones",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "espionaje": {
    "titulo": "Red de Espionaje",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "gancho": {
    "titulo": "Centro de Ganancias",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "atlas": {
    "titulo": "ATLAS MUNDIAL",
    "lema": "todos los países y las personas importantes del planeta con sus ubicaciones en vivo",
    "textos": [],
    "otrosNombres": [],
    "indexable": true
  },
  "enciclopedia": {
    "titulo": "Enciclopedia mundial",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "curiosidades": {
    "titulo": "Curiosidades",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "epocas": {
    "titulo": "Épocas antiguas",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "historia": {
    "titulo": "Guerras históricas",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "muertes": {
    "titulo": "Figuras y bajas",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "conquistas3d": {
    "titulo": "Conquistas 3D",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "contadores": {
    "titulo": "Contadores mundiales",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "carteles": {
    "titulo": "Carteles",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "biblioteca": {
    "titulo": "LA GRAN BIBLIOTECA",
    "lema": "las constituciones del mundo, el tablero geopolítico, LA ARMERÍA DEL MUNDO con todas las armas, y la carta del deber obligatoria: buscar, seleccionar y aprender por puntos como en la escuela",
    "textos": [],
    "otrosNombres": [],
    "indexable": true
  },
  "tribunal": {
    "titulo": "Juicio Histórico",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "oscura": {
    "titulo": "Alejandría Oscura",
    "lema": "teorías, armas y civilizaciones",
    "textos": [
      "43 entradas prohibidas: teorías con veredicto real, armas, civilizaciones, documentos desclasificados, QUIZ diario, interrogatorio de 60s y racha con botín"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "briefing": {
    "titulo": "Briefing diario",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "misiones": {
    "titulo": "Misiones",
    "lema": "",
    "textos": [
      "Tus misiones del día, retos semanales, logros y la temporada que paga tu tiempo"
    ],
    "otrosNombres": [
      "PROGRESAR HOY"
    ],
    "indexable": true
  },
  "retos": {
    "titulo": "Retos diarios",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "quiz": {
    "titulo": "Quiz geopolítico",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "observatorio": {
    "titulo": "MURALLA DE VIGILANCIA",
    "lema": "el corazón del Observatorio: sismos, pulso, presencia y las 17 salas en vivo",
    "textos": [],
    "otrosNombres": [],
    "indexable": true
  },
  "centinela": {
    "titulo": "Centinela",
    "lema": "alerta temprana del planeta",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "espectro": {
    "titulo": "Espectro en Vivo",
    "lema": "tráfico aéreo y marítimo",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "pulsos": {
    "titulo": "Mapa de Pulsos en Vivo",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "evaluacion": {
    "titulo": "Evaluación de Campaña diaria",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "perdidas": {
    "titulo": "Pérdidas Confirmadas",
    "lema": "registro visual",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "frentes": {
    "titulo": "Línea del Frente",
    "lema": "zonas de control",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "geoint": {
    "titulo": "OJO-GEOINT",
    "lema": "capas, detecciones IA y pases",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "monitorglobal": {
    "titulo": "Monitor Global",
    "lema": "índices del núcleo neuronal",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "camaras": {
    "titulo": "Cámaras CCTV",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "cielos": {
    "titulo": "CIELOS",
    "lema": "vuelos militares en vivo",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "sismo": {
    "titulo": "SISMO",
    "lema": "red sismológica global",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "ciber": {
    "titulo": "CIBER",
    "lema": "mapa de amenazas en vivo",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "pulso": {
    "titulo": "Pulso Mundial",
    "lema": "satélite + radar aéreo",
    "textos": [
      "El planeta en vivo: terremotos, clima espacial, tensiones y señales de los sensores"
    ],
    "otrosNombres": [
      "VER EL PULSO REAL"
    ],
    "indexable": true
  },
  "radar": {
    "titulo": "Radar Desinfo + Conexiones",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "planeta": {
    "titulo": "Planeta Vivo",
    "lema": "NASA/auroras/EEI",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "geopolitica": {
    "titulo": "Geopolítica en Vivo",
    "lema": "ONU/USGS",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "galeria": {
    "titulo": "Galería OSINT",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "laboratorio": {
    "titulo": "LABORATORIO DEL DESTINO",
    "lema": "¿y si...? simulación contrafactual conectada al Espejo",
    "textos": [
      "¿Y SI...? Elige una crisis del Espejo, aplica la perturbación con su dosis y mira la guerra moverse día a día: logística, moral, escalada y Monte Carlo de 24 mundos — simulación, no predicción"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "simulador": {
    "titulo": "Simulador de Detonación",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "imperio": {
    "titulo": "IMPERIO",
    "lema": "auge y caída del continente",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "enclaves": {
    "titulo": "El Mundo en Clave",
    "lema": "explicador en 5 claves",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "extranjera": {
    "titulo": "Asuntos Exteriores",
    "lema": "revista de ensayos",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "canalbrief": {
    "titulo": "Canal Brief",
    "lema": "briefing en vídeo con capítulos",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "estrategia": {
    "titulo": "Estrategia Global",
    "lema": "doctrinas y wargames",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "mercados": {
    "titulo": "Mercados de Guerra",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "pronosticos": {
    "titulo": "Pronósticos de Inteligencia",
    "lema": "escenarios + riesgo",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "armodo": {
    "titulo": "MODO AR",
    "lema": "conflictos en tu cámara",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "operaciones": {
    "titulo": "Sala de Operaciones",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "briefings": {
    "titulo": "Briefings clasificados",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "pantalla": {
    "titulo": "Vanguard TV",
    "lema": "feed vertical + sala de proyección",
    "textos": [
      "El mundo en pases verticales: cámaras en vivo, informes OSINT, explicadores y crónicas — doble tap, suscripciones y sala de proyección",
      "Pases verticales del planeta"
    ],
    "otrosNombres": [
      "TV EN VIVO"
    ],
    "indexable": true
  },
  "foryou": {
    "titulo": "Para Ti",
    "lema": "feed de la comunidad",
    "textos": [
      "El feed de la comunidad: videos, música y stickers de los jugadores en scroll infinito — como TikTok, pero de guerra",
      "Tu feed con algoritmo propio"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "envivo": {
    "titulo": "EN VIVO Mundial",
    "lema": "Noticias + Comunidad",
    "textos": [
      "Noticias reales 24/7 + streams de la comunidad con donaciones"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "videos": {
    "titulo": "GlobalVision",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "directos": {
    "titulo": "Directos en Vivo",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "estudio": {
    "titulo": "Estudio de Video",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "memes": {
    "titulo": "Estudio de Memes",
    "lema": "",
    "textos": [
      "Diseña tu meme geopolítico con 251 países personajes — publícalo y gana",
      "El estudio del pueblo"
    ],
    "otrosNombres": [
      "MEMES"
    ],
    "indexable": true
  },
  "abusos": {
    "titulo": "Crímenes y Abusos",
    "lema": "",
    "textos": [
      "Crímenes y abusos documentados con fuentes ONU · el lado que prefieren ocultar"
    ],
    "otrosNombres": [
      "VERDAD CRUDA"
    ],
    "indexable": true
  },
  "incidentes": {
    "titulo": "Mapa de Incidentes",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "memorial": {
    "titulo": "Memorial †",
    "lema": "",
    "textos": [
      "Los que documentaron y cayeron: enciende tu vela por ellos"
    ],
    "otrosNombres": [
      "MEMORIAL \\u2020"
    ],
    "indexable": true
  },
  "sala18": {
    "titulo": "Sala Roja",
    "lema": "18+",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "dronguerra": {
    "titulo": "Guerra de Drones",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "recluta": {
    "titulo": "Cómo se Recluta",
    "lema": "3D",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "agenteia": {
    "titulo": "MODO AGENTE",
    "lema": "la IA superpotente que crea dentro de Vanguard",
    "textos": [
      "La mente de Vanguard, superpotente: acepta una misión y la ejecuta EN DIRECTO — investiga el frente, abre expedientes reales desclasificados, corre el motor del Laboratorio y PUBLICA su obra firmada: juegos al arcade, escenarios a la Galería, informes con fuentes",
      "El MODO AGENTE crea contigo: juegos, escenarios e informes que se publican firmados"
    ],
    "otrosNombres": [
      "CREAR"
    ],
    "indexable": true
  },
  "obras": {
    "titulo": "MURO DE OBRAS",
    "lema": "la vitrina de la comunidad: juega, simula, remezcla y expón — con Paseo de la Fama y el agente que evalúa",
    "textos": [
      "La vitrina de la comunidad: un muro con TODO lo que la gente crea — juegos, escenarios, encuestas, música, periódicos — con Paseo de la Fama, señales de tus obras y el agente que evalúa cada pieza",
      "El muro de la comunidad: juega, vota y remezcla lo que otros operadores crearon"
    ],
    "otrosNombres": [
      "LA VITRINA"
    ],
    "indexable": true
  },
  "creador": {
    "titulo": "Estudio Comunitario",
    "lema": "sube tu contenido",
    "textos": [
      "Sube TU contenido: personajes, armas, juegos, música, noticias y encuestas — la IA modera"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "escenarios": {
    "titulo": "GALERÍA DEL DESTINO",
    "lema": "escenarios ¿Y SI...? de la comunidad: explóralos, coméntalos y mejóralos",
    "textos": [
      "La comunidad comparte sus escenarios ¿Y SI...? del Laboratorio: explóralos corriendo la simulación, coméntalos y MEJÓRALOS con un remix — la gente crea y participa"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "studios": {
    "titulo": "Estudios Creadores",
    "lema": "noticias, banderas, mapas, música",
    "textos": [
      "Un estudio para cada sección: noticias con fotos, banderas propias, mapas con flechas, música compuesta in-page, stickers y muro social"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "mapascrea": {
    "titulo": "Constructor de Mapas",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "armeria": {
    "titulo": "Armería Real",
    "lema": "fotos + armado",
    "textos": [
      "Fotos reales de las armas del conflicto: función, ficha técnica y armado pieza por pieza"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "maps": {
    "titulo": "Google Maps de Conflictos",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "bolsamonedas": {
    "titulo": "Bolsa de Monedas",
    "lema": "crea tu propia moneda",
    "textos": [
      "Funda tu propia moneda con ticker y supply — el mercado la cotiza y los jugadores mueven el precio"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "empleos": {
    "titulo": "Empleos de Vanguard",
    "lema": "trabaja por sueldos",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "consejoia": {
    "titulo": "Consejo de Acero",
    "lema": "IA",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "crisis": {
    "titulo": "Crisis Mundial",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "contribuidores": {
    "titulo": "Comunidad de Contribuidores",
    "lema": "",
    "textos": [
      "7 trabajos remunerados: reporta, escribe, verifica, traduce y gana"
    ],
    "otrosNombres": [
      "CONTRIBUIDORES"
    ],
    "indexable": true
  },
  "gobierno": {
    "titulo": "Gobierno Mundial",
    "lema": "presidente, decretos, reclutar",
    "textos": [
      "El embajador electo toma el poder: decretos presidenciales, ministros, reclutamiento y poder político por país"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "embajadores": {
    "titulo": "Embajadores por País",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "alianzas": {
    "titulo": "Alianzas",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "salas": {
    "titulo": "Salas sociales",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "foros": {
    "titulo": "Foros",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "encuestas": {
    "titulo": "Encuestas",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "redes": {
    "titulo": "Redes de Vanguard",
    "lema": "",
    "textos": [
      "La casa en el mundo: Telegram oficial vivo, 8 canales más en camino y comparte Vanguard con enlaces reales — +5 monedas por traer gente"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "amigos": {
    "titulo": "Amigos",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "torneos": {
    "titulo": "Torneos",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "perfil": {
    "titulo": "Personalizar Perfil",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "identidad": {
    "titulo": "VANGUARD ID",
    "lema": "carnet, KNOWLEDGE LEVEL y privacidad",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "agentes": {
    "titulo": "EL GOBIERNO LIBRE",
    "lema": "tu credencial exclusiva y los agentes autónomos que pulen Vanguard cada cierto tiempo — como un gobierno, pero libre",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "cama": {
    "titulo": "LA CAMA",
    "lema": "personalización total: Vanguard se adapta a ti como la cama más cómoda",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "atelier": {
    "titulo": "EL ATELIER",
    "lema": "las cinco leyes del lujo: acabados finos, edición limitada numerada, tu serie grabada, modo galería e historia de la Casa",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "agente": {
    "titulo": "Perfil del Agente",
    "lema": "IQ",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "analista": {
    "titulo": "PERFIL DE ANALISTA",
    "lema": "nivel, insignias, retos semanales de investigación y ELO",
    "textos": [
      "Tu progresión con sentido: nivel de analista, 14 insignias que cuentan lo que hiciste, retos semanales de investigación y ELO. Todo computado de acciones reales"
    ],
    "otrosNombres": [],
    "indexable": false
  },
  "fortaleza": {
    "titulo": "FORTALEZA DE ACERO",
    "lema": "sellos de seguridad, muros y blindajes de la Ciudadela",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "logros": {
    "titulo": "Logros",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "recompensas": {
    "titulo": "Recompensas",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "ranking": {
    "titulo": "Ranking global",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "racha": {
    "titulo": "Racha",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "fusion": {
    "titulo": "Fusion",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "registro": {
    "titulo": "Registro",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "estadisticas": {
    "titulo": "Estadísticas",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "notificaciones": {
    "titulo": "Alertas",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "telegram": {
    "titulo": "Bot de Telegram",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "tienda": {
    "titulo": "Tienda",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "ayuda": {
    "titulo": "Ayuda",
    "lema": "",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  },
  "experimental": {
    "titulo": "EXPERIMENTAL",
    "lema": "la página de los imposibles: forja de letras 3D, órbita de palabras y lluvia de letras",
    "textos": [
      "La página de los imposibles: escribe y mira tus palabras volverse letras 3D de verdad — forja de letras, órbita de palabras y lluvia de letras, todo en vivo y sin imágenes"
    ],
    "otrosNombres": [],
    "indexable": true
  },
  "arquitecto": {
    "titulo": "ARQUITECTO",
    "lema": "el agente autónomo que mejora Vanguard solo: se promptea a sí mismo, instala módulos, compone obras y nunca se detiene",
    "textos": [
      "El agente autónomo de Vanguard: se promptea a sí mismo y trabaja sin fin — instala módulos funcionales, compone obras para la radio, firma doctrinas, vigila el frente y nunca se detiene (con o sin tu ayuda)"
    ],
    "otrosNombres": [],
    "indexable": false
  },
  "nueva": {
    "titulo": "NUEVA PESTAÑA",
    "lema": "elige tu destino: buscador, atajos y todo el índice de Vanguard",
    "textos": [],
    "otrosNombres": [],
    "indexable": false
  }
};
