// ============================================================
// v129.0 LA SALA DE GUERRA — TEATROS ACTIVOS DEL PLANETA
// El corazón de datos del mega simulador: cada guerra activa
// (y el teatro observado que aún no arde) con sus ciudades,
// sus frentes, sus zonas de control, sus fuerzas enfrentadas,
// sus bajas honestas y sus cuotas de la casa.
//
// HONESTIDAD DE LA CASA: todo lo que vive aquí son ESTIMACIONES
// EDITORIALIZADAS construidas con fuentes abiertas (OSINT):
// ISW, ACLED, OCHA, ACNUR, informes de la ONU y prensa
// internacional. Las zonas de control son esquemas aproximados,
// no cartografía oficial. Vanguard no predice: presenta.
// ============================================================

export type EstadoCiudad =
  | "capital"     // capital intacta de un bando
  | "segura"      // bajo control, sin combate diario
  | "contendida"  // bombardeada / disputada
  | "frente"      // en la línea de fuego hoy
  | "sitio"       // cercada
  | "ocupada"     // tomada por el bando B
  | "puerto"      // puerto logístico
  | "observada";  // teatro sin guerra activa

export interface CiudadGuerra {
  nombre: string;
  lat: number;
  lng: number;
  estado: EstadoCiudad;
  nota?: string;
}

// polilínea de frente aproximada [lat, lng]
export interface FrenteGuerra {
  nombre: string;
  puntos: [number, number][];
}

// polígono de control aproximado [lat, lng]
export interface ZonaControl {
  bando: "A" | "B";
  nombre: string;
  polygon: [number, number][];
}

export interface Fuerzas {
  nombre: string;
  bandera: string;
  efectivos: number;   // miles de efectivos desplegados
  tanques: number;     // blindados operativos (estimado)
  artilleria: number;  // tubos y MLRS (estimado)
  aeronaves: number;   // aviones de combate operativos
  apoyos: string;      // quién la respalda
}

export interface CuotaGuerra {
  escenario: string;
  cuota: string;
}

export interface HitoGuerra {
  fecha: string;
  evento: string;
}

export type TerrenoGuerra = "llanura" | "urbano" | "desierto" | "sabana" | "selva" | "maritimo";

export interface GuerraActiva {
  id: string;
  num: number;
  nombre: string;
  subtitulo: string;
  activa: boolean;              // false = teatro observado (todavía no arde)
  desde: string;
  intensidad: number;           // 0-100
  escalada: number;             // 1-5
  terreno: TerrenoGuerra;
  lat: number; lng: number;     // centro del teatro (cámara 3D)
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  bandoA: Fuerzas;              // el bando defendido por la Casa en el mapa (azul)
  bandoB: Fuerzas;              // el bando opuesto (rojo)
  resumen: string;
  actores: string[];            // potencias externas en la mesa
  riesgoGlobal: string;
  bajas: { texto: string; nota: string };
  desplazados: string;
  ciudades: CiudadGuerra[];
  frentes: FrenteGuerra[];
  zonas: ZonaControl[];
  hitos: HitoGuerra[];
  apuestas: CuotaGuerra[];
  keywords: string[];           // pulso real: filtro de los cables de la casa
  fuente: string;
}

// ────────────────────────────────────────────────────────────
// TEATRO 01 — UCRANIA: la guerra mayor del siglo en Europa
// ────────────────────────────────────────────────────────────
const UCRANIA: GuerraActiva = {
  id: "ucrania", num: 1,
  nombre: "UCRANIA — LA GUERRA MAYOR",
  subtitulo: "La invasión a gran escala que devolvió la guerra de frentes a Europa",
  activa: true,
  desde: "24 de febrero de 2022",
  intensidad: 95, escalada: 5, terreno: "llanura",
  lat: 49.2, lng: 33.5,
  bbox: { minLat: 44.0, maxLat: 53.0, minLng: 22.0, maxLng: 41.0 },
  bandoA: { nombre: "Ucrania", bandera: "🇺🇦", efectivos: 880, tanques: 950, artilleria: 2000, aeronaves: 110, apoyos: "OTAN (armas, inteligencia, fondos)" },
  bandoB: { nombre: "Rusia", bandera: "🇷🇺", efectivos: 700, tanques: 2500, artilleria: 5000, aeronaves: 300, apoyos: "Irán (drones), Corea del Norte (municiones)" },
  resumen:
    "La mayor guerra de Europa desde 1945: tres frentes de mil kilómetros, cientos de drones " +
    "por noche y la primera guerra moderna de satélites baratos, artillería de precisión y " +
    "trincheras digitales. Empezó como blitzkrieg fallido sobre Kyiv y se convirtió en desgaste " +
    "de producción industrial: quien fabrica y repone más rápido, resiste. El Dniéper parte el " +
    "país como una espina; al este, las ciudades cambian de manos por barrios. Y sobre el mapa, " +
    "cada escalofrío de esta guerra mueve el trigo, el gas y el euro del planeta entero.",
  actores: ["OTAN", "EE. UU.", "UE", "China (comercio)", "Corea del Norte", "Irán"],
  riesgoGlobal: "ENERGÍA + TRIGO + NUCLEAR (Zaporizhzhia) — la escalada aquí manda en la inflación del mundo",
  bajas: {
    texto: "≈ 1.000.000 de bajas combinadas (muertos y heridos, ambos bandos) — la estimación OSINT más citada en 2025",
    nota: "Ninguno de los dos bandos publica cifras completas; las cuentas fiables son estimaciones de pérdidas visificadas",
  },
  desplazados: "6.9M de refugiados en el extranjero + 3.7M desplazados internos (ACNUR)",
  ciudades: [
    { nombre: "Kyiv", lat: 50.45, lng: 30.52, estado: "capital", nota: "la capital que aguantó el golpe de 72 horas" },
    { nombre: "Kharkiv", lat: 49.99, lng: 36.23, estado: "contendida", nota: "bombardeo diario desde la frontera" },
    { nombre: "Kupiansk", lat: 49.71, lng: 37.62, estado: "frente", nota: "eje norte del empuje ruso" },
    { nombre: "Pokrovsk", lat: 48.28, lng: 37.18, estado: "frente", nota: "la puerta logística del Donbas (2025)" },
    { nombre: "Avdiivka", lat: 48.14, lng: 37.74, estado: "ocupada", nota: "cayó en febrero de 2024 tras una década de sitio" },
    { nombre: "Bajmut", lat: 48.59, lng: 38.00, estado: "ocupada", nota: "el carnicero de 2023: 10 meses de molino" },
    { nombre: "Donetsk", lat: 48.02, lng: 37.80, estado: "ocupada", nota: "capital del Dontbas ocupado desde 2014" },
    { nombre: "Mariúpol", lat: 47.10, lng: 37.55, estado: "ocupada", nota: "el asedio del teatro y el Azovstal (2022)" },
    { nombre: "Zaporizhzhia", lat: 47.84, lng: 35.14, estado: "segura", nota: "junto a la central nuclear más grande de Europa" },
    { nombre: "Kherson", lat: 46.64, lng: 32.62, estado: "contendida", nota: "liberada en 2022, debajo del Dniéper ocupado" },
    { nombre: "Odesa", lat: 46.48, lng: 30.73, estado: "puerto", nota: "la salida del trigo ucraniano al mar" },
    { nombre: "Sebastopol", lat: 44.62, lng: 33.53, estado: "ocupada", nota: "anclaje de la flota rusa del mar Negro (Crimea)" },
  ],
  frentes: [
    {
      nombre: "FRENTE ESTE — la espina de mil kilómetros",
      puntos: [[49.95, 36.6], [49.6, 37.5], [49.2, 37.4], [48.6, 37.5], [48.28, 37.6], [48.14, 37.9], [47.7, 37.4], [47.1, 37.55], [46.9, 37.0]],
    },
    {
      nombre: "FRENTE SUR — el Dniéper congelado",
      puntos: [[46.9, 37.0], [47.3, 35.6], [47.5, 34.6], [46.9, 33.6], [46.64, 33.0], [46.3, 32.4]],
    },
  ],
  zonas: [
    {
      bando: "A", nombre: "Control ucraniano",
      polygon: [[52.3, 23.6], [52.3, 37.8], [50.1, 38.6], [49.7, 37.4], [49.2, 37.2], [48.6, 37.3], [48.1, 37.5], [47.6, 37.2], [47.1, 37.3], [46.8, 36.8], [46.9, 33.4], [46.5, 32.8], [46.4, 30.2], [48.4, 22.9], [51.0, 23.8]],
    },
    {
      bando: "B", nombre: "Ocupación rusa",
      polygon: [[50.1, 38.6], [52.3, 39.8], [52.3, 41.0], [44.3, 41.0], [44.3, 33.4], [46.5, 33.0], [46.9, 33.4], [46.8, 36.8], [47.1, 37.3], [47.6, 37.2], [48.1, 37.5], [48.6, 37.3], [49.2, 37.2], [49.7, 37.4]],
    },
  ],
  hitos: [
    { fecha: "24 FEB 2022", evento: "Invasión a gran escala: columnas hacia Kyiv, Járkov, Jersón y el sur" },
    { fecha: "ABR 2022", evento: "La ofensiva del norte fracasa: Rusia se retira de Kyiv — Bucha cambia el mundo" },
    { fecha: "SEP 2022", evento: "Contraofensiva relámpago de Járkov: 12.000 km² en una semana" },
    { fecha: "30 SEP 2022", evento: "Rusia anexa cuatro óblast que no controla — el mapa que Moscú insiste en pintar" },
    { fecha: "FEB 2023", evento: "Cae Bajmut: el asedio más largo y caro en hombres desde Stalingrado" },
    { fecha: "JUN 2023", evento: "Contraofensiva ucraniana del sur: avanza, pero no rompe la línea Súrovikin" },
    { fecha: "FEB 2024", evento: "Cae Avdiivka tras una década de sitio: las pilas de drones sustituyen al frente" },
    { fecha: "AGO 2024", evento: "Ucrania invade Kursk: la primera vez que Rusia pierde territorio propio desde 1945" },
    { fecha: "2025", evento: "La guerra de drones totales: el frente más mortífero es invisible desde el suelo" },
  ],
  apuestas: [
    { escenario: "Congelación del frente actual", cuota: "1.9x" },
    { escenario: "Alto el fuego negociado con fronteras de facto", cuota: "2.6x" },
    { escenario: "Nueva ofensiva rusa de gran escala", cuota: "3.8x" },
    { escenario: "Recuperación ucraniana completa (incl. Crimea)", cuota: "9.0x" },
  ],
  keywords: ["ukraine", "russia", "kyiv", "zelensky", "putin", "drone", "kremlin", "donbas"],
  fuente: "ISW (mapas diarios), ACLED, ACNUR, OCHA, informes militares de ambas partes",
};

// ────────────────────────────────────────────────────────────
// TEATRO 02 — ORIENTE MEDIO: el eje que arde desde Gaza
// ────────────────────────────────────────────────────────────
const ORIENTE: GuerraActiva = {
  id: "oriente", num: 2,
  nombre: "ORIENTE MEDIO — EL EJE EN LLAMAS",
  subtitulo: "Gaza, el Líbano, el mar Rojo y los intercambios con Irán: una guerra en cuatro tableros",
  activa: true,
  desde: "7 de octubre de 2023",
  intensidad: 85, escalada: 4, terreno: "urbano",
  lat: 31.5, lng: 35.5,
  bbox: { minLat: 12.0, maxLat: 37.5, minLng: 29.5, maxLng: 54.0 },
  bandoA: { nombre: "Israel + coalición", bandera: "🇮🇱", efectivos: 170, tanques: 2200, artilleria: 800, aeronaves: 345, apoyos: "EE. UU. (municiones, escudos, portaaviones)" },
  bandoB: { nombre: "Eje: Hamás · Hezbolá · hutíes · Irán", bandera: "🇵🇸", efectivos: 120, tanques: 0, artilleria: 400, aeronaves: 0, apoyos: "Irán (drones, misiles, fondos)" },
  resumen:
    "Una guerra que se pelea en cuatro tableros a la vez: la franja de Gaza, donde el combate " +
    "urbano contra túneles reescribe el manual; el Líbano, donde Hezbolá y el ejército israelí " +
    "se midieron a misilazos hasta la invasión de 2024; el mar Rojo, donde los hutíes disparan " +
    "contra un tercio del tráfico mundial de contenedores; y el cielo de Irán, donde por primera " +
    "vez dos Estados se lanzaron misiles directos en abierto (abril y octubre de 2024). Es el " +
    "teatro donde el precio de la escalada se mide en barcos, en rehenes y en mezquitas: cada " +
    "tablero puede encender el siguiente.",
  actores: ["EE. UU.", "Irán", "Qatar (mediador)", "Egipto (mediador)", "ONU", "Hezbolá", "Hutíes"],
  riesgoGlobal: "PETRÓLEO + CANAL DE SUEZ + NUCLEAR IRANÍ — el mar Rojo ya cobra peaje a medio planeta",
  bajas: {
    texto: "Gaza ≈ 60.000+ muertos (Ministerio de Salud de Gaza, ONU lo considera recuento fiable) · Israel 7-OCT ≈ 1.200 · Líbano ≈ 4.000 (2024)",
    nota: "Las cifras de Gaza no separan combatientes de civiles; los rehenes y desaparecidos siguen sin conteo cerrado",
  },
  desplazados: "≈ 1.9M de gazatíes desplazados internos (~90% de la población) + 1.2M en el Líbano (2024)",
  ciudades: [
    { nombre: "Gaza (ciudad)", lat: 31.50, lng: 34.47, estado: "sitio", nota: "el corazón de la operación y de los rehenes" },
    { nombre: "Rafah", lat: 31.29, lng: 34.25, estado: "frente", nota: "la frontera con Egipto: corredor humano y túneles" },
    { nombre: "Jenín", lat: 32.46, lng: 35.30, estado: "contendida", nota: "Cisjordania: el tercer tablero que se calienta" },
    { nombre: "Tel Aviv", lat: 32.09, lng: 34.78, estado: "capital", nota: "bajo cúpulas antimisiles cada alerta" },
    { nombre: "Jerusalén", lat: 31.78, lng: 35.22, estado: "capital", nota: "el epicentro simbólico del conflicto entero" },
    { nombre: "Beirut", lat: 33.89, lng: 35.50, estado: "contendida", nota: "bombardeos de precisión en 2024 y tregua frágil" },
    { nombre: "Teherán", lat: 35.69, lng: 51.39, estado: "contendida", nota: "los intercambios directos de 2024: el tablero mayor" },
    { nombre: "Sanaa", lat: 15.37, lng: 44.19, estado: "ocupada", nota: "los hutíes: el tablero del mar Rojo" },
    { nombre: "Damasco", lat: 33.51, lng: 36.29, estado: "observada", nota: "la nueva Siria de 2025: joker del tablero" },
  ],
  frentes: [
    { nombre: "FRENTE GAZA — el norte y el sur", puntos: [[31.55, 34.42], [31.42, 34.38], [31.32, 34.30], [31.25, 34.28]] },
    { nombre: "FRENTE LÍBANO — la línea Azul", puntos: [[33.10, 35.35], [33.02, 35.45], [32.92, 35.48], [32.80, 35.42]] },
  ],
  zonas: [
    { bando: "A", nombre: "Israel", polygon: [[33.25, 35.15], [33.30, 35.60], [32.9, 35.7], [32.5, 35.6], [31.9, 35.55], [31.4, 35.2], [31.1, 34.4], [31.3, 34.2], [32.4, 34.5], [33.05, 34.9], [33.15, 35.0]] },
    { bando: "B", nombre: "Hamás / Hezbolá", polygon: [[31.60, 34.55], [31.60, 34.20], [31.20, 34.15], [31.05, 34.35], [31.20, 34.60], [31.45, 34.65]] },
  ],
  hitos: [
    { fecha: "7 OCT 2023", evento: "La invasión de Hamás: 1.200 muertos y 251 rehenes — la mayor masacre judía desde el Holocausto" },
    { fecha: "OCT 2023+", evento: "Operación Espadas de Hierro: la guerra urbana más documentada de la historia" },
    { fecha: "NOV 2023", evento: "Primera tregua de rehenes: 105 liberados en una semana" },
    { fecha: "ABR 2024", evento: "Irán lanza 300+ proyectiles contra Israel desde su propio suelo: primera vez directa" },
    { fecha: "SEP-OCT 2024", evento: "Buscas de Hezbolá y muerte de Nasrallah: el Líbano entra al frente" },
    { fecha: "OCT 2024", evento: "El segundo intercambio Irán-Israel: aviones y defensas en abierto" },
    { fecha: "2025", evento: "Treguas por fases, tablero roto y la reconstrucción como nueva guerra" },
  ],
  apuestas: [
    { escenario: "Acuerdo de rehenes + alto el fuego por fases", cuota: "1.8x" },
    { escenario: "Alto el fuego permanente con gobierno no-Hamás", cuota: "2.2x" },
    { escenario: "Nueva escalada directa con Irán", cuota: "3.5x" },
    { escenario: "Normalización Israel–Arabia Saudí", cuota: "4.2x" },
  ],
  keywords: ["gaza", "israel", "hamas", "hezbollah", "iran", "hostages", "west bank", "tehran", "red sea"],
  fuente: "OCHA (cifras humanitarias), ACLED, IDF, prensa internacional verificada",
};

// ────────────────────────────────────────────────────────────
// TEATRO 03 — SUDÁN: la mayor crisis humana y la menos mirada
// ────────────────────────────────────────────────────────────
const SUDAN: GuerraActiva = {
  id: "sudan", num: 3,
  nombre: "SUDÁN — LA GUERRA SILENCIOSA",
  subtitulo: "Dos generales, una capital en ruinas y la mayor crisis de desplazados del planeta",
  activa: true,
  desde: "15 de abril de 2023",
  intensidad: 78, escalada: 4, terreno: "desierto",
  lat: 14.5, lng: 30.0,
  bbox: { minLat: 8.5, maxLat: 23.0, minLng: 21.5, maxLng: 39.0 },
  bandoA: { nombre: "Ejército (SAF) + aliados", bandera: "🇸🇩", efectivos: 130, tanques: 300, artilleria: 500, aeronaves: 60, apoyos: "Egipto, Irán (drones), Rusia (ambos, según el día)" },
  bandoB: { nombre: "Fuerzas de Apoyo Rápido (RSF)", bandera: " ⚫", efectivos: 100, tanques: 150, artilleria: 300, aeronaves: 10, apoyos: "Emiratos (armas vía Chad), mercenarios rusos" },
  resumen:
    "La guerra que ningún telediario abre pero que desplaza a más gente que ninguna otra: doce " +
    "millones de personas en marcha. Nació de una traición programada — dos generales que debían " +
    "fusionar sus ejércitos para abrir la democracia y prefirieron dispararse en la misma capital — " +
    "y se ha vuelto una guerra de dos velocidades: urbana y feroz en Jartum, étnica y sin testigos " +
    "en el Darfur, donde la región de El Fasher resiste su último asedio. Detrás, el oro del Sudán " +
    "y el mar Rojo de por medio; delante, una hambruna declarada que la ONU ya no puede ni medir.",
  actores: ["Egipto", "Emiratos", "Irán", "Rusia (Africa Corps)", "Chad (refugiados)", "IGAD (mediación)"],
  riesgoGlobal: "HAMBRUNA DECLARADA + MAR ROJO (Puerto Sudán) + ORO — la crisis más grande sin resolución a la vista",
  bajas: {
    texto: "28.000+ muertos confirmados por nombre (subestimación ampliamente reconocida); estimaciones independientes hablan de ~150.000",
    nota: "El sistema de registro colapsó: Masalit en Geneina, médicos sin morgues, estados sin certificados",
  },
  desplazados: "≈ 12M de personas desplazadas — la mayor crisis de desplazamiento del mundo (OCHA)",
  ciudades: [
    { nombre: "Jartum", lat: 15.55, lng: 32.53, estado: "frente", nota: "la capital partida en mil pedazos: SAF al norte, RSF al sur" },
    { nombre: "Omdurmán", lat: 15.65, lng: 32.48, estado: "frente", nota: "cambio de manos barrio a barrio (2024-25)" },
    { nombre: "Bahri", lat: 15.64, lng: 32.59, estado: "frente", nota: "la tercera ciudad del triángulo capitalino" },
    { nombre: "El Fasher", lat: 13.63, lng: 25.35, estado: "sitio", nota: "el último bastión del ejército en Darfur, cercado" },
    { nombre: "Nyala", lat: 12.05, lng: 24.88, estado: "ocupada", nota: "capital logística de la RSF en Darfur del Sur" },
    { nombre: "Geneina", lat: 13.45, lng: 22.45, estado: "ocupada", nota: "la limpieza étnica masalit de 2023" },
    { nombre: "Puerto Sudán", lat: 19.62, lng: 37.22, estado: "capital", nota: "capital de facto: el gobierno, los bancos y los barcos" },
    { nombre: "Kosti", lat: 13.16, lng: 32.67, estado: "contendida", nota: "la llave del Nilo Blanco y del trigo" },
  ],
  frentes: [
    { nombre: "FRENTE JARTUM — el triángulo", puntos: [[15.62, 32.44], [15.55, 32.55], [15.48, 32.60]] },
    { nombre: "FRENTE DARFUR — el cerco de El Fasher", puntos: [[13.72, 25.28], [13.60, 25.20], [13.55, 25.42], [13.68, 25.48]] },
  ],
  zonas: [
    { bando: "A", nombre: "Control SAF", polygon: [[22.0, 32.0], [22.0, 38.5], [19.6, 38.5], [17.0, 36.0], [15.6, 33.0], [14.0, 32.5], [12.5, 33.5], [10.5, 33.0], [9.0, 31.5], [10.0, 24.5], [14.0, 24.0], [16.5, 26.0], [19.0, 30.5]] },
    { bando: "B", nombre: "Control RSF", polygon: [[16.5, 26.0], [14.0, 24.0], [10.0, 24.5], [9.0, 31.5], [9.5, 24.0], [12.0, 21.8], [15.0, 22.0], [16.5, 23.5]] },
  ],
  hitos: [
    { fecha: "15 ABR 2023", evento: "Los dos generales se vuelcan: la guerra empieza en la base de Merowe y en Jartum" },
    { fecha: "JUN 2023", evento: "Masacre de Geneina: la limpieza étnica masalit que ninguna corte mira todavía" },
    { fecha: "AGO 2023", evento: "ACNUR cruza los 4M de desplazados — el contador no se detiene más" },
    { fecha: "DIC 2023", evento: "La RSF toma Wad Madani: el centro agrícola cae sin un tiro mayor" },
    { fecha: "AGO 2024", evento: "Hambruna declarada en el campo de Zamzam (Darfur del Norte)" },
    { fecha: "2025", evento: "El ejército recupera el palacio presidencial y buena parte de Jartum; el Darfur sigue ardiendo" },
  ],
  apuestas: [
    { escenario: "Guerra de desgaste prolongada", cuota: "2.0x" },
    { escenario: "El SAF recupera la capital por completo", cuota: "2.4x" },
    { escenario: "Partición de facto del país en dos gobiernos", cuota: "3.6x" },
    { escenario: "Acuerdo de paz con ambos generales dentro", cuota: "5.5x" },
  ],
  keywords: ["sudan", "rsf", "rapid support", "darfur", "khartoum", "el fasher"],
  fuente: "OCHA, ACLED, ACNUR, Comité Hamidiya, registros de hospitales de guerra",
};

// ────────────────────────────────────────────────────────────
// TEATRO 04 — SAHEL: la insurgencia que descalabra tres países
// ────────────────────────────────────────────────────────────
const SAHEL: GuerraActiva = {
  id: "sahel", num: 4,
  nombre: "SAHEL — LA FRONTERA ROTA",
  subtitulo: "Mali, Burkina Faso y Níger contra la insurgencia más letal del mundo por kilómetro",
  activa: true,
  desde: "2012 (Mali) — 2015 (Burkina/Níger)",
  intensidad: 68, escalada: 3, terreno: "sabana",
  lat: 14.5, lng: -2.0,
  bbox: { minLat: 9.0, maxLat: 19.5, minLng: -12.5, maxLng: 8.0 },
  bandoA: { nombre: "Juntas del Sahel", bandera: "🇲🇱", efectivos: 80, tanques: 100, artilleria: 250, aeronaves: 40, apoyos: "Rusia (Africa Corps, ex-Wagner), Turquía (drones)" },
  bandoB: { nombre: "JNIM + EIGS (yihadistas)", bandera: "⚫", efectivos: 40, tanques: 0, artilleria: 120, aeronaves: 0, apoyos: "redes AQMI/Estado Islámico, contrabando y secuestros" },
  resumen:
    "La insurgencia más letal del planeta en 2024-2025 por bajas anuales, y la más invisible: " +
    "empieza en 2012 en el norte de Mali y se desborda como un incendio de sabana por Burkina Faso " +
    "y Níger. Tres gobiernos civiles cayeron a manos militares prometiendo seguridad y entregando " +
    "lo contrario; los franceses se fueron, los rusos entraron, y las carreteras del norte quedaron " +
    "en manos de grupos que cobran peaje a la vida diaria. Aquí la guerra no se mide en frentes " +
    "sino en emboscadas, pueblos cercados y escuelas cerradas: dos millones de niños sin clase.",
  actores: ["Rusia (Africa Corps)", "Argelia (mediador)", "CEDEAO", "Turquía", "Francia (salida 2022)"],
  riesgoGlobal: "MIGRACIÓN + URANIO (Níger) + MEDIOS DE VIDA — el Sahel es la puerta del sur de Europa",
  bajas: {
    texto: "2024-25: los años más letales — decenas de miles de muertos por año entre combates y masacres civiles (ACLED)",
    nota: "Media de episodios de violencia diaria: ~15; los ataques a pueblos no llegan a la portada de nadie",
  },
  desplazados: "≈ 3.4M de desplazados internos entre los tres países (OCHA)",
  ciudades: [
    { nombre: "Bamako", lat: 12.65, lng: -8.00, estado: "capital", nota: "la capital maliense, rodeada por el sur" },
    { nombre: "Uagadugú", lat: 12.37, lng: -1.53, estado: "capital", nota: "Burkina: el país con más del 40% fuera de control estatal" },
    { nombre: "Niamey", lat: 13.51, lng: 2.11, estado: "capital", nota: "Níger: uranio, frontera y golpes" },
    { nombre: "Tombuctú", lat: 16.77, lng: -3.00, estado: "contendida", nota: "la leyenda bajo bloqueo: la JNIM corta el combustible" },
    { nombre: "Gao", lat: 16.27, lng: -0.04, estado: "contendida", nota: "cruce de rutas y de ejércitos privados" },
    { nombre: "Mopti", lat: 14.49, lng: -4.19, estado: "frente", nota: "el delta interior: milicia, pez y yihad" },
    { nombre: "Dori", lat: 14.03, lng: -0.03, estado: "frente", nota: "la frontera tripaís: el epicentro de las masacres" },
    { nombre: "Diffa", lat: 13.32, lng: 12.62, estado: "contendida", nota: "el lago Chad: el otro frente yihadista" },
  ],
  frentes: [
    { nombre: "EJE TRIPOÍS — Mali-Burkina-Níger", puntos: [[16.0, -1.2], [15.2, -1.0], [14.4, -0.5], [14.0, 0.0], [13.5, 1.0]] },
    { nombre: "EJE MALI CENTRO — el delta", puntos: [[16.5, -3.2], [15.5, -4.0], [14.6, -4.2]] },
  ],
  zonas: [
    { bando: "A", nombre: "Zonas bajo control estatal", polygon: [[19.0, -4.5], [19.0, 4.0], [16.0, 6.0], [13.5, 5.0], [11.0, 3.0], [10.0, -1.0], [11.5, -6.0], [14.5, -8.5], [17.0, -6.0]] },
    { bando: "B", nombre: "Zonas insurgentes", polygon: [[16.0, -5.5], [16.5, 1.0], [14.5, 2.0], [13.0, 0.5], [12.5, -2.5], [13.5, -5.5], [15.0, -6.5]] },
  ],
  hitos: [
    { fecha: "2012", evento: "La rebelión tuareg y el golpe en Bamako: el norte de Mali se pierde" },
    { fecha: "2013", evento: "Operación Serval: Francia empuja a los yihadistas, nadie los vence" },
    { fecha: "2015", evento: "Burkina Faso entra en la guerra: los ataques llegan a la capital" },
    { fecha: "2020-2022", evento: "Tres golpes de Estado: Bamako, Uagadugú y Niamey cambian de dueño prometiendo victoria" },
    { fecha: "2022", evento: "Francia se retira; Wagner entra; Moura escribe el capítulo más oscuro del año" },
    { fecha: "2023", evento: "Níger expulsa a EE. UU. y Francia: la base aérea 201 cambia de manos" },
    { fecha: "2024-25", evento: "La JNIM bloquea Tombuctú y Bamako teme por sus carreteras: el asedio de las capitales" },
  ],
  apuestas: [
    { escenario: "Desgaste continuo sin cambio de mapa", cuota: "1.7x" },
    { escenario: "Cae una de las tres capitales bajo amenaza directa", cuota: "3.2x" },
    { escenario: "Acuerdo de paz parcial con la JNIM", cuota: "4.5x" },
    { escenario: "Intervención regional decisiva (CEDEAO/Africa Corps)", cuota: "5.0x" },
  ],
  keywords: ["sahel", "mali", "burkina faso", "niger", "jnim", "jihadist", "wagner"],
  fuente: "ACLED (violencia armada), OCHA, informes del Panel de la ONU para el Sahel",
};

// ────────────────────────────────────────────────────────────
// TEATRO 05 — MYANMAR: la guerra civil después del golpe
// ────────────────────────────────────────────────────────────
const MYANMAR: GuerraActiva = {
  id: "myanmar", num: 5,
  nombre: "MYANMAR — EL PAÍS QUE PELEA EN SILENCIO",
  subtitulo: "La junta contra las milicias étnicas y el pueblo en armas: el ejército pierde el mapa",
  activa: true,
  desde: "1 de febrero de 2021",
  intensidad: 62, escalada: 3, terreno: "selva",
  lat: 19.5, lng: 96.5,
  bbox: { minLat: 9.5, maxLat: 28.5, minLng: 92.0, maxLng: 101.5 },
  bandoA: { nombre: "Resistencia (PDFs + étnicas)", bandera: "🇲🇲", efectivos: 90, tanques: 20, artilleria: 150, aeronaves: 5, apoyos: " armas artesanales, diáspora, China (pragmática)" },
  bandoB: { nombre: "Junta militar (Tatmadaw)", bandera: "⚫", efectivos: 150, tanques: 250, artilleria: 400, aeronaves: 90, apoyos: "Rusia (aviones), China (armas y facsímil de legitimidad)" },
  resumen:
    "La guerra civil más subestimada del mundo: un ejército que hace cuatro años controlaba el " +
    "país entero hoy manda sobre menos de la mitad del mapa. La Operación 1027 (octubre de 2023) " +
    "fue su tercera guerra de independencia simultánea — etnias coordinadas con guerrillas urbanas " +
    "de la generación Facebook — y desde entonces la junta pierde ciudades fronterizas, bases, " +
    "conscripciones y dignidad. Pelea con aviones contra aldeas y pierde de todos modos: aquí la " +
    "guerra se construye a pie, en la selva, con drones impresos en 3D y motores que sueldan rifles.",
  actores: ["China (todos los bandos)", "Rusia (armas)", "ASEAN (plan que no arranca)", "India (frontera)"],
  riesgoGlobal: "ESTUFAFES + CRIMEN ORGANIZADO + MAR DE ANDAMÁN — el mayor paraíso criminal del planeta en medio del caos",
  bajas: {
    texto: "70.000+ muertos estimados desde el golpe; 30.000+ arrestos políticos (AAPP)",
    nota: "Las cifras de combate son imposibles de auditar: la junta miente, la resistencia estima",
  },
  desplazados: "≈ 3.5M de desplazados internos (OCHA) — 1 de cada 6 personas del país",
  ciudades: [
    { nombre: "Naipyidó", lat: 19.75, lng: 96.13, estado: "capital", nota: "la capital bunkerizada de la junta" },
    { nombre: "Rangún", lat: 16.87, lng: 96.20, estado: "segura", nota: "el corazón comercial bajo toque de queda" },
    { nombre: "Mandalay", lat: 21.98, lng: 96.08, estado: "contendida", nota: "el norte urbano: reclutamiento forzado y bombardeos" },
    { nombre: "Lashio", lat: 22.94, lng: 97.75, estado: "ocupada", nota: "caída en 2024: la mayor base regional de la junta" },
    { nombre: "Sittwe", lat: 20.15, lng: 92.90, estado: "contendida", nota: "el Arakán: el ejército AA toma el estado entero" },
    { nombre: "Myawaddy", lat: 16.72, lng: 98.50, estado: "contendida", nota: "la frontera de los estufafes y del dinero de todos" },
    { nombre: "Laiza", lat: 24.49, lng: 97.60, estado: "capital", nota: "capital de la KIA: la resistencia que nunca se fue" },
  ],
  frentes: [
    { nombre: "FRENTE NORTE — Operación 1027", puntos: [[23.5, 96.5], [22.9, 97.5], [22.0, 98.5], [21.2, 99.5]] },
    { nombre: "FRENTE ARAKÁN — la costa", puntos: [[21.0, 92.8], [20.2, 93.3], [19.2, 93.8]] },
  ],
  zonas: [
    { bando: "B", nombre: "Control de la junta", polygon: [[21.5, 94.5], [22.5, 96.0], [21.0, 97.0], [19.0, 96.5], [17.0, 96.0], [15.5, 97.5], [14.0, 98.0], [10.5, 98.5], [10.0, 95.0], [15.0, 94.0], [18.5, 94.0]] },
    { bando: "A", nombre: "Zonas de resistencia", polygon: [[23.8, 96.0], [24.8, 97.8], [22.5, 99.5], [20.5, 99.0], [19.5, 97.5], [20.0, 94.5], [21.8, 93.0]] },
  ],
  hitos: [
    { fecha: "1 FEB 2021", evento: "El golpe: el ejército detiene al gobierno elegido y el país sale a la calle" },
    { fecha: "2021+", evento: "Nace la defensa civil (PDFs): el pueblo que aprendió a fabricar armas" },
    { fecha: "OCT 2023", evento: "Operación 1027: la mayor ofensiva coordinada de la historia del país" },
    { fecha: "2024", evento: "Cae Lashio y el comandante regional de la junta se rinde con todo su Estado Mayor" },
    { fecha: "2024+", evento: "Conscripción forzosa: la junta recluta a la fuerza lo que ya no puede comprar" },
    { fecha: "2025", evento: "El terremoto pausa la guerra unas semanas y la selva vuelve a hablar con bombas" },
  ],
  apuestas: [
    { escenario: "Desgaste: la junta resiste en el centro", cuota: "1.9x" },
    { escenario: "Cae Rangún o Naipyidó", cuota: "6.0x" },
    { escenario: "Desintegración en estados de facto", cuota: "2.8x" },
    { escenario: "Transición negociada con la junta dentro", cuota: "4.8x" },
  ],
  keywords: ["myanmar", "arakan", "junta", "rakhine"],
  fuente: "AAPP (presos y muertos), ACLED, OCHA, informes de la Resistencia verificados por prensa",
};

// ────────────────────────────────────────────────────────────
// TEATRO 06 — ESTRECHO DE TAIWÁN: el teatro observado
// ────────────────────────────────────────────────────────────
const TAIWAN: GuerraActiva = {
  id: "taiwan", num: 6,
  nombre: "ESTRECHO DE TAIWÁN — EL TEATRO OBSERVADO",
  subtitulo: "La guerra que no ha empezado y que movería el precio de todo lo que usas",
  activa: false,
  desde: "1949 (la pausa más vigilada del mundo)",
  intensidad: 35, escalada: 2, terreno: "maritimo",
  lat: 24.5, lng: 119.5,
  bbox: { minLat: 19.0, maxLat: 27.5, minLng: 114.0, maxLng: 124.5 },
  bandoA: { nombre: "Taiwán + disuasión aliada", bandera: "🇹🇼", efectivos: 170, tanques: 800, artilleria: 600, aeronaves: 290, apoyos: "EE. UU. (ambigüedad estratégica), Japón (geografía)" },
  bandoB: { nombre: "República Popular China", bandera: "🇨🇳", efectivos: 1200, tanques: 3700, artilleria: 2000, aeronaves: 1900, apoyos: "la segunda marina del mundo y la mayor flota de pesca-armada" },
  resumen:
    "No hay guerra: hay ensayos. China vuela por el ADZ de Taiwán a diario, hace círculos con " +
    "portaaviones por el este de la isla y ensayó el bloqueo con el Ejercicio Conjunto Sword-2024 " +
    "como quien ensaya una obra con vestuario completo. Taiwán entrena reservistas, alarga el " +
    "servicio y compra torpedos; EE. UU. reparte fábricas de drones por Filipinas y pregunta en " +
    "público qué haría cada uno. Aquí la disuasión es el arma: mientras todos muestren músculo, " +
    "nadie dispara. Y el mundo entero vive pegado a esa pauta: el 90% de los chips más avanzados " +
    "se fabrican a 160 kilómetros de este estrecho.",
  actores: ["EE. UU.", "Japón", "Filipinas", "Australia (AUKUS)", "UE (chips)"],
  riesgoGlobal: "SEMICONDUCTORES + CADENAS GLOBALES + NUCLEAR — el teatro donde la paz es la que cuesta dinero",
  bajas: {
    texto: "Sin bajas de guerra — sí: cientos de incursiones aéreas mensuales, cortes de cables marinos y muertes de pescadores en el mar",
    nota: "La escala de violencia más alta SIN guerra activa que exista en el planeta",
  },
  desplazados: "Sin desplazados — el teatro se mide en barcos y en líneas de producción, no en campamentos",
  ciudades: [
    { nombre: "Taipéi", lat: 25.03, lng: 121.56, estado: "capital", nota: "la isla que fabrica el silicio del mundo" },
    { nombre: "Kinmen", lat: 24.44, lng: 118.32, estado: "observada", nota: "a 3 km de China: la primera pieza del tablero" },
    { nombre: "Xiamen", lat: 24.48, lng: 118.09, estado: "segura", nota: "desde aquí se ve Taiwán a simple vista" },
    { nombre: "Fuzhou", lat: 26.07, lng: 119.30, estado: "segura", nota: "el distrito militar que miraría la primera hora" },
    { nombre: "Hualien", lat: 23.98, lng: 121.60, estado: "segura", nota: "la costa este: donde los submarinos respiran" },
    { nombre: "Hsinchu", lat: 24.81, lng: 120.97, estado: "capital", nota: "el Silicon Valley de la isla: TSMC y los 3 nm" },
    { nombre: "Manila", lat: 14.60, lng: 120.98, estado: "capital", nota: "el pivote sur: bases estadounidenses nuevas" },
  ],
  frentes: [
    { nombre: "LÍNEA MEDIA — el centro del estrecho", puntos: [[26.5, 120.8], [25.5, 120.3], [24.5, 119.8], [23.5, 119.2], [22.5, 118.8]] },
  ],
  zonas: [
    { bando: "A", nombre: "Zona de defensa aliada", polygon: [[25.8, 121.8], [25.2, 122.2], [23.8, 121.9], [22.6, 121.2], [21.9, 120.6], [22.4, 120.1], [23.8, 120.3], [25.3, 121.0], [26.0, 121.4]] },
    { bando: "B", nombre: "Zona de ejercicio PLA", polygon: [[26.8, 120.6], [26.5, 122.5], [25.0, 123.5], [23.0, 123.0], [21.5, 121.5], [22.0, 119.5], [24.0, 118.6], [26.0, 119.0]] },
  ],
  hitos: [
    { fecha: "AGO 2022", evento: "Pelosi a Taipéi y el primer bloqueo-ensayo de misiles a ambos lados" },
    { fecha: "2023+", evento: "Los cruces de la línea media dejan de ser noticia: la normalización del ensayo" },
    { fecha: "MAY 2024", evento: "Lai Ching-te asume; China responde con el Ejercicio Conjunto Sword-2024A" },
    { fecha: "OCT 2024", evento: "Sword-2024B: portaaviones por ambos flancos de la isla, 24 horas" },
    { fecha: "2025+", evento: "La carrera de la dronificación: fábricas en Filipinas, enjambres en el estrecho" },
  ],
  apuestas: [
    { escenario: "Status quo con presión creciente", cuota: "1.5x" },
    { escenario: "Ejercicios de bloqueo total (días)", cuota: "2.8x" },
    { escenario: "Quarantine/inspección de barcos", cuota: "3.6x" },
    { escenario: "Apertura de hostilidades abiertas", cuota: "6.5x" },
  ],
  keywords: ["taiwan", "strait", "pla", "chinese military", "tsmc"],
  fuente: "ADZ trackers, notas del Ministerio de Defensa taiwanés, ISW, prensa regional",
};

// ────────────────────────────────────────────────────────────
// COLECCIÓN + HELPERS
// ────────────────────────────────────────────────────────────
export const GUERRAS: GuerraActiva[] = [UCRANIA, ORIENTE, SUDAN, SAHEL, MYANMAR, TAIWAN];

export const COLECCION_GUERRAS = {
  total: GUERRAS.length,                                  // 6 teatros
  activas: GUERRAS.filter((g) => g.activa).length,        // 5 en fuego
  ciudades: GUERRAS.reduce((s, g) => s + g.ciudades.length, 0),
  desplazadosTxt: "≈ 27M de personas en marcha por las guerras de esta sala",
};

export const guerraDe = (id: string): GuerraActiva | undefined =>
  GUERRAS.find((g) => g.id === id);

// pulso real: cables por guerra (título en minúsculas, includes)
export const PULSO_KEYWORDS_GUERRA: Record<string, string[]> = Object.fromEntries(
  GUERRAS.map((g) => [g.id, g.keywords])
);

// color por estado de ciudad (mapa maestro)
export const COLOR_ESTADO: Record<EstadoCiudad, string> = {
  capital: "#D4AF37",
  segura: "#3DDC97",
  contendida: "#FFB02A",
  frente: "#FF4A3A",
  sitio: "#FF2A8A",
  ocupada: "#8A93A6",
  puerto: "#7FE3FF",
  observada: "#6B7A8C",
};

// proyección de una bbox del teatro al espacio del mapa (0..W, 0..H)
export function proyectarTeatro(
  lat: number, lng: number,
  bbox: GuerraActiva["bbox"],
  W: number, H: number,
): { x: number; y: number } {
  const { minLat, maxLat, minLng, maxLng } = bbox;
  const x = ((lng - minLng) / (maxLng - minLng)) * W;
  const y = ((maxLat - lat) / (maxLat - minLat)) * H;
  return { x, y };
}
