// ═══════════════════════════════════════════════════════════════════
// v436.5 · EL ÍNDICE DE MAPAS — todos los mapas de la casa, en una lista
//
// El Dueño: «necesita mapa inteligente con todo absolutamente todo, los mapas
// del mundo dentro de Vanguard, o sea reúne los cien mapas del mundo (…)
// Vanguard Maps infinitos, que entre a Vanguard deja las puertas abiertas».
//
// Aquí no se inventa un mapa que no exista. Esta lista se declara a mano y cada
// línea se puede abrir: es la superficie de mapa REAL, con su ruta, lo que
// responde y quién pinta el dato. Lo que no está, no está porque no lo hay.
//
// Las ocho capas del Centro de Mapas viven en src/lib/mapas-capas.ts (su fuente
// única) y se suman a esta lista al pintarla; no se copian aquí para que no
// puedan contradecirse.
// ═══════════════════════════════════════════════════════════════════

export type Vista = "3D" | "2D" | "2D y 3D" | "capas" | "tablero";

export type MapaDeLaCasa = {
  id: string;
  ruta: string;
  nombre: string;
  /** la pregunta que responde, en palabras del lector */
  pregunta: string;
  vista: Vista;
  /** con qué se pinta: el motor, dicho sin adornos */
  motor: string;
  /** de dónde sale el dato */
  fuente: string;
  /** el módulo de la casa al que pertenece */
  modulo: "La redacción" | "El mundo" | "El saber" | "La casa";
};

export const MAPAS: MapaDeLaCasa[] = [
  {
    id: "indice",
    ruta: "/mapas/indice",
    nombre: "El índice de mapas",
    pregunta: "¿qué mapas hay en la casa, uno por uno?",
    vista: "tablero",
    motor: "la lista de esta misma página: cada línea abre su superficie",
    fuente: "src/lib/mapas/indice.ts — declarada a mano, sin mapas de relleno",
    modulo: "El mundo",
  },
  {
    id: "centro",
    ruta: "/mapas",
    nombre: "El Centro de Mapas",
    pregunta: "¿dónde está cada país y qué mide cada capa del planeta?",
    vista: "capas",
    motor: "globo 3D (globe.gl) + Natural Earth, con ocho capas conmutables",
    fuente: "Banco Mundial, NASA, Natural Earth y el archivo de la casa — cada capa lo declara",
    modulo: "El mundo",
  },
  {
    id: "mundo3d",
    ruta: "/mundo",
    nombre: "El mundo 3D",
    pregunta: "¿dónde se está peleando ahora mismo?",
    vista: "3D",
    motor: "globo 3D con territorios y marcadores vivos",
    fuente: "archivo de cables y teatros del núcleo",
    modulo: "La redacción",
  },
  {
    id: "mundos",
    ruta: "/mundos",
    nombre: "El mapa de los mundos",
    pregunta: "¿dónde queda este país y con quién tiene frontera?",
    vista: "2D",
    motor: "mapa 2D con polígonos y fronteras reales",
    fuente: "Natural Earth 110m + ISO 3166-1",
    modulo: "El mundo",
  },
  {
    id: "ficha-pais",
    ruta: "/mundos/[iso]",
    nombre: "La ficha del país en el mapa",
    pregunta: "¿cómo se ve este país y quiénes son sus vecinos?",
    vista: "2D",
    motor: "el mismo mapa, encuadrado en un país",
    fuente: "Natural Earth + las doce medidas de la ficha",
    modulo: "El mundo",
  },
  {
    id: "atlas",
    ruta: "/atlas",
    nombre: "El atlas",
    pregunta: "¿qué es cada nación, en largo?",
    vista: "2D",
    motor: "atlas con globo y lectura larga por país",
    fuente: "censo de naciones de la casa",
    modulo: "El mundo",
  },
  {
    id: "poder",
    ruta: "/poder",
    nombre: "El poder sobre el mapa",
    pregunta: "¿quién puede hacer la guerra y con cuánto?",
    vista: "2D",
    motor: "la misma geografía pintada por gasto y efectivos",
    fuente: "Banco Mundial (MS.MIL.XPND.CD / MS.MIL.TOTL.P1), con su año",
    modulo: "El mundo",
  },
  {
    id: "divisas",
    ruta: "/divisas",
    nombre: "El mapa de las divisas",
    pregunta: "¿qué vale la moneda de cada país frente al dólar?",
    vista: "2D",
    motor: "mapa temático por tipo de cambio",
    fuente: "open.er-api.com — la captura que declara world-data",
    modulo: "El mundo",
  },
  {
    id: "tierra",
    ruta: "/tierra",
    nombre: "Earth System",
    pregunta: "¿cómo es el planeta por dentro: relieve, ríos, regiones?",
    vista: "2D y 3D",
    motor: "globo y atlas 2D con capas físicas",
    fuente: "NASA Blue Marble, relieve earth-topology, Natural Earth",
    modulo: "El mundo",
  },
  {
    id: "worlds",
    ruta: "/worlds",
    nombre: "Los cinco mundos",
    pregunta: "¿qué hay en cada rincón del planeta?",
    vista: "2D",
    motor: "zonas geográficas reales explorables",
    fuente: "Natural Earth + el registro de países",
    modulo: "El mundo",
  },
  {
    id: "infraestructura",
    ruta: "/infraestructura",
    nombre: "El atlas de infraestructura",
    pregunta: "¿dónde están los puertos, aeropuertos, presas y puentes?",
    vista: "2D",
    motor: "atlas geográfico de obra civil",
    fuente: "el atlas de infraestructura de la casa, con sus nueve campos por obra",
    modulo: "El mundo",
  },
  {
    id: "infra-explorador",
    ruta: "/infraestructura/explorador",
    nombre: "El explorador de infraestructura",
    pregunta: "¿qué hay construido por sistema y no por país?",
    vista: "2D",
    motor: "el mismo atlas por transporte, energía y arquitectura",
    fuente: "el mismo atlas, filtrado por sistema",
    modulo: "El mundo",
  },
  {
    id: "gran-obra",
    ruta: "/infraestructura/gran-obra",
    nombre: "Las grandes obras",
    pregunta: "¿dónde están las obras que cambiaron un territorio?",
    vista: "2D",
    motor: "catálogo georreferenciado de ingeniería civil",
    fuente: "el atlas de infraestructura",
    modulo: "El mundo",
  },
  {
    id: "abandonados",
    ruta: "/abandonados",
    nombre: "Abandoned World",
    pregunta: "¿dónde están las ciudades fantasma y los lugares que el mundo dejó atrás?",
    vista: "2D",
    motor: "atlas georreferenciado de lugares abandonados documentados",
    fuente: "Wikipedia y fuentes citadas en cada ficha; fotos de Wikimedia Commons",
    modulo: "El mundo",
  },
  {
    id: "lingua-mapa",
    ruta: "/lingua/mapa",
    nombre: "El mapa de las lenguas",
    pregunta: "¿qué se habla en cada punto del planeta?",
    vista: "2D",
    motor: "mapa mundial de lenguas por familia o por amenaza",
    fuente: "Glottolog 5.4",
    modulo: "El saber",
  },
  {
    id: "teatro3d",
    ruta: "/teatro-3d",
    nombre: "El teatro 3D",
    pregunta: "¿cómo se ve un frente cuando lo pones en volumen?",
    vista: "2D y 3D",
    motor: "simulador 2D/3D de frentes, escuadrones y armas",
    fuente: "el teatro documentado de la casa",
    modulo: "El saber",
  },
  {
    id: "zona-cero",
    ruta: "/zona-cero",
    nombre: "Zona Cero",
    pregunta: "¿qué se ve desde el ojo de la casa?",
    vista: "3D",
    motor: "teatro global 3D con el buscador único encima",
    fuente: "archivo y buscador de la casa",
    modulo: "El saber",
  },
  {
    id: "escenarios",
    ruta: "/escenarios",
    nombre: "El estratega",
    pregunta: "¿qué pasaría si la presión subiera un peldaño?",
    vista: "tablero",
    motor: "escenarios de presión por teatro — nunca predicciones",
    fuente: "los modelos de /motores, con sus variables a la vista",
    modulo: "El saber",
  },
  {
    id: "conflictos",
    ruta: "/conflictos",
    nombre: "El tablero de conflictos",
    pregunta: "¿cuántos frentes hay y en qué región?",
    vista: "tablero",
    motor: "tablero por región con nivel e intensidad",
    fuente: "el archivo de cables, medido por región",
    modulo: "La redacción",
  },
  {
    id: "conflicto",
    ruta: "/conflicto",
    nombre: "Las salas del conflicto",
    pregunta: "¿qué teatro tiene su propia sala?",
    vista: "tablero",
    motor: "una entrada por teatro con su archivo",
    fuente: "el registro de teatros del núcleo",
    modulo: "La redacción",
  },
  {
    id: "historia",
    ruta: "/historia",
    nombre: "El archivo de la historia en el mapa",
    pregunta: "¿dónde se pelearon las guerras que explican las de hoy?",
    vista: "2D",
    motor: "los puntos históricos sobre el mismo planeta",
    fuente: "HISTORICAL_WARS con coordenadas reales",
    modulo: "El saber",
  },
  {
    id: "cruce",
    ruta: "/cruce",
    nombre: "El cruce",
    pregunta: "¿a qué distancia de mi casa pasó lo de hoy?",
    vista: "2D",
    motor: "distancias reales calculadas en el aparato",
    fuente: "sismos y alertas del día + tu posición aproximada",
    modulo: "La redacción",
  },
  {
    id: "taller",
    ruta: "/mapas/taller",
    nombre: "El Taller de Mapas",
    pregunta: "¿y si el mapa lo hago yo, con mis puntos y mis fuentes?",
    vista: "2D y 3D",
    motor: "creador propio: puntos, trazos, fichas, exportación",
    fuente: "la que declares tú en cada punto — si no la pones, el taller lo dice",
    modulo: "El mundo",
  },
];

/**
 * Las ocho capas del Centro de Mapas. Copiadas de `CAPAS` en
 * src/lib/mapas-capas.ts (v405.9), que es su fuente única y el sitio donde
 * añadir la novena: si allí cambia un nombre, aquí se corrige. No se importa
 * aquel módulo a propósito — arrastra cuatro fuentes de datos y esta lista es
 * solo un índice de lectura.
 */
export const CAPAS_DEL_CENTRO: { id: string; nombre: string; pregunta: string; fuente: string }[] = [
  { id: "mundial", nombre: "Mapa mundial", pregunta: "¿dónde está cada país y a qué región del planeta pertenece?", fuente: "Natural Earth 110m (polígonos) + ISO 3166-1 vía mledoze/countries" },
  { id: "politico", nombre: "Mapa político", pregunta: "¿qué bloque declara cada país ante el Banco Mundial?", fuente: "Banco Mundial — regiones de sus indicadores" },
  { id: "fisico", nombre: "Mapa físico", pregunta: "¿cómo es el planeta de verdad: mar, hielo y relieve?", fuente: "NASA Blue Marble · NASA Earth at Night · relieve earth-topology" },
  { id: "economico", nombre: "Mapa económico", pregunta: "¿cuánto gasta cada país en sus fuerzas armadas?", fuente: "Banco Mundial · MS.MIL.XPND.CD (US$ corrientes)" },
  { id: "demografico", nombre: "Mapa demográfico", pregunta: "¿cuánta gente tiene cada país en armas?", fuente: "Banco Mundial · MS.MIL.TOTL.P1 (personal en servicio activo)" },
  { id: "tematico", nombre: "Mapa temático · divisas", pregunta: "¿cuántas unidades de su moneda cuesta un dólar?", fuente: "open.er-api.com — la captura que declara world-data.ts" },
  { id: "historico", nombre: "Mapa histórico", pregunta: "¿dónde se pelearon las guerras que fundaron el mundo de hoy?", fuente: "game-data.ts · HISTORICAL_WARS (guerras con coordenadas reales)" },
  { id: "acontecimientos", nombre: "Mapa de acontecimientos", pregunta: "¿qué está pasando ahora mismo y dónde?", fuente: "núcleo · acontecimientos sembrados + teatro 3D documentado" },
];

/** Las seis clases de trazo que el mapa de la casa ya sabe pintar. */
export const CAPAS_TACTICAS: { id: string; nombre: string; queEs: string }[] = [
  { id: "BASE", nombre: "Bases", queEs: "instalaciones militares puntuales" },
  { id: "ENERGIA", nombre: "Energía", queEs: "centrales, oleoductos y gasoductos" },
  { id: "EXCLUSION", nombre: "Zonas de exclusión", queEs: "áreas que un Estado cierra" },
  { id: "BLOQUEO", nombre: "Bloqueos", queEs: "cierres de paso marítimo o aéreo" },
  { id: "POBLACION", nombre: "Población", queEs: "manchas de densidad" },
  { id: "SUMINISTRO", nombre: "Suministro", queEs: "rutas de abastecimiento" },
];

export const TOTAL_SUPERFICIES = MAPAS.length + CAPAS_DEL_CENTRO.length + CAPAS_TACTICAS.length;
