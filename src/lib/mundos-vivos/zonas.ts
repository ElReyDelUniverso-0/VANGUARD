// ═══════════════════════════════════════════════════════════════════
// v422.0 VANGUARD WORLDS — LOS MUNDOS REALES
//
// Cinco zonas reales del planeta, cada una un mundo explorable. Cada
// lugar es REAL (ciudad o país con coordenadas reales) y cada experiencia
// que enlaza es una puerta REAL de Vanguard: fichas de país, historia,
// acontecimientos, datos, educación, simulaciones y obras documentadas del
// Atlas de infraestructura. Nada ficticio: una puerta que no existe no
// viaja en este catálogo.
//
// Para añadir un mundo: una entrada en ZONAS_MUNDOS con sus lugares.
// El marco no cambia — la arquitectura es declarativa, como las capas
// del Centro de Mapas.
// ═══════════════════════════════════════════════════════════════════

import type { ZonaMundo } from "./tipos";

/** Una puerta a la ficha de país: la información básica, real. */
const FICHA = (iso: string): { ruta: string; etiqueta: string; motivo: string } => ({
  ruta: `/mundos/${iso}`,
  etiqueta: `Ficha de país · ${iso.toUpperCase()}`,
  motivo: "Población, gobierno, superficie y las puertas del país en la casa.",
});

/** El ATLAS del planeta: la sala de las naciones y sus fichas largas. */
const ATLAS = (iso: string, nombre: string): { ruta: string; etiqueta: string; motivo: string } => ({
  ruta: "/atlas",
  etiqueta: `Atlas · ${nombre}`,
  motivo: `La sala del Atlas: ${nombre} entre las naciones con capital, población, gobierno y superficie documentadas.`,
});

/** Una obra documentada del Atlas de infraestructura (id real del catálogo). */
const OBRA = (id: string): { ruta: string; etiqueta: string; motivo: string } => ({
  ruta: `/infraestructura/obra/${id}`,
  etiqueta: "Obra del Atlas",
  motivo: "La obra documentada del Atlas: fecha, características y fuente pública.",
});

export const ZONAS_MUNDOS: ZonaMundo[] = [
  // ── AMÉRICA ──────────────────────────────────────────────────────────
  {
    id: "america",
    nombre: "América",
    lema: "Del desierto de Atacama a los grandes lagos: el continente de los puentes, los volcanes y las grandes obras.",
    centro: { lat: 12, lng: -60, altitud: 1.35 },
    acento: "#38BDF8",
    glifo: "🌎",
    lugares: [
      {
        id: "ciudad-de-mexico",
        nombre: "Ciudad de México",
        pais: { nombre: "México", iso2: "mx" },
        lat: 19.4326,
        lng: -99.1332,
        nota: "La capital más alta de América: arte, historia y uno de los aeropuertos más transitados del continente.",
        experiencias: [
          { ...FICHA("mx"), categoria: "informacion" },
          { ...ATLAS("mx", "México"), categoria: "informacion" },
          { ...OBRA("aeropuerto-mexico-beniz-diez"), categoria: "infraestructura" },
          { ruta: "/novedades", etiqueta: "Novedades", motivo: "Lo que pasa hoy, con su fuente y su verificación.", categoria: "acontecimientos" },
        ],
      },
      {
        id: "nueva-york",
        nombre: "Nueva York",
        pais: { nombre: "Estados Unidos", iso2: "us" },
        lat: 40.7128,
        lng: -74.006,
        nota: "La ciudad de los puentes: el ritmo financiero del planeta y obras icónicas de ingeniería.",
        experiencias: [
          { ...FICHA("us"), categoria: "informacion" },
          { ...ATLAS("us", "Estados Unidos"), categoria: "informacion" },
          { ...OBRA("puente-brooklyn"), categoria: "infraestructura" },
          { ruta: "/datos-mundiales", etiqueta: "Datos del mundo", motivo: "Los indicadores oficiales del Banco Mundial, país por país.", categoria: "datos" },
        ],
      },
      {
        id: "san-francisco",
        nombre: "San Francisco",
        pais: { nombre: "Estados Unidos", iso2: "us" },
        lat: 37.7749,
        lng: -122.4194,
        nota: "La puerta dorada al Pacífico: el puente más fotografiado del mundo y la tecnología de la costa oeste.",
        experiencias: [
          { ...FICHA("us"), categoria: "informacion" },
          { ...OBRA("puente-golden-gate"), categoria: "infraestructura" },
          { ruta: "/ciencia", etiqueta: "Ciencia", motivo: "El departamento científico: publicaciones con DOI y evidencia verificable.", categoria: "educacion" },
        ],
      },
      {
        id: "sao-paulo",
        nombre: "São Paulo",
        pais: { nombre: "Brasil", iso2: "br" },
        lat: -23.5505,
        lng: -46.6333,
        nota: "La urbe más grande de América del Sur: agua de iniciativa propia y la universidad que formó a la región.",
        experiencias: [
          { ...FICHA("br"), categoria: "informacion" },
          { ...OBRA("agua-sao-paulo-cantareira"), categoria: "infraestructura" },
          { ...OBRA("educacion-universidad-sao-paulo"), categoria: "educacion" },
          { ruta: "/datos", etiqueta: "Datos", motivo: "Los indicadores en vivo que mide la casa.", categoria: "datos" },
        ],
      },
      {
        id: "buenos-aires",
        nombre: "Buenos Aires",
        pais: { nombre: "Argentina", iso2: "ar" },
        lat: -34.6037,
        lng: -58.3816,
        nota: "La capital del sur: historia política vibrante y la universidad más antigua del continente.",
        experiencias: [
          { ...FICHA("ar"), categoria: "informacion" },
          { ...ATLAS("ar", "Argentina"), categoria: "informacion" },
          { ...OBRA("educacion-universidad-argentina"), categoria: "educacion" },
          { ruta: "/historia", etiqueta: "Historia", motivo: "El archivo de la casa: hechos verificados, fechas y protagonistas.", categoria: "historia" },
        ],
      },
      {
        id: "panama",
        nombre: "Panamá",
        pais: { nombre: "Panamá", iso2: "pa" },
        lat: 8.9824,
        lng: -79.5199,
        nota: "El nudo del planeta: el canal que une dos océanos y el puerto que mueve el comercio mundial.",
        experiencias: [
          { ...FICHA("pa"), categoria: "informacion" },
          { ...OBRA("puerto-panama"), categoria: "infraestructura" },
          { ruta: "/datos-mundiales", etiqueta: "Datos del mundo", motivo: "El comercio y los indicadores oficiales del país.", categoria: "datos" },
        ],
      },
      {
        id: "bogota",
        nombre: "Bogotá",
        pais: { nombre: "Colombia", iso2: "co" },
        lat: 4.711,
        lng: -74.0721,
        nota: "La ciudad de la montaña: la universidad pública más grande del país y una región en permanente actualidad.",
        experiencias: [
          { ...FICHA("co"), categoria: "informacion" },
          { ...OBRA("educacion-universidad-bogota"), categoria: "educacion" },
          { ruta: "/novedades", etiqueta: "Novedades", motivo: "La actualidad verificada de la región.", categoria: "acontecimientos" },
        ],
      },
      {
        id: "los-angeles",
        nombre: "Los Ángeles",
        pais: { nombre: "Estados Unidos", iso2: "us" },
        lat: 34.0522,
        lng: -118.2437,
        nota: "La ciudad de la velocidad: el puerto y el aeropuerto que mueven el transporte de la costa oeste.",
        experiencias: [
          { ...FICHA("us"), categoria: "informacion" },
          { ...OBRA("puerto-los-angeles"), categoria: "infraestructura" },
          { ...OBRA("aeropuerto-los-angeles"), categoria: "infraestructura" },
        ],
      },
    ],
  },

  // ── EUROPA ──────────────────────────────────────────────────────────
  {
    id: "europa",
    nombre: "Europa",
    lema: "Del clásico al renacimiento: crónicas, universidades antiguas y las obras que conectaron un continente.",
    centro: { lat: 50, lng: 10, altitud: 1.35 },
    acento: "#818CF8",
    glifo: "🌍",
    lugares: [
      {
        id: "londres",
        nombre: "Londres",
        pais: { nombre: "Reino Unido", iso2: "gb" },
        lat: 51.5072,
        lng: -0.1276,
        nota: "La ciudad del Támesis: la historia viva del continente y un sistema de agua que alimenta a millones.",
        experiencias: [
          { ...FICHA("gb"), categoria: "informacion" },
          { ...ATLAS("gb", "Reino Unido"), categoria: "informacion" },
          { ...OBRA("agua-london-thames"), categoria: "infraestructura" },
          { ruta: "/historia", etiqueta: "Historia", motivo: "El archivo de la casa sobre el continente.", categoria: "historia" },
        ],
      },
      {
        id: "paris",
        nombre: "París",
        pais: { nombre: "Francia", iso2: "fr" },
        lat: 48.8566,
        lng: 2.3522,
        nota: "La capital de la cultura: la universidad que formó a Europa y el aeropuerto que conecta el continente.",
        experiencias: [
          { ...FICHA("fr"), categoria: "informacion" },
          { ...OBRA("aeropuerto-paris-cdg"), categoria: "infraestructura" },
          { ...OBRA("educacion-universidad-paris"), categoria: "educacion" },
        ],
      },
      {
        id: "madrid",
        nombre: "Madrid",
        pais: { nombre: "España", iso2: "es" },
        lat: 40.4168,
        lng: -3.7038,
        nota: "El centro peninsular: el aeropuerto que concentra el tráfico del sur de Europa.",
        experiencias: [
          { ...FICHA("es"), categoria: "informacion" },
          { ...ATLAS("es", "España"), categoria: "informacion" },
          { ...OBRA("aeropuerto-madrid-barajas"), categoria: "infraestructura" },
          { ruta: "/datos", etiqueta: "Datos", motivo: "Los indicadores de la casa en vivo.", categoria: "datos" },
        ],
      },
      {
        id: "berlin",
        nombre: "Berlín",
        pais: { nombre: "Alemania", iso2: "de" },
        lat: 52.52,
        lng: 13.405,
        nota: "La capital dividida y unida: el epicentro de la historia europea del siglo XX.",
        experiencias: [
          { ...FICHA("de"), categoria: "informacion" },
          { ruta: "/historia", etiqueta: "Historia", motivo: "El archivo de la casa: la Europa del siglo XX, verificada.", categoria: "historia" },
          { ruta: "/datos-mundiales", etiqueta: "Datos del mundo", motivo: "Los indicadores oficiales de Alemania.", categoria: "datos" },
        ],
      },
      {
        id: "roma",
        nombre: "Roma",
        pais: { nombre: "Italia", iso2: "it" },
        lat: 41.9028,
        lng: 12.4964,
        nota: "La ciudad eterna: donde la ingeniería romana meet la red de transporte moderno.",
        experiencias: [
          { ...FICHA("it"), categoria: "informacion" },
          { ...OBRA("aeropuerto-fiumicino"), categoria: "infraestructura" },
          { ruta: "/historia", etiqueta: "Historia", motivo: "El archivo de la casa: la Roma antigua y su legado.", categoria: "historia" },
        ],
      },
      {
        id: "amsterdam",
        nombre: "Ámsterdam",
        pais: { nombre: "Países Bajos", iso2: "nl" },
        lat: 52.3676,
        lng: 4.9041,
        nota: "La ciudad del agua: el puerto que mueve Europa y el aeropuerto de conexión continental.",
        experiencias: [
          { ...FICHA("nl"), categoria: "informacion" },
          { ...OBRA("aeropuerto-schiphol"), categoria: "infraestructura" },
          { ...OBRA("puerto-rotterdam"), categoria: "infraestructura" },
        ],
      },
      {
        id: "moscow",
        nombre: "Moscú",
        pais: { nombre: "Rusia", iso2: "ru" },
        lat: 55.7558,
        lng: 37.6173,
        nota: "La capital del norte: un teatro de la geopolítica contemporánea y un archivo histórico de primer orden.",
        experiencias: [
          { ...FICHA("ru"), categoria: "informacion" },
          { ruta: "/conflicto", etiqueta: "Conflictos", motivo: "Los teatros activos del planeta, en vivo.", categoria: "acontecimientos" },
          { ruta: "/historia", etiqueta: "Historia", motivo: "El archivo de la casa sobre el siglo XX.", categoria: "historia" },
        ],
      },
      {
        id: "istanbul",
        nombre: "Estambul",
        pais: { nombre: "Turquía", iso2: "tr" },
        lat: 41.0082,
        lng: 28.9784,
        nota: "El puente entre continentes: el estrecho que une Europa y Asia y el tráfico marítimo que pasa por él.",
        experiencias: [
          { ...FICHA("tr"), categoria: "informacion" },
          { ...OBRA("puente-bosphorus"), categoria: "infraestructura" },
          { ruta: "/datos", etiqueta: "Datos", motivo: "Los indicadores de la casa en vivo.", categoria: "datos" },
        ],
      },
    ],
  },

  // ── AFRICA ──────────────────────────────────────────────────────────
  {
    id: "africa",
    nombre: "África",
    lema: "Del Sahara al cabo: presas, energía solar, universidades y un continente en permanente transformación.",
    centro: { lat: 2, lng: 20, altitud: 1.35 },
    acento: "#FBBF24",
    glifo: "☀️",
    lugares: [
      {
        id: "cairo",
        nombre: "El Cairo",
        pais: { nombre: "Egipto", iso2: "eg" },
        lat: 30.0444,
        lng: 31.2357,
        nota: "La ciudad del Nilo: la presa que cambió el río y el aeropuerto que conecta el continente.",
        experiencias: [
          { ...FICHA("eg"), categoria: "informacion" },
          { ...ATLAS("eg", "Egipto"), categoria: "informacion" },
          { ...OBRA("aeropuerto-cairo"), categoria: "infraestructura" },
          { ruta: "/historia", etiqueta: "Historia", motivo: "El archivo de la casa: la historia del Nilo y del Mediterráneo.", categoria: "historia" },
        ],
      },
      {
        id: "lagos",
        nombre: "Lagos",
        pais: { nombre: "Nigeria", iso2: "ng" },
        lat: 6.5244,
        lng: 3.3792,
        nota: "La ciudad más grande del continente por población: el motor demográfico de África.",
        experiencias: [
          { ...FICHA("ng"), categoria: "informacion" },
          { ruta: "/datos-mundiales", etiqueta: "Datos del mundo", motivo: "Los indicadores oficiales: población, renta y esperanza de vida.", categoria: "datos" },
          { ruta: "/novedades", etiqueta: "Novedades", motivo: "La actualidad verificada del país.", categoria: "acontecimientos" },
        ],
      },
      {
        id: "johannesburg",
        nombre: "Johannesburgo",
        pais: { nombre: "Sudáfrica", iso2: "za" },
        lat: -26.2041,
        lng: 28.0473,
        nota: "La ciudad del oro: el aeropuerto que conecta el sur del continente con el mundo.",
        experiencias: [
          { ...FICHA("za"), categoria: "informacion" },
          { ...OBRA("aeropuerto-johannesburg"), categoria: "infraestructura" },
          { ruta: "/datos", etiqueta: "Datos", motivo: "Los indicadores de la casa en vivo.", categoria: "datos" },
        ],
      },
      {
        id: "nairobi",
        nombre: "Nairobi",
        pais: { nombre: "Kenia", iso2: "ke" },
        lat: -1.2921,
        lng: 36.8219,
        nota: "La capital del este: el nudo de la logística regional y una universidad en crecimiento.",
        experiencias: [
          { ...FICHA("ke"), categoria: "informacion" },
          { ruta: "/datos-mundiales", etiqueta: "Datos del mundo", motivo: "Los indicadores oficiales del país.", categoria: "datos" },
          { ruta: "/academia", etiqueta: "Academia", motivo: "Los cursos de la casa para explorar y aprender.", categoria: "educacion" },
        ],
      },
      {
        id: "ouarzazate",
        nombre: "Ouarzazate",
        pais: { nombre: "Marruecos", iso2: "ma" },
        lat: 30.9114,
        lng: -7.0926,
        nota: "La ciudad del sol: el complejo de energía solar que alimenta a millones en el norte de África.",
        experiencias: [
          { ...FICHA("ma"), categoria: "informacion" },
          { ...OBRA("central-solar-noor-ouarzazate"), categoria: "infraestructura" },
          { ruta: "/ciencia", etiqueta: "Ciencia", motivo: "La energía renovable medida con evidencia verificable.", categoria: "educacion" },
        ],
      },
      {
        id: "pretoria",
        nombre: "Pretoria",
        pais: { nombre: "Sudáfrica", iso2: "za" },
        lat: -25.7479,
        lng: 28.2293,
        nota: "La capital administrativa: el centro de las organizaciones regionales del sur.",
        experiencias: [
          { ...FICHA("za"), categoria: "informacion" },
          { ruta: "/organizaciones", etiqueta: "Organizaciones", motivo: "Las instituciones reales y sus relaciones verificadas.", categoria: "informacion" },
        ],
      },
      {
        id: "dakar",
        nombre: "Dakar",
        pais: { nombre: "Senegal", iso2: "sn" },
        lat: 14.7167,
        lng: -17.4677,
        nota: "El último punto de África hacia el océano: la puerta atlántica del continente.",
        experiencias: [
          { ...FICHA("sn"), categoria: "informacion" },
          { ruta: "/datos-mundiales", etiqueta: "Datos del mundo", motivo: "Los indicadores oficiales del país.", categoria: "datos" },
        ],
      },
      {
        id: "accra",
        nombre: "Acra",
        pais: { nombre: "Ghana", iso2: "gh" },
        lat: 5.6037,
        lng: -0.187,
        nota: "La capital del Golfo de Guinea: un país en rápida transformación demográfica.",
        experiencias: [
          { ...FICHA("gh"), categoria: "informacion" },
          { ruta: "/academia", etiqueta: "Academia", motivo: "Los cursos de la casa para explorar y aprender.", categoria: "educacion" },
        ],
      },
    ],
  },

  // ── ASIA ────────────────────────────────────────────────────────────
  {
    id: "asia",
    nombre: "Asia",
    lema: "Del maglev al desierto: la tecnología, las presas y las ciudades que definen el continente más habitado.",
    centro: { lat: 35, lng: 100, altitud: 1.35 },
    acento: "#F472B6",
    glifo: "🌸",
    lugares: [
      {
        id: "tokyo",
        nombre: "Tokio",
        pais: { nombre: "Japón", iso2: "jp" },
        lat: 35.6762,
        lng: 139.6503,
        nota: "La metrópoli más grande del mundo: el tren de alta velocidad y el aeropuerto que lo conectan.",
        experiencias: [
          { ...FICHA("jp"), categoria: "informacion" },
          { ...ATLAS("jp", "Japón"), categoria: "informacion" },
          { ...OBRA("ferrocarril-shinkansen"), categoria: "infraestructura" },
          { ...OBRA("aeropuerto-tokyo-haneda"), categoria: "infraestructura" },
        ],
      },
      {
        id: "shanghai",
        nombre: "Shanghái",
        pais: { nombre: "China", iso2: "cn" },
        lat: 31.2304,
        lng: 121.4737,
        nota: "La ciudad más poblada del planeta: el tren de levitación magnética y la presa más grande del mundo.",
        experiencias: [
          { ...FICHA("cn"), categoria: "informacion" },
          { ...OBRA("ferrocarril-shanghai-maglev"), categoria: "infraestructura" },
          { ...OBRA("central-three-gorges"), categoria: "infraestructura" },
        ],
      },
      {
        id: "peking",
        nombre: "Pekín",
        pais: { nombre: "China", iso2: "cn" },
        lat: 39.9042,
        lng: 116.4074,
        nota: "La capital china: la historia milenaria y el aeropuerto que mueve al continente.",
        experiencias: [
          { ...FICHA("cn"), categoria: "informacion" },
          { ...ATLAS("cn", "China"), categoria: "informacion" },
          { ...OBRA("aeropuerto-peking-daoxiang"), categoria: "infraestructura" },
          { ruta: "/historia", etiqueta: "Historia", motivo: "El archivo de la casa sobre la región.", categoria: "historia" },
        ],
      },
      {
        id: "singapore",
        nombre: "Singapur",
        pais: { nombre: "Singapur", iso2: "sg" },
        lat: 1.3521,
        lng: 103.8198,
        nota: "La ciudad-estado del estrecho: el puerto, el aeropuerto y el sistema de agua que lo sostiene.",
        experiencias: [
          { ...FICHA("sg"), categoria: "informacion" },
          { ...OBRA("aeropuerto-changi"), categoria: "infraestructura" },
          { ...OBRA("puerto-singapore"), categoria: "infraestructura" },
          { ...OBRA("agua-singapur-newater"), categoria: "infraestructura" },
        ],
      },
      {
        id: "dubai",
        nombre: "Dubái",
        pais: { nombre: "Emiratos Árabes Unidos", iso2: "ae" },
        lat: 25.2048,
        lng: 55.2708,
        nota: "La ciudad del desierto: la torre más alta del planeta y el aeropuerto que conecta tres continentes.",
        experiencias: [
          { ...FICHA("ae"), categoria: "informacion" },
          { ...OBRA("edificio-burj"), categoria: "infraestructura" },
          { ...OBRA("aeropuerto-dubai-internacional"), categoria: "infraestructura" },
        ],
      },
      {
        id: "mumbai",
        nombre: "Bombay",
        pais: { nombre: "India", iso2: "in" },
        lat: 19.076,
        lng: 72.8777,
        nota: "La ciudad de los millones: el puerto que alimenta a la subcontinente y su ferrocarril histórico.",
        experiencias: [
          { ...FICHA("in"), categoria: "informacion" },
          { ...OBRA("puerto-mumbai"), categoria: "infraestructura" },
          { ...OBRA("ferrocarril-chhatrapati-shivaji"), categoria: "infraestructura" },
        ],
      },
      {
        id: "delhi",
        nombre: "Nueva Delhi",
        pais: { nombre: "India", iso2: "in" },
        lat: 28.6139,
        lng: 77.209,
        nota: "La capital india: la historia del subcontinente y el sistema de agua que la sostiene.",
        experiencias: [
          { ...FICHA("in"), categoria: "informacion" },
          { ...OBRA("agua-delhi-mckenzie"), categoria: "infraestructura" },
          { ruta: "/datos-mundiales", etiqueta: "Datos del mundo", motivo: "Los indicadores oficiales del país.", categoria: "datos" },
        ],
      },
      {
        id: "seoul",
        nombre: "Seúl",
        pais: { nombre: "Corea del Sur", iso2: "kr" },
        lat: 37.5665,
        lng: 126.978,
        nota: "La capital de la tecnología: uno de los aeropuertos más eficientes del continente.",
        experiencias: [
          { ...FICHA("kr"), categoria: "informacion" },
          { ...OBRA("aeropuerto-incheon"), categoria: "infraestructura" },
          { ruta: "/academia", etiqueta: "Academia", motivo: "Los cursos de la casa para explorar y aprender.", categoria: "educacion" },
        ],
      },
      {
        id: "bangkok",
        nombre: "Bangkok",
        pais: { nombre: "Tailandia", iso2: "th" },
        lat: 13.7563,
        lng: 100.5018,
        nota: "La capital del sudeste: el corazón del turismo y la conexión asiática.",
        experiencias: [
          { ...FICHA("th"), categoria: "informacion" },
          { ...OBRA("sanitaria-hospital-bangkok"), categoria: "infraestructura" },
          { ruta: "/novedades", etiqueta: "Novedades", motivo: "La actualidad verificada de la región.", categoria: "acontecimientos" },
        ],
      },
    ],
  },

  // ── OCEANÍA ─────────────────────────────────────────────────────────
  {
    id: "oceania",
    nombre: "Oceanía",
    lema: "La ventana al Pacífico Sur: la bahía de Sydney, su ópera y la ciencia del sur del mundo.",
    centro: { lat: -25, lng: 135, altitud: 1.35 },
    acento: "#34D399",
    glifo: "🦘",
    lugares: [
      {
        id: "sydney",
        nombre: "Sídney",
        pais: { nombre: "Australia", iso2: "au" },
        lat: -33.8688,
        lng: 151.2093,
        nota: "La ciudad de la bahía: el puente, el opera y el aeropuerto que definen la puerta del Pacífico Sur.",
        experiencias: [
          { ...FICHA("au"), categoria: "informacion" },
          { ...ATLAS("au", "Australia"), categoria: "informacion" },
          { ...OBRA("puente-sydney-harbour"), categoria: "infraestructura" },
          { ...OBRA("aeropuerto-sydney"), categoria: "infraestructura" },
        ],
      },
      {
        id: "melbourne",
        nombre: "Melbourne",
        pais: { nombre: "Australia", iso2: "au" },
        lat: -37.8136,
        lng: 144.9631,
        nota: "La ciudad de la cultura: la universidad que formó a la región y los indicadores de la casa.",
        experiencias: [
          { ...FICHA("au"), categoria: "informacion" },
          { ruta: "/datos-mundiales", etiqueta: "Datos del mundo", motivo: "Los indicadores oficiales del país.", categoria: "datos" },
          { ruta: "/academia", etiqueta: "Academia", motivo: "Los cursos de la casa para explorar y aprender.", categoria: "educacion" },
        ],
      },
      {
        id: "auckland",
        nombre: "Auckland",
        pais: { nombre: "Nueva Zelanda", iso2: "nz" },
        lat: -36.8485,
        lng: 174.7633,
        nota: "La ciudad de los volcanes: la puerta del Pacífico Sur y la ciencia que se hace en ella.",
        experiencias: [
          { ...FICHA("nz"), categoria: "informacion" },
          { ruta: "/ciencia", etiqueta: "Ciencia", motivo: "El departamento científico: publicaciones con DOI y evidencia.", categoria: "educacion" },
        ],
      },
      {
        id: "port-moresby",
        nombre: "Port Moresby",
        pais: { nombre: "Papúa Nueva Guinea", iso2: "pg" },
        lat: -9.4438,
        lng: 147.1803,
        nota: "La capital del Pacífico occidental: el punto de conexión de la región.",
        experiencias: [
          { ...FICHA("pg"), categoria: "informacion" },
          { ruta: "/datos-mundiales", etiqueta: "Datos del mundo", motivo: "Los indicadores oficiales del país.", categoria: "datos" },
        ],
      },
      {
        id: "suva",
        nombre: "Suva",
        pais: { nombre: "Fiyi", iso2: "fj" },
        lat: -18.1416,
        lng: 178.4419,
        nota: "La capital del Pacífico central: la puerta de las islas del océano.",
        experiencias: [
          { ...FICHA("fj"), categoria: "informacion" },
          { ruta: "/datos", etiqueta: "Datos", motivo: "Los indicadores de la casa en vivo.", categoria: "datos" },
        ],
      },
      {
        id: "canberra",
        nombre: "Canberra",
        pais: { nombre: "Australia", iso2: "au" },
        lat: -35.2809,
        lng: 149.13,
        nota: "La capital planificada: el centro de las organizaciones regionales del Pacífico.",
        experiencias: [
          { ...FICHA("au"), categoria: "informacion" },
          { ruta: "/organizaciones", etiqueta: "Organizaciones", motivo: "Las instituciones reales y sus relaciones verificadas.", categoria: "informacion" },
        ],
      },
    ],
  },
];
