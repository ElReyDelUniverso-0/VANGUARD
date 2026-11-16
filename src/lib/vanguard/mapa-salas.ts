// ═══════════════════════════════════════════════════════════════════
// v403.8 · EL MAPA DE LAS SALAS — 155 salas en 20 constelaciones.
//
// GENERADO por scripts/generar-mapa-salas.mjs desde tab-nav.tsx (la fuente
// única de las pestañas del cuartel). NO se edita a mano: si se añade una sala,
// se corre el script y este archivo vuelve a decir la verdad.
//
// Para qué sirve: /modulos enseña las 155 salas y el buscador ⌘K las
// encuentra — sin arrastrar framer-motion ni el JSX de tab-nav a esas páginas.
// Cada sala abre en su sitio de siempre: /cuartel?sala=<clave> (v402.4).
// ═══════════════════════════════════════════════════════════════════

export type SalaMapa = { clave: string; nombre: string; corto: string };
export type Constelacion = { clave: string; nombre: string; corto: string; color: string; desc: string; salas: SalaMapa[] };

export const CONSTELACIONES: Constelacion[] = [
  {
    "clave": "teatro3d",
    "nombre": "VANGUARD 3D",
    "corto": "VANGUARD 3D",
    "color": "amber",
    "desc": "convierte cualquier lugar del planeta en teatro 3D/2D de guerra, vigila frentes en vivo e inspecciona uniformes, escuadrones y armas interactivas",
    "salas": [
      {
        "clave": "teatro3d",
        "nombre": "VANGUARD 3D (Cualquier lugar del planeta en 3D y 2D + frentes activos en vivo + uniformes, escuadrones y armas interactivas)",
        "corto": "VANGUARD 3D"
      }
    ]
  },
  {
    "clave": "novedades",
    "nombre": "LO NUEVO 10X",
    "corto": "LO NUEVO 10X",
    "color": "cyan",
    "desc": "Panel Lo Nuevo con enlaces directos a cada novedad y las 10 funciones interactivas de expansión en vivo",
    "salas": [
      {
        "clave": "novedades",
        "nombre": "LO NUEVO · EXPANSIÓN 10X (Registro de todo lo recién añadido a VANGUARD con links directos + 10 funciones nuevas en vivo)",
        "corto": "LO NUEVO 10X"
      }
    ]
  },
  {
    "clave": "universo",
    "nombre": "DAILY UNIVERSE",
    "corto": "DAILY UNIVERSE",
    "color": "amber",
    "desc": "Vanguard Credits (VC), VANGUARD Collections (8 álbumes con cartas 3D mejorables), Marketplace Ético y Base Personal",
    "salas": [
      {
        "clave": "universo",
        "nombre": "THE DAILY UNIVERSE (Vanguard Credits VC, 8 Colecciones con Cartas 3D mejorables, Marketplace Ético 7 categorías y Base Personal)",
        "corto": "DAILY UNIVERSE"
      }
    ]
  },
  {
    "clave": "hangar",
    "nombre": "HANGAR",
    "corto": "HANGAR",
    "color": "cyan",
    "desc": "Tu base 3D: camina entre puertas holográficas, tarot, detector de propaganda y diario",
    "salas": [
      {
        "clave": "hangar",
        "nombre": "EL HANGAR (Base 3D)",
        "corto": "HANGAR"
      }
    ]
  },
  {
    "clave": "inteligencia",
    "nombre": "INTELIGENCIA",
    "corto": "INTEL",
    "color": "cyan",
    "desc": "LA SALA DE GUERRA (el mando supremo: teatros en vivo con teatro 3D, mapa maestro y bolsa de guerra), LA COMUNIDAD (los 18 ojos de la Comunidad de…",
    "salas": [
      {
        "clave": "salaguerra",
        "nombre": "LA SALA DE GUERRA (el mando supremo: entra a un teatro 3D de la guerra en vivo, mapa maestro de frentes y control, fuerzas enfrentadas, pulso real y la bolsa de guerra)",
        "corto": "SALA GUERRA"
      },
      {
        "clave": "comunidad",
        "nombre": "LA COMUNIDAD (los 18 ojos de la Casa: la Comunidad de Inteligencia de EE. UU. — ODNI, CIA, NSA y 15 más: pirámide, corredor de sedes, expedientes y pulso real)",
        "corto": "COMUNIDAD"
      },
      {
        "clave": "redmundial",
        "nombre": "LA RED MUNDIAL (los 18 servicios del resto del planeta: MI6, Mossad, SVR/FSB/GRU, MSS, DGSE, BND, CNI, RAW, ISI y los Cinco Ojos — mapa del mundo, expedientes y pulso real)",
        "corto": "RED MUNDIAL"
      },
      {
        "clave": "rostros",
        "nombre": "LOS ROSTROS DEL PODER (el dossier de las personas que mueven el mundo: presidentes, banqueros centrales, jueces y nuevos poderes — mapa de ubicaciones reales, expedientes finos y pulso real)",
        "corto": "ROSTROS"
      },
      {
        "clave": "googles",
        "nombre": "GOOGLES DE VANGUARD (buscador, tendencias, traductor, académico, noticias y alertas)",
        "corto": "GOOGLES"
      },
      {
        "clave": "mente",
        "nombre": "LA MENTE DE VANGUARD (IA central: pulso autónomo del mundo, charla y expedientes neuronales)",
        "corto": "MENTE"
      },
      {
        "clave": "imagenes",
        "nombre": "IMÁGENES DE VANGUARD (búsqueda visual de fotos reales: lugares, poder, archivo, armas y civilizaciones)",
        "corto": "IMAGENES"
      },
      {
        "clave": "grafo",
        "nombre": "GRAFO MUNDIAL (la red del conocimiento geopolítico de Vanguard)",
        "corto": "GRAFO"
      },
      {
        "clave": "espejo",
        "nombre": "EL ESPEJO (una crisis, todas las perspectivas: confirmado, omitido y en disputa)",
        "corto": "ESPEJO"
      },
      {
        "clave": "maquina",
        "nombre": "MÁQUINA DEL TIEMPO (viaja por la historia de cada crisis, teatro del Karsk en vivo)",
        "corto": "TIEMPO"
      },
      {
        "clave": "tierra",
        "nombre": "VANGUARD EARTH (el googles de Vanguard)",
        "corto": "EARTH"
      },
      {
        "clave": "expedientes",
        "nombre": "Archivo Secreto (expedientes desclasificados)",
        "corto": "ARCHIVO.S"
      },
      {
        "clave": "ojodios",
        "nombre": "Vista Dios (Ojo de Dios)",
        "corto": "OJO"
      },
      {
        "clave": "osint",
        "nombre": "Sala OSINT (15 capas)",
        "corto": "OSINT"
      },
      {
        "clave": "mapa",
        "nombre": "Mapa mundial",
        "corto": "MAPA"
      },
      {
        "clave": "canales",
        "nombre": "Canales OSINT en vivo",
        "corto": "CANALES"
      },
      {
        "clave": "mundial",
        "nombre": "Dossier Mundial de Naciones",
        "corto": "MUNDIAL"
      },
      {
        "clave": "wikiguerra",
        "nombre": "WIKIGUERRA (enciclopedia del conflicto)",
        "corto": "WIKI"
      }
    ]
  },
  {
    "clave": "inicio",
    "nombre": "INICIO",
    "corto": "INICIO",
    "color": "amber",
    "desc": "EL CENTRO MUNDIAL DE NOTICIAS (en vivo por importancia e impacto, pie de foto e info, mapa 3D), LA COLECCIÓN DE GUERRA (las fichas coleccionables…",
    "salas": [
      {
        "clave": "centro",
        "nombre": "CENTRO MUNDIAL (noticias en vivo por importancia e impacto + mapa 3D)",
        "corto": "CENTRO"
      },
      {
        "clave": "fichas",
        "nombre": "LA COLECCIÓN DE GUERRA (fichas coleccionables de cada conflicto: rareza viva, stats y la noticia única de cada frente)",
        "corto": "FICHAS"
      },
      {
        "clave": "inicio",
        "nombre": "Inicio (Noticias)",
        "corto": "INICIO"
      },
      {
        "clave": "redaccion",
        "nombre": "LA REDACCIÓN (el lugar para leer el mundo: portada real con resumen, ¿por qué importa? e investigación en vivo)",
        "corto": "REDACCIÓN"
      },
      {
        "clave": "cambios",
        "nombre": "EL MUNDO CAMBIA (informe de regreso: qué cambió desde tu última visita, con fechas y fuentes verificables)",
        "corto": "CAMBIOS"
      },
      {
        "clave": "verdades",
        "nombre": "INFINITA VERDADES (el mayor centro de noticias)",
        "corto": "VERDADES"
      },
      {
        "clave": "verifica",
        "nombre": "Mesa de Verificación (OSINT: sellos + las dos orillas)",
        "corto": "VERIFICA"
      },
      {
        "clave": "noticias",
        "nombre": "Noticias",
        "corto": "NOTICIAS"
      }
    ]
  },
  {
    "clave": "juego",
    "nombre": "JUEGO",
    "corto": "JUEGO",
    "color": "red",
    "desc": "Guerra, detective, Warsim, Age of Nations, MI PAÍS, Arcade y el TALLER DE JUEGOS de la comunidad",
    "salas": [
      {
        "clave": "mundo",
        "nombre": "Mundo de Guerra",
        "corto": "GUERRA"
      },
      {
        "clave": "multijugador",
        "nombre": "Multijugador",
        "corto": "MULTI"
      },
      {
        "clave": "frente",
        "nombre": "Líneas de Frente en Vivo",
        "corto": "FRENTE"
      },
      {
        "clave": "detective",
        "nombre": "Archivos Nación (Detective)",
        "corto": "DETECTIVE"
      },
      {
        "clave": "edad",
        "nombre": "Age of Nations",
        "corto": "AOF"
      },
      {
        "clave": "mipais",
        "nombre": "MI PAÍS (simulador de nación)",
        "corto": "MI PAÍS"
      },
      {
        "clave": "arcade",
        "nombre": "Arcade Pack",
        "corto": "ARCADE"
      },
      {
        "clave": "taller",
        "nombre": "TALLER DE JUEGOS (crea, publica y juega juegos de la comunidad — sin código)",
        "corto": "TALLER"
      },
      {
        "clave": "dron",
        "nombre": "Dron Strike 3D",
        "corto": "DRON"
      },
      {
        "clave": "minijuego",
        "nombre": "Minijuegos",
        "corto": "MINIJUEGO"
      },
      {
        "clave": "combate",
        "nombre": "Simulador de combate",
        "corto": "COMBATE"
      },
      {
        "clave": "warsim",
        "nombre": "Simulador de Guerras",
        "corto": "WARSIM"
      },
      {
        "clave": "conquista",
        "nombre": "Conquista",
        "corto": "CONQUISTA"
      }
    ]
  },
  {
    "clave": "mercado",
    "nombre": "MERCADO",
    "corto": "MERCADO",
    "color": "green",
    "desc": "Exchange, apuestas, ¿de qué lado estás?, predicciones y espionaje — gana o pierde monedas",
    "salas": [
      {
        "clave": "bolsa",
        "nombre": "Mercado geopolítico",
        "corto": "MERCADO"
      },
      {
        "clave": "hacienda",
        "nombre": "Banco Central (sueldo, bóvedas, tesorería)",
        "corto": "BANCO"
      },
      {
        "clave": "divisas",
        "nombre": "Divisas del Mundo",
        "corto": "DIVISAS"
      },
      {
        "clave": "bookmaker",
        "nombre": "BetNación (Casa de Apuestas)",
        "corto": "BETNACIÓN"
      },
      {
        "clave": "apuestas",
        "nombre": "Apuestas de guerra",
        "corto": "APUESTAS"
      },
      {
        "clave": "lados",
        "nombre": "¿De qué lado estás?",
        "corto": "TU LADO"
      },
      {
        "clave": "predicciones",
        "nombre": "Predicciones",
        "corto": "PREDIC"
      },
      {
        "clave": "espionaje",
        "nombre": "Red de Espionaje",
        "corto": "ESPIONAJE"
      },
      {
        "clave": "gancho",
        "nombre": "Centro de Ganancias",
        "corto": "GANANCIAS"
      }
    ]
  },
  {
    "clave": "archivo",
    "nombre": "ARCHIVO MUNDIAL",
    "corto": "ARCHIVO",
    "color": "cyan",
    "desc": "El ATLAS MUNDIAL (cada país y cada persona importante con su ubicación), enciclopedia, épocas, guerras históricas, figuras, biblioteca, tribunal y…",
    "salas": [
      {
        "clave": "atlas",
        "nombre": "ATLAS MUNDIAL (todos los países y las personas importantes del planeta con sus ubicaciones en vivo)",
        "corto": "ATLAS"
      },
      {
        "clave": "enciclopedia",
        "nombre": "Enciclopedia mundial",
        "corto": "ENCICLO"
      },
      {
        "clave": "curiosidades",
        "nombre": "Curiosidades",
        "corto": "CURIOSO"
      },
      {
        "clave": "epocas",
        "nombre": "Épocas antiguas",
        "corto": "EPOCAS"
      },
      {
        "clave": "historia",
        "nombre": "Guerras históricas",
        "corto": "HISTORIA"
      },
      {
        "clave": "muertes",
        "nombre": "Figuras y bajas",
        "corto": "MUERTES"
      },
      {
        "clave": "conquistas3d",
        "nombre": "Conquistas 3D",
        "corto": "CONQ.3D"
      },
      {
        "clave": "contadores",
        "nombre": "Contadores mundiales",
        "corto": "CONTADORES"
      },
      {
        "clave": "carteles",
        "nombre": "Carteles",
        "corto": "CARTELES"
      },
      {
        "clave": "biblioteca",
        "nombre": "LA GRAN BIBLIOTECA (las constituciones del mundo, el tablero geopolítico, LA ARMERÍA DEL MUNDO con todas las armas, y la carta del deber obligatoria: buscar, seleccionar y aprender por puntos como en la escuela)",
        "corto": "BIBLIOTECA"
      },
      {
        "clave": "tribunal",
        "nombre": "Juicio Histórico",
        "corto": "TRIBUNAL"
      },
      {
        "clave": "oscura",
        "nombre": "Alejandría Oscura (teorías, armas y civilizaciones)",
        "corto": "OSCURA"
      }
    ]
  },
  {
    "clave": "comando",
    "nombre": "COMANDO",
    "corto": "COMANDO",
    "color": "amber",
    "desc": "Centro de operaciones diarias",
    "salas": [
      {
        "clave": "briefing",
        "nombre": "Briefing diario",
        "corto": "BRIEFING"
      },
      {
        "clave": "misiones",
        "nombre": "Misiones",
        "corto": "MISIONES"
      },
      {
        "clave": "retos",
        "nombre": "Retos diarios",
        "corto": "RETOS"
      },
      {
        "clave": "quiz",
        "nombre": "Quiz geopolítico",
        "corto": "QUIZ"
      }
    ]
  },
  {
    "clave": "observatorio",
    "nombre": "OBSERVATORIO",
    "corto": "OBSERV",
    "color": "cyan",
    "desc": "La sala de vigilancia total del planeta: la MURALLA DE VIGILANCIA, el centinela, el espectro, pulsos, evaluación, pérdidas, frentes, GEOINT,…",
    "salas": [
      {
        "clave": "observatorio",
        "nombre": "MURALLA DE VIGILANCIA (el corazón del Observatorio: sismos, pulso, presencia y las 17 salas en vivo)",
        "corto": "OBSERV"
      },
      {
        "clave": "centinela",
        "nombre": "Centinela (alerta temprana del planeta)",
        "corto": "CENTINELA"
      },
      {
        "clave": "espectro",
        "nombre": "Espectro en Vivo (tráfico aéreo y marítimo)",
        "corto": "ESPECTRO"
      },
      {
        "clave": "pulsos",
        "nombre": "Mapa de Pulsos en Vivo",
        "corto": "PULSOS"
      },
      {
        "clave": "evaluacion",
        "nombre": "Evaluación de Campaña diaria",
        "corto": "EVAL"
      },
      {
        "clave": "perdidas",
        "nombre": "Pérdidas Confirmadas (registro visual)",
        "corto": "PÉRDIDAS"
      },
      {
        "clave": "frentes",
        "nombre": "Línea del Frente (zonas de control)",
        "corto": "FRENTES"
      },
      {
        "clave": "geoint",
        "nombre": "OJO-GEOINT (capas, detecciones IA y pases)",
        "corto": "GEOINT"
      },
      {
        "clave": "monitorglobal",
        "nombre": "Monitor Global (índices del núcleo neuronal)",
        "corto": "MONITOR"
      },
      {
        "clave": "camaras",
        "nombre": "Cámaras CCTV",
        "corto": "CÁMARAS"
      },
      {
        "clave": "cielos",
        "nombre": "CIELOS (vuelos militares en vivo)",
        "corto": "CIELOS"
      },
      {
        "clave": "sismo",
        "nombre": "SISMO (red sismológica global)",
        "corto": "SISMO"
      },
      {
        "clave": "ciber",
        "nombre": "CIBER (mapa de amenazas en vivo)",
        "corto": "CIBER"
      },
      {
        "clave": "pulso",
        "nombre": "Pulso Mundial (satélite + radar aéreo)",
        "corto": "PULSO"
      },
      {
        "clave": "radar",
        "nombre": "Radar Desinfo + Conexiones",
        "corto": "RADAR"
      },
      {
        "clave": "planeta",
        "nombre": "Planeta Vivo (NASA/auroras/EEI)",
        "corto": "PLANETA"
      },
      {
        "clave": "geopolitica",
        "nombre": "Geopolítica en Vivo (ONU/USGS)",
        "corto": "GEO"
      },
      {
        "clave": "galeria",
        "nombre": "Galería OSINT",
        "corto": "GALERÍA"
      }
    ]
  },
  {
    "clave": "estrategia",
    "nombre": "ESTRATEGIA",
    "corto": "ESTRAT",
    "color": "violet",
    "desc": "Simuladores y gran estrategia: el LABORATORIO DEL DESTINO (¿y si...? conectado al Espejo), el simulador de guerra, RTS IMPERIO, enclaves, guerra…",
    "salas": [
      {
        "clave": "laboratorio",
        "nombre": "LABORATORIO DEL DESTINO (¿y si...? simulación contrafactual conectada al Espejo)",
        "corto": "LAB"
      },
      {
        "clave": "simulador",
        "nombre": "Simulador de Detonación",
        "corto": "SIMULADOR"
      },
      {
        "clave": "imperio",
        "nombre": "IMPERIO (auge y caída del continente)",
        "corto": "IMPERIO"
      },
      {
        "clave": "enclaves",
        "nombre": "El Mundo en Clave (explicador en 5 claves)",
        "corto": "EN CLAVE"
      },
      {
        "clave": "extranjera",
        "nombre": "Asuntos Exteriores (revista de ensayos)",
        "corto": "REVISTA"
      },
      {
        "clave": "canalbrief",
        "nombre": "Canal Brief (briefing en vídeo con capítulos)",
        "corto": "BRIEF.TV"
      },
      {
        "clave": "estrategia",
        "nombre": "Estrategia Global (doctrinas y wargames)",
        "corto": "ESTRAT"
      },
      {
        "clave": "mercados",
        "nombre": "Mercados de Guerra",
        "corto": "MERCADOS"
      },
      {
        "clave": "pronosticos",
        "nombre": "Pronósticos de Inteligencia (escenarios + riesgo)",
        "corto": "PRONÓST"
      },
      {
        "clave": "armodo",
        "nombre": "MODO AR (conflictos en tu cámara)",
        "corto": "AR"
      },
      {
        "clave": "operaciones",
        "nombre": "Sala de Operaciones",
        "corto": "OPERACIONES"
      },
      {
        "clave": "briefings",
        "nombre": "Briefings clasificados",
        "corto": "BRIEFINGS"
      }
    ]
  },
  {
    "clave": "emisora",
    "nombre": "EMISORA",
    "corto": "EMISORA",
    "color": "red",
    "desc": "VANGUARD TV (feed vertical + sala de proyección), Para Ti, EN VIVO mundial, GlobalVision, directos, estudio de video y memes",
    "salas": [
      {
        "clave": "pantalla",
        "nombre": "Vanguard TV (feed vertical + sala de proyección)",
        "corto": "V.TV"
      },
      {
        "clave": "foryou",
        "nombre": "Para Ti (feed de la comunidad)",
        "corto": "PARA TI"
      },
      {
        "clave": "envivo",
        "nombre": "EN VIVO Mundial (Noticias + Comunidad)",
        "corto": "EN VIVO"
      },
      {
        "clave": "videos",
        "nombre": "GlobalVision",
        "corto": "VIDEOS"
      },
      {
        "clave": "directos",
        "nombre": "Directos en Vivo",
        "corto": "DIRECTOS"
      },
      {
        "clave": "estudio",
        "nombre": "Estudio de Video",
        "corto": "ESTUDIO"
      },
      {
        "clave": "memes",
        "nombre": "Estudio de Memes",
        "corto": "MEMES"
      }
    ]
  },
  {
    "clave": "oscsuro",
    "nombre": "VERDAD CRUDA",
    "corto": "VERDAD",
    "color": "red",
    "desc": "El lado oscuro: abusos documentados, incidentes, memorial y material fuerte con advertencia",
    "salas": [
      {
        "clave": "abusos",
        "nombre": "Crímenes y Abusos",
        "corto": "ABUSOS"
      },
      {
        "clave": "incidentes",
        "nombre": "Mapa de Incidentes",
        "corto": "INCIDEN"
      },
      {
        "clave": "memorial",
        "nombre": "Memorial †",
        "corto": "MEMORIAL"
      },
      {
        "clave": "sala18",
        "nombre": "Sala Roja (18+)",
        "corto": "SALA 18+"
      },
      {
        "clave": "dronguerra",
        "nombre": "Guerra de Drones",
        "corto": "DR.GUERRA"
      },
      {
        "clave": "recluta",
        "nombre": "Cómo se Recluta (3D)",
        "corto": "RECLUTA"
      }
    ]
  },
  {
    "clave": "creadores",
    "nombre": "CREADORES",
    "corto": "CREADORES",
    "color": "violet",
    "desc": "Crear dentro de Vanguard: el MURO DE OBRAS (la vitrina de la comunidad con Paseo de la Fama), el MODO AGENTE (la IA que crea juegos, escenarios e…",
    "salas": [
      {
        "clave": "agenteia",
        "nombre": "MODO AGENTE (la IA superpotente que crea dentro de Vanguard)",
        "corto": "M.AGENTE"
      },
      {
        "clave": "obras",
        "nombre": "MURO DE OBRAS (la vitrina de la comunidad: juega, simula, remezcla y expón — con Paseo de la Fama y el agente que evalúa)",
        "corto": "OBRAS"
      },
      {
        "clave": "creador",
        "nombre": "Estudio Comunitario (sube tu contenido)",
        "corto": "CREADOR"
      },
      {
        "clave": "escenarios",
        "nombre": "GALERÍA DEL DESTINO (escenarios ¿Y SI...? de la comunidad: explóralos, coméntalos y mejóralos)",
        "corto": "ESCENARIOS"
      },
      {
        "clave": "studios",
        "nombre": "Estudios Creadores (noticias, banderas, mapas, música)",
        "corto": "ESTUDIOS"
      },
      {
        "clave": "mapascrea",
        "nombre": "Constructor de Mapas",
        "corto": "MAPAS.C"
      },
      {
        "clave": "armeria",
        "nombre": "Armería Real (fotos + armado)",
        "corto": "ARMERÍA"
      },
      {
        "clave": "maps",
        "nombre": "Google Maps de Conflictos",
        "corto": "G.MAPS"
      },
      {
        "clave": "bolsamonedas",
        "nombre": "Bolsa de Monedas (crea tu propia moneda)",
        "corto": "MONEDAS"
      }
    ]
  },
  {
    "clave": "social",
    "nombre": "SOCIAL",
    "corto": "SOCIAL",
    "color": "violet",
    "desc": "Empleos con sueldos reales, crisis mundial, embajadores, salas, encuestas del mundo, redes oficiales y comunidad — con VANGUARD ID (el carnet del…",
    "salas": [
      {
        "clave": "empleos",
        "nombre": "Empleos de Vanguard (trabaja por sueldos)",
        "corto": "EMPLEOS"
      },
      {
        "clave": "consejoia",
        "nombre": "Consejo de Acero (IA)",
        "corto": "CONSEJO"
      },
      {
        "clave": "crisis",
        "nombre": "Crisis Mundial",
        "corto": "CRISIS"
      },
      {
        "clave": "contribuidores",
        "nombre": "Comunidad de Contribuidores",
        "corto": "CONTRIB"
      },
      {
        "clave": "gobierno",
        "nombre": "Gobierno Mundial (presidente, decretos, reclutar)",
        "corto": "GOBIERNO"
      },
      {
        "clave": "embajadores",
        "nombre": "Embajadores por País",
        "corto": "EMBAJAD"
      },
      {
        "clave": "alianzas",
        "nombre": "Alianzas",
        "corto": "ALIANZAS"
      },
      {
        "clave": "salas",
        "nombre": "Salas sociales",
        "corto": "SALAS"
      },
      {
        "clave": "foros",
        "nombre": "Foros",
        "corto": "FOROS"
      },
      {
        "clave": "encuestas",
        "nombre": "Encuestas",
        "corto": "ENCUESTAS"
      },
      {
        "clave": "redes",
        "nombre": "Redes de Vanguard",
        "corto": "REDES"
      },
      {
        "clave": "amigos",
        "nombre": "Amigos",
        "corto": "AMIGOS"
      },
      {
        "clave": "torneos",
        "nombre": "Torneos",
        "corto": "TORNEOS"
      },
      {
        "clave": "perfil",
        "nombre": "Personalizar Perfil",
        "corto": "PERFIL"
      },
      {
        "clave": "identidad",
        "nombre": "VANGUARD ID (carnet, KNOWLEDGE LEVEL y privacidad)",
        "corto": "ID"
      }
    ]
  },
  {
    "clave": "sistema",
    "nombre": "SISTEMA",
    "corto": "SISTEMA",
    "color": "cyan",
    "desc": "EL GOBIERNO LIBRE (tu credencial exclusiva y los agentes autónomos que pulen Vanguard), EL ATELIER (las cinco leyes del lujo de la Casa), LA CAMA…",
    "salas": [
      {
        "clave": "agentes",
        "nombre": "EL GOBIERNO LIBRE (tu credencial exclusiva y los agentes autónomos que pulen Vanguard cada cierto tiempo — como un gobierno, pero libre)",
        "corto": "AGENTES"
      },
      {
        "clave": "cama",
        "nombre": "LA CAMA (personalización total: Vanguard se adapta a ti como la cama más cómoda)",
        "corto": "CAMA"
      },
      {
        "clave": "atelier",
        "nombre": "EL ATELIER (las cinco leyes del lujo: acabados finos, edición limitada numerada, tu serie grabada, modo galería e historia de la Casa)",
        "corto": "ATELIER"
      },
      {
        "clave": "agente",
        "nombre": "Perfil del Agente (IQ)",
        "corto": "AGENTE"
      },
      {
        "clave": "analista",
        "nombre": "PERFIL DE ANALISTA (nivel, insignias, retos semanales de investigación y ELO)",
        "corto": "ANALISTA"
      },
      {
        "clave": "fortaleza",
        "nombre": "FORTALEZA DE ACERO (sellos de seguridad, muros y blindajes de la Ciudadela)",
        "corto": "FORTALEZA"
      },
      {
        "clave": "logros",
        "nombre": "Logros",
        "corto": "LOGROS"
      },
      {
        "clave": "recompensas",
        "nombre": "Recompensas",
        "corto": "RECOMP"
      },
      {
        "clave": "ranking",
        "nombre": "Ranking global",
        "corto": "RANKING"
      },
      {
        "clave": "racha",
        "nombre": "Racha",
        "corto": "RACHA"
      },
      {
        "clave": "fusion",
        "nombre": "Fusion",
        "corto": "FUSION"
      },
      {
        "clave": "registro",
        "nombre": "Registro",
        "corto": "REGISTRO"
      },
      {
        "clave": "estadisticas",
        "nombre": "Estadísticas",
        "corto": "ESTADÍS"
      },
      {
        "clave": "notificaciones",
        "nombre": "Alertas",
        "corto": "ALERTAS"
      },
      {
        "clave": "telegram",
        "nombre": "Bot de Telegram",
        "corto": "TELEGRAM"
      },
      {
        "clave": "tienda",
        "nombre": "Tienda",
        "corto": "TIENDA"
      },
      {
        "clave": "ayuda",
        "nombre": "Ayuda",
        "corto": "AYUDA"
      }
    ]
  },
  {
    "clave": "experimental",
    "nombre": "EXPERIMENTAL",
    "corto": "EXPERIM",
    "color": "violet",
    "desc": "La página de los imposibles: escribe y mira tus palabras convertirse en letras 3D de verdad (forja de letras, órbita de palabras y lluvia de letras…",
    "salas": [
      {
        "clave": "experimental",
        "nombre": "EXPERIMENTAL (la página de los imposibles: forja de letras 3D, órbita de palabras y lluvia de letras)",
        "corto": "EXPERIM"
      }
    ]
  },
  {
    "clave": "arquitecto",
    "nombre": "ARQUITECTO",
    "corto": "ARQUIT",
    "color": "green",
    "desc": "El agente autónomo de Vanguard: se promptea a sí mismo y trabaja sin fin — instala módulos funcionales, compone obras para la radio, firma…",
    "salas": [
      {
        "clave": "arquitecto",
        "nombre": "ARQUITECTO (el agente autónomo que mejora Vanguard solo: se promptea a sí mismo, instala módulos, compone obras y nunca se detiene)",
        "corto": "ARQUIT"
      }
    ]
  },
  {
    "clave": "nueva",
    "nombre": "NUEVA PESTAÑA",
    "corto": "NUEVA",
    "color": "amber",
    "desc": "Elige tu destino: buscador de secciones, atajos recientes, los 14 mundos y todo el índice de Vanguard",
    "salas": [
      {
        "clave": "nueva",
        "nombre": "NUEVA PESTAÑA (elige tu destino: buscador, atajos y todo el índice de Vanguard)",
        "corto": "NUEVA"
      }
    ]
  }
];

export const TOTAL_SALAS = CONSTELACIONES.reduce((t, c) => t + c.salas.length, 0);

/** Todas las salas en una sola lista, con su constelación — para el buscador. */
export const SALAS_MAPA = CONSTELACIONES.flatMap((c) =>
  c.salas.map((s) => ({ ...s, constelacion: c.nombre, constelacionCorta: c.corto, color: c.color }))
);
